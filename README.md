# Ecos da Jornada — Capítulo I: O Começo da Jornada

Aventura cooperativa 2D em pixel art para **dois jogadores no mesmo computador**.
É uma fatia vertical completa da Fase 1, jogável do começo ao fim, com:

- menu;
- vila (hub) e cinco regiões;
- puzzles cooperativos;
- memórias jogáveis;
- mini-chefe e chefe final;
- cenas, save e tela de fim de capítulo.

> **Sobre os personagens:** o briefing pedia Frieren e Himmel. Como são personagens protegidos, o jogo usa uma dupla **original** com os mesmos papéis:
> - **Lirien**: maga élfica que vive há séculos;
> - **Aldren**: herói humano espadachim.
>
> O tema também é o mesmo: memória, passagem do tempo e cooperação. Nomes, falas e arte ficam em arquivos de dados isolados (veja "Trocar nomes, falas e arte").

---

## 1. Como executar

**Jeito mais simples:** dê dois cliques em `index.html`. O jogo abre no navegador (Chrome, Edge ou Firefox).

- Não precisa instalar nada, nem de internet ou servidor. Tudo é gerado por código: arte, música e efeitos.
- Na tela inicial, aperte qualquer tecla. Isso também liga o som.

Se o seu navegador bloquear arquivos locais, rode um servidor simples na pasta e abra `http://localhost:8000`:

```
python -m http.server 8000
```

Dicas:
- Tela cheia: Configurações → Tela cheia (ou F11 do navegador).
- Jogando sozinho: Configurações → **Modo solo**. Você controla um personagem e o outro segue e ajuda. **Tab** troca quem você controla.

---

## 2. Controles

| Ação | Jogador 1 — Lirien | Jogador 2 — Aldren |
|---|---|---|
| Mover | **W A S D** | **Setas** |
| Ataque | **J** — projétil mágico (segure: **magia carregada**) | **1** — golpe de espada, combo de 3 (segure: **golpe pesado**) |
| Habilidade | **K** — lança a magia selecionada | **2** — escudo (no instante certo: **aparar**) |
| Esquiva / interagir | **L** — teleporte curto / falar / abrir / reviver | **3** — investida / falar / alavancas / agarrar caixote / segurar inimigo tonto |
| Extra | **I** — troca de magia | **4** — provocar (os inimigos focam nele) |
| Especial (barra dourada cheia) | **J + K** — Tempestade Arcana | **1 + 2** — Corte do Herói |

Teclas gerais:
- **Esc / P**: pausa.
- **Enter / Espaço**: confirmar e avançar diálogo.
- **Tab**: troca de personagem no modo solo.
- O jogador 2 também pode usar o **teclado numérico** (1, 2, 3 e 4/5/0).

**Dois controles (gamepad):** o controle 1 é a Lirien e o controle 2 é o Aldren.

| Botão | Ação |
|---|---|
| Analógico / D-pad | Mover |
| X | Ataque |
| B | Habilidade |
| A | Esquiva / interagir |
| Y | Extra |
| Start | Pausa |
| Select | Trocar personagem (modo solo) |

---

## 3. Mecânicas principais

### Cooperação ("só avanço porque você fez algo")

| Situação | Lirien faz | Aldren faz |
|---|---|---|
| Rocha rachada | magia não racha pedra | golpe pesado quebra |
| Selo arcano roxo | magia carregada quebra | espada não funciona |
| Rio | Geada congela a água por alguns segundos; os dois atravessam juntos | — |
| Portão dos Gêmeos | acerta o cristal | puxa a alavanca |
| Ponte de luz + alavanca (ruínas) | segura a Ponte Etérea e não pode andar | atravessa e puxa a alavanca que ergue a ponte de pedra |
| Ritual do altar | canaliza e fica indefesa | protege com escudo e provocação |
| Placa pesada | "leve demais" | o peso dele, ou um caixote empurrado por ele, aciona |
| Pedra rúnica (caverna) | leva a pedra sobre o abismo com Telecinese | quebra a barricada antes |
| Ilha do Peso (santuário) | cria a ponte | pisa na placa |
| Cristal Solar | atira no escudo erguido do Aldren → **Prisma** | ergue o escudo |
| Inimigos | Fogos-fátuos são imunes à espada | Besouros de pedra refletem magia até ele virá-los |

Quando o Portão dos Gêmeos abre de vez, o puzzle fica resolvido. O Cristal Solar só desperta com luz refletida (o Prisma).

### Combos em dupla

Cada combo mostra um texto dourado e enche a barra especial dos dois.

- **ABERTURA!** — Aldren atordoa com o golpe pesado; a magia carregada da Lirien causa 2,5× o dano.
- **PRISÃO!** — Aldren segura um inimigo atordoado (tecla 3); a magia causa 2× o dano.
- **ESTILHAÇO!** — a Geada congela; o golpe pesado estilhaça (3×).
- **PRISMA!** — o projétil da Lirien bate no escudo erguido e vira um leque de 3 disparos.
- **UNIÃO!** — os dois especiais ativados juntos geram uma explosão extra.

### Morte, reviver e checkpoints

- Ao cair, o personagem fica no chão com um **cronômetro de 12 s**. O parceiro **segura o botão de interagir** perto dele para reviver.
- Se os dois caírem (ou o tempo acabar), vocês voltam à última **Pedra de Retorno**.
- As Pedras de Retorno ficam antes das áreas importantes e dos chefes. Elas curam, salvam o jogo e permitem **meditar** (gastar pontos de habilidade).
- A **Pluma da Fênix** (vendida na loja) revive automaticamente.

### Memórias (mecânica central)

Objetos com brilho dourado despertam lembranças. A tela fica em sépia e aparece **"MEMÓRIA — DOZE ANOS ATRÁS"**. Lirien aparece igual (elfos não envelhecem) e Aldren aparece criança.

1. **A Primeira Ponte** (ruínas, jogável): Lirien ensina a Ponte Etérea ao pequeno Aldren.
   - Ao voltar ao presente, a magia é desbloqueada e resolve o abismo das ruínas.
   - Aldren recupera a espada de madeira.
2. **A Fita no Galho** (bosque secreto): cena curta e opcional.
3. **A Promessa** (depois do chefe, jogável): a colina e a chuva de estrelas. Fecha o arco emocional.

### Chefes

**Guardião de Pedra** (mini-chefe):
- É blindado.
- O núcleo só fica exposto se Aldren **aparar** o esmagamento no instante exato, ou se o golem bater numa parede durante a investida.
- Na fase 2 ganha fúria e chuva de pedras.
- **Recompensa:** Aldren aprende **Reflexão** (aparar devolve projéteis).

**Morvath, o Devorador de Memórias** (chefe):

| Fase | O que acontece |
|---|---|
| 1 | Um véu prismático que só cai com magia concentrada ou Prisma. Morvath cai tonto e é a vez da espada. |
| 2 | Fica intangível, invoca ecos sombrios da dupla e lança o **Orbe do Esquecimento**. Só ele, devolvido por Aldren com Reflexão, quebra a intangibilidade. |
| 3 | Combina tudo, mais rápido, com zonas de névoa no chão. |

A luta tem introdução cinematográfica, padrões telegrafados, animação de derrota e recompensa.

---

## 4. O que foi implementado

**Menus**
- Tela inicial: Novo jogo, Continuar, Configurações, Controles, Sair.
- Pausa: Continuar, Inventário, Habilidades, Diário, Configurações, Controles, Voltar ao menu.

**Vila de Brisaclara (hub)**
- 9 NPCs com falas que mudam com o progresso.
- Loja do Tobin e forja da Brunna (melhorias de espada e cajado).
- Bonecos de treino e um santuário de braseiros (tutorial pelo cenário).
- Segredos.

**Regiões**
- Estrada do Moinho → Bosque Sussurrante → Ruínas de Velmora → Caverna Ecoante (escura, com iluminação dinâmica) → Santuário da Estrela Caída → Cratera (chefe).

**Inimigos (7 tipos + elite)**

| Tipo | Inimigo |
|---|---|
| Pequeno | gosma |
| Rápido | lobo, morcego |
| Resistente | esqueleto com escudo (bloqueia de frente) |
| À distância | arqueiro |
| Mágico | fogo-fátuo |
| Cooperativo | besouro de pedra |
| Elite | Lobo Cinzento, que chama a matilha |

**Missões secundárias**
- **Ervas da Curandeira:** 3 flores, uma delas na área secreta.
- **O Lobo Cinzento.**
- **Páginas Perdidas:** 5 páginas espalhadas, várias em segredos.

**Sistemas**
- **Inventário** com categorias: consumíveis, equipamento, artefatos, coleção e missão.
  - Acessórios equipáveis.
  - Cosméticos que mudam a cor da capa ou do manto.
- **Árvore de habilidades:** 5 nós por personagem. Os pontos são compartilhados, e a dupla decide junta.
- **Diário:** missões, memórias e estatísticas (segredos 0/6, páginas, combos, revives).
- **Save automático** em LocalStorage: fase, checkpoint, habilidades, itens, coleção, memórias, missões e flags dos puzzles.

**Áudio procedural**
- 10 músicas com **transição suave**: vila, exploração, floresta, masmorra, santuário, combate dinâmico, chefe, vitória, memória e derrota.
- Ambientes: pássaros, gotas, vento e grilos.
- Cerca de 50 efeitos sonoros.

**Pixel art gerada por código**
- Sprites com contorno.
- Animações: andar, respirar, ataque, dano, queda, esquiva e especial.
- Tiles com variação e transições.
- Árvores, casas e objetos.
- Partículas, luz dinâmica, raios de sol na floresta, filtro sépia nas memórias, tarjas de cinema e tremor de tela.

**Câmera e interface**
- A câmera enquadra os dois jogadores. Uma "coleira" impede que um abandone o outro fora da tela, e nas lutas de chefe ela também inclui o chefe.
- HUD discreto:
  - vida, mana/fôlego e especial;
  - magia atual;
  - moedas e missão ativa;
  - barra do chefe;
  - prompts de interação com a tecla de cada jogador;
  - indicador P1/P2.
- Conversas curtas durante a caminhada, em balões que não pausam o jogo.

**Acessibilidade**
- Modo assistido: menos dano recebido e mais tempo para reviver.
- Modo solo com parceiro controlado pelo computador.
- Volume e tremor de tela ajustáveis.

---

## 5. Testes realizados

O jogo foi testado de forma automatizada num navegador, simulando o teclado. Foram verificados:
- movimento, colisões e a coleira;
- todos os ataques, habilidades e combos;
- cada puzzle de cada área;
- morte, reviver, derrota e retorno ao checkpoint;
- as três memórias;
- o mini-chefe (aparar → núcleo exposto) e o chefe (véu, fases, reflexão do orbe, derrota);
- o final e a tela de fim de capítulo;
- loja, ferreira, missões, inventário, árvore de habilidades e modo solo;
- save e "Continuar".

Também foram feitas:
- uma checagem de **alcançabilidade** de todos os mapas: nenhuma saída, NPC ou baú inalcançável;
- uma checagem de objetos em posições inválidas;
- um teste de "caos", com entradas aleatórias em todas as áreas.

Em todos esses testes, o jogo rodou sem erros e a 60 FPS.

---

## 6. Estrutura de arquivos

```
index.html              página do jogo (carrega os scripts na ordem)
css/style.css
assets/audio/           (vazio) coloque aqui músicas/efeitos reais, se quiser
js/
  core/      namespace, util, input (teclado+gamepad), audio, save, camera,
             particles, lighting, coroutine (cutscenes)
  gfx/       font (fonte bitmap com acentos), pixel, sprites (personagens/inimigos),
             tiles (chão/paredes/água), props (árvores, casas, objetos)
  data/      characters, items, skills, quests, dialogue   <- ponto de troca de IP
  world/     entity (física), level (mapa), objects (puzzles), npc
  actors/    combat (projéteis/dano), character (base), mage (Lirien),
             warrior (Aldren), companion (IA do modo solo)
  enemies/   enemy (base), types (comuns), golem (mini-chefe), boss (chefe)
  systems/   dialogue, inventory, quests, progression, memory
  ui/        widgets, hud, menus
  levels/    registry (registro + construtor de mapas)
             fase1/ vila, estrada, floresta, ruinas, caverna, santuario (+cratera),
                    memorias, cenas (cutscenes)
  game.js    estados, áreas, renderização, save, morte, memórias
  main.js    inicialização e laço de 60 Hz
```

São scripts clássicos com um namespace `G`, e não módulos ES. Assim o jogo roda com duplo clique (`file://`).

---

## 7. Trocar nomes, falas e arte (IP original)

- **Nomes, atributos, cores e teclas:** `js/data/characters.js`.
- **Todas as falas:** `js/data/dialogue.js` e `js/levels/fase1/cenas.js`.
- **Memórias:** `js/systems/memory.js` e `js/levels/fase1/memorias.js`.
- **Sprites:** `js/gfx/sprites.js`. As grades de texto mais a paleta são fáceis de redesenhar.
- **Áudio real:** preencha `G.AudioFiles` no fim de `js/core/audio.js`, por exemplo:

  ```js
  G.AudioFiles.music.village = 'assets/audio/vila.ogg';
  ```

  O sistema troca o procedural pelo arquivo, mantendo as transições.

---

## 8. Como adicionar as Fases 2 e 3

1. Crie `js/levels/fase2/` com um arquivo por área. Cada área é um objeto `G.defineArea({...})`:
   - **mapa:** usando `build(b)` com o `MapBuilder` (`rect`, `path`, `scatter`, `ellipse`, `frame`...), ou um array de strings em `map`;
   - **dados:** `entities`, `spawns`, `exits`, `zones` (gatilhos), `triggers` e `scripts`.

   Use `js/levels/fase1/ruinas.js` como modelo.
2. Adicione os `<script>` novos em `index.html`, depois dos da fase 1.
3. **Ligar as fases:** uma saída `{ to: 'montanha_entrada', spawn: 'sul' }` ou uma cena que chame `g.changeArea(...)`. O final da Fase 1 está em `G.Scenes.finale`, em `cenas.js`.
4. **Novos inimigos:**
   - crie uma classe que estende `G.Enemy` em `js/enemies/` e registre em `G.EnemyTypes`;
   - para chefes, siga `golem.js` e `boss.js` (estados, fases, `takeHit`, `die` → script `bossDefeated` da área).
5. **Novos objetos de puzzle:** estenda `G.Obj` em `world/objects.js` e registre em `G.ObjectTypes`.
   - Sinais e portões já funcionam por `id`/`requires`; para lógica personalizada, use `mechanism`.
6. **Novas habilidades:**
   - magias da Lirien: adicione em `SPELLS` (`mage.js`) e desbloqueie com `g.unlockedSpells.push('nova')`;
   - habilidades do Aldren: use `g.abilities.add('nome')` e verifique com `g.has('nome')`;
   - para a árvore, adicione nós em `data/skills.js`.
7. **Novas memórias:** registre em `G.MemoryDefs` e crie a área `mem_*`. O script `start` da área conduz a cena e chama `g.endMemory()`.

Sugestões já previstas no roteiro:
- **Fase 2**, *As Montanhas do Norte* (o fragmento estelar aponta para lá): fortaleza abandonada, nova magia para a Lirien (por exemplo, Chama Estelar) e nova técnica para o Aldren.
- **Fase 3**: combinar as mecânicas das fases anteriores.

---

## 9. Limitações conhecidas

- **Arte e música** são procedurais. A arte foi feita à mão em código, mas não tem a riqueza de um artista dedicado. O sistema aceita substituição por PNG e áudio reais.
- **Interiores** das casas não existem: as portas mostram uma descrição.
- **Gamepad** segue o mapeamento padrão do navegador. Foi implementado, mas testado só por código, não com controles físicos.
- **Save** fica no LocalStorage do navegador. Limpar os dados do navegador apaga o progresso.
- **Fases 2 e 3** ainda não existem. A arquitetura está pronta para elas (seção 8).
- **Equilíbrio:** a dificuldade foi ajustada em testes automatizados. Pode precisar de ajuste fino com jogadores reais.

---

## Atalhos de desenvolvedor (console do navegador, F12)

```js
G.dev.warp('ruinas')        // ir para uma área: vila, estrada, floresta, ruinas, caverna, santuario, cratera
G.dev.god()                 // invencibilidade on/off
G.dev.unlockAll()           // Ponte Etérea + Reflexão
G.dev.give('pocao', 3)      // dar item
G.dev.points(5)             // pontos de habilidade
```

**F2** mostra as caixas de colisão e o FPS.
