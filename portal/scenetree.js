// شجرة العائلة (img/tree-cut.webp) معالجة بإضاءة الغروب ومغروسة في أرض مشهد الخلفية بنفس حساب cover للخلفية
// (المعالجة: scratchpad/ftree/proc.py). فوقها لوحة تتساقط فيها الأسماء وتستقر كل واحدة على ورقتها الحقيقية (names.json)
(() => {
  const scene = document.getElementById('scene'); if (!scene) return;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const V = '202611031500';
  const TK = .72;                               // تصغير الشجرة ليبان الجبل وراها
  // صورة الشجرة بإحداثيات المصدر: العرض، الارتفاع، ارتفاع الملصق الأصلي (لـ names.json)، قاعدة الجذع وخط الأرض
  const SRC = {w: 1790, h: 2400, h0: 2342, bx: 896.6, by: 2318};
  const KL = 1025 / 2305;                       // بكسل مشهد عرضي لكل بكسل مصدر (حُسب عليه الظل)
  const SHD = [-560, 2200, -40, 160];          // صندوق الظل بالنسبة للقاعدة (بكسل المشهد العرضي)
  const BG = {
    land: {W: 2560, H: 1441, px: .5, py: 1, bx: 570, by: 1385, k: KL},
    port: {W: 1200, H: 2400, px: .5, py: .35, bx: 405, by: 1425, k: .407},
  };
  const mq = matchMedia('(max-width:639px)');
  const wrap = document.createElement('div'); wrap.className = 'stree-l';
  wrap.innerHTML = `<img class="st-sh" alt="" decoding="async" src="img/scenetree-shadow.webp?v=${V}"><img class="st-tr" alt="" decoding="async"><img class="st-gl" alt="" decoding="async" src="img/scenetree-glow.webp?v=${V}"><canvas class="st-nm"></canvas>`;
  scene.appendChild(wrap);
  const sh = wrap.children[0], tr = wrap.children[1], gl = wrap.children[2], cv = wrap.children[3], g = cv.getContext('2d');
  tr.style.transformOrigin = `${SRC.bx / SRC.w * 100}% ${SRC.by / SRC.h * 100}%`;
  let G = null, dpr = 1, lastW = 0, N = [], BASE = [.4953, .9716], oi = 0;

  function layout() {
    const c = mq.matches ? BG.port : BG.land, vw = scene.clientWidth || innerWidth, vh = scene.clientHeight || innerHeight;
    const s = Math.max(vw / c.W, vh / c.H), ox = (vw - c.W * s) * c.px, oy = (vh - c.H * s) * c.py;
    let bx = c.bx;
    const visL = -ox / s;   // الشاشات الضيقة (لوحي): نزحزح الشجرة على الأرض لتبقى ظاهرة
    if (!mq.matches && visL > 140) bx = Math.min(visL + 430, c.W * .5);
    const ts = s * c.k * TK, X = ox + bx * s, Y = oy + c.by * s;
    const iw = SRC.w * ts, ih = SRC.h * ts, il = X - SRC.bx * ts, it = Y - SRC.by * ts;
    Object.assign(tr.style, {left: il + 'px', top: it + 'px', width: iw + 'px', height: ih + 'px'});
    // توهج أسماء الجذع: صندوق المصدر x ٤٩٦..١٢٩٦، y ١٧٠٠..٢٤٠٠
    Object.assign(gl.style, {left: il + 496 * ts + 'px', top: it + 1700 * ts + 'px', width: 800 * ts + 'px', height: 700 * ts + 'px'});
    const f = ts / KL;
    Object.assign(sh.style, {left: X + SHD[0] * f + 'px', top: Y + SHD[2] * f + 'px', width: (SHD[1] - SHD[0]) * f + 'px', height: (SHD[3] - SHD[2]) * f + 'px'});
    dpr = Math.min(2, devicePixelRatio || 1);
    const big = iw * dpr > 620, want = `img/scenetree-orig${big ? '' : '-sm'}.webp?v=${V}`;
    if (!tr.src.endsWith(want) && !(tr.dataset.big && !big)) {tr.src = want; if (big) tr.dataset.big = 1;}
    // لوحة الأسماء: صندوق الشجرة + فسحة فوقه للسقوط
    const top = 0, cl = 0, cr = vw;
    G = {il, it, iw, ih, ts, X, Y, top, cl, cw: cr - cl, ch: vh, fs: Math.max(11, Math.min(15, ih * .019))};
    Object.assign(cv.style, {left: cl + 'px', top: top + 'px', width: G.cw + 'px', height: G.ch + 'px'});
    cv.width = Math.round(G.cw * dpr); cv.height = Math.round(G.ch * dpr);
    // موضع رابط «ابحث عن اسمك» والمسافة قبل البطاقة في الجوال (ثابتة مع تغير شريط العنوان)
    const R = document.documentElement.style;
    R.setProperty('--tree-bx', X + 'px'); R.setProperty('--tree-by', Y + 'px');
    if (vw !== lastW) {R.setProperty('--tree-by0', Y + 'px'); lastW = vw;}
    if (RM) drawStatic();
  }
  // اسم i → إحداثيات اللوحة (مع زاوية تمايل حول القاعدة)
  const P = (i, a = 0) => {const q = i < 0 ? BASE : N[i]; let x = G.il + q[0] * SRC.w * G.ts, y = G.it + q[1] * SRC.h0 * G.ts;
    if (a) {const dx = x - G.X, dy = y - G.Y, c = Math.cos(a), s = Math.sin(a); x = G.X + dx * c - dy * s; y = G.Y + dx * s + dy * c;}
    return [x - G.cl, y - G.top];};

  // توهج دافئ مرسوم مسبقاً (ضوء الغروب من خلف الورقة)
  const glint = document.createElement('canvas'); glint.width = glint.height = 64;
  {const q = glint.getContext('2d'), rg = q.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, 'rgba(255,236,190,1)'); rg.addColorStop(.15, 'rgba(255,200,110,.85)'); rg.addColorStop(.42, 'rgba(255,140,50,.28)'); rg.addColorStop(1, 'rgba(255,110,30,0)');
    q.fillStyle = rg; q.fillRect(0, 0, 64, 64);}
  const lit = new Map();   // أوراق استقرت عليها أسماء: تبقى تتوهج قليلاً

  let order = [];
  const font = () => `700 ${G.fs}px Cairo, "Noto Kufi Arabic", sans-serif`;
  function label(x, y, txt, a, glow) {
    g.font = font(); g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.globalAlpha = a;
    const w = g.measureText(txt).width;   // هالة ضوء خلف الاسم
    g.globalAlpha = a * (.55 + .45 * glow); g.drawImage(glint, x - w * .9, y - G.fs * 1.55, w * 1.8, G.fs * 2.1); g.globalAlpha = a;
    if (glow) {g.shadowColor = 'rgba(255,170,70,.95)'; g.shadowBlur = 12 * glow;}
    g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = 'rgba(40,14,4,.7)'; g.strokeText(txt, x, y);
    g.shadowBlur = 0; g.fillStyle = '#FFEFCF'; g.fillText(txt, x, y); g.globalAlpha = 1;
  }
  function glowAt(x, y, v) {const r = G.fs * (.55 + .7 * v); g.globalAlpha = Math.min(1, v); g.drawImage(glint, x - r, y - r, r * 2, r * 2); g.globalAlpha = 1;}
  const inView = (x, y) => x > G.fs * 3 && x < G.cw - G.fs * 3 && y > G.fs * 2;
  function drawStatic() {
    if (!G || !N.length) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, G.cw, G.ch);
    const used = [];
    for (let k = 0; k < 600 && used.length < (mq.matches ? 4 : 8); k++) {
      const i = order[k], [x, y] = P(i);
      if (!inView(x, y) || used.some(([ux, uy]) => Math.abs(ux - x) < G.fs * 6 && Math.abs(uy - y) < G.fs * 2.4)) continue;
      used.push([x, y]); glowAt(x, y, .7); label(x, y - 7, N[i][2], .95, .3);
    }
  }

  // ===== الحركة: أسماء مضيئة تنطلق مثل الصواريخ من السماء وتصب في «الهذلي» =====
  const act = [], fx = []; let clock = 0, prev = 0, acc = 0, raf = 0, heat = 0;
  const T = () => P(-1);   // نقطة «الهذلي» أسفل الجذع
  function spawn() {
    const [tx, ty] = T(), vw = G.cw, side = Math.random();
    // من أعلى الشاشة أو من الجانبين في نصفها العلوي
    let sx, sy;
    if (side < .6) {sx = Math.random() * vw; sy = -20;} else {sx = side < .8 ? -20 : vw + 20; sy = Math.random() * G.Y * .55;}
    const dist = Math.hypot(tx - sx, ty - sy), bend = (Math.random() - .5) * dist * .45;
    const nx = -(ty - sy) / dist, ny = (tx - sx) / dist;
    act.push({i: order[oi++ % order.length], sx, sy, cx: (sx + tx) / 2 + nx * bend, cy: (sy + ty) / 2 + ny * bend - dist * .12,
      t0: clock, dur: 1000 + dist * 1.9 + Math.random() * 350, trail: []});
  }
  const qb = (o, t, tx, ty) => {const u = 1 - t; return [u * u * o.sx + 2 * u * t * o.cx + t * t * tx, u * u * o.sy + 2 * u * t * o.cy + t * t * ty];};
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = prev ? Math.min(50, now - prev) : 16; prev = now; clock += dt;
    if (!G || !N.length) return;
    const mob = mq.matches, rate = mob ? 2.4 : 4.5, maxN = mob ? 12 : 24;
    acc += dt / 1000 * rate; while (acc >= 1) {acc--; if (act.length < maxN) spawn();}
    const a = (Math.sin(clock * .00083) * .6 + Math.sin(clock * .0021 + 1.3) * .25 + Math.sin(clock * .0047) * .08) * .0016;
    tr.style.transform = `rotate(${a}rad)`;
    heat = Math.max(0, heat - dt * .0009);
    gl.style.opacity = (.55 + .45 * Math.min(1, heat) + .08 * Math.sin(clock * .002)).toFixed(3);
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, G.cw, G.ch);
    const [tx, ty] = T();
    glowAt(tx, ty, .5 + .5 * Math.min(1, heat));
    g.globalCompositeOperation = 'lighter';
    for (let k = act.length - 1; k >= 0; k--) {
      const o = act[k], p = Math.min(1, (clock - o.t0) / o.dur), e = p * p * (3 - 2 * p), [x, y] = qb(o, e, tx, ty);
      o.trail.push([x, y]); if (o.trail.length > 18) o.trail.shift();
      for (let j = 1; j < o.trail.length; j++) {   // ذيل ذهبي يتلاشى
        const f = j / o.trail.length; g.strokeStyle = `rgba(255,${190 + 50 * f | 0},${110 + 90 * f | 0},${f * .75})`; g.lineWidth = .6 + f * 2.4;
        g.beginPath(); g.moveTo(o.trail[j - 1][0], o.trail[j - 1][1]); g.lineTo(o.trail[j][0], o.trail[j][1]); g.stroke();
      }
      glowAt(x, y, .9);
      if (p >= 1) {act.splice(k, 1); heat = Math.min(1.6, heat + .35);
        fx.push({t0: clock}); for (let s = 0; s < 6; s++) {const an = -Math.PI * Math.random(), sp = .05 + Math.random() * .12; fx.push({t0: clock, sp: [Math.cos(an) * sp, Math.sin(an) * sp]});}}
    }
    for (let k = fx.length - 1; k >= 0; k--) {   // حلقة وشرر عند الوصول
      const f = fx[k], e = clock - f.t0;
      if (f.sp) {if (e > 700) {fx.splice(k, 1); continue;} glowAt(tx + f.sp[0] * e, ty + f.sp[1] * e + e * e * .00012, .5 * (1 - e / 700));}
      else {if (e > 900) {fx.splice(k, 1); continue;} g.globalAlpha = .7 * (1 - e / 900); g.strokeStyle = '#FFD08A'; g.lineWidth = 1.4;
        g.beginPath(); g.arc(tx, ty, G.fs * (.6 + 3 * e / 900), 0, 6.283); g.stroke(); g.globalAlpha = 1;}
    }
    g.globalCompositeOperation = 'source-over';
    for (const o of act) {const p = Math.min(1, (clock - o.t0) / o.dur), e = p * p * (3 - 2 * p), [x, y] = qb(o, e, tx, ty);
      label(x, y - G.fs * .7, N[o.i][2], p < .85 ? Math.min(1, p * 6) : (1 - p) / .15, .8);}
  }
  const run = () => {if (!raf && !RM && !document.hidden) {prev = 0; raf = requestAnimationFrame(frame);}};
  const stop = () => {cancelAnimationFrame(raf); raf = 0;};
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : run());

  let rt; addEventListener('resize', () => {clearTimeout(rt); rt = setTimeout(layout, 120);});
  mq.addEventListener?.('change', layout);
  layout();
  fetch('names.json').then(r => r.json()).then(async D => {
    N = D.n; if (D.base) BASE = D.base;
    order = N.map((_, i) => i); for (let i = order.length - 1; i > 0; i--) {const j = (Math.random() * (i + 1)) | 0; [order[i], order[j]] = [order[j], order[i]];}
    try {await document.fonts.load('700 13px Cairo');} catch (e) {}
    if (RM) drawStatic(); else run();
  }).catch(() => {});
})();
