// Tipos de inimigos comuns. Cada um ensina algo diferente sobre cooperação.
(function () {
  const U = G.U, P = G.Pixel, E = G.Enemy, ET = G.EnemyTypes;
  const S = () => G.Sprites;

  // ---------------------------------------------------------------- GOSMA (pequeno)
  class Slime extends E {
    constructor(o) {
      super(o, { type: 'slime', hp: 14, speed: 40, dmg: 6, contact: true, aggro: 95, box: { w: 10, h: 6, hw: 12, hh: 10 }, gold: 2, blood: ['#7ae07a', '#c8ffc8'], deathColors: ['#7ae07a', '#c8ffc8', '#3a8a4a'] });
      this.color = o.color || (o.variant === 'cave' ? ['#8a5ad8', '#b88aff', '#4a2a7a'] : ['#5ac86a', '#9af0a0', '#2a7a3a']);
      if (o.variant === 'cave') { this.def.blood = ['#b88aff', '#ffffff']; this.def.deathColors = ['#b88aff', '#ffffff', '#4a2a7a']; }
      this.hopT = U.rand(0, 1); this.hopping = false; this.vz = 0;
    }
    think(dt, g) {
      this.hopT -= dt;
      if (this.hopping) {
        this.vz -= 500 * dt; this.z += this.vz * dt;
        if (this.target) this.moveToward(g, this.target.x, this.target.y, 85, dt);
        else if (this.wanderDir) G.Physics.move(g, this, this.wanderDir.x * 50 * dt, this.wanderDir.y * 50 * dt);
        if (this.z <= 0) { this.z = 0; this.hopping = false; this.hopT = U.rand(0.5, 0.9); G.Audio.sfx('slime'); }
        return;
      }
      if (this.hopT <= 0) {
        this.hopping = true; this.vz = 110;
        if (!this.target) this.wanderDir = Math.random() < 0.7 ? U.norm(this.home.x + U.rand(-30, 30) - this.x, this.home.y + U.rand(-20, 20) - this.y) : null;
      }
    }
    draw(ctx, cam, g) {
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - cam.ry);
      P.shadow(ctx, x, y, 12, 0.3);
      const squash = this.hopping ? -1 : (this.hopT < 0.15 ? 2 : Math.round(Math.sin(this.animT * 4)));
      const rx = 6 + Math.max(0, squash), ry = 5 - squash;
      const by = y - ry - 1 - Math.round(this.z);
      if (this.deathT > 0) ctx.globalAlpha = 1 - this.deathT / 0.35;
      const c = this.flash > 0 ? ['#ffffff', '#ffffff', '#ffffff'] : this.color;
      P.ellipse(ctx, x, by + 1, rx + 1, ry + 1, '#1a1424');
      P.ellipse(ctx, x, by, rx, ry, c[0]);
      P.ellipse(ctx, x - 2, by - 2, Math.max(1, rx - 4), Math.max(1, ry - 3), c[1]);
      ctx.fillStyle = c[2]; ctx.fillRect(x - rx + 1, by + ry - 1, rx * 2 - 1, 1);
      ctx.fillStyle = '#1a1424'; ctx.fillRect(x - 3, by - 1, 1, 2); ctx.fillRect(x + 2, by - 1, 1, 2);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 3, by - 1, 1, 1); ctx.fillRect(x + 2, by - 1, 1, 1);
      ctx.globalAlpha = 1;
      this.drawStatus(ctx, cam, g);
    }
  }
  ET.slime = Slime;

  // ---------------------------------------------------------------- LOBO (rápido)
  class Wolf extends E {
    constructor(o, def) {
      super(o, Object.assign({ type: 'wolf', hp: 22, speed: 68, dmg: 9, aggro: 125, box: { w: 14, h: 6, hw: 18, hh: 12 }, gold: 3, blood: ['#ffffff', '#c8c0d8'] }, def || {}));
      this.set = () => S().wolf;
      this.lungeV = null;
      this.cd = U.rand(0.5, 1.5);
    }
    think(dt, g) {
      const t = this.target;
      this.cd -= dt;
      if (this.state === 'windup') {
        if (t) this.facing = t.x < this.x ? -1 : 1;
        if (this.stateT > (this.def.windup || 0.45)) {
          const n = t ? U.norm(t.x - this.x, t.y - this.y) : { x: this.facing, y: 0 };
          this.lungeV = { x: n.x * (this.def.lunge || 190), y: n.y * (this.def.lunge || 190) };
          this.state = 'attack'; this.stateT = 0; this.hitDone = false;
          G.Audio.sfx('dash');
        }
        return;
      }
      if (this.state === 'attack') {
        const r = G.Physics.move(g, this, this.lungeV.x * dt, this.lungeV.y * dt);
        if (!this.hitDone) {
          for (const p of g.players) {
            if (!p || p.isDown) continue;
            if (U.rectsOverlap(this.hurtBox, p.hurtBox)) {
              p.takeHit({ dmg: this.dmg, src: this, dir: U.norm(this.lungeV.x, this.lungeV.y), kb: 120 }, g);
              this.hitDone = true;
            }
          }
        }
        if (this.stateT > 0.3 || r.hitX || r.hitY) { this.state = 'recover'; this.stateT = 0; }
        return;
      }
      if (this.state === 'recover') { if (this.stateT > (this.def.recover || 0.6)) { this.state = 'chase'; this.stateT = 0; this.cd = U.rand(0.3, 0.9); } return; }
      if (t) {
        this.state = 'chase';
        const d = U.dist(this.x, this.y, t.x, t.y);
        if (d < 56 && this.cd <= 0) { this.state = 'windup'; this.stateT = 0; return; }
        // circula um pouco em vez de ir reto
        const side = Math.sin(this.animT * 1.3 + this.uid) * 0.6;
        const n = U.norm(t.x - this.x, t.y - this.y);
        const tx = this.x + (n.x - n.y * side) * 20, ty = this.y + (n.y + n.x * side) * 20;
        if (d > 30) this.moveToward(g, tx, ty, this.speed, dt);
      } else { this.state = 'idle'; this.wander(dt, g, 30); }
    }
    draw(ctx, cam, g) {
      P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, 18, 0.3);
      const moving = this.state === 'chase' || (this.state === 'idle' && this.wanderDir);
      let f = moving ? Math.floor(this.animT * 8) % 2 : 0;
      if (this.state === 'attack' || this.state === 'windup') f = 2;
      const oy = this.state === 'windup' ? 1 : 0;
      this.drawSprite(ctx, cam, g, this.set(), f, oy);
      this.drawStatus(ctx, cam, g);
    }
  }
  ET.wolf = Wolf;

  // ---------------------------------------------------------------- LOBO CINZENTO (elite, missão)
  class GreyWolf extends Wolf {
    constructor(o) {
      super(o, { type: 'greywolf', hp: 110, speed: 78, dmg: 13, aggro: 140, lunge: 230, windup: 0.4, recover: 0.5, gold: 30, drops: { coin: 1, heart: 1 }, box: { w: 16, h: 7, hw: 22, hh: 14 } });
      this.set = () => S().greyWolf;
      this.howled = false;
      this.elite = true;
    }
    onDamaged(hit, g) {
      if (!this.howled && this.hp < this.maxHp * 0.5) {
        this.howled = true;
        G.Audio.sfx('howl');
        g.camera.shake(2, 0.5);
        g.particles.text(this.x, this.y - 30, 'AUUUU!', '#ff9a6a');
        for (const off of [-30, 30]) {
          const w = new Wolf({ x: this.x + off, y: this.y + 10 });
          w.aggro = true;
          g.addEntity(w);
          g.particles.burst(w.x, w.y - 6, 12, { color: '#5a5468', speed: 40, life: 0.5 });
        }
      }
    }
    draw(ctx, cam, g) {
      super.draw(ctx, cam, g);
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - cam.ry);
      if (this.hp > 0) {
        ctx.fillStyle = '#1a1424'; ctx.fillRect(x - 16, y - 26, 32, 4);
        ctx.fillStyle = '#ff8a4a'; ctx.fillRect(x - 15, y - 25, Math.round(30 * this.hp / this.maxHp), 2);
      }
    }
  }
  ET.greywolf = GreyWolf;

  // ---------------------------------------------------------------- MORCEGO (voador rápido)
  class Bat extends E {
    constructor(o) {
      super(o, { type: 'bat', hp: 8, speed: 62, dmg: 5, contact: true, aggro: 110, box: { w: 8, h: 6, hw: 12, hh: 18 }, gold: 1, drops: { coin: 0.4, heart: 0.1 }, blood: ['#b88aff', '#fff'] });
      this.flying = true; this.z = 10; this.phase = Math.random() * 6;
    }
    think(dt, g) {
      const t = this.target;
      this.phase += dt;
      if (t) {
        const sw = Math.sin(this.phase * 5) * 40;
        const n = U.norm(t.x - this.x, t.y - this.y);
        G.Physics.move(g, this, (n.x * this.speed - n.y * sw) * dt, (n.y * this.speed + n.x * sw) * dt);
        this.facing = n.x < 0 ? -1 : 1;
      } else {
        G.Physics.move(g, this, Math.cos(this.phase) * 20 * dt, Math.sin(this.phase * 1.3) * 14 * dt);
      }
      this.z = 10 + Math.sin(this.phase * 6) * 3;
    }
    draw(ctx, cam, g) {
      P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, 8, 0.2);
      this.drawSprite(ctx, cam, g, S().bat, Math.floor(this.animT * 10) % 2);
      this.drawStatus(ctx, cam, g);
    }
  }
  ET.bat = Bat;

  // ---------------------------------------------------------------- ESQUELETO COM ESCUDO (resistente)
  class Skeleton extends E {
    constructor(o) {
      super(o, { type: 'skeleton', hp: 30, speed: 34, dmg: 12, aggro: 115, box: { w: 10, h: 6, hw: 12, hh: 20 }, gold: 4, drops: { coin: 0.8, heart: 0.2 }, blood: ['#e8e0d0', '#ffffff'], deathColors: ['#e8e0d0', '#ffffff', '#8a8070'] });
      this.gdir = { x: 0, y: 1 };
      this.cd = 0.8;
    }
    checkGuard(hit, g) {
      if (this.stunned || this.frozen || this.held || !hit.dir) return false;
      if (hit.kind === 'heavy') { this.stun(2.2, g); g.particles.text(this.x, this.y - 32, 'Guarda quebrada!', '#ffe680'); return false; }
      if (hit.kind === 'special') return false;
      const dot = -(hit.dir.x * this.gdir.x + hit.dir.y * this.gdir.y);
      if (dot > 0.35) {
        G.Audio.sfx('block');
        this.flash = 0.05;
        g.particles.burst(this.x + this.gdir.x * 8, this.y - 12, 6, { colors: ['#ffffff', '#ffe680'], speed: 40, life: 0.2 });
        if (!this._gTxt || g.time - this._gTxt > 1.2) { this._gTxt = g.time; g.particles.text(this.x, this.y - 32, 'BLOQUEADO', '#c8c8d8'); }
        if (!g.flag('tut_skel')) { g.setFlag('tut_skel', true); g.bubble(g.players[0], 'O escudo bloqueia de frente. Ataque pelas costas — ou quebre a guarda!', 3.5); }
        return true;
      }
      return false;
    }
    think(dt, g) {
      const t = this.target;
      this.cd -= dt;
      if (t && this.state !== 'attack' && this.state !== 'windup') {
        const n = U.norm(t.x - this.x, t.y - this.y);
        // gira devagar para o alvo (dá tempo de flanquear)
        this.gdir = U.norm(U.lerp(this.gdir.x, n.x, dt * 2.5), U.lerp(this.gdir.y, n.y, dt * 2.5));
        this.facing = this.gdir.x < 0 ? -1 : 1;
      }
      if (this.state === 'windup') {
        if (this.stateT > 0.55) {
          this.state = 'attack'; this.stateT = 0;
          G.Audio.sfx('swing');
          G.Combat.hitPlayersCircle(g, this.x + this.gdir.x * 14, this.y - 6 + this.gdir.y * 10, 13, { dmg: this.dmg, src: this, dir: this.gdir, kb: 110 });
        }
        return;
      }
      if (this.state === 'attack') { if (this.stateT > 0.6) { this.state = 'chase'; this.stateT = 0; this.cd = U.rand(0.6, 1.2); } return; }
      if (t) {
        this.state = 'chase';
        const d = U.dist(this.x, this.y, t.x, t.y);
        if (d < 24 && this.cd <= 0) { this.state = 'windup'; this.stateT = 0; return; }
        if (d > 18) this.moveToward(g, t.x, t.y, this.speed, dt);
      } else { this.state = 'idle'; this.wander(dt, g, 20); }
    }
    draw(ctx, cam, g) {
      P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, 14, 0.3);
      let f = this.state === 'chase' || this.wanderDir ? Math.floor(this.animT * 5) % 2 : 0;
      if (this.state === 'windup' || this.state === 'attack') f = 2;
      if (this.stunned || this.frozen) f = 0;
      this.drawSprite(ctx, cam, g, S().skeleton, f);
      // indicador do escudo
      if (!this.stunned && !this.frozen && this.deathT <= 0) {
        const sx = Math.round(this.x + this.gdir.x * 7 - cam.rx), sy = Math.round(this.y - 10 + this.gdir.y * 3 - cam.ry);
        if (this.gdir.y < -0.5) { /* escudo atrás */ } else {
          P.circle(ctx, sx, sy, 4, '#2a2433'); P.circle(ctx, sx, sy, 3, '#8c6c48'); ctx.fillStyle = '#c6ceda'; ctx.fillRect(sx - 1, sy - 1, 2, 2);
        }
      }
      this.drawStatus(ctx, cam, g);
    }
  }
  ET.skeleton = Skeleton;

  // ---------------------------------------------------------------- ARQUEIRO (à distância)
  class Archer extends E {
    constructor(o) {
      super(o, { type: 'archer', hp: 16, speed: 40, dmg: 8, aggro: 160, prefersMage: true, box: { w: 10, h: 6, hw: 12, hh: 20 }, gold: 4, drops: { coin: 0.8, heart: 0.15 }, blood: ['#e8e0d0', '#ffffff'], deathColors: ['#e8e0d0', '#ffffff', '#8a8070'] });
      this.cd = U.rand(1, 2);
    }
    think(dt, g) {
      const t = this.target;
      this.cd -= dt;
      if (this.state === 'windup') {
        if (t) this.facing = t.x < this.x ? -1 : 1;
        if (this.stateT > 0.7) {
          if (t) {
            const n = U.norm(t.x - this.x, t.y - 2 - this.y);
            g.addEntity(new G.Combat.Projectile({ x: this.x + n.x * 8, y: this.y + n.y * 6, vx: n.x * 150, vy: n.y * 150, team: 'enemy', owner: this, dmg: this.dmg, kind: 'arrow', life: 1.8, height: 12, r: 3, light: 0, trail: false, kb: 70 }));
            G.Audio.sfx('swing');
          }
          this.state = 'chase'; this.stateT = 0; this.cd = U.rand(1.4, 2.2);
        }
        return;
      }
      if (t) {
        this.state = 'chase';
        const d = U.dist(this.x, this.y, t.x, t.y);
        if (d < 70) this.moveToward(g, this.x - (t.x - this.x), this.y - (t.y - this.y), this.speed, dt);
        else if (d > 120) this.moveToward(g, t.x, t.y, this.speed, dt);
        else this.facing = t.x < this.x ? -1 : 1;
        if (this.cd <= 0 && d < 170) { this.state = 'windup'; this.stateT = 0; }
      } else { this.state = 'idle'; this.wander(dt, g, 20); }
    }
    draw(ctx, cam, g) {
      P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, 14, 0.3);
      let f = this.state === 'windup' ? 2 : 0;
      this.drawSprite(ctx, cam, g, S().archer, f);
      this.drawStatus(ctx, cam, g);
    }
  }
  ET.archer = Archer;

  // ---------------------------------------------------------------- FOGO-FÁTUO (mágico, imune a espada)
  class Wisp extends E {
    constructor(o) {
      super(o, { type: 'wisp', hp: 16, speed: 30, dmg: 7, aggro: 130, immune: ['physical'], box: { w: 8, h: 6, hw: 12, hh: 22 }, gold: 3, drops: { coin: 0.6, mana: 0.5 }, blood: ['#8ae8ff', '#ffffff'], deathColors: ['#8ae8ff', '#c8a8ff', '#ffffff'] });
      this.flying = true; this.phase = Math.random() * 6; this.cd = U.rand(1.5, 2.5); this.z = 8;
      this.hue = o.hue || 'blue';
    }
    takeHit(hit, g) {
      // congelado, a espada estilhaça
      if (this.frozen && (hit.kind === 'sword')) { hit = Object.assign({}, hit, { kind: 'heavy' }); }
      return super.takeHit(hit, g);
    }
    onImmune(hit, g) {
      if (!g.flag('tut_wisp')) { g.setFlag('tut_wisp', true); g.bubble(g.players[1], 'A espada atravessa! Lirien, congela ele pra mim?', 3.5); }
    }
    think(dt, g) {
      const t = this.target;
      this.phase += dt;
      this.cd -= dt;
      this.z = 8 + Math.sin(this.phase * 3) * 3;
      if (t) {
        const d = U.dist(this.x, this.y, t.x, t.y);
        const n = U.norm(t.x - this.x, t.y - this.y);
        const want = d > 80 ? 1 : d < 50 ? -1 : 0;
        G.Physics.move(g, this, (n.x * want * this.speed + Math.cos(this.phase * 2) * 15) * dt, (n.y * want * this.speed + Math.sin(this.phase * 2.3) * 15) * dt);
        if (this.cd <= 0 && d < 150) {
          this.cd = U.rand(2, 2.8);
          g.addEntity(new G.Combat.Projectile({ x: this.x, y: this.y, vx: n.x * 85, vy: n.y * 85, team: 'enemy', owner: this, dmg: this.dmg, kind: 'orb', life: 2.5, height: 12, r: 4, color: '#8ae8ff', color2: '#c8a8ff', light: 30, size: 2, homing: 0.6, target: t }));
          G.Audio.sfx('bolt');
        }
      } else G.Physics.move(g, this, Math.cos(this.phase) * 12 * dt, Math.sin(this.phase * 0.7) * 10 * dt);
    }
    draw(ctx, cam, g) {
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - this.z - cam.ry - 6);
      P.shadow(ctx, x, Math.round(this.y - cam.ry), 8, 0.2);
      if (this.deathT > 0) ctx.globalAlpha = 1 - this.deathT / 0.35;
      const c = this.flash > 0 ? ['#ffffff', '#ffffff', '#ffffff'] : ['#3a6ad8', '#8ae8ff', '#e8fbff'];
      const t = g.time * 10 + this.phase;
      for (let i = 0; i < 5; i++) {
        const h = 4 + ((Math.sin(t + i * 1.4) + 1) * 3) | 0;
        ctx.fillStyle = c[0]; ctx.fillRect(x - 5 + i * 2, y - h + 2, 2, h);
      }
      P.circle(ctx, x, y + 2, 5, c[0]); P.circle(ctx, x, y + 2, 4, c[1]); P.circle(ctx, x - 1, y + 1, 2, c[2]);
      ctx.fillStyle = '#1a1a4a'; ctx.fillRect(x - 2, y + 1, 1, 2); ctx.fillRect(x + 1, y + 1, 1, 2);
      ctx.globalAlpha = 1;
      g.lighting.add(this.x, this.y - this.z - 6, 46, 0.8, '#6ab8ff', 0.25);
      if (Math.random() < 0.3) g.particles.add({ x: this.x + U.rand(-3, 3), y: this.y - this.z - 8, vy: -15, life: 0.5, color: '#8ae8ff', glow: true });
      this.drawStatus(ctx, cam, g);
    }
  }
  ET.wisp = Wisp;

  // ---------------------------------------------------------------- BESOURO DE PEDRA (imune a magia até virar)
  class Beetle extends E {
    constructor(o) {
      super(o, { type: 'beetle', hp: 26, speed: 28, dmg: 11, aggro: 120, immune: ['magic'], contact: true, box: { w: 12, h: 7, hw: 16, hh: 12 }, gold: 5, drops: { coin: 0.9, heart: 0.2 }, blood: ['#c8c0d0', '#ffb84a'] });
      this.flipT = 0; this.cd = U.rand(1, 2); this.chargeV = null;
    }
    vulnerableToMagic() { return this.flipT > 0; }
    onImmune(hit, g) {
      if (!g.flag('tut_beetle')) { g.setFlag('tut_beetle', true); g.bubble(g.players[0], 'A carapaça reflete a magia. Vire ele de costas, Aldren!', 3.5); }
    }
    modifyDamage(d) { return this.flipT > 0 ? d * 1.5 : d; }
    stun(t, g) {
      super.stun(t, g);
      if (t >= 2) { this.flipT = 3.2; this.stunT = 3.2; g.particles.text(this.x, this.y - 22, 'VIRADO!', '#ffe680'); }
    }
    update(dt, g) { this.flipT = Math.max(0, this.flipT - dt); super.update(dt, g); }
    think(dt, g) {
      const t = this.target;
      this.cd -= dt;
      if (this.flipT > 0) return;
      if (this.state === 'windup') {
        if (this.stateT > 0.55) {
          const n = t ? U.norm(t.x - this.x, t.y - this.y) : { x: this.facing, y: 0 };
          this.chargeV = { x: n.x * 150, y: n.y * 150 };
          this.state = 'attack'; this.stateT = 0;
        }
        return;
      }
      if (this.state === 'attack') {
        const r = G.Physics.move(g, this, this.chargeV.x * dt, this.chargeV.y * dt);
        if (Math.random() < 0.5) g.particles.add({ x: this.x, y: this.y, vy: -8, life: 0.3, color: '#8a7a68', back: true });
        if (r.hitX || r.hitY) { this.stun(1.2, g); this.flipT = 0; g.camera.shake(1.5, 0.15); G.Audio.sfx('heavyHit'); }
        else if (this.stateT > 1.1) { this.state = 'chase'; this.stateT = 0; this.cd = U.rand(1.2, 2); }
        return;
      }
      if (t) {
        this.state = 'chase';
        const d = U.dist(this.x, this.y, t.x, t.y);
        if (d < 110 && this.cd <= 0) { this.state = 'windup'; this.stateT = 0; this.facing = t.x < this.x ? -1 : 1; return; }
        this.moveToward(g, t.x, t.y, this.speed, dt);
      } else { this.state = 'idle'; this.wander(dt, g, 16); }
    }
    draw(ctx, cam, g) {
      P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, 16, 0.3);
      const f = this.flipT > 0 ? 2 : (this.state === 'attack' || this.state === 'chase' ? Math.floor(this.animT * 10) % 2 : 0);
      const shake = this.state === 'windup' ? Math.round(Math.sin(this.stateT * 60)) : 0;
      this.drawSprite(ctx, cam, g, S().beetle, f, 0);
      void shake;
      this.drawStatus(ctx, cam, g);
    }
  }
  ET.beetle = Beetle;

  // ---------------------------------------------------------------- ECO SOMBRIO (invocado pelo chefe)
  class Shade extends E {
    constructor(o) {
      super(o, { type: 'shade', hp: 20, speed: 58, dmg: 8, contact: true, aggro: 400, box: { w: 8, h: 5, hw: 10, hh: 20 }, gold: 0, drops: { heart: 0.35, mana: 0.35 }, blood: ['#4a2a6a', '#c8a8ff'], deathColors: ['#4a2a6a', '#c8a8ff', '#1a1028'] });
      this.mimic = o.mimic || 'aldren';
      this.aggro = true;
      this.dir = 'down';
    }
    think(dt, g) {
      const t = this.target;
      if (t) {
        const n = U.norm(t.x - this.x, t.y - this.y);
        this.dir = U.dirFromVec(n.x, n.y, this.dir);
        this.moveToward(g, t.x, t.y, this.speed, dt);
      }
    }
    draw(ctx, cam, g) {
      const set = G.Sprites[this.mimic];
      if (!this._sil) {
        this._sil = {};
        for (const d of ['down', 'up', 'left', 'right']) this._sil[d] = set[d].map((c) => P.silhouette(c, '#2a1840'));
      }
      const f = Math.floor(this.animT * 7) % 2 ? 1 : 2;
      const img = this._sil[this.dir][f];
      P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, 12, 0.3);
      const x = Math.round(this.x - img.width / 2 - cam.rx), y = Math.round(this.y + 1 - img.height - cam.ry);
      ctx.globalAlpha = (this.deathT > 0 ? 1 - this.deathT / 0.35 : 0.85);
      ctx.drawImage(img, x, y);
      if (this.flash > 0) ctx.drawImage(set[this.dir + '_white'][f], x, y);
      ctx.fillStyle = '#ff4a8a'; ctx.fillRect(x + 6, y + 9, 1, 1); ctx.fillRect(x + 11, y + 9, 1, 1);
      ctx.globalAlpha = 1;
      if (Math.random() < 0.4) g.particles.add({ x: this.x + U.rand(-5, 5), y: this.y - U.rand(4, 20), vy: -12, life: 0.5, color: '#6a3a9a' });
      this.drawStatus(ctx, cam, g);
    }
  }
  ET.shade = Shade;
})();
