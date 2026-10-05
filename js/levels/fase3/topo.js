// CAPÍTULO III — Câmara do Reflexo (Os Ecos), Coração do Céu (Nyxara) e o
// epílogo na colina.
G.defineArea({
  id: 'camara_ecos',
  title: 'Câmara do Reflexo',
  theme: 'tower',
  music: null,
  ambience: 'void',
  ambient: 'sparkles',
  darkness: 0.35,
  darkColor: '#0a0820',
  combatMusic: false,
  size: [30, 26],
  seed: 191,
  fill: '#',
  build(b) {
    b.rect(4, 6, 22, 15, 'z');
    b.rect(14, 21, 2, 5, 'z');
    b.rect(14, 4, 2, 2, 'z');
    b.rect(10, 0, 10, 4, 'z');
    for (const [x, y] of [[5, 7], [24, 7], [5, 19], [24, 19]]) b.set(x, y, 'x');
  },
  spawns: { sul: [14, 23], start: [14, 23], norte: [14, 1] },
  spawnOffset: [[-4, 0], [12, 0]],
  spawnDir: 'up',
  exits: [
    { x: 14, y: 25, w: 2, to: 'torre_jardins', spawn: 'norte' },
    { x: 14, y: 0, w: 2, to: 'torre_topo', spawn: 'sul' },
  ],
  zones: [
    { x: 4, y: 6, w: 22, h: 13, trigger: 'ecosStart' },
    { x: 13, y: 21, w: 4, h: 2, trigger: 'ecos_porta' },
  ],
  entities: [
    { type: 'echopair', tx: 14, ty: 12, a: [11, 11], l: [18, 11] },
    { type: 'gate', id: 'ec_g1', tx: 14, ty: 21, flag: 'ecos_dead', latch: false }, { type: 'gate', id: 'ec_g2', tx: 15, ty: 21, flag: 'ecos_dead', latch: false },
    { type: 'gate', id: 'ec_n1', tx: 14, ty: 5, flag: 'ecos_dead' }, { type: 'gate', id: 'ec_n2', tx: 15, ty: 5, flag: 'ecos_dead' },
    { type: 'light', tx: 14, ty: 13, r: 170, a: 0.45, color: '#8a6ad8' },
    { type: 'waystone', tx: 11, ty: 2, cp: 'cp_ecos', name: 'Topo da Torre' },
    { type: 'pickup', item: 'constelacao', tx: 18, ty: 2, flag: 'const7' },
  ],
  onEnter(g) {
    for (const id of ['ec_g1', 'ec_g2']) { const gt = g.entities.find((e) => e.id === id); if (gt) gt.setOpen(true, g, true); }
    if (g.flag('ecos_dead')) G.Audio.playMusic('tower', 1);
  },
  triggers: {
    ecos_porta(g) { if (!g.flag('ecos_dead')) g.banter('ecos_porta'); },
    ecosStart(g) { if (!g.flag('ecos_dead')) g.co.start(G.Scenes.ecosIntro, g, { name: 'ecosIntro' }); },
  },
  scripts: {
    *ecosDefeated(g) { yield* G.Scenes.ecosDefeated(g); },
  },
});

G.defineArea({
  id: 'torre_topo',
  title: 'Coração do Céu',
  theme: 'tower',
  music: null,
  ambience: 'void',
  ambient: 'sparkles',
  darkness: 0.3,
  darkColor: '#060418',
  combatMusic: false,
  aiFreeTeleport: true,
  size: [36, 32],
  seed: 201,
  fill: 'Z',
  build(b) {
    b.ellipse(18, 15, 15, 9, 'z');
    b.rect(15, 1, 6, 3, 'z');                 // ilha do núcleo (só arremessando)
    b.rect(17, 24, 2, 3, 'z');
    b.rect(13, 27, 10, 4, 'z');               // antessala
    b.rect(17, 31, 2, 1, 'z');
    b.scatter(4, 7, 28, 17, 'e', 0.06, 'z');
    for (const [x, y] of [[6, 10], [30, 10], [6, 20], [30, 20]]) b.set(x, y, 'x');
  },
  island: { x: 18 * 16, y: 2 * 16 + 12 },
  spawns: { sul: [17, 29], start: [17, 29] },
  spawnOffset: [[-4, 0], [12, 0]],
  spawnDir: 'up',
  exits: [{ x: 17, y: 31, w: 2, to: 'camara_ecos', spawn: 'norte' }],
  zones: [
    { x: 4, y: 8, w: 28, h: 14, trigger: 'nyxStart' },
    { x: 13, y: 27, w: 10, h: 2, trigger: 'topo_porta' },
  ],
  entities: [
    { enemy: 'nyxara', tx: 18, ty: 13, flag: 'nyxara_dead' },
    { type: 'light', tx: 18, ty: 15, r: 200, a: 0.5, color: '#8a6ad8' },
    { type: 'gate', id: 'ny_g1', tx: 17, ty: 25, flag: 'nyxara_dead', latch: false }, { type: 'gate', id: 'ny_g2', tx: 18, ty: 25, flag: 'nyxara_dead', latch: false },
    { type: 'warppad', tx: 20, ty: 2, to: [18, 10], label: 'Voltar à arena' },
    { type: 'waystone', tx: 14, ty: 29, cp: 'cp_topo', name: 'Coração do Céu' },
    { type: 'decor', kind: 'telescope', tx: 21, ty: 28 },
  ],
  onEnter(g) {
    for (const id of ['ny_g1', 'ny_g2']) { const gt = g.entities.find((e) => e.id === id); if (gt) gt.setOpen(true, g, true); }
    g.boss = g.entities.find((e) => e.type === 'nyxara');
    if (g.boss) g.boss.center = { x: 18 * 16, y: 13 * 16 };
    if (g.flag('nyxara_dead')) G.Audio.playMusic('hope', 1);
  },
  triggers: {
    topo_porta(g) { if (!g.flag('nyxara_dead')) g.banter('topo_porta'); },
    nyxStart(g) { if (!g.flag('nyxara_dead')) g.co.start(G.Scenes.nyxaraIntro, g, { name: 'nyxaraIntro' }); },
  },
  scripts: {
    *nyxaraPhase2(g) {
      g.bubble(g.players[0], 'Ela vai disparar um raio enorme!', 2.4);
      yield G.Co.wait(2.5);
      g.bubble(g.players[1], 'Fica atrás de mim. Eu devolvo.', 2.4);
    },
    *nyxaraPhase3(g) {
      g.bubble(g.players[0], 'Meteoros! A Estase segura eles no ar!', 2.6);
      yield G.Co.wait(2.7);
      g.bubble(g.players[1], 'E quando o núcleo descer, eu te jogo lá em cima.', 2.8);
    },
    *nyxaraPhase4(g) {
      g.letterbox(true);
      yield g.say([
        { who: 'nyxara', text: 'Vocês não entendem. Uma estrela sozinha só sabe ter fome.' },
        { who: 'lirien', text: 'Então você não vai ficar sozinha.' },
        { who: 'aldren', text: 'Lirien, o que você está dizendo?' },
        { who: 'lirien', text: 'Que nada disso se faz sozinho. Nem o selo. Juntos, Aldren. Ao mesmo tempo.' },
      ]);
      g.letterbox(false);
      g.toast('FASE FINAL: só a UNIÃO selará Nyxara! Encham as barras e soltem os ESPECIAIS AO MESMO TEMPO perto dela (duas vezes).', 7);
    },
    *nyxaraDefeated(g) { yield* G.Scenes.nyxaraDefeated(g); },
  },
});

// Epílogo: a mesma colina da promessa, agora no presente, ao amanhecer.
G.defineArea({
  id: 'colina_fim',
  title: 'A colina, hoje',
  theme: 'dusk',
  music: 'hope',
  ambience: 'village',
  ambient: 'petals',
  darkness: 0.2,
  darkColor: '#2a1830',
  tint: '#f8e8e0',
  combatMusic: false,
  size: [30, 24],
  seed: 61,
  build(b) {
    b.border('T', 2, 3);
    b.scatter(3, 3, 24, 18, 'T', 0.08);
    b.scatter(2, 2, 26, 20, ',', 0.1);
    b.scatter(2, 2, 26, 20, ';', 0.08);
    b.path([[15, 22], [15, 18], [9, 18], [9, 12], [20, 12], [20, 7], [15, 7], [15, 4]], ':', 2);
    b.rect(11, 2, 9, 4, '.');
    b.rect(13, 22, 4, 2, ':');
    b.set(19, 3, 'T');
  },
  spawns: { start: [15, 21] },
  zones: [{ x: 11, y: 2, w: 9, h: 4, trigger: 'topo' }],
  entities: [{ type: 'decor', kind: 'campfire', tx: 13, ty: 4 }],
  triggers: { topo(g) { g.co.start(G.Scenes.epilogue, g, { name: 'epilogue', persist: true }); } },
  onUpdate(g, dt) {
    if (g.flag('meteoros_fim') && Math.random() < dt * 5) {
      const cam = g.camera;
      const x = cam.x + 60 + Math.random() * (G.VIEW_W + 20), y = cam.y - 10 + Math.random() * 70;
      for (let i = 0; i < 8; i++) g.particles.add({ x: x + i * 3, y: y - i * 1.5, vx: -150, vy: 75, life: 0.9 - i * 0.06, color: i < 2 ? '#ffffff' : '#f2d98c', glow: true });
    }
  },
});
