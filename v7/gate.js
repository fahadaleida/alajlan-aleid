// بوابة موقع الشجرة: زائر يرى الأسماء فقط، وعضو مقبول يرى الصور. مع الخادم portal/api/member.php، وبدونه نسخة عرض في هذا المتصفح
window.GATE=(()=>{
'use strict';
const API='../portal/api/',DB='ajlan-gate-demo',SEEN='ajlan-gate-seen',ADMIN_WA='966533339891';
const QS=location.search,tag=document.currentScript,MODAL=!!(tag&&tag.hasAttribute('data-modal'))&&!QS.includes('nogate');
const S={mode:'demo',state:'none',pid:0,share:false,name:'',chain:'',csrf:'',wa:false};
class Stop extends Error{constructor(msg,code){super(msg);this.code=code;}}
const digits=v=>String(v||'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
const phoneOf=v=>{let s=digits(v).replace(/[\s()+-]/g,'').replace(/^(00)?966/,'0');if(/^5\d{8}$/.test(s))s='0'+s;return /^05\d{8}$/.test(s)?s:'';};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm=s=>String(s).replace(/[ً-ْـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي').trim();
const ss={get(k){try{return sessionStorage.getItem(k)}catch(e){return null}},set(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}};

// ===== نسخة العرض: نفس ردود الخادم، والبيانات في localStorage =====
// الجهاز يبقى داخل بـ cur، و curVer يبطله عند الإلغاء. التنظيف يمسح بقايا النسخة القديمة اللي كان فيها كلمات مرور
const read=()=>{let d;try{d=JSON.parse(localStorage.getItem(DB))||{}}catch(e){d={}}d.members=d.members||{};for(const k in d.members){const r=d.members[k];if(r.status==='unverified'){delete d.members[k];continue;}delete r.salt;delete r.hash;}return d;};
const write=d=>{try{localStorage.setItem(DB,JSON.stringify(d))}catch(e){throw new Stop('مساحة هذا المتصفح ممتلئة.');}};
const BAD='الرمز غير صحيح أو انتهى. اطلب رمزاً جديداً.';
const stateOf=r=>({ok:true,state:r.status,pid:r.pid,share:!!r.share,name:r.name,chain:r.chain,csrf:''});
const meRow=d=>{const r=d.members[d.cur];if(!r||r.status!=='approved'||(r.ver||0)!==d.curVer)throw new Stop('سجّل دخولك أولاً.');return r;};
const demo={
  status(){const d=read(),r=d.members[d.cur];if(!r||(r.status==='approved'&&(r.ver||0)!==d.curVer))return{ok:true,state:'none'};return stateOf(r);},
  register({pid,phone,name,chain}){const d=read();if(!d.members[phone]){d.members[phone]={phone,pid,name,chain,status:'pending',ver:0,created:Math.floor(Date.now()/1000)};write(d);}return{ok:true,next:'sent'};},
  send({phone}){const d=read(),r=d.members[phone];if(!r||r.status!=='approved')return{ok:true,next:'code'};const c=String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,'0');r.code={c,exp:Date.now()+300000,tries:0};write(d);return{ok:true,next:'code',demoCode:c};},
  verify({phone,code}){const d=read(),r=d.members[phone],c=r&&r.code;if(!c||c.exp<Date.now()||r.status!=='approved')throw new Stop(BAD);
    if(c.c!==code){if(++c.tries>=5)delete r.code;write(d);throw new Stop(BAD);}delete r.code;d.cur=phone;d.curVer=r.ver||0;write(d);return stateOf(r);},
  logout(){const d=read();delete d.cur;delete d.curVer;write(d);return{ok:true};},
  share({on}){const d=read(),r=meRow(d);if(on)r.share=1;else delete r.share;write(d);return{ok:true,share:!!on};},
  shared(){const d=read();meRow(d);return{ok:true,ids:Object.values(d.members).filter(r=>r.status==='approved'&&r.share).map(r=>r.pid)};},
  contact({pid}){const d=read(),me=meRow(d),r=Object.values(d.members).find(x=>x.pid===pid&&x.status==='approved'&&x.share);if(!r||pid===me.pid)throw new Stop('الرقم غير متاح.');return{ok:true,phone:r.phone};},
};
async function call(op,body={}){
  if(S.mode==='demo')return demo[op](body);
  let r;const h={'Content-Type':'application/json'};if(S.csrf)h['X-CSRF-Token']=S.csrf;
  try{r=await fetch(API+'member.php',{method:'POST',cache:'no-store',credentials:'same-origin',headers:h,body:JSON.stringify({op,...body})});}catch(e){throw new Stop('تعذّر الاتصال. تأكد من الإنترنت وحاول مرة أخرى.');}
  const j=await r.json().catch(()=>({}));if(r.ok&&j.ok)return j;throw new Stop(j.msg||'حدث خطأ. حاول مرة أخرى.',j.error);
}
const apply=j=>{S.state=j.state||'none';S.pid=+j.pid||0;S.share=!!j.share;S.name=j.name||'';S.chain=j.chain||'';S.csrf=j.csrf||'';if('wa'in j)S.wa=!!j.wa;};

// ===== من أنا: الفشل يعني زائر، فالصور لا تفتح إلا بجواب صريح =====
const ready=(async()=>{
  try{const r=await fetch(API+'ping.php',{cache:'no-store'}),j=r.ok?await r.json().catch(()=>null):null;if(j&&j.app==='ajlan-portal')S.mode='server';}catch(e){}
  try{if(S.mode==='server'){const r=await fetch(API+'member.php',{cache:'no-store',credentials:'same-origin'});if(r.ok)apply(await r.json());}else apply(demo.status());}catch(e){}
  return S;
})();
const can=()=>S.state==='approved';
// زر التواصل: قائمة من أظهر رقمه بدون جوالات، والجوال يُطلب لشخص واحد عند الضغط ولا يُحفظ
const setShare=async on=>{const j=await call('share',{on:!!on});S.share=!!j.share;dispatchEvent(new Event('gateshare'));return S.share;};
const shared=()=>call('shared').then(j=>new Set((j.ids||[]).map(Number))).catch(()=>new Set());
const contact=pid=>call('contact',{pid}).then(j=>j.phone);
const photoIndex=()=>S.mode==='server'?fetch(API+'tree-photo.php?index=1',{cache:'no-store',credentials:'same-origin'}).then(r=>r.ok?r.json():null).catch(()=>null)
  :fetch('photos/index.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).catch(()=>null);
const photoUrl=(id,v)=>S.mode==='server'?`${API}tree-photo.php?id=${id}&v=${v}`:`photos/${id}.jpg?v=${v}`;

// ===== الواجهة =====
let root=null,box=null,tree=null,F={};
const css=`#gate{position:fixed;inset:0;z-index:9000;display:grid;place-items:center;padding:16px;background:rgba(16,12,34,.62);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);font-family:Tajawal,system-ui,sans-serif;color:#2a1c08;direction:rtl}
#gate .gc{position:relative;width:min(400px,100%);max-height:calc(100dvh - 32px);overflow:auto;background:linear-gradient(180deg,#fffaf0,#f6ead2);border:1px solid #d9b871;border-radius:20px;box-shadow:0 26px 70px rgba(10,6,24,.5);padding:24px 22px 20px;text-align:center}
#gate .gl{height:62px;display:block;margin:0 auto 8px}
#gate h2{margin:0;font-size:22px;font-weight:800;color:#322781}
#gate p{margin:8px 0 0;font-size:15px;line-height:1.7;color:#5b4a2c}
#gate .gx{position:absolute;top:10px;inset-inline-start:10px;width:36px;height:36px;border:0;border-radius:50%;background:rgba(50,39,129,.08);color:#322781;font-size:20px;cursor:pointer}
#gate .gs{display:grid;gap:10px;margin-top:16px}
#gate button.gb{font:inherit;font-size:16px;font-weight:800;min-height:48px;border-radius:12px;border:1px solid #cfae6c;background:#fffdf7;color:#322781;cursor:pointer;padding:0 14px}
#gate button.gb.main{border:0;color:#2a1c08;background:linear-gradient(180deg,#f0cf7c,#c9973f);box-shadow:0 6px 14px rgba(150,104,30,.3)}
#gate button.gb:disabled{opacity:.6;cursor:wait}
#gate .gk{font:inherit;font-size:14px;font-weight:700;background:none;border:0;color:#7a5a1e;text-decoration:underline;cursor:pointer;padding:6px}
#gate label{display:block;text-align:start;font-size:14px;font-weight:700;color:#5b4a2c}
#gate input{display:block;width:100%;box-sizing:border-box;margin-top:5px;font:inherit;font-size:16px;font-weight:600;min-height:46px;padding:0 12px;border:1px solid #d9c49a;border-radius:10px;background:#fff;color:#2a1c08}
#gate input:focus{outline:2px solid #c9973f;outline-offset:0}
#gate input[dir=ltr]{text-align:left}
#gate .ge{display:none;background:#fdeceb;color:#a3241b;border-radius:10px;padding:8px 10px;font-size:14px;font-weight:700}
#gate .ge.on{display:block}
#gate .gn{margin-top:12px;padding:8px 10px;border-radius:10px;background:rgba(50,39,129,.07);color:#3f3478;font-size:13px;line-height:1.6;text-align:start}
#gate .gd{background:#fff3cf;color:#6b4e0e;border:1px dashed #c9973f;border-radius:10px;padding:8px 10px;font-size:14px;font-weight:800}
#gate .gd b{font-size:20px;letter-spacing:3px;direction:ltr;display:inline-block}
#gate .gr{max-height:210px;overflow:auto;display:grid;gap:6px;margin-top:6px}
#gate .gr button{font:inherit;text-align:start;background:#fff;border:1px solid #e3d3b0;border-radius:10px;padding:7px 10px;cursor:pointer;color:#2a1c08}
#gate .gr b{display:block;font-size:15px}#gate .gr small{display:block;font-size:12.5px;line-height:1.5;color:#6d5a36}
#gate .gp{background:#fff;border:1px solid #c9973f;border-radius:10px;padding:8px 10px;text-align:start;font-size:13.5px;line-height:1.6}
#gate .gp b{display:block;font-size:15px;color:#322781}
#gate .gi{width:58px;height:58px;border-radius:50%;margin:0 auto 8px;display:grid;place-items:center;font-size:28px;background:rgba(201,151,63,.18)}`;
function mount(){if(root)return;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);root=document.createElement('div');root.id='gate';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.innerHTML='<div class="gc"></div>';document.body.appendChild(root);box=root.firstChild;}
const close=()=>{if(root){root.remove();root=null;}};
const DEMO_NOTE='<div class="gn">نسخة عرض: الطلبات تبقى في هذا المتصفح فقط، ورمز الدخول يظهر هنا بدل واتساب. ملفات الصور على هذا الرابط عامة، والحماية الحقيقية تبدأ بعد نقل الموقع إلى الدومين.</div>';
const note=()=>S.mode==='demo'?DEMO_NOTE:'';
function draw(html,{back,x}={}){mount();box.innerHTML=(x?'<button class="gx" data-g="close" aria-label="إغلاق">×</button>':'')+'<img class="gl" src="bg/logo.png" alt="">'+html+(back?`<button class="gk" data-g="${back}">رجوع</button>`:'');const i=box.querySelector('input');if(i&&matchMedia('(pointer:fine)').matches)i.focus();box.scrollTop=0;}
const fail=e=>{const b=box.querySelector('.ge');if(b){b.textContent=e.message||'حدث خطأ.';b.classList.add('on');}};
async function run(btn,fn){const b=box.querySelector(btn);if(b)b.disabled=true;const er=box.querySelector('.ge');if(er)er.classList.remove('on');try{await fn();}catch(e){fail(e);}finally{if(b&&b.isConnected)b.disabled=false;}}
const V={
  start(x){draw(`<h2>شجرة عائلة العجلان والعيد</h2><p>الصور والبيانات لأفراد الأسرة المسجلين في الشجرة.</p><div class="gs"><button class="gb main" data-g="login">تسجيل الدخول</button><button class="gb" data-g="register">تسجيل</button><button class="gb" data-g="guest">تصفح كزائر</button></div><p style="font-size:13.5px">الزائر يشاهد الأسماء فقط، بدون صور أو أرقام.</p>${note()}`,{x});},
  login(){if(S.mode==='server'&&!S.wa){draw(`<div class="gi">🔔</div><h2>تسجيل الدخول</h2><p>الدخول برمز واتساب يتفعل قريباً. تقدر الآن ترسل طلب تسجيل، أو تتصفح الأسماء كزائر.</p><div class="gs"><button class="gb main" data-g="register">تسجيل</button><button class="gb" data-g="guest">تصفح كزائر</button></div>`,{back:'start'});return;}
    draw(`<h2>تسجيل الدخول</h2><p>اكتب رقم جوالك، ويوصلك رمز على واتساب.</p><div class="gs"><div class="ge"></div><label>رقم الجوال<input id="gPh" type="tel" inputmode="tel" dir="ltr" autocomplete="tel" placeholder="05xxxxxxxx"></label><button class="gb main" id="gGo" data-g="doSend">إرسال الرمز</button></div>${note()}`,{back:'start'});if(F.phone)box.querySelector('#gPh').value=F.phone;},
  register(){F={};draw(`<h2>تسجيل جديد</h2><p>ابحث عن اسمك في الشجرة واختره.</p><div class="gs"><div class="ge"></div><label>اسمك<input id="gQ" type="search" autocomplete="off" placeholder="مثال: فهد بن سعد"></label><div class="gr" id="gR"></div><button class="gk" data-g="notfound">اسمي غير موجود في الشجرة</button></div>`,{back:'start'});box.querySelector('#gQ').addEventListener('input',search);people();},
  details(){const p=F.person;draw(`<h2>أكمل التسجيل</h2><div class="gs"><div class="gp"><b>${esc(p.name)}</b>${esc(p.chain)}</div><div class="ge"></div><label>رقم الجوال (واتساب)<input id="gPh" type="tel" inputmode="tel" dir="ltr" autocomplete="tel" placeholder="05xxxxxxxx"></label><button class="gb main" id="gGo" data-g="doRegister">إرسال الطلب</button></div><p style="font-size:13.5px">تتواصل معك الإدارة على واتساب للتأكد من بياناتك.</p>`,{back:'register'});},
  code(){draw(`<h2>رمز الدخول</h2><p>إذا كان رقمك مقبولاً، يصلك رمز من ٦ أرقام على واتساب إلى <bdi dir="ltr">${esc(F.phone)}</bdi>.</p><div class="gs">${F.demoCode?`<div class="gd">رمز تجريبي لنسخة العرض: <b>${esc(F.demoCode)}</b></div>`:''}<div class="ge"></div><label>الرمز<input id="gC" inputmode="numeric" dir="ltr" autocomplete="one-time-code" maxlength="6"></label><button class="gb main" id="gGo" data-g="doVerify">دخول</button></div><button class="gk" data-g="resend">إعادة إرسال الرمز</button><p style="font-size:13.5px">ما وصلك رمز؟ طلبك ينتظر الموافقة، أو تواصل مع الإدارة.</p>`,{back:'login'});},
  sent(){draw(`<div class="gi">⏳</div><h2>وصل طلبك</h2><p>طلبك ينتظر موافقة الإدارة، وبتتواصل معك على واتساب. بعد الموافقة ادخل برقم جوالك من «تسجيل الدخول».</p><div class="gs"><button class="gb main" data-g="guest">تصفح كزائر الآن</button></div>${note()}`);},
  refused(){draw(`<div class="gi">🔒</div><h2>${S.state==='revoked'?'تم إيقاف الصلاحية':'لم تتم الموافقة على الطلب'}</h2><p>للاستفسار تواصل مع إدارة الموقع.</p><div class="gs"><a class="gb main" style="display:grid;place-items:center;text-decoration:none" target="_blank" rel="noopener" href="https://wa.me/${ADMIN_WA}">تواصل مع الإدارة</a><button class="gb" data-g="guest">تصفح كزائر</button><button class="gb" data-g="logout">تسجيل الخروج</button></div>`);},
  notfound(){draw(`<div class="gi">🌳</div><h2>الاسم غير موجود</h2><p>التسجيل لأفراد الأسرة الموجودين في الشجرة فقط. إذا كان اسمك ناقصاً، تواصل مع الإدارة لإضافته.</p><div class="gs"><a class="gb main" style="display:grid;place-items:center;text-decoration:none" target="_blank" rel="noopener" href="https://wa.me/${ADMIN_WA}">تواصل مع الإدارة</a></div>`,{back:'register'});},
  ask(){draw(`<div class="gi">📞</div><h2>تبي يظهر رقمك لأفراد الأسرة؟</h2><p>يظهر زر اتصال وواتساب في بطاقتك للأعضاء المقبولين فقط، والزوار ما يشوفونه. تقدر تطفيه في أي وقت من بطاقتك.</p><div class="gs"><div class="ge"></div><button class="gb main" id="gGo" data-g="shareYes">نعم، أظهر رقمي</button><button class="gb" data-g="close">ليس الآن</button></div>${note()}`);},
  account(){draw(`<div class="gi">✅</div><h2>${esc(S.name)}</h2><p>${esc(S.chain)}</p><div class="gs"><button class="gb" data-g="logout">تسجيل الخروج</button></div>${note()}`,{x:1});},
};
// كل أسماء الشجرة مرة واحدة، والسلسلة تميّز بين المتشابهين
async function people(){if(tree)return tree;try{const j=await(await fetch('people_all.json')).json(),by=new Map(j.map(p=>[p.id,p]));tree=j.filter(p=>p&&p.name).map(p=>{const c=[];let q=p,prev=null,n=0;while(q&&n++<40){c.push((prev?(prev.gender==='f'?'بنت ':'بن '):'')+q.name);prev=q;q=by.get(q.father);}const chain=c.join(' ');return{id:p.id,name:p.name,chain,key:norm(chain)};});}catch(e){tree=[];}return tree;}
async function search(e){const v=norm(e.target.value),box2=root&&root.querySelector('#gR');if(!box2)return;if(v.length<2){box2.innerHTML='';return;}const t=v.split(/\s+/).filter(w=>w!=='بن'&&w!=='بنت'),L=await people(),hit=L.filter(p=>{let i=0;for(const w of t){const k=p.key.indexOf(w,i);if(k<0)return false;i=k+w.length;}return true;}).slice(0,30);
  box2.innerHTML=hit.length?hit.map(p=>`<button type="button" data-id="${p.id}"><b>${esc(p.name)}</b><small>${esc(p.chain)}</small></button>`).join(''):'<p style="font-size:14px">ما لقينا هذا الاسم. جرّب اسمك واسم أبيك.</p>';}
const val=s=>{const e=root.querySelector(s);return e?e.value:'';};
const after=j=>{apply(j);if(S.state==='approved')location.reload();else V.refused();};
const A={
  close,start:()=>V.start(),login:()=>V.login(),register:()=>V.register(),notfound:()=>V.notfound(),
  guest(){ss.set(SEEN+S.state,'1');close();},
  doSend(){return run('#gGo',async()=>{const phone=phoneOf(val('#gPh'));if(!phone)throw new Stop('رقم الجوال غير صحيح. اكتبه مثل 05xxxxxxxx.');const j=await call('send',{phone});F={phone,demoCode:j.demoCode};V.code();});},
  doRegister(){return run('#gGo',async()=>{const phone=phoneOf(val('#gPh'));if(!phone)throw new Stop('رقم الجوال غير صحيح. اكتبه مثل 05xxxxxxxx.');const p=F.person;await call('register',{pid:p.id,phone,name:p.name,chain:p.chain});V.sent();});},
  doVerify(){return run('#gGo',async()=>after(await call('verify',{phone:F.phone,code:digits(val('#gC')).trim()})));},
  resend(){return run('.gk[data-g=resend]',async()=>{const j=await call('send',{phone:F.phone});F.demoCode=j.demoCode;V.code();});},
  async logout(){try{await call('logout');}catch(e){}location.reload();},
  shareYes(){return run('#gGo',async()=>{await setShare(true);close();});},
};
document.addEventListener('click',e=>{if(!root||!root.contains(e.target))return;const p=e.target.closest('[data-id]');if(p&&tree){F.person=tree.find(x=>x.id===+p.dataset.id);V.details();return;}const b=e.target.closest('[data-g]');if(b&&A[b.dataset.g])A[b.dataset.g]();});
function open(){ready.then(()=>{if(S.state==='approved')V.account();else if(S.state==='none')V.start(1);else V.refused();});}
if(MODAL)ready.then(()=>{if(S.state==='approved'||ss.get(SEEN+S.state))return;   // كل حالة جديدة تظهر مرة، فمن أُلغيت صلاحيته يعرف
  if(S.state==='none')V.start();else V.refused();});
const ask=()=>{const k='ajlan-share-asked-'+S.pid;try{if(localStorage.getItem(k))return;localStorage.setItem(k,'1');}catch(e){return;}V.ask();};
return{ready,can,photoIndex,photoUrl,open,setShare,shared,contact,ask,get state(){return S.state;},get mode(){return S.mode;},get pid(){return S.pid;},get share(){return S.share;},get name(){return S.name;}};
})();
