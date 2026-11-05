/* المناسبات: الحقول والصيغ لكل مناسبة. الحقل المعلّم g له صيغتان (مذكر/مؤنث)، والمعلّم req يطلع كنص بديل «...» إذا فضي. */
(function(){
'use strict';
const gd=(m,f)=>s=>s==='f'?f:m;
const VERSE_ISTIRJA='إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ';
const VERSE_NAFS='يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ ارْجِعِي إِلَى رَبِّكِ رَاضِيَةً مَرْضِيَّةً';
const join=(...a)=>a.filter(Boolean).join(' · ');
// صيغة حسب النوع والعدد: مفرد، مثنى (٢)، جمع (٣)
const gp=(m,f,m2,f2,m3,f3)=>s=>({m,f,m2,f2,m3,f3})[s]??m;
const run=(t,hi)=>t?{t,hi:hi?1:0}:null;
const runs=(...a)=>a.filter(Boolean);
const names=(a,hi=1)=>a.filter(Boolean).map((t,i)=>run((i?'و':'')+t,hi));
// كل اسم في سطره إذا كثرت الأسماء
const nameLines=a=>a.filter(Boolean).map((t,i)=>[run((i?'و':'')+t,1)]);
const NAMES={k:'more',type:'list',label:'أسماء إضافية',add:'＋ إضافة اسم',item:[{k:'t',ph:'الاسم'}],rah:1};
// الرقم يبقى من اليسار لليمين وما ينكسر داخل نص عربي
const tel=t=>t.startsWith('«')?t:'\u2066'+t.replace(/ /g,'\u00A0')+'\u2069';
const OCC={
wedding:{name:'دعوة زواج',desc:'دعوة أنيقة للفرح',maxPhotos:()=>3,proPhotos:9,caps:1,remind:'الزواج',roles:['العريس','والد العريس','والد العروس'],pals:['navy','petrol','ivory','emerald','night','ruby'],
  fields:[
    {k:'host1',label:'الداعي الأول',def:'عبدالله بن إبراهيم السعد العجلان',rah:1},
    {k:'host2',label:'الداعي الثاني (اختياري)',def:'عبدالله بن عبدالعزيز الشايع',rah:1},
    {k:'hosts',type:'list',label:'داعون آخرون',add:'＋ إضافة اسم',item:[{k:'t',ph:'اسم الداعي'}],rah:1},
    {k:'groom',label:'اسم العريس',def:'عبدالعزيز بن عبدالله العجلان',ph:'اسم العريس',req:1},
    {k:'bride',label:'والد العروس',def:'عبدالله بن عبدالعزيز الشايع',ph:'والد العروس',req:1,rah:1},
    {k:'couples',type:'list',label:'عرسان آخرون في نفس الحفل',add:'＋ إضافة عريس',item:[{k:'groom',ph:'اسم العريس'},{k:'bride',ph:'والد العروس'}]},
    {k:'day',label:'اليوم',def:'الثلاثاء',half:1},{k:'time',label:'الوقت',def:'مساءً',half:1},
    {k:'hijri',label:'التاريخ الهجري',def:'٢٣ / ٥ / ١٤٤٨هـ',half:1},{k:'greg',label:'التاريخ الميلادي',def:'٣ / ١١ / ٢٠٢٦م',half:1},
    {k:'venue',label:'المكان',def:'قاعة سراج'},
    {k:'map',label:'رابط الموقع على الخريطة (يطلع باركود)',def:'',ltr:1,hint:'https://maps.app.goo.gl/...',grp:'word'},
    {k:'badge',label:'عنوان الدعوة',def:'دعوة زواج',grp:'word'},
    {k:'lead',label:'قبل الداعين',def:'يتشرف أبناء',grp:'word'},
    {k:'body',label:'نص الدعوة',def:'بدعوتكم لحضور حفل الزواج وتناول طعام العشاء بمناسبة زواج',type:'area',grp:'word'},
    {k:'groomPre',label:'قبل اسم العريس',def:'الأخ',grp:'word',half:1},{k:'bridePre',label:'قبل اسم والد العروس',def:'على كريمة',grp:'word',half:1},
    {k:'close',label:'الختام',def:'والدعوة عامة لجميع أفراد الأسرة',grp:'word'}],
  photos:[{src:'img/invite/p1.jpg',role:'والد العريس',name:'عبدالله بن إبراهيم العجلان',note:'رحمه الله',z:1,x:0,y:0},
          {src:'img/invite/p3.jpg',role:'العريس',name:'عبدالعزيز بن عبدالله العجلان',note:'',z:1,x:0,y:0},
          {src:'img/invite/p2.jpg',role:'والد العروس',name:'عبدالله بن عبدالعزيز الشايع',note:'',z:1,x:0,y:0}],
  doc(v){const H=[v.host1,v.host2,...v.hosts.map(x=>x.t)].filter(Boolean),C=v.couples.filter(x=>x.groom),seq=[{r:'lead',t:v.lead}];
    H.forEach((t,i)=>seq.push({r:'host',t:(i?'و':'')+t}));seq.push({r:'body',t:v.body},{r:'pre',t:v.groomPre},{r:'hero',t:v.groom},{r:'orn'},{r:'pair',a:v.bridePre,b:v.bride});
    C.forEach(x=>seq.push({r:'hero',t:'و'+x.groom},{r:'pair',a:v.bridePre,b:x.bride}));
    return{head:{k:'bism'},kick:v.badge,seq,
    facts:[[v.time?'اليوم · '+v.time:'اليوم',v.day],['التاريخ',v.hijri],['الموافق',v.greg],['المكان',v.venue,1]].filter(c=>c[1]),qr:v.map,close:v.close,
    pro:{head:1,paras:[...(H.length>2?[runs(run(v.lead)),...nameLines(H),runs(run(v.body))]:[runs(run(v.lead),...names(H),run(v.body))]),runs(run(v.groomPre),run(v.groom,1)),runs(run(v.bridePre),run(v.bride,1)),...C.flatMap(x=>[runs(run('و'+x.groom,1)),runs(run(v.bridePre),run(x.bride,1))]),
      runs(run('وذلك بمشيئة الله تعالى'),run(v.time),run(v.day&&'يوم '+v.day),run(v.hijri),run(v.greg&&'الموافق '+v.greg),run(v.venue&&'في'),run(v.venue,1))],close:v.close,qr:v.map}};}},

qiran:{name:'تهنئة عقد قران',desc:'صور العائلتين وتهنئة بالقران',plural:'more',maxPhotos:()=>9,proPhotos:9,caps:1,roles:['العريس','والد العريس','والد العروس'],pals:['olive','emerald','petrol','navy','ruby'],
  fields:[
    {k:'name',label:'اسم العريس',ph:'اسم العريس',req:1},{...NAMES,label:'عرسان آخرون',rah:0},
    {k:'bride',label:'والد العروس',ph:'والد العروس',req:1,rah:1},
    {k:'spouse',label:'اسم القريب بعد الاسم (اختياري)',hint:'مثل زوج ابنة العم: اكتب اسمها هنا',def:''},
    {k:'congr',label:'بداية التهنئة',def:gp('تهانينا لابن العم/','تهانينا لابن العم/','تهانينا لابني العم/','تهانينا لابني العم/','تهانينا لأبناء العم/','تهانينا لأبناء العم/'),g:1,grp:'word'},
    {k:'line',label:'سبب التهنئة',def:gp('بمناسبة عقد قرانه','بمناسبة عقد قرانه','بمناسبة عقد قرانهما','بمناسبة عقد قرانهما','بمناسبة عقد قرانهم','بمناسبة عقد قرانهم'),g:1,grp:'word'},
    {k:'bridePre',label:'قبل والد العروس',def:'على كريمة/',grp:'word',half:1},{k:'spousePre',label:'قبل اسم القريب',def:'زوج ابنة العم/',grp:'word',half:1},
    {k:'text',label:'وصف المناسبة',def:'وسط حضور لفيف من الأهل والأقارب الذين قدموا التهاني والتبريكات بهذه المناسبة السعيدة.',type:'area',grp:'word'},
    {k:'dua',label:'الدعاء',def:gp('بارك الله لهما، وبارك عليهما، وجمع بينهما في خير.','بارك الله لهما، وبارك عليهما، وجمع بينهما في خير.','بارك الله لهم، وبارك عليهم، وجمع بينهم في خير.','بارك الله لهم، وبارك عليهم، وجمع بينهم في خير.','بارك الله لهم، وبارك عليهم، وجمع بينهم في خير.','بارك الله لهم، وبارك عليهم، وجمع بينهم في خير.'),g:1,type:'area',grp:'word'}],
  photos:[],
  doc(v){const N=[v.name,...v.more.map(x=>x.t)];return{head:{k:'bism'},seq:[],facts:[],
    pro:{head:1,paras:[runs(run(v.congr),run(N[0],1)),...nameLines(N).slice(1),runs(run(v.line)),runs(run(v.bridePre),run(v.bride,1)),v.spouse?runs(run(v.spousePre),run(v.spouse,1)):[],runs(run(v.text),run(v.dua))]}};}},

promo:{name:'تهنئة ترقية وإنجاز',desc:'ترقية أو منصب أو إنجاز',gender:1,plural:'more',genderLabels:['للرجال','للنساء'],genderTitle:'التهنئة لمن؟',maxPhotos:()=>9,proPhotos:9,caps:1,pals:['ocean','navy','emerald','night','ruby'],
  fields:[
    {k:'titleP',label:'اللقب (اختياري)',hint:'مثل: الدكتور',def:'',half:1},
    {k:'name',label:'الاسم',ph:'الاسم',req:1},NAMES,
    {k:'authority',label:'جهة الموافقة',ph:'جهة الموافقة',hint:'مثل: المجلس العلمي بالجامعة',req:1},
    {k:'rank',label:'الرتبة أو المنصب',ph:'الرتبة أو المنصب',req:1},
    {k:'spec',label:'التخصص (اختياري)',def:''},
    {k:'extra',label:'نبذة إضافية (اختياري)',def:'',type:'area'},
    {k:'congr',label:'التهنئة',def:'تهانينا وألف مبروك',},
    {k:'intro',label:'بداية الخبر',def:'بفضل الله وتوفيقه، صدرت موافقة',grp:'word'},
    {k:'pre',label:'قبل الاسم',def:gp('على ترقية ابن العم','على ترقية ابنة العم','على ترقية ابني العم','على ترقية ابنتي العم','على ترقية أبناء العم','على ترقية بنات العم'),g:1,grp:'word'},
    {k:'toPre',label:'قبل الرتبة',def:'إلى',grp:'word',half:1},{k:'specPre',label:'قبل التخصص',def:'في تخصص',grp:'word',half:1},
    {k:'dua',label:'الدعاء',def:gp('سائلين الله له التوفيق والسداد في خدمة الدين ثم المليك والوطن','سائلين الله لها التوفيق والسداد في خدمة الدين ثم المليك والوطن','سائلين الله لهما التوفيق والسداد في خدمة الدين ثم المليك والوطن','سائلين الله لهما التوفيق والسداد في خدمة الدين ثم المليك والوطن','سائلين الله لهم التوفيق والسداد في خدمة الدين ثم المليك والوطن','سائلين الله لهن التوفيق والسداد في خدمة الدين ثم المليك والوطن'),g:1,type:'area',grp:'word'}],
  photos:[],
  doc(v){const N=[v.name,...v.more.map(x=>x.t)];return{head:{k:'bism'},seq:[],facts:[],
    pro:{head:1,paras:[runs(run(v.intro),run(v.authority)),runs(run(v.pre),run(v.titleP)),...nameLines(N),runs(run(v.toPre),run(v.rank),run(v.spec&&v.specPre),run(v.spec)),v.extra?runs(run(v.extra)):[],runs(run(v.congr)),runs(run(v.dua))]}};}},

condolence:{name:'حالة وفاة',sub:'تعزية',desc:'نعي وتعزية بوقار',gender:1,genderLabels:['الفقيد','الفقيدة'],genderTitle:'النعي لمن؟',pals:['charcoal','pine','slate','bronze'],
  maxPhotos:(st,v)=>st.gender==='f'||!v.withPhoto?0:1,photoToggle:'withPhoto',noPhotoFemale:1,
  fields:[
    {k:'titleP',label:'الصفة (اختياري)',hint:'مثل: العم',def:'',half:1},{k:'kunya',label:'الكنية (اختياري)',hint:'مثل: أبو عبدالله',def:'',half:1},
    {k:'name',label:gd('اسم المتوفى','اسم المتوفاة'),ph:gd('اسم الفقيد','اسم الفقيدة'),req:1,g:0},
    {k:'showPray',type:'toggle',label:'الصلاة',def:true},
    {k:'mosque',label:'الجامع',ph:'اسم الجامع',req:1,sec:'showPray',half:1},{k:'prayTime',label:'وقت الصلاة',ph:'وقت الصلاة',hint:'مثل: بعد صلاة العصر يوم ...',req:1,sec:'showPray',half:1},
    {k:'showBurial',type:'toggle',label:'الدفن',def:true},
    {k:'cemetery',label:'المقبرة',ph:'اسم المقبرة',req:1,sec:'showBurial'},
    {k:'showAza',type:'toggle',label:'العزاء',def:true},
    {k:'azaPlace',label:'مكان عزاء الرجال',ph:'مكان العزاء',req:1,sec:'showAza',half:1},{k:'azaDays',label:'أيام العزاء',ph:'أيام العزاء',req:1,sec:'showAza',half:1},
    {k:'azaWomen',label:'عزاء النساء (اختياري)',hint:'مثل: في المسجد فقط',def:'',sec:'showAza'},
    {k:'map',label:'رابط الموقع على الخريطة (يطلع باركود)',def:'',ltr:1,hint:'https://maps.app.goo.gl/...'},
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
    if(v.showAza)facts.push(['العزاء',join(v.azaPlace,v.azaDays,v.azaWomen&&'النساء '+v.azaWomen)]);
    if(v.showTel)facts.push(['للتواصل',join(v.menTel&&'الرجال '+tel(v.menTel),v.womenTel&&'النساء '+tel(v.womenTel))]);
    const who=runs(run(v.titleP&&v.titleP+'/',1),run(v.name,1),run(v.kunya&&'«'+v.kunya+'»',1)),pray=v.showPray?runs(run(f?'وسوف تقام الصلاة عليها':'وسوف تقام الصلاة عليه'),run(v.prayTime),run('في'),run(v.mosque)):[],bury=v.showBurial?runs(run(pray.length?'،':''),run(f?'وستوارى الثرى في':'وسيوارى الثرى في'),run(v.cemetery),run('.')):pray.length?[run('.')]:[];
    const note=v.showAza?runs(run(f?'سيكون العزاء في الفقيدة':'سيكون العزاء في الفقيد'),run('للرجال'),run(v.azaPlace),run(v.azaDays),run(v.azaWomen&&'، أما النساء'),run(v.azaWomen)):[];if(v.showTel)note.push(...runs(run('للتواصل:'),run(v.menTel&&'الرجال '+tel(v.menTel)),run(v.womenTel&&'النساء '+tel(v.womenTel))));
    return{head:{k:'verse',t:VERSE_ISTIRJA},seq:[{r:'lead',t:v.lead},{r:'lead',t:v.lead2},{r:'hero',t:v.name},{r:'sub',t:v.rah}],facts,verse2:v.ayah?VERSE_NAFS:'',close:v.close,qr:v.map,
    pro:{head:1,verse:VERSE_ISTIRJA,capt:[v.titleP&&v.titleP+'/',v.name,v.rah&&'- '+v.rah+' -'].filter(Boolean).join(' '),paras:[runs(run(v.lead),run(v.lead2)),who,[...pray,...bury]],note,noteL:'تنويه:',verse2:v.ayah?VERSE_NAFS:'',close:v.close,qr:v.map}};}},

graduate:{name:'تبريكات خريج',desc:'تهنئة تليق بالإنجاز',gender:1,plural:'more',genderLabels:['خريج','خريجة'],genderTitle:'التهنئة لمن؟',maxPhotos:()=>3,proPhotos:9,pals:['navy','emerald','night','ruby','ivory'],
  fields:[
    {k:'name',label:gd('اسم الخريج','اسم الخريجة'),ph:gd('اسم الخريج','اسم الخريجة'),req:1},{...NAMES,rah:0},
    {k:'degree',label:'الدرجة',ph:'الدرجة العلمية',hint:'مثل: البكالوريوس',req:1,half:1},{k:'major',label:'التخصص',ph:'التخصص',req:1,half:1},
    {k:'university',label:'الجامعة',ph:'اسم الجامعة',req:1},
    {k:'from',label:'المهنئون',ph:'أسماء المهنئين',req:1},
    {k:'title',label:'العنوان',def:'ألف مبروك التخرج',grp:'word'},
    {k:'lead',label:'السطر الأول',def:gp('تهنئة من القلب للابن الخريج','تهنئة من القلب للابنة الخريجة','تهنئة من القلب للابنين الخريجين','تهنئة من القلب للابنتين الخريجتين','تهنئة من القلب للأبناء الخريجين','تهنئة من القلب للبنات الخريجات'),g:1,grp:'word'},
    {k:'line',label:'قبل الدرجة',def:gp('بمناسبة حصوله على','بمناسبة حصولها على','بمناسبة حصولهما على','بمناسبة حصولهما على','بمناسبة حصولهم على','بمناسبة حصولهن على'),g:1,grp:'word'},
    {k:'close',label:'الدعاء في الختام',def:gp('وفقه الله وسدد خطاه','وفقها الله وسدد خطاها','وفقهما الله وسدد خطاهما','وفقهما الله وسدد خطاهما','وفقهم الله وسدد خطاهم','وفقهن الله وسدد خطاهن'),g:1,grp:'word'}],
  photos:[],
  doc(v){const N=[v.name,...v.more.map(x=>x.t)];return{kick:v.title,seq:[{r:'lead',t:v.lead},{r:'hero',t:N.join(' و')},{r:'pre',t:v.line}],facts:[['الدرجة',v.degree,1],['التخصص',v.major],['الجامعة',v.university]],close:v.close,sign:v.from?'المهنئون: '+v.from:'',
    pro:{head:1,kick:v.title,paras:[runs(run(v.lead)),...nameLines(N),runs(run(v.line),run(v.degree,1),run('في تخصص'),run(v.major,1),run('من'),run(v.university,1))],close:v.close,sign:v.from?'المهنئون: '+v.from:''}};}},

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

general:{name:'مناسبة عامة',desc:'أي مناسبة عائلية',maxPhotos:()=>3,proPhotos:9,remind:'المناسبة',pals:['navy','ivory','emerald','night','ruby'],
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
  doc(v){return{head:{k:'bism'},kick:v.badge,seq:[{r:'lead',t:v.lead},{r:'hero',t:v.title},{r:'orn'},{r:'body',t:v.text}],facts:v.showWhen?[['التاريخ',v.date],['المكان',v.place,1]]:[],qr:v.map,close:v.close,
    pro:{head:1,paras:[runs(run(v.lead)),runs(run(v.title,1)),runs(run(v.text)),v.showWhen?runs(run(v.date),run('في'),run(v.place,1)):[]],close:v.close,qr:v.map}};}},

schedule:{name:'جدول المناسبات',desc:'مواعيد مناسبات الأسرة',maxPhotos:()=>0,noPhotos:1,pals:['ivory','navy','emerald','night'],
  fields:[
    {k:'title',label:'العنوان',def:'عائلة العجلان والعيد'},
    {k:'sub',label:'العنوان الفرعي',def:'جدول مواعيد مناسبات واحتفالات الأسرة'},
    {k:'rows',type:'list',card:1,label:'المناسبات',add:'＋ إضافة مناسبة',item:[{k:'host',label:'اسم الداعي',ph:'اسم الداعي'},{k:'type',label:'نوع المناسبة',ph:'زواج',half:1},{k:'time',label:'الوقت',ph:'مساءً',half:1},{k:'hijri',label:'التاريخ الهجري',ph:'١٤٤٨/٠٥/٠٣هـ',half:1},{k:'greg',label:'التاريخ الميلادي',ph:'٢٠٢٦/١٠/١٤م',half:1},{k:'place',label:'المكان',ph:'المكان'},{k:'map',label:'رابط الموقع (يطلع باركود)',ph:'https://maps.app.goo.gl/...',ltr:1}],
      fresh:{type:'زواج',time:'مساءً'},def:[
      ['محمد بن إبراهيم بن عجلان العجلان','١٤٤٨/٠٥/٠٣هـ','٢٠٢٦/١٠/١٤م','فندق الريتز كارلتون'],
      ['عبدالعزيز بن سعد بن عبدالعزيز العجلان','١٤٤٨/٠٥/١١هـ','٢٠٢٦/١٠/٢٢م','فندق الفيصلية - قاعة الأمير سلطان'],
      ['عبدالله بن علي بن راجح العيد','١٤٤٨/٠٥/١٧هـ','٢٠٢٦/١٠/٢٨م','قاعة عبية نجد للاحتفالات'],
      ['عبدالعزيز بن فهد بن عبدالعزيز العجلان','١٤٤٨/٠٥/٢٢هـ','٢٠٢٦/١١/٠٢م','قاعة اليزيه للاحتفالات والمؤتمرات'],
      ['أبناء عبدالله بن إبراهيم السعد العجلان','١٤٤٨/٠٥/٢٣هـ','٢٠٢٦/١١/٠٣م','قاعة سراج - الياقوت'],
      ['أبناء فهد بن محمد السعد العجلان ومحمد بن ابراهيم السعد العجلان','١٤٤٨/٠٦/١٠هـ','٢٠٢٦/١١/٢٠م','قاعة سراج'],
      ['خالد بن محمد السعد العجلان','١٤٤٨/٠٦/١١هـ','٢٠٢٦/١١/٢١م','فندق الريتز كارلتون'],
      ['خالد بن عبدالعزيز بن إبراهيم العجلان','١٤٤٨/٠٦/١٤هـ','٢٠٢٦/١١/٢٤م','نادي منسوبي وزارة الداخلية'],
      ['عبدالعزيز بن عبدالرحمن العيد وسليمان بن عبدالعزيز العيد','١٤٤٨/٠٦/١٨هـ','٢٠٢٦/١١/٢٨م','نادي منسوبي وزارة الداخلية'],
      ['فهد بن سعد بن فهد العجلان','١٤٤٨/٠٦/٢٠هـ','٢٠٢٦/١١/٣٠م','قاعة نجد العذية بظهرة لبن'],
      ['محمد بن صالح بن عبدالعزيز العجلان وعبدالله بن علي بن محمد العجلان','١٤٤٨/٠٧/١٢هـ','٢٠٢٦/١٢/٢١م','قاعة نيارة'],
      ['محمد بن إبراهيم بن عبدالله العجلان','١٤٤٨/٠٧/١٢هـ','٢٠٢٦/١٢/٢١م','قاعة عبية نجد'],
      ['محمد بن سعد بن عبدالله العجلان','١٤٤٨/٠٧/١٧هـ','٢٠٢٦/١٢/٢٦م','قاعة ليلة التاج بحي المهدية']
      ].map(([host,hijri,greg,place])=>({host,type:'زواج',hijri,greg,time:'مساءً',place,map:''}))},
    {k:'noteT',label:'التنويه',def:'في حال الرغبة بإضافة مناسبتكم التواصل معنا لتحديث الجدول',type:'area',grp:'word'},
    {k:'phone',label:'رقم التواصل',def:'٠٥٣٣٣٣٩٨٩١',half:1,grp:'word'},
    {k:'by',label:'إعداد',def:'علي بن صالح بن محمد العجلان',grp:'word'},
    {k:'byRole',label:'صفة المعد',def:'مدير موقع أسرة العجلان والعيد',grp:'word',half:1},
    {k:'bySite',label:'الموقع',def:'www.alajlanandaleid.com',ltr:1,grp:'word',half:1},
    {k:'cheer',label:'عبارة التهنئة',def:'ألف مبروك',grp:'word',half:1}],
  photos:[],
  doc(v){return{seq:[],facts:[],sch:v};}},

news:{name:'خبر',desc:'بطاقة خبر عائلي',maxPhotos:()=>3,pals:['navy','ivory','emerald','night','ruby'],
  fields:[
    {k:'title',label:'عنوان الخبر',ph:'عنوان الخبر',req:1},
    {k:'text',label:'نص الخبر',ph:'اكتب نص الخبر هنا',type:'area',req:1},
    {k:'date',label:'التاريخ (اختياري)',def:''},
    {k:'badge',label:'اسم الزاوية',def:'أخبار الأسرة',grp:'word'}],
  photos:[],
  doc(v){return{kick:v.badge,title:v.title,text:v.text,date:v.date,seq:[{r:'hero',t:v.title},{r:'body',t:v.text}],facts:[]};}}
};
const ORDER=['wedding','qiran','promo','condolence','schedule','graduate','baby','general','news'];

const dv=(f,s)=>typeof f.def==='function'?f.def(s):f.def;
const phOf=(f,s)=>typeof f.ph==='function'?f.ph(s):f.ph;
const labelOf=(f,s)=>typeof f.label==='function'?f.label(s):f.label;
const fkey=(f,s)=>f.g?f.k+'@'+s:f.k;
// مفتاح الصيغة: النوع، ومعه العدد إذا كانت المناسبة تقبل أكثر من اسم
function gk(id,st){const o=OCC[id],n=o.plural&&Array.isArray(st.f&&st.f[o.plural])?st.f[o.plural].length:0;return st.gender+(n===1?'2':n>1?'3':'');}
// القيمة كما تظهر في حقل الكتابة
function raw(id,st,f){const k=fkey(f,gk(id,st));return st.f&&st.f[k]!==undefined?st.f[k]:(dv(f,gk(id,st))??(f.type==='list'?[]:''));}
const RAH=' -يرحمه الله-';
// القيم كما تُرسم: الفاضي المطلوب يطلع بين «»
function vals(id,st,foot){const v={};for(const f of OCC[id].fields){const r=raw(id,st,f);if(f.type==='toggle'){v[f.k]=!!r;continue;}
    if(f.type==='list'){v[f.k]=r.filter(x=>f.item.some(c=>String(x[c.k]||'').trim())).map(x=>{const o={};f.item.forEach(c=>{o[c.k]=String(x[c.k]||'').trim();});if(x.rah&&o.t)o.t+=RAH;return o;});continue;}
    const t=String(r).trim();v[f.k]=t?(f.rah&&st.f&&st.f[f.k+'_r']?t+RAH:t):(f.req?`«${phOf(f,st.gender)}»`:'');}
  for(const f of OCC[id].fields)if(f.sec&&!v[f.sec])v[f.k]='';if(foot)Object.assign(v,foot);return v;}
// الحقول المطلوبة الفاضية (تحذير قبل التحميل)
function missing(id,st){const v={};OCC[id].fields.forEach(f=>{if(f.type==='toggle')v[f.k]=!!raw(id,st,f);});return OCC[id].fields.filter(f=>f.req&&(!f.sec||v[f.sec])&&!String(raw(id,st,f)).trim());}
function blank(id){return{design:null,pal:null,gender:'m',f:{},photos:structuredClone(OCC[id].photos)};}
window.OCC_DATA={OCC,ORDER,raw,vals,missing,blank,fkey,gk,phOf,labelOf,VERSE_ISTIRJA,VERSE_NAFS};
})();
