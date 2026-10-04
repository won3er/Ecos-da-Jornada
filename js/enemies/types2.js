// Inimigos dos Capítulos II e III. Cada um pede cooperação de um jeito novo.
(function () {
  const U = G.U, P = G.Pixel, E = G.Enemy, ET = G.EnemyTypes;
  const S = () => G.Sprites;

  // ---------------------------------------------------------------- LOBO DA GEADA
  class FrostWolf extends ET.wolf {
    constructor(o, def) {
      super(o, Object.assign({ type: 'frostwolf', hp: 34, speed: 72, dmg: 10, aggro: 135, weakFire: true, gold: 5, drops: { coin: 0.7, heart: 0.2 }, blood: ['#c8dcf0', '#ffffff'], deathColors: ['#c8dcf0', '#ffffff', '#8ac0e0'] }, def || {}));
      this.set = () => S().frostWolf;
    }
    think(dt, g) {
      super.think(dt, g);
      // a mordida gela (deixa lento)
      if (this.state === 'attack' && this.hitDone && !this._chilled) {
        this._chilled = true;
        for (const p of g.players) if (p && U.dist(p.x, p.y, this.x, this.y) < 26) p.chillT = Math.max(p.chillT || 0, 1.6);
      }
      if (this.state !== 'attack') this._chilled = false;
    }
  }
  ET.frostwolf = FrostWolf;

  // ---------------------------------------------------------------- LOBO ALFA DA NEVASCA (elite de missão)
  class Alpha extends FrostWolf {
    constructor(o) {
      super(o, { type: 'alpha', hp: 200, speed: 82, dmg: 15, aggro: 160, lunge: 240, windup: 0.38, recover: 0.45, gold: 40, drops: { coin: 1, heart: 1 }, box: { w: 16, h: 7, hw: 22, hh: 15 } });
      this.set = () => S().alphaWolf;
      this.elite = true; this.vanishCd = 4; this.vanished = 0; this.howled = false;
      this.name = 'Lobo Alfa da Nevasca';
    }
    takeHit(hit, g) {
      if (this.vanished > 0) return false;
      return super.takeHit(hit, g);
    }
    get intangible() { return this.vanished > 0; }
    onDamaged(hit, g) {
      if (!this.howled && this.hp < this.maxHp * 0.5) {
        this.howled = true;
        G.Audio.sfx('howl'); g.camera.shake(2, 0.5);
        g.particles.text(this.x, this.y - 30, 'AUUUUU!', '#a8dcf4');
        for (const off of [-34, 34]) { const w = g.spawnEnemy('frostwolf', this.x + off, this.y + 8); if (w) w.aggro = true; }
      }
    }
    think(dt, g) {
      this.vanishCd -= dt;
      if (this.vanished > 0) {
        this.vanished -= dt;
        // reaparece ao lado de alguém e já dá o bote
        if (this.vanished <= 0) {
          const t = this.target || this.pickTarget(g);
          if (t) {
            const a = Math.random() * 6.28;
            const nx = t.x + Math.cos(a) * 46, ny = t.y + Math.sin(a) * 30;
            const b = { x: nx - this.w / 2, y: ny - this.h, w: this.w, h: this.h };
            if (!G.Physics.blocked(g, b, this)) { this.x = nx; this.y = ny; }
          }
          g.particles.burst(this.x, this.y - 8, 20, { colors: ['#ffffff', '#c8dcf0'], speed: 50, life: 0.5 });
          this.state = 'windup'; this.stateT = 0.15;
        }
        return;
      }
      if (this.vanishCd <= 0 && this.state === 'chase' && !(this.burnT > 0)) {
        this.vanishCd = U.rand(5, 7);
        this.vanished = 1.4;
        g.particles.burst(this.x, this.y - 8, 24, { colors: ['#ffffff', '#c8dcf0'], speed: 60, life: 0.6 });
        G.Audio.sfx('wind');
        return;
      }
      super.think(dt, g);
    }
    die(g) {
      super.die(g);
      g.setFlag('alfa_dead', true);
      g.spawnPickup('dente_alfa', this.x, this.y, { flag: 'dente_alfa_drop' });
    }
    draw(ctx, cam, g) {
      if (this.vanished > 0) {
        if (Math.random() < 0.3) g.particles.add({ x: this.x + U.rand(-10, 10), y: this.y - U.rand(0, 10), vx: -30, life: 0.4, color: '#ffffff' });
        return;
      }
      super.draw(ctx, cam, g);
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - cam.ry);
      if (this.hp > 0) {
        ctx.fillStyle = '#1a1424'; ctx.fillRect(x - 16, y - 28, 32, 4);
        ctx.fillStyle = '#8ae8ff'; ctx.fillRect(x - 15, y - 27, Math.round(30 * this.hp / this.maxHp), 2);
      }
    }
  }
  ET.alpha = Alpha;

  // ---------------------------------------------------------------- GELÍDEO (pequeno, explode ao morrer)
  class Snowling extends ET.slime {
    constructor(o) {
      super(Object.assign({ color: ['#a8dcf4', '#ffffff', '#5a98c4'] }, o));
      this.type = 'snowling'; this.def = Object.assign({}, this.def, { type: 'snowling', weakFire: true, blood: ['#e8faff', '#a8dcf4'], deathColors: ['#ffffff', '#a8dcf4'] });
      this.maxHp = this.hp = Math.round(18 * (o.hpMul || 1)); this.dmg = 7; this.gold = 3;
      this.boom = 0;
    }
    die(g) {
      if (this.boom > 0 || this.deathT > 0) return;
      // pisca e explode em gelo
      this.boom = 0.6; this.hp = 0; this.held = false;
      G.Audio.sfx('charge');
    }
    update(dt, g) {
      if (this.boom > 0) {
        this.animT += dt; this.boom -= dt; this.flash = Math.floor(this.boom * 12) % 2 ? 0.05 : 0;
        if (this.boom <= 0) {
          G.Audio.sfx('freeze');
          g.particles.burst(this.x, this.y - 6, 26, { colors: ['#ffffff', '#a8dcf4', '#5a98c4'], speed: 80, life: 0.5 });
          g.particles.ring(this.x, this.y - 4, 3, 26, 0.35, '#c8f0ff', 2);
          for (const p of g.players) if (p && !p.isDown && U.dist(p.x, p.y, this.x, this.y) < 26) { const r = p.takeHit({ dmg: 6, src: this, dir: U.norm(p.x - this.x, p.y - this.y), kb: 90 }, g); if (r === 'hit') p.chillT = Math.max(p.chillT || 0, 2); }
          super.die(g);
        }
        return;
      }
      super.update(dt, g);
    }
  }
  ET.snowling = Snowling;

  // ---------------------------------------------------------------- ESPÍRITO DA NEVASCA (imune a espada; estilhaços que gelam)
  class IceWisp extends ET.wisp {
    constructor(o) {
      super(o);
      this.type = 'icewisp';
      this.def = Object.assign({}, this.def, { type: 'icewisp', weakFire: true, deathColors: ['#ffffff', '#a8dcf4', '#5a98c4'] });
      this.maxHp = this.hp = 22; this.gold = 4;
    }
    think(dt, g) {
      const t = this.target;
      this.phase += dt; this.cd -= dt;
      this.z = 8 + Math.sin(this.phase * 3) * 3;
      if (t) {
        const d = U.dist(this.x, this.y, t.x, t.y);
        const n = U.norm(t.x - this.x, t.y - this.y);
        const want = d > 90 ? 1 : d < 55 ? -1 : 0;
        G.Physics.move(g, this, (n.x * want * this.speed + Math.cos(this.phase * 2) * 15) * dt, (n.y * want * this.speed + Math.sin(this.phase * 2.3) * 15) * dt);
        if (this.cd <= 0 && d < 160) {
          this.cd = U.rand(2, 2.8);
          for (const off of [-0.2, 0, 0.2]) {
            const a = Math.atan2(n.y, n.x) + off;
            g.addEntity(new G.Combat.Projectile({ x: this.x, y: this.y, vx: Math.cos(a) * 110, vy: Math.sin(a) * 110, team: 'enemy', owner: this, dmg: 6, kind: 'icicle', life: 2, height: 12, r: 3, color: '#a8dcf4', color2: '#ffffff', light: 20, chill: 1.4 }));
          }
          G.Audio.sfx('freeze');
        }
      } else G.Physics.move(g, this, Math.cos(this.phase) * 12 * dt, Math.sin(this.phase * 0.7) * 10 * dt);
    }
    draw(ctx, cam, g) {
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - this.z - cam.ry - 6);
      P.shadow(ctx, x, Math.round(this.y - cam.ry), 8, 0.2);
      if (this.deathT > 0) ctx.globalAlpha = 1 - this.deathT / 0.35;
      const c = this.flash > 0 ? ['#ffffff', '#ffffff', '#ffffff'] : ['#5a98c4', '#c8f0ff', '#ffffff'];
      for (let i = 0; i < 4; i++) { const a = g.time * 3 + i * 1.57; ctx.fillStyle = c[1]; ctx.fillRect(Math.round(x + Math.cos(a) * 7), Math.round(y + 2 + Math.sin(a) * 4), 2, 2); }
      P.circle(ctx, x, y + 2, 5, c[0]); P.circle(ctx, x, y + 2, 4, c[1]); P.circle(ctx, x - 1, y + 1, 2, c[2]);
      ctx.fillStyle = '#1a2a4a'; ctx.fillRect(x - 2, y + 1, 1, 2); ctx.fillRect(x + 1, y + 1, 1, 2);
      ctx.globalAlpha = 1;
      g.lighting.add(this.x, this.y - this.z - 6, 40, 0.7, '#a8dcf4', 0.2);
      this.drawStatus(ctx, cam, g);
    }
  }
  ET.icewisp = IceWisp;

  // ---------------------------------------------------------------- MORCEGO DE CRISTAL (rasante)
  class CrystalBat extends ET.bat {
    constructor(o) { super(o); this.type = 'crystalbat'; this.def = Object.assign({}, this.def, { type: 'crystalbat' }); this.maxHp = this.hp = 14; this.dmg = 7; this.diveCd = U.rand(2, 3.5); this.dive = null; }
    think(dt, g) {
      const t = this.target;
      this.diveCd -= dt;
      if (this.dive) {
        this.dive.t -= dt;
        if (this.dive.wind > 0) { this.dive.wind -= dt; this.z = 10 + Math.sin(this.animT * 40) * 1; return; }
        G.Physics.move(g, this, this.dive.vx * dt, this.dive.vy * dt);
        if (this.dive.t <= 0) this.dive = null;
        return;
      }
      if (t && this.diveCd <= 0 && U.dist(this.x, this.y, t.x, t.y) < 110) {
        this.diveCd = U.rand(2.5, 4);
        const n = U.norm(t.x - this.x, t.y - this.y);
        this.dive = { vx: n.x * 210, vy: n.y * 210, t: 0.5, wind: 0.4 };
        this.state = 'windup'; this.stateT = 0;
        G.Audio.sfx('dash');
        return;
      }
      if (this.state === 'windup') this.state = 'chase';
      super.think(dt, g);
    }
    draw(ctx, cam, g) {
      P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, 8, 0.2);
      this.drawSprite(ctx, cam, g, S().crystalBat, Math.floor(this.animT * (this.dive ? 18 : 10)) % 2);
      g.lighting.add(this.x, this.y - 12, 24, 0.4, '#8ad0f0', 0.12);
      this.drawStatus(ctx, cam, g);
    }
  }
  ET.crystalbat = CrystalBat;

  // ---------------------------------------------------------------- ARANHA DE CRISTAL (teia)
  class Spider extends E {
    constructor(o) {
      super(o, { type: 'spider', hp: 30, speed: 46, dmg: 9, contact: true, aggro: 130, weakFire: true, box: { w: 12, h: 7, hw: 16, hh: 11 }, gold: 5, drops: { coin: 0.8, heart: 0.2 }, blood: ['#c8f0ff', '#6aa0c8'] });
      this.cd = U.rand(1, 2); this.hopCd = U.rand(1.5, 3); this.hop = null;
    }
    think(dt, g) {
      const t = this.target;
      this.cd -= dt; this.hopCd -= dt;
      if (this.hop) {
        this.hop.t -= dt; this.z = Math.sin((1 - this.hop.t / 0.45) * Math.PI) * 12;
        G.Physics.move(g, this, this.hop.vx * dt, this.hop.vy * dt);
        if (this.hop.t <= 0) { this.hop = null; this.z = 0; }
        return;
      }
      if (this.state === 'windup') {
        if (this.stateT > 0.5) {
          if (t) {
            const n = U.norm(t.x - this.x, t.y - this.y);
            const pr = new G.Combat.Projectile({ x: this.x, y: this.y, vx: n.x * 120, vy: n.y * 120, team: 'enemy', owner: this, dmg: 4, kind: 'web', life: 1.6, height: 8, r: 4, color: '#e8ecf8', color2: '#ffffff', light: 0, trail: false, size: 2, chill: 2.6 });
            g.addEntity(pr);
            G.Audio.sfx('slime');
          }
          this.state = 'chase'; this.stateT = 0; this.cd = U.rand(2, 3);
        }
        return;
      }
      if (t) {
        this.state = 'chase';
        const d = U.dist(this.x, this.y, t.x, t.y);
        if (this.cd <= 0 && d < 130 && d > 30) { this.state = 'windup'; this.stateT = 0; this.facing = t.x < this.x ? -1 : 1; return; }
        if (this.hopCd <= 0) {
          this.hopCd = U.rand(2, 3.5);
          const a = Math.atan2(t.y - this.y, t.x - this.x) + U.rand(-1.2, 1.2);
          this.hop = { vx: Math.cos(a) * 110, vy: Math.sin(a) * 110, t: 0.45 };
          return;
        }
        this.moveToward(g, t.x, t.y, this.speed, dt);
      } else { this.state = 'idle'; this.wander(dt, g, 20); }
    }
    draw(ctx, cam, g) {
      P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, 16, 0.3);
      const f = this.state === 'windup' ? 2 : Math.floor(this.animT * 10) % 2;
      this.drawSprite(ctx, cam, g, S().spider, f);
      g.lighting.add(this.x, this.y - 6, 22, 0.4, '#8ad0f0', 0.1);
      this.drawStatus(ctx, cam, g);
    }
  }
  ET.spider = Spider;

  // ---------------------------------------------------------------- CAVALEIRO CONGELADO
  class Knight extends E {
    constructor(o, def) {
      super(o, Object.assign({ type: 'knight', hp: 56, speed: 30, dmg: 14, aggro: 120, box: { w: 12, h: 7, hw: 14, hh: 22 }, gold: 8, drops: { coin: 0.9, heart: 0.3 }, blood: ['#c8d8ec', '#ffffff'], deathColors: ['#c8d8ec', '#8a9cb4', '#a8dcf4'] }, def || {}));
      this.gdir = { x: 0, y: 1 }; this.cd = 1; this.armor = o.armor === false ? 0 : 1;
      this.thrust = null;
    }
    checkGuard(hit, g) {
      if (this.stunned || this.frozen || this.held || !hit.dir) return false;
      if (hit.kind === 'heavy') { this.stun(2.2, g); g.particles.text(this.x, this.y - 34, 'Guarda quebrada!', '#ffe680'); return false; }
      if (hit.kind === 'special' || hit.kind === 'fire' || hit.kind === 'impact' || hit.kind === 'beam') return false;
      const dot = -(hit.dir.x * this.gdir.x + hit.dir.y * this.gdir.y);
      if (dot > 0.35) {
        G.Audio.sfx('block'); this.flash = 0.05;
        if (!this._gTxt || g.time - this._gTxt > 1.2) { this._gTxt = g.time; g.particles.text(this.x, this.y - 34, 'BLOQUEADO', '#c8c8d8'); }
        return true;
      }
      return false;
    }
    modifyDamage(d, hit, g) {
      if (this.armor > 0) {
        if (hit.kind === 'fire') {
          this.armor = 0;
          g.particles.burst(this.x, this.y - 12, 20, { colors: ['#a8dcf4', '#ffffff'], speed: 60, life: 0.6 });
          g.particles.text(this.x, this.y - 40, 'Armadura derretida!', '#ffb84a');
          if (!g.flag('tut_knight')) { g.setFlag('tut_knight', true); g.toast('Fogo derrete o gelo da armadura dos cavaleiros. Sem ela, eles sentem tudo!', 4); }
          return d;
        }
        if (!this._aTxt || g.time - this._aTxt > 1.2) { this._aTxt = g.time; g.particles.text(this.x, this.y - 40, 'Armadura de gelo', '#a8dcf4'); }
        return d * 0.35;
      }
      return d;
    }
    think(dt, g) {
      const t = this.target;
      this.cd -= dt;
      if (t && this.state !== 'attack' && this.state !== 'windup' && this.state !== 'thrust') {
        const n = U.norm(t.x - this.x, t.y - this.y);
        this.gdir = U.norm(U.lerp(this.gdir.x, n.x, dt * 2.2), U.lerp(this.gdir.y, n.y, dt * 2.2));
        this.facing = this.gdir.x < 0 ? -1 : 1;
      }
      if (this.state === 'windup') {
        if (this.stateT > 0.6) {
          if (this.useThrust) {
            this.state = 'thrust'; this.stateT = 0; this.thrustHit = false;
            G.Audio.sfx('dash');
          } else {
            this.state = 'attack'; this.stateT = 0;
            G.Audio.sfx('heavySwing');
            G.Combat.hitPlayersCircle(g, this.x + this.gdir.x * 16, this.y - 6 + this.gdir.y * 12, 16, { dmg: this.dmg, src: this, dir: this.gdir, kb: 130 });
            g.particles.ring(this.x + this.gdir.x * 16, this.y - 6 + this.gdir.y * 12, 4, 16, 0.25, '#c8d8ec', 1);
          }
        }
        return;
      }
      if (this.state === 'thrust') {
        const r = G.Physics.move(g, this, this.gdir.x * 200 * dt, this.gdir.y * 200 * dt);
        if (!this.thrustHit) for (const p of g.players) {
          if (!p || p.isDown) continue;
          if (U.rectsOverlap(this.hurtBox, p.hurtBox)) { p.takeHit({ dmg: this.dmg, src: this, dir: this.gdir, kb: 150 }, g); this.thrustHit = true; }
        }
        if (this.stateT > 0.3 || r.hitX || r.hitY) { this.state = 'attack'; this.stateT = 0.2; }
        return;
      }
      if (this.state === 'attack') { if (this.stateT > 0.7) { this.state = 'chase'; this.stateT = 0; this.cd = U.rand(0.8, 1.4); } return; }
      if (t) {
        this.state = 'chase';
        const d = U.dist(this.x, this.y, t.x, t.y);
        if (this.cd <= 0 && d < 26) { this.state = 'windup'; this.stateT = 0; this.useThrust = false; return; }
        if (this.cd <= 0 && d < 80 && d > 40 && Math.random() < 0.02) { this.state = 'windup'; this.stateT = 0; this.useThrust = true; return; }
        if (d > 20) this.moveToward(g, t.x, t.y, this.speed, dt);
      } else { this.state = 'idle'; this.wander(dt, g, 16); }
    }
    sprites() { return this.armor > 0 ? S().knight : S().knightBare; }
    draw(ctx, cam, g) {
      P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, 16, 0.3);
      let f = this.state === 'chase' || this.wanderDir ? Math.floor(this.animT * 4) % 2 : 0;
      if (this.state === 'windup' || this.state === 'attack' || this.state === 'thrust') f = 2;
      if (this.stunned || this.frozen) f = 0;
      this.drawSprite(ctx, cam, g, this.sprites(), f);
      if (!this.stunned && !this.frozen && this.deathT <= 0 && this.gdir.y > -0.5) {
        const sx = Math.round(this.x + this.gdir.x * 8 - cam.rx), sy = Math.round(this.y - 11 + this.gdir.y * 3 - cam.ry);
        P.circle(ctx, sx, sy, 5, '#1a2230'); P.circle(ctx, sx, sy, 4, this.armor ? '#8ad0f0' : '#6a7a90'); ctx.fillStyle = '#ffffff'; ctx.fillRect(sx - 1, sy - 2, 2, 2);
      }
      if (this.state === 'windup' && this.useThrust) { ctx.globalAlpha = 0.3; P.line(ctx, this.x - cam.rx, this.y - 6 - cam.ry, this.x + this.gdir.x * 60 - cam.rx, this.y - 6 + this.gdir.y * 60 - cam.ry, '#ff6a4a'); ctx.globalAlpha = 1; }
      this.drawStatus(ctx, cam, g);
    }
  }
  ET.knight = Knight;

  // ---------------------------------------------------------------- CAVALEIRO DO VAZIO (teleporta)
  class VoidKnight extends Knight {
    constructor(o) {
      super(Object.assign({ armor: false }, o), { type: 'voidknight', hp: 70, speed: 36, dmg: 15, aggro: 150, gold: 10, deathColors: ['#c8a8ff', '#4a3a8a', '#ffffff'], blood: ['#c8a8ff', '#2a2050'] });
      this.armor = 0; this.blinkCd = U.rand(2, 4);
    }
    sprites() { return S().voidKnight; }
    think(dt, g) {
      this.blinkCd -= dt;
      if (this.blinkCd <= 0 && this.state === 'chase' && !this.busy) {
        this.blinkCd = U.rand(3.5, 5.5);
        const li = g.players[0] && !g.players[0].isDown ? g.players[0] : this.target;
        if (li) {
          for (let k = 0; k < 8; k++) {
            const a = Math.random() * 6.28, nx = li.x + Math.cos(a) * 30, ny = li.y + Math.sin(a) * 20;
            const b = { x: nx - this.w / 2, y: ny - this.h, w: this.w, h: this.h };
            if (G.Physics.blocked(g, b, this) || g.level.isHole(Math.floor(nx / 16), Math.floor((ny - 2) / 16))) continue;
            g.particles.burst(this.x, this.y - 12, 16, { colors: ['#c8a8ff', '#2a2050'], speed: 40, life: 0.4 });
            this.x = nx; this.y = ny; this.target = li;
            G.Audio.sfx('teleport');
            g.particles.burst(this.x, this.y - 12, 16, { colors: ['#c8a8ff', '#2a2050'], speed: 40, life: 0.4 });
            this.state = 'windup'; this.stateT = 0.1; this.useThrust = false;
            this.gdir = U.norm(li.x - this.x, li.y - this.y);
            break;
          }
        }
        return;
      }
      super.think(dt, g);
    }
  }
  ET.voidknight = VoidKnight;

  // ---------------------------------------------------------------- ESTRELINHA CADENTE (persegue e explode)
  class Starling extends E {
    constructor(o) {
      super(o, { type: 'starling', hp: 10, speed: 70, dmg: 8, aggro: 200, box: { w: 8, h: 6, hw: 12, hh: 16 }, gold: 2, drops: { coin: 0.5, mana: 0.3 }, deathColors: ['#f2d98c', '#ffffff', '#c8a8ff'], noFreeze: false });
      this.flying = true; this.z = 10; this.phase = Math.random() * 6; this.fuse = 0;
    }
    think(dt, g) {
      const t = this.target;
      this.phase += dt;
      this.z = 10 + Math.sin(this.phase * 5) * 3;
      if (this.fuse > 0) {
        this.fuse -= dt;
        if (this.fuse <= 0) {
          G.Audio.sfx('explosion');
          g.particles.burst(this.x, this.y - 8, 30, { colors: ['#f2d98c', '#ffffff', '#ff8a3a'], speed: 90, life: 0.5, glow: true });
          G.Combat.hitPlayersCircle(g, this.x, this.y - 4, 24, { dmg: this.dmg, src: this, dir: { x: 0, y: 1 }, kb: 120 });
          this.hp = 0; this.deathT = 0.001; this.dead = true; g.onEnemyKilled(this);
        }
        return;
      }
      if (t) {
        const d = U.dist(this.x, this.y, t.x, t.y);
        const n = U.norm(t.x - this.x, t.y - this.y);
        const sw = Math.sin(this.phase * 4) * 30;
        G.Physics.move(g, this, (n.x * this.speed - n.y * sw) * dt, (n.y * this.speed + n.x * sw) * dt);
        this.facing = n.x < 0 ? -1 : 1;
        if (d < 16) { this.fuse = 0.45; G.Audio.sfx('charge'); }
      } else G.Physics.move(g, this, Math.cos(this.phase) * 16 * dt, Math.sin(this.phase * 1.3) * 12 * dt);
    }
    draw(ctx, cam, g) {
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - this.z - cam.ry - 6);
      P.shadow(ctx, x, Math.round(this.y - cam.ry), 8, 0.2);
      if (this.deathT > 0) ctx.globalAlpha = 1 - this.deathT / 0.35;
      const white = this.flash > 0 || (this.fuse > 0 && Math.floor(this.fuse * 16) % 2);
      const col = white ? '#ffffff' : '#f2d98c';
      const a = g.time * 6;
      for (let i = 0; i < 5; i++) { const aa = a + (i / 5) * 6.28; P.line(ctx, x, y, x + Math.cos(aa) * 6, y + Math.sin(aa) * 6, col); }
      P.circle(ctx, x, y, 3, col); ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 1, y - 1, 2, 2);
      ctx.globalAlpha = 1;
      g.lighting.add(this.x, this.y - this.z - 6, 36, 0.8, '#f2d98c', 0.25);
      if (Math.random() < 0.5) g.particles.add({ x: this.x, y: this.y - this.z - 6, vx: U.rand(-10, 10), vy: U.rand(-10, 10), life: 0.4, color: '#f2d98c', glow: true });
      this.drawStatus(ctx, cam, g);
    }
  }
  ET.starling = Starling;

  // ---------------------------------------------------------------- SENTINELA PRISMÁTICA (torre fixa que atira feixes)
  class Sentry extends E {
    constructor(o) {
      super(o, { type: 'sentry', hp: 44, speed: 0, dmg: 12, aggro: 170, heavyBody: true, noFreeze: false, box: { w: 14, h: 10, hw: 16, hh: 26 }, gold: 8, drops: { coin: 1, mana: 0.5 }, deathColors: ['#f2d98c', '#c8a8ff', '#ffffff'] });
      this.solid = true; this.cd = U.rand(1.5, 2.5); this.aim = null;
    }
    modifyDamage(d, hit) { if (hit.kind === 'bolt') return d * 0.5; if (hit.kind === 'beamshot') return d * 3; return d; }
    think(dt, g) {
      const t = this.target;
      this.cd -= dt;
      if (this.state === 'windup') {
        if (t) this.aim = U.norm(t.x - this.x, t.y - this.y);
        if (this.stateT > 0.9) {
          const n = this.aim || { x: 0, y: 1 };
          const pr = new G.Combat.Projectile({ x: this.x + n.x * 10, y: this.y + n.y * 6, vx: n.x * 170, vy: n.y * 170, team: 'enemy', owner: this, dmg: this.dmg, kind: 'orb', life: 2.2, height: 18, r: 5, color: '#ffe680', color2: '#ffffff', light: 40, size: 3 });
          pr.onReflectKind = 'beamshot';
          g.addEntity(pr);
          G.Audio.sfx('beam');
          this.state = 'idle'; this.stateT = 0; this.cd = U.rand(2, 3);
        }
        return;
      }
      if (t && this.cd <= 0 && U.dist(this.x, this.y, t.x, t.y) < 170) { this.state = 'windup'; this.stateT = 0; }
    }
    draw(ctx, cam, g) {
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - cam.ry);
      P.shadow(ctx, x, y, 18, 0.35);
      const white = this.flash > 0;
      if (this.deathT > 0) ctx.globalAlpha = 1 - this.deathT / 0.35;
      ctx.fillStyle = '#1e1a30'; ctx.fillRect(x - 8, y - 8, 16, 8);
      ctx.fillStyle = white ? '#fff' : '#4a4680'; ctx.fillRect(x - 7, y - 8, 14, 6);
      for (let j = 0; j < 18; j++) { const w = Math.max(1, Math.round((18 - j) / 3)); ctx.fillStyle = white ? '#fff' : j % 4 ? '#8a7ad8' : '#c8b8ff'; ctx.fillRect(x - w, y - 8 - j, w * 2, 1); }
      const k = this.state === 'windup' ? this.stateT / 0.9 : 0;
      P.circle(ctx, x, y - 20, 3 + Math.round(k * 3), this.state === 'windup' ? '#ffe680' : '#6a66a8');
      ctx.globalAlpha = 1;
      if (this.state === 'windup' && this.aim) {
        ctx.globalAlpha = 0.25 + k * 0.4;
        P.line(ctx, x, y - 18, x + this.aim.x * 160, y - 18 + this.aim.y * 160, '#ff6a4a');
        ctx.globalAlpha = 1;
      }
      g.lighting.add(this.x, this.y - 20, 30 + k * 30, 0.7, '#ffe680', 0.15 + k * 0.2);
      this.drawStatus(ctx, cam, g);
    }
  }
  ET.sentry = Sentry;
})();
