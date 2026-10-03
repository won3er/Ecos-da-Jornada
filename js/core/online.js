// Co-op online por convite (WebRTC via PeerJS, sem servidor próprio).
// ANFITRIÃO roda o jogo inteiro e transmite o vídeo+áudio; CONVIDADO só envia os controles.
// Progresso: o save é copiado para o navegador dos dois (chave por sala).
(function () {
  const O = { guest: false, connected: false, code: null, conn: null };
  G.Online = O;
  const BTN = ['attack', 'skill', 'act', 'swap'];
  const PFX = 'ecosjornada-';
  const COPY = (c) => 'ecos_coop_save_' + c;
  const $ = (id) => document.getElementById(id);
  const gen = () => { const a = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)]; return s; };
  const link = (c) => location.origin + location.pathname + '?sala=' + c;

  function ui(html) {
    let el = $('onl');
    if (!el) { el = document.createElement('div'); el.id = 'onl'; document.body.appendChild(el); }
    el.innerHTML = html || '';
    el.style.display = html ? 'flex' : 'none';
    return el;
  }
  function load(cb) {
    if (window.Peer) return cb();
    const s = document.createElement('script'); s.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
    s.onload = cb; s.onerror = () => ui('<div class="box">Não consegui carregar a conexão online. Verifique a internet.<br><button onclick="G.Online.close()">Fechar</button></div>');
    document.head.appendChild(s);
  }
  O.close = () => ui('');

  // ---------- ANFITRIÃO ----------
  O.openHost = function () {
    let code = null; try { code = localStorage.getItem('ecos_room'); } catch (e) { /* */ }
    if (!code) { code = gen(); try { localStorage.setItem('ecos_room', code); } catch (e) { /* */ } }
    O.code = code;
    ui('<div class="box">Criando sala…</div>');
    load(() => {
      if (O.peer) O.peer.destroy();
      const peer = O.peer = new Peer(PFX + code);
      peer.on('error', (e) => ui('<div class="box">Erro: ' + e.type + (e.type === 'unavailable-id' ? '<br>Essa sala já está aberta em outra aba.' : '') + '<br><button onclick="G.Online.close()">Fechar</button></div>'));
      peer.on('open', () => {
        const l = link(code);
        ui('<div class="box"><b>Sala ' + code + '</b><br>Mande este link para sua amiga:<br><input id="onl-l" readonly value="' + l + '" onclick="this.select()"><br>' +
          '<button onclick="navigator.clipboard&&navigator.clipboard.writeText(\'' + l + '\');this.textContent=\'Copiado!\'">Copiar link</button> ' +
          '<button onclick="G.Online.close()">Fechar</button><br><small>Aguardando ela entrar… depois escolha Novo jogo ou Continuar.<br>Você: WASD + J/K/L/I. Ela: setas + 1/2/3/4 (ou WASD/J/K/L).</small></div>');
      });
      peer.on('connection', (conn) => {
        O.conn = conn;
        conn.on('open', () => {
          O.connected = true; G.Input.remote = true;
          ui('<div class="box">Amiga conectada! 🎮<br><small>Escolha Novo jogo / Continuar.</small></div>'); setTimeout(() => ui(''), 2500);
          const stream = G.game.canvas.captureStream(30);
          if (G.Audio.ctx) {
            if (!O.adest) { O.adest = G.Audio.ctx.createMediaStreamDestination(); G.Audio.master.connect(O.adest); }
            O.adest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
          }
          O.pendingStream = stream; O.callGuest();
          const sv = G.Save.read(); if (sv) conn.send({ t: 'save', d: sv });
        });
        conn.on('data', (m) => { if (m && m.t === 'in') O.rin = m; });
        conn.on('close', () => { O.connected = false; G.Input.remote = false; O.rin = null; ui('<div class="box">Sua amiga saiu. O jogo continua; o link é o mesmo para ela voltar.<br><button onclick="G.Online.close()">OK</button></div>'); });
      });
      // a convidada liga para nós pedindo vídeo
      peer.on('call', (call) => { call.answer(O.pendingStream || G.game.canvas.captureStream(30)); });
    });
  };
  O.callGuest = function () {};

  // espelha cada save na cópia da amiga
  const w = G.Save.write;
  G.Save.write = function (d) { const r = w.call(G.Save, d); if (O.conn && O.connected) try { O.conn.send({ t: 'save', d }); } catch (e) { /* */ } return r; };

  // controles remotos entram como Jogador 2
  const prev = [{}];
  const up = G.Input.update;
  G.Input.update = function (dt) {
    up.call(G.Input, dt);
    if (!G.Input.remote) return;
    const I = G.Input, r = I.raw[1], s = O.rin || {};
    r.mx = s.mx || 0; r.my = s.my || 0;
    for (const k of BTN) {
      const now = !!(s.b && s.b[k]), was = !!prev[0][k];
      r[k].down = now; r[k].pressed = now && !was; r[k].released = !now && was; prev[0][k] = now;
    }
    if (!I.solo) { I.players[1] = r; }
  };

  // ---------- CONVIDADO ----------
  O.initGuest = function (code) {
    O.guest = true; O.code = code;
    document.body.classList.add('guest');
    $('wrap').style.display = 'none'; $('boot').style.display = 'none';
    ui('<div class="box">Conectando à sala ' + code + '…</div>');
    load(() => {
      const peer = new Peer();
      peer.on('error', (e) => ui('<div class="box">Não achei a sala ' + code + ' (' + e.type + ').<br>Peça para sua amiga abrir o jogo e "Jogar online".<br><button onclick="location.reload()">Tentar de novo</button></div>'));
      peer.on('open', () => {
        const conn = peer.connect(PFX + code, { reliable: false });
        conn.on('open', () => {
          const v = document.createElement('video'); v.id = 'gv'; v.autoplay = true; v.playsInline = true; document.body.appendChild(v);
          const call = peer.call(PFX + code, (() => { const c = document.createElement('canvas'); c.width = c.height = 1; return c.captureStream(1); })());
          call.on('stream', (st) => { v.srcObject = st; v.play().catch(() => {}); ui(''); });
          v.addEventListener('click', () => { v.muted = false; v.play(); });
          setInterval(() => conn.send(readInput()), 1000 / 30);
          ui('<div class="box">Entrando no jogo… <small>(clique na tela se ficar sem som)</small></div>');
        });
        conn.on('data', (m) => { if (m && m.t === 'save') { try { localStorage.setItem(COPY(code), JSON.stringify(m.d)); } catch (e) { /* */ } } });
        conn.on('close', () => ui('<div class="box">A sala fechou.<br><button onclick="location.reload()">Reconectar</button></div>'));
      });
    });
  };
  const keys = new Set();
  addEventListener('keydown', (e) => { if (!O.guest) return; keys.add(e.code); if (/Arrow|Space|Tab/.test(e.code)) e.preventDefault(); });
  addEventListener('keyup', (e) => keys.delete(e.code));
  function readInput() {
    const k = (...c) => c.some((x) => keys.has(x));
    let mx = (k('ArrowRight', 'KeyD') ? 1 : 0) - (k('ArrowLeft', 'KeyA') ? 1 : 0);
    let my = (k('ArrowDown', 'KeyS') ? 1 : 0) - (k('ArrowUp', 'KeyW') ? 1 : 0);
    const b = {
      attack: k('Digit1', 'Numpad1', 'KeyJ', 'Enter', 'Space'), skill: k('Digit2', 'Numpad2', 'KeyK', 'Escape'),
      act: k('Digit3', 'Numpad3', 'KeyL'), swap: k('Digit4', 'Numpad4', 'Numpad0', 'KeyI', 'KeyU'),
    };
    const p = (navigator.getGamepads && navigator.getGamepads()[0]);
    if (p) {
      const bt = (n) => !!(p.buttons[n] && p.buttons[n].pressed);
      if (Math.hypot(p.axes[0], p.axes[1]) > 0.3) { mx = p.axes[0]; my = p.axes[1]; }
      if (bt(14)) mx = -1; if (bt(15)) mx = 1; if (bt(12)) my = -1; if (bt(13)) my = 1;
      b.attack = b.attack || bt(2) || bt(7); b.skill = b.skill || bt(1) || bt(6); b.act = b.act || bt(0); b.swap = b.swap || bt(3) || bt(5);
    }
    return { t: 'in', mx, my, b };
  }

  // restaura o progresso do casal guardado neste navegador (para quem virou anfitriã)
  O.restore = function () {
    const c = (location.search.match(/sala=([A-Z0-9]+)/) || [])[1] || O.code || localStorage.getItem('ecos_room');
    let raw = null; try { raw = localStorage.getItem(COPY(c)); } catch (e) { /* */ }
    return raw;
  };
  const m = location.search.match(/sala=([A-Za-z0-9]+)/);
  if (m) window.addEventListener('load', () => O.initGuest(m[1].toUpperCase()));
})();
