// Conclusão (100%): memórias, segredos, missões, colecionáveis, chefes,
// moradores descongelados e bestiário. Usado pelo Diário e pelos créditos.
(function () {
  const BOSSES = [
    ['golem_dead', 'Guardião de Pedra'], ['boss_dead', 'Morvath'], ['lobo_dead', 'Lobo Cinzento (elite)'],
    ['grumak_dead', 'Grumak'], ['ysveth_dead', 'Ysveth'], ['alfa_dead', 'Lobo Alfa (elite)'],
    ['ecos_dead', 'Os Ecos'], ['sentinela_dead', 'Sentinela Antiga (elite)'], ['nyxara_dead', 'Nyxara'],
  ];
  G.BOSS_FLAGS = BOSSES;
  G.THAW_NPCS = ['isolde', 'garrik', 'nessa', 'holt', 'yara', 'hrolf', 'tavi'];

  let secretCache = null;
  G.totalSecrets = function () {
    if (secretCache) return secretCache;
    const set = new Set();
    for (const id in G.Areas) {
      const a = G.Areas[id];
      for (const e of a.entities || []) if (e.flag && String(e.flag).startsWith('secret_')) set.add(e.flag);
      for (const z of a.zones || []) if (z.flag && String(z.flag).startsWith('secret_')) set.add(z.flag);
    }
    secretCache = set.size || 6;
    return secretCache;
  };

  G.completion = function (g) {
    const mem = Object.keys(G.MemoryDefs).length;
    const quests = Object.keys(G.Quests).length;
    const pages = g.inv.count('pagina') + (g.inv.has('grimorio') ? 5 : 0);
    const diary = g.inv.count('pagina_diario') + (g.inv.has('brasao_vigilia') ? 5 : 0);
    const stars = g.inv.count('constelacao') + (g.inv.has('coroa_estelar') ? 7 : 0);
    const beasts = Object.keys(G.BestiaryInfo || {}).length;
    const rows = [
      ['Memórias', g.memories.size, mem],
      ['Segredos', g.secretsFound(), G.totalSecrets()],
      ['Missões concluídas', Object.keys(G.Quests).filter((q) => g.questState(q) === 'done').length, quests],
      ['Páginas do Grimório', Math.min(5, pages), 5],
      ['Páginas do Diário de Hadrik', Math.min(5, diary), 5],
      ['Fragmentos de Constelação', Math.min(7, stars), 7],
      ['Chefes e elites', BOSSES.filter(([f]) => g.flag(f)).length, BOSSES.length],
      ['Moradores descongelados', G.THAW_NPCS.filter((n) => g.flag('thaw_' + n)).length, G.THAW_NPCS.length],
      ['Bestiário', Object.keys(G.BestiaryInfo || {}).filter((k) => g.bestiary[k]).length, beasts],
    ];
    let got = 0, tot = 0;
    for (const [, a, b] of rows) { got += Math.min(a, b); tot += b; }
    return { rows, pct: tot ? Math.floor((got / tot) * 100) : 0 };
  };
})();
