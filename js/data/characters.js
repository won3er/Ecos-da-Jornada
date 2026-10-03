// ====================================================================
// PERSONAGENS — ponto central para trocar nomes/atributos/cores.
// Para transformar em outra IP: altere os nomes aqui, as falas em
// dialogue.js e a arte em gfx/sprites.js.
// ====================================================================
G.Characters = {
  lirien: {
    name: 'Lirien',
    title: 'Maga élfica',
    kind: 'mage',
    color: '#8ae8ff',
    blip: 760,
    speed: 74,
    dmgTaken: 1.25, // mais frágil fisicamente
    stats: { hp: 60, mp: 100, st: 100, mpRegen: 7, stRegen: 30, magic: 6, power: 3, defense: 1 },
    keys: { attack: 'J', skill: 'K', act: 'L', swap: 'I', moveLabel: 'WASD' },
  },
  aldren: {
    name: 'Aldren',
    title: 'Herói espadachim',
    kind: 'warrior',
    color: '#ff8a6a',
    blip: 420,
    speed: 80,
    dmgTaken: 1,
    stats: { hp: 100, mp: 0, st: 100, mpRegen: 0, stRegen: 32, magic: 0, power: 8, defense: 1 },
    keys: { attack: '1', skill: '2', act: '3', swap: '4', moveLabel: 'Setas' },
  },
  kid: { name: 'Aldren (criança)', blip: 560 },
  sign: { name: '', blip: 500 },
  narrator: { name: '', blip: 500 },
};

// NPCs da Fase 1 — aparência (paleta) e nome
G.NPCs = {
  orvin: { name: 'Ancião Orvin', look: { hair: '#e8e4dc', beard: true, cloth: '#5a4a7a', staff: true, robe: true } },
  mirta: { name: 'Mirta, a curandeira', look: { scarf: '#5a8a5a', cloth: '#c8b89a', hair: '#8a5a3a', longHair: true } },
  tobin: { name: 'Tobin, o mercador', look: { hat: '#7a4a2a', cloth: '#8a6a3a', hair: '#3a2a1a' } },
  brunna: { name: 'Brunna, a ferreira', look: { apron: '#6a5a4a', cloth: '#7a3a3a', hair: '#c8642a' } },
  bram: { name: 'Bram, o caçador', look: { cloth: '#4a5a3a', hair: '#2a1a10', hat: '#3a4a2a' } },
  pip: { name: 'Pip', look: { kid: true, hair: '#d8a050', cloth: '#4a8a6a' }, wander: true },
  edda: { name: 'Vó Edda', look: { hair: '#c8c4c0', scarf: '#8a4a6a', cloth: '#6a5a6a', longHair: true } },
  lena: { name: 'Lena', look: { hair: '#2a1a1a', cloth: '#3a6a8a', longHair: true }, wander: true },
  guard: { name: 'Guarda Hugo', look: { hair: '#5a3a22', cloth: '#6a6e7a', hat: '#4a4e5a' } },
};
