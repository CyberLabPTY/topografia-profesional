// v13 — pie profesional, ubicación y correo discreto.
(() => {
  const proof = document.querySelector('.hero-proof span:first-child small');
  if (proof) proof.textContent = 'Verificada';

  const footer = document.querySelector('.footer');
  if (footer && !footer.classList.contains('professional-footer')) {
    footer.classList.add('professional-footer');
    footer.innerHTML = `
      <div class="footer-main">
        <div class="footer-identity">
          <span class="footer-mark" aria-hidden="true"><svg viewBox="0 0 44 44"><path d="M11 31 22 11l11 20H11Z"/><circle cx="22" cy="22" r="2.6"/></svg></span>
          <div><strong>Topografía Profesional</strong><p>Profesional idónea · Panamá</p></div>
        </div>
        <div class="footer-contact" aria-label="Información de contacto profesional">
          <div class="footer-location">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"/><circle cx="12" cy="10" r="2.2"/></svg>
            <span><b>Ubicación profesional</b><small>Don Bosco · La Riviera · Panamá</small></span>
          </div>
          <a class="footer-email" href="mailto:kristell648@gmail.com?subject=Consulta%20sobre%20servicios%20de%20topograf%C3%ADa" aria-label="Enviar correo electrónico" title="Enviar e-mail">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h17v11h-17z"/><path d="m4.2 7.3 7.8 6 7.8-6"/><path d="M8 18.5h8"/></svg>
            <span class="sr-only">Enviar correo electrónico</span>
          </a>
        </div>
      </div>
      <div class="footer-bottom">
        <small>© 2026 Topografía Profesional. Todos los derechos reservados.</small>
        <nav aria-label="Enlaces del pie"><a class="jump-link" href="#inicio">Inicio</a><a class="jump-link" href="#credenciales">Idoneidad</a><a class="jump-link" href="#cotizar">Contacto</a></nav>
      </div>`;
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=13').catch(() => {});
  }
})();
