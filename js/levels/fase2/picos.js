// CAPÍTULO II — Picos Gelados: o vento que empurra (escudo do Aldren faz
// abrigo), o ARREMESSO por cima de muros baixos e de um abismo até pedras
// rúnicas que só a Lirien lê, gelo escorregadio com estalactites, a clareira
// do Lobo Alfa (missão) e uma gruta secreta atrás de espinhos.
G.defineArea({
  id: 'picos',
  title: 'Picos Gelados',
  theme: 'snow',
  music: 'snow',
  ambience: 'blizzard',
  ambient: 'blizzard',
  darkness: 0.15,
  darkColor: '#1a2240',
  size: [60, 44],
  seed: 109,
  fill: 'X',
  build(b) {
    // S: encosta de entrada
    b.rect(30, 34, 26, 8, '.');
    b.rect(46, 41, 4, 3, ':');
    // corredor do vento (sopra para o leste)
    b.rect(8, 30, 37, 4, '.');
    b.rect(38, 33, 7, 2, '.');
    // O: planalto com o cercado de muro baixo
    b.rect(3, 12, 12, 18, '.');
    b.frame(4, 14, 6, 6, 'b');
    b.rect(5, 15, 4, 4, '.');
    // passagem norte (portão da runa)
    b.rect(7, 9, 2, 3, ':');
    // NO: gelo escorregadio
    b.rect(3, 2, 26, 7, '.');
    b.rect(10, 3, 15, 5, 'i');
    b.set(14, 5, 'r'); b.set(19, 4, 'r'); b.set(22, 6, 'r');
    // abismo e a saliência da runa leste
    b.rect(29, 2, 3, 7, 'C');
    b.rect(32, 2, 8, 7, '.');
    // trilha norte até o portão da fortaleza
    b.rect(40, 2, 17, 7, '.');
    b.rect(46, 0, 4, 2, ':');
    // NE: clareira do Alfa
    b.rect(41, 9, 16, 19, '.');
    // gruta secreta (espinhos de gelo na entrada)
    b.rect(52, 28, 1, 1, '.');
    b.rect(49, 29, 7, 4, '.');
    // vegetação
    b.scatter(30, 34, 26, 8, 'P', 0.05, '.');
    b.scatter(3, 12, 12, 18, 'P', 0.04, '.');
    b.scatter(41, 9, 16, 19, 'P', 0.05, '.');
    b.scatter(3, 2, 6, 7, 'P', 0.1, '.');
    b.replace('P', '.', 4, 13, 7, 8);
    b.replace('P', '.', 44, 34, 8, 8);
    b.replace('P', '.', 3, 12, 12, 2);
    b.replace('P', '.', 41, 9, 16, 2);
  },
  spawns: { sul: [47, 40], start: [47, 40], norte: [47, 2] },
  spawnDir: 'up',
  exits: [
    { x: 46, y: 43, w: 4, to: 'minas', spawn: 'norte' },
    { x: 46, y: 0, w: 4, to: 'fortaleza', spawn: 'sul' },
  ],
  winds: [
    { x: 8, y: 30, w: 30, h: 4, dx: 1, dy: 0, force: 96, gust: true, gustSpeed: 1.1 },
    { x: 40, y: 2, w: 17, h: 7, dx: -1, dy: 0, force: 70, gust: true, gustSpeed: 1.6 },
  ],
  zones: [
    { x: 38, y: 30, w: 3, h: 4, trigger: 'picos_inicio' },
    { x: 3, y: 20, w: 12, h: 2, trigger: 'picos_runa' },
    { x: 49, y: 29, w: 7, h: 4, trigger: 'secreto_picos', flag: 'secret_picos' },
  ],
  entities: [
    { type: 'waystone', tx: 40, ty: 37, cp: 'cp_picos', name: 'Encosta dos Picos' },
    { type: 'sign', tx: 43, ty: 33, text: 'Velho Holt riscou na pedra: "Vento oeste. Escudo na frente, moça atrás."' },
    { enemy: 'frostwolf', tx: 34, ty: 36 }, { enemy: 'snowling', tx: 52, ty: 38 }, { enemy: 'frostwolf', tx: 37, ty: 39 },
    { enemy: 'icewisp', tx: 20, ty: 31 },
    // cercado de muro baixo: só arremessada a Lirien chega à runa
    { type: 'rune', id: 'runa_w', tx: 6, ty: 17, flag: 'picos_runa_w', say: 'A runa diz "abra". Educada.' },
    { type: 'mechanism', requires: ['runa_w'], flag: 'picos_cercado', script: 'abrirCercado', onLoad: 'cercadoInstant' },
    { type: 'gate', id: 'g_picos_n1', tx: 7, ty: 11, requires: ['runa_w'], flag: 'picos_portao_n' },
    { type: 'gate', id: 'g_picos_n2', tx: 8, ty: 11, requires: ['runa_w'], flag: 'picos_portao_n' },
    { type: 'sign', tx: 11, ty: 16, text: 'Um cercado de pedra baixa ao redor de uma runa. Nenhuma porta. Quem construiu isso queria que alguém pulasse.' },
    { enemy: 'frostwolf', tx: 11, ty: 24 }, { enemy: 'snowling', tx: 4, ty: 26 },
    // gelo e estalactites
    { type: 'icefall', tx: 12, ty: 2, tw: 10, th: 5, rate: 1.4 },
    { enemy: 'snowling', tx: 16, ty: 4 }, { enemy: 'snowling', tx: 21, ty: 6 }, { enemy: 'icewisp', tx: 26, ty: 3 },
    { type: 'chest', tx: 4, ty: 3, flag: 'chest_picos1', contents: [{ item: 'elixir' }], gold: 30 },
    // abismo: arremessar a Lirien até a runa leste
    { type: 'rune', id: 'runa_e', tx: 35, ty: 4, flag: 'picos_runa_e', say: 'Esta pede uma ponte. Vou dar uma.' },
    { type: 'mechanism', requires: ['runa_e'], flag: 'picos_ponte', script: 'ponteAbismo', onLoad: 'ponteInstant', blocking: true },
    { type: 'sign', tx: 27, ty: 7, text: 'Do outro lado do abismo, outra runa. Longe demais para pular. Perto o bastante para voar... com ajuda.' },
    { enemy: 'icewisp', tx: 37, ty: 7 },
    // trilha norte
    { type: 'waystone', tx: 52, ty: 4, cp: 'cp_picos2', name: 'Portão da Vigília' },
    { enemy: 'frostwolf', tx: 43, ty: 6 }, { enemy: 'icewisp', tx: 55, ty: 3 },
    { type: 'decor', kind: 'statue', tx: 45, ty: 2 }, { type: 'decor', kind: 'statue', tx: 50, ty: 2 },
    // clareira do Alfa (missão do Garrik)
    { enemy: 'alpha', tx: 49, ty: 19, flag: 'alfa_dead' },
    { type: 'sign', tx: 43, ty: 12, text: 'Pegadas enormes na neve. Somem do nada, como se o dono virasse vento.' },
    // gruta secreta
    { type: 'thorns', tx: 52, ty: 28, flag: 'picos_espinhos' },
    { type: 'chest', tx: 52, ty: 30, flag: 'chest_picos_secreto', contents: [{ item: 'pagina_diario' }, { item: 'cristal_gelido' }], gold: 40, fancy: true },
  ],
  triggers: {
    picos_inicio(g) { g.banter('picos_inicio'); if (!g.flag('tut_wind')) { g.setFlag('tut_wind', true); g.toast('Vento forte! Aldren: erga o escudo (' + G.Characters.aldren.keys.skill + ') virado contra o vento. Lirien: fique logo atrás dele.', 6); } },
    picos_runa(g) { g.banter('picos_runa'); if (!g.flag('tut_throw2') && g.has('arremesso')) { g.setFlag('tut_throw2', true); g.toast('Aldren: chegue perto da Lirien e aperte ' + G.Characters.aldren.keys.act + ' para erguê-la; aperte de novo para arremessar.', 6); } },
    secreto_picos(g) { G.Audio.sfx('solved'); g.toast('Área secreta: a gruta de cristal!', 3); },
  },
  scripts: {
    *abrirCercado(g) {
      yield G.Co.wait(0.3);
      for (const x of [6, 7]) { g.level.setTile(x, 19, '.'); g.particles.burst(x * 16 + 8, 19 * 16 + 8, 12, { colors: ['#8a92a2', '#f2f6fb'], speed: 40, life: 0.5 }); }
      G.Audio.sfx('push'); g.camera.shake(2, 0.2);
      g.showEvent(7 * 16 + 8, 11 * 16);
    },
    cercadoInstant(g) { g.level.setTile(6, 19, '.'); g.level.setTile(7, 19, '.'); },
    *ponteAbismo(g) {
      g.camera.focus = { x: 30 * 16, y: 5 * 16, speed: 4 };
      yield G.Co.wait(0.5);
      for (let x = 31; x >= 29; x--) {
        g.level.setTile(x, 5, '_'); g.level.setTile(x, 6, '_');
        G.Audio.sfx('push'); g.camera.shake(1.5, 0.12);
        g.particles.burst(x * 16 + 8, 6 * 16, 12, { colors: ['#8ae8ff', '#f2f6fb'], speed: 40, life: 0.5, glow: true });
        yield G.Co.wait(0.22);
      }
      G.Audio.sfx('solved');
      yield G.Co.wait(0.3);
      g.camera.focus = null;
      g.bubble(g.players[1], 'Viu? Voar não foi tão ruim.', 2.4);
      g.bubble(g.players[0], 'Foi horrível. Faz de novo depois.', 2.4);
    },
    ponteInstant(g) { for (let x = 29; x <= 31; x++) { g.level.setTile(x, 5, '_'); g.level.setTile(x, 6, '_'); } },
  },
});
