// CUTSCENES do Capítulo III e o final do jogo.
(function () {
  const C = G.Co;
  const L = (text) => ({ who: 'lirien', text }), A = (text) => ({ who: 'aldren', text }), N = (id, text) => ({ who: 'npc:' + id, text });
  const NY = (text) => ({ who: 'nyxara', text });

  // ------------------------------------------------------------------ Abertura
  G.Scenes.ch3Intro = function* (g) {
    g.state = 'play';
    g.inMemory = null;
    for (const p of g.players) { p.young = false; p.talen = false; p.fullHeal(g); }
    g.setCheckpoint({ id: 'cp_ruinas0', area: 'ruinas', x: 27 * 16 + 8, y: 36 * 16 + 30 });
    g.loadArea('ruinas', 'sul', { silent: true });
    const [li, al] = g.players;
    li.x = 44 * 16; li.y = 31 * 16 + 12; al.x = 45 * 16 + 8; al.y = 32 * 16 + 12; li.dir = 'right'; al.dir = 'right';
    g.letterbox(true); g.letter = 1;
    g.camera.focus = { x: 45 * 16, y: 30 * 16, speed: 3 };
    g.camera.x = 45 * 16 - G.VIEW_W / 2; g.camera.y = 30 * 16 - G.VIEW_H / 2;
    G.Audio.playMusic('memory', 1);
    yield C.wait(0.4);
    yield g.fadeTo(0, 1.4);
    yield g.titleCard('CAPÍTULO III', 'A Última Estrela', 3);
    yield g.say([
      A('Velmora de novo. Parece que foi ontem.'),
      L('Para mim, tudo parece ontem. Esse é o problema.'),
      L('Aldren. Velmora não caiu por acaso. Há trezentos anos, uma estrela despertou aqui.'),
      L('A mãe das estrelas que estão caindo agora. Nyxara.'),
      A('E você estava aqui.'),
      L('Eu era aprendiz. Meu mestre a selou. E eu... fui embora. Por trezentos anos.'),
      A('Ir embora é a sua especialidade.'),
      L('Era. Desta vez, eu entro.'),
    ]);
    G.Audio.sfx('gate'); g.camera.shake(4, 1);
    g.setFlag('velmora_aberta', true);
    for (const id of ['velmora_g1', 'velmora_g2']) { const gt = g.entities.find((e) => e.id === id); if (gt) gt.setOpen(true, g); }
    g.flashScreen('#c8a8ff', 0.4);
    yield C.wait(0.8);
    yield g.say([A('A passagem abriu sozinha.'), L('A cidade está chamando.')]);
    g.camRelease();
    g.letterbox(false);
    G.Audio.playMusic('dungeon', 2);
    g.toast('A passagem leste das Ruínas de Velmora se abriu. Entrem em Velmora Desperta!', 5);
    g.save();
  };

  // ------------------------------------------------------------------ Os Ecos
  G.Scenes.ecosIntro = function* (g) {
    const pair = g.entities.find((e) => e instanceof G.ObjectTypes.echopair && !e.dead);
    if (!pair || pair.started) return;
    const lead = g.players.filter((p) => p && !p.isDown).sort((a, b) => a.y - b.y)[0] || g.players[0];
    g.regroup(lead);
    for (const id of ['ec_g1', 'ec_g2']) { const gt = g.entities.find((e) => e.id === id); if (gt) { gt.pushTo = { x: 14 * 16, y: 12 * 16 }; gt.setOpen(false, g); } }
    g.letterbox(true);
    G.Audio.playMusic(null, 1);
    yield g.camTo(14 * 16 + 8, 11 * 16, 3);
    const first = !g.flag('ecos_seen');
    if (first) yield g.say([
      A('Somos... nós?'),
      { who: 'sign', text: 'Duas sombras levantam do chão espelhado. Uma tem orelhas pontudas. A outra segura uma espada.' },
      { who: 'sign', text: '"Eu sou a que vai embora sem dizer tchau", diz uma voz igual à de Lirien.' },
      { who: 'sign', text: '"Eu sou o que ficou esperando sozinho", diz a outra, com a voz de Aldren.' },
      L('Ecos. A torre guarda o que a gente deixa para trás.'),
      A('Então vamos deixar isso para trás de vez.'),
    ]);
    G.Audio.sfx('roar'); g.camera.shake(4, 0.8);
    yield g.titleCard('OS ECOS', 'O que ficou para trás', 2.4);
    g.setFlag('ecos_seen', true);
    g.camRelease(); g.letterbox(false);
    pair.activate(g);
    G.Audio.playMusic('boss2', 0.5);
    g.toast('Os Ecos se protegem quando estão juntos. Separem os dois: provocação do Aldren puxa o Eco dele; Geada segura o Eco dela.', 6);
  };

  G.Scenes.ecosDefeated = function* (g) {
    for (const id of ['ec_g1', 'ec_g2', 'ec_n1', 'ec_n2']) { const gt = g.entities.find((e) => e.id === id); if (gt) gt.setOpen(true, g); }
    G.Audio.playMusic('victory', 0.5);
    yield C.wait(1.2);
    g.letterbox(true);
    yield g.say([
      A('Eu esperei, sim. Doze anos.'),
      L('Eu sei.'),
      A('Mas não estava sozinho. Eu tinha a promessa.'),
      L('E eu fui embora. Muitas vezes.'),
      L('Mas eu sempre voltei. Mesmo quando demorei.'),
      A('Doze anos é demorar MUITO.'),
      L('Para um elfo, foi um fim de semana.'),
    ]);
    g.inv.add('eco_unido', 1, g);
    g.addGold(150); g.addPoints(2);
    g.refreshStats();
    G.Audio.sfx('levelup');
    g.toast('Obtido: Eco Unido (a barra de especial enche 50% mais rápido), 150 moedas e 2 Pontos de Lembrança.', 6);
    g.letterbox(false);
    yield C.wait(1.5);
    G.Audio.playMusic('tower', 2);
    g.save();
  };

  // ------------------------------------------------------------------ Nyxara
  G.Scenes.nyxaraIntro = function* (g) {
    const boss = g.entities.find((e) => e.type === 'nyxara' && !e.dead);
    if (!boss || boss.state !== 'dormant') return;
    const lead = g.players.filter((p) => p && !p.isDown).sort((a, b) => a.y - b.y)[0] || g.players[0];
    g.regroup(lead);
    for (const id of ['ny_g1', 'ny_g2']) { const gt = g.entities.find((e) => e.id === id); if (gt) { gt.pushTo = { x: 18 * 16, y: 15 * 16 }; gt.setOpen(false, g); } }
    g.letterbox(true);
    G.Audio.playMusic(null, 1.5);
    yield g.camTo(boss.x, boss.y - 30, 2.2);
    const first = !g.flag('nyxara_seen');
    if (first) yield g.say([
      NY('Lirien. A aprendiz que fugiu.'),
      L('Nyxara.'),
      NY('Seu mestre me prendeu com a própria vida. E você? O que vai me dar?'),
      L('Nada. Eu não vim sozinha desta vez.'),
      NY('Um humano? Ele vai envelhecer e morrer, e você vai lembrar dele por mil anos. Eu posso tirar essa dor de você. Posso comer essa lembrança.'),
      A('Nem pense nisso.'),
      L('Essa lembrança é a melhor coisa que eu tenho.'),
    ]);
    G.Audio.sfx('explosion'); G.Audio.sfx('roar'); g.flashScreen('#ffffff', 0.5); g.camera.shake(6, 1.2);
    boss.state = 'transition'; boss.stateT = 0; boss.z = 0;
    yield C.wait(1.4);
    yield g.titleCard('NYXARA', 'A Mãe das Estrelas', 3);
    g.setFlag('nyxara_seen', true);
    g.camRelease(); g.letterbox(false);
    boss.activate(g);
    G.Audio.playMusic('finalboss', 0.5);
    g.toast('O véu estelar só cede à magia concentrada, ao Prisma ou ao fogo. Depois, ataquem com tudo!', 5);
  };

  G.Scenes.nyxaraDefeated = function* (g) {
    g.setFlag('nyxara_dead', true);
    g.bossBar = null;
    for (const id of ['ny_g1', 'ny_g2']) { const gt = g.entities.find((e) => e.id === id); if (gt) gt.setOpen(true, g); }
    G.Audio.playMusic('hope', 1);
    yield C.wait(1.6);
    g.letterbox(true);
    yield g.say([
      NY('Juntos... foi isso que Aurelian disse... há trezentos anos...'),
      NY('Uma estrela sem ninguém para lembrar dela... só sabe ter fome.'),
      L('Então eu lembro de você. Eu tenho tempo de sobra para lembrar.'),
      A('E eu lembro junto. Enquanto eu puder.'),
      NY('...Que estranho. Não estou mais com fome.'),
    ]);
    g.flashScreen('#ffffff', 1); G.Audio.sfx('memory'); G.Audio.sfx('bell');
    g.particles.burst(18 * 16, 12 * 16, 120, { colors: ['#f2d98c', '#ffffff', '#c8a8ff', '#8ae8ff'], speed: 120, life: 2, glow: true, up: 30 });
    yield C.wait(2);
    g.inv.add('coracao_estelar', 1, g);
    g.refreshStats();
    yield g.say([
      A('Ela virou... uma estrela comum. Pequena.'),
      L('Ela vai voltar para o céu. Devagar. Como as estrelas de verdade.'),
      A('Lirien. Acabou?'),
      L('Acabou. ...Aldren?'),
      A('Hm?'),
      L('Me leva para casa. Pelo caminho mais longo.'),
    ]);
    g.setFlag('chapter3_done', true);
    g.save();
    yield g.fadeTo(1, 2.4);
    g.letterbox(false);
    g.loadArea('colina_fim', 'start', { silent: true });
    g.fade.color = '#000';
    yield C.wait(0.5);
    yield g.titleCard('ALGUM TEMPO DEPOIS', 'A colina de Brisaclara', 2.6);
    yield g.fadeTo(0, 1.6);
    g.toast('Subam a colina juntos.', 4);
  };

  // ------------------------------------------------------------------ Epílogo
  G.Scenes.epilogue = function* (g) {
    const [li, al] = g.players;
    g.letterbox(true);
    yield C.wait(0.3);
    yield C.all(g.walkTo(li, 14 * 16, 5 * 16 + 4, 40), g.walkTo(al, 16 * 16, 5 * 16 + 4, 40));
    li.dir = 'up'; al.dir = 'up';
    g.setFlag('meteoros_fim', true);
    yield g.camTo(15 * 16, 3 * 16, 2);
    yield C.wait(2);
    yield g.say([
      A('Uma chuva de estrelas. Igual àquela noite.'),
      L('Quatrocentas e treze.'),
      A('Você ainda conta?'),
      L('Esta é a primeira que eu vejo do seu lado desde aquela. Então essa conta.'),
      A('Lembra da promessa? Ficar forte e viajar com você.'),
      L('Você ficou forte.'),
      A('E você voltou.'),
      L('Aldren. Eu vou ficar. Por aqui. Por uns sessenta anos, mais ou menos.'),
      A('Só sessenta?'),
      L('Depois disso... eu lembro por nós dois.'),
      A('Então vamos fazer valer a pena. Cada aniversário.'),
      L('Cada um. Eu vou contar.'),
    ]);
    yield C.wait(2.5);
    yield g.titleCard('FIM', 'Obrigado por jogarem juntos', 4);
    g.setFlag('meteoros_fim', false);
    g.letterbox(false);
    yield g.fadeTo(1, 2);
    G.Audio.playMusic('title', 2);
    g.ui.push(new G.Credits());
    g.fade.target = 0; g.fade.a = 0;
  };
})();
