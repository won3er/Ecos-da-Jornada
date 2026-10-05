// Progressão: Pontos de Lembrança, árvore de habilidades e cálculo de atributos
// (base + habilidades + equipamentos + artefatos + ferreiro).
(function () {
  class Progression {
    constructor() { this.points = 0; this.learned = new Set(); }
    canLearn(charKey, sk, g) {
      if (this.learned.has(sk.id)) return false;
      if (sk.req && !this.learned.has(sk.req)) return false;
      if (sk.ch && g && g.chapter < sk.ch) return false;
      return this.points >= sk.cost;
    }
    learn(charKey, sk, g) {
      if (!this.canLearn(charKey, sk, g)) return false;
      this.points -= sk.cost;
      this.learned.add(sk.id);
      return true;
    }
    has(id) { return this.learned.has(id); }
    serialize() { return { points: this.points, learned: [...this.learned] }; }
    load(d) { if (!d) return; this.points = d.points || 0; this.learned = new Set(d.learned || []); }
  }
  G.Progression = Progression;

  // Atributo final de um personagem
  G.computeStat = function (g, who, name) {
    const base = G.Characters[who].stats[name];
    let v = base;
    const inv = g.inv;
    const items = G.Items;
    const eq = inv.equip[who] || {};
    const artifacts = Object.keys(inv.items).filter((id) => items[id].cat === 'artefato');
    const bon = (b) => {
      if (!b) return;
      if (name === 'hp') v += (b.hp || 0) + (b.hpAll || 0);
      if (name === 'mp' && who === 'lirien') v += (b.mp || 0) + (b.mpAll || 0);
      if (name === 'magic') v += b.magic || 0;
      if (name === 'power') v += b.power || 0;
    };
    if (eq.acc) bon(items[eq.acc].bonus);
    for (const a of artifacts) {
      const b = items[a].bonus || {};
      if (b.power && who !== 'aldren') continue; // espada de madeira é do Aldren
      bon(b);
    }
    // ferreiro
    if (name === 'power') v += inv.weapon.sword * 3;
    if (name === 'magic') v += inv.weapon.staff * 2;
    // habilidades
    const P = g.prog;
    if (name === 'hp' && who === 'aldren' && P.has('vigor')) v += 30;
    if (name === 'hp' && who === 'aldren' && P.has('vigor2')) v += 50;
    if (name === 'hp' && who === 'lirien' && P.has('pele_eterea')) v += 25;
    if (name === 'mp' && who === 'lirien' && P.has('mana_profunda')) v += 40;
    if (name === 'power') v += inv.weapon.sword > 2 ? (inv.weapon.sword - 2) * 1 : 0; // níveis altos da forja dão um extra
    if (name === 'magic') v += inv.weapon.staff > 2 ? (inv.weapon.staff - 2) * 1 : 0;
    if (name === 'mpRegen' && P.has('fluxo')) v *= 1.5;
    if (name === 'stRegen' && who === 'aldren' && P.has('folego')) v *= 1.4;
    if (name === 'magic' && inv.has('grimorio')) v *= 1.25;
    if (name === 'magic' && inv.has('coroa_estelar')) v *= 1.15;
    if (name === 'power' && inv.has('brasao_vigilia')) v *= 1.15;
    if (name === 'defense') {
      v = 1;
      if (who === 'lirien' && P.has('pele_eterea')) v *= 0.85;
      for (const a of artifacts) { const b = items[a].bonus || {}; if (b.def) v *= 1 - b.def; }
      if (eq.acc && items[eq.acc].bonus && items[eq.acc].bonus.def) v *= 1 - items[eq.acc].bonus.def;
    }
    return v;
  };
})();
