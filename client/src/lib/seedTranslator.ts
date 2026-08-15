import type { FileLanguage, SeedFile } from "./seedData";

export type TranslationLayer = {
  sourceLanguage: FileLanguage;
  targetLanguage: "SEED-OPS";
  fidelity: "TERMINAL_GLOSS" | "PARTIAL_PHRASE_MAP" | "UNSUPPORTED_SOURCE";
  mappedSegments: number;
  originalLines: string[];
  interpretedLines: string[];
};

const phraseMaps: Partial<Record<FileLanguage, Array<[string, string]>>> = {
  "pt-BR": [["A nave", "THE VESSEL"], ["Minha família", "MY FAMILY"], ["falha no sistema", "SYSTEM FAULT"], ["suporte de vida", "LIFE SUPPORT"], ["não esquecer", "DO NOT FORGET"], ["NOTA DE MÉTODO", "METHOD NOTE"], ["EVIDÊNCIA LIMITADA", "LIMITED EVIDENCE"], ["LEITURA SUSTENTADA", "SUSTAINED READING"], ["PROCEDIMENTO LIMITADO", "BOUNDED PROCEDURE"], ["LIMITE OPERACIONAL", "OPERATING LIMIT"]],
  "es-MX": [["La nave", "THE VESSEL"], ["Mi familia", "MY FAMILY"], ["fallo del sistema", "SYSTEM FAULT"], ["soporte vital", "LIFE SUPPORT"], ["no olvidar", "DO NOT FORGET"], ["NOTA DE MÉTODO", "METHOD NOTE"], ["EVIDENCIA LIMITADA", "LIMITED EVIDENCE"], ["LECTURA SOSTENIDA", "SUSTAINED READING"], ["PROCEDIMIENTO ACOTADO", "BOUNDED PROCEDURE"], ["LÍMITE OPERATIVO", "OPERATING LIMIT"]],
  "en-US": [["The ship", "THE VESSEL"], ["My family", "MY FAMILY"], ["system failure", "SYSTEM FAULT"], ["life support", "LIFE SUPPORT"], ["do not forget", "DO NOT FORGET"]],
  "fr-FR": [["Le vaisseau", "THE VESSEL"], ["Ma famille", "MY FAMILY"], ["panne du système", "SYSTEM FAULT"], ["soutien vital", "LIFE SUPPORT"], ["ne pas oublier", "DO NOT FORGET"], ["NOTE DE MÉTHODE", "METHOD NOTE"], ["PREUVE LIMITÉE", "LIMITED EVIDENCE"], ["LECTURE SOUTENUE", "SUSTAINED READING"], ["PROCÉDURE BORNÉE", "BOUNDED PROCEDURE"], ["LIMITE OPÉRATIONNELLE", "OPERATING LIMIT"]],
  "de-DE": [["Das Schiff", "THE VESSEL"], ["Meine Familie", "MY FAMILY"], ["Systemfehler", "SYSTEM FAULT"], ["Lebenserhaltung", "LIFE SUPPORT"], ["nicht vergessen", "DO NOT FORGET"]],
  "zh-CN": [["这艘船", "THE VESSEL"], ["我的家人", "MY FAMILY"], ["系统故障", "SYSTEM FAULT"], ["生命支持", "LIFE SUPPORT"], ["不要忘记", "DO NOT FORGET"]],
  "ja-JP": [["この船", "THE VESSEL"], ["船は", "THE VESSEL"], ["私の家族", "MY FAMILY"], ["家族は", "THE FAMILY"], ["システム障害", "SYSTEM FAULT"], ["生命維持", "LIFE SUPPORT"], ["忘れないで", "DO NOT FORGET"], ["記録を探して", "SEARCH THE RECORD"]],
  "ar-EG": [["السفينة", "THE VESSEL"], ["عائلتي", "MY FAMILY"], ["عطل النظام", "SYSTEM FAULT"], ["دعم الحياة", "LIFE SUPPORT"], ["لا تنس", "DO NOT FORGET"]],
};

const tokenMaps: Partial<Record<FileLanguage, Record<string, string>>> = {
  "pt-BR": { acesso: "ACCESS", erro: "ERROR", falha: "FAULT", energia: "POWER", oxigênio: "OXYGEN", oxigenio: "OXYGEN", família: "FAMILY", familia: "FAMILY", senha: "CREDENTIAL", porta: "PORT", reparo: "REPAIR", atenção: "ATTENTION", atencao: "ATTENTION", aviso: "NOTICE", nave: "VESSEL", sistema: "SYSTEM" },
  "es-MX": { acceso: "ACCESS", error: "ERROR", fallo: "FAULT", energía: "POWER", energia: "POWER", oxígeno: "OXYGEN", oxigeno: "OXYGEN", familia: "FAMILY", contraseña: "CREDENTIAL", puerta: "PORT", reparación: "REPAIR", aviso: "NOTICE", nave: "VESSEL", sistema: "SYSTEM" },
  "en-US": { access: "ACCESS", error: "ERROR", failure: "FAULT", power: "POWER", oxygen: "OXYGEN", family: "FAMILY", password: "CREDENTIAL", port: "PORT", repair: "REPAIR", notice: "NOTICE", ship: "VESSEL", system: "SYSTEM" },
  "fr-FR": { accès: "ACCESS", erreur: "ERROR", panne: "FAULT", énergie: "POWER", oxygène: "OXYGEN", famille: "FAMILY", mot: "CREDENTIAL", passe: "CREDENTIAL", porte: "PORT", réparation: "REPAIR", avis: "NOTICE", vaisseau: "VESSEL", système: "SYSTEM" },
  "de-DE": { zugang: "ACCESS", fehler: "ERROR", störung: "FAULT", energie: "POWER", sauerstoff: "OXYGEN", familie: "FAMILY", passwort: "CREDENTIAL", tür: "PORT", reparatur: "REPAIR", hinweis: "NOTICE", schiff: "VESSEL", system: "SYSTEM" },
  "zh-CN": { 访问: "ACCESS", 错误: "ERROR", 故障: "FAULT", 能量: "POWER", 氧气: "OXYGEN", 家人: "FAMILY", 密码: "CREDENTIAL", 舱门: "PORT", 修复: "REPAIR", 通知: "NOTICE", 船: "VESSEL", 系统: "SYSTEM" },
  "ja-JP": { アクセス: "ACCESS", エラー: "ERROR", 故障: "FAULT", 電力: "POWER", 酸素: "OXYGEN", 家族: "FAMILY", パスワード: "CREDENTIAL", ポート: "PORT", 修復: "REPAIR", 通知: "NOTICE", 船: "VESSEL", システム: "SYSTEM" },
  "ar-EG": { وصول: "ACCESS", خطأ: "ERROR", عطل: "FAULT", طاقة: "POWER", أكسجين: "OXYGEN", عائلة: "FAMILY", كلمة: "CREDENTIAL", مرور: "CREDENTIAL", منفذ: "PORT", إصلاح: "REPAIR", تنبيه: "NOTICE", سفينة: "VESSEL", نظام: "SYSTEM" },
};

function payloadLines(file: SeedFile): string[] | null {
  switch (file.payload.kind) {
    case "text": return [...file.payload.lines];
    case "message": return [...file.payload.body];
    case "health": return [file.payload.note, ...file.payload.vitals.map((vital) => `${vital.label} :: ${vital.value} :: ${vital.status}`)];
    case "incident": return [...file.payload.events];
    case "audio": return [file.payload.transcript];
    case "visual": return [file.payload.caption, file.payload.alt, ...file.payload.telemetry];
    case "credential": return [file.payload.hint, `SERVICE :: ${file.payload.service}`, `TARGET :: ${file.payload.target}`];
    case "book": return [file.payload.title, `AUTHOR :: ${file.payload.author}`, `SUBJECT :: ${file.payload.subject}`, ...file.payload.chapters, ...(file.payload.pages ?? []).flatMap((page) => [`PAGE ${page.number} :: ${page.heading}`, ...page.lines])];
    default: return null;
  }
}

function phraseGloss(line: string, language: FileLanguage): { text: string; mapped: number } {
  let output = line;
  let mapped = 0;
  for (const [phrase, replacement] of phraseMaps[language] ?? []) {
    if (output.includes(phrase)) mapped += 1;
    output = output.split(phrase).join(`${replacement}{${phrase}}`);
  }
  const tokens = tokenMaps[language] ?? {};
  const text = output.split(/(\s+|[^A-Za-zÀ-ÿ0-9_\u0400-\uFFFF-]+)/).map((token) => {
    const replacement = tokens[token.toLocaleLowerCase()];
    if (replacement) mapped += 1;
    return replacement ? `${replacement}{${token}}` : token;
  }).join("");
  return { text, mapped };
}

export function translateSeedFile(file: SeedFile, targetLanguage: "SEED-OPS" = "SEED-OPS"): TranslationLayer | null {
  const originalLines = payloadLines(file);
  if (!originalLines) return null;
  const sourceLanguage = file.payload.language;
  let mappedSegments = 0;
  const interpretedLines = originalLines.map((line) => {
    const interpretation = phraseGloss(line, sourceLanguage);
    mappedSegments += interpretation.mapped;
    return interpretation.text === line ? `[SEED-OPS/${sourceLanguage}] ${line}` : interpretation.text;
  });
  return {
    sourceLanguage,
    targetLanguage,
    fidelity: phraseMaps[sourceLanguage] ? (mappedSegments > 0 ? "PARTIAL_PHRASE_MAP" : "TERMINAL_GLOSS") : "UNSUPPORTED_SOURCE",
    mappedSegments,
    originalLines,
    interpretedLines,
  };
}
