import Link from "next/link";
import type { ErrorLectura } from "@/lib/fogon/consultas/repositorio";
import { TEXTO_ERROR_LECTURA } from "@/lib/fogon/consultas/repositorio";

/**
 * Lo que se ve cuando una lectura no salió bien: nunca una lista vacía ni ceros.
 * Cada error dice qué pasó y qué hacer; "falla" y "sin-sesion" se avisan con `role="alert"`.
 */
export function ErrorDeLectura({ error }: { error: ErrorLectura }) {
  if (error === "no-encontrada") {
    return (
      <div className="grid gap-2">
        <p role="alert" className="font-medium">{TEXTO_ERROR_LECTURA[error]}</p>
        <p>
          <Link className="underline" href="/fogon/consultas">Volver a las consultas</Link>
        </p>
      </div>
    );
  }
  if (error === "sin-sesion") {
    return (
      <p role="alert" className="font-medium">
        {TEXTO_ERROR_LECTURA[error]}.{" "}
        <Link className="underline" href="/sumarte">Entrar</Link>
      </p>
    );
  }
  return (
    <p role="alert" className="font-medium text-danger">
      <span aria-hidden="true">⚠ </span>
      {TEXTO_ERROR_LECTURA[error]}
    </p>
  );
}
