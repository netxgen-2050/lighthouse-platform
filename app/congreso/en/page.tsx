import type { Metadata } from "next";
import { metadataVitrina, Vitrina, type ParametrosVitrina } from "../vitrina";

type Props = { searchParams: Promise<ParametrosVitrina> };

export async function generateMetadata(): Promise<Metadata> {
  return metadataVitrina("en");
}

/** The Congress showcase in English. This address is a public promise (ADR-003): organizers link to it. */
export default async function CongresoEnPage({ searchParams }: Props) {
  return <Vitrina idioma="en" parametros={await searchParams} />;
}
