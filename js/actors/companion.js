// Parceiro controlado pelo computador (Modo Solo). Segue, luta, revive o jogador
// e ataca chefes quando eles ficam vulneráveis. Tab (ou Select) troca quem você
// controla — e quem fica para trás SEGURA A POSIÇÃO e o que estava fazendo
// (Ponte Etérea, Telecinese, escudo, ritual, placa de pressão) até você voltar.
(function () {
  const U = G.U;
  const mk = () => ({ down: false, pressed: false, released: false });

  class CompanionAI {
    constructor() { this.stuckT = 0; this.atkT = 0; this.lastPos = null; this.holdAtk = 0; this.hold = null; this.chargeT = 0; }

    // chamado quando o jogador aperta Tab: quem estava sendo controlado vira IA
    // e mantém os botões que estavam segurados (sem andar)
    onSwap(g, prevIndex) {
      const inp = G.Input.players[prevIndex] || {};
      const p = g.players[prevIndex];
      this.hold = {
        who: prevIndex,
        skill: !!(inp.skill && inp.skill.down),
        act: !!(inp.act && inp.act.down) && !!(p && (p.state === 'grab')),
        x: p ? p.x : 0, y: p ? p.y : 0,
        fx: p ? p.fx : 0, fy: p ? p.fy : 1,
        t: 0,
      };
      // só segura a posição se estava fazendo algo (canalizando, escudo,
      // agarrando, ritual ou em cima de uma placa); senão volta a seguir
      const busy = this.hold.skill || this.hold.act || (p && ['ritual', 'tk', 'bridge', 'block', 'grab', 'carry'].includes(p.state));
      const onPlate = p && g.entities.some((e) => e instanceof G.ObjectTypes.plate && U.rectsOverlap({ x: e.x - 6, y: e.y - 14, w: 12, h: 12 }, p.box));
      if (!busy && !onPlate) this.hold = null;
      else if (p) g.toast(p.name + ' segura a posição. (Tab para voltar)', 2.5);
    }

    think(me, g, dt) {
      const inp = { mx: 0, my: 0, attack: mk(), skill: mk(), act: mk(), swap: mk() };
      const leader = me.partner(g);
      if (!leader || g.inputLocked()) return inp;
      if (me.state === 'down' || me.state === 'fall') return inp;

      // reviver o líder vem antes de tudo
      if (leader.state === 'down') {
        this.hold = null;
        const d = U.dist(me.x, me.y, leader.x, leader.y);
        if (d > 16) { const n = U.norm(leader.x - me.x, leader.y - me.y); inp.mx = n.x; inp.my = n.y; this.unstuck(me, leader, g, dt, d); }
        else inp.act.down = true;
        return inp;
      }

      // UNIÃO no modo solo: quando o jogador solta o especial, a IA acompanha
      if (me.special >= 100 && g.lastSpecial && g.time - g.lastSpecial[leader.index] < 0.5 && g.lastSpecial[leader.index] > 0 && me.state === 'normal') {
        inp.attack.pressed = true; inp.attack.down = true; inp.skill.down = true; inp.skill.pressed = true;
        return inp;
      }
      // modo "segurar posição" (após trocar com Tab)
      if (this.hold && this.hold.who === me.index) {
        const h = this.hold;
        h.t += dt;
        const far = U.dist(me.x, me.y, leader.x, leader.y) > 320;
        const danger = me.hp < me.maxHp * 0.3 && !h.skill;
        if (far || danger) this.hold = null;
        else {
          inp.skill.down = h.skill;
          inp.act.down = h.act;
          if (h.skill || h.act) me.setDir(h.fx, h.fy);
          return inp;
        }
      }

      // combate
      let enemy = null, ed = me.kind === 'mage' ? 140 : 80;
      for (const e of g.entities) {
        if (!e.isEnemy || e.dead || e.intangible || e.deathT > 0) continue;
        if (e.boss && !this.bossOpen(e, me)) continue;
        if (e.state === 'sleep' || e.state === 'dormant') continue;
        const d = U.dist(me.x, me.y, e.x, e.y);
        if (d < ed && U.dist(leader.x, leader.y, e.x, e.y) < 180) { ed = d; enemy = e; }
      }
      this.atkT -= dt;
      if (enemy) {
        const n = U.norm(enemy.x - me.x, enemy.y - me.y);
        if (me.kind === 'warrior') {
          const reach = enemy.boss ? 26 : 18;
          if (ed > reach) { inp.mx = n.x; inp.my = n.y; this.unstuck(me, enemy, g, dt, ed); }
          else {
            me.setDir(n.x, n.y);
            if (this.atkT <= 0 && me.state === 'normal') { inp.attack.pressed = true; inp.attack.down = true; this.atkT = 0.42; }
          }
        } else {
          if (ed < 54) { inp.mx = -n.x; inp.my = -n.y; }
          me.setDir(n.x, n.y);
          // magia carregada contra blindados/véus/escudos; disparo simples no resto
          const wantsCharge = enemy.boss || (enemy.type === 'skeleton') || enemy.elite;
          if (me.state === 'charge') {
            this.chargeT += dt;
            if (!wantsCharge || this.chargeT > 0.95 || me.mp < 18) { inp.attack.down = false; this.chargeT = 0; }
            else inp.attack.down = true;
          } else if (this.atkT <= 0 && me.state === 'normal') {
            inp.attack.pressed = true; inp.attack.down = true; this.chargeT = 0;
            this.atkT = wantsCharge && me.mp >= 18 ? 1.6 : 0.7;
          }
        }
        return inp;
      }

      // seguir
      const d = U.dist(me.x, me.y, leader.x, leader.y);
      if (d > 34) {
        const tx = leader.x - leader.fx * 18, ty = leader.y - leader.fy * 14;
        const n = U.norm(tx - me.x, ty - me.y);
        inp.mx = n.x; inp.my = n.y;
        this.unstuck(me, leader, g, dt, d);
      } else this.stuckT = 0;
      if (d > 230) this.teleport(me, leader, g);
      return inp;
    }

    // chefes: só ataca quando estão vulneráveis (núcleo exposto, tontos etc.)
    bossOpen(e, me) {
      if (e.exposedT > 0 || e.dazedT > 0) return true;
      if (e.vulnerable && e.vulnerable(me)) return true;
      if (me.kind === 'mage' && e.shield > 0 && !e.intangible) return true; // carregada quebra véus
      return false;
    }

    unstuck(me, target, g, dt, d) {
      if (this.lastPos && U.dist(this.lastPos.x, this.lastPos.y, me.x, me.y) < 0.3) this.stuckT += dt; else this.stuckT = 0;
      this.lastPos = { x: me.x, y: me.y };
      if (this.stuckT > 1.2 && target.isPlayer) this.teleport(me, target, g);
    }

    teleport(me, leader, g) {
      this.stuckT = 0;
      // só "pula" para perto do líder se existir caminho a pé (a IA é que não
      // achou). Se não há caminho (portão fechado, abismo, muro), espera.
      if (!g.level.def.aiFreeTeleport && !g.reachable(me.x, me.y, leader.x, leader.y, 10)) {
        if (!this._noPathT || g.time - this._noPathT > 6) { this._noPathT = g.time; me.say('Não consigo passar por aqui!', 1.8); }
        return;
      }
      for (const [ox, oy] of [[-16, 0], [16, 0], [0, 12], [0, -12], [-12, 10], [12, 10], [0, 0]]) {
        const nx = leader.x + ox, ny = leader.y + oy;
        const b = { x: nx - me.w / 2, y: ny - me.h, w: me.w, h: me.h };
        const tx = Math.floor(nx / 16), ty = Math.floor((ny - 2) / 16);
        if (G.Physics.blocked(g, b, me) || g.level.isHole(tx, ty)) continue;
        // nunca aparece do outro lado de um portão/parede em relação ao líder
        if (!g.level.def.aiFreeTeleport && !g.reachable(leader.x, leader.y, nx, ny, 3)) continue;
        me.cancelActions(g);
        if (me.state !== 'normal') { me.state = 'normal'; me.stateT = 0; }
        g.particles.burst(me.x, me.y - 10, 10, { colors: ['#ffe8a0', '#ffffff'], speed: 30, life: 0.4, glow: true });
        me.x = nx; me.y = ny; me.lastSafe = { x: nx, y: ny };
        g.particles.burst(me.x, me.y - 10, 10, { colors: ['#ffe8a0', '#ffffff'], speed: 30, life: 0.4, glow: true });
        return;
      }
    }
  }
  G.CompanionAI = CompanionAI;
})();
