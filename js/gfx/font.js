// Fonte bitmap 5x7 proporcional com acentos do português, desenhada pixel a pixel.
(function () {
  const U = G.U;
  // Cada glifo: linhas em hex (bit 0x10 = coluna mais à esquerda). Até 9 linhas (2 de descendente).
  const RAW = {
    'A': '0E 11 11 11 1F 11 11', 'B': '1E 11 11 1E 11 11 1E', 'C': '0E 11 10 10 10 11 0E',
    'D': '1C 12 11 11 11 12 1C', 'E': '1F 10 10 1E 10 10 1F', 'F': '1F 10 10 1E 10 10 10',
    'G': '0E 11 10 17 11 11 0F', 'H': '11 11 11 1F 11 11 11', 'I': '0E 04 04 04 04 04 0E',
    'J': '07 02 02 02 02 12 0C', 'K': '11 12 14 18 14 12 11', 'L': '10 10 10 10 10 10 1F',
    'M': '11 1B 15 15 11 11 11', 'N': '11 11 19 15 13 11 11', 'O': '0E 11 11 11 11 11 0E',
    'P': '1E 11 11 1E 10 10 10', 'Q': '0E 11 11 11 15 12 0D', 'R': '1E 11 11 1E 14 12 11',
    'S': '0F 10 10 0E 01 01 1E', 'T': '1F 04 04 04 04 04 04', 'U': '11 11 11 11 11 11 0E',
    'V': '11 11 11 11 11 0A 04', 'W': '11 11 11 15 15 15 0A', 'X': '11 11 0A 04 0A 11 11',
    'Y': '11 11 11 0A 04 04 04', 'Z': '1F 01 02 04 08 10 1F',
    'a': '00 00 0E 01 0F 11 0F', 'b': '10 10 16 19 11 11 1E', 'c': '00 00 0E 10 10 11 0E',
    'd': '01 01 0D 13 11 11 0F', 'e': '00 00 0E 11 1F 10 0E', 'f': '06 09 08 1C 08 08 08',
    'g': '00 00 0F 11 11 0F 01 0E', 'h': '10 10 16 19 11 11 11', 'i': '04 00 0C 04 04 04 0E',
    'j': '02 00 06 02 02 02 12 0C', 'k': '10 10 12 14 18 14 12', 'l': '0C 04 04 04 04 04 0E',
    'm': '00 00 1A 15 15 11 11', 'n': '00 00 16 19 11 11 11', 'o': '00 00 0E 11 11 11 0E',
    'p': '00 00 1E 11 11 1E 10 10', 'q': '00 00 0F 11 11 0F 01 01', 'r': '00 00 16 19 10 10 10',
    's': '00 00 0F 10 0E 01 1E', 't': '08 08 1C 08 08 09 06', 'u': '00 00 11 11 11 13 0D',
    'v': '00 00 11 11 11 0A 04', 'w': '00 00 11 11 15 15 0A', 'x': '00 00 11 0A 04 0A 11',
    'y': '00 00 11 11 11 0F 01 0E', 'z': '00 00 1F 02 04 08 1F',
    '0': '0E 11 13 15 19 11 0E', '1': '04 0C 04 04 04 04 0E', '2': '0E 11 01 02 04 08 1F',
    '3': '1F 02 04 02 01 11 0E', '4': '02 06 0A 12 1F 02 02', '5': '1F 10 1E 01 01 11 0E',
    '6': '06 08 10 1E 11 11 0E', '7': '1F 01 02 04 08 08 08', '8': '0E 11 11 0E 11 11 0E',
    '9': '0E 11 11 0F 01 02 0C',
    '.': '00 00 00 00 00 00 10', ',': '00 00 00 00 00 08 08 10', '!': '10 10 10 10 10 00 10',
    '?': '0E 11 01 02 04 00 04', ':': '00 00 10 00 00 10 00', ';': '00 00 08 00 00 08 08 10',
    '-': '00 00 00 0E 00 00 00', '+': '00 04 04 1F 04 04 00', '/': '01 01 02 04 08 10 10',
    '(': '04 08 10 10 10 08 04', ')': '10 08 04 04 04 08 10', '"': '14 14 00 00 00 00 00',
    "'": '10 10 00 00 00 00 00', '%': '18 19 02 04 08 13 03', '<': '02 04 08 10 08 04 02',
    '>': '10 08 04 02 04 08 10', '=': '00 00 1F 00 1F 00 00', '[': '18 10 10 10 10 10 18',
    ']': '18 08 08 08 08 08 18', '*': '00 04 15 0E 15 04 00', '#': '0A 0A 1F 0A 1F 0A 0A',
    '_': '00 00 00 00 00 00 1F', '$': '04 0F 14 0E 05 1E 04', '&': '0C 12 14 08 15 12 0D',
    '♥': '00 0A 1F 1F 0E 04 00', '★': '04 04 1F 0E 0A 11 00', '▶': '10 18 1C 1E 1C 18 10',
    '◀': '02 06 0E 1E 0E 06 02', '▼': '00 00 1F 0E 04 00 00', '▲': '00 00 04 0E 1F 00 00',
    '◆': '00 04 0E 1F 0E 04 00', '•': '00 00 00 18 18 00 00', '…': '00 00 00 00 00 00 15',
    '—': '00 00 00 1F 00 00 00', '×': '00 11 0A 04 0A 11 00', '·': '00 00 00 10 00 00 00',
    '°': '08 14 08 00 00 00 00', '~': '00 00 0D 16 00 00 00',
  };
  const ALIAS = { '“': '"', '”': '"', '‘': "'", '’': "'", '–': '-', 'º': '°', 'ª': 'a' };
  // Acentos: [base, marca]
  const ACC = {
    acute: ['02', '04'], grave: ['08', '04'], circ: ['04', '0A'], tilde: ['0D', '16'], diaer: ['00', '0A'],
  };
  const COMPOSE = {
    'á': ['a', 'acute'], 'à': ['a', 'grave'], 'â': ['a', 'circ'], 'ã': ['a', 'tilde'], 'ä': ['a', 'diaer'],
    'é': ['e', 'acute'], 'è': ['e', 'grave'], 'ê': ['e', 'circ'],
    'í': ['ı', 'acute'], 'ì': ['ı', 'grave'], 'î': ['ı', 'circ'],
    'ó': ['o', 'acute'], 'ò': ['o', 'grave'], 'ô': ['o', 'circ'], 'õ': ['o', 'tilde'], 'ö': ['o', 'diaer'],
    'ú': ['u', 'acute'], 'ù': ['u', 'grave'], 'û': ['u', 'circ'], 'ü': ['u', 'diaer'],
    'ñ': ['n', 'tilde'],
    'Á': ['A', 'acute'], 'À': ['A', 'grave'], 'Â': ['A', 'circ'], 'Ã': ['A', 'tilde'],
    'É': ['E', 'acute'], 'Ê': ['E', 'circ'], 'Í': ['I', 'acute'], 'Ó': ['O', 'acute'], 'Ô': ['O', 'circ'],
    'Õ': ['O', 'tilde'], 'Ú': ['U', 'acute'], 'Ñ': ['N', 'tilde'],
  };
  RAW['ı'] = '00 00 0C 04 04 04 0E';

  const CELL_W = 6, CELL_H = 11, COLS = 20;
  const glyphs = {};

  function rowsOf(str) { return str.split(' ').map((h) => parseInt(h, 16)); }

  // Monta a grade 11 linhas: 0-1 acento maiúsculo, 2-8 glifo, 9-10 descendente
  function buildGrid(ch) {
    const grid = new Array(CELL_H).fill(0);
    if (RAW[ch]) {
      rowsOf(RAW[ch]).forEach((r, i) => { grid[2 + i] = r; });
      return grid;
    }
    if (COMPOSE[ch]) {
      const [base, acc] = COMPOSE[ch];
      const g = buildGrid(base);
      const m = ACC[acc].map((h) => parseInt(h, 16));
      const upper = base === base.toUpperCase() && base !== 'ı';
      const off = upper ? 0 : 2;
      g[off] |= m[0]; g[off + 1] |= m[1];
      return g;
    }
    if (ch === 'ç' || ch === 'Ç') {
      const g = buildGrid(ch === 'ç' ? 'c' : 'C');
      g[9] |= 0x04; g[10] |= 0x08;
      return g;
    }
    return null;
  }

  const chars = Object.keys(RAW).concat(Object.keys(COMPOSE), ['ç', 'Ç']);
  const rowsN = Math.ceil(chars.length / COLS);
  const atlas = U.makeCanvas(COLS * CELL_W, rowsN * CELL_H);
  const actx = atlas.getContext('2d');
  actx.fillStyle = '#fff';
  chars.forEach((ch, idx) => {
    const grid = buildGrid(ch);
    if (!grid) return;
    let minC = 5, maxC = -1;
    for (const r of grid) for (let c = 0; c < 5; c++) if (r & (0x10 >> c)) { minC = Math.min(minC, c); maxC = Math.max(maxC, c); }
    if (maxC < 0) { minC = 0; maxC = 2; }
    const sx = (idx % COLS) * CELL_W, sy = Math.floor(idx / COLS) * CELL_H;
    grid.forEach((r, y) => {
      for (let c = minC; c <= maxC; c++) if (r & (0x10 >> c)) actx.fillRect(sx + c - minC, sy + y, 1, 1);
    });
    glyphs[ch] = { sx, sy, w: maxC - minC + 1 };
  });
  glyphs[' '] = { sx: 0, sy: 0, w: 3, space: true };

  const tinted = {};
  function atlasFor(color) {
    if (color === '#fff' || color === '#ffffff') return atlas;
    if (tinted[color]) return tinted[color];
    const c = U.makeCanvas(atlas.width, atlas.height), x = c.getContext('2d');
    x.drawImage(atlas, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
    tinted[color] = c;
    return c;
  }

  const F = { LINE: 11, atlas };
  function glyph(ch) {
    if (glyphs[ch]) return glyphs[ch];
    if (ALIAS[ch] && glyphs[ALIAS[ch]]) return glyphs[ALIAS[ch]];
    return glyphs['?'];
  }
  F.measure = function (str, scale = 1) {
    let w = 0;
    for (const ch of String(str)) w += glyph(ch).w + 1;
    return Math.max(0, w - 1) * scale;
  };
  // y = topo das maiúsculas
  F.draw = function (ctx, str, x, y, color = '#fff', opts = {}) {
    str = String(str);
    const scale = opts.scale || 1;
    if (opts.align === 'center') x -= Math.floor(F.measure(str, scale) / 2);
    else if (opts.align === 'right') x -= F.measure(str, scale);
    x = Math.round(x); y = Math.round(y);
    if (opts.shadow) {
      const sc = opts.shadowColor || '#0b0a12';
      F.draw(ctx, str, x + scale, y + scale, sc, { scale });
      if (opts.outline) {
        F.draw(ctx, str, x - scale, y, sc, { scale }); F.draw(ctx, str, x + scale, y, sc, { scale });
        F.draw(ctx, str, x, y - scale, sc, { scale });
      }
    }
    const img = atlasFor(color);
    let cx = x;
    for (const ch of str) {
      const g = glyph(ch);
      if (!g.space) ctx.drawImage(img, g.sx, g.sy, g.w, CELL_H, cx, y - 2 * scale, g.w * scale, CELL_H * scale);
      cx += (g.w + 1) * scale;
    }
    return cx - x;
  };
  F.drawWrapped = function (ctx, str, x, y, maxW, color, opts = {}) {
    const lines = U.wrapText(str, maxW, (s) => F.measure(s, opts.scale || 1));
    const lh = opts.lineHeight || F.LINE;
    lines.forEach((l, i) => F.draw(ctx, l, x, y + i * lh, color, opts));
    return lines.length;
  };
  F.wrap = (str, maxW, scale = 1) => U.wrapText(str, maxW, (s) => F.measure(s, scale));

  G.Font = F;
})();
