/* ============================================
   HUNA About Page Logic
   ============================================ */

import { AppState } from '../core/state.js';
import { fetchData } from '../utils/api.js';

// Load and render values
export async function loadValues() {
  const container = document.getElementById('values-grid');
  if (!container) return;
  
  const values = [
    {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>',
      title_en: 'Growth', title_ar: 'النمو',
      desc_en: 'We continuously learn and improve, pushing boundaries and expanding our capabilities.',
      desc_ar: 'نتعلم ونتحسن باستمرار، وندفع الحدود ونوسع قدراتنا.',
      color: '#6A59C4'
    },
    {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
      title_en: 'Innovation', title_ar: 'الابتكار',
      desc_en: 'We embrace creativity and new ideas, always looking for better ways to solve problems.',
      desc_ar: 'نحتضن الإبداع والأفكار الجديدة، ونبحث دائماً عن طرق أفضل لحل المشاكل.',
      color: '#00BBB0'
    },
    {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
      title_en: 'Community', title_ar: 'المجتمع',
      desc_en: 'We grow together and support one another, building meaningful connections.',
      desc_ar: 'ننمو معاً وندعم بعضنا البعض، ونبني علاقات هادفة.',
      color: '#F99A00'
    },
    {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
      title_en: 'Action', title_ar: 'العمل',
      desc_en: 'We turn ideas into reality. Execution is everything.',
      desc_ar: 'نحول الأفكار إلى واقع. التنفيذ هو كل شيء.',
      color: '#6A59C4'
    },
    {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
      title_en: 'Impact', title_ar: 'التأثير',
      desc_en: 'We focus on meaningful and measurable outcomes that make a difference.',
      desc_ar: 'نركز على النتائج المهمة والقابلة للقياس التي تحدث فرقاً.',
      color: '#00BBB0'
    },
    {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
      title_en: 'Integrity', title_ar: 'النزاهة',
      desc_en: 'We act with honesty, responsibility, transparency, and respect.',
      desc_ar: 'نتصرف بأمانة ومسؤولية وشفافية واحترام.',
      color: '#F99A00'
    }
  ];
  
  const lang = AppState.lang;
  
  container.innerHTML = values.map(v => `
    <div class="value-card" data-reveal>
      <div class="value-icon" style="background: ${v.color}15; color: ${v.color};">
        ${v.icon}
      </div>
      <h3>${lang === 'ar' ? v.title_ar : v.title_en}</h3>
      <p>${lang === 'ar' ? v.desc_ar : v.desc_en}</p>
    </div>
  `).join('');
}

// Load timeline
export async function loadTimeline() {
  const container = document.getElementById('timeline');
  if (!container) return;
  
  const steps = [
    {
      date_en: 'Step 1', date_ar: 'الخطوة 1',
      title_en: 'Learn', title_ar: 'تعلم',
      desc_en: 'Join our courses and workshops. Learn from experienced mentors and community members.',
      desc_ar: 'انضم إلى دوراتنا وورش عملنا. تعلم من المرشدين ذوي الخبرة وأعضاء المجتمع.'
    },
    {
      date_en: 'Step 2', date_ar: 'الخطوة 2',
      title_en: 'Build', title_ar: 'ابنِ',
      desc_en: 'Apply what you learned by building real projects with the community.',
      desc_ar: 'طبق ما تعلمته من خلال بناء مشاريع حقيقية مع المجتمع.'
    },
    {
      date_en: 'Step 3', date_ar: 'الخطوة 3',
      title_en: 'Execute', title_ar: 'نفذ',
      desc_en: 'Launch your projects, share your knowledge, and create real impact.',
      desc_ar: 'أطلق مشاريعك، شارك معرفتك، وخلق تأثيراً حقيقياً.'
    }
  ];
  
  const lang = AppState.lang;
  
  container.innerHTML = steps.map(s => `
    <div class="timeline-item" data-reveal>
      <div class="timeline-content">
        <span class="timeline-date">${lang === 'ar' ? s.date_ar : s.date_en}</span>
        <h3>${lang === 'ar' ? s.title_ar : s.title_en}</h3>
        <p>${lang === 'ar' ? s.desc_ar : s.desc_en}</p>
      </div>
    </div>
  `).join('');
}

// Load team
export async function loadTeam() {
  const container = document.getElementById('team-grid');
  if (!container) return;
  
  try {
    const data = await fetchData('/data/team.json');
    const lang = AppState.lang;
    
    container.innerHTML = data.members.map(member => `
      <div class="team-card" data-reveal>
        <img src="${member.avatar}" alt="${lang === 'ar' ? member.name_ar : member.name_en}" class="team-avatar" loading="lazy">
        <div class="team-info">
          <h3>${lang === 'ar' ? member.name_ar : member.name_en}</h3>
          <p class="team-role">${lang === 'ar' ? member.role_ar : member.role_en}</p>
          <p class="team-bio">${lang === 'ar' ? member.bio_ar : member.bio_en}</p>
          <div class="team-socials">
            ${member.github ? `<a href="${member.github}" target="_blank" rel="noopener" aria-label="GitHub"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg></a>` : ''}
            ${member.linkedin ? `<a href="${member.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>` : ''}
            ${member.twitter ? `<a href="${member.twitter}" target="_blank" rel="noopener" aria-label="Twitter"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg></a>` : ''}
          </div>
        </div>
      </div>
    `).join('');
    
  } catch (e) {
    console.error('Failed to load team:', e);
    container.innerHTML = '<p class="empty-state">Failed to load team members</p>';
  }
}

// Load FAQ
export async function loadFAQ() {
  const container = document.getElementById('faq-list');
  if (!container) return;
  
  try {
    const data = await fetchData('/data/faqs.json');
    const lang = AppState.lang;
    
    container.innerHTML = data.faqs.map((faq, index) => `
      <div class="accordion-item ${index === 0 ? 'open' : ''}" data-faq-id="${faq.id}">
        <button class="accordion-trigger" aria-expanded="${index === 0 ? 'true' : 'false'}">
          ${lang === 'ar' ? faq.question_ar : faq.question_en}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="accordion-content">
          <p>${lang === 'ar' ? faq.answer_ar : faq.answer_en}</p>
        </div>
      </div>
    `).join('');
    
    // Attach accordion events
    container.querySelectorAll('.accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        const isOpen = item.classList.contains('open');
        
        // Close all
        container.querySelectorAll('.accordion-item').forEach(i => {
          i.classList.remove('open');
          i.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
        });
        
        // Open clicked if it was closed
        if (!isOpen) {
          item.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
    
  } catch (e) {
    console.error('Failed to load FAQ:', e);
    container.innerHTML = '<p class="empty-state">Failed to load FAQ</p>';
  }
}

// Initialize about page
export async function initAboutPage() {
  await Promise.all([
    loadValues(),
    loadTimeline(),
    loadTeam(),
    loadFAQ()
  ]);
}
