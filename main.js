document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Storage can throw (private mode, blocked site data) — never let it break the page
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};

// ───────────── Language ─────────────
// Both languages live in the HTML as [lang="en"] / [lang="cs"] siblings; CSS hides the inactive one.
const lang = () => (document.documentElement.lang === 'cs' ? 'cs' : 'en');
const t = (en, cs) => (lang() === 'cs' ? cs : en);
const langListeners = [];

const titleEl = document.querySelector('title');
if (titleEl) titleEl.dataset.en = titleEl.textContent;

function applyLang() {
  if (titleEl) titleEl.textContent = (lang() === 'cs' && titleEl.dataset.cs) || titleEl.dataset.en;
  langListeners.forEach(fn => fn());
}
function setLang(l) {
  document.documentElement.lang = l;
  store.set('lang', l);
  applyLang();
}
$('langToggle')?.addEventListener('click', () => setLang(lang() === 'cs' ? 'en' : 'cs'));
applyLang();

// ───────────── Mobile nav ─────────────
const burger = $('navBurger');
const mobileNav = $('navMobile');
if (burger && mobileNav) {
  const setOpen = open => {
    burger.classList.toggle('open', open);
    mobileNav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setOpen(!mobileNav.classList.contains('open')));
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
}

// ───────────── Stack ticker ─────────────
const tickerItems = ['Playwright', 'Cypress', 'TypeScript', 'JavaScript', 'Node.js', 'GitLab CI/CD', 'AI Agents', 'Claude Code', 'Postman', 'MongoDB', 'REST APIs', 'Page Object Model', 'E2E Testing', 'API Testing', 'Linux'];
const ticker = $('ticker');
if (ticker) {
  ticker.innerHTML = [...tickerItems, ...tickerItems].map(i => `<span class="ticker-item">${i}</span>`).join('');
}

// ───────────── Scroll progress ─────────────
const progressBar = $('progressBar');
if (progressBar) {
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// ───────────── Prague local time ─────────────
const pragueTime = $('pragueTime');
if (pragueTime) {
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Prague' });
  const tick = () => { pragueTime.textContent = fmt.format(new Date()); };
  tick();
  setInterval(tick, 30000);
}

// ───────────── Reveal on scroll ─────────────
const revealEls = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => {
    // Stagger siblings that reveal together (cards in a grid)
    const siblings = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
    if (siblings.length > 1) el.style.setProperty('--d', `${(siblings.indexOf(el) % 4) * 0.08}s`);
    io.observe(el);
  });
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

// ───────────── Spotlight cards ─────────────
if (finePointer) {
  document.querySelectorAll('.spot').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--gx', `${e.clientX - r.left}px`);
      hero.style.setProperty('--gy', `${e.clientY - r.top}px`);
    });
  }
}

// ───────────── Scramble-in for hero name ─────────────
const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*+=<>/';
function scramble(el, delay) {
  const target = el.textContent;
  let frame = 0;
  const total = 22;
  setTimeout(function step() {
    el.textContent = [...target].map((ch, i) => {
      if (frame / total > i / target.length) return ch;
      return glyphs[Math.floor(Math.random() * glyphs.length)];
    }).join('');
    if (++frame <= total) requestAnimationFrame(step);
    else el.textContent = target;
  }, delay);
}
if (!reduceMotion) {
  document.querySelectorAll('[data-scramble]').forEach((el, i) => scramble(el, 150 + i * 160));
}

// ───────────── Toast + confetti ─────────────
let toastTimer;
function toast(msg) {
  const el = $('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3400);
}

function confetti(origin) {
  if (reduceMotion) return;
  const r = origin.getBoundingClientRect();
  const colors = ['#3dffa0', '#6ea8ff', '#8b6cff', '#ffb547', '#ff5c6c'];
  for (let i = 0; i < 48; i++) {
    const c = document.createElement('span');
    c.className = 'confetti';
    c.style.left = `${r.left + r.width / 2}px`;
    c.style.top = `${r.top}px`;
    c.style.background = colors[i % colors.length];
    c.style.setProperty('--dx', `${Math.random() * -520 + 120}px`);
    c.style.setProperty('--dy', `${Math.random() * -520 - 60}px`);
    c.style.setProperty('--r', `${Math.random() * 900 - 450}deg`);
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 1500);
  }
}

// ───────────── Bug hunt ─────────────
const BUGS = {
  typo: ['Typo in the services section', 'Překlep v sekci služeb'],
  align: ['Misaligned MongoDB icon', 'Pootočená ikona MongoDB'],
  nan: ['NaN instead of a number', 'NaN místo čísla'],
  number: ['Duplicate section number', 'Duplicitní číslo sekce'],
  year: ['Outdated year in the footer', 'Starý rok v patičce'],
};

const bugHunt = (() => {
  const root = $('bughunt');
  if (!root) return null;
  const ids = Object.keys(BUGS);
  const btn = $('bughuntBtn');
  const count = $('bughuntCount');
  const list = $('bughuntList');

  let found = [];
  try { found = JSON.parse(store.get('bugsFound') || '[]').filter(id => ids.includes(id)); } catch {}

  const save = () => store.set('bugsFound', JSON.stringify(found));
  const setOpen = open => {
    root.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  };

  function render() {
    count.textContent = found.length;
    list.innerHTML = found.map(id => `<li>${esc(t(...BUGS[id]))}</li>`).join('');
    root.classList.toggle('done', found.length === ids.length);
    document.querySelectorAll('.bug').forEach(el => el.classList.toggle('fixed', found.includes(el.dataset.bug)));
  }

  function report(id) {
    if (found.includes(id)) return;
    found.push(id);
    save();
    render();
    document.querySelectorAll(`.bug[data-bug="${id}"]`).forEach(el => {
      el.classList.add('just-fixed');
      setTimeout(() => el.classList.remove('just-fixed'), 1200);
    });
    root.hidden = false;
    root.classList.remove('bump');
    void root.offsetWidth;
    root.classList.add('bump');

    if (found.length === ids.length) {
      toast(t('🎉 5/5 bugs found — QA approved. You’ve got an eye for testing!', '🎉 5/5 bugů nalezeno — schváleno QA. Na testování máš oko!'));
      confetti(btn);
    } else {
      toast(t(`🐞 Bug reported: ${BUGS[id][0]} (${found.length}/5)`, `🐞 Bug nahlášen: ${BUGS[id][1]} (${found.length}/5)`));
    }
  }

  document.querySelectorAll('.bug').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      report(el.dataset.bug);
    });
  });
  btn.addEventListener('click', e => {
    e.stopPropagation();
    setOpen(!root.classList.contains('open'));
  });
  document.addEventListener('click', e => { if (!root.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });

  setTimeout(() => { root.hidden = false; }, found.length ? 0 : 3500);
  render();
  langListeners.push(render);

  return {
    found: () => found.slice(),
    total: ids.length,
    reset() { found = []; save(); render(); },
  };
})();

// ───────────── Interactive terminal ─────────────
const terminal = $('terminal');
if (terminal) initTerminal();

function initTerminal() {
  const body = $('terminalBody');
  const log = $('terminalLog');
  const form = $('terminalForm');
  const input = $('terminalInput');
  const typed = log.querySelector('.t-typed');
  const runTemplate = [...log.children].slice(1).map(l => l.cloneNode(true));

  let fast = reduceMotion;
  let running = false;
  const history = [];
  let historyPos = 0;

  const wait = ms => (fast ? Promise.resolve() : new Promise(r => setTimeout(r, ms)));
  const scrollDown = () => { body.scrollTop = body.scrollHeight; };

  const updatePlaceholder = () => { input.placeholder = t("type 'help'", "napiš 'help'"); };
  updatePlaceholder();
  langListeners.push(updatePlaceholder);

  // Reveal lines one by one, test results a bit slower
  async function reveal(lines) {
    for (const line of lines) {
      line.classList.add('t-shown');
      scrollDown();
      await wait(line.querySelector('.t-pass, .t-fail') ? 260 + Math.random() * 220 : 90);
    }
  }

  async function intro() {
    running = true;
    const lines = [...log.children];
    terminal.classList.add('is-running');
    const command = typed.dataset.text;
    const cursor = document.createElement('span');
    cursor.className = 't-cursor';
    typed.textContent = '';
    typed.after(cursor);

    await wait(700);
    lines[0].classList.add('t-shown');
    for (let i = 1; i <= command.length; i++) {
      if (fast) { typed.textContent = command; break; }
      typed.textContent = command.slice(0, i);
      await wait(28 + Math.random() * 40);
    }
    await wait(350);
    cursor.remove();
    await reveal(lines.slice(1));
    terminal.classList.remove('is-running');
    running = false;
    terminal.classList.add('is-interactive');
    scrollDown();
  }

  async function rerun() {
    running = true;
    terminal.classList.add('is-running');
    const lines = runTemplate.map(l => l.cloneNode(true));
    log.append(...lines);
    await reveal(lines);
    terminal.classList.remove('is-running');
    running = false;
    scrollDown();
  }

  function print(html, cls = 't-out') {
    const div = document.createElement('div');
    div.className = cls;
    div.innerHTML = html;
    log.appendChild(div);
    scrollDown();
  }

  const files = {
    'about.md': () => t(
      '# Marek Urbaník\nQA & Test Automation Engineer based in Prague.\nI build test frameworks with clean architecture — layered,\nreusable, zero magic. Currently exploring security testing.',
      '# Marek Urbaník\nQA & Test Automation Engineer z Prahy.\nStavím testovací frameworky s čistou architekturou — vrstvené,\nznovupoužitelné, bez magie. Aktuálně se nořím do security testingu.'
    ),
    'stack.json': () => JSON.stringify({
      primary: ['Playwright', 'Cypress', 'TypeScript', 'GitLab CI/CD'],
      core: ['AI Agents', 'Node.js', 'Postman / REST', 'MongoDB', 'Linux / Git'],
    }, null, 2),
    'contact.txt': () => 'email:    marekurbanik@icloud.com\nlinkedin: linkedin.com/in/marek-urbaník-software-testing\ngithub:   github.com/MareqU',
  };
  const sections = ['about', 'stack', 'services', 'github', 'contact'];

  const commands = {
    help: () => print(t(
      `<span class="t-k">whoami</span>        who is Marek
<span class="t-k">status</span>        current availability
<span class="t-k">stack</span>         tools I work with
<span class="t-k">ls</span>, <span class="t-k">cat</span> &lt;file&gt; browse files
<span class="t-k">cd</span> &lt;section&gt;  jump to a section
<span class="t-k">contact</span>       get in touch
<span class="t-k">github</span>        open GitHub profile
<span class="t-k">bugs</span>          bug hunt progress
<span class="t-k">test</span>          re-run the test suite
<span class="t-k">lang</span> &lt;cs|en&gt;  switch language
<span class="t-k">clear</span>         clear the terminal`,
      `<span class="t-k">whoami</span>        kdo je Marek
<span class="t-k">status</span>        aktuální dostupnost
<span class="t-k">stack</span>         nástroje, se kterými pracuji
<span class="t-k">ls</span>, <span class="t-k">cat</span> &lt;soubor&gt; procházení souborů
<span class="t-k">cd</span> &lt;sekce&gt;     skok na sekci
<span class="t-k">contact</span>       kontakt
<span class="t-k">github</span>        otevřít GitHub profil
<span class="t-k">bugs</span>          stav bug huntu
<span class="t-k">test</span>          znovu spustit testy
<span class="t-k">lang</span> &lt;cs|en&gt;  přepnout jazyk
<span class="t-k">clear</span>         vyčistit terminál`
    )),
    whoami: () => print(t('Marek Urbaník — QA &amp; Test Automation Engineer, Prague 🇨🇿', 'Marek Urbaník — QA &amp; Test Automation Engineer, Praha 🇨🇿')),
    status: () => print(t(
      `<span class="t-w">● fully booked</span>
  Fakturoid ........ QA &amp; test automation
  Pojišťovna VZP ... automation frameworks
Not taking on new projects right now. Try <span class="t-k">contact</span> anyway.`,
      `<span class="t-w">● plně vytížen</span>
  Fakturoid ........ QA a automatizace testů
  Pojišťovna VZP ... automatizační frameworky
Nové projekty teď neberu. Ale <span class="t-k">contact</span> funguje vždycky.`
    )),
    stack: () => print(esc(files['stack.json']())),
    ls: () => print('about.md  stack.json  contact.txt'),
    cat: ([file]) => {
      if (!file) return print('cat: missing file operand');
      if (files[file]) return print(esc(files[file]()));
      print(`cat: ${esc(file)}: No such file or directory`);
    },
    cd: ([target]) => {
      const name = (target || '').replace(/^[./~]+|\/$/g, '');
      if (!name) return print(t("You're already home.", 'Už jsi doma.'));
      if (!sections.includes(name)) return print(`cd: no such section: ${esc(target)}`);
      print(t(`→ jumping to #${name}`, `→ skáču na #${name}`));
      setTimeout(() => $(name)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }), 300);
    },
    pwd: () => print('/home/marek'),
    contact: () => print(`<a href="mailto:marekurbanik@icloud.com">marekurbanik@icloud.com</a>
<a href="https://www.linkedin.com/in/marek-urban%C3%ADk-software-testing/" target="_blank" rel="noopener">linkedin.com/in/marek-urbaník ↗</a>
<a href="https://github.com/MareqU" target="_blank" rel="noopener">github.com/MareqU ↗</a>`),
    github: () => {
      print(t('Opening github.com/MareqU…', 'Otevírám github.com/MareqU…'));
      window.open('https://github.com/MareqU', '_blank', 'noopener');
    },
    bugs: ([arg]) => {
      if (!bugHunt) return print(t('No bugs here. Suspicious.', 'Tady žádné bugy nejsou. Podezřelé.'));
      if (arg === 'reset') {
        bugHunt.reset();
        return print(t('Bugs restored. Happy hunting 🐞', 'Bugy vráceny. Hodně štěstí 🐞'));
      }
      const found = bugHunt.found();
      const rows = Object.keys(BUGS).map(id => found.includes(id)
        ? `<span class="t-k">✓</span> ${esc(t(...BUGS[id]))}`
        : `<span class="t-dim">○ ???</span>`);
      print(`${t('Bug hunt', 'Bug hunt')}: ${found.length}/${bugHunt.total}\n${rows.join('\n')}${found.length < bugHunt.total ? `\n<span class="t-dim">${t('Hint: they are hiding in plain sight.', 'Nápověda: schovávají se na očích.')}</span>` : ''}`);
    },
    test: () => rerun(),
    lang: ([l]) => {
      if (l !== 'cs' && l !== 'en') return print(`${t('Current language', 'Aktuální jazyk')}: ${lang()} — ${t('use', 'použij')} <span class="t-k">lang cs</span> / <span class="t-k">lang en</span>`);
      setLang(l);
      print(t('Language switched to English.', 'Jazyk přepnut na češtinu.'));
    },
    clear: () => { log.innerHTML = ''; },
    echo: args => print(esc(args.join(' '))),
    date: () => print(new Date().toString()),
    hire: () => print(t(
      '<span class="t-fail-text">hire: Marek is fully booked</span> (Fakturoid, Pojišťovna VZP). Try <span class="t-k">contact</span> to say hi.',
      '<span class="t-fail-text">hire: Marek je plně vytížen</span> (Fakturoid, Pojišťovna VZP). Zkus <span class="t-k">contact</span> a pozdrav ho.'
    )),
    sudo: () => print(t(
      '[sudo] password for visitor: ********\nSorry, Marek is still fully booked. This incident will be reported. 😄',
      '[sudo] heslo pro návštěvníka: ********\nSorry, Marek je pořád plně vytížen. Tento incident bude nahlášen. 😄'
    )),
    rm: () => print(t('rm: nice try 🙂 this filesystem is covered by tests.', 'rm: pěkný pokus 🙂 tenhle filesystem je pokrytý testy.')),
    exit: () => print(t("There is no escape. Type <span class=\"t-k\">help</span>.", 'Odsud se neutíká. Napiš <span class="t-k">help</span>.')),
    coffee: () => print(t('☕ Brewing… done. Tests still green.', '☕ Vařím… hotovo. Testy jsou pořád zelené.')),
    vim: () => print(t("This isn't that kind of terminal. :q", 'Tohle není ten typ terminálu. :q')),
  };
  const aliases = {
    '?': 'help', cls: 'clear', nano: 'vim', emacs: 'vim', email: 'contact', mail: 'contact',
    'npm test': 'test', 'npx playwright test': 'test', 'npx playwright test marek.spec.ts': 'test',
  };

  function run(raw) {
    const line = raw.trim().replace(/\s+/g, ' ');
    print(`<span class="t-prompt">~/marek $</span>${esc(line)}`, 't-line t-cmd t-shown');
    if (!line) return;
    const [word, ...args] = line.split(' ');
    const key = aliases[line] || aliases[word] || word.toLowerCase();
    const cmd = commands[key];
    if (cmd) cmd(args);
    else print(`${t('command not found', 'příkaz nenalezen')}: ${esc(word)}. ${t('Type', 'Napiš')} <span class="t-k">help</span>.`);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (running) return;
    const value = input.value;
    input.value = '';
    if (value.trim()) history.push(value);
    historyPos = history.length;
    run(value);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      historyPos = Math.max(0, historyPos - 1);
      input.value = history[historyPos];
    } else if (e.key === 'ArrowDown' && history.length) {
      e.preventDefault();
      historyPos = Math.min(history.length, historyPos + 1);
      input.value = history[historyPos] || '';
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const parts = input.value.split(' ');
      const options = parts.length === 1 ? Object.keys(commands)
        : parts[0] === 'cat' ? Object.keys(files)
        : parts[0] === 'cd' ? sections
        : parts[0] === 'lang' ? ['cs', 'en']
        : parts[0] === 'bugs' ? ['reset'] : [];
      const last = parts[parts.length - 1];
      const matches = options.filter(o => o.startsWith(last));
      if (matches.length === 1) {
        parts[parts.length - 1] = matches[0];
        input.value = parts.join(' ') + (parts.length === 1 ? ' ' : '');
      } else if (matches.length > 1) {
        print(matches.join('  '), 't-out t-dim');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      log.innerHTML = '';
    }
  });

  // Clicking anywhere in the terminal focuses the prompt (unless selecting text)
  body.addEventListener('click', () => {
    if (terminal.classList.contains('is-interactive') && !window.getSelection().toString()) {
      input.focus({ preventScroll: true });
    }
  });

  $('tryTerminal')?.addEventListener('click', e => {
    e.preventDefault();
    fast = true; // skip the rest of the intro animation
    terminal.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    terminal.classList.remove('flash');
    void terminal.offsetWidth;
    terminal.classList.add('flash');
    const focusWhenReady = () => {
      if (terminal.classList.contains('is-interactive')) input.focus({ preventScroll: true });
      else setTimeout(focusWhenReady, 50);
    };
    setTimeout(focusWhenReady, reduceMotion ? 0 : 450);
    setTimeout(() => { fast = reduceMotion; }, 1500);
  });

  intro();
}

// ───────────── GitHub activity ─────────────
const ghRepos = $('ghRepos');
if (ghRepos) initGitHub();

function initGitHub() {
  const USER = 'MareqU';
  const pulse = $('ghPulse');
  // Friendlier descriptions than the raw GitHub ones (realworld-app is a fork, its upstream description is misleading)
  const DESCRIPTIONS = {
    'czech-test-data': ['Czech test data for automated tests: rodné číslo, IČO, DIČ, IBAN, SPZ, VIN and more — including edge cases. TypeScript, zero dependencies.', 'Česká testovací data pro automatizované testy: rodné číslo, IČO, DIČ, IBAN, SPZ, VIN a další — včetně okrajových případů. TypeScript, bez závislostí.'],
    'realworld-app': ['AI-powered Playwright test framework with an autonomous QA agent.', 'Playwright framework s autonomním AI agentem pro QA.'],
    carResearch: ['Claude Code agent for used car research across Czech car portals.', 'Agent v Claude Code pro výběr ojetého auta napříč českými portály.'],
    portfolioWeb: ['This website — hand-written HTML, CSS and JavaScript.', 'Tento web — ručně psané HTML, CSS a JavaScript.'],
    chatApp: ['Real-time chat application over WebSockets.', 'Real-time chat aplikace přes WebSockety.'],
  };
  const LANG_COLORS = { TypeScript: '#3178c6', JavaScript: '#f1e05a', HTML: '#e34c26', CSS: '#663399', Python: '#3572a5', Shell: '#89e051' };
  const repoIcon = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg>';

  let repos = null;
  let events = [];
  let failed = false;

  async function ghFetch(path) {
    const key = `gh:${path}`;
    try {
      const cached = JSON.parse(sessionStorage.getItem(key));
      if (cached && Date.now() - cached.t < 10 * 60 * 1000) return cached.d;
    } catch {}
    const res = await fetch(`https://api.github.com${path}`, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const data = await res.json();
    try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data })); } catch {}
    return data;
  }

  function ago(date) {
    const rtf = new Intl.RelativeTimeFormat(lang(), { numeric: 'auto' });
    const s = (new Date(date) - Date.now()) / 1000;
    const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    for (const [unit, sec] of units) {
      if (Math.abs(s) >= sec) return rtf.format(Math.round(s / sec), unit);
    }
    return t('just now', 'právě teď');
  }

  function describeEvent(e) {
    const repo = `<b>${esc(e.repo.name.split('/')[1])}</b>`;
    const p = e.payload || {};
    switch (e.type) {
      case 'PushEvent': return t(`pushed to ${repo}`, `pushnul do ${repo}`);
      case 'PullRequestEvent': {
        const action = p.action === 'closed' && p.pull_request?.merged ? 'merged' : p.action;
        const verbs = { merged: ['merged', 'mergnul'], opened: ['opened', 'otevřel'], closed: ['closed', 'zavřel'], reopened: ['reopened', 'znovu otevřel'] };
        const [en, cs] = verbs[action] || [action, action];
        return t(`${en} PR #${p.number} in ${repo}`, `${cs} PR #${p.number} v ${repo}`);
      }
      case 'CreateEvent':
        if (p.ref_type === 'repository') return t(`created repository ${repo}`, `vytvořil repozitář ${repo}`);
        return t(`created a ${esc(p.ref_type)} in ${repo}`, `vytvořil ${p.ref_type === 'branch' ? 'větev' : esc(p.ref_type)} v ${repo}`);
      case 'WatchEvent': return t(`starred ${repo}`, `dal hvězdičku ${repo}`);
      case 'ForkEvent': return t(`forked ${repo}`, `forknul ${repo}`);
      default: return t(`was active in ${repo}`, `byl aktivní v ${repo}`);
    }
  }

  function render() {
    if (failed) {
      pulse.textContent = t('GitHub is not responding right now.', 'GitHub teď neodpovídá.');
      ghRepos.innerHTML = `<p class="gh-error">${t('Couldn’t load repositories.', 'Repozitáře se nepodařilo načíst.')} <a href="https://github.com/${USER}" target="_blank" rel="noopener">github.com/${USER} ↗</a></p>`;
      return;
    }
    if (!repos) return;

    const latest = events[0];
    if (latest) {
      pulse.innerHTML = `${t('Last activity', 'Poslední aktivita')}: ${describeEvent(latest)} · ${ago(latest.created_at)}`;
    } else if (repos[0]) {
      pulse.innerHTML = `${t('Last push', 'Poslední push')}: <b>${esc(repos[0].name)}</b> · ${ago(repos[0].pushed_at)}`;
    }

    // Feature the latest repo when it fills the last grid row (5 repos → 2+1 / 3)
    const feature = repos.length % 3 === 2;
    ghRepos.innerHTML = repos.map((r, i) => {
      const desc = DESCRIPTIONS[r.name] ? t(...DESCRIPTIONS[r.name]) : (r.description || t('No description.', 'Bez popisu.'));
      const language = r.language ? `<span class="gh-lang"><i style="--c:${LANG_COLORS[r.language] || 'var(--muted)'}"></i>${esc(r.language)}</span>` : '';
      return `<a class="gh-repo spot${feature && i === 0 ? ' gh-repo-featured' : ''}" href="${esc(r.html_url)}" target="_blank" rel="noopener">
        <span class="gh-repo-name">${repoIcon}${esc(r.name)}</span>
        <span class="gh-repo-desc">${esc(desc.trim())}</span>
        <span class="gh-repo-meta">${language}<span>${t('updated', 'aktualizováno')} ${ago(r.pushed_at)}</span>${r.fork ? '<span class="gh-fork">fork</span>' : ''}</span>
      </a>`;
    }).join('');

    if (finePointer) {
      ghRepos.querySelectorAll('.spot').forEach(el => {
        el.addEventListener('pointermove', e => {
          const rect = el.getBoundingClientRect();
          el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
          el.style.setProperty('--my', `${e.clientY - rect.top}px`);
        });
      });
    }
  }

  async function load() {
    try {
      const [repoData, eventData] = await Promise.all([
        ghFetch(`/users/${USER}/repos?sort=pushed&per_page=12`),
        ghFetch(`/users/${USER}/events/public?per_page=10`).catch(() => []),
      ]);
      repos = repoData
        .filter(r => !r.archived)
        .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
        .slice(0, 6);
      events = eventData;
    } catch {
      failed = true;
    }
    render();
  }

  langListeners.push(render);

  // Only hit the API once the section is close to the viewport
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        io.disconnect();
        load();
      }
    }, { rootMargin: '600px 0px' });
    io.observe(ghRepos);
  } else {
    load();
  }
}
