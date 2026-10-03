// MINI-CHEFE — Guardião de Pedra.
// Mecânica: blindado. Só fica vulnerável quando Aldren APARA o golpe de esmagar
// (escudo no momento exato) ou quando ele se choca contra a parede na investida.
// Fase 2 (50%): fúria + chuva de pedras.
(function () {
  const U = G.U, P = G.Pixel;

  class Golem extends G.Enemy {
    constructor(o) {
      super(o, { type: 'golem', hp: 300, speed: 24, dmg: 16, aggro: 999, heavyBody: true, noFreeze: true, box: { w: 26, h: 12, hw: 30, hh: 34 }, gold: 0, drops: {}, blood: ['#9a948a', '#5a5450'], deathColors: ['#9a948a', '#5a5450', '#8ae8ff'] });
      this.boss = true;
      this.state = 'sleep';
      this.cd = 1.5;
      this.phase2 = false;
      this.exposedT = 0;
      this.armT = 0;
      this.chargeV = null;
      this.rocks = [];
      this.rockCd = 3;
      this.name = 'Guardião de Pedra';
    }
    get heavyBody() { return true; }
    wake(g) { this.state = 'idle'; this.stateT = 0; this.aggro = true; g.bossBar = this; }
    modifyDamage(d, hit, g) {
      if (this.exposedT > 0) return d * 1.2;
      if (!this._armTxt || g.time - this._armTxt > 1) { this._armTxt = g.time; g.particles.text(this.x, this.y - 44, 'BLINDADO', '#c8c8d8'); }
      return d * 0.15;
    }
    stun(t, g) { /* só fica exposto por mecânicas próprias */ }
    get stunned() { return this.exposedT > 0; }
    onParried(by, g) {
      if (this.state !== 'slam') return;
      this.expose(g, 3.6, 'APARADO! O núcleo está exposto!');
    }
    expose(g, t, msg) {
      this.exposedT = t; this.state = 'exposed'; this.stateT = 0;
      G.Audio.sfx('roar');
      g.camera.shake(3, 0.4);
      g.comboText(this.x, this.y - 54, 'NÚCLEO EXPOSTO!');
      if (msg && !this._exposeHint) { this._exposeHint = true; g.toast(msg, 3); }
    }
    takeHit(hit, g) {
      if (this.state === 'sleep' || this.state === 'dying') return false;
      return super.takeHit(hit, g);
    }
    die(g) {
      if (this.state === 'dying') return;
      this.state = 'dying'; this.stateT = 0; this.hp = 0;
      g.bossBar = null;
      G.Audio.sfx('roar');
      if (this.flag) g.setFlag(this.flag, true);
    }
    update(dt, g) {
      this.animT += dt; this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt);
      this.updateRocks(dt, g);
      if (this.state === 'sleep') return;
      if (this.state === 'dying') {
        if (Math.random() < 0.5) g.particles.burst(this.x + U.rand(-14, 14), this.y - U.rand(4, 34), 4, { colors: ['#9a948a', '#5a5450'], speed: 40, life: 0.5, g: 200, up: 30 });
        if (Math.random() < 0.15) { G.Audio.sfx('break'); g.camera.shake(2, 0.2); }
        if (this.stateT > 2.2) {
          this.dead = true;
          G.Audio.sfx('explosion');
          g.camera.shake(6, 0.6);
          g.flashScreen('#ffffff', 0.4);
          g.particles.burst(this.x, this.y - 18, 60, { colors: ['#9a948a', '#5a5450', '#8ae8ff', '#ffffff'], speed: 120, life: 1.2, size: 2, g: 150, up: 60 });
          g.onEnemyKilled(this);
          const s = g.level.def.scripts && g.level.def.scripts.golemDefeated;
          if (s) g.co.start(s, g, { name: 'golemDefeated' });
        }
        return;
      }
      if (!this.phase2 && this.hp < this.maxHp * 0.5) {
        this.phase2 = true; this.state = 'roar'; this.stateT = 0;
        G.Audio.sfx('roar'); g.camera.shake(4, 0.8);
        g.toast('O Guardião entrou em fúria!', 2.5);
      }
      if (this.exposedT > 0) {
        this.exposedT -= dt;
        if (this.exposedT <= 0) { this.state = 'idle'; this.stateT = 0; this.cd = 0.8; }
        return;
      }
      this.target = this.pickTarget(g);
      const t = this.target;
      const sp = this.speed * (this.phase2 ? 1.25 : 1);
      this.cd -= dt;
      if (this.phase2) {
        this.rockCd -= dt;
        if (this.rockCd <= 0) { this.rockCd = U.rand(2.5, 3.5); this.rockRain(g); }
      }
      switch (this.state) {
        case 'roar': if (this.stateT > 1.2) { this.state = 'idle'; this.cd = 0.5; } return;
        case 'idle':
        case 'walk': {
          if (!t) return;
          const d = U.dist(this.x, this.y, t.x, t.y);
          this.facing = t.x < this.x ? -1 : 1;
          if (this.cd <= 0) {
            if (d < 52) { this.state = 'slamWind'; this.stateT = 0; return; }
            const r = Math.random();
            if (r < 0.45) { this.state = 'throwWind'; this.stateT = 0; this.throwTarget = g.players[0] && !g.players[0].isDown ? g.players[0] : t; return; }
            this.state = 'chargeWind'; this.stateT = 0; this.chargeTarget = t; return;
          }
          if (d > 40) { this.state = 'walk'; this.moveToward(g, t.x, t.y, sp, dt); }
          return;
        }
        case 'slamWind':
          if (this.stateT > (this.phase2 ? 0.75 : 0.95)) { this.state = 'slam'; this.stateT = 0; this.slamImpact(g); }
          return;
        case 'slam':
          if (this.stateT > 0.7) { this.state = 'idle'; this.cd = U.rand(1.2, 2); }
          return;
        case 'throwWind':
          if (this.stateT > 0.8) {
            const tg = this.throwTarget && !this.throwTarget.isDown ? this.throwTarget : t;
            if (tg) {
              const n = U.norm(tg.x - this.x, tg.y - (this.y - 6));
              const shots = this.phase2 ? [-0.25, 0, 0.25] : [0];
              for (const off of shots) {
                const a = Math.atan2(n.y, n.x) + off;
                g.addEntity(new G.Combat.Projectile({ x: this.x, y: this.y - 4, vx: Math.cos(a) * 125, vy: Math.sin(a) * 125, team: 'enemy', owner: this, dmg: 12, kind: 'rock', life: 2.5, height: 24, r: 5, light: 0, trail: false, kb: 120 }));
              }
              G.Audio.sfx('heavySwing');
            }
            this.state = 'idle'; this.cd = U.rand(1, 1.8);
          }
          return;
        case 'chargeWind':
          if (this.stateT > 0.75) {
            const tg = this.chargeTarget || t;
            const n = tg ? U.norm(tg.x - this.x, tg.y - this.y) : { x: this.facing, y: 0 };
            this.chargeV = { x: n.x * 175, y: n.y * 175 };
            this.state = 'charge'; this.stateT = 0; this.chargeHit = new Set();
          }
          return;
        case 'charge': {
          const r = G.Physics.move(g, this, this.chargeV.x * dt, this.chargeV.y * dt);
          if (Math.random() < 0.6) g.particles.add({ x: this.x + U.rand(-10, 10), y: this.y, vy: -12, life: 0.4, color: '#8a7a68', back: true, size: 2 });
          for (const p of g.players) {
            if (!p || p.isDown || this.chargeHit.has(p)) continue;
            if (U.rectsOverlap(this.hurtBox, p.hurtBox)) { this.chargeHit.add(p); p.takeHit({ dmg: 18, src: this, dir: U.norm(this.chargeV.x, this.chargeV.y), kb: 220 }, g); }
          }
          // quebra rochas rachadas no caminho
          for (const e of g.solids) if (e instanceof G.ObjectTypes.cracked && U.rectsOverlap(this.hurtBox, e.box)) e.onHit('golem', this, g);
          if (r.hitX || r.hitY) {
            G.Audio.sfx('heavyHit'); g.camera.shake(5, 0.4);
            g.particles.burst(this.x + this.chargeV.x * 0.1, this.y - 10, 20, { colors: ['#9a948a', '#5a5450'], speed: 80, life: 0.6, g: 200, up: 50, size: 2 });
            this.expose(g, 3, 'Ele bateu na parede! Ataquem o núcleo!');
          } else if (this.stateT > 1.5) { this.state = 'idle'; this.cd = U.rand(0.8, 1.4); }
          return;
        }
        default: this.state = 'idle';
      }
    }
    slamImpact(g) {
      const R = 40;
      G.Audio.sfx('explosion');
      g.camera.shake(5, 0.35);
      g.particles.ring(this.x, this.y, 6, R + 6, 0.45, '#c8b898', 2);
      g.particles.burst(this.x, this.y, 26, { colors: ['#b8a888', '#8a7a68'], speed: 90, life: 0.6, g: 200, up: 40, size: 2 });
      for (const p of g.players) {
        if (!p || p.isDown) continue;
        if (U.dist(p.x, p.y, this.x, this.y) <= R) {
          const res = p.takeHit({ dmg: 16, src: this, dir: U.norm(p.x - this.x, p.y - this.y), kb: 160 }, g);
          void res;
        }
      }
    }
    rockRain(g) {
      const alive = g.players.filter((p) => p && !p.isDown);
      for (const p of alive) {
        for (let i = 0; i < 2; i++) {
          const x = p.x + U.rand(-30, 30), y = p.y + U.rand(-20, 20);
          this.rocks.push({ x, y, t: 1.1 });
        }
      }
    }
    updateRocks(dt, g) {
      for (const r of this.rocks) {
        r.t -= dt;
        if (r.t <= 0 && !r.done) {
          r.done = true;
          G.Audio.sfx('break');
          g.particles.burst(r.x, r.y, 10, { colors: ['#9a948a', '#5a5450'], speed: 50, life: 0.5, g: 200, up: 30 });
          for (const p of g.players) if (p && !p.isDown && U.dist(p.x, p.y, r.x, r.y) < 13) p.takeHit({ dmg: 10, src: null, dir: U.norm(p.x - r.x, p.y - r.y), kb: 80 }, g);
        }
      }
      this.rocks = this.rocks.filter((r) => !r.done);
    }
    draw(ctx, cam, g) {
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - cam.ry);
      // pedras caindo (telegrafadas)
      for (const r of this.rocks) {
        const rx = Math.round(r.x - cam.rx), ry = Math.round(r.y - cam.ry);
        ctx.globalAlpha = 0.5; P.ellipse(ctx, rx, ry, Math.round(8 * (1.1 - r.t) + 3), 3, '#1a0a0a'); ctx.globalAlpha = 1;
        if (Math.floor(r.t * 10) % 2) { ctx.fillStyle = '#ff4a3a'; ctx.fillRect(rx - 1, ry - 1, 3, 1); }
        const fy = ry - r.t * 120;
        P.circle(ctx, rx, Math.round(fy), 4, '#5a5450'); P.circle(ctx, rx - 1, Math.round(fy) - 1, 2, '#8a847a');
      }
      // telegrafo do esmagar
      if (this.state === 'slamWind') {
        const k = this.stateT / 0.95;
        ctx.globalAlpha = 0.25 + k * 0.35;
        P.ellipse(ctx, x, y, 40, 30, '#ff3a2a');
        ctx.globalAlpha = 1;
        P.ring(ctx, x, y, Math.round(40 * Math.min(1, k)), '#ffb0a0');
      }
      P.shadow(ctx, x, y, 36, 0.35);
      if (this.state === 'sleep') { this.drawBody(ctx, x, y, g, 0, 0, true); return; }
      let lift = 0, armUp = 0, shake = 0;
      if (this.state === 'slamWind') { armUp = 1; shake = Math.round(Math.sin(this.stateT * 50)); }
      if (this.state === 'slam') armUp = -1;
      if (this.state === 'throwWind') armUp = 2;
      if (this.state === 'chargeWind') shake = Math.round(Math.sin(this.stateT * 60) * 1.5);
      if (this.state === 'walk' || this.state === 'charge') lift = Math.floor(this.animT * (this.state === 'charge' ? 12 : 5)) % 2;
      if (this.state === 'dying') shake = Math.round(U.rand(-2, 2));
      this.drawBody(ctx, x + shake, y - lift, g, armUp, 0, false);
    }
    drawBody(ctx, x, y, g, armUp, _, sleeping) {
      const white = this.flash > 0;
      const st = white ? '#ffffff' : '#7a746c', dk = white ? '#ffffff' : '#4a4642', lt = white ? '#ffffff' : '#a49e94', moss = white ? '#ffffff' : '#4e7a3e';
      const dying = this.state === 'dying';
      if (dying) ctx.globalAlpha = Math.max(0.2, 1 - this.stateT / 2.2);
      // pernas
      ctx.fillStyle = dk; ctx.fillRect(x - 12, y - 10, 9, 10); ctx.fillRect(x + 3, y - 10, 9, 10);
      ctx.fillStyle = st; ctx.fillRect(x - 11, y - 10, 7, 8); ctx.fillRect(x + 4, y - 10, 7, 8);
      // tronco
      ctx.fillStyle = dk; ctx.fillRect(x - 15, y - 34, 30, 26);
      ctx.fillStyle = st; ctx.fillRect(x - 14, y - 33, 28, 23);
      ctx.fillStyle = lt; ctx.fillRect(x - 14, y - 33, 28, 3); ctx.fillRect(x - 14, y - 33, 3, 20);
      ctx.fillStyle = dk; ctx.fillRect(x - 4, y - 26, 1, 8); ctx.fillRect(x + 6, y - 30, 1, 5);
      ctx.fillStyle = moss; ctx.fillRect(x - 14, y - 35, 12, 3); ctx.fillRect(x + 4, y - 35, 8, 2); ctx.fillRect(x - 10, y - 32, 3, 2);
      // núcleo
      const exposed = this.exposedT > 0;
      const pulse = Math.floor(g.time * (exposed ? 10 : 3)) % 2;
      ctx.fillStyle = '#1a1424'; ctx.fillRect(x - 4, y - 25, 8, 8);
      ctx.fillStyle = exposed ? (pulse ? '#ffffff' : '#8ae8ff') : (sleeping ? '#2a3a4a' : '#3a6a8a');
      ctx.fillRect(x - 3, y - 24, 6, 6);
      if (exposed) g.lighting.add(this.x, this.y - 21, 50, 0.9, '#8ae8ff', 0.22);
      // cabeça
      ctx.fillStyle = dk; ctx.fillRect(x - 7, y - 44, 14, 11);
      ctx.fillStyle = st; ctx.fillRect(x - 6, y - 43, 12, 9);
      ctx.fillStyle = lt; ctx.fillRect(x - 6, y - 43, 12, 2);
      ctx.fillStyle = moss; ctx.fillRect(x - 6, y - 45, 7, 2);
      const eye = sleeping ? '#3a3a4a' : (this.phase2 ? '#ff6a3a' : '#ffd84a');
      ctx.fillStyle = eye; ctx.fillRect(x - 4, y - 39, 3, 2); ctx.fillRect(x + 1, y - 39, 3, 2);
      if (!sleeping) g.lighting.add(this.x, this.y - 39, 26, 0.6, this.phase2 ? '#ff6a3a' : '#ffd84a', 0.2);
      // braços
      const ay = armUp === 1 ? -14 : armUp === 2 ? -10 : armUp === -1 ? 6 : 0;
      for (const side of [-1, 1]) {
        const ax = x + side * 19 - 5;
        const yy = y - 32 + (side === 1 && armUp === 2 ? ay : armUp === 2 ? 0 : ay);
        ctx.fillStyle = dk; ctx.fillRect(ax, yy, 10, 22);
        ctx.fillStyle = st; ctx.fillRect(ax + 1, yy + 1, 8, 20);
        ctx.fillStyle = lt; ctx.fillRect(ax + 1, yy + 1, 2, 18);
        ctx.fillStyle = dk; ctx.fillRect(ax - 1, yy + 16, 12, 7);
        if (side === 1 && armUp === 2) { P.circle(ctx, ax + 5, yy - 3, 5, '#5a5450'); P.circle(ctx, ax + 4, yy - 4, 3, '#8a847a'); }
      }
      ctx.globalAlpha = 1;
      if (exposed) G.FX.stars(ctx, x, y - 50, g.time);
    }
  }
  G.EnemyTypes.golem = Golem;
})();
