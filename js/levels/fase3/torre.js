// CAPÍTULO III — Torre de Astrália (Salão dos Espelhos e Jardins Suspensos).
// Espelhos que o Aldren gira, emissores que a magia concentrada da Lirien
// liga, o escudo do Aldren como espelho vivo, sentinelas e uma Sentinela
// Antiga opcional. Nos jardins: plataformas flutuantes (Estase ajuda),
// vãos para o Salto, ilhas para o Arremesso e o cajado do mestre.
G.defineArea({
  id: 'torre_espelhos',
  title: 'Salão dos Espelhos',
  theme: 'tower',
  music: 'tower',
  ambience: 'void',
  ambient: 'sparkles',
  darkness: 0.38,
  darkColor: '#0a0820',
  size: [46, 38],
  seed: 171,
  fill: '#',
  build(b) {
    // R1: entrada
    b.rect(16, 30, 14, 7, 'z');
    b.rect(22, 37, 2, 1, 'z');
    b.rect(22, 29, 2, 1, 'z');
    // R2: salão com o canal de vazio
    b.rect(8, 18, 30, 11, 'z');
    b.rect(12, 21, 22, 5, 'Z');
    b.rect(22, 23, 2, 1, 'z');              // ilhota da constelação
    // R3: topo
    b.rect(22, 17, 2, 1, 'z');
    b.rect(12, 4, 22, 13, 'z');
    b.rect(22, 0, 2, 4, 'z');
    // sala da Sentinela (opcional)
    b.rect(34, 9, 2, 2, 'z');
    b.rect(36, 4, 9, 11, 'z');
    for (const [x, y] of [[36, 27], [14, 15], [31, 15], [13, 27]]) b.set(x, y, 'k');
  },
  spawns: { sul: [22, 35], start: [22, 35], norte: [22, 2] },
  spawnDir: 'up',
  exits: [
    { x: 22, y: 37, w: 2, to: 'velmora_noite', spawn: 'norte' },
    { x: 22, y: 0, w: 2, to: 'torre_jardins', spawn: 'sul' },
  ],
  zones: [
    { x: 16, y: 32, w: 14, h: 2, trigger: 'espelhos_inicio' },
    { x: 12, y: 13, w: 22, h: 3, trigger: 'r3' },
    { x: 36, y: 4, w: 9, h: 11, trigger: 'secreto_espelhos', flag: 'secret_espelhos' },
  ],
  entities: [
    { type: 'waystone', tx: 18, ty: 34, cp: 'cp_espelhos', name: 'Salão dos Espelhos' },
    { type: 'decor', kind: 'shelf', tx: 26, ty: 30 }, { type: 'decor', kind: 'telescope', tx: 28, ty: 35 },
    // quebra-cabeça 1: um espelho
    { type: 'emitter', tx: 16, ty: 31, dir: 'right' },
    { type: 'mirror', tx: 27, ty: 31, orient: 0 },
    { type: 'receptor', id: 'rc1', tx: 27, ty: 34, flag: 'esp_rc1' },
    { type: 'gate', id: 'eg1', tx: 22, ty: 29, requires: ['rc1'], flag: 'esp_g1' }, { type: 'gate', id: 'eg2', tx: 23, ty: 29, requires: ['rc1'], flag: 'esp_g1' },
    // quebra-cabeça 2: emissor que a magia concentrada liga + dois espelhos
    { type: 'emitter', tx: 9, ty: 27, dir: 'up', mode: 'magic', dur: 10 },
    { type: 'mirror', tx: 9, ty: 19, orient: 1 },
    { type: 'mirror', tx: 36, ty: 19, orient: 0 },
    { type: 'receptor', id: 'rc2', tx: 36, ty: 26, flag: 'esp_rc2' },
    { type: 'gate', id: 'eg3', tx: 22, ty: 17, requires: ['rc2'], flag: 'esp_g2' }, { type: 'gate', id: 'eg4', tx: 23, ty: 17, requires: ['rc2'], flag: 'esp_g2' },
    { type: 'sign', tx: 11, ty: 27, text: 'Um cristal apagado aponta para o alto. "Desperto pela magia mais forte. Guiado por mãos firmes."' },
    { enemy: 'sentry', tx: 20, ty: 19 }, { enemy: 'sentry', tx: 30, ty: 27 }, { enemy: 'starling', tx: 16, ty: 27 },
    // constelação 3: na ilhota do vazio (arremesso) — portal para voltar
    { type: 'pickup', item: 'constelacao', tx: 22, ty: 23, flag: 'const3' },
    { type: 'warppad', tx: 23, ty: 23, to: [22, 19], label: 'Voltar' },
    // quebra-cabeça 3: o escudo do Aldren é o espelho
    { type: 'emitter', tx: 13, ty: 10, dir: 'right' },
    { type: 'receptor', id: 'rc3', tx: 16, ty: 5, flag: 'esp_rc3' },
    { type: 'gate', id: 'eg5', tx: 22, ty: 3, requires: ['rc3'], flag: 'esp_g3' }, { type: 'gate', id: 'eg6', tx: 23, ty: 3, requires: ['rc3'], flag: 'esp_g3' },
    { type: 'sign', tx: 19, ty: 13, text: 'Gravado no chão: "Quando faltar espelho, seja o espelho."' },
    { enemy: 'voidknight', tx: 28, ty: 7 }, { enemy: 'starling', tx: 18, ty: 7 },
    // sala da Sentinela: espelho que manda a luz para o receptor da porta
    { type: 'mirror', tx: 30, ty: 10, orient: 0 },
    { type: 'receptor', id: 'rc_side', tx: 30, ty: 15, flag: 'esp_side' },
    { type: 'gate', id: 'eg7', tx: 34, ty: 9, requires: ['rc_side'], flag: 'esp_side_g' }, { type: 'gate', id: 'eg8', tx: 34, ty: 10, requires: ['rc_side'], flag: 'esp_side_g' },
    { enemy: 'sentinel', tx: 40, ty: 9, flag: 'sentinela_dead' },
    { type: 'pickup', item: 'constelacao', tx: 43, ty: 5, flag: 'const4' },
    { type: 'chest', tx: 37, ty: 13, flag: 'chest_esp_sentinela', contents: [{ item: 'nucleo_estelar' }, { item: 'elixir' }], gold: 80, fancy: true },
  ],
  triggers: {
    espelhos_inicio(g) { g.banter('espelhos_inicio'); },
    r3(g) { if (!g.flag('esp_rc3') && !g.flag('tut_beam_shield')) g.toast('Dica: o escudo erguido do Aldren reflete o feixe de luz para onde ele estiver olhando.', 5); },
    secreto_espelhos(g) { G.Audio.sfx('solved'); g.toast('Área secreta: o cofre da Sentinela!', 3); },
  },
});

G.defineArea({
  id: 'torre_jardins',
  title: 'Jardins Suspensos',
  theme: 'tower',
  music: 'void',
  ambience: 'void',
  ambient: 'sparkles',
  darkness: 0.3,
  darkColor: '#0a0820',
  size: [56, 44],
  seed: 181,
  aiFreeTeleport: true,
  fill: 'Z',
  build(b) {
    // ilha de entrada (sul)
    b.rect(24, 36, 8, 7, 'z');
    b.rect(26, 43, 4, 1, 'z');
    // ponte de plataformas até a ilha central
    b.rect(25, 24, 6, 6, 'z');               // ilha central
    b.scatter(25, 24, 6, 6, 'e', 0.2, 'z');
    // oeste: vão curto (Salto) -> jardim do mestre
    b.rect(10, 24, 13, 6, 'z');
    b.rect(23, 26, 2, 2, 'Z');                // vão de 2 tiles (salto)
    b.rect(3, 14, 10, 9, 'z');                // jardim do mestre (memória)
    b.rect(8, 23, 3, 1, 'z');
    b.scatter(3, 14, 10, 9, 'e', 0.25, 'z');
    // leste: ilha da runa (arremesso) e a do cajado
    b.rect(33, 24, 9, 6, 'z');
    b.rect(31, 26, 2, 2, 'Z');                // outro vão curto
    b.rect(46, 22, 7, 8, 'z');                // ilha do cajado (separada por 4 tiles)
    // norte: subida para a câmara dos ecos
    b.rect(24, 3, 8, 8, 'z');
    b.rect(26, 0, 4, 3, 'z');
    for (const [x, y] of [[3, 14], [12, 14], [24, 36], [31, 36]]) b.set(x, y, 'x');
  },
  spawns: { sul: [27, 40], start: [27, 40], norte: [27, 4] },
  spawnDir: 'up',
  exits: [
    { x: 26, y: 43, w: 4, to: 'torre_espelhos', spawn: 'norte' },
    { x: 26, y: 0, w: 4, to: 'camara_ecos', spawn: 'sul' },
  ],
  zones: [
    { x: 24, y: 36, w: 8, h: 2, trigger: 'jardins_inicio' },
    { x: 46, y: 22, w: 7, h: 8, trigger: 'secreto_jardins', flag: 'secret_jardins' },
  ],
  entities: [
    { type: 'waystone', tx: 30, ty: 40, cp: 'cp_jardins', name: 'Jardins Suspensos' },
    { type: 'sign', tx: 25, ty: 37, text: 'As plataformas vão e vêm. Uma bolha de Estase as deixa bem mais pacientes.' },
    // plataformas: entrada -> ilha central (vão de 6 tiles)
    { type: 'platform', tx: 27, ty: 34, tw: 2, th: 2, path: [[27, 34], [27, 30]], speed: 2.4, wait: 0.6 },
    // ilha central -> norte (vão grande, plataforma rápida)
    { type: 'platform', tx: 27, ty: 22, tw: 2, th: 2, path: [[27, 22], [27, 11]], speed: 3, wait: 0.5 },
    { enemy: 'starling', tx: 28, ty: 26 }, { enemy: 'voidknight', tx: 14, ty: 26 }, { enemy: 'starling', tx: 37, ty: 26 },
    // jardim do mestre (memória) — além do vão do Salto
    { type: 'memory', memory: 'aurelian', look: 'star', tx: 7, ty: 17 },
    { type: 'pickup', item: 'constelacao', tx: 4, ty: 21, flag: 'const5' },
    { type: 'chest', tx: 11, ty: 15, flag: 'chest_jardim1', contents: [{ item: 'tonico' }, { item: 'pocao_grande' }], gold: 50 },
    { enemy: 'starling', tx: 9, ty: 19 },
    // ilha do cajado: só arremessando a Lirien; ela ativa a runa e uma ponte aparece
    { type: 'rune', id: 'runa_jardim', tx: 48, ty: 24, flag: 'jardim_runa', say: 'Uma ponte de luz, por favor. Obrigada.' },
    { type: 'mechanism', requires: ['runa_jardim'], flag: 'jardim_ponte', script: 'ponte', onLoad: 'ponteLoad' },
    { type: 'pickup', item: 'cajado_aurelian', tx: 51, ty: 27, flag: 'cajado_pego' },
    { type: 'pickup', item: 'constelacao', tx: 51, ty: 23, flag: 'const6' },
    { type: 'sign', tx: 40, ty: 25, text: 'Uma ilha longe demais para pular. Lá, algo brilha como o cajado de um mestre.' },
    // norte
    { enemy: 'sentry', tx: 25, ty: 5 }, { enemy: 'starling', tx: 30, ty: 8 },
    { type: 'chest', tx: 31, ty: 4, flag: 'chest_jardim2', contents: [{ item: 'elixir' }], gold: 60 },
  ],
  triggers: {
    jardins_inicio(g) { g.banter('jardins_inicio'); },
    secreto_jardins(g) { G.Audio.sfx('solved'); g.toast('Área secreta: a ilha do mestre!', 3); },
  },
  scripts: {
    *ponte(g) {
      g.camera.focus = { x: 44 * 16, y: 26 * 16, speed: 4 };
      yield G.Co.wait(0.4);
      for (let x = 45; x >= 42; x--) { g.level.setTile(x, 26, 'z'); g.level.setTile(x, 27, 'z'); G.Audio.sfx('bridge'); g.particles.burst(x * 16 + 8, 27 * 16, 12, { colors: ['#c8a8ff', '#ffffff'], speed: 40, life: 0.5, glow: true }); yield G.Co.wait(0.2); }
      G.Audio.sfx('solved');
      g.camera.focus = null;
    },
    ponteLoad(g) { for (let x = 42; x <= 45; x++) { g.level.setTile(x, 26, 'z'); g.level.setTile(x, 27, 'z'); } },
  },
});
