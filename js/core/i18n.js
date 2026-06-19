/* ============================================
   HUNA i18n System
   ============================================ */

import { AppState } from './state.js';

let translations = {};
let currentTranslations = {};

export async function loadTranslations(lang = AppState.lang) {
  try {
    // const response = await fetch(`/data/i18n/${lang}.json`);
    // if (!response.ok) throw new Error(`HTTP ${response.status}`);

    
    const basePath = window.location.pathname.includes('/pages/') ? '../' : '';
    const response = await fetch(`${basePath}data/i18n/${lang}.json`);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    translations = await response.json();
    currentTranslations = translations;
    applyTranslations();
  } catch (error) {
    console.error('Failed to load translations:', error);
    currentTranslations = {};
  }
}

export function t(key, fallback = '') {
  return currentTranslations[key] || fallback || key;
}

export function applyTranslations() {
  // Update all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (currentTranslations[key]) {
      el.innerHTML = currentTranslations[key];
    }
  });
  
  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (currentTranslations[key]) {
      el.placeholder = currentTranslations[key];
    }
  });
  
  // Update document title if needed
  const titleKey = document.querySelector('title[data-i18n-title]');
  if (titleKey) {
    const key = titleKey.getAttribute('data-i18n-title');
    if (currentTranslations[key]) {
      document.title = currentTranslations[key];
    }
  }
  
  // Update aria-labels
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    if (currentTranslations[key]) {
      el.setAttribute('aria-label', currentTranslations[key]);
    }
  });
}

// Listen for language changes
window.addEventListener('langchange', () => {
  loadTranslations();
});