// Árvore de habilidades. Pontos de Lembrança são compartilhados: a dupla decide
// junta onde investir. Nós com "ch" só ficam disponíveis a partir daquele capítulo.
G.Skills = {
  lirien: [
    { id: 'fluxo', name: 'Fluxo Arcano', cost: 1, icon: 'mana', desc: 'Mana regenera 50% mais rápido.' },
    { id: 'rajada', name: 'Rajada Dupla', cost: 2, icon: 'staff', desc: 'O projétil básico sai em par.', req: 'fluxo' },
    { id: 'geada_ampla', name: 'Geada Ampla', cost: 1, icon: 'frost', desc: 'Geada com raio maior e congela por mais tempo.' },
    { id: 'passo_etereo', name: 'Passo Etéreo', cost: 1, icon: 'tk', desc: 'Teleporte vai mais longe e protege por mais tempo.' },
    { id: 'foco', name: 'Foco Rápido', cost: 2, icon: 'star', desc: 'Magia carregada fica pronta mais rápido.', req: 'geada_ampla' },
    { id: 'mana_profunda', name: 'Mana Profunda', cost: 2, icon: 'ether', desc: '+40 de mana máxima.', ch: 2 },
    { id: 'chama_viva', name: 'Chama Viva', cost: 2, icon: 'fire', desc: 'Chama Estelar queima por mais tempo.', ch: 2 },
    { id: 'tempestade_maior', name: 'Tempestade Maior', cost: 3, icon: 'shard', desc: 'O especial dispara o dobro de estrelas.', req: 'foco', ch: 2 },
    { id: 'estase_longa', name: 'Estase Longa', cost: 2, icon: 'stasis', desc: 'A bolha de Estase dura mais, é maior e mais lenta.', ch: 3 },
    { id: 'pele_eterea', name: 'Pele Etérea', cost: 3, icon: 'amulet', desc: '+25 de vida máxima e recebe 15% menos dano.', ch: 3 },
  ],
  aldren: [
    { id: 'vigor', name: 'Vigor', cost: 1, icon: 'heart', desc: '+30 de vida máxima.' },
    { id: 'lamina_veloz', name: 'Lâmina Veloz', cost: 1, icon: 'sword', desc: 'Golpes rápidos 18% mais velozes.' },
    { id: 'guarda_perfeita', name: 'Guarda Perfeita', cost: 1, icon: 'shield', desc: 'Janela de aparar maior; aparar cura um pouco.' },
    { id: 'golpe_sismico', name: 'Golpe Sísmico', cost: 2, icon: 'taunt', desc: 'Golpe pesado gera onda de choque que atordoa.', req: 'lamina_veloz' },
    { id: 'folego', name: 'Fôlego de Herói', cost: 2, icon: 'potion', desc: 'Fôlego regenera 40% mais rápido.', req: 'vigor' },
    { id: 'arremesso_forte', name: 'Braço de Urso', cost: 2, icon: 'fang', desc: 'Arremessa a Lirien mais longe; o pouso causa mais dano.', ch: 2 },
    { id: 'escudo_vento', name: 'Muralha Viva', cost: 1, icon: 'shield', desc: 'A proteção do escudo contra o vento fica maior.', ch: 2 },
    { id: 'contra_ataque', name: 'Contra-Ataque', cost: 2, icon: 'sword', desc: 'Depois de aparar, o próximo golpe causa o triplo de dano.', req: 'guarda_perfeita', ch: 2 },
    { id: 'vigor2', name: 'Coração de Gigante', cost: 3, icon: 'heart', desc: '+50 de vida máxima.', req: 'vigor', ch: 3 },
    { id: 'juramento', name: 'Juramento', cost: 3, icon: 'star', desc: 'Reviver a Lirien é duas vezes mais rápido e devolve mais vida.', ch: 3 },
  ],
};
