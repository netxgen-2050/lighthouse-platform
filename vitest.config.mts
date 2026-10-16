import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfig usa jsx "preserve" (Next lo compila); para los tests de componentes, JSX automático.
  oxc: { jsx: { runtime: "automatic" } },
  resolve: { alias: { "@": path.resolve(__dirname) } },
  // Cada archivo con base levanta su propio PGlite (WebAssembly): con varios archivos a la vez tarda más que el valor por defecto.
  test: { testTimeout: 30_000, hookTimeout: 90_000, include: ["**/*.test.ts", "**/*.test.tsx"], exclude: ["node_modules", "e2e", ".next", ".carriles", ".claude/worktrees"] },
});
