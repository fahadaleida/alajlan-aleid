// سجل الأسرة: كل أخبار الأسرة ومناسباتها ودعواتها في مجلد تتقلّب صفحاته (نفس محرك مجلة التغطية)
// التصفية (القسم، السنة، البحث) تعيد بناء المجلد. StPageFlip يقلّب من اليسار، فنعطيه الصفحات بالعكس.
(async () => {
  const Q = new URLSearchParams(location.search);
  const cat = Q.get('c') || '', q = (Q.get('q') || '').trim(), yr = Q.get('y') || '';
  const stage = $('#stage'), zone = $('#zone'), shift = $('#shift'), bookEl = $('#book');
  const [posts, aidx] = await Promise.all([loadJSON('data/posts.json'), loadJSON('data/albums/index.json').catch(() => ({a: {}}))]);
  const albums = aidx.a || {};
  const CATS = [['', 'الكل'], ['أخبار الاسرة', 'الأخبار'], ['دعوات الأسرة', 'الدعوات'], ['مناسبات الاسرة', 'المناسبات']];
  const LBL = {'': 'أخبار ومناسبات ودعوات الأسرة', 'أخبار الاسرة': 'أخبار الأسرة', 'دعوات الأسرة': 'دعوات الأسرة', 'مناسبات الاسرة': 'مناسبات الأسرة وتغطياتها'};
  const SHORT = {'': '', 'أخبار الاسرة': 'الأخبار', 'دعوات الأسرة': 'الدعوات', 'مناسبات الاسرة': 'المناسبات'};

  // ===== التصفية: أي تغيير يعيد بناء المجلد =====
  const nav = o => {const u = new URLSearchParams(); const c = o.c ?? cat, y = o.y ?? yr, s = o.q ?? q;
    if (c) u.set('c', c); if (y) u.set('y', y); if (s) u.set('q', s); location.href = 'volume.html' + (String(u) ? '?' + u : '');};
  const inYr = p => !yr || p.d.startsWith(yr);
  $('#vcat').innerHTML = CATS.map(([c, t]) => `<button role="tab" data-c="${c}" aria-selected="${c === cat}">${t}<small>${ar(posts.filter(p => (!c || p.c === c) && inYr(p)).length)}</small></button>`).join('');
  $('#vcat').onclick = e => {const b = e.target.closest('[data-c]'); if (b && b.dataset.c !== cat) nav({c: b.dataset.c});};
  const years = [...new Set(posts.map(p => p.d.slice(0, 4)))].sort((a, b) => b - a);
  $('#vyear').innerHTML = `<option value="">كل السنوات</option>` + years.map(y => `<option value="${y}"${y === yr ? ' selected' : ''}>${ar(+y)}</option>`).join('');
  $('#vyear').onchange = e => nav({y: e.target.value});
  $('#vq').value = q;
  $('#vqf').onsubmit = e => {e.preventDefault(); nav({q: $('#vq').value.trim()});};
  $('#bList').href = 'news-list.html' + location.search;
  $('#bFil').onclick = () => {const on = document.body.classList.toggle('filopen'); $('#bFil').setAttribute('aria-pressed', on);};
  if (cat || q || yr) document.body.classList.add('filtered');

  const norm = s => s.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[ً-ْ]/g, '');
  const nq = norm(q);
  const L = posts.filter(p => (!cat || p.c === cat) && inYr(p) && (!nq || norm(p.t + ' ' + p.x + ' ' + p.d).includes(nq)));
  const yrs = [...new Set(L.map(p => p.d.slice(0, 4)))];
  const range = yrs.length ? (yrs.length > 1 ? `${ar(+yrs[yrs.length - 1])}–${ar(+yrs[0])}` : ar(+yrs[0])) : '';
  const vTitle = 'سجل الأسرة' + (SHORT[cat] ? ' · ' + SHORT[cat] : '');
  document.title = `${vTitle} | أسرة العجلان والعيد`;
  $('#rt').textContent = vTitle + (q ? ` · «${q}»` : '');
  $('#rs').textContent = L.length ? `${ar(L.length)} ${L.length > 10 ? 'خبراً' : 'أخبار'} · ${range}` : 'لا توجد نتائج';

  // ===== القصص =====
  const BOOK = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5C6.5 4 9.5 4 12 5.5v14c-2.5-1.5-5.5-1.5-8 0z"/><path d="M20 5.5C17.5 4 14.5 4 12 5.5v14c2.5-1.5 5.5-1.5 8 0z"/></svg>';
  const story = (p, k) => {
    const A = albums[p.id], poster = p.c === 'دعوات الأسرة' || /phonto/i.test(p.i || '');
    const [y, m, d] = p.d.split('-').map(Number);
    const x = (p.x || '').replace(/^\s*السلام عليكم ورحمة الله وبركاته\s*/, '');
    return `<a class="vs vs-${k}" href="post.html?id=${p.id}">
      <figure class="vph"${poster ? ' data-poster="1"' : ''}>${p.i ? `<img data-src="${esc(p.i)}" alt="" draggable="false" decoding="async">` : '<i class="vnoimg"></i>'}</figure>
      <div class="vtx"><span class="vk">${esc(catName(p.c))}</span><h3>${esc(p.t)}</h3>${k === 'tile' ? '' : `<p>${esc(x)}</p>`}
        <div class="vmeta"><time><b>${ar(d)}</b> ${MONTHS[m - 1]} ${ar(y)}</time>${A ? `<span class="vmag" data-album="${p.id}">${BOOK}مجلة · ${ar(A[2])} صورة</span>` : ''}</div></div></a>`;
  };
  const run = y => `<div class="rh"><b>أسرة العجلان والعيد</b><i></i><span>${esc(vTitle)}${y ? ' · ' + ar(+y) : ''}</span></div>`;

  // ===== الصفحات =====
  const pages = [];   // {cls, html, img, hard}
  // الغلاف: المجلد المجلّد، وفي وسطه فسيفساء صغيرة من صور المناسبات حول شعار الأسرة
  const mos = []; const seen = new Set();
  for (const p of [...L.filter(p => albums[p.id]), ...L]) {
    if (mos.length >= 8) break; const a = albums[p.id];
    const u = a ? (/^(https?:|img\/)/.test(a[0]) ? a[0] : aidx.base + a[0]) : p.i;
    if (u && !/phonto/i.test(u) && !seen.has(u)) {seen.add(u); mos.push(u);}
  }
  const tiles = Array.from({length: 9}, (_, k) => k === 4 ? '<i class="vmc"><img src="img/logo-mark.png" alt=""></i>' : (u => u ? `<i class="vmt"><img data-src="${esc(u)}" alt=""></i>` : '<i class="vmt e"></i>')(mos[k < 4 ? k : k - 1]));
  const nCov = L.filter(p => albums[p.id]).length;
  pages.push({cls: 'cv front vcover', hard: 1, html: `<div class="vcvin">
    <div class="vmast"><span>مجلد ${range ? '· ' + range : ''}</span><i></i><span>أرشيف الأسرة</span></div>
    <div class="vname"><img src="img/logo-mark.png" alt=""><b>أسرة العجلان <em>والعيد</em></b></div>
    <div class="vmos">${tiles.join('')}</div>
    <h1>سجل الأسرة</h1>
    <p class="vsub">${esc(LBL[cat])}${q ? ` · بحث «${esc(q)}»` : ''}${yr ? ` · عام ${ar(+yr)}` : ''}</p>
    <div class="vrule"><i></i><b></b><i></i></div>
    <div class="vstats"><div><b>${ar(L.length)}</b><span>${L.length > 10 ? 'خبراً' : 'أخبار'}</span></div><div><b>${ar(yrs.length)}</b><span>${yrs.length > 2 && yrs.length < 11 ? 'سنوات' : 'سنة'}</span></div>${nCov ? `<div><b>${ar(nCov)}</b><span>تغطية مصوّرة</span></div>` : ''}</div>
  </div>`});
  // المحتويات (الأرقام تُملأ بعد بناء الصفحات)
  pages.push({cls: 'vtocpg', html: ''});
  // صفحات الأخبار: لكل سنة صفحة افتتاحية، ثم تخطيطات متنوّعة لا تخلط سنتين في صفحة
  const yearStart = {};
  const PAT = [['A', 3], ['B', 3], ['D', 4], ['B', 3]];
  let i = 0, pi = 0;
  while (i < L.length) {
    const y = L[i].d.slice(0, 4);
    let end = i; while (end < L.length && L[end].d.slice(0, 4) === y) end++;
    const nY = end - i;
    yearStart[y] = pages.length + 1;
    const first = L.slice(i, i + Math.min(2, nY));
    const cnt = c => L.slice(i, end).filter(p => p.c === c).length;
    pages.push({cls: 'vnp', y, img: first[0]?.i, html: `${run(y)}<div class="vin ly"><div class="vyh"><small>سجل عام</small><b>${ar(+y)}</b><div class="vrule"><i></i><b></b><i></i></div>
      <span>${ar(nY)} ${nY > 10 ? 'خبراً' : 'أخبار'}${cat ? '' : ` · ${ar(cnt('أخبار الاسرة'))} خبر · ${ar(cnt('دعوات الأسرة'))} دعوة · ${ar(cnt('مناسبات الاسرة'))} مناسبة`}</span></div>
      ${first.map(p => story(p, 'row')).join('')}</div>`});
    i += first.length;
    while (i < end) {
      let [k, n] = PAT[pi++ % PAT.length]; const left = end - i;
      if (n > left) {n = left; if (k === 'A' && n < 3) k = 'B'; if (k === 'D' && n < 4) k = n === 1 ? 'B' : 'D';}
      const S = L.slice(i, i + n);
      const html = k === 'A' ? `<div class="vin la">${story(S[0], 'big')}<div class="vrow2">${S.slice(1).map(p => story(p, 'sm')).join('')}</div></div>`
        : k === 'D' ? `<div class="vin ld">${S.map(p => story(p, 'tile')).join('')}</div>`
        : `<div class="vin lb">${S.map(p => story(p, 'row')).join('')}</div>`;
      pages.push({cls: 'vnp', y, img: S[0].i, html: run(y) + html}); i += n;
    }
  }
  if (!L.length) pages.push({cls: 'vnp', html: `${run('')}<div class="vin lempty"><img src="img/logo-mark.png" alt=""><h3>لا توجد أخبار بهذه التصفية</h3><p>جرّب كلمة أخرى أو اختر «الكل» و«كل السنوات».</p><span class="vbtn" data-reset="1">عرض السجل كاملاً</span></div>`});
  // جدول المحتويات
  const yy = Object.keys(yearStart).sort((a, b) => b - a);
  pages[1].html = `${run('')}<div class="vin lc"><div class="vct"><small>المحتويات</small><h2>${esc(vTitle)}</h2><div class="vrule"><i></i><b></b><i></i></div>
    <p>${esc(LBL[cat])}${range ? ` من ${range}` : ''}، مرتبة من الأحدث إلى الأقدم. اضغط على أي سنة للانتقال إليها.</p></div>
    <ol class="vtoc">${yy.map(y => {const G = L.filter(p => p.d.startsWith(y));
      return `<li data-go="${yearStart[y]}"><b>${ar(+y)}</b><span>${ar(G.length)} ${G.length > 10 ? 'خبراً' : 'أخبار'}${G.filter(p => albums[p.id]).length ? ` · ${ar(G.filter(p => albums[p.id]).length)} تغطية مصوّرة` : ''}</span><i></i><em>${ar(yearStart[y])}</em></li>`;}).join('') || '<li><span>لا توجد نتائج</span></li>'}</ol>
    ${cat ? '' : `<div class="vcats">${CATS.slice(1).map(([c, t]) => `<span data-cat="${c}"><b>${ar(L.filter(p => p.c === c).length)}</b>${t}</span>`).join('')}</div>`}</div>`;
  if ((pages.length + 1) % 2) pages.push({cls: 'end', html: `<div class="endin"><img src="img/logo-mark.png" alt=""><div class="eorn"><i></i><b></b><i></i></div>
    <p class="ebl">«تعلّموا من أنسابكم ما تصلون به أرحامكم»</p><p class="ent">نهاية ${esc(vTitle)}</p></div>`});
  pages.push({cls: 'cv back', hard: 1, html: `<div class="bkin"><div class="bkpat"></div><img class="bklogo" src="img/logo-mark.png" alt="">
    <h2><b>أسرة العجلان</b> <b>والعيــد</b></h2><div class="bkrule"><i></i><b></b><i></i></div><p class="bkbl">سجل الأسرة</p><p class="bkt">${esc(LBL[cat])}${range ? ' · ' + range : ''}</p>
    <div class="bkfoot"><span>alajlanandaleid.com</span><i></i><span>أرشيف أسرة العجلان والعيد</span></div></div>`});

  const N = pages.length, P = i => N - i, IX = p => N - p;
  const folio = n => `<div class="fo"><b>${ar(n)}</b><span>${esc(vTitle)}</span></div>`;
  bookEl.innerHTML = pages.map((_, i) => {const p = P(i), pg = pages[p - 1], side = p === 1 ? '' : p % 2 ? ' s-l' : ' s-r';
    return `<div class="pg ${pg.cls}${side}" data-density="${pg.hard ? 'hard' : 'soft'}" data-p="${p}">${pg.html}${p > 1 && p < N && pg.cls !== 'end' ? folio(p) : ''}<i class="sp"></i></div>`;}).join('');
  const els = [...bookEl.children];

  // الصور: تحميل الصفحات القريبة فقط، وقص آمن للوجوه، والملصقات كاملة على ورقة بيضاء
  const loadPage = i => {if (i < 0 || i >= N) return;
    els[i].querySelectorAll('img[data-src]:not([src])').forEach(im => {
      im.onload = () => {const f = im.closest('.vph'), a = im.naturalWidth / im.naturalHeight;
        if (f) fillFrame(im, im.closest('[href]')?.getAttribute('href').match(/id=(\d+)/)?.[1]); im.classList.add('in');};
      im.src = im.dataset.src;});};
  const near = (i, k = 3) => {for (let j = i - 1; j <= i + k; j++) loadPage(j); for (let j = i - k; j < i - 1; j++) loadPage(j);};

  // ===== الكتاب (نفس قارئ المجلات) =====
  const R = 100 / 141.4;
  const fromHash = () => {const x = location.hash.match(/p=(\d+)/); return x ? Math.min(N, Math.max(1, +x[1])) : 1;};
  let land = true, curP = fromHash(), lastO = null, pf = null;
  const fit = () => {
    const r = zone.getBoundingClientRect(), aw = r.width, ah = r.height;
    let pw = Math.min(aw / 2, ah * R);
    land = innerWidth >= 700 && aw / ah > 1.02 && pw * 2 >= 560;
    if (!land) pw = Math.min(aw, ah * R);
    pw = Math.floor(pw);
    bookEl.style.width = (land ? pw * 2 : pw) + 'px'; bookEl.style.minWidth = '0'; bookEl.style.minHeight = '0';
    stage.style.setProperty('--pw', pw + 'px'); stage.style.setProperty('--ph', Math.round(pw / R) + 'px');
    if (pf) {pf.getSettings().minWidth = land ? 1 : 1e5; pf.update(); place();}
  };
  fit();
  pf = new St.PageFlip(bookEl, {
    width: 500, height: 707, size: 'stretch', minWidth: land ? 1 : 1e5, maxWidth: 1600, minHeight: 100, maxHeight: 2262,
    showCover: true, usePortrait: true, startPage: IX(fromHash()), maxShadowOpacity: .5, flippingTime: 850,
    mobileScrollSupport: false, swipeDistance: 24, showPageCorners: true, autoSize: true, disableFlipByClick: true,
  });
  pf.loadFromHTML(els);
  bookEl.style.maxWidth = 'none';
  fit();
  const visible = () => {const i = pf.getCurrentPageIndex();
    if (pf.getOrientation() === 'portrait') return [P(i)];
    const s = i === 0 ? 0 : (i % 2 ? i : i - 1);
    return (s === 0 ? [0] : [s, s + 1].filter(j => j < N)).map(P).sort((a, b) => a - b);};
  function place() {const i = pf.getCurrentPageIndex(), pw = parseFloat(stage.style.getPropertyValue('--pw'));
    let x = 0; if (pf.getOrientation() === 'landscape') x = i === N - 1 ? pw / 2 : i === 0 ? -pw / 2 : 0;
    shift.style.transform = `translateX(${x}px)`; stage.classList.toggle('closed', x !== 0);}

  // المصغرات
  const groups = [[1]]; for (let p = 2; p < N; p += 2) groups.push([p, p + 1].filter(x => x <= N)); if (N % 2 === 0) groups.push([N]);
  const th = p => {const pg = pages[p - 1]; return pg.img && /vnp/.test(pg.cls) ? `<i class="tt"><img data-src="${esc(pg.img)}" alt=""></i>` : `<i class="tt ${/cv/.test(pg.cls) ? 'tb' : 'tx'}"></i>`;};
  $('#thumbs').innerHTML = groups.map(g => `<button class="tg" data-p="${g[0]}" aria-label="صفحة ${ar(g[0])}"><span class="tp">${g.slice().reverse().map(th).join('')}</span><small>${g.map(ar).join('–')}</small></button>`).join('');
  $('#thumbs').onclick = e => {const b = e.target.closest('.tg'); if (b) go(+b.dataset.p);};
  const tcenter = (el, behavior) => {const t = $('#thumbs'), a = el.getBoundingClientRect(), b = t.getBoundingClientRect(); t.scrollBy({left: (a.left + a.width / 2) - (b.left + b.width / 2), behavior});};
  const tio = new IntersectionObserver(es => es.forEach(e => {if (e.isIntersecting) {e.target.src = e.target.dataset.src; tio.unobserve(e.target);}}), {root: $('#thumbs'), rootMargin: '0px 300px'});
  const prog = $('#prog'); prog.max = N;
  const setPct = a => prog.style.setProperty('--pct', ((a - 1) / (N - 1) * 100).toFixed(1) + '%');
  const ui = () => {
    if (pf.getOrientation() !== lastO) {lastO = pf.getOrientation(); if (!visible().includes(curP)) pf.turnToPage(IX(curP));}
    const v = visible(), i = pf.getCurrentPageIndex(); near(i);
    const a = v[0], b = v[v.length - 1]; curP = a;
    $('#cnt').textContent = a === 1 ? `الغلاف · ${ar(N)} صفحة` : a === N ? 'الغلاف الخلفي' : `${a === b ? ar(a) : ar(a) + '–' + ar(b)} من ${ar(N)}`;
    prog.value = a; setPct(a);
    $('#bPrev').disabled = a === 1; $('#bNext').disabled = b === N;
    document.querySelectorAll('.tg.on').forEach(t => t.classList.remove('on'));
    const on = [...document.querySelectorAll('.tg')].find(t => v.includes(+t.dataset.p));
    if (on) {on.classList.add('on'); if (!$('#thumbs').hidden) tcenter(on, 'smooth');}
    history.replaceState(null, '', location.pathname + location.search + (a === 1 ? '' : `#p=${a}`));
    place();
  };
  const go = p => {p = Math.min(N, Math.max(1, p)); if (visible().includes(p)) return; near(IX(p), 2); (pf.getOrientation() === 'portrait' ? pf.turnToPage(IX(p)) : pf.flip(IX(p)));};
  // الجوال (صفحة وحدة): مكتبة التقليب ما تقلّب للخلف/للأمام بالحركة في الوضع العمودي، فننتقل بأنفسنا مع انزلاق ناعم
  const turn = d => {   // d = -1 التالي (يمين←يسار)، +1 السابق
    if (pf.getOrientation() !== 'portrait') return d < 0 ? pf.flipPrev() : pf.flipNext();
    const i = pf.getCurrentPageIndex() + d; if (i < 0 || i >= pf.getPageCount() || turn.busy) return;
    turn.busy = 1; const s = d < 0 ? 1 : -1;
    bookEl.animate([{opacity: 1, transform: 'none'}, {opacity: 0, transform: `translateX(${s * 36}px)`}], {duration: 150, easing: 'ease-in'}).onfinish = () => {
      pf.turnToPage(i);
      bookEl.animate([{opacity: 0, transform: `translateX(${-s * 36}px)`}, {opacity: 1, transform: 'none'}], {duration: 230, easing: 'ease-out'}).onfinish = () => {turn.busy = 0;};
    };
  };
  const next = () => turn(-1), prev = () => turn(1);
  {let sw = null;   // السحب على الجوال
    bookEl.addEventListener('pointerdown', e => {sw = pf.getOrientation() === 'portrait' ? {x: e.clientX, y: e.clientY} : null;}, true);
    bookEl.addEventListener('pointerup', e => {if (!sw) return; const dx = e.clientX - sw.x, dy = e.clientY - sw.y; sw = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) dx > 0 ? next() : prev();}, true);}
  const refill = () => setTimeout(() => bookEl.querySelectorAll('img[data-fill]').forEach(im => im.complete && fillFrame(im, im.dataset.fill)), 60);
  pf.on('flip', refill); addEventListener('resize', refill);
  pf.on('flip', () => {const was = curP; ui(); if (curP !== was && document.body.classList.contains('ready')) $('#hint').classList.add('gone');});
  pf.on('changeOrientation', () => ui());
  pf.on('changeState', e => {if (e.data === 'flipping' || e.data === 'user_fold') {near(pf.getCurrentPageIndex(), 4);
    if (stage.classList.contains('closed') && e.data === 'flipping') {shift.style.transform = 'translateX(0)'; stage.classList.remove('closed');}}});
  new ResizeObserver(() => fit()).observe(zone);
  ui();
  const firstImgs = visible().flatMap(p => [...els[IX(p)].querySelectorAll('img[src]')]);
  await Promise.race([Promise.all(firstImgs.map(im => im.decode ? im.decode().catch(() => {}) : 0)), new Promise(r => setTimeout(r, 3000))]);
  document.body.classList.add('ready');
  setTimeout(() => $('#intro')?.remove(), 900);
  setTimeout(() => near(pf.getCurrentPageIndex(), 6), 1500);

  $('#bNext').onclick = next; $('#bPrev').onclick = prev;
  prog.oninput = () => {const a = +prog.value; setPct(a); $('#cnt').textContent = `صفحة ${ar(a)} من ${ar(N)}`;};
  prog.onchange = () => go(+prog.value);
  addEventListener('hashchange', () => go(fromHash()));
  const thumbs = $('#thumbs'); thumbs.hidden = true;
  $('#bThumbs').onclick = () => {thumbs.hidden = !thumbs.hidden; $('#bThumbs').setAttribute('aria-pressed', !thumbs.hidden);
    if (!thumbs.hidden) {thumbs.querySelectorAll('img[data-src]:not([src])').forEach(im => tio.observe(im)); if ($('.tg.on')) tcenter($('.tg.on'), 'instant');}};
  if (!document.fullscreenEnabled) $('#bFull').hidden = true;
  $('#bFull').onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {});
  document.addEventListener('fullscreenchange', () => document.body.classList.toggle('fs', !!document.fullscreenElement));

  // الضغط (وليس سحب الصفحة): خبر ← صفحته، مجلة ← التغطية، سنة في المحتويات ← صفحتها
  let down = null;
  bookEl.addEventListener('pointerdown', e => {down = {x: e.clientX, y: e.clientY, t: Date.now()};}, true);
  bookEl.addEventListener('pointerup', e => {
    if (!down) return; const d = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = Date.now() - down.t; down = null;
    if (d > 8 || dt > 700 || pf.getState() !== 'read') return;
    const t = e.target;
    // الحواف تقلّب (يسار = التالي، يمين = السابق)، والغلاف بأي مكان يفتح المجلد؛ الوسط يفتح الخبر
    const r = bookEl.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width;
    const later = f => setTimeout(f, 30);
    if (curP === 1) return later(next);
    if (fx < .22) return later(next); if (fx > .78) return later(prev);
    const g = t.closest('[data-go]'); if (g) return go(+g.dataset.go);
    const m = t.closest('[data-album]'); if (m) {location.href = `album.html?id=${m.dataset.album}`; return;}
    const c = t.closest('[data-cat]'); if (c) return nav({c: c.dataset.cat});
    if (t.closest('[data-reset]')) {location.href = 'volume.html'; return;}
    const a = t.closest('a[href]'); if (a) location.href = a.href;
  }, true);
  bookEl.addEventListener('click', e => {if (e.target.closest('a')) e.preventDefault();});

  addEventListener('keydown', e => {
    if (e.target.matches('input,select')) return;
    if (e.key === 'ArrowLeft' || e.key === 'PageDown' || e.key === ' ') {e.preventDefault(); next();}
    else if (e.key === 'ArrowRight' || e.key === 'PageUp') {e.preventDefault(); prev();}
    else if (e.key === 'Home') go(1); else if (e.key === 'End') go(N);
    else if (e.key === 'f') $('#bFull').click();
    else if (e.key === 'Escape' && !thumbs.hidden) $('#bThumbs').click();
  });
  window.__vol = {N, pf, go};
})();
