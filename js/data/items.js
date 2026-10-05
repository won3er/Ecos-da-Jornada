// Itens: consumíveis, equipamentos, artefatos, colecionáveis e itens de missão.
// cat: 'consumivel' | 'equipamento' | 'artefato' | 'colecionavel' | 'missao'
G.Items = {
  // ---------------------------------------------------------------- consumíveis
  pocao: { name: 'Poção de Cura', cat: 'consumivel', icon: 'potion', price: 20, desc: 'Recupera 50% da vida de um personagem.', use: { heal: 0.5 } },
  eter: { name: 'Éter', cat: 'consumivel', icon: 'ether', price: 20, desc: 'Recupera toda a mana e o fôlego.', use: { restore: 999 } },
  pluma: { name: 'Pluma da Fênix', cat: 'consumivel', icon: 'feather', price: 80, desc: 'Se alguém cair, revive automaticamente com metade da vida.' },
  pocao_grande: { name: 'Poção Maior', cat: 'consumivel', icon: 'potion2', price: 55, desc: 'Recupera toda a vida de um personagem.', use: { heal: 1 } },
  elixir: { name: 'Elixir da Dupla', cat: 'consumivel', icon: 'elixir', price: 90, desc: 'Cura metade da vida dos DOIS e restaura mana e fôlego.', use: { both: true, heal: 0.5, restore: 999 } },
  tonico: { name: 'Tônico Estelar', cat: 'consumivel', icon: 'tonic', price: 60, desc: 'Enche a barra de especial de um personagem.', use: { special: 100 } },

  // ---------------------------------------------------------------- equipamentos (acessório / cosmético)
  amuleto_mirta: { name: 'Amuleto de Mirta', cat: 'equipamento', slot: 'acc', icon: 'amulet', desc: '+15 de vida máxima.', bonus: { hp: 15 } },
  anel_foco: { name: 'Anel do Foco', cat: 'equipamento', slot: 'acc', icon: 'ring', price: 120, desc: '+2 de magia e +15 de mana.', bonus: { magic: 2, mp: 15 } },
  botas_cravo: { name: 'Botas com Cravos', cat: 'equipamento', slot: 'acc', icon: 'boots', price: 90, desc: 'Não escorrega no gelo. +5 de vida.', bonus: { hp: 5 } },
  luvas_ferro: { name: 'Luvas de Ferro', cat: 'equipamento', slot: 'acc', icon: 'gloves', price: 150, desc: '+3 de força e +10 de vida.', bonus: { power: 3, hp: 10 } },
  amuleto_brasa: { name: 'Amuleto de Brasa', cat: 'equipamento', slot: 'acc', icon: 'amulet2', desc: '+3 de magia e +10 de vida. Ainda está morno.', bonus: { magic: 3, hp: 10 } },
  colar_aurora: { name: 'Colar da Aurora', cat: 'equipamento', slot: 'acc', icon: 'necklace', price: 260, desc: '+25 de vida, +15 de mana e 10% menos dano.', bonus: { hp: 25, mp: 15, def: 0.1 } },
  capa_cinzenta: { name: 'Capa Cinzenta', cat: 'equipamento', slot: 'cosmetic', who: 'aldren', icon: 'cloak', desc: 'Cosmético: a capa do Aldren fica cinzenta como o lobo.' },
  fita_estelar: { name: 'Fita Estelar', cat: 'equipamento', slot: 'cosmetic', who: 'lirien', icon: 'ribbon', desc: 'Cosmético: o manto da Lirien ganha tons de noite estrelada.' },
  capa_neve: { name: 'Capa do Alfa', cat: 'equipamento', slot: 'cosmetic', who: 'aldren', icon: 'cloak2', desc: 'Cosmético: uma capa branca de pele do Lobo Alfa da Nevasca.' },
  manto_aurora: { name: 'Manto da Aurora', cat: 'equipamento', slot: 'cosmetic', who: 'lirien', icon: 'ribbon2', desc: 'Cosmético: o manto da Lirien brilha com as cores da aurora.' },
  capa_talen: { name: 'Capa de Sir Talen', cat: 'equipamento', slot: 'cosmetic', who: 'aldren', icon: 'cloak3', desc: 'Cosmético: a capa azul do antigo protetor de Velmora.' },

  // ---------------------------------------------------------------- artefatos (bônus passivos)
  grimorio: { name: 'Grimório Restaurado', cat: 'artefato', icon: 'book', desc: 'As páginas perdidas de Lirien, de volta ao lugar. +25% de dano mágico.', bonus: { magicMul: 0.25 } },
  coracao_pedra: { name: 'Coração de Pedra', cat: 'artefato', icon: 'ore', desc: 'Núcleo do Guardião. +10 de vida máxima para os dois.', bonus: { hpAll: 10 } },
  fragmento_estelar: { name: 'Fragmento Estelar', cat: 'artefato', icon: 'shard', desc: 'Um pedaço da estrela caída. Ainda pulsa. Aponta para o norte.', bonus: { hpAll: 10, mpAll: 10 } },
  espada_madeira: { name: 'Espada de Madeira', cat: 'artefato', icon: 'woodsword', desc: 'A espada de treino que Aldren perdeu há doze anos. +1 de força.', bonus: { power: 1 } },
  garra_urso: { name: 'Garra de Geada', cat: 'artefato', icon: 'claw', desc: 'Lembrança de Grumak. +15 de vida máxima para os dois.', bonus: { hpAll: 15 } },
  nucleo_tempo: { name: 'Ampulheta Partida', cat: 'artefato', icon: 'hourglass', desc: 'O coração da segunda estrela. +10 de vida e +15 de mana para os dois.', bonus: { hpAll: 10, mpAll: 15 } },
  brasao_vigilia: { name: 'Brasão da Vigília', cat: 'artefato', icon: 'crest', desc: 'O diário de Sir Hadrik, completo. +15% de força e 5% menos dano.', bonus: { def: 0.05 } },
  coroa_estelar: { name: 'Coroa de Constelações', cat: 'artefato', icon: 'crown', desc: 'As sete constelações reunidas. +15% de dano mágico e +10 de vida para os dois.', bonus: { hpAll: 10 } },
  eco_unido: { name: 'Eco Unido', cat: 'artefato', icon: 'twin', desc: 'O que restou dos Ecos. A barra de especial enche 50% mais rápido.', bonus: {} },
  coracao_estelar: { name: 'Coração Estelar', cat: 'artefato', icon: 'heartstar', desc: 'A última luz de Nyxara, apaziguada. +20 de vida e mana para os dois.', bonus: { hpAll: 20, mpAll: 20 } },

  // ---------------------------------------------------------------- colecionáveis
  pagina: { name: 'Página do Grimório', cat: 'colecionavel', icon: 'page', desc: 'Uma página escrita com a letra caprichada de Lirien. Faltam algumas.' },
  pagina_diario: { name: 'Página do Diário', cat: 'colecionavel', icon: 'page2', desc: 'Do diário de Sir Hadrik, o último comandante da Vigília Branca.' },
  constelacao: { name: 'Fragmento de Constelação', cat: 'colecionavel', icon: 'constel', desc: 'Um pedacinho do céu de Velmora. São sete ao todo.' },

  // ---------------------------------------------------------------- missão / materiais
  flor_orvalho: { name: 'Flor-de-Orvalho', cat: 'missao', icon: 'flower', desc: 'Flor azul que brilha à noite. A curandeira precisa de três.' },
  minerio: { name: 'Minério Estelar', cat: 'missao', icon: 'ore', desc: 'Metal leve que cai com as estrelas. A ferreira saberia usar.' },
  presa: { name: 'Presa do Lobo Cinzento', cat: 'missao', icon: 'fang', desc: 'Prova de que o lobo foi derrotado.' },
  cristal_gelido: { name: 'Cristal Gélido', cat: 'missao', icon: 'icecrystal', desc: 'Cristal que nunca derrete. Forjas boas sabem usá-lo.' },
  nucleo_estelar: { name: 'Núcleo Estelar', cat: 'missao', icon: 'core', desc: 'Luz sólida, quente ao toque. O melhor material que existe.' },
  dente_alfa: { name: 'Dente do Alfa', cat: 'missao', icon: 'fang', desc: 'Prova de que o Lobo Alfa da Nevasca foi derrotado.' },
  cajado_aurelian: { name: 'Cajado de Aurelian', cat: 'missao', icon: 'staff', desc: 'O cajado do antigo mestre de Lirien. Ainda guarda um pouco de luz.' },
};
