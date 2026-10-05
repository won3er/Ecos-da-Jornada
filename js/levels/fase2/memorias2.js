// MEMÓRIA JOGÁVEL do Capítulo II — "A Primeira Neve".
// Doze anos atrás: o pequeno Aldren se perde na nevasca seguindo a Lirien.
// Ela acende braseiros de luz estelar para guiá-lo (ensina a Chama Estelar).
G.defineArea({
  id: 'mem_neve',
  title: 'A montanha, doze anos atrás',
  theme: 'snow',
  music: 'memory',
  ambience: 'blizzard',
  ambient: 'blizzard',
  darkness: 0.62,
  darkColor: '#0a0c24',
  combatMusic: false,
  size: [34, 22],
  seed: 141,
  fill: 'P',
  build(b) {
    // trecho 1 (braseiro abre o portão)
    b.rect(3, 15, 8, 5, '.');
    b.rect(9, 13, 2, 2, ':');
    // trecho 2 (parede de gelo a leste)
    b.rect(8, 9, 8, 4, '.');
    b.rect(16, 10, 1, 2, 'I');
    // trecho 3 (espinhos ao norte)
    b.rect(17, 9, 7, 5, '.');
    b.rect(22, 6, 2, 3, ':');
    // trecho 4 (a cabana)
    b.rect(19, 2, 12, 4, '.');
    b.scatter(4, 16, 6, 3, ',', 0.2, '.');
  },
  spawns: { start: [5, 18] },
  winds: [{ x: 2, y: 2, w: 30, h: 18, dx: 1, dy: 0.3, force: 40, gust: true, gustSpeed: 0.9 }],
  entities: [
    { type: 'brazier', id: 'mb1', tx: 8, ty: 16, needsFire: true },
    { type: 'gate', id: 'mg1', tx: 9, ty: 14, requires: ['mb1'] }, { type: 'gate', id: 'mg2', tx: 10, ty: 14, requires: ['mb1'] },
    { type: 'brazier', id: 'mb2', tx: 19, ty: 12, needsFire: true },
    { type: 'thorns', tx: 22, ty: 7, requires: ['mb2'] }, { type: 'thorns', tx: 23, ty: 7 },
    { type: 'brazier', id: 'mb3', tx: 21, ty: 3, needsFire: true },
    { type: 'decor', kind: 'house', tx: 26, ty: 3, w: 4, h: 3, roof: '#d8e4f0', wall: '#a89070', chimney: false },
    { type: 'sign', tx: 4, ty: 16, text: 'Neve até os joelhos. Em algum lugar à frente, uma criança chora.' },
  ],
  zones: [{ x: 26, y: 4, w: 4, h: 2, trigger: 'cabana' }],
  triggers: {
    cabana(g) {
      if (!g.signalOn('mb3')) { g.bubble(g.players[0], 'Primeiro a luz. Ele precisa ver o caminho de volta.', 2.6); g.level.triggers.forEach((t) => { if (t.name === 'cabana') t.fired = false; }); return; }
      g.co.start(G.Areas.mem_neve.scripts.fim, g, { name: 'memFim' });
    },
  },
  scripts: {
    *start(g) {
      const C = G.Co;
      g.unlockedSpells = ['fire']; g.players[0].spell = 'fire';
      yield C.wait(0.4);
      yield g.say([
        { who: 'kid', text: 'Lirien! LIRIEN! Cadê você?' },
        { who: 'lirien', text: 'Aldren? O que você está fazendo na montanha?' },
        { who: 'kid', text: 'Eu te segui! Você saiu sem dizer tchau de novo!' },
        { who: 'kid', text: 'Aí veio a neve e... eu não sei voltar.' },
        { who: 'lirien', text: '...Fique perto. Eu faço luz.' },
      ]);
      g.toast('Lirien: lance a CHAMA ESTELAR (' + G.Characters.lirien.keys.skill + ') nos braseiros, no gelo e nos espinhos. O vento empurra — andem juntos!', 7);
      for (const [x, y] of [[12, 10], [25, 4]]) { const e = g.spawnEnemy('frostwolf', x * 16 + 8, y * 16 + 14, { hpMul: 0.5 }); if (e) e.dmg = 4; }
      yield C.until(() => g.signalOn('mb1'));
      g.bubble(g.players[1], 'Tá quentinho!', 1.6);
      yield C.until(() => g.signalOn('mb2'));
      g.bubble(g.players[1], 'Eu tô vendo o caminho!', 1.8);
    },
    *fim(g) {
      const C = G.Co;
      const [L, K] = g.players;
      g.letterbox(true);
      yield C.all(g.walkTo(L, 27 * 16, 5 * 16 + 4, 40), g.walkTo(K, 28 * 16 + 8, 5 * 16 + 4, 40));
      L.dir = 'up'; K.dir = 'up';
      yield C.wait(0.6);
      yield g.say([
        { who: 'kid', text: 'Você sempre vai embora sem dizer tchau.' },
        { who: 'lirien', text: 'Dizer tchau faz parecer que é para sempre.' },
        { who: 'kid', text: 'E não é?' },
        { who: 'lirien', text: 'Para um elfo, nada é para sempre. Nem ir embora.' },
        { who: 'kid', text: 'Atchim! Então... você volta?' },
        { who: 'lirien', text: 'Toma. Meu cachecol. Ele lembra o caminho de volta.' },
        { who: 'kid', text: 'Cachecol não lembra nada, Lirien.' },
        { who: 'lirien', text: 'Esse lembra.' },
      ]);
      yield C.wait(0.8);
      g.letterbox(false);
      g.endMemory();
    },
  },
});
