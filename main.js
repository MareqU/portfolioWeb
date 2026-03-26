// Custom cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

function animateCursor() {
  rx += (mx - rx) * 0.15;
  ry += (my - ry) * 0.15;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, .project-card, .service-card, .stack-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '16px'; cursor.style.height = '16px';
    ring.style.width = '52px'; ring.style.height = '52px';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '10px'; cursor.style.height = '10px';
    ring.style.width = '36px'; ring.style.height = '36px';
  });
});

// Stack ticker
const items = ['Cypress', 'Playwright', 'TypeScript', 'Node.js', 'GitLab CI/CD', 'Postman', 'MongoDB', 'Linux', 'REST APIs', 'Page Object Model', 'E2E Testing', 'API Intercept', 'Test Automation'];
const ticker = document.getElementById('ticker');
const all = [...items, ...items]; // duplicate for seamless loop
ticker.innerHTML = all.map(i => `<span class="ticker-item"><span class="ticker-dot"></span>${i}</span>`).join('');

// Intersection observer for fade-in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.stack-card, .project-card, .service-card, .blog-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease, background 0.2s, border-color 0.2s';
  observer.observe(el);
});
