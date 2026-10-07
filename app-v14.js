// v14 — cotización funcional con automatización n8n y respaldo por correo.
(() => {
  const cfg = window.SITE_CONFIG || {};
  const form = document.getElementById('quoteForm');
  const status = document.getElementById('formStatus');
  if (!form || !status) return;

  const submitButton = form.querySelector('button[type="submit"]');
  const quoteEmail = cfg.quoteEmail || 'kristell648@gmail.com';
  const intro = document.querySelector('#cotizar .quote-intro p:last-child');

  if (intro) {
    intro.textContent = 'Completa los datos para solicitar una cotización. La información se utiliza únicamente para responder tu solicitud.';
  }

  const setBusy = busy => {
    if (!submitButton) return;
    submitButton.disabled = busy;
    submitButton.setAttribute('aria-busy', String(busy));
  };

  const clean = value => String(value ?? '').trim();

  function buildPayload() {
    const data = Object.fromEntries(new FormData(form).entries());
    const requestId = globalThis.crypto?.randomUUID?.() || `quote-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    return {
      requestId,
      name: clean(data.name),
      phone: clean(data.phone),
      service: clean(data.service),
      location: clean(data.location),
      area: clean(data.area),
      message: clean(data.message),
      source: 'website',
      createdAt: new Date().toISOString(),
      page: location.href,
      professionalName: clean(cfg.professionalName)
    };
  }

  function openEmailFallback(payload, reason = '') {
    const subject = 'Nueva solicitud de cotización - Topografía Profesional';
    const lines = [
      'Nueva solicitud de cotización',
      '',
      `Nombre: ${payload.name}`,
      `WhatsApp: ${payload.phone}`,
      `Servicio: ${payload.service}`,
      `Ubicación: ${payload.location}`,
      `Área aproximada: ${payload.area || 'No indicada'}`,
      '',
      'Descripción:',
      payload.message,
      '',
      `Referencia: ${payload.requestId}`,
      `Fecha: ${payload.createdAt}`,
      `Página: ${payload.page}`
    ];

    if (reason) lines.push('', `Nota técnica: ${reason}`);

    const mailto = `mailto:${encodeURIComponent(quoteEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    status.textContent = 'Se abrirá tu aplicación de correo con la cotización preparada. Revisa los datos y toca Enviar.';
    window.location.href = mailto;
  }

  async function sendToN8n(payload) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(cfg.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*'
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
        cache: 'no-store'
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return true;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  // Captura el envío antes del controlador v12 para mantener esta mejora aislada.
  form.addEventListener('submit', async event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (!form.reportValidity()) return;

    const payload = buildPayload();
    setBusy(true);

    try {
      if (cfg.n8nWebhookUrl) {
        status.textContent = 'Enviando solicitud…';
        try {
          await sendToN8n(payload);
          form.reset();
          status.textContent = 'Solicitud enviada correctamente. Pronto se pondrán en contacto contigo.';
          return;
        } catch (error) {
          console.error('Cotización n8n:', error);
          openEmailFallback(payload, 'La automatización no respondió; se activó el respaldo por correo.');
          return;
        }
      }

      openEmailFallback(payload);
    } finally {
      window.setTimeout(() => setBusy(false), 800);
    }
  }, true);
})();
