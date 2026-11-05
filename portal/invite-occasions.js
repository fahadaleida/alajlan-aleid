/* المناسبات: الحقول والصيغ لكل مناسبة. الحقل المعلّم g له صيغتان (مذكر/مؤنث)، والمعلّم req يطلع كنص بديل «...» إذا فضي. */
(function(){
'use strict';
const gd=(m,f)=>s=>s==='f'?f:m;
const VERSE_ISTIRJA='إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ';
const VERSE_NAFS='يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ ارْجِعِي إِلَى رَبِّكِ رَاضِيَةً مَرْضِيَّةً';
const join=(...a)=>a.filter(Boolean).join(' · ');
// الرقم يبقى من اليسار لليمين وما ينكسر داخل نص عربي
const tel=t=>t.startsWith('«')?t:'\u2066'+t.replace(/ /g,'\u00A0')+'\u2069';
const OCC={
wedding:{name:'دعوة زواج',desc:'دعوة أنيقة للفرح',maxPhotos:()=>3,caps:1,pals:['navy','ivory','emerald','night','ruby'],
  fields:[
    {k:'host1',label:'الداعي الأول',def:'عبدالله بن إبراهيم السعد العجلان'},
    {k:'host2',label:'الداعي الثاني (اختياري)',def:'عبدالله بن عبدالعزيز الشايع'},
    {k:'groom',label:'اسم العريس',def:'عبدالعزيز بن عبدالله العجلان',ph:'اسم العريس',req:1},
    {k:'bride',label:'والد العروس',def:'عبدالله بن عبدالعزيز الشايع',ph:'والد العروس',req:1},
    {k:'day',label:'اليوم',def:'الثلاثاء',half:1},{k:'time',label:'الوقت',def:'مساءً',half:1},
    {k:'hijri',label:'التاريخ الهجري',def:'٢٣ / ٥ / ١٤٤٨هـ',half:1},{k:'greg',label:'التاريخ الميلادي',def:'٣ / ١١ / ٢٠٢٦م',half:1},
    {k:'venue',label:'المكان',def:'قاعة سراج'},
    {k:'map',label:'رابط الموقع على الخريطة (يطلع باركود)',def:'',ltr:1,hint:'https://maps.app.goo.gl/...',grp:'word'},
    {k:'badge',label:'عنوان الدعوة',def:'دعوة زواج',grp:'word'},
    {k:'remind',label:'سطر التذكير (اختياري)',def:'تذكير · غداً بإذن الله',grp:'word'},
    {k:'lead',label:'قبل الداعين',def:'يتشرف أبناء',grp:'word'},
    {k:'body',label:'نص الدعوة',def:'بدعوتكم لحضور حفل الزواج وتناول طعام العشاء بمناسبة زواج',type:'area',grp:'word'},
    {k:'groomPre',label:'قبل اسم العريس',def:'الأخ',grp:'word',half:1},{k:'bridePre',label:'قبل اسم والد العروس',def:'على كريمة',grp:'word',half:1},
    {k:'close',label:'الختام',def:'والدعوة عامة لجميع أفراد الأسرة',grp:'word'}],
  photos:[{src:'img/invite/p1.jpg',role:'والد العريس',name:'عبدالله بن إبراهيم العجلان',note:'رحمه الله',z:1,x:0,y:0},
          {src:'img/invite/p3.jpg',role:'العريس',name:'عبدالعزيز بن عبدالله العجلان',note:'',z:1,x:0,y:0},
          {src:'img/invite/p2.jpg',role:'والد العروس',name:'عبدالله بن عبدالعزيز الشايع',note:'',z:1,x:0,y:0}],
  doc(v){return{head:{k:'bism'},kick:v.badge,remind:v.remind,
    seq:[{r:'lead',t:v.lead},{r:'host',t:v.host1},{r:'host',t:v.host2?(v.host1?'و':'')+v.host2:''},{r:'body',t:v.body},{r:'pre',t:v.groomPre},{r:'hero',t:v.groom},{r:'orn'},{r:'pair',a:v.bridePre,b:v.bride}],
    facts:[[v.time?'اليوم · '+v.time:'اليوم',v.day],['التاريخ',v.hijri],['الموافق',v.greg],['المكان',v.venue,1]].filter(c=>c[1]),qr:v.map,close:v.close};}},

condolence:{name:'حالة وفاة',sub:'تعزية',desc:'نعي وتعزية بوقار',gender:1,genderLabels:['الفقيد','الفقيدة'],genderTitle:'النعي لمن؟',pals:['charcoal','pine','slate','bronze'],
  maxPhotos:(st,v)=>st.gender==='f'||!v.withPhoto?0:1,photoToggle:'withPhoto',noPhotoFemale:1,
  fields:[
    {k:'name',label:gd('اسم المتوفى','اسم المتوفاة'),ph:gd('اسم الفقيد','اسم الفقيدة'),req:1,g:0},
    {k:'showPray',type:'toggle',label:'الصلاة',def:true},
    {k:'mosque',label:'الجامع',ph:'اسم الجامع',req:1,sec:'showPray',half:1},{k:'prayTime',label:'وقت الصلاة',ph:'وقت الصلاة',hint:'مثل: بعد صلاة العصر يوم ...',req:1,sec:'showPray',half:1},
    {k:'showBurial',type:'toggle',label:'الدفن',def:true},
    {k:'cemetery',label:'المقبرة',ph:'اسم المقبرة',req:1,sec:'showBurial'},
    {k:'showAza',type:'toggle',label:'العزاء',def:true},
    {k:'azaPlace',label:'مكان العزاء',ph:'مكان العزاء',req:1,sec:'showAza',half:1},{k:'azaDays',label:'أيام العزاء',ph:'أيام العزاء',req:1,sec:'showAza',half:1},
    {k:'showTel',type:'toggle',label:'أرقام التواصل',def:true},
    {k:'menTel',label:'رقم الرجال',ph:'رقم الجوال',req:1,sec:'showTel',half:1,tel:1},{k:'womenTel',label:'رقم النساء',ph:'رقم الجوال',req:1,sec:'showTel',half:1,tel:1},
    {k:'withPhoto',type:'toggle',label:'إضافة صورة',def:false,grp:'photo'},
    {k:'ayah',type:'toggle',label:'إضافة الآية الكريمة «يا أيتها النفس المطمئنة»',def:false,grp:'word'},
    {k:'lead',label:'السطر الأول',def:'بقلوب مؤمنة بقضاء الله وقدره',grp:'word'},
    {k:'lead2',label:'السطر الثاني',def:gd('تنعى أسرة العجلان والعيد فقيدها','تنعى أسرة العجلان والعيد فقيدتها'),g:1,grp:'word'},
    {k:'rah',label:'بعد الاسم',def:gd('رحمه الله','رحمها الله'),g:1,grp:'word'},
    {k:'close',label:'الدعاء في الختام',def:gd('اللهم اغفر له وارحمه وعافه واعف عنه','اللهم اغفر لها وارحمها وعافها واعف عنها'),g:1,grp:'word'}],
  photos:[],
  doc(v,st){const f=st.gender==='f',facts=[];
    if(v.showPray)facts.push([f?'الصلاة عليها':'الصلاة عليه',join(v.mosque,v.prayTime)]);
    if(v.showBurial)facts.push(['الدفن',v.cemetery]);
    if(v.showAza)facts.push(['العزاء',join(v.azaPlace,v.azaDays)]);
    if(v.showTel)facts.push(['للتواصل',join(v.menTel&&'الرجال '+tel(v.menTel),v.womenTel&&'النساء '+tel(v.womenTel))]);
    return{head:{k:'verse',t:VERSE_ISTIRJA},seq:[{r:'lead',t:v.lead},{r:'lead',t:v.lead2},{r:'hero',t:v.name},{r:'sub',t:v.rah}],facts,verse2:v.ayah?VERSE_NAFS:'',close:v.close};}},

graduate:{name:'تبريكات خريج',desc:'تهنئة تليق بالإنجاز',gender:1,genderLabels:['خريج','خريجة'],genderTitle:'التهنئة لمن؟',maxPhotos:()=>3,pals:['navy','emerald','night','ruby','ivory'],
  fields:[
    {k:'name',label:gd('اسم الخريج','اسم الخريجة'),ph:gd('اسم الخريج','اسم الخريجة'),req:1},
    {k:'degree',label:'الدرجة',ph:'الدرجة العلمية',hint:'مثل: البكالوريوس',req:1,half:1},{k:'major',label:'التخصص',ph:'التخصص',req:1,half:1},
    {k:'university',label:'الجامعة',ph:'اسم الجامعة',req:1},
    {k:'from',label:'المهنئون',ph:'أسماء المهنئين',req:1},
    {k:'title',label:'العنوان',def:'ألف مبروك التخرج',grp:'word'},
    {k:'lead',label:'السطر الأول',def:gd('تهنئة من القلب للابن الخريج','تهنئة من القلب للابنة الخريجة'),g:1,grp:'word'},
    {k:'line',label:'قبل الدرجة',def:gd('بمناسبة حصوله على','بمناسبة حصولها على'),g:1,grp:'word'},
    {k:'close',label:'الدعاء في الختام',def:gd('وفقه الله وسدد خطاه','وفقها الله وسدد خطاها'),g:1,grp:'word'}],
  photos:[],
  doc(v){return{kick:v.title,seq:[{r:'lead',t:v.lead},{r:'hero',t:v.name},{r:'pre',t:v.line}],facts:[['الدرجة',v.degree,1],['التخصص',v.major],['الجامعة',v.university]],close:v.close,sign:v.from?'المهنئون: '+v.from:''};}},

baby:{name:'تبريكات مولود',desc:'بشرى هادئة وناعمة',gender:1,genderLabels:['مولود','مولودة'],genderTitle:'نوع المولود',maxPhotos:()=>3,pals:['sand','sky','rose','sage'],genderPal:{m:'sky',f:'rose'},
  fields:[
    {k:'name',label:gd('اسم المولود','اسم المولودة'),ph:gd('اسم المولود','اسم المولودة'),req:1},
    {k:'parents',label:'الوالدان',ph:'اسم الوالدين',req:1},
    {k:'showDate',type:'toggle',label:'تاريخ الميلاد',def:true},
    {k:'date',label:'التاريخ',ph:'تاريخ الميلاد',req:1,sec:'showDate'},
    {k:'title',label:'العنوان',def:gd('مولود مبارك','مولودة مباركة'),g:1,grp:'word'},
    {k:'lead',label:'السطر الأول',def:gd('نهنئكم بقدوم المولود','نهنئكم بقدوم المولودة'),g:1,grp:'word'},
    {k:'pre',label:'قبل اسم الوالدين',def:gd('لوالديه الكريمين','لوالديها الكريمين'),g:1,grp:'word'},
    {k:'dua',label:'الدعاء',def:gd('بارك الله لكم في الموهوب، وشكرتم الواهب، وبلغ أشده، ورزقتم بره','بارك الله لكم في الموهوبة، وشكرتم الواهب، وبلغت أشدها، ورزقتم برها'),g:1,type:'area',grp:'word'}],
  photos:[],
  doc(v){return{kick:v.title,seq:[{r:'lead',t:v.lead},{r:'hero',t:v.name},{r:'pre',t:v.pre},{r:'hero2',t:v.parents}],facts:v.showDate?[['تاريخ الميلاد',v.date]]:[],dua:v.dua};}},

general:{name:'مناسبة عامة',desc:'أي مناسبة عائلية',maxPhotos:()=>3,pals:['navy','ivory','emerald','night','ruby'],
  fields:[
    {k:'title',label:'عنوان المناسبة',ph:'عنوان المناسبة',req:1},
    {k:'text',label:'نص المناسبة',ph:'اكتب نص المناسبة هنا',type:'area',req:1},
    {k:'showWhen',type:'toggle',label:'الموعد والمكان',def:true},
    {k:'date',label:'التاريخ',ph:'التاريخ',req:1,sec:'showWhen',half:1},{k:'place',label:'المكان',ph:'المكان',req:1,sec:'showWhen',half:1},
    {k:'map',label:'رابط الموقع على الخريطة (يطلع باركود)',def:'',ltr:1,hint:'https://maps.app.goo.gl/...',grp:'word'},
    {k:'badge',label:'العنوان الصغير',def:'مناسبة عائلية',grp:'word'},
    {k:'lead',label:'السطر الأول',def:'تتشرف أسرة العجلان والعيد بدعوتكم لحضور',grp:'word'},
    {k:'close',label:'الختام (اختياري)',def:'',grp:'word'}],
  photos:[],
  doc(v){return{head:{k:'bism'},kick:v.badge,seq:[{r:'lead',t:v.lead},{r:'hero',t:v.title},{r:'orn'},{r:'body',t:v.text}],facts:v.showWhen?[['التاريخ',v.date],['المكان',v.place,1]]:[],qr:v.map,close:v.close};}},

news:{name:'خبر',desc:'بطاقة خبر عائلي',maxPhotos:()=>3,pals:['navy','ivory','emerald','night','ruby'],
  fields:[
    {k:'title',label:'عنوان الخبر',ph:'عنوان الخبر',req:1},
    {k:'text',label:'نص الخبر',ph:'اكتب نص الخبر هنا',type:'area',req:1},
    {k:'date',label:'التاريخ (اختياري)',def:''},
    {k:'badge',label:'اسم الزاوية',def:'أخبار الأسرة',grp:'word'}],
  photos:[],
  doc(v){return{kick:v.badge,title:v.title,text:v.text,date:v.date,seq:[{r:'hero',t:v.title},{r:'body',t:v.text}],facts:[]};}}
};
const ORDER=['wedding','condolence','graduate','baby','general','news'];

const dv=(f,s)=>typeof f.def==='function'?f.def(s):f.def;
const phOf=(f,s)=>typeof f.ph==='function'?f.ph(s):f.ph;
const labelOf=(f,s)=>typeof f.label==='function'?f.label(s):f.label;
const fkey=(f,s)=>f.g?f.k+'@'+s:f.k;
// القيمة كما تظهر في حقل الكتابة
function raw(id,st,f){const k=fkey(f,st.gender);return st.f&&st.f[k]!==undefined?st.f[k]:(dv(f,st.gender)??'');}
// القيم كما تُرسم: الفاضي المطلوب يطلع بين «»
function vals(id,st,foot){const v={};for(const f of OCC[id].fields){const r=raw(id,st,f);if(f.type==='toggle'){v[f.k]=!!r;continue;}const t=String(r).trim();v[f.k]=t||(f.req?`«${phOf(f,st.gender)}»`:'');}
  for(const f of OCC[id].fields)if(f.sec&&!v[f.sec])v[f.k]='';if(foot)Object.assign(v,foot);return v;}
// الحقول المطلوبة الفاضية (تحذير قبل التحميل)
function missing(id,st){const v={};OCC[id].fields.forEach(f=>{if(f.type==='toggle')v[f.k]=!!raw(id,st,f);});return OCC[id].fields.filter(f=>f.req&&(!f.sec||v[f.sec])&&!String(raw(id,st,f)).trim());}
function blank(id){return{design:null,pal:null,gender:'m',f:{},photos:structuredClone(OCC[id].photos)};}
window.OCC_DATA={OCC,ORDER,raw,vals,missing,blank,fkey,phOf,labelOf,VERSE_ISTIRJA,VERSE_NAFS};
})();
