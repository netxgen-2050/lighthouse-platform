import { RepositorioNavegador } from "./navegador";
import type { RepositorioConsultas } from "./repositorio";

/**
 * De dónde salen las consultas. Hoy, del navegador (datos de ejemplo y el reparto propio en localStorage);
 * `fogon-cuadratico-en-la-base` cambia solo esta línea. Las pantallas leen y escriben únicamente por acá.
 */
export function repositorioConsultas(): RepositorioConsultas {
  return new RepositorioNavegador();
}
