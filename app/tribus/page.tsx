import { redirect } from "next/navigation";

// `/tribus` pasó a `/participa` (spec participa-mapa-equipos): "Equipos" es la pestaña por defecto y "Visión" es `?ver=vision`.
// Las fichas `/tribus/[id]` siguen en su dirección.
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function TribusPage({ searchParams }: Props) {
  const ver = (await searchParams).ver;
  const primero = Array.isArray(ver) ? ver[0] : ver;
  redirect(primero === "tribus" ? "/participa?ver=vision" : "/participa");
}
