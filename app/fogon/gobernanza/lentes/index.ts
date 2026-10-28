// El registro de lentes de la página: cada lente pura (lib) más su panel. Sumar una lente es agregar una entrada acá
// (y sus textos al diccionario de la gobernanza); nada más se toca.
import { decisiones, desdeMi, estructura, propositos } from "@/lib/gobernanza/lentes";
import { PanelDecisiones } from "./panel-decisiones";
import { PanelDesdeMi } from "./panel-desde-mi";
import { PanelDetalle } from "./panel-detalle";
import type { Lente } from "./tipos";

export const LENTES: readonly Lente[] = [
  { ...estructura, panel: PanelDetalle },
  { ...propositos, panel: PanelDetalle },
  { ...decisiones, panel: PanelDecisiones },
  { ...desdeMi, panel: PanelDesdeMi },
];
