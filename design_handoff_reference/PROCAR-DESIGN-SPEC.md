# Procar Performance — Especificación de diseño y guía de montaje en GHL

Versión: v3 · Idiomas: ES / EN · Enfoque: diagnóstico electrónico = tecnología como diferenciador.

---

## 1. Contenido del paquete

```
export/
├── PROCAR-DESIGN-SPEC.md          ← este documento
├── offline/
│   ├── Procar-Desktop-offline.html ← web completa, funciona sin internet
│   └── Procar-Mobile-offline.html  ← 4 pantallas móviles (390×844); mantener en la misma carpeta
├── ghl/
│   ├── 01-head-global.html         ← fuentes, three.js, variables CSS y clases base
│   ├── 02-footer-global.html       ← parallax, aparición al scroll, texto dividido, pasos
│   ├── 03-hero-ecu-3d.html         ← módulo ECU 3D del hero
│   ├── 04-prueba-5v.html           ← chip 3D + sonda de voltaje interactiva
│   ├── 05-sistema-nervioso-3d.html ← red de módulos 3D (auto de puntos)
│   └── procar3d.js                 ← motor 3D (subir a Media Library)
└── assets/                         ← logo, 15 logos de marcas, fotos de servicios
```

---

## 2. Colores

| Token | Hex | Uso |
|---|---|---|
| `--pc-bg` | `#0B0C0E` | Fondo principal |
| `--pc-bg-2` | `#08090B` | Secciones alternas (5V, marcas, esto o aquello, agendar) |
| `--pc-card` | `#0F1114` | Tarjetas, paneles |
| `--pc-ink` | `#EEF0EC` | Texto principal |
| `--pc-ink-2` | `#C7CBC6` | Párrafos |
| `--pc-muted` | `#9AA0A6` | Texto secundario, etiquetas |
| `--pc-dim` | `#6B7178` | Etiquetas terciarias, estados inactivos |
| `--pc-gold` | `#E3B55B` | **Color de marca** (tomado del logo). Botones, acentos, 3D |
| `--pc-gold-2` | `#F2D48A` | Hover de botones dorados |
| `--pc-red` | `#FF4D2E` | Urgencia, estado "0 V" |
| `--pc-amber` | `#FFB23E` | Estado "voltaje anómalo" |
| `--pc-wa` | `#25D366` | WhatsApp |
| Líneas | `rgba(238,240,236,.08–.14)` | Bordes y divisores |
| Brillo dorado | `rgba(227,181,91,.25–.45)` | Glow de botones y títulos con contorno |

Regla: un solo acento (dorado). El rojo solo para urgencia y el ámbar solo en la prueba de 5 V.

---

## 3. Tipografía

**Fuentes (Google Fonts):**
- **Archivo** (variable, ancho 62–125, peso 100–900): títulos y cuerpo.
- **JetBrains Mono** (400/500/700): etiquetas técnicas, precios, lecturas de voltaje.

| Estilo | Fuente | Tamaño | Peso / ancho | Otros |
|---|---|---|---|---|
| Display hero | Archivo | `clamp(64px, 10.5vw, 184px)` | 800 / 75 % | MAYÚSCULAS, line-height .84 |
| Display sección | Archivo | `clamp(44px, 6vw, 110px)` | 800 / 75 % | line-height .86–.9 |
| Texto dividido "No cambiamos…" | Archivo | `clamp(40px, 14vw, 260px)` | 800 / 75 % | sin salto de línea, se desplaza con el scroll |
| Título de tarjeta | Archivo | 24–30px | 800 / 75 % | MAYÚSCULAS, line-height .92 |
| Lead / cita | Archivo | `clamp(20px, 2vw, 26px)` | 500–600 | |
| Cuerpo | Archivo | 15–17px | 400 | line-height 1.5–1.65 |
| Etiqueta (kicker) | JetBrains Mono | 11–12px | 400–700 | MAYÚSCULAS, tracking .12–.14em, dorado |
| Botón | Archivo | 13px | 700 | MAYÚSCULAS, tracking .08em |
| Lectura de voltaje | JetBrains Mono | `clamp(72px, 8vw, 120px)` | 500 | |

**Palabra con contorno:** `color: transparent; -webkit-text-stroke: 1.5px #E3B55B; text-shadow: 0 0 40px rgba(227,181,91,.35)` (en el hero el contorno es blanco).

---

## 4. Espaciado y retícula

- Margen lateral: `clamp(20px, 4vw, 56px)`.
- Padding vertical de secciones: `clamp(80px, 10vw, 140px)`.
- Rejillas: `repeat(auto-fit, minmax(min(100%, Xpx), 1fr))`, con X = 200–460 según la sección. En móvil todo pasa a una columna.
- Divisores de 1px en las rejillas mediante `gap:1px` sobre un fondo de líneas.
- Esquinas: todo recto (radio 0). Solo el indicador del WhatsApp flotante es circular.
- Punto de corte del menú: **980px** (por debajo se usa menú hamburguesa).

---

## 5. Componentes

- **Botón principal:** fondo dorado, texto `#0B0C0E`, padding 15×22, glow `0 0 32px rgba(227,181,91,.25)`, flecha "→".
- **Botón urgencia:** contorno rojo, hover relleno rojo.
- **Panel HUD:** borde de 1px más esquinas doradas de 12–14px (arriba-izquierda y abajo-derecha, o las 4). Clase `.pc-hud`.
- **Etiqueta de sección:** `03 — Servicios` en JetBrains Mono dorado.
- **Tarjeta de servicio (pestaña):** 210px de alto con la foto en escala de grises al 22 %. Activa: foto a color al 55 %, borde y glow dorados.
- **Detalle de servicio:** foto con parallax, líneas de escáner, recuadro "Target", precio grande dorado. A la derecha: nombre, descripción, notas con borde izquierdo dorado y botón.
- **Esto o aquello:** 8 tarjetas. Al tocar una, la opción ganadora pasa a dorado con glow y la perdedora se tacha; aparece la respuesta "Yoel: …".
- **Pasos:** cuadro de 74px con el número, línea dorada horizontal que se llena con el scroll y tarjetas HUD con "Paso 01 · Síntomas".
- **Widget de idioma:** fijo abajo a la derecha, encima de WhatsApp (bottom 84px). Icono de globo más el código del idioma; abre un panel con ES · Español y EN · English.
- **WhatsApp flotante:** fijo en `right:20px; bottom:20px`.
- **Indicador de scroll:** barra vertical a la derecha con porcentaje (solo escritorio).
- **Líneas de escáner globales:** capa fija `repeating-linear-gradient` al 1.8 % de opacidad.

---

## 6. Movimiento y transiciones

| Efecto | Detalle |
|---|---|
| Parallax | Elementos con `data-speed` (−0.2 a 0.25): `translateY = −(distancia al centro del viewport) × speed`. Se aplica a fondos, textos del hero, fotos de "Quiénes somos", imagen de servicio y "PROCAR" del footer |
| Aparición | `data-reveal`: opacity 0→1 y translateY 40px→0, **.9s cubic-bezier(.2,.7,.2,1)** al entrar en el viewport (15 %) |
| Texto dividido | "No cambiamos / piezas al azar": las dos líneas se desplazan en sentidos opuestos (±14vw) según el progreso de la sección |
| Pasos | Línea `scaleX(0→1)` ligada al scroll; cada paso pasa de opacidad .35 a 1 y su número toma un glow dorado (.5s) |
| Suelo del hero | Cuadrícula en perspectiva (`rotateX(62deg)`) cuyo `background-position` avanza con el scroll |
| Hover | Botones: cambio de color (.2s). Tarjetas: borde dorado |
| 3D | Seguimiento suave del ratón (lerp ×4/s), arrastre para girar, rotación automática lenta |

---

## 7. Objetos 3D (three.js r149 + `procar3d.js`)

1. **Hero · Módulo ECU desarmado:** carcasa de aluminio con aletas, conector de 28 pines, placa con microcontrolador "PROCAR ECU", tapa translúcida, pulsos dorados en las pistas, haz de escaneo y anillos HUD. Se separa más al hacer scroll. `Procar3D.ecu(canvas)` · `.setScroll(n)`.
2. **Prueba de 5 V · Chip sobre placa:** 36 pines con pistas y pulsos. `Procar3D.chip(canvas,{volts})` · `.setVolts(0–5)`. 5 V dorado estable, 0.2–4.8 V ámbar con parpadeo, 0 V rojo apagado.
3. **Sistema nervioso · Auto de puntos:** 7 módulos conectados a la puerta de enlace CAN con pulsos. `Procar3D.network(canvas,{nodes,labelsEl,onHover})` · `.setHover(i)`.

La cámara se ajusta sola al tamaño del recuadro, así que los objetos caben completos en escritorio y en móvil.

---

## 8. Estructura de la página (orden)

1. Menú (logo, Tecnología, Servicios, Quiénes somos, Reseñas, **Agendar cita**)
2. **Hero:** "Encuentra la falla." + auto 3D con rayos X + CTA agendar / urgencia + datos (17 años, +90 %, 5.0, 50 reseñas)
3. **Manifiesto:** "No cambiamos piezas al azar" + historia tachada + CTA
4. **01 — La prueba de los 5 voltios** (interactiva) + cita + **CTA**
5. **02 — Sistema nervioso** (3D) + lista de módulos + **CTA**
6. **03 — Servicios:** 5 pestañas + detalle + CTA
7. **VS — Esto o aquello** (guion G2) + **CTA**
8. **04 — Marcas:** los 15 logos de la web original + "Y mucho más…" + **CTA**
9. **05 — Quiénes somos** (Yoel)
10. **06 — Proceso** (5 pasos, guion G3) + garantía + **CTA**
11. **07 — Reseñas** Google 5.0
12. **08 — Agendar:** 5 tarjetas de servicio con botón GHL + WhatsApp + "Antes de venir"
13. Footer + redes

---

## 9. Montaje en GoHighLevel

1. **Media Library:** subir `assets/` (logo, marcas, fotos) y `ghl/procar3d.js`. Copiar la URL de `procar3d.js`.
2. **Settings › Tracking Code › Header:** pegar `01-head-global.html` y sustituir `https://TU-URL/procar3d.js` por la URL real.
3. **Footer:** pegar `02-footer-global.html`.
4. **Página:** fondo de secciones `#0B0C0E` / `#08090B`, ancho completo, padding según el apartado 4. Construir textos, imágenes y botones con elementos nativos y aplicarles las clases `.pc-display`, `.pc-kicker`, `.pc-btn` y `.pc-hud` (Custom Class del elemento).
5. **3D:** en cada sección, un elemento **Custom HTML** con el snippet correspondiente (03, 04, 05).
6. **Parallax / aparición:** en los elementos que lo necesiten, añadir el atributo `data-speed="0.1"` o `data-reveal` (vía Custom Attributes, o envolviéndolos en Custom HTML).
7. **Reservas nativas:** cada botón "Agendar" abre el **calendario o formulario de GHL del servicio** (Action › Open popup o Go to URL), para que se disparen los workflows. Servicios: Nº 01 Programación $250+, Nº 02 Diagnóstico $250+, Nº 03 Urgencia $450, Nº 04 Asesoría $100, Nº 05 Manuales $20+.
8. **Idioma:** crear la página EN duplicando la ES; el widget de idioma enlaza entre las dos.
9. **WhatsApp:** botón flotante `https://wa.me/1XXXXXXXXXX` (pendiente el número).

**Pendientes del cliente:** número de WhatsApp, URLs de los calendarios GHL, foto real de Yoel y del taller, y confirmar 17 años frente a los "más de 15" de la web anterior.
