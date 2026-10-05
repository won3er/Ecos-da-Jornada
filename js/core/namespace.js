// Namespace global do jogo. Todos os sistemas se registram aqui.
// Usamos scripts clássicos (não módulos) para que o jogo rode com
// um duplo clique no index.html, sem servidor (file://).
window.G = {
  VIEW_W: 480,
  VIEW_H: 270,
  TILE: 16,
  VERSION: '2.0.0',
  debug: false,
  // Registros preenchidos pelos arquivos de dados / fases
  Areas: {},
  Scenes: {},
};
