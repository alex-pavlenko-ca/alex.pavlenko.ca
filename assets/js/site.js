(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const mediaDark = window.matchMedia('(prefers-color-scheme: dark)');

  const storage = {
    get() { try { return localStorage.getItem('alex-theme'); } catch (_) { return null; } },
    set(value) { try { localStorage.setItem('alex-theme', value); } catch (_) {} }
  };

  const setTheme = (theme, remember = true) => {
    root.dataset.theme = theme;
    if (remember) storage.set(theme);
  };

  themeToggle?.addEventListener('click', () => {
    setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  mediaDark.addEventListener?.('change', event => {
    if (!storage.get()) setTheme(event.matches ? 'dark' : 'light', false);
  });

  const closeMobileMenu = () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    mobileMenu?.classList.remove('is-open');
    body.classList.remove('is-menu-open');
  };

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    mobileMenu?.classList.toggle('is-open', open);
    body.classList.toggle('is-menu-open', open);
  });
  mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));

  document.querySelectorAll('.nav-group__toggle').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      const group = button.closest('.nav-group');
      const open = !group.classList.contains('is-open');
      document.querySelectorAll('.nav-group.is-open').forEach(item => item.classList.remove('is-open'));
      group.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-group.is-open').forEach(group => {
      group.classList.remove('is-open');
      group.querySelector('.nav-group__toggle')?.setAttribute('aria-expanded', 'false');
    });
  });

  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 16);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  document.querySelector('[data-to-top]')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -4% 0px' });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  const items = [...document.querySelectorAll('[data-lightbox-item]')];
  if (items.length) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Artwork viewer');
    lightbox.innerHTML = `
      <div class="lightbox__bar">
        <span class="lightbox__counter" data-lb-counter></span>
        <button class="lightbox__close" type="button" aria-label="Close artwork viewer" data-lb-close>×</button>
      </div>
      <div class="lightbox__stage" data-lb-stage>
        <button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous artwork" data-lb-prev>‹</button>
        <img class="lightbox__image" alt="" data-lb-image>
        <button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next artwork" data-lb-next>›</button>
      </div>
      <div class="lightbox__caption" data-lb-caption></div>`;
    body.append(lightbox);

    const image = lightbox.querySelector('[data-lb-image]');
    const caption = lightbox.querySelector('[data-lb-caption]');
    const counter = lightbox.querySelector('[data-lb-counter]');
    const close = lightbox.querySelector('[data-lb-close]');
    const prev = lightbox.querySelector('[data-lb-prev]');
    const next = lightbox.querySelector('[data-lb-next]');
    let current = 0;
    let lastFocus = null;
    let startX = null;

    const preload = index => {
      const target = items[(index + items.length) % items.length];
      if (!target) return;
      const img = new Image();
      img.src = target.href;
    };

    const show = index => {
      current = (index + items.length) % items.length;
      const item = items[current];
      const source = item.href;
      const thumb = item.querySelector('img');
      image.src = source;
      image.alt = thumb?.alt || 'Alex Pavlenko artwork';
      caption.textContent = thumb?.alt || '';
      counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
      preload(current + 1);
      preload(current - 1);
    };

    const open = (index, sourceEl) => {
      lastFocus = sourceEl;
      show(index);
      lightbox.classList.add('is-open');
      body.classList.add('is-lightbox-open');
      close.focus({ preventScroll: true });
    };
    const hide = () => {
      lightbox.classList.remove('is-open');
      body.classList.remove('is-lightbox-open');
      image.removeAttribute('src');
      lastFocus?.focus({ preventScroll: true });
    };

    items.forEach((item, index) => item.addEventListener('click', event => {
      event.preventDefault();
      open(index, item);
    }));
    close.addEventListener('click', hide);
    prev.addEventListener('click', () => show(current - 1));
    next.addEventListener('click', () => show(current + 1));
    lightbox.addEventListener('click', event => { if (event.target === lightbox || event.target.dataset.lbStage !== undefined) hide(); });
    lightbox.querySelector('[data-lb-stage]').addEventListener('pointerdown', event => { startX = event.clientX; });
    lightbox.querySelector('[data-lb-stage]').addEventListener('pointerup', event => {
      if (startX === null) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 55) show(current + (delta < 0 ? 1 : -1));
      startX = null;
    });

    document.addEventListener('keydown', event => {
      if (!lightbox.classList.contains('is-open')) {
        if (event.key === 'Escape') closeMobileMenu();
        return;
      }
      if (event.key === 'Escape') hide();
      if (event.key === 'ArrowRight') show(current + 1);
      if (event.key === 'ArrowLeft') show(current - 1);
      if (event.key === 'Tab') {
        const focusables = [close, prev, next];
        const position = focusables.indexOf(document.activeElement);
        if (event.shiftKey && position <= 0) { event.preventDefault(); next.focus(); }
        if (!event.shiftKey && position === focusables.length - 1) { event.preventDefault(); close.focus(); }
      }
    });
  }
})();
