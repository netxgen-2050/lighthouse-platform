import type { Metadata } from "next";
import { Anek_Latin, Figtree, JetBrains_Mono } from "next/font/google";
import { AplicarPreferencias } from "@/components/aplicar-preferencias";
import { BarraSuperior } from "@/components/barra-superior";
import { Rail } from "@/components/rail";
import { ProveedorSesion } from "@/components/sesion/proveedor-sesion";
import { Puerta, SoloConCapacidad, SoloConSesion } from "@/components/sesion/puerta";
import { SCRIPT_APARIENCIA } from "@/lib/configuracion/script-apariencia";
import { Pie } from "@/components/pie";
import { BotonReportar } from "@/components/boton-reportar";
import { Hifa } from "@/components/hifa/hifa";
import { ProveedorIdioma, SincronizarIdioma } from "@/lib/idioma/cliente";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { versionDesplegada } from "@/lib/reportes/reporte";
import "./globals.css";

const anek = Anek_Latin({ variable: "--font-anek", subsets: ["latin"] });
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

// El título y la descripción dependen del idioma del pedido (cookie o navegador).
export async function generateMetadata(): Promise<Metadata> {
  const t = textos("marco", await idiomaDelPedido());
  return { title: "Lighthouse", description: t.descripcionSitio };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const despliegue = versionDesplegada({
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
    VERCEL_ENV: process.env.VERCEL_ENV,
  });
  // Leer la cookie hace que todas las páginas se armen en cada pedido (ADR-004).
  const idioma = await idiomaDelPedido();
  const t = textos("marco", idioma);
  return (
    // suppressHydrationWarning: el script de apariencia pone data-tema, data-texto, data-movimiento y data-hifa antes de hidratar.
    <html lang={idioma} suppressHydrationWarning>
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
          {t.saltar}
        </a>
        <ProveedorIdioma idioma={idioma}>
          <ProveedorSesion>
            <SincronizarIdioma />
            <SoloConSesion>
              <AplicarPreferencias />
            </SoloConSesion>
            <Rail />
            <div className="flex min-w-0 flex-1 flex-col">
              <BarraSuperior />
              <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
                <Puerta>{children}</Puerta>
              </main>
              <Pie anioRespaldo={new Date().getFullYear()} />
              {/* Espacio para que el botón fijo de Hifa no tape el final de la página. */}
              <div aria-hidden="true" className="h-16 shrink-0" />
            </div>
            {/* Reportar es para toda persona, con o sin sesión; Hifa se habilita desde el nivel Explorador. */}
            {/* Reportar y Hifa todavía están solo en español (`idioma-hifa-avisos`): en inglés se marcan como español. */}
            <div lang={idioma === "en" ? "es" : undefined} className="contents">
              <BotonReportar version={despliegue.version} entorno={despliegue.entorno} />
              <SoloConCapacidad capacidad="hifa">
                <Hifa version={despliegue.version} entorno={despliegue.entorno} />
              </SoloConCapacidad>
            </div>
          </ProveedorSesion>
        </ProveedorIdioma>
      </body>
    </html>
  );
}
