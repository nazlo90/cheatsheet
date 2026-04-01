const CATS = [
  { id: 'javascript',       label: 'JavaScript Core'   },
  { id: 'typescript',       label: 'TypeScript'         },
  { id: 'web-apis',         label: 'Web APIs & Browser' },
  { id: 'rxjs',             label: 'RxJS'               },
  { id: 'angular',          label: 'Angular'            },
  { id: 'state-management', label: 'State Management'   },
  { id: 'oop-architecture', label: 'OOP & Architecture' },
  { id: 'testing',          label: 'Testing'            },
  { id: 'infrastructure',   label: 'Infrastructure'     },
  { id: 'graphics',         label: 'Graphics'           },
  { id: 'nodejs',           label: 'Node.js'            },
];
const STORAGE_KEY = 'cheatsheet-cats';

function getSelected() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : CATS.map(c => c.id);
  } catch { return CATS.map(c => c.id); }
}
function setSelected(ids) { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); }

// ── SECTION INIT (numbering + nav build) ──
function initSections() {
  const sections = document.querySelectorAll('.section');
  const nav = document.getElementById('navList');
  nav.innerHTML = '';
  let n = 0;

  // Group sections by category in nav
  let lastCat = null;
  sections.forEach(sec => {
    n++;
    sec.id = `sec-${n}`;
    const cat = sec.dataset.cat;
    const titleEl = sec.querySelector('.sec-title');
    const title = titleEl ? titleEl.childNodes[0].textContent.trim() : `Section ${n}`;

    if (cat && cat !== lastCat) {
      lastCat = cat;
      const catInfo = CATS.find(c => c.id === cat);
      const catDiv = document.createElement('div');
      catDiv.className = 'nav-cat';
      catDiv.textContent = catInfo ? catInfo.label : cat;
      nav.appendChild(catDiv);
    }

    sec.querySelector('.sec-num').textContent = n;

    const a = document.createElement('a');
    a.className = 'nav-item';
    a.href = `#sec-${n}`;
    a.innerHTML = `<span class="nav-num">${n}</span>${title}`;
    a.addEventListener('click', navClick);
    nav.appendChild(a);
  });

  // Update page header count
  const countEl = document.querySelector('.page-header p');
  if (countEl) countEl.textContent = countEl.textContent.replace(/\d+ sections/, `${n} sections`);

  initScroll();
}

// ── LOAD SECTIONS ──
function loadSections() {
  const selected = getSelected();
  const main = document.querySelector('.sections-container');
  main.innerHTML = '';

  for (const cat of CATS) {
    if (!selected.includes(cat.id)) continue;
    const html = (window.__S || {})[cat.id] || '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    tmp.querySelectorAll('.section').forEach(s => s.dataset.cat = cat.id);
    while (tmp.firstChild) main.appendChild(tmp.firstChild);
  }

  initSections();
}

// ── CARD TOGGLE ──
function T(h) {
  const b = h.nextElementSibling;
  const a = h.querySelector('.arrow');
  b.classList.toggle('open');
  a.classList.toggle('open');
}
window.T = T;

// ── MOBILE DRAWER ──
function openMenu() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('menuBtn').classList.add('open');
  document.getElementById('backdrop').classList.add('visible');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('menuBtn').classList.remove('open');
  document.getElementById('backdrop').classList.remove('visible');
  document.body.style.overflow = '';
}
function toggleMenu() {
  document.getElementById('sidebar').classList.contains('open') ? closeMenu() : openMenu();
}
window.toggleMenu = toggleMenu;

document.getElementById('menuBtn').addEventListener('click', toggleMenu);
document.getElementById('backdrop').addEventListener('click', closeMenu);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); clearSearch(); } });

// ── ACTIVE NAV ──
function setActive(id) {
  document.querySelectorAll('.nav-item').forEach(a => a.classList.remove('active'));
  const a = document.querySelector(`.nav-item[href="#${id}"]`);
    if (a) { a.classList.add('active'); a.scrollIntoView({ block: 'nearest' }); }
}
function initScroll() {
  const onScroll = () => {
    const sections = document.querySelectorAll('.section');
    const threshold = window.innerHeight * 0.35;
    let active = sections[0];
    sections.forEach(s => { if (s.getBoundingClientRect().top < threshold) active = s; });
    if (active) setActive(active.id);
  };
  window.removeEventListener('scroll', window._scrollHandler);
  window._scrollHandler = onScroll;
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── NAV CLICK ──
function navClick(e) {
  e.preventDefault();
  const href = e.currentTarget.getAttribute('href');
  if (!href) return;
  const target = document.querySelector(href);
  if (!target) return;
  clearSearch();
  const isMobile = window.innerWidth <= 768;
  if (isMobile) { closeMenu(); setTimeout(() => target.scrollIntoView({ behavior: 'instant' }), 50); }
  else target.scrollIntoView({ behavior: 'instant' });
  setActive(target.id);
}

// ── SEARCH ──
let _searchTimer, _savedState = new Map();
function clearSearch() {
  const inp = document.getElementById('searchInput');
  if (!inp.value) return;
  inp.value = '';
  document.getElementById('searchClear').style.display = 'none';
  document.getElementById('searchKbd').style.display = '';
  document.getElementById('searchCount').style.display = 'none';
  document.querySelectorAll('.section.s-hide').forEach(s => s.classList.remove('s-hide'));
  document.querySelectorAll('.nav-item.s-hide,.nav-cat.s-hide').forEach(el => el.classList.remove('s-hide'));
  // restore marks
  document.querySelectorAll('mark.hl').forEach(m => {
    const t = document.createTextNode(m.textContent);
    m.replaceWith(t);
  });
  // restore open state
  document.querySelectorAll('.cb').forEach(b => {
    const key = b.closest('.section')?.id + '|' + Array.from(b.parentElement.children).indexOf(b);
    const wasOpen = _savedState.get(key);
    const arr = b.previousElementSibling?.querySelector('.arrow');
    b.classList.toggle('open', wasOpen === true);
    if (arr) arr.classList.toggle('open', wasOpen === true);
  });
  _savedState.clear();
}

document.getElementById('searchInput').addEventListener('input', e => {
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(() => runSearch(e.target.value.trim()), 140);
});
document.getElementById('searchClear').addEventListener('click', clearSearch);
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement !== document.getElementById('searchInput')) {
    e.preventDefault();
    document.getElementById('searchInput').focus();
  }
});

function runSearch(q) {
  const clearBtn = document.getElementById('searchClear');
  const kbdEl = document.getElementById('searchKbd');
  const countEl = document.getElementById('searchCount');

  if (!q) { clearSearch(); return; }
  clearBtn.style.display = '';
  kbdEl.style.display = 'none';

  // save current open state
  if (!_savedState.size) {
    document.querySelectorAll('.cb').forEach(b => {
      const key = b.closest('.section')?.id + '|' + Array.from(b.parentElement.children).indexOf(b);
      _savedState.set(key, b.classList.contains('open'));
    });
  }

  // clear previous marks
  document.querySelectorAll('mark.hl').forEach(m => {
    m.replaceWith(document.createTextNode(m.textContent));
  });

  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  let matchedSecs = 0;

  document.querySelectorAll('.section').forEach(sec => {
    const txt = sec.textContent;
    if (!rx.test(txt)) { sec.classList.add('s-hide'); return; }
    rx.lastIndex = 0;
    sec.classList.remove('s-hide');
    matchedSecs++;

    sec.querySelectorAll('.card').forEach(card => {
      const cb = card.querySelector('.cb');
      const ch = card.querySelector('.ch');
      const arr = ch?.querySelector('.arrow');
      if (!cb) return;
      if (rx.test(cb.textContent)) {
        rx.lastIndex = 0;
        cb.classList.add('open');
        if (arr) arr.classList.add('open');
        highlightNode(cb, rx);
      } else {
        rx.lastIndex = 0;
        cb.classList.remove('open');
        if (arr) arr.classList.remove('open');
      }
    });
  });

  // hide nav items for hidden sections
  document.querySelectorAll('.nav-item').forEach(a => {
    const href = a.getAttribute('href');
    const sec = href ? document.querySelector(href) : null;
    a.classList.toggle('s-hide', !sec || sec.classList.contains('s-hide'));
  });
  document.querySelectorAll('.nav-cat').forEach(c => {
    let next = c.nextElementSibling;
    let allHidden = true;
    while (next && !next.classList.contains('nav-cat')) {
      if (next.classList.contains('nav-item') && !next.classList.contains('s-hide')) allHidden = false;
      next = next.nextElementSibling;
    }
    c.classList.toggle('s-hide', allHidden);
  });

  countEl.textContent = `${matchedSecs} section${matchedSecs !== 1 ? 's' : ''} matched`;
  countEl.style.display = 'block';
}

function highlightNode(node, rx) {
  if (node.nodeType === 3) {
    const m = node.textContent.match(rx);
    if (!m) return;
    rx.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0, match;
    while ((match = rx.exec(node.textContent)) !== null) {
      frag.appendChild(document.createTextNode(node.textContent.slice(last, match.index)));
      const mark = document.createElement('mark');
      mark.className = 'hl';
      mark.textContent = match[0];
      frag.appendChild(mark);
      last = match.index + match[0].length;
    }
    frag.appendChild(document.createTextNode(node.textContent.slice(last)));
    node.replaceWith(frag);
  } else if (node.nodeType === 1 && !['SCRIPT','STYLE','MARK'].includes(node.tagName)) {
    Array.from(node.childNodes).forEach(c => highlightNode(c, rx));
  }
}

// ── CATEGORY PANEL ──
const catPanel = document.getElementById('catPanel');

document.getElementById('catBtn').addEventListener('click', () => {
  const selected = getSelected();
  catPanel.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.checked = selected.includes(cb.value);
  });
  catPanel.classList.add('open');
});

document.getElementById('catCancel').addEventListener('click', () => catPanel.classList.remove('open'));

document.getElementById('catApply').addEventListener('click', () => {
  const ids = Array.from(catPanel.querySelectorAll('input:checked')).map(cb => cb.value);
  if (!ids.length) return;
  setSelected(ids);
  catPanel.classList.remove('open');
  loadSections();
});

// ── POPULATE CATEGORY GRID ──
const grid = document.getElementById('catGrid');
CATS.forEach(c => {
  const item = document.createElement('label');
  item.className = 'cat-item';
  item.innerHTML = `<input type="checkbox" value="${c.id}"><span>${c.label}</span>`;
  grid.appendChild(item);
});

// ── INIT ──
loadSections();
