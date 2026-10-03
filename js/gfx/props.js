// Arte procedural dos objetos do cenário (árvores, casas, alavancas, baús...).
// Tudo é gerado uma vez e guardado em cache como canvas.
(function () {
  const U = G.U, P = G.Pixel;
  const C = {};
  const cache = (k, w, h, fn) => (C[k] || (C[k] = P.make(w, h, fn)));

  const LEAF = {
    village: ['#2f5a2a', '#3e7234', '#558c42', '#74aa52', '#9cc86a'],
    forest: ['#1e3e24', '#2a5230', '#3a6a3c', '#52864c', '#74a464'],
    ruins: ['#2a4a2a', '#385e34', '#4a7442', '#62904e', '#86ac64'],
    memory: ['#3a6a2a', '#4a8034', '#62a042', '#82be56', '#a8d870'],
    night: ['#14261e', '#1c3428', '#284634', '#365a42', '#4a7454'],
    sanctum: ['#1e3a4a', '#284e5e', '#36687a', '#4e8a9a', '#7ab8c4'],
    cave: ['#1e3a2a', '#284e34', '#36683e', '#4e8a4e', '#7ab874'],
  };

  const Props = {};

  Props.tree = (theme, v) => cache(`tree_${theme}_${v}`, 44, 52, (x) => {
    const L = LEAF[theme] || LEAF.village;
    const r = U.rng(100 + v * 37 + theme.length);
    // tronco
    x.fillStyle = '#3a2618'; x.fillRect(18, 34, 8, 16);
    x.fillStyle = '#5a3a22'; x.fillRect(19, 34, 5, 16);
    x.fillStyle = '#74502e'; x.fillRect(19, 36, 2, 13);
    x.fillStyle = '#3a2618'; x.fillRect(15, 48, 4, 2); x.fillRect(25, 48, 4, 2);
    // copa: aglomerados de círculos
    const blobs = [];
    for (let i = 0; i < 9; i++) blobs.push([22 + U.rand(-13, 13) * (0.7 + r() * 0.3), 20 + U.rand(-12, 10), 8 + r() * 5]);
    blobs.sort((a, b) => a[1] - b[1]);
    for (const [bx, by, br] of blobs) P.circle(x, bx, by + 2, Math.round(br), L[0]);
    for (const [bx, by, br] of blobs) P.circle(x, bx, by, Math.round(br - 1), L[1]);
    for (const [bx, by, br] of blobs) P.circle(x, bx - 1, by - 2, Math.round(br - 3), L[2]);
    for (const [bx, by, br] of blobs) if (br > 9) P.circle(x, bx - 2, by - 4, Math.round(br - 6), L[3]);
    const inside = (px, py) => blobs.some(([bx, by, br]) => (px - bx) * (px - bx) + (py - by) * (py - by) < (br - 2) * (br - 2));
    for (let i = 0; i < 26; i++) {
      const px = (r() * 36 + 4) | 0, py = (r() * 26 + 4) | 0;
      if (inside(px, py)) { x.fillStyle = r() < 0.5 ? L[4] : L[0]; x.fillRect(px, py, 1, 1); }
    }
  });

  Props.pine = (theme, v) => cache(`pine_${theme}_${v}`, 30, 50, (x) => {
    const L = LEAF[theme] || LEAF.forest;
    x.fillStyle = '#3a2618'; x.fillRect(13, 40, 4, 9);
    x.fillStyle = '#5a3a22'; x.fillRect(14, 40, 2, 9);
    for (let i = 0; i < 4; i++) {
      const top = 4 + i * 9, w = 6 + i * 3 + (v % 2);
      for (let j = 0; j < 12; j++) {
        const ww = Math.round((w * j) / 11);
        x.fillStyle = L[1]; x.fillRect(15 - ww, top + j, ww * 2, 1);
        x.fillStyle = L[0]; x.fillRect(15 + Math.floor(ww * 0.5), top + j, Math.ceil(ww * 0.5), 1);
        x.fillStyle = L[2]; x.fillRect(15 - ww, top + j, Math.max(1, Math.floor(ww * 0.6)), 1);
      }
      x.fillStyle = L[3]; x.fillRect(15 - w + 2, top + 11, 3, 1); x.fillRect(14, top + 1, 1, 2);
    }
    x.fillStyle = L[4]; x.fillRect(14, 4, 1, 1);
  });

  Props.rock = (theme, v) => cache(`rock_${theme}_${v}`, 18, 16, (x) => {
    const base = theme === 'cave' ? '#5a4e52' : '#7e7a76';
    P.ellipse(x, 9, 9, 8, 6, U.shade(base, -0.35));
    P.ellipse(x, 9, 8, 7, 5, base);
    P.ellipse(x, 7, 6, 4, 3, U.shade(base, 0.2));
    x.fillStyle = U.shade(base, 0.4); x.fillRect(5, 4, 2, 1);
    if (v % 2 && theme !== 'cave') { x.fillStyle = '#5a7a44'; x.fillRect(9, 2, 4, 2); x.fillRect(11, 4, 2, 1); }
  });

  Props.pillar = (theme, v) => cache(`pillar_${theme}_${v}`, 18, 40, (x) => {
    const base = theme === 'sanctum' ? '#8a8aa8' : '#a49c90';
    const broken = v % 3 === 1;
    const top = broken ? 14 : 4;
    x.fillStyle = U.shade(base, -0.4); x.fillRect(1, 34, 16, 6);
    x.fillStyle = U.shade(base, -0.1); x.fillRect(2, 33, 14, 5);
    x.fillStyle = U.shade(base, -0.3); x.fillRect(3, top, 12, 30);
    x.fillStyle = base; x.fillRect(4, top, 8, 30);
    x.fillStyle = U.shade(base, 0.2); x.fillRect(5, top, 2, 30);
    x.fillStyle = U.shade(base, -0.2); x.fillRect(9, top, 1, 30);
    if (!broken) { x.fillStyle = U.shade(base, -0.2); x.fillRect(1, 2, 16, 4); x.fillStyle = U.shade(base, 0.15); x.fillRect(2, 1, 14, 2); }
    else { x.fillStyle = U.shade(base, 0.1); x.fillRect(3, top - 2, 4, 2); x.fillRect(9, top - 1, 4, 1); }
    x.fillStyle = '#5a7a44'; x.fillRect(4, 28, 3, 6); x.fillRect(11, 22, 2, 4);
  });

  Props.crystal = (theme, v) => cache(`crystal_${v}`, 18, 30, (x) => {
    const cols = v % 2 ? ['#3a5aa8', '#6a9ae8', '#b8e0ff', '#ffffff'] : ['#5a3aa8', '#9a6ae8', '#e0c0ff', '#ffffff'];
    const shard = (cx, h, w) => {
      for (let j = 0; j < h; j++) {
        const ww = Math.max(1, Math.round(w * Math.min(1, (j + 2) / 6)));
        x.fillStyle = cols[0]; x.fillRect(cx - ww, 28 - h + j, ww * 2, 1);
        x.fillStyle = cols[1]; x.fillRect(cx - ww, 28 - h + j, ww, 1);
        x.fillStyle = cols[2]; x.fillRect(cx - ww, 28 - h + j, 1, 1);
      }
    };
    shard(5, 14, 3); shard(13, 12, 3); shard(9, 24, 4);
    x.fillStyle = cols[3]; x.fillRect(7, 8, 1, 4);
  });

  Props.stalagmite = (v) => cache(`stalag_${v}`, 16, 24, (x) => {
    for (let j = 0; j < 22; j++) {
      const w = Math.round(1 + (j / 21) * 6);
      x.fillStyle = '#3a3036'; x.fillRect(8 - w, j + 1, w * 2, 1);
      x.fillStyle = '#5a4c52'; x.fillRect(8 - w, j + 1, w, 1);
      x.fillStyle = '#76666c'; x.fillRect(8 - w, j + 1, 1, 1);
    }
  });

  Props.grave = (v) => cache(`grave_${v}`, 14, 18, (x) => {
    x.fillStyle = '#4a4650'; x.fillRect(1, 4, 12, 14); x.fillRect(3, 2, 8, 2);
    x.fillStyle = '#7a7480'; x.fillRect(2, 4, 10, 13); x.fillRect(4, 3, 6, 1);
    x.fillStyle = '#9a94a0'; x.fillRect(3, 4, 2, 12);
    x.fillStyle = '#4a4650'; x.fillRect(6, 7, 2, 6); x.fillRect(4, 9, 6, 2);
    x.fillStyle = '#5a7a44'; x.fillRect(1, 16, 4, 2); x.fillRect(10, 15, 3, 3);
  });

  Props.stump = () => cache('stump', 16, 14, (x) => {
    P.ellipse(x, 8, 9, 7, 4, '#3a2618'); x.fillStyle = '#5a3a22'; x.fillRect(2, 5, 12, 6);
    P.ellipse(x, 8, 5, 6, 3, '#a07850'); P.ellipse(x, 8, 5, 3, 1, '#7a5a3a');
  });

  Props.bush = (theme, cut) => cache(`bush_${theme}_${cut ? 1 : 0}`, 16, 14, (x) => {
    const L = LEAF[theme] || LEAF.village;
    if (cut) { x.fillStyle = L[0]; x.fillRect(4, 9, 8, 3); x.fillStyle = L[2]; x.fillRect(5, 9, 2, 1); x.fillRect(9, 10, 2, 1); return; }
    P.ellipse(x, 8, 8, 7, 5, L[0]); P.ellipse(x, 8, 7, 6, 4, L[1]); P.ellipse(x, 6, 5, 3, 2, L[2]);
    x.fillStyle = L[3]; x.fillRect(5, 4, 2, 1); x.fillRect(10, 6, 1, 1); x.fillRect(8, 9, 1, 1);
    x.fillStyle = L[4]; x.fillRect(6, 4, 1, 1);
  });

  Props.house = (cfg) => {
    const key = 'house_' + JSON.stringify(cfg);
    const w = cfg.w * 16, h = cfg.h * 16 + 24;
    return cache(key, w, h, (x) => {
      const roof = cfg.roof || '#8a3a3a', wall = cfg.wall || '#d8c8a8', wood = '#5a3a22';
      const roofH = Math.round(h * 0.52);
      const wallTop = roofH - 6;
      // parede
      x.fillStyle = U.shade(wall, -0.25); x.fillRect(2, wallTop, w - 4, h - wallTop);
      x.fillStyle = wall; x.fillRect(3, wallTop, w - 6, h - wallTop - 2);
      // enxaimel
      x.fillStyle = wood;
      x.fillRect(2, wallTop, 3, h - wallTop); x.fillRect(w - 5, wallTop, 3, h - wallTop);
      x.fillRect(2, wallTop + 2, w - 4, 2); x.fillRect(2, h - 4, w - 4, 4);
      for (let bx = 18; bx < w - 10; bx += 22) x.fillRect(bx, wallTop, 2, h - wallTop);
      // base de pedra
      x.fillStyle = '#6e6862'; x.fillRect(2, h - 6, w - 4, 6);
      x.fillStyle = '#8e8882'; for (let bx = 3; bx < w - 4; bx += 6) x.fillRect(bx, h - 5, 4, 2);
      // porta
      const dx = Math.round(w / 2 - 6) + (cfg.doorOffset || 0);
      x.fillStyle = '#2a1a10'; x.fillRect(dx - 1, h - 22, 14, 18);
      x.fillStyle = '#6a4024'; x.fillRect(dx, h - 21, 12, 17);
      x.fillStyle = '#8a5a32'; x.fillRect(dx + 1, h - 21, 2, 17); x.fillRect(dx + 6, h - 21, 2, 17);
      x.fillStyle = '#d8b45a'; x.fillRect(dx + 9, h - 13, 2, 2);
      x.fillStyle = '#3a2a1a'; x.fillRect(dx - 2, h - 23, 16, 2);
      // janelas com luz quente
      const winY = wallTop + 8;
      const wins = cfg.w >= 5 ? [10, w - 22] : [8];
      for (const wx of wins) {
        if (Math.abs(wx + 6 - (dx + 6)) < 14) continue;
        x.fillStyle = '#3a2a1a'; x.fillRect(wx - 1, winY - 1, 14, 12);
        x.fillStyle = cfg.night ? '#ffd88a' : '#f4d890'; x.fillRect(wx, winY, 12, 10);
        x.fillStyle = cfg.night ? '#ffeab0' : '#fff2c8'; x.fillRect(wx + 1, winY + 1, 4, 3);
        x.fillStyle = '#3a2a1a'; x.fillRect(wx + 5, winY, 2, 10); x.fillRect(wx, winY + 4, 12, 2);
        x.fillStyle = '#6a4024'; x.fillRect(wx - 2, winY + 10, 16, 2);
        x.fillStyle = '#c04a5a'; x.fillRect(wx, winY + 12, 2, 2); x.fillRect(wx + 6, winY + 12, 2, 2);
        x.fillStyle = '#4a8a3a'; x.fillRect(wx + 2, winY + 12, 3, 2); x.fillRect(wx + 9, winY + 12, 3, 2);
      }
      // telhado
      for (let j = 0; j < roofH; j++) {
        const inset = Math.max(0, Math.round((roofH - j) * 0.18)) - 2;
        const rw = w - inset * 2;
        x.fillStyle = j % 4 === 3 ? U.shade(roof, -0.3) : U.shade(roof, (j / roofH) * -0.15);
        x.fillRect(inset, j, rw, 1);
        if (j % 4 !== 3) for (let sx = inset + ((j >> 2) % 2) * 3; sx < inset + rw; sx += 6) { x.fillStyle = U.shade(roof, 0.12); x.fillRect(sx, j, 2, 1); }
      }
      x.fillStyle = U.shade(roof, -0.45); x.fillRect(0, roofH - 2, w, 3);
      x.fillStyle = U.shade(roof, 0.25); x.fillRect(Math.round(w * 0.1), 0, Math.round(w * 0.8), 1);
      // chaminé
      if (cfg.chimney !== false) {
        const cx = w - 20;
        x.fillStyle = '#5e4a40'; x.fillRect(cx, 0, 8, Math.round(roofH * 0.45));
        x.fillStyle = '#7e6a5e'; x.fillRect(cx + 1, 0, 3, Math.round(roofH * 0.45));
        x.fillStyle = '#3e2e28'; x.fillRect(cx - 1, 0, 10, 2);
      }
      // placa
      if (cfg.signColor) {
        x.fillStyle = '#3a2a1a'; x.fillRect(dx + 16, h - 30, 12, 10);
        x.fillStyle = cfg.signColor; x.fillRect(dx + 17, h - 29, 10, 8);
        x.fillStyle = '#fff'; x.fillRect(dx + 19, h - 27, 6, 1); x.fillRect(dx + 19, h - 24, 4, 1);
      }
    });
  };

  Props.sign = () => cache('sign', 14, 18, (x) => {
    x.fillStyle = '#3a2618'; x.fillRect(6, 8, 2, 10);
    x.fillStyle = '#3a2618'; x.fillRect(0, 1, 14, 9);
    x.fillStyle = '#9a6a3e'; x.fillRect(1, 2, 12, 7);
    x.fillStyle = '#b8864e'; x.fillRect(1, 2, 12, 1);
    x.fillStyle = '#5a3a22'; x.fillRect(3, 4, 8, 1); x.fillRect(3, 6, 6, 1);
  });

  Props.chest = (open, fancy) => cache(`chest_${open ? 1 : 0}_${fancy ? 1 : 0}`, 18, 16, (x) => {
    const wood = fancy ? '#4a3a8a' : '#8a5a2e', woodL = fancy ? '#6a5ab8' : '#b07a42', metal = fancy ? '#f2d98c' : '#c8b07a';
    x.fillStyle = '#1e140c'; x.fillRect(1, 5, 16, 11);
    x.fillStyle = wood; x.fillRect(2, 8, 14, 7);
    x.fillStyle = woodL; x.fillRect(2, 8, 14, 1);
    if (!open) {
      x.fillStyle = '#1e140c'; x.fillRect(1, 1, 16, 8);
      x.fillStyle = wood; x.fillRect(2, 2, 14, 6);
      x.fillStyle = woodL; x.fillRect(2, 2, 14, 2);
      x.fillStyle = metal; x.fillRect(7, 6, 4, 4); x.fillStyle = '#3a2a1a'; x.fillRect(8, 8, 2, 1);
      x.fillStyle = metal; x.fillRect(4, 2, 1, 13); x.fillRect(13, 2, 1, 13);
    } else {
      x.fillStyle = '#1e140c'; x.fillRect(1, 0, 16, 5);
      x.fillStyle = U.shade(wood, -0.3); x.fillRect(2, 1, 14, 3);
      x.fillStyle = '#0e0806'; x.fillRect(3, 6, 12, 2);
      x.fillStyle = metal; x.fillRect(4, 8, 1, 7); x.fillRect(13, 8, 1, 7);
    }
  });

  Props.crate = () => cache('crate', 16, 20, (x) => {
    x.fillStyle = '#2a1a0e'; x.fillRect(0, 0, 16, 20);
    x.fillStyle = '#9a6a3a'; x.fillRect(1, 1, 14, 18);
    x.fillStyle = '#b8864e'; x.fillRect(1, 1, 14, 3);
    x.fillStyle = '#6a4424'; x.fillRect(1, 4, 14, 1); x.fillRect(1, 17, 14, 2);
    x.fillStyle = '#7a5230';
    for (let i = 0; i < 12; i++) { x.fillRect(2 + i, 5 + i, 2, 1); }
    x.fillStyle = '#5a3a1e'; x.fillRect(1, 4, 1, 15); x.fillRect(14, 4, 1, 15);
    x.fillStyle = '#c8b07a'; x.fillRect(2, 5, 1, 1); x.fillRect(13, 5, 1, 1); x.fillRect(2, 16, 1, 1); x.fillRect(13, 16, 1, 1);
  });

  Props.lever = (on) => cache(`lever_${on ? 1 : 0}`, 14, 16, (x) => {
    x.fillStyle = '#2a2430'; x.fillRect(1, 10, 12, 6);
    x.fillStyle = '#5a5662'; x.fillRect(2, 10, 10, 5);
    x.fillStyle = '#7a7682'; x.fillRect(2, 10, 10, 1);
    x.fillStyle = '#3a2618';
    if (on) { for (let i = 0; i < 8; i++) x.fillRect(7 + (i >> 1), 10 - i, 2, 1); x.fillStyle = '#d84a3a'; x.fillRect(10, 1, 3, 3); }
    else { for (let i = 0; i < 8; i++) x.fillRect(5 - (i >> 1), 10 - i, 2, 1); x.fillStyle = '#4a8ad8'; x.fillRect(1, 1, 3, 3); }
  });

  Props.plate = (down, kind) => cache(`plate_${down ? 1 : 0}_${kind || 'n'}`, 16, 16, (x) => {
    const glow = kind === 'rune';
    x.fillStyle = '#2a2430'; x.fillRect(1, 2, 14, 13);
    x.fillStyle = down ? '#5a5662' : '#8a8692'; x.fillRect(2, down ? 4 : 2, 12, down ? 10 : 11);
    x.fillStyle = down ? '#4a4652' : '#a8a4b0'; x.fillRect(2, down ? 4 : 2, 12, 1);
    if (!down) { x.fillStyle = '#4a4652'; x.fillRect(2, 12, 12, 1); }
    x.fillStyle = glow ? (down ? '#9ae0ff' : '#4a7ab8') : (down ? '#e8c060' : '#6a6672');
    x.fillRect(6, down ? 7 : 5, 4, 4);
    x.fillRect(4, down ? 8 : 6, 8, 2);
  });

  Props.crystalSwitch = (on, gold) => cache(`cswitch_${on ? 1 : 0}_${gold ? 1 : 0}`, 14, 24, (x) => {
    x.fillStyle = '#2a2430'; x.fillRect(1, 18, 12, 6);
    x.fillStyle = '#6a6672'; x.fillRect(2, 18, 10, 4);
    const c = gold ? (on ? ['#c8962a', '#ffe680', '#ffffff'] : ['#6a5a2a', '#9a8a4a', '#c8b87a']) : on ? ['#3aa8c8', '#8ae8ff', '#ffffff'] : ['#3a3a6a', '#5a5a9a', '#8a8ac8'];
    for (let j = 0; j < 16; j++) {
      const w = j < 4 ? j + 1 : j > 12 ? 16 - j : 4;
      x.fillStyle = c[0]; x.fillRect(7 - w, 2 + j, w * 2, 1);
      x.fillStyle = c[1]; x.fillRect(7 - w, 2 + j, w, 1);
    }
    x.fillStyle = c[2]; x.fillRect(5, 6, 1, 5);
  });

  Props.gate = (open, orient) => cache(`gate_${open ? 1 : 0}_${orient}`, 16, 28, (x) => {
    // portão de ferro (horizontal: bloqueia passagem vertical)
    x.fillStyle = '#4a4652'; x.fillRect(0, 4, 2, 24); x.fillRect(14, 4, 2, 24);
    x.fillStyle = '#6a6672'; x.fillRect(0, 4, 1, 24); x.fillRect(14, 4, 1, 24);
    if (open) { x.fillStyle = '#2a2830'; x.fillRect(2, 4, 12, 3); for (let i = 0; i < 4; i++) x.fillRect(3 + i * 3, 7, 1, 2); return; }
    x.fillStyle = '#2a2830'; x.fillRect(2, 6, 12, 2); x.fillRect(2, 18, 12, 2);
    for (let i = 0; i < 4; i++) {
      x.fillStyle = '#3a3642'; x.fillRect(3 + i * 3, 4, 2, 24);
      x.fillStyle = '#7a7682'; x.fillRect(3 + i * 3, 4, 1, 24);
      x.fillStyle = '#9a96a2'; x.fillRect(3 + i * 3, 3, 2, 2);
    }
  });

  Props.crackedRock = () => cache('cracked', 20, 20, (x) => {
    P.ellipse(x, 10, 12, 9, 7, '#3a3632'); P.ellipse(x, 10, 11, 8, 7, '#7a746c'); P.ellipse(x, 8, 8, 5, 4, '#9a948a');
    x.fillStyle = '#2a2622';
    const cr = [[10, 5], [10, 6], [11, 7], [11, 8], [10, 9], [9, 10], [9, 11], [10, 12], [11, 13], [7, 9], [6, 10], [12, 10], [13, 11], [14, 11]];
    for (const [a, b] of cr) x.fillRect(a, b, 1, 1);
    x.fillStyle = '#b8b2a6'; x.fillRect(6, 5, 2, 1);
  });

  Props.barricade = () => cache('barricade', 18, 20, (x) => {
    x.fillStyle = '#2a1a0e';
    x.fillRect(1, 2, 3, 18); x.fillRect(14, 2, 3, 18);
    x.fillStyle = '#7a4e2a'; x.fillRect(2, 2, 1, 18); x.fillRect(15, 2, 1, 18);
    for (const [y, tilt] of [[5, 1], [10, -1], [15, 1]]) {
      for (let i = 0; i < 18; i++) {
        const yy = y + Math.round(((i - 9) / 9) * tilt);
        x.fillStyle = '#3a2416'; x.fillRect(i, yy, 1, 4);
        x.fillStyle = '#9a6a3a'; x.fillRect(i, yy, 1, 3);
        x.fillStyle = '#b8864e'; x.fillRect(i, yy, 1, 1);
      }
    }
    x.fillStyle = '#c8c0b0'; x.fillRect(3, 6, 1, 1); x.fillRect(14, 11, 1, 1); x.fillRect(3, 16, 1, 1);
  });

  Props.brazier = () => cache('brazier', 14, 18, (x) => {
    x.fillStyle = '#2a2430'; x.fillRect(5, 8, 4, 10); x.fillRect(2, 15, 10, 3);
    x.fillStyle = '#5a5662'; x.fillRect(6, 8, 2, 8);
    x.fillStyle = '#2a2430'; x.fillRect(0, 4, 14, 5);
    x.fillStyle = '#6a6672'; x.fillRect(1, 5, 12, 3);
    x.fillStyle = '#8a8692'; x.fillRect(1, 5, 12, 1);
    x.fillStyle = '#1a1418'; x.fillRect(2, 4, 10, 1);
  });

  Props.floatStone = () => cache('fstone', 16, 16, (x) => {
    P.ellipse(x, 8, 8, 7, 7, '#2a2a3e'); P.ellipse(x, 8, 7, 6, 6, '#5a5a7a'); P.ellipse(x, 7, 6, 4, 3, '#7a7a9a');
    x.fillStyle = '#8ae0ff'; x.fillRect(6, 6, 4, 1); x.fillRect(7, 5, 2, 3); x.fillRect(5, 9, 6, 1);
  });

  Props.socket = (on) => cache(`socket_${on ? 1 : 0}`, 20, 14, (x) => {
    P.ellipse(x, 10, 7, 9, 6, '#2a2430'); P.ellipse(x, 10, 7, 8, 5, on ? '#4a7ab8' : '#4a4652');
    P.ellipse(x, 10, 7, 6, 3, '#2a2430');
    x.fillStyle = on ? '#9ae0ff' : '#6a6672';
    x.fillRect(2, 7, 2, 1); x.fillRect(16, 7, 2, 1); x.fillRect(9, 1, 2, 1); x.fillRect(9, 12, 2, 1);
  });

  Props.altar = (on) => cache(`altar_${on ? 1 : 0}`, 34, 40, (x) => {
    // base em degraus
    x.fillStyle = '#2a2430'; x.fillRect(0, 30, 34, 10);
    x.fillStyle = '#6a6470'; x.fillRect(1, 30, 32, 8);
    x.fillStyle = '#8a8492'; x.fillRect(1, 30, 32, 2);
    x.fillStyle = '#2a2430'; x.fillRect(4, 22, 26, 9);
    x.fillStyle = '#7a7480'; x.fillRect(5, 22, 24, 8);
    x.fillStyle = '#9a94a0'; x.fillRect(5, 22, 24, 2);
    // pedestal
    x.fillStyle = '#2a2430'; x.fillRect(11, 8, 12, 15);
    x.fillStyle = '#7a7480'; x.fillRect(12, 8, 10, 14);
    x.fillStyle = '#9a94a0'; x.fillRect(12, 8, 3, 14);
    x.fillStyle = '#2a2430'; x.fillRect(9, 6, 16, 3);
    x.fillStyle = '#a8a2ae'; x.fillRect(10, 6, 14, 1);
    // runas
    x.fillStyle = on ? '#9ae0ff' : '#4a4a6a';
    x.fillRect(16, 11, 2, 7); x.fillRect(14, 13, 6, 1); x.fillRect(15, 16, 4, 1);
    x.fillRect(7, 26, 3, 1); x.fillRect(24, 26, 3, 1); x.fillRect(4, 34, 4, 1); x.fillRect(26, 34, 4, 1); x.fillRect(15, 34, 4, 1);
    // cristal
    x.fillStyle = '#1e1a2a'; x.fillRect(14, 0, 6, 6);
    x.fillStyle = on ? '#8ae8ff' : '#5a5a8a'; x.fillRect(15, 0, 4, 5);
    x.fillStyle = on ? '#ffffff' : '#8a8ac8'; x.fillRect(15, 0, 2, 2);
  });

  Props.waystone = (on) => cache(`waystone_${on ? 1 : 0}`, 16, 30, (x) => {
    x.fillStyle = '#2a2430'; x.fillRect(3, 4, 10, 26); x.fillRect(5, 2, 6, 2); x.fillRect(1, 26, 14, 4);
    x.fillStyle = '#7a7690'; x.fillRect(4, 4, 8, 23); x.fillRect(6, 3, 4, 1);
    x.fillStyle = '#9a96b0'; x.fillRect(4, 4, 2, 22);
    x.fillStyle = '#5a5670'; x.fillRect(2, 27, 12, 2);
    x.fillStyle = on ? '#8ae8ff' : '#4a4a6a';
    x.fillRect(7, 8, 2, 2); x.fillRect(6, 11, 4, 1); x.fillRect(7, 13, 2, 5); x.fillRect(6, 19, 4, 1);
    if (on) { x.fillStyle = '#ffffff'; x.fillRect(7, 8, 1, 1); }
  });

  Props.well = () => cache('well', 30, 32, (x) => {
    x.fillStyle = '#3a2618'; x.fillRect(3, 0, 3, 18); x.fillRect(24, 0, 3, 18);
    x.fillStyle = '#6a4424'; x.fillRect(0, 0, 30, 4); x.fillStyle = '#8a5a32'; x.fillRect(0, 0, 30, 2);
    x.fillStyle = '#c8b07a'; x.fillRect(14, 4, 1, 8); x.fillStyle = '#5a3a22'; x.fillRect(12, 11, 5, 4);
    P.ellipse(x, 15, 22, 14, 6, '#4a4650'); P.ellipse(x, 15, 21, 13, 5, '#8a8692'); P.ellipse(x, 15, 20, 10, 3, '#1a2a3a');
    x.fillStyle = '#6a6672'; x.fillRect(1, 22, 28, 8); x.fillStyle = '#8a8692';
    for (let i = 0; i < 5; i++) x.fillRect(2 + i * 6, 23 + (i % 2) * 3, 4, 2);
    x.fillStyle = '#4a4650'; x.fillRect(1, 29, 28, 2);
  });

  Props.barrel = () => cache('barrel', 14, 16, (x) => {
    x.fillStyle = '#2a1a0e'; x.fillRect(1, 1, 12, 15);
    x.fillStyle = '#8a5a2e'; x.fillRect(2, 2, 10, 13);
    x.fillStyle = '#a87a42'; x.fillRect(3, 2, 3, 13);
    x.fillStyle = '#4a4652'; x.fillRect(1, 4, 12, 1); x.fillRect(1, 11, 12, 1);
    x.fillStyle = '#5a3a1e'; x.fillRect(2, 1, 10, 2);
  });

  Props.lamp = () => cache('lamp', 10, 32, (x) => {
    x.fillStyle = '#2a2430'; x.fillRect(4, 8, 2, 24); x.fillRect(2, 29, 6, 3);
    x.fillStyle = '#2a2430'; x.fillRect(1, 1, 8, 8);
    x.fillStyle = '#ffd88a'; x.fillRect(2, 3, 6, 5);
    x.fillStyle = '#fff2c8'; x.fillRect(3, 4, 2, 2);
    x.fillStyle = '#4a4652'; x.fillRect(0, 0, 10, 2);
  });

  Props.dummy = () => cache('dummy', 16, 24, (x) => {
    x.fillStyle = '#3a2618'; x.fillRect(7, 8, 2, 16); x.fillRect(1, 10, 14, 2);
    x.fillStyle = '#c8a86a'; P.ellipse(x, 8, 14, 5, 5, '#a8884a'); P.ellipse(x, 8, 13, 4, 4, '#c8a86a');
    P.circle(x, 8, 5, 4, '#a8884a'); P.circle(x, 8, 4, 3, '#d8b87a');
    x.fillStyle = '#7a3a2a'; x.fillRect(6, 13, 4, 1); x.fillRect(7, 12, 2, 3);
    x.fillStyle = '#3a2618'; x.fillRect(6, 4, 1, 1); x.fillRect(9, 4, 1, 1);
  });

  Props.statue = () => cache('statue', 22, 40, (x) => {
    x.fillStyle = '#4a4650'; x.fillRect(1, 30, 20, 10);
    x.fillStyle = '#8a8692'; x.fillRect(2, 30, 18, 8);
    x.fillStyle = '#a8a4b0'; x.fillRect(2, 30, 18, 2);
    // figura de mago antigo
    x.fillStyle = '#6a6672'; x.fillRect(6, 10, 10, 20); x.fillRect(7, 3, 8, 8);
    x.fillStyle = '#9a96a2'; x.fillRect(7, 10, 4, 20); x.fillRect(8, 3, 3, 7);
    x.fillStyle = '#6a6672'; x.fillRect(4, 26, 14, 4);
    x.fillStyle = '#5a5662'; x.fillRect(16, 2, 2, 26);
    x.fillStyle = '#9ae0ff'; x.fillRect(15, 0, 4, 3);
    x.fillStyle = '#5a7a44'; x.fillRect(2, 36, 5, 2); x.fillRect(15, 34, 4, 3);
  });

  Props.banner = (color) => cache(`banner_${color}`, 12, 26, (x) => {
    x.fillStyle = '#3a2618'; x.fillRect(5, 0, 2, 26);
    x.fillStyle = '#5a3a22'; x.fillRect(0, 2, 12, 2);
    x.fillStyle = color; x.fillRect(1, 4, 10, 14);
    x.fillStyle = U.shade(color, -0.3); x.fillRect(1, 17, 3, 3); x.fillRect(8, 17, 3, 3); x.fillRect(4, 18, 4, 1);
    x.fillStyle = '#f2d98c'; x.fillRect(5, 7, 2, 6); x.fillRect(3, 9, 6, 2);
  });

  Props.tent = () => cache('tent', 34, 28, (x) => {
    for (let j = 0; j < 24; j++) {
      const w = Math.round(2 + j * 0.65);
      x.fillStyle = '#8a6a4a'; x.fillRect(17 - w, 3 + j, w * 2, 1);
      x.fillStyle = '#a8865e'; x.fillRect(17 - w, 3 + j, w, 1);
    }
    x.fillStyle = '#2a1a10'; for (let j = 10; j < 24; j++) { const w = Math.round((j - 10) * 0.3); x.fillRect(17 - w, 3 + j, w * 2 + 1, 1); }
    x.fillStyle = '#5a3a22'; x.fillRect(16, 0, 2, 4);
  });

  Props.cartWheel = () => cache('cart', 32, 22, (x) => {
    x.fillStyle = '#3a2618'; x.fillRect(0, 4, 32, 10);
    x.fillStyle = '#8a5a2e'; x.fillRect(1, 5, 30, 8);
    x.fillStyle = '#a87a42'; x.fillRect(1, 5, 30, 2);
    for (const cx of [7, 25]) { P.circle(x, cx, 16, 5, '#2a1a0e'); P.circle(x, cx, 16, 3, '#6a4424'); x.fillStyle = '#2a1a0e'; x.fillRect(cx, 16, 1, 1); }
    x.fillStyle = '#c84a3a'; x.fillRect(4, 1, 6, 4); x.fillStyle = '#4a8a3a'; x.fillRect(12, 0, 6, 5); x.fillStyle = '#e8c060'; x.fillRect(20, 2, 6, 3);
  });

  Props.stairs = (w) => cache('stairs_' + w, w * 16, 32, (x) => {
    for (let i = 0; i < 6; i++) {
      const c = ['#5a5460', '#4a4450', '#3a3440', '#2a2430', '#1c1822', '#100c14'][i];
      x.fillStyle = c; x.fillRect(0, i * 5 + 2, w * 16, 5);
      x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(0, i * 5 + 2, w * 16, 1);
    }
    x.fillStyle = '#2a2430'; x.fillRect(0, 0, 3, 32); x.fillRect(w * 16 - 3, 0, 3, 32);
    x.fillStyle = '#7a7480'; x.fillRect(0, 0, 2, 32); x.fillRect(w * 16 - 2, 0, 2, 32);
  });

  Props.campfire = () => cache('campfire', 18, 12, (x) => {
    x.fillStyle = '#4a4650'; for (const [a, b] of [[1, 7], [4, 9], [9, 10], [14, 9], [16, 6], [3, 5], [13, 4]]) x.fillRect(a, b, 3, 2);
    x.fillStyle = '#5a3a22'; x.fillRect(4, 6, 10, 2); x.fillRect(6, 4, 2, 5); x.fillRect(10, 4, 2, 5);
  });

  G.Props = Props;
})();
