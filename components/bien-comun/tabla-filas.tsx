import type { ReactNode } from "react";
import { REGION, TD, TH } from "./estilos";

// Tabla de tres columnas (nombre, detalle, estado) que en el celular pasa a filas de dos líneas (ux-bien-comun, design §5):
// el nombre en negrita arriba, el detalle abajo y el estado como chip. Desde 640 px es una tabla de verdad. Se dibujan las
// dos formas y el CSS muestra una: en cada ancho, las lectoras de pantalla leen solo la que se ve.
export type FilaTres = { id: string; nombre: ReactNode; detalle: ReactNode; estado: ReactNode };

export type PropsTablaFilas = {
  caption: string;
  columnas: { nombre: string; detalle: string; estado: string };
  filas: FilaTres[];
};

export function TablaFilas({ caption, columnas, filas }: PropsTablaFilas) {
  return (
    <>
      <div role="region" tabIndex={0} aria-label={caption} className={`hidden sm:block ${REGION}`}>
        <table className="w-full text-base">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className={TH}>
                {columnas.nombre}
              </th>
              <th scope="col" className={TH}>
                {columnas.detalle}
              </th>
              <th scope="col" className={TH}>
                {columnas.estado}
              </th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.id} className="border-t border-line">
                <th scope="row" className={`${TD} text-left font-medium`}>
                  {f.nombre}
                </th>
                <td className={TD}>{f.detalle}</td>
                <td className={TD}>{f.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul aria-label={caption} className="grid gap-4 sm:hidden">
        {filas.map((f) => (
          <li key={f.id} className="grid gap-1 border-t border-line pt-3">
            <strong>{f.nombre}</strong>
            <span>{f.detalle}</span>
            <span className="mt-1 w-fit">{f.estado}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
