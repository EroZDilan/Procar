// Interacción de la página. Todo el contenido llega renderizado en el HTML; este script solo
// añade comportamiento. three.js y el motor 3D se cargan aparte, cuando hacen falta.

type Obj3D = { dispose(): void; setScroll?(s: number): void; setVolts?(v: number): void; setHover?(i: number): void };

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Menú móvil ---------- */
const topbar = $('#topbar')!;
const burger = $('#burger')!;
const setMenu = (open: boolean) => {
  topbar.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
};
burger.addEventListener('click', () => setMenu(!topbar.classList.contains('open')));
$('#mmenu')!.addEventListener('click', () => setMenu(false));

/* ---------- Idioma ---------- */
const langBtn = $('#langBtn')!;
const langPanel = $('#langPanel')!;
const setLang = (open: boolean) => {
  langPanel.hidden = !open;
  langBtn.setAttribute('aria-expanded', String(open));
};
langBtn.addEventListener('click', (e) => { e.stopPropagation(); setLang(langPanel.hidden); });
document.addEventListener('click', (e) => { if (!langPanel.hidden && !$('#lang')!.contains(e.target as Node)) setLang(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setLang(false); setMenu(false); } });
// Mantiene la sección actual al cambiar de idioma
$$<HTMLAnchorElement>('.lang__opt').forEach((a) => a.addEventListener('click', () => { a.href = a.pathname + location.hash; }));

/* ---------- Aparición al entrar en pantalla ---------- */
if (!reduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  $$('[data-reveal]').forEach((el) => {
    if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('pre'); io.observe(el); }
  });
}

/* ---------- Servicios (pestañas) ---------- */
const tabs = $$<HTMLButtonElement>('#svcTabs [role=tab]');
function selectService(i: number, focus = false) {
  tabs.forEach((tab, k) => {
    const on = k === i;
    tab.setAttribute('aria-selected', String(on));
    tab.tabIndex = on ? 0 : -1;
    $(`#svc-${k}`)!.hidden = !on;
  });
  if (focus) tabs[i].focus();
  scheduleFrame();
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectService(i));
  tab.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (d) { e.preventDefault(); selectService((i + d + tabs.length) % tabs.length, true); }
  });
});
// CTAs que preseleccionan un servicio (urgencia, diagnóstico, programación)
$$('[data-pick]').forEach((a) => a.addEventListener('click', () => selectService(Number(a.dataset.pick))));

/* ---------- Esto o aquello ---------- */
$$('.vs').forEach((card) => card.addEventListener('click', () => {
  const open = card.classList.toggle('open');
  card.setAttribute('aria-expanded', String(open));
}));

/* ---------- Prueba de 5 V ---------- */
const v5 = $('#v5')!;
const S = JSON.parse(v5.dataset.strings!);
const vRange = $<HTMLInputElement>('#vRange')!;
const vChecks = $$('#vChecks li span:last-child');
let chip: Obj3D | null = null;
function setVolts(v: number) {
  const dead = v <= 0.2, ok = v >= 4.8;
  const state = dead ? 'dead' : ok ? 'ok' : 'warn';
  v5.dataset.vstate = state;
  vRange.value = String(v);
  $('#vOut')!.textContent = v.toFixed(2);
  $('#vCode')!.textContent = dead ? 'NO POWER' : ok ? 'ALIVE' : 'FAULT';
  $('#vTitle')!.textContent = S[state][0];
  $('#vBody')!.textContent = S[state][1];
  const col = { ok: 'var(--gold)', warn: 'var(--amber)', dead: 'var(--red)' };
  vChecks.forEach((el, k) => {
    const [txt, c] = k === 3 ? [v.toFixed(2) + ' V', col[state]]
      : dead ? [S.rev, col.dead] : ok ? ['OK', col.ok] : k === 2 ? [S.anom, col.warn] : ['OK', col.ok];
    el.textContent = txt; el.style.color = c;
  });
  chip?.setVolts?.(v);
}
vRange.addEventListener('input', () => setVolts(parseFloat(vRange.value)));
$$('.presets button').forEach((b) => b.addEventListener('click', () => setVolts(parseFloat(b.dataset.v!))));

/* ---------- Sistema nervioso: lista <-> 3D ---------- */
const netItems = $$('#netList li');
let net: Obj3D | null = null;
function markNode(i: number) { netItems.forEach((li, k) => li.classList.toggle('on', k === i)); }
netItems.forEach((li, i) => {
  const on = () => { markNode(i); net?.setHover?.(i); };
  const off = () => { markNode(-1); net?.setHover?.(-1); };
  li.addEventListener('mouseenter', on);
  li.addEventListener('mouseleave', off);
  li.addEventListener('click', on);
  li.addEventListener('focusin', on);
  li.addEventListener('focusout', off);
});

/* ---------- Efectos ligados al scroll (un solo rAF por frame) ---------- */
const speedEls = reduced ? [] : $$('[data-speed]').map((el) => ({ el, sp: parseFloat(el.dataset.speed!) || 0, y: 0 }));
const split = $('#split')!, splitA = $('#splitA')!, splitB = $('#splitB')!;
const steps = $('#steps')!, stepsFill = $('#stepsFill')!, stepEls = $$('.step', steps);
const progFill = $('#progFill')!, progPct = $('#progPct')!, floor = $('#floor')!;
let car: Obj3D | null = null;
let ticking = false;

function frame() {
  ticking = false;
  const vh = innerHeight, sy = scrollY;
  // Primero todas las lecturas de layout, después todas las escrituras (evita layout thrashing)
  const rects = speedEls.map((o) => o.el.getBoundingClientRect());
  const rs = split.getBoundingClientRect();
  const rp = steps.getBoundingClientRect();
  const max = document.documentElement.scrollHeight - vh;

  speedEls.forEach((o, i) => {
    const r = rects[i];
    if (!r.height || r.bottom - o.y < -vh || r.top - o.y > 2 * vh) return;
    const c = (r.top - o.y) + r.height / 2 - vh / 2;
    o.y = -c * o.sp;
    o.el.style.transform = `translate3d(0,${o.y.toFixed(1)}px,0)`;
  });
  if (!reduced) {
    const p = Math.max(0, Math.min(1, (vh - rs.top) / (vh + rs.height)));
    const d = (p - 0.5) * 28;
    splitA.style.transform = `translate3d(${d.toFixed(2)}vw,0,0)`;
    splitB.style.transform = `translate3d(${(-d).toFixed(2)}vw,0,0)`;
    floor.style.backgroundPosition = `0 ${(sy * 0.6).toFixed(0)}px`;
  }
  const pp = Math.max(0, Math.min(1, (vh * 0.75 - rp.top) / (rp.height * 0.9)));
  stepsFill.style.transform = `scaleX(${pp.toFixed(3)})`;
  stepEls.forEach((el, i) => el.classList.toggle('on', pp >= (i + 0.3) / stepEls.length));
  const pr = max > 0 ? sy / max : 0;
  progFill.style.transform = `scaleY(${pr.toFixed(3)})`;
  progPct.textContent = String(Math.round(pr * 100)).padStart(3, '0') + '%';
  car?.setScroll?.(sy / vh);
}
function scheduleFrame() {
  if (!ticking) { ticking = true; requestAnimationFrame(frame); }
}
addEventListener('scroll', scheduleFrame, { passive: true });
addEventListener('resize', scheduleFrame);
frame();

/* ---------- 3D bajo demanda ---------- */
let engine: Promise<typeof import('../lib/procar3d.js')> | null = null;
const loadEngine = () => (engine ??= import('../lib/procar3d.js'));

function hasWebGL() {
  try { return !!document.createElement('canvas').getContext('webgl2') || !!document.createElement('canvas').getContext('webgl'); }
  catch { return false; }
}

async function mount(canvas: HTMLCanvasElement) {
  const P = await loadEngine();
  const kind = canvas.dataset['3d'];
  if (kind === 'car') { car = P.car(canvas); scheduleFrame(); }
  else if (kind === 'chip') { chip = P.chip(canvas, { volts: parseFloat(vRange.value) }); }
  else if (kind === 'network') {
    net = P.network(canvas, {
      labelsEl: $('#netLabels'),
      nodes: JSON.parse(canvas.dataset.nodes!),
      onHover: (i: number) => markNode(i),
    });
  }
}

if (hasWebGL()) {
  const canvases = $$<HTMLCanvasElement>('canvas[data-3d]');
  const idle = (cb: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 2500 }) : setTimeout(cb, 1200));
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    mount(e.target as HTMLCanvasElement);
  }), { rootMargin: '400px 0px' });
  // Se empieza a observar después de la carga: el primer pintado (texto del hero) no compite con three.js
  const start = () => idle(() => canvases.forEach((c) => io.observe(c)));
  if (document.readyState === 'complete') start(); else addEventListener('load', start, { once: true });
}

/* ---------- Service worker (solo en producción) ---------- */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}), { once: true });
}
