// Idiomas: o texto do jogo é escrito em português e traduzido na hora de
// desenhar. G.T(str) devolve a versão no idioma atual (padrão: inglês).
// Dicionários: G.LANG.en = { 'texto em português': 'English text', ... }
// Chaves com {} são modelos: 'Ouro: {}' -> 'Gold: {}'.
(function () {
  G.LANG = G.LANG || {};
  const I = {};
  I.lang = 'en';
  try {
    const s = JSON.parse(localStorage.getItem('ecos_da_jornada_settings_v1') || '{}');
    if (s.lang === 'pt' || s.lang === 'en') I.lang = s.lang;
  } catch (e) { /* */ }

  I.LANGS = [{ id: 'en', name: 'English' }, { id: 'pt', name: 'Português' }];
  let cache = new Map(), patterns = null, frags = null;
  I.set = function (lang) { I.lang = lang; cache = new Map(); };

  function build() {
    const d = G.LANG[I.lang] || {};
    patterns = []; frags = [];
    for (const k in d) {
      if (k.includes('{}')) {
        const parts = k.split('{}').map((p) => p.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/[{}]/g, '\\$&'));
        patterns.push({ re: new RegExp('^' + parts.join('([\\s\\S]*?)') + '$'), out: d[k], n: parts.length - 1, len: k.length });
      }
    }
    patterns.sort((a, b) => b.len - a.len);
    const fr = G.LANG[I.lang + '_frag'] || {};
    for (const k in fr) frags.push([k, fr[k]]);
    frags.sort((a, b) => b[0].length - a[0].length);
  }

  function tr(str) {
    const d = G.LANG[I.lang];
    if (!d) return str;
    if (d[str] !== undefined) return d[str];
    if (!patterns) build();
    // espaços nas pontas (ex.: ' Vida') preservados
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(str);
    if (m[1] || m[3]) { const inner = d[m[2]]; if (inner !== undefined) return m[1] + inner + m[3]; }
    for (const p of patterns) {
      const r = p.re.exec(str);
      if (r) {
        let i = 1;
        return p.out.replace(/\{\}/g, () => G.T(r[i++] || ''));
      }
    }
    if (frags.length && /[a-zà-ú]/i.test(str)) {
      let out = str;
      for (const [k, v] of frags) if (out.includes(k)) out = out.split(k).join(v);
      return out;
    }
    return str;
  }

  G.T = function (str) {
    if (I.lang === 'pt' || str == null) return str;
    str = String(str);
    if (!str) return str;
    let r = cache.get(str);
    if (r === undefined) {
      r = tr(str);
      if (cache.size > 6000) cache = new Map();
      cache.set(str, r);
    }
    return r;
  };
  G.I18n = I;
})();
