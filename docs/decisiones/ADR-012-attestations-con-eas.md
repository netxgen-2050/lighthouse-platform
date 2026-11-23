# ADR-012 · Las constancias entre personas y de NetX siguen el estándar EAS: primero en nuestra base con la forma de EAS, después firmadas fuera de la cadena y, solo cuando sume, en la cadena

- **Estado:** Propuesta
- **Fecha:** 2026-10-23
- **Cambio OpenSpec relacionado:** `tribu-quienes-somos` ("nos conocemos") y `fogon-gobernanza-fractal` (preparados para esto). Se apoya en ADR-001 (libros de solo agregar) y ADR-011 (cuentas Safe).

## Contexto
Muchas cosas de la plataforma son **constancias**: alguien afirma algo sobre alguien y se puede retirar. Algunos ejemplos: "nos conocemos" (vale solo si las dos personas lo confirman), "el anfitrión confirma tu presencia" (Genesis Presence), los vouches del trust graph, el resultado publicado de una consulta del Fogón y, más adelante, las lecturas del Libro C con la firma de quien verifica.

EAS (Ethereum Attestation Service, attest.org) es el estándar abierto más usado para esto. Cada constancia tiene un formato registrado (schema), quién afirma, sobre quién, a qué constancia anterior apunta, si se revocó y cuándo vence. En la consultoría del 23-oct-2026, Bertrand marcó la ventaja de seguir el estándar: otras aplicaciones pueden leer y validar nuestras constancias, como un conector MCP frente a una API propia. NS_Tokenomics ya la tenía como candidata (doc 04 §6, opción B; doc 10 §4).

## Lo que se verificó (23-oct-2026)
- EAS admite constancias **en la cadena**, **fuera de la cadena** (firmadas y guardadas donde queramos, con la opción de anclar solo un sello de tiempo) y con **datos privados** (en la cadena va solo una raíz Merkle y los campos se revelan de a uno). Tiene una sección de pruebas de conocimiento cero ("ZK Playbook", `docs.attest.org/docs/category/zk-playbook`) y `attest.org/llms.txt`. No encontramos un servidor MCP oficial.
- Costo estimado de una constancia simple en la cadena (~200k de gas, estimación nuestra): Ethereum mainnet de US$ 0,06 (hoy, raro) a US$ 0,50–5 (normal). Base, Optimism y Celo: **menos de medio centavo**.
- Un cobro anti-spam (como el de alrededor de 1 USDC por constancia que mencionó Bertrand) sería una decisión nuestra, no un costo del gas. No identificamos la app de Base que lo hace: hay que preguntarle a Bertrand.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No hacer nada: cada pantalla guarda lo suyo a su manera | Cero trabajo | Cada constancia con otra forma; pasar a EAS después obliga a migrar todo |
| **B · Forma de EAS en nuestra base ahora; firma y cadena por etapas** | Casi gratis hoy; deja abierto EAS sin blockchain todavía; la experiencia de usuario no cambia | Disciplina en cada cambio que guarde constancias |
| C · EAS en la cadena desde ya | Visible e interoperable desde el día 1 | Billeteras, gas y red antes de tiempo; datos personales en algo que no se borra; contradice "sin contratos en esta fase" (NS_Tokenomics doc 01 §3) |

## Decisión (propuesta)
**B**, en tres etapas:
1. **Ahora (con `datos-en-la-nube` y cada libro nuevo):** toda constancia se guarda en un libro de solo agregar con la forma de EAS: `schema` (id interno del formato), `afirma` (persona o NetX), `sobre` (persona o cosa), `apunta_a` (constancia anterior, si hay), `datos` (JSON), `creada_en` (hora del servidor), `revocada_en`, `vence_en` y, más adelante, `uid_eas` y `red`. Revocar agrega una fila; nunca se borra ni se edita.
2. **Con las cuentas de ADR-011:** las constancias se **firman fuera de la cadena** con el formato de EAS. NetX firma desde el servidor (llave en un KMS), con la Safe de la persona como destinataria. Hay que verificar si las firmas de una Safe con passkey (EIP-1271) validan como constancias fuera de la cadena de EAS. Si no validan, la persona afirma en la cadena desde su Safe con gas pagado por nosotros.
3. **En la cadena, solo cuando sume:** lo que tiene que ser verificable por terceros (resultados publicados del Fogón, Libro C verificado, Genesis Presence). Una red L2 (la misma de ADR-011), probando primero en testnet.

Reglas:
- **Nunca datos personales en la cadena** (Ley 25.326; "borrar cuenta = anonimizar", ADR-005). En la cadena van como mucho hashes, constancias privadas o pruebas.
- **El registro legal manda** (NS_Tokenomics doc 29, J10). KYC, unidades, plata y derechos sobre la tierra **no** son constancias de EAS: como mucho, "KYC ok" emitido por el fiduciario, sin datos.
- **Fuera de este ADR:** la aceptación de los pactos por las dos partes, que sigue en discusión.

## Semillas (decisión de Gus, 23-oct-2026)
Después de comparar con Collabberry, Gus eligió que **las Semillas sean constancias de EAS**, con una condición: **que el número se pueda reajustar según la evaluación de los pares**. Así funciona:
1. **Emisión base por ronda:** una constancia por persona y período con el pacto, las horas confirmadas, `HOUR_REF_USD`, el período y el hash de la versión del pacto. Los términos del pacto quedan **congelados** en esa ronda: recalibrar después no cambia lo ya emitido.
2. **Reajuste:** cuando cierra la ronda de evaluación de pares, una segunda constancia **apunta a la base** (`refUID`) y aplica `f_eval`. Ese factor va de 0,8 a 1,2, está centrado en 3 = "cumple" (3 da 1,0) y cada comunidad elige su fuerza (como el parámetro `par` de Collabberry). Cada nivel de estrellas tiene una guía escrita.
3. **Correcciones:** se revoca la constancia equivocada y se emite otra que apunta a ella. Nunca se edita.
4. **Saldo:** es la suma que calcula nuestra base (fuente de verdad) o nuestro indexador. EAS es el espejo, por las etapas de arriba: forma de EAS en la base ahora, firmada fuera de la cadena después y en la cadena solo cuando sume.
5. **Quién firma:** la llave de NetX en el servidor o una multifirma de la comunidad. **Nunca** la billetera personal de un admin.
6. **Más adelante, opcional:** un token de saldo intransferible **por código** (no por un interruptor que se pueda volver a prender, como en Collabberry), solo si las billeteras necesitan mostrar un número.

**Defensas contra la colusión** (Gus las adoptó el 23-oct; los parámetros se calibran con simulación, NS_Tokenomics doc 29 K11):
- Nadie se evalúa a sí mismo.
- Solo evalúan quienes trabajaron juntos de verdad en el período (mismo pacto o círculo).
- Con menos de 3 evaluadores, `f_eval` = 1,0.
- Se usa la mediana o la media recortada, no el promedio simple.
- Se descuentan los pares recíprocos que se apartan mucho de la mediana de los demás.
- Hay un tope a cuánto puede mover un solo evaluador el factor de alguien.
- Los resultados se muestran solo agregados, sin nombres de quién evaluó.
- Cada puntaje lleva un motivo escrito obligatorio (ya existe).

**Relación con ADR-009:** ADR-009 dice "las Semillas van a ser tokens soulbound". Si este ADR se acepta, **reemplaza a ADR-009 en ese punto** (solo el formato de las Semillas). El resto de ADR-009 sigue igual.

## Consecuencias
- Ganamos: pasar a EAS no rompe nada, porque la forma de los datos ya es la misma.
- Ganamos: la experiencia de usuario no cambia. "Nos conocemos" se ve igual con o sin blockchain.
- Aceptamos: cada spec que guarde constancias tiene que usar esta forma. El especificador lo revisa.
- Riesgo: la red y el costo anti-spam siguen abiertos (`NS_platform` doc 08).
- **Revisar:** con la prueba de noviembre (ADR-011); al decidir el formato de las Semillas; antes de la primera constancia en la cadena.

## En palabras simples
Cuando Martín y Ana marcan "nos conocemos", queda una constancia: quién lo dijo, sobre quién y cuándo, y se puede retirar. Hoy esa constancia vive en nuestra base, pero con el mismo formato que usa un estándar público (EAS). Si mañana queremos que otra comunidad pueda verificarla, la publicamos en ese estándar sin rehacer nada. Lo personal nunca se publica.

## Fuentes (consultadas el 23-oct-2026)
- `attest.org/llms.txt`; `docs.attest.org/docs/category/zk-playbook`; documentación de EAS sobre constancias fuera de la cadena y datos privados.
- NS_Tokenomics docs 01 §3 y §5, 04 §6, 10 §4 y 29 (J10); NS_platform doc 10; NS_permacultura doc 09.
- Consultoría con Bertrand, 23-oct-2026.
