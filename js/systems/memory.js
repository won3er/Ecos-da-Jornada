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
  Object.assign(G.MemoryDefs, {
    neve: {
      title: 'A Primeira Neve',
      when: 'Doze anos atrás — o inverno',
      area: 'mem_neve',
      journal: 'Na primeira neve daquele inverno, o pequeno Aldren seguiu Lirien até a montanha e se perdeu na nevasca. Ela acendeu fogueiras de luz estelar pelo caminho até encontrá-lo. Foi a primeira vez que usou fogo para aquecer alguém.',
      reward: 'Chama Estelar',
    },
    boneco: {
      title: 'O Boneco de Neve',
      when: 'Doze anos atrás — o inverno',
      scene: true,
      journal: 'Aldren insistiu em fazer um boneco de neve "parecido com a Lirien". Ficou sério, quieto e com orelhas pontudas de gelo. Ela disse que não tinha nada a ver. Ficou olhando para ele por um bom tempo.',
      lines: [
        { who: 'kid', text: 'Pronto! É você!' },
        { who: 'lirien', text: 'Não tem nada a ver comigo.' },
        { who: 'kid', text: 'Tem sim! Olha a cara de brava.' },
        { who: 'lirien', text: '...' },
        { who: 'kid', text: 'Agora você vai ficar aqui pra sempre. Até no verão!' },
        { who: 'lirien', text: 'Boneco de neve derrete, Aldren.' },
        { who: 'kid', text: 'Então eu faço outro todo inverno. Até você voltar.' },
      ],
    },
    aniversario: {
      title: 'O Aniversário',
      when: 'Doze anos atrás — o décimo aniversário',
      scene: true,
      journal: 'No aniversário de dez anos de Aldren, Lirien deu a ele uma pedrinha que brilhava. Ele perguntou quantos aniversários ela já tinha tido. Ela respondeu que tinha perdido a conta. Ele prometeu contar os dela dali em diante.',
      lines: [
        { who: 'kid', text: 'Uma pedra que brilha! É mágica?' },
        { who: 'lirien', text: 'É uma estrela pequena. Caiu faz muito tempo.' },
        { who: 'kid', text: 'Quantos aniversários você já teve, Lirien?' },
        { who: 'lirien', text: 'Perdi a conta.' },
        { who: 'kid', text: 'Então eu conto pra você. Daqui pra frente, todos.' },
        { who: 'lirien', text: 'Você não vai viver o bastante.' },
        { who: 'kid', text: 'Então eu conto rápido!' },
      ],
    },
    velmora: {
      title: 'A Queda de Velmora',
      when: 'Trezentos anos atrás',
      area: 'mem_velmora',
      p2: 'talen',
      journal: 'Trezentos anos atrás, Nyxara despertou sobre Velmora. Lirien, aprendiz de Mestre Aurelian, lutou ao lado de Sir Talen, o protetor da cidade. Aurelian selou a Mãe das Estrelas com a própria vida. A cidade caiu. Lirien nunca contou isso a ninguém.',
      reward: 'Salto do Herói',
    },
    aurelian: {
      title: 'O Jardim do Mestre',
      when: 'Trezentos e poucos anos atrás',
      scene: true,
      journal: 'Aurelian ensinava Lirien a plantar estrelas nos jardins suspensos. "Uma estrela leva cem anos para florescer", ele dizia. "É por isso que só elfos e loucos plantam estrelas."',
      lines: [
        { who: 'npc:aurelian', text: 'Cem anos para florescer, Lirien. Uma estrela não tem pressa.' },
        { who: 'lirien', text: 'Eu não vou estar aqui daqui a cem anos, Mestre. Vou estar viajando.' },
        { who: 'npc:aurelian', text: 'Então plante mesmo assim. Alguém vai ver.' },
        { who: 'lirien', text: 'E se ninguém vir?' },
        { who: 'npc:aurelian', text: 'Aí você volta. Quem planta estrelas sempre volta.' },
      ],
    },
  });
})();
