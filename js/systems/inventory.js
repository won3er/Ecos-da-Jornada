// Inventário compartilhado da dupla + equipamentos por personagem.
(function () {
  class Inventory {
    constructor() {
      this.items = {};
      this.equip = { lirien: { acc: null, cosmetic: null }, aldren: { acc: null, cosmetic: null } };
      this.weapon = { sword: 0, staff: 0 }; // níveis de melhoria do ferreiro
    }
    add(id, n = 1, g) {
      if (!G.Items[id]) { console.warn('Item desconhecido', id); return; }
      this.items[id] = (this.items[id] || 0) + n;
      if (g) g.onItemGained(id, n);
    }
    remove(id, n = 1) {
      this.items[id] = Math.max(0, (this.items[id] || 0) - n);
      if (!this.items[id]) delete this.items[id];
    }
    count(id) { return this.items[id] || 0; }
    has(id) { return this.count(id) > 0; }
    byCategory(cat) {
      return Object.keys(this.items).filter((id) => G.Items[id].cat === cat).map((id) => ({ id, qty: this.items[id], def: G.Items[id] }));
    }
    use(id, target, g) {
      const it = G.Items[id];
      if (!it || !it.use || !this.has(id)) return false;
      const targets = it.use.both && g ? g.players.filter((p) => p && !p.isDown) : [target];
      if (!targets.length || (!it.use.both && target.isDown)) return false;
      for (const t of targets) {
        if (it.use.heal) t.heal(Math.round(t.maxHp * it.use.heal), g);
        if (it.use.restore) { t.mp = t.maxMp; t.st = t.maxSt; G.Audio.sfx('heal'); }
        if (it.use.special) { t.special = Math.min(100, t.special + it.use.special); G.Audio.sfx('chargeReady'); }
      }
      this.remove(id, 1);
      return true;
    }
    equipItem(id, who) {
      const it = G.Items[id];
      if (!it || it.cat !== 'equipamento') return false;
      if (it.who && it.who !== who) return false;
      const slot = it.slot;
      // tira de quem estava usando
      for (const k in this.equip) if (this.equip[k][slot] === id) this.equip[k][slot] = null;
      this.equip[who][slot] = id;
      return true;
    }
    unequip(id) { for (const k in this.equip) for (const s in this.equip[k]) if (this.equip[k][s] === id) this.equip[k][s] = null; }
    equippedBy(id) { for (const k in this.equip) for (const s in this.equip[k]) if (this.equip[k][s] === id) return k; return null; }
    serialize() { return { items: this.items, equip: this.equip, weapon: this.weapon }; }
    load(d) {
      if (!d) return;
      this.items = Object.assign({}, d.items || {});
      if (d.equip) this.equip = JSON.parse(JSON.stringify(d.equip));
      if (d.weapon) this.weapon = Object.assign({ sword: 0, staff: 0 }, d.weapon);
    }
  }
  G.Inventory = Inventory;
})();
