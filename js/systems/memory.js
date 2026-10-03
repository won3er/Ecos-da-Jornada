// MEMÓRIAS — mecânica principal. Objetos do mundo despertam lembranças:
// a tela muda, os personagens aparecem como eram, e o jogador controla a cena.
// O que se aprende na memória resolve puzzles do presente.
(function () {
  G.MemoryDefs = {
    ponte: {
      title: 'A Primeira Ponte',
      when: 'Doze anos atrás',
      area: 'mem_ponte',
      journal: 'Aldren tinha dez anos e uma espada de madeira. Deixou-a cair do outro lado de um abismo em Velmora. Lirien, de passagem pela região, criou uma ponte de luz para ele. Foi assim que se conheceram.',
      reward: 'Ponte Etérea',
    },
    fita: {
      title: 'A Fita no Galho',
      when: 'Doze anos atrás',
      scene: true,
      journal: 'Aldren amarrou uma fita num galho do bosque "para a Lirien achar o caminho de volta". Ela disse que elfos não se perdem. Ele amarrou mesmo assim.',
      lines: [
        { who: 'kid', text: 'Pronto! Agora você sempre vai achar o caminho de volta.' },
        { who: 'lirien', text: 'Elfos não se perdem.' },
        { who: 'kid', text: 'Mas e se você esquecer?' },
        { who: 'lirien', text: 'Elfos também não esquecem.' },
        { who: 'kid', text: 'Então é para eu lembrar. Pra eu saber que você passou aqui.' },
      ],
    },
    promessa: {
      title: 'A Promessa',
      when: 'Doze anos atrás — a última noite',
      area: 'mem_promessa',
      journal: 'Na noite antes de Lirien partir, os dois subiram a colina para ver a chuva de estrelas. Aldren prometeu que ficaria forte para viajar com ela. Ela disse que humanos esquecem promessas. Ele não esqueceu.',
    },
  };
})();
