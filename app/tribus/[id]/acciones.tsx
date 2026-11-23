"use client";

import Link from "next/link";
import { useTextos } from "@/lib/idioma/cliente";

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const SUAVE = `${BOTON} border border-muted hover:bg-surface-2`;

// Los botones de membresía viven en components/membresia-acciones.tsx.
export function VerBarrio() {
  const t = useTextos("tribus").ficha;
  return (
    <Link className={SUAVE} href="/territorios/lighthouse">
      {t.verBarrio}
    </Link>
  );
}
