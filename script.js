const toggle = document.getElementById("themeToggle");
const mobileToggle = document.getElementById('mobileNavToggle');
const mainNav = document.getElementById('mainNav');

// Theme persistence: check localStorage, then system preference
function applyInitialTheme() {
  const saved = localStorage.getItem('site-theme');
  if (saved === 'light') {
    document.body.classList.add('lightTheme');
  } else if (saved === 'dark') {
    document.body.classList.remove('lightTheme');
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.body.classList.add('lightTheme');
  }
  // Update toggle label if exists
  if (toggle) {
    toggle.setAttribute('aria-pressed', document.body.classList.contains('lightTheme') ? 'true' : 'false');
    const themeLabel = document.getElementById('themeLabel');
    if (themeLabel) themeLabel.textContent = document.body.classList.contains('lightTheme') ? 'Light' : 'Dark';
    toggle.setAttribute('aria-label', document.body.classList.contains('lightTheme') ? 'Switch to dark theme' : 'Switch to light theme');
  }
}

applyInitialTheme();

if (toggle) {
  toggle.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("lightTheme");
    const themeLabel = document.getElementById("themeLabel");
    if (themeLabel) {
      themeLabel.textContent = isLight ? "Light" : "Dark";
    }
    toggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    toggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    // persist choice
    localStorage.setItem('site-theme', isLight ? 'light' : 'dark');
  });
}

/* Mobile nav: toggle, aria-expanded and focus trap */
// Ensure ARIA initial state
if (mainNav) {
  if (!mainNav.hasAttribute('aria-hidden')) mainNav.setAttribute('aria-hidden', 'true');
}

// focus-trap and escape handler (file-scoped so all handlers can reference)
const trapFocus = (e) => {
  if (e.key !== 'Tab') return;
  if (!mainNav) return;
  const focusable = Array.from(mainNav.querySelectorAll('a, button')).filter(el => !el.hasAttribute('disabled'));
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
};

const closeOnEscape = (e) => {
  if (e.key === 'Escape') closeNav();
};

// central close function
function closeNav() {
  document.body.classList.remove('nav-open');
  if (mobileToggle) {
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-label', 'Open menu');
    mobileToggle.focus();
  }
  if (mainNav) mainNav.setAttribute('aria-hidden', 'true');
  document.removeEventListener('keydown', trapFocus);
  document.removeEventListener('keydown', closeOnEscape);
  // if we moved the nav to body for mobile, restore it to its original place
  try {
    if (window.__navMoved && window.__navOriginalParent) {
      const parent = window.__navOriginalParent;
      const next = window.__navOriginalNextSibling;
      if (next && next.parentNode === parent) parent.insertBefore(mainNav, next);
      else parent.appendChild(mainNav);
      window.__navMoved = false;
      window.__navOriginalParent = null;
      window.__navOriginalNextSibling = null;
    }
  } catch (e) {
    // ignore restore errors
    console.warn('Could not restore nav position', e);
  }
}

// open function
function openNav() {
  document.body.classList.add('nav-open');
  if (mobileToggle) {
    mobileToggle.setAttribute('aria-expanded', 'true');
    mobileToggle.setAttribute('aria-label', 'Close menu');
  }
  if (mainNav) {
    mainNav.setAttribute('aria-hidden', 'false');
    // focus first focusable link
    const focusable = mainNav.querySelectorAll('a, button');
    if (focusable.length) focusable[0].focus();
  }
  document.addEventListener('keydown', trapFocus);
  document.addEventListener('keydown', closeOnEscape);
}

if (mobileToggle && mainNav) {
  mobileToggle.addEventListener('click', () => {
    // On small viewports, move the nav to document.body to avoid transform/stacking context issues
    const isSmall = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
    if (isSmall && mainNav && mainNav.parentElement !== document.body) {
      // save original place for restore
      window.__navOriginalParent = mainNav.parentElement;
      window.__navOriginalNextSibling = mainNav.nextElementSibling;
      window.__navMoved = true;
      document.body.appendChild(mainNav);
    }

    if (document.body.classList.contains('nav-open')) {
      closeNav();
    } else {
      openNav();
    }
  });
}

// Scroll progress bar
function updateScrollProgress() {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = (window.scrollY / scrollHeight) * 100;
  let progressBar = document.querySelector(".scrollProgressBar");
  if (!progressBar) {
    progressBar = document.createElement("div");
    progressBar.className = "scrollProgressBar";
    document.body.appendChild(progressBar);
  }
  progressBar.style.width = scrolled + "%";
}

window.addEventListener("scroll", updateScrollProgress);

// Add skip links for accessibility
const skipLink = document.createElement("a");
skipLink.href = "#main";
skipLink.className = "skipLink";
skipLink.textContent = "Skip to main content";
skipLink.style.cssText = `
  position: absolute;
  top: -40px;
  left: 0;
  background: #38bdf8;
  color: #020617;
  padding: 8px 12px;
  border-radius: 0 0 4px 0;
  z-index: 1000;
  font-weight: 600;
`;
skipLink.addEventListener("focus", () => {
  skipLink.style.top = "0";
});
skipLink.addEventListener("blur", () => {
  skipLink.style.top = "-40px";
});
document.body.prepend(skipLink);

// Add ID to main element for accessibility
const main = document.querySelector("main");
if (main) {
  main.id = "main";
}

// Animated counters
function animateCounter(element, target, duration = 2000) {
  let count = 0;
  const increment = target / (duration / 16);
  const interval = setInterval(() => {
    count += increment;
    if (count >= target) {
      element.textContent = target;
      clearInterval(interval);
    } else {
      element.textContent = Math.floor(count);
    }
  }, 16);
}

// Observe elements for animation
const observerOptions = {
  threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.animated) {
      if (entry.target.classList.contains("animateCounter")) {
        const value = parseInt(entry.target.textContent);
        if (!isNaN(value)) {
          animateCounter(entry.target, value);
          entry.target.animated = true;
        }
      }
    }
  });
}, observerOptions);

// Observe all potential counter elements
document.querySelectorAll(".statValue").forEach(el => {
  observer.observe(el);
  el.classList.add("animateCounter");
});

const style = document.createElement("style");
style.textContent = `
  /* Base page */
  body.lightTheme {
    background: radial-gradient(circle at top, #f7fbff 0, #f8f9fa 40%, #eef2ff 100%);
    color: #0b1220;
  }
  body.lightTheme::before {
    opacity: 0.02;
    color: rgba(3, 7, 18, 0.03);
  }

  /* Header and nav */
  body.lightTheme header {
    background: linear-gradient(to bottom, rgba(255,255,255,0.98), rgba(255,255,255,0.95), transparent);
    border-bottom: 1px solid rgba(220,220,225,0.8);
  }
  body.lightTheme nav a {
    color: #0f172a;
  }
  body.lightTheme nav a::after { background: linear-gradient(to right, #0284c7, #16a34a); }

  /* Buttons */
  body.lightTheme .buttonPrimary { background: linear-gradient(to right, #06b6d4, #10b981); color: #021; }
  body.lightTheme .buttonGhost { background: #ffffff; color: #021; border-color: rgba(200,200,210,0.9); }

  /* Badges and icons */
  body.lightTheme .badge { background: linear-gradient(to bottom right, #ffffff, #f3f4f6); color: #0b1220; border-color: rgba(220,220,225,1); }
  body.lightTheme .badgeDot { background: #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.25); }

  /* Cards / sections */
  body.lightTheme section,
  body.lightTheme .itemCard,
  body.lightTheme .projectCard,
  body.lightTheme .heroCard,
  body.lightTheme .statCard { background: #ffffff; border-color: rgba(230,230,235,1); color: #0b1220; box-shadow: 0 10px 24px rgba(15,23,42,0.04); }

  /* Inputs */
  body.lightTheme input, body.lightTheme textarea { background: #fff; color: #0b1220; border-color: rgba(220,220,225,1); }

  /* Chips and pills */
  body.lightTheme .chip, body.lightTheme .skillPill { background: #f8fafc; color: #0b1220; border-color: rgba(220,220,225,1); }

  /* Hero-specific */
  body.lightTheme .heroTitle span { -webkit-background-clip: text; background-clip: text; }
  body.lightTheme .heroSubtitle { color: #334155; }

  /* Badge platform icons */
  body.lightTheme .platformIcons .platformSvg path { fill: #0b1220; }

  /* Social icons */
  body.lightTheme .socialIcon { background: #ffffff; color: #0b1220; border-color: rgba(220,220,225,1); }

  /* Testimonials / certs */
  body.lightTheme .testimonialCard, body.lightTheme .certCard { background: #fff; border-color: rgba(230,230,235,1); }

  /* Footer */
  body.lightTheme footer { color: #4b5563; }
  body.lightTheme footer span { color: #0b1220; }
`;
document.head.appendChild(style);

// Gentle accessibility overrides for light theme (no forced flat colors)
const lightOverrides = document.createElement("style");
lightOverrides.textContent = `
  /* Keep focus outlines visible when light theme is active */
  body.lightTheme :focus {
    outline: 3px solid rgba(56,189,248,0.22);
    outline-offset: 2px;
  }

  /* Ensure form text is legible on browsers with aggressive defaults */
  body.lightTheme input, body.lightTheme textarea {
    color: #0b1220 !important;
    background: #ffffff !important;
  }
`;
document.head.appendChild(lightOverrides);

// Form handling
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const button = contactForm.querySelector(".formButton");
    const originalText = button.textContent;
    button.textContent = "Sending...";
    button.disabled = true;

    // update aria-live region for screen readers
    const status = document.getElementById('formStatus');
    if (status) status.textContent = 'Sending message.';
    
    const formData = new FormData(contactForm);
    
    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        button.textContent = "Message sent successfully!";
        contactForm.reset();
        if (status) status.textContent = 'Message sent successfully.';
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
          if (status) status.textContent = '';
        }, 3000);
        // show visible success alert
        showAlert('Message sent successfully. Thank you!', 'positive');
      } else {
        throw new Error("Form submission failed");
      }
    } catch (error) {
      button.textContent = "Error sending message. Try again.";
      if (status) status.textContent = 'Error sending message.';
      button.disabled = false;
      setTimeout(() => {
        button.textContent = originalText;
        if (status) status.textContent = '';
      }, 3000);
      // show visible error alert
      showAlert('Error sending message. Please try again later.', 'negative');
    }
  });
}

// Visible alert helper
function showAlert(message, type = 'positive', duration = 7000) {
  const alertEl = document.getElementById('formAlert');
  const content = alertEl ? alertEl.querySelector('.formAlertContent') : null;
  if (!alertEl || !content) return;
  alertEl.classList.remove('visually-hidden', 'hidden');
  alertEl.classList.remove('positive', 'negative');
  alertEl.classList.add(type === 'positive' ? 'positive' : 'negative');
  content.textContent = message;
  // make visible
  alertEl.style.display = 'flex';
  // focus for accessibility
  alertEl.setAttribute('tabindex', '-1');
  alertEl.focus();
  // auto-dismiss
  if (alertEl.dismissTimeout) clearTimeout(alertEl.dismissTimeout);
  alertEl.dismissTimeout = setTimeout(() => {
    dismissAlert();
  }, duration);
}

function dismissAlert() {
  const alertEl = document.getElementById('formAlert');
  if (!alertEl) return;
  alertEl.classList.add('visually-hidden');
  alertEl.style.display = 'none';
  if (alertEl.dismissTimeout) { clearTimeout(alertEl.dismissTimeout); alertEl.dismissTimeout = null; }
}

// wire alert close button
const alertClose = document.getElementById('formAlertClose');
if (alertClose) {
  alertClose.addEventListener('click', () => {
    dismissAlert();
  });
}

// mobile nav close behavior
const mobileClose = document.getElementById('mobileNavClose');
if (mobileClose) {
  mobileClose.addEventListener('click', () => {
    closeNav();
  });
}

// backdrop is now hidden; Escape and outside-click handlers close the nav instead

document.addEventListener('click', (e) => {
  const nav = document.getElementById('mainNav');
  const toggleEl = document.getElementById('mobileNavToggle');
  if (!nav || !toggleEl) return;
  if (!document.body.classList.contains('nav-open')) return;
  // if click target is outside nav and not the toggle, close
  if (!nav.contains(e.target) && !toggleEl.contains(e.target)) {
    closeNav();
  }
});

// Close nav when clicking the backdrop (if present)
const navBackdrop = document.getElementById('navBackdrop');
if (navBackdrop) {
  navBackdrop.addEventListener('click', () => {
    if (document.body.classList.contains('nav-open')) closeNav();
  });
}

/* Nav self-test: programmatically open/close the nav and log ARIA checks */
function runNavSelfTest() {
  try {
    const result = { before: {}, afterOpen: {}, afterClose: {} };
    result.before.hasNavOpen = document.body.classList.contains('nav-open');

    openNav();
    result.afterOpen.hasNavOpen = document.body.classList.contains('nav-open');
    result.afterOpen.ariaExpanded = mobileToggle ? mobileToggle.getAttribute('aria-expanded') : null;
    result.afterOpen.ariaHidden = mainNav ? mainNav.getAttribute('aria-hidden') : null;

    closeNav();
    result.afterClose.hasNavOpen = document.body.classList.contains('nav-open');
    result.afterClose.ariaExpanded = mobileToggle ? mobileToggle.getAttribute('aria-expanded') : null;
    result.afterClose.ariaHidden = mainNav ? mainNav.getAttribute('aria-hidden') : null;

    const pass = result.afterOpen.hasNavOpen === true && result.afterOpen.ariaExpanded === 'true' && result.afterOpen.ariaHidden === 'false' && result.afterClose.hasNavOpen === false && result.afterClose.ariaExpanded === 'false' && result.afterClose.ariaHidden === 'true';

    console.group('Navigation Self Test');
    console.log('Result object:', result);
    console.log('PASS:', pass);
    console.groupEnd();

    return pass;
  } catch (err) {
    console.warn('Nav self-test error', err);
    return false;
  }
}

// run quick test once on load and expose function to `window` for rerun
try {
  // delay slightly so DOM styles and media queries settle
  setTimeout(() => {
    const testPassed = runNavSelfTest();
    window.__runNavSelfTest = runNavSelfTest;
    if (!testPassed) console.warn('Nav self-test did not pass; try opening the page in a mobile-width viewport and re-run `__runNavSelfTest()` from the console.');
  }, 120);
} catch (e) {
  console.warn('Could not run nav self-test', e);
}

/* Case study modal behavior */
(function() {
  const caseModal = document.getElementById('caseStudyModal');
  const viewBtns = document.querySelectorAll('.viewCaseBtn');
  const closeBtn = caseModal ? caseModal.querySelector('.modalClose') : null;

  function openModal() {
    if (!caseModal) return;
    caseModal.removeAttribute('hidden');
    const content = caseModal.querySelector('.caseStudyContent');
    if (content) content.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!caseModal) return;
    caseModal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      openModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeModal();
    });
  }

  // click outside to close
  document.addEventListener('click', (e) => {
    if (!caseModal || caseModal.hasAttribute('hidden')) return;
    const content = caseModal.querySelector('.caseStudyContent');
    if (content && !content.contains(e.target) && !e.target.classList.contains('viewCaseBtn')) {
      closeModal();
    }
  });

  // escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && caseModal && !caseModal.hasAttribute('hidden')) {
      closeModal();
    }
  });
})();
