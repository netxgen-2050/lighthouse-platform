"use client";

import { useEffect, useState } from "react";
import { leer, type Bitacora } from "@/lib/demo/bitacora";
import { CLAVES } from "@/lib/demo/claves";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { LOCALES } from "@/lib/idioma/formatos";

export function TablaBitacora() {
  const idioma = useIdioma();
  const recorrido = useTextos("recorrido");
  const t = recorrido.tabla;
  const comunes = useTextos("comunes");
  const [listo, setListo] = useState(false);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const [crudo, setCrudo] = useState<string | null>(null);
  const [entradas, setEntradas] = useState<Bitacora>([]);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      const texto = window.localStorage.getItem(CLAVES.bitacora);
      setCrudo(texto);
      setEntradas(leer(texto));
    } catch {
      setFalloAlmacen(true);
    }
    setListo(true);
  }, []);

  function formatear(iso: string): string {
    return new Date(iso).toLocaleString(LOCALES[idioma], { dateStyle: "short", timeStyle: "medium" });
  }

  function descargar() {
    // Tal como está guardada; si no hay nada, un arreglo vacío.
    const blob = new Blob([crudo ?? "[]"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "bitacora.json";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  }

  if (!listo) return <p role="status">{comunes.cargando}</p>;

  if (falloAlmacen) {
    return (
      <p role="alert" className="text-sm font-medium text-danger">
        Error: {t.errorLectura}
      </p>
    );
  }

  if (entradas.length === 0) {
    return <p>{t.vacia}</p>;
  }

  const recientes = [...entradas].reverse();
  const tipos = { "estado-loteo": t.tipos.estadoLoteo, "termino-legal": t.tipos.terminoLegal } as const;

  return (
    <div className="grid gap-4">
      <button
        type="button"
        onClick={descargar}
        className="w-fit rounded-lg border border-muted px-3 py-1.5 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
      >
        {t.descargar}
      </button>
      {/* Región con scroll propio en celular: enfocable para usarla con teclado. */}
      <div
        role="region"
        aria-label={t.aria}
        tabIndex={0}
        className="overflow-x-auto rounded-xl border border-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
      >
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">{t.titulo}</caption>
          <thead className="bg-surface-2">
            <tr>
              <th scope="col" className="px-3 py-2">{t.fecha}</th>
              <th scope="col" className="px-3 py-2">{t.pantalla}</th>
              <th scope="col" className="px-3 py-2">{t.queSeMostro}</th>
              <th scope="col" className="px-3 py-2">{t.huella}</th>
              <th scope="col" className="px-3 py-2">{t.borrador}</th>
            </tr>
          </thead>
          <tbody>
            {recientes.map((e, i) => (
              <tr key={`${e.fecha}-${e.clave}-${i}`} className="border-t border-faint align-top">
                <td className="px-3 py-2">
                  <time dateTime={e.fecha}>{formatear(e.fecha)}</time>
                </td>
                <td className="px-3 py-2">{e.ruta}</td>
                <td className="px-3 py-2">
                  <span className="font-medium">{tipos[e.tipo]}</span>
                  <br />
                  {/* Lo que se mostró queda en el idioma en que se mostró (las entradas viejas no traen idioma: eran en español). */}
                  <span lang={e.idioma ?? "es"}>{e.mostrado}</span>
                </td>
                <td className="px-3 py-2 font-mono">{e.huella}</td>
                <td className="px-3 py-2">{t.borradorFila(e.borrador)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
