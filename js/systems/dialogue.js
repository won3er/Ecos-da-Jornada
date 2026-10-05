// Caixa de diálogo com retrato e efeito de máquina de escrever, balões de fala
// durante a exploração e notificações curtas (toasts).
(function () {
  const U = G.U, F = () => G.Font;

  function speaker(who) {
    if (who.startsWith('npc:')) {
      const id = who.slice(4);
      const def = G.NPCs[id] || {};
      return { name: def.name || '?', npc: id, blip: 520 };
    }
    const c = G.Characters[who] || { name: who, blip: 500 };
    return { name: c.name, key: who, blip: c.blip };
  }

  const portraitCache = {};
  function portrait(sp) {
    if (sp.key && G.Sprites.portraits[sp.key]) return G.Sprites.portraits[sp.key];
    if (sp.npc) {
      if (portraitCache[sp.npc]) return portraitCache[sp.npc];
      const look = (G.NPCs[sp.npc] || {}).look || {};
      const spr = G.Sprites.npc(look).img;
      const c = G.Pixel.make(36, 36, (x) => {
        x.fillStyle = '#2e2a3a'; x.fillRect(0, 0, 36, 36);
        x.fillStyle = 'rgba(255,255,255,0.06)'; x.fillRect(0, 0, 36, 12);
        x.drawImage(spr, 0, look.kid ? 6 : 1, spr.width, 17, 0, 2, spr.width * 2, 34);
      });
      portraitCache[sp.npc] = c;
      return c;
    }
    return null;
  }

  class Dialogue {
    constructor() { this.active = false; this.lines = []; this.i = 0; this.shown = 0; this.opts = {}; this.blipT = 0; this.cooldown = 0; }
    start(lines, opts = {}) {
      this.lines = lines.slice();
      this.i = 0; this.shown = 0; this.opts = opts;
      this.active = true;
      this.cooldown = 0.15;
      this.openT = 0;
    }
    get line() { return this.lines[this.i]; }
    update(dt, g) {
      if (!this.active) return;
      this.openT += dt;
      this.cooldown -= dt;
      const ln = this.line;
      if (!ln) { this.close(g); return; }
      const total = ln.text.length;
      if (this.shown < total) {
        const prev = Math.floor(this.shown);
        this.shown = Math.min(total, this.shown + dt * 48);
        this.blipT -= dt;
        if (Math.floor(this.shown) > prev && this.blipT <= 0 && ln.text[prev] !== ' ') {
          this.blipT = 0.05;
          const sp = speaker(ln.who);
          G.Audio.sfx('blip', { pitch: sp.blip + U.rand(-30, 30) });
        }
      }
      if (this.cooldown <= 0 && G.Input.advance()) {
        if (this.shown < total) this.shown = total;
        else {
          this.i++; this.shown = 0;
          G.Audio.sfx('ui');
          if (this.i >= this.lines.length) this.close(g);
        }
        this.cooldown = 0.1;
      }
    }
    close(g) {
      this.active = false;
      G.Input.consume(); // o botão que fechou a conversa não reabre nem ataca
      const then = this.opts.then;
      this.opts = {};
      if (then) then(g);
    }
    draw(ctx, g) {
      if (!this.active || !this.line) return;
      const ln = this.line;
      const sp = speaker(ln.who);
      const W = G.VIEW_W, H = G.VIEW_H;
      const bw = 440, bh = 62, bx = (W - bw) / 2, by = H - bh - 8;
      const k = Math.min(1, this.openT * 8);
      ctx.globalAlpha = k;
      G.UI.panel(ctx, bx, by, bw, bh);
      const por = ln.who === 'sign' ? null : portrait(sp);
      let tx = bx + 10;
      if (por) {
        ctx.fillStyle = '#0e0b16'; ctx.fillRect(bx + 8, by + 8, 40, 40);
        ctx.drawImage(por, bx + 10, by + 10);
        G.UI.frame(ctx, bx + 8, by + 8, 40, 40, '#8a7aa8');
        tx = bx + 56;
      }
      if (sp.name && ln.who !== 'sign') {
        const col = sp.key === 'lirien' ? '#8ae8ff' : sp.key === 'aldren' || sp.key === 'kid' ? '#ffb89a' : sp.key === 'talen' ? '#9ab8ff' : sp.key === 'ysveth' ? '#c8f0ff' : sp.key === 'nyxara' ? '#e0c8ff' : '#f2d98c';
        F().draw(ctx, sp.name, tx, by + 8, col, { shadow: true });
      }
      const text = ln.text.slice(0, Math.floor(this.shown));
      const ty = sp.name && ln.who !== 'sign' ? by + 22 : by + 12;
      F().drawWrapped(ctx, text, tx, ty, bx + bw - tx - 12, '#ece6f6', { shadow: true, lineHeight: 12 });
      if (this.shown >= ln.text.length && Math.floor(g.time * 3) % 2) F().draw(ctx, '▼', bx + bw - 14, by + bh - 12, '#f2d98c');
      ctx.globalAlpha = 1;
    }
  }
  G.Dialogue = Dialogue;

  // ---------------------------------------------------------------- balões e toasts
  G.Bubbles = {
    draw(ctx, g, actor) {
      const b = actor.bubbleText;
      if (!b) return;
      const cam = g.camera;
      const lines = F().wrap(b.text, 130);
      const w = Math.max(...lines.map((l) => F().measure(l))) + 10;
      const h = lines.length * 11 + 6;
      let x = Math.round(actor.x - cam.rx - w / 2), y = Math.round(actor.y - cam.ry - 40 - h);
      x = U.clamp(x, 4, G.VIEW_W - w - 4); y = Math.max(4, y);
      const a = Math.min(1, b.t * 3);
      ctx.globalAlpha = a;
      ctx.fillStyle = '#f4eee0'; ctx.fillRect(x + 1, y, w - 2, h); ctx.fillRect(x, y + 1, w, h - 2);
      ctx.fillStyle = '#2a2236'; ctx.fillRect(x + 1, y + h, w - 2, 1); ctx.fillRect(x + w, y + 1, 1, h - 2);
      const ax = U.clamp(Math.round(actor.x - cam.rx), x + 4, x + w - 6);
      ctx.fillStyle = '#f4eee0'; ctx.fillRect(ax - 2, y + h, 5, 1); ctx.fillRect(ax - 1, y + h + 1, 3, 1); ctx.fillRect(ax, y + h + 2, 1, 1);
      const col = actor.key === 'lirien' ? '#1e4a5a' : actor.key === 'aldren' ? '#6a2a24' : '#2a2236';
      lines.forEach((l, i) => F().draw(ctx, l, x + 5, y + 4 + i * 11, col));
      ctx.globalAlpha = 1;
    },
  };
})();
