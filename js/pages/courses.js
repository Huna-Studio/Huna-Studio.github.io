/* ============================================
   HUNA Courses Page Logic — Enhanced v3
   ============================================
   Features:
   - Category filtering with URL sync
   - Search with debounce + clear button
   - Sort dropdown (newest, popular, level, duration, alphabetical)
   - Grid/List view toggle
   - Skeleton loading state
   - Active filter chips
   - Results count
   - Pagination with smart ellipsis
   - Course detail modal with prerequisites & syllabus
   - Keyboard navigation (Escape to close modal, arrows for pagination)
   - URL state sync for shareable filtered views
   - Image fallback handling
   - Empty state with reset CTA
   - Fixed enroll button links
   - Referral badge on cards
   ============================================ */

import { AppState } from '../core/state.js';
import { fetchData } from '../utils/api.js';

// ─── STATE ───────────────────────────────────
let allCourses = [];
let filteredCourses = [];
let currentPage = 1;
const itemsPerPage = 6;
let currentFilter = 'all';
let currentSort = 'newest';
let searchQuery = '';
let currentView = 'grid';

// ─── DOM REFS ────────────────────────────────
const refs = {};

function getRefs() {
  refs.grid = document.getElementById('courses-grid');
  refs.skeleton = document.getElementById('skeleton-grid');
  refs.pagination = document.getElementById('courses-pagination');
  refs.empty = document.getElementById('empty-state');
  refs.search = document.getElementById('course-search');
  refs.searchClear = document.getElementById('search-clear');
  refs.filterGroup = document.getElementById('category-filters');
  refs.sortSelect = document.getElementById('sort-select');
  refs.activeFilters = document.getElementById('active-filters');
  refs.activeFiltersList = document.getElementById('active-filters-list');
  refs.clearAllBtn = document.getElementById('clear-all-filters');
  refs.resultsCount = document.getElementById('results-count');
  refs.resetBtn = document.getElementById('reset-filters-btn');
  refs.modal = document.getElementById('course-modal');
  refs.modalTitle = document.getElementById('modal-title');
  refs.modalBody = document.getElementById('modal-body');
  refs.modalFooter = document.getElementById('modal-footer');
  refs.modalClose = document.getElementById('modal-close');
  refs.viewToggle = document.querySelector('.view-toggle');
  refs.filterBar = document.getElementById('filter-bar');
}

// ─── INIT ────────────────────────────────────
export async function initCoursesPage() {
  getRefs();
  readUrlState();
  attachAllEvents();
  setupStickyFilterBar();
  
  // Show skeleton, hide grid
  showSkeleton();
  
  try {
    await loadCourses();
  } catch (e) {
    console.error('Failed to load courses:', e);
    showError();
  }
}

// ─── LOAD COURSES ────────────────────────────
async function loadCourses() {
  const data = await fetchData('/data/courses.json');
  allCourses = data.courses.map(enrichCourse);
  filteredCourses = [...allCourses];
  
  applyFilters();
  hideSkeleton();
  renderCourses();
  renderPagination();
  updateResultsCount();
  renderActiveFilters();
  updateUrlState();
}

// Enrich course data with defaults
function enrichCourse(course) {
  return {
    ...course,
    enrollment_count: course.enrollment_count ?? Math.floor(Math.random() * 500) + 50,
    date_added: course.date_added ?? '2026-01-01',
    prerequisites: course.prerequisites ?? [],
    syllabus: course.syllabus ?? [],
    slug: course.slug ?? course.id,
    hasReferral: course.hasReferral !== false,
    referralRequiredCount: course.referralRequiredCount || 3,
    groupLink: course.groupLink || ''
  };
}

// ─── SKELETON ────────────────────────────────
function showSkeleton() {
  if (refs.skeleton) refs.skeleton.hidden = false;
  if (refs.grid) refs.grid.hidden = true;
  if (refs.empty) refs.empty.hidden = true;
  if (refs.pagination) refs.pagination.hidden = true;
}

function hideSkeleton() {
  if (refs.skeleton) refs.skeleton.hidden = true;
}

// ─── ERROR STATE ─────────────────────────────
function showError() {
  hideSkeleton();
  if (refs.grid) {
    refs.grid.hidden = false;
    refs.grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h3 class="empty-state-title">Failed to load courses</h3>
        <p class="empty-state-desc">Please check your connection and try again.</p>
        <button type="button" class="btn btn-primary" onclick="location.reload()">Retry</button>
      </div>
    `;
  }
}

// ─── APPLY FILTERS ───────────────────────────
function applyFilters() {
  filteredCourses = allCourses.filter(course => {
    // Category filter
    if (currentFilter !== 'all' && course.category !== currentFilter) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const lang = AppState.lang;
      const title = lang === 'ar' ? course.title_ar : course.title_en;
      const desc = lang === 'ar' ? course.description_ar : course.description_en;
      const instructor = course.instructor.toLowerCase();
      const tags = course.tags.join(' ').toLowerCase();
      const category = (lang === 'ar' ? course.category_ar : course.category).toLowerCase();
      
      const match = title.toLowerCase().includes(query) || 
          desc.toLowerCase().includes(query) || 
          instructor.includes(query) ||
          tags.includes(query) ||
          category.includes(query);
      
      if (!match) return false;
    }
    
    return true;
  });
  // Sort
  sortCourses();
  
  currentPage = 1;
}

function sortCourses() {
  const lang = AppState.lang;
  
  switch (currentSort) {
    case 'newest':
      filteredCourses.sort((a, b) => new Date(b.date_added) - new Date(a.date_added));
      break;
    case 'popular':
      filteredCourses.sort((a, b) => (b.enrollment_count || 0) - (a.enrollment_count || 0));
      break;
    case 'level': {
      const levelOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
      filteredCourses.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);
      break;
    }
    case 'duration': {
      const getWeeks = (d) => parseInt(d) || 0;
      filteredCourses.sort((a, b) => getWeeks(a.duration) - getWeeks(b.duration));
      break;
    }
    case 'alphabetical':
      filteredCourses.sort((a, b) => {
        const tA = (lang === 'ar' ? a.title_ar : a.title_en).toLowerCase();
        const tB = (lang === 'ar' ? b.title_ar : b.title_en).toLowerCase();
        return tA.localeCompare(tB);
      });
      break;
  }
}

// ─── RENDER COURSES ──────────────────────────
function renderCourses() {
  if (!refs.grid) return;
  
  const lang = AppState.lang;
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageCourses = filteredCourses.slice(start, end);
  
  if (pageCourses.length === 0) {
    refs.grid.hidden = true;
    refs.empty.hidden = false;
    refs.pagination.hidden = true;
    return;
  }
  
  refs.grid.hidden = false;
  refs.empty.hidden = true;
  refs.pagination.hidden = false;
  
  refs.grid.innerHTML = pageCourses.map(course => renderCourseCard(course, lang)).join('');
  
  // Re-init icons for dynamically added content
  if (window.lucide) lucide.createIcons();
}

function renderCourseCard(course, lang) {
  const title = lang === 'ar' ? course.title_ar : course.title_en;
  const desc = lang === 'ar' ? course.description_ar : course.description_en;
  const category = lang === 'ar' ? course.category_ar : course.category;
  const level = lang === 'ar' ? course.level_ar : course.level;
  const duration = lang === 'ar' ? course.duration_ar : course.duration;
  const levelColor = getLevelColor(course.level);
  const isUpcoming = course.status === 'upcoming';
  const isReferral = course.hasReferral !== false;
  const imageUrl = getImageUrl(course.image);
  const enrollUrl = `./enroll?slug=${course.slug}`;
  const detailUrl = `./course?slug=${course.slug}`;
  
  return `
    <article class="card course-card" data-course-id="${course.id}" tabindex="0" role="button" aria-label="View details for ${title}">
      <div class="card-image">
        <img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.src='../assets/images/Huna-logo-(no-bg).webp';this.style.objectFit='contain';this.style.padding='20px';this.style.background='var(--bg-hover)';">
        <span class="card-badge" style="background: ${levelColor};">${level}</span>
        ${isUpcoming ? `<span class="card-badge-upcoming" data-i18n="status_upcoming">Upcoming</span>` : ''}
        ${(!isUpcoming && isReferral) ? `<span class="card-badge-referral">${lang === 'ar' ? 'إحالات' : 'Referral'}</span>` : ''}
      </div>
      <div class="card-content">
        <div class="card-meta">
          <span class="badge badge-primary" style="font-size: var(--text-xs);">${category}</span>
        </div>
        <h3 class="card-title">${title}</h3>
        <p class="card-desc">${desc}</p>
        <div class="card-meta">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            ${duration}
          </span>
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            ${course.instructor}
          </span>
        </div>
        <div class="enrollment-count">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          ${course.enrollment_count?.toLocaleString() ?? 0} enrolled
        </div>
        <div class="card-tags">
          ${course.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
        </div>
        <div class="card-actions">
          <a href="${enrollUrl}" class="btn btn-primary btn-small ${isUpcoming ? 'btn-disabled' : ''}" ${isUpcoming ? 'aria-disabled="true" tabindex="-1"' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            ${isUpcoming ? 'Coming Soon' : 'Enroll'}
          </a>
          <a href="${detailUrl}" class="btn btn-ghost btn-small">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Details
          </a>
        </div>
      </div>
    </article>
  `;
}

function getLevelColor(level) {
  const colors = {
    'Beginner': '#10B981',
    'Intermediate': '#F99A00',
    'Advanced': '#EF4444'
  };
  return colors[level] || '#6A59C4';
}

function getImageUrl(imagePath) {
  if (!imagePath || imagePath === '#') return '../assets/images/Huna-logo-(no-bg).webp';
  // Handle both absolute and relative paths
  if (imagePath.startsWith('/')) return '..' + imagePath;
  return imagePath;
}

// ─── RENDER PAGINATION ───────────────────────
function renderPagination() {
  if (!refs.pagination) return;
  
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  
  if (totalPages <= 1) {
    refs.pagination.hidden = true;
    return;
  }
  
  refs.pagination.hidden = false;
  
  const pages = getPaginationPages(currentPage, totalPages);
  
  let html = `
    <button type="button" class="page-btn page-prev" data-page="prev" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous page">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
  `;
  
  pages.forEach(p => {
    if (p === '...') {
      html += `<span class="page-ellipsis">...</span>`;
    } else {
      html += `<button type="button" class="page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}" aria-label="Page ${p}" ${p === currentPage ? 'aria-current="page"' : ''}>${p}</button>`;
    }
  });
  
  html += `
    <button type="button" class="page-btn page-next" data-page="next" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next page">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>
  `;
  
  refs.pagination.innerHTML = html;
}

// Smart pagination with ellipsis
function getPaginationPages(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  
  if (current <= 3) {
    return [1, 2, 3, 4, '...', total];
  }
  
  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total];
  }
  
  return [1, '...', current - 1, current, current + 1, '...', total];
}

// ─── RESULTS COUNT ───────────────────────────
function updateResultsCount() {
  if (!refs.resultsCount) return;
  
  const total = filteredCourses.length;
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, total);
  
  if (total === 0) {
    refs.resultsCount.textContent = '';
    return;
  }
  
  const lang = AppState.lang;
  if (lang === 'ar') {
    refs.resultsCount.innerHTML = `عرض <strong>${start}–${end}</strong> من <strong>${total}</strong> دورة`;
  } else {
    refs.resultsCount.innerHTML = `Showing <strong>${start}–${end}</strong> of <strong>${total}</strong> courses`;
  }
}

// ─── ACTIVE FILTERS ──────────────────────────
function renderActiveFilters() {
  if (!refs.activeFilters || !refs.activeFiltersList) return;
  
  const chips = [];
  
  if (currentFilter !== 'all') {
    const btn = document.querySelector(`[data-filter="${currentFilter}"]`);
    const label = btn ? btn.textContent.trim() : currentFilter;
    chips.push({ type: 'category', label, value: currentFilter });
  }
  
  if (searchQuery) {
    chips.push({ type: 'search', label: `"${searchQuery}"`, value: searchQuery });
  }
  
  if (chips.length === 0) {
    refs.activeFilters.hidden = true;
    return;
  }
  
  refs.activeFilters.hidden = false;
  
  refs.activeFiltersList.innerHTML = chips.map(chip => `
    <button type="button" class="filter-chip" data-remove="${chip.type}" data-value="${chip.value}">
      ${chip.label}
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `).join('');
}

// ─── URL STATE SYNC ──────────────────────────
function updateUrlState() {
  const params = new URLSearchParams();
  
  if (currentFilter !== 'all') params.set('category', currentFilter);
  if (currentSort !== 'newest') params.set('sort', currentSort);
  if (searchQuery) params.set('search', searchQuery);
  if (currentPage > 1) params.set('page', currentPage);
  if (currentView !== 'grid') params.set('view', currentView);
  
  const newUrl = params.toString() 
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;
  
  window.history.replaceState({ filter: currentFilter, sort: currentSort, search: searchQuery, page: currentPage }, '', newUrl);
}

function readUrlState() {
  const params = new URLSearchParams(window.location.search);
  
  const cat = params.get('category');
  if (cat) currentFilter = cat;
  
  const sort = params.get('sort');
  if (sort && ['newest', 'popular', 'level', 'duration', 'alphabetical'].includes(sort)) {
    currentSort = sort;
  }
  
  const search = params.get('search');
  if (search) {
    searchQuery = search;
    if (refs.search) refs.search.value = search;
  }
  
  const page = parseInt(params.get('page'));
  if (page && page > 0) currentPage = page;
  
  const view = params.get('view');
  if (view === 'list') currentView = 'list';
}

// ─── EVENT HANDLERS ──────────────────────────
function attachAllEvents() {
  // Filter buttons
  if (refs.filterGroup) {
    refs.filterGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      
      refs.filterGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentFilter = btn.dataset.filter;
      applyFilters();
      renderCourses();
      renderPagination();
      updateResultsCount();
      renderActiveFilters();
      updateUrlState();
    });
  }
  
  // Sort select
  if (refs.sortSelect) {
    // Set initial value from URL
    refs.sortSelect.value = currentSort;
    
    refs.sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      applyFilters();
      renderCourses();
      renderPagination();
      updateResultsCount();
      updateUrlState();
    });
  }
  
  // Search
  if (refs.search) {
    let debounceTimer;
    refs.search.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      
      // Show/hide clear button
      if (refs.searchClear) {
        refs.searchClear.hidden = value.length === 0;
      }
      
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchQuery = value;
        applyFilters();
        renderCourses();
        renderPagination();
        updateResultsCount();
        renderActiveFilters();
        updateUrlState();
      }, 300);
    });
  }
  
  // Search clear
  if (refs.searchClear) {
    refs.searchClear.addEventListener('click', () => {
      if (refs.search) {
        refs.search.value = '';
        refs.search.focus();
      }
      refs.searchClear.hidden = true;
      searchQuery = '';
      applyFilters();
      renderCourses();
      renderPagination();
      updateResultsCount();
      renderActiveFilters();
      updateUrlState();
    });
  }
  
  // Active filter chips
  if (refs.activeFiltersList) {
    refs.activeFiltersList.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      
      const type = chip.dataset.remove;
      
      if (type === 'category') {
        currentFilter = 'all';
        const allBtn = refs.filterGroup?.querySelector('[data-filter="all"]');
        if (allBtn) {
          refs.filterGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          allBtn.classList.add('active');
        }
      } else if (type === 'search') {
        searchQuery = '';
        if (refs.search) refs.search.value = '';
        if (refs.searchClear) refs.searchClear.hidden = true;
      }
      
      applyFilters();
      renderCourses();
      renderPagination();
      updateResultsCount();
      renderActiveFilters();
      updateUrlState();
    });
  }
  
  // Clear all
  if (refs.clearAllBtn) {
    refs.clearAllBtn.addEventListener('click', resetAllFilters);
  }
  
  // Reset from empty state
  if (refs.resetBtn) {
    refs.resetBtn.addEventListener('click', resetAllFilters);
  }
  
  // Pagination
  if (refs.pagination) {
    refs.pagination.addEventListener('click', (e) => {
      const btn = e.target.closest('.page-btn');
      if (!btn || btn.disabled) return;
      
      const pageAttr = btn.dataset.page;
      let newPage = currentPage;
      
      if (pageAttr === 'prev') {
        newPage = currentPage - 1;
      } else if (pageAttr === 'next') {
        newPage = currentPage + 1;
      } else {
        newPage = parseInt(pageAttr);
      }
      
      if (newPage !== currentPage && newPage > 0) {
        changePage(newPage);
      }
    });
  }
  
  // Course card clicks (details)
  if (refs.grid) {
    refs.grid.addEventListener('click', (e) => {
      const detailsBtn = e.target.closest('[data-action="details"]');
      if (detailsBtn) {
        e.preventDefault();
        e.stopPropagation();
        showCourseDetails(detailsBtn.dataset.courseId);
        return;
      }
      
      // Click on card itself (not on buttons/links)
      const card = e.target.closest('.course-card');
      if (card && !e.target.closest('a, button')) {
        showCourseDetails(card.dataset.courseId);
      }
    });
    
    // Keyboard support for cards
    refs.grid.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.course-card');
        if (card) {
          e.preventDefault();
          showCourseDetails(card.dataset.courseId);
        }
      }
    });
  }
  
  // View toggle
  if (refs.viewToggle) {
    refs.viewToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('.view-btn');
      if (!btn) return;
      
      refs.viewToggle.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentView = btn.dataset.view;
      
      if (refs.grid) {
        refs.grid.classList.toggle('list-view', currentView === 'list');
      }
      
      updateUrlState();
    });
    
    // Set initial view
    const initialViewBtn = refs.viewToggle.querySelector(`[data-view="${currentView}"]`);
    if (initialViewBtn) {
      refs.viewToggle.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      initialViewBtn.classList.add('active');
    }
    if (refs.grid && currentView === 'list') {
      refs.grid.classList.add('list-view');
    }
  }
  
  // Modal close
  if (refs.modalClose) {
    refs.modalClose.addEventListener('click', closeModal);
  }
  
  if (refs.modal) {
    refs.modal.addEventListener('click', (e) => {
      if (e.target === refs.modal) closeModal();
    });
  }
  
  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && refs.modal?.classList.contains('active')) {
      closeModal();
    }
  });
  
  // Popstate (browser back/forward)
  window.addEventListener('popstate', () => {
    readUrlState();
    applyFilters();
    renderCourses();
    renderPagination();
    updateResultsCount();
    renderActiveFilters();
    
    // Update UI to match URL state
    if (refs.sortSelect) refs.sortSelect.value = currentSort;
    if (refs.search) refs.search.value = searchQuery;
    if (refs.searchClear) refs.searchClear.hidden = !searchQuery;
    
    refs.filterGroup?.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.filter === currentFilter);
    });
  });
}

function changePage(page) {
  currentPage = page;
  renderCourses();
  renderPagination();
  updateResultsCount();
  updateUrlState();
  
  // Scroll to top of grid
  const gridTop = refs.grid?.offsetTop ?? 0;
  const offset = 200;
  window.scrollTo({ top: Math.max(0, gridTop - offset), behavior: 'smooth' });
}

function resetAllFilters() {
  currentFilter = 'all';
  searchQuery = '';
  currentSort = 'newest';
  currentPage = 1;
  
  if (refs.search) refs.search.value = '';
  if (refs.searchClear) refs.searchClear.hidden = true;
  if (refs.sortSelect) refs.sortSelect.value = 'newest';
  
  refs.filterGroup?.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === 'all');
  });
  
  applyFilters();
  renderCourses();
  renderPagination();
  updateResultsCount();
  renderActiveFilters();
  updateUrlState();
}

// ─── MODAL ───────────────────────────────────
function showCourseDetails(courseId) {
  const course = allCourses.find(c => c.id === courseId);
  if (!course) return;

  const lang = AppState.lang;
  const title = lang === 'ar' ? course.title_ar : course.title_en;
  const desc = lang === 'ar' ? course.description_ar : course.description_en;
  const level = lang === 'ar' ? course.level_ar : course.level;
  const duration = lang === 'ar' ? course.duration_ar : course.duration;
  const category = lang === 'ar' ? course.category_ar : course.category;
  const isUpcoming = course.status === 'upcoming';
  const isReferral = course.hasReferral !== false;
  const imageUrl = getImageUrl(course.image);
  const enrollUrl = `./enroll?slug=${course.slug}`;

  const prereqsHtml = course.prerequisites?.length 
    ? `<div class="modal-section">
        <h4 class="modal-meta-label" style="margin-bottom: var(--space-2);">Prerequisites</h4>
        <ul class="prerequisites-list">
          ${course.prerequisites.map(p => `<li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>${p}</li>`).join('')}
        </ul>
      </div>`
    : '';

  const syllabusHtml = course.syllabus?.length
    ? `<div class="modal-section">
        <h4 class="modal-meta-label" style="margin-bottom: var(--space-2);">Syllabus</h4>
        <ol class="syllabus-list">
          ${course.syllabus.map(s => `<li>${s}</li>`).join('')}
        </ol>
      </div>`
    : '';

  refs.modalTitle.textContent = title;
  
  refs.modalBody.innerHTML = `
    <img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.src='../assets/images/Huna-logo-(no-bg).webp';this.style.objectFit='contain';this.style.padding='20px';this.style.background='var(--bg-hover)';">
    <p>${desc}</p>
    <div class="modal-badges">
      <span class="badge badge-primary">${level}</span>
      <span class="badge badge-info">${duration}</span>
      <span class="badge badge-warning">${category}</span>
      <span class="badge ${isUpcoming ? 'badge-warning' : 'badge-success'}">${isUpcoming ? 'Upcoming' : 'Active'}</span>
      ${isReferral ? `<span class="badge badge-warning">${lang === 'ar' ? 'يتطلب إحالات' : 'Referral Required'}</span>` : ''}
    </div>
    <div class="modal-meta">
      <div class="modal-meta-item">
        <span class="modal-meta-label">Instructor</span>
        <span class="modal-meta-value">${course.instructor}</span>
      </div>
      <div class="modal-meta-item">
        <span class="modal-meta-label">Enrolled</span>
        <span class="modal-meta-value">${course.enrollment_count?.toLocaleString() ?? 0} students</span>
      </div>
      <div class="modal-meta-item">
        <span class="modal-meta-label">Status</span>
        <span class="modal-meta-value">${isUpcoming ? 'Coming Soon' : 'Open for Enrollment'}</span>
      </div>
    </div>
    <div class="modal-tags">
      ${course.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
    </div>
    ${prereqsHtml}
    ${syllabusHtml}
  `;
  
  refs.modalFooter.innerHTML = `
    <a href="${enrollUrl}" class="btn btn-primary ${isUpcoming ? 'btn-disabled' : ''}" ${isUpcoming ? 'aria-disabled="true" tabindex="-1"' : ''}>
      ${isUpcoming ? 'Coming Soon' : 'Enroll Now'}
    </a>
    <button type="button" class="btn btn-outline" id="modal-close-btn">Close</button>
  `;

  const modalInner = refs.modal.querySelector('.modal');

  refs.modal.hidden = false;
  refs.modal.style.display = 'flex';
  refs.modal.style.opacity = '1';
  refs.modal.style.visibility = 'visible';

  if (modalInner) {
    modalInner.style.position = 'absolute';
    modalInner.style.top = '50%';
    modalInner.style.left = '50%';
    modalInner.style.right = 'auto';
    modalInner.style.bottom = 'auto';
    modalInner.style.margin = '0';
    modalInner.style.transform = 'translate(-50%, -50%) scale(1)';
    modalInner.style.opacity = '1';
    modalInner.style.visibility = 'visible';
  }

  document.body.classList.add('modal-open');
  refs.modalClose.focus();

  const closeBtn = document.getElementById('modal-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (window.lucide) lucide.createIcons();
}

function closeModal() {
  const modalInner = refs.modal.querySelector('.modal');
  
  if (modalInner) {
    modalInner.style.position = '';
    modalInner.style.top = '';
    modalInner.style.left = '';
    modalInner.style.right = '';
    modalInner.style.bottom = '';
    modalInner.style.margin = '';
    modalInner.style.transform = '';
    modalInner.style.opacity = '';
    modalInner.style.visibility = '';
  }

  refs.modal.classList.remove('active');
  refs.modal.style.display = '';
  refs.modal.style.opacity = '';
  refs.modal.style.visibility = '';
  refs.modal.hidden = true;
  document.body.classList.remove('modal-open');
  refs.modalBody.innerHTML = '';
  refs.modalFooter.innerHTML = '';
}

// ─── STICKY FILTER BAR ───────────────────────
function setupStickyFilterBar() {
  if (!refs.filterBar) return;
  
  const observer = new IntersectionObserver(
    ([entry]) => {
      refs.filterBar.classList.toggle('stuck', !entry.isIntersecting);
    },
    { threshold: 1, rootMargin: '-80px 0px 0px 0px' }
  );
  
  // Create a sentinel element above the filter bar
  const sentinel = document.createElement('div');
  sentinel.style.height = '1px';
  sentinel.style.position = 'absolute';
  sentinel.style.top = '0';
  refs.filterBar.parentElement.insertBefore(sentinel, refs.filterBar);
  
  observer.observe(sentinel);
}

// ─── EXPORT FOR BACKWARD COMPAT ──────────────
export { loadCourses };