// Textos de Canales (`/canales`, que hoy lleva al Pasaporte): por qué se abre cada puerta, qué la abre y el refuerzo por
// presencia. Los nombres de las puertas viven en `textos/pasaporte`; los de los planes salen del glosario y los del
// nivel del pase de `textos/sumarte`. "Genesis" es un nombre propio y no se traduce.
import { GLOSARIO } from "../glosario";
import type { Textos } from "../tipos";
import { pasaporte } from "./pasaporte";
import { sumarte } from "./sumarte";

const G = GLOSARIO;

const es = {
  /** Nombres de las 10 puertas, los mismos que muestra el Pasaporte. */
  nombres: pasaporte.es.puertas.nombres,
  planes: { explorador: G.explorador.es, miembro: G.miembro.es },
  pases: sumarte.es.niveles,
  /** Por qué está abierta una puerta. */
  motivos: {
    plan: "por tu plan",
    pase: "por tu pase",
    tribu: "por tu tribu",
    presencia: "por tu presencia",
    rol: "por tu rol",
  },
  /** Qué abre una puerta, por columna de la tabla de permisos. */
  columnas: {
    explorador: `plan ${G.explorador.es}`,
    miembro: `plan ${G.miembro.es}`,
    pase: G.paseFundador.es,
    tribu: "ser aceptado en una tribu",
    presencia: "presencia Genesis",
    residente: "ser residente",
  },
  otraTribu: "ser aceptado en otra tribu",
  comoVisita: " (como visita)",
  /** Une las dos últimas opciones: "A, B o C". */
  o: " o ",
  /** "Refuerzo por presencia: a decidir". El valor nunca es un número. */
  refuerzo: (valor: string) => `Refuerzo por presencia: ${valor}`,
  aDecidir: "a decidir",
};

const en: Textos<typeof es> = {
  nombres: pasaporte.en.puertas.nombres,
  planes: { explorador: G.explorador.en, miembro: G.miembro.en },
  pases: sumarte.en.niveles,
  motivos: {
    plan: "because of your plan",
    pase: "because of your pass",
    tribu: "because of your tribe",
    presencia: "because of your presence",
    rol: "because of your role",
  },
  columnas: {
    explorador: `${G.explorador.en} plan`,
    miembro: `${G.miembro.en} plan`,
    pase: G.paseFundador.en,
    tribu: "being accepted into a tribe",
    presencia: "Genesis presence",
    residente: "being a resident",
  },
  otraTribu: "being accepted into another tribe",
  comoVisita: " (as a visitor)",
  o: " or ",
  refuerzo: (valor: string) => `Presence boost: ${valor}`,
  aDecidir: "to be decided",
};

export const canales = { es, en };
