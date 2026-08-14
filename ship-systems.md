# Seed OS — Sistemas de bordo

> Documento de continuidade interna. O sistema deve parecer uma máquina operacional, nunca um painel de objetivos.

## Princípio de apresentação

Energia, oxigênio e falhas não serão apresentados como notificações de jogo. O Seed OS registra estados em telemetria, logs, arquivos de manutenção, respostas de dispositivos e mudanças graduais de disponibilidade. O terminal não interrompe a leitura com banners; quando algo muda, a informação aparece onde um operador realmente procuraria: `SEED`, `STATUS`, `POWER`, diretórios de manutenção, logs e respostas de comandos.

O boot pode registrar a reserva de suporte à vida como uma linha técnica compacta. Depois disso, o estado não será repetido a cada tela. O jogador precisa consultar o sistema, comparar timestamps e reconhecer que um serviço deixou de responder, que um barramento perdeu redundância ou que o prognóstico de oxigênio mudou.

## Relógio de simulação

O tempo de bordo avança por operações reais do terminal. Abrir, pesquisar, executar, autenticar, montar volumes e alterar firmware consomem ciclos de processamento; a reprodução de áudio e os serviços ativados continuam consumindo enquanto a sessão permanece aberta. O snapshot local guarda o relógio e as condições dos subsistemas, portanto um reboot não desfaz reparos nem falhas.

Cada ciclo aplica a carga dos processos ativos à reserva de energia e à produção dos geradores. O consumo deve ser lento o bastante para permitir investigação, mas persistente o bastante para tornar a manutenção necessária. O sistema não deve matar o jogador por uma única tentativa: a degradação ocorre em camadas, primeiro como perda de redundância, depois como serviços intermitentes, e apenas mais tarde como falha de suporte à vida.

## Modelo de bordo

| Subsistema | Estado observado | Efeito da degradação | Fontes de diagnóstico |
|---|---|---|---|
| Geração elétrica | geradores, saída, saúde, barramento | menor produção, quedas e serviços desativados | `/engineering`, `POWER`, logs de sistema |
| Distribuição | barramentos, relés e cargas | volumes e dispositivos ficam intermitentes | `/system`, `STATUS`, logs de acesso |
| Suporte à vida | scrubbers, ciclo de oxigênio, reserva e previsão | O2 cai e arquivos de telemetria ficam defasados | `/life-support`, `LIFE`, atas e memorandos |
| Rede | integridade e rotas | `USE`, serviços e mounts podem falhar | `/net`, `SEED`, logs de rede |
| Casco | integridade estrutural | sensores e setores tornam-se indisponíveis | `SEED`, `.VIS`, atas de incidente |
| Memória | buffer e swap | processos falham, arquivos chegam incompletos | `FSCK`, logs do kernel e corrupção |

## Geradores e reparos

Os geradores não são um botão global. Cada unidade alimenta um barramento e tem saúde, saída, estado e falhas próprias. Reparar uma unidade exige encontrar o procedimento correto, alcançar o volume de manutenção, satisfazer a autoridade ou usar uma ferramenta pessoal adequada. Uma credencial pode liberar um serviço, mas não substitui o procedimento físico ou o programa que sabe conversar com o controlador.

O comando de reparo altera o estado apenas quando o alvo existe e as dependências estão presentes. O retorno do sistema informa somente o resultado técnico — barramento isolado, controlador sem resposta, checksum restaurado, serviço reativado — e não explica a importância narrativa da operação.

## Avisos silenciosos

Os avisos dinâmicos entram em um buffer técnico. Eles não aparecem como pop-ups nem como mensagens de congratulação. Uma consulta de telemetria pode mostrar que há registros pendentes; a leitura de um log ou a consulta específica do subsistema imprime os eventos em ordem temporal. Assim, o jogador aprende a consultar o sistema e a interpretar suas mudanças, em vez de seguir alertas.

Os eventos usam códigos estáveis, por exemplo `PWR.BUS.02`, `LIFE.O2.DRIFT` e `MEM.SECTOR.03`. O código pode aparecer em um log, em uma resposta de dispositivo e em um documento corporativo diferente. A repetição cruzada constrói a relação entre arquivos sem criar um marcador de pista.

## Navegação operacional

O VFS será ampliado com diretórios que parecem pertencer à nave: `/engineering`, `/power`, `/life-support`, `/system`, `/logs` e `/maintenance`. O jogador chega a eles por `DIR`, `LS`, `TREE`, `CD`, `FIND`, `DOCS`, `CAT` e `OPEN`. Os arquivos pessoais continuam sendo uma fonte possível de ferramentas, senhas e contexto, enquanto os registros corporativos descrevem o mesmo evento com outra voz e outro nível de acesso.

Não haverá uma lista de tarefas. O procedimento emerge da combinação entre nomes de dispositivos, logs, atas, advertências, memorandos, credenciais, programas `.PROC`, flags de BIOS e respostas dos comandos. Os sistemas devem permitir observação, tentativa, falha e recuperação sem transformar a interface em uma camada de explicação.

## Regra de equilíbrio

Toda falha de recurso precisa ter uma cadeia de diagnóstico legível para quem consulta o sistema. Toda reparação deve produzir um efeito persistente verificável por mais de uma fonte. Nenhum estado crítico será resolvido por uma única mensagem ou por um comando sem pré-condições; a nave só muda quando o jogador entende quais componentes, permissões e arquivos formam a operação.
