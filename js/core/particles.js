// Sistema de partículas em pixel + textos flutuantes (dano, "PARRY!", combos).
(function () {
  const U = G.U;
  class Particles {
    constructor() { this.list = []; this.texts = []; this.rings = []; }
    clear() { this.list.length = 0; this.texts.length = 0; this.rings.length = 0; }

    add(o) {
      if (this.list.length > 900) this.list.shift();
      const p = Object.assign({
        x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, g: 0, drag: 0, life: 0.5, color: '#fff',
        size: 1, shrink: false, glow: false, back: false, flicker: false, wobble: 0,
      }, o);
      p.max = p.life;
      this.list.push(p);
      return p;
    }
    burst(x, y, n, opts) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = U.rand(opts.speedMin || 20, opts.speed || 60);
        const col = Array.isArray(opts.colors) ? U.pick(opts.colors) : (opts.color || '#fff');
        this.add({
          x: x + U.rand(-(opts.spread || 0), opts.spread || 0),
          y: y + U.rand(-(opts.spread || 0), opts.spread || 0),
          z: opts.z || 0,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * (opts.flat ? 0.6 : 1),
          vz: opts.up ? U.rand(opts.up * 0.5, opts.up) : 0,
          g: opts.g || 0, drag: opts.drag || 2,
          life: U.rand((opts.life || 0.5) * 0.6, opts.life || 0.5),
          color: col, size: opts.size || 1, shrink: opts.shrink, glow: opts.glow, flicker: opts.flicker,
        });
      }
    }
    ring(x, y, r0, r1, life, color, width = 1) {
      this.rings.push({ x, y, r0, r1, life, max: life, color, width });
    }
    text(x, y, str, color = '#fff', opts = {}) {
      this.texts.push({ x, y, str: String(str), color, life: opts.life || 0.8, max: opts.life || 0.8, vy: opts.vy || -28, big: !!opts.big });
    }

    update(dt) {
      for (const p of this.list) {
        p.life -= dt;
        const d = Math.max(0, 1 - p.drag * dt);
        p.vx *= d; p.vy *= d;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.g || p.vz) {
          p.vz -= p.g * dt; p.z += p.vz * dt;
          if (p.z < 0 && p.g) { p.z = 0; p.vz *= -0.3; p.vx *= 0.6; p.vy *= 0.6; }
        }
        if (p.wobble) p.x += Math.sin(p.life * 8) * p.wobble * dt;
      }
      this.list = this.list.filter((p) => p.life > 0);
      for (const t of this.texts) { t.life -= dt; t.y += t.vy * dt; t.vy *= 1 - 3 * dt; }
      this.texts = this.texts.filter((t) => t.life > 0);
      for (const r of this.rings) r.life -= dt;
      this.rings = this.rings.filter((r) => r.life > 0);
    }

    draw(ctx, cam, back) {
      const cx = cam.rx, cy = cam.ry;
      for (const p of this.list) {
        if (!!p.back !== !!back) continue;
        if (p.flicker && Math.random() < 0.3) continue;
        const t = p.life / p.max;
        let s = p.size;
        if (p.shrink) s = Math.max(1, Math.round(p.size * t));
        const x = Math.round(p.x - cx - s / 2), y = Math.round(p.y - p.z - cy - s / 2);
        if (p.glow) {
          ctx.globalAlpha = 0.35 * t;
          ctx.fillStyle = p.color;
          ctx.fillRect(x - 1, y - 1, s + 2, s + 2);
        }
        ctx.globalAlpha = p.fade === false ? 1 : Math.min(1, t * 2);
        ctx.fillStyle = p.color;
        ctx.fillRect(x, y, s, s);
      }
      ctx.globalAlpha = 1;
      if (!back) {
        for (const r of this.rings) {
          const t = 1 - r.life / r.max;
          const rad = U.lerp(r.r0, r.r1, U.easeOut(t));
          ctx.globalAlpha = 1 - t;
          G.Pixel.ring(ctx, Math.round(r.x - cx), Math.round(r.y - cy), Math.round(rad), r.color, r.width);
        }
        ctx.globalAlpha = 1;
      }
    }
    drawTexts(ctx, cam) {
      for (const t of this.texts) {
        const a = Math.min(1, t.life / t.max * 2.5);
        ctx.globalAlpha = a;
        const x = Math.round(t.x - cam.rx), y = Math.round(t.y - cam.ry);
        G.Font.draw(ctx, t.str, x, y, t.color, { align: 'center', shadow: true, scale: t.big ? 2 : 1 });
      }
      ctx.globalAlpha = 1;
    }
  }
  G.Particles = Particles;
})();
