// ── I18N ──
const I18N = {
  en: {
    cats: {
      javascript:        'JavaScript Core',
      typescript:        'TypeScript',
      browser:           'How Browsers Work',
      'web-apis':        'Web APIs & Browser',
      rxjs:              'RxJS',
      angular:           'Angular',
      'state-management':'State Management',
      'oop-architecture':'OOP & Architecture',
      testing:           'Testing',
      infrastructure:    'Infrastructure',
      graphics:          'Graphics',
      nodejs:            'Node.js',
      nestjs:            'NestJS',
      graphql:           'GraphQL',
      electron:          'Electron',
      webrtc:            'WebRTC & VoIP',
      csharp:            'C#',
      sql:               'SQL / Databases',
    },
    searchPlaceholder:   'Search topics…',
    sectionsMatched:     n => `${n} section${n !== 1 ? 's' : ''} matched`,
    noMatches:           'No matches found',
    filterTitle:         'Filter Categories',
    filterDesc:          'Select which topics to show. Your choice is saved in localStorage.',
    apply:               'Apply',
    cancel:              'Cancel',
    pageTitle:           'Senior Frontend Developer — Interview Cheatsheet',
    pageSubtitle:        n => `Angular 18+ · TypeScript · RxJS · NgRx · Testing · Architecture · CI/CD · Docker · ${n} sections`,
  },
  uk: {
    cats: {
      javascript:        'Ядро JavaScript',
      typescript:        'TypeScript',
      browser:           'Як працює браузер',
      'web-apis':        'Web APIs та браузер',
      rxjs:              'RxJS',
      angular:           'Angular',
      'state-management':'Управління станом',
      'oop-architecture':'ООП та архітектура',
      testing:           'Тестування',
      infrastructure:    'Інфраструктура',
      graphics:          'Графіка',
      nodejs:            'Node.js',
      nestjs:            'NestJS',
      graphql:           'GraphQL',
      electron:          'Electron',
      webrtc:            'WebRTC та VoIP',
      csharp:            'C#',
      sql:               'SQL / Бази даних',
    },
    searchPlaceholder:   'Пошук тем…',
    sectionsMatched:     n => `${n} ${n === 1 ? 'розділ' : n < 5 ? 'розділи' : 'розділів'} знайдено`,
    noMatches:           'Нічого не знайдено',
    filterTitle:         'Фільтр категорій',
    filterDesc:          'Оберіть теми для відображення. Вибір зберігається в localStorage.',
    apply:               'Застосувати',
    cancel:              'Скасувати',
    pageTitle:           'Senior Frontend Developer — Шпаргалка для співбесіди',
    pageSubtitle:        n => `Angular 18+ · TypeScript · RxJS · NgRx · Тестування · Архітектура · CI/CD · Docker · ${n} розділів`,
  },
};

const LANG_KEY = 'cheatsheet-lang';
function getLang() {
  return localStorage.getItem(LANG_KEY) === 'uk' ? 'uk' : 'en';
}
function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang;
}

function t() { return I18N[getLang()]; }

// ── CATEGORIES ──
const CATS = [
  { id: 'javascript'        },
  { id: 'typescript'        },
  { id: 'browser'           },
  { id: 'web-apis'          },
  { id: 'rxjs'              },
  { id: 'angular'           },
  { id: 'state-management'  },
  { id: 'oop-architecture'  },
  { id: 'testing'           },
  { id: 'infrastructure'    },
  { id: 'graphics'          },
  { id: 'nodejs'            },
  { id: 'nestjs'            },
  { id: 'graphql'           },
  { id: 'electron'          },
  { id: 'webrtc'            },
  { id: 'csharp'            },
  { id: 'sql'               },
];

function catLabel(id) { return t().cats[id] || id; }

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

  let lastCat = null;
  sections.forEach(sec => {
    n++;
    sec.id = `sec-${n}`;
    const cat = sec.dataset.cat;
    const titleEl = sec.querySelector('.sec-title');
    const title = titleEl ? titleEl.childNodes[0].textContent.trim() : `Section ${n}`;

    if (cat && cat !== lastCat) {
      lastCat = cat;
      const catDiv = document.createElement('div');
      catDiv.className = 'nav-cat';
      catDiv.textContent = catLabel(cat);
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

  const countEl = document.querySelector('.page-header p');
  if (countEl) countEl.textContent = t().pageSubtitle(n);

  initScroll();
}

// ── LOAD SECTIONS ──
function loadSections() {
  const lang = getLang();
  const src = lang === 'uk' ? (window.__S_uk || window.__S_en) : (window.__S_en || window.__S);
  const selected = getSelected();
  const main = document.querySelector('.sections-container');
  main.innerHTML = '';

  for (const cat of CATS) {
    if (!selected.includes(cat.id)) continue;
    const html = src[cat.id] || '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    tmp.querySelectorAll('.section').forEach(s => s.dataset.cat = cat.id);
    while (tmp.firstChild) main.appendChild(tmp.firstChild);
  }

  initSections();
}

// ── APPLY UI STRINGS ──
function applyUiStrings() {
  const tr = t();
  document.getElementById('searchInput').placeholder = tr.searchPlaceholder;
  document.querySelector('.page-header h1').textContent = tr.pageTitle;
  document.querySelector('#catPanel h2').textContent = tr.filterTitle;
  document.querySelector('#catPanel > p').textContent = tr.filterDesc;
  document.getElementById('catApply').textContent = tr.apply;
  document.getElementById('catCancel').textContent = tr.cancel;
  document.documentElement.lang = getLang();

  // Rebuild category grid labels
  document.querySelectorAll('.cat-item span').forEach(span => {
    const input = span.previousElementSibling;
    if (input) span.textContent = catLabel(input.value);
  });
}

// ── LANGUAGE TOGGLE ──
function switchLang(lang) {
  setLang(lang);
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  applyUiStrings();
  clearSearch();
  loadSections();
}
window.switchLang = switchLang;

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

function escapeHtml(str) {
  return str.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function extractSnippet(text, rx, preLen = 35, postLen = 100) {
  const clean = text.replaceAll(/\s+/g, ' ').trim();
  rx.lastIndex = 0;
  const m = rx.exec(clean);
  if (!m) { rx.lastIndex = 0; return ''; }
  rx.lastIndex = 0;
  const start = Math.max(0, m.index - preLen);
  const end = Math.min(clean.length, m.index + m[0].length + postLen);
  const pre = (start > 0 ? '…' : '') + clean.slice(start, m.index);
  const mid = clean.slice(m.index, m.index + m[0].length);
  const post = clean.slice(m.index + m[0].length, end) + (end < clean.length ? '…' : '');
  return `${escapeHtml(pre)}<mark class="hl">${escapeHtml(mid)}</mark>${escapeHtml(post)}`;
}

function highlightTitle(text, rx) {
  rx.lastIndex = 0;
  const parts = [];
  let last = 0, m;
  while ((m = rx.exec(text)) !== null) {
    parts.push(escapeHtml(text.slice(last, m.index)), `<mark class="hl">${escapeHtml(m[0])}</mark>`);
    last = m.index + m[0].length;
  }
  parts.push(escapeHtml(text.slice(last)));
  rx.lastIndex = 0;
  return parts.join('');
}

function navigateToResult(secId, cardIdx) {
  const sec = document.getElementById(secId);
  if (!sec) return;
  if (globalThis.innerWidth <= 768) closeMenu();
  if (cardIdx < 0) {
    sec.scrollIntoView({ behavior: 'instant', block: 'start' });
    setActive(secId);
    return;
  }
  const card = sec.querySelectorAll('.card')[cardIdx];
  if (!card) return;
  const cb = card.querySelector('.cb');
  const arr = card.querySelector('.arrow');
  if (cb) cb.classList.add('open');
  if (arr) arr.classList.add('open');
  card.scrollIntoView({ behavior: 'instant', block: 'start' });
  setActive(secId);
}

function renderSearchResults(rx) {
  const resultsEl = document.getElementById('searchResults');
  const navEl = document.getElementById('navList');

  const catMap = new Map();
  document.querySelectorAll('.section:not(.s-hide)').forEach(sec => {
    const catId = sec.dataset.cat || '';
    const catLbl = catLabel(catId);
    const secTitleEl = sec.querySelector('.sec-title');
    const _titleClone = secTitleEl?.cloneNode(true);
    _titleClone?.querySelectorAll('.badge').forEach(b => b.remove());
    const secTitle = _titleClone?.textContent.trim() || '';
    const secNum = sec.querySelector('.sec-num')?.textContent.trim() || '';
    const cards = [];

    rx.lastIndex = 0;
    if (secTitleEl && rx.test(secTitleEl.textContent)) {
      rx.lastIndex = 0;
      cards.push({ cardIdx: -1, cardTitle: secTitle, snippet: extractSnippet(secTitleEl.textContent, rx) });
    }

    sec.querySelectorAll('.card').forEach((card, cardIdx) => {
      const cb = card.querySelector('.cb');
      const ch = card.querySelector('.ch');
      if (!cb) return;
      rx.lastIndex = 0;
      const bodyMatch = rx.test(cb.textContent);
      rx.lastIndex = 0;
      const headMatch = ch ? rx.test(ch.textContent) : false;
      rx.lastIndex = 0;
      if (bodyMatch || headMatch) {
        const cardTitle = card.querySelector('.ch h3')?.textContent.trim() || '';
        const snippet = bodyMatch
          ? extractSnippet(cb.textContent, rx)
          : extractSnippet(ch?.textContent || '', rx);
        cards.push({ cardIdx, cardTitle, snippet });
      }
    });

    if (!cards.length) return;
    if (!catMap.has(catId)) catMap.set(catId, { label: catLbl, sections: [] });
    catMap.get(catId).sections.push({ secId: sec.id, secNum, secTitle, cards });
  });

  const cats = [...catMap.values()];

  if (cats.length) {
    resultsEl.innerHTML = cats.map(cat =>
      `<div class="sr-cat">` +
        `<div class="sr-cat-hdr">${escapeHtml(cat.label)}</div>` +
        cat.sections.map(s =>
          `<div class="sr-section">` +
            `<div class="sr-section-hdr"><span class="sr-sec-num">${escapeHtml(s.secNum)}</span><span class="sr-sec-title">${highlightTitle(s.secTitle, rx)}</span></div>` +
            s.cards.map(c =>
              `<div class="sr-item${c.cardIdx < 0 ? ' sr-item--sec' : ''}" data-sec="${s.secId}" data-card="${c.cardIdx}">` +
                `<div class="sr-title">${c.cardIdx < 0 ? '§ ' : ''}${highlightTitle(c.cardTitle, rx)}</div>` +
                `<div class="sr-snippet">${c.snippet}</div>` +
              `</div>`
            ).join('') +
          `</div>`
        ).join('') +
      `</div>`
    ).join('');
    resultsEl.querySelectorAll('.sr-item').forEach(item =>
      item.addEventListener('click', () => navigateToResult(item.dataset.sec, +item.dataset.card))
    );
  } else {
    resultsEl.innerHTML = `<div class="sr-empty">${t().noMatches}</div>`;
  }

  resultsEl.style.display = 'block';
  navEl.style.display = 'none';
}

function clearSearch() {
  const inp = document.getElementById('searchInput');
  const resultsEl = document.getElementById('searchResults');
  const navEl = document.getElementById('navList');
  if (!inp.value && resultsEl.style.display === 'none' && navEl.style.display !== 'none') return;
  inp.value = '';
  document.getElementById('searchClear').style.display = 'none';
  document.getElementById('searchKbd').style.display = '';
  document.getElementById('searchCount').style.display = 'none';
  document.getElementById('searchResults').style.display = 'none';
  document.getElementById('navList').style.display = '';
  document.querySelectorAll('.section.s-hide').forEach(s => s.classList.remove('s-hide'));
  document.querySelectorAll('.nav-item.s-hide,.nav-cat.s-hide').forEach(el => el.classList.remove('s-hide'));
  document.querySelectorAll('mark.hl').forEach(m => {
    const t2 = document.createTextNode(m.textContent);
    m.replaceWith(t2);
  });
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
  clearBtn.style.display = 'inline';
  kbdEl.style.display = 'none';

  if (!_savedState.size) {
    document.querySelectorAll('.cb').forEach(b => {
      const key = b.closest('.section')?.id + '|' + Array.from(b.parentElement.children).indexOf(b);
      _savedState.set(key, b.classList.contains('open'));
    });
  }

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

    const secTitleEl = sec.querySelector('.sec-title');
    if (secTitleEl) { rx.lastIndex = 0; if (rx.test(secTitleEl.textContent)) { rx.lastIndex = 0; highlightNode(secTitleEl, rx); } }

    sec.querySelectorAll('.card').forEach(card => {
      const cb = card.querySelector('.cb');
      const ch = card.querySelector('.ch');
      const arr = ch?.querySelector('.arrow');
      if (!cb) return;
      rx.lastIndex = 0;
      const bodyMatch = rx.test(cb.textContent);
      rx.lastIndex = 0;
      const headMatch = ch ? rx.test(ch.textContent) : false;
      rx.lastIndex = 0;
      if (bodyMatch || headMatch) {
        cb.classList.add('open');
        if (arr) arr.classList.add('open');
        if (bodyMatch) highlightNode(cb, rx);
        if (headMatch) highlightNode(ch, rx);
      } else {
        cb.classList.remove('open');
        if (arr) arr.classList.remove('open');
      }
    });
  });

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

  countEl.textContent = t().sectionsMatched(matchedSecs);
  countEl.style.display = 'block';

  rx.lastIndex = 0;
  renderSearchResults(rx);
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
  item.innerHTML = `<input type="checkbox" value="${c.id}"><span>${catLabel(c.id)}</span>`;
  grid.appendChild(item);
});

// ── INIT ──
applyUiStrings();
// Set active lang button on load
document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === getLang()));
loadSections();
