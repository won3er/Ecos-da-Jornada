// FASE 1 — Ruínas de Velmora: esqueletos com escudo (flanquear), arqueiros
// (escudo protege a Lirien), a MEMÓRIA da primeira ponte (ensina a Ponte Etérea),
// o puzzle de plataforma (ponte de luz + alavanca) e o ritual de proteção.
G.defineArea({
  id: 'ruinas',
  title: 'Ruínas de Velmora',
  theme: 'ruins',
  music: 'dungeon',
  ambience: 'ruins',
  ambient: 'dust',
  tint: '#ece4dc',
  size: [50, 40],
  seed: 17,
  fill: '_',
  build(b) {
    b.scatter(1, 1, 48, 38, 'R', 0.05, '_');
    b.scatter(1, 1, 48, 38, '.', 0.06, '_');
    b.scatter(1, 1, 48, 38, ',', 0.02, '_');
    b.frame(0, 0, 50, 40, '#');
    b.rect(23, 39, 4, 1, '_');                   // entrada sul
    // muro entre o pátio sul e o pátio da memória
    b.rect(1, 27, 48, 1, '#'); b.rect(22, 27, 6, 1, '_');
    b.scatter(2, 28, 46, 10, 'k', 0.03, '_R.,');
    b.scatter(2, 19, 46, 7, 'k', 0.025, '_R.,');
    // abismo (5 de altura) que separa o norte
    b.rect(1, 13, 48, 5, 'C');
    // seção norte
    b.scatter(2, 2, 36, 9, 'k', 0.03, '_R.,');
    b.rect(18, 3, 15, 8, '_');                   // praça do altar livre
    // sala da escada (nordeste)
    b.rect(39, 0, 1, 7, '#'); b.rect(39, 6, 11, 1, '#'); b.set(39, 3, '_');
    b.rect(40, 1, 9, 5, '_');
    // grama nas frestas
    b.scatter(1, 28, 48, 11, ';', 0.03, '_');
    b.rect(20, 33, 10, 6, '_');
    b.rect(22, 18, 6, 9, '_');
    // passagem leste para Velmora Desperta (Capítulo III)
    b.replace('k', '_', 43, 29, 6, 5);
    b.rect(49, 31, 1, 2, '_');
  },
  spawns: { sul: [24, 37], start: [24, 37], cima: [43, 4] },
  exits: [
    { x: 23, y: 39, w: 4, to: 'floresta', spawn: 'norte' },
    { x: 44, y: 1, w: 2, h: 2, to: 'caverna', spawn: 'entrada' },
    { x: 49, y: 31, h: 2, to: 'velmora_noite', spawn: 'oeste' },
  ],
  zones: [
    { x: 20, y: 35, w: 10, h: 1, trigger: 'ruinas_inicio' },
    { x: 18, y: 19, w: 14, h: 1, trigger: 'ruinas_abismo' },
  ],
  entities: [
    // pátio sul
    { enemy: 'skeleton', tx: 16, ty: 31 }, { enemy: 'skeleton', tx: 33, ty: 32 }, { enemy: 'archer', tx: 25, ty: 29 },
    { type: 'sign', tx: 21, ty: 35, text: 'Velmora, a cidade dos magos. Caiu há trezentos anos. Ninguém lembra por quê.' },
    { type: 'chest', tx: 3, ty: 37, flag: 'chest_ruinas1', contents: [{ item: 'pocao' }], gold: 15 },
    { type: 'gate', id: 'velmora_g1', tx: 48, ty: 31, flag: 'velmora_aberta' }, { type: 'gate', id: 'velmora_g2', tx: 48, ty: 32, flag: 'velmora_aberta' },
    { type: 'sign', tx: 46, ty: 30, text: 'Uma passagem selada para o leste. Pelas frestas vem um ar frio... e um brilho de estrelas.' },
    { type: 'waystone', tx: 27, ty: 36, cp: 'cp_ruinas0', name: 'Entrada de Velmora' },
    // pátio da memória
    { type: 'memory', memory: 'ponte', look: 'sword', tx: 25, ty: 22 },
    { type: 'waystone', tx: 31, ty: 24, cp: 'cp_ruinas1' },
    { type: 'sign', tx: 18, ty: 19, text: 'Um abismo antigo. Do outro lado, uma alavanca. Diziam que aqui existia uma ponte feita de luz.' },
    { enemy: 'skeleton', tx: 10, ty: 22 }, { enemy: 'archer', tx: 40, ty: 21 },
    // norte: alavanca que ergue a ponte de pedra
    { type: 'lever', id: 'ponte_lever', tx: 30, ty: 11, flag: 'ruinas_ponte_lever' },
    { type: 'mechanism', requires: ['ponte_lever'], flag: 'ruinas_ponte', script: 'buildBridge', onLoad: 'bridgeInstant', blocking: true },
    { type: 'waystone', tx: 21, ty: 10, cp: 'cp_ruinas2' },
    // ritual de proteção: Lirien canaliza no altar; Aldren protege
    { type: 'altar', id: 'altar1', tx: 26, ty: 6, duration: 14, flag: 'ruinas_altar', onStart: 'ritualWaves', onDone: 'ritualDone' },
    { type: 'gate', id: 'selo_porta', tx: 39, ty: 3, requires: ['altar1'], flag: 'ruinas_selo' },
    { type: 'sign', tx: 23, ty: 9, text: 'Altar do Selo. "Quem canaliza não pode se defender. Quem defende não pode canalizar."' },
    { type: 'decor', kind: 'stairs', tx: 44, ty: 2, sw: 2 },
    // segredo: baú oculto por ilusão (Telecinese revela) — página 4
    { type: 'chest', tx: 5, ty: 4, hidden: true, flag: 'secret_ruinas', contents: [{ item: 'pagina' }], gold: 20, fancy: true },
    { type: 'sign', tx: 8, ty: 9, text: 'Rabiscos na pedra: "Meu tesouro está aqui... mas só quem enxerga com magia vê."' },
    { enemy: 'skeleton', tx: 12, ty: 6 },
  ],
  triggers: {
    ruinas_inicio(g) { g.banter('ruinas_inicio'); },
    ruinas_abismo(g) {
      if (!g.memories.has('ponte')) g.bubble(g.players[1], 'Essa espada de madeira... eu conheço.', 2.5);
    },
  },
  scripts: {
    *buildBridge(g) {
      g.camera.focus = { x: 25 * 16, y: 15 * 16, speed: 4 };
      yield G.Co.wait(0.6);
      for (let y = 17; y >= 13; y--) {
        g.level.setTile(24, y, '_'); g.level.setTile(25, y, '_');
        G.Audio.sfx('push'); g.camera.shake(2, 0.15);
        g.particles.burst(25 * 16, y * 16 + 8, 12, { colors: ['#8a847a', '#c8c0b0'], speed: 40, life: 0.5 });
        yield G.Co.wait(0.22);
      }
      G.Audio.sfx('solved');
      yield G.Co.wait(0.4);
      g.camera.focus = null;
      g.bubble(g.players[1], 'Pronto! Agora você pode vir andando, como gente normal.', 3);
    },
    bridgeInstant(g) { for (let y = 13; y <= 17; y++) { g.level.setTile(24, y, '_'); g.level.setTile(25, y, '_'); } },
    *ritualWaves(g) {
      g.bubble(g.players[0], 'Vou abrir o selo. Não deixe nada me tocar.', 2.5);
      g.bubble(g.players[1], 'Ninguém encosta em você.', 2.5);
      G.Audio.playMusic('combat', 0.6);
      const waves = [
        [['skeleton', 3, 4], ['skeleton', 36, 9]],
        [['bat', 4, 9], ['bat', 35, 3], ['archer', 18, 2]],
        [['skeleton', 36, 4], ['bat', 3, 8], ['bat', 33, 10]],
      ];
      for (let i = 0; i < waves.length; i++) {
        if (g.flag('ruinas_altar')) break;
        for (const [type, tx, ty] of waves[i]) {
          const e = g.spawnEnemy(type, tx * 16 + 8, ty * 16 + 14, { flag: null });
          if (e) { e.aggro = true; e.target = g.players[0]; g.particles.burst(e.x, e.y - 8, 14, { colors: ['#2a1840', '#6a3a9a'], speed: 40, life: 0.5 }); }
        }
        yield G.Co.wait(4.5);
      }
    },
    *ritualDone(g) {
      g.showEvent(39 * 16 + 8, 3 * 16 + 8);
      yield G.Co.wait(0.6);
      g.bubble(g.players[0], 'O selo caiu. Há uma escada para baixo.', 2.5);
      G.Audio.playMusic('dungeon', 2);
    },
    *afterMemory_ponte(g) {
      g.unlockedSpells = ['frost', 'tk', 'bridge'];
      g.players[0].spell = 'bridge';
      yield G.Co.wait(0.5);
      yield g.say([
        { who: 'lirien', text: '...' },
        { who: 'aldren', text: 'Você estava lá. A moça das orelhas pontudas era você.' },
        { who: 'lirien', text: 'Você chorou a ponte inteira.' },
        { who: 'aldren', text: 'Eu tinha dez anos!' },
        { who: 'lirien', text: 'Eu me lembro do feitiço. A ponte ainda funciona.' },
      ]);
      g.toast('Nova magia: PONTE ETÉREA! Troque com ' + G.Characters.lirien.keys.swap + ' e segure ' + G.Characters.lirien.keys.skill + ' diante do abismo.', 6);
      G.Audio.sfx('levelup');
      g.addPoints(1);
      g.inv.add('espada_madeira', 1, g);
      g.refreshStats();
      yield G.Co.wait(1);
      g.banter('ruinas_pos_memoria');
    },
  },
});
