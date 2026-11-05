// صور الرجال: قسم داخل «شجرة العائلة» يضيف منه المشرف صور الرجال والأبناء فقط، فرعاً بعد فرع
// البنات وغير محددي الجنس لا يدخلون هنا أبداً، والخادم يرفضهم أيضاً (api/portrait.php). التخزين عبر Store.men* في admin-store.js
const Men = (() => {
  const {view, head, say, modal, closeModal, confirmBox, progress, norm} = Editor.ui;
  const SIDE = 600, MAX = 70 * 1024, STEP = 48, ZOOM = 6, KEY = 'ajlan-men';
  const MAIN = [[8, 'فرع إبراهيم', 'العيد'], [9, 'فرع حمد', 'العجلان'], [10, 'فرع سليمان', 'الطويل']];   // نفس فروع موقع الشجرة
  const FILTERS = [['none', 'بدون صورة'], ['has', 'بصورة'], ['all', 'الكل']];
  let T = null, M = null, have = {}, tray = [], flow = null, cur = null, last = null, shown = 0, io = null, back = null, toastT = 0, nav = 0;
  const mem = {root: 0, filter: 'none'};
  try {Object.assign(mem, JSON.parse(localStorage.getItem(KEY) || '{}'));} catch (e) {}
  const remember = () => {try {localStorage.setItem(KEY, JSON.stringify(mem));} catch (e) {}};
  const inMen = () => /^#tree\/men(\/|$)/.test(location.hash);

  // ===== الأسماء: ترتيب العائلة نفسها (الأب ثم أبناؤه)، ففرع أي رجل قطعة متصلة من القائمة =====
  function build(t) {
    if (M && T === t) return M;
    T = t;
    const man = p => Store.genderOf(p) === 'm', order = [], at = new Map(), end = new Map(), seen = new Set();
    const walk = p => {
      if (seen.has(p.id)) return; seen.add(p.id);
      const m = man(p); if (m) {at.set(p.id, order.length); order.push(p);}
      (T.kids.get(p.id) || []).forEach(walk);
      if (m) end.set(p.id, order.length);
    };
    T.L.filter(p => !T.by.has(p.father)).forEach(walk); T.L.forEach(walk);
    const names = new Map(order.map(p => [p.id, Panel.chain(T, p).map(x => x.name)])), depth = new Map();
    // كثير من الرجال يتشابهون في الاسم الثلاثي، فنطيل النسب حتى يصير فريداً
    let open = order;
    for (let d = 4; d <= 16 && open.length; d++) {
      const c = new Map(), key = p => names.get(p.id).slice(0, d).join(' ');
      open.forEach(p => c.set(key(p), (c.get(key(p)) || 0) + 1));
      open = open.filter(p => {if (c.get(key(p)) > 1) return true; depth.set(p.id, d); return false;});
    }
    const tri = new Map(), triKey = p => names.get(p.id).slice(0, 3).join(' ');
    order.forEach(p => tri.set(triKey(p), (tri.get(triKey(p)) || 0) + 1));
    const hay = order.map(p => [p, norm(names.get(p.id).slice(0, 7).join(' ')).split(' ')]);
    return M = {order, at, end, names, depth, hay, same: p => tri.get(triKey(p)) - 1, unclear: T.L.filter(p => Store.genderOf(p) === '?').length};
  }
  const part = root => root && M.at.has(root) ? M.order.slice(M.at.get(root), M.end.get(root)) : M.order;
  const done = list => list.reduce((n, p) => n + (have[p.id] ? 1 : 0), 0);
  const lineOf = p => {const a = M.names.get(p.id).slice(1, M.depth.get(p.id) || 16); return a.length ? 'بن ' + a.join(' بن ') : '';};
  const fullName = (p, n = 4) => Panel.nasab(T, p, n);
  function branchOf(p) {
    const c = Panel.chain(T, p), i = c.findIndex(x => MAIN.some(m => m[0] === x.id));
    if (i < 0) return 'جذع الشجرة';
    const m = MAIN.find(x => x[0] === c[i].id);
    return i ? `فرع ${c[i - 1].name} بن ${c[i].name} · ${m[2]}` : `${m[1]} · ${m[2]}`;
  }
  const rootName = () => mem.root ? fullName(T.by.get(mem.root), 3) : 'كل الشجرة';
  const face = (p, cls = '') => `<span class="mav ${cls}">${have[p.id] ? `<img src="${esc(Store.menUrl(p.id, have[p.id]))}" alt="" loading="lazy" decoding="async">` : `<i>${esc(p.name.replace(/^ال/, '')[0])}</i>`}</span>`;
  const bar = (n, of) => `<div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="${of}" aria-valuenow="${n}"><i style="width:${of ? Math.max(n ? 1 : 0, n / of * 100) : 0}%"></i></div>`;

  async function load() {
    const [t, list] = await Promise.all([Panel.tree(), Store.menList()]);
    have = list; build(t);
    if (mem.root && !M.at.has(mem.root)) mem.root = 0;
  }
  const fail = e => {view().innerHTML = `${head('صور الرجال', '#tree')}<p class="eempty">${esc(say(e))}</p>`;};

  // ===== القائمة =====
  async function grid() {
    const me = ++nav; flow = null; cur = null;
    try {await load();} catch (e) {return fail(e);}
    if (me !== nav) return;   // انتقل لشاشة أخرى أثناء التحميل
    const memo = back; back = null;
    view().innerHTML = `${head('صور الرجال', '', 'اختر فرعاً، ثم أضف صور رجاله واحداً بعد الآخر')}${Panel.treeTabs(1)}
      <section class="pcard mtop1" id="mAll"></section>
      ${Store.demo ? `<div class="enote" id="mDemo"><span>هذه الصور محفوظة في هذا المتصفح فقط. نزّل نسخة منها بين فترة وأخرى، حتى تُنقل مع الموقع.</span><button class="ebtn" id="mZip">تنزيل نسخة من الصور</button></div>` : ''}
      <section class="pcard mpick">
        <label class="esearch">${svg('search', 18)}<input id="mq" type="search" placeholder="ابحث عن أي رجل: فهد بن سعد بن علي" aria-label="بحث في الرجال"></label>
        <div class="erows mres" id="mres" hidden></div>
        <div id="mchips"></div>
      </section>
      <div id="mtrayBox"></div>
      <div class="mhere" id="mhere"></div>
      <div class="mcards" id="mgrid"></div><div id="mmore"></div>`;
    drawAll(); drawChips(); drawTray(); drawHere(); drawList(memo && memo.shown);
    if (memo) scrollTo(0, memo.y);
    $('#mq').oninput = e => search(e.target.value);
    if ($('#mZip')) $('#mZip').onclick = zip;
  }
  function drawAll() {
    const x = done(M.order), y = M.order.length;
    $('#mAll').innerHTML = `<div class="mhead"><b>تمت إضافة ${ar(x)} من ${ar(y)}</b><span>باقي ${ar(y - x)}</span></div>${bar(x, y)}
      ${M.unclear ? `<p class="phint">غير محدد الجنس: ${ar(M.unclear)}. لا يظهرون هنا حتى يتأكد جنسهم.</p>` : ''}`;
    if ($('#mDemo')) $('#mDemo').hidden = !x;
  }
  function chip(id, label) {
    const l = part(id), on = mem.root === id;
    return `<button type="button" class="mchip${on ? ' on' : ''}" data-root="${id}"${on ? ' aria-pressed="true"' : ''}><b>${esc(label)}</b><small>${ar(done(l))} من ${ar(l.length)}</small></button>`;
  }
  function drawChips() {
    const r = mem.root, p = r && T.by.get(r), line = p ? Panel.chain(T, p).reverse() : [], top = line.findIndex(x => MAIN.some(m => m[0] === x.id));
    const up = top < 0 ? [] : line.slice(top + 1, -1).filter(x => M.at.has(x.id));
    const sons = p ? (T.kids.get(r) || []).filter(k => M.at.has(k.id) && M.end.get(k.id) - M.at.get(k.id) > 1).sort((a, b) => (M.end.get(b.id) - M.at.get(b.id)) - (M.end.get(a.id) - M.at.get(a.id))) : [];
    const main = MAIN.some(m => m[0] === r);
    $('#mchips').innerHTML = `<div class="mchips">${chip(0, 'كل الشجرة')}${MAIN.map(([id, t]) => chip(id, t)).join('')}${p && !main ? chip(r, p.name) : ''}</div>
      ${up.length ? `<div class="mchips sub"><span>فوقه:</span>${up.map(x => chip(x.id, x.name)).join('')}</div>` : ''}
      ${sons.length ? `<div class="mchips sub"><span>فروع داخله:</span>${sons.map(x => chip(x.id, x.name)).join('')}</div>` : ''}`;
    $('#mchips').querySelectorAll('[data-root]').forEach(b => {b.onclick = () => pick(+b.dataset.root);});
  }
  function pick(root) {
    mem.root = root; remember();
    $('#mq').value = ''; $('#mres').hidden = true; $('#mchips').hidden = false;
    drawChips(); drawHere(); drawList();
  }
  function drawHere() {
    const l = part(mem.root), x = done(l), left = l.length - x;
    const n = {none: left, has: x, all: l.length};
    $('#mhere').innerHTML = `<div class="mhead"><b>${mem.root ? 'فرع ' : ''}${esc(rootName())}</b><span>${ar(x)} من ${ar(l.length)}، باقي ${ar(left)}</span></div>${bar(x, l.length)}
      <div class="mtools"><div class="mseg" role="group" aria-label="عرض">${FILTERS.map(([k, t]) => `<button type="button" data-f="${k}"${mem.filter === k ? ' class="on" aria-pressed="true"' : ''}>${t} <small>${ar(n[k])}</small></button>`).join('')}</div>
      <span class="mgo"><button class="ebtn" id="mBatch">دفعة صور</button><button class="ebtn gold" id="mNext"${left ? '' : ' disabled'}>الشخص التالي ${svg('chevl', 16)}</button></span></div>`;
    $('#mhere').querySelectorAll('[data-f]').forEach(b => {b.onclick = () => {mem.filter = b.dataset.f; remember(); drawHere(); drawList();};});
    $('#mBatch').onclick = () => $('#mfiles').click();
    $('#mNext').onclick = start;
  }
  const listNow = () => {const l = part(mem.root); return mem.filter === 'all' ? l : l.filter(p => !!have[p.id] === (mem.filter === 'has'));};
  const card = p => `<a class="mcard${have[p.id] ? ' has' : ''}" href="#tree/men/${p.id}" data-id="${p.id}">${face(p)}<b>${esc(p.name)}${p.title ? ` <small>(${esc(p.title)})</small>` : ''}</b><small class="ml">${esc(lineOf(p))}</small><small class="mb">${esc(branchOf(p))}</small></a>`;
  function drawList(keep) {
    if (io) io.disconnect();
    const l = listNow(), g = $('#mgrid'); shown = Math.min(Math.max(keep || 0, STEP), l.length);
    g.innerHTML = l.slice(0, shown).map(card).join('') || `<p class="eempty">${mem.filter === 'none' ? 'كل رجال هذا الفرع لهم صور.' : 'لا يوجد أحد هنا بعد.'}</p>`;
    if (shown >= l.length) return;
    io = new IntersectionObserver(es => {
      if (!es.some(e => e.isIntersecting)) return;
      const n = Math.min(shown + STEP, l.length);
      g.insertAdjacentHTML('beforeend', l.slice(shown, n).map(card).join('')); shown = n;
      if (shown >= l.length) io.disconnect();
    }, {rootMargin: '700px'});
    io.observe($('#mmore'));
  }
  addEventListener('click', e => {const c = e.target.closest && e.target.closest('.mcard'); if (c) back = {shown, y: scrollY};});
  function search(q) {
    const w = norm(q).replace(/(^|\s)(بن|ابن)(?=\s)/g, ' ').trim().split(/\s+/).filter(Boolean), box = $('#mres');
    box.hidden = !w.length; $('#mchips').hidden = !!w.length;
    if (!w.length) return;
    const R = M.hay.filter(([, h]) => {let k = 0; for (const x of h) if (x === w[k] || (k === w.length - 1 && x.startsWith(w[k]))) k++; return k >= w.length && h[0].startsWith(w[0]);}).slice(0, 12).map(r => r[0]);
    box.innerHTML = R.map(p => {
      const n = M.end.get(p.id) - M.at.get(p.id);
      return `<div class="erow mrow">${face(p, 'sm')}<span><b>${esc(fullName(p, Math.max(M.depth.get(p.id) || 6, 5)))}</b><small>${esc(branchOf(p))}${have[p.id] ? ' · له صورة' : ''}</small></span><a class="ebtn" href="#tree/men/${p.id}">صورته</a>${n > 1 ? `<button class="ebtn" data-root="${p.id}">فرعه ${ar(n)}</button>` : ''}</div>`;
    }).join('') || '<p class="eempty">لا توجد نتائج بين الرجال.</p>';
    box.querySelectorAll('[data-root]').forEach(b => {b.onclick = () => pick(+b.dataset.root);});
  }

  // ===== الشخص التالي =====
  function start() {
    const p = part(mem.root).find(x => !have[x.id]);
    if (!p) return toast('كل رجال هذا الفرع لهم صور');
    flow = {root: mem.root, skip: new Set(), fresh: true};
    location.hash = `#tree/men/${p.id}`;
  }
  function nextId(from) {
    const l = part(flow.root), i = Math.max(0, l.findIndex(p => p.id === from));
    for (let k = 1; k <= l.length; k++) {const p = l[(i + k) % l.length]; if (!have[p.id] && !flow.skip.has(p.id) && p.id !== from) return p.id;}
    return 0;
  }
  function go(id) {history.replaceState(null, '', `#tree/men/${id}`); open(id); scrollTo(0, 0);}
  function advance(from) {
    const n = nextId(from);
    if (n) return go(n);
    cur = null;
    const l = part(flow.root), left = l.length - done(l);
    view().innerHTML = `${head('صور الرجال', '#tree/men')}<section class="pcard pmid mfin"><div class="eok">${svg('check', 30)}</div><p>${left ? `بقي ${ar(left)} تخطيتهم في هذا الفرع.` : 'اكتمل هذا الفرع. كل رجاله لهم صور.'}</p>
      <p class="phint">${esc(rootName())}: ${ar(done(l))} من ${ar(l.length)}</p><div class="eacts">${left ? '<button class="ebtn gold" id="mAgain">راجع الذين تخطيتهم</button>' : ''}<a class="ebtn" href="#tree/men">رجوع للقائمة</a></div></section>`;
    if ($('#mAgain')) $('#mAgain').onclick = () => {flow.skip.clear(); const p = l.find(x => !have[x.id]); if (p) go(p.id);};
  }
  async function entry(id) {
    const me = ++nav;
    try {await load();} catch (e) {return fail(e);}
    if (me === nav) open(id);
  }
  function open(id) {
    const p = T.by.get(id);
    if (!p || Store.genderOf(p) !== 'm') {toast('هذا الاسم خارج صور الرجال'); location.replace('#tree/men'); return;}
    cur = {id, p, crop: null, item: null};
    const l = flow ? part(flow.root) : part(mem.root), inside = l.some(x => x.id === id), x = done(l);
    view().innerHTML = `${head('صور الرجال', '#tree/men', flow ? `${rootName()}: ${ar(x)} من ${ar(l.length)}، باقي ${ar(l.length - x)}` : inside && mem.root ? rootName() : '')}
      <div class="mentry"><div class="mside"><section class="pcard mwho" id="mwho"></section><div id="mstrip"></div></div><section class="pcard mwork" id="mwork"></section></div>`;
    drawWho(); drawWork();
  }
  function drawWho() {
    const {p, id} = cur, f = T.by.get(p.father), sons = (T.kids.get(id) || []).filter(k => M.at.has(k.id)), same = M.same(p);
    const line = M.names.get(id).slice(1, Math.max((M.depth.get(id) || 16) + 2, 7));
    $('#mwho').innerHTML = `<div class="mwtop">${face(p, 'big')}<div><h3>${esc(p.name)}${p.title ? ` <small>(${esc(p.title)})</small>` : ''}</h3><p class="mnas">${line.length ? esc('بن ' + line.join(' بن ')) : ''}</p></div></div>
      <p class="mtag">${esc(branchOf(p))}</p>
      ${same > 0 ? `<p class="mwarn2">انتبه: «${esc(M.names.get(id).slice(0, 3).join(' بن '))}» اسم يحمله ${ar(same + 1)} في الشجرة. تأكد من النسب قبل الحفظ.</p>` : ''}
      ${p.flag ? '<p class="mwarn2">اسم والده في الطبعة غير مؤكد، فتأكد من الشخص قبل الحفظ.</p>' : ''}
      <dl class="mfacts">${f ? `<dt>والده</dt><dd>${esc(fullName(f, 3))}</dd>` : ''}${sons.length ? `<dt>أبناؤه</dt><dd>${esc(sons.slice(0, 8).map(k => k.name).join('، '))}${sons.length > 8 ? ` و${ar(sons.length - 8)} غيرهم` : ''}</dd>` : ''}</dl>`;
  }
  function trayStrip() {
    if (!tray.length || !cur) return '';
    const hit = tray.map(t => [t, likely(t, cur.p)]).sort((a, b) => b[1] - a[1]);
    return `<div class="pcard mtray"><div class="mhead"><b>صور الدفعة ${ar(tray.length)}</b><span>اضغط صورته فقط</span></div><div class="mtrow">${hit.map(([t, s]) => thumb(t, s)).join('')}</div></div>`;
  }
  const thumb = (t, s) => `<div class="mth${s ? ' sug' : ''}${t === (cur && cur.item) ? ' on' : ''}"><button type="button" class="mtp" data-t="${t.k}" title="${esc(t.name)}">${t.url ? `<img src="${t.url}" alt="">` : '<span class="espin"></span>'}</button><button type="button" class="ex" data-x="${t.k}" aria-label="إزالة الصورة">${svg('x', 14)}</button><small>${s ? 'الاسم يشبهه؟' : esc(t.name)}</small></div>`;
  // اقتراح فقط: اسم الملف فيه اسمه واسم أبيه. لا يُختار شيء تلقائياً، والمشرف هو من يضغط الصورة ويحفظ
  const likely = (t, p) => {const w = norm(t.name.replace(/\.\w+$/, '')).split(/[^ء-ي]+/), n = M.names.get(p.id); return n.length > 1 && w.includes(norm(n[0])) && w.includes(norm(n[1])) ? 1 : 0;};
  function drawWork() {
    const c = cur, box = $('#mwork'); if (!c || !box) return;
    box.parentNode.classList.toggle('cropping', !!c.crop);
    if (c.crop) {
      box.innerHTML = `<div class="mstage" id="mstage"><canvas id="mcv" aria-label="الصورة، اسحبها لتحريكها"></canvas><i class="mmask"></i><i class="mguide"></i></div>
        <div class="mzoom"><button type="button" id="mZo" aria-label="تصغير">−</button><input id="mZ" type="range" min="0" max="100" value="0" dir="ltr" aria-label="التكبير"><button type="button" id="mZi" aria-label="تكبير">+</button><button type="button" id="mRot" class="wide">تدوير</button></div>
        <p class="phint">حرّك الصورة وكبّرها حتى يكون الوجه داخل الخط.${c.crop.small ? ' <b>الصورة صغيرة وقد لا تظهر واضحة.</b>' : ''}</p>
        <p class="eerr" id="mErr" hidden></p>
        <div class="macts"><button class="ebtn gold big" id="mSave">${Store.demo ? 'حفظ في نسخة العرض' : flow ? 'حفظ والتالي' : 'حفظ'}</button><button class="ebtn" id="mCancel">إلغاء</button></div>`;
      mountCrop(c.crop);
      $('#mSave').onclick = save;
      $('#mCancel').onclick = () => {c.crop = null; c.item = null; drawWork();};
    } else if (have[c.id]) {
      box.innerHTML = `<img class="mshow" src="${esc(Store.menUrl(c.id, have[c.id]))}" alt="صورة ${esc(c.p.name)}">
        <p class="eerr" id="mErr" hidden></p><div class="macts"><button class="ebtn gold" id="mRep">استبدال الصورة</button><button class="ebtn danger ghost" id="mDel">حذف الصورة</button>${flow ? '<button class="ebtn" id="mSkip">التالي</button>' : ''}</div>`;
      $('#mRep').onclick = () => $('#mfile').click();
      $('#mDel').onclick = remove;
    } else {
      box.innerHTML = `<button type="button" class="edrop mdrop" id="mdrop">${svg('cam', 34)}<b>اختر صورته</b><span>أو اسحبها هنا، أو الصقها</span></button>
        <p class="eerr" id="mErr" hidden></p>
        ${flow ? '<div class="macts"><button class="ebtn" id="mSkip">تخطي، ما عندي صورته</button></div>' : ''}`;
      $('#mdrop').onclick = () => $('#mfile').click();
    }
    if ($('#mSkip')) $('#mSkip').onclick = () => {flow.skip.add(c.id); advance(c.id);};
    drawStrip();
  }
  function drawStrip() {
    const box = $('#mstrip'); if (!box) return;
    box.innerHTML = trayStrip();
    box.querySelectorAll('[data-t]').forEach(b => {b.onclick = () => {const t = tray.find(x => x.k === +b.dataset.t); if (t) take(t.file, t);};});
    box.querySelectorAll('[data-x]').forEach(b => {b.onclick = () => dropTray(+b.dataset.x);});
  }
  const say2 = t => {const e = $('#mErr'); if (e) {e.textContent = t; e.hidden = false;}};

  // ===== القص: إطار مربع ثابت ودائرة كما تظهر في الشجرة، بالفأرة واللمس =====
  async function decode(file) {
    const u = URL.createObjectURL(file), im = new Image(); im.src = u;
    try {
      await im.decode();   // <img> يحترم اتجاه الكاميرا في كل المتصفحات الحديثة
      const s = Math.min(1, 2000 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(im.naturalWidth * s)); c.height = Math.max(1, Math.round(im.naturalHeight * s));
      const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(im, 0, 0, c.width, c.height);
      return {c, side: Math.min(im.naturalWidth, im.naturalHeight)};
    } finally {URL.revokeObjectURL(u);}
  }
  // الوضع الأول: الوسط أفقياً، والجزء العلوي في الصور الطولية لأن الوجه هناك غالباً
  function place(C) {
    const m = Math.min(C.w, C.h); C.v = m; C.cx = C.w / 2;
    C.cy = C.h > C.w ? m / 2 + (C.h - m) * .14 : C.h / 2;
  }
  const clamp = C => {
    const m = Math.min(C.w, C.h); C.v = Math.min(m, Math.max(m / ZOOM, C.v));
    C.cx = Math.min(C.w - C.v / 2, Math.max(C.v / 2, C.cx)); C.cy = Math.min(C.h - C.v / 2, Math.max(C.v / 2, C.cy));
  };
  async function take(file, item) {
    const c = cur; if (!c || !$('#mwork')) return;
    $('#mwork').innerHTML = '<div class="mwait"><span class="espin"></span></div>';
    let r;
    try {r = await decode(file);}
    catch (e) {if (cur !== c) return; drawWork(); return say2(Photos.isHeic(file) ? 'صيغة HEIC لا تفتح في هذا المتصفح. افتحها من الآيفون، أو حوّلها إلى JPG.' : 'هذا الملف ليس صورة، أو تالف.');}
    if (cur !== c) return;
    const C = {src: r.c, w: r.c.width, h: r.c.height, small: r.side < 320, touched: false};
    place(C); c.crop = C; c.item = item || null; drawWork(); findFace(C);
  }
  // إضافة فقط: المتصفحات التي فيها كاشف الوجه تضبط الإطار، والباقي يكمل بالوضع الأول
  async function findFace(C) {
    if (!('FaceDetector' in window)) return;
    try {
      const fs = await new FaceDetector({fastMode: true, maxDetectedFaces: 4}).detect(C.src);
      if (!fs.length || C.touched || !cur || cur.crop !== C) return;
      const b = fs.map(f => f.boundingBox).sort((x, y) => y.width * y.height - x.width * x.height)[0];
      C.v = b.height * 2.3; C.cx = b.x + b.width / 2; C.cy = b.y + b.height / 2 + C.v * .05; clamp(C); C.sync && C.sync();
    } catch (e) {}
  }
  function mountCrop(C) {
    const cv = $('#mcv'), st = $('#mstage'), g = cv.getContext('2d'), z = $('#mZ'), m = Math.min(C.w, C.h);
    let raf = 0;
    const paint = () => {
      raf = 0;
      const s = st.clientWidth, d = Math.min(devicePixelRatio || 1, 2), px = Math.round(s * d);
      if (cv.width !== px) cv.width = cv.height = px;
      g.imageSmoothingQuality = 'high'; g.drawImage(C.src, C.cx - C.v / 2, C.cy - C.v / 2, C.v, C.v, 0, 0, px, px);
    };
    const draw = () => {if (!raf) raf = requestAnimationFrame(paint);};
    const toSlider = () => {z.value = Math.round(Math.log(m / C.v) / Math.log(ZOOM) * 100);};
    C.sync = () => {toSlider(); draw();};
    const zoomTo = v => {C.v = v; C.touched = true; clamp(C); toSlider(); draw();};
    const pts = new Map(); let gap = 0, mid = null;
    const pair = () => {const [a, b] = [...pts.values()]; return {d: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2};};
    cv.onpointerdown = e => {
      cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, {x: e.clientX, y: e.clientY}); C.touched = true;
      if (pts.size === 2) {const q = pair(); gap = q.d; mid = q;}
    };
    cv.onpointermove = e => {
      const p = pts.get(e.pointerId); if (!p) return;
      const k = C.v / st.clientWidth;
      if (pts.size === 1) {C.cx -= (e.clientX - p.x) * k; C.cy -= (e.clientY - p.y) * k; p.x = e.clientX; p.y = e.clientY;}
      else {
        p.x = e.clientX; p.y = e.clientY;
        const q = pair(); C.cx -= (q.x - mid.x) * k; C.cy -= (q.y - mid.y) * k;
        if (gap) C.v *= gap / q.d; gap = q.d; mid = q; toSlider();
      }
      clamp(C); draw();
    };
    cv.onpointerup = cv.onpointercancel = e => {pts.delete(e.pointerId); gap = 0;};
    cv.onwheel = e => {e.preventDefault(); zoomTo(C.v * Math.exp(e.deltaY * .0016));};
    z.oninput = () => zoomTo(m / ZOOM ** (z.value / 100));
    $('#mZi').onclick = () => zoomTo(C.v / 1.15);
    $('#mZo').onclick = () => zoomTo(C.v * 1.15);
    $('#mRot').onclick = () => {
      const r = document.createElement('canvas'); r.width = C.h; r.height = C.w;
      const q = r.getContext('2d'); q.translate(C.h, 0); q.rotate(Math.PI / 2); q.drawImage(C.src, 0, 0);
      C.src = r; [C.w, C.h] = [C.h, C.w]; place(C); C.touched = true; mountCrop(C);
    };
    toSlider(); paint();
  }
  // نفس المعالجة لكل صورة: المقاس والإطار، وشد خفيف لمستوى الإضاءة بحد أعلى ثابت، ثم الجودة التي تبقي الحجم في حدوده. لا يوجد أي تعديل على الوجه نفسه
  function levels(g) {
    const d = g.getImageData(0, 0, SIDE, SIDE), a = d.data, h = new Uint32Array(256), n = SIDE * SIDE;
    for (let i = 0; i < a.length; i += 4) h[(a[i] * 77 + a[i + 1] * 150 + a[i + 2] * 29) >> 8]++;
    let lo = 0, hi = 255, s = 0;
    while (lo < 255 && (s += h[lo]) < n * .005) lo++;
    s = 0; while (hi > 0 && (s += h[hi]) < n * .005) hi--;
    lo = Math.min(lo, 16); hi = Math.max(hi, 235);
    if (lo < 2 && hi > 253) return;
    const t = new Uint8ClampedArray(256); for (let i = 0; i < 256; i++) t[i] = (i - lo) * 255 / (hi - lo);
    for (let i = 0; i < a.length; i += 4) {a[i] = t[a[i]]; a[i + 1] = t[a[i + 1]]; a[i + 2] = t[a[i + 2]];}
    g.putImageData(d, 0, 0);
  }
  async function bake(C) {
    const c = document.createElement('canvas'); c.width = c.height = SIDE;
    const g = c.getContext('2d', {willReadFrequently: true}); g.fillStyle = '#fff'; g.fillRect(0, 0, SIDE, SIDE); g.imageSmoothingQuality = 'high';
    g.drawImage(C.src, C.cx - C.v / 2, C.cy - C.v / 2, C.v, C.v, 0, 0, SIDE, SIDE);
    levels(g);
    let b;
    for (const q of [.9, .86, .82, .78, .74, .7, .64, .58, .52]) {
      b = await new Promise((res, rej) => c.toBlob(x => x ? res(x) : rej(new Error('encode')), 'image/jpeg', q));
      if (b.size <= MAX) break;
    }
    return b;
  }

  // ===== الحفظ والتراجع =====
  const oldBlob = id => have[id] ? fetch(Store.menUrl(id, have[id])).then(r => r.ok ? r.blob() : null).catch(() => null) : Promise.resolve(null);
  async function save() {
    const c = cur; if (!c || !c.crop) return;
    const btn = $('#mSave'); if (btn.disabled) return;
    btn.disabled = true; $('#mErr').hidden = true;
    try {
      const blob = await bake(c.crop), prev = await oldBlob(c.id);
      have[c.id] = await Store.menSave(c.id, blob);
      const item = c.item; if (item) dropTray(item.k, true);
      last = {id: c.id, prev, item, blob};
      toast(`تم حفظ صورة ${fullName(c.p, 3)}`, true);
      if (cur !== c) return;   // ترك الشاشة أثناء الحفظ
      if (flow) return advance(c.id);
      location.hash = '#tree/men';
    } catch (e) {if (cur === c) {btn.disabled = false; say2(say(e));}}
  }
  async function remove() {
    const c = cur;
    if (!await confirmBox('حذف الصورة؟', fullName(c.p, 4), 'نعم، احذف')) return;
    try {
      const prev = await oldBlob(c.id);
      await Store.menRemove(c.id); delete have[c.id];
      last = {id: c.id, prev}; toast(`حُذفت صورة ${fullName(c.p, 3)}`, true);
      if (cur === c) {drawWho(); drawWork();}
    } catch (e) {say2(say(e));}
  }
  async function undo() {
    const u = last; if (!u) return; last = null; hideToast();
    try {
      if (u.prev) have[u.id] = await Store.menSave(u.id, u.prev);
      else {await Store.menRemove(u.id); delete have[u.id];}
      if (u.item) {tray.unshift(u.item); drawTray();}
      toast('تم التراجع');
      if (flow && !have[u.id]) return go(u.id);
      if (cur && cur.id === u.id) {cur.crop = null; drawWho(); drawWork();}
      else if (cur) drawWork();
      else if ($('#mgrid')) refresh();
    } catch (e) {toast(say(e));}
  }
  function refresh() {if ($('#mAll')) {drawAll(); drawChips(); drawHere(); drawList(shown);}}
  const hideToast = () => {const t = $('#mtoast'); if (t) t.hidden = true;};
  function toast(text, canUndo) {
    let t = $('#mtoast'); if (!t) {document.body.insertAdjacentHTML('beforeend', '<div id="mtoast" role="status" hidden></div>'); t = $('#mtoast');}
    t.innerHTML = `<span>${esc(text)}</span>${canUndo ? '<button type="button">تراجع</button>' : ''}`; t.hidden = false;
    if (canUndo) $('button', t).onclick = undo;
    clearTimeout(toastT); toastT = setTimeout(hideToast, canUndo ? 9000 : 3500);
  }

  // ===== دفعة الصور: تبقى في الذاكرة حتى يوزّعها، ولا يُربط شيء بشخص إلا بضغطته هو =====
  let seq = 0, making = false;
  function addTray(files) {
    const list = [...files].filter(f => /^image\//.test(f.type) || /\.(jpe?g|png|webp|hei[cf])$/i.test(f.name));
    if (!list.length) return;
    tray.push(...list.map(file => ({k: ++seq, file, name: file.name || 'صورة', url: ''})));
    drawTray(); thumbs();
  }
  async function thumbs() {
    if (making) return; making = true;
    for (let t; (t = tray.find(x => !x.url && !x.bad));) {
      try {
        const {c} = await decode(t.file), s = 200 / Math.min(c.width, c.height), q = document.createElement('canvas');
        q.width = Math.round(c.width * s); q.height = Math.round(c.height * s); q.getContext('2d').drawImage(c, 0, 0, q.width, q.height);
        t.url = URL.createObjectURL(await new Promise(r => q.toBlob(r, 'image/jpeg', .7)));
      } catch (e) {t.bad = 1; dropTray(t.k); toast(`لم تفتح الصورة ${t.name}`);}
      drawTray();
    }
    making = false;
  }
  function dropTray(k, keep) {
    const i = tray.findIndex(t => t.k === k); if (i < 0) return;
    const [t] = tray.splice(i, 1); if (t.url && !keep) URL.revokeObjectURL(t.url);
    drawTray();
  }
  function drawTray() {
    const box = $('#mtrayBox');
    if (box) {
      box.innerHTML = tray.length ? `<section class="pcard mtray"><div class="mhead"><b>صور الدفعة ${ar(tray.length)}</b><span>لكل رجل في الفرع، اضغط صورته ثم احفظ</span></div>
        <div class="mtrow">${tray.map(t => thumb(t, 0)).join('')}</div><div class="eacts start"><button class="ebtn gold" id="mTrayGo">ابدأ التوزيع</button><button class="ebtn" id="mTrayMore">إضافة صور</button><button class="ebtn" id="mTrayClr">تفريغ</button></div></section>` : '';
      if (tray.length) {
        $('#mTrayGo').onclick = start; $('#mTrayMore').onclick = () => $('#mfiles').click();
        $('#mTrayClr').onclick = () => [...tray].forEach(t => dropTray(t.k));
        box.querySelectorAll('[data-x]').forEach(b => {b.onclick = () => dropTray(+b.dataset.x);});
        box.querySelectorAll('[data-t]').forEach(b => {b.onclick = () => toast('اختر الرجل أولاً: اضغط «ابدأ التوزيع» أو بطاقته');});
      }
    } else drawStrip();
  }

  // ===== إدخال الصور: ملف أو سحب أو لصق =====
  function incoming(files, on) {
    const list = [...files]; if (!list.length) return;
    if (cur && $('#mwork') && list.length === 1) return take(list[0]);
    if (!cur && on && list.length === 1) {flow = null; back = {shown, y: scrollY}; const f = list[0]; location.hash = `#tree/men/${on}`; wanted = f; return;}
    addTray(list);
  }
  let wanted = null;
  document.body.insertAdjacentHTML('beforeend', '<input type="file" id="mfile" accept="image/*" hidden><input type="file" id="mfiles" accept="image/*" multiple hidden>');
  $('#mfile').onchange = e => {incoming(e.target.files); e.target.value = '';};
  $('#mfiles').onchange = e => {addTray(e.target.files); e.target.value = '';};
  addEventListener('paste', e => {
    if (!inMen()) return;
    const f = [...(e.clipboardData && e.clipboardData.files || [])].filter(x => /^image\//.test(x.type));
    if (f.length) {e.preventDefault(); incoming(f);}
  });
  const hasFiles = e => e.dataTransfer && [...e.dataTransfer.types].includes('Files');
  addEventListener('dragover', e => {if (inMen() && hasFiles(e)) {e.preventDefault(); document.body.classList.add('mdrag');}});
  addEventListener('dragleave', e => {if (!e.relatedTarget) document.body.classList.remove('mdrag');});
  addEventListener('drop', e => {
    document.body.classList.remove('mdrag');
    if (!inMen() || !hasFiles(e)) return;
    e.preventDefault();
    const c = e.target.closest && e.target.closest('.mcard');
    incoming(e.dataTransfer.files, c && +c.dataset.id);
  });
  addEventListener('keydown', e => {
    if (!inMen() || !cur || !cur.crop || $('#emodal') && !$('#emodal').hidden) return;
    if (e.key === 'Enter' && !/^(BUTTON|A)$/.test(e.target.tagName)) {e.preventDefault(); save();}
    if (e.key === 'Escape') {cur.crop = null; cur.item = null; drawWork();}
  });
  addEventListener('beforeunload', e => {if (tray.length) {e.preventDefault(); e.returnValue = '';}});

  // ===== نسخة من صور العرض: ملف zip يُفك داخل v7 عند النقل، حتى لا تضيع مع المتصفح =====
  const CRC = Array.from({length: 256}, (_, n) => {for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1; return n >>> 0;});
  const crc32 = u => {let c = -1; for (let i = 0; i < u.length; i++) c = CRC[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0;};
  function zipBlob(files) {
    const out = [], dir = [], enc = new TextEncoder(); let off = 0;
    const head = (sig, name, u, crc, extra) => {
      const b = new DataView(new ArrayBuffer(extra ? 46 : 30)); let i = 0;
      const w = (v, n) => {n === 2 ? b.setUint16(i, v, true) : b.setUint32(i, v, true); i += n;};
      w(sig, 4); if (extra) w(20, 2); w(20, 2); w(0x800, 2); w(0, 2); w(0, 2); w(33, 2); w(crc, 4); w(u.length, 4); w(u.length, 4); w(name.length, 2); w(0, 2);
      if (extra) {w(0, 2); w(0, 2); w(0, 2); w(0, 4); w(off, 4);}
      return b.buffer;
    };
    for (const [path, u] of files) {
      const name = enc.encode(path), crc = crc32(u);
      dir.push(head(0x02014b50, name, u, crc, true), name);
      const h = head(0x04034b50, name, u, crc); out.push(h, name, u); off += h.byteLength + name.length + u.length;
    }
    const size = dir.reduce((n, x) => n + x.byteLength, 0), e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, size, true); e.setUint32(16, off, true);
    return new Blob([...out, ...dir, e.buffer], {type: 'application/zip'});
  }
  async function zip() {
    const ids = Object.keys(have), files = [], list = {};
    for (let i = 0; i < ids.length; i++) {
      progress('جارٍ تجهيز النسخة…', i + 1, ids.length);
      const u = new Uint8Array(await (await fetch(Store.menUrl(ids[i], have[ids[i]]))).arrayBuffer());
      list[ids[i]] = [...new Uint8Array(await crypto.subtle.digest('SHA-256', u))].slice(0, 5).map(b => b.toString(16).padStart(2, '0')).join('');
      files.push([`photos/${ids[i]}.jpg`, u]);
    }
    files.push(['photos/index.json', new TextEncoder().encode(JSON.stringify(list) + '\n')]);
    const a = document.createElement('a'); a.href = URL.createObjectURL(zipBlob(files)); a.download = 'صور-الرجال.zip'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 30000); closeModal();
  }

  return {
    show(sub) {
      if (!sub) return grid();
      if (flow && !flow.fresh) flow = null;   // فتح شخصاً بعينه من خارج التسلسل
      if (flow) flow.fresh = false;
      entry(+sub).then(() => {if (wanted) {const f = wanted; wanted = null; take(f);}});
    },
  };
})();
