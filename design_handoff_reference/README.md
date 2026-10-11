# Handoff: Procar Performance — Sitio web v3

## Overview
Rediseño del sitio de **Procar Performance LLC**, taller de diagnóstico automotriz especializado en electrónica (ECU, programación de módulos, redes CAN). La estética es tecnológica: negro y dorado, objetos 3D interactivos, parallax, líneas de escáner y etiquetas tipo HUD. El objetivo de la página es que el visitante **agende una cita**, así que hay botones de agendar distribuidos por todas las secciones. El sitio es bilingüe (ES/EN).

## About the Design Files
Los archivos de `design/` son **referencias de diseño hechas en HTML**: prototipos que muestran el aspecto y el comportamiento esperados, no código de producción para copiar tal cual. La tarea es **recrear estos diseños en el entorno del proyecto destino** con sus patrones y librerías. Si todavía no hay proyecto, se recomienda **Astro o Next.js (React) + three.js**: el sitio es mayormente estático y solo los tres objetos 3D necesitan ejecutarse en el cliente (islands / client components).

Destino actual del cliente: **GoHighLevel (GHL)**. La carpeta `reference_ghl_snippets/` trae los fragmentos de head, footer y 3D que se pegan en GHL. Si se mantiene GHL, sigue la sección 9 de `PROCAR-DESIGN-SPEC.md`. Si se construye un sitio a medida, los botones de agendar tienen que seguir abriendo los calendarios de GHL, porque de ellos dependen los workflows.

Para ver el prototipo, abre `design/Procar Performance v3.dc.html` en el navegador con un servidor estático (por ejemplo `npx serve design`). Necesita `support.js` y `procar3d.js` en la misma carpeta, y descarga three.js r149 desde unpkg.

## Fidelity
**Alta fidelidad (hi-fi).** Colores, tipografía, espaciado, copy e interacciones son finales y hay que recrearlos al píxel. Excepción: el teléfono, el correo y la dirección del footer son datos de ejemplo.

## Design Tokens
| Token | Valor | Uso |
|---|---|---|
| bg | `#0B0C0E` | Fondo principal |
| bg-2 | `#08090B` | Secciones alternas |
| card | `#0F1114` | Tarjetas y paneles |
| ink | `#EEF0EC` | Texto principal |
| ink-2 | `#C7CBC6` | Párrafos |
| muted | `#9AA0A6` | Texto secundario |
| dim | `#6B7178` | Etiquetas terciarias e inactivos |
| **gold** | `#E3B55B` | Color de marca: botones, acentos, 3D |
| gold-2 | `#F2D48A` | Hover de botones dorados |
| red | `#FF4D2E` | Urgencia y estado 0 V |
| amber | `#FFB23E` | Voltaje anómalo |
| whatsapp | `#25D366` | Botón de WhatsApp |
| line | `rgba(238,240,236,.08–.14)` | Bordes y divisores |
| glow | `rgba(227,181,91,.25–.45)` | Halos dorados |

- **Fuentes:** Archivo (variable: ancho 62–125, peso 100–900) para títulos y cuerpo; JetBrains Mono (400/500/700) para etiquetas, precios y lecturas.
- **Display:** Archivo 800, `font-stretch:75%`, mayúsculas, line-height .84–.9. Hero `clamp(64px,10.5vw,184px)`; secciones `clamp(44px,6vw,110px)`.
- **Kicker:** JetBrains Mono 11–12px, mayúsculas, tracking .12–.14em, dorado. Formato `03 — Servicios` o `Paso 01 · Síntomas`, nunca con barras `//`.
- **Cuerpo:** 15–17px, line-height 1.5–1.65. **Botones:** 13px, peso 700, mayúsculas, tracking .08em, padding 15×22.
- **Espaciado:** margen lateral `clamp(20px,4vw,56px)`; padding vertical de sección `clamp(80px,10vw,140px)`.
- **Radio:** 0 en todo. Solo el botón flotante de WhatsApp es circular.
- **Sombras:** únicamente halos dorados, por ejemplo `0 0 32px rgba(227,181,91,.25)`.
- **Breakpoint del menú:** 980px.

La tabla tipográfica completa está en `PROCAR-DESIGN-SPEC.md` (secciones 3 a 6).

## Screens / Views
Es una sola página larga, en este orden:

1. **Menú fijo:** logo, enlaces (Tecnología, Servicios, Quiénes somos, Reseñas) y botón dorado "Agendar cita". Por debajo de 980px se convierte en menú hamburguesa.
2. **Hero:** título "ENCUENTRA / LA FALLA." (EN: "FIND / THE FAULT."); la segunda línea va con contorno blanco. A la derecha, **un auto 3D con efecto de rayos X** (ver la sección 3D). Etiquetas HUD flotantes: "Escaneo completo · 7 módulos", "Lectura ECU · OK", "Red CAN · 500 kb/s". Botones: Agendar (dorado) y Urgencia (contorno rojo). Fila de datos: 17 años, +90 %, 5.0, 50 reseñas. El suelo es una cuadrícula en perspectiva que avanza con el scroll.
3. **Manifiesto:** texto dividido "No cambiamos / piezas al azar"; las dos líneas se desplazan en sentidos opuestos según el scroll. Debajo, una historia con texto tachado y un CTA.
4. **01 — La prueba de los 5 voltios:** chip 3D más un control de voltaje interactivo (0–5 V). 5 V se ve dorado estable, 0.2–4.8 V ámbar con parpadeo y 0 V rojo apagado. Incluye una cita y un CTA. El chip tiene que caber siempre dentro de su recuadro.
5. **02 — Sistema nervioso:** auto 3D de puntos con 7 módulos conectados a la puerta de enlace CAN. Al pasar el ratón por la lista se resalta el nodo correspondiente, y al revés. Lleva CTA.
6. **03 — Servicios:** 5 tarjetas-pestaña de 210px con foto en escala de grises al 22 %, número y precio. La pestaña activa muestra la foto a color al 55 % con borde y halo dorados. Debajo, el detalle: foto con parallax y líneas de escáner, precio grande, descripción, notas y CTA. Servicios: 01 Programación $250+ · 02 Diagnóstico $250+ · 03 Urgencia $450 · 04 Asesoría $100 · 05 Manuales $20+.
7. **VS — Esto o aquello:** 8 tarjetas que comparan "borrar el código" con "buscar la causa". Al tocar una, la opción ganadora pasa a dorado con halo, la perdedora se tacha y aparece la respuesta "Yoel: …". Lleva CTA.
8. **04 — Marcas:** 15 logos (en `assets/brands`) más "Y mucho más…" y CTA.
9. **05 — Quiénes somos:** Yoel, con fotos con parallax.
10. **06 — Proceso:** 5 pasos con número en un cuadro de 74px. Una línea dorada se llena con el scroll y cada paso pasa de opacidad .35 a 1 cuando la línea llega a él. Incluye garantía y CTA.
11. **07 — Reseñas:** Google 5.0.
12. **08 — Agendar:** 5 tarjetas de servicio, cada una con su botón al calendario de GHL. Además, WhatsApp y una sección "Antes de venir".
13. **Footer compacto:** fondo `linear-gradient(90deg,#0B0C0E,#15130E 55%,#221B0D)` y borde superior `rgba(227,181,91,.35)`. Fila centrada: logo de 64px de alto, divisor vertical dorado de 1px y columna de contacto (teléfono, correo y ubicación con iconos dorados de 16px; texto 15px en ink). Debajo, un divisor y luego © a la izquierda y redes (TikTok, Instagram, Facebook, YouTube; Mono 11px, muted, hover dorado) a la derecha.

**Elementos globales:**
- WhatsApp flotante en `right:20px; bottom:20px`.
- Widget de idioma ES/EN fijo justo encima (bottom 84px): icono de globo más código del idioma; abre un panel.
- Indicador de scroll vertical con porcentaje (solo escritorio).
- Capa fija de líneas de escáner (`repeating-linear-gradient`, 1.8 % de opacidad).

**Móvil (390px):** `Procar Mobile.dc.html` muestra la misma página dentro de marcos de 390×844. Todo pasa a una columna, el 3D se reduce y el texto se escala con los `clamp()`.

## Interactions & Behavior
| Efecto | Detalle |
|---|---|
| Parallax | Elementos con `data-speed` (−0.2 a 0.25): `translateY = −(distancia al centro del viewport) × speed` |
| Aparición | `data-reveal`: opacity 0→1 y translateY 40px→0 en .9s `cubic-bezier(.2,.7,.2,1)`, al entrar un 15 % en el viewport |
| Texto dividido | ±14vw según el progreso de la sección |
| Pasos | Línea con `scaleX(0→1)` ligada al scroll; el número del paso activo toma un halo dorado (.5s) |
| Hover | Botones: cambio de color en .2s. Tarjetas: borde dorado |
| 3D | Seguimiento suave del ratón (lerp ×4/s), arrastrar para girar, rotación automática lenta |
| Idioma | Cambia todo el copy desde un diccionario `T.es` / `T.en` (en el logic class del archivo v3) |
| Agendar | Cada botón debe abrir el calendario de GHL de su servicio (URLs pendientes) |

Respeta `prefers-reduced-motion`: desactiva el parallax y deja el 3D estático.

## 3D (`design/procar3d.js`, three.js r149)
API global `window.Procar3D`. Cada función recibe un `<canvas>` y devuelve `{dispose(), …}`. La cámara se ajusta sola al tamaño del canvas.

- `car(canvas)` → `.setScroll(0–1)` — **Hero.** Carrocería extruida y translúcida con aristas doradas, cristales, faros y pilotos. Dentro: chasis, motor, 4 ruedas que giran y 7 módulos conectados al hub CAN con pulsos que recorren las curvas. Un plano de escaneo barre el auto e ilumina los módulos por los que pasa. Debajo, anillos HUD que giran. Con el scroll, la carrocería sube y las ruedas se separan (vista explosionada).
- `chip(canvas,{volts})` → `.setVolts(v)` — Chip de 36 pines sobre una placa (sección 5V).
- `network(canvas,{nodes,labelsEl,onHover})` → `.setHover(i)` — Auto de puntos (sección Sistema nervioso).
- `ecu`, `wheel` — Versiones anteriores del hero, ya no se usan.

En un framework, monta cada objeto en un `useEffect` / `onMount`, llama a `dispose()` al desmontar y pásale el progreso del scroll de su sección.

## State Management
- `lang`: `'es' | 'en'`. Persistir en localStorage o, mejor, usar una ruta `/en`.
- `activeService`: 0–4, la pestaña de servicios activa.
- `vsRevealed`: `Set<number>` con las tarjetas reveladas de "Esto o aquello".
- `volts`: 0–5, el control de la prueba de 5 V.
- `hoverNode`: el módulo resaltado en Sistema nervioso.
- `menuOpen`, `langOpen`.
- El progreso del scroll por sección se calcula en `requestAnimationFrame`.

No hay fetch de datos: reseñas y servicios son estáticos.

## Assets (`design/assets/`)
- `brands/logo.png`: logo de Procar Performance.
- `brands/*.png`: 15 logos de marcas (Aston, Audi, Bentley, BMW, Bugatti, Ferrari, Jaguar, Lamborghini, Land Rover, Maserati, Mercedes-Benz, Mini, Porsche, Volvo ×2), tomados del sitio original del cliente.
- `img/*.webp|jpg`: fotos de servicios y del taller, también del sitio original. Faltan las fotos reales de Yoel y del taller.
- Iconos: SVG inline de trazo, 1.8px, en dorado.

## Pendientes del cliente
- Número de WhatsApp (`https://wa.me/1XXXXXXXXXX`).
- URLs de los calendarios GHL de los 5 servicios.
- Teléfono, correo y dirección reales para el footer.
- Foto de Yoel y del taller.
- Confirmar "17 años" frente a los "más de 15" del sitio anterior.

## Files
- `design/Procar Performance v3.dc.html`: diseño principal de escritorio, con todo el copy ES/EN, el layout y la lógica.
- `design/Procar Mobile.dc.html`: vista móvil.
- `design/procar3d.js`: motor de los objetos 3D.
- `design/support.js`: runtime necesario para abrir los prototipos.
- `design/assets/`: imágenes.
- `reference_ghl_snippets/`: fragmentos listos para GHL (head, footer, 3D). El archivo `03-hero-ecu-3d.html` ya usa `Procar3D.car`.
- `PROCAR-DESIGN-SPEC.md`: especificación detallada y guía de montaje en GHL.
