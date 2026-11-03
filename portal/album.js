// مجلة التغطية: تحوّل صور أي مناسبة إلى مجلة تتقلّب صفحاتها (نفس قارئ المجلات)
// الصفحات تُبنى من الصور حسب أبعادها: صورة كاملة، صورتان، صورة كبيرة وصغيرتان…
// StPageFlip يقلّب من اليسار لليمين، فنعطيه الصفحات بالعكس مثل reader.js
(async () => {
  const Q = new URLSearchParams(location.search), id = +Q.get('id');
  const EMBED = Q.get('embed') === '1' && window.parent !== window;
  if (EMBED) document.body.classList.add('embed');
  const stage = $('#stage'), zone = $('#zone'), shift = $('#shift'), bookEl = $('#book');
  const miss = () => {$('#intro').remove(); $('#miss').hidden = false; document.body.classList.add('nomag');};
  const COVS = 'news.html?c=' + encodeURIComponent('مناسبات الاسرة');
  let posts;
  try {posts = await loadJSON('data/posts.json');} catch (e) {return miss();}
  const pi = posts.findIndex(p => p.id === id);
  if (pi < 0 || !window.St) return miss();
  const p = posts[pi];
  $('#bBack').href = `post.html?id=${id}`;
  const [bundle, man] = await Promise.all([
    loadJSON(`data/posts/${Math.floor(pi / 50)}.json`).catch(() => ({})),
    fetch(`data/albums/${id}.json?v=1`).then(r => r.ok ? r.json() : null).catch(() => null)]);
  const f = bundle[id] || {h: ''};

  // ===== النص والمعلومات =====
  const T = parseTitle(p.t);
  const box = document.createElement('div'); box.innerHTML = f.h || '';
  const htmlPics = [], seenK = new Set();
  const key = u => (u || '').split('?')[0].split('/').pop().replace(/\.\w+$/, '').replace(/-(\d+x\d+|large|medium|thumbnail)$/, '').replace(/-scaled$/, '');
  box.querySelectorAll('img').forEach(im => {
    const a = im.closest('a'), big = a && /\.(jpe?g|png|webp)(\?|$)/i.test(a.getAttribute('href') || '') ? a.getAttribute('href') : im.getAttribute('src');
    const k = key(big); if (big && !seenK.has(k)) {seenK.add(k); htmlPics.push(big);}
    (a || im).remove();
  });
  box.querySelectorAll('iframe,video,script,style').forEach(e => e.remove());
  const paras = [...box.querySelectorAll('p,h1,h2,h3,h4,li')].map(e => e.textContent.replace(/[\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, '').replace(/\s+/g, ' ').trim()).filter(Boolean)
    .filter(t => !(t.length < 40 && /(صور|فيديو|مقطع|رابط)/.test(t) && /(المناسبة|الحفل|الزواج|الفيديو|التالي)/.test(t)) && !/^صور من (المناسبة|الحفل)\s*:?$/.test(t) && !/^(الموقع|رابط الموقع)\s*:?$/.test(t) && !/^https?:/.test(t));
  let sal = '';
  if (paras[0] && /^السلام عليكم/.test(paras[0]) && paras[0].length < 60) sal = paras.shift();
  const BLESS = /^(بارك الله|إن+ّ?ا لله|ألف مبروك|نسأل الله|اللهم|رحمه الله|رحمها الله|غفر الله|جعله الله|مبروك|هنيئ|تقبل الله|تقبّل الله|عساكم)/;
  let quote = '';
  const qi = paras.length - 1 - paras.slice().reverse().findIndex(t => BLESS.test(t) && t.length < 140);
  if (qi < paras.length && qi >= Math.max(0, paras.length - 3)) {quote = paras[qi]; paras.splice(qi, 1);}
  const txt = paras.join(' ');
  const HM = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
  const dig = s => s.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const nt = dig(txt);
  const hj = nt.match(/(1[34]\d\d)\s*\/\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*(?:هـ|ﮪ|ه)/), gr = nt.match(/(20\d\d)\s*\/\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*م/);
  const dayM = txt.match(/(?:يوم|ليلة)\s*(السبت|الأحد|الاحد|الإثنين|الاثنين|الثلاثاء|الأربعاء|الاربعاء|الخميس|الجمعة)/);
  const hDate = hj && +hj[2] >= 1 && +hj[2] <= 12 ? `${ar(+hj[3])} ${HM[+hj[2] - 1]} ${ar(+hj[1])}هـ` : '';
  const [py, pm, pd] = p.d.split('-').map(Number);
  const gDate = gr && +gr[2] <= 12 ? `${ar(+gr[3])} ${MONTHS[+gr[2] - 1]} ${ar(+gr[1])}م` : `${ar(pd)} ${MONTHS[pm - 1]} ${ar(py)}م`;
  const day = dayM ? dayM[1].replace('الاحد', 'الأحد').replace('الاثنين', 'الإثنين').replace('الاربعاء', 'الأربعاء') : '';
  let venue = '', hall = '';
  const ven = txt.match(/(?:في|ب)\s*((?:فندق|قاعة|قاعات|قصر|قصور|نادي|استراحة|منزل|جامع|مركز|دار|مزرعة|منتجع|مجلس)\s[^،.؛\n]{2,60}?)(?=\s*(?:[،.؛]|وسط|بحضور|وذلك|$))/);
  if (ven) {
    venue = ven[1].trim();
    const h = venue.match(/^(.*?)\s*\(([^)]+)\)\s*$/); if (h) {venue = h[1]; hall = h[2];}
    if (venue.length > 42) venue = '';
  }
  const wed = /زواج|زفاف|عرس|عريس/.test(p.t), eid = /عيد (الفطر|الأضحى|الاضحى)/.test(p.t);
  const blessing = wed ? 'بارك الله لهما وبارك عليهما وجمع بينهما في خير' : eid ? 'تقبّل الله منا ومنكم صالح الأعمال، وكل عام وأنتم بخير' : 'أدام الله على الأسرة أفراحها ومسرّاتها';
  if (!quote && wed && !paras.some(t => t.startsWith('بارك الله لهما'))) quote = blessing;
  document.title = `${T.short} · مجلة التغطية | أسرة العجلان والعيد`;
  $('#rt').textContent = T.short;

  // ===== الصور: من ملف الألبوم (الأبعاد والنسخ الجاهزة) أو نقيسها هنا =====
  let all = [], cov = null;
  const abs = (b, u) => !u ? null : /^https?:/.test(u) ? u : b + u;
  if (man && man.imgs) {
    const mk = a => ({full: abs(man.base, a[0]), w: a[1], h: a[2], mid: abs(man.base, a[3]), sm: abs(man.base, a[4]), k: a[5]});
    all = man.imgs.map(mk);
    if (man.cover && !/^phonto/i.test(man.cover[5]) && man.cover[1] >= 300) cov = mk(man.cover);
  } else {
    $('#itxt').textContent = 'جارٍ ترتيب الصور…';
    const fi = f.i || p.i;
    const list = [...htmlPics]; if (fi && !seenK.has(key(fi))) list.unshift(fi);
    const dims = await probeAll(list);
    all = list.map((u, j) => ({full: u, w: dims[j] ? dims[j][0] : 1500, h: dims[j] ? dims[j][1] : 1000, k: key(u)})).filter((x, j) => dims[j] && !/\.svg/i.test(x.full));
    const c = fi && all.find(x => x.k === key(fi));
    if (c && !/^phonto/i.test(c.k)) cov = c;
  }
  if (!cov) cov = all.find(x => x.h > x.w * 1.1) || all[0];
  // لقطة شاشة جوال (طويلة جداً) لا تصلح غلافاً: نختار صورة من الألبوم
  if (cov && cov.w / cov.h < .56) cov = all.find(x => x.w / x.h >= .6 && x.w / x.h <= .9) || all.find(x => x.w / x.h > .9 && x.w / x.h < 1.6) || cov;
  if (!cov) return miss();
  const gal = all.filter(x => x.k !== cov.k);
  const photos = [cov, ...gal];              // ترقيم العارض: الغلاف أولاً
  photos.forEach((x, j) => {x.n = j; x.a = x.w / x.h;});
  $('#rs').textContent = `${hDate || gDate}`;

  // ===== تخطيط الصفحات: نظام شبكي ثابت مثل كتب الصور المطبوعة =====
  // الصفحة ١٠٠ × ١٤١٫٤ وحدة، هوامش ثابتة (جانبي ٨، علوي ١٢، سفلي ١١) وفاصل ٢٫٤ في كل مكان.
  // كل إطار = مجموعة خلايا من شبكة معيارية (٢×٤، ٣×٣، ٢×٣، ٣×٢، ٢×٥) — التفاصيل في planAlbum أسفل الملف فتتكرر نفس المقاسات في المجلة كلها،
  // وكل صورة تملأ إطارها حتى الحافة (قصّ محدود)، والصور تُجمع حسب اتجاهها في صفحات تناسبها.
  const LAYOUT = planAlbum(gal, {wide: innerWidth >= 700});
  const {PW, PH, X0, Y0, CW, G, LAY} = LAYOUT, plan = LAYOUT.plan;
  // ترقيم العارض يتبع ترتيب الصفحات (بعد تجميع الصور حسب اتجاهها) فيتنقّل العارض كما تتقلّب المجلة
  {const seq = [cov, ...plan.flatMap(pl => pl.ims)];
    if (seq.length === photos.length) {photos.length = 0; seq.forEach((x, j) => {x.n = j; photos.push(x);});}}

  // ===== بناء الصفحات =====
  const run = `<div class="rh"><b>أسرة العجلان والعيد</b><i></i><span>${esc(T.short)}</span></div>`;
  const folio = (n, dark) => `<div class="fo${dark ? ' dk' : ''}"><b>${ar(n)}</b><span>${esc(T.short)}</span></div>`;
  const pct = (v, t) => (v / t * 100).toFixed(3) + '%';
  // الصورة تملأ الإطار دائماً؛ إن كانت أطول من الإطار نُبقي أعلاها (الوجوه)، وإن كانت أعرض نقصّ من الجانبين بالتساوي
  const fig = (im, s, opt = {}) => {
    const [x, y, w, h] = s, r = w / h;
    const pos = im.a < r ? `50% ${im.a < r * .9 ? 22 : 30}%` : '50% 50%';
    return `<figure class="ph${opt.bleed ? ' bl' : ''}" data-n="${im.n}" style="left:${pct(x, PW)};top:${pct(y, PH)};width:${pct(w, PW)};height:${pct(h, PH)}">
      <img alt="" draggable="false" decoding="async" data-w="${w}" data-h="${h}" style="object-fit:cover;object-position:${pos}"></figure>`;
  };
  const pages = [];   // {cls, html, imgs:[n], hard}
  // الغلاف
  const cr = 1 - Math.min(cov.a, PW / PH) / Math.max(cov.a, PW / PH);
  const nameCls = T.name.length <= 20 ? 'xl' : T.name.length <= 30 ? 'l' : T.name.length <= 44 ? 'm' : 's';
  pages.push({cls: 'cv front', hard: 1, imgs: [cov.n], html: `
    <figure class="ph cvph" data-n="${cov.n}"><img alt="" draggable="false" data-w="100" data-h="141.4" style="object-position:${cov.a > .8 ? '50% 30%' : '50% 6%'}"></figure>
    <div class="cvshade"></div>
    <header class="mast">
      <div class="mtop"><span>${wed ? 'عدد خاص · أفراح الأسرة' : eid ? 'عدد خاص · أعياد الأسرة' : 'عدد خاص · مناسبات الأسرة'}</span><i></i><span>${esc(gDate)}</span></div>
      <div class="mname"><img src="img/logo-mark.png" alt=""><h2><b>أسرة العجلان</b> <b>والعيد</b></h2></div>
    </header>
    <div class="cvt">
      <div class="cline"><span>تغطية خاصة</span></div>
      ${T.kind ? `<div class="ckind">${esc(T.kind)}</div>` : ''}
      <h1 class="cname ${nameCls}">${esc(T.name)}</h1>
      ${T.sub ? `<div class="csub">${esc(T.sub)}</div>` : ''}
      <div class="crule"><i></i><b></b><i></i></div>
      <div class="cmeta">${[day && `<span>${day}</span>`, hDate && `<span>${hDate}</span>`, `<span>${gDate}</span>`].filter(Boolean).join('<em>·</em>')}</div>
      ${venue ? `<div class="cven"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>${esc(venue)}${hall ? `<em>${esc(hall)}</em>` : ''}</div>` : ''}
    </div>
    `});
  // افتتاحية: النص
  const body = paras.length ? paras : [`صور ${p.t}`];
  const lead = body[0].match(/^(\S+)\s+([\s\S]*)$/);
  pages.push({cls: 'ed', imgs: [], html: `${run}
    <div class="edin" id="edin">
      <div class="ekick"><span>تغطية خاصة</span><i></i></div>
      <h1 class="ehead">${T.kind ? `<small>${esc(T.kind)}</small>` : ''}${esc(T.name)}</h1>
      ${T.sub ? `<div class="esub">${esc(T.sub)}</div>` : ''}
      <div class="edeck">${[day, hDate, gDate].filter(Boolean).map(esc).join(' · ')}${venue ? `<br>${esc(venue)}${hall ? ` · ${esc(hall)}` : ''}` : ''}</div>
      ${sal ? `<p class="esal">${esc(sal)}</p>` : ''}
      <div class="ebody">${body.map((t, k) => k === 0 && lead ? `<p class="lede"><span class="iw">${esc(lead[1])}</span> ${esc(arD(lead[2]))}</p>` : `<p>${esc(arD(t))}</p>`).join('')}</div>
      ${quote ? `<blockquote class="pq"><span>${esc(quote)}</span></blockquote>` : ''}
      <dl class="efacts">
        <div><dt>التاريخ</dt><dd>${esc(hDate || gDate)}</dd></div>
        ${venue ? `<div><dt>المكان</dt><dd>${esc(venue)}</dd></div>` : `<div><dt>اليوم</dt><dd>${esc(day || gDate)}</dd></div>`}
        
      </dl>
    </div>`});
  // عناوين الأقسام
  const HEADS = wed ? [['عدسة المناسبة', 'أجواء الفرح'], ['من الحفل', 'تهانٍ وتبريكات'], ['عدسة المناسبة', 'مع الأهل والأحبة'], ['من الحفل', 'لحظات لا تُنسى'], ['عدسة المناسبة', 'فرحة تجمع الأسرة']]
    : eid ? [['عدسة المناسبة', 'فرحة العيد'], ['من المعايدة', 'مع الأهل والأحبة'], ['عدسة المناسبة', 'لقاء الأسرة'], ['من المعايدة', 'لحظات العيد']]
    : [['عدسة المناسبة', 'من أجواء المناسبة'], ['من الحفل', 'مع الأهل والأحبة'], ['عدسة المناسبة', 'لحظات جميلة'], ['من الحفل', 'لقاء الأسرة']];
  let hk = 0;
  // صفحات الصور
  plan.forEach(pl => {
    if (pl.name === 'spread') {
      const im = pl.ims[0];
      const f = side => `<figure class="ph bl spr ${side}" data-n="${im.n}"><img alt="" draggable="false" decoding="async" data-w="200" data-h="141.4" style="object-fit:cover;object-position:50% 40%"></figure>`;
      pages.push({cls: 'pp lay-spread isbleed', imgs: [im.n], html: f('sr1')});
      pages.push({cls: 'pp lay-spread isbleed', imgs: [im.n], html: f('sl1')});
      return;
    }
    const L = LAY[pl.name];
    let html;
    if (L.solo) html = `${run}${fig(pl.ims[0], pl.s[0])}<div class="orn"><i></i><b></b><i></i></div>`;
    else html = (L.bleed ? '' : run) + pl.ims.map((im, s) => fig(im, L.s[s], {bleed: L.bleed})).join('');
    if (L.head) {const [k, t] = pl.end ? ['ختام التغطية', 'لحظات لا تُنسى'] : HEADS[hk++ % HEADS.length];
      html += `<div class="shd" style="top:${pct(Y0, PH)};height:${pct(L.head - Y0 - G, PH)}"><span>${k}</span><h3>${t}</h3><div class="orn2"><i></i><b></b><i></i></div></div>`;}
    pages.push({cls: 'pp lay-' + pl.name + (L.bleed ? ' isbleed' : ''), imgs: pl.ims.map(x => x.n), html});
  });
  // الختام (إن احتجنا لعدد زوجي) والغلاف الخلفي
  const closing = {cls: 'end', imgs: [], html: `<div class="endin">
      <img src="img/logo-mark.png" alt="">
      <div class="eorn"><i></i><b></b><i></i></div>
      <p class="ebl">${esc(blessing)}</p>
      <p class="ent">نهاية التغطية</p>
      <a class="elink" href="post.html?id=${id}">اقرأ الخبر في الموقع</a>
    </div>`};
  if ((pages.length + 1) % 2) pages.push(closing);
  pages.push({cls: 'cv back', hard: 1, imgs: [], html: `<div class="bkin">
      <div class="bkpat"></div>
      <img class="bklogo" src="img/logo-mark.png" alt="">
      <h2><b>أسرة العجلان</b> <b>والعيد</b></h2>
      <div class="bkrule"><i></i><b></b><i></i></div>
      <p class="bkbl">${esc(blessing)}</p>
      <p class="bkt">${esc(T.short)}</p>
      <div class="bkfoot"><span>alajlanandaleid.com</span><i></i><span>مجلة الأسرة المصوّرة · ${esc(gDate)}</span></div>
    </div>`});
  const N = pages.length;
  const P = i => N - i, IX = q => N - q;
  bookEl.innerHTML = pages.map((_, i) => {const q = P(i), pg = pages[q - 1];
    const side = q === 1 ? '' : q % 2 ? ' s-l' : ' s-r';
    return `<div class="pg ${pg.cls}${side}" data-density="${pg.hard ? 'hard' : 'soft'}" data-p="${q}">${pg.html}${q > 1 && q < N && !/^(ed|end)$/.test(pg.cls) ? folio(q, /lay-(bleed|spread)\b/.test(pg.cls)) : q === 2 ? folio(q) : ''}<i class="sp"></i></div>`;}).join('');
  const els = [...bookEl.children];

  // ===== دقة الصور: أصغر نسخة تكفي حجم الخانة × كثافة الشاشة =====
  const dpr = Math.min(3, devicePixelRatio || 1);
  let pagePx = 500;
  const pick = (ph, sw, sh, fitc) => {
    const need = (fitc === 'contain' ? Math.min(sw, sh * ph.a) : Math.max(sw, sh * ph.a)) / PW * pagePx * dpr;   // العرض المطلوب بالبكسل
    if (ph.sm && need <= 768 * 1.05) return ph.sm;
    if (ph.mid && need <= (ph.a >= 1 ? 1536 : 1536 * ph.a) * 1.1) return ph.mid;
    return ph.full;
  };
  const loadPage = i => {
    if (i < 0 || i >= N) return;
    els[i].querySelectorAll('figure.ph img:not([src])').forEach(im => {
      const ph = photos[+im.parentNode.dataset.n];
      im.onload = () => im.classList.add('in');
      im.src = pick(ph, +im.dataset.w, +im.dataset.h, im.style.objectFit);
    });
  };
  const near = (i, k = 3) => {for (let j = i - 1; j <= i + k; j++) loadPage(j); for (let j = i - k; j < i - 1; j++) loadPage(j);};

  // ===== الكتاب =====
  const R = PW / PH, BW = 1000, BH = 1414;
  const fromHash = () => {const x = location.hash.match(/p=(\d+)/); return x ? Math.min(N, Math.max(1, +x[1])) : 1;};
  let land = true, curP = fromHash(), lastO = null, pf = null;
  const fit = () => {
    const r = zone.getBoundingClientRect(), aw = r.width, ah = r.height;
    let pw = Math.min(aw / 2, ah * R);
    land = innerWidth >= 700 && aw / ah > 1.02 && pw * 2 >= 560;
    if (!land) pw = Math.min(aw, ah * R);
    pw = Math.floor(pw); pagePx = pw;
    bookEl.style.width = (land ? pw * 2 : pw) + 'px';
    bookEl.style.minWidth = '0'; bookEl.style.minHeight = '0';
    stage.style.setProperty('--pw', pw + 'px');
    stage.style.setProperty('--ph', Math.round(pw / R) + 'px');
    if (pf) {pf.getSettings().minWidth = land ? 1 : 1e5; pf.update(); place(); fitText();}
  };
  fit();
  pf = new St.PageFlip(bookEl, {
    width: BW / 2, height: BH / 2, size: 'stretch', minWidth: land ? 1 : 1e5, maxWidth: BW * 1.6, minHeight: 100, maxHeight: BH * 1.6,
    showCover: true, usePortrait: true, startPage: IX(fromHash()), maxShadowOpacity: .5, flippingTime: 850,
    mobileScrollSupport: false, swipeDistance: 24, showPageCorners: true, autoSize: true, disableFlipByClick: true,
  });
  pf.loadFromHTML(els);
  bookEl.style.maxWidth = 'none';
  fit();

  const visible = () => {
    const i = pf.getCurrentPageIndex();
    if (pf.getOrientation() === 'portrait') return [P(i)];
    const s = i === 0 ? 0 : (i % 2 ? i : i - 1);
    return (s === 0 ? [0] : [s, s + 1].filter(j => j < N)).map(P).sort((a, b) => a - b);
  };
  function place() {
    const i = pf.getCurrentPageIndex(), pw = parseFloat(stage.style.getPropertyValue('--pw'));
    let x = 0;
    if (pf.getOrientation() === 'landscape') x = i === N - 1 ? pw / 2 : i === 0 ? -pw / 2 : 0;
    shift.style.transform = `translateX(${x}px)`;
    stage.classList.toggle('closed', x !== 0);
  }
  // نص الافتتاحية: يصغر الخط حتى يتسع في الصفحة
  function fitText() {
    const ed = bookEl.querySelector('.edin'); if (!ed || !ed.offsetHeight) return;
    let k = 1.3; ed.style.setProperty('--k', k);
    while (ed.scrollHeight > ed.clientHeight + 1 && k > .62) {k -= .04; ed.style.setProperty('--k', k.toFixed(2));}
    ed.classList.toggle('over', ed.scrollHeight > ed.clientHeight + 1);
  }

  // المصغرات
  const groups = [[1]]; for (let q = 2; q < N; q += 2) groups.push([q, q + 1].filter(x => x <= N)); if (N % 2 === 0) groups.push([N]);
  const thumbOf = q => {const pg = pages[q - 1];
    if (pg.imgs.length) {const ph = photos[pg.imgs[0]]; return `<i class="tt${q === 1 ? ' tc' : ''}"><img data-src="${esc(ph.sm || ph.mid || ph.full)}" alt=""></i>`;}
    return `<i class="tt ${/back|end/.test(pg.cls) ? 'tb' : 'tx'}"></i>`;};
  $('#thumbs').innerHTML = groups.map(g => `<button class="tg" data-p="${g[0]}" aria-label="صفحة ${ar(g[0])}"><span class="tp">${g.slice().reverse().map(thumbOf).join('')}</span><small>${g.map(ar).join('–')}</small></button>`).join('');
  $('#thumbs').onclick = e => {const b = e.target.closest('.tg'); if (b) go(+b.dataset.p);};
  const tcenter = (el, behavior) => {const t = $('#thumbs'), a = el.getBoundingClientRect(), b = t.getBoundingClientRect(); t.scrollBy({left: (a.left + a.width / 2) - (b.left + b.width / 2), behavior});};
  const tio = new IntersectionObserver(es => es.forEach(e => {if (e.isIntersecting) {const im = e.target; im.src = im.dataset.src; tio.unobserve(im);}}), {root: $('#thumbs'), rootMargin: '0px 300px'});
  const prog = $('#prog'); prog.max = N;
  const setPct = a => prog.style.setProperty('--pct', ((a - 1) / (N - 1) * 100).toFixed(1) + '%');

  const ui = () => {
    if (pf.getOrientation() !== lastO) {lastO = pf.getOrientation(); if (!visible().includes(curP)) pf.turnToPage(IX(curP));}
    const v = visible(), i = pf.getCurrentPageIndex();
    near(i);
    const a = v[0], b = v[v.length - 1]; curP = a;
    $('#cnt').textContent = a === 1 ? `الغلاف · ${ar(N)} صفحة` : a === N ? 'الغلاف الخلفي' : `${a === b ? ar(a) : ar(a) + '–' + ar(b)} من ${ar(N)}`;
    prog.value = a; setPct(a);
    $('#bPrev').disabled = a === 1; $('#bNext').disabled = b === N;
    document.querySelectorAll('.tg.on').forEach(t => t.classList.remove('on'));
    const on = [...document.querySelectorAll('.tg')].find(t => v.includes(+t.dataset.p));
    if (on) {on.classList.add('on'); if (!$('#thumbs').hidden) tcenter(on, 'smooth');}
    history.replaceState(null, '', a === 1 ? location.pathname + location.search : `#p=${a}`);
    place();
    if (v.includes(2)) requestAnimationFrame(fitText);
  };
  const go = q => {q = Math.min(N, Math.max(1, q)); if (visible().includes(q)) return; near(IX(q), 2); (pf.getOrientation() === 'portrait' ? pf.turnToPage(IX(q)) : pf.flip(IX(q)));};
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
  pf.on('flip', () => {const was = curP; ui(); if (curP !== was && document.body.classList.contains('ready')) $('#hint').classList.add('gone');});
  pf.on('changeOrientation', () => ui());
  pf.on('changeState', e => {
    if (e.data === 'flipping' || e.data === 'user_fold') {
      near(pf.getCurrentPageIndex(), 4);
      if (stage.classList.contains('closed') && e.data === 'flipping') {shift.style.transform = 'translateX(0)'; stage.classList.remove('closed');}
    }
  });
  new ResizeObserver(() => fit()).observe(zone);
  ui();

  // البداية: ننتظر صور الصفحات الظاهرة
  if (document.fonts) document.fonts.ready.then(fitText);
  const firstImgs = visible().flatMap(q => [...els[IX(q)].querySelectorAll('figure.ph img')]);
  await Promise.race([Promise.all(firstImgs.map(im => im.decode ? im.decode().catch(() => {}) : 0)), new Promise(r => setTimeout(r, 4000))]);
  document.body.classList.add('ready');
  setTimeout(() => $('#intro')?.remove(), 900);
  setTimeout(() => near(pf.getCurrentPageIndex(), 6), 1500);

  $('#bNext').onclick = next; $('#bPrev').onclick = prev;
  prog.oninput = () => {const a = +prog.value; setPct(a); $('#cnt').textContent = `صفحة ${ar(a)} من ${ar(N)}`;};
  prog.onchange = () => go(+prog.value);
  addEventListener('hashchange', () => go(fromHash()));

  const thumbs = $('#thumbs'); thumbs.hidden = true;
  $('#bThumbs').onclick = () => {
    thumbs.hidden = !thumbs.hidden; $('#bThumbs').setAttribute('aria-pressed', !thumbs.hidden);
    document.body.classList.toggle('tshow', !thumbs.hidden);
    if (!thumbs.hidden) {thumbs.querySelectorAll('img[data-src]:not([src])').forEach(im => tio.observe(im)); if ($('.tg.on')) tcenter($('.tg.on'), 'instant');}
  };
  if (!document.fullscreenEnabled) $('#bFull').hidden = true;
  $('#bFull').onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {});
  document.addEventListener('fullscreenchange', () => document.body.classList.toggle('fs', !!document.fullscreenElement));

  // ===== عارض الصورة بالحجم الكامل =====
  const lb = $('#lb'), lbi = $('#lbi'), lbst = $('#lbst');
  let cur = 0, tok = 0;
  const lfit = () => {const ph = photos[cur]; if (!ph) return;
    const W = lbst.clientWidth - (innerWidth < 700 ? 16 : 150), H = lbst.clientHeight - 24, sc = Math.min(W / ph.w, H / ph.h, 1.6);
    lbi.style.width = Math.round(ph.w * sc) + 'px'; lbi.style.height = Math.round(ph.h * sc) + 'px';};
  const show = k => {
    cur = (k + photos.length) % photos.length; const my = ++tok, ph = photos[cur];
    $('#lbc').textContent = `صورة ${ar(cur + 1)} من ${ar(photos.length)}`;
    lbi.classList.remove('zoomed'); lb.classList.add('loading'); lfit();
    lbi.src = ph.mid || ph.sm || ph.full;
    const big = new Image(); big.onload = () => {if (my === tok) {lbi.src = ph.full; lb.classList.remove('loading');}}; big.src = ph.full;
    lbi.onload = () => {if (my === tok && lbi.src === (ph.mid || ph.sm || ph.full)) lb.classList.remove('loading');};
    $('#lbDl').href = ph.full;
    [1, -1].forEach(o => {const q = photos[(cur + o + photos.length) % photos.length]; new Image().src = q.mid || q.full;});
  };
  const lopen = k => {lb.hidden = false; document.body.classList.add('zooming'); show(k); $('#zClose').focus({preventScroll: true});};
  const lclose = () => {lb.hidden = true; document.body.classList.remove('zooming'); lbi.removeAttribute('src');};
  // الضغط على صورة (وليس سحب الصفحة) يفتحها
  let down = null;
  bookEl.addEventListener('pointerdown', e => {down = {x: e.clientX, y: e.clientY, t: Date.now()};}, true);
  bookEl.addEventListener('pointerup', e => {
    if (!down) return; const d = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = Date.now() - down.t; down = null;
    if (d > 8 || dt > 600 || pf.getState() !== 'read') return;
    const a = e.target.closest('a[href]'); if (a) {location.href = a.href; return;}
    const fg = e.target.closest('figure.ph'); if (!fg) return;
    if (EMBED) parent.postMessage({album: 'photo', key: photos[+fg.dataset.n].k, n: +fg.dataset.n}, '*'); else lopen(+fg.dataset.n);
  }, true);
  $('#bOpen').onclick = () => {window.top.location.href = `album.html?id=${id}${curP > 1 ? '#p=' + curP : ''}`;};
  if (EMBED) {
    $('#hint').textContent = 'اسحب طرف الصفحة لتقليبها، واضغط أي صورة لعرضها';
    // نبلغ الصفحة الأم بعدد الصفحات والصفحة الحالية
    const tell = () => parent.postMessage({album: 'page', p: curP, N}, '*'); pf.on('flip', tell); tell();
  }
  $('#bZoom').onclick = () => {const v = visible(); const n = v.map(q => pages[q - 1].imgs[0]).find(x => x != null); lopen(n ?? 0);};
  $('#zClose').onclick = lclose;
  $('#lbN').onclick = () => show(cur + 1); $('#lbP').onclick = () => show(cur - 1);
  lbst.addEventListener('click', e => {if (e.target === lbst) lclose();});
  lbi.addEventListener('click', e => {
    if (lbi.classList.contains('zoomed')) return lbi.classList.remove('zoomed');
    const r = lbi.getBoundingClientRect(); lbi.style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`; lbi.classList.add('zoomed');
  });
  lbi.addEventListener('mousemove', e => {if (!lbi.classList.contains('zoomed')) return; const r = lbi.getBoundingClientRect();
    lbi.style.transformOrigin = `${Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100))}% ${Math.min(100, Math.max(0, (e.clientY - r.top) / r.height * 100))}%`;});
  addEventListener('resize', () => {if (!lb.hidden) lfit();});
  let sx = null, sy = 0;
  lbst.addEventListener('touchstart', e => {if (e.touches.length === 1) {sx = e.touches[0].clientX; sy = e.touches[0].clientY;}}, {passive: true});
  lbst.addEventListener('touchend', e => {if (sx == null || lbi.classList.contains('zoomed')) {sx = null; return;}
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(cur + (dx > 0 ? 1 : -1));
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) lclose();});

  addEventListener('keydown', e => {
    if (e.target.matches('input,select')) return;
    if (!lb.hidden) {if (e.key === 'Escape') lclose(); else if (e.key === 'ArrowLeft') show(cur + 1); else if (e.key === 'ArrowRight') show(cur - 1); return;}
    if (e.key === 'ArrowLeft' || e.key === 'PageDown' || e.key === ' ') {e.preventDefault(); next();}
    else if (e.key === 'ArrowRight' || e.key === 'PageUp') {e.preventDefault(); prev();}
    else if (e.key === 'Home') go(1);
    else if (e.key === 'End') go(N);
    else if (e.key === '+' || e.key === '=' || e.key === 'z') $('#bZoom').click();
    else if (e.key === 'f') $('#bFull').click();
    else if (e.key === 'Escape' && !thumbs.hidden) $('#bThumbs').click();
  });
  window.__album = {N, plan: plan.map(x => x.name), pf};
})();

//<plan>
// ===== محرك تخطيط صفحات الصور =====
// نظام شبكي مثل كتب الصور المطبوعة: محتوى الصفحة ٨٤ × ١١٨٫٤ وحدة يُقسم إلى شبكات معيارية بنفس الفاصل:
//   A = عمودان × ٤ صفوف  ← أفقية كبيرة ٨٤×٥٨، أفقية صغيرة ٤٠٫٨×٢٧٫٨، طولية ٤٠٫٨×٥٨، طولية كاملة
//   B = ٣ أعمدة × ٣ صفوف ← طولية صغيرة ٢٦٫٤×٣٧٫٩، طولية كبيرة ٥٥٫٢×٧٨، مربعة عريضة ٨٤×٧٨
//   D = عمودان × ٣ صفوف  ← شبه مربعة ٤٠٫٨×٣٧٫٩، طولية نحيفة ٤٠٫٨×٧٨ (لقطات الجوال)، بانورامية
//   C = ٣ أعمدة × صفّان  ← لقطات شاشة طويلة ٢٦٫٤×٥٨
//   E = عمودان × ٥ صفوف  ← عريضة ١٦:٩ ‏٨٤×٤٥٫٩، صور الجوال الطولية ٤٠٫٨×٦٩٫٩، شبه مربعة ٨٤×٦٩٫٩
// كل صورة تملأ إطارها (قصّ أقصاه ١٩٪ من العرض أي نحو ٩٪ من كل جانب، و٢٠٪ من طول الطولية أغلبه من الأسفل)، والمخطِّط يختار من الصور القادمة
// ما يناسب كل قالب فتتجمع الطولية مع الطولية والأفقية مع الأفقية مع بقاء الترتيب الزمني تقريباً.
function planAlbum(gal, opt = {}) {
  const PW = 100, PH = 141.4, X0 = 8, Y0 = 12, CW = 84, G = 2.4, YB = PH - 11, CH = YB - Y0;
  const GR = {A: [2, 4], B: [3, 3], C: [3, 2], D: [2, 3], E: [2, 5]};
  const cell = (g, [c, r, cs = 1, rs = 1]) => {   // العمود ٠ هو الأيمن (القراءة من اليمين)
    const [nc, nr] = GR[g], cw = (CW - (nc - 1) * G) / nc, rh = (CH - (nr - 1) * G) / nr;
    const w = cs * cw + (cs - 1) * G, h = rs * rh + (rs - 1) * G;
    return [X0 + CW - c * (cw + G) - w, Y0 + r * (rh + G), w, h];
  };
  const cells = (g, r0 = 0) => {const [nc, nr] = GR[g], o = []; for (let r = r0; r < nr; r++) for (let c = 0; c < nc; c++) o.push([c, r]); return o;};
  // [الشبكة، الإطارات بترتيب القراءة [عمود، صف، امتداد أعمدة، امتداد صفوف]، ميل التفضيل، خيارات]
  const TPL = {
    L2: ['A', [[0, 0, 2, 2], [0, 2, 2, 2]], 0],
    L1s4: ['A', [[0, 0, 2, 2], [0, 2], [1, 2], [0, 3], [1, 3]], .03],
    s4L1: ['A', [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2, 2, 2]], .03],
    Ls8: ['A', cells('A'), .1],
    L1P2: ['A', [[0, 0, 2, 2], [0, 2, 1, 2], [1, 2, 1, 2]], -.02],
    P2L1: ['A', [[0, 0, 1, 2], [1, 0, 1, 2], [0, 2, 2, 2]], -.02],
    P4: ['A', [[0, 0, 1, 2], [1, 0, 1, 2], [0, 2, 1, 2], [1, 2, 1, 2]], -.04],
    PsL: ['A', [[0, 0, 1, 2], [1, 0], [1, 1], [0, 2, 2, 2]], .05],
    sPL: ['A', [[0, 0], [1, 0, 1, 2], [0, 1], [0, 2, 2, 2]], .05],
    LPs: ['A', [[0, 0, 2, 2], [0, 2, 1, 2], [1, 2], [1, 3]], .05],
    LsP: ['A', [[0, 0, 2, 2], [0, 2], [1, 2, 1, 2], [0, 3]], .05],
    P2s4: ['A', [[0, 0, 1, 2], [1, 0, 1, 2], [0, 2], [1, 2], [0, 3], [1, 3]], .05],
    s4P2: ['A', [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2, 1, 2], [1, 2, 1, 2]], .05],
    PsPs: ['A', [[0, 0, 1, 2], [1, 0], [1, 1], [0, 2], [1, 2, 1, 2], [0, 3]], .08],
    T1s5: ['A', [[0, 0, 1, 3], [1, 0], [1, 1], [1, 2], [0, 3], [1, 3]], .06],
    s5T1: ['A', [[0, 0], [1, 0, 1, 3], [0, 1], [0, 2], [0, 3], [1, 3]], .06],
    X2: ['A', [[0, 0, 1, 4], [1, 0, 1, 4]], .04],   // لقطات شاشة طويلة جداً
    Pfull: ['A', [[0, 0, 2, 4]], .12],
    Sq1s2: ['A', [[0, 0, 2, 3], [0, 3], [1, 3]], .02],
    s2Sq1: ['A', [[0, 0], [1, 0], [0, 1, 2, 3]], .02],
    W1L1s2: ['A', [[0, 0, 2, 1], [0, 1, 2, 2], [0, 3], [1, 3]], 0],
    P9: ['B', cells('B'), .12],
    P6a: ['B', [[0, 0, 2, 2], [2, 0], [2, 1], [0, 2], [1, 2], [2, 2]], .02],
    P6b: ['B', [[0, 0], [1, 0, 2, 2], [0, 1], [0, 2], [1, 2], [2, 2]], .02],
    P3S: ['B', [[0, 0], [1, 0], [2, 0], [0, 1, 3, 2]], .03],
    SP3: ['B', [[0, 0, 3, 2], [0, 2], [1, 2], [2, 2]], .03],
    WS: ['B', [[0, 0, 3, 1], [0, 1, 3, 2]], 0],
    S6: ['D', cells('D'), .06],
    S1s2: ['D', [[0, 0, 2, 2], [0, 2], [1, 2]], 0],
    s2S1: ['D', [[0, 0], [1, 0], [0, 1, 2, 2]], 0],
    T2S2: ['D', [[0, 0, 1, 2], [1, 0, 1, 2], [0, 2], [1, 2]], .03],
    S2T2: ['D', [[0, 0], [1, 0], [0, 1, 1, 2], [1, 1, 1, 2]], .03],
    TS4: ['D', [[0, 0, 1, 2], [1, 0], [1, 1], [0, 2], [1, 2]], .05],
    T2W: ['D', [[0, 0, 1, 2], [1, 0, 1, 2], [0, 2, 2, 1]], 0],
    WS4: ['D', [[0, 0, 2, 1], [0, 1], [1, 1], [0, 2], [1, 2]], .03],
    T2Q2: ['E', [[0, 0, 1, 3], [1, 0, 1, 3], [0, 3, 1, 2], [1, 3, 1, 2]], .04],
    Q2T2: ['E', [[0, 0, 1, 2], [1, 0, 1, 2], [0, 2, 1, 3], [1, 2, 1, 3]], .04],
    W2w2: ['E', [[0, 0, 2, 2], [0, 2], [1, 2], [0, 3, 2, 2]], 0],
    WS12: ['E', [[0, 0, 2, 2], [0, 2, 2, 3]], .02],
    S12W: ['E', [[0, 0, 2, 3], [0, 3, 2, 2]], .02],
    T2We: ['E', [[0, 0, 1, 3], [1, 0, 1, 3], [0, 3, 2, 2]], 0],
    WT2e: ['E', [[0, 0, 2, 2], [0, 2, 1, 3], [1, 2, 1, 3]], 0],
    Tw3W: ['E', [[0, 0, 1, 3], [1, 0], [1, 1], [1, 2], [0, 3, 2, 2]], .05],
    w3TW: ['E', [[0, 0], [1, 0, 1, 3], [0, 1], [0, 2], [0, 3, 2, 2]], .05],
    T6: ['C', cells('C'), .04],
    T3L: ['C', [[0, 0], [1, 0], [2, 0], [0, 1, 3, 1]], .02],
    LT3: ['C', [[0, 0, 3, 1], [0, 1], [1, 1], [2, 1]], .02],
    // صفحات تفتتح قسماً: العنوان يأخذ الصف الأول من الشبكة
    hL1s2: ['A', [[0, 1, 2, 2], [0, 3], [1, 3]], -.04, 1],
    hs6: ['A', cells('A', 1), .04, 1],
    hP2s2: ['A', [[0, 1, 1, 2], [1, 1, 1, 2], [0, 3], [1, 3]], -.04, 1],
    hSq: ['A', [[0, 1, 2, 3]], .02, 1],
    hP6: ['B', cells('B', 1), 0, 1],
    hPl3: ['B', [[0, 1, 2, 2], [2, 1], [2, 2]], -.04, 1],
    hS4: ['D', cells('D', 1), .02, 1],
    hW2: ['E', [[0, 1, 2, 2], [0, 3, 2, 2]], -.02, 1],
    hT2: ['D', [[0, 1, 1, 2], [1, 1, 1, 2]], .02, 1],
  };
  const LAY = {bleed: {n: 1, bleed: 1, s: [[0, 0, PW, PH]], r: [PW / PH], bias: -.1}, solo: {n: 1, solo: 1}};
  for (const [name, [g, fr, bias, head]] of Object.entries(TPL)) {
    const s = fr.map(f => cell(g, f));
    LAY[name] = {n: s.length, s, g, r: s.map(q => q[2] / q[3]), bias, head: head ? Math.min(...s.map(q => q[1])) : 0};
  }
  const MIRROR = {L1s4: 's4L1', L1P2: 'P2L1', PsL: 'sPL', LPs: 'LsP', P2s4: 's4P2', Sq1s2: 's2Sq1', P6a: 'P6b', P3S: 'SP3', S1s2: 's2S1', T2S2: 'S2T2', T3L: 'LT3', hP2s2: 'hL1s2', WS12: 'S12W', T1s5: 's5T1', T2Q2: 'Q2T2', T2We: 'WT2e', Tw3W: 'w3TW'};
  for (const [a, b] of Object.entries(MIRROR)) MIRROR[b] = a;
  // القصّ: نسبة ما يضيع من الصورة. القصّ من الجانبين أخطر (أطراف صور الجماعات) فحدّه أصغر
  const HC = .19, VC = .205;   // ٩٪ من كل جانب كحد أقصى، والطولية يُقصّ أغلبها من الأسفل، والأفقية لا تُقصّ رأسياً أكثر من ١٣٪
  const cost = (a, r) => {const c = 1 - Math.min(a, r) / Math.max(a, r);
    if (c > (a > r ? HC : a >= 1.3 ? .13 : VC)) return Infinity; return c * 2.4 + Math.max(0, c - .08) * 5 + (a > r ? Math.max(0, c - .12) * 6 : 0);};
  const n0 = gal.length, D = Math.min(3, 2.1 + n0 / 500);   // كثافة مستهدفة: صور أكبر في الألبومات الصغيرة
  const K = 14;                                              // نافذة الصور القادمة التي يجوز تقديمها
  const pool = gal.slice(), plan = [];
  let placed = 0, sinceHead = 3, sinceBleed = 6, sinceSpread = 4, lastHead = '', pages = 0, age = 0, headId = pool[0];
  const soloRect = im => {const maxH = CH - 16; let w = CW, h = CW / im.a; if (h > maxH) {h = maxH; w = h * im.a;}
    return [(PW - w) / 2, Y0 + 3 + (maxH - h) / 2, w, h];};
  // أقل عدد من الصفحات المنفردة يحتاجه ما تبقى من صور (بحث كامل لأن الباقي قليل)
  const TAILN = 10, memo = new Map(), NAMES = Object.keys(TPL);
  const minSolo = rest => {
    if (!rest.length) return 0;
    const key = rest.map(x => x.n).join(','); if (memo.has(key)) return memo.get(key);
    let m = 1 + minSolo(rest.slice(1)) - (cost(rest[0].a, LAY.Pfull.r[0]) < Infinity ? .5 : 0);
    for (const name of NAMES) {const L = LAY[name]; if (L.n > rest.length || (L.head && L.n !== rest.length)) continue;
      const u = new Set();
      for (const r of L.r) {const j = rest.findIndex(x => !u.has(x) && cost(x.a, r) < Infinity); if (j < 0) break; u.add(rest[j]);}
      if (u.size === L.n && u.has(rest[0])) m = Math.min(m, minSolo(rest.filter(x => !u.has(x))));
      if (!m) break;}
    memo.set(key, m); return m;
  };
  while (pool.length) {
    const pg = 3 + pages, right = pg % 2 === 0;
    if (pool[0] !== headId) {headId = pool[0]; age = 0;}
    let win = pool.slice(0, K); const force = age >= 2;
    // إيقاع الكثافة: إن تأخرنا عن المعدل المستهدف نفضّل صفحة بصور أكثر ثم نعود للصور الكبيرة
    const Dt = D + Math.max(-1.2, Math.min(3, (D * pages - placed) * .5));
    // لحظة مصمّمة: صورة عريضة ممتدة على الصفحتين كل بضع صفحات
    if (opt.wide && right && sinceSpread >= 9 && pool.length > 6) {
      const k = [0, 1, 2].find(j => j < win.length && win[j].w >= 1200 && cost(win[j].a, PW * 2 / PH) <= .3 && (!force || j === 0));
      if (k != null) {const [im] = pool.splice(k, 1);
        plan.push({name: 'spread', ims: [im]}); pages += 2; placed++; sinceSpread = 0; sinceHead++; sinceBleed += 2; age++; continue;}
    }
    const facing = !right && plan.length && plan[plan.length - 1].name !== 'spread' ? plan[plan.length - 1].name : null;
    const prevSpread = (right ? plan.slice(-2) : plan.slice(-3, -1)).map(x => x.name);
    const search = win => {let best = null;
    for (const [name, L] of Object.entries(LAY)) {
      if (L.solo || L.n > win.length) continue;
      const last = L.n === pool.length;   // الصفحة الأخيرة يجوز أن تحمل عنوان الختام في أي جهة
      if (L.head && !last && (!right || pg < 4 || sinceHead < 4)) continue;   // عناوين الأقسام تفتتح الصفحة اليمنى فقط وبينها مسافة
      if (L.bleed && (sinceBleed < 7 || facing === 'bleed')) continue;
      // نختار لكل إطار أبكر صورة قادمة تناسبه (أو أنسب واحدة من أول ثلاث مناسبة)
      const used = [], sum = [0];
      let ok = true;
      for (const r of L.r) {
        let pick = -1, pc = Infinity, seen = 0;
        if (force && !used.includes(0) && cost(win[0].a, r) < Infinity && !(L.bleed && win[0].w < 1000)) seen = 9, pick = 0;   // الصورة المؤجلة تأخذ أول إطار يناسبها
        for (let j = 0; j < win.length && seen < 3; j++) {
          if (used.includes(j)) continue;
          let c = cost(win[j].a, r); if (L.bleed && (c > .25 || win[j].w < 1000)) c = Infinity;
          if (c === Infinity) continue;
          seen++; const v = c + .03 * (seen - 1);
          if (v < pc) {pc = v; pick = j;}
        }
        if (pick < 0) {ok = false; break;}
        used.push(pick); sum[0] += cost(win[pick].a, r);
      }
      if (!ok || (force && !used.includes(0))) continue;
      const n = L.n;
      const disp = used.reduce((t, j) => t + j, 0) - n * (n - 1) / 2;
      let score = sum[0] / n + L.bias + .04 * Math.min(9, (n - Dt) ** 2) + .012 * disp + (used.includes(0) ? 0 : .08 * (age + 1));
      if (prevSpread.includes(name)) score += .1;
      let runN = 0; for (let j = plan.length - 1; j >= 0 && plan[j].name === name; j--) runN++;
      if (runN >= 3) score += .07 * (runN - 2);   // تنويع هادئ: لا تتكرر الصفحة نفسها طويلاً
      if (L.head) score += last && (!right || sinceHead < 7) ? .3 : (sinceHead < 7 ? .7 : -.06) + (lastHead === name ? .12 : 0);
      if (facing) score -= MIRROR[facing] === name ? .14 : facing === name ? (MIRROR[name] ? .06 : .14) : 0;   // الصفحتان المتقابلتان متوازنتان (ويُفضَّل التناظر)
      if (facing && LAY[facing].g && LAY[facing].g !== L.g) score += .04;   // خطوط الشبكة نفسها على الصفحتين
      if (facing === 'bleed' && n < 3) score += .2;
      // قرب النهاية: نتجنب ترك صور لا يصلح لها إلا صفحة منفردة
      if (pool.length <= TAILN) {const left = new Set(used.map(j => win[j])); score += .6 * minSolo(pool.filter(x => !left.has(x)));}
      if (!best || score < best.score) best = {name, score, used, end: last && !!L.head && (!right || sinceHead < 7)};
    }
    return best;};
    let best = search(win);
    // صورة مؤجلة لا يناسبها شيء مما يليها (بانوراما مثلاً): نبحث لها عن رفيقات أبعد بدل صفحة منفردة
    if (!best && force && pool.length > K) best = search(win = pool.slice(0, 90));
    if (!best) {const im = pool.shift(); plan.push({name: 'solo', ims: [im], s: [soloRect(im)]});}
    else {
      // ترتيب الصور داخل الصفحة: الإطارات المتشابهة تأخذ الصور بترتيبها الزمني
      const L = LAY[best.name], ims = best.used.map(j => win[j]);
      const byR = {}; L.r.forEach((r, s) => (byR[r.toFixed(3)] ||= []).push(s));
      const out = new Array(L.n);
      Object.values(byR).forEach(slots => {const js = slots.map(s => best.used[s]).sort((a, b) => a - b); slots.forEach((s, k) => out[s] = win[js[k]]);});
      plan.push(best.end ? {name: best.name, ims: out, end: 1} : {name: best.name, ims: out});
      const set = new Set(ims); for (let j = pool.length - 1; j >= 0; j--) if (set.has(pool[j])) pool.splice(j, 1);
      if (L.head) lastHead = best.name;
    }
    const nm = plan[plan.length - 1].name;
    pages++; sinceSpread++; age++; placed += plan[plan.length - 1].ims.length;
    sinceHead = LAY[nm].head ? 0 : sinceHead + 1; sinceBleed = nm === 'bleed' ? 0 : sinceBleed + 1;
  }
  return {PW, PH, X0, Y0, CW, G, LAY, plan};
}
//</plan>

const arD = s => s.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
// عنوان المجلة: «تغطية حفل زواج فلان» ← نوع المناسبة + الاسم
function parseTitle(t) {
  let s = t.replace(/ﮪ/g, 'هـ').replace(/\s+/g, ' ').trim().replace(/^تغطية\s+/, '');
  let m = s.match(/^(?:حفل\s+)?(زواج|زفاف)\s+(.+)$/);
  if (m) {
    let name = m[2], sub = '';
    const k = name.match(/^(.+?)\s+((?:على|علي)\s+(?:كريمة|الابنة|ابنة)\s+.+)$/); if (k) {name = k[1]; sub = k[2];}
    return {kind: m[1] === 'زفاف' ? 'حفل زفاف' : 'حفل زواج', name, sub, short: `${m[1]} ${name}`};
  }
  m = s.match(/^(?:حفل\s+)?(?:معايدة\s+)?(عيد (?:الفطر|الأضحى|الاضحى))(?:\s+المبارك)?\s*(?:لعام\s*)?([\d٠-٩]+\s*هـ)?\s*(.*)$/);
  if (m) {
    const name = `${m[1].replace('الاضحى', 'الأضحى')} المبارك${m[2] ? ' ' + m[2].replace(/\s+/g, '') : ''}`;
    return {kind: 'معايدة الأسرة', name, sub: m[3] || '', short: name};
  }
  m = s.match(/^(.+?)\s+((?:على شرف|في ضيافة|بمنزل|بمجلس|بمناسبة)\s+.+)$/);
  if (m && m[1].length > 6) return {kind: '', name: m[1].replace(/^حفل\s+/, 'حفل '), sub: m[2], short: m[1]};
  return {kind: '', name: s, sub: '', short: s.length > 40 ? s.slice(0, 38) + '…' : s};
}

// قياس أبعاد الصور بسرعة: نقرأ المقاس أول ما يوصل رأس الملف ثم نوقف التحميل
function probeAll(list, conc = 10) {
  const out = new Array(list.length); let k = 0;
  const one = u => new Promise(res => {
    const im = new Image(); let done = false;
    const fin = v => {if (done) return; done = true; clearInterval(t); clearTimeout(to); res(v);};
    const t = setInterval(() => {if (im.naturalWidth) {const v = [im.naturalWidth, im.naturalHeight]; im.src = ''; fin(v);}}, 40);
    const to = setTimeout(() => fin(null), 9000);
    im.onload = () => fin([im.naturalWidth, im.naturalHeight]); im.onerror = () => fin(null);
    im.src = u;
  });
  const worker = async () => {while (k < list.length) {const j = k++; out[j] = await one(list[j]);}};
  return Promise.all(Array.from({length: Math.min(conc, list.length)}, worker)).then(() => out);
}
