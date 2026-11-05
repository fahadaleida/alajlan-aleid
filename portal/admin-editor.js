// محرر الموقع: لوحة واحدة، أربعة أقسام، وشاشة واحدة لكل خبر. كل نشر يمر عبر GH.commit (admin-gh.js)
const Editor = (() => {
  const TYPES = [['خبر', 'أخبار الاسرة', 'news'], ['مناسبة', 'مناسبات الاسرة', 'film'], ['دعوة', 'دعوات الأسرة', 'mail']];
  const OCC = 'مناسبات الاسرة', NOIMG = 'img/logo-full.png', SM_BUDGET = 450;
  const today = () => {const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;};
  const view = () => $('#view');
  const S = {posts: [], idx: {a: {}}, site: {}, refresh: () => {}};   // بيانات اللوحة بعد آخر نشر
  Object.assign(IC, {chev: '<path d="M9 6l6 6-6 6"/>', chevl: '<path d="M15 6l-6 6 6 6"/>', plus: '<path d="M12 5v14M5 12h14"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    cam: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"/><circle cx="12" cy="13.5" r="3.8"/>'});
  let lastList = '#news';
  const imgOf = p => {const a = S.idx.a[p.id]; return a ? (/^(https?:|img\/)/.test(a[0]) ? a[0] : S.idx.base + a[0]) : p.i;};
  const norm = s => s.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[ً-ْ]/g, '');
  const clean = s => s.replace(/[\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, '').replace(/[ \t\u00a0]+/g, ' ').trim();
  const head = (title, back = '#', sub = '') => `<header class="ebar"><a class="eback" href="${back}">${svg('chev', 18)}<span>رجوع</span></a><div><h2>${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ''}</div></header>`;
  const say = e => {
    if (e && e.status === 401) return 'مفتاح النشر لم يعد يعمل. جدّده من «الحساب والربط» ثم انشر من جديد، وعملك محفوظ.';
    if (e && e.status === 0) return 'الاتصال بالإنترنت منقطع. تأكد من الشبكة ثم حاول مرة أخرى، وعملك محفوظ.';
    if (e && (e.status === 403 || e.status === 404)) return 'مفتاح النشر لا يملك صلاحية الكتابة في المستودع. جدّده من «الحساب والربط».';
    return (e && e.note) || 'حدث خطأ أثناء النشر. حاول مرة أخرى بعد قليل، وعملك محفوظ.';
  };

  // ===== نافذة التقدّم والنتيجة =====
  const modal = html => {let m = $('#emodal'); if (!m) {document.body.insertAdjacentHTML('beforeend', '<div class="emodal" id="emodal" role="dialog" aria-modal="true"><div class="ebox" id="ebox"></div></div>'); m = $('#emodal');} $('#ebox').innerHTML = html; m.hidden = false; return $('#ebox');};
  const closeModal = () => {const m = $('#emodal'); if (m) m.hidden = true;};
  const confirmBox = (title, text, yes, no = 'تراجع') => new Promise(res => {
    const b = modal(`<h3>${esc(title)}</h3><p>${esc(text)}</p><div class="eacts"><button class="ebtn danger" id="mYes">${esc(yes)}</button><button class="ebtn" id="mNo">${esc(no)}</button></div>`);
    $('#mYes', b).onclick = () => {closeModal(); res(true);}; $('#mNo', b).onclick = () => {closeModal(); res(false);}; $('#mNo', b).focus();
  });
  const progress = (t, n, of) => {
    const m = $('#emodal'), pct = of ? Math.round(n / of * 100) : 0;
    if (!m || m.hidden || !$('#mbar')) modal(`<h3 id="mt"></h3><div class="ebarp" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i id="mbar"></i></div><p id="ms"></p><small>لا تقفل هذه الصفحة حتى يكتمل النشر.</small>`);
    $('#mt').textContent = t; $('#mbar').style.width = (of ? pct : 100) + '%'; $('#mbar').classList.toggle('run', !of);
    $('#ms').textContent = of ? `${ar(n)} من ${ar(of)}` : ' ';
  };
  // نشاهد الملف في الموقع نفسه: لا نقول «ظهر» إلا لما نراه فعلاً
  async function watchLive(path, text, el) {
    for (let k = 0; k < 40 && el.isConnected; k++) {
      await GH.sleep(k ? 8000 : 4000);
      const t = await fetch(path, {cache: 'no-cache'}).then(r => r.ok ? r.text() : '').catch(() => '');
      if (t === text) {if (el.isConnected) {el.textContent = 'ظهر الآن على الموقع.'; el.classList.add('live');} return;}
    }
    if (el.isConnected) el.textContent = 'لم يظهر بعد وقد يتأخر قليلاً. لا تحتاج إلى النشر مرة أخرى.';
  }
  const done = (title, link, linkText, path, text, back) => {
    const b = modal(`<div class="eok">${svg('check', 30)}</div><h3>${esc(title)}</h3><p id="mlive">${path ? 'يظهر على الموقع خلال دقيقة تقريباً.' : 'تقدر الآن تنشر من أي جهاز باسمك وكلمة مرورك.'}</p>
      <div class="eacts">${link ? `<a class="ebtn gold" href="${esc(link)}" target="_blank" rel="noopener">${esc(linkText)}</a>` : ''}<button class="ebtn" id="mDone">تم</button></div>`);
    $('#mDone', b).onclick = () => {closeModal(); location.hash = back;};
    if (path) watchLive(path, text, $('#mlive', b));
  };
  const needConnect = () => {
    const b = modal(`<h3>النشر غير مربوط بعد</h3><p>اربط الموقع مرة واحدة فقط، ثم تستطيع النشر من أي جهاز.</p><div class="eacts"><a class="ebtn gold" href="#connect" id="mGo">ربط النشر</a><button class="ebtn" id="mNo">لاحقاً</button></div>`);
    $('#mGo', b).onclick = closeModal; $('#mNo', b).onclick = closeModal;
  };

  // ===== قائمة الأخبار (والتغطيات: نفس القائمة بفلتر) =====
  function listView(kind) {
    const covers = kind === 'covers'; lastList = '#' + kind;
    const all = covers ? S.posts.filter(p => p.c === OCC || S.idx.a[p.id]) : S.posts;
    view().innerHTML = `${head(covers ? 'مجلات التغطيات' : 'الأخبار والمناسبات', '#', covers ? 'كل مناسبة فيها صور تصير مجلة تلقائياً' : '')}
      <div class="etop"><a class="ebtn big gold" href="#new${covers ? '/occ' : ''}">${svg('plus', 20)}إضافة جديد</a>
      <label class="esearch">${svg('search', 18)}<input id="eq" type="search" placeholder="ابحث في ${ar(all.length)} عنصر" aria-label="بحث"></label></div>
      <div class="erows" id="erows"></div><div class="emore" id="emore"></div>`;
    let q = '', shown = 40;
    const draw = () => {
      const nq = norm(q.trim()), L = nq ? all.filter(p => norm(p.t + ' ' + p.d).includes(nq)) : all;
      $('#erows').innerHTML = L.slice(0, shown).map(p => `<a class="erow" href="#edit/${p.id}"><img src="${esc(imgOf(p))}" alt="" loading="lazy">
        <span><b>${esc(p.t)}</b><small>${fmtDate(p.d)} · ${esc(catName(p.c))}</small></span>${S.idx.a[p.id] ? '<em>مجلة</em>' : ''}${svg('chevl', 16)}</a>`).join('') || '<p class="eempty">لا توجد نتائج.</p>';
      $('#emore').innerHTML = L.length > shown ? `<button class="ebtn" id="emoreB">عرض المزيد</button>` : '';
      if (L.length > shown) $('#emoreB').onclick = () => {shown += 60; draw();};
    };
    $('#eq').oninput = e => {q = e.target.value; shown = 40; draw();};
    draw();
  }

  // ===== شاشة الخبر =====
  let D = null, saveT = 0, pvT = 0, pvReady = false, pvPage = 1, pending = 0, total = 0, failed = [], uid = 0;
  const sig = () => JSON.stringify([D.photos.map(p => p.key), D.cover]);
  const metaOf = () => ({postId: D.postId, type: D.type, title: D.title, date: D.date, text: D.text, cover: D.cover, orig: D.orig,
    photos: D.photos.filter(p => p.key).map(({key, w, h, isNew, ref, name, shaF, shaS}) => ({key, w, h, isNew, ref, name, shaF, shaS}))});
  const dirty = () => !D.postId ? !!(D.title || D.text || D.photos.length) : D.title !== D.orig.title || D.date !== D.orig.date || D.type !== D.orig.type || D.text !== D.orig.text || sig() !== D.orig.sig;
  const touch = () => {
    clearTimeout(saveT);
    saveT = setTimeout(() => {if (!D) return; if (dirty()) {Draft.meta(metaOf()); const s = $('#esaved'); if (s) s.textContent = 'محفوظ تلقائياً على هذا الجهاز';}}, 400);
    clearTimeout(pvT); pvT = setTimeout(preview, 900);
  };

  function editorHtml() {
    const edit = !!D.postId;
    return `${head(edit ? 'تعديل' : 'إضافة جديد', D.back)}
    <div class="eform">
      <div class="ecol">
        <div class="etypes" role="radiogroup" aria-label="النوع">${TYPES.map(([t, , ic]) => `<button type="button" role="radio" aria-checked="${t === D.type}" data-t="${t}" class="${t === D.type ? 'on' : ''}">${svg(ic, 24)}<span>${t}</span></button>`).join('')}</div>
        <label class="ef"><span>العنوان</span><input id="fT" value="${esc(D.title)}" maxlength="160" placeholder="مثال: حفل زواج علي بن عبدالله العيد"></label>
        <p class="eerr" id="fErr" hidden></p>
        <label class="ef"><span>التاريخ</span><input id="fD" type="date" value="${esc(D.date)}"></label>
        <label class="ef"><span>نص قصير <small>اختياري</small></span><textarea id="fX" rows="3" placeholder="مثال: احتفلت الأسرة يوم الأربعاء في قاعة عبية نجد… (اسم اليوم والقاعة يظهران على غلاف المجلة)">${esc(D.text)}</textarea></label>
        <div class="edrop" id="drop" tabindex="0" role="button" aria-label="إضافة صور">
          ${svg('cam', 34)}<b>أسقط الصور هنا</b><span>أو اضغط لاختيارها من جهازك</span>
          <input id="fF" type="file" accept="image/*,.heic,.heif" multiple hidden>
        </div>
        <div class="eprog" id="eprog" hidden><div class="ebarp"><i id="pbar"></i></div><span id="ptxt"></span></div>
        <div class="efails" id="efails" hidden></div>
        <p class="ehint" id="ehint" hidden>اضغط أي صورة لتكون الغلاف، واسحبها لتغيير ترتيبها.</p>
        <div class="ethumbs" id="ethumbs"></div>
      </div>
      <aside class="epv"><div class="epvh"><b>معاينة المجلة</b><small id="epvc"></small></div>
        <div class="epvb" id="epvb"><div class="epve" id="epve">${svg('mag', 40)}<span>أضف صوراً وتظهر المجلة هنا</span></div></div></aside>
    </div>
    <div class="epub"><span id="esaved"></span>${edit ? '<button class="ebtn danger ghost" id="eDel">حذف</button>' : ''}<button class="ebtn big gold" id="ePub">${edit ? 'حفظ ونشر' : 'نشر'}</button></div>`;
  }
  const tile = p => `<div class="eth${p.key && p.key === D.cover ? ' cov' : ''}${p.key ? '' : ' wait'}" data-u="${p.u}" tabindex="0" role="button" aria-label="${esc(p.name || 'صورة')}">
    ${p.url ? `<img src="${esc(p.url)}" alt="" draggable="false" loading="lazy" decoding="async">` : '<i class="espin"></i>'}
    <em>الغلاف</em><button type="button" class="ex" aria-label="حذف الصورة">${svg('x', 15)}</button></div>`;
  const drawThumbs = () => {$('#ethumbs').innerHTML = D.photos.map(tile).join(''); syncCounts();};
  const syncCounts = () => {
    const n = D.photos.filter(p => p.key).length;
    $('#ehint').hidden = n < 1; $('#epvc').textContent = n ? `${ar(n)} صورة` : '';
    const bar = $('#eprog');
    if (pending > 0) {bar.hidden = false; $('#pbar').style.width = (total - pending) / total * 100 + '%'; $('#ptxt').textContent = `جارٍ تجهيز الصور: ${ar(total - pending)} من ${ar(total)}`;}
    else {bar.hidden = true; total = 0;}
    const pub = $('#ePub'); if (pub) pub.disabled = pending > 0;
    const f = $('#efails');
    f.hidden = !failed.length;
    f.innerHTML = failed.length ? `<div><b>لم تُضف ${ar(failed.length)} ${failed.length === 1 ? 'صورة' : 'صور'}، وبقية الصور سليمة:</b><button type="button" id="fClr">إخفاء</button></div><ul>${failed.slice(0, 8).map(([n, w]) => `<li><bdi>${esc(n)}</bdi>: ${esc(w)}</li>`).join('')}${failed.length > 8 ? `<li>و${ar(failed.length - 8)} غيرها</li>` : ''}</ul>` : '';
    if (failed.length) $('#fClr').onclick = () => {failed = []; syncCounts();};
  };

  function addFiles(files) {
    const list = [...files]; if (!list.length) return;
    pending += list.length; total += list.length;
    list.forEach(file => {
      const p = {u: ++uid, name: file.name, isNew: true}, me = D; D.photos.push(p);
      $('#ethumbs').insertAdjacentHTML('beforeend', tile(p));
      Photos.add(file, async (r, reason) => {
        if (me !== D) return;
        pending--;
        const el = document.querySelector(`.eth[data-u="${p.u}"]`);
        const drop = why => {D.photos.splice(D.photos.indexOf(p), 1); if (el) el.remove(); if (why) failed.push([file.name, why]);};
        if (!r) drop(reason);
        else if (D.photos.some(x => x.key === r.key)) drop('الصورة مكررة وموجودة من قبل');
        else {
          Object.assign(p, {key: r.key, w: r.w, h: r.h, full: r.full, sm: r.sm, url: URL.createObjectURL(r.sm)});
          Draft.photo(p.key, {full: r.full, sm: r.sm});
          if (!D.cover) D.cover = p.key;
          if (el) {el.outerHTML = tile(p);}
        }
        syncCounts(); touch();
      });
    });
    syncCounts();
  }

  // السحب لتغيير الترتيب: فأرة مباشرة، وباللمس بعد ضغطة قصيرة حتى لا يتعارض مع تمرير الصفحة
  function sortable(box) {
    let drag = null, ghost = null, start = null, timer = 0, scroller = 0;
    const begin = (el, x, y) => {
      drag = el; const r = el.getBoundingClientRect();
      ghost = el.cloneNode(true); ghost.classList.add('ghost'); ghost.style.width = r.width + 'px'; ghost.style.height = r.height + 'px';
      document.body.appendChild(ghost); el.classList.add('drag'); moveTo(x, y);
      if (navigator.vibrate) navigator.vibrate(12);
    };
    const moveTo = (x, y) => {
      ghost.style.transform = `translate(${x - ghost.offsetWidth / 2}px,${y - ghost.offsetHeight / 2}px) scale(1.06)`;
      const over = document.elementFromPoint(x, y), t = over && over.closest('.eth');
      if (t && t !== drag && t.parentNode === box) {const k = [...box.children], a = k.indexOf(drag), b = k.indexOf(t); box.insertBefore(drag, a < b ? t.nextSibling : t);}
      scroller = y < 70 ? -12 : y > innerHeight - 70 ? 12 : 0;
    };
    const end = () => {
      clearTimeout(timer); start = null; scroller = 0;
      if (!drag) return;
      drag.classList.remove('drag'); ghost.remove(); drag = ghost = null;
      const by = new Map(D.photos.map(p => [p.u, p]));
      D.photos = [...box.children].map(e => by.get(+e.dataset.u)).filter(Boolean);
      touch();
    };
    const tick = () => {if (drag && scroller) scrollBy(0, scroller); if (box.isConnected) requestAnimationFrame(tick);};
    requestAnimationFrame(tick);
    const tap = e => {
      const t = e.target.closest('.eth'); if (!t) return;
      const p = D.photos.find(x => x.u === +t.dataset.u);
      if (e.target.closest('.ex')) {
        D.photos.splice(D.photos.indexOf(p), 1); t.remove();
        if (p && p.isNew && p.key) Draft.drop(p.key);
        if (p && D.cover === p.key) {D.cover = (D.photos.find(x => x.key) || {}).key || null; const c = D.cover && box.querySelector(`[data-u="${D.photos.find(x => x.key === D.cover).u}"]`); if (c) c.classList.add('cov');}
        syncCounts(); touch(); return;
      }
      if (p && p.key) {box.querySelectorAll('.cov').forEach(c => c.classList.remove('cov')); t.classList.add('cov'); D.cover = p.key; touch();}
    };
    box.addEventListener('click', e => tap(e));
    box.addEventListener('keydown', e => {if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('eth')) {e.preventDefault(); tap(e);}});
    box.addEventListener('mousedown', e => {const t = e.target.closest('.eth'); if (t && !e.target.closest('.ex') && e.button === 0) {start = {t, x: e.clientX, y: e.clientY}; e.preventDefault();}});
    const mm = e => {if (!box.isConnected) return off(); if (drag) moveTo(e.clientX, e.clientY); else if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) begin(start.t, e.clientX, e.clientY);};
    const mu = () => {if (drag) {const b = box; const stop = ev => {ev.stopPropagation(); ev.preventDefault();}; b.addEventListener('click', stop, {capture: true, once: true}); setTimeout(() => b.removeEventListener('click', stop, true), 50);} end();};
    const off = () => {removeEventListener('mousemove', mm); removeEventListener('mouseup', mu);};
    addEventListener('mousemove', mm); addEventListener('mouseup', mu);
    box.addEventListener('touchstart', e => {
      const t = e.target.closest('.eth'); if (!t || e.target.closest('.ex') || e.touches.length > 1) return;
      const c = e.touches[0]; start = {t, x: c.clientX, y: c.clientY};
      timer = setTimeout(() => {if (start) begin(t, start.x, start.y);}, 240);
    }, {passive: true});
    box.addEventListener('touchmove', e => {
      const c = e.touches[0];
      if (drag) {e.preventDefault(); moveTo(c.clientX, c.clientY);}
      else if (start && Math.hypot(c.clientX - start.x, c.clientY - start.y) > 10) {clearTimeout(timer); start = null;}
    }, {passive: false});
    box.addEventListener('touchend', e => {if (drag) e.preventDefault(); end();});
    box.addEventListener('touchcancel', end);
    box.addEventListener('contextmenu', e => {if (e.target.closest('.eth')) e.preventDefault();});
  }

  // المعاينة: نفس album.html ونفس planAlbum، تأخذ البيانات من الذاكرة بدل الملفات
  const textHtml = t => t.split(/\n+/).map(clean).filter(Boolean).map(l => `<p>${esc(l)}</p>`).join('\n');
  const preview = () => {
    if (!D || !$('#epvb')) return;
    const has = D.photos.some(p => p.key), box = $('#epvb'), empty = $('#epve');
    empty.hidden = has;
    let fr = $('#epvf');
    if (!has) {if (fr) fr.remove(); pvReady = false; return;}
    if (!fr) {box.insertAdjacentHTML('beforeend', '<iframe id="epvf" title="معاينة المجلة"></iframe>'); fr = $('#epvf');}
    pvReady = false;
    fr.src = `album.html?id=-1&embed=1&preview=1&r=${Date.now()}${pvPage > 1 ? '#p=' + pvPage : ''}`;
  };
  const pvData = () => {
    const mk = p => [p.url, p.w, p.h, 0, 0, p.key], ok = D.photos.filter(p => p.key), c = ok.find(p => p.key === D.cover) || ok[0];
    return {post: {id: -1, t: D.title || 'عنوان الخبر', d: D.date || today(), c: catOf(D.type), x: '', i: ''}, h: textHtml(D.text), man: {id: -1, v: 1, base: '', cover: mk(c), imgs: ok.map(mk)}};
  };
  const catOf = t => TYPES.find(x => x[0] === t)[1];
  addEventListener('message', e => {
    if (e.origin !== location.origin || !e.data || !D) return;
    const fr = $('#epvf'); if (!fr || e.source !== fr.contentWindow) return;
    if (e.data.album === 'ready') fr.contentWindow.postMessage({albumPreview: pvData()}, location.origin);
    if (e.data.album === 'page') pvPage = e.data.p;
  });

  function mountEditor() {
    document.body.classList.add('editing');
    view().innerHTML = editorHtml();
    drawThumbs();
    const bind = (id, k) => {$(id).oninput = e => {D[k] = e.target.value; touch();};};
    bind('#fT', 'title'); bind('#fD', 'date'); bind('#fX', 'text');
    $('#fT').addEventListener('input', () => {$('#fErr').hidden = true;});
    $('.etypes').onclick = e => {const b = e.target.closest('button'); if (!b) return; D.type = b.dataset.t;
      $('.etypes').querySelectorAll('button').forEach(x => {const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', on);}); touch();};
    const drop = $('#drop'), inp = $('#fF');
    drop.onclick = e => {if (e.target !== inp) inp.click();};
    drop.onkeydown = e => {if (e.key === 'Enter' || e.key === ' ') {e.preventDefault(); inp.click();}};
    inp.onchange = () => {addFiles(inp.files); inp.value = '';};
    ['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => {e.preventDefault(); drop.classList.add('over');}));
    ['dragleave', 'drop'].forEach(t => drop.addEventListener(t, e => {e.preventDefault(); drop.classList.remove('over');}));
    drop.addEventListener('drop', e => addFiles(e.dataTransfer.files));
    sortable($('#ethumbs'));
    $('#ePub').onclick = publish;
    if ($('#eDel')) $('#eDel').onclick = removePost;
    preview();
  }
  const blank = (type = 'خبر') => ({postId: null, type, title: '', date: today(), text: '', photos: [], cover: null, orig: {}, back: lastList});

  async function openNew(occ) {
    if (!GH.connected) return location.replace('#connect');
    if (await offerDraft()) return;
    D = blank(occ ? 'مناسبة' : 'خبر'); failed = []; mountEditor();
  }
  // نص الخبر بدون صور، للعرض في الحقل
  const bodyText = h => {
    const b = document.createElement('div'); b.innerHTML = h || '';
    b.querySelectorAll('img,iframe,video,figure,script,style').forEach(e => e.remove());
    const L = [...b.querySelectorAll('p,h1,h2,h3,h4,li')].map(e => clean(e.textContent)).filter(t => t && !/^صور من (المناسبة|الحفل)\s*:?$/.test(t));
    return (L.length ? L.join('\n') : clean(b.textContent));
  };
  const picsOf = h => {
    const b = document.createElement('div'); b.innerHTML = h || ''; const out = [];
    b.querySelectorAll('img').forEach(im => {const a = im.closest('a'), u = a && /\.(jpe?g|png|webp)(\?|$)/i.test(a.getAttribute('href') || '') ? a.getAttribute('href') : im.getAttribute('src'); if (u && !out.includes(u)) out.push(u);});
    return out;
  };
  const sizeOf = u => new Promise(res => {const i = new Image(); i.onload = () => res([i.naturalWidth, i.naturalHeight]); i.onerror = () => res(null); i.src = u;});
  const keyOf = u => u.split('?')[0].split('/').pop().replace(/\.\w+$/, '');

  async function openEdit(id) {
    if (!GH.connected) return location.replace('#connect');
    if (await offerDraft(id)) return;
    view().innerHTML = `${head('تعديل', '#news')}<p class="eempty">جارٍ فتح الخبر…</p>`;
    try {
      const snap = await GH.snapshot(), posts = await snap.json('data/posts.json'), i = posts.findIndex(p => p.id === id);
      if (i < 0) {view().innerHTML = `${head('تعديل', '#news')}<p class="eempty">هذا الخبر لم يعد موجوداً.</p>`; return;}
      const p = posts[i], f = (await snap.json(`data/posts/${Math.floor(i / 50)}.json`))[id] || {h: ''}, man = await snap.json(`data/albums/${id}.json`);
      let photos = [], cover = null;
      const abs = (b, u) => !u ? 0 : /^https?:/.test(u) ? u : b + u;
      if (man) {
        const mk = a => ({key: a[5] || keyOf(a[0]), w: a[1], h: a[2], ref: [abs(man.base, a[0]), abs(man.base, a[3]), abs(man.base, a[4])]});
        photos = man.imgs.map(mk);
        if (man.cover) {cover = mk(man.cover); if (!photos.some(x => x.key === cover.key)) photos.unshift(cover);}
      } else {
        const L = picsOf(f.h), sz = await Promise.all(L.map(sizeOf));
        photos = L.map((u, j) => sz[j] && {key: keyOf(u), w: sz[j][0], h: sz[j][1], ref: [u, 0, 0]}).filter(Boolean);
      }
      const seen = new Set(); photos = photos.filter(x => !seen.has(x.key) && seen.add(x.key));
      photos.forEach(x => {x.u = ++uid; x.url = x.ref[2] || x.ref[1] || x.ref[0];});
      const type = (TYPES.find(t => t[1] === p.c) || TYPES[0])[0];
      D = {postId: id, type, title: p.t, date: p.d, text: bodyText(f.h), photos, cover: (cover || photos[0] || {}).key || null, back: lastList};
      D.orig = {title: D.title, date: D.date, type, text: D.text, sig: sig()};
      failed = []; mountEditor();
    } catch (e) {view().innerHTML = `${head('تعديل', '#news')}<p class="eempty">${esc(say(e))}</p>`;}
  }

  // ===== المسودة =====
  async function restoreDraft(m) {
    D = {...m, back: lastList, photos: []};
    for (const p of m.photos) {
      const x = {...p, u: ++uid};
      if (p.isNew) {const b = await Draft.blobs(p.key); if (!b) continue; Object.assign(x, b, {url: URL.createObjectURL(b.sm)});}
      else x.url = p.ref[2] || p.ref[1] || p.ref[0];
      D.photos.push(x);
    }
    if (!D.photos.some(p => p.key === D.cover)) D.cover = (D.photos[0] || {}).key || null;
    failed = []; mountEditor();
  }
  const draftLabel = m => `«${m.title || 'بدون عنوان'}»${m.photos.length ? ` ومعها ${ar(m.photos.length)} صورة` : ''}`;
  // لو فيه مسودة، نسأل قبل البدء بشيء آخر. يرجّع true لو فتح المسودة بدل المطلوب
  async function offerDraft(forId) {
    const m = await Draft.load(); if (!m) return false;
    if (forId && m.postId === forId) {await restoreDraft(m); return true;}
    const go = await new Promise(res => {
      const b = modal(`<h3>عندك مسودة لم تُنشر</h3><p>${esc(draftLabel(m))}</p><div class="eacts"><button class="ebtn gold" id="mYes">أكمل المسودة</button><button class="ebtn" id="mNo">احذفها وابدأ</button></div>`);
      $('#mYes', b).onclick = () => {closeModal(); res(true);}; $('#mNo', b).onclick = () => {closeModal(); res(false);};
    });
    if (go) {await restoreDraft(m); return true;}
    await Draft.clear(); return false;
  }
  async function draftNote() {
    const m = await Draft.load(), n = $('#edraft'); if (!n) return;
    n.hidden = !m; if (!m) return;
    n.innerHTML = `<span>عندك مسودة لم تُنشر: ${esc(draftLabel(m))}</span><button class="ebtn gold" id="dGo">أكمل</button><button class="ebtn" id="dDel">احذفها</button>`;
    $('#dGo').onclick = () => {if (!GH.connected) return needConnect(); location.hash = '#draft';};
    $('#dDel').onclick = async () => {if (await confirmBox('حذف المسودة؟', 'ستُحذف المسودة وصورها من هذا الجهاز.', 'نعم، احذفها')) {await Draft.clear(); n.hidden = true;}};
  }

  // ===== النشر =====
  const pathsOf = (p, dir) => p.isNew ? [dir + p.key + '.jpg', 0, p.smOff ? 0 : dir + p.key + '-sm.jpg'] : p.ref;
  // غلاف الرف: نفس منطق build_index في بناء الألبومات
  function indexEntry(doc) {
    const imgs = doc.imgs; let c = doc.cover;
    if (!c || /^phonto/i.test(c[5]) || c[1] < 300) c = imgs.find(x => x[2] > x[1] * 1.1) || imgs[0];
    if (c[1] / c[2] < .56) c = imgs.find(x => .6 <= x[1] / x[2] && x[1] / x[2] <= .9) || imgs.find(x => .9 < x[1] / x[2] && x[1] / x[2] < 1.6) || c;
    const b = u => !u ? 0 : /^https?:/.test(u) ? u : doc.base + u;
    return [b(c[4]) || b(c[3]) || b(c[0]), +(c[1] / c[2]).toFixed(3), imgs.length + (imgs.some(x => x[5] === c[5]) ? 0 : 1)];
  }
  function albumDoc(id, photos, cover, dir) {
    const rows = photos.map(p => {const [f, m, s] = pathsOf(p, dir); return [f, p.w, p.h, m, s, p.key];});
    const local = rows.every(r => r[0].startsWith(dir)), cut = u => !u ? 0 : local ? u.slice(dir.length) : u;
    const imgs = rows.map(r => [cut(r[0]), r[1], r[2], cut(r[3]), cut(r[4]), r[5]]);
    return {id, v: 1, cover: imgs.find(r => r[5] === cover) || imgs[0], base: local ? dir : '', imgs};
  }
  const swapText = (h, text) => {
    const b = document.createElement('div'), keep = []; b.innerHTML = h;
    [...b.children].forEach(el => {
      if (el.matches('figure') || el.querySelector('iframe,video') || el.matches('iframe,video')) keep.push(el.outerHTML);
      else el.querySelectorAll('img').forEach(im => keep.push((im.closest('a') || im).outerHTML));
      if (el.matches('img')) keep.push(el.outerHTML);
    });
    return [textHtml(text), ...keep].filter(Boolean).join('\n');
  };
  const swapPics = (h, pics) => {
    const b = document.createElement('div'); b.innerHTML = h;
    b.querySelectorAll('img').forEach(im => (im.closest('a') || im).remove());
    b.querySelectorAll('p').forEach(p => {if (!clean(p.textContent) && !p.querySelector('iframe,video') || /^\s*صور من (المناسبة|الحفل)\s*:?\s*$/.test(p.textContent)) p.remove();});
    return [b.innerHTML.trim(), pics].filter(Boolean).join('\n');
  };
  async function buildPost(snap, E, shas) {
    const posts = await snap.json('data/posts.json'), n0 = posts.length, by = await Repo.bodies(snap, posts);
    const isNew = !E.postId, id = isNew ? posts.reduce((m, p) => Math.max(m, p.id), 0) + 1 : E.postId;
    const i0 = posts.findIndex(p => p.id === id), old = i0 >= 0 ? posts[i0] : null, ob = by[id] || null;
    if (!isNew && !old) throw Object.assign(new Error('gone'), {note: 'هذا الخبر حُذف من الموقع، فلا يمكن حفظ التعديل.'});
    const dir = `img/posts/${id}/`, ok = E.photos.filter(p => p.key), files = {}, blobs = {};
    const cov = ok.find(p => p.key === E.cover) || ok[0], ordered = cov ? [cov, ...ok.filter(p => p !== cov)] : [];
    const picsChanged = isNew || sig() !== E.orig.sig, textChanged = isNew || E.text !== E.orig.text;
    const pics = ordered.map(p => `<img src="${esc(pathsOf(p, dir)[0])}" alt="">`).join('\n');
    let h = isNew ? [textHtml(E.text), pics].filter(Boolean).join('\n') : ob.h;
    if (!isNew && textChanged) h = swapText(h, E.text);
    if (!isNew && picsChanged) h = swapPics(h, pics);
    let i = old ? old.i : NOIMG;
    if (picsChanged) {const c = cov ? pathsOf(cov, dir) : null; i = c ? c[2] || c[1] || c[0] : NOIMG;}
    const flat = clean(E.text.replace(/\n+/g, ' ')), x = textChanged ? flat.slice(0, 200) : old.x;
    const meta = {id, d: E.date, t: clean(E.title), c: catOf(E.type), x, i};
    by[id] = {t: meta.t, d: meta.d, c: [meta.c], h, i: picsChanged || !ob ? i : ob.i, u: ob ? ob.u : ''};
    if (old && old.d === meta.d) posts[i0] = meta;
    else {
      if (old) posts.splice(i0, 1);
      const at = posts.findIndex(p => p.d <= meta.d);
      posts.splice(at < 0 ? posts.length : at, 0, meta);
    }
    Object.assign(files, Repo.write(posts, by, n0));
    const idx = await snap.json('data/albums/index.json') || {base: '', a: {}};
    if (picsChanged) {
      if (ok.length) {
        const doc = albumDoc(id, ok, cov.key, dir);
        files[`data/albums/${id}.json`] = JSON.stringify(doc);
        idx.a[id] = indexEntry(doc);
      } else {files[`data/albums/${id}.json`] = null; delete idx.a[id];}
      files['data/albums/index.json'] = JSON.stringify(idx);
      ok.filter(p => p.isNew).forEach(p => {
        blobs[`${dir}${p.key}.jpg`] = shas(p).f; if (!p.smOff) blobs[`${dir}${p.key}-sm.jpg`] = shas(p).s;
      });
      // الصور المحذوفة تخرج من المستودع أيضاً، فميزانية الموقع محدودة
      const keep = new Set(Object.keys(blobs)); ok.filter(p => !p.isNew).forEach(p => p.ref.forEach(u => u && keep.add(u)));
      (await snap.list(`img/posts/${id}`)).forEach(path => {if (!keep.has(path)) files[path] = null;});
    }
    return {files, blobs, posts, idx, id, hasMag: ok.length > 0};
  }
  async function uploadPhotos(E) {
    const fresh = E.photos.filter(p => p.key && p.isNew);
    // حد GitHub نحو ٥٠٠ إنشاء في الساعة: الألبوم الضخم جداً يأخذ النسخ الخفيفة لأوله فقط، والمجلة تستخدم الكاملة للبقية
    const cov = fresh.find(p => p.key === E.cover), order = cov ? [cov, ...fresh.filter(p => p !== cov)] : fresh;
    const smN = Math.max(1, SM_BUDGET - fresh.length);
    order.forEach((p, k) => {p.smOff = k >= smN;});
    const tasks = [];
    order.forEach(p => {if (!p.shaF) tasks.push([p, 'shaF', 'full']); if (!p.smOff && !p.shaS) tasks.push([p, 'shaS', 'sm']);});
    let n = 0, k = 0, bad = 0, lastErr = null; const N = tasks.length, label = 'جارٍ رفع الصور…';
    if (!N) return;
    progress(label, 0, N);
    const worker = async () => {
      while (k < N) {
        const [p, f, b] = tasks[k++];
        try {
          p[f] = await GH.blob64(await Photos.base64(p[b]), s => {$('#mt').textContent = `GitHub طلب انتظاراً قصيراً (${ar(s)} ثانية)، وسيكمل وحده…`;});
          n++; if (n % 8 === 0) Draft.meta(metaOf());
        } catch (e) {bad++; lastErr = e; if (e.status === 401) break;}
        progress(label, n, N);
      }
    };
    await Promise.all(Array.from({length: 4}, worker));
    Draft.meta(metaOf());
    if (bad) {const e = lastErr; e.note = `توقف رفع الصور قبل أن يكتمل، وما ارتفع منها محفوظ. اضغط «حاول مرة أخرى» وسيكمل من حيث توقف.`; throw e;}
  }
  let busy = false;
  const guard = e => {e.preventDefault(); e.returnValue = '';};
  async function publish() {
    if (busy) return;
    if (!D.title.trim()) {const e = $('#fErr'); e.textContent = 'اكتب العنوان أولاً'; e.hidden = false; $('#fT').focus(); return;}
    if (!D.date) D.date = today();
    if (!GH.connected) return needConnect();
    busy = true; addEventListener('beforeunload', guard);
    const E = D, wasNew = !E.postId;
    try {
      await uploadPhotos(E);
      progress('جارٍ النشر على الموقع…');
      const r = await GH.commit(snap => buildPost(snap, E, p => ({f: p.shaF, s: p.shaS})), `${wasNew ? 'نشر' : 'تعديل'}: ${clean(E.title)}`);
      await Draft.clear();
      S.posts = r.posts; S.idx = r.idx; S.refresh();
      const link = r.hasMag ? `album.html?id=${r.id}` : `post.html?id=${r.id}`, back = E.back;
      D = null;
      done(wasNew ? 'تم النشر' : 'تم حفظ التعديل', link, r.hasMag ? 'افتح المجلة' : 'افتح الخبر', 'data/posts.json', r.files['data/posts.json'], back);
    } catch (e) {
      const b = modal(`<h3>لم يكتمل النشر</h3><p>${esc(say(e))}</p><div class="eacts"><button class="ebtn gold" id="mYes">حاول مرة أخرى</button><button class="ebtn" id="mNo">إغلاق</button></div>`);
      $('#mYes', b).onclick = () => {closeModal(); publish();}; $('#mNo', b).onclick = closeModal;
    }
    busy = false; removeEventListener('beforeunload', guard);
  }
  async function removePost() {
    const E = D;
    if (!await confirmBox('حذف هذا الخبر نهائياً؟', `«${E.title}» سيختفي من الموقع مع مجلته وكل صوره.`, 'نعم، احذف نهائياً')) return;
    busy = true; progress('جارٍ الحذف…');
    try {
      const r = await GH.commit(async snap => {
        const posts = await snap.json('data/posts.json'), n0 = posts.length, by = await Repo.bodies(snap, posts), left = posts.filter(p => p.id !== E.postId);
        const idx = await snap.json('data/albums/index.json'), files = Repo.write(left, by, n0);
        if (idx.a[E.postId]) {delete idx.a[E.postId]; files['data/albums/index.json'] = JSON.stringify(idx);}
        files[`data/albums/${E.postId}.json`] = null;
        (await snap.list(`img/posts/${E.postId}`)).forEach(p => {files[p] = null;});
        return {files, posts: left, idx};
      }, `حذف: ${clean(E.title)}`);
      await Draft.clear(); S.posts = r.posts; S.idx = r.idx; S.refresh();
      const back = E.back; D = null;
      done('تم الحذف', '', '', 'data/posts.json', r.files['data/posts.json'], back);
    } catch (e) {const b = modal(`<h3>لم يتم الحذف</h3><p>${esc(say(e))}</p><div class="eacts"><button class="ebtn" id="mNo">إغلاق</button></div>`); $('#mNo', b).onclick = closeModal;}
    busy = false;
  }

  // ===== مكتبة المجلات =====
  const toIso = s => {const m = (s || '').match(/^(\S+)\s+(\d+),\s*(\d{4})/), k = m ? MONTHS.indexOf(m[1]) : -1; return k < 0 ? '' : `${m[3]}-${String(k + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`;};
  const fromIso = d => {const [y, m, dd] = d.split('-').map(Number); return `${MONTHS[m - 1]} ${dd}, ${y}`;};
  function magsView() {
    const M = [...S.site.magazines].sort((a, b) => b.n - a.n);
    view().innerHTML = `${head('مكتبة المجلات')}<div class="etop"><a class="ebtn big gold" href="#mag/new">${svg('plus', 20)}إضافة عدد</a></div>
      <div class="emags">${M.map(m => `<a href="#mag/${m.n}"><img src="mags/${m.n}/cover.webp" alt="" loading="lazy" onerror="this.src='img/logo-mark.png'"><b>العدد ${ar(m.n)}</b><small>${esc(m.date)}</small></a>`).join('')}</div>`;
  }
  function magForm(n) {
    if (!GH.connected) return location.replace('#connect');
    const M = S.site.magazines, cur = M.find(m => m.n === n), next = Math.max(0, ...M.map(m => m.n)) + 1;
    let file = null;
    view().innerHTML = `${head(cur ? `العدد ${ar(n)}` : 'إضافة عدد', '#mags')}
      <form class="eone" id="mf">
        <label class="ef"><span>رقم العدد</span><input id="mN" type="number" min="1" inputmode="numeric" value="${cur ? cur.n : next}" ${cur ? 'readonly' : ''} required></label>
        <label class="ef"><span>تاريخ الصدور</span><input id="mD" type="date" value="${cur ? toIso(cur.date) : today()}" required></label>
        <label class="ef"><span>رابط ملف المجلة</span><input id="mU" type="url" dir="ltr" value="${esc(cur ? cur.u : '')}" placeholder="https://" required><small>ملفات المجلات كبيرة على الموقع، فضع رابط التحميل (مثل Google Drive).</small></label>
        <div class="ef"><span>صورة الغلاف</span><div class="edrop slim" id="mDrop" tabindex="0" role="button"><img id="mPrev" ${cur ? `src="mags/${n}/cover.webp"` : 'hidden'} alt="" onerror="this.hidden=true"><b>${cur ? 'تغيير الغلاف' : 'اختر صورة الغلاف'}</b><input id="mF" type="file" accept="image/*" hidden></div></div>
        <p class="eerr" id="mErr" hidden></p>
        <div class="eacts"><button class="ebtn big gold" type="submit">نشر</button>${cur ? '<button class="ebtn danger ghost" type="button" id="mDel">حذف العدد</button>' : ''}</div>
      </form>`;
    const err = t => {$('#mErr').textContent = t; $('#mErr').hidden = false;};
    $('#mDrop').onclick = e => {if (e.target.id !== 'mF') $('#mF').click();};
    $('#mDrop').onkeydown = e => {if (e.key === 'Enter') $('#mF').click();};
    $('#mF').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try {file = await Photos.magCover(f); $('#mPrev').src = URL.createObjectURL(file); $('#mPrev').hidden = false; $('#mErr').hidden = true;}
      catch (x) {file = null; err(Photos.isHeic(f) ? 'صيغة HEIC لا يفتحها هذا المتصفح. اختر صورة JPG أو PNG.' : 'تعذّر فتح هذه الصورة.');}
    };
    $('#mf').onsubmit = async e => {
      e.preventDefault();
      const num = +$('#mN').value, date = fromIso($('#mD').value), u = $('#mU').value.trim();
      if (!cur && M.some(m => m.n === num)) return err(`العدد ${ar(num)} موجود من قبل.`);
      if (!cur && !file) return err('اختر صورة الغلاف.');
      progress('جارٍ النشر على الموقع…');
      try {
        const sha = file ? await GH.blob64(await Photos.base64(file)) : null;
        const r = await GH.commit(async snap => {
          const s = await snap.json('data/site.json'), i = s.magazines.findIndex(m => m.n === num);
          const row = {n: num, size: i >= 0 ? s.magazines[i].size : '', date, u};
          if (i >= 0) s.magazines[i] = row; else s.magazines.push(row);
          s.magazines.sort((a, b) => b.n - a.n);
          return {site: s, files: {'data/site.json': Repo.site(s)}, blobs: sha ? {[`mags/${num}/cover.webp`]: sha} : {}};
        }, `المجلة: العدد ${num}`);
        S.site = r.site; S.refresh();
        done('تم النشر', 'magazines.html', 'افتح المكتبة', 'data/site.json', r.files['data/site.json'], '#mags');
      } catch (x) {closeModal(); err(say(x));}
    };
    if (cur) $('#mDel').onclick = async () => {
      if (!await confirmBox(`حذف العدد ${ar(n)} من المكتبة؟`, 'سيختفي من صفحة المجلات.', 'نعم، احذف')) return;
      progress('جارٍ الحذف…');
      try {
        const r = await GH.commit(async snap => {const s = await snap.json('data/site.json'); s.magazines = s.magazines.filter(m => m.n !== n); return {site: s, files: {'data/site.json': Repo.site(s)}};}, `المجلة: حذف العدد ${n}`);
        S.site = r.site; S.refresh();
        done('تم الحذف', '', '', 'data/site.json', r.files['data/site.json'], '#mags');
      } catch (x) {closeModal(); err(say(x));}
    };
  }

  // ===== الصفحة الرئيسية =====
  const HOME = {kicker: 'يوميات الأسرة', title: 'سجلّ الأسرة', quote: '«تعلّموا من أنسابكم ما تصلون به أرحامكم»',
    quick: [['قبيلة هذيل', 'الأصل والنسب'], ['الرؤية والرسالة', 'ما نسعى إليه'], ['المجلات', 'أعداد مجلة الأسرة'], ['الفيلم الوثائقي', 'قصة الأسرة مصوّرة'], ['صندوق العائلة', 'الحسابات والمساهمة'], ['جوال العائلة', 'اشترك برسائل الأسرة']]};
  function homeForm() {
    const h = {...HOME, ...(S.site.home || {})}, c = S.site.contact, on = GH.connected;
    view().innerHTML = `${head('الصفحة الرئيسية', '#', 'النصوص التي تظهر في الرئيسية وتذييل الموقع')}
      <form class="eone" id="hf">
        <div class="egrid2"><label class="ef"><span>العنوان الصغير</span><input id="hK" value="${esc(h.kicker)}"></label><label class="ef"><span>عنوان السجل</span><input id="hT" value="${esc(h.title)}"></label></div>
        <details class="efold"><summary>بطاقات الوصول السريع</summary>
        ${h.quick.map((q, k) => `<div class="egrid2"><label class="ef"><span>البطاقة ${ar(k + 1)}</span><input data-q="${k}" data-f="0" value="${esc(q[0])}"></label><label class="ef"><span>وصفها</span><input data-q="${k}" data-f="1" value="${esc(q[1])}"></label></div>`).join('')}
        </details>
        <h3>تذييل الموقع</h3>
        <label class="ef"><span>العبارة</span><input id="hQ" value="${esc(h.quote)}"></label>
        <div class="egrid2"><label class="ef"><span>الجوال</span><input id="hP" dir="ltr" inputmode="tel" value="${esc(c.phone)}"></label><label class="ef"><span>البريد</span><input id="hE" dir="ltr" type="email" value="${esc(c.email)}"></label></div>
        <p class="eerr" id="hErr" hidden></p>
        <div class="eacts"><button class="ebtn big gold" type="submit">نشر</button></div>
      </form>`;
    $('#hf').onsubmit = async e => {
      e.preventDefault();
      if (!on) return needConnect();
      const quick = h.quick.map(q => [...q]);
      document.querySelectorAll('[data-q]').forEach(i => {quick[+i.dataset.q][+i.dataset.f] = i.value.trim();});
      const home = {kicker: $('#hK').value.trim(), title: $('#hT').value.trim(), quote: $('#hQ').value.trim(), quick}, phone = $('#hP').value.trim(), email = $('#hE').value.trim();
      progress('جارٍ النشر على الموقع…');
      try {
        const r = await GH.commit(async snap => {const s = await snap.json('data/site.json'); s.home = home; s.contact.phone = phone; s.contact.email = email; return {site: s, files: {'data/site.json': Repo.site(s)}};}, 'الصفحة الرئيسية: تحديث النصوص');
        S.site = r.site;
        done('تم النشر', 'index.html', 'افتح الرئيسية', 'data/site.json', r.files['data/site.json'], '#');
      } catch (x) {closeModal(); const m = $('#hErr'); m.textContent = say(x); m.hidden = false;}
    };
  }

  // ===== الربط والحساب =====
  const TOKEN_URL = 'https://github.com/settings/personal-access-tokens/new?' + new URLSearchParams({name: 'alajlan-portal-editor', description: 'Publishing from the family portal admin page', expires_in: 'none', contents: 'write'});
  function connectView() {
    view().innerHTML = `${head(GH.connected ? 'تجديد مفتاح النشر' : 'ربط النشر', '#account', 'مرة واحدة فقط، وبعدها تنشر من أي جهاز باسمك وكلمة مرورك')}
      <ol class="esteps">
        <li><b>افتح صفحة المفتاح في GitHub</b><a class="ebtn" href="${esc(TOKEN_URL)}" target="_blank" rel="noopener">فتح صفحة المفتاح</a></li>
        <li><b>اختر المستودع</b><span>عند <bdi dir="ltr">Repository access</bdi> اختر <bdi dir="ltr">Only select repositories</bdi>، ثم اختر <bdi dir="ltr">alajlan-aleid</bdi> فقط.</span></li>
        <li><b>أنشئ المفتاح</b><span>تأكد أن <bdi dir="ltr">Contents</bdi> هي <bdi dir="ltr">Read and write</bdi>، ثم اضغط الزر الأخضر <bdi dir="ltr">Generate token</bdi>.</span></li>
        <li><b>انسخ المفتاح والصقه هنا</b>
          <form id="cf"><input id="cT" type="password" dir="ltr" autocomplete="off" spellcheck="false" placeholder="github_pat_…" aria-label="مفتاح النشر" required>
          <p class="eerr" id="cE" hidden></p><button class="ebtn big gold" id="cB" type="submit">ربط</button></form></li>
      </ol>`;
    $('#cf').onsubmit = async e => {
      e.preventDefault();
      const t = $('#cT').value.trim(), er = $('#cE'), b = $('#cB'); er.hidden = true;
      if (!/^github_pat_/.test(t)) {er.textContent = 'هذا ليس مفتاحاً صحيحاً. المفتاح يبدأ بـ github_pat_'; er.hidden = false; return;}
      b.disabled = true; b.textContent = 'جارٍ الربط…';
      try {
        await Vault.connect(t); $('#cT').value = ''; S.refresh();
        done('تم الربط', '', '', '', '', '#');
      } catch (x) {
        er.textContent = x.status === 401 ? 'المفتاح غير صحيح. انسخه مرة أخرى كاملاً.' : x.status === 404 ? 'المفتاح لا يصل إلى المستودع alajlan-aleid. تأكد من الخطوة ٢.' : x.status === 403 ? 'المفتاح بلا صلاحية كتابة. تأكد من الخطوة ٣.' : say(x);
        er.hidden = false;
      }
      b.disabled = false; b.textContent = 'ربط';
    };
  }
  function accountView() {
    view().innerHTML = `${head('الحساب والربط')}
      <div class="eone">
        <p class="estate ${GH.connected ? 'on' : ''}">${GH.connected ? 'النشر مربوط ويعمل.' : 'النشر غير مربوط.'}</p>
        <a class="ebtn" href="#connect">${GH.connected ? 'تجديد مفتاح النشر' : 'ربط النشر'}</a>
        ${GH.connected ? `<h3>تغيير كلمة المرور</h3><form id="pf" class="eone">
          <label class="ef"><span>كلمة المرور الحالية</span><input id="p0" type="password" dir="ltr" autocomplete="current-password" required></label>
          <label class="ef"><span>كلمة المرور الجديدة</span><input id="p1" type="password" dir="ltr" autocomplete="new-password" minlength="10" required><small>عشرة أحرف على الأقل، والأطول أقوى.</small></label>
          <label class="ef"><span>أعد كتابتها</span><input id="p2" type="password" dir="ltr" autocomplete="new-password" required></label>
          <p class="eerr" id="pE" hidden></p><button class="ebtn gold big" type="submit">تغيير</button></form>` : ''}
      </div>`;
    if (!GH.connected) return;
    $('#pf').onsubmit = async e => {
      e.preventDefault();
      const er = t => {closeModal(); $('#pE').textContent = t; $('#pE').hidden = false;};
      if ($('#p1').value !== $('#p2').value) return er('كلمتا المرور غير متطابقتين.');
      progress('جارٍ تغيير كلمة المرور…');
      try {
        if (!await Vault.changePassword($('#p0').value, $('#p1').value)) return er('كلمة المرور الحالية غير صحيحة.');
        ['#p0', '#p1', '#p2'].forEach(i => {$(i).value = '';});
        const b = modal(`<div class="eok">${svg('check', 30)}</div><h3>تم تغيير كلمة المرور</h3><p>تعمل كلمة المرور الجديدة في الأجهزة الأخرى بعد دقيقة تقريباً.</p><div class="eacts"><button class="ebtn" id="mNo">تم</button></div>`);
        $('#mNo', b).onclick = closeModal;
      } catch (x) {er(say(x));}
    };
  }

  // ===== التنقل =====
  async function route() {
    const h = location.hash.replace(/^#/, ''), [a, b] = h.split('/');
    if (busy) return;
    if (D && dirty()) {clearTimeout(saveT); await Draft.meta(metaOf());}
    D = null; pending = total = 0;
    document.body.classList.remove('editing');
    $('#homeV').hidden = !!h; view().hidden = !h;
    closeModal(); scrollTo(0, 0);
    if (!h) {view().innerHTML = ''; draftNote(); return;}
    if (a === 'news' || a === 'covers') listView(a);
    else if (a === 'new') openNew(b === 'occ');
    else if (a === 'edit') openEdit(+b);
    else if (a === 'draft') {const m = await Draft.load(); m ? restoreDraft(m) : location.replace('#');}
    else if (a === 'mags') magsView();
    else if (a === 'mag') magForm(b === 'new' ? 0 : +b);
    else if (a === 'home') homeForm();
    else if (a === 'connect') connectView();
    else if (a === 'account') accountView();
    else location.replace('#');
  }
  return {
    S,
    start() {addEventListener('hashchange', route); route();},
  };
})();
