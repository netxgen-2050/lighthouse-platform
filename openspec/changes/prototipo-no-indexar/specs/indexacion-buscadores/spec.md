# Spec Delta

## Purpose

Que, mientras la plataforma sea un prototipo interno con datos de ejemplo, precios y fincas con el loteo en trámite, los buscadores no la muestren en sus resultados y los demás rastreadores no se lleven su contenido.

## ADDED Requirements

### Requirement: Cabecera de no indexar en toda respuesta
Mientras el interruptor de indexación esté apagado, toda respuesta de la plataforma (páginas, rutas de API, archivos estáticos de `public/` y la página de no encontrado) SHALL llevar la cabecera `X-Robots-Tag` con el valor `noindex, nofollow`.

#### Scenario: Página pública sin sesión
- **WHEN** alguien sin sesión pide `/`, `/territorios/lighthouse`, `/tribus/valle`, `/sumarte` o `/congreso`
- **THEN** la respuesta trae `X-Robots-Tag: noindex, nofollow`

#### Scenario: Ruta de API
- **WHEN** alguien pide `GET /api/sesion` sin sesión
- **THEN** la respuesta trae `X-Robots-Tag: noindex, nofollow`, cualquiera sea su código de estado

#### Scenario: Página que no existe
- **WHEN** alguien pide `/no-existe`
- **THEN** la respuesta 404 trae `X-Robots-Tag: noindex, nofollow`

### Requirement: Etiqueta robots en cada página
Mientras el interruptor esté apagado, cada página HTML SHALL incluir en el `<head>` una única etiqueta `<meta name="robots">` cuyo contenido incluya `noindex` y `nofollow`, también las páginas que definen su propia metadata (por ejemplo `/congreso` y `/congreso/en`).

#### Scenario: Portada
- **WHEN** se carga `/`
- **THEN** el `<head>` tiene `<meta name="robots">` con `noindex` y `nofollow`

#### Scenario: Página con metadata propia
- **WHEN** se carga `/congreso/en`
- **THEN** el `<head>` tiene una sola `<meta name="robots">` y dice `noindex` y `nofollow`

### Requirement: robots.txt que solo deja pasar a los buscadores
Mientras el interruptor esté apagado, `/robots.txt` SHALL permitir el rastreo a `Googlebot` y `Bingbot` (para que lean el `noindex`) y SHALL negarlo a cualquier otro agente con `User-agent: *` y `Disallow: /`. El archivo MUST NOT anunciar ningún `Sitemap`.

#### Scenario: Pedir robots.txt
- **WHEN** alguien pide `/robots.txt`
- **THEN** recibe texto plano con un bloque para `Googlebot` y `Bingbot` con `Allow: /`, un bloque `User-agent: *` con `Disallow: /` y ninguna línea `Sitemap`

### Requirement: Un solo interruptor
Las tres piezas (cabecera, etiqueta y `robots.txt`) SHALL salir de un único valor de configuración del código. Con el valor encendido, la plataforma MUST dejar de mandar la cabecera y la etiqueta de no indexar y `robots.txt` MUST permitir el rastreo a todos los agentes.

#### Scenario: Interruptor apagado (el estado de esta fase)
- **WHEN** se construye la plataforma con el valor por defecto
- **THEN** se cumplen los tres requisitos anteriores

#### Scenario: Interruptor encendido
- **WHEN** un test arma el `robots.txt` y la metadata con el interruptor encendido
- **THEN** `robots.txt` tiene `User-agent: *` con `Allow: /`, y la metadata no pide `noindex`
