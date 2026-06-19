/* ============================================
   HUNA Projects Page Logic
   ============================================ */

import { AppState } from '../core/state.js';
import { fetchData } from '../utils/api.js';

let allProjects = [];
let filteredProjects = [];
let currentPage = 1;
const itemsPerPage = 6;
let currentFilter = 'all';
let searchQuery = '';

export async function loadProjects() {
  const container = document.getElementById('projects-grid');
  if (!container) return;
  
  try {
    const data = await fetchData('/data/projects.json');
    allProjects = data.projects;
    filteredProjects = [...allProjects];
    
    applyFilters();
    renderProjects();
    renderPagination();
    attachFilterEvents();
    attachSearchEvents();
    
  } catch (e) {
    console.error('Failed to load projects:', e);
    container.innerHTML = '<p class="empty-state">Failed to load projects</p>';
  }
}

function applyFilters() {
  filteredProjects = allProjects.filter(project => {
    if (currentFilter !== 'all' && project.status !== currentFilter) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const title = AppState.lang === 'ar' ? project.title_ar : project.title_en;
      const desc = AppState.lang === 'ar' ? project.description_ar : project.description_en;
      const techs = project.technologies.join(' ').toLowerCase();
      
      if (!title.toLowerCase().includes(query) && 
          !desc.toLowerCase().includes(query) && 
          !techs.includes(query)) {
        return false;
      }
    }
    
    return true;
  });
  
  currentPage = 1;
}

function renderProjects() {
  const container = document.getElementById('projects-grid');
  const lang = AppState.lang;
  
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageProjects = filteredProjects.slice(start, end);
  
  if (pageProjects.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
        <p>No projects found matching your criteria.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = pageProjects.map(project => `
    <article class="card project-card" data-project-id="${project.id}" data-reveal>
      <div class="card-image">
        <img src="${project.images[0] || 'assets/images/placeholder.jpg'}" alt="${lang === 'ar' ? project.title_ar : project.title_en}" loading="lazy">
        <div class="card-overlay">
          <a href="${project.github}" class="btn btn-small btn-ghost" target="_blank" rel="noopener" style="color: white; border-color: rgba(255,255,255,0.3);">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            View Code
          </a>
          <button class="btn btn-small btn-primary" onclick="showProjectDetails('${project.id}')">
            Details
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="card-header">
          <h3 class="card-title">${lang === 'ar' ? project.title_ar : project.title_en}</h3>
          <span class="status-badge ${project.status}">${project.status === 'in-progress' ? 'In Progress' : 'Completed'}</span>
        </div>
        <p class="card-desc">${lang === 'ar' ? project.description_ar : project.description_en}</p>
        <div class="card-tech">
          ${project.technologies.slice(0, 5).map(tech => `<span>${tech}</span>`).join('')}
        </div>
        <div class="card-footer">
          <div class="contributors">
            <div class="contributors-avatars">
              ${project.contributors.slice(0, 3).map((c, i) => `
                <img src="assets/images/avatar-${(i % 4) + 1}.jpg" alt="${c}" title="${c}" loading="lazy">
              `).join('')}
            </div>
            <span class="contributors-count">${project.contributors.length} contributor${project.contributors.length > 1 ? 's' : ''}</span>
          </div>
          <div class="difficulty">
            <span>${project.difficulty}</span>
            <div class="difficulty-dots">
              <div class="difficulty-dot active ${project.difficulty.toLowerCase()}"></div>
              <div class="difficulty-dot active ${project.difficulty.toLowerCase()}"></div>
              <div class="difficulty-dot ${project.difficulty === 'Advanced' ? 'active ' + project.difficulty.toLowerCase() : ''}"></div>
            </div>
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

function renderPagination() {
  const container = document.getElementById('projects-pagination');
  if (!container) return;
  
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  let html = `
    <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changeProjectPage(${currentPage - 1})">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
  `;
  
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changeProjectPage(${i})">${i}</button>`;
  }
  
  html += `
    <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changeProjectPage(${currentPage + 1})">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>
  `;
  
  container.innerHTML = html;
}

function attachFilterEvents() {
  const filterGroup = document.getElementById('status-filters');
  if (!filterGroup) return;
  
  filterGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    
    filterGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    currentFilter = btn.getAttribute('data-filter');
    applyFilters();
    renderProjects();
    renderPagination();
  });
}

function attachSearchEvents() {
  const searchInput = document.getElementById('project-search');
  if (!searchInput) return;
  
  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery = e.target.value.trim();
      applyFilters();
      renderProjects();
      renderPagination();
    }, 300);
  });
}

// Exposed for onclick handlers
window.changeProjectPage = function(page) {
  currentPage = page;
  renderProjects();
  renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.showProjectDetails = function(projectId) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project) return;
  
  const lang = AppState.lang;
  const title = lang === 'ar' ? project.title_ar : project.title_en;
  const desc = lang === 'ar' ? project.description_ar : project.description_en;
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal active" style="max-width: 700px;">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove(); document.body.classList.remove('modal-open');">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="modal-body">
        <img src="${project.images[0] || 'assets/images/placeholder.jpg'}" alt="${title}" style="width: 100%; border-radius: var(--radius-md); margin-bottom: var(--space-4);">
        <p style="color: var(--text-secondary); line-height: 1.7; margin-bottom: var(--space-4);">${desc}</p>
        <div style="display: flex; gap: var(--space-4); flex-wrap: wrap; margin-bottom: var(--space-4);">
          <span class="badge badge-primary">${project.difficulty}</span>
          <span class="badge ${project.status === 'completed' ? 'badge-success' : 'badge-info'}">${project.status}</span>
        </div>
        <div class="card-tech" style="margin-bottom: var(--space-4);">
          ${project.technologies.map(tech => `<span>${tech}</span>`).join('')}
        </div>
        <div style="margin-bottom: var(--space-4);">
          <h4 style="font-size: var(--text-base); font-weight: var(--font-semibold); margin-bottom: var(--space-2);">Contributors</h4>
          <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
            ${project.contributors.map(c => `
              <span style="display: inline-flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); background: var(--bg-tertiary); border-radius: var(--radius-full); font-size: var(--text-sm);">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                ${c}
              </span>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <a href="${project.github}" class="btn btn-primary" target="_blank" rel="noopener">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          View on GitHub
        </a>
        <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove(); document.body.classList.remove('modal-open');">Close</button>
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

export async function initProjectsPage() {
  await loadProjects();
  
  // Attach click handler for project cards (moved from module level)
  const grid = document.getElementById('projects-grid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      // Handle card clicks if needed
      console.log('Project grid clicked', e.target);
    });
  }
}