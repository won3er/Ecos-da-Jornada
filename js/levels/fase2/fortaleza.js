// CAPÍTULO II — Fortaleza da Vigília Branca: pátio com cavaleiros congelados,
// ala oeste (três braseiros de fogo acesos ao mesmo tempo), ala leste (sacada
// atrás de muro baixo: arremessar a Lirien até a runa), o grande salão (arena)
// e a antessala do trono. Segredo: sala atrás de um bloco de gelo.
G.defineArea({
  id: 'fortaleza',
  title: 'Fortaleza da Vigília Branca',
  theme: 'fortress',
  music: 'fortress',
  ambience: 'hall',
  ambient: 'snow',
  darkness: 0.3,
  darkColor: '#0e1424',
  tint: '#e6ecf4',
  size: [50, 44],
  seed: 121,
  fill: '#',
  meltTo: '_',
  build(b) {
    // pátio
    b.rect(14, 30, 22, 11, '.');
    b.rect(23, 41, 4, 3, ':');
    b.rect(24, 31, 2, 10, '_');
    b.rect(16, 35, 18, 2, '_');
    // grande portão e salão
    b.rect(24, 28, 2, 2, '_');
    b.rect(14, 12, 22, 16, '_');
    b.rect(21, 13, 8, 14, 'q');
    // alas
    b.rect(2, 14, 11, 24, '_');
    b.rect(13, 34, 1, 2, '_');
    b.rect(37, 14, 11, 24, '_');
    b.rect(36, 34, 1, 2, '_');
    // sacada da ala leste (atrás de muro baixo)
    b.rect(37, 20, 11, 1, 'b');
    // sala secreta (sudoeste)
    b.set(10, 38, '_');
    b.rect(8, 39, 5, 3, '_');
    // corredor norte e antessala
    b.rect(24, 8, 2, 4, '_');
    b.rect(21, 2, 8, 6, '_');
    b.rect(24, 0, 2, 2, 'q');
    // colunas
    for (const [x, y] of [[16, 14], [33, 14], [16, 25], [33, 25], [4, 20], [10, 20], [4, 31], [10, 31], [39, 24], [45, 24], [39, 32], [45, 32]]) b.set(x, y, 'k');
    b.scatter(15, 31, 20, 9, ',', 0.06, '.');
  },
  spawns: { sul: [24, 41], start: [24, 41], norte: [24, 2] },
  spawnDir: 'up',
  exits: [
    { x: 23, y: 43, w: 4, to: 'picos', spawn: 'norte' },
    { x: 24, y: 0, w: 2, to: 'trono', spawn: 'sul' },
  ],
  zones: [
    { x: 20, y: 38, w: 10, h: 2, trigger: 'fortaleza_inicio' },
    { x: 15, y: 13, w: 20, h: 14, trigger: 'salao' },
    { x: 21, y: 2, w: 8, h: 5, trigger: 'fortaleza_trono' },
    { x: 8, y: 39, w: 5, h: 3, trigger: 'secreto_fortaleza', flag: 'secret_fortaleza' },
  ],
  entities: [
    { type: 'waystone', tx: 17, ty: 38, cp: 'cp_fort', name: 'Pátio da Vigília' },
    { type: 'decor', kind: 'knightstatue', tx: 20, ty: 32 }, { type: 'decor', kind: 'knightstatue', tx: 29, ty: 32 },
    { type: 'decor', kind: 'banner', tx: 22, ty: 29, color: '#2a4a8a' }, { type: 'decor', kind: 'banner', tx: 27, ty: 29, color: '#2a4a8a' },
    { enemy: 'knight', tx: 19, ty: 34 }, { enemy: 'knight', tx: 30, ty: 34 }, { enemy: 'snowling', tx: 33, ty: 39 },
    { type: 'sign', tx: 22, ty: 31, text: 'O grande portão tem dois selos: um gravado com chamas, outro com asas. Ambos apagados.' },
    // grande portão (os dois selos)
    { type: 'gate', id: 'fort_g1', tx: 24, ty: 29, requires: ['selo_oeste', 'selo_leste'], flag: 'fort_portao' },
    { type: 'gate', id: 'fort_g2', tx: 25, ty: 29, requires: ['selo_oeste', 'selo_leste'], flag: 'fort_portao' },
    // ala oeste: três braseiros de fogo AO MESMO TEMPO
    { type: 'brazier', id: 'fb1', tx: 3, ty: 15, needsFire: true, burnTime: 7 },
    { type: 'brazier', id: 'fb2', tx: 11, ty: 15, needsFire: true, burnTime: 7 },
    { type: 'brazier', id: 'fb3', tx: 7, ty: 36, needsFire: true, burnTime: 7 },
    { type: 'mechanism', requires: ['fb1', 'fb2', 'fb3'], flag: 'fort_selo_o', script: 'seloOeste', onLoad: 'seloOesteLoad' },
    { type: 'sign', tx: 9, ty: 33, text: 'Selo das Chamas: "Três fogos, um só instante. O inverno apaga o que fica sozinho."' },
    { enemy: 'knight', tx: 7, ty: 24 }, { enemy: 'icewisp', tx: 5, ty: 18 }, { enemy: 'icewisp', tx: 10, ty: 28 },
    // sala secreta atrás do gelo
    { type: 'iceblock', tx: 10, ty: 38, flag: 'fort_gelo_secreto' },
    { type: 'chest', tx: 10, ty: 40, flag: 'chest_fort_secreto', contents: [{ item: 'pagina_diario' }, { item: 'pocao_grande' }], gold: 50, fancy: true },
    // ala leste: sacada atrás de muro baixo
    { type: 'rune', id: 'runa_fort', tx: 42, ty: 16, flag: 'fort_selo_l', say: 'O Selo das Asas. Combina com voar, né?' },
    { type: 'mechanism', requires: ['runa_fort'], flag: 'fort_selo_l2', script: 'seloLeste', onLoad: 'seloLesteLoad' },
    { type: 'sign', tx: 40, ty: 23, text: 'Selo das Asas: "Só alcança quem foi lançado por mãos amigas."' },
    { enemy: 'knight', tx: 42, ty: 28 }, { enemy: 'spider', tx: 39, ty: 35 }, { enemy: 'snowling', tx: 45, ty: 22 },
    { type: 'chest', tx: 46, ty: 15, flag: 'chest_fort_sacada', contents: [{ item: 'cristal_gelido' }], gold: 30 },
    // grande salão (arena)
    { type: 'gate', id: 'fort_a1', tx: 24, ty: 28, latch: false }, { type: 'gate', id: 'fort_a2', tx: 25, ty: 28, latch: false },
    { type: 'gate', id: 'fort_n1', tx: 24, ty: 11, flag: 'fort_salao' }, { type: 'gate', id: 'fort_n2', tx: 25, ty: 11, flag: 'fort_salao' },
    { type: 'decor', kind: 'banner', tx: 18, ty: 12, color: '#2a4a8a' }, { type: 'decor', kind: 'banner', tx: 31, ty: 12, color: '#2a4a8a' },
    { type: 'brazier', tx: 15, ty: 13, lit: true }, { type: 'brazier', tx: 34, ty: 13, lit: true },
    { type: 'brazier', tx: 15, ty: 26, lit: true }, { type: 'brazier', tx: 34, ty: 26, lit: true },
    // antessala do trono
    { type: 'waystone', tx: 22, ty: 4, cp: 'cp_trono', name: 'Antessala do Trono' },
    { type: 'chest', tx: 27, ty: 3, flag: 'chest_fort_antessala', contents: [{ item: 'pluma' }, { item: 'pocao_grande' }], gold: 40 },
    { type: 'decor', kind: 'knightstatue', tx: 21, ty: 6 }, { type: 'decor', kind: 'knightstatue', tx: 28, ty: 6 },
  ],
  triggers: {
    fortaleza_inicio(g) { g.banter('fortaleza_inicio'); },
    fortaleza_trono(g) { g.banter('fortaleza_trono'); },
    secreto_fortaleza(g) { G.Audio.sfx('solved'); g.toast('Área secreta: o depósito de Hadrik!', 3); },
    salao(g) {
      if (g.flag('fort_salao')) return;
      const lead = g.players.filter((p) => p && !p.isDown).sort((a, b) => a.y - b.y)[0];
      g.regroup(lead);
      g.co.start(function* () {
        g.bubble(g.players[1], 'As armaduras... estão acordando!', 2.4);
        yield* G.LevelKit.arena(g, ['fort_a1', 'fort_a2', 'fort_n1', 'fort_n2'], [
          [['knight', 18, 16], ['knight', 31, 16]],
          [['icewisp', 20, 14], ['icewisp', 29, 14], ['knight', 24, 20, { armor: false }]],
          [['knight', 17, 22], ['knight', 32, 22], ['snowling', 24, 15], ['snowling', 25, 24]],
        ], { flag: 'fort_salao', inside: { x: 24 * 16, y: 20 * 16 } });
        for (const id of ['fort_a1', 'fort_a2']) { const gt = g.entities.find((e) => e.id === id); if (gt) gt.setOpen(true, g, true); }
        g.bubble(g.players[0], 'O caminho para o trono está aberto.', 2.4);
        g.save();
      }, g, { blocking: false, name: 'salao' });
    },
  },
  onEnter(g) {
    for (const id of ['fort_a1', 'fort_a2']) { const gt = g.entities.find((e) => e.id === id); if (gt) gt.setOpen(true, g, true); }
  },
  scripts: {
    *seloOeste(g) {
      g.setFlag('sig_selo_oeste', true);
      G.Audio.sfx('solved');
      g.toast('O Selo das Chamas se acendeu!', 3);
      g.showEvent(24 * 16, 29 * 16);
    },
    seloOesteLoad(g) { g.setFlag('sig_selo_oeste', true); },
    *seloLeste(g) {
      g.setFlag('sig_selo_leste', true);
      for (const x of [42, 43]) g.level.setTile(x, 20, '_');
      G.Audio.sfx('push'); g.camera.shake(2, 0.2);
      g.toast('O Selo das Asas se acendeu! Um vão se abriu no muro.', 3);
      g.showEvent(24 * 16, 29 * 16);
    },
    seloLesteLoad(g) { g.setFlag('sig_selo_leste', true); for (const x of [42, 43]) g.level.setTile(x, 20, '_'); },
  },
});
