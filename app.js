const cfg = window.SITE_CONFIG || {};
const nav = document.querySelector('.nav');
const menu = document.querySelector('.menu-btn');
menu?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  menu?.setAttribute('aria-expanded', 'false');
}));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('show'); });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

function mountWhatsAppButton() {
  if (document.querySelector('.whatsapp-float')) return;
  const number = String(cfg.whatsappNumber || '').replace(/\D/g, '');
  if (!number) return;

  const message = 'Hola, vi su página web y quisiera información sobre un servicio de topografía.';
  const link = document.createElement('a');
  link.className = 'whatsapp-float';
  link.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', 'Contactar por WhatsApp al 6975-9603');
  link.innerHTML = `
    <span class="whatsapp-icon" aria-hidden="true"><img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="" width="26" height="26"></span>
    <span class="whatsapp-copy"><strong>WhatsApp</strong><small>6975-9603</small></span>`;
  document.body.appendChild(link);
}
mountWhatsAppButton();

const form = document.querySelector('#quoteForm');
const status = document.querySelector('#formStatus');
form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const payload = {
    ...data,
    source: 'website',
    createdAt: new Date().toISOString(),
    page: location.href
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
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js?v=4').catch(() => {}));
}
