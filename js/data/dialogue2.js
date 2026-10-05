// ====================================================================
// TEXTOS E DIÁLOGOS DOS CAPÍTULOS II E III (PT-BR).
// Mesmo formato de dialogue.js.
// ====================================================================
(function () {
  const { L, A, N, S } = G.Say;
  const D = G.NPCDialogue;
  const q = (g, id) => g.questState(id);

  Object.assign(G.Lines.memoryRevisit, {
    neve: [L('Foi aqui que você se perdeu.'), A('Eu não me perdi. Eu estava... explorando.'), L('Chorando.'), A('Explorando chorando.')],
    boneco: [A('Ele ainda tem o nariz de cenoura.'), L('Não é o mesmo boneco, Aldren. Passaram doze anos.'), A('Deixa eu acreditar.')],
    velmora: [L('A cidade era bonita.'), A('Ainda é. Do jeito dela.')],
    aurelian: [L('Ele ria de tudo. Até do fim do mundo.')],
  });

  Object.assign(G.Banter, {
    // Capítulo II
    trilha_inicio: [['aldren', 'Neve! Faz anos que não vejo tanta.'], ['lirien', 'Doze.'], ['aldren', 'Você contou de novo.'], ['lirien', 'Eu conto tudo que tem a ver com você.'], ['aldren', '...O quê?'], ['lirien', 'Nada. Anda.']],
    trilha_lago: [['aldren', 'O lago congelou inteiro.'], ['lirien', 'Cuidado. Gelo escorrega.'], ['aldren', 'Eu sei andar no gelo!'], ['aldren', 'Uou— uou— ...eu sei.']],
    trilha_gelo: [['aldren', 'Uma parede de gelo. Dá para quebrar?'], ['lirien', 'Gelo mágico. Espada não resolve.'], ['aldren', 'E Geada?'], ['lirien', 'Geada contra gelo, Aldren?']],
    trilha_fim: [['lirien', 'Fumaça adiante. Ou devia haver.'], ['aldren', 'Por que "devia"?'], ['lirien', 'Porque as chaminés estão paradas. Congeladas no meio do ar.']],
    pedra_inicio: [['aldren', 'As pessoas... estão paradas.'], ['lirien', 'Presas num instante. O frio desta estrela não congela só a água. Congela o tempo.'], ['aldren', 'Dá para salvar?'], ['lirien', 'Com fogo de verdade, sim.']],
    minas_inicio: [['aldren', 'Escuro de novo.'], ['lirien', 'Agora eu tenho fogo.'], ['aldren', 'Então pode fazer MAIS luz?'], ['lirien', '...Vou pensar.']],
    minas_teia: [['aldren', 'Teias. Teias enormes.'], ['lirien', 'Você tem medo de aranha?'], ['aldren', 'Eu tenho respeito por aranha.']],
    minas_rugido: [['aldren', 'Ouviu isso?'], ['lirien', 'Algo grande. Dormindo.'], ['aldren', 'Vamos deixar dormindo?'], ['lirien', 'Ele está em cima da saída.']],
    picos_inicio: [['aldren', 'O vento aqui corta.'], ['lirien', 'Ele me empurra. Eu sou leve.'], ['aldren', 'Fica atrás de mim. Eu sou o muro.'], ['lirien', 'Um muro que fala muito.']],
    picos_runa: [['lirien', 'Uma runa do outro lado do muro.'], ['aldren', 'Quer que eu te jogue?'], ['lirien', 'Não.'], ['aldren', 'Mas vai precisar.'], ['lirien', '...Joga com cuidado.']],
    fortaleza_inicio: [['aldren', 'A Vigília Branca. Os cavaleiros que guardavam o norte.'], ['lirien', 'Ainda guardam. Olha as armaduras.'], ['aldren', 'Estão... se mexendo?'], ['lirien', 'O gelo do tempo prende quem estava aqui. Até os mortos.']],
    fortaleza_trono: [['lirien', 'Ela está do outro lado.'], ['aldren', 'Ela?'], ['lirien', 'A estrela. Esta tem voz. Consigo ouvir.'], ['aldren', 'E o que ela diz?'], ['lirien', '"Fiquem. Para sempre."']],
    // Capítulo III
    velmora_inicio: [['aldren', 'Velmora de novo. Mas à noite parece outra cidade.'], ['lirien', 'É outra cidade. É a que eu lembro.'], ['aldren', 'Os fantasmas também?'], ['lirien', 'Eles também lembram.']],
    velmora_torre: [['aldren', 'Aquela torre não estava aqui.'], ['lirien', 'Estava. Debaixo da terra. Esperando.'], ['aldren', 'Você sabia?'], ['lirien', '...Sabia.']],
    espelhos_inicio: [['aldren', 'Quanto espelho.'], ['lirien', 'A luz aqui era guiada. Cada espelho, um caminho.'], ['aldren', 'E o meu escudo?'], ['lirien', 'O seu escudo também é um espelho. Teimoso, mas é.']],
    jardins_inicio: [['aldren', 'Ilhas no céu.'], ['lirien', 'Os jardins de Aurelian. Ele plantava estrelas aqui.'], ['aldren', 'Plantava como?'], ['lirien', 'Com paciência. Muita.']],
    ecos_porta: [['aldren', 'Tem alguém do outro lado.'], ['lirien', 'Nós. Do outro lado.'], ['aldren', 'Como assim?'], ['lirien', 'Você vai ver.']],
    topo_porta: [['aldren', 'Lirien.'], ['lirien', 'Hm.'], ['aldren', 'Seja o que for, a gente faz junto.'], ['lirien', '...Eu sei. Foi por isso que eu voltei.']],
  });

  // ---------------------------------------------------------------- NPCs de Pedra-Alta
  D.isolde = (g) => {
    const s = q(g, 'gelo');
    if (g.flag('ysveth_dead')) return [N('isolde', 'O sino da vila tocou sozinho quando a estrela caiu de vez. O tempo voltou a correr.'), N('isolde', 'Pedra-Alta deve a vida a vocês. Literalmente.')];
    if (s === 'inactive') return {
      lines: [
        N('isolde', '...Vocês me tiraram do gelo? Quanto tempo passou?'),
        L('Não sei. Para vocês, um instante.'),
        N('isolde', 'Uma estrela caiu sobre a Fortaleza da Vigília. Depois veio o frio... e tudo parou.'),
        N('isolde', 'Os outros ainda estão presos. Meu povo. Por favor, libertem todos.'),
        N('isolde', 'O caminho para a fortaleza passa pelas minas. Tome a chave da porta. Cuidado com o que dorme lá dentro.'),
      ],
      then: (gg) => { gg.startQuest('gelo'); gg.setFlag('sig_mina', true); gg.toast('A porta das minas foi destrancada.', 3); },
    };
    if (s === 'active') return [N('isolde', 'Ainda há gente presa no gelo. ' + G.Quests.gelo.objective(g) + '.'), N('isolde', 'O pequeno Tavi entrou nas minas antes do frio. Ele ainda está lá.')];
    if (s === 'ready') return { lines: [N('isolde', 'Todos livres. Todos. Nem sei como agradecer.'), N('isolde', 'Fiquem com isto: cristais que nunca derretem. E todo o ouro que juntamos para a festa do degelo.')], then: (gg) => gg.completeQuest('gelo') };
    return [N('isolde', 'A vila está acordando aos poucos. Obrigada.')];
  };
  D.garrik = (g) => {
    const s = q(g, 'alfa');
    if (s === 'inactive') return {
      lines: [
        N('garrik', 'Fiquei congelado com a picareta no ar. Que vergonha.'),
        N('garrik', 'Antes do frio, um lobo branco enorme rondava os picos. O Alfa da Nevasca.'),
        N('garrik', 'Ele some na neve e ataca do nada. Fogo o faz aparecer, dizem.'),
        A('A gente cuida dele.'),
        N('garrik', 'Tragam o dente dele e eu faço uma capa digna de herói.'),
      ],
      then: (gg) => gg.startQuest('alfa'),
    };
    if (s === 'active') return [N('garrik', 'O Alfa ronda a clareira a leste, nos picos. Fiquem juntos.')];
    if (s === 'ready') return { lines: [N('garrik', 'O dente do Alfa! Pelos meus antepassados!'), N('garrik', 'Uma capa branca, como prometi. E moedas para a viagem.')], then: (gg) => gg.completeQuest('alfa') };
    return [N('garrik', 'Voltando às minas. Agora sem urso, sem aranha e sem tempo parado. Um luxo.')];
  };
  D.nessa = (g) => {
    const s = q(g, 'irmao');
    if (s === 'inactive') return {
      lines: [N('nessa', 'Cadê o Tavi? Meu irmão!'), N('nessa', 'Ele foi nas minas buscar cristal pra mamãe... e aí ficou tudo frio.'), A('A gente traz ele de volta. Prometo.'), L('Ele promete muito. Mas cumpre.')],
      then: (gg) => gg.startQuest('irmao'),
    };
    if (s === 'active') return [N('nessa', 'O Tavi gosta de lugares escondidos. Procurem nos cantinhos das minas.')];
    if (s === 'ready') return { lines: [N('nessa', 'TAVI! Ele voltou! Ele tá espirrando, mas voltou!'), N('nessa', 'Toma. Era o amuleto da vovó. Ele esquenta quando a gente tá com medo.')], then: (gg) => gg.completeQuest('irmao') };
    return [N('nessa', 'O Tavi disse que a moça de orelha pontuda derreteu ele. Eu quero ser maga!'), L('Leva duzentos anos.'), N('nessa', 'Eu espero!')];
  };
  D.tavi = (g) => g.flag('ysveth_dead')
    ? [N('tavi', 'Eu vi a estrela apagar lá da janela! Foi lindo!')]
    : [N('tavi', 'Atchim! Eu tava no gelo? Parecia um sonho comprido.'), N('tavi', 'Tinha um urso de gelo enorme lá embaixo. Ele roncava.')];
  D.holt = (g) => {
    const s = q(g, 'diario');
    if (s === 'inactive') return {
      lines: [
        N('holt', 'Eu servi na Vigília Branca, rapaz. Sob o comando de Sir Hadrik.'),
        N('holt', 'Hadrik escrevia tudo num diário. As páginas se espalharam quando a fortaleza caiu.'),
        N('holt', 'Se acharem as cinco, guardem. Ele merece ser lembrado.'),
        N('holt', 'E um conselho: nos picos, o vento empurra os leves. Escudo erguido contra o vento faz sombra para quem vem atrás.'),
      ],
      then: (gg) => gg.startQuest('diario'),
    };
    if (g.flag('ysveth_dead')) return [N('holt', 'Hadrik ficou preso naquele trono por anos. Agora descansa.'), N('holt', 'Obrigado por lembrarem dele.')];
    return [N('holt', 'O vento dos picos derruba quem anda sozinho. Lembrem: escudo contra o vento, e a moça logo atrás.'), N('holt', G.Quests.diario.objective(g) + '.')];
  };
  D.yara = (g) => ({
    lines: [g.flag('ysveth_dead') ? N('yara', 'Preço especial para os heróis do degelo! ...Quer dizer, o mesmo preço. Mas com um sorriso.') : N('yara', 'Mercadoria das montanhas! Botas que não escorregam, poções que esquentam a alma!')],
    then: (gg) => gg.ui.openShop(gg, G.ShopStock.yara, 'MASCATE DA YARA'),
  });
  D.hrolf = (g) => ({
    lines: g.flag('hrolf_met') ? [N('hrolf', 'Martelo quente, metal frio. Bora?')] : [N('hrolf', 'Prima da Brunna? Sou eu, sim. A família toda tem mão pesada.'), N('hrolf', 'Tragam Cristal Gélido e eu faço maravilhas. Minério Estelar também serve.')],
    then: (gg) => { gg.setFlag('hrolf_met', true); gg.ui.openSmith(gg, 'FORJA DE HROLF'); },
  });

  // ---------------------------------------------------------------- NPCs de Velmora (fantasmas)
  D.elian = (g) => {
    const s = q(g, 'cajado');
    if (s === 'inactive') return {
      lines: [
        N('elian', 'Mestra Lirien? É você? Você não mudou nada...'),
        L('Elian. Você era o aprendiz mais novo do Mestre Aurelian.'),
        N('elian', 'Eu fiquei. Para guardar o cajado dele. Mas a torre acordou e o levou para os jardins lá em cima.'),
        N('elian', 'Se encontrarem o cajado, tragam para mim. Aí eu posso descansar.'),
      ],
      then: (gg) => gg.startQuest('cajado'),
    };
    if (s === 'active') return [N('elian', 'O cajado está nos Jardins Suspensos. Ele brilha como o mestre brilhava.')];
    if (s === 'ready') return { lines: [N('elian', 'O cajado do mestre...'), N('elian', 'Fiquem com o que ele guardava. Ele ia querer que fosse seu, mestra.'), N('elian', 'Obrigado. Agora eu posso ir.')], then: (gg) => gg.completeQuest('cajado') };
    return [N('elian', '...'), S('Elian sorri e quase desaparece na luz.')];
  };
  D.cassio = (g) => ({
    lines: [N('cassio', 'Mercadorias do além! Aceito moedas dos vivos. Os mortos pagam mal.')],
    then: (gg) => gg.ui.openShop(gg, G.ShopStock.cassio, 'CÁSSIO, DO ALÉM'),
  });
  D.aurelian = () => [N('aurelian', 'Lirien, segure o selo. Eu cuido do resto.')];

  // ---------------------------------------------------------------- Brisaclara nos capítulos seguintes
  const wrap = (id, fn) => { const old = D[id]; D[id] = (g, p, n) => fn(g, p, n) || old(g, p, n); };
  wrap('orvin', (g) => {
    if (g.flag('game_complete')) return [N('orvin', 'Escrevi tudo, sabia? A história de vocês dois. Ninguém nesta vila vai esquecer.'), N('orvin', 'Nem eu. Desta vez, nem eu.')];
    if (g.chapter === 3) return [N('orvin', 'Velmora... A cidade dos magos acordou? Então é lá que tudo começou.'), N('orvin', 'Voltem. Os dois. É uma ordem de professor.')];
    if (g.chapter === 2) return [N('orvin', 'O fragmento puxa para o norte, para as montanhas de Gelvar.'), N('orvin', 'Abri o portão norte. A trilha começa logo ali. Agasalhem-se!')];
    return null;
  });
  wrap('pip', (g) => {
    if (g.flag('game_complete')) return [N('pip', 'Vocês salvaram o CÉU? O céu inteiro?'), A('Uma parte dele.'), N('pip', 'Quando eu crescer, quero salvar a outra parte!')];
    if (g.chapter >= 2) return [N('pip', 'Vocês vão pras montanhas? Tragam neve pra mim!'), L('Neve derrete.'), N('pip', 'Então tragam um urso!'), A('...Vamos ver.')];
    return null;
  });
  wrap('edda', (g) => {
    if (g.flag('game_complete')) return [N('edda', 'Eu sabia que aquela moça ia voltar. Elfos sempre voltam para quem esperou.'), N('edda', 'Jantar, os dois. Hoje. Sem desculpa.')];
    if (g.chapter >= 2) return [N('edda', 'Leve este cachecol, menino. Ah, você já tem um? Leve outro. Nas montanhas, nunca é demais.'), A('Obrigado, Vó.')];
    return null;
  });
  wrap('lena', (g) => g.chapter >= 2 ? [N('lena', 'Ontem lembrei até de onde enterrei o pote de moedas. Trinta anos depois!'), N('lena', 'Bom, o pote estava vazio. Mas lembrei!')] : null);
  wrap('guard', (g) => {
    if (g.chapter >= 2 && !g.flag('game_complete')) return [N('guard', 'O portão norte está aberto. Lá em cima o vento derruba gente leve.'), N('guard', 'Moça, se segura no herói.'), L('Não.'), A('Ela vai se segurar.')];
    if (g.flag('game_complete')) return [N('guard', 'Turno tranquilo. Nenhuma estrela caindo. Do jeito que eu gosto.')];
    return null;
  });
  wrap('tobin', (g) => g.chapter >= 2 ? { lines: [N('tobin', 'Mercadoria nova do norte! Poções maiores, tônicos estelares e umas luvas que dão vontade de socar montanha.')], then: (gg) => gg.ui.openShop(gg) } : null);
  wrap('brunna', (g) => g.chapter >= 2 && !g.flag('brunna_ch2') ? { lines: [N('brunna', 'Meu primo Hrolf trabalha lá em Pedra-Alta. Se acharem Cristal Gélido, posso forjar mais um nível!'), L('E o graveto?'), N('brunna', 'O graveto também. Graveto caríssimo.')], then: (gg) => { gg.setFlag('brunna_ch2', true); gg.ui.openSmith(gg); } } : null);
})();
