import type { ComponentType } from "react";
import type { Decision } from "@/lib/fogon/datos";
import type { ContextoLente, LentePura } from "@/lib/gobernanza/lentes";

/** Lo que recibe el panel de cualquier lente. */
export type PropsPanel = {
  ctx: ContextoLente;
  /** Hace zoom a un nodo. Por defecto deja elegida a la persona que estaba elegida. */
  enfocar: (id: string) => void;
  /** Elige un nodo hoja (una persona, un lugar) o limpia la elección con null. */
  seleccionar: (id: string | null) => void;
  /** Las decisiones que lista la lente Decisiones (ejemplos y copias del navegador). */
  decisiones: readonly Decision[];
  elegirDecision: (id: string | null) => void;
};

/** Una lente de la página: la parte pura (lib) más el panel (React). */
export type Lente = LentePura & { panel: ComponentType<PropsPanel> };
