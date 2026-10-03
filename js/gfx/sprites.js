// Sprites dos personagens e inimigos em pixel art (grades de texto + paleta).
// Para trocar a arte: substitua as grades/paletas aqui ou aponte G.SpriteOverrides
// para imagens PNG (veja README).
(function () {
  const P = G.Pixel, U = G.U;
  const S = { cache: {} };

  // ------------------------------------------------------------------ LIRIEN (maga elfa)
  const LIRIEN_PAL = {
    d: '#2b1830', h: '#4d2a52', H: '#7a4580', // cabelo ameixa
    s: '#f3d6bd', S: '#d6a68a', e: '#d99a2b', m: '#b8645c', // pele, olhos âmbar
    k: '#1c3436', g: '#2c5c58', G: '#45877e', // manto verde-azulado
    y: '#d9b45a', Y: '#f2d98c', // dourado
    w: '#ece3cf', W: '#bdb198', // vestido creme
    b: '#3a2826', B: '#5a3e36', // botas
  };
  const LIRIEN = {
    down: [
      '................',
      '......dddd......',
      '....ddhHHhdd....',
      '...dhHHhhhhhd...',
      '...dhHhhhhhhd...',
      '..dhhhhhhhhhhd..',
      '.sdhhshhhhshhds.',
      'sSdhseSssSeshdSs',
      '.SdhsesssseshdS.',
      '..dhssssssssshd.',
      '..dhhssmmsshhd..',
      '..dhhhsSSshhhd..',
      '..dhkgGyyGgkhd..',
      '..dhkggwwggkhd..',
      '.dhkggGwwGggkhd.',
      '.dhkggGwwGggkhd.',
      '.dkggGwwwwGggkd.',
      '.dkgyyyyyyyygkd.',
      '..kggwwWWwwggk..',
      '..kgGwWWWWwGgk..',
      '..kggwWWWWwggk..',
      '...kgwWWWWwgk...',
    ],
    up: [
      '................',
      '......dddd......',
      '....ddhhhhdd....',
      '...dhhhHHhhhd...',
      '...dhhHhhHhhd...',
      '..dhhhhhhhhhhd..',
      '.sdhhhhhhhhhhds.',
      'sSdhhhHhhHhhhdSs',
      '.SdhhhhhhhhhhdS.',
      '..dhhhhHHhhhhd..',
      '..dhhhhhhhhhhd..',
      '..dhhhHhhHhhhd..',
      '..dhkhhhhhhkhd..',
      '.kggghhhhhhgggk.',
      '.kggghhhhhhgggk.',
      '.kgggdhhhhdgggk.',
      '.kggggdhhdggggk.',
      '.kgyyyyddyyyygk.',
      '..kggggggggggk..',
      '..kgGggggggGgk..',
      '..kggggggggggk..',
      '...kggggggggk...',
    ],
    right: [
      '................',
      '......dddd......',
      '....ddhhhhd.....',
      '...dhhHHhhhd....',
      '..dhhHhhhhhhd...',
      '..dhhhhhhhhhhd..',
      '.dhhhhhhhhhsshd.',
      'sShhhhhhhhsseSd.',
      '.Sdhhhhhhhssessd',
      '..dhhhhhhhsssss.',
      '..dhhhhhhhssmsd.',
      '..dhhhhhhhhsSd..',
      '..dhhhhkgGyyk...',
      '..dhhhkggwwgk...',
      '..dhhkggGwwGk...',
      '..dhhkggGwwgk...',
      '...dhkggwwwgk...',
      '...dkyyyyyyyk...',
      '...kggwwWWwgk...',
      '...kgGwWWWwgk...',
      '...kggwWWWwgk...',
      '....kgwWWWgk....',
    ],
  };
  // pernas (2 linhas) — idle, passo A, passo B
  const LIRIEN_LEGS = {
    down: [['....bbb..bbb....', '....BbB..BbB....'], ['....bbb..bbb....', '....BbB.........'], ['....bbb..bbb....', '.........BbB....']],
    up: [['....bbb..bbb....', '....BbB..BbB....'], ['....bbb..bbb....', '....BbB.........'], ['....bbb..bbb....', '.........BbB....']],
    right: [['.....bbbbb......', '.....BbbBb......'], ['....bbb.bbb.....', '...BbB...BbB....'], ['.....bbbbb......', '......BbbB......']],
  };

  // ------------------------------------------------------------------ ALDREN (herói espadachim)
  const ALDREN_PAL = {
    d: '#3d2214', h: '#6e4024', H: '#9a6234', // cabelo castanho
    s: '#f0cfb2', S: '#cf9c7f', e: '#2a3550', m: '#a8594f',
    n: '#5d6676', a: '#9aa6b6', A: '#dbe4ee', // armadura de aço
    q: '#5c1820', r: '#962a32', R: '#c8484a', // capa carmesim
    l: '#5a3920', L: '#8a5a32', // couro
    p: '#36304a', P: '#4b4466', // calça
    b: '#3e2a1c', B: '#5e4030', // botas
  };
  const ALDREN = {
    down: [
      '................',
      '................',
      '.....dddddd.....',
      '....dhhHHhhd....',
      '...dhHHhhhhhd...',
      '...dhhhhhhhhd...',
      '...dhhshhshhd...',
      '...dhsesseshd...',
      '....SsesseS.....',
      '....ssssssss....',
      '.....ssmms......',
      '......sSSs......',
      '...rRqaAAaqRr...',
      '..rRqaAaaAaqRr..',
      '..rRnaAaaAanRr..',
      '..rrnaaaaaanrr..',
      '..qrlLLllLLlrq..',
      '..qrsnaaaansrq..',
      '..qq.pPppPp.qq..',
      '..q..pPppPp..q..',
      '.....pp..pp.....',
      '.....pp..pp.....',
    ],
    up: [
      '................',
      '................',
      '.....dddddd.....',
      '....dhhhhhhd....',
      '...dhhHHhhhhd...',
      '...dhHhhhhHhd...',
      '...dhhhhhhhhd...',
      '...dhhhhhhhhd...',
      '....dhhhhhhd....',
      '....Sdhhhhds....',
      '.....ssssss.....',
      '......sSSs......',
      '...rRqrrrrqRr...',
      '..rRrRrrrrRrRr..',
      '..rRrrRrrRrrRr..',
      '..rrrrrrrrrrrr..',
      '..qrrlLllLlrrq..',
      '..qrrrrrrrrrrq..',
      '..qqrrrqqrrrqq..',
      '..q..pPppPp..q..',
      '.....pp..pp.....',
      '.....pp..pp.....',
    ],
    right: [
      '................',
      '................',
      '.....ddddd......',
      '....dhhHHhd.....',
      '...dhHhhhhhd....',
      '...dhhhhhhhhd...',
      '...dhhhhhsshd...',
      '...dhhhhsseS....',
      '...dhhhhsssss...',
      '....dhhhsssss...',
      '.....hhsssms....',
      '......ssSs......',
      '....rqaAAaq.....',
      '...rRqaAaAa.....',
      '...rRnaAaAan....',
      '...rrnaaaaan....',
      '...qrlLLlLLl....',
      '...qrsnaaaan....',
      '...qq.pPpPp.....',
      '...q..pPpPp.....',
      '......pp.pp.....',
      '......pp.pp.....',
    ],
  };
  const ALDREN_LEGS = {
    down: [['.....bb..bb.....', '....Bbb..bbB....'], ['.....bb..bb.....', '....Bbb.........'], ['.....bb..bb.....', '.........bbB....']],
    up: [['.....bb..bb.....', '....Bbb..bbB....'], ['.....bb..bb.....', '....Bbb.........'], ['.....bb..bb.....', '.........bbB....']],
    right: [['......bbbb......', '......BbbB......'], ['.....bb..bb.....', '....Bb....bB....'], ['......bbbb......', '.......bbB......']],
  };

  // ------------------------------------------------------------------ ALDREN CRIANÇA (memórias)
  const KID_PAL = Object.assign({}, ALDREN_PAL, {
    t: '#4a6a9a', T: '#6a8cc0', // túnica azul de criança
  });
  const KID = {
    down: [
      '............',
      '...dddddd...',
      '..dhHHhhhd..',
      '.dhHhhhhhhd.',
      '.dhhshhshhd.',
      '.dhsesseshd.',
      '..SsesseS...',
      '..ssssssss..',
      '...ssmms....',
      '..tTTttTTt..',
      '.ttTttttTtt.',
      '.stttlltttS.',
      '..ttttttttt.',
      '...pp..pp...',
    ],
    up: [
      '............',
      '...dddddd...',
      '..dhhhhhhd..',
      '.dhHHhhhhhd.',
      '.dhhhhhhHhd.',
      '.dhhhhhhhhd.',
      '..dhhhhhhd..',
      '..sssssss...',
      '...ssssss...',
      '..tttttttt..',
      '.ttTttttTtt.',
      '.sttlllltts.',
      '..ttttttttt.',
      '...pp..pp...',
    ],
    right: [
      '............',
      '...ddddd....',
      '..dhHHhhd...',
      '.dhHhhhhhd..',
      '.dhhhhhsshd.',
      '.dhhhhseS...',
      '.dhhhhsssss.',
      '..dhhssssms.',
      '....sSSs....',
      '...ttTTtt...',
      '...tTtttTt..',
      '...ttlllts..',
      '...ttttttt..',
      '....pp.pp...',
    ],
  };
  const KID_LEGS = {
    down: [['...bb..bb...'], ['...bb.......'], ['.......bb...']],
    up: [['...bb..bb...'], ['...bb.......'], ['.......bb...']],
    right: [['....bbbb....'], ['...bb..bb...'], ['.....bb.....']],
  };

  // ------------------------------------------------------------------ NPC genérico
  // Paleta variável por NPC: h/H cabelo, c/C/k roupa, p calça, x acessório
  const NPC_BASE = [
    '................',
    '................',
    '.....hhhhhh.....',
    '....hhHHhhhh....',
    '...hhHhhhhhhh...',
    '...hhssssssh....',
    '...hsesssseh....',
    '....sesssses....',
    '....ssssssss....',
    '.....ssmmss.....',
    '......ssss......',
    '....ckCCCCkc....',
    '...cckCccCkcc...',
    '...cCkCccCkCc...',
    '...cCkCccCkCc...',
    '...scCCCCCCcs...',
    '...skllllllks...',
    '....kcCccCck....',
    '....kccccccck...',
    '....kcccccck....',
    '.....pp..pp.....',
    '.....pp..pp.....',
    '.....bb..bb.....',
    '....bbb..bbb....',
  ];
  // Fix: linhas com 16 colunas exatas
  function fix(rows, w) { return rows.map((r) => (r + '.'.repeat(w)).slice(0, w)); }

  function buildChar(base, legs, pal, w) {
    const out = {};
    for (const dir of ['down', 'up', 'right']) {
      out[dir] = legs[dir].map((legRows) => {
        const rows = fix(base[dir].concat(legRows), w);
        return P.outline(P.fromRows(rows, pal));
      });
      out[dir + '_white'] = out[dir].map((c) => P.silhouette(c, '#ffffff'));
    }
    out.left = out.right.map(P.flipH);
    out.left_white = out.right_white.map(P.flipH);
    return out;
  }

  S.init = function () {
    S.lirien = buildChar(LIRIEN, LIRIEN_LEGS, LIRIEN_PAL, 16);
    S.aldren = buildChar(ALDREN, ALDREN_LEGS, ALDREN_PAL, 16);
    S.kid = buildChar(KID, KID_LEGS, KID_PAL, 12);
    S.aldrenCosmetic = {};
    // Retratos (cabeça ampliada 2x)
    S.portraits = {
      lirien: makePortrait(S.lirien.down[0], 0, 18, '#22323a'),
      aldren: makePortrait(S.aldren.down[0], 1, 18, '#3a2228'),
      kid: makePortrait(S.kid.down[0], 0, 14, '#22283a'),
    };
    buildEnemies();
  };

  // Variação de cor da capa (cosmético)
  S.recolor = function (which, overrides) {
    const key = which + JSON.stringify(overrides);
    if (S.cache[key]) return S.cache[key];
    const pal = Object.assign({}, which === 'aldren' ? ALDREN_PAL : LIRIEN_PAL, overrides);
    const r = which === 'aldren' ? buildChar(ALDREN, ALDREN_LEGS, pal, 16) : buildChar(LIRIEN, LIRIEN_LEGS, pal, 16);
    S.cache[key] = r;
    return r;
  };

  function makePortrait(sprite, yOff, h, bg) {
    return P.make(36, 36, (x) => {
      x.fillStyle = bg; x.fillRect(0, 0, 36, 36);
      x.fillStyle = 'rgba(255,255,255,0.06)'; x.fillRect(0, 0, 36, 12);
      x.drawImage(sprite, 0, yOff, sprite.width, h, 0, 2, sprite.width * 2, h * 2);
    });
  }

  // NPCs: gera variação por paleta + acessórios
  S.npc = function (look) {
    const key = 'npc' + JSON.stringify(look);
    if (S.cache[key]) return S.cache[key];
    const pal = {
      h: look.hair || '#5a3a22', H: U.shade(look.hair || '#5a3a22', 0.25),
      s: look.skin || '#f0cfb2', e: '#2a2430', m: '#b0605a',
      c: look.cloth || '#4a6a8a', C: U.shade(look.cloth || '#4a6a8a', 0.2), k: U.shade(look.cloth || '#4a6a8a', -0.3),
      l: look.belt || '#5a3920', p: look.pants || '#3a3448', b: '#3e2a1c',
    };
    let rows = NPC_BASE.slice();
    const kid = look.kid;
    const base = P.fromRows(fix(rows, 16), pal);
    const c = P.make(16, 24, (x) => {
      x.drawImage(base, 0, 0);
      if (look.beard) { x.fillStyle = look.beardColor || '#d8d4cc'; x.fillRect(4, 8, 8, 3); x.fillRect(5, 11, 6, 2); x.fillRect(6, 13, 4, 1); x.fillStyle = pal.m; }
      if (look.bald) { x.fillStyle = pal.s; x.fillRect(5, 2, 6, 2); }
      if (look.hat) {
        x.fillStyle = look.hat; x.fillRect(2, 3, 12, 2); x.fillRect(4, 0, 8, 3);
        x.fillStyle = U.shade(look.hat, -0.3); x.fillRect(4, 2, 8, 1);
      }
      if (look.scarf) { x.fillStyle = look.scarf; x.fillRect(3, 1, 10, 3); x.fillRect(2, 4, 2, 6); x.fillRect(12, 4, 2, 6); x.fillStyle = U.shade(look.scarf, -0.25); x.fillRect(3, 3, 10, 1); }
      if (look.apron) { x.fillStyle = look.apron; x.fillRect(5, 13, 6, 7); x.fillStyle = U.shade(look.apron, -0.2); x.fillRect(5, 13, 6, 1); }
      if (look.longHair) { x.fillStyle = pal.h; x.fillRect(3, 6, 1, 8); x.fillRect(12, 6, 1, 8); }
      if (look.staff) { x.fillStyle = '#7a5230'; x.fillRect(14, 6, 1, 18); x.fillStyle = '#a07040'; x.fillRect(13, 5, 3, 2); }
      if (look.robe) { x.fillStyle = pal.c; x.fillRect(4, 19, 8, 3); x.fillStyle = pal.k; x.fillRect(4, 21, 8, 1); }
    });
    let img = P.outline(c);
    if (kid) {
      img = P.make(18, 26, (x) => { x.drawImage(img, 0, 0, 18, 26, 2, 7, 14, 19); });
    }
    const out = { img, white: P.silhouette(img, '#fff'), flip: P.flipH(img) };
    S.cache[key] = out;
    return out;
  };

  // ------------------------------------------------------------------ INIMIGOS
  function buildEnemies() {
    // LOBO (perfil, olhando para a direita)
    const wolfPal = { d: '#1e1a26', k: '#3a3448', g: '#5a5468', G: '#7d7690', e: '#ffcf4a', w: '#e9e4f0', r: '#c0404a' };
    const wolfRun1 = [
      '....................',
      '...............kk...',
      '.............kkGGk..',
      '.k..........kgGGGkk.',
      'kgk..kkkkkkkggGeGGG.',
      '.kgkkgggGGGgggggGGww',
      '..kggggGGGGggggggkk.',
      '..kgggggGGgggggggk..',
      '...kggggggggggggk...',
      '...kgk.kkkkk.kgk....',
      '..kgk.........kgk...',
      '..kk...........kk...',
    ];
    const wolfRun2 = [
      '....................',
      '...............kk...',
      '.............kkGGk..',
      '............kgGGGkk.',
      '.kk..kkkkkkkggGeGGG.',
      'kgkkkgggGGGgggggGGww',
      '.kkggggGGGGggggggkk.',
      '..kgggggGGgggggggk..',
      '...kggggggggggggk...',
      '....kgkkkkkkkgk.....',
      '....kgk.....kgk.....',
      '.....kk......kk.....',
    ];
    const wolfAtk = [
      '....................',
      '................kk..',
      '..............kkGGk.',
      '.k...........kgGGGkk',
      'kgk..kkkkkkkkggGeGGG',
      '.kgkkgggGGGggggggrwr',
      '..kggggGGGGgggggggww',
      '..kgggggGGggggggggk.',
      '.kgggggggggggggggk..',
      'kgk...........kggk..',
      'kk..............kgk.',
      '.................kk.',
    ];
    S.wolf = mkSet([wolfRun1, wolfRun2, wolfAtk], wolfPal);
    const greyPal = Object.assign({}, wolfPal, { g: '#8a8494', G: '#bdb6c8', k: '#4a4458', e: '#ff6a3a' });
    S.greyWolf = mkSet([wolfRun1, wolfRun2, wolfAtk], greyPal);

    // MORCEGO
    const batPal = { k: '#1c1626', g: '#4a3058', G: '#6e4a82', e: '#ff5a5a', w: '#e8e0f0' };
    const bat1 = [
      'k..........k',
      'gk........kg',
      'gGk.kkkk.kGg',
      'gGGkgGGgkGGg',
      '.gGkgeegkGg.',
      '..kkgggkkk..',
      '....kwwk....',
      '............',
    ];
    const bat2 = [
      '............',
      '............',
      '....kkkk....',
      '..kkgGGgkk..',
      '.kgGgeegGgk.',
      'kgGkgggkkGgk',
      'gk..kwwk..kg',
      'k..........k',
    ];
    S.bat = mkSet([bat1, bat2], batPal);

    // ESQUELETO COM ESCUDO (frente) e ARQUEIRO
    const skPal = { k: '#2a2433', b: '#d9d2c3', B: '#f4efe4', d: '#9a917f', e: '#ff4a4a', s: '#6a5236', S: '#8c6c48', m: '#8a94a6', M: '#c6ceda', r: '#7a2a2a' };
    const skel = [
      '................',
      '.....kbbbbk.....',
      '....kbBBBbbk....',
      '....kbekkebk....',
      '....kbbkkbbk....',
      '.....kdbbdk.....',
      '......kbbk......',
      '...kkkbBBbkkk...',
      '..ksSskbbkbkk...',
      '.ksSSSkkbbbdb...',
      '.ksSmSkbbbkkbk..',
      '.ksSSSkbbbkdbk..',
      '.kssSskbbbk.mk..',
      '..kssk.kbk..Mk..',
      '...kk.kbkbk.mk..',
      '......kb.bk.k...',
      '.....kbk.kbk....',
      '.....kbk.kbk....',
      '....kbbk.kbbk...',
      '................',
    ];
    const skel2 = skel.map((r, i) => (i === 17 ? '.....kbk..kbk...' : i === 18 ? '....kbbk..kbbk..' : r));
    const skelAtk = [
      '..............M.',
      '.....kbbbbk..Mk.',
      '....kbBBBbbk.mk.',
      '....kbekkebkmk..',
      '....kbbkkbbkmk..',
      '.....kdbbdkkk...',
      '......kbbkbk....',
      '...kkkbBBbkk....',
      '..ksSskbbkk.....',
      '.ksSSSkkbbk.....',
      '.ksSmSkbbbk.....',
      '.ksSSSkbbbk.....',
      '.kssSskbbbk.....',
      '..kssk.kbk......',
      '...kk.kbkbk.....',
      '......kb.bk.....',
      '.....kbk.kbk....',
      '.....kbk.kbk....',
      '....kbbk.kbbk...',
      '................',
    ];
    S.skeleton = mkSet([skel, skel2, skelAtk], skPal);
    const arch = [
      '................',
      '.....kbbbbk.....',
      '....kbBBBbbk....',
      '....kbekkebk....',
      '....kbbkkbbk....',
      '.....kdbbdk..s..',
      '......kbbk..s.s.',
      '...kkkbBBbkks..s',
      '..kbkkkbbkbbs..s',
      '..kbk.kbbbkks..s',
      '..kbk.kbbbk.s..s',
      '..kbk.kbbbk..s.s',
      '..kbk.kbbbk...s.',
      '...k..kbbbk.....',
      '.....kbkbk......',
      '......kb.bk.....',
      '.....kbk.kbk....',
      '.....kbk.kbk....',
      '....kbbk.kbbk...',
      '................',
    ];
    const archDraw = arch.map((r, i) => (i >= 6 && i <= 12 ? r.slice(0, 11) + ['kSss.', 'krrrS', 'kbbbr', 'kbbbr', 'kbbbr', 'krrrS', 'kSss.'][i - 6] : r));
    S.archer = mkSet([arch, arch, archDraw], Object.assign({}, skPal, { r: '#e8e0c8' }));

    // BESOURO DE PEDRA (visto de cima)
    const btPal = { k: '#1e1a22', a: '#5a5f6e', A: '#8a90a2', c: '#b8bfd0', e: '#ffb84a', l: '#3a3040', L: '#6a5a50' };
    const beetle1 = [
      '................',
      '.....kkkkkk.....',
      '..l.kAAccAAk.l..',
      '...kAAAcAAAAk...',
      '.lkaAAAcAAAaak..',
      '..kaaAAcAAAaak..',
      '.lkaaaacaaaaakl.',
      '..kaaaacaaaaak..',
      '.lkkaaacaaaakkl.',
      '...kkaacaaakk...',
      '....kkkekkkk....',
      '......kkk.......',
    ];
    const beetle2 = beetle1.map((r) => r.replace(/^\.l/, 'l.').replace(/l\.$/, '.l'));
    const beetleFlip = [
      '................',
      '.....kkkkkk.....',
      '..l.kLLLLLLk.l..',
      '.l.kLlLlLlLLk.l.',
      '..kLLlLLlLLLLk..',
      '.lkLlLLlLLlLLkl.',
      '..kLLLlLLLlLLk..',
      '.lkLlLLLlLLlLkl.',
      '..kkLLlLLlLkk...',
      '...kkLLLLLkk....',
      '....kkkkkkk.....',
      '................',
    ];
    S.beetle = mkSet([beetle1, beetle2, beetleFlip], btPal);
  }

  function mkSet(frames, pal) {
    const w = Math.max(...frames.flat().map((r) => r.length));
    const imgs = frames.map((f) => P.outline(P.fromRows(fix(f, w), pal)));
    return {
      right: imgs,
      left: imgs.map(P.flipH),
      white: imgs.map((c) => P.silhouette(c, '#ffffff')),
      whiteL: imgs.map((c) => P.flipH(P.silhouette(c, '#ffffff'))),
    };
  }

  G.Sprites = S;
})();
