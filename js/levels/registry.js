// Registro de áreas + construtor de mapas.
// Cada área é um objeto { id, title, theme, music, map, entities, spawns, exits, zones, triggers, scripts }.
// O mapa final é ASCII (veja gfx/tiles.js para a legenda); o MapBuilder só ajuda a desenhá-lo.
(function () {
  const U = G.U;

  G.defineArea = function (def) {
    if (def.build) {
      const b = new MapBuilder(def.size[0], def.size[1], def.fill || '.', def.seed || 1);
      def.build(b, def);
      // limpa árvores/pedras que caíram sob objetos, NPCs e casas
      const PROPS = 'TPrDkxYg';
      for (const s of def.entities || []) {
        if (s.tx === undefined || s.type === 'mechanism') continue;
        const w = s.kind === 'house' ? s.w : 1, h = s.kind === 'house' ? s.h : 1;
        for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
          const ch = b.get(s.tx + i, s.ty - j);
          if (PROPS.includes(ch)) b.set(s.tx + i, s.ty - j, def.theme === 'cave' ? 'f' : def.fill === '_' ? '_' : def.fill === '#' || def.fill === 'c' ? 'm' : '.');
        }
      }
      def.map = b.rows();
    }
    def.entities = def.entities || [];
    def.scripts = def.scripts || {};
    G.Areas[def.id] = def;
    return def;
  };

  class MapBuilder {
    constructor(w, h, fill, seed) {
      this.w = w; this.h = h;
      this.g = [];
      for (let y = 0; y < h; y++) this.g.push(new Array(w).fill(fill));
      this.rnd = U.rng(seed * 7919 + 13);
    }
    in(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
    set(x, y, ch) { if (this.in(x, y)) this.g[y][x] = ch; return this; }
    get(x, y) { return this.in(x, y) ? this.g[y][x] : 'v'; }
    rect(x, y, w, h, ch) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, ch); return this; }
    frame(x, y, w, h, ch) {
      for (let i = x; i < x + w; i++) { this.set(i, y, ch); this.set(i, y + h - 1, ch); }
      for (let j = y; j < y + h; j++) { this.set(x, j, ch); this.set(x + w - 1, j, ch); }
      return this;
    }
    hline(x0, x1, y, ch, thick = 1) { const a = Math.min(x0, x1), b = Math.max(x0, x1); return this.rect(a, y, b - a + 1, thick, ch); }
    vline(x, y0, y1, ch, thick = 1) { const a = Math.min(y0, y1), b = Math.max(y0, y1); return this.rect(x, a, thick, b - a + 1, ch); }
    // caminho em L entre pontos
    path(pts, ch, thick = 2) {
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
        this.hline(x0, x1, y0, ch, thick);
        this.vline(x1, y0, y1, ch, thick);
      }
      return this;
    }
    ellipse(cx, cy, rx, ry, ch, only) {
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const k = ((x - cx) * (x - cx)) / (rx * rx) + ((y - cy) * (y - cy)) / (ry * ry);
        if (k <= 1 && (!only || only.includes(this.get(x, y)))) this.set(x, y, ch);
      }
      return this;
    }
    // espalha um tile com densidade, apenas sobre certos tiles
    scatter(x, y, w, h, ch, density, only = '.') {
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (only.includes(this.get(i, j)) && this.rnd() < density) this.set(i, j, ch);
      return this;
    }
    // borda orgânica (floresta): espessura variável
    border(ch, min = 1, max = 3, gaps = []) {
      const inGap = (x, y) => gaps.some((g) => x >= g[0] && x < g[0] + g[2] && y >= g[1] && y < g[1] + g[3]);
      let t = min;
      for (let x = 0; x < this.w; x++) { t = U.clamp(t + (this.rnd() < 0.5 ? -1 : 1), min, max); for (let k = 0; k < t; k++) if (!inGap(x, k)) this.set(x, k, ch); }
      for (let x = 0; x < this.w; x++) { t = U.clamp(t + (this.rnd() < 0.5 ? -1 : 1), min, max); for (let k = 0; k < t; k++) if (!inGap(x, this.h - 1 - k)) this.set(x, this.h - 1 - k, ch); }
      for (let y = 0; y < this.h; y++) { t = U.clamp(t + (this.rnd() < 0.5 ? -1 : 1), min, max); for (let k = 0; k < t; k++) if (!inGap(k, y)) this.set(k, y, ch); }
      for (let y = 0; y < this.h; y++) { t = U.clamp(t + (this.rnd() < 0.5 ? -1 : 1), min, max); for (let k = 0; k < t; k++) if (!inGap(this.w - 1 - k, y)) this.set(this.w - 1 - k, y, ch); }
      return this;
    }
    replace(from, to, x = 0, y = 0, w = this.w, h = this.h) {
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (from.includes(this.get(i, j))) this.set(i, j, to);
      return this;
    }
    rows() { return this.g.map((r) => r.join('')); }
  }
  G.MapBuilder = MapBuilder;
  G.TOTAL_SECRETS = 6; // segredos 'secret_*' da Fase 1

  // Ajudantes de script reutilizáveis
  G.LevelKit = {
    // fecha portões, invoca ondas e reabre (arena)
    *arena(g, gates, waves, opts = {}) {
      for (const id of gates) { const gt = g.entities.find((e) => e.id === id); if (gt) { if (opts.inside) gt.pushTo = opts.inside; gt.setOpen(false, g); } }
      G.Audio.playMusic('combat', 0.6);
      for (const wave of waves) {
        const spawned = [];
        for (const [type, tx, ty, o] of wave) {
          const e = g.spawnEnemy(type, tx * 16 + 8, ty * 16 + 14, Object.assign({}, o || {}));
          if (e) { e.aggro = true; spawned.push(e); g.particles.burst(e.x, e.y - 8, 14, { colors: ['#2a1840', '#6a3a9a'], speed: 40, life: 0.5 }); }
        }
        yield G.Co.wait(0.5);
        // espera só os inimigos desta onda (os de outras salas não contam)
        yield G.Co.until(() => spawned.every((e) => e.dead || e.deathT > 0 || !g.entities.includes(e)));
        yield G.Co.wait(0.6);
      }
      for (const id of gates) { const gt = g.entities.find((e) => e.id === id); if (gt) gt.setOpen(true, g); }
      if (opts.flag) g.setFlag(opts.flag, true);
      G.Audio.sfx('solved');
      G.Audio.playMusic(g.level.def.music, 1.5);
    },
  };
})();
