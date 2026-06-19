/* ============================================
   HUNA Animation Utilities
   ============================================ */

import { AppState } from '../core/state.js';

// Scroll Reveal Observer
export function initScrollReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  document.querySelectorAll('[data-reveal]').forEach(el => {
    observer.observe(el);
  });
}

// Counter Animation
export function animateCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-counter'));
        const element = entry.target.querySelector('.stat-number');
        if (element) {
          animateNumber(element, target, 2000);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => observer.observe(counter));
}

function animateNumber(element, target, duration) {
  const start = 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * easeOut);
    
    element.textContent = current.toLocaleString(AppState.lang === 'ar' ? 'ar-EG' : 'en-US');
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// Magnetic Buttons
export function initMagneticButtons() {
  if (window.matchMedia('(hover: none)').matches) return;
  
  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// Cursor Effects
export function initCursorEffects() {
  if (window.matchMedia('(hover: none)').matches) return;
  
  const follower = document.querySelector('.cursor-follower');
  const dot = document.querySelector('.cursor-dot');
  
  if (!follower || !dot) return;
  
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;
  let dotX = 0, dotY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  function animate() {
    // Smooth follower
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.left = followerX - 20 + 'px';
    follower.style.top = followerY - 20 + 'px';
    
    // Fast dot
    dotX += (mouseX - dotX) * 0.5;
    dotY += (mouseY - dotY) * 0.5;
    dot.style.left = dotX - 4 + 'px';
    dot.style.top = dotY - 4 + 'px';
    
    requestAnimationFrame(animate);
  }
  
  animate();
  
  // Hover states
  document.querySelectorAll('a, button, .btn, .card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      follower.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      follower.classList.remove('hovering');
    });
  });
}

// Particle Background
export function initParticles() {
  const canvas = document.querySelector('.hero-particles canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  let isVisible = true;
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  resize();
  window.addEventListener('resize', resize);
  
  // Create particles
  const particleCount = window.innerWidth < 768 ? 30 : 60;
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      color: ['#6A59C4', '#00BBB0', '#F99A00', '#D9D9D9'][Math.floor(Math.random() * 4)]
    });
  }
  
  function draw() {
    if (!isVisible) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((p, i) => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      
      // Wrap around
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.6;
      ctx.fill();
      
      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = 0.1 * (1 - dist / 150);
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });
    
    ctx.globalAlpha = 1;
    animationId = requestAnimationFrame(draw);
  }
  
  // Visibility observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible && !animationId) {
        draw();
      } else if (!isVisible && animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    });
  });
  
  observer.observe(canvas);
  draw();
}

// Smooth Scroll with Lenis
export function initSmoothScroll() {
  if (typeof Lenis === 'undefined') return;
  
  AppState.lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });
  
  function raf(time) {
    AppState.lenis.raf(time);
    requestAnimationFrame(raf);
  }
  
  requestAnimationFrame(raf);
  
  // Connect to GSAP ScrollTrigger if available
  if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);
    
    AppState.lenis.on('scroll', ScrollTrigger.update);
    
    gsap.ticker.add((time) => {
      AppState.lenis.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0);
  }
}

// GSAP Animations
export function initGSAPAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  
  gsap.registerPlugin(ScrollTrigger);
  
  // Hero parallax
  gsap.to('.hero-logo-3d', {
    yPercent: 30,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });
  
  // Section reveals with GSAP
  gsap.utils.toArray('.section').forEach(section => {
    gsap.from(section.querySelectorAll('.section-header > *'), {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });
  });
  
  // Card stagger animations
  gsap.utils.toArray('.community-card, .course-card, .project-card').forEach((card, i) => {
    gsap.from(card, {
      y: 40,
      opacity: 0,
      duration: 0.6,
      delay: i * 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });
}

// Loading Screen
export function hideLoadingScreen() {
  const loader = document.getElementById('loading-screen');
  if (!loader) return;
  
  loader.classList.add('hidden');
  AppState.isLoading = false;
  
  setTimeout(() => {
    loader.style.display = 'none';
  }, 500);
}

// Navbar scroll effect
export function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  }, { passive: true });
}
