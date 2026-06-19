/* ============================================
   HUNA App State
   ============================================ */

export const AppState = {
  lang: localStorage.getItem('huna-lang') || 'en',
  theme: localStorage.getItem('huna-theme') || 'dark',
  isLoading: true,
  isMenuOpen: false,
  isModalOpen: false,
  lenis: null,
  
  setLang(lang) {
    this.lang = lang;
    localStorage.setItem('huna-lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    window.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  },
  
  setTheme(theme) {
    this.theme = theme;
    localStorage.setItem('huna-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
  },
  
  toggleTheme() {
    this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
  },
  
  toggleLang() {
    this.setLang(this.lang === 'en' ? 'ar' : 'en');
  },
  
  // init() {
  //   // Set initial lang
  //   document.documentElement.lang = this.lang;
  //   document.documentElement.dir = this.lang === 'ar' ? 'rtl' : 'ltr';
    
  //   // Set initial theme
  //   document.documentElement.setAttribute('data-theme', this.theme);
    
  //   // Check system preference
  //   if (!localStorage.getItem('huna-theme')) {
  //     const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  //     this.setTheme(prefersDark ? 'dark' : 'light');
  //   }
  // }

  init() {
  // Set initial lang
  document.documentElement.lang = this.lang;
  document.documentElement.dir = this.lang === 'ar' ? 'rtl' : 'ltr';
  
  // Set initial theme WITHOUT dispatching event
  document.documentElement.setAttribute('data-theme', this.theme);
  
  // Check system preference only if no stored preference
  if (!localStorage.getItem('huna-theme')) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.theme = prefersDark ? 'dark' : 'light'; // Set directly, no event
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('huna-theme', this.theme);
  }
}
};

AppState.init();
