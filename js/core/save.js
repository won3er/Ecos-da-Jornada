// Salvamento em LocalStorage (com fallback em memória se o navegador bloquear).
(function () {
  const KEY = 'ecos_da_jornada_save_v1';
  const SETTINGS_KEY = 'ecos_da_jornada_settings_v1';
  let memSave = null, memSettings = null;

  const S = {};

  S.write = function (data) {
    const json = JSON.stringify(data);
    try { localStorage.setItem(KEY, json); } catch (e) { memSave = json; }
    return true;
  };
  S.read = function () {
    let json = null;
    try { json = localStorage.getItem(KEY); } catch (e) { json = memSave; }
    if (!json) json = memSave;
    if (!json) return null;
    try { return JSON.parse(json); } catch (e) { return null; }
  };
  S.exists = function () { return !!S.read(); };
  S.clear = function () {
    try { localStorage.removeItem(KEY); } catch (e) { /* */ }
    memSave = null;
  };

  S.defaultSettings = () => ({
    music: 0.55, sfx: 0.8, shake: true, solo: false, showFps: false, assist: false, lang: 'en',
  });
  S.loadSettings = function () {
    let json = null;
    try { json = localStorage.getItem(SETTINGS_KEY); } catch (e) { json = memSettings; }
    const def = S.defaultSettings();
    if (!json) return def;
    try { return Object.assign(def, JSON.parse(json)); } catch (e) { return def; }
  };
  S.saveSettings = function (s) {
    const json = JSON.stringify(s);
    try { localStorage.setItem(SETTINGS_KEY, json); } catch (e) { memSettings = json; }
  };

  G.Save = S;
})();
