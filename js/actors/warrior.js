// Aldren — herói espadachim. Resistente, forte de perto, protege a parceira.
// 1: golpe rápido (segurar = golpe pesado) | 2: escudo (no início = aparar)
// 3: investida / interagir / agarrar caixote / segurar inimigo atordoado
// 4: provocar (inimigos focam nele) | 1+2: especial "Corte do Herói"
(function () {
  const U = G.U, P = G.Pixel, TS = G.TILE;

  class Warrior extends G.Character {
    constructor(o) {
      super(Object.assign({ key: 'aldren', index: 1 }, o));
      this.combo = 0; this.comboT = 0; this.queued = false;
      this.atkHit = null;
      this.blocking = false; this.blockT = 0;
      this.grabbed = null; this.grabDir = null;
      this.restrained = null;
      this.dashV = null;
      this.chargeT = 0; this.heavyReady = false;
      this.tauntT = 0;
      this.slashFx = null;
    }

    cancelActions(g) {
      if (this.carrying) { const li = this.carrying; this.carrying = null; if (li.carried) li.hopOff(g); }
      this.blocking = false;
      this.grabbed = null;
      if (this.restrained) { this.restrained.held = false; this.restrained = null; }
      this.chargeT = 0; this.heavyReady = false;
    }

    updateState(dt, g, inp) {
      this.comboT = Math.max(0, this.comboT - dt);
      this.counterT = Math.max(0, (this.counterT || 0) - dt);
      if (this.slashFx) { this.slashFx.t += dt; if (this.slashFx.t > this.slashFx.dur) this.slashFx = null; }
      this.tauntT = Math.max(0, this.tauntT - dt);
      this.blocking = this.state === 'block';
      const s = this.state;
      if (s === 'normal') return this.stNormal(dt, g, inp);
      if (s === 'attack') return this.stAttack(dt, g, inp);
      if (s === 'heavyCharge') return this.stHeavyCharge(dt, g, inp);
      if (s === 'heavy') return this.stHeavy(dt, g, inp);
      if (s === 'block') return this.stBlock(dt, g, inp);
      if (s === 'dash') return this.stDash(dt, g, inp);
      if (s === 'grab') return this.stGrab(dt, g, inp);
      if (s === 'restrain') return this.stRestrain(dt, g, inp);
      if (s === 'special') return this.stSpecial(dt, g, inp);
      if (s === 'carry') return this.stCarry(dt, g, inp);
      if (s === 'stagger') { if (this.stateT > 0.6) this.state = 'normal'; return; }
      this.state = 'normal';
    }

    trySpecial(g, inp) {
      if (this.special < 100) return false;
      if ((inp.attack.pressed && inp.skill.down) || (inp.skill.pressed && inp.attack.down)) {
        this.special = 0;
        this.state = 'special'; this.stateT = 0; this.spinHits = new Set(); this._spinTick = 0;
        g.onSpecial(this);
        G.Audio.sfx('special');
        g.camera.shake(3, 0.5);
        return true;
      }
      return false;
    }

    stNormal(dt, g, inp) {
      this.walk(dt, g, inp);
      if (this.trySpecial(g, inp)) return;
      if (inp.swap.pressed) this.taunt(g);
      if (inp.act.pressed) {
        // segurar inimigo atordoado
        const stunned = this.findStunned(g);
        if (stunned) { this.startRestrain(stunned, g); return; }
        const t = this.findInteract(g);
        if (t) { t.interact(this, g); return; }
        const pt = this.partner(g);
        if (pt && pt.state === 'down' && U.dist(this.x, this.y, pt.x, pt.y) < 24) return;
        if (this.canLift(g)) { this.lift(g); return; }
        this.dash(g, inp);
        return;
      }
      if (inp.attack.pressed) { this.startAttack(g); return; }
      if (inp.skill.down) { this.state = 'block'; this.stateT = 0; this.blockT = 0; this.blocking = true; }
    }

    // ------------------------------------------------ espada
    startAttack(g) {
      if (this.comboT <= 0) this.combo = 0;
      this.combo = (this.combo % 3) + 1;
      this.state = 'attack'; this.stateT = 0;
      this.atkHit = new Set();
      this.queued = false;
      const fast = g.has('lamina_veloz') ? 0.82 : 1;
      this.atkDur = (this.combo === 3 ? 0.3 : 0.22) * fast;
      this.slashFx = { t: 0, dur: this.atkDur, ang: Math.atan2(this.fy, this.fx), big: this.combo === 3, rev: this.combo === 2 };
      G.Audio.sfx('swing');
      // passo à frente
      this.kvx = this.fx * 70; this.kvy = this.fy * 70;
    }
    attackRect(range, width) {
      const cx = this.x + this.fx * range * 0.6, cy = this.y - 9 + this.fy * range * 0.6;
      const w = Math.abs(this.fx) > 0.5 ? range : width, h = Math.abs(this.fy) > 0.5 ? range : width;
      return { x: cx - w / 2, y: cy - h / 2, w, h };
    }
    stAttack(dt, g, inp) {
      this.walk(dt, g, inp, 0.25);
      if (inp.attack.pressed && this.stateT > this.atkDur * 0.35) this.queued = true;
      const t0 = this.atkDur * 0.2, t1 = this.atkDur * 0.65;
      if (this.stateT >= t0 && this.stateT <= t1) {
        const big = this.combo === 3;
        const rect = this.attackRect(big ? 28 : 24, big ? 30 : 24);
        let dmg = g.stat('aldren', 'power') * (big ? 1.5 : 1);
        if (this.counterT > 0) dmg *= 3;
        const hits = G.Combat.hitRect(g, rect, { dmg, kind: 'sword', src: this, physical: true, dir: { x: this.fx, y: this.fy }, kb: big ? 150 : 70 }, this.atkHit);
        if (this.counterT > 0 && hits.some((h) => h.isEnemy)) { this.counterT = 0; g.comboText(this.x, this.y - 36, 'CONTRA-ATAQUE!'); }
        if (hits.some((h) => h.isEnemy)) { g.hitstop(big ? 0.06 : 0.035); g.camera.shake(big ? 2 : 1, 0.1); }
      }
      if (this.stateT >= this.atkDur) {
        this.comboT = 0.4;
        if (this.queued && this.combo < 3) { this.startAttack(g); return; }
        if (inp.attack.down) { this.state = 'heavyCharge'; this.stateT = 0; this.chargeT = 0; this.heavyReady = false; return; }
        this.state = 'normal';
      }
    }
    stHeavyCharge(dt, g, inp) {
      this.walk(dt, g, inp, 0.4);
      if (this.trySpecial(g, inp)) return;
      this.chargeT += dt;
      if (this.chargeT > 0.1 && Math.random() < 0.5) {
        const a = Math.random() * 6.28;
        g.particles.add({ x: this.x + Math.cos(a) * 16, y: this.y - 10 + Math.sin(a) * 10, vx: -Math.cos(a) * 40, vy: -Math.sin(a) * 30, life: 0.3, color: this.heavyReady ? '#ffffff' : '#ffb84a', glow: true });
      }
      if (!this.heavyReady && this.chargeT >= 0.45) { this.heavyReady = true; G.Audio.sfx('chargeReady'); g.particles.ring(this.x, this.y - 10, 2, 14, 0.3, '#ffe680'); }
      if (!inp.attack.down) {
        if (this.heavyReady && this.st >= 20) {
          this.st -= 20;
          this.state = 'heavy'; this.stateT = 0; this.atkHit = new Set();
          this.slashFx = { t: 0, dur: 0.32, ang: Math.atan2(this.fy, this.fx), big: true, heavy: true };
          G.Audio.sfx('heavySwing');
          this.kvx = this.fx * 110; this.kvy = this.fy * 110;
        } else {
          if (this.heavyReady) { this.say('Sem fôlego...', 1.2); }
          this.state = 'normal';
        }
        this.chargeT = 0;
      }
    }
    stHeavy(dt, g, inp) {
      this.moving = false;
      if (this.stateT >= 0.1 && !this._heavyDone) {
        this._heavyDone = true;
        const rect = this.attackRect(32, 34);
        let dmg = g.stat('aldren', 'power') * 2.4;
        if (this.counterT > 0) dmg *= 3;
        const hits = G.Combat.hitRect(g, rect, { dmg, kind: 'heavy', src: this, physical: true, dir: { x: this.fx, y: this.fy }, kb: 200, stun: 2.5 }, this.atkHit);
        if (this.counterT > 0 && hits.some((h) => h.isEnemy)) { this.counterT = 0; g.comboText(this.x, this.y - 36, 'CONTRA-ATAQUE!'); }
        G.Audio.sfx('heavyHit');
        g.camera.shake(hits.length ? 4 : 2, 0.25);
        if (hits.length) g.hitstop(0.08);
        const cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2 + 6;
        g.particles.burst(cx, cy, 14, { colors: ['#b8a888', '#8a7a68', '#ffe680'], speed: 70, life: 0.5, g: 200, up: 40 });
        if (g.has('golpe_sismico')) {
          g.particles.ring(cx, cy, 4, 44, 0.4, '#ffe680', 2);
          G.Combat.hitCircle(g, cx, cy, 44, { dmg: dmg * 0.4, kind: 'heavy', src: this, physical: true, kb: 120, stun: 1.6, dir: { x: this.fx, y: this.fy } }, this.atkHit);
        }
      }
      if (this.stateT >= 0.38) { this.state = 'normal'; this._heavyDone = false; }
    }

    // ------------------------------------------------ escudo
    parryWindow(g) { return g.has('guarda_perfeita') ? 0.3 : 0.22; }
    inParry(g) { return this.state === 'block' && this.blockT < this.parryWindow(g); }
    shieldBox() {
      const cx = this.x + this.fx * 10, cy = this.y - 13 + this.fy * 8;
      const w = Math.abs(this.fx) > 0.5 ? 16 : 26, h = Math.abs(this.fy) > 0.5 ? 18 : 32;
      return { x: cx - w / 2, y: cy - h / 2, w, h };
    }
    stBlock(dt, g, inp) {
      this.blockT += dt;
      // pode girar, mas anda devagar
      let mx = inp.mx || 0, my = inp.my || 0;
      const l = Math.hypot(mx, my);
      this.moving = l > 0.1;
      if (this.moving) {
        this.setDir(mx, my);
        this.tryMove(g, (mx / Math.max(1, l)) * this.baseSpeed() * 0.35 * dt, (my / Math.max(1, l)) * this.baseSpeed() * 0.35 * dt);
      }
      if (this.trySpecial(g, inp)) return;
      if (!inp.skill.down) { this.state = 'normal'; this.blocking = false; }
    }
    facingDot(dir) { return dir ? -(dir.x * this.fx + dir.y * this.fy) : 1; }
    takeHit(hit, g) {
      if (this.state === 'block' && !this.isDown && hit.proj && this.facingDot(hit.dir) > 0.1) {
        // projétil que passou do escudo mas veio de frente: trata como bloqueio/reflexo
        if (this.blockProjectile(hit.proj, g)) return hit.proj.team === 'player' ? 'reflected' : 'blocked';
      }
      if (this.state === 'block' && !this.isDown && this.invuln <= 0) {
        const dot = this.facingDot(hit.dir);
        if (dot > 0.2) {
          if (this.inParry(g)) { this.doParry(hit.src, g); return 'parried'; }
          // bloqueio normal
          this.st -= 10 + hit.dmg * 0.5;
          G.Audio.sfx('block');
          g.particles.burst(this.x + this.fx * 10, this.y - 10 + this.fy * 6, 8, { colors: ['#ffffff', '#ffe680'], speed: 60, life: 0.25 });
          this.kvx = -this.fx * 60; this.kvy = -this.fy * 60;
          if (this.st <= 0) {
            this.st = 0;
            this.state = 'stagger'; this.stateT = 0;
            g.particles.text(this.x, this.y - 30, 'Guarda quebrada!', '#ffb0a0');
            return super.takeHit(Object.assign({}, hit, { dmg: hit.dmg * 0.5 }), g);
          }
          if (!g.flag('tut_block')) { g.setFlag('tut_block', true); }
          return 'blocked';
        }
      }
      return super.takeHit(hit, g);
    }
    doParry(src, g) {
      G.Audio.sfx('parry');
      g.hitstop(0.1);
      g.camera.shake(2, 0.15);
      g.particles.text(this.x, this.y - 32, 'APARADO!', '#ffe680', { big: false });
      g.particles.ring(this.x + this.fx * 10, this.y - 10, 2, 18, 0.3, '#ffffff', 1);
      g.particles.burst(this.x + this.fx * 10, this.y - 10, 14, { colors: ['#ffffff', '#ffe680'], speed: 80, life: 0.35, glow: true });
      if (src && src.onParried) src.onParried(this, g);
      else if (src && src.stun) src.stun(1.6, g);
      this.addSpecial(12);
      if (g.has('guarda_perfeita')) this.heal(4, g);
      if (g.has('contra_ataque')) { this.counterT = 2.5; g.particles.text(this.x, this.y - 42, 'CONTRA-ATAQUE PRONTO', '#ffb84a'); }
      this.blockT = 99;
    }
    blockProjectile(proj, g) {
      // retorna true se o projétil foi tratado
      const fromFront = this.facingDot(U.norm(proj.vx, proj.vy)) > 0.1;
      if (!fromFront) return false;
      const win = this.parryWindow(g) + (proj.bigOrb ? 0.18 : 0);
      if (this.state === 'block' && this.blockT < win) {
        if (g.has('reflexao')) {
          proj.reflect(g, this, proj.bigOrb ? 1 : 2);
          G.Audio.sfx('parry');
          g.particles.text(this.x, this.y - 32, 'REFLETIDO!', '#ffe680');
          g.hitstop(0.08);
          this.blockT = 99;
          this.addSpecial(10);
          return true;
        }
        this.doParry(null, g);
        proj.die(g);
        return true;
      }
      if (proj.bigOrb) {
        proj.die(g);
        super.takeHit({ dmg: proj.dmg * 0.5, dir: U.norm(proj.vx, proj.vy), kb: 120 }, g);
        if (!this._orbHint) { this._orbHint = true; this.say('Preciso aparar no momento exato!', 2.5); }
        return true;
      }
      G.Audio.sfx('block');
      this.st -= 6;
      g.particles.burst(proj.x, proj.y - proj.height, 6, { colors: ['#ffffff', '#ffe680'], speed: 50, life: 0.25 });
      proj.die(g);
      return true;
    }
    // Prisma: magia da Lirien refletida no escudo vira leque de 3 disparos
    prism(proj, g) {
      G.Audio.sfx('crystal');
      const base = Math.atan2(this.fy, this.fx);
      for (const off of [-0.22, 0, 0.22]) {
        const a = base + off;
        g.addEntity(new G.Combat.Projectile({
          x: this.x + this.fx * 12, y: this.y + this.fy * 8, vx: Math.cos(a) * 250, vy: Math.sin(a) * 250,
          team: 'player', owner: this, dmg: proj.dmg * 1.5, kind: 'prism', color: '#ffe680', color2: '#ffffff', life: 0.9, height: 12, r: 3,
        }));
      }
      g.particles.ring(this.x + this.fx * 10, this.y - 10, 2, 14, 0.3, '#ffe680');
      g.comboText(this.x, this.y - 40, 'PRISMA!');
      g.registerCombo('prism');
    }

    // ------------------------------------------------ arremesso (carregar e lançar a Lirien)
    canLift(g) {
      if (!g.has('arremesso')) return false;
      const li = this.partner(g);
      if (!li || li.state !== 'normal' || li.isDown || li.carried) return false;
      const dx = li.x - this.x, dy = li.y - this.y, d = Math.hypot(dx, dy);
      if (d > 20) return false;
      return d < 6 || (dx * this.fx + dy * this.fy) / d > 0.3;
    }
    lift(g) {
      const li = this.partner(g);
      li.cancelActions(g);
      li.state = 'carried'; li.stateT = 0; li.carried = true; li.moving = false;
      this.carrying = li;
      this.state = 'carry'; this.stateT = 0;
      G.Audio.sfx('lift');
      if (!g.flag('tut_carry')) { g.setFlag('tut_carry', true); g.toast('Lirien está nos ombros! Ela ainda pode atacar. Aldren: ' + G.Characters.aldren.keys.act + ' de novo para ARREMESSAR (passa por cima de muros baixos, cercas, água e abismos).', 6); }
    }
    stCarry(dt, g, inp) {
      const li = this.carrying;
      if (!li || !li.carried || li.state !== 'carried') { this.carrying = null; this.state = 'normal'; return; }
      this.walk(dt, g, inp, 0.72);
      li.x = this.x; li.y = this.y + 1; li.z = 17; li.dir = li.dir || this.dir;
      if (this.stateT > 0.15 && inp.act.pressed) { this.throwPartner(g); return; }
      if (inp.skill.pressed) { li.hopOff(g, true); this.state = 'normal'; }
    }
    // procura o ponto de pouso mais distante na direção olhada
    throwTarget(g, li) {
      const n = U.norm(this.fx, this.fy);
      const maxD = g.has('arremesso_forte') ? 112 : 84;
      let best = null;
      for (let d = 8; d <= maxD; d += 4) {
        const nx = this.x + n.x * d, ny = this.y + n.y * d;
        const tx = Math.floor(nx / TS), ty = Math.floor((ny - 4) / TS);
        const td = G.Tiles.def(g.level.tile(tx, ty));
        if (td.tall || td.void) break; // paredes altas, árvores e o fim do mapa param o voo
        let wall = false;
        for (const e of g.solids) {
          if (e.dead || !e.blocksProjectiles || e === li || e.low) continue;
          const b = e.box;
          if (nx > b.x - 2 && nx < b.x + b.w + 2 && ny - 4 > b.y - 6 && ny - 4 < b.y + b.h + 2) { wall = true; break; }
        }
        if (wall) break; // portões, barreiras, casas e caixotes também
        const b = { x: nx - li.w / 2, y: ny - li.h, w: li.w, h: li.h };
        if (!G.Physics.blocked(g, b, li) && !g.level.isHole(tx, Math.floor((ny - 2) / TS))) best = { x: nx, y: ny };
      }
      return best;
    }
    throwPartner(g) {
      const li = this.carrying;
      const to = this.throwTarget(g, li);
      this.carrying = null;
      this.state = 'normal'; this.stateT = 0;
      li.carried = false; li.state = 'normal';
      if (!to) { li.hopOff(g); this.say('Não tem onde ela cair!', 1.4); return; }
      li.z = 17;
      G.Audio.sfx('throw');
      li.startFlight(g, to.x, to.y, 0.5, 34, (gg, who) => {
        const hits = G.Combat.hitCircle(gg, who.x, who.y - 6, 22, { dmg: gg.stat('lirien', 'magic') * (gg.has('arremesso_forte') ? 2.2 : 1.5), kind: 'impact', src: who, magic: true, stun: 1.2, kb: 90, dir: { x: this.fx, y: this.fy } });
        if (hits.some((h) => h.isEnemy)) { gg.comboText(who.x, who.y - 34, 'METEORO!'); gg.registerCombo('meteoro'); gg.camera.shake(3, 0.25); }
        gg.particles.ring(who.x, who.y - 2, 3, 22, 0.35, '#c8a8ff', 2);
      });
      li.z = 17;
    }

    // ------------------------------------------------ investida (e Salto do Herói)
    dash(g, inp) {
      if (this.cooldowns.dash || this.st < 20) return;
      let mx = inp.mx || 0, my = inp.my || 0;
      if (Math.hypot(mx, my) < 0.1) { mx = this.fx; my = this.fy; }
      const n = U.norm(mx, my);
      this.setDir(n.x, n.y);
      if (g.has('salto') && this.tryLeap(g, n)) return;
      this.dashV = { x: n.x * 250, y: n.y * 250 };
      this.state = 'dash'; this.stateT = 0;
      this.invuln = Math.max(this.invuln, 0.22);
      this.st -= 20;
      this.cooldowns.dash = 0.4;
      G.Audio.sfx('dash');
    }
    // Salto do Herói: atravessa vãos curtos (até ~2 tiles) de abismo ou água
    tryLeap(g, n) {
      let gap = false;
      for (let d = 4; d <= 18; d += 2) {
        const tx = Math.floor((this.x + n.x * d) / TS), ty = Math.floor((this.y + n.y * d - 2) / TS);
        if (g.level.isHole(tx, ty)) { gap = true; break; }
      }
      if (!gap) return false;
      for (let d = 20; d <= 58; d += 2) {
        const nx = this.x + n.x * d, ny = this.y + n.y * d;
        const tx = Math.floor(nx / TS), ty = Math.floor((ny - 4) / TS);
        const td = G.Tiles.def(g.level.tile(tx, ty));
        if (td.tall || td.void) return false;
        if (g.solids.some((e) => !e.dead && e.blocksProjectiles && U.pointInRect(nx, ny - 4, e.box))) return false;
        const b = { x: nx - this.w / 2, y: ny - this.h, w: this.w, h: this.h };
        if (!G.Physics.blocked(g, b, this) && !g.level.isHole(tx, Math.floor((ny - 2) / TS))) {
          this.st -= 20; this.cooldowns.dash = 0.6;
          G.Audio.sfx('dash');
          this.startFlight(g, nx, ny, 0.42, 18, () => { g.camera.shake(1.5, 0.15); });
          return true;
        }
      }
      return false;
    }
    stDash(dt, g, inp) {
      this.moving = true;
      this.tryMove(g, this.dashV.x * dt, this.dashV.y * dt);
      if (Math.random() < 0.9) g.particles.add({ x: this.x + U.rand(-3, 3), y: this.y, vy: -10, life: 0.3, color: '#b8a888', back: true });
      this._after = this._after || [];
      if (this.stateT > 0.18) { this.state = 'normal'; this.dashV = null; }
    }

    // ------------------------------------------------ agarrar caixote
    startGrab(crate, g) {
      this.grabbed = crate;
      const dx = crate.x - this.x, dy = (crate.y - 8) - (this.y - 4);
      this.grabDir = Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) };
      this.setDir(this.grabDir.x, this.grabDir.y);
      this.state = 'grab'; this.stateT = 0;
      if (!g.flag('tut_grab')) { g.setFlag('tut_grab', true); g.toast('Segure ' + G.Characters.aldren.keys.act + ' e mova: empurrar ou puxar.', 3.5); }
    }
    stGrab(dt, g, inp) {
      const c = this.grabbed;
      this.moving = false;
      if (!c || c.dead || !inp.act.down) { this.state = 'normal'; this.grabbed = null; return; }
      if (c.moving) {
        // segue o caixote mantendo a distância de quando agarrou
        this.x = c.x + this.grabOff.x; this.y = c.y + this.grabOff.y;
        this.moving = true;
        return;
      }
      this.grabOff = { x: this.x - c.x, y: this.y - c.y };
      const mx = Math.round(inp.mx || 0), my = Math.round(inp.my || 0);
      const along = this.grabDir.x ? mx * this.grabDir.x : my * this.grabDir.y;
      if ((this.grabDir.x && mx) || (this.grabDir.y && my)) {
        this.pushT = (this.pushT || 0) + dt;
        if (this.pushT > 0.12) {
          this.pushT = 0;
          if (along > 0) c.push(this.grabDir.x, this.grabDir.y, g, this);
          else {
            // puxar: Aldren precisa de espaço atrás
            const back = { x: this.x - this.w / 2 - this.grabDir.x * TS, y: this.y - this.h - this.grabDir.y * TS, w: this.w, h: this.h };
            if (!G.Physics.blocked(g, back, this) && c.canMoveTo(-this.grabDir.x, -this.grabDir.y, g, this)) {
              c.push(-this.grabDir.x, -this.grabDir.y, g, this);
            } else if (!this._pullHint) { this._pullHint = true; this.say('Sem espaço para puxar.', 1.4); }
          }
        }
      } else this.pushT = 0;
    }

    // ------------------------------------------------ segurar inimigo
    findStunned(g) {
      for (const e of g.entities) {
        if (!e.isEnemy || e.dead || !(e.stunT > 0) || e.heavyBody) continue;
        const d = U.dist(this.x + this.fx * 8, this.y + this.fy * 6, e.x, e.y);
        if (d < 22) return e;
      }
      return null;
    }
    startRestrain(e, g) {
      this.restrained = e; e.held = true; e.stunT = Math.max(e.stunT, 2.6);
      this.state = 'restrain'; this.stateT = 0;
      this.setDir(e.x - this.x, e.y - this.y);
      G.Audio.sfx('block');
      g.particles.text(e.x, e.y - 30, 'SEGURO!', '#ffe680');
      if (!g.flag('tut_hold')) { g.setFlag('tut_hold', true); g.toast('Inimigo imobilizado! A magia da Lirien causa dano dobrado.', 3.5); }
    }
    stRestrain(dt, g, inp) {
      this.moving = false;
      const e = this.restrained;
      if (!e || e.dead || this.stateT > 2.5 || inp.attack.pressed) {
        if (e) e.held = false;
        this.restrained = null; this.state = 'normal';
        return;
      }
      // mantém o inimigo junto (com colisão: nunca o empurra para dentro de paredes)
      const tx = this.x + this.fx * 12, ty = this.y + this.fy * 8;
      G.Physics.move(g, e, (tx - e.x) * 0.3, (ty - e.y) * 0.3);
    }
    onHurt(g) {
      if (this.state === 'carry' && this.carrying) { this.carrying.hopOff(g); this.carrying = null; this.state = 'normal'; }
      if (this.state === 'restrain' && this.restrained) { this.restrained.held = false; this.restrained = null; this.state = 'normal'; }
      if (this.state === 'grab') { this.state = 'normal'; this.grabbed = null; }
      if (this.state === 'heavyCharge') { this.state = 'normal'; this.chargeT = 0; }
    }

    // ------------------------------------------------ provocar
    taunt(g) {
      if (this.cooldowns.taunt) { if (!this._tauntSay) { this._tauntSay = true; setTimeout(() => (this._tauntSay = false), 1500); } return; }
      this.cooldowns.taunt = 10;
      this.tauntT = 5;
      g.tauntT = 5;
      G.Audio.sfx('taunt');
      this.say(U.pick(G.Lines.taunt), 1.6);
      g.particles.ring(this.x, this.y - 6, 4, 70, 0.6, '#ff8a6a', 2);
    }

    // ------------------------------------------------ especial
    stSpecial(dt, g, inp) {
      this.moving = false;
      this.invuln = Math.max(this.invuln, 0.1);
      this._spinTick += dt;
      const r = 46;
      // puxa inimigos
      for (const e of g.entities) {
        if (!e.isEnemy || e.dead || e.heavyBody) continue;
        const d = U.dist(this.x, this.y, e.x, e.y);
        if (d < 80 && d > 10) { const n = U.norm(this.x - e.x, this.y - e.y); G.Physics.move(g, e, n.x * 90 * dt, n.y * 90 * dt); }
      }
      if (this._spinTick > 0.18) {
        this._spinTick = 0;
        G.Audio.sfx('swing');
        const hits = G.Combat.hitCircle(g, this.x, this.y - 8, r, { dmg: g.stat('aldren', 'power') * 1.4, kind: 'special', src: this, physical: true, kb: 40, stun: 1.6 });
        if (hits.length) g.hitstop(0.03);
      }
      if (Math.random() < 0.9) {
        const a = this.stateT * 18 + Math.random() * 0.5;
        g.particles.add({ x: this.x + Math.cos(a) * r * 0.8, y: this.y - 8 + Math.sin(a) * r * 0.6, life: 0.25, color: U.pick(['#ffe680', '#ffffff', '#ff8a6a']), glow: true, size: 2 });
      }
      this.dir = ['down', 'left', 'up', 'right'][Math.floor(this.stateT * 16) % 4];
      if (this.stateT > 1.0) { this.state = 'normal'; g.particles.ring(this.x, this.y - 6, 4, r, 0.4, '#ffe680', 2); }
    }

    // ------------------------------------------------ desenho
    drawShield(ctx, x, y, g, front) {
      const sx = Math.round(x + this.fx * 9), sy = Math.round(y - 11 + this.fy * 4);
      const parry = this.inParry(g);
      P.circle(ctx, sx, sy, 6, '#3a2a1a');
      P.circle(ctx, sx, sy, 5, '#7a5230');
      P.circle(ctx, sx, sy, 3, '#9aa6b6');
      ctx.fillStyle = '#c84a4a'; ctx.fillRect(sx - 1, sy - 3, 2, 6);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(sx - 3, sy - 3, 1, 1);
      if (parry) { ctx.globalAlpha = 0.6; P.ring(ctx, sx, sy, 8, '#ffffff'); ctx.globalAlpha = 1; }
    }
    drawSword(ctx, x, y, g) {
      const fx = this.slashFx;
      if (fx) {
        const prog = Math.min(1, (fx.t / fx.dur) * 1.6);
        const ang = fx.ang;
        const rad = fx.heavy ? 26 : fx.big ? 22 : 18;
        const col = fx.heavy ? '#ffb84a' : '#c8e0ff';
        G.FX.slash(ctx, x, y - 9, ang, prog, rad, col, fx.big ? 3 : 2, fx.rev);
        // lâmina
        const span = 2.2;
        const a = fx.rev ? ang + span / 2 - prog * span : ang - span / 2 + prog * span;
        const bx = x + Math.cos(a) * 5, by = y - 10 + Math.sin(a) * 4;
        P.line(ctx, bx, by, bx + Math.cos(a) * (rad - 6), by + Math.sin(a) * (rad - 6) * 0.8, '#e8f0ff');
        return;
      }
      if (this.state === 'heavyCharge') {
        const bx = x - this.fx * 4, by = y - 12;
        P.line(ctx, bx, by, bx - this.fx * 8, by - 12, this.heavyReady ? '#ffffff' : '#e8f0ff');
        if (this.heavyReady) { ctx.fillStyle = '#ffe680'; ctx.fillRect(Math.round(bx - this.fx * 8) - 1, Math.round(by - 13), 3, 3); }
      }
    }
    drawBehind(ctx, x, y, g) {
      if (this.state === 'block' && this.dir === 'up') this.drawShield(ctx, x, y, g);
      if (this.dir === 'up' && this.slashFx) this.drawSword(ctx, x, y, g);
      // escudo nas costas
      if (this.state !== 'block' && this.dir === 'down') {
        ctx.fillStyle = '#3a2a1a'; ctx.fillRect(x + 3, y - 18, 5, 8);
        ctx.fillStyle = '#7a5230'; ctx.fillRect(x + 4, y - 17, 3, 6);
      }
    }
    drawFront(ctx, x, y, g) {
      if (this.state === 'block' && this.dir !== 'up') this.drawShield(ctx, x, y, g);
      if (this.dir !== 'up') this.drawSword(ctx, x, y, g);
      if (this.state !== 'block' && this.dir === 'up') {
        P.circle(ctx, x, y - 13, 5, '#3a2a1a'); P.circle(ctx, x, y - 13, 4, '#7a5230'); P.circle(ctx, x, y - 13, 2, '#9aa6b6');
        ctx.fillStyle = '#c84a4a'; ctx.fillRect(x - 1, y - 16, 2, 6);
      }
      if (this.tauntT > 0) {
        ctx.globalAlpha = 0.3 + Math.sin(g.time * 10) * 0.15;
        P.ring(ctx, x, y - 2, 10, '#ff8a6a');
        ctx.globalAlpha = 1;
      }
      // tocha suave (para áreas escuras)
      g.lighting.add(this.x, this.y - 14, 58, 0.75, '#ffb070', 0.08);
    }
  }
  G.Warrior = Warrior;
})();
