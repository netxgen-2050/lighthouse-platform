import { describe, expect, it } from "vitest";
import type { EstadoSesion } from "@/components/sesion/contexto";
import type { Nivel } from "@/lib/permisos/niveles";
import type { EstadoConsentimiento } from "@/lib/privacidad/usar-consentimiento";
import { queMostrarEnTicket, type QueMostrarEnTicket } from "./mostrar-ticket";

type Fila = [EstadoSesion, Nivel, boolean, EstadoConsentimiento, QueMostrarEnTicket];

// Una fila por caso de la tabla de design §11.
const FILAS: Fila[] = [
  ["cargando", "sin-cuenta", false, "cargando", "nada"],
  ["sin-sesion", "sin-cuenta", true, "cargando", "sumate"],
  ["ok", "sin-cuenta", true, "cargando", "sumate"],
  ["ok", "explorador", true, "pendiente", "politica"],
  ["ok", "explorador", true, "vigente", "formulario"],
  ["ok", "miembro", true, "vigente", "formulario"],
  ["ok", "superadmin", true, "vigente", "formulario"],
  ["ok", "explorador", false, "vigente", "nada"],
  ["ok", "explorador", false, "pendiente", "nada"],
  ["ok", "explorador", true, "cargando", "nada"],
  ["sin-acceso", "sin-cuenta", true, "cargando", "nada"],
  ["error", "sin-cuenta", true, "cargando", "nada"],
  ["sin-acceso", "explorador", true, "vigente", "nada"],
  ["error", "explorador", true, "vigente", "nada"],
];

describe("queMostrarEnTicket", () => {
  it.each(FILAS)("%s · %s · nivelListo=%s · %s → %s", (estado, nivel, listo, consentimiento, esperado) => {
    expect(queMostrarEnTicket(estado, nivel, listo, consentimiento)).toBe(esperado);
  });

  it("el formulario solo sale de una combinación: sesión ok, nivel leído y suficiente, política vigente", () => {
    const estados: EstadoSesion[] = ["cargando", "sin-sesion", "sin-acceso", "error", "ok"];
    const niveles: Nivel[] = ["sin-cuenta", "explorador", "miembro", "fundador", "lider", "superadmin"];
    const consentimientos: EstadoConsentimiento[] = ["cargando", "pendiente", "vigente"];
    for (const e of estados)
      for (const n of niveles)
        for (const l of [true, false])
          for (const c of consentimientos) {
            const sale = queMostrarEnTicket(e, n, l, c) === "formulario";
            const debe = e === "ok" && l && n !== "sin-cuenta" && c === "vigente";
            expect(sale).toBe(debe);
          }
  });
});
