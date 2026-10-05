// MEMÓRIA JOGÁVEL do Capítulo III — "A Queda de Velmora".
// Trezentos anos atrás: Lirien e Sir Talen sobem pela cidade em chamas até
// Mestre Aurelian, que sela Nyxara. Sir Talen (jogador 2) usa o Salto do Herói.
G.defineArea({
  id: 'mem_velmora',
  title: 'Velmora, trezentos anos atrás',
  theme: 'ruins',
  music: 'memory',
  ambience: 'void',
  ambient: 'embers',
  darkness: 0.25,
  darkColor: '#2a0a10',
  tint: '#f4dccc',
  combatMusic: false,
  size: [36, 24],
  seed: 161,
  fill: '#',
  build(b) {
    b.rect(2, 13, 13, 10, '_');           // praça de partida
    b.rect(15, 12, 2, 11, 'C');           // vão (só o Salto atravessa)
    b.rect(17, 12, 17, 11, '_');          // praça leste
    b.rect(24, 6, 4, 6, '_');             // escadaria
    b.rect(12, 1, 20, 5, 'p');            // círculo do selo
    b.scatter(2, 13, 31, 10, 'R', 0.05, '_');
    for (const [x, y] of [[4, 14], [12, 14], [20, 14], [31, 14], [4, 21], [31, 21]]) b.set(x, y, 'k');
  },
  spawns: { start: [5, 19] },
  entities: [
    { type: 'icefall', tx: 3, ty: 14, tw: 11, th: 8, rate: 1.1, meteor: true, dmg: 7 },
    { type: 'icefall', tx: 18, ty: 13, tw: 15, th: 9, rate: 0.9, meteor: true, dmg: 7 },
    { type: 'lever', id: 'mv_lever', tx: 21, ty: 15, flag: 'mv_ponte' },
    { type: 'mechanism', requires: ['mv_lever'], script: 'ponte', blocking: true },
    { type: 'altar', id: 'mv_altar', tx: 21, ty: 3, duration: 9, onStart: 'ritual', onDone: 'selado' },
    { npc: 'aurelian', tx: 26, ty: 3 },
    { type: 'sign', tx: 7, ty: 15, text: 'Velmora queima. No céu, uma estrela enorme abre um olho.' },
  ],
  zones: [{ x: 12, y: 1, w: 20, h: 5, trigger: 'selo' }],
  triggers: {
    selo(g) {
      g.co.start(function* () {
        yield g.say([
          { who: 'npc:aurelian', text: 'Lirien. Talen. Chegaram a tempo.' },
          { who: 'lirien', text: 'Mestre, o que é aquilo?' },
          { who: 'npc:aurelian', text: 'Nyxara. A mãe das estrelas famintas. Ela devora o tempo, a memória, tudo que brilha.' },
          { who: 'npc:aurelian', text: 'Lirien, canalize no altar. Eu preparo o selo. Talen, ninguém toca nela.' },
          { who: 'talen', text: 'Ninguém toca nela. Juro pela minha espada.' },
        ]);
        g.toast('Lirien: use o altar (' + G.Characters.lirien.keys.act + ') e canalize. Sir Talen protege.', 5);
      }, g, { name: 'seloIntro' });
    },
  },
  scripts: {
    *start(g) {
      const C = G.Co;
      g.unlockedSpells = ['frost', 'tk', 'bridge']; g.players[0].spell = 'frost';
      g.abilities.add('salto'); g.abilities.add('reflexao');
      yield C.wait(0.4);
      yield g.say([
        { who: 'talen', text: 'Lirien! A ponte caiu! O Mestre Aurelian está lá em cima!' },
        { who: 'lirien', text: 'O vão é largo demais para mim.' },
        { who: 'talen', text: 'Para mim, não. Eu pulo e baixo a ponte do outro lado.' },
        { who: 'lirien', text: 'Você é imprudente, Talen.' },
        { who: 'talen', text: 'Sou rápido. É parecido.' },
      ]);
      g.toast('Sir Talen: faça a investida (' + G.Characters.aldren.keys.act + ') na beira do vão para SALTAR.', 6);
      for (const [x, y] of [[8, 17], [24, 18], [28, 14]]) { const e = g.spawnEnemy('starling', x * 16 + 8, y * 16 + 14, { hpMul: 0.7 }); if (e) e.dmg = 5; }
    },
    *ponte(g) {
      g.camera.focus = { x: 16 * 16, y: 18 * 16, speed: 4 };
      yield G.Co.wait(0.4);
      for (const x of [16, 15]) { g.level.setTile(x, 17, '_'); g.level.setTile(x, 18, '_'); G.Audio.sfx('push'); g.camera.shake(1.5, 0.15); yield G.Co.wait(0.25); }
      G.Audio.sfx('solved');
      g.camera.focus = null;
      g.bubble(g.players[1], 'Vem, Lirien! Rápido!', 2);
    },
    *ritual(g) {
      const waves = [[['starling', 14, 3], ['starling', 30, 4]], [['voidknight', 13, 5]], [['starling', 16, 2], ['starling', 29, 2], ['starling', 22, 5]]];
      for (const w of waves) {
        if (g.flag('mv_selado')) return;
        for (const [t, x, y] of w) { const e = g.spawnEnemy(t, x * 16 + 8, y * 16 + 14, { hpMul: 0.7 }); if (e) { e.aggro = true; e.target = g.players[0]; } }
        yield G.Co.wait(3.2);
      }
    },
    *selado(g) {
      const C = G.Co;
      g.setFlag('mv_selado', true);
      for (const e of g.entities) if (e.isEnemy && !e.dead) e.die(g);
      g.letterbox(true);
      yield C.wait(0.6);
      yield g.say([
        { who: 'npc:aurelian', text: 'Bom trabalho. Agora, para trás. Os dois.' },
        { who: 'lirien', text: 'Mestre, o selo precisa de alguém dentro dele. Você não...' },
        { who: 'npc:aurelian', text: 'Lirien. Uma estrela leva cem anos para florescer.' },
        { who: 'npc:aurelian', text: 'Esta vai levar trezentos para acordar. Até lá, você vai ter aprendido o que eu nunca aprendi.' },
        { who: 'lirien', text: 'O quê?' },
        { who: 'npc:aurelian', text: 'A não fazer as coisas sozinha.' },
      ]);
      G.Audio.sfx('memory'); g.flashScreen('#ffffff', 1);
      g.camera.shake(6, 1.4);
      const au = g.entities.find((e) => e.npcId === 'aurelian');
      if (au) { g.particles.burst(au.x, au.y - 12, 60, { colors: ['#ffffff', '#f2d98c', '#c8a8ff'], speed: 90, life: 1.4, glow: true }); au.dead = true; }
      yield C.wait(1.6);
      yield g.say([
        { who: 'lirien', text: 'MESTRE!' },
        { who: 'talen', text: 'Lirien... a cidade está caindo. Precisamos ir.' },
        { who: 'lirien', text: '...' },
        { who: 'talen', text: 'Eu fico com você. Até o fim. Prometo.' },
      ]);
      yield C.wait(0.8);
      g.letterbox(false);
      g.endMemory();
    },
  },
});
