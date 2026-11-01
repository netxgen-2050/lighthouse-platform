"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useSesion } from "@/components/sesion/contexto";
import { EnlaceConCuenta, EntrarPara } from "@/components/sesion/entrar-para";
import { EstadoAdministrativo } from "@/components/estado-administrativo";
import { listarFrentes } from "@/lib/equipos/frentes";
import type { Fase } from "@/lib/territorios/fases";
import type { FuentePlanId, VistaId } from "@/lib/territorios/vistas";
import { PedidoContacto } from "@/components/pedido-contacto";
import { SelloTribu } from "@/components/sello-tribu";
import { referenciaDeFinca } from "@/lib/contactos/pedidos";
import type { Pedido } from "@/lib/contactos/tipos";
import { ESTADOS_ADMINISTRATIVOS, accionesDeLote } from "@/lib/legal/estado-administrativo";
import { TerminoLegal } from "@/components/termino-legal";
import { buscarElemento, textoDeEstadoFinca, textoHectareas, textoSuperficieM2, tribuDeBarrio } from "@/lib/territorios/biopueblo";
import { FichaFrente, MARCA_EJEMPLO } from "./vistas/ficha-frente";
import { PANELES, PertenecerAlLighthouse } from "./vistas/paneles";
import { TEXTO_COMUN, descripcionDeLugar, esNombrePropioDeLugar, nombreDeLugar } from "@/lib/territorios/textos";
import { listarTribus, rutaProponerComunidad } from "@/lib/tribus/datos";
import { textoDeEstado } from "@/lib/tribus/tipos";
import { EnEspanol } from "@/components/en-espanol";
import { TextoBilingue } from "@/components/texto-bilingue";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { sinDato } from "@/lib/idioma/formatos";

type Props = {
  seleccion: string | null;
  /** Referencias de las fincas por las que ya hay un pedido en la bandeja. */
  consultas: string[];
  /** Guarda el pedido de contacto. Devuelve false si no se pudo guardar. */
  alConsultar: (pedido: Pedido) => boolean;
  vista: VistaId;
  fase: Fase;
  fuente: FuentePlanId;
  alElegir: (id: string) => void;
};

const boton =
  "w-fit rounded-lg bg-deep px-4 py-1.5 text-on-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

// Botón de consulta y formulario en línea. Se vuelve a crear al cambiar de finca (key).
function ConsultaFinca({
  referencia,
  enviada,
  alConsultar,
}: {
  referencia: string;
  enviada: boolean;
  alConsultar: (pedido: Pedido) => boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const idBoton = `consultar-${useId()}`;
  const estado = ESTADOS_ADMINISTRATIVOS.soluna;
  const { estado: estadoSesion } = useSesion();
  const t = useTextos("territorio").ficha;
  if (estadoSesion !== "ok") return <EntrarPara texto={t.consultarEntrar} clase={boton} />;
  return (
    <div className="grid gap-3">
      {enviada ? (
        <p role="status" className="font-medium">
          {t.consultaEnviada}
        </p>
      ) : (
        <button id={idBoton} type="button" aria-expanded={abierto} onClick={() => setAbierto(true)} className={boton}>
          {t.consultar}
        </button>
      )}
      {abierto && (
        <PedidoContacto
          motivo="consulta-lote"
          referencia={referencia}
          estadoMostrado={`${estado.estado} · ${estado.normaCorta}`}
          aviso={
            <EnEspanol>
              <EstadoAdministrativo proyecto="soluna" compacto />
            </EnEspanol>
          }
          idBoton={idBoton}
          alEnviar={alConsultar}
          alCancelar={() => setAbierto(false)}
        />
      )}
    </div>
  );
}

export function FichaLateral({ seleccion, consultas, alConsultar, vista, fase, fuente, alElegir }: Props) {
  const idioma = useIdioma();
  const tx = useTextos("territorio");
  const t = tx.ficha;
  const nd = sinDato(idioma);
  const el = seleccion ? buscarElemento(seleccion) : undefined;
  const frente = seleccion ? listarFrentes(idioma).find((f) => f.id === seleccion && f.lugar) : undefined;

  if (frente) return <FichaFrente frente={frente} />;

  if (el?.tipo === "barrio") {
    const tribu = tribuDeBarrio(el, listarTribus(idioma));
    if (!tribu) return <p>{t.barrioSinDato(el.barrio, nd)}</p>;
    const vacante = tribu.estado === "vacante";
    return (
      <div className="grid gap-3">
        <div className="flex items-center gap-3">
          <SelloTribu iniciales={tribu.iniciales} estado={tribu.estado} />
          <div>
            <p className="text-sm text-muted">{tx.elegir.barrio(el.barrio)}</p>
            <h2 className="text-xl font-semibold">
              {vacante ? t.barrioBuscaTribu(el.barrio) : <span translate="no">{tribu.nombre}</span>}
            </h2>
          </div>
        </div>
        <p>{tribu.foco}</p>
        <p className={MARCA_EJEMPLO}>{tx.vision.ejemploTribus}</p>
        <p className="text-sm font-medium">{t.estado} {textoDeEstado(tribu.estado, idioma)}</p>
        <p className="text-sm">
          <strong>{t.hogares}</strong> {tribu.hogares}
        </p>
        {tribu.busca.length > 0 && (
          <div className="text-sm">
            <strong>{vacante ? t.queNecesita : t.queBusca}</strong>
            <ul className="list-disc pl-5">
              {tribu.busca.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        )}
        {vacante ? (
          <EnlaceConCuenta href={rutaProponerComunidad(tribu.id)} textoEntrar={t.proponerEntrar} clase={boton}>
            {t.proponer}
          </EnlaceConCuenta>
        ) : (
          <Link href={`/tribus/${tribu.id}`} className={boton}>
            {t.conocerTribu}
          </Link>
        )}
      </div>
    );
  }

  if (el?.tipo === "comun") {
    return (
      <div className="grid gap-3">
        <h2 className="text-xl font-semibold">{idioma === "en" ? tx.marcador.comun : el.nombre}</h2>
        <p className="text-sm">
          <strong>{t.superficie}</strong> {textoHectareas(el.areaHa, idioma)}
        </p>
        <p className="text-sm">
          <strong>{t.paraQueSeUsa}</strong> <TextoBilingue valor={TEXTO_COMUN.para} sinNota />
        </p>
        <p className="text-sm">
          <strong>{t.quienLoCuida}</strong> <TextoBilingue valor={TEXTO_COMUN.cuida} sinNota />
        </p>
        <p className="text-sm text-muted">{t.ubicacionIlustrativa}</p>
      </div>
    );
  }

  if (el?.tipo === "finca") {
    const disponible = el.estado === "disponible";
    const referencia = referenciaDeFinca(el.numero, el.id);
    const acciones = accionesDeLote("soluna");
    return (
      <div className="grid gap-3">
        <p className="text-sm text-muted" translate="no">Chacras de Soluna</p>
        <h2 className="text-xl font-semibold">
          {tx.elegir.finca(el.numero === undefined ? tx.elegir.sinNumero : String(el.numero))}
        </h2>
        <p className="text-sm">
          <strong>{t.superficie}</strong> {textoSuperficieM2(el.superficieM2, idioma)}
        </p>
        <p className="text-sm font-medium">{t.estado} {el.estado ? textoDeEstadoFinca(el.estado, idioma) : nd}</p>
        <EnEspanol>
          <EstadoAdministrativo proyecto="soluna" compacto />
        </EnEspanol>
        {disponible && (
          <>
            {acciones.includes("consultar") && (
              <ConsultaFinca
                key={el.id}
                referencia={referencia}
                enviada={consultas.includes(referencia)}
                alConsultar={alConsultar}
              />
            )}
            <p className="text-sm text-muted">
              {t.agencia}
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
        <p className="text-sm text-muted">{tx.leyenda.lugar}</p>
        <h2 className="text-xl font-semibold">
          <span translate={esNombrePropioDeLugar(el.id) ? "no" : undefined}>
            {nombreDeLugar(el.id, el.nombre, idioma)}
          </span>
        </h2>
        <p className="text-sm">{descripcionDeLugar(el.id, idioma)}</p>
      </div>
    );
  }

  const Panel = PANELES[vista];
  return (
    <div className="grid gap-3">
      <Panel fase={fase} fuente={fuente} alElegir={alElegir} seleccion={seleccion} />
      <PertenecerAlLighthouse />
    </div>
  );
}
