# Tasks

Dos noches. **Noche 1:** grupos 1 a 3 (datos, fuente de principios, ficha y lectura). **Noche 2:** grupos 4 a 7 (regla de adhesión, principios de tribu, Vista NetX e integración). Cada noche termina con `pnpm verificar` y `pnpm build` en verde.

Las preguntas abiertas no frenan la implementación: se usan los valores por defecto del design (nombre provisorio "Lighthouse VRN Commons", "pedido" cuenta como adhesión, `comun-token` se mantiene).

## 1. Datos del manifiesto y fuente de principios (noche 1)

- [x] 1.1 Crear `lib/manifiestos/lighthouse-vrn.ts` con los tipos y el texto del design §1 y §3: propósito, 15 principios, 7 derechos, 6 compromisos, cómo se cambia, regla de las tribus, versión, `estado: "borrador"` y `ejemplo: true`, en es/en con `original: "es"`. Verificar con tests en `lib/manifiestos/lighthouse-vrn.test.ts`: hay entre 10 y 15 principios, los cinco grupos tienen al menos uno, los ids son únicos, hay siete derechos y cada uno remite a principios que existen, y hay entre 5 y 7 compromisos.
- [x] 1.2 Agregar `NOMBRE_META_TRIBU` y `NOMBRE_DEL_COMUN` (design §2). Verificar con un test que ningún archivo de `app/` ni `components/` escribe "Lighthouse VRN Commons" a mano (lo hace con `git ls-files` o leyendo los archivos, como `sin-colores-sueltos.test.ts`).
- [x] 1.3 Exponer `principiosLighthouseVrn`, `principioVrnPorId` y `principiosDelManifiesto` (design §4). Verificar con tests: un id desconocido devuelve `null`, el adaptador tiene `estado: "borrador"` y `origen: "manifiesto"`, y se conservan los 13 ids del mapeo del §4.
- [x] 1.4 Agregar un test que recorre todos los textos del manifiesto en los dos idiomas y verifica que no nombran a las comunidades de referencia. Verificar que el test falla si se agrega a mano uno de esos nombres y que pasa sin él.
- [x] 1.5 En `lib/manifiestos/datos.ts`, armar la entrada `lighthouse` desde el manifiesto nuevo (`titulo` "Manifiesto de Lighthouse VRN", `introduccion` = propósito, `compromisos`) con el campo `vrn`, y quitar el "Pacto de convivencia". Actualizar `lib/manifiestos/manifiestos.test.ts`. Verificar con `pnpm test` que `buscarManifiesto("lighthouse")?.titulo` es el título nuevo.
- [x] 1.6 Si `lib/fogon/propuestas/principios.ts` existe en `dev`, cambiar `fuentePrincipios` por `principiosDelManifiesto` y correr sus tests. Si no existe, no crearlo y anotarlo en el PR. Verificar con `pnpm test`, o con la nota en la descripción del PR.

## 2. Equipos transversales en la holarquía (noche 1)

- [ ] 2.1 En `lib/gobernanza/datos.ts`, renombrar los círculos del común y sumar `comun-contratistas` y `comun-gobernanza` con su propósito para todo el Lighthouse (design §6), conservando los ids existentes. La raíz se llama `NOMBRE_DEL_COMUN`. Verificar con `pnpm test`: se actualizan `holarquia.test.ts` y `gobernanza.test.ts`, y un test nuevo comprueba que están los ocho nombres de la lista de Gus.
- [ ] 2.2 Actualizar `e2e/fogon-gobernanza.spec.ts` ("Permacultura y suelo" pasa a ser "Permacultura y regeneración"). Verificar con `pnpm test:e2e e2e/fogon-gobernanza.spec.ts` en verde.

## 3. Ficha del común y lectura del manifiesto (noche 1)

- [ ] 3.1 Crear el diccionario `lib/idioma/textos/manifiesto-vrn.ts` (es/en) con los textos de pantalla: encabezados de grupos y secciones, estados de adhesión, "Equipos transversales: una startup para el procomún" y "Suma a los principios de Lighthouse VRN". Registrarlo como los demás diccionarios. Actualizar en `tribus.ts` los textos de membresía que nombraban el "pacto de convivencia". Verificar con `pnpm verificar` (los tipos fallan si falta una clave en un idioma).
- [ ] 3.2 Agregar los ⚖ `manifiestovrn`, `derechostierra` y `adhesiongobernanza` en `lib/legal/terminos.ts`, con `borrador: true` y en palabras simples. `derechostierra` nombra la Declaración Universal de los Derechos de la Madre Tierra y dice que no es un texto jurídico. Revisar que `adhesion` no contradiga el manifiesto nuevo. Verificar con `pnpm test` (`terminos.test.ts`).
- [ ] 3.3 Hacer que `app/tribus/[id]/page.tsx` genere también `lighthouse` y, para ese id, muestre `ficha-comun.tsx` con: nombre del común, "meta-tribu de la que forman parte todas las tribus", propósito, principios por grupo con su práctica, derechos, equipos transversales con enlace a `/fogon/gobernanza`, estado de adhesión en texto, `MembresiaAcciones` y marcas de borrador y ejemplo. Verificar abriendo `/tribus/lighthouse` en `pnpm dev`, con y sin adhesión, y con `?lang=en`.
- [ ] 3.4 Agregar en `/tribus` una tarjeta destacada del común, antes de la lista de tribus, que lleva a `/tribus/lighthouse`. Verificar con el teclado en `pnpm dev`: la tarjeta se alcanza con Tab y su enlace tiene un nombre accesible.
- [ ] 3.5 En `app/tribus/[id]/manifiesto/lectura.tsx`, cuando hay `vrn`, mostrar todas las secciones (propósito, principios por grupo, derechos, compromisos, cómo se cambia con enlace a `/fogon`, la regla de las tribus y "las máquinas sugieren; las personas deciden") dentro del área que hay que leer hasta el final, con una sola nota de traducción. El enlace de volver va a `/tribus/lighthouse`. No se ofrece ningún botón para cambiar el manifiesto. Verificar en `pnpm dev`: "Adherir" sigue deshabilitado hasta el final y las dos casillas, y al adherir la ficha muestra "adheriste" también al recargar.
- [ ] 3.6 Crear `e2e/manifiesto-lighthouse-vrn.spec.ts` con:
  - llegar desde `/tribus` a la ficha;
  - los cinco grupos visibles;
  - adherir y ver el estado después de recargar;
  - el enlace de volver;
  - el inglés;
  - que `/sumarte` no muestre el manifiesto.

  Sumar `/tribus/lighthouse` y `/tribus/lighthouse/manifiesto` a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e` en verde.

## 4. Regla de adhesión para participar (noche 2)

- [ ] 4.1 Crear `lib/gobernanza/participar.ts` con `adhirioAlManifiestoVrn` y `puedeParticiparEnGobernanza` (design §7). Verificar con tests: "pedido" y "miembro" permiten participar; "no-miembro" no; ser miembro de Valle Solar sin adhesión al común no alcanza. <!-- arquitecto: ADR-023 --> El archivo no importa nada del navegador (recibe `Membresias`); un test lee el archivo y falla si aparece `window`, `localStorage` o `leerMembresiaDelNavegador`.
- [ ] 4.2 En el Fogón, sumar el motivo `"manifiesto"` a `motivoSinVoto` (antes que residencia y pase) y respetarlo en `puedeLlevarAlConsejo`. `listo` espera a la membresía. El texto lleva el enlace a `/tribus/lighthouse/manifiesto` y el ⚖ `adhesiongobernanza`, en es/en (`lib/idioma/textos/fogon.ts`). <!-- arquitecto: el chequeo va antes de `requisito === "ninguno"` (design §7) --> `Condicion.adhirio` es obligatorio y `SIN_CONDICION.adhirio = false`. Verificar con tests unitarios del motivo (incluido "sin adhesión y sin pase da un solo motivo: manifiesto", "una decisión con requisito `ninguno` sin adhesión da `manifiesto`" y "sin adhesión, `votar` y `llevarAlConsejo` devuelven el mismo estado") y en `pnpm dev`: sin adhesión no hay "Votar" ni "Llevar al consejo", pero sí los votos de ejemplo.
- [ ] 4.3 En `app/fogon/consultas/[id]/consulta-cliente.tsx`, sin adhesión ocultar +/- y "Guardar" y mostrar el aviso. Los resultados se siguen viendo y "Simular cierre" y "Reabrir" no cambian. <!-- arquitecto --> Además, `guardar()` no llama a `repo.guardarReparto` sin adhesión. Verificar en `pnpm dev` con y sin adhesión.
- [ ] 4.4 Agregar un helper de e2e que deja la membresía `lighthouse: "pedido"` en el navegador, y usarlo en los e2e existentes que votan en `/fogon` o reparten en `/fogon/consultas`. Agregar escenarios sin adhesión (aviso visible, sin "Votar" ni +/-) y con adhesión. Sumar `/fogon` sin adhesión a la auditoría de axe. Verificar con `pnpm test:e2e` en verde.
- [ ] 4.5 Verificar que ninguna pantalla de gobernanza tenga su propia comprobación de adhesión: buscar `estadoDe(` y `"lighthouse"` en `app/fogon` y confirmar en el PR que solo se usa `puedeParticiparEnGobernanza`.
- [ ] 4.6 <!-- arquitecto: ADR-023 --> Dejar en la descripción del PR la nota para Gus: cuando `fogon-cuadratico-en-la-base` (o `fogon-propuestas` en la base) guarde votos, la ruta tiene que verificar la adhesión en el servidor, con la adhesión y su versión guardadas en la base (ADR-023). Verificar con la nota en la descripción del PR.

## 5. Principios propios de las tribus (noche 2)

- [x] 5.1 Crear `lib/manifiestos/principios-tribu.ts` con `validarPrincipiosDeTribu` (design §5). Verificar con tests de cada error: id de Lighthouse VRN, excepción ("contradice un principio de Lighthouse VRN"), principio profundizado inexistente, texto vacío e id repetido.
- [x] 5.2 Sumar `principiosPropios` de ejemplo a Semilla Viva y Agua Clara (design §5). Agregar un test que valida todas las tribus de ejemplo y busca "excepto", "salvo" y "except" en sus textos. Verificar con `pnpm test` en verde.
- [ ] 5.3 En la lectura del manifiesto de una tribu, mostrar "Suma a los principios de Lighthouse VRN" con sus principios, el principio de Lighthouse VRN que profundiza cada uno y el enlace al manifiesto del común, o "Esta tribu todavía no sumó principios propios". Agregar escenarios para Semilla Viva y Taller Común al e2e de 3.6. Verificar con `pnpm test:e2e` en verde.

## 6. Vista NetX (noche 2)

- [ ] 6.1 En `SeccionJuegos` (`app/netx/financiamiento/secciones-modelo.tsx`), agregar el bloque "Las decisiones, con la vida en el centro": propósito, los cinco grupos con su cantidad de principios (leídos de la fuente), la marca de borrador con su ⚖ `manifiestovrn` y el enlace a `/tribus/lighthouse`. Va en español, como el resto de la página. Verificar con un test de render o un e2e que el bloque muestra 15 principios en total y el enlace, y con la auditoría de axe sobre `/netx/financiamiento` en verde.

## 7. Integración (noche 2)

- [ ] 7.1 Correr `pnpm verificar`, `pnpm build` y `pnpm test:e2e` completos, en verde.
- [ ] 7.2 Revisar a mano, con el teclado y en es/en: `/tribus`, `/tribus/lighthouse`, `/tribus/lighthouse/manifiesto`, `/tribus/semilla/manifiesto`, `/fogon` (con y sin adhesión), una consulta, `/fogon/gobernanza` y `/netx/financiamiento`. Confirmar el aviso de prototipo, las marcas de borrador y ejemplo, y que no aparece nada en `/sumarte`. Dejar el resultado en la descripción del PR.
