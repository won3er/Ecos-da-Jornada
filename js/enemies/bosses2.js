// CHEFES DO CAPÍTULO II
// MINI-CHEFE — Grumak, o Urso-de-Geada (Minas de Cristal).
//   Coberto por placas de gelo: a Chama Estelar da Lirien derrete uma placa por
//   vez. Sem placas, fica EXPOSTO. Aldren apara o patada e bloqueia o sopro
//   gelado (quem fica atrás do escudo não congela). Investida contra pilares
//   de cristal ou paredes o deixa tonto.
// CHEFE — Ysveth, a Geada Eterna (Sala do Trono).
//   Fase 1: cópias de gelo (fogo estilhaça; Reflexão devolve as lanças).
//   Fase 2: Parada do Tempo — quem não estiver perto de um braseiro aceso
//           congela; o parceiro quebra o gelo.
//   Fase 3: no trono, atrás de um muro de gelo: só o ARREMESSO leva a Lirien
//           até a ampulheta. Depois, ela cai — e é a vez dos dois.
(function () {
  const U = G.U, P = G.Pixel;

  // ====================================================================== GRUMAK
  class Grumak extends G.Enemy {
    constructor(o) {
      super(o, { type: 'grumak', hp: 440, speed: 30, dmg: 15, aggro: 999, heavyBody: true, noFreeze: true, box: { w: 28, h: 12, hw: 34, hh: 38 }, gold: 0, drops: {}, blood: ['#c8f0ff', '#ffffff'], deathColors: ['#c8f0ff', '#ffffff', '#5a98c4'] });
      this.boss = true; this.name = 'Grumak, o Urso-de-Geada';
      this.state = 'sleep';
      this.plates = 3; this.maxPlates = 3; this.plateCd = 0;
      this.exposedT = 0; this.stunT2 = 0;
      this.cd = 1.5; this.phase2 = false;
      this.drops2 = [];
    }
    get heavyBody() { return true; }
    get stunned() { return this.exposedT > 0 || this.stunT2 > 0; }
    wake(g) { this.state = 'idle'; this.stateT = 0; this.aggro = true; g.bossBar = this; }
    stun() {}
    onParried(by, g) {
      if (this.state !== 'swipe') return;
      this.stunT2 = 1.8; this.state = 'stunned'; this.stateT = 0;
      g.particles.text(this.x, this.y - 50, 'ATORDOADO!', '#ffe680');
    }
    takeHit(hit, g) {
      if (this.state === 'sleep' || this.state === 'dying') return false;
      if (hit.kind === 'fire' && this.plates > 0 && this.plateCd <= 0) {
        this.plates--; this.plateCd = 0.45; this.flash = 0.1;
        G.Audio.sfx('melt'); G.Audio.sfx('shatter');
        g.particles.burst(this.x + U.rand(-12, 12), this.y - 24, 24, { colors: ['#c8f0ff', '#ffffff', '#ff8a3a'], speed: 80, life: 0.6, up: 30 });
        if (this.plates <= 0) this.expose(g);
        else g.particles.text(this.x, this.y - 52, 'A armadura derrete!', '#ffb84a');
        return true;
      }
      return super.takeHit(hit, g);
    }
    modifyDamage(d, hit, g) {
      if (this.exposedT > 0) return d * (hit.kind === 'heavy' || hit.kind === 'sword' ? 1.35 : 1.15);
      if (this.stunT2 > 0) return d * 0.6;
      if (this.plates > 0) {
        if (!this._armTxt || g.time - this._armTxt > 1.2) { this._armTxt = g.time; g.particles.text(this.x, this.y - 52, 'COURAÇA DE GELO', '#a8dcf4'); }
        if (!g.flag('hint_grumak') && g.time - (this._hintT || 0) > 8) { this._hintT = g.time; g.setFlag('hint_grumak', true); g.bubble(g.players[0], 'Gelo grosso. Deixa que eu derreto! Aldren, segura ele!', 3.2); }
        return d * 0.12;
      }
      return d;
    }
    expose(g) {
      this.exposedT = this.phase2 ? 6 : 7; this.state = 'exposed'; this.stateT = 0;
      G.Audio.sfx('roar'); g.camera.shake(4, 0.5);
      g.comboText(this.x, this.y - 58, 'SEM COURAÇA!');
    }
    die(g) {
      if (this.state === 'dying') return;
      this.state = 'dying'; this.stateT = 0; this.hp = 0;
      g.bossBar = null; this.drops2 = [];
      G.Audio.sfx('roar');
      if (this.flag) g.setFlag(this.flag, true);
      for (const e of g.entities) if (e.type === 'snowling' && !e.dead) e.die(g);
    }
    update(dt, g) {
      this.animT += dt; this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt);
      this.plateCd = Math.max(0, this.plateCd - dt);
      this.updateDrops(dt, g);
      if (this.burnT > 0) this.burnT = 0;
      if (this.state === 'sleep') return;
      if (this.state === 'dying') {
        if (Math.random() < 0.5) g.particles.burst(this.x + U.rand(-14, 14), this.y - U.rand(4, 38), 4, { colors: ['#c8f0ff', '#ffffff'], speed: 40, life: 0.5, up: 20 });
        if (this.stateT > 2.4) {
          this.dead = true;
          G.Audio.sfx('explosion'); g.camera.shake(6, 0.6); g.flashScreen('#e8faff', 0.4);
          g.particles.burst(this.x, this.y - 20, 70, { colors: ['#c8f0ff', '#ffffff', '#5a98c4'], speed: 120, life: 1.2, size: 2, g: 150, up: 60 });
          g.onEnemyKilled(this);
          const s = g.level.def.scripts && g.level.def.scripts.grumakDefeated;
          if (s) g.co.start(s, g, { name: 'grumakDefeated', persist: true });
        }
        return;
      }
      if (Math.abs(this.kvx) + Math.abs(this.kvy) > 2) { G.Physics.move(g, this, this.kvx * dt, this.kvy * dt); this.kvx *= 0.85; this.kvy *= 0.85; }
      if (!this.phase2 && this.hp < this.maxHp * 0.5) {
        this.phase2 = true; this.state = 'roar'; this.stateT = 0; this.exposedT = 0;
        G.Audio.sfx('roar'); g.camera.shake(5, 0.8);
        g.toast('Grumak se cobriu de gelo outra vez — e está furioso!', 3);
        this.plates = this.maxPlates = 3;
        for (const off of [-50, 50]) { const e = g.spawnEnemy('snowling', this.x + off, this.y + 20); if (e) e.aggro = true; }
      }
      if (this.exposedT > 0) {
        this.exposedT -= dt;
        if (this.exposedT <= 0) {
          this.plates = this.maxPlates = this.phase2 ? 3 : 2; this.state = 'idle'; this.cd = 0.6;
          G.Audio.sfx('freeze'); g.particles.ring(this.x, this.y - 20, 6, 40, 0.5, '#c8f0ff', 2);
          g.particles.text(this.x, this.y - 52, 'O gelo voltou!', '#a8dcf4');
          // estilhaços ao recongelar
          for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.28; g.addEntity(new G.Combat.Projectile({ x: this.x, y: this.y - 4, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, team: 'enemy', owner: this, dmg: 7, kind: 'icicle', life: 1.6, height: 14, r: 3, color: '#a8dcf4', color2: '#ffffff', light: 0, chill: 1.2 })); }
        }
        return;
      }
      if (this.stunT2 > 0) { this.stunT2 -= dt; if (this.stunT2 <= 0) { this.state = 'idle'; this.cd = 0.8; } return; }
      this.target = this.pickTarget(g);
      const t = this.target;
      const sp = this.speed * (this.phase2 ? 1.3 : 1);
      this.cd -= dt;
      switch (this.state) {
        case 'roar': if (this.stateT > 1.3) { this.state = 'idle'; this.cd = 0.6; } return;
        case 'idle': case 'walk': {
          if (!t) return;
          const d = U.dist(this.x, this.y, t.x, t.y);
          this.facing = t.x < this.x ? -1 : 1;
          if (this.cd <= 0) {
            if (d < 50) { this.state = 'swipeWind'; this.stateT = 0; this.swipeDir = U.norm(t.x - this.x, t.y - this.y); return; }
            const r = Math.random();
            if (r < 0.35) { this.state = 'breathWind'; this.stateT = 0; this.breathDir = U.norm(t.x - this.x, t.y - this.y); return; }
            if (r < 0.65) { this.state = 'chargeWind'; this.stateT = 0; this.chargeTarget = t; return; }
            this.state = 'slamWind'; this.stateT = 0; return;
          }
          if (d > 44) { this.state = 'walk'; this.moveToward(g, t.x, t.y, sp, dt); }
          return;
        }
        case 'swipeWind':
          if (this.stateT > (this.phase2 ? 0.5 : 0.65)) {
            this.state = 'swipe'; this.stateT = 0;
            G.Audio.sfx('heavySwing');
            const n = this.swipeDir;
            for (const p of g.players) {
              if (!p || p.isDown) continue;
              if (U.dist(p.x, p.y, this.x + n.x * 24, this.y + n.y * 16) < 32) p.takeHit({ dmg: this.dmg, src: this, dir: U.norm(p.x - this.x, p.y - this.y), kb: 180 }, g);
            }
            g.particles.ring(this.x + n.x * 24, this.y + n.y * 16 - 6, 4, 30, 0.3, '#c8f0ff', 2);
          }
          return;
        case 'swipe': if (this.stateT > 0.55) { this.state = 'idle'; this.cd = U.rand(0.9, 1.5); } return;
        case 'breathWind':
          if (t) this.breathDir = U.norm(U.lerp(this.breathDir.x, t.x - this.x, 0.02), U.lerp(this.breathDir.y, t.y - this.y, 0.02));
          if (this.stateT > 0.85) { this.state = 'breath'; this.stateT = 0; G.Audio.sfx('wind'); }
          return;
        case 'breath': {
          const n = this.breathDir;
          if (Math.random() < 0.9) for (let i = 0; i < 3; i++) {
            const a = Math.atan2(n.y, n.x) + U.rand(-0.45, 0.45), sp2 = U.rand(100, 160);
            g.particles.add({ x: this.x + n.x * 14, y: this.y - 20 + n.y * 8, vx: Math.cos(a) * sp2, vy: Math.sin(a) * sp2 * 0.8, life: 0.55, color: U.pick(['#e8faff', '#a8dcf4', '#ffffff']), drag: 1, size: 2 });
          }
          if (this.stateT > 0.15 && !this._breathHit) {
            this._breathHit = true;
            const al = g.players[1];
            const shield = al && al.blocking && !al.isDown && (al.fx * -n.x + al.fy * -n.y) > 0.6;
            for (const p of g.players) {
              if (!p || p.isDown) continue;
              const rx = p.x - this.x, ry = p.y - this.y, d = Math.hypot(rx, ry);
              if (d > 92 || d < 1) continue;
              if ((rx * n.x + ry * n.y) / d < 0.75) continue;
              // atrás do escudo do Aldren = protegido
              if (shield) {
                if (p === al) { G.Audio.sfx('block'); continue; }
                const ax = p.x - al.x, ay = p.y - al.y;
                const along = ax * n.x + ay * n.y, side = Math.abs(ax * -n.y + ay * n.x);
                if (along > -2 && side < 14 + along * 0.4) continue;
              }
              const r = p.takeHit({ dmg: 12, src: this, dir: n, kb: 120 }, g);
              if (r === 'hit') p.chillT = Math.max(p.chillT || 0, 2.4);
            }
            if (!g.flag('hint_breath')) { g.setFlag('hint_breath', true); g.toast('Sopro gelado! Lirien: fique atrás do escudo erguido do Aldren.', 4); }
          }
          if (this.stateT > 0.7) { this.state = 'idle'; this._breathHit = false; this.cd = U.rand(0.9, 1.4); }
          return;
        }
        case 'chargeWind':
          if (this.stateT > 0.8) {
            const tg = this.chargeTarget || t;
            const n = tg ? U.norm(tg.x - this.x, tg.y - this.y) : { x: this.facing, y: 0 };
            this.chargeV = { x: n.x * 185, y: n.y * 185 };
            this.state = 'charge'; this.stateT = 0; this.chargeHit = new Set();
          }
          return;
        case 'charge': {
          const r = G.Physics.move(g, this, this.chargeV.x * dt, this.chargeV.y * dt);
          if (Math.random() < 0.6) g.particles.add({ x: this.x + U.rand(-10, 10), y: this.y, vy: -12, life: 0.4, color: '#e8faff', back: true, size: 2 });
          for (const p of g.players) {
            if (!p || p.isDown || this.chargeHit.has(p)) continue;
            if (U.rectsOverlap(this.hurtBox, p.hurtBox)) { this.chargeHit.add(p); p.takeHit({ dmg: 18, src: this, dir: U.norm(this.chargeV.x, this.chargeV.y), kb: 220 }, g); }
          }
          if (r.hitX || r.hitY) {
            G.Audio.sfx('heavyHit'); g.camera.shake(5, 0.4);
            // quebra um pilar de cristal se bater em um
            const tx = Math.floor((this.x + Math.sign(this.chargeV.x) * 20) / 16), ty = Math.floor((this.y - 4 + Math.sign(this.chargeV.y) * 10) / 16);
            for (let dy2 = -1; dy2 <= 1; dy2++) for (let dx2 = -1; dx2 <= 1; dx2++) {
              const ch = g.level.tile(tx + dx2, ty + dy2);
              if (ch === 'x') {
                g.level.setTile(tx + dx2, ty + dy2, 'f');
                g.entities = g.entities.filter((e) => !(e instanceof G.TileProp && e.tx === tx + dx2 && e.ty === ty + dy2));
                g.particles.burst((tx + dx2) * 16 + 8, (ty + dy2) * 16, 30, { colors: ['#7ac0e8', '#d0f0ff', '#ffffff'], speed: 90, life: 0.7, up: 40, g: 200 });
                G.Audio.sfx('shatter');
              }
            }
            this.stunT2 = 2.6; this.state = 'stunned'; this.stateT = 0;
            g.particles.text(this.x, this.y - 50, 'TONTO!', '#ffe680');
            if (!g.flag('hint_grumak2')) { g.setFlag('hint_grumak2', true); g.toast('Ele bateu e ficou tonto! Aproveitem!', 3); }
          } else if (this.stateT > 1.4) { this.state = 'idle'; this.cd = U.rand(0.8, 1.3); }
          return;
        }
        case 'slamWind':
          if (this.stateT > 0.8) {
            this.state = 'slam'; this.stateT = 0;
            G.Audio.sfx('explosion'); g.camera.shake(5, 0.4);
            g.particles.ring(this.x, this.y, 6, 46, 0.45, '#c8f0ff', 2);
            for (const p of g.players) if (p && !p.isDown && U.dist(p.x, p.y, this.x, this.y) < 44) p.takeHit({ dmg: 14, src: this, dir: U.norm(p.x - this.x, p.y - this.y), kb: 160 }, g);
            // estalactites caem do teto da arena
            for (const p of g.players) if (p && !p.isDown) for (let i = 0; i < (this.phase2 ? 3 : 2); i++) this.drops2.push({ x: p.x + U.rand(-28, 28), y: p.y + U.rand(-18, 18), t: 1 + i * 0.25 });
          }
          return;
        case 'slam': if (this.stateT > 0.6) { this.state = 'idle'; this.cd = U.rand(1, 1.6); } return;
        case 'stunned': return;
        default: this.state = 'idle';
      }
    }
    updateDrops(dt, g) {
      for (const d of this.drops2) {
        d.t -= dt;
        if (d.t <= 0 && !d.done) {
          d.done = true; G.Audio.sfx('shatter');
          g.particles.burst(d.x, d.y, 10, { colors: ['#bfe4f6', '#ffffff'], speed: 40, life: 0.4, up: 30, g: 200 });
          for (const p of g.players) if (p && !p.isDown && U.dist(p.x, p.y, d.x, d.y) < 13) p.takeHit({ dmg: 10, src: null, dir: U.norm(p.x - d.x, p.y - d.y), kb: 70 }, g);
        }
      }
      this.drops2 = this.drops2.filter((d) => !d.done);
    }
    draw(ctx, cam, g) {
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - cam.ry);
      for (const d of this.drops2) {
        const dx = Math.round(d.x - cam.rx), dy = Math.round(d.y - cam.ry);
        ctx.globalAlpha = 0.45; P.ellipse(ctx, dx, dy, Math.round(3 + (1 - Math.min(1, d.t)) * 7), 3, '#0a1a2a'); ctx.globalAlpha = 1;
        const fy = dy - d.t * 130; ctx.fillStyle = '#a8dcf4'; ctx.fillRect(dx - 1, Math.round(fy) - 9, 3, 9); ctx.fillStyle = '#fff'; ctx.fillRect(dx, Math.round(fy) - 9, 1, 7);
      }
      if (this.state === 'swipeWind') { ctx.globalAlpha = 0.3; P.ellipse(ctx, Math.round(x + this.swipeDir.x * 24), Math.round(y + this.swipeDir.y * 16), 30, 20, '#ff3a2a'); ctx.globalAlpha = 1; }
      if (this.state === 'slamWind') { const k = this.stateT / 0.8; ctx.globalAlpha = 0.2 + k * 0.3; P.ellipse(ctx, x, y, 44, 32, '#ff3a2a'); ctx.globalAlpha = 1; }
      if (this.state === 'breathWind') {
        const n = this.breathDir, k = this.stateT / 0.85;
        ctx.globalAlpha = 0.18 + k * 0.25;
        for (let i = 0; i < 18; i++) { const a = Math.atan2(n.y, n.x) + (i / 17 - 0.5) * 1.4; P.line(ctx, x, y - 6, x + Math.cos(a) * 92, y - 6 + Math.sin(a) * 92 * 0.8, '#a8dcf4'); }
        ctx.globalAlpha = 1;
      }
      P.shadow(ctx, x, y, 40, 0.35);
      if (this.state === 'dying') ctx.globalAlpha = Math.max(0.2, 1 - this.stateT / 2.4);
      let lift = 0, shake = 0;
      if (this.state === 'walk' || this.state === 'charge') lift = Math.floor(this.animT * (this.state === 'charge' ? 12 : 5)) % 2;
      if (this.state === 'chargeWind' || this.state === 'slamWind') shake = Math.round(Math.sin(this.stateT * 55));
      this.drawBody(ctx, x + shake, y - lift, g);
      ctx.globalAlpha = 1;
      if (this.stunned) G.FX.stars(ctx, x, y - 54, g.time);
    }
    drawBody(ctx, x, y, g) {
      const W = this.flash > 0;
      const fur = W ? '#fff' : '#e8eef6', furD = W ? '#fff' : '#a8b4c8', furK = W ? '#fff' : '#5a6478', nose = '#1a1a2a';
      const f = this.facing;
      const sleeping = this.state === 'sleep';
      // patas traseiras
      ctx.fillStyle = furK; ctx.fillRect(x - 15, y - 12, 10, 12); ctx.fillRect(x + 5, y - 12, 10, 12);
      ctx.fillStyle = furD; ctx.fillRect(x - 14, y - 12, 8, 10); ctx.fillRect(x + 6, y - 12, 8, 10);
      // corpo
      P.ellipse(ctx, x, y - 22, 20, 15, furK);
      P.ellipse(ctx, x, y - 23, 19, 14, fur);
      P.ellipse(ctx, x - f * 4, y - 20, 12, 9, furD);
      // cabeça
      const hx = x + f * 14, hy = y - 32 + (sleeping ? 8 : 0);
      P.ellipse(ctx, hx, hy, 10, 8, furK); P.ellipse(ctx, hx, hy - 1, 9, 7, fur);
      ctx.fillStyle = furK; ctx.fillRect(hx - 8, hy - 9, 4, 4); ctx.fillRect(hx + 4, hy - 9, 4, 4);
      ctx.fillStyle = nose; ctx.fillRect(hx + f * 7 - 1, hy, 3, 2);
      const eye = sleeping ? furK : (this.phase2 ? '#ff4a4a' : '#5ad8ff');
      ctx.fillStyle = eye; ctx.fillRect(hx + f * 2 - 1, hy - 3, 2, 2); ctx.fillRect(hx + f * 5 - 1, hy - 3, 2, 2);
      if (!sleeping) g.lighting.add(hx, hy - 3, 22, 0.6, eye, 0.2);
      if (this.state === 'breath' || this.state === 'breathWind') { ctx.fillStyle = '#2a1a2a'; ctx.fillRect(hx + f * 6 - 2, hy + 3, 4, 3); }
      // patas dianteiras (patada levanta)
      const arm = this.state === 'swipeWind' ? -10 : this.state === 'swipe' ? 4 : this.state === 'slamWind' ? -14 : 0;
      ctx.fillStyle = furK; ctx.fillRect(x + f * 6 - 5, y - 18 + arm, 11, 18 - arm);
      ctx.fillStyle = fur; ctx.fillRect(x + f * 6 - 4, y - 18 + arm, 9, 16 - arm);
      ctx.fillStyle = '#d8e4f0'; for (let i = 0; i < 3; i++) ctx.fillRect(x + f * 6 - 3 + i * 3, y - 2 + (arm < 0 ? arm + 16 : 0), 1, 2);
      // couraça de gelo (placas)
      const plates = [[-10, -32, 12, 9], [4, -36, 12, 10], [-4, -22, 14, 9]];
      for (let i = 0; i < this.plates; i++) {
        const [px, py, pw, ph] = plates[i];
        const ax = x + px * f - (f < 0 ? pw : 0);
        ctx.fillStyle = '#2a6a98'; ctx.fillRect(ax, y + py, pw, ph);
        ctx.fillStyle = '#7ac0e8'; ctx.fillRect(ax + 1, y + py + 1, pw - 2, ph - 2);
        ctx.fillStyle = '#d0f0ff'; ctx.fillRect(ax + 1, y + py + 1, pw - 2, 2); ctx.fillRect(ax + 2, y + py + 3, 1, ph - 5);
      }
      if (this.plates > 0) g.lighting.add(this.x, this.y - 26, 50, 0.5, '#7ac0e8', 0.12);
      if (this.exposedT > 0 && Math.floor(g.time * 8) % 2) { ctx.globalAlpha = 0.25; P.ellipse(ctx, x, y - 23, 20, 15, '#ffe680'); ctx.globalAlpha = 1; }
    }
  }
  G.EnemyTypes.grumak = Grumak;

  // ====================================================================== YSVETH
  class IceDecoy extends G.Enemy {
    constructor(o) {
      super(o, { type: 'decoy', hp: 1, speed: 0, dmg: 0, aggro: 999, heavyBody: true, noFreeze: true, box: { w: 16, h: 8, hw: 22, hh: 44 }, gold: 0, drops: {}, deathColors: ['#c8f0ff', '#ffffff'] });
      this.boss2 = o.boss; this.flying = true; this.z = 12; this.offset = o.offset || 0; this.noBestiary = true;
    }
    takeHit(hit, g) {
      if (this.deathT > 0) return false;
      if (hit.kind === 'fire' || hit.kind === 'charged' || hit.kind === 'special' || hit.kind === 'prism' || hit.kind === 'impact' || hit.kind === 'bolt' || hit.kind === 'heavy') {
        G.Audio.sfx('shatter');
        g.particles.burst(this.x, this.y - 30, 30, { colors: ['#c8f0ff', '#ffffff', '#8ad0f0'], speed: 90, life: 0.6 });
        g.particles.text(this.x, this.y - 56, 'Cópia de gelo!', '#a8dcf4');
        this.deathT = 0.001; this.dead = true;
        return true;
      }
      G.Audio.sfx('immune');
      return true;
    }
    update(dt, g) {
      this.animT += dt; this.flash = Math.max(0, this.flash - dt);
      const b = this.boss2;
      if (!b || b.dead || b.state === 'dying') { this.dead = true; return; }
      const a = g.time * 0.7 + this.offset;
      const tx = b.center.x + Math.cos(a) * 80, ty = b.center.y + Math.sin(a) * 40;
      G.Physics.move(g, this, (tx - this.x) * dt * 1.5, (ty - this.y) * dt * 1.5);
      this.z = 12 + Math.sin(this.animT * 2 + this.offset) * 3;
      this.facing = g.players[0] && g.players[0].x < this.x ? -1 : 1;
    }
    draw(ctx, cam, g) { if (this.boss2) this.boss2.drawFigure(ctx, cam, g, this.x, this.y, this.z, 0.82, true, this.facing); }
  }
  G.EnemyTypes.decoy = IceDecoy;

  class Ysveth extends G.Enemy {
    constructor(o) {
      super(o, { type: 'ysveth', hp: 620, speed: 40, dmg: 12, aggro: 999, heavyBody: true, noFreeze: true, noStun: true, box: { w: 18, h: 10, hw: 24, hh: 46 }, gold: 0, drops: {}, deathColors: ['#c8f0ff', '#ffffff', '#f2d98c'] });
      this.boss = true; this.name = 'Ysveth, a Geada Eterna';
      this.flying = true; this.z = 14;
      this.state = 'dormant'; this.phase = 1;
      this.center = { x: this.x, y: this.y };
      this.cd = 2; this.decoys = []; this.vulnT = 0; this.decoyCd = 0;
      this.stopCd = 6; this.stopRing = null;
      this.coreHits = 0; this.dazedT = 0; this.shield = 0;
      this.moveT = 0; this.goal = null;
    }
    get heavyBody() { return true; }
    get stunned() { return this.dazedT > 0; }
    stun() {}
    activate(g) { this.state = 'idle'; this.stateT = 0; this.aggro = true; g.bossBar = this; this.cd = 1.2; this.spawnDecoys(g); }
    vulnerable() { return this.vulnT > 0 || this.dazedT > 0 || this.phase === 2; }
    spawnDecoys(g) {
      for (const d of this.decoys) if (!d.dead) d.dead = true;
      this.decoys = [];
      for (let i = 0; i < (this.phase === 1 ? 2 : 3); i++) {
        const d = new IceDecoy({ x: this.x + (i ? 40 : -40), y: this.y, boss: this, offset: (i + 1) * 2.1 });
        g.addEntity(d); this.decoys.push(d);
      }
      this.shield = 1; this.vulnT = 0;
      G.Audio.sfx('freeze');
      g.particles.ring(this.x, this.y - 30, 6, 50, 0.5, '#c8f0ff', 2);
      if (!g.flag('hint_decoy')) { g.setFlag('hint_decoy', true); g.bubble(g.players[0], 'Cópias de gelo! O fogo quebra as falsas. A de verdade não se esconde do calor.', 3.6); }
    }
    takeHit(hit, g) {
      if (['dormant', 'dying', 'transition'].includes(this.state)) return false;
      if (hit.kind === 'reflected_big' || (hit.kind === 'bolt' && hit.proj && hit.proj.wasLance)) {
        // lança devolvida pela Reflexão
        this.vulnT = Math.max(this.vulnT, 3); this.flash = 0.2;
        g.comboText(this.x, this.y - 70, 'LANÇA DEVOLVIDA!'); g.registerCombo('lanca');
        this.hp -= 18; g.particles.text(this.x, this.y - 56, 18, '#ffd84a');
        const fl = this.phaseFloor(); if (fl !== null && this.hp < fl) this.hp = fl;
        if (this.hp <= 0) this.die(g);
        return true;
      }
      if (this.phase === 3 && this.state !== 'grounded') {
        // de perto (depois de arremessada por cima do muro), a magia da Lirien racha a ampulheta
        const src = hit.src;
        const magic = ['charged', 'fire', 'special', 'impact', 'bolt', 'prism'].includes(hit.kind);
        if (magic && src && src.isPlayer && src.kind === 'mage' && U.dist(src.x, src.y, this.x, this.y) < 84 && (!this._coreT || g.time - this._coreT > 0.7)) {
          this._coreT = g.time; this.hitCore(g, hit.kind); return true;
        }
        G.Audio.sfx('immune');
        if (!this._tTxt || g.time - this._tTxt > 1.4) { this._tTxt = g.time; g.particles.text(this.x, this.y - 64, 'O tempo desvia o golpe', '#c8f0ff'); }
        return true;
      }
      if (this.phase === 1 && this.vulnT <= 0) {
        const live = this.decoys.filter((d) => !d.dead).length;
        G.Audio.sfx('immune');
        if (!this._sTxt || g.time - this._sTxt > 1.2) { this._sTxt = g.time; g.particles.text(this.x, this.y - 64, live ? 'Escudo das cópias' : 'Escudo do tempo', '#c8f0ff'); }
        return true;
      }
      return super.takeHit(hit, g);
    }
    modifyDamage(d, hit) { return d * (this.dazedT > 0 ? 1.4 : 1); }
    phaseFloor() { return this.phase === 1 ? Math.floor(this.maxHp * 0.655) : this.phase === 2 ? Math.floor(this.maxHp * 0.335) : null; }
    die(g) {
      if (this.state === 'dying') return;
      this.state = 'dying'; this.stateT = 0; this.hp = 0;
      g.bossBar = null;
      for (const d of this.decoys) d.dead = true;
      for (const e of g.entities) if ((e.isEnemy && e !== this) || (e instanceof G.Combat.Projectile && e.team === 'enemy')) { if (e.isEnemy && e.die) e.die(g); else e.dead = true; }
      this.stopRing = null;
      G.Audio.playMusic(null, 1);
      G.Audio.sfx('roar');
    }
    update(dt, g) {
      this.animT += dt; this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt);
      this.burnT = 0;
      if (this.state === 'dormant') return;
      if (this.state === 'dying') {
        this.z = U.approach(this.z, 4, dt * 10);
        if (Math.random() < 0.6) g.particles.burst(this.x + U.rand(-12, 12), this.y - this.z - U.rand(4, 44), 3, { colors: ['#c8f0ff', '#ffffff', '#f2d98c'], speed: 50, life: 0.7, glow: true });
        if (this.stateT > 3.2) {
          this.dead = true;
          G.Audio.sfx('explosion'); g.flashScreen('#ffffff', 0.8); g.camera.shake(8, 1);
          g.particles.burst(this.x, this.y - 30, 90, { colors: ['#c8f0ff', '#ffffff', '#f2d98c'], speed: 140, life: 1.6, glow: true, size: 2 });
          g.onEnemyKilled(this);
          const s = g.level.def.scripts && g.level.def.scripts.ysvethDefeated;
          if (s) g.co.start(s, g, { name: 'ysvethDefeated', persist: true });
        }
        return;
      }
      const k = this.hp / this.maxHp;
      if (this.phase === 1 && k < 0.66) { this.toPhase(2, g); return; }
      if (this.phase === 2 && k < 0.34) { this.toPhase(3, g); return; }
      if (this.state === 'transition') {
        this.z = U.approach(this.z, 20, dt * 20);
        if (this.phase === 3) { // voa até o trono
          const th = g.level.def.throne;
          G.Physics.move(g, this, (th.x - this.x) * dt * 2, (th.y - this.y) * dt * 2);
        }
        if (this.stateT > 2.2) { this.state = 'idle'; this.stateT = 0; this.cd = 1; if (this.phase === 3) this.setupThrone(g); }
        return;
      }
      this.updateStop(dt, g);
      if (this.dazedT > 0) {
        this.dazedT -= dt; this.z = U.approach(this.z, 2, dt * 30);
        if (this.dazedT <= 0) { this.state = 'idle'; this.cd = 1; }
        return;
      }
      this.z = U.approach(this.z, 14 + Math.sin(this.animT * 2) * 3, dt * 20);
      this.target = this.pickTarget(g);
      this.cd -= dt;
      if (this.phase === 1) {
        if (this.vulnT > 0) { this.vulnT -= dt; if (this.vulnT <= 0) this.spawnDecoys(g); }
        else if (!this.decoys.some((d) => !d.dead)) { this.vulnT = 6; this.shield = 0; G.Audio.sfx('shatter'); g.comboText(this.x, this.y - 70, 'VULNERÁVEL!'); }
      }
      if (this.phase === 2) {
        this.stopCd -= dt;
        if (this.stopCd <= 0 && !this.stopRing) { this.stopCd = U.rand(9, 11); this.castStop(g); }
      }
      if (this.phase === 3) { this.updateThrone(dt, g); return; }
      this.drift(dt, g);
      switch (this.state) {
        case 'idle': if (this.cd <= 0) this.chooseAttack(g); return;
        case 'lanceWind':
          if (this.stateT > 0.8) { this.fireLances(g); this.state = 'idle'; this.cd = U.rand(1.4, 2); }
          return;
        case 'fanWind':
          if (this.stateT > 0.6) {
            const tg = this.target; if (tg) {
              const base = U.angle(this.x, this.y, tg.x, tg.y);
              for (let i = -3; i <= 3; i++) this.icicle(g, base + i * 0.16, 95);
              for (const d of this.decoys) if (!d.dead) for (let i = -1; i <= 1; i++) this.icicle(g, U.angle(d.x, d.y, tg.x, tg.y) + i * 0.2, 85, d);
            }
            G.Audio.sfx('freeze'); this.state = 'idle'; this.cd = U.rand(1.3, 1.9);
          }
          return;
        case 'summon':
          if (this.stateT > 0.8) {
            for (const off of [-60, 60]) { const e = g.spawnEnemy('knight', this.center.x + off, this.center.y + 40); if (e) { e.aggro = true; g.particles.burst(e.x, e.y - 12, 20, { colors: ['#c8f0ff', '#ffffff'], speed: 50, life: 0.6 }); } }
            this.state = 'idle'; this.cd = 2;
          }
          return;
        default: this.state = 'idle';
      }
    }
    drift(dt, g) {
      this.moveT -= dt;
      if (this.moveT <= 0 || !this.goal) { this.moveT = U.rand(1.6, 3); const a = Math.random() * 6.28; this.goal = { x: this.center.x + Math.cos(a) * 70, y: this.center.y + Math.sin(a) * 36 }; }
      const n = U.norm(this.goal.x - this.x, this.goal.y - this.y);
      if (U.dist(this.x, this.y, this.goal.x, this.goal.y) > 4) G.Physics.move(g, this, n.x * 34 * dt, n.y * 34 * dt);
      if (this.target) this.facing = this.target.x < this.x ? -1 : 1;
    }
    chooseAttack(g) {
      const r = Math.random();
      const knights = g.entities.filter((e) => e.type === 'knight' && !e.dead).length;
      if (this.phase === 2 && knights === 0 && r < 0.25) { this.state = 'summon'; this.stateT = 0; return; }
      if (r < 0.5) { this.state = 'lanceWind'; this.stateT = 0; return; }
      this.state = 'fanWind'; this.stateT = 0;
    }
    icicle(g, a, sp, from) {
      const src = from || this;
      g.addEntity(new G.Combat.Projectile({ x: src.x + Math.cos(a) * 10, y: src.y + Math.sin(a) * 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, team: 'enemy', owner: this, dmg: 8, kind: 'icicle', life: 3, height: 18, r: 3, color: '#a8dcf4', color2: '#ffffff', light: 16, chill: 1 }));
    }
    fireLances(g) {
      // lanças grandes e lentas: a Reflexão do Aldren devolve
      const tg = g.players[0] && !g.players[0].isDown ? g.players[0] : this.target;
      if (!tg) return;
      for (const off of [-0.25, 0.25]) {
        const a = U.angle(this.x, this.y, tg.x, tg.y) + off;
        const pr = new G.Combat.Projectile({ x: this.x + Math.cos(a) * 12, y: this.y + Math.sin(a) * 8, vx: Math.cos(a) * 75, vy: Math.sin(a) * 75, team: 'enemy', owner: this, dmg: 14, kind: 'icicle', life: 4, height: 20, r: 6, size: 3, color: '#c8f0ff', color2: '#ffffff', light: 30, chill: 1.6, homing: 0.4, target: tg });
        pr.wasLance = true; pr.onlyBoss = true;
        g.addEntity(pr);
      }
      G.Audio.sfx('freeze');
      if (!g.flag('hint_lance')) { g.setFlag('hint_lance', true); g.toast('Aldren: apare as lanças de gelo no momento certo para devolvê-las à Ysveth!', 4); }
    }
    // ---------------------------------------------------- fase 2: Parada do Tempo
    castStop(g) {
      this.stopRing = { t: 0, max: 1.6 };
      G.Audio.sfx('stasis');
      if (!g.flag('hint_stop')) { g.setFlag('hint_stop', true); g.toast('Parada do Tempo! Fiquem perto de um braseiro aceso — o calor protege do gelo.', 5); }
    }
    updateStop(dt, g) {
      const r = this.stopRing;
      if (!r) return;
      r.t += dt;
      if (r.t >= r.max) {
        this.stopRing = null;
        G.Audio.sfx('freeze'); g.flashScreen('#c8f0ff', 0.2);
        const braz = g.entities.filter((e) => e instanceof G.ObjectTypes.brazier && e.lit);
        for (const p of g.players) {
          if (!p || p.isDown) continue;
          if (braz.some((b) => U.dist(b.x, b.y, p.x, p.y) < 46)) { g.particles.text(p.x, p.y - 30, 'Aquecido!', '#ffb84a'); continue; }
          this.freezePlayer(p, g);
        }
      }
    }
    freezePlayer(p, g) {
      p.cancelActions(g);
      p.frozenSolid = 3;
      g.particles.burst(p.x, p.y - 10, 20, { colors: ['#c8f0ff', '#ffffff'], speed: 50, life: 0.5 });
      p.say(p.kind === 'mage' ? 'Não consigo me mexer!' : 'Congelei! Me tira daqui!', 2);
    }
    toPhase(n, g) {
      this.phase = n; this.state = 'transition'; this.stateT = 0;
      this.vulnT = 0; this.shield = 0;
      for (const d of this.decoys) d.dead = true;
      for (const e of g.entities) if (e instanceof G.Combat.Projectile && e.team === 'enemy') e.die(g);
      G.Audio.sfx('roar'); g.camera.shake(5, 1); g.flashScreen('#c8f0ff', 0.3);
      const s = g.level.def.scripts && g.level.def.scripts['ysvethPhase' + n];
      if (s) g.co.start(s, g, { blocking: false, name: 'phase' });
    }
    // ---------------------------------------------------- fase 3: o trono
    setupThrone(g) {
      this.coreHits = 0;
      // ninguém começa a fase já em cima da plataforma do trono
      for (const p of g.players) {
        if (!p || p.y > 9 * 16) continue;
        const from = { x: p.x, y: p.y };
        p.cancelActions(g); p.x = U.clamp(p.x, 5 * 16, 26 * 16); p.y = 12 * 16; g.unstick(p);
        for (const q of [from, p]) g.particles.burst(q.x, q.y - 10, 14, { colors: ['#c8f0ff', '#ffffff'], speed: 40, life: 0.5 });
      }
      const wall = g.entities.filter((e) => e.id === 'throne_ice');
      for (const w of wall) w.raise(g);
      for (const e of g.entities) if (e.type === 'knight' && !e.dead) e.die(g);
    }
    updateThrone(dt, g) {
      const th = g.level.def.throne;
      this.x = U.lerp(this.x, th.x, dt * 2); this.y = U.lerp(this.y, th.y, dt * 2);
      if (this.state === 'grounded') {
        this.z = U.approach(this.z, 2, dt * 30);
        if (this.stateT > 1 && this.cd <= 0) {
          this.cd = U.rand(1.6, 2.4);
          const tg = this.pickTarget(g); if (tg) { const base = U.angle(this.x, this.y, tg.x, tg.y); for (let i = -2; i <= 2; i++) this.icicle(g, base + i * 0.2, 90); G.Audio.sfx('freeze'); }
        }
        return;
      }
      // tempestade: estilhaços para todo lado e cavaleiros de vez em quando
      if (this.cd <= 0) {
        this.cd = U.rand(1.2, 1.8);
        const off = Math.random() * 6.28;
        for (let i = 0; i < 10; i++) this.icicle(g, off + (i / 10) * 6.28, 70);
        G.Audio.sfx('freeze');
        if (g.entities.filter((e) => e.type === 'knight' && !e.dead).length < 2 && Math.random() < 0.4) {
          const e = g.spawnEnemy('knight', this.center.x + U.rand(-70, 70), this.center.y + 70, { armor: false }); if (e) e.aggro = true;
        }
      }
    }
    hitCore(g, kind) {
      if (this.state === 'grounded' || this.phase !== 3) return;
      this.coreHits++;
      this.flash = 0.2; G.Audio.sfx('shatter'); g.camera.shake(4, 0.4);
      g.comboText(this.x, this.y - 74, 'A AMPULHETA RACHA!');
      this.hp -= 20;
      if (this.coreHits >= 3) {
        this.state = 'grounded'; this.stateT = 0; this.cd = 1.5;
        for (const w of g.entities.filter((e) => e.id === 'throne_ice')) w.shatter(g);
        g.flashScreen('#ffffff', 0.4);
        g.toast('A ampulheta quebrou! Ysveth caiu — ataquem juntos!', 4);
        const s = g.level.def.scripts && g.level.def.scripts.ysvethGrounded;
        if (s) g.co.start(s, g, { blocking: false, name: 'phase' });
      }
      if (this.hp <= 0) this.die(g);
    }
    draw(ctx, cam, g) {
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - cam.ry);
      if (this.stopRing) {
        const r = this.stopRing, k = r.t / r.max;
        const R = Math.round(20 + k * 260);
        ctx.globalAlpha = 0.15 + k * 0.25; P.ring(ctx, x, y - 10, R, '#c8f0ff', 3); ctx.globalAlpha = 1;
        for (const b of g.entities) if (b instanceof G.ObjectTypes.brazier && b.lit) { ctx.globalAlpha = 0.35; P.ring(ctx, Math.round(b.x - cam.rx), Math.round(b.y - cam.ry), 46, '#ffb84a'); ctx.globalAlpha = 1; }
      }
      if (this.state === 'dormant') { this.drawFigure(ctx, cam, g, this.x, this.y, 0, 1, false, 1, true); return; }
      let a = 1;
      if (this.state === 'dying') a = Math.max(0, 1 - this.stateT / 3.2);
      this.drawFigure(ctx, cam, g, this.x, this.y, this.z, a, false, this.facing);
      if (this.phase === 1 && this.vulnT <= 0 && this.state !== 'transition') {
        ctx.globalAlpha = 0.4 + Math.sin(g.time * 4) * 0.15;
        P.ring(ctx, x, y - Math.round(this.z) - 26, 30, '#c8f0ff', 2);
        ctx.globalAlpha = 1;
      }
      if (this.dazedT > 0 || this.state === 'grounded') G.FX.stars(ctx, x, y - Math.round(this.z) - 58, g.time);
      if (this.phase === 3 && this.state !== 'grounded') {
        // ampulheta flutuando acima dela
        const hx = x, hy = y - Math.round(this.z) - 66 + Math.round(Math.sin(g.time * 2) * 2);
        ctx.fillStyle = '#c8b07a'; ctx.fillRect(hx - 6, hy - 9, 12, 2); ctx.fillRect(hx - 6, hy + 8, 12, 2);
        ctx.fillStyle = this.flash > 0 ? '#fff' : '#a8dcf4'; ctx.fillRect(hx - 5, hy - 7, 10, 4); ctx.fillRect(hx - 3, hy - 3, 6, 2); ctx.fillRect(hx - 1, hy - 1, 2, 2); ctx.fillRect(hx - 3, hy + 1, 6, 2); ctx.fillRect(hx - 5, hy + 3, 10, 5);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(hx - 1, hy + 4, 1, 3);
        for (let i = 0; i < this.coreHits; i++) { ctx.fillStyle = '#1a2a4a'; ctx.fillRect(hx - 4 + i * 3, hy - 6 + i * 4, 1, 4); }
        g.lighting.add(this.x, this.y - this.z - 66, 40, 0.8, '#a8dcf4', 0.3);
      }
    }
    drawFigure(ctx, cam, g, wx, wy, z, alpha, decoy, facing, dormant) {
      const x = Math.round(wx - cam.rx), y = Math.round(wy - cam.ry);
      const t = g.time;
      if (!decoy) P.shadow(ctx, x, y, 28, 0.35);
      ctx.globalAlpha = alpha * (decoy ? 0.85 : 1);
      const zy = y - Math.round(z);
      const W = this.flash > 0 && !decoy;
      const gown = W ? '#fff' : decoy ? '#a8d8f0' : '#8ac8ec', gownL = W ? '#fff' : '#d8f4ff', gownD = W ? '#fff' : decoy ? '#6aa8d0' : '#4a88b8';
      if (dormant) {
        // presa no gelo do próprio trono
        ctx.globalAlpha = 0.9;
        P.ellipse(ctx, x, y - 22, 16, 24, '#5a98c4'); P.ellipse(ctx, x, y - 23, 14, 22, '#a8dcf4');
        ctx.fillStyle = '#e8faff'; ctx.fillRect(x - 8, y - 40, 2, 26);
        ctx.globalAlpha = 1;
        g.lighting.add(wx, wy - 24, 60 + Math.sin(t * 2) * 5, 0.8, '#a8dcf4', 0.3);
        return;
      }
      // vestido de gelo em sino
      for (let j = 0; j < 40; j++) {
        const w = j < 12 ? Math.round(4 + j * 0.35) : Math.round(8 + (j - 12) * 0.5 + Math.sin(t * 3 + j * 0.4) * (j > 30 ? 1 : 0.4));
        ctx.fillStyle = j < 2 ? gownL : gown;
        ctx.fillRect(x - w, zy - 44 + j, w * 2, 1);
        ctx.fillStyle = gownD; ctx.fillRect(x + Math.round(w * 0.4), zy - 44 + j, Math.round(w * 0.6), 1);
        ctx.fillStyle = gownL; ctx.fillRect(x - w, zy - 44 + j, 1, 1);
      }
      // cauda de cristais
      for (let i = 0; i < 8; i++) { const bx = x - 22 + i * 6, len = 3 + ((Math.sin(t * 3 + i * 1.3) + 1) * 2) | 0; ctx.fillStyle = gownL; ctx.fillRect(bx, zy - 5, 4, len); }
      // rosto
      ctx.fillStyle = W ? '#fff' : '#f0f6ff'; ctx.fillRect(x - 4, zy - 52, 8, 9);
      ctx.fillStyle = '#e8eef8'; ctx.fillRect(x - 5, zy - 50, 1, 6); ctx.fillRect(x + 4, zy - 50, 1, 6);
      const eye = this.phase === 3 ? '#ff6ab8' : '#5ad8ff';
      ctx.fillStyle = eye; ctx.fillRect(x - 3 + (facing > 0 ? 1 : 0), zy - 49, 2, 1); ctx.fillRect(x + 1 + (facing > 0 ? 1 : 0), zy - 49, 2, 1);
      // cabelo branco esvoaçante
      for (let i = 0; i < 6; i++) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 6 - facing * i * 2, zy - 54 + i * 3 + Math.round(Math.sin(t * 4 + i) * 1), 3, 3); }
      // coroa de gelo
      for (const [ox, h] of [[-5, 6], [-2, 9], [1, 11], [4, 8]]) for (let k = 0; k < h; k++) { ctx.fillStyle = k < 2 ? '#ffffff' : '#a8dcf4'; ctx.fillRect(x + ox, zy - 54 - h + k, 2, 1); }
      // braços / mangas
      for (const side of [-1, 1]) for (let j = 0; j < 14; j++) { ctx.fillStyle = j > 10 ? gownL : gown; ctx.fillRect(Math.round(x + side * (8 + j * 0.7)) - 1, zy - 40 + j, 3, 1); }
      ctx.globalAlpha = 1;
      if (!decoy) g.lighting.add(wx, wy - z - 30, 70, 0.7, '#a8dcf4', 0.2);
      else if (Math.sin(t * 9 + wx) > 0.95) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 2, zy - 30, 1, 1); }
    }
  }
  G.EnemyTypes.ysveth = Ysveth;

  // muro de gelo do trono (baixo: não deixa passar a pé nem projéteis,
  // mas dá para ARREMESSAR a Lirien por cima)
  class ThroneIce extends G.Obj {
    constructor(o) { super(Object.assign({ w: 16, h: 14, hh: 14 }, o)); this.up = false; this.low = true; this.anim = 0; }
    raise(g) { this.up = true; this.solid = true; this.blocksProjectiles = true; G.Audio.sfx('freeze'); for (const p of g.players) if (p && U.rectsOverlap(p.box, this.box)) g.unstick(p, { x: this.x, y: this.y + 40 }); }
    shatter(g) { this.up = false; this.solid = false; this.blocksProjectiles = false; g.particles.burst(this.x, this.y - 6, 14, { colors: ['#c8f0ff', '#ffffff'], speed: 60, life: 0.6, up: 30 }); }
    onHit(kind, src, g) { if (!this.up) return false; G.Audio.sfx('immune'); if (!this._h) { this._h = true; g.bubble(g.players[1], 'Não dá para quebrar... mas dá para jogar alguém por cima!', 3); } return true; }
    update(dt) { this.anim = U.approach(this.anim, this.up ? 1 : 0, dt * 4); }
    draw(ctx, cam) {
      if (this.anim <= 0.01) return;
      const h = Math.round(14 * this.anim);
      const x = Math.round(this.x - 8 - cam.rx), y = Math.round(this.y - cam.ry);
      ctx.fillStyle = '#2a6a98'; ctx.fillRect(x, y - h, 16, h);
      ctx.fillStyle = '#8ad0f0'; ctx.fillRect(x + 1, y - h + 1, 14, h - 2);
      ctx.fillStyle = '#e8faff'; ctx.fillRect(x + 1, y - h + 1, 14, 2); ctx.fillRect(x + 3, y - h + 3, 1, Math.max(1, h - 6));
    }
  }
  G.ObjectTypes.throneice = ThroneIce;
})();
