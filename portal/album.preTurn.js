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
  $('#rs').textContent = `${hDate || gDate} · ${ar(gal.length + 1)} صورة`;

  // ===== تخطيط الصفحات: شبكة واحدة ثابتة لكل المجلة =====
  // الصفحة ١٠٠ × ١٤١٫٤ وحدة. هوامش ثابتة (جانبي ٨، علوي ١٢، سفلي ١١) وفاصل ٢٫٤ بين الصور
  // كل الصور مطبوعة داخل الإطار نفسه؛ الصورة الكاملة حتى الحافة تُستخدم نادراً وللصفحة كلها فقط
  const PW = 100, PH = 141.4, X0 = 8, Y0 = 12, CW = 84, G = 2.4, YB = PH - 11, CH = YB - Y0;
  const half = (CW - G) / 2, hrow = (CH - G) / 2, sm = 27.2, headH = CH - (sm * 3 + G * 2) - G;
  const XR = X0 + half + G;   // العمود الأيمن (القراءة من اليمين)
  const topH = 56, botH = CH - topH - G;
  const hy = YB - (sm * 3 + G * 2);   // بداية الصور تحت عنوان القسم
  const LAY = {
    bleed: {n: 1, bleed: 1, s: [[0, 0, PW, PH]]},
    stack: {n: 2, s: [[X0, Y0, CW, hrow], [X0, Y0 + hrow + G, CW, hrow]]},
    grid: {n: 4, s: [[XR, Y0, half, hrow], [X0, Y0, half, hrow], [XR, Y0 + hrow + G, half, hrow], [X0, Y0 + hrow + G, half, hrow]]},
    l2p: {n: 3, s: [[X0, Y0, CW, topH], [XR, Y0 + topH + G, half, botH], [X0, Y0 + topH + G, half, botH]]},
    p2l: {n: 3, s: [[XR, Y0, half, botH], [X0, Y0, half, botH], [X0, YB - topH, CW, topH]]},
    sq: {n: 2, s: [[(PW - hrow) / 2, Y0, hrow, hrow], [(PW - hrow) / 2, Y0 + hrow + G, hrow, hrow]]},
    solo: {n: 1, solo: 1},
    // صفحات تفتتح قسماً: عنوان في الأعلى ثم الصور على نفس خطوط الشبكة
    feat: {n: 3, head: 1, s: [[X0, hy, CW, sm * 2 + G], [XR, YB - sm, half, sm], [X0, YB - sm, half, sm]]},
    six: {n: 6, head: 1, s: [0, 1, 2].flatMap(r => [[XR, hy + r * (sm + G), half, sm], [X0, hy + r * (sm + G), half, sm]])},
  };
  const MIRROR = {l2p: 'p2l', p2l: 'l2p'};
  const BIAS = {feat: -.04, six: .05, bleed: -.12, stack: 0, l2p: -.05, p2l: -.05, grid: .02, sq: .12, solo: .6};
  const TOL = .17;
  const fitCost = (a, w, h) => {const r = w / h, c = 1 - Math.min(a, r) / Math.max(a, r); return c <= TOL ? c * 1.6 : 1.2 + c;};
  const perms = n => n === 1 ? [[0]] : perms(n - 1).flatMap(q => Array.from({length: n}, (_, k) => [...q.slice(0, k), n - 1, ...q.slice(k)]));
  const PERM = [0, 1, 2, 3, 4].map(n => n ? perms(n) : []);
  PERM[6] = [[0, 1, 2, 3, 4, 5]];
  const plan = [];
  {
    let i = 0, sinceHead = 3, sinceBleed = 6, sinceSpread = 4, lastHead = '', pages = 0;
    const wide = innerWidth >= 700;   // الصورة الممتدة على صفحتين تناسب عرض الصفحتين معاً
    while (i < gal.length) {
      const pg = 3 + pages, right = pg % 2 === 0;
      // لحظة مصمّمة: صورة عريضة ممتدة على الصفحتين كل بضع صفحات
      if (wide && right && sinceSpread >= 9 && gal.length - i > 6) {
        const k = [0, 1, 2].map(j => i + j).find(j => j < gal.length && gal[j].w >= 1200 && fitCost(gal[j].a, PW * 2, PH) <= TOL * .8);
        if (k != null) {const [im] = gal.splice(k, 1); gal.splice(i, 0, im);
          plan.push({name: 'spread', ims: [im]}); i++; pages += 2; sinceSpread = 0; sinceHead++; sinceBleed += 2; continue;}
      }           // الصفحات الزوجية يمين الكتاب
      const facing = !right && plan.length && plan[plan.length - 1].name !== 'spread' ? plan[plan.length - 1].name : null;
      const prevSpread = right ? plan.slice(-2).map(x => x.name) : plan.slice(-3, -1).map(x => x.name);
      let best = null;
      for (const [name, L] of Object.entries(LAY)) {
        const n = L.n; if (i + n > gal.length) continue;
        if (L.head && (!right || pg < 4)) continue;                  // عناوين الأقسام تفتتح الصفحة اليمنى فقط
        const ims = gal.slice(i, i + n);
        if (L.bleed && (fitCost(ims[0].a, PW, PH) > TOL * 1.6 || sinceBleed < 7)) continue;
        let bc = 1e9, bp = null;
        if (L.solo) {bc = 0; bp = [0];}
        else for (const q of PERM[n]) {let c = 0; q.forEach((k, s) => c += fitCost(ims[k].a, L.s[s][2], L.s[s][3])); if (c < bc) {bc = c; bp = q;}}
        let score = (bc + .42 + BIAS[name] + (prevSpread.includes(name) ? .2 : 0)) / Math.pow(n, .8);
        if (L.head) score += (sinceHead < 5 ? .6 : -.06) + (lastHead === name ? .12 : 0);
        if (facing && (facing === name || MIRROR[facing] === name)) score -= .14;   // الصفحتان المتقابلتان متوازنتان
        if (facing === 'bleed' && name === 'solo') score += .3;
        if (!best || score < best.score) best = {name, score, ims: bp.map(k => ims[k])};
      }
      plan.push(best); i += best.ims.length; pages++; sinceSpread++;
      if (LAY[best.name].head) lastHead = best.name;
      sinceHead = LAY[best.name].head ? 0 : sinceHead + 1; sinceBleed = best.name === 'bleed' ? 0 : sinceBleed + 1;
    }
  }

  // ===== بناء الصفحات =====
  const run = `<div class="rh"><b>أسرة العجلان والعيد</b><i></i><span>${esc(T.short)}</span></div>`;
  const folio = (n, dark) => `<div class="fo${dark ? ' dk' : ''}"><b>${ar(n)}</b><span>${esc(T.short)}</span></div>`;
  const pct = (v, t) => (v / t * 100).toFixed(3) + '%';
  const fig = (im, s, opt = {}) => {
    const [x, y, w, h] = s, r = w / h, c = 1 - Math.min(im.a, r) / Math.max(im.a, r), cover = c <= TOL;
    const pos = im.a > r ? '50% 50%' : '50% 30%';
    return `<figure class="ph${cover ? '' : ' mat'}${opt.bleed ? ' bl' : ''}" data-n="${im.n}" style="left:${pct(x, PW)};top:${pct(y, PH)};width:${pct(w, PW)};height:${pct(h, PH)}">
      <img alt="" draggable="false" decoding="async" data-w="${w}" data-h="${h}" style="object-fit:${cover ? 'cover' : 'contain'};object-position:${pos}"></figure>`;
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
    <div class="cbadge"><b>${ar(gal.length + 1)}</b><span>صورة</span></div>`});
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
        <div><dt>الألبوم</dt><dd>${ar(gal.length + 1)} صورة</dd></div>
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
    if (L.solo) {
      const im = pl.ims[0], a = im.a, maxH = CH - 16;
      let w = CW, h = CW / a; if (h > maxH) {h = maxH; w = h * a;}
      html = `${run}${fig(im, [(PW - w) / 2, Y0 + 3 + (maxH - h) / 2, w, h])}<div class="orn"><i></i><b></b><i></i></div>`;
    } else html = (L.bleed ? '' : run) + pl.ims.map((im, s) => fig(im, L.s[s], {bleed: L.bleed})).join('');
    if (L.head) {const [k, t] = HEADS[hk++ % HEADS.length], top = L.s[0][1];
      html += `<div class="shd" style="top:${pct(Y0, PH)};height:${pct(top - Y0 - G, PH)}"><span>${k}</span><h3>${t}</h3><div class="orn2"><i></i><b></b><i></i></div></div>`;}
    pages.push({cls: 'pp lay-' + pl.name + (L.bleed ? ' isbleed' : ''), imgs: pl.ims.map(x => x.n), html});
  });
  // الختام (إن احتجنا لعدد زوجي) والغلاف الخلفي
  const closing = {cls: 'end', imgs: [], html: `<div class="endin">
      <img src="img/logo-mark.png" alt="">
      <div class="eorn"><i></i><b></b><i></i></div>
      <p class="ebl">${esc(blessing)}</p>
      <p class="ent">نهاية التغطية · ${ar(gal.length + 1)} صورة</p>
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
  const go = q => {q = Math.min(N, Math.max(1, q)); if (visible().includes(q)) return; near(IX(q), 2); pf.flip(IX(q));};
  const next = () => pf.flipPrev(), prev = () => pf.flipNext();
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
