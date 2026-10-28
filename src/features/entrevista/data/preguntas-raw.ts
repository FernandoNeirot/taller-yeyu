// Formato: "## Seccion" abre una seccion; cada linea "pregunta § respuesta" es una pregunta.
// El id es el orden de aparicion (1..n), igual a la numeracion del apunte original.
export const PREGUNTAS_RAW = `
## A. JavaScript / ECMAScript
Que diferencia hay entre JavaScript y ECMAScript? § ECMAScript (ES) es la especificacion/estandar (ECMA-262) que define el lenguaje: sintaxis, tipos, objetos base. JavaScript es la implementacion de ese estandar (mas las APIs del entorno, como DOM o fetch en el navegador, o fs en Node). Los motores (V8, SpiderMonkey) implementan ES.
Que es "vanilla JS"? § JavaScript puro, sin frameworks ni librerias (sin React, jQuery, etc.). Solo el lenguaje y las APIs nativas del navegador.
Que trajo ES6 (ES2015)? § let/const, arrow functions, clases, template literals, destructuring, spread/rest, modulos (import/export), Promises, default params, Map/Set, Symbol, iteradores/generadores.
Diferencia entre var, let y const. § var: scope de funcion, se hoistea inicializada en undefined, permite redeclarar. let: scope de bloque, TDZ (zona muerta temporal), reasignable. const: scope de bloque, no se puede reasignar el binding (pero un objeto const si se puede mutar).
Que es el hoisting? § El motor "eleva" las declaraciones al inicio de su scope antes de ejecutar. Funciones declaradas se elevan completas; var se eleva como undefined; let/const se elevan pero no se pueden usar antes de su declaracion (TDZ).
Que es un closure? § Una funcion que recuerda y accede a las variables de su scope lexico de origen aun cuando se ejecuta fuera de el. Sirve para encapsular estado, factories, memoizacion, hooks de React.
Que es el scope lexico? § El alcance de una variable se determina por donde se escribe en el codigo, no por donde se invoca.
Cuales son los tipos de datos primitivos? § string, number, bigint, boolean, undefined, null, symbol. Todo lo demas es objeto.
Diferencia entre == y ===. § == compara con coercion de tipos; === compara valor y tipo sin coercion. Se recomienda siempre ===.
Diferencia entre null y undefined. § undefined: variable declarada sin valor asignado. null: ausencia intencional de valor, asignada explicitamente.
Como funciona "this" en JavaScript? § Depende de como se invoca la funcion: metodo de objeto -> el objeto; funcion suelta -> undefined (strict) o window; con call/apply/bind -> el indicado; con new -> la instancia nueva; arrow function -> hereda el this del scope donde se definio.
Para que sirven call, apply y bind? § Fijan el this. call(this, a, b) invoca ya con argumentos sueltos; apply(this, [a, b]) invoca con array; bind(this) devuelve una nueva funcion con this fijo, sin invocarla.
Que es el prototype / herencia prototipal? § Cada objeto tiene un enlace interno ([[Prototype]]) a otro objeto del cual hereda propiedades. La cadena de prototipos se recorre al buscar una propiedad. Las clases ES6 son azucar sintactico sobre esto.
Que es el event loop? § Mecanismo que permite a JS (un solo hilo) ser no bloqueante: ejecuta el call stack, y cuando esta vacio toma tareas de las colas: primero todas las microtareas (promesas, queueMicrotask) y luego una macrotarea (setTimeout, eventos, I/O). Repite.
Diferencia entre microtask y macrotask. § Microtask: callbacks de promesas (then/catch/finally), queueMicrotask, MutationObserver; se vacian por completo antes de la siguiente macrotask. Macrotask: setTimeout, setInterval, eventos de UI, I/O.
Que hace este codigo y en que orden imprime? console.log(1); setTimeout(()=>console.log(2)); Promise.resolve().then(()=>console.log(3)); console.log(4) § Imprime 1, 4, 3, 2. Lo sincronico primero, luego la microtask (promesa), luego la macrotask (setTimeout).
Que es destructuring? § Extraer valores de arrays u objetos en variables: const {a, b} = obj; const [x, y] = arr. Admite alias, defaults y anidamiento.
Que son spread y rest? § Ambos usan "...". Spread expande un iterable/objeto (copiar, mezclar). Rest agrupa argumentos o propiedades restantes en un array/objeto.
Diferencia entre copia superficial y profunda. § Superficial (spread, Object.assign) copia el primer nivel; los objetos anidados siguen compartiendo referencia. Profunda duplica todo: structuredClone(obj) (JSON.parse(JSON.stringify()) pierde funciones, fechas, undefined).
Que son los modulos ES (import/export)? § Sistema de modulos nativo: export nombrado/default e import. Es estatico (analizable por bundlers, habilita tree shaking), con scope propio y modo strict. Difiere de CommonJS (require/module.exports), que es dinamico y sincrono.
Diferencia entre CommonJS y ES Modules. § CJS: require/module.exports, sincrono, evaluacion dinamica, es lo clasico de Node. ESM: import/export, estatico, asincrono, soportado por navegadores. En ADS el server se empaqueta a index.cjs (CommonJS).
Que son map, filter y reduce? § Metodos de array no mutantes. map transforma cada elemento; filter devuelve los que cumplen una condicion; reduce acumula todo en un unico valor.
Que es la coercion de tipos? § Conversion automatica (implicita) de un tipo a otro, ej. "5" + 1 = "51", "5" - 1 = 4. Fuente comun de bugs.
Que son las template literals? § Strings con backticks que permiten interpolacion \${expr} y multilinea.
Que es optional chaining y nullish coalescing? § a?.b?.c accede de forma segura (devuelve undefined si algo es null/undefined). a ?? b devuelve b solo si a es null/undefined (a diferencia de || que tambien descarta 0, "" y false).
Que es el modo estricto ("use strict")? § Variante restringida del lenguaje: prohibe variables no declaradas, this undefined en funciones sueltas, etc. Los modulos ES son strict por defecto.
Que es el garbage collector? § Mecanismo del motor que libera memoria de objetos inalcanzables (mark and sweep). Los memory leaks tipicos: listeners sin remover, timers sin limpiar, referencias globales y closures retenidas.
Que es la inmutabilidad y por que importa en React? § No modificar datos existentes sino crear copias nuevas. React y Zustand detectan cambios comparando referencias; mutar el objeto impide detectar que cambio.
Que son los generadores e iteradores? § Iterador: objeto con next() que devuelve {value, done}. Generador (function*): funcion que pausa con yield y produce un iterador. Base conceptual de async/await.
Diferencia entre Map/Set y Object/Array. § Map admite claves de cualquier tipo y mantiene orden de insercion; Set guarda valores unicos. Tienen mejor performance en altas/bajas frecuentes.

## B. Asincronia: Promise, async/await, fetch
Que es una Promise? § Un objeto que representa el resultado futuro de una operacion asincrona. Estados: pending, fulfilled (resuelta) o rejected (rechazada). Una vez resuelta o rechazada es inmutable.
Como se consume una Promise? § Con .then(onFulfilled), .catch(onRejected) y .finally(); o con async/await. then devuelve otra promesa, lo que permite encadenar.
Que es el "callback hell" y como lo resuelven las promesas? § Callbacks anidados que vuelven el codigo ilegible. Las promesas permiten encadenar (.then) en forma plana y centralizar errores con un unico .catch.
Diferencia entre Promise.all, allSettled, race y any. § all: espera todas, falla si alguna falla. allSettled: espera todas y devuelve el estado de cada una (nunca rechaza). race: la primera en terminar (exito o error). any: la primera en cumplirse (ignora rechazos salvo que fallen todas).
Que es async/await? § Azucar sintactico sobre promesas. Una funcion async siempre devuelve una Promise; await pausa la funcion hasta que la promesa se resuelva (sin bloquear el hilo) y devuelve su valor.
Como se manejan errores con async/await? § try/catch alrededor del await. Tambien se puede encadenar .catch() a la llamada. Un await de promesa rechazada lanza una excepcion.
Que diferencia hay entre await secuencial y en paralelo? § Hacer await a cada una por separado ejecuta en serie (suma de tiempos). Para paralelo se lanzan todas y se espera con await Promise.all([...]). Ejemplo en ADS: perfil socio, permisos de acceso y grupo familiar se piden en paralelo.
Se puede usar await fuera de una funcion async? § Solo en el nivel superior de modulos ES (top-level await). En scripts clasicos o dentro de funciones comunes no.
Que pasa si me olvido el await? § Obtengo la Promise (pending) en lugar del valor, y los errores pueden quedar como "unhandled rejection".
Como convertir una funcion basada en callback a promesa? § Envolviendola: new Promise((resolve, reject) => cb((err, data) => err ? reject(err) : resolve(data))). En Node existe util.promisify.
Que es la API fetch? § API nativa del navegador (y Node 18+) para hacer requests HTTP basada en promesas. fetch(url, opts) devuelve una Promise<Response>.
fetch rechaza la promesa ante un 404 o 500? § No. Solo rechaza ante errores de red. Hay que verificar response.ok o response.status manualmente. Axios, en cambio, rechaza ante status fuera de 2xx.
Como se envia un POST con JSON usando fetch? § fetch(url, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) }) y luego const json = await res.json().
Para que sirve AbortController? § Para cancelar requests fetch (signal) por timeout o porque el usuario navego. Evita race conditions y respuestas obsoletas.
Diferencia entre fetch y axios. § Axios: interceptores, rechaza en status de error, parseo automatico de JSON, timeout, cancelacion, soporte uniforme. Fetch: nativo (sin dependencias), mas bajo nivel. En ADS se usa axios centralizado en use-request.tsx y fetch en ConfigApp (api/config).
Que es CORS? § Mecanismo del navegador que restringe requests entre origenes distintos. El servidor debe responder con headers Access-Control-Allow-Origin (y preflight OPTIONS para metodos/headers no simples). En ADS el Express usa el middleware cors.
Que es un "preflight"? § Request OPTIONS que el navegador manda antes del real cuando es cross-origin con metodo/headers/Content-Type no simples, para preguntar si esta permitido.
Que es el cache-busting y donde se ve en ADS? § Agregar un parametro unico (ej. timestamp) a la URL para evitar respuestas cacheadas. ConfigApp hace fetch('api/config?timestamp=...').
Que es debounce y throttle? § Debounce: ejecuta la funcion despues de que paso un tiempo sin nuevos disparos (ej. buscador de localidades con Merlin). Throttle: limita a una ejecucion cada X ms (ej. scroll/resize).
Que hace setInterval y que cuidado hay que tener? § Ejecuta una funcion periodicamente. Hay que limpiarlo con clearInterval (por ejemplo en el cleanup de useEffect) para evitar leaks. En ADS el chequeo de contingencia se repite cada 60 s.

## C. Eventos en la web
Que es un evento en el DOM? § Una senal que el navegador emite ante una accion o suceso (click, input, load, submit, keydown...) a la que se puede reaccionar con un listener/handler.
Como se registra un evento? § element.addEventListener('click', handler, options). Alternativas menos recomendadas: atributo HTML onclick o propiedad element.onclick (solo admite un handler).
Como se remueve un listener? § removeEventListener con la MISMA referencia de funcion (no sirve con una arrow anonima). O usar la opcion { signal } con un AbortController.
Que es el event bubbling y el capturing? § Fases de propagacion. Captura: del window hacia el elemento objetivo. Target: el elemento. Burbujeo: del elemento hacia arriba hasta window. Por defecto los listeners se ejecutan en burbujeo (capture: true cambia a captura).
Que hacen stopPropagation y preventDefault? § stopPropagation detiene la propagacion hacia otros nodos. preventDefault cancela la accion por defecto del navegador (enviar un form, seguir un link). Son independientes.
Que es la delegacion de eventos? § Poner un unico listener en un ancestro y detectar el origen con event.target. Ahorra listeners y funciona con elementos agregados dinamicamente.
Diferencia entre event.target y event.currentTarget. § target: el elemento que origino el evento. currentTarget: el elemento al que esta adjunto el listener actual.
Que son los CustomEvent? § Eventos propios: new CustomEvent('mi-evento', { detail: data, bubbles: true }) y se disparan con dispatchEvent. Base de la comunicacion entre web components.
Diferencia entre click, mousedown y mouseup. § mousedown al presionar; mouseup al soltar; click al completar ambos sobre el mismo elemento.
Diferencia entre los eventos input y change. § input se dispara en cada modificacion del valor; change al confirmar (blur o Enter, segun el control).
Que es la opcion "passive" en un listener? § Promete que el handler no llamara preventDefault, permitiendo al navegador optimizar scroll (touch/wheel).
Que es DOMContentLoaded vs load? § DOMContentLoaded: el HTML fue parseado y el DOM esta listo (sin esperar imagenes/CSS). load: la pagina y todos sus recursos terminaron de cargar.
Como manejan los eventos React? § Con SyntheticEvents: un wrapper multi-navegador. Se declaran por prop (onClick={fn}) y React delega internamente en la raiz. Desde React 17 se adjuntan al contenedor root, no a document.
Como evitar listeners huerfanos en React? § Registrar en useEffect y devolver la funcion de cleanup que hace removeEventListener.
Que son los eventos de teclado y que propiedad se recomienda usar? § keydown/keyup/keypress (este ultimo deprecado). Usar event.key (o event.code) en lugar de keyCode (deprecado).

## D. Web Components
Que son los Web Components? § Conjunto de estandares nativos para crear elementos HTML personalizados, reutilizables y encapsulados, sin framework. Tres pilares: Custom Elements, Shadow DOM y HTML Templates.
Que es un Custom Element? § Una clase que extiende HTMLElement y se registra con customElements.define('mi-tag', MiClase). El nombre debe contener un guion.
Cuales son los lifecycle callbacks de un custom element? § constructor, connectedCallback (se inserta en el DOM), disconnectedCallback (se remueve), attributeChangedCallback (cambia un atributo observado, requiere static observedAttributes), adoptedCallback (se mueve a otro documento).
Que es el Shadow DOM? § Un arbol DOM encapsulado dentro de un elemento (attachShadow({mode:'open'})). Aisla estilos y markup: el CSS de afuera no entra y el de adentro no sale.
Diferencia entre Shadow DOM open y closed. § open: element.shadowRoot es accesible desde JS externo. closed: devuelve null, no accesible (aunque no es una medida de seguridad real).
Que es <template> y <slot>? § <template> es HTML inerte que se clona cuando se necesita. <slot> es un punto de insercion donde se proyecta el contenido hijo del componente (composicion).
Como se comunican los web components con el exterior? § Entrada por atributos/propiedades; salida mediante CustomEvents. Para estilos: CSS custom properties (variables) que si atraviesan el shadow DOM y ::part().
Cuando conviene un Web Component vs un componente React? § Web Component: reutilizacion entre frameworks/microfrontends, design systems agnosticos. React: ecosistema, estado y render declarativo mas ergonomicos dentro de una app React.
React puede usar web components? § Si, como cualquier elemento HTML. Ojo con pasar props complejas (objetos) y eventos custom (en React 19 hay soporte mejorado).
Que relacion tienen los web components con los microfrontends? § Son una de las formas de integrar piezas independientes (junto con iframes, Module Federation). ADS antes usaba microfrontends con Module Federation y migro a un monolito modular.
Que es lit y para que sirve? § Libreria liviana de Google para escribir web components con templates reactivos, reduciendo el boilerplate.
Que es el Light DOM? § El DOM normal del documento (hijos que pasa el usuario al componente), por contraste con el Shadow DOM interno.

## E. Compilacion, transpilacion, build, bundling, minificacion, tree shaking
Que es compilar? § Traducir codigo de un lenguaje de alto nivel a otro de menor nivel (ej. a bytecode o binario). En web se usa en sentido amplio: transformar TS/JSX en JS ejecutable y optimizado.
Que es transpilar? § Caso particular de compilacion: traducir entre lenguajes del mismo nivel de abstraccion (TS -> JS, JSX -> JS, ES2022 -> ES5). Herramientas: tsc, Babel, SWC, esbuild.
Diferencia entre compilacion y transpilacion. § La compilacion baja de nivel (fuente -> codigo maquina/bytecode). La transpilacion mantiene el nivel (JS moderno -> JS antiguo, TS -> JS). En la practica se mezclan los terminos.
Que es el build? § El proceso completo que convierte el codigo fuente en artefactos listos para desplegar: transpila, resuelve imports, empaqueta, optimiza (minifica, tree shaking), genera la carpeta dist/ y copia assets.
Que es el bundling (empaquetado)? § Combinar muchos modulos y sus dependencias en uno o pocos archivos (bundles/chunks) para reducir requests y optimizar la carga. Lo hacen Webpack, Vite (Rollup), esbuild, Parcel.
Que es code splitting? § Dividir el bundle en chunks mas chicos que se cargan bajo demanda, mediante import() dinamico. Reduce el peso de la carga inicial.
Que es la minificacion? § Reducir el tamano del codigo sin cambiar su comportamiento: elimina espacios, comentarios, saltos de linea (queda en una sola linea) y acorta nombres de variables (mangling). Herramientas: Terser, esbuild, SWC.
Que es tree shaking? § Eliminacion de codigo muerto (exports que nadie importa) durante el build. Depende de ESM, que es estatico. Por eso las librerias deben publicarse como ESM y marcar "sideEffects": false cuando corresponde.
Por que tree shaking no funciona con CommonJS? § require es dinamico y no puede analizarse estaticamente; el bundler no sabe con certeza que partes se usan.
Que es un source map? § Archivo que mapea el codigo minificado/transpilado al original, para debuguear en el navegador con el codigo fuente.
Que es un polyfill y que diferencia hay con transpilar? § Transpilar reescribe sintaxis nueva; un polyfill agrega APIs faltantes (Promise, fetch) en el runtime viejo. La sintaxis no se puede polyfillear, las APIs si.
Que es Babel? § Transpilador JS configurable por presets/plugins (ej. preset-env, preset-react) que convierte sintaxis moderna a compatible con los navegadores objetivo (browserslist).
Que es un linter y un formatter? § Linter (ESLint): detecta errores y malas practicas. Formatter (Prettier): unifica estilo. En ADS corren via husky + lint-staged antes de commitear.
Que son SWC y esbuild y por que son rapidos? § Transpiladores/bundlers escritos en Rust y Go respectivamente (lenguajes compilados y paralelos), de 10-100x mas rapidos que Babel/Webpack (JS).
Que es el hashing de nombres de archivos en el build? § Agregar un hash del contenido al nombre (main.a1b2c3.js) para cache-busting: si el archivo cambia cambia el nombre, y se puede cachear por tiempo largo.
Que es HMR / Fast Refresh? § Hot Module Replacement: reemplaza solo el modulo modificado en el navegador sin recargar la pagina, preservando estado. Fast Refresh es la version de React. En ADS el front corre con Vite por eso.
Donde entra Node si un archivo TS en HTML "anda"? § Un navegador no entiende TypeScript. Si anda es porque ya se transpilo a JS. Node entra como runtime de las herramientas de build (Vite, Webpack, tsc) que transpilan y empaquetan, y como runtime del servidor (Express). No es necesario en produccion para el front, que son estaticos.
Que hace "el compilador de Node"? § Node no compila TS por si mismo (salvo flags experimentales de type stripping en versiones recientes). Da soporte de ejecucion (motor V8) y corre herramientas como Vite/Webpack/tsc que hacen la transpilacion y el empaquetado.
Cual es la diferencia entre dev y build/produccion? § Dev: servidor con HMR, sin minificar, source maps, rapido de iniciar. Build: optimizado, minificado, con hashes, tree shaking y code splitting, listo para servir.
Que es el modo de transpilacion TS a JS en una pagina como el TypeScript Playground? § Muestra el JS resultante de tsc: borra tipos (type erasure) y baja la sintaxis al target elegido (ES5, ES2020...). Una funcion basica con tipos queda como funcion JS comun sin anotaciones.
Que es el "target" en tsconfig? § Version de ECMAScript a la que se compila (ES5, ES2020, ESNext). Determina que sintaxis se baja.
Que son los chunks y los vendors? § Chunk: fragmento generado por el bundler. Vendor: chunk con dependencias de terceros (node_modules), separado para cachearlo aparte porque cambia poco.
Que es lazy loading? § Cargar recursos solo cuando se necesitan (modulos con import(), imagenes con loading="lazy"). En ADS cada modulo se carga con React.lazy al navegar (el chunk de reintegros se descarga recien al entrar a #/reintegros).

## F. Webpack y Vite (y como optimizar)
Que es Webpack? § Bundler de modulos configurable: parte de un entry point, arma el grafo de dependencias y genera bundles. Usa loaders (transforman archivos), plugins (extienden el proceso) y una config webpack.config.js.
Que son loaders y plugins en Webpack? § Loaders: transforman archivos individuales (ts-loader, css-loader, babel-loader). Plugins: actuan sobre todo el proceso de build (HtmlWebpackPlugin, MiniCssExtractPlugin, DefinePlugin).
Que es Vite? § Herramienta de build y dev server moderna. En dev sirve modulos ES nativos sin empaquetar (arranque casi instantaneo) pre-bundleando dependencias con esbuild; en produccion empaqueta con Rollup.
Por que Vite arranca mas rapido que Webpack en desarrollo? § Webpack empaqueta toda la app antes de servirla. Vite no empaqueta en dev: aprovecha ES Modules nativos del navegador y transforma bajo demanda solo lo que se pide, con esbuild (Go).
Diferencias principales Webpack vs Vite. § Webpack: maduro, muy configurable, ecosistema enorme de loaders, bundlea siempre. Vite: dev rapido por ESM nativo, config minima, build con Rollup, HMR rapido. Webpack suele elegirse para builds server/legacy; Vite para SPAs modernas.
Que usa ADS de cada uno? § Frontend: Vite (vite build con base '/mis-tramites'). Server Express: Webpack, que compila a un unico index.cjs. Se orquestan con scripts.js (npm run build en la raiz).
Que hace el "base" en la config de Vite? § Define el path publico base desde el cual se sirven los assets. En ADS es '/mis-tramites' en build y '/' en dev.
Que es el proxy del dev server de Vite? § Redirige ciertas rutas (ej. /api/*) a otro servidor. En ADS Vite (:3001) proxea /api a Express (:3000) para evitar CORS en desarrollo.
Como hacer que Vite sea mas optimo en el build? § Code splitting con import() / React.lazy; manualChunks para separar vendors; analizar el bundle (rollup-plugin-visualizer); comprimir (gzip/brotli); optimizar imagenes; excluir dependencias pesadas; usar imports especificos (no importar toda la libreria); build.target apropiado; remover console/debugger en prod.
Como se hace lazy loading de rutas en React con Vite? § const Reintegros = lazy(() => import('./modulos/reintegros/Root')); envuelto en <Suspense fallback={...}>. Vite/Rollup genera un chunk separado.
Que es optimizeDeps en Vite? § Pre-bundling de dependencias en dev (convierte CJS a ESM y agrupa modulos con muchas importaciones internas). Se puede configurar include/exclude.
Que son las variables de entorno en Vite? § Las que empiezan con VITE_ se exponen al cliente via import.meta.env. En ADS VITE_API_BASEURL define la baseUrl en modo mock. Nunca poner secretos ahi: terminan en el bundle publico.
Que son los modos (--mode) de Vite? § Permiten cargar distintos archivos .env (.env.mock, .env.production). ADS tiene un fullstart:mock para eso.
Que es manualChunks? § Opcion de Rollup/Vite para controlar como se agrupan modulos en chunks, tipicamente separando librerias de terceros (react, firebase) del codigo propio.
Que mejoras de configuracion/herramientas se pueden hacer a un proyecto Vite? § Plugin de compresion, analisis de bundle, plugin legacy para navegadores viejos, alias de paths (~), plugins de PWA, preload/prefetch de chunks, cache de CI (node_modules), usar SWC en lugar de Babel (plugin-react-swc).
Que es el entry point? § El archivo inicial desde el cual el bundler construye el grafo de dependencias. En Vite es index.html (que referencia main.tsx); en Webpack se define en entry.
Que es el "dist"? § Carpeta de salida del build. En ADS se arma frontend/dist, se copia a server/dist/public y se mueve a /dist en la raiz, que es lo unico que copia el Dockerfile.
Por que el Dockerfile de ADS no compila nada? § Porque el build corre antes, en el runner de GitLab. La imagen solo copia el dist ya compilado (COPY dist/ ./) y ejecuta node --env-file .env index.cjs. Imagenes mas livianas y reproducibles.
Que es Module Federation y por que ADS dejo de usarlo? § Feature de Webpack para compartir modulos entre apps independientes en runtime (microfrontends). Compilar y deployar todos los proyectos podia llevar hasta un dia, por lo que se consolido en un monolito modular con un solo bundle de Vite.
Que riesgos tiene un monolito modular frente a microfrontends? § Acoplamiento y un build unico mas pesado, despliegue todo-o-nada; a cambio simplifica versionado, dependencias compartidas y tiempos de deploy. Se mitiga con lazy loading por modulo y limites claros entre modulos.

## G. TypeScript
Que es TypeScript? § Superset tipado de JavaScript que se transpila a JS. Agrega tipos estaticos, interfaces, enums, generics, etc., detectando errores en tiempo de desarrollo.
Los tipos existen en runtime? § No. Se borran al transpilar (type erasure). Para validar datos en runtime hay que usar librerias como zod o validaciones manuales.
Diferencia entre interface y type. § Ambos describen formas. interface: extensible por declaration merging y extends. type: admite uniones, intersecciones, primitivas y tuplas. En objetos son casi intercambiables.
Que es "any", "unknown" y "never"? § any: desactiva el chequeo. unknown: valor de tipo desconocido que obliga a verificarlo antes de usarlo (seguro). never: tipo de lo que nunca ocurre (funciones que siempre lanzan, exhaustividad).
Que son los generics? § Tipos parametrizados que permiten reutilizar codigo manteniendo seguridad de tipos: function id<T>(x: T): T.
Que son union e intersection types? § Union (A | B): puede ser uno u otro. Interseccion (A & B): combina ambos.
Que son los utility types? § Tipos incorporados: Partial, Required, Readonly, Pick, Omit, Record, ReturnType, etc.
Que es el narrowing (estrechamiento de tipos)? § Refinar un tipo dentro de un bloque con typeof, instanceof, in o type guards personalizados.
Para que sirve tsconfig.json? § Configura el compilador: target, module, strict, paths, include/exclude, jsx.
Que hace el modo strict? § Activa un conjunto de chequeos estrictos (strictNullChecks, noImplicitAny, etc.). Recomendado siempre.
Como usa ADS los tipos TypeScript para los mocks? § Se parte del tipo TS que consume el front (ej. shared/types/TurnoTypes.ts) para armar el JSON del mock y asi respetar el contrato.
Como ejecuta ADS el server en desarrollo si esta en TS? § Con nodemon + ts-node (src/index.ts). Para produccion lo compila Webpack a index.cjs.

## H. Node.js y Express
Que es Node.js? § Runtime de JavaScript fuera del navegador basado en el motor V8, con un modelo de I/O asincrono no bloqueante orientado a eventos. ADS usa Node 24.
Que es npm y que diferencia hay entre npm install y npm ci? § npm es el gestor de paquetes. install respeta/actualiza package-lock; ci instala exactamente lo del lock (borra node_modules), mas rapido y reproducible. En ADS el build usa npm ci porque el runner de GitLab esta limpio.
dependencies vs devDependencies. § dependencies: necesarias en runtime/produccion. devDependencies: solo para desarrollar/compilar/testear (typescript, eslint, vite).
Que es package-lock.json? § Fija versiones exactas de todo el arbol de dependencias para builds reproducibles.
Que es Express? § Framework HTTP minimalista para Node basado en rutas y middlewares encadenados.
Que es un middleware? § Funcion (req, res, next) que se ejecuta en cadena; puede modificar req/res, terminar la respuesta o llamar a next(). El orden de registro importa.
Cual es el pipeline de middlewares del server de ADS, en orden? § 1) cors + express.json + urlencoded, 2) interceptor &num (redirige 302 a mis-tramites/#, para la vuelta de Mercado Pago), 3) express.static('public') con no-cache, 4) /health/live y /health/ready, 5) ApiRoutes (/api/config, /api/fechahora, /api/logger), 6) mocks solo si IS_MOCK=true, 7) fallback 307 a error4xx.html.
Que endpoints expone el Express de ADS y para que sirven? § /api/config (config del ambiente desde /app/conf/config.json), /api/fechahora (hora de Argentina), /api/logger (recibe eventos del front y los saca como JSON estructurado a Cloud Logging), /health/live y /health/ready (probes de K8s). Las APIs de negocio NO pasan por este server: el front llama directo al gateway.
Que pasa si /api/config no responde? § La app no arranca: ConfigApp registra el error y redirige a osde.com.ar/error/error5xx.html.
Por que el server devuelve hora propia (/api/fechahora)? § El cliente puede estar en cualquier huso horario o tener el reloj mal. Las ventanas de contingencia (fechaHoraDesde/Hasta) se evaluan contra la hora de Argentina del servidor.
Para que sirven los health checks liveness y readiness? § Liveness: Kubernetes reinicia el pod si falla. Readiness: Kubernetes no le envia trafico hasta que este listo.
Para que sirve nodemon? § Reinicia el server automaticamente al detectar cambios en los archivos (desarrollo). En mock, editar un mock reinicia el server.
Que es una variable de entorno y como se usa en Node? § Valor de configuracion externo al codigo, accesible via process.env. En ADS: node --env-file .env index.cjs y .env.mock agrega IS_MOCK=true.
Por que Node es de un solo hilo y como maneja concurrencia? § Un hilo de JS con event loop y un pool de hilos (libuv) para I/O bloqueante. Las tareas CPU-intensivas bloquean el loop; se resuelven con worker threads o procesos.

## I. Patrones de diseno
Que son los patrones de diseno? § Soluciones reutilizables y probadas a problemas recurrentes de diseno de software. Se agrupan en creacionales, estructurales y de comportamiento (GoF).
Cuales son las categorias GoF y un ejemplo de cada una? § Creacionales: Singleton, Factory, Builder. Estructurales: Adapter, Decorator, Facade, Proxy. De comportamiento: Observer, Strategy, Command, State.
Que es Singleton y donde aparece en front? § Una unica instancia global. Ejemplo: store global de Zustand, QueryClient de TanStack, instancia de axios.
Que es el patron Observer? § Un sujeto notifica a sus suscriptores ante cambios. Base de eventos del DOM (addEventListener), Redux/Zustand (subscribe) y RxJS.
Que es el patron Factory? § Funcion/clase que crea objetos ocultando el detalle de construccion. Ejemplo: getTramiteLayout() devuelve la config de pasos segun el tipo de tramite.
Que es Strategy? § Encapsular algoritmos intercambiables detras de una interfaz comun. Ejemplo: wizard por configuracion de autorizaciones, donde cada tipo define sus pasos.
Que es el patron Adapter? § Convierte una interfaz en otra esperada. Ejemplo: mapear la respuesta de /api/config al objeto Environment, o los DTOs de la API al modelo UserData.
Que es Decorator y su analogo en React? § Agregar funcionalidad a un objeto sin modificarlo. En React: los Higher-Order Components (HOC), ej. E2EHoc.
Que es Facade? § Interfaz simplificada sobre un subsistema complejo. Ejemplo: use-request.tsx expone una unica forma de llamar a APIs, ocultando si va a mock o al gateway.
Que es el patron Proxy? § Intermediario que controla el acceso a otro objeto. Ejemplo: el proxy del dev server de Vite hacia Express; el Gateway Apigee frente a los servicios.
Que es el patron Module? § Encapsular estado y funciones privadas exponiendo solo una API publica (closures / modulos ES). Es la base de la organizacion en ADS por modulos.
Que es el patron Provider / Context (inyeccion de dependencias)? § Un componente provee un valor a todo su subarbol sin pasar props. En ADS: QueryProvider, AuthProvider, cadena de wrappers en App.tsx.
Que es el patron Container / Presentational? § Separar componentes que manejan logica y datos (container) de los que solo renderizan (presentational). Hoy se logra con custom hooks.
Que es el patron Custom Hook? § Extraer logica con estado reutilizable en una funcion use*. Ejemplos en ADS: useAuth, useContingencia, useContratos, useReintegroSubmit.
Que es Compound Components? § Componentes que trabajan juntos compartiendo estado implicito (Tabs + Tab). Ejemplo cercano: el layout con stepper.
Que es el patron Render Props? § Pasar una funcion como prop que decide que renderizar. Hoy se reemplaza en gran parte por hooks.
Que es el patron Wrapper / Gate que bloquea el render? § Un componente que no renderiza a sus hijos hasta cumplir una condicion. En ADS: ConfigApp (hasta tener config), RemoteConfigContingenciaTotalWrapper, ProtectedRoutes, WrapperControlRya.
Que es el patron Error Boundary? § Componente de clase que captura errores de render de sus hijos y muestra un fallback. ADS envuelve cada ruta con Layout + Suspense + ErrorBoundary.
Que principios SOLID conoces? § S: una sola responsabilidad. O: abierto a extension, cerrado a modificacion. L: sustitucion de Liskov. I: segregacion de interfaces. D: inversion de dependencias.
Que es DRY, KISS y YAGNI? § DRY: no repetir logica. KISS: mantenerlo simple. YAGNI: no construir lo que no se necesita todavia.
Que ejemplo de violacion de DRY hay en ADS? § La regla RyA (inhibicion por deuda) esta implementada dos veces: en autorizaciones y en reintegros. Es candidata a refactor hacia cross-components o shared-context.

## J. React y ecosistema
Que es React? § Libreria de UI declarativa basada en componentes, con estado y render eficiente mediante Virtual DOM/reconciliacion. ADS usa React 19.
Que es el Virtual DOM y la reconciliacion? § Representacion en memoria del arbol de UI. React compara el arbol nuevo con el anterior (diffing) y aplica al DOM real solo los cambios minimos.
Que es JSX? § Sintaxis que mezcla HTML-like con JS, transpilada a llamadas a funciones (React.createElement / jsx runtime).
Diferencia entre props y state. § Props: datos de entrada inmutables que pasa el padre. State: datos internos del componente que al cambiar provocan re-render.
Que hace useState? § Declara una variable de estado y su setter. Actualizar el estado dispara un nuevo render. Las actualizaciones pueden ser asincronas/batcheadas; usar la forma funcional si depende del valor anterior.
Que hace useEffect y cuando se ejecuta? § Ejecuta efectos secundarios (fetch, suscripciones, timers) despues del render. El array de dependencias controla cuando se re-ejecuta; [] solo al montar. La funcion de retorno es el cleanup.
Que es el cleanup de un efecto? § Funcion que se ejecuta antes de re-ejecutar el efecto o al desmontar. Se usa para clearInterval, removeEventListener, cancelar requests.
Que son useMemo y useCallback? § Memorizan un valor calculado / una referencia de funcion entre renders segun dependencias. Evitan trabajo caro o re-renders de hijos memoizados. No usarlos por defecto.
Que es useRef? § Contenedor mutable que persiste entre renders sin provocar re-render al cambiar; sirve para referenciar nodos del DOM o guardar valores.
Que es useContext y su problema? § Lee el valor del Context mas cercano. Todos los consumidores re-renderizan cuando cambia el valor; por eso para estado global muy dinamico se prefiere Zustand/Redux.
Por que las keys en listas? § Permiten a React identificar elementos entre renders para reordenar/actualizar eficientemente. Deben ser estables y unicas (no el indice si la lista cambia).
Que son las reglas de los hooks? § Llamarlos solo en el nivel superior del componente/hook (no dentro de condicionales, loops o funciones anidadas) y solo desde componentes funcionales o custom hooks.
Que es React.lazy y Suspense? § lazy carga un componente bajo demanda con import(); Suspense muestra un fallback mientras llega. En ADS cada modulo y ProtectedRoutes usan lazy.
Que es un HOC? § Funcion que recibe un componente y devuelve otro con comportamiento agregado. En ADS: E2EHoc mockea el estado global para Playwright.
Controlled vs uncontrolled components. § Controlado: el valor del input vive en el state de React. No controlado: el DOM guarda el valor y se lee con ref. react-hook-form usa un enfoque mayormente no controlado (performante).
Que es TanStack Query y que problema resuelve? § Libreria para estado de servidor: cache, deduplicacion, reintentos, refetch, estados loading/error/success. useQuery para lecturas, useMutation para escrituras.
Que es una queryKey y por que importa? § Identificador del cache. Cada combinacion distinta es una entrada separada. En Mis tramites: ['requestTramitesFiltrado', filterQuery, cursor].
Diferencia entre estado de servidor y estado de cliente. § Servidor: datos remotos, asincronos y compartidos (TanStack Query). Cliente: estado de UI/sesion local (Zustand, useState). ADS los separa deliberadamente.
Que es Zustand y como se organiza en ADS? § Libreria minimalista de estado global basada en hooks. Hay un global store en shared-context (usuario, permisos, contingencias, environment), stores solo del shell y stores locales de cada modulo (ej. useModalStore).
Zustand vs Redux. § Zustand: menos boilerplate, sin providers, API simple. Redux: patron estricto (actions/reducers), devtools, middleware, mas ceremonia. Redux Toolkit reduce el boilerplate.
Que es react-hook-form? § Libreria de formularios con validacion que minimiza re-renders. En ADS se usa en los filtros de Mis tramites.
Que es React Router y que es HashRouter? § Libreria de ruteo declarativo. HashRouter usa la parte # de la URL (#/reintegros), no requiere configuracion del servidor para deep links. ADS lo usa, por eso la vuelta desde Mercado Pago pasa por el interceptor &num.
Como se protegen las rutas en React? § Con un componente (ProtectedRoutes) que verifica autenticacion y redirige si no cumple. En ADS: sin sesion -> signinRedirect a IAM; autenticado con token -> renderiza RoutesApp.
Que son los Server Components (React 19 / Next)? § Componentes que se renderizan en el servidor, sin enviar su JS al cliente; pueden acceder a datos directamente. 'use client' marca los que necesitan interactividad. Mas OSDE los usa con Next 16.
Que es Next.js? § Framework sobre React con routing por carpetas, SSR/SSG/RSC y build standalone. Mas OSDE usa Next 16 bajo /masosde. El Shell NO lo usa (es Vite + React).
Que es Storybook? § Catalogo de componentes aislados para desarrollarlos, probarlos y documentarlos. OSDE publica su design system como paquete npm storybook-frontend-socios (v5.5.10 en Shell).
Que causa un re-render innecesario y como se evita? § Cambios de estado/props/context que no afectan el resultado visual. Se evita con React.memo, useMemo/useCallback, dividir componentes, subir/bajar el estado y selectores de Zustand.
Que es la composicion vs herencia en React? § React favorece composicion (children, props) sobre herencia de clases. Ejemplo: layout compartido con stepper que recibe el contenido por children.
Como se testea un componente React? § Con React Testing Library + Jest/Vitest (tests unitarios/integracion) y Playwright para E2E. En ADS hay un modo isE2E con E2EHoc.
Que es Playwright? § Framework de testing E2E multi-navegador. En ADS se corre tambien en Docker (Dockerfile.test) para reproducir CI.

## K. Arquitectura del Shell Container (ADS)
Que es el Shell Container? § El frontend principal de Gestion de tramites (osde.com.ar/mis-tramites): una SPA React (Vite) que actua de "coraza/host" y monta modulos por tramite, servida por un Express minimo en un solo deploy.
Describi la arquitectura general en produccion. § Navegador -> Istio Gateway -> VirtualService -> Service :80 -> Pod (imagen base-nodejs-24, node index.cjs, puerto 3000) que contiene Express (/app/index.cjs), la SPA (/app/public) y el config.json (ConfigMap en /app/conf). El front llama directo al gateway de APIs de OSDE (Apigee), a IAM (IBM) y a Firebase Remote Config.
Por que decimos que es un monolito modular? § Es un unico bundle de Vite con un shell y carpetas por modulo (autorizaciones, reintegros, planes, discapacidad, facturacion-pagos, empadronamiento, laborales, datos-contacto, libro-de-quejas), cada uno con su Root.tsx cargado con lazy. Antes eran microfrontends con Module Federation.
Que son los nombres rutas-microfrontend/mf-*.ts hoy? § Un vestigio de la epoca de microfrontends: hoy son solo definiciones de rutas del navegador en shared-context/routes.
Explica el flujo de carga de la aplicacion. § App.tsx anida capas, cada una no renderiza a su hijo hasta terminar: QueryProvider -> ConfigApp (GET /api/config, stores de ambiente/OIDC/Firebase) -> RemoteConfigContingenciaTotalWrapper (Firebase + /api/fechahora, mantenimiento total?) -> Authentication (AuthProvider OIDC) -> Suspense/ProtectedRoutes (sin sesion redirige a IAM) -> RoutesApp/UserLayout (perfil, permisos y grupo familiar en paralelo) -> Layout -> modulo lazy.
Que salidas tiene el flujo de carga? § Error: redirect a error5xx.html (falla /api/config) o /error dentro de la SPA (fallan perfil/accesos/grupo familiar). Mantenimiento: /error/trabajando.html. Exito: Display App. Tambien logout para planes no permitidos (1-012) o ex-socio no titular, y pantalla UsuarioDadoDeBaja.
Que pasa si falla Firebase Remote Config? § Se hace console.error y la app sigue sin contingencias (no corta la carga). Si falla /api/fechahora se usa la hora local. El diagrama original decia error 500; el codigo es mas tolerante (conviene confirmar si es intencional).
Que pasa tras el login con IAM? § onSigninCallback decodifica el state con la ruta pedida, guarda el token, loguea [LOGIN_EXITOSO] y hace window.location.href a esa ruta (validada con safeRedirect). Es una recarga completa: la app vuelve a arrancar desde el paso 1, ahora con sesion.
Donde se guarda el token y por que? § En memoria (store), no en localStorage, para reducir el riesgo de robo por XSS. La sesion OIDC se guarda en Service Worker si el navegador lo soporta, si no en sessionStorage.
Como se renueva el token? § AuthEventsListener registra addAccessTokenExpiring, que hace un sign-in silencioso y vuelve a guardar el token. addUserLoaded lo guarda al cargar el usuario.
Por que el login_hint tiene doble encode? § Con un solo encode IAM no toma el valor. Se manda {"A":"D","B":"OVW","C":path} con doble encodeURIComponent.
Como se genera una version (npm run build en la raiz)? § 1) installAll (npm ci en server/ y frontend/), 2) build server (Webpack a index.cjs y copia .env), 3) build frontend (vite build, base '/mis-tramites', valida exit code y que exista dist), 4) integrar (frontend/dist -> server/dist/public), 5) mover server/dist a /dist, 6) Docker (COPY dist, CMD node index.cjs).
Como se levanta el proyecto en local? § npm install en raiz, frontend/ y server/ (tres veces), Node 24+. npm run fullstart (Vite :3001 + Express :3000 con nodemon, config -> test, IAM real) o fullstart:mock (usuario mock, sin Firebase ni IAM, APIs simuladas). La salida se mezcla con prefijos [0]=server, [1]=frontend.
Diferencias entre fullstart y fullstart:mock. § fullstart: login IAM real de test, Remote Config real, APIs al gateway de test, sin mocks, permisos reales. fullstart:mock: usuario mock en useAuth.tsx, sin contingencias ni IAM, APIs a VITE_API_BASEURL (:3000), IS_MOCK=true registra los mocks, permisos todo en true.
Donde esta el switch mock/real? § cross-components/hooks/use-request.tsx: baseUrl = isMock ? VITE_API_BASEURL : environment.gatewayApi. Por eso cada endpoint nuevo necesita su mock en server/src/router/mockApi/<dominio>/ para funcionar en mock.
Por que npm start no funciona sin build? § Ejecuta el dist compilado; si no hubo build no hay nada que correr. En desarrollo se usa fullstart.
Explica la estructura de frontend/src. § main.tsx (monta App), modulos/ (shell = host + un modulo por tramite), shared-context/ (lo compartido no visual: rutas, urls.ts, global store, tipos, hooks, utils, analytics, mocks), cross-components/ (lo compartido visual e infraestructura de UI: componentes, QueryProvider, use-request, layout-tramite-con-stepper).
Diferencia entre shared-context y cross-components. § shared-context: lo "no visual" (rutas, URLs de servicios, store global, tipos, utilidades, analytics). cross-components: lo visual e infraestructura de UI (componentes compartidos, QueryProvider, useRequest, layout con stepper). Ambos son capas transversales importadas por cualquier modulo.
Anatomia de un modulo (ej. reintegros). § Root.tsx (mini-router con lazy + NotFoundRedirect) -> routes/ (array path/element/key) -> pages/ (layout + pantalla) -> hooks/ (useQuery/useMutation) -> services/ (requests a urls.ts); ademas store/ (Zustand local), business/utils/helpers (reglas puras), components/, types/, mocks/assets.
Donde buscas la URL de un servicio backend? Y la de una ruta del navegador? § Servicio: shared-context/services/urls.ts (todas las URLs en un solo lugar). Ruta del navegador: shared-context/routes/rutas-microfrontend/mf-*.ts.
Que es el layout con stepper? § cross-components/layout-tramite-con-stepper: el tramite define solo sus pasos y contenido; el layout resuelve navegacion adelante/atras, marca el paso actual, puede ocultar el stepper y maneja el caso sin permiso. Es el estandar de los tramites nuevos (ej. datos personales, medicamentos, planes).
Estilo viejo vs nuevo de tramites en ADS. § Viejo: pantallas y layout hechos a mano (datos de contacto, reintegros con LayoutWithConditionalBackPath propio). Nuevo: stepper/layout generico de cross-components con tramites/<tramite>/pasos (datos personales, planes, CUD). Conviven incluso dentro de un mismo modulo.
Como decide la app si un tramite esta deshabilitado? § isTramiteDisabled(): se deshabilita si el socio no tiene permiso (permisos de acceso, servicio por plan) o si el tramite esta en contingencia (Remote Config). Son las dos fuentes de "no podes entrar" de toda la app.
Que es el doble contrato y como se resuelve? § Un socio puede tener otroContrato. Layout.tsx ofrece el cambio (ModalCambioContrato); al confirmar se guarda sessionStorage.contrato ('contratoPorDefecto' | 'otroContrato'), se hace setUser y se recalcula isTitular. La app lee el contrato activo con getNameContratoFromStorage(), por eso sobrevive a un reload.
Como funciona el onboarding de la home? § NewsModal se muestra si localStorage.showNewsModal no existe o vale 'true'. "Comenzar" activa el ProductTour (react-joyride, 3 pasos) que se engancha a selectores del DOM (#sideMenuDesktop, #menu-display-header, .accesos-rapido-id-joyride). Si se renombran, el tour se rompe sin error.
Como funciona la paginacion de Mis tramites? § Por cursor (&cursor=...), de a 15 (la home muestra 5). Los filtros (tipo, estado, rango de fechas) arman la query string a mano en onSubmit. queryKey incluye filtros y cursor.
Como funciona el wizard por configuracion de autorizaciones? § 6 tipos (internacion/cirugia, medicamentos, practicas/estudios, traslados, protesis, ortopedia) usan las mismas paginas; getTramiteLayout() en GetStepsTramite.tsx define el orden y cuales se usan. Un tipo nuevo es casi solo una entrada mas en ese array.
Como se resuelve el flujo de Medicamentos? § Consulta recetas electronicas del integrante: con recetas -> PASOS_DEL_STEPPER (4 pasos, POST receta-electronica); sin recetas -> PASOS_FLUJO_NORMAL (3 pasos).
Que es Merlin? § Servicio de OSDE (/os-merlin/rest) que normaliza direcciones y telefonos. La busqueda de localidad usa debounce y ModalCoincidenciasMerlin hace elegir la direccion oficial.
Como funciona el OTP en datos de contacto? § Email nuevo -> POST otp/mail/send (devuelve tramite OTP con id) -> ModalOTP -> POST otp/mail/validacion/:id. Se guarda la URL de validacion en el store (setUrlOTP) y el mismo modal sirve para email y celular. Tiene reenvio.
Que validaciones hace la home de reintegros antes de dejar solicitar? § Inhibicion RyA por deuda (marcas M.INHIBIDO RyA), cuenta de acreditacion activa, formulario inicial (GET reintegros/form/:id) y contingencias separadas (cont_reintegro, cont_cuenta_credito, cont_reporte_arca).
Que es el reintegro automatico? § Para consultas medicas con permisoReintegroAutomatico, se usa Document AI (POST /os-documentosads/v1/reintegros/procesar) que extrae campos de la factura. El permiso lo calcula UserLayout con el feature flag reintegroAutomatico de Remote Config por filial y plan.
Como se autocompletan los datos de una factura en reintegros? § useQrDecoder (jsQR + pdfjs) decodifica el QR fiscal de ARCA/AFIP y completa CUIT, importe y tipo de documento. Caso borde: DNI (65) con 8 digitos o menos pasa a 96.
Como se identifica el banco en la cuenta de acreditacion? § Por los primeros 3 digitos del CBU contra bancos-cbu. Si no esta, ModalErrorBancoInhabilitado. Luego cbu/validate y POST cuenta-credito.
Como se crean y usan los mocks? § Se toma un usuario valido de test y se copia la respuesta real del endpoint a mockApi/<dominio>/. Si el endpoint recibe un ID, el mock lo ignora. Para forzar un caso se edita el mock (nodemon reinicia), por ej. un 500 o reintegros.status = false. Siempre hay que probar contra el ambiente: el mock es una caja de arena.
Que cuidados hay al modificar mocks? § Un mock modificado afecta a todo lo que sigue; revertirlo (git restore server/src/router/mockApi) antes de pasar a otro tramite. Partir del tipo TS que consume el front para respetar el contrato.
Que es el interceptor &num del server? § Si la URL trae &num, redirige 302 reemplazandolo por mis-tramites/#. Es para la vuelta desde Mercado Pago, porque la SPA usa rutas con #.
Como funciona la ruta /arrepentimiento? § Se renderiza en ConfigApp, sin login (caso especial), porque el boton de arrepentimiento debe ser accesible sin autenticacion.
Que pasa con una ruta que Express no reconoce? § El fallback responde 307 a <environmentUrl>/error/error4xx.html.
Como hace Express para que la misma imagen sirva a desa, test y prod? § El config del ambiente viene de un ConfigMap montado en /app/conf/config.json (generado por Kustomize desde overlays/<env>/config.json). Lo unico que cambia entre ambientes es el ConfigMap. En local no existe, el server loguea un error (normal) y usa configLocal.ts, que apunta a test.
Que headers de cache usa el server y por que? § no-cache en todo el contenido estatico, para que el navegador siempre revalide y tome la ultima version tras un deploy.

## L. Autenticacion / seguridad
Que es OAuth 2.0 y que agrega OpenID Connect (OIDC)? § OAuth 2.0 es un protocolo de autorizacion (access token). OIDC es una capa de identidad encima: agrega el id token (JWT que dice quien es el usuario) y endpoints estandar (userinfo, discovery).
Que proveedor de identidad usa ADS? § IBM Security Verify (idosde... ibmcloud.com, "IAM IBM") para los socios, mediante react-oidc-context. Para empleados (cuentas corporativas) se usa ADFS, que no aparecio todavia en los repos revisados.
Que es ADFS? § Active Directory Federation Services: proveedor de identidad de Microsoft para cuentas corporativas, soporta OIDC/SAML. Mismo protocolo, distinto proveedor.
Que es un JWT? § JSON Web Token: tres partes base64url (header.payload.signature). El payload tiene claims (sub, exp, etc.). Esta firmado (integridad), pero NO cifrado: no poner datos sensibles. En ADS se decodifica para sacar el IC del socio (decodeJWT).
Que es el flujo Authorization Code con PKCE? § Flujo recomendado para SPAs: el cliente redirige al IdP, recibe un code y lo cambia por tokens usando un code_verifier (PKCE), evitando que un code interceptado sea util.
Diferencia entre autenticacion y autorizacion. § Autenticacion: probar quien sos (login IAM). Autorizacion: que podes hacer (permisos de acceso por plan, permisosFuncionalidades).
Diferencia entre autenticacion y accesibilidad. § Son conceptos distintos. Accesibilidad (a11y) es que la UI sea usable por cualquier persona (lectores de pantalla, teclado, contraste, WCAG). Ojo: el item de la evaluacion decia "accesibilidad" y puede referirse a autorizacion.
Que es la tokenizacion? § Dos sentidos: (1) tokens de sesion (JWT, Bearer en Authorization). (2) Tokenizacion de tarjetas: se reemplaza el numero por un token del procesador (ADS tiene decidirUrl, Decidir /api/v2/tokens) para no manejar el dato real (PCI).
Que es XSS y como se previene en React? § Cross-site scripting: inyeccion de JS en la pagina. React escapa por defecto lo interpolado en JSX; hay que evitar dangerouslySetInnerHTML, sanitizar HTML y no guardar tokens en localStorage.
Que es CSRF? § Cross-site request forgery: un sitio malicioso hace que el navegador de un usuario autenticado envie requests. Se mitiga con tokens anti-CSRF, SameSite cookies y usando Bearer en headers en vez de cookies.
Que es un open redirect y que mitigacion hay en ADS? § Redirigir a una URL controlada por un atacante. ADS valida el destino post-login con safeRedirect.
Que son los certificados TLS y que problema hay en OSDE? § TLS/SSL habilita HTTPS. OSDE tiene una CA privada: hay que instalar los certificados raiz e intermedio para entrar a sitios internos; el GitLab interno usa un certificado que git no reconoce (error self signed certificate, documentado en el README).
Que es Veracode? § Herramienta de analisis estatico de seguridad (SAST) exigida por OSDE. Corre en el .gitlab-ci.yml y localmente desde VS Code con credenciales HMAC propias. El Shell ademas usa SonarQube.
Que es HashiCorp Vault y como se usa? § Almacen de secretos. El pipeline obtiene de Vault la service account de GCP y los secretos de la app (PATH_VAULT, SECRET_FILE, ENV_SECRET_FILE), asi no quedan en el repositorio.

## M. Contingencias (Firebase Remote Config / Istio)
Que tipos de contingencia existen en ADS? § (1) Contingencia por bloqueo de trafico (total): un pipeline de GitLab corta el trafico via Istio y redirige a /error/trabajando.html. (2) Contingencia de tramites (parcial): variables de Firebase Remote Config que bloquean tramites o dashboards puntuales y muestran mensajes.
Que es Firebase Remote Config? § Servicio de Google que entrega valores editables desde una consola sin redeployar. ADS lo usa para contingencias y feature flags, con re-chequeo cada 60 segundos.
Como se evalua una variable de contingencia de tramite? § Estructura: {titulo, descripcion, fechaHoraDesde, fechaHoraHasta, enContingenciaForzado}. Si enContingenciaForzado == true -> tramite APAGADO. Si es false, se evaluan las fechas: si la hora actual esta entre Desde y Hasta -> APAGADO. Cualquier otro caso -> ACTIVO.
Contra que hora se evaluan las fechas? § Contra la hora del servidor de Argentina (/api/fechahora), no la del cliente.
Cada cuanto se re-evalua y por que? § Cada 60 s con setInterval, porque una contingencia puede activarse con la app abierta.
Como se llaman las variables para los dashboards y para los tramites? § Dashboards: dashboard_inicio, dashboard_discapacidad, dashboard_facturacion, dashboard_gestiones_medicas, dashboard_mi_afiliacion, dashboard_mis_datos, dashboard_mis_tramites, dashboard_reintegros. Tramites: prefijo cont_ (cont_reintegro, cont_autorizaciones, cont_credencial_provisoria, cont_cuenta_credito, cont_reporte_arca, cont_disca_cud, etc.).
En que proyectos Firebase viven las variables? § Uno por ambiente: os-desa-ads-gest-de-tramites, os-test-ads-gest-de-tramites y os-prod-ads-gest-de-tramites. Se necesita el grupo de Google correspondiente (ej. ac-gcp-ads-gest-de-tramites-prod@grupoosde.com.ar) para editar Remote Config.
Como se pone en contingencia TOTAL ADS WEB? § En GitLab, repo shell-container: crear un pipeline sobre la rama main con la variable OMITIR_IMAGEN=1 (cualquier valor sirve). Corren jobs automaticos que habilitan los jobs por ambiente; hay que ejecutar el deploy de desa (habilita test) y luego test y prod. Esto NO deploya la app, solo prepara el pipeline. Luego se ejecuta el job contingencia_up en el ambiente deseado.
Que hace contingencia_up y contingencia_down? § contingencia_up corta el trafico hacia el servicio de ADS WEB y redirecciona a /error/trabajando.html. contingencia_down restaura el ruteo original hacia el servicio.
Que permisos se necesitan para ejecutar la contingencia? § Pertenecer al grupo de AD AC-00-OS-00-MN-GITLAB-GestionTramites-ADS y pedir a DevOps que habiliten al usuario a ejecutar el proyecto en cada rama (proyecto de deploy servicios-socios-deploy/gestion-de-tramites-ads/front-end/shell-container-deploy).
Y para el buscador de sucursales? § Mismo grupo de AD y procedimiento analogo, con su propio repo (buscador-web-de-caps-y-filales-app) y los jobs contingencia_up / contingencia_down. URL: osde.com.ar/contacto/buscadorsucursales.
Que componente de infraestructura realiza el corte de trafico? § Istio: sus VirtualServices deciden a que Service va cada path; el job modifica el ruteo para mandar a la pagina de mantenimiento.
Que pasa en el front cuando hay contingencia total desde Remote Config? § isContingenciaTotalActiva() (forzado o dentro del rango) hace redirect a /error/trabajando.html?t=<descripcion en base64>.
Que son los feature flags? § Banderas de configuracion que activan/desactivan funcionalidades sin redeploy, o por segmento (ej. reintegro automatico por filial y plan).
Cual es la diferencia entre contingencia total por pipeline y por Remote Config? § Pipeline: corta el trafico a nivel de infraestructura (aunque la app falle). Remote Config: lo decide la propia app en runtime, y permite apagar solo tramites o dashboards y mostrar mensajes, pero depende de que la SPA pueda cargar.

## N. Infraestructura y DevOps
Que es Docker y que ventaja tiene? § Empaqueta app + runtime en una imagen inmutable que corre igual en cualquier entorno. En ADS la imagen base es base-nodejs-24 y solo copia el dist.
Imagen vs contenedor. § Imagen: plantilla inmutable (capas). Contenedor: instancia en ejecucion de una imagen.
Que es Kubernetes y cuales son sus objetos basicos? § Orquestador de contenedores. Pod (unidad minima), Deployment (replicas y rollouts), Service (IP/DNS estable), ConfigMap/Secret (configuracion), HPA (autoescalado), Ingress/VirtualService (entrada de trafico).
Que es GKE y que es Tanzu? § GKE: Kubernetes administrado de Google Cloud, donde despliega ADS. VMware Tanzu: plataforma para Kubernetes on-premise; aparece en la red LAN de OSDE del diagrama (sin ver en los repos revisados).
Que es Kustomize y como se organiza? § Herramienta para personalizar manifiestos de K8s sin templates: base/ + overlays/desa|test|prod. En ADS los overlays incluyen el config.json por ambiente via configMapGenerator.
Que es un ConfigMap? § Objeto de K8s con configuracion no secreta. En ADS (config-properties-json) se monta como volumen en /app/conf.
Que es el HPA? § Horizontal Pod Autoscaler: escala la cantidad de pods segun metricas (CPU, memoria).
Que es Istio? § Service mesh: Gateway y VirtualServices controlan ruteo por path, redirects y trafico entre servicios, y habilita seguridad (mTLS) y observabilidad.
Que es un VirtualService? § Recurso de Istio que define reglas de ruteo: que host/path va a que Service. Ahi viven los redirects y el corte de contingencia.
Que es Harbor? § Registry privado de imagenes Docker. Proyecto os-gestiontramites-ads. Fuera de la red se accede por harbor.global.osde.ar, no por harbor1.osde.ar.
Que es Nexus? § Repositorio de artefactos/paquetes (npm, Java) que actua de proxy/cache de dependencias; figura en el diagrama (Nexus Repository con npm y Java).
Que es GitLab CI/CD? § Pipelines declarados en .gitlab-ci.yml que corren en runners: install -> build -> tests -> imagen -> deploy. Usan templates corporativos. El repo de K8s tiene su propio pipeline para actualizar la version de imagen.
Que son stages y jobs? § Stage: fase del pipeline (build, test, deploy). Job: tarea concreta dentro de un stage. Los jobs de un stage corren en paralelo.
Cual es el flujo de CI/CD de punta a punta segun el diagrama? § Desarrollo (VS Code, Git, Veracode, Figma, Google Docs) -> GitLab (proyectos de aplicaciones y de deploy; runners: build, test, deploy a Doc/Test/Prod) -> Nexus (dependencias) -> Harbor (imagenes) -> GKE con Istio (namespaces mf y ms) -> Load Balancer -> navegador. Vault entrega secretos al pipeline.
Que es Cloud Logging y como llega el log del front? § Servicio de GCP que centraliza logs de pods. El front POSTea a /api/logger y Express imprime JSON estructurado con severity y logging.googleapis.com/trace, para que GCP lo indexe y agrupe.
Que es Apigee? § API gateway de Google. En el diagrama es el gateway por el que el front accede a las APIs de OSDE (con JWT), hacia SAP/ESB en la LAN via VPN.
Para que sirve la VPN del diagrama? § Conecta de forma segura Google Cloud con la red LAN de OSDE (SAP, ESB, Active Directory, Tanzu).
Que es un CDN (Cloud CDN / Cloudflare)? § Red de servidores distribuidos que cachea contenido estatico cerca del usuario y puede proteger (WAF, DDoS). Aparecen Cloud CDN en GCP y Cloudflare en el borde.
Que es un Load Balancer? § Distribuye el trafico entre instancias/pods para disponibilidad y escala.
Que es Kubernetes Namespace? § Particion logica de un cluster para aislar recursos. El diagrama muestra namespaces separados (ej. microFrontEnds y microservicios).
Que es ExternalDNS? § Componente que crea registros DNS automaticamente a partir de recursos de K8s.
Que es el Dockerfile.test de ADS? § Dockerfile para correr los tests E2E como en CI.

## O. Backend, REST, SSR/CSR y conceptos generales
Que es una API REST? § Estilo arquitectonico sobre HTTP: recursos identificados por URL, verbos (GET/POST/PUT/PATCH/DELETE), stateless, representaciones (JSON) y codigos de estado.
Armar vs consumir una API REST. § Armar: definir recursos, verbos, codigos de estado y contratos del lado servidor. Consumir: llamarla desde un cliente. En ADS se arman pocos endpoints propios (/api/config, /fechahora, /logger) y se consumen las APIs de negocio del gateway.
Verbos HTTP y su semantica (idempotencia). § GET (lee, seguro, idempotente), POST (crea, no idempotente), PUT (reemplaza, idempotente), PATCH (modifica parcial), DELETE (elimina, idempotente).
Codigos de estado mas comunes. § 200 OK, 201 Created, 204 No Content, 301/302/307 redirects, 400 Bad Request, 401 No autenticado, 403 Prohibido, 404 No encontrado, 409 Conflicto, 500 Error del servidor, 502/503 Servicio no disponible.
Diferencia entre 401 y 403. § 401: no autenticado (falta o es invalido el token). 403: autenticado pero sin permiso.
Diferencia entre 302 y 307. § Ambos son redirecciones temporales. 307 preserva el metodo y el body (POST sigue siendo POST); 302 historicamente puede cambiar a GET.
Que es SSR (Server Side Rendering)? § El servidor genera el HTML ya con datos y el navegador lo recibe listo. Mejora SEO y primera carga. Mas OSDE lo usa con Next.js y React Server Components.
Que es CSR (Client Side Rendering)? § El servidor manda HTML casi vacio + JS y el navegador arma la UI y pide los datos. El Shell es una SPA CSR (Vite + HashRouter): tiene sentido porque esta detras de login y el SEO no importa.
SSR vs CSR vs SSG. § SSR: HTML en cada request. CSR: HTML vacio, UI en el cliente. SSG: HTML generado en build. SSR/SSG mejoran SEO y LCP; CSR simplifica infraestructura.
Que es una SPA? § Single Page Application: una sola carga de HTML; la navegacion se resuelve en el cliente sin recargar la pagina.
Que es hydration? § Proceso por el cual React "activa" en el navegador el HTML renderizado en el servidor, adjuntando eventos y estado.
Que es un gateway de APIs? § Punto de entrada unico para las APIs: autenticacion, rate limiting, ruteo y monitoreo. En ADS: gatewayApi (viene en /api/config).
Que es GraphQL vs REST? § GraphQL: un endpoint donde el cliente pide exactamente los campos que necesita. REST: multiples endpoints con respuestas fijas.
Que es idempotencia y por que importa en reintentos? § Repetir la operacion produce el mismo resultado. Permite reintentar sin duplicar efectos; TanStack Query reintenta GETs automaticamente.
Que es la paginacion por cursor vs por offset? § Offset: pagina N con saltos (se desordena si cambian datos, lento en grandes). Cursor: apunta al ultimo elemento visto; estable y eficiente. Mis tramites usa cursor.

## P. Calidad, Git y documentacion
Que es Git y que es GitLab? § Git: control de versiones distribuido. GitLab: plataforma que aloja repos y CI/CD; en OSDE es git.osde.ar.
Diferencia entre merge y rebase. § Merge une historias con un commit de merge (conserva la historia real). Rebase reaplica commits sobre otra base para una historia lineal (reescribe historia; no usar en ramas compartidas).
Que es Conventional Commits y quien lo valida en ADS? § Convencion de mensajes (feat:, fix:, chore:, docs:, refactor:...). Husky + commitlint lo validan y lint-staged corre ESLint y Prettier antes de commitear.
Que es husky y lint-staged? § Husky ejecuta hooks de Git (pre-commit, commit-msg). lint-staged corre linters solo sobre los archivos en staging.
Que es un pull/merge request y que se revisa? § Propuesta de cambios para revision de pares: correctitud, legibilidad, tests, seguridad, estilo y alcance.
Que es git stash, cherry-pick y revert? § stash guarda cambios sin commitear temporalmente. cherry-pick aplica un commit puntual en otra rama. revert crea un commit que deshace otro (seguro en ramas compartidas).
Que es una estrategia de branching (gitflow / trunk-based)? § Gitflow: ramas develop/release/hotfix. Trunk-based: ramas cortas contra main con integracion continua. ADS usa ramas release (ej. release/3.27) y pipelines por rama/ambiente.
Que es SonarQube? § Plataforma de analisis estatico de calidad (bugs, code smells, cobertura, deuda tecnica). En ADS hay un script sonnar.
Que tipos de tests existen? § Unitarios, de integracion, E2E, de contrato, de regresion visual, de performance. Piramide: muchos unitarios, menos integracion, pocos E2E.
Que es UML y que diagramas se usan en ADS? § Lenguaje estandar de diagramas. Los mas usados: flujo/actividad (flujo de carga), secuencia (mensajes en el tiempo, ej. navegador -> Server Component -> servicio -> API) y deployment (donde corre cada pieza: Istio -> Service -> Pod -> HPA).
Que es Markdown y Mermaid? § Markdown: texto plano con marcas livianas (#, **, listas) usado en READMEs y CHANGELOGs. Mermaid: sintaxis de diagramas en texto que GitLab renderiza dentro de bloques de codigo.
Que es un CHANGELOG y versionado semantico? § CHANGELOG: registro de cambios por version. SemVer: MAJOR.MINOR.PATCH (breaking.feature.fix).

## Q. Preguntas de contexto / comportamiento
Contame el proyecto al que te asignaron. § Gestion de tramites de OSDE (osde.com.ar/mis-tramites): SPA React + Vite con un shell que monta modulos por tramite (autorizaciones, reintegros, planes, discapacidad, datos de contacto...), servida por un Express en GKE/Istio, con login IAM (OIDC), contingencias por Firebase Remote Config y APIs de negocio via gateway Apigee.
Que experiencia previa tenes con React/TypeScript/Node? § (Respuesta personal: mencionar proyectos, hooks, TanStack Query, Zustand, Express, y disposicion a aprender el stack de ADS.)
Como abordarias un bug en produccion de un tramite? § Reproducir en test/mock, revisar logs en Cloud Logging (/api/logger, trace id), revisar si hay contingencia o feature flag activo, aislar el modulo, corregir con test, branch + MR, pipeline y deploy por ambientes. Si es critico, usar contingencia del tramite via Remote Config.
Como agregarias un tramite nuevo? § Crear carpeta en modulos/ (o tramite dentro de un modulo) con Root.tsx, routes, pages/pasos, hooks, services con URLs en urls.ts, usar layout-tramite-con-stepper, agregar ruta en mf-*.ts y RoutesApp, card/acceso rapido, variable cont_<tramite> de contingencia, permiso de acceso, analytics (GTM), mocks en server/src/router/mockApi y tests.
Como agregarias un acceso rapido en la home? § Agregar una entrada al array de pages/Home/utils/accesosRapidos.ts (id, label, link con MicrofrontendRoutes, evento de analytics); isTramiteDisabled resuelve permisos y contingencia.
Como pondrias en mantenimiento solo un tramite? § En Firebase Remote Config del ambiente (necesito el grupo de Google), editar la variable cont_<tramite> con titulo, descripcion, fechaHoraDesde/Hasta o enContingenciaForzado=true. En hasta 1 minuto la app lo toma.
Y si hay que cortar toda la aplicacion? § Pipeline en GitLab sobre main con OMITIR_IMAGEN=1, habilitar jobs (desa -> test -> prod) y ejecutar contingencia_up en prod. Para volver, contingencia_down.
Que harias para mejorar la performance de carga del front? § Medir (Lighthouse, visualizer de bundle), mas code splitting y lazy, manualChunks para vendors, comprimir (brotli), optimizar imagenes y fuentes, memoizacion donde corresponda, evitar re-renders, paralelizar requests (Promise.all/TanStack), cache de queries.
Que mejoras propondrias al proyecto? § Unificar la regla RyA duplicada, migrar tramites viejos al stepper generico, completar mocks faltantes, revisar el vestigio mf-*, limpiar codigo muerto en GetStepsTramite, confirmar tolerancia ante caida de Remote Config, actualizar README (Node 24) y completar el rename AFIP -> ARCA.
`;
