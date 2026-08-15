# Lost Terminal — Revisão multilíngue e manifesto de 600 passageiros

## Próxima iteração

- [x] Definir uma gramática visual própria do Seed OS para ponteiro, foco, seleção, abertura e profundidade, sem emular desktop, janelas ou menus de Windows, macOS ou Linux.
- [x] Construir uma superfície gráfica diegética em torno do terminal persistente, com navegação espacial por arquivos, evidências e subsistemas sem criar uma interface externa ao universo.
- [x] Mapear ações gráficas de mouse e teclado para os mesmos caminhos e permissões do VFS, mantendo comando e clique semanticamente equivalentes.
- [x] Integrar player `.MUS`, leitor de arquivos, mensageria e aplicativos `.PROC` a instrumentos visuais próprios, com estado, falhas e limites herdados do Seed OS.
- [x] Projetar comportamento responsivo para mouse, toque e teclado, preservando densidade investigativa e sem converter a experiência em um painel convencional.
- [x] Executar `pnpm check` e build de produção.
- [x] Inspecionar logs de desenvolvimento, console do navegador e requisições após boot e interação; evidência registrada em `validation-suno-playlist.md`.
- [x] Verificar a sequência de boot, bloqueio do prompt e entrada no fallback shell.
- [x] Testar `PWD`, `LS`, `DIR`, `CD`, `CAT`, `TYPE`, `OPEN`, `TREE`, `FIND` e `SEARCH` com caminhos válidos e inválidos.
- [x] Testar `SEED`, `POWER`, `GENERATORS`, `LIFE`, `SYSLOG`, `NOTICES` e `REPAIR`, verificando consumo e avisos discretos.
- [x] Testar autenticação, permissões, corrupção, `FSCK`, `RECOVER`, `RUN`, `SUDO`, BIOS, reboot, montagem e persistência local.
- [x] Verificar restauração do snapshot após recarregar a página e comportamento em viewport móvel.
- [x] Corrigir falhas encontradas e repetir as validações afetadas; o erro residual de `dotenv` foi isolado ao processo antigo e as validações foram repetidas após reinicialização.
- [x] Garantir uma primeira cadeia de acesso inteiramente legível por GUEST, com pista, credencial, alvo e elevação verificáveis antes de qualquer arquivo CREW.
- [x] Auditar cada credencial contextual para que sua fonte tenha clearance igual ou inferior ao nível exigido para descobri-la, evitando bloqueios circulares de progressão.
- [x] Criar validação automatizada que simule o primeiro acesso GUEST e rejeite credenciais cuja única fonte esteja protegida por CREW, OFFICER ou ROOT.
- [x] Expandir diários centrais em séries datadas de múltiplas entradas, com evolução emocional, técnica e relacional entre dias, sem contradizer a cronologia do VFS.
- [x] Transformar os livros `.BOOK` em obras extensas com páginas ou capítulos completos, índice, numeração, referências internas, apêndices e exemplos utilizáveis.
- [x] Reescrever os quinze volumes `.BOOK` como obras completas, sem páginas de preenchimento: cada um deverá ter tese ou propósito definido, desenvolvimento contínuo, exemplos ou estudos de caso, limites, glossário e encerramento coerente.
- [x] Estabelecer mínimos editoriais por categoria: procedimentos reproduzíveis nos manuais; exercícios e código executável nos livros de Seed Script; hipóteses, método e consequências nos volumes científicos; cronologia, fontes e vieses nas obras históricas.
- [x] Auditar página a página para remover resumos, repetições e texto genérico, preservando a voz, o idioma e as referências internas de cada autor fictício.
- [x] Implementar leitura paginada no terminal (`BOOK <arquivo> <página>`) e preservar a posição de leitura por sessão sem criar uma superfície gráfica paralela.
- [x] Tornar `/library` e o comando `LIBRARY` descobríveis por navegação, `TREE`, `FIND`, `SEARCH` e documentação de sistema, mantendo o acervo vasto sem destacar documentos obrigatórios.
- [x] Auditar o volume mínimo, a continuidade e a qualidade linguística dos diários e livros antes de adicionar novas cadeias narrativas.
- [x] Catalogar os aplicativos `.PROC` já funcionais e definir quais ficam disponíveis no `/apps` desde o primeiro boot.
- [x] Implementar instalação diegética de `.PROC` descobertos nos arquivos pessoais, com verificação de dependências, permissões, integridade e compatibilidade.
- [x] Persistir o inventário de aplicativos instalados no snapshot local e reconstruir o diretório `/apps` após reload ou reboot.
- [x] Criar comandos técnicos para instalar, listar, abrir, executar e remover aplicações sem adicionar dashboard ou interface externa.
- [x] Fazer os aplicativos instalados manterem entrypoint, versão, origem, proprietário, capacidades, estado e falhas no VFS.
- [x] Definir um relógio de simulação e taxas de consumo para energia, oxigênio, memória, calor, casco e rede.
- [x] Modelar geradores, barramentos, relés, baterias, distribuição e serviços de suporte à vida no runtime.
- [x] Criar documentos técnicos coerentes para geradores, filtros de O2, circuitos, falhas e procedimentos de manutenção.
- [x] Implementar avisos discretos por logs, telemetria, mudanças de prompt e degradação de serviços, sem banners narrativos.
- [x] Adicionar comandos técnicos para consultar, isolar, reparar, reiniciar e religar subsistemas.
- [x] Fazer programas `.PROC` e credenciais alterarem o estado da nave apenas quando dependências e permissões forem satisfeitas.
- [x] Integrar o consumo ao ciclo de sessão e à persistência local, mantendo consequências após reboot e reabertura do navegador.
- [x] Expandir diretórios operacionais para que a navegação e a leitura de arquivos revelem procedimentos sem objetivos explícitos.
- [x] Testar consumo, falhas em cascata, recuperação de geradores, suporte à vida e ausência de alertas espalhafatosos.
- [x] Definir um snapshot versionado da sessão com cwd, histórico, autoridade, autenticações, tentativas, arquivos recuperados, firmware, volumes, serviços, telemetria e áudio.
- [x] Implementar IndexedDB como armazenamento principal do progresso local, sem depender do cache HTTP do navegador.
- [x] Adicionar fallback mínimo em `localStorage` para recuperar o último snapshot válido quando IndexedDB estiver indisponível.
- [x] Salvar silenciosamente após cada comando que alterar estado, incluindo AUTH, USE, RECOVER, RUN, REBOOT, BIOS, NVRAM, MOUNT, BOOT e áudio.
- [x] Restaurar a sessão automaticamente ao abrir o Seed OS, sem tela de login, modal, tutorial ou mensagem externa de carregamento.
- [x] Versionar snapshots e ignorar dados incompatíveis ou corrompidos sem quebrar o boot do sistema.
- [x] Criar exportação e importação técnica de sessão para recuperação manual quando o jogador limpar dados do navegador.
- [x] Não armazenar fontes de áudio grandes no snapshot; persistir apenas caminho, estado, posição e metadados necessários.
- [x] Documentar que limpar dados do site, usar navegação privada ou trocar de navegador pode apagar o progresso local.
- [x] Testar fechamento da aba, reinicialização, falha de escrita, restauração e migração entre versões do Seed OS.
- [x] Criar um registro de aplicações com ID, versão, extensão, tipo, entrypoint, permissões, dependências, dispositivos e capacidades.
- [x] Separar arquivos executáveis `.PROC` de processos ativos, com PID, estado, memória, portas, arquivos abertos e dispositivo de saída.
- [x] Definir APIs internas para VFS, áudio, tradução, input, relógio, telemetria, permissões e estado da nave.
- [x] Implementar um player nativo que abra arquivos `.MUS` dentro do Seed OS e mantenha reprodução em segundo plano.
- [ ] Implementar um tradutor nativo capaz de ler arquivos pessoais em idiomas maternos e produzir uma camada temporária de interpretação; o protótipo cobre oito idiomas e vários payloads, mas ainda precisa de interpretação substantiva de conteúdo real.
- [x] Modelar jogos e utilitários como aplicações reais do sistema, sem revelar objetivos ou linguagem externa de jogo; `UTILITY`, `APPLICATION` e `GAME` agora são payloads `.PROC` reais.
- [x] Criar uma biblioteca diegética em `/library` com livros técnicos, científicos, históricos e operacionais em múltiplos idiomas.
- [x] Indexar livros por idioma, assunto, autor, departamento, nível, revisão, acesso e referências cruzadas sem transformar a biblioteca em um menu de objetivos.
- [x] Criar o formato de documento `.BOOK` e comandos de consulta que permitam navegar, abrir, pesquisar e relacionar capítulos ao VFS.
- [x] Definir a linguagem executável `Seed Script`, inspirada em Portugol e Python, com variáveis, condições, ciclos, funções, entrada, saída e APIs internas limitadas.
- [x] Implementar uma IDE diegética em `.PROC` para criar, editar, salvar, compilar, testar, depurar e instalar programas Seed Script.
- [x] Fazer o compilador retornar erros técnicos úteis, limites de segurança, dependências ausentes, permissões e incompatibilidades de firmware.
- [x] Ligar programas criados pelo jogador a caminhos funcionais de acesso, reparo, substituição ou diagnóstico dos sistemas da nave.
- [x] Criar exemplos quase funcionais de tripulantes, bibliotecas de código e módulos corrompidos que possam ser completados sem entregar soluções narrativas; `memory-grid.PROC` e o módulo corrompido de passenger-512 cobrem esses estados.
- [x] Implementar o app oficial de mensagens e um canal não registrado, com `.MSG`, filas, destinatários, timestamps, anexos, apagamentos e permissões.
- [x] Adicionar vídeos públicos de missão, notícias, mensagens não abertas e registros de comunicação, mantendo vínculos entre pessoas, famílias, departamentos e incidentes.
- [x] Substituir resumos genéricos por livros com capítulos substantivos, exemplos, procedimentos, limitações, exercícios diegéticos e referências cruzadas verificáveis.
- [x] Dar a cada obra uma voz editorial própria: manual operacional, tratado científico, caderno de bordo, apostila de formação, norma corporativa ou publicação clandestina.
- [x] Revisar traduções e textos nativos para preservar registro, intimidade, hierarquia, terminologia e diferenças culturais sem usar frases automáticas repetidas.
- [x] Fazer cada material técnico ensinar algo utilizável no Seed OS e relacionar conceitos a sensores, barramentos, firmware, biologia, navegação ou manutenção reais do VFS.
- [x] Criar níveis de leitura e pré-requisitos naturais, permitindo que a biblioteca seja vasta e parcialmente redundante sem revelar qual documento é necessário.
- [x] Revisar a continuidade editorial dos livros, mensagens e vídeos contra a cronologia, os personagens, as famílias, os departamentos e as falhas já estabelecidas.
- [ ] Isolar processos, tratar crash, corrupção, dependências ausentes, versão incompatível e encerramento forçado.
- [ ] Permitir que aplicações alterem apenas os estados e dispositivos autorizados, respeitando BIOS, autoridade e permissões.
- [ ] Criar compatibilidade de aplicações entre versões do Seed OS e registros de migração/rollback.
- [ ] Persistir processos, arquivos abertos, áudio ativo, tradução e efeitos da aplicação dentro da sessão do terminal.
- [x] Testar o ecossistema com o shell como ponto único de entrada, sem dashboard paralelo ou player externo.
- [x] Definir a extensão proprietária de música, preferencialmente `.MUS`, separando-a de `.REC` para voz e interceptações.
- [x] Manter o codec real, duração, taxa, canal, checksum e MIME apenas em metadados internos do Seed OS, sem expor `.mp3`, `.wav` ou `.ogg`.
- [x] Modelar músicas por passageiro com título, autor, idioma/cultura, família, data, origem, humor técnico e relações com outros arquivos.
- [x] Permitir arquivos `.MUS` ausentes, corrompidos, criptografados ou protegidos por conta, como qualquer outro artefato do VFS.
- [x] Criar um comando de reprodução que o jogador descubra pela documentação do próprio sistema, sem botão ou tutorial externo.
- [x] Implementar reprodução em segundo plano enquanto comandos continuam funcionando no shell.
- [x] Implementar comandos técnicos para iniciar, pausar, retomar, parar, avançar e consultar o buffer da faixa.
- [x] Mostrar somente estado nativo de áudio, como dispositivo, buffer, duração e checksum, sem uma interface de player convencional.
- [x] Vincular músicas a diários, fotos, vídeos, famílias, idiomas e momentos da cronologia sem transformar toda faixa em pista explícita.
- [x] Respeitar autoplay bloqueado pelo navegador e iniciar áudio apenas após uma ação do usuário no terminal.
- [x] Testar silêncio durante o boot, reprodução após descoberta e persistência do estado ao navegar pelo VFS ou entrar na BIOS.
- [x] Criar uma tela inicial de boot do Seed OS antes do shell, sem prompt disponível durante a inicialização.
- [x] Exibir POST, checagem de memória, montagem read-only do VFS, setores defeituosos, varredura das cápsulas 001–600 e detecção da cápsula 601.
- [x] Exibir o erro técnico `FATAL ERROR: Neural_Buffer_Corrupted` e transferir a sessão para `GUEST / FALLBACK SHELL`.
- [x] Exibir a árvore ANSI da Seed Corp usando blocos Unicode, sem texto explicando a história ou orientando o usuário.
- [x] Permitir que a sequência seja observada integralmente e oferecer somente um atalho técnico de interrupção/reinicialização, se necessário.
- [x] Remover “Lost Terminal” de títulos, subtítulos, rodapé, favicon/metadados visíveis e strings do shell.
- [x] Remover referências a jogo, produto ou interface externa do `index.html`, mantendo apenas a identidade operacional do Seed OS.
- [x] Garantir que o primeiro prompt só apareça depois de `fallback`, suporte de vida crítico e montagem do shell.
- [x] Criar uma bíblia de continuidade com datas relativas, eventos principais, versões do boot, estado da nave, responsáveis e consequências.
- [x] Validar que os 600 passageiros, 150 famílias, nacionalidades, idiomas, cargos, departamentos e cápsulas não se contradigam.
- [x] Validar que cada personagem citado em diário, áudio, foto, vídeo, ata, advertência, memorando ou log exista no manifesto.
- [x] Validar que cada caminho apontado por `links`, credencial, ferramenta, programa ou registro exista no índice do VFS.
- [x] Manter três perspectivas distinguíveis: voz pessoal no idioma materno, registro corporativo em SEED-OPS e saída técnica do sistema.
- [x] Criar uma cronologia única para boot, apagão, cápsula 601, Neural Buffer, reuniões, advertências, acessos, corrupção e reinicializações.
- [ ] Fazer contradições nascerem de versões, permissões, apagamentos e interesses de personagens, nunca de erro acidental de cadastro.
- [ ] Vincular cada senha, programa, corrupção e flag de firmware a um evento, pessoa, departamento e consequência verificável.
- [ ] Preservar diferenças culturais e linguísticas nas vozes, nomes, relações familiares e formas de registrar intimidade ou autoridade.
- [x] Criar uma validação automática de órfãos, links quebrados, IDs inexistentes, idiomas inválidos e eventos fora da cronologia.
- [ ] Revisar o terminal para que nenhuma saída contradiga o estado real do VFS, da sessão, da BIOS ou da nave.
- [x] Modelar estados de boot `RUNNING`, `HALTED`, `DIAGNOSTIC`, `SAFE_MODE`, `RECOVERY` e `BIOS`.
- [x] Criar comandos diegéticos para `REBOOT`, `SHUTDOWN`, `BIOS`, `BOOT`, `MOUNT`, `UMOUNT` e `NVRAM`.
- [x] Definir a sequência de hardware checks, POST, montagem de volumes e fallback após cada reinicialização.
- [x] Criar flags de firmware para portas de manutenção, rede, criogenia, suporte de vida, dispositivos externos e volumes protegidos.
- [x] Permitir que algumas permissões só sejam liberadas alterando flags na BIOS, não por `SUDO` dentro do shell.
- [x] Criar volumes read-only, volumes ocultos, partições de recuperação e dispositivos que só aparecem em modo diagnóstico.
- [x] Fazer reboot interromper processos, limpar buffers temporários ou registrar a sessão conforme o modo selecionado.
- [x] Ligar a BIOS a arquivos corrompidos, chaves de recuperação, contas ROOT e montagem de payloads recuperáveis.
- [x] Manter o estado de firmware persistente entre comandos e reinicializações dentro da sessão do terminal.
- [x] Exibir apenas POST, códigos, flags e mensagens técnicas, sem explicar o motivo narrativo de cada desbloqueio.
- [ ] Modelar camadas de acesso `GUEST`, `CREW`, `OFFICER`, `ROOT` e subpermissões por usuário, departamento, terminal e serviço.
- [ ] Criar contas de usuários com identificador, nome, hash parcial, senha possível, salt, status, tentativas e terminal de origem.
- [x] Criar arquivos corrompidos com setores ausentes, caracteres inválidos, timestamps quebrados, payloads truncados e caminhos recuperáveis.
- [x] Implementar respostas técnicas diferentes para senha válida, senha inválida, usuário inexistente, arquivo bloqueado e arquivo corrompido.
- [x] Registrar tentativas de acesso no VFS e permitir bloqueios temporários, alertas silenciosos e mudanças de autoridade; cobertura validada no fluxo de AUTH e expiração por relógio.
- [x] Permitir que o jogador deduza credenciais por documentos, teste combinações e encontre falhas internas sem receber uma solução explícita.
- [ ] Criar comandos e operações internas que possam explorar permissões mal configuradas, caches, arquivos temporários e processos não assinados.
- [x] Fazer `CAT`, `OPEN`, `RUN`, `USE` e `SUDO` respeitarem a camada de acesso e o estado atual da sessão.
- [x] Manter consequências persistentes: logs alterados, conta bloqueada, rede degradada, serviço liberado ou autoridade elevada.
- [x] Garantir que mensagens de intrusão permaneçam técnicas e não usem linguagem de missão, dica, puzzle ou recompensa.
- [x] Remover termos como “jogo”, “missão”, “pista”, “evidência”, “objetivo”, “progresso” e “quebra-cabeça” de toda saída visível do Seed OS.
- [x] Não mostrar tutorial, onboarding, lista de objetivos, dicas contextuais, botão de ajuda, marcador de descoberta ou confirmação narrativa de acerto.
- [x] Fazer `HELP` exibir apenas uma referência técnica incompleta, como documentação legada de um shell real; saída coberta por `isLegacyHelp` e matriz de comandos.
- [x] Fazer erros, permissões e resultados de comandos soarem como respostas de sistema, sem explicar a intenção narrativa ou sugerir a próxima ação.
- [x] Remover links de interface e textos que chamem relações de “pistas”; referências devem aparecer apenas como caminhos, IDs, timestamps e metadados.
- [x] Manter contradições, senhas e relações escondidas em documentos ordinários, sem destacar o que é importante.
- [x] Fazer programas pessoais parecerem utilitários reais, arquivos corrompidos ou ferramentas específicas de trabalho, sem chamar o jogador para executá-los.
- [x] Garantir que o terminal não informe quando uma cadeia narrativa foi concluída; apenas o estado do sistema deve mudar.
- [x] Testar a tela inicial para assegurar que ela parece um sistema recuperado, não uma interface de jogo.
- [x] Criar schema documental com `documentType`, `eventTime`, `authorId`, `recipientIds`, `department`, `accessTerminal`, `supersedes` e `links`; contrato validado por `documentSchemaIssues`.
- [x] Adicionar logs técnicos do sistema, reinicializações, falhas de subsistemas, alterações de permissões e eventos de suporte à vida.
- [x] Adicionar logs de acesso com usuário, terminal, caminho, ação, resultado, horário e origem de sessão.
- [x] Criar atas de reunião com participantes, pauta, decisões, dissensos e itens de ação pendentes.
- [x] Criar advertências disciplinares com destinatário, emissor, motivo, evidência, status e possível encobrimento.
- [x] Criar memorandos enviados com remetente, destinatários, assunto, classificação, anexos e resposta esperada.
- [x] Ligar cada documento a passageiros, famílias, departamentos, arquivos pessoais, arquivos corporativos e incidentes relevantes.
- [x] Manter uma linha do tempo coerente, incluindo documentos apagados, sobrescritos ou com horários incompatíveis.
- [x] Fazer `FIND`/`SEARCH` localizar documentos por tipo, pessoa, terminal, departamento, horário, palavra-chave e contradição; filtros indexados e cobertura determinística adicionada.
- [x] Usar atas, advertências e memorandos como referências que abrem caminhos, credenciais ou interpretações alternativas — nunca como texto isolado.
- [ ] Modelar inventário pessoal por passageiro: diário, documento, foto, vídeo, música, jogo, programa, credencial e ferramenta; fotos, jogos e ferramentas ainda precisam ser comprovados.
- [x] Distinguir arquivos passivos de arquivos executáveis e definir metadados de ação, permissão, dependências e efeitos na nave.
- [x] Criar um formato seguro para senhas salvas, tokens, códigos e referências contextuais, sem expor credenciais fora do fluxo narrativo.
- [x] Permitir que programas pessoais sejam abertos com `RUN`, `EXEC`, `START` ou `USE`, retornando utilitários ou alterações de estado.
- [ ] Criar estados persistentes de nave para portas, energia, suporte de vida, rede, criogenia, arquivos e autoridade de acesso; portas e criogenia ainda precisam de persistência explícita.
- [x] Ligar cada credencial ou ferramenta a um alvo funcional, como uma porta, painel, subsistema, processo ou terminal corporativo.
- [x] Garantir que fotos, vídeos, músicas e documentos também possam conter referências, relações, localizações, idiomas e credenciais descobertas por contexto.
- [x] Remover a dependência da interface de dashboard: a tela principal deve ser um terminal de tela inteira, com prompt, histórico e saída textual.
- [x] Definir aliases híbridos Linux/DOS/Seed OS: `ls`/`dir`, `cat`/`type`/`open`, `pwd`/`cd`, `clear`/`cls`, `find`/`search`, `tree`, `whoami`, `seed` e `sudo`.
- [x] Permitir navegação por teclado como fluxo principal, incluindo histórico de comandos, setas, Tab para completar caminhos e Ctrl/Cmd+L para limpar a tela.
- [x] Renderizar `.SCR`, `.REC`, `.VIS`, `.HLT`, `.ATA` e `.PROC` como saída textual contextual dentro do terminal, sem cards ou inspector lateral.
- [x] Reduzir o manifesto canônico de 700 para 600 passageiros e atualizar todos os contadores, cápsulas e referências de boot.
- [x] Criar o schema de nacionalidade, língua materna, idioma operacional da Seed Corp e preferência de tradução por arquivo.
- [x] Modelar famílias como grupos navegáveis, com parentesco, dependentes, sobrenomes, cápsulas e vínculos de emergência.
- [x] Distribuir passageiros por função: comando, pilotos, navegação, engenharia, saúde, ciência, manutenção, operações, trabalhadores e famílias/colonos.
- [x] Gerar arquivos pessoais em idiomas maternos, preservando o texto original e adicionando metadados de idioma, sem substituir a voz de cada personagem por tradução automática.
- [x] Manter registros corporativos Seed Corp em idioma operacional comum, ligados aos arquivos pessoais por `ownerId`, `familyId`, `language` e `corporateRecordIds`.
- [ ] Adicionar filtros e indicadores de idioma, nacionalidade, família e camada `PERSONAL`/`CORPORATE` ao terminal e ao inspetor; falta comprovar a cobertura completa na interface.
- [x] Corrigir links narrativos para garantir que cada arquivo citado exista e que as relações familiares formem uma rede navegável.
- [x] Testar os comandos de busca por pessoa, família, idioma, nacionalidade e caminho corporativo; busca por pessoa, família, idioma e metadados corporativos validada no índice.
- [x] Validar a nova contagem de arquivos, a tela responsiva e o build antes de salvar o próximo checkpoint.


## Player remoto e playlist de teste

- [x] Definir manifesto `.MUS` remoto com URL pública, identificadores técnicos, faixa, ordem e estado sem expor metadados externos na interface.
- [x] Instalar uma playlist de teste no diretório de `passenger-014`, preservando a descoberta pelo VFS e a autoridade das permissões existentes.
- [x] Implementar player remoto no nano painel direito com estados `REMOTE`, `BUFFERING`, `PLAYING`, `PAUSED`, `BLOCKED` e `SOURCE_UNAVAILABLE`.
- [x] Implementar modo LO-FI visual e sonoro quando tecnicamente possível, sem alterar a fonte remota nem baixar o áudio.
- [x] Integrar reprodução, pausa, retomada, parada, faixa anterior/próxima e consulta de estado aos comandos atuais do Seed OS.
- [x] Persistir somente manifesto, faixa, posição aproximada, volume, modo LO-FI e estado necessário; nunca persistir bytes de áudio.
- [x] Testar a abertura da playlist a partir de `passenger-014` e registrar limitações de autoplay, embed, disponibilidade e origem remota.
- [x] Corrigir o erro local de `dotenv` antes da validação final do player.
- [x] Salvar checkpoint do player remoto após `pnpm check`, build, testes e validação visual (`ef95d0ef`).

## Registro técnico do player remoto

- [x] Manter a URL pública apenas como referência técnica não exibida no painel diegético.
- [x] Não baixar, reempacotar ou redistribuir áudio da fonte externa.
- [x] Exibir ao jogador apenas a identidade ficcional do arquivo `.MUS`, conforme o manifesto do passageiro.
- [x] Tratar indisponibilidade da fonte como comportamento normal de rede do Seed OS.
- [x] Não usar backend, banco ou autenticação para o player local/remoto.

## Próxima ação

- [x] Integrar o manifesto de playlist em `passenger-014`.
- [x] Implementar o nano painel do player.
- [ ] Validar manualmente a reprodução e o modo LO-FI após `AUTH I.CHEN` e `PLAY playlist.MUS`.
- [x] Criar checkpoint final.


## Pipeline LO-FI oculto

- [x] Remover o controle visível de LO-FI do nano player e tratar o efeito como parte fixa do pipeline de áudio.
- [x] Aplicar o tratamento automático a todas as músicas `.MUS`, tanto locais quanto remotas, sem alterar o manifesto ou a identidade diegética das faixas.
- [x] Definir uma cadeia sonora segura com filtro passa-baixas e compressão moderada, respeitando limites do Web Audio.
- [x] Tratar fontes cross-origin sem acesso ao áudio bruto: manter o embed funcional sem alegar processamento de áudio que a origem não permite.
- [x] Garantir que autoplay bloqueado, erro de origem e ausência de faixa não quebrem o terminal nem exponham a origem externa.
- [x] Cobrir o pipeline com testes unitários e validar que nenhum controle ou metadado técnico do filtro aparece no painel.


## Correção do player externo

- [x] Remover completamente o iframe/embed oficial do Suno do nano painel.
- [x] Verificar se a fonte oferece URL de áudio direto público compatível com `HTMLAudioElement`; a autorização de uso permanece sob responsabilidade do proprietário do áudio.
- [x] Implementar o player próprio do Seed OS com controles, progresso e estados diegéticos, sem renderizar a página ou o player da fonte.
- [x] Se a fonte não permitir reprodução direta, manter somente o player próprio em estado `SOURCE_UNAVAILABLE` ou `REMOTE_BLOCKED`, sem fallback visual externo.
- [x] Garantir que nenhum texto, ícone, marca, metadado ou controle do Suno apareça no DOM do Seed OS.
- [x] Testar a política de áudio local, fonte remota direta permitida e fonte sem áudio com o mesmo player próprio.
- [x] Atualizar a validação; checkpoint da correção será salvo após esta revisão e a política de fonte foi coberta por testes unitários.


## Auditoria da matriz de comandos — concluída

- [x] Criar `scripts/verify-seed-command-matrix.ts` para auditar aliases, bootstrap GUEST, paginação, sessão e fontes de áudio.
- [x] Corrigir a auditoria para reconhecer `SYSTEM_LOG`, `DISCIPLINARY_WARNING`, a credencial no VFS e a assinatura real de `BOOK`.
- [x] Executar `SEED_COMMAND_MATRIX=PASS` com 26 comandos cobertos.
- [x] Executar 7 testes unitários: `audioPipeline`, `audioSource` e `nanoPanels`.
- [x] Executar `pnpm check` sem erros TypeScript.
- [x] Executar `pnpm build`; permanece apenas o aviso não bloqueante de chunk acima de 500 kB.
- [x] Salvar checkpoint com a matriz de comandos aprovada.

- [x] Corrigir o resíduo de inicialização fullstack: manter pnpm dev em Vite estático e confirmar que o erro antigo de dotenv não reaparece após reinício limpo.
- [x] Adicionar busca contextual por campos (type, person, terminal, department, time, keyword, contradiction) ao dispatcher FIND/SEARCH.
- [x] Adicionar auditoria pura de schema documental, cobertura de campos e inventário pessoal, com testes Vitest.
- [x] Implementar bloqueio temporário de contas por ciclos do Seed OS, expiração persistente em snapshots e aviso técnico no buffer SYSLOG.
- [x] Validar TypeScript, suíte Vitest, auditorias Seed OS, matriz de comandos e build de produção após reinicialização do servidor; suíte atualizada para 18 testes.

- [ ] Validar manualmente no navegador o fluxo de reprodução de playlist.MUS após AUTH I.CHEN e PLAY playlist.MUS; autoplay e disponibilidade do canal direto dependem da sessão do navegador.
- [ ] Implementar tradutor nativo Seed OS para arquivos multilíngues, preservando texto original e autoridade; `TRANSLATE` aplica hoje uma camada parcial sem contornar clearance, conta ou integridade.
- [ ] Formalizar isolamento completo de processos .PROC com PID, memória, portas e encerramento seguro.
- [x] Adicionar lentes visuais dedicadas para payloads .VIS e .REC no Connection Lens, com frame trace, telemetria, buffer de transcrição e codec diegético.

- [x] Adicionar testes objetivos para AUTH cobrindo tentativas falhas, bloqueio temporário, expiração por relógio, aviso silencioso e mudança de autoridade após credenciais válidas.
- [x] Reduzir HELP a uma referência técnica incompleta/legada ou ajustar sua política com teste forte de diegese, sem catalogar o sistema como tutorial.
- [x] Adicionar testes determinísticos de FIND/SEARCH para `family=`, `language=`, `nationality=`, `path=` e combinações de filtros.

- [x] Adicionar bibliotecas de código diegéticas reais no VFS, com snippets de tripulantes ligados a `.PROC` existentes e referências cruzadas.
- [x] Tornar exemplos quase funcionais completáveis de fato, com lacunas técnicas, dependências, referências e comportamento verificável após reparo/execução.
- [x] Auditar exemplos completáveis, comprovando biblioteca de código, programa de tripulante e módulo corrompido reparável em testes determinísticos.
