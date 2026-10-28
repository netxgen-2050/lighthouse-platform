"use client";

import { useTextos } from "@/lib/idioma/cliente";
import { abreviarDireccion } from "@/lib/sesion/billetera";

/** Sello "Billetera creada": solo existe si Privy creó una billetera para la persona. No escribe nada en la blockchain. */
export function SelloBilletera({ billetera }: { billetera: string | null }) {
  const t = useTextos("pasaporte").sellos;
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
          <h3 className="text-lg font-semibold break-words">{t.billetera.nombre}</h3>
          <p>
            <span className="rounded-full border border-deep bg-green-soft px-2 py-0.5 text-sm font-medium text-deep">{t.estados.obtenido}</span>
          </p>
        </div>
      </div>
      <p className="text-sm">
        {t.billetera.antes} <span className="font-mono">{abreviarDireccion(billetera)}</span>. {t.billetera.despues}
      </p>
    </li>
  );
}
