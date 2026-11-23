"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { canalAlEntrar, registrarConsentimiento } from "@/lib/privacidad/consentimiento";
import { fechaYHora } from "@/lib/privacidad/fecha";
import { leerNovedades, registrarEleccionNovedades } from "@/lib/privacidad/novedades";
import { useConsentimiento } from "@/lib/privacidad/usar-consentimiento";
import { CLAVE_PENDIENTE_HORA, leerPendiente, renovarPendiente } from "@/lib/sesion/nivel";
import {
  BloqueConsentimiento,
  enfocarPrimeraSinMarcar,
  SIN_MARCAR,
  TEXTO_ERROR_CASILLAS,
  type ValorConsentimiento,
} from "./bloque-consentimiento";
import { useSesion } from "./contexto";
import { QueCambio } from "./que-cambio";

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON_PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const BOTON_SECUNDARIO = `${BOTON} border border-faint hover:bg-surface-2`;

/**
 * Pantalla de consentimiento: red de seguridad cuando hay una sesión sin aceptación vigente registrada (la aceptación del paso
 * venció, Privy restauró una sesión, el login terminó en otra pestaña o cambió la versión de la política). Aparece en cualquier
 * página menos `/privacidad`. Sin aceptar las dos casillas la persona sigue anónima.
 */
export function PantallaConsentimiento() {
  const { sesion, salir } = useSesion();
  const idPersona = sesion?.idPersona ?? "";
  const { registro } = useConsentimiento(sesion?.idPersona ?? null);
  const [valor, setValor] = useState<ValorConsentimiento>(SIN_MARCAR);
  const [error, setError] = useState<string | null>(null);
  const refPolitica = useRef<HTMLInputElement>(null);
  const refTerminos = useRef<HTMLInputElement>(null);
  // La casilla de novedades solo se ofrece si la persona todavía no decidió (se mira una sola vez, al montar).
  const [ofrecerNovedades] = useState(() => {
    try {
      return leerNovedades(window.localStorage, idPersona) === null;
    } catch {
      return true;
    }
  });
  // ¿Había un plan elegido en Sumarte todavía vigente cuando apareció esta pantalla? (se mira una sola vez, al montar)
  const [pedidoVigenteAlLlegar] = useState(() => {
    try {
      return leerPendiente(window.sessionStorage).length > 0;
    } catch {
      return false;
    }
  });

  function aceptar() {
    if (!valor.politica || !valor.terminos) {
      setError(TEXTO_ERROR_CASILLAS);
      enfocarPrimeraSinMarcar(valor, refPolitica, refTerminos);
      return;
    }
    // El plan elegido en Sumarte espera esta pantalla: si estaba vigente al llegar, se renueva su plazo (antes de registrar,
    // que destraba Sumarte) para que no venza mientras la persona leía. Un pedido que ya había vencido no se revive.
    let horaPrevia: string | null = null;
    let renovado = false;
    if (pedidoVigenteAlLlegar) {
      try {
        horaPrevia = window.sessionStorage.getItem(CLAVE_PENDIENTE_HORA);
        renovarPendiente(window.sessionStorage);
        renovado = true;
      } catch {
        // Sin almacenamiento de la pestaña no hay pedido pendiente.
      }
    }
    const canal = canalAlEntrar(registro);
    let guardado = false;
    try {
      guardado = registrarConsentimiento(window.localStorage, idPersona, valor, { canal });
    } catch {
      guardado = false;
    }
    if (!guardado) {
      // No se registró nada: el pedido queda como estaba.
      if (renovado) {
        try {
          if (horaPrevia === null) window.sessionStorage.removeItem(CLAVE_PENDIENTE_HORA);
          else window.sessionStorage.setItem(CLAVE_PENDIENTE_HORA, horaPrevia);
        } catch {
          // Sin almacenamiento de la pestaña no hay nada que restaurar.
        }
      }
      setError("Error: tu navegador no permite guardar datos en este sitio, así que no podemos registrar tu consentimiento. Revisá la configuración de privacidad o probá en otro navegador.");
      return;
    }
    // Sin marcar también es una decisión: queda registrada para no volver a ofrecer la casilla (design §9).
    if (ofrecerNovedades) {
      try {
        registrarEleccionNovedades(window.localStorage, idPersona, valor.novedades, { canal });
      } catch {
        // Sin almacenamiento no queda registro de la elección: se vuelve a ofrecer.
      }
    }
    setError(null);
  }

  return (
    <div className="mx-auto max-w-2xl p-6 sm:p-10">
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <h1 className="text-2xl font-semibold">Antes de seguir: tu privacidad</h1>
      {registro ? (
        <div role="status" className="mt-3 rounded-lg border border-gold-ink bg-gold-soft px-4 py-3 text-sm">
          <p className="font-medium">
            Cambió la política de privacidad desde la última vez que la aceptaste. Leé el resumen y volvé a aceptarla para seguir.
          </p>
          <p className="mt-1">
            Aceptaste la versión {registro.version} el {fechaYHora(registro.aceptadoEn)}.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-muted">
          Para usar la plataforma con tu cuenta necesitamos tu consentimiento. Esto es lo principal, en palabras simples.
        </p>
      )}
      {registro && <QueCambio />}
      <p className="mt-2 text-sm font-medium text-warn-ink">Borrador: los textos legales los revisa un abogado antes de cualquier uso real.</p>
      {registro && (
        <p className="mt-2 text-sm">
          <Link className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep" href="/privacidad">
            Leer la política completa
          </Link>
        </p>
      )}

      <form
        noValidate
        onSubmit={(ev) => {
          ev.preventDefault();
          aceptar();
        }}
      >
        <BloqueConsentimiento
          valor={valor}
          alCambiar={setValor}
          error={error}
          refPolitica={refPolitica}
          refTerminos={refTerminos}
          mostrarNovedades={ofrecerNovedades}
        />
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="submit" className={BOTON_PRIMARIO}>
            Aceptar y continuar
          </button>
          <button type="button" className={BOTON_SECUNDARIO} onClick={() => void salir()}>
            No acepto, salir
          </button>
        </div>
        <p className="mt-3 text-sm text-muted">
          Si no aceptás, podés seguir mirando las páginas públicas de Descubrir (el mapa, las tribus) sin cuenta.
        </p>
      </form>
    </div>
  );
}
