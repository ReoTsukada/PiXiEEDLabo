(() => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('service-worker.js', { scope: './' })
      .catch(error => {
        console.warn('Service worker registration failed:', error);
      });
  });
})();
