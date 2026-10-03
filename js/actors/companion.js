// Parceiro controlado pelo computador (Modo Solo). Segue, luta de forma simples
// e revive o jogador. Tab (ou Select no controle) troca quem você controla.
(function () {
  const U = G.U;
  const mk = () => ({ down: false, pressed: false, released: false });

  class CompanionAI {
    constructor() { this.stuckT = 0; this.atkT = 0; this.lastPos = null; this.holdAtk = 0; }
    think(me, g, dt) {
      const inp = { mx: 0, my: 0, attack: mk(), skill: mk(), act: mk(), swap: mk() };
      const leader = me.partner(g);
      if (!leader || g.inputLocked()) return inp;
      if (me.state === 'down' || me.state === 'fall') return inp;
      // reviver o líder
      if (leader.state === 'down') {
        const d = U.dist(me.x, me.y, leader.x, leader.y);
        if (d > 16) { const n = U.norm(leader.x - me.x, leader.y - me.y); inp.mx = n.x; inp.my = n.y; }
        else inp.act.down = true;
        return inp;
      }
      // combate simples
      let enemy = null, ed = me.kind === 'mage' ? 130 : 70;
      for (const e of g.entities) {
        if (!e.isEnemy || e.dead || e.intangible || e.boss) continue;
        const d = U.dist(me.x, me.y, e.x, e.y);
        if (d < ed && U.dist(leader.x, leader.y, e.x, e.y) < 160) { ed = d; enemy = e; }
      }
      this.atkT -= dt;
      if (enemy) {
        const n = U.norm(enemy.x - me.x, enemy.y - me.y);
        if (me.kind === 'warrior') {
          if (ed > 18) { inp.mx = n.x; inp.my = n.y; }
          else { me.setDir(n.x, n.y); if (this.atkT <= 0 && me.state === 'normal') { inp.attack.pressed = true; inp.attack.down = true; this.atkT = 0.45; } }
        } else {
          if (ed < 50) { inp.mx = -n.x; inp.my = -n.y; }
          me.setDir(n.x, n.y);
          if (this.atkT <= 0 && me.state === 'normal') { inp.attack.pressed = true; inp.attack.down = true; this.atkT = 0.7; this.holdAtk = 0.02; }
          else if (me.state === 'charge') { inp.attack.down = false; }
        }
        return inp;
      }
      // seguir
      const d = U.dist(me.x, me.y, leader.x, leader.y);
      if (d > 34) {
        const tx = leader.x - leader.fx * 18, ty = leader.y - leader.fy * 14;
        const n = U.norm(tx - me.x, ty - me.y);
        inp.mx = n.x; inp.my = n.y;
        // detecção de travamento
        if (this.lastPos && U.dist(this.lastPos.x, this.lastPos.y, me.x, me.y) < 0.3) this.stuckT += dt; else this.stuckT = 0;
        this.lastPos = { x: me.x, y: me.y };
      } else this.stuckT = 0;
      if (this.stuckT > 1.2 || d > 220) this.teleport(me, leader, g);
      return inp;
    }
    teleport(me, leader, g) {
      this.stuckT = 0;
      for (const [ox, oy] of [[-16, 0], [16, 0], [0, 12], [0, -12], [-12, 10], [12, 10], [0, 0]]) {
        const b = { x: leader.x + ox - me.w / 2, y: leader.y + oy - me.h, w: me.w, h: me.h };
        const tx = Math.floor((leader.x + ox) / 16), ty = Math.floor((leader.y + oy - 2) / 16);
        if (!G.Physics.blocked(g, b, me) && !g.level.isHole(tx, ty)) {
          g.particles.burst(me.x, me.y - 10, 10, { colors: ['#ffe8a0', '#ffffff'], speed: 30, life: 0.4, glow: true });
          me.x = leader.x + ox; me.y = leader.y + oy;
          g.particles.burst(me.x, me.y - 10, 10, { colors: ['#ffe8a0', '#ffffff'], speed: 30, life: 0.4, glow: true });
          return;
        }
      }
    }
  }
  G.CompanionAI = CompanionAI;
})();
