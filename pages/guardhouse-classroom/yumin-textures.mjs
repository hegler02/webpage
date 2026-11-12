// Surfaces drawn for this museum: exposed concrete with its formwork marks, stacked Jeju basalt, sawn basalt paving, the trowelled floor and the meadow of the cape.
import {random,sheet,texture} from './farnsworth-textures.mjs';

const rgb=(r,g,b)=>`rgb(${r|0},${g|0},${b|0})`;
const wrapped=(S,x,draw)=>{for(const dx of [-S,0,S])if(x+dx<S&&x+dx>-S)draw(dx);};
const finish=(c,b,renderer,size,rest)=>{const map=texture(c,renderer),bumpMap=texture(b,renderer,false);for(const t of [map,bumpMap])t.repeat.set(1/size,1/size);return {map,bumpMap,...rest};};

// Exposed concrete. One tile is 3.6 m square: two plywood panels of 1.8 × 0.9 m across and four up, each with six form-tie holes.
export function concrete(renderer,size=3.6){
 const S=1024,[c,x]=sheet(S,S),[b,y]=sheet(S,S),rand=random(131),pw=S/2,ph=S/4;
 x.fillStyle='#b9b7b0';x.fillRect(0,0,S,S);y.fillStyle='#909090';y.fillRect(0,0,S,S);
 for(let i=0;i<2;i++)for(let j=0;j<4;j++){
  const ox=i*pw,oy=j*ph,t=rand()*14-7;
  x.globalAlpha=1;x.fillStyle=rgb(186+t,184+t,177+t);x.fillRect(ox,oy,pw,ph);
  x.save();x.beginPath();x.rect(ox,oy,pw,ph);x.clip();
  // Clouding left by the pour, and the faint grain the plywood printed on the face.
  for(let k=0;k<26;k++){const px=ox+rand()*pw,py=oy+rand()*ph,r=30+rand()*130,fill=x.createRadialGradient(px,py,0,px,py,r),tone=rand()<.5?'214,212,205':'150,148,142';
   fill.addColorStop(0,`rgba(${tone},${.1+rand()*.12})`);fill.addColorStop(1,`rgba(${tone},0)`);x.fillStyle=fill;x.fillRect(px-r,py-r,2*r,2*r);}
  for(let k=0;k<70;k++){x.globalAlpha=.03+rand()*.05;x.strokeStyle=rand()<.5?'#e4e2da':'#77756f';x.lineWidth=.5+rand()*1.2;const ly=oy+rand()*ph;x.beginPath();x.moveTo(ox,ly);x.lineTo(ox+pw,ly+rand()*3-1.5);x.stroke();}
  // Bug holes: the small air pockets of a cast face.
  x.globalAlpha=.34;x.fillStyle='#5f5d58';for(let k=0;k<46;k++){const r=.5+rand()*rand()*2.2;x.beginPath();x.arc(ox+rand()*pw,oy+rand()*ph,r,0,7);x.fill();}
  x.restore();
  // Six tie holes to a panel: three across, two up.
  for(const fx of [1/6,1/2,5/6])for(const fy of [.25,.75]){
   const px=ox+fx*pw,py=oy+fy*ph;
   x.globalAlpha=.9;x.fillStyle='#55534f';x.beginPath();x.arc(px,py,4.6,0,7);x.fill();x.globalAlpha=.5;x.fillStyle='#8c8a84';x.beginPath();x.arc(px,py+1.2,3.2,0,7);x.fill();
   x.globalAlpha=.35;x.strokeStyle='#e0ded6';x.lineWidth=1;x.beginPath();x.arc(px,py,5.6,.2,2.9);x.stroke();
   y.fillStyle='#202020';y.beginPath();y.arc(px,py,4.6,0,7);y.fill();
  }
 }
 // Panel joints: a hairline with a thin leak of paste beside it.
 for(const g of [x,y]){g.globalAlpha=g===x?.5:1;g.strokeStyle=g===x?'#6f6d67':'#5a5a5a';g.lineWidth=g===x?1.4:2;
  for(let i=0;i<=2;i++){g.beginPath();g.moveTo(i*pw,0);g.lineTo(i*pw,S);g.stroke();}for(let j=0;j<=4;j++){g.beginPath();g.moveTo(0,j*ph);g.lineTo(S,j*ph);g.stroke();}}
 x.globalAlpha=.16;x.strokeStyle='#e9e7df';x.lineWidth=1;for(let j=0;j<4;j++){x.beginPath();x.moveTo(0,j*ph+2);x.lineTo(S,j*ph+2);x.stroke();}
 x.globalAlpha=.035;for(let k=0;k<5000;k++){x.fillStyle=rand()<.5?'#fff':'#000';x.fillRect(rand()*S,rand()*S,1+rand()*2,1+rand()*2);}
 return finish(c,b,renderer,size,{bumpScale:.018,roughness:.74});
}

// Jeju basalt laid dry in rough courses: dark, full of gas holes, each stone a little rounded at the corners.
export function basalt(renderer,size=2.4){
 const S=1024,[c,x]=sheet(S,S),[b,y]=sheet(S,S),rand=random(137);
 x.fillStyle='#17171a';x.fillRect(0,0,S,S);y.fillStyle='#101010';y.fillRect(0,0,S,S);
 const courses=[];for(let top=0;top<S;){let h=Math.round(64+rand()*74);if(S-top-h<64)h=S-top;courses.push([top,h]);top+=h;}
 const stone=(g,px,py,w,h,r)=>{g.beginPath();g.moveTo(px+r,py);g.lineTo(px+w-r,py);g.quadraticCurveTo(px+w,py,px+w,py+r);g.lineTo(px+w,py+h-r);g.quadraticCurveTo(px+w,py+h,px+w-r,py+h);g.lineTo(px+r,py+h);g.quadraticCurveTo(px,py+h,px,py+h-r);g.lineTo(px,py+r);g.quadraticCurveTo(px,py,px+r,py);g.closePath();};
 for(const [top,h] of courses){
  for(let left=-Math.round(rand()*140);left<S;){
   const w=Math.round(Math.max(h*.9,80+rand()*190)),t=rand()*26-13,blue=rand()<.3?5:0,lift=120+rand()*110,r=8+rand()*14;
   wrapped(S,left,dx=>{
    const px=left+dx+3,py=top+3,sw=w-6,sh=h-6;
    x.globalAlpha=1;x.fillStyle=rgb(74+t,74+t,77+t+blue);stone(x,px,py,sw,sh,r);x.fill();y.fillStyle=rgb(lift,lift,lift);stone(y,px,py,sw,sh,r);y.fill();
    x.save();stone(x,px,py,sw,sh,r);x.clip();
    // Broken faces catch the light in patches; the gas holes of the lava stay black.
    for(let k=0;k<5;k++){const cx=px+rand()*sw,cy=py+rand()*sh,rr=18+rand()*50,fill=x.createRadialGradient(cx,cy,0,cx,cy,rr),tone=rand()<.55?'118,117,119':'40,40,43';
     fill.addColorStop(0,`rgba(${tone},${.2+rand()*.25})`);fill.addColorStop(1,`rgba(${tone},0)`);x.fillStyle=fill;x.fillRect(cx-rr,cy-rr,2*rr,2*rr);}
    for(let k=0;k<sw*sh/150;k++){const cx=px+rand()*sw,cy=py+rand()*sh,rr=.7+rand()*rand()*3.4;x.globalAlpha=.75;x.fillStyle='#1b1b1e';x.beginPath();x.arc(cx,cy,rr,0,7);x.fill();
     if(rr>1.6){y.fillStyle='#303030';y.beginPath();y.arc(cx,cy,rr,0,7);y.fill();}}
    x.globalAlpha=.26;x.fillStyle='#a9a8aa';x.fillRect(px,py,sw,3);x.globalAlpha=.4;x.fillStyle='#0c0c0e';x.fillRect(px,py+sh-5,sw,5);
    x.restore();
   });
   left+=w;
  }
 }
 // A little grey lichen, as on every wall of the island.
 for(let k=0;k<40;k++){const cx=rand()*S,cy=rand()*S,rr=6+rand()*18,fill=x.createRadialGradient(cx,cy,0,cx,cy,rr);fill.addColorStop(0,'rgba(168,172,160,.22)');fill.addColorStop(1,'rgba(168,172,160,0)');x.globalAlpha=1;x.fillStyle=fill;x.fillRect(cx-rr,cy-rr,2*rr,2*rr);}
 return finish(c,b,renderer,size,{bumpScale:.11,roughness:.96});
}

// Sawn basalt slabs, 0.6 m deep in running lengths. One tile is 2.4 m square.
export function paving(renderer,size=2.4){
 const S=1024,[c,x]=sheet(S,S),[b,y]=sheet(S,S),rand=random(139),rows=4,rh=S/rows;
 x.fillStyle='#3f3f41';x.fillRect(0,0,S,S);y.fillStyle='#404040';y.fillRect(0,0,S,S);
 for(let j=0;j<rows;j++){
  for(let left=-Math.round(rand()*200);left<S;){
   const w=Math.round(rh*(1+Math.floor(rand()*3)*.5)),t=rand()*16-8;
   wrapped(S,left,dx=>{
    const px=left+dx+1.5,py=j*rh+1.5,sw=w-3,sh=rh-3;
    x.globalAlpha=1;x.fillStyle=rgb(104+t,103+t,102+t);x.fillRect(px,py,sw,sh);y.fillStyle='#a8a8a8';y.fillRect(px,py,sw,sh);
    x.save();x.beginPath();x.rect(px,py,sw,sh);x.clip();
    for(let k=0;k<4;k++){const cx=px+rand()*sw,cy=py+rand()*sh,rr=40+rand()*90,fill=x.createRadialGradient(cx,cy,0,cx,cy,rr),tone=rand()<.5?'134,133,131':'78,78,79';
     fill.addColorStop(0,`rgba(${tone},${.14+rand()*.16})`);fill.addColorStop(1,`rgba(${tone},0)`);x.fillStyle=fill;x.fillRect(cx-rr,cy-rr,2*rr,2*rr);}
    x.globalAlpha=.5;x.fillStyle='#343436';for(let k=0;k<sw*sh/420;k++){x.beginPath();x.arc(px+rand()*sw,py+rand()*sh,.5+rand()*1.5,0,7);x.fill();}
    x.restore();
   });
   left+=w;
  }
 }
 return finish(c,b,renderer,size,{bumpScale:.012,roughness:.82});
}

// Trowelled floor of the galleries: one even grey with soft burnish marks. One tile is 4 m square.
export function trowelled(renderer,size=4){
 const S=512,[c,x]=sheet(S,S),[b,y]=sheet(S,S),rand=random(149);
 x.fillStyle='#a9a8a2';x.fillRect(0,0,S,S);y.fillStyle='#808080';y.fillRect(0,0,S,S);
 for(let k=0;k<150;k++){const cx=rand()*S,cy=rand()*S,rr=30+rand()*90,tone=rand()<.5?'196,195,188':'138,137,131';
  for(const dx of [-S,0,S])for(const dy of [-S,0,S]){const fill=x.createRadialGradient(cx+dx,cy+dy,0,cx+dx,cy+dy,rr);fill.addColorStop(0,`rgba(${tone},.13)`);fill.addColorStop(1,`rgba(${tone},0)`);x.fillStyle=fill;x.fillRect(cx+dx-rr,cy+dy-rr,2*rr,2*rr);}}
 x.globalAlpha=.03;for(let k=0;k<2600;k++){x.fillStyle=rand()<.5?'#fff':'#000';x.fillRect(rand()*S,rand()*S,1+rand()*2,1+rand()*2);}
 return finish(c,b,renderer,size,{bumpScale:.003,roughness:.42});
}

// Roof ballast: washed pebbles in greys and browns. One tile is 1.6 m square.
export function gravel(renderer,size=1.6){
 const S=512,[c,x]=sheet(S,S),[b,y]=sheet(S,S),rand=random(167);
 x.fillStyle='#7d7a73';x.fillRect(0,0,S,S);y.fillStyle='#505050';y.fillRect(0,0,S,S);
 for(let k=0;k<5200;k++){const px=rand()*S,py=rand()*S,rr=2.5+rand()*4.5,t=rand()*46,warm=rand()<.3?12:0,turn=rand()*3.14,lift=120+rand()*120|0;
  for(const dx of [-S,0,S])for(const dy of [-S,0,S]){if(px+dx<-9||px+dx>S+9||py+dy<-9||py+dy>S+9)continue;
   x.fillStyle=rgb(128+t+warm,126+t+warm/2,120+t);x.beginPath();x.ellipse(px+dx,py+dy,rr,rr*(.6+rand()*.3),turn,0,7);x.fill();
   y.fillStyle=rgb(lift,lift,lift);y.beginPath();y.ellipse(px+dx,py+dy,rr,rr*.7,turn,0,7);y.fill();}}
 return finish(c,b,renderer,size,{bumpScale:.02,roughness:.95});
}

// Coastal meadow: wind-combed grass with dry tufts and bare patches of dark earth. One tile is `size` metres square.
export function meadow(renderer,size=9){
 const S=1024,[c,x]=sheet(S,S),rand=random(151);
 x.fillStyle='#5d6c45';x.fillRect(0,0,S,S);
 for(let k=0;k<420;k++){const cx=rand()*S,cy=rand()*S,rr=30+rand()*120,tone=rand()<.35?'136,132,84':rand()<.6?'62,84,48':'92,110,64';
  for(const dx of [-S,0,S])for(const dy of [-S,0,S]){const fill=x.createRadialGradient(cx+dx,cy+dy,0,cx+dx,cy+dy,rr);fill.addColorStop(0,`rgba(${tone},.3)`);fill.addColorStop(1,`rgba(${tone},0)`);x.fillStyle=fill;x.fillRect(cx+dx-rr,cy+dy-rr,2*rr,2*rr);}}
 // Blades all lean one way: the wind on the cape comes off the sea.
 for(let k=0;k<26000;k++){const px=rand()*S,py=rand()*S,len=4+rand()*9,dry=rand();
  x.globalAlpha=.25+rand()*.4;x.strokeStyle=dry<.2?'#b1a878':dry<.55?'#778c54':'#40562f';x.lineWidth=.6+rand()*.8;x.beginPath();x.moveTo(px,py);x.lineTo(px+len*.55+rand()*2,py-len);x.stroke();}
 x.globalAlpha=1;const map=texture(c,renderer);map.repeat.set(1/size,1/size);
 return {map,roughness:.97};
}
