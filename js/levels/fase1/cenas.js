// CUTSCENES da Fase 1 (corrotinas). Curtas, com tarjas de cinema e falas breves.
(function () {
  const C = G.Co;
  const L = (text) => ({ who: 'lirien', text }), A = (text) => ({ who: 'aldren', text }), N = (id, text) => ({ who: 'npc:' + id, text });

  // ------------------------------------------------------------------ Abertura
  G.Scenes.intro = function* (g) {
    const [li, al] = g.players;
    g.letterbox(true);
    g.letter = 1;
    li.x = 22 * 16; li.y = 17 * 16 + 12; al.x = 25 * 16; al.y = 17 * 16 + 12;
    li.dir = 'up'; al.dir = 'up';
    g.setCheckpoint({ id: 'cp_vila', area: 'vila', x: 23 * 16 + 8, y: 18 * 16 + 12 });
    g.camera.focus = { x: 23 * 16, y: 13 * 16, speed: 3 };
    g.camera.snap(g.players);
    g.camera.x = 23 * 16 - G.VIEW_W / 2; g.camera.y = 13 * 16 - G.VIEW_H / 2;
    yield C.wait(0.5);
    yield g.fadeTo(0, 1.6);
    yield g.titleCard('CAPÍTULO I', 'O Começo da Jornada', 3);
    yield g.say([
      N('orvin', 'Ontem à noite uma estrela caiu além do Bosque Sussurrante.'),
      L('Não era uma estrela.'),
      A('Então o que era?'),
      L('Algo com fome.'),
      N('orvin', 'Desde aquela noite, a vila anda esquecendo coisas. A Mirta esqueceu a receita do próprio chá.'),
      A('Nós vamos até o santuário. Não é, Lirien?'),
      L('Eu ia de qualquer jeito.'),
      A('Ela quis dizer "sim".'),
      N('orvin', 'Preparem-se antes de partir. Falem com o pessoal. A Brunna pode cuidar das armas.'),
    ]);
    g.camRelease();
    g.letterbox(false);
    g.setFlag('intro_done', true);
    yield C.wait(0.3);
    g.toast('Jogador 1 — Lirien: WASD mover • J magia • K feitiço • L teleporte/interagir • I troca feitiço', 7);
    yield C.wait(0.4);
    g.toast('Jogador 2 — Aldren: Setas mover • 1 espada • 2 escudo • 3 investida/interagir • 4 provocar', 7);
    yield C.wait(0.4);
    g.toast('Explorem a vila, conversem com todos e sigam para o leste. (Esc: pausa e controles)', 6);
    g.save();
  };

  // ------------------------------------------------------------------ Mini-chefe
  G.Scenes.golemIntro = function* (g) {
    const golem = g.entities.find((e) => e.type === 'golem' && !e.dead);
    if (!golem || golem.state !== 'sleep') return;
    const gin = g.entities.find((e) => e.id === 'arena_in');
    if (gin) gin.setOpen(false, g);
    g.letterbox(true);
    G.Audio.playMusic(null, 1);
    yield g.camTo(golem.x, golem.y - 24, 3);
    const first = !g.flag('golem_seen');
    if (first) yield g.say([A('Que estátua grande.'), L('Não é uma estátua.')]);
    G.Audio.sfx('roar'); g.camera.shake(5, 1);
    golem.state = 'roar'; golem.stateT = 0;
    g.particles.burst(golem.x, golem.y - 20, 30, { colors: ['#9a948a', '#5a5450'], speed: 70, life: 0.8, g: 150, up: 40 });
    yield C.wait(0.6);
    yield g.titleCard('GUARDIÃO DE PEDRA', 'Sentinela esquecida de Velmora', 2.4);
    if (first) yield g.say([
      L('Pedra encantada. Minha magia mal arranha.'),
      A('Então eu abro e você acerta?'),
      L('Apare o golpe dele no instante certo. O núcleo vai aparecer.'),
    ]);
    g.setFlag('golem_seen', true);
    g.camRelease();
    g.letterbox(false);
    golem.wake(g);
    golem.cd = 1.2;
    G.Audio.playMusic('boss', 0.6);
    g.toast('Aldren: erga o escudo (' + G.Characters.aldren.keys.skill + ') no instante do ESMAGAR para aparar. Investida contra a parede também o deixa tonto.', 6);
  };

  G.Scenes.golemDefeated = function* (g) {
    g.setFlag('golem_dead', true);
    for (const id of ['arena_in', 'arena_out']) { const gt = g.entities.find((e) => e.id === id); if (gt) gt.setOpen(true, g); }
    G.Audio.playMusic('victory', 0.5);
    yield C.wait(1.2);
    g.letterbox(true);
    yield g.say([
      A('Ufa... Ele era duro.'),
      L('Era pedra.'),
      A('Isso foi uma piada?'),
      L('Foi uma constatação.'),
      L('Aldren. Quando você aparou, o núcleo dele ressoou no seu escudo.'),
      A('Estou sentindo. É como se o escudo... devolvesse as coisas.'),
    ]);
    g.abilities.add('reflexao');
    g.inv.add('coracao_pedra', 1, g); g.inv.add('minerio', 1, g);
    g.addGold(60);
    g.refreshStats();
    G.Audio.sfx('levelup');
    g.toast('Nova habilidade do Aldren: REFLEXÃO! Aparar no momento exato devolve projéteis com o dobro de força.', 6);
    g.toast('Obtidos: Coração de Pedra, Minério Estelar e 60 moedas.', 4);
    g.addPoints(1);
    g.letterbox(false);
    yield C.wait(2);
    G.Audio.playMusic('dungeon', 2);
    g.save();
  };

  // ------------------------------------------------------------------ Chefe
  G.Scenes.bossIntro = function* (g) {
    const boss = g.entities.find((e) => e.type === 'boss' && !e.dead);
    if (!boss || boss.state !== 'dormant') return;
    for (const id of ['boss_g1', 'boss_g2']) { const gt = g.entities.find((e) => e.id === id); if (gt) gt.setOpen(false, g); }
    g.letterbox(true);
    G.Audio.playMusic(null, 1);
    yield g.camTo(boss.x, boss.y - 20, 2.5);
    const first = !g.flag('boss_seen');
    if (first) yield g.say([A('É ela? A estrela?'), L('Era. Agora é uma casca.'), A('E o que tem dentro?')]);
    for (let i = 1; i <= 3; i++) {
      boss.crack = i; G.Audio.sfx('shatter'); g.camera.shake(2 + i, 0.4);
      g.particles.burst(boss.x, boss.y - 16, 12 * i, { colors: ['#c8a8ff', '#ffffff'], speed: 60, life: 0.6, glow: true });
      yield C.wait(0.7);
    }
    g.flashScreen('#ffffff', 0.4);
    G.Audio.sfx('explosion'); G.Audio.sfx('roar');
    boss.state = 'transition'; boss.stateT = 0; boss.z = 0;
    yield C.wait(1.4);
    yield g.titleCard('MORVATH', 'O Devorador de Memórias', 2.8);
    if (first) yield g.say([
      L('Ele está comendo as lembranças da vila.'),
      A('Então vamos devolvê-las.'),
      L('O véu dele é mágico. Só magia concentrada atravessa.'),
      A('E quando ele cair, é a minha vez.'),
    ]);
    g.setFlag('boss_seen', true);
    g.camRelease();
    g.letterbox(false);
    boss.activate(g);
    G.Audio.playMusic('boss', 0.5);
  };

  G.Scenes.bossDefeated = function* (g) {
    g.setFlag('boss_dead', true);
    g.bossBar = null;
    for (const id of ['boss_g1', 'boss_g2']) { const gt = g.entities.find((e) => e.id === id); if (gt) gt.setOpen(true, g); }
    G.Audio.playMusic('victory', 0.5);
    yield C.wait(1.8);
    g.letterbox(true);
    yield g.say([
      L('Acabou.'),
      A('Ele... se desfez em luz.'),
      L('Lembranças. Centenas delas. Estão voltando para casa.'),
    ]);
    g.addGold(150);
    g.addPoints(2);
    g.toast('Vitória! +150 moedas e 2 Pontos de Lembrança.', 4);
    // a estrela deixa um fragmento que guarda uma lembrança
    const star = g.addEntity(new G.ObjectTypes.memory({ x: 16 * 16 + 8, y: 9 * 16 + 16, memory: 'promessa', look: 'star' }));
    yield g.camTo(star.x, star.y - 10, 3);
    yield C.wait(0.8);
    yield g.say([A('Ainda tem algo brilhando ali.'), L('...Eu conheço essa luz.')]);
    g.camRelease();
    g.letterbox(false);
    g.save();
    yield C.wait(0.4);
    g.startMemory('promessa', star);
  };

  // ------------------------------------------------------------------ Final do capítulo
  G.Scenes.finale = function* (g) {
    const [li, al] = g.players;
    g.letterbox(true);
    yield C.wait(0.8);
    yield g.say([
      A('Você lembrou agora, não foi? Daquela noite.'),
      L('Eu nunca esqueci.'),
      A('...Então por que demorou doze anos?'),
      L('Eu achei que tinha passado uma semana.'),
      A('Uma semana.'),
      L('Para mim, doze anos são um piscar de olhos. Para você... foi metade da vida.'),
      L('Desculpa.'),
      A('Você voltou. É o que importa.'),
      A('E eu cumpri a promessa. Fiquei forte.'),
      L('Ficou alto. Forte, veremos.'),
    ]);
    G.Audio.sfx('memory');
    g.particles.burst(li.x, li.y - 20, 30, { colors: ['#f2d98c', '#ffffff', '#c8a8ff'], speed: 50, life: 1.2, glow: true, up: 20 });
    g.inv.add('fragmento_estelar', 1, g);
    g.refreshStats();
    g.toast('Obtido: Fragmento Estelar (+10 vida e mana para os dois)', 4);
    yield C.wait(1.2);
    yield g.say([
      L('Este fragmento... está puxando para o norte.'),
      A('Tem mais estrelas como aquela?'),
      L('Seis. Talvez sete. Nas montanhas.'),
      A('Então vamos.'),
      L('Você nem perguntou se é seguro.'),
      A('Você ia dizer "não".'),
      L('...Ia.'),
    ]);
    g.setFlag('chapter1_done', true);
    g.setCheckpoint({ id: 'cp_santuario', area: 'santuario', x: 40 * 16 + 8, y: 20 * 16 + 14 });
    g.save();
    G.Audio.playMusic('title', 2);
    yield g.fadeTo(1, 2.5);
    g.letterbox(false);
    g.ui.push(new G.ChapterEnd());
    g.fade.target = 0; g.fade.a = 0;
  };
})();
