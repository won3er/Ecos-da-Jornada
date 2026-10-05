// Sistema de áudio: música procedural (sequenciador WebAudio) com transição suave,
// ambiente e efeitos sonoros sintetizados. Todos podem ser substituídos por arquivos:
// preencha G.AudioFiles (veja o fim deste arquivo) com caminhos .ogg/.mp3.
(function () {
  const U = G.U;
  const A = {
    ctx: null,
    ready: false,
    vol: { music: 0.55, sfx: 0.8 },
    tracks: {},
    playing: [],      // instâncias de música ativas (para crossfade)
    currentName: null,
    ambName: null,
    amb: null,
    fileMusic: null,
  };

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  A.unlock = function () {
    if (A.ctx) {
      if (A.ctx.state === 'suspended') A.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      A.ctx = new AC();
    } catch (e) { return; }
    const c = A.ctx;
    A.master = c.createGain(); A.master.gain.value = 0.9;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    A.master.connect(comp); comp.connect(c.destination);
    A.musicBus = c.createGain(); A.musicBus.gain.value = A.vol.music;
    A.sfxBus = c.createGain(); A.sfxBus.gain.value = A.vol.sfx;
    A.ambBus = c.createGain(); A.ambBus.gain.value = A.vol.sfx * 0.6;
    A.musicBus.connect(A.master); A.sfxBus.connect(A.master); A.ambBus.connect(A.master);
    // Reverb compartilhado
    A.reverb = c.createConvolver();
    A.reverb.buffer = makeImpulse(2.8, 2.2);
    A.reverbSend = c.createGain(); A.reverbSend.gain.value = 0.35;
    A.reverbSend.connect(A.reverb); A.reverb.connect(A.master);
    A.noise = makeNoise(2);
    A.ready = true;
    setInterval(schedulerTick, 25);
    if (A._pendingMusic) { const p = A._pendingMusic; A._pendingMusic = null; A.playMusic(p, 0.5); }
    if (A._pendingAmb) { const p = A._pendingAmb; A._pendingAmb = null; A.setAmbience(p); }
  };

  function makeImpulse(sec, decay) {
    const c = A.ctx, len = Math.floor(c.sampleRate * sec);
    const buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }
  function makeNoise(sec) {
    const c = A.ctx, len = Math.floor(c.sampleRate * sec);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  A.setVolume = function (kind, v) {
    A.vol[kind] = v;
    if (!A.ready) return;
    const t = A.ctx.currentTime;
    if (kind === 'music') {
      A.musicBus.gain.setTargetAtTime(v, t, 0.05);
      if (A.fileMusic) A.fileMusic.el.volume = v;
    }
    if (kind === 'sfx') { A.sfxBus.gain.setTargetAtTime(v, t, 0.05); A.ambBus.gain.setTargetAtTime(v * 0.6, t, 0.05); }
  };

  // ---------------------------------------------------------------- Instrumentos
  function env(g, t, a, peak, d, sustain, rel, end) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    end = Math.max(end, t + a + 0.01);
    const dEnd = Math.min(t + a + d, end);
    const frac = (dEnd - t - a) / d;
    const lvl = Math.max(0.0001, peak * Math.pow(sustain, frac));
    g.gain.exponentialRampToValueAtTime(lvl, dEnd);
    g.gain.exponentialRampToValueAtTime(0.0001, end + rel);
  }
  const INST = {
    harp(out, t, f, dur, v) {
      const c = A.ctx, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain();
      o.type = 'triangle'; o.frequency.value = f;
      o2.type = 'sine'; o2.frequency.value = f * 2;
      const g2 = c.createGain(); g2.gain.value = 0.25;
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(out);
      env(g, t, 0.005, v, 0.6, 0.05, 0.4, t + Math.min(dur, 0.8));
      o.start(t); o2.start(t); o.stop(t + dur + 1.4); o2.stop(t + dur + 1.4);
    },
    bell(out, t, f, dur, v) {
      const c = A.ctx, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), g2 = c.createGain();
      o.type = 'sine'; o.frequency.value = f;
      o2.type = 'sine'; o2.frequency.value = f * 2.76;
      g2.gain.value = 0.18;
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(out);
      env(g, t, 0.003, v, 1.2, 0.02, 0.6, t + 0.2);
      o.start(t); o2.start(t); o.stop(t + 2.2); o2.stop(t + 2.2);
    },
    pad(out, t, f, dur, v) {
      const c = A.ctx, g = c.createGain(), lp = c.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 0.5;
      for (const det of [-7, 6]) {
        const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det;
        o.connect(lp); o.start(t); o.stop(t + dur + 1.2);
      }
      lp.connect(g); g.connect(out);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v, t + Math.min(0.6, dur * 0.4));
      g.gain.setValueAtTime(v, t + dur);
      g.gain.linearRampToValueAtTime(0.0001, t + dur + 1.0);
    },
    strings(out, t, f, dur, v) {
      const c = A.ctx, g = c.createGain(), lp = c.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1600;
      const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
      const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 5; lg.gain.value = 3;
      lfo.connect(lg); lg.connect(o.detune);
      o.connect(lp); lp.connect(g); g.connect(out);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v, t + 0.25);
      g.gain.setValueAtTime(v, t + dur);
      g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.5);
      o.start(t); lfo.start(t); o.stop(t + dur + 0.6); lfo.stop(t + dur + 0.6);
    },
    flute(out, t, f, dur, v) {
      const c = A.ctx, o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = f;
      const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 5.5; lg.gain.value = f * 0.012;
      lfo.connect(lg); lg.connect(o.frequency);
      const o3 = c.createOscillator(), g3 = c.createGain(); o3.type = 'triangle'; o3.frequency.value = f * 2; g3.gain.value = 0.12;
      o3.connect(g3); g3.connect(g);
      o.connect(g); g.connect(out);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v, t + 0.06);
      g.gain.setValueAtTime(v * 0.85, t + Math.max(0.07, dur - 0.05));
      g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.12);
      o.start(t); o3.start(t); lfo.start(t);
      o.stop(t + dur + 0.2); o3.stop(t + dur + 0.2); lfo.stop(t + dur + 0.2);
    },
    lead(out, t, f, dur, v) {
      const c = A.ctx, o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
      o.type = 'square'; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = 2200;
      o.connect(lp); lp.connect(g); g.connect(out);
      env(g, t, 0.01, v, 0.15, 0.6, 0.08, t + dur);
      o.start(t); o.stop(t + dur + 0.2);
    },
    bass(out, t, f, dur, v) {
      const c = A.ctx, o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 3;
      o.connect(lp); lp.connect(g); g.connect(out);
      env(g, t, 0.01, v, 0.2, 0.5, 0.08, t + dur);
      o.start(t); o.stop(t + dur + 0.2);
    },
    softbass(out, t, f, dur, v) {
      const c = A.ctx, o = c.createOscillator(), g = c.createGain();
      o.type = 'triangle'; o.frequency.value = f;
      o.connect(g); g.connect(out);
      env(g, t, 0.01, v, 0.3, 0.4, 0.15, t + dur);
      o.start(t); o.stop(t + dur + 0.3);
    },
    kick(out, t, f, dur, v) {
      const c = A.ctx, o = c.createOscillator(), g = c.createGain();
      o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.14);
      o.connect(g); g.connect(out);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      o.start(t); o.stop(t + 0.3);
    },
    snare(out, t, f, dur, v) {
      const c = A.ctx, s = c.createBufferSource(), g = c.createGain(), bp = c.createBiquadFilter();
      s.buffer = A.noise; bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.8;
      s.connect(bp); bp.connect(g); g.connect(out);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      s.start(t, Math.random()); s.stop(t + 0.2);
    },
    hat(out, t, f, dur, v) {
      const c = A.ctx, s = c.createBufferSource(), g = c.createGain(), hp = c.createBiquadFilter();
      s.buffer = A.noise; hp.type = 'highpass'; hp.frequency.value = 7000;
      s.connect(hp); hp.connect(g); g.connect(out);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      s.start(t, Math.random()); s.stop(t + 0.07);
    },
    tom(out, t, f, dur, v) {
      const c = A.ctx, o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.3);
      o.connect(g); g.connect(out);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      o.start(t); o.stop(t + 0.45);
    },
  };

  // ---------------------------------------------------------------- Composição
  // Acordes por compasso em MIDI (tríade na oitava 4ish).
  const CH = {
    Dm: [62, 65, 69], Bb: [58, 62, 65], F: [60, 65, 69], C: [60, 64, 67], Am: [57, 60, 64],
    G: [55, 59, 62], Em: [52, 55, 59], D: [62, 66, 69], E: [52, 56, 59], Gm: [55, 58, 62],
    A: [57, 61, 64], Fmaj7: [53, 57, 60, 64], Cmaj7: [48, 52, 55, 59], Gadd9: [55, 59, 62, 69],
    Bbmaj7: [58, 62, 65, 69], Dsus: [62, 67, 69], Esus: [52, 57, 59],
    B7: [59, 63, 66, 69],
  };

  // Gera melodia determinística: notas do acorde nos tempos fortes, escala nos fracos.
  function genMelody(seed, chords, scale, density, octave) {
    const r = U.rng(seed);
    const bars = [];
    for (let b = 0; b < chords.length; b++) {
      const ch = chords[b];
      const notes = [];
      let s = 0;
      while (s < 16) {
        const strong = s % 4 === 0;
        const len = U.pick([2, 2, 4, 4, 6, 3]) | 0;
        if (r() < density || strong) {
          let n;
          if (strong || r() < 0.5) n = ch[Math.floor(r() * ch.length)] % 12;
          else n = scale[Math.floor(r() * scale.length)];
          notes.push([s, octave + n, Math.min(len, 16 - s)]);
        }
        s += Math.max(2, len);
      }
      bars.push(notes);
    }
    return bars;
  }

  function T(def) { return def; }

  A.tracks = {
    title: T({
      bpm: 70, chords: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A'], reverb: 0.6,
      parts: ['pad', 'harpArp8', 'bellMel'],
      melody: [
        [[0, 74, 4], [4, 72, 2], [6, 69, 6], [12, 72, 4]],
        [[0, 74, 6], [6, 77, 2], [8, 74, 8]],
        [[0, 72, 4], [4, 69, 4], [8, 72, 2], [10, 74, 2], [12, 76, 4]],
        [[0, 72, 12]],
        [[0, 74, 4], [4, 76, 2], [6, 77, 6], [12, 76, 4]],
        [[0, 74, 8], [8, 70, 4], [12, 72, 4]],
        [[0, 70, 4], [4, 69, 4], [8, 67, 4], [12, 70, 4]],
        [[0, 69, 16]],
      ],
    }),
    village: T({
      bpm: 92, chords: ['G', 'Em', 'C', 'D', 'G', 'Em', 'C', 'Dsus'], reverb: 0.35,
      parts: ['pluckArp8', 'softBass', 'fluteMel', 'shaker'],
      melody: [
        [[0, 79, 4], [4, 78, 2], [6, 76, 2], [8, 74, 6]],
        [[0, 76, 2], [2, 79, 2], [4, 83, 6], [12, 81, 4]],
        [[0, 79, 4], [4, 76, 4], [8, 72, 4], [12, 74, 4]],
        [[0, 74, 10], [12, 78, 4]],
        [[0, 79, 4], [4, 81, 2], [6, 83, 2], [8, 86, 6]],
        [[0, 83, 4], [4, 79, 4], [8, 76, 8]],
        [[0, 76, 2], [2, 79, 2], [4, 81, 4], [8, 79, 4], [12, 76, 4]],
        [[0, 74, 16]],
      ],
    }),
    explore: T({
      bpm: 104, chords: ['Am', 'G', 'F', 'G', 'Am', 'C', 'G', 'Em'], reverb: 0.4,
      parts: ['harpArp16', 'strings', 'softBass', 'fluteGen', 'lightPerc'],
      seed: 11,
    }),
    forest: T({
      bpm: 96, chords: ['Em', 'C', 'G', 'D', 'Em', 'C', 'Am', 'Esus'], reverb: 0.5,
      parts: ['harpArp16', 'pad', 'softBass', 'fluteGen'],
      seed: 23,
    }),
    dungeon: T({
      bpm: 66, chords: ['Em', 'F', 'Em', 'D', 'Em', 'F', 'Am', 'Esus'], reverb: 0.7,
      parts: ['drone', 'bellGen', 'slowPerc'],
      seed: 37,
    }),
    sanctum: T({
      bpm: 76, chords: ['Fmaj7', 'Gadd9', 'Em', 'Am', 'Fmaj7', 'Gadd9', 'Cmaj7', 'Esus'], reverb: 0.8,
      parts: ['pad', 'bellArp', 'bellGen'],
      seed: 51,
    }),
    combat: T({
      bpm: 132, chords: ['Am', 'F', 'G', 'E', 'Am', 'F', 'Dm', 'E'], reverb: 0.25,
      parts: ['bass8', 'drums', 'leadGen', 'strings'],
      seed: 61,
    }),
    boss: T({
      bpm: 150, chords: ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'C', 'A'], reverb: 0.3,
      parts: ['bass16', 'drumsHeavy', 'harpArp16', 'leadGen', 'pad'],
      seed: 77,
    }),
    victory: T({
      bpm: 112, chords: ['C', 'F', 'G', 'C'], reverb: 0.4, once: true,
      parts: ['pad', 'fanfare', 'softBass'],
    }),
    memory: T({
      bpm: 64, chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'C'], reverb: 0.9,
      parts: ['musicBox', 'pad'],
      melody: [
        [[0, 76, 4], [4, 79, 4], [8, 84, 6], [14, 83, 2]],
        [[0, 81, 8], [8, 76, 8]],
        [[0, 77, 4], [4, 81, 4], [8, 84, 4], [12, 83, 4]],
        [[0, 79, 12], [12, 74, 4]],
        [[0, 76, 4], [4, 79, 4], [8, 84, 4], [12, 86, 4]],
        [[0, 88, 6], [6, 84, 2], [8, 81, 8]],
        [[0, 77, 4], [4, 76, 4], [8, 74, 4], [12, 71, 4]],
        [[0, 72, 16]],
      ],
    }),
    snow: T({
      bpm: 84, chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Em', 'Esus'], reverb: 0.7,
      parts: ['bellArp', 'pad', 'softBass', 'fluteGen'],
      seed: 91,
    }),
    camp: T({
      bpm: 88, chords: ['D', 'G', 'Bb', 'A', 'D', 'G', 'Em', 'A'], reverb: 0.45,
      parts: ['pluckArp8', 'softBass', 'fluteGen', 'shaker'],
      seed: 97,
    }),
    mine: T({
      bpm: 70, chords: ['Em', 'C', 'Em', 'B7', 'Em', 'Am', 'C', 'B7'], reverb: 0.75,
      parts: ['drone', 'bellGen', 'slowPerc', 'harpArp8'],
      seed: 103,
    }),
    fortress: T({
      bpm: 92, chords: ['Dm', 'Gm', 'Bb', 'A', 'Dm', 'Gm', 'C', 'A'], reverb: 0.6,
      parts: ['strings', 'bass8', 'bellGen', 'lightPerc'],
      seed: 109,
    }),
    boss2: T({
      bpm: 156, chords: ['Em', 'C', 'D', 'B7', 'Em', 'C', 'Am', 'B7'], reverb: 0.35,
      parts: ['bass16', 'drumsHeavy', 'bellArp', 'leadGen', 'strings'],
      seed: 113,
    }),
    tower: T({
      bpm: 74, chords: ['Cmaj7', 'Fmaj7', 'Am', 'G', 'Cmaj7', 'Fmaj7', 'Dm', 'Esus'], reverb: 0.9,
      parts: ['pad', 'bellArp', 'fluteGen'],
      seed: 127,
    }),
    void: T({
      bpm: 60, chords: ['Dm', 'Bbmaj7', 'Gm', 'A', 'Dm', 'Bbmaj7', 'Esus', 'A'], reverb: 0.95,
      parts: ['drone', 'bellGen', 'musicBoxGen'],
      seed: 131,
    }),
    finalboss: T({
      bpm: 164, chords: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A'], reverb: 0.4,
      parts: ['bass16', 'drumsHeavy', 'harpArp16', 'leadGen', 'pad', 'strings'],
      seed: 137,
    }),
    hope: T({
      bpm: 80, chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C'], reverb: 0.7,
      parts: ['pad', 'harpArp8', 'bellMel', 'softBass'],
      melody: [
        [[0, 76, 4], [4, 79, 4], [8, 84, 6], [14, 83, 2]],
        [[0, 79, 8], [8, 74, 8]],
        [[0, 76, 4], [4, 72, 4], [8, 76, 4], [12, 77, 4]],
        [[0, 77, 12], [12, 76, 4]],
        [[0, 76, 4], [4, 79, 4], [8, 84, 4], [12, 86, 4]],
        [[0, 83, 6], [6, 79, 2], [8, 74, 8]],
        [[0, 77, 4], [4, 76, 4], [8, 74, 4], [12, 72, 4]],
        [[0, 72, 16]],
      ],
    }),
    gameover: T({
      bpm: 60, chords: ['Dm', 'Bb', 'Gm', 'A'], reverb: 0.8, parts: ['pad', 'bellMel'],
      melody: [[[0, 74, 8], [8, 72, 8]], [[0, 70, 16]], [[0, 69, 8], [8, 67, 8]], [[0, 69, 16]]],
    }),
  };
  // Melodias procedurais com seed
  for (const k in A.tracks) {
    const tr = A.tracks[k];
    tr.chordNotes = tr.chords.map((c) => CH[c]);
    if (!tr.melody && tr.seed) {
      const sc = [0, 2, 3, 5, 7, 8, 10];
      tr.genMel = genMelody(tr.seed, tr.chordNotes, sc, 0.55, 72);
    }
  }

  // Partes: cada uma agenda notas de um compasso
  const PART = {
    pad(ctx) { for (const n of ctx.chord) ctx.emit('pad', 0, n - 12, 16, 0.045); },
    strings(ctx) { for (const n of ctx.chord.slice(0, 3)) ctx.emit('strings', 0, n, 16, 0.022); },
    drone(ctx) { ctx.emit('pad', 0, ctx.chord[0] - 24, 16, 0.07); ctx.emit('pad', 0, ctx.chord[0] - 12, 16, 0.04); },
    harpArp8(ctx) {
      const c = ctx.chord, seq = [c[0], c[1], c[2], c[1] + 12, c[2], c[1], c[0] + 12, c[2]];
      seq.forEach((n, i) => ctx.emit('harp', i * 2, n, 2, 0.07));
    },
    harpArp16(ctx) {
      const c = ctx.chord, seq = [c[0], c[1], c[2], c[0] + 12];
      for (let i = 0; i < 16; i++) ctx.emit('harp', i, seq[(i + ctx.bar) % 4] + (i >= 8 ? 0 : 0), 1, 0.045);
    },
    pluckArp8(ctx) {
      const c = ctx.chord, seq = [c[0] - 12, c[2] - 12, c[1], c[2], c[0] + 12, c[2], c[1], c[2] - 12];
      seq.forEach((n, i) => ctx.emit('harp', i * 2, n, 2, 0.06));
    },
    bellArp(ctx) {
      const c = ctx.chord;
      for (let i = 0; i < 8; i++) ctx.emit('bell', i * 2, c[i % c.length] + 12, 2, 0.035);
    },
    musicBox(ctx) {
      const c = ctx.chord;
      for (let i = 0; i < 4; i++) ctx.emit('bell', i * 4, c[i % 3] + 12, 4, 0.03);
      const mel = ctx.track.melody[ctx.bar % ctx.track.melody.length];
      for (const [s, n, l] of mel) ctx.emit('bell', s, n + 12, l, 0.06);
    },
    softBass(ctx) { ctx.emit('softbass', 0, ctx.chord[0] - 24, 6, 0.16); ctx.emit('softbass', 8, ctx.chord[0] - 24, 6, 0.12); },
    bass8(ctx) { for (let i = 0; i < 8; i++) ctx.emit('bass', i * 2, ctx.chord[0] - 24 + (i === 7 ? 7 : 0), 1.6, 0.13); },
    bass16(ctx) { for (let i = 0; i < 16; i++) ctx.emit('bass', i, ctx.chord[0] - 24 + (i % 4 === 3 ? 12 : 0), 0.8, 0.12); },
    bellMel(ctx) {
      const mel = ctx.track.melody[ctx.bar % ctx.track.melody.length];
      for (const [s, n, l] of mel) ctx.emit('bell', s, n, l, 0.07);
    },
    fluteMel(ctx) {
      const mel = ctx.track.melody[ctx.bar % ctx.track.melody.length];
      for (const [s, n, l] of mel) ctx.emit('flute', s, n, l, 0.055);
    },
    fluteGen(ctx) {
      if (ctx.loop % 2 === 1 && ctx.bar % 8 < 4) return; // respira
      const mel = ctx.track.genMel[ctx.bar % ctx.track.genMel.length];
      for (const [s, n, l] of mel) ctx.emit('flute', s, n, l, 0.045);
    },
    bellGen(ctx) {
      const mel = ctx.track.genMel[ctx.bar % ctx.track.genMel.length];
      for (const [s, n, l] of mel) if ((s + ctx.bar) % 3 !== 1) ctx.emit('bell', s, n, l, 0.05);
    },
    musicBoxGen(ctx) {
      const mel = ctx.track.genMel[ctx.bar % ctx.track.genMel.length];
      for (const [s, n, l] of mel) if ((s + ctx.bar) % 2 === 0) ctx.emit('bell', s, n + 12, l, 0.035);
    },
    leadGen(ctx) {
      const mel = ctx.track.genMel[ctx.bar % ctx.track.genMel.length];
      for (const [s, n, l] of mel) ctx.emit('lead', s, n - 12, Math.min(l, 3), 0.03);
    },
    shaker(ctx) { for (let i = 0; i < 8; i++) ctx.emit('hat', i * 2 + 1, 0, 1, 0.025); },
    lightPerc(ctx) {
      ctx.emit('tom', 0, 0, 1, 0.12, 110); ctx.emit('tom', 10, 0, 1, 0.08, 110);
      for (let i = 0; i < 4; i++) ctx.emit('hat', i * 4 + 2, 0, 1, 0.02);
    },
    slowPerc(ctx) { if (ctx.bar % 2 === 0) ctx.emit('tom', 0, 0, 1, 0.1, 70); },
    drums(ctx) {
      for (let i = 0; i < 16; i++) {
        if (i % 8 === 0 || i === 6) ctx.emit('kick', i, 0, 1, 0.35);
        if (i % 8 === 4) ctx.emit('snare', i, 0, 1, 0.18);
        if (i % 2 === 0) ctx.emit('hat', i, 0, 1, 0.04);
      }
    },
    drumsHeavy(ctx) {
      for (let i = 0; i < 16; i++) {
        if (i % 4 === 0 || i === 10) ctx.emit('kick', i, 0, 1, 0.38);
        if (i % 8 === 4) ctx.emit('snare', i, 0, 1, 0.22);
        ctx.emit('hat', i, 0, 1, i % 2 ? 0.02 : 0.045);
      }
      if (ctx.bar % 4 === 3) for (let i = 12; i < 16; i++) ctx.emit('tom', i, 0, 1, 0.15, 180 - (i - 12) * 25);
    },
    fanfare(ctx) {
      const c = ctx.chord;
      if (ctx.bar === 0) [[0, 0], [2, 1], [4, 2], [6, 0]].forEach(([s, k]) => ctx.emit('lead', s, c[k] + 12, 2, 0.05));
      else if (ctx.bar === 3) ctx.emit('lead', 0, c[0] + 12, 16, 0.05);
      else for (let i = 0; i < 4; i++) ctx.emit('lead', i * 4, c[i % 3] + 12, 3, 0.045);
    },
  };

  function makeTrackInstance(name) {
    const def = A.tracks[name];
    const c = A.ctx;
    const out = c.createGain();
    out.gain.value = 0.0001;
    out.connect(A.musicBus);
    const send = c.createGain(); send.gain.value = def.reverb || 0.3;
    out.connect(send); send.connect(A.reverbSend);
    return { name, def, out, bar: 0, loop: 0, nextTime: c.currentTime + 0.1, stopped: false, stopAt: Infinity };
  }

  function scheduleBar(inst) {
    const def = inst.def;
    const sd = 60 / def.bpm / 4;
    const t0 = inst.nextTime;
    const chord = def.chordNotes[inst.bar % def.chordNotes.length];
    const ctx = {
      track: def, bar: inst.bar % def.chordNotes.length, loop: inst.loop, chord,
      emit(instr, step, midi, lenSteps, vol, freqOverride) {
        const t = t0 + step * sd;
        const f = freqOverride || mtof(midi);
        INST[instr](inst.out, t, f, lenSteps * sd, vol);
      },
    };
    for (const p of def.parts) PART[p](ctx);
    inst.nextTime += 16 * sd;
    inst.bar++;
    if (inst.bar % def.chordNotes.length === 0) {
      inst.loop++;
      if (def.once) inst.finished = true;
    }
  }

  function schedulerTick() {
    if (!A.ready) return;
    const now = A.ctx.currentTime;
    for (const inst of A.playing) {
      if (inst.finished || inst.stopped) continue;
      while (inst.nextTime < now + 0.25 && !inst.finished) scheduleBar(inst);
    }
    A.playing = A.playing.filter((i) => !(i.stopped && now > i.stopAt));
    ambienceTick(now);
  }

  A.playMusic = function (name, fade = 1.5) {
    if (A.currentName === name) return;
    A.currentName = name;
    if (!A.ready) { A._pendingMusic = name; return; }
    const now = A.ctx.currentTime;
    for (const inst of A.playing) {
      if (inst.stopped) continue;
      inst.out.gain.cancelScheduledValues(now);
      inst.out.gain.setValueAtTime(Math.max(0.0001, inst.out.gain.value), now);
      inst.out.gain.exponentialRampToValueAtTime(0.0001, now + fade);
      inst.stopped = true; inst.stopAt = now + fade + 0.2;
      setTimeout(() => inst.out.disconnect(), (fade + 3) * 1000);
    }
    if (A.fileMusic) { const fm = A.fileMusic; fadeEl(fm.el, 0, fade, () => fm.el.pause()); A.fileMusic = null; }
    if (!name) return;
    const file = G.AudioFiles && G.AudioFiles.music && G.AudioFiles.music[name];
    if (file) {
      const el = new Audio(file); el.loop = !(A.tracks[name] && A.tracks[name].once); el.volume = 0;
      el.play().catch(() => {});
      fadeEl(el, A.vol.music, fade);
      A.fileMusic = { el };
      return;
    }
    if (!A.tracks[name]) return;
    const inst = makeTrackInstance(name);
    inst.out.gain.setValueAtTime(0.0001, now);
    inst.out.gain.exponentialRampToValueAtTime(1, now + fade);
    A.playing.push(inst);
  };
  function fadeEl(el, to, dur, cb) {
    const from = el.volume, start = performance.now();
    const step = () => {
      const t = Math.min(1, (performance.now() - start) / (dur * 1000));
      el.volume = U.lerp(from, to, t);
      if (t < 1) requestAnimationFrame(step); else if (cb) cb();
    };
    step();
  }

  // ---------------------------------------------------------------- Ambiente
  // Cada ambiente = ruído filtrado contínuo + eventos aleatórios (pássaros, gotas...)
  const AMB = {
    village: { noise: { type: 'lowpass', f: 500, v: 0.025 }, events: ['bird'], rate: 0.5 },
    wind: { noise: { type: 'bandpass', f: 600, v: 0.05 }, events: ['bird'], rate: 0.15 },
    forest: { noise: { type: 'lowpass', f: 900, v: 0.035 }, events: ['bird', 'bird', 'leaf'], rate: 0.8 },
    ruins: { noise: { type: 'bandpass', f: 300, v: 0.05 }, events: ['crow'], rate: 0.08 },
    cave: { noise: { type: 'lowpass', f: 200, v: 0.07 }, events: ['drip', 'drip'], rate: 0.7 },
    magic: { noise: { type: 'highpass', f: 3000, v: 0.012 }, events: ['chime'], rate: 0.5 },
    night: { noise: { type: 'lowpass', f: 400, v: 0.03 }, events: ['cricket'], rate: 1.5 },
    blizzard: { noise: { type: 'bandpass', f: 800, v: 0.08 }, events: ['gust'], rate: 0.25 },
    snow: { noise: { type: 'lowpass', f: 600, v: 0.035 }, events: ['crow', 'gust'], rate: 0.1 },
    mine: { noise: { type: 'lowpass', f: 180, v: 0.06 }, events: ['drip', 'clink'], rate: 0.6 },
    hall: { noise: { type: 'lowpass', f: 250, v: 0.05 }, events: ['drip'], rate: 0.15 },
    void: { noise: { type: 'highpass', f: 2400, v: 0.015 }, events: ['chime', 'chime'], rate: 0.35 },
  };
  A.setAmbience = function (name) {
    if (A.ambName === name) return;
    A.ambName = name;
    if (!A.ready) { A._pendingAmb = name; return; }
    const now = A.ctx.currentTime;
    if (A.amb) {
      const old = A.amb;
      old.g.gain.setTargetAtTime(0.0001, now, 0.5);
      setTimeout(() => { try { old.src.stop(); } catch (e) {} }, 2500);
      A.amb = null;
    }
    const def = AMB[name];
    if (!def) return;
    const c = A.ctx, src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = A.noise; src.loop = true;
    f.type = def.noise.type; f.frequency.value = def.noise.f;
    g.gain.value = 0.0001; g.gain.setTargetAtTime(def.noise.v, now, 0.8);
    src.connect(f); f.connect(g); g.connect(A.ambBus);
    src.start();
    A.amb = { src, g, def, next: now + 1 };
  };
  function ambienceTick(now) {
    const a = A.amb;
    if (!a || now < a.next) return;
    a.next = now + U.rand(0.4, 2.5) / a.def.rate;
    const ev = U.pick(a.def.events);
    const c = A.ctx, out = A.ambBus;
    if (ev === 'bird') {
      const n = U.randi(2, 5), base = U.rand(2200, 3600);
      for (let i = 0; i < n; i++) {
        const t = now + i * U.rand(0.08, 0.14);
        const o = c.createOscillator(), g = c.createGain();
        o.frequency.setValueAtTime(base, t); o.frequency.exponentialRampToValueAtTime(base * U.rand(1.1, 1.5), t + 0.06);
        o.connect(g); g.connect(out);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.025, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
        o.start(t); o.stop(t + 0.1);
      }
    } else if (ev === 'drip') {
      const t = now, o = c.createOscillator(), g = c.createGain();
      const f = U.rand(900, 1600);
      o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 2, t + 0.05);
      o.connect(g); g.connect(out); g.connect(A.reverbSend);
      g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.start(t); o.stop(t + 0.15);
    } else if (ev === 'chime') {
      INST.bell(A.reverbSend, now, mtof(U.pick([84, 88, 91, 93, 96])), 1, 0.03);
    } else if (ev === 'cricket') {
      for (let i = 0; i < 3; i++) {
        const t = now + i * 0.07, o = c.createOscillator(), g = c.createGain();
        o.frequency.value = 4200; o.connect(g); g.connect(out);
        g.gain.setValueAtTime(0.012, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
        o.start(t); o.stop(t + 0.05);
      }
    } else if (ev === 'crow') {
      const t = now, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(520, t); o.frequency.linearRampToValueAtTime(380, t + 0.25);
      f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 2;
      o.connect(f); f.connect(g); g.connect(out); g.connect(A.reverbSend);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.03, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      o.start(t); o.stop(t + 0.32);
    } else if (ev === 'gust') {
      noiseBurst(out, now, 1.6, 400, 'bandpass', 0.05, 1600);
    } else if (ev === 'clink') {
      INST.bell(out, now, mtof(U.pick([96, 98, 100])), 0.2, 0.02);
    } else if (ev === 'leaf') {
      noiseBurst(out, now, 0.25, 3000, 'bandpass', 0.015);
    }
  }

  function noiseBurst(out, t, dur, freq, type, vol, freqEnd) {
    const c = A.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = A.noise; f.type = type || 'bandpass'; f.frequency.setValueAtTime(freq, t);
    if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    s.connect(f); f.connect(g); g.connect(out);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.02);
  }
  function tone(out, t, type, f1, f2, dur, vol, attack = 0.005) {
    const c = A.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f1, t);
    if (f2 && f2 !== f1) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    o.connect(g); g.connect(out);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.02);
  }

  // ---------------------------------------------------------------- Efeitos
  const SFX = {
    swing(t, o) { noiseBurst(A.sfxBus, t, 0.14, 1200, 'bandpass', 0.22, 4000); },
    heavySwing(t) { noiseBurst(A.sfxBus, t, 0.28, 500, 'bandpass', 0.3, 2500); tone(A.sfxBus, t, 'sine', 120, 60, 0.25, 0.15); },
    hit(t) { noiseBurst(A.sfxBus, t, 0.08, 2500, 'highpass', 0.22); tone(A.sfxBus, t, 'square', 180, 60, 0.1, 0.1); },
    heavyHit(t) { noiseBurst(A.sfxBus, t, 0.2, 800, 'lowpass', 0.4); tone(A.sfxBus, t, 'sine', 140, 40, 0.3, 0.35); },
    bolt(t) { tone(A.sfxBus, t, 'sine', 600, 1400, 0.12, 0.09); tone(A.sfxBus, t + 0.02, 'triangle', 1800, 2400, 0.08, 0.04); },
    charge(t) { tone(A.sfxBus, t, 'sine', 300, 900, 0.6, 0.05, 0.3); },
    chargeReady(t) { tone(A.sfxBus, t, 'triangle', 1200, 1200, 0.15, 0.08); tone(A.sfxBus, t + 0.06, 'triangle', 1600, 1600, 0.2, 0.07); },
    bigBolt(t) {
      tone(A.sfxBus, t, 'sawtooth', 200, 800, 0.35, 0.12); noiseBurst(A.sfxBus, t, 0.4, 2000, 'bandpass', 0.15, 600);
      INST.bell(A.reverbSend, t, 1320, 0.5, 0.06);
    },
    frost(t) {
      noiseBurst(A.sfxBus, t, 0.5, 6000, 'highpass', 0.15);
      for (let i = 0; i < 4; i++) INST.bell(A.sfxBus, t + i * 0.05, mtof(96 + i * 3), 0.3, 0.04);
    },
    blink(t) { tone(A.sfxBus, t, 'sine', 400, 2000, 0.15, 0.08); noiseBurst(A.sfxBus, t, 0.15, 3000, 'highpass', 0.06); },
    dash(t) { noiseBurst(A.sfxBus, t, 0.18, 800, 'bandpass', 0.18, 2400); },
    block(t) { tone(A.sfxBus, t, 'square', 900, 700, 0.08, 0.08); noiseBurst(A.sfxBus, t, 0.1, 5000, 'highpass', 0.15); },
    parry(t) {
      tone(A.sfxBus, t, 'square', 1500, 1500, 0.05, 0.08); INST.bell(A.sfxBus, t, 1760, 0.4, 0.14); INST.bell(A.reverbSend, t, 2640, 0.4, 0.06);
    },
    hurt(t) { tone(A.sfxBus, t, 'square', 400, 120, 0.18, 0.12); },
    down(t) { tone(A.sfxBus, t, 'triangle', 600, 100, 0.8, 0.15); },
    revive(t) { [72, 76, 79, 84].forEach((m, i) => INST.bell(A.sfxBus, t + i * 0.08, mtof(m), 0.4, 0.08)); },
    enemyHurt(t) { tone(A.sfxBus, t, 'square', 300, 150, 0.08, 0.07); },
    enemyDie(t) { noiseBurst(A.sfxBus, t, 0.3, 1200, 'bandpass', 0.2, 200); tone(A.sfxBus, t, 'square', 300, 50, 0.3, 0.08); },
    immune(t) { tone(A.sfxBus, t, 'square', 1200, 1100, 0.06, 0.05); },
    coin(t) { tone(A.sfxBus, t, 'square', 1320, 1320, 0.05, 0.05); tone(A.sfxBus, t + 0.05, 'square', 1760, 1760, 0.12, 0.05); },
    pickup(t) { [76, 81, 88].forEach((m, i) => tone(A.sfxBus, t + i * 0.06, 'triangle', mtof(m), mtof(m), 0.12, 0.08)); },
    heal(t) { [72, 76, 79].forEach((m, i) => INST.bell(A.sfxBus, t + i * 0.07, mtof(m), 0.3, 0.07)); },
    chest(t) { [67, 71, 74, 79, 83].forEach((m, i) => INST.harp(A.sfxBus, t + i * 0.07, mtof(m), 0.3, 0.12)); },
    solved(t) { [74, 78, 81, 86, 90].forEach((m, i) => INST.bell(A.sfxBus, t + i * 0.1, mtof(m), 0.5, 0.09)); },
    gate(t) { noiseBurst(A.sfxBus, t, 0.8, 200, 'lowpass', 0.3); tone(A.sfxBus, t, 'sawtooth', 60, 40, 0.8, 0.06); },
    lever(t) { tone(A.sfxBus, t, 'square', 300, 200, 0.05, 0.08); noiseBurst(A.sfxBus, t + 0.05, 0.12, 400, 'lowpass', 0.25); },
    plate(t) { tone(A.sfxBus, t, 'square', 200, 150, 0.06, 0.06); },
    crystal(t) { INST.bell(A.sfxBus, t, 1568, 0.4, 0.1); INST.bell(A.sfxBus, t + 0.05, 2093, 0.4, 0.06); },
    push(t) { noiseBurst(A.sfxBus, t, 0.25, 300, 'lowpass', 0.25); },
    break(t) { noiseBurst(A.sfxBus, t, 0.4, 600, 'lowpass', 0.45); noiseBurst(A.sfxBus, t + 0.05, 0.3, 2000, 'bandpass', 0.2); },
    barrier(t) { tone(A.sfxBus, t, 'sawtooth', 800, 100, 0.5, 0.08); INST.bell(A.sfxBus, t, 990, 0.5, 0.08); noiseBurst(A.sfxBus, t, 0.4, 4000, 'highpass', 0.12); },
    step(t, o) {
      const s = (o && o.surface) || 'grass';
      const f = s === 'stone' ? 2200 : s === 'wood' ? 900 : s === 'water' ? 1500 : s === 'snow' ? 700 : 1400;
      noiseBurst(A.sfxBus, t, s === 'snow' ? 0.08 : 0.05, f, s === 'snow' ? 'lowpass' : 'bandpass', s === 'stone' ? 0.05 : s === 'snow' ? 0.06 : 0.035);
    },
    ui(t) { tone(A.sfxBus, t, 'square', 880, 880, 0.03, 0.035); },
    uiOk(t) { tone(A.sfxBus, t, 'square', 990, 990, 0.04, 0.04); tone(A.sfxBus, t + 0.05, 'square', 1320, 1320, 0.07, 0.04); },
    uiBack(t) { tone(A.sfxBus, t, 'square', 660, 440, 0.07, 0.04); },
    blip(t, o) { tone(A.sfxBus, t, 'square', (o && o.pitch) || 600, (o && o.pitch) || 600, 0.025, 0.018); },
    explosion(t) { noiseBurst(A.sfxBus, t, 0.8, 1500, 'lowpass', 0.5, 100); tone(A.sfxBus, t, 'sine', 90, 30, 0.6, 0.35); },
    roar(t) {
      const c = A.ctx, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(90, t); o.frequency.linearRampToValueAtTime(60, t + 1.2);
      const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 18; lg.gain.value = 20; l.connect(lg); lg.connect(o.frequency);
      f.type = 'lowpass'; f.frequency.value = 700; o.connect(f); f.connect(g); g.connect(A.sfxBus); g.connect(A.reverbSend);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.3, t + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
      o.start(t); l.start(t); o.stop(t + 1.4); l.stop(t + 1.4);
      noiseBurst(A.sfxBus, t, 1.2, 400, 'lowpass', 0.2);
    },
    checkpoint(t) { [79, 83, 86, 91].forEach((m, i) => INST.bell(A.reverbSend, t + i * 0.12, mtof(m), 0.6, 0.1)); },
    memory(t) { [72, 79, 84, 88, 91].forEach((m, i) => INST.bell(A.reverbSend, t + i * 0.18, mtof(m), 0.8, 0.12)); },
    splash(t) { noiseBurst(A.sfxBus, t, 0.35, 1200, 'lowpass', 0.3, 300); },
    fall(t) { tone(A.sfxBus, t, 'sine', 800, 100, 0.6, 0.12); },
    slime(t) { tone(A.sfxBus, t, 'sine', 200, 400, 0.08, 0.06); },
    howl(t) { tone(A.sfxBus, t, 'sine', 500, 900, 0.5, 0.06, 0.2); tone(A.sfxBus, t + 0.5, 'sine', 900, 600, 0.6, 0.05); },
    special(t) { [60, 67, 72, 79, 84].forEach((m, i) => INST.bell(A.sfxBus, t + i * 0.04, mtof(m), 0.6, 0.08)); noiseBurst(A.sfxBus, t, 0.6, 3000, 'bandpass', 0.15, 500); },
    combo(t) { tone(A.sfxBus, t, 'square', 1046, 1046, 0.06, 0.06); tone(A.sfxBus, t + 0.06, 'square', 1568, 1568, 0.12, 0.06); },
    taunt(t) { tone(A.sfxBus, t, 'sawtooth', 220, 330, 0.3, 0.07); },
    bridge(t) { INST.bell(A.sfxBus, t, 880, 0.3, 0.04); },
    shatter(t) { noiseBurst(A.sfxBus, t, 0.35, 5000, 'highpass', 0.3); [91, 95, 98].forEach((m, i) => INST.bell(A.sfxBus, t + i * 0.03, mtof(m), 0.2, 0.05)); },
    levelup(t) { [72, 76, 79, 84, 88].forEach((m, i) => INST.harp(A.sfxBus, t + i * 0.06, mtof(m), 0.3, 0.1)); },
    fire(t) { noiseBurst(A.sfxBus, t, 0.35, 900, 'bandpass', 0.25, 300); tone(A.sfxBus, t, 'sawtooth', 160, 90, 0.3, 0.06); },
    melt(t) { noiseBurst(A.sfxBus, t, 0.5, 3000, 'highpass', 0.12, 900); tone(A.sfxBus, t, 'sine', 900, 300, 0.4, 0.05); },
    stasis(t) { [84, 79, 76, 72].forEach((m, i) => INST.bell(A.reverbSend, t + i * 0.09, mtof(m), 0.6, 0.08)); tone(A.sfxBus, t, 'sine', 800, 200, 0.8, 0.05, 0.2); },
    lift(t) { tone(A.sfxBus, t, 'triangle', 300, 500, 0.12, 0.08); },
    throw(t) { noiseBurst(A.sfxBus, t, 0.3, 700, 'bandpass', 0.22, 2400); tone(A.sfxBus, t, 'triangle', 400, 900, 0.25, 0.06); },
    land(t) { noiseBurst(A.sfxBus, t, 0.12, 600, 'lowpass', 0.25); tone(A.sfxBus, t, 'sine', 160, 70, 0.12, 0.12); },
    freeze(t) { noiseBurst(A.sfxBus, t, 0.4, 5000, 'highpass', 0.18); [91, 96].forEach((m, i) => INST.bell(A.sfxBus, t + i * 0.05, mtof(m), 0.3, 0.05)); },
    beam(t) { tone(A.sfxBus, t, 'square', 1200, 1800, 0.2, 0.03); },
    wind(t) { noiseBurst(A.sfxBus, t, 0.8, 500, 'bandpass', 0.12, 1400); },
    bell(t) { [76, 83, 88].forEach((m, i) => INST.bell(A.reverbSend, t + i * 0.25, mtof(m), 1.2, 0.12)); },
    teleport(t) { tone(A.sfxBus, t, 'sine', 1800, 300, 0.25, 0.07); noiseBurst(A.sfxBus, t, 0.2, 4000, 'highpass', 0.08); },
  };
  const lastPlayed = {};
  A.sfx = function (name, opts) {
    if (!A.ready || !SFX[name]) return;
    const file = G.AudioFiles && G.AudioFiles.sfx && G.AudioFiles.sfx[name];
    const now = A.ctx.currentTime;
    // evita empilhar o mesmo som no mesmo instante
    if (lastPlayed[name] && now - lastPlayed[name] < 0.03) return;
    lastPlayed[name] = now;
    if (file) { const el = new Audio(file); el.volume = A.vol.sfx; el.play().catch(() => {}); return; }
    try { SFX[name](now + 0.005, opts); } catch (e) { /* ignora */ }
  };

  G.Audio = A;
})();

// Substituição por arquivos de áudio reais (opcional).
// Exemplo: G.AudioFiles.music.village = 'assets/audio/vila.ogg';
G.AudioFiles = { music: {}, sfx: {} };
