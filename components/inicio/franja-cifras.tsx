export type CifraFranja = { id: string; valor: string; texto: string; fuente: string };

/**
 * Cifras del sitio en una franja de borde a borde sobre `surface-2` (ux-inicio, design §3). El valor, la frase y la fuente
 * llegan ya resueltos desde `lib/portada-vrn.ts`: este componente no escribe ningún número. Con la lista vacía no dibuja nada
 * (el dato que falta no es cero).
 */
export function FranjaCifras({
  titulo,
  etiquetaFuente,
  cifras,
}: {
  titulo: string;
  etiquetaFuente: string;
  cifras: CifraFranja[];
}) {
  if (cifras.length === 0) return null;
  return (
    <section aria-labelledby="cifras" className="bg-surface-2 text-ink">
      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-12 sm:px-10">
        <h2 id="cifras" className="text-xl font-bold">
          {titulo}
        </h2>
        <ul className="grid gap-8 sm:grid-cols-3">
          {cifras.map((c) => (
            <li key={c.id} className="grid content-start gap-1">
              <strong className="font-mono text-[40px] font-medium leading-tight">{c.valor}</strong>
              <p>{c.texto}</p>
              <p className="text-[13px] text-muted">
                {etiquetaFuente}: <span lang="es">{c.fuente}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
