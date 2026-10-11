# Procar Performance — sitio web

Sitio estático en **Astro** a partir del diseño de Claude Design (`design_handoff_reference/`).
Dos páginas generadas: `/` (español) y `/en/` (inglés).

```bash
npm install
npm run dev       # desarrollo en http://localhost:4321
npm run build     # genera dist/ (lo que se sube al hosting)
npm run preview   # sirve dist/ para probar el build
```

## Dónde se edita
| Qué | Archivo |
|---|---|
| Teléfono, correo, dirección, WhatsApp, **URLs de calendarios GHL**, redes | `src/config.js` |
| Todo el texto ES/EN, reseñas, precios, marcas | `src/data/content.js` |
| Estructura de la página | `src/components/Site.astro` |
| Estilos | `src/styles/global.css` |
| Interacción (menú, pestañas, 5 V, scroll) | `src/scripts/main.ts` |
| Objetos 3D (three.js r149) | `src/lib/procar3d.js` |
| Imágenes | `src/assets/` (se optimizan solas a AVIF/WebP en el build) |

## Velocidad y caché
- **HTML estático** por idioma: el primer pintado no depende de JavaScript.
- **Fuentes locales** (solo latin + latin-ext) con `preload`; sin Google Fonts.
- **Imágenes** convertidas a AVIF/WebP con `srcset` y `loading="lazy"`.
- **three.js** (≈116 KB gzip) en un chunk aparte que se descarga después de la carga,
  solo cuando un objeto 3D está por entrar en pantalla. Los objetos 3D dejan de renderizar
  cuando no se ven o la pestaña está oculta.
- **Service worker** (`dist/sw.js`, generado en cada build): precachea HTML, CSS, JS y fuentes;
  HTML con *stale-while-revalidate*, archivos con hash e imágenes *cache-first*. Cada deploy
  con cambios crea una caché nueva y borra la anterior. Funciona sin conexión tras la primera visita.
- **Cabeceras HTTP**: `/_astro/*` inmutable 1 año; HTML y `sw.js` siempre se revalidan.
  Incluidas para Netlify/Cloudflare Pages (`public/_headers`), Vercel (`vercel.json`) y
  Apache/cPanel (`public/.htaccess`).

## Pendientes del cliente
- Número de WhatsApp y URLs de los 5 calendarios GHL → `src/config.js`
  (mientras estén vacías, los botones de agendar llevan a la sección `#agendar`).
- Teléfono, correo, dirección y dominio reales → `src/config.js`.
- Fotos reales de Yoel y del taller → reemplazar `src/assets/img/car.webp` y `about.webp`.
- Confirmar "17 años" frente a "más de 15".
