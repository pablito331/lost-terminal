# Manual do jogador — Seed OS

> Este documento é externo ao sistema. Dentro do Seed OS, não existe tutorial, lista de objetivos ou explicação narrativa. O sistema responde apenas aos comandos que você digita.

## 1. O que você está fazendo

Você está diante de um terminal operacional recuperado de uma nave à deriva. O sistema inicia sem uma identidade confirmada, com acesso de convidado e com o VFS montado em modo somente leitura.

Não existe uma sequência de missões apresentada na tela. A progressão acontece quando você aprende a estrutura do sistema, localiza arquivos, compara registros, entende os usuários, descobre permissões e testa operações que pareciam indisponíveis.

Os arquivos pessoais e corporativos não são apenas decoração. Diários, registros, fotos, vídeos, gravações, músicas, documentos, credenciais e programas podem conter informações necessárias para compreender os passageiros e operar partes da nave.

## 2. Como iniciar

Ao abrir o sistema, aguarde a sequência de firmware. Ela executa o POST, verifica memória, monta o VFS, examina os setores, varre as cápsulas, registra a falha do Neural Buffer e entra no fallback shell.

Durante o boot, o teclado fica bloqueado. A sequência completa dura aproximadamente 30 segundos. `ESC` interrompe o POST e leva diretamente ao fallback técnico. Depois disso, o prompt aparece:

```text
guest@seed:/$
```

Digite um comando e pressione **Enter**. O cursor permanece no terminal; não há botões necessários para operar o sistema.

## 3. Regras básicas do terminal

O shell aceita uma mistura de aliases Linux, DOS e Seed OS. Os comandos não diferenciam maiúsculas de minúsculas. Caminhos podem ser absolutos, começando por `/`, ou relativos ao diretório atual.

```text
guest@seed:/$ ls
guest@seed:/$ cd /personal
guest@seed:/personal$ pwd
```

Use as setas **Para cima** e **Para baixo** para consultar o histórico de comandos. Pressione **Tab** para completar o primeiro nome de arquivo ou diretório compatível. `Ctrl+L` ou `Cmd+L` limpa a saída visível do terminal, mas não desfaz alterações no sistema.

## 4. Primeiros comandos

| Comando | Função | Exemplo |
|---|---|---|
| `HELP` ou `?` | Exibe a referência técnica disponível no shell. | `HELP` |
| `PWD` | Mostra o diretório atual. | `PWD` |
| `LS` ou `DIR` | Lista arquivos e diretórios. | `LS /ship` |
| `CD` | Entra em um diretório. | `CD /personal` |
| `TREE` | Exibe a árvore compacta de diretórios. | `TREE /ship` |
| `CLEAR` ou `CLS` | Limpa a saída da tela. | `CLEAR` |
| `ECHO` | Imprime uma linha no terminal. | `ECHO TEST BUFFER` |

Comece examinando diretórios, nomes de arquivos e extensões. O sistema não apresenta um mapa separado: os caminhos são a sua estrutura de navegação.

## 5. Abrir e compreender arquivos

Use qualquer um dos três aliases para abrir um arquivo:

```text
CAT /ship/manifest.SCR
TYPE /ship/manifest.SCR
OPEN /ship/manifest.SCR
```

`CAT`, `TYPE` e `OPEN` produzem a mesma operação. A saída depende da extensão e do tipo interno do arquivo.

| Extensão | Conteúdo habitual | O que observar |
|---|---|---|
| `.SCR` | Diários, mensagens, documentos, anotações e credenciais. | Idioma, autoria, datas, nomes, lugares, números e referências a outros caminhos. |
| `.REC` | Voz, interceptações e gravações. | Transcrição, idioma, duração, origem, ruídos e nomes pronunciados. |
| `.MUS` | Música armazenada no contêiner proprietário do Seed OS. | Autor, idioma, família, data, título, metadados e relações com arquivos pessoais. |
| `.VIS` | Fotos, vídeos e transmissões visuais. | Legendas, descrição, telemetria, localização e pessoas identificáveis. |
| `.HLT` | Dados biométricos, clínicos e históricos de saúde. | Estado, horários, alterações, diagnósticos e cruzamento com registros de trabalho. |
| `.ATA` | Atas, ocorrências, registros oficiais e eventos de serviço. | Participantes, decisões, dissensos, responsáveis e versões substituídas. |
| `.PROC` | Programas, utilitários, ferramentas e aplicações executáveis. | Tipo, código, dependências, permissões e efeitos possíveis. |
| `.BOOK` | Livros técnicos, científicos, históricos e operacionais da biblioteca. | Idioma original, nível, autor, capítulos, referências e pré-requisitos implícitos. |
| `.MSG` | Mensagens oficiais e tráfego não registrado entre terminais. | Canal, estado de entrega, remetente, destinatários, anexos, horário e omissões. |

O sistema pode mostrar apenas metadados ou negar o conteúdo. Isso pode ocorrer por clearance insuficiente, conta não autenticada, volume não montado, corrupção ou combinação desses estados.

## 6. Procurar pessoas e documentos

O comando `FIND` procura no índice do VFS. Ele verifica caminhos, resumos, idiomas, camadas, tipos documentais, horários, autores, destinatários, departamentos, terminais, palavras-chave e campos de relação.

```text
FIND ilyin
SEARCH neural
FIND de-DE
SEARCH access
```

Para procurar registros corporativos, use:

```text
DOCS
DOCS SYSTEM_LOG
DOCS ACCESS_LOG
DOCS MEETING_MINUTES
DOCS DISCIPLINARY_WARNING
DOCS MEMO
```

Os tipos de documento podem aparecer como `SYSTEM_LOG`, `ACCESS_LOG`, `MEETING_MINUTES`, `DISCIPLINARY_WARNING` e `MEMO`.

Para consultar um passageiro por nome, identificador, handle, família, nacionalidade ou idioma:

```text
PASSENGER ilyin
PASSENGER passenger-600
PASSENGER family-014
PASSENGER de-DE
```

O resultado mostra a pessoa encontrada, família, nacionalidade, idioma, função, departamento, estado e caminhos dos arquivos associados.

Para ver a distribuição de idiomas do manifesto:

```text
LANGUAGES
LANG
```

## 7. Como ler o contexto dos arquivos

Ao abrir um arquivo, o terminal pode mostrar os campos técnicos abaixo:

```text
LAYER    :: PERSONAL / CORPORATE / SYSTEM
LANGUAGE :: de-DE / pt-BR / SEED-OPS
TYPE     :: .SCR / TEXT
OWNER    :: nome / nacionalidade / family-id
DOC      :: MEMO / EVENT :: T-18:04:22
SOURCE   :: departamento / terminal
ROUTE    :: autor -> destinatários
LINKS    :: caminho relacionado
```

Arquivos pessoais preservam a língua materna do passageiro. Registros da Seed Corp usam o idioma operacional `SEED-OPS`. A diferença entre essas camadas é parte da leitura do sistema: um mesmo acontecimento pode aparecer com vocabulário, horário, omissões e responsabilidade diferentes.

Não espere que o terminal diga qual arquivo é importante. Leia documentos ordinários, compare datas, siga nomes e use os caminhos exibidos nos metadados.

## 8. Identidade, contas e autoridade

No início, a sessão não tem identidade resolvida:

```text
WHOAMI
```

O comando informa a conta atual e o clearance da sessão. As autoridades disponíveis são:

| Autoridade | Alcance geral |
|---|---|
| `GUEST` | Leitura mínima e arquivos públicos do fallback. |
| `CREW` | Arquivos de trabalho e serviços de tripulação autorizados. |
| `OFFICER` | Registros operacionais e subsistemas mais restritos. |
| `ROOT` | Operações de firmware e escrita de baixo nível, quando o sistema permitir. |

Para anexar uma conta local descoberta nos arquivos:

```text
AUTH <usuario> <chave>
LOGIN <usuario> <chave>
```

Exemplo de sintaxe:

```text
AUTH m.ilyin <chave-encontrada>
```

Uma chave incorreta registra uma tentativa. Ao atingir o limite da conta, ela é bloqueada dentro da sessão. O shell não entrega uma senha correta automaticamente.

`SUDO` não é uma senha universal. Ele apenas solicita uma elevação e pode ser recusado:

```text
SUDO
```

Quando uma conta estiver vinculada a um arquivo protegido, a autenticação pode permitir a leitura mesmo que o clearance global ainda seja menor que o clearance do arquivo.

## 9. Credenciais salvas e serviços da nave

Alguns passageiros armazenam credenciais em seus arquivos pessoais. O comando `USE` aplica uma chave a um serviço encontrado no VFS:

```text
USE <serviço> <chave>
```

Exemplo de estrutura:

```text
USE CRYO <chave>
USE BOTANY <chave>
USE LOOP_02 <chave>
```

Uma credencial aceita torna o alvo funcional disponível para programas ou operações autorizadas. Uma credencial rejeitada não altera o estado do sistema.

## 10. Arquivos corrompidos e recuperação

O Seed OS pode encontrar arquivos com integridade `CLEAN`, `PARTIAL`, `CORRUPTED` ou `ENCRYPTED`.

Verifique a integridade de um arquivo:

```text
FSCK /caminho/arquivo.SCR
CHECK /caminho/arquivo.SCR
```

O resultado pode mostrar estado, conta associada, limite de bloqueio, setores ausentes, payload truncado, timestamp inválido ou outros dados de baixo nível.

Para anexar um fluxo de recuperação:

```text
RECOVER /caminho/arquivo.SCR
REPAIR /caminho/arquivo.SCR
```

Recuperar não significa ignorar permissões. Um arquivo protegido ainda pode exigir que a conta correspondente esteja autenticada. Depois de recuperado, o payload passa a estar montado para a sessão, mas as consequências do procedimento permanecem registradas.

## 11. Programas e ferramentas `.PROC`

Programas pessoais e de sistema são arquivos nativos, não menus externos. Para executar um programa:

```text
RUN /apps/player.PROC
EXEC /apps/player.PROC
START /personal/passenger-014/tool.PROC
```

Os três comandos são aliases. Um programa pode:

* imprimir código e estado técnico;
* exigir uma conta ou clearance;
* depender de uma credencial ou serviço;
* falhar se estiver corrompido;
* alterar energia, oxigênio, casco, rede, autoridade ou serviços;
* liberar um dispositivo ou alvo funcional da nave.

Quando uma dependência estiver ausente, o programa retorna `execution blocked :: dependency unavailable`. A mensagem identifica o requisito técnico, não explica a intenção narrativa.

### Registro de aplicativos

O diretório `/apps` contém os programas de sistema registrados no terminal desde o primeiro boot. Consulte o catálogo sem sair do shell:

```text
APPS
CD /apps
LS
```

Um `.PROC` encontrado em um terminal pessoal pode ser registrado para acesso rápido. A instalação não cria uma interface externa nem altera o arquivo original: ela grava uma entrada local no registro de aplicativos e materializa uma cópia operacional em `/apps`.

```text
INSTALL /personal/passenger-014/seed-tool.PROC
APPS
RUN /apps/passenger-014-seed-tool.PROC
```

O programa instalado conserva sua origem, proprietário, dependências, clearance e efeitos. A instalação exige a mesma permissão necessária para ler o pacote e não contorna corrupção ou autenticação. Para remover apenas a cópia registrada, mantendo o arquivo de origem intacto:

```text
UNINSTALL /apps/passenger-014-seed-tool.PROC
```

O registro de aplicativos faz parte do snapshot local da sessão. Após reload ou reboot, os programas instalados reaparecem em `/apps` sem qualquer tela de recuperação.

### IDE e Seed Script

O aplicativo `/apps/ide.PROC` é uma oficina textual para escrever programas em Seed Script. A linguagem combina a legibilidade de Portugol com expressões simples inspiradas em Python, mas não possui acesso ao navegador, ao DOM, ao armazenamento da sessão ou a dispositivos brutos. Toda leitura e toda operação de manutenção passam pelo kernel do Seed OS.

Um arquivo de trabalho pode ser criado e alimentado diretamente no terminal:

```text
EDIT /workspace/o2-check.PROC
EDIT /workspace/o2-check.PROC APPEND let level = seed("oxygen")
EDIT /workspace/o2-check.PROC APPEND print("O2 BEFORE = " + level)
EDIT /workspace/o2-check.PROC APPEND if level < 12:
EDIT /workspace/o2-check.PROC APPEND   print("RESERVE THRESHOLD")
COMPILE /workspace/o2-check.PROC
RUN /workspace/o2-check.PROC
```

Use dois espaços por nível de recuo. O compilador limita o tamanho da fonte, rejeita bindings externos, controla loops e informa a linha exata dos erros. `COMPILE` apenas deriva um artefato executável; `RUN` ainda verifica autoridade, BIOS, volumes, dependências e estado dos sistemas. Um programa pode estar correto e mesmo assim receber `repair rejected`, porque a linguagem solicita uma operação e não concede autorização.

Os livros em `/library/programming` contêm a especificação prática e exercícios sem solução automática. Os livros de engenharia, matemática, biologia, navegação e operações explicam os dados que um programa pode observar e os efeitos que o kernel pode aceitar. Não é necessário ler a biblioteca em ordem; a indexação existe para permitir caminhos diferentes e referências cruzadas.

## 12. Biblioteca, mensagens e registros visuais

Consulte o catálogo sem abrir uma interface externa:

```text
LIBRARY
LIBRARY programming
LIBRARY biology
BOOK /library/programming/seed-script-field-guide.BOOK
```

Os livros têm níveis `INTRO`, `CREW`, `OFFICER` ou `ROOT`, mas o nível não informa uma solução narrativa. Ele descreve a precisão operacional, a autoridade do vocabulário e o tipo de conhecimento pressuposto. Há obras em português, inglês, espanhol, francês, alemão, japonês, chinês e árabe; a fonte materna não deve ser tratada como uma tradução descartável.

O mensageiro oficial pode ser aberto como aplicativo ou consultado pelo shell:

```text
RUN /apps/msg.PROC
MSG INBOX
MSG OPEN /comms/seed/mission-brief-001.MSG
```

O canal não registrado não aparece na fila oficial. A consulta direta exige encontrar o caminho e possuir o clearance correspondente:

```text
MSG GHOST
MSG OPEN /comms/ghost/loop-02-handshake.MSG
```

Mensagens podem permanecer `UNREAD` mesmo quando a entrega foi registrada. Anexos `.SCR`, `.REC`, `.VIS` e `.BOOK` são referências ao VFS, não conteúdo automaticamente confiável. Vídeos públicos e notícias estão indexados como `.VIS`; abra os arquivos, compare legendas, horários e mensagens de entrega antes de assumir que uma transmissão é completa.

## 13. Música e reprodução em segundo plano

Arquivos musicais usam a extensão `.MUS`. Eles não são exibidos como MP3, WAV ou outro formato comum.

Para abrir uma faixa no dispositivo de áudio:

```text
PLAY /personal/passenger-014/playlist.MUS
MUSIC /personal/passenger-014/playlist.MUS
```

Se o contêiner estiver disponível e a fonte estiver montada, a reprodução começa em `/dev/audio0` e o terminal continua utilizável. Se somente os metadados estiverem presentes, o sistema informa `SOURCE_MISSING` ou `metadata only`.

Comandos de controle:

| Comando | Efeito |
|---|---|
| `AUDIO` ou `PLAYER` | Mostra dispositivo, estado, arquivo, título e buffer. |
| `PAUSE` | Pausa a faixa ativa. |
| `RESUME` | Retoma a faixa pausada. |
| `STOP` | Encerra o processo de áudio e zera a posição. |

O navegador exige uma ação do usuário antes de permitir áudio. Portanto, a música nunca começa durante o boot automaticamente.

## 14. Telemetria da nave

Use os aliases abaixo para consultar o estado operacional:

```text
SEED
STATUS
```

O sistema informa energia, oxigênio, integridade do casco, memória, rede, autoridade, serviços alterados, credenciais aceitas e volumes montados.

```text
POWER 31% | O2 14% | HULL 72% | MEMORY 86%
NETWORK FRAGMENTED | AUTHORITY GUEST | BOOT RUNNING
```

Os valores podem mudar quando um programa autorizado for executado ou quando a nave passar por um ciclo de reboot.

## 15. BIOS, firmware e reinicialização

Algumas operações não podem ser realizadas no shell normal. Para entrar no firmware:

```text
REBOOT BIOS
```

Dentro da BIOS:

```text
BIOS
BIOS SET <flag> ON
BIOS SET <flag> OFF
```

Flags existentes:

| Flag | Função técnica |
|---|---|
| `MAINTENANCE_PORT` | Torna disponível o volume/porta de manutenção. |
| `GHOST_BUS` | Permite o barramento e volume fantasma. |
| `CRYO_601` | Expõe o dispositivo associado à cápsula 601. |
| `ROOT_WRITE` | Libera escrita de baixo nível; exige autoridade `ROOT`. |
| `HIDDEN_VOLUME` | Permite que volumes ocultos sejam montados em operações compatíveis. |
| `DEBUG_CONSOLE` | Ativa a console de depuração do firmware. |

Variáveis de boot podem ser consultadas ou alteradas em estados de firmware:

```text
NVRAM
NVRAM SET BOOT_TARGET DIAGNOSTIC
NVRAM SET POST FULL
NVRAM SET DEBUG ON
```

Volumes são montados e desmontados fora do shell normal:

```text
MOUNT --all
MOUNT /maintenance
MOUNT /ghost
MOUNT /cryo601
UMOUNT /ghost
```

Depois de alterar o firmware, deixe a BIOS com:

```text
BOOT
BOOT DIAGNOSTIC
BOOT SAFE
BOOT RECOVERY
```

Modos disponíveis:

| Modo | Característica |
|---|---|
| Normal | Retorna ao shell operacional. |
| `BIOS` | Mantém a console de firmware aberta. |
| `DIAGNOSTIC` | Expõe dispositivos de diagnóstico e volumes especiais. |
| `SAFE` | Inicializa com uma superfície reduzida. |
| `RECOVERY` | Monta a imagem de recuperação. |
| `HALT` | Interrompe o sistema. |

Um reboot pode limpar buffers, interromper serviços e registrar a sessão. Em estados que não sejam `RUNNING`, o shell aceita somente comandos técnicos de firmware até um novo `BOOT`.

## 16. Um fluxo de uso possível

O fluxo abaixo não é uma solução narrativa; é apenas um exemplo de como operar o sistema:

```text
HELP
PWD
LS /
TREE /ship
FIND manifest
OPEN /ship/manifest.SCR
PASSENGER passenger-014
LS /personal/passenger-014
OPEN /personal/passenger-014/diary.SCR
OPEN /personal/passenger-014/playlist.MUS
FSCK /personal/passenger-014/playlist.MUS
PLAY /personal/passenger-014/playlist.MUS
AUDIO
```

Ao encontrar um nome de usuário ou serviço em um arquivo, você pode testar a autenticação ou consultar documentos relacionados:

```text
AUTH <usuario> <chave>
DOCS ACCESS_LOG
FIND <nome-ou-departamento>
USE <serviço> <chave>
RUN /apps/<programa>.PROC
STATUS
```

Quando uma operação retornar `permission denied`, `account required`, `volume hidden`, `binary unreadable` ou `dependency unavailable`, a mensagem descreve o estado técnico atual. Leia outros arquivos, verifique o firmware e observe os registros antes de insistir.

## 17. Princípios de interação

O Seed OS não confirma descobertas narrativas. Não há marcador de missão, indicador de avanço ou mensagem de sucesso de investigação. O sistema apenas monta arquivos, altera permissões, registra acessos, executa processos, muda serviços e responde ao estado atual.

A melhor forma de operar é manter uma anotação própria com nomes, caminhos, datas, idiomas, famílias, contas, serviços, flags e efeitos observados. O terminal fornece os dados; a interpretação e as conexões ficam com você.

## 17. Persistência da sessão

O estado da sessão é mantido localmente no navegador do jogador, sem cadastro, login externo ou mensagem de salvamento dentro do Seed OS. Comandos que alteram a sessão são gravados automaticamente: autenticação, tentativas de acesso, recuperação de arquivos, execução de programas, credenciais aceitas, mudanças de BIOS, montagem de volumes, reinicializações, serviços da nave e estado do áudio.

O armazenamento principal usa o banco local do navegador, com uma cópia compacta de recuperação. Fechar a aba ou reiniciar o navegador normalmente preserva o estado. Limpar os dados do site, usar uma janela privada, bloquear o armazenamento local ou trocar de navegador pode remover a sessão. A fonte binária das músicas não é duplicada no snapshot; o sistema guarda o caminho, a posição e os metadados necessários para retomar o processo quando a fonte estiver disponível.

## Referência rápida

```text
HELP                         referência do shell
LS / DIR                     listar
CD <path>                    navegar
PWD                          diretório atual
TREE <path>                  árvore
CAT / TYPE / OPEN <file>     abrir
FIND / SEARCH <term>         procurar
DOCS [type]                  registros corporativos
PASSENGER <term>             pessoa e arquivos
LANGUAGES                   distribuição de idiomas
WHOAMI                       conta e clearance
AUTH / LOGIN <u> <key>       autenticar usuário
USE <service> <key>          usar credencial salva
FSCK / CHECK <file>          integridade
RECOVER / REPAIR <file>     recuperar payload
RUN / EXEC / START <PROC>    executar programa
SEED / STATUS                telemetria
PLAY / MUSIC <MUS>           reproduzir áudio
PAUSE / RESUME / STOP        controlar áudio
AUDIO / PLAYER               estado do áudio
REBOOT [mode]                reiniciar
BIOS [SET flag ON|OFF]       firmware
NVRAM [SET key value]        variáveis de boot
MOUNT / UMOUNT               volumes
BOOT [mode]                  iniciar modo
CLEAR / CLS                  limpar tela
```
