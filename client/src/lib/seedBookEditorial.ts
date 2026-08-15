/**
 * Editorial reminder: preserved books are operational artifacts. This layer
 * expands recovered short editions without changing their source language,
 * clearance, VFS references, or diegetic boundaries.
 */
import type { FileLanguage } from "./seedData";

type EditorialBook = {
  path: string;
  language: FileLanguage;
  chapters: string[];
  references?: string[];
};

type Plan = {
  scope: string;
  evidence: string;
  procedure: string;
  caseStudy: string;
  exercise: string;
  glossary: string;
};

const plans: Record<string, Plan> = {
  "/library/seed-os/fallback-shell.BOOK": {
    scope: "o VFS como espaço de nomes, e não como coleção de telas",
    evidence: "caminho absoluto, extensão, camada, clearance, idioma, integridade e horário de atualização",
    procedure: "fixar o diretório com PWD, listar com LS, consultar metadados, medir a integridade com FSCK e só então abrir o payload",
    caseStudy: "um relatório aparece em /maintenance após uma montagem de firmware: o caminho confirma o volume, mas não concede escrita nem prova que o conteúdo esteja íntegro",
    exercise: "registre seis comandos que comparem um .ATA, uma .MSG e um documento pessoal sem alterar nenhum deles; indique o que cada passo permite e o que ele não permite concluir",
    glossary: "espaço de nomes: mapa de caminhos visíveis; montagem: exposição de um volume; clearance: teto de autoridade; integridade: condição dos bytes, não verdade do relato",
  },
  "/library/programming/seed-script-field-guide.BOOK": {
    scope: "programas pequenos como hipóteses auditáveis sobre telemetria e procedimentos mediados",
    evidence: "valores de seed(), saída de print(), diagnóstico de compilação, resposta do kernel e leitura posterior",
    procedure: "dar nomes com proveniência, ler antes de decidir, compilar a fonte, executar uma cópia de trabalho e preservar o resultado no histórico",
    caseStudy: "um script pede repair(\"SCRUBBER-B\") depois de ler a rede; a sintaxe é aceita, mas o kernel pode rejeitar o pedido por depender do estado real da nave",
    exercise: "escreva uma rotina que leia oxygen e network três vezes, imprima cada amostra com rótulo inequívoco e nunca solicite reparo se network não for STABLE",
    glossary: "fonte: texto editável; artefato compilado: resultado derivado; API mediada: função que pede ação ao kernel; proveniência: origem explícita de um valor",
  },
  "/library/programming/seed-script-patterns.BOOK": {
    scope: "reliability patterns for programs read by a later operator",
    evidence: "named snapshots, compiler diagnostics, printed branch decisions, kernel responses and the source revision that produced them",
    procedure: "separate observation from request, preserve before-and-after names, emit a line for a rejected branch, and retain source before installing a derived program",
    caseStudy: "a diagnostic records o2_before and o2_after around a maintenance request; their disagreement is evidence, not a reason to overwrite the earlier value",
    exercise: "draft a four-step power-and-network diagnostic with a visible no-action branch; mark which line observes, decides and requests",
    glossary: "observation boundary: limit between reading and changing; provenance: origin of a value; derived artifact: compiled result; witness: record that reconstructs a claim",
  },
  "/library/navigation/flight-handbook.BOOK": {
    scope: "navigation under incomplete clocks, partial vectors and telemetry that may not share a timebase",
    evidence: "timestamp source, contributing bus, instrument identity, uncertainty estimate, power context and an independently dated corroborating record",
    procedure: "freeze the last valid vector, record source and age, compare rather than average conflicting instruments, and hand over contradictions with their file paths",
    caseStudy: "a thermal pulse recurs in a visual trace and a personal note but not on the public clock; the useful result is a bounded discrepancy record, not a route correction",
    exercise: "prepare a handover for a vector with one missing timestamp: state what can be propagated, what stays uncertain, and which two VFS records should be compared first",
    glossary: "dead reckoning: propagation from a known state; timebase: clock of a source; drift: measured departure from expectation; uncertainty: bounded range, not absence of knowledge",
  },
  "/library/biology/xenobiology-notes.BOOK": {
    scope: "la observación biológica sin confundir una señal vital con una identidad o autorización",
    evidence: "constantes fechadas, origen del sensor, manifiesto, expediente clínico, ciclos de soporte vital y cadena de custodia",
    procedure: "aislar la lectura, registrar tiempo y dispositivo, comparar fuentes por separado y escalar una discrepancia sin reescribir el expediente",
    caseStudy: "una firma parcial parece semejante a la de una persona del manifiesto; el protocolo conserva la comparación como hipótesis y mantiene la cápsula fuera de una asignación administrativa",
    exercise: "construya una ficha para una cápsula con identidad incierta: incluya tres evidencias permitidas, dos inferencias prohibidas y una acción que preserve la señal",
    glossary: "constante: lectura fisiológica situada en el tiempo; cadena de custodia: registro de acceso a evidencia; manifiesto: lista administrativa; hipótesis: explicación provisional",
  },
  "/library/medical/cryomedicine.BOOK": {
    scope: "la clinique cryogénique lorsque continuité physiologique et identité administrative ne coïncident pas encore",
    evidence: "courbe de température, constantes datées, origine du capteur, dossier signé, manifeste, ATA et journal d'accès",
    procedure: "séparer le soin immédiat de l'attribution, conserver le tampon observé, noter toute dérogation et demander une preuve indépendante avant de modifier une identité",
    caseStudy: "une capsule hors manifeste présente des constantes stables et un tampon neural partiel; l'équipe peut protéger le patient sans inventer un nom",
    exercise: "rédigez une note de relève distinguant urgence clinique, preuve administrative, chaîne de garde et information inconnue",
    glossary: "tampon neural: mémoire technique des impulsions; attribution: liaison à une identité; dérogation: exception documentée; chaîne de garde: continuité de l'accès à une preuve",
  },
  "/library/energy/power-bus-maintenance.BOOK": {
    scope: "die Wartung von Generatoren und Bussen als abgestimmte Zustandsänderung statt als einzelner Schalter",
    evidence: "Generatorzustand, Buslast, Relaisantwort, Firmware-Port, Wartungsvolume, Berechtigungsstufe und Dienststatus nach dem Vorgang",
    procedure: "Last lesen, Abhängigkeiten festhalten, drei Servicesignaturen prüfen, eine begrenzte Anfrage stellen und Generator, Bus sowie Folgedienst erneut messen",
    caseStudy: "GEN-02 meldet FAULT, während ein Bus stabil bleibt; Reserve kann Last tragen, doch ein Eingriff ohne Firmware-Port würde die Schutzschicht missachten",
    exercise: "erstellen Sie ein Wartungsprotokoll mit Vorbedingung, drei Messungen vor dem Eingriff, einer abgelehnten Anfrage und sicherer Übergabe",
    glossary: "Bus: gemeinsamer Energiepfad; Reserve: verfügbare Ausgleichslast; Servicesignatur: notwendige Freigabe; Relais: schaltendes Bindeglied",
  },
  "/library/mathematics/telemetry-math.BOOK": {
    scope: "不完整遥测中的误差传播、进制转换和可复核的近似",
    evidence: "原始读数、单位、采样时刻、转换步骤、舍入规则、传感器来源以及第二来源的差值",
    procedure: "先保留原值和单位，再进行十六进制或十进制转换，分别传播每个测量的误差，最后报告区间及其前提",
    caseStudy: "两个功率读数只差一个低位字节，却来自不同采样周期；直接平均会制造不存在的精度，正确做法是保留时间标签",
    exercise: "选择一条含十六进制字段的遥测记录，写出转换、单位检查和误差界限；说明缺少采样时间时哪个结论必须暂缓",
    glossary: "误差传播：由输入不确定性导出的范围；有效数字：读数真正支持的精度；时间基准：采样依赖的时钟；区间：比单一估计更诚实的表达",
  },
  "/library/communications/seed-messaging.BOOK": {
    scope: "配信状態、送信者、本文、添付物を別々の証拠として扱うSeed通信の運用",
    evidence: "送信時刻、送信元端末、受信者集合、未読または既読状態、添付参照、ハッシュと配送経路の記録",
    procedure: "ヘッダーを保存し、本文と添付を分けて照合し、未読を未送信と混同せず、転送前後の経路を操作記録に残す",
    caseStudy: "公式メッセージは未読のまま残り、別系統の短い通信が同じ話題に触れる。二つは相互参照にはなるが、理解の証明ではない",
    exercise: "一通の.MSGについて、配送事実、本文の主張、添付物の存在、受信者の理解を分離した四欄の記録を作成してください",
    glossary: "配送状態: メッセージ処理の状態; ヘッダー: 本文外の伝送情報; 連鎖記録: 転送の連続性; 相互参照: 独立記録の照合",
  },
  "/library/mission/seed-corporate-history.BOOK": {
    scope: "قراءة تاريخ المهمة بوصفه أرشيفاً مؤسسياً ذا غرض لا سجلاً محايداً",
    evidence: "تاريخ الإصدار، الجهة المنتجة، نسخة الوثيقة، الجمهور المقصود، السجل التشغيلي المقابل، والفرق بين البيان العام والمراسلات الداخلية",
    procedure: "حدد صاحب السرد وجمهوره، قارن النسخ المؤرخة، افصل الوقائع القابلة للتحقق عن اللغة الترويجية، وسجّل ما لا يثبته المصدر",
    caseStudy: "يصف فيديو عام الرحلة كمسار مستقر، بينما تسجل ورقة تشغيلية اختباراً متكرراً. لا يلغي أحدهما الآخر؛ إنهما يتحدثان من مسؤوليتين وزمنين مختلفين",
    exercise: "اختر مصدرين عن مرحلة واحدة، واكتب جدولاً يفرّق بين الادعاء والدليل والجمهور والتفصيل الغائب؛ لا تحوّل الغياب إلى إثبات",
    glossary: "الأرشيف المؤسسي: سجل تنتجه جهة ذات مصلحة; النسخة: حالة محددة من وثيقة; الجمهور: من صيغ الخطاب لأجله; الادعاء: عبارة تحتاج إلى مصدر مستقل",
  },
  "/library/engineering/repair-paths.BOOK": {
    scope: "service signatures and repair paths as bounded requests, not a promise that every accessible tool may write to hardware",
    evidence: "target state, BIOS exposure, mounted maintenance volume, current authority, dependency record, signed request and post-procedure telemetry",
    procedure: "identify the service, inspect path and dependencies, establish required signatures, submit one scoped request, then measure the service boundary",
    caseStudy: "a valid repair program requests GEN-02, but the maintenance volume is absent; rejection preserves the system because source validity is not proof of environmental readiness",
    exercise: "write a worksheet for one generator and one life-support service, separating pre-request proof, rejection output and the three readings after acceptance",
    glossary: "repair path: conditions leading to a procedure; service signature: prerequisite authorization state; dependency: required service or volume; scoped request: action limited to one target",
  },
  "/library/biology/hydroponic-life.BOOK": {
    scope: "os ciclos hidropônicos como infraestrutura viva que troca água, nutrientes, gases e evidência com o suporte",
    evidence: "condutividade, pH, temperatura, fluxo, luz, nutrientes, horário de coleta e estado do scrubber associado",
    procedure: "medir sem corrigir de imediato, comparar amostra local com a tendência do ciclo, isolar a variável que mudou e registrar o ajuste com a leitura posterior",
    caseStudy: "um leito perde rendimento enquanto a telemetria de ar oscila; tratar apenas a planta como defeito apaga a relação possível entre fluxo, troca gasosa e suporte à vida",
    exercise: "monte um diário de dois ciclos com quatro leituras, unidades, uma hipótese rival e uma observação que separe causa local de falha sistêmica",
    glossary: "condutividade: indício de sais dissolvidos; tendência: mudança ao longo do tempo; leito: unidade de cultivo; variável de controle: fator mantido para interpretar outro",
  },
  "/library/operations/crew-handbook.BOOK": {
    scope: "los relevos de personal despierto cuando consola, autoridad y soporte vital pueden cambiar entre turnos",
    evidence: "hora de relevo, terminal usado, autoridad activa, volúmenes montados, alertas vistas, comandos, archivos consultados y tareas no realizadas",
    procedure: "describir el estado antes de intervenir, separar observación de acción, registrar la razón de una espera y entregar rutas exactas en lugar de conclusiones",
    caseStudy: "un turno recibe una alerta de energía con permiso CREW; puede documentar y preparar condiciones, pero no debe presentar una negativa del kernel como reparación incompleta",
    exercise: "redacte una entrega de diez líneas para una discrepancia de oxígeno con estado, evidencia, límites de autoridad, dos rutas consultadas y próxima comprobación segura",
    glossary: "relevo: transferencia de responsabilidad; estado: condición medida; autoridad: máximo permiso operativo; espera deliberada: decisión documentada de no intervenir",
  },
  "/library/communications/manuel-de-controle-des-messages.BOOK": {
    scope: "le contrôle des messages comme conservation de preuve sans confondre transmission, lecture, intention et compréhension",
    evidence: "en-tête, expéditeur attribué, destinataires, horodatage, statut de distribution, pièces jointes, terminal d'origine et traces de transfert",
    procedure: "copier les métadonnées avant comparaison, vérifier les pièces séparément, décrire les contradictions sans intuition et consigner la chaîne de consultation",
    caseStudy: "une pièce jointe existe mais demeure inaccessible pour une autorité donnée; le lien est un fait, son interprétation doit attendre un accès légitime ou une source indépendante",
    exercise: "préparez une fiche pour deux messages contradictoires, séparant livraison, affirmations de texte, pièces jointes et conclusions prématurées",
    glossary: "distribution: état de livraison; pièce jointe: objet référencé; attribution: lien démontré à un expéditeur; contradiction: divergence à documenter",
  },
  "/library/maintenance/handbuch-sichere-reparatur.BOOK": {
    scope: "sichere Reparatur und Übergabe als Folge kleiner, nachvollziehbarer und bewusst begrenzter Schritte",
    evidence: "Ausgangszustand, Berechtigung, Firmware-Zugang, gemountetes Volume, Diagnoseausgabe, Antragsergebnis und Messwerte danach",
    procedure: "Arbeitsbereich sichern, Voraussetzungen benennen, nur einen Zielservice anfragen, jede Ablehnung erhalten und eine Übergabe ohne Vermutung schreiben",
    caseStudy: "eine Reparatur wird abgelehnt, weil eine Signatur fehlt. Statt die Sperre zu umgehen, dokumentiert man Voraussetzung, Zeitpunkt und unveränderten Zustand",
    exercise: "formulieren Sie für SCRUBBER-B eine Übergabe mit Ausgangslage, drei Voraussetzungen, einer offenen Frage und einem nächsten Schritt ohne neue Schreiboperation",
    glossary: "Ausgangszustand: Zustand vor dem Eingriff; Voraussetzung: notwendige Bedingung; Ablehnung: gültiges Schutzereignis; Übergabe: Weitergabe von Kontext und Grenzen",
  },
};

const headings: Partial<Record<FileLanguage, string[]>> = {
  "pt-BR": ["NOTA DE MÉTODO // EDIÇÃO DE TRABALHO", "CASO DE LEITURA // EVIDÊNCIA LIMITADA", "MODOS DE FALHA // O QUE NÃO SE PODE CONCLUIR", "EXERCÍCIO DE BORDO // SEM SOLUÇÃO AUTOMÁTICA", "GLOSSÁRIO E LEITURA CRUZADA // TERMOS DE CAMPO"],
  "es-MX": ["NOTA DE MÉTODO // EDICIÓN DE TRABAJO", "CASO DE LECTURA // EVIDENCIA LIMITADA", "MODOS DE FALLA // LO QUE NO SE PUEDE CONCLUIR", "EJERCICIO DE ABORDO // SIN SOLUCIÓN AUTOMÁTICA", "GLOSARIO Y LECTURA CRUZADA // TÉRMINOS DE CAMPO"],
  "fr-FR": ["NOTE DE MÉTHODE // ÉDITION DE TRAVAIL", "CAS DE LECTURE // PREUVE LIMITÉE", "MODES DE DÉFAILLANCE // CE QUI NE PEUT ÊTRE CONCLU", "EXERCICE DE BORD // SANS SOLUTION AUTOMATIQUE", "GLOSSAIRE ET LECTURE CROISÉE // TERMES DE TERRAIN"],
  "de-DE": ["METHODENNOTIZ // ARBEITSAUSGABE", "LESEFALL // BEGRENZTE EVIDENZ", "FEHLERMODI // WAS NICHT GESCHLOSSEN WERDEN DARF", "BORDAUFGABE // OHNE AUTOMATISCHE LÖSUNG", "GLOSSAR UND QUERLEKTÜRE // FELDBEGRIFFE"],
  "zh-CN": ["方法注记 // 工作版", "阅读案例 // 有限证据", "失效模式 // 不可得出的结论", "船载练习 // 无自动答案", "术语表与交叉阅读 // 现场术语"],
  "ja-JP": ["方法注記 // 作業版", "読解事例 // 限定された証拠", "失敗モード // 結論できないこと", "船内演習 // 自動解答なし", "用語集と相互参照 // 現場語"],
  "ar-EG": ["ملاحظة منهجية // نسخة عمل", "حالة قراءة // دليل محدود", "أنماط الفشل // ما لا يجوز استنتاجه", "تمرين على متن السفينة // بلا حل آلي", "معجم وقراءة متقاطعة // مصطلحات ميدانية"],
};

function extendedChapter(language: FileLanguage, plan: Plan, number: number): string {
  const focus = [plan.scope, plan.evidence, plan.procedure, plan.caseStudy, plan.exercise][number % 5];
  switch (language) {
    case "pt-BR": return `\n\nLEITURA SUSTENTADA — Este capítulo deve ser usado como prática de verificação, não como licença para preencher lacunas. O foco desta passagem é ${focus}. Trabalhe com evidência observável: ${plan.evidence}. Registre fonte, horário e limite de autoridade antes de comparar registros.\n\nPROCEDIMENTO LIMITADO — ${plan.procedure}. Se uma etapa não puder ser realizada, preserve a negativa e descreva a condição ausente. Um resultado honesto identifica tanto o que foi medido quanto aquilo que permaneceu fora do alcance da sessão.\n\nLIMITE OPERACIONAL — Integridade confirma a chegada dos bytes, não o entendimento de quem os produziu. Um comando aceito comprova o processamento daquela solicitação, não uma causa narrativa. A divergência deve permanecer legível até que uma fonte independente a restrinja.`;
    case "es-MX": return `\n\nLECTURA SOSTENIDA — Este capítulo sirve para verificar, no para completar vacíos por intuición. Su foco es ${focus}. Trabaje con evidencia observable: ${plan.evidence}. Registre fuente, hora y límite de autoridad antes de comparar archivos.\n\nPROCEDIMIENTO ACOTADO — ${plan.procedure}. Si un paso no puede realizarse, conserve el rechazo y describa la condición ausente. Un resultado honesto declara tanto lo medido como lo que quedó fuera del alcance de la sesión.\n\nLÍMITE OPERATIVO — La integridad confirma bytes recibidos, no la comprensión de su autor. Un comando aceptado prueba el procesamiento de una solicitud, no una causa narrativa.`;
    case "fr-FR": return `\n\nLECTURE SOUTENUE — Ce chapitre sert à vérifier, non à combler les lacunes par intuition. Son point d'attention est ${focus}. Travaillez avec une preuve observable : ${plan.evidence}. Notez source, heure et limite d'autorité avant de comparer les dossiers.\n\nPROCÉDURE BORNÉE — ${plan.procedure}. Si une étape est impossible, conservez le refus et décrivez la condition manquante. Un résultat honnête indique ce qui a été mesuré autant que ce qui demeure hors de portée.\n\nLIMITE OPÉRATIONNELLE — L'intégrité confirme des octets reçus, non l'intention de leur auteur. Un ordre accepté prouve son traitement, non une cause narrative.`;
    case "de-DE": return `\n\nVERTIEFTE LEKTÜRE — Dieses Kapitel dient der Prüfung, nicht dem Ausfüllen von Lücken durch Vermutung. Im Mittelpunkt steht ${focus}. Arbeiten Sie mit beobachtbarer Evidenz: ${plan.evidence}. Quelle, Zeitpunkt und Berechtigungsgrenze sind vor dem Vergleich zu notieren.\n\nBEGRENZTES VERFAHREN — ${plan.procedure}. Kann ein Schritt nicht ausgeführt werden, bleiben Ablehnung und fehlende Bedingung erhalten. Ein ehrliches Ergebnis nennt Messbares ebenso wie das, was außerhalb der Sitzung blieb.\n\nOPERATIVE GRENZE — Integrität bestätigt empfangene Bytes, nicht die Absicht ihres Autors. Ein angenommener Befehl belegt Verarbeitung, keine narrative Ursache.`;
    case "zh-CN": return `\n\n延伸阅读——本章用于核验，而不是凭直觉补全空白。重点是${focus}。应处理可观察证据：${plan.evidence}。比较记录前，先写明来源、时间和权限边界。\n\n有限程序——${plan.procedure}。若某一步不能执行，应保留拒绝结果并说明缺失条件。诚实的结果既报告已测量内容，也报告本次会话无法覆盖的部分。\n\n操作限制——完整性确认收到的字节，而不确认作者意图；命令被接受只说明请求被处理，不说明叙事原因。`;
    case "ja-JP": return `\n\n継続読解——本章は推測で空白を埋めるためではなく、検証のために用いる。焦点は${focus}である。観察できる証拠、すなわち${plan.evidence}を扱う。比較の前に、出所、時刻、権限境界を記録する。\n\n限定手順——${plan.procedure}。実行できない段階があれば、拒否と不足条件を残す。誠実な結果は、測定値と今回のセッション外に残った点の両方を示す。\n\n運用上の限界——完全性は受信バイトを示すだけで作者の意図を示さない。受理されたコマンドも処理済みの要求を示すだけで、物語上の原因を示さない。`;
    case "ar-EG": return `\n\nقراءة ممتدة — يُستخدم هذا الفصل للتحقق لا لملء الفجوات بالحدس. محوره ${focus}. اعمل على دليل قابل للملاحظة: ${plan.evidence}. سجّل المصدر والوقت وحدّ الصلاحية قبل مقارنة السجلات.\n\nإجراء محدود — ${plan.procedure}. إذا تعذر تنفيذ خطوة، فاحفظ الرفض واشرح الشرط الغائب. النتيجة الأمينة تذكر ما قيس وما بقي خارج نطاق الجلسة.\n\nحد تشغيلي — تؤكد السلامة وصول البايتات لا نية مؤلفها. الأمر المقبول يثبت معالجة الطلب لا سبباً سردياً.`;
    default: return `\n\nSUSTAINED READING — This chapter is a verification practice, not permission to fill a gap by intuition. Its present focus is ${focus}. Work from observable evidence: ${plan.evidence}. Record source, time and authority limit before comparing records.\n\nBOUNDED PROCEDURE — ${plan.procedure}. If a step cannot be performed, preserve the rejection and name the absent condition. An honest result reports what was measured as clearly as what remained outside the session.\n\nOPERATING LIMIT — Integrity confirms received bytes, not an author's intent. An accepted command proves the processing of a request, not a narrative cause.`;
  }
}

function supplement(language: FileLanguage, plan: Plan, section: number, references: string[]): string {
  const refs = references.length ? references.join(" ; ") : "the records cited by this volume";
  const focus = [plan.scope, plan.caseStudy, plan.evidence, plan.exercise, plan.glossary][section];
  const closings: Partial<Record<FileLanguage, string>> = {
    "pt-BR": "Indique o dado ausente e a autoridade que poderia produzi-lo legitimamente.",
    "es-MX": "Indique el dato faltante y la autoridad que podría producirlo legítimamente.",
    "fr-FR": "Indiquez la donnée manquante et l'autorité qui pourrait la produire légitimement.",
    "de-DE": "Nennen Sie die fehlende Information und die Stelle, die sie rechtmäßig erzeugen könnte.",
    "zh-CN": "请说明缺少的数据，以及可以合法产生它的权限主体。",
    "ja-JP": "欠けているデータと、それを正当に作成できる権限主体を明記する。",
    "ar-EG": "حدّد البيانات الغائبة والجهة المخوّلة التي يمكنها إنتاجها بصورة مشروعة.",
  };
  const closing = section === 3 ? plan.exercise : section === 4 ? plan.glossary : closings[language] ?? "Name the missing datum and the authority that could legitimately produce it.";
  if (language === "pt-BR") return `Este caderno de trabalho desenvolve ${focus}. Separe observação, inferência e decisão: nenhum cabeçalho, valor isolado ou comando aceito substitui uma cadeia de evidências. A prática segura mantém etapas reversíveis ou explicitamente delimitadas. ${plan.procedure}. Antes e depois de uma consulta relevante, anote fonte e mudança de contexto.\n\nO caso de referência é ${plan.caseStudy}. Ele ensina uma descrição verificável, não uma solução narrativa. Quando a evidência divergir, registre a divergência antes de descartar uma fonte. Esta edição aponta para ${refs}. ${closing}`;
  if (language === "es-MX") return `Este cuaderno desarrolla ${focus}. Separe observación, inferencia y decisión: ningún encabezado, valor aislado ni comando aceptado sustituye una cadena de evidencias. La práctica segura conserva pasos reversibles o explícitamente acotados. ${plan.procedure}. Anote fuente y cambio de contexto antes y después de una consulta.\n\nEl caso de referencia es ${plan.caseStudy}. Enseña una descripción verificable, no una solución narrativa. Cuando la evidencia diverge, registre la diferencia antes de descartar una fuente. Esta edición remite a ${refs}. ${closing}`;
  if (language === "fr-FR") return `Ce cahier développe ${focus}. Séparez observation, inférence et décision : aucun en-tête, chiffre isolé ou ordre accepté ne remplace une chaîne de preuves. La pratique sûre conserve des étapes réversibles ou bornées. ${plan.procedure}. Notez source et changement de contexte avant et après une consultation.\n\nLe cas de référence est ${plan.caseStudy}. Il entraîne une description vérifiable, non une résolution narrative. Lorsque les preuves divergent, consignez l'écart avant d'écarter une source. Cette édition renvoie à ${refs}. ${closing}`;
  if (language === "de-DE") return `Dieses Arbeitsheft vertieft ${focus}. Trennen Sie Beobachtung, Schlussfolgerung und Entscheidung: Kein Header, Einzelwert oder angenommener Befehl ersetzt eine Evidenzkette. Sichere Praxis hält Schritte reversibel oder begrenzt. ${plan.procedure}. Notieren Sie Quelle und Kontextwechsel vor und nach einer Abfrage.\n\nDer Referenzfall lautet: ${plan.caseStudy}. Er übt überprüfbare Beschreibung, nicht narrative Auflösung. Bei abweichender Evidenz wird zuerst die Abweichung notiert. Diese Ausgabe verweist auf ${refs}. ${closing}`;
  if (language === "zh-CN") return `本工作册扩展${focus}。必须区分观察、推断和决策：单独的标题、数值或已接受命令都不能替代证据链。安全实践保留可逆步骤，或明确边界。${plan.procedure}。每次重要查询前后，都要记录来源和上下文变化。\n\n参考案例是：${plan.caseStudy}。它训练可复核的描述，而非叙事性答案。证据出现分歧时，应先记录分歧。本版交叉参照：${refs}。${closing}`;
  if (language === "ja-JP") return `この作業版は${focus}を拡張する。観察、推論、決定を分けなければならない。単独のヘッダー、数値、受理されたコマンドは証拠連鎖の代わりにならない。安全な実践では可逆性または明示された境界を残す。${plan.procedure}。重要な照会の前後に出所と文脈変化を記録する。\n\n参照事例は${plan.caseStudy}である。これは検証可能な記述を練習するためで、物語上の解答ではない。証拠が食い違う場合はまず差異を記録する。本版の相互参照は${refs}。${closing}`;
  if (language === "ar-EG") return `يوسّع دفتر العمل هذا ${focus}. افصل بين الملاحظة والاستنتاج والقرار؛ فلا يحل عنوان منفرد أو رقم أو أمر مقبول محل سلسلة الأدلة. الممارسة الآمنة تحفظ الخطوات القابلة للعكس أو المحددة. ${plan.procedure}. دوّن المصدر وتغير السياق قبل الاستعلام المهم وبعده.\n\nحالة الإحالة هي ${plan.caseStudy}. وهي تتدرب على وصف قابل للتحقق لا على حل سردي. عند اختلاف الأدلة، سجّل الفرق قبل استبعاد المصدر. تشير هذه الطبعة إلى ${refs}. ${closing}`;
  return `This working section develops ${focus}. Separate observation, inference and decision: no header, isolated value or accepted command replaces a chain of evidence. Safe practice keeps steps reversible or explicitly bounded. ${plan.procedure}. Record source and context change before and after a relevant consultation.\n\nThe reference case is ${plan.caseStudy}. It trains a verifiable description, not a narrative resolution. When evidence diverges, record that divergence before discarding either source. This edition cross-references ${refs}. ${closing}`;
}

export function completeRecoveredBook<T extends EditorialBook>(spec: T): T {
  const plan = plans[spec.path];
  if (!plan) return spec;
  let chapter = 0;
  const expanded = spec.chapters.map((entry) => {
    if (entry.includes("//")) { chapter += 1; return entry; }
    return `${entry}${extendedChapter(spec.language, plan, chapter)}`;
  });
  const additions = headings[spec.language] ?? ["METHOD NOTE // WORKING EDITION", "READING CASE // BOUNDED EVIDENCE", "FAILURE MODES // WHAT CANNOT BE CONCLUDED", "SHIPBOARD EXERCISE // NO AUTOMATIC SOLUTION", "GLOSSARY AND CROSS-READING // FIELD TERMS"];
  additions.forEach((heading, index) => expanded.push(heading, supplement(spec.language, plan, index, spec.references ?? [])));
  return { ...spec, chapters: expanded };
}
