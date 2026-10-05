// FASE 1 — Vila de Brisaclara (hub): NPCs, loja, ferreira, missões, segredos
// e tutoriais "de cenário" (bonecos de treino, braseiros, caixote).
G.defineArea({
  id: 'vila',
  title: 'Vila de Brisaclara',
  theme: 'village',
  music: 'village',
  ambience: 'village',
  ambient: 'petals',
  combatMusic: false,
  size: [48, 32],
  seed: 3,
  build(b) {
    b.border('T', 2, 3, [[44, 13, 4, 5]]);
    b.scatter(2, 2, 44, 3, 'T', 0.12);
    b.scatter(2, 27, 44, 3, 'T', 0.12);
    b.scatter(3, 3, 42, 26, ',', 0.05);
    b.scatter(3, 3, 42, 26, ';', 0.03);
    // praça e caminhos
    b.rect(17, 12, 14, 8, 'p');
    b.rect(21, 10, 2, 2, 'p');           // casa do ancião
    b.rect(31, 14, 17, 3, ':');          // estrada leste
    b.rect(33, 10, 2, 4, ':');           // loja
    b.rect(8, 15, 9, 2, ':');            // oeste
    b.rect(11, 14, 1, 1, ':');           // ferraria
    b.rect(15, 17, 2, 7, ':'); b.rect(10, 23, 6, 1, ':'); // curandeira
    b.rect(21, 20, 2, 8, ':');           // estalagem
    b.path([[30, 19], [32, 19], [32, 26]], ':', 2); // casa do Bram
    b.rect(38, 8, 8, 5, ':');            // campo de treino
    b.rect(37, 17, 2, 9, ':'); b.rect(35, 26, 8, 1, ':'); // celeiro
    // santuário da chama (noroeste): jardim cercado por sebe
    b.rect(3, 3, 7, 4, '.'); b.frame(3, 2, 7, 4, 'h'); b.set(6, 5, ':');
    b.rect(4, 6, 6, 3, 'p');
    // plantação (nordeste)
    b.frame(36, 2, 8, 5, 'F'); b.rect(37, 3, 6, 3, ';'); b.set(39, 6, '.');
    // lago (sudoeste)
    b.ellipse(5, 25, 3.2, 2.2, 'W');
    b.set(2, 25, ','); b.set(8, 23, ',');
    // nicho do caixote (segredo)
    b.frame(43, 22, 4, 5, 'F'); b.rect(44, 23, 2, 3, '.'); b.set(43, 24, '.');
    b.rect(42, 24, 1, 1, '.');
    // estrada norte (Capítulo II): portão de madeira entre cercas
    b.rect(28, 0, 2, 12, ':');
    b.set(26, 3, 'F'); b.set(27, 3, 'F'); b.set(30, 3, 'F'); b.set(31, 3, 'F');
    b.set(26, 2, 'T'); b.set(31, 2, 'T');
  },
  spawns: { start: [23, 18], leste: [44, 15], norte: [28, 2] },
  exits: [{ x: 47, y: 13, h: 5, to: 'estrada', spawn: 'oeste' }, { x: 28, y: 0, w: 2, to: 'trilha', spawn: 'sul' }],
  zones: [{ x: 40, y: 14, w: 2, h: 3, trigger: 'vila_saida' }],
  entities: [
    // casas
    { type: 'decor', kind: 'house', tx: 19, ty: 9, w: 6, h: 3, roof: '#5a4a8a', wall: '#e0d4bc', door: [{ who: 'sign', text: 'A casa do Ancião Orvin. Cheira a livros velhos e chá de camomila.' }] },
    { type: 'decor', kind: 'house', tx: 31, ty: 9, w: 5, h: 3, roof: '#3a7a5a', wall: '#e8dcc0', signColor: '#c84a3a', door: [{ who: 'sign', text: 'Tenda do Tobin. "Fale comigo aqui fora — o estoque não cabe lá dentro!"' }] },
    { type: 'decor', kind: 'house', tx: 9, ty: 13, w: 5, h: 3, roof: '#6a5a5a', wall: '#c8b8a0', signColor: '#5a5a6a', door: [{ who: 'sign', text: 'A forja da Brunna. Lá dentro, o calor é de outro mundo.' }] },
    { type: 'decor', kind: 'house', tx: 9, ty: 22, w: 5, h: 3, roof: '#4a7a4a', wall: '#e8e0c8', signColor: '#4a8a5a', door: [{ who: 'sign', text: 'Casa de ervas da Mirta. Potes e potes de folhas secas.' }] },
    { type: 'decor', kind: 'house', tx: 19, ty: 26, w: 6, h: 3, roof: '#8a3a3a', wall: '#e0d0b0', signColor: '#d8a040', door: [{ who: 'sign', text: 'Estalagem do Javali Sonolento. Fechada até o fim da crise.' }] },
    { type: 'decor', kind: 'house', tx: 30, ty: 25, w: 4, h: 3, roof: '#7a5a3a', wall: '#d8c8a8', door: [{ who: 'sign', text: 'A casa do Bram. Há chifres de cervo pendurados na porta.' }] },
    { type: 'decor', kind: 'house', tx: 35, ty: 25, w: 6, h: 3, roof: '#8a2a2a', wall: '#c89a6a', chimney: false, door: [{ who: 'sign', text: 'O celeiro. Muuuu, diz alguém lá dentro.' }] },
    // praça
    { type: 'decor', kind: 'well', tx: 23, ty: 15, text: [{ who: 'sign', text: 'O poço da vila. Lá no fundo, uma moeda brilha... e continua lá.' }] },
    { type: 'decor', kind: 'lamp', tx: 17, ty: 12 }, { type: 'decor', kind: 'lamp', tx: 30, ty: 12 },
    { type: 'decor', kind: 'lamp', tx: 17, ty: 19 }, { type: 'decor', kind: 'lamp', tx: 30, ty: 19 },
    { type: 'decor', kind: 'banner', tx: 18, ty: 9, color: '#5a4a8a' }, { type: 'decor', kind: 'banner', tx: 25, ty: 9, color: '#5a4a8a' },
    { type: 'decor', kind: 'barrel', tx: 15, ty: 13 }, { type: 'decor', kind: 'barrel', tx: 8, ty: 14 },
    { type: 'decor', kind: 'barrel', tx: 36, ty: 10 }, { type: 'decor', kind: 'barrel', tx: 36, ty: 11 },
    { type: 'decor', kind: 'cart', tx: 25, ty: 12 },
    { type: 'gate', id: 'portao_n1', tx: 28, ty: 3, flag: 'portao_norte' }, { type: 'gate', id: 'portao_n2', tx: 29, ty: 3, flag: 'portao_norte' },
    { type: 'sign', tx: 27, ty: 5, text: 'Estrada Norte — Montanhas de Gelvar. "Portão fechado durante o inverno. Ordem do Ancião Orvin."' },
    { type: 'waystone', tx: 21, ty: 18, cp: 'cp_vila', name: 'Vila de Brisaclara' },
    { type: 'decor', kind: 'tent', tx: 44, ty: 20 },
    // NPCs
    { npc: 'orvin', tx: 23, ty: 11 },
    { npc: 'tobin', tx: 35, ty: 12 },
    { npc: 'brunna', tx: 13, ty: 15 },
    { npc: 'mirta', tx: 13, ty: 24 },
    { npc: 'bram', tx: 41, ty: 19 },
    { npc: 'pip', tx: 20, ty: 17 },
    { npc: 'edda', tx: 27, ty: 16 },
    { npc: 'lena', tx: 25, ty: 23 },
    { npc: 'guard', tx: 44, ty: 13 },
    // campo de treino (tutorial pelo cenário)
    { type: 'dummy', tx: 39, ty: 9 }, { type: 'dummy', tx: 42, ty: 9 }, { type: 'dummy', tx: 45, ty: 10 },
    { type: 'sign', tx: 38, ty: 12, text: 'Campo de treino. "Atordoe com um golpe pesado e acerte em cheio com magia carregada." — Bram' },
    // santuário: acender os dois braseiros abre o jardim (página 1)
    { type: 'brazier', id: 'br_v1', tx: 4, ty: 7 }, { type: 'brazier', id: 'br_v2', tx: 9, ty: 7 },
    { type: 'decor', kind: 'statue', tx: 6, ty: 8, offset: [8, 0] },
    { type: 'gate', id: 'gate_jardim', tx: 6, ty: 5, requires: ['br_v1', 'br_v2'], flag: 'vila_jardim' },
    { type: 'chest', tx: 6, ty: 3, flag: 'secret_vila_jardim', contents: [{ item: 'pagina' }], gold: 10 },
    { type: 'sign', tx: 10, ty: 8, text: 'Santuário da Chama Antiga. "A luz guia quem lembra." Os braseiros estão apagados há anos.' },
    // segredo do caixote (Aldren puxa/empurra)
    { type: 'crate', tx: 43, ty: 24 },
    { type: 'chest', tx: 45, ty: 23, flag: 'secret_vila_caixote', contents: [{ item: 'pluma' }], gold: 25 },
    // arbustos com moedas
    { type: 'bush', tx: 12, ty: 19 }, { type: 'bush', tx: 34, ty: 21 }, { type: 'bush', tx: 27, ty: 21 }, { type: 'bush', tx: 4, ty: 21 },
    { type: 'bush', tx: 45, ty: 7 }, { type: 'bush', tx: 3, ty: 11 },
  ],
  triggers: {
    vila_saida(g) { g.banter('vila_saida'); },
  },
});
