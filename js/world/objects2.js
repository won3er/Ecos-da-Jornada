// Objetos dos Capítulos II e III: gelo derretível, espinheiros/teias, moradores
// congelados, espelhos e feixes de luz, plataformas flutuantes, bolha de Estase
// e queda de estalactites.
(function () {
  const U = G.U, P = G.Pixel, TS = G.TILE;
  const OT = G.ObjectTypes;
  const Obj = G.Obj;

  function drawImg(ctx, img, x, y, cam, ox = 0) {
    ctx.drawImage(img, Math.round(x - img.width / 2 - cam.rx + ox), Math.round(y - img.height - cam.ry));
  }

  // ---------------------------------------------------------------- BLOCO DE GELO
  class IceBlock extends Obj {
    constructor(o) { super(Object.assign({ solid: true, w: 16, h: 14, hh: 20 }, o)); this.blocksProjectiles = true; this.stage = 0; this.wob = 0; this.meltT = 0; }
    init(g) { if (this.flag && g.flag(this.flag)) this.dead = true; }
    onHit(kind, src, g) {
      if (kind === 'fire' || (kind === 'special' && src && src.kind === 'mage')) {
        this.stage++;
        this.wob = 0.25;
        G.Audio.sfx('melt');
        g.particles.burst(this.x, this.y - 10, 14, { colors: ['#bfe4f6', '#ffffff', '#ff8a3a'], speed: 50, life: 0.5, up: 20 });
        if (this.stage >= 3) {
          this.dead = true;
          if (this.flag) g.setFlag(this.flag, true);
          for (let i = 0; i < 10; i++) g.particles.add({ x: this.x + U.rand(-7, 7), y: this.y - U.rand(0, 14), vy: -20, life: 1.2, color: '#e8f4ff', size: 2 });
        }
        return true;
      }
      this.wob = 0.2;
      G.Audio.sfx('immune');
      if (!this._hinted) {
        this._hinted = true;
        const li = g.players[0];
        if (kind === 'heavy' || kind === 'sword') g.bubble(g.players[1], 'Gelo antigo. Duro como aço. Lirien?', 2.4);
        else if (li) g.bubble(li, 'Gelo mágico. Precisa de fogo de verdade.', 2.4);
      }
      return true;
    }
    update(dt) { this.wob = Math.max(0, this.wob - dt); }
    draw(ctx, cam, g) {
      P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, 16, 0.25);
      drawImg(ctx, G.Props.iceBlock(this.stage), this.x, this.y + 1, cam, this.wob > 0 ? (Math.random() < 0.5 ? -1 : 1) : 0);
      g.lighting.add(this.x, this.y - 10, 26, 0.4, '#8ad0f0', 0.1);
    }
  }
  OT.iceblock = IceBlock;

  // ---------------------------------------------------------------- ESPINHEIRO / TEIA (queima)
  class Thorns extends Obj {
    constructor(o) { super(Object.assign({ solid: true, w: 16, h: 14, hh: 18 }, o)); this.blocksProjectiles = o.kind === 'web' ? false : true; this.kind = o.kind || 'thorn'; this.burning = 0; }
    init(g) { if (this.flag && g.flag(this.flag)) this.dead = true; }
    onHit(kind, src, g) {
      if (this.burning) return true;
      if (kind === 'fire') {
        this.burning = 0.01;
        G.Audio.sfx('fire');
        return true;
      }
      G.Audio.sfx('immune');
      if (!this._hinted) {
        this._hinted = true;
        g.bubble(kind === 'sword' || kind === 'heavy' ? g.players[1] : g.players[0], this.kind === 'web' ? 'Teia grossa... gruda em tudo. Fogo resolve.' : 'Espinhos de ferro. A espada só arranha. Fogo?', 2.6);
      }
      return true;
    }
    update(dt, g) {
      if (this.burning > 0) {
        this.burning += dt;
        if (Math.random() < 0.8) g.particles.add({ x: this.x + U.rand(-7, 7), y: this.y - U.rand(0, 14), vy: -30, life: 0.5, color: U.pick(['#ff8a3a', '#ffd84a', '#c8401a']), glow: true });
        if (this.burning > 0.9) {
          this.dead = true;
          if (this.flag) g.setFlag(this.flag, true);
          g.particles.burst(this.x, this.y - 8, 16, { colors: ['#3a2a2a', '#5a4a4a', '#ff8a3a'], speed: 40, life: 0.6, up: 20 });
        }
      }
    }
    draw(ctx, cam, g) {
      if (this.burning > 0) ctx.globalAlpha = Math.max(0.2, 1 - this.burning);
      drawImg(ctx, G.Props.thorns(this.kind === 'web' ? 'web' : g.level.theme === 'snow' ? 'snow' : 'thorn'), this.x, this.y + 2, cam);
      ctx.globalAlpha = 1;
      if (this.burning > 0) g.lighting.add(this.x, this.y - 8, 50, 0.9, '#ff9a4a', 0.3);
    }
  }
  OT.thorns = Thorns;

  // ---------------------------------------------------------------- MORADOR CONGELADO NO TEMPO
  class Frozen extends Obj {
    constructor(o) {
      super(Object.assign({ solid: true, w: 12, h: 8, hh: 26 }, o));
      this.npcId = o.who || o.npc; this.blocksProjectiles = true;
      this.flag = o.flag || ('thaw_' + this.npcId);
      this.thawT = 0;
      const def = G.NPCs[this.npcId] || { look: {} };
      this.sprite = G.Sprites.npc(def.look || {});
      this.facing = o.facing || 1;
    }
    init(g) { if (g.flag(this.flag)) { this.dead = true; this.spawnNpc(g, true); } }
    spawnNpc(g, quiet) {
      if (this._spawned) return;
      this._spawned = true;
      const n = g.addEntity(new G.NPC({ x: this.x, y: this.y - 2, npc: this.npcId, wander: false }));
      n.facing = this.facing;
      if (!quiet) n.justThawed = true;
    }
    canInteract() { return true; }
    prompt() { return 'Olhar'; }
    interact(p, g) {
      const name = (G.NPCs[this.npcId] || {}).name || 'Alguém';
      g.dialogue.start([{ who: 'sign', text: name + ' está congelado no meio de um gesto, como se o tempo tivesse parado. O gelo brilha com uma luz estranha.' }, p.kind === 'mage' ? { who: 'lirien', text: 'Gelo do tempo. Só fogo estelar derrete isso.' } : { who: 'aldren', text: 'Lirien, sua chama consegue derreter isso?' }]);
    }
    onHit(kind, src, g) {
      if (this.thawT > 0) return true;
      if (kind === 'fire') {
        this.thawT = 0.01;
        G.Audio.sfx('melt');
        return true;
      }
      G.Audio.sfx('immune');
      if (kind === 'sword' || kind === 'heavy') g.particles.text(this.x, this.y - 32, 'Cuidado! Tem alguém aí dentro!', '#ffb0a0');
      return true;
    }
    update(dt, g) {
      if (this.thawT > 0) {
        this.thawT += dt;
        if (Math.random() < 0.7) g.particles.add({ x: this.x + U.rand(-9, 9), y: this.y - U.rand(0, 26), vy: -18, life: 0.8, color: U.pick(['#e8f4ff', '#bfe4f6', '#ffd84a']), glow: true });
        if (this.thawT > 1.2) {
          this.dead = true;
          g.setFlag(this.flag, true);
          g.particles.burst(this.x, this.y - 12, 26, { colors: ['#bfe4f6', '#ffffff', '#8ac0e0'], speed: 60, life: 0.7 });
          G.Audio.sfx('shatter');
          this.spawnNpc(g);
          g.onThaw && g.onThaw(this.npcId);
        }
      }
    }
    draw(ctx, cam, g) {
      const img = this.facing < 0 ? this.sprite.flip : this.sprite.img;
      P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, 18, 0.3);
      ctx.drawImage(img, Math.round(this.x - img.width / 2 - cam.rx), Math.round(this.y + 1 - img.height - cam.ry));
      const k = this.thawT > 0 ? Math.max(0, 1 - this.thawT / 1.2) : 1;
      ctx.globalAlpha = k;
      drawImg(ctx, G.Props.iceShell(), this.x, this.y + 2, cam);
      ctx.globalAlpha = 1;
      g.lighting.add(this.x, this.y - 14, 34, 0.5, '#9ad8ff', 0.15 * k);
      if (Math.sin(g.time * 2 + this.x) > 0.9) { ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(this.x - 6 - cam.rx), Math.round(this.y - 20 - cam.ry), 1, 1); }
    }
  }
  OT.frozen = Frozen;

  // ---------------------------------------------------------------- ESPELHO (Aldren gira)
  const DIRV = { right: [1, 0], left: [-1, 0], up: [0, -1], down: [0, 1] };
  function reflectDir(d, orient) {
    // orient 0 = '/', 1 = '\'
    const [dx, dy] = d;
    if (orient === 0) return [-dy, -dx];
    return [dy, dx];
  }
  class Mirror extends Obj {
    constructor(o) { super(Object.assign({ solid: true, w: 14, h: 10, hh: 26 }, o)); this.orient = o.orient || 0; this.blocksProjectiles = false; this.spin = 0; this.fixed = !!o.fixed; }
    canInteract() { return !this.fixed; }
    prompt(p) { return p.kind === 'warrior' ? 'Girar' : 'Girar'; }
    interact(p, g) {
      if (p.kind !== 'warrior') { g.bubble(p, U.pick(['Pesado demais para girar.', 'Aldren, gira esse espelho?']), 2); G.Audio.sfx('immune'); return; }
      this.orient = 1 - this.orient; this.spin = 0.2;
      G.Audio.sfx('lever');
      if (!g.flag('tut_mirror')) { g.setFlag('tut_mirror', true); g.toast('Espelhos desviam a luz. O escudo erguido do Aldren também reflete o feixe para onde ele olha!', 5); }
    }
    get tile() { return [Math.floor(this.x / TS), Math.floor((this.y - 2) / TS)]; }
    update(dt) { this.spin = Math.max(0, this.spin - dt); }
    draw(ctx, cam, g) {
      P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, 16, 0.3);
      drawImg(ctx, G.Props.mirror(this.orient), this.x, this.y + 1, cam, this.spin > 0 ? (Math.random() < 0.5 ? -1 : 1) : 0);
    }
  }
  OT.mirror = Mirror;

  // ---------------------------------------------------------------- RECEPTOR DE LUZ
  class Receptor extends Obj {
    constructor(o) { super(Object.assign({ solid: true, w: 14, h: 10, hh: 22 }, o)); this.litT = 0; this.latched = false; this.blocksProjectiles = true; }
    init(g) { if (this.flag && g.flag(this.flag)) this.latched = true; }
    get tile() { return [Math.floor(this.x / TS), Math.floor((this.y - 2) / TS)]; }
    light(g) {
      if (this.litT <= 0 && !this.latched) { G.Audio.sfx('crystal'); g.particles.burst(this.x, this.y - 12, 12, { colors: ['#ffe680', '#ffffff'], speed: 40, life: 0.5, glow: true }); }
      this.litT = 0.12;
      if (this.data.latch !== false && this.flag && !this.latched) { this.latched = true; g.setFlag(this.flag, true); G.Audio.sfx('solved'); }
    }
    isOn() { return this.litT > 0 || this.latched; }
    onHit(kind) { return true; }
    update(dt) { this.litT = Math.max(0, this.litT - dt); }
    draw(ctx, cam, g) {
      drawImg(ctx, G.Props.receptor(this.isOn()), this.x, this.y + 1, cam);
      g.lighting.add(this.x, this.y - 12, this.isOn() ? 54 : 20, 0.7, '#ffe680', this.isOn() ? 0.25 : 0.06);
    }
  }
  OT.receptor = Receptor;

  // ---------------------------------------------------------------- EMISSOR DE LUZ (feixe)
  class Emitter extends Obj {
    constructor(o) {
      super(Object.assign({ solid: true, w: 14, h: 10, hh: 24 }, o));
      this.dirName = o.dir || 'right';
      this.mode = o.mode || 'always';   // 'always' | 'magic' (acende com magia carregada) | 'signal'
      this.on = this.mode === 'always';
      this.timer = 0; this.dur = o.dur || 0;
      this.segs = []; this.blocksProjectiles = true;
      this.hitCd = new Map();
    }
    init(g) { if (this.flag && g.flag(this.flag)) this.on = true; }
    isOn() { return this.on; }
    onHit(kind, src, g) {
      if (this.mode !== 'magic') return true;
      if (kind === 'charged' || kind === 'special' || kind === 'prism' || kind === 'fire') {
        if (!this.on) { G.Audio.sfx('bigBolt'); g.particles.burst(this.x, this.y - 18, 16, { colors: ['#ffe680', '#ffffff'], speed: 50, life: 0.5, glow: true }); }
        this.on = true; this.timer = this.dur ? g.syncWindow(this.dur) : 0;
        if (!this.dur && this.flag) g.setFlag(this.flag, true);
      } else if (!this.on) {
        G.Audio.sfx('immune');
        if (!this._t || g.time - this._t > 1.5) { this._t = g.time; g.particles.text(this.x, this.y - 32, 'Precisa de magia concentrada', '#ffe680'); }
      }
      return true;
    }
    update(dt, g) {
      if (this.mode === 'signal') this.on = (this.data.requires || []).every((id) => g.signalOn(id));
      if (this.on && this.dur && this.mode === 'magic' && !(this.flag && g.flag(this.flag))) { this.timer -= dt; if (this.timer <= 0) { this.on = false; G.Audio.sfx('plate'); } }
      for (const [k, v] of this.hitCd) { if (v - dt <= 0) this.hitCd.delete(k); else this.hitCd.set(k, v - dt); }
      this.segs = this.on ? this.trace(g) : [];
    }
    trace(g) {
      const segs = [];
      let d = DIRV[this.dirName].slice();
      let x = this.x, y = this.y - 6; // y = coordenada "de chão" do feixe
      let sx = x, sy = y;
      const al = g.players[1];
      let bounces = 0, lastMirror = null;
      for (let step = 0; step < 260; step++) {
        x += d[0] * 4; y += d[1] * 4;
        const tx = Math.floor(x / TS), ty = Math.floor(y / TS);
        if (tx < 0 || ty < 0 || tx >= g.level.w || ty >= g.level.h) break;
        const td = G.Tiles.def(g.level.tile(tx, ty));
        if (td.tall || td.void) break;
        // escudo erguido do Aldren reflete o feixe para onde ele olha
        if (al && al.blocking && !al.isDown && bounces < 12 && U.pointInRect(x, y - 8, { x: al.x - 12, y: al.y - 30, w: 24, h: 32 })) {
          const nd = DIRV[al.dir];
          if (nd && !(nd[0] === -d[0] && nd[1] === -d[1] && false)) {
            segs.push([sx, sy, x, y]);
            if (!this._shieldT || g.time - this._shieldT > 0.6) { this._shieldT = g.time; if (!g.flag('tut_beam_shield')) { g.setFlag('tut_beam_shield', true); g.particles.text(al.x, al.y - 34, 'PRISMA!', '#ffe680'); } }
            d = nd.slice(); sx = x; sy = y; bounces++;
            x = al.x + d[0] * 12; y = al.y - 4 + d[1] * 10;
            segs.push([sx, sy, x, y]); sx = x; sy = y;
            continue;
          }
        }
        let stop = false;
        for (const e of g.entities) {
          if (e.dead || e === this) continue;
          if (e instanceof Mirror) {
            const [mx, my] = e.tile;
            if (mx === tx && my === ty && e !== lastMirror && Math.abs(x - (tx * TS + 8)) <= 2 && Math.abs(y - (ty * TS + 8)) <= 2) {
              x = tx * TS + 8; y = ty * TS + 8;
              segs.push([sx, sy, x, y]); sx = x; sy = y;
              d = reflectDir(d, e.orient); bounces++; lastMirror = e;
              if (bounces > 14) stop = true;
              break;
            }
          } else if (e instanceof Receptor) {
            const [rx, ry] = e.tile;
            if (rx === tx && ry === ty) { e.light(g); stop = true; break; }
          } else if (e.isEnemy) {
            if (e.deathT > 0 || e.intangible) continue;
            if (U.pointInRect(x, y - 8, e.hurtBox)) {
              if (!this.hitCd.has(e)) { this.hitCd.set(e, 0.35); e.takeHit({ dmg: e.boss ? 6 : 9, kind: 'beam', src: null, magic: true, kb: 0 }, g); }
              if (e.blocksBeam) { stop = true; break; }
            }
          } else if (e.solid && e.blocksProjectiles) {
            const b = e.box;
            if (U.pointInRect(x, y, { x: b.x - 1, y: b.y - 4, w: b.w + 2, h: b.h + 6 })) {
              if (e.onHit) e.onHit('beam', null, g);
              stop = true; break;
            }
          }
        }
        if (stop) break;
      }
      segs.push([sx, sy, x, y]);
      return segs;
    }
    draw(ctx, cam, g) {
      drawImg(ctx, G.Props.emitter(this.on), this.x, this.y + 1, cam);
      if (this.on) g.lighting.add(this.x, this.y - 18, 50, 0.8, '#ffe680', 0.25);
      if (this.mode === 'magic' && this.on && this.dur) G.drawTimer(ctx, this.x - cam.rx, this.y - 32 - cam.ry, this.timer / g.syncWindow(this.dur));
    }
    drawBeam(ctx, cam, g) {
      if (!this.segs.length) return;
      const t = g.time;
      for (const [x0, y0, x1, y1] of this.segs) {
        const ax = x0 - cam.rx, ay = y0 - 8 - cam.ry, bx = x1 - cam.rx, by = y1 - 8 - cam.ry;
        ctx.globalAlpha = 0.35; ctx.fillStyle = '#ffd84a';
        const len = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(len / 2));
        for (let i = 0; i <= n; i++) { const k = i / n; ctx.fillRect(Math.round(ax + (bx - ax) * k) - 1, Math.round(ay + (by - ay) * k) - 1, 3, 3); }
        ctx.globalAlpha = 1;
        P.line(ctx, ax, ay, bx, by, Math.floor(t * 20) % 2 ? '#fff6c8' : '#ffffff');
        for (let i = 0; i <= n; i += 8) { const k = i / n; g.lighting.add(x0 + (x1 - x0) * k, y0 - 8 + (y1 - y0) * k, 26, 0.5, '#ffe680', 0.06); }
      }
    }
  }
  OT.emitter = Emitter;

  // ---------------------------------------------------------------- PLATAFORMA FLUTUANTE
  class Platform extends Obj {
    constructor(o) {
      super(Object.assign({ w: 1, h: 1 }, o));
      this.tw = o.tw || 2; this.th = o.th || 2;
      this.path = (o.path || [[0, 0]]).map(([tx, ty]) => ({ x: tx * TS, y: ty * TS }));
      this.px = this.path[0].x; this.py = this.path[0].y;
      this.seg = 0; this.dirStep = 1; this.waitT = o.wait || 1;
      this.speed = (o.speed || 1.6) * TS;
      this.keys = [];
      this.layer = -1;
      this.requires = o.requires || null;
    }
    init(g) { this.stamp(g); }
    get sortY() { return this.py - 1000; }
    stamp(g) {
      const lv = g.level;
      this.x = this.px + this.tw * 8; this.y = this.py + this.th * 16; this.r = this.tw * 16;
      for (const k of this.keys) { const d = lv.dyn.get(k); if (d && d.kind === 'plat' && d.owner === this) lv.dyn.delete(k); }
      this.keys = [];
      const x0 = Math.floor((this.px + 3) / TS), x1 = Math.floor((this.px + this.tw * TS - 4) / TS);
      const y0 = Math.floor((this.py + 3) / TS), y1 = Math.floor((this.py + this.th * TS - 4) / TS);
      for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
        const k = lv.key(tx, ty);
        const cur = lv.dyn.get(k);
        if (cur && cur.kind !== 'plat') continue;
        lv.dyn.set(k, { kind: 'plat', owner: this, t: Infinity });
        this.keys.push(k);
      }
    }
    contains(x, y) { return x >= this.px + 1 && x < this.px + this.tw * TS - 1 && y >= this.py + 1 && y < this.py + this.th * TS + 2; }
    update(dt, g) {
      if (this.path.length < 2) return;
      if (this.requires && !this.requires.every((id) => g.signalOn(id))) return;
      const slow = g.stasisAt ? g.stasisAt(this.px + this.tw * 8, this.py + this.th * 8) : 1;
      dt *= slow;
      if (this.waitT > 0) { this.waitT -= dt; return; }
      let nextI = this.seg + this.dirStep;
      if (nextI < 0 || nextI >= this.path.length) { this.dirStep *= -1; nextI = this.seg + this.dirStep; }
      const tgt = this.path[nextI];
      const dx = tgt.x - this.px, dy = tgt.y - this.py, d = Math.hypot(dx, dy);
      const st = Math.min(d, this.speed * dt);
      const mx = d > 0 ? (dx / d) * st : 0, my = d > 0 ? (dy / d) * st : 0;
      // carrega quem está em cima
      const riders = g.players.filter((p) => p && !p.isDown && p.state !== 'flight' && !p.carried && this.contains(p.x, p.y - 2));
      this.px += mx; this.py += my;
      this.stamp(g);
      for (const p of riders) {
        p.x += mx; p.y += my;
        if (p.carrying) { p.carrying.x = p.x; p.carrying.y = p.y + 1; }
      }
      for (const e of g.entities) if (e.isEnemy && !e.flying && !e.dead && this.contains(e.x, e.y - 2)) { e.x += mx; e.y += my; }
      if (d - st <= 0.01) { this.seg = nextI; this.waitT = this.data.wait || 1; }
    }
    draw(ctx, cam, g) {
      const img = G.Props.platform(this.tw, this.th);
      const x = Math.round(this.px - cam.rx), y = Math.round(this.py - cam.ry);
      ctx.drawImage(img, x, y);
      g.lighting.add(this.px + this.tw * 8, this.py + this.th * 8, 40 + this.tw * 6, 0.5, '#8a86e0', 0.1);
    }
  }
  OT.platform = Platform;

  // ---------------------------------------------------------------- BOLHA DE ESTASE
  class Stasis extends Obj {
    constructor(o) { super(Object.assign({ w: 1, h: 1 }, o)); this.r = o.r || 52; this.life = o.life || 4.5; this.max = this.life; this.layer = -1; }
    contains(x, y) { return U.dist(x, y, this.x, this.y) < this.r; }
    update(dt, g) { this.life -= dt; if (this.life <= 0) { this.dead = true; G.Audio.sfx('uiBack'); } }
    draw(ctx, cam, g) {
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - cam.ry);
      const k = Math.min(1, this.life * 2, (this.max - this.life) * 6);
      ctx.globalAlpha = 0.12 * k; P.ellipse(ctx, x, y - 4, this.r, Math.round(this.r * 0.75), '#c8f0ff'); ctx.globalAlpha = 0.6 * k;
      P.ring(ctx, x, y - 4, this.r, '#c8f0ff');
      // ponteiros de relógio girando devagar
      const a = g.time * 0.6;
      P.line(ctx, x, y - 4, x + Math.cos(a) * 10, y - 4 + Math.sin(a) * 7, '#e8faff');
      P.line(ctx, x, y - 4, x + Math.cos(a * 12) * 6, y - 4 + Math.sin(a * 12) * 4, '#e8faff');
      ctx.globalAlpha = 1;
      if (this.life < 1.2 && Math.floor(this.life * 8) % 2) return;
      g.lighting.add(this.x, this.y - 8, this.r, 0.4, '#a8e0ff', 0.1);
    }
  }
  OT.stasis = Stasis;

  // ---------------------------------------------------------------- QUEDA DE ESTALACTITES (perigo)
  class Icefall extends Obj {
    constructor(o) { super(Object.assign({ w: 1, h: 1 }, o)); this.tw = o.tw || 4; this.th = o.th || 3; this.rate = o.rate || 1.2; this.cd = U.rand(0.5, 1.5); this.drops = []; this.layer = -1; this.dmg = o.dmg || 9; this.meteor = !!o.meteor; }
    update(dt, g) {
      const x0 = this.x - 8, y0 = this.y - 16;
      const near = g.players.some((p) => p && !p.isDown && p.x > x0 - 40 && p.x < x0 + this.tw * TS + 40 && p.y > y0 - 30 && p.y < y0 + this.th * TS + 30);
      this.cd -= dt;
      if (near && this.cd <= 0) {
        this.cd = U.rand(this.rate * 0.6, this.rate * 1.3);
        // às vezes mira em quem está dentro
        const inside = g.players.filter((p) => p && !p.isDown && p.x > x0 && p.x < x0 + this.tw * TS && p.y > y0 && p.y < y0 + this.th * TS);
        const tgt = inside.length && Math.random() < 0.6 ? U.pick(inside) : null;
        const dx = tgt ? tgt.x + U.rand(-8, 8) : x0 + U.rand(4, this.tw * TS - 4), dy = tgt ? tgt.y + U.rand(-4, 4) : y0 + U.rand(4, this.th * TS - 4);
        this.drops.push({ x: dx, y: dy, t: 0.9 });
      }
      for (const d of this.drops) {
        d.t -= dt;
        if (d.t <= 0 && !d.done) {
          d.done = true;
          G.Audio.sfx(this.meteor ? 'break' : 'shatter');
          g.particles.burst(d.x, d.y, 10, { colors: this.meteor ? ['#ff8a3a', '#ffd84a', '#5a3a2a'] : ['#bfe4f6', '#ffffff'], speed: 40, life: 0.4, up: 30, g: 200, glow: this.meteor });
          for (const p of g.players) {
            if (!p || p.isDown || U.dist(p.x, p.y, d.x, d.y) > 12) continue;
            if (p.blocking && p.fy < -0.5) { G.Audio.sfx('block'); continue; } // escudo para cima protege
            p.takeHit({ dmg: this.dmg, src: null, dir: U.norm(p.x - d.x, p.y - d.y), kb: 60 }, g);
          }
        }
      }
      this.drops = this.drops.filter((d) => !d.done);
    }
    draw(ctx, cam, g) {
      for (const d of this.drops) {
        const x = Math.round(d.x - cam.rx), y = Math.round(d.y - cam.ry);
        ctx.globalAlpha = 0.45; P.ellipse(ctx, x, y, Math.round(3 + (0.9 - d.t) * 6), 2, '#0a1a2a'); ctx.globalAlpha = 1;
        const fy = y - d.t * 140;
        if (this.meteor) {
          const fx = x + Math.round(d.t * 50);
          P.circle(ctx, fx, Math.round(fy) - 4, 3, '#ff8a3a'); P.circle(ctx, fx, Math.round(fy) - 4, 2, '#ffe680');
          g.lighting.add(d.x + d.t * 50, d.y - d.t * 140 - 4, 24, 0.7, '#ff9a4a', 0.2);
          if (Math.random() < 0.5) g.particles.add({ x: d.x + d.t * 50, y: d.y - d.t * 140 - 4, vy: -10, life: 0.3, color: '#ffb84a', glow: true });
        } else { ctx.fillStyle = '#a8dcf4'; ctx.fillRect(x - 1, Math.round(fy) - 8, 3, 8); ctx.fillStyle = '#ffffff'; ctx.fillRect(x, Math.round(fy) - 8, 1, 6); }
      }
    }
  }
  OT.icefall = Icefall;

  // ---------------------------------------------------------------- PEDRA RÚNICA (só a Lirien ativa, de perto)
  class RuneStone extends Obj {
    constructor(o) { super(Object.assign({ solid: true, w: 12, h: 8, hh: 24 }, o)); this.on = false; this.blocksProjectiles = true; }
    init(g) { if (this.flag && g.flag(this.flag)) this.on = true; }
    isOn() { return this.on; }
    canInteract() { return !this.on; }
    prompt(p) { return p.kind === 'mage' ? 'Ler a runa' : 'Examinar'; }
    interact(p, g) {
      if (p.kind !== 'mage') { g.bubble(p, 'Runas élficas. Só a Lirien sabe ler isso.', 2.2); return; }
      this.on = true;
      if (this.flag) g.setFlag(this.flag, true);
      G.Audio.sfx('solved');
      g.particles.ring(this.x, this.y - 10, 4, 34, 0.6, '#8ae8ff', 2);
      g.particles.burst(this.x, this.y - 16, 22, { colors: ['#8ae8ff', '#ffffff', '#c8a8ff'], speed: 50, life: 0.8, glow: true });
      if (this.data.say) g.bubble(p, this.data.say, 2.6);
    }
    onHit(kind) { return true; }
    draw(ctx, cam, g) {
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - cam.ry);
      P.shadow(ctx, x, y, 14, 0.3);
      ctx.fillStyle = '#2a2430'; ctx.fillRect(x - 6, y - 22, 12, 22); ctx.fillRect(x - 4, y - 24, 8, 2);
      ctx.fillStyle = '#7a7690'; ctx.fillRect(x - 5, y - 22, 10, 21); ctx.fillStyle = '#9a96b0'; ctx.fillRect(x - 5, y - 22, 2, 20);
      if (g.level.theme === 'snow') { ctx.fillStyle = '#f2f6fb'; ctx.fillRect(x - 5, y - 24, 10, 2); }
      ctx.fillStyle = this.on ? '#8ae8ff' : '#4a4a6a';
      ctx.fillRect(x - 1, y - 18, 2, 10); ctx.fillRect(x - 3, y - 15, 6, 1); ctx.fillRect(x - 3, y - 11, 2, 1); ctx.fillRect(x + 1, y - 9, 2, 1);
      g.lighting.add(this.x, this.y - 14, this.on ? 50 : 22, 0.7, '#8ae8ff', this.on ? 0.25 : 0.08);
      if (!this.on && Math.random() < 0.08) g.particles.add({ x: this.x + U.rand(-4, 4), y: this.y - 20, vy: -10, life: 0.8, color: '#8ae8ff', glow: true });
    }
  }
  OT.rune = RuneStone;

  // ---------------------------------------------------------------- PORTAL ESTELAR (teleporta quem usar)
  class WarpPad extends Obj {
    constructor(o) { super(Object.assign({ w: 14, h: 10 }, o)); this.layer = -1; this.to = o.to; this.label = o.label || 'Atravessar'; this.interactRange = 18; }
    canInteract(p, g) { return !this.data.requires || this.data.requires.every((id) => g.signalOn(id)); }
    prompt() { return this.label; }
    interact(p, g) {
      const [tx, ty] = this.to;
      const from = { x: p.x, y: p.y };
      p.cancelActions(g);
      p.x = tx * TS + 8; p.y = ty * TS + 12; p.lastSafe = { x: p.x, y: p.y };
      g.unstick(p);
      G.Audio.sfx('teleport');
      for (const q of [from, p]) g.particles.burst(q.x, q.y - 10, 18, { colors: ['#c8a8ff', '#ffffff', '#8ae8ff'], speed: 50, life: 0.5, glow: true });
    }
    draw(ctx, cam, g) {
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - 6 - cam.ry);
      const on = this.canInteract(null, g);
      P.ellipse(ctx, x, y, 8, 4, '#1e1a30'); P.ellipse(ctx, x, y, 7, 3, on ? '#6a5ab8' : '#3a3660');
      if (on) {
        ctx.globalAlpha = 0.5 + Math.sin(g.time * 4) * 0.2; P.ring(ctx, x, y, 6 + (Math.floor(g.time * 6) % 3), '#c8a8ff'); ctx.globalAlpha = 1;
        g.lighting.add(this.x, this.y - 8, 34, 0.6, '#c8a8ff', 0.2);
        if (Math.random() < 0.2) g.particles.add({ x: this.x + U.rand(-5, 5), y: this.y - 6, vy: -20, life: 0.6, color: '#c8a8ff', glow: true });
      }
    }
  }
  OT.warppad = WarpPad;
})();
