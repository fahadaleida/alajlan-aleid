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
  const rk = [], sp = [], rings = []; let last = 0, flash = 0, lastFlash = 0, lastLive = 0, arrived = 0, slow = 0, prevT = 0;
  const maxSp = mob ? 70 : 140;
  const SOIL = .9906;   // خط التراب تحت «الهذلي» (نسبة من ارتفاع صورة الشجرة)
  function spawn(t) {const q = N[(Math.random() * N.length) | 0]; const [sx, sy] = P(q[0], q[1]); if (sy > R.y + R.h * .78) return;
    const [ex, ey] = P(bx, by), dist = Math.hypot(ex - sx, ey - sy);
    rk.push({sx, sy, name: q[2], t0: t, dur: 1700 + dist * 3.2 + Math.random() * 500, ph: Math.random() * 6.28,
      sw: (8 + Math.min(22, Math.abs(ex - sx) * .12)) * (Math.random() < .5 ? -1 : 1), cyc: 1.2 + Math.random() * .8, lx: sx, ly: sy, trail: []});}
  function burst(x, y) {   // شرر ذهبي يتطاير من «الهذلي» ثم يسقط
    for (let k = 0; k < (mob ? 7 : 12) && sp.length < maxSp; k++) {const a = -Math.PI / 2 + (Math.random() - .5) * 2.4, v = (.03 + Math.random() * .06) * Math.max(.7, R.h / 500);
      sp.push({x, y: y - 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: .00016, life: 600 + Math.random() * 400, age: 0, r: .6 + Math.random() * .9});}}
  function arrive(t, name) {arrived++;
    flash = Math.min(.85, flash + (t - lastFlash < 600 ? .18 : .6)); lastFlash = t;
    const [rx, ry] = P(bx, SOIL); rings.push({x: rx, y: ry, t0: t}); if (rings.length > 4) rings.shift();
    const [ex, ey] = P(bx, by); burst(ex, ey + R.h * .008);
    if (live && t - lastLive > 1200) {lastLive = t; live.style.opacity = 0; setTimeout(() => {live.textContent = `وصل الآن: ${name}`; live.style.opacity = 1;}, 200);}
    img.classList.add('pulse'); setTimeout(() => img.classList.remove('pulse'), 500);
    if (gbar && arrived % 10 === 0) {gbar.style.opacity = 1; gbar.style.boxShadow = '0 0 12px #E3B66B'; setTimeout(() => {gbar.style.opacity = .35; gbar.style.boxShadow = 'none';}, 900);}}
  if (RM) {   // بلا حركة: عشرة أسماء ساكنة
    setTimeout(() => {size(); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.font = '700 13px Cairo'; g.textAlign = 'center';
      for (let k = 0; k < 10; k++) {const q = N[(Math.random() * N.length) | 0], [x, y] = P(q[0], q[1]); g.lineWidth = 3; g.strokeStyle = 'rgba(27,24,51,.85)'; g.strokeText(q[2], x, y); g.fillStyle = '#FBFAF7'; g.fillText(q[2], x, y);}}, 600);
    return;}
  function frame(t) {
    requestAnimationFrame(frame);
    if (document.hidden || !onScreen) {prevT = t; return;}
    // الأداء: إذا بطؤت الإطارات نخفف المعدل للنصف
    if (prevT && t - prevT > 40) {if (++slow > 30) {rate = Math.max(.6, rate / 2); maxN = Math.max(4, maxN >> 1); slow = 0;}} else slow = Math.max(0, slow - 1);
    const dt = Math.min(50, prevT ? t - prevT : 16); prevT = t;
    if (t - last > 1000 / rate && rk.length < maxN) {spawn(t); last = t;}
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const [ex, ey] = P(bx, by), u = R.h / 500;   // u: مقياس الرسم نسبة لحجم الشجرة
    g.font = `700 ${Math.round(13 * Math.max(.8, Math.min(1.1, u)))}px Cairo`; g.textAlign = 'center'; g.direction = 'rtl';
    for (let i = rk.length - 1; i >= 0; i--) {const r = rk[i]; const p = (t - r.t0) / r.dur; if (p >= 1) {rk.splice(i, 1); arrive(t, r.name); continue;}
      // ينفصل الاسم عن غصنه بقفزة صغيرة، ثم يسقط بالجاذبية متمايلاً كورقة، ويتجه تدريجياً إلى «الهذلي»
      const fall = p * p * 1.12 - .12 * p;
      const conv = p < .25 ? 0 : Math.pow((p - .25) / .75, 1.5);
      const damp = Math.pow(1 - p, 1.3), wob = Math.sin(p * Math.PI * 2 * r.cyc + r.ph);
      const x = r.sx + (ex - r.sx) * conv + r.sw * u * wob * damp;
      const y = r.sy + (ey - r.sy) * fall;
      const vx = x - r.lx, vy = y - r.ly; r.lx = x; r.ly = y;
      r.trail.push([x, y]); if (r.trail.length > 10) r.trail.shift();
      if (sp.length < maxSp && Math.random() < .35) sp.push({x: x + (Math.random() - .5) * 4, y, vx: vx * .02 + (Math.random() - .5) * .01, vy: .01, g: .00004, life: 500 + Math.random() * 400, age: 0, r: .5 + Math.random() * .8});
      g.globalCompositeOperation = 'lighter';
      for (let k = 1; k < r.trail.length; k++) {const a = k / r.trail.length; g.strokeStyle = `rgba(227,182,107,${a * .45})`; g.lineWidth = .6 + a * 1.4; g.beginPath(); g.moveTo(r.trail[k - 1][0], r.trail[k - 1][1]); g.lineTo(r.trail[k][0], r.trail[k][1]); g.stroke();}
      const gl = g.createRadialGradient(x, y, 0, x, y, 10); gl.addColorStop(0, 'rgba(255,231,184,.55)'); gl.addColorStop(1, 'rgba(227,182,107,0)');
      g.fillStyle = gl; g.beginPath(); g.arc(x, y, 10, 0, 7); g.fill();
      g.fillStyle = '#FFF1D2'; g.beginPath(); g.arc(x, y, 2.4, 0, 7); g.fill();
      g.globalCompositeOperation = 'source-over';
      // الاسم يميل مع التمايل، ويصغر ويذوب حين يلامس «الهذلي»
      const o = p < .08 ? p / .08 : p > .86 ? Math.max(0, (1 - p) / .14) : 1, sc = 1 - .22 * Math.max(0, (p - .6) / .4);
      g.save(); g.translate(x, y - 11 * sc); g.rotate(Math.max(-.22, Math.min(.22, vx * .05))); g.scale(sc, sc);
      g.lineWidth = 3; g.lineJoin = 'round'; g.strokeStyle = `rgba(27,24,51,${.8 * o})`; g.strokeText(r.name, 0, 0);
      g.fillStyle = `rgba(251,250,247,${o})`; g.fillText(r.name, 0, 0); g.restore();
    }
    // غبار ذهبي وشرر الوصول
    g.globalCompositeOperation = 'lighter';
    for (let i = sp.length - 1; i >= 0; i--) {const s = sp[i]; s.age += dt; if (s.age > s.life) {sp.splice(i, 1); continue;}
      s.vy += s.g * dt; s.x += s.vx * dt; s.y += s.vy * dt; const a = 1 - s.age / s.life;
      g.fillStyle = `rgba(255,214,140,${a * .9})`; g.beginPath(); g.arc(s.x, s.y, s.r, 0, 7); g.fill();}
    // توهج «الهذلي» عند الوصول: هالة ذهبية مسطحة على اللوحة، وتموج على التراب
    flash *= Math.pow(.955, dt / 16.7);
    if (flash > .02) {const rw = R.w * .2, rh = R.h * .032;
      g.save(); g.translate(ex, ey); g.scale(1, rh / rw);
      const gl = g.createRadialGradient(0, 0, 0, 0, 0, rw); gl.addColorStop(0, `rgba(255,226,160,${flash * .6})`); gl.addColorStop(.45, `rgba(227,182,107,${flash * .35})`); gl.addColorStop(1, 'rgba(227,182,107,0)');
      g.fillStyle = gl; g.beginPath(); g.arc(0, 0, rw, 0, 7); g.fill(); g.restore();}
    for (let i = rings.length - 1; i >= 0; i--) {const q = rings[i], k = (t - q.t0) / 1100; if (k >= 1) {rings.splice(i, 1); continue;}
      const e = 1 - Math.pow(1 - k, 3), rw = R.w * (.06 + .16 * e);
      g.strokeStyle = `rgba(255,214,140,${.55 * (1 - k)})`; g.lineWidth = 1.6 * (1 - k) + .4;
      g.beginPath(); g.ellipse(q.x, q.y, rw, rw * .2, 0, 0, Math.PI); g.stroke();   // النصف الأمامي فوق التراب
      g.globalAlpha = .35; g.beginPath(); g.ellipse(q.x, q.y, rw, rw * .2, 0, Math.PI, Math.PI * 2); g.stroke(); g.globalAlpha = 1;}
    g.globalCompositeOperation = 'source-over';
  }
  requestAnimationFrame(frame);
}
