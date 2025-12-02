// Modern interactions for the portfolio
document.addEventListener('DOMContentLoaded', () => {
  // Initialize EmailJS with public key (client-side)
  if (window.emailjs && typeof emailjs.init === 'function') {
    try {
      emailjs.init('opaEXnmMXkxADJNfN');
    } catch (e) {
      // ignore init errors; initialization also exists in index.html
      console.warn('EmailJS init skipped:', e);
    }
  }
  // Set year
  document.getElementById('year').textContent = new Date().getFullYear();

  // THEME: prefer saved, otherwise use system
  const themeBtn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('pref-theme');
  const applyTheme = (t) => {
    document.body.setAttribute('data-theme', t);
    if (themeBtn) {
      themeBtn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
      // update icon for clarity
      themeBtn.textContent = t === 'dark' ? '🌙' : '☀️';
    }
    // subtle blob color adjust for light theme (only if elements exist)
    const blob1 = document.querySelector('.b1');
    const blob2 = document.querySelector('.b2');
    if (blob1) blob1.style.background = t === 'light' ? 'linear-gradient(135deg, rgba(6,182,212,0.12), transparent)' : '';
    if (blob2) blob2.style.background = t === 'light' ? 'linear-gradient(135deg, rgba(52,211,153,0.10), transparent)' : '';
  }

  if (saved) applyTheme(saved);
  else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('pref-theme', next);
    });
  }

  // Reveal on scroll + skill bar animation
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // animate skill bars inside the revealed section
        entry.target.querySelectorAll && entry.target.querySelectorAll('.fill').forEach(f => {
          const val = f.dataset.fill || 60;
          f.style.width = val + '%';
        });
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Parallax blobs
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    document.querySelectorAll('.bg-blob').forEach((b, i) => {
      const depth = (i + 1) * 8;
      b.style.transform = `translate(${x / depth}px, ${y / depth}px)`;
    });
  });

  // Smooth in-page navigation
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (ev) => {
      const href = a.getAttribute('href');
      if (href.length > 1 && document.querySelector(href)) {
        ev.preventDefault();
        document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
        history.replaceState(null, '', href);
        // update active state on click (for header nav links)
        document.querySelectorAll('.nav a').forEach(n => n.classList.remove('active'));
        const navLink = document.querySelector(`.nav a[href="${href}"]`);
        if (navLink) navLink.classList.add('active');
      }
    });
  });

  // Active section tracking: highlight nav links as sections enter viewport
  (function setupActiveNavOnScroll() {
    const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
    const sections = navLinks.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
    if (!sections.length) return;

    const onIntersect = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
        }
      });
    };

    const observer = new IntersectionObserver(onIntersect, { threshold: 0.55 });
    sections.forEach(s => observer.observe(s));
  })();

  // CONTACT FORM: EmailJS integration
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');


  const useEmailJS = true; // EmailJS is now enabled
  const SERVICE_ID = 'service_portfolio'; // Your EmailJS service ID
  const TEMPLATE_ID = 'template_4lsw6zd'; // Updated to template provided by user

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    
    if (!name || !email || !message) {
      status.textContent = 'Please fill all fields';
      status.style.color = 'var(--accent1)';
      return;
    }

    status.textContent = 'Sending...';
    status.style.color = 'var(--muted)';

    if (useEmailJS && window.emailjs) {
      // send via EmailJS
      emailjs.send(SERVICE_ID, TEMPLATE_ID, { 
        from_name: name, 
        from_email: email, 
        message: message,
        to_email: 'bagwanshoeb0313@gmail.com'
      })
        .then(() => {
          status.textContent = '✓ Message sent — thank you!';
          status.style.color = 'var(--accent2)';
          form.reset();
            setTimeout(() => status.textContent = '', 5000);
            showToast('Message sent — thank you!', 'success');
        })
        .catch((err) => {
          console.error('EmailJS error:', err);
            status.textContent = '✗ Failed to send via EmailJS. Opening your mail client...';
            status.style.color = 'var(--accent1)';
            showToast('Failed to send via EmailJS — opening mail client', 'error');
            setTimeout(() => openMailClient(name, email, message), 1200);
        });
    } else {
      // EmailJS not available — fallback to mail client
      status.textContent = 'Opening your mail client...';
        showToast('Opening your mail client...', 'error');
        setTimeout(() => openMailClient(name, email, message), 600);
    }
  });

  function openMailClient(name, email, message) {
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:bagwanshoeb0313@gmail.com?subject=${subject}&body=${body}`;
  }

  // Toast helper
  function showToast(text, type = 'success', timeout = 4500) {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('visible'), 20);
    setTimeout(() => {
      t.classList.remove('visible');
      setTimeout(() => t.remove(), 300);
    }, timeout);
  }

  // keyboard shortcut R for resume
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'r' || ev.key === 'R') document.getElementById('resumeBtn').click();
  });
});
