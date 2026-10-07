import Link from "next/link";

export default function TerritorioNoEncontrado() {
  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-10">
      <h1 className="text-3xl font-semibold">No encontramos ese territorio</h1>
      <p className="mt-2">
        <Link className="underline" href="/">Volver a la portada</Link>
      </p>
    </div>
  );
}
