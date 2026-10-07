"use client";

import { useEffect, useState } from "react";
import { leer, type Bitacora } from "@/lib/demo/bitacora";
import { CLAVES } from "@/lib/demo/claves";

const TIPOS = { "estado-loteo": "Estado del loteo", "termino-legal": "Término legal" } as const;

function formatear(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "medium" });
}

export function TablaBitacora() {
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

  if (!listo) return <p role="status">Cargando…</p>;

  if (falloAlmacen) {
    return (
      <p role="alert" className="text-sm font-medium text-danger">
        Error: tu navegador no permite leer los datos guardados en este sitio, así que no podemos mostrar la
        bitácora. Revisá la configuración de privacidad o probá en otro navegador.
      </p>
    );
  }

  if (entradas.length === 0) {
    return <p>Todavía no hay nada anotado en este navegador.</p>;
  }

  const recientes = [...entradas].reverse();

  return (
    <div className="grid gap-4">
      <button
        type="button"
        onClick={descargar}
        className="w-fit rounded-lg border border-muted px-3 py-1.5 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
      >
        Descargar (JSON)
      </button>
      {/* Región con scroll propio en celular: enfocable para usarla con teclado. */}
      <div
        role="region"
        aria-label="Tabla de lo que te mostramos"
        tabIndex={0}
        className="overflow-x-auto rounded-xl border border-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
      >
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">Lo que te mostramos, de lo más nuevo a lo más viejo</caption>
          <thead className="bg-surface-2">
            <tr>
              <th scope="col" className="px-3 py-2">Fecha y hora</th>
              <th scope="col" className="px-3 py-2">Pantalla</th>
              <th scope="col" className="px-3 py-2">Qué se mostró</th>
              <th scope="col" className="px-3 py-2">Huella</th>
              <th scope="col" className="px-3 py-2">Borrador</th>
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
                  <span className="font-medium">{TIPOS[e.tipo]}</span>
                  <br />
                  {e.mostrado}
                </td>
                <td className="px-3 py-2 font-mono">{e.huella}</td>
                <td className="px-3 py-2">Borrador: {e.borrador ? "sí" : "no"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
