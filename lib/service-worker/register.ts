// Service Worker Registration Utility

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[Service Worker] Not supported in this environment');
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('[Service Worker] Registered successfully:', registration.scope);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker installed, notify user
                console.log('[Service Worker] New version available');
                // You can show a notification here to reload
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[Service Worker] Registration failed:', error);
      });

    // Listen for controller change (new service worker activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[Service Worker] Controller changed, reloading page');
      // Optionally reload the page when a new service worker takes control
      // window.location.reload();
    });
  });
}

export function unregisterServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.ready
    .then((registration) => {
      return registration.unregister();
    })
    .then(() => {
      console.log('[Service Worker] Unregistered successfully');
    })
    .catch((error) => {
      console.error('[Service Worker] Unregistration failed:', error);
    });
}

export function clearServiceWorkerCache() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve();
  }

  return navigator.serviceWorker.ready.then((registration) => {
    if (registration.active) {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }
  });
}

export function checkOnlineStatus(): boolean {
  return typeof window !== 'undefined' ? navigator.onLine : true;
}

export function listenToOnlineStatus(callback: (isOnline: boolean) => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
