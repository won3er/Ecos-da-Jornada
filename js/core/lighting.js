// Iluminação dinâmica: mapa de luz em meia resolução (fica "pixelado"),
// luzes recortam a escuridão e brilhos coloridos são somados por cima.
(function () {
  const U = G.U;
  const SCALE = 2;
  class Lighting {
    constructor() {
      this.cw = Math.ceil(G.VIEW_W / SCALE); this.ch = Math.ceil(G.VIEW_H / SCALE);
      this.canvas = U.makeCanvas(this.cw, this.ch);
      this.ctx = this.canvas.getContext('2d');
      this.lights = [];
      this.grad = this.makeGradient('#ffffff');
      this.colorGrads = {};
    }
    makeGradient(color) {
      const s = 64, c = U.makeCanvas(s, s), x = c.getContext('2d');
      const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, U.rgba(color, 1));
      g.addColorStop(0.45, U.rgba(color, 0.75));
      g.addColorStop(1, U.rgba(color, 0));
      x.fillStyle = g; x.fillRect(0, 0, s, s);
      return c;
    }
    colorGrad(color) {
      if (!this.colorGrads[color]) this.colorGrads[color] = this.makeGradient(color);
      return this.colorGrads[color];
    }
    clear() { this.lights.length = 0; }
    // r = raio em px do mundo, a = intensidade 0..1, color = brilho aditivo opcional
    add(x, y, r, a = 1, color = null, glowA = 0.18) { this.lights.push({ x, y, r, a, color, glowA }); }

    render(ctx, cam, darkness, darkColor = '#05040c') {
      if (darkness > 0.01) {
        const lc = this.ctx;
        lc.globalCompositeOperation = 'source-over';
        lc.clearRect(0, 0, this.cw, this.ch);
        lc.fillStyle = U.rgba(darkColor, darkness);
        lc.fillRect(0, 0, this.cw, this.ch);
        lc.globalCompositeOperation = 'destination-out';
        for (const l of this.lights) {
          const x = (l.x - cam.rx) / SCALE, y = (l.y - cam.ry) / SCALE, r = l.r / SCALE;
          if (x + r < 0 || y + r < 0 || x - r > this.cw || y - r > this.ch) continue;
          lc.globalAlpha = U.clamp(l.a, 0, 1);
          lc.drawImage(this.grad, Math.round(x - r), Math.round(y - r), Math.round(r * 2), Math.round(r * 2));
        }
        lc.globalAlpha = 1;
        lc.globalCompositeOperation = 'source-over';
        ctx.drawImage(this.canvas, 0, 0, this.cw * SCALE, this.ch * SCALE);
      }
      // brilhos coloridos
      ctx.globalCompositeOperation = 'lighter';
      for (const l of this.lights) {
        if (!l.color) continue;
        const x = l.x - cam.rx, y = l.y - cam.ry, r = l.r * 0.8;
        if (x + r < 0 || y + r < 0 || x - r > G.VIEW_W || y - r > G.VIEW_H) continue;
        ctx.globalAlpha = l.glowA * (darkness > 0.3 ? 1 : 0.6);
        ctx.drawImage(this.colorGrad(l.color), Math.round(x - r), Math.round(y - r), Math.round(r * 2), Math.round(r * 2));
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  G.Lighting = Lighting;
})();
