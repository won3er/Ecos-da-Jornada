// CAPÍTULO II — Minas de Cristal (escuras): teias (fogo queima), caixote na
// placa pesada + braseiros que pedem fogo, corredor de estalactites (escudo
// para cima protege), Tavi congelado num nicho de gelo, parede rachada secreta
// e o MINI-CHEFE Grumak, que guarda a saída para os picos.
G.defineArea({
  id: 'minas',
  title: 'Minas de Cristal',
  theme: 'mine',
  music: 'mine',
  ambience: 'mine',
  ambient: 'dust',
  darkness: 0.82,
  darkColor: '#04060c',
  size: [58, 40],
  seed: 97,
  fill: 'c',
  meltTo: 'f',
  build(b) {
    // A: salão de entrada (oeste)
    b.rect(1, 17, 14, 9, 'f');
    b.rect(0, 20, 2, 2, 'j');
    b.rect(2, 20, 12, 2, 'j');
    // passagem com teias para o norte (B) e para o sul (C)
    b.rect(8, 8, 3, 9, 'f');
    b.rect(8, 26, 3, 6, 'f');
    // B: salão de cristal (norte) — caixote, placa e braseiros
    b.rect(5, 2, 24, 7, 'f');
    b.rect(12, 5, 12, 1, 'f');
    b.scatter(5, 2, 24, 7, 'u', 0.05, 'f');
    // passagem B -> D (portão em 29,5)
    b.rect(29, 4, 1, 3, 'f');
    // corredor das estalactites
    b.rect(30, 4, 8, 3, 'j');
    // C: salão central (só pelo oeste) e o poço fundo (sul, atrás das teias)
    b.rect(16, 18, 14, 9, 'f');
    b.rect(15, 21, 1, 2, 'f');
    b.rect(4, 31, 18, 7, 'f');
    // nicho do Tavi (atrás de uma parede de gelo)
    b.rect(24, 32, 5, 5, 'f');
    b.set(22, 34, 'f'); b.set(22, 35, 'f');
    b.set(23, 34, 'I'); b.set(23, 35, 'I');
    // câmara secreta (parede rachada em 29,34)
    b.set(29, 34, 'f');
    b.rect(30, 32, 5, 5, 'f');
    // D: corredor até a arena + pedra de retorno
    b.rect(36, 4, 3, 20, 'f');
    b.rect(34, 18, 5, 6, 'f');
    // E: arena do Grumak
    b.rect(40, 8, 16, 18, 'f');
    b.set(39, 16, 'f');
    // pilares de cristal na arena (quebram na investida)
    for (const [x, y] of [[43, 11], [52, 11], [43, 22], [52, 22], [47, 16]]) b.set(x, y, 'x');
    // saída norte (portão abre com o Grumak derrotado)
    b.rect(47, 0, 2, 8, 'f');
    b.scatter(1, 1, 56, 38, 'Y', 0.02, 'f');
    b.replace('Y', 'f', 0, 19, 16, 4);
    b.replace('Y', 'f', 40, 8, 16, 18);
    b.replace('Y', 'f', 36, 4, 3, 20);
    b.replace('Y', 'f', 5, 4, 24, 3);
    b.replace('Y', 'f', 4, 33, 31, 3);
  },
  spawns: { oeste: [2, 20], start: [2, 20], norte: [47, 2], arena: [41, 16] },
  exits: [
    { x: 0, y: 20, h: 2, to: 'pedra_alta', spawn: 'leste' },
    { x: 47, y: 0, w: 2, to: 'picos', spawn: 'sul' },
  ],
  zones: [
    { x: 3, y: 18, w: 2, h: 7, trigger: 'minas_inicio' },
    { x: 7, y: 14, w: 5, h: 2, trigger: 'minas_teia' },
    { x: 36, y: 14, w: 3, h: 4, trigger: 'minas_rugido' },
    { x: 41, y: 8, w: 15, h: 18, trigger: 'arenaGrumak' },
    { x: 30, y: 32, w: 5, h: 5, trigger: 'secreto_minas', flag: 'secret_minas' },
  ],
  entities: [
    { type: 'decor', kind: 'stairs', tx: 0, ty: 20, sw: 1 },
    { type: 'light', tx: 6, ty: 21, r: 80, a: 0.4, color: '#7ac0e8' },
    { type: 'brazier', tx: 3, ty: 18, lit: true }, { type: 'brazier', tx: 12, ty: 18, lit: true },
    { type: 'sign', tx: 6, ty: 18, text: 'Minas de Cristal. "Turno da noite: cuidado com as aranhas. E com o urso."' },
    { type: 'decor', kind: 'barrel', tx: 13, ty: 24 },
    { enemy: 'spider', tx: 11, ty: 23 }, { enemy: 'crystalbat', tx: 6, ty: 24 },
    // teias bloqueiam as passagens norte e sul
    { type: 'thorns', kind: 'web', tx: 9, ty: 15, flag: 'mina_teia1' }, { type: 'thorns', kind: 'web', tx: 8, ty: 15, flag: 'mina_teia1b' }, { type: 'thorns', kind: 'web', tx: 10, ty: 15, flag: 'mina_teia1c' },
    { type: 'thorns', kind: 'web', tx: 8, ty: 27, flag: 'mina_teia2' }, { type: 'thorns', kind: 'web', tx: 9, ty: 27, flag: 'mina_teia2b' }, { type: 'thorns', kind: 'web', tx: 10, ty: 27, flag: 'mina_teia2c' },
    // B: caixote -> placa pesada + braseiros de fogo -> portão leste
    { type: 'crate', tx: 7, ty: 5 },
    { type: 'plate', id: 'p_mina', kind: 'heavy', tx: 22, ty: 5 },
    { type: 'brazier', id: 'br_m1', tx: 6, ty: 3, needsFire: true }, { type: 'brazier', id: 'br_m2', tx: 27, ty: 3, needsFire: true },
    { type: 'gate', id: 'g_mina1', tx: 29, ty: 5, requires: ['p_mina', 'br_m1', 'br_m2'], flag: 'mina_portao1' },
    { type: 'sign', tx: 15, ty: 3, text: 'Inscrição dos mineiros: "Peso no chão, fogo no alto. Só os dois juntos abrem o veio leste."' },
    { enemy: 'spider', tx: 18, ty: 6 }, { enemy: 'crystalbat', tx: 24, ty: 3 }, { enemy: 'snowling', tx: 12, ty: 3 },
    { type: 'light', tx: 16, ty: 5, r: 90, a: 0.3, color: '#7ac0e8' },
    // corredor das estalactites
    { type: 'icefall', tx: 30, ty: 4, tw: 8, th: 3, rate: 0.9 },
    { type: 'sign', tx: 31, ty: 7, text: 'Rabisco na parede: "Teto podre. Escudo pra cima e reza."' },
    // C: salão central e poço
    { enemy: 'spider', tx: 20, ty: 20 }, { enemy: 'spider', tx: 26, ty: 24 }, { enemy: 'crystalbat', tx: 22, ty: 19 },
    { enemy: 'snowling', tx: 10, ty: 34 }, { enemy: 'snowling', tx: 17, ty: 35 }, { enemy: 'crystalbat', tx: 6, ty: 33 },
    { type: 'chest', tx: 5, ty: 36, flag: 'chest_minas1', contents: [{ item: 'cristal_gelido' }], gold: 25 },
    { type: 'light', tx: 22, ty: 22, r: 90, a: 0.3, color: '#7ac0e8' },
    { type: 'light', tx: 16, ty: 34, r: 90, a: 0.3, color: '#7ac0e8' },
    { type: 'frozen', who: 'tavi', tx: 26, ty: 35 },
    { type: 'sign', tx: 20, ty: 33, text: 'Pegadas pequenas entram no gelo azul... e não saem.' },
    // câmara secreta: parede rachada (golpe pesado)
    { type: 'cracked', tx: 29, ty: 34, wall: true, flag: 'mina_parede' },
    { type: 'chest', tx: 32, ty: 34, flag: 'chest_minas_secreto', contents: [{ item: 'pagina_diario' }, { item: 'minerio' }], gold: 40, fancy: true },
    { type: 'sign', tx: 27, ty: 36, text: 'O eco aqui soa oco. Muito oco.' },
    // D: antes da arena
    { type: 'waystone', tx: 36, ty: 21, cp: 'cp_minas', name: 'Fundo das Minas' },
    { type: 'brazier', tx: 34, ty: 19, lit: true },
    { enemy: 'spider', tx: 37, ty: 10 },
    // E: arena
    { type: 'gate', id: 'grumak_in', tx: 39, ty: 16, flag: 'grumak_in_open', latch: false },
    { type: 'gate', id: 'grumak_out1', tx: 47, ty: 7, flag: 'grumak_dead' },
    { type: 'gate', id: 'grumak_out2', tx: 48, ty: 7, flag: 'grumak_dead' },
    { enemy: 'grumak', tx: 48, ty: 17, flag: 'grumak_dead' },
    { type: 'light', tx: 47, ty: 16, r: 160, a: 0.5, color: '#7ac0e8' },
    { type: 'brazier', tx: 41, ty: 9, lit: true }, { type: 'brazier', tx: 54, ty: 9, lit: true },
    { type: 'brazier', tx: 41, ty: 24, lit: true }, { type: 'brazier', tx: 54, ty: 24, lit: true },
  ],
  triggers: {
    minas_inicio(g) { g.banter('minas_inicio'); },
    minas_teia(g) { g.banter('minas_teia'); },
    minas_rugido(g) { if (!g.flag('grumak_dead')) g.banter('minas_rugido'); },
    secreto_minas(g) { G.Audio.sfx('solved'); g.toast('Área secreta: o veio esquecido!', 3); },
    arenaGrumak(g) { if (!g.flag('grumak_dead')) g.co.start(G.Scenes.grumakIntro, g, { name: 'grumakIntro' }); },
  },
  onEnter(g) {
    const gin = g.entities.find((e) => e.id === 'grumak_in');
    if (gin) gin.setOpen(true, g, true);
    g.boss = g.entities.find((e) => e.type === 'grumak');
  },
  scripts: {
    *grumakDefeated(g) { yield* G.Scenes.grumakDefeated(g); },
  },
});
