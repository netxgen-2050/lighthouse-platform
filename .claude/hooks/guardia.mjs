#!/usr/bin/env node
// Guardia de los agentes: corre antes de cada comando de Bash (hook PreToolUse).
// Salir con código 2 bloquea el comando y le devuelve el motivo al agente.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const entrada = JSON.parse(readFileSync(0, "utf8"));
const cmd = entrada?.tool_input?.command ?? "";

const bloquear = (motivo) => {
  process.stderr.write(`🛑 Guardia: ${motivo}\n`);
  process.exit(2);
};
const sh = (c) => execSync(c, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const ramaActual = () => {
  try { return sh("git rev-parse --abbrev-ref HEAD").trim(); } catch { return ""; }
};

// 1. Solo Gus mergea, y nadie reescribe historia.
if (/\bgh\s+pr\s+merge\b/.test(cmd)) bloquear("solo Gus mergea PRs.");
if (/\bgit\s+merge\b[^;&|]*\b(main|master)\b/.test(cmd) && ramaActual() === "main") bloquear("no se mergea en main.");
if (/\bgit\s+push\b[^;&|]*(--force|--force-with-lease|\s-f\b|\s\+)/.test(cmd)) bloquear("push forzado prohibido.");
if (/\bgit\s+push\b[^;&|]*\b(main|master)\b/.test(cmd)) bloquear("no se pushea a main; usá la rama agente/<cambio>.");
if (/\bgit\s+push\b/.test(cmd) && ramaActual() === "main") bloquear("estás en main; cambiá a agente/<cambio> antes de pushear.");
if (/\bgit\s+commit\b/.test(cmd) && ramaActual() === "main") bloquear("no se commitea en main; usá la rama agente/<cambio>.");

// 2. Nada de leer ni mostrar secretos.
if (/(cat|less|head|tail|source|\.)\s+[^;&|]*\.env(?!\.example)\b/.test(cmd)) bloquear("los archivos .env no se leen.");
if (/\b(printenv|env)\s*($|[;&|])|\$\{?VERCEL_AUTOMATION_BYPASS_SECRET/.test(cmd)) bloquear("no se imprimen variables de entorno ni secretos.");

// 3. Antes de commitear: secretos y verificación.
if (/\bgit\s+commit\b/.test(cmd)) {
  let cambios = "";
  try {
    cambios = sh("git diff HEAD");
    const nuevos = sh("git ls-files --others --exclude-standard").split("\n").filter(Boolean);
    for (const f of nuevos) {
      try { cambios += "\n" + readFileSync(f, "utf8"); } catch {}
    }
  } catch {}
  const patrones = [
    /sk-ant-[A-Za-z0-9_-]{20,}/,
    /\bgh[pousr]_[A-Za-z0-9]{30,}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\bAKIA[0-9A-Z]{16}\b/,
  ];
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (patrones.some((p) => p.test(cambios)) || (bypass && cambios.includes(bypass))) {
    bloquear("parece haber un secreto en los cambios. Sacalo y usá variables de entorno.");
  }
  try {
    sh("pnpm verificar");
  } catch (e) {
    const salida = `${e.stdout ?? ""}${e.stderr ?? ""}`.slice(-3000);
    bloquear(`pnpm verificar falló; arreglalo antes de commitear.\n${salida}`);
  }
}

// 4. Antes de abrir un PR: build en verde.
if (/\bgh\s+pr\s+create\b/.test(cmd)) {
  try {
    sh("pnpm build");
  } catch (e) {
    const salida = `${e.stdout ?? ""}${e.stderr ?? ""}`.slice(-3000);
    bloquear(`pnpm build falló; arreglalo antes de abrir el PR.\n${salida}`);
  }
}

process.exit(0);
