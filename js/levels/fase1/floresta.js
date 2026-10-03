// FASE 1 — Bosque Sussurrante: rio congelável (Geada), fogos-fátuos (imunes à
// espada), Portão dos Gêmeos (sincronização), bosque secreto (ilusão + tronco),
// clareira do Lobo Cinzento (missão) e as Flores-de-Orvalho.
G.defineArea({
  id: 'floresta',
  title: 'Bosque Sussurrante',
  theme: 'forest',
  music: 'forest',
  ambience: 'forest',
  ambient: 'leaves',
  rays: true,
  tint: '#e4f0dc',
  size: [56, 44],
  seed: 11,
  build(b) {
    b.border('P', 2, 4, [[0, 34, 4, 5], [24, 0, 8, 4]]);
    // vegetação densa
    b.scatter(2, 14, 18, 28, 'T', 0.14);
    b.scatter(23, 26, 31, 16, 'T', 0.1);
    b.scatter(23, 14, 31, 10, 'P', 0.1);
    b.scatter(16, 2, 38, 10, 'P', 0.08);
    b.scatter(2, 2, 52, 40, ';', 0.06);
    b.scatter(2, 2, 52, 40, 'M', 0.02);
    b.scatter(2, 2, 52, 40, ',', 0.03);
    // rio e muralhas de sebe
    b.rect(20, 12, 3, 32, 'W');
    b.rect(0, 12, 20, 2, 'h');
    b.rect(23, 24, 33, 2, 'h');
    b.set(38, 24, '.'); b.set(38, 25, '.');
    // trilhas
    b.rect(0, 35, 20, 2, ':');
    b.path([[23, 35], [31, 35], [31, 27]], ':', 2);
    b.rect(31, 27, 17, 2, ':');
    b.rect(38, 26, 2, 2, ':');
    b.rect(38, 13, 2, 11, ':');
    b.path([[24, 12], [38, 12]], ':', 2);
    b.path([[26, 0], [26, 12]], ':', 2);
    b.rect(16, 7, 10, 2, ':');
    // clareira do lobo
    b.ellipse(48.5, 7, 6, 4.5, '.', '.;,TPM');
    b.scatter(43, 3, 12, 9, ',', 0.08);
    // margem do rio limpa (para o gelo)
    b.rect(17, 14, 3, 28, '.'); b.rect(23, 26, 3, 16, '.');
    b.rect(17, 34, 3, 4, ':'); b.rect(23, 34, 3, 3, ':');
    // bosque secreto
    b.rect(3, 3, 12, 8, '.');
    b.frame(2, 2, 14, 10, 'h');
    b.set(15, 7, '.');
    b.scatter(3, 3, 12, 8, ',', 0.25);
    b.set(5, 4, '.'); b.set(8, 4, '.'); b.set(12, 9, '.');
    // laguinho dos fogos-fátuos
    b.ellipse(51, 38, 2.5, 1.6, 'W');
    // clareira do portão e do santuário de pedra
    b.rect(34, 14, 10, 8, '.');
    b.rect(38, 13, 2, 11, ':');
    b.rect(27, 26, 22, 4, '.'); b.rect(31, 27, 17, 2, ':');
  },
  spawns: { oeste: [2, 36], norte: [26, 3], start: [2, 36] },
  exits: [
    { x: 0, y: 34, h: 5, to: 'estrada', spawn: 'leste' },
    { x: 24, y: 0, w: 8, to: 'ruinas', spawn: 'sul' },
  ],
  zones: [
    { x: 4, y: 33, w: 1, h: 6, trigger: 'floresta_inicio' },
    { x: 15, y: 33, w: 1, h: 6, trigger: 'floresta_rio' },
    { x: 36, y: 26, w: 4, h: 3, trigger: 'floresta_gemeos' },
    { x: 3, y: 3, w: 12, h: 8, trigger: 'bosque_secreto', flag: 'secret_bosque' },
    { x: 43, y: 4, w: 2, h: 7, trigger: 'clareira' },
  ],
  entities: [
    { type: 'sign', tx: 16, ty: 34, text: 'Rio Sussurrante. Fundo e gelado. Muito gelado... gelado o bastante para virar chão?' },
    { enemy: 'slime', tx: 8, ty: 30 }, { enemy: 'slime', tx: 11, ty: 38 }, { enemy: 'wolf', tx: 13, ty: 24 }, { enemy: 'slime', tx: 6, ty: 20 },
    { type: 'bush', tx: 9, ty: 33 }, { type: 'bush', tx: 3, ty: 40 }, { type: 'bush', tx: 17, ty: 18 },
    // lado leste, sul
    { type: 'pickup', item: 'flor_orvalho', tx: 24, ty: 40, flag: 'flor1' },
    { enemy: 'wolf', tx: 30, ty: 33 }, { enemy: 'wisp', tx: 42, ty: 31 }, { enemy: 'slime', tx: 35, ty: 38 },
    { enemy: 'wisp', tx: 48, ty: 34 }, { enemy: 'wisp', tx: 53, ty: 35 },
    { type: 'pickup', item: 'flor_orvalho', tx: 51, ty: 35, flag: 'flor2' },
    // Portão dos Gêmeos (sincronização: alavanca + cristal ao mesmo tempo)
    { type: 'lever', id: 'gem_lever', tx: 29, ty: 27, momentary: 1.6, flag: 'floresta_gemeos' },
    { type: 'crystal', id: 'gem_crystal', tx: 48, ty: 27, momentary: 1.6, flag: 'floresta_gemeos' },
    { type: 'gate', id: 'gem_gate', tx: 38, ty: 25, requires: ['gem_lever', 'gem_crystal'], flag: 'floresta_gemeos' },
    { type: 'sign', tx: 36, ty: 27, text: 'Portão dos Gêmeos. "Duas chaves, um só instante. Uma puxa, a outra brilha."' },
    // norte-leste
    { type: 'waystone', tx: 41, ty: 17, cp: 'cp_floresta' },
    { type: 'decor', kind: 'statue', tx: 36, ty: 16 },
    { enemy: 'wolf', tx: 30, ty: 15 }, { enemy: 'wisp', tx: 33, ty: 9 }, { enemy: 'slime', tx: 22, ty: 9 }, { enemy: 'wolf', tx: 18, ty: 5 },
    // clareira do Lobo Cinzento (missão)
    { enemy: 'greywolf', tx: 49, ty: 6, flag: 'lobo_dead' },
    { type: 'sign', tx: 42, ty: 7, text: 'Marcas de garras enormes no tronco. Algo grande vive na clareira.' },
    // bosque secreto: parede ilusória (Telecinese revela) + tronco (Aldren empurra)
    { type: 'hiddenwall', tx: 15, ty: 7, flag: 'bosque_ilusao', wall: 'hedge' },
    { type: 'crate', tx: 14, ty: 7 },
    { type: 'sign', tx: 17, ty: 9, text: 'A sebe aqui parece... perfeita demais. Como se alguém a tivesse imaginado.' },
    { type: 'pickup', item: 'flor_orvalho', tx: 5, ty: 4, flag: 'flor3' },
    { type: 'memory', memory: 'fita', look: 'ribbon', tx: 8, ty: 4 },
    { type: 'pickup', item: 'pagina', tx: 12, ty: 9, flag: 'pagina3' },
    { type: 'chest', tx: 4, ty: 9, flag: 'chest_bosque', contents: [{ item: 'eter' }], gold: 20 },
  ],
  triggers: {
    floresta_inicio(g) { g.banter('floresta_inicio'); },
    floresta_rio(g) {
      g.banter('floresta_rio');
      if (!g.flag('tut_ice')) g.toast('Lirien: use Geada (' + G.Characters.lirien.keys.skill + ') perto da água.', 4);
    },
    floresta_gemeos(g) { g.banter('floresta_gemeos'); },
    bosque_secreto(g) { G.Audio.sfx('solved'); g.toast('Área secreta encontrada: o Bosque Escondido!', 3); },
    clareira(g) {
      if (g.flag('lobo_dead')) return;
      g.bubble(g.players[1], 'É ele. O lobo do Bram.', 2.2);
    },
  },
  onEnter(g) {
    if (!g.flag('tut_tk_hint') && g.memories.size === 0) { /* dica dada pela placa da sebe */ }
  },
});
