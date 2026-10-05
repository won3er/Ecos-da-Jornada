# Ecos da Jornada

Aventura cooperativa 2D em pixel art para **dois jogadores no mesmo computador** (ou online por convite).
O jogo está **completo**: três capítulos jogáveis do começo ao fim, com final, créditos e pós-jogo para chegar aos 100%.

| Capítulo | Regiões | Mini-chefe | Chefe |
|---|---|---|---|
| **I — O Começo da Jornada** | Vila de Brisaclara, Estrada do Moinho, Bosque Sussurrante, Ruínas de Velmora, Caverna Ecoante, Santuário da Estrela Caída | Guardião de Pedra | Morvath, o Devorador de Memórias |
| **II — As Montanhas do Norte** | Trilha Gelada, Pedra-Alta, Minas de Cristal, Picos Gelados, Fortaleza da Vigília Branca, Sala do Trono | Grumak, o Urso-de-Geada | Ysveth, a Geada Eterna |
| **III — A Última Estrela** | Velmora Desperta, Salão dos Espelhos, Jardins Suspensos, Câmara do Reflexo, Coração do Céu | Os Ecos | Nyxara, a Mãe das Estrelas |

Elites opcionais: **Lobo Cinzento** (Cap. I), **Lobo Alfa da Nevasca** (Cap. II) e **Sentinela Antiga** (Cap. III).

- **8 memórias** (4 jogáveis), **9 missões secundárias**, 17 colecionáveis (páginas, diário, constelações) e 13 áreas secretas.
- **5 magias** para a Lirien e **5 técnicas** para o Aldren, árvore com **20 habilidades**, forja até o nível 5.
- **Viagem rápida** entre Pedras de Retorno, **bestiário** e **% de conclusão** no Diário.

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

## Idiomas / Languages

O jogo abre em **inglês** por padrão. Para trocar: **Configurações → Idioma / Language** (inglês ou português). A escolha fica salva.

The game starts in **English** by default. To switch: **Settings → Idioma / Language** (English or Portuguese). Your choice is saved.

## 2. Controles

| Ação | Jogador 1 — Lirien | Jogador 2 — Aldren |
|---|---|---|
| Mover | **W A S D** | **Setas** |
| Ataque | **J** — projétil mágico (segure: **magia carregada**) | **1** — golpe de espada, combo de 3 (segure: **golpe pesado**) |
| Habilidade | **K** — lança a magia selecionada | **2** — escudo (no instante certo: **aparar**) |
| Esquiva / interagir | **L** — teleporte curto / falar / abrir / reviver | **3** — investida / falar / alavancas / agarrar caixote / segurar inimigo tonto |
| Extra | **I** — troca de magia | **4** — provocar (os inimigos focam nele) |
| Especial (barra dourada cheia) | **J + K** — Tempestade Arcana | **1 + 2** — Corte do Herói |
| Técnicas do Cap. II/III | — | **3 perto da Lirien**: erguer → **3** de novo: **arremessar** • **3 na beira de um vão curto**: **Salto do Herói** |

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

### Magias e técnicas (como se ganham)

| Personagem | Habilidade | Onde |
|---|---|---|
| Lirien | Geada, Telecinese | desde o início |
| Lirien | **Ponte Etérea** (segure: ponte de luz sobre abismos) | memória "A Primeira Ponte" (Cap. I) |
| Lirien | **Chama Estelar** (acende, derrete gelo, queima espinhos/teias, liberta congelados) | memória "A Primeira Neve" (Cap. II) |
| Lirien | **Estase** (bolha que desacelera inimigos, projéteis, meteoros e plataformas) | vitória sobre Ysveth (fim do Cap. II) |
| Aldren | **Reflexão** (aparar devolve projéteis) | vitória sobre o Guardião de Pedra (Cap. I) |
| Aldren | **Arremesso** (ergue a Lirien e a lança por cima de muros baixos, cercas, água e abismos) | vitória sobre Grumak (Cap. II) |
| Aldren | **Salto do Herói** (pula vãos curtos de abismo ou água) | memória "A Queda de Velmora" (Cap. III) |

### Cooperação ("só avanço porque você fez algo")

| Situação | Lirien faz | Aldren faz |
|---|---|---|
| Rocha rachada | magia não racha pedra | golpe pesado quebra |
| Selo arcano roxo | magia carregada quebra | espada não funciona |
| Rio | Geada congela a água; os dois atravessam juntos | — |
| Portão dos Gêmeos | acerta o cristal | puxa a alavanca no mesmo instante |
| Ponte de luz + alavanca | segura a Ponte Etérea | atravessa e puxa a alavanca |
| Ritual do altar | canaliza e fica indefesa | protege com escudo e provocação |
| Placa pesada | "leve demais" | o peso dele (ou um caixote) aciona |
| Cristal Solar | atira no escudo erguido → **Prisma** | ergue o escudo |
| Gelo azul, espinhos, teias, braseiros que "pedem fogo" | **Chama Estelar** | — |
| Moradores presos no gelo do tempo (Pedra-Alta) | Chama Estelar liberta | — |
| **Vento forte** (Picos) | é empurrada (leve); anda **atrás do escudo** | escudo erguido contra o vento = abrigo |
| **Muro baixo / abismo com runa** | lê a runa (só ela) | **arremessa** a Lirien por cima |
| Três braseiros ao mesmo tempo (Fortaleza) | acende rápido, com teleporte | protege |
| **Feixes de luz** (Torre) | magia concentrada liga os emissores | **gira os espelhos** e usa o **escudo como espelho** |
| **Plataformas flutuantes** | **Estase** deixa as plataformas lentas | — |
| Vãos curtos | — | **Salto do Herói** |
| Inimigos | Fogos-fátuos e espíritos de gelo são imunes à espada | Besouros e cavaleiros: golpe pesado quebra a guarda |

### Combos em dupla

Cada combo mostra um texto dourado e enche a barra especial dos dois.

- **ABERTURA!** — golpe pesado atordoa; a magia carregada causa 2,5× o dano.
- **PRISÃO!** — Aldren segura um inimigo atordoado (tecla 3); a magia causa 2× o dano.
- **ESTILHAÇO!** — a Geada congela; o golpe pesado estilhaça (3×).
- **CHOQUE TÉRMICO!** — a Chama Estelar num inimigo congelado (2,5×).
- **PRISMA!** — o projétil da Lirien bate no escudo erguido e vira um leque de 3 disparos.
- **METEORO!** — a Lirien arremessada cai em cima de inimigos.
- **CONTRA-ATAQUE!** — com a habilidade, o golpe logo depois de aparar causa 3×.
- **UNIÃO!** — os dois especiais ativados juntos geram uma explosão extra (e selam a chefe final).

### Morte, reviver e checkpoints

- Ao cair, o personagem fica no chão com um **cronômetro de 12 s**. O parceiro **segura interagir** perto dele para reviver (e também para **quebrar o gelo** se ele for congelado).
- Se os dois caírem (ou o tempo acabar), vocês voltam à última **Pedra de Retorno**.
- As Pedras de Retorno curam, salvam, permitem **meditar** (gastar pontos) e **viajar** para qualquer outra Pedra já ativada.
- A **Pluma da Fênix** revive automaticamente.

### Memórias (mecânica central)

Objetos com brilho dourado despertam lembranças em sépia. O que se aprende nelas resolve o presente.

| Memória | Tipo | Onde |
|---|---|---|
| A Primeira Ponte | jogável (ensina a Ponte Etérea) | Ruínas de Velmora |
| A Fita no Galho | cena | Bosque (área secreta) |
| A Promessa | jogável | Cratera, depois do chefe |
| A Primeira Neve | jogável (ensina a Chama Estelar) | Trilha Gelada |
| O Boneco de Neve | cena | Pedra-Alta |
| O Aniversário | cena | depois de Ysveth |
| A Queda de Velmora | jogável com **Sir Talen** (ensina o Salto) | Velmora Desperta |
| O Jardim do Mestre | cena | Jardins Suspensos |

### Chefes

| Chefe | Como vencer |
|---|---|
| **Guardião de Pedra** | blindado; apare o esmagar ou faça-o bater na parede para expor o núcleo. |
| **Morvath** | véu prismático (magia carregada/Prisma) → tonto; intangível na fase 2 até o **Orbe** ser devolvido com Reflexão; fase 3 combina tudo. |
| **Grumak** | couraça de gelo: **Chama Estelar** derrete uma placa por vez; Aldren apara a patada, bloqueia o **sopro** (quem fica atrás do escudo não congela) e o faz bater nos pilares. |
| **Ysveth** | 1) cópias de gelo: fogo quebra; Reflexão devolve as lanças. 2) **Parada do Tempo**: só quem está perto de um braseiro aceso escapa de congelar. 3) no trono, atrás de um muro de gelo: **arremessem a Lirien** até a ampulheta. |
| **Os Ecos** | sombras da dupla; o elo os protege quando estão juntos — separem (provocação/Geada). |
| **Nyxara** | 1) véu estelar; 2) **Raio do Fim**: o escudo do Aldren devolve o raio; 3) meteoros (Estase) e o núcleo na ilha (**Arremesso**); 4) **duas UNIÕES** (especiais ao mesmo tempo) a selam. |

Os chefes não pulam fases com um golpe forte, e as arenas fecham só depois de puxar o parceiro para dentro.

---

## 4. O que foi implementado

**Menus**: tela inicial (mostra o capítulo do save), pausa, inventário, habilidades, diário (missões, memórias, **bestiário**, **conclusão %**), configurações, controles, loja, forja, viagem rápida, fim de capítulo e **créditos**.

**Hubs e lojas**: Brisaclara (Tobin, Brunna), Pedra-Alta (Yara, Hrolf) e o acampamento fantasma de Velmora (Cássio). A forja vai até o **nível 5** (moedas + Minério Estelar, Cristal Gélido, Núcleo Estelar).

**Missões secundárias** (9): Ervas da Curandeira, O Lobo Cinzento, Páginas Perdidas, Gelo do Tempo, O Irmão de Nessa, O Alfa da Nevasca, O Diário de Hadrik, O Cajado do Mestre, As Sete Constelações.

**Inimigos**: gosma, lobo, morcego, esqueleto com escudo, arqueiro, fogo-fátuo, besouro de pedra, lobo da geada, gelídeo (explode em gelo), espírito da nevasca, morcego de cristal (rasante), aranha de cristal (teia), cavaleiro congelado (armadura de gelo), cavaleiro do vazio (teleporta), estrelinha cadente (explode), sentinela prismática (feixe refletível) e elites.

**Sistemas**: inventário com acessórios e 5 cosméticos; árvore de 20 habilidades (algumas despertam por capítulo); save automático; pós-jogo depois dos créditos.

**Áudio procedural**: 20 músicas com transição suave (vila, neve, minas, fortaleza, torre, vazio, chefes, chefe final, esperança...), ambientes (nevasca, minas, salões, vazio) e dezenas de efeitos.

**Modo solo melhorado**: a IA ataca chefes quando ficam vulneráveis, usa magia carregada, quebra o gelo, acompanha a UNIÃO e, ao trocar com Tab, **segura a posição** (ponte, escudo, placa, ritual) até você voltar.

---

## 5. Correções desta versão (2.0)

- **Atravessar paredes**: o teleporte da Lirien varria o caminho e "pulava" portões, cercas, barreiras e o portão da arena do Guardião. Agora para no primeiro obstáculo.
- **Pular chefes**: dava para contornar os gatilhos das arenas e sair pelo portão. Os gatilhos cobrem a arena inteira, o parceiro é puxado para dentro antes da grade fechar e as saídas exigem o parceiro **do mesmo lado** (sem portão no meio).
- **Movimento**: inimigos seguros pelo Aldren entravam nas paredes; personagens podiam ficar presos em portões que fechavam — há um vigia anti-travamento.
- Trocar de área com 0 de vida, Pluma da Fênix perdendo para o game over, tremor de tela que ignorava a configuração e a IA que se teleportava através de portões.

---

## 6. Testes realizados

Testes automatizados no navegador (Chromium headless, Playwright):
- regressão dos bugs acima (teleporte no portão, saída com parceiro atrás da grade, gatilho do chefe, parceiro puxado para a arena);
- **alcançabilidade** de todas as 23 áreas (nenhum baú, NPC, runa ou saída inalcançável) e **bloqueio**: nenhuma saída "para frente" é alcançável sem resolver o quebra-cabeça ou vencer o chefe;
- simulação de **todos os chefes novos** do começo ao fim (Grumak, Ysveth com as 3 fases e o arremesso, Os Ecos, Nyxara com as 4 fases e as duas UNIÕES) até o epílogo e os créditos;
- quebra-cabeças com as mecânicas reais (derreter gelo, braseiros de fogo, descongelar moradores, arremessos, runas, espelhos e escudo-espelho, plataformas, salto);
- transição entre capítulos, salvar/continuar e viagem rápida;
- teste de **caos** com entradas aleatórias em todas as áreas, sem nenhum erro.

---

## 7. Estrutura de arquivos

```
index.html              página do jogo (carrega os scripts na ordem)
css/style.css
assets/audio/           (vazio) coloque aqui músicas/efeitos reais, se quiser
js/
  core/      namespace, util, input (teclado+gamepad), audio, save, online,
             camera, particles, lighting, coroutine (cutscenes)
  gfx/       font, pixel, sprites (+sprites2), tiles, props (+props2), icons2
  data/      characters, items, skills, quests, dialogue (+dialogue2), bestiary
  world/     entity (física), level (mapa), objects (+objects2: gelo, feixes,
             plataformas, runas...), npc
  actors/    combat, character, mage (Lirien), warrior (Aldren), companion (IA)
  enemies/   enemy, types (+types2), golem, boss, bosses2 (Grumak, Ysveth),
             bosses3 (Ecos, Sentinela, Nyxara)
  systems/   dialogue, inventory, quests, progression, memory, completion
  ui/        widgets, hud, menus
  levels/    registry (registro + construtor de mapas + arenas)
             fase1/ vila, estrada, floresta, ruinas, caverna, santuario, memorias, cenas
             fase2/ trilha, pedra_alta, minas, picos, fortaleza, trono, memorias2, cenas2
             fase3/ velmora, memorias3, torre, topo (Ecos, Nyxara, epílogo), cenas3
  game.js    estados, capítulos, áreas, vento, Estase, renderização, save, memórias
  main.js    inicialização e laço de 60 Hz
```

São scripts clássicos com um namespace `G`, e não módulos ES. Assim o jogo roda com duplo clique (`file://`).

---

## 8. Trocar nomes, falas e arte (IP original)

- **Nomes, atributos, cores e teclas:** `js/data/characters.js`.
- **Falas:** `js/data/dialogue.js`, `js/data/dialogue2.js` e os arquivos `cenas*.js`.
- **Memórias:** `js/systems/memory.js` e os arquivos `memorias*.js`.
- **Sprites:** `js/gfx/sprites.js` e `sprites2.js` (grades de texto + paleta).
- **Áudio real:** preencha `G.AudioFiles` no fim de `js/core/audio.js`, por exemplo `G.AudioFiles.music.village = 'assets/audio/vila.ogg';`.

---

## 9. Limitações conhecidas

- **Arte e música** são procedurais (feitas em código). O sistema aceita substituição por PNG e áudio reais.
- **Interiores** das casas não existem: as portas mostram uma descrição.
- **Gamepad** segue o mapeamento padrão do navegador; testado por código, não com controles físicos.
- **Save** fica no LocalStorage do navegador. Limpar os dados do navegador apaga o progresso.
- **Equilíbrio** ajustado em testes automatizados; pode pedir ajuste fino com jogadores reais (o **modo assistido** ajuda).

---

## Atalhos de desenvolvedor (console do navegador, F12)

```js
G.dev.warp('picos')         // ir para uma área (veja G.Areas)
G.dev.chapter(3)            // começar direto num capítulo, com tudo desbloqueado
G.dev.god()                 // invencibilidade on/off
G.dev.unlockAll()           // todas as magias e técnicas
G.dev.give('pocao', 3)      // dar item
G.dev.points(5)             // pontos de habilidade
G.dev.complete()            // resumo da % de conclusão
```

**F2** mostra as caixas de colisão e o FPS.

## Jogar online com convite
No menu inicial, **Jogar online (convite)** gera um link `?sala=CODIGO`. Quem recebe o link joga como Aldren direto no navegador (setas + 1/2/3/4, WASD/JKL ou gamepad). A conexão é P2P (WebRTC/PeerJS): o anfitrião roda o jogo e transmite vídeo/áudio. O save fica no navegador do anfitrião e é copiado para o da amiga a cada salvamento ("Restaurar save do casal" no menu permite ela virar anfitriã com o mesmo progresso). O código da sala é fixo por navegador, então o mesmo link volta a funcionar.

## Deploy (Vercel)
Site estático: importe o repositório na Vercel (Framework: Other, sem build).
