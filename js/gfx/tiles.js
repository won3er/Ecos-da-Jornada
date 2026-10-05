// Tiles: registro de tipos (colisão) + texturas procedurais com variação por tema.
(function () {
  const U = G.U, P = G.Pixel;
  const TS = 16;

  // Definição dos caracteres dos mapas
  const DEF = {
    '.': { g: 'grass' }, ',': { g: 'grass', deco: 'flowers' }, ';': { g: 'grass', deco: 'tall' },
    'M': { g: 'grass', deco: 'mushroom' }, ':': { g: 'dirt' }, 'p': { g: 'cobble' }, '_': { g: 'stone' },
    'f': { g: 'cave' }, 'm': { g: 'magic' }, 'w': { g: 'wood' }, 'R': { g: 'stone', deco: 'rubble' },
    'u': { g: 'cave', deco: 'shroomglow' }, 'e': { g: 'magic', deco: 'petals' },
    '#': { wall: 'brick', solid: 1, tall: 1 }, 'c': { wall: 'cave', solid: 1, tall: 1 },
    'X': { wall: 'cliff', solid: 1, tall: 1 }, 'h': { wall: 'hedge', solid: 1, tall: 1 },
    'v': { void: 1, solid: 1, tall: 1 },
    'W': { water: 1, solid: 1 }, 'C': { chasm: 1, solid: 1 },
    'T': { g: 'grass', solid: 1, tall: 1, prop: 'tree' }, 'P': { g: 'grass', solid: 1, tall: 1, prop: 'pine' },
    'r': { g: 'grass', solid: 1, prop: 'rock' }, 'F': { g: 'grass', solid: 1, fence: 1 },
    'k': { g: 'stone', solid: 1, tall: 1, prop: 'pillar' }, 'x': { g: 'magic', solid: 1, tall: 1, prop: 'crystal' },
    'Y': { g: 'cave', solid: 1, prop: 'stalagmite' }, 'g': { g: 'grass', solid: 1, prop: 'grave' },
    'B': { g: 'bridge', bridge: 1 }, 'D': { g: 'dirt', solid: 1, prop: 'stump' },
    // --- Capítulos II e III ---
    's': { g: 'snow' },                                   // neve (em qualquer tema)
    'i': { g: 'ice', slip: 1 },                           // gelo escorregadio
    'I': { wall: 'ice', solid: 1, tall: 1, melt: 1 },     // parede de gelo (Chama Estelar derrete)
    'b': { g: 'stone', solid: 1, low: 1 },                // muro baixo (dá para arremessar por cima)
    'q': { g: 'carpet' },                                 // tapete (fortaleza)
    'z': { g: 'star' },                                   // piso estelar (torre)
    'Z': { chasm: 1, solid: 1, starvoid: 1 },             // vazio estelar (abismo da torre)
    'j': { g: 'planks' },                                 // tábuas da mina
  };
  const FLOOR_CHARS = '.,;M:p_fmwRuesiqzj';

  const THEMES = {
    village: { grass: ['#5c8d3e', '#4c7a34', '#6fa04a', '#88b85c'], dirt: ['#9a7650', '#80603f', '#b08a60'] },
    forest: { grass: ['#3f7038', '#335c2f', '#4f8445', '#69a05a'], dirt: ['#7a5e40', '#634b33', '#94744f'] },
    ruins: { grass: ['#4e7a44', '#3f6638', '#5e8c50', '#7aa266'], dirt: ['#7e6a52', '#655440', '#958066'] },
    cave: { grass: ['#3a5a40', '#2c4832', '#4a6e4e', '#5e8a62'], dirt: ['#5e4e40', '#4a3e34', '#706050'] },
    sanctum: { grass: ['#3a6466', '#2e5254', '#4a7a7a', '#68a0a0'], dirt: ['#6a6a80', '#555468', '#80809a'] },
    memory: { grass: ['#6a9a48', '#5a8a3e', '#7cae56', '#98c46a'], dirt: ['#a8845c', '#8e6c48', '#bc9a6c'] },
    night: { grass: ['#2e4a3e', '#243c32', '#3a5a4a', '#4e7060'], dirt: ['#4e4458', '#3e3646', '#605670'] },
    snow: { grass: ['#dfe7f1', '#c7d3e3', '#eef3f9', '#ffffff'], dirt: ['#a59fae', '#8b8596', '#bdb7c4'] },
    mine: { grass: ['#3a4a52', '#2e3c44', '#4a5c64', '#5e747c'], dirt: ['#5a4c40', '#463a30', '#6c5c4c'] },
    fortress: { grass: ['#5a6a68', '#4a5856', '#6a7c78', '#8a9c96'], dirt: ['#6e6878', '#5a5464', '#827c8c'] },
    tower: { grass: ['#2c2a52', '#242246', '#383666', '#4c4a80'], dirt: ['#4a4470', '#3a3660', '#5c5684'] },
    dusk: { grass: ['#6a8a42', '#5a7838', '#7c9c4c', '#a4b85c'], dirt: ['#a07a50', '#866440', '#b8905e'] },
  };

  const T = { DEF, TS, FLOOR_CHARS, cache: {} };
  T.def = (ch) => DEF[ch] || DEF['.'];
  T.isFloorChar = (ch) => FLOOR_CHARS.includes(ch);

  function tex(key, fn) {
    if (!T.cache[key]) T.cache[key] = P.make(TS, TS, fn);
    return T.cache[key];
  }

  // ------------------------------------------------------------ chãos
  function grassTex(theme, v) {
    const pal = THEMES[theme].grass;
    return tex(`grass_${theme}_${v}`, (x) => {
      const r = U.rng(1000 + v * 77);
      x.fillStyle = pal[0]; x.fillRect(0, 0, TS, TS);
      for (let i = 0; i < 26; i++) { x.fillStyle = r() < 0.5 ? pal[1] : pal[2]; x.fillRect((r() * TS) | 0, (r() * TS) | 0, 1, 1); }
      for (let i = 0; i < 3 + v; i++) {
        const bx = (r() * 14) | 0, by = (r() * 13 + 2) | 0;
        x.fillStyle = pal[2]; x.fillRect(bx, by, 1, 2); x.fillRect(bx + 1, by - 1, 1, 2);
        x.fillStyle = pal[3]; x.fillRect(bx + 1, by - 1, 1, 1);
      }
    });
  }
  function dirtTex(theme, v) {
    const pal = THEMES[theme].dirt;
    return tex(`dirt_${theme}_${v}`, (x) => {
      const r = U.rng(2000 + v * 31);
      x.fillStyle = pal[0]; x.fillRect(0, 0, TS, TS);
      for (let i = 0; i < 30; i++) { x.fillStyle = r() < 0.6 ? pal[1] : pal[2]; x.fillRect((r() * TS) | 0, (r() * TS) | 0, 1, 1); }
      for (let i = 0; i < 2; i++) {
        const px = (r() * 13) | 0, py = (r() * 13) | 0;
        x.fillStyle = pal[2]; x.fillRect(px, py, 2, 1); x.fillStyle = pal[1]; x.fillRect(px, py + 1, 2, 1);
      }
    });
  }
  function cobbleTex(v) {
    return tex(`cobble_${v}`, (x) => {
      const r = U.rng(3000 + v * 13);
      x.fillStyle = '#5e5a62'; x.fillRect(0, 0, TS, TS);
      const stones = [[0, 0, 7, 5], [8, 0, 8, 6], [0, 6, 5, 5], [6, 7, 6, 4], [13, 7, 3, 5], [0, 12, 8, 4], [9, 12, 7, 4]];
      for (const [sx, sy, w, h] of stones) {
        const base = U.pick(['#9a959c', '#8c8892', '#a8a2a6', '#9298a0']);
        x.fillStyle = base; x.fillRect(sx + 1, sy + 1, w - 1, h - 1);
        x.fillStyle = U.shade(base, 0.2); x.fillRect(sx + 1, sy + 1, w - 2, 1);
        x.fillStyle = U.shade(base, -0.2); x.fillRect(sx + 1, sy + h - 1, w - 1, 1);
        if (r() < 0.3) { x.fillStyle = '#6e8a52'; x.fillRect(sx + (r() * w) | 0, sy, 1, 1); }
      }
    });
  }
  function stoneTex(theme, v) {
    return tex(`stone_${theme}_${v}`, (x) => {
      const r = U.rng(4000 + v * 17);
      const base = theme === 'sanctum' ? '#6c6e86' : theme === 'cave' || theme === 'mine' ? '#5a5258' : theme === 'fortress' || theme === 'snow' ? '#4e5868' : theme === 'tower' ? '#3c3a62' : '#7a7670';
      x.fillStyle = base; x.fillRect(0, 0, TS, TS);
      if (theme === 'fortress' || theme === 'snow' || theme === 'tower') {
        // lajes grandes e lisas (bem diferentes das paredes de tijolo)
        const slab = U.shade(base, (v % 2 ? -0.04 : 0.05));
        x.fillStyle = slab; x.fillRect(1, 1, TS - 2, TS - 2);
        x.fillStyle = U.shade(slab, 0.16); x.fillRect(1, 1, TS - 2, 1); x.fillRect(1, 1, 1, TS - 2);
        x.fillStyle = U.shade(slab, -0.18); x.fillRect(1, TS - 2, TS - 2, 1); x.fillRect(TS - 2, 1, 1, TS - 2);
        x.fillStyle = U.shade(base, -0.38); x.fillRect(0, TS - 1, TS, 1); x.fillRect(TS - 1, 0, 1, TS);
        for (let i = 0; i < 8; i++) { x.fillStyle = r() < 0.5 ? U.shade(slab, -0.07) : U.shade(slab, 0.06); x.fillRect(2 + ((r() * 12) | 0), 2 + ((r() * 12) | 0), 1, 1); }
        if (theme === 'tower') {
          if (v === 0) { x.fillStyle = '#6a68b0'; x.fillRect(7, 7, 2, 2); x.fillStyle = '#9ae0ff'; x.fillRect(7, 7, 1, 1); }
        } else if (v === 1 || v === 3) {
          x.fillStyle = 'rgba(220,240,255,0.35)'; x.fillRect(2 + ((r() * 8) | 0), 2 + ((r() * 8) | 0), 3, 1); x.fillRect(3 + ((r() * 8) | 0), 4 + ((r() * 8) | 0), 2, 1);
        }
        if (v === 2) { x.fillStyle = U.shade(slab, -0.3); x.fillRect(9, 3, 1, 1); x.fillRect(10, 4, 1, 2); x.fillRect(11, 6, 1, 2); x.fillRect(12, 8, 1, 1); }
        return;
      }
      x.fillStyle = U.shade(base, -0.25);
      x.fillRect(0, 7, TS, 1); x.fillRect(7, 0, 1, 7); x.fillRect(11, 8, 1, 8); x.fillRect(3, 8, 1, 8);
      x.fillStyle = U.shade(base, 0.12);
      x.fillRect(0, 0, 7, 1); x.fillRect(8, 0, 8, 1); x.fillRect(0, 8, 3, 1); x.fillRect(4, 8, 7, 1); x.fillRect(12, 8, 4, 1);
      for (let i = 0; i < 14; i++) { x.fillStyle = r() < 0.5 ? U.shade(base, -0.1) : U.shade(base, 0.08); x.fillRect((r() * TS) | 0, (r() * TS) | 0, 1, 1); }
      if (v === 2) { x.fillStyle = U.shade(base, -0.35); x.fillRect(9, 2, 1, 1); x.fillRect(10, 3, 1, 2); x.fillRect(11, 5, 1, 1); }
      if (v === 3 && theme !== 'cave') { x.fillStyle = '#5a7a44'; for (let i = 0; i < 5; i++) x.fillRect((r() * 6 + 1) | 0, (r() * 4 + 10) | 0, 1, 1); }
    });
  }
  function caveTex(v) {
    return tex(`cave_${v}`, (x) => {
      const r = U.rng(5000 + v * 19);
      x.fillStyle = '#3e3438'; x.fillRect(0, 0, TS, TS);
      for (let i = 0; i < 40; i++) { x.fillStyle = U.pick(['#352c30', '#483c40', '#2e2629', '#504448']); x.fillRect((r() * TS) | 0, (r() * TS) | 0, (r() * 2 + 1) | 0, 1); }
    });
  }
  function magicTex(v) {
    return tex(`magic_${v}`, (x) => {
      const r = U.rng(6000 + v * 23);
      x.fillStyle = '#2c2a4a'; x.fillRect(0, 0, TS, TS);
      for (let i = 0; i < 22; i++) { x.fillStyle = U.pick(['#28263f', '#323055', '#36345c']); x.fillRect((r() * TS) | 0, (r() * TS) | 0, 1, 1); }
      // juntas de laje
      x.fillStyle = '#24223a'; x.fillRect(0, 15, TS, 1); x.fillRect(15, 0, 1, TS);
      x.fillStyle = '#3a3862'; x.fillRect(0, 0, TS, 1); x.fillRect(0, 0, 1, TS);
      if (v === 0) {
        // veio de cristal discreto
        let px = 3 + ((r() * 10) | 0), py = 3 + ((r() * 6) | 0);
        for (let i = 0; i < 6; i++) { x.fillStyle = '#4a5a96'; x.fillRect(px, py, 1, 1); px += U.pick([1, 1, 0]); py += U.pick([1, 0]); }
        x.fillStyle = '#9ae0ff'; x.fillRect(px, py, 1, 1);
      }
    });
  }
  function woodTex(v) {
    return tex(`wood_${v}`, (x) => {
      x.fillStyle = '#8a5e3a'; x.fillRect(0, 0, TS, TS);
      for (let j = 0; j < 4; j++) {
        x.fillStyle = '#5e3e24'; x.fillRect(0, j * 4 + 3, TS, 1);
        x.fillStyle = '#a07048'; x.fillRect(0, j * 4, TS, 1);
        x.fillStyle = '#6e4a2c'; x.fillRect(((j * 7 + v * 5) % 14), j * 4 + 1, 3, 1);
        x.fillStyle = '#4a3020'; x.fillRect((j * 5 + v * 3) % 16, j * 4 + 2, 1, 1);
      }
    });
  }
  function snowTex(v) {
    return tex(`snow_${v}`, (x) => {
      const r = U.rng(8100 + v * 41);
      x.fillStyle = '#e2e9f3'; x.fillRect(0, 0, TS, TS);
      for (let i = 0; i < 22; i++) { x.fillStyle = r() < 0.5 ? '#cdd8e8' : '#f4f8fc'; x.fillRect((r() * TS) | 0, (r() * TS) | 0, (r() * 2 + 1) | 0, 1); }
      for (let i = 0; i < 2 + v; i++) { const sx = (r() * 13) | 0, sy = (r() * 13) | 0; x.fillStyle = '#b8c6da'; x.fillRect(sx, sy + 1, 3, 1); x.fillStyle = '#ffffff'; x.fillRect(sx, sy, 3, 1); }
    });
  }
  function iceTex(v) {
    return tex(`ice_${v}`, (x) => {
      const r = U.rng(8200 + v * 29);
      x.fillStyle = '#9fd0ec'; x.fillRect(0, 0, TS, TS);
      for (let i = 0; i < 10; i++) { x.fillStyle = r() < 0.5 ? '#8ac0e0' : '#b8e2f6'; x.fillRect((r() * TS) | 0, (r() * TS) | 0, (r() * 4 + 2) | 0, 1); }
      // rachaduras e reflexo
      let px = (r() * 12) | 0, py = (r() * 6) | 0;
      for (let i = 0; i < 7; i++) { x.fillStyle = '#6aa0c8'; x.fillRect(px, py, 1, 1); px += U.pick([1, 1, 0, -1]); py += 1; }
      x.fillStyle = '#e8f8ff'; x.fillRect(2 + v, 3, 4, 1); x.fillRect(3 + v, 4, 2, 1);
      x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(0, 0, TS, 1);
    });
  }
  function starTex(v) {
    return tex(`star_${v}`, (x) => {
      const r = U.rng(8300 + v * 53);
      x.fillStyle = '#28264a'; x.fillRect(0, 0, TS, TS);
      x.fillStyle = '#1e1c3c'; x.fillRect(0, 15, TS, 1); x.fillRect(15, 0, 1, TS);
      x.fillStyle = '#3a3870'; x.fillRect(0, 0, TS, 1); x.fillRect(0, 0, 1, TS);
      for (let i = 0; i < 6; i++) { x.fillStyle = U.pick(['#34326a', '#2e2c5e', '#403e7a']); x.fillRect((r() * TS) | 0, (r() * TS) | 0, 1, 1); }
      if (v === 1 || v === 3) { // pequena constelação gravada
        const pts = [[3, 4], [7, 6], [11, 4], [9, 10]];
        x.fillStyle = '#4e4a8e'; for (let i = 0; i < pts.length - 1; i++) { const [a, b] = pts[i], [c, d] = pts[i + 1]; for (let k = 0; k <= 4; k++) x.fillRect(Math.round(a + (c - a) * k / 4), Math.round(b + (d - b) * k / 4), 1, 1); }
        x.fillStyle = '#b8b0ff'; for (const [a, b] of pts) x.fillRect(a, b, 1, 1);
      }
    });
  }
  function carpetTex(v) {
    return tex(`carpet_${v}`, (x) => {
      x.fillStyle = '#7a2a34'; x.fillRect(0, 0, TS, TS);
      x.fillStyle = '#8e3440'; for (let j = 1; j < TS; j += 3) x.fillRect(0, j, TS, 1);
      x.fillStyle = '#c8a050'; x.fillRect(0, 1, TS, 1); x.fillRect(0, 14, TS, 1);
      if (v % 2) { x.fillStyle = '#d8b060'; x.fillRect(7, 6, 2, 4); x.fillRect(6, 7, 4, 2); }
    });
  }
  function planksTex(v) {
    return tex(`planks_${v}`, (x) => {
      x.fillStyle = '#5e4630'; x.fillRect(0, 0, TS, TS);
      for (let i = 0; i < 2; i++) {
        x.fillStyle = '#6e5238'; x.fillRect(0, i * 8 + 1, TS, 6);
        x.fillStyle = '#7e6044'; x.fillRect(0, i * 8 + 1, TS, 1);
        x.fillStyle = '#3e2c1e'; x.fillRect(0, i * 8 + 7, TS, 1);
        x.fillStyle = '#2e2018'; x.fillRect(((i * 7 + v * 5) % 12) + 2, i * 8 + 3, 1, 1);
      }
    });
  }
  function waterTex(frame, theme) {
    return tex(`water_${theme}_${frame}`, (x) => {
      const dark = theme === 'cave' || theme === 'mine' ? '#1c2c44' : theme === 'sanctum' ? '#24406a' : theme === 'snow' ? '#2a4a6e' : theme === 'tower' ? '#1e2a5a' : '#2a5a8a';
      const mid = U.shade(dark, 0.15), light = U.shade(dark, 0.45);
      x.fillStyle = dark; x.fillRect(0, 0, TS, TS);
      const r = U.rng(77);
      for (let i = 0; i < 6; i++) {
        const wx = (r() * TS + frame * 2) % TS | 0, wy = (r() * TS) | 0;
        x.fillStyle = mid; x.fillRect(wx, wy, 4, 1);
        x.fillStyle = light; x.fillRect((wx + 1) % TS, wy, 2, 1);
      }
      for (let i = 0; i < 8; i++) { x.fillStyle = mid; x.fillRect((r() * TS) | 0, (r() * TS) | 0, 1, 1); }
    });
  }
  function bridgeTex() {
    return tex('bridge', (x) => {
      x.fillStyle = '#2a5a8a'; x.fillRect(0, 0, TS, TS);
      for (let i = 0; i < 4; i++) {
        x.fillStyle = '#8a5e3a'; x.fillRect(1 + i * 4, 0, 3, TS);
        x.fillStyle = '#a87a4e'; x.fillRect(1 + i * 4, 0, 1, TS);
        x.fillStyle = '#5e3e24'; x.fillRect(3 + i * 4, 0, 1, TS);
      }
      x.fillStyle = '#4a3020'; x.fillRect(0, 3, TS, 1); x.fillRect(0, 12, TS, 1);
    });
  }

  // ------------------------------------------------------------ paredes
  function wallTex(kind, face, theme, v) {
    return tex(`wall_${kind}_${face ? 'f' : 't'}_${theme}_${v}`, (x) => {
      const r = U.rng(7000 + v * 11 + (face ? 500 : 0));
      if (kind === 'ice') {
        if (face) {
          x.fillStyle = '#6aa8d0'; x.fillRect(0, 0, TS, TS);
          for (let i = 0; i < 5; i++) { const sx = (r() * 14) | 0; x.fillStyle = U.pick(['#8ac4e4', '#5a98c4', '#a8dcf4']); x.fillRect(sx, (r() * 4) | 0, 2, (r() * 9 + 4) | 0); }
          x.fillStyle = '#d8f4ff'; x.fillRect(2, 2, 1, 8); x.fillRect(3, 2, 1, 3);
          x.fillStyle = '#e8faff'; x.fillRect(0, 0, TS, 1);
          x.fillStyle = 'rgba(20,40,80,0.3)'; x.fillRect(0, 12, TS, 4);
        } else {
          x.fillStyle = '#b8e0f4'; x.fillRect(0, 0, TS, TS);
          for (let i = 0; i < 14; i++) { x.fillStyle = U.pick(['#a0d0ec', '#d0eefc', '#ffffff']); x.fillRect((r() * TS) | 0, (r() * TS) | 0, 2, 1); }
          x.fillStyle = '#8ac0e0'; x.fillRect(0, 15, TS, 1);
        }
        return;
      }
      if (kind === 'brick') {
        const base = theme === 'sanctum' ? '#5a5a7a' : theme === 'snow' || theme === 'fortress' ? '#6a7282' : theme === 'tower' ? '#46447a' : theme === 'mine' ? '#5a5048' : '#6e6862';
        if (face) {
          x.fillStyle = U.shade(base, -0.15); x.fillRect(0, 0, TS, TS);
          for (let row = 0; row < 4; row++) {
            const off = row % 2 ? 4 : 0;
            for (let b = -1; b < 3; b++) {
              const bx = b * 8 + off, by = row * 4;
              const c = U.shade(base, U.rand(-0.12, 0.05) - row * 0.04);
              x.fillStyle = c; x.fillRect(bx + 1, by + 1, 7, 3);
              x.fillStyle = U.shade(c, 0.15); x.fillRect(bx + 1, by + 1, 7, 1);
            }
          }
          x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(0, 13, TS, 3);
          if (r() < 0.5) { x.fillStyle = '#4e7040'; x.fillRect((r() * 12) | 0, 0, 3, 1); x.fillRect((r() * 12) | 0, 1, 1, 2); }
        } else {
          x.fillStyle = U.shade(base, 0.12); x.fillRect(0, 0, TS, TS);
          for (let i = 0; i < 20; i++) { x.fillStyle = U.shade(base, U.rand(0, 0.25)); x.fillRect((r() * TS) | 0, (r() * TS) | 0, 1, 1); }
          x.fillStyle = U.shade(base, -0.05); x.fillRect(0, 15, TS, 1);
          if (r() < 0.4) { x.fillStyle = '#5a7a44'; x.fillRect((r() * 12) | 0, (r() * 12) | 0, 3, 2); }
        }
      } else if (kind === 'cave') {
        if (face) {
          x.fillStyle = '#3a2e34'; x.fillRect(0, 0, TS, TS);
          for (let i = 0; i < 6; i++) { const sx = (r() * 15) | 0; x.fillStyle = U.pick(['#4a3c42', '#2c2228', '#56464c']); x.fillRect(sx, (r() * 6) | 0, 1, (r() * 10 + 4) | 0); }
          x.fillStyle = '#5e4e52'; x.fillRect(0, 0, TS, 1);
          x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(0, 12, TS, 4);
        } else {
          x.fillStyle = '#251d22'; x.fillRect(0, 0, TS, TS);
          for (let i = 0; i < 18; i++) { x.fillStyle = U.pick(['#2e252a', '#1e181c', '#352b30']); x.fillRect((r() * TS) | 0, (r() * TS) | 0, 2, 1); }
        }
      } else if (kind === 'cliff') {
        const g = THEMES[theme] ? THEMES[theme].grass : THEMES.forest.grass;
        if (face) {
          x.fillStyle = '#5a4634'; x.fillRect(0, 0, TS, TS);
          for (let i = 0; i < 8; i++) { x.fillStyle = U.pick(['#6a5440', '#4a3828', '#735c46']); x.fillRect((r() * 14) | 0, (r() * 14) | 0, (r() * 3 + 1) | 0, (r() * 2 + 1) | 0); }
          x.fillStyle = g[1]; x.fillRect(0, 0, TS, 2);
          x.fillStyle = g[0]; for (let i = 0; i < 6; i++) x.fillRect((r() * 15) | 0, 2, 1, (r() * 3) | 0);
          x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(0, 13, TS, 3);
        } else {
          x.fillStyle = g[1]; x.fillRect(0, 0, TS, TS);
          for (let i = 0; i < 24; i++) { x.fillStyle = r() < 0.5 ? g[0] : U.shade(g[1], -0.15); x.fillRect((r() * TS) | 0, (r() * TS) | 0, 1, 1); }
        }
      } else if (kind === 'hedge') {
        const g = (THEMES[theme] || THEMES.forest).grass;
        x.fillStyle = U.shade(g[1], face ? -0.25 : -0.1); x.fillRect(0, 0, TS, TS);
        for (let i = 0; i < 16; i++) {
          const lx = (r() * 14) | 0, ly = (r() * 14) | 0;
          x.fillStyle = U.shade(g[2], face ? -0.2 : 0); x.fillRect(lx, ly, 3, 2);
          x.fillStyle = U.shade(g[3], face ? -0.2 : 0); x.fillRect(lx, ly, 1, 1);
        }
        if (face) { x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(0, 12, TS, 4); }
      }
    });
  }

  function decoDraw(x, deco, tx, ty, theme) {
    const r = U.rng(9000 + tx * 31 + ty * 97);
    if (deco === 'flowers') {
      const cols = theme === 'sanctum' ? ['#9ae0ff', '#c0a0ff', '#ffffff'] : ['#ffd84a', '#ff8ab0', '#ffffff', '#a8c8ff', '#ff6a5a'];
      for (let i = 0; i < 4; i++) {
        const fx = (r() * 13 + 1) | 0, fy = (r() * 12 + 2) | 0, c = U.pick(cols);
        x.fillStyle = '#2e5a28'; x.fillRect(fx, fy + 1, 1, 2);
        x.fillStyle = c; x.fillRect(fx - 1, fy, 3, 1); x.fillRect(fx, fy - 1, 1, 3);
        x.fillStyle = '#ffe680'; x.fillRect(fx, fy, 1, 1);
      }
    } else if (deco === 'tall') {
      const g = (THEMES[theme] || THEMES.forest).grass;
      for (let i = 0; i < 5; i++) {
        const fx = (r() * 14 + 1) | 0, fy = (r() * 8 + 6) | 0;
        x.fillStyle = U.shade(g[1], -0.15); x.fillRect(fx, fy, 1, 5); x.fillRect(fx + 1, fy + 2, 1, 3);
        x.fillStyle = g[3]; x.fillRect(fx, fy, 1, 1); x.fillRect(fx - 1, fy + 2, 1, 2);
      }
    } else if (deco === 'mushroom') {
      for (let i = 0; i < 2; i++) {
        const fx = (r() * 11 + 2) | 0, fy = (r() * 9 + 4) | 0;
        x.fillStyle = '#e8dcc8'; x.fillRect(fx + 1, fy + 2, 1, 2);
        x.fillStyle = '#c8403a'; x.fillRect(fx, fy, 3, 2); x.fillStyle = '#fff'; x.fillRect(fx + 1, fy, 1, 1);
      }
    } else if (deco === 'shroomglow') {
      for (let i = 0; i < 3; i++) {
        const fx = (r() * 11 + 2) | 0, fy = (r() * 9 + 4) | 0;
        x.fillStyle = '#4a6a6a'; x.fillRect(fx + 1, fy + 2, 1, 2);
        x.fillStyle = '#5ae0d0'; x.fillRect(fx, fy, 3, 2); x.fillStyle = '#c8fff4'; x.fillRect(fx + 1, fy, 1, 1);
      }
    } else if (deco === 'rubble') {
      for (let i = 0; i < 4; i++) {
        const fx = (r() * 13) | 0, fy = (r() * 13) | 0, w = (r() * 3 + 2) | 0;
        x.fillStyle = '#8e8a82'; x.fillRect(fx, fy, w, 2); x.fillStyle = '#5e5a54'; x.fillRect(fx, fy + 2, w, 1);
      }
    } else if (deco === 'petals') {
      for (let i = 0; i < 6; i++) { x.fillStyle = U.pick(['#c0a0ff', '#9ae0ff', '#ffd0f0']); x.fillRect((r() * 15) | 0, (r() * 15) | 0, 1, 1); }
    }
  }

  // Desenha um tile no canvas estático do chão
  T.drawTile = function (x, level, tx, ty) {
    const ch = level.tile(tx, ty);
    const d = T.def(ch);
    const theme = level.theme;
    const px = tx * TS, py = ty * TS;
    const v = Math.floor(U.hash(tx, ty, 3) * 4);
    const ground = (g) => {
      if (g === 'grass') return grassTex(theme, v);
      if (g === 'dirt') return dirtTex(theme, v);
      if (g === 'cobble') return cobbleTex(v);
      if (g === 'stone') return stoneTex(theme, v);
      if (g === 'cave') return caveTex(v);
      if (g === 'magic') return magicTex(v);
      if (g === 'wood') return woodTex(v);
      if (g === 'bridge') return bridgeTex();
      if (g === 'snow') return snowTex(v);
      if (g === 'ice') return iceTex(v);
      if (g === 'star') return starTex(v);
      if (g === 'carpet') return carpetTex(v);
      if (g === 'planks') return planksTex(v);
      return grassTex(theme, v);
    };
    if (d.void) { x.fillStyle = '#07060b'; x.fillRect(px, py, TS, TS); return; }
    if (d.wall) {
      const below = T.def(level.tile(tx, ty + 1));
      const face = !below.wall && !below.void;
      x.drawImage(wallTex(d.wall, face, theme, v % 3), px, py);
      // borda superior quando acima não é parede
      const above = T.def(level.tile(tx, ty - 1));
      if (!above.wall && !above.void) { x.fillStyle = 'rgba(255,255,255,0.14)'; x.fillRect(px, py, TS, 1); x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(px, py + 1, TS, 1); }
      // bordas laterais (dão leitura de altura)
      const L = T.def(level.tile(tx - 1, ty)), R = T.def(level.tile(tx + 1, ty));
      if (!L.wall && !L.void) { x.fillStyle = 'rgba(8,6,16,0.45)'; x.fillRect(px, py, 2, TS); x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(px + 2, py, 1, TS); }
      if (!R.wall && !R.void) { x.fillStyle = 'rgba(8,6,16,0.55)'; x.fillRect(px + TS - 2, py, 2, TS); }
      return;
    }
    if (d.water) { x.drawImage(waterTex(0, theme), px, py); waterEdges(x, level, tx, ty); return; }
    if (d.chasm) { if (d.starvoid) starVoidDraw(x, level, tx, ty); else chasmDraw(x, level, tx, ty); return; }
    x.drawImage(ground(d.g), px, py);
    if (d.deco) { x.save(); x.translate(px, py); decoDraw(x, d.deco, tx, ty, theme); x.restore(); }
    // franjas de grama sobre chão de menor prioridade
    if (d.g !== 'grass' && d.g !== 'bridge') grassFringe(x, level, tx, ty);
    // sombra abaixo de parede
    const up = T.def(level.tile(tx, ty - 1));
    if (up.wall || up.void) { x.fillStyle = 'rgba(10,6,20,0.35)'; x.fillRect(px, py, TS, 3); x.fillStyle = 'rgba(10,6,20,0.18)'; x.fillRect(px, py + 3, TS, 2); }
    if (d.fence) fenceDraw(x, level, tx, ty);
    if (d.low) lowWallDraw(x, level, tx, ty);
  };

  function starVoidDraw(x, level, tx, ty) {
    const px = tx * TS, py = ty * TS;
    x.fillStyle = '#05041a'; x.fillRect(px, py, TS, TS);
    const r = U.rng(tx * 7 + ty * 13 + 3);
    for (let i = 0; i < 5; i++) { x.fillStyle = U.pick(['#2a2860', '#4a46a0', '#8a86e0', '#ffffff']); x.fillRect(px + ((r() * TS) | 0), py + ((r() * TS) | 0), 1, 1); }
    if (r() < 0.15) { x.fillStyle = '#c8a8ff'; x.fillRect(px + 7, py + 6, 1, 3); x.fillRect(px + 6, py + 7, 3, 1); }
    const above = T.def(level.tile(tx, ty - 1));
    if (!above.chasm) {
      x.fillStyle = '#4a4680'; x.fillRect(px, py, TS, 3);
      x.fillStyle = '#2a2858'; x.fillRect(px, py + 3, TS, 3);
      x.fillStyle = 'rgba(120,100,255,0.25)'; x.fillRect(px, py + 6, TS, 2);
    }
    if (!T.def(level.tile(tx - 1, ty)).chasm) { x.fillStyle = 'rgba(160,140,255,0.2)'; x.fillRect(px, py, 1, TS); }
    if (!T.def(level.tile(tx + 1, ty)).chasm) { x.fillStyle = 'rgba(160,140,255,0.2)'; x.fillRect(px + TS - 1, py, 1, TS); }
  }
  function lowWallDraw(x, level, tx, ty) {
    const px = tx * TS, py = ty * TS;
    const L = T.def(level.tile(tx - 1, ty)).low, R = T.def(level.tile(tx + 1, ty)).low;
    const base = level.theme === 'tower' ? '#5c5a96' : level.theme === 'snow' || level.theme === 'fortress' ? '#8a92a2' : '#9a948a';
    x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(px, py + 13, TS, 3);
    x.fillStyle = U.shade(base, -0.35); x.fillRect(px + (L ? 0 : 1), py + 5, TS - (L ? 0 : 1) - (R ? 0 : 1), 9);
    x.fillStyle = base; x.fillRect(px + (L ? 0 : 1), py + 5, TS - (L ? 0 : 1) - (R ? 0 : 1), 6);
    x.fillStyle = U.shade(base, 0.25); x.fillRect(px + (L ? 0 : 1), py + 5, TS - (L ? 0 : 1) - (R ? 0 : 1), 1);
    x.fillStyle = U.shade(base, -0.2); x.fillRect(px + 7, py + 6, 1, 4); x.fillRect(px + (tx % 2 ? 3 : 11), py + 8, 1, 3);
    if (level.theme === 'snow') { x.fillStyle = '#f4f8fc'; x.fillRect(px + (L ? 0 : 1), py + 4, TS - (L ? 0 : 1) - (R ? 0 : 1), 2); }
  }

  function isGrass(level, tx, ty) {
    const d = T.def(level.tile(tx, ty));
    return d.g === 'grass' && !d.wall;
  }
  function grassFringe(x, level, tx, ty) {
    const pal = THEMES[level.theme].grass;
    const px = tx * TS, py = ty * TS;
    const r = U.rng(tx * 13 + ty * 7 + 5);
    x.fillStyle = pal[0];
    if (isGrass(level, tx, ty - 1)) for (let i = 0; i < TS; i++) x.fillRect(px + i, py, 1, 1 + ((r() * 3) | 0));
    if (isGrass(level, tx, ty + 1)) for (let i = 0; i < TS; i++) { const h = 1 + ((r() * 3) | 0); x.fillRect(px + i, py + TS - h, 1, h); }
    if (isGrass(level, tx - 1, ty)) for (let i = 0; i < TS; i++) x.fillRect(px, py + i, 1 + ((r() * 3) | 0), 1);
    if (isGrass(level, tx + 1, ty)) for (let i = 0; i < TS; i++) { const w = 1 + ((r() * 3) | 0); x.fillRect(px + TS - w, py + i, w, 1); }
  }
  function waterEdges(x, level, tx, ty) {
    const px = tx * TS, py = ty * TS;
    const land = (ax, ay) => { const d = T.def(level.tile(ax, ay)); return !d.water && !d.chasm && !d.bridge; };
    x.fillStyle = '#9ad0f0';
    if (land(tx, ty - 1)) { x.fillStyle = '#1a3a5a'; x.fillRect(px, py, TS, 3); x.fillStyle = '#9ad0f0'; x.fillRect(px, py + 3, TS, 1); }
    if (land(tx, ty + 1)) { x.fillStyle = '#9ad0f0'; x.fillRect(px, py + TS - 1, TS, 1); }
    if (land(tx - 1, ty)) { x.fillStyle = '#9ad0f0'; x.fillRect(px, py, 1, TS); }
    if (land(tx + 1, ty)) { x.fillStyle = '#9ad0f0'; x.fillRect(px + TS - 1, py, 1, TS); }
  }
  function chasmDraw(x, level, tx, ty) {
    const px = tx * TS, py = ty * TS;
    x.fillStyle = '#07060b'; x.fillRect(px, py, TS, TS);
    const r = U.rng(tx * 3 + ty * 5);
    for (let i = 0; i < 4; i++) { x.fillStyle = '#141020'; x.fillRect(px + ((r() * TS) | 0), py + ((r() * TS) | 0), 1, 1); }
    const above = T.def(level.tile(tx, ty - 1));
    if (!above.chasm) {
      const lip = level.theme === 'cave' ? ['#4a3c42', '#2e2428'] : level.theme === 'sanctum' ? ['#4a4a6a', '#2a2a42'] : ['#6a645e', '#3e3a36'];
      x.fillStyle = lip[0]; x.fillRect(px, py, TS, 4);
      x.fillStyle = lip[1]; x.fillRect(px, py + 4, TS, 3);
      x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(px, py + 7, TS, 3);
    }
    if (!T.def(level.tile(tx - 1, ty)).chasm) { x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(px, py, 1, TS); }
    if (!T.def(level.tile(tx + 1, ty)).chasm) { x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(px + TS - 1, py, 1, TS); }
  }
  function fenceDraw(x, level, tx, ty) {
    const px = tx * TS, py = ty * TS;
    const L = level.tile(tx - 1, ty) === 'F', R = level.tile(tx + 1, ty) === 'F';
    const Up = level.tile(tx, ty - 1) === 'F', Dn = level.tile(tx, ty + 1) === 'F';
    x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(px + 2, py + 13, 12, 2);
    const wood = '#8a5e3a', dark = '#5a3a22', light = '#b07e4e';
    if (L || R || (!Up && !Dn)) {
      x.fillStyle = dark; x.fillRect(px + (L ? 0 : 6), py + 5, (L ? 8 : 2) + (R ? 8 : 0) - (L ? 0 : 0), 2);
      x.fillRect(px + (L ? 0 : 6), py + 9, (L ? 8 : 2) + (R ? 8 : 0), 2);
      x.fillStyle = wood; x.fillRect(px + (L ? 0 : 6), py + 5, (L ? 8 : 2) + (R ? 8 : 0), 1); x.fillRect(px + (L ? 0 : 6), py + 9, (L ? 8 : 2) + (R ? 8 : 0), 1);
    }
    if (Up || Dn) { x.fillStyle = dark; x.fillRect(px + 7, py + (Up ? 0 : 6), 2, Dn ? 16 - (Up ? 0 : 6) : 10); }
    x.fillStyle = dark; x.fillRect(px + 6, py + 2, 4, 12);
    x.fillStyle = wood; x.fillRect(px + 7, py + 2, 2, 11);
    x.fillStyle = light; x.fillRect(px + 7, py + 2, 1, 10); x.fillRect(px + 6, py + 2, 4, 1);
  }

  // Animação da água por cima do chão estático
  T.waterFrame = (theme, frame) => waterTex(frame, theme);
  T.wallTex = wallTex;
  T.THEMES = THEMES;
  G.Tiles = T;
})();
