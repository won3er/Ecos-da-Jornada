// CAPÍTULO II — Sala do Trono Congelado: a luta contra Ysveth, a Geada Eterna.
// Braseiros nos cantos (o calor protege da Parada do Tempo) e, na fase final,
// um muro de gelo diante do trono que só se cruza com o ARREMESSO.
G.defineArea({
  id: 'trono',
  title: 'Sala do Trono Congelado',
  theme: 'fortress',
  music: null,
  ambience: 'hall',
  ambient: 'snow',
  darkness: 0.35,
  darkColor: '#0a1022',
  combatMusic: false,
  size: [32, 26],
  seed: 131,
  fill: '#',
  build(b) {
    b.rect(3, 9, 26, 14, '_');
    b.rect(14, 9, 4, 14, 'q');
    b.rect(11, 3, 11, 6, 'q');
    b.rect(15, 23, 2, 3, '_');
    for (const [x, y] of [[4, 10], [27, 10], [4, 21], [27, 21]]) b.set(x, y, 'k');
  },
  spawns: { sul: [15, 22], start: [15, 22] },
  spawnOffset: [[-4, 0], [12, 0]],
  spawnDir: 'up',
  throne: { x: 16 * 16 + 8, y: 6 * 16 + 4 },
  exits: [{ x: 15, y: 25, w: 2, to: 'fortaleza', spawn: 'norte' }],
  zones: [{ x: 3, y: 9, w: 26, h: 12, trigger: 'ysvethStart' }],
  entities: [
    { type: 'decor', kind: 'throne', tx: 16, ty: 3, offset: [0, 0] },
    { enemy: 'ysveth', tx: 16, ty: 6, flag: 'ysveth_dead' },
    { type: 'light', tx: 16, ty: 12, r: 190, a: 0.4, color: '#7ab8e8' },
    { type: 'brazier', tx: 6, ty: 11, needsFire: true, burnTime: 16 }, { type: 'brazier', tx: 25, ty: 11, needsFire: true, burnTime: 16 },
    { type: 'brazier', tx: 6, ty: 20, needsFire: true, burnTime: 16 }, { type: 'brazier', tx: 25, ty: 20, needsFire: true, burnTime: 16 },
    { type: 'gate', id: 'ys_g1', tx: 15, ty: 23, flag: 'ysveth_dead', latch: false },
    { type: 'gate', id: 'ys_g2', tx: 16, ty: 23, flag: 'ysveth_dead', latch: false },
    { type: 'warppad', tx: 12, ty: 6, to: [15, 13], label: 'Voltar ao salão' },
    { type: 'decor', kind: 'banner', tx: 9, ty: 8, color: '#2a4a8a' }, { type: 'decor', kind: 'banner', tx: 23, ty: 8, color: '#2a4a8a' },
  ].concat(Array.from({ length: 11 }, (_, i) => ({ type: 'throneice', id: 'throne_ice', tx: 11 + i, ty: 8 }))),
  onEnter(g) {
    for (const id of ['ys_g1', 'ys_g2']) { const gt = g.entities.find((e) => e.id === id); if (gt) gt.setOpen(true, g, true); }
    g.boss = g.entities.find((e) => e.type === 'ysveth');
    if (g.boss) g.boss.center = { x: 16 * 16 + 8, y: 15 * 16 };
    if (g.flag('ysveth_dead')) G.Audio.playMusic('fortress', 1);
  },
  triggers: {
    ysvethStart(g) { if (!g.flag('ysveth_dead')) g.co.start(G.Scenes.ysvethIntro, g, { name: 'ysvethIntro' }); },
  },
  scripts: {
    *ysvethPhase2(g) {
      g.bubble(g.players[0], 'O ar está parando... ela vai congelar o tempo!', 2.6);
      yield G.Co.wait(2.7);
      g.bubble(g.players[1], 'Os braseiros! Fica perto do fogo!', 2.4);
    },
    *ysvethPhase3(g) {
      g.bubble(g.players[1], 'Ela fugiu para o trono! E ergueu um muro!', 2.6);
      yield G.Co.wait(2.7);
      g.bubble(g.players[0], 'A ampulheta... é o coração dela. Aldren — me joga.', 2.8);
      yield G.Co.wait(2.9);
      g.bubble(g.players[1], 'Com prazer!', 1.6);
    },
    *ysvethGrounded(g) {
      g.bubble(g.players[0], 'Agora, Aldren! Juntos!', 2);
    },
    *ysvethDefeated(g) { yield* G.Scenes.ysvethDefeated(g); },
  },
});
