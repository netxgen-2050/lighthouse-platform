import Link from "next/link";

// Con dynamicParams = false, Next responde los ids desconocidos con esta página global.
export default function NoEncontrada() {
  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-10">
      <h1 className="text-3xl font-semibold">No encontramos esa página</h1>
      <p className="mt-2">
        <Link className="underline" href="/tribus">Volver a las tribus</Link>
      </p>
    </div>
  );
}
