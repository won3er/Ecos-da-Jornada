// Itens: consumíveis, equipamentos, artefatos, colecionáveis e itens de missão.
// cat: 'consumivel' | 'equipamento' | 'artefato' | 'colecionavel' | 'missao'
G.Items = {
  pocao: { name: 'Poção de Cura', cat: 'consumivel', icon: 'potion', price: 20, desc: 'Recupera 50% da vida de um personagem.', use: { heal: 0.5 } },
  eter: { name: 'Éter', cat: 'consumivel', icon: 'ether', price: 20, desc: 'Recupera toda a mana e o fôlego.', use: { restore: 999 } },
  pluma: { name: 'Pluma da Fênix', cat: 'consumivel', icon: 'feather', price: 80, desc: 'Se alguém cair, revive automaticamente com metade da vida.' },

  amuleto_mirta: { name: 'Amuleto de Mirta', cat: 'equipamento', slot: 'acc', icon: 'amulet', desc: '+15 de vida máxima.', bonus: { hp: 15 } },
  anel_foco: { name: 'Anel do Foco', cat: 'equipamento', slot: 'acc', icon: 'ring', price: 120, desc: '+2 de magia e +15 de mana.', bonus: { magic: 2, mp: 15 } },
  capa_cinzenta: { name: 'Capa Cinzenta', cat: 'equipamento', slot: 'cosmetic', who: 'aldren', icon: 'cloak', desc: 'Cosmético: a capa do Aldren fica cinzenta como o lobo.' },
  fita_estelar: { name: 'Fita Estelar', cat: 'equipamento', slot: 'cosmetic', who: 'lirien', icon: 'ribbon', desc: 'Cosmético: o manto da Lirien ganha tons de noite estrelada.' },

  grimorio: { name: 'Grimório Restaurado', cat: 'artefato', icon: 'book', desc: 'As páginas perdidas de Lirien, de volta ao lugar. +25% de dano mágico.', bonus: { magicMul: 0.25 } },
  coracao_pedra: { name: 'Coração de Pedra', cat: 'artefato', icon: 'ore', desc: 'Núcleo do Guardião. +10 de vida máxima para os dois.', bonus: { hpAll: 10 } },
  fragmento_estelar: { name: 'Fragmento Estelar', cat: 'artefato', icon: 'shard', desc: 'Um pedaço da estrela caída. Ainda pulsa. Aponta para o norte.', bonus: { hpAll: 10, mpAll: 10 } },
  espada_madeira: { name: 'Espada de Madeira', cat: 'artefato', icon: 'woodsword', desc: 'A espada de treino que Aldren perdeu há doze anos. +1 de força.', bonus: { power: 1 } },

  pagina: { name: 'Página do Grimório', cat: 'colecionavel', icon: 'page', desc: 'Uma página escrita com a letra caprichada de Lirien. Faltam algumas.' },
  flor_orvalho: { name: 'Flor-de-Orvalho', cat: 'missao', icon: 'flower', desc: 'Flor azul que brilha à noite. A curandeira precisa de três.' },
  minerio: { name: 'Minério Estelar', cat: 'missao', icon: 'ore', desc: 'Metal leve que cai com as estrelas. A ferreira saberia usar.' },
  presa: { name: 'Presa do Lobo Cinzento', cat: 'missao', icon: 'fang', desc: 'Prova de que o lobo foi derrotado.' },
};
