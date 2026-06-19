# HUNA Website

> **Learn. Build. Execute.**
> 
> هُنا نتعلم، نبني، وننفذ.

A premium, bilingual (EN/AR), PWA-ready community website for HUNA.

## Quick Start

```bash
# Serve locally (any static server)
npx serve .
# or
python -m http.server 8000
# or
php -S localhost:8000
```

## Project Structure

```
huna-website/
├── index.html              # Home page
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── robots.txt              # SEO robots
├── sitemap.xml             # SEO sitemap
├── README.md               # This file
│
├── assets/                 # Static assets
│   ├── images/             # Photos, illustrations
│   ├── icons/              # Favicons, PWA icons
│   ├── lottie/             # Animation files
│   └── fonts/              # Self-hosted fonts
│
├── css/                    # Stylesheets
│   ├── base/               # Reset, variables, typography
│   ├── components/          # Reusable components
│   ├── sections/            # Section styles
│   ├── pages/               # Page-specific styles
│   ├── animations/          # Keyframes, transitions
│   ├── themes/              # Dark/light mode
│   └── main.css             # Entry point
│
├── js/                     # JavaScript
│   ├── core/               # App, router, state
│   ├── components/          # Web components
│   ├── utils/               # Helpers, animations
│   ├── pages/                 # Page logic
│   └── main.js              # Entry point
│
├── data/                   # JSON data files
│   ├── courses.json
│   ├── projects.json
│   ├── team.json
│   ├── testimonials.json
│   ├── news.json
│   ├── faqs.json
│   ├── stats.json
│   ├── navigation.json
│   ├── footer.json
│   ├── socials.json
│   └── i18n/               # Translation files
│       ├── en.json
│       └── ar.json
│
├── pages/                  # HTML pages
│   ├── about.html
│   ├── courses.html
│   ├── projects.html
│   ├── volunteer.html
│   ├── contact.html
│   └── docs/               # Documentation/Articles
│       └── index.html
│
└── components/             # HTML partials (if needed)
```

## Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, Grid, Flexbox, animations
- **Vanilla JS (ES6+)** — Modules, Web Components, Fetch API
- **GSAP + ScrollTrigger** — Premium animations
- **Lenis** — Smooth scrolling
- **Lucide Icons** — Modern SVG icons

## Features

- ✅ Fully responsive (mobile-first)
- ✅ Bilingual (English / Arabic) with toggle
- ✅ Dark / Light mode with persistence
- ✅ PWA — Installable, offline-ready
- ✅ Smooth scroll with Lenis
- ✅ GSAP scroll-triggered animations
- ✅ Magnetic buttons, cursor effects
- ✅ Dynamic JSON-driven content
- ✅ SEO optimized
- ✅ WCAG accessibility compliant

## License

© HUNA Community. All rights reserved.
