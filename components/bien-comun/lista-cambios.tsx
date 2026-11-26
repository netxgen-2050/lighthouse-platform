// Lo que salió del modelo anterior, una línea cada uno. El título y la introducción los pone la página (`SeccionPlegable`).
export type CambioModelo = { id: string; texto: string };

export function ListaCambios({ items }: { items: CambioModelo[] }) {
  return (
    <ul className="grid max-w-[68ch] list-disc gap-2 pl-5">
      {items.map((i) => (
        <li key={i.id}>{i.texto}</li>
      ))}
    </ul>
  );
}
