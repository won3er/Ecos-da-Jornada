// Entidade base + física de movimento com colisão contra tiles e entidades sólidas.
(function () {
  const U = G.U;
  let nextUid = 1;

  class Entity {
    constructor(o = {}) {
      this.uid = nextUid++;
      this.x = o.x || 0; this.y = o.y || 0;     // x = centro, y = base (pés)
      this.w = o.w || 10; this.h = o.h || 6;    // caixa de colisão dos pés
      this.hw = o.hw || this.w; this.hh = o.hh || 18; // caixa de dano (corpo)
      this.z = 0;
      this.id = o.id || null;
      this.solid = !!o.solid;
      this.dead = false;
      this.flying = false;
      this.blocksProjectiles = false;
      this.isEnemy = false; this.isPlayer = false;
      this.layer = 0;   // -1 = chão (desenhado antes), 0 = ordenado por y
      this.data = o;
    }
    get box() { return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }
    get hurtBox() { return { x: this.x - this.hw / 2, y: this.y - this.hh, w: this.hw, h: this.hh }; }
    get cx() { return this.x; }
    get cy() { return this.y - this.hh / 2; }
    get sortY() { return this.y; }
    update(dt, g) {}
    draw(ctx, cam, g) {}
    distTo(e) { return U.dist(this.x, this.y, e.x, e.y); }
  }

  // Testa se a caixa colide com o mundo (tiles + entidades sólidas)
  function blocked(g, box, mover) {
    const lv = g.level;
    const TS = G.TILE;
    const x0 = Math.floor(box.x / TS), x1 = Math.floor((box.x + box.w - 0.01) / TS);
    const y0 = Math.floor(box.y / TS), y1 = Math.floor((box.y + box.h - 0.01) / TS);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (lv.blocksAt(tx, ty, mover)) return true;
      }
    }
    for (const e of g.solids) {
      if (e === mover || e.dead || !e.solid) continue;
      if (mover && mover.ignoreSolid && mover.ignoreSolid(e)) continue;
      if (U.rectsOverlap(box, e.box)) return true;
    }
    return false;
  }

  // Move com separação de eixos e "deslize" em quinas (sensação boa de controle)
  function move(g, e, dx, dy) {
    let hitX = false, hitY = false;
    const stepMax = 4;
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / stepMax));
    const sx = dx / steps, sy = dy / steps;
    for (let i = 0; i < steps; i++) {
      if (sx) {
        const nb = e.box; nb.x += sx;
        if (!blocked(g, nb, e)) e.x += sx;
        else {
          hitX = true;
          // deslize em quina
          if (!sy && e.cornerSlide !== false) {
            for (const off of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5]) {
              const b2 = e.box; b2.x += sx; b2.y += off;
              if (!blocked(g, b2, e)) {
                const b3 = e.box; b3.y += Math.sign(off);
                if (!blocked(g, b3, e)) e.y += Math.sign(off) * 0.8;
                break;
              }
            }
          }
        }
      }
      if (sy) {
        const nb = e.box; nb.y += sy;
        if (!blocked(g, nb, e)) e.y += sy;
        else {
          hitY = true;
          if (!sx && e.cornerSlide !== false) {
            for (const off of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5]) {
              const b2 = e.box; b2.y += sy; b2.x += off;
              if (!blocked(g, b2, e)) {
                const b3 = e.box; b3.x += Math.sign(off);
                if (!blocked(g, b3, e)) e.x += Math.sign(off) * 0.8;
                break;
              }
            }
          }
        }
      }
    }
    return { hitX, hitY };
  }

  G.Entity = Entity;
  G.Physics = { blocked, move };
})();
