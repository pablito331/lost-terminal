# Seed OS // Lost Terminal

> Uma simulação diegética de investigação em uma nave interplanetária à deriva. A interface não explica o que fazer: o operador aprende o sistema lendo arquivos, observando estados e conectando evidências.

[![CI](https://github.com/pablito331/lost-terminal/actions/workflows/ci.yml/badge.svg)](https://github.com/pablito331/lost-terminal/actions/workflows/ci.yml)
[![Deploy](https://github.com/pablito331/lost-terminal/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/pablito331/lost-terminal/actions/workflows/deploy-pages.yml)

## Acesso

- **GitHub Pages:** `https://pablito331.github.io/lost-terminal/`
- **Repositório:** <https://github.com/pablito331/lost-terminal>
- **Manual operacional:** [`manual-do-jogador.md`](./manual-do-jogador.md)
- **Bíblia de continuidade:** [`continuity.md`](./continuity.md)
- **Arquitetura e sistemas:** [`ship-systems.md`](./ship-systems.md)

## Conceito

Você acorda em uma cápsula de criogenia a bordo de uma nave sem trajetória confiável. O Neural-Link está corrompido, o suporte à vida está em estado crítico e o Seed OS inicia em modo `GUEST / FALLBACK SHELL`.

Não há inventário externo, árvore de objetivos ou tutorial pop-up. O sistema é o próprio espaço de investigação: arquivos pessoais, registros corporativos, mensagens, prontuários, mídias, programas e falhas de infraestrutura formam uma rede de evidências que precisa ser interpretada pelo operador.

## Princípios de experiência

- **Diegese estrita:** não usa linguagem de jogo dentro do sistema.
- **Terminal como autoridade:** comandos e instrumentos gráficos acessam o mesmo VFS e as mesmas permissões.
- **Descoberta contextual:** credenciais, relações, idiomas, famílias e procedimentos aparecem nos próprios arquivos.
- **Falhas com causa:** corrupção, bloqueios e contradições são registrados como versões, apagamentos, permissões ou interesses humanos.
- **Persistência local:** o snapshot da sessão fica no IndexedDB do navegador, com fallback mínimo em `localStorage`.
- **Mídia mascarada:** áudio, visual e gravações são apresentados por extensões proprietárias do Seed OS, sem expor o formato ou o player de origem.

## Superfícies do Seed OS

| Superfície | Função |
| --- | --- |
| Shell | Canal principal de comandos, navegação e diagnóstico |
| Evidence Mesh | Leitura espacial de relações, evidências e conexões do VFS |
| Connection Lens | Inspeção contextual de `.VIS` e `.REC` |
| App rail | Acesso a aplicações `.PROC` instaladas ou em execução |
| BIOS / NVRAM | Estados de boot, firmware, montagem e permissões avançadas |
| Instrument rail | Telemetria, suporte à vida, energia e áudio nativo |

## Extensões proprietárias

| Extensão | Camada do Seed OS |
| --- | --- |
| `.SCR` | Scriptum: diários, mensagens e documentos |
| `.REC` | Recording: voz, interceptações e logs sonoros |
| `.VIS` | Visual: imagens, transmissões e estruturas visuais |
| `.HLT` | Health: prontuários e históricos biométricos |
| `.ATA` | Atas: ocorrências, reuniões e registros oficiais |
| `.MUS` | Música: faixas e playlists mascaradas |
| `.BOOK` | Biblioteca: livros técnicos, científicos e históricos |
| `.PROC` | Processos: utilitários, jogos diegéticos e aplicações executáveis |

## Comandos centrais

O sistema mistura sintaxe Linux, DOS e comandos nativos do Seed OS. A referência completa está em [`manual-do-jogador.md`](./manual-do-jogador.md).

```text
LS / DIR          lista o diretório atual
CD <caminho>      navega pelo VFS
CAT <arquivo>     lê um arquivo usando sua extensão
OPEN <arquivo>    abre a lente ou instrumento apropriado
TREE              explora a estrutura de diretórios
FIND <filtro>     localiza evidências e relações
SEED              exibe telemetria crítica
PS / KILL         inspeciona e encerra processos
RUN <arquivo>     executa um .PROC compatível
SUDO <comando>    solicita autoridade elevada
REBOOT            reinicia o sistema
```

## Arquitetura técnica

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- Wouter para roteamento leve
- Vitest para testes unitários e auditorias determinísticas
- IndexedDB para snapshots de sessão
- Web Audio API para o pipeline nativo de `.MUS`
- GitHub Actions + GitHub Pages para publicação estática

O frontend é uma aplicação estática. O diretório `server/` contém apenas compatibilidade com o template e não é necessário para o deploy no GitHub Pages.

## Desenvolvimento local

Requisitos: Node.js 20+ e pnpm 10+.

```bash
pnpm install
pnpm dev
```

O terminal de desenvolvimento fica disponível em `http://localhost:3000`.

### Validação

```bash
pnpm check
pnpm test
pnpm run audit:ecosystem
pnpm run audit:coherence
pnpm run audit:commands
pnpm build
```

Para gerar exatamente o artefato usado no Pages:

```bash
pnpm run build:pages
```

O resultado é escrito em `dist/public/`.

## Publicação no GitHub Pages

O workflow [`deploy-pages.yml`](./.github/workflows/deploy-pages.yml) executa automaticamente em cada push para `main`:

1. instala as dependências com `pnpm --frozen-lockfile`;
2. executa check, testes e auditorias;
3. compila o Vite com `VITE_BASE_PATH=/lost-terminal/`;
4. publica `dist/public` usando a integração oficial do GitHub Pages.

No repositório, mantenha **Settings → Pages → Source** configurado como **GitHub Actions**. O workflow define o `base path` do projeto para que scripts, estilos e fontes funcionem em `https://pablito331.github.io/lost-terminal/`.

## Estrutura relevante

```text
client/
  index.html              entrada HTML do Seed OS
  public/                 arquivos estáticos pequenos
  src/
    pages/Home.tsx        runtime do terminal e Evidence Mesh
    lib/                  VFS, áudio, processos, auditorias e persistência
    index.css             identidade visual CRT e tokens
scripts/                  auditorias determinísticas
manual-do-jogador.md      referência operacional diegética
continuity.md             cronologia e vínculos narrativos
ship-systems.md           sistemas físicos e suporte à vida
.github/workflows/        CI e publicação no GitHub Pages
```

## Estado do projeto

O núcleo do Seed OS está funcional e validado com testes, auditorias de coerência, persistência local, processos `.PROC`, biblioteca `.BOOK`, tradução contextual, lentes `.VIS`/`.REC` e player nativo `.MUS` sem iframe ou player externo.

O projeto continua sendo expandido como um ecossistema investigativo: novos arquivos, passageiros, contradições intencionais, programas, mídias e caminhos de manutenção podem ser incorporados sem alterar a regra central de que o sistema nunca explica sua própria ficção.

## Licença

Este repositório está marcado como MIT enquanto o conteúdo narrativo e os assets proprietários da Seed Corp permanecem sujeitos às decisões do projeto.
