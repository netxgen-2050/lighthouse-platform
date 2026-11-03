# Design

## Context

`app/page.tsx` es un server component con textos de `lib/idioma/textos/portada.ts` y tarjetas de `lib/portada.ts`. El héroe viene del mock-up v6 ("Encontrá tu tribu"), y `CAMINOS_VALIDOS` en `lib/origen/origen.ts` limita `?camino=`.

**Lo que no está en la documentación:** una definición de "los cinco capitales de la regeneración" y cifras con fuente sobre Vaca Muerta o sobre Argentina. Se buscó en `NS_platform` y `NS_Tokenomics`. Las cifras del sitio sí están, en la nota 19 §3, que cita `NS_permacultura` 01 y 08.

## Goals / Non-Goals

**Goals:**
- Que quien llega de cero entienda la promesa en una pantalla y llegue a los lotes.
- Que ninguna cifra aparezca sin su fuente.

**Non-Goals:**
- Contar el modelo de plata (eso es `/lotes/hibrido`).
- Un rediseño visual: mismos tokens y componentes.

## Decisions

### 1. Orden de la página
1. Aviso de prototipo (como hoy).
2. Héroe, con el llamado "Ver los lotes" y el secundario "Elegí cómo sumarte".
3. La promesa a 2030: tres bloques.
4. Argentina.
5. Los cinco capitales.
6. Cifras, si hay.
7. Por dónde empezar.

### 2. Textos
Son borrador de agente, para que Gus los ajuste.

| Clave | es | en |
|---|---|---|
| `sobretitulo` | Lighthouse VRN · Río Negro, Argentina | Lighthouse VRN · Río Negro, Argentina |
| `tituloInicio` | Regenerar desde el agua. | Regenerating from the water. |
| `tituloFin` | Una promesa a 2030. | A promise for 2030. |
| `bajada` | Para 2030, Lighthouse VRN quiere ser un territorio que se regenera desde el agua, en el corazón de Vaca Muerta: con trabajo en industrias regenerativas y una comunidad que lo vive y lo cuida. Es nuestra meta, no una garantía. | By 2030, Lighthouse VRN aims to be a territory regenerating from the water, in the heart of Vaca Muerta: with work in regenerative industries and a community that lives in it and cares for it. It is our goal, not a guarantee. |
| `verLotes` | Ver los lotes | See the lots |
| `promesa.agua` | **Agua.** Todo empieza por el agua: leerla, guardarla y llevarla. Sin eso no hay suelo, ni árboles, ni casa. | **Water.** It all starts with water: reading it, storing it and moving it. Without it there is no soil, no trees and no home. |
| `promesa.trabajo` | **Trabajo.** Queremos que regenerar sea también una forma de vivir: trabajo en industrias regenerativas, cerca de donde se vive. | **Work.** We want regenerating to be a way of making a living too: work in regenerative industries, close to where you live. |
| `promesa.comunidad` | **Comunidad.** Personas que deciden cómo cuidar lo que es de todos. | **Community.** People who decide how to care for what belongs to everyone. |
| `argentina.titulo` | Argentina, un lugar seguro y abierto | Argentina, a safe and open place |
| `argentina.texto` | Un país que recibe a quienes vienen de afuera, lejos de los grandes conflictos. Si venís de otro país, hay reglas para comprar tierra rural: leelas acá (⚖). | A country that welcomes people from abroad, far from the major conflicts. If you come from another country, there are rules for buying rural land: read them here (⚖). |
| `capitales.titulo` | Los cinco capitales de la regeneración | The five capitals of regeneration |

`argentina.texto` es una afirmación general, **sin cifra**, porque no hay fuente; ver la pregunta abierta. El ⚖ es `ribera`, que ya existe, y este cambio le suma el inglés con `borrador: true` en esa traducción.

### 3. Los cinco capitales son una hipótesis
No hay definición en la documentación. Como punto de partida se usa el modelo de los cinco capitales de Forum for the Future, que es de dominio público en sostenibilidad, y **queda como pregunta para Gus**:

| Capital | es | en |
|---|---|---|
| Natural | Agua, suelo, monte nativo y lo que vive ahí. | Water, soil, native woodland and what lives there. |
| Humano | Lo que cada persona sabe y puede hacer, y su salud. | What each person knows and can do, and their health. |
| Social | La confianza y los acuerdos entre quienes están. | Trust and agreements among the people here. |
| Construido | Caminos, casas y lo que hace falta para vivir y producir. | Roads, homes and what it takes to live and produce. |
| Financiero | La plata que entra y cómo se reparte. | The money coming in and how it is shared. |

Viven en `lib/portada-vrn.ts`: si Gus trae otros cinco, se cambia solo eso. La tarea 2.3 pide confirmar la lista antes de abrir el PR; si no hay respuesta, el PR sale con esta y lo dice.

### 4. Cifras con fuente obligatoria
```ts
// lib/portada-vrn.ts
export type Cifra = { id: string; valor: string; texto: Bilingue; fuente: string; consultado: string; externa: boolean };
export const CIFRAS: readonly Cifra[] = [ … ];
```
El tipo obliga a tener `fuente` y `consultado`, y un test rechaza una cadena vacía. Cada cifra se muestra con su fuente al lado, en texto. Sin cifras, la sección no se dibuja: no se muestra vacía ni con 0.

**Se arranca solo con las del sitio**, citando de dónde salen:

| Valor | Texto | Fuente |
|---|---|---|
| ~250 mm | de lluvia por año | NS_permacultura 01 y 08, según NS_platform nota 19 §3 |
| 90 % | del 7A es hoy desierto | ídem |
| ~6 km | de escurrimiento que drena más de 600 ha a un solo punto | ídem |

**Ninguna cifra externa** por ahora: no hay ninguna con fuente en la documentación, y el implementador no las busca ni las estima. Se evita la superficie del 7A porque está en disputa (backlog T1).

### 5. Las tarjetas y `?camino=`
`CAMINOS_VALIDOS = ["lotes", "territorio", "tribus"]`.

| id | Etiqueta | Título | Destino | Descripción |
|---|---|---|---|---|
| `lotes` | Comprar | Ver los lotes | `/lotes` | Del loteo provisorio del sector norte. Es una simulación. |
| `territorio` | Descubrir | Explorar el territorio | `/territorios/lighthouse` | Los lotes, lo común y lo que se está trabajando. |
| `tribus` | Lo que viene | Ver las tribus | `/tribus` | Sale de `descripcionBarrios`, con la cantidad desde los datos. |

En inglés: Buy / See the lots; Discover / Explore the territory; Coming next / See the tribes. El cambio de `CaminoId` también alcanza a `lh-origen`: `caminoValido` ya descarta lo desconocido, así que un origen viejo sigue valiendo, sin camino.

`app/page.tsx` deja de usar la clave `explorar` y el botón principal apunta a `/lotes`. Si `/lotes` no existe, usa el mismo control que `haySumarte`, con `DESTINOS`, y muestra "Explorar el territorio".

## Risks / Trade-offs

- [El Congreso pierde su última entrada visible] → Es coherente con Congreso oculto del menú, y `/congreso` sigue por su dirección (`docs/notas/congreso-en-pausa.md`).
- ["Seguro y abierto" es una afirmación sin dato] → Es lo pedido, va sin cifra y con el ⚖ de límites a extranjeros, y es uno de los textos a revisar antes de abrir afuera (R14).
- ["En el corazón de Vaca Muerta"] → Es la frase del pedido; Mainqué está en el Alto Valle de Río Negro. Pregunta abierta, por si un lector de la zona la cuestiona.
- [Enlaces viejos con `?camino=congreso` en campañas] → Ninguna tarjeta queda marcada y la página no falla. El origen de la campaña se guarda igual.
- [Se pisa con `idioma-portada-sumarte` (5/6)] → Cerrar aquel primero; este cambio reescribe textos que aquel ya tradujo.

## Migration Plan

Sin datos que migrar. Volver atrás es revertir el PR.
