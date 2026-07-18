/* ============================================
   HUNA Course Detail Page Logic — Enhanced v3
   ============================================
   Features:
   - Dynamic course loading from JSON
   - Share functionality (native + fallback)
   - Related courses rendering
   - Proper enroll button linking
   - Bilingual support (EN/AR)
   ============================================ */

import { AppState } from '../core/state.js';
import { fetchData } from '../utils/api.js';

// ─── STATE ───────────────────────────────────
let allCourses = [];
let currentCourse = null;

// ─── DOM REFS ────────────────────────────────
const refs = {};

function getRefs() {
  refs.hero = document.getElementById('course-hero');
  refs.breadcrumbTitle = document.getElementById('breadcrumb-course-title');
  refs.title = document.getElementById('course-title');
  refs.desc = document.getElementById('course-desc');
  refs.image = document.getElementById('course-image');
  refs.levelBadge = document.getElementById('course-level-badge');
  refs.statusBadge = document.getElementById('course-status-badge');
  refs.duration = document.getElementById('course-duration');
  refs.enrolled = document.getElementById('course-enrolled');
  refs.instructor = document.getElementById('course-instructor');
  refs.tags = document.getElementById('course-tags');
  refs.enrollBtn = document.getElementById('course-enroll-btn');
  refs.enrollBtnText = document.getElementById('enroll-btn-text');
  refs.shareBtn = document.getElementById('share-btn');
  refs.aboutText = document.getElementById('course-about-text');
  refs.learnList = document.getElementById('course-learn-list');
  refs.syllabus = document.getElementById('course-syllabus');
  refs.prereqList = document.getElementById('course-prereq-list');
  refs.sidebarLevel = document.getElementById('sidebar-level');
  refs.sidebarDuration = document.getElementById('sidebar-duration');
  refs.sidebarCategory = document.getElementById('sidebar-category');
  refs.sidebarStatus = document.getElementById('sidebar-status');
  refs.sidebarEnrolled = document.getElementById('sidebar-enrolled');
  refs.sidebarInstructor = document.getElementById('sidebar-instructor');
  refs.sidebarEnrollBtn = document.getElementById('sidebar-enroll-btn');
  refs.sidebarEnrollText = document.getElementById('sidebar-enroll-text');
  refs.relatedGrid = document.getElementById('related-courses-grid');
  refs.shareButtons = document.querySelectorAll('.share-btn');
}

// ─── INIT ────────────────────────────────────
export async function initCoursePage() {
  getRefs();
  
  const slug = getCourseSlugFromUrl();
  if (!slug) {
    showError('No course specified');
    return;
  }
  
  try {
    const data = await fetchData('/data/courses.json');
    allCourses = data.courses;
    currentCourse = allCourses.find(c => c.slug === slug || c.id === slug);
    
    if (!currentCourse) {
      showError('Course not found');
      return;
    }
    
    renderCourse();
    renderRelatedCourses();
    attachEvents();
    updatePageTitle();
    
  } catch (e) {
    console.error('Failed to load course:', e);
    showError('Failed to load course');
  }
}

// ─── URL PARSING ─────────────────────────────
function getCourseSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug') || params.get('id');
}

// ─── RENDER COURSE ───────────────────────────
function renderCourse() {
  const lang = AppState.lang;
  const c = currentCourse;
  const title = lang === 'ar' ? c.title_ar : c.title_en;
  const desc = lang === 'ar' ? c.description_ar : c.description_en;
  const level = lang === 'ar' ? c.level_ar : c.level;
  const duration = lang === 'ar' ? c.duration_ar : c.duration;
  const category = lang === 'ar' ? c.category_ar : c.category;
  const isUpcoming = c.status === 'upcoming';
  const isReferralCourse = c.hasReferral !== false;
  const levelColor = getLevelColor(c.level);
  const imageUrl = getImageUrl(c.image);
  const enrollUrl = `./enroll?slug=${c.slug}`;
  
  // Breadcrumb + Title
  refs.breadcrumbTitle.textContent = title;
  refs.title.textContent = title;
  document.title = `${title} — HUNA`;
  
  // Description
  refs.desc.textContent = desc;
  refs.aboutText.textContent = desc;
  
  // Image
  refs.image.src = imageUrl;
  refs.image.alt = title;
  
  // Badges
  refs.levelBadge.textContent = level;
  refs.levelBadge.style.background = levelColor;
  
  // Status badge with referral info
  let statusText = isUpcoming 
    ? (lang === 'ar' ? 'قادم' : 'Upcoming') 
    : (lang === 'ar' ? 'نشط' : 'Active');
  refs.statusBadge.textContent = statusText;
  refs.statusBadge.className = `badge ${isUpcoming ? 'badge-warning' : 'badge-success'}`;
  
  // Add referral badge if applicable
  if (isReferralCourse && !isUpcoming) {
    const refBadge = document.createElement('span');
    refBadge.className = 'badge badge-warning';
    refBadge.textContent = lang === 'ar' ? 'يتطلب إحالات' : 'Referral Required';
    refBadge.style.marginLeft = '8px';
    refs.statusBadge.parentNode.appendChild(refBadge);
  }
  
  // Stats
  refs.duration.textContent = duration;
  refs.enrolled.textContent = `${c.enrollment_count?.toLocaleString() ?? 0} ${lang === 'ar' ? 'مسجّل' : 'enrolled'}`;
  refs.instructor.textContent = c.instructor;
  
  // Tags
  refs.tags.innerHTML = c.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('');
  
  // Enroll buttons
  const enrollText = isUpcoming 
    ? (lang === 'ar' ? 'قريباً' : 'Coming Soon') 
    : (lang === 'ar' ? 'سجّل الآن' : 'Enroll Now');
  refs.enrollBtnText.textContent = enrollText;
  refs.sidebarEnrollText.textContent = enrollText;
  refs.enrollBtn.href = enrollUrl;
  refs.sidebarEnrollBtn.href = enrollUrl;
  
  if (isUpcoming) {
    refs.enrollBtn.classList.add('btn-disabled');
    refs.enrollBtn.setAttribute('aria-disabled', 'true');
    refs.sidebarEnrollBtn.classList.add('btn-disabled');
    refs.sidebarEnrollBtn.setAttribute('aria-disabled', 'true');
  }
  
  // Sidebar
  refs.sidebarLevel.textContent = level;
  refs.sidebarDuration.textContent = duration;
  refs.sidebarCategory.textContent = category;
  refs.sidebarStatus.textContent = isUpcoming 
    ? (lang === 'ar' ? 'قريباً' : 'Coming Soon') 
    : (lang === 'ar' ? 'مفتوح للتسجيل' : 'Open for Enrollment');
  refs.sidebarEnrolled.textContent = `${c.enrollment_count?.toLocaleString() ?? 0} ${lang === 'ar' ? 'طالب' : 'students'}`;
  refs.sidebarInstructor.textContent = c.instructor;
  
  // What You'll Learn
  const learnItems = extractLearningOutcomes(c);
  refs.learnList.innerHTML = learnItems.map(item => `
    <li>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span>${item}</span>
    </li>
  `).join('');
  
  // Syllabus
  refs.syllabus.innerHTML = c.syllabus?.map((item, i) => `
    <div class="syllabus-item">
      <div class="syllabus-number">${i + 1}</div>
      <div class="syllabus-content">
        <p>${item}</p>
      </div>
    </div>
  `).join('') || '<p class="text-muted">No syllabus available.</p>';
  
  // Prerequisites
  refs.prereqList.innerHTML = c.prerequisites?.map(p => `
    <li>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span>${p}</span>
    </li>
  `).join('') || '<li class="text-muted">No prerequisites required.</li>';
  
  // Hide blocks if no content
  if (!c.syllabus?.length) {
    const block = document.getElementById('course-syllabus-block');
    if (block) block.hidden = true;
  }
  if (!c.prerequisites?.length) {
    const block = document.getElementById('course-prereq-block');
    if (block) block.hidden = true;
  }
  
  // Re-init icons
  if (window.lucide) lucide.createIcons();
}

// ─── EXTRACT LEARNING OUTCOMES ───────────────
function extractLearningOutcomes(course) {
  const outcomes = [];
  const lang = AppState.lang;
  const desc = lang === 'ar' ? course.description_ar : course.description_en;
  
  const descSentences = desc.split(/[.!?]/).filter(s => s.trim().length > 10);
  if (descSentences.length > 0) {
    outcomes.push(descSentences[0].trim());
  }
  
  course.tags.forEach(tag => {
    outcomes.push(lang === 'ar' ? `إتقان ${tag} من خلال مشاريع عملية` : `Master ${tag} through hands-on projects`);
  });
  
  course.syllabus?.forEach((item, i) => {
    if (i < 3) {
      const weekMatch = item.match(/Week\\s*\\d+[:\\s]*(.*)/i);
      if (weekMatch) {
        outcomes.push(weekMatch[1].trim());
      }
    }
  });
  
  return [...new Set(outcomes)].slice(0, 6);
}

// ─── RENDER RELATED COURSES ──────────────────
function renderRelatedCourses() {
  if (!refs.relatedGrid) return;
  
  const related = allCourses
    .filter(c => c.id !== currentCourse.id && c.category === currentCourse.category)
    .slice(0, 3);
  
  if (related.length === 0) {
    const section = document.getElementById('related-courses-section');
    if (section) section.hidden = true;
    return;
  }
  
  const lang = AppState.lang;
  
  refs.relatedGrid.innerHTML = related.map(course => {
    const title = lang === 'ar' ? course.title_ar : course.title_en;
    const desc = lang === 'ar' ? course.description_ar : course.description_en;
    const level = lang === 'ar' ? course.level_ar : course.level;
    const duration = lang === 'ar' ? course.duration_ar : course.duration;
    const imageUrl = getImageUrl(course.image);
    const isReferral = course.hasReferral !== false;
    
    return `
      <article class="card course-card">
        <div class="card-image">
          <img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.src='../assets/images/Huna-logo-(no-bg).webp';this.style.objectFit='contain';this.style.padding='20px';this.style.background='var(--bg-hover)';">
          <span class="card-badge" style="background: ${getLevelColor(course.level)};">${level}</span>
          ${isReferral ? `<span class="card-badge-upcoming" style="background: #F99A00;">${lang === 'ar' ? 'إحالات' : 'Referral'}</span>` : ''}
        </div>
        <div class="card-content">
          <h3 class="card-title">${title}</h3>
          <p class="card-desc">${desc}</p>
          <div class="card-meta">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${duration}
            </span>
          </div>
          <div class="card-actions">
            <a href="./course?slug=${course.slug}" class="btn btn-primary btn-small">${lang === 'ar' ? 'عرض الدورة' : 'View Course'}</a>
          </div>
        </div>
      </article>
    `;
  }).join('');
  
  if (window.lucide) lucide.createIcons();
}

// ─── EVENTS ──────────────────────────────────
function attachEvents() {
  // Share button (native share or fallback)
  if (refs.shareBtn) {
    refs.shareBtn.addEventListener('click', shareCourse);
  }
  
  // Social share buttons in sidebar
  refs.shareButtons?.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const platform = e.currentTarget.dataset.platform;
      shareOnPlatform(platform);
    });
  });
}

// ─── SHARE ───────────────────────────────────
function shareCourse() {
  const url = window.location.href;
  const lang = AppState.lang;
  const title = currentCourse ? (lang === 'ar' ? currentCourse.title_ar : currentCourse.title_en) : 'HUNA';
  const desc = currentCourse ? (lang === 'ar' ? currentCourse.description_ar : currentCourse.description_en) : '';
  
  if (navigator.share) {
    navigator.share({ 
      title: `${title} — HUNA`,
      text: desc,
      url 
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => {
      showToast(lang === 'ar' ? 'تم نسخ الرابط!' : 'Link copied to clipboard!');
    });
  }
}

function shareOnPlatform(platform) {
  const url = encodeURIComponent(window.location.href);
  const lang = AppState.lang;
  const title = encodeURIComponent(currentCourse ? (lang === 'ar' ? currentCourse.title_ar : currentCourse.title_en) : 'HUNA Course');
  const desc = encodeURIComponent(currentCourse ? (lang === 'ar' ? currentCourse.description_ar : currentCourse.description_en) : '');
  
  const urls = {
    twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}%0A%0A${desc}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    copy: null
  };
  
  if (platform === 'copy') {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast(lang === 'ar' ? 'تم نسخ الرابط!' : 'Link copied to clipboard!');
    });
  } else if (urls[platform]) {
    window.open(urls[platform], '_blank', 'width=600,height=400,scrollbars=yes');
  }
}

// ─── UTILS ───────────────────────────────────
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
  if (imagePath.startsWith('/')) return '..' + imagePath;
  return imagePath;
}

function updatePageTitle() {
  if (!currentCourse) return;
  const lang = AppState.lang;
  const title = lang === 'ar' ? currentCourse.title_ar : currentCourse.title_en;
  document.title = `${title} — HUNA`;
}

function showError(message) {
  const lang = AppState.lang;
  const main = document.getElementById('main-content');
  if (main) {
    main.innerHTML = `
      <section class="section" style="padding-top: 140px;">
        <div class="container">
          <div class="empty-state">
            <div class="empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h3 class="empty-state-title">${message}</h3>
            <a href="./courses" class="btn btn-primary">${lang === 'ar' ? 'العودة للدورات' : 'Back to Courses'}</a>
          </div>
        </div>
      </section>
    `;
  }
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  
  requestAnimationFrame(() => toast.classList.add('show'));
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ─── EXPORT ──────────────────────────────────
export { currentCourse };