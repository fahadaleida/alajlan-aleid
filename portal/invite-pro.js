/* التصاميم الفاخرة: خلفية حرير بالكود، توزيع صور بصورة رئيسية أكبر، نص تبرز فيه الأسماء، جدول المناسبات، وشريط التذكير */
(function(){
'use strict';
const X=window.OCC_ENGINE,{F,E,rgba,goldV,goldG,fadeLine,star8,diamond,archPath,grain,vign,shOn,shOff,keyline,drawLogo,loadImg,Tx,Bism,QR,stack,font,tw,fit,clamp}=X;
const G=()=>X.ctx();
const by=(c,post,sq,st)=>c.sq?sq:c.st?st:post;
const ar=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const isPh=t=>/^(«[^»]*»[\s·،]*)+$/.test(String(t||'').trim());

// ===== الخلفية: طيات حرير مرسومة، ومخزنة لكل لون ومقاس =====
const SILK=new Map();
function silkCanvas(T,W,H){const k=[T.bg0,T.bg1,W,H].join();let c=SILK.get(k);if(c)return c;if(SILK.size>10)SILK.clear();c=document.createElement('canvas');c.width=W;c.height=H;const q=c.getContext('2d');
  const b=q.createLinearGradient(W,0,0,H);b.addColorStop(0,T.bg0);b.addColorStop(1,T.bg1);q.fillStyle=b;q.fillRect(0,0,W,H);
  const hi=T.dark?.075:.5,lo=T.dark?.2:.05;let sd=7;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
  for(let i=0;i<22;i++){const y=H*(i/21*1.5-.25),th=H*(.07+rnd()*.16),a=(rnd()-.5)*H*.34,e=(rnd()-.35)*H*.3,tilt=H*.16;
    q.beginPath();q.moveTo(-40,y+tilt);q.bezierCurveTo(W*.3,y+a+tilt*.6,W*.65,y-a,W+40,y+e-tilt);q.lineTo(W+40,y+e-tilt+th);q.bezierCurveTo(W*.65,y-a+th*1.2,W*.3,y+a+tilt*.6+th*.8,-40,y+tilt+th);q.closePath();
    const r=q.createLinearGradient(0,y-tilt,0,y+th+tilt);r.addColorStop(0,'rgba(255,255,255,0)');r.addColorStop(.42,`rgba(255,255,255,${hi})`);r.addColorStop(.6,`rgba(0,0,0,${lo})`);r.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=r;q.fill();}
  const gl=q.createRadialGradient(W/2,H*.42,0,W/2,H*.42,Math.max(W,H)*.62);gl.addColorStop(0,T.dark?'rgba(255,255,255,.1)':'rgba(255,255,255,.55)');gl.addColorStop(1,'rgba(255,255,255,0)');q.fillStyle=gl;q.fillRect(0,0,W,H);
  SILK.set(k,c);return c;}
function silk(T,W,H){const g=G();g.drawImage(silkCanvas(T,W,H),0,0,W,H);grain(W,H,.05);vign(T,W,H,T.dark?.42:.08);}
// شريطان ذهبيان منحنيان في زاويتين متقابلتين
function sweep(T,W,H){const g=G();const rib=(pts,th)=>{const[a,b,c2,d]=pts;g.beginPath();g.moveTo(...a);g.bezierCurveTo(...b,...c2,...d);g.lineTo(d[0],d[1]+th);g.bezierCurveTo(c2[0],c2[1]+th*1.5,b[0],b[1]+th*.6,a[0],a[1]);g.closePath();g.fill();};
  g.save();g.fillStyle=goldG(T,W*.5,0,W,H*.3);rib([[W*.56,0],[W*.72,H*.09],[W*.88,H*.03],[W+4,H*.17]],14);g.globalAlpha=.45;rib([[W*.66,0],[W*.8,H*.06],[W*.92,0],[W+4,H*.09]],6);
  g.globalAlpha=1;g.fillStyle=goldG(T,0,H*.7,W*.5,H);rib([[-4,H*.92],[W*.07,H*.99],[W*.18,H*.95],[W*.3,H+2]],-12);g.globalAlpha=.45;rib([[-4,H*.96],[W*.05,H*1],[W*.12,H*.97],[W*.22,H+2]],-5);g.restore();}
// إطار بزوايا مقطوعة ونجمة في كل زاوية
function notch(x,y,w,h,n){const g=G();g.beginPath();g.moveTo(x+n,y);g.lineTo(x+w-n,y);g.lineTo(x+w-n,y+n);g.lineTo(x+w,y+n);g.lineTo(x+w,y+h-n);g.lineTo(x+w-n,y+h-n);g.lineTo(x+w-n,y+h);g.lineTo(x+n,y+h);g.lineTo(x+n,y+h-n);g.lineTo(x,y+h-n);g.lineTo(x,y+n);g.lineTo(x+n,y+n);g.closePath();}
function frame(T,W,H,m,o={}){const g=G(),n=o.n??26;g.save();g.strokeStyle=goldG(T,0,0,W,H);g.lineWidth=3;notch(m,m,W-2*m,H-2*m,n);g.stroke();g.globalAlpha=.5;g.lineWidth=1;notch(m+11,m+11,W-2*m-22,H-2*m-22,n);g.stroke();g.globalAlpha=1;
  for(const[x,y]of[[m+n,m+n],[W-m-n,m+n],[m+n,H-m-n],[W-m-n,H-m-n]]){g.fillStyle=goldG(T,x-13,y-13,x+13,y+13);star8(x,y,12,.46);g.fill();}g.restore();}
// الشعار على راية نازلة من أعلى الصفحة
function pennant(c,T,cx,w,h){const g=G(),x=cx-w/2;g.save();shOn('rgba(0,0,0,.45)',22,8);g.beginPath();g.moveTo(x,0);g.lineTo(x+w,0);g.lineTo(x+w,h);g.lineTo(cx,h-w*.24);g.lineTo(x,h);g.closePath();const r=g.createLinearGradient(0,0,0,h);r.addColorStop(0,T.dark?T.bg1:'#fffdf8');r.addColorStop(1,T.dark?T.bg0:T.bg1);g.fillStyle=r;g.fill();shOff();g.strokeStyle=goldG(T,x,0,x+w,h);g.lineWidth=3;g.stroke();g.globalAlpha=.55;g.lineWidth=1;g.beginPath();g.moveTo(x+9,0);g.lineTo(x+9,h-w*.1);g.lineTo(cx,h-w*.34);g.lineTo(x+w-9,h-w*.1);g.lineTo(x+w-9,0);g.stroke();g.restore();
  drawLogo(cx,(h-w*.24)*.56,w*.62);}
function medal(T,cx,cy,r){const g=G();g.save();shOn('rgba(0,0,0,.4)',22,8);g.fillStyle=T.dark?T.bg1:'#fffdf8';g.beginPath();g.arc(cx,cy,r,0,7);g.fill();shOff();g.strokeStyle=goldG(T,cx-r,cy-r,cx+r,cy+r);g.lineWidth=3;g.stroke();g.globalAlpha=.55;g.lineWidth=1;g.beginPath();g.arc(cx,cy,r-7,0,7);g.stroke();g.restore();drawLogo(cx,cy+1,r*1.14);}

// ===== شريط حسابات الأسرة =====
function ico(k,x,y,r,ink){const g=G();g.save();g.fillStyle='#fff';g.beginPath();g.arc(x,y,r,0,7);g.fill();g.fillStyle=ink;g.strokeStyle=ink;g.lineWidth=r*.15;g.lineJoin='round';g.lineCap='round';const a=r*.52;
  if(k==='fb'){g.textAlign='center';g.textBaseline='middle';g.direction='ltr';g.font=font(900,r*1.45,F.cairo);g.fillText('f',x,y+r*.08);}
  else if(k==='ig'){g.beginPath();g.roundRect(x-a,y-a,a*2,a*2,a*.5);g.stroke();g.beginPath();g.arc(x,y,a*.48,0,7);g.stroke();g.beginPath();g.arc(x+a*.56,y-a*.56,r*.07,0,7);g.fill();}
  else if(k==='web'){g.beginPath();g.arc(x,y,a*1.1,0,7);g.stroke();g.beginPath();g.ellipse(x,y,a*.5,a*1.1,0,0,7);g.stroke();g.beginPath();g.moveTo(x-a*1.1,y);g.lineTo(x+a*1.1,y);g.stroke();}
  else if(k==='tk'){g.lineWidth=r*.22;g.beginPath();g.moveTo(x+a*.1,y-a);g.lineTo(x+a*.1,y+a*.5);g.stroke();g.beginPath();g.arc(x-a*.3,y+a*.5,a*.42,0,7);g.stroke();g.beginPath();g.moveTo(x+a*.1,y-a);g.quadraticCurveTo(x+a*.3,y-a*.35,x+a*.95,y-a*.35);g.stroke();}
  else if(k==='sc'){g.beginPath();g.moveTo(x-a*.62,y+a*.1);g.bezierCurveTo(x-a*.7,y-a*1.2,x+a*.7,y-a*1.2,x+a*.62,y+a*.1);g.lineTo(x+a*1.05,y+a*.55);g.lineTo(x+a*.55,y+a*.68);g.lineTo(x+a*.3,y+a*.98);g.lineTo(x,y+a*.82);g.lineTo(x-a*.3,y+a*.98);g.lineTo(x-a*.55,y+a*.68);g.lineTo(x-a*1.05,y+a*.55);g.closePath();g.fill();}
  else{g.beginPath();g.moveTo(x-a*1.05,y);g.lineTo(x+a*1.05,y-a*.9);g.lineTo(x+a*.55,y+a*.95);g.lineTo(x-a*.1,y+a*.35);g.lineTo(x+a*.6,y-a*.5);g.lineTo(x-a*.4,y+a*.22);g.closePath();g.fill();}
  g.restore();}
function bar(c,T,cy,o={}){const[a,b,d]=c.doc.bar||[];if(!a&&!b&&!d)return;const g=G(),w=o.w||c.W-180,h=o.h||by(c,60,54,68),x=(c.W-w)/2,ink=T.dark?T.bg1:'#2a2110',parts=[[['fb','ig','web','tk'],a],[['sc'],b],[['tg'],d]].filter(p=>p[1]);
  g.save();shOn('rgba(0,0,0,.35)',16,5);g.fillStyle=goldG(T.dark?T:c.D,x,cy,x+w,cy);g.beginPath();g.roundRect(x,cy-h/2,w,h,h/2);g.fill();shOff();g.globalAlpha=.55;g.strokeStyle=ink;g.lineWidth=1;g.beginPath();g.roundRect(x+6,cy-h/2+6,w-12,h-12,h/2-6);g.stroke();g.globalAlpha=1;
  const r=h*.3,ig=r*2.2,pad=r*.7,icoW=p=>p[0].length*ig,gap=r*1.3;let fs=h*.46,tot;g.direction='ltr';const meas=()=>{g.font=font(800,fs,F.cairo);tot=parts.reduce((s,p)=>s+icoW(p)+pad+g.measureText(p[1]).width,0)+gap*(parts.length-1);};meas();while(tot>w-h*.8&&fs>11){fs-=.5;meas();}
  let px=x+(w-tot)/2;g.textAlign='left';g.textBaseline='middle';parts.forEach(p=>{p[0].forEach((k,i)=>ico(k,px+ig*i+ig/2,cy,r,ink));px+=icoW(p)+pad;g.font=font(800,fs,F.cairo);g.fillStyle=ink;g.fillText(p[1],px,cy+fs*.04);px+=g.measureText(p[1]).width+gap;});g.restore();}

// ===== الصور: مستطيل عمودي، وتوزيعات تبرز الصورة الرئيسية =====
function photoR(p,x,y,w,h){const g=G(),im=loadImg(p.src);g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
  if(im){const nw=im.naturalWidth,nh=im.naturalHeight,k=Math.max(w/nw,h/nh)*(p.z||1),iw=nw*k,ih=nh*k,mx=(iw-w)/2,my=(ih-h)/2,bias=nh>nw*1.05?.5:-.2;g.drawImage(im,x-mx+clamp(p.x||0,-1,1)*mx,y-my+clamp((p.y||0)+bias,-1,1)*my,iw,ih);}
  else{g.fillStyle='rgba(128,128,128,.25)';g.fillRect(x,y,w,h);}g.restore();}
function tileR(T,e){const g=G(),{p,x,y,w,h,main}=e,m=main?9:clamp(w*.035,4,7);g.save();shOn(T.dark?'rgba(0,0,0,.55)':'rgba(60,40,10,.3)',main?34:22,main?14:8);g.fillStyle=T.dark?T.bg1:'#fffdf8';g.fillRect(x-m,y-m,w+2*m,h+2*m);g.restore();photoR(p,x,y,w,h);
  g.strokeStyle=goldG(T,x-m,y-m,x+w+m,y+h+m);g.lineWidth=main?3.4:2;g.strokeRect(x-m,y-m,w+2*m,h+2*m);keyline(T,x,y,w,h,1,.8,T.goldA);
  if(main){const l=Math.min(44,w*.16);g.strokeStyle=T.goldA;g.lineWidth=4;g.beginPath();for(const[a,b,s,t]of[[x-m-7,y-m-7,1,1],[x+w+m+7,y-m-7,-1,1],[x-m-7,y+h+m+7,1,-1],[x+w+m+7,y+h+m+7,-1,-1]]){g.moveTo(a+s*l,b);g.lineTo(a,b);g.lineTo(a,b+t*l);}g.stroke();}}
const capM=w=>({rs:clamp(w*.075,15,25),ns:clamp(w*.088,16.5,30)});
function capH(list,w,k){const has=list.some(p=>p.role||p.name||p.note);if(!has)return 0;const{rs,ns}=capM(w);let m=0;list.forEach(p=>{const r=p.name?fit(p.name,{f:F.cairo,w:800,s:ns,min:ns*.74,lines:2,lh:1.28},1,w*k):null;m=Math.max(m,(p.role?rs*1.5:0)+(r?r.L.length*r.fs*1.28:0)+(p.note?rs*1.4:0));});return m+14;}
// الصور الجانبية الصغيرة: التعريف فوق الصورة عشان ما يأكل من حجمها
function capO(T,e){const{p,x,y,w,h}=e,g=G();if(!p.role&&!p.name&&!p.note)return;const rs=clamp(w*.09,13,20),ns=clamp(w*.1,14,22),mw=w-10,r=p.name?fit(p.name,{f:F.cairo,w:800,s:ns,min:ns*.8,lines:2,lh:1.24},1,mw):null,lh=r?r.fs*1.24:0,ch=(p.role?rs*1.35:0)+(r?r.L.length*lh:0)+(p.note?rs*1.25:0)+10,gr=g.createLinearGradient(0,y+h-ch*1.5,0,y+h);gr.addColorStop(0,'rgba(8,6,20,0)');gr.addColorStop(.42,'rgba(8,6,20,.74)');gr.addColorStop(1,'rgba(8,6,20,.92)');g.save();g.fillStyle=gr;g.fillRect(x,y+h-ch*1.5,w,ch*1.5);g.textAlign='center';g.textBaseline='middle';let cy=y+h-ch+3;const mx=x+w/2;
  if(p.role){g.font=font(700,rs,F.cairo);g.fillStyle='#f8e3ad';g.fillText(p.role,mx,cy+rs*.66,mw);cy+=rs*1.35;}if(r){g.font=font(800,r.fs,F.cairo);g.fillStyle='#fff';r.L.forEach(l=>{g.fillText(l,mx,cy+lh*.5,mw);cy+=lh;});}if(p.note){g.font=font(700,rs*.9,F.cairo);g.fillStyle='#fff';g.fillText(p.note,mx,cy+rs*.6,mw);}g.restore();}
function capD(T,e,k){if(e.ov)return capO(T,e);const{p,x,y,w,h,main}=e,g=G(),{rs,ns}=capM(w),mx=x+w/2,mw=w*k;let cy=y+h+(main?20:13);g.save();g.textAlign='center';g.textBaseline='middle';
  if(p.role){g.font=font(700,rs,F.cairo);g.fillStyle=T.dark?T.goldA:T.goldC;g.fillText(p.role,mx,cy+rs*.72,mw);cy+=rs*1.5;}
  if(p.name){const r=fit(p.name,{f:F.cairo,w:800,s:ns,min:ns*.74,lines:2,lh:1.28},1,mw),lh=r.fs*1.28;g.font=font(800,r.fs,F.cairo);g.fillStyle=T.ink;r.L.forEach(l=>{g.fillText(l,mx,cy+lh*.5,mw);cy+=lh;});}
  if(p.note){g.font=font(700,rs*.92,F.cairo);g.fillStyle=T.ink;g.fillText(p.note,mx,cy+rs*.7,mw);}g.restore();}
const defLay=n=>n>=5?'wings':'row';
function mainIx(P){const i=P.findIndex(p=>p.main);return i>=0?i:P.length===3?1:0;}
const R0=.82;   // عرض الصورة إلى طولها
// صف صور: الرئيسية أطول، والقواعد على خط واحد
function rowCells(list,mi,x,y,w,h,k){const n=list.length,gp=clamp(w*.03,12,34),up=1.26,wt=i=>i===mi?up:1;let th=h*.8;for(let t=0;t<3;t++){const cw=th/up*R0;th=h-capH(list,cw,k)-14;}
  let unit=th/(mi>=0?up:1);let tot=list.reduce((s,_,i)=>s+unit*wt(i)*R0,0)+gp*(n-1);const s=Math.min(1,(w-gp*.5)/tot);unit*=s;tot=list.reduce((a,_,i)=>a+unit*wt(i)*R0,0)+gp*(n-1);const base=y+(h-capH(list,unit*R0,k)+(th*s))/2-4;let px=x+(w+tot)/2;
  return list.map((p,i)=>{const tw0=unit*wt(i)*R0,thh=unit*wt(i);px-=tw0;const e={p,x:px,y:base-thh,w:tw0,h:thh,main:i===mi};px-=gp;return e;});}
function slot(p,x,y,w,h,k,main){let th=h*.8;for(let t=0;t<3;t++){th=h-capH([p],Math.min(w,th*R0),k)-(main?20:12);}const tw0=Math.min(w,th*R0),t2=Math.min(th,tw0/R0*1.08);return{p,x:x+(w-tw0)/2,y:y+(th-t2)/2,w:tw0,h:t2,main:!!main};}
// خانة صغيرة تعبيها الصورة كلها
function small(p,x,y,w,h){const tw0=Math.min(w,h),t2=Math.min(h,tw0/R0);return{p,x:x+(w-tw0)/2,y:y+(h-t2)/2,w:tw0,h:t2,ov:1};}
function strip(list,x,y,w,h){const n=list.length,gp=clamp(w*.02,10,20),cw=Math.min((w-gp*(n-1))/n,h),tot=cw*n+gp*(n-1);let px=x+(w+tot)/2;return list.map(p=>{px-=cw;const e=small(p,px,y,cw,h);px-=gp;return e;});}
function plan(P,lay,w,h,x,y){const n=P.length,mi=mainIx(P),M=P[mi],O=P.filter((_,i)=>i!==mi),K=1.02;if(n===1)return[slot(M,x+w*.15,y,w*.7,h,K,1)];
  const mid=(a)=>{const r=a.slice(),i=Math.floor(r.length/2);r.splice(i,0,M);return{l:r,i};};
  if(lay==='row'||n===2){if(n<=5){const{l,i}=mid(O);return rowCells(l,i,x,y,w,h,K);}const a=Math.ceil(n/2)-1,top=mid(O.slice(0,a)),gp=20,r1=h*.56;return[...rowCells(top.l,top.i,x,y,w,r1-gp/2,K),...rowCells(O.slice(a),-1,x,y+r1+gp/2,w,h-r1-gp/2,K)];}
  if(lay==='top'){const r1=h*.6,gp=18;return[slot(M,x+w*.2,y,w*.6,r1-gp/2,K,1),...strip(O,x,y+r1+gp/2,w,h-r1-gp/2)];}
  if(lay==='mosaic'){const mw=w*.44,gp=14,lw=w-mw-gp*2,m=O.length;let cols=1,t=0;for(let k=1;k<=m;k++){const r=Math.ceil(m/k),q=Math.min((lw-gp*(k-1))/k,(h-gp*(r-1))/r);if(q>t){t=q;cols=k;}}   // عدد الأعمدة اللي يعطي أكبر صور
    const rows=Math.ceil(m/cols),gw=cols*t+gp*(cols-1),gh=rows*t+gp*(rows-1),x0=x+(lw+gw)/2,y0=y+(h-gh)/2;return[slot(M,x+w-mw,y,mw,h,K,1),...O.map((p,i)=>{const r=Math.floor(i/cols),q=i%cols;return{p,x:x0-t*(q+1)-gp*q,y:y0+r*(t+gp),w:t,h:t,ov:1};})];}
  // الجناحان: الرئيسية بالوسط والبقية موزعة يمين ويسار
  const mw=Math.min(w*.42,h*.86),gp=24,sw=(w-mw-2*gp)/2,R=O.filter((_,i)=>i%2===0),L=O.filter((_,i)=>i%2),col=(a,cx)=>{const k=a.length,ch=(h-16*(k-1))/k;return a.map((p,i)=>small(p,cx,y+i*(ch+16),sw,ch));};
  return[slot(M,x+sw+gp,y,mw,h,K,1),...col(R,x+w-sw),...col(L,x)];}
function Gallery(T,P,lay,H0,o={}){if(!P.length)return null;return{lay(sc,w){const h=H0*Math.min(sc,1);return{h,gap:(o.gap??16)*sc,flex:1,d(x,y,W2){const cells=plan(P,lay,W2,h,x,y);cells.forEach(e=>{tileR(T,e);capD(T,e,e.main?1.06:1);});}};}};}

// ===== نص تبرز فيه الأسماء: كل فقرة مجموعة قطع تلتف كلمة كلمة =====
const toks=a=>{const out=[];a.forEach(r=>{String(r.t).replace(/ *\/ */g,m=>m.replace(/ /g,' ')).split(/[ \t\r\n]+/).filter(Boolean).forEach(w=>out.push({w,hi:r.hi,ph:isPh(r.t),glue:/^[،.:؛]/.test(w)}));});return out;};
function Rich(T,paras,ty,o={}){const P=paras.filter(p=>p&&p.length);if(!P.length)return null;const fb=ty.b,fh=ty.h,pg=ty.pg??16;
  return{lay(sc,w){const mw=w,sz=fb.s*sc,hz=sz*(ty.hk||1.32),sp=sz*.3,F1=font(fb.w,sz,fb.f),F2=font(fh.w,hz,fh.f),g=G();
    const wd=t=>{g.font=t.hi?F2:F1;return tw(t.w);},wrap=(T0,lim)=>{const L=[];let c=[],cw=0;T0.forEach(t=>{const a=wd(t),add=(c.length&&!t.glue?sp:0)+a;if(cw+add>lim&&c.length&&!t.glue){L.push({t:c,w:cw});c=[t];cw=a;}else{c.push(t);cw+=add;}});if(c.length)L.push({t:c,w:cw});return L;};
    const lines=[];P.forEach((p,i)=>{const T0=toks(p);let L=wrap(T0,mw);if(L.length>1){let lo=mw*.5,hi=mw;for(let k=0;k<6;k++){const m=(lo+hi)/2,q=wrap(T0,m);if(q.length<=L.length&&q.every(l=>l.w<=m+.5)){L=q;hi=m;}else lo=m;}}L.forEach((l,j)=>{const big=l.t.some(t=>t.hi);lines.push({...l,h:(big?hz*1.5:sz*1.62),pg:j===0&&i?pg*sc:0});});});
    const h=lines.reduce((a,l)=>a+l.h+l.pg,0);
    return{h,gap:(o.gap??14)*sc,flex:o.flex??.8,d(x,y,W2,al){let yy=y;g.save();g.textAlign='right';g.textBaseline='middle';lines.forEach(l=>{yy+=l.pg;let px=al==='right'?x+W2:x+(W2+l.w)/2;const cy=yy+l.h/2;l.t.forEach((t,i)=>{if(i&&!t.glue)px-=sp;g.font=t.hi?F2:F1;g.globalAlpha=t.ph?.62:1;if(T.dark&&t.hi)shOn('rgba(0,0,0,.5)',8,2);g.fillStyle=t.hi?(!T.patA?T.ink:T.dark?goldV(T,cy-hz*.6,cy+hz*.5):T.goldC):!T.patA?T.soft:T.ink;g.fillText(t.w,px,cy);shOff();px-=tw(t.w);});yy+=l.h;});g.restore();}};}};}
// التنويه: عنوان بارز ونص، والباركود بجانبه
function Note(T,runs,label,url,ty){const has=runs&&runs.length;let q=null;if(url&&window.qrcode){try{q=qrcode(0,'M');q.addData(url);q.make();}catch(e){q=null;}}if(!has&&!q)return null;
  const body=has?Rich(T,[[{t:label,hi:1},...runs]],{...ty,hk:1.04,b:{...ty.b,s:ty.b.s*.88}},{gap:0}):null;
  return{lay(sc,w){const g=G(),s=q?112*sc:0,pad=(q?34:0)*sc,b=body?body.lay(sc,w-s-pad):null,h=Math.max(b?b.h:0,q?s+18*sc:0);
    return{h,gap:14*sc,flex:.8,d(x,y,W2,al){if(b)b.d(x+s+pad,y+(h-b.h)/2,W2-s-pad,al);if(q){const n=q.getModuleCount(),c=s/n,qx=x+6*sc,qy=y+(h-s)/2;g.save();g.fillStyle='#fff';g.strokeStyle=T.goldB;g.lineWidth=2;g.beginPath();g.roundRect(qx-7*sc,qy-7*sc,s+14*sc,s+14*sc,10*sc);g.fill();g.stroke();g.fillStyle='#17132f';for(let r=0;r<n;r++)for(let k=0;k<n;k++)if(q.isDark(r,k))g.fillRect(qx+k*c,qy+r*c,c+.3,c+.3);g.restore();}}};}};}

const TYP={b:{f:F.mes,w:600,s:38},h:{f:F.cairo,w:800},hk:1.3,pg:12};
// قلب التصميم: رأس، صور تأخذ ما يتبقى من المساحة، ثم النص
function content(c,T,box,o={}){const d=c.doc.pro,n=c.P.length,w=box.w,lay=c.lay||defLay(n),hc=T.patA?'gold':'ink';
  const head=[o.head===0||!d.head?null:Bism(T,{s:by(c,106,88,132),cap:by(c,430,360,520),gap:0,col:hc}),o.verse===0||!d.verse?null:Tx(T,d.verse,{f:F.bism,w:400,s:by(c,74,62,92),min:40,col:hc,lines:1,lh:1.7,gap:2,flex:.3}),d.kick?Tx(T,d.kick,{f:F.ruqaa,w:700,s:by(c,76,62,92),min:40,col:'gold',lines:2,lh:1.34,gap:6}):null];
  const tail=[d.capt&&n?Tx(T,d.capt,{f:F.cairo,w:700,s:25,min:17,col:'ink',lines:2,lh:1.4,gap:8,flex:.2}):null,Rich(T,d.paras,TYP),Note(T,d.note,d.noteL||'تنويه:',d.note&&d.note.length?d.qr:'',TYP),d.verse2?Tx(T,d.verse2,{f:F.bism,w:400,s:38,min:24,col:hc,lines:2,lh:1.8,gap:12}):null,!(d.note&&d.note.length)&&d.qr?QR(T,d.qr):null,d.close?Tx(T,d.close,{f:F.mes,w:700,s:33,min:21,col:!T.patA?'soft':T.dark?'gold':'accD',lines:2,lh:1.5,gap:12}):null,d.sign?Tx(T,d.sign,{f:F.cairo,w:700,s:27,min:19,col:'soft',lines:2,lh:1.45,gap:10}):null];
  const measure=sc=>[...head,...tail].filter(Boolean).map(i=>i.lay(sc,w)).filter(Boolean).reduce((a,l,i)=>a+l.h+(i?l.gap:0),0);
  // الصور لها حد أدنى يضمن وضوحها، والنص يتكيف مع الباقي
  const many=n>5,hmin=n?by(c,many?520:430,many?400:320,many?760:600):0,hmax=n?by(c,many?660:560,many?480:400,many?980:820):0,gH=n?clamp(box.h-measure(1)-40,hmin,hmax):0;
  const hh=head.filter(Boolean).map(i=>i.lay(1,w)).filter(Boolean).reduce((a,l)=>a+l.h+l.gap,0),pad=o.minHead&&o.minHead>hh?X.Sp(o.minHead-hh):null,gal=n?Gallery(T,c.P,lay,gH):null,items=[...head,pad,gal,...tail];
  return stack(items,box,{max:n?1.08:by(c,1.32,1.2,1.5),min:.5,spread:by(c,26,14,46),va:.42,...o.st});}

// ===== التصاميم =====
function silkDesign(c){const{W,H,D:T}=c,g=G(),m=by(c,34,30,38);silk(T,W,H);sweep(T,W,H);frame(T,W,H,m);pennant(c,T,by(c,150,140,166),by(c,132,112,152),by(c,186,150,218));
  const barY=H-m-by(c,14,12,18),top=m+by(c,28,20,46);content(c,T,{x:m+50,y:top,w:W-2*(m+50),h:barY-by(c,46,42,52)-top},{minHead:by(c,186,150,218)-top+14});bar(c,T,barY);}
function archDesign(c){const{W,H,D,L}=c,g=G(),T=L,mx=by(c,50,46,54),r=by(c,62,50,78),A=r+by(c,22,18,34),s=by(c,190,130,270),Bm=H-by(c,92,84,108);silk(D,W,H);
  g.save();shOn('rgba(0,0,0,.5)',44,16);g.beginPath();archPath(mx,A,W-mx,Bm,s,.2,.24);const pg=g.createLinearGradient(0,A,0,Bm);pg.addColorStop(0,L.bg0);pg.addColorStop(1,L.bg1);g.fillStyle=pg;g.fill();g.restore();
  g.save();g.beginPath();archPath(mx,A,W-mx,Bm,s,.2,.24);g.clip();g.drawImage(silkCanvas(L,W,H),0,0,W,H);g.restore();
  g.strokeStyle=goldG(D,0,A,W,Bm);g.lineWidth=3.4;g.beginPath();archPath(mx,A,W-mx,Bm,s,.2,.24);g.stroke();g.save();g.globalAlpha=.6;g.lineWidth=1;g.strokeStyle=L.goldB;g.beginPath();archPath(mx+13,A+22,W-mx-13,Bm-13,s-8,.2,.24);g.stroke();g.restore();
  medal(D,W/2,A+4,r);const top=A+r+by(c,18,12,30);content(c,T,{x:mx+50,y:top,w:W-2*(mx+50),h:Bm-34-top});bar(c,D,H-by(c,46,42,54));}
function ivoryDesign(c){const{W,H,D,L,doc}=c,g=G(),T=L,d=doc.pro,two=!!d.verse,bh=by(c,two?270:190,two?226:160,two?340:250),r=by(c,54,44,66);silk(L,W,H);
  const wave=(y0)=>{g.beginPath();g.moveTo(0,0);g.lineTo(W,0);g.lineTo(W,y0-34);g.bezierCurveTo(W*.74,y0+36,W*.26,y0+36,0,y0-34);g.closePath();};
  g.save();shOn('rgba(0,0,0,.35)',26,10);wave(bh);g.fillStyle=D.bg1;g.fill();g.restore();g.save();wave(bh);g.clip();g.drawImage(silkCanvas(D,W,H),0,0,W,H);g.restore();
  g.strokeStyle=goldG(D,0,0,W,0);g.lineWidth=5;g.beginPath();g.moveTo(W,bh-34);g.bezierCurveTo(W*.74,bh+36,W*.26,bh+36,0,bh-34);g.stroke();
  drawLogoTag(D,W,by(c,84,76,96));
  stack([Bism(D,{s:by(c,100,84,120),cap:by(c,420,350,500),gap:0,col:D.patA?'gold':'ink'}),two?Tx(D,d.verse,{f:F.bism,w:400,s:by(c,68,56,84),min:38,col:D.patA?'gold':'ink',lines:1,lh:1.7,gap:0}):null],{x:190,y:by(c,14,10,22),w:W-380,h:bh-by(c,24,22,32)},{max:1,min:.6,spread:6,va:.5});
  const fy=H-by(c,92,84,106);g.save();g.fillStyle=D.bg1;g.fillRect(0,fy,W,H-fy);g.beginPath();g.rect(0,fy,W,H-fy);g.clip();g.drawImage(silkCanvas(D,W,H),0,0,W,H);g.restore();g.fillStyle=goldG(D,0,fy,W,fy);g.fillRect(0,fy-2,W,4);
  keyline(L,24,bh+34,W-48,fy-bh-58,1.2,.55);const top=bh+by(c,44,36,64);content(c,T,{x:84,y:top,w:W-168,h:fy-26-top},{head:0,verse:0});bar(c,D,(fy+H)/2);}
function drawLogoTag(T,W,r){medal(T,r+24,r+14,r*.86);}

// ===== جدول المناسبات =====
const QC=new Map();
function qrOf(u){if(!u||!window.qrcode)return null;let q=QC.get(u);if(q===undefined){try{q=qrcode(0,'L');q.addData(u);q.make();}catch(e){q=null;}if(QC.size>200)QC.clear();QC.set(u,q);}return q;}
function rings(T,cx,cy,r){const g=G();g.save();g.lineWidth=r*.2;g.strokeStyle=goldG(T,cx-r*2,cy-r,cx+r*2,cy+r);g.beginPath();g.arc(cx-r*.5,cy+r*.1,r*.8,0,7);g.stroke();g.beginPath();g.arc(cx+r*.5,cy+r*.1,r*.8,0,7);g.stroke();g.fillStyle=T.goldA;diamond(cx+r*.5,cy-r*.8,r*.3,r*.3);g.fill();g.restore();}
function typeIcon(T,t,cx,cy,r){const g=G();if(/زواج|قران|ملكة|زفاف/.test(t))return rings(T,cx,cy,r);g.save();g.fillStyle=goldG(T,cx-r,cy-r,cx+r,cy+r);star8(cx,cy,r*1.15,.48);g.fill();g.restore();}
function cellText(t,x,y,w,h,st,col){const g=G(),r=fit(t,st,1,w),lh=r.fs*(st.lh||1.24);g.font=font(st.w,r.fs,st.f);g.fillStyle=col;let yy=y+(h-r.L.length*lh)/2;r.L.forEach(l=>{g.fillText(l,x+w/2,yy+lh/2,w);yy+=lh;});}
function schedule(c,dark){const{W,H,D,L,doc}=c,g=G(),T=dark?D:L,s=doc.sch,rows=s.rows,m=by(c,28,24,32);silk(T,W,H);frame(T,W,H,m,{n:22});pennant(c,dark?D:D,by(c,122,112,132),by(c,112,96,128),by(c,160,132,190));
  // الرأس
  const hT=by(c,262,192,318);stack([Bism(T,{s:by(c,84,66,104),cap:by(c,330,270,400),gap:0,col:dark?0:'gold'}),Tx(T,s.title,{f:F.cairo,w:900,s:by(c,66,50,80),min:36,lines:1,col:'gold',lh:1.36,gap:0}),Tx(T,s.sub,{f:F.cairo,w:800,s:by(c,37,29,44),min:22,lines:1,col:dark?'ink':T.ink,lh:1.42,gap:0})],{x:210,y:m+14,w:W-420,h:hT-m-14},{max:1,min:.6,spread:6,va:.5});
  // الصفحات: عدد الصفوف حسب المساحة، وإذا زادت تتوزع بالتساوي
  const tx=m+30,tw0=W-2*tx,hdrH=by(c,44,38,50),barH=by(c,70,62,80),foH=by(c,180,104,226),tTop=hT+6,tBody=tTop+hdrH+6,avail=H-tBody-foH-barH-m+4,minH=by(c,54,50,56),maxH=by(c,84,72,104),cap=Math.max(3,Math.floor(avail/minH)),n=rows.length,pages=Math.max(1,Math.ceil(n/cap)),per=Math.ceil(n/pages),rowH=Math.min(avail/Math.max(per,1),maxH);
  c.rep.pages=pages;const pg=clamp(c.page|0,0,pages-1),part=rows.slice(pg*per,pg*per+per);
  if(pages>1){g.save();g.font=font(800,by(c,22,20,26),F.cairo);const t=`الصفحة ${ar(pg+1)} من ${ar(pages)}`,pw=tw(t)+40,ph=by(c,40,36,46),px=W-m-44-pw,py=m+24;g.fillStyle=goldG(D,px,0,px+pw,0);g.beginPath();g.roundRect(px,py,pw,ph,ph/2);g.fill();g.fillStyle='#231a08';g.textAlign='center';g.textBaseline='middle';g.fillText(t,px+pw/2,py+ph/2+1);g.restore();}
  const hasQ=rows.some(r=>r.map),cols=hasQ?[['م',.05],['الرمز',.062],['اسم الداعي',.27],['نوع المناسبة',.098],['التاريخ',.165],['الوقت',.082],['المكان',.195],['لوكيشن',.078]]:[['م',.052],['الرمز',.066],['اسم الداعي',.302],['نوع المناسبة',.105],['التاريخ',.17],['الوقت',.085],['المكان',.22]],gp=5;
  let px=tx+tw0;const X0=cols.map(([t,f])=>{const w=f*tw0;px-=w;return{t,x:px+gp/2,w:w-gp};});
  g.save();g.textAlign='center';g.textBaseline='middle';const ink=T.ink;
  X0.forEach(k=>{g.fillStyle=dark?goldG(D,k.x,0,k.x+k.w,0):D.bg1;g.beginPath();g.roundRect(k.x,tTop,k.w,hdrH,8);g.fill();g.font=font(800,by(c,21,19,24),F.cairo);g.fillStyle=dark?'#231a08':D.goldA;g.fillText(k.t,k.x+k.w/2,tTop+hdrH/2+1,k.w-6);g.fillStyle=dark?D.goldB:D.bg1;g.beginPath();g.moveTo(k.x+k.w/2-7,tTop+hdrH-1);g.lineTo(k.x+k.w/2+7,tTop+hdrH-1);g.lineTo(k.x+k.w/2,tTop+hdrH+6);g.closePath();g.fill();});
  const fs=clamp(rowH*.36,19,27);
  part.forEach((r,i)=>{const y=tBody+i*rowH+3,h=rowH-5,idx=pg*per+i;const tint=dark?(i%2?'rgba(255,255,255,.06)':'rgba(255,255,255,.11)'):(i%2?'rgba(255,253,247,.92)':'rgba(233,221,195,.82)');
    X0.forEach((k,j)=>{const lbl=k.t;if(lbl==='م'){g.fillStyle=dark?goldG(D,k.x,0,k.x+k.w,0):D.bg1;g.beginPath();g.roundRect(k.x,y,k.w,h,7);g.fill();g.font=font(900,clamp(rowH*.46,20,34),F.cairo);g.fillStyle=dark?'#231a08':'#fff';g.fillText(ar(idx+1),k.x+k.w/2,y+h/2+1);return;}
      if(lbl==='الوقت'){g.fillStyle=dark?'rgba(0,0,0,.28)':D.bg0;g.beginPath();g.roundRect(k.x,y,k.w,h,7);g.fill();cellText(r.time||'',k.x+3,y,k.w-6,h,{f:F.cairo,w:800,s:fs,min:14,lines:1},dark?D.goldA:'#fff');return;}
      g.fillStyle=tint;g.beginPath();g.roundRect(k.x,y,k.w,h,7);g.fill();
      if(lbl==='الرمز'){typeIcon(dark?D:{...L,goldA:'#c4913f'},r.type||'',k.x+k.w/2,y+h/2,clamp(rowH*.2,10,17));return;}
      if(lbl==='لوكيشن'){const q=qrOf(r.map);if(q){const sz=h-8,nn=q.getModuleCount(),cc=sz/nn,qx=k.x+(k.w-sz)/2,qy=y+4;g.fillStyle='#fff';g.fillRect(qx-2,qy-2,sz+4,sz+4);g.fillStyle='#17132f';for(let a=0;a<nn;a++)for(let b=0;b<nn;b++)if(q.isDark(a,b))g.fillRect(qx+b*cc,qy+a*cc,cc+.3,cc+.3);}return;}
      const st={f:F.cairo,w:lbl==='اسم الداعي'?800:700,s:fs,min:14,lines:2,lh:1.26};
      if(lbl==='التاريخ'){const hh=h/2;g.font=font(800,clamp(fs*.9,15,24),F.cairo);g.fillStyle=ink;g.fillText(r.hijri||'',k.x+k.w/2,y+hh*.58,k.w-8);g.fillText(r.greg||'',k.x+k.w/2,y+hh*1.42,k.w-8);return;}
      cellText(lbl==='اسم الداعي'?r.host||'':lbl==='نوع المناسبة'?r.type||'':r.place||'',k.x+6,y,k.w-12,h,st,ink);});});
  g.restore();
  // الذيل
  const fy=H-m-barH-foH+8,fh=foH-14,rw=tw0*.37,lw=tw0*.4,ty={b:{f:F.cairo,w:700,s:by(c,27,21,33)},h:{f:F.cairo,w:900},hk:1.1,pg:2};
  stack([Rich(T,[[{t:'تنويه:',hi:1},{t:s.noteT}]],ty,{gap:0}),s.phone?Tx(T,s.phone,{f:F.cairo,w:900,s:by(c,46,32,58),min:24,lines:1,col:dark?'gold':T.ink,lh:1.3,gap:4}):null],{x:tx+tw0-rw,y:fy,w:rw,h:fh},{max:1,min:.6,spread:6,va:.5});
  stack([s.by?Rich(T,[[{t:'إعداد:',hi:1},{t:s.by,hi:1}]],{...ty,b:{...ty.b,s:ty.b.s*.96}},{gap:0}):null,s.byRole?Tx(T,s.byRole,{f:F.mes,w:600,s:by(c,25,20,30),min:17,lines:1,col:'soft',lh:1.4,gap:2}):null,s.bySite?Tx(T,s.bySite,{f:F.cairo,w:800,s:by(c,25,20,30),min:17,lines:1,col:dark?'gold':T.ink,lh:1.4,gap:2}):null],{x:tx,y:fy,w:lw,h:fh},{max:1,min:.6,spread:6,va:.5});
  if(s.cheer){const cx=tx+lw+(tw0-rw-lw)/2;stack([Tx(T,s.cheer,{f:F.ruqaa,w:700,s:by(c,60,42,72),min:28,lines:2,col:'gold',lh:1.25})],{x:cx-(tw0-rw-lw)/2+6,y:fy,w:tw0-rw-lw-12,h:fh},{max:1,min:.6,va:.5});}
  bar(c,dark?D:D,H-m-barH/2+2,{w:tw0-20,h:by(c,54,48,60)});}

// ===== شريط التذكير: يختلف تماماً عن شكل التاريخ =====
const WHEN={today:'اليوم',tomorrow:'غداً',after:'بعد غد'};
const ribbonH=size=>size==='story'?196:size==='square'?126:150;
function bell(cx,cy,r,col){const g=G();g.save();g.fillStyle=col;g.beginPath();g.moveTo(cx-r*.82,cy+r*.5);g.quadraticCurveTo(cx-r*.5,cy+r*.1,cx-r*.56,cy-r*.3);g.quadraticCurveTo(cx-r*.5,cy-r*.9,cx,cy-r*.9);g.quadraticCurveTo(cx+r*.5,cy-r*.9,cx+r*.56,cy-r*.3);g.quadraticCurveTo(cx+r*.5,cy+r*.1,cx+r*.82,cy+r*.5);g.closePath();g.fill();g.beginPath();g.arc(cx,cy+r*.66,r*.2,0,7);g.fill();g.restore();}
function ribbon(W,h,pal,rem){const g=G(),D=pal.D,ink='#20150a',r=g.createLinearGradient(0,0,W,0);r.addColorStop(0,'#c9973f');r.addColorStop(.28,'#fbe6ad');r.addColorStop(.52,'#f0c76d');r.addColorStop(.78,'#fdeab8');r.addColorStop(1,'#c9973f');g.fillStyle=r;g.fillRect(0,0,W,h);g.fillStyle=ink;g.fillRect(0,h-7,W,7);g.fillStyle='#fbe6ad';g.fillRect(0,h-3,W,3);
  const when=WHEN[rem.when]||'',main=[when,String(rem.what||'').trim()].filter(Boolean).join(' '),lab='تذكير',fs0=h*.5;g.save();g.textBaseline='middle';g.textAlign='center';
  g.font=font(900,h*.31,F.cairo);const lw=tw(lab),chipW=lw+h*.74,chipH=h*.6,avail=W-96-chipW-h*.24;let fs=fs0;g.font=font(900,fs,F.cairo);while(tw(main)>avail&&fs>h*.24){fs-=1;g.font=font(900,fs,F.cairo);}const mw=tw(main),tot=chipW+h*.24+mw,x1=(W+tot)/2,cy=(h-7)/2;
  g.fillStyle=ink;g.beginPath();g.roundRect(x1-chipW,cy-chipH/2,chipW,chipH,chipH/2);g.fill();bell(x1-h*.27,cy-h*.01,h*.13,'#fbe6ad');g.font=font(900,h*.31,F.cairo);g.fillStyle='#fbe6ad';g.fillText(lab,x1-chipW+(chipW-h*.32)/2,cy+h*.012);
  g.font=font(900,fs,F.cairo);g.fillStyle=ink;g.textAlign='right';g.fillText(main,x1-chipW-h*.24,cy+h*.015);g.restore();}

window.OCC_PRO={ribbon,ribbonH,defLay,LAYS:[['row','صف واحد'],['wings','جناحان'],['top','الرئيسية فوق'],['mosaic','فسيفساء']]};
const D=window.OCC_DESIGNS,THREE=[['silk','الحرير الفاخر','طيات حرير وإطار ذهبي',silkDesign,1],['arch','المحراب المضيء','محراب فاتح على حرير',archDesign,1],['ivory','الرأس الملكي','رأس منحني وورق عاجي',ivoryDesign,1]];
['wedding','condolence','graduate','general'].forEach(id=>D[id].unshift(...THREE));
D.qiran=THREE;D.promo=THREE;
D.schedule=[['regal','الجدول الملكي','ورق عاجي وصفوف واضحة',c=>schedule(c,0),1],['night','الجدول الليلي','خلفية داكنة وذهب',c=>schedule(c,1),1]];
})();
