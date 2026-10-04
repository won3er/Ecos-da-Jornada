// CHEFES DO CAPÍTULO III
// MINI-CHEFE — Os Ecos: sombras de Lirien e Aldren. Enquanto estão perto um
//   do outro, um ELO os protege. Separem os dois: a provocação do Aldren puxa
//   o Eco dele; a Geada segura o Eco dela.
// ELITE — Sentinela Antiga: só o próprio feixe devolvido pelo escudo a derruba.
// CHEFE FINAL — Nyxara, a Mãe das Estrelas:
//   1) Véu estelar (magia concentrada / Prisma / fogo) -> tonta.
//   2) Raio do Fim: o escudo do Aldren devolve o raio contra ela.
//   3) Chuva de meteoros (Estase desacelera); o núcleo desce sobre a ilha —
//      só o ARREMESSO leva a Lirien até lá.
//   4) Só juntos: dois ataques UNIÃO (especiais ao mesmo tempo) selam Nyxara.
(function () {
  const U = G.U, P = G.Pixel;

  // ====================================================================== OS ECOS
  class EchoBase extends G.Enemy {
    constructor(o, def) {
      super(o, Object.assign({ aggro: 999, heavyBody: false, noStun: false, gold: 0, drops: {}, box: { w: 8, h: 5, hw: 12, hh: 22 }, blood: ['#4a2a6a', '#c8a8ff'], deathColors: ['#4a2a6a', '#c8a8ff', '#ffffff'] }, def));
      this.boss = true; this.dir = 'down'; this.state = 'dormant'; this.cd = 1.5; this.enraged = false;
    }
    vulnerable() { return !this.linked; }
    get linked() { const o = this.other; return o && !o.dead && o.deathT <= 0 && o.hp > 0 && U.dist(this.x, this.y, o.x, o.y) < 100; }
    takeHit(hit, g) {
      if (this.state === 'dormant' || this.dead || this.deathT > 0) return false;
      return super.takeHit(hit, g);
    }
    modifyDamage(d, hit, g) {
      if (this.linked) {
        if (!this._lTxt || g.time - this._lTxt > 1.2) { this._lTxt = g.time; g.particles.text(this.x, this.y - 34, 'O ELO PROTEGE', '#c8a8ff'); }
        if (!g.flag('hint_link') && g.time - (this._hT || 0) > 5) { this._hT = g.time; g.setFlag('hint_link', true); g.toast('O elo entre os Ecos os protege! Separem os dois: Aldren provoca o dele, Lirien congela o dela.', 5); }
        return d * 0.2;
      }
      return d * (this.enraged ? 0.9 : 1);
    }
    die(g) {
      if (this.deathT > 0) return;
      super.die(g);
      const o = this.other;
      if (o && !o.dead && o.deathT <= 0) { o.enraged = true; g.particles.text(o.x, o.y - 36, 'FÚRIA!', '#ff4a8a'); G.Audio.sfx('roar'); }
    }
    silhouette(key) {
      if (!EchoBase.cache[key]) {
        const set = G.Sprites[key];
        const out = {};
        for (const d of ['down', 'up', 'left', 'right']) out[d] = set[d].map((c) => P.silhouette(c, '#1a0e2e'));
        EchoBase.cache[key] = out;
      }
      return EchoBase.cache[key];
    }
    drawEcho(ctx, cam, g, key) {
      const set = this.silhouette(key);
      const moving = this.state === 'chase' || this.state === 'flee';
      const f = moving ? [1, 0, 2, 0][Math.floor(this.animT * 7) % 4] : 0;
      const img = set[this.dir][f];
      P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, 12, 0.35);
      const x = Math.round(this.x - img.width / 2 - cam.rx), y = Math.round(this.y + 1 - img.height - cam.ry);
      ctx.globalAlpha = this.deathT > 0 ? 1 - this.deathT / 0.35 : this.state === 'dormant' ? 0.4 : 0.92;
      ctx.drawImage(img, x, y);
      if (this.flash > 0) ctx.drawImage(G.Sprites[key][this.dir + '_white'][f], x, y);
      ctx.fillStyle = this.enraged ? '#ff4a4a' : '#ff4a8a'; ctx.fillRect(x + 6, y + 9, 1, 1); ctx.fillRect(x + 11, y + 9, 1, 1);
      ctx.globalAlpha = 1;
      if (Math.random() < 0.5) g.particles.add({ x: this.x + U.rand(-5, 5), y: this.y - U.rand(4, 20), vy: -12, life: 0.5, color: this.enraged ? '#8a2a4a' : '#6a3a9a' });
      g.lighting.add(this.x, this.y - 12, 36, 0.5, '#8a5ad8', 0.12);
      this.drawStatus(ctx, cam, g);
    }
  }
  EchoBase.cache = {};

  class EchoL extends EchoBase {
    constructor(o) { super(o, { type: 'echoL', hp: 240, speed: 62, dmg: 9 }); this.blinkCd = 0; this.name = 'Eco de Lirien'; }
    think(dt, g) {
      if (this.state === 'dormant') return;
      const t = g.players[0] && !g.players[0].isDown ? g.players[0] : this.target;
      if (!t) return;
      const sp = this.enraged ? 1.3 : 1;
      this.cd -= dt * sp; this.blinkCd -= dt;
      const d = U.dist(this.x, this.y, t.x, t.y);
      const n = U.norm(t.x - this.x, t.y - this.y);
      this.dir = U.dirFromVec(n.x, n.y, this.dir);
      // foge se alguém chega perto (teleporte curto)
      const near = g.players.find((p) => p && !p.isDown && U.dist(p.x, p.y, this.x, this.y) < 40);
      if (near && this.blinkCd <= 0) {
        this.blinkCd = this.enraged ? 1.6 : 2.4;
        const a = Math.atan2(this.y - near.y, this.x - near.x) + U.rand(-0.8, 0.8);
        for (let k = 60; k >= 20; k -= 8) {
          const nx = this.x + Math.cos(a) * k, ny = this.y + Math.sin(a) * k;
          const b = { x: nx - this.w / 2, y: ny - this.h, w: this.w, h: this.h };
          if (!G.Physics.blocked(g, b, this) && !g.level.isHole(Math.floor(nx / 16), Math.floor((ny - 2) / 16))) {
            g.particles.burst(this.x, this.y - 10, 12, { colors: ['#6a3a9a', '#c8a8ff'], speed: 40, life: 0.4 });
            this.x = nx; this.y = ny; G.Audio.sfx('blink');
            break;
          }
        }
        return;
      }
      if (this.state === 'windup') {
        if (this.stateT > 0.8) {
          const pr = new G.Combat.Projectile({ x: this.x + n.x * 8, y: this.y + n.y * 6, vx: n.x * 140, vy: n.y * 140, team: 'enemy', owner: this, dmg: 16, kind: 'orb', life: 2.4, height: 14, r: 6, size: 3, color: '#6a3a9a', color2: '#c8a8ff', light: 40 });
          g.addEntity(pr); G.Audio.sfx('bigBolt');
          this.state = 'chase'; this.stateT = 0; this.cd = U.rand(1.6, 2.4);
        }
        return;
      }
      this.state = d < 70 ? 'flee' : 'chase';
      if (d < 70) this.moveToward(g, this.x - n.x * 20, this.y - n.y * 20, this.speed * sp, dt);
      else if (d > 130) this.moveToward(g, t.x, t.y, this.speed * sp * 0.7, dt);
      if (this.cd <= 0) {
        if (Math.random() < 0.35) { this.state = 'windup'; this.stateT = 0; return; }
        this.cd = U.rand(0.8, 1.3);
        for (const off of this.enraged ? [-0.2, 0, 0.2] : [0]) {
          const a = Math.atan2(n.y, n.x) + off;
          g.addEntity(new G.Combat.Projectile({ x: this.x + Math.cos(a) * 6, y: this.y + Math.sin(a) * 4, vx: Math.cos(a) * 160, vy: Math.sin(a) * 160, team: 'enemy', owner: this, dmg: 7, kind: 'orb', life: 1.6, height: 12, r: 3, color: '#8a5ad8', color2: '#e0c8ff', light: 20 }));
        }
        G.Audio.sfx('bolt');
      }
    }
    draw(ctx, cam, g) {
      this.drawEcho(ctx, cam, g, 'lirien');
      if (this.state === 'windup') { const k = this.stateT / 0.8; P.circle(ctx, Math.round(this.x - cam.rx), Math.round(this.y - 30 - cam.ry), Math.round(2 + k * 4), '#c8a8ff'); }
    }
  }
  G.EnemyTypes.echoL = EchoL;

  class EchoA extends EchoBase {
    constructor(o) { super(o, { type: 'echoA', hp: 290, speed: 54, dmg: 13, box: { w: 8, h: 5, hw: 12, hh: 22 } }); this.gdir = { x: 0, y: 1 }; this.name = 'Eco de Aldren'; }
    checkGuard(hit, g) {
      if (this.stunned || this.frozen || this.held || !hit.dir) return false;
      if (hit.kind === 'heavy' || hit.kind === 'special' || hit.kind === 'impact') { if (hit.kind === 'heavy') this.stun(1.8, g); return false; }
      const dot = -(hit.dir.x * this.gdir.x + hit.dir.y * this.gdir.y);
      if (dot > 0.4) {
        G.Audio.sfx('block'); this.flash = 0.05;
        if (!this._gTxt || g.time - this._gTxt > 1.2) { this._gTxt = g.time; g.particles.text(this.x, this.y - 34, 'DEFENDEU', '#c8c8d8'); }
        return true;
      }
      return false;
    }
    think(dt, g) {
      if (this.state === 'dormant') return;
      // a provocação do Aldren puxa o Eco dele (é assim que se separa os dois)
      let t = g.tauntT > 0 && g.players[1] && !g.players[1].isDown ? g.players[1] : (g.players[0] && !g.players[0].isDown ? g.players[0] : this.target);
      if (!t) return;
      const sp = this.enraged ? 1.3 : 1;
      this.cd -= dt * sp;
      const n = U.norm(t.x - this.x, t.y - this.y);
      if (this.state !== 'windup' && this.state !== 'attack') {
        this.gdir = U.norm(U.lerp(this.gdir.x, n.x, dt * 3), U.lerp(this.gdir.y, n.y, dt * 3));
        this.dir = U.dirFromVec(this.gdir.x, this.gdir.y, this.dir);
      }
      if (this.state === 'windup') {
        if (this.stateT > 0.5) {
          this.state = 'attack'; this.stateT = 0; G.Audio.sfx('swing');
          G.Combat.hitPlayersCircle(g, this.x + this.gdir.x * 14, this.y - 6 + this.gdir.y * 10, 15, { dmg: this.dmg, src: this, dir: this.gdir, kb: 130 });
          g.particles.ring(this.x + this.gdir.x * 14, this.y - 6 + this.gdir.y * 10, 4, 15, 0.25, '#c8a8ff', 1);
        }
        return;
      }
      if (this.state === 'attack') { if (this.stateT > 0.45) { this.state = 'chase'; this.stateT = 0; this.cd = U.rand(0.6, 1.1); } return; }
      this.state = 'chase';
      const d = U.dist(this.x, this.y, t.x, t.y);
      if (this.cd <= 0 && d < 24) { this.state = 'windup'; this.stateT = 0; return; }
      if (d > 18) this.moveToward(g, t.x, t.y, this.speed * sp, dt);
    }
    draw(ctx, cam, g) {
      this.drawEcho(ctx, cam, g, 'aldren');
      if (!this.stunned && !this.frozen && this.deathT <= 0 && this.state !== 'dormant' && this.gdir.y > -0.5) {
        const sx = Math.round(this.x + this.gdir.x * 8 - cam.rx), sy = Math.round(this.y - 11 + this.gdir.y * 3 - cam.ry);
        P.circle(ctx, sx, sy, 4, '#1a0e2e'); P.circle(ctx, sx, sy, 3, '#6a3a9a');
      }
      if (this.state === 'windup' && Math.floor(g.time * 12) % 2) G.Font.draw(ctx, '!', Math.round(this.x - cam.rx), Math.round(this.y - 38 - cam.ry), '#ff6a4a', { align: 'center', shadow: true });
    }
  }
  G.EnemyTypes.echoA = EchoA;

  // controlador invisível: barra de vida combinada e o elo desenhado
  class EchoPair extends G.Obj {
    constructor(o) { super(Object.assign({ w: 1, h: 1 }, o)); this.layer = 1; this.name = 'Os Ecos'; this.type = 'echoPair'; this.started = false; }
    init(g) {
      if (g.flag('ecos_dead')) { this.dead = true; return; }
      const [ax, ay] = this.data.a, [lx, ly] = this.data.l;
      this.ea = g.spawnEnemy('echoA', ax * 16 + 8, ay * 16 + 14);
      this.el = g.spawnEnemy('echoL', lx * 16 + 8, ly * 16 + 14);
      this.ea.other = this.el; this.el.other = this.ea;
      this.maxHp = this.ea.maxHp + this.el.maxHp;
    }
    get hp() { return Math.max(0, (this.ea && !this.ea.dead ? this.ea.hp : 0)) + Math.max(0, (this.el && !this.el.dead ? this.el.hp : 0)); }
    activate(g) { this.started = true; for (const e of [this.ea, this.el]) { e.state = 'chase'; e.stateT = 0; e.aggro = true; } g.bossBar = this; }
    update(dt, g) {
      if (!this.started || this.done) return;
      const aDead = !this.ea || this.ea.dead || this.ea.deathT > 0, lDead = !this.el || this.el.dead || this.el.deathT > 0;
      if (aDead && lDead) {
        this.done = true; g.bossBar = null;
        g.setFlag('ecos_dead', true);
        const s = g.level.def.scripts && g.level.def.scripts.ecosDefeated;
        if (s) g.co.start(s, g, { name: 'ecosDefeated', persist: true });
      }
    }
    draw(ctx, cam, g) {
      if (!this.started || this.done) return;
      const a = this.ea, l = this.el;
      if (!a || !l || a.dead || l.dead || a.deathT > 0 || l.deathT > 0 || !a.linked) return;
      const n = 14;
      for (let i = 0; i <= n; i++) {
        const k = i / n;
        const x = U.lerp(a.x, l.x, k) - cam.rx, y = U.lerp(a.y - 12, l.y - 12, k) - cam.ry + Math.sin(k * Math.PI + g.time * 6) * 4;
        ctx.fillStyle = i % 2 ? '#c8a8ff' : '#6a3a9a'; ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
      }
    }
  }
  G.ObjectTypes.echopair = EchoPair;

  // ====================================================================== SENTINELA ANTIGA (elite)
  class Sentinel extends G.EnemyTypes.sentry {
    constructor(o) {
      super(o);
      this.type = 'sentinel'; this.name = 'Sentinela Antiga';
      this.def = Object.assign({}, this.def, { type: 'sentinel', box: { w: 22, h: 12, hw: 26, hh: 40 } });
      this.w = 22; this.h = 12; this.hw = 26; this.hh = 40;
      this.maxHp = this.hp = 320; this.elite = true; this.stun2 = 0; this.flag = o.flag || 'sentinela_dead';
    }
    takeHit(hit, g) {
      if (this.deathT > 0) return false;
      if (hit.kind === 'beamshot') {
        this.stun2 = 4; this.flash = 0.2;
        g.comboText(this.x, this.y - 54, 'FEIXE DEVOLVIDO!'); g.registerCombo('sentinela');
        this.hp -= 30; g.particles.text(this.x, this.y - 44, 30, '#ffd84a');
        if (this.hp <= 0) this.die(g);
        return true;
      }
      if (this.stun2 <= 0) {
        G.Audio.sfx('immune');
        if (!this._t || g.time - this._t > 1.2) { this._t = g.time; g.particles.text(this.x, this.y - 50, 'Couraça prismática', '#ffe680'); }
        if (!g.flag('hint_sentinel')) { g.setFlag('hint_sentinel', true); g.bubble(g.players[1], 'Só a própria luz dela atravessa. Vou devolver com o escudo!', 3.2); }
        return true;
      }
      return super.takeHit(hit, g);
    }
    modifyDamage(d) { return d * 1.2; }
    think(dt, g) {
      if (this.stun2 > 0) { this.stun2 -= dt; this.state = 'idle'; return; }
      const t = this.target;
      this.cd -= dt;
      if (this.state === 'windup') {
        if (t) this.aim = U.norm(t.x - this.x, t.y - this.y);
        if (this.stateT > 1) {
          const base = Math.atan2(this.aim.y, this.aim.x);
          for (const off of [-0.3, 0, 0.3]) {
            const a = base + off;
            const pr = new G.Combat.Projectile({ x: this.x + Math.cos(a) * 14, y: this.y + Math.sin(a) * 8, vx: Math.cos(a) * 150, vy: Math.sin(a) * 150, team: 'enemy', owner: this, dmg: 12, kind: 'orb', life: 2.6, height: 24, r: 5, color: '#ffe680', color2: '#ffffff', light: 40, size: 3 });
            pr.onReflectKind = 'beamshot';
            g.addEntity(pr);
          }
          G.Audio.sfx('beam');
          this.state = 'idle'; this.stateT = 0; this.cd = U.rand(1.6, 2.4);
        }
        return;
      }
      if (t && this.cd <= 0) { this.state = 'windup'; this.stateT = 0; }
    }
    die(g) { super.die(g); g.setFlag('sentinela_dead', true); }
    draw(ctx, cam, g) {
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - cam.ry);
      P.shadow(ctx, x, y, 30, 0.35);
      const W = this.flash > 0;
      if (this.deathT > 0) ctx.globalAlpha = 1 - this.deathT / 0.35;
      ctx.fillStyle = '#1e1a30'; ctx.fillRect(x - 14, y - 12, 28, 12);
      ctx.fillStyle = W ? '#fff' : '#4a4680'; ctx.fillRect(x - 13, y - 12, 26, 9);
      for (let j = 0; j < 30; j++) { const w = Math.max(2, Math.round((30 - j) / 2.6)); ctx.fillStyle = W ? '#fff' : j % 5 ? '#8a7ad8' : '#d8c8ff'; ctx.fillRect(x - w, y - 12 - j, w * 2, 1); }
      for (const s of [-1, 1]) { ctx.fillStyle = W ? '#fff' : '#6a5ab8'; ctx.fillRect(x + s * 14 - 2, y - 30, 4, 18); }
      const k = this.state === 'windup' ? this.stateT : 0;
      P.circle(ctx, x, y - 34, 4 + Math.round(k * 4), this.stun2 > 0 ? '#5a5a7a' : '#ffe680');
      ctx.globalAlpha = 1;
      if (this.stun2 > 0) G.FX.stars(ctx, x, y - 50, g.time);
      if (this.state === 'windup' && this.aim) { ctx.globalAlpha = 0.3; for (const off of [-0.3, 0, 0.3]) { const a = Math.atan2(this.aim.y, this.aim.x) + off; P.line(ctx, x, y - 24, x + Math.cos(a) * 150, y - 24 + Math.sin(a) * 150, '#ff6a4a'); } ctx.globalAlpha = 1; }
      g.lighting.add(this.x, this.y - 30, 60, 0.8, '#ffe680', 0.2);
      if (this.hp > 0) { ctx.fillStyle = '#1a1424'; ctx.fillRect(x - 18, y - 56, 36, 4); ctx.fillStyle = '#ffe680'; ctx.fillRect(x - 17, y - 55, Math.round(34 * this.hp / this.maxHp), 2); }
    }
  }
  G.EnemyTypes.sentinel = Sentinel;

  // ====================================================================== NYXARA
  class Nyxara extends G.Enemy {
    constructor(o) {
      super(o, { type: 'nyxara', hp: 900, speed: 40, dmg: 14, aggro: 999, heavyBody: true, noFreeze: true, noStun: true, noBurn: true, box: { w: 22, h: 10, hw: 34, hh: 56 }, gold: 0, drops: {}, deathColors: ['#f2d98c', '#ffffff', '#c8a8ff'] });
      this.boss = true; this.name = 'Nyxara, a Mãe das Estrelas';
      this.flying = true; this.z = 18;
      this.state = 'dormant'; this.phase = 1;
      this.center = { x: this.x, y: this.y };
      this.shield = 3; this.shieldMax = 3; this.dazedT = 0;
      this.cd = 2; this.meteors = []; this.meteorCd = 3;
      this.beam = null; this.beamCd = 5;
      this.coreHits = 0; this.coreDown = false;
      this.seals = 2;
      this.moveT = 0; this.goal = null;
      this.hitCd = new Map();
    }
    get heavyBody() { return true; }
    get stunned() { return this.dazedT > 0; }
    stun() {}
    activate(g) { this.state = 'idle'; this.stateT = 0; this.aggro = true; g.bossBar = this; this.cd = 1.5; }
    vulnerable() { return this.dazedT > 0 || (this.phase === 2 && this.shield <= 0); }
    takeHit(hit, g) {
      if (['dormant', 'dying', 'transition'].includes(this.state)) return false;
      if (this.phase === 4) {
        G.Audio.sfx('immune');
        // golpes alimentam a barra de especial dos dois
        if (hit.src && hit.src.isPlayer) for (const p of g.players) if (p && !p.isDown) p.special = Math.min(100, p.special + 4);
        if (!this._uTxt || g.time - this._uTxt > 1.4) { this._uTxt = g.time; g.particles.text(this.x, this.y - 74, 'SÓ JUNTOS!', '#f2d98c'); }
        return true;
      }
      if (this.phase === 3 && this.coreDown) {
        const src = hit.src;
        const magic = ['charged', 'fire', 'special', 'impact', 'bolt', 'prism'].includes(hit.kind);
        if (magic && src && src.kind === 'mage' && this.nearCore(src) && (!this._coreT || g.time - this._coreT > 0.6)) { this._coreT = g.time; this.hitCore(g); return true; }
      }
      if (this.shield > 0 && this.dazedT <= 0) {
        if (hit.kind === 'charged' || hit.kind === 'prism' || hit.kind === 'special' || hit.kind === 'fire') {
          this.shield -= hit.kind === 'prism' ? 0.5 : 1;
          this.flash = 0.1; G.Audio.sfx('barrier');
          g.particles.burst(this.x, this.y - this.z - 26, 20, { colors: ['#ff8ad8', '#8ae8ff', '#ffe680', '#ffffff'], speed: 80, life: 0.5, glow: true });
          if (this.shield <= 0) this.breakVeil(g);
          else g.particles.text(this.x, this.y - 74, 'O véu racha!', '#ffe680');
          return true;
        }
        G.Audio.sfx('immune');
        if (!this._sTxt || g.time - this._sTxt > 1.2) { this._sTxt = g.time; g.particles.text(this.x, this.y - 74, 'O véu absorve', '#e0c8ff'); }
        return true;
      }
      if (this.dazedT <= 0 && this.phase !== 1) {
        G.Audio.sfx('immune');
        if (!this._dTxt || g.time - this._dTxt > 1.4) { this._dTxt = g.time; g.particles.text(this.x, this.y - 74, this.phase === 2 ? 'Devolvam o raio!' : 'O núcleo está protegido', '#e0c8ff'); }
        return true;
      }
      return super.takeHit(hit, g);
    }
    modifyDamage(d, hit) { const physical = hit.kind === 'sword' || hit.kind === 'heavy'; return d * (physical ? 1.3 : 1); }
    breakVeil(g) {
      this.shield = 0; this.dazedT = 6; this.state = 'dazed'; this.stateT = 0;
      G.Audio.sfx('shatter'); G.Audio.sfx('roar');
      g.camera.shake(5, 0.5); g.flashScreen('#e0c8ff', 0.15);
      g.comboText(this.x, this.y - 80, 'VÉU QUEBRADO!');
    }
    nearCore(p) { const c = this.corePos(); return U.dist(p.x, p.y, c.x, c.y) < 70; }
    corePos() { const isl = (G.game.level.def.island) || { x: this.center.x, y: this.center.y - 100 }; return { x: isl.x, y: isl.y }; }
    hitCore(g) {
      this.coreHits++;
      this.flash = 0.2; G.Audio.sfx('shatter'); g.camera.shake(5, 0.4);
      g.comboText(this.corePos().x, this.corePos().y - 40, 'O NÚCLEO RACHA!');
      this.hp -= 45; g.particles.text(this.corePos().x, this.corePos().y - 30, 45, '#ffd84a');
      if (this.coreHits >= 3) {
        this.coreDown = false; this.coreHits = 0;
        this.dazedT = 7; this.state = 'dazed'; this.stateT = 0;
        g.flashScreen('#ffffff', 0.3);
        g.toast('Nyxara caiu! Lirien, volte pelo portal — e ataquem!', 4);
      }
      if (this.hp <= this.maxHp * 0.25 && this.phase === 3) this.toPhase(4, g);
    }
    // UNIÃO (os dois especiais juntos) — chamado pelo jogo
    onUnion(g) {
      if (this.phase !== 4 || this.state === 'dying') return;
      const near = g.players.some((p) => p && U.dist(p.x, p.y, this.x, this.y) < 110);
      if (!near) { g.toast('Cheguem mais perto da Nyxara e façam a UNIÃO de novo!', 3); return; }
      this.seals--;
      this.flash = 0.3; g.flashScreen('#fff6d8', 0.5); g.camera.shake(8, 0.8);
      g.comboText(this.x, this.y - 90, this.seals > 0 ? 'UM SELO SE FECHA!' : 'SELADA!');
      this.hp = Math.max(1, Math.round(this.maxHp * 0.12 * this.seals));
      if (this.seals <= 0) { this.hp = 0; this.die(g); }
    }
    die(g) {
      if (this.state === 'dying') return;
      this.state = 'dying'; this.stateT = 0; this.hp = 0;
      g.bossBar = null; this.beam = null; this.meteors = [];
      for (const e of g.entities) if ((e.isEnemy && e !== this) || (e instanceof G.Combat.Projectile && e.team === 'enemy')) { if (e.isEnemy && e.die) e.die(g); else e.dead = true; }
      G.Audio.playMusic(null, 1.5);
      G.Audio.sfx('roar');
    }
    update(dt, g) {
      this.animT += dt; this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt);
      this.burnT = 0;
      for (const [k, v] of this.hitCd) { if (v - dt <= 0) this.hitCd.delete(k); else this.hitCd.set(k, v - dt); }
      this.updateMeteors(dt, g);
      if (this.state === 'dormant') return;
      if (this.state === 'dying') {
        this.z = U.approach(this.z, 6, dt * 8);
        if (Math.random() < 0.7) g.particles.burst(this.x + U.rand(-18, 18), this.y - this.z - U.rand(4, 60), 3, { colors: ['#f2d98c', '#ffffff', '#c8a8ff'], speed: 60, life: 0.8, glow: true });
        if (Math.random() < 0.08) { G.Audio.sfx('shatter'); g.flashScreen('#ffffff', 0.08); }
        if (this.stateT > 4) {
          this.dead = true;
          G.Audio.sfx('explosion'); g.flashScreen('#ffffff', 1); g.camera.shake(10, 1.2);
          g.particles.burst(this.x, this.y - 40, 120, { colors: ['#f2d98c', '#ffffff', '#c8a8ff', '#8ae8ff'], speed: 160, life: 2, glow: true, size: 2 });
          g.onEnemyKilled(this);
          const s = g.level.def.scripts && g.level.def.scripts.nyxaraDefeated;
          if (s) g.co.start(s, g, { name: 'nyxaraDefeated', persist: true });
        }
        return;
      }
      const k = this.hp / this.maxHp;
      if (this.phase === 1 && k < 0.75) { this.toPhase(2, g); return; }
      if (this.phase === 2 && k < 0.5) { this.toPhase(3, g); return; }
      if (this.phase === 3 && k < 0.25) { this.toPhase(4, g); return; }
      if (this.state === 'transition') {
        this.z = U.approach(this.z, 24, dt * 20);
        G.Physics.move(g, this, (this.center.x - this.x) * dt * 2, (this.center.y - this.y) * dt * 2);
        if (this.stateT > 2.4) { this.state = 'idle'; this.stateT = 0; this.cd = 1; this.afterPhase(g); }
        return;
      }
      if (this.dazedT > 0) {
        this.dazedT -= dt;
        this.z = U.approach(this.z, 3, dt * 30);
        if (this.dazedT <= 0) {
          this.state = 'idle'; this.cd = 1.2; G.Audio.sfx('roar');
          if (this.phase === 1) this.shield = this.shieldMax = 3;
          if (this.phase === 3) { this.coreDown = false; this.coreCd = 6; }
          g.particles.ring(this.x, this.y - 30, 6, 40, 0.5, '#f2d98c', 2);
        }
        return;
      }
      this.z = U.approach(this.z, 18 + Math.sin(this.animT * 2) * 3, dt * 20);
      this.target = this.pickTarget(g);
      this.drift(dt, g);
      this.cd -= dt;
      // fase 2: Raio do Fim
      if (this.phase === 2) {
        this.beamCd -= dt;
        if (this.beam) { this.updateBeam(dt, g); return; }
        if (this.beamCd <= 0 && this.state === 'idle') { this.startBeam(g); return; }
      }
      // fase 3: meteoros + núcleo na ilha
      if (this.phase >= 3) {
        this.meteorCd -= dt;
        if (this.meteorCd <= 0) { this.meteorCd = this.phase === 4 ? U.rand(2.2, 3) : U.rand(1.6, 2.4); this.rainMeteors(g); }
      }
      if (this.phase === 3) {
        this.coreCd = (this.coreCd === undefined ? 4 : this.coreCd) - dt;
        if (!this.coreDown && this.coreCd <= 0) {
          this.coreDown = true; this.coreTimer = 16; G.Audio.sfx('bell');
          g.toast('O núcleo da Nyxara desceu sobre a ilha! Aldren: ARREMESSE a Lirien até lá!', 5);
        }
        if (this.coreDown) { this.coreTimer -= dt; if (this.coreTimer <= 0) { this.coreDown = false; this.coreCd = 5; this.coreHits = Math.max(0, this.coreHits - 1); } }
      }
      switch (this.state) {
        case 'idle': if (this.cd <= 0) this.chooseAttack(g); return;
        case 'ringWind': if (this.stateT > 0.6) { this.fireRing(g); this.state = 'idle'; this.cd = U.rand(1.2, 2); } return;
        case 'spiral':
          this.spiralT = (this.spiralT || 0) + dt;
          if (this.spiralT > 0.08) { this.spiralT = 0; this.spiralA = (this.spiralA || 0) + 0.4; for (const off of [0, 2.09, 4.19]) this.shoot(g, this.spiralA + off, 85, 9, '#f2d98c'); }
          if (this.stateT > 2.2) { this.state = 'idle'; this.cd = U.rand(1.2, 1.8); }
          return;
        case 'summon':
          if (this.stateT > 0.7) {
            for (let i = 0; i < 3; i++) { const e = g.spawnEnemy(this.phase >= 3 && i === 0 ? 'voidknight' : 'starling', this.center.x + U.rand(-90, 90), this.center.y + U.rand(10, 60)); if (e) { e.aggro = true; g.particles.burst(e.x, e.y - 10, 16, { colors: ['#f2d98c', '#c8a8ff'], speed: 50, life: 0.5, glow: true }); } }
            this.state = 'idle'; this.cd = 1.6;
          }
          return;
        default: this.state = 'idle';
      }
    }
    drift(dt, g) {
      this.moveT -= dt;
      if (this.moveT <= 0 || !this.goal) { this.moveT = U.rand(1.5, 3); const a = Math.random() * 6.28; this.goal = { x: this.center.x + Math.cos(a) * 80, y: this.center.y + Math.sin(a) * 34 }; }
      const n = U.norm(this.goal.x - this.x, this.goal.y - this.y);
      if (U.dist(this.x, this.y, this.goal.x, this.goal.y) > 4 && !this.beam) G.Physics.move(g, this, n.x * 36 * dt, n.y * 36 * dt);
      if (this.target) this.facing = this.target.x < this.x ? -1 : 1;
    }
    chooseAttack(g) {
      const r = Math.random();
      const minions = g.entities.filter((e) => e.isEnemy && !e.dead && e !== this).length;
      if (minions < 2 && r < 0.2) { this.state = 'summon'; this.stateT = 0; return; }
      if (r < 0.55) { this.state = 'ringWind'; this.stateT = 0; return; }
      this.state = 'spiral'; this.stateT = 0;
    }
    shoot(g, a, sp, dmg, color) {
      const pr = new G.Combat.Projectile({ x: this.x + Math.cos(a) * 12, y: this.y + Math.sin(a) * 8, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, team: 'enemy', owner: this, dmg, kind: 'orb', life: 3.6, height: 20, r: 4, color, color2: '#ffffff', light: 20, size: 2 });
      g.addEntity(pr); return pr;
    }
    fireRing(g) {
      const n = this.phase >= 3 ? 16 : 12, off = Math.random() * 6.28;
      for (let i = 0; i < n; i++) this.shoot(g, off + (i / n) * 6.28, 75, 9, '#c8a8ff');
      G.Audio.sfx('bigBolt');
    }
    // ---------------------------------------------------- Raio do Fim (fase 2)
    startBeam(g) {
      const tg = g.players[0] && !g.players[0].isDown ? g.players[0] : this.target;
      if (!tg) return;
      this.beam = { t: 0, wind: 1.3, dur: 3.2, a: U.angle(this.x, this.y - 10, tg.x, tg.y), segs: [], target: tg };
      this.state = 'beam';
      G.Audio.sfx('charge');
      if (!g.flag('hint_beam')) { g.setFlag('hint_beam', true); g.toast('Raio do Fim! Aldren: fique entre o raio e a Lirien com o escudo erguido virado para a Nyxara — o escudo devolve a luz!', 6); }
    }
    updateBeam(dt, g) {
      const b = this.beam;
      b.t += dt;
      if (b.t < b.wind) { const tg = b.target; if (tg && !tg.isDown) b.a = U.angle(this.x, this.y - 10, tg.x, tg.y); b.segs = this.traceBeam(g, true); return; }
      if (!b.fired) { b.fired = true; G.Audio.sfx('beam'); g.camera.shake(3, b.dur); }
      // varre devagar na direção do alvo
      const tg = b.target;
      if (tg && !tg.isDown) { const want = U.angle(this.x, this.y - 10, tg.x, tg.y); let d = want - b.a; while (d > Math.PI) d -= 6.28; while (d < -Math.PI) d += 6.28; b.a += U.clamp(d, -0.6 * dt, 0.6 * dt); }
      b.segs = this.traceBeam(g, false);
      if (b.t > b.wind + b.dur) { this.beam = null; this.state = 'idle'; this.cd = 1.4; this.beamCd = U.rand(4, 5.5); }
    }
    traceBeam(g, preview) {
      const segs = [];
      let x = this.x, y = this.y - 6, dx = Math.cos(this.beam.a), dy = Math.sin(this.beam.a);
      let sx = x, sy = y, reflected = false;
      const al = g.players[1];
      for (let i = 0; i < 160; i++) {
        x += dx * 4; y += dy * 4;
        const td = G.Tiles.def(g.level.tile(Math.floor(x / 16), Math.floor(y / 16)));
        if (td.tall || td.void) break;
        if (preview) continue;
        if (!reflected && al && al.blocking && !al.isDown && U.pointInRect(x, y - 8, al.shieldBox()) && (al.fx * -dx + al.fy * -dy) > 0.3) {
          segs.push([sx, sy, x, y]); sx = x; sy = y;
          dx = al.fx; dy = al.fy; reflected = true;
          if (!this._refT || g.time - this._refT > 0.4) { this._refT = g.time; g.particles.text(al.x, al.y - 36, 'PRISMA!', '#ffe680'); }
          continue;
        }
        if (reflected) {
          if (U.pointInRect(x, y - 8, { x: this.x - 20, y: this.y - this.z - 60, w: 40, h: 64 })) {
            if (!this.hitCd.has(this)) {
              this.hitCd.set(this, 0.25);
              this.hp -= 9; this.flash = 0.1; this.hpShowT = 1;
              g.particles.burst(this.x, this.y - this.z - 30, 10, { colors: ['#ffe680', '#ffffff'], speed: 60, life: 0.4, glow: true });
              if (!this._rcount) this._rcount = 0;
              this._rcount++;
              if (this._rcount >= 8) { this._rcount = 0; this.beam = null; this.state = 'idle'; this.dazedT = 5; this.state = 'dazed'; this.stateT = 0; g.comboText(this.x, this.y - 80, 'RAIO DEVOLVIDO!'); g.registerCombo('raio'); G.Audio.sfx('roar'); return segs; }
            }
            break;
          }
          continue;
        }
        for (const p of g.players) {
          if (!p || p.isDown || this.hitCd.has(p)) continue;
          if (U.pointInRect(x, y - 8, p.hurtBox)) { this.hitCd.set(p, 0.5); p.takeHit({ dmg: 11, src: this, dir: { x: dx, y: dy }, kb: 90 }, g); }
        }
      }
      segs.push([sx, sy, x, y]);
      return segs;
    }
    // ---------------------------------------------------- meteoros (fases 3 e 4)
    rainMeteors(g) {
      const alive = g.players.filter((p) => p && !p.isDown);
      for (const p of alive) for (let i = 0; i < 2; i++) this.meteors.push({ x: p.x + U.rand(-34, 34), y: p.y + U.rand(-20, 20), t: 1.3 + i * 0.3, max: 1.3 + i * 0.3, r: 16 });
      if (Math.random() < 0.35) this.meteors.push({ x: this.center.x + U.rand(-60, 60), y: this.center.y + U.rand(30, 90), t: 2.2, max: 2.2, r: 34, big: true });
    }
    updateMeteors(dt, g) {
      for (const m of this.meteors) {
        const slow = g.stasisAt ? g.stasisAt(m.x, m.y) : 1;
        m.t -= dt * slow;
        if (m.t <= 0 && !m.done) {
          m.done = true;
          G.Audio.sfx(m.big ? 'explosion' : 'break'); if (m.big) g.camera.shake(4, 0.4);
          g.particles.burst(m.x, m.y, m.big ? 40 : 14, { colors: ['#f2d98c', '#ff8a3a', '#ffffff'], speed: m.big ? 110 : 60, life: 0.6, up: 40, g: 200, glow: true });
          for (const p of g.players) if (p && !p.isDown && U.dist(p.x, p.y, m.x, m.y) < m.r) p.takeHit({ dmg: m.big ? 20 : 10, src: null, dir: U.norm(p.x - m.x, p.y - m.y), kb: m.big ? 160 : 80 }, g);
        }
      }
      this.meteors = this.meteors.filter((m) => !m.done);
    }
    toPhase(n, g) {
      this.phase = n; this.state = 'transition'; this.stateT = 0;
      this.dazedT = 0; this.shield = 0; this.beam = null; this.coreDown = false;
      for (const e of g.entities) if (e instanceof G.Combat.Projectile && e.team === 'enemy') e.die(g);
      G.Audio.sfx('roar'); g.camera.shake(6, 1); g.flashScreen('#2a1840', 0.35);
      const s = g.level.def.scripts && g.level.def.scripts['nyxaraPhase' + n];
      if (s) g.co.start(s, g, { blocking: false, name: 'phase' });
    }
    afterPhase(g) {
      if (this.phase === 2) { this.beamCd = 1.5; this.shield = 0; }
      if (this.phase === 3) { this.coreCd = 3; this.meteorCd = 1; }
      if (this.phase === 4) { this.seals = 2; for (const p of g.players) if (p) p.special = Math.max(p.special, 60); }
    }
    draw(ctx, cam, g) {
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - cam.ry);
      // meteoros telegrafados
      for (const m of this.meteors) {
        const mx = Math.round(m.x - cam.rx), my = Math.round(m.y - cam.ry), k = 1 - m.t / m.max;
        ctx.globalAlpha = 0.2 + k * 0.35; P.ellipse(ctx, mx, my, m.r, Math.round(m.r * 0.6), '#5a1a1a'); ctx.globalAlpha = 0.8; P.ring(ctx, mx, my, Math.round(m.r * k), '#ffb84a'); ctx.globalAlpha = 1;
        const fy = my - m.t * 160, fx = mx + m.t * 60;
        P.circle(ctx, Math.round(fx), Math.round(fy), m.big ? 6 : 3, '#ff8a3a'); P.circle(ctx, Math.round(fx), Math.round(fy), m.big ? 4 : 2, '#ffe680');
        g.lighting.add(m.x + m.t * 60, m.y - m.t * 160, m.big ? 50 : 24, 0.8, '#ff9a4a', 0.2);
      }
      // núcleo sobre a ilha (fase 3)
      if (this.phase === 3 && this.coreDown && this.state !== 'dying') {
        const c = this.corePos(), cx = Math.round(c.x - cam.rx), cy = Math.round(c.y - cam.ry) - 18 + Math.round(Math.sin(g.time * 3) * 2);
        P.circle(ctx, cx, cy, 8, '#2a1840'); P.circle(ctx, cx, cy, 6, this.flash > 0 ? '#ffffff' : '#f2d98c'); P.circle(ctx, cx - 2, cy - 2, 2, '#ffffff');
        for (let i = 0; i < this.coreHits; i++) { ctx.fillStyle = '#2a1840'; ctx.fillRect(cx - 4 + i * 3, cy - 5 + i * 3, 1, 4); }
        ctx.globalAlpha = 0.5 + Math.sin(g.time * 6) * 0.2; P.ring(ctx, cx, cy, 12, '#f2d98c'); ctx.globalAlpha = 1;
        g.lighting.add(c.x, c.y - 18, 70, 0.9, '#f2d98c', 0.3);
        if (this.coreTimer < 4 && Math.floor(g.time * 4) % 2) G.Font.draw(ctx, '!', cx, cy - 22, '#ff6a4a', { align: 'center', shadow: true });
      }
      // raio
      if (this.beam) {
        const b = this.beam;
        for (const [x0, y0, x1, y1] of b.segs) {
          const ax = x0 - cam.rx, ay = y0 - 8 - cam.ry, bx = x1 - cam.rx, by = y1 - 8 - cam.ry;
          if (!b.fired) { ctx.globalAlpha = 0.25 + (b.t / b.wind) * 0.35; P.line(ctx, ax, ay, bx, by, '#ff4a6a'); ctx.globalAlpha = 1; continue; }
          const len = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(len / 2));
          ctx.globalAlpha = 0.45; ctx.fillStyle = '#c8a8ff';
          for (let i = 0; i <= n; i++) { const k = i / n; ctx.fillRect(Math.round(ax + (bx - ax) * k) - 2, Math.round(ay + (by - ay) * k) - 2, 5, 5); }
          ctx.globalAlpha = 1;
          P.line(ctx, ax, ay, bx, by, Math.floor(g.time * 24) % 2 ? '#ffffff' : '#ffe8ff');
          for (let i = 0; i <= n; i += 10) { const k = i / n; g.lighting.add(x0 + (x1 - x0) * k, y0 - 8 + (y1 - y0) * k, 30, 0.6, '#c8a8ff', 0.08); }
        }
      }
      if (this.state === 'dormant') { this.drawSeed(ctx, x, y, g); return; }
      P.shadow(ctx, x, y, 36, 0.35);
      const t = g.time, zy = y - Math.round(this.z);
      ctx.globalAlpha = this.state === 'dying' ? Math.max(0, 1 - this.stateT / 4) : 1;
      const W = this.flash > 0;
      // asas de constelação
      for (const s of [-1, 1]) {
        for (let i = 0; i < 6; i++) {
          const a = -0.4 - i * 0.25 + Math.sin(t * 1.5 + i) * 0.05;
          const len = 22 + i * 4;
          const ex = x + s * Math.round(Math.cos(a) * len), ey = zy - 36 + Math.round(Math.sin(a) * len);
          ctx.globalAlpha *= 0.85; P.line(ctx, x + s * 8, zy - 36, ex, ey, W ? '#fff' : '#4e4a8e'); ctx.globalAlpha = this.state === 'dying' ? Math.max(0, 1 - this.stateT / 4) : 1;
          ctx.fillStyle = i % 2 ? '#ffffff' : '#f2d98c'; ctx.fillRect(ex, ey, 2, 2);
        }
      }
      // manto noturno
      for (let j = 0; j < 50; j++) {
        const w = j < 14 ? Math.round(5 + j * 0.45) : Math.round(10 + (j - 14) * 0.45 + Math.sin(t * 2.5 + j * 0.3) * (j > 36 ? 1.5 : 0.5));
        ctx.fillStyle = W ? '#fff' : j < 2 ? '#3a3680' : '#1a1640';
        ctx.fillRect(x - w, zy - 58 + j, w * 2, 1);
        ctx.fillStyle = W ? '#fff' : '#0e0a2a'; ctx.fillRect(x + Math.round(w * 0.4), zy - 58 + j, Math.round(w * 0.6), 1);
      }
      for (let i = 0; i < 22; i++) { const sx = x + Math.round(Math.sin(i * 7.7) * 14), sy = zy - 44 + Math.round((i * 5.3) % 40); if (Math.sin(t * 3 + i) > 0) { ctx.fillStyle = i % 4 ? '#c8a8ff' : '#ffffff'; ctx.fillRect(sx, sy, 1, 1); } }
      // rosto de luz e coroa
      P.circle(ctx, x, zy - 56, 6, W ? '#fff' : '#f8f0ff');
      const eye = this.phase === 4 ? '#ff4a8a' : this.dazedT > 0 ? '#6a6a8a' : '#f2d98c';
      ctx.fillStyle = eye; ctx.fillRect(x - 3, zy - 57, 2, 2); ctx.fillRect(x + 1, zy - 57, 2, 2);
      for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.32; const ex = x + Math.round(Math.cos(a) * 12), ey = zy - 58 + Math.round(Math.sin(a) * 12); ctx.fillStyle = '#f2d98c'; ctx.fillRect(ex, ey, 2, 2); if (i % 2 === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(ex, ey - 2, 1, 2); } }
      // coração estelar
      P.circle(ctx, x, zy - 34, 3 + (Math.floor(t * 6) % 2), this.dazedT > 0 ? '#6a6a8a' : '#f2d98c');
      ctx.globalAlpha = 1;
      g.lighting.add(this.x, this.y - this.z - 50, 90, 0.8, '#c8a8ff', 0.22);
      g.lighting.add(this.x, this.y - this.z - 34, 50, 0.7, '#f2d98c', 0.2);
      if (this.shield > 0 && this.dazedT <= 0 && this.state !== 'dying') {
        const cols = ['#ff8ad8', '#ffe680', '#8ae8ff', '#c8a8ff'];
        ctx.globalAlpha = 0.5 + Math.sin(t * 4) * 0.15;
        for (let i = 0; i < 48; i++) { const a = (i / 48) * 6.28 + t * 0.6; ctx.fillStyle = cols[(i + Math.floor(t * 6)) % 4]; ctx.fillRect(Math.round(x + Math.cos(a) * 42), Math.round(zy - 32 + Math.sin(a) * 40), 2, 2); }
        ctx.globalAlpha = 1;
      }
      if (this.phase === 4 && this.state !== 'dying') {
        for (let i = 0; i < this.seals; i++) { const a = t * 2 + i * Math.PI; P.circle(ctx, Math.round(x + Math.cos(a) * 30), Math.round(zy - 34 + Math.sin(a) * 14), 4, '#f2d98c'); }
      }
      if (this.dazedT > 0) G.FX.stars(ctx, x, zy - 72, t);
    }
    drawSeed(ctx, x, y, g) {
      const t = g.time;
      for (let i = 0; i < 3; i++) { ctx.globalAlpha = 0.25; P.ring(ctx, x, y - 20, 18 + i * 8 + Math.round(Math.sin(t * 2 + i) * 2), '#c8a8ff'); }
      ctx.globalAlpha = 1;
      P.circle(ctx, x, y - 24, 10, '#1a1640'); P.circle(ctx, x, y - 24, 7, '#f2d98c'); P.circle(ctx, x - 2, y - 26, 3, '#ffffff');
      g.lighting.add(this.x, this.y - 24, 90 + Math.sin(t * 3) * 8, 0.9, '#f2d98c', 0.3);
    }
  }
  G.EnemyTypes.nyxara = Nyxara;
})();
