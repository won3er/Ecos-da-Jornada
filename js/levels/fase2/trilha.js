// CAPÍTULO II — Trilha Gelada: a primeira neve, o lago congelado (gelo
// escorrega), a MEMÓRIA da primeira neve (ensina a Chama Estelar) e a parede
// de gelo que só o fogo derrete. Segredo: dois braseiros que pedem fogo.
G.defineArea({
  id: 'trilha',
  title: 'Trilha Gelada',
  theme: 'snow',
  music: 'snow',
  ambience: 'snow',
  ambient: 'snow',
  size: [64, 30],
  seed: 71,
  build(b) {
    b.border('P', 2, 3, [[27, 26, 4, 4], [61, 3, 3, 6]]);
    b.scatter(3, 3, 58, 24, 'P', 0.05);
    b.scatter(3, 3, 58, 24, 'r', 0.015);
    // trilha principal
    b.path([[28, 29], [28, 22], [20, 22]], ':', 2);
    b.path([[5, 22], [20, 22]], ':', 2);
    b.rect(4, 17, 2, 6, ':');
    // lago congelado (escorrega) com ilhota
    b.ellipse(40, 21, 9, 4.2, 'i');
    b.set(40, 21, 'r');
    b.path([[30, 22], [31, 22]], ':', 2);
    b.path([[49, 22], [52, 22], [52, 13]], ':', 2);
    // clareira da memória
    b.rect(30, 8, 12, 6, '.');
    b.path([[36, 14], [36, 18]], ':', 2);
    b.rect(36, 14, 18, 2, ':');
    b.rect(50, 14, 3, 6, ':');
    // falésia e a parede de gelo (só fogo derrete)
    b.rect(43, 0, 2, 13, 'X');
    b.rect(43, 13, 21, 1, 'X');
    b.rect(42, 9, 1, 2, ':');
    b.set(43, 9, 'I'); b.set(43, 10, 'I'); b.set(44, 9, 'I'); b.set(44, 10, 'I');
    // região nordeste
    b.rect(45, 3, 16, 9, '.');
    b.scatter(46, 3, 14, 9, 'P', 0.06);
    b.path([[45, 9], [58, 9], [58, 5], [63, 5]], ':', 2);
    // bosque secreto (dois braseiros que pedem fogo abrem o portão)
    b.rect(8, 4, 12, 8, '.');
    b.frame(7, 3, 14, 10, 'X');
    b.set(13, 12, ':'); b.set(14, 12, ':');
    b.rect(13, 13, 2, 4, ':');
    // limpa a trilha
    b.replace('Pr', ':', 4, 17, 2, 6);
    b.replace('Pr', '.', 3, 20, 48, 5);
    b.replace('Pr', '.', 29, 7, 14, 8);
  },
  spawns: { sul: [28, 27], start: [28, 27], leste: [60, 5] },
  spawnDir: 'up',
  exits: [
    { x: 27, y: 29, w: 4, to: 'vila', spawn: 'norte' },
    { x: 63, y: 3, h: 5, to: 'pedra_alta', spawn: 'oeste' },
  ],
  zones: [
    { x: 26, y: 22, w: 6, h: 2, trigger: 'trilha_inicio' },
    { x: 31, y: 18, w: 2, h: 7, trigger: 'trilha_lago' },
    { x: 38, y: 7, w: 4, h: 7, trigger: 'trilha_gelo' },
    { x: 54, y: 3, w: 2, h: 9, trigger: 'trilha_fim' },
    { x: 8, y: 4, w: 12, h: 7, trigger: 'secreto_trilha', flag: 'secret_trilha' },
  ],
  entities: [
    { type: 'sign', tx: 25, ty: 24, text: 'Montanhas de Gelvar. "Viajante: não ande sozinho na neve. Nunca."' },
    { type: 'waystone', tx: 24, ty: 20, cp: 'cp_trilha', name: 'Trilha Gelada' },
    { enemy: 'frostwolf', tx: 15, ty: 21 }, { enemy: 'snowling', tx: 10, ty: 24 }, { enemy: 'snowling', tx: 8, ty: 19 },
    { enemy: 'snowling', tx: 37, ty: 20 }, { enemy: 'snowling', tx: 44, ty: 23 }, { enemy: 'frostwolf', tx: 50, ty: 18 },
    { type: 'chest', tx: 41, ty: 21, flag: 'chest_trilha_lago', contents: [{ item: 'pocao_grande' }], gold: 20 },
    { type: 'bush', tx: 18, ty: 25 }, { type: 'bush', tx: 33, ty: 25 }, { type: 'bush', tx: 47, ty: 16 },
    // memória: o cachecol vermelho na placa
    { type: 'memory', memory: 'neve', look: 'scarf', tx: 35, ty: 9 },
    { type: 'sign', tx: 33, ty: 12, text: 'Uma cabana desabada. Na placa, um cachecol vermelho, desbotado e duro de frio.' },
    { type: 'sign', tx: 41, ty: 11, text: 'A passagem está fechada por gelo azul, liso como vidro. Não é gelo comum.' },
    { enemy: 'frostwolf', tx: 31, ty: 10, cond: (g) => g.memories.has('neve') },
    // nordeste
    { enemy: 'icewisp', tx: 50, ty: 6 }, { enemy: 'icewisp', tx: 55, ty: 10 }, { enemy: 'frostwolf', tx: 48, ty: 4 }, { enemy: 'snowling', tx: 57, ty: 4 },
    { type: 'waystone', tx: 59, ty: 8, cp: 'cp_trilha2', name: 'Fim da Trilha' },
    // segredo: braseiros que só acendem com fogo de verdade
    { type: 'brazier', id: 'br_t1', tx: 11, ty: 15, needsFire: true }, { type: 'brazier', id: 'br_t2', tx: 16, ty: 15, needsFire: true },
    { type: 'gate', id: 'gate_trilha', tx: 13, ty: 12, requires: ['br_t1', 'br_t2'], flag: 'trilha_bosque' },
    { type: 'gate', id: 'gate_trilha2', tx: 14, ty: 12, requires: ['br_t1', 'br_t2'], flag: 'trilha_bosque' },
    { type: 'sign', tx: 18, ty: 17, text: 'Dois braseiros de pedra, cobertos de geada. "Só a chama das estrelas acende o que o inverno apagou."' },
    { type: 'chest', tx: 13, ty: 6, flag: 'chest_trilha_secreto', contents: [{ item: 'pagina_diario' }], gold: 30, fancy: true },
    { type: 'pickup', item: 'eter', tx: 17, ty: 9, flag: 'trilha_eter' },
  ],
  triggers: {
    trilha_inicio(g) { g.banter('trilha_inicio'); },
    trilha_lago(g) { g.banter('trilha_lago'); },
    trilha_gelo(g) {
      if (g.memories.has('neve')) return;
      g.banter('trilha_gelo');
    },
    trilha_fim(g) { g.banter('trilha_fim'); },
    secreto_trilha(g) { G.Audio.sfx('solved'); g.toast('Área secreta: o Bosque das Brasas!', 3); },
  },
  scripts: {
    *afterMemory_neve(g) {
      if (!g.unlockedSpells.includes('fire')) g.unlockedSpells.push('fire');
      g.players[0].spell = 'fire';
      yield G.Co.wait(0.5);
      yield g.say([
        { who: 'aldren', text: 'Foi você. Naquela nevasca. As luzes no caminho.' },
        { who: 'lirien', text: 'Você estava azul de frio e ainda segurava aquele cachecol.' },
        { who: 'aldren', text: 'Era o seu! Você esqueceu na vila!' },
        { who: 'lirien', text: '...Eu deixei de propósito. Para você.' },
        { who: 'aldren', text: 'Você nunca me contou.' },
        { who: 'lirien', text: 'Você nunca perguntou. E eu lembrei da chama. Ela ainda funciona.' },
      ]);
      g.toast('Nova magia: CHAMA ESTELAR! Troque com ' + G.Characters.lirien.keys.swap + ' e lance com ' + G.Characters.lirien.keys.skill + '. Acende, derrete gelo, queima espinhos e liberta quem está congelado.', 7);
      G.Audio.sfx('levelup');
      g.addPoints(1);
      g.save();
    },
  },
});
