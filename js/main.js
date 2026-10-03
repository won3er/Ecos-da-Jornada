// Inicialização e laço principal (passo fixo de 60 Hz, escala em pixels inteiros).
(function () {
  const canvas = document.getElementById('game');

  function resize() {
    const sw = window.innerWidth, sh = window.innerHeight;
    let s = Math.floor(Math.min(sw / G.VIEW_W, sh / G.VIEW_H));
    if (s < 1) s = Math.min(sw / G.VIEW_W, sh / G.VIEW_H);
    canvas.style.width = Math.round(G.VIEW_W * s) + 'px';
    canvas.style.height = Math.round(G.VIEW_H * s) + 'px';
  }
  window.addEventListener('resize', resize);
  resize();

  try {
    G.Sprites.init();
    G.Icons.init();
  } catch (e) {
    document.getElementById('boot').textContent = 'Erro ao gerar a arte: ' + e.message;
    throw e;
  }
  const game = new G.Game(canvas);
  G.game = game;
  document.getElementById('boot').style.display = 'none';

  const STEP = 1 / 60;
  let acc = 0, last = performance.now();
  function frame(now) {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.25) dt = 0.25; // aba voltou do segundo plano
    acc += dt;
    let n = 0;
    if (G.Online && G.Online.guest) { requestAnimationFrame(frame); return; }
    while (acc >= STEP && n < 5) {
      G.Input.update(STEP);
      game.update(STEP);
      acc -= STEP; n++;
    }
    if (n === 5) acc = 0;
    game.draw();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Atalhos de depuração (console do navegador): G.dev.warp('ruinas'), G.dev.god()
  G.dev = {
    warp(area, spawn) { if (game.state !== 'play') game.newGame(); game.co.clear(); game.dialogue.active = false; game.letterbox(false); game.fade.target = 0; game.loadArea(area, spawn || 'start'); },
    god() { game.godMode = !game.godMode; return game.godMode; },
    give(id, n = 1) { game.inv.add(id, n, game); },
    points(n = 5) { game.prog.points += n; },
    unlockAll() { game.unlockedSpells = ['frost', 'tk', 'bridge']; game.abilities.add('reflexao'); },
  };
})();
