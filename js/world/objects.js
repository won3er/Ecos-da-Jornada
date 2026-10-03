// Objetos interativos do mundo: puzzles, baús, portões, barreiras, checkpoints etc.
// Cada tipo é registrado em G.ObjectTypes e pode ser criado a partir dos mapas.
(function () {
  const U = G.U, P = G.Pixel, TS = G.TILE;
  const OT = {};
  G.ObjectTypes = OT;

  // Base para objetos de 1 tile
  class Obj extends G.Entity {
    constructor(o) {
      super(Object.assign({ w: 14, h: 12 }, o));
      this.interactRange = o.interactRange || 20;
      this.flag = o.flag || null;
    }
    canInteract(p, g) { return false; }
    prompt(p) { return 'Usar'; }
    interact(p, g) {}
    isOn() { return false; }
    // reage a ataques (kind: 'sword'|'heavy'|'bolt'|'charged'|'frost'|'special')
    onHit(kind, src, g) { return false; }
  }
  G.Obj = Obj;

  function drawImg(ctx, img, x, y, cam, ox = 0) {
    ctx.drawImage(img, Math.round(x - img.width / 2 - cam.rx + ox), Math.round(y - img.height - cam.ry));
  }

  // ---------------------------------------------------------------- PLACA
  class Sign extends Obj {
    constructor(o) { super(Object.assign({ solid: true, w: 12, h: 8 }, o)); this.img = G.Props.sign(); this.text = o.text; }
    canInteract() { return true; }
    prompt() { return 'Ler'; }
    interact(p, g) { g.dialogue.start([{ who: 'sign', text: this.text }]); }
    draw(ctx, cam) { drawImg(ctx, this.img, this.x, this.y + 1, cam); }
  }
  OT.sign = Sign;

  // ---------------------------------------------------------------- BAÚ
  class Chest extends Obj {
    constructor(o) {
      super(Object.assign({ solid: true, w: 14, h: 8 }, o));
      this.contents = o.contents || [];
      this.gold = o.gold || 0;
      this.fancy = !!o.fancy;
      this.hidden = !!o.hidden;
      this.revealed = !this.hidden;
      this.open = false;
      this.appear = this.revealed ? 1 : 0;
    }
    init(g) {
      if (this.flag && g.flag(this.flag)) this.open = true;
      if (this.hidden && this.flag && g.flag(this.flag + '_rev')) { this.revealed = true; this.appear = 1; }
      if (!this.revealed) this.solid = false;
    }
    reveal(g) {
      if (this.revealed) return;
      this.revealed = true; this.solid = true;
      if (this.flag) g.setFlag(this.flag + '_rev', true);
      g.particles.burst(this.x, this.y - 6, 18, { colors: ['#c8f4ff', '#9ae0ff', '#ffffff'], speed: 50, life: 0.8, glow: true });
      G.Audio.sfx('crystal');
      g.toast('Algo escondido foi revelado!');
    }
    canInteract() { return this.revealed && !this.open; }
    prompt() { return 'Abrir'; }
    interact(p, g) {
      this.open = true;
      if (this.flag) g.setFlag(this.flag, true);
      G.Audio.sfx('chest');
      g.particles.burst(this.x, this.y - 10, 16, { colors: ['#ffe680', '#ffffff', '#f2d98c'], speed: 40, life: 0.7, up: 30 });
      const got = [];
      if (this.gold) { g.addGold(this.gold); got.push(this.gold + ' moedas'); }
      for (const c of this.contents) { g.inv.add(c.item, c.qty || 1, g); got.push(G.Items[c.item].name + (c.qty > 1 ? ' x' + c.qty : '')); }
      if (got.length) g.toast('Obtido: ' + got.join(', '), 3.5);
    }
    update(dt) { if (this.revealed) this.appear = Math.min(1, this.appear + dt * 2); }
    draw(ctx, cam, g) {
      if (!this.revealed) {
        // brilho sutil indica algo oculto
        if (Math.sin(g.time * 3 + this.x) > 0.9) { ctx.fillStyle = 'rgba(200,240,255,0.6)'; ctx.fillRect(Math.round(this.x - cam.rx), Math.round(this.y - 8 - cam.ry), 1, 1); }
        return;
      }
      ctx.globalAlpha = this.appear;
      P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, 16, 0.3);
      drawImg(ctx, G.Props.chest(this.open, this.fancy), this.x, this.y + 1, cam);
      ctx.globalAlpha = 1;
      if (!this.open && this.fancy) g.lighting.add(this.x, this.y - 6, 30, 0.5, '#b8a0ff', 0.15);
    }
  }
  OT.chest = Chest;

  // ---------------------------------------------------------------- CAIXOTE (empurrável)
  class Crate extends Obj {
    constructor(o) {
      super(Object.assign({ solid: true, w: 16, h: 16 }, o));
      this.blocksProjectiles = true;
      this.moving = null; // {fx,fy,tx,ty,t}
      this.home = { x: this.x, y: this.y };
      this.heavy = true;
    }
    canInteract(p) { return !this.moving; }
    prompt(p) { return p.kind === 'warrior' ? 'Agarrar' : 'Empurrar'; }
    interact(p, g) {
      if (p.kind !== 'warrior') { g.bubble(p, U.pick(G.Lines.tooHeavy), 2); return; }
      p.startGrab(this, g);
    }
    tileX() { return Math.floor(this.x / TS); }
    tileY() { return Math.floor((this.y - 1) / TS); }
    canMoveTo(dx, dy, g, ignore) {
      const nb = { x: this.x - 8 + dx * TS + 1, y: this.y - 16 + dy * TS + 1, w: 14, h: 14 };
      const tx = this.tileX() + dx, ty = this.tileY() + dy;
      if (g.level.blocksAt(tx, ty)) return false;
      for (const e of g.solids) if (e !== this && e !== ignore && !e.dead && e.solid && U.rectsOverlap(nb, e.box)) return false;
      for (const p of g.players) if (p && p !== ignore && !p.isDown && U.rectsOverlap(nb, p.box)) return false;
      return true;
    }
    push(dx, dy, g, ignore) {
      if (this.moving || !this.canMoveTo(dx, dy, g, ignore)) return false;
      this.moving = { fx: this.x, fy: this.y, tx: this.x + dx * TS, ty: this.y + dy * TS, t: 0 };
      G.Audio.sfx('push');
      return true;
    }
    update(dt, g) {
      if (this.moving) {
        const m = this.moving;
        m.t += dt / 0.28;
        const k = Math.min(1, m.t);
        this.x = U.lerp(m.fx, m.tx, k); this.y = U.lerp(m.fy, m.ty, k);
        if (Math.random() < 0.4) g.particles.add({ x: this.x + U.rand(-7, 7), y: this.y, vy: -5, life: 0.4, color: '#b8a888', back: true });
        if (k >= 1) this.moving = null;
      }
    }
    draw(ctx, cam) { P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, 16, 0.3); drawImg(ctx, G.Props.crate(), this.x, this.y + 1, cam); }
  }
  OT.crate = Crate;

  // ---------------------------------------------------------------- ALAVANCA (só força física)
  class Lever extends Obj {
    constructor(o) {
      super(Object.assign({ solid: true, w: 12, h: 8 }, o));
      this.on = false;
      this.momentary = o.momentary || 0;   // segundos ativo (puzzle de sincronia)
      this.timer = 0;
    }
    init(g) { if (this.flag && g.flag(this.flag)) this.on = true; }
    canInteract() { return !this.on || this.momentary; }
    prompt(p) { return 'Puxar'; }
    interact(p, g) {
      if (p.kind !== 'warrior') { g.bubble(p, U.pick(G.Lines.leverStuck), 2.2); G.Audio.sfx('immune'); return; }
      this.on = true; G.Audio.sfx('lever');
      g.particles.burst(this.x, this.y - 8, 6, { color: '#c8b07a', speed: 30, life: 0.3 });
      if (this.momentary) this.timer = g.syncWindow(this.momentary);
      else if (this.flag) g.setFlag(this.flag, true);
    }
    isOn() { return this.on; }
    update(dt, g) {
      if (this.momentary && this.on) {
        this.timer -= dt;
        if (this.timer <= 0 && !g.flag(this.flag)) { this.on = false; G.Audio.sfx('plate'); }
      }
    }
    draw(ctx, cam, g) {
      drawImg(ctx, G.Props.lever(this.on), this.x, this.y + 1, cam);
      if (this.momentary && this.on && !g.flag(this.flag)) drawTimer(ctx, this.x - cam.rx, this.y - 20 - cam.ry, this.timer / g.syncWindow(this.momentary));
    }
  }
  OT.lever = Lever;

  function drawTimer(ctx, x, y, k) {
    x = Math.round(x); y = Math.round(y);
    ctx.fillStyle = '#1a1424'; ctx.fillRect(x - 9, y, 18, 4);
    ctx.fillStyle = '#ffd84a'; ctx.fillRect(x - 8, y + 1, Math.round(16 * U.clamp(k, 0, 1)), 2);
  }
  G.drawTimer = drawTimer;

  // ---------------------------------------------------------------- PLACA DE PRESSÃO
  class Plate extends Obj {
    constructor(o) {
      super(Object.assign({ w: 12, h: 12 }, o));
      this.layer = -1;
      this.kind = o.kind || 'normal'; // 'heavy' = só Aldren ou caixote
      this.pressed = false;
      this.wasPressed = false;
    }
    isOn() { return this.pressed; }
    update(dt, g) {
      const r = { x: this.x - 6, y: this.y - 14, w: 12, h: 12 };
      let p = false;
      for (const pl of g.players) {
        if (!pl || pl.isDown || pl.z > 2) continue;
        if (this.kind === 'heavy' && pl.kind !== 'warrior') continue;
        if (U.rectsOverlap(r, pl.box)) p = true;
      }
      for (const e of g.solids) if (e instanceof Crate && !e.moving && U.rectsOverlap(r, e.box)) p = true;
      for (const e of g.entities) if (e instanceof FloatStone && !e.lifted && U.rectsOverlap(r, e.box)) p = true;
      if (p && !this.wasPressed) {
        G.Audio.sfx('plate');
        if (this.kind === 'heavy') {
          // Lirien sobre a placa pesada: dica
        }
      }
      if (!p && this.kind === 'heavy') {
        for (const pl of g.players) if (pl && pl.kind === 'mage' && U.rectsOverlap(r, pl.box) && !this._hinted) { this._hinted = true; g.bubble(pl, 'Não afunda. Sou leve demais.', 2.4); }
      }
      this.pressed = p; this.wasPressed = p;
    }
    draw(ctx, cam) { drawImg(ctx, G.Props.plate(this.pressed, this.kind === 'heavy' ? 'n' : 'rune'), this.x, this.y, cam); }
  }
  OT.plate = Plate;

  // ---------------------------------------------------------------- CRISTAL (só magia)
  class CrystalSwitch extends Obj {
    constructor(o) {
      super(Object.assign({ solid: true, w: 12, h: 8, hh: 22 }, o));
      this.on = false;
      this.momentary = o.momentary || 0;
      this.timer = 0;
      this.blocksProjectiles = true;
    }
    init(g) { if (this.flag && g.flag(this.flag)) this.on = true; }
    isOn() { return this.on; }
    onHit(kind, src, g) {
      if (this.data.needs === 'prism' && kind !== 'prism') {
        if (kind === 'bolt' || kind === 'charged') {
          G.Audio.sfx('immune');
          if (!this._pt || g.time - this._pt > 1.5) { this._pt = g.time; g.particles.text(this.x, this.y - 30, 'Precisa de luz refletida', '#ffe680'); }
        }
        return true;
      }
      if (kind === 'bolt' || kind === 'charged' || kind === 'frost' || kind === 'special' || kind === 'prism') {
        if (this.on && !this.momentary) return true;
        this.on = true;
        G.Audio.sfx('crystal');
        g.particles.burst(this.x, this.y - 12, 14, { colors: ['#8ae8ff', '#ffffff'], speed: 50, life: 0.5, glow: true });
        if (this.momentary) this.timer = g.syncWindow(this.momentary);
        else if (this.flag) g.setFlag(this.flag, true);
        return true;
      }
      if (kind === 'sword' || kind === 'heavy') {
        G.Audio.sfx('immune');
        g.particles.text(this.x, this.y - 26, 'Precisa de magia', '#b8c8ff');
        return true;
      }
      return false;
    }
    update(dt, g) {
      if (this.momentary && this.on) {
        this.timer -= dt;
        if (this.timer <= 0 && !g.flag(this.flag)) this.on = false;
      }
    }
    draw(ctx, cam, g) {
      drawImg(ctx, G.Props.crystalSwitch(this.on, this.data.needs === 'prism'), this.x, this.y + 1, cam);
      if (this.on) g.lighting.add(this.x, this.y - 12, 40, 0.7, '#6ad8ff', 0.25);
      else g.lighting.add(this.x, this.y - 12, 18, 0.3, '#6a6aff', 0.1);
      if (this.momentary && this.on && !g.flag(this.flag)) drawTimer(ctx, this.x - cam.rx, this.y - 30 - cam.ry, this.timer / g.syncWindow(this.momentary));
    }
  }
  OT.crystal = CrystalSwitch;

  // ---------------------------------------------------------------- PORTÃO
  class Gate extends Obj {
    constructor(o) {
      super(Object.assign({ solid: true, w: 16, h: 16 }, o));
      this.requires = o.requires || [];
      this.open = false;
      this.anim = 0;
      this.blocksProjectiles = true;
      this.latch = o.latch !== false;
      this.closedBy = o.closedBy || null; // fechado por script (arenas)
    }
    init(g) {
      if (this.flag && g.flag(this.flag)) { this.open = true; this.solid = false; this.blocksProjectiles = false; this.anim = 1; }
    }
    setOpen(v, g, silent) {
      if (this.open === v) return;
      this.open = v; this.solid = !v; this.blocksProjectiles = !v;
      if (!silent) {
        G.Audio.sfx('gate');
        g.camera.shake(1.5, 0.3);
        g.particles.burst(this.x, this.y - 4, 10, { color: '#8a8692', speed: 30, life: 0.5 });
      }
      if (v && this.latch && this.flag) g.setFlag(this.flag, true);
    }
    update(dt, g) {
      if (this.requires.length && !this.open) {
        const all = this.requires.every((id) => g.signalOn(id));
        if (all) {
          this.setOpen(true, g);
          G.Audio.sfx('solved');
          g.showEvent(this.x, this.y - 8);
        }
      } else if (this.requires.length && this.open && !this.latch) {
        if (!this.requires.every((id) => g.signalOn(id))) {
          // não fecha se alguém está embaixo
          if (!g.players.some((p) => p && U.rectsOverlap(p.box, this.box))) this.setOpen(false, g);
        }
      }
      this.anim = U.approach(this.anim, this.open ? 1 : 0, dt * 3);
    }
    draw(ctx, cam) {
      const img = G.Props.gate(this.anim > 0.5, 'h');
      const sx = Math.round(this.x - 8 - cam.rx), sy = Math.round(this.y - 28 - cam.ry);
      if (this.anim > 0 && this.anim < 1) {
        // grade subindo
        const off = Math.round(this.anim * 20);
        ctx.drawImage(G.Props.gate(false, 'h'), 0, 0, 16, 28 - off, sx, sy, 16, 28 - off);
      } else ctx.drawImage(img, sx, sy);
    }
  }
  OT.gate = Gate;

  // ---------------------------------------------------------------- BARREIRA MÁGICA (magia carregada)
  class MagicBarrier extends Obj {
    constructor(o) { super(Object.assign({ solid: true, w: 16, h: 16, hh: 26 }, o)); this.blocksProjectiles = true; this.hits = 0; this.wob = 0; }
    init(g) { if (this.flag && g.flag(this.flag)) this.dead = true; }
    onHit(kind, src, g) {
      if (kind === 'charged' || kind === 'special') {
        this.dead = true;
        if (this.flag) g.setFlag(this.flag, true);
        G.Audio.sfx('barrier');
        g.camera.shake(3, 0.3);
        g.particles.burst(this.x, this.y - 12, 40, { colors: ['#c08aff', '#ffffff', '#7a4aff'], speed: 90, life: 0.9, glow: true });
        g.particles.ring(this.x, this.y - 10, 4, 30, 0.5, '#d8b0ff');
        return true;
      }
      this.wob = 0.3;
      G.Audio.sfx('immune');
      if (kind === 'bolt') g.particles.text(this.x, this.y - 30, 'Fraco demais', '#d8b0ff');
      else if (kind === 'sword' || kind === 'heavy') g.particles.text(this.x, this.y - 30, 'Barreira mágica', '#d8b0ff');
      if (!this._hinted && g.players[0]) { this._hinted = true; g.bubble(g.players[0], 'Uma barreira. Preciso concentrar mais magia.', 2.6); }
      return true;
    }
    update(dt) { this.wob = Math.max(0, this.wob - dt); }
    draw(ctx, cam, g) {
      const x = Math.round(this.x - 8 - cam.rx), y = Math.round(this.y - 26 - cam.ry);
      const t = g.time;
      ctx.globalAlpha = 0.75;
      for (let j = 0; j < 26; j++) {
        const off = Math.round(Math.sin(t * 4 + j * 0.5) * (this.wob > 0 ? 2 : 0.6));
        ctx.fillStyle = j % 4 === Math.floor(t * 8) % 4 ? '#e0c8ff' : '#8a5ad8';
        ctx.fillRect(x + 1 + off, y + j, 14, 1);
      }
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 3; i++) ctx.fillRect(x + 2 + ((i * 5 + Math.floor(t * 12)) % 12), y + ((i * 9 + Math.floor(t * 20)) % 24), 1, 2);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#4a2a7a'; ctx.fillRect(x, y + 24, 16, 2);
      g.lighting.add(this.x, this.y - 12, 36, 0.6, '#a070ff', 0.2);
    }
  }
  OT.barrier = MagicBarrier;

  // ---------------------------------------------------------------- ROCHA RACHADA (golpe pesado)
  class CrackedRock extends Obj {
    constructor(o) { super(Object.assign({ solid: true, w: 16, h: 14, hh: 18 }, o)); this.blocksProjectiles = true; this.wob = 0; this.wall = !!o.wall; }
    init(g) { if (this.flag && g.flag(this.flag)) this.dead = true; }
    onHit(kind, src, g) {
      if (kind === 'heavy' || kind === 'special' || kind === 'golem') {
        this.dead = true;
        if (this.flag) g.setFlag(this.flag, true);
        G.Audio.sfx('break');
        g.camera.shake(4, 0.35);
        g.particles.burst(this.x, this.y - 8, 30, { colors: ['#7a746c', '#9a948a', '#5a5450'], speed: 80, life: 0.8, size: 2, g: 200, up: 60 });
        if (this.wall) g.toast('Uma passagem secreta!');
        return true;
      }
      this.wob = 0.2;
      G.Audio.sfx('immune');
      g.particles.burst(this.x, this.y - 8, 4, { color: '#9a948a', speed: 30, life: 0.3 });
      if (!this._hinted) {
        this._hinted = true;
        const al = g.players[1];
        if (al) g.bubble(al, kind === 'sword' ? 'Rachada... um golpe mais forte resolve.' : 'Magia não vai rachar pedra. Deixa comigo.', 2.6);
      }
      return true;
    }
    update(dt) { this.wob = Math.max(0, this.wob - dt); }
    draw(ctx, cam) {
      const ox = this.wob > 0 ? (Math.random() < 0.5 ? -1 : 1) : 0;
      if (this.wall) {
        const img = G.Tiles.wallTex('cave', true, 'cave', 1);
        const x = Math.round(this.x - 8 - cam.rx + ox), y = Math.round(this.y - 16 - cam.ry);
        ctx.drawImage(img, x, y);
        ctx.fillStyle = '#120c10';
        for (const [a, b] of [[7, 3], [8, 4], [8, 5], [7, 6], [6, 7], [7, 8], [8, 9], [9, 10], [9, 11], [5, 7], [4, 8], [10, 9], [11, 9]]) ctx.fillRect(x + a, y + b, 1, 1);
        return;
      }
      P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, 18, 0.3);
      drawImg(ctx, G.Props.crackedRock(), this.x, this.y + 2, cam, ox);
    }
  }
  OT.cracked = CrackedRock;

  // ---------------------------------------------------------------- BARRICADA (espada)
  class Barricade extends Obj {
    constructor(o) { super(Object.assign({ solid: true, w: 16, h: 12, hh: 18 }, o)); this.hp = 3; this.wob = 0; this.blocksProjectiles = true; }
    init(g) { if (this.flag && g.flag(this.flag)) this.dead = true; }
    onHit(kind, src, g) {
      if (kind === 'sword' || kind === 'heavy' || kind === 'special' || kind === 'golem') {
        this.hp -= kind === 'sword' ? 1 : 3;
        this.wob = 0.2;
        G.Audio.sfx('hit');
        g.particles.burst(this.x, this.y - 8, 6, { colors: ['#9a6a3a', '#5a3a1e'], speed: 50, life: 0.5, g: 150, up: 40 });
        if (this.hp <= 0) {
          this.dead = true; if (this.flag) g.setFlag(this.flag, true);
          G.Audio.sfx('break');
          g.particles.burst(this.x, this.y - 8, 24, { colors: ['#9a6a3a', '#b8864e', '#5a3a1e'], speed: 80, life: 0.8, size: 2, g: 200, up: 60 });
        }
        return true;
      }
      G.Audio.sfx('immune');
      if (!this._hinted && g.players[0]) { this._hinted = true; g.bubble(g.players[0], 'Madeira molhada. Aldren, quebra isso?', 2.4); }
      return true;
    }
    update(dt) { this.wob = Math.max(0, this.wob - dt); }
    draw(ctx, cam) { drawImg(ctx, G.Props.barricade(), this.x, this.y + 2, cam, this.wob > 0 ? 1 : 0); }
  }
  OT.barricade = Barricade;

  // ---------------------------------------------------------------- ARBUSTO (cortável)
  class Bush extends Obj {
    constructor(o) { super(Object.assign({ solid: true, w: 14, h: 10, hh: 12 }, o)); this.cut = false; this.theme = o.theme || 'village'; this.drop = o.drop; }
    onHit(kind, src, g) {
      if (this.cut) return false;
      if (kind === 'sword' || kind === 'heavy' || kind === 'special' || kind === 'charged' || kind === 'frost') {
        this.cut = true; this.solid = false;
        G.Audio.sfx('swing');
        g.particles.burst(this.x, this.y - 6, 14, { colors: ['#4a8a3a', '#6aa04a', '#2e5a28'], speed: 60, life: 0.6, g: 120, up: 40 });
        if (this.drop) g.spawnPickup(this.drop.item, this.x, this.y, this.drop);
        else if (Math.random() < 0.3) g.spawnDrop(this.x, this.y, Math.random() < 0.6 ? 'coin' : 'heart');
        return true;
      }
      return false;
    }
    draw(ctx, cam, g) { drawImg(ctx, G.Props.bush(g.level.theme, this.cut), this.x, this.y + 1, cam); }
  }
  OT.bush = Bush;

  // ---------------------------------------------------------------- BRASEIRO (aceso por magia)
  class Brazier extends Obj {
    constructor(o) { super(Object.assign({ solid: true, w: 12, h: 8, hh: 18 }, o)); this.lit = !!o.lit; this.blocksProjectiles = true; }
    init(g) { if (this.flag && g.flag(this.flag)) this.lit = true; }
    isOn() { return this.lit; }
    onHit(kind, src, g) {
      if (kind === 'bolt' || kind === 'charged' || kind === 'special' || kind === 'prism') {
        if (!this.lit) {
          this.lit = true; if (this.flag) g.setFlag(this.flag, true);
          G.Audio.sfx('bigBolt');
          g.particles.burst(this.x, this.y - 16, 20, { colors: ['#ffd84a', '#ff8a3a', '#ffffff'], speed: 50, life: 0.6, glow: true });
        }
        return true;
      }
      if ((kind === 'sword' || kind === 'heavy') && !this.lit && !this._hinted) {
        this._hinted = true; g.bubble(src && src.isPlayer ? src : g.players[1], 'Isso precisa de fogo, não de força.', 2.2);
      }
      return kind === 'sword' || kind === 'heavy';
    }
    draw(ctx, cam, g) {
      drawImg(ctx, G.Props.brazier(), this.x, this.y + 1, cam);
      if (this.lit) {
        const x = Math.round(this.x - cam.rx), y = Math.round(this.y - 18 - cam.ry);
        const t = g.time;
        for (let i = 0; i < 6; i++) {
          const h = 3 + ((Math.sin(t * 12 + i * 1.7) + 1) * 2.5) | 0;
          ctx.fillStyle = i % 2 ? '#ff8a3a' : '#ffd84a';
          ctx.fillRect(x - 4 + i * 1.5 | 0, y - h, 2, h);
        }
        ctx.fillStyle = '#fff6c8'; ctx.fillRect(x - 1, y - 3, 2, 3);
        g.lighting.add(this.x, this.y - 18, 80 + Math.sin(t * 9) * 4, 1, '#ff9a4a', 0.25);
        if (Math.random() < 0.3) g.particles.add({ x: this.x + U.rand(-3, 3), y: this.y - 22, vy: -25, vx: U.rand(-5, 5), life: 0.6, color: '#ffb84a', glow: true });
      }
    }
  }
  OT.brazier = Brazier;

  // ---------------------------------------------------------------- PEDRA FLUTUANTE (telecinese)
  class FloatStone extends Obj {
    constructor(o) {
      super(Object.assign({ solid: true, w: 14, h: 10, hh: 16 }, o));
      this.home = { x: this.x, y: this.y };
      this.lifted = false;
      this.z = 0;
      this.inSocket = null;
      this.telekinetic = true;
    }
    lift(g) { this.lifted = true; this.solid = false; this.flying = true; if (this.inSocket) { this.inSocket.stone = null; this.inSocket = null; } }
    drop(g) {
      this.lifted = false; this.flying = false;
      const tx = Math.floor(this.x / TS), ty = Math.floor((this.y - 4) / TS);
      // encaixe?
      for (const e of g.entities) {
        if (e instanceof Socket && !e.stone && U.dist(e.x, e.y, this.x, this.y) < 14) {
          this.x = e.x; this.y = e.y; e.stone = this; this.inSocket = e;
          G.Audio.sfx('crystal');
          g.particles.burst(this.x, this.y - 6, 20, { colors: ['#8ae8ff', '#ffffff'], speed: 50, life: 0.6, glow: true });
          this.z = 0; return;
        }
      }
      if (g.level.isHole(tx, ty)) {
        G.Audio.sfx(g.level.isWater(tx, ty) ? 'splash' : 'fall');
        g.particles.burst(this.x, this.y, 10, { color: g.level.isWater(tx, ty) ? '#9ad0f0' : '#2a2430', speed: 40, life: 0.5 });
        this.x = this.home.x; this.y = this.home.y;
        g.particles.burst(this.x, this.y - 6, 10, { colors: ['#8ae8ff'], speed: 30, life: 0.5 });
        g.toast('A pedra voltou ao lugar de origem.');
      }
      this.solid = true;
      // não pode cair dentro de alguém/parede: se colidir, empurra para fora
      if (G.Physics.blocked(g, this.box, this)) { this.x = this.home.x; this.y = this.home.y; }
    }
    update(dt, g) {
      if (this.lifted) this.z = U.approach(this.z, 10 + Math.sin(g.time * 3) * 2, dt * 40);
      else this.z = U.approach(this.z, 0, dt * 60);
    }
    draw(ctx, cam, g) {
      P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, this.lifted ? 10 : 14, 0.3);
      const img = G.Props.floatStone();
      ctx.drawImage(img, Math.round(this.x - 8 - cam.rx), Math.round(this.y - 16 - this.z - cam.ry));
      if (this.lifted) {
        g.lighting.add(this.x, this.y - 8 - this.z, 30, 0.6, '#8ae8ff', 0.25);
        if (Math.random() < 0.4) g.particles.add({ x: this.x + U.rand(-7, 7), y: this.y - this.z - U.rand(0, 14), vy: -10, life: 0.5, color: '#8ae8ff', glow: true });
      } else if (Math.sin(g.time * 2 + this.home.x) > 0.6) g.lighting.add(this.x, this.y - 8, 16, 0.3, '#8ae8ff', 0.12);
    }
  }
  OT.floatstone = FloatStone;

  class Socket extends Obj {
    constructor(o) { super(Object.assign({ w: 16, h: 12 }, o)); this.layer = -1; this.stone = null; }
    init(g) { if (this.flag && g.flag(this.flag)) this.locked = true; }
    isOn() { return !!this.stone || this.locked; }
    update(dt, g) { if (this.stone && this.flag && !g.flag(this.flag)) g.setFlag(this.flag, true); }
    draw(ctx, cam, g) {
      drawImg(ctx, G.Props.socket(this.isOn()), this.x, this.y - 1, cam);
      if (this.isOn()) g.lighting.add(this.x, this.y - 6, 40, 0.7, '#6ad8ff', 0.2);
    }
  }
  OT.socket = Socket;

  // ---------------------------------------------------------------- ALTAR RÚNICO (ritual de proteção)
  class Altar extends Obj {
    constructor(o) {
      super(Object.assign({ solid: true, w: 30, h: 14, hh: 30 }, o));
      this.duration = o.duration || 10;
      this.progress = 0;
      this.done = false;
      this.active = false;
      this.onStart = o.onStart; this.onDone = o.onDone;
      this.blocksProjectiles = true;
      this.interactRange = 30;
    }
    init(g) { if (this.flag && g.flag(this.flag)) { this.done = true; this.progress = this.duration; } }
    isOn() { return this.done; }
    canInteract(p) { return !this.done && !this.active; }
    prompt(p) { return p.kind === 'mage' ? 'Ritual' : 'Examinar'; }
    interact(p, g) {
      if (p.kind !== 'mage') { g.bubble(p, 'Runas. Isso é com a Lirien.', 2); return; }
      p.startRitual(this, g);
      if (!this.started) { this.started = true; if (this.onStart && g.level.def.scripts[this.onStart]) g.co.start(g.level.def.scripts[this.onStart], g, { blocking: false, name: 'altar' }); }
    }
    update(dt, g) {
      const p = g.players[0];
      this.active = !!(p && p.ritual === this);
      if (this.done) return;
      if (this.active) {
        this.progress += dt;
        if (Math.random() < 0.6) {
          const a = Math.random() * 6.28;
          g.particles.add({ x: this.x + Math.cos(a) * 30, y: this.y - 8 + Math.sin(a) * 18, vx: -Math.cos(a) * 40, vy: -Math.sin(a) * 25, life: 0.7, color: '#8ae8ff', glow: true });
        }
        if (this.progress >= this.duration) {
          this.done = true; this.active = false;
          if (this.flag) g.setFlag(this.flag, true);
          p.stopRitual(g);
          G.Audio.sfx('solved');
          g.camera.shake(3, 0.5);
          g.particles.ring(this.x, this.y - 8, 4, 60, 0.8, '#8ae8ff', 2);
          if (this.onDone && g.level.def.scripts[this.onDone]) g.co.start(g.level.def.scripts[this.onDone], g, { blocking: false });
        }
      } else if (this.started) this.progress = Math.max(0, this.progress - dt * 0.35);
    }
    draw(ctx, cam, g) {
      drawImg(ctx, G.Props.altar(this.done || this.active), this.x, this.y + 4, cam);
      g.lighting.add(this.x, this.y - 30, this.done ? 70 : 34, 0.8, '#6ad8ff', this.done ? 0.3 : 0.14);
      if (this.started && !this.done) {
        const k = this.progress / this.duration;
        const x = Math.round(this.x - cam.rx), y = Math.round(this.y - 46 - cam.ry);
        ctx.fillStyle = '#1a1424'; ctx.fillRect(x - 16, y, 32, 5);
        ctx.fillStyle = '#8ae8ff'; ctx.fillRect(x - 15, y + 1, Math.round(30 * k), 3);
        if (this.active && Math.floor(g.time * 2) % 2) G.Font.draw(ctx, 'Protejam a Lirien!', x, y - 12, '#ffe8a0', { align: 'center', shadow: true });
      }
    }
  }
  OT.altar = Altar;

  // ---------------------------------------------------------------- PEDRA DE RETORNO (checkpoint)
  class Waystone extends Obj {
    constructor(o) { super(Object.assign({ solid: true, w: 12, h: 8, hh: 26 }, o)); this.active = false; this.cpId = o.cp || o.id; }
    canInteract() { return true; }
    prompt() { return 'Meditar'; }
    interact(p, g) { this.activate(g, true); g.ui.openSkills(g, true); }
    activate(g, silent) {
      const wasActive = g.checkpoint && g.checkpoint.id === this.cpId && g.checkpoint.area === g.level.id;
      g.setCheckpoint({ id: this.cpId, area: g.level.id, x: this.x, y: this.y + 14 });
      this.active = true;
      for (const p of g.players) if (p) p.fullHeal(g);
      g.save();
      if (!wasActive) {
        G.Audio.sfx('checkpoint');
        g.particles.ring(this.x, this.y - 6, 4, 40, 0.8, '#8ae8ff', 2);
        g.particles.burst(this.x, this.y - 18, 24, { colors: ['#8ae8ff', '#ffffff'], speed: 40, life: 1, glow: true, up: 20 });
        g.toast('Pedra de Retorno ativada — progresso salvo.', 2.5);
      }
    }
    update(dt, g) {
      this.active = g.checkpoint && g.checkpoint.id === this.cpId && g.checkpoint.area === g.level.id;
      if (!this.active) for (const p of g.players) if (p && !p.isDown && U.dist(p.x, p.y, this.x, this.y) < 26) { this.activate(g); break; }
    }
    draw(ctx, cam, g) {
      P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, 14, 0.3);
      drawImg(ctx, G.Props.waystone(this.active), this.x, this.y + 1, cam);
      g.lighting.add(this.x, this.y - 16, this.active ? 70 : 34, 0.85, '#6ad8ff', this.active ? 0.22 : 0.1);
      if (this.active && Math.random() < 0.15) g.particles.add({ x: this.x + U.rand(-4, 4), y: this.y - 20, vy: -15, life: 1, color: '#8ae8ff', glow: true });
    }
  }
  OT.waystone = Waystone;

  // ---------------------------------------------------------------- PAREDE ILUSÓRIA (revelada por telecinese)
  class HiddenWall extends Obj {
    constructor(o) { super(Object.assign({ solid: true, w: 16, h: 16 }, o)); this.alpha = 1; this.revealed = false; this.wallKind = o.wall || 'hedge'; this.blocksProjectiles = true; }
    init(g) { if (this.flag && g.flag(this.flag)) { this.revealed = true; this.solid = false; this.alpha = 0; this.blocksProjectiles = false; } }
    reveal(g) {
      if (this.revealed) return;
      this.revealed = true; this.solid = false; this.blocksProjectiles = false;
      if (this.flag) g.setFlag(this.flag, true);
      G.Audio.sfx('crystal');
      g.particles.burst(this.x, this.y - 8, 16, { colors: ['#c8f4ff', '#9ae0ff', '#ffffff'], speed: 40, life: 0.8, glow: true });
      if (!g._wallToast || g.time - g._wallToast > 2) { g._wallToast = g.time; g.toast('Uma ilusão se desfez!'); }
    }
    update(dt) { if (this.revealed) this.alpha = Math.max(0, this.alpha - dt * 1.5); }
    draw(ctx, cam, g) {
      if (this.alpha <= 0) return;
      ctx.globalAlpha = this.alpha;
      const face = !(this.data.top);
      const img = G.Tiles.wallTex(this.wallKind, face, g.level.theme, 1);
      ctx.drawImage(img, Math.round(this.x - 8 - cam.rx), Math.round(this.y - 16 - cam.ry));
      // brilho quase imperceptível (pista)
      if (!this.revealed && Math.sin(g.time * 2 + this.x * 0.3) > 0.92) { ctx.fillStyle = 'rgba(200,240,255,0.7)'; ctx.fillRect(Math.round(this.x - cam.rx), Math.round(this.y - 9 - cam.ry), 1, 1); }
      ctx.globalAlpha = 1;
    }
  }
  OT.hiddenwall = HiddenWall;

  // ---------------------------------------------------------------- OBJETO DE MEMÓRIA
  class MemoryObject extends Obj {
    constructor(o) { super(Object.assign({ solid: true, w: 10, h: 6, hh: 20 }, o)); this.memory = o.memory; this.look = o.look || 'sword'; }
    init(g) { this.seen = g.memories.has(this.memory); }
    canInteract() { return true; }
    prompt() { return this.seen ? 'Observar' : 'Lembrar'; }
    interact(p, g) {
      if (this.seen) { g.dialogue.start(G.Lines.memoryRevisit[this.memory] || [{ who: 'sign', text: 'Uma lembrança antiga.' }]); return; }
      g.startMemory(this.memory, this);
    }
    update(dt, g) {
      this.seen = g.memories.has(this.memory);
      if (!this.seen && Math.random() < 0.25) {
        g.particles.add({ x: this.x + U.rand(-6, 6), y: this.y - U.rand(4, 22), vy: -12, life: 1.2, color: U.pick(['#ffe8a0', '#ffffff', '#f2d98c']), glow: true, flicker: true });
      }
    }
    draw(ctx, cam, g) {
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - cam.ry);
      if (this.look === 'sword') {
        // espada de madeira cravada na pedra
        P.ellipse(ctx, x, y - 2, 8, 3, '#5a5450'); P.ellipse(ctx, x, y - 3, 7, 2, '#8a847a');
        ctx.fillStyle = '#3a2618'; ctx.fillRect(x - 1, y - 18, 3, 16);
        ctx.fillStyle = '#a07a4a'; ctx.fillRect(x, y - 18, 1, 15);
        ctx.fillStyle = '#5a3a22'; ctx.fillRect(x - 4, y - 19, 9, 2);
        ctx.fillStyle = '#7a5a3a'; ctx.fillRect(x - 1, y - 24, 3, 5);
        ctx.fillStyle = '#c84a4a'; ctx.fillRect(x - 1, y - 25, 3, 1);
      } else if (this.look === 'ribbon') {
        ctx.fillStyle = '#5a3a22'; ctx.fillRect(x - 1, y - 14, 2, 14);
        ctx.fillStyle = '#d84a7a'; ctx.fillRect(x - 3, y - 12, 6, 2); ctx.fillRect(x + 2, y - 10, 2, 5); ctx.fillRect(x - 4, y - 10, 2, 4);
      } else if (this.look === 'star') {
        const k = Math.sin(g.time * 3) * 0.5 + 0.5;
        P.circle(ctx, x, y - 10, 5, '#f2d98c'); P.circle(ctx, x, y - 10, 3, '#ffffff');
        ctx.globalAlpha = k; P.ring(ctx, x, y - 10, 8, '#ffe8a0'); ctx.globalAlpha = 1;
      }
      if (!this.seen) g.lighting.add(this.x, this.y - 12, 46, 0.8, '#ffe0a0', 0.25);
    }
  }
  OT.memory = MemoryObject;

  // ---------------------------------------------------------------- ITEM NO CHÃO (colecionável)
  class Pickup extends Obj {
    constructor(o) {
      super(Object.assign({ w: 10, h: 8 }, o));
      this.item = o.item; this.qty = o.qty || 1; this.t = Math.random() * 6;
      this.kind = o.kind || 'item'; // 'item' | 'coin' | 'heart' | 'mana'
      this.life = o.life || 0; this.vz = o.vz || 0; this.z = o.z || 0; this.vx = o.vx || 0; this.vy = o.vy || 0;
      this.hidden = !!o.hidden; this.revealed = !this.hidden;
      this.delay = o.delay || 0;
    }
    init(g) {
      if (this.flag && g.flag(this.flag)) this.dead = true;
      if (this.hidden && this.flag && g.flag(this.flag + '_rev')) this.revealed = true;
    }
    reveal(g) {
      if (this.revealed) return;
      this.revealed = true;
      if (this.flag) g.setFlag(this.flag + '_rev', true);
      G.Audio.sfx('crystal');
      g.particles.burst(this.x, this.y - 6, 14, { colors: ['#c8f4ff', '#ffffff'], speed: 40, life: 0.8, glow: true });
    }
    update(dt, g) {
      this.t += dt;
      this.delay -= dt;
      if (this.vz || this.z > 0) {
        this.vz -= 300 * dt; this.z += this.vz * dt;
        if (this.z <= 0) { this.z = 0; this.vz = Math.abs(this.vz) > 40 ? -this.vz * 0.4 : 0; }
        G.Physics.move(g, this, this.vx * dt, this.vy * dt);
        this.vx *= 0.92; this.vy *= 0.92;
      }
      if (this.life) { this.life -= dt; if (this.life <= 0) { this.dead = true; return; } }
      if (!this.revealed || this.delay > 0) return;
      for (const p of g.players) {
        if (!p || p.isDown) continue;
        const d = U.dist(p.x, p.y - 4, this.x, this.y - 4);
        // ímã suave para moedas
        if ((this.kind === 'coin' || this.kind === 'heart' || this.kind === 'mana') && d < 34) {
          this.x += (p.x - this.x) * dt * 6; this.y += (p.y - this.y) * dt * 6;
        }
        if (d < 12) { this.collect(p, g); break; }
      }
    }
    collect(p, g) {
      this.dead = true;
      if (this.flag) g.setFlag(this.flag, true);
      if (this.kind === 'coin') { g.addGold(this.qty); G.Audio.sfx('coin'); g.particles.text(this.x, this.y - 12, '+' + this.qty, '#ffe680'); return; }
      if (this.kind === 'heart') { p.heal(12, g); G.Audio.sfx('heal'); return; }
      if (this.kind === 'mana') { p.restore(20); G.Audio.sfx('heal'); return; }
      const it = G.Items[this.item];
      g.inv.add(this.item, this.qty, g);
      G.Audio.sfx('pickup');
      g.particles.burst(this.x, this.y - 8, 14, { colors: ['#ffe680', '#ffffff'], speed: 40, life: 0.6, glow: true });
      g.toast('Obtido: ' + it.name + (this.qty > 1 ? ' x' + this.qty : ''), 3);
    }
    draw(ctx, cam, g) {
      if (!this.revealed) {
        if (Math.sin(g.time * 3 + this.x) > 0.9) { ctx.fillStyle = 'rgba(200,240,255,0.7)'; ctx.fillRect(Math.round(this.x - cam.rx), Math.round(this.y - 6 - cam.ry), 1, 1); }
        return;
      }
      if (this.life && this.life < 2 && Math.floor(this.life * 10) % 2) return;
      const bob = Math.round(Math.sin(this.t * 3) * 1.5);
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - cam.ry - this.z);
      P.shadow(ctx, x, Math.round(this.y - cam.ry), 8, 0.25);
      G.Icons.draw(ctx, this.kind === 'item' ? (G.Items[this.item].icon || 'bag') : this.kind, x - 4, y - 10 + bob);
      if (this.kind === 'item') g.lighting.add(this.x, this.y - 6, 26, 0.5, '#ffe8a0', 0.15);
    }
  }
  OT.pickup = Pickup;

  // ---------------------------------------------------------------- DECORAÇÃO (casas, poço, barris...)
  class Decor extends Obj {
    constructor(o) {
      super(o);
      this.kind = o.kind;
      this.solid = o.solid !== false;
      this.light = o.light;
      if (this.kind === 'house') {
        this.img = G.Props.house(o);
        this.w = o.w * 16 - 4; this.h = o.h * 16 - 8;
        this.y = this.y + (o.h - 1) * 0; // base na linha do marcador
      } else if (this.kind === 'well') { this.img = G.Props.well(); this.w = 26; this.h = 12; }
      else if (this.kind === 'barrel') { this.img = G.Props.barrel(); this.w = 12; this.h = 8; }
      else if (this.kind === 'lamp') { this.img = G.Props.lamp(); this.w = 6; this.h = 6; this.light = this.light || '#ffc870'; }
      else if (this.kind === 'statue') { this.img = G.Props.statue(); this.w = 18; this.h = 10; }
      else if (this.kind === 'banner') { this.img = G.Props.banner(o.color || '#8a3a3a'); this.w = 6; this.h = 4; }
      else if (this.kind === 'tent') { this.img = G.Props.tent(); this.w = 30; this.h = 12; }
      else if (this.kind === 'cart') { this.img = G.Props.cartWheel(); this.w = 30; this.h = 10; }
      else if (this.kind === 'campfire') { this.img = G.Props.campfire(); this.w = 14; this.h = 8; this.fire = true; }
      else if (this.kind === 'crystalbig') { this.img = G.Props.crystal('sanctum', o.v || 0); this.w = 14; this.h = 8; }
      else if (this.kind === 'stairs') { this.img = G.Props.stairs(o.sw || 2); this.solid = false; this.layer = -1; this.w = 1; this.h = 1; }
      if (o.door) this.door = o.door;
      this.blocksProjectiles = this.kind === 'house' || this.kind === 'well' || this.kind === 'statue';
    }
    canInteract(p) { return !!(this.door || this.data.text); }
    prompt() { return this.door ? 'Bater' : 'Olhar'; }
    get interactPoint() { return this.kind === 'house' ? { x: this.x, y: this.y + 2 } : null; }
    interact(p, g) {
      const t = this.door || this.data.text;
      g.dialogue.start(Array.isArray(t) ? t : [{ who: 'sign', text: t }]);
    }
    draw(ctx, cam, g) {
      const img = this.img;
      if (!img) return;
      if (this.kind !== 'house' && this.kind !== 'banner' && this.kind !== 'lamp') P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, this.w + 4, 0.25);
      if (this.kind === 'house') {
        ctx.fillStyle = 'rgba(10,6,20,0.25)';
        ctx.fillRect(Math.round(this.x - img.width / 2 - cam.rx + 3), Math.round(this.y - cam.ry), img.width - 4, 4);
      }
      ctx.drawImage(img, Math.round(this.x - img.width / 2 - cam.rx), Math.round(this.y + 1 - img.height - cam.ry));
      if (this.kind === 'house' && this.data.chimney !== false && Math.random() < 0.05) {
        g.particles.add({ x: this.x + img.width / 2 - 16, y: this.y - img.height + 2, vy: -10, vx: 4, life: 2.5, color: '#c8c0c8', size: 2, wobble: 6 });
      }
      if (this.light) g.lighting.add(this.x, this.y - (this.kind === 'lamp' ? 27 : 10), 70, 0.9, this.light, 0.22);
      if (this.kind === 'house' && g.level.darkness > 0.2) g.lighting.add(this.x, this.y - img.height * 0.35, 60, 0.6, '#ffc870', 0.15);
      if (this.fire) {
        const x = Math.round(this.x - cam.rx), y = Math.round(this.y - 4 - cam.ry), t = g.time;
        for (let i = 0; i < 5; i++) {
          const h = 3 + ((Math.sin(t * 11 + i * 1.9) + 1) * 3) | 0;
          ctx.fillStyle = i % 2 ? '#ff8a3a' : '#ffd84a';
          ctx.fillRect(x - 4 + i * 2, y - h, 2, h);
        }
        g.lighting.add(this.x, this.y - 6, 90 + Math.sin(t * 10) * 5, 1, '#ff9a4a', 0.3);
        if (Math.random() < 0.3) g.particles.add({ x: this.x + U.rand(-3, 3), y: this.y - 10, vy: -30, life: 0.8, color: '#ffb84a', glow: true });
      }
    }
  }
  OT.decor = Decor;

  // ---------------------------------------------------------------- BONECO DE TREINO
  class Dummy extends Obj {
    constructor(o) { super(Object.assign({ solid: true, w: 10, h: 6, hh: 22 }, o)); this.flash = 0; this.wob = 0; this.stun = 0; this.frozen = 0; this.isTarget = true; this.hp = 9999; }
    takeHit(hit, g) {
      this.flash = 0.12; this.wob = 0.3;
      let dmg = hit.dmg;
      let label = null;
      if (hit.kind === 'heavy') this.stun = 2.5;
      if (hit.kind === 'frost') this.frozen = 3;
      if (this.stun > 0 && hit.kind === 'charged') { dmg *= 2.5; label = 'ABERTURA!'; }
      if (this.frozen > 0 && hit.kind === 'heavy') { dmg *= 3; label = 'ESTILHAÇO!'; this.frozen = 0; G.Audio.sfx('shatter'); }
      g.particles.text(this.x, this.y - 26, Math.round(dmg), label ? '#ffd84a' : '#ffffff');
      if (label) { g.comboText(this.x, this.y - 40, label); if (!g.flag('tut_combo')) { g.setFlag('tut_combo', true); g.toast('Combo descoberto! Vocês são mais fortes juntos.', 3); } }
      G.Audio.sfx('hit');
      return true;
    }
    update(dt) { this.flash -= dt; this.wob = Math.max(0, this.wob - dt); this.stun = Math.max(0, this.stun - dt); this.frozen = Math.max(0, this.frozen - dt); }
    draw(ctx, cam, g) {
      const ox = this.wob > 0 ? Math.round(Math.sin(this.wob * 40) * 2) : 0;
      P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, 12, 0.3);
      drawImg(ctx, G.Props.dummy(), this.x, this.y + 1, cam, ox);
      if (this.frozen > 0) { ctx.globalAlpha = 0.5; ctx.fillStyle = '#bfe4f6'; ctx.fillRect(Math.round(this.x - 8 - cam.rx), Math.round(this.y - 23 - cam.ry), 16, 23); ctx.globalAlpha = 1; }
      if (this.stun > 0) G.FX.stars(ctx, this.x - cam.rx, this.y - 28 - cam.ry, g.time);
    }
  }
  OT.dummy = Dummy;

  // ---------------------------------------------------------------- MECANISMO (script quando sinais ativos)
  class Mechanism extends Obj {
    constructor(o) { super(Object.assign({ w: 1, h: 1 }, o)); this.requires = o.requires || []; this.script = o.script; this.fired = false; this.layer = -2; }
    init(g) { if (this.flag && g.flag(this.flag)) { this.fired = true; if (this.data.onLoad && g.level.def.scripts[this.data.onLoad]) g.level.def.scripts[this.data.onLoad](g); } }
    update(dt, g) {
      if (this.fired) return;
      if (this.requires.every((id) => g.signalOn(id))) {
        this.fired = true;
        if (this.flag) g.setFlag(this.flag, true);
        const s = g.level.def.scripts[this.script];
        if (s) g.co.start(s, g, { blocking: !!this.data.blocking, name: this.script });
      }
    }
  }
  OT.mechanism = Mechanism;

  // ---------------------------------------------------------------- LUZ AMBIENTE (invisível)
  class LightSrc extends Obj {
    constructor(o) { super(Object.assign({ w: 1, h: 1 }, o)); this.layer = -2; this.r = o.r || 120; this.a = o.a || 0.6; this.color = o.color || null; }
    draw(ctx, cam, g) { g.lighting.add(this.x, this.y - 8, this.r + Math.sin(g.time * 1.5 + this.x) * 4, this.a, this.color, 0.08); }
  }
  OT.light = LightSrc;

  // ---------------------------------------------------------------- OBJETO COM SCRIPT (usado nas memórias)
  class ScriptObj extends Obj {
    constructor(o) { super(Object.assign({ w: 10, h: 6, hh: 16 }, o)); this.label = o.label || 'Usar'; this.who = o.who || null; this.t = 0; }
    canInteract(p) { return !this.used && (!this.who || p.kind === this.who); }
    prompt() { return this.label; }
    interact(p, g) {
      if (this.data.once !== false) this.used = true;
      const s = g.level.def.scripts[this.data.script];
      if (s) g.co.start(s, g, { name: this.data.script, blocking: false });
      if (this.data.vanish) this.dead = true;
    }
    update(dt, g) { this.t += dt; if (!this.used && Math.random() < 0.2) g.particles.add({ x: this.x + U.rand(-5, 5), y: this.y - U.rand(2, 14), vy: -10, life: 1, color: '#ffe8a0', glow: true }); }
    draw(ctx, cam, g) {
      if (this.used && this.data.vanish) return;
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - cam.ry);
      P.shadow(ctx, x, y, 10, 0.3);
      G.Icons.draw(ctx, this.data.icon || 'woodsword', x - 5, y - 12 + Math.round(Math.sin(this.t * 3)));
      g.lighting.add(this.x, this.y - 8, 30, 0.6, '#ffe8a0', 0.2);
    }
  }
  OT.scriptobj = ScriptObj;

  // ---------------------------------------------------------------- Ícones (itens/HUD)
  const ICON = {};
  function icon(name, fn) { ICON[name] = P.make(10, 10, fn); }
  const Icons = {
    init() {
      icon('coin', (x) => { P.circle(x, 5, 5, 3, '#a8782a'); P.circle(x, 5, 5, 2, '#ffd84a'); x.fillStyle = '#fff6c8'; x.fillRect(4, 3, 1, 2); });
      icon('heart', (x) => { x.fillStyle = '#7a1a2a'; x.fillRect(1, 2, 3, 4); x.fillRect(6, 2, 3, 4); x.fillRect(2, 6, 6, 2); x.fillRect(4, 8, 2, 1); x.fillStyle = '#e84a5a'; x.fillRect(2, 2, 2, 4); x.fillRect(6, 2, 2, 4); x.fillRect(3, 6, 4, 1); x.fillRect(4, 3, 2, 3); x.fillStyle = '#ffb0b8'; x.fillRect(2, 3, 1, 1); });
      icon('mana', (x) => { x.fillStyle = '#2a4a8a'; x.fillRect(3, 1, 4, 8); x.fillRect(2, 3, 6, 4); x.fillStyle = '#6aa8ff'; x.fillRect(3, 3, 4, 4); x.fillStyle = '#c8e8ff'; x.fillRect(3, 3, 1, 2); });
      icon('potion', (x) => { x.fillStyle = '#3a2a3a'; x.fillRect(4, 0, 2, 2); x.fillRect(2, 2, 6, 7); x.fillStyle = '#e84a5a'; x.fillRect(3, 4, 4, 4); x.fillStyle = '#ffffff'; x.fillRect(3, 3, 1, 1); x.fillStyle = '#c8b07a'; x.fillRect(4, 1, 2, 1); });
      icon('ether', (x) => { x.fillStyle = '#3a2a3a'; x.fillRect(4, 0, 2, 2); x.fillRect(2, 2, 6, 7); x.fillStyle = '#4a8aff'; x.fillRect(3, 4, 4, 4); x.fillStyle = '#ffffff'; x.fillRect(3, 3, 1, 1); x.fillStyle = '#c8b07a'; x.fillRect(4, 1, 2, 1); });
      icon('feather', (x) => { x.fillStyle = '#c84a2a'; for (let i = 0; i < 7; i++) x.fillRect(2 + i, 7 - i, 2, 2); x.fillStyle = '#ffb84a'; for (let i = 0; i < 5; i++) x.fillRect(3 + i, 6 - i, 1, 1); x.fillStyle = '#fff'; x.fillRect(1, 8, 2, 1); });
      icon('flower', (x) => { x.fillStyle = '#3a6a2a'; x.fillRect(4, 5, 1, 5); x.fillStyle = '#9ae0ff'; x.fillRect(2, 2, 5, 3); x.fillRect(3, 1, 3, 5); x.fillStyle = '#ffffff'; x.fillRect(4, 3, 1, 1); });
      icon('page', (x) => { x.fillStyle = '#5a4a3a'; x.fillRect(1, 0, 8, 10); x.fillStyle = '#e8dcc0'; x.fillRect(2, 1, 6, 8); x.fillStyle = '#7a6a8a'; x.fillRect(3, 3, 4, 1); x.fillRect(3, 5, 3, 1); x.fillRect(3, 7, 4, 1); });
      icon('ore', (x) => { x.fillStyle = '#3a3a5a'; x.fillRect(1, 3, 8, 6); x.fillRect(2, 2, 5, 1); x.fillStyle = '#8a8aca'; x.fillRect(2, 4, 3, 3); x.fillStyle = '#e0e8ff'; x.fillRect(6, 5, 2, 2); x.fillRect(3, 4, 1, 1); });
      icon('amulet', (x) => { x.fillStyle = '#c8b07a'; x.fillRect(2, 0, 1, 4); x.fillRect(7, 0, 1, 4); x.fillRect(3, 4, 4, 1); x.fillStyle = '#3a8a5a'; x.fillRect(3, 5, 4, 4); x.fillStyle = '#8ae8b0'; x.fillRect(4, 6, 1, 1); });
      icon('cloak', (x) => { x.fillStyle = '#5a5662'; x.fillRect(2, 1, 6, 8); x.fillRect(1, 4, 8, 5); x.fillStyle = '#8a8692'; x.fillRect(3, 2, 2, 6); x.fillStyle = '#c8b07a'; x.fillRect(4, 1, 2, 1); });
      icon('ribbon', (x) => { x.fillStyle = '#d84a7a'; x.fillRect(1, 2, 3, 3); x.fillRect(6, 2, 3, 3); x.fillRect(4, 3, 2, 2); x.fillRect(3, 5, 2, 4); x.fillRect(5, 5, 2, 4); x.fillStyle = '#ff9ac0'; x.fillRect(2, 3, 1, 1); });
      icon('star', (x) => { x.fillStyle = '#f2d98c'; x.fillRect(4, 0, 2, 10); x.fillRect(0, 4, 10, 2); x.fillRect(2, 2, 6, 6); x.fillStyle = '#ffffff'; x.fillRect(4, 3, 2, 3); });
      icon('book', (x) => { x.fillStyle = '#3a2a5a'; x.fillRect(1, 1, 8, 9); x.fillStyle = '#6a4a9a'; x.fillRect(2, 1, 7, 8); x.fillStyle = '#f2d98c'; x.fillRect(4, 3, 3, 3); x.fillStyle = '#e8dcc0'; x.fillRect(2, 8, 7, 1); });
      icon('sword', (x) => { x.fillStyle = '#c8d0dc'; for (let i = 0; i < 6; i++) x.fillRect(3 + i, 6 - i, 2, 1); x.fillStyle = '#ffffff'; for (let i = 0; i < 5; i++) x.fillRect(4 + i, 5 - i, 1, 1); x.fillStyle = '#c8b07a'; x.fillRect(1, 6, 4, 1); x.fillRect(2, 5, 1, 3); x.fillStyle = '#5a3a22'; x.fillRect(1, 8, 2, 2); });
      icon('staff', (x) => { x.fillStyle = '#7a5230'; for (let i = 0; i < 8; i++) x.fillRect(1 + i, 9 - i, 1, 1); x.fillStyle = '#8ae8ff'; x.fillRect(7, 0, 3, 3); x.fillStyle = '#fff'; x.fillRect(8, 0, 1, 1); });
      icon('woodsword', (x) => { x.fillStyle = '#a07a4a'; for (let i = 0; i < 6; i++) x.fillRect(3 + i, 6 - i, 2, 1); x.fillStyle = '#5a3a22'; x.fillRect(1, 6, 4, 1); x.fillRect(1, 8, 2, 2); });
      icon('ring', (x) => { P.circle(x, 5, 6, 3, '#c8b07a'); P.circle(x, 5, 6, 1, '#00000000'); x.clearRect(4, 5, 3, 3); x.fillStyle = '#e84a5a'; x.fillRect(4, 1, 2, 2); });
      icon('bag', (x) => { x.fillStyle = '#7a5230'; x.fillRect(2, 3, 6, 6); x.fillStyle = '#a07040'; x.fillRect(3, 4, 3, 3); x.fillStyle = '#5a3a22'; x.fillRect(3, 1, 4, 2); });
      icon('fang', (x) => { x.fillStyle = '#e8e0d0'; x.fillRect(3, 1, 4, 3); x.fillRect(4, 4, 3, 3); x.fillRect(5, 7, 1, 2); x.fillStyle = '#a8a090'; x.fillRect(6, 2, 1, 6); });
      icon('shard', (x) => { x.fillStyle = '#5a3aa8'; x.fillRect(3, 0, 4, 10); x.fillRect(2, 3, 6, 4); x.fillStyle = '#c8a8ff'; x.fillRect(4, 1, 2, 7); x.fillStyle = '#fff'; x.fillRect(4, 2, 1, 2); });
      icon('frost', (x) => { x.fillStyle = '#9ae0ff'; x.fillRect(4, 0, 2, 10); x.fillRect(0, 4, 10, 2); x.fillRect(1, 1, 2, 2); x.fillRect(7, 7, 2, 2); x.fillRect(7, 1, 2, 2); x.fillRect(1, 7, 2, 2); x.fillStyle = '#fff'; x.fillRect(4, 4, 2, 2); });
      icon('tk', (x) => { x.fillStyle = '#8ae8ff'; P.ring(x, 5, 5, 4, '#8ae8ff'); x.fillStyle = '#c8a8ff'; x.fillRect(3, 3, 4, 4); x.fillStyle = '#fff'; x.fillRect(4, 4, 1, 1); });
      icon('bridge', (x) => { x.fillStyle = '#6ad8ff'; x.fillRect(0, 4, 10, 3); x.fillStyle = '#c8f4ff'; x.fillRect(0, 4, 10, 1); x.fillRect(1, 6, 2, 1); x.fillRect(6, 6, 2, 1); x.fillStyle = '#2a4a6a'; x.fillRect(0, 7, 1, 3); x.fillRect(9, 7, 1, 3); });
      icon('shield', (x) => { x.fillStyle = '#5a6676'; x.fillRect(1, 0, 8, 6); x.fillRect(2, 6, 6, 2); x.fillRect(3, 8, 4, 2); x.fillStyle = '#9aa6b6'; x.fillRect(2, 1, 6, 5); x.fillRect(3, 6, 4, 2); x.fillStyle = '#c84a4a'; x.fillRect(4, 1, 2, 6); });
      icon('taunt', (x) => { x.fillStyle = '#ffd84a'; x.fillRect(4, 0, 2, 6); x.fillRect(4, 8, 2, 2); x.fillStyle = '#ff8a3a'; x.fillRect(1, 2, 1, 4); x.fillRect(8, 2, 1, 4); });
    },
    draw(ctx, name, x, y) { const i = ICON[name] || ICON.bag; if (i) ctx.drawImage(i, Math.round(x), Math.round(y)); },
    get: (name) => ICON[name] || ICON.bag,
  };
  G.Icons = Icons;
})();
