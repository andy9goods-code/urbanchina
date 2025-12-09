let currentLang = 'ru';
let translations = {};

async function loadTranslations(lang) {
  try {
    const res = await fetch(`locales/${lang}.json?_=${Date.now()}`);
    if (!res.ok) throw new Error(`${lang}.json not found`);
    translations[lang] = await res.json();
    currentLang = lang;
    applyTranslations();
    localStorage.setItem('selectedLang', lang);
  } catch (e) {
    console.error('_translation error:', e);
    // fallback to ru
    if (lang !== 'ru') {
      loadTranslations('ru');
    }
  }
}

function applyTranslations() {
  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.getAttribute('data-key');
    const value = translations[currentLang]?.[key];
    if (value === undefined) return;

    if (el.classList.contains('conditions-text')) {
      el.innerHTML = value;
    } else if (el.classList.contains('faq__question')) {
      const toggle = el.querySelector('.faq__toggle');
      el.innerHTML = value + (toggle ? toggle.outerHTML : '');
    } else {
      el.textContent = value;
    }
  });

  if (translations[currentLang]?.title) {
    document.title = translations[currentLang].title;
  }

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang !== currentLang) {
        if (translations[lang]) {
          currentLang = lang;
          applyTranslations();
        } else {
          loadTranslations(lang);
        }
      }
    });
  });

  // Load saved or default language
  const savedLang = localStorage.getItem('selectedLang') || 'ru';
  if (translations[savedLang]) {
    currentLang = savedLang;
    applyTranslations();
  } else {
    loadTranslations(savedLang);
  }

  // FAQ
  document.querySelectorAll('.faq__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const ans = btn.nextElementSibling;
      document.querySelectorAll('.faq__answer.show').forEach(a => {
        if (a !== ans) a.classList.remove('show');
      });
      ans.classList.toggle('show', !ans.classList.contains('show'));
    });
  });

  // Conditions animation
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.conditions-text, .conditions-image').forEach((el, i) => {
          el.style.animationDelay = `${i * 0.1}s`;
          el.style.opacity = '1';
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section-with-bg').forEach(section => {
    if (section.querySelector('.conditions-section')) {
      observer.observe(section);
    }
  });

  // Image fallbacks
  document.querySelectorAll('img').forEach(img => {
    if (!img.hasAttribute('onerror')) {
      img.setAttribute('onerror', "this.style.opacity='0'; this.parentElement.style.backgroundColor='rgba(106, 91, 255, 0.1)'");
    }
  });
});