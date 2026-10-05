// Lirien — maga elfa. Forte à distância, frágil de perto.
// J: projétil (segurar = magia carregada) | K: magia selecionada | I: troca magia
// L: teleporte curto / interagir | J+K: especial "Tempestade Arcana"
(function () {
  const U = G.U, P = G.Pixel, TS = G.TILE;

  const SPELLS = {
    frost: { name: 'Geada', icon: 'frost', desc: 'Congela inimigos e água ao redor.' },
    tk: { name: 'Telecinese', icon: 'tk', desc: 'Segure: move pedras rúnicas e revela ilusões.' },
    bridge: { name: 'Ponte Etérea', icon: 'bridge', desc: 'Segure: cria uma ponte de luz à frente.' },
    fire: { name: 'Chama Estelar', icon: 'fire', desc: 'Bola de fogo: acende, derrete gelo e queima.' },
    stasis: { name: 'Estase', icon: 'stasis', desc: 'Bolha que desacelera o tempo ao redor.' },
  };

  class Mage extends G.Character {
    constructor(o) {
      super(Object.assign({ key: 'lirien', index: 0 }, o));
      this.chargeT = 0; this.chargeReady = false;
      this.spell = 'frost';
      this.tkTarget = null;
      this.bridgeTiles = []; this.bridgeT = 0; this.bridgeDir = null;
      this.ritual = null;
      this.castAnim = 0;
      this.specialT = 0;
      this.spellFlash = 0;
    }
    static get SPELLS() { return SPELLS; }
    get sortY() { return this.carried ? this.y + 2 : this.y; }

    spells(g) { return g.unlockedSpells.filter((s) => SPELLS[s]); }

    cancelActions(g) {
      if (this.carried) { const al = this.partner(g); if (al && al.carrying === this) al.carrying = null; if (al && al.state === 'carry') al.state = 'normal'; this.carried = false; this.z = 0; }
      this.dropTK(g);
      this.endBridge(g, true);
      if (this.ritual) this.stopRitual(g);
      this.chargeT = 0; this.chargeReady = false;
    }

    updateState(dt, g, inp) {
      this.castAnim = Math.max(0, this.castAnim - dt);
      this.spellFlash = Math.max(0, this.spellFlash - dt);
      const s = this.state;
      if (s === 'normal') return this.stNormal(dt, g, inp);
      if (s === 'charge') return this.stCharge(dt, g, inp);
      if (s === 'cast') { this.walk(dt, g, inp, 0.3); if (this.stateT > 0.22) this.state = 'normal'; return; }
      if (s === 'tk') return this.stTK(dt, g, inp);
      if (s === 'bridge') return this.stBridge(dt, g, inp);
      if (s === 'dodge') { if (this.stateT > 0.16) this.state = 'normal'; return; }
      if (s === 'ritual') return this.stRitual(dt, g, inp);
      if (s === 'special') return this.stSpecial(dt, g, inp);
      if (s === 'carried') return this.stCarried(dt, g, inp);
      this.state = 'normal';
    }

    // ------------------------------------------------ carregada pelo Aldren ("torre viva")
    stCarried(dt, g, inp) {
      this.moving = false;
      const al = this.partner(g);
      if (!al || al.carrying !== this || al.isDown) { this.hopOff(g); return; }
      if (inp.act.pressed) { this.hopOff(g, true); return; }
      if (inp.swap.pressed) {
        const list = this.spells(g); const i = list.indexOf(this.spell);
        this.spell = list[(i + 1) % list.length]; this.spellFlash = 1.2; G.Audio.sfx('ui');
      }
      // mira para onde o Aldren olha (ou para a direção apertada)
      if (Math.hypot(inp.mx || 0, inp.my || 0) > 0.3) this.setDir(inp.mx, inp.my);
      if (inp.attack.pressed) { this.fireBolt(g); this.castAnim = 0.2; }
      if (inp.skill.pressed && (this.spell === 'frost' || this.spell === 'fire' || this.spell === 'stasis')) {
        const st = this.state; this.castSpell(g, inp); this.state = st;
      }
    }
    hopOff(g, voluntary) {
      const al = this.partner(g);
      if (al && al.carrying === this) { al.carrying = null; if (al.state === 'carry') { al.state = 'normal'; al.stateT = 0; } }
      this.carried = false; this.z = 0;
      this.state = 'normal'; this.stateT = 0;
      if (al) { this.x = al.x + al.fx * 10; this.y = al.y + al.fy * 8 + 1; }
      g.unstick(this);
      if (voluntary) G.Audio.sfx('land');
    }

    trySpecial(g, inp) {
      if (this.special < 100) return false;
      if ((inp.attack.pressed && inp.skill.down) || (inp.skill.pressed && inp.attack.down)) {
        this.special = 0;
        this.state = 'special'; this.stateT = 0; this.specialT = 0;
        g.onSpecial(this);
        G.Audio.sfx('special');
        g.camera.shake(3, 0.4);
        g.particles.ring(this.x, this.y - 8, 4, 50, 0.6, '#c8a8ff', 2);
        return true;
      }
      return false;
    }

    stNormal(dt, g, inp) {
      this.walk(dt, g, inp);
      if (this.trySpecial(g, inp)) return;
      if (inp.swap.pressed) {
        const list = this.spells(g);
        const i = list.indexOf(this.spell);
        this.spell = list[(i + 1) % list.length];
        this.spellFlash = 1.2;
        G.Audio.sfx('ui');
      }
      if (inp.act.pressed) {
        const t = this.findInteract(g);
        if (t) { t.interact(this, g); return; }
        const pt = this.partner(g);
        if (pt && pt.state === 'down' && U.dist(this.x, this.y, pt.x, pt.y) < 24) return;
        this.blink(g, inp);
        return;
      }
      if (inp.attack.pressed) { this.state = 'charge'; this.stateT = 0; this.chargeT = 0; this.chargeReady = false; return; }
      if (inp.skill.pressed) this.castSpell(g, inp);
    }

    stCharge(dt, g, inp) {
      this.walk(dt, g, inp, 0.45);
      if (this.trySpecial(g, inp)) { this.chargeT = 0; return; }
      this.chargeT += dt;
      const need = g.has('foco') ? 0.6 : 0.8;
      if (this.chargeT > 0.25) {
        if (!this._chargeSfx) { this._chargeSfx = true; G.Audio.sfx('charge'); }
        const a = Math.random() * 6.28, r = this.chargeReady ? 14 : 20;
        const sx = this.x + this.staffOff().x, sy = this.y - 22;
        if (Math.random() < 0.7) g.particles.add({ x: sx + Math.cos(a) * r, y: sy + Math.sin(a) * r, vx: -Math.cos(a) * r * 3, vy: -Math.sin(a) * r * 3, life: 0.3, color: this.chargeReady ? '#ffffff' : '#c8a8ff', glow: true });
      }
      if (!this.chargeReady && this.chargeT >= need) { this.chargeReady = true; G.Audio.sfx('chargeReady'); g.particles.ring(this.x + this.staffOff().x, this.y - 22, 2, 10, 0.3, '#ffffff'); }
      if (!inp.attack.down) {
        this._chargeSfx = false;
        if (this.chargeReady && this.mp >= 18) { this.mp -= 18; this.fireCharged(g); }
        else this.fireBolt(g);
        this.state = 'cast'; this.stateT = 0; this.castAnim = 0.25;
        this.chargeT = 0; this.chargeReady = false;
      }
    }

    staffOff() {
      return { down: { x: 7, y: 0 }, up: { x: -7, y: 0 }, right: { x: 4, y: 0 }, left: { x: -4, y: 0 } }[this.dir];
    }
    aim(g) {
      // mira assistida: inimigo próximo na direção olhada
      let best = null, bs = 0;
      for (const e of g.entities) {
        if (!e.isEnemy || e.dead || e.intangible) continue;
        const dx = e.x - this.x, dy = (e.y - 8) - (this.y - 8), d = Math.hypot(dx, dy);
        if (d > 170 || d < 1) continue;
        const dot = (dx / d) * this.fx + (dy / d) * this.fy;
        if (dot < 0.86) continue;
        const score = dot * 2 - d / 170;
        if (score > bs) { bs = score; best = e; }
      }
      if (best) return U.norm(best.x - this.x, best.y - this.y);
      return { x: this.fx, y: this.fy };
    }

    fireBolt(g) {
      const a = this.aim(g);
      const mk = (ang) => {
        const dx = Math.cos(ang), dy = Math.sin(ang);
        g.addEntity(new G.Combat.Projectile({
          x: this.x + dx * 6, y: this.y + dy * 4 + 2, vx: dx * 230, vy: dy * 230, team: 'player', owner: this,
          dmg: g.stat('lirien', 'magic'), kind: 'bolt', color: '#8ae8ff', color2: '#ffffff', life: 0.9, height: 12, r: 3, kb: 50, lift: this.z || 0,
        }));
      };
      const base = Math.atan2(a.y, a.x);
      if (g.has('rajada')) { mk(base - 0.12); mk(base + 0.12); } else mk(base);
      G.Audio.sfx('bolt');
    }
    fireCharged(g) {
      const a = this.aim(g);
      g.addEntity(new G.Combat.Projectile({
        x: this.x + a.x * 6, y: this.y + a.y * 4 + 2, vx: a.x * 200, vy: a.y * 200, team: 'player', owner: this,
        dmg: g.stat('lirien', 'magic') * 3.6, kind: 'charged', color: '#c8a8ff', color2: '#ffffff', life: 1.2, height: 12, r: 6,
        pierce: true, size: 3, light: 50, kb: 140,
      }));
      G.Audio.sfx('bigBolt');
      g.camera.shake(1.5, 0.15);
      this.kvx = -a.x * 60; this.kvy = -a.y * 60;
    }

    castSpell(g, inp) {
      if (this.spell === 'frost') {
        if (this.mp < 28) return this.noMana(g);
        this.mp -= 28;
        this.state = 'cast'; this.stateT = 0; this.castAnim = 0.35;
        this.frost(g);
      } else if (this.spell === 'tk') {
        if (this.mp < 5) return this.noMana(g);
        this.state = 'tk'; this.stateT = 0;
        this.tkTarget = this.findTK(g);
        if (this.tkTarget) { this.tkTarget.lift(g); G.Audio.sfx('crystal'); }
      } else if (this.spell === 'fire') {
        if (this.mp < 20) return this.noMana(g);
        this.mp -= 20;
        this.state = 'cast'; this.stateT = 0; this.castAnim = 0.3;
        this.fireball(g);
      } else if (this.spell === 'stasis') {
        if (this.mp < 35) return this.noMana(g);
        this.mp -= 35;
        this.state = 'cast'; this.stateT = 0; this.castAnim = 0.35;
        this.stasis(g);
      } else if (this.spell === 'bridge') {
        if (this.mp < 6) return this.noMana(g);
        this.state = 'bridge'; this.stateT = 0; this.bridgeT = 0;
        this.bridgeDir = U.DIRS[this.dir];
        this.bridgeTiles = [];
        this.bridgeOrigin = { tx: Math.floor(this.x / TS), ty: Math.floor((this.y - 3) / TS) };
      }
    }
    noMana(g) {
      if (!this.cooldowns.nomana) { this.cooldowns.nomana = 1.5; this.say('Sem mana...', 1.2); G.Audio.sfx('immune'); }
    }

    frost(g) {
      const r = g.has('geada_ampla') ? 64 : 46;
      G.Audio.sfx('frost');
      g.particles.ring(this.x, this.y - 4, 4, r, 0.45, '#bfe4f6', 2);
      g.particles.ring(this.x, this.y - 4, 2, r * 0.7, 0.35, '#ffffff', 1);
      for (let i = 0; i < 30; i++) {
        const a = Math.random() * 6.28, d = Math.random() * r;
        g.particles.add({ x: this.x + Math.cos(a) * d, y: this.y - 4 + Math.sin(a) * d * 0.75, vy: -15, life: U.rand(0.4, 0.9), color: U.pick(['#bfe4f6', '#ffffff', '#8ac0e0']), glow: true });
      }
      const freezeT = g.has('geada_ampla') ? 4 : 3;
      G.Combat.hitCircle(g, this.x, this.y - 6, r, { dmg: g.stat('lirien', 'magic') * 1.2, kind: 'frost', src: this, magic: true, freeze: freezeT, kb: 0 });
      // congela a água próxima
      const tr = Math.ceil(r / TS) + 1;
      const cx = Math.floor(this.x / TS), cy = Math.floor((this.y - 4) / TS);
      let froze = 0;
      for (let ty = cy - tr; ty <= cy + tr; ty++) for (let tx = cx - tr; tx <= cx + tr; tx++) {
        if (U.dist(tx * TS + 8, ty * TS + 8, this.x, this.y - 4) <= r + 8) if (g.level.freeze(tx, ty, 9)) froze++;
      }
      if (froze && !g.flag('tut_ice')) { g.setFlag('tut_ice', true); g.toast('O gelo derrete em alguns segundos. Atravessem juntos!', 3.5); }
      g.camera.shake(1.5, 0.2);
    }

    // ------------------------------------------------ Chama Estelar
    fireball(g) {
      const a = this.aim(g);
      const big = g.has('chama_viva');
      g.addEntity(new G.Combat.Projectile({
        x: this.x + a.x * 6, y: this.y + a.y * 4 + 2, vx: a.x * 190, vy: a.y * 190, team: 'player', owner: this,
        dmg: g.stat('lirien', 'magic') * 1.6, kind: 'fire', color: '#ff8a3a', color2: '#ffe680', life: 1.1, height: 12, r: 5,
        size: 3, light: 60, kb: 60, burn: big ? 4.5 : 3, lift: this.z || 0,
      }));
      G.Audio.sfx('fire');
      g.camera.shake(1, 0.1);
    }

    // ------------------------------------------------ Estase (bolha de tempo lento)
    stasis(g) {
      for (const e of g.entities) if (e instanceof G.ObjectTypes.stasis && !e.dead) e.dead = true;
      const d = 34;
      const bx = this.x + this.fx * d, by = this.y + this.fy * d;
      g.addEntity(new G.ObjectTypes.stasis({ x: bx, y: by, r: g.has('estase_longa') ? 62 : 52, life: g.has('estase_longa') ? 6 : 4.5 }));
      G.Audio.sfx('stasis');
      g.particles.ring(bx, by - 6, 4, 50, 0.5, '#c8f0ff', 2);
    }

    // ------------------------------------------------ Telecinese
    findTK(g) {
      let best = null, bd = 124;
      for (const e of g.entities) {
        if (!e.telekinetic || e.dead) continue;
        const d = U.dist(this.x, this.y, e.x, e.y);
        if (d < bd) { bd = d; best = e; }
      }
      return best;
    }
    dropTK(g) {
      if (this.tkTarget) { this.tkTarget.drop(g); this.tkTarget = null; }
    }
    stTK(dt, g, inp) {
      this.moving = false;
      this.mp -= dt * 7;
      // revela ilusões ao redor
      const R = 76;
      for (const e of g.entities) {
        if (e.reveal && !e.revealed && U.dist(this.x, this.y, e.x, e.y - 8) < R) e.reveal(g);
      }
      if (Math.random() < 0.8) {
        const a = Math.random() * 6.28;
        g.particles.add({ x: this.x + Math.cos(a) * R * 0.9, y: this.y - 4 + Math.sin(a) * R * 0.6, vx: -Math.cos(a) * 30, vy: -Math.sin(a) * 20, life: 0.6, color: '#c8a8ff', glow: true });
      }
      const st = this.tkTarget;
      if (st) {
        const mx = inp.mx || 0, my = inp.my || 0;
        const l = Math.hypot(mx, my);
        if (l > 0.1) {
          const sp = 75 * dt;
          let nx = st.x + (mx / Math.max(1, l)) * sp, ny = st.y + (my / Math.max(1, l)) * sp;
          // alcance máximo
          const d = U.dist(this.x, this.y, nx, ny);
          if (d > 120) { const n = U.norm(nx - this.x, ny - this.y); nx = this.x + n.x * 120; ny = this.y + n.y * 120; }
          // pedra flutuante passa sobre água/abismo, mas não por paredes
          const ob = { x: nx - 6, y: ny - 8, w: 12, h: 8 };
          if (!G.Physics.blocked(g, ob, st)) { st.x = nx; st.y = ny; }
        }
        this.setDir(st.x - this.x, st.y - this.y);
        if (Math.random() < 0.5) {
          const t = Math.random();
          g.particles.add({ x: U.lerp(this.x + this.staffOff().x, st.x, t), y: U.lerp(this.y - 22, st.y - 8 - st.z, t), life: 0.2, color: '#c8a8ff', glow: true });
        }
      }
      if (!inp.skill.down || this.mp <= 0) {
        if (this.mp <= 0) this.mp = 0;
        this.dropTK(g);
        this.state = 'normal';
      }
    }

    // ------------------------------------------------ Ponte Etérea
    stBridge(dt, g, inp) {
      this.moving = false;
      this.mp -= dt * 8;
      this.bridgeT += dt;
      const d = this.bridgeDir;
      if (this.bridgeT > 0.07 && this.bridgeTiles.length < 9) {
        this.bridgeT = 0;
        const n = this.bridgeTiles.length + 1;
        const tx = this.bridgeOrigin.tx + d.x * n, ty = this.bridgeOrigin.ty + d.y * n;
        if (g.level.isHole(tx, ty)) {
          g.level.setBridge(tx, ty, true);
          this.bridgeTiles.push([tx, ty]);
          G.Audio.sfx('bridge');
          g.particles.burst(tx * TS + 8, ty * TS + 8, 6, { colors: ['#6ad8ff', '#ffffff'], speed: 30, life: 0.4, glow: true });
        } else if (this.bridgeTiles.length === 0 && n > 1) {
          // nada para construir
        } else if (!this.bridgeTiles.length && !g.level.isHole(tx, ty)) {
          if (!this._noHole) { this._noHole = true; this.say('Aqui não há abismo.', 1.2); }
        }
      }
      for (const [tx, ty] of this.bridgeTiles) g.lighting.add(tx * TS + 8, ty * TS + 8, 22, 0.6, '#6ad8ff', 0.15);
      if (!inp.skill.down || this.mp <= 0) {
        if (this.mp <= 0) this.mp = 0;
        this._noHole = false;
        this.endBridge(g);
        this.state = 'normal';
      }
    }
    endBridge(g, instant) {
      for (const [tx, ty] of this.bridgeTiles) {
        g.level.setBridge(tx, ty, false);
        g.particles.burst(tx * TS + 8, ty * TS + 8, 5, { colors: ['#6ad8ff', '#c8f4ff'], speed: 25, life: 0.5, glow: true });
      }
      this.bridgeTiles = [];
    }

    // ------------------------------------------------ Teleporte (esquiva)
    blink(g, inp) {
      if (this.cooldowns.blink) return;
      let mx = inp.mx || 0, my = inp.my || 0;
      if (Math.hypot(mx, my) < 0.1) { mx = this.fx; my = this.fy; }
      const n = U.norm(mx, my);
      const dist = g.has('passo_etereo') ? 64 : 44;
      const from = { x: this.x, y: this.y };
      // Varre o caminho e para no PRIMEIRO obstáculo: paredes, cercas, rochas,
      // portões, barreiras, caixotes, água e abismos. O teleporte é curto e
      // nunca atravessa nada sólido (antes dava para pular portões e chefes).
      let best = 0;
      const pt = this.partner(g);
      for (let d = 2; d <= dist; d += 2) {
        const nx = this.x + n.x * d, ny = this.y + n.y * d;
        const b = { x: nx - this.w / 2, y: ny - this.h, w: this.w, h: this.h };
        if (G.Physics.blocked(g, b, this)) break;
        const tx = Math.floor(nx / TS), ty = Math.floor((ny - 2) / TS);
        if (g.level.isHole(tx, ty)) break;
        if (pt && !g.noTether && (Math.abs(nx - pt.x) > G.VIEW_W - 40 || Math.abs(ny - pt.y) > G.VIEW_H - 56)) break;
        best = d;
      }
      if (best < 8) { this.cooldowns.blink = 0.2; return; }
      this.x += n.x * best; this.y += n.y * best;
      this.setDir(n.x, n.y);
      this.state = 'dodge'; this.stateT = 0;
      this.invuln = Math.max(this.invuln, g.has('passo_etereo') ? 0.35 : 0.22);
      this.cooldowns.blink = 0.55;
      G.Audio.sfx('blink');
      for (const p of [from, this]) g.particles.burst(p.x, p.y - 10, 12, { colors: ['#c8a8ff', '#ffffff', '#8ae8ff'], speed: 40, life: 0.4, glow: true });
      for (let i = 0; i < 6; i++) { const t = i / 6; g.particles.add({ x: U.lerp(from.x, this.x, t), y: U.lerp(from.y, this.y, t) - 10, life: 0.3, color: '#c8a8ff', glow: true, size: 2 }); }
    }

    // ------------------------------------------------ Ritual (altar)
    startRitual(altar, g) { this.ritual = altar; this.state = 'ritual'; this.stateT = 0; this.setDir(altar.x - this.x, altar.y - this.y); }
    stopRitual(g) { this.ritual = null; if (this.state === 'ritual') this.state = 'normal'; }
    stRitual(dt, g, inp) {
      this.moving = false;
      if (!this.ritual || this.ritual.done) { this.stopRitual(g); return; }
      if (Math.hypot(inp.mx || 0, inp.my || 0) > 0.5 || inp.attack.pressed || inp.act.pressed) this.stopRitual(g);
    }
    onHurt(g) {
      if (this.state === 'ritual') { this.stopRitual(g); this.say('Fui interrompida!', 1.5); }
      if (this.state === 'tk') { this.dropTK(g); this.state = 'normal'; }
      if (this.state === 'bridge') { this.endBridge(g); this.state = 'normal'; }
      if (this.state === 'charge') { this.state = 'normal'; this.chargeT = 0; this.chargeReady = false; }
    }

    // ------------------------------------------------ Especial
    stSpecial(dt, g, inp) {
      this.moving = false;
      this.invuln = Math.max(this.invuln, 0.1);
      this.specialT += dt;
      const shots = g.has('tempestade_maior') ? 24 : 12;
      const fired = Math.floor(this.stateT / (shots > 12 ? 0.05 : 0.09));
      while (this._fired === undefined || this._fired < Math.min(fired, shots)) {
        this._fired = (this._fired || 0) + 1;
        const a = Math.random() * 6.28;
        g.addEntity(new G.Combat.Projectile({
          x: this.x + Math.cos(a) * 10, y: this.y + Math.sin(a) * 6, vx: Math.cos(a) * 120, vy: Math.sin(a) * 120,
          team: 'player', owner: this, dmg: g.stat('lirien', 'magic') * 1.6, kind: 'special', homing: 6, life: 1.6,
          color: '#f2d98c', color2: '#ffffff', height: 14, r: 4, light: 30,
        }));
        G.Audio.sfx('bolt');
      }
      if (this.stateT > shots * (shots > 12 ? 0.05 : 0.09) + 0.2) { this.state = 'normal'; this._fired = undefined; }
    }

    // ------------------------------------------------ desenho
    drawStaff(ctx, x, y, g) {
      const o = this.staffOff();
      const raised = this.castAnim > 0 || this.state === 'tk' || this.state === 'bridge' || this.state === 'ritual' || this.state === 'special' || this.state === 'charge' || this.state === 'carried';
      const sx = x + o.x, top = y - (raised ? 27 : 23), bot = y - (raised ? 6 : 3);
      ctx.fillStyle = '#3a2416'; ctx.fillRect(sx - 1, top, 3, bot - top);
      ctx.fillStyle = '#8a5a32'; ctx.fillRect(sx, top, 1, bot - top);
      // cristal
      const glow = this.state === 'charge' ? (this.chargeReady ? 3 : 2) : raised ? 2 : 1;
      ctx.fillStyle = '#d9b45a'; ctx.fillRect(sx - 2, top - 1, 5, 1);
      ctx.fillStyle = '#2a6a8a'; ctx.fillRect(sx - 1, top - 5, 3, 4);
      ctx.fillStyle = this.chargeReady ? '#ffffff' : '#8ae8ff'; ctx.fillRect(sx, top - 5, 1, 3);
      if (glow > 1) {
        ctx.globalAlpha = 0.5; P.circle(ctx, sx, top - 3, glow + (Math.floor(g.time * 12) % 2), this.chargeReady ? '#ffffff' : '#c8a8ff'); ctx.globalAlpha = 1;
      }
      const lx = this.x + o.x, ly = this.y - (raised ? 30 : 26);
      g.lighting.add(lx, ly, raised ? 80 : 64, 0.95, '#8ae8ff', raised ? 0.2 : 0.1);
    }
    drawBehind(ctx, x, y, g) { if (this.dir === 'left' || this.dir === 'up') this.drawStaff(ctx, x, y, g); }
    drawFront(ctx, x, y, g) {
      if (this.dir === 'right' || this.dir === 'down') this.drawStaff(ctx, x, y, g);
      if (this.state === 'ritual') {
        const t = g.time;
        ctx.globalAlpha = 0.6;
        G.Pixel.ring(ctx, x, y - 2, 12 + Math.round(Math.sin(t * 6) * 2), '#8ae8ff');
        ctx.globalAlpha = 1;
      }
      if (this.state === 'tk') {
        ctx.globalAlpha = 0.35 + Math.sin(g.time * 8) * 0.1;
        G.Pixel.ring(ctx, x, y - 2, 74, '#c8a8ff');
        ctx.globalAlpha = 1;
      }
    }
  }
  G.Mage = Mage;
})();
