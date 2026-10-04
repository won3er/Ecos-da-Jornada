// Level: interpreta o mapa ASCII de uma área, pré-renderiza o chão, guarda colisão,
// tiles dinâmicos (gelo, pontes etéreas) e cria entidades a partir dos marcadores.
(function () {
  const U = G.U, T = G.Tiles, TS = G.TILE;

  class TileProp extends G.Entity {
    constructor(kind, tx, ty, theme) {
      super({ x: tx * TS + 8, y: ty * TS + 15, w: 14, h: 10 });
      this.kind = kind; this.theme = theme; this.tx = tx; this.ty = ty;
      this.v = Math.floor(U.hash(tx, ty, 9) * 4);
      this.fade = 1;
      if (kind === 'tree') this.img = G.Props.tree(theme, this.v);
      else if (kind === 'pine') this.img = G.Props.pine(theme, this.v);
      else if (kind === 'rock') this.img = G.Props.rock(theme, this.v);
      else if (kind === 'pillar') this.img = G.Props.pillar(theme, this.v);
      else if (kind === 'crystal') this.img = G.Props.crystal(theme, this.v);
      else if (kind === 'stalagmite') this.img = G.Props.stalagmite(this.v);
      else if (kind === 'grave') this.img = G.Props.grave(this.v);
      else if (kind === 'stump') this.img = G.Props.stump();
      this.big = kind === 'tree' || kind === 'pine';
    }
    update(dt, g) {
      if (!this.big) return;
      // copa fica translúcida quando um jogador está atrás
      let behind = false;
      for (const p of g.players) {
        if (!p) continue;
        if (p.y < this.y - 4 && p.y > this.y - this.img.height + 10 && Math.abs(p.x - this.x) < this.img.width / 2 - 2) behind = true;
      }
      this.fade = U.approach(this.fade, behind ? 0.45 : 1, dt * 4);
    }
    draw(ctx, cam, g) {
      const img = this.img;
      const sx = Math.round(this.x - img.width / 2 - cam.rx);
      let sy = Math.round(this.y + 1 - img.height - cam.ry);
      if (this.kind === 'stump' || this.kind === 'rock') sy += 1;
      if (this.big) {
        G.Pixel.shadow(ctx, this.x - cam.rx, this.y - cam.ry - 1, this.kind === 'tree' ? 26 : 18, 0.28);
        // balanço leve das folhas
        const sway = Math.sin(g.time * 1.3 + this.tx * 0.7) > 0.85 ? 1 : 0;
        if (this.fade < 1) ctx.globalAlpha = this.fade;
        ctx.drawImage(img, sx + sway, sy);
        ctx.globalAlpha = 1;
      } else {
        ctx.drawImage(img, sx, sy);
      }
      if (this.kind === 'crystal') {
        const pulse = 0.5 + Math.sin(g.time * 2 + this.tx) * 0.5;
        g.lighting.add(this.x, this.y - 12, 56 + pulse * 10, 0.8, this.v % 2 ? '#6aa0ff' : '#b07aff', 0.22);
      }
    }
  }
  G.TileProp = TileProp;

  class Level {
    constructor(def, game) {
      this.def = def;
      this.id = def.id;
      this.name = def.name;
      this.theme = def.theme || 'village';
      this.darkness = def.darkness || 0;
      this.grid = [];
      this.markers = [];
      this.dyn = new Map();      // "x,y" -> {kind:'ice'|'bridge', t}
      this.exits = [];
      this.triggers = [];
      this.spawns = {};
      const rows = def.map;
      this.h = rows.length;
      this.w = Math.max(...rows.map((r) => r.length));
      for (let y = 0; y < this.h; y++) {
        const row = [];
        for (let x = 0; x < this.w; x++) {
          let ch = rows[y][x] || 'v';
          if (!T.DEF[ch]) {
            this.markers.push({ ch, tx: x, ty: y });
            ch = def.floor || '.';
            // usa o chão vizinho à esquerda se for um piso
            const left = rows[y][x - 1];
            if (left && T.isFloorChar(left)) ch = left;
          }
          row.push(ch);
        }
        this.grid.push(row);
      }
      this.pw = this.w * TS; this.ph = this.h * TS;
      this.ground = U.makeCanvas(this.pw, this.ph);
      this.gctx = this.ground.getContext('2d');
      this.renderAll();
      this.waterTiles = [];
      for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (T.def(this.grid[y][x]).water) this.waterTiles.push([x, y]);
    }

    tile(tx, ty) {
      if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) return 'v';
      return this.grid[ty][tx];
    }
    key(tx, ty) { return tx + ',' + ty; }
    dynAt(tx, ty) { return this.dyn.get(this.key(tx, ty)); }

    blocksAt(tx, ty, mover) {
      if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) return true;
      const d = T.def(this.grid[ty][tx]);
      if (!d.solid) return false;
      if (d.water || d.chasm) {
        const dy = this.dyn.get(tx + ',' + ty);
        if (dy) return false;
        if (mover && mover.flying) return false;
      }
      return true;
    }
    // bloqueia projéteis?
    blocksShot(px, py) {
      const tx = Math.floor(px / TS), ty = Math.floor(py / TS);
      if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) return true;
      return !!T.def(this.grid[ty][tx]).tall;
    }
    isHole(tx, ty) {
      const d = T.def(this.tile(tx, ty));
      if (!(d.water || d.chasm)) return false;
      return !this.dyn.get(this.key(tx, ty));
    }
    isWater(tx, ty) { return !!T.def(this.tile(tx, ty)).water; }
    isSlip(x, y) {
      const tx = Math.floor(x / TS), ty = Math.floor(y / TS);
      if (this.dyn.get(this.key(tx, ty))) return false;
      return !!T.def(this.tile(tx, ty)).slip;
    }
    // Chama Estelar derrete paredes de gelo ('I')
    melt(tx, ty, g) {
      const d = T.def(this.tile(tx, ty));
      if (!d.melt) return false;
      this.setTile(tx, ty, this.def.meltTo || 's');
      if (g) {
        g.particles.burst(tx * TS + 8, ty * TS + 8, 18, { colors: ['#bfe4f6', '#ffffff', '#8ac0e0'], speed: 50, life: 0.6, up: 20 });
        for (let i = 0; i < 6; i++) g.particles.add({ x: tx * TS + U.rand(2, 14), y: ty * TS + U.rand(2, 14), vy: -18, life: 1, color: '#e8f4ff', size: 2 });
        G.Audio.sfx('melt');
      }
      return true;
    }
    isChasm(tx, ty) { return !!T.def(this.tile(tx, ty)).chasm; }
    surfaceAt(x, y) {
      const tx = Math.floor(x / TS), ty = Math.floor(y / TS);
      const dy = this.dynAt(tx, ty);
      if (dy) return dy.kind === 'ice' ? 'stone' : dy.kind === 'plat' ? 'stone' : 'wood';
      const d = T.def(this.tile(tx, ty));
      if (d.g === 'snow' || (d.g === 'grass' && this.theme === 'snow')) return 'snow';
      if (d.g === 'ice') return 'stone';
      if (d.g === 'star' || d.g === 'planks' || d.g === 'carpet') return d.g === 'planks' ? 'wood' : 'stone';
      if (d.g === 'stone' || d.g === 'cobble' || d.g === 'cave' || d.g === 'magic') return 'stone';
      if (d.g === 'wood' || d.g === 'bridge') return 'wood';
      return 'grass';
    }

    setTile(tx, ty, ch) {
      if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) return;
      this.grid[ty][tx] = ch;
      for (let y = ty - 1; y <= ty + 1; y++) for (let x = tx - 1; x <= tx + 1; x++) this.renderTile(x, y);
      this.waterTiles = this.waterTiles.filter(([x, y]) => T.def(this.grid[y][x]).water);
    }

    // Tiles dinâmicos
    freeze(tx, ty, t) {
      if (!this.isWater(tx, ty)) return false;
      const k = this.key(tx, ty);
      const cur = this.dyn.get(k);
      if (cur && cur.kind !== 'ice') return false;
      this.dyn.set(k, { kind: 'ice', t, max: t });
      return true;
    }
    setBridge(tx, ty, on) {
      const k = this.key(tx, ty);
      if (on) { if (!this.dyn.get(k)) this.dyn.set(k, { kind: 'bridge', t: Infinity, age: 0 }); }
      else { const d = this.dyn.get(k); if (d && d.kind === 'bridge') this.dyn.delete(k); }
    }

    update(dt, g) {
      for (const [k, d] of this.dyn) {
        if (d.kind === 'ice') {
          d.t -= dt;
          if (d.t <= 0) {
            this.dyn.delete(k);
            const [tx, ty] = k.split(',').map(Number);
            g.particles.burst(tx * TS + 8, ty * TS + 8, 6, { colors: ['#cfefff', '#ffffff', '#7ab8e8'], speed: 30, life: 0.4 });
          }
        } else if (d.kind === 'bridge') d.age = (d.age || 0) + dt;
      }
    }

    renderTile(tx, ty) {
      if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) return;
      this.gctx.clearRect(tx * TS, ty * TS, TS, TS);
      T.drawTile(this.gctx, this, tx, ty);
    }
    renderAll() {
      for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) T.drawTile(this.gctx, this, x, y);
    }

    drawGround(ctx, cam, g) {
      const sx = cam.rx, sy = cam.ry;
      ctx.drawImage(this.ground, sx, sy, G.VIEW_W, G.VIEW_H, 0, 0, G.VIEW_W, G.VIEW_H);
      // brilho animado da água
      const t = g.time;
      const x0 = Math.floor(sx / TS) - 1, x1 = x0 + Math.ceil(G.VIEW_W / TS) + 2;
      const y0 = Math.floor(sy / TS) - 1, y1 = y0 + Math.ceil(G.VIEW_H / TS) + 2;
      for (const [tx, ty] of this.waterTiles) {
        if (tx < x0 || tx > x1 || ty < y0 || ty > y1) continue;
        if (this.dyn.get(tx + ',' + ty)) continue;
        const ph = U.hash(tx, ty, 5) * 6.28;
        const px = tx * TS - sx, py = ty * TS - sy;
        const k = (Math.sin(t * 2 + ph) + 1) / 2;
        ctx.fillStyle = 'rgba(190,230,255,0.55)';
        ctx.fillRect(px + ((ph * 7 + t * 6) % 12 | 0) + 2, py + 6 + ((ph * 3) % 6 | 0), 3, 1);
        if (k > 0.7) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(px + ((ph * 11) % 13 | 0) + 1, py + 2 + ((ph * 5) % 10 | 0), 1, 1); }
      }
      // gelo e pontes etéreas
      for (const [k, d] of this.dyn) {
        const [tx, ty] = k.split(',').map(Number);
        if (tx < x0 || tx > x1 || ty < y0 || ty > y1) continue;
        const px = tx * TS - sx, py = ty * TS - sy;
        if (d.kind === 'ice') {
          const blink = d.t < 2 && Math.floor(t * 8) % 2 === 0;
          ctx.fillStyle = blink ? '#8ab8d8' : '#bfe4f6'; ctx.fillRect(px, py, TS, TS);
          ctx.fillStyle = '#e8f8ff'; ctx.fillRect(px + 2, py + 3, 5, 1); ctx.fillRect(px + 9, py + 10, 4, 1);
          ctx.fillStyle = '#8ac0e0'; ctx.fillRect(px, py + TS - 1, TS, 1); ctx.fillRect(px + 6, py + 6, 1, 4);
        } else if (d.kind === 'bridge') {
          const a = Math.min(1, (d.age || 0) * 6);
          ctx.globalAlpha = 0.75 * a;
          ctx.fillStyle = '#6ad8ff'; ctx.fillRect(px, py + 1, TS, TS - 2);
          ctx.fillStyle = '#c8f4ff';
          for (let i = 0; i < 4; i++) ctx.fillRect(px + ((i * 5 + Math.floor(t * 20)) % 16), py + 2 + i * 4, 3, 1);
          ctx.fillStyle = '#ffffff'; ctx.fillRect(px, py + 1, TS, 1); ctx.fillRect(px, py + TS - 2, TS, 1);
          ctx.globalAlpha = 1;
        }
      }
    }

    // Cria entidades de props (árvores etc.) a partir dos tiles
    makeTileProps() {
      const out = [];
      for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
        const d = T.def(this.grid[y][x]);
        if (d.prop) out.push(new TileProp(d.prop, x, y, this.theme));
      }
      return out;
    }
  }

  G.Level = Level;
})();
