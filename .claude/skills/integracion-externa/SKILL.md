---
name: integracion-externa
description: Receta para conectar lighthouse-platform con un servicio de afuera (UnityHub, Telegram, MercadoPago, Stripe, HubSpot, fiduciario, KYC, Claude API) sin depender de él. Usar al especificar, implementar o revisar cualquier cambio que lea o escriba datos en un servicio externo.
---

# Integraciones externas

Principio: **trabajar uno hacia el otro sin depender**. Si el servicio de afuera cambia, se cae o lo reemplazamos, solo cambia un archivo. Las pantallas nunca se enteran.

## 1. Antes de escribir código: la ficha del proveedor
En `design.md` del cambio, una tabla con:
- Qué ofrece y qué **no** ofrece (verificado en su documentación, con fecha).
- Cómo se autentica (OAuth, token personal, clave de API) y quién es dueño de esa credencial.
- Límites conocidos (pedidos por minuto, tamaño, costo).
- **Dueño de cada dato**: por cada dato que cruza, ¿manda NetX o manda el proveedor? ¿Lo copiamos?
- Qué pasa si no está: el plan B manual (por ejemplo, un CSV que sube un admin).

## 2. Estructura del código
```
lib/integraciones/<dominio>/
  tipos.ts      // los tipos en NUESTRO vocabulario (ticket, tribu, anfitrión), no el del proveedor
  puerto.ts     // la interfaz que usan las pantallas: lo que NetX necesita, nada más
  mock.ts       // adaptador de ejemplo, sin red; es el que usan previews, tests y el prototipo
  <proveedor>.ts// adaptador real: traduce del proveedor a nuestros tipos (capa anticorrupción)
  index.ts      // elige el adaptador según una variable de entorno; si falta o es inválida, usa mock y lo avisa en el log
```
- **Ninguna pantalla importa `<proveedor>.ts`.** Siempre piden el puerto vía `index.ts`.
- Empezá **siempre** por `mock.ts`. El adaptador real va en un cambio aparte.
- No construyas el puerto si todavía no hay una integración en el horizonte cercano: alcanza con que los datos vivan en un archivo tipado y se lean por una función (`obtenerX()`). Esa función es la costura donde después entra el puerto.

## 3. Credenciales y llamadas
- Las llamadas a servicios externos las hace **el servidor** (rutas `app/api/...` o server components), nunca el navegador.
- Las credenciales viven solo en variables de entorno de Vercel. Nunca en el repo, nunca con prefijo `NEXT_PUBLIC_`, nunca en logs.
- Con OAuth en nombre de una persona: el proveedor es una **cuenta vinculada** a la persona de Privy (tabla `cuentas_vinculadas`), nunca una segunda identidad principal.
- Una credencial que "actúa como" una persona (por ejemplo el token personal de UnityHub) es de **solo lectura por defecto**. Escribir en el proveedor requiere una spec que lo diga explícitamente.

## 4. Modos de falla (obligatorio cubrirlos)
| Caso | Qué hace la app |
|---|---|
| No responde o tarda | Muestra la última copia con "actualizado hace X" o "sin dato"; nunca cero ni vacío engañoso |
| Responde dos veces lo mismo | Idempotencia: se guarda por el id externo; un check-in repetido cuenta una vez |
| Responde con otra forma | El adaptador valida la respuesta; si no coincide, la descarta, avisa en el log y sigue con la copia anterior |
| El email no coincide | Se ofrece vincular a mano (código o cuenta vinculada) |
| El proveedor desaparece | Plan B manual documentado |

## 5. Datos que copiamos
- Columnas mínimas: `proveedor`, `id_externo`, `sincronizado_at`, y un único (`proveedor`, `id_externo`).
- Copiar solo lo que se usa. Nunca datos de pago ni documentos de identidad.

## 6. Pruebas
- Tests unitarios contra `mock.ts` y contra respuestas grabadas del proveedor (archivos JSON en `__fixtures__`).
- Un **test de contrato** que llama al entorno de prueba del proveedor y verifica la forma de la respuesta. Necesita red y credencial, así que **no corre en la noche**: se corre a mano y se anota el resultado en el PR.

## 7. En las noches
- Los agentes nunca usan credenciales reales ni conectores (MCP) que actúen como Gus. En UnityHub, por ejemplo, un post creado es real en el momento.
- Si una tarea necesita red o una credencial para verificarse, el implementador frena y lo reporta.
