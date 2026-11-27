"use client";

import { Aviso } from "@/components/ui/aviso";
import { useTextos } from "@/lib/idioma/cliente";

/** "Comunidades, personas y cifras de ejemplo": solo donde hay comunidades o personas de ejemplo (ux-base, design §4). */
export function AvisoEjemplo() {
  const comunes = useTextos("comunes");
  return <Aviso tono="info">{comunes.avisoEjemplo}</Aviso>;
}
