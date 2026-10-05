// CAPÍTULO III — Velmora Desperta: a cidade dos magos à noite, com fantasmas
// (loja do Cássio, Elian e a missão do cajado), a MEMÓRIA da queda de Velmora
// (ensina o Salto do Herói) e o primeiro feixe de luz que abre a torre.
G.defineArea({
  id: 'velmora_noite',
  title: 'Velmora Desperta',
  theme: 'ruins',
  music: 'tower',
  ambience: 'void',
  ambient: 'sparkles',
  darkness: 0.5,
  darkColor: '#080a20',
  tint: '#d8d4f0',
  size: [50, 40],
  seed: 151,
  fill: '_',
  build(b) {
    b.scatter(1, 1, 48, 38, 'R', 0.05, '_');
    b.scatter(1, 1, 48, 38, ',', 0.03, '_');
    b.frame(0, 0, 50, 40, '#');
    b.rect(0, 30, 1, 2, '_');
    // ruínas de casas (muros baixos) e colunas
    b.scatter(2, 2, 46, 36, 'k', 0.025, '_R,');
    b.frame(3, 4, 8, 6, 'b'); b.set(6, 9, '_');
    b.frame(3, 14, 7, 5, 'b'); b.set(9, 16, '_');
    b.frame(38, 24, 9, 7, 'b');                // cercado da constelação (só arremessando)
    // abismo curto (só o Salto atravessa)
    b.rect(36, 6, 2, 9, 'C');
    b.rect(38, 4, 11, 2, '#'); b.rect(38, 15, 11, 1, '#');
    // base da torre (norte)
    b.rect(18, 1, 14, 2, '#');
    b.rect(24, 0, 2, 3, 'z');
    b.rect(18, 3, 14, 10, '_');
    b.frame(17, 2, 16, 12, '#');
    b.rect(24, 13, 2, 1, '_');
    b.rect(24, 2, 2, 1, 'z');
    // praça central
    b.rect(18, 15, 16, 10, '_');
    b.replace('k', '_', 17, 2, 16, 24);
    b.replace('k', '_', 19, 26, 14, 12);
    b.replace('k', '_', 0, 28, 8, 5);
    b.replace('k', '_', 37, 23, 11, 9);
    b.replace('kR', '_', 38, 6, 10, 9);
  },
  spawns: { oeste: [2, 30], start: [2, 30], norte: [24, 4] },
  exits: [
    { x: 0, y: 30, h: 2, to: 'ruinas', spawn: 'leste' },
    { x: 24, y: 0, w: 2, to: 'torre_espelhos', spawn: 'sul' },
  ],
  zones: [
    { x: 3, y: 28, w: 2, h: 5, trigger: 'velmora_inicio' },
    { x: 18, y: 14, w: 16, h: 2, trigger: 'velmora_torre' },
  ],
  entities: [
    // acampamento dos fantasmas
    { type: 'waystone', tx: 22, ty: 33, cp: 'cp_velmora', name: 'Velmora Desperta' },
    { npc: 'cassio', tx: 26, ty: 31 },
    { npc: 'elian', tx: 30, ty: 29 },
    { type: 'decor', kind: 'campfire', tx: 28, ty: 33, light: '#9ab8ff' },
    { type: 'decor', kind: 'tent', tx: 31, ty: 34 },
    { type: 'sign', tx: 20, ty: 30, text: 'Uma placa nova num lugar velho: "Acampamento dos que ficaram. Vivos, sejam bem-vindos."' },
    // praça: a memória
    { type: 'memory', memory: 'velmora', look: 'crown', tx: 26, ty: 19 },
    { type: 'decor', kind: 'statue', tx: 21, ty: 17 }, { type: 'decor', kind: 'statue', tx: 31, ty: 17 },
    { enemy: 'starling', tx: 20, ty: 22 }, { enemy: 'starling', tx: 32, ty: 22 }, { enemy: 'voidknight', tx: 14, ty: 26 },
    { enemy: 'starling', tx: 8, ty: 33 }, { enemy: 'voidknight', tx: 40, ty: 34 }, { enemy: 'sentry', tx: 12, ty: 11 },
    { enemy: 'starling', tx: 44, ty: 20 },
    // casas em ruínas
    { type: 'chest', tx: 6, ty: 6, flag: 'chest_velmora1', contents: [{ item: 'pocao_grande' }], gold: 40 },
    { type: 'chest', tx: 5, ty: 16, flag: 'chest_velmora2', contents: [{ item: 'eter' }, { item: 'tonico' }], gold: 30 },
    // constelação 1: cercado de muro baixo (arremesso)
    { type: 'pickup', item: 'constelacao', tx: 42, ty: 27, flag: 'const1' },
    { type: 'sign', tx: 36, ty: 27, text: 'Um jardim cercado por mureta. Algo brilha lá dentro como um pedaço de céu.' },
    // constelação 2: além do abismo curto (Salto do Herói)
    { type: 'pickup', item: 'constelacao', tx: 44, ty: 10, flag: 'const2' },
    { type: 'sign', tx: 34, ty: 9, text: 'Um vão no chão, estreito. Um bom pulo resolveria.' },
    // a torre: feixe de luz + memória
    { type: 'emitter', tx: 19, ty: 9, dir: 'right' },
    { type: 'mirror', tx: 27, ty: 9, orient: 1 },
    { type: 'receptor', id: 'rc_torre', tx: 27, ty: 5, flag: 'torre_luz' },
    { type: 'gate', id: 'torre_g1', tx: 24, ty: 2, requires: ['rc_torre', 'mem_velmora'], flag: 'torre_aberta' },
    { type: 'gate', id: 'torre_g2', tx: 25, ty: 2, requires: ['rc_torre', 'mem_velmora'], flag: 'torre_aberta' },
    { type: 'sign', tx: 22, ty: 11, text: 'Na porta da torre: "Abre-se à luz devolvida... e a quem lembra do que aconteceu aqui."' },
  ],
  triggers: {
    velmora_inicio(g) { g.banter('velmora_inicio'); },
    velmora_torre(g) { g.banter('velmora_torre'); },
  },
  onEnter(g) { if (g.memories.has('velmora')) g.setFlag('sig_mem_velmora', true); },
  scripts: {
    *afterMemory_velmora(g) {
      g.setFlag('sig_mem_velmora', true);
      yield G.Co.wait(0.5);
      yield g.say([
        { who: 'aldren', text: '...Ele se parecia comigo.' },
        { who: 'lirien', text: 'Sir Talen. Seu tataravô do tataravô, talvez. Humanos se repetem.' },
        { who: 'aldren', text: 'E o seu mestre... ficou lá dentro. Selando aquilo.' },
        { who: 'lirien', text: 'Trezentos anos. E a estrela está acordando de novo.' },
        { who: 'lirien', text: 'Eu fugi daquele dia por três séculos, Aldren. Desta vez eu não fujo.' },
        { who: 'aldren', text: 'Desta vez você não está sozinha.' },
        { who: 'aldren', text: 'E eu vi como o Talen pulava. Acho que consigo.' },
      ]);
      g.abilities.add('salto');
      G.Audio.sfx('levelup');
      g.toast('Nova técnica do Aldren: SALTO DO HERÓI! Faça a investida (' + G.Characters.aldren.keys.act + ') na beira de um vão curto de abismo ou água para pular.', 7);
      g.addPoints(1);
      g.save();
    },
  },
});
