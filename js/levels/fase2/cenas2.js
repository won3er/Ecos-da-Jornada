// CUTSCENES do Capítulo II.
(function () {
  const C = G.Co;
  const L = (text) => ({ who: 'lirien', text }), A = (text) => ({ who: 'aldren', text }), N = (id, text) => ({ who: 'npc:' + id, text });

  // ------------------------------------------------------------------ Abertura do capítulo
  G.Scenes.ch2Intro = function* (g) {
    g.state = 'play';
    g.inMemory = null;
    for (const p of g.players) { p.young = false; p.fullHeal(g); }
    g.setCheckpoint({ id: 'cp_vila', area: 'vila', x: 21 * 16 + 8, y: 18 * 16 + 14 });
    g.loadArea('vila', 'start', { silent: true });
    const [li, al] = g.players;
    li.x = 22 * 16; li.y = 13 * 16 + 12; al.x = 25 * 16; al.y = 13 * 16 + 12; li.dir = 'up'; al.dir = 'up';
    g.letterbox(true); g.letter = 1;
    g.camera.focus = { x: 24 * 16, y: 11 * 16, speed: 3 };
    g.camera.x = 24 * 16 - G.VIEW_W / 2; g.camera.y = 11 * 16 - G.VIEW_H / 2;
    G.Audio.playMusic('village', 1);
    yield C.wait(0.4);
    yield g.fadeTo(0, 1.4);
    yield g.titleCard('CAPÍTULO II', 'As Montanhas do Norte', 3);
    yield g.say([
      N('orvin', 'O fragmento ainda brilha, não é?'),
      L('Puxa para o norte. Para as montanhas de Gelvar.'),
      N('orvin', 'Lá em cima fica Pedra-Alta, a vila dos mineiros. E a velha Fortaleza da Vigília.'),
      N('orvin', 'Faz dias que não desce ninguém de lá. Nem os mercadores.'),
      A('Então é para lá que a gente vai.'),
      N('orvin', 'Mandei abrir o portão norte. E levem agasalho!'),
      L('Elfos não sentem frio.'),
      A('Ela sente. Só não admite.'),
    ]);
    g.setFlag('portao_norte', true);
    for (const id of ['portao_n1', 'portao_n2']) { const gt = g.entities.find((e) => e.id === id); if (gt) gt.setOpen(true, g); }
    yield g.camTo(28 * 16 + 8, 4 * 16, 3);
    yield C.wait(0.8);
    g.camRelease();
    g.letterbox(false);
    g.toast('O portão norte está aberto! Sigam para as Montanhas de Gelvar.', 5);
    yield C.wait(0.3);
    g.toast('Pedras de Retorno agora permitem VIAJAR entre as que vocês já ativaram.', 5);
    g.save();
  };

  // ------------------------------------------------------------------ Grumak
  G.Scenes.grumakIntro = function* (g) {
    const boss = g.entities.find((e) => e.type === 'grumak' && !e.dead);
    if (!boss || boss.state !== 'sleep') return;
    const lead = g.players.filter((p) => p && !p.isDown).sort((a, b) => b.x - a.x)[0] || g.players[0];
    g.regroup(lead);
    const gin = g.entities.find((e) => e.id === 'grumak_in');
    if (gin) { gin.pushTo = { x: boss.x, y: boss.y }; gin.setOpen(false, g); }
    g.letterbox(true);
    G.Audio.playMusic(null, 1);
    yield g.camTo(boss.x, boss.y - 24, 3);
    const first = !g.flag('grumak_seen');
    if (first) yield g.say([A('Um urso. Feito de gelo.'), L('Um urso coberto de gelo. Tem diferença.'), A('Faz diferença pra gente?'), L('Faz. Gelo derrete.')]);
    G.Audio.sfx('roar'); g.camera.shake(5, 1);
    boss.state = 'roar'; boss.stateT = 0;
    yield C.wait(0.6);
    yield g.titleCard('GRUMAK', 'O Urso-de-Geada', 2.4);
    g.setFlag('grumak_seen', true);
    g.camRelease(); g.letterbox(false);
    boss.wake(g); boss.cd = 1.2;
    G.Audio.playMusic('boss2', 0.6);
    g.toast('Lirien: CHAMA ESTELAR derrete a couraça. Aldren: apare a patada, bloqueie o sopro e faça ele bater nos pilares.', 6);
  };

  G.Scenes.grumakDefeated = function* (g) {
    g.setFlag('grumak_dead', true);
    for (const id of ['grumak_in', 'grumak_out1', 'grumak_out2']) { const gt = g.entities.find((e) => e.id === id); if (gt) gt.setOpen(true, g); }
    G.Audio.playMusic('victory', 0.5);
    yield C.wait(1.2);
    g.letterbox(true);
    yield g.say([
      A('Ele só queria dormir em paz, né?'),
      L('Queria. A estrela não deixou. O frio dela acordou tudo que dormia aqui.'),
      A('Lirien... quando eu te ergui pra desviar daquela patada...'),
      L('Você me jogou.'),
      A('Eu te ARREMESSEI. Com técnica.'),
      L('...Faz de novo. Quando precisar.'),
    ]);
    g.abilities.add('arremesso');
    g.inv.add('garra_urso', 1, g); g.inv.add('cristal_gelido', 1, g);
    g.addGold(80);
    g.refreshStats();
    G.Audio.sfx('levelup');
    g.toast('Nova técnica do Aldren: ARREMESSO! Perto da Lirien, aperte ' + G.Characters.aldren.keys.act + ' para erguê-la e de novo para lançá-la por cima de muros baixos, água e abismos.', 7);
    g.toast('Obtidos: Garra de Geada, Cristal Gélido e 80 moedas.', 4);
    g.addPoints(1);
    g.letterbox(false);
    yield C.wait(2);
    G.Audio.playMusic('mine', 2);
    g.save();
  };

  // ------------------------------------------------------------------ Ysveth
  G.Scenes.ysvethIntro = function* (g) {
    const boss = g.entities.find((e) => e.type === 'ysveth' && !e.dead);
    if (!boss || boss.state !== 'dormant') return;
    const lead = g.players.filter((p) => p && !p.isDown).sort((a, b) => a.y - b.y)[0] || g.players[0];
    g.regroup(lead);
    for (const id of ['ys_g1', 'ys_g2']) { const gt = g.entities.find((e) => e.id === id); if (gt) { gt.pushTo = { x: 16 * 16, y: 15 * 16 }; gt.setOpen(false, g); } }
    g.letterbox(true);
    G.Audio.playMusic(null, 1);
    yield g.camTo(boss.x, boss.y - 30, 2.5);
    const first = !g.flag('ysveth_seen');
    if (first) yield g.say([
      { who: 'ysveth', text: 'Visitantes. Depois de tanto tempo... ou de tempo nenhum.' },
      A('Foi você que congelou Pedra-Alta?'),
      { who: 'ysveth', text: 'Eu os salvei. Num instante que não acaba, ninguém envelhece. Ninguém perde ninguém.' },
      { who: 'ysveth', text: 'Você, humano. Você sabe do que estou falando. Ela vai continuar. Você, não.' },
      A('...'),
      { who: 'ysveth', text: 'Fiquem. Eu paro o tempo para vocês dois. Para sempre.' },
      L('Um instante que nunca acaba não é uma vida. É uma prisão bonita.'),
      A('E eu prefiro envelhecer do lado dela do que ficar parado aqui.'),
    ]);
    G.Audio.sfx('shatter'); g.camera.shake(4, 0.8); g.flashScreen('#e8faff', 0.4);
    boss.state = 'transition'; boss.stateT = 0; boss.z = 0;
    yield C.wait(1.2);
    yield g.titleCard('YSVETH', 'A Geada Eterna', 2.8);
    g.setFlag('ysveth_seen', true);
    g.camRelease(); g.letterbox(false);
    boss.activate(g);
    G.Audio.playMusic('boss2', 0.5);
    g.toast('Fogo quebra as cópias de gelo. Aldren: apare as lanças grandes para devolvê-las!', 5);
  };

  G.Scenes.ysvethDefeated = function* (g) {
    g.setFlag('ysveth_dead', true);
    g.bossBar = null;
    for (const id of ['ys_g1', 'ys_g2']) { const gt = g.entities.find((e) => e.id === id); if (gt) gt.setOpen(true, g); }
    G.Audio.playMusic('victory', 0.5);
    yield C.wait(1.6);
    g.letterbox(true);
    yield g.say([
      { who: 'ysveth', text: 'Por quê... recusar a eternidade...?' },
      L('Porque a gente já tem uma coisa melhor.'),
      { who: 'ysveth', text: 'O quê...?' },
      L('Amanhã.'),
    ]);
    G.Audio.sfx('memory');
    const [li] = g.players;
    g.particles.burst(16 * 16 + 8, 10 * 16, 40, { colors: ['#c8f0ff', '#ffffff', '#f2d98c'], speed: 60, life: 1.4, glow: true, up: 20 });
    yield C.wait(1);
    yield g.say([
      A('Ela deixou alguma coisa. Uma ampulheta quebrada.'),
      L('O coração dela. Ainda tem um pouco de tempo dentro.'),
      L('...Consigo segurar. Só um pouco. Só um instante.'),
    ]);
    if (!g.unlockedSpells.includes('stasis')) g.unlockedSpells.push('stasis');
    g.inv.add('nucleo_tempo', 1, g);
    g.addGold(200); g.addPoints(2);
    g.refreshStats();
    G.Audio.sfx('levelup');
    g.toast('Nova magia: ESTASE! Cria uma bolha onde o tempo anda devagar para inimigos, projéteis e plataformas.', 7);
    g.toast('Obtidos: Ampulheta Partida, 200 moedas e 2 Pontos de Lembrança.', 4);
    yield C.wait(1.2);
    yield g.say([
      A('Lirien. Quantos anos você tem? De verdade.'),
      L('Por que isso agora?'),
      A('Porque ela tinha razão numa coisa. Eu vou envelhecer. E você não.'),
      L('...'),
      L('Lembra do seu aniversário de dez anos?'),
    ]);
    g.letterbox(false);
    g.save();
    yield C.wait(0.4);
    g.startMemory('aniversario');
    yield C.until(() => g.memories.has('aniversario') && !g.co.list.some((c) => c.name === 'memory'));
    yield C.wait(0.6);
    yield* G.Scenes.ch2Finale(g);
  };

  G.Scenes.ch2Finale = function* (g) {
    g.letterbox(true);
    yield g.say([
      A('A pedrinha que brilhava. Eu ainda tenho.'),
      L('Eu sei. Está no seu bolso desde Brisaclara.'),
      A('Eu prometi contar os seus aniversários.'),
      L('E contou?'),
      A('Todos os doze. Do jeito que deu. Mesmo sem você.'),
      L('...'),
      L('Aldren. Os fragmentos estão apontando para outro lugar agora.'),
      A('Para onde?'),
      L('Para Velmora. Para onde tudo começou. Há trezentos anos.'),
      A('Trezentos anos? Você estava lá?'),
      L('Estava. Eu te conto. Lá.'),
    ]);
    g.setFlag('chapter2_done', true);
    g.setCheckpoint({ id: 'cp_trono', area: 'fortaleza', x: 22 * 16 + 8, y: 4 * 16 + 30 });
    g.save();
    G.Audio.playMusic('title', 2);
    yield g.fadeTo(1, 2.5);
    g.letterbox(false);
    g.ui.push(new G.ChapterEnd(2));
    g.fade.target = 0; g.fade.a = 0;
  };
})();
