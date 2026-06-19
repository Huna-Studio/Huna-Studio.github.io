/* ============================================
   HUNA Home Page Logic
   ============================================ */

import { AppState } from '../core/state.js';
import { t } from '../core/i18n.js';
import { fetchData } from '../utils/api.js';
import { showToast, success, error } from '../utils/toast.js';

// Load and render featured courses
export async function loadFeaturedCourses() {
  const container = document.getElementById('featured-courses-grid');
  if (!container) return;
  
  try {
    const data = await fetchData('/data/courses.json');
    const featured = data.courses.filter(c => c.status === 'active').slice(0, 3);
    const lang = AppState.lang;
    
    container.innerHTML = featured.map(course => `
      <article class="card course-card" data-course-id="${course.id}">
        <div class="card-image">
          <img src="${course.image}" alt="${lang === 'ar' ? course.title_ar : course.title_en}" loading="lazy">
          <span class="card-badge">${lang === 'ar' ? course.level_ar : course.level}</span>
        </div>
        <div class="card-content">
          <h3 class="card-title">${lang === 'ar' ? course.title_ar : course.title_en}</h3>
          <p class="card-desc">${lang === 'ar' ? course.description_ar : course.description_en}</p>
          <div class="card-meta">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${lang === 'ar' ? course.duration_ar : course.duration}
            </span>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              ${course.instructor}
            </span>
          </div>
          <div class="card-tags">
            ${course.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
          </div>
        </div>
      </article>
    `).join('');
    
  } catch (e) {
    console.error('Failed to load courses:', e);
    container.innerHTML = '<p class="empty-state">Failed to load courses</p>';
  }
}

// Load and render featured projects
export async function loadFeaturedProjects() {
  const container = document.getElementById('featured-projects-grid');
  if (!container) return;
  
  try {
    const data = await fetchData('/data/projects.json');
    const featured = data.projects.filter(p => p.featured).slice(0, 3);
    const lang = AppState.lang;
    
    container.innerHTML = featured.map(project => `
      <article class="card project-card" data-project-id="${project.id}">
        <div class="card-image">
          <img src="${project.images[0] || 'assets/images/placeholder.jpg'}" alt="${lang === 'ar' ? project.title_ar : project.title_en}" loading="lazy">
          <div class="card-overlay">
            <a href="${project.github}" class="btn btn-small btn-ghost" target="_blank" rel="noopener">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              GitHub
            </a>
          </div>
        </div>
        <div class="card-content">
          <h3 class="card-title">${lang === 'ar' ? project.title_ar : project.title_en}</h3>
          <p class="card-desc">${lang === 'ar' ? project.description_ar : project.description_en}</p>
          <div class="card-tech">
            ${project.technologies.slice(0, 4).map(tech => `<span>${tech}</span>`).join('')}
          </div>
        </div>
      </article>
    `).join('');
    
  } catch (e) {
    console.error('Failed to load projects:', e);
    container.innerHTML = '<p class="empty-state">Failed to load projects</p>';
  }
}

// Load and render testimonials carousel
export async function loadTestimonials() {
  const container = document.getElementById('testimonials-carousel');
  if (!container) return;
  
  try {
    const data = await fetchData('/data/testimonials.json');
    const lang = AppState.lang;
    
    container.innerHTML = `
      <div class="testimonials-track">
        ${data.testimonials.map(t => `
          <div class="testimonial-card">
            <p class="quote">${lang === 'ar' ? t.quote_ar : t.quote_en}</p>
            <div class="author">
              <img src="${t.avatar}" alt="${lang === 'ar' ? t.name_ar : t.name_en}" class="author-avatar" loading="lazy">
              <div class="author-info">
                <h4>${lang === 'ar' ? t.name_ar : t.name_en}</h4>
                <p>${lang === 'ar' ? t.role_ar : t.role_en}</p>
                <div class="stars">
                  ${Array(t.rating).fill('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>').join('')}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="carousel-nav">
        <button class="carousel-btn carousel-prev" aria-label="Previous testimonial">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div class="carousel-dots">
          ${data.testimonials.map((_, i) => `<button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to testimonial ${i + 1}"></button>`).join('')}
        </div>
        <button class="carousel-btn carousel-next" aria-label="Next testimonial">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    `;
    
    initCarousel(container);
    
  } catch (e) {
    console.error('Failed to load testimonials:', e);
    container.innerHTML = '<p class="empty-state">Failed to load testimonials</p>';
  }
}

function initCarousel(container) {
  const track = container.querySelector('.testimonials-track');
  const dots = container.querySelectorAll('.carousel-dot');
  const prevBtn = container.querySelector('.carousel-prev');
  const nextBtn = container.querySelector('.carousel-next');
  
  if (!track) return;
  
  let currentIndex = 0;
  const cards = track.querySelectorAll('.testimonial-card');
  const total = cards.length;
  
  // function goTo(index) {
  //   if (index < 0) index = total - 1;
  //   if (index >= total) index = 0;
  //   currentIndex = index;
    
  //   const card = cards[index];
  //   if (card) {
  //     card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  //   }
    
  //   dots.forEach((dot, i) => {
  //     dot.classList.toggle('active', i === currentIndex);
  //   });
  // }

  function goTo(index) {
  if (index < 0) index = total - 1;
  if (index >= total) index = 0;
  currentIndex = index;
  
  const card = cards[index];
  if (card && track) {
    // REPLACE scrollIntoView with manual scroll
    const scrollLeft = card.offsetLeft - track.offsetLeft;
    track.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }
  
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentIndex);
  });
}
  
  prevBtn?.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn?.addEventListener('click', () => goTo(currentIndex + 1));
  
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => goTo(i));
  });
  
  // Auto-scroll
  let autoScroll = setInterval(() => goTo(currentIndex + 1), 6000);
  
  track.addEventListener('mouseenter', () => clearInterval(autoScroll));
  track.addEventListener('mouseleave', () => {
    autoScroll = setInterval(() => goTo(currentIndex + 1), 6000);
  });
  
  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
    }
  }, { passive: true });
}

// Load and render news/updates
export async function loadUpdates() {
  const container = document.getElementById('updates-grid');
  if (!container) return;
  
  try {
    const data = await fetchData('/data/news.json');
    const featured = data.news.filter(n => n.featured).slice(0, 3);
    const lang = AppState.lang;
    
    container.innerHTML = featured.map(item => `
      <article class="card news-card">
        <div class="card-image">
          <img src="${item.image}" alt="${lang === 'ar' ? item.title_ar : item.title_en}" loading="lazy">
        </div>
        <div class="card-content">
          <span class="card-category">${lang === 'ar' ? item.category_ar : item.category}</span>
          <h3 class="card-title">${lang === 'ar' ? item.title_ar : item.title_en}</h3>
          <p class="card-desc">${lang === 'ar' ? item.excerpt_ar : item.excerpt_en}</p>
          <span class="card-date">${new Date(item.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </article>
    `).join('');
    
  } catch (e) {
    console.error('Failed to load news:', e);
    container.innerHTML = '<p class="empty-state">Failed to load updates</p>';
  }
}

// Newsletter form
export function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const input = form.querySelector('input[type="email"]');
    const message = document.getElementById('newsletter-message');
    const email = input.value.trim();
    
    if (!email || !email.includes('@')) {
      message.textContent = t('form_error');
      message.className = 'form-message error';
      return;
    }
    
    const btn = form.querySelector('button');
    btn.classList.add('btn-loading');
    btn.disabled = true;
    
    try {
      // REPLACE simulated delay with actual API call
      const result = await subscribeNewsletter(email);
      
      if (result.success) {
        message.textContent = t('form_success');
        message.className = 'form-message success';
        input.value = '';
        success(t('form_success'));
      } else {
        throw new Error(result.error || 'Unknown error');
      }
      
    } catch (e) {
      message.textContent = t('form_error');
      message.className = 'form-message error';
      error(t('form_error'));
    } finally {
      btn.classList.remove('btn-loading');
      btn.disabled = false;
    }
  });
}
// export function initNewsletter() {
//   const form = document.getElementById('newsletter-form');
//   if (!form) return;
  
//   form.addEventListener('submit', async (e) => {
//     e.preventDefault();
    
//     const input = form.querySelector('input[type="email"]');
//     const message = document.getElementById('newsletter-message');
//     const email = input.value.trim();
    
//     if (!email || !email.includes('@')) {
//       message.textContent = t('form_error');
//       message.className = 'form-message error';
//       return;
//     }
    
//     // Simulate submission
//     const btn = form.querySelector('button');
//     btn.classList.add('btn-loading');
//     btn.disabled = true;
    
//     try {
//       // In production, this would call the API
//       await new Promise(resolve => setTimeout(resolve, 1500));
      
//       message.textContent = t('form_success');
//       message.className = 'form-message success';
//       input.value = '';
//       success(t('form_success'));
      
//     } catch (e) {
//       message.textContent = t('form_error');
//       message.className = 'form-message error';
//       error(t('form_error'));
//     } finally {
//       btn.classList.remove('btn-loading');
//       btn.disabled = false;
//     }
//   });
// }

// Initialize all home page features
export async function initHomePage() {
  await Promise.all([
    loadFeaturedCourses(),
    loadFeaturedProjects(),
    loadTestimonials(),
    loadUpdates()
  ]);
  
  initNewsletter();
}
