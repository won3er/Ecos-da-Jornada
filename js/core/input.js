// Sistema de entrada: teclado (2 jogadores no mesmo teclado) + até 2 gamepads.
// Cada jogador tem botões virtuais: attack, skill, act, swap.
(function () {
  const BIND = [
    { // Jogador 1 — Lirien
      up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'],
      attack: ['KeyJ'], skill: ['KeyK'], act: ['KeyL'], swap: ['KeyI', 'KeyU'],
    },
    { // Jogador 2 — Aldren
      up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'],
      attack: ['Digit1', 'Numpad1'], skill: ['Digit2', 'Numpad2'], act: ['Digit3', 'Numpad3'],
      swap: ['Digit4', 'Numpad4', 'Numpad5', 'Numpad0'],
    },
  ];
  const MENU = {
    confirm: ['Enter', 'NumpadEnter', 'Space', 'KeyJ', 'Digit1', 'Numpad1'],
    back: ['Escape', 'Backspace', 'KeyK', 'Digit2', 'Numpad2'],
    pause: ['Escape', 'KeyP'],
    soloSwap: ['Tab'],
  };
  const BUTTONS = ['attack', 'skill', 'act', 'swap'];

  const keys = new Set();
  const keysPressed = new Set();
  let anyPressed = false;

  const prevent = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab', 'Backspace']);

  window.addEventListener('keydown', (e) => {
    if (prevent.has(e.code)) e.preventDefault();
    if (!keys.has(e.code)) keysPressed.add(e.code);
    keys.add(e.code);
    anyPressed = true;
    if (G.Audio) G.Audio.unlock();
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => keys.clear());
  window.addEventListener('mousedown', () => { if (G.Audio) G.Audio.unlock(); });

  function blank() {
    const b = { mx: 0, my: 0 };
    for (const k of BUTTONS) b[k] = { down: false, pressed: false, released: false };
    return b;
  }

  const I = {
    solo: false,
    soloActive: 0,
    players: [blank(), blank()],
    raw: [blank(), blank()],
    prevDown: [{}, {}],
    menu: { up: false, down: false, left: false, right: false, confirm: false, back: false, pause: false, soloSwap: false },
    repeat: {},
    padPrev: [{}, {}],
    anyPressed: false,
    lastDevice: 'keyboard',
  };

  function keyDown(list) { return list.some((c) => keys.has(c)); }
  function keyPressed(list) { return list.some((c) => keysPressed.has(c)); }
  // segurado agora OU tocado desde o último quadro (toques muito rápidos não se perdem)
  function keyHeld(list) { return keyDown(list) || keyPressed(list); }

  function readPad(i) {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = pads && pads[i];
    if (!pad || !pad.connected) return null;
    const b = (n) => !!(pad.buttons[n] && pad.buttons[n].pressed);
    let mx = pad.axes[0] || 0, my = pad.axes[1] || 0;
    if (Math.hypot(mx, my) < 0.3) { mx = 0; my = 0; }
    if (b(14)) mx = -1; if (b(15)) mx = 1; if (b(12)) my = -1; if (b(13)) my = 1;
    return {
      mx, my,
      attack: b(2) || b(7), skill: b(1) || b(6) || b(4), act: b(0), swap: b(3) || b(5),
      start: b(9), select: b(8),
    };
  }

  I.update = function (dt) {
    const pads = [readPad(0), readPad(1)];
    for (let p = 0; p < 2; p++) {
      const r = I.raw[p];
      const bnd = BIND[p];
      let mx = (keyDown(bnd.right) ? 1 : 0) - (keyDown(bnd.left) ? 1 : 0);
      let my = (keyDown(bnd.down) ? 1 : 0) - (keyDown(bnd.up) ? 1 : 0);
      const pad = pads[p];
      const downNow = {};
      for (const k of BUTTONS) downNow[k] = keyHeld(bnd[k]);
      if (pad) {
        if (pad.mx || pad.my) { mx = pad.mx; my = pad.my; I.lastDevice = 'pad'; }
        for (const k of BUTTONS) if (pad[k]) { downNow[k] = true; I.lastDevice = 'pad'; }
      }
      r.mx = mx; r.my = my;
      for (const k of BUTTONS) {
        const was = !!I.prevDown[p][k];
        r[k].down = downNow[k];
        r[k].pressed = downNow[k] && !was;
        r[k].released = !downNow[k] && was;
        I.prevDown[p][k] = downNow[k];
      }
    }

    // Modo solo: a pessoa controla um personagem com qualquer um dos lados do teclado
    if (I.solo) {
      const a = I.soloActive, o = 1 - a;
      const m = blank();
      m.mx = I.raw[0].mx || I.raw[1].mx;
      m.my = I.raw[0].my || I.raw[1].my;
      for (const k of BUTTONS) {
        m[k].down = I.raw[0][k].down || I.raw[1][k].down;
        m[k].pressed = I.raw[0][k].pressed || I.raw[1][k].pressed;
        m[k].released = (I.raw[0][k].released && !I.raw[1][k].down) || (I.raw[1][k].released && !I.raw[0][k].down);
      }
      I.players[a] = m;
      I.players[o] = blank();
    } else {
      I.players[0] = I.raw[0];
      I.players[1] = I.raw[1];
    }

    // Menu (qualquer jogador navega)
    const anyPad = pads[0] || pads[1];
    const dirs = {
      up: keyHeld(['KeyW', 'ArrowUp']) || pads.some((p) => p && p.my < -0.5),
      down: keyHeld(['KeyS', 'ArrowDown']) || pads.some((p) => p && p.my > 0.5),
      left: keyHeld(['KeyA', 'ArrowLeft']) || pads.some((p) => p && p.mx < -0.5),
      right: keyHeld(['KeyD', 'ArrowRight']) || pads.some((p) => p && p.mx > 0.5),
    };
    for (const d in dirs) {
      if (dirs[d]) {
        I.repeat[d] = (I.repeat[d] || 0) + dt;
        const t = I.repeat[d];
        I.menu[d] = t === dt || (t > 0.35 && Math.floor((t - 0.35) / 0.1) !== Math.floor((t - dt - 0.35) / 0.1));
      } else { I.repeat[d] = 0; I.menu[d] = false; }
    }
    const padEdge = (name) => {
      let hit = false;
      for (let i = 0; i < 2; i++) {
        const p = pads[i];
        const now = !!(p && p[name]);
        if (now && !I.padPrev[i][name]) hit = true;
        I.padPrev[i][name] = now;
      }
      return hit;
    };
    const padConfirm = padEdge('attack') | padEdge('act');
    const padBack = padEdge('skill');
    const padStart = padEdge('start');
    const padSelect = padEdge('select');
    I.menu.confirm = keyPressed(MENU.confirm) || !!padConfirm;
    I.menu.back = keyPressed(MENU.back) || !!padBack;
    I.menu.pause = keyPressed(MENU.pause) || !!padStart;
    I.menu.soloSwap = keyPressed(MENU.soloSwap) || !!padSelect;
    I.menu.fullscreen = keyPressed(['F11']);
    I.menu.debug = keyPressed(['F2']);
    I.anyPressed = anyPressed || !!padConfirm || !!padStart;
    I.keysPressedThisFrame = new Set(keysPressed);
    anyPressed = false;
    keysPressed.clear();
    void anyPad;
  };

  I.p = (i) => I.players[i];
  // Descarta os "apertos" deste quadro (ex.: o botão que fechou um diálogo
  // não deve também atacar ou reabrir a conversa).
  I.consume = () => {
    for (const set of [I.raw, I.players]) for (const pl of set) for (const k of BUTTONS) pl[k].pressed = false;
  };
  I.isKeyPressed = (code) => I.keysPressedThisFrame && I.keysPressedThisFrame.has(code);
  // Qualquer botão de "avançar diálogo" de qualquer jogador
  I.advance = () => {
    const r = I.raw;
    return I.menu.confirm || r[0].act.pressed || r[1].act.pressed || r[0].attack.pressed || r[1].attack.pressed;
  };
  I.BIND = BIND;

  G.Input = I;
})();
