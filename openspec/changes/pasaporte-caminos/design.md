# Design

## Context

`V.pasaporte` del mock-up arma el texto de cada camino con condicionales sobre `P()` (la persona) y `eligibleFid()`. Con `personas-demo` ya existen `PERSONAS`, `elegibleFideicomiso` y `usePersona()`.

## Decisiones

1. **Lógica pura en `lib/pasaporte/caminos.ts`:** `caminos(persona, emision)` devuelve una lista de 5 objetos `{ id, titulo, estado: "abierto" | "no" | "condiciones", claveLegal?, texto }`. Las condiciones del mock-up se traducen así: `elegibleFideicomiso` → sumarte; `nacionalidadAR` → chacra; `modalidad === "obra"` → horas de obra (con `horas`), si no → aporte remoto. Los lugares que quedan = `cupoNoCalificados − noCalificados` de `EMISION`. Con tests por persona.
2. **Textos del mock-up, sin reescribir:** los textos de cada camino se copian de `V.pasaporte`, adaptando solo la persona gramatical cuando el mock-up dice "siendo extranjera" (se mantiene, porque Lucía es la única extranjera del ejemplo).
3. **Página:** `app/pasaporte/page.tsx` (servidor: encabezado, explicación, aviso de prototipo) + `app/pasaporte/pasaporte-cliente.tsx` que usa `usePersona()` y renderiza las dos tarjetas. Los caminos como `<ul>`; cada `<li>` lleva el ícono del mock-up con `aria-hidden="true"` y el estado en un texto visible ("Abierto", "Por ahora, no", "Con condiciones"), con tokens de color ya existentes (verde, dorado, alerta) como refuerzo.
4. **Hidratación:** el servidor renderiza a Lucía (default de `usePersona`); si el navegador tiene a Lucas, cambia tras hidratar. Aceptable para un prototipo; no se usan `suppressHydrationWarning` ni lecturas en el servidor.
5. **Ícono del rail:** `IdCard` de `lucide-react` (si la versión instalada no lo tiene, `BadgeCheck`).

## Riesgos

- Si `canales-acceso` o `vista-netx` también tocan `lib/navegacion.ts`, puede haber conflicto de merge en la lista: se resuelve conservando todos los destinos.
- El texto de "Sumarte al proyecto: por ahora, no" usa la regla fiscal simplificada del mock-up (cualquier aportante del exterior). La regla real la define el equipo legal; queda como dato de ejemplo.
