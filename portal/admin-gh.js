// النشر من المتصفح: كل عملية نشر = التزام (commit) واحد في مستودع الموقع عبر GitHub Git Data API
// لا يوجد خادم، والمفتاح يُفك تشفيره في الذاكرة فقط بعد تسجيل الدخول، ولا يُكتب أبداً في أي تخزين أو سجل.
const GH = (() => {
  const REPO = 'fahadaleida/alajlan-aleid', BRANCH = 'main', ROOT = 'portal/', R = `/repos/${REPO}`;
  // تغيير عنوان الواجهة للتجربة المحلية فقط، ولا يعمل في الموقع المنشور
  const API = (location.hostname === '127.0.0.1' && new URLSearchParams(location.search).get('gh')) || 'https://api.github.com';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let token = null;

  class Fail extends Error {
    constructor(status, message, wait = 0) {super(message); this.status = status; this.wait = wait;}
  }
  async function once(method, path, body) {
    let r;
    try {
      r = await fetch(API + path, {method, cache: 'no-store', body: body ? JSON.stringify(body) : undefined,
        headers: {Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, ...(body ? {'Content-Type': 'application/json'} : {})}});
    } catch (e) {throw new Fail(0, 'network');}
    if (r.ok) return r.json();
    const j = await r.json().catch(() => ({})), ra = +r.headers.get('retry-after') || 0, left = r.headers.get('x-ratelimit-remaining');
    const reset = (+r.headers.get('x-ratelimit-reset') || 0) - Date.now() / 1000;
    const limited = r.status === 429 || (r.status === 403 && (ra || left === '0' || /rate limit/i.test(j.message || '')));
    throw new Fail(r.status, j.message || '', limited ? Math.ceil(Math.max(ra, left === '0' ? reset : 0, 20)) : 0);
  }
  // يعيد المحاولة عند انقطاع الاتصال أو خطأ الخادم، وينتظر المدة التي يطلبها GitHub عند تجاوز الحد
  async function call(method, path, body, onWait) {
    let waited = 0;
    for (let a = 0; ; a++) {
      try {return await once(method, path, body);}
      catch (e) {
        if (e.wait && waited < 900) {if (onWait) onWait(e.wait); await sleep(e.wait * 1000); waited += e.wait; continue;}
        if ((e.status === 0 || e.status >= 500) && a < 4) {await sleep(1000 * 2 ** a); continue;}
        throw e;
      }
    }
  }
  // GitHub يسمح بنحو ٨٠ عملية إنشاء في الدقيقة، فنبقى تحتها: الألبومات الصغيرة لا تشعر بها والكبيرة تسير بثبات
  const stamps = [];
  async function gate() {
    for (;;) {
      const now = Date.now();
      while (stamps.length && now - stamps[0] > 60000) stamps.shift();
      if (stamps.length < 70) {stamps.push(now); return;}
      await sleep(60000 - (now - stamps[0]) + 30);
    }
  }
  const blob64 = async (b64, onWait) => {await gate(); return (await call('POST', `${R}/git/blobs`, {content: b64, encoding: 'base64'}, onWait)).sha;};
  const blobText = async s => {await gate(); return (await call('POST', `${R}/git/blobs`, {content: s, encoding: 'utf-8'})).sha;};

  // ===== القراءة: دائماً من آخر التزام في المستودع، لا من نسخة Pages المخبّأة =====
  const trees = new Map(), texts = new Map(), commits = new Map();
  const tree = async sha => {
    if (!trees.has(sha)) {const t = await call('GET', `${R}/git/trees/${sha}`); trees.set(sha, new Map(t.tree.map(e => [e.path, e])));}
    return trees.get(sha);
  };
  const dec = b64 => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), c => c.charCodeAt(0)));
  async function snapshot() {
    const commit = (await call('GET', `${R}/git/ref/heads/${BRANCH}`)).object.sha;
    if (!commits.has(commit)) commits.set(commit, (await call('GET', `${R}/git/commits/${commit}`)).tree.sha);
    const root = commits.get(commit);
    const entry = async path => {
      let sha = root, e = null;
      for (const seg of (ROOT + path).split('/').filter(Boolean)) {
        e = (await tree(sha)).get(seg); if (!e) return null; sha = e.sha;
      }
      return e;
    };
    const text = async path => {
      const e = await entry(path); if (!e) return null;
      if (!texts.has(e.sha)) texts.set(e.sha, dec((await call('GET', `${R}/git/blobs/${e.sha}`)).content));
      return texts.get(e.sha);
    };
    return {commit, root, entry, text,
      json: async path => {const t = await text(path); return t == null ? null : JSON.parse(t);},
      list: async path => {const e = await entry(path); return e ? [...(await tree(e.sha)).keys()].map(n => `${path}/${n}`) : [];}};
  }

  // ===== الكتابة: build يبني التغيير فوق آخر نسخة، فلو تحرّك المستودع نعيد القراءة والبناء ونحاول من جديد =====
  // build(snap) يرجّع {files: {مسار: نص أو null للحذف}, blobs: {مسار: sha}, ...}
  async function commit(build, message) {
    let last;
    for (let a = 0; a < 6; a++) {
      const snap = await snapshot(), out = await build(snap), items = [];
      for (const [path, val] of Object.entries(out.files || {})) {
        const cur = await snap.entry(path);
        if (val === null) {if (cur) items.push({path: ROOT + path, mode: '100644', type: 'blob', sha: null}); continue;}
        if (cur && await snap.text(path) === val) continue;
        items.push({path: ROOT + path, mode: '100644', type: 'blob', sha: await blobText(val)});
      }
      for (const [path, sha] of Object.entries(out.blobs || {})) items.push({path: ROOT + path, mode: '100644', type: 'blob', sha});
      if (!items.length) return {...out, sha: snap.commit};
      await gate();
      const t = await call('POST', `${R}/git/trees`, {base_tree: snap.root, tree: items});
      await gate();
      const c = await call('POST', `${R}/git/commits`, {message, tree: t.sha, parents: [snap.commit]});
      try {
        await call('PATCH', `${R}/git/refs/heads/${BRANCH}`, {sha: c.sha, force: false});
        return {...out, sha: c.sha};
      } catch (e) {
        if (e.status !== 409 && e.status !== 422 && e.status !== 0 && e.status < 500) throw e;
        last = e;
        // ربما نجح التحديث وضاع الرد: لا ننشر مرتين
        if ((await call('GET', `${R}/git/ref/heads/${BRANCH}`)).object.sha === c.sha) return {...out, sha: c.sha};
        await sleep(600 + a * 500);
      }
    }
    throw last;
  }

  return {REPO, Fail, snapshot, commit, blob64,
    get connected() {return !!token;},
    setToken: t => {const old = token; token = t; return old;},
    check: () => call('GET', R),
    sleep};
})();

// ===== القبو: تشفير المفتاح وكلمة المرور (data/admin-key.json) =====
// الملف عام في المستودع: فيه بصمة كلمة المرور ونص مشفّر فقط. كلمة المرور نفسها لا تُحفظ، ويبقى في الذاكرة مفتاح AES غير قابل للاستخراج.
const Vault = (() => {
  const FILE = 'data/admin-key.json', AES_ITER = 600000, enc = new TextEncoder();
  const b64 = u => btoa(String.fromCharCode(...new Uint8Array(u)));
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const rand = n => crypto.getRandomValues(new Uint8Array(n));
  let file = null, auth = null, aes = null, tokSalt = null, user = '';

  const base = (u, p, use) => crypto.subtle.importKey('raw', enc.encode(`${u}:${p}`), 'PBKDF2', false, use);
  const hashOf = async (u, p, a) => b64(await crypto.subtle.deriveBits({name: 'PBKDF2', hash: 'SHA-256', salt: unb64(a.salt), iterations: a.iter}, await base(u, p, ['deriveBits']), 256));
  const aesOf = async (u, p, salt, iter) => crypto.subtle.deriveKey({name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter}, await base(u, p, ['deriveKey']), {name: 'AES-GCM', length: 256}, false, ['encrypt', 'decrypt']);
  const seal = async (key, salt, token) => {
    const iv = rand(12), ct = await crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, enc.encode(token));
    return {salt: b64(salt), iter: AES_ITER, iv: b64(iv), ct: b64(ct)};
  };
  const text = (a, tok) => JSON.stringify({v: 1, auth: a, tok}, null, 1);

  return {
    FILE,
    // AUTH المضمّن في الصفحة احتياطي لأول مرة، وبعد الربط يصير الملف هو المرجع
    async init(fallback) {
      auth = fallback;
      try {
        const r = await fetch(FILE, {cache: 'no-cache'});
        if (r.ok) {file = await r.json(); if (file.auth) auth = file.auth;}
      } catch (e) {}
    },
    // يرجّع false لو البيانات خطأ، وإلا يفتح القبو ويحمّل المفتاح في الذاكرة إن وُجد
    async login(u, p) {
      if (u !== auth.user || await hashOf(u, p, auth) !== auth.hash) return false;
      user = u;
      const t = file && file.tok;
      tokSalt = t ? unb64(t.salt) : rand(16);
      aes = await aesOf(u, p, tokSalt, t ? t.iter : AES_ITER);
      if (t) {
        try {GH.setToken(new TextDecoder().decode(await crypto.subtle.decrypt({name: 'AES-GCM', iv: unb64(t.iv)}, aes, unb64(t.ct))));}
        catch (e) {aes = await aesOf(u, p, tokSalt = rand(16), AES_ITER);}   // ملف قديم بكلمة أخرى: يبقى العرض فقط ويطلب الربط من جديد
      }
      return true;
    },
    // الربط أول مرة (أو تجديد المفتاح): يتحقق من المفتاح ثم يحفظه مشفّراً في المستودع
    async connect(token) {
      const prev = GH.setToken(token);
      try {
        await GH.check();
        const tok = await seal(aes, tokSalt, token);
        await GH.commit(() => ({files: {[FILE]: text(auth, tok)}}), 'لوحة التحكم: ربط النشر');
        file = {v: 1, auth, tok};
      } catch (e) {GH.setToken(prev); throw e;}
    },
    async changePassword(cur, next) {
      if (await hashOf(user, cur, auth) !== auth.hash) return false;
      const t = file.tok, token = new TextDecoder().decode(await crypto.subtle.decrypt({name: 'AES-GCM', iv: unb64(t.iv)}, aes, unb64(t.ct)));
      const a = {user, salt: b64(rand(16)), iter: auth.iter}; a.hash = await hashOf(user, next, a);
      const salt = rand(16), key = await aesOf(user, next, salt, AES_ITER), tok = await seal(key, salt, token);
      await GH.commit(() => ({files: {[FILE]: text(a, tok)}}), 'لوحة التحكم: تغيير كلمة المرور');
      auth = a; aes = key; tokSalt = salt; file = {v: 1, auth: a, tok};
      return true;
    },
  };
})();

// ===== ملفات البيانات: نفس تنسيق ما هو موجود بالضبط، فالملفات التي لم تتغير لا تُكتب =====
const Repo = {
  bodies: async (snap, posts) => {
    const n = Math.ceil(posts.length / 50), by = {};
    (await Promise.all(Array.from({length: n}, (_, k) => snap.json(`data/posts/${k}.json`)))).forEach(s => Object.assign(by, s || {}));
    return by;
  },
  // الصفحات تجد الخبر بـ index÷50، فأي إدخال في الأعلى يعيد توزيع كل الشرائح في نفس الالتزام
  write: (posts, by, oldCount) => {
    const files = {'data/posts.json': JSON.stringify(posts)}, n = Math.ceil(posts.length / 50);
    for (let k = 0; k < n; k++) files[`data/posts/${k}.json`] = '{' + posts.slice(k * 50, k * 50 + 50).map(p => `${JSON.stringify(String(p.id))}:${JSON.stringify(by[p.id])}`).join(',') + '}';
    for (let k = n; k < Math.ceil(oldCount / 50); k++) files[`data/posts/${k}.json`] = null;
    return files;
  },
  site: s => JSON.stringify(s, null, 1),
};
