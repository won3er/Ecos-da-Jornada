// NPCs: aparência por paleta, falas condicionais ao progresso, lojas e missões.
(function () {
  const U = G.U, P = G.Pixel;

  class NPC extends G.Obj {
    constructor(o) {
      super(Object.assign({ solid: true, w: 10, h: 6, hh: 22 }, o));
      this.npcId = o.npc;
      const def = G.NPCs[o.npc] || { name: '???', look: {} };
      this.def = def;
      this.name = def.name;
      this.sprite = G.Sprites.npc(def.look || {});
      this.home = { x: this.x, y: this.y };
      this.facing = 1;
      this.t = Math.random() * 5;
      this.wanderT = U.rand(2, 5);
      this.target = null;
      this.wander = o.wander !== undefined ? o.wander : !!def.wander;
      this.talking = false;
    }
    canInteract() { return true; }
    prompt() { return 'Falar'; }
    interact(p, g) {
      const fn = G.NPCDialogue[this.npcId];
      if (!fn) return;
      this.facing = p.x < this.x ? -1 : 1;
      const res = fn(g, p, this);
      if (!res) return;
      if (Array.isArray(res)) g.dialogue.start(res, { npc: this });
      else if (res.lines) g.dialogue.start(res.lines, { npc: this, then: res.then });
    }
    marker(g) {
      const q = G.NPCDialogue.marker && G.NPCDialogue.marker(g, this.npcId);
      return q || null;
    }
    update(dt, g) {
      this.t += dt;
      if (this.justThawed) { this.justThawed = false; this.say && 0; g.particles.text(this.x, this.y - 30, 'Brrr...!', '#c8f0ff'); }
      // olha para o jogador mais próximo
      let near = null, nd = 50;
      for (const p of g.players) if (p) { const d = U.dist(p.x, p.y, this.x, this.y); if (d < nd) { nd = d; near = p; } }
      if (near) { this.facing = near.x < this.x ? -1 : 1; this.target = null; return; }
      if (!this.wander) return;
      this.wanderT -= dt;
      if (this.wanderT <= 0) {
        this.wanderT = U.rand(2, 5);
        this.target = Math.random() < 0.6 ? { x: this.home.x + U.rand(-24, 24), y: this.home.y + U.rand(-12, 12) } : null;
      }
      if (this.target) {
        const dx = this.target.x - this.x, dy = this.target.y - this.y, d = Math.hypot(dx, dy);
        if (d < 2) this.target = null;
        else {
          const r = G.Physics.move(g, this, (dx / d) * 22 * dt, (dy / d) * 22 * dt);
          if (r.hitX || r.hitY) this.target = null;
          if (Math.abs(dx) > 1) this.facing = dx < 0 ? -1 : 1;
        }
      }
    }
    draw(ctx, cam, g) {
      const img = this.facing < 0 ? this.sprite.flip : this.sprite.img;
      const moving = !!this.target;
      const bob = moving ? (Math.floor(this.t * 8) % 2) : (Math.floor(this.t * 1.5) % 2 === 0 ? 0 : 0);
      P.shadow(ctx, this.x - cam.rx, this.y - cam.ry, 12, 0.3);
      const breath = Math.floor(this.t * 1.2) % 2;
      const ghost = this.def.look && this.def.look.ghost;
      if (ghost) { ctx.globalAlpha = 0.62 + Math.sin(this.t * 2) * 0.08; g.lighting.add(this.x, this.y - 12, 36, 0.6, '#9ab8ff', 0.18); if (Math.random() < 0.15) g.particles.add({ x: this.x + U.rand(-5, 5), y: this.y - U.rand(4, 20), vy: -10, life: 0.8, color: '#c8d8ff', glow: true }); }
      ctx.drawImage(img, Math.round(this.x - img.width / 2 - cam.rx), Math.round(this.y + 1 - img.height - cam.ry - bob - (ghost ? Math.round(Math.sin(this.t * 2) * 1.5) + 1 : 0)), img.width, img.height + (moving ? 0 : 0));
      ctx.globalAlpha = 1;
      if (!moving && breath) { /* respiração sutil já implícita */ }
      const m = this.marker(g);
      if (m) {
        const y = Math.round(this.y - img.height - 8 - cam.ry + Math.sin(g.time * 4) * 1.5);
        const col = m === '!' ? '#ffd84a' : m === '?' ? '#8ae8ff' : '#ffffff';
        G.Font.draw(ctx, m, Math.round(this.x - cam.rx), y, col, { align: 'center', shadow: true, outline: true });
      }
    }
  }
  G.ObjectTypes.npc = NPC;
  G.NPC = NPC;
})();
