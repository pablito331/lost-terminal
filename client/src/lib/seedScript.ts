/**
 * Style reminder: Seed Script is an in-world maintenance language, not a
 * browser scripting surface. Keep it deterministic, inspectable and bounded;
 * every ship capability must be supplied by the terminal runtime.
 */

export type SeedValue = number | string | boolean;

export type SeedScriptEffects = Partial<{
  energy: number;
  oxygen: number;
  hull: number;
  network: "FRAGMENTED" | "STABLE";
  service: string;
}>;

export type SeedScriptRepairResult = { ok: boolean; output: string[]; effects?: SeedScriptEffects; target?: string };

export type SeedScriptContext = {
  read: (key: string) => SeedValue;
  repair: (target: string) => SeedScriptRepairResult;
};

export type SeedScriptCompileResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  code: string[];
};

export type SeedScriptRunResult = {
  ok: boolean;
  output: string[];
  errors: string[];
  effects: SeedScriptEffects;
  repairs: string[];
};

type SourceLine = { number: number; indent: number; text: string };

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;
const DISALLOWED = /\b(import|export|eval|window|document|fetch|localStorage|indexedDB|globalThis|Function)\b/i;

function sourceLines(code: string[]): SourceLine[] {
  return code.map((raw, index) => {
    const expanded = raw.replace(/\t/g, "  ");
    const withoutComment = expanded.replace(/\s+#.*$/, "").trimEnd();
    const text = withoutComment.trim();
    return { number: index + 1, indent: withoutComment.length - withoutComment.trimStart().length, text };
  }).filter((line) => line.text.length > 0);
}

function isBlock(text: string) {
  return /^(if|while|for)\s+.+:$/.test(text);
}

function isAllowedStatement(text: string) {
  return [
    /^print\(.+\)$/,
    /^(let\s+)?[A-Za-z_][A-Za-z0-9_]*\s*=\s*.+$/,
    /^if\s+.+:$/,
    /^else:$/,
    /^while\s+.+:$/,
    /^for\s+[A-Za-z_][A-Za-z0-9_]*\s+in\s+range\(.+\):$/,
    /^repair\(.+\)$/,
    /^seed\(.+\)$/,
    /^calc\(.+\)$/,
    /^pass$/,
  ].some((pattern) => pattern.test(text));
}

export function compileSeedScript(input: string[]): SeedScriptCompileResult {
  const code = input.map((line) => line.replace(/\t/g, "  ").replace(/\s+$/, ""));
  const errors: string[] = [];
  const warnings: string[] = [];
  if (code.length > 160) errors.push("SOURCE_LIMIT: maximum 160 source lines");
  const lines = sourceLines(code);
  const stack: SourceLine[] = [];
  lines.forEach((line) => {
    if (DISALLOWED.test(line.text)) errors.push(`L${line.number}: forbidden host binding`);
    if (line.indent % 2 !== 0) errors.push(`L${line.number}: indentation must use two spaces`);
    if (!isAllowedStatement(line.text)) errors.push(`L${line.number}: unsupported Seed Script statement`);
    while (stack.length && line.indent <= stack.at(-1)!.indent) stack.pop();
    if (line.text === "else:") {
      const previous = lines[lines.indexOf(line) - 1];
      if (!previous || !/^if\s+.+:$/.test(previous.text) || previous.indent !== line.indent) errors.push(`L${line.number}: else without matching if`);
    }
    if (isBlock(line.text)) stack.push(line);
  });
  if (!lines.length) warnings.push("SOURCE_EMPTY: no executable statements");
  if (lines.some((line) => line.text.startsWith("while "))) warnings.push("LOOP_BOUND: while loops stop after 12 iterations");
  if (lines.some((line) => line.text.startsWith("repair("))) warnings.push("AUTHORITY: repair calls remain subject to firmware and operator clearance");
  return { ok: errors.length === 0, errors, warnings, code };
}

function unquote(value: string): string | undefined {
  const match = value.trim().match(/^(?:"([\s\S]*)"|'([\s\S]*)')$/);
  return match ? (match[1] ?? match[2] ?? "").replace(/\\n/g, "\n").replace(/\\"/g, '"') : undefined;
}

function splitTopLevel(value: string, operator: string): [string, string] | undefined {
  let depth = 0;
  let quote = "";
  for (let index = 0; index <= value.length - operator.length; index += 1) {
    const char = value[index];
    if (quote) { if (char === quote && value[index - 1] !== "\\") quote = ""; continue; }
    if (char === '"' || char === "'") { quote = char; continue; }
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (depth === 0 && value.slice(index, index + operator.length) === operator) return [value.slice(0, index), value.slice(index + operator.length)];
  }
  return undefined;
}

function evaluate(expression: string, variables: Record<string, SeedValue>, context: SeedScriptContext): SeedValue {
  const value = expression.trim();
  const stringValue = unquote(value);
  if (stringValue !== undefined) return stringValue;
  if (value === "true" || value === "TRUE") return true;
  if (value === "false" || value === "FALSE") return false;
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  if (IDENTIFIER.test(value) && value in variables) return variables[value];
  const seedCall = value.match(/^seed\((.+)\)$/i);
  if (seedCall) return context.read(String(evaluate(seedCall[1], variables, context)));
  const calcCall = value.match(/^calc\((.+)\)$/i);
  if (calcCall) return evaluate(calcCall[1], variables, context);
  for (const operator of ["==", "!=", ">=", "<=", ">", "<"]) {
    const pair = splitTopLevel(value, operator);
    if (pair) {
      const left = evaluate(pair[0], variables, context);
      const right = evaluate(pair[1], variables, context);
      if (operator === "==") return left === right;
      if (operator === "!=") return left !== right;
      if (operator === ">") return Number(left) > Number(right);
      if (operator === "<") return Number(left) < Number(right);
      if (operator === ">=") return Number(left) >= Number(right);
      return Number(left) <= Number(right);
    }
  }
  for (const operator of ["+", "-", "*", "/"]) {
    const pair = splitTopLevel(value, operator);
    if (pair) {
      const left = evaluate(pair[0], variables, context);
      const right = evaluate(pair[1], variables, context);
      if (operator === "+" && (typeof left === "string" || typeof right === "string")) return `${left}${right}`;
      if (operator === "+") return Number(left) + Number(right);
      if (operator === "-") return Number(left) - Number(right);
      if (operator === "*") return Number(left) * Number(right);
      return Number(right) === 0 ? 0 : Number(left) / Number(right);
    }
  }
  return value;
}

function blockEnd(lines: SourceLine[], start: number, parentIndent: number): number {
  const first = lines[start];
  if (!first) return start;
  const childIndent = first.indent;
  let index = start;
  while (index < lines.length && lines[index].indent > parentIndent) index += 1;
  return index;
}

export function runSeedScript(code: string[], context: SeedScriptContext): SeedScriptRunResult {
  const compilation = compileSeedScript(code);
  if (!compilation.ok) return { ok: false, output: [], errors: compilation.errors, effects: {}, repairs: [] };
  const lines = sourceLines(compilation.code);
  const variables: Record<string, SeedValue> = {};
  const output: string[] = [];
  const errors: string[] = [];
  const effects: SeedScriptEffects = {};
  const repairs: string[] = [];
  let operations = 0;

  const execute = (start: number, end: number, indent: number): number => {
    let index = start;
    while (index < end) {
      const line = lines[index];
      if (line.indent < indent) return index;
      if (line.indent !== indent) { errors.push(`L${line.number}: unexpected indentation`); return index + 1; }
      operations += 1;
      if (operations > 500) { errors.push("RUNTIME_LIMIT: operation budget exceeded"); return end; }
      const ifMatch = line.text.match(/^if\s+(.+):$/);
      if (ifMatch) {
        const bodyStart = index + 1;
        const bodyEnd = blockEnd(lines, bodyStart, indent);
        const elseLine = lines[bodyEnd]?.text === "else:" && lines[bodyEnd]?.indent === indent ? bodyEnd : -1;
        const elseEnd = elseLine >= 0 ? blockEnd(lines, elseLine + 1, indent) : bodyEnd;
        if (Boolean(evaluate(ifMatch[1], variables, context))) execute(bodyStart, bodyEnd, lines[bodyStart]?.indent ?? indent + 2);
        else if (elseLine >= 0) execute(elseLine + 1, elseEnd, lines[elseLine + 1]?.indent ?? indent + 2);
        index = elseEnd;
        continue;
      }
      const forMatch = line.text.match(/^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+range\((.+)\):$/);
      if (forMatch) {
        const bodyStart = index + 1;
        const bodyEnd = blockEnd(lines, bodyStart, indent);
        const count = Math.max(0, Math.min(12, Number(evaluate(forMatch[2], variables, context)) || 0));
        for (let iteration = 0; iteration < count; iteration += 1) { variables[forMatch[1]] = iteration; execute(bodyStart, bodyEnd, lines[bodyStart]?.indent ?? indent + 2); }
        index = bodyEnd;
        continue;
      }
      const whileMatch = line.text.match(/^while\s+(.+):$/);
      if (whileMatch) {
        const bodyStart = index + 1;
        const bodyEnd = blockEnd(lines, bodyStart, indent);
        let guard = 0;
        while (Boolean(evaluate(whileMatch[1], variables, context)) && guard < 12) { execute(bodyStart, bodyEnd, lines[bodyStart]?.indent ?? indent + 2); guard += 1; }
        index = bodyEnd;
        continue;
      }
      if (line.text === "else:" || line.text === "pass") { index += 1; continue; }
      const printMatch = line.text.match(/^print\((.*)\)$/);
      if (printMatch) { output.push(String(evaluate(printMatch[1], variables, context))); index += 1; continue; }
      const repairMatch = line.text.match(/^repair\((.*)\)$/);
      if (repairMatch) { const target = String(evaluate(repairMatch[1], variables, context)); const result = context.repair(target); output.push(...result.output); if (!result.ok) errors.push(`L${line.number}: repair rejected`); else repairs.push(result.target ?? target); Object.assign(effects, result.effects ?? {}); index += 1; continue; }
      const seedMatch = line.text.match(/^seed\((.*)\)$/);
      if (seedMatch) { output.push(`SEED ${String(evaluate(seedMatch[1], variables, context))}`); index += 1; continue; }
      const assignment = line.text.match(/^(?:let\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
      if (assignment) { variables[assignment[1]] = evaluate(assignment[2], variables, context); index += 1; continue; }
      const calcMatch = line.text.match(/^calc\((.*)\)$/);
      if (calcMatch) { output.push(`CALC ${evaluate(calcMatch[1], variables, context)}`); index += 1; continue; }
      index += 1;
    }
    return index;
  };

  execute(0, lines.length, lines[0]?.indent ?? 0);
  return { ok: errors.length === 0, output, errors, effects, repairs };
}
