// Personagem jogável (base comum de Lirien e Aldren): movimento, vida, energia,
// queda/reviver, interação, coleira de distância e desenho.
(function () {
  const U = G.U, P = G.Pixel;
  const DOWN_TIME = 12;
  const REVIVE_TIME = 1.3;
  const TETHER_X = G.VIEW_W - 40, TETHER_Y = G.VIEW_H - 56;
  const B0 = () => ({ down: false, pressed: false, released: false });
  const BLANK = { mx: 0, my: 0, attack: B0(), skill: B0(), act: B0(), swap: B0() };
  G.BLANK_INPUT = BLANK;

  class Character extends G.Entity {
    constructor(o) {
      super(Object.assign({ w: 8, h: 5, hw: 10, hh: 20 }, o));
      this.isPlayer = true;
      this.index = o.index;                 // 0 = Lirien, 1 = Aldren
      this.key = o.key;                     // 'lirien' | 'aldren'
      this.def = G.Characters[this.key];
      this.kind = this.def.kind;            // 'mage' | 'warrior'
      this.name = this.def.name;
      this.color = this.def.color;
      this.dir = 'down';
      this.fx = 0; this.fy = 1;             // vetor de mira
      this.state = 'normal';
      this.stateT = 0;
      this.animT = 0;
      this.moving = false;
      this.invuln = 0; this.flash = 0; this.hurtT = 0;
      this.kvx = 0; this.kvy = 0;
      this.special = 0;
      this.downT = 0; this.reviveP = 0;
      this.lastSafe = { x: this.x, y: this.y }; this.safeT = 0;
      this.stepT = 0;
      this.input = null;
      this.speedMul = 1;
      this.bubbleText = null;
      this.ai = false;
      this.young = false;
      this.cooldowns = {};
      this.resetStats(null);
    }
    get isDown() { return this.state === 'down' || this.state === 'fall'; }
    get active() { return true; }

    resetStats(g) {
      const st = (name) => (g ? g.stat(this.key, name) : this.def.stats[name]);
      this.maxHp = st('hp'); this.maxMp = st('mp'); this.maxSt = st('st');
      this.hp = this.hp === undefined ? this.maxHp : Math.min(this.hp, this.maxHp);
      this.mp = this.mp === undefined ? this.maxMp : Math.min(this.mp, this.maxMp);
      this.st = this.st === undefined ? this.maxSt : Math.min(this.st, this.maxSt);
    }
    fullHeal(g) {
      this.resetStats(g);
      this.hp = this.maxHp; this.mp = this.maxMp; this.st = this.maxSt;
      if (this.state === 'down') this.revive(g, 1);
    }
    heal(n, g) {
      if (this.isDown) return;
      this.hp = Math.min(this.maxHp, this.hp + n);
      if (g) g.particles.text(this.x, this.y - 28, '+' + Math.round(n), '#7aff8a');
      if (g) g.particles.burst(this.x, this.y - 10, 8, { colors: ['#7aff8a', '#ffffff'], speed: 25, life: 0.6, up: 20, glow: true });
    }
    restore(n) { this.mp = Math.min(this.maxMp, this.mp + n); this.st = Math.min(this.maxSt, this.st + n); }
    addSpecial(n) { const g = G.game; if (g && g.inv && g.inv.has('eco_unido')) n *= 1.5; this.special = Math.min(100, this.special + n); }

    setDir(x, y) {
      if (Math.abs(x) > 0.01 || Math.abs(y) > 0.01) {
        const n = U.norm(x, y);
        this.fx = n.x; this.fy = n.y;
        this.dir = U.dirFromVec(x, y, this.dir);
      }
    }
    partner(g) { return g.players[1 - this.index]; }

    // Movimento com coleira (não dá para abandonar o parceiro fora da tela)
    tryMove(g, dx, dy) {
      const pt = this.partner(g);
      if (pt && !g.noTether) {
        const nx = this.x + dx, ny = this.y + dy;
        if (Math.abs(nx - pt.x) > TETHER_X && Math.abs(nx - pt.x) > Math.abs(this.x - pt.x)) { dx = 0; this.tethered = 0.3; }
        if (Math.abs(ny - pt.y) > TETHER_Y && Math.abs(ny - pt.y) > Math.abs(this.y - pt.y)) { dy = 0; this.tethered = 0.3; }
      }
      return G.Physics.move(g, this, dx, dy);
    }

    baseSpeed() { return this.def.speed; }

    update(dt, g) {
      const inp = this.input || G.Input.p(this.index);
      this.stateT += dt;
      this.animT += dt;
      this.invuln = Math.max(0, this.invuln - dt);
      this.flash = Math.max(0, this.flash - dt);
      this.tethered = Math.max(0, (this.tethered || 0) - dt);
      this.chillT = Math.max(0, (this.chillT || 0) - dt);
      this.speedMul = this.chillT > 0 ? 0.6 : 1;
      for (const k in this.cooldowns) this.cooldowns[k] = Math.max(0, this.cooldowns[k] - dt);
      if (this.bubbleText) { this.bubbleText.t -= dt; if (this.bubbleText.t <= 0) this.bubbleText = null; }

      if (this.state === 'down') { this.updateDown(dt, g); return; }
      if (this.state === 'fall') { this.updateFall(dt, g); return; }
      if (this.state === 'flight') { this.updateFlight(dt, g); return; }
      // preso no gelo (Parada do Tempo): o parceiro quebra segurando interagir
      if (this.frozenSolid > 0) {
        this.frozenSolid -= dt; this.moving = false;
        if (Math.random() < 0.1) g.particles.add({ x: this.x + U.rand(-6, 6), y: this.y - U.rand(4, 20), vy: -6, life: 0.6, color: '#e8faff' });
        if (this.frozenSolid <= 0) this.breakIce(g);
        return;
      }

      // vigia anti-travamento: se algo sólido "nasceu" em cima do personagem
      // (portão fechando, caixote, cena), ele é empurrado para o espaço livre
      if (!g.co.blocking && !this.carried && G.Physics.blocked(g, this.box, this)) {
        this.stuckT = (this.stuckT || 0) + dt;
        if (this.stuckT > 0.15) { g.unstick(this); this.stuckT = 0; }
      } else this.stuckT = 0;

      // regeneração
      this.regen(dt, g);

      // empurrão
      if (Math.abs(this.kvx) + Math.abs(this.kvy) > 1) {
        this.tryMove(g, this.kvx * dt, this.kvy * dt);
        this.kvx *= Math.pow(0.0005, dt); this.kvy *= Math.pow(0.0005, dt);
      } else { this.kvx = 0; this.kvy = 0; }

      const locked = g.inputLocked();
      const ci = locked ? BLANK : inp;
      this.updateState(dt, g, ci);

      // reviver parceiro / quebrar o gelo do parceiro
      const pt = this.partner(g);
      if (!locked && pt && pt.frozenSolid > 0 && this.state === 'normal' && U.dist(this.x, this.y, pt.x, pt.y) < 26 && ci.act && ci.act.down) {
        pt.frozenSolid -= dt * 5;
        if (Math.random() < 0.6) g.particles.add({ x: pt.x + U.rand(-8, 8), y: pt.y - U.rand(2, 18), vy: -20, life: 0.4, color: '#c8f0ff' });
        if (pt.frozenSolid <= 0) pt.breakIce(g);
      }
      if (!locked && pt && pt.state === 'down' && this.state === 'normal' && U.dist(this.x, this.y, pt.x, pt.y) < 24 && ci.act && ci.act.down) {
        const oath = this.kind === 'warrior' && g.has('juramento');
        pt.reviveP += dt * (oath ? 2 : 1);
        if (Math.random() < 0.5) g.particles.add({ x: pt.x + U.rand(-8, 8), y: pt.y - U.rand(0, 10), vy: -20, life: 0.6, color: '#ffe8a0', glow: true });
        if (pt.reviveP >= REVIVE_TIME) pt.revive(g, oath ? 0.75 : 0.45);
      }

      // queda em buracos (gelo derreteu / ponte sumiu / plataforma passou)
      if (!this.flying && this.state !== 'dodge' && !this.carried) {
        const tx = Math.floor(this.x / G.TILE), ty = Math.floor((this.y - 2) / G.TILE);
        if (g.level.isHole(tx, ty)) this.startFall(g);
        else if (!g.level.dynAt(tx, ty)) {
          this.safeT += dt;
          if (this.safeT > 0.25) { this.lastSafe = { x: this.x, y: this.y }; }
        } else this.safeT = 0;
      }

      // passos
      if (this.moving && this.state === 'normal') {
        this.stepT -= dt;
        if (this.stepT <= 0) {
          this.stepT = 0.32;
          G.Audio.sfx('step', { surface: g.level.surfaceAt(this.x, this.y) });
          if (g.level.surfaceAt(this.x, this.y) === 'grass' && Math.random() < 0.3) g.particles.add({ x: this.x + U.rand(-3, 3), y: this.y, vy: -6, life: 0.3, color: '#6a9a4a', back: true });
        }
      }
    }

    regen(dt, g) {
      const busy = this.state !== 'normal';
      this.mp = Math.min(this.maxMp, this.mp + dt * g.stat(this.key, 'mpRegen') * (busy ? 0.4 : 1));
      this.st = Math.min(this.maxSt, this.st + dt * g.stat(this.key, 'stRegen') * (busy ? 0.4 : 1));
    }

    // movimento padrão (com gelo escorregadio: inércia e pouca tração)
    walk(dt, g, inp, mul = 1) {
      let mx = inp.mx || 0, my = inp.my || 0;
      const l = Math.hypot(mx, my);
      if (l > 1) { mx /= l; my /= l; }
      const sp = this.baseSpeed() * mul * this.speedMul;
      const slip = !this.flying && g.level.isSlip(this.x, this.y - 2) && !this.hasGrip(g);
      if (slip) {
        const tvx = l > 0.1 ? mx * sp * 1.1 : 0, tvy = l > 0.1 ? my * sp * 1.1 : 0;
        const k = 1 - Math.exp(-(l > 0.1 ? 2.2 : 0.7) * dt);
        this.svx = U.lerp(this.svx || 0, tvx, k); this.svy = U.lerp(this.svy || 0, tvy, k);
        const r = this.tryMove(g, this.svx * dt, this.svy * dt);
        if (r.hitX) this.svx = 0;
        if (r.hitY) this.svy = 0;
        if (l > 0.1) this.setDir(mx, my);
        this.moving = l > 0.1 || Math.hypot(this.svx, this.svy) > 10;
        if (this.moving && Math.random() < 0.15) g.particles.add({ x: this.x + U.rand(-3, 3), y: this.y, vy: -4, life: 0.3, color: '#e8f8ff', back: true });
        return this.moving;
      }
      this.moving = l > 0.1;
      this.svx = this.moving ? mx * sp : 0; this.svy = this.moving ? my * sp : 0;
      if (this.moving) {
        this.setDir(mx, my);
        this.tryMove(g, mx * sp * dt, my * sp * dt);
      }
      return this.moving;
    }
    hasGrip(g) { const eq = g.inv.equip[this.key] || {}; return eq.acc === 'botas_cravo'; }

    // ---------------------------------------------------- voo (arremesso / salto)
    // Vai de onde está até (tx, ty) num arco, ignorando o chão no caminho.
    startFlight(g, tx, ty, dur, height, onLand) {
      this.cancelActions(g);
      this.flight = { fx: this.x, fy: this.y, tx, ty, dur, height, onLand };
      this.state = 'flight'; this.stateT = 0;
      this.invuln = Math.max(this.invuln, dur + 0.1);
      this.setDir(tx - this.x, ty - this.y);
    }
    updateFlight(dt, g) {
      const f = this.flight;
      if (!f) { this.state = 'normal'; this.z = 0; return; }
      const k = Math.min(1, this.stateT / f.dur);
      this.x = U.lerp(f.fx, f.tx, k); this.y = U.lerp(f.fy, f.ty, k);
      this.z = Math.sin(k * Math.PI) * f.height;
      if (Math.random() < 0.6) g.particles.add({ x: this.x + U.rand(-3, 3), y: this.y - this.z - 8, life: 0.3, color: this.kind === 'mage' ? '#c8a8ff' : '#ffe680', glow: true });
      if (k >= 1) {
        this.z = 0; this.flight = null;
        this.state = 'normal'; this.stateT = 0;
        this.lastSafe = { x: this.x, y: this.y }; this.safeT = 0;
        g.unstick(this);
        G.Audio.sfx('land');
        g.particles.burst(this.x, this.y, 10, { colors: ['#c8c0b0', '#ffffff'], speed: 40, life: 0.4 });
        if (f.onLand) f.onLand(g, this);
      }
    }

    updateState(dt, g, inp) {
      this.walk(dt, g, inp);
    }

    // ---------------------------------------------------- dano
    takeHit(hit, g) {
      if (this.isDown) return 'dodged';
      if (this.invuln > 0 || this.state === 'dodge') return 'dodged';
      if (g.godMode) return 'dodged';
      if (this.frozenSolid > 0) this.breakIce(g);
      let dmg = hit.dmg * (this.def.dmgTaken || 1) * (g.settings.assist ? 0.6 : 1);
      dmg *= g.stat(this.key, 'defense');
      dmg = Math.max(1, Math.round(dmg));
      this.hp -= dmg;
      this.flash = 0.15; this.invuln = 0.9; this.hurtT = 0.25;
      if (hit.chill) { this.chillT = Math.max(this.chillT || 0, hit.chill); }
      if (hit.dir) { this.kvx = hit.dir.x * (hit.kb || 80); this.kvy = hit.dir.y * (hit.kb || 80); }
      g.particles.text(this.x, this.y - 28, dmg, '#ff6a6a');
      g.particles.burst(this.x, this.y - 10, 8, { color: '#ff6a6a', speed: 40, life: 0.4 });
      g.camera.shake(2.5, 0.2);
      g.hitstop(0.04);
      G.Audio.sfx('hurt');
      this.onHurt(g);
      if (this.hp <= 0) this.goDown(g);
      return 'hit';
    }
    onHurt(g) {}

    goDown(g) {
      this.hp = 0; this.frozenSolid = 0;
      this.cancelActions(g);
      this.state = 'down'; this.stateT = 0;
      this.downT = DOWN_TIME * (g.settings.assist ? 1.5 : 1);
      this.reviveP = 0;
      G.Audio.sfx('down');
      g.camera.shake(3, 0.3);
      // Pluma da Fênix: revive sozinho (e conta como "de pé" para o game over)
      if (g.inv.count('pluma') > 0) {
        g.inv.remove('pluma', 1);
        this.plumaPending = true;
        g.stats.downs++;
        g.co.start(function* () {
          yield G.Co.wait(0.8);
          this.plumaPending = false;
          if (this.state !== 'down') return;
          g.toast('A Pluma da Fênix brilhou!', 2.5);
          this.revive(g, 0.5);
        }.bind(this), g, { blocking: false, name: 'pluma' });
        return;
      }
      g.onPlayerDown(this);
    }
    updateDown(dt, g) {
      const pt = this.partner(g);
      // tempo só corre se o parceiro estiver vivo (se os dois caírem, o jogo reage)
      if (!(pt && pt.state === 'down')) this.downT -= dt;
      if (pt && U.dist(this.x, this.y, pt.x, pt.y) > 26) this.reviveP = Math.max(0, this.reviveP - dt * 2);
      if (this.downT <= 0) g.onPlayerLost(this);
    }
    revive(g, frac) {
      this.state = 'normal'; this.stateT = 0;
      this.hp = Math.max(1, Math.round(this.maxHp * frac));
      this.invuln = 1.5; this.reviveP = 0;
      G.Audio.sfx('revive');
      g.particles.ring(this.x, this.y - 6, 4, 26, 0.6, '#ffe8a0', 2);
      g.particles.burst(this.x, this.y - 12, 24, { colors: ['#ffe8a0', '#ffffff'], speed: 50, life: 0.8, glow: true, up: 20 });
      g.onPlayerRevived(this);
    }

    startFall(g) {
      this.cancelActions(g);
      this.state = 'fall'; this.stateT = 0;
      const water = g.level.isWater(Math.floor(this.x / 16), Math.floor((this.y - 2) / 16));
      G.Audio.sfx(water ? 'splash' : 'fall');
      if (water) g.particles.burst(this.x, this.y, 14, { colors: ['#9ad0f0', '#ffffff'], speed: 50, life: 0.5, up: 40, g: 200 });
    }
    updateFall(dt, g) {
      if (this.stateT > 0.6) {
        this.x = this.lastSafe.x; this.y = this.lastSafe.y;
        this.state = 'normal'; this.stateT = 0;
        this.invuln = 1.2;
        this.hp -= 6;
        g.particles.text(this.x, this.y - 28, 6, '#ff6a6a');
        if (this.hp <= 0) this.goDown(g);
      }
    }

    cancelActions(g) {}
    breakIce(g) {
      this.frozenSolid = 0; this.invuln = Math.max(this.invuln, 0.8);
      G.Audio.sfx('shatter');
      g.particles.burst(this.x, this.y - 10, 22, { colors: ['#c8f0ff', '#ffffff', '#8ac0e0'], speed: 70, life: 0.5 });
    }

    // ---------------------------------------------------- interação
    findInteract(g) {
      let best = null, bd = 999;
      const fx = this.x + this.fx * 10, fy = this.y + this.fy * 8 - 3;
      for (const e of g.interactables) {
        if (e.dead || !e.canInteract || !e.canInteract(this, g)) continue;
        const ip = e.interactPoint || e;
        const d = U.dist(fx, fy, ip.x, ip.y - 4);
        const range = (e.interactRange || 20) + (e.kind === 'house' ? 10 : 0);
        if (d < range && d < bd) { bd = d; best = e; }
      }
      return best;
    }

    say(text, t) { this.bubbleText = { text, t: t || 2.5 }; }

    // ---------------------------------------------------- desenho
    spriteSet(g) {
      if (this.young) return G.Sprites.kid;
      if (this.talen) return G.Sprites.talen;
      return g.spriteFor(this.key);
    }
    frame() {
      if (this.state === 'normal' && this.moving) {
        const f = Math.floor(this.animT * 7) % 4;
        return [1, 0, 2, 0][f];
      }
      return 0;
    }
    bob() {
      if (this.state === 'normal' && this.moving) return [1, 0, 1, 0][Math.floor(this.animT * 7) % 4];
      if (this.state === 'normal') return Math.floor(this.animT * 1.6) % 2 === 0 ? 0 : 1;
      return 0;
    }
    drawBehind(ctx, x, y, g) {}
    drawFront(ctx, x, y, g) {}

    draw(ctx, cam, g) {
      const set = this.spriteSet(g);
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - cam.ry);
      if (this.state === 'fall') {
        const k = Math.max(0, 1 - this.stateT / 0.5);
        const img = set[this.dir][0];
        ctx.globalAlpha = k;
        ctx.drawImage(img, Math.round(x - img.width * k / 2), Math.round(y - img.height * k + 6 * (1 - k)), Math.round(img.width * k), Math.round(img.height * k));
        ctx.globalAlpha = 1;
        return;
      }
      P.shadow(ctx, x, y, 12, 0.32);
      if (this.state === 'down') { this.drawDown(ctx, x, y, set, g); return; }
      const img = set[this.dir][this.frame()];
      const by = this.bob();
      if (this.invuln > 0 && this.state !== 'dodge' && Math.floor(this.invuln * 16) % 2 === 0 && this.hurtT <= 0 && this.invuln < 0.85) ctx.globalAlpha = 0.45;
      const yz = y - by - Math.round(this.z || 0);
      this.drawBehind(ctx, x, yz, g);
      const ox = Math.round(x - img.width / 2), oy = Math.round(y - img.height + 1 - by - (this.z || 0));
      ctx.drawImage(img, ox, oy);
      if (this.flash > 0) ctx.drawImage(set[this.dir + '_white'][this.frame()], ox, oy);
      this.drawFront(ctx, x, yz, g);
      ctx.globalAlpha = 1;
      if (this.frozenSolid > 0) {
        const ice = G.Props.iceShell();
        ctx.drawImage(ice, Math.round(x - ice.width / 2), Math.round(y - ice.height + 2));
      }
      this.hurtT = Math.max(0, this.hurtT - 1 / 60);
    }
    drawDown(ctx, x, y, set, g) {
      const img = set.right[0];
      ctx.save();
      ctx.translate(x, y - 4);
      ctx.rotate(this.index === 0 ? -Math.PI / 2 : Math.PI / 2);
      ctx.globalAlpha = 0.85;
      ctx.drawImage(img, -img.width / 2, -img.height / 2 - 2);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    // Elementos de interface sobre a cabeça (desenhados depois da iluminação)
    drawOverlay(ctx, cam, g) {
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - cam.ry);
      if (this.state === 'down') {
        const k = this.downT / (DOWN_TIME * (g.settings.assist ? 1.5 : 1));
        ctx.fillStyle = '#1a1424'; ctx.fillRect(x - 12, y - 24, 24, 4);
        ctx.fillStyle = k < 0.3 && Math.floor(g.time * 6) % 2 ? '#ff4a4a' : '#ff8a6a'; ctx.fillRect(x - 11, y - 23, Math.round(22 * k), 2);
        if (this.reviveP > 0) { ctx.fillStyle = '#ffe8a0'; ctx.fillRect(x - 11, y - 20, Math.round(22 * this.reviveP / REVIVE_TIME), 2); }
        const pt = this.partner(g);
        const key = pt ? G.Characters[pt.key].keys.act : 'L';
        G.Font.draw(ctx, `Segure [${key}] para reviver`, x, y - 36, '#ffe8a0', { align: 'center', shadow: true });
        return;
      }
      if (this.frozenSolid > 0) {
        const pt = this.partner(g);
        const key = pt ? G.Characters[pt.key].keys.act : 'L';
        G.Font.draw(ctx, `Segure [${key}] para quebrar o gelo`, x, y - 40, '#c8f0ff', { align: 'center', shadow: true });
      }
      if (g.showIndicators && !g.inCutscene()) {
        const yy = y - 32 - (this.young ? -8 : 0);
        ctx.fillStyle = this.color;
        ctx.fillRect(x - 2, yy, 5, 1); ctx.fillRect(x - 1, yy + 1, 3, 1); ctx.fillRect(x, yy + 2, 1, 1);
        if (G.Input.solo && G.Input.soloActive === this.index) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 3, yy - 1, 7, 1); }
      }
      if (this.tethered > 0) {
        const pt = this.partner(g);
        if (pt) {
          ctx.globalAlpha = 0.5;
          const n = 10;
          for (let i = 1; i < n; i++) {
            const t = i / n;
            ctx.fillStyle = '#ffe8a0';
            ctx.fillRect(Math.round(U.lerp(x, pt.x - cam.rx, t)), Math.round(U.lerp(y - 10, pt.y - 10 - cam.ry, t) + Math.sin(t * 3.14) * 6), 1, 1);
          }
          ctx.globalAlpha = 1;
        }
      }
    }
  }

  Character.DOWN_TIME = DOWN_TIME;
  G.Character = Character;
})();
