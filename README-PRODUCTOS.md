# Guía para agregar productos al catálogo

Usá esta plantilla cada vez que quieras sumar un producto nuevo. Pegala en el chat de Cursor y pedí que lo agregue a `src/data/initialProducts.ts` (y a Firestore cuando el catálogo ya esté migrado).

## Categorías principales (usar estos slugs)

- `decoracion-hogar` — Decoración y Hogar
- `infantil-ninos` — Infantil, Juegos y Maternidad
- `eventos-souvenirs` — Eventos, Fiestas y Souvenirs
- `organizadores-utilitarios` — Organizadores y Utilitarios
- `regalos-especiales` — Regalos y Frases Personalizadas

Un producto puede tener **más de una categoría**. Las temáticas (`topics`) son etiquetas más específicas, en minúsculas y con guiones: `cumpleanos`, `maternidad`, `hogar`, `gaming`.

## Plantilla para pedir un producto nuevo

Copiá y completá este bloque:

```
Nombre:
Categorías asignadas: (slugs, separadas por coma)
Temáticas: (slugs, separadas por coma)
Descripción corta: (1 oración para la tarjeta)
Descripción completa: (texto para ficha y cotización)
Materiales y espesores:
Dimensiones:
Acabado:
Es personalizable: Sí / No
```

### Ejemplo

```
Nombre: Velador Temático LED
Categorías asignadas: decoracion-hogar, infantil-ninos, regalos-especiales
Temáticas: infantil, personajes, iluminacion
Descripción corta: Velador calado con silueta de personaje o figura a elección e iluminación LED interior.
Descripción completa: Velador calado con silueta de personaje o figura a elección. Diseñado en espesor de 2 cm para albergar tiras o luces LED interiores, creando una iluminación ambiental cálida y mágica.
Materiales y espesores: MDF 18/20mm + calado MDF 3mm
Dimensiones: 20x20 cm aprox.
Acabado: Barnizado / Pintado
Es personalizable: Sí
```

## Qué tiene que cumplir el producto en código

Cada ítem sigue la interface `Product` en `src/types/product.ts`:

- `slug`: título en minúsculas, sin acentos, separado por guiones
- `categories` y `topics`: arrays de strings
- `specifications.customizable`: `true` o `false`
- `featuredImage`: por ahora puede ser `/principal.png` hasta tener foto propia
- `isActive`: `true` para que aparezca en la galería

## Prompt sugerido para Cursor

> Agregá este producto a `src/data/initialProducts.ts` siguiendo la interface `Product` de `src/types/product.ts` y la guía de `README-PRODUCTOS.md`. No cambies el modelo ni las categorías existentes.
