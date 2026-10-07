// Compatibilidad de entrada: la v11 carga las revisiones estables v12, v13 y v14 sin duplicar controladores.
(() => {
  if (!document.querySelector('link[data-topografia-v12]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './enhancements-v12.css?v=14';
    link.dataset.topografiaV12 = 'true';
    document.head.appendChild(link);
  }

  if (!document.querySelector('link[data-topografia-v13]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './enhancements-v13.css?v=14';
    link.dataset.topografiaV13 = 'true';
    document.head.appendChild(link);
  }

  if (!document.querySelector('script[data-topografia-v12]')) {
    const script = document.createElement('script');
    script.src = './app-v12.js?v=14';
    script.defer = true;
    script.dataset.topografiaV12 = 'true';
    document.head.appendChild(script);
  }

  if (!document.querySelector('script[data-topografia-v13]')) {
    const script = document.createElement('script');
    script.src = './app-v13.js?v=14';
    script.defer = true;
    script.dataset.topografiaV13 = 'true';
    document.head.appendChild(script);
  }

  if (!document.querySelector('script[data-topografia-v14]')) {
    const script = document.createElement('script');
    script.src = './app-v14.js?v=14';
    script.defer = true;
    script.dataset.topografiaV14 = 'true';
    document.head.appendChild(script);
  }
})();
