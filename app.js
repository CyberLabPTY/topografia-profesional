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
  const number = String(cfg.whatsappNumber || '').replace(/\D/g, '');
  if (!number) return;

  const style = document.createElement('style');
  style.textContent = `
    .whatsapp-float{position:fixed;right:18px;bottom:24px;z-index:80;display:flex;align-items:center;gap:10px;min-height:56px;padding:8px 14px 8px 8px;border-radius:18px;background:#101714;color:#fff;border:1px solid rgba(255,255,255,.14);box-shadow:0 16px 44px rgba(16,23,20,.26);transition:transform .2s ease,box-shadow .2s ease,background .2s ease}
    .whatsapp-float:hover,.whatsapp-float:focus-visible{transform:translateY(-3px);box-shadow:0 20px 50px rgba(16,23,20,.32);background:#17211c;outline:none}
    .whatsapp-icon{display:grid;place-items:center;flex:0 0 42px;width:42px;height:42px;border-radius:13px;background:#25D366}
    .whatsapp-icon svg{width:25px;height:25px;fill:#fff}
    .whatsapp-copy{display:flex;flex-direction:column;line-height:1.12;white-space:nowrap}
    .whatsapp-copy strong{font-size:.84rem;letter-spacing:.02em}
    .whatsapp-copy small{margin-top:3px;color:#c7d2cc;font-size:.74rem;letter-spacing:.04em}
    @media(max-width:620px){.whatsapp-float{right:14px;bottom:16px;width:56px;height:56px;min-height:56px;padding:7px;border-radius:18px}.whatsapp-icon{width:42px;height:42px}.whatsapp-copy{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}}
  `;
  document.head.appendChild(style);

  const message = 'Hola, vi su página web y quisiera información sobre un servicio de topografía.';
  const link = document.createElement('a');
  link.className = 'whatsapp-float';
  link.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', 'Contactar por WhatsApp al 6975-9603');
  link.innerHTML = `
    <span class="whatsapp-icon" aria-hidden="true">
      <svg viewBox="0 0 32 32" focusable="false">
        <path d="M16.04 3C9.4 3 4 8.3 4 14.82c0 2.28.66 4.5 1.92 6.4L4 28l7-1.83a12.2 12.2 0 0 0 5.02 1.08h.01C22.67 27.25 28 21.96 28 15.4 28 8.83 22.68 3 16.04 3Zm6.98 17.04c-.3.84-1.74 1.58-2.4 1.68-.62.1-1.4.14-2.26-.13-.52-.17-1.2-.39-2.07-.76-3.65-1.58-6.03-5.27-6.21-5.51-.18-.25-1.49-1.98-1.49-3.78 0-1.8.94-2.69 1.28-3.06.33-.37.73-.46.97-.46h.7c.23 0 .53-.09.83.63.3.73 1.03 2.52 1.12 2.7.1.2.16.42.03.67-.12.25-.18.4-.36.61-.19.22-.39.48-.56.64-.19.19-.38.4-.16.78.21.37.95 1.56 2.04 2.53 1.4 1.25 2.58 1.64 2.95 1.83.37.18.58.15.8-.1.21-.25.91-1.06 1.15-1.43.25-.37.49-.3.83-.18.34.12 2.16 1.02 2.53 1.2.37.19.61.28.7.43.1.16.1.9-.2 1.72Z"/>
      </svg>
    </span>
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
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
