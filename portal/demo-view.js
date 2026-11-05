// نسخة العرض فقط: يعمل في متصفح من جرّب اللوحة بدون خادم، حتى يرى تعديلاته في صفحات الموقع. لا يصل لأي زائر آخر ولا يغيّر شيئاً على الموقع
(() => {
  const real = window.fetch.bind(window), urls = new Map();
  const open = new Promise((res, rej) => {const r = indexedDB.open('ajlan-demo', 1); r.onupgradeneeded = () => {r.result.createObjectStore('files'); r.result.createObjectStore('blobs');}; r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);});
  const get = async (st, k) => {const d = await open; return new Promise((res, rej) => {const q = d.transaction(st).objectStore(st).get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error);});};
  const blobUrl = async p => {
    if (urls.has(p)) return urls.get(p);
    const b = await get('blobs', p).catch(() => null), u = b ? URL.createObjectURL(b) : null;
    urls.set(p, u); return u;
  };
  // ملف الألبوم يكتب المجلد في base والأسماء وحدها، فنكمل المسار قبل التبديل
  const fullPaths = t => {
    const j = JSON.parse(t); if (!/^img\/posts\//.test(j.base || '')) return t;
    const row = r => r && r.map((v, k) => [0, 3, 4].includes(k) && v ? j.base + v : v);
    return JSON.stringify({...j, base: '', cover: row(j.cover), imgs: j.imgs.map(row)});
  };
  async function swap(t) {
    for (const p of new Set(t.match(/img\/posts\/\d+\/[\w-]+\.jpg/g) || [])) {const u = await blobUrl(p); if (u) t = t.split(p).join(u);}
    return t;
  }
  window.fetch = async (input, opt) => {
    const m = new URL(typeof input === 'string' ? input : input.url, location.href).pathname.match(/\/(data\/[\w/.-]+\.json)$/);
    if (!m) return real(input, opt);
    const t = await get('files', m[1]).catch(() => undefined);
    if (t === undefined) return real(input, opt);
    return t === null ? new Response('', {status: 404}) : new Response(await swap(/\/albums\/\d+\.json$/.test(m[1]) ? fullPaths(t) : t), {headers: {'Content-Type': 'application/json'}});
  };
  // أغلفة المجلات الجديدة تُطلب من الصفحة مباشرة
  addEventListener('error', async e => {
    const im = e.target, m = im && im.tagName === 'IMG' && (im.getAttribute('src') || '').match(/mags\/\d+\/cover\.webp/);
    if (m) {const u = await blobUrl(m[0]); if (u) im.src = u;}
  }, true);
  addEventListener('DOMContentLoaded', () => {
    if (window.self !== window.top) return;
    const n = document.createElement('div');
    n.textContent = 'نسخة عرض: تعديلاتك تظهر في هذا المتصفح فقط';
    n.style.cssText = 'position:fixed;z-index:9999;bottom:12px;left:12px;max-width:calc(100vw - 24px);padding:7px 14px;border-radius:999px;background:#1A1448;color:#fff;font:700 13px Cairo,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.35);pointer-events:none';
    document.body.appendChild(n);
  });
})();
