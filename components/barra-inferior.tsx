import { destinosDeGrupo, destinosDeLaBarra, destinosDeMas, etiquetaDeDestino, type Destino } from "@/lib/navegacion";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { BarraInferiorCliente } from "./barra-inferior-cliente";

/**
 * Barra inferior del celular (ux-celular). Server component, como el rail: toma los destinos que existen y pasa íconos ya
 * renderizados al cliente. Qué va en la barra y qué en Más lo decide `barra` en `lib/navegacion.ts`.
 */
export async function BarraInferior() {
  const idioma = await idiomaDelPedido();
  const t = textos("marco", idioma);
  const item = (d: Destino, tamano: number) => ({
    href: d.href,
    etiqueta: etiquetaDeDestino(d, idioma),
    icono: <d.icono aria-hidden="true" size={tamano} />,
    secciones: d.secciones,
  });
  const interno = destinosDeGrupo("interno");
  const netx = interno.find((d) => d.clave === "netx");
  const admin = interno.find((d) => d.clave === "admin");
  return (
    <BarraInferiorCliente
      barra={destinosDeLaBarra().map((d) => item(d, 22))}
      mas={destinosDeMas().map((d) => item(d, 20))}
      persona={destinosDeGrupo("persona").map((d) => item(d, 20))}
      netx={netx && item(netx, 20)}
      admin={admin && item(admin, 20)}
      etiquetaNavegacion={t.rail.navegacion}
    />
  );
}
