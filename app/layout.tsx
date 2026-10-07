import type { Metadata } from "next";
import { Anek_Latin, Figtree, JetBrains_Mono } from "next/font/google";
import { Rail } from "@/components/rail";
import { Pie } from "@/components/pie";
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
  return (
    <html lang="es">
      <body
        className={`${anek.variable} ${figtree.variable} ${jetbrains.variable} flex min-h-screen antialiased`}
      >
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-deep focus:px-4 focus:py-2 focus:text-on-deep"
        >
          Saltar al contenido
        </a>
        <Rail />
        <div className="flex min-w-0 flex-1 flex-col">
          <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <Pie anioRespaldo={new Date().getFullYear()} />
        </div>
      </body>
    </html>
  );
}
