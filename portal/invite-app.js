/* مصمم المناسبات: الخطوات والحفظ والمصغرات والتحميل */
(function(){
'use strict';
const X=window.OCC_ENGINE,D=window.OCC_DATA,{OCC,ORDER}=D,LIST=window.OCC_DESIGNS,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const KEY='ajlan-occasions-v1',OLD='ajlan-invite-v1';
const FOOT={social:'@alajlanandaleid',site:'alajlanandaleid.com',snap:'alajlanendaleid',tg:'t.me/Alajlanandaleid'};
const fresh=()=>({v:1,occ:'wedding',size:'post',foot:{...FOOT},o:Object.fromEntries(ORDER.map(id=>[id,D.blank(id)]))});

// ===== الحفظ =====
function fromOld(S){try{const v=JSON.parse(localStorage.getItem(OLD)||'null');if(!v)return;const w=S.o.wedding;   // النسخة السابقة: دعوة زواج واحدة
    OCC.wedding.fields.forEach(f=>{if(typeof v[f.k]==='string')w.f[f.k]=v[f.k];});
    if(Array.isArray(v.photos)){const P=v.photos.filter(p=>p&&(p.src||p.name));if(!v.v2&&P.length===3&&P[2].role==='العريس'&&P[1].role!=='العريس')[P[1],P[2]]=[P[2],P[1]];if(P.length)w.photos=P;}
    if(OCC.wedding.pals.includes(v.theme))w.pal=v.theme;if(X.SIZES[v.size])S.size=v.size;
    for(const k of['social','site'])if(typeof v[k]==='string')S.foot[k]=v[k];}catch(e){}}
function load(){const S=fresh();let saved=null;try{saved=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){}
  if(!saved||saved.v!==1){fromOld(S);return S;}
  if(OCC[saved.occ])S.occ=saved.occ;if(X.SIZES[saved.size])S.size=saved.size;Object.assign(S.foot,saved.foot);
  ORDER.forEach(id=>{if(saved.o&&saved.o[id])S.o[id]={...S.o[id],...saved.o[id]};});return S;}
let S=load(),step=1;
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){try{const c=structuredClone(S);ORDER.forEach(id=>c.o[id].photos.forEach(p=>{if(String(p.src).startsWith('data:'))p.src='';}));localStorage.setItem(KEY,JSON.stringify(c));}catch(e2){}}}
const cur=()=>S.o[S.occ];
const curDesign=()=>{const st=cur(),l=LIST[S.occ];return(l.find(d=>d[0]===st.design)||l[0])[0];};
const vNow=()=>D.vals(S.occ,cur());
const isPro=()=>{const d=LIST[S.occ].find(x=>x[0]===curDesign());return!!(d&&d[4]);};

// ===== الرسم =====
const cv=$('#cv'),gx=cv.getContext('2d');let ready=false,rafId=0;
function draw(){const[W,H]=X.SIZES[S.size];if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}gx.clearRect(0,0,W,H);const r=window.occRender(gx,{id:S.occ,st:cur(),size:S.size,foot:S.foot,design:curDesign()});syncPager(r.pages);return r;}
// الجدول الطويل يتوزع على صفحات
function syncPager(n){const el=$('#pager'),st=cur();if(n<2){el.hidden=true;st.page=0;return;}if((st.page|0)>=n)st.page=n-1;el.hidden=false;el.innerHTML=Array.from({length:n},(_,i)=>`<button data-pg="${i}" class="${(st.page|0)===i?'on':''}">صفحة ${(i+1).toLocaleString('ar-SA')}</button>`).join('');}
$('#pager').addEventListener('click',e=>{const b=e.target.closest('[data-pg]');if(!b)return;cur().page=+b.dataset.pg;save();draw();});
const reqDraw=()=>{if(!ready||step<3)return;cancelAnimationFrame(rafId);rafId=requestAnimationFrame(()=>{draw();window.OCC_PUB.touch();});};
// المصغرات: واحد كل دفعة عشان الصفحة ما تعلق
let thumbQ=[],thumbT=0,thumbSeq=0;
function paintThumb(c,o){const[W,H]=X.SIZES[o.size],px=Math.min(420,Math.max(160,Math.round((c.clientWidth||180)*Math.min(devicePixelRatio||1,2)))),sc=px/W,h=Math.round(H*sc);if(c.width!==px||c.height!==h){c.width=px;c.height=h;}const x=c.getContext('2d');x.clearRect(0,0,px,h);window.occRender(x,{...o,scale:sc,quick:true,foot:S.foot});}
function pump(seq){if(seq!==thumbSeq)return;const t=thumbQ.shift();if(!t)return;paintThumb(t.c,t.o);setTimeout(()=>requestAnimationFrame(()=>pump(seq)),0);}
function queueThumbs(delay=90){clearTimeout(thumbT);thumbT=setTimeout(()=>{if(!ready)return;thumbSeq++;thumbQ=[];
    if(step===1)$$('#occGrid canvas').forEach(c=>{const id=c.dataset.id;thumbQ.push({c,o:{id,st:S.o[id],size:'post',design:S.o[id].design}});});
    if(step===2)$$('#desGrid canvas').forEach(c=>thumbQ.push({c,o:{id:S.occ,st:cur(),size:S.size,design:c.dataset.d}}));
    pump(thumbSeq);},delay);}
X.setAsset(()=>{clearTimeout(assetT);assetT=setTimeout(()=>{queueThumbs(0);reqDraw();},60);});let assetT=0;

// ===== أدوات اختيار مشتركة =====
function syncSeg(){const[W,H]=X.SIZES[S.size];
  $$('[data-size]').forEach(el=>{el.innerHTML=[['post','بوست'],['square','مربع'],['story','ستوري']].map(([k,t])=>`<button data-v="${k}" class="${S.size===k?'on':''}">${t}</button>`).join('');});
  const st=cur(),occ=OCC[S.occ],on=st.pal&&occ.pals.includes(st.pal)?st.pal:(occ.genderPal?occ.genderPal[st.gender]:occ.pals[0]);
  $$('[data-pal]').forEach(el=>{el.innerHTML=occ.pals.map(k=>`<button data-v="${k}" class="${on===k?'on':''}"><i style="background:${X.PAL[k].sw}"></i>${X.PAL[k].name}</button>`).join('');});
  $$('#desGrid canvas').forEach(c=>{c.style.aspectRatio=W+'/'+H;});}
document.addEventListener('click',e=>{const b=e.target.closest('[data-size] button,[data-pal] button');if(!b)return;if(b.parentElement.hasAttribute('data-size'))S.size=b.dataset.v;else cur().pal=b.dataset.v;save();syncSeg();queueThumbs(0);reqDraw();});

// ===== الخطوة ١ و ٢ =====
function buildOcc(){$('#occGrid').innerHTML=ORDER.map(id=>{const o=OCC[id];return`<button class="occ${id===S.occ?' on':''}" data-occ="${id}"><canvas data-id="${id}" width="216" height="270" style="aspect-ratio:1080/1350"></canvas><strong>${o.name}</strong><small>${o.desc}</small></button>`;}).join('');}
$('#occGrid').addEventListener('click',e=>{const b=e.target.closest('[data-occ]');if(!b)return;S.occ=b.dataset.occ;save();go(2);});
// كل مناسبة بكلمتها: زر البدء وزر إكمال الموجود
const NEWT={wedding:['دعوة جديدة','أكمل دعوتي الحالية'],general:['دعوة جديدة','أكمل دعوتي الحالية'],qiran:['تهنئة جديدة','أكمل تهنئتي الحالية'],promo:['تهنئة جديدة','أكمل تهنئتي الحالية'],graduate:['تهنئة جديدة','أكمل تهنئتي الحالية'],baby:['تهنئة جديدة','أكمل تهنئتي الحالية'],condolence:['نعي جديد','أكمل النعي الحالي'],schedule:['جدول جديد','أكمل جدولي الحالي'],news:['خبر جديد','أكمل خبري الحالي']};
function buildGallery(){const o=OCC[S.occ],sel=curDesign();$('#v2h').textContent='اختر تصميم '+o.name;$('#newBtn').textContent='＋ '+NEWT[S.occ][0];
  $('#desGrid').innerHTML=LIST[S.occ].map(d=>`<button class="des${d[0]===sel?' on':''}" data-d="${d[0]}"><canvas data-d="${d[0]}"></canvas><strong>${d[1]}</strong><small>${d[2]}</small></button>`).join('');syncSeg();}
function startNew(){D.clearData(S.occ,cur());openRow=OCC[S.occ].fields.some(f=>f.card)?0:-1;save();go(3);}
$('#newBtn').addEventListener('click',()=>{if(!D.hasData(S.occ,cur()))return startNew();$('#newH').textContent=NEWT[S.occ][0];$('#newKeep').textContent=NEWT[S.occ][1];$('#newDlg').showModal();});
$('#newGo').addEventListener('click',()=>{$('#newDlg').close();startNew();});
$('#newKeep').addEventListener('click',()=>{$('#newDlg').close();go(3);});
const pickDes=d=>{cur().design=d;save();$$('.des').forEach(x=>x.classList.toggle('on',x.dataset.d===d));syncNav();};
$('#desGrid').addEventListener('click',e=>{const b=e.target.closest('.des');if(!b)return;pickDes(b.dataset.d);zoomShow(b.dataset.d);});
// تكبير التصميم: يرسم بالمقاس الكامل، وتنقل بين التصاميم بالأسهم
const zm=$('#zoom'),zc=$('#zoomCv');let zd=null;
function zoomShow(d){zd=d;const[W,H]=X.SIZES[S.size];zc.width=W;zc.height=H;zc.getContext('2d').clearRect(0,0,W,H);window.occRender(zc.getContext('2d'),{id:S.occ,st:cur(),size:S.size,foot:S.foot,design:d});
  const t=$$('.des').find(x=>x.dataset.d===d);$('#zoomName').textContent=t?t.querySelector('strong').textContent:'';$('#zoomPrev').hidden=$('#zoomNext').hidden=$('#zoomPick').hidden=!t;if(!zm.open)zm.showModal();}
const zoomMove=n=>{const l=$$('.des'),i=l.findIndex(x=>x.dataset.d===zd);if(i<0)return;const b=l[(i+n+l.length)%l.length];pickDes(b.dataset.d);zoomShow(b.dataset.d);};
$('#zoomNext').addEventListener('click',()=>zoomMove(1));$('#zoomPrev').addEventListener('click',()=>zoomMove(-1));$('#zoomClose').addEventListener('click',()=>zm.close());
$('#zoomPick').addEventListener('click',()=>{zm.close();go(3);});
zm.addEventListener('click',e=>{if(e.target===zm)zm.close();});
zm.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')zoomMove(1);if(e.key==='ArrowRight')zoomMove(-1);});

// ===== الخطوة ٣: الحقول =====
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// قائمة أسماء أو صفوف: إضافة وحذف بلا حد
function listOf(f){const st=cur();if(!Array.isArray(st.f[f.k]))st.f[f.k]=structuredClone(D.raw(S.occ,st,f));return st.f[f.k];}
const ltrA=c=>c.ltr?' dir="ltr"':'';
function listHTML(f,st){const L=D.raw(S.occ,st,f),inp=(x,i,c)=>`<input data-li="${f.k}" data-i="${i}" data-c="${c.k}" placeholder="${esc(c.ph||'')}" maxlength="${c.ltr?400:120}"${ltrA(c)} value="${esc(x[c.k]||'')}">`;
  const rows=f.card?L.map((x,i)=>`<details class="lcard"${i===openRow?' open':''}><summary><b>${(i+1).toLocaleString('ar-SA')}</b><span>${esc(x.host||'مناسبة جديدة')}</span><small>${esc(x.hijri||'')}</small></summary><div class="lgrid">${f.item.map(c=>`<label class="f${c.half?' half':''}">${c.label}${inp(x,i,c)}</label>`).join('')}<div class="lbtns"><button data-la="up" data-l="${f.k}" data-i="${i}">↑ فوق</button><button data-la="down" data-l="${f.k}" data-i="${i}">↓ تحت</button><button data-la="del" data-l="${f.k}" data-i="${i}">حذف</button></div></div></details>`).join(''):L.map((x,i)=>`<div class="lrow">${f.item.map(c=>inp(x,i,c)).join('')}${f.rah?`<label class="rahc"><input type="checkbox" data-lr="${f.k}" data-i="${i}"${x.rah?' checked':''}>يرحمه الله</label>`:''}<button class="lx" data-la="del" data-l="${f.k}" data-i="${i}" aria-label="حذف">×</button></div>`).join('');
  return`<div class="lst"><span class="ltl">${f.label}${f.card?` (${L.length.toLocaleString('ar-SA')})`:''}</span>${rows}<button class="ladd" data-la="add" data-l="${f.k}">${f.add}</button></div>`;}
let openRow=-1;
function optsHTML(f,st){if(!f.opts)return'';const v=D.raw(S.occ,st,f);return`<div class="seg titles" data-opts="${f.k}">${['',...f.opts(st.gender)].map(t=>`<button type="button" data-opt="${t}" class="${v===t?'on':''}">${t||'بدون'}</button>`).join('')}</div>`;}
function fieldHTML(f,st,on){if(f.type==='list')return listHTML(f,st);if(f.type==='toggle')return`<label class="tg"><input type="checkbox" data-t="${f.k}"${on[f.k]?' checked':''}>${f.label}</label>`;if(f.sec&&!on[f.sec])return'';
  const ph=esc(f.hint||(f.ph?D.phOf(f,st.gender):'')),a=`data-f="${f.k}" placeholder="${ph}" maxlength="${f.type==='area'?420:f.ltr?400:90}"${f.ltr||f.tel?' dir="ltr"':''}${f.tel?' inputmode="tel"':''}`,val=esc(D.raw(S.occ,st,f));
  return`<label class="f${f.half?' half':''}${f.req?' req':''}">${D.labelOf(f,st.gender)}${f.type==='area'?`<textarea ${a}>${val}</textarea>`:`<input ${a} value="${val}">`}</label>${optsHTML(f,st)}${f.rah?`<label class="rahc solo"><input type="checkbox" data-rah="${f.k}"${st.f[f.k+'_r']?' checked':''}>يرحمه الله</label>`:''}`;}
function buildFields(){const id=S.occ,o=OCC[id],st=cur(),p=$('#p3'),on={};o.fields.forEach(f=>{if(f.type==='toggle')on[f.k]=!!D.raw(id,st,f);});let h='';
  if(o.gender)h+=`<div class="card"><h3>${o.genderTitle}</h3><div class="body"><div class="seg" data-gender>${['m','f'].map((k,i)=>`<button data-v="${k}" class="${st.gender===k?'on':''}">${o.genderLabels[i]}</button>`).join('')}</div><p class="hint">الصيغ كلها تتعدل تلقائياً حسب الاختيار.</p></div></div>`;
  h+=`<div class="card"><h3>البيانات</h3><div class="body">${o.fields.filter(f=>!f.grp).map(f=>fieldHTML(f,st,on)).join('')}</div></div>`;
  if(o.remind){const r=st.rem||{};h+=`<div class="card"><h3>التذكير</h3><div class="body"><div class="seg" data-rem>${[['','بدون'],['today','اليوم'],['tomorrow','غداً'],['after','بعد غد']].map(([k,t])=>`<button data-v="${k}" class="${(r.when||'')===k?'on':''}">${t}</button>`).join('')}</div>${r.when?`<label class="f">تذكير بـ<input data-remw maxlength="40" value="${esc(r.what??o.remind)}"></label>`:''}<p class="hint">التذكير يطلع شريط ذهبي كبير أعلى التصميم، منفصل عن تاريخ المناسبة.</p></div></div>`;}
  const noPh=o.noPhotos||(o.noPhotoFemale&&st.gender==='f');if(!noPh)h+=`<div class="card"><h3>الصور</h3><div class="body" id="photos"></div></div><div class="card" id="layCard" hidden><h3>توزيع الصور</h3><div class="body"><div class="seg lays" data-lay></div><p class="hint">اضغط ★ على أي صورة لتكون الرئيسية الأكبر.</p></div></div>`;
  h+=`<div class="card"><h3>اللون</h3><div class="body"><div class="seg" data-pal></div></div></div>`;
  h+=`<details class="card"><summary>تعديل الصيغة</summary><div class="body">${o.fields.filter(f=>f.grp==='word').map(f=>fieldHTML(f,st,on)).join('')}
    <label class="f half">حسابات الأسرة<input data-foot="social" dir="ltr" value="${esc(S.foot.social)}"></label><label class="f half">الموقع<input data-foot="site" dir="ltr" value="${esc(S.foot.site)}"></label><label class="f half">سناب شات<input data-foot="snap" dir="ltr" value="${esc(S.foot.snap)}"></label><label class="f half">تيليجرام<input data-foot="tg" dir="ltr" value="${esc(S.foot.tg)}"></label>
    <button class="btn ghost" data-act="reset" style="justify-self:start">↺ رجّع نموذج هذه المناسبة</button><p class="hint">كل اللي تكتبه ينحفظ في جهازك تلقائياً. الصور تنحفظ إذا كانت مساحة الجهاز تسمح.</p></div></details>`;
  p.innerHTML=h;if(!noPh){buildPhotos();if(o.photoFirst)p.insertBefore($('#photos').closest('.card'),[...p.children].find(c=>c.querySelector('[data-f]')));}syncSeg();}
const p3=$('#p3');
p3.addEventListener('input',e=>{const t=e.target,st=cur();if(t.dataset.f){const f=OCC[S.occ].fields.find(x=>x.k===t.dataset.f);st.f[D.fkey(f,D.gk(S.occ,st))]=t.value;save();reqDraw();}else if(t.dataset.foot){S.foot[t.dataset.foot]=t.value;save();reqDraw();}
  else if(t.dataset.li){const f=OCC[S.occ].fields.find(x=>x.k===t.dataset.li);listOf(f)[+t.dataset.i][t.dataset.c]=t.value;save();reqDraw();}else if('remw' in t.dataset){st.rem.what=t.value;save();reqDraw();}});
p3.addEventListener('change',e=>{const t=e.target;if(t.dataset.t){cur().f[t.dataset.t]=t.checked;save();buildFields();reqDraw();}else if(t.dataset.rah){cur().f[t.dataset.rah+'_r']=t.checked;save();reqDraw();}else if(t.dataset.lr){const f=OCC[S.occ].fields.find(x=>x.k===t.dataset.lr);listOf(f)[+t.dataset.i].rah=t.checked;save();reqDraw();}});
p3.addEventListener('click',e=>{const b=e.target.closest('[data-opt]');if(!b)return;const el=p3.querySelector(`[data-f="${b.parentElement.dataset.opts}"]`);el.value=b.dataset.opt;el.dispatchEvent(new Event('input',{bubbles:true}));});
p3.addEventListener('input',e=>{const g=e.target.dataset.f&&p3.querySelector(`[data-opts="${e.target.dataset.f}"]`);if(g)g.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x.dataset.opt===e.target.value));});
p3.addEventListener('click',e=>{const st=cur(),la=e.target.closest('[data-la]');
  if(la){e.preventDefault();const f=OCC[S.occ].fields.find(x=>x.k===la.dataset.l),L=listOf(f),i=+la.dataset.i,a=la.dataset.la;openRow=-1;
    if(a==='add'){L.push({...(f.fresh||{})});openRow=L.length-1;}if(a==='del')L.splice(i,1);if(a==='up'&&i>0){[L[i-1],L[i]]=[L[i],L[i-1]];openRow=i-1;}if(a==='down'&&i<L.length-1){[L[i+1],L[i]]=[L[i],L[i+1]];openRow=i+1;}
    save();buildFields();reqDraw();return;}
  const rm=e.target.closest('[data-rem] button');if(rm){st.rem=rm.dataset.v?{when:rm.dataset.v,what:st.rem&&st.rem.what!==undefined?st.rem.what:OCC[S.occ].remind}:{when:'',what:st.rem&&st.rem.what};save();buildFields();reqDraw();return;}
  const ly=e.target.closest('[data-lay] button');if(ly){st.lay=ly.dataset.v;save();buildPhotos();reqDraw();return;}
  const b=e.target.closest('[data-gender] button');if(!b)return;st.gender=b.dataset.v;save();buildFields();reqDraw();});

function pickFile(input,done){const f=input.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{   // نصغّر الصورة عشان تنحفظ
    const k=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);done(c.toDataURL('image/jpeg',.9));};im.onerror=()=>toast('تعذر قراءة الصورة');im.src=r.result;};r.readAsDataURL(f);}
function buildPhotos(){const box=$('#photos');if(!box)return;box.innerHTML='';const id=S.occ,o=OCC[id],st=cur(),v=vNow();
  const pro=isPro(),caps=o.caps||pro,max=o.onePhoto?1:pro&&o.proPhotos?o.proPhotos:o.maxPhotos(st,v),names=['الأولى','الثانية','الثالثة','الرابعة','الخامسة','السادسة','السابعة','الثامنة','التاسعة'],list=st.photos.slice(0,max),PR=window.OCC_PRO,on=st.photos.filter(p=>p.src).slice(0,max),spot=pro?PR.spots(on,st.lay||PR.defLay(on.length)):new Map();
  list.forEach((p,i)=>{const d=document.createElement('div');d.className='ph';
    d.innerHTML=`<div class="hd"><span class="th"></span><b>${spot.get(p)||(max>1?'الصورة '+names[i]:'الصورة')}<em class="prole"></em></b><span class="x">${pro&&max>1?`<button class="star${p.main?' on':''}" data-main title="الصورة الرئيسية">★</button>`:''}<label class="up">تغيير<input type="file" accept="image/*"></label><button data-del>حذف</button></span></div>
      ${caps&&!o.onePhoto?`<div class="row2"><label class="f">الصفة<input data-p="role"></label><label class="f">الاسم<input data-p="name"></label></div><label class="f">سطر تحت الاسم (اختياري)<input data-p="note" placeholder="مثل: رحمه الله"></label><label class="rahc solo"><input type="checkbox" data-prah${p.note==='- يرحمه الله -'?' checked':''}>يرحمه الله</label>`:''}
      <div class="row3"><label class="f">تكبير<input type="range" min="1" max="2.5" step=".01" data-r="z"></label><label class="f">يمين/يسار<input type="range" min="-1" max="1" step=".01" data-r="x"></label><label class="f">فوق/تحت<input type="range" min="-1" max="1" step=".01" data-r="y"></label></div>`;
    d.querySelector('.th').style.backgroundImage=p.src?`url("${p.src}")`:'none';
    const pr=d.querySelector('.prole'),syncRole=()=>{pr.textContent=caps&&p.role||'';pr.hidden=!pr.textContent;};syncRole();
    d.querySelectorAll('[data-p]').forEach(el=>{el.value=p[el.dataset.p]||'';el.addEventListener('input',()=>{p[el.dataset.p]=el.value;syncRole();save();reqDraw();});});
    d.querySelectorAll('[data-r]').forEach(el=>{el.value=p[el.dataset.r]??(el.dataset.r==='z'?1:0);el.addEventListener('input',()=>{p[el.dataset.r]=+el.value;save();reqDraw();});});
    d.querySelector('input[type=file]').addEventListener('change',e=>pickFile(e.target,src=>{p.src=src;p.z=1;p.x=0;p.y=0;save();buildPhotos();reqDraw();}));
    d.querySelector('[data-del]').addEventListener('click',()=>{st.photos.splice(i,1);save();buildPhotos();reqDraw();});
    const mb=d.querySelector('[data-main]');if(mb)mb.addEventListener('click',()=>{const on=!p.main;st.photos.forEach(q=>{q.main=false;});p.main=on;save();buildPhotos();reqDraw();});
    const rb=d.querySelector('[data-prah]');if(rb)rb.addEventListener('change',()=>{p.note=rb.checked?'- يرحمه الله -':'';d.querySelector('[data-p="note"]').value=p.note;save();reqDraw();});box.appendChild(d);});
  if(list.length<max){const a=document.createElement('label');a.className='addph';a.innerHTML=`＋ أضف صورة<input type="file" accept="image/*">`;a.querySelector('input').addEventListener('change',e=>pickFile(e.target,src=>{st.photos.push({src,role:(o.roles||[])[st.photos.length]||'',name:'',note:'',z:1,x:0,y:0});save();buildPhotos();reqDraw();}));box.appendChild(a);}
  const h=document.createElement('p');h.className='hint';h.textContent=max===1?'الصورة تطلع في إطار، وهذي المناسبة تكتمل بدون صورة أيضاً.':pro?`تقدر تضيف حتى ${max.toLocaleString('ar-SA')} صور، والتصميم يكتمل بدونها أيضاً. كبّر الصورة ثم حرّكها لتضبط مكان الوجه.`:`هذا التصميم يعرض حتى ${max.toLocaleString('ar-SA')} صور. لعرض أكثر، اختر تصميم «الحرير الفاخر» أو «المحراب المضيء» أو «الرأس الملكي». كبّر الصورة ثم حرّكها لتضبط مكان الوجه.`;box.appendChild(h);syncLay();}
function syncLay(){const c=$('#layCard');if(!c)return;const st=cur(),n=st.photos.filter(p=>p.src).length,PR=window.OCC_PRO,on=st.lay||PR.defLay(n);c.hidden=!(isPro()&&n>=2&&!OCC[S.occ].onePhoto);c.querySelector('[data-lay]').innerHTML=PR.LAYS.map(([k,t])=>`<button data-v="${k}" class="${on===k?'on':''}">${t}</button>`).join('');}
$('#stage').addEventListener('click',e=>{if(e.target!==cv)return;if(matchMedia('(max-width:980px)').matches)$('#stage').classList.toggle('big');else zoomShow(curDesign());});

// ===== الخطوات =====
const NEXT={1:'التالي: التصميم',2:'التالي: البيانات',3:'التالي: النشر',4:'نشر كخبر في الموقع'};
function syncNav(){$$('#steps button').forEach(b=>{const n=+b.dataset.go;b.classList.toggle('on',n===step);b.classList.toggle('done',n<step);});$('#back').hidden=step===1;$('#next').textContent=NEXT[step];}
function go(n,noPush){step=n;document.body.dataset.step=n;$('#v1').hidden=n!==1;$('#v2').hidden=n!==2;$('#work').hidden=n<3;$('#p3').hidden=n!==3;$('#p4').hidden=n!==4;
  if(n===1)buildOcc();if(n===2)buildGallery();if(n===3)buildFields();if(n===4){syncSeg();buildStatus();window.OCC_PUB.enter();}if(n>=3&&ready)draw();
  $('#stage').classList.remove('big');syncNav();queueThumbs(0);scrollTo(0,0);if(!noPush&&location.hash!=='#'+n)history.pushState(null,'','#'+n);}
addEventListener('popstate',()=>go(+location.hash.slice(1)||1,true));
$('#steps').addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)go(+b.dataset.go);});
$('#back').addEventListener('click',()=>go(Math.max(1,step-1)));
$('#next').addEventListener('click',()=>{if(step<4)go(step+1);else window.OCC_PUB.direct();});
function buildStatus(){const m=D.missing(S.occ,cur()),st=cur();$('#status').innerHTML=m.length?`<div class="miss">باقي تعبئة: <ul>${m.map(f=>`<li>${esc(D.labelOf(f,st.gender))}</li>`).join('')}</ul></div>`:'<div class="ok">كل البيانات مكتملة. راجع الصورة والنص ثم اختر وين تنشره.</div>';}

// ===== التحميل والمشاركة =====
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),2200);};
const fname=()=>{const v=D.vals(S.occ,cur()),n=String(v.name||v.groom||v.title||'').replace(/[«»]/g,'').trim().split(/\s+/)[0]||'الأسرة';return OCC[S.occ].name.replace(/\s+/g,'-')+'-'+n+'.png';};
let pending=null,pendingFn=null;
// تنبيه البيانات الناقصة قبل أي نشر
// strict: النشر المباشر ما يطلع النص المؤقت للناس، فلازم تكمل البيانات
function guard(fn,strict){const m=D.missing(S.occ,cur());if(!m.length)return fn();pendingFn=fn;$('#warnGo').hidden=!!strict;$('#warnList').innerHTML=m.map(f=>`<li>${esc(D.labelOf(f,cur().gender))}</li>`).join('');$('#warn').showModal();}
// كل صفحات التصميم: JPEG للمشاركة والخبر، وPNG للحافظة
function renderAll(){const st=cur(),keep=st.page|0,n=draw().pages,jobs=[],blob=(t,q)=>new Promise((res,rej)=>cv.toBlob(b=>b?res(b):rej(new Error('encode')),t,q)),base=fname().replace('.png','');
  for(let i=0;i<n;i++){st.page=i;draw();const nm=n>1?`${base}-${i+1}`:base;jobs.push(blob('image/jpeg',.9).then(b=>new File([b],nm+'.jpg',{type:'image/jpeg'})),blob('image/png').then(b=>new File([b],nm+'.png',{type:'image/png'})));}
  st.page=keep;draw();return Promise.all(jobs).then(a=>({jpg:a.filter((f,i)=>i%2===0),png:a.filter((f,i)=>i%2)}));}
async function exportImg(kind,force){const m=D.missing(S.occ,cur());if(m.length&&!force){pending=kind;pendingFn=null;$('#warnGo').hidden=false;$('#warnList').innerHTML=m.map(f=>`<li>${esc(D.labelOf(f,cur().gender))}</li>`).join('');$('#warn').showModal();return;}
  // الجدول متعدد الصفحات: كل صفحة صورة
  const st=cur(),keep=st.page|0,pages=draw().pages,out=[];for(let i=0;i<pages;i++){st.page=i;draw();const blob=await new Promise(r=>cv.toBlob(r,'image/png'));if(!blob){st.page=keep;draw();toast('تعذر تجهيز الصورة');return;}out.push(new File([blob],pages>1?fname().replace('.png',`-${i+1}.png`):fname(),{type:'image/png'}));}st.page=keep;draw();
  if(kind==='share'&&navigator.canShare&&navigator.canShare({files:out})){try{await navigator.share({files:out,title:OCC[S.occ].name});}catch(e){}return;}
  for(const f of out){const u=URL.createObjectURL(f),l=document.createElement('a');l.href=u;l.download=f.name;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);if(pages>1)await new Promise(r=>setTimeout(r,350));}toast(pages===2?'تم تحميل صورتين':pages>2?`تم تحميل ${pages.toLocaleString('ar-SA')} صور`:'تم تحميل الصورة');}
$('#warnFix').addEventListener('click',()=>{$('#warn').close();pendingFn=null;go(3);setTimeout(()=>{const m=D.missing(S.occ,cur())[0],el=m&&document.querySelector(`[data-f="${m.k}"]`);if(el)el.focus();},60);});
$('#warnGo').addEventListener('click',()=>{$('#warn').close();if(pendingFn){const f=pendingFn;pendingFn=null;f();}else exportImg(pending,true);});
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act;
  if(a==='reset'){if(!confirm('ترجّع هذه المناسبة لنموذجها الأصلي؟'))return;const d=cur().design;S.o[S.occ]=D.blank(S.occ);cur().design=d;save();buildFields();reqDraw();return;}
  if(a==='again'){go(1);return;}exportImg(a);});

// ===== البدء: الخطوط أولاً، ثم أي رسم =====
if(new URLSearchParams(location.search).get('from')==='admin'){const h=$('.top .home');h.href='admin.html';h.textContent='لوحة التحكم';}
window.OCC_APP={get S(){return S;},get step(){return step;},get ready(){return ready;},draw,go,save,guard,renderAll,toast,setSize(k){S.size=k;save();syncSeg();queueThumbs(0);reqDraw();}};
const n0=+location.hash.slice(1);go(n0>=1&&n0<=4?n0:1,true);
const SAMPLE='بسم الله ﷽ عبدالعزيز ٢٣ abc 123 َُِّ';
const timeout=ms=>new Promise(r=>setTimeout(r,ms));
function start(){ready=true;X.clearMeasure();if(step>=3)draw();queueThumbs(0);window.OCC_PUB.prep();}
Promise.race([Promise.all(X.FONTS.map(f=>document.fonts.load(f,SAMPLE).catch(()=>{}))).then(()=>document.fonts.ready),timeout(5000)]).then(start);
document.fonts.addEventListener&&document.fonts.addEventListener('loadingdone',()=>{if(ready){X.clearMeasure();reqDraw();queueThumbs(40);}});
})();
