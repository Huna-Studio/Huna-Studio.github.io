/* ============================================
   HUNA Courses Page Logic
   ============================================ */

import { AppState } from '../core/state.js';
import { fetchData } from '../utils/api.js';

let allCourses = [];
let filteredCourses = [];
let currentPage = 1;
const itemsPerPage = 6;
let currentFilter = 'all';
let currentSort = 'newest';
let searchQuery = '';

// Load and render courses
export async function loadCourses() {
  const container = document.getElementById('courses-grid');
  if (!container) return;
  
  try {
    const data = await fetchData('/data/courses.json');
    allCourses = data.courses;
    filteredCourses = [...allCourses];
    
    applyFilters();
    renderCourses();
    renderPagination();
    attachFilterEvents();
    attachSearchEvents();
    
  } catch (e) {
    console.error('Failed to load courses:', e);
    container.innerHTML = '<p class="empty-state">Failed to load courses</p>';
  }
}

function applyFilters() {
  filteredCourses = allCourses.filter(course => {
    // Category filter
    if (currentFilter !== 'all' && course.category !== currentFilter) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const title = AppState.lang === 'ar' ? course.title_ar : course.title_en;
      const desc = AppState.lang === 'ar' ? course.description_ar : course.description_en;
      const tags = course.tags.join(' ').toLowerCase();
      
      if (!title.toLowerCase().includes(query) && 
          !desc.toLowerCase().includes(query) && 
          !tags.includes(query)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Sort
  if (currentSort === 'newest') {
    filteredCourses.sort((a, b) => b.id.localeCompare(a.id));
  } else if (currentSort === 'popular') {
    // Would use enrollment count in production
    filteredCourses.sort((a, b) => a.title_en.localeCompare(b.title_en));
  } else if (currentSort === 'level') {
    const levelOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
    filteredCourses.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);
  }
  
  currentPage = 1;
}

function renderCourses() {
  const container = document.getElementById('courses-grid');
  const lang = AppState.lang;
  
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageCourses = filteredCourses.slice(start, end);
  
  if (pageCourses.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <p>No courses found matching your criteria.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = pageCourses.map(course => `
    <article class="card course-card" data-course-id="${course.id}" data-reveal>
      <div class="card-image">
        <img src="${course.image}" alt="${lang === 'ar' ? course.title_ar : course.title_en}" loading="lazy">
        <span class="card-badge" style="background: ${getLevelColor(course.level)};">${lang === 'ar' ? course.level_ar : course.level}</span>
        ${course.status === 'upcoming' ? '<span class="card-badge" style="background: var(--huna-orange); right: auto; left: auto; top: auto; bottom: 12px; right: 12px;">Upcoming</span>' : ''}
      </div>
      <div class="card-content">
        <div class="card-meta" style="margin-bottom: var(--space-2);">
          <span class="badge badge-primary" style="font-size: var(--text-xs);">${lang === 'ar' ? course.category_ar : course.category}</span>
        </div>
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
        <div style="margin-top: var(--space-4); display: flex; gap: var(--space-3);">
          <a href="${course.enrollment}" class="btn btn-primary btn-small" style="flex: 1; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Enroll
          </a>
          <button class="btn btn-ghost btn-small" onclick="showCourseDetails('${course.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Details
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

function getLevelColor(level) {
  const colors = {
    'Beginner': '#10B981',
    'Intermediate': '#F99A00',
    'Advanced': '#EF4444'
  };
  return colors[level] || '#6A59C4';
}

function renderPagination() {
  const container = document.getElementById('courses-pagination');
  if (!container) return;
  
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  let html = `
    <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
  `;
  
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }
  
  html += `
    <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>
  `;
  
  container.innerHTML = html;
}

function attachFilterEvents() {
  const filterGroup = document.getElementById('category-filters');
  if (!filterGroup) return;
  
  filterGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    
    filterGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    currentFilter = btn.getAttribute('data-filter');
    applyFilters();
    renderCourses();
    renderPagination();
  });
}

function attachSearchEvents() {
  const searchInput = document.getElementById('course-search');
  if (!searchInput) return;
  
  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery = e.target.value.trim();
      applyFilters();
      renderCourses();
      renderPagination();
    }, 300);
  });
}

// Exposed for onclick handlers
window.changePage = function(page) {
  currentPage = page;
  renderCourses();
  renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.showCourseDetails = function(courseId) {
  const course = allCourses.find(c => c.id === courseId);
  if (!course) return;
  
  const lang = AppState.lang;
  const title = lang === 'ar' ? course.title_ar : course.title_en;
  const desc = lang === 'ar' ? course.description_ar : course.description_en;
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal active" style="max-width: 600px;">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="modal-body">
        <img src="${course.image}" alt="${title}" style="width: 100%; border-radius: var(--radius-md); margin-bottom: var(--space-4);">
        <p style="color: var(--text-secondary); line-height: 1.7; margin-bottom: var(--space-4);">${desc}</p>
        <div style="display: flex; gap: var(--space-4); flex-wrap: wrap; margin-bottom: var(--space-4);">
          <span class="badge badge-primary">${course.level}</span>
          <span class="badge badge-info">${course.duration}</span>
          <span class="badge badge-warning">${course.category}</span>
        </div>
        <div class="card-tags" style="margin-bottom: var(--space-4);">
          ${course.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
        </div>
        <p style="color: var(--text-secondary);"><strong>Instructor:</strong> ${course.instructor}</p>
      </div>
      <div class="modal-footer">
        <a href="${course.enrollment}" class="btn btn-primary">Enroll Now</a>
        <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.classList.add('modal-open');
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      document.body.classList.remove('modal-open');
    }
  });
};

// Initialize courses page
export async function initCoursesPage() {
  await loadCourses();
}
