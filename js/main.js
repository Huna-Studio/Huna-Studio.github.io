/* ============================================
   HUNA Main Entry Point
   ============================================ */

import { AppState } from './core/state.js';
import { loadTranslations, applyTranslations } from './core/i18n.js';
import { router } from './core/router.js';
import {
  initScrollReveal,
  animateCounters,
  initMagneticButtons,
  initCursorEffects,
  initParticles,
  initSmoothScroll,
  initGSAPAnimations,
  hideLoadingScreen,
  initNavbarScroll
} from './utils/animations.js';
import { initHomePage } from './pages/home.js';
import './components/navbar.js';
import './components/footer.js';

// ============================================
// PWA Registration
// ============================================
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('SW registered:', registration.scope);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              showUpdateNotification(newWorker);
            }
          });
        });
        
      } catch (error) {
        console.error('SW registration failed:', error);
      }
    });
  }
}

function showUpdateNotification(worker) {
  // Could show a toast here to reload
  console.log('New version available. Reload to update.');
}

// ============================================
// PWA Install Prompt
// ============================================
let deferredPrompt = null;

function initPWAInstall() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button if it exists
    const installBtn = document.getElementById('pwa-install');
    if (installBtn) {
      installBtn.style.display = 'flex';
      installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User installed PWA');
        }
        deferredPrompt = null;
      });
    }
  });
  
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const installBtn = document.getElementById('pwa-install');
    if (installBtn) installBtn.style.display = 'none';
    console.log('PWA installed');
  });
}

// ============================================
// Initialize App
// ============================================
async function init() {
  // Register PWA
  registerServiceWorker();
  initPWAInstall();
  
  // Load translations
  await loadTranslations();
  
  // Initialize animations
  initScrollReveal();
  animateCounters();
  initMagneticButtons();
  initCursorEffects();
  initParticles();
  initSmoothScroll();
  initGSAPAnimations();
  initNavbarScroll();
  
  // Initialize page-specific content
  const page = document.body.getAttribute('data-page');
  
  if (page === 'home') {
    await initHomePage();
  }
  
  // Initialize router for SPA-like transitions
  router.init();
  
  // Hide loading screen
  setTimeout(() => {
    hideLoadingScreen();
  }, 1500); // Minimum display time for smooth UX
  
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  // Re-initialize icons on content changes
  window.addEventListener('pagereload', () => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    initScrollReveal();
    animateCounters();
  });
  
  // Re-initialize on language change
  window.addEventListener('langchange', async () => {
    await loadTranslations();
    applyTranslations();
    
    // Reload page content
    if (page === 'home') {
      await initHomePage();
    }
    
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  });
  
  console.log('HUNA initialized');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
