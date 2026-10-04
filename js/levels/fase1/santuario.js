// FASE 1 — Santuário da Estrela Caída (área mágica) e a Cratera (chefe).
// Puzzles finais combinam tudo: Ponte Etérea + peso do Aldren (ilha),
// e o PRISMA (magia da Lirien refletida no escudo do Aldren).
G.defineArea({
  id: 'santuario',
  title: 'Santuário da Estrela Caída',
  theme: 'sanctum',
  music: 'sanctum',
  ambience: 'magic',
  ambient: 'sparkles',
  darkness: 0.42,
  darkColor: '#0a0822',
  size: [46, 34],
  seed: 31,
  fill: '#',
  build(b) {
    // corredor de entrada
    b.rect(0, 15, 8, 5, 'm');
    // salão principal
    b.rect(6, 10, 30, 20, 'm');
    b.scatter(7, 11, 29, 18, 'e', 0.08, 'm');
    b.scatter(7, 11, 29, 18, 'x', 0.025, 'm');
    // ilha do peso (noroeste): abismo com ilha
    b.rect(6, 3, 12, 7, 'C');
    b.rect(10, 3, 3, 2, 'm');
    // câmara do prisma (norte, atrás do portão g_s1)
    b.rect(20, 2, 17, 7, 'm');
    b.rect(20, 3, 17, 2, 'C');
    b.rect(26, 1, 5, 1, 'm');
    b.set(24, 9, 'm');
    // sala da porta do chefe (leste)
    b.rect(37, 14, 7, 9, 'm'); b.set(36, 18, 'm');
    b.rect(39, 11, 3, 3, 'm');
    // cristais decorativos ao redor
    for (const [x, y] of [[8, 12], [34, 12], [8, 27], [34, 27], [20, 28], [38, 15], [42, 15]]) b.set(x, y, 'x');
  },
  spawns: { oeste: [2, 17], start: [2, 17], norte: [40, 13] },
  exits: [
    { x: 0, y: 15, h: 5, to: 'caverna', spawn: 'leste' },
    { x: 39, y: 11, w: 3, to: 'cratera', spawn: 'sul' },
  ],
  zones: [
    { x: 7, y: 15, w: 1, h: 5, trigger: 'santuario_inicio' },
    { x: 38, y: 14, w: 5, h: 2, trigger: 'santuario_porta' },
  ],
  entities: [
    { enemy: 'wisp', tx: 16, ty: 20 }, { enemy: 'beetle', tx: 22, ty: 16 }, { enemy: 'wisp', tx: 28, ty: 24 },
    { enemy: 'beetle', tx: 31, ty: 21 }, { enemy: 'wisp', tx: 12, ty: 25 }, { enemy: 'skeleton', tx: 26, ty: 13 },
    // ilha do peso: Lirien faz a ponte, Aldren pisa na placa (Lirien é leve demais)
    { type: 'plate', id: 'p_ilha', kind: 'heavy', tx: 11, ty: 3 },
    { type: 'mechanism', requires: ['p_ilha'], flag: 'santo_ilha', script: 'ilhaBridge', onLoad: 'ilhaInstant', blocking: true },
    { type: 'sign', tx: 14, ty: 11, text: 'Ilha do Peso. "A leveza atravessa; o peso desperta." Uma placa repousa na ilha.' },
    // portão para a câmara do prisma (aberto pela ilha)
    { type: 'gate', id: 'g_s1', tx: 24, ty: 9, requires: ['p_ilha_latched'], flag: 'santo_ilha' },
    // câmara do prisma: cristal solar só desperta com luz refletida
    { type: 'crystal', id: 'c_prisma', tx: 28, ty: 1, needs: 'prism', flag: 'santo_prisma' },
    { type: 'sign', tx: 22, ty: 7, text: 'Cristal Solar. "Não aceita luz direta. Só a que foi devolvida por um escudo."' },
    // portal para a porta do chefe
    { type: 'gate', id: 'portal', tx: 36, ty: 18, requires: ['c_prisma'], flag: 'santo_portal' },
    { type: 'waystone', tx: 40, ty: 19, cp: 'cp_santuario' },
    { type: 'chest', tx: 42, ty: 21, flag: 'chest_santo', contents: [{ item: 'pocao', qty: 2 }, { item: 'eter' }] },
  ],
  triggers: {
    santuario_inicio(g) { g.banter('santuario_inicio'); },
    santuario_porta(g) { g.banter('santuario_porta'); },
  },
  onUpdate(g) {
    if (g.flag('santo_ilha')) g.flags.sig_p_ilha_latched = true;
  },
  scripts: {
    *ilhaBridge(g) {
      g.setFlag('sig_p_ilha_latched', true);
      g.camera.focus = { x: 11 * 16, y: 7 * 16, speed: 4 };
      yield G.Co.wait(0.5);
      for (let y = 9; y >= 5; y--) {
        g.level.setTile(11, y, 'm');
        G.Audio.sfx('bridge'); g.camera.shake(1, 0.1);
        g.particles.burst(11 * 16 + 8, y * 16 + 8, 10, { colors: ['#8ae8ff', '#c8a8ff'], speed: 40, life: 0.5, glow: true });
        yield G.Co.wait(0.2);
      }
      G.Audio.sfx('solved');
      g.showEvent(24 * 16 + 8, 9 * 16);
      yield G.Co.wait(1.6);
      g.camera.focus = null;
      g.bubble(g.players[1], 'Ser pesado tem suas vantagens.', 2.4);
    },
    ilhaInstant(g) { g.setFlag('sig_p_ilha_latched', true); for (let y = 5; y <= 9; y++) g.level.setTile(11, y, 'm'); },
  },
});

G.defineArea({
  id: 'cratera',
  title: 'Cratera da Estrela',
  theme: 'sanctum',
  music: null,
  ambience: 'magic',
  ambient: 'sparkles',
  darkness: 0.36,
  darkColor: '#0a0822',
  combatMusic: false,
  size: [32, 24],
  seed: 41,
  fill: 'c',
  build(b) {
    b.ellipse(16, 11, 13.5, 9.5, 'm');
    b.scatter(3, 2, 26, 19, 'e', 0.1, 'm');
    b.rect(15, 19, 2, 5, 'm');
    for (const [x, y] of [[5, 5], [26, 5], [4, 15], [27, 15], [10, 2], [21, 2]]) b.set(x, y, 'x');
  },
  spawns: { sul: [15, 20], start: [15, 20] },
  spawnOffset: [[-4, 0], [12, 0]],
  spawnDir: 'up',
  exits: [{ x: 15, y: 23, w: 2, to: 'santuario', spawn: 'norte' }],
  zones: [{ x: 1, y: 2, w: 30, h: 16, trigger: 'bossStart' }], // toda a cratera acima da entrada
  entities: [
    { enemy: 'boss', tx: 16, ty: 9, flag: 'boss_dead' },
    { type: 'light', tx: 16, ty: 11, r: 190, a: 0.45, color: '#7a6ad8' },
    { type: 'gate', id: 'boss_g1', tx: 15, ty: 21, flag: 'boss_dead', latch: false },
    { type: 'gate', id: 'boss_g2', tx: 16, ty: 21, flag: 'boss_dead', latch: false },
    { type: 'memory', memory: 'promessa', look: 'star', tx: 16, ty: 9, cond: (g) => g.flag('boss_dead') && !g.memories.has('promessa') },
  ],
  onEnter(g) {
    for (const id of ['boss_g1', 'boss_g2']) { const gt = g.entities.find((e) => e.id === id); if (gt) gt.setOpen(true, g, true); }
    g.boss = g.entities.find((e) => e.type === 'boss');
    if (g.boss) g.boss.center = { x: 16 * 16 + 8, y: 10 * 16 };
    if (g.flag('boss_dead')) G.Audio.playMusic('sanctum', 1);
  },
  triggers: {
    bossStart(g) { if (!g.flag('boss_dead')) g.co.start(G.Scenes.bossIntro, g, { name: 'bossIntro' }); },
  },
  scripts: {
    *bossPhase2(g) {
      g.bubble(g.players[0], 'Ele ficou intocável!', 2.2);
      yield G.Co.wait(2.3);
      g.bubble(g.players[1], 'Aquela esfera... se eu aparar no momento certo...', 3);
    },
    *bossPhase3(g) {
      g.bubble(g.players[1], 'Ele está desesperado!', 2);
      yield G.Co.wait(2.1);
      g.bubble(g.players[0], 'Lembranças roubadas não pesam pouco. Juntos, Aldren!', 3);
    },
    *bossDefeated(g) { yield* G.Scenes.bossDefeated(g); },
    *afterMemory_promessa(g) { yield* G.Scenes.finale(g); },
  },
});
