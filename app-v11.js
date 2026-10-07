// Compatibilidad de entrada: la v11 carga la revisión estable v12 sin duplicar controladores.
(() => {
  if (!document.querySelector('link[data-topografia-v12]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './enhancements-v12.css?v=12';
    link.dataset.topografiaV12 = 'true';
    document.head.appendChild(link);
  }

  if (!document.querySelector('script[data-topografia-v12]')) {
    const script = document.createElement('script');
    script.src = './app-v12.js?v=12';
    script.defer = true;
    script.dataset.topografiaV12 = 'true';
    document.head.appendChild(script);
  }
})();
