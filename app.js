const cfg = window.SITE_CONFIG || {};
const nav = document.querySelector('.nav');
const menu = document.querySelector('.menu-btn');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

menu?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});

nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  menu?.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('.dock-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.dock-pill').forEach(item => item.classList.remove('active'));
    pill.classList.add('active');
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const sectionMap = new Map();
document.querySelectorAll('section[id]').forEach(section => {
  sectionMap.set(section.id, document.querySelector(`.dock-pill[href="#${section.id}"]`));
});

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const target = sectionMap.get(entry.target.id);
    if (!target) return;
    document.querySelectorAll('.dock-pill').forEach(item => item.classList.remove('active'));
    target.classList.add('active');
  });
}, { threshold: 0.45 });
sectionMap.forEach((_, id) => {
  const section = document.getElementById(id);
  if (section) sectionObserver.observe(section);
});

const tabs = document.querySelectorAll('.visual-tab');
const panels = {
  relieve: document.getElementById('panel-relieve'),
  red: document.getElementById('panel-red'),
  tiempo: document.getElementById('panel-tiempo')
};

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const key = tab.dataset.panel;
    tabs.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    Object.values(panels).forEach(panel => panel?.classList.remove('active'));
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    panels[key]?.classList.add('active');
  });
});

if (!prefersReducedMotion) {
  const shell = document.querySelector('.parallax-shell');
  const layers = shell ? shell.querySelectorAll('.layer[data-depth]') : [];
  let ticking = false;

  const updateParallax = () => {
    if (!shell) return;
    const rect = shell.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const centerOffset = (rect.top + rect.height / 2 - viewport / 2) / viewport;
    layers.forEach(layer => {
      const depth = Number(layer.dataset.depth || 0);
      const translateY = centerOffset * depth * -120;
      const translateX = centerOffset * depth * 18;
      layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    });
    ticking = false;
  };

  const requestTick = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateParallax);
  };

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick, { passive: true });
  requestTick();
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
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js?v=5').catch(() => {}));
}
