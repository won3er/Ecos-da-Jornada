// ====================================================================
// TEXTOS E DIÁLOGOS (PT-BR). Linhas curtas, sem paredes de texto.
// Formato de fala: { who: 'lirien'|'aldren'|'kid'|'sign'|'npc:<id>', text }
// ====================================================================
(function () {
  const L = (text) => ({ who: 'lirien', text });
  const A = (text) => ({ who: 'aldren', text });
  const N = (id, text) => ({ who: 'npc:' + id, text });
  const S = (text) => ({ who: 'sign', text });
  G.Say = { L, A, N, S };

  G.Lines = {
    tooHeavy: ['Pesado. Muito pesado.', 'Isso é trabalho para músculos.', 'Não fui feita para empurrar caixas.'],
    leverStuck: ['Emperrada. Aldren?', 'Não tenho força para isso.', 'Isso é com você, Aldren.'],
    taunt: ['Aqui! Olhem pra mim!', 'Venham, se tiverem coragem!', 'Ei! Por aqui!'],
    memoryRevisit: {
      ponte: [L('A ponte era bem aqui.'), A('Eu ainda lembro do frio na barriga.')],
      fita: [L('Ainda está amarrada no galho.')],
    },
  };

  // Conversas durante a caminhada (balões, não pausam o jogo)
  G.Banter = {
    vila_saida: [['aldren', 'Pronta?'], ['lirien', 'Faz duzentos anos que estou pronta.'], ['aldren', 'Isso é um sim?'], ['lirien', 'É um vamos.']],
    estrada_inicio: [['aldren', 'Faz tempo que você não passa por aqui.'], ['lirien', 'Doze anos.'], ['aldren', 'Você contou?'], ['lirien', '...Foi um palpite.']],
    estrada_rocha: [['lirien', 'Uma rocha no caminho.'], ['aldren', 'Deixa que eu converso com ela.']],
    estrada_barreira: [['aldren', 'Que luz roxa é essa?'], ['lirien', 'Uma barreira antiga. Afaste-se.']],
    floresta_inicio: [['aldren', 'Você acha que tem lobos aqui?'], ['lirien', 'Tem.'], ['aldren', 'Como você sabe?'], ['lirien', 'Eles estão olhando pra gente.']],
    floresta_rio: [['aldren', 'Não dá para atravessar a nado.'], ['lirien', 'Ninguém precisa nadar.']],
    floresta_gemeos: [['aldren', 'Uma alavanca aqui...'], ['lirien', 'E um cristal ali. Ao mesmo tempo, imagino.']],
    ruinas_inicio: [['aldren', 'Você acha que aquela ruína é segura?'], ['lirien', 'Não.'], ['aldren', 'Você poderia ter respondido isso antes de entrarmos.'], ['lirien', 'Você não perguntou.']],
    ruinas_pos_memoria: [['aldren', 'Você ficou quieta.'], ['lirien', 'Eu sempre fico quieta.'], ['aldren', 'Mais quieta que o normal.']],
    caverna_inicio: [['aldren', 'Está escuro.'], ['lirien', 'Eu percebi.'], ['aldren', 'Pode fazer luz?'], ['lirien', 'Já estou fazendo.'], ['aldren', '...Pode fazer mais luz?']],
    caverna_eco: [['aldren', 'Olá!'], ['aldren', '...olá... olá...'], ['lirien', 'Os monstros agradecem o aviso.']],
    santuario_inicio: [['aldren', 'É lindo.'], ['lirien', 'É perigoso.'], ['aldren', 'Pode ser os dois.'], ['lirien', '...Pode.']],
    santuario_porta: [['lirien', 'Ele está logo ali. Consigo sentir.'], ['aldren', 'Medo?'], ['lirien', 'Fome. Ele está com fome de lembranças.']],
  };

  // ---------------------------------------------------------------- NPCs
  const D = {};
  const q = (g, id) => g.questState(id);

  D.orvin = (g) => {
    if (g.flag('boss_dead')) return [N('orvin', 'Lembrei! Do nome da minha esposa, do cheiro do pão da minha mãe...'), N('orvin', 'Vocês devolveram as lembranças da vila. Obrigado, de coração.')];
    if (g.flag('golem_dead')) return [N('orvin', 'Sinto as lembranças voltando aos poucos. Vocês estão perto.'), N('orvin', 'O santuário fica além da caverna. Tenham cuidado.')];
    if (g.memories.has('ponte')) return [N('orvin', 'Velmora... Diziam que lá existiu uma ponte feita de luz.'), A('Existiu. Eu atravessei.'), N('orvin', 'Hm? Você sempre teve imaginação, rapaz.')];
    return [
      N('orvin', 'A estrela caiu além do Bosque Sussurrante, no velho santuário. Sigam a estrada a leste.'),
      N('orvin', 'Desde aquela noite eu esqueço nomes... Qual é mesmo o seu, rapaz?'),
      A('Aldren. O senhor me ensinou a ler.'),
      N('orvin', 'Ensinei? ...Que bom professor eu devia ser.'),
    ];
  };

  D.mirta = (g) => {
    const s = q(g, 'ervas');
    if (s === 'inactive') return {
      lines: [
        N('mirta', 'Ah, vocês dois. Preciso preparar o chá da memória para a vila...'),
        N('mirta', '...mas esqueci onde crescem as Flores-de-Orvalho.'),
        L('No bosque. Perto da água. Sempre perto da água.'),
        N('mirta', 'Vocês trariam três para mim? Eu recompenso bem.'),
      ],
      then: (gg) => gg.startQuest('ervas'),
    };
    if (s === 'active') return [N('mirta', 'Flores-de-Orvalho brilham em azul. Procurem perto da água... e em lugares escondidos.')];
    if (s === 'ready') return {
      lines: [N('mirta', 'São elas! Ainda frescas!'), N('mirta', 'Tome. Este amuleto era da minha mãe. Protege quem viaja.')],
      then: (gg) => gg.completeQuest('ervas'),
    };
    if (g.flag('boss_dead')) return [N('mirta', 'Hoje lembrei de todas as receitas. Até as que eu queria esquecer.')];
    return [N('mirta', 'O chá está fervendo. A vila já parece lembrar um pouco mais.')];
  };

  D.tobin = (g) => ({
    lines: [g.flag('boss_dead')
      ? N('tobin', 'Os heróis da vila! Para vocês, o mesmo preço de sempre. Heroísmo não dá desconto.')
      : N('tobin', 'Bem-vindos à Tenda do Tobin! Tudo que um aventureiro precisa — e umas coisas que não precisa.')],
    then: (gg) => gg.ui.openShop(gg),
  });

  D.brunna = (g) => ({
    lines: g.flag('smith_met')
      ? [N('brunna', 'Voltaram! Bora melhorar esse equipamento.')]
      : [N('brunna', 'Quer que eu afie essa espada? Ou esse graveto aí, elfa?'), L('É um cajado.'), N('brunna', 'Graveto caro, então.')],
    then: (gg) => { gg.setFlag('smith_met', true); gg.ui.openSmith(gg); },
  });

  D.bram = (g) => {
    const s = q(g, 'lobo');
    if (s === 'inactive') return {
      lines: [
        N('bram', 'Um lobo cinzento do tamanho de um cavalo ronda a clareira a leste do bosque.'),
        N('bram', 'Já levou três ovelhas. E meu chapéu favorito.'),
        A('Deixa com a gente.'),
        L('Deixa com ele.'),
      ],
      then: (gg) => gg.startQuest('lobo'),
    };
    if (s === 'active') return [N('bram', 'A clareira fica depois do rio, a leste. Ele chama a matilha quando se sente encurralado.')];
    if (s === 'ready') return {
      lines: [N('bram', 'Pela barba do meu avô! Vocês conseguiram!'), N('bram', 'Fiz esta capa com a pele de um lobo comum. Fica melhor em você, herói.')],
      then: (gg) => gg.completeQuest('lobo'),
    };
    return [N('bram', 'Agora posso dormir em paz. Quer dizer... as ovelhas podem.')];
  };

  D.pip = (g, p) => {
    if (g.flag('boss_dead')) return [N('pip', 'Vocês derrotaram o monstro das estrelas!'), N('pip', 'Quando eu crescer quero ser igual ao Aldren. A Lirien dá medo.'), L('Obrigada.')];
    if (p && p.kind === 'mage') return [N('pip', 'Moça, quantos anos você tem?'), L('Mais ou menos mil.'), N('pip', 'MIL?!'), L('Não contei direito.')];
    return [N('pip', 'Você é o Aldren? O que ia virar herói?'), A('Já virei, Pip.'), N('pip', 'Mas cadê a capa brilhante?'), A('...Está lavando.')];
  };

  D.edda = (g) => {
    if (g.flag('boss_dead')) return [N('edda', 'As estrelas voltaram a ficar quietas. Que bom.'), N('edda', 'Venha jantar quando voltar, menino. E traga a moça.')];
    if (g.memories.has('ponte')) return [N('edda', 'Achou sua espada? Pois é.'), N('edda', 'Nem tudo que a gente perde fica perdido.')];
    return [
      N('edda', 'Aldren, meu menino. Lembro de você correndo para as ruínas com uma espada de madeira.'),
      A('Eu perdi aquela espada lá.'),
      N('edda', 'E voltou chorando, dizendo que uma moça de orelhas pontudas fez uma ponte de luz.'),
      L('...'),
      A('Isso foi um sonho, Vó.'),
      N('edda', 'Se você diz.'),
    ];
  };

  D.lena = (g) => g.flag('boss_dead')
    ? [N('lena', 'Hoje lembrei até do aniversário do meu marido. Ele ficou desconfiado.')]
    : [N('lena', 'Ontem esqueci o caminho de casa. Moro aqui há trinta anos.'), N('lena', 'Por favor, descubram o que está acontecendo.')];

  D.guard = (g) => {
    if (!g.flag('road_rock')) return [
      N('guard', 'A estrada a leste está cheia de gosmas. Fiquem juntos.'),
      N('guard', 'E tem uma rocha rachada bloqueando o caminho. Só cede a um golpe pesado — segure o ataque, Aldren.'),
      N('guard', 'Se encontrarem luz roxa, é coisa de magia. Concentre o feitiço, moça: segure o ataque também.'),
    ];
    return [N('guard', 'Vocês abriram a estrada! Agora os mercadores podem passar de novo.')];
  };

  // Marcadores sobre NPCs: '!' tem missão, '?' pronto para entregar
  D.marker = (g, id) => {
    for (const qid in G.Quests) {
      const qd = G.Quests[qid];
      if (qd.giver !== id) continue;
      const s = g.questState(qid);
      if (s === 'inactive') return '!';
      if (s === 'ready') return '?';
    }
    return null;
  };

  G.NPCDialogue = D;
})();
