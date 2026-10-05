// CAPÍTULO II — Pedra-Alta: a vila dos mineradores, presa no gelo do tempo.
// Hub do capítulo: moradores congelados (Chama Estelar liberta), loja da Yara,
// forja do Hrolf, a memória do boneco de neve e um galpão secreto.
G.defineArea({
  id: 'pedra_alta',
  title: 'Pedra-Alta',
  theme: 'snow',
  music: 'camp',
  ambience: 'snow',
  ambient: 'snow',
  combatMusic: false,
  size: [46, 34],
  seed: 83,
  build(b) {
    b.border('P', 2, 3, [[0, 12, 3, 6]]);
    b.scatter(3, 3, 38, 28, 'P', 0.03);
    // falésia leste com a porta da mina
    b.rect(42, 0, 4, 34, 'X');
    b.rect(42, 19, 4, 2, ':');
    // praça e ruas
    b.rect(15, 13, 16, 8, 'p');
    b.path([[0, 15], [15, 15]], ':', 2);
    b.path([[31, 19], [45, 19]], ':', 2);
    b.rect(8, 15, 2, 6, ':');
    b.rect(17, 21, 2, 5, ':');
    b.rect(28, 21, 2, 3, ':');
    b.rect(35, 13, 2, 6, ':');
    // jardim do boneco (sudoeste)
    b.rect(3, 26, 7, 5, '.');
    b.rect(10, 27, 6, 2, ':');
    // galpão secreto (sudeste): só se entra derretendo o gelo
    b.frame(37, 25, 5, 6, '#');
    b.set(39, 25, ':');
    b.rect(38, 26, 3, 4, '_');
    b.replace('P', '.', 14, 12, 18, 10);
    b.replace('P', '.', 2, 13, 14, 4);
    b.replace('P', '.', 31, 18, 11, 3);
  },
  spawns: { oeste: [2, 15], start: [2, 15], leste: [40, 19] },
  exits: [
    { x: 0, y: 12, h: 6, to: 'trilha', spawn: 'leste' },
    { x: 45, y: 19, h: 2, to: 'minas', spawn: 'oeste' },
  ],
  zones: [
    { x: 4, y: 12, w: 2, h: 6, trigger: 'pedra_inicio' },
    { x: 38, y: 26, w: 3, h: 4, trigger: 'secreto_pedra', flag: 'secret_pedra' },
  ],
  entities: [
    // casas (telhados nevados)
    { type: 'decor', kind: 'house', tx: 5, ty: 11, w: 5, h: 3, roof: '#c8d4e4', wall: '#d8c8b0', door: [{ who: 'sign', text: 'A casa de Isolde. Uma lareira apagada no meio de um estalo.' }] },
    { type: 'decor', kind: 'house', tx: 19, ty: 10, w: 5, h: 3, roof: '#d8e4f0', wall: '#c8b8a0', door: [{ who: 'sign', text: 'Casa de Garrik. Picaretas penduradas por todo lado.' }] },
    { type: 'decor', kind: 'house', tx: 33, ty: 11, w: 5, h: 3, roof: '#c8d4e4', wall: '#a89888', signColor: '#5a5a6a', door: [{ who: 'sign', text: 'A forja de Hrolf. A brasa dorme sob uma camada de gelo.' }] },
    { type: 'decor', kind: 'house', tx: 26, ty: 27, w: 5, h: 3, roof: '#d8e4f0', wall: '#c8c0b0', door: [{ who: 'sign', text: 'A casa do velho Holt. Uma armadura antiga guarda a porta.' }] },
    { type: 'decor', kind: 'house', tx: 22, ty: 30, w: 5, h: 3, roof: '#c8d4e4', wall: '#d8c8b0', door: [{ who: 'sign', text: 'A casa de Nessa e Tavi. Desenhos de ursos na janela.' }] },
    { type: 'decor', kind: 'tent', tx: 13, ty: 24 },
    { type: 'decor', kind: 'statue', tx: 23, ty: 16, text: [{ who: 'sign', text: 'Estátua do primeiro minerador de Pedra-Alta. Uma camada de gelo azul cobre o rosto.' }] },
    { type: 'decor', kind: 'barrel', tx: 15, ty: 22 }, { type: 'decor', kind: 'barrel', tx: 38, ty: 14 },
    { type: 'decor', kind: 'lamp', tx: 15, ty: 13 }, { type: 'decor', kind: 'lamp', tx: 30, ty: 13 }, { type: 'decor', kind: 'lamp', tx: 15, ty: 20 }, { type: 'decor', kind: 'lamp', tx: 30, ty: 20 },
    { type: 'brazier', tx: 19, ty: 14, needsFire: true }, { type: 'brazier', tx: 27, ty: 14, needsFire: true },
    { type: 'waystone', tx: 11, ty: 19, cp: 'cp_pedra', name: 'Pedra-Alta' },
    { type: 'sign', tx: 4, ty: 12, text: 'Pedra-Alta. "Cuidado: minas a leste. Fortaleza da Vigília ao norte, depois dos picos."' },
    // moradores congelados no tempo
    { type: 'frozen', who: 'isolde', tx: 9, ty: 17 },
    { type: 'frozen', who: 'garrik', tx: 21, ty: 12, facing: -1 },
    { type: 'frozen', who: 'nessa', tx: 25, ty: 22 },
    { type: 'frozen', who: 'holt', tx: 29, ty: 24, facing: -1 },
    { type: 'frozen', who: 'yara', tx: 15, ty: 25 },
    { type: 'frozen', who: 'hrolf', tx: 36, ty: 15, facing: -1 },
    { npc: 'tavi', tx: 27, ty: 22, cond: (g) => g.flag('thaw_tavi') },
    // porta da mina (Isolde destranca)
    { type: 'gate', id: 'mina_p1', tx: 43, ty: 19, requires: ['mina'], flag: 'mina_aberta' },
    { type: 'gate', id: 'mina_p2', tx: 43, ty: 20, requires: ['mina'], flag: 'mina_aberta' },
    { type: 'sign', tx: 40, ty: 17, text: 'Minas de Cristal. A porta está trancada por dentro do gelo... e por uma fechadura de ferro.' },
    // memória: o boneco de neve
    { type: 'memory', memory: 'boneco', look: 'snowman', tx: 5, ty: 28 },
    // galpão secreto: bloco de gelo na entrada
    { type: 'iceblock', tx: 39, ty: 25, flag: 'pedra_galpao' },
    { type: 'chest', tx: 39, ty: 27, flag: 'chest_pedra_galpao', contents: [{ item: 'pagina_diario' }, { item: 'cristal_gelido' }], gold: 25, fancy: true },
    { type: 'bush', tx: 6, ty: 23 }, { type: 'bush', tx: 34, ty: 23 },
  ],
  triggers: {
    pedra_inicio(g) { g.banter('pedra_inicio'); },
    secreto_pedra(g) { G.Audio.sfx('solved'); g.toast('Área secreta: o galpão congelado!', 3); },
  },
});
