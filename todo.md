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
- [ ] Testar `PWD`, `LS`, `DIR`, `CD`, `CAT`, `TYPE`, `OPEN`, `TREE`, `FIND` e `SEARCH` com caminhos válidos e inválidos.
- [ ] Testar `SEED`, `POWER`, `GENERATORS`, `LIFE`, `SYSLOG`, `NOTICES` e `REPAIR`, verificando consumo e avisos discretos.
- [ ] Testar autenticação, permissões, corrupção, `FSCK`, `RECOVER`, `RUN`, `SUDO`, BIOS, reboot, montagem e persistência local.
- [x] Verificar restauração do snapshot após recarregar a página e comportamento em viewport móvel.
- [x] Corrigir falhas encontradas e repetir as validações afetadas; o erro residual de `dotenv` foi isolado ao processo antigo e as validações foram repetidas após reinicialização.
- [ ] Garantir uma primeira cadeia de acesso inteiramente legível por GUEST, com pista, credencial, alvo e elevação verificáveis antes de qualquer arquivo CREW.
- [ ] Auditar cada credencial contextual para que sua fonte tenha clearance igual ou inferior ao nível exigido para descobri-la, evitando bloqueios circulares de progressão.
- [ ] Criar validação automatizada que simule o primeiro acesso GUEST e rejeite credenciais cuja única fonte esteja protegida por CREW, OFFICER ou ROOT.
- [ ] Expandir diários centrais em séries datadas de múltiplas entradas, com evolução emocional, técnica e relacional entre dias, sem contradizer a cronologia do VFS.
- [x] Transformar os livros `.BOOK` em obras extensas com páginas ou capítulos completos, índice, numeração, referências internas, apêndices e exemplos utilizáveis.
- [x] Reescrever os quinze volumes `.BOOK` como obras completas, sem páginas de preenchimento: cada um deverá ter tese ou propósito definido, desenvolvimento contínuo, exemplos ou estudos de caso, limites, glossário e encerramento coerente.
- [x] Estabelecer mínimos editoriais por categoria: procedimentos reproduzíveis nos manuais; exercícios e código executável nos livros de Seed Script; hipóteses, método e consequências nos volumes científicos; cronologia, fontes e vieses nas obras históricas.
- [x] Auditar página a página para remover resumos, repetições e texto genérico, preservando a voz, o idioma e as referências internas de cada autor fictício.
- [ ] Implementar leitura paginada no terminal (`BOOK <arquivo> <página>`) e preservar a posição de leitura por sessão sem criar uma superfície gráfica paralela.
- [ ] Tornar `/library` e o comando `LIBRARY` descobríveis por navegação, `TREE`, `FIND`, `SEARCH` e documentação de sistema, mantendo o acervo vasto sem destacar documentos obrigatórios.
- [ ] Auditar o volume mínimo, a continuidade e a qualidade linguística dos diários e livros antes de adicionar novas cadeias narrativas.
- [ ] Catalogar os aplicativos `.PROC` já funcionais e definir quais ficam disponíveis no `/apps` desde o primeiro boot.
- [ ] Implementar instalação diegética de `.PROC` descobertos nos arquivos pessoais, com verificação de dependências, permissões, integridade e compatibilidade.
- [ ] Persistir o inventário de aplicativos instalados no snapshot local e reconstruir o diretório `/apps` após reload ou reboot.
- [ ] Criar comandos técnicos para instalar, listar, abrir, executar e remover aplicações sem adicionar dashboard ou interface externa.
- [ ] Fazer os aplicativos instalados manterem entrypoint, versão, origem, proprietário, capacidades, estado e falhas no VFS.
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
- [ ] Criar exportação e importação técnica de sessão para recuperação manual quando o jogador limpar dados do navegador.
- [ ] Não armazenar fontes de áudio grandes no snapshot; persistir apenas caminho, estado, posição e metadados necessários.
- [ ] Documentar que limpar dados do site, usar navegação privada ou trocar de navegador pode apagar o progresso local.
- [ ] Testar fechamento da aba, reinicialização, falha de escrita, restauração e migração entre versões do Seed OS.
- [ ] Criar um registro de aplicações com ID, versão, extensão, tipo, entrypoint, permissões, dependências, dispositivos e capacidades.
- [ ] Separar arquivos executáveis `.PROC` de processos ativos, com PID, estado, memória, portas, arquivos abertos e dispositivo de saída.
- [ ] Definir APIs internas para VFS, áudio, tradução, input, relógio, telemetria, permissões e estado da nave.
- [ ] Implementar um player nativo que abra arquivos `.MUS` dentro do Seed OS e mantenha reprodução em segundo plano.
- [ ] Implementar um tradutor nativo capaz de ler arquivos pessoais em idiomas maternos e produzir uma camada temporária de interpretação.
- [ ] Modelar jogos e utilitários como aplicações reais do sistema, sem revelar objetivos ou linguagem externa de jogo.
- [ ] Criar uma biblioteca diegética em `/library` com livros técnicos, científicos, históricos e operacionais em múltiplos idiomas.
- [ ] Indexar livros por idioma, assunto, autor, departamento, nível, revisão, acesso e referências cruzadas sem transformar a biblioteca em um menu de objetivos.
- [ ] Criar o formato de documento `.BOOK` e comandos de consulta que permitam navegar, abrir, pesquisar e relacionar capítulos ao VFS.
- [ ] Definir a linguagem executável `Seed Script`, inspirada em Portugol e Python, com variáveis, condições, ciclos, funções, entrada, saída e APIs internas limitadas.
- [ ] Implementar uma IDE diegética em `.PROC` para criar, editar, salvar, compilar, testar, depurar e instalar programas Seed Script.
- [ ] Fazer o compilador retornar erros técnicos úteis, limites de segurança, dependências ausentes, permissões e incompatibilidades de firmware.
- [ ] Ligar programas criados pelo jogador a caminhos funcionais de acesso, reparo, substituição ou diagnóstico dos sistemas da nave.
- [ ] Criar exemplos quase funcionais de tripulantes, bibliotecas de código e módulos corrompidos que possam ser completados sem entregar soluções narrativas.
- [ ] Implementar o app oficial de mensagens e um canal não registrado, com `.MSG`, filas, destinatários, timestamps, anexos, apagamentos e permissões.
- [ ] Adicionar vídeos públicos de missão, notícias, mensagens não abertas e registros de comunicação, mantendo vínculos entre pessoas, famílias, departamentos e incidentes.
- [ ] Substituir resumos genéricos por livros com capítulos substantivos, exemplos, procedimentos, limitações, exercícios diegéticos e referências cruzadas verificáveis.
- [ ] Dar a cada obra uma voz editorial própria: manual operacional, tratado científico, caderno de bordo, apostila de formação, norma corporativa ou publicação clandestina.
- [ ] Revisar traduções e textos nativos para preservar registro, intimidade, hierarquia, terminologia e diferenças culturais sem usar frases automáticas repetidas.
- [ ] Fazer cada material técnico ensinar algo utilizável no Seed OS e relacionar conceitos a sensores, barramentos, firmware, biologia, navegação ou manutenção reais do VFS.
- [ ] Criar níveis de leitura e pré-requisitos naturais, permitindo que a biblioteca seja vasta e parcialmente redundante sem revelar qual documento é necessário.
- [ ] Revisar a continuidade editorial dos livros, mensagens e vídeos contra a cronologia, os personagens, as famílias, os departamentos e as falhas já estabelecidas.
- [ ] Isolar processos, tratar crash, corrupção, dependências ausentes, versão incompatível e encerramento forçado.
- [ ] Permitir que aplicações alterem apenas os estados e dispositivos autorizados, respeitando BIOS, autoridade e permissões.
- [ ] Criar compatibilidade de aplicações entre versões do Seed OS e registros de migração/rollback.
- [ ] Persistir processos, arquivos abertos, áudio ativo, tradução e efeitos da aplicação dentro da sessão do terminal.
- [ ] Testar o ecossistema com o shell como ponto único de entrada, sem dashboard paralelo ou player externo.
- [x] Definir a extensão proprietária de música, preferencialmente `.MUS`, separando-a de `.REC` para voz e interceptações.
- [x] Manter o codec real, duração, taxa, canal, checksum e MIME apenas em metadados internos do Seed OS, sem expor `.mp3`, `.wav` ou `.ogg`.
- [x] Modelar músicas por passageiro com título, autor, idioma/cultura, família, data, origem, humor técnico e relações com outros arquivos.
- [ ] Permitir arquivos `.MUS` ausentes, corrompidos, criptografados ou protegidos por conta, como qualquer outro artefato do VFS.
- [x] Criar um comando de reprodução que o jogador descubra pela documentação do próprio sistema, sem botão ou tutorial externo.
- [x] Implementar reprodução em segundo plano enquanto comandos continuam funcionando no shell.
- [x] Implementar comandos técnicos para iniciar, pausar, retomar, parar, avançar e consultar o buffer da faixa.
- [x] Mostrar somente estado nativo de áudio, como dispositivo, buffer, duração e checksum, sem uma interface de player convencional.
- [ ] Vincular músicas a diários, fotos, vídeos, famílias, idiomas e momentos da cronologia sem transformar toda faixa em pista explícita.
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
- [ ] Registrar tentativas de acesso no VFS e permitir bloqueios temporários, alertas silenciosos e mudanças de autoridade.
- [x] Permitir que o jogador deduza credenciais por documentos, teste combinações e encontre falhas internas sem receber uma solução explícita.
- [ ] Criar comandos e operações internas que possam explorar permissões mal configuradas, caches, arquivos temporários e processos não assinados.
- [ ] Fazer `CAT`, `OPEN`, `RUN`, `USE` e `SUDO` respeitarem a camada de acesso e o estado atual da sessão.
- [ ] Manter consequências persistentes: logs alterados, conta bloqueada, rede degradada, serviço liberado ou autoridade elevada.
- [x] Garantir que mensagens de intrusão permaneçam técnicas e não usem linguagem de missão, dica, puzzle ou recompensa.
- [x] Remover termos como “jogo”, “missão”, “pista”, “evidência”, “objetivo”, “progresso” e “quebra-cabeça” de toda saída visível do Seed OS.
- [x] Não mostrar tutorial, onboarding, lista de objetivos, dicas contextuais, botão de ajuda, marcador de descoberta ou confirmação narrativa de acerto.
- [ ] Fazer `HELP` exibir apenas uma referência técnica incompleta, como documentação legada de um shell real.
- [ ] Fazer erros, permissões e resultados de comandos soarem como respostas de sistema, sem explicar a intenção narrativa ou sugerir a próxima ação.
- [ ] Remover links de interface e textos que chamem relações de “pistas”; referências devem aparecer apenas como caminhos, IDs, timestamps e metadados.
- [ ] Manter contradições, senhas e relações escondidas em documentos ordinários, sem destacar o que é importante.
- [x] Fazer programas pessoais parecerem utilitários reais, arquivos corrompidos ou ferramentas específicas de trabalho, sem chamar o jogador para executá-los.
- [x] Garantir que o terminal não informe quando uma cadeia narrativa foi concluída; apenas o estado do sistema deve mudar.
- [x] Testar a tela inicial para assegurar que ela parece um sistema recuperado, não uma interface de jogo.
- [ ] Criar schema documental com `documentType`, `eventTime`, `authorId`, `recipientIds`, `department`, `accessTerminal`, `supersedes` e `links`.
- [ ] Adicionar logs técnicos do sistema, reinicializações, falhas de subsistemas, alterações de permissões e eventos de suporte à vida.
- [ ] Adicionar logs de acesso com usuário, terminal, caminho, ação, resultado, horário e origem de sessão.
- [ ] Criar atas de reunião com participantes, pauta, decisões, dissensos e itens de ação pendentes.
- [ ] Criar advertências disciplinares com destinatário, emissor, motivo, evidência, status e possível encobrimento.
- [ ] Criar memorandos enviados com remetente, destinatários, assunto, classificação, anexos e resposta esperada.
- [ ] Ligar cada documento a passageiros, famílias, departamentos, arquivos pessoais, arquivos corporativos e incidentes relevantes.
- [ ] Manter uma linha do tempo coerente, incluindo documentos apagados, sobrescritos ou com horários incompatíveis.
- [ ] Fazer `FIND`/`SEARCH` localizar documentos por tipo, pessoa, terminal, departamento, horário, palavra-chave e contradição.
- [ ] Usar atas, advertências e memorandos como pistas que abrem caminhos, credenciais ou interpretações alternativas — nunca como texto isolado.
- [ ] Modelar inventário pessoal por passageiro: diário, documento, foto, vídeo, música, jogo, programa, credencial e ferramenta.
- [ ] Distinguir arquivos passivos de arquivos executáveis e definir metadados de ação, permissão, dependências e efeitos na nave.
- [ ] Criar um formato seguro para senhas salvas, tokens, códigos e dicas contextuais, sem expor credenciais fora do fluxo narrativo.
- [ ] Permitir que programas pessoais sejam abertos com `RUN`, `EXEC`, `START` ou `USE`, retornando minijogos, utilitários ou alterações de estado.
- [ ] Criar estados persistentes de nave para portas, energia, suporte de vida, rede, criogenia, arquivos e autoridade de acesso.
- [ ] Ligar cada credencial ou ferramenta a um alvo funcional, como uma porta, painel, subsistema, processo ou terminal corporativo.
- [ ] Garantir que fotos, vídeos, músicas e documentos também possam conter pistas, relações, localizações, idiomas e senhas descobertas por contexto.
- [x] Remover a dependência da interface de dashboard: a tela principal deve ser um terminal de tela inteira, com prompt, histórico e saída textual.
- [x] Definir aliases híbridos Linux/DOS/Seed OS: `ls`/`dir`, `cat`/`type`/`open`, `pwd`/`cd`, `clear`/`cls`, `find`/`search`, `tree`, `whoami`, `seed` e `sudo`.
- [x] Permitir navegação por teclado como fluxo principal, incluindo histórico de comandos, setas, Tab para completar caminhos e Ctrl/Cmd+L para limpar a tela.
- [x] Renderizar `.SCR`, `.REC`, `.VIS`, `.HLT`, `.ATA` e `.PROC` como saída textual contextual dentro do terminal, sem cards ou inspector lateral.
- [ ] Reduzir o manifesto canônico de 700 para 600 passageiros e atualizar todos os contadores, cápsulas e referências de boot.
- [ ] Criar o schema de nacionalidade, língua materna, idioma operacional da Seed Corp e preferência de tradução por arquivo.
- [ ] Modelar famílias como grupos navegáveis, com parentesco, dependentes, sobrenomes, cápsulas e vínculos de emergência.
- [ ] Distribuir passageiros por função: comando, pilotos, navegação, engenharia, saúde, ciência, manutenção, operações, trabalhadores e famílias/colonos.
- [ ] Gerar arquivos pessoais em idiomas maternos, preservando o texto original e adicionando metadados de idioma, sem substituir a voz de cada personagem por tradução automática.
- [ ] Manter registros corporativos Seed Corp em idioma operacional comum, ligados aos arquivos pessoais por `ownerId`, `familyId`, `language` e `corporateRecordIds`.
- [ ] Adicionar filtros e indicadores de idioma, nacionalidade, família e camada `PERSONAL`/`CORPORATE` ao terminal e ao inspetor.
- [ ] Corrigir links narrativos para garantir que cada arquivo citado exista e que as relações familiares formem uma rede navegável.
- [ ] Testar os comandos de busca por pessoa, família, idioma, nacionalidade e caminho corporativo.
- [ ] Validar a nova contagem de arquivos, a tela responsiva e o build antes de salvar o próximo checkpoint.


## Player remoto e playlist de teste

- [x] Definir manifesto `.MUS` remoto com URL pública, identificadores técnicos, faixa, ordem e estado sem expor metadados externos na interface.
- [x] Instalar uma playlist de teste no diretório de `passenger-014`, preservando a descoberta pelo VFS e a autoridade das permissões existentes.
- [x] Implementar player remoto no nano painel direito com estados `REMOTE`, `BUFFERING`, `PLAYING`, `PAUSED`, `BLOCKED` e `SOURCE_UNAVAILABLE`.
- [x] Implementar modo LO-FI visual e sonoro quando tecnicamente possível, sem alterar a fonte remota nem baixar o áudio.
- [x] Integrar reprodução, pausa, retomada, parada, faixa anterior/próxima e consulta de estado aos comandos atuais do Seed OS.
- [x] Persistir somente manifesto, faixa, posição aproximada, volume, modo LO-FI e estado necessário; nunca persistir bytes de áudio.
- [x] Testar a abertura da playlist a partir de `passenger-014` e registrar limitações de autoplay, embed, disponibilidade e origem remota.
- [x] Corrigir o erro local de `dotenv` antes da validação final do player.
- [ ] Salvar checkpoint do player remoto após `pnpm check`, build, testes e validação visual.

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
- [ ] Criar checkpoint final.


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
