// Jogo: estados, carregamento de áreas, atualização, renderização, save,
// morte/checkpoint, memórias e utilitários usados pelos scripts das fases.
(function () {
  const U = G.U, C = G.Co, TS = G.TILE;
  const W = G.VIEW_W, H = G.VIEW_H;

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;
      this.world = U.makeCanvas(W, H);
      this.wctx = this.world.getContext('2d');
      this.time = 0;
      this.settings = G.Save.loadSettings();
      G.settings = this.settings; // usado pela câmera (tremor de tela)
      G.Input.solo = this.settings.solo;
      G.Audio.vol.music = this.settings.music; G.Audio.vol.sfx = this.settings.sfx;
      this.camera = new G.Camera();
      this.particles = new G.Particles();
      this.lighting = new G.Lighting();
      this.co = new C.Runner();
      this.dialogue = new G.Dialogue();
      this.ui = new G.UIManager();
      this.state = 'title';
      this.title = new G.TitleScreen(this);
      this.fade = { a: 1, target: 0, speed: 2, color: '#000' };
      this.flash = { a: 0, color: '#fff' };
      this.letter = 0; this.letterTarget = 0;
      this.toasts = [];
      this.showIndicators = true;
      this.vignette = this.makeVignette();
      this.combatT = 0; this.inCombat = false;
      this.fps = 60; this.fpsT = 0; this.fpsN = 0;
      this.ai = new G.CompanionAI();
      this.resetProgress();
    }

    makeVignette() {
      const c = U.makeCanvas(W, H), x = c.getContext('2d');
      const gr = x.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(6,4,14,0.55)');
      x.fillStyle = gr; x.fillRect(0, 0, W, H);
      return c;
    }

    resetProgress() {
      this.flags = {};
      this.inv = new G.Inventory();
      this.quests = new G.QuestLog();
      this.prog = new G.Progression();
      this.memories = new Set();
      this.unlockedSpells = ['frost', 'tk'];
      this.abilities = new Set();
      this.gold = 0;
      this.stats = { kills: 0, combos: 0, downs: 0, revives: 0 };
      this.playTime = 0;
      this.checkpoint = null;
      this.players = [];
      this.entities = [];
      this.solids = []; this.interactables = [];
      this.level = null;
      this.bossBar = null;
      this.tauntT = 0;
      this.inMemory = null;
      this.present = null;
      this.waystones = {};
      this.bestiary = {};
    }
    // capítulo atual (derivado das flags da história)
    get chapter() {
      if (this.flag('game_complete')) return 4;
      if (this.flag('chapter2_done')) return 3;
      if (this.flag('chapter1_done')) return 2;
      return 1;
    }

    // ============================================================ Estados
    newGame() {
      G.Save.clear();
      this.resetProgress();
      this.state = 'play';
      this.ui.clear();
      this.makePlayers();
      this.inv.add('pocao', 2);
      this.loadArea('vila', 'start');
      this.fade.a = 1; this.fade.target = 1;
      this.co.start(G.Scenes.intro, this, { name: 'intro' });
    }
    continueGame() {
      const d = G.Save.read();
      if (!d) { this.newGame(); return; }
      this.resetProgress();
      this.loadSaveData(d);
      this.state = 'play';
      this.ui.clear();
      this.makePlayers();
      const cp = this.checkpoint;
      if (cp && G.Areas[cp.area]) this.loadArea(cp.area, null, { pos: cp });
      else this.loadArea(d.area || 'vila', 'start');
      this.refreshStats();
      for (const p of this.players) p.fullHeal(this);
      this.fade.a = 1; this.fade.target = 0;
      // save antigo que terminou um capítulo mas não começou o próximo
      const pend = this.pendingChapter();
      if (pend) { this.startChapter(pend); return; }
      this.toast('Jornada retomada.', 2);
    }
    // depois dos créditos: o mundo continua aberto para chegar aos 100%
    afterCredits() {
      this.setFlag('game_complete', true);
      this.setCheckpoint({ id: 'cp_vila_fim', area: 'vila', x: 23 * 16 + 8, y: 18 * 16 + 12 });
      this.state = 'play';
      this.inMemory = null; this.memBackup = null;
      for (const p of this.players) { p.young = false; p.fullHeal(this); }
      this.loadArea('vila', 'start');
      this.save();
      this.fade.a = 1; this.fade.target = 0;
      G.Audio.playMusic('village', 2);
      this.toast('A jornada terminou... mas o mundo continua. Explorem e cheguem aos 100%!', 6);
    }
    pendingChapter() {
      if (this.flag('chapter1_done') && !this.flag('ch2_started')) return 2;
      if (this.flag('chapter2_done') && !this.flag('ch3_started')) return 3;
      return 0;
    }
    // começa um novo capítulo (chamado no fim do anterior ou ao continuar)
    startChapter(n) {
      this.state = 'play';
      this.ui.clear(); this.co.clear(); this.dialogue.active = false;
      if (!this.players.length) this.makePlayers();
      this.setFlag('ch' + n + '_started', true);
      const sc = G.Scenes['ch' + n + 'Intro'];
      this.fade.a = 1; this.fade.target = 1;
      if (sc) this.co.start(sc, this, { name: 'intro', persist: true });
    }
    toTitle() {
      this.state = 'title';
      this.ui.clear(); this.co.clear(); this.dialogue.active = false;
      this.title = new G.TitleScreen(this);
      this.title.started = true;
      this.bossBar = null;
      this.letter = 0; this.letterTarget = 0;
      this.camera.focus = null;
      this.fade.a = 1; this.fade.target = 0;
      G.Audio.playMusic('title'); G.Audio.setAmbience('night');
    }
    makePlayers() {
      const li = new G.Mage({ x: 0, y: 0 });
      const al = new G.Warrior({ x: 0, y: 0 });
      this.players = [li, al];
      this.refreshStats();
      for (const p of this.players) { p.hp = p.maxHp; p.mp = p.maxMp; p.st = p.maxSt; }
    }

    // ============================================================ Save
    serialize() {
      return {
        version: G.VERSION, area: this.level ? this.level.id : 'vila',
        checkpoint: this.checkpoint, flags: this.flags, inv: this.inv.serialize(), quests: this.quests.serialize(),
        prog: this.prog.serialize(), memories: [...this.memories], spells: this.unlockedSpells, abilities: [...this.abilities],
        gold: this.gold, stats: this.stats, playTime: this.playTime, savedAt: Date.now(),
        waystones: this.waystones, bestiary: this.bestiary,
      };
    }
    loadSaveData(d) {
      this.flags = Object.assign({}, d.flags || {});
      this.inv.load(d.inv);
      this.quests.load(d.quests);
      this.prog.load(d.prog);
      this.memories = new Set(d.memories || []);
      this.unlockedSpells = d.spells || ['frost', 'tk'];
      this.abilities = new Set(d.abilities || []);
      this.gold = d.gold || 0;
      this.stats = Object.assign({ kills: 0, combos: 0, downs: 0, revives: 0 }, d.stats || {});
      this.playTime = d.playTime || 0;
      this.checkpoint = d.checkpoint || null;
      this.waystones = Object.assign({}, d.waystones || {});
      this.bestiary = Object.assign({}, d.bestiary || {});
    }
    save() {
      if (this.inMemory || this.state !== 'play') return;
      G.Save.write(this.serialize());
    }

    // ============================================================ Progresso / utilidades
    flag(f) { return !!this.flags[f]; }
    setFlag(f, v = true) { this.flags[f] = v; }
    addGold(n) { this.gold += n; }
    addPoints(n) { this.prog.points += n; this.toast(`+${n} Ponto${n > 1 ? 's' : ''} de Lembrança! (medite numa Pedra de Retorno)`, 3.5); G.Audio.sfx('levelup'); }
    has(id) { return this.prog.has(id) || this.abilities.has(id); }
    stat(who, name) { return G.computeStat(this, who, name); }
    refreshStats() { for (const p of this.players) if (p) p.resetStats(this); }
    questState(id) { return this.quests.get(id); }
    startQuest(id) { this.quests.start(id, this); }
    completeQuest(id) { this.quests.complete(id, this); this.refreshStats(); }
    secretsFound() { return Object.keys(this.flags).filter((k) => k.startsWith('secret_') && this.flags[k]).length; }
    syncWindow(base) { return base * (G.Input.solo ? 3 : 1) * (this.settings.assist ? 1.5 : 1); }
    spriteFor(key) {
      const eq = this.inv.equip[key] || {};
      if (key === 'aldren' && eq.cosmetic === 'capa_cinzenta') return G.Sprites.recolor('aldren', { q: '#2e2e38', r: '#5a5a68', R: '#8a8a9a' });
      if (key === 'lirien' && eq.cosmetic === 'fita_estelar') return G.Sprites.recolor('lirien', { k: '#141434', g: '#26265a', G: '#4a4a96', y: '#e8e0ff', Y: '#ffffff' });
      if (key === 'aldren' && eq.cosmetic === 'capa_neve') return G.Sprites.recolor('aldren', { q: '#8a96aa', r: '#c8d4e4', R: '#f2f6fb' });
      if (key === 'aldren' && eq.cosmetic === 'capa_talen') return G.Sprites.recolor('aldren', { q: '#1a2a5a', r: '#2a4a8a', R: '#4a78c8' });
      if (key === 'lirien' && eq.cosmetic === 'manto_aurora') return G.Sprites.recolor('lirien', { k: '#1a3a3a', g: '#2a7a6a', G: '#6ad8a8', y: '#ff9ad8', Y: '#ffd0f0' });
      return G.Sprites[key];
    }
    toast(text, t = 2.5) {
      if (this.toasts.some((x) => x.text === text)) return;
      this.toasts.push({ text, t, max: t });
      if (this.toasts.length > 3) this.toasts.shift();
    }
    bubble(actor, text, t) { if (actor) actor.say(text, t || Math.max(2, text.length * 0.06)); }
    // sequência de balões que não pausa o jogo
    banter(key) {
      const seq = G.Banter[key];
      if (!seq || this.flag('banter_' + key)) return;
      this.setFlag('banter_' + key, true);
      const g = this;
      this.co.start(function* () {
        for (const [who, text] of seq) {
          const actor = g.players[who === 'lirien' ? 0 : 1];
          const t = Math.max(1.8, text.length * 0.065);
          g.bubble(actor, text, t);
          yield C.wait(t + 0.2);
        }
      }, this, { blocking: false, name: 'banter' });
    }
    comboText(x, y, text) {
      this.particles.text(x, y, text, '#ffd84a', { big: true, life: 1.1, vy: -20 });
      G.Audio.sfx('combo');
    }
    registerCombo(kind) {
      this.stats.combos++;
      for (const p of this.players) if (p) p.addSpecial(10);
      if (!this.flag('first_combo')) { this.setFlag('first_combo', true); this.toast('Combo em dupla! Combos enchem a barra de especial dos dois.', 3.5); }
    }
    onSpecial(p) {
      const now = this.time;
      this.lastSpecial = this.lastSpecial || [0, 0];
      this.lastSpecial[p.index] = now;
      const other = this.lastSpecial[1 - p.index];
      if (now - other < 1.6 && other > 0) {
        // UNIÃO: os dois especiais juntos
        this.comboText((this.players[0].x + this.players[1].x) / 2, Math.min(this.players[0].y, this.players[1].y) - 50, 'UNIÃO!');
        this.flashScreen('#fff6d8', 0.3);
        this.camera.shake(5, 0.6);
        for (const pl of this.players) G.Combat.hitCircle(this, pl.x, pl.y - 8, 70, { dmg: 40, kind: 'special', src: pl, magic: true, stun: 2 });
        this.registerCombo('uniao');
        this.lastSpecial = [0, 0];
        if (this.boss && this.boss.onUnion) this.boss.onUnion(this);
      }
    }
    hitstop(t) { this.hitstopT = Math.max(this.hitstopT || 0, t); }
    flashScreen(color, t) { this.flash = { a: Math.min(1, t * 3), color, decay: 1 / Math.max(0.05, t) }; }
    signalOn(id) {
      for (const e of this.entities) if (e.id === id && !e.dead && e.isOn && e.isOn()) return true;
      return !!this.flags['sig_' + id];
    }
    setCheckpoint(cp) { this.checkpoint = cp; }
    inputLocked() {
      return (this.inputCooldownT > 0) || this.dialogue.active || this.co.blocking || this.ui.open || this.transitioning || this.state !== 'play';
    }
    inCutscene() { return this.co.blocking || this.letter > 0.05; }
    onItemGained(id, n) {
      this.quests.refresh(this);
      if (id === 'pagina' && this.questState('paginas') === 'inactive') this.startQuest('paginas');
      if (id === 'pagina') this.quests.refresh(this);
    }

    // ============================================================ Entidades
    addEntity(e) {
      this.entities.push(e);
      if (e.init) e.init(this);
      return e;
    }
    spawnEnemy(type, x, y, o = {}) {
      const Cls = G.EnemyTypes[type];
      if (!Cls) { console.warn('Inimigo desconhecido', type); return null; }
      const e = new Cls(Object.assign({ x, y }, o));
      this.addEntity(e);
      if (this.level && !e.boss) this.unstick(e);
      return e;
    }
    spawnDrop(x, y, kind, qty = 1) {
      const a = Math.random() * 6.28;
      return this.addEntity(new G.ObjectTypes.pickup({ x, y, kind, qty, life: 12, vz: 90, z: 1, vx: Math.cos(a) * 30, vy: Math.sin(a) * 20, delay: 0.3 }));
    }
    spawnPickup(item, x, y, o = {}) {
      return this.addEntity(new G.ObjectTypes.pickup(Object.assign({ x, y, item, vz: 80, z: 1, delay: 0.3 }, o)));
    }
    spawnFromSpec(spec, tx, ty) {
      const x = tx * TS + 8;
      if (spec.enemy) return this.spawnEnemy(spec.enemy, x, ty * TS + 14, spec);
      if (spec.npc) return this.addEntity(new G.NPC(Object.assign({ x, y: ty * TS + 14 }, spec)));
      if (spec.type) {
        const Cls = G.ObjectTypes[spec.type];
        if (!Cls) { console.warn('Objeto desconhecido', spec.type); return null; }
        let ox = x, oy = ty * TS + 16;
        if (spec.type === 'decor' && spec.kind === 'house') ox = tx * TS + spec.w * 8;
        if (spec.offset) { ox += spec.offset[0]; oy += spec.offset[1]; }
        return this.addEntity(new Cls(Object.assign({ x: ox, y: oy, theme: this.level.theme }, spec)));
      }
      return null;
    }

    // ============================================================ Áreas
    loadArea(id, spawn, opts = {}) {
      const def = G.Areas[id];
      if (!def) { console.error('Área inexistente', id); return; }
      def.scripts = def.scripts || {};
      this.level = new G.Level(def, this);
      this.entities = [];
      this.particles.clear();
      this.bossBar = null; this.boss = null;
      this.tauntT = 0;
      this.co.list = this.co.list.filter((c) => c.persist || c.name === 'intro' || c.name === 'memory' || c.name === 'transition' || c.name === 'respawn' || c.name === 'golemDefeated' || c.name === 'bossDefeated' || c.name === 'afterMemory');
      this.camera.setBounds(this.level.pw, this.level.ph);
      this.camera.focus = null;
      for (const tp of this.level.makeTileProps()) this.entities.push(tp);
      // marcadores
      const counts = {};
      for (const m of this.level.markers) {
        let spec = def.marks && def.marks[m.ch];
        if (!spec) { console.warn('Marcador sem definição', m.ch, 'em', id); continue; }
        const i = counts[m.ch] = (counts[m.ch] || 0) + 1;
        if (typeof spec === 'function') spec = spec(i - 1, m.tx, m.ty);
        if (Array.isArray(spec)) spec = spec[(i - 1) % spec.length];
        if (!spec) continue;
        if (spec.spawn) this.level.spawns[spec.spawn] = [m.tx, m.ty];
        if (spec.exit) this.level.exits.push({ x: m.tx * TS, y: m.ty * TS, w: TS, h: TS, to: spec.exit, spawn: spec.to });
        if (spec.trigger) this.level.triggers.push({ x: m.tx * TS, y: m.ty * TS, w: TS, h: TS, name: spec.trigger, flag: spec.flag, fired: false });
        if (spec.type || spec.enemy || spec.npc) {
          if (spec.cond && !spec.cond(this)) continue;
          this.spawnFromSpec(spec, m.tx, m.ty);
        }
        if (spec.also) this.spawnFromSpec(spec.also, m.tx, m.ty);
      }
      if (def.spawns) Object.assign(this.level.spawns, def.spawns);
      if (def.exits) for (const e of def.exits) this.level.exits.push({ x: e.x * TS, y: e.y * TS, w: (e.w || 1) * TS, h: (e.h || 1) * TS, to: e.to, spawn: e.spawn });
      if (def.zones) for (const z of def.zones) this.level.triggers.push({ x: z.x * TS, y: z.y * TS, w: (z.w || 1) * TS, h: (z.h || 1) * TS, name: z.trigger, flag: z.flag, fired: false });
      if (def.entities) for (const s of def.entities) { if (s.cond && !s.cond(this)) continue; this.spawnFromSpec(s, s.tx, s.ty); }
      // jogadores
      let px, py;
      if (opts.pos) { px = opts.pos.x; py = opts.pos.y; }
      else if (opts.positions) { px = null; }
      else {
        const sp = this.level.spawns[spawn] || this.level.spawns.start || [2, 2];
        px = sp[0] * TS + 8; py = sp[1] * TS + 12;
      }
      this.players.forEach((p, i) => {
        if (!p) return;
        p.state = 'normal'; p.z = 0; p.flight = null; p.carried = false; p.svx = 0; p.svy = 0; p.frozenSolid = 0; p.chillT = 0;
        if (p.hp <= 0) p.hp = Math.max(1, Math.round(p.maxHp * 0.3)); // nunca "vivo" com 0 de vida
        p.stateT = 0; p.kvx = 0; p.kvy = 0; p.bubbleText = null; p.stuckT = 0;
        p.cancelActions(this);
        if (opts.positions) { p.x = opts.positions[i].x; p.y = opts.positions[i].y; p.dir = opts.positions[i].dir; }
        else {
          const off = def.spawnOffset || [[-10, 0], [10, 0]];
          p.x = px + off[i][0]; p.y = py + off[i][1];
          if (opts.dir || def.spawnDir) p.dir = opts.dir || def.spawnDir;
          this.unstick(p);
        }
        p.lastSafe = { x: p.x, y: p.y };
        p.invuln = 1;
      });
      this.camera.snap(this.players);
      // áudio
      if (!opts.keepMusic) G.Audio.playMusic(this.inMemory ? 'memory' : def.music, 1.2);
      G.Audio.setAmbience(def.ambience || null);
      this.inCombat = false; this.combatT = 0;
      if (def.title && !opts.silent) G.HUD.showArea(def.title);
      if (def.onEnter) def.onEnter(this, spawn);
    }
    unstick(p, prefer) {
      if (!G.Physics.blocked(this, p.box, p)) return false;
      // procura o ponto livre mais próximo (de preferência do lado "prefer")
      const dirs = [];
      for (let r = 2; r < 64; r += 2) {
        for (const [dx, dy] of [[r, 0], [-r, 0], [0, r], [0, -r], [r, r], [-r, r], [r, -r], [-r, -r]]) dirs.push([dx, dy]);
      }
      if (prefer) {
        // empurra para o lado indicado (ex.: para dentro da arena)
        const near = dirs.filter(([dx, dy]) => Math.hypot(dx, dy) <= 40);
        near.sort((a, b) => U.dist(p.x + a[0], p.y + a[1], prefer.x, prefer.y) - U.dist(p.x + b[0], p.y + b[1], prefer.x, prefer.y));
        dirs.unshift(...near);
      }
      for (const [dx, dy] of dirs) {
        const b = p.box; b.x += dx; b.y += dy;
        if (G.Physics.blocked(this, b, p)) continue;
        if (!p.flying && this.level.isHole(Math.floor((p.x + dx) / TS), Math.floor((p.y + dy - 2) / TS))) continue;
        p.x += dx; p.y += dy;
        return true;
      }
      return false;
    }

    // Um tile é transitável a pé? (tiles sólidos, água/abismo sem gelo/ponte e
    // entidades sólidas como portões contam como bloqueio)
    tilePassable(tx, ty) {
      const lv = this.level;
      if (lv.blocksAt(tx, ty, null)) return false;
      const cx = tx * TS + 8, cy = ty * TS + 8;
      for (const e of this.solids) {
        if (e.dead || !e.solid) continue;
        const b = e.box;
        if (cx >= b.x && cx < b.x + b.w && cy >= b.y && cy < b.y + b.h) return false;
        // entidades largas (portões 16x16) cobrem o tile inteiro
        if (b.w >= 14 && b.h >= 12 && U.rectsOverlap({ x: tx * TS + 4, y: ty * TS + 4, w: 8, h: 8 }, b)) return false;
      }
      return true;
    }
    // Existe caminho a pé entre dois pontos (busca em largura limitada)?
    reachable(ax, ay, bx, by, margin = 8) {
      const sx = Math.floor(ax / TS), sy = Math.floor((ay - 3) / TS);
      const ex = Math.floor(bx / TS), ey = Math.floor((by - 3) / TS);
      if (sx === ex && sy === ey) return true;
      const x0 = Math.min(sx, ex) - margin, x1 = Math.max(sx, ex) + margin;
      const y0 = Math.min(sy, ey) - margin, y1 = Math.max(sy, ey) + margin;
      const W2 = x1 - x0 + 1;
      const seen = new Uint8Array(W2 * (y1 - y0 + 1));
      const q = [[sx, sy]];
      seen[(sy - y0) * W2 + (sx - x0)] = 1;
      while (q.length) {
        const [x, y] = q.shift();
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx < x0 || ny < y0 || nx > x1 || ny > y1) continue;
          const k = (ny - y0) * W2 + (nx - x0);
          if (seen[k]) continue;
          seen[k] = 1;
          if (nx === ex && ny === ey) return true;
          if (!this.tilePassable(nx, ny)) continue;
          q.push([nx, ny]);
        }
      }
      return false;
    }
    // Junta a dupla: quem ficou para trás (do outro lado de um portão, longe
    // demais) aparece ao lado de quem está à frente. Usado antes de fechar arenas.
    regroup(leader, maxDist = 72) {
      if (!leader) return;
      this.solids = this.entities.filter((e) => !e.dead && (e.solid || e.blocksProjectiles));
      for (const p of this.players) {
        if (!p || p === leader) continue;
        const near = U.dist(p.x, p.y, leader.x, leader.y) <= maxDist && this.reachable(p.x, p.y, leader.x, leader.y, 4);
        if (near) continue;
        const from = { x: p.x, y: p.y };
        for (const [ox, oy] of [[0, 14], [-16, 6], [16, 6], [-16, -6], [16, -6], [0, -14], [-24, 12], [24, 12], [0, 24], [0, 0]]) {
          const nx = leader.x + ox, ny = leader.y + oy;
          const b = { x: nx - p.w / 2, y: ny - p.h, w: p.w, h: p.h };
          if (G.Physics.blocked(this, b, p) || this.level.isHole(Math.floor(nx / TS), Math.floor((ny - 2) / TS))) continue;
          if (!this.reachable(leader.x, leader.y, nx, ny, 3)) continue;
          p.x = nx; p.y = ny; p.kvx = 0; p.kvy = 0;
          if (p.state === 'down') p.revive(this, 0.3);
          p.cancelActions(this); if (p.state !== 'normal') { p.state = 'normal'; p.stateT = 0; }
          p.lastSafe = { x: p.x, y: p.y };
          for (const q of [from, p]) this.particles.burst(q.x, q.y - 10, 14, { colors: ['#ffe8a0', '#ffffff'], speed: 40, life: 0.5, glow: true });
          break;
        }
      }
    }
    changeArea(id, spawn, opts = {}) {
      if (this.transitioning) return;
      this.transitioning = true;
      const g = this;
      this.co.start(function* () {
        yield g.fadeTo(1, 0.35);
        g.loadArea(id, spawn, opts);
        g.save();
        yield C.wait(0.1);
        g.transitioning = false;
        yield g.fadeTo(0, 0.4);
      }, this, { name: 'transition', blocking: true });
    }

    // ============================================================ Ajudantes de cutscene (retornam "waiters")
    fadeTo(a, t, color) {
      this.fade.target = a; this.fade.speed = 1 / Math.max(0.01, t);
      if (color) this.fade.color = color;
      const f = this.fade;
      return C.until(() => Math.abs(f.a - f.target) < 0.01);
    }
    say(lines) {
      this.dialogue.start(lines);
      const d = this.dialogue;
      return C.until(() => !d.active);
    }
    walkTo(actor, x, y, speed = 60) {
      return {
        update(dt, g) {
          const d = U.dist(actor.x, actor.y, x, y);
          if (d < 2) { actor.moving = false; return true; }
          const n = U.norm(x - actor.x, y - actor.y);
          const st = Math.min(d, speed * dt);
          actor.x += n.x * st; actor.y += n.y * st;
          if (actor.setDir) actor.setDir(n.x, n.y);
          actor.moving = true; actor.animT += 0;
          return false;
        },
      };
    }
    camTo(x, y, speed = 3) { this.camera.focus = { x, y, speed }; const cam = this.camera; return C.until(() => { const t = cam.clampPos(x, y); return Math.abs(cam.x - t.x) < 2 && Math.abs(cam.y - t.y) < 2; }); }
    camRelease() { this.camera.focus = null; }
    letterbox(on) { this.letterTarget = on ? 1 : 0; }
    titleCard(text, sub, dur = 2.6) {
      this.card = { text, sub, t: 0, dur };
      const g = this;
      return C.until(() => !g.card);
    }
    waitClear(fn) { const g = this; return C.until(() => !g.entities.some((e) => e.isEnemy && !e.dead && (!fn || fn(e)))); }
    // mostra rapidamente algo que aconteceu fora da tela (portão abrindo etc.)
    showEvent(x, y) {
      if (this.camera.inView(x, y, -20)) return;
      const g = this;
      this.co.start(function* () {
        yield C.wait(0.3);
        g.camera.focus = { x, y, speed: 5 };
        yield C.wait(1.1);
        g.camera.focus = null;
        yield C.wait(0.4);
      }, this, { name: 'event' });
    }

    // ============================================================ Morte / checkpoint
    onPlayerDown(p) {
      this.stats.downs++;
      const other = p.partner(this);
      if (other && other.state === 'down' && !other.plumaPending) this.gameOver();
      else if (other) { this.bubble(other, p.kind === 'mage' ? 'Lirien! Aguenta firme!' : 'Aldren! Levanta!', 2); this.toast(`${p.name} caiu! Segure ${G.Characters[other.key].keys.act} perto para reviver.`, 3); }
    }
    onPlayerRevived(p) { this.stats.revives++; }
    onPlayerLost(p) { this.gameOver(); }
    gameOver() {
      if (this.gameOverPending) return;
      this.gameOverPending = true;
      const g = this;
      this.co.start(function* () {
        yield C.wait(1.0);
        G.Audio.playMusic('gameover', 1);
        g.ui.push(new G.GameOverScreen());
        g.gameOverPending = false;
      }, this, { name: 'gameover', blocking: true });
    }
    respawnAtCheckpoint() {
      const cp = this.checkpoint;
      const g = this;
      this.co.clear();
      this.dialogue.active = false;
      this.inMemory = null;
      this.restoreMemBackup();
      this.letterTarget = 0; this.memoryOverlay = 0; this.camera.focus = null;
      for (const p of this.players) { p.young = false; p.state = 'normal'; }
      this.co.start(function* () {
        g.fade.a = 1; g.fade.target = 1;
        if (cp && G.Areas[cp.area]) g.loadArea(cp.area, null, { pos: cp });
        else g.loadArea('vila', 'start');
        for (const p of g.players) { p.fullHeal(g); p.special = 0; }
        yield C.wait(0.2);
        yield g.fadeTo(0, 0.6);
        g.toast('De volta à Pedra de Retorno.', 2);
      }, this, { name: 'respawn' });
    }

    // ============================================================ Memórias
    startMemory(id, obj) {
      const def = G.MemoryDefs[id];
      if (!def) return;
      const g = this;
      if (def.scene) {
        this.co.start(function* () {
          G.Audio.sfx('memory');
          g.letterbox(true);
          g.memoryOverlay = 0.01;
          yield C.until(() => (g.memoryOverlay = Math.min(1, g.memoryOverlay + 0.03)) >= 1);
          const prevMusic = G.Audio.currentName;
          G.Audio.playMusic('memory', 1);
          yield g.titleCard('MEMÓRIA', def.when.toUpperCase(), 2.2);
          yield g.say(def.lines);
          yield C.until(() => (g.memoryOverlay = Math.max(0, g.memoryOverlay - 0.03)) <= 0);
          g.memoryOverlay = 0;
          g.letterbox(false);
          G.Audio.playMusic(prevMusic, 1);
          g.memories.add(id);
          g.toast('Memória recuperada: ' + def.title, 3);
          g.addPoints(1);
          g.save();
        }, this, { name: 'memory' });
        return;
      }
      this.co.start(function* () {
        G.Audio.sfx('memory');
        g.letterbox(true);
        yield g.fadeTo(1, 1.2, '#fff8e8');
        g.present = { area: g.level.id, level: g.level, entities: g.entities, p: g.players.map((p) => ({ x: p.x, y: p.y, dir: p.dir })) };
        g.memBackup = { spells: g.unlockedSpells.slice(), spell: g.players[0].spell };
        g.inMemory = id;
        g.players[1].young = true;
        g.loadArea(def.area, 'start', { silent: true });
        yield C.wait(0.3);
        g.card = { text: 'MEMÓRIA', sub: def.when.toUpperCase(), t: 0, dur: 2.8, white: true };
        yield C.until(() => !g.card);
        g.letterbox(false);
        yield g.fadeTo(0, 1, '#fff8e8');
        G.HUD.showArea(def.title);
        const s = G.Areas[def.area].scripts && G.Areas[def.area].scripts.start;
        if (s) g.co.start(s, g, { name: 'memoryScript', blocking: false });
      }, this, { name: 'memory' });
    }
    endMemory() {
      const g = this;
      const id = this.inMemory;
      const def = G.MemoryDefs[id];
      this.co.start(function* () {
        yield g.fadeTo(1, 1.2, '#fff8e8');
        g.inMemory = null;
        g.players[1].young = false;
        g.restoreMemBackup();
        g.memories.add(id);
        const pr = g.present;
        g.restorePresent(pr);
        for (const p of g.players) p.fullHeal(g);
        yield C.wait(0.4);
        yield g.fadeTo(0, 1.2, '#fff8e8');
        g.fade.color = '#000';
        g.toast('Memória recuperada: ' + def.title, 3.5);
        const s = G.Areas[pr.area].scripts && G.Areas[pr.area].scripts['afterMemory_' + id];
        if (s) g.co.start(s, g, { name: 'afterMemory', blocking: false });
        g.save();
      }, this, { name: 'memory' });
    }

    // volta ao presente sem recarregar a área (inimigos derrotados continuam derrotados)
    restorePresent(pr) {
      this.level = pr.level;
      this.entities = pr.entities.filter((e) => !(e instanceof G.Combat.Projectile));
      this.particles.clear();
      this.bossBar = null;
      this.camera.setBounds(this.level.pw, this.level.ph);
      this.camera.focus = null;
      this.players.forEach((p, i) => {
        p.state = 'normal'; p.stateT = 0; p.kvx = 0; p.kvy = 0; p.bubbleText = null; p.cancelActions(this);
        p.x = pr.p[i].x; p.y = pr.p[i].y; p.dir = pr.p[i].dir; p.lastSafe = { x: p.x, y: p.y }; p.invuln = 1;
      });
      this.camera.snap(this.players);
      const def = this.level.def;
      G.Audio.playMusic(def.music, 1.2);
      G.Audio.setAmbience(def.ambience || null);
      this.inCombat = false;
      this.present = null;
    }

    restoreMemBackup() {
      if (!this.memBackup) return;
      this.unlockedSpells = this.memBackup.spells;
      if (this.players[0]) this.players[0].spell = this.unlockedSpells.includes(this.memBackup.spell) ? this.memBackup.spell : this.unlockedSpells[0];
      this.memBackup = null;
    }

    onEnemyKilled(e) {
      this.stats.kills++;
      if (e.type) this.bestiary[e.type] = (this.bestiary[e.type] || 0) + 1;
      if (e.type === 'greywolf') {
        this.spawnPickup('presa', e.x, e.y, { flag: 'presa_lobo' });
        this.setFlag('lobo_dead', true);
      }
      const s = this.level.def.scripts && this.level.def.scripts.onKill;
      if (s) s(this, e);
    }

    // ============================================================ Atualização
    update(dt) {
      this.time += dt;
      // FPS
      this.fpsT += dt; this.fpsN++;
      if (this.fpsT >= 0.5) { this.fps = Math.round(this.fpsN / this.fpsT); this.fpsT = 0; this.fpsN = 0; }
      if (G.Input.menu.debug) G.debug = !G.debug;

      // fades
      const f = this.fade;
      f.a = U.approach(f.a, f.target, dt * f.speed);
      if (this.flash.a > 0) this.flash.a = Math.max(0, this.flash.a - dt * (this.flash.decay || 3));
      this.letter = U.approach(this.letter, this.letterTarget, dt * 3);
      if (this.card) { this.card.t += dt; if (this.card.t > this.card.dur) this.card = null; }
      for (const t of this.toasts) t.t -= dt;
      this.toasts = this.toasts.filter((t) => t.t > 0);

      if (this.state === 'title') {
        this.title.update(dt, this);
        this.ui.update(dt, this);
        return;
      }

      // pausa
      if (G.Input.menu.pause && !this.ui.open && !this.dialogue.active && !this.transitioning && !this.co.blocking) { this.ui.openPause(this); return; }
      if (G.Input.menu.soloSwap && G.Input.solo && !this.ui.open && !this.co.blocking) { const prev = G.Input.soloActive; G.Input.soloActive = 1 - prev; this.ai.onSwap(this, prev); G.Audio.sfx('ui'); }
      if (this.ui.open) { this.ui.update(dt, this); return; }

      this.playTime += dt;
      if (this.inputCooldownT > 0) this.inputCooldownT -= dt;
      this.dialogue.update(dt, this);
      this.co.update(dt, this);

      if (this.hitstopT > 0) { this.hitstopT -= dt; this.camera.update(dt, this.players); return; }

      // entradas dos jogadores (modo solo: IA no outro)
      this.players.forEach((p, i) => {
        if (G.Input.solo && G.Input.soloActive !== i) p.input = this.ai.think(p, this, dt);
        else p.input = null;
      });

      // listas auxiliares
      this.solids = this.entities.filter((e) => !e.dead && (e.solid || e.blocksProjectiles));
      this.interactables = this.entities.filter((e) => !e.dead && e.canInteract);
      // jogador caído pode ser "interagido" pelo outro: tratado no Character

      for (const p of this.players) p.update(dt, this);
      if (!this.inputLocked()) this.applyWind(dt);
      this.stasisList = this.entities.filter((e) => e instanceof G.ObjectTypes.stasis && !e.dead);
      const list = this.entities;
      // durante cutscenes os inimigos e projéteis ficam em pausa (exceto animações de chefe)
      const freeze = this.co.blocking && !this.transitioning;
      for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (e.dead) continue;
        const proj = e instanceof G.Combat.Projectile;
        if (freeze && (e.isEnemy || proj)) {
          if (e.boss && ['dying', 'transition', 'roar', 'dormant', 'intro'].includes(e.state)) e.update(dt, this);
          else e.animT = (e.animT || 0) + dt;
          continue;
        }
        // Estase: inimigos e projéteis inimigos dentro da bolha andam devagar
        if (this.stasisList.length && (e.isEnemy || (proj && e.team === 'enemy'))) {
          const k = this.stasisAt(e.x, e.y);
          e.slowK = k;
          e.update(dt * k, this);
          continue;
        }
        e.slowK = 1;
        e.update(dt, this);
      }
      this.entities = this.entities.filter((e) => !e.dead);
      this.level.update(dt, this);
      if (this.level.def.onUpdate) this.level.def.onUpdate(this, dt);
      this.tauntT = Math.max(0, this.tauntT - dt);

      // gatilhos e saídas
      if (!this.inputLocked()) this.checkZones();
      this.updateCombatMusic(dt);
      this.ambientFx(dt);

      this.particles.update(dt);
      const bb = this.bossBar;
      this.camera.extra = bb && !bb.dead ? { x: bb.x, y: bb.y - 24 } : null;
      this.camera.update(dt, this.players);
      G.HUD.update(dt, this);
    }

    // fator de tempo em um ponto (bolhas de Estase)
    stasisAt(x, y) {
      const l = this.stasisList || [];
      for (const b of l) if (!b.dead && b.contains(x, y)) return this.has('estase_longa') ? 0.2 : 0.28;
      return 1;
    }

    // Vento: empurra (Lirien é leve; Aldren, pesado). Com o escudo erguido contra
    // o vento, o Aldren não se move — e quem estiver logo atrás dele fica protegido.
    applyWind(dt) {
      const winds = this.level.def.winds;
      if (!winds || !winds.length) return;
      const [li, al] = this.players;
      for (const p of this.players) {
        if (!p || p.isDown || p.state === 'flight' || p.carried) continue;
        for (const w of winds) {
          if (w.cond && !w.cond(this)) continue;
          const r = { x: w.x * TS, y: w.y * TS, w: w.w * TS, h: w.h * TS };
          if (!U.pointInRect(p.x, p.y - 2, r)) continue;
          const pulse = w.gust ? (Math.sin(this.time * (w.gustSpeed || 1.4)) > 0.2 ? 1 : 0.15) : 1;
          const f = (w.force || 90) * pulse;
          const wd = U.norm(w.dx, w.dy);
          let k = p.kind === 'mage' ? 1 : 0.38;
          // escudo contra o vento
          const shieldUp = al && al.blocking && !al.isDown && (al.fx * -wd.x + al.fy * -wd.y) > 0.7;
          if (p === al && shieldUp) k = 0;
          if (p === li && shieldUp) {
            // "sombra" do escudo: um cone atrás do Aldren, no sentido do vento
            const rx = li.x - al.x, ry = li.y - al.y;
            const along = rx * wd.x + ry * wd.y, side = Math.abs(rx * -wd.y + ry * wd.x);
            const reach = this.has('escudo_vento') ? 80 : 58;
            if (along > -4 && along < reach && side < 12 + along * 0.3) k = 0;
          }
          if (k > 0) p.tryMove(this, wd.x * f * k * dt, wd.y * f * k * dt);
        }
      }
      // partículas do vento dentro da tela
      const cam = this.camera;
      for (const w of winds) {
        if (w.cond && !w.cond(this)) continue;
        const pulse = w.gust ? (Math.sin(this.time * (w.gustSpeed || 1.4)) > 0.2 ? 1 : 0.15) : 1;
        if (Math.random() < 6 * dt * pulse) {
          const x = w.x * TS + Math.random() * w.w * TS, y = w.y * TS + Math.random() * w.h * TS;
          if (!cam.inView(x, y, 20)) continue;
          const wd = U.norm(w.dx, w.dy);
          for (let i = 0; i < 5; i++) this.particles.add({ x: x - wd.x * i * 3, y: y - wd.y * i * 3 - 6, vx: wd.x * (w.force || 90) * 1.6, vy: wd.y * (w.force || 90) * 1.6, life: 0.45, color: i ? 'rgba(232,240,255,0.6)' : '#ffffff', drag: 0 });
        }
      }
    }

    checkZones() {
      const ps = this.players.filter((p) => p && !p.isDown);
      for (const t of this.level.triggers) {
        if (t.fired) continue;
        if (t.flag && this.flag(t.flag)) { t.fired = true; continue; }
        if (ps.some((p) => U.pointInRect(p.x, p.y - 2, t))) {
          // dispara todas as zonas do mesmo gatilho
          for (const o of this.level.triggers) if (o.name === t.name) o.fired = true;
          if (t.flag) this.setFlag(t.flag, true);
          const fn = this.level.def.triggers && this.level.def.triggers[t.name];
          if (fn) fn(this);
          else if (G.Banter[t.name]) this.banter(t.name);
        }
      }
      for (const ex of this.level.exits) {
        const inside = ps.filter((p) => U.pointInRect(p.x, p.y - 2, ex));
        if (!inside.length) continue;
        const other = this.players.find((p) => !inside.includes(p));
        if (other) {
          // o parceiro precisa estar perto E do mesmo lado (sem portão/parede no meio)
          let ok = !other.isDown && U.dist(other.x, other.y, inside[0].x, inside[0].y) <= 90;
          if (ok) {
            if (!this._reachCache || this.time - this._reachCache.t > 0.25) {
              this._reachCache = { t: this.time, v: this.reachable(other.x, other.y, inside[0].x, inside[0].y, 6) };
            }
            ok = this._reachCache.v;
          }
          if (!ok) {
            if (!this._waitMsgT || this.time - this._waitMsgT > 3) {
              this._waitMsgT = this.time;
              this.bubble(inside[0], other.isDown ? 'Não vou sem você! Levanta!' : 'Vem comigo!', 1.6);
            }
            continue;
          }
        }
        this.changeArea(ex.to, ex.spawn);
        return;
      }
    }

    updateCombatMusic(dt) {
      const def = this.level.def;
      if (def.combatMusic === false || this.inMemory || this.bossBar) return;
      let fighting = false;
      for (const e of this.entities) {
        if (!e.isEnemy || e.dead || !e.aggro) continue;
        for (const p of this.players) if (U.dist(e.x, e.y, p.x, p.y) < 170) { fighting = true; break; }
        if (fighting) break;
      }
      if (fighting) { this.combatT = 4; if (!this.inCombat) { this.inCombat = true; G.Audio.playMusic('combat', 0.8); } }
      else if (this.inCombat) {
        this.combatT -= dt;
        if (this.combatT <= 0) { this.inCombat = false; G.Audio.playMusic(def.music, 2); }
      }
    }

    ambientFx(dt) {
      const kind = this.level.def.ambient;
      if (!kind) return;
      const cam = this.camera;
      const rate = { leaves: 2, dust: 3, fireflies: 1.5, sparkles: 4, embers: 3, petals: 2 }[kind] || 1;
      if (Math.random() < rate * dt) {
        const x = cam.x + Math.random() * W, y = cam.y + Math.random() * H;
        if (kind === 'leaves') this.particles.add({ x, y: cam.y - 4, vx: U.rand(5, 20), vy: U.rand(12, 22), life: 8, color: U.pick(['#6aa04a', '#a8b84a', '#c8a03a']), wobble: 20, fade: false });
        if (kind === 'dust') this.particles.add({ x, y, vx: U.rand(-3, 3), vy: U.rand(-3, 3), life: 4, color: '#c8c0b0', fade: true });
        if (kind === 'fireflies') this.particles.add({ x, y, vx: U.rand(-6, 6), vy: U.rand(-6, 6), life: 4, color: '#e8f0a0', glow: true, wobble: 10, flicker: true });
        if (kind === 'sparkles') this.particles.add({ x, y, vy: U.rand(-12, -4), life: 2.5, color: U.pick(['#8ae8ff', '#c8a8ff', '#ffffff']), glow: true });
        if (kind === 'petals') this.particles.add({ x, y: cam.y - 4, vx: U.rand(-10, 10), vy: U.rand(10, 18), life: 9, color: U.pick(['#ffd0f0', '#ffffff', '#ffb0d0']), wobble: 16, fade: false });
      }
    }

    // ============================================================ Renderização
    draw() {
      const ctx = this.ctx;
      ctx.imageSmoothingEnabled = false;
      if (this.state === 'title') {
        this.title.draw(ctx, this);
        this.ui.draw(ctx, this);
        this.drawFade(ctx);
        return;
      }
      const w = this.wctx, cam = this.camera;
      this.lighting.clear();
      w.fillStyle = '#07060b'; w.fillRect(0, 0, W, H);
      this.level.drawGround(w, cam, this);
      this.particles.draw(w, cam, true);
      // ordenação por profundidade
      const drawList = [];
      for (const e of this.entities) {
        if (e.dead) continue;
        if (!cam.inView(e.x, e.y, e.r ? e.r + 40 : 80)) continue;
        drawList.push(e);
      }
      drawList.sort((a, b) => (a.layer - b.layer) || (a.sortY - b.sortY));
      const ground = drawList.filter((e) => e.layer < 0);
      const rest = drawList.filter((e) => e.layer >= 0).concat(this.players).sort((a, b) => (a.layer > 0 ? 1e5 : 0) + a.sortY - ((b.layer > 0 ? 1e5 : 0) + b.sortY));
      for (const e of ground) e.draw(w, cam, this);
      for (const e of rest) e.draw(w, cam, this);
      for (const e of this.entities) if (e.drawBeam && !e.dead) e.drawBeam(w, cam, this);
      this.particles.draw(w, cam, false);
      // luz ambiente
      const def = this.level.def;
      this.lighting.render(w, cam, this.level.darkness, def.darkColor);
      if (def.rays) this.drawRays(w);
      if (def.tint) { w.globalCompositeOperation = 'multiply'; w.fillStyle = def.tint; w.fillRect(0, 0, W, H); w.globalCompositeOperation = 'source-over'; }
      w.drawImage(this.vignette, 0, 0);
      // sobreposições do mundo
      for (const p of this.players) p.drawOverlay(w, cam, this);
      G.HUD.drawPrompts(w, this);
      this.particles.drawTexts(w, cam);
      for (const p of this.players) G.Bubbles.draw(w, this, p);
      if (G.debug) this.drawDebug(w);

      // composição final (memória = sépia)
      const mem = this.inMemory || this.memoryOverlay > 0;
      if (mem && 'filter' in ctx) {
        const k = this.inMemory ? 1 : this.memoryOverlay;
        ctx.filter = `sepia(${0.75 * k}) saturate(${1 - 0.2 * k}) brightness(${1 + 0.05 * k})`;
        ctx.drawImage(this.world, 0, 0);
        ctx.filter = 'none';
      } else ctx.drawImage(this.world, 0, 0);
      if (mem) {
        const k = this.inMemory ? 1 : this.memoryOverlay;
        ctx.globalAlpha = 0.12 * k; ctx.fillStyle = '#fff0d0'; ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 0.6 * k; ctx.drawImage(this.vignette, 0, 0); ctx.globalAlpha = 1;
        // grãos de filme
        for (let i = 0; i < 40 * k; i++) { ctx.fillStyle = Math.random() < 0.5 ? 'rgba(255,240,210,0.25)' : 'rgba(60,40,20,0.2)'; ctx.fillRect((Math.random() * W) | 0, (Math.random() * H) | 0, 1, 1); }
      }
      // tarjas de cinema
      if (this.letter > 0.01) {
        const bh = Math.round(22 * this.letter);
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
      }
      if (!this.inCutscene() || this.ui.open) G.HUD.draw(ctx, this);
      else G.HUD.drawToasts(ctx, this);
      this.dialogue.draw(ctx, this);
      if (this.card) this.drawCard(ctx);
      this.ui.draw(ctx, this);
      if (this.flash.a > 0) { ctx.globalAlpha = this.flash.a; ctx.fillStyle = this.flash.color; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      this.drawFade(ctx);
      if (this.settings.showFps || G.debug) G.Font.draw(ctx, this.fps + ' fps', W - 4, H - 12, '#7aff8a', { align: 'right', shadow: true });
    }
    drawFade(ctx) {
      if (this.fade.a > 0.001) { ctx.globalAlpha = this.fade.a; ctx.fillStyle = this.fade.color; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    }
    drawCard(ctx) {
      const c = this.card;
      const a = Math.min(1, c.t * 2, (c.dur - c.t) * 2);
      ctx.globalAlpha = a;
      const col = c.white ? '#5a4a30' : '#f2d98c';
      ctx.fillStyle = c.white ? 'rgba(255,248,232,0.0)' : 'rgba(0,0,0,0.35)'; ctx.fillRect(0, H / 2 - 30, W, 60);
      G.Font.draw(ctx, c.text, W / 2, H / 2 - 18, col, { align: 'center', scale: 2, shadow: !c.white });
      if (c.sub) G.Font.draw(ctx, c.sub, W / 2, H / 2 + 8, c.white ? '#7a6a50' : '#c8c0d8', { align: 'center', shadow: !c.white });
      const lw = 120;
      ctx.fillStyle = col; ctx.fillRect(W / 2 - lw / 2, H / 2 + 22, lw, 1);
      ctx.globalAlpha = 1;
    }
    drawRays(w) {
      w.globalCompositeOperation = 'lighter';
      const t = this.time;
      for (let i = 0; i < 4; i++) {
        const x0 = ((i * 140 - this.camera.x * 0.3) % (W + 160)) - 40;
        w.globalAlpha = 0.05 + Math.sin(t * 0.5 + i) * 0.02;
        w.fillStyle = '#fff6c8';
        for (let j = 0; j < H; j += 2) w.fillRect(Math.round(x0 + j * 0.5), j, 18, 2);
      }
      w.globalAlpha = 1;
      w.globalCompositeOperation = 'source-over';
    }
    drawDebug(w) {
      const cam = this.camera;
      w.globalAlpha = 0.6;
      for (const e of this.entities.concat(this.players)) {
        const b = e.box; w.strokeStyle = e.solid ? '#ff0' : '#0ff';
        w.strokeRect(Math.round(b.x - cam.rx) + 0.5, Math.round(b.y - cam.ry) + 0.5, b.w, b.h);
        if (e.isEnemy || e.isPlayer) { const h = e.hurtBox; w.strokeStyle = '#f0f'; w.strokeRect(Math.round(h.x - cam.rx) + 0.5, Math.round(h.y - cam.ry) + 0.5, h.w, h.h); }
      }
      for (const t of this.level.exits) { w.strokeStyle = '#0f0'; w.strokeRect(t.x - cam.rx + 0.5, t.y - cam.ry + 0.5, t.w, t.h); }
      for (const t of this.level.triggers) { w.strokeStyle = '#f80'; w.strokeRect(t.x - cam.rx + 0.5, t.y - cam.ry + 0.5, t.w, t.h); }
      w.globalAlpha = 1;
      const p = this.players[0];
      G.Font.draw(w, `${this.level.id} p1 ${Math.floor(p.x / 16)},${Math.floor(p.y / 16)} ents ${this.entities.length}`, 4, H - 24, '#7aff8a', { shadow: true });
    }
  }
  G.Game = Game;
})();
