import type { BilingueConOriginal } from "@/lib/idioma/tipos";

/** Los cuatro tipos de nodo de la estructura: el común es la raíz, las tribus cuelgan de él, los círculos de su tribu. */
export type TipoNodo = "comun" | "tribu" | "circulo" | "consejo";

export type Nodo = {
  tipo: TipoNodo;
  id: string;
  nombre: string;
  /** Del que cuelga: la tribu de un círculo de una sola tribu; el común para las tribus y los círculos transversales. */
  padreId?: string;
};

/**
 * Un círculo de trabajo (holocracia). `tribus` dice en cuáles participa: una sola lo cuelga de esa tribu; varias, o
 * ninguna, lo hacen transversal y cuelga del común (enmienda del 23-oct-2026). `zona` es opcional: si no se sabe, no se inventa.
 */
export type Circulo = {
  id: string;
  nombre: BilingueConOriginal;
  tribus: string[];
  zona?: string;
};

/** Un lugar del consejo. `representante: null` significa "Sin representante elegido": nunca se inventa un nombre. */
export type Lugar = { tribuId: string; representante: string | null };

/**
 * Registro con forma de attestation: quién afirma, sobre quién o qué, a qué registro apunta, cuándo.
 * Se guarda en una lista de solo agregar; "revocado" se calcula (ver `estaRevocado`).
 */
export type Esquema = "valida-tribu" | "valida-persona" | "lleva-al-consejo" | "revoca";

export type Registro = {
  id: string;
  esquema: Esquema;
  afirma: string;
  sobre: string;
  apuntaA: string | null;
  cuando: string;
  datos: Record<string, string>;
};
