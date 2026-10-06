export function Pie() {
  return (
    <footer className="border-t border-line bg-surface-2 text-sm text-muted">
      <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-2 px-6 py-4 sm:px-10">
        <p>Prototipo en desarrollo. Datos de ejemplo.</p>
        <p>© {new Date().getFullYear()} NetX</p>
      </div>
    </footer>
  );
}
