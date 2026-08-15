# Validação de fonte musical remota

Fonte fornecida: https://suno.com/playlist/1f6ff908-78b0-44e2-ac1a-d89cbe9438f1

Em 15/08/2026, a página pública carregou sem login e identificou a playlist `new future`, do perfil `Pablo Guimarães`, com 3 músicas e duração total exibida de 4:42. A listagem mostrou `Labirinto Neon` e duas entradas `Demolição Lunar`; a primeira faixa expôs duração e a página própria carregou um controle público `Play`, enquanto as duas entradas da playlist exibiram `--:--` na listagem.

A faixa `Labirinto Neon` abriu em https://suno.com/song/9e5fe9e1-50e4-4623-8ffc-d8ec6c3a81c4, com título, autor, tags `experimental electronic`, `glitch`, `IDM`, indicação instrumental, data e controle público de reprodução. Após acionar o controle, o player do Suno mudou para estado de pausa/reprodução e exibiu a barra inferior com duração `4:42`, confirmando reprodução pública na sessão de teste.

Conclusão técnica: a fonte é adequada para um protótipo de playlist remota diegética, armazenando no VFS apenas manifesto, URL pública, título, autor e identificadores das faixas. Não tratar a URL como arquivo local nem baixar/reempacotar o áudio. O protótipo deve tolerar falha de origem, mudança de disponibilidade, autoplay bloqueado e faixas sem duração carregada.
