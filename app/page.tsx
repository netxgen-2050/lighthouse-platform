import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto grid max-w-3xl content-center gap-4 px-6 py-16 sm:px-10">
      <h1 className="text-4xl font-bold sm:text-5xl">
        Encontrá tu tribu. <span className="text-deep-2">Construí en común.</span>
      </h1>
      <p className="text-lg text-muted">Descubrí el territorio y encontrá tu tribu.</p>
      <p>
        <Link
          href="/tribus"
          className="inline-block rounded-full bg-deep px-5 py-3 font-medium text-on-deep hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
        >
          Ver las tribus
        </Link>
      </p>
    </div>
  );
}
