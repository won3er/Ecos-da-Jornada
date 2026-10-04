// Arte procedural dos objetos dos Capítulos II e III (neve, minas, fortaleza,
// torre celeste). Mesmo esquema de props.js: gerado uma vez e guardado em cache.
(function () {
  const U = G.U, P = G.Pixel;
  const C = {};
  const cache = (k, w, h, fn) => (C[k] || (C[k] = P.make(w, h, fn)));
  const Props = G.Props;

  // bloco de gelo (derrete com Chama Estelar)
  Props.iceBlock = (stage) => cache('iceblock_' + stage, 18, 22, (x) => {
    const h = 20 - stage * 5;
    if (h <= 2) return;
    const y0 = 21 - h;
    x.fillStyle = '#2a5a7a'; x.fillRect(0, y0, 18, h + 1);
    x.fillStyle = '#7ab8dc'; x.fillRect(1, y0 + 1, 16, h - 1);
    x.fillStyle = '#a8dcf4'; x.fillRect(1, y0 + 1, 16, Math.min(5, h - 2));
    x.fillStyle = '#d8f4ff'; x.fillRect(3, y0 + 2, 2, Math.max(1, h - 6)); x.fillRect(5, y0 + 2, 1, 3);
    x.fillStyle = '#5a98c4'; x.fillRect(11, y0 + 4, 1, Math.max(1, h - 8)); x.fillRect(12, y0 + 8, 1, 3);
    x.fillStyle = '#e8faff'; x.fillRect(1, y0 + 1, 16, 1);
  });

  // espinheiro / teia (queima com fogo)
  Props.thorns = (kind) => cache('thorns_' + kind, 18, 20, (x) => {
    if (kind === 'web') {
      x.fillStyle = 'rgba(232,236,248,0.85)';
      for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; P.line(x, 9, 10, 9 + Math.cos(a) * 9, 10 + Math.sin(a) * 9, 'rgba(232,236,248,0.85)'); }
      for (const r of [3, 6, 8]) P.ring(x, 9, 10, r, 'rgba(232,236,248,0.7)');
      x.fillStyle = '#ffffff'; x.fillRect(8, 9, 2, 2);
      return;
    }
    const r = U.rng(kind === 'snow' ? 51 : 47);
    for (let i = 0; i < 26; i++) {
      const bx = (r() * 16) | 0, by = (r() * 16 + 3) | 0;
      x.fillStyle = U.pick(['#3a2a3a', '#5a3a4a', '#2a1e2a']); x.fillRect(bx, by, 3, 1); x.fillRect(bx + 1, by - 1, 1, 3);
      if (r() < 0.4) { x.fillStyle = '#c8b8c8'; x.fillRect(bx + 2, by - 1, 1, 1); }
    }
    x.fillStyle = '#1e141e'; x.fillRect(2, 18, 14, 2);
    if (kind === 'snow') { x.fillStyle = '#f2f6fb'; for (let i = 0; i < 6; i++) x.fillRect((r() * 15) | 0, (r() * 6 + 3) | 0, 2, 1); }
  });

  // espelho giratório (Aldren gira). orient: 0 = '/', 1 = '\'
  Props.mirror = (orient) => cache('mirror_' + orient, 20, 28, (x) => {
    x.fillStyle = '#2a2430'; x.fillRect(3, 22, 14, 6);
    x.fillStyle = '#6a6488'; x.fillRect(4, 22, 12, 4);
    x.fillStyle = '#8a84a8'; x.fillRect(4, 22, 12, 1);
    x.fillStyle = '#3a3460'; x.fillRect(9, 14, 2, 9);
    for (let i = 0; i < 14; i++) {
      const px = orient ? 3 + i : 16 - i, py = 2 + Math.round(i * 0.85);
      x.fillStyle = '#2a2448'; x.fillRect(px - 1, py, 3, 2);
      x.fillStyle = i < 3 ? '#ffffff' : '#c8e8ff'; x.fillRect(px, py, 1, 1);
      x.fillStyle = '#8ab8e8'; x.fillRect(px, py + 1, 1, 1);
    }
    x.fillStyle = '#d9b45a'; x.fillRect(8, 12, 4, 2);
  });

  // fonte de luz (emissor) e receptor
  Props.emitter = (on) => cache('emitter_' + (on ? 1 : 0), 18, 26, (x) => {
    x.fillStyle = '#1e1a30'; x.fillRect(2, 18, 14, 8);
    x.fillStyle = '#4a4680'; x.fillRect(3, 18, 12, 6);
    x.fillStyle = '#6a66a8'; x.fillRect(3, 18, 12, 1);
    x.fillStyle = '#1e1a30'; x.fillRect(5, 6, 8, 13);
    x.fillStyle = '#5a56a0'; x.fillRect(6, 6, 6, 12);
    const c = on ? ['#ffe680', '#ffffff'] : ['#5a5a7a', '#8a8aa8'];
    P.circle(x, 9, 6, 4, c[0]); P.circle(x, 9, 6, 2, c[1]);
    x.fillStyle = '#d9b45a'; x.fillRect(4, 11, 10, 1);
  });
  Props.receptor = (on) => cache('receptor_' + (on ? 1 : 0), 18, 24, (x) => {
    x.fillStyle = '#1e1a30'; x.fillRect(3, 16, 12, 8);
    x.fillStyle = '#4a4680'; x.fillRect(4, 16, 10, 6);
    x.fillStyle = '#1e1a30'; x.fillRect(2, 2, 14, 15);
    x.fillStyle = on ? '#c89a2a' : '#3a3660'; x.fillRect(3, 3, 12, 13);
    x.fillStyle = on ? '#ffe680' : '#5a56a0'; x.fillRect(5, 5, 8, 9);
    x.fillStyle = on ? '#ffffff' : '#7a76c0'; x.fillRect(7, 7, 4, 5);
  });

  // plataforma flutuante (w x h tiles)
  Props.platform = (w, h) => cache('plat_' + w + 'x' + h, w * 16, h * 16 + 6, (x) => {
    const W = w * 16, H = h * 16;
    x.fillStyle = '#100e24'; x.fillRect(1, 4, W - 2, H + 2);
    x.fillStyle = '#3c3a6c'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#4c4a84'; x.fillRect(1, 1, W - 2, H - 3);
    x.fillStyle = '#6a68a8'; x.fillRect(1, 1, W - 2, 1);
    x.fillStyle = '#2c2a54'; x.fillRect(0, H - 2, W, 2);
    for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) {
      x.fillStyle = '#5a58a0'; x.fillRect(i * 16 + 7, j * 16 + 6, 2, 2);
      x.fillStyle = '#9a96e0'; x.fillRect(i * 16 + 7, j * 16 + 6, 1, 1);
    }
    x.fillStyle = '#d9b45a'; x.fillRect(2, 2, 2, 2); x.fillRect(W - 4, 2, 2, 2);
  });

  // trono congelado (fortaleza)
  Props.throne = () => cache('throne', 40, 48, (x) => {
    x.fillStyle = '#1e2a3a'; x.fillRect(4, 38, 32, 10);
    x.fillStyle = '#5a7a9a'; x.fillRect(5, 38, 30, 8);
    x.fillStyle = '#8ab0d0'; x.fillRect(5, 38, 30, 2);
    x.fillStyle = '#1e2a3a'; x.fillRect(8, 2, 24, 37);
    x.fillStyle = '#4a6a8a'; x.fillRect(9, 3, 22, 35);
    x.fillStyle = '#7aa0c4'; x.fillRect(9, 3, 4, 35);
    x.fillStyle = '#7a2a34'; x.fillRect(13, 10, 14, 22);
    x.fillStyle = '#9a3a44'; x.fillRect(13, 10, 14, 3);
    for (const [px, h] of [[8, 8], [14, 12], [20, 16], [26, 12], [31, 8]]) {
      for (let k = 0; k < h; k++) { x.fillStyle = k < 3 ? '#ffffff' : '#a8dcf4'; x.fillRect(px, 2 - Math.round(h * 0.2) + k - 4 + 4, 2, 1); }
    }
    x.fillStyle = '#d9b45a'; x.fillRect(18, 5, 4, 3);
  });

  // carrinho de mina e trilhos
  Props.mineCart = () => cache('minecart', 22, 18, (x) => {
    x.fillStyle = '#2a2430'; x.fillRect(1, 2, 20, 12);
    x.fillStyle = '#6a5a4a'; x.fillRect(2, 3, 18, 10);
    x.fillStyle = '#8a7a66'; x.fillRect(2, 3, 18, 2);
    x.fillStyle = '#4a4652'; x.fillRect(1, 6, 20, 1); x.fillRect(1, 11, 20, 1);
    x.fillStyle = '#7ab8dc'; x.fillRect(5, 1, 4, 3); x.fillRect(11, 0, 5, 4); x.fillStyle = '#d0f0ff'; x.fillRect(12, 0, 2, 1);
    for (const cx of [6, 16]) { P.circle(x, cx, 15, 2, '#1a1418'); x.fillStyle = '#6a6672'; x.fillRect(cx, 15, 1, 1); }
  });

  // tenda de inverno (acampamento)
  Props.snowTent = () => cache('snowtent', 36, 30, (x) => {
    for (let j = 0; j < 26; j++) {
      const w = Math.round(2 + j * 0.62);
      x.fillStyle = '#6a4a3a'; x.fillRect(18 - w, 3 + j, w * 2, 1);
      x.fillStyle = '#8a6a50'; x.fillRect(18 - w, 3 + j, w, 1);
    }
    for (let j = 0; j < 8; j++) { const w = Math.round(2 + j * 0.62); x.fillStyle = '#f2f6fb'; x.fillRect(18 - w, 3 + j, w * 2, 1); }
    x.fillStyle = '#2a1a10'; for (let j = 12; j < 26; j++) { const w = Math.round((j - 12) * 0.3); x.fillRect(18 - w, 3 + j, w * 2 + 1, 1); }
    x.fillStyle = '#5a3a22'; x.fillRect(17, 0, 2, 4);
  });

  // estátua de cavaleiro (fortaleza)
  Props.knightStatue = () => cache('kstatue', 22, 42, (x) => {
    x.fillStyle = '#3a4250'; x.fillRect(1, 32, 20, 10);
    x.fillStyle = '#7a8496'; x.fillRect(2, 32, 18, 8);
    x.fillStyle = '#9aa4b6'; x.fillRect(2, 32, 18, 2);
    x.fillStyle = '#5a6476'; x.fillRect(6, 12, 10, 20); x.fillRect(7, 4, 8, 9);
    x.fillStyle = '#8a94a6'; x.fillRect(7, 12, 4, 20); x.fillRect(8, 4, 3, 8);
    x.fillStyle = '#2a3240'; x.fillRect(8, 7, 6, 1);
    x.fillStyle = '#9aa4b6'; x.fillRect(16, 0, 2, 30); x.fillRect(13, 24, 8, 2);
    x.fillStyle = '#f2f6fb'; x.fillRect(7, 3, 8, 2); x.fillRect(2, 31, 18, 1);
  });

  // estante, telescópio e pedestal estelar (torre)
  Props.bookshelf = () => cache('shelf', 30, 36, (x) => {
    x.fillStyle = '#2a1a1a'; x.fillRect(0, 0, 30, 36);
    x.fillStyle = '#5a3a2a'; x.fillRect(1, 1, 28, 34);
    const r = U.rng(9);
    for (let row = 0; row < 3; row++) {
      x.fillStyle = '#3a2418'; x.fillRect(1, 11 + row * 11, 28, 2);
      for (let bx = 2; bx < 28;) { const bw = 2 + ((r() * 3) | 0); x.fillStyle = U.pick(['#6a3a8a', '#3a5a8a', '#8a3a3a', '#3a7a5a', '#c8a050']); x.fillRect(bx, 3 + row * 11, bw, 8); bx += bw + 1; }
    }
  });
  Props.telescope = () => cache('telescope', 26, 34, (x) => {
    x.fillStyle = '#2a2430'; x.fillRect(11, 16, 3, 16); x.fillRect(6, 30, 13, 3);
    for (let i = 0; i < 18; i++) { x.fillStyle = i < 3 ? '#d9b45a' : '#7a6aa8'; x.fillRect(4 + i, 18 - i, 4, 3); }
    x.fillStyle = '#c8e8ff'; x.fillRect(22, 1, 2, 2);
  });
  Props.starPedestal = (on) => cache('spedestal_' + (on ? 1 : 0), 18, 30, (x) => {
    x.fillStyle = '#1e1a30'; x.fillRect(3, 14, 12, 16);
    x.fillStyle = '#4a4680'; x.fillRect(4, 14, 10, 14);
    x.fillStyle = '#6a66a8'; x.fillRect(4, 14, 3, 14);
    x.fillStyle = '#1e1a30'; x.fillRect(1, 12, 16, 3);
    if (on) { P.circle(x, 9, 6, 5, '#f2d98c'); P.circle(x, 9, 6, 3, '#ffffff'); }
    else { P.circle(x, 9, 6, 4, '#3a3660'); }
  });

  // figura congelada (morador preso no gelo do tempo): ice overlay
  Props.iceShell = () => cache('iceshell', 22, 30, (x) => {
    x.fillStyle = 'rgba(122,184,220,0.55)'; x.fillRect(1, 2, 20, 28);
    x.fillStyle = 'rgba(200,240,255,0.7)'; x.fillRect(3, 4, 2, 20); x.fillRect(5, 4, 1, 6);
    x.fillStyle = 'rgba(90,152,196,0.6)'; x.fillRect(15, 8, 1, 14);
    x.fillStyle = 'rgba(232,250,255,0.9)'; x.fillRect(1, 2, 20, 1);
    x.fillStyle = 'rgba(42,90,122,0.8)'; x.fillRect(0, 2, 1, 28); x.fillRect(21, 2, 1, 28); x.fillRect(0, 29, 22, 1);
  });
})();
