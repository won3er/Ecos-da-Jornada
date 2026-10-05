// Menus: tela inicial, pausa, inventário, habilidades, diário, configurações,
// controles, loja, ferreiro, derrota e fim de capítulo.
(function () {
  const U = G.U, F = () => G.Font, UI = () => G.UI;
  const M = () => G.Input.menu;
  const W = () => G.VIEW_W, H = () => G.VIEW_H;

  // ================================================================ Gerenciador
  class UIManager {
    constructor() { this.stack = []; }
    get open() { return this.stack.length > 0; }
    get top() { return this.stack[this.stack.length - 1]; }
    push(m) { this.stack.push(m); if (m.onOpen) m.onOpen(); }
    pop() { const m = this.stack.pop(); if (m && m.onClose) m.onClose(); G.Input.consume(); return m; }
    clear() { this.stack.length = 0; }
    update(dt, g) { const t = this.top; if (t) t.update(dt, g); }
    draw(ctx, g) { for (const m of this.stack) if (m.draw) m.draw(ctx, g); }

    openPause(g) { this.push(new PauseMenu()); G.Audio.sfx('ui'); }
    openSkills(g, fromStone) { this.push(new SkillsMenu(fromStone)); }
    openShop(g, stock, title) { this.push(new ShopMenu(stock, title)); }
    openSmith(g, title) { this.push(new SmithMenu(title)); }
    openWaystone(g, stone) { this.push(new WaystoneMenu(stone)); }
    openTravel(g) { this.push(new TravelMenu()); }
    openInventory(g) { this.push(new InventoryMenu()); }
    openJournal(g) { this.push(new JournalMenu()); }
    openSettings(g) { this.push(new SettingsMenu()); }
    openControls(g) { this.push(new ControlsMenu()); }
    confirm(text, onYes) { this.push(new ConfirmBox(text, onYes)); }
    message(text) { this.push(new MessageBox(text)); }
  }
  G.UIManager = UIManager;

  function dim(ctx, a = 0.6) { ctx.fillStyle = `rgba(6,4,12,${a})`; ctx.fillRect(0, 0, W(), H()); }
  function nav(sel, n) {
    if (M().up) { G.Audio.sfx('ui'); return (sel - 1 + n) % n; }
    if (M().down) { G.Audio.sfx('ui'); return (sel + 1) % n; }
    return sel;
  }
  function back() { if (M().back || M().pause) { G.Audio.sfx('uiBack'); return true; } return false; }

  // ================================================================ Caixas simples
  class ConfirmBox {
    constructor(text, onYes) { this.text = text; this.onYes = onYes; this.sel = 1; }
    update(dt, g) {
      if (M().left || M().right || M().up || M().down) { this.sel = 1 - this.sel; G.Audio.sfx('ui'); }
      if (M().confirm) { g.ui.pop(); if (this.sel === 0) { G.Audio.sfx('uiOk'); this.onYes(g); } else G.Audio.sfx('uiBack'); }
      else if (back()) g.ui.pop();
    }
    draw(ctx, g) {
      dim(ctx, 0.5);
      const w = 280, h = 70, x = (W() - w) / 2, y = (H() - h) / 2;
      UI().panel(ctx, x, y, w, h);
      F().drawWrapped(ctx, this.text, x + 12, y + 12, w - 24, '#ece6f6', { shadow: true });
      ['Sim', 'Não'].forEach((o, i) => {
        const bx = x + w / 2 + (i ? 30 : -30);
        if (i === this.sel) { ctx.fillStyle = UI().COL.sel; ctx.fillRect(Math.round(bx - 22), y + h - 22, 44, 14); }
        F().draw(ctx, o, bx, y + h - 19, i === this.sel ? '#ffffff' : '#a8a0c0', { align: 'center', shadow: true });
      });
    }
  }
  class MessageBox {
    constructor(text) { this.text = text; }
    update(dt, g) { if (M().confirm || back()) g.ui.pop(); }
    draw(ctx) {
      dim(ctx, 0.5);
      const w = 280, h = 60, x = (W() - w) / 2, y = (H() - h) / 2;
      UI().panel(ctx, x, y, w, h);
      F().drawWrapped(ctx, this.text, x + 12, y + 14, w - 24, '#ece6f6', { shadow: true });
    }
  }

  // ================================================================ Pausa
  class PauseMenu {
    constructor() { this.sel = 0; this.opts = ['Continuar', 'Inventário', 'Habilidades', 'Diário', 'Configurações', 'Controles', 'Voltar ao menu']; }
    update(dt, g) {
      this.sel = nav(this.sel, this.opts.length);
      if (M().confirm) {
        G.Audio.sfx('uiOk');
        switch (this.sel) {
          case 0: g.ui.pop(); break;
          case 1: g.ui.openInventory(g); break;
          case 2: g.ui.openSkills(g); break;
          case 3: g.ui.openJournal(g); break;
          case 4: g.ui.openSettings(g); break;
          case 5: g.ui.openControls(g); break;
          case 6: g.ui.confirm('Voltar ao menu? O progresso desde a última Pedra de Retorno será perdido.', (gg) => gg.toTitle()); break;
        }
      } else if (back()) g.ui.pop();
    }
    draw(ctx, g) {
      dim(ctx, 0.55);
      const w = 170, h = 136, x = (W() - w) / 2, y = (H() - h) / 2 - 6;
      UI().panel(ctx, x, y, w, h);
      UI().title(ctx, 'PAUSA', W() / 2, y + 10);
      UI().options(ctx, this.opts, this.sel, W() / 2, y + 30, g, { center: true, w: 140 });
      F().draw(ctx, g.level ? (g.level.def.title || '') : '', W() / 2, y + h + 6, '#8a84a8', { align: 'center', shadow: true });
      F().draw(ctx, 'Tempo: ' + U.formatTime(g.playTime), W() / 2, y + h + 18, '#8a84a8', { align: 'center', shadow: true });
    }
  }

  // ================================================================ Inventário
  const CATS = [['consumivel', 'Consumíveis'], ['equipamento', 'Equipamento'], ['artefato', 'Artefatos'], ['colecionavel', 'Coleção'], ['missao', 'Missão']];
  class InventoryMenu {
    constructor() { this.tab = 0; this.sel = 0; this.picker = null; }
    list(g) { return g.inv.byCategory(CATS[this.tab][0]); }
    update(dt, g) {
      if (this.picker) {
        if (M().left || M().right || M().up || M().down) { this.picker.sel = 1 - this.picker.sel; G.Audio.sfx('ui'); }
        if (M().confirm) {
          const who = this.picker.sel === 0 ? 'lirien' : 'aldren';
          this.picker.fn(who);
          this.picker = null;
        } else if (back()) this.picker = null;
        return;
      }
      if (M().left) { this.tab = (this.tab + CATS.length - 1) % CATS.length; this.sel = 0; G.Audio.sfx('ui'); }
      if (M().right) { this.tab = (this.tab + 1) % CATS.length; this.sel = 0; G.Audio.sfx('ui'); }
      const items = this.list(g);
      if (items.length) this.sel = nav(Math.min(this.sel, items.length - 1), items.length);
      if (M().confirm && items.length) {
        const it = items[this.sel];
        if (it.def.cat === 'consumivel' && it.def.use) {
          this.picker = { sel: 0, title: 'Usar em quem?', fn: (who) => {
            const p = g.players[who === 'lirien' ? 0 : 1];
            if (g.inv.use(it.id, p, g)) G.Audio.sfx('heal'); else G.Audio.sfx('immune');
          } };
        } else if (it.def.cat === 'equipamento') {
          if (g.inv.equippedBy(it.id)) { g.inv.unequip(it.id); G.Audio.sfx('uiBack'); g.refreshStats(); }
          else if (it.def.who) { g.inv.equipItem(it.id, it.def.who); G.Audio.sfx('uiOk'); g.refreshStats(); }
          else this.picker = { sel: 0, title: 'Equipar em quem?', fn: (who) => { g.inv.equipItem(it.id, who); G.Audio.sfx('uiOk'); g.refreshStats(); } };
        }
      } else if (back()) g.ui.pop();
    }
    draw(ctx, g) {
      dim(ctx, 0.6);
      const x = 30, y = 24, w = W() - 60, h = H() - 48;
      UI().panel(ctx, x, y, w, h);
      UI().title(ctx, 'INVENTÁRIO', W() / 2, y + 8);
      // abas
      let tx = x + 10;
      CATS.forEach(([, name], i) => {
        const tw = F().measure(name) + 10;
        if (i === this.tab) { ctx.fillStyle = UI().COL.sel; ctx.fillRect(tx - 2, y + 22, tw, 13); ctx.fillStyle = UI().COL.gold; ctx.fillRect(tx - 2, y + 34, tw, 1); }
        F().draw(ctx, name, tx + 3, y + 25, i === this.tab ? '#ffffff' : '#8a84a8', { shadow: true });
        tx += tw + 4;
      });
      F().draw(ctx, '◀ ▶', x + w - 10, y + 25, '#5a5470', { align: 'right' });
      const items = this.list(g);
      const ly = y + 44;
      if (!items.length) F().draw(ctx, 'Nada aqui ainda.', x + 16, ly, '#5a5470', { shadow: true });
      items.forEach((it, i) => {
        const yy = ly + i * 15;
        if (i === this.sel) { ctx.fillStyle = UI().COL.sel; ctx.fillRect(x + 8, yy - 3, 186, 14); }
        G.Icons.draw(ctx, it.def.icon, x + 12, yy - 1);
        F().draw(ctx, it.def.name, x + 26, yy, i === this.sel ? '#fff' : '#ece6f6', { shadow: true });
        F().draw(ctx, 'x' + it.qty, x + 190, yy, '#a8a0c0', { align: 'right' });
        const eq = g.inv.equippedBy(it.id);
        if (eq) F().draw(ctx, eq === 'lirien' ? 'L' : 'A', x + 170, yy, eq === 'lirien' ? '#8ae8ff' : '#ff8a6a');
      });
      // descrição
      const dx = x + 210, dw = w - 220;
      ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(dx, ly - 4, dw, h - 56);
      const it = items[this.sel];
      if (it) {
        F().draw(ctx, it.def.name, dx + 8, ly + 2, '#f2d98c', { shadow: true });
        F().drawWrapped(ctx, it.def.desc, dx + 8, ly + 18, dw - 16, '#c8c0d8', { shadow: true, lineHeight: 12 });
        let hint = '';
        if (it.def.cat === 'consumivel' && it.def.use) hint = 'Confirmar: usar';
        if (it.def.cat === 'consumivel' && !it.def.use) hint = 'Usado automaticamente.';
        if (it.def.cat === 'equipamento') hint = g.inv.equippedBy(it.id) ? 'Confirmar: desequipar' : 'Confirmar: equipar';
        if (hint) F().draw(ctx, hint, dx + 8, y + h - 18, '#8a84a8', { shadow: true });
      }
      // equipamento atual
      F().draw(ctx, 'Espada Nv ' + (g.inv.weapon.sword + 1) + '   Cajado Nv ' + (g.inv.weapon.staff + 1), x + 12, y + h - 16, '#8a84a8', { shadow: true });
      if (this.picker) {
        const pw = 160, ph = 50, px = (W() - pw) / 2, py = (H() - ph) / 2;
        UI().panel(ctx, px, py, pw, ph);
        F().draw(ctx, this.picker.title, W() / 2, py + 8, '#f2d98c', { align: 'center', shadow: true });
        ['Lirien', 'Aldren'].forEach((n, i) => {
          const bx = W() / 2 + (i ? 36 : -36);
          if (i === this.picker.sel) { ctx.fillStyle = UI().COL.sel; ctx.fillRect(Math.round(bx - 28), py + 26, 56, 14); }
          F().draw(ctx, n, bx, py + 29, i ? '#ff8a6a' : '#8ae8ff', { align: 'center', shadow: true });
        });
      }
    }
  }

  // ================================================================ Habilidades
  class SkillsMenu {
    constructor(fromStone) { this.col = 0; this.sel = 0; this.fromStone = fromStone; }
    update(dt, g) {
      const keys = ['lirien', 'aldren'];
      if (M().left || M().right) { this.col = 1 - this.col; this.sel = Math.min(this.sel, G.Skills[keys[this.col]].length - 1); G.Audio.sfx('ui'); }
      const list = G.Skills[keys[this.col]];
      this.sel = nav(this.sel, list.length);
      if (M().confirm) {
        const sk = list[this.sel];
        if (g.prog.learn(keys[this.col], sk, g)) {
          G.Audio.sfx('levelup');
          g.refreshStats();
          g.particles.burst(g.players[this.col].x, g.players[this.col].y - 12, 20, { colors: ['#f2d98c', '#ffffff'], speed: 50, life: 0.8, glow: true });
        } else G.Audio.sfx('immune');
      } else if (back()) g.ui.pop();
    }
    draw(ctx, g) {
      dim(ctx, 0.6);
      const x = 18, y = 8, w = W() - 36, h = H() - 16;
      UI().panel(ctx, x, y, w, h);
      UI().title(ctx, this.fromStone ? 'MEDITAÇÃO — HABILIDADES' : 'HABILIDADES', W() / 2, y + 7);
      F().draw(ctx, 'Pontos de Lembrança: ' + g.prog.points, W() / 2, y + 20, g.prog.points ? '#8ae8ff' : '#8a84a8', { align: 'center', shadow: true });
      const keys = ['lirien', 'aldren'];
      const ROMAN = ['', 'I', 'II', 'III'];
      keys.forEach((k, c) => {
        const cx = x + 8 + c * (w / 2 - 2);
        const cw = w / 2 - 12;
        F().draw(ctx, G.Characters[k].name, cx + 4, y + 32, G.Characters[k].color, { shadow: true });
        G.Skills[k].forEach((sk, i) => {
          const yy = y + 45 + i * 14;
          const learned = g.prog.has(sk.id);
          const can = g.prog.canLearn(k, sk, g);
          const locked = sk.ch && g.chapter < sk.ch;
          const selected = c === this.col && i === this.sel;
          ctx.fillStyle = selected ? UI().COL.sel : 'rgba(255,255,255,0.03)'; ctx.fillRect(cx, yy - 3, cw, 13);
          if (selected) UI().frame(ctx, cx, yy - 3, cw, 13, '#d9b45a');
          ctx.globalAlpha = locked ? 0.45 : 1;
          G.Icons.draw(ctx, sk.icon, cx + 3, yy - 2);
          F().draw(ctx, locked ? '???' : sk.name, cx + 16, yy, learned ? '#7aff8a' : '#ece6f6', { shadow: true });
          ctx.globalAlpha = 1;
          F().draw(ctx, learned ? 'Aprendida' : locked ? 'Cap. ' + ROMAN[sk.ch] : sk.cost + ' pt' + (sk.cost > 1 ? 's' : ''), cx + cw - 4, yy, learned ? '#7aff8a' : can ? '#8ae8ff' : '#6a6480', { align: 'right' });
        });
      });
      const list = G.Skills[keys[this.col]];
      const sk = list[this.sel];
      const dy = y + 45 + list.length * 14 + 1;
      ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(x + 8, dy, w - 16, 28);
      const locked = sk.ch && g.chapter < sk.ch;
      F().draw(ctx, locked ? 'Habilidade selada' : sk.name, x + 14, dy + 3, '#f2d98c', { shadow: true });
      F().drawWrapped(ctx, locked ? 'Desperta no Capítulo ' + ROMAN[sk.ch] + '.' : sk.desc, x + 14, dy + 15, w - 40, '#c8c0d8', { shadow: true });
      if (sk.req && !g.prog.has(sk.req) && !g.prog.has(sk.id)) {
        const req = list.find((s2) => s2.id === sk.req);
        F().draw(ctx, 'Requer: ' + req.name, x + w - 14, dy + 3, '#c86a7a', { align: 'right', shadow: true });
      }
      const extra = [];
      if (g.unlockedSpells.includes('bridge')) extra.push('Ponte');
      if (g.unlockedSpells.includes('fire')) extra.push('Chama');
      if (g.unlockedSpells.includes('stasis')) extra.push('Estase');
      if (g.has('reflexao')) extra.push('Reflexão');
      if (g.has('arremesso')) extra.push('Arremesso');
      if (g.has('salto')) extra.push('Salto');
      F().draw(ctx, extra.length ? 'Da história: ' + extra.join(' • ') : 'Ganhe pontos em memórias, missões e chefes.', W() / 2, y + h - 12, '#8a84a8', { align: 'center', shadow: true });
    }
  }

  // ================================================================ Pedra de Retorno (meditar / viajar)
  class WaystoneMenu {
    constructor(stone) { this.stone = stone; this.sel = 0; }
    opts(g) {
      const canTravel = !g.inMemory && !g.bossBar && Object.keys(g.waystones).length > 1;
      return [
        { label: 'Meditar (habilidades)', fn: () => { g.ui.pop(); g.ui.openSkills(g, true); } },
        { label: 'Viajar para outra Pedra', disabled: !canTravel, fn: () => { g.ui.pop(); g.ui.openTravel(g); } },
        { label: 'Descansar e sair', fn: () => g.ui.pop() },
      ];
    }
    update(dt, g) {
      const o = this.opts(g);
      this.sel = nav(this.sel, o.length);
      if (M().confirm) {
        const it = o[this.sel];
        if (it.disabled) { G.Audio.sfx('immune'); g.toast(Object.keys(g.waystones).length > 1 ? 'Não dá para viajar agora.' : 'Ative outras Pedras de Retorno para viajar entre elas.'); return; }
        G.Audio.sfx('uiOk'); it.fn();
      } else if (back()) g.ui.pop();
    }
    draw(ctx, g) {
      dim(ctx, 0.5);
      const w = 200, h = 78, x = (W() - w) / 2, y = (H() - h) / 2;
      UI().panel(ctx, x, y, w, h);
      UI().title(ctx, 'PEDRA DE RETORNO', W() / 2, y + 8);
      UI().options(ctx, this.opts(g), this.sel, W() / 2, y + 26, g, { center: true, w: 180 });
      F().draw(ctx, 'Progresso salvo. Vida e mana restauradas.', W() / 2, y + h + 4, '#8a84a8', { align: 'center', shadow: true });
    }
  }
  class TravelMenu {
    constructor() { this.sel = 0; this.scroll = 0; }
    list(g) {
      return Object.entries(g.waystones).map(([id, e]) => Object.assign({ id }, e)).sort((a, b) => (a.ch - b.ch) || (a.order - b.order));
    }
    update(dt, g) {
      const l = this.list(g);
      const n = l.length + 1;
      this.sel = nav(this.sel, n);
      if (this.sel - this.scroll > 8) this.scroll = this.sel - 8;
      if (this.sel < this.scroll) this.scroll = this.sel;
      if (M().confirm) {
        if (this.sel === l.length) { g.ui.pop(); return; }
        const e = l[this.sel];
        const here = g.checkpoint && g.checkpoint.id === e.id;
        if (here) { G.Audio.sfx('immune'); g.toast('Vocês já estão aqui.'); return; }
        G.Audio.sfx('checkpoint');
        g.ui.clear();
        g.changeArea(e.area, null, { pos: { x: e.x, y: e.y } });
      } else if (back()) g.ui.pop();
    }
    draw(ctx, g) {
      dim(ctx, 0.6);
      const w = 260, h = 174, x = (W() - w) / 2, y = (H() - h) / 2;
      UI().panel(ctx, x, y, w, h);
      UI().title(ctx, 'VIAGEM RÁPIDA', W() / 2, y + 8);
      const l = this.list(g);
      const ROMAN = ['', 'I', 'II', 'III', 'III'];
      const rows = l.map((e) => ({ label: e.name, ch: e.ch, id: e.id })).concat([{ label: 'Voltar' }]);
      rows.slice(this.scroll, this.scroll + 9).forEach((r, k) => {
        const i = k + this.scroll, yy = y + 26 + k * 15;
        if (i === this.sel) { ctx.fillStyle = UI().COL.sel; ctx.fillRect(x + 8, yy - 3, w - 16, 14); }
        const here = g.checkpoint && g.checkpoint.id === r.id;
        F().draw(ctx, r.label + (here ? '  (aqui)' : ''), x + 16, yy, i === this.sel ? '#fff' : here ? '#8a84a8' : '#ece6f6', { shadow: true });
        if (r.ch) F().draw(ctx, 'Cap. ' + ROMAN[r.ch], x + w - 16, yy, '#8a84a8', { align: 'right' });
      });
    }
  }

  // ================================================================ Diário (missões, memórias, bestiário, conclusão)
  class JournalMenu {
    constructor() { this.tab = 0; this.sel = 0; this.scroll = 0; }
    update(dt, g) {
      const NT = 4;
      if (M().left) { this.tab = (this.tab + NT - 1) % NT; this.sel = 0; this.scroll = 0; G.Audio.sfx('ui'); }
      if (M().right) { this.tab = (this.tab + 1) % NT; this.sel = 0; this.scroll = 0; G.Audio.sfx('ui'); }
      if (this.tab === 0) { if (M().down) this.scroll++; if (M().up) this.scroll = Math.max(0, this.scroll - 1); }
      if (this.tab === 1) this.sel = nav(this.sel, Object.keys(G.MemoryDefs).length);
      if (this.tab === 2) this.sel = nav(this.sel, Object.keys(G.BestiaryInfo).length);
      if (back() || M().confirm) g.ui.pop();
    }
    draw(ctx, g) {
      dim(ctx, 0.6);
      const x = 22, y = 14, w = W() - 44, h = H() - 28;
      UI().panel(ctx, x, y, w, h);
      UI().title(ctx, 'DIÁRIO', W() / 2, y + 8);
      const tabs = ['Missões', 'Memórias', 'Bestiário', 'Conclusão'];
      let tx = x + 10;
      tabs.forEach((name, i) => {
        const tw = F().measure(name) + 10;
        if (i === this.tab) { ctx.fillStyle = UI().COL.sel; ctx.fillRect(tx - 2, y + 22, tw, 13); ctx.fillStyle = UI().COL.gold; ctx.fillRect(tx - 2, y + 34, tw, 1); }
        F().draw(ctx, name, tx + 3, y + 25, i === this.tab ? '#fff' : '#8a84a8', { shadow: true });
        tx += tw + 4;
      });
      F().draw(ctx, '◀ ▶', x + w - 10, y + 25, '#5a5470', { align: 'right' });
      const ly = y + 44;
      ctx.save(); ctx.beginPath(); ctx.rect(x + 2, ly - 4, w - 4, h - 48); ctx.clip();
      if (this.tab === 0) {
        let yy = ly - this.scroll * 12;
        const ids = Object.keys(G.Quests).filter((id) => g.questState(id) !== 'inactive');
        ids.sort((a, b) => (g.questState(a) === 'done') - (g.questState(b) === 'done'));
        for (const id of ids) {
          const q = G.Quests[id]; const s2 = g.questState(id);
          const col = s2 === 'done' ? '#7aff8a' : '#f2d98c';
          F().draw(ctx, (s2 === 'done' ? '✓ ' : '◆ ') + q.title, x + 12, yy, col, { shadow: true });
          yy += 12;
          yy += F().drawWrapped(ctx, s2 === 'done' ? 'Concluída.' : q.desc + ' — ' + q.objective(g), x + 22, yy, w - 40, '#c8c0d8', { shadow: true, lineHeight: 11 }) * 11 + 5;
        }
        if (!ids.length) F().draw(ctx, 'Nenhuma missão. Converse com as pessoas pelo caminho.', x + 12, yy, '#6a6480', { shadow: true });
        else if (yy > y + h) F().draw(ctx, '▼', x + w - 14, y + h - 16, '#8a84a8');
      } else if (this.tab === 1) {
        const ids = Object.keys(G.MemoryDefs);
        const top = Math.max(0, Math.min(this.sel - 6, ids.length - 13));
        ids.slice(top, top + 13).forEach((id, k) => {
          const i = k + top;
          const seen = g.memories.has(id);
          const yy = ly + k * 13;
          if (i === this.sel) { ctx.fillStyle = UI().COL.sel; ctx.fillRect(x + 8, yy - 3, 150, 12); }
          F().draw(ctx, seen ? G.MemoryDefs[id].title : '???', x + 14, yy, seen ? '#f2d98c' : '#5a5470', { shadow: true });
        });
        const id = ids[this.sel], md = G.MemoryDefs[id];
        const dx = x + 168;
        if (g.memories.has(id)) {
          F().draw(ctx, md.when, dx, ly, '#8a84a8', { shadow: true });
          F().drawWrapped(ctx, md.journal, dx, ly + 14, w - 186, '#ece6f6', { shadow: true, lineHeight: 12 });
        } else F().drawWrapped(ctx, 'Uma lembrança ainda não despertada. Procure objetos que brilham com luz dourada.', dx, ly, w - 186, '#6a6480', { shadow: true, lineHeight: 12 });
      } else if (this.tab === 2) {
        const ids = Object.keys(G.BestiaryInfo);
        const top = Math.max(0, Math.min(this.sel - 6, ids.length - 13));
        ids.slice(top, top + 13).forEach((id, k) => {
          const i = k + top;
          const n = g.bestiary[id] || 0;
          const yy = ly + k * 13;
          if (i === this.sel) { ctx.fillStyle = UI().COL.sel; ctx.fillRect(x + 8, yy - 3, 160, 12); }
          F().draw(ctx, n ? G.BestiaryInfo[id].name : '???', x + 14, yy, n ? '#ece6f6' : '#5a5470', { shadow: true });
          if (n) F().draw(ctx, String(n), x + 164, yy, '#8a84a8', { align: 'right' });
        });
        const b = G.BestiaryInfo[ids[this.sel]];
        const dx = x + 178;
        if (g.bestiary[ids[this.sel]]) {
          F().draw(ctx, b.name, dx, ly, '#f2d98c', { shadow: true });
          const n2 = F().drawWrapped(ctx, b.desc, dx, ly + 14, w - 196, '#ece6f6', { shadow: true, lineHeight: 12 });
          F().draw(ctx, 'Juntos:', dx, ly + 20 + n2 * 12, '#8ae8ff', { shadow: true });
          F().drawWrapped(ctx, b.tip, dx, ly + 32 + n2 * 12, w - 196, '#c8c0d8', { shadow: true, lineHeight: 12 });
        } else F().drawWrapped(ctx, 'Derrote esta criatura para registrá-la.', dx, ly, w - 196, '#6a6480', { shadow: true, lineHeight: 12 });
      } else {
        const c = G.completion(g);
        c.rows.forEach(([a, b, t], i) => {
          F().draw(ctx, a, x + 20, ly + i * 13, '#c8c0d8', { shadow: true });
          F().draw(ctx, b + '/' + t, x + w - 20, ly + i * 13, b >= t ? '#7aff8a' : '#f2d98c', { align: 'right', shadow: true });
        });
        const yy = ly + c.rows.length * 13 + 4;
        F().draw(ctx, 'Combos: ' + (g.stats.combos || 0) + '   Inimigos: ' + (g.stats.kills || 0) + '   Revives: ' + (g.stats.revives || 0) + '   Tempo: ' + U.formatTime(g.playTime), W() / 2, yy, '#8a84a8', { align: 'center', shadow: true });
        F().draw(ctx, 'JORNADA ' + c.pct + '%', W() / 2, yy + 14, c.pct >= 100 ? '#7aff8a' : '#f2d98c', { align: 'center', shadow: true, scale: 1 });
        UI().bar(ctx, W() / 2 - 80, yy + 28, 160, 4, c.pct / 100, '#f2d98c', '#2a2416');
      }
      ctx.restore();
    }
  }

  // ================================================================ Configurações
  class SettingsMenu {
    constructor() { this.sel = 0; }
    items(g) {
      const s = g.settings;
      return [
        { label: 'Música', value: Math.round(s.music * 10) + '/10', adj: (d) => { s.music = U.clamp(Math.round((s.music + d * 0.1) * 10) / 10, 0, 1); G.Audio.setVolume('music', s.music); } },
        { label: 'Efeitos', value: Math.round(s.sfx * 10) + '/10', adj: (d) => { s.sfx = U.clamp(Math.round((s.sfx + d * 0.1) * 10) / 10, 0, 1); G.Audio.setVolume('sfx', s.sfx); G.Audio.sfx('ui'); } },
        { label: 'Tremor de tela', value: s.shake ? 'Sim' : 'Não', adj: () => { s.shake = !s.shake; } },
        { label: 'Modo solo (Tab troca)', value: s.solo ? 'Sim' : 'Não', adj: () => { s.solo = !s.solo; G.Input.solo = s.solo; } },
        { label: 'Modo assistido', value: s.assist ? 'Sim' : 'Não', adj: () => { s.assist = !s.assist; } },
        { label: 'Mostrar FPS', value: s.showFps ? 'Sim' : 'Não', adj: () => { s.showFps = !s.showFps; } },
        { label: 'Tela cheia', value: document.fullscreenElement ? 'Sim' : 'Não', adj: () => { toggleFullscreen(); } },
        { label: 'Voltar', value: '', back: true },
      ];
    }
    update(dt, g) {
      const it = this.items(g);
      this.sel = nav(this.sel, it.length);
      const cur = it[this.sel];
      if (M().left && cur.adj) { cur.adj(-1); G.Audio.sfx('ui'); }
      if (M().right && cur.adj) { cur.adj(1); G.Audio.sfx('ui'); }
      if (M().confirm) { if (cur.back) { G.Save.saveSettings(g.settings); g.ui.pop(); } else if (cur.adj) { cur.adj(1); G.Audio.sfx('ui'); } }
      if (back()) { G.Save.saveSettings(g.settings); g.ui.pop(); }
    }
    draw(ctx, g) {
      dim(ctx, 0.6);
      const w = 260, h = 150, x = (W() - w) / 2, y = (H() - h) / 2;
      UI().panel(ctx, x, y, w, h);
      UI().title(ctx, 'CONFIGURAÇÕES', W() / 2, y + 8);
      this.items(g).forEach((it, i) => {
        const yy = y + 28 + i * 14;
        if (i === this.sel) { ctx.fillStyle = UI().COL.sel; ctx.fillRect(x + 8, yy - 3, w - 16, 13); }
        F().draw(ctx, it.label, x + 16, yy, i === this.sel ? '#fff' : '#ece6f6', { shadow: true });
        if (it.value) F().draw(ctx, (i === this.sel && it.adj ? '◀ ' : '') + it.value + (i === this.sel && it.adj ? ' ▶' : ''), x + w - 16, yy, '#f2d98c', { align: 'right', shadow: true });
      });
      const tip = ['', '', '', 'Um jogador controla os dois. O outro personagem segue e ajuda.', 'Menos dano recebido e mais tempo para reviver.', '', '', ''][this.sel];
      if (tip) F().drawWrapped(ctx, tip, W() / 2 - 120, y + h + 6, 240, '#8a84a8', { shadow: true });
    }
  }
  function toggleFullscreen() {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    } catch (e) { /* */ }
  }
  G.toggleFullscreen = toggleFullscreen;

  // ================================================================ Controles
  class ControlsMenu {
    update(dt, g) { if (back() || M().confirm) g.ui.pop(); }
    draw(ctx, g) {
      dim(ctx, 0.7);
      const x = 16, y = 10, w = W() - 32, h = H() - 20;
      UI().panel(ctx, x, y, w, h);
      UI().title(ctx, 'CONTROLES', W() / 2, y + 7);
      const col = (cx, who, keys, rows) => {
        F().draw(ctx, G.Characters[who].name + ' — ' + (who === 'lirien' ? 'Jogador 1' : 'Jogador 2'), cx, y + 24, G.Characters[who].color, { shadow: true });
        rows.forEach(([k, d], i) => {
          const yy = y + 38 + i * 13;
          const kw = UI().keycap(ctx, k, cx, yy - 2);
          F().draw(ctx, d, cx + kw + 5, yy, '#ece6f6', { shadow: true });
        });
      };
      col(x + 10, 'lirien', null, [
        ['WASD', 'Mover'], ['J', 'Magia (segure: magia carregada)'], ['K', 'Lançar magia selecionada'], ['I', 'Trocar magia'],
        ['L', 'Teleporte / interagir / reviver'], ['J+K', 'Especial: Tempestade Arcana'],
      ]);
      col(x + w / 2 + 4, 'aldren', null, [
        ['Setas', 'Mover'], ['1', 'Espada (segure: golpe pesado)'], ['2', 'Escudo (no início: aparar)'], ['4', 'Provocar inimigos'],
        ['3', 'Investida / interagir / agarrar'], ['1+2', 'Especial: Corte do Herói'],
      ]);
      const yy = y + 124;
      F().draw(ctx, 'Geral', x + 10, yy, '#f2d98c', { shadow: true });
      const gen = [['Esc / P', 'Pausa'], ['Enter', 'Confirmar / avançar diálogo'], ['Tab', 'Modo solo: trocar personagem']];
      gen.forEach(([k, d], i) => { const kw = UI().keycap(ctx, k, x + 10, yy + 12 + i * 13); F().draw(ctx, d, x + 15 + kw, yy + 14 + i * 13, '#ece6f6', { shadow: true }); });
      F().draw(ctx, 'Controles (2 gamepads)', x + w / 2 + 4, yy, '#f2d98c', { shadow: true });
      F().drawWrapped(ctx, 'Analógico/D-pad: mover • X: ataque • B: habilidade • A: investida/interagir • Y: trocar/provocar • Start: pausa • Select: trocar (solo). Controle 1 = Lirien, 2 = Aldren.', x + w / 2 + 4, yy + 13, w / 2 - 20, '#c8c0d8', { shadow: true, lineHeight: 11 });
      F().drawWrapped(ctx, 'Técnicas novas: Aldren aperta 3 perto da Lirien para ERGUÊ-LA e de novo para ARREMESSAR; 3 na beira de um vão curto = SALTO. Segurem interagir perto do parceiro caído (ou congelado) para ajudar.', x + 10, y + h - 26, w - 20, '#8a84a8', { shadow: true, lineHeight: 11 });
    }
  }

  // ================================================================ Loja
  G.ShopStock = {
    tobin: (g) => g.chapter >= 2 ? ['pocao', 'pocao_grande', 'eter', 'tonico', 'pluma', 'anel_foco', 'luvas_ferro'] : ['pocao', 'eter', 'pluma', 'anel_foco'],
    yara: (g) => ['pocao', 'pocao_grande', 'eter', 'elixir', 'pluma', 'botas_cravo', 'luvas_ferro'],
    cassio: (g) => ['pocao_grande', 'elixir', 'eter', 'tonico', 'pluma', 'colar_aurora'],
  };
  class ShopMenu {
    constructor(stock, title) { this.sel = 0; this.stockFn = stock || G.ShopStock.tobin; this.title = title || 'TENDA DO TOBIN'; }
    update(dt, g) {
      const stock = this.stockFn(g);
      const n = stock.length + 1;
      this.sel = nav(this.sel, n);
      if (M().confirm) {
        if (this.sel === stock.length) { g.ui.pop(); return; }
        const id = stock[this.sel], it = G.Items[id];
        const unique = it.cat === 'equipamento';
        if (unique && g.inv.has(id)) { G.Audio.sfx('immune'); g.toast('Vocês já têm este item.'); return; }
        if (g.gold >= it.price) { g.gold -= it.price; g.inv.add(id, 1, g); G.Audio.sfx('coin'); }
        else { G.Audio.sfx('immune'); g.toast('Moedas insuficientes.'); }
      } else if (back()) g.ui.pop();
    }
    draw(ctx, g) {
      dim(ctx, 0.5);
      const stock = this.stockFn(g);
      const w = 300, h = 46 + (stock.length + 1) * 15, x = (W() - w) / 2, y = 20;
      UI().panel(ctx, x, y, w, h);
      UI().title(ctx, this.title, W() / 2, y + 8);
      G.Icons.draw(ctx, 'coin', x + w - 50, y + 22); F().draw(ctx, String(g.gold), x + w - 12, y + 24, '#ffe680', { align: 'right', shadow: true });
      stock.forEach((id, i) => {
        const it = G.Items[id], yy = y + 38 + i * 15;
        if (i === this.sel) { ctx.fillStyle = UI().COL.sel; ctx.fillRect(x + 8, yy - 3, w - 16, 14); }
        G.Icons.draw(ctx, it.icon, x + 12, yy - 1);
        const owned = it.cat === 'equipamento' && g.inv.has(id);
        F().draw(ctx, it.name, x + 26, yy, owned ? '#7aff8a' : g.gold >= it.price ? '#ece6f6' : '#6a6480', { shadow: true });
        F().draw(ctx, owned ? 'comprado' : 'tem ' + g.inv.count(id), x + 210, yy, '#8a84a8', { align: 'right' });
        F().draw(ctx, it.price + ' moedas', x + w - 14, yy, '#ffe680', { align: 'right', shadow: true });
      });
      const yy = y + 38 + stock.length * 15;
      if (this.sel === stock.length) { ctx.fillStyle = UI().COL.sel; ctx.fillRect(x + 8, yy - 3, w - 16, 14); }
      F().draw(ctx, 'Sair', x + 26, yy, '#ece6f6', { shadow: true });
      const it = G.Items[stock[this.sel]];
      if (it) { UI().panel(ctx, x, y + h + 4, w, 32); F().drawWrapped(ctx, it.desc, x + 10, y + h + 12, w - 20, '#c8c0d8', { shadow: true, lineHeight: 11 }); }
    }
  }

  // ================================================================ Ferreiro (até o nível 5)
  const SMITH_COST = [
    { gold: 50 },
    { gold: 100, mat: 'minerio', n: 1 },
    { gold: 200, mat: 'cristal_gelido', n: 2 },
    { gold: 350, mat: 'nucleo_estelar', n: 1 },
  ];
  class SmithMenu {
    constructor(title) { this.sel = 0; this.title = title || 'FORJA DA BRUNNA'; }
    offers(g) {
      const w = g.inv.weapon;
      return [
        { key: 'sword', label: 'Afiar a espada do Aldren', lvl: w.sword, cost: SMITH_COST[w.sword] || null, eff: '+3 de dano físico' },
        { key: 'staff', label: 'Reforçar o cajado da Lirien', lvl: w.staff, cost: SMITH_COST[w.staff] || null, eff: '+2 de dano mágico' },
      ];
    }
    update(dt, g) {
      const o = this.offers(g);
      this.sel = nav(this.sel, o.length + 1);
      if (M().confirm) {
        if (this.sel === o.length) { g.ui.pop(); return; }
        const of = o[this.sel];
        if (!of.cost) { G.Audio.sfx('immune'); g.toast('Já está no nível máximo. Não existe metal melhor!'); return; }
        const c = of.cost;
        if (g.gold < c.gold || (c.mat && g.inv.count(c.mat) < c.n)) { G.Audio.sfx('immune'); g.toast(c.mat ? 'Precisa de ' + c.gold + ' moedas e ' + c.n + 'x ' + G.Items[c.mat].name + '.' : 'Moedas insuficientes.'); return; }
        g.gold -= c.gold; if (c.mat) g.inv.remove(c.mat, c.n);
        g.inv.weapon[of.key]++;
        g.refreshStats();
        G.Audio.sfx('heavyHit'); G.Audio.sfx('levelup');
        g.camera.shake(2, 0.2);
        g.toast((of.key === 'sword' ? 'Espada' : 'Cajado') + ' melhorado para o nível ' + (g.inv.weapon[of.key] + 1) + '!', 3);
      } else if (back()) g.ui.pop();
    }
    draw(ctx, g) {
      dim(ctx, 0.5);
      const w = 340, h = 124, x = (W() - w) / 2, y = 40;
      UI().panel(ctx, x, y, w, h);
      UI().title(ctx, this.title, W() / 2, y + 8);
      let ix = x + w - 12;
      for (const [ic, n] of [['core', g.inv.count('nucleo_estelar')], ['icecrystal', g.inv.count('cristal_gelido')], ['ore', g.inv.count('minerio')], ['coin', g.gold]]) {
        const tw = F().measure(String(n));
        F().draw(ctx, String(n), ix, y + 24, ic === 'coin' ? '#ffe680' : '#c8c8ff', { align: 'right', shadow: true });
        G.Icons.draw(ctx, ic, ix - tw - 12, y + 22);
        ix -= tw + 18;
      }
      const o = this.offers(g);
      o.forEach((of, i) => {
        const yy = y + 42 + i * 26;
        if (i === this.sel) { ctx.fillStyle = UI().COL.sel; ctx.fillRect(x + 8, yy - 3, w - 16, 24); }
        G.Icons.draw(ctx, of.key === 'sword' ? 'sword' : 'staff', x + 12, yy);
        F().draw(ctx, of.label + '  (Nv ' + (of.lvl + 1) + '/5)', x + 26, yy, '#ece6f6', { shadow: true });
        F().draw(ctx, of.cost ? of.eff : 'Nível máximo', x + 26, yy + 11, '#8a84a8');
        if (of.cost) F().draw(ctx, of.cost.gold + ' moedas' + (of.cost.mat ? ' + ' + of.cost.n + 'x ' + G.Items[of.cost.mat].name : ''), x + w - 14, yy + 11, '#ffe680', { align: 'right', shadow: true });
      });
      const yy = y + 42 + o.length * 26;
      if (this.sel === o.length) { ctx.fillStyle = UI().COL.sel; ctx.fillRect(x + 8, yy - 3, w - 16, 14); }
      F().draw(ctx, 'Sair', x + 26, yy, '#ece6f6', { shadow: true });
    }
  }

  // ================================================================ Derrota
  class GameOverScreen {
    constructor() { this.sel = 0; this.t = 0; }
    update(dt, g) {
      this.t += dt;
      if (this.t < 1.2) return;
      this.sel = nav(this.sel, 2);
      if (M().confirm) { G.Audio.sfx('uiOk'); g.ui.pop(); if (this.sel === 0) g.respawnAtCheckpoint(); else g.toTitle(); }
    }
    draw(ctx, g) {
      const a = Math.min(1, this.t / 1.2);
      ctx.fillStyle = `rgba(10,4,10,${0.8 * a})`; ctx.fillRect(0, 0, W(), H());
      ctx.globalAlpha = a;
      F().draw(ctx, 'A jornada vacilou...', W() / 2, H() / 2 - 40, '#e8a0a8', { align: 'center', shadow: true, scale: 2 });
      F().draw(ctx, 'Mas lembranças não morrem tão fácil.', W() / 2, H() / 2 - 12, '#a898b8', { align: 'center', shadow: true });
      if (this.t >= 1.2) UI().options(ctx, ['Tentar de novo (última Pedra de Retorno)', 'Voltar ao menu'], this.sel, W() / 2, H() / 2 + 16, g, { center: true, w: 230 });
      ctx.globalAlpha = 1;
    }
  }
  G.GameOverScreen = GameOverScreen;

  // ================================================================ Fim de capítulo
  G.ChapterInfo = {
    1: { title: 'O Começo da Jornada' },
    2: { title: 'As Montanhas do Norte' },
    3: { title: 'A Última Estrela' },
  };
  const NEXT_TEASER = {
    1: 'Fragmentos da estrela caíram sobre a fortaleza abandonada nas montanhas. Algo lá em cima também está com fome.',
    2: 'Restam as luzes sobre Velmora. A torre que ninguém lembrava está acordando — e Lirien sabe por quê.',
  };
  class ChapterEnd {
    constructor(n) { this.t = 0; this.page = 0; this.n = n || 1; }
    update(dt, g) {
      this.t += dt;
      if (this.t > 2 && M().confirm) {
        if (this.page === 0) { this.page = 1; this.t = 0.5; G.Audio.sfx('uiOk'); }
        else {
          G.Audio.sfx('uiOk'); g.ui.pop();
          if (G.ChapterInfo[this.n + 1] && G.Scenes['ch' + (this.n + 1) + 'Intro']) g.startChapter(this.n + 1);
          else g.toTitle();
        }
      }
    }
    draw(ctx, g) {
      ctx.fillStyle = '#07060b'; ctx.fillRect(0, 0, W(), H());
      for (let i = 0; i < 80; i++) {
        const x = (i * 97.3) % W(), y = (i * 53.7) % (H() * 0.8);
        if (Math.sin(g.time * 2 + i) > -0.3) { ctx.fillStyle = i % 5 ? '#8a84a8' : '#ffffff'; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); }
      }
      const a = Math.min(1, this.t);
      ctx.globalAlpha = a;
      const R = ['', 'I', 'II', 'III'];
      if (this.page === 0) {
        F().draw(ctx, 'FIM DO CAPÍTULO ' + R[this.n], W() / 2, 30, '#f2d98c', { align: 'center', shadow: true, scale: 2 });
        F().draw(ctx, G.ChapterInfo[this.n].title, W() / 2, 54, '#c8c0d8', { align: 'center', shadow: true });
        const c = G.completion(g);
        const rows = [['Tempo de jogo', U.formatTime(g.playTime)]].concat(c.rows.slice(0, 7).map(([k, v, t]) => [k, v + '/' + t]));
        rows.push(['Combos em dupla', String(g.stats.combos || 0)]);
        rows.forEach(([k, v], i) => {
          F().draw(ctx, k, W() / 2 - 130, 74 + i * 14, '#c8c0d8', { shadow: true });
          F().draw(ctx, v, W() / 2 + 130, 74 + i * 14, '#f2d98c', { align: 'right', shadow: true });
        });
        F().draw(ctx, 'Jornada: ' + c.pct + '%', W() / 2, 74 + rows.length * 14 + 6, '#8ae8ff', { align: 'center', shadow: true });
      } else {
        F().draw(ctx, 'Continua no Capítulo ' + R[this.n + 1], W() / 2, 70, '#f2d98c', { align: 'center', shadow: true, scale: 2 });
        F().draw(ctx, (G.ChapterInfo[this.n + 1] || {}).title.toUpperCase(), W() / 2, 98, '#c8c0d8', { align: 'center', shadow: true });
        F().drawWrapped(ctx, NEXT_TEASER[this.n] || '', W() / 2 - 150, 130, 300, '#a898b8', { shadow: true, lineHeight: 12 });
        F().draw(ctx, 'O progresso foi salvo.', W() / 2, 190, '#ece6f6', { align: 'center', shadow: true });
      }
      if (this.t > 2 && Math.floor(g.time * 2) % 2) F().draw(ctx, 'Pressione Enter', W() / 2, H() - 24, '#8a84a8', { align: 'center', shadow: true });
      ctx.globalAlpha = 1;
    }
  }
  G.ChapterEnd = ChapterEnd;

  // ================================================================ Créditos (fim do jogo)
  class Credits {
    constructor() { this.t = 0; this.y = 0; this.done = false; }
    lines(g) {
      const c = G.completion(g);
      return [
        ['ECOS DA JORNADA', 'big'], ['', ''],
        ['Uma aventura cooperativa sobre memória,', ''], ['tempo e quem caminha ao nosso lado.', ''], ['', ''],
        ['ELENCO', 'h'], ['Lirien — maga élfica', ''], ['Aldren — herói espadachim', ''], ['Orvin, Mirta, Tobin, Brunna, Bram, Pip, Edda, Lena e Hugo', ''],
        ['Isolde, Garrik, Nessa, Tavi, Holt, Yara e Hrolf', ''], ['Sir Talen e Mestre Aurelian', ''], ['', ''],
        ['AS ESTRELAS', 'h'], ['Morvath, o Devorador de Memórias', ''], ['Ysveth, a Geada Eterna', ''], ['Nyxara, a Mãe das Estrelas', ''], ['', ''],
        ['FEITO COM', 'h'], ['Pixel art, música e sons gerados por código', ''], ['JavaScript puro, sem bibliotecas', ''], ['', ''],
        ['A SUA JORNADA', 'h'],
        ['Tempo: ' + U.formatTime(g.playTime), ''], ['Combos em dupla: ' + (g.stats.combos || 0), ''], ['Vezes que um salvou o outro: ' + (g.stats.revives || 0), ''],
        ['Conclusão: ' + c.pct + '%', c.pct >= 100 ? 'gold' : ''], ['', ''],
        [c.pct >= 100 ? 'Vocês encontraram TUDO. Obrigado de verdade.' : 'Ainda há segredos esperando por vocês.', ''], ['', ''], ['', ''],
        ['Obrigado por jogar juntos.', 'big2'],
      ];
    }
    update(dt, g) {
      this.t += dt;
      this.y += dt * 16 * (M().confirm && this.t > 1 ? 4 : 1);
      const total = this.lines(g).length * 14 + H();
      if ((this.y > total || (M().back && this.t > 2)) && !this.done) {
        this.done = true;
        g.ui.pop();
        g.afterCredits();
      }
    }
    draw(ctx, g) {
      ctx.fillStyle = '#07060b'; ctx.fillRect(0, 0, W(), H());
      for (let i = 0; i < 120; i++) {
        const x = (i * 97.3) % W(), y = ((i * 53.7) + g.time * (i % 3 + 1) * 2) % H();
        if (Math.sin(g.time * 2 + i) > -0.4) { ctx.fillStyle = i % 7 ? '#5a5480' : '#ffffff'; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); }
      }
      const L = this.lines(g);
      L.forEach(([t, k], i) => {
        const yy = Math.round(H() - this.y + i * 14);
        if (yy < -20 || yy > H() + 10) return;
        const col = k === 'h' ? '#f2d98c' : k === 'gold' ? '#7aff8a' : '#ece6f6';
        F().draw(ctx, t, W() / 2, yy, col, { align: 'center', shadow: true, scale: k === 'big' || k === 'big2' ? 2 : 1 });
      });
    }
  }
  G.Credits = Credits;

  // ================================================================ Tela inicial
  class TitleScreen {
    constructor(g) {
      this.sel = 0; this.t = 0; this.stars = [];
      for (let i = 0; i < 120; i++) this.stars.push({ x: Math.random() * W(), y: Math.random() * H() * 0.7, s: Math.random() * 6.28, b: Math.random() });
      this.meteor = null; this.meteorT = 2;
      this.flies = [];
      for (let i = 0; i < 14; i++) this.flies.push({ x: Math.random() * W(), y: H() * 0.65 + Math.random() * H() * 0.3, p: Math.random() * 6 });
      this.hasSave = G.Save.exists();
      this.sel = this.hasSave ? 1 : 0;
      this.bg = this.makeBackground();
      this.started = false;
    }
    subtitle() {
      if (this._sub) return this._sub;
      const d = G.Save.read();
      const f = (d && d.flags) || {};
      const R = ['', 'I', 'II', 'III'];
      let n = 1;
      if (f.chapter1_done) n = 2;
      if (f.chapter2_done) n = 3;
      if (f.game_complete) return (this._sub = 'Uma jornada completa');
      this._sub = 'Capítulo ' + R[n] + ' — ' + G.ChapterInfo[n].title;
      return this._sub;
    }
    makeBackground() {
      return G.Pixel.make(W(), H(), (x) => {
        // céu em faixas pontilhadas
        const cols = ['#0b0918', '#110d24', '#181232', '#211842', '#2c1e50', '#3a2458'];
        const bandH = Math.ceil(H() * 0.75 / cols.length);
        const r = U.rng(5);
        cols.forEach((c, i) => {
          x.fillStyle = c; x.fillRect(0, i * bandH, W(), bandH);
          if (i < cols.length - 1) for (let k = 0; k < W() * 2; k++) { x.fillStyle = cols[i + 1]; x.fillRect((r() * W()) | 0, i * bandH + bandH - 1 - ((r() * 4) | 0), 1, 1); }
        });
        // montanhas distantes
        const mount = (base, amp, col, seed) => {
          const rr = U.rng(seed);
          let h = base;
          for (let px = 0; px < W(); px++) {
            h += (rr() - 0.5) * 3; h = U.clamp(h, base - amp, base + amp * 0.3);
            x.fillStyle = col; x.fillRect(px, Math.round(h), 1, H() - Math.round(h));
          }
        };
        mount(H() * 0.55, 30, '#1e1636', 11);
        mount(H() * 0.66, 20, '#16102a', 23);
        // colina
        for (let px = 0; px < W(); px++) {
          const hy = H() * 0.78 - Math.sin((px / W()) * Math.PI) * 26 + Math.sin(px * 0.05) * 2;
          x.fillStyle = '#0c0a16'; x.fillRect(px, Math.round(hy), 1, H());
          x.fillStyle = '#1a1830'; x.fillRect(px, Math.round(hy), 1, 1);
        }
        // árvore solitária
        x.fillStyle = '#0c0a16'; x.fillRect(Math.round(W() * 0.78), Math.round(H() * 0.6), 3, 30);
        G.Pixel.circle(x, Math.round(W() * 0.78) + 1, Math.round(H() * 0.58), 12, '#0c0a16');
        G.Pixel.circle(x, Math.round(W() * 0.78) - 8, Math.round(H() * 0.62), 8, '#0c0a16');
        G.Pixel.circle(x, Math.round(W() * 0.78) + 10, Math.round(H() * 0.61), 9, '#0c0a16');
      });
    }
    update(dt, g) {
      this.t += dt;
      this.meteorT -= dt;
      if (this.meteorT <= 0) { this.meteorT = U.rand(2.5, 6); this.meteor = { x: U.rand(W() * 0.3, W()), y: U.rand(0, 40), t: 0 }; }
      if (this.meteor) { this.meteor.t += dt; if (this.meteor.t > 1) this.meteor = null; }
      if (g.ui.open) return;
      if (!this.started) { if (G.Input.anyPressed && this.t > 0.3) { this.started = true; G.Audio.unlock(); G.Audio.playMusic('title'); G.Audio.setAmbience('night'); } return; }
      const opts = this.options();
      this.sel = nav(this.sel, opts.length);
      if (opts[this.sel].disabled && (M().up || M().down)) this.sel = nav(this.sel, opts.length);
      if (M().confirm) {
        const o = opts[this.sel];
        if (o.disabled) { G.Audio.sfx('immune'); return; }
        G.Audio.sfx('uiOk');
        o.fn(g);
      }
    }
    options() {
      return [
        { label: 'Novo jogo', fn: (g) => { if (this.hasSave) g.ui.confirm('Começar um novo jogo apaga o progresso salvo. Continuar?', (gg) => gg.newGame()); else g.newGame(); } },
        { label: 'Continuar', disabled: !this.hasSave, fn: (g) => g.continueGame() },
        { label: 'Jogar online (convite)', fn: () => G.Online.openHost() },
        { label: 'Restaurar save do casal', disabled: !(G.Online.restore && G.Online.restore()), fn: (g) => { G.Save.write(JSON.parse(G.Online.restore())); g.toTitle(); } },
        { label: 'Configurações', fn: (g) => g.ui.openSettings(g) },
        { label: 'Controles', fn: (g) => g.ui.openControls(g) },
        { label: 'Sair', fn: (g) => { try { window.close(); } catch (e) { /* */ } g.ui.message('Para sair, feche esta aba do navegador. Até a próxima jornada!'); } },
      ];
    }
    draw(ctx, g) {
      ctx.drawImage(this.bg, 0, 0);
      const t = g.time;
      for (const s of this.stars) {
        const b = (Math.sin(t * 1.5 + s.s) + 1) / 2;
        if (b < 0.2) continue;
        ctx.fillStyle = b > 0.85 && s.b > 0.7 ? '#ffffff' : s.b > 0.5 ? '#a8a0d0' : '#5a5480';
        ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
      }
      if (this.meteor) {
        const m = this.meteor;
        for (let i = 0; i < 14; i++) {
          ctx.globalAlpha = (1 - i / 14) * (1 - m.t);
          ctx.fillStyle = i < 2 ? '#ffffff' : '#f2d98c';
          ctx.fillRect(Math.round(m.x - m.t * 160 + i * 3), Math.round(m.y + m.t * 80 - i * 1.5), 1, 1);
        }
        ctx.globalAlpha = 1;
      }
      // a dupla sentada na colina
      const cx = Math.round(W() * 0.5), cy = Math.round(H() * 0.78 - 26);
      if (!this.silL) { this.silL = G.Pixel.silhouette(G.Sprites.lirien.up[0], '#0c0a16'); this.silA = G.Pixel.silhouette(G.Sprites.aldren.up[0], '#0c0a16'); }
      ctx.globalAlpha = 0.9;
      ctx.drawImage(this.silL, cx - 18, cy - this.silL.height + 4);
      ctx.drawImage(this.silA, cx + 1, cy - this.silA.height + 4);
      ctx.globalAlpha = 1;
      for (const f of this.flies) {
        f.p += 0.016;
        const fx = f.x + Math.sin(f.p * 0.7) * 10, fy = f.y + Math.cos(f.p) * 5;
        if (Math.sin(f.p * 3) > 0) { ctx.fillStyle = '#e8f0a0'; ctx.fillRect(Math.round(fx), Math.round(fy), 1, 1); ctx.globalAlpha = 0.3; ctx.fillRect(Math.round(fx) - 1, Math.round(fy) - 1, 3, 3); ctx.globalAlpha = 1; }
      }
      // título
      const ty = 46;
      const glow = 0.25 + Math.sin(t * 1.2) * 0.1;
      ctx.globalAlpha = glow;
      F().draw(ctx, 'ECOS DA JORNADA', W() / 2 + 1, ty + 1, '#8a6ad8', { align: 'center', scale: 3 });
      ctx.globalAlpha = 1;
      F().draw(ctx, 'ECOS DA JORNADA', W() / 2, ty, '#f2d98c', { align: 'center', scale: 3, shadow: true, shadowColor: '#3a2458' });
      F().draw(ctx, this.subtitle(), W() / 2, ty + 32, '#c8c0e0', { align: 'center', shadow: true });
      if (!this.started) {
        if (Math.floor(t * 2) % 2) F().draw(ctx, 'Pressione qualquer tecla', W() / 2, 170, '#ece6f6', { align: 'center', shadow: true });
      } else if (!g.ui.open) {
        UI().options(ctx, this.options(), this.sel, W() / 2, 150, g, { center: true, w: 120, lh: 14 });
      }
      F().draw(ctx, 'Jogador 1: WASD + J K L I    Jogador 2: Setas + 1 2 3 4', W() / 2, H() - 14, '#5a5480', { align: 'center' });
      F().draw(ctx, 'v' + G.VERSION, W() - 4, H() - 12, '#3a3458', { align: 'right' });
    }
  }
  G.TitleScreen = TitleScreen;
})();
