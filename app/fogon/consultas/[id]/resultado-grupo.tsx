import { Donut } from "@/components/donut";
import { costoReparto, ordenar, porcentajes, repartirPresupuesto, TEXTO_AVISO } from "@/lib/cuadratico/motor";
import { fechaCierre, formatoPlata, textoCuandoSeVe } from "@/lib/fogon/consultas/reglas";
import { textoVotos, votosDe } from "@/lib/fogon/consultas/reparto";
import type { PadronVista, VistaConsulta } from "@/lib/fogon/consultas/tipos";

// Todo esto solo dibuja lo que trae el repositorio: nunca decide qué se puede ver (eso lo decide la fuente de datos).

const CAJA = "grid gap-3 rounded-xl border border-faint bg-surface p-4";

function textoPersonas(n: number): string {
  return n === 1 ? "1 persona" : `${n} personas`;
}

function textoParticipantes(p: { repartieron: number; padron: number } | null): string {
  return p ? `${p.repartieron} de ${p.padron} personas ya repartieron` : "Personas que repartieron: sin dato";
}

/** Filas del resultado ordenadas, con porcentaje, monto y apoyo; se usa en la pantalla y en el acta. */
function filasDelResultado(vista: VistaConsulta) {
  const { consulta, resultado } = vista;
  if (!resultado.visible) return null;
  const etiqueta = Object.fromEntries(consulta.opciones.map((o) => [o.id, o.etiqueta]));
  const pct = porcentajes(resultado.agregado);
  const plata =
    consulta.modo === "presupuesto" && consulta.presupuesto
      ? repartirPresupuesto({
          montoCentavos: consulta.presupuesto.montoCentavos,
          opciones: consulta.opciones.map((o) => ({
            id: o.id,
            peso: Math.max(0, resultado.agregado.find((f) => f.opcion === o.id)?.neto ?? 0),
            topeCentavos: o.topeCentavos,
            pisoCentavos: o.pisoCentavos,
          })),
        })
      : null;
  return {
    pct,
    plata,
    filas: ordenar(resultado.agregado).map((f) => ({
      ...f,
      etiqueta: etiqueta[f.opcion],
      pct: pct ? pct[f.opcion] : null,
      monto: plata ? plata.partes[f.opcion] : undefined,
    })),
  };
}

export function ResultadoDelGrupo({ vista }: { vista: VistaConsulta }) {
  const { consulta, resultado, miReparto } = vista;
  const calculo = filasDelResultado(vista);
  return (
    <section aria-labelledby="h-resultado" className={CAJA}>
      <h2 id="h-resultado" className="font-semibold">Resultado del grupo</h2>
      {!resultado.visible || !calculo ? (
        <p>
          {textoCuandoSeVe(consulta)}. {textoParticipantes(resultado.participantes)}.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted">
            {resultado.participantes
              ? `${resultado.participantes.repartieron} de ${resultado.participantes.padron} personas repartieron.`
              : "Personas que repartieron: sin dato."}{" "}
            El grupo suma votos, no créditos.
          </p>
          <Donut
            titulo="Votos del grupo"
            porciones={calculo.filas.map((f) => ({ id: f.opcion, etiqueta: f.etiqueta, valor: Math.max(0, f.neto) }))}
            formatoValor={(n) => textoVotos(n)}
          />
          {calculo.pct === null && <p>Votos del grupo: sin dato</p>}
          <ol className="grid gap-3">
            {calculo.filas.map((f) => (
              <li key={f.opcion} className="grid gap-1">
                <p className="flex flex-wrap justify-between gap-x-3 font-medium">
                  <span>{f.etiqueta}</span>
                  <span>
                    {textoVotos(f.neto)} · {f.pct === null ? "sin dato" : `${f.pct} %`}
                  </span>
                </p>
                <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full bg-green" style={{ width: `${f.pct ?? 0}%` }} />
                </div>
                <p className="flex flex-wrap gap-x-4 text-sm text-muted">
                  <span>{f.apoyos === 1 ? "1 persona la apoyó" : `${f.apoyos} personas la apoyaron`}</span>
                  {f.enContra > 0 && <span>{textoPersonas(f.enContra)} en contra</span>}
                  {f.monto !== undefined && consulta.presupuesto && (
                    <span>Monto: {formatoPlata(f.monto, consulta.presupuesto.moneda)}</span>
                  )}
                  {miReparto && (
                    <span className="font-medium text-deep">
                      <span aria-hidden="true">● </span>Tu voto: {textoVotos(votosDe(miReparto, f.opcion))}
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ol>
          {calculo.plata && consulta.presupuesto && (
            <div className="grid gap-1 text-sm">
              <p>
                Sin asignar: {formatoPlata(calculo.plata.sinAsignar, consulta.presupuesto.moneda)}
              </p>
              {calculo.plata.avisos.map((a) => (
                <p key={a} role="note">{TEXTO_AVISO[a]}</p>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

/** "Cómo repartió cada persona": solo llega con voto abierto y resultado visible. */
export function TablaDeRepartos({ vista }: { vista: VistaConsulta }) {
  const repartos = vista.padron?.repartos;
  if (!repartos) return null;
  const { consulta } = vista;
  return (
    <section aria-labelledby="h-repartos" className={CAJA}>
      <h2 id="h-repartos" className="font-semibold">Quién repartió cómo</h2>
      <div
        role="region"
        tabIndex={0}
        aria-label="Cómo repartió cada persona (se desplaza hacia los costados)"
        className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
      >
        <table className="w-full min-w-max text-left text-sm">
          <caption className="mb-2 text-left font-medium">Cómo repartió cada persona</caption>
          <thead>
            <tr>
              <th scope="col" className="pr-4">Persona</th>
              {consulta.opciones.map((o) => (
                <th key={o.id} scope="col" className="pr-4">{o.etiqueta}</th>
              ))}
              <th scope="col">Créditos usados</th>
            </tr>
          </thead>
          <tbody>
            {repartos.map(({ persona, reparto, propio }) => (
              <tr key={persona.id}>
                <th scope="row" className={`pr-4 ${propio ? "font-semibold" : "font-normal"}`}>
                  {propio && persona.nombre !== "Vos" ? `${persona.nombre} · Vos` : persona.nombre}
                </th>
                {consulta.opciones.map((o) => (
                  <td key={o.id} className="pr-4">{votosDe(reparto, o.id)}</td>
                ))}
                <td>{costoReparto(reparto)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** "Faltan votar" (o "No repartieron" si ya cerró); solo con voto abierto. */
export function QuienFalta({ padron, cerrada }: { padron: PadronVista; cerrada: boolean }) {
  const titulo = cerrada ? "No repartieron" : "Faltan votar";
  return (
    <section aria-labelledby="h-faltan" className={CAJA}>
      <h2 id="h-faltan" className="font-semibold">{titulo}</h2>
      {padron.faltan.length === 0 && padron.sinAceptar === 0 ? (
        <p>Ya repartió todo el padrón</p>
      ) : (
        <>
          {padron.faltan.length > 0 && (
            <ul className="list-disc pl-5">
              {padron.faltan.map((p) => (
                <li key={p.id}>{p.nombre}</li>
              ))}
            </ul>
          )}
          {padron.sinAceptar > 0 && (
            <p className="text-sm text-muted">
              y {padron.sinAceptar === 1 ? "1 persona del padrón que todavía no entró" : `${padron.sinAceptar} personas del padrón que todavía no entraron`}
            </p>
          )}
        </>
      )}
    </section>
  );
}

/** Acta de ejemplo de una consulta cerrada. */
export function Acta({ vista }: { vista: VistaConsulta }) {
  const { consulta, resultado, cierreManual } = vista;
  const calculo = filasDelResultado(vista);
  return (
    <section aria-labelledby="h-acta" className={CAJA}>
      <h2 id="h-acta" className="font-semibold">Acta (ejemplo)</h2>
      <dl className="grid gap-1 text-sm sm:grid-cols-[10rem_1fr]">
        <dt className="font-medium">Consulta</dt>
        <dd>{consulta.titulo}</dd>
        <dt className="font-medium">Cierre</dt>
        <dd>{cierreManual ? "Cerrada a mano (simulado)" : fechaCierre(consulta)}</dd>
        <dt className="font-medium">Regla</dt>
        <dd>Voto cuadrático, 100 créditos por persona</dd>
        <dt className="font-medium">Participantes</dt>
        <dd>
          {resultado.participantes
            ? `${resultado.participantes.repartieron} de ${resultado.participantes.padron} personas`
            : "sin dato"}
        </dd>
        <dt className="font-medium">Resultado</dt>
        <dd>
          {calculo ? (
            <ol className="list-decimal pl-5">
              {calculo.filas.map((f) => (
                <li key={f.opcion}>
                  {f.etiqueta} · {textoVotos(f.neto)} · {f.pct === null ? "sin dato" : `${f.pct} %`}
                  {f.monto !== undefined && consulta.presupuesto && ` · ${formatoPlata(f.monto, consulta.presupuesto.moneda)}`}
                </li>
              ))}
            </ol>
          ) : (
            "sin dato"
          )}
        </dd>
      </dl>
      <p className="text-sm">
        El resultado es consultivo: no reemplaza las decisiones que reservan el contrato o el estatuto.
      </p>
    </section>
  );
}
