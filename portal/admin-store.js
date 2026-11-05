// طبقة التخزين: واجهة واحدة للوحة، ولها طريقان يُختاران تلقائياً
// server: api/ping.php يجيب، والنشر حقيقي على الخادم.  demo: لا يوجد خادم، والتعديلات تبقى في هذا المتصفح فقط ولا تُنشر للناس.
class StoreFail extends Error {
  constructor(status, note = '', extra = {}) {super(note || String(status)); this.status = status; this.note = note; Object.assign(this, extra);}
}
const Store = (() => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const snapOf = (read, list, rev) => {
    const memo = new Map(), text = p => {if (!memo.has(p)) memo.set(p, read(p)); return memo.get(p);};
    return {rev, text, list, json: async p => {const t = await text(p); return t == null ? null : JSON.parse(t);}};
  };
  const pub = (p, o) => fetch(p, o).then(r => r.ok ? r.text() : null);

  // ===== الخادم =====
  const CHUNK = 600 * 1024;   // بعض الخوادم ترفض الطلب فوق ١ ميجا، فالحفظ الكبير يُرسل على دفعات ثم يُطبَّق مرة واحدة
  let csrf = '', who = '', onExpired = null;
  async function hit(name, {method = 'GET', json, form} = {}) {
    let r;
    const headers = {}; if (csrf) headers['X-CSRF-Token'] = csrf; if (json) headers['Content-Type'] = 'application/json';
    try {r = await fetch('api/' + name, {method, cache: 'no-store', credentials: 'same-origin', headers, body: json ? JSON.stringify(json) : form});}
    catch (e) {throw new StoreFail(0);}
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.ok) return j;
    throw new StoreFail(r.status, j.msg || '', {code: j.error, wait: j.wait});
  }
  // يعيد المحاولة عند انقطاع الاتصال، ولو انتهت الجلسة يطلب كلمة المرور في مكانه ويكمل بدون أن يضيع شيء
  async function api(name, opt, tries = 3) {
    for (let a = 0, again = true; ; a++) {
      try {return await hit(name, opt);}
      catch (e) {
        if (e.status === 401 && again && onExpired && await onExpired(who)) {again = false; a--; continue;}
        if ((e.status === 0 || e.status >= 500) && a < tries - 1) {await sleep(800 * 2 ** a); continue;}
        throw e;
      }
    }
  }
  const server = {
    async resume() {try {const j = await hit('me.php'); csrf = j.csrf; who = j.user; return true;} catch (e) {return false;}},
    async login(u, p) {
      try {const j = await hit('login.php', {method: 'POST', json: {user: u, pass: p}}); csrf = j.csrf; who = j.user; return true;}
      catch (e) {if (e.status === 401) return false; throw e;}
    },
    logout: () => hit('logout.php', {method: 'POST', json: {}}).catch(() => {}),
    async snapshot() {
      const {rev} = await api('me.php'), t = Date.now();
      return snapOf(p => pub(`${p}?t=${t}`, {cache: 'no-store'}), async dir => {
        const id = (dir.match(/^img\/posts\/(\d+)$/) || [])[1]; if (!id) return [];
        return (await api(`list.php?id=${id}`)).files;
      }, rev);
    },
    async apply(files, rev) {
      const txn = Array.from(crypto.getRandomValues(new Uint8Array(8)), b => b.toString(16).padStart(2, '0')).join('');
      const packs = [[]]; let size = 0;
      for (const [path, text] of Object.entries(files)) {
        const n = text ? new Blob([text]).size : 0;
        if (size && size + n > CHUNK) {packs.push([]); size = 0;}
        packs[packs.length - 1].push([path, text]); size += n;
      }
      for (let k = 0; k < packs.length; k++) await api('save.php', {method: 'POST', json: {txn, rev, n: Object.keys(files).length, final: k === packs.length - 1, files: Object.fromEntries(packs[k])}});
    },
    reserve: async () => (await api('reserve.php', {method: 'POST', json: {}})).id,
    // صورة واحدة في كل طلب. الاسم يختاره الخادم ويرجّعه، ولا يُرسل اسم الملف الأصلي
    async upload(to, blob) {
      const f = new FormData(); Object.entries(to).forEach(([k, v]) => f.append(k, v)); f.append('file', blob, 'photo');
      return (await api('upload.php', {method: 'POST', form: f})).path;
    },
    changePassword: async (cur, next) => {
      try {await api('password.php', {method: 'POST', json: {cur, next}}); return true;}
      catch (e) {if (e.code === 'wrong') return false; throw e;}
    },
    disk: async () => {const j = await api('disk.php'); return {used: j.used, total: j.quota || (j.free == null ? 0 : j.used + j.free), quota: j.quota};},
    setQuota: gb => api('disk.php', {method: 'POST', json: {quota_gb: gb}}),
    src: u => u,
    reset: async () => {},
  };

  // ===== نسخة العرض: طبقة فوق ملفات الموقع في IndexedDB، والموقع نفسه لا يتغير =====
  const FLAG = 'ajlan-demo', SESSION = 'ajlan-demo-in', full = e => new StoreFail(-1, 'مساحة هذا المتصفح لا تكفي لحفظ هذا التعديل.');
  const over = new Map(), urls = new Map();   // over: مسار ← نص، أو null لو محذوف.  urls: مسار ← رابط الصورة في هذا المتصفح
  let dbp = null, auth = null;
  const db = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open('ajlan-demo', 1);
    r.onupgradeneeded = () => {r.result.createObjectStore('files'); r.result.createObjectStore('blobs');};
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
  const tx = async (st, mode, fn) => {
    const d = await db();
    return new Promise((res, rej) => {const t = d.transaction(st, mode), q = fn(t.objectStore(st)); t.oncomplete = () => res(q && q.result); t.onerror = t.onabort = () => rej(t.error);});
  };
  const all = async st => {
    const out = [], d = await db();
    await new Promise((res, rej) => {const q = d.transaction(st).objectStore(st).openCursor(); q.onerror = () => rej(q.error);
      q.onsuccess = () => {const c = q.result; if (!c) return res(); out.push([c.key, c.value]); c.continue();};});
    return out;
  };
  const flag = on => {try {on ? localStorage.setItem(FLAG, '1') : localStorage.removeItem(FLAG);} catch (e) {}};
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const hashOf = async (u, p, a) => {
    const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(`${u}:${p}`), 'PBKDF2', false, ['deriveBits']);
    return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.deriveBits({name: 'PBKDF2', hash: 'SHA-256', salt: unb64(a.salt), iterations: a.iter}, k, 256))));
  };
  async function loadDemo() {
    try {
      (await all('files')).forEach(([k, v]) => over.set(k, v));
      (await all('blobs')).forEach(([k, v]) => urls.set(k, URL.createObjectURL(v)));
    } catch (e) {}
  }
  const demo = {
    async resume() {try {if (sessionStorage.getItem(SESSION) !== '1') return false;} catch (e) {return false;} await loadDemo(); return true;},
    async login(u, p) {
      if (u !== auth.user || await hashOf(u, p, auth) !== auth.hash) return false;
      try {sessionStorage.setItem(SESSION, '1');} catch (e) {}
      await loadDemo(); return true;
    },
    logout: async () => {try {sessionStorage.removeItem(SESSION);} catch (e) {}},
    async snapshot() {
      return snapOf(p => over.has(p) ? Promise.resolve(over.get(p)) : pub(p, {cache: 'no-cache'}),
        async dir => [...urls.keys()].filter(k => k.startsWith(dir + '/')));
    },
    async apply(files) {
      try {
        await tx('files', 'readwrite', s => {for (const [k, v] of Object.entries(files)) if (!/^img\//.test(k)) s.put(v, k);});
        const gone = Object.keys(files).filter(k => /^img\//.test(k));
        if (gone.length) await tx('blobs', 'readwrite', s => {gone.forEach(k => s.delete(k));});
        gone.forEach(k => urls.delete(k));
      } catch (e) {throw full(e);}
      for (const [k, v] of Object.entries(files)) if (!/^img\//.test(k)) over.set(k, v);
      flag(true);
    },
    async reserve() {
      const posts = JSON.parse(over.get('data/posts.json') || await pub('data/posts.json', {cache: 'no-cache'}));
      let last = 0; try {last = +localStorage.getItem('ajlan-demo-id') || 0;} catch (e) {}
      const id = Math.max(last, ...posts.map(p => p.id)) + 1;
      try {localStorage.setItem('ajlan-demo-id', id);} catch (e) {}
      return id;
    },
    async upload(to, blob) {
      const name = Array.from(crypto.getRandomValues(new Uint8Array(8)), b => b.toString(16).padStart(2, '0')).join('');
      const path = to.kind === 'cover' ? `mags/${to.n}/cover.webp` : `img/posts/${to.id}/${name}.jpg`;
      try {await tx('blobs', 'readwrite', s => {s.put(blob, path);});} catch (e) {throw full(e);}
      urls.set(path, URL.createObjectURL(blob)); flag(true);
      return path;
    },
    changePassword: async () => {throw new StoreFail(-1, 'في نسخة العرض كلمة المرور ثابتة. تتغير من هنا بعد نقل الموقع إلى الدومين.');},
    async disk() {
      const e = navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate().catch(() => ({})) : {};
      return {used: e.usage || 0, total: e.quota || 0, browser: true};
    },
    setQuota: async () => {},
    src: u => urls.get(u) || u,
    async reset() {
      await Promise.all([tx('files', 'readwrite', s => {s.clear();}), tx('blobs', 'readwrite', s => {s.clear();})]);
      over.clear(); urls.forEach(u => URL.revokeObjectURL(u)); urls.clear(); flag(false);
    },
  };

  let A = demo;
  return {
    mode: 'demo', configured: true,
    get demo() {return A === demo;},
    get user() {return A === demo ? auth.user : who;},
    get changes() {return A === demo ? over.size + urls.size : 0;},
    // نسأل الخادم: جواب صحيح = نشر حقيقي، خطأ خادم = نقول ذلك ولا نتحول للعرض بصمت، وعدم وجوده = نسخة عرض
    async init(demoAuth) {
      auth = demoAuth;
      let r = null;
      try {r = await fetch('api/ping.php', {cache: 'no-store'});} catch (e) {return this.mode = 'down';}
      if (r.status >= 500) return this.mode = 'down';
      const j = await r.json().catch(() => null);
      if (r.ok && j && j.app === 'ajlan-portal') {A = server; this.configured = !!j.configured; flag(false); return this.mode = 'server';}
      return this.mode = 'demo';
    },
    onExpired(fn) {onExpired = fn;},
    resume: () => A.resume(), login: (u, p) => A.login(u, p), logout: () => A.logout(),
    snapshot: () => A.snapshot(), reserve: () => A.reserve(), upload: (to, b) => A.upload(to, b),
    changePassword: (c, n) => A.changePassword(c, n), disk: () => A.disk(), setQuota: g => A.setQuota(g),
    src: u => A.src(u), reset: () => A.reset(),
    // build(snap) يبني التغيير فوق آخر نسخة ويرجّع {files: {مسار: نص أو null للحذف}}. لو تغيّر الموقع في الأثناء نعيد البناء من جديد
    async commit(build) {
      let last;
      for (let a = 0; a < 6; a++) {
        const snap = await A.snapshot(), out = await build(snap), diff = {};
        for (const [path, val] of Object.entries(out.files || {})) if (val === null || /^data\/albums\/\d/.test(path) || await snap.text(path) !== val) diff[path] = val;   // ملف الألبوم قد يكون جديداً، فلا نطلبه للمقارنة
        if (!Object.keys(diff).length) return out;
        try {await A.apply(diff, snap.rev); return out;}
        catch (e) {if (e.status !== 409) throw e; last = e; await sleep(400 + a * 400);}
      }
      throw last;
    },
  };
})();

// ===== ملفات البيانات: نفس تنسيق الموجود بالضبط، فالملفات التي لم تتغير لا تُكتب =====
const Repo = {
  bodies: async (snap, posts) => {
    const n = Math.ceil(posts.length / 50), by = {};
    (await Promise.all(Array.from({length: n}, (_, k) => snap.json(`data/posts/${k}.json`)))).forEach(s => Object.assign(by, s || {}));
    return by;
  },
  // الصفحات تجد الخبر بـ index÷50، فأي إدخال في الأعلى يعيد توزيع كل الشرائح في نفس الحفظ
  write: (posts, by, oldCount) => {
    const files = {'data/posts.json': JSON.stringify(posts)}, n = Math.ceil(posts.length / 50);
    for (let k = 0; k < n; k++) files[`data/posts/${k}.json`] = '{' + posts.slice(k * 50, k * 50 + 50).map(p => `${JSON.stringify(String(p.id))}:${JSON.stringify(by[p.id])}`).join(',') + '}';
    for (let k = n; k < Math.ceil(oldCount / 50); k++) files[`data/posts/${k}.json`] = null;
    return files;
  },
  site: s => JSON.stringify(s, null, 1),
};
