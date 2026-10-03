// Missões secundárias da Fase 1.
G.Quests = {
  ervas: {
    title: 'Ervas da Curandeira',
    giver: 'mirta',
    desc: 'Mirta esqueceu onde crescem as Flores-de-Orvalho. Encontre 3 no Bosque Sussurrante.',
    objective: (g) => `Flores-de-Orvalho: ${Math.min(3, g.inv.count('flor_orvalho'))}/3`,
    ready: (g) => g.inv.count('flor_orvalho') >= 3,
    reward: (g) => {
      g.inv.remove('flor_orvalho', 3);
      g.inv.add('pocao', 2, g); g.inv.add('amuleto_mirta', 1, g);
      g.addPoints(1);
      return 'Amuleto de Mirta, 2 Poções e 1 Ponto de Lembrança';
    },
  },
  lobo: {
    title: 'O Lobo Cinzento',
    giver: 'bram',
    desc: 'Um lobo cinzento enorme ronda a clareira a leste do bosque. Bram quer uma prova de que ele foi derrotado.',
    objective: (g) => (g.inv.count('presa') ? 'Volte para falar com Bram' : 'Derrote o Lobo Cinzento na clareira'),
    ready: (g) => g.inv.count('presa') > 0,
    reward: (g) => {
      g.inv.remove('presa', 1);
      g.addGold(80); g.inv.add('capa_cinzenta', 1, g);
      return '80 moedas e a Capa Cinzenta';
    },
  },
  paginas: {
    title: 'Páginas Perdidas',
    giver: 'lirien',
    desc: 'Lirien perdeu páginas do seu grimório na região há doze anos. São cinco ao todo.',
    objective: (g) => `Páginas do Grimório: ${g.inv.count('pagina')}/5`,
    ready: (g) => g.inv.count('pagina') >= 5,
    auto: true, // entrega sozinha ao completar
    reward: (g) => {
      g.inv.add('grimorio', 1, g); g.inv.add('fita_estelar', 1, g);
      g.addPoints(1);
      return 'Grimório Restaurado, Fita Estelar e 1 Ponto de Lembrança';
    },
  },
};
