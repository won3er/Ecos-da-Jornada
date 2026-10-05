// CHEFE — Morvath, o Devorador de Memórias.
// Fase 1: Véu Prismático (só magia concentrada quebra) -> fica atordoado no chão.
// Fase 2: fica intangível, invoca ecos sombrios e lança o Orbe do Esquecimento,
//         que só pode ser devolvido se Aldren aparar com Reflexão.
// Fase 3: tudo junto, mais rápido, com zonas de névoa no chão.
(function () {
  const U = G.U, P = G.Pixel;

  class Boss extends G.Enemy {
    constructor(o) {
      super(o, { type: 'boss', hp: 460, speed: 40, dmg: 12, aggro: 999, heavyBody: true, noFreeze: true, noStun: true, box: { w: 20, h: 10, hw: 30, hh: 48 }, gold: 0, drops: {}, deathColors: ['#c8a8ff', '#ffffff', '#f2d98c'] });
      this.boss = true;
      this.name = 'Morvath, o Devorador de Memórias';
      this.flying = true;
      this.state = 'dormant';
      this.phase = 1;
      this.shield = 2; this.shieldMax = 2;
      this.dazedT = 0;
      this.intangible = false;
      this.z = 14;
      this.cd = 2;
      this.orbCd = 3;
      this.fogs = [];
      this.fogCd = 4;
      this.shards = 4;
      this.center = { x: this.x, y: this.y };
      this.moveT = 0; this.goal = null;
    }
    get heavyBody() { return true; }
    activate(g) { this.state = 'idle'; this.stateT = 0; this.aggro = true; g.bossBar = this; this.cd = 1.5; }

    takeHit(hit, g) {
      if (this.state === 'dormant' || this.state === 'dying' || this.state === 'transition') return false;
      if (hit.kind === 'reflected_big') { this.orbHit(g); return true; }
      if (this.intangible) {
        G.Audio.sfx('immune');
        if (!this._intTxt || g.time - this._intTxt > 1) { this._intTxt = g.time; g.particles.text(this.x, this.y - 56, 'INTANGÍVEL', '#c8a8ff'); }
        return true;
      }
      if (this.shield > 0 && this.dazedT <= 0) {
        if (hit.kind === 'charged' || hit.kind === 'prism' || hit.kind === 'special') {
          this.shield -= hit.kind === 'prism' ? 0.5 : 1;
          this.flash = 0.1;
          G.Audio.sfx('barrier');
          g.particles.burst(this.x, this.y - this.z - 20, 20, { colors: ['#ff8ad8', '#8ae8ff', '#ffe680', '#ffffff'], speed: 80, life: 0.5, glow: true });
          if (this.shield <= 0) this.breakShield(g);
          else g.particles.text(this.x, this.y - 60, 'O véu racha!', '#ffe680');
          return true;
        }
        G.Audio.sfx('immune');
        if (!this._shTxt || g.time - this._shTxt > 1.2) {
          this._shTxt = g.time;
          g.particles.text(this.x, this.y - 60, hit.kind === 'bolt' ? 'Magia fraca demais' : 'O véu absorve', '#e0c8ff');
          if (!g.flag('hint_veil') && g.time - (this._hintT || 0) > 6) { this._hintT = g.time; g.setFlag('hint_veil', true); g.bubble(g.players[0], 'O véu é mágico. Só magia concentrada atravessa!', 3.5); }
        }
        return true;
      }
      return super.takeHit(hit, g);
    }
    modifyDamage(d, hit, g) {
      const physical = hit.kind === 'sword' || hit.kind === 'heavy';
      let m = physical ? 1.25 : hit.kind === 'bolt' ? 0.7 : 1;
      return d * m;
    }
    get stunned() { return this.dazedT > 0; }
    phaseFloor() { return this.phase === 1 ? Math.floor(this.maxHp * 0.655) : this.phase === 2 ? Math.floor(this.maxHp * 0.325) : null; }
    stun() {}
    onParried(by, g) { if (this.state === 'swipe') { this.cd = 1.5; g.particles.text(this.x, this.y - 56, 'Recuou!', '#ffe680'); this.kvx = by.fx * 60; } }

    breakShield(g) {
      this.shield = 0;
      this.dazedT = this.phase === 3 ? 5 : 6;
      this.state = 'dazed'; this.stateT = 0;
      G.Audio.sfx('shatter'); G.Audio.sfx('roar');
      g.camera.shake(5, 0.5);
      g.flashScreen('#e0c8ff', 0.15);
      g.comboText(this.x, this.y - 64, 'VÉU QUEBRADO!');
      if (!g.flag('hint_dazed')) { g.setFlag('hint_dazed', true); g.bubble(g.players[1], 'Ele caiu! Agora é a minha vez!', 2.5); }
    }
    orbHit(g) {
      G.Audio.sfx('explosion'); G.Audio.sfx('roar');
      g.camera.shake(6, 0.6);
      g.flashScreen('#ffffff', 0.25);
      this.intangible = false;
      this.shield = 0;
      this.dazedT = 7; this.state = 'dazed'; this.stateT = 0;
      this.hp -= 25; this.flash = 0.2;
      g.particles.text(this.x, this.y - 50, 25, '#ffd84a');
      g.comboText(this.x, this.y - 66, 'ORBE DEVOLVIDO!');
      g.registerCombo('orb');
      for (const e of g.entities) if (e.type === 'shade' && !e.dead) e.die(g);
      if (this.hp <= 0) this.die(g);
    }
    die(g) {
      if (this.state === 'dying') return;
      this.state = 'dying'; this.stateT = 0; this.hp = 0; this.intangible = false;
      g.bossBar = null;
      for (const e of g.entities) if ((e.type === 'shade' || (e instanceof G.Combat.Projectile && e.team === 'enemy')) && !e.dead) { if (e.die) e.die(g); else e.dead = true; }
      this.fogs = [];
      G.Audio.playMusic(null, 1);
      G.Audio.sfx('roar');
    }

    update(dt, g) {
      this.animT += dt; this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt);
      this.updateFogs(dt, g);
      if (Math.abs(this.kvx) > 1) { G.Physics.move(g, this, this.kvx * dt, 0); this.kvx *= 0.9; }
      if (this.state === 'dormant') return;
      if (this.state === 'dying') {
        this.z = U.approach(this.z, 4, dt * 10);
        if (Math.random() < 0.6) g.particles.burst(this.x + U.rand(-14, 14), this.y - this.z - U.rand(4, 44), 3, { colors: ['#c8a8ff', '#ffffff', '#f2d98c'], speed: 50, life: 0.7, glow: true });
        if (Math.random() < 0.08) { G.Audio.sfx('shatter'); g.flashScreen('#ffffff', 0.08); }
        if (this.stateT > 3.2) {
          this.dead = true;
          G.Audio.sfx('explosion');
          g.flashScreen('#ffffff', 0.8);
          g.camera.shake(8, 1);
          g.particles.burst(this.x, this.y - 30, 90, { colors: ['#c8a8ff', '#ffffff', '#f2d98c', '#8ae8ff'], speed: 140, life: 1.6, glow: true, size: 2 });
          g.particles.ring(this.x, this.y - 20, 6, 120, 1.2, '#ffffff', 2);
          g.onEnemyKilled(this);
          const s = g.level.def.scripts && g.level.def.scripts.bossDefeated;
          if (s) g.co.start(s, g, { name: 'bossDefeated' });
        }
        return;
      }
      // transições de fase
      const k = this.hp / this.maxHp;
      if (this.phase === 1 && k < 0.66) { this.toPhase(2, g); return; }
      if (this.phase === 2 && k < 0.33) { this.toPhase(3, g); return; }
      if (this.state === 'transition') {
        this.z = U.approach(this.z, 20, dt * 20);
        if (this.stateT > 2.2) { this.state = 'idle'; this.stateT = 0; this.cd = 1; if (this.phase === 2) this.startForget(g); }
        return;
      }
      if (this.dazedT > 0) {
        this.dazedT -= dt;
        this.z = U.approach(this.z, 2, dt * 30);
        if (this.dazedT <= 0) {
          this.state = 'idle'; this.stateT = 0; this.cd = 1.2;
          G.Audio.sfx('roar');
          if (this.phase === 1) this.shield = this.shieldMax = 2;
          if (this.phase === 2) this.startForget(g);
          if (this.phase === 3) { this.shield = this.shieldMax = 3; this.orbCd = 6; }
          g.particles.ring(this.x, this.y - 24, 6, 34, 0.5, '#e0c8ff', 2);
        }
        return;
      }
      this.z = U.approach(this.z, 14 + Math.sin(this.animT * 2) * 3, dt * 20);
      this.target = this.pickTarget(g);
      this.drift(dt, g);
      this.cd -= dt;
      if (this.phase >= 2) this.orbCd -= dt;
      if (this.phase === 3) {
        this.fogCd -= dt;
        if (this.fogCd <= 0) { this.fogCd = U.rand(3.5, 5); this.spawnFogs(g); }
      }
      // Orbe do Esquecimento
      if (this.phase === 2 && this.intangible && this.orbCd <= 0 && !this.orbOut() && this.state === 'idle') { this.chargeOrb(g); return; }
      if (this.phase === 3 && this.orbCd <= 0 && !this.orbOut() && this.state === 'idle') { this.chargeOrb(g); return; }
      switch (this.state) {
        case 'idle':
          if (this.cd <= 0) this.chooseAttack(g);
          return;
        case 'ringWind':
          if (this.stateT > 0.6) { this.fireRing(g); this.state = 'idle'; this.cd = this.phase === 3 ? U.rand(1, 1.6) : U.rand(1.6, 2.4); }
          return;
        case 'spiral':
          this.spiralT = (this.spiralT || 0) + dt;
          if (this.spiralT > 0.09) {
            this.spiralT = 0;
            this.spiralA = (this.spiralA || 0) + 0.45;
            for (const off of [0, Math.PI]) this.shoot(g, this.spiralA + off, 80, 9, '#c8a8ff');
          }
          if (this.stateT > 2) { this.state = 'idle'; this.cd = U.rand(1.2, 1.8); }
          return;
        case 'tearWind':
          if (this.stateT > 0.7) {
            const tg = g.players[0] && !g.players[0].isDown ? g.players[0] : this.target;
            for (let i = 0; i < 3; i++) {
              const a = U.angle(this.x, this.y, tg.x, tg.y) + (i - 1) * 0.4;
              const pr = this.shoot(g, a, 95, 10, '#ff8ad8');
              pr.homing = 1.2; pr.target = tg; pr.life = 3;
            }
            G.Audio.sfx('bolt');
            this.state = 'idle'; this.cd = U.rand(1.4, 2);
          }
          return;
        case 'swipeWind':
          if (this.stateT > 0.6) {
            this.state = 'swipe'; this.stateT = 0;
            G.Audio.sfx('heavySwing');
            const n = this.swipeDir;
            for (const p of g.players) {
              if (!p || p.isDown) continue;
              const d = U.dist(p.x, p.y, this.x + n.x * 20, this.y + n.y * 14);
              if (d < 30) p.takeHit({ dmg: 14, src: this, dir: U.norm(p.x - this.x, p.y - this.y), kb: 180 }, g);
            }
            g.particles.ring(this.x + n.x * 20, this.y + n.y * 14 - 6, 4, 28, 0.3, '#ff8ad8', 2);
          }
          return;
        case 'swipe': if (this.stateT > 0.5) { this.state = 'idle'; this.cd = U.rand(0.8, 1.4); } return;
        case 'orbCharge':
          if (this.stateT > 2.2) { this.launchOrb(g); this.state = 'idle'; this.cd = 1.5; }
          else if (Math.random() < 0.8) {
            const a = Math.random() * 6.28;
            g.particles.add({ x: this.x + Math.cos(a) * 40, y: this.y - this.z - 30 + Math.sin(a) * 30, vx: -Math.cos(a) * 60, vy: -Math.sin(a) * 45, life: 0.6, color: '#2a1840', size: 2 });
          }
          return;
        default: this.state = 'idle';
      }
    }
    orbOut() { return this.orb && !this.orb.dead; }
    drift(dt, g) {
      this.moveT -= dt;
      if (this.moveT <= 0 || !this.goal) {
        this.moveT = U.rand(1.5, 3);
        const a = Math.random() * 6.28;
        this.goal = { x: this.center.x + Math.cos(a) * 70, y: this.center.y + Math.sin(a) * 40 };
      }
      if (this.state === 'idle' || this.state === 'spiral') {
        const sp = this.phase === 3 ? 50 : 34;
        const n = U.norm(this.goal.x - this.x, this.goal.y - this.y);
        if (U.dist(this.x, this.y, this.goal.x, this.goal.y) > 4) G.Physics.move(g, this, n.x * sp * dt, n.y * sp * dt);
        if (this.target) this.facing = this.target.x < this.x ? -1 : 1;
      }
    }
    chooseAttack(g) {
      const t = this.target; if (!t) return;
      const d = U.dist(this.x, this.y, t.x, t.y);
      if (d < 42 && !this.intangible) { this.state = 'swipeWind'; this.stateT = 0; this.swipeDir = U.norm(t.x - this.x, t.y - this.y); return; }
      const r = Math.random();
      if (this.phase === 3 && r < 0.3) { this.state = 'spiral'; this.stateT = 0; return; }
      if (r < 0.55) { this.state = 'ringWind'; this.stateT = 0; return; }
      this.state = 'tearWind'; this.stateT = 0;
    }
    shoot(g, a, sp, dmg, color) {
      const pr = new G.Combat.Projectile({ x: this.x + Math.cos(a) * 10, y: this.y + Math.sin(a) * 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, team: 'enemy', owner: this, dmg, kind: 'orb', life: 3.5, height: 16, r: 4, color, color2: '#ffffff', light: 24, size: 2 });
      g.addEntity(pr);
      return pr;
    }
    fireRing(g) {
      const n = this.phase === 3 ? 14 : 10;
      const off = Math.random() * 6.28;
      for (let i = 0; i < n; i++) this.shoot(g, off + (i / n) * 6.28, this.phase === 3 ? 85 : 70, 9, '#c8a8ff');
      G.Audio.sfx('bigBolt');
      g.particles.ring(this.x, this.y - this.z - 16, 4, 24, 0.3, '#c8a8ff', 2);
    }
    toPhase(n, g) {
      this.phase = n; this.state = 'transition'; this.stateT = 0;
      this.dazedT = 0; this.shield = 0;
      for (const e of g.entities) if (e instanceof G.Combat.Projectile && e.team === 'enemy') e.die(g);
      G.Audio.sfx('roar'); g.camera.shake(5, 1);
      g.flashScreen('#2a1840', 0.3);
      const s = g.level.def.scripts && g.level.def.scripts['bossPhase' + n];
      if (s) g.co.start(s, g, { blocking: false, name: 'phase' });
      if (n === 3) { this.intangible = false; this.shield = this.shieldMax = 3; this.orbCd = 8; for (const e of g.entities) if (e.type === 'shade') e.die(g); }
    }
    startForget(g) {
      this.intangible = true;
      this.orbCd = 2.5;
      // invoca ecos sombrios
      const alive = g.entities.filter((e) => e.type === 'shade' && !e.dead).length;
      for (let i = alive; i < 2; i++) {
        const sh = new G.EnemyTypes.shade({ x: this.center.x + (i ? 50 : -50), y: this.center.y + 30, mimic: i ? 'lirien' : 'aldren' });
        g.addEntity(sh);
        g.particles.burst(sh.x, sh.y - 10, 20, { colors: ['#2a1840', '#6a3a9a', '#c8a8ff'], speed: 50, life: 0.6 });
      }
    }
    chargeOrb(g) { this.state = 'orbCharge'; this.stateT = 0; G.Audio.sfx('charge'); if (!g.flag('hint_orb')) { g.setFlag('hint_orb', true); g.toast('Aldren: apare o Orbe do Esquecimento no momento exato para devolvê-lo!', 4.5); } }
    launchOrb(g) {
      const tg = g.players[0] && !g.players[0].isDown ? g.players[0] : this.target;
      if (!tg) return;
      const n = U.norm(tg.x - this.x, tg.y - this.y);
      const pr = new G.Combat.Projectile({
        x: this.x + n.x * 14, y: this.y + n.y * 8, vx: n.x * 52, vy: n.y * 52, team: 'enemy', owner: this, dmg: 22,
        kind: 'orb', bigOrb: true, life: 9, height: 18, r: 8, color: '#2a1840', color2: '#c8a8ff', light: 50, homing: 0.5, target: tg,
      });
      pr.onDie = (gg, p) => {
        if (p.team === 'enemy') {
          G.Audio.sfx('explosion'); gg.camera.shake(4, 0.4);
          gg.particles.ring(p.x, p.y - 10, 6, 34, 0.5, '#c8a8ff', 2);
          for (const pl of gg.players) if (pl && !pl.isDown && U.dist(pl.x, pl.y, p.x, p.y) < 30 && !p.hitSet.has(pl)) pl.takeHit({ dmg: 14, src: this, dir: U.norm(pl.x - p.x, pl.y - p.y), kb: 150 }, gg);
        }
      };
      this.orb = pr;
      g.addEntity(pr);
      G.Audio.sfx('roar');
      this.orbCd = this.phase === 3 ? 12 : 8;
    }
    spawnFogs(g) {
      for (const p of g.players) if (p && !p.isDown) this.fogs.push({ x: p.x + U.rand(-10, 10), y: p.y + U.rand(-6, 6), t: 1.3, r: 26 });
      this.fogs.push({ x: this.center.x + U.rand(-80, 80), y: this.center.y + U.rand(-40, 40), t: 1.3, r: 30 });
    }
    updateFogs(dt, g) {
      for (const f of this.fogs) {
        f.t -= dt;
        if (f.t <= 0 && !f.done) {
          f.done = true;
          G.Audio.sfx('frost');
          g.particles.burst(f.x, f.y, 24, { colors: ['#6a3a9a', '#c8a8ff', '#2a1840'], speed: 60, life: 0.6 });
          for (const p of g.players) if (p && !p.isDown && U.dist(p.x, p.y, f.x, f.y) < f.r) p.takeHit({ dmg: 10, src: null, dir: U.norm(p.x - f.x, p.y - f.y), kb: 60 }, g);
        }
      }
      this.fogs = this.fogs.filter((f) => !f.done);
    }

    draw(ctx, cam, g) {
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - cam.ry);
      // névoas telegrafadas
      for (const f of this.fogs) {
        const fx = Math.round(f.x - cam.rx), fy = Math.round(f.y - cam.ry);
        ctx.globalAlpha = 0.25 + (1.3 - f.t) * 0.3;
        P.ellipse(ctx, fx, fy, f.r, Math.round(f.r * 0.7), '#4a2a6a');
        ctx.globalAlpha = 0.8; P.ring(ctx, fx, fy, Math.round(f.r * (1.3 - f.t) / 1.3), '#c8a8ff');
        ctx.globalAlpha = 1;
      }
      if (this.state === 'dormant') { this.drawStar(ctx, x, y, g); return; }
      P.shadow(ctx, x, y, 30, 0.35);
      const t = g.time;
      const zy = y - Math.round(this.z);
      let alpha = 1;
      if (this.intangible) alpha = 0.6 + Math.sin(t * 8) * 0.12;
      if (this.state === 'dying') alpha = Math.max(0, 1 - this.stateT / 3.2);
      ctx.globalAlpha = alpha;
      const glitch = this.intangible && Math.random() < 0.2 ? U.randi(-2, 2) : 0;
      const white = this.flash > 0;
      // manto (capuz + corpo fluido)
      const cloak = white ? '#ffffff' : '#2a1840', cloakL = white ? '#ffffff' : '#4a2a6a', cloakD = white ? '#ffffff' : '#140a20';
      const top = zy - 52;
      for (let j = 0; j < 46; j++) {
        let w;
        if (j < 14) w = Math.round(6 + j * 0.45);              // capuz
        else w = Math.round(9 + (j - 14) * 0.42 + Math.sin(t * 3 + j * 0.3) * (j > 32 ? 1.5 : 0.5));
        ctx.fillStyle = j < 2 ? cloakL : cloak;
        ctx.fillRect(x - w + glitch, top + j, w * 2, 1);
        ctx.fillStyle = cloakD; ctx.fillRect(x + Math.round(w * 0.35) + glitch, top + j, Math.round(w * 0.65), 1);
        ctx.fillStyle = cloakL; ctx.fillRect(x - w + glitch, top + j, 2, 1);
      }
      // mangas e garras
      for (const side of [-1, 1]) {
        const sway = Math.round(Math.sin(t * 2 + side) * 2) + (this.state === 'swipeWind' ? -6 : 0);
        for (let j = 0; j < 16; j++) {
          const ax = x + side * (11 + j * 0.6) + glitch, ay = zy - 34 + j + (side > 0 ? sway : -sway) * (j / 16);
          ctx.fillStyle = j > 12 ? (white ? '#fff' : '#c8a8ff') : cloak; ctx.fillRect(Math.round(ax) - 2, Math.round(ay), 5, 1);
        }
        const hx = x + side * 21 + glitch, hy = zy - 18 + (side > 0 ? sway : -sway);
        ctx.fillStyle = white ? '#fff' : '#e8e0f0';
        ctx.fillRect(hx - 1, hy, 1, 3); ctx.fillRect(hx + 1, hy, 1, 4); ctx.fillRect(hx + 3 * side, hy - 1, 1, 3);
      }
      // bainha esfarrapada
      for (let i = 0; i < 9; i++) {
        const bx = x - 26 + i * 6 + glitch, len = 3 + ((Math.sin(t * 4 + i * 1.7) + 1) * 3) | 0;
        ctx.fillStyle = cloak; ctx.fillRect(bx, zy - 7, 5, len);
      }
      // estrelas dentro do manto
      for (let i = 0; i < 16; i++) {
        const sx = x + Math.round(Math.sin(i * 12.9) * 13) + glitch, sy = zy - 34 + Math.round(((i * 7.3) % 30));
        if (Math.sin(t * 3 + i) > 0.1) { ctx.fillStyle = i % 3 ? '#c8a8ff' : '#ffffff'; ctx.fillRect(sx, sy, 1, 1); }
      }
      // núcleo estelar no peito
      const corePulse = 2 + (Math.floor(t * 6) % 2);
      P.circle(ctx, x + glitch, zy - 28, corePulse + 1, this.dazedT > 0 ? '#6a6a8a' : '#ffe680');
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 1 + glitch, zy - 29, 2, 2);
      // coroa de cristais
      for (const [ox, h] of [[-6, 7], [0, 10], [6, 7]]) {
        for (let k = 0; k < h; k++) { const ww = Math.max(1, Math.round((h - k) / 3)); ctx.fillStyle = k < 2 ? '#ffffff' : '#c8a8ff'; ctx.fillRect(x + ox - Math.floor(ww / 2) + glitch, top - h + k + 2, ww, 1); }
      }
      // máscara de cristal rachada
      const mx = x + glitch, my = top + 3;
      ctx.fillStyle = white ? '#ffffff' : '#1a1028'; ctx.fillRect(mx - 7, my - 1, 14, 15);
      ctx.fillStyle = white ? '#ffffff' : '#e8e0f0'; ctx.fillRect(mx - 6, my, 12, 12); ctx.fillRect(mx - 4, my + 12, 8, 2);
      ctx.fillStyle = '#b8a8c8'; ctx.fillRect(mx + 2, my, 4, 12);
      ctx.fillStyle = '#1a1028'; ctx.fillRect(mx - 1, my, 1, 3); ctx.fillRect(mx, my + 3, 1, 2); ctx.fillRect(mx - 1, my + 5, 1, 3); ctx.fillRect(mx + 1, my + 8, 1, 4);
      const eyeC = this.dazedT > 0 ? '#6a6a8a' : this.phase === 3 ? '#ff4a8a' : '#c8a8ff';
      ctx.fillStyle = eyeC; ctx.fillRect(mx - 5, my + 5, 3, 2); ctx.fillRect(mx + 2, my + 5, 3, 2);
      g.lighting.add(this.x, this.y - this.z - 46, 50, 0.8, eyeC, 0.25);
      g.lighting.add(this.x, this.y - this.z - 28, 40, 0.7, '#ffe680', 0.15);
      // fragmentos orbitando
      for (let i = 0; i < this.shards; i++) {
        const a = t * 1.5 + (i / this.shards) * 6.28;
        const sx = x + Math.round(Math.cos(a) * 30), sy = zy - 28 + Math.round(Math.sin(a) * 12);
        ctx.fillStyle = '#c8a8ff'; ctx.fillRect(sx - 1, sy - 3, 3, 6); ctx.fillStyle = '#ffffff'; ctx.fillRect(sx, sy - 2, 1, 3);
      }
      ctx.globalAlpha = 1;
      // véu prismático
      if (this.shield > 0 && this.dazedT <= 0 && this.state !== 'dying') {
        const cols = ['#ff8ad8', '#ffe680', '#8ae8ff', '#c8a8ff'];
        ctx.globalAlpha = 0.5 + Math.sin(t * 4) * 0.15;
        for (let i = 0; i < 40; i++) {
          const a = (i / 40) * 6.28 + t * 0.6;
          ctx.fillStyle = cols[(i + Math.floor(t * 6)) % 4];
          ctx.fillRect(Math.round(x + Math.cos(a) * 36), Math.round(zy - 28 + Math.sin(a) * 34), 2, 2);
        }
        ctx.globalAlpha = 1;
        g.lighting.add(this.x, this.y - this.z - 24, 70, 0.6, '#c8a8ff', 0.15);
      }
      if (this.dazedT > 0) G.FX.stars(ctx, x, zy - 64, t);
      if (this.state === 'orbCharge') {
        const k = this.stateT / 2.2;
        P.circle(ctx, x, zy - 72, Math.round(3 + k * 6), '#2a1840'); P.circle(ctx, x, zy - 72, Math.round(2 + k * 4), '#c8a8ff');
      }
      if (this.state === 'swipeWind') { ctx.globalAlpha = 0.35; P.ellipse(ctx, Math.round(x + this.swipeDir.x * 20), Math.round(y + this.swipeDir.y * 14), 28, 18, '#ff3a6a'); ctx.globalAlpha = 1; }
    }
    drawStar(ctx, x, y, g) {
      const t = g.time;
      P.ellipse(ctx, x, y, 34, 14, '#1a1424');
      P.ellipse(ctx, x, y - 1, 30, 11, '#3a2a4a');
      const crack = this.crack || 0;
      const sh = crack > 0 ? Math.round(U.rand(-crack, crack)) : 0;
      // estrela cristalina
      for (let j = 0; j < 26; j++) {
        const w = j < 13 ? Math.round(j * 0.9) : Math.round((26 - j) * 0.9);
        ctx.fillStyle = j % 3 ? '#c8a8ff' : '#e8d8ff'; ctx.fillRect(x - w + sh, y - 30 + j, w * 2, 1);
      }
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 2 + sh, y - 24, 3, 10);
      if (crack > 0) { ctx.fillStyle = '#1a1028'; ctx.fillRect(x + sh, y - 26, 1, 6); ctx.fillRect(x + 1 + sh, y - 20, 1, 4); ctx.fillRect(x - 1 + sh, y - 16, 1, 4); }
      g.lighting.add(this.x, this.y - 16, 70 + Math.sin(t * 3) * 6, 0.9, '#c8a8ff', 0.3);
    }
  }
  G.EnemyTypes.boss = Boss;
})();
