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
  // ---------------------------------------------------------------- Capítulo II
  gelo: {
    title: 'Gelo do Tempo',
    giver: 'isolde',
    desc: 'O frio da estrela prendeu os moradores de Pedra-Alta no gelo. A Chama Estelar da Lirien pode libertá-los.',
    objective: (g) => `Moradores livres: ${G.THAW_NPCS.filter((n) => g.flag('thaw_' + n)).length}/${G.THAW_NPCS.length}`,
    ready: (g) => G.THAW_NPCS.every((n) => g.flag('thaw_' + n)),
    reward: (g) => { g.inv.add('cristal_gelido', 1, g); g.addGold(120); g.addPoints(1); return 'Cristal Gélido, 120 moedas e 1 Ponto de Lembrança'; },
  },
  irmao: {
    title: 'O Irmão de Nessa',
    giver: 'nessa',
    desc: 'Tavi entrou nas Minas de Cristal antes do frio e não voltou. Nessa quer o irmão de volta.',
    objective: (g) => (g.flag('thaw_tavi') ? 'Volte para falar com Nessa' : 'Encontre Tavi nas minas'),
    ready: (g) => g.flag('thaw_tavi'),
    reward: (g) => { g.inv.add('amuleto_brasa', 1, g); g.addPoints(1); return 'Amuleto de Brasa e 1 Ponto de Lembrança'; },
  },
  alfa: {
    title: 'O Alfa da Nevasca',
    giver: 'garrik',
    desc: 'Um lobo branco enorme ronda a clareira a leste dos Picos Gelados. Garrik quer o dente dele.',
    objective: (g) => (g.inv.count('dente_alfa') ? 'Volte para falar com Garrik' : 'Derrote o Lobo Alfa nos picos'),
    ready: (g) => g.inv.count('dente_alfa') > 0,
    reward: (g) => { g.inv.remove('dente_alfa', 1); g.inv.add('capa_neve', 1, g); g.addGold(120); g.addPoints(1); return 'Capa do Alfa, 120 moedas e 1 Ponto de Lembrança'; },
  },
  diario: {
    title: 'O Diário de Hadrik',
    giver: 'holt',
    desc: 'As páginas do diário de Sir Hadrik, o último comandante da Vigília Branca, estão espalhadas pelo norte.',
    objective: (g) => `Páginas do Diário: ${g.inv.count('pagina_diario')}/5`,
    ready: (g) => g.inv.count('pagina_diario') >= 5,
    auto: true,
    reward: (g) => { g.inv.add('brasao_vigilia', 1, g); g.addPoints(1); return 'Brasão da Vigília e 1 Ponto de Lembrança'; },
  },
  // ---------------------------------------------------------------- Capítulo III
  cajado: {
    title: 'O Cajado do Mestre',
    giver: 'elian',
    desc: 'Elian, o último aprendiz de Velmora, guarda o cajado de Aurelian. A torre o levou para os Jardins Suspensos.',
    objective: (g) => (g.inv.count('cajado_aurelian') ? 'Leve o cajado para Elian' : 'Encontre o cajado nos Jardins Suspensos'),
    ready: (g) => g.inv.count('cajado_aurelian') > 0,
    reward: (g) => { g.inv.remove('cajado_aurelian', 1); g.inv.add('manto_aurora', 1, g); g.inv.add('nucleo_estelar', 1, g); g.addPoints(1); return 'Manto da Aurora, Núcleo Estelar e 1 Ponto de Lembrança'; },
  },
  constelacoes: {
    title: 'As Sete Constelações',
    giver: 'lirien',
    desc: 'Pedaços do céu de Velmora se espalharam pela torre. São sete.',
    objective: (g) => `Constelações: ${g.inv.count('constelacao')}/7`,
    ready: (g) => g.inv.count('constelacao') >= 7,
    auto: true,
    reward: (g) => { g.inv.add('coroa_estelar', 1, g); g.addPoints(1); return 'Coroa de Constelações e 1 Ponto de Lembrança'; },
  },
};
