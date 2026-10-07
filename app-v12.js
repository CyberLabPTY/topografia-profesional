const cfg = window.SITE_CONFIG || {};

// v12 DOM bootstrap: selector persistente, idoneidad protegida y WhatsApp limpio.
(() => {
  if (!document.querySelector('.section-hub')) {
    const shade = document.querySelector('.nav-shade');
    const hub = document.createElement('nav');
    hub.className = 'section-hub';
    hub.setAttribute('aria-label', 'Selector de secciones');
    hub.innerHTML = `
      <a class="jump-link" href="#servicios">Servicios</a>
      <a class="jump-link" href="#tecnologia">Tecnología</a>
      <a class="jump-link" href="#metodo">Cómo trabaja</a>
      <a class="jump-link" href="#proyectos">Portafolio</a>
      <a class="jump-link" href="#credenciales">Idoneidad</a>
      <a class="jump-link" href="#cotizar">Contacto</a>`;
    shade?.insertAdjacentElement('afterend', hub);
  }

  document.querySelector('.quick-dock')?.remove();

  const credential = document.querySelector('#credenciales .credential-shell');
  if (credential) {
    credential.classList.add('verified-credential');
    credential.innerHTML = `
      <div>
        <p class="kicker">Confianza profesional</p>
        <h2>Idoneidad profesional verificada.</h2>
        <p>Condición profesional vigente y documentación al día. Por seguridad y para prevenir usos indebidos o falsificación, la licencia completa no se publica en este sitio. La condición profesional puede confirmarse por contacto directo cuando sea necesario.</p>
        <div class="credential-assurance" aria-label="Estado de documentación profesional">
          <span><b>✓</b><strong>Idoneidad verificada</strong></span>
          <span><b>✓</b><strong>Documentación al día</strong></span>
          <span><b>✓</b><strong>Datos sensibles protegidos</strong></span>
        </div>
      </div>
      <div class="credential-seal verified-seal" aria-label="Idoneidad profesional verificada">
        <span class="verify-check">✓</span>
        <strong>VERIFICADA</strong>
        <small>Profesional idónea · Panamá</small>
        <em>Licencia completa protegida por seguridad</em>
      </div>`;
  }

  const wa = document.querySelector('.whatsapp-float');
  if (wa) {
    wa.classList.add('whatsapp-glyph');
    wa.innerHTML = `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16.04 3C9.4 3 4 8.3 4 14.82c0 2.28.66 4.5 1.92 6.4L4 28l7-1.83a12.2 12.2 0 0 0 5.02 1.08h.01C22.67 27.25 28 21.96 28 15.4 28 8.83 22.68 3 16.04 3Zm6.98 17.04c-.3.84-1.74 1.58-2.4 1.68-.62.1-1.4.14-2.26-.13-.52-.17-1.2-.39-2.07-.76-3.65-1.58-6.03-5.27-6.21-5.51-.18-.25-1.49-1.98-1.49-3.78 0-1.8.94-2.69 1.28-3.06.33-.37.73-.46.97-.46h.7c.23 0 .53-.09.83.63.3.73 1.03 2.52 1.12 2.7.1.2.16.42.03.67-.12.25-.18.4-.36.61-.19.22-.39.48-.56.64-.19.19-.38.4-.16.78.21.37.95 1.56 2.04 2.53 1.4 1.25 2.58 1.64 2.95 1.83.37.18.58.15.8-.1.21-.25.91-1.06 1.15-1.43.25-.37.49-.3.83-.18.34.12 2.16 1.02 2.53 1.2.37.19.61.28.7.43.1.16.1.9-.2 1.72Z"/></svg>`;
  }
})();

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
