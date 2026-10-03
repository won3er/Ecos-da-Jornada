// HUD discreto: vida/mana/fôlego/especial dos dois, magia atual, moedas,
// missão ativa, barra de chefe, avisos e prompts de interação.
(function () {
  const U = G.U, UI = () => G.UI, F = () => G.Font;

  const heads = {};
  function head(key, g) {
    const set = g.spriteFor(key);
    const k = key + (set === G.Sprites[key] ? '' : '_c');
    if (!heads[k]) {
      const spr = set.down[0];
      heads[k] = G.Pixel.make(18, 14, (x) => x.drawImage(spr, 0, key === 'aldren' ? 2 : 1, 18, 14, 0, 0, 18, 14));
    }
    return heads[k];
  }

  const HUD = { ghost: [1, 1], areaT: 0, areaName: '' };

  HUD.showArea = function (name) { HUD.areaName = name; HUD.areaT = 3.5; };

  HUD.update = function (dt, g) {
    HUD.areaT = Math.max(0, HUD.areaT - dt);
    g.players.forEach((p, i) => {
      if (!p) return;
      const k = p.hp / p.maxHp;
      HUD.ghost[i] = HUD.ghost[i] > k ? Math.max(k, HUD.ghost[i] - dt * 0.4) : k;
    });
  };

  function behind(g, x, y, w, h) {
    const cam = g.camera;
    return g.players.some((p) => p && p.x - cam.rx > x - 6 && p.x - cam.rx < x + w + 6 && p.y - cam.ry - 26 < y + h && p.y - cam.ry > y);
  }
  function playerPanel(ctx, g, p, i) {
    const right = i === 1;
    const W = G.VIEW_W;
    const x = right ? W - 126 : 6, y = 6;
    const fade = behind(g, x, y, 120, 52) ? 0.35 : 1;
    ctx.globalAlpha = 0.92 * fade;
    ctx.fillStyle = 'rgba(10,8,18,0.72)'; ctx.fillRect(x, y, 120, 34);
    ctx.globalAlpha = fade;
    UI().frame(ctx, x, y, 120, 34, '#3a3050');
    const hx = right ? x + 98 : x + 3;
    ctx.fillStyle = '#0a0812'; ctx.fillRect(hx - 1, y + 2, 20, 16);
    ctx.drawImage(head(p.key, g), hx, y + 3);
    if (p.isDown) { ctx.fillStyle = 'rgba(80,0,0,0.6)'; ctx.fillRect(hx, y + 3, 18, 14); }
    const bx = right ? x + 4 : x + 25;
    F().draw(ctx, p.name, bx, y + 3, p.color, { shadow: true });
    F().draw(ctx, Math.max(0, Math.ceil(p.hp)) + '/' + p.maxHp, bx + 92, y + 3, '#c8c0d8', { align: 'right' });
    UI().bar(ctx, bx, y + 13, 92, 4, p.hp / p.maxHp, p.hp / p.maxHp < 0.3 && Math.floor(g.time * 4) % 2 ? '#ff6a6a' : '#e84a5a', '#2a1a22', HUD.ghost[i]);
    if (p.kind === 'mage') UI().bar(ctx, bx, y + 20, 92, 3, p.mp / p.maxMp, '#5aa8ff', '#1a2236');
    else UI().bar(ctx, bx, y + 20, 92, 3, p.st / p.maxSt, '#e8c060', '#2a2616');
    // especial
    const full = p.special >= 100;
    UI().bar(ctx, bx, y + 26, 92, 2, p.special / 100, full ? (Math.floor(g.time * 6) % 2 ? '#ffffff' : '#f2d98c') : '#b8963a', '#1e1a12');
    if (full) F().draw(ctx, 'ESPECIAL!', right ? x - 4 : x + 124, y + 25, '#f2d98c', { align: right ? 'right' : 'left', shadow: true });
    ctx.globalAlpha = fade;
    // ícones de habilidade
    const keys = G.Characters[p.key].keys;
    const iy = y + 37;
    if (p.kind === 'mage') {
      const sp = G.Mage.SPELLS[p.spell];
      ctx.fillStyle = 'rgba(10,8,18,0.72)'; ctx.fillRect(x, iy, 120, 14);
      G.Icons.draw(ctx, sp.icon, x + 3, iy + 2);
      F().draw(ctx, sp.name, x + 16, iy + 3, p.spellFlash > 0 ? '#ffffff' : '#c8e8ff', { shadow: true });
      if (p.spellFlash > 0) F().draw(ctx, sp.desc, x, iy + 16, '#c8e8ff', { shadow: true });
      const n = g.unlockedSpells.length;
      if (n > 1) UI().keycap(ctx, keys.swap, x + 106, iy + 1, "#c8c0d8");
    } else {
      ctx.fillStyle = 'rgba(10,8,18,0.72)'; ctx.fillRect(x, iy, 120, 14);
      G.Icons.draw(ctx, 'shield', x + 3, iy + 2);
      F().draw(ctx, g.has('reflexao') ? 'Reflexão' : 'Escudo', x + 16, iy + 3, '#ffd0c0', { shadow: true });
      const cd = p.cooldowns.taunt || 0;
      G.Icons.draw(ctx, 'taunt', x + 92, iy + 2);
      if (cd > 0) { ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x + 92, iy + 2, 10, Math.round(10 * cd / 10)); }
      F().draw(ctx, keys.swap, x + 106, iy + 3, '#8a84a8');
    }
    ctx.globalAlpha = 1;
  }

  HUD.draw = function (ctx, g) {
    if (g.hideHud) return;
    g.players.forEach((p, i) => p && playerPanel(ctx, g, p, i));
    // moedas
    const gx = Math.round(G.VIEW_W / 2);
    ctx.fillStyle = 'rgba(10,8,18,0.6)'; ctx.fillRect(gx - 26, 6, 52, 13);
    G.Icons.draw(ctx, 'coin', gx - 22, 8);
    F().draw(ctx, String(g.gold), gx + 20, 9, '#ffe680', { align: 'right', shadow: true });
    // missão ativa
    const qs = g.quests.active();
    let qy = 60;
    if (qs.length && !g.inMemory) {
      for (const id of qs.slice(0, 2)) {
        const qd = G.Quests[id];
        const ready = g.questState(id) === 'ready';
        const t1 = qd.title, t2 = ready ? 'Entregar a ' + (G.NPCs[qd.giver] ? G.NPCs[qd.giver].name.split(',')[0] : '') : qd.objective(g);
        const w = Math.max(F().measure(t1), F().measure(t2)) + 10;
        ctx.fillStyle = 'rgba(10,8,18,0.55)'; ctx.fillRect(G.VIEW_W - w - 6, qy, w, 24);
        F().draw(ctx, '◆ ' + t1, G.VIEW_W - w - 2, qy + 3, '#f2d98c', { shadow: true });
        F().draw(ctx, t2, G.VIEW_W - w - 2 + 7, qy + 14, ready ? '#8ae8ff' : '#c8c0d8', { shadow: true });
        qy += 27;
      }
    }
    // nome da área
    if (HUD.areaT > 0) {
      const a = Math.min(1, HUD.areaT, (3.5 - HUD.areaT) * 2);
      ctx.globalAlpha = a;
      const y = 44;
      F().draw(ctx, HUD.areaName, G.VIEW_W / 2, y, '#f2d98c', { align: 'center', shadow: true, scale: 1 });
      const w = F().measure(HUD.areaName);
      ctx.fillStyle = '#d9b45a'; ctx.fillRect(Math.round(G.VIEW_W / 2 - w / 2), y + 12, w, 1);
      ctx.globalAlpha = 1;
    }
    // chefe
    const b = g.bossBar;
    if (b && !b.dead) {
      const w = 260, x = Math.round((G.VIEW_W - w) / 2), y = G.VIEW_H - 24;
      ctx.fillStyle = 'rgba(10,8,18,0.75)'; ctx.fillRect(x - 6, y - 13, w + 12, 22);
      F().draw(ctx, b.name, G.VIEW_W / 2, y - 10, '#f2d98c', { align: 'center', shadow: true });
      UI().bar(ctx, x, y + 1, w, 5, b.hp / b.maxHp, b.phase === 3 || b.phase2 ? '#ff4a6a' : '#c84a8a', '#2a1424');
      if (b.shield > 0 && b.dazedT <= 0) {
        for (let i = 0; i < Math.ceil(b.shield); i++) { ctx.fillStyle = '#c8a8ff'; ctx.fillRect(x + w - 8 - i * 8, y - 4, 6, 3); }
      }
      // marcas de fase
      if (b.type === 'boss') for (const k of [0.33, 0.66]) { ctx.fillStyle = '#0a0812'; ctx.fillRect(x + Math.round(w * k), y + 1, 1, 5); }
    }
    HUD.drawToasts(ctx, g);
    // modo solo
    if (G.Input.solo && !g.inCutscene()) {
      const who = g.players[G.Input.soloActive];
      F().draw(ctx, `Modo solo: controlando ${who.name} — Tab troca`, 6, G.VIEW_H - 12, '#8a84a8', { shadow: true });
    }
  };

  HUD.drawToasts = function (ctx, g) {
    let ty = 24;
    for (const t of g.toasts) {
      const a = Math.min(1, t.t * 2, (t.max - t.t) * 4 + 0.2);
      ctx.globalAlpha = a;
      const lines = F().wrap(t.text, 300);
      const w = Math.max(...lines.map((l) => F().measure(l))) + 14;
      const h = lines.length * 11 + 6;
      ctx.fillStyle = 'rgba(14,10,24,0.88)'; ctx.fillRect(Math.round(G.VIEW_W / 2 - w / 2), ty, w, h);
      ctx.fillStyle = '#d9b45a'; ctx.fillRect(Math.round(G.VIEW_W / 2 - w / 2), ty, w, 1);
      lines.forEach((l, i) => F().draw(ctx, l, G.VIEW_W / 2, ty + 4 + i * 11, '#ece6f6', { align: 'center', shadow: true }));
      ctx.globalAlpha = 1;
      ty += h + 3;
    }
  };

  // prompts de interação no mundo (após iluminação)
  HUD.drawPrompts = function (ctx, g) {
    if (g.inputLocked()) return;
    g.players.forEach((p, i) => {
      if (!p || p.isDown || p.state !== 'normal') return;
      if (G.Input.solo && G.Input.soloActive !== i) return;
      const t = p.findInteract(g);
      if (!t) return;
      const keys = G.Characters[p.key].keys;
      const label = t.prompt(p);
      const ip = t.interactPoint || t;
      const x = Math.round(ip.x - g.camera.rx), y = Math.round(ip.y - g.camera.ry - (t.hh || 20) - 14 - (i === 1 && g.players[0] && g.players[0].findInteract(g) === t ? 12 : 0));
      const w = UI().keycap(ctx, keys.act, x - Math.round((F().measure(label) + 14) / 2), y, p.color);
      F().draw(ctx, label, x - Math.round((F().measure(label) + 14) / 2) + w + 3, y + 2, '#ffffff', { shadow: true, outline: true });
    });
  };

  G.HUD = HUD;
})();
