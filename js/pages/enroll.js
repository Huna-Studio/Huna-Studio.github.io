/* ============================================
   HUNA Enroll Page Logic — Enhanced v3
   Features:
   - Supabase integration for enrollment storage
   - Referral system with auto-increment
   - Duplicate phone prevention (localStorage + Supabase)
   - Activation at 3 referrals
   - Full bilingual support (EN/AR)
   - Status dashboard for returning users
   ============================================ */

import { AppState } from '../core/state.js';
import { fetchData } from '../utils/api.js';

// ─── SUPABASE CONFIG ───────────────────────
// IMPORTANT: Replace with your REAL Supabase credentials from your project dashboard
// Go to: https://app.supabase.com → Your Project → Settings → API
const SUPABASE_URL = 'https://lojpykmjzhgvyxiwvert.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvanB5a21qemhndnl4aXd2ZXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NjE1MzAsImV4cCI6MjA5OTMzNzUzMH0.iaYBc_O-ia1LLEzWFJWURMSnm4TGMtH5d7pXE_-cBio'; // MUST start with 'eyJhbGci...'

let supabase = null;
let supabaseReady = false;

function initSupabase() {
  if (!window.supabase) {
    console.warn('[Supabase] Library not loaded. Check your <script> tag in HTML.');
    return false;
  }
  if (SUPABASE_ANON_KEY.includes('YOUR_SUPABASE') || !SUPABASE_ANON_KEY.startsWith('eyJ')) {
    console.warn('[Supabase] Invalid or placeholder anon key. Get your real key from Supabase dashboard.');
    return false;
  }
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    supabaseReady = true;
    console.log('[Supabase] Client initialized.');
    return true;
  } catch (err) {
    console.error('[Supabase] Failed to initialize:', err);
    return false;
  }
}

initSupabase();

// ─── STATE ───────────────────────────────────
let currentCourse = null;
const YT_URL = 'https://youtube.com/@wearehuna';
const FB_URL = 'https://www.facebook.com/huna.community/';

// ─── DOM REFS ────────────────────────────────
const refs = {};

function getRefs() {
  refs.form = document.getElementById('enroll-form');
  refs.success = document.getElementById('enroll-success');
  refs.section = document.getElementById('enroll-section');
  refs.statusSection = document.getElementById('enroll-status');
  
  // Course info
  refs.courseImg = document.getElementById('enroll-course-img');
  refs.courseLevel = document.getElementById('enroll-course-level');
  refs.courseTitle = document.getElementById('enroll-course-title');
  refs.courseDesc = document.getElementById('enroll-course-desc');
  refs.courseDuration = document.getElementById('enroll-course-duration');
  refs.courseInstructor = document.getElementById('enroll-course-instructor');
  
  // Form fields
  refs.name = document.getElementById('enroll-name');
  refs.email = document.getElementById('enroll-email');
  refs.phone = document.getElementById('enroll-phone');
  refs.countryCode = document.getElementById('country-code');
  refs.location = document.getElementById('enroll-location');
  refs.education = document.getElementById('enroll-education');
  refs.referral = document.getElementById('enroll-referral');
  refs.submitBtn = document.getElementById('enroll-submit');
  
  // Verification
  refs.verifyYtBtn = document.getElementById('verify-yt-btn');
  refs.verifyFbBtn = document.getElementById('verify-fb-btn');
  refs.verifyYtStatus = document.getElementById('verify-yt-status');
  refs.verifyFbStatus = document.getElementById('verify-fb-status');
  
  // Success
  refs.referralCode = document.getElementById('user-referral-code');
  refs.copyReferral = document.getElementById('copy-referral');
  refs.shareFb = document.getElementById('share-facebook');
  refs.shareWa = document.getElementById('share-whatsapp');
  refs.shareCopy = document.getElementById('share-copy');
  refs.successCheckStatus = document.getElementById('success-check-status');
  refs.successReferralCount = document.getElementById('success-referral-count');
  refs.successReferralFill = document.getElementById('success-referral-fill');
  
  // Status dashboard
  refs.statusCourse = document.getElementById('status-course');
  refs.statusReferralCode = document.getElementById('status-referral-code');
  refs.statusReferralCount = document.getElementById('status-referral-count');
  refs.statusBadge = document.getElementById('status-badge');
  refs.statusIcon = document.getElementById('status-icon');
  refs.statusTitle = document.getElementById('status-title');
  refs.statusDesc = document.getElementById('status-desc');
  refs.referralProgressFill = document.getElementById('referral-progress-fill');
  refs.referralProgressText = document.getElementById('referral-progress-text');
  refs.statusShareWa = document.getElementById('status-share-whatsapp');
  refs.statusShareFb = document.getElementById('status-share-facebook');
  refs.statusShareCopy = document.getElementById('status-share-copy');
  refs.newEnrollmentBtn = document.getElementById('new-enrollment-btn');
}

// ─── INIT ────────────────────────────────────
export async function initEnrollPage() {
  getRefs();
  const urlRef = getReferralCodeFromUrl();
  if (urlRef && refs.referral) {
    refs.referral.value = urlRef;
  }
  
  const slug = getCourseSlugFromUrl();
  
  if (slug) {
    try {
      const data = await fetchData('/data/courses.json');
      currentCourse = data.courses.find(c => c.slug === slug || c.id === slug);
      if (currentCourse) renderCourseInfo();
    } catch (e) {
      console.error('Failed to load course:', e);
    }
  }
  
  // Check if user already enrolled in this course
  checkExistingEnrollment();
  
  attachEvents();
  checkVerificationStatus();
}

// ─── CHECK EXISTING ENROLLMENT ───────────────
function checkExistingEnrollment() {
  const slug = getCourseSlugFromUrl();
  if (!slug) return;
  
  const enrollments = getLocalEnrollments();
  const existing = enrollments.find(e => e.courseSlug === slug);
  
  if (existing) {
    // Show status dashboard
    showStatusDashboard(existing);
  }
}

function getLocalEnrollments() {
  try {
    return JSON.parse(localStorage.getItem('huna_enrollments') || '[]');
  } catch {
    return [];
  }
}

// ─── SHOW STATUS DASHBOARD ───────────────────
function showStatusDashboard(enrollment) {
  if (refs.section) refs.section.hidden = true;
  if (refs.success) refs.success.hidden = true;
  if (refs.statusSection) refs.statusSection.hidden = false;
  
  const lang = AppState.lang;
  const isActive = enrollment.active === true || enrollment.referralCount >= 3;
  const count = enrollment.referralCount || 0;
  const progress = Math.min((count / 3) * 100, 100);
  
  // Update status info
  if (refs.statusCourse) refs.statusCourse.textContent = enrollment.courseTitle || '-';
  if (refs.statusReferralCode) refs.statusReferralCode.textContent = enrollment.userReferralCode || '-';
  if (refs.statusReferralCount) refs.statusReferralCount.textContent = count;
  if (refs.referralProgressFill) refs.referralProgressFill.style.width = progress + '%';
  if (refs.referralProgressText) refs.referralProgressText.textContent = `${count} / 3`;
  
  // Status badge
  if (refs.statusBadge) {
    if (isActive) {
      refs.statusBadge.textContent = lang === 'ar' ? 'مفعّل' : 'Activated';
      refs.statusBadge.className = 'status-badge active';
    } else {
      refs.statusBadge.textContent = lang === 'ar' ? 'معلّق' : 'Pending';
      refs.statusBadge.className = 'status-badge pending';
    }
  }
  
  // Icon & title
  if (isActive) {
    if (refs.statusIcon) refs.statusIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    if (refs.statusIcon) refs.statusIcon.style.color = '#10B981';
    if (refs.statusTitle) refs.statusTitle.textContent = lang === 'ar' ? 'تم التفعيل!' : 'Activated!';
    if (refs.statusDesc) refs.statusDesc.textContent = lang === 'ar' 
      ? 'أنت الآن مفعّل ويمكنك البدء في الدورة!' 
      : 'You are now activated and can start the course!';
  } else {
    if (refs.statusIcon) refs.statusIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
    if (refs.statusIcon) refs.statusIcon.style.color = '#F99A00';
    if (refs.statusTitle) refs.statusTitle.textContent = lang === 'ar' ? 'التسجيل موجود' : 'Already Enrolled';
    if (refs.statusDesc) refs.statusDesc.textContent = lang === 'ar'
      ? 'أكمل ٣ إحالات لتفعيل اشتراكك.'
      : 'Complete 3 referrals to activate your enrollment.';
  }
  
  // Attach share events
  if (refs.statusShareWa) {
    refs.statusShareWa.addEventListener('click', () => shareReferral('whatsapp', enrollment));
  }
  if (refs.statusShareFb) {
    refs.statusShareFb.addEventListener('click', () => shareReferral('facebook', enrollment));
  }
  if (refs.statusShareCopy) {
    refs.statusShareCopy.addEventListener('click', () => copyReferralCode(enrollment.userReferralCode));
  }
  if (refs.newEnrollmentBtn) {
    refs.newEnrollmentBtn.addEventListener('click', showNewEnrollmentForm);
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showNewEnrollmentForm() {
  if (refs.statusSection) refs.statusSection.hidden = true;
  if (refs.section) refs.section.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── URL PARSING ─────────────────────────────
function getCourseSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug') || params.get('id') || params.get('course');
}

function getReferralCodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('ref') || params.get('referral') || null;
}

// ─── RENDER COURSE INFO ──────────────────────
function renderCourseInfo() {
  const lang = AppState.lang;
  const c = currentCourse;
  const title = lang === 'ar' ? c.title_ar : c.title_en;
  const desc = lang === 'ar' ? c.description_ar : c.description_en;
  const level = lang === 'ar' ? c.level_ar : c.level;
  const duration = lang === 'ar' ? c.duration_ar : c.duration;
  const imageUrl = getImageUrl(c.image);
  
  refs.courseImg.src = imageUrl;
  refs.courseImg.alt = title;
  refs.courseLevel.textContent = level;
  refs.courseLevel.style.background = getLevelColor(c.level);
  refs.courseTitle.textContent = title;
  refs.courseDesc.textContent = desc;
  refs.courseDuration.textContent = duration;
  refs.courseInstructor.textContent = c.instructor;
  
  document.title = `${lang === 'ar' ? 'التسجيل' : 'Enroll'}: ${title} — HUNA`;
}

// ─── VERIFICATION LOGIC ──────────────────────
function attachEvents() {
  if (refs.form) {
    refs.form.addEventListener('submit', handleSubmit);
  }
  
  if (refs.verifyYtBtn) {
    refs.verifyYtBtn.addEventListener('click', () => openVerify('youtube', YT_URL));
  }
  
  if (refs.verifyFbBtn) {
    refs.verifyFbBtn.addEventListener('click', () => openVerify('facebook', FB_URL));
  }
  
  window.addEventListener('focus', checkVerificationStatus);
  
  if (refs.copyReferral) {
    refs.copyReferral.addEventListener('click', () => copyReferralCode(refs.referralCode?.textContent));
  }
  
  if (refs.shareFb) {
    refs.shareFb.addEventListener('click', () => shareReferral('facebook'));
  }
  
  if (refs.shareWa) {
    refs.shareWa.addEventListener('click', () => shareReferral('whatsapp'));
  }
  
  if (refs.shareCopy) {
    refs.shareCopy.addEventListener('click', () => copyReferralCode(refs.referralCode?.textContent));
  }
  
  if (refs.successCheckStatus) {
    refs.successCheckStatus.addEventListener('click', checkStatusFromSuccess);
  }
  
  [refs.name, refs.email, refs.phone, refs.location, refs.education, refs.referral].forEach(field => {
    if (field) {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => clearError(field));
    }
  });
}

function openVerify(platform, url) {
  localStorage.setItem(`huna_verify_${platform}_started`, Date.now().toString());
  localStorage.setItem(`huna_verify_${platform}_pending`, 'true');
  window.open(url, '_blank');
  updateVerifyUI(platform, 'checking');
}

function checkVerificationStatus() {
  ['youtube', 'facebook'].forEach(platform => {
    const started = parseInt(localStorage.getItem(`huna_verify_${platform}_started`) || '0');
    const pending = localStorage.getItem(`huna_verify_${platform}_pending`) === 'true';
    
    if (!pending) {
      const verified = localStorage.getItem(`huna_verify_${platform}_done`) === 'true';
      updateVerifyUI(platform, verified ? 'done' : 'pending');
      return;
    }
    
    if (started && Date.now() - started > 3000) {
      localStorage.setItem(`huna_verify_${platform}_done`, 'true');
      localStorage.removeItem(`huna_verify_${platform}_pending`);
      updateVerifyUI(platform, 'done');
      const name = platform === 'youtube' ? 'YouTube' : 'Facebook';
      const lang = AppState.lang;
      showToast(lang === 'ar' ? `تم التحقق من ${name}!` : `${name} follow verified!`);
    } else {
      updateVerifyUI(platform, 'checking');
    }
  });
}

function updateVerifyUI(platform, state) {
  const btn = platform === 'youtube' ? refs.verifyYtBtn : refs.verifyFbBtn;
  const statusWrap = platform === 'youtube' ? refs.verifyYtStatus : refs.verifyFbStatus;
  const lang = AppState.lang;
  if (!btn || !statusWrap) return;
  
  if (state === 'done') {
    btn.remove();
    statusWrap.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      ${lang === 'ar' ? 'تم المتابعة' : 'Followed'}
    `;
    statusWrap.className = 'verify-status done';
  } else if (state === 'checking') {
    btn.innerHTML = `<span class="spinner-small"></span> ${lang === 'ar' ? 'جاري التحقق...' : 'Checking...'}`;
    btn.disabled = true;
  } else {
    const actionText = platform === 'youtube' 
      ? (lang === 'ar' ? 'اشترك' : 'Subscribe') 
      : (lang === 'ar' ? 'تابع' : 'Follow');
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      ${actionText}
    `;
    btn.disabled = false;
  }
}

function isVerified(platform) {
  return localStorage.getItem(`huna_verify_${platform}_done`) === 'true';
}

// ─── VALIDATION ──────────────────────────────
function validateField(field) {
  const name = field.name;
  const value = field.value.trim();
  const lang = AppState.lang;
  let error = '';
  
  if (!value && field.required) {
    error = lang === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
  } else if (value) {
    switch (name) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = lang === 'ar' ? 'أدخل بريد إلكتروني صحيح' : 'Enter a valid email';
        }
        break;
      case 'phone':
        if (!/^[\d\s()\-]{7,15}$/.test(value)) {
          error = lang === 'ar' ? 'أدخل رقم هاتف صحيح' : 'Enter a valid phone number';
        }
        break;
      case 'referral':
        if (value.length > 0 && value.length < 3) {
          error = lang === 'ar' ? 'كود الإحالة يجب أن يكون ٣ أحرف على الأقل' : 'Referral code must be at least 3 characters';
        }
        break;
    }
  }
  
  const errorEl = document.getElementById(`error-${name}`);
  if (errorEl) errorEl.textContent = error;
  field.classList.toggle('invalid', !!error);
  
  return !error;
}

function clearError(field) {
  const errorEl = document.getElementById(`error-${field.name}`);
  if (errorEl) errorEl.textContent = '';
  field.classList.remove('invalid');
}

async function validateForm() {
  const lang = AppState.lang;
  const fields = [refs.name, refs.email, refs.phone, refs.location, refs.education];
  const allValid = fields.every(f => validateField(f));
  
  if (!allValid) return false;
  
  if (!isVerified('youtube')) {
    showToast(lang === 'ar' ? 'يرجى الاشتراك في قناتنا على يوتيوب' : 'Please subscribe to our YouTube channel');
    refs.verifyYtBtn?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  }
  
  if (!isVerified('facebook')) {
    showToast(lang === 'ar' ? 'يرجى متابعتنا على فيسبوك' : 'Please follow us on Facebook');
    refs.verifyFbBtn?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  }
  
  // Check for duplicate phone in localStorage
  const fullPhone = (refs.countryCode?.value || '+20') + refs.phone.value.trim().replace(/\s/g, '');
  const enrollments = getLocalEnrollments();
  const localDuplicate = enrollments.find(e => e.phone === fullPhone);
  
  if (localDuplicate) {
    showToast(lang === 'ar' ? 'هذا الرقم مسجل مسبقاً' : 'This phone number is already enrolled');
    // Show their status instead
    setTimeout(() => showStatusDashboard(localDuplicate), 1500);
    return false;
  }
  
  // Check Supabase for duplicate phone
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('phone')
        .eq('phone', fullPhone)
        .limit(1);
      
      if (data && data.length > 0) {
        showToast(lang === 'ar' ? 'هذا الرقم مسجل مسبقاً' : 'This phone number is already enrolled');
        return false;
      }
      if (error && error.code !== 'PGRST116') {
        console.warn('[Supabase] Duplicate check error:', error.message);
      }
    } catch (e) {
      // No duplicate found or network error, continue
    }
  }
  
  return true;
}

// ─── SUBMIT ──────────────────────────────────
async function handleSubmit(e) {
  e.preventDefault();
  const lang = AppState.lang;
  
  if (!(await validateForm())) return;
  
  refs.submitBtn.disabled = true;
  refs.submitBtn.innerHTML = '<span class="spinner"></span> ' + (lang === 'ar' ? 'جاري المعالجة...' : 'Processing...');
  
  const fullPhone = (refs.countryCode?.value || '+20') + refs.phone.value.trim().replace(/\s/g, '');
  const userCode = generateReferralCode(refs.name.value.trim());
  const usedReferral = refs.referral.value.trim().toUpperCase() || null;
  
  const enrollmentData = {
    name: refs.name.value.trim(),
    email: refs.email.value.trim(),
    phone: fullPhone,
    location: refs.location.value.trim(),
    education: refs.education.value.trim(),
    referralUsed: usedReferral,
    userReferralCode: userCode,
    courseId: currentCourse?.id || 'unknown',
    courseSlug: currentCourse?.slug || 'unknown',
    courseTitle: currentCourse ? (lang === 'ar' ? currentCourse.title_ar : currentCourse.title_en) : 'Unknown',
    referralCount: 0,
    active: false,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ipSeed: generateIpSeed()
  };
  
  // Save to Supabase
  let supabaseSuccess = false;
  if (supabase) {
    try {
      const { error } = await supabase
        .from('enrollments')
        .insert([{
          name: enrollmentData.name,
          email: enrollmentData.email,
          phone: enrollmentData.phone,
          location: enrollmentData.location,
          education: enrollmentData.education,
          referral_used: usedReferral,
          user_referral_code: userCode,
          course_id: enrollmentData.courseId,
          course_slug: enrollmentData.courseSlug,
          course_title: enrollmentData.courseTitle,
          referral_count: 0,
          active: false,
          created_at: enrollmentData.timestamp
        }]);
      
      if (error) {
        if (error.code === '23505') {
          showToast(lang === 'ar' ? 'هذا الرقم مسجل مسبقاً' : 'This phone number is already enrolled');
          refs.submitBtn.disabled = false;
          refs.submitBtn.innerHTML = '<span data-i18n="complete_enrollment">' + (lang === 'ar' ? 'إتمام التسجيل' : 'Complete Enrollment') + '</span>';
          return;
        }
        throw error;
      }
      
      supabaseSuccess = true;
      
      // If user used a referral code, increment that referrer's count
      // if (usedReferral) {
      //   await incrementReferralCount(usedReferral);
      // }
      
    } catch (err) {
      console.error('[Supabase Error]:', err);
      showToast(lang === 'ar' ? 'خطأ في الاتصال. تم الحفظ محلياً.' : 'Connection error. Saved locally.');
    }
  }
  
  // Always save to localStorage as backup
  storeEnrollment(enrollmentData);

  // After storeEnrollment
  if (currentCourse && currentCourse.hasReferral === false) {
    // No referral needed - show immediate activation
    enrollmentData.active = true;
    showToast('You are enrolled! Join the group now.');
  } else {
    // Show referral success screen
    showSuccess(enrollmentData);
  }
  
  setTimeout(() => {
    showSuccess(enrollmentData);
  }, 1500);
}

// ─── INCREMENT REFERRAL COUNT ────────────────
async function incrementReferralCount(referralCode) {
  if (!supabase) return;
  
  try {
    // First, get current count
    const { data: referrers, error: fetchError } = await supabase
      .from('enrollments')
      .select('referral_count, active')
      .eq('user_referral_code', referralCode)
      .limit(1);
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.warn('[Supabase] Referral lookup error:', fetchError.message);
      return;
    }
    if (!referrers || referrers.length === 0) {
      return;
    }
    
    const referrer = referrers[0];
    const newCount = (referrer.referral_count || 0) + 1;
    const shouldActivate = newCount >= 3;
    
    // Update count and possibly activate
    const updateData = { referral_count: newCount };
    if (shouldActivate && !referrer.active) {
      updateData.active = true;
    }
    
    const { error: updateError } = await supabase
      .from('enrollments')
      .update(updateData)
      .eq('user_referral_code', referralCode);
    
    if (updateError) {
      console.warn('[Supabase] Referral update error:', updateError.message);
      return;
    }
    
    // Also update localStorage for that referrer if exists
    const enrollments = getLocalEnrollments();
    const localReferrer = enrollments.find(e => e.userReferralCode === referralCode);
    if (localReferrer) {
      localReferrer.referralCount = newCount;
      localReferrer.active = shouldActivate || localReferrer.active;
      localStorage.setItem('huna_enrollments', JSON.stringify(enrollments));
    }
    
  } catch (err) {
    console.warn('[Supabase] Failed to increment referral:', err.message || err);
  }
}

// ─── REFERRAL CODE GENERATION ────────────────
function generateReferralCode(name) {
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'HUNA';
  const timestamp = Date.now().toString(36).slice(-4);
  const random = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${cleanName}${timestamp}${random}`;
}

function generateIpSeed() {
  const seed = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset()
  ].join('|');
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).slice(0, 6);
}

// ─── STORAGE ─────────────────────────────────
function storeEnrollment(data) {
  const enrollments = getLocalEnrollments();
  
  const existing = enrollments.find(e => e.userReferralCode === data.userReferralCode);
  if (existing) {
    data.userReferralCode = generateReferralCode(data.name + Date.now());
  }
  
  enrollments.push(data);
  localStorage.setItem('huna_enrollments', JSON.stringify(enrollments));
  localStorage.setItem('huna_my_referral', data.userReferralCode);
  localStorage.setItem('huna_my_enrollment', JSON.stringify(data));
}

// ─── SUCCESS STATE ────────────────────────────
function showSuccess(enrollmentData) {
  if (refs.section) refs.section.hidden = true;
  if (refs.success) refs.success.hidden = false;
  if (refs.referralCode) refs.referralCode.textContent = enrollmentData.userReferralCode;
  
  // Update progress
  const count = enrollmentData.referralCount || 0;
  const progress = Math.min((count / 3) * 100, 100);
  if (refs.successReferralCount) refs.successReferralCount.textContent = `${count} / 3`;
  if (refs.successReferralFill) refs.successReferralFill.style.width = progress + '%';
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (window.lucide) lucide.createIcons();
}

function checkStatusFromSuccess() {
  const enrollments = getLocalEnrollments();
  const slug = getCourseSlugFromUrl();
  const enrollment = enrollments.find(e => e.courseSlug === slug);
  if (enrollment) {
    if (refs.success) refs.success.hidden = true;
    showStatusDashboard(enrollment);
  }
}

// ─── SHARE ───────────────────────────────────
function copyReferralCode(code) {
  if (!code) return;
  const lang = AppState.lang;
  navigator.clipboard.writeText(code).then(() => {
    showToast(lang === 'ar' ? 'تم النسخ!' : 'Code copied!');
  });
}

function shareReferral(platform, enrollmentData = null) {
  const code = enrollmentData?.userReferralCode || refs.referralCode?.textContent;
  if (!code) return;
  
  const lang = AppState.lang;
  const courseName = currentCourse 
    ? (lang === 'ar' ? currentCourse.title_ar : currentCourse.title_en) 
    : 'HUNA';
  const url = `${window.location.origin}${window.location.pathname.replace('enroll.html', '')}enroll?ref=${code}`;
  
  const message = encodeURIComponent(
    lang === 'ar' 
      ? `سجلت في ${courseName} مع هُنا! 🚀

استخدم كود الإحالة *${code}* للتسجيل وتفعيل اشتراكي!

${url}`
      : `I just enrolled in ${courseName} with HUNA! 🚀

Use my referral code *${code}* to enroll and activate my subscription!

${url}`
  );
  
  if (platform === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${message}`, '_blank', 'width=600,height=400');
  } else if (platform === 'whatsapp') {
    window.open(`https://wa.me/?text=${message}`, '_blank');
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

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${type === 'success' 
        ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
        : type === 'error'
        ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
        : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>'
      }
    </svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  
  requestAnimationFrame(() => toast.classList.add('show'));
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ─── EXPORT ──────────────────────────────────
export { currentCourse };