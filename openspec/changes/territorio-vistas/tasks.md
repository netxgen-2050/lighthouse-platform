# Tasks

Una noche. Va **después de `tribus-equipos`**. Rama `agente/territorio-vistas` desde `dev`. Antes de empezar, fijarse si el PR #109 ya está en `dev` y aplicar el caso que corresponde del design §5.

## 1. Lógica pura

- [x] 1.1 `lib/territorios/vistas.ts`: `VISTAS`, `leerVista`, `leerFase`, `numeroDeFrente`, `frentesEn`, `elegibles` por vista y fase, y el registro de fuentes del plan (design §1 y §5).
  - **Verifica:** `vistas.test.ts` cubre estos casos:
    - `leerVista("red")` da `"ahora"`;
    - `leerVista("permacultura")` da `"plan"`;
    - `leerFase("7")` da `0`;
    - `numeroDeFrente("primer-obrador")` es el mismo en las tres fases;
    - con la fase 0, `frentesEn` deja "Primer obrador" en `despues`;
    - "Papeles y fideicomiso" queda en `sinLugar`;
    - `elegibles("plan")` no incluye barrios.
- [x] 1.2 Regla de compatibilidad (design §1): solo **sin** `vista`, si un `sel` no es elegible en Ahora pero sí en otra vista, se abre la primera de `VISTAS` donde lo sea. Con `vista` explícita, el `sel` no elegible se limpia. <!-- arquitecto: antes también cambiaba una vista explícita, en contra del design §1 -->
  - **Verifica:** un test comprueba que `sel=barrio-6` sin `vista` abre `"vision"`, que `vista=ahora&sel=barrio-6` abre `"ahora"` sin selección y que `sel=comun` sin `vista` se queda en `"ahora"`.
- [x] 1.3 <!-- arquitecto --> `esDeHoy(frente)` y `leerFuentePlan` (design §1 y §2).
  - **Verifica:** un test comprueba que `esDeHoy` de "Primer obrador" da `false` y el de "Agua y cuenca" `true`, y que `leerFuentePlan` con `permacultura` sin esa fuente disponible da `"ilustrativa"`.

## 2. Mapa y pantalla

- [x] 2.1 `mapa-leaflet.tsx` con un `layerGroup` por capa, las props `vista` y `fase`, la capa de barrios neutros de Plan, los sellos numerados de frentes y el `role="region"` con `aria-label` por vista y fase (design §2). Separar estilos y grupos a `capas.ts`.
  - **Verifica:** a mano, al cambiar de vista el mapa no se rearma (el zoom se mantiene) y con Tab no aparecen sellos de otra vista. Lo cubre también el e2e de 3.1.
- [x] 2.2 Selector de vistas y "Etapa" con radios en `vitrina-territorio.tsx`, y la URL con `vista`, `fase` y `sel` (design §3).
  - **Verifica:** a mano, recargar con `?vista=plan&fase=1` deja las dos cosas elegidas, y elegir otra vista limpia `sel`.
- [x] 2.3 Paneles por vista en `app/territorios/[id]/vistas/` y la ficha de frente con `SumarmeEquipo` o con "Más adelante · fase N". La leyenda y la lista "Elegir en el mapa" van por vista (design §4). En Visión se agrega la marca "Tribus de ejemplo, a definir" y el texto de cada fase.
  - **Verifica:** lo cubren los escenarios de 3.1.
- [x] 2.4 Textos es/en en `lib/idioma/textos/territorio.ts`: vistas, etapa, `marcador.frente`, `mapa.aria`, leyendas, "Dónde podés ayudar", "Sin lugar en el mapa", "Más adelante", "Lugar ilustrativo", fuentes del plan y textos de fase. Las muestras de leyenda van en `app/globals.css` con tokens.
  - **Verifica:** pasan el test de diccionarios completos y `lib/sin-colores-sueltos.test.ts`.
- [x] 2.5 Enlace "Ver en el mapa" en la pestaña Equipos de `/tribus` (design §6).
  - **Verifica:** lo cubre el e2e "Ver en el mapa".

## 3. Pruebas y cierre

- [x] 3.1 `e2e/territorio-vistas.spec.ts`, con todos los escenarios de la spec:
  - vista por defecto, enlace compartible, vista desconocida y enlace viejo a un barrio;
  - fase 1 con teclado y fase de hoy;
  - elegir un frente desde la lista, frente sin lugar y frente que viene;
  - sumarse desde el mapa (con el helper de adhesión de `tribus-equipos`);
  - plan sin tribus;
  - barrio 6 en Visión;
  - finca 502 en Ahora;
  - ver en el mapa;
  - celular a 390 px;
  - inglés.

  Bloquear las teselas con `page.route`, como `territorio-mapa`.
  - **Verifica:** `pnpm test:e2e e2e/territorio-vistas.spec.ts` pasa en verde, 3 veces seguidas.
- [x] 3.2 Ajustar `e2e/territorio-mapa.spec.ts`, `e2e/territorio.spec.ts` e `e2e/idioma-tribus-territorio.spec.ts` para entrar con `?vista=vision` donde eligen barrios, y sumar las tres vistas a `e2e/accesibilidad.spec.ts`.
  - **Verifica:** todos pasan en verde y axe no marca violaciones en Ahora, Plan ni Visión.
- [x] 3.3 Cierre: `pnpm verificar` y `pnpm build` en verde. El PR a `dev` se abre con `scripts/pr.sh` y en el cuerpo dice qué caso del PR #109 se aplicó.
  - **Verifica:** los comandos salen en verde y el PR está abierto.
