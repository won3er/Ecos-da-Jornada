// Combate: aplicação de dano em área, projéteis (com reflexo/prisma) e efeitos visuais.
(function () {
  const U = G.U, P = G.Pixel;

  const FX = {
    stars(ctx, x, y, t) {
      for (let i = 0; i < 3; i++) {
        const a = t * 5 + (i * Math.PI * 2) / 3;
        const sx = Math.round(x + Math.cos(a) * 7), sy = Math.round(y + Math.sin(a) * 2);
        ctx.fillStyle = '#ffe680'; ctx.fillRect(sx - 1, sy, 3, 1); ctx.fillRect(sx, sy - 1, 1, 3);
      }
    },
    // arco de espada em pixels
    slash(ctx, x, y, angle, prog, radius, color, width, rev) {
      const span = 2.2;
      const a0 = angle - span / 2, steps = 22;
      const head = prog * steps;
      for (let i = 0; i < steps; i++) {
        if (i > head || i < head - 12) continue;
        const a = rev ? a0 + span - (i / steps) * span : a0 + (i / steps) * span;
        const fade = 1 - (head - i) / 12;
        ctx.globalAlpha = Math.max(0, fade);
        for (let w = 0; w < width; w++) {
          const r = radius - w * 2;
          ctx.fillStyle = w === 0 ? '#ffffff' : color;
          ctx.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r * 0.8), 2, 2);
        }
      }
      ctx.globalAlpha = 1;
    },
    iceBlock(ctx, x, y, w, h, t) {
      ctx.globalAlpha = 0.55; ctx.fillStyle = '#bfe4f6'; ctx.fillRect(Math.round(x - w / 2), Math.round(y - h), w, h);
      ctx.globalAlpha = 0.9; ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(x - w / 2 + 1), Math.round(y - h + 1), 2, h - 4); ctx.fillRect(Math.round(x - w / 2), Math.round(y - h), w, 1);
      ctx.fillStyle = '#8ac0e0'; ctx.fillRect(Math.round(x - w / 2), Math.round(y - 1), w, 1);
      ctx.globalAlpha = 1;
    },
  };
  G.FX = FX;

  const Combat = {};

  // Alvos de um ataque do time 'player': inimigos + objetos que reagem
  Combat.playerTargets = (g) => g.entities.filter((e) => !e.dead && (e.isEnemy || e.onHit || e.isTarget));

  // Aplica dano a tudo que sobrepõe a área (retângulo). Retorna lista de atingidos.
  Combat.hitRect = function (g, rect, hit, already) {
    const hits = [];
    for (const e of Combat.playerTargets(g)) {
      if (already && already.has(e)) continue;
      const hb = e.hurtBox;
      if (!U.rectsOverlap(rect, hb)) continue;
      let ok = false;
      if (e.isEnemy || e.isTarget) ok = e.takeHit(Object.assign({}, hit), g);
      else if (e.onHit) ok = e.onHit(hit.kind, hit.src, g);
      if (ok !== false) { hits.push(e); if (already) already.add(e); }
    }
    return hits;
  };
  Combat.hitCircle = function (g, x, y, r, hit, already) {
    const hits = [];
    for (const e of Combat.playerTargets(g)) {
      if (already && already.has(e)) continue;
      const hb = e.hurtBox;
      const cx = U.clamp(x, hb.x, hb.x + hb.w), cy = U.clamp(y, hb.y, hb.y + hb.h);
      if (U.dist2(x, y, cx, cy) > r * r) continue;
      let ok = false;
      if (e.isEnemy || e.isTarget) ok = e.takeHit(Object.assign({}, hit), g);
      else if (e.onHit) ok = e.onHit(hit.kind, hit.src, g);
      if (ok !== false) { hits.push(e); if (already) already.add(e); }
    }
    return hits;
  };
  // Ataque inimigo em área contra jogadores
  Combat.hitPlayersCircle = function (g, x, y, r, hit) {
    const res = [];
    for (const p of g.players) {
      if (!p || p.isDown) continue;
      const hb = p.hurtBox;
      const cx = U.clamp(x, hb.x, hb.x + hb.w), cy = U.clamp(y, hb.y, hb.y + hb.h);
      if (U.dist2(x, y, cx, cy) <= r * r) res.push({ p, result: p.takeHit(Object.assign({}, hit), g) });
    }
    return res;
  };

  // ---------------------------------------------------------------- Projétil
  class Projectile extends G.Entity {
    constructor(o) {
      super({ x: o.x, y: o.y, w: 4, h: 4 });
      Object.assign(this, {
        vx: 0, vy: 0, team: 'player', dmg: 5, kind: 'bolt', r: 3, life: 1.5, pierce: false,
        color: '#8ae8ff', color2: '#ffffff', homing: 0, owner: null, height: 10, stun: 0, kb: 60,
        trail: true, light: 30, size: 2, reflectable: true, bigOrb: false, accel: 0,
      }, o);
      this.hitSet = new Set();
      this.t = 0;
      this.layer = 1;
    }
    get sortY() { return this.y + 4; }
    update(dt, g) {
      this.t += dt;
      this.life -= dt;
      if (this.lift > 0) this.lift = Math.max(0, this.lift - dt * 110);
      if (this.life <= 0) { this.die(g); return; }
      if (this.homing && this.team === 'player') {
        let best = null, bd = 160;
        for (const e of g.entities) if (e.isEnemy && !e.dead && !e.intangible) { const d = U.dist(this.x, this.y, e.x, e.y - 8); if (d < bd) { bd = d; best = e; } }
        if (best) this.steer(best.x, best.y - 2, dt);
      } else if (this.homing && this.team === 'enemy' && this.target && !this.target.isDown) {
        this.steer(this.target.x, this.target.y, dt);
      }
      if (this.accel) { const sp = Math.hypot(this.vx, this.vy), ns = sp + this.accel * dt; this.vx *= ns / sp; this.vy *= ns / sp; }
      this.x += this.vx * dt; this.y += this.vy * dt;
      // rastro
      if (this.trail && Math.random() < 0.8) g.particles.add({ x: this.x + U.rand(-1, 1), y: this.y - this.height + U.rand(-1, 1), vx: -this.vx * 0.1, vy: -this.vy * 0.1, life: 0.25, color: U.pick([this.color, this.color2]), glow: true, size: this.bigOrb ? 2 : 1 });
      // paredes (a Chama Estelar derrete gelo)
      if (g.level.blocksShot(this.x, this.y)) {
        if (this.kind === 'fire' && this.team === 'player') g.level.melt(Math.floor(this.x / 16), Math.floor(this.y / 16), g);
        this.die(g); return;
      }
      const px = this.x, py = this.y - this.height;
      // objetos sólidos que bloqueiam projéteis
      for (const e of g.solids) {
        if (e.dead || !e.blocksProjectiles || e === this.owner) continue;
        const hb = e.hurtBox;
        if (U.pointInRect(px, py, { x: hb.x - this.r, y: hb.y - this.r, w: hb.w + this.r * 2, h: hb.h + this.r * 2 })) {
          if (this.team === 'player' && e.onHit) e.onHit(this.kind, this.owner, g);
          this.die(g); return;
        }
      }
      if (this.team === 'player') {
        // Prisma: bolt atinge o escudo erguido do Aldren -> se divide
        const al = g.players[1];
        if (this.kind === 'bolt' && al && al.blocking && !al.isDown && this.owner && this.owner.kind === 'mage') {
          const sb = al.shieldBox();
          if (U.pointInRect(px, py, sb)) { al.prism(this, g); this.dead = true; return; }
        }
        for (const e of Combat.playerTargets(g)) {
          if (this.hitSet.has(e) || e.dead || e.blocksProjectiles) continue;
          if (this.kind === 'reflected_big' && !e.boss) continue;
          if (this.onlyBoss && !e.boss) continue;
          if (e.flying === false && e.isEnemy && e.underground) continue;
          const hb = e.hurtBox;
          if (U.pointInRect(px, py, { x: hb.x - this.r, y: hb.y - this.r, w: hb.w + this.r * 2, h: hb.h + this.r * 2 })) {
            this.hitSet.add(e);
            const hit = { dmg: this.dmg, kind: this.kind, src: this.owner, magic: true, dir: U.norm(this.vx, this.vy), kb: this.kb, stun: this.stun, proj: this, burn: this.burn };
            let ok;
            if (e.isEnemy || e.isTarget) ok = e.takeHit(hit, g);
            else if (e.onHit) ok = e.onHit(this.kind, this.owner, g);
            if (ok !== false && !this.pierce) { this.die(g); return; }
          }
        }
      } else {
        // Escudo do Aldren intercepta antes de atingir quem está atrás
        const al = g.players[1];
        if (al && al.blocking && !al.isDown) {
          const sb = al.shieldBox();
          if (U.pointInRect(px, py, sb)) { if (al.blockProjectile(this, g)) return; }
        }
        for (const p of g.players) {
          if (!p || p.isDown || this.hitSet.has(p)) continue;
          const hb = p.hurtBox;
          if (U.pointInRect(px, py, { x: hb.x - this.r, y: hb.y - this.r, w: hb.w + this.r * 2, h: hb.h + this.r * 2 })) {
            this.hitSet.add(p);
            const res = p.takeHit({ dmg: this.dmg, kind: 'proj', src: this.owner, dir: U.norm(this.vx, this.vy), kb: this.kb, proj: this, chill: this.chill }, g);
            if (res === 'reflected') return;
            if (res !== 'dodged') { this.die(g); return; }
          }
        }
      }
    }
    steer(tx, ty, dt) {
      const want = U.norm(tx - this.x, ty - this.y);
      const sp = Math.hypot(this.vx, this.vy);
      const cur = U.norm(this.vx, this.vy);
      const k = Math.min(1, this.homing * dt);
      const nx = U.lerp(cur.x, want.x, k), ny = U.lerp(cur.y, want.y, k);
      const n = U.norm(nx, ny);
      this.vx = n.x * sp; this.vy = n.y * sp;
    }
    // Converte em projétil do jogador (parry/reflexo)
    reflect(g, by, mult = 2) {
      this.team = 'player'; this.owner = by;
      this.vx = -this.vx * 1.3; this.vy = -this.vy * 1.3;
      this.dmg *= mult; this.hitSet.clear(); this.life = 2;
      this.kind = this.bigOrb ? 'reflected_big' : (this.onReflectKind || 'bolt');
      this.color = '#ffe680'; this.color2 = '#ffffff';
      this.homing = this.bigOrb ? 0 : 2;
      if ((this.bigOrb || this.onlyBoss) && g.boss && !g.boss.dead) { const d = U.norm(g.boss.x - this.x, g.boss.y - 10 - this.y); const sp = Math.hypot(this.vx, this.vy); this.vx = d.x * sp; this.vy = d.y * sp; this.homing = 0; }
    }
    die(g) {
      if (this.dead) return;
      this.dead = true;
      g.particles.burst(this.x, this.y - this.height, this.bigOrb ? 24 : 8, { colors: [this.color, this.color2], speed: this.bigOrb ? 80 : 40, life: 0.35, glow: true });
      if (this.onDie) this.onDie(g, this);
    }
    draw(ctx, cam, g) {
      const x = Math.round(this.x - cam.rx), y = Math.round(this.y - this.height - (this.lift || 0) - cam.ry);
      ctx.globalAlpha = 0.3; P.ellipse(ctx, x, Math.round(this.y - cam.ry), this.bigOrb ? 6 : 2, 1, '#000'); ctx.globalAlpha = 1;
      const s = this.size;
      if (this.bigOrb) {
        const pulse = Math.round(Math.sin(this.t * 10));
        P.circle(ctx, x, y, 7 + pulse, this.color);
        P.circle(ctx, x, y, 5, this.color2);
        P.circle(ctx, x - 1, y - 1, 2, '#ffffff');
      } else if (this.kind === 'arrow') {
        const n = U.norm(this.vx, this.vy);
        P.line(ctx, x - n.x * 5, y - n.y * 5, x + n.x * 2, y + n.y * 2, '#c8b89a');
        ctx.fillStyle = '#e8e8f0'; ctx.fillRect(x + Math.round(n.x * 2), y + Math.round(n.y * 2), 1, 1);
      } else if (this.kind === 'fire') {
        const fl = Math.floor(this.t * 20) % 2;
        P.circle(ctx, x, y, 4 + fl, '#c8401a'); P.circle(ctx, x, y, 3, '#ff8a3a'); P.circle(ctx, x - 1, y - 1, 2, '#ffe680');
        if (Math.random() < 0.6) g.particles.add({ x: this.x + U.rand(-2, 2), y: this.y - this.height + U.rand(-2, 2), vy: -20, life: 0.3, color: U.pick(['#ff8a3a', '#ffd84a']), glow: true });
      } else if (this.kind === 'icicle') {
        const n = U.norm(this.vx, this.vy);
        P.line(ctx, x - n.x * 5, y - n.y * 5, x + n.x * 3, y + n.y * 3, '#a8dcf4');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(x + Math.round(n.x * 3), y + Math.round(n.y * 3), 1, 1);
      } else if (this.kind === 'rock') {
        P.circle(ctx, x, y, 4, '#5a5450'); P.circle(ctx, x - 1, y - 1, 2, '#8a847a');
      } else {
        ctx.fillStyle = this.color; ctx.fillRect(x - s, y - s, s * 2 + 1, s * 2 + 1);
        ctx.fillStyle = this.color2; ctx.fillRect(x - s + 1, y - s + 1, s * 2 - 1, s * 2 - 1);
        if (this.kind === 'charged') { P.circle(ctx, x, y, 4 + (Math.floor(this.t * 20) % 2), this.color); P.circle(ctx, x, y, 2, '#ffffff'); }
      }
      if (this.light) g.lighting.add(this.x, this.y - this.height, this.light, 0.8, this.color, 0.3);
    }
  }
  Combat.Projectile = Projectile;

  G.Combat = Combat;
})();
