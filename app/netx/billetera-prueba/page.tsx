import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SoloSuperAdmin } from "@/components/sesion/solo-super-admin";
import { modoSimulado, pruebaHabilitada } from "@/lib/billetera-prueba/habilitada";
import { puertoCandide } from "@/lib/integraciones/candide";
import { PruebaCliente } from "./prueba-cliente";

// Interna y sin enlaces desde el rail ni desde /netx: ni siquiera existe si LH_PRUEBA_CANDIDE no vale 1.
export const metadata: Metadata = { title: "Prueba de billetera", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function BilleteraPruebaPage() {
  if (!pruebaHabilitada()) notFound();
  const simulado = modoSimulado();
  // Sin clave de Candide la página lo dice; no pasa sola al modo simulado.
  const faltaConfigurar = !simulado && puertoCandide().estado() !== "listo";
  return (
    <SoloSuperAdmin>
      <PruebaCliente simulado={simulado} faltaConfigurar={faltaConfigurar} />
    </SoloSuperAdmin>
  );
}
