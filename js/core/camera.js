// Câmera: enquadra os dois jogadores (ponto médio), com limites do mapa,
// tremor de tela e suporte a "foco" de cutscene.
(function () {
  const U = G.U;
  class Camera {
    constructor() {
      this.x = 0; this.y = 0;
      this.w = G.VIEW_W; this.h = G.VIEW_H;
      this.shakeT = 0; this.shakeMag = 0;
      this.focus = null;      // {x,y} alvo de cutscene
      this.ox = 0; this.oy = 0;
      this.bounds = { w: 9999, h: 9999 };
    }
    setBounds(w, h) { this.bounds = { w, h }; }
    target(players) {
      if (this.focus) return { x: this.focus.x, y: this.focus.y };
      const ps = players.filter((p) => p && p.active !== false);
      if (!ps.length) return { x: this.x + this.w / 2, y: this.y + this.h / 2 };
      let x = 0, y = 0;
      for (const p of ps) { x += p.x; y += p.y - 8; }
      x /= ps.length; y /= ps.length;
      if (this.extra) { x = x * 0.72 + this.extra.x * 0.28; y = y * 0.72 + this.extra.y * 0.28; }
      return { x, y };
    }
    clampPos(cx, cy) {
      const b = this.bounds;
      let x = cx - this.w / 2, y = cy - this.h / 2;
      if (b.w <= this.w) x = (b.w - this.w) / 2; else x = U.clamp(x, 0, b.w - this.w);
      if (b.h <= this.h) y = (b.h - this.h) / 2; else y = U.clamp(y, 0, b.h - this.h);
      return { x, y };
    }
    snap(players) {
      const t = this.target(players);
      const p = this.clampPos(t.x, t.y);
      this.x = p.x; this.y = p.y;
    }
    update(dt, players) {
      const t = this.target(players);
      const p = this.clampPos(t.x, t.y);
      const k = this.focus ? (this.focus.speed || 3) : 9;
      const f = 1 - Math.exp(-k * dt);
      this.x += (p.x - this.x) * f;
      this.y += (p.y - this.y) * f;
      if (this.shakeT > 0) {
        this.shakeT -= dt;
        const m = this.shakeMag * Math.min(1, this.shakeT * 4) * (G.settings && G.settings.shake === false ? 0 : 1);
        this.ox = U.rand(-m, m); this.oy = U.rand(-m, m);
      } else { this.ox = 0; this.oy = 0; }
    }
    shake(mag, time) {
      if (mag >= this.shakeMag || this.shakeT <= 0) { this.shakeMag = mag; }
      this.shakeT = Math.max(this.shakeT, time);
    }
    get rx() { return Math.round(this.x + this.ox); }
    get ry() { return Math.round(this.y + this.oy); }
    inView(x, y, margin = 32) {
      return x > this.x - margin && x < this.x + this.w + margin && y > this.y - margin && y < this.y + this.h + margin;
    }
  }
  G.Camera = Camera;
})();
