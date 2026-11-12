// Surfaces drawn for this house: coursed sandstone, ochre concrete, waxed flagstones, the bedded rock of the ravine and falling water.
import * as THREE from 'three';
import {random,sheet,texture} from './farnsworth-textures.mjs';

const rgb=(r,g,b)=>`rgb(${r|0},${g|0},${b|0})`;
// A stone drawn again one tile to each side, so that the sheet repeats without a seam.
const wrapped=(S,x,draw)=>{for(const dx of [-S,0,S])if(x+dx<S&&x+dx>-S)draw(dx);};

// Walls of thin sandstone laid in rough level courses, some stones standing proud of the rest. One tile is `size` metres square.
export function sandstone(renderer,size=2.6){
 const S=1024,[c,x]=sheet(S,S),[b,y]=sheet(S,S),rand=random(83);
 x.fillStyle='#4f463c';x.fillRect(0,0,S,S);y.fillStyle='#1e1e1e';y.fillRect(0,0,S,S);
 const courses=[];for(let top=0;top<S;){let h=Math.round(18+rand()*rand()*84);if(S-top-h<18)h=S-top;courses.push([top,h]);top+=h;}
 for(const [top,h] of courses){
  for(let left=-Math.round(rand()*160);left<S;){
   const w=Math.round(Math.max(h*1.2,70+rand()*330)),warm=rand(),t=rand()*34-17,proud=rand()<.14,lift=proud?215+rand()*30:105+rand()*75;
   const tone=warm<.16?[168+t,137+t,104+t]:warm<.3?[119+t,113+t,104+t]:[150+t,138+t,119+t];
   wrapped(S,left,dx=>{
    const px=left+dx+2,py=top+2,pw=w-4,ph=h-3;
    x.globalAlpha=1;x.fillStyle=rgb(...tone);x.fillRect(px,py,pw,ph);y.fillStyle=rgb(lift,lift,lift);y.fillRect(px,py,pw,ph);
    // The split face of a stone: bedding lines, a lit upper edge and a shaded foot.
    x.save();x.beginPath();x.rect(px,py,pw,ph);x.clip();
    for(let k=0;k<4+ph/5;k++){x.globalAlpha=.07+rand()*.13;x.strokeStyle=rand()<.5?'#e6d9c2':'#544a3d';x.lineWidth=.6+rand()*1.8;const ly=py+rand()*ph;x.beginPath();x.moveTo(px-4,ly);x.bezierCurveTo(px+pw*.3,ly+rand()*4-2,px+pw*.7,ly+rand()*4-2,px+pw+4,ly+rand()*3-1.5);x.stroke();}
    x.globalAlpha=proud?.3:.16;x.fillStyle='#f4ead6';x.fillRect(px,py,pw,2);x.globalAlpha=proud?.42:.22;x.fillStyle='#2c251e';x.fillRect(px,py+ph-3,pw,3);
    x.restore();
   });
   left+=w;
  }
 }
 x.globalAlpha=.05;for(let k=0;k<5200;k++){x.fillStyle=rand()<.5?'#fff':'#000';x.fillRect(rand()*S,rand()*S,1+rand()*2,1+rand()*2);}
 const map=texture(c,renderer),bumpMap=texture(b,renderer,false);for(const t of [map,bumpMap])t.repeat.set(1/size,1/size);
 return {map,bumpMap,bumpScale:.05,roughness:.94};
}

// Painted concrete: the light ochre of the trays, mottled by weather and streaked a little below each edge.
export function ochre(renderer,size=3){
 const S=512,[c,x]=sheet(S,S),rand=random(89);
 x.fillStyle='#e2c596';x.fillRect(0,0,S,S);
 for(let k=0;k<260;k++){
  const px=rand()*S,py=rand()*S,r=18+rand()*70,fill=x.createRadialGradient(0,0,0,0,0,r),tone=rand()<.5?'236,219,184':'184,160,122';
  fill.addColorStop(0,`rgba(${tone},${.03+rand()*.04})`);fill.addColorStop(1,`rgba(${tone},0)`);x.fillStyle=fill;
  for(const dx of [-S,0,S])for(const dy of [-S,0,S]){x.save();x.translate(px+dx,py+dy);x.scale(1,.5+rand()*.7);x.beginPath();x.arc(0,0,r,0,6.2832);x.fill();x.restore();}
 }
 for(let k=0;k<30;k++){const px=rand()*S,w=2+rand()*9;x.globalAlpha=.012+rand()*.018;x.fillStyle=rand()<.6?'#8f7a58':'#f1e3c4';x.fillRect(px,0,w,S);}
 x.globalAlpha=.04;for(let k=0;k<3000;k++){x.fillStyle=rand()<.5?'#fff':'#5a4a30';x.fillRect(rand()*S,rand()*S,1.5,1.5);}
 const map=texture(c,renderer);map.repeat.set(1/size,1/size);return {map,roughness:.82};
}

// Waxed flagstones: broken slabs of the same sandstone fitted together, dark and glossy between pale joints.
// The sheet is worked out point by point, so pause is asked after every row.
export async function flagstone(renderer,size=3.2,pause=()=>{}){
 const S=512,N=8,[c,x]=sheet(S,S),[b,y]=sheet(S,S),rand=random(97),cell=S/N,seeds=[];
 for(let i=0;i<N;i++)for(let j=0;j<N;j++)seeds.push([(i+.15+rand()*.7)*cell,(j+.15+rand()*.7)*cell,rand()*30-15,rand()]);
 const all=[];for(const [sx,sy,t,w] of seeds)for(const dx of [-S,0,S])for(const dy of [-S,0,S])all.push([sx+dx,sy+dy,t,w]);
 // Only the slabs around a point can be its nearest, so they are sorted into squares once and each point asks its own neighbourhood.
 const G=N*3,grid=Array.from({length:G*G},()=>[]);for(const s of all)grid[(Math.floor(s[0]/cell)+N)*G+Math.floor(s[1]/cell)+N].push(s);
 const image=x.createImageData(S,S),bump=y.createImageData(S,S);
 for(let py=0;py<S;py++){await pause();for(let px=0;px<S;px++){
  let d1=1e9,d2=1e9,near=null;
  const ci=Math.floor(px/cell)+N,cj=Math.floor(py/cell)+N;
  for(let a=ci-3;a<=ci+3;a++)for(let b=cj-3;b<=cj+3;b++)for(const s of grid[a*G+b]){const dx=s[0]-px,dy=s[1]-py;if(dx>cell*2.2||dx<-cell*2.2||dy>cell*2.2||dy<-cell*2.2)continue;const d=dx*dx+dy*dy;if(d<d1){d2=d1;d1=d;near=s;}else if(d<d2)d2=d;}
  const edge=Math.sqrt(d2)-Math.sqrt(d1),joint=edge<3.2,i=(py*S+px)*4,grain=(Math.sin(px*.21+near[3]*40)+Math.sin(py*.17+px*.05))*3;
  const tone=near[3]<.2?[104,92,78]:near[3]<.45?[88,84,78]:[96,90,80],k=joint?0:near[2]+grain;
  image.data[i]=joint?58:tone[0]+k;image.data[i+1]=joint?52:tone[1]+k;image.data[i+2]=joint?45:tone[2]+k;image.data[i+3]=255;
  const lift=joint?40:Math.min(200,120+edge*2.4+near[2]);bump.data[i]=bump.data[i+1]=bump.data[i+2]=lift;bump.data[i+3]=255;
 }}
 x.putImageData(image,0,0);y.putImageData(bump,0,0);
 const map=texture(c,renderer),bumpMap=texture(b,renderer,false);for(const t of [map,bumpMap])t.repeat.set(1/size,1/size);
 return {map,bumpMap,bumpScale:.006,roughness:.5,envMapIntensity:.5};
}

// The rock of the ravine: sandstone in level beds, weathered grey and buff, stained where water seeps and mossed where it stays damp.
// One tile is `size` metres.
export function ledge(renderer,size=6){
 const S=1024,[c,x]=sheet(S,S),[b,y]=sheet(S,S),rand=random(101);
 x.fillStyle='#8a7e6c';x.fillRect(0,0,S,S);y.fillStyle='#808080';y.fillRect(0,0,S,S);
 const blot=(tone,alpha,r,sx,sy)=>{
  const px=rand()*S,py=rand()*S,fill=x.createRadialGradient(0,0,0,0,0,r);
  fill.addColorStop(0,`rgba(${tone},${alpha})`);fill.addColorStop(1,`rgba(${tone},0)`);x.globalAlpha=1;x.fillStyle=fill;
  for(const dx of [-S,0,S])for(const dy of [-S,0,S]){x.save();x.translate(px+dx,py+dy);x.scale(sx,sy);x.beginPath();x.arc(0,0,r,0,6.2832);x.fill();x.restore();}
 };
 for(let k=0;k<150;k++)blot(['158,140,112','96,92,86','120,108,92'][k%3],.1+rand()*.14,40+rand()*110,1.5,.7);
 for(let k=0;k<50;k++)blot('52,47,42',.1+rand()*.16,14+rand()*30,.35,2.4);
 // Bedding: many faint level lines, and now and then a parting that has opened.
 for(let k=0;k<420;k++){
  const ly=rand()*S,open=rand()<.045,light=rand()<.45,b1=rand()*8-4,b2=rand()*8-4,soft=.05+rand()*.1,w=.7+rand()*1.5;
  for(const [g,ink,a,width] of [[x,open?'#2f2923':light?'#d9cdb6':'#473f35',open?.4:soft,open?w+1:w],[y,open?'#202020':light?'#b4b4b4':'#3c3c3c',open?.9:.25,open?2.5:1.2]]){
   g.globalAlpha=a;g.strokeStyle=ink;g.lineWidth=width;
   for(const dy of [-S,0,S]){g.beginPath();g.moveTo(0,ly+dy);g.bezierCurveTo(S*.3,ly+dy+b1,S*.7,ly+dy+b2,S,ly+dy);g.stroke();}
  }
 }
 // A few upright hairline cracks.
 for(let k=0;k<16;k++){
  const px=rand()*S,py=rand()*S,len=40+rand()*170,lean=rand()*24-12,w=1+rand()*1.4;
  for(const [g,ink,a] of [[x,'#2f2923',.32],[y,'#262626',.8]]){
   g.globalAlpha=a;g.strokeStyle=ink;g.lineWidth=w;
   for(const dx of [-S,0,S])for(const dy of [-S,0,S]){g.beginPath();g.moveTo(px+dx,py+dy);g.lineTo(px+dx+lean*.4,py+dy+len*.5);g.lineTo(px+dx+lean,py+dy+len);g.stroke();}
  }
 }
 for(let k=0;k<70;k++)blot('180,186,160',.12+rand()*.2,6+rand()*16,1,1);
 for(let k=0;k<90;k++)blot(rand()<.7?'74,92,48':'40,44,34',.2+rand()*.3,16+rand()*55,1.6,.5);
 x.globalAlpha=.05;for(let k=0;k<6000;k++){x.fillStyle=rand()<.5?'#fff':'#000';x.fillRect(rand()*S,rand()*S,1+rand()*2,1+rand()*2);}
 const map=texture(c,renderer),bumpMap=texture(b,renderer,false);for(const t of [map,bumpMap])t.repeat.set(1/size,1/size);
 return {map,bumpMap,bumpScale:.06,roughness:1};
}

// The floor of the woods: fallen leaves, moss and bare earth. One tile is `size` metres.
export function litter(renderer,size=7){
 const S=512,[c,x]=sheet(S,S),rand=random(103);
 x.fillStyle='#5e5a3c';x.fillRect(0,0,S,S);
 const tones=['#6f6238','#4d5a30','#7b6a42','#3f4a2a','#8a7a4c','#566b34'];
 for(let k=0;k<1500;k++){
  const px=rand()*S,py=rand()*S,r=2+rand()*7;x.globalAlpha=.25+rand()*.4;x.fillStyle=tones[k%tones.length];
  for(const dx of [-S,0,S])for(const dy of [-S,0,S]){x.save();x.translate(px+dx,py+dy);x.rotate(rand()*3.14);x.beginPath();x.ellipse(0,0,r,r*.5,0,0,6.2832);x.fill();x.restore();}
 }
 const map=texture(c,renderer);map.repeat.set(1/size,1/size);return {map,roughness:1};
}

// Falling water: soft white ropes of many widths with thinner water between them. The sheet slides down the fall when its offset is moved.
export function cascade(renderer){
 const W=512,H=1024,[c,x]=sheet(W,H),[a,y]=sheet(W,H),rand=random(107);
 x.fillStyle='#f3f8f8';x.fillRect(0,0,W,H);y.fillStyle='#8c8c8c';y.fillRect(0,0,W,H);
 const rope=(w,len,alpha,bright)=>{
  const px=rand()*W,from=rand()*H,b1=rand()*10-5,b2=rand()*10-5,b3=rand()*12-6;
  y.globalAlpha=alpha;y.strokeStyle=bright?'#fff':'#000';x.globalAlpha=alpha*.7;x.strokeStyle=bright?'#fff':'#b4c9cc';
  for(const g of [x,y]){g.lineWidth=w;g.lineCap='round';for(const dy of [-H,0,H])for(const dx of [-W,0,W]){g.beginPath();g.moveTo(px+dx,from+dy);g.bezierCurveTo(px+dx+b1,from+dy+len*.3,px+dx+b2,from+dy+len*.7,px+dx+b3,from+dy+len);g.stroke();}}
 };
 for(let k=0;k<1100;k++)rope(2+rand()*rand()*26,160+rand()*700,.05+rand()*.12,rand()<.6);
 for(let k=0;k<260;k++)rope(1+rand()*1.5,120+rand()*500,.35,true);
 return {map:texture(c,renderer),alphaMap:texture(a,renderer,false)};
}

// Spray hanging at the foot of a fall: one soft cloud, thickest low down.
export function haze(renderer){
 const S=128,[a,y]=sheet(S,S),fill=y.createRadialGradient(0,0,0,0,0,S*.5);
 y.fillStyle='#000';y.fillRect(0,0,S,S);fill.addColorStop(0,'#fff');fill.addColorStop(.45,'#777');fill.addColorStop(1,'#000');
 y.translate(S/2,S*.6);y.scale(1,.8);y.fillStyle=fill;y.beginPath();y.arc(0,0,S*.5,0,6.2832);y.fill();
 const alphaMap=texture(a,renderer,false);alphaMap.wrapS=alphaMap.wrapT=THREE.ClampToEdgeWrapping;return alphaMap;
}

// Foam where the fall lands: thick at the foot, breaking up as it drifts off.
export function foam(renderer){
 const S=256,[a,y]=sheet(S,S),rand=random(109);
 y.fillStyle='#000';y.fillRect(0,0,S,S);
 for(let k=0;k<520;k++){
  const t=rand()*6.2832,r=S*.47*Math.pow(rand(),.8),px=S/2+r*Math.cos(t),py=S/2+r*Math.sin(t),size=(3+rand()*11)*(1.2-r/(S*.5));
  y.globalAlpha=(.25+rand()*.5)*(1-r/(S*.5));y.fillStyle='#fff';y.beginPath();y.ellipse(px,py,size,size*(.4+rand()*.5),rand()*3.14,0,6.2832);y.fill();
 }
 const alphaMap=texture(a,renderer,false);alphaMap.wrapS=alphaMap.wrapT=THREE.ClampToEdgeWrapping;return alphaMap;
}
