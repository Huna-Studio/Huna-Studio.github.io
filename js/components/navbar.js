/* ============================================
   HUNA Navbar Web Component
   ============================================ */

import { AppState } from '../core/state.js';
import { t, loadTranslations } from '../core/i18n.js';
import { fetchData } from '../utils/api.js';

class HunaNavbar extends HTMLElement {
  constructor() {
    super();
    this.navData = null;
  }

  async connectedCallback() {
    await this.loadData();
    this.render();
    this.attachEvents();
    
    // Re-render on language change
    window.addEventListener('langchange', () => this.render());
  }

  async loadData() {
    try {
      this.navData = await fetchData('/data/navigation.json');
    } catch (e) {
      console.error('Failed to load navigation:', e);
      // Fallback data
      this.navData = {
        logo: { src: 'assets/images/Huna-logo-(no-bg).png', alt: 'HUNA' },
        links: [
          { label_en: 'Home', label_ar: 'الرئيسية', href: '/index.html', icon: 'home' },
          { label_en: 'About', label_ar: 'عن هُنا', href: '/pages/about.html', icon: 'info' },
          { label_en: 'Courses', label_ar: 'الدورات', href: '/pages/courses.html', icon: 'book-open' },
          { label_en: 'Projects', label_ar: 'المشاريع', href: '/pages/projects.html', icon: 'folder-git-2' },
          { label_en: 'Volunteer', label_ar: 'تطوع', href: '/pages/volunteer.html', icon: 'heart-handshake' },
          { label_en: 'Contact', label_ar: 'تواصل', href: '/pages/contact.html', icon: 'mail' }
        ],
        cta: { label_en: 'Join HUNA', label_ar: 'انضم إلى هُنا', href: '/pages/volunteer.html', icon: 'user-plus' },
        langToggle: { label_en: 'English', label_ar: 'العربية' },
        themeToggle: { label_en: 'Theme', label_ar: 'المظهر' }
      };
    }
  }

  render() {
    const lang = AppState.lang;
    const isRTL = lang === 'ar';
    const data = this.navData;
    
    const currentPath = window.location.pathname;
    
    this.innerHTML = `
      <nav class="navbar" role="navigation" aria-label="Main navigation">
        <div class="container">
          <a href="/index.html" class="navbar-logo" aria-label="HUNA Home">
            <img src="${data.logo.src}" alt="${data.logo.alt}" width="40" height="40" loading="eager">
            <span class="navbar-logo-text">HUNA</span>
          </a>
          
          <div class="navbar-nav" role="menubar">
            ${data.links.map(link => {
              const label = lang === 'ar' ? link.label_ar : link.label_en;
              const isActive = currentPath === link.href || currentPath.endsWith(link.href.replace(/^\//, ''));
              return `<a href="${link.href}" class="nav-link ${isActive ? 'active' : ''}" role="menuitem">${label}</a>`;
            }).join('')}
          </div>
          
          <div class="navbar-actions">
            <button class="theme-toggle" aria-label="${data.themeToggle[lang === 'ar' ? 'label_ar' : 'label_en']}" title="Toggle theme">
              <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </button>
            
            <button class="lang-toggle" aria-label="Switch language">
              ${data.langToggle[lang === 'ar' ? 'label_ar' : 'label_en']}
            </button>
            
            <a href="${data.cta.href}" class="btn btn-primary btn-small hide-mobile">
              ${lang === 'ar' ? data.cta.label_ar : data.cta.label_en}
            </a>
            
            <button class="menu-toggle" aria-label="Toggle menu" aria-expanded="false">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>
      
      <div class="mobile-menu" role="dialog" aria-modal="true" aria-label="Mobile menu">
        <div class="navbar-nav">
          ${data.links.map(link => {
            const label = lang === 'ar' ? link.label_ar : link.label_en;
            return `<a href="${link.href}" class="nav-link">${label}</a>`;
          }).join('')}
        </div>
        <div class="navbar-actions">
          <a href="${data.cta.href}" class="btn btn-primary btn-large">
            ${lang === 'ar' ? data.cta.label_ar : data.cta.label_en}
          </a>
          <button class="lang-toggle" style="margin-top: 1rem;">
            ${data.langToggle[lang === 'ar' ? 'label_ar' : 'label_en']}
          </button>
        </div>
      </div>
    `;
    
    // Update theme toggle icon state
    this.updateThemeIcon();
  }

  attachEvents() {
    // Theme toggle
    this.addEventListener('click', (e) => {
      const themeBtn = e.target.closest('.theme-toggle');
      if (themeBtn) {
        AppState.toggleTheme();
        this.updateThemeIcon();
      }
    });
    
    // Language toggle
    this.addEventListener('click', (e) => {
      const langBtn = e.target.closest('.lang-toggle');
      if (langBtn) {
        AppState.toggleLang();
      }
    });
    
    // Mobile menu toggle
    this.addEventListener('click', (e) => {
      const menuBtn = e.target.closest('.menu-toggle');
      if (menuBtn) {
        const mobileMenu = this.querySelector('.mobile-menu');
        const isOpen = mobileMenu.classList.toggle('active');
        menuBtn.classList.toggle('active');
        menuBtn.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      }
    });
    
    // Close mobile menu on link click
    this.addEventListener('click', (e) => {
      const link = e.target.closest('.mobile-menu .nav-link');
      if (link) {
        const mobileMenu = this.querySelector('.mobile-menu');
        const menuBtn = this.querySelector('.menu-toggle');
        mobileMenu.classList.remove('active');
        menuBtn.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  updateThemeIcon() {
    const theme = AppState.theme;
    // The CSS handles the icon switching based on data-theme attribute
  }
}

customElements.define('huna-navbar', HunaNavbar);
