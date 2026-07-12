/* ============================================
   HUNA Coming Soon Redirect v2
   Blocks all pages until launch
   MUST be the FIRST script in <head>
   
   Features:
   - Environment-aware config (dev/prod)
   - localStorage fallback for sessionStorage
   - Better subdirectory path handling
   - Launch date auto-check (redirects to home when launched)
   - Configurable via URL params for testing
   ============================================ */

(function() {
  'use strict';
  
  // === CONFIGURATION ===
  // Override via URL: ?cs_mode=false or ?cs_date=2026-09-09
  const urlParams = new URLSearchParams(window.location.search);
  
  const CONFIG = {
    // Main toggle - set to false to publish
    ENABLED: urlParams.has('cs_mode') 
      ? urlParams.get('cs_mode') !== 'false'
      : true,
    
    // Launch date (ISO format)
    LAUNCH_DATE: urlParams.get('cs_date') || '2026-09-09T00:00:00',
    
    // Pages that are ALWAYS accessible (exact filenames or folder prefixes)
    WHITELIST: [
      'coming-soon.html',
      'volunteer',
      // Add more as needed:
      // 'api/',
      // 'assets/',
      // 'sw.js',
    ],
    
    // Storage key prefix
    STORAGE_PREFIX: 'huna-cs-',
  };
  // =====================
  
  // === UTILITY: Safe Storage ===
  // Tries sessionStorage first, falls back to localStorage, then memory
  const Storage = (function() {
    const memoryStore = new Map();
    
    function tryStorage(store) {
      try {
        const testKey = '__cs_test__';
        store.setItem(testKey, '1');
        store.removeItem(testKey);
        return store;
      } catch(e) {
        return null;
      }
    }
    
    const primary = tryStorage(window.sessionStorage);
    const fallback = tryStorage(window.localStorage);
    
    return {
      set(key, value) {
        const fullKey = CONFIG.STORAGE_PREFIX + key;
        const data = JSON.stringify({ value, time: Date.now() });
        if (primary) primary.setItem(fullKey, data);
        else if (fallback) fallback.setItem(fullKey, data);
        else memoryStore.set(fullKey, data);
      },
      get(key) {
        const fullKey = CONFIG.STORAGE_PREFIX + key;
        let data = null;
        if (primary) data = primary.getItem(fullKey);
        else if (fallback) data = fallback.getItem(fullKey);
        else data = memoryStore.get(fullKey);
        
        if (!data) return null;
        try {
          const parsed = JSON.parse(data);
          // Expire after 24 hours
          if (Date.now() - parsed.time > 24 * 60 * 60 * 1000) {
            this.remove(key);
            return null;
          }
          return parsed.value;
        } catch(e) {
          return null;
        }
      },
      remove(key) {
        const fullKey = CONFIG.STORAGE_PREFIX + key;
        if (primary) primary.removeItem(fullKey);
        if (fallback) fallback.removeItem(fullKey);
        memoryStore.delete(fullKey);
      }
    };
  })();
  
  // === CHECK: Is launch date passed? ===
  function isLaunched() {
    try {
      const launchTime = new Date(CONFIG.LAUNCH_DATE).getTime();
      return Date.now() >= launchTime;
    } catch(e) {
      return false;
    }
  }
  
  // === CHECK: Is this page whitelisted? ===
  function isWhitelisted(path, page) {
    return CONFIG.WHITELIST.some(w => {
      // Folder prefix match (e.g., 'api/')
      if (w.endsWith('/')) {
        return path.includes('/' + w) || path.startsWith(w);
      }
      // Exact filename match
      return page === w || path.endsWith('/' + w);
    });
  }
  
  // === CHECK: Is this the coming-soon page? ===
  function isComingSoonPage(path) {
    return path.includes('coming-soon') || /coming-soon\\.html$/i.test(path);
  }
  
  // === GET: Correct redirect path ===
  function getRedirectPath(currentPath) {
    // If already in /pages/ directory
    if (currentPath.includes('/pages/')) {
      return 'coming-soon.html';
    }
    // If in root or other directory
    return 'pages/coming-soon.html';
  }
  
  // === MAIN LOGIC ===
  
  // 1. If disabled, do nothing
  if (!CONFIG.ENABLED) {
    // Clean up any stored intended URL
    Storage.remove('intended');
    return;
  }
  
  // 2. If launched, redirect stored intended URL to home
  if (isLaunched()) {
    const intended = Storage.get('intended');
    if (intended && isComingSoonPage(window.location.pathname)) {
      window.location.replace(intended);
      return;
    }
    // If we're past launch and not on coming-soon, allow through
    Storage.remove('intended');
    return;
  }
  
  // 3. Get current path info
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';
  
  // 4. Check whitelist
  if (isWhitelisted(path, page)) {
    return;
  }
  
  // 5. Already on coming soon? Stop.
  if (isComingSoonPage(path)) {
    return;
  }
  
  // 6. Save intended destination
  try {
    Storage.set('intended', window.location.href);
    Storage.set('launch-date', CONFIG.LAUNCH_DATE);
  } catch(e) {
    // Silent fail - redirect anyway
  }
  
  // 7. Redirect to coming soon page
  const redirectPath = getRedirectPath(path);
  window.location.replace(redirectPath);
  
})();