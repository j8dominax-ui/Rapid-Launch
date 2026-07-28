/* ==========================================================================
   RAPID LAUNCH — Shared Site Script
   Loaded on every page. Every feature checks the DOM before wiring up,
   since not every page contains every component (e.g. only portfolio.html
   has filter buttons, only index.html has the build console).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initStickyHeader();
  initSmoothScroll();
  initPortfolioFilter();
  initBuildConsole();
  initFooterYear();
  initScrollReveal();
  initFaqAccordion();
  initProjectForm();
});

/* --------------------------------------------------------------------------
   Mobile menu — toggles the full-screen nav overlay and locks body scroll
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  const closeMenu = () => {
    nav.classList.remove('is-open');
    toggle.classList.remove('is-active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };

  const openMenu = () => {
    nav.classList.add('is-open');
    toggle.classList.add('is-active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close the overlay whenever a nav link is chosen
  nav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape for keyboard users
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) closeMenu();
  });
}

/* --------------------------------------------------------------------------
   Sticky header — adds a background/border once the page has scrolled
   -------------------------------------------------------------------------- */
function initStickyHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const updateHeaderState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });
}

/* --------------------------------------------------------------------------
   Smooth scroll — for in-page anchor links (e.g. Pricing "Get Started"
   buttons that jump to #contact), offset by the sticky header height
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  const headerOffset = 88;

  document.querySelectorAll('a[href*="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const url = new URL(this.href, window.location.href);
      const isSamePage = url.pathname === window.location.pathname;
      const hash = url.hash;

      if (!isSamePage || !hash || hash.length < 2) return;

      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  });
}

/* --------------------------------------------------------------------------
   Portfolio filter — shows/hides gallery cards by data-category
   -------------------------------------------------------------------------- */
function initPortfolioFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.portfolio-card');
  if (!buttons.length || !cards.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      buttons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      cards.forEach((card) => {
        const matches = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !matches);
      });
    });
  });
}

/* --------------------------------------------------------------------------
   Build console — typewriter-style "deploy log" in the homepage hero.
   This is the one deliberate motion moment on the site; it respects
   prefers-reduced-motion by rendering the finished lines instantly.
   -------------------------------------------------------------------------- */
function initBuildConsole() {
  const consoleBody = document.getElementById('build-console-body');
  if (!consoleBody) return;

  const lines = [
    '$ npm run build rapid-launch',
    '\u2713 compiling components',
    '\u2713 optimizing for speed',
    '\u2713 structuring for conversion',
    '\u2713 deploy target: production',
    '\u2192 status: live'
  ];

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const addCursor = (lineEl) => {
    const cursor = document.createElement('span');
    cursor.className = 'console-cursor';
    lineEl.appendChild(cursor);
  };

  if (prefersReducedMotion) {
    lines.forEach((line, i) => {
      const div = document.createElement('div');
      div.className = 'console-line' + (i === lines.length - 1 ? ' is-final' : '');
      div.textContent = line;
      consoleBody.appendChild(div);
      if (i === lines.length - 1) addCursor(div);
    });
    return;
  }

  let lineIndex = 0;
  let charIndex = 0;
  let currentLineEl = null;

  function typeNextChar() {
    if (lineIndex >= lines.length) return;

    if (!currentLineEl) {
      currentLineEl = document.createElement('div');
      currentLineEl.className = 'console-line' + (lineIndex === lines.length - 1 ? ' is-final' : '');
      consoleBody.appendChild(currentLineEl);
    }

    const fullText = lines[lineIndex];
    charIndex++;
    currentLineEl.textContent = fullText.slice(0, charIndex);

    if (charIndex >= fullText.length) {
      if (lineIndex === lines.length - 1) {
        addCursor(currentLineEl);
        return;
      }
      currentLineEl = null;
      lineIndex++;
      charIndex = 0;
      setTimeout(typeNextChar, 260);
    } else {
      setTimeout(typeNextChar, 16);
    }
  }

  typeNextChar();
}

/* --------------------------------------------------------------------------
   Footer year — keeps the copyright line accurate without manual edits
   -------------------------------------------------------------------------- */
function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (!yearEl) return;
  yearEl.textContent = new Date().getFullYear();
}

/* --------------------------------------------------------------------------
   FAQ accordion — click a question to expand/collapse its answer.
   Only one panel is required to be open at a time is NOT enforced here;
   visitors can open as many as they like, which suits a short FAQ list.
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach((item) => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !isOpen);
      question.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

/* --------------------------------------------------------------------------
   Project inquiry form — no backend, so this builds a pre-filled mailto:
   link from the form fields and hands off to the visitor's own email app.
   Nothing is transmitted automatically, which is stated in the form note.
   -------------------------------------------------------------------------- */
function initProjectForm() {
  const form = document.getElementById('project-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#form-name').value.trim();
    const email = form.querySelector('#form-email').value.trim();
    const project = form.querySelector('#form-project').value;
    const message = form.querySelector('#form-message').value.trim();

    const subject = `New project inquiry — ${project}`;
    const body = `Name: ${name}\nEmail: ${email}\nProject type: ${project}\n\nDetails:\n${message}`;

    const mailtoUrl = `mailto:rapidlaunchinfo@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  });
}

/* --------------------------------------------------------------------------
   Scroll reveal — deliberately restrained to section headers only, so the
   motion reads as one quiet, consistent rhythm rather than scattered
   per-card animation.
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -60px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}
