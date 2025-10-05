(() => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  if (!window.isSecureContext) {
    console.warn('Service worker registration skipped: insecure context.');
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
