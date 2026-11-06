/* مصمم المناسبات: خطوة النشر. نص جاهز من بيانات النموذج فقط، ومشاركة واتساب وتيليجرام، وإرسال التصميم إلى محرر الأخبار */
(function(){
'use strict';
const D=window.OCC_DATA,{OCC}=D,$=s=>document.querySelector(s),App=()=>window.OCC_APP;
const WHEN={today:'اليوم',tomorrow:'غداً',after:'بعد غد'};
const L=(...a)=>a.filter(Boolean).join(' ');
const blocks=a=>a.filter(Boolean).join('\n\n');
const clip=t=>t.length>150?t.slice(0,150).replace(/\s+\S*$/,'')+'…':t;
const ar=n=>n.toLocaleString('ar-SA');
const mapLine=u=>u?'الموقع: '+u:'';
// الخانة الفاضية ما تطلع في النص، بدل النص البديل اللي يطلع في الصورة
function clean(id,st){const v=D.vals(id,st);D.missing(id,st).forEach(f=>{v[f.k]='';});return v;}
const namesOf=v=>[v.name,...v.more.map(x=>x.t)].filter(Boolean);
const joinN=a=>a.join(' و');
// لكل مناسبة: عنوان الخبر ونصه، بنفس كلام التصميم
const TEXT={
  wedding(v){const H=[v.host1,v.host2,...v.hosts.map(x=>x.t)].filter(Boolean),C=v.couples.filter(x=>x.groom),G=[v.groom,...C.map(x=>x.groom)].filter(Boolean),
      when=[v.time,v.day&&'يوم '+v.day,v.hijri,v.greg&&'الموافق '+v.greg,v.venue&&'في '+v.venue].filter(Boolean);
    return{title:L(v.badge||OCC.wedding.name,joinN(G)),text:[H.length?L(v.lead,joinN(H),v.body):'',v.groom?L(v.groomPre,v.groom):'',v.bride?L(v.bridePre,v.bride):'',
      ...C.map(x=>L('و'+x.groom,x.bride&&L(v.bridePre,x.bride))),when.length?L('وذلك بمشيئة الله تعالى',...when):'',v.close,mapLine(v.map)]};},
  qiran(v){const N=namesOf(v);return{title:L('عقد قران',joinN(N)),text:[N.length?L(v.congr,v.titleP,joinN(N)):'',N.length?v.line:'',v.bride?L(v.bridePre,v.bride):'',v.spouse?L(v.spousePre,v.spouse):'',v.text,v.dua]};},
  promo(v){const N=namesOf(v);return{title:L('ترقية',v.titleP,joinN(N),v.rank&&'إلى '+v.rank),text:[v.authority?L(v.intro,v.authority):'',N.length?L(v.pre,v.titleP,joinN(N)):'',
      v.rank?L(v.toPre,v.rank,v.spec&&v.specPre,v.spec):'',v.extra,v.congr,v.dua]};},
  condolence(v,st){const f=st.gender==='f',who=L(v.titleP&&v.titleP+'/',v.name,v.kunya&&'«'+v.kunya+'»',v.name&&v.rah&&'- '+v.rah+' -'),
      pray=v.prayTime||v.mosque?L(f?'وسوف تقام الصلاة عليها':'وسوف تقام الصلاة عليه',v.prayTime,v.mosque&&'في '+v.mosque):'',bury=v.cemetery?L(f?'وستوارى الثرى في':'وسيوارى الثرى في',v.cemetery):'',
      men=v.azaPlace||v.azaDays?L('للرجال',v.azaPlace,v.azaDays):'',aza=men||v.azaWomen?L('تنويه:',f?'سيكون العزاء في الفقيدة':'سيكون العزاء في الفقيد',men)+(v.azaWomen?'، أما النساء '+v.azaWomen:''):'',
      tel=v.menTel||v.womenTel?L('للتواصل:',v.menTel&&'الرجال '+v.menTel,v.womenTel&&'النساء '+v.womenTel):'';
    return{title:L('وفاة',v.titleP,v.name,v.name&&v.rah),text:[D.VERSE_ISTIRJA,L(v.lead,v.lead2),who,[pray,bury].filter(Boolean).join('، ')+(pray||bury?'.':''),aza,tel,mapLine(v.map),v.ayah?D.VERSE_NAFS:'',v.close]};},
  schedule(v){const rows=v.rows.map((r,i)=>[`${ar(i+1)}- ${r.host}`,[r.type,r.time,L(r.hijri,r.greg&&'الموافق '+r.greg)].filter(Boolean).join('، '),r.place,mapLine(r.map)].filter(Boolean).join('\n'));
    return{title:v.sub||v.title||OCC.schedule.name,text:[v.title,v.sub,...rows,L(v.noteT,v.phone),v.bySite]};},
  graduate(v){const N=namesOf(v);return{title:L('تخرج',v.titleP,joinN(N)),text:[v.title,N.length?L(v.lead,v.titleP,joinN(N)):'',
      v.degree?L(v.line,v.degree,v.major&&'في تخصص '+v.major,v.university&&'من '+v.university):'',v.close,v.from&&'المهنئون: '+v.from]};},
  baby(v){return{title:v.name?`${v.title}: ${v.name}`:v.title,text:[v.title,v.name?L(v.lead,v.name):'',v.parents?L(v.pre,v.parents):'',v.date&&'تاريخ الميلاد: '+v.date,v.dua]};},
  general(v){return{title:v.title||OCC.general.name,text:[v.title?L(v.lead,v.title):'',v.text,v.date||v.place?L(v.date,v.place&&'في '+v.place):'',v.close,mapLine(v.map)]};},
  news(v){return{title:v.title||OCC.news.name,text:[v.title,v.text,v.date]};}};
function compose(id,st){const r=TEXT[id](clean(id,st),st),rem=OCC[id].remind&&st.rem&&WHEN[st.rem.when],note=rem?L('تذكير:',rem,String(st.rem.what||'').trim()):'';
  return{title:clip(rem?L('تذكير:',rem,r.title):r.title),text:blocks([note,...r.text])};}

// ===== النص القابل للتعديل: يبقى تعديلك، وما يتبدل إلا بزر إعادة التوليد =====
const cur=()=>{const A=App();return A.S.o[A.S.occ];};
function fill(){const A=App(),st=cur(),g=compose(A.S.occ,st),p=st.pub||(st.pub={title:g.title,text:g.text,bt:g.title,bx:g.text});
  if(p.title===p.bt){p.title=p.bt=g.title;}if(p.text===p.bx){p.text=p.bx=g.text;}
  $('#pubTitle').value=p.title;$('#pubText').value=p.text;$('#pubOld').hidden=!(p.title!==p.bt&&p.bt!==g.title||p.text!==p.bx&&p.bx!==g.text);A.save();}
function regen(){const A=App(),st=cur(),g=compose(A.S.occ,st);st.pub={title:g.title,text:g.text,bt:g.title,bx:g.text};fill();A.toast('تم توليد النص من جديد');}
document.addEventListener('input',e=>{if(e.target.id!=='pubTitle'&&e.target.id!=='pubText')return;const p=cur().pub;p[e.target.id==='pubTitle'?'title':'text']=e.target.value;App().save();});

// ===== الصور جاهزة قبل الضغط: المشاركة في الجوال لازم تبدأ مباشرة بعد الضغطة =====
let job=null,stale=true,timer=0;
function prep(){const A=App();if(!A.ready||A.step!==4)return null;stale=false;job=A.renderAll();job.then(P=>{const b=P.jpg.reduce((s,f)=>s+f.size,0),mb=(b/1048576).toLocaleString('ar-SA',{maximumFractionDigits:1});$('#pubSize').textContent=P.jpg.length>1?`${P.jpg.length===2?'صورتان':ar(P.jpg.length)+' صور'}، حجمها ${mb} ميجا`:`حجم الصورة ${mb} ميجا`;},()=>{});return job;}
const files=()=>Promise.resolve(!stale&&job?job:prep()).catch(()=>null);
// أي رسم جديد في خطوة النشر (مقاس، صورة وصلت) يعيد التجهيز
function touch(){stale=true;clearTimeout(timer);timer=setTimeout(prep,250);}

// ===== الوجهات =====
const say=t=>{const e=$('#pubHint');e.textContent=t;e.hidden=!t;};
const mobile=()=>matchMedia('(pointer:coarse)').matches;
const enc=encodeURIComponent,MAXURL=6000;
const siteUrl=()=>{const s=String(App().S.foot.site||'alajlanandaleid.com').trim();return/^https?:/.test(s)?s:'https://'+s;};
const LINK={wa:t=>'https://wa.me/?text='+enc(t),tg:t=>`https://t.me/share/url?url=${enc(siteUrl())}&text=${enc(t)}`};
const NAME={wa:'واتساب',tg:'تيليجرام'};
async function copyText(t){try{await navigator.clipboard.writeText(t);return true;}catch(e){const a=$('#pubText'),v=a.value;a.value=t;a.select();let ok=false;try{ok=document.execCommand('copy');}catch(x){}a.value=v;return ok;}}
function saveAll(list){list.forEach((f,i)=>setTimeout(()=>{const u=URL.createObjectURL(f),l=document.createElement('a');l.href=u;l.download=f.name;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);},i*350));}
async function send(dest){say('');const P=await files();if(!P){App().toast('تعذر تجهيز الصورة');return;}const text=$('#pubText').value.trim();
  if(mobile()&&navigator.canShare&&navigator.canShare({files:P.jpg})){
    // بعض التطبيقات تتجاهل النص مع الصورة، فنخليه منسوخ احتياطاً
    if(navigator.clipboard)navigator.clipboard.writeText(text).catch(()=>{});
    try{await navigator.share({files:P.jpg,text});say(`إذا ما طلع النص مع الصورة في ${NAME[dest]}، الصقه في الرسالة، هو منسوخ.`);}
    catch(e){if(e.name==='NotAllowedError')say('الصورة صارت جاهزة، اضغط الزر مرة ثانية.');else if(e.name!=='AbortError')say('تعذرت المشاركة. حمّل الصورة وأرسلها بنفسك.');}
    return;}
  let copied=false;if(P.png.length===1&&window.ClipboardItem&&navigator.clipboard&&navigator.clipboard.write){try{await navigator.clipboard.write([new ClipboardItem({'image/png':P.png[0]})]);copied=true;}catch(e){}}
  if(!copied)saveAll(P.png);
  const long=LINK[dest](text).length>MAXURL,w=window.open(LINK[dest](long?'':text),'_blank');
  const img=copied?'الصورة منسوخة، الصقها في المحادثة بـ ⌘V أو Ctrl+V.':P.png.length>1?`نزّلت ${P.png.length===2?'صورتين':ar(P.png.length)+' صور'} على جهازك، أرفقها في المحادثة.`:'نزّلت الصورة على جهازك، أرفقها في المحادثة.';
  say([w?'':`المتصفح منع فتح ${NAME[dest]}، افتحه بنفسك.`,img,long?'النص طويل على الرابط، فاضغط «نسخ النص» والصقه بعد الصورة.':''].filter(Boolean).join(' '));}

// الخبر يوصل المحرر عن طريق تخزين المتصفح، والصورة أكبر من localStorage
const CARD={wedding:'دعوة',general:'دعوة',schedule:'دعوة'};
function putCard(c){return new Promise((res,rej)=>{const r=indexedDB.open('ajlan-card',1);r.onupgradeneeded=()=>r.result.createObjectStore('card');r.onerror=()=>rej(r.error);
  r.onsuccess=()=>{const t=r.result.transaction('card','readwrite');t.objectStore('card').put(c,'next');t.oncomplete=()=>{r.result.close();res();};t.onerror=t.onabort=()=>rej(t.error);};});}
async function toNews(){say('');const P=await files(),A=App();if(!P){A.toast('تعذر تجهيز الصورة');return;}const title=$('#pubTitle').value.trim();if(!title){say('اكتب عنوان الخبر أولاً.');$('#pubTitle').focus();return;}
  try{await putCard({title,text:$('#pubText').value.trim(),type:CARD[A.S.occ]||'خبر',files:P.jpg.map(f=>({name:f.name,blob:new Blob([f],{type:f.type})}))});}catch(e){say('مساحة هذا المتصفح لا تكفي لنقل الصورة. حمّلها وأضفها في المحرر بنفسك.');return;}
  if(!window.open('admin.html#card','_blank'))location.href='admin.html#card';}

// النشر المباشر: نفس بطاقة المحرر بعلامة auto، ولوحة التحكم تتحقق من الدخول وتحفظ بنفس المسار
const DONE='ajlan-card-pub';let sending=false;
const lastPub=()=>{try{return JSON.parse(localStorage.getItem(DONE)||'null');}catch(e){return null;}};
function ask(head,text,note,yes){$('#pubDlgH').textContent=head;$('#pubDlgT').textContent=text;$('#pubDlgN').textContent=note;$('#pubYes').textContent=yes;$('#pubEdit').hidden=yes==='افتح الخبر';$('#pubDlg').showModal();
  return new Promise(res=>{const d=$('#pubDlg'),end=v=>{d.onclose=null;d.close();res(v);};$('#pubYes').onclick=()=>end('yes');$('#pubEdit').onclick=()=>end('edit');$('#pubNo').onclick=()=>end('');d.onclose=()=>res('');});}
async function send1(){const A=App(),title=$('#pubTitle').value.trim();say('');if(!title){say('اكتب عنوان الخبر أولاً.');$('#pubTitle').focus();return;}
  await newsNote();if(mode==='down'){say('الخادم لا يجيب الآن، جرب بعد قليل.');return;}
  const P=await files();if(!P){A.toast('تعذر تجهيز الصورة');return;}
  const text=$('#pubText').value.trim(),st=cur(),sig=[A.S.occ,A.S.size,st.design,st.pal,st.lay,title,text,...st.photos.map(p=>[String(p.src).length,p.z,p.x,p.y,p.main])].join('|'),old=lastPub();
  if(old&&old.sig===sig){if(await ask('هذا الخبر محفوظ من قبل',title,old.demo?'حفظته في هذا المتصفح، وما يحتاج تكرار.':'نشرته من قبل، وما يحتاج تكرار.','افتح الخبر')==='yes')location.href=old.link;return;}
  const server=mode==='server',r=await ask('نشر كخبر في الموقع',title,server?'يظهر للناس مباشرة بعد تسجيل الدخول.':'نسخة العرض: يبقى الخبر في هذا المتصفح فقط، ولا يراه الناس حتى ينتقل الموقع إلى الدومين.',server?'نشر الآن':'حفظ في هذا المتصفح');
  if(r==='edit')return toNews();if(r!=='yes')return;
  try{await putCard({title,text,type:CARD[A.S.occ]||'خبر',auto:1,sig,files:P.jpg.map(f=>({name:f.name,blob:new Blob([f],{type:f.type})}))});}catch(e){say('مساحة هذا المتصفح لا تكفي لنقل الصورة. حمّلها وأضفها في المحرر بنفسك.');return;}
  location.href='admin.html#card';}
async function direct(){if(sending)return;sending=true;$('#next').disabled=true;const free=()=>{sending=false;$('#next').disabled=false;};
  let ran=false;App().guard(async()=>{ran=true;try{await send1();}finally{free();}},true);if(!ran)free();}
addEventListener('pageshow',()=>{sending=false;$('#next').disabled=false;});

// نفس فحص لوحة التحكم: بدون خادم يبقى الخبر في هذا المتصفح، ونقولها بوضوح
let mode=null;
async function newsNote(){if(!mode){mode='demo';try{const r=await fetch('api/ping.php',{cache:'no-store'}),j=await r.json().catch(()=>null);if(r.status>=500)mode='down';else if(r.ok&&j&&j.app==='ajlan-portal')mode='server';}catch(e){}}
  $('#pubNews').textContent=mode==='server'?'زر «نشر كخبر في الموقع» ينشره مباشرة بعد تسجيل الدخول، و«تعديل قبل النشر» يفتح المحرر معبأ.':mode==='down'?'الخادم لا يجيب الآن، جرب بعد قليل.':'نسخة العرض: الخبر يبقى في هذا المتصفح ولا يصل للناس حتى ينتقل الموقع إلى الدومين.';}

document.addEventListener('click',async e=>{const b=e.target.closest('[data-pub]');if(!b)return;const a=b.dataset.pub,A=App();
  if(a==='copy'){A.toast(await copyText($('#pubText').value)?'تم نسخ النص':'تعذر النسخ، حدد النص وانسخه');return;}
  if(a==='regen'){regen();return;}
  if(a==='story'){A.setSize('story');return;}
  A.guard(()=>a==='news'?toNews():send(a));});

function syncTip(){const A=App();$('#pubStory').hidden=A.S.size==='story';}
window.OCC_PUB={compose,direct,enter(){fill();syncTip();say('');newsNote();stale=true;prep();},prep,touch(){if(App().step===4){syncTip();touch();}}};
})();
