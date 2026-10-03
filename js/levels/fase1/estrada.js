// FASE 1 — Estrada do Moinho: primeiros combates, rocha rachada (golpe pesado
// do Aldren) e selo arcano (magia carregada da Lirien). Ensina pelo cenário.
G.defineArea({
  id: 'estrada',
  title: 'Estrada do Moinho',
  theme: 'village',
  music: 'explore',
  ambience: 'wind',
  ambient: 'leaves',
  size: [66, 22],
  seed: 7,
  build(b) {
    b.border('T', 1, 3, [[0, 9, 3, 4], [63, 9, 3, 4]]);
    b.scatter(2, 2, 62, 18, ',', 0.05);
    b.scatter(2, 2, 62, 18, ';', 0.05);
    b.scatter(3, 3, 60, 16, 'T', 0.04);
    b.scatter(3, 3, 60, 16, 'r', 0.015);
    // estrada sinuosa
    b.path([[0, 10], [12, 10], [12, 11], [16, 11]], ':', 2);
    b.rect(16, 10, 6, 1, ':');
    b.path([[22, 10], [28, 10], [28, 8], [36, 8], [36, 10], [44, 10]], ':', 2);
    b.path([[44, 10], [52, 10], [52, 12], [66, 12]], ':', 2);
    b.rect(52, 9, 2, 4, ':');
    // passagem estreita da rocha (col 18): falésias
    b.rect(17, 0, 3, 10, 'X'); b.rect(17, 11, 3, 11, 'X');
    b.rect(16, 10, 5, 1, ':');
    // passagem do selo (col 42)
    b.rect(41, 0, 3, 10, 'X'); b.rect(41, 11, 3, 11, 'X');
    b.rect(40, 10, 5, 1, ':');
    // bolsão secreto ao norte (atrás dos arbustos)
    b.rect(30, 2, 6, 3, '.'); b.rect(29, 1, 8, 1, 'T'); b.rect(29, 2, 1, 4, 'T'); b.rect(36, 2, 1, 4, 'T');
    b.rect(30, 5, 6, 1, 'T'); b.set(33, 5, '.');
    b.rect(33, 6, 1, 1, '.');
    // laguinho
    b.ellipse(48, 17, 3, 1.6, 'W');
    // garante limpeza da estrada
    b.replace('Tr', ',', 0, 9, 66, 4);
  },
  spawns: { oeste: [2, 11], leste: [62, 12], start: [2, 11] },
  exits: [
    { x: 0, y: 9, h: 4, to: 'vila', spawn: 'leste' },
    { x: 65, y: 9, h: 5, to: 'floresta', spawn: 'oeste' },
  ],
  zones: [
    { x: 4, y: 8, w: 1, h: 6, trigger: 'estrada_inicio' },
    { x: 13, y: 8, w: 1, h: 6, trigger: 'estrada_rocha' },
    { x: 37, y: 6, w: 1, h: 8, trigger: 'estrada_barreira' },
  ],
  entities: [
    { type: 'sign', tx: 5, ty: 9, text: 'Leste: Bosque Sussurrante. Oeste: Brisaclara. "Cuidado com as gosmas — elas mordem."' },
    { enemy: 'slime', tx: 8, ty: 12 }, { enemy: 'slime', tx: 10, ty: 8 }, { enemy: 'slime', tx: 14, ty: 13 },
    { type: 'bush', tx: 7, ty: 7 }, { type: 'bush', tx: 11, ty: 14 }, { type: 'bush', tx: 23, ty: 13 }, { type: 'bush', tx: 26, ty: 6 },
    // rocha rachada: só o golpe pesado do Aldren quebra
    { type: 'sign', tx: 15, ty: 9, text: 'Rocha rachada na passagem. "Um golpe com força e paciência resolve." (Aldren: segure o ataque)' },
    { type: 'cracked', tx: 18, ty: 10, flag: 'road_rock' },
    { enemy: 'wolf', tx: 25, ty: 12 }, { enemy: 'slime', tx: 30, ty: 11 }, { enemy: 'wolf', tx: 34, ty: 11 },
    // bolsão secreto: arbustos escondem a entrada (página 2)
    { type: 'bush', tx: 33, ty: 5, drop: null }, { type: 'bush', tx: 33, ty: 6 },
    { type: 'chest', tx: 32, ty: 3, flag: 'secret_estrada', contents: [{ item: 'pagina' }], gold: 15 },
    // selo arcano: só a magia carregada da Lirien quebra
    { type: 'sign', tx: 39, ty: 9, text: 'Selo arcano antigo. "Magia comum se desfaz nele. Concentre." (Lirien: segure a magia)' },
    { type: 'barrier', tx: 42, ty: 10, flag: 'road_seal' },
    { enemy: 'wolf', tx: 48, ty: 9 }, { enemy: 'slime', tx: 50, ty: 13 }, { enemy: 'wolf', tx: 56, ty: 14 }, { enemy: 'slime', tx: 46, ty: 12 },
    { type: 'bush', tx: 47, ty: 6 }, { type: 'bush', tx: 58, ty: 7 }, { type: 'bush', tx: 60, ty: 16 },
    { type: 'waystone', tx: 58, ty: 10, cp: 'cp_estrada' },
    { type: 'decor', kind: 'campfire', tx: 56, ty: 9 },
  ],
  triggers: {
    estrada_inicio(g) { g.banter('estrada_inicio'); },
    estrada_rocha(g) { g.banter('estrada_rocha'); if (!g.flag('road_rock')) g.toast('Aldren: segure ' + G.Characters.aldren.keys.attack + ' para um golpe pesado.', 4); },
    estrada_barreira(g) { g.banter('estrada_barreira'); if (!g.flag('road_seal')) g.toast('Lirien: segure ' + G.Characters.lirien.keys.attack + ' para carregar a magia e solte.', 4); },
  },
});
