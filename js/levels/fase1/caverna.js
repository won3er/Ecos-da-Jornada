// FASE 1 — Caverna Ecoante (escura): besouros imunes a magia (Aldren vira),
// puzzle ambiental (caixote na placa pesada + braseiros acesos), puzzle de
// telecinese sobre o abismo, parede rachada secreta e o MINI-CHEFE.
G.defineArea({
  id: 'caverna',
  title: 'Caverna Ecoante',
  theme: 'cave',
  music: 'dungeon',
  ambience: 'cave',
  ambient: 'dust',
  darkness: 0.86,
  size: [52, 36],
  seed: 23,
  fill: 'c',
  build(b) {
    // corredor de entrada
    b.rect(2, 2, 22, 4, 'f');
    // sala A (puzzle ambiental)
    b.rect(2, 7, 19, 13, 'f');
    b.rect(10, 6, 2, 1, 'f');
    // passagem para a área B (portão em 10,20)
    b.set(10, 20, 'f');
    // área B: oeste | abismo | leste
    b.rect(2, 21, 10, 12, 'f');
    b.rect(12, 21, 5, 12, 'C');
    b.rect(17, 21, 14, 12, 'f');
    // nicho da pedra (fechado por barricada em 7,27)
    b.rect(2, 25, 6, 5, 'c'); b.rect(3, 26, 4, 3, 'f'); b.set(7, 27, 'f');
    // câmara secreta atrás da parede rachada
    b.rect(32, 26, 5, 5, 'f'); b.set(31, 28, 'f');
    // corredor para a arena + pedra de retorno
    b.rect(24, 9, 6, 12, 'f');
    // arena do mini-chefe
    b.rect(31, 5, 17, 17, 'f');
    b.set(30, 13, 'f');
    b.set(48, 13, 'f'); b.rect(49, 12, 3, 3, 'f');
    // detalhes
    b.scatter(2, 2, 46, 32, 'u', 0.03, 'f');
    b.scatter(2, 21, 9, 12, 'Y', 0.04, 'f');
    b.set(34, 8, 'Y'); b.set(44, 18, 'Y'); b.set(44, 8, 'Y'); b.set(34, 18, 'Y');
    b.rect(5, 12, 10, 1, 'f'); // linha livre para o caixote
    b.rect(36, 10, 7, 7, 'f');
  },
  spawns: { entrada: [5, 4], start: [5, 4], leste: [47, 13], arena: [33, 13] },
  exits: [
    { x: 2, y: 2, w: 1, h: 1, to: 'ruinas', spawn: 'cima' },
    { x: 51, y: 12, h: 3, to: 'santuario', spawn: 'oeste' },
  ],
  zones: [
    { x: 6, y: 2, w: 1, h: 4, trigger: 'caverna_inicio' },
    { x: 16, y: 2, w: 1, h: 4, trigger: 'caverna_eco' },
    { x: 32, y: 5, w: 16, h: 17, trigger: 'arena' }, // a sala inteira: não dá para contornar
  ],
  entities: [
    { type: 'decor', kind: 'stairs', tx: 2, ty: 2, sw: 1 }, { type: 'brazier', tx: 5, ty: 2, lit: true }, { type: 'brazier', tx: 21, ty: 2, lit: true },
    { enemy: 'bat', tx: 12, ty: 3 }, { enemy: 'bat', tx: 19, ty: 4 },
    // sala A: caixote -> placa pesada + dois braseiros (cada um faz uma parte)
    { type: 'crate', tx: 5, ty: 12 },
    { type: 'plate', id: 'p_cave1', kind: 'heavy', tx: 14, ty: 12 },
    { type: 'brazier', id: 'br_c1', tx: 3, ty: 18 }, { type: 'brazier', id: 'br_c2', tx: 19, ty: 18 },
    { type: 'gate', id: 'g_cave1', tx: 10, ty: 20, requires: ['p_cave1', 'br_c1', 'br_c2'], latch: false },
    { type: 'sign', tx: 12, ty: 8, text: 'Inscrição: "O peso abre o caminho. O fogo mostra o caminho. Os dois juntos, a passagem."' },
    { enemy: 'beetle', tx: 8, ty: 16 }, { enemy: 'beetle', tx: 16, ty: 9 },
    // área B: pedra rúnica atrás da barricada, encaixe do outro lado do abismo
    { type: 'barricade', tx: 7, ty: 27, flag: 'cave_barricade' },
    { type: 'floatstone', id: 'pedra1', tx: 4, ty: 27 },
    { type: 'socket', id: 'enc1', tx: 18, ty: 27, flag: 'cave_socket' },
    { type: 'mechanism', requires: ['enc1'], flag: 'cave_bridge', script: 'caveBridge', onLoad: 'caveBridgeInstant', blocking: true },
    { type: 'sign', tx: 9, ty: 22, text: 'Uma pedra rúnica pulsa atrás das tábuas. Do outro lado do abismo, um encaixe vazio.' },
    { enemy: 'slime', tx: 22, ty: 30, variant: 'cave' }, { enemy: 'slime', tx: 27, ty: 23, variant: 'cave' }, { enemy: 'bat', tx: 6, ty: 31 },
    // segredo: parede rachada (golpe pesado) — minério + página 5
    { type: 'cracked', tx: 31, ty: 28, wall: true, flag: 'secret_caverna' },
    { type: 'chest', tx: 34, ty: 27, flag: 'chest_caverna_secreta', contents: [{ item: 'minerio' }, { item: 'pagina' }], gold: 30, fancy: true },
    { type: 'sign', tx: 29, ty: 31, text: 'O ar sai frio por uma rachadura na parede leste.' },
    // antes da arena
    { type: 'waystone', tx: 26, ty: 15, cp: 'cp_caverna' },
    { type: 'brazier', tx: 24, ty: 10, lit: true }, { type: 'brazier', tx: 29, ty: 18, lit: true },
    // arena
    { type: 'gate', id: 'arena_in', tx: 30, ty: 13, flag: 'arena_in_open', latch: false },
    { type: 'gate', id: 'arena_out', tx: 48, ty: 13, flag: 'golem_dead' },
    { enemy: 'golem', tx: 40, ty: 13, flag: 'golem_dead' },
    { type: 'light', tx: 39, ty: 13, r: 150, a: 0.55, color: '#6a8ab8' },
    { type: 'light', tx: 10, ty: 13, r: 90, a: 0.35, color: '#5ae0d0' },
    { type: 'light', tx: 22, ty: 27, r: 90, a: 0.35, color: '#5ae0d0' },
    { type: 'brazier', tx: 32, ty: 6, lit: true }, { type: 'brazier', tx: 46, ty: 6, lit: true },
    { type: 'brazier', tx: 32, ty: 20, lit: true }, { type: 'brazier', tx: 46, ty: 20, lit: true },
  ],
  triggers: {
    caverna_inicio(g) { g.banter('caverna_inicio'); },
    caverna_eco(g) { g.banter('caverna_eco'); },
    arena(g) { if (!g.flag('golem_dead')) g.co.start(G.Scenes.golemIntro, g, { name: 'golemIntro' }); },
  },
  onEnter(g) {
    const gin = g.entities.find((e) => e.id === 'arena_in');
    if (gin) gin.setOpen(true, g, true);
  },
  scripts: {
    *caveBridge(g) {
      g.camera.focus = { x: 14 * 16, y: 27 * 16, speed: 4 };
      yield G.Co.wait(0.5);
      for (let x = 16; x >= 12; x--) {
        g.level.setTile(x, 27, 'f'); g.level.setTile(x, 28, 'f');
        G.Audio.sfx('push'); g.camera.shake(1.5, 0.12);
        g.particles.burst(x * 16 + 8, 28 * 16, 10, { colors: ['#8ae8ff', '#5a4c52'], speed: 40, life: 0.5, glow: true });
        yield G.Co.wait(0.2);
      }
      G.Audio.sfx('solved');
      yield G.Co.wait(0.3);
      g.camera.focus = null;
    },
    caveBridgeInstant(g) { for (let x = 12; x <= 16; x++) { g.level.setTile(x, 27, 'f'); g.level.setTile(x, 28, 'f'); } },
    *golemDefeated(g) { yield* G.Scenes.golemDefeated(g); },
  },
});
