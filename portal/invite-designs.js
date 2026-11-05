/* التصاميم: كل تصميم تركيب مستقل. c={W,H,sq,st,T,D,L,doc,P,pal} */
(function(){
'use strict';
const X=window.OCC_ENGINE,{F,TY,E,big,flat,rgba,goldV,goldG,fadeLine,fadeLineV,star8,star4,diamond,archPath,patFill,grain,bgRadial,bgLin,vign,shOn,shOff,keyline,frameStars,ornament,corners,drawLogo,seal,photo,tile,Tx,Pair,B,Sp,Bism,Pill,Orn,Grid,List,QR,PRow,Col,Split,stack,seqItems,headItem,afterItems,factsItem,flow,flowFit,photoCol,foot,font,tw,fit}=X;
const G=()=>X.ctx();
const by=(c,post,sq,st)=>c.sq?sq:c.st?st:post;
// المقياس الأعلى: النص القصير يكبر ويملأ، والطويل يصغر لين يدخل
const UP=c=>by(c,1.45,1.2,1.7);

// صف صور ملتصقة بعرض الصفحة، والتعريف فوق الصورة
function band(c,T,y,h,o={}){const g=G(),{W,P}=c,n=P.length,s=Math.min(h,W/n),tot=s*n,x0=(W-tot)/2;
  bgLin(c.D,0,y,W,h);patFill(c.D,0,y,W,h,72,.14,1);
  P.forEach((p,i)=>{const x=x0+tot-s*(i+1);photo(p,x,y,s);if(p.name||p.role){const r=g.createLinearGradient(0,y+s*.55,0,y+s);r.addColorStop(0,'rgba(8,6,24,0)');r.addColorStop(1,'rgba(8,6,24,.86)');g.fillStyle=r;g.fillRect(x,y+s*.55,s,s*.45);g.save();g.textAlign='center';g.textBaseline='middle';const mw=s-20;
      const nm=p.name?fit(p.name,{f:F.mes,w:700,s:s>300?25:21,min:15,lines:2,lh:1.25},1,mw):null,lh=nm?nm.fs*1.25:0;let yy=y+s-14-(nm?nm.L.length*lh:0);if(p.role){g.font=font(700,20,F.cairo);g.fillStyle=c.D.goldA;g.fillText(p.role,x+s/2,yy-14,mw);}
      if(nm){g.font=font(700,nm.fs,F.mes);g.fillStyle='#fff';nm.L.forEach(l=>{g.fillText(l,x+s/2,yy+lh/2,mw);yy+=lh;});}g.restore();}
    if(i){g.fillStyle=goldG(c.D,x+s-1.5,y,x+s+1.5,y+h);g.fillRect(x+s-1.5,y,3,s);}});
  for(const yy of[y,y+h]){if(o.top===0&&yy===y)continue;g.fillStyle=goldG(c.D,0,yy,W,yy);g.fillRect(0,yy-1.5,W,3);}
  if(n&&tot<W-2)for(const x of[x0,x0+tot]){g.fillStyle=goldG(c.D,x,y,x,y+h);g.fillRect(x-1.5,y,3,h);}}

// ================= دعوة زواج =================
function archFrame(c,T,r,s){const g=G(),{W,H}=c,cx=W/2,L=58,R=W-58,A=38+r+16,Bm=H-58;frameStars(T,W,H);
  g.save();g.beginPath();g.rect(39.5,39.5,W-79,A+s-38);archPath(L,A,R,A+s+1.5,s,.2,.24);g.clip('evenodd');g.fillStyle=T.dark?'rgba(0,0,0,.22)':'rgba(168,115,44,.07)';g.fillRect(0,0,W,A+s+10);patFill(T,0,0,W,A+s+40,46,T.dark?.2:.26,1);g.restore();
  g.strokeStyle=goldG(T,0,A,W,Bm);g.lineWidth=2.4;g.beginPath();archPath(L,A,R,Bm,s,.2,.24);g.stroke();g.save();g.globalAlpha=.5;g.lineWidth=1;g.strokeStyle=T.goldB;g.beginPath();archPath(L+11,A+16,R-11,Bm-11,s-6,.2,.24);g.stroke();g.restore();
  for(const[x,y]of[[cx,Bm],[cx,H-38]]){g.fillStyle=goldG(T,x-12,y-12,x+12,y+12);diamond(x,y,9,9);g.fill();g.fillStyle=T.bg1;diamond(x,y,3.5,3.5);g.fill();}
  seal(T,cx,A,r);return{A,Bm};}
const wed={
 royal(c){const{W,H,T}=c,r=by(c,50,40,66),s=by(c,330,210,470);bgRadial(T,W,H);patFill(T,0,0,W,H,108,T.patA*1.1);grain(W,H,.05);vign(T,W,H);const{A,Bm}=archFrame(c,T,r,s);
   const top=A+r+(c.st?36:20);stack(flowFit(c,T,TY.classic,{bism:{cap:by(c,300,280,400),s:by(c,120,100,160)}}),{x:130,y:top,w:W-260,h:Bm-62-top},{max:by(c,1,.9,1.18),min:.45});foot(c,T,Bm-30);},
 ivoryBand(c){const{W,H,L,P}=c,g=G(),bh=P.length?Math.min(W/Math.max(P.length,1),by(c,P.length===3?360:400,P.length===3?300:320,520)):by(c,190,150,270);bgRadial(L,W,H,.6);grain(W,H,.05);band(c,L,0,bh,{top:0});
   if(!P.length){seal(c.D,W/2,bh,by(c,62,50,80));}
   const y0=bh+(P.length?30:84);keyline(L,30,bh+22,W-60,H-bh-52,1.2,.6);stack(flow(c,L,TY.naskh,{bism:{s:by(c,96,76,130),cap:300}}),{x:96,y:y0,w:W-192,h:H-y0-84},{max:by(c,1,.86,1.2),min:.45,spread:30});foot(c,L,H-54);},
 side(c){const{W,H,L,D,P,doc}=c,g=G(),pw=Math.round(W*.37),m=44;bgRadial(L,W,H,.45);grain(W,H,.05);const px=W-pw;bgLin(D,px,0,pw,H);patFill(D,px,0,pw,H,72,.16,1);g.fillStyle=goldG(D,px,0,px,H);g.fillRect(px-2,0,4,H);keyline(D,px+18,18,pw-36,H-36,1,.55);
   const ty={...TY.naskh,hero:{...TY.naskh.hero,s:54}};
   if(P.length){const cw=pw-2*m-10,n=P.length;stack([P.length?Sp(0):null,...P.map((p,i)=>PRow(D,[p],{s:n===1?cw:Math.min(cw,by(c,n===3?236:280,n===3?180:230,n===3?320:380)),gap:i?by(c,12,8,22):0,mat:7}))],{x:px+m-10,y:44,w:pw-2*m+20,h:H-88},{max:by(c,.96,.78,1.2),min:.4,va:.5,spread:40});}
   else{const cy=H*.42;seal(D,px+pw/2,cy-120,84);stack([Tx(D,doc.kick,{f:F.ruqaa,w:700,s:62,col:'gold',lines:2,lh:1.4,min:38}),Orn(D,'star',{w:240,gap:16})],{x:px+m,y:cy-10,w:pw-2*m,h:220},{va:0});}
   const x=56,w=px-x-44;stack([Bism(L,{s:by(c,92,74,120),cap:290,col:'gold'}),P.length?Tx(L,doc.kick,TY.naskh.kick):null,Pill(L,doc.remind),...seqItems(L,doc.seq,ty),List(L,doc.facts,{vf:F.amiri,lf:F.cairo,ls:22,vs:31,gap:22,pad:9,lc:'accD'}),...afterItems(L,doc,TY.naskh)],{x,y:54,w,h:H-54-86},{max:by(c,1,.8,1.22),min:.45,spread:40});foot(c,L,H-46,{cx:x+w/2,s:19});},
 card(c){const{W,H,D,L,P,doc}=c,g=G();bgRadial(D,W,H,.5);patFill(D,0,0,W,H,54,.3,1);grain(W,H,.05);vign(D,W,H,.5);
   const cxm=by(c,62,50,62),rs=by(c,1,.72,1.2),row=P.length?PRow(L,P,{s:P.length===3?190:215,gapx:30,mat:8,gap:0}).lay(rs,W-2*cxm-60):null,tileH=row?(P.length===3?190*1.17:215)*Math.min(rs,1)*.5+6:0,y0=by(c,52,44,66)+tileH+(P.length?0:48),cw=W-2*cxm,yb=H-cxm+8;
   g.save();shOn('rgba(0,0,0,.55)',46,16);g.fillStyle=L.bg0;g.fillRect(cxm,y0,cw,yb-y0);g.restore();const pg=g.createLinearGradient(0,y0,0,yb);pg.addColorStop(0,L.bg0);pg.addColorStop(1,L.bg1);g.fillStyle=pg;g.fillRect(cxm,y0,cw,yb-y0);keyline(L,cxm+13,y0+13,cw-26,yb-y0-26,1.2,.75);
   const fx=Grid(D,doc.facts,{ls:21,vs:31,line:'none',pad:12,gap:0}),fl=fx?fx.lay(by(c,1,.82,1.2),cw-26-40):null,fh=fl?fl.h+8:0,fy=yb-13-fh;
   if(fl){bgLin(D,cxm+13,fy,cw-26,fh);patFill(D,cxm+13,fy,cw-26,fh,54,.12,1);g.fillStyle=goldG(D,0,fy,W,fy);g.fillRect(cxm+13,fy-1.5,cw-26,3);fl.d(cxm+33,fy+4,cw-66,'center');}
   let ys=y0+30;if(row){row.d(cxm+30,y0-tileH-8,cw-60,'center');ys=y0-tileH-8+row.h+10;}else seal(L,W/2,y0,by(c,60,48,76));
   const d={...doc,facts:[]},cc={...c,doc:d};stack(flow(cc,L,{...TY.classic,kick:{...TY.classic.kick,col:'accD'},host:{...TY.classic.host,col:'ink'},hero:{...TY.classic.hero,col:'accD',sh:0},hero2:{...TY.classic.hero2,col:'ink'},close:{...TY.classic.close,col:'accD'},body:{...TY.classic.body}},{bism:{s:by(c,96,78,130),cap:300},head:P.length&&c.sq?0:1}),{x:cxm+56,y:ys,w:cw-112,h:fy-ys-16},{max:by(c,1,.84,1.2),min:.34,spread:34});},
 poster(c){const{W,H,D,T,P,doc}=c,g=G();const S=D;bgLin(S,0,0,W,H,1);const gl=g.createRadialGradient(W*.85,H*.1,0,W*.85,H*.1,W);gl.addColorStop(0,rgba(S.pat,.2));gl.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gl;g.fillRect(0,0,W,H);grain(W,H,.05);
   g.fillStyle=goldG(S,0,0,0,H);g.fillRect(W-62,0,5,H);g.fillRect(W-46,0,1.4,H);for(let i=0;i<5;i++){g.fillStyle=S.goldB;diamond(W-59.5,H*.1+i*34,7,5);g.fill();}
   const x=70,w=W-70-96,ty={...TY.modern,lead:{...TY.modern.lead,lines:1},host:{...TY.modern.host,s:38,min:26,col:'soft'},hero:{...TY.modern.hero,s:66,min:38},body:{...TY.modern.body,s:26,min:20}},
   head=[Bism(S,{s:by(c,84,66,110),cap:260}),Tx(S,doc.kick,{f:F.ruqaa,w:700,s:by(c,160,116,190),min:70,col:'gold',lines:1,lh:1.28,gap:2,bal:0}),Pill(S,doc.remind,{gap:4})];
   const fx=Grid(S,doc.facts,{cols:2,line:'rows',al:'right',vf:F.mes,lf:F.cairo,ls:22,vs:33,pad:9,gap:22,lc:'acc'});
   if(c.sq&&P.length)stack([...head,Split(S,Col([...seqItems(S,doc.seq,ty),fx]),photoCol(S,P,{s:P.length===1?260:undefined}),{ratio:.66,ral:'right'}),...afterItems(S,doc,ty)],{x,y:56,w,h:H-56-74},{max:.9,min:.42,al:'right',spread:30});
   else stack([...head,...seqItems(S,doc.seq,ty),fx,P.length?PRow(S,P,{s:P.length===3?196:230,gapx:P.length===3?26:40,mid:0,gap:24}):null,...afterItems(S,doc,ty)],{x,y:60,w,h:H-60-74},{max:by(c,1,.9,1.2),min:.42,al:'right',spread:by(c,30,20,40)});
   foot(c,S,H-42,{cx:x+w/2});}
};

// ================= حالة وفاة =================
const sol=TY.solemn;
const mPhoto=(c,T,s)=>c.P.length?PRow(T,c.P,{s,gray:1,cap:0,plain:1,lw:1.2,gap:0}):null;
const listS=(T,o)=>({list:1,vf:F.amiri,vw:700,lf:F.amiri,ls:30,vs:36,pad:12,lc:'acc',...o});
const mou={
 calm(c){const{W,H,D:T,doc}=c,g=G();bgRadial(T,W,H,.4);grain(W,H,.035);keyline(T,44,44,W-88,H-88,1.2,.42);
   stack([mPhoto(c,T,by(c,220,170,300)),headItem(T,doc,sol),Sp(10,.6),...seqItems(T,doc.seq,sol),Orn(T,'rule',{w:300,gap:14}),factsItem(T,doc,listS(T,{gap:12,top:0})),...afterItems(T,doc,sol)],{x:120,y:86,w:W-240,h:H-86-104},{max:UP(c),min:.45,spread:by(c,26,14,46)});foot(c,T,H-74,{s:19});},
 paper(c){const{W,H,L:T,doc,P}=c,g=G();g.fillStyle=T.bg0;g.fillRect(0,0,W,H);grain(W,H,.04);g.strokeStyle=T.ink;g.lineWidth=16;g.strokeRect(36,36,W-72,H-72);keyline(T,58,58,W-116,H-116,1.4,1,T.ink);
   const ty={...sol,verse:{...sol.verse,col:'ink'},sub:{...sol.sub,col:'muted'},hero:{...sol.hero,s:70},close:{...sol.close,col:'ink'},quote:{...sol.quote,col:'ink'}},name=seqItems(T,doc.seq,ty);
   const top=[headItem(T,doc,ty),B(2,14,.4,(x,y,w)=>{const q=G();q.fillStyle=T.ink;q.fillRect(x+w/2-70,y,140,2);})];const main=P.length&&!c.st?Split(T,Col(name),mPhoto(c,T,by(c,240,190,290)),{ratio:.68,rule:0,gap:14,gapx:30}):Col([c.st?mPhoto(c,T,240):null,...name],{gap:14});
   stack([...top,main,Grid(T,doc.facts,{cols:2,lines:3,line:'box',fill:'rgba(0,0,0,.035)',lf:F.amiri,ls:25,vf:F.amiri,vs:31,pad:10,gap:24,cgap:12,rgap:12,lc:'muted',flex:1.5}),...afterItems(T,doc,ty)],{x:112,y:90,w:W-224,h:H-90-108},{max:UP(c),min:.42,spread:by(c,24,12,44)});foot(c,T,H-80,{s:19});},
 column(c){const{W,H,D:T,doc,P}=c,g=G(),rw=Math.round(W*.36),px=W-rw;g.fillStyle=T.bg1;g.fillRect(0,0,W,H);const r=g.createLinearGradient(px,0,W,0);r.addColorStop(0,T.bg0);r.addColorStop(1,T.bg0);g.fillStyle=r;g.fillRect(px,0,rw,H);grain(W,H,.035);g.fillStyle=rgba(T.pat,.5);g.fillRect(px,0,1.4,H);
   const vt=doc.head.t.split(' ');const verse=[Tx(T,vt.slice(0,2).join(' '),{...sol.verse,s:52,lines:1,col:'acc',gap:0}),Tx(T,vt.slice(2).join(' '),{...sol.verse,s:52,lines:2,col:'acc',gap:0})];
   stack([...verse,mPhoto(c,T,by(c,240,190,270))?Sp(30):null,mPhoto(c,T,by(c,240,190,270)),doc.verse2?Sp(30):null,doc.verse2?Tx(T,doc.verse2,{...sol.quote,s:32,min:22,lines:5,gap:0}):null],{x:px+36,y:90,w:rw-72,h:H-250},{max:UP(c),min:.5,va:by(c,.2,.12,.25),spread:30});drawLogo(px+rw/2,H-110,by(c,70,58,86),'#6f7471');
   const x=60,w=px-x-48,ty={...sol,hero:{...sol.hero,s:64,min:36,lines:3}},d={...doc,verse2:''};
   stack([...seqItems(T,doc.seq,ty),Orn(T,'rule',{gap:10}),factsItem(T,d,listS(T,{ls:25,vs:30,lines:3,gap:16,top:0})),...afterItems(T,d,sol)],{x,y:90,w,h:H-90-120},{max:UP(c),min:.42,al:'right',spread:by(c,24,12,44),va:.35});foot(c,T,H-64,{cx:x+w/2,s:19});},
 ribbon(c){const{W,H,D:T,L,doc,P}=c,g=G();bgRadial(T,W,H,.2);grain(W,H,.035);const ry=by(c,.28,.27,.27)*H,rh=by(c,.235,.27,.2)*H;g.fillStyle=L.bg0;g.fillRect(0,ry,W,rh);g.fillStyle=rgba(T.pat,.8);g.fillRect(0,ry-9,W,1.2);g.fillRect(0,ry+rh+8,W,1.2);
   const ty={...sol,hero:{...sol.hero,col:'ink'},sub:{...sol.sub,col:'accD'}},hs=doc.seq;
   stack([headItem(T,doc,sol),Tx(T,hs[0].t,sol.lead),Tx(T,hs[1].t,sol.lead)],{x:100,y:44,w:W-200,h:ry-44-26},{max:UP(c),min:.5,spread:20,va:.55});
   const nm=[Tx(L,hs[2].t,{...ty.hero,gap:0,lines:2}),Tx(L,hs[3].t,{...ty.sub,gap:0})];const ix=P.length?rh-44+40:0;if(P.length){const s=rh-44;photo(P[0],W-70-s,ry+22,s,{gray:1});keyline(L,W-70-s,ry+22,s,s,1.2,.8);}
   stack(nm,{x:70,y:ry+14,w:W-140-ix,h:rh-28},{max:UP(c),min:.45,va:.5,spread:10});
   const y0=ry+rh+by(c,36,26,60),d={...doc};stack([Grid(T,doc.facts,{cols:2,lines:3,line:'none',lf:F.amiri,ls:27,lc:'acc',vf:F.amiri,vs:31,pad:12,gap:0,flex:1,rgap:4}),...afterItems(T,d,sol)],{x:90,y:y0,w:W-180,h:H-y0-90},{max:UP(c),min:.42,spread:by(c,20,10,40),va:.4});foot(c,T,H-56,{s:19});},
 quiet(c){const{W,H,D:T,doc,P}=c,g=G();g.fillStyle=T.bg1;g.fillRect(0,0,W,H);grain(W,H,.03);const x=84,w=W-168,ty={...sol,lead:{...sol.lead,s:29,gap:6},hero:{...sol.hero,s:104,min:50,lh:1.5,gap:by(c,20,10,40),lines:3},sub:{...sol.sub,s:36}},
   top=[headItem(T,doc,{...sol,verse:{...sol.verse,s:44}}),...seqItems(T,doc.seq,ty)];
   const fi=Grid(T,doc.facts,{cols:2,lines:3,line:'none',al:'right',lf:F.amiri,ls:25,lc:'acc',vf:F.amiri,vs:29,pad:10,gap:0,inset:24}),aft=afterItems(T,doc,{...sol,close:{...sol.close,gap:12}}),pS=by(c,190,150,250);
   if(P.length){const s=pS;tile(T,P[0],x,76,s,{plain:1,gray:1,lw:1.2});}
   const fh=by(c,.4,.46,.33);const r=stack(top,{x,y:70,w,h:H*(1-fh)-70},{max:UP(c),min:.45,al:'right',spread:by(c,24,10,34),va:.45});
   const y1=H*(1-fh)+6;g.fillStyle=rgba(T.pat,.55);g.fillRect(x,y1,w,1.2);stack([fi,...aft],{x,y:y1+14,w,h:H-y1-14-84},{max:UP(c),min:.42,al:'right',spread:by(c,20,10,40),va:.2});foot(c,T,H-50,{s:18,cx:W/2});}
};

// ================= تبريكات خريج =================
function capIcon(T,cx,cy,s){const g=G();g.save();g.fillStyle=T.goldB;g.strokeStyle=T.goldB;g.beginPath();g.moveTo(cx,cy-s*.42);g.lineTo(cx+s,cy);g.lineTo(cx,cy+s*.42);g.lineTo(cx-s,cy);g.closePath();g.fill();g.beginPath();g.moveTo(cx-s*.56,cy+s*.3);g.lineTo(cx-s*.56,cy+s*.68);g.quadraticCurveTo(cx,cy+s*1.02,cx+s*.56,cy+s*.68);g.lineTo(cx+s*.56,cy+s*.3);g.lineTo(cx,cy+s*.54);g.closePath();g.fill();g.lineWidth=s*.05;g.beginPath();g.moveTo(cx+s*.86,cy+s*.04);g.lineTo(cx+s*.86,cy+s*.74);g.stroke();g.beginPath();g.arc(cx+s*.86,cy+s*.8,s*.08,0,7);g.fill();g.restore();}
function guilloche(T,m,W,H,n=7,st=5){const g=G();g.save();g.strokeStyle=T.goldB;for(let i=0;i<n;i++){g.globalAlpha=i%2?.32:.62;g.lineWidth=i===0||i===n-1?1.8:.9;const q=m+i*st;g.beginPath();g.roundRect(q,q,W-2*q,H-2*q,26-i*2);g.stroke();}g.restore();}
const tyG={...TY.naskh,kick:E(F.ruqaa,700,84,'gold',{min:44,lines:2,lh:1.3,gap:6}),hero:{...TY.naskh.hero,s:72},pre:{...TY.naskh.pre,gap:10},hero2:E(F.amiri,700,29,'muted',{min:21,gap:14,lh:1.5})};
const grad={
 cert(c){const{W,H,L:T,P,doc}=c,g=G();bgRadial(T,W,H,.45);grain(W,H,.05);patFill(T,0,0,W,H,108,.05);guilloche(T,34,W,H);const r=by(c,58,44,76);seal(c.D,W/2,84+r,r);
   stack(flowFit(c,T,tyG,{prow:{s:P.length===1?260:undefined},fx:{ls:22,vs:31,vf:F.amiri,lf:F.cairo,lc:'accD'}}),{x:110,y:96+2*r+18,w:W-220,h:H-(96+2*r+18)-104},{max:UP(c),min:.45,spread:by(c,30,14,50)});foot(c,T,H-80,{s:19});},
 cover(c){const{W,H,D:T,P,doc}=c,g=G();bgRadial(T,W,H,.1);patFill(T,0,0,W,H,108,T.patA*.8);grain(W,H,.05);const m=56;let y=m;
   const ty={...TY.modern,kick:E(F.ruqaa,700,120,'gold',{min:60,lines:2,lh:1.25,gap:0}),hero:{...TY.modern.hero,s:70},lead:{...TY.modern.lead,lines:2},hero2:E(F.cairo,600,25,'muted',{min:20,gap:12,lh:1.5})};
   if(P.length){const big0=by(c,P.length>1?560:620,P.length>1?420:470,P.length>1?640:660),sm=(big0-16)/2,x=W-m-big0;tile(T,P[0],x,y,big0,{plain:1,lw:3});if(P[1]){tile(T,P[1],x-16-sm,y,sm,{plain:1,lw:2});if(P[2])tile(T,P[2],x-16-sm,y+sm+16,sm,{plain:1,lw:2});else{g.fillStyle=rgba(T.pat,.12);g.fillRect(x-16-sm,y+sm+16,sm,sm);capIcon(T,x-16-sm/2,y+sm+16+sm*.44,sm*.28);}}
     else{const fx=m,fw=x-16-m;stack([B(0,0,0,()=>{}),Tx(T,doc.kick,{...ty.kick,s:by(c,76,60,88),min:40,lines:4,lh:1.3})],{x:fx,y:y,w:fw,h:big0},{va:.5,al:'center'});}y+=big0+by(c,28,22,40);}
   const items=[P.length===1?null:Tx(T,doc.kick,P.length?{...ty.kick,s:by(c,86,66,110),lines:1}:ty.kick),...seqItems(T,doc.seq,ty),Grid(T,doc.facts,{line:'rows',al:'right',ls:21,vs:30,vf:F.cairo,vw:700,gap:16,pad:8,lc:'acc'}),...afterItems(T,doc,ty)];
   stack(items,{x:m+8,y,w:W-2*m-16,h:H-y-80},{max:UP(c),min:.42,al:'right',spread:by(c,26,12,44)});foot(c,T,H-44);},
 sash(c){const{W,H,D:T,L,P,doc}=c,g=G();bgRadial(T,W,H,.55);grain(W,H,.05);const a=W*.6,b=H*.15;
   g.save();for(const f of[0,1]){g.fillStyle=rgba(T.pat,.11);g.beginPath();if(f){g.moveTo(0,H-b);g.lineTo(W-a,H);g.lineTo(0,H);}else{g.moveTo(a,0);g.lineTo(W,b);g.lineTo(W,0);}g.closePath();g.fill();g.fillStyle=goldG(T,0,0,W,H);g.beginPath();if(f){g.moveTo(0,H-b);g.lineTo(W-a,H);g.lineTo(W-a-34,H);g.lineTo(0,H-b+13);}else{g.moveTo(a,0);g.lineTo(W,b);g.lineTo(W,b-13);g.lineTo(a+34,0);}g.closePath();g.fill();}g.restore();
   drawLogo(120,104,by(c,104,84,126));
   const ty={...TY.classic,kick:E(F.ruqaa,700,88,'gold',{min:46,lines:2,lh:1.32,gap:0}),hero:{...TY.classic.hero,s:68},pre:{...TY.classic.pre,gap:10},hero2:E(F.cairo,600,25,'muted',{min:20,gap:14,lh:1.5})},y0=by(c,170,130,270);
   stack(flowFit(c,T,ty,{prow:{s:P.length===1?250:undefined},fx:{ls:21,vs:30,gap:22}}),{x:90,y:y0,w:W-180,h:H-y0-by(c,150,120,250)},{max:UP(c),min:.45,spread:by(c,30,14,50),va:.5});},
 seam(c){const{W,H,D,L,P,doc}=c,g=G(),sy=Math.round(H*by(c,.4,.42,.36));bgRadial(D,W,sy,.3);patFill(D,0,0,W,sy,72,.12,1);bgRadial(L,W,H-sy,.2,0,sy);grain(W,H,.05);g.fillStyle=goldG(D,0,sy,W,sy);g.fillRect(0,sy-2,W,4);
   const n=P.length,s=n===3?by(c,210,170,250):n===2?by(c,240,190,290):by(c,280,220,340),gp=26,tot=n*s+gp*(n-1),half=n?s/2:by(c,70,56,90);
   const ty={...TY.modern,kick:E(F.ruqaa,700,104,'gold',{min:50,lines:2,lh:1.3})},tl=TY.naskh;
   stack([Tx(D,doc.kick,ty.kick),Tx(D,doc.seq[0].t,{...TY.modern.lead,gap:10})],{x:90,y:40,w:W-180,h:sy-half-60},{max:UP(c),min:.45,spread:16});
   if(n){let x=W/2+tot/2;P.forEach(p=>{x-=s;tile(D,p,x,sy-s/2,s,{mat:8});x-=gp;});}else seal(L,W/2,sy,half);
   const y0=sy+half+by(c,26,20,44);stack([Tx(L,doc.seq[1].t,{...tl.hero,s:66,gap:0}),Tx(L,doc.seq[2].t,{...tl.pre,gap:10}),Grid(L,doc.facts,{ls:21,vs:30,vf:F.amiri,lf:F.cairo,gap:18,lc:'accD'}),Tx(L,doc.close,tl.close),doc.sign?Tx(L,doc.sign,{...tl.hero2,s:27,gap:8}):null],{x:90,y:y0,w:W-180,h:H-y0-74},{max:UP(c),min:.42,spread:by(c,24,10,44)});foot(c,L,H-40,{s:19});}
};

// ================= تبريكات مولود =================
const tyB=(T,x)=>({...(T.dark?TY.softD:TY.soft),...x});
const babyAfter=(T,d,ty)=>[d.facts.length?Grid(T,d.facts,{cols:1,line:'none',ls:22,vs:29,vf:F.mes,vw:600,pad:4,gap:14,flex:.8}):null,d.dua?Tx(T,d.dua,ty.quote):null];
function crescent(T,cx,cy,r){const g=G();g.save();g.beginPath();g.arc(cx,cy,r,0,7);g.clip();g.beginPath();g.rect(cx-r*2,cy-r*2,r*4,r*4);g.arc(cx+r*.44,cy-r*.16,r*.86,0,7);g.clip('evenodd');g.fillStyle=T.goldA;g.globalAlpha=.92;g.fillRect(cx-r,cy-r,r*2,r*2);g.restore();}
function hills(T,W,H,h){const g=G();[[.92,.3,T.bg1,.9],[.62,.45,T.goldA,.32],[.32,.7,T.goldB,.28]].forEach(([k,ph,col,a],i)=>{const y0=H-h*k;g.save();g.globalAlpha=a;g.fillStyle=col;g.beginPath();g.moveTo(0,H);g.lineTo(0,y0);for(let x=0;x<=W;x+=W/4){const d=(i%2?1:-1)*h*.13,x2=x+W/4;g.quadraticCurveTo(x+W/8,y0+(Math.round(x/(W/4))%2?d:-d),x2,y0);}g.lineTo(W,H);g.closePath();g.fill();g.restore();});}
function scallop(x,y,w,h,r){const g=G(),nx=Math.round(w/(2*r)),ny=Math.round(h/(2*r)),rx=w/nx/2,ry=h/ny/2;g.beginPath();g.moveTo(x,y);for(let i=0;i<nx;i++)g.arc(x+rx*(2*i+1),y,rx,Math.PI,0);for(let i=0;i<ny;i++)g.arc(x+w,y+ry*(2*i+1),ry,-Math.PI/2,Math.PI/2);for(let i=nx-1;i>=0;i--)g.arc(x+rx*(2*i+1),y+h,rx,0,Math.PI);for(let i=ny-1;i>=0;i--)g.arc(x,y+ry*(2*i+1),ry,Math.PI/2,-Math.PI/2);g.closePath();}
const bab={
 moon(c){const{W,H,D:T,P,doc}=c,g=G();bgLin(T,0,0,W,H);grain(W,H,.04);const gl=g.createRadialGradient(W*.5,H*.1,0,W*.5,H*.1,W*.8);gl.addColorStop(0,'rgba(255,255,255,.16)');gl.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gl;g.fillRect(0,0,W,H);
   [[.12,.1,16],[.86,.08,22],[.2,.24,9],[.78,.2,10],[.08,.5,10],[.93,.45,14],[.1,.8,14],[.9,.82,10],[.5,.04,8]].forEach(([a,b,r])=>{g.fillStyle=T.goldA;star4(W*a,H*b,r);g.fill();});
   const ty=tyB(T,{hero:{...TY.soft.hero,col:'ink'}}),r=by(c,70,52,96);crescent(T,W/2-r*.1,by(c,120,92,170),r);const y0=by(c,120,92,170)+r+24;
   stack([Tx(T,doc.kick,ty.kick),P.length?PRow(T,P,{s:P.length===1?by(c,290,230,360):undefined,cap:0,mat:7,mid:0,gapx:24}):null,...seqItems(T,doc.seq,ty),...babyAfter(T,doc,ty)],{x:110,y:y0,w:W-220,h:H-y0-90},{max:UP(c),min:.42,spread:by(c,30,12,50)});foot(c,T,H-50,{col:'rgba(255,255,255,.7)',s:19});},
 hills(c){const{W,H,L:T,P,doc}=c,g=G(),r=g.createLinearGradient(0,0,0,H);r.addColorStop(0,T.bg0);r.addColorStop(1,T.bg1);g.fillStyle=r;g.fillRect(0,0,W,H);grain(W,H,.04);const hh=by(c,290,180,430);hills(T,W,H,hh);
   const ty=tyB(T,{kick:E(F.ruqaa,700,92,'accD',{min:48,lines:2,lh:1.3,gap:0}),hero:{...TY.soft.hero,s:88}}),txt=[...seqItems(T,doc.seq,ty),...babyAfter(T,doc,ty)];
   stack([Tx(T,doc.kick,ty.kick),Orn(T,'rule',{gap:10}),P.length?Split(T,Col(txt),P.length===2?Col(P.map((p,i)=>PRow(T,[p],{s:230,cap:0,mat:7,gap:i?16:0}))):photoCol(T,P,{cap:0,mid:0,mat:7,s:P.length===1?280:undefined}),{ratio:P.length===2?.62:.6,ral:'right',rule:0,gapx:30,gap:14}):Col(txt,{gap:10})],{x:84,y:60,w:W-168,h:H-60-hh*.62},{max:UP(c),min:.42,al:'right',spread:by(c,30,12,50),va:.3});foot(c,T,H-44,{s:19,col:T.ink});},
 circle(c){const{W,H,L:T,P,doc}=c,g=G();g.fillStyle=T.bg0;g.fillRect(0,0,W,H);grain(W,H,.04);const cy=c.sq?H*.41:H*.46,rr=c.sq?H*.355:Math.min(W*.47,H*.42);g.fillStyle=T.bg1;g.beginPath();g.arc(W/2,cy,rr,0,7);g.fill();g.strokeStyle=T.goldB;g.lineWidth=1.4;g.beginPath();g.arc(W/2,cy,rr+18,0,7);g.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4+Math.PI/8;g.fillStyle=T.goldB;g.beginPath();g.arc(W/2+Math.cos(a)*(rr+18),cy+Math.sin(a)*(rr+18),4.5,0,7);g.fill();}
   const ty=tyB(T,{hero:{...TY.soft.hero,s:100,lines:2},quote:{...TY.soft.quote,s:33,min:22,lines:2}}),box=rr*1.58;
   const items=[Tx(T,doc.kick,ty.kick),P.length?PRow(T,P,{s:P.length===1?by(c,210,150,250):P.length===2?by(c,170,130,200):by(c,140,110,170),cap:0,mat:6,mid:0,gapx:16,gap:10}):null,...seqItems(T,doc.seq,ty),doc.facts.length?Grid(T,doc.facts,{cols:1,line:'none',ls:20,vs:26,vf:F.mes,vw:600,pad:2,gap:8,flex:.6}):null];stack(items,{x:W/2-box/2,y:cy-rr*.82,w:box,h:rr*1.64},{max:by(c,1.25,1.25,1.6),min:.42,spread:18,va:.5});
   stack([Tx(T,doc.dua,ty.quote)],{x:90,y:cy+rr+by(c,34,28,40),w:W-180,h:H-(cy+rr+by(c,34,28,40))-by(c,70,56,80)},{max:by(c,1.1,1,1.4),min:.6,va:.4});foot(c,T,H-by(c,42,32,50),{s:19});},
 scallop(c){const{W,H,L,D,P,doc}=c,g=G(),T=L;bgLin(D,0,0,W,H);patFill(D,0,0,W,H,72,.14,1);grain(W,H,.04);const m=78;g.save();shOn('rgba(40,30,20,.3)',30,10);g.fillStyle=T.bg0;scallop(m,m,W-2*m,H-2*m,22);g.fill();g.restore();keyline(T,m+26,m+26,W-2*m-52,H-2*m-52,1.2,.65);corners(T,m+38,m+38,W-2*m-76,H-2*m-76,40,1.6);
   const ty=tyB(T),e=doc.seq,cells=[[e[2].t,e[3].t],...doc.facts];stack([Tx(T,doc.kick,{f:F.ruqaa,w:700,s:104,min:52,col:'accD',lines:2,lh:1.3}),Orn(T,'dia',{w:300,gap:10}),P.length?PRow(T,P,{s:P.length===1?by(c,260,170,330):undefined,cap:0,mat:8,mid:0,gapx:24}):null,Tx(T,e[0].t,ty.lead),Tx(T,e[1].t,{f:F.mes,w:700,s:64,min:36,col:'ink',lines:2,lh:1.35,gap:4}),Grid(T,cells,{cols:cells.length>1?2:1,line:'strip',ls:21,vs:27,vf:F.mes,vw:600,gap:18,flex:1}),doc.dua?Tx(T,doc.dua,ty.quote):null],{x:m+74,y:m+60,w:W-2*m-148,h:H-2*m-120},{max:UP(c),min:.4,spread:by(c,30,12,50)});}
};

// ================= مناسبة عامة =================
function mosaic(c,T){const g=G(),{W,H}=c,s=W/6,rows=Math.round(H/s),sy=H/rows;for(let r=0;r<rows;r++)for(let k=0;k<6;k++){if(!(r===0||k===0||k===5||r===rows-1))continue;const x=k*s,y=r*sy,cx=x+s/2,cy=y+sy/2;g.fillStyle=(r+k)%2?T.bg1:T.bg0;g.fillRect(x,y,s+1,sy+1);if((r+k)%2===0){g.strokeStyle=T.goldB;g.lineWidth=1.5;star8(cx,cy,s*.34,.55);g.stroke();star8(cx,cy,s*.14,.55);g.fillStyle=T.goldB;g.fill();}else{g.fillStyle=rgba(T.pat,.5);diamond(cx,cy,s*.16);g.fill();}}return{s,sy,rows};}
const tyE={...TY.classic,hero:{...TY.classic.hero,s:72,lines:3},body:{...TY.classic.body,s:31,lines:6,min:22}};
const gen={
 frame(c){const{W,H,T}=c;bgRadial(T,W,H);patFill(T,0,0,W,H,108,T.patA*1.1);grain(W,H,.05);vign(T,W,H);frameStars(T,W,H);
   stack(flowFit(c,T,tyE,{bism:{s:by(c,130,100,170),cap:380}}),{x:120,y:84,w:W-240,h:H-84-112},{max:UP(c),min:.45,spread:by(c,34,16,56)});foot(c,T,H-74);},
 masthead(c){const{W,H,L:T,D,P,doc}=c,g=G(),hh=by(c,370,300,520);bgRadial(T,W,H,.6);grain(W,H,.05);bgLin(D,0,0,W,hh);patFill(D,0,0,W,hh,54,.14,1);g.fillStyle=goldG(D,0,hh,W,hh);g.fillRect(0,hh-2,W,4);
   const ht=doc.seq.find(e=>e.r==='hero').t,ld=doc.seq[0].t,bd=doc.seq.find(e=>e.r==='body');
   stack([Bism(D,{s:by(c,80,62,104),cap:260}),Tx(D,ld,{...TY.classic.lead,s:26,gap:8}),Tx(D,ht,{f:F.mes,w:700,s:76,min:42,lines:2,lh:1.3,col:'#fff',gap:6})],{x:80,y:26,w:W-160,h:hh-52},{max:UP(c),min:.5,spread:16,va:.5});
   const y0=hh+by(c,36,24,56),ty={...TY.naskh,body:{...TY.naskh.body,s:34,lines:7,min:23,lh:1.75}};
   stack([Tx(T,doc.kick,{...ty.kick,s:28,lines:1}),P.length?PRow(T,P,{s:P.length===1?by(c,300,190,380):by(c,220,150,280),cap:0,mid:0,gapx:22,mat:8}):null,bd?Tx(T,bd.t,ty.body):null,factsItem(T,doc,{list:1,ls:24,vs:33,lc:'accD',gap:18,pad:10}),...afterItems(T,doc,ty)],{x:96,y:y0,w:W-192,h:H-y0-80},{max:UP(c),min:.42,al:'right',spread:by(c,30,12,50),va:.2});foot(c,T,H-44,{s:19});},
 modern(c){const{W,H,D:T,P,doc}=c,g=G();g.fillStyle=T.bg1;g.fillRect(0,0,W,H);grain(W,H,.05);const q=54;for(let i=0;i<5;i++)for(let k=0;k<5-i;k++){g.globalAlpha=(.1+.17*(4-i-k>0?(4-i-k):0)/2);g.fillStyle=(i+k)%2?T.goldB:T.bg0;g.fillRect(k*q,H-(i+1)*q,q-3,q-3);g.fillRect(W-(k+1)*q+3,i*q,q-3,q-3);}g.globalAlpha=1;
   const ty={...TY.modern,hero:{...TY.modern.hero,s:92,min:44,lines:3,lh:1.32,gap:0},body:{...TY.modern.body,s:30,lines:6,min:22},lead:{...TY.modern.lead}},x=80,w=W-160,y0=by(c,150,120,250);
   stack([Tx(T,doc.kick,{...ty.kick,s:32}),...seqItems(T,doc.seq,ty),P.length?PRow(T,P,{s:P.length===1?by(c,300,220,380):by(c,230,170,290),cap:0,mid:0,gapx:22,plain:1,mat:0}):null,doc.facts.length?Grid(T,doc.facts,{line:'box',cgap:12,ls:21,vs:31,vf:F.cairo,vw:700,lc:'acc',gap:20}):null,...afterItems(T,doc,ty)],{x,y:y0,w,h:H-y0-by(c,110,90,170)},{max:UP(c),min:.42,al:'right',spread:by(c,30,12,50),va:.3});foot(c,T,H-44,{cx:W-300,s:19});},
 mosaic(c){const{W,H,D:T,L,P,doc}=c,g=G();bgLin(T,0,0,W,H);const{s,sy,rows}=mosaic(c,T),x=s,y=sy,w=W-2*s,h=(rows-2)*sy;g.fillStyle=L.bg0;g.fillRect(x,y,w,h);const pg=g.createLinearGradient(0,y,0,y+h);pg.addColorStop(0,L.bg0);pg.addColorStop(1,L.bg1);g.fillStyle=pg;g.fillRect(x,y,w,h);g.strokeStyle=goldG(T,x,y,x+w,y+h);g.lineWidth=3;g.strokeRect(x,y,w,h);keyline(L,x+12,y+12,w-24,h-24,1,.7);
   const ty={...TY.naskh,hero:{...TY.naskh.hero,s:62,lines:3},body:{...TY.naskh.body,lines:6}};
   stack([headItem(L,doc,ty,{bism:{s:by(c,92,64,120),cap:280}}),Tx(L,doc.kick,{...ty.kick,s:28}),P.length&&!c.sq?PRow(L,P,{s:P.length===1?by(c,220,170,300):by(c,170,130,220),cap:0,mid:0,gapx:18,mat:7}):null,...seqItems(L,doc.seq,ty),doc.facts.length?Grid(L,doc.facts,{ls:21,vs:29,vf:F.amiri,lf:F.cairo,gap:16,lc:'accD'}):null,...afterItems(L,doc,ty)],{x:x+44,y:y+30,w:w-88,h:h-60},{max:UP(c),min:.4,spread:by(c,30,12,50)});}
};

// ================= خبر =================
const nws={
 press(c){const{W,H,L:T,P,doc}=c,g=G();g.fillStyle=T.bg0;g.fillRect(0,0,W,H);grain(W,H,.05);const x=70,w=W-140;
   const mast=by(c,110,92,136);g.save();g.textAlign='center';g.textBaseline='middle';g.font=font(700,mast,F.ruqaa);g.fillStyle=T.ink;const mw=fit(doc.kick,{f:F.ruqaa,w:700,s:mast,min:50,lines:1},1,w-120);g.font=font(700,mw.fs,F.ruqaa);g.fillText(mw.L[0],W/2,60+mast*.62,w);g.restore();
   const y1=60+mast*1.26;g.fillStyle=T.ink;g.fillRect(x,y1,w,5);g.fillRect(x,y1+10,w,1.4);drawLogo(x+36,60+mast*.6,mast*.62);
   g.save();g.textBaseline='middle';g.font=font(600,22,F.cairo);g.fillStyle=T.muted;g.textAlign='right';g.fillText(doc.date||'',x+w,y1+36,w*.5);g.direction='ltr';g.textAlign='left';if(doc.site)g.fillText(doc.site,x,y1+36);g.direction='rtl';g.restore();g.fillStyle=T.ink;g.fillRect(x,y1+60,w,1.4);
   const y2=y1+78,ty={title:E(F.amiri,700,74,'ink',{min:40,lines:3,lh:1.42}),body:E(F.amiri,400,35,'soft',{min:23,lines:9,lh:1.75,gap:18,bal:0})};
   const body=Tx(T,doc.text,ty.body),title=Tx(T,doc.title,ty.title);
   if(c.sq&&P.length)stack([title,Split(T,Col([body]),photoCol(T,P,{cap:0,mid:0,plain:1,mat:0,s:P.length===1?280:P.length===2?170:undefined}),{ratio:.6,ral:'right'})],{x,y:y2,w,h:H-y2-50},{max:UP(c),min:.42,al:'right',spread:20,va:.2});
   else stack([title,P.length?PRow(T,P,{s:P.length===1?by(c,400,0,560):by(c,300,0,300),cap:0,mid:0,plain:1,mat:0,gapx:14,gap:20}):null,body],{x,y:y2,w,h:H-y2-50},{max:UP(c),min:.42,al:'right',spread:by(c,22,10,40),va:.2});},
 flash(c){const{W,H,D:T,P,doc}=c,g=G();bgRadial(T,W,H,.2);patFill(T,0,0,W,H,108,T.patA*.8);grain(W,H,.05);const m=70;
   g.save();g.font=font(800,34,F.cairo);const tw0=tw(doc.kick)+64;g.fillStyle=goldG(T,W-m-tw0,0,W-m,0);g.fillRect(W-m-tw0,m,tw0,72);g.fillStyle=T.bg1;g.textAlign='center';g.textBaseline='middle';g.fillText(doc.kick,W-m-tw0/2,m+37,tw0-20);g.restore();drawLogo(m+44,m+36,84);
   const y0=m+by(c,110,92,150),ty={title:E(F.cairo,900,84,'ink',{min:42,lines:4,lh:1.36,bal:1}),body:E(F.cairo,500,33,'soft',{min:22,lines:8,lh:1.7,gap:18})};
   const tt=Tx(T,doc.title,ty.title),bd=Tx(T,doc.text,ty.body),bh=by(c,76,66,92);g.fillStyle=goldG(T,0,H-bh,W,H-bh);g.fillRect(0,H-bh,W,3);g.fillStyle=rgba(T.pat,.12);g.fillRect(0,H-bh+3,W,bh);foot(c,T,H-bh/2);
   if(c.sq&&P.length)stack([tt,Split(T,Col([bd]),photoCol(T,P,{cap:0,mid:0,s:P.length===1?260:P.length===2?170:undefined}),{ratio:.6,ral:'right'}),doc.date?Tx(T,doc.date,{f:F.cairo,w:600,s:24,col:'acc',gap:10}):null],{x:m,y:y0,w:W-2*m,h:H-y0-bh-24},{max:UP(c),min:.42,al:'right',spread:20,va:.25});
   else stack([tt,Orn(T,'rule',{gap:14}),P.length?PRow(T,P,{s:P.length===1?by(c,330,0,480):by(c,250,0,300),cap:0,mid:0,gapx:20,mat:8,gap:22}):null,bd,doc.date?Tx(T,doc.date,{f:F.cairo,w:600,s:26,col:'acc',gap:14}):null],{x:m,y:y0,w:W-2*m,h:H-y0-bh-30},{max:UP(c),min:.42,al:'right',spread:by(c,30,10,50),va:.25});},
 picture(c){const{W,H,L:T,D,P,doc}=c,g=G(),n=P.length,bh=n?by(c,n===1?520:n===2?500:360,n===1?440:n===2?400:300,n===1?760:n===2?540:360):by(c,300,210,420);bgRadial(T,W,H,.6);grain(W,H,.05);
   if(n===1){bgLin(D,0,0,W,bh);patFill(D,0,0,W,bh,72,.14,1);photo(P[0],(W-bh)/2,0,bh);g.fillStyle=goldG(D,0,bh,W,bh);g.fillRect(0,bh-1.5,W,3);for(const x of[(W-bh)/2,(W+bh)/2]){g.fillStyle=D.goldB;g.fillRect(x-1,0,2,bh);}}else if(n)band(c,T,0,bh,{top:0});else{bgLin(D,0,0,W,bh);patFill(D,0,0,W,bh,72,.16,1);g.fillStyle=goldG(D,0,bh,W,bh);g.fillRect(0,bh-1.5,W,3);drawLogo(W/2,bh*.46,bh*.5);}
   g.save();g.font=font(800,30,F.cairo);const t0=tw(doc.kick)+52,tx=W-70-t0;g.fillStyle=D.bg1;g.fillRect(tx,bh-30,t0,60);g.strokeStyle=goldG(D,tx,0,tx+t0,0);g.lineWidth=2;g.strokeRect(tx,bh-30,t0,60);g.fillStyle=D.goldA;g.textAlign='center';g.textBaseline='middle';g.fillText(doc.kick,tx+t0/2,bh+2,t0-16);g.restore();
   const y0=bh+48,ty={title:E(F.mes,700,70,'ink',{min:38,lines:3,lh:1.36}),body:E(F.mes,500,33,'soft',{min:22,lines:8,lh:1.68,gap:16})};
   stack([Tx(T,doc.title,ty.title),Tx(T,doc.text,ty.body),doc.date?Tx(T,doc.date,{f:F.cairo,w:600,s:24,col:'accD',gap:12}):null],{x:76,y:y0,w:W-152,h:H-y0-84},{max:UP(c),min:.42,al:'right',spread:by(c,26,10,44),va:.2});foot(c,T,H-44,{s:19});},
 rail(c){const{W,H,L:T,D,P,doc}=c,g=G(),rw=by(c,170,150,190);bgRadial(T,W,H,.4);grain(W,H,.05);bgLin(D,W-rw,0,rw,H);patFill(D,W-rw,0,rw,H,54,.16,1);g.fillStyle=goldG(D,W-rw,0,W-rw,H);g.fillRect(W-rw-2,0,4,H);drawLogo(W-rw/2,96,rw*.56);
   g.save();g.translate(W-rw/2,H*.56);g.rotate(-Math.PI/2);g.textAlign='center';g.textBaseline='middle';const f=fit(doc.kick,{f:F.ruqaa,w:700,s:84,min:40,lines:1},1,H*.66);g.font=font(700,f.fs,F.ruqaa);g.fillStyle=goldV(D,-f.fs,f.fs);g.fillText(f.L[0],0,0,H*.7);g.restore();
   const x=64,w=W-rw-64-52,ty={title:E(F.cairo,800,70,'ink',{min:40,lines:4,lh:1.4}),body:E(F.amiri,400,35,'soft',{min:23,lines:9,lh:1.75,gap:16})};
   stack([doc.date?Tx(T,doc.date,{f:F.cairo,w:600,s:24,col:'accD'}):null,Tx(T,doc.title,{...ty.title,gap:doc.date?8:0}),Orn(T,'rule',{gap:12}),P.length?PRow(T,P,{s:P.length===1?by(c,350,230,480):by(c,250,160,270),cap:0,mid:0,gapx:16,mat:7,gap:20}):null,Tx(T,doc.text,ty.body)],{x,y:70,w,h:H-70-96},{max:UP(c),min:.42,al:'right',spread:by(c,30,10,50),va:.3});foot(c,T,H-50,{cx:x+w/2,s:19});}
};
window.OCC_DESIGNS={
 wedding:[['royal','المحراب الملكي','إطار محراب مزخرف',wed.royal],['ivoryBand','الشريط العاجي','صور بعرض الصفحة على ورق عاجي',wed.ivoryBand],['side','اللوح الجانبي','الصور في عمود جانبي',wed.side],['card','البطاقة','بطاقة ورقية فوق نقش',wed.card],['poster','الخط الكبير','عنوان كبير بخط الرقعة',wed.poster]],
 condolence:[['calm','الوقار','هادئ ومتوسط',mou.calm],['paper','النعي الورقي','إطار أسود كالصحف',mou.paper],['column','العمود','عمود للآية وآخر للتفاصيل',mou.column],['ribbon','الشريط','الاسم في شريط فاتح',mou.ribbon],['quiet','السكون','اسم كبير ومساحة واسعة',mou.quiet]],
 graduate:[['cert','الشهادة','ورق وإطار كالشهادات',grad.cert],['cover','الغلاف','صورة كبيرة كغلاف مجلة',grad.cover],['sash','الوشاح','خطوط مائلة وعنوان بالرقعة',grad.sash],['seam','الوجهان','نصف غامق ونصف فاتح',grad.seam]],
 baby:[['moon','الهلال','سماء هادئة ونجوم',bab.moon],['hills','التلال','تموجات ناعمة',bab.hills],['circle','الدائرة','دائرة حول الاسم',bab.circle],['scallop','البطاقة المخرمة','بطاقة بحافة مموجة',bab.scallop]],
 general:[['frame','الإطار','إطار مزخرف بالوسط',gen.frame],['masthead','الترويسة','عنوان في رأس الصفحة',gen.masthead],['modern','العصري','خط كوفي ومربعات',gen.modern],['mosaic','الفسيفساء','بلاط يحيط بالنص',gen.mosaic]],
 news:[['flash','العاجل','عنوان عريض',nws.flash],['press','الصحيفة','تصميم جريدة',nws.press],['picture','الصورة أولاً','صورة ثم الخبر',nws.picture],['rail','الشريط الجانبي','شريط جانبي بالرقعة',nws.rail]]
};
// يرسم تصميم على سياق معطى؛ scale=1 للتحميل وأقل للمصغرات
window.occRender=function(ctx,o){const{id,st,size,foot:ft,scale=1,quick=false,design}=o,D=window.OCC_DATA,occ=D.OCC[id],[W,H]=X.SIZES[size],list=window.OCC_DESIGNS[id],ds=list.find(d=>d[0]===design)||list[0];
  const palId=st.pal&&occ.pals.includes(st.pal)?st.pal:(occ.genderPal?occ.genderPal[st.gender]:occ.pals[0]),pal=X.PAL[palId],v=D.vals(id,st,ft),doc=occ.doc(v,st);doc.social=ft&&ft.social||'';doc.site=ft&&ft.site||'';
  const n=occ.maxPhotos(st,v),P=(st.photos||[]).filter(p=>p.src).slice(0,n).map(p=>occ.caps?p:{...p,role:'',name:'',note:''});
  const rep={over:[],sc:9};X.begin(ctx,quick,rep);ctx.save();ctx.setTransform(scale,0,0,scale,0,0);ds[3]({W,H,sq:H===W,st:H>1500,T:pal[pal.main],D:pal.D,L:pal.L,doc,P,pal:palId});ctx.restore();return rep;};
})();
