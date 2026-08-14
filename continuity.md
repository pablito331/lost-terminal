# Lost Terminal — Bíblia de continuidade do Seed OS

## Regra central

Lost Terminal não explica o mundo ao jogador. O mundo aparece como um sistema recuperado: arquivos pessoais, registros corporativos, logs técnicos, permissões, programas, firmware e respostas do shell. Qualquer conclusão precisa poder ser reconstruída a partir de dados que já existem no VFS.

## Manifesto e população

O manifesto contém **600 passageiros** distribuídos em **150 famílias**. Cada passageiro possui uma identidade, cápsula, função, departamento, nacionalidade, língua materna, nível de clearance, estado de saúde, localização e relações familiares. Os registros pessoais preservam a língua materna; a Seed Corp usa `SEED-OPS` nos registros administrativos e técnicos.

| Camada | Função narrativa | Forma de registro |
| --- | --- | --- |
| `PERSONAL` | Memória, intimidade, hábitos, relações, arquivos de trabalho e credenciais salvas | idioma materno do proprietário |
| `CORPORATE` | Manifestos, atas, memorandos, advertências, prontuários administrativos e logs de acesso | `SEED-OPS` |
| `SYSTEM` | Boot, telemetria, firmware, corrupção, rede, cápsulas e processos | `SEED-OPS`, códigos e valores técnicos |

## Linha temporal de referência

Os eventos usam o relógio relativo da nave. `T-06:44:00` ocorre antes de `T-03:12:08`; `T+00:00:00` é o boot observado pelo jogador. A cápsula 601 não pertence ao manifesto oficial de 600 passageiros, mas possui sinais vitais. A documentação corporativa contém versões incompatíveis porque diferentes departamentos registraram, apagaram ou substituíram informações em momentos distintos.

| Janela | Estado documentado |
| --- | --- |
| `T-06:44:00` | A reunião de comando registra que a cápsula 601 não faz parte do manifesto. M. Ilyin discorda. |
| `T-03:18:00` | A ata médica tenta encerrar o caso, embora preserve a existência de sinais vitais. |
| `T-03:12:10` | O canal fantasma transmite uma instrução para não entregar um nome ao ocupante da cápsula. |
| `T-03:12:08` | O prontuário neural é lido em canal privado; a assinatura está incompleta. |
| `T-03:11:51` | O log de permissões registra autoridade de comando removida por processo local não assinado. |
| `T-00:22:00` | O ciclo de oxigênio do Ring 04 aparece pausado e subnotificado na telemetria pública. |
| `T+00:00:00` | O Seed OS monta `/ship` em modo somente leitura, detecta 600 registros e entra em fallback GUEST. |

## Coerência de vozes

Arquivos pessoais não são traduções decorativas. Eles usam vocabulário, ritmo e intimidade próprios de cada personagem e podem registrar o mesmo evento de modo diferente dos documentos corporativos. A diferença entre as versões deve nascer de posição social, acesso, medo, lealdade, idioma, memória incompleta ou tentativa de encobrimento; nunca de uma troca acidental de identidade ou data.

## Firmware e consequências

O shell normal começa em `RUNNING`. BIOS, NVRAM, volumes ocultos, modo diagnóstico e recuperação existem na mesma continuidade documental. Reinicializar pode limpar buffers, alterar a rede, desmontar serviços e mudar quais dispositivos aparecem. O sistema nunca anuncia que uma sequência foi concluída: ele apenas muda o estado técnico e registra os efeitos.

## Validação

`validateSeedContinuity()` verifica população, famílias, cápsulas, idiomas, IDs de autoria e destinatários, caminhos de links, alvos de credenciais, arquivos substituídos e formato de timestamps. Falhas aparecem somente no console de desenvolvimento como `SEED CONTINUITY CHECK`; não são mensagens narrativas para o jogador.
