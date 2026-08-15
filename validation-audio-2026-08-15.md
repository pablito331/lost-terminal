# Validação manual de `playlist.MUS`

Data: 2026-08-15.

A sessão do Seed OS concluiu o boot e chegou ao fallback shell com 600 passageiros, `O2: 10.5%` e `I.CHEN / RUNNING SHELL`. O arquivo `/personal/passenger-014/saved-passwords.SCR` revelou o serviço `LOOP_02`, usuário `I.CHEN` e segredo `TIDAL-04`.

O comando `AUTH I.CHEN` sem chave foi rejeitado corretamente como tentativa `1/4`. Em seguida, `AUTH I.CHEN TIDAL-04` foi aceito com `clearance :: OFFICER`. O comando relativo `PLAY playlist.MUS` não resolveu o manifesto a partir de `/engineering/loop-02`, retornando `MUS container not found`; o caminho absoluto funcionou:

```text
PLAY /personal/passenger-014/playlist.MUS
AUDIO OPEN :: /personal/passenger-014/playlist.MUS
DEVICE      :: /dev/audio0
CONTAINER   :: SEED-REMOTE/1
PLAYBACK    :: DIRECT CHANNEL / PRIVATE CHANNEL
```

A abertura do `player.PROC` também foi aceita e exibiu o contrato diegético `PLAY PAUSE RESUME STOP AUDIO`, com origem `proprietary .MUS container` e nota de que a reprodução exige gesto do usuário.

A inspeção do elemento nativo confirmou que a mídia foi carregada (`readyState: 4`, `duration: 282.04`, `networkState: 1`, origem HTTPS presente, sem iframe ou controles externos), mas permaneceu `paused: true` e `currentTime: 0`. Portanto, o fluxo de resolução, autorização e carregamento está validado; a emissão audível não foi confirmada porque a sessão de preview exige um gesto direto no controle nativo que não é exposto pelo painel diegético atual.

Conclusão: manter a validação de áudio como pendência manual específica. Não há evidência de vazamento visual de metadados externos nem de carregamento de player externo.
