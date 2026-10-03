// Primitivas de desenho em pixel (sem anti-aliasing) e utilitários de sprite.
(function () {
  const U = G.U;
  const P = {};

  P.rect = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

  P.circle = (ctx, cx, cy, r, color) => {
    ctx.fillStyle = color;
    cx = Math.round(cx); cy = Math.round(cy);
    for (let y = -r; y <= r; y++) {
      const w = Math.floor(Math.sqrt(r * r - y * y + r * 0.8));
      ctx.fillRect(cx - w, cy + y, w * 2 + 1, 1);
    }
  };
  P.ellipse = (ctx, cx, cy, rx, ry, color) => {
    ctx.fillStyle = color;
    cx = Math.round(cx); cy = Math.round(cy);
    for (let y = -ry; y <= ry; y++) {
      const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / ((ry + 0.5) * (ry + 0.5)))));
      ctx.fillRect(cx - w, cy + y, w * 2 + 1, 1);
    }
  };
  P.ring = (ctx, cx, cy, r, color, width = 1) => {
    ctx.fillStyle = color;
    const steps = Math.max(12, Math.floor(r * 6.3));
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      for (let wdt = 0; wdt < width; wdt++) {
        ctx.fillRect(Math.round(cx + Math.cos(a) * (r - wdt)), Math.round(cy + Math.sin(a) * (r - wdt) * 0.75), 1, 1);
      }
    }
  };
  P.line = (ctx, x0, y0, x1, y1, color) => {
    ctx.fillStyle = color;
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy, n = 0;
    while (n++ < 2000) {
      ctx.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };
  // Sombra elíptica no chão
  P.shadow = (ctx, x, y, w, alpha = 0.3) => {
    ctx.globalAlpha = alpha;
    P.ellipse(ctx, x, y, Math.max(2, Math.round(w / 2)), Math.max(1, Math.round(w / 5)), '#0a0812');
    ctx.globalAlpha = 1;
  };

  // Sprite a partir de linhas de texto + paleta. '.' e ' ' = transparente.
  P.fromRows = (rows, pal) => {
    const h = rows.length, w = Math.max(...rows.map((r) => r.length));
    const c = U.makeCanvas(w, h), x = c.getContext('2d');
    for (let j = 0; j < h; j++) {
      const row = rows[j];
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch === '.' || ch === ' ') continue;
        const col = pal[ch];
        if (!col) continue;
        x.fillStyle = col; x.fillRect(i, j, 1, 1);
      }
    }
    return c;
  };
  P.flipH = (src) => {
    const c = U.makeCanvas(src.width, src.height), x = c.getContext('2d');
    x.translate(src.width, 0); x.scale(-1, 1); x.drawImage(src, 0, 0);
    return c;
  };
  P.silhouette = (src, color) => {
    const c = U.makeCanvas(src.width, src.height), x = c.getContext('2d');
    x.drawImage(src, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
    return c;
  };
  // Contorno escuro de 1px (dá o acabamento "premium" ao sprite)
  P.outline = (src, color = '#120e1c', pad = 1) => {
    const w = src.width + pad * 2, h = src.height + pad * 2;
    const c = U.makeCanvas(w, h), x = c.getContext('2d');
    const sil = P.silhouette(src, color);
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) x.drawImage(sil, pad + dx, pad + dy);
    x.drawImage(src, pad, pad);
    return c;
  };
  // Desenha num canvas novo via função
  P.make = (w, h, fn) => {
    const c = U.makeCanvas(w, h), x = c.getContext('2d');
    fn(x, w, h);
    return c;
  };
  // Pontilhado (dither) entre duas cores numa área
  P.dither = (ctx, x, y, w, h, c1, c2, rnd, density = 0.5) => {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      ctx.fillStyle = rnd() < density ? c2 : c1;
      ctx.fillRect(x + i, y + j, 1, 1);
    }
  };

  G.Pixel = P;
})();
