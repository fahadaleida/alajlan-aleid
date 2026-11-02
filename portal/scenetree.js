// شجرة العائلة (img/tree-cut.webp) معالجة بإضاءة الغروب ومغروسة في أرض مشهد الخلفية بنفس حساب cover للخلفية
// (المعالجة: scratchpad/ftree/proc.py). فوقها لوحة تتساقط فيها الأسماء وتستقر كل واحدة على ورقتها الحقيقية (names.json)
(() => {
  const scene = document.getElementById('scene'); if (!scene) return;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const V = '202611030100';
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
  let G = null, dpr = 1, lastW = 0, N = [];

  function layout() {
    const c = mq.matches ? BG.port : BG.land, vw = scene.clientWidth || innerWidth, vh = scene.clientHeight || innerHeight;
    const s = Math.max(vw / c.W, vh / c.H), ox = (vw - c.W * s) * c.px, oy = (vh - c.H * s) * c.py;
    let bx = c.bx;
    const visL = -ox / s;   // الشاشات الضيقة (لوحي): نزحزح الشجرة على الأرض لتبقى ظاهرة
    if (!mq.matches && visL > 140) bx = Math.min(visL + 430, c.W * .5);
    const ts = s * c.k, X = ox + bx * s, Y = oy + c.by * s;
    const iw = SRC.w * ts, ih = SRC.h * ts, il = X - SRC.bx * ts, it = Y - SRC.by * ts;
    Object.assign(tr.style, {left: il + 'px', top: it + 'px', width: iw + 'px', height: ih + 'px'});
    // توهج أسماء الجذع: صندوق المصدر x ٤٩٦..١٢٩٦، y ١٧٠٠..٢٤٠٠
    Object.assign(gl.style, {left: il + 496 * ts + 'px', top: it + 1700 * ts + 'px', width: 800 * ts + 'px', height: 700 * ts + 'px'});
    const f = ts / KL;
    Object.assign(sh.style, {left: X + SHD[0] * f + 'px', top: Y + SHD[2] * f + 'px', width: (SHD[1] - SHD[0]) * f + 'px', height: (SHD[3] - SHD[2]) * f + 'px'});
    dpr = Math.min(2, devicePixelRatio || 1);
    const big = iw * dpr > 620, want = `img/scenetree${big ? '' : '-sm'}.webp?v=${V}`;
    if (!tr.src.endsWith(want) && !(tr.dataset.big && !big)) {tr.src = want; if (big) tr.dataset.big = 1;}
    // لوحة الأسماء: صندوق الشجرة + فسحة فوقه للسقوط
    const top = Math.max(0, it - ih * .2), cl = Math.max(0, il), cr = Math.min(vw, il + iw);
    G = {il, it, iw, ih, ts, X, Y, top, cl, cw: cr - cl, ch: Y - top, fs: Math.max(11, Math.min(15, ih * .019))};
    Object.assign(cv.style, {left: cl + 'px', top: top + 'px', width: G.cw + 'px', height: G.ch + 'px'});
    cv.width = Math.round(G.cw * dpr); cv.height = Math.round(G.ch * dpr);
    // موضع رابط «ابحث عن اسمك» والمسافة قبل البطاقة في الجوال (ثابتة مع تغير شريط العنوان)
    const R = document.documentElement.style;
    R.setProperty('--tree-bx', X + 'px'); R.setProperty('--tree-by', Y + 'px');
    if (vw !== lastW) {R.setProperty('--tree-by0', Y + 'px'); lastW = vw;}
    if (RM) drawStatic();
  }
  // اسم i → إحداثيات اللوحة (مع زاوية تمايل حول القاعدة)
  const P = (i, a = 0) => {const q = N[i]; let x = G.il + q[0] * SRC.w * G.ts, y = G.it + q[1] * SRC.h0 * G.ts;
    if (a) {const dx = x - G.X, dy = y - G.Y, c = Math.cos(a), s = Math.sin(a); x = G.X + dx * c - dy * s; y = G.Y + dx * s + dy * c;}
    return [x - G.cl, y - G.top];};

  // توهج دافئ مرسوم مسبقاً (ضوء الغروب من خلف الورقة)
  const glint = document.createElement('canvas'); glint.width = glint.height = 64;
  {const q = glint.getContext('2d'), rg = q.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, 'rgba(255,236,190,1)'); rg.addColorStop(.15, 'rgba(255,200,110,.85)'); rg.addColorStop(.42, 'rgba(255,140,50,.28)'); rg.addColorStop(1, 'rgba(255,110,30,0)');
    q.fillStyle = rg; q.fillRect(0, 0, 64, 64);}
  const lit = new Map();   // أوراق استقرت عليها أسماء: تبقى تتوهج قليلاً

  let order = [], oi = 0;
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

  // ===== الحركة =====
  const act = []; let clock = 0, prev = 0, nextSpawn = 600, raf = 0;
  const FALL = 4300, HOLD = 5600, FADE = 1300;
  function spawn() {
    for (let tries = 0; tries < 40; tries++) {
      const i = order[oi++ % order.length], [x, y] = P(i);
      if (!inView(x, y)) continue;
      if (act.some(o => Math.abs(o.x - x) < G.fs * 6.5 && Math.abs(o.y - y) < G.fs * 2.6)) continue;
      act.push({i, x, y, sx: x + (Math.random() - .5) * G.fs * 5, sy: Math.max(-G.fs, y - G.fs * 3 - Math.random() * G.ih * .18), t0: clock, w: .9 + Math.random() * .5, ph: Math.random() * 6.28, dir: Math.random() < .5 ? -1 : 1});
      return;
    }
  }
  const ease = p => 1 - Math.pow(1 - p, 2.2);
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = prev ? Math.min(50, now - prev) : 16; prev = now; clock += dt;
    if (!G || !N.length) return;
    const mob = mq.matches, gap = mob ? 2300 : 1500, maxA = mob ? 5 : 9;
    if (clock > nextSpawn) {if (act.length < maxA) spawn(); nextSpawn = clock + gap * (.75 + Math.random() * .5);}
    // تمايل ريح خفيف جداً حول القاعدة
    const a = (Math.sin(clock * .00083) * .6 + Math.sin(clock * .0021 + 1.3) * .25 + Math.sin(clock * .0047) * .08) * .0016;
    tr.style.transform = `rotate(${a}rad)`;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, G.cw, G.ch);
    for (const [i, v] of lit) {const [x, y] = P(i, a); glowAt(x, y, v * (.75 + .25 * Math.sin(clock * .0016 + i)));
      const nv = v - dt * .00004; if (nv < .12) lit.delete(i); else lit.set(i, nv);}
    for (let k = act.length - 1; k >= 0; k--) {
      const o = act[k], e = clock - o.t0, [tx, ty] = P(o.i, a);
      if (e < FALL) {   // يسقط مثل ورقة: يتمايل ثم يهدأ عند الوصول
        const p = e / FALL, q = ease(p), fade = Math.min(1, p * 5), sw = Math.sin(e * .0021 * o.w + o.ph) * G.fs * 1.4 * (1 - q);
        const x = o.sx + (tx - o.sx) * q + sw, y = o.sy + (ty - 7 - o.sy) * q;
        g.save(); g.translate(x, y); g.rotate(Math.cos(e * .0021 * o.w + o.ph) * .14 * (1 - q) * o.dir); label(0, 0, N[o.i][2], fade * .92, 0); g.restore();
      } else if (e < FALL + HOLD + FADE) {
        const h = e - FALL, land = Math.max(0, 1 - h / 900);
        if (h < 1100) {   // وميض وحلقة ضوء عند الاستقرار على الورقة
          glowAt(tx, ty, 1.4 * (1 - h / 1100) + .4);
          const r = G.fs * (.4 + 1.8 * (h / 1100)); g.globalAlpha = (1 - h / 1100) * .7; g.strokeStyle = '#FFD08A'; g.lineWidth = 1.2;
          g.beginPath(); g.arc(tx, ty, r, 0, 6.283); g.stroke(); g.globalAlpha = 1;
        } else glowAt(tx, ty, .55);
        const al = h < HOLD ? 1 : 1 - (h - HOLD) / FADE;
        label(tx, ty - 7 - land * 2, N[o.i][2], al * .95, Math.max(land, .25));
      } else {lit.set(o.i, .5); if (lit.size > 160) lit.delete(lit.keys().next().value); act.splice(k, 1);}
    }
  }
  const run = () => {if (!raf && !RM && !document.hidden) {prev = 0; raf = requestAnimationFrame(frame);}};
  const stop = () => {cancelAnimationFrame(raf); raf = 0;};
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : run());

  let rt; addEventListener('resize', () => {clearTimeout(rt); rt = setTimeout(layout, 120);});
  mq.addEventListener?.('change', layout);
  layout();
  fetch('names.json').then(r => r.json()).then(async D => {
    N = D.n;
    order = N.map((_, i) => i); for (let i = order.length - 1; i > 0; i--) {const j = (Math.random() * (i + 1)) | 0; [order[i], order[j]] = [order[j], order[i]];}
    try {await document.fonts.load('700 13px Cairo');} catch (e) {}
    if (RM) drawStatic(); else run();
  }).catch(() => {});
})();
