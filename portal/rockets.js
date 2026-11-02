// الأسماء (الذكور) تنطلق مثل الصواريخ من أغصان الشجرة إلى «الهذلي» — مشتركة بين الرئيسية وصفحة المجلات
async function startRockets() {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = $('#rockets'), g = cv.getContext('2d'), img = $('#treeImg'), live = $('#live'), gbar = $('#gbar');
  let D; try {D = await loadJSON('names.json');} catch (e) {return;}
  const N = D.n.filter(q => !q[3]), [bx, by] = D.base, tx = D.trunkX;
  let W = 0, H = 0, dpr = 1, R = {x: 0, y: 0, w: 0, h: 0}, onScreen = true;
  const size = () => {dpr = Math.min(2, devicePixelRatio || 1); const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr;
    const ir = img.getBoundingClientRect(); R = {x: ir.left - r.left, y: ir.top - r.top, w: ir.width, h: ir.height};};
  size(); addEventListener('resize', size); img.addEventListener('load', size);
  new IntersectionObserver(e => onScreen = e[0].isIntersecting).observe(cv);
  const P = (nx, ny) => [R.x + nx * R.w, R.y + ny * R.h];
  const mob = innerWidth < 640;
  let rate = mob ? 1.2 : 2, maxN = mob ? 7 : 12;
  const rk = []; let last = 0, flash = 0, lastFlash = 0, lastLive = 0, arrived = 0, slow = 0, prevT = 0;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const bez = (a, b, c, d, t) => {const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;};
  function spawn(t) {const q = N[(Math.random() * N.length) | 0]; const [sx, sy] = P(q[0], q[1]); if (sy > R.y + R.h * .78) return;
    rk.push({sx, sy, up: 30 + Math.random() * 30, name: q[2], t0: t, dur: 2400 + Math.random() * 800, trail: []});}
  function arrive(t, name) {arrived++;
    flash = Math.min(.8, flash + (t - lastFlash < 600 ? .15 : .55)); lastFlash = t;
    if (t - lastLive > 1200) {lastLive = t; live.style.opacity = 0; setTimeout(() => {live.textContent = `وصل الآن: ${name}`; live.style.opacity = 1;}, 200);}
    img.classList.add('pulse'); setTimeout(() => img.classList.remove('pulse'), 500);
    if (arrived % 10 === 0) {gbar.style.opacity = 1; gbar.style.boxShadow = '0 0 12px #E3B66B'; setTimeout(() => {gbar.style.opacity = .35; gbar.style.boxShadow = 'none';}, 900);}}
  if (RM) {   // بلا حركة: عشرة أسماء ساكنة
    setTimeout(() => {size(); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.font = '700 13px Cairo'; g.textAlign = 'center';
      for (let k = 0; k < 10; k++) {const q = N[(Math.random() * N.length) | 0], [x, y] = P(q[0], q[1]); g.lineWidth = 3; g.strokeStyle = 'rgba(27,24,51,.85)'; g.strokeText(q[2], x, y); g.fillStyle = '#FBFAF7'; g.fillText(q[2], x, y);}}, 600);
    return;}
  function frame(t) {
    requestAnimationFrame(frame);
    if (document.hidden || !onScreen) {prevT = t; return;}
    // الأداء: إذا بطؤت الإطارات نخفف المعدل للنصف
    if (prevT && t - prevT > 40) {if (++slow > 30) {rate = Math.max(.6, rate / 2); maxN = Math.max(4, maxN >> 1); slow = 0;}} else slow = Math.max(0, slow - 1);
    prevT = t;
    if (t - last > 1000 / rate && rk.length < maxN) {spawn(t); last = t;}
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const [ex, ey] = P(bx, by), [tX] = P(tx, 0);
    for (let i = rk.length - 1; i >= 0; i--) {const r = rk[i]; const p = (t - r.t0) / r.dur; if (p >= 1) {rk.splice(i, 1); arrive(t, r.name); continue;}
      const e = ease(p);
      // يصعد قليلاً من الغصن، ينحني إلى الجذع، ثم ينزل معه إلى القاعدة
      const x = bez(r.sx, r.sx + (tX - r.sx) * .1, tX, ex, e), y = bez(r.sy, r.sy - r.up * 2.2, r.sy + (ey - r.sy) * .45, ey, e);
      r.trail.push([x, y]); if (r.trail.length > 14) r.trail.shift();
      g.globalCompositeOperation = 'lighter';
      for (let k = 1; k < r.trail.length; k++) {const a = k / r.trail.length; g.strokeStyle = `rgba(227,182,107,${a * .8})`; g.lineWidth = 1 + a * 1.5; g.beginPath(); g.moveTo(r.trail[k - 1][0], r.trail[k - 1][1]); g.lineTo(r.trail[k][0], r.trail[k][1]); g.stroke();}
      g.fillStyle = 'rgba(227,182,107,.35)'; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill();
      g.fillStyle = '#FFE7B8'; g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill();
      g.globalCompositeOperation = 'source-over';
      const o = p < .1 ? p / .1 : p > .88 ? (1 - p) / .12 : 1;
      g.font = '700 13px Cairo'; g.textAlign = 'center'; g.direction = 'rtl';
      g.lineWidth = 3; g.strokeStyle = `rgba(27,24,51,${.85 * o})`; g.strokeText(r.name, x, y - 11);
      g.fillStyle = `rgba(251,250,247,${o})`; g.fillText(r.name, x, y - 11);
    }
    // توهج الهذلي عند الوصول (700ms)
    flash *= .955;
    if (flash > .02) {const rr = 90 * (1 - flash * .4); g.globalCompositeOperation = 'lighter';
      const gl = g.createRadialGradient(ex, ey, 0, ex, ey, rr); gl.addColorStop(0, `rgba(227,182,107,${flash})`); gl.addColorStop(1, 'rgba(227,182,107,0)');
      g.fillStyle = gl; g.beginPath(); g.arc(ex, ey, rr, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over';}
  }
  requestAnimationFrame(frame);
}
