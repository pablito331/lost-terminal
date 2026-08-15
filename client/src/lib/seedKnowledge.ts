/**
 * Style reminder: knowledge records should feel like recovered ship media,
 * not a curriculum screen. Keep metadata searchable, language-specific and
 * cross-linked to the existing crew, systems and incidents.
 */
import type { CrewMember, FileLanguage, SeedFile, SeedLink } from "./seedData";
import { completeRecoveredBook } from "./seedBookEditorial";

type BookSpec = {
  path: string;
  language: FileLanguage;
  title: string;
  author: string;
  subject: string;
  level: "INTRO" | "CREW" | "OFFICER" | "ROOT";
  chapters: string[];
  references?: string[];
  clearance?: SeedFile["clearance"];
  keywords: string[];
};

function splitForPages(lines: string[], target = 620): string[][] {
  const pages: string[][] = [];
  let page: string[] = [];
  let length = 0;
  const commit = () => { if (page.length) pages.push(page); page = []; length = 0; };
  for (const line of lines) {
    const parts = line.includes("\n") ? line.split("\n") : [line];
    for (const part of parts) {
      const next = part.trim();
      if (!next) continue;
      if (length && length + next.length > target) commit();
      page.push(next);
      length += next.length;
    }
  }
  commit();
  return pages;
}

function makeBookPages(spec: BookSpec, references: string[]) {
  const headings = spec.chapters.filter((entry) => entry.includes("//"));
  const pages: Array<{ number: number; heading: string; lines: string[] }> = [
    { number: 1, heading: "CATALOGUE LEAF // 01", lines: [spec.title, `AUTHOR     : ${spec.author}`, `SUBJECT    : ${spec.subject.toUpperCase()}`, `LANGUAGE   : ${spec.language}`, `CLEARANCE  : ${spec.level}`, "This recovered edition preserves its original instructional order. Metadata and references are searchable; the arguments remain in the language of publication."] },
    { number: 2, heading: "TABLE OF CONTENTS // 02", lines: headings.map((heading, index) => `${String(index + 1).padStart(2, "0")}  ${heading}`) },
  ];
  let currentHeading = "READING NOTES";
  let currentLines: string[] = [];
  const flush = () => {
    if (!currentLines.length) return;
    for (const lines of splitForPages(currentLines)) pages.push({ number: pages.length + 1, heading: currentHeading, lines });
    currentLines = [];
  };
  for (const entry of spec.chapters) {
    if (entry.includes("//")) {
      flush();
      currentHeading = entry;
    } else currentLines.push(entry);
  }
  flush();
  pages.push({ number: pages.length + 1, heading: "EDITORIAL MARGIN", lines: ["This copy was retained because its procedures describe conditions, limits and evidence rather than promising outcomes.", `READING PATH : ${spec.path}`, "Cross-reference the cited VFS records before treating any statement as current ship state."] });
  if (references.length) pages.push({ number: pages.length + 1, heading: "REFERENCES // LINKED VOLUMES", lines: references.map((reference, index) => `${String(index + 1).padStart(2, "0")}  ${reference}`) });
  return pages.map((page, index) => ({ ...page, number: index + 1 }));
}

function file(input: Omit<SeedFile, "directory" | "name"> & { path: string; directory?: string; name?: string }): SeedFile {
  const slash = input.path.lastIndexOf("/");
  return { ...input, directory: slash <= 0 ? "/" : input.path.slice(0, slash), name: input.path.slice(slash + 1) };
}

function book(spec: BookSpec): SeedFile {
  const completeSpec = completeRecoveredBook(spec);
  const references = completeSpec.references ?? [];
  const pages = makeBookPages(completeSpec, references);
  return file({
    path: completeSpec.path,
    extension: ".BOOK",
    kind: "book",
    size: `${Math.max(4, Math.round(pages.flatMap((page) => page.lines).join(" ").length / 15))} KB`,
    updated: "T-18:00:00",
    layer: "SYSTEM",
    language: completeSpec.language,
    summary: `${completeSpec.title} // ${completeSpec.subject} // ${completeSpec.language}`,
    clearance: completeSpec.clearance ?? (completeSpec.level === "INTRO" ? "GUEST" : completeSpec.level),
    payload: { kind: "book", language: completeSpec.language, title: completeSpec.title, author: completeSpec.author, subject: completeSpec.subject, level: completeSpec.level, chapters: completeSpec.chapters, pages, references },
    links: references.map((target, index) => ({ target, label: `REF_${String(index + 1).padStart(2, "0")}`, relation: "referência técnica" })),
    keywords: [...completeSpec.keywords, completeSpec.title, completeSpec.author, completeSpec.subject, completeSpec.language, "book", "library"],
    system: true,
  });
}

function message(input: {
  path: string;
  language: FileLanguage;
  channel: "OFFICIAL" | "GHOST";
  senderId?: string;
  recipientIds: string[];
  sentAt: string;
  body: string[];
  attachments?: string[];
  clearance: SeedFile["clearance"];
  keywords: string[];
}): SeedFile {
  return file({
    path: input.path,
    extension: ".MSG",
    kind: "message",
    size: `${Math.max(1, Math.round(input.body.join(" ").length / 18))} KB`,
    updated: input.sentAt,
    authorId: input.senderId,
    recipientIds: input.recipientIds,
    layer: input.channel === "GHOST" ? "SYSTEM" : "CORPORATE",
    language: input.language,
    summary: `${input.channel} message // ${input.sentAt}`,
    clearance: input.clearance,
    payload: { kind: "message", language: input.language, channel: input.channel, senderId: input.senderId, recipientIds: input.recipientIds, sentAt: input.sentAt, status: "UNREAD", body: input.body, attachments: input.attachments ?? [] },
    links: (input.attachments ?? []).map((target, index) => ({ target, label: `ATTACH_${String(index + 1).padStart(2, "0")}`, relation: "anexo" })),
    keywords: [...input.keywords, "message", input.channel.toLowerCase(), input.language],
    system: input.channel === "OFFICIAL",
  });
}

function publicVideo(path: string, language: FileLanguage, title: string, caption: string, telemetry: string[], links: SeedLink[], keywords: string[]): SeedFile {
  return file({
    path,
    extension: ".VIS",
    kind: "visual",
    size: "24.0 MB",
    updated: "T-21:00:00",
    layer: "CORPORATE",
    language,
    summary: `${title} // public mission video`,
    clearance: "GUEST",
    payload: { kind: "visual", language, caption: title, alt: caption, telemetry, mediaSrc: undefined },
    links,
    keywords: [...keywords, "public", "video", "mission"],
    system: true,
  });
}

export function createKnowledgeFiles(crew: CrewMember[]): SeedFile[] {
  const books: BookSpec[] = [
    { path: "/library/seed-os/fallback-shell.BOOK", language: "pt-BR", title: "Seed OS: Shell de Fallback — Princípios de uma Máquina Incompleta", author: "Seed Systems Education / edição recuperada por A. Velez", subject: "seed-os", level: "INTRO", chapters: [
      "CAPÍTULO 01 // O diretório não é uma tela", "No Seed OS, um diretório é uma afirmação sobre o estado do armazenamento. `/ship` significa que o volume foi montado; `/maintenance` significa que uma porta de firmware foi exposta. Entrar em uma pasta não concede autoridade sobre o que ela contém. A primeira disciplina do operador é separar localização, leitura e escrita.",
      "CAPÍTULO 02 // A sequência de uma leitura", "Antes de abrir um arquivo, observe o caminho, a extensão, a camada, o idioma, a integridade e a autoridade exigida. Um `.REC` não é um `.SCR` com som; sua ausência de transcrição pode ser parte do registro. Um `.PROC` não é confiável só porque termina em executável. O cabeçalho é uma medida de segurança, não decoração.",
      "CAPÍTULO 03 // Quatro portas diferentes", "Montagem coloca um dispositivo no espaço de nomes. Autenticação liga uma conta à sessão. Autoridade define a altura máxima de uma operação. Integridade informa se o payload pode ser lido sem recuperação. Essas portas não se substituem: uma conta OFFICER não corrige um setor corrompido, e um arquivo íntegro não pode ser escrito em um volume ausente.",
      "CAPÍTULO 04 // O sistema registra o que você não viu", "O VFS não é apenas uma coleção de documentos; ele contém horários, terminais, proprietários e referências. Um log de acesso pode confirmar que uma pessoa leu um arquivo que agora está apagado. Uma mensagem não aberta ainda é um estado de entrega, não uma prova de que o destinatário desconhecia o assunto. Leia metadados como quem lê o texto.",
      "CAPÍTULO 05 // Erros não são explicações", "`ACCESS DENIED`, `SOURCE_MISSING` e `INTEGRITY CORRUPTED` descrevem estados. O shell não deve explicar por que uma pessoa escolheu uma senha ou por que um serviço falhou. Para o operador, a resposta correta é registrar o erro, comparar com outra fonte e decidir qual dispositivo pode ser consultado sem destruir informação.",
      "CAPÍTULO 06 // Procedimento mínimo", "Uma investigação operacional segura cabe em seis comandos: `PWD` para fixar o local; `LS` para ver a superfície; `FIND` para localizar referências; `FSCK` para medir integridade; `OPEN` para ler o payload; `SEED` para verificar o efeito sistêmico. A ordem pode ser quebrada, mas a razão da quebra deve aparecer no histórico.",
      "APÊNDICE // Convenções de leitura", "Caminhos são absolutos quando começam em `/`. Extensões são parte do protocolo. Idiomas não são filtros estéticos: eles apontam para a pessoa, o departamento ou o público que produziu o registro. A tradução, quando existir, deve ser uma camada derivada e jamais substituir a fonte materna."], references: ["/BOOT.ATA", "/apps/edit.PROC", "/library/programming/seed-script-field-guide.BOOK"], keywords: ["shell", "filesystem", "permissions", "integrity", "metadata"] },
    { path: "/library/programming/seed-script-field-guide.BOOK", language: "pt-BR", title: "Seed Script: Guia de Campo para Programas Pequenos", author: "A. Velez / Training Node 04", subject: "programming", level: "INTRO", chapters: [
      "CAPÍTULO 01 // Um programa é uma hipótese", "Seed Script não foi criado para conversar com o navegador. Ele foi criado para escrever uma hipótese verificável sobre a nave: ler uma telemetria, comparar um limite e pedir uma operação mediada pelo kernel. Se o programa não consegue explicar o que leu antes de escrever, ele não está pronto para tocar um barramento.",
      "CAPÍTULO 02 // Valores e nomes", "Use `let oxygen = seed(\"oxygen\")` para guardar uma leitura local. O nome não altera o sistema; ele apenas evita que uma segunda instrução leia um valor diferente sem que o operador perceba. Números servem para limites e contagens, textos para caminhos e estados, booleanos para decisões. Não trate `\"14\"` como `14`: uma tela pode exibir o mesmo desenho para valores de tipos diferentes.",
      "EXEMPLO 01 // leitura antes da ação", "let level = seed(\"oxygen\")\nprint(\"O2 BEFORE = \" + level)\nif level < 12:\n  print(\"RESERVE THRESHOLD\")", "O recuo padrão é de dois espaços. O compilador aceita o bloco apenas quando a estrutura fecha no mesmo nível em que abriu. O programa acima não repara nada; ele transforma uma leitura em um registro auditável.",
      "CAPÍTULO 03 // Decisões não são intuição", "Uma condição precisa ser estreita o suficiente para falhar de forma legível. `if network == \"STABLE\":` é diferente de perguntar se a rede não está fragmentada: estados futuros podem existir. Prefira comparar o estado que o sistema documenta e escreva uma saída para o ramo que você ainda não conhece.",
      "CAPÍTULO 04 // Repetição limitada", "`for sample in range(3):` é adequado para três leituras locais ou três linhas de diagnóstico. `while` existe para protocolos curtos, mas cada repetição consome memória e tempo de comando. O Seed OS encerra loops acima do limite antes que se tornem uma forma acidental de espera. Um loop infinito não é persistência; é falha de projeto.",
      "EXEMPLO 02 // diagnóstico do barramento", "for sample in range(3):\n  print(\"BUS SAMPLE \" + sample)\n  calc(\"hex\")", "A função `calc` não abre uma calculadora externa. Ela pede ao kernel uma operação conhecida. APIs de hardware são deliberadamente estreitas: ler `power`, `oxygen`, `network` e `authority` não equivale a possuir permissão de escrita.",
      "CAPÍTULO 05 // Reparar é solicitar, não impor", "`repair(\"GEN-02\")` registra uma intenção e a entrega ao procedimento de manutenção. O kernel ainda verifica BIOS, volume, autoridade, dependências e estado atual. Um programa correto pode receber `repair rejected`; nesse caso, a falha pertence ao ambiente, não deve ser escondida pelo script.",
      "CAPÍTULO 06 // Erros que merecem ficar", "Linha ausente, recuo irregular, identificador inválido, função desconhecida, host binding proibido e loop acima do limite são erros diferentes. Não remova a linha problemática até entender o que ela pretendia fazer. Na IDE, compile antes de instalar; no shell, execute a fonte em uma cópia de trabalho; no VFS, preserve o arquivo original.",
      "EXERCÍCIO DE BORDO // sem solução automática", "Escreva um programa que leia `network` e `oxygen`, produza três linhas de diagnóstico e só solicite `repair(\"SCRUBBER-B\")` quando a rede estiver STABLE. O compilador deve aceitar o código; o kernel pode rejeitar o reparo. Essa diferença é intencional e faz parte da linguagem."], references: ["/apps/ide.PROC", "/apps/calc.PROC", "/library/seed-os/fallback-shell.BOOK", "/library/engineering/repair-paths.BOOK"], keywords: ["logic", "variables", "conditions", "loops", "python", "portugol", "seed script", "repair"] },
    { path: "/library/programming/seed-script-patterns.BOOK", language: "en-US", title: "Seed Script Patterns: Reading Before Writing", author: "Seed Systems Reliability Group", subject: "programming", level: "CREW", chapters: [
      "CHAPTER 01 // The observation boundary", "A script is allowed to observe more of the ship than it is allowed to change. Keep those permissions visible in the source. A diagnostic tool that silently upgrades itself is not a tool; it is an unreviewed process.",
      "CHAPTER 02 // Names carry provenance", "Prefer `o2_before`, `o2_after` and `repair_result` over a single variable called `state`. A maintenance report must allow another operator to reconstruct which value came from telemetry and which value came from a procedure response.",
      "CHAPTER 03 // The narrowest useful API", "Seed APIs are verbs with witnesses: `seed(\"oxygen\")` reads a sensor snapshot, `calc(\"hex\")` transforms a known buffer, and `repair(\"GEN-02\")` asks for a signed procedure. There is no raw device pointer and no ambient browser object.",
      "CHAPTER 04 // A failed branch is still output", "When a condition is false, print the condition that was not satisfied. Do not manufacture a success line after a rejected operation. The shell can tolerate a cautious script; it cannot safely tolerate a dishonest one.",
      "CHAPTER 05 // Versioning a repair", "Store a source program before compiling it. The compiled entrypoint is a derived artifact. If a firmware update changes a dependency, the source tells you what the operator intended and the compile record tells you what the system accepted."], references: ["/apps/ide.PROC", "/library/engineering/repair-paths.BOOK"], keywords: ["seed script", "api", "reliability", "diagnostics", "source"] },
    { path: "/library/navigation/flight-handbook.BOOK", language: "en-US", title: "Flight Navigation Under Fragmented Telemetry", author: "I. Chen / Flight Operations", subject: "navigation", level: "CREW", chapters: [
      "CHAPTER 01 // Dead reckoning is a contract with time", "A vessel can preserve a vector after its public map fails, but only if the measurement time travels with the vector. A position without a timestamp is a shape without a direction. Record the clock source, the bus that supplied it and the uncertainty you could not remove.",
      "CHAPTER 02 // Thermal drift is a conversation between sensors", "One thermal pulse may be noise, a calibration artifact or a real change. The second instrument does not prove the first; it gives the discrepancy a place to live. Compare pulses against power load and life-support cycles before classifying them.",
      "CHAPTER 03 // Authority is local", "Navigation tools may read a bus while remaining unable to write it. A route calculator that can open a flight log is not therefore authorized to alter attitude control. Keep the read path and the command path in separate records.",
      "CHAPTER 04 // Loop 02", "The LOOP-02 trace was initially dismissed because its period did not agree with the public clock. That was the wrong comparison. The useful question was whether the same period appeared in an engineering visual, an access log and a personal diary with independent clocks.",
      "CHAPTER 05 // Handover protocol", "When an operator loses a terminal, leave the next operator a state description, not a conclusion: last valid timestamp, bus, instrument, expected drift, unresolved contradiction and the exact file paths consulted. A handover that says ‘normal’ is less useful than one that says ‘not yet explained’."], references: ["/engineering/loop-02/thermal.VIS", "/personal/passenger-014/diary.SCR", "/comms/ghost/loop-02-handshake.MSG"], keywords: ["flight", "navigation", "thermal", "loop", "timestamp", "dead reckoning"] },
    { path: "/library/biology/xenobiology-notes.BOOK", language: "es-MX", title: "Notas de Xenobiología para Colonias", author: "Sana Okafor / Medical Research", subject: "biology", level: "CREW", chapters: [
      "CAPÍTULO 01 // Respiración y reserva", "Un pronóstico de oxígeno no es una cifra fija: depende del tiempo, del consumo, de la renovación química y de la cantidad de scrubbers realmente activos. Una lectura estable durante un minuto no demuestra que el ciclo esté sano; sólo demuestra que el ciclo no cambió durante ese minuto.",
      "CAPÍTULO 02 // Estasis no es identidad", "La estabilidad criogénica conserva funciones, no necesariamente la historia administrativa de una persona. La firma vital, el registro médico y el manifiesto deben coincidir por caminos separados. Si uno de ellos fue reescrito, el desacuerdo es un dato clínico y de seguridad.",
      "CAPÍTULO 03 // Familias como contexto biológico", "Los patrones familiares ayudan a interpretar alergias, hábitos de sueño y protocolos de emergencia, pero no deben convertirse en una sustitución de diagnóstico. La proximidad de cápsulas no prueba parentesco; el parentesco no prueba consentimiento.",
      "CAPÍTULO 04 // Contaminación de datos", "Un registro puede estar íntegro y aun así contar una historia incompleta. La integridad del archivo responde si sus bytes llegaron completos, no si el autor vio todos los hechos. Compare la fecha del archivo con los ciclos de soporte, la cápsula y los accesos.",
      "CAPÍTULO 05 // Cápsula sin dueño", "Nunca asigne un paciente fuera del manifiesto sólo porque una señal biométrica parece familiar. Aísle el dispositivo, preserve la señal y registre quién solicitó la comparación. La medicina perde sua ética quando transforma uma semelhança em autorização."], references: ["/cryo/capsule-601/neural-link.HLT", "/botany/ring-04/cycle.ATA", "/corporate/passenger-227/biometrics.HLT"], keywords: ["biology", "cryo", "oxygen", "xenobiology", "medical", "capsule"] },
    { path: "/library/medical/cryomedicine.BOOK", language: "fr-FR", title: "Cryomédecine et liens neuronaux", author: "Sana Okafor / Service médical", subject: "medical", level: "OFFICER", chapters: [
      "CHAPITRE 01 // La température n'est pas un nom", "La température est une signature physiologique située dans le temps. Elle peut confirmer qu'un corps était présent dans une capsule; elle ne suffit pas à confirmer l'identité administrative du patient.",
      "CHAPITRE 02 // Tampon neural", "Un tampon neural corrompu peut conserver les constantes, les dernières impulsions et une partie de la signature, tout en perdant le nom. Dans ce cas, l'absence d'identité est une information protégée, pas une invitation à compléter le dossier.",
      "CHAPITRE 03 // Consentement et dérogation", "Toute dérogation médicale doit apparaître dans une ATA, un dossier signé ou une communication attribuable. Une annotation privée peut expliquer une décision, mais ne remplace pas l'autorisation institutionnelle.",
      "CHAPITRE 04 // Capsule 601", "Un patient hors manifeste est à la fois un événement de sécurité et un événement médical. Séparez les deux fils: l'état vital demande une réponse immédiate; l'attribution demande une preuve lente.",
      "CHAPITRE 05 // Lecture de la trace", "Lisez l'en-tête, l'intégrité et la chronologie avant le contenu clinique. Un fichier médical ouvert depuis un terminal non assigné peut être plus important pour la chaîne de garde que le chiffre qu'il contient."], references: ["/corporate/passenger-227/biometrics.HLT", "/ship/operations/incident-601.ATA", "/comms/seed/medical-bulletin-601.MSG"], keywords: ["medicine", "cryogenic", "neural", "capsule", "consent"] },
    { path: "/library/energy/power-bus-maintenance.BOOK", language: "de-DE", title: "Wartung von Generatoren und Energiebussen", author: "Seed Engineering Archive / Revision 7", subject: "power", level: "OFFICER", chapters: [
      "KAPITEL 01 // Zustände sind Lastannahmen", "ONLINE, FAULT und STANDBY sind keine dekorativen Etiketten. Jeder Zustand beschreibt, welche Last der Regler erwartet und welcher nächste Zustand sicher angefordert werden darf. Eine Anzeige darf nie allein als Reparaturbeweis gelten.",
      "KAPITEL 02 // Busse verbinden Fehler", "Ein Bus kann stabil bleiben, obwohl ein Generator ausfällt, solange Reserve und Lastverteilung ausreichen. Umgekehrt kann ein einzelner schlechter Relaiskontakt mehrere Dienste degradieren, ohne dass der Generator selbst als FAULT erscheint.",
      "KAPITEL 03 // Wartung braucht drei Signaturen", "Firmware-Port, Wartungsvolume und ausreichende Berechtigung müssen gemeinsam aktiv sein. Fehlt eine Signatur, verweigert der Kernel die Prozedur. Das ist kein Defekt des Reparaturprogramms, sondern eine Schutzschicht gegen unbeabsichtigtes Schreiben.",
      "KAPITEL 04 // Rückkehr nach der Reparatur", "Nach einer erfolgreichen Wartung muss die Last neu gelesen werden. Prüfen Sie den Generator, den betroffenen Bus und den Dienst, der die Reparatur angefordert hat. Eine grüne Rückmeldung auf dem Controller ersetzt keine Systemmessung.",
      "KAPITEL 05 // Dokumentation der Hand", "Notieren Sie Ziel, Ausgangszustand, Firmwareflags, Volume, Benutzer, Ergebnis und Restfehler. Eine Wartung ohne Restfehler ist selten; eine Wartung ohne Restfehlerbericht ist gefährlich."], references: ["/apps/calc.PROC", "/logs/system/oxygen-drift.ATA", "/library/engineering/repair-paths.BOOK"], keywords: ["power", "generator", "bus", "maintenance", "firmware", "load"] },
    { path: "/library/mathematics/telemetry-math.BOOK", language: "zh-CN", title: "遥测数学与误差传播", author: "Seed Navigation School", subject: "mathematics", level: "INTRO", chapters: [
      "第一章 // 单位与来源", "百分比读数必须保留来源、时间和舍入方式。一个显示为 12.4 的氧气读数可能来自 12.35，也可能来自 12.44；如果没有原始时间和精度，两个数字不能直接比较。", 
      "第二章 // 变化率", "氧气消耗是每个命令之后的状态变化，不是固定的界面标签。计算变化率时，记录命令数量、服务状态和音频进程，因为活动服务会改变系统的消耗模型。", 
      "第三章 // 十六进制", "十六进制适合显示缓冲区、校验和与硬件地址。它不是一种加密方法。把十六进制转换为十进制可以帮助阅读记录，但不能证明记录没有被修改。", 
      "第四章 // 误差传播", "重复的误差可能是信号，也可能是同一段损坏被重复读取。将读数分为测量误差、格式误差和状态误差，然后寻找可以独立验证的第二个来源。", 
      "第五章 // 舍入不是修复", "显示层的舍入只改变文字，不改变运行时状态。一个系统可以正确保存更多精度，同时以一位小数显示给操作员。不要用界面上的最后一位反推不存在的硬件精度。"], references: ["/apps/calc.PROC", "/seed/telemetry.SCR", "/library/seed-os/fallback-shell.BOOK"], keywords: ["math", "telemetry", "hex", "oxygen", "rounding", "error"] },
    { path: "/library/communications/seed-messaging.BOOK", language: "ja-JP", title: "Seed通信プロトコル", author: "Seed Network Operations / Archive Desk", subject: "communications", level: "CREW", chapters: [
      "第01章 // 公式チャンネル", "公式メッセージには送信者、受信者、時刻、署名の状態が残る。配信されたことと、読まれたことは別の状態である。未読のまま睡眠サイクルを越えたメッセージは、受信者の意図を証明しない。", 
      "第02章 // 返信の順序", "返信は元のメッセージを置き換えない。元の宛先、配信時刻、添付ファイルを保存し、返信側に新しい時刻を付ける。順序を失うと、沈黙と拒否を区別できなくなる。", 
      "第03章 // 断片化したネットワーク", "見えないチャンネルが存在しないとは限らない。しかし、観測できないパケットを事実として扱ってはならない。信号、署名、受信端末の三つを別々に記録する。", 
      "第04章 // Ghost Bus", "非公式なパケットは観測者の身元を残す可能性がある。Sniff ツールは会話の意味を保証しない; それは通過したデータの形、時間、経路を示すだけである。", 
      "第05章 // 公開映像", "公開映像は全員に届くため単純に見えるが、字幕、音声、配信遅延、未読状態も記録の一部である。ニュースの画像と公式メッセージの本文が一致しない場合、どちらかを即座に偽造と判断してはいけない。"], references: ["/apps/msg.PROC", "/apps/sniff.PROC", "/comms/ghost/loop-02-handshake.MSG"], keywords: ["message", "network", "ghost", "protocol", "unread", "broadcast"] },
    { path: "/library/mission/seed-corporate-history.BOOK", language: "ar-EG", title: "تاريخ بعثة Seed المؤسسي", author: "Seed Corp Archive / Public Edition", subject: "mission-history", level: "INTRO", chapters: [
      "الفصل 01 // الشركة", "بدأت Seed كمشروع نقل طويل المدى، ثم أصبحت أرشيفاً متنقلاً للمعرفة. لم تكن السفينة مخزناً للآلات فقط؛ كانت تحمل طرق الكلام والعمل والتذكر الخاصة بستمائة شخص.",
      "الفصل 02 // النوم الجماعي", "جعل النوم الجماعي الرسائل العامة أكثر أهمية من الذاكرة الشخصية. لكن الرسالة المؤجلة لا تصبح حقيقة لمجرد أنها رسمية، والرسالة الشخصية لا تصبح كاذبة لمجرد أنها لم تمر عبر القناة الرسمية.",
      "الفصل 03 // السكان", "المسافرون ليسوا أرقاماً فقط. الملفات الشخصية تحمل لغات وعلاقات ومهناً لا تظهر كاملة في التقرير المركزي. لذلك يجب قراءة السجل المؤسسي إلى جانب السجل الشخصي، مع احترام الفرق بينهما.",
      "الفصل 04 // الاستمرارية", "كل سجل رسمي هو نسخة من الحدث، وليس الحدث نفسه. النسخ المتعددة لا تعني أن الحقيقة واحدة في كل مرة؛ تعني أن الحدث ترك آثاراً يمكن مقارنتها.",
      "الفصل 05 // ما لا يظهر في الإعلان", "الخبر العام يشرح ما تستطيع الشركة نشره. الملفات التشغيلية تشرح ما احتاجت الشركة إلى فعله. الفارق بين النصين هو مكان طبيعي للبحث، وليس دليلاً تلقائياً على الخيانة."], references: ["/seed/manifest.SCR", "/comms/seed/mission-brief-001.MSG", "/media/public/mission-overview.VIS"], keywords: ["mission", "history", "seed corp", "colonists", "public"] },
    { path: "/library/engineering/repair-paths.BOOK", language: "en-US", title: "Repair Paths and Service Signatures", author: "Seed Engineering Board", subject: "repair", level: "OFFICER", chapters: [
      "CHAPTER 01 // Diagnose before writing", "A repair script must read the service state before changing it. A command that works once may be unsafe if it does not establish which device it touched, which firmware gate was open and which downstream service was already degraded.",
      "CHAPTER 02 // Signatures", "The kernel accepts a service only when target, firmware, volume and authority agree. Credentials can satisfy a local dependency without becoming a general right to write. Keep those two facts visible in the output.",
      "CHAPTER 03 // Replacement is not disappearance", "A replacement program may be safer than a direct repair, but it must declare its dependency and preserve the failed component's identity. Removing a fault from the display without preserving its record turns maintenance into data loss.",
      "CHAPTER 04 // Failure chains", "Power, life support and network form a coupled system. Repairing GEN-02 can alter bus load; repairing a scrubber can change oxygen drift; starting an untested service can consume the reserve that made the repair possible. Read the system after each state change.",
      "CHAPTER 05 // The smallest safe program", "A useful first program prints the current state, validates one precondition and exits. Only after that program behaves correctly should it call a mediated repair. Complexity is not evidence of competence; traceability is."], references: ["/apps/ide.PROC", "/apps/backdoor_exploit.PROC", "/engineering/loop-02/thermal.VIS", "/library/programming/seed-script-field-guide.BOOK"], keywords: ["repair", "service", "signature", "firmware", "failure chain"] },
    { path: "/library/biology/hydroponic-life.BOOK", language: "pt-BR", title: "Biologia de Suporte e Ciclos Hidropônicos", author: "N. Baptiste / Botany Ring 04", subject: "biology", level: "CREW", chapters: [
      "CAPÍTULO 01 // Plantas são sensores lentos", "O ciclo de uma planta registra variações que os sensores rápidos descartam como ruído. Uma mudança na folha aparece antes da falha aguda, mas depois que a causa já começou. O diário botânico precisa carregar datas, iluminação, fluxo de água e estado do scrubber.",
      "CAPÍTULO 02 // O anel 04", "O anel hidropônico não é um reservatório de oxigênio de emergência. Ele é um ecossistema que respira, cresce, sofre e devolve sinais ao sistema. A diferença entre uma previsão de suporte e uma promessa de salvação deve aparecer em toda ata de manutenção.",
      "CAPÍTULO 03 // Ciclos acoplados", "Luz, água, energia e temperatura compartilham barramentos. Um ciclo de crescimento pode continuar durante uma queda de energia, mas a previsão mudará. Nunca use uma leitura biológica para encobrir uma falha elétrica.",
      "CAPÍTULO 04 // A ferramenta pessoal", "Ferramentas criadas por tripulantes podem conter procedimentos mais específicos que o app oficial. Isso não as torna seguras. Leia o código, identifique a assinatura de serviço e confirme em qual volume o programa pretende escrever.",
      "CAPÍTULO 05 // Relógio vivo", "O crescimento é uma fonte de tempo que não depende do relógio central. Quando os relógios divergem, o anel oferece uma sequência observável: irrigação, luz, abertura, fechamento e alteração de biomassa. Uma sequência não resolve a causa, mas pode limitar quando ela ocorreu."], references: ["/personal/passenger-600/seed-tool.PROC", "/botany/ring-04/cycle.ATA", "/library/energy/power-bus-maintenance.BOOK"], keywords: ["hydroponics", "plants", "botany", "life support", "cycles"] },
    { path: "/library/operations/crew-handbook.BOOK", language: "es-MX", title: "Manual de Operaciones para Personal Despierto", author: "Seed Corp / Pre-sleep Revision", subject: "operations", level: "CREW", chapters: [
      "SECCIÓN 01 // Primer contacto", "Después de un reinicio, confirme identidad, hora de arranque, volúmenes montados y estado de soporte de vida. No restablezca servicios automáticamente: una nave degradada puede estar sosteniendo un equilibrio frágil.",
      "SECCIÓN 02 // Entrega de turno", "Una entrega útil contiene hechos observables, comandos ejecutados, rutas consultadas y operaciones rechazadas. No use palabras como ‘resuelto’ sin indicar qué lectura cambió y qué lectura permaneció fuera de rango.",
      "SECCIÓN 03 // Mensajes sin respuesta", "Una cola de mensajes no es un canal de control. La persona que envió un aviso puede haber perdido el terminal, cambiado de autoridad o escrito bajo una hipótesis que luego fue corregida. Conserve la revisión original.",
      "SECCIÓN 04 // Registro de excepciones", "Toda desviación de un procedimiento estándar necesita un motivo local y una autoridad verificable. Si el motivo no puede escribirse sin revelar información protegida, registre al menos la clase de excepción, la hora y el supervisor que la autorizó."], references: ["/BOOT.ATA", "/comms/seed/arrival-window-closed.MSG", "/library/seed-os/fallback-shell.BOOK"], keywords: ["operations", "handover", "messages", "exceptions", "crew"] },
    { path: "/library/communications/manuel-de-controle-des-messages.BOOK", language: "fr-FR", title: "Manuel de contrôle des messages et des preuves", author: "Seed Corp / Bureau des transmissions", subject: "communications", level: "CREW", chapters: [
      "CHAPITRE 01 // Une livraison n'est pas une lecture", "Le serveur peut enregistrer la remise d'un message sans enregistrer sa lecture. Dans un système en sommeil, cette différence est essentielle: une file publique peut être intacte alors que le destinataire n'a jamais vu son contenu. Conservez toujours l'heure de livraison, l'état et le terminal de consultation.",
      "CHAPITRE 02 // Répondre par le bon canal", "Le canal officiel porte une signature, une politique de conservation et des destinataires vérifiables. Un canal non enregistré peut être plus rapide, mais il ne possède pas la même chaîne de preuve. Ne mélangez pas les deux dans un rapport: indiquez le canal, la source et le niveau de confiance.",
      "CHAPITRE 03 // Pièces jointes et silence", "Une pièce jointe n'est pas une preuve indépendante. Un message peut nommer un fichier qui a été remplacé, chiffré ou rendu illisible après l'envoi. L'absence d'ouverture d'une vidéo ne signifie pas l'absence de la vidéo; cela signifie seulement qu'aucun terminal n'a confirmé sa lecture.",
      "CHAPITRE 04 // Le message qui manque", "Lorsqu'une séquence contient 01, 02 et 04, ne fabriquez pas le troisième message. Cherchez l'index, les journaux d'accès, la file du terminal et les copies locales. Une lacune documentée possède plus de valeur qu'un texte complété par intuition."], references: ["/comms/seed/mission-brief-001.MSG", "/comms/ghost/loop-02-handshake.MSG", "/library/seed-os/fallback-shell.BOOK"], keywords: ["messages", "delivery", "evidence", "official", "ghost", "communications"] },
    { path: "/library/maintenance/handbuch-sichere-reparatur.BOOK", language: "de-DE", title: "Handbuch der sicheren Reparatur und Übergabe", author: "Seed Engineering / Instandhaltungsschule", subject: "repair", level: "CREW", chapters: [
      "KAPITEL 01 // Erst lesen, dann schreiben", "Eine Reparatur beginnt mit einer Messung, nicht mit dem Befehl. Lesen Sie Energie, Sauerstoff, Buszustand, Firmware und Integrität des Zielmoduls. Ein akzeptierter Schreibvorgang kann einen falschen Zustand stabilisieren, wenn die Eingangsdaten nicht geprüft wurden.",
      "KAPITEL 02 // Abhängigkeiten sind Teil des Geräts", "Ein Generator ist nicht nur sein Controller. Er hängt an einem Bus, einer Firmware-Freigabe, einer Wartungsschnittstelle und manchmal an einem Dienstkonto. Wenn eine Voraussetzung fehlt, ist die Ablehnung kein Fehler des Protokolls, sondern ein Schutz gegen unvollständige Arbeit.",
      "KAPITEL 03 // Übergabe ohne Urteil", "Dokumentieren Sie letzten gültigen Zeitstempel, Messquelle, Ziel, erwartete Änderung und ungeklärte Abweichung. Schreiben Sie nicht ‘behoben’, wenn nur ein einzelner Wert zurückgekehrt ist. Der nächste Operator muss erkennen können, welche Aussage gemessen und welche nur erwartet wurde.",
      "KAPITEL 04 // Programme als Werkzeuge", "Ein Seed-Script kann eine Reparatur anfordern, aber keine Autorität erfinden. Prüfen Sie den Quelltext, kompilieren Sie das Artefakt und führen Sie es erst aus, wenn Volumen, BIOS und Konto sichtbar zusammenpassen. Bewahren Sie Quelle und Ergebnis getrennt auf."], references: ["/library/programming/seed-script-field-guide.BOOK", "/library/engineering/repair-paths.BOOK", "/ship/operations/incident-601.ATA"], keywords: ["reparatur", "maintenance", "firmware", "handover", "sicherheit", "seed script"] },
  ];

  const alma = crew.find((member) => member.id === "passenger-001");
  const ivo = crew.find((member) => member.id === "passenger-014");
  const sana = crew.find((member) => member.id === "passenger-227");
  const mara = crew.find((member) => member.id === "passenger-344");
  const official = [
    message({ path: "/comms/seed/mission-brief-001.MSG", language: "en-US", channel: "OFFICIAL", senderId: alma?.id, recipientIds: ["ALL_SLEEPERS"], sentAt: "T-62:00:00", body: ["SEED CORP // MISSION BRIEF", "The colony vessel is a library with engines. Every passenger carries a language, a trade and a version of the future.", "PUBLIC DELIVERY: queue until awakening window."], attachments: ["/media/public/mission-overview.VIS"], clearance: "GUEST", keywords: ["mission", "public", "awakening"] }),
    message({ path: "/comms/seed/arrival-window-closed.MSG", language: "es-MX", channel: "OFFICIAL", senderId: alma?.id, recipientIds: ["ALL_SLEEPERS"], sentAt: "T-03:00:00", body: ["SEED CORP // AVISO DE ARRIBO", "La ventana de llegada fue cerrada. Los mensajes públicos permanecen en cola hasta que el sistema confirme soporte de vida.", "ESTADO: NO LEÍDO POR LA MAYORÍA DE LOS DURMIENTES."], attachments: ["/seed/manifest.SCR"], clearance: "GUEST", keywords: ["arrival", "public", "cryo"] }),
    message({ path: "/comms/seed/medical-bulletin-601.MSG", language: "fr-FR", channel: "OFFICIAL", senderId: sana?.id, recipientIds: ["MEDICAL", "COMMAND"], sentAt: "T-03:12:08", body: ["BULLETIN MÉDICAL // DOSSIER 601", "Une signature vitale est présente sans identité correspondante dans le manifeste.", "Aucune ouverture automatique. Toute décision doit être enregistrée dans une ATA."], attachments: ["/cryo/capsule-601/neural-link.HLT", "/ship/operations/incident-601.ATA"], clearance: "CREW", keywords: ["medical", "601", "bulletin"] }),
  ];
  const ghost = [
    message({ path: "/comms/ghost/loop-02-handshake.MSG", language: "SEED-OPS", channel: "GHOST", senderId: ivo?.id, recipientIds: [mara?.id ?? "passenger-344"], sentAt: "T-03:10:44", body: ["UNREGISTERED CHANNEL // LOOP_02", "Do not answer through the official queue. The thermal pulse is carrying a second clock.", "If the passenger wakes, the first useful program will not be in /apps."], attachments: ["/personal/passenger-014/seed-tool.PROC", "/engineering/loop-02/thermal.VIS"], clearance: "OFFICER", keywords: ["loop 02", "handshake", "unofficial", "ghost"] }),
    message({ path: "/comms/ghost/no-identity.MSG", language: "SEED-OPS", channel: "GHOST", senderId: mara?.id, recipientIds: [ivo?.id ?? "passenger-014"], sentAt: "T-03:12:11", body: ["GHOST BUS // NO RECEIPT", "The identity buffer was not erased by a medical process.", "Someone asked the system to make the missing person look like a blank space."], attachments: ["/apps/backdoor_exploit.PROC", "/cryo/capsule-601/neural-link.HLT"], clearance: "OFFICER", keywords: ["identity", "memory wipe", "unofficial", "ghost"] }),
  ];
  const videos = [
    publicVideo("/media/public/mission-overview.VIS", "en-US", "SEED CORP // MISSION OVERVIEW", "Public briefing: the colony vessel and its destination before the sleep cycle.", ["DURATION : 07:14", "SUBTITLES: EN-US / PT-BR / ES-MX", "DELIVERY : PUBLIC QUEUE", "STATUS   : UNOPENED"], [{ target: "/seed/manifest.SCR", label: "MANIFEST", relation: "mission population" }, { target: "/comms/seed/mission-brief-001.MSG", label: "BRIEF", relation: "delivery record" }], ["mission", "overview", "colony"]),
    publicVideo("/media/public/news-archive-17.VIS", "pt-BR", "SEED NEWS // ARCHIVE 17", "Noticiário público preservado antes do adormecimento criogênico coletivo.", ["DURATION : 02:31", "ANCHOR   : L. MENDES", "AUDIO    : PRESENT", "STATUS   : UNOPENED"], [{ target: "/comms/seed/arrival-window-closed.MSG", label: "ARRIVAL", relation: "same broadcast window" }], ["news", "public", "arrival"]),
  ];
  const libraryGuide = file({
    path: "/library/README.SCR",
    extension: ".SCR",
    kind: "text",
    size: "2.8 KB",
    updated: "T-18:00:00",
    layer: "SYSTEM",
    language: "SEED-OPS",
    summary: "Terminal Library Orientation // catalogue, reading protocol and cross-reference rules.",
    clearance: "GUEST",
    payload: {
      kind: "text",
      language: "SEED-OPS",
      lines: [
        "SEED OS // TERMINAL LIBRARY ORIENTATION",
        "LOCATION  : /library",
        "CATALOGUE : LIBRARY [term]",
        "BROWSE    : LS /library  |  TREE /library  |  FIND .BOOK",
        "READ      : BOOK <path> [page]",
        "",
        "This library was retained as a distributed collection rather than a curriculum. Books are filed by subject, language and clearance; no volume is marked as required for a current emergency.",
        "",
        "A .BOOK opens on its catalogue leaf. Page 02 contains its table of contents. Use a page number to continue reading without printing the entire volume into the active terminal buffer.",
        "",
        "Technical books describe observations, prerequisites and procedures. They may conflict with later logs, firmware state or local conditions. Read the cited records before using a command as if it were current.",
        "",
        "LANGUAGES : PT-BR / ES-MX / EN-US / FR-FR / DE-DE / JA-JP / ZH-CN / AR-EG",
        "SHELVES   : seed-os / programming / engineering / life-sciences / navigation / mathematics / communications / culture / maintenance",
      ],
    },
    links: [
      { target: "/library/seed-os/fallback-shell.BOOK", label: "FALLBACK_SHELL", relation: "introductory system volume" },
      { target: "/library/programming/seed-script-field-guide.BOOK", label: "SEED_SCRIPT", relation: "programmable systems volume" },
      { target: "/library/engineering/repair-paths.BOOK", label: "REPAIR_PATHS", relation: "maintenance reference" },
    ],
    keywords: ["library", "catalogue", "books", "read", "pages", "seed os", "orientation"],
    system: true,
  });
  return [libraryGuide, ...books.map(book), ...official, ...ghost, ...videos];
}
