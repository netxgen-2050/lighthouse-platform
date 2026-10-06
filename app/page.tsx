import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto grid min-h-screen max-w-3xl content-center gap-4 p-8">
      <h1 className="text-4xl font-semibold">Lighthouse</h1>
      <p className="text-lg text-stone-700">Descubrí el territorio y encontrá tu tribu.</p>
      <p>
        <Link
          href="/tribus"
          className="inline-block rounded-full bg-emerald-800 px-5 py-3 font-medium text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
        >
          Ver las tribus
        </Link>
      </p>
    </main>
  );
}
