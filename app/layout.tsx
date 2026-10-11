import type { Metadata } from "next";
import { Anek_Latin, Figtree, JetBrains_Mono } from "next/font/google";
import { AplicarPreferencias } from "@/components/aplicar-preferencias";
import { BarraSuperior } from "@/components/barra-superior";
import { Rail } from "@/components/rail";
import { SCRIPT_APARIENCIA } from "@/lib/configuracion/script-apariencia";
import { Pie } from "@/components/pie";
import { BotonReportar } from "@/components/boton-reportar";
import { Hifa } from "@/components/hifa/hifa";
import { versionDesplegada } from "@/lib/reportes/reporte";
import "./globals.css";

const anek = Anek_Latin({ variable: "--font-anek", subsets: ["latin"] });
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lighthouse",
  description: "Plataforma del Lighthouse: territorio y tribus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const despliegue = versionDesplegada({
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
    VERCEL_ENV: process.env.VERCEL_ENV,
  });
  return (
    // suppressHydrationWarning: el script de apariencia pone data-tema, data-texto y data-movimiento antes de hidratar.
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_APARIENCIA }} />
      </head>
      <body
        className={`${anek.variable} ${figtree.variable} ${jetbrains.variable} flex min-h-screen antialiased`}
      >
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-deep focus:px-4 focus:py-2 focus:text-on-deep"
        >
          Saltar al contenido
        </a>
        <AplicarPreferencias />
        <Rail />
        <div className="flex min-w-0 flex-1 flex-col">
          <BarraSuperior />
          <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <Pie anioRespaldo={new Date().getFullYear()} />
          {/* Espacio para que el botón fijo de Hifa no tape el final de la página. */}
          <div aria-hidden="true" className="h-16 shrink-0" />
        </div>
        <BotonReportar version={despliegue.version} entorno={despliegue.entorno} />
        <Hifa version={despliegue.version} entorno={despliegue.entorno} />
      </body>
    </html>
  );
}
