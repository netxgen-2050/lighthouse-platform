import { redirect } from "next/navigation";

// El simulador pasó a la Vista NetX (es una herramienta del equipo, no una decisión de la comunidad).
export default function SimuladorMovido() {
  redirect("/netx/simulador");
}
