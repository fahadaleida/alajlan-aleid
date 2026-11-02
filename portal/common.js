// المشترك بين صفحات البوابة: القائمة، درج الجوال، التذييل، وتحميل البيانات
const $ = (s, r = document) => r.querySelector(s);
const ar = n => Math.round(n).toLocaleString('ar-SA', {useGrouping: false});
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const fmtDate = d => {const [y, m, dd] = d.split('-').map(Number); return `${ar(dd)} ${MONTHS[m - 1]} ${ar(y)}`;};
const CAT_LABEL = {'أخبار الاسرة': 'أخبار الأسرة', 'دعوات الأسرة': 'دعوات الأسرة', 'مناسبات الاسرة': 'مناسبات الأسرة'};
const catName = c => CAT_LABEL[c] || c;
const TREE_URL = '../v7/index.html';

const IC = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z"/>',
  vision: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M15.5 14.2c3 .2 5.5 2.6 5.5 5.8"/>',
  tribe: '<path d="M3 20h18M5 20V9l7-5 7 5v11"/><path d="M10 20v-5h4v5"/>',
  news: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>',
  mag: '<path d="M4 4h11a3 3 0 013 3v13H7a3 3 0 01-3-3z"/><path d="M18 7h2v13"/><path d="M8 8h6M8 12h6"/>',
  tree: '<path d="M12 21v-7M12 14l-4-4M12 14l4-4M12 10V6"/><circle cx="12" cy="5" r="2"/><circle cx="7" cy="9" r="2"/><circle cx="17" cy="9" r="2"/>',
  fund: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M3 11h18M8 7V5a4 4 0 018 0v2"/>',
  award: '<circle cx="12" cy="9" r="5"/><path d="M8.5 13.5L7 21l5-3 5 3-1.5-7.5"/>',
  film: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9.5v5l4.5-2.5z"/>',
  sms: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M10 18h4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  box: '<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  dl: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
};
const svg = (k, s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${IC[k]}</svg>`;
const SOC_IC = {
  facebook: '<path d="M14 8h3V4h-3a4 4 0 00-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z"/>',
  'twitter': '<path d="M4 4l16 16M20 4L4 20"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
  youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9v6l5-3z"/>',
  snapchat: '<path d="M12 3c3 0 5 2.2 5 5v3l2 1-2 1c.5 2 2 3 3 3-1 1-3 1-4 1l-1 2-3-1-3 1-1-2c-1 0-3 0-4-1 1 0 2.5-1 3-3l-2-1 2-1V8c0-2.8 2-5 5-5z"/>',
  't.me': '<path d="M21 4L3 11l6 2 2 6 3-4 5 4z"/><path d="M9 13l9-7"/>',
  tiktok: '<path d="M14 3v11a4 4 0 11-4-4"/><path d="M14 3c0 3 2 5 5 5"/>',
  whatsapp: '<path d="M4 20l1.5-4A8 8 0 1112 20a8 8 0 01-4-1z"/><path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z"/>',
  'apple.com': '<path d="M16 3c0 2-1.5 3.5-3 3.5 0-2 1.5-3.5 3-3.5zM12 8c1 0 2-1 4-1 1.5 0 3 1 3.8 2.3C17.5 10.5 17 14 20 15.5c-.8 2.5-2.5 5.5-4.5 5.5-1.2 0-1.7-.8-3.5-.8s-2.3.8-3.5.8C6 21 4 16.5 4 13c0-3.5 2.3-5.5 4.5-5.5 1.5 0 2.5 1 3.5.5z"/>',
  'play.google': '<path d="M5 3l14 9-14 9z"/><path d="M5 3l9 9-9 9M14 12l5 0"/>',
};
const SOC_NAME = {facebook: 'فيسبوك', twitter: 'إكس', instagram: 'انستقرام', youtube: 'يوتيوب', snapchat: 'سناب شات', 't.me': 'تيليقرام', tiktok: 'تيك توك', whatsapp: 'قناة واتساب', 'apple.com': 'تطبيق آيفون', 'play.google': 'تطبيق أندرويد'};

// الأقسام: الرابط يوجّه للرئيسية من الصفحات الأخرى
const MENU = [
  {k: 'home', t: 'الرئيسية', h: 'index.html'},
  {k: 'vision', t: 'الرؤية والرسالة', h: 'page.html?p=vision'},
  {k: 'people', t: 'عن العائلة', h: 'page.html?p=about'},
  {k: 'tribe', t: 'قبيلة هذيل', h: 'page.html?p=hudhayl'},
  {k: 'news', t: 'الأخبار والمناسبات', h: 'news.html'},
  {k: 'mag', t: 'المجلات', h: 'page.html?p=magazines'},
  {k: 'fund', t: 'صندوق العائلة', h: 'page.html?p=fund'},
  {k: 'award', t: 'جائزة التفوق العلمي', h: 'page.html?p=award'},
  {k: 'film', t: 'الفيلم الوثائقي', h: 'page.html?p=film'},
  {k: 'sms', t: 'الاشتراك بجوال العائلة', h: 'page.html?p=sms'},
  {k: 'mail', t: 'تواصل معنا', h: 'page.html?p=contact'},
];
const IS_HOME = !!document.body.dataset.home;
const href = m => m.h;

function buildChrome(site) {
  const top = MENU.filter(m => ['home', 'vision', 'people', 'tribe', 'news', 'mag', 'fund', 'mail'].includes(m.k));
  document.body.insertAdjacentHTML('afterbegin', `
  <header class="nav" id="nav"><div class="wrap">
    <a class="brand" href="${IS_HOME ? '#top' : 'index.html'}"><img src="img/logo-full.png" alt="شعار أسرة العجلان والعيد"><b>أسرة العجلان والعيد</b></a>
    <nav class="menu" aria-label="الأقسام">${top.map(m => `<a href="${href(m)}">${m.t}</a>`).join('')}<a href="${TREE_URL}" class="tree">شجرة العائلة</a></nav>
    <button class="burger" id="burger" aria-label="القائمة"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg></button>
  </div></header>
  <div class="drawer" id="drawer"><div class="scrim" data-close></div><div class="sheet">
    <h4>أقسام البوابة</h4>
    <a href="${TREE_URL}" data-close><i>${svg('tree', 18)}</i>شجرة العائلة التفاعلية</a>
    ${MENU.map(m => `<a href="${href(m)}" data-close><i>${svg(m.k, 18)}</i>${m.t}</a>`).join('')}
  </div></div>`);
  const dr = $('#drawer');
  $('#burger').onclick = () => dr.classList.add('open');
  dr.addEventListener('click', e => {if (e.target.closest('[data-close]')) dr.classList.remove('open');});
  const nav = $('#nav');
  if (IS_HOME) addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > 40), {passive: true});
  document.body.insertAdjacentHTML('beforeend', `
  <footer><div class="wrap">
    <img src="img/logo-full.png" alt="أسرة العجلان والعيد" class="flogo">
    <q>«تعلّموا من أنسابكم ما تصلون به أرحامكم»</q>
    <div class="socials" style="margin:22px 0 6px">${socials(site)}</div>
    <small>© ${ar(new Date().getFullYear())}، ${esc(site.copyright)} · <a href="${TREE_URL}" style="color:var(--gold-l)">شجرة العائلة</a></small>
  </div></footer>`);
}
function socials(site) {
  return Object.entries(site.social || {}).map(([k, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener" title="${SOC_NAME[k] || k}" aria-label="${SOC_NAME[k] || k}">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${SOC_IC[k] || IC.mail}</svg></a>`).join('');
}
// ظهور العناصر عند التمرير
function reveal(root = document) {
  const io = new IntersectionObserver(es => es.forEach(e => {if (e.isIntersecting) {e.target.classList.add('in'); io.unobserve(e.target);}}), {threshold: .08});
  root.querySelectorAll('.rv:not(.in)').forEach(el => io.observe(el));
}
const loadJSON = u => fetch(u).then(r => r.json());
const newsCard = p => `<a class="ncard rv" href="post.html?id=${p.id}">
  <div class="im" style="background-image:url('${esc(p.i)}')"><span class="cat">${esc(catName(p.c))}</span></div>
  <div class="bd"><time>${fmtDate(p.d)}</time><h3>${esc(p.t)}</h3><p>${esc(p.x)}</p></div></a>`;
