import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cada carril de la noche es una copia del repo dentro de .carriles/; fijamos la raíz
  // para que Turbopack no tome el repo de afuera como raíz del workspace.
  turbopack: { root: process.cwd() },
};

export default nextConfig;
