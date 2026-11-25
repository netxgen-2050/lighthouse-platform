import Link from "next/link";

// Página del 403 (forbidden()). No lee la sesión ni datos de nadie.
export default function Forbidden() {
  return (
    <div className="mx-auto max-w-xl p-6 sm:p-10">
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <h1 className="text-2xl font-semibold">No tenés acceso a esta página</h1>
      <p className="mt-3 text-muted">
        La administración es solo para el super admin del prototipo. Si sos el super admin y acabás de entrar, recargá la
        página.
      </p>
      <p className="mt-4">
        <Link className="underline" href="/">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
