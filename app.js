const cfg = window.SITE_CONFIG || {};

(function loadEnhancementStyles(){
  const old = document.querySelector('link[data-enhancements]');
  if (old) old.remove();
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './enhancements-v8.css?v=8';
  link.dataset.enhancements = 'v8';
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
}, { rootMargin: '-20% 0px -55% 0px', threshold: [0.05,0.2,0.45] });
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

const projectData = [
  {index:'01', label:'LEVANTAMIENTO', sub:'CONTROL DE CAMPO', meta:['Terreno','Cotas','Plano base']},
  {index:'02', label:'REPLANTEO', sub:'EJES Y COTAS', meta:['Ejes','Control','Obra civil']},
  {index:'03', label:'GEOREFERENCIA', sub:'CONTROL TERRITORIAL', meta:['Coordenadas','Linderos','Referencia']}
];

const projectArts = [...document.querySelectorAll('.project-art')];
projectArts.forEach((art, index) => {
  const project = art.closest('.project');
  const content = project?.querySelector(':scope > div:last-child');
  const data = projectData[index] || projectData[0];
  project?.setAttribute('data-index', data.index);
  content?.classList.add('project-content');

  if (content && !content.querySelector('.project-meta')) {
    const meta = document.createElement('div');
    meta.className = 'project-meta';
    meta.innerHTML = data.meta.map(item => `<span>${item}</span>`).join('');
    content.appendChild(meta);
  }

  let scene = art.querySelector('.project-scene');
  if (!scene) {
    scene = document.createElement('div');
    scene.className = 'project-scene';
    art.appendChild(scene);
  }

  scene.innerHTML = `
    <svg class="project-topology" viewBox="0 0 700 420" aria-hidden="true" preserveAspectRatio="none">
      <path d="M-30 330 C90 205 190 365 305 265 S500 120 750 215"/>
      <path d="M-20 380 C105 260 215 405 340 310 S520 165 730 260"/>
      <path d="M20 285 C125 160 220 315 330 225 S505 90 690 170"/>
      <polygon points="135,92 520,118 565,315 170,342"/>
    </svg>
    <div class="project-sweep" aria-hidden="true"></div>
    <span class="project-vector v1" aria-hidden="true"></span>
    <span class="project-vector v2" aria-hidden="true"></span>
    <span class="project-vector v3" aria-hidden="true"></span>
    <span class="project-marker m1" aria-hidden="true"></span>
    <span class="project-marker m2" aria-hidden="true"></span>
    <span class="project-marker m3" aria-hidden="true"></span>
    <div class="project-coords c1" aria-hidden="true"><span>${data.label}</span><b>N 998456.22 · E 661024.89</b></div>
    <div class="project-coords c2" aria-hidden="true"><span>${data.sub}</span><b>± 0.02 m</b></div>
    <div class="project-altitude" aria-hidden="true">CONTROL<br>RTK</div>
    <div class="project-hud" aria-hidden="true"><span>LECTURA ACTIVA</span><span>CAPA 03</span><span>CAMPO</span></div>`;
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
      const center = rect.top + rect.height / 2;
      const progress = Math.max(-0.58, Math.min(0.58, (viewport * 0.58 - center) / (viewport + rect.height)));
      const scene = art.querySelector('.project-scene');
      if (scene) {
        scene.style.setProperty('--sceneX', `${progress * (14 + index * 3)}px`);
        scene.style.setProperty('--sceneY', `${progress * (34 + index * 5)}px`);
      }
      art.style.setProperty('--terrain-shift', `${progress * -26}px`);
      art.style.setProperty('--grid-x', `${progress * 18}px`);
      art.style.setProperty('--grid-y', `${progress * -20}px`);
    });

    ticking = false;
  }

  function requestParallax() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateParallax);
  }

  window.addEventListener('scroll', requestParallax, { passive:true });
  window.addEventListener('resize', requestParallax, { passive:true });
  requestParallax();
}

const form = document.querySelector('#quoteForm');
const status = document.querySelector('#formStatus');
form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const payload = {
    ...data,
    source:'website',
    createdAt:new Date().toISOString(),
    page:location.href,
    professionalName:cfg.professionalName || ''
  };

  if (!cfg.n8nWebhookUrl) {
    status.textContent = 'Modo demostración: la automatización n8n aún no está conectada.';
    return;
  }

  status.textContent = 'Enviando…';
  try {
    const response = await fetch(cfg.n8nWebhookUrl, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
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
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js?v=8').catch(() => {}));
}
