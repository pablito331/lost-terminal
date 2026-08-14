# Seed OS // Knowledge, Code & Communications

## Direção escolhida

O conhecimento do Seed OS será apresentado como infraestrutura recuperada, não como uma árvore de missões. O jogador encontra índices incompletos, livros técnicos, mensagens, vídeos e programas nos mesmos diretórios em que encontraria qualquer outro arquivo da nave. A progressão acontece pela combinação de leitura, autoridade, idioma, contexto e experimentação no shell.

## Biblioteca operacional

`/library` é um volume lógico da nave. Seus registros usam a extensão proprietária `.BOOK`, com capítulos textuais, idioma original, autor, departamento, nível técnico, estado de revisão, referências cruzadas e permissões. O índice é deliberadamente maior que a necessidade imediata: há manuais de Seed OS, lógica de programação, matemática, biologia, xenobiologia, medicina criogênica, navegação, térmica, energia, agricultura, linguística, segurança e história da missão.

| Camada | Exemplos | Função diegética |
|---|---|---|
| `PUBLIC` | História da missão, segurança básica, botânica, matemática | Conhecimento que pode ser encontrado sem identidade anexada |
| `CREW` | Manuais de operação, navegação, biologia aplicada, manutenção | Explica conceitos sem liberar automaticamente o hardware |
| `OFFICER` | Firmware, barramentos, criogenia avançada, logs de comando | Dá vocabulário para interpretar falhas e arquivos protegidos |
| `ROOT` | Kernel, identidade, substituição de serviços, cápsula 601 | Conhecimento fragmentado e operacionalmente sensível |

O comando `LIBRARY` lista assuntos e idiomas. `BOOK <termo>` pesquisa títulos, autores e palavras-chave. `CAT /library/...BOOK` abre o conteúdo disponível para a autoridade atual. Um livro pode apontar para um arquivo de passageiro, uma mensagem, uma API de Seed Script ou um equipamento sem afirmar que aquela ligação é obrigatória.

## Seed Script e IDE

`Seed Script` é uma linguagem pequena e determinística, com sintaxe próxima de Portugol e Python, mas com vocabulário operacional próprio. A primeira versão aceita atribuição, números, strings, operações aritméticas, comparação, `if/else`, `while`, `for`, funções simples, `print`, `read`, `calc`, `seed`, `power`, `life` e `repair`. Não existe acesso arbitrário ao navegador: cada capacidade deve passar por uma API interna e por autoridade, firmware, dependências e estado dos sistemas.

| Elemento | Exemplo | Resultado |
|---|---|---|
| Saída | `print("CHECKSUM READY")` | Escreve no buffer do terminal |
| Variável | `burn = 0.18` | Mantém estado local do programa |
| Condição | `if oxygen < 10:` | Escolhe um caminho técnico |
| Laço | `for step in range(3):` | Executa uma sequência limitada |
| Sistema | `seed("O2")` | Consulta uma telemetria autorizada |
| Compilação | `compile /workspace/repair.proc` | Produz um `.PROC` executável se não houver erros |

`/apps/ide.PROC` é o ponto de entrada inicial. O editor trabalha sobre `/workspace`, mostra erros com linha e coluna, salva uma fonte `.PROC` e registra o programa compilado somente quando o jogador solicitar. O programa quase funcional de um tripulante pode ser copiado para `/workspace`, estudado, corrigido e compilado; a solução não é inserida automaticamente pelo sistema.

## Caminhos técnicos

Os sistemas da nave expõem interfaces graduais. Um script pode começar apenas lendo `seed("O2")`; após livros, credenciais, firmware e módulos encontrados, pode chamar diagnósticos de energia ou preparar um reparo. A chamada `repair("GEN-02")` nunca ignora as regras existentes: exige o canal de manutenção, autoridade ou credencial, dependências e um sistema compatível. Substituir um serviço corrompido exige um programa compilado com a assinatura correta, não apenas um comando textual.

## Comunicações

O app oficial `/apps/msg.PROC` indexa arquivos `.MSG` em `/comms/seed`. Essas mensagens têm remetente, destinatários, fila, timestamp, estado de leitura, autoridade e anexos. O canal não registrado `/comms/ghost` usa o mesmo contêiner `.MSG`, mas sem entrada no registro oficial; ele só aparece quando o jogador encontra um índice, executa `sniff.PROC` ou segue uma referência de rede.

Vídeos públicos permanecem em `.VIS`, para preservar o formato visual já usado pelo sistema. Notícias da missão, mensagens de chegada não abertas, instruções de colonização e registros públicos podem formar uma camada de contexto, enquanto mensagens privadas e o canal fantasma contradizem ou completam os mesmos eventos por outros pontos de vista.

## Princípios de implementação

Cada objeto deve ser pesquisável, linkável e persistível. A interface continuará sendo exclusivamente o terminal: nenhuma biblioteca lateral, objetivo explícito, marcador de progresso ou confirmação narrativa será adicionado. O sistema pode mostrar erros técnicos, estados de montagem, permissões e dependências, mas nunca traduzirá automaticamente um mistério em instrução.
