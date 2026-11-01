// La regla de adhesión para participar en la gobernanza (cambio `manifiesto-lighthouse-vrn`, ADR-023).
//
// Es PURA a propósito: recibe lo que la persona adhirió como dato y no lee nada de la pantalla ni del almacenamiento
// de quien mira. Así la misma función sirve hoy en las pantallas y mañana en el servidor, cuando la adhesión esté en
// la base. Toda pantalla de gobernanza (Fogón, consultas, y las propuestas que vengan) usa SOLO esta función.
import { VERSION_MANIFIESTO_VRN } from "@/lib/manifiestos/lighthouse-vrn";
import { COMUNIDAD_LIGHTHOUSE, estadoDe, type Membresias } from "@/lib/membresia/estado";
import { versionAdheridaDe, type VersionesAdheridas } from "@/lib/membresia/versiones";

/**
 * ¿Adhirió al manifiesto de Lighthouse VRN, en su versión vigente? "Pedido" cuenta: la adhesión vale desde que la
 * persona adhiere (decisión de Gus, 29-oct-2026); la aceptación del común sigue simulada. Si el manifiesto cambió de
 * versión desde que adhirió (o no hay versión anotada), tiene que volver a adherir.
 */
export function adhirioAlManifiestoVrn(
  m: Membresias,
  versiones: VersionesAdheridas,
  versionVigente: string = VERSION_MANIFIESTO_VRN,
): boolean {
  if (estadoDe(m, COMUNIDAD_LIGHTHOUSE) === "no-miembro") return false;
  return versionAdheridaDe(versiones, COMUNIDAD_LIGHTHOUSE) === versionVigente;
}

/** ¿Puede participar en cualquier aspecto de la gobernanza (votar, repartir créditos, llevar al consejo…)? */
export function puedeParticiparEnGobernanza(
  m: Membresias,
  versiones: VersionesAdheridas,
  versionVigente: string = VERSION_MANIFIESTO_VRN,
): boolean {
  return adhirioAlManifiestoVrn(m, versiones, versionVigente);
}

/** ¿Adhirió alguna vez pero a una versión anterior? Sirve para decirle "el manifiesto cambió: volvé a adherir". */
export function adhesionDesactualizada(
  m: Membresias,
  versiones: VersionesAdheridas,
  versionVigente: string = VERSION_MANIFIESTO_VRN,
): boolean {
  return estadoDe(m, COMUNIDAD_LIGHTHOUSE) !== "no-miembro" && !adhirioAlManifiestoVrn(m, versiones, versionVigente);
}
