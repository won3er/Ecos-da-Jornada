// Gerenciador de missões: estados inactive -> active -> ready -> done.
(function () {
  class QuestLog {
    constructor() { this.state = {}; }
    get(id) {
      const s = this.state[id] || 'inactive';
      return s;
    }
    start(id, g) {
      if (this.get(id) !== 'inactive') return;
      this.state[id] = 'active';
      G.Audio.sfx('pickup');
      g.toast('Nova missão: ' + G.Quests[id].title, 3);
      this.refresh(g);
    }
    refresh(g) {
      for (const id in G.Quests) {
        const q = G.Quests[id];
        const s = this.get(id);
        if (s === 'active' && q.ready(g)) {
          this.state[id] = 'ready';
          if (q.auto) this.complete(id, g);
          else g.toast('Missão pronta para entregar: ' + q.title, 3);
        } else if (s === 'ready' && !q.ready(g)) this.state[id] = 'active';
      }
    }
    complete(id, g) {
      const q = G.Quests[id];
      const rew = q.reward(g);
      this.state[id] = 'done';
      G.Audio.sfx('levelup');
      g.toast('Missão concluída: ' + q.title + (rew ? ' — ' + rew : ''), 4.5);
    }
    active() { return Object.keys(G.Quests).filter((id) => this.get(id) === 'active' || this.get(id) === 'ready'); }
    serialize() { return Object.assign({}, this.state); }
    load(d) { this.state = Object.assign({}, d || {}); }
  }
  G.QuestLog = QuestLog;
})();
