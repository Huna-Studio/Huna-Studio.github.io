/* ============================================
   HUNA Volunteer Page Logic
   ============================================ */

import { AppState } from '../core/state.js';
import { submitForm } from '../utils/api.js';
import { success, error } from '../utils/toast.js';

const benefits = [
  {
    icon: '🎓',
    title_en: 'Learn & Grow', title_ar: 'تعلم وانمو',
    desc_en: 'Access exclusive workshops, mentorship, and resources to accelerate your growth.',
    desc_ar: 'احصل على ورش عمل حصرية وإرشاد وموارد لتسريع نموك.'
  },
  {
    icon: '🤝',
    title_en: 'Build Network', title_ar: 'ابنِ شبكة علاقات',
    desc_en: 'Connect with passionate people from around the world. Build lasting relationships.',
    desc_ar: 'تواصل مع أشخاص متحمسين من جميع أنحاء العالم. ابنِ علاقات دائمة.'
  },
  {
    icon: '🚀',
    title_en: 'Real Impact', title_ar: 'تأثير حقيقي',
    desc_en: 'Work on projects that matter. See your contributions make a real difference.',
    desc_ar: 'اعمل على مشاريع مهمة. شاهد مساهماتك تحدث فرقاً حقيقياً.'
  },
  {
    icon: '💼',
    title_en: 'Career Boost', title_ar: 'دفعة مهنية',
    desc_en: 'Add real projects to your portfolio. Get recommendations and visibility.',
    desc_ar: 'أضف مشاريع حقيقية إلى محفظتك. احصل على توصيات ومرئية.'
  },
  {
    icon: '🏆',
    title_en: 'Recognition', title_ar: 'تقدير',
    desc_en: 'Get recognized for your contributions. Earn badges and certificates.',
    desc_ar: 'احصل على تقدير لمساهماتك. اكسب شارات وشهادات.'
  },
  {
    icon: '🌟',
    title_en: 'Leadership', title_ar: 'قيادة',
    desc_en: 'Lead teams, organize events, and shape the future of the community.',
    desc_ar: 'قِد فرقاً، نظم فعاليات، وشكّل مستقبل المجتمع.'
  }
];

const roles = [
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
    title_en: 'Mentor / Instructor', title_ar: 'مرشد / مدرب',
    desc_en: 'Guide learners through courses, lead workshops, and share your expertise.',
    desc_ar: 'وجه المتعلمين عبر الدورات، قِد ورش العمل، وشارك خبرتك.',
    tags: ['Teaching', 'Leadership', 'Communication']
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
    title_en: 'Developer / Engineer', title_ar: 'مطور / مهندس',
    desc_en: 'Build open-source projects, contribute to our platform, and solve real problems.',
    desc_ar: 'ابنِ مشاريع مفتوحة المصدر، ساهم في منصتنا، وحل مشاكل حقيقية.',
    tags: ['Coding', 'Open Source', 'Problem Solving']
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>',
    title_en: 'Designer / UX', title_ar: 'مصمم / UX',
    desc_en: 'Create beautiful interfaces, design systems, and improve user experiences.',
    desc_ar: 'أنشئ واجهات جميلة، أنظمة تصميم، وحسّن تجارب المستخدم.',
    tags: ['Figma', 'UI/UX', 'Branding']
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    title_en: 'Content Creator', title_ar: 'منشئ محتوى',
    desc_en: 'Write articles, create tutorials, produce videos, and document our journey.',
    desc_ar: 'اكتب مقالات، أنشئ دروساً، أنتج فيديوهات، ووثق رحلتنا.',
    tags: ['Writing', 'Video', 'Documentation']
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    title_en: 'Community Manager', title_ar: 'مدير مجتمع',
    desc_en: 'Engage with members, moderate discussions, and foster a welcoming environment.',
    desc_ar: 'تفاعل مع الأعضاء، راقب المناقشات، وعزز بيئة ترحيبية.',
    tags: ['Communication', 'Moderation', 'Events']
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    title_en: 'Event Organizer', title_ar: 'منظم فعاليات',
    desc_en: 'Plan and execute hackathons, workshops, meetups, and community events.',
    desc_ar: 'خطط ونفذ هاكاثونات وورش عمل ولقاءات وفعاليات مجتمعية.',
    tags: ['Planning', 'Logistics', 'Networking']
  }
];

export function loadBenefits() {
  const container = document.getElementById('benefits-grid');
  if (!container) return;
  
  const lang = AppState.lang;
  
  container.innerHTML = benefits.map(b => `
    <div class="benefit-card" data-reveal>
      <div class="benefit-icon">${b.icon}</div>
      <h3>${lang === 'ar' ? b.title_ar : b.title_en}</h3>
      <p>${lang === 'ar' ? b.desc_ar : b.desc_en}</p>
    </div>
  `).join('');
}

export function loadRoles() {
  const container = document.getElementById('roles-grid');
  if (!container) return;
  
  const lang = AppState.lang;
  
  container.innerHTML = roles.map(r => `
    <div class="role-card" data-reveal>
      <div class="role-icon">${r.icon}</div>
      <div class="role-content">
        <h3>${lang === 'ar' ? r.title_ar : r.title_en}</h3>
        <p>${lang === 'ar' ? r.desc_ar : r.desc_en}</p>
        <div class="role-tags">
          ${r.tags.map(t => `<span>${t}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

// export function initVolunteerForm() {
//   const form = document.getElementById('volunteer-form');
//   if (!form) return;
  
//   // File upload
//   const uploadArea = document.getElementById('resume-upload');
//   const fileInput = document.getElementById('volunteer-resume');
//   const fileName = document.getElementById('file-name');
  
//   if (uploadArea && fileInput) {
//     uploadArea.addEventListener('click', () => fileInput.click());
    
//     uploadArea.addEventListener('dragover', (e) => {
//       e.preventDefault();
//       uploadArea.classList.add('dragover');
//     });
    
//     uploadArea.addEventListener('dragleave', () => {
//       uploadArea.classList.remove('dragover');
//     });
    
//     uploadArea.addEventListener('drop', (e) => {
//       e.preventDefault();
//       uploadArea.classList.remove('dragover');
//       const files = e.dataTransfer.files;
//       if (files.length) {
//         fileInput.files = files;
//         updateFileName(files[0]);
//       }
//     });
    
//     fileInput.addEventListener('change', () => {
//       if (fileInput.files.length) {
//         updateFileName(fileInput.files[0]);
//       }
//     });
//   }
  
//   function updateFileName(file) {
//     if (fileName) {
//       fileName.textContent = file.name;
//       fileName.style.color = 'var(--accent-primary)';
//     }
//   }
  
//   // Form submission
//   form.addEventListener('submit', async (e) => {
//     e.preventDefault();
    
//     const formData = {
//       name: document.getElementById('volunteer-name').value.trim(),
//       email: document.getElementById('volunteer-email').value.trim(),
//       phone: document.getElementById('volunteer-phone')?.value.trim() || '',
//       location: document.getElementById('volunteer-location')?.value.trim() || '',
//       role: document.getElementById('volunteer-role').value,
//       skills: Array.from(form.querySelectorAll('input[name="skills"]:checked')).map(cb => cb.value),
//       availability: document.getElementById('volunteer-availability')?.value || '',
//       github: document.getElementById('volunteer-github')?.value.trim() || '',
//       linkedin: document.getElementById('volunteer-linkedin')?.value.trim() || '',
//       message: document.getElementById('volunteer-message').value.trim(),
//       hasResume: fileInput?.files.length > 0,
//       submittedAt: new Date().toISOString()
//     };
    
//     // Validation
//     if (!formData.name || !formData.email || !formData.role || !formData.message) {
//       error('Please fill in all required fields.');
//       return;
//     }

//     // ADD THIS:
//     if (formData.skills.length === 0) {
//       error('Please select at least one skill.');
//       return;
//     }
    
//     if (!formData.email.includes('@')) {
//       error('Please enter a valid email address.');
//       return;
//     }
    
//     const submitBtn = form.querySelector('button[type="submit"]');
//     submitBtn.classList.add('btn-loading');
//     submitBtn.disabled = true;
    
//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 2000));
      
//       // Store in localStorage for demo
//       const submissions = JSON.parse(localStorage.getItem('huna-volunteer-submissions') || '[]');
//       submissions.push(formData);
//       localStorage.setItem('huna-volunteer-submissions', JSON.stringify(submissions));
      
//       // Show success
//       form.innerHTML = `
//         <div class="form-success-state">
//           <div class="success-icon">
//             <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
//           </div>
//           <h3 data-i18n="form_success_title">Application Submitted!</h3>
//           <p data-i18n="form_success_desc">Thank you for your interest. We'll review your application and get back to you within 48 hours.</p>
//           <button type="button" class="btn btn-primary" onclick="location.reload()" data-i18n="form_submit_another">Submit Another</button>
//         </div>
//       `;
      
//       success('Application submitted successfully!');
      
//     } catch (e) {
//       error('Something went wrong. Please try again.');
//       submitBtn.classList.remove('btn-loading');
//       submitBtn.disabled = false;
//     }
//   });
// }

export function initVolunteerForm() {
  const form = document.getElementById('volunteer-form');
  if (!form) return;
  
  // === SUPABASE CREDENTIALS ===
  const SUPABASE_URL = 'https://lojpykmjzhgvyxiwvert.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_ylBmAKXCYaWwDDfXpCLLEA_r0vxLMMA';
  
  // File upload UI selectors
  const uploadArea = document.getElementById('resume-upload');
  const fileInput = document.getElementById('volunteer-resume');
  const fileName = document.getElementById('file-name');
  
  if (uploadArea && fileInput) {
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length) {
        fileInput.files = files;
        updateFileName(files[0]);
      }
    });
    
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) {
        updateFileName(fileInput.files[0]);
      }
    });
  }
  
  function updateFileName(file) {
    if (fileName) {
      fileName.textContent = file.name;
      fileName.style.color = 'var(--accent-primary)';
    }
  }
  
  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const globalSupabase = window.supabase || window.libsupabase;
    if (!globalSupabase) {
      alert('Database connection utility failed to load. Please reload.');
      return;
    }
    
    const supabase = globalSupabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Processing...';
    
    try {
      let resumeUrl = '';

      // 1. UPLOAD THE ACTUAL FILE IF IT EXISTS
      if (fileInput?.files.length > 0) {
        const file = fileInput.files[0];
        // Create a unique filename using timestamp to avoid overwriting files
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get the public URL of the uploaded file
        const { data: urlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(filePath);
          
        resumeUrl = urlData.publicUrl;
      }

      // 2. PREPARE THE DATA OBJECT
      const formData = {
        name: document.getElementById('volunteer-name').value.trim(),
        email: document.getElementById('volunteer-email').value.trim(),
        phone: document.getElementById('volunteer-phone')?.value.trim() || '',
        location: document.getElementById('volunteer-location')?.value.trim() || '',
        role: document.getElementById('volunteer-role').value,
        skills: Array.from(form.querySelectorAll('input[name="skills"]:checked')).map(cb => cb.value),
        availability: document.getElementById('volunteer-availability')?.value || '',
        github: document.getElementById('volunteer-github')?.value.trim() || '',
        linkedin: document.getElementById('volunteer-linkedin')?.value.trim() || '',
        message: document.getElementById('volunteer-message').value.trim(),
        resume_url: resumeUrl, // Storing the direct link to the file here!
        submitted_at: new Date().toISOString()
      };
      
      // Validations
      if (!formData.name || !formData.email || !formData.role || !formData.message) {
        alert('Please fill in all required fields.');
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
        return;
      }
      
      // 3. INSERT INTO THE DATABASE TABLE
      const { error: sbError } = await supabase
        .from('volunteers')
        .insert([formData]);

      if (sbError) throw sbError;
      
      // Success State Update
      form.innerHTML = `
        <div class="form-success-state">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h3>Application Submitted!</h3>
          <p>Thank you for your interest! We have saved your application and resume directly to our database.</p>
          <button type="button" class="btn btn-primary" onclick="location.reload()">Submit Another</button>
        </div>
      `;
      
    } catch (e) {
      console.error('[Supabase Post Error]:', e);
      alert('Something went wrong sending data to server. Please try again.');
      submitBtn.classList.remove('btn-loading');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
    }
  });
}


export async function initVolunteerPage() {
  loadBenefits();
  loadRoles();
  initVolunteerForm();
}
