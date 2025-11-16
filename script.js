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
if (mobileToggle && mainNav) {
  mobileToggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    mobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    // move focus into the nav when opened
    if (open) {
      // focus first focusable link
      const focusable = mainNav.querySelectorAll('a, button');
      if (focusable.length) focusable[0].focus();
      // trap focus
      document.addEventListener('keydown', trapFocus);
      document.addEventListener('keydown', closeOnEscape);
    } else {
      document.removeEventListener('keydown', trapFocus);
      document.removeEventListener('keydown', closeOnEscape);
      mobileToggle.focus();
    }
  });

  function closeOnEscape(e) {
    if (e.key === 'Escape') {
      document.body.classList.remove('nav-open');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.setAttribute('aria-label', 'Open menu');
      document.removeEventListener('keydown', trapFocus);
      document.removeEventListener('keydown', closeOnEscape);
      mobileToggle.focus();
    }
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
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
  }
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
    document.body.classList.remove('nav-open');
    const mobileToggleEl = document.getElementById('mobileNavToggle');
    if (mobileToggleEl) {
      mobileToggleEl.setAttribute('aria-expanded', 'false');
      mobileToggleEl.setAttribute('aria-label', 'Open menu');
      mobileToggleEl.focus();
    }
    document.removeEventListener('keydown', trapFocus);
    document.removeEventListener('keydown', closeOnEscape);
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
    document.body.classList.remove('nav-open');
    toggleEl.setAttribute('aria-expanded', 'false');
    toggleEl.setAttribute('aria-label', 'Open menu');
    toggleEl.focus();
    document.removeEventListener('keydown', trapFocus);
    document.removeEventListener('keydown', closeOnEscape);
  }
});

