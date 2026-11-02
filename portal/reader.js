// قارئ المجلة: تقليب صفحات العدد داخل الموقع (من اليمين لليسار مثل المجلة العربية)
// مكتبة StPageFlip تقلّب من اليسار لليمين، فنعطيها الصفحات بالعكس: آخر صفحة أولاً والغلاف آخراً
(async () => {
  const n = +new URLSearchParams(location.search).get('n');
  const stage = $('#stage'), zone = $('#zone'), shift = $('#shift'), bookEl = $('#book');
  const miss = () => {$('#intro').remove(); $('#miss').hidden = false; document.body.classList.add('nomag');};
  let site, man;
  try {
    [site, man] = await Promise.all([loadJSON('data/site.json'), fetch(`mags/${n}/pages.json`).then(r => r.ok ? r.json() : null).catch(() => null)]);
  } catch (e) {return miss();}
  const mags = [...(site?.magazines || [])].sort((a, b) => b.n - a.n);
  const m = mags.find(x => x.n === n);
  $('#issue').innerHTML = mags.map(x => `<option value="${x.n}"${x.n === n ? ' selected' : ''}>العدد ${ar(x.n)}</option>`).join('');
  $('#issue').onchange = e => {location.href = `reader.html?n=${e.target.value}`;};
  if (!m || !man || !window.St) return miss();

  const N = man.count, R = man.w / man.h, pad = i => String(i).padStart(3, '0');
  const IMG = p => `mags/${n}/p${pad(p)}.webp`, TH = p => `mags/${n}/t/p${pad(p)}.webp`;
  const issueDate = s => {const x = (s || '').match(/^(\S+)\s+\d+,\s*(\d{4})/); return x ? `${x[1]} ${ar(+x[2])}` : (s || '');};
  document.title = `مجلة الأسرة، العدد ${ar(n)} | أسرة العجلان والعيد`;
  $('#rt').textContent = `مجلة الأسرة · العدد ${ar(n)}`;
  $('#rs').textContent = `${issueDate(m.date)} · ${ar(N)} صفحة`;
  $('#bDl').href = man.pdf || m.u;

  // ترتيب المكتبة: الفهرس i = الصفحة N - i
  const P = i => N - i, IX = p => N - p;
  const hard = p => p <= 2 || p >= N - 1;
  bookEl.innerHTML = Array.from({length: N}, (_, i) => {const p = P(i);
    return `<div class="pg${hard(p) ? ' cv' : ''}" data-density="${hard(p) ? 'hard' : 'soft'}" data-p="${p}"><img alt="صفحة ${ar(p)}" draggable="false" decoding="async"><i class="sp"></i></div>`;}).join('');
  const pages = [...bookEl.children];

  // رابط مباشر لصفحة: #p=5
  const fromHash = () => {const x = location.hash.match(/p=(\d+)/); return x ? Math.min(N, Math.max(1, +x[1])) : 1;};
  let land = true, curP = fromHash(), lastO = null;
  const fit = () => {
    const r = zone.getBoundingClientRect(), aw = r.width, ah = r.height;
    let pw = Math.min(aw / 2, ah * R);
    land = innerWidth >= 700 && aw / ah > 1.02 && pw * 2 >= 560;
    if (!land) pw = Math.min(aw, ah * R);
    pw = Math.floor(pw);
    bookEl.style.width = (land ? pw * 2 : pw) + 'px';
    bookEl.style.minWidth = '0'; bookEl.style.minHeight = '0';
    stage.style.setProperty('--pw', pw + 'px');
    stage.style.setProperty('--ph', Math.round(pw / R) + 'px');
    if (pf) {pf.getSettings().minWidth = land ? 1 : 1e5; pf.update(); place();}
  };
  let pf = null;
  fit();
  pf = new St.PageFlip(bookEl, {
    width: man.w / 2, height: man.h / 2, size: 'stretch', minWidth: land ? 1 : 1e5, maxWidth: man.w, minHeight: 100, maxHeight: man.h,
    showCover: true, usePortrait: true, startPage: IX(fromHash()), maxShadowOpacity: .55, flippingTime: 850,
    mobileScrollSupport: false, swipeDistance: 24, showPageCorners: true, autoSize: true,
  });
  pf.loadFromHTML(pages);
  bookEl.style.maxWidth = 'none';
  fit();      // المكتبة تفرض عرض 100%، نرجّع المقاس المحسوب

  // الصفحات الظاهرة الآن (بأرقام المجلة)
  const visible = () => {
    const i = pf.getCurrentPageIndex();
    if (pf.getOrientation() === 'portrait') return [P(i)];
    const s = i === 0 ? 0 : (i % 2 ? i : i - 1);
    return (s === 0 ? [0] : [s, s + 1].filter(j => j < N)).map(P).sort((a, b) => a - b);
  };
  // تحميل الصور القريبة فقط
  const near = (i, k = 6) => {for (let j = Math.max(0, i - k); j <= Math.min(N - 1, i + k); j++) {const im = pages[j].firstChild; if (!im.src) im.src = IMG(P(j));}};
  // الغلاف وحده: نحرك الكتاب للوسط
  function place() {
    const i = pf.getCurrentPageIndex(), pw = parseFloat(stage.style.getPropertyValue('--pw'));
    let x = 0;
    if (pf.getOrientation() === 'landscape') x = i === N - 1 ? pw / 2 : i === 0 ? -pw / 2 : 0;
    shift.style.transform = `translateX(${x}px)`;
    stage.classList.toggle('closed', x !== 0);
  }

  // المصغرات: الغلاف وحده ثم كل صفحتين متقابلتين
  const groups = [[1]]; for (let p = 2; p < N; p += 2) groups.push([p, p + 1].filter(q => q <= N)); if (N % 2 === 0) groups.push([N]);
  $('#thumbs').innerHTML = groups.map(g => `<button class="tg" data-p="${g[0]}" aria-label="صفحة ${ar(g[0])}">
    <span class="tp">${g.map(p => `<img src="${TH(p)}" alt="" loading="lazy" width="74" height="100">`).join('')}</span><small>${g.map(ar).join('–')}</small></button>`).join('');
  $('#thumbs').onclick = e => {const b = e.target.closest('.tg'); if (b) go(+b.dataset.p);};
  // توسيط المصغّر الحالي داخل الشريط فقط (scrollIntoView يحرك الصفحة كلها)
  const tcenter = (el, behavior) => {const t = $('#thumbs'), a = el.getBoundingClientRect(), b = t.getBoundingClientRect();
    t.scrollBy({left: (a.left + a.width / 2) - (b.left + b.width / 2), behavior});};
  const prog = $('#prog'); prog.max = N;
  const pct = a => prog.style.setProperty('--pct', ((a - 1) / (N - 1) * 100).toFixed(1) + '%');

  const ui = () => {
    // تغيّر الاتجاه (جوال/شاشة): نبقى على نفس الصفحة
    if (pf.getOrientation() !== lastO) {lastO = pf.getOrientation(); if (!visible().includes(curP)) pf.turnToPage(IX(curP));}
    const v = visible(), i = pf.getCurrentPageIndex();
    near(i);
    const a = v[0], b = v[v.length - 1]; curP = a;
    $('#cnt').textContent = a === 1 ? `الغلاف · ${ar(N)} صفحة` : a === N ? 'الغلاف الخلفي' : `${a === b ? ar(a) : ar(a) + '–' + ar(b)} من ${ar(N)}`;
    prog.value = a; pct(a);
    $('#bPrev').disabled = a === 1; $('#bNext').disabled = b === N;
    document.querySelectorAll('.tg.on').forEach(t => t.classList.remove('on'));
    const on = [...document.querySelectorAll('.tg')].find(t => v.includes(+t.dataset.p));
    if (on) {on.classList.add('on'); if (!$('#thumbs').hidden) tcenter(on, 'smooth');}
    history.replaceState(null, '', a === 1 ? location.pathname + location.search : `#p=${a}`);
    place();
  };
  const go = p => {
    p = Math.min(N, Math.max(1, p));
    if (visible().includes(p)) return;
    near(IX(p), 2);
    pf.flip(IX(p));
  };
  const next = () => pf.flipPrev(), prev = () => pf.flipNext();

  pf.on('flip', () => {ui(); $('#hint').classList.add('gone');});
  // عند تغيّر الاتجاه (جوال/شاشة) نبقى على نفس الصفحة
  pf.on('changeOrientation', () => ui());
  pf.on('changeState', e => {
    if (e.data === 'flipping' || e.data === 'user_fold') {
      near(pf.getCurrentPageIndex(), 4);
      if (stage.classList.contains('closed') && e.data === 'flipping') {shift.style.transform = 'translateX(0)'; stage.classList.remove('closed');}
    }
  });
  new ResizeObserver(() => fit()).observe(zone);
  ui();

  // البداية: نخفي التحميل لما تجهز صور الصفحات الظاهرة
  const first = visible().map(p => pages[IX(p)].firstChild);
  await Promise.race([Promise.all(first.map(im => im.decode ? im.decode().catch(() => {}) : 0)), new Promise(r => setTimeout(r, 4000))]);
  document.body.classList.add('ready');
  setTimeout(() => $('#intro')?.remove(), 900);

  $('#bNext').onclick = next; $('#bPrev').onclick = prev;
  prog.oninput = () => {const p = +prog.value; pct(p); $('#cnt').textContent = `صفحة ${ar(p)} من ${ar(N)}`;};
  prog.onchange = () => go(+prog.value);
  addEventListener('hashchange', () => go(fromHash()));

  // المصغرات
  const thumbs = $('#thumbs'); thumbs.hidden = true;
  $('#bThumbs').onclick = () => {
    thumbs.hidden = !thumbs.hidden; $('#bThumbs').setAttribute('aria-pressed', !thumbs.hidden);
    document.body.classList.toggle('tshow', !thumbs.hidden);
    if (!thumbs.hidden && $('.tg.on')) tcenter($('.tg.on'), 'instant');
  };

  // ملء الشاشة
  if (!document.fullscreenEnabled) $('#bFull').hidden = true;
  $('#bFull').onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {});
  document.addEventListener('fullscreenchange', () => document.body.classList.toggle('fs', !!document.fullscreenElement));

  // التكبير: الصفحة الظاهرة بدقة كاملة، تتحرك بالسحب
  const zm = $('#zoom'), zpan = $('#zpan'), zin = $('#zin');
  let z = 1, zp = [];
  const zlay = () => {
    const W = zpan.clientWidth - 24, H = zpan.clientHeight - 24, k = zp.length;
    const base = Math.min(W / (k * R), H);       // ارتفاع الصفحة عند الملاءمة
    const h = Math.round(base * z);
    zin.querySelectorAll('img').forEach(im => {im.style.height = h + 'px'; im.style.width = Math.round(h * R) + 'px';});
  };
  const zset = (v, cx = .5, cy = .5) => {
    z = Math.min(4, Math.max(1, v)); zlay();
    zpan.scrollLeft = cx * zpan.scrollWidth - zpan.clientWidth / 2; zpan.scrollTop = cy * zpan.scrollHeight - zpan.clientHeight / 2;
    $('#zOut').disabled = z <= 1; $('#zIn').disabled = z >= 4;
  };
  const zopen = () => {
    zp = visible().slice().reverse();          // اليسار أولاً كما تظهر في المجلة
    zin.innerHTML = zp.map(p => `<img src="${IMG(p)}" alt="صفحة ${ar(p)}" draggable="false">`).join('');
    $('#zcap').textContent = `صفحة ${zp.slice().reverse().map(ar).join('–')}`;
    zm.hidden = false; document.body.classList.add('zooming');
    zset(innerWidth < 700 ? 1 : 1.6, .5, 0);
  };
  const zclose = () => {zm.hidden = true; document.body.classList.remove('zooming'); zin.innerHTML = '';};
  $('#bZoom').onclick = zopen; $('#zClose').onclick = zclose;
  $('#zIn').onclick = () => zset(z + .6, (zpan.scrollLeft + zpan.clientWidth / 2) / zpan.scrollWidth, (zpan.scrollTop + zpan.clientHeight / 2) / zpan.scrollHeight);
  $('#zOut').onclick = () => zset(z - .6, (zpan.scrollLeft + zpan.clientWidth / 2) / zpan.scrollWidth, (zpan.scrollTop + zpan.clientHeight / 2) / zpan.scrollHeight);
  zpan.addEventListener('dblclick', e => {const r = zin.getBoundingClientRect(); zset(z > 1.5 ? 1 : 2.4, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);});
  let drag = null;
  zpan.addEventListener('pointerdown', e => {if (e.pointerType !== 'mouse') return; drag = {x: e.clientX, y: e.clientY, l: zpan.scrollLeft, t: zpan.scrollTop}; zpan.classList.add('grab');});
  addEventListener('pointermove', e => {if (drag) {zpan.scrollLeft = drag.l - (e.clientX - drag.x); zpan.scrollTop = drag.t - (e.clientY - drag.y);}});
  addEventListener('pointerup', () => {drag = null; zpan.classList.remove('grab');});
  addEventListener('resize', () => {if (!zm.hidden) zlay();});

  // لوحة المفاتيح: اليسار = التالي (اتجاه القراءة العربية)
  addEventListener('keydown', e => {
    if (e.target.matches('input,select')) return;
    if (!zm.hidden) {if (e.key === 'Escape') zclose(); else if (e.key === '+' || e.key === '=') $('#zIn').click(); else if (e.key === '-') $('#zOut').click(); return;}
    if (e.key === 'ArrowLeft' || e.key === 'PageDown' || e.key === ' ') {e.preventDefault(); next();}
    else if (e.key === 'ArrowRight' || e.key === 'PageUp') {e.preventDefault(); prev();}
    else if (e.key === 'Home') go(1);
    else if (e.key === 'End') go(N);
    else if (e.key === '+' || e.key === '=' || e.key === 'z') zopen();
    else if (e.key === 'f') $('#bFull').click();
    else if (e.key === 'Escape' && !thumbs.hidden) $('#bThumbs').click();
  });
})();
