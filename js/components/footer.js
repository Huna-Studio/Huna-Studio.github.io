/* ============================================
   HUNA Footer Web Component
   ============================================ */

import { AppState } from '../core/state.js';
import { fetchData } from '../utils/api.js';

class HunaFooter extends HTMLElement {
  constructor() {
    super();
    this.footerData = null;
    this.socialsData = null;
  }

  async connectedCallback() {
    await this.loadData();
    this.render();
  }

  async loadData() {
    try {
      this.footerData = await fetchData('/data/footer.json');
      this.socialsData = await fetchData('/data/socials.json');
    } catch (e) {
      console.error('Failed to load footer data:', e);
      // Fallback
      this.footerData = {
        tagline_en: 'Here. We Grow. We Build. We Impact.',
        tagline_ar: 'هُنا. ننمو. نبني. نُحدث تأثيراً.',
        columns: [],
        bottom: {
          copyright_en: '2026 HUNA Community. All rights reserved.',
          copyright_ar: '2026 مجتمع هُنا. جميع الحقوق محفوظة.',
          links: []
        }
      };
      this.socialsData = { platforms: [] };
    }
  }

  render() {
    const lang = AppState.lang;
    const footer = this.footerData;
    const socials = this.socialsData;
    
    // Social icons mapping
    const iconMap = {
      'github': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>',
      'linkedin': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>',
      'youtube': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>',
      'message-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>',
      'twitter': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>',
      'message-square': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'
    };
    
    this.innerHTML = `
      <footer class="footer" role="contentinfo">
        <div class="footer-decoration" aria-hidden="true"></div>
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <a href="/index.html" class="logo">
                <img src="assets/images/Huna-logo-(no-bg).png" alt="HUNA Logo" width="48" height="48" loading="lazy">
                <span class="logo-text">HUNA</span>
              </a>
              <p class="tagline">${lang === 'ar' ? footer.tagline_ar : footer.tagline_en}</p>
              <div class="socials">
                ${socials.platforms.map(social => `
                  <a href="${social.url}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="${social.name}">
                    ${iconMap[social.icon] || ''}
                  </a>
                `).join('')}
              </div>
            </div>
            
            ${footer.columns.map(col => `
              <div class="footer-column">
                <h4>${lang === 'ar' ? col.title_ar : col.title_en}</h4>
                <ul>
                  ${col.links.map(link => `
                    <li><a href="${link.href}">${lang === 'ar' ? link.label_ar : link.label_en}</a></li>
                  `).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
          
          <div class="footer-bottom">
            <p>${lang === 'ar' ? footer.bottom.copyright_ar : footer.bottom.copyright_en}</p>
            <div class="footer-bottom-links">
              ${footer.bottom.links.map(link => `
                <a href="${link.href}">${lang === 'ar' ? link.label_ar : link.label_en}</a>
              `).join('')}
            </div>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define('huna-footer', HunaFooter);
