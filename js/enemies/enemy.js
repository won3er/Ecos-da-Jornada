// Inimigo base: vida, imunidades, atordoamento, congelamento, combos e IA comum.
(function () {
  const U = G.U, P = G.Pixel;

  class Enemy extends G.Entity {
    constructor(o, def) {
      super(Object.assign({ w: 10, h: 6, hw: 12, hh: 14 }, def.box || {}, o));
      this.isEnemy = true;
      this.type = def.type;
      this.def = def;
      this.maxHp = Math.round(def.hp * (o.hpMul || 1));
      this.hp = this.maxHp;
      this.speed = def.speed;
      this.dmg = def.dmg;
      this.state = 'idle'; this.stateT = 0;
      this.home = { x: this.x, y: this.y };
      this.target = null;
      this.flash = 0; this.stunT = 0; this.frozenT = 0; this.held = false;
      this.kvx = 0; this.kvy = 0;
      this.animT = Math.random() * 3;
      this.facing = 1;
      this.wanderT = U.rand(0.5, 2);
      this.wanderDir = null;
      this.aggro = false;
      this.hpShowT = 0;
      this.deathT = 0;
      this.contactCD = 0;
      this.immune = def.immune || [];
      this.flag = o.flag || null;
      this.dropTable = def.drops || { coin: 0.6, heart: 0.15 };
      this.gold = def.gold || 2;
    }
    init(g) { if (this.flag && g.flag(this.flag)) this.dead = true; }
    get stunned() { return this.stunT > 0; }
    get frozen() { return this.frozenT > 0; }
    get busy() { return this.stunT > 0 || this.frozenT > 0 || this.held || this.deathT > 0; }

    pickTarget(g) {
      const al = g.players[1];
      if (g.tauntT > 0 && al && !al.isDown && U.dist(this.x, this.y, al.x, al.y) < 220) return al;
      let best = null, bd = 1e9;
      for (const p of g.players) {
        if (!p || p.isDown) continue;
        let d = U.dist(this.x, this.y, p.x, p.y);
        if (this.def.prefersMage && p.kind === 'mage') d *= 0.6;
        if (d < bd) { bd = d; best = p; }
      }
      return best;
    }

    stun(t, g) {
      if (this.def.noStun) return;
      this.stunT = Math.max(this.stunT, t);
      this.state = 'stun'; this.stateT = 0;
    }
    onParried(by, g) { this.stun(1.8, g); this.kvx = by.fx * 120; this.kvy = by.fy * 120; }

    takeHit(hit, g) {
      if (this.dead || this.deathT > 0 || this.intangible) return false;
      const physical = hit.kind === 'sword' || hit.kind === 'heavy' || (hit.kind === 'special' && hit.physical);
      const magic = !physical;
      // Imunidades
      if ((physical && this.immune.includes('physical') && !(this.frozen && hit.kind === 'heavy')) ||
          (magic && this.immune.includes('magic') && !this.vulnerableToMagic())) {
        this.flash = 0.06;
        G.Audio.sfx('immune');
        if (!this._immuneTxt || g.time - this._immuneTxt > 0.8) {
          this._immuneTxt = g.time;
          g.particles.text(this.x, this.y - this.hh - 10, physical ? 'Imune a espada' : 'Reflete magia', '#b8c8ff');
        }
        this.onImmune(hit, g);
        return true;
      }
      let dmg = hit.dmg;
      let combo = null;
      if (hit.kind === 'fire') {
        if (this.def.fireImmune) {
          this.flash = 0.06; G.Audio.sfx('immune');
          if (!this._immuneTxt || g.time - this._immuneTxt > 0.8) { this._immuneTxt = g.time; g.particles.text(this.x, this.y - this.hh - 10, 'Imune a fogo', '#ffb88a'); }
          return true;
        }
        if (this.def.weakFire) dmg *= 2;
        if (this.frozen) { dmg *= 2.5; combo = 'CHOQUE TÉRMICO!'; this.frozenT = 0; G.Audio.sfx('melt'); }
      }
      if (hit.freeze && this.def.weakFire && !this.def.noFreeze) dmg *= 0.5; // criaturas de gelo resistem à Geada
      if (this.stunned && hit.kind === 'charged') { dmg *= 2.5; combo = 'ABERTURA!'; }
      if (this.held && magic) { dmg *= 2; combo = combo || 'PRISÃO!'; }
      if (this.frozen && hit.kind === 'heavy') { dmg *= 3; combo = 'ESTILHAÇO!'; this.frozenT = 0; G.Audio.sfx('shatter'); g.particles.burst(this.x, this.y - 8, 24, { colors: ['#bfe4f6', '#ffffff', '#8ac0e0'], speed: 90, life: 0.6, size: 2 }); }
      // Bloqueio frontal (esqueleto com escudo)
      const blocked = this.checkGuard(hit, g);
      if (blocked) return true;
      dmg = this.modifyDamage(dmg, hit, g);
      dmg = Math.max(1, Math.round(dmg));
      this.hp -= dmg;
      // chefes não pulam fases com um golpe forte: a vida para no limite da fase
      if (this.phaseFloor) { const f = this.phaseFloor(); if (f !== null && f !== undefined && this.hp < f) this.hp = f; }
      this.flash = 0.1;
      this.hpShowT = 2.5;
      this.aggro = true;
      if (hit.src && hit.src.isPlayer) this.target = this.target || hit.src;
      g.particles.text(this.x, this.y - this.hh - 6, dmg, combo ? '#ffd84a' : magic ? '#c8e8ff' : '#ffffff');
      g.particles.burst(this.x, this.y - this.hh / 2, 6, { colors: this.def.blood || ['#ffffff', '#ffd0d0'], speed: 50, life: 0.3 });
      if (combo) { g.comboText(this.x, this.y - this.hh - 18, combo); g.registerCombo(combo); }
      if (hit.src && hit.src.addSpecial) hit.src.addSpecial(Math.min(14, dmg * 0.5) * (combo ? 2 : 1));
      // reações
      if (!this.def.heavyBody && hit.dir && hit.kb) { this.kvx = hit.dir.x * hit.kb; this.kvy = hit.dir.y * hit.kb; }
      if (hit.stun) this.stun(hit.stun, g);
      if (hit.freeze && !this.def.noFreeze && !this.def.weakFire) { this.frozenT = hit.freeze; this.state = 'frozen'; this.burnT = 0; }
      if (hit.burn && !this.def.noBurn && this.hp > 0) { this.burnT = Math.max(this.burnT || 0, hit.burn); this.burnDmg = Math.max(1, Math.round(hit.dmg * 0.18)); this.burnTick = 0.5; }
      this.onDamaged(hit, g);
      G.Audio.sfx('enemyHurt');
      if (this.hp <= 0) this.die(g);
      return true;
    }
    vulnerableToMagic() { return false; }
    checkGuard(hit, g) { return false; }
    modifyDamage(d) { return d; }
    onDamaged(hit, g) {}
    onImmune(hit, g) {}

    die(g) {
      if (this.deathT > 0) return;
      this.deathT = 0.001;
      this.held = false;
      G.Audio.sfx('enemyDie');
      g.particles.burst(this.x, this.y - this.hh / 2, 18, { colors: this.def.deathColors || ['#ffffff', '#c8c0d8', '#7a6a8a'], speed: 70, life: 0.6, glow: true });
      if (this.flag) g.setFlag(this.flag, true);
      // drops
      if (Math.random() < (this.dropTable.coin || 0)) g.spawnDrop(this.x, this.y, 'coin', this.gold);
      if (Math.random() < (this.dropTable.heart || 0)) g.spawnDrop(this.x, this.y, 'heart');
      if (Math.random() < (this.dropTable.mana || 0)) g.spawnDrop(this.x, this.y, 'mana');
      g.onEnemyKilled(this);
    }

    // movimento em direção a um ponto (com deslize)
    moveToward(g, tx, ty, speed, dt) {
      const n = U.norm(tx - this.x, ty - this.y);
      if (Math.abs(n.x) > 0.1) this.facing = n.x < 0 ? -1 : 1;
      return G.Physics.move(g, this, n.x * speed * dt, n.y * speed * dt);
    }
    canSee(g, p) { return U.dist(this.x, this.y, p.x, p.y) < (this.def.aggro || 110); }

    update(dt, g) {
      this.animT += dt;
      this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt);
      this.hpShowT = Math.max(0, this.hpShowT - dt);
      this.contactCD = Math.max(0, this.contactCD - dt);
      if (this.deathT > 0) { this.deathT += dt; if (this.deathT > 0.35) this.dead = true; return; }
      // queimadura (Chama Estelar)
      if (this.burnT > 0) {
        this.burnT -= dt; this.burnTick -= dt;
        if (Math.random() < 0.5) g.particles.add({ x: this.x + U.rand(-5, 5), y: this.y - U.rand(2, this.hh), vy: -25, life: 0.4, color: U.pick(['#ff8a3a', '#ffd84a', '#c8401a']), glow: true });
        if (this.burnTick <= 0) {
          this.burnTick = 0.5;
          this.hp -= this.burnDmg; this.flash = 0.05; this.hpShowT = 1.5;
          g.particles.text(this.x, this.y - this.hh - 4, this.burnDmg, '#ffb84a');
          if (this.hp <= 0) { this.die(g); return; }
        }
      }
      // empurrão
      if (Math.abs(this.kvx) + Math.abs(this.kvy) > 2) {
        G.Physics.move(g, this, this.kvx * dt, this.kvy * dt);
        const k = Math.pow(0.002, dt); this.kvx *= k; this.kvy *= k;
      }
      if (this.frozenT > 0) {
        this.frozenT -= dt;
        if (this.frozenT <= 0) { this.state = 'idle'; g.particles.burst(this.x, this.y - 8, 8, { colors: ['#bfe4f6', '#ffffff'], speed: 30, life: 0.4 }); }
        return;
      }
      if (this.held) return;
      if (this.stunT > 0) { this.stunT -= dt; if (this.stunT <= 0) { this.state = 'chase'; this.stateT = 0; } return; }
      if (!this.target || this.target.isDown || this.stateT > 3 || g.tauntT > 0) {
        if (this.state === 'idle' || this.state === 'chase') {
          const t = this.pickTarget(g);
          if (t && (this.aggro || this.canSee(g, t))) { this.target = t; this.aggro = true; }
          else if (!t) this.target = null;
        }
      }
      if (this.target && this.target.isDown) this.target = null;
      this.think(dt, g);
      // dano por contato
      if (this.def.contact && this.contactCD <= 0 && !this.busy) {
        for (const p of g.players) {
          if (!p || p.isDown) continue;
          if (U.rectsOverlap(this.hurtBox, p.hurtBox)) {
            const r = p.takeHit({ dmg: this.dmg, src: this, dir: U.norm(p.x - this.x, p.y - this.y), kb: 100 }, g);
            this.contactCD = 0.6;
            if (r === 'blocked') { this.kvx = -(p.x - this.x) * 6; this.kvy = -(p.y - this.y) * 6; }
          }
        }
      }
    }

    // vagar
    wander(dt, g, speed) {
      this.wanderT -= dt;
      if (this.wanderT <= 0) {
        this.wanderT = U.rand(1, 2.5);
        this.wanderDir = Math.random() < 0.6 ? U.norm(this.home.x + U.rand(-30, 30) - this.x, this.home.y + U.rand(-20, 20) - this.y) : null;
      }
      if (this.wanderDir) {
        const r = G.Physics.move(g, this, this.wanderDir.x * speed * dt, this.wanderDir.y * speed * dt);
        if (Math.abs(this.wanderDir.x) > 0.1) this.facing = this.wanderDir.x < 0 ? -1 : 1;
        if (r.hitX || r.hitY) this.wanderDir = null;
        return true;
      }
      return false;
    }

    think(dt, g) {}

    // Desenho comum (sprite set + efeitos)
    drawSprite(ctx, cam, g, set, frame, oy = 0) {
      const imgs = this.facing < 0 ? set.left : set.right;
      const img = imgs[frame];
      const x = Math.round(this.x - img.width / 2 - cam.rx), y = Math.round(this.y + 1 - img.height - cam.ry - this.z + oy);
      if (this.deathT > 0) { ctx.globalAlpha = 1 - this.deathT / 0.35; }
      ctx.drawImage(img, x, y);
      if (this.flash > 0 || this.deathT > 0) ctx.drawImage((this.facing < 0 ? set.whiteL : set.white)[frame], x, y);
      ctx.globalAlpha = 1;
      return { x, y, w: img.width, h: img.height };
    }
    drawStatus(ctx, cam, g) {
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - cam.ry);
      if (this.frozenT > 0) G.FX.iceBlock(ctx, x, y + 1, this.hw + 6, this.hh + 6, g.time);
      if (this.stunT > 0) G.FX.stars(ctx, x, y - this.hh - 6, g.time);
      if (this.slowK && this.slowK < 1) { ctx.globalAlpha = 0.5; G.Pixel.ring(ctx, x, y - this.hh / 2, Math.max(6, this.hw / 2 + 3), '#c8f0ff'); ctx.globalAlpha = 1; }
      if (this.held) { ctx.fillStyle = '#ffe680'; ctx.fillRect(x - 6, y - this.hh - 2, 12, 1); }
      if (this.hpShowT > 0 && this.hp > 0 && !this.boss) {
        const w = Math.max(14, Math.min(30, this.maxHp / 2));
        ctx.fillStyle = '#1a1424'; ctx.fillRect(x - w / 2 - 1, y + 3, w + 2, 3);
        ctx.fillStyle = '#e84a5a'; ctx.fillRect(x - w / 2, y + 4, Math.round(w * this.hp / this.maxHp), 1);
      }
      if (this.state === 'windup' && Math.floor(g.time * 12) % 2) {
        G.Font.draw(ctx, '!', x, y - this.hh - 14, '#ff6a4a', { align: 'center', shadow: true });
      }
    }
  }
  G.Enemy = Enemy;
  G.EnemyTypes = {};
})();
