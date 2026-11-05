// أقسام اللوحة غير الأخبار: النظرة العامة، نصوص الموقع بنماذج بسيطة، الشجرة، الدعوات، الحساب
const Panel = (() => {
  const {view, head, say, verb, ing, modal, closeModal, confirmBox, progress, done, norm, clean} = Editor.ui, S = Editor.S, R = Editor.routes;
  const NAV = [['', 'الرئيسية', 'home'], ['news', 'الأخبار والمناسبات', 'news'], ['covers', 'مجلات التغطيات', 'film'], ['mags', 'مكتبة المجلات', 'mag'], ['home', 'الصفحة الرئيسية', 'vision'],
    ['pages', 'صفحات الموقع', 'box'], ['tree', 'شجرة العائلة', 'tree'], ['invite', 'مصمم الدعوات', 'mail'], ['account', 'الحساب', 'people']];
  const size = b => b >= 1073741824 ? `${(b / 1073741824).toLocaleString('ar-SA', {maximumFractionDigits: 1})} جيجا` : b < 1048576 ? 'أقل من ١ ميجا' : `${ar(b / 1048576)} ميجا`;

  // ===== النظرة العامة =====
  async function disk(el) {
    try {
      const d = await Store.disk(), pct = d.total ? Math.min(100, d.used / d.total * 100) : 0;
      el.innerHTML = `<div class="mhead"><b>${d.browser ? 'مساحة نسخة العرض في هذا المتصفح' : 'مساحة الموقع'}</b><span>${d.total ? `مستخدم ${size(d.used)} من ${size(d.total)}` : `مستخدم ${size(d.used)}`}</span></div>
        ${d.total ? `<div class="meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}" aria-label="المساحة المستخدمة"><i style="width:${Math.max(pct, 1)}%"></i></div>` : ''}
        ${pct > 85 ? '<p class="mwarn">المساحة قاربت على الامتلاء. كلّم الاستضافة لزيادتها.</p>' : ''}`;
    } catch (e) {el.innerHTML = '<div class="mhead"><b>مساحة الموقع</b><span>تعذّرت قراءتها الآن</span></div>';}
  }
  R[''] = () => {
    const {posts, idx, site} = S, cats = c => posts.filter(p => p.c === c).length;
    view().innerHTML = `${head('أهلاً بك', '', 'من هنا تدير كل ما يظهر في الموقع')}
      <div class="enote" id="edraft" hidden></div>
      <section class="astats" aria-label="أرقام الموقع">${[['الأخبار', cats('أخبار الاسرة'), '#news'], ['المناسبات', cats('مناسبات الاسرة'), '#news'], ['الدعوات', cats('دعوات الأسرة'), '#news'], ['مجلات التغطيات', Object.keys(idx.a).length, '#covers'], ['أعداد المجلة', site.magazines.length, '#mags'], ['أسماء الشجرة', '…', '#tree']]
        .map(([t, n, h]) => `<a href="${h}"><b${t === 'أسماء الشجرة' ? ' id="stTree"' : ''}>${typeof n === 'number' ? ar(n) : n}</b><span>${t}</span></a>`).join('')}</section>
      <section class="pcard" id="disk" aria-label="المساحة"><div class="mhead"><b>مساحة الموقع</b></div></section>
      <h3 class="ph3">ماذا تريد أن تفعل؟</h3>
      <nav class="etiles" aria-label="أعمال سريعة">${[['إضافة خبر', '#new', 'plus', 'خبر أو مناسبة أو دعوة'], ['مجلة تغطية جديدة', '#new/occ', 'film', 'أسقط الصور وتصير مجلة'], ['تعديل صفحة', '#pages', 'box', 'الرؤية، الصندوق، التواصل…'], ['ابحث في الشجرة', '#tree', 'tree', 'صحّح اسماً أو أضف ابناً']]
        .map(([t, u, i, d]) => `<a href="${u}">${svg(i, 28)}<b>${t}</b><small>${d}</small></a>`).join('')}</nav>
      <h3 class="ph3">آخر ما نُشر</h3>
      <div class="alist">${posts.slice(0, 6).map(p => `<a href="#edit/${p.id}"><time>${fmtDate(p.d)}</time><b>${esc(p.t)}</b><em>${esc(catName(p.c))}</em></a>`).join('')}</div>`;
    Editor.draftNote(); disk($('#disk'));
    tree().then(T => {const e = $('#stTree'); if (e) e.textContent = ar(T.L.length);}).catch(() => {});
  };

  // ===== النماذج: كل حقل مربوط بمكانه في site.json، وما ليس في النموذج لا يُلمس =====
  const url = v => {if (v && !/^https?:\/\/\S+$/i.test(v)) throw 'اكتب الرابط كاملاً ويبدأ بـ https://'; return v;};
  const tel = v => {if (v && !/^[+\d][\d\s-]{5,}$/.test(v)) throw 'رقم الجوال غير صحيح'; return v;};
  const mail = v => {if (v && !/^\S+@\S+\.\S+$/.test(v)) throw 'البريد غير صحيح'; return v;};
  const iban = v => {const x = v.replace(/\s/g, '').toUpperCase(); if (!/^SA\d{22}$/.test(x)) throw 'رقم الآيبان يبدأ بـ SA وبعده ٢٢ رقماً'; return x;};
  const yt = v => {const m = v.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || v.match(/^([\w-]{11})$/); if (!m) throw 'الصق رابط الفيديو من يوتيوب'; return m[1];};
  const L = {dir: 'ltr'}, HOMEQ = [['قبيلة هذيل', 'الأصل والنسب'], ['الرؤية والرسالة', 'ما نسعى إليه'], ['المجلات', 'أعداد مجلة الأسرة'], ['الفيلم الوثائقي', 'قصة الأسرة مصوّرة'], ['صندوق العائلة', 'الحسابات والمساهمة'], ['جوال العائلة', 'اشترك برسائل الأسرة']];
  const FORMS = {
    vision: {t: 'الرؤية والرسالة', d: 'الرؤية والرسالة والأهداف', ic: 'vision', v: 'page.html?p=vision', f: [
      {p: ['vision'], t: 'الرؤية', area: 1, req: 1}, {p: ['mission'], t: 'الرسالة', area: 1, req: 1}, {p: ['goals'], t: 'الأهداف', list: 'هدف'}]},
    about: {t: 'عن الأهل', d: 'أصل الأسرة والأسر السبع', ic: 'people', v: 'page.html?p=about', f: [
      {p: ['about', 'intro'], t: 'نبذة عن الأسرة', area: 1, req: 1}, {p: ['about', 'mutarifa'], t: 'مطارفة الطير', area: 1, req: 1},
      {p: ['about', 'branches'], t: 'ذرية مطارفة الطير في نجد', rows: [{k: 'name', t: 'اسم الأسرة', req: 1}, {k: 'text', t: 'النبذة', area: 1}], one: 'أسرة'}]},
    hudhayl: {t: 'قبيلة هذيل', d: 'نص صفحة القبيلة', ic: 'tribe', v: 'page.html?p=hudhayl', f: [
      {p: ['hudhayl'], t: 'الفقرات', list: 'فقرة', h: 'الفقرة التي تبدأ بـ «قال عن» تظهر في «قالوا عن هذيل»، والتي تبدأ بـ «أنها» أو «أنهم» تظهر في «من مزايا القبيلة».'}]},
    fund: {t: 'صندوق العائلة', d: 'البنك والحسابات', ic: 'fund', v: 'page.html?p=fund', f: [
      {p: ['fund', 'bank'], t: 'اسم البنك', req: 1}, {p: ['fund', 'holder'], t: 'باسم', req: 1},
      {p: ['fund', 'accounts'], t: 'الحسابات', rows: [{k: 'name', t: 'اسم الحساب', req: 1}, {k: 'iban', t: 'رقم الآيبان', ...L, fix: iban}], one: 'حساب'}]},
    award: {t: 'جائزة التفوق العلمي', d: 'رابط موقع الجائزة', ic: 'award', v: 'page.html?p=award', f: [{p: ['award', 'url'], t: 'رابط موقع الجائزة', ...L, req: 1, fix: url}]},
    film: {t: 'الفيلم الوثائقي', d: 'عنوان الفيلم ورابطه', ic: 'film', v: 'page.html?p=film', f: [
      {p: ['film', 'title'], t: 'عنوان الفيلم', req: 1}, {p: ['film', 'youtube'], t: 'رابط الفيلم في يوتيوب', ...L, req: 1, fix: yt, h: 'الصق الرابط كاملاً، واللوحة تأخذ المطلوب منه.'}]},
    sms: {t: 'جوال العائلة', d: 'خدمة الرسائل والاشتراك', ic: 'sms', v: 'page.html?p=sms', f: [
      {p: ['sms', 'name'], t: 'اسم المرسل', ...L, req: 1}, {p: ['sms', 'phone'], t: 'رقم الاشتراك', ...L, req: 1, fix: tel},
      {p: ['sms', 'lines'], t: 'نص الصفحة', list: 'سطر', h: 'السطر الذي ينتهي بنقطتين (:) يظهر عنواناً، والذي يبدأ بشرطة (-) يظهر بنداً.'}]},
    contact: {t: 'التواصل', d: 'الجوال والبريد والعنوان', ic: 'mail', v: 'page.html?p=contact', f: [
      {p: ['contact', 'city'], t: 'المدينة', req: 1}, {p: ['contact', 'phone'], t: 'الجوال', ...L, req: 1, fix: tel}, {p: ['contact', 'email'], t: 'البريد', ...L, req: 1, fix: mail},
      {p: ['contact', 'pobox'], t: 'صندوق البريد'}, {p: ['contact', 'zip'], t: 'الرمز البريدي'}]},
    social: {t: 'الروابط الاجتماعية', d: 'الحسابات والتطبيقات', ic: 'people', v: 'page.html?p=contact', f: Object.keys(SOC_NAME).map(k => ({p: ['social', k], t: SOC_NAME[k], ...L, fix: url, opt: 1}))},
    downloads: {t: 'تحميلات الشجرة', d: 'ملفات الشجرة للتحميل', ic: 'dl', v: 'page.html?p=about', f: [
      {p: ['tree', 'downloads'], t: 'الملفات', rows: [{k: 't', t: 'اسم الملف', req: 1}, {k: 'u', t: 'رابط التحميل', ...L, req: 1, fix: url}], one: 'ملف', h: 'الملف الذي في اسمه «مطارفة» يظهر زراً في صفحة «عن الأهل».'}]},
    home: {t: 'الصفحة الرئيسية', d: 'النصوص التي تظهر في الرئيسية وتذييل الموقع', v: 'index.html', top: 1, f: [
      {p: ['home', 'kicker'], t: 'العنوان الصغير', def: 'يوميات الأسرة', req: 1}, {p: ['home', 'title'], t: 'عنوان السجل', def: 'سجلّ الأسرة', req: 1},
      {p: ['home', 'quick'], t: 'بطاقات الوصول السريع', def: HOMEQ, pair: 1, fixed: 1, rows: [{k: 0, t: 'العنوان', req: 1}, {k: 1, t: 'الوصف'}], one: 'بطاقة'},
      {p: ['home', 'quote'], t: 'عبارة التذييل', def: '«تعلّموا من أنسابكم ما تصلون به أرحامكم»', req: 1},
      {p: ['contact', 'phone'], t: 'جوال التذييل', ...L, req: 1, fix: tel}, {p: ['contact', 'email'], t: 'بريد التذييل', ...L, req: 1, fix: mail}]},
  };
  const dig = (o, p) => p.reduce((x, k) => x == null ? x : x[k], o);
  const put = (o, p, v) => {const last = p[p.length - 1], box = p.slice(0, -1).reduce((x, k) => x[k] || (x[k] = {}), o); box[last] = v;};
  const copy = v => v == null ? v : JSON.parse(JSON.stringify(v));
  let dirtyForm = false;
  const input = (f, v, attrs, label) => f.area ? `<textarea rows="${Math.min(14, Math.max(3, Math.ceil(String(v).length / 85)))}" ${attrs}${label}>${esc(v)}</textarea>` : `<input value="${esc(v)}" ${f.dir ? `dir="${f.dir}"` : ''} ${attrs}${label}>`;

  function formView(key, back) {
    const F = FORMS[key]; if (!F) return location.replace('#pages');
    const V = F.f.map(f => {const x = copy(dig(S.site, f.p)); return x == null ? copy(f.def) ?? (f.list || f.rows ? [] : '') : x;});
    const tools = (i, j, n, f) => f.fixed ? '' : `<span class="ptools"><button type="button" data-a="up" data-i="${i}" data-j="${j}" aria-label="رفع" ${j ? '' : 'disabled'}>↑</button><button type="button" data-a="down" data-i="${i}" data-j="${j}" aria-label="تنزيل" ${j < n - 1 ? '' : 'disabled'}>↓</button><button type="button" class="pdel" data-a="del" data-i="${i}" data-j="${j}">حذف</button></span>`;
    const group = (f, i) => {
      const v = V[i], hint = f.h ? `<small class="phint">${esc(f.h)}</small>` : '', one = f.one || f.list;
      const items = f.list
        ? v.map((x, j) => `<div class="pitem">${input({area: 1}, x, `data-i="${i}" data-j="${j}"`, ` aria-label="${esc(f.list)} ${j + 1}"`)}${tools(i, j, v.length, f)}</div>`)
        : v.map((x, j) => `<div class="pitem card"><div class="pgrid">${f.rows.map(c => `<label class="ef${c.area ? ' wide' : ''}"><span>${esc(c.t)}</span>${input(c, x[c.k] ?? '', `data-i="${i}" data-j="${j}" data-k="${c.k}"`, '')}</label>`).join('')}</div>${tools(i, j, v.length, f)}</div>`);
      return `<fieldset class="pgroup" id="g${i}"><legend>${esc(f.t)}</legend>${hint}${items.join('')}${f.fixed ? '' : `<button type="button" class="ebtn" data-a="add" data-i="${i}">${svg('plus', 16)}إضافة ${esc(one)}</button>`}</fieldset>`;
    };
    const one = (f, i) => `<label class="ef${f.area ? ' wide' : ''}"><span>${esc(f.t)}</span>${input(f, V[i], `data-i="${i}"`, '')}${f.h ? `<small>${esc(f.h)}</small>` : ''}</label>`;
    view().innerHTML = `${head(F.t, back, F.top ? F.d : '')}
      <form class="pform" id="pf" novalidate><div class="pgrid">${F.f.map((f, i) => f.list || f.rows ? group(f, i) : one(f, i)).join('')}</div>
      <p class="eerr" id="pErr" role="alert" hidden></p>
      <div class="epub"><span id="pSt"></span><a class="ebtn" href="${esc(F.v)}" target="_blank" rel="noopener">عرض على الموقع</a><button class="ebtn big gold" id="ePub" type="submit">${esc(verb('حفظ ونشر'))}</button></div></form>`;
    const form = $('#pf'), st = $('#pSt'), err = t => {$('#pErr').textContent = t; $('#pErr').hidden = !t;};
    const touched = () => {dirtyForm = true; st.textContent = 'عندك تعديلات لم تُحفظ'; err('');};
    form.oninput = e => {
      const t = e.target, i = +t.dataset.i, j = t.dataset.j, k = t.dataset.k; if (t.dataset.i == null) return;
      if (j == null) V[i] = t.value; else if (k == null) V[i][+j] = t.value; else V[i][+j][k] = t.value;
      touched();
    };
    form.onclick = e => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      const i = +b.dataset.i, j = +b.dataset.j, a = b.dataset.a, f = F.f[i], v = V[i];
      if (a === 'add') v.push(f.list ? '' : Object.fromEntries(f.rows.map(c => [c.k, ''])));
      if (a === 'del') v.splice(j, 1);
      if (a === 'up') v.splice(j - 1, 0, v.splice(j, 1)[0]);
      if (a === 'down') v.splice(j + 1, 0, v.splice(j, 1)[0]);
      $(`#g${i}`).outerHTML = group(f, i); touched();
      if (a === 'add') {const n = $(`#g${i}`).querySelectorAll('.pitem'), l = n[n.length - 1].querySelector('input,textarea'); if (l) l.focus();}
    };
    const clearAll = (f, v) => {   // يرجّع القيمة المنظفة، ويرمي رسالة واضحة لو فيها خطأ
      const s = String(v).trim(); if (!s) {if (f.req) throw `اكتب ${f.t}`; return '';}
      return f.fix ? f.fix(s) : s;
    };
    form.onsubmit = async e => {
      e.preventDefault(); err('');
      const out = [];
      try {
        F.f.forEach((f, i) => {
          if (f.list) out[i] = V[i].map(x => x.trim()).filter(Boolean);
          else if (f.rows) {
            const keep = V[i].filter(r => f.rows.some(c => String(r[c.k] ?? '').trim()));
            out[i] = keep.map(r => {const n = f.pair ? [...r] : {...r}; f.rows.forEach(c => {n[c.k] = clearAll(c, r[c.k] ?? '');}); return n;});
          } else out[i] = clearAll(f, V[i]);
        });
      } catch (x) {return err(typeof x === 'string' ? x : say(x));}
      progress(ing());
      try {
        const r = await Store.commit(async snap => {
          const s = await snap.json('data/site.json');
          F.f.forEach((f, i) => {if (f.opt && !out[i]) delete dig(s, f.p.slice(0, -1))[f.p[f.p.length - 1]]; else put(s, f.p, out[i]);});
          return {site: s, files: {'data/site.json': Repo.site(s)}};
        });
        S.site = r.site; dirtyForm = false; st.textContent = 'كل التعديلات محفوظة';
        done('تم النشر', F.v, 'عرض على الموقع', null);
      } catch (x) {closeModal(); err(say(x));}
    };
  }
  R.home = () => formView('home', '');
  const PAGES = ['vision', 'about', 'hudhayl', 'fund', 'award', 'film', 'sms', 'contact', 'social', 'downloads'];
  R.pages = k => {
    if (k) return formView(k, '#pages');
    view().innerHTML = `${head('صفحات الموقع', '', 'اختر الصفحة التي تريد تعديلها')}<nav class="ppages">${PAGES.map(p => `<a href="#pages/${p}">${svg(FORMS[p].ic, 26)}<b>${FORMS[p].t}</b><small>${FORMS[p].d}</small></a>`).join('')}</nav>`;
  };
  Editor.leaving.push(async () => {
    if (!dirtyForm) return true;
    const go = await confirmBox('عندك تعديلات لم تُحفظ', 'لو خرجت الآن تضيع هذه التعديلات.', 'اخرج بدون حفظ', 'ابقَ هنا');
    if (go) dirtyForm = false;
    return go;
  });
  addEventListener('beforeunload', e => {if (dirtyForm) {e.preventDefault(); e.returnValue = '';}});

  // ===== شجرة العائلة: الملف نفسه الذي يقرأه موقع الشجرة. أول ٣٧ اسماً (جذع الشجرة) مكتوبة داخل صفحة الشجرة فلا تُعدّل من هنا =====
  const FILE = '../v7/people_all.json', SEED_MAX = 1000;
  let T = null;
  const index = list => {
    const by = new Map(list.map(p => [p.id, p])), kids = new Map();
    list.forEach(p => {if (p.father != null) {if (!kids.has(p.father)) kids.set(p.father, []); kids.get(p.father).push(p);}});
    return {L: list, by, kids};
  };
  const tree = async (fresh) => {
    if (!T || fresh) {const snap = await Store.snapshot(); T = index(await snap.json(FILE));}
    return T;
  };
  const chain = (T, p) => {const o = [], seen = new Set(); while (p && !seen.has(p.id)) {seen.add(p.id); o.push(p); p = T.by.get(p.father);} return o;};
  const nasab = (T, p, n = 99) => chain(T, p).slice(0, n).map((x, i, a) => i ? `${a[i - 1].gender === 'f' ? 'بنت' : 'بن'} ${x.name}` : x.name).join(' ');
  const pack = list => JSON.stringify(list);
  const treeTabs = on => `<nav class="mtabs" aria-label="أقسام الشجرة"><a href="#tree"${on ? '' : ' class="on" aria-current="page"'}>الأسماء</a><a href="#tree/men"${on ? ' class="on" aria-current="page"' : ''}>صور الرجال</a></nav>`;
  function treeSearch() {
    view().innerHTML = `${head('شجرة العائلة', '', 'ابحث عن الاسم، ثم صحّحه أو أضف له ابناً أو بنتاً')}
      ${treeTabs(0)}
      <div class="etop"><label class="esearch">${svg('search', 18)}<input id="tq" type="search" placeholder="مثال: فهد بن سعد بن علي" aria-label="بحث في الشجرة"></label><a class="ebtn big" href="${TREE_URL}" target="_blank" rel="noopener">عرض الشجرة</a></div>
      <div class="erows" id="trows"><p class="eempty">جارٍ تحميل الأسماء…</p></div>`;
    tree().then(T => {
      const words = q => norm(q).replace(/(^|\s)(بن|بنت|ابن)(?=\s)/g, ' ').trim().split(/\s+/).filter(Boolean);
      const hay = T.L.map(p => [p, norm(chain(T, p).slice(0, 7).map(x => x.name).join(' ')).split(' ')]);
      const draw = q => {
        const w = words(q);
        if (!w.length) {$('#trows').innerHTML = `<p class="eempty">في الشجرة ${ar(T.L.length)} اسماً. اكتب اسماً للبحث.</p>`; return;}
        const R = hay.filter(([, h]) => {let k = 0; for (const x of h) if (x === w[k] || (k === w.length - 1 && x.startsWith(w[k]))) k++; return k >= w.length && h[0].startsWith(w[0]);}).slice(0, 40);
        $('#trows').innerHTML = R.map(([p]) => `<a class="erow" href="#tree/${p.id}"><span><b>${esc(nasab(T, p, 6))}</b><small>${p.gender === 'f' ? 'أنثى' : 'ذكر'}${T.kids.has(p.id) ? ` · الأبناء ${ar(T.kids.get(p.id).length)}` : ''}</small></span>${svg('chevl', 16)}</a>`).join('') || '<p class="eempty">لا توجد نتائج.</p>';
      };
      $('#tq').oninput = e => draw(e.target.value); draw(''); $('#tq').focus();
    }).catch(e => {$('#trows').innerHTML = `<p class="eempty">${esc(say(e))}</p>`;});
  }
  const cleanName = v => {const s = clean(v); if (!/^[ء-ي\s()]{2,40}$/.test(s)) throw 'اكتب الاسم بالحروف العربية فقط'; return s;};
  async function saveTree(change, title, back) {
    progress(ing());
    const r = await Store.commit(async snap => {const list = await snap.json(FILE); change(list); return {list, files: {[FILE]: pack(list)}};});
    T = index(r.list);
    done(title, Store.demo ? '' : `../v7/nasab.html?id=${back}`, 'عرض النسب على الموقع', `#tree/${back}`);   // صفحات الشجرة تقرأ الملف من الموقع، فتعديل نسخة العرض لا يظهر فيها
    personView(String(back));
  }
  async function personView(sid) {
    const id = +sid;
    let t; try {t = await tree();} catch (e) {view().innerHTML = `${head('شجرة العائلة', '#tree')}<p class="eempty">${esc(say(e))}</p>`; return;}
    const p = t.by.get(id); if (!p) return location.replace('#tree');
    const kids = t.kids.get(id) || [], locked = id < SEED_MAX, canDel = p.added && !kids.length, father = t.by.get(p.father);
    view().innerHTML = `${head(p.name, '#tree', nasab(t, p))}
      <div class="tcols">
        <section class="pcard"><h3>${esc(p.gender === 'f' ? 'بياناتها' : 'بياناته')}</h3>
          ${father ? `<p class="tline">${p.gender === 'f' ? 'والدها' : 'والده'}: <a href="#tree/${father.id}">${esc(nasab(t, father, 3))}</a></p>` : ''}
          ${locked ? '<p class="estate">هذا الاسم من جذع الشجرة الثابت، ولا يُعدَّل من اللوحة.</p>' : `<form id="nf" class="pstack"><label class="ef"><span>تصحيح الاسم</span><input id="nN" value="${esc(p.name)}" maxlength="40"></label><p class="eerr" id="nE" hidden></p><button class="ebtn gold" type="submit">${esc(verb('حفظ الاسم'))}</button>
            <small class="phint">التصحيح يظهر في البحث والبطاقات وصفحة النسب. الاسم المرسوم على صورة الشجرة نفسها لا يتغير.</small></form>`}
          <div class="eacts start"><a class="ebtn" href="../v7/nasab.html?id=${id}" target="_blank" rel="noopener">عرض النسب على الموقع</a>${Store.genderOf(p) === 'm' ? `<a class="ebtn" href="#tree/men/${id}">صورته</a>` : ''}${canDel ? '<button class="ebtn danger ghost" id="pDel">حذف هذا الاسم</button>' : ''}</div>
        </section>
        <section class="pcard"><h3>${p.gender === 'f' ? 'أبناؤها' : 'الأبناء والبنات'} ${kids.length ? `(${ar(kids.length)})` : ''}</h3>
          <div class="tkids">${kids.map(k => `<a href="#tree/${k.id}" class="${k.gender === 'f' ? 'f' : ''}">${esc(k.name)}</a>`).join('') || '<p class="phint">لا يوجد أبناء مسجلون.</p>'}</div>
          ${p.gender === 'f' ? '' : `<form id="kf" class="pstack"><label class="ef"><span>إضافة ابن أو بنت</span><input id="kN" maxlength="40" placeholder="الاسم الأول فقط"></label>
            <div class="tg" role="radiogroup" aria-label="النوع"><label><input type="radio" name="kg" value="m" checked><span>ابن</span></label><label><input type="radio" name="kg" value="f"><span>بنت</span></label></div>
            <p class="eerr" id="kE" hidden></p><button class="ebtn gold" type="submit">${esc(verb('إضافة'))}</button>
            <small class="phint">الاسم الجديد يظهر في الشجرة والبحث والنسب بعلامة «مضاف بعد الطبعة». تأكد منه قبل الحفظ.</small></form>`}
        </section>
      </div>`;
    const bad = (el, x) => {closeModal(); el.textContent = typeof x === 'string' ? x : say(x); el.hidden = false;};
    if ($('#nf')) $('#nf').onsubmit = async e => {
      e.preventDefault();
      try {
        const v = cleanName($('#nN').value); if (v === p.name) return;
        if (!await confirmBox('تصحيح الاسم؟', `«${p.name}» يصير «${v}»`, 'نعم، صحّحه')) return;
        await saveTree(l => {l.find(x => x.id === id).name = v;}, 'تم تصحيح الاسم', id);
      } catch (x) {bad($('#nE'), x);}
    };
    if ($('#kf')) $('#kf').onsubmit = async e => {
      e.preventDefault();
      try {
        const v = cleanName($('#kN').value), g = document.querySelector('[name=kg]:checked').value;
        if (!await confirmBox('إضافة إلى الشجرة؟', `${v} ${g === 'f' ? 'بنت' : 'بن'} ${nasab(t, p, 4)}`, 'نعم، أضف')) return;
        await saveTree(l => {l.push({id: l.reduce((m, x) => Math.max(m, x.id), SEED_MAX) + 1, name: v, gender: g, father: id, gen: (p.gen || 0) + 1, added: 1});}, 'تمت الإضافة', id);
      } catch (x) {bad($('#kE'), x);}
    };
    if ($('#pDel')) $('#pDel').onclick = async () => {
      if (!await confirmBox('حذف هذا الاسم؟', nasab(t, p, 4), 'نعم، احذف')) return;
      try {
        await saveTree(l => {l.splice(l.findIndex(x => x.id === id), 1);}, 'تم الحذف', p.father);
        Store.menRemove(id).catch(() => {});   // لو له صورة لا تبقى بدون صاحب
      }
      catch (x) {closeModal(); modal(`<h3>لم يتم الحذف</h3><p>${esc(say(x))}</p><div class="eacts"><button class="ebtn" onclick="document.getElementById('emodal').hidden=true">إغلاق</button></div>`);}
    };
  }
  R.tree = (id, sub) => id === 'men' ? Men.show(sub) : id ? personView(id) : treeSearch();

  // ===== مصمم الدعوات =====
  R.invite = () => {view().innerHTML = `${head('مصمم الدعوات', '', 'صمّم بطاقة دعوة ونزّلها')}<section class="pcard pmid">${svg('mail', 34)}<p>مصمم الدعوات صفحة مستقلة، وربطه باللوحة يأتي لاحقاً.</p><a class="ebtn big gold" href="invite.html" target="_blank" rel="noopener">فتح مصمم الدعوات</a></section>`;};

  // ===== الحساب =====
  R.account = () => {
    view().innerHTML = `${head('الحساب', '', `اسم المستخدم: ${Store.user}`)}
      <div class="tcols">
        <section class="pcard"><h3>تغيير كلمة المرور</h3><form id="pw" class="pstack">
          <label class="ef"><span>كلمة المرور الحالية</span><input id="p0" type="password" dir="ltr" autocomplete="current-password" required></label>
          <label class="ef"><span>كلمة المرور الجديدة</span><input id="p1" type="password" dir="ltr" autocomplete="new-password" minlength="10" required><small>عشرة أحرف على الأقل، والأطول أقوى.</small></label>
          <label class="ef"><span>أعد كتابتها</span><input id="p2" type="password" dir="ltr" autocomplete="new-password" required></label>
          <p class="eerr" id="pE" hidden></p><button class="ebtn gold big" type="submit">تغيير</button></form></section>
        ${Store.demo ? `<section class="pcard"><h3>نسخة العرض</h3><p class="tline" id="dmN"></p><button class="ebtn danger ghost" id="dmR">مسح كل تعديلات العرض</button></section>`
        : `<section class="pcard"><h3>مساحة الاستضافة</h3><div id="dk"></div><form id="qf" class="pstack"><label class="ef"><span>حجم الباقة بالجيجا</span><input id="qG" type="number" min="0" step="0.5" dir="ltr" inputmode="decimal"><small>اختياري، من فاتورة الاستضافة. يجعل المؤشر أدق.</small></label><button class="ebtn" type="submit">حفظ</button></form></section>`}
      </div>`;
    $('#pw').onsubmit = async e => {
      e.preventDefault();
      const er = t => {closeModal(); $('#pE').textContent = t; $('#pE').hidden = false;}; $('#pE').hidden = true;
      if ($('#p1').value !== $('#p2').value) return er('كلمتا المرور غير متطابقتين.');
      progress('جارٍ تغيير كلمة المرور…');
      try {
        if (!await Store.changePassword($('#p0').value, $('#p1').value)) return er('كلمة المرور الحالية غير صحيحة.');
        ['#p0', '#p1', '#p2'].forEach(i => {$(i).value = '';});
        const b = modal(`<div class="eok">${svg('check', 30)}</div><h3>تم تغيير كلمة المرور</h3><p>استخدمها في المرة القادمة.</p><div class="eacts"><button class="ebtn" id="mNo">تم</button></div>`);
        $('#mNo', b).onclick = closeModal;
      } catch (x) {er(say(x));}
    };
    if (Store.demo) {
      const note = () => {$('#dmN').textContent = Store.changes ? 'التعديلات التي جرّبتها محفوظة في هذا المتصفح فقط.' : 'لا توجد تعديلات تجريبية الآن.'; $('#dmR').hidden = !Store.changes;};
      note();
      $('#dmR').onclick = async () => {
        const men = Object.keys(await Store.menList()).length;
        if (!await confirmBox('مسح تعديلات العرض؟', `يرجع كل شيء كما هو على الموقع.${men ? ` وتُمسح معها ${ar(men)} من صور الرجال.` : ''}`, 'نعم، امسح')) return;
        await Store.reset(); location.hash = ''; location.reload();
      };
    } else {
      disk($('#dk'));
      Store.disk().then(d => {if (d.quota) $('#qG').value = +(d.quota / 1073741824).toFixed(1);}).catch(() => {});
      $('#qf').onsubmit = async e => {e.preventDefault(); try {await Store.setQuota(+$('#qG').value || 0); disk($('#dk'));} catch (x) {}};
    }
  };

  // ===== القائمة الجانبية =====
  function build() {
    $('#snav').innerHTML = NAV.map(([h, t, i]) => `<a href="#${h}" data-k="${h}">${svg(i, 21)}<span>${t}</span></a>`).join('');
    $('#demoTag').hidden = !Store.demo;
    const side = $('#side'), open = v => {side.classList.toggle('open', v); $('#scrim').hidden = !v; $('#burger').setAttribute('aria-expanded', v);};
    $('#burger').onclick = () => open(!side.classList.contains('open'));
    $('#scrim').onclick = () => open(false);
    side.addEventListener('click', e => {if (e.target.closest('a')) open(false);});
    return k => {
      const key = NAV.some(n => n[0] === k) ? k : '';
      document.querySelectorAll('#snav a').forEach(a => {const on = a.dataset.k === key; a.classList.toggle('on', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');});
      $('#mtitle').textContent = NAV.find(n => n[0] === key)[1];
    };
  }
  return {build, tree, chain, nasab, treeTabs};
})();
