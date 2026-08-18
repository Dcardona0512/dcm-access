# DCM ACCESS

**Access to exclusive opportunities.**
Plataforma de brokerage privado: conecta clientes con activos globales, servicios premium y
oportunidades seleccionadas a través de una red de proveedores curada.

Stack: **Next.js 16 (App Router) · React 19 · TypeScript estricto · Tailwind CSS v4**.

---

## Puesta en marcha

```bash
npm install
npm run dev
```

| Comando         | Qué hace                                     |
| --------------- | -------------------------------------------- |
| `npm run dev`   | Servidor de desarrollo en `localhost:3000`   |
| `npm run build` | Build de producción                          |
| `npm run lint`  | ESLint                                       |

### Variables de entorno

Ninguna es obligatoria para arrancar. Todas tienen un valor por defecto sensato.

| Variable                  | Por defecto             | Para qué                                          |
| ------------------------- | ----------------------- | ------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`    | `http://localhost:3000` | Canónicas, hreflang, sitemap y OG. **Fijar en producción.** |
| `DCM_DATA_SOURCE`         | `demo`                  | `demo` \| `supabase`                              |
| `NEXT_PUBLIC_DCM_EMAIL`   | `access@dcm-access.com` | Correo de contacto público                        |
| `NEXT_PUBLIC_DCM_PHONE`   | *(vacío)*               | Teléfono; si está vacío no se muestra             |

---

## Arquitectura

### El modelo es polimórfico a propósito

Una sola entidad `Opportunity` sirve a las cinco verticales. Lo que distingue un apartamento de
un helicóptero no es la forma del registro, sino sus `attributes`, validados contra el
`attributeSchema` de su categoría.

**Añadir una subcategoría, un atributo o una vertical entera se hace en un único archivo:**
`src/lib/data/demo/seed/categories.ts`. El catálogo lee `facet: true` y genera el filtro solo;
la ficha lee `highlight: true` y decide qué destacar. Ni la UI ni las rutas se enteran.

### La monetización se amplía sin migrar

`src/lib/commerce/commissions.ts` es un registro de manejadores indexado por tipo de regla.
Ya soporta los siete modelos: comisión fija, porcentual, fee de referido, fee por lead,
revenue share, suscripción y publicación destacada.

Añadir uno nuevo son dos cosas:

1. un miembro más en la unión `CommissionRule`;
2. una entrada más en `handlers`.

TypeScript obliga a lo segundo en cuanto haces lo primero — `handlers` es un tipo mapeado sobre
`CommissionRule["type"]`, así que olvidar el manejador es un error de compilación, no un bug en
producción.

### La fuente de datos es intercambiable

```
src/lib/data/
  repositories.ts   Interfaces. Es el contrato que consume TODO el sitio.
  demo/             Implementación en memoria + datos semilla
  supabase/         Costura documentada, sin implementar
  index.ts          Elige adaptador según DCM_DATA_SOURCE
```

Ninguna página importa un adaptador: todas llaman a `getRepositories()`. Cambiar de backend es
cambiar una variable de entorno.

**Para conectar Supabase**, seguir los pasos documentados en
[`src/lib/data/supabase/index.ts`](src/lib/data/supabase/index.ts). El modelo de roles de
`src/lib/auth/roles.ts` está escrito para traducirse a políticas RLS: una fila de la matriz,
una política.

### Estructura

```
src/
  app/
    (site)/[locale]/   Sitio público — layout raíz propio, es/en
    (crm)/admin/       CRM interno — layout raíz propio, sin traducir, noindex
    sitemap.ts robots.ts icon.svg
  components/
    brand/  ui/  layout/  sections/  forms/  opportunities/  search/  admin/  account/
  content/             Diccionarios tipados es/en + invariantes de marca
  lib/
    domain/    Modelo, etiquetas, presentación de atributos
    data/      Repositorios y adaptadores
    commerce/  Motor de comisiones
    search/    Interpretación de lenguaje natural
    forms/     Esquemas zod + server actions
    auth/  analytics/  security/  i18n/  seo.ts  format.ts  motion.ts
```

Hay **dos layouts raíz** (`(site)` y `(crm)`). Es lo que permite que `<html lang>` refleje el
idioma real sin renunciar al prerenderizado estático: un layout raíz único no puede conocer el
locale sin `headers()`, y eso volvería dinámica cada página.

---

## Decisiones que conviene conocer antes de tocar nada

**Formularios de búsqueda y filtros son `<form method="get">` nativos.** Sin JavaScript. El
estado vive en la URL, así que cada combinación de filtros es compartible, indexable y
sobrevive a un refresco. No conviertas esto en estado de cliente.

**El acento está racionado.** La regla está escrita en `src/app/globals.css`: nunca como relleno
grande, solo en filetes, eyebrows, anillo de foco y **un** CTA por vista. Si una pantalla tiene
dos superficies doradas, una sobra.

**Los componentes no nombran colores, nombran roles.** `bg-surface`, `text-fg`, `text-accent`,
`border-line` — nunca `bg-ink-950` ni `text-champagne`. Cada tema decide qué pigmento ocupa cada
rol, y por eso el modo claro no obligó a recomponer nada: solo cambia la tabla de valores al
principio de `globals.css`. Si añades una clase de color literal, rompes el tema claro sin que
nada te avise.

**`inverse` es la superficie contraria al tema en curso** — marfil sobre el oscuro, tinta sobre
el claro. Es lo que usan las secciones que cortan el ritmo editorial (`<Section surface="inverse">`,
`<Button onInverse>`), y conserva su intención en ambos modos sin condicionales.

**El tema no parpadea.** Sin elección del usuario manda `prefers-color-scheme`, resuelto en CSS
puro — funciona sin JavaScript. Cuando hay elección guardada, un script en `beforeInteractive` la
aplica antes de pintar. Nunca se ve un fotograma con el tema equivocado.

**La vertical inferida por el buscador ordena, no filtra.** "Vehículo de seguridad" contiene
léxico de dos verticales a la vez; filtrar por la que gane el desempate escondería justo la
camioneta blindada. Solo filtra la vertical elegida en el selector.

**El precio "a consultar" nunca se descarta por rango de precio.** Descartarlo escondería las
oportunidades de mayor valor, que son precisamente las que no publican cifra.

---

## Estado actual y qué falta

### Funciona de extremo a extremo

- Sitio público bilingüe (es/en), 87 rutas prerenderizadas
- Catálogo con facetas calculadas sobre el conjunto filtrado y buscador en lenguaje natural
- Fichas de oportunidad, DCM ACCESS PRIVATE, Brokerage, Partners y perfiles de proveedor
- Los cuatro formularios crean leads reales que aparecen en el CRM
- CRM: embudo de leads, pipeline de seis etapas, cola de aprobación de proveedores,
  inventario y desglose auditable de comisiones
- SEO: hreflang, canónicas, JSON-LD por tipo de vertical, sitemap dinámico, OG generada
- Accesibilidad: landmarks, skip link, foco visible, etiquetas reales, cajón con trampa de foco

### Pendiente, y por qué

| Falta                    | Estado                                                                 |
| ------------------------ | ---------------------------------------------------------------------- |
| **Fotografía**           | No hay biblioteca. `EditorialImage` dibuja una placa sobria en su lugar; basta con dejar los archivos en `public/media/` y rellenar `src` en los datos. **Es lo único que impide que el sitio se vea terminado.** |
| **Backend real**         | Adaptador Supabase sin implementar. Contrato ya fijado.               |
| **Autenticación**        | Modelo de roles y política `can()` completos y aplicados; falta la sesión real. El CRM y el área de cliente van tras una sesión de demostración rotulada. |
| **Textos legales**       | Estructura base marcada como BORRADOR en la propia página. Requieren revisión de un abogado antes de publicar. |
| **Rate limiting**        | En memoria. Antes de producción debe respaldarse en un store compartido. |
| **Analítica**            | Adaptador de consola. No se mide nada sin consentimiento, como promete la política de cookies. |

### Sobre los datos de demostración

Mientras `DCM_DATA_SOURCE=demo`, **todo lo que se ve son ejemplos**: dieciséis oportunidades,
seis proveedores y un pipeline de prueba. Ninguna empresa, licencia, certificación, precio ni
operación es real.

Cada registro lleva `isDemo: true` y se renderiza con su etiqueta `Demo`; los nombres de
proveedor incluyen el sufijo `(Demo)` para que una captura suelta siga siendo inequívoca; y hay
un aviso permanente al pie del sitio. Al conectar datos reales, el aviso y las etiquetas
desaparecen solos.
