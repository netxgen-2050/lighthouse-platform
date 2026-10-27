import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cada carril de la noche es una copia del repo dentro de .carriles/; fijamos la raíz
  // para que Turbopack no tome el repo de afuera como raíz del workspace.
  turbopack: { root: process.cwd() },
  // PGlite (Postgres embebido, solo local y tests) trae archivos binarios: se carga desde node_modules, no se empaqueta.
  serverExternalPackages: ["@electric-sql/pglite"],
  // forbidden() (403) para proteger /admin en el servidor (ADR-016). Experimental en Next 15.5: lo vigila e2e/admin.spec.ts.
  experimental: { authInterrupts: true },
};

export default nextConfig;
