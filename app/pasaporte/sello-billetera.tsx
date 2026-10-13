import { abreviarDireccion } from "@/lib/sesion/billetera";

/** Sello "Billetera creada": solo existe si Privy creó una billetera para la persona. No escribe nada en la blockchain. */
export function SelloBilletera({ billetera }: { billetera: string | null }) {
  if (!billetera) return null;
  return (
    <li data-sello="billetera" className="grid content-start gap-3 rounded-xl border border-faint bg-surface p-4">
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className="flex size-20 shrink-0 flex-col items-center justify-center rounded-full text-center -rotate-3 border-4 border-double border-deep bg-green-soft text-deep"
        >
          <span className="text-2xl leading-none">✓</span>
        </div>
        <div className="grid min-w-0 gap-1">
          <h3 className="text-lg font-semibold break-words">Billetera creada</h3>
          <p>
            <span className="rounded-full border border-deep bg-green-soft px-2 py-0.5 text-sm font-medium text-deep">Obtenido</span>
          </p>
        </div>
      </div>
      <p className="text-sm">
        Privy creó tu billetera: <span className="font-mono">{abreviarDireccion(billetera)}</span>. No se escribe nada en la
        blockchain.
      </p>
    </li>
  );
}
