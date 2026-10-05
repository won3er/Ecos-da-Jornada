// Sprites dos inimigos e personagens dos Capítulos II e III (grades + paleta).
(function () {
  const P = G.Pixel, U = G.U;
  const S = G.Sprites;
  function fix(rows, w) { return rows.map((r) => (r + '.'.repeat(w)).slice(0, w)); }
  function mkSet(frames, pal) {
    const w = Math.max(...frames.flat().map((r) => r.length));
    const imgs = frames.map((f) => P.outline(P.fromRows(fix(f, w), pal)));
    return {
      right: imgs,
      left: imgs.map(P.flipH),
      white: imgs.map((c) => P.silhouette(c, '#ffffff')),
      whiteL: imgs.map((c) => P.flipH(P.silhouette(c, '#ffffff'))),
    };
  }
  S.mkSet = mkSet;

  const baseInit = S.init;
  S.init = function () {
    baseInit();
    // LOBO DA GEADA e ALFA (recolor do lobo)
    const wolfPal = { d: '#1e1a26', k: '#3a4a5a', g: '#8aa4c0', G: '#c8dcf0', e: '#8ae8ff', w: '#ffffff', r: '#5ab8e8' };
    S.frostWolf = recolorSet(S.wolf, wolfPal);
    const alphaPal = { d: '#1e1a26', k: '#5a6a7a', g: '#d8e4f0', G: '#ffffff', e: '#ff4a4a', w: '#ffffff', r: '#c8404a' };
    S.alphaWolf = recolorSet(S.wolf, alphaPal);
    S.crystalBat = recolorSet(S.bat, { k: '#1c2636', g: '#3a7aa8', G: '#8ad0f0', e: '#ffffff', w: '#e8faff' });

    // ARANHA DE CRISTAL (vista de cima)
    const spPal = { k: '#141a24', a: '#3a5a7a', A: '#6aa0c8', c: '#c8f0ff', e: '#ff5a8a', l: '#2a3a4a' };
    const sp1 = [
      'l....l....l...',
      '.l...l...l....',
      '..l.kkkk.l....',
      'lllkAAccAklll.',
      '...kAAAAAAk...',
      'lllkAeAAeAklll',
      '...kaAAAAak...',
      '..lkaacaaakl..',
      '.l..kaaaak..l.',
      'l....kkkk....l',
    ];
    const sp2 = sp1.map((r, i) => (i % 2 ? r.replace(/^l/, '.').replace(/l$/, '.') : r));
    const sp3 = [
      '..l...l...l...',
      'l..l..l..l..l.',
      '.l..kkkkk..l..',
      'lllkAAcccAklll',
      '...kAAAAAAAk..',
      'lllkAeAAAeAkll',
      '...kaAAAAAak..',
      '..lkaacccaakl.',
      '.l..kaaaaak.l.',
      'l....kkkkk...l',
    ];
    S.spider = mkSet([sp1, sp2, sp3], spPal);

    // CAVALEIRO CONGELADO (perfil/3-4) e CAVALEIRO DO VAZIO
    const knPal = { k: '#1a2230', m: '#5a6a80', M: '#8a9cb4', W: '#c8d8ec', i: '#a8dcf4', I: '#e8faff', e: '#8ae8ff', c: '#3a4a6a', s: '#4a3a2a' };
    const kn = [
      '......kkkk......',
      '.....kMWMMk.....',
      '....kMWWMMMk....',
      '....kmkeekmk....',
      '....kmmMMmmk....',
      '.....kmMMmk.....',
      '...kkkiMMikkk...',
      '..kiIkmMMmkIik..',
      '..kiikmWWmkiik..',
      '..kiikmMMmkiik.k',
      '..kiikmMMmkiikkM',
      '..kiikcccckiikMk',
      '...kkkmMMmkkkMk.',
      '....kmmkkmmkMk..',
      '....kmk..kmkk...',
      '....kmk..kmk....',
      '...kmmk..kmmk...',
      '...kkkk..kkkk...',
    ];
    const kn2 = kn.map((r, i) => (i === 15 ? '....kmk...kmk...' : i === 16 ? '...kmmk...kmmk..' : i === 17 ? '...kkkk...kkkk..' : r));
    const knAtk = [
      '......kkkk....kM',
      '.....kMWMMk..kMk',
      '....kMWWMMMkkMk.',
      '....kmkeekmkMk..',
      '....kmmMMmmMk...',
      '.....kmMMmkk....',
      '...kkkiMMikk....',
      '..kiIkmMMmk.....',
      '..kiikmWWmk.....',
      '..kiikmMMmk.....',
      '..kiikmMMmk.....',
      '..kiikcccck.....',
      '...kkkmMMmk.....',
      '....kmmkkmmk....',
      '....kmk..kmk....',
      '....kmk..kmk....',
      '...kmmk..kmmk...',
      '...kkkk..kkkk...',
    ];
    S.knight = mkSet([kn, kn2, knAtk], knPal);
    S.knightBare = mkSet([kn, kn2, knAtk], Object.assign({}, knPal, { i: '#5a6a80', I: '#8a9cb4' }));
    S.voidKnight = mkSet([kn, kn2, knAtk], { k: '#0a0818', m: '#2a2050', M: '#4a3a8a', W: '#8a7ad8', i: '#3a2a6a', I: '#6a5ab8', e: '#ff4a8a', c: '#c8a8ff', s: '#2a1a2a' });

    // SIR TALEN (memória de Velmora): Aldren de capa azul e cabelo claro
    S.talen = S.recolor('aldren', { q: '#1a2a5a', r: '#2a4a8a', R: '#4a78c8', d: '#8a6a3a', h: '#c8a060', H: '#e8c880' });
    const spr = S.talen.down[0];
    S.portraits.talen = P.make(36, 36, (x) => { x.fillStyle = '#22283a'; x.fillRect(0, 0, 36, 36); x.fillStyle = 'rgba(255,255,255,0.06)'; x.fillRect(0, 0, 36, 12); x.drawImage(spr, 0, 1, spr.width, 18, 0, 2, spr.width * 2, 36); });
  };

  function recolorSet(set, pal) {
    // recolore por luminância aproximada: mapeia as cores originais do conjunto
    const remap = (c) => {
      const out = U.makeCanvas(c.width, c.height), x = out.getContext('2d');
      x.drawImage(c, 0, 0);
      const img = x.getImageData(0, 0, c.width, c.height), d = img.data;
      const cols = Object.values(pal).map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
      const lum = (r, g, b) => 0.3 * r + 0.59 * g + 0.11 * b;
      const sorted = cols.slice().sort((a, b) => lum(...a) - lum(...b));
      for (let i = 0; i < d.length; i += 4) {
        if (!d[i + 3]) continue;
        const l = lum(d[i], d[i + 1], d[i + 2]) / 255;
        if (l < 0.09) continue; // contorno
        const red = d[i] > d[i + 1] * 1.6 && d[i] > 150; // olhos/boca avermelhados
        const yellow = d[i] > 200 && d[i + 1] > 160 && d[i + 2] < 120;
        let c;
        if (yellow) c = cols[Object.keys(pal).indexOf('e')] || sorted[sorted.length - 1];
        else if (red) c = cols[Object.keys(pal).indexOf('r')] || sorted[sorted.length - 1];
        else c = sorted[Math.min(sorted.length - 1, Math.floor(l * sorted.length * 1.05))];
        d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2];
      }
      x.putImageData(img, 0, 0);
      return out;
    };
    const right = set.right.map(remap);
    return { right, left: right.map(P.flipH), white: set.white, whiteL: set.whiteL };
  }
  S.recolorSet = recolorSet;
})();
