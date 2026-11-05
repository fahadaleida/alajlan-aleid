// تجهيز الصور في المتصفح: طابور بعمّال في الخلفية حتى لا تتجمد الصفحة، مع احترام اتجاه الكاميرا (EXIF)
// الناتج لكل صورة: نسخة كاملة (١٦٠٠) ونسخة خفيفة (٧٦٨)، وبصمة من محتوى الملف الأصلي تكشف التكرار
const Photos = (() => {
  const FULL = 1600, SM = 768, Q = .82, SM_Q = .8, TARGET = 300 * 1024;   // ميزانية الموقع: حوالي ٢٥٠ك.ب للصورة
  // جوهر المعالجة: نفس الدالة تعمل في العامل وفي الصفحة (make = إنشاء لوحة، out = تحويلها إلى ملف)
  const core = `
    const fitIn = (w, h, L) => {const s = Math.min(1, L / Math.max(w, h)); return [Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s))];};
    const paint = (make, src, w, h) => {const c = make(w, h), g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(src, 0, 0, w, h); return c;};
    const keyOf = async file => 'p' + [...new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()))].slice(0, 6).map(b => b.toString(16).padStart(2, '0')).join('');
    // الجودة ${Q} هي الأساس، والصور المزدحمة جداً تنزل درجة أو درجتين حتى تبقى قريبة من الميزانية
    const squeeze = async (c, out) => {let b = await out(c, ${Q}); for (const q of [.74, .66]) {if (b.size <= ${TARGET}) break; b = await out(c, q);} return b;};
    const shrink = async (make, out, src, W, H) => {
      const [w, h] = fitIn(W, H, ${FULL}), c = paint(make, src, w, h), full = await squeeze(c, out);
      const [sw, sh] = fitIn(W, H, ${SM}), sm = await out(paint(make, c, sw, sh), ${SM_Q});
      return {w, h, full, sm};
    };`;
  const workerSrc = `${core}
    const make = (w, h) => new OffscreenCanvas(w, h), out = (c, q) => c.convertToBlob({type: 'image/jpeg', quality: q});
    onmessage = async e => {
      const {id, file, probe} = e.data;
      try {
        const bmp = await createImageBitmap(file, {imageOrientation: 'from-image'});
        if (probe) {postMessage({id, tall: bmp.height > bmp.width}); bmp.close(); return;}
        const key = await keyOf(file), r = await shrink(make, out, bmp, bmp.width, bmp.height);
        bmp.close(); postMessage({id, key, ...r});
      } catch (err) {postMessage({id, error: String(err && err.name || err)});}
    };`;
  const local = new Function(`${core}; return {keyOf, shrink};`)();
  const mainMake = (w, h) => {const c = document.createElement('canvas'); c.width = w; c.height = h; return c;};
  const mainOut = (c, q, type = 'image/jpeg') => new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error('encode')), type, q));
  const loadImg = async file => {
    const u = URL.createObjectURL(file), im = new Image(); im.src = u;
    try {await im.decode(); return im;} finally {setTimeout(() => URL.revokeObjectURL(u), 1000);}
  };
  // طريق احتياطي على الصفحة نفسها: صورة <img> تحترم الاتجاه في كل المتصفحات الحديثة
  async function onMain(file) {
    const im = await loadImg(file), key = await local.keyOf(file);
    await new Promise(r => setTimeout(r));
    return {key, ...await local.shrink(mainMake, mainOut, im, im.naturalWidth, im.naturalHeight)};
  }

  // ملف JPEG صغير (٢×١) باتجاه ٦: لو طلع طولياً فالعامل يحترم EXIF ويمكن الاعتماد عليه، وإلا نستخدم الطريق الاحتياطي
  const PROBE = '/9j/4AAQSkZJRgABAQAAAQABAAD/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAYAAAAAAAD/2wBDABsSFBcUERsXFhceHBsgKEIrKCUlKFE6PTBCYFVlZF9VXVtqeJmBanGQc1tdhbWGkJ6jq62rZ4C8ybqmx5moq6T/2wBDARweHigjKE4rK06kbl1upKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKT/wAARCAABAAIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwChRRRXGfSH/9k=';
  const phone = matchMedia('(pointer:coarse)').matches, SIZE = phone ? 2 : Math.min(4, Math.max(2, (navigator.hardwareConcurrency || 4) >> 1));
  let pool = null;
  const ask = (w, msg) => new Promise(res => {w.onmessage = e => res(e.data); w.onerror = () => res({error: 'worker'}); w.postMessage(msg);});
  async function workers() {
    if (pool) return pool;
    pool = (async () => {
      try {
        if (typeof OffscreenCanvas === 'undefined') return [];
        const url = URL.createObjectURL(new Blob([workerSrc], {type: 'text/javascript'})), first = new Worker(url);
        const bytes = Uint8Array.from(atob(PROBE), c => c.charCodeAt(0));
        const r = await ask(first, {id: 0, probe: 1, file: new Blob([bytes], {type: 'image/jpeg'})});
        if (!r.tall) {first.terminate(); return [];}
        return [first, ...Array.from({length: SIZE - 1}, () => new Worker(url))];
      } catch (e) {return [];}
    })();
    return pool;
  }

  const isHeic = f => /image\/hei[cf]/i.test(f.type) || /\.hei[cf]$/i.test(f.name);
  const isImage = f => /^image\//.test(f.type) || /\.(jpe?g|png|webp|hei[cf]|gif|bmp|tiff?|avif)$/i.test(f.name);
  const why = f => isHeic(f) ? 'صيغة HEIC من الآيفون، وهذا المتصفح لا يفتحها. جرّب رفعها من جوال الآيفون مباشرة، أو غيّر الكاميرا إلى «الأكثر توافقاً»' : 'الملف تالف أو لا يمكن فتحه';

  // طابور: jobs = [{file, done(result|null, reason)}]
  const queue = [];
  let running = 0;
  async function pump() {
    const ws = await workers(), limit = ws.length || 2, free = [...ws];
    const next = () => {
      while (running < limit && queue.length) {
        const job = queue.shift(), w = free.pop();
        running++;
        (async () => {
          let r;
          try {
            if (w) {r = await ask(w, {id: 1, file: job.file}); if (r.error) r = await onMain(job.file);}   // العامل فشل؟ جرّب المتصفح نفسه (Safari يفتح HEIC هناك)
            else r = await onMain(job.file);
            job.done(r, null);
          } catch (e) {job.done(null, why(job.file));}
          running--; if (w) free.push(w);
          next();
        })();
      }
      if (!queue.length && !running) pumping = false;
    };
    next();
  }
  let pumping = false;
  const add = (file, done) => {
    if (!isImage(file)) {done(null, 'هذا الملف ليس صورة'); return;}
    queue.push({file, done});
    if (!pumping) {pumping = true; pump();}
  };

  // غلاف عدد المجلة: الموقع يطلب cover.webp، وSafari القديم لا يكتب webp فيُحفظ JPEG بنفس الاسم والمتصفحات تعرضه عادي
  async function magCover(file) {
    const im = await loadImg(file), s = Math.min(1, 840 / im.naturalWidth), w = Math.round(im.naturalWidth * s), h = Math.round(im.naturalHeight * s);
    const c = mainMake(w, h), g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(im, 0, 0, w, h);
    return mainOut(c, .82, 'image/webp');
  }
  const base64 = b => new Promise((res, rej) => {const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.onerror = rej; r.readAsDataURL(b);});
  return {add, magCover, base64, isHeic};
})();

// ===== المسودة: تبقى في IndexedDB حتى لو انقفلت الصفحة أو انقطع الاتصال =====
const Draft = (() => {
  let dbp = null;
  const db = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open('ajlan-admin', 1);
    r.onupgradeneeded = () => {r.result.createObjectStore('meta'); r.result.createObjectStore('photos');};
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
  const tx = async (st, mode, fn) => {
    const d = await db();
    return new Promise((res, rej) => {const t = d.transaction(st, mode), q = fn(t.objectStore(st)); t.oncomplete = () => res(q && q.result); t.onerror = t.onabort = () => rej(t.error);});
  };
  const safe = p => p.catch(() => null);   // وضع التصفح الخاص قد يمنع التخزين: المحرر يكمل بدون مسودة
  return {
    meta: m => safe(tx('meta', 'readwrite', s => s.put(m, 'draft'))),
    photo: (key, v) => safe(tx('photos', 'readwrite', s => s.put(v, key))),
    drop: key => safe(tx('photos', 'readwrite', s => s.delete(key))),
    load: () => safe(tx('meta', 'readonly', s => s.get('draft'))),
    blobs: key => safe(tx('photos', 'readonly', s => s.get(key))),
    clear: () => safe(Promise.all([tx('meta', 'readwrite', s => s.clear()), tx('photos', 'readwrite', s => s.clear())])),
  };
})();
