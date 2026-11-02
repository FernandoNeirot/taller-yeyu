---
name: seo-taller-yeyu
description: Retoma el trabajo de SEO de Taller Yeyu. Usar cuando se pida mejorar el SEO, posicionamiento, metadatos, datos estructurados, sitemap o indexación del sitio. Contiene qué ya está hecho, dónde vive cada pieza y los pasos pendientes en orden de prioridad.
---

# SEO de Taller Yeyu: estado y próximos pasos

Antes de tocar código de Next.js, leer la guía correspondiente en `node_modules/next/dist/docs/` (esta versión tiene cambios respecto de lo conocido; ver AGENTS.md).

## Dónde vive el SEO

| Pieza | Archivo |
|---|---|
| Config del sitio (nombre, descripción, keywords, URL, Instagram) | `src/lib/seo/site.ts` |
| Helper de metadatos por página (`sharePageMetadata`) | `src/lib/seo/metadata.ts` |
| JSON-LD (sitio, galería, producto, ofertas) | `src/lib/seo/json-ld.tsx` |
| Metadatos globales | `src/app/layout.tsx` |
| Sitemap / robots / manifest | `src/app/sitemap.ts`, `robots.ts`, `manifest.ts` |
| JSON-LD del sitio (solo parte pública) | `src/app/(home)/layout.tsx` |
| Ficha de producto (metadata + JSON-LD) | `src/app/(home)/producto/[slug]/page.tsx` |
| Home, galería | `src/app/(home)/page.tsx`, `galeria/page.tsx` |

Dominio de producción: `https://talleryeyu.com`. Existe `src/app/google50a02f6244fdbeb9.html` (verificación de Search Console).

## Ya hecho (no repetir)

- Metadatos base, Open Graph, Twitter, canonicals, `lang="es-AR"`.
- `noindex` en admin, `/pedido`, `/entrevista` y `/checkout/*`; `robots.ts` bloquea `/admin`, `/api/`, `/pedido`, `/checkout`, `/entrevista`.
- Sitemap con `lastModified` real (`updatedAt` del producto; home y galería usan el producto más reciente).
- `alt` descriptivo en fotos de producto (tarjetas, detalle, destacados) y en la imagen de "proceso" de la home. Los fondos decorativos conservan `alt=""` a propósito.
- JSON-LD: `Organization`+`Store` (sameAs, areaServed, slogan), `WebSite`, `Product` con `Offer`/`AggregateOffer` (juntando precio, variantes, packs y precios por cantidad) y `priceValidUntil`, breadcrumbs, `CollectionPage`.
- JSON-LD del sitio movido del layout raíz al de `(home)` (no se repite en admin).

## Pendiente, por prioridad

### Media
5. **Home con poco texto.** El `h1` es solo "Taller Yeyu" en `sr-only`. Poner un `h1` visible con servicio y lugar (ej. "Souvenirs y regalos personalizados en madera, corte láser") y mover "Taller Yeyu" al logo. Agregar sección de **preguntas frecuentes** (envíos, plazos, personalización, pago) con JSON-LD `FAQPage`.
6. **Páginas por categoría indexables** (`/galeria/souvenirs-y-eventos`, etc.). Hoy las categorías son filtros por query, que Google no indexa. Es la mayor oportunidad de tráfico orgánico. Cada una con `h1`, texto introductorio propio, metadata propia, entrada en el sitemap y breadcrumb. Categorías en `src/types/product.ts` (`catalogCategories`).
7. **Descripción de galería duplicada** en `galeria/page.tsx` y `json-ld.tsx` (`getGalleryJsonLd`). Unificar en una sola constante.
8. **Imagen social del producto** (`productShareImage` en `src/features/products/lib/product-url.ts`): declara siempre 1200×630 y `image/png`. Usar tamaño y tipo reales, o generar con `opengraph-image`.
9. **Redirecciones 301** cuando se renombra o borra un producto, hacia la galería o su categoría (hoy cae en el 404 de `producto/[slug]/not-found.tsx`).

### Baja
10. **Imagen principal de la home** usa `<img>` en vez de `next/image` (sin optimización). Evaluar migrar sin perder el preload.
11. **Search Console**: confirmar que `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` esté en producción y que el sitemap esté enviado.
12. **Manifest**: agregar ícono de 512 px (hoy solo hasta 192 px).
13. **Productos relacionados** en la ficha, para enlazado interno.
14. `keywords` en metadatos: Google las ignora; no invertir tiempo.

## Notas para quien retome

- `availability` está fijo en `InStock` porque `getCatalogProducts` solo devuelve productos activos. Si se agrega manejo de stock, ajustarlo en `getProductOffers` (`json-ld.tsx`).
- No agregar `aggregateRating` ni `review` mientras no existan reseñas reales.
- Los productos anteriores al campo `updatedAt` usan `createdAt` hasta que se editen.
- Al cambiar el esquema de producto, revisar `map-catalog-product.ts` y `get-products.ts`.
- Verificar siempre con `npx tsc --noEmit`. Hay errores de ESLint previos en `product-detail-modal.tsx` que no son de SEO.
- Después de implementar, validar en producción con Rich Results Test y Search Console, y actualizar las secciones "Ya hecho" y "Pendiente" de este archivo.
