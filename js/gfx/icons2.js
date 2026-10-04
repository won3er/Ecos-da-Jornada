// Ícones extras (Capítulos II e III). Registrados no G.Icons.init.
G.IconsExtra = function (icon, P) {
  const potion = (liq, cork = '#c8b07a') => (x) => { x.fillStyle = '#3a2a3a'; x.fillRect(4, 0, 2, 2); x.fillRect(2, 2, 6, 7); x.fillStyle = liq; x.fillRect(3, 4, 4, 4); x.fillStyle = '#ffffff'; x.fillRect(3, 3, 1, 1); x.fillStyle = cork; x.fillRect(4, 1, 2, 1); };
  icon('potion2', (x) => { potion('#ff3a6a', '#ffd84a')(x); x.fillStyle = '#ffd84a'; x.fillRect(1, 2, 1, 7); x.fillRect(8, 2, 1, 7); });
  icon('elixir', (x) => { potion('#c84aff')(x); x.fillStyle = '#7aff8a'; x.fillRect(3, 6, 4, 2); });
  icon('tonic', (x) => { potion('#ffd84a')(x); x.fillStyle = '#ffffff'; x.fillRect(5, 5, 1, 2); });
  icon('boots', (x) => { x.fillStyle = '#5a3a22'; x.fillRect(2, 1, 4, 6); x.fillRect(2, 6, 7, 3); x.fillStyle = '#8a5a32'; x.fillRect(3, 1, 2, 5); x.fillStyle = '#c8d0dc'; x.fillRect(2, 9, 1, 1); x.fillRect(5, 9, 1, 1); x.fillRect(8, 9, 1, 1); });
  icon('gloves', (x) => { x.fillStyle = '#4a4652'; x.fillRect(2, 3, 6, 6); x.fillRect(1, 1, 2, 4); x.fillStyle = '#8a8692'; x.fillRect(3, 3, 4, 3); x.fillRect(3, 1, 1, 2); x.fillRect(5, 1, 1, 2); x.fillRect(7, 2, 1, 2); });
  icon('amulet2', (x) => { x.fillStyle = '#c8b07a'; x.fillRect(2, 0, 1, 4); x.fillRect(7, 0, 1, 4); x.fillRect(3, 4, 4, 1); x.fillStyle = '#c84a1a'; x.fillRect(3, 5, 4, 4); x.fillStyle = '#ffd84a'; x.fillRect(4, 6, 2, 2); });
  icon('necklace', (x) => { P.ring(x, 5, 4, 4, '#f2d98c'); x.fillStyle = '#ff9ad8'; x.fillRect(4, 7, 2, 3); x.fillStyle = '#8ae8ff'; x.fillRect(4, 8, 1, 1); });
  icon('cloak2', (x) => { x.fillStyle = '#c8d4e4'; x.fillRect(2, 1, 6, 8); x.fillRect(1, 4, 8, 5); x.fillStyle = '#ffffff'; x.fillRect(3, 2, 2, 6); x.fillStyle = '#8a96aa'; x.fillRect(4, 1, 2, 1); });
  icon('cloak3', (x) => { x.fillStyle = '#2a4a8a'; x.fillRect(2, 1, 6, 8); x.fillRect(1, 4, 8, 5); x.fillStyle = '#4a78c8'; x.fillRect(3, 2, 2, 6); x.fillStyle = '#f2d98c'; x.fillRect(4, 1, 2, 1); });
  icon('ribbon2', (x) => { x.fillStyle = '#6ad8a8'; x.fillRect(1, 2, 3, 3); x.fillRect(6, 2, 3, 3); x.fillRect(4, 3, 2, 2); x.fillStyle = '#ff9ad8'; x.fillRect(3, 5, 2, 4); x.fillRect(5, 5, 2, 4); });
  icon('claw', (x) => { x.fillStyle = '#e8f0f8'; for (let i = 0; i < 3; i++) { x.fillRect(2 + i * 3, 1 + i, 2, 6); x.fillRect(3 + i * 3, 7 + i, 1, 2); } x.fillStyle = '#8ac0e0'; x.fillRect(2, 1, 1, 3); });
  icon('hourglass', (x) => { x.fillStyle = '#c8b07a'; x.fillRect(1, 0, 8, 1); x.fillRect(1, 9, 8, 1); x.fillStyle = '#a8dcf4'; x.fillRect(2, 1, 6, 2); x.fillRect(3, 3, 4, 1); x.fillRect(4, 4, 2, 2); x.fillRect(3, 6, 4, 1); x.fillRect(2, 7, 6, 2); x.fillStyle = '#ffffff'; x.fillRect(4, 7, 1, 1); });
  icon('crest', (x) => { x.fillStyle = '#5a6476'; x.fillRect(1, 0, 8, 6); x.fillRect(2, 6, 6, 2); x.fillRect(3, 8, 4, 2); x.fillStyle = '#c8d4e4'; x.fillRect(2, 1, 6, 5); x.fillStyle = '#4a78c8'; x.fillRect(4, 2, 2, 5); x.fillRect(3, 3, 4, 1); });
  icon('crown', (x) => { x.fillStyle = '#d9b45a'; x.fillRect(1, 4, 8, 4); x.fillRect(1, 2, 1, 2); x.fillRect(4, 1, 2, 3); x.fillRect(8, 2, 1, 2); x.fillStyle = '#c8a8ff'; x.fillRect(4, 5, 2, 2); x.fillStyle = '#fff'; x.fillRect(2, 5, 1, 1); x.fillRect(7, 5, 1, 1); });
  icon('twin', (x) => { P.circle(x, 3, 5, 3, '#8ae8ff'); P.circle(x, 7, 5, 3, '#ff8a6a'); x.fillStyle = '#ffffff'; x.fillRect(4, 4, 2, 2); });
  icon('heartstar', (x) => { x.fillStyle = '#f2d98c'; x.fillRect(1, 2, 3, 4); x.fillRect(6, 2, 3, 4); x.fillRect(2, 6, 6, 2); x.fillRect(4, 8, 2, 1); x.fillRect(4, 3, 2, 3); x.fillStyle = '#ffffff'; x.fillRect(2, 3, 1, 1); x.fillRect(4, 4, 2, 1); });
  icon('page2', (x) => { x.fillStyle = '#3a4250'; x.fillRect(1, 0, 8, 10); x.fillStyle = '#d8dce4'; x.fillRect(2, 1, 6, 8); x.fillStyle = '#4a78c8'; x.fillRect(3, 3, 4, 1); x.fillRect(3, 5, 3, 1); x.fillRect(3, 7, 4, 1); });
  icon('constel', (x) => { x.fillStyle = '#4e4a8e'; P.line(x, 1, 7, 4, 3, '#4e4a8e'); P.line(x, 4, 3, 8, 5, '#4e4a8e'); P.line(x, 8, 5, 6, 9, '#4e4a8e'); x.fillStyle = '#ffffff'; for (const [a, b] of [[1, 7], [4, 3], [8, 5], [6, 9]]) x.fillRect(a, b, 1, 1); x.fillStyle = '#f2d98c'; x.fillRect(4, 2, 1, 1); });
  icon('icecrystal', (x) => { x.fillStyle = '#2a6a98'; x.fillRect(3, 0, 4, 10); x.fillRect(1, 3, 8, 4); x.fillStyle = '#a8e0ff'; x.fillRect(4, 1, 2, 8); x.fillStyle = '#fff'; x.fillRect(4, 2, 1, 3); });
  icon('core', (x) => { P.circle(x, 5, 5, 4, '#c8962a'); P.circle(x, 5, 5, 3, '#ffe680'); x.fillStyle = '#ffffff'; x.fillRect(4, 3, 2, 2); });
  icon('fire', (x) => { x.fillStyle = '#c8401a'; x.fillRect(2, 4, 6, 6); x.fillRect(3, 2, 4, 2); x.fillRect(4, 0, 2, 2); x.fillStyle = '#ff8a3a'; x.fillRect(3, 5, 4, 4); x.fillRect(4, 3, 2, 2); x.fillStyle = '#ffe680'; x.fillRect(4, 6, 2, 3); });
  icon('stasis', (x) => { P.ring(x, 5, 5, 4, '#c8f0ff'); x.fillStyle = '#ffffff'; x.fillRect(5, 2, 1, 4); x.fillRect(5, 5, 3, 1); x.fillStyle = '#8ac0e0'; x.fillRect(1, 5, 1, 1); x.fillRect(9, 5, 1, 1); });
  icon('leap', (x) => { x.fillStyle = '#ffe680'; for (let i = 0; i < 8; i++) x.fillRect(1 + i, 8 - Math.round(Math.sin(i / 7 * Math.PI) * 6), 2, 1); x.fillStyle = '#fff'; x.fillRect(8, 7, 2, 2); });
  icon('throw', (x) => { x.fillStyle = '#c8a8ff'; P.circle(x, 7, 3, 2, '#c8a8ff'); x.fillStyle = '#ff8a6a'; x.fillRect(1, 6, 3, 4); x.fillStyle = '#fff'; for (let i = 0; i < 3; i++) x.fillRect(3 + i, 6 - i, 1, 1); });
};
