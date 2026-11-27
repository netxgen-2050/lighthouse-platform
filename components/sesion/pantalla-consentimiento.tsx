"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { aceptarEnServidor, canalAlEntrar, TEXTO_FALLO_GUARDAR } from "@/lib/privacidad/consentimiento";
import { fechaYHora } from "@/lib/privacidad/fecha";
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
 * Pantalla de consentimiento: el camino normal de la primera vez que alguien entra por "Entrar" (casillas-una-sola-vez), y
 * también la red de seguridad cuando hay una sesión sin aceptación vigente registrada (la aceptación del paso venció, Privy
 * restauró una sesión, el login terminó en otra pestaña, retiró el consentimiento o cambió la versión de la política). Aparece
 * en cualquier página menos `/privacidad`. Sin aceptar las dos casillas la persona sigue anónima.
 */
export function PantallaConsentimiento() {
  const { sesion, salir, cabeceras, detalleConsentimiento, falloAceptacionPrevia } = useSesion();
  const idPersona = sesion?.idPersona ?? "";
  const { registro } = detalleConsentimiento;
  const [valor, setValor] = useState<ValorConsentimiento>(SIN_MARCAR);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const refPolitica = useRef<HTMLInputElement>(null);
  const refTerminos = useRef<HTMLInputElement>(null);
  // La casilla de novedades solo se ofrece si la persona todavía no decidió (se mira una sola vez, al montar; el estado ya
  // viene del servidor porque esta pantalla no se dibuja mientras se lee).
  const [ofrecerNovedades] = useState(() => detalleConsentimiento.novedades === null);
  // ¿Había un plan elegido en Sumarte todavía vigente cuando apareció esta pantalla? (se mira una sola vez, al montar)
  const [pedidoVigenteAlLlegar] = useState(() => {
    try {
      return leerPendiente(window.sessionStorage).length > 0;
    } catch {
      return false;
    }
  });

  async function aceptar() {
    if (enviando) return;
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
    setEnviando(true);
    // Una sola llamada: el servidor registra el general y, con la casilla a la vista, la elección de novedades (sin marcar
    // también es una decisión, design §9). La persona pasa a activa recién con su confirmación.
    const estado = await aceptarEnServidor(cabeceras, idPersona, { canal, novedades: ofrecerNovedades ? valor.novedades : undefined });
    setEnviando(false);
    if (estado === null) {
      // No se registró nada: la persona sigue anónima, las casillas siguen marcadas y el pedido queda como estaba.
      if (renovado) {
        try {
          if (horaPrevia === null) window.sessionStorage.removeItem(CLAVE_PENDIENTE_HORA);
          else window.sessionStorage.setItem(CLAVE_PENDIENTE_HORA, horaPrevia);
        } catch {
          // Sin almacenamiento de la pestaña no hay nada que restaurar.
        }
      }
      setError(TEXTO_FALLO_GUARDAR);
      return;
    }
    setError(null);
  }

  return (
    <div className="mx-auto max-w-2xl p-6 sm:p-10">
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
          void aceptar();
        }}
      >
        <BloqueConsentimiento
          valor={valor}
          alCambiar={setValor}
          error={error ?? (falloAceptacionPrevia ? TEXTO_FALLO_GUARDAR : null)}
          refPolitica={refPolitica}
          refTerminos={refTerminos}
          mostrarNovedades={ofrecerNovedades}
        />
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="submit" disabled={enviando} className={`${BOTON_PRIMARIO} disabled:opacity-70`}>
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
