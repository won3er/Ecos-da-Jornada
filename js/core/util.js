// Utilidades matemáticas e helpers gerais.
(function () {
  const U = {};

  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
  U.dist2 = (ax, ay, bx, by) => (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
  U.sign = (v) => (v > 0 ? 1 : v < 0 ? -1 : 0);
  U.approach = (v, target, step) => (v < target ? Math.min(v + step, target) : Math.max(v - step, target));
  U.angle = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);
  U.norm = (x, y) => {
    const l = Math.hypot(x, y);
    return l > 0 ? { x: x / l, y: y / l } : { x: 0, y: 0 };
  };
  U.rand = (a, b) => a + Math.random() * (b - a);
  U.randi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.chance = (p) => Math.random() < p;
  U.easeOut = (t) => 1 - (1 - t) * (1 - t);
  U.easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  // Hash determinístico por coordenada (variação de tiles)
  U.hash = (x, y, s = 0) => {
    let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    h = h ^ (h >>> 16);
    return (h >>> 0) / 4294967295;
  };

  // RNG com semente (para arte procedural estável)
  U.rng = (seed) => {
    let s = seed >>> 0 || 1;
    return () => {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return (s >>> 0) / 4294967296;
    };
  };

  U.rectsOverlap = (a, b) =>
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  U.pointInRect = (px, py, r) => px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h;

  // Direção cardinal a partir de vetor
  U.dirFromVec = (x, y, fallback) => {
    if (Math.abs(x) < 0.01 && Math.abs(y) < 0.01) return fallback || 'down';
    if (Math.abs(x) > Math.abs(y)) return x > 0 ? 'right' : 'left';
    return y > 0 ? 'down' : 'up';
  };
  U.DIRS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  // Cor hex -> rgba string
  U.rgba = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };
  U.mix = (h1, h2, t) => {
    const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
    const r = Math.round(U.lerp((a >> 16) & 255, (b >> 16) & 255, t));
    const g = Math.round(U.lerp((a >> 8) & 255, (b >> 8) & 255, t));
    const bl = Math.round(U.lerp(a & 255, b & 255, t));
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
  };
  U.shade = (hex, amt) => (amt >= 0 ? U.mix(hex, '#ffffff', amt) : U.mix(hex, '#000000', -amt));

  U.makeCanvas = (w, h) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return c;
  };

  U.formatTime = (sec) => {
    sec = Math.floor(sec);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const mm = String(m).padStart(2, '0'), ss = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  };

  // Quebra de linha para a fonte bitmap
  U.wrapText = (text, maxW, measure) => {
    const out = [];
    for (const para of String(text).split('\n')) {
      const words = para.split(' ');
      let line = '';
      for (const w of words) {
        const test = line ? line + ' ' + w : w;
        if (measure(test) > maxW && line) {
          out.push(line);
          line = w;
        } else line = test;
      }
      out.push(line);
    }
    return out;
  };

  G.U = U;
})();
