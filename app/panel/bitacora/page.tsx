import type { Metadata } from "next";
import Link from "next/link";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { TerminoLegal } from "@/components/termino-legal";
import { TablaBitacora } from "./tabla-bitacora";

export const metadata: Metadata = { title: "Lo que te mostramos" };

export default function BitacoraPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/panel">← Mi recorrido</Link>
      </p>
      <p className="text-sm font-medium text-muted">Tu panel</p>
      <h1 className="text-3xl font-semibold">Lo que te mostramos</h1>
      <p className="mt-2 mb-4 max-w-2xl text-muted">
        Anotamos qué estado del loteo y qué explicaciones legales viste, y cuándo, para poder probar con qué
        información contabas al decidir.
        <TerminoLegal clave="bitacora" />
      </p>
      <p className="mb-4 max-w-2xl text-sm text-muted">
        En el prototipo la bitácora queda solo en este navegador y la podés borrar: todavía no sirve como prueba.
        Con el login y la base de datos se va a guardar de verdad.
      </p>
      <AvisoEjemplo />
      <div className="mt-6">
        <TablaBitacora />
      </div>
    </div>
  );
}
