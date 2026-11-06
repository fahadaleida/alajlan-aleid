// الوضع الليلي: يتبع وقت الجهاز، واختيار الزائر ينحفظ. يعمل قبل الرسم حتى ما يومض النهار، ويخدم البوابة وموقع الشجرة
(function () {
  var KEY = 'ajlan-sky', root = document.documentElement, saved = null, btns = [];
  try {saved = localStorage.getItem(KEY);} catch (e) {}
  function auto() {var d = new Date(), h = d.getHours() + d.getMinutes() / 60; return h >= 18 || h < 5.5 ? 'night' : 'day';}
  var cur = window.SKY_OFF ? 'day' : saved === 'night' || saved === 'day' ? saved : auto();
  var SUN = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M20.4 14.6A8.6 8.6 0 0 1 9.4 3.6a.7.7 0 0 0-.9-.9A9.9 9.9 0 1 0 21.3 15.5a.7.7 0 0 0-.9-.9z"/></svg>';
  function paint() {btns.forEach(function (b) {var n = cur === 'night'; b.innerHTML = n ? SUN : MOON; b.title = n ? 'الوضع النهاري' : 'الوضع الليلي'; b.setAttribute('aria-label', b.title); b.setAttribute('aria-pressed', n);});}
  function put(s) {cur = s; if (s === 'night') root.classList.add('sky-n'); root.dataset.sky = s; paint();}
  put(cur);
  var timer;
  window.Sky = {
    get: function () {return cur;},
    set: function (s) {
      if (s === cur) return;
      try {localStorage.setItem(KEY, s);} catch (e) {}
      root.classList.add('sky-go'); clearTimeout(timer); timer = setTimeout(function () {root.classList.remove('sky-go');}, 1200);
      put(s); dispatchEvent(new CustomEvent('skychange', {detail: s}));
    },
    toggle: function () {this.set(cur === 'night' ? 'day' : 'night');}
  };
  // الزر: يدخل في رأس الصفحة أول ما يُبنى
  var HOSTS = [['.nav .wrap', '.burger'], ['.rbar', null], ['.mast', null], ['#skyHost', null]];
  function mount() {
    if (btns.length) return true;
    for (var i = 0; i < HOSTS.length; i++) {
      var h = document.querySelector(HOSTS[i][0]); if (!h) continue;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'skybtn'; b.onclick = function () {Sky.toggle();};
      var ref = HOSTS[i][1] && h.querySelector(HOSTS[i][1]); ref ? h.insertBefore(b, ref) : h.appendChild(b);
      btns.push(b); paint(); return true;
    }
    return false;
  }
  function watch() {if (window.SKY_OFF || mount()) return; var o = new MutationObserver(function () {if (mount()) o.disconnect();}); o.observe(document.body, {childList: true, subtree: true});}
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
})();
