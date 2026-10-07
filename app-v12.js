const cfg = window.SITE_CONFIG || {};

const nav = document.getElementById('siteNav');
const menu = document.querySelector('.menu-btn');
const shade = document.querySelector('.nav-shade');
const header = document.querySelector('.site-header');
const sectionHub = document.querySelector('.section-hub');
const jumpLinks = [...document.querySelectorAll('a.jump-link[href^="#"]')];

function setMenu(open) {
  nav?.classList.toggle('open', open);
  shade?.classList.toggle('show', open);
  menu?.setAttribute('aria-expanded', String(open));
  menu?.setAttribute('aria-label', open ? 'Cerrar navegación' : 'Abrir navegación');
}

menu?.addEventListener('click', () => setMenu(!nav?.classList.contains('open')));
shade?.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setMenu(false);
});

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

function sectionHash(hash = location.hash) {
  return hash && hash.length > 1 ? hash : '#inicio';
}

function setActiveSection(hash) {
  const current = sectionHash(hash);
  jumpLinks.forEach(link => {
    const active = link.getAttribute('href') === current;
    link.classList.toggle('section-active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function jumpTo(hash) {
  const id = sectionHash(hash);
  const target = document.querySelector(id);
  if (!target) return false;

  const headerHeight = header?.getBoundingClientRect().height || 0;
  const hubHeight = sectionHub?.getBoundingClientRect().height || 0;
  const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerHeight - hubHeight - 4);
  window.scrollTo({ top, left: 0, behavior: 'auto' });
  setActiveSection(id);
  return true;
}

jumpLinks.forEach(link => {
  link.addEventListener('click', event => {
    const hash = link.getAttribute('href');
    if (!hash || !document.querySelector(hash)) return;

    event.preventDefault();
    setMenu(false);

    const current = sectionHash(location.hash);
    if (current !== hash) history.pushState({ section: hash }, '', hash);
    jumpTo(hash);
  });
});

window.addEventListener('popstate', () => {
  setMenu(false);
  requestAnimationFrame(() => jumpTo(sectionHash(location.hash)));
});

if (!history.state || !history.state.section) {
  history.replaceState({ section: sectionHash(location.hash) }, '', location.href);
}

window.addEventListener('load', () => {
  if (location.hash) requestAnimationFrame(() => jumpTo(location.hash));
  else setActiveSection('#inicio');
});

const sections = [...document.querySelectorAll('.section-anchor[id]')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveSection(`#${visible.target.id}`);
  }, { rootMargin: '-24% 0px -58% 0px', threshold: [0.01, 0.15, 0.35] });

  sections.forEach(section => sectionObserver.observe(section));
}

const motionZones = [...document.querySelectorAll('.motion-zone')];
if ('IntersectionObserver' in window) {
  const motionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting));
  }, { rootMargin: '100px 0px 100px 0px', threshold: 0.03 });
  motionZones.forEach(zone => motionObserver.observe(zone));
} else {
  motionZones.forEach(zone => zone.classList.add('is-visible'));
}

const missionStage = document.querySelector('.drone-stage');
const missionTabs = [...document.querySelectorAll('.mission-tab')];

const missionData = {
  plan: {
    status: 'MISIÓN PREPARADA',
    labels: ['Área', 'Altura', 'Solape', 'RTK'],
    values: ['2.4 ha', '80 m', '80 / 70%', 'READY']
  },
  capture: {
    status: 'CAPTURA ACTIVA',
    labels: ['Cobertura', 'Velocidad', 'Fotogramas', 'RTK'],
    values: ['68%', '5.2 m/s', '164', 'FIX']
  },
  result: {
    status: 'PRODUCTO GENERADO',
    labels: ['Ortomosaico', 'Nube', 'Curvas', 'Modelo'],
    values: ['READY', '18.4 M pts', '0.50 m', 'DSM / DTM']
  }
};

function setMission(mode) {
  if (!missionStage || !missionData[mode]) return;
  missionStage.dataset.mode = mode;

  missionTabs.forEach(tab => {
    const active = tab.dataset.mission === mode;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });

  const data = missionData[mode];
  const status = missionStage.querySelector('[data-metric="status"]');
  if (status) status.textContent = data.status;

  for (let i = 1; i <= 4; i += 1) {
    const label = document.querySelector(`[data-label="m${i}"]`);
    const value = document.querySelector(`[data-metric="m${i}"]`);
    if (label) label.textContent = data.labels[i - 1];
    if (value) value.textContent = data.values[i - 1];
  }
}

missionTabs.forEach(tab => {
  tab.addEventListener('click', () => setMission(tab.dataset.mission));
});

setMission('plan');

const form = document.getElementById('quoteForm');
const status = document.getElementById('formStatus');

form?.addEventListener('submit', async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const payload = {
    ...data,
    source: 'website',
    createdAt: new Date().toISOString(),
    page: location.href,
    professionalName: cfg.professionalName || ''
  };

  if (!cfg.n8nWebhookUrl) {
    status.textContent = 'Modo demostración: la automatización n8n aún no está conectada.';
    return;
  }

  status.textContent = 'Enviando…';
  try {
    const response = await fetch(cfg.n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    form.reset();
    status.textContent = 'Solicitud recibida correctamente.';
  } catch (error) {
    status.textContent = 'No fue posible enviar la solicitud. Intenta nuevamente.';
    console.error(error);
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js?v=12').catch(() => {}));
}
