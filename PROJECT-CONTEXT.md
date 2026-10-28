# Contexto del proyecto: taller-yeyu

## Qué es
Sitio web + panel de administración de un taller artesanal argentino (productos en MDF calado, decoración, souvenirs, regalos personalizados). Tiene dos caras:
- **Tienda pública**: catálogo/galería, ficha de producto, carrito, pedido por WhatsApp o pago con Mercado Pago, envíos con Andreani.
- **Admin privado** (`/admin`): gestión de productos, control financiero (familiar y del emprendimiento) y cotizador de costos.

La UI y el dominio están en **español rioplatense**.

## Stack
- **Next.js 16.3.4** (App Router, Turbopack) + **React 19.2** + **TypeScript 5**. ⚠️ Esta versión de Next tiene breaking changes (ver `AGENTS.md`); la doc local está en `node_modules/next/dist/docs/`. No asumir APIs de Next 13/14/15.
- **Tailwind CSS v4** (`@tailwindcss/postcss`), tokens de diseño tipo Material (`bg-primary`, `surface-container`, `on-primary`, etc.) e íconos Material Symbols.
- **TanStack React Query 5** para el estado de productos en cliente.
- **Firebase Admin** (Firestore + Storage), solo del lado servidor.
- **Mercado Pago** (`mercadopago`), **Andreani** (`src/lib/andreani.ts`), **jsPDF** (reportes), **sharp** (imágenes).
- Sin tests. Lint con ESLint 9. Alias de imports `@/` → `src/`.

## Estructura de carpetas (`src/`)

```
app/
  (home)/            sitio público: /, /galeria, /producto/[slug], /pedido, /checkout/{exito,error,pendiente}
  admin/             /admin, /login, /productos, /financiero, /cotizador (force-dynamic)
  api/
    checkout/                  POST: crea orden (WhatsApp o MP)
    mercadopago/{preference,webhook}/
    shipping/quote/            cotización de envío
  layout.tsx, providers.tsx, error.tsx, global-error.tsx,
  manifest.ts, robots.ts, sitemap.ts, globals.css
components/          UI compartida, agrupada por área
  cart/ (CartDrawer, AddToCartModal…)   home/ (secciones de portada)
  layout/ (header, footer, bottom-nav, nav.ts)   product/   ui/ (inputs, selects, íconos, calculadora)
context/CartContext.tsx   carrito global (React Context)
data/initialProducts.ts   catálogo semilla (fallback / seed)
features/            lógica por dominio (ver abajo)
lib/                 firebase-admin, mercadopago, andreani, whatsapp, seo/ (metadata, json-ld, site)
types/product.ts     tipo Product + categorías del catálogo (compartido)
```
Fuera de `src/`: `scripts/` (seed de productos, materiales, juegos didácticos y usuarios admin, optimización de imágenes, favicon) y `README-PRODUCTOS.md` (guía para cargar productos).

## Organización por features (`src/features/<dominio>/`)
Cada feature usa las subcarpetas que necesita: `actions/` (Server Actions), `services/` (acceso a datos, server-only), `components/`, `lib/` (lógica pura), `hooks/`, `types/`.

| Feature | Qué hace |
|---|---|
| **products** | Catálogo, galería con filtros, ficha, modales, variantes, precios por cantidad, cotización de costo, import por JSON, `product-manager` (CRUD admin). Servicios: lectura de Firestore con **caché en memoria (TTL 24h)** + fallback a `initialProducts`; subida/borrado de imágenes en Storage. |
| **cart** | Tipos de carrito, totales, armado del mensaje/link de WhatsApp, vista del pedido. |
| **checkout** | Resolución del checkout en servidor (recalcula precios/envío), creación/actualización de órdenes. `flags.ts` tiene `CHECKOUT_PAYMENTS_ENABLED = false`: pagos online apagados hasta tener keys de MP/Andreani; hoy el flujo real es WhatsApp. |
| **admin** | Login usuario/contraseña (usuarios en Firestore), sesión por **cookie propia firmada con HMAC** (`admin_session`, 24h), `requireAdmin()` / `getSession()`. No hay middleware/proxy: la protección se hace por página/layout/acción. |
| **finance** | Movimientos de ingreso/egreso en dos libros: **familia** y **emprendimiento** (categorías fijas), reportes y descarga en PDF. |
| **materials** | Catálogo de materiales de costo (`/admin/materiales`, colección `materials`): `Material` con `measureType` (`area_cm2`, `unit`, `time_minutes`), `totalCost`, `totalUnits` y `costPerUnit` calculado. También tiene el editor de líneas (`QuoteItemsEditor`) y el cálculo (`lib/quote-items.ts`) que comparten el cotizador y el formulario de producto. |
| **quotes** | Cotizador: arma costos con los materiales del catálogo (`QuoteItem[]`: ancho×alto, unidades o minutos) y guarda cotizaciones. |

## Flujos de datos clave
1. **Lectura de productos**: Server Component → `get-products` / `get-catalog-products` (Firestore con caché en memoria) → `ProductsHydration` (client) hace `dehydrate` de React Query → los componentes cliente usan `useProducts()`. El `queryFn` lanza error a propósito: los datos **siempre** vienen prehidratados desde el servidor.
2. **Escritura**: Server Actions (`save-product`, `delete-product`, `toggle-product-visibility`, finance, quotes) → Firestore → `revalidatePath` de `/`, `/galeria`, `/producto`, `/admin/productos` + actualización del caché en memoria.
3. **Carrito / pedido**: `CartContext` en cliente (`CartDrawer` con `dynamic` y `ssr:false`, oculto en `/admin`). Pedido → `/api/checkout` → `resolveCheckout` → orden en Firestore → WhatsApp (activo) o preferencia de Mercado Pago (deshabilitado por flag). Webhook de MP en `/api/mercadopago/webhook`.
4. **Renderizado**: páginas públicas con ISR (p. ej. `revalidate = 300` en home); admin dinámico.

## Variables de entorno
`ADMIN_SESSION_SECRET`, `ADMIN_BOOTSTRAP_PASSWORD`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `NEXT_PUBLIC_MP_PUBLIC_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.

## Puntos a tener en cuenta para el refactor
- **Archivos muy grandes** (candidatos a dividir): `product-manager.tsx` (~1550 líneas), `venture-finance-panel.tsx` (~1160), `financial-control.tsx` (~685), `CartDrawer.tsx` (~620), `quote-builder.tsx` (~200).
- **Duplicación / inconsistencias**: existen `src/components/product/ProductCard.tsx` y `src/features/products/components/product-card.tsx`; en `components/` se mezclan PascalCase y kebab-case (`CartDrawer.tsx` vs `cart-button.tsx`); los componentes de cart/home viven en `components/` mientras el resto del dominio está en `features/`.
- **Tipos repartidos**: `Product` está en `src/types/product.ts` y se re-exporta desde `features/products/types`; ese tipo importa tipos de `features/products/lib/*` (dependencia circular entre capas).
- **Caché en memoria de productos** (a nivel módulo): poco confiable en serverless/Vercel (cada instancia tiene la suya); se complementa con `revalidatePath`.
- **Auth casera** (cookie HMAC, secret por defecto en dev) y sin middleware: cualquier refactor debe mantener `requireAdmin()` en cada página/acción admin.
- **Sin tests**: refactorizar en pasos chicos y verificar con `npm run build` + `npm run lint`.
- El `README.md` es el default de create-next-app; la documentación real de carga de productos es `README-PRODUCTOS.md`.
