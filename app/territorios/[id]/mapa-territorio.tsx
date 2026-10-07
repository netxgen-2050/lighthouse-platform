import { geometriaDe } from "@/lib/territorios/geometria";
import { TEXTO_ESTADO } from "@/lib/tribus/tipos";
import type { Tribu } from "@/lib/tribus/tipos";
import MapaCliente from "./mapa-cliente";

const LEYENDA = [
  { clase: "mapa-leyenda-activa", texto: "Tribu activa" },
  { clase: "mapa-leyenda-formacion", texto: "En formación" },
  { clase: "mapa-leyenda-vacante", texto: "Busca tribu" },
  { clase: "mapa-leyenda-nucleo", texto: "Núcleo común" },
];

export function MapaTerritorio({ territorioId, nombre, tribus }: { territorioId: string; nombre: string; tribus: Tribu[] }) {
  const geometria = geometriaDe(territorioId);
  if (!geometria) {
    return <p className="mt-6 text-sm text-muted">Mapa: sin dato</p>;
  }

  const sellos = tribus
    .filter((t) => geometria.barrios[t.barrio])
    .map((t) => ({
      barrio: t.barrio,
      tribuId: t.id,
      nombre: t.nombre,
      iniciales: t.iniciales,
      estado: t.estado,
      textoEstado: TEXTO_ESTADO[t.estado],
      poligono: geometria.barrios[t.barrio],
    }));

  return (
    <section aria-labelledby="mapa-titulo" className="mt-6 grid gap-3">
      <h2 id="mapa-titulo" className="text-xl font-semibold">
        Mapa del {nombre}
      </h2>
      <MapaCliente contorno={geometria.contorno} nucleo={geometria.nucleo} sellos={sellos} />
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {LEYENDA.map((l) => (
          <li key={l.texto} className="flex items-center gap-2">
            <span aria-hidden="true" className={`mapa-leyenda ${l.clase}`} />
            {l.texto}
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted">Ubicación, forma y barrios ilustrativos, a la espera del GIS de ARQVA.</p>
      <p className="text-sm text-muted">
        Mapa base:{" "}
        <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
          © colaboradores de OpenStreetMap
        </a>
      </p>
    </section>
  );
}
