// Componentes visuais da interface (painéis, molduras, barras, listas).
(function () {
  const U = G.U;
  const UI = {};

  UI.COL = {
    bg: '#14101e', bg2: '#1e1830', border: '#4a3e66', gold: '#d9b45a', goldL: '#f2d98c',
    text: '#ece6f6', dim: '#8a84a8', sel: '#2e2648', red: '#e84a5a', green: '#7aff8a', blue: '#8ae8ff',
  };

  UI.panel = function (ctx, x, y, w, h, alpha = 0.94) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = UI.COL.bg; ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    ctx.globalAlpha /= alpha;
    ctx.fillStyle = '#0a0812'; ctx.fillRect(x + 1, y, w - 2, 1); ctx.fillRect(x + 1, y + h - 1, w - 2, 1); ctx.fillRect(x, y + 1, 1, h - 2); ctx.fillRect(x + w - 1, y + 1, 1, h - 2);
    ctx.fillStyle = UI.COL.border; ctx.fillRect(x + 2, y + 1, w - 4, 1); ctx.fillRect(x + 2, y + h - 2, w - 4, 1); ctx.fillRect(x + 1, y + 2, 1, h - 4); ctx.fillRect(x + w - 2, y + 2, 1, h - 4);
    ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(x + 2, y + 2, w - 4, Math.min(10, h - 4));
    // cantos dourados
    ctx.fillStyle = UI.COL.gold;
    for (const [cx, cy, sx, sy] of [[x + 1, y + 1, 1, 1], [x + w - 2, y + 1, -1, 1], [x + 1, y + h - 2, 1, -1], [x + w - 2, y + h - 2, -1, -1]]) {
      ctx.fillRect(cx, cy, sx * 4 || 1, 1); ctx.fillRect(Math.min(cx, cx + sx * 3), cy, 4, 1);
      ctx.fillRect(cx, Math.min(cy, cy + sy * 3), 1, 4);
    }
  };
  UI.frame = function (ctx, x, y, w, h, color) {
    ctx.fillStyle = color || UI.COL.border;
    ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1); ctx.fillRect(x, y, 1, h); ctx.fillRect(x + w - 1, y, 1, h);
  };
  UI.bar = function (ctx, x, y, w, h, k, color, bg = '#2a2236', ghost) {
    x = Math.round(x); y = Math.round(y);
    ctx.fillStyle = '#0a0812'; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
    if (ghost !== undefined && ghost > k) { ctx.fillStyle = '#ffffff'; ctx.globalAlpha *= 0.5; ctx.fillRect(x, y, Math.round(w * U.clamp(ghost, 0, 1)), h); ctx.globalAlpha *= 2; }
    ctx.fillStyle = color; ctx.fillRect(x, y, Math.round(w * U.clamp(k, 0, 1)), h);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x, y, Math.round(w * U.clamp(k, 0, 1)), 1);
  };
  UI.title = function (ctx, text, x, y, color) {
    G.Font.draw(ctx, text, x, y, color || UI.COL.goldL, { align: 'center', shadow: true });
    const w = G.Font.measure(text);
    ctx.fillStyle = UI.COL.gold; ctx.fillRect(Math.round(x - w / 2 - 14), y + 4, 10, 1); ctx.fillRect(Math.round(x + w / 2 + 4), y + 4, 10, 1);
  };
  // lista vertical de opções
  UI.options = function (ctx, opts, sel, x, y, g, opt = {}) {
    const lh = opt.lh || 14;
    opts.forEach((o, i) => {
      const label = typeof o === 'string' ? o : o.label;
      const disabled = o && o.disabled;
      const yy = y + i * lh;
      if (i === sel) {
        const w = opt.w || G.Font.measure(label) + 20;
        ctx.fillStyle = UI.COL.sel; ctx.fillRect(Math.round(opt.center ? x - w / 2 : x - 10), yy - 3, w, lh - 2);
        G.Font.draw(ctx, '▶', Math.round((opt.center ? x - w / 2 : x - 10) + 2 + (Math.floor(g.time * 4) % 2)), yy, UI.COL.gold);
      }
      G.Font.draw(ctx, label, x, yy, disabled ? '#5a5470' : i === sel ? '#ffffff' : UI.COL.text, { align: opt.center ? 'center' : 'left', shadow: true });
    });
  };
  UI.keycap = function (ctx, label, x, y, color = '#ece6f6') {
    const w = Math.max(9, G.Font.measure(label) + 5);
    ctx.fillStyle = '#0a0812'; ctx.fillRect(x, y + 1, w, 10);
    ctx.fillStyle = '#3a3050'; ctx.fillRect(x, y, w, 10);
    ctx.fillStyle = '#5a4e78'; ctx.fillRect(x, y, w, 1);
    G.Font.draw(ctx, label, x + Math.round(w / 2), y + 2, color, { align: 'center' });
    return w;
  };
  G.UI = UI;
})();
