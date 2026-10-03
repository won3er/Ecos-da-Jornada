// Árvore de habilidades (pequena). Pontos de Lembrança são compartilhados:
// a dupla decide junta onde investir.
G.Skills = {
  lirien: [
    { id: 'fluxo', name: 'Fluxo Arcano', cost: 1, icon: 'mana', desc: 'Mana regenera 50% mais rápido.', stat: { mpRegenMul: 0.5 } },
    { id: 'rajada', name: 'Rajada Dupla', cost: 2, icon: 'staff', desc: 'O projétil básico sai em par.', req: 'fluxo' },
    { id: 'geada_ampla', name: 'Geada Ampla', cost: 1, icon: 'frost', desc: 'Geada com raio maior e congela por mais tempo.' },
    { id: 'passo_etereo', name: 'Passo Etéreo', cost: 1, icon: 'tk', desc: 'Teleporte vai mais longe e protege por mais tempo.' },
    { id: 'foco', name: 'Foco Rápido', cost: 2, icon: 'star', desc: 'Magia carregada fica pronta mais rápido.', req: 'geada_ampla' },
  ],
  aldren: [
    { id: 'vigor', name: 'Vigor', cost: 1, icon: 'heart', desc: '+30 de vida máxima.', stat: { hp: 30 } },
    { id: 'lamina_veloz', name: 'Lâmina Veloz', cost: 1, icon: 'sword', desc: 'Golpes rápidos 18% mais velozes.' },
    { id: 'guarda_perfeita', name: 'Guarda Perfeita', cost: 1, icon: 'shield', desc: 'Janela de aparar maior; aparar cura um pouco.' },
    { id: 'golpe_sismico', name: 'Golpe Sísmico', cost: 2, icon: 'taunt', desc: 'Golpe pesado gera onda de choque que atordoa.', req: 'lamina_veloz' },
    { id: 'folego', name: 'Fôlego de Herói', cost: 2, icon: 'potion', desc: 'Fôlego regenera 40% mais rápido.', req: 'vigor', stat: { stRegenMul: 0.4 } },
  ],
};
