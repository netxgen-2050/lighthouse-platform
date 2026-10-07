import Link from "next/link";
import { EstadoAdministrativo } from "@/components/estado-administrativo";
import { SelloTribu } from "@/components/sello-tribu";
import { accionesDeLote } from "@/lib/legal/estado-administrativo";
import { TerminoLegal } from "@/components/termino-legal";
import {
  TEXTO_ESTADO_FINCA,
  buscarElemento,
  contarTribusPorEstado,
  macrolote7,
  textoHectareas,
  textoSuperficieM2,
  tribuDeBarrio,
} from "@/lib/territorios/biopueblo";
import { TEXTO_COMUN, descripcionDeLugar, nombreDeLugar } from "@/lib/territorios/textos";
import { TEXTO_ESTADO } from "@/lib/tribus/tipos";

type Props = {
  seleccion: string | null;
  consultas: string[];
  alConsultar: (id: string) => void;
};

const boton =
  "w-fit rounded-lg bg-deep px-4 py-1.5 text-on-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

export function FichaLateral({ seleccion, consultas, alConsultar }: Props) {
  const el = seleccion ? buscarElemento(seleccion) : undefined;

  if (el?.tipo === "barrio") {
    const t = tribuDeBarrio(el);
    if (!t) return <p>Barrio {el.barrio}: sin dato</p>;
    const vacante = t.estado === "vacante";
    return (
      <div className="grid gap-3">
        <div className="flex items-center gap-3">
          <SelloTribu iniciales={t.iniciales} estado={t.estado} />
          <div>
            <p className="text-sm text-muted">Barrio {el.barrio}</p>
            <h2 className="text-xl font-semibold">{vacante ? `Barrio ${el.barrio} busca tribu` : t.nombre}</h2>
          </div>
        </div>
        <p>{t.foco}</p>
        <p className="text-sm font-medium">Estado: {TEXTO_ESTADO[t.estado]}</p>
        <p className="text-sm">
          <strong>Hogares:</strong> {t.hogares}
        </p>
        {t.busca.length > 0 && (
          <div className="text-sm">
            <strong>{vacante ? "Qué necesita:" : "Qué busca:"}</strong>
            <ul className="list-disc pl-5">
              {t.busca.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        )}
        <Link href={`/tribus/${t.id}`} className={boton}>
          Conocer la tribu
        </Link>
      </div>
    );
  }

  if (el?.tipo === "comun") {
    return (
      <div className="grid gap-3">
        <h2 className="text-xl font-semibold">{el.nombre}</h2>
        <p className="text-sm">
          <strong>Superficie:</strong> {textoHectareas(el.areaHa)}
        </p>
        <p className="text-sm">
          <strong>Para qué se usa:</strong> {TEXTO_COMUN.para}
        </p>
        <p className="text-sm">
          <strong>Quién lo cuida:</strong> {TEXTO_COMUN.cuida}
        </p>
        <p className="text-sm text-muted">Ubicación ilustrativa hasta el masterplan.</p>
      </div>
    );
  }

  if (el?.tipo === "finca") {
    const disponible = el.estado === "disponible";
    const enviada = consultas.includes(el.id);
    const acciones = accionesDeLote("soluna");
    return (
      <div className="grid gap-3">
        <p className="text-sm text-muted">Chacras de Soluna</p>
        <h2 className="text-xl font-semibold">Finca {el.numero ?? "sin número"}</h2>
        <p className="text-sm">
          <strong>Superficie:</strong> {textoSuperficieM2(el.superficieM2)}
        </p>
        <p className="text-sm font-medium">Estado: {el.estado ? TEXTO_ESTADO_FINCA[el.estado] : "sin dato"}</p>
        <EstadoAdministrativo proyecto="soluna" compacto />
        {disponible && (
          <>
            {acciones.includes("consultar") &&
              (enviada ? (
                <p role="status" className="font-medium">
                  Consulta enviada (simulado)
                </p>
              ) : (
                <button type="button" onClick={() => alConsultar(el.id)} className={boton}>
                  Consultar por este lote
                </button>
              ))}
            <p className="text-sm text-muted">
              NetX actúa como agencia: la compra es privada entre las partes.
              <TerminoLegal clave="agencia" />
            </p>
          </>
        )}
      </div>
    );
  }

  if (el?.tipo === "lugar") {
    return (
      <div className="grid gap-3">
        <p className="text-sm text-muted">Lugar de interés</p>
        <h2 className="text-xl font-semibold">{nombreDeLugar(el.id, el.nombre)}</h2>
        <p className="text-sm">{descripcionDeLugar(el.id)}</p>
      </div>
    );
  }

  const conteo = contarTribusPorEstado();
  const cifras = [
    { etiqueta: "Activas", valor: conteo.activa },
    { etiqueta: "En formación", valor: conteo.formacion },
    { etiqueta: "Vacantes", valor: conteo.vacante },
  ];
  return (
    <div className="grid gap-3">
      <h2 className="text-xl font-semibold">{macrolote7().nombre}</h2>
      <p className="text-sm">
        Unas {textoHectareas(macrolote7().areaHa)} donde viven las 12 comunidades del Lighthouse. Al lado, las Chacras de Soluna,
        con lotes que se ofrecen a privados.
      </p>
      <p className="text-sm text-muted">Elegí un barrio, el terreno común o una finca en el mapa o en la lista.</p>
      <h3 className="font-semibold">Tribus del territorio</h3>
      <dl className="grid grid-cols-3 gap-2">
        {cifras.map((c) => (
          <div key={c.etiqueta} className="grid gap-1 rounded-lg border border-faint bg-surface-2 p-2">
            <dt className="text-sm text-muted">{c.etiqueta}</dt>
            <dd className="text-2xl font-semibold">{c.valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
