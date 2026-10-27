import type { Metadata } from "next";
import Link from "next/link";
import { FogonCliente } from "./fogon-cliente";

export const metadata: Metadata = { title: "Fogón" };

export default function FogonPage() {
  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <p className="text-sm font-medium text-muted">Fogón de decisiones</p>
      <h1 className="text-3xl font-semibold">Lo que se está decidiendo</h1>
      <p className="mt-2 mb-4 max-w-2xl text-muted">
        Cada decisión muestra dónde se decide, con qué regla y en qué norma se apoya. La plataforma facilita; la
        validez la da el reglamento, el contrato o el estatuto. Los votos son simulados y quedan solo en este
        navegador.
      </p>
      <div className="mb-5 rounded-xl border border-deep bg-green-soft p-4 text-sm">
        <p className="font-semibold">Cómo decidimos</p>
        <p className="mt-1">
          Círculos dentro de cada tribu, las doce tribus, Lighthouse como el común y un consejo con un lugar por tribu.
          Mirá quién valida a quién y qué sube al consejo.
        </p>
        <p className="mt-2">
          <Link className="underline" href="/fogon/gobernanza">Cómo decidimos</Link>
        </p>
      </div>
      <div className="mb-5 rounded-xl border border-deep bg-green-soft p-4 text-sm">
        <p className="font-semibold">Consultas de prioridades y presupuesto</p>
        <p className="mt-1">
          Repartí 100 créditos de voz con voto cuadrático para priorizar y repartir presupuesto.
        </p>
        <p className="mt-2">
          <Link className="underline" href="/fogon/consultas">Ver las consultas</Link>
        </p>
      </div>
      <div className="mb-5 rounded-xl border border-deep bg-green-soft p-4 text-sm">
        <p className="font-semibold">Simulador de la tokenomics</p>
        <p className="mt-1">
          Mové los valores del diseño B y mirá cuánto recibe el procomún, cada clase de inversor y NetX. Los números son
          de ejemplo, no una oferta.
        </p>
        <p className="mt-2">
          <Link className="underline" href="/fogon/simulador">Simular los parámetros de la tokenomics</Link>
        </p>
      </div>
      <FogonCliente />
    </div>
  );
}
