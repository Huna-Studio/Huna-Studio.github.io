/* ============================================
   HUNA Router (Page Transitions)
   ============================================ */

// Pages that redirect to Coming Soon
const COMING_SOON_ROUTES = [
  '/courses',
  '/projects',
  '/volunteer',
  '/contact'
  // Add more as needed
];

export class Router {
  constructor() {
    this.currentPage = '';
    this.isTransitioning = false;
  }

  init() {
    // Handle all internal link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="/"], a[href^="./"], a[href^="../"]');
      if (!link) return;
      
      // Skip if modifier keys or external links
      if (e.ctrlKey || e.metaKey || e.shiftKey || link.target === '_blank') return;
      if (link.hostname !== window.location.hostname) return;
      
      e.preventDefault();
      
      // Check if this route is coming soon
      const path = new URL(link.href).pathname;
      if (this.isComingSoon(path)) {
        this.navigate('/pages/coming-soon.html');
        return;
      }
      
      this.navigate(link.href);
    });
    
    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.loadPage(window.location.href, false);
    });
  }
  
  isComingSoon(path) {
    // Normalize path (remove trailing slash, handle index)
    const normalized = path.replace(/\/$/, '') || '/';
    return COMING_SOON_ROUTES.some(route => {
      const routeNormalized = route.replace(/\/$/, '');
      return normalized === routeNormalized || normalized.startsWith(routeNormalized + '/');
    });
  }
  
  async navigate(url) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    // Show transition overlay
    const overlay = document.querySelector('.page-transition-overlay');
    if (overlay) {
      overlay.classList.add('active');
      await this.delay(300);
    }
    
    await this.loadPage(url, true);
    
    // Hide overlay
    if (overlay) {
      await this.delay(100);
      overlay.classList.remove('active');
    }
    
    this.isTransitioning = false;
  }
  
  async loadPage(url, pushState = true) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      // Parse new page
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(html, 'text/html');
      
      // Update content
      const newMain = newDoc.querySelector('main');
      const currentMain = document.querySelector('main');
      
      if (newMain && currentMain) {
        currentMain.innerHTML = newMain.innerHTML;
      }
      
      // Update title
      if (newDoc.title) {
        document.title = newDoc.title;
      }
      
      // Update body data-page
      const newPageData = newDoc.body?.getAttribute('data-page');
      if (newPageData) {
        document.body.setAttribute('data-page', newPageData);
      }
      
      // Push state
      if (pushState) {
        window.history.pushState({}, '', url);
      }
      
      // Re-initialize page scripts
      window.dispatchEvent(new CustomEvent('pagereload'));
      
      // Scroll to top
      window.scrollTo(0, 0);
      
    } catch (error) {
      console.error('Navigation failed:', error);
      window.location.href = url;
    }
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const router = new Router();