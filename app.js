const cfg = window.SITE_CONFIG || {};

(function loadEnhancementStyles(){
  if (document.querySelector('link[data-enhancements="v7"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './enhancements.css?v=7';
  link.dataset.enhancements = 'v7';
  document.head.appendChild(link);
})();

const nav = document.querySelector('.nav');
const menu = document.querySelector('.menu-btn');
const backdrop = document.querySelector('.nav-backdrop');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setMenu(open) {
  nav?.classList.toggle('open', open);
  backdrop?.classList.toggle('show', open);
  menu?.setAttribute('aria-expanded', String(open));
  menu?.setAttribute('aria-label', open ? 'Cerrar navegación' : 'Abrir navegación');
}

menu?.addEventListener('click', () => setMenu(!nav?.classList.contains('open')));
backdrop?.addEventListener('click', () => setMenu(false));
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav?.classList.contains('open')) {
    setMenu(false);
    menu?.focus();
  }
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const dockItems = [...document.querySelectorAll('.dock-pill')];
const sectionMap = new Map();
document.querySelectorAll('section[id]').forEach(section => {
  const target = document.querySelector(`.dock-pill[href="#${section.id}"]`);
  if (target) sectionMap.set(section, target);
});
const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  const target = sectionMap.get(visible.target);
  if (!target) return;
  dockItems.forEach(item => item.classList.remove('active'));
  target.classList.add('active');
}, { rootMargin: '-20% 0px -55% 0px', threshold: [0.05, 0.2, 0.45] });
sectionMap.forEach((_, section) => sectionObserver.observe(section));

dockItems.forEach(item => item.addEventListener('click', () => {
  dockItems.forEach(el => el.classList.remove('active'));
  item.classList.add('active');
}));

const tabs = [...document.querySelectorAll('.visual-tab')];
const panels = {
  relieve: document.getElementById('panel-relieve'),
  red: document.getElementById('panel-red'),
  tiempo: document.getElementById('panel-tiempo')
};
tabs.forEach(tab => tab.addEventListener('click', () => {
  const key = tab.dataset.panel;
  tabs.forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });
  Object.values(panels).forEach(panel => panel?.classList.remove('active'));
  tab.classList.add('active');
  tab.setAttribute('aria-selected', 'true');
  panels[key]?.classList.add('active');
}));

const projectLabels = [
  ['LEVANTAMIENTO','CONTROL DE CAMPO'],
  ['REPLANTEO','EJES Y COTAS'],
  ['GEOREFERENCIA','CONTROL TERRITORIAL']
];

const projectArts = [...document.querySelectorAll('.project-art')];
projectArts.forEach((art, index) => {
  if (art.querySelector('.project-scene')) return;
  const label = projectLabels[index] || ['TOPOGRAFÍA','CONTROL TÉCNICO'];
  const scene = document.createElement('div');
  scene.className = 'project-scene';
  scene.innerHTML = `
    <div class="project-sweep" aria-hidden="true"></div>
    <span class="project-vector v1" aria-hidden="true"></span>
    <span class="project-vector v2" aria-hidden="true"></span>
    <span class="project-vector v3" aria-hidden="true"></span>
    <span class="project-marker m1" aria-hidden="true"></span>
    <span class="project-marker m2" aria-hidden="true"></span>
    <span class="project-marker m3" aria-hidden="true"></span>
    <div class="project-coords c1" aria-hidden="true"><span>${label[0]}</span><b>ESCENA TÉCNICA</b></div>
    <div class="project-coords c2" aria-hidden="true"><span>${label[1]}</span><b>VISUALIZACIÓN</b></div>
    <div class="project-altitude" aria-hidden="true">DATOS<br>CAMPO</div>`;
  art.appendChild(scene);
});

if (!prefersReducedMotion) {
  const shell = document.querySelector('.parallax-shell');
  const innerLayers = shell ? [...shell.querySelectorAll('.layer[data-depth]')] : [];
  const pageLayers = [...document.querySelectorAll('[data-page-depth]')];
  let ticking = false;

  function updateParallax() {
    if (shell) {
      const rect = shell.getBoundingClientRect();
      const viewport = Math.max(window.innerHeight, 1);
      const offset = (rect.top + rect.height / 2 - viewport / 2) / viewport;
      innerLayers.forEach(layer => {
        const depth = Number(layer.dataset.depth || 0);
        layer.style.transform = `translate3d(${offset * depth * 16}px, ${offset * depth * -105}px, 0)`;
      });
    }

    const y = window.scrollY || 0;
    pageLayers.forEach(layer => {
      const depth = Number(layer.dataset.pageDepth || 0);
      layer.style.transform = `translate3d(0, ${y * depth}px, 0)`;
    });

    const viewport = Math.max(window.innerHeight, 1);
    projectArts.forEach((art, index) => {
      const rect = art.getBoundingClientRect();
      const raw = (viewport * 0.62 - (rect.top + rect.height / 2)) / (viewport + rect.height);
      const progress = Math.max(-0.55, Math.min(0.55, raw));
      const scene = art.querySelector('.project-scene');
      if (scene) scene.style.setProperty('--scene-shift', `${progress * (26 + index * 4)}px`);
      art.style.setProperty('--terrain-shift', `${progress * -20}px`);
      art.style.setProperty('--grid-x', `${progress * 12}px`);
      art.style.setProperty('--grid-y', `${progress * -14}px`);
    });

    ticking = false;
  }

  function requestParallax() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateParallax);
  }

  window.addEventListener('scroll', requestParallax, { passive: true });
  window.addEventListener('resize', requestParallax, { passive: true });
  requestParallax();
}

const form = document.querySelector('#quoteForm');
const status = document.querySelector('#formStatus');
form?.addEventListener('submit', async (event) => {
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
    if (!response.ok) throw new Error('HTTP ' + response.status);
    form.reset();
    status.textContent = 'Solicitud recibida correctamente.';
  } catch (error) {
    status.textContent = 'No fue posible enviar la solicitud. Intenta nuevamente.';
    console.error(error);
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js?v=7').catch(() => {}));
}
