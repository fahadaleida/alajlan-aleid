/* مصمم المناسبات: الخطوات والحفظ والمصغرات والتحميل */
(function(){
'use strict';
const X=window.OCC_ENGINE,D=window.OCC_DATA,{OCC,ORDER}=D,LIST=window.OCC_DESIGNS,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const KEY='ajlan-occasions-v1',OLD='ajlan-invite-v1';
const FOOT={social:'@alajlanandaleid',site:'alajlanandaleid.com'};
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

// ===== الرسم =====
const cv=$('#cv'),gx=cv.getContext('2d');let ready=false,rafId=0;
function draw(){const[W,H]=X.SIZES[S.size];if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}gx.clearRect(0,0,W,H);return window.occRender(gx,{id:S.occ,st:cur(),size:S.size,foot:S.foot,design:curDesign()});}
const reqDraw=()=>{if(!ready||step<3)return;cancelAnimationFrame(rafId);rafId=requestAnimationFrame(draw);};
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
function buildGallery(){const o=OCC[S.occ],sel=curDesign();$('#v2h').textContent='اختر تصميم '+o.name;
  $('#desGrid').innerHTML=LIST[S.occ].map(d=>`<button class="des${d[0]===sel?' on':''}" data-d="${d[0]}"><canvas data-d="${d[0]}"></canvas><strong>${d[1]}</strong><small>${d[2]}</small></button>`).join('');syncSeg();}
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
function fieldHTML(f,st,on){if(f.type==='toggle')return`<label class="tg"><input type="checkbox" data-t="${f.k}"${on[f.k]?' checked':''}>${f.label}</label>`;if(f.sec&&!on[f.sec])return'';
  const ph=esc(f.hint||(f.ph?D.phOf(f,st.gender):'')),a=`data-f="${f.k}" placeholder="${ph}" maxlength="${f.type==='area'?420:f.ltr?400:90}"${f.ltr||f.tel?' dir="ltr"':''}${f.tel?' inputmode="tel"':''}`,val=esc(D.raw(S.occ,st,f));
  return`<label class="f${f.half?' half':''}${f.req?' req':''}">${D.labelOf(f,st.gender)}${f.type==='area'?`<textarea ${a}>${val}</textarea>`:`<input ${a} value="${val}">`}</label>`;}
function buildFields(){const id=S.occ,o=OCC[id],st=cur(),p=$('#p3'),on={};o.fields.forEach(f=>{if(f.type==='toggle')on[f.k]=!!D.raw(id,st,f);});let h='';
  if(o.gender)h+=`<div class="card"><h3>${o.genderTitle}</h3><div class="body"><div class="seg" data-gender>${['m','f'].map((k,i)=>`<button data-v="${k}" class="${st.gender===k?'on':''}">${o.genderLabels[i]}</button>`).join('')}</div><p class="hint">الصيغ كلها تتعدل تلقائياً حسب الاختيار.</p></div></div>`;
  h+=`<div class="card"><h3>البيانات</h3><div class="body">${o.fields.filter(f=>!f.grp).map(f=>fieldHTML(f,st,on)).join('')}</div></div>`;
  const noPh=o.noPhotoFemale&&st.gender==='f';if(!noPh)h+=`<div class="card"><h3>الصور</h3><div class="body" id="photos"></div></div>`;
  h+=`<div class="card"><h3>اللون</h3><div class="body"><div class="seg" data-pal></div></div></div>`;
  h+=`<details class="card"><summary>تعديل الصيغة</summary><div class="body">${o.fields.filter(f=>f.grp==='word').map(f=>fieldHTML(f,st,on)).join('')}
    <label class="f half">حسابات الأسرة<input data-foot="social" dir="ltr" value="${esc(S.foot.social)}"></label><label class="f half">الموقع<input data-foot="site" dir="ltr" value="${esc(S.foot.site)}"></label>
    <button class="btn ghost" data-act="reset" style="justify-self:start">↺ رجّع نموذج هذه المناسبة</button><p class="hint">كل اللي تكتبه ينحفظ في جهازك تلقائياً. الصور تنحفظ إذا كانت مساحة الجهاز تسمح.</p></div></details>`;
  p.innerHTML=h;if(!noPh)buildPhotos();syncSeg();}
const p3=$('#p3');
p3.addEventListener('input',e=>{const t=e.target,st=cur();if(t.dataset.f){const f=OCC[S.occ].fields.find(x=>x.k===t.dataset.f);st.f[D.fkey(f,st.gender)]=t.value;save();reqDraw();}else if(t.dataset.foot){S.foot[t.dataset.foot]=t.value;save();reqDraw();}});
p3.addEventListener('change',e=>{const t=e.target;if(t.dataset.t){cur().f[t.dataset.t]=t.checked;save();buildFields();reqDraw();}});
p3.addEventListener('click',e=>{const b=e.target.closest('[data-gender] button');if(!b)return;cur().gender=b.dataset.v;save();buildFields();reqDraw();});

function pickFile(input,done){const f=input.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{   // نصغّر الصورة عشان تنحفظ
    const k=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);done(c.toDataURL('image/jpeg',.9));};im.onerror=()=>toast('تعذر قراءة الصورة');im.src=r.result;};r.readAsDataURL(f);}
function buildPhotos(){const box=$('#photos');if(!box)return;box.innerHTML='';const id=S.occ,o=OCC[id],st=cur(),v=vNow();
  if(o.photoToggle){const t=document.createElement('label');t.className='tg';t.innerHTML=`<input type="checkbox" data-t="${o.photoToggle}"${D.raw(id,st,{k:o.photoToggle})?' checked':''}>إضافة صورة (اختياري)`;box.appendChild(t);if(!D.raw(id,st,{k:o.photoToggle}))return;}
  const max=o.photoToggle?1:o.maxPhotos(st,v),names=['الأولى','الثانية','الثالثة'],list=st.photos.slice(0,max);
  list.forEach((p,i)=>{const d=document.createElement('div');d.className='ph';
    d.innerHTML=`<div class="hd"><span class="th"></span><b>الصورة ${max>1?names[i]:''}</b><span class="x"><label class="up">تغيير<input type="file" accept="image/*"></label><button data-del>حذف</button></span></div>
      ${o.caps?`<div class="row2"><label class="f">الصفة<input data-p="role"></label><label class="f">الاسم<input data-p="name"></label></div><label class="f">سطر تحت الاسم (اختياري)<input data-p="note" placeholder="مثل: رحمه الله"></label>`:''}
      <div class="row3"><label class="f">تكبير<input type="range" min="1" max="2.5" step=".01" data-r="z"></label><label class="f">يمين/يسار<input type="range" min="-1" max="1" step=".01" data-r="x"></label><label class="f">فوق/تحت<input type="range" min="-1" max="1" step=".01" data-r="y"></label></div>`;
    d.querySelector('.th').style.backgroundImage=p.src?`url("${p.src}")`:'none';
    d.querySelectorAll('[data-p]').forEach(el=>{el.value=p[el.dataset.p]||'';el.addEventListener('input',()=>{p[el.dataset.p]=el.value;save();reqDraw();});});
    d.querySelectorAll('[data-r]').forEach(el=>{el.value=p[el.dataset.r]??(el.dataset.r==='z'?1:0);el.addEventListener('input',()=>{p[el.dataset.r]=+el.value;save();reqDraw();});});
    d.querySelector('input[type=file]').addEventListener('change',e=>pickFile(e.target,src=>{p.src=src;p.z=1;p.x=0;p.y=0;save();buildPhotos();reqDraw();}));
    d.querySelector('[data-del]').addEventListener('click',()=>{st.photos.splice(i,1);save();buildPhotos();reqDraw();});box.appendChild(d);});
  if(list.length<max){const a=document.createElement('label');a.className='addph';a.innerHTML=`＋ أضف صورة<input type="file" accept="image/*">`;a.querySelector('input').addEventListener('change',e=>pickFile(e.target,src=>{st.photos.push({src,role:'',name:'',note:'',z:1,x:0,y:0});save();buildPhotos();reqDraw();}));box.appendChild(a);}
  const h=document.createElement('p');h.className='hint';h.textContent=max===1?'الصورة تطلع في إطار مربع، وهذي المناسبة تكتمل بدون صورة أيضاً.':`الصور تطلع في إطارات مربعة، وتقدر تضيف حتى ${max===3?'٣ صور':max}. التصميم يكتمل بدونها أيضاً. كبّر الصورة ثم حرّكها لتضبط مكان الوجه.`;box.appendChild(h);}
$('#stage').addEventListener('click',e=>{if(e.target!==cv)return;if(matchMedia('(max-width:980px)').matches)$('#stage').classList.toggle('big');else zoomShow(curDesign());});

// ===== الخطوات =====
const NEXT={1:'التالي: التصميم',2:'التالي: البيانات',3:'التالي: التحميل',4:'⬇ تحميل الصورة'};
function syncNav(){$$('#steps button').forEach(b=>{const n=+b.dataset.go;b.classList.toggle('on',n===step);b.classList.toggle('done',n<step);});$('#back').hidden=step===1;$('#next').textContent=NEXT[step];}
function go(n,noPush){step=n;document.body.dataset.step=n;$('#v1').hidden=n!==1;$('#v2').hidden=n!==2;$('#work').hidden=n<3;$('#p3').hidden=n!==3;$('#p4').hidden=n!==4;
  if(n===1)buildOcc();if(n===2)buildGallery();if(n===3)buildFields();if(n===4){syncSeg();buildStatus();}if(n>=3&&ready)draw();
  $('#stage').classList.remove('big');syncNav();queueThumbs(0);scrollTo(0,0);if(!noPush&&location.hash!=='#'+n)history.pushState(null,'','#'+n);}
addEventListener('popstate',()=>go(+location.hash.slice(1)||1,true));
$('#steps').addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)go(+b.dataset.go);});
$('#back').addEventListener('click',()=>go(Math.max(1,step-1)));
$('#next').addEventListener('click',()=>{if(step<4)go(step+1);else exportImg('png');});
function buildStatus(){const m=D.missing(S.occ,cur()),st=cur();$('#status').innerHTML=m.length?`<div class="miss">باقي تعبئة: <ul>${m.map(f=>`<li>${esc(D.labelOf(f,st.gender))}</li>`).join('')}</ul></div>`:'<div class="ok">كل البيانات مكتملة. راجع الصورة ثم حمّلها أو شاركها.</div>';}

// ===== التحميل والمشاركة =====
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),2200);};
const fname=()=>{const v=D.vals(S.occ,cur()),n=String(v.name||v.groom||v.title||'').replace(/[«»]/g,'').trim().split(/\s+/)[0]||'الأسرة';return OCC[S.occ].name.replace(/\s+/g,'-')+'-'+n+'.png';};
let pending=null;
async function exportImg(kind,force){const m=D.missing(S.occ,cur());if(m.length&&!force){pending=kind;$('#warnList').innerHTML=m.map(f=>`<li>${esc(D.labelOf(f,cur().gender))}</li>`).join('');$('#warn').showModal();return;}
  draw();const blob=await new Promise(r=>cv.toBlob(r,'image/png'));if(!blob){toast('تعذر تجهيز الصورة');return;}
  if(kind==='share'&&navigator.canShare){const f=new File([blob],fname(),{type:'image/png'});if(navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:OCC[S.occ].name});}catch(e){}return;}}
  const u=URL.createObjectURL(blob),l=document.createElement('a');l.href=u;l.download=fname();document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);toast('تم تحميل الصورة');}
$('#warnFix').addEventListener('click',()=>{$('#warn').close();go(3);setTimeout(()=>{const m=D.missing(S.occ,cur())[0],el=m&&document.querySelector(`[data-f="${m.k}"]`);if(el)el.focus();},60);});
$('#warnGo').addEventListener('click',()=>{$('#warn').close();exportImg(pending,true);});
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act;
  if(a==='reset'){if(!confirm('ترجّع هذه المناسبة لنموذجها الأصلي؟'))return;const d=cur().design;S.o[S.occ]=D.blank(S.occ);cur().design=d;save();buildFields();reqDraw();return;}
  if(a==='again'){go(1);return;}exportImg(a);});

// ===== البدء: الخطوط أولاً، ثم أي رسم =====
const SAMPLE='بسم الله ﷽ عبدالعزيز ٢٣ abc 123 َُِّ';
const timeout=ms=>new Promise(r=>setTimeout(r,ms));
function start(){ready=true;X.clearMeasure();if(step>=3)draw();queueThumbs(0);}
const n0=+location.hash.slice(1);go(n0>=1&&n0<=4?n0:1,true);
Promise.race([Promise.all(X.FONTS.map(f=>document.fonts.load(f,SAMPLE).catch(()=>{}))).then(()=>document.fonts.ready),timeout(5000)]).then(start);
document.fonts.addEventListener&&document.fonts.addEventListener('loadingdone',()=>{if(ready){X.clearMeasure();reqDraw();queueThumbs(40);}});
window.OCC_APP={get S(){return S;},draw,go,save};
})();
