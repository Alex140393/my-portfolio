const toggle = document.getElementById("themeToggle");

if (toggle) {
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("lightTheme");
  });
}

const style = document.createElement("style");
style.textContent = `
  body.lightTheme {
    background: radial-gradient(circle at top, #e5f3ff 0, #f5f5f5 40%, #d4e4ff 100%);
    color: #020617;
  }
  body.lightTheme::before {
    opacity: 0.04;
  }
  body.lightTheme header {
    background: linear-gradient(to bottom, rgba(248,250,252,0.96), rgba(248,250,252,0.86), transparent);
  }
  body.lightTheme .toggleButton {
    background: rgba(248,250,252,0.96);
    border-color: rgba(148,163,184,0.85);
    color: #020617;
  }
  body.lightTheme .toggleDot {
    background: radial-gradient(circle at top, #22c55e, #e5f3ff);
    box-shadow: 0 0 14px rgba(34,197,94,0.65);
  }
  body.lightTheme section {
    background: radial-gradient(circle at top left, #ffffff, #e5e7eb);
    border-color: rgba(209,213,219,1);
    box-shadow: 0 14px 40px rgba(148,163,184,0.45);
  }
  body.lightTheme .itemCard,
  body.lightTheme .projectCard,
  body.lightTheme .heroCard,
  body.lightTheme .statCard {
    background: radial-gradient(circle at top left, #ffffff, #e5e7eb);
    border-color: rgba(209,213,219,1);
  }
  body.lightTheme .chip,
  body.lightTheme .skillPill {
    background: #f9fafb;
    border-color: rgba(209,213,219,1);
    color: #111827;
  }
  body.lightTheme .itemTag {
    border-color: rgba(209,213,219,1);
  }
  body.lightTheme .heroSubtitle,
  body.lightTheme .sectionSubtitle,
  body.lightTheme .heroMeta,
  body.lightTheme .sectionText,
  body.lightTheme .contactInfo,
  body.lightTheme .projectBody {
    color: #4b5563;
  }
  body.lightTheme .heroRole,
  body.lightTheme .itemMeta {
    color: #6b7280;
  }
  body.lightTheme .heroPill,
  body.lightTheme .heroStatItem,
  body.lightTheme input,
  body.lightTheme textarea {
    background: #f9fafb;
    border-color: rgba(209,213,219,1);
    color: #020617;
  }
  body.lightTheme footer {
    color: #6b7280;
  }
  body.lightTheme footer span {
    color: #111827;
  }
`;
document.head.appendChild(style);
