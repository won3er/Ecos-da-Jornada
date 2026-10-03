// MEMÓRIAS JOGÁVEIS da Fase 1.
// "A Primeira Ponte": Lirien e o pequeno Aldren em Velmora, doze anos atrás.
// "A Promessa": a última noite, a colina e a chuva de estrelas.
G.defineArea({
  id: 'mem_ponte',
  title: 'Velmora, doze anos atrás',
  theme: 'memory',
  music: 'memory',
  ambience: 'wind',
  ambient: 'petals',
  combatMusic: false,
  size: [30, 18],
  seed: 51,
  build(b) {
    b.border('T', 1, 2);
    b.scatter(2, 2, 26, 14, ',', 0.08);
    b.rect(3, 10, 24, 6, '_');
    b.scatter(3, 10, 24, 6, '.', 0.15, '_');
    b.rect(1, 6, 28, 3, 'C');
    b.rect(10, 2, 10, 4, '_');
    b.set(9, 3, 'k'); b.set(20, 3, 'k'); b.set(5, 12, 'k'); b.set(24, 12, 'k');
  },
  spawns: { start: [12, 13] },
  entities: [
    { type: 'scriptobj', tx: 14, ty: 3, label: 'Pegar', script: 'pegarEspada', who: 'warrior', icon: 'woodsword', vanish: true },
    { type: 'sign', tx: 18, ty: 10, text: 'Velmora — doze anos atrás. As ruínas ainda tinham telhados.' },
  ],
  scripts: {
    *start(g) {
      const C = G.Co;
      const K = g.players[1], L = g.players[0];
      g.unlockedSpells = ['bridge']; L.spell = 'bridge';
      yield C.wait(0.4);
      yield g.say([
        { who: 'kid', text: 'Moça! Minha espada caiu lá do outro lado!' },
        { who: 'lirien', text: 'E?' },
        { who: 'kid', text: 'E eu preciso dela! Eu vou ser herói!' },
        { who: 'lirien', text: 'Heróis precisam de espadas de madeira?' },
        { who: 'kid', text: 'Todo herói começa com uma!' },
      ]);
      // dois monstrinhos aparecem
      for (const [x, y] of [[6, 11], [22, 14]]) {
        const e = g.spawnEnemy('slime', x * 16 + 8, y * 16 + 14, { hpMul: 0.6 });
        if (e) { e.aggro = true; e.dmg = 3; }
      }
      yield g.say([{ who: 'lirien', text: 'Fique atrás de mim.' }, { who: 'kid', text: 'Eu também luto!' }]);
      yield g.waitClear();
      yield C.wait(0.5);
      yield g.say([
        { who: 'kid', text: 'Viu? Eu ajudei!' },
        { who: 'lirien', text: 'Viu. ...Agora, a espada.' },
      ]);
      g.toast('Lirien: fique na beira do abismo e SEGURE ' + G.Characters.lirien.keys.skill + ' para erguer a Ponte Etérea. Ela só existe enquanto você segura!', 7);
      yield C.until(() => g.flag('mem_sword'));
      g.toast('Volte pela ponte!', 3);
      yield C.until(() => K.y > 10 * 16 + 4 && !K.isDown);
      yield C.wait(0.3);
      yield g.say([
        { who: 'kid', text: 'Peguei! Peguei! Você viu? Eu andei na luz!' },
        { who: 'kid', text: 'Você pode me ensinar magia?' },
        { who: 'lirien', text: 'Não.' },
        { who: 'kid', text: 'Por quê?' },
        { who: 'lirien', text: 'Você é humano. Levaria cem anos.' },
        { who: 'kid', text: 'Então eu vou ser espadachim! O maior herói do mundo!' },
        { who: 'lirien', text: '...Hum. Veremos.' },
      ]);
      g.endMemory();
    },
    *pegarEspada(g) {
      g.setFlag('mem_sword', true);
      G.Audio.sfx('pickup');
      g.bubble(g.players[1], 'Minha espada!', 1.6);
    },
  },
});

G.defineArea({
  id: 'mem_promessa',
  title: 'A colina, doze anos atrás',
  theme: 'night',
  music: 'memory',
  ambience: 'night',
  ambient: 'fireflies',
  darkness: 0.5,
  darkColor: '#0a0c24',
  combatMusic: false,
  size: [30, 24],
  seed: 61,
  build(b) {
    b.border('T', 2, 3);
    b.scatter(3, 3, 24, 18, 'T', 0.08);
    b.scatter(2, 2, 26, 20, ',', 0.08);
    b.scatter(2, 2, 26, 20, ';', 0.08);
    b.path([[15, 22], [15, 18], [9, 18], [9, 12], [20, 12], [20, 7], [15, 7], [15, 4]], ':', 2);
    b.rect(11, 2, 9, 4, '.');
    b.rect(13, 22, 4, 2, ':');
    b.set(19, 3, 'T');
  },
  spawns: { start: [15, 21] },
  zones: [
    { x: 9, y: 16, w: 3, h: 3, trigger: 'p1' },
    { x: 18, y: 10, w: 3, h: 3, trigger: 'p2' },
    { x: 11, y: 2, w: 9, h: 4, trigger: 'topo' },
  ],
  entities: [{ type: 'decor', kind: 'campfire', tx: 13, ty: 4 }],
  triggers: {
    p1(g) {
      g.bubble(g.players[1], 'Mais rápido, Lirien!', 2);
      g.co.start(function* () { yield G.Co.wait(2.1); g.bubble(g.players[0], 'Estrelas não fogem.', 2); }, g, { blocking: false });
    },
    p2(g) {
      g.bubble(g.players[1], 'Você já viu mil chuvas de estrelas?', 2.4);
      g.co.start(function* () {
        yield G.Co.wait(2.5); g.bubble(g.players[0], 'Quatrocentas e doze.', 2);
        yield G.Co.wait(2.1); g.bubble(g.players[1], 'Hoje eu vejo a minha primeira!', 2.2);
      }, g, { blocking: false });
    },
    topo(g) { g.co.start(G.Areas.mem_promessa.scripts.topo, g, { name: 'topo' }); },
  },
  onUpdate(g, dt) {
    if (g.flag('meteoros') && Math.random() < dt * 6) {
      const cam = g.camera;
      const x = cam.x + U_rand(60, G.VIEW_W + 80), y = cam.y + U_rand(-10, 60);
      for (let i = 0; i < 8; i++) g.particles.add({ x: x + i * 3, y: y - i * 1.5, vx: -150, vy: 75, life: 0.9 - i * 0.06, color: i < 2 ? '#ffffff' : '#f2d98c', glow: true });
    }
  },
  scripts: {
    *topo(g) {
      const C = G.Co;
      const L = g.players[0], K = g.players[1];
      g.letterbox(true);
      // espera o outro chegar
      yield C.wait(0.3);
      yield C.all(g.walkTo(L, 14 * 16, 5 * 16 + 4, 40), g.walkTo(K, 16 * 16, 5 * 16 + 4, 40));
      L.dir = 'up'; K.dir = 'up';
      g.setFlag('meteoros', true);
      yield g.camTo(15 * 16, 3 * 16, 2);
      yield C.wait(2);
      yield g.say([
        { who: 'kid', text: 'Uau...' },
        { who: 'kid', text: 'Amanhã você vai embora?' },
        { who: 'lirien', text: 'Vou.' },
        { who: 'kid', text: 'Quando você volta?' },
        { who: 'lirien', text: 'Logo.' },
        { who: 'kid', text: 'Logo quanto?' },
        { who: 'lirien', text: 'Para um elfo... logo.' },
        { who: 'kid', text: 'Então eu vou ficar forte até lá. Muito forte. E aí eu vou junto com você.' },
        { who: 'lirien', text: 'Humanos esquecem promessas.' },
        { who: 'kid', text: 'Eu não vou esquecer. Prometo pelas estrelas.' },
        { who: 'lirien', text: 'Elas também caem, sabia?' },
        { who: 'kid', text: 'Então prometo por você.' },
        { who: 'lirien', text: '...' },
      ]);
      yield C.wait(1.5);
      g.setFlag('meteoros', false);
      g.camRelease();
      g.letterbox(false);
      g.endMemory();
    },
  },
});

function U_rand(a, b) { return a + Math.random() * (b - a); }
