import type { Metadata } from "next";
import { metadataVitrina, Vitrina, type ParametrosVitrina } from "./vitrina";

type Props = { searchParams: Promise<ParametrosVitrina> };

export async function generateMetadata(): Promise<Metadata> {
  return metadataVitrina("es");
}

/** La vitrina del Congreso en español. La versión en inglés vive en `/congreso/en`. */
export default async function CongresoPage({ searchParams }: Props) {
  return <Vitrina idioma="es" parametros={await searchParams} />;
}
