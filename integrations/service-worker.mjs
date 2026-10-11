// Genera dist/sw.js al terminar el build, con la lista de archivos a precachear y una
// versión derivada del contenido: cada deploy con cambios crea una caché nueva y borra la vieja.
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

// Se precachea lo necesario para pintar la página completa sin red. Las imágenes
// grandes y el chunk de three.js se cachean al usarse (cache-first), no en la instalación.
const PRECACHE = /\.(html|css|woff2)$|^_astro\/(?!three).*\.js$|^favicon\.svg$/;
const MAX_PRECACHE_BYTES = 400 * 1024;

export default function serviceWorker() {
  return {
    name: 'procar-service-worker',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const files = (await walk(root)).map((f) => relative(root, f).split(sep).join('/'));
        const hash = createHash('sha256');
        const precache = [];
        for (const f of files.sort()) {
          if (f === 'sw.js') continue;
          hash.update(f).update(await readFile(join(root, f)));
          if (!PRECACHE.test(f)) continue;
          if ((await stat(join(root, f))).size > MAX_PRECACHE_BYTES) continue;
          // index.html -> "/", en/index.html -> "/en/"
          precache.push('/' + f.replace(/(^|\/)index\.html$/, '$1'));
        }
        const version = hash.digest('hex').slice(0, 12);
        const tpl = await readFile(new URL('./sw-template.js', import.meta.url), 'utf8');
        const sw = tpl
          .replace('__VERSION__', version)
          .replace('__PRECACHE__', JSON.stringify(precache));
        await writeFile(join(root, 'sw.js'), sw);
        logger.info(`sw.js v${version} · ${precache.length} archivos precacheados`);
      },
    },
  };
}
