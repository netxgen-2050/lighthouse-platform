"use client";

import Link from "next/link";
import { useTextos } from "@/lib/idioma/cliente";
import type { ErrorLectura } from "@/lib/fogon/consultas/repositorio";

/**
 * Lo que se ve cuando una lectura no salió bien: nunca una lista vacía ni ceros.
 * Cada error dice qué pasó y qué hacer; "falla" y "sin-sesion" se avisan con `role="alert"`.
 */
export function ErrorDeLectura({ error }: { error: ErrorLectura }) {
  const t = useTextos("fogonConsultas").errores;
  if (error === "no-encontrada") {
    return (
      <div className="grid gap-2">
        <p role="alert" className="font-medium">{t.noEncontrada}</p>
        <p>
          <Link className="underline" href="/fogon/consultas">{t.volver}</Link>
        </p>
      </div>
    );
  }
  if (error === "sin-sesion") {
    return (
      <p role="alert" className="font-medium">
        {t.sinSesion}.{" "}
        <Link className="underline" href="/sumarte">{t.entrar}</Link>
      </p>
    );
  }
  return (
    <p role="alert" className="font-medium text-danger">
      <span aria-hidden="true">⚠ </span>
      {t.falla}
    </p>
  );
}
