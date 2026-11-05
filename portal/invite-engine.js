/* مصمم المناسبات: محرك الرسم + المناسبات + التصاميم
   كل تصميم يُرسم على مقاس منطقي (عرضه ١٠٨٠) والمصغرات نفس الرسمة بمقياس أصغر، فالمصغر = الشكل الحقيقي. */
(function(){
'use strict';
const F={ruqaa:'"Aref Ruqaa",Amiri,serif',mes:'"El Messiri",Cairo,sans-serif',cairo:'Cairo,sans-serif',bism:'"Scheherazade New",Amiri,serif',amiri:'Amiri,"Scheherazade New",serif'};
const SIZES={post:[1080,1350],square:[1080,1080],story:[1080,1920]};
const FONTS=['400 40px "Scheherazade New"','700 40px "Aref Ruqaa"','400 40px Amiri','700 40px Amiri','500 30px "El Messiri"','600 30px "El Messiri"','700 30px "El Messiri"','500 30px Cairo','600 30px Cairo','700 30px Cairo','800 30px Cairo','900 30px Cairo'];

// ===== الألوان: كل لوحة لها سطح غامق D وسطح فاتح L =====
const rgba=(rgb,a)=>`rgba(${rgb},${a})`;
const surf=(dark,bg0,bg1,ink,inkRgb,muted,gA,gB,gC,pat,patA,x)=>Object.assign({dark,bg0,bg1,ink,soft:rgba(inkRgb,.86),muted,goldA:gA,goldB:gB,goldC:gC,pat,patA},x);
const goldD=(bg0,bg1,x)=>surf(1,bg0,bg1,'#ffffff','255,255,255','rgba(238,224,194,.76)','#f8e3ad','#d5a456','#9a6a26','227,182,107',.075,x);
const paper=(ink,inkRgb,x)=>surf(0,'#fffbf2','#f0e5cd',ink,inkRgb,'#7d5a26','#c4913f','#a8732c','#6e4512','168,115,44',.11,x);
const PAL={
  navy:   {name:'كحلي ملكي',sw:'#241c6b',D:goldD('#2c2388','#0d0a2c'),L:paper('#1e1757','30,23,87'),main:'D'},
  ivory:  {name:'عاجي',sw:'#f6eedb',D:goldD('#2c2388','#0d0a2c'),L:paper('#1e1757','30,23,87',{bg0:'#fffbf2',bg1:'#eadcbc'}),main:'L'},
  emerald:{name:'زمردي',sw:'#0d4f3e',D:goldD('#136650','#03221a'),L:paper('#0c4435','12,68,53'),main:'D'},
  night:  {name:'أسود فاخر',sw:'#141210',D:goldD('#2b2722','#060505'),L:paper('#1c1915','28,25,21'),main:'D'},
  ruby:   {name:'عنابي',sw:'#5a1128',D:goldD('#741834','#22040e'),L:paper('#5a1128','90,17,40'),main:'D'},
  olive:  {name:'زيتوني',sw:'#59611f',D:goldD('#6a7327','#1b2308'),L:paper('#3f4716','63,71,22'),main:'D'},
  petrol: {name:'فيروزي',sw:'#0f5f6b',D:goldD('#137583','#052830'),L:paper('#0b4a55','11,74,85'),main:'D'},
  ocean:  {name:'أزرق محيطي',sw:'#14557c',D:goldD('#1c6a98','#07233a'),L:paper('#0f4567','15,69,103'),main:'D'},
  // الحزن: بلا ذهب لامع، لون واحد مكتوم
  charcoal:{name:'فحمي',sw:'#1d1e20',D:surf(1,'#2b2c2f','#17181a','#f1f0ec','241,240,236','rgba(205,203,196,.72)','#cfccc3','#aaa79e','#88857d','190,188,180',0),L:surf(0,'#eceae5','#dedbd4','#1c1d1f','28,29,31','rgba(74,74,72,.82)','#55534f','#403f3c','#2a2a28','70,70,66',0),main:'D'},
  pine:    {name:'أخضر داكن',sw:'#15302a',D:surf(1,'#1f3a31','#0e1f19','#eef0ea','238,240,234','rgba(196,206,192,.74)','#c3cdbd','#9fab99','#7d8a78','170,185,165',0),L:surf(0,'#e8ebe4','#d9ded4','#15302a','21,48,42','rgba(52,78,68,.85)','#3f5d52','#2e4a40','#1d352c','60,88,76',0),main:'D'},
  slate:   {name:'رمادي',sw:'#3a424b',D:surf(1,'#3a424b','#20262c','#f0f1f2','240,241,242','rgba(205,210,215,.74)','#ccd2d8','#a7aeb6','#858d96','180,188,196',0),L:surf(0,'#e9eaec','#dadcdf','#20262c','32,38,44','rgba(62,70,78,.85)','#4c5661','#3a424b','#272d33','70,78,86',0),main:'D'},
  bronze:  {name:'فحمي برونزي',sw:'#2a2620',D:surf(1,'#2a2926','#141311','#f1eee6','241,238,230','rgba(204,198,184,.72)','#b5a27c','#9c8a66','#7e6e50','170,150,115',0),L:surf(0,'#ece8df','#ddd7ca','#201e1a','32,30,26','rgba(82,74,60,.85)','#6f6044','#594c35','#3f3524','110,95,70',0),main:'D'},
  // المواليد: ألوان هادئة
  rose:{name:'وردي هادئ',sw:'#f0cfca',L:surf(0,'#fef6f3','#f7e0da','#6a3d48','106,61,72','#a4737c','#d6a29a','#bd867d','#96645c','190,135,125',.1),D:surf(1,'#9a6a74','#5f3a45','#ffffff','255,255,255','rgba(255,236,230,.8)','#fbe3d9','#f0c8ba','#d6a292','250,220,205',.08),main:'L'},
  sky: {name:'أزرق هادئ',sw:'#c9dbe9',L:surf(0,'#f4f9fc','#dde9f2','#2f4a66','47,74,102','#6f8aa3','#a9c1d4','#7f9fb8','#5b7c97','120,155,185',.1),D:surf(1,'#55779a','#2c4361','#ffffff','255,255,255','rgba(226,238,248,.82)','#f4e6c6','#e0c999','#bda56e','225,235,245',.08),main:'L'},
  sage:{name:'أخضر هادئ',sw:'#cfdccb',L:surf(0,'#f6f9f3','#e2eadc','#3d5345','61,83,69','#7a917f','#b3c4ae','#8fa58c','#6d866c','135,160,130',.1),D:surf(1,'#6f8c78','#3d5647','#ffffff','255,255,255','rgba(232,240,228,.82)','#f2e6c8','#dfca9c','#bca672','230,238,225',.08),main:'L'},
  sand:{name:'رملي',sw:'#eadfc9',L:surf(0,'#fdf9f0','#f0e6d2','#5a4a36','90,74,54','#99835f','#d0b788','#b69a66','#8f7546','175,145,100',.1),D:surf(1,'#94795a','#5a4632','#ffffff','255,255,255','rgba(248,238,220,.82)','#f8e7c4','#e6cc98','#c0a26c','245,230,200',.08),main:'L'}
};

// ===== أدوات الرسم =====
let g=null,Q=false,R=null;   // السياق الحالي، وضع المصغر، تقرير الملاءمة
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const font=(w,s,f)=>`${w} ${s.toFixed(1)}px ${f}`;
const MW=new Map();
function tw(t){const k=g.font+'|'+t;let v=MW.get(k);if(v===undefined){v=g.measureText(t).width;if(MW.size>9000)MW.clear();MW.set(k,v);}return v;}
const goldV=(T,y0,y1)=>{const r=g.createLinearGradient(0,y0,0,y1);r.addColorStop(0,T.goldA);r.addColorStop(.48,T.goldB);r.addColorStop(.78,T.goldC);r.addColorStop(1,T.goldB);return r;};
const goldG=(T,x0,y0,x1,y1)=>{const r=g.createLinearGradient(x0,y0,x1,y1);r.addColorStop(0,T.goldC);r.addColorStop(.3,T.goldA);r.addColorStop(.55,T.goldB);r.addColorStop(.8,T.goldA);r.addColorStop(1,T.goldC);return r;};
function fadeLine(T,cx,y,w,lw=1.4,a=1){const r=g.createLinearGradient(cx-w/2,0,cx+w/2,0);r.addColorStop(0,'rgba(0,0,0,0)');r.addColorStop(.5,T.goldB);r.addColorStop(1,'rgba(0,0,0,0)');g.save();g.globalAlpha=a;g.fillStyle=r;g.fillRect(cx-w/2,y-lw/2,w,lw);g.restore();}
function fadeLineV(T,x,y0,y1,lw=1.3){const r=g.createLinearGradient(0,y0,0,y1);r.addColorStop(0,'rgba(0,0,0,0)');r.addColorStop(.5,T.goldB);r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(x-lw/2,y0,lw,y1-y0);}
function star8(cx,cy,r,k=.42){g.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8-Math.PI/2,rr=i%2?r*k:r;g.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}g.closePath();}
function star4(cx,cy,r,k=.22){g.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,rr=i%2?r*k:r;g.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}g.closePath();}
function diamond(cx,cy,r,rx){rx=rx||r;g.beginPath();g.moveTo(cx,cy-r);g.lineTo(cx+rx,cy);g.lineTo(cx,cy+r);g.lineTo(cx-rx,cy);g.closePath();}
function archPath(L,A,R2,B,s,k=.1,q=.1){const cx=(L+R2)/2,w=R2-L;g.moveTo(L,B);g.lineTo(L,A+s);g.bezierCurveTo(L,A+s*.42,cx-w*k,A+s*q,cx,A);g.bezierCurveTo(cx+w*k,A+s*q,R2,A+s*.42,R2,A+s);g.lineTo(R2,B);g.closePath();}
function lattice(c,W,H,st,lw){const r=st*.3;c.lineWidth=lw;c.beginPath();
  for(let y=0;y<=H+st;y+=st)for(let x=0;x<=W+st;x+=st){
    for(const rot of[0,Math.PI/4]){for(let i=0;i<4;i++){const a=rot+i*Math.PI/2-Math.PI/4,b=a+Math.PI/2,p=[x+Math.cos(a)*r,y+Math.sin(a)*r],q=[x+Math.cos(b)*r,y+Math.sin(b)*r];if(!i)c.moveTo(...p);c.lineTo(...q);}}
    c.moveTo(x+r,y);c.lineTo(x+st-r,y);c.moveTo(x,y+r);c.lineTo(x,y+st-r);
    const dx=x+st/2,dy=y+st/2,d=st*.13;c.moveTo(dx,dy-d);c.lineTo(dx+d,dy);c.lineTo(dx,dy+d);c.lineTo(dx-d,dy);c.closePath();}
  c.stroke();}
// النقش بلاطة مكررة مخزنة: أسرع بكثير من رسمه خط خط في كل مصغر
const TILE={};
function patFill(T,x,y,w,h,st=108,a=1,lw=1.3){if(!T.pat)return;const k=T.pat+st+'/'+lw;let t=TILE[k];if(!t){const c=document.createElement('canvas');c.width=c.height=st;const q=c.getContext('2d');q.strokeStyle=`rgb(${T.pat})`;lattice(q,st,st,st,lw);t=TILE[k]=c;}
  const p=g.createPattern(t,'repeat');g.save();g.globalAlpha=a;g.fillStyle=p;g.fillRect(x,y,w,h);g.restore();}
let NZ=null;function grain(W,H,a){if(Q)return;if(!NZ){const c=document.createElement('canvas');c.width=c.height=180;const x=c.getContext('2d'),d=x.createImageData(180,180);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=Math.random()*70;}x.putImageData(d,0,0);NZ=c;}g.save();g.globalAlpha=a;g.fillStyle=g.createPattern(NZ,'repeat');g.fillRect(0,0,W,H);g.restore();}
function bgRadial(T,W,H,cy=.38,x=0,y=0){const r=g.createRadialGradient(x+W/2,y+H*cy,0,x+W/2,y+H*(cy+.05),Math.max(W,H)*.78);r.addColorStop(0,T.bg0);r.addColorStop(1,T.bg1);g.fillStyle=r;g.fillRect(x,y,W,H);}
function bgLin(T,x,y,w,h,flip){const r=g.createLinearGradient(0,y,0,y+h);r.addColorStop(0,flip?T.bg1:T.bg0);r.addColorStop(1,flip?T.bg0:T.bg1);g.fillStyle=r;g.fillRect(x,y,w,h);}
function vign(T,W,H,a){const r=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.45,W/2,H/2,Math.hypot(W,H)*.56);r.addColorStop(0,'rgba(0,0,0,0)');r.addColorStop(1,T.dark?`rgba(0,0,0,${a||.38})`:`rgba(120,80,20,${a||.12})`);g.fillStyle=r;g.fillRect(0,0,W,H);}
const shOn=(c='rgba(0,0,0,.4)',b=24,y=8)=>{if(Q)return;g.shadowColor=c;g.shadowBlur=b;g.shadowOffsetY=y;};
const shOff=()=>{g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;};
const keyline=(T,x,y,w,h,lw=1.4,a=1,col)=>{g.save();g.globalAlpha=a;g.strokeStyle=col||T.goldB;g.lineWidth=lw;g.strokeRect(x,y,w,h);g.restore();};
function frameStars(T,W,H,m1=24,m2=38){keyline(T,m1,m1,W-2*m1,H-2*m1,1,.55);g.strokeStyle=goldG(T,0,0,W,H);g.lineWidth=2.2;g.strokeRect(m2,m2,W-2*m2,H-2*m2);
  for(const[x,y]of[[m2,m2],[W-m2,m2],[m2,H-m2],[W-m2,H-m2]]){g.fillStyle=goldG(T,x-16,y-16,x+16,y+16);star8(x,y,15,.48);g.fill();g.fillStyle=T.bg1;star8(x,y,5.5,.48);g.fill();}}
function ornament(T,cx,y,w,sc=1){fadeLine(T,cx-w*.29,y,w*.42,1.4*sc);fadeLine(T,cx+w*.29,y,w*.42,1.4*sc);
  g.fillStyle=goldG(T,cx-14*sc,y-14*sc,cx+14*sc,y+14*sc);star8(cx,y,13*sc,.5);g.fill();g.fillStyle=T.bg1;star8(cx,y,5*sc,.5);g.fill();
  g.fillStyle=T.goldB;for(const s of[-1,1]){diamond(cx+s*26*sc,y,4*sc);g.fill();diamond(cx+s*38*sc,y,2.6*sc);g.fill();}}
function corners(T,x,y,w,h,l=46,lw=2){g.strokeStyle=T.goldB;g.lineWidth=lw;g.beginPath();for(const[a,b,s,t]of[[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]]){g.moveTo(a+s*l,b);g.lineTo(a,b);g.lineTo(a,b+t*l);}g.stroke();}

// ===== الصور والشعار =====
const IMG={};let onAsset=()=>{};
function loadImg(src){if(!src)return null;let i=IMG[src];if(!i){i=IMG[src]=new Image();i.onload=()=>onAsset();i.src=src;}return i.complete&&i.naturalWidth?i:null;}
const logo=()=>loadImg('img/logo.png');
let GRAYLOGO=null;
function drawLogo(cx,cy,h,gray){const L=logo();if(!L)return;let src=L;if(gray){if(!GRAYLOGO){const c=document.createElement('canvas');c.width=L.naturalWidth;c.height=L.naturalHeight;const q=c.getContext('2d');q.drawImage(L,0,0);q.globalCompositeOperation='source-in';q.fillStyle=gray;q.fillRect(0,0,c.width,c.height);GRAYLOGO=c;}src=GRAYLOGO;}
  const w=h*L.naturalWidth/L.naturalHeight;g.drawImage(src,cx-w/2,cy-h/2,w,h);}
function seal(T,cx,cy,r){g.save();shOn();const m=g.createRadialGradient(cx,cy-r*.4,0,cx,cy,r);m.addColorStop(0,T.dark?T.bg0:'#ffffff');m.addColorStop(1,T.dark?T.bg1:T.bg1);g.fillStyle=m;g.beginPath();g.arc(cx,cy,r,0,7);g.fill();g.restore();
  g.strokeStyle=goldG(T,cx-r,cy-r,cx+r,cy+r);g.lineWidth=3;g.beginPath();g.arc(cx,cy,r,0,7);g.stroke();g.save();g.lineWidth=1;g.globalAlpha=.6;g.beginPath();g.arc(cx,cy,r-7,0,7);g.stroke();g.beginPath();g.arc(cx,cy,r+8,0,7);g.stroke();g.restore();
  drawLogo(cx,cy+2,r*1.12);}
// صورة مربعة: تعبّي المربع وما تكشف فراغ، والصور الطولية تميل للأعلى عشان يبقى الوجه داخل الإطار
function photo(p,x,y,s,o={}){const im=loadImg(p.src);g.save();g.beginPath();g.rect(x,y,s,s);g.clip();
  if(im){const nw=im.naturalWidth,nh=im.naturalHeight,k=Math.max(s/nw,s/nh)*(p.z||1),iw=nw*k,ih=nh*k,mx=(iw-s)/2,my=(ih-s)/2,bias=nh>nw*1.05?.6:0;
    g.drawImage(im,x-mx+clamp(p.x||0,-1,1)*mx,y-my+clamp((p.y||0)+bias,-1,1)*my,iw,ih);
    // الأبيض والأسود بطريقة تشتغل على سفاري كمان
    if(o.gray){g.globalCompositeOperation='saturation';g.fillStyle='#000';g.fillRect(x,y,s,s);g.globalCompositeOperation='source-over';g.fillStyle='rgba(20,20,20,.12)';g.fillRect(x,y,s,s);}
  }else{g.fillStyle='rgba(128,128,128,.25)';g.fillRect(x,y,s,s);}
  g.restore();}
// إطار الصورة: حد رفيع + مسافة + خط داخلي
function tile(T,p,x,y,s,o={}){const m=o.mat??9;
  if(o.plain){photo(p,x,y,s,o);keyline(T,x+.5,y+.5,s-1,s-1,o.lw||1.4,o.a||.9);return;}
  g.save();shOn(T.dark?'rgba(0,0,0,.5)':'rgba(60,40,10,.25)',28,10);g.fillStyle=o.mc||(T.dark?T.bg1:'#fffdf8');g.fillRect(x-m,y-m,s+2*m,s+2*m);g.restore();
  photo(p,x,y,s,o);
  g.strokeStyle=o.gray?T.goldB:goldG(T,x-m,y-m,x+s+m,y+s+m);g.lineWidth=o.lw||2;g.strokeRect(x-m,y-m,s+2*m,s+2*m);
  keyline(T,x,y,s,s,1,.7,T.goldA);}

// ===== قياس النص =====
// التاريخ ما ينكسر عند الشرطة المائلة
const words=t=>String(t).replace(/ *\/ */g,m=>m.replace(/ /g,'\u00A0')).trim().split(/[ \t\r\n]+/).filter(Boolean);
function wrapW(t,mw){const out=[];for(const para of String(t).split('\n')){let cur='';for(const w of words(para)){const n=cur?cur+' '+w:w;if(tw(n)>mw&&cur){out.push(cur);cur=w;}else cur=n;}if(cur)out.push(cur);}return out.map(l=>l.replace(/^[·،]\s*|\s*·$/g,''));}
function balance(t,mw,n){if(n<2)return wrapW(t,mw);let lo=mw*.35,hi=mw,best=wrapW(t,mw);for(let i=0;i<7;i++){const m=(lo+hi)/2,L=wrapW(t,m);if(L.length<=n&&L.every(l=>tw(l)<=m+.5)){best=L;hi=m;}else lo=m;}return best;}
// أكبر خط يدخل في عدد الأسطر، وإذا ما دخل يزيد أسطر بدل ما يطلع برا
function fit(t,st,sc,mw){const s0=st.s*sc,s1=(st.min||st.s*.62)*sc,n=st.lines||2,w=st.w||400,step=Math.max(.75,s0*.03);
  for(let fs=s0;fs>=s1;fs-=step){g.font=font(w,fs,st.f);const L=wrapW(t,mw);if(L.length<=n&&L.every(l=>tw(l)<=mw))return{fs,L:st.bal===0?L:balance(t,mw,L.length)};}
  g.font=font(w,s1,st.f);const L=wrapW(t,mw);return{fs:s1,L};}
const isPh=t=>/^(«[^»]*»[\s·،]*)+$/.test(String(t||'').trim());
function paint(T,c,y0,y1){return c==='gold'?goldV(T,y0,y1):c==='acc'?T.goldB:c==='accD'?T.goldC:c==='ink'?T.ink:c==='soft'?T.soft:c==='muted'?T.muted:c||T.ink;}
function setAl(al){g.textAlign=al==='center'?'center':'right';}

// ===== عناصر التدفق: كل عنصر يعرف يقيس نفسه lay(sc,w) ويرجع ارتفاعه ورسمته =====
function Tx(T,t,st,o={}){if(!t)return null;return{lay(sc,w){const mw=Math.min(w,(st.mw||1e5)*sc),r=fit(t,st,sc,mw),lh=r.fs*(st.lh||1.42),h=r.L.length*lh;
    return{h,gap:(st.gap||0)*sc,flex:st.flex??1,d(x,y,W2,al){g.save();setAl(al);g.textBaseline='middle';g.font=font(st.w||400,r.fs,st.f);if(isPh(t))g.globalAlpha=.62;if(st.sh&&T.dark)shOn('rgba(0,0,0,.45)',10,3);
      r.L.forEach((l,i)=>{const yy=y+lh*i+lh*.5;g.fillStyle=paint(T,st.col,yy-r.fs*.6,yy+r.fs*.5);g.fillText(l,al==='center'?x+W2/2:x+W2,yy,W2);});g.restore();}};}};}
function Pair(T,a,b,sa,sb){if(!b)return null;return{lay(sc,w){let fs=sb.s*sc;const min=(sb.min||sb.s*.7)*sc,pre=a?a+' ':'';const m=f=>{g.font=font(sa.w,f*.9,sa.f);const p=tw(pre);g.font=font(sb.w,f,sb.f);return[p,tw(b)];};let[p,q]=m(fs);while(p+q>w&&fs>min){fs-=1;[p,q]=m(fs);}
    if(p+q<=w){const h=fs*1.5;return{h,gap:(sb.gap||12)*sc,flex:sb.flex??.6,d(x,y,W2,al){const yy=y+h/2,x0=al==='center'?x+W2/2+(p+q)/2:x+W2;g.save();g.textAlign='right';g.textBaseline='middle';if(isPh(b))g.globalAlpha=.62;g.font=font(sa.w,fs*.9,sa.f);g.fillStyle=paint(T,sa.col,yy-fs,yy+fs);g.fillText(pre,x0,yy);g.font=font(sb.w,fs,sb.f);g.fillStyle=paint(T,sb.col,yy-fs*.6,yy+fs*.5);g.fillText(b,x0-p,yy);g.restore();}};}
    const A=a?Tx(T,a,{...sa,s:sb.s*.85,gap:0}).lay(sc,w):null,B=Tx(T,b,{...sb,lines:2,gap:0}).lay(sc,w),h=(A?A.h:0)+B.h;return{h,gap:(sb.gap||12)*sc,flex:sb.flex??.6,d(x,y,W2,al){if(A)A.d(x,y,W2,al);B.d(x,y+(A?A.h:0),W2,al);}};}};}
const B=(h,gap,flex,d)=>({lay:sc=>({h:h*sc,gap:gap*sc,flex,d:(x,y,w,al)=>{g.save();d(x,y,w,al,sc);g.restore();}})});
const Sp=(h,flex=0)=>B(h,0,flex,()=>{});
function Bism(T,o={}){const s0=o.s||140,cap=o.cap||380,ch='﷽';return{lay(sc,w){let fs=s0*sc;g.font=font(400,fs,F.bism);let m=g.measureText(ch),w0=Math.max(m.width,(m.actualBoundingBoxLeft||0)+(m.actualBoundingBoxRight||0));const c2=Math.min(cap*sc,w);if(w0>c2)fs*=c2/w0;g.font=font(400,fs,F.bism);m=g.measureText(ch);const a=m.actualBoundingBoxAscent||fs*.6,de=m.actualBoundingBoxDescent||fs*.2;
    return{h:a+de,gap:(o.gap||0)*sc,flex:o.flex??.6,d(x,y,W2,al){g.save();setAl(al);g.textBaseline='alphabetic';g.font=font(400,fs,F.bism);if(T.dark)shOn('rgba(0,0,0,.45)',10,3);g.fillStyle=o.col?paint(T,o.col,y,y+a+de):goldV(T,y,y+a+de);g.fillText(ch,al==='center'?x+W2/2:x+W2,y+a);g.restore();}};}};}
function Pill(T,t,o={}){if(!t)return null;return{lay(sc,w){const fs=22*sc;g.font=font(700,fs,F.cairo);const tt=Math.min(w-30*sc,tw(t)),bh=fs*2,bw=tt+fs*2.4;return{h:bh,gap:(o.gap||10)*sc,flex:.5,d(x,y,W2,al){const px=al==='center'?x+W2/2-bw/2:x+W2-bw;g.save();g.fillStyle=T.dark?'rgba(255,255,255,.06)':'rgba(30,23,87,.05)';g.strokeStyle=rgba(T.pat,.6);g.lineWidth=1.2;g.beginPath();g.roundRect(px,y,bw,bh,bh/2);g.fill();g.stroke();g.textAlign='center';g.textBaseline='middle';g.font=font(700,fs,F.cairo);g.fillStyle=T.dark?T.goldA:T.goldC;g.fillText(t,px+bw/2,y+bh/2+fs*.06,bw-fs);g.restore();}};}};}
function Orn(T,kind,o={}){if(kind==='none')return null;const w0=o.w||440;return B(16,o.gap??6,.4,(x,y,w,al,sc)=>{const cx=al==='center'?x+w/2:x+w-Math.min(w0*sc,w)/2;if(kind==='rule'){if(al==='center')fadeLine(T,cx,y+8*sc,Math.min(w0*sc,w),1.3*sc);else{g.fillStyle=T.goldB;g.fillRect(x+w-90*sc,y+7*sc,90*sc,2.4*sc);}}else if(kind==='dia'){fadeLine(T,cx,y+8*sc,Math.min(w0*sc,w),1.2*sc);g.fillStyle=T.goldB;diamond(cx,y+8*sc,6*sc);g.fill();}else ornament(T,cx,y+8*sc,Math.min(w0*sc,w),sc);});}
// خلايا (عنوان فوق قيمة): line=strip خطوط فوق وتحت وفواصل، rows خط بين كل صف، box مربعات
function Grid(T,cells,o={}){if(!cells||!cells.length)return null;return{lay(sc,w){const n=cells.length,ls=(o.ls||22)*sc,vs=o.vs||33,gp=(o.cgap??0)*sc,lf=o.lf||F.cairo,vf=o.vf||F.mes,vw=o.vw||700,pad=(o.pad??14)*sc;
    const vst={f:vf,w:vw,s:vs,min:vs*.66,lines:o.lines||2,lh:1.3},ins=o.inset??(o.line==='strip'||!o.line?24:14);
    const tryC=cols=>{const cw=(w-gp*(cols-1))/cols,in_=cw-ins*sc;const rs=cells.map(c=>{const one=fit(c[1],{...vst,lines:1,min:vs*.86},sc,in_);return one.L.length===1&&tw(one.L[0])<=in_?one:fit(c[1],vst,sc,in_);});return{cols,cw,in_,rs,bad:rs.some(r=>r.fs<vst.s*sc*.72)};};
    let G=null;for(const k of(o.cols?[o.cols]:[n,Math.ceil(n/2),1])){G=tryC(k);if(!G.bad)break;}
    const rows=Math.ceil(n/G.cols),rh=[];for(let r=0;r<rows;r++){let m=0;for(let k=0;k<G.cols;k++){const c=G.rs[r*G.cols+k];if(c)m=Math.max(m,c.L.length*c.fs*vst.lh);}rh.push(ls*1.5+m+pad*2);}
    const h=rh.reduce((a,b)=>a+b,0)+(o.rgap||0)*sc*(rows-1);
    return{h,gap:(o.gap??30)*sc,flex:o.flex??2,d(x,y,W2,al){g.save();const line=o.line||'strip',ca=o.al||'center';
      if(line==='strip'){fadeLine(T,x+W2/2,y,W2+60*sc,1.2*sc,.9);fadeLine(T,x+W2/2,y+h,W2+60*sc,1.2*sc,.9);}
      let yy=y;for(let r=0;r<rows;r++){const H2=rh[r],inRow=Math.min(G.cols,n-r*G.cols),rowW=inRow*G.cw+gp*(inRow-1),x0=x+(W2+rowW)/2;
        for(let k=0;k<inRow;k++){const i=r*G.cols+k,c=cells[i],rr=G.rs[i],cx=x0-G.cw*(k+.5)-gp*k,right=cx+G.cw/2-(ca==='right'?ins*sc/2:0);
          if(line==='box'){g.fillStyle=o.fill||(T.dark?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)');g.fillRect(cx-G.cw/2,yy,G.cw,H2);keyline(T,cx-G.cw/2,yy,G.cw,H2,1,.5);}
          g.textBaseline='middle';g.textAlign=ca==='right'?'right':'center';const ax=ca==='right'?right:cx;
          g.font=font(600,ls,lf);g.fillStyle=o.lc?paint(T,o.lc,yy,yy+H2):T.muted;g.fillText(c[0],ax,yy+pad+ls*.72,G.cw-8*sc);
          g.font=font(vw,rr.fs,vf);const lh=rr.fs*vst.lh,vy=yy+pad+ls*1.5;g.save();if(isPh(c[1]))g.globalAlpha=.62;rr.L.forEach((l,j)=>{const q=vy+lh*j+lh*.5;g.fillStyle=c[2]?goldV(T,q-rr.fs*.6,q+rr.fs*.5):T.ink;g.fillText(l,ax,q,G.in_);});g.restore();
          if(k&&line==='strip'){const sx=cx+G.cw/2+gp/2;fadeLineV(T,sx,yy+14*sc,yy+H2-14*sc,1.4);g.fillStyle=T.goldB;diamond(sx,yy+H2/2,5*sc,3.4*sc);g.fill();}}
        if(line==='rows'&&r<rows-1){g.fillStyle=rgba(T.pat,.35);g.fillRect(x,yy+H2,W2,1.2);}
        if(line==='strip'&&r<rows-1)fadeLine(T,x+W2/2,yy+H2,W2,1,.5);
        yy+=H2+(o.rgap||0)*sc;}
      g.restore();}};}};}
// جدول: العنوان يمين والقيمة بجانبه، أنسب للنعي والتفاصيل الطويلة
function List(T,cells,o={}){if(!cells||!cells.length)return null;return{lay(sc,w){const ls=(o.ls||24)*sc,lf=o.lf||F.cairo,vf=o.vf||F.amiri,vw=o.vw||700,vs=o.vs||33,pad=(o.pad??13)*sc;g.font=font(700,ls,lf);const lw=Math.min(w*.34,Math.max(...cells.map(c=>tw(c[0])))+(o.lgap??26)*sc),vW=w-lw;
    const st={f:vf,w:vw,s:vs,min:vs*.66,lines:o.lines||2,lh:1.4};const rs=cells.map(c=>fit(c[1],st,sc,vW)),rh=rs.map(r=>Math.max(r.L.length*r.fs*st.lh,ls*1.5)+pad*2),h=rh.reduce((a,b)=>a+b,0);
    return{h,gap:(o.gap??26)*sc,flex:o.flex??2,d(x,y,W2){g.save();let yy=y;const top=o.top!==0;if(top){g.fillStyle=rgba(T.pat,.45);g.fillRect(x,yy,W2,1.2);}
      cells.forEach((c,i)=>{const r=rs[i],H2=rh[i],lh=r.fs*st.lh;g.textAlign='right';g.textBaseline='middle';g.font=font(700,ls,lf);g.fillStyle=o.lc?paint(T,o.lc,yy,yy+H2):T.goldB;g.fillText(c[0],x+W2,yy+H2/2,lw-10*sc);
        g.font=font(vw,r.fs,vf);g.save();if(isPh(c[1]))g.globalAlpha=.62;g.fillStyle=T.ink;const y0=yy+(H2-r.L.length*lh)/2;r.L.forEach((l,j)=>g.fillText(l,x+W2-lw,y0+lh*j+lh*.5,vW));g.restore();yy+=H2;g.fillStyle=rgba(T.pat,.45);g.fillRect(x,yy,W2,1.2);});g.restore();}};}};}
function QR(T,url,o={}){if(!url||!window.qrcode)return null;let q=null;try{q=qrcode(0,'M');q.addData(url);q.make();}catch(e){return null;}
  return B(118+44,o.gap??18,.6,(x,y,w,al,sc)=>{const s=118*sc,n=q.getModuleCount(),c=s/n,qx=(al==='center'?x+w/2-s/2:x+w-s-9*sc),qy=y;g.fillStyle='#fff';g.strokeStyle=T.goldB;g.lineWidth=2;g.beginPath();g.roundRect(qx-9*sc,qy-9*sc,s+18*sc,s+18*sc,10*sc);g.fill();g.stroke();g.fillStyle='#1a1448';for(let r=0;r<n;r++)for(let k=0;k<n;k++)if(q.isDark(r,k))g.fillRect(qx+k*c,qy+r*c,c+.3,c+.3);g.textAlign=al==='center'?'center':'right';g.textBaseline='middle';g.font=font(600,17*sc,F.cairo);g.fillStyle=T.muted;g.fillText('امسح الباركود للموقع',al==='center'?x+w/2:x+w,qy+s+30*sc);});}
// صف صور مربعة مع التعريف تحت كل صورة
function PRow(T,P,o={}){if(!P.length)return null;return{lay(sc,w){const n=P.length,base=o.s||(n===3?232:n===2?262:300),mid=o.mid===0?1:1.17,gp0=o.gapx??(n===3?40:60),hasCap=o.cap!==0&&P.some(p=>p.role||p.name||p.note);
    const sz=P.map((p,i)=>n===3&&i===1?base*mid:base),sum=sz.reduce((a,b)=>a+b,0)+gp0*(n-1),k=Math.min(sc,w/(sum+22));const dims=sz.map(s=>s*k),gp=gp0*k,mat=(o.mat??9)*k,top=mat;
    const roleS=21*Math.max(sc,.72),nameSt={f:o.nf||F.mes,w:700,s:25,min:15,lines:2,lh:1.3},roleH=roleS*1.42;
    const caps=P.map((p,i)=>p.name?fit(p.name,nameSt,Math.max(sc,.72),dims[i]+gp*.62):null);
    const capH=hasCap?Math.max(...P.map((p,i)=>(p.role?roleH:0)+(caps[i]?caps[i].L.length*caps[i].fs*1.3:0)+(p.note?roleS*1.4:0)))+14*sc:0,maxS=Math.max(...dims);
    const h=top+maxS+mat+capH;
    return{h,gap:(o.gap??22)*sc,flex:o.flex??1.6,d(x,y,W2,al){const tot=dims.reduce((a,b)=>a+b,0)+gp*(n-1);let px=(al==='center'?x+W2/2+tot/2:x+W2);const yb=y+top+maxS;
      P.forEach((p,i)=>{const s=dims[i];px-=s;tile(T,p,px,yb-s,s,{mat:o.plain?0:mat,plain:o.plain,gray:o.gray,lw:o.lw});
        if(hasCap){const mx=px+s/2;let cy=yb+mat+14*sc;g.save();g.textAlign='center';g.textBaseline='middle';
          if(p.role){g.font=font(700,roleS,F.cairo);g.fillStyle=T.dark?T.goldB:T.goldC;g.fillText(p.role,mx,cy+roleH*.46,s+gp*.6);cy+=roleH;}
          if(caps[i]){const r=caps[i],lh=r.fs*1.3;g.font=font(700,r.fs,nameSt.f);g.fillStyle=T.ink;r.L.forEach(l=>{g.fillText(l,mx,cy+lh*.5,s+gp*.62);cy+=lh;});}
          if(p.note){g.font=font(600,roleS,F.mes);g.fillStyle=T.dark?T.goldA:T.goldB;g.fillText(p.note,mx,cy+roleS*.7,s+gp*.6);}
          g.restore();}
        px-=gp;});}};}};}
// عمود فرعي، وعمودين جنب بعض
function Col(items,o={}){const it=items.filter(Boolean);return{lay(sc,w){const L=it.map(i=>i.lay(sc,w)).filter(Boolean),h=L.reduce((a,l,i)=>a+l.h+(i?l.gap:0),0);return{h,gap:(o.gap||0)*sc,flex:o.flex??1,d(x,y,W2,al){let yy=y;L.forEach((l,i)=>{if(i)yy+=l.gap;g.save();l.d(x,yy,W2,o.al||al);g.restore();yy+=l.h;});}};}};}
function Split(T,right,left,o={}){const ratio=o.ratio||.6;return{lay(sc,w){const gp=(o.gapx??44)*sc,rw=(w-gp)*ratio,lw=w-gp-rw,a=right.lay(sc,rw),b=left.lay(sc,lw),h=Math.max(a.h,b.h);return{h,gap:(o.gap??24)*sc,flex:o.flex??2.4,d(x,y,W2,al){a.d(x+W2-rw,y+(h-a.h)/2,rw,o.ral||al);b.d(x,y+(h-b.h)/2,lw,o.lal||'center');if(o.rule!==0){const dx=x+lw+gp/2;fadeLineV(T,dx,y,y+h,1.2);}}};}};}
// يرص العناصر داخل الصندوق: يصغّر المقياس لين تدخل، ويوزع الزايد على الفواصل
function stack(items,box,o={}){const it=items.filter(Boolean),al=o.al||'center',mn=o.min||.5;let sc=o.max||1,L,tot;
  for(;;){L=it.map(i=>i.lay(sc,box.w)).filter(Boolean);tot=L.reduce((a,l,i)=>a+l.h+(i?l.gap:0),0);if(tot<=box.h||sc<=mn)break;sc=Math.max(mn,sc-.02);}
  if(tot>box.h+2&&R)R.over.push(Math.round(tot-box.h));if(R)R.sc=Math.min(R.sc,sc);
  let left=Math.max(0,box.h-tot);const FW=L.slice(1).reduce((a,l)=>a+l.flex,0)||1,per=Math.min(left/FW,(o.spread??46)*sc);L.forEach((l,i)=>{if(i){l.gap+=l.flex*per;left-=l.flex*per;}});
  let y=box.y+Math.max(0,left)*(o.va??.42);const y0=y;L.forEach((l,i)=>{if(i)y+=l.gap;g.save();g.textBaseline='middle';l.d(box.x,y,box.w,al);g.restore();y+=l.h;});return{sc,y0,y1:y};}

// مجموعات الخطوط
const E=(f,w,s,col,x)=>Object.assign({f,w,s,col},x);
const TY={
  classic:{kick:E(F.mes,600,36,'gold',{lines:1,gap:16,lh:1.5,min:24,flex:1}),lead:E(F.cairo,600,28,'soft',{gap:24,flex:2,lh:1.5}),host:E(F.ruqaa,700,48,'gold',{min:30,gap:2,lh:1.26,flex:.4,sh:1}),body:E(F.cairo,500,29,'soft',{min:21,gap:8,lines:3,lh:1.62,flex:.6}),pre:E(F.cairo,600,25,'muted',{gap:18,lh:1.4,flex:1.6}),hero:E(F.mes,700,60,'ink',{min:36,lh:1.3,flex:.3,sh:1}),hero2:E(F.mes,700,31,'gold',{min:22,gap:12,lh:1.45,flex:.6}),sub:E(F.mes,600,30,'gold',{gap:8,lh:1.4,flex:.5}),close:E(F.mes,600,29,'gold',{min:20,gap:24,lh:1.45,flex:1.2}),quote:E(F.bism,400,38,'gold',{min:26,gap:20,lines:3,lh:1.75,flex:1}),orn:'star'},
  naskh:{kick:E(F.amiri,700,38,'accD',{lines:1,gap:12,lh:1.5,min:26}),lead:E(F.amiri,400,34,'soft',{gap:18,flex:2,lh:1.6}),host:E(F.amiri,700,47,'ink',{min:30,gap:2,lh:1.42,flex:.4}),body:E(F.amiri,400,31,'soft',{min:22,gap:8,lines:3,lh:1.7,flex:.6}),pre:E(F.amiri,400,27,'muted',{gap:16,lh:1.5,flex:1.6}),hero:E(F.amiri,700,66,'accD',{min:38,lh:1.45,flex:.3}),hero2:E(F.amiri,700,33,'ink',{min:23,gap:10,lh:1.5,flex:.6}),sub:E(F.amiri,700,32,'accD',{gap:6,lh:1.5,flex:.5}),close:E(F.amiri,700,33,'accD',{min:21,gap:22,lh:1.55,flex:1.2}),quote:E(F.bism,400,38,'accD',{min:26,gap:18,lines:3,lh:1.75,flex:1}),orn:'dia'},
  modern:{kick:E(F.cairo,800,38,'gold',{lines:1,gap:12,lh:1.4,min:26}),lead:E(F.cairo,600,27,'soft',{gap:18,flex:2,lh:1.5}),host:E(F.cairo,800,42,'gold',{min:28,gap:2,lh:1.4,flex:.4}),body:E(F.cairo,500,28,'soft',{min:21,gap:8,lines:4,lh:1.62,flex:.6}),pre:E(F.cairo,600,24,'muted',{gap:14,lh:1.4,flex:1.6}),hero:E(F.cairo,800,62,'ink',{min:36,lh:1.34,flex:.3}),hero2:E(F.cairo,700,30,'gold',{min:22,gap:10,lh:1.45,flex:.6}),sub:E(F.cairo,600,29,'gold',{gap:6,lh:1.4,flex:.5}),close:E(F.cairo,700,28,'gold',{min:20,gap:20,lh:1.45,flex:1.2}),quote:E(F.cairo,600,29,'soft',{min:22,gap:16,lines:4,lh:1.7,flex:1}),orn:'rule'},
  solemn:{kick:E(F.amiri,400,28,'muted',{lines:1,gap:10,lh:1.5,min:22}),lead:E(F.amiri,400,38,'soft',{gap:10,flex:1.2,lh:1.55,min:25}),host:E(F.amiri,700,44,'ink',{min:28,lh:1.4}),body:E(F.amiri,400,30,'soft',{min:22,lines:3,lh:1.7}),pre:E(F.amiri,400,27,'muted',{gap:12,lh:1.5}),hero:E(F.amiri,700,84,'ink',{min:42,gap:18,lh:1.5,flex:1}),hero2:E(F.amiri,700,33,'ink',{min:23,gap:10,lh:1.5}),sub:E(F.amiri,400,40,'acc',{gap:2,lh:1.5,flex:.4}),close:E(F.amiri,400,34,'acc',{min:23,gap:20,lh:1.6,flex:1}),quote:E(F.bism,400,42,'soft',{min:26,gap:18,lines:3,lh:1.8,flex:1}),verse:E(F.bism,400,64,'acc',{min:36,lines:1,lh:1.7,flex:.4}),orn:'none'},
  soft:{kick:E(F.mes,600,38,'accD',{lines:1,gap:12,lh:1.5,min:26}),lead:E(F.mes,500,30,'soft',{gap:18,flex:1.6,lh:1.55}),host:E(F.mes,700,44,'ink',{min:28,lh:1.4}),body:E(F.mes,500,28,'soft',{min:21,lines:3,lh:1.65}),pre:E(F.mes,500,26,'muted',{gap:16,lh:1.5,flex:1.4}),hero:E(F.ruqaa,700,92,'ink',{min:44,gap:4,lh:1.4,flex:.6}),hero2:E(F.mes,700,33,'accD',{min:23,gap:4,lh:1.5,flex:.4}),sub:E(F.mes,600,28,'accD',{gap:6,lh:1.4}),close:E(F.mes,600,27,'accD',{min:20,gap:18,lh:1.5}),quote:E(F.amiri,400,35,'soft',{min:24,gap:20,lines:3,lh:1.75,flex:1.2}),orn:'dia'}
};
const flat=(ty,col,x)=>{const o={...ty};for(const k in o)if(o[k]&&o[k].f&&o[k].col==='accD')o[k]={...o[k],col};return Object.assign(o,x);};
TY.naskhD=flat(TY.naskh,'gold');TY.softD=flat(TY.soft,'gold');
const big=(ty,k,x)=>({...ty,[k]:{...ty[k],...x}});

function seqItems(T,seq,ty){const out=[];seq.forEach(e=>{if(e.r==='orn'){out.push(Orn(T,ty.orn||'star'));return;}if(e.r==='pair'){out.push(Pair(T,e.a,e.b,{...ty.pre,col:'soft'},ty.hero2));return;}const st=ty[e.r];if(st&&e.t)out.push(Tx(T,e.t,st));});return out;}
function headItem(T,d,ty,o={}){if(!d.head)return null;if(d.head.k==='bism')return Bism(T,o.bism);return Tx(T,d.head.t,ty.verse||{...ty.quote,lines:1});}
function afterItems(T,d,ty){const out=[];if(d.verse2)out.push(Tx(T,d.verse2,ty.quote));if(d.qr)out.push(QR(T,d.qr));if(d.close)out.push(Tx(T,d.close,ty.close));if(d.sign)out.push(Tx(T,d.sign,{...ty.hero2,gap:16}));return out;}
function factsItem(T,d,o){if(!d.facts||!d.facts.length||o===0)return null;return o&&o.list?List(T,d.facts,o):Grid(T,d.facts,o);}
// التدفق الكامل لأي مناسبة
function flow(c,T,ty,o={}){const d=c.doc;return[o.head===0?null:headItem(T,d,ty,o),o.kick===0?null:Tx(T,d.kick,ty.kick),o.remind===0?null:Pill(T,d.remind),o.photos==='row'&&c.P.length?PRow(T,c.P,o.prow):null,...seqItems(T,d.seq,ty),factsItem(T,d,o.fx),...afterItems(T,d,ty)];}
// في المربع المساحة قصيرة: الصور بعمود والنص بعمود
function photoCol(T,P,o={}){if(P.length===3)return Col([PRow(T,[P[1]],{s:210,...o}),PRow(T,[P[0],P[2]],{s:180,gapx:24,gap:14,...o})]);if(P.length===2)return PRow(T,P,{s:205,gapx:24,...o});return PRow(T,P,{s:300,...o});}
function flowFit(c,T,ty,o={}){if(!(c.sq&&c.P.length))return flow(c,T,ty,{...o,photos:'row'});const d=c.doc,txt=Col([...seqItems(T,d.seq,ty)]);
  return[o.head===0?null:headItem(T,d,ty,o),o.kick===0?null:Tx(T,d.kick,ty.kick),o.remind===0?null:Pill(T,d.remind),Split(T,txt,photoCol(T,c.P,o.prow),{ratio:o.ratio||.6}),factsItem(T,d,o.fx),...afterItems(T,d,ty)];}
function foot(c,T,y,o={}){const d=c.doc,parts=[d.social,d.site].filter(Boolean);if(!parts.length)return;const W=c.W,cx=o.cx??W/2;g.save();g.font=font(600,o.s||(c.st?24:21),F.cairo);g.direction='ltr';g.textBaseline='middle';g.fillStyle=o.col||T.muted;
  if(parts.length===2){const a=tw(parts[0]),b=tw(parts[1]),gp=46,x0=cx-(a+b+gp)/2;g.textAlign='left';g.fillText(parts[0],x0,y);g.fillText(parts[1],x0+a+gp,y);g.fillStyle=o.col||T.goldB;diamond(x0+a+gp/2,y,4);g.fill();}else{g.textAlign='center';g.fillText(parts[0],cx,y);}
  g.restore();}

window.OCC_ENGINE={F,SIZES,FONTS,PAL,TY,E,big,flat,clamp,font,tw,fit,rgba,goldV,goldG,fadeLine,fadeLineV,star8,star4,diamond,archPath,patFill,grain,bgRadial,bgLin,vign,shOn,shOff,keyline,frameStars,ornament,corners,loadImg,drawLogo,seal,photo,tile,Tx,Pair,B,Sp,Bism,Pill,Orn,Grid,List,QR,PRow,Col,Split,stack,seqItems,headItem,afterItems,factsItem,flow,flowFit,photoCol,foot,
  clearMeasure:()=>MW.clear(),ctx:()=>g,quick:()=>Q,setAsset:f=>{onAsset=f;},
  begin(ctx,q,r){g=ctx;Q=q;R=r;g.direction='rtl';g.textAlign='center';g.textBaseline='middle';}};
})();
