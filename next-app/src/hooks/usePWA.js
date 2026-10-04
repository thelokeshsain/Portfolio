"use client";

/**
 * usePWA Hook
 * - Proactively unregisters any legacy Service Worker registrations
 * - Clears obsolete cache storages
 * - Captures optional beforeinstallprompt event for PWA installation
 */
import { useState, useEffect } from 'react';

export default function usePWA() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    return typeof window !== 'undefined' && (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  });

  useEffect(() => {
    // Proactively decommission any active service workers and clear caches
    if (typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        }).catch(() => {});
      }

      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        }).catch(() => {});
      }
    }

    // Capture install prompt (Chrome/Edge/Samsung)
    const handlePrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);

    // Detect successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (!installPrompt) return false;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setInstallPrompt(null);
    }
    return outcome === 'accepted';
  };

  return { isInstallable, isInstalled, swRegistered: false, triggerInstall };
}
