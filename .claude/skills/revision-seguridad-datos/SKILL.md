---
name: revision-seguridad-datos
description: Checklist de seguridad y datos personales para revisar rutas de API, server actions y cualquier código que lea o escriba datos de personas. Usar en la revisión de todo PR que toque app/api, lib/sesion, lib/permisos, la base de datos, consentimiento o integraciones externas.
---

# Revisión de seguridad y datos personales

Cada hallazgo se reporta con el archivo y la línea del diff, el escenario que lo dispara y la severidad.

## Rutas que escriben o leen datos de personas
- [ ] **Sesión en el servidor:** usa `sesionDelPedido` (o equivalente) y no confía en nada que diga el navegador sobre el rol, la tribu o el plan.
- [ ] **Sobre qué se actúa:** verifica que la persona tenga permiso **sobre esa tribu, ese pacto o esa persona** en particular, no solo que tenga el rol en general ("admin de tribu" ≠ admin de cualquier tribu).
- [ ] **Entrada validada** con una función pura y testeada; se rechaza lo que sobra, no solo lo que falta.
- [ ] **Límite de pedidos** en las rutas que escriben (reportes, "me interesa", pedidos de contacto, postulaciones).
- [ ] **Respuesta mínima:** devuelve solo los campos que la pantalla usa; nunca emails o datos de otras personas sin permiso.
- [ ] **Errores sin detalles internos:** el mensaje a la persona dice qué hacer; el detalle técnico va al log, sin datos personales.

## Secretos
- [ ] Ningún secreto en el código, en tests, en fixtures ni en mensajes de commit.
- [ ] Ningún secreto con prefijo `NEXT_PUBLIC_`.
- [ ] Ningún `console.log` que imprima tokens, encabezados `authorization`, emails completos o cuerpos de pedidos.

## Datos personales y consentimiento
- [ ] Todo dato personal nuevo está listado en el inventario (`NS_platform/Documentation/backend/01 - Inventario de datos del POC.md`) o el PR lo agrega como pendiente.
- [ ] Se guarda solo si hay consentimiento vigente (ver `lib/privacidad`), y entra en "Mis datos" (exportar).
- [ ] Datos sensibles (KYC, evaluaciones, finanzas) en sus tablas aparte; nunca en `jsonb`, logs ni URLs.
- [ ] Ningún dato personal en parámetros de la URL.
- [ ] Datos de servicios externos: se copia lo mínimo (ver skill `integracion-externa`). Nunca datos de pago ni documentos de identidad.

## Cliente
- [ ] Nada sensible en `localStorage`.
- [ ] Contenido de personas renderizado sin `dangerouslySetInnerHTML`.
- [ ] Enlaces externos con `rel="noopener noreferrer"`.
- [ ] Ninguna página nuestra embebe ni se deja embeber por dominios no listados (cabeceras `frame-ancestors`).

## Severidad
- **Alta:** expone datos de otra persona, permite actuar sobre algo ajeno, filtra un secreto o cobra de verdad.
- **Media:** falta un límite, una validación o el consentimiento en un dato no sensible.
- **Baja:** respuesta con campos de más, log demasiado detallado sin datos personales.

Un hallazgo de severidad alta hace que el veredicto del revisor sea ❌.
