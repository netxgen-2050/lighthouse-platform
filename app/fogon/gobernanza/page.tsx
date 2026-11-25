import { redirect } from "next/navigation";
import type { ParametroDeDireccion } from "@/lib/gobernanza/lugar";

type Props = { searchParams: Promise<Record<string, ParametroDeDireccion>> };

// "Cómo decidimos" pasó a ser la portada del Fogón. Los enlaces guardados siguen vivos: solo se copian `holon` y `lente`
// (ningún otro parámetro), y siempre se va a `/fogon`.
export default async function GobernanzaMovida({ searchParams }: Props) {
  const params = await searchParams;
  const destino = new URLSearchParams();
  for (const clave of ["holon", "lente"]) {
    const v = params[clave];
    const valor = Array.isArray(v) ? v[0] : v;
    if (valor) destino.set(clave, valor);
  }
  const query = destino.toString();
  redirect(query ? `/fogon?${query}` : "/fogon");
}
