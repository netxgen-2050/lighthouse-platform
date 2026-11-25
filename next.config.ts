import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Solo para el e2e de login-neon-auth: la variable pública `NEXT_PUBLIC_LH_LOGIN` se fija al compilar, así que ese archivo se
  // prueba contra un segundo build en otra carpeta (ver playwright.config.ts). Sin la variable es `.next`, como siempre.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Cada carril de la noche es una copia del repo dentro de .carriles/; fijamos la raíz
  // para que Turbopack no tome el repo de afuera como raíz del workspace.
  turbopack: { root: process.cwd() },
  // PGlite (Postgres embebido, solo local y tests) trae archivos binarios: se carga desde node_modules, no se empaqueta.
  serverExternalPackages: ["@electric-sql/pglite"],
  // forbidden() (403) para proteger /admin en el servidor (ADR-016). Experimental en Next 15.5: lo vigila e2e/admin.spec.ts.
  experimental: { authInterrupts: true },
};

export default nextConfig;
