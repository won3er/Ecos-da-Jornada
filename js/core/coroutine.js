// Corrotinas para cutscenes e scripts: funções geradoras que fazem "yield" de
// esperas. Ex.: function* cena(g){ yield C.wait(1); yield C.say('aldren','Oi'); }
(function () {
  const C = {};

  // Cada "waiter" tem update(dt, game) -> true quando terminou.
  C.wait = (sec) => ({ t: sec, update(dt) { this.t -= dt; return this.t <= 0; } });
  C.until = (fn) => ({ update(dt, g) { return !!fn(g); } });
  C.call = (fn) => ({ update(dt, g) { fn(g); return true; } });

  // Executa vários em paralelo
  C.all = (...ws) => ({
    update(dt, g) {
      let done = true;
      for (const w of ws) if (!w._done) { w._done = w.update(dt, g); if (!w._done) done = false; }
      return done;
    },
  });

  class Runner {
    constructor() { this.list = []; }
    start(genFn, game, opts = {}) {
      const it = genFn(game);
      const co = { it, waiter: null, done: false, blocking: opts.blocking !== false, name: opts.name || '', persist: !!opts.persist };
      this.list.push(co);
      this.step(co, game);
      return co;
    }
    step(co, game) {
      while (true) {
        let r;
        try { r = co.it.next(); } catch (e) { console.error('Erro em corrotina', co.name, e); co.done = true; return; }
        if (r.done) { co.done = true; return; }
        const w = r.value;
        if (!w) continue;
        if (typeof w.update !== 'function') continue;
        co.waiter = w;
        return;
      }
    }
    update(dt, game) {
      for (const co of this.list.slice()) {
        if (co.done) continue;
        if (co.waiter && co.waiter.update(dt, game)) { co.waiter = null; this.step(co, game); }
        else if (!co.waiter) this.step(co, game);
      }
      this.list = this.list.filter((c) => !c.done);
    }
    get blocking() { return this.list.some((c) => c.blocking && !c.done); }
    clear() { this.list.length = 0; }
  }
  C.Runner = Runner;
  G.Co = C;
})();
