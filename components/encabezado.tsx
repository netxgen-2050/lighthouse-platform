"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const enlaces = [
  { href: "/", texto: "Inicio" },
  { href: "/tribus", texto: "Tribus" },
];

function activo(href: string, ruta: string) {
  return href === "/" ? ruta === "/" : ruta === href || ruta.startsWith(`${href}/`);
}

export function Encabezado() {
  const ruta = usePathname();
  return (
    <header className="bg-deep text-on-deep">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-3 sm:px-10">
        <Link
          href="/"
          className="flex items-baseline gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <span className="font-display text-xl font-bold">NetX</span>
          <span className="text-sm text-on-deep-muted">Tribus · Territorios regenerativos</span>
        </Link>
        <nav aria-label="Principal">
          <ul className="flex gap-1">
            {enlaces.map((e) => {
              const esActivo = activo(e.href, ruta);
              return (
                <li key={e.href}>
                  <Link
                    href={e.href}
                    aria-current={esActivo ? "page" : undefined}
                    className={`rounded-full px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${esActivo ? "bg-on-deep text-deep underline underline-offset-4" : "hover:bg-deep-2"}`}
                  >
                    {e.texto}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
