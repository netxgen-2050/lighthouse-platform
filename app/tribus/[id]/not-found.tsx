import Link from "next/link";

export default function TribuNoEncontrada() {
  return (
    <main className="mx-auto max-w-3xl p-6 sm:p-10">
      <h1 className="text-3xl font-semibold">No encontramos esa tribu</h1>
      <p className="mt-2">
        <Link className="underline" href="/tribus">Volver a las tribus</Link>
      </p>
    </main>
  );
}
