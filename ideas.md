# Lost Terminal — Direção de interface

## Abordagens consideradas

### Abordagem A — Terminal de Fósforo Industrial
Uma interface de investigação em CRT verde, com densidade de dados, textura de metal gasto e navegação assimétrica entre terminal, índice de arquivos e inspetor contextual. A sensação é de operar uma máquina real sob pressão, não de abrir um dashboard. **Probabilidade: 0,07**

### Abordagem B — Arquivo Clínico de Estase
Uma leitura mais fria e documental: cinza cirúrgico, azul desaturado, tipografia monoespaciada e fichas de prontuário com foco em rastreabilidade. O suspense viria da contradição entre o cuidado médico e os vazios do arquivo. **Probabilidade: 0,03**

### Abordagem C — Ruína Analógica de Nave
Uma composição quase editorial com papel térmico, laranja de emergência, carimbos quebrados e colunas de relatório. O jogo pareceria um maço de evidências físicas recuperadas de uma nave sem energia. **Probabilidade: 0,09**

## Abordagem escolhida — Terminal de Fósforo Industrial

### Design Movement
**Brutalismo técnico de terminal**, cruzado com a linguagem de painéis de manutenção aeroespacial, arte ANSI e monitores CRT monocromáticos. A interface deve assumir que o jogador tem curiosidade e tolerância para ler sinais imperfeitos.

### Core Principles

1. **O arquivo é a paisagem.** Pastas, extensões, timestamps e caminhos têm peso visual equivalente ao conteúdo narrativo.
2. **Densidade com hierarquia.** Muitos sinais podem coexistir, mas um único foco recebe o brilho e o contraste mais altos.
3. **Falha como linguagem.** Glitches, setores ruins e textos corrompidos aparecem como estados diegéticos, nunca como decoração aleatória.
4. **Relações são jogáveis.** Cada documento aponta para outros tripulantes, arquivos e permissões; links são pistas, não rodapés.

### Color Philosophy
O preto não representa vazio: é a matéria da nave e o espaço onde o jogador procura. O verde fosforescente sinaliza informação viva, enquanto âmbar marca sistemas que ainda aquecem e vermelho queimado indica perda irreversível. A paleta evita o neon multicolorido para preservar a sensação de hardware antigo e tornar cada mudança cromática significativa.

### Layout Paradigm
Uma **bancada operacional assimétrica**: o terminal ocupa o eixo central, o índice de arquivos fica ancorado à esquerda como um rack de mídia, e o inspetor de evidências se projeta à direita como uma tela de manutenção. A largura não é centralizada como um site promocional; ela simula um espaço de trabalho que o jogador aprende a habitar.

### Signature Elements

* Um cursor quadrado e um sublinhado pulsante que funcionam como assinatura de foco.
* Barras de sinal, scanlines e blocos ANSI como molduras e indicadores de estado.
* Links entre personagens apresentados como conexões de rede, com relação explícita e caminho navegável.

### Interaction Philosophy
Comandos de teclado são instantâneos e respeitam a lógica de um shell. Cliques servem para investigar, fixar uma evidência ou seguir uma relação; não substituem o prazer de descobrir um comando. Ações perigosas pedem clearance e nunca são escondidas atrás de animações lentas.

### Animation
Entradas do sistema surgem em cascata curta, com atrasos de 30–60 ms entre linhas. Hover é mínimo: um arquivo se ilumina e revela a extensão. Glitches são breves, assimétricos e associados a erro ou transmissão. O boot pode ter uma cadência maior, mas a experiência principal não deve atrasar comandos. Todas as animações não essenciais respeitam `prefers-reduced-motion`.

### Typography System
**IBM Plex Mono** para comandos, metadados e conteúdo operacional; **Space Grotesk** em pesos 600–700 para títulos de seção e marcadores de sistema. A hierarquia usa caixa alta apenas para labels curtos, nunca para parágrafos longos. Números críticos recebem tracking levemente expandido e cor âmbar.

### Brand Essence
Um sistema operacional perdido para quem investiga a falha por dentro, ligando vidas humanas a rastros de máquina em vez de entregar uma missão guiada. **Tenso, obsessivo, material.**

### Brand Voice
Headlines são alertas secos, específicos e com consequência. CTAs parecem comandos úteis, nunca slogans. Microcopy assume que o jogador está lendo um log real.

> `TRACE THE GAP // CAPSULE_701 HAS NO OWNER`

> `OPEN THE RECORD. FOLLOW THE PERSON.`

### Wordmark & Logo
O símbolo é um cursor quadrado atravessando uma semente orbital: três cortes horizontais sugerem leitura de CRT e a órbita quebrada sugere uma identidade que não fecha. O wordmark “LOST TERMINAL” deve ser composto em monoespaçada condensada com espaçamento irregular, nunca em fonte padrão isolada.

### Signature Brand Color
**Phosphor Green `#8CFF68`** — a cor dos dados que ainda respondem, com brilho suficiente para guiar sem transformar tudo em neon.

