// Yumin Art Museum (Ando Tadao with Gansam, Seopjikoji, 2009) rebuilt for study from published dimensions.
// x runs east and y runs along the axis of the building toward 성산일출봉, about 15 degrees east of true north (an estimate); the hall centre is the origin and z = 0 is the ground the visitor walks in on.
// Nothing here is traced from a drawing: published sizes are marked doc, the rest is read from descriptions or assumed.
import {fitOut} from './yumin-model-fit.mjs';
export const sources={
 K:{name:'권경남, 안도 다다오 유민 미술관의 건축 어휘 및 공간 구성적 특성, KIEAE Journal 21(5), 2021',url:'https://doi.org/10.12813/kieae.2021.21.5.137'},
 J:{name:'제주일보, 섭지코지의 지니어스 로사이 (2016-11-25)',url:'http://www.jejunews.com/news/articleView.html?idxno=2001479'},
 M:{name:'학습용 재구성 (이 사이트의 가정)',url:'https://mirinaeman.com/pages/guardhouse-classroom/yumin.html'}
};
export const basisLabels={doc:'문헌 치수',photo:'글 판독',guess:'추정'};
const r=v=>Math.round(v*1000)/1000;
// Levels: basement floor, roof top, basalt wall top, the north screen wall top and the roof slab.
export const B1=-4.6,TOP=4.6,STONE=3.1,SCREEN=2.2,SLAB=.25,CEIL=TOP-SLAB,LOW=-1;
// Plan: core outer face, core inner face, half the cross arm, quadrant inner edge, ramp ring inner and outer face, round room radius.
export const CORE=14.4,IN=14,ARM=2.5,Q=2.8,RING=17.4,OUT=18,ROUND=6,DRUM=6.3;
// Roof beam of the tall rooms: clear span between wall centres, spacing and depth including the slab.
export const SPAN=11.6,BAY=2.8,DEPTH=1.15,RAIL=1.5;
export const rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(p=>p.map(r));
export const turn=(pts,cx,cy,deg)=>{const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return pts.map(([x,y])=>[r(cx+(x-cx)*c-(y-cy)*s),r(cy+(x-cx)*s+(y-cy)*c)]);};
export const disc=(cx,cy,rad,n=40)=>Array.from({length:n},(_,i)=>[r(cx+rad*Math.cos(i/n*2*Math.PI)),r(cy+rad*Math.sin(i/n*2*Math.PI))]);
export const colors={concrete:'#b9b7b0',floor:'#a9a8a2',basalt:'#4a4a4c',paving:'#6b6a68',water:'#5f8f9c',glass:'#9fc4d0',frosted:'#dfe9ea',steel:'#3a3f44',white:'#ecebe6',wood:'#8a6a4a',plinth:'#e6e3da',bronze:'#7a5a36',lamp:'#e8a94a',leather:'#3b3531',green:'#5d7a4b'};
export const notes={
 core:'전시실을 감싼 노출 콘크리트 벽입니다. 논문은 바깥 벽 높이를 9,200 mm로 적습니다.',
 basalt:'경사로 바깥을 두른 현무암 벽입니다. 논문은 7,700 mm 높이로 적습니다. 두께는 추정입니다.',
 screen:'북쪽 끝의 가벽입니다. 높이 6,800 mm는 문헌 치수이고, 성산일출봉을 담는 가로 띠 개구부의 크기는 추정입니다.',
 slit:'전시실 바닥에서 약 8,500 mm 위에 난 8,650 × 200 mm 띠 창입니다. 놓인 벽은 추정입니다.',
 ramp:'콘크리트 벽과 현무암 벽 사이를 서쪽, 남쪽, 동쪽, 북쪽으로 돌아 지하 입구로 내려가는 야외 경사로입니다. 폭과 기울기는 추정입니다.',
 passage:'남쪽 문에서 북쪽 가벽까지 곧게 난 야외 통로입니다. 지하 전실 위를 지나도록 놓은 것은 추정입니다.',
 fall:'통로 양쪽에서 물이 벽을 타고 흐르는 벽천폭포입니다. 높이와 두께는 추정입니다.',
 gate:'현무암으로 쌓은 남쪽 출입구 "돌의 문"입니다. 크기는 추정입니다.',
 quad:'田자로 나눈 정사각형 평면의 한 칸입니다. 칸의 크기는 연면적 1,185 m²에 맞춘 추정입니다.',
 drum:'십자 전실 한가운데의 원형 방(제2전시실 명작의 방)을 두른 곡면 벽입니다. 지름은 추정입니다.',
 beam:'높은 전시실 지붕을 받치는 보입니다. 원본 구조 도면이 아니라 계산 연습을 위해 놓은 추정 부재입니다.',
 roof:'평지붕 슬래브입니다. 두께는 추정입니다.',
 rail:'논문이 적은 1,500 mm 높이의 난간벽입니다.',
 lamp:'1층 램프의 방 띠 창입니다. 논문은 2,500 mm 높이를 적고, 길이는 추정입니다.',
 annex:'모서리에 놓인 반투명 유리 상자 별관입니다. 자리와 크기는 추정입니다.',
 ticket:'본 전시관 축과 약 30° 틀어 놓은 정방형 유리 상자 티켓 센터입니다. 크기와 거리는 추정입니다.',
 garden:'돌담으로 두른 정원입니다. 자리와 크기는 추정입니다.',
 furniture:'전시대와 가구는 방의 쓰임을 보여 주려고 놓은 것으로, 실제 전시물이 아닙니다.',
 stair:'지하 1층과 1층을 잇는 계단입니다. 자리와 단 수는 추정입니다.',
 pool:'동쪽 전실 위의 얕은 수면입니다. 추정입니다.'
};
export function yuminModel(){
 const elements=[];
 const add=(id,name,footprint,base,height,kind,color,basis,src,extra={})=>elements.push({id,name,footprint,base:r(base),height:r(height),kind,group:'museum',color:colors[color]??color,basis,src,...extra});
 const box=(id,name,x0,y0,x1,y1,z0,z1,kind,color,basis,src,extra)=>add(id,name,rect(x0,y0,x1,y1),z0,z1-z0,kind,color,basis,src,extra);
 const cut=holes=>holes.map(([a,b,z0,z1])=>[[a,z0],[b,z0],[b,z1],[a,z1]].map(p=>p.map(r)));
 const wallX=(id,name,x0,x1,y0,y1,z0,z1,holes,color,basis,src,extra={})=>add(id,name,rect(x0,y0,x1,y1),z0,z1-z0,'wall',color,basis,src,{...extra,profile:{points:[[x0,z0],[x1,z0],[x1,z1],[x0,z1]].map(p=>p.map(r)),depth:r(y1-y0),start:y0,axis:'x'},profileHoles:cut(holes)});
 const wallY=(id,name,x0,x1,y0,y1,z0,z1,holes,color,basis,src,extra={})=>add(id,name,rect(x0,y0,x1,y1),z0,z1-z0,'wall',color,basis,src,{...extra,profile:{points:[[y0,z0],[y1,z0],[y1,z1],[y0,z1]].map(p=>p.map(r)),depth:r(x1-x0),start:x0},profileHoles:cut(holes)});
 // A sloped slab: the footprint is a rectangle and tops gives the surface height at its four corners.
 const slope=(id,name,x0,y0,x1,y1,tops,color,note)=>add(id,name,rect(x0,y0,x1,y1),B1-.3,Math.max(...tops)-B1+.3,'floor',color,'guess','K',{note,topHeights:tops.map(r)});
 // A stair flight climbing along y; the profile is drawn in the y-z plane.
 const flight=(id,name,y0,dir,x0,x1,z0,z1,n,tread)=>{
  const rise=(z1-z0)/n,pts=[[y0,z0-.25]];
  for(let i=1;i<=n;i++){pts.push([y0+dir*(i-1)*tread,z0+i*rise]);if(i<n)pts.push([y0+dir*i*tread,z0+i*rise]);}
  const end=y0+dir*(n-1)*tread;pts.push([end+dir*tread,z1],[end+dir*tread,z1-.25]);
  add(id,name,rect(x0,Math.min(y0,end+dir*tread),x1,Math.max(y0,end+dir*tread)),z0,z1-z0,'stair','concrete','guess','M',{note:notes.stair,profile:{points:pts.map(p=>p.map(r)),depth:r(x1-x0),start:x0}});
 };
 const F=B1-.3,sx=[1,1,-1,-1],sy=[1,-1,-1,1],tag=['ne','se','sw','nw'],kor=['북동','남동','남서','북서'];

 // Floors and the ground-level decks.
 box('slab-b1','지하 1층 바닥 판',-CORE,-CORE,CORE,CORE,F,B1,'floor','floor','guess','K',{note:notes.quad});
 add('slab-1f','1층 바닥 판',rect(-CORE,-CORE,-ARM,CORE),-.3,.3,'floor','floor','guess','K',{note:notes.quad,holes:[rect(-13.95,4,-11.15,9.35)]});
 box('deck-passage','물의 통로 바닥',-ARM,-CORE,ARM,CORE,-.08,0,'floor','paving','photo','K',{note:notes.passage});
 box('deck-passage-slab','물의 통로 바닥 판',-ARM,-CORE,ARM,CORE,-.3,-.08,'floor','concrete','guess','K',{note:notes.passage});
 box('deck-north','북쪽 전망 마당',-RING,CORE,ARM,RING,-.08,0,'floor','paving','photo','K',{note:notes.passage});
 box('deck-north-slab','북쪽 전망 마당 바닥 판',-RING,CORE,ARM,RING,-.3,-.08,'floor','concrete','guess','K',{note:notes.passage});
 box('bridge-south-slab','남쪽 진입 다리 바닥 판',-ARM,-RING,ARM,-CORE,-.3,-.08,'floor','concrete','guess','K',{note:notes.passage});
 box('bridge-south','남쪽 진입 다리',-ARM,-RING,ARM,-CORE,-.08,0,'floor','paving','guess','K',{note:notes.passage});
 box('pool-east','동쪽 수면 바닥',ARM,-ARM,IN,ARM,-.6,-.3,'floor','basalt','guess','M',{note:notes.pool});
 box('water-east','동쪽 수면',ARM,-ARM,IN,ARM,-.3,-.06,'water','water','guess','M',{note:notes.pool});
 add('round-top','명작의 방 천장 판',disc(0,0,DRUM),-.6,.3,'floor','concrete','guess','M',{note:notes.drum});

 // The ramp ring sinks from the north-west corner round to the basement door on the north side.
 slope('ramp-west','서쪽 경사로',-RING,-CORE,-CORE,CORE,[-2,-2,0,0],'paving',notes.ramp);
 slope('ramp-sw','남서 참',-RING,-RING,-CORE,-CORE,[-2,-2,-2,-2],'paving',notes.ramp);
 slope('ramp-south','남쪽 경사로',-CORE,-RING,CORE,-CORE,[-2,-3.3,-3.3,-2],'paving',notes.ramp);
 slope('ramp-se','남동 참',CORE,-RING,RING,-CORE,[-3.3,-3.3,-3.3,-3.3],'paving',notes.ramp);
 slope('ramp-east','동쪽 경사로',CORE,-CORE,RING,CORE,[-3.3,-3.3,B1,B1],'paving',notes.ramp);
 box('ramp-north','지하 입구 앞마당',-ARM,CORE,RING,RING,F,B1,'floor','paving','guess','K',{note:notes.ramp});
 box('deck-end','전망 마당 아래 벽',-ARM-.4,CORE,-ARM,RING,F,-.3,'wall','concrete','guess','M',{note:notes.passage});
 box('rail-deck','전망 마당 난간벽',ARM-.2,CORE,ARM,RING,0,RAIL,'parapet','concrete','doc','K',{note:notes.rail});
 box('rail-bridge-w','진입 다리 난간벽 서쪽',-ARM,-RING,-ARM+.2,-CORE,0,RAIL,'parapet','concrete','doc','K',{note:notes.rail});
 box('rail-bridge-e','진입 다리 난간벽 동쪽',ARM-.2,-RING,ARM,-CORE,0,RAIL,'parapet','concrete','doc','K',{note:notes.rail});

 // Exposed-concrete core walls. The east wall carries the two slit windows of the tall rooms.
 wallY('core-e','콘크리트 외벽 동쪽',IN,CORE,-CORE,CORE,F,TOP,[[4.1,12.75,3.9,4.1],[-12.75,-4.1,3.9,4.1]],'concrete','doc','K',{note:notes.core});
 wallY('core-w','콘크리트 외벽 서쪽',-CORE,-IN,-CORE,CORE,F,TOP,[],'concrete','doc','K',{note:notes.core});
 wallX('core-s-w','콘크리트 외벽 남서쪽',-IN,-ARM,-CORE,-IN,F,TOP,[[-12.6,-4.4,2.5,2.7]],'concrete','doc','K',{note:notes.core});
 wallX('core-s-e','콘크리트 외벽 남동쪽',ARM,IN,-CORE,-IN,F,TOP,[],'concrete','doc','K',{note:notes.core});
 wallX('core-s-m','통로 아래 남쪽 벽',-ARM,ARM,-CORE,-IN,F,-.3,[],'concrete','guess','M',{note:notes.core});
 wallX('core-n-w','콘크리트 외벽 북서쪽',-IN,-ARM,IN,CORE,F,TOP,[[-12,-4.6,.02,2.7]],'concrete','doc','K',{note:notes.core});
 wallX('core-n-e','콘크리트 외벽 북동쪽',ARM,IN,IN,CORE,F,TOP,[],'concrete','doc','K',{note:notes.core});
 wallX('core-n-m','지하 입구 벽',-ARM,ARM,IN,CORE,F,-.3,[[-1.2,1.2,B1+.02,B1+2.6]],'concrete','guess','M',{note:notes.core});
 box('glass-slit-n','제1전시실 띠 창 유리',IN+.19,4.1,IN+.21,12.75,3.9,4.1,'window-glass','glass','doc','K',{note:notes.slit});
 box('glass-slit-s','제3전시실 띠 창 유리',IN+.19,-12.75,IN+.21,-4.1,3.9,4.1,'window-glass','glass','doc','K',{note:notes.slit});
 box('glass-lamp','램프의 방 띠 창 유리',-12.6,-IN-.21,-4.4,-IN-.19,2.5,2.7,'window-glass','glass','doc','K',{note:notes.lamp});

 // Walls along the cross: full height beyond the round room, and only above ground where the round room sits below.
 const door=[9,10.8,B1+.02,B1+2.4],up=[8.4,10.8,.02,2.6];
 for(let i=0;i<4;i++){const a=sx[i],b=sy[i],t=tag[i],k=kor[i],west=a<0;
  const x0=Math.min(a*5.7,a*IN),x1=Math.max(a*5.7,a*IN),y0=Math.min(b*5.7,b*IN),y1=Math.max(b*5.7,b*IN);
  const hx=h=>[Math.min(a*h[0],a*h[1]),Math.max(a*h[0],a*h[1]),h[2],h[3]];
  // East-west wall of the quadrant: the door to the side arm, and on the west side a second door one floor up.
  wallX('part-'+t+'-x',k+' 칸 가로 벽',x0,x1,Math.min(b*ARM,b*Q),Math.max(b*ARM,b*Q),F,TOP,west?[hx(door),hx(up)]:[hx(door)],'concrete','guess','K',{note:notes.quad});
  wallY('part-'+t+'-y',k+' 칸 세로 벽',Math.min(a*ARM,a*Q),Math.max(a*ARM,a*Q),y0,y1,F,TOP,[],'concrete','guess','K',{note:notes.quad});
  box('part-'+t+'-xu',k+' 칸 가로 벽 윗부분',Math.min(a*Q,a*5.7),Math.min(b*ARM,b*Q),Math.max(a*Q,a*5.7),Math.max(b*ARM,b*Q),-.3,TOP,'wall','concrete','guess','K',{note:notes.quad});
  box('part-'+t+'-yu',k+' 칸 세로 벽 윗부분',Math.min(a*ARM,a*Q),Math.min(b*ARM,b*5.7),Math.max(a*ARM,a*Q),Math.max(b*ARM,b*5.7),-.3,TOP,'wall','concrete','guess','K',{note:notes.quad});
  // Curved wall of the round room, from the edge of one arm to the edge of the next.
  const a0=Math.asin(ARM/DRUM),n=10,arc=[];
  for(let j=0;j<=n;j++){const q=a0+(Math.PI/2-2*a0)*j/n;arc.push([a*DRUM*Math.cos(q),b*DRUM*Math.sin(q)]);}
  for(let j=n;j>=0;j--){const q=a0+(Math.PI/2-2*a0)*j/n;arc.push([a*ROUND*Math.cos(q),b*ROUND*Math.sin(q)]);}
  add('drum-'+t,'명작의 방 곡면 벽 '+k,arc.map(p=>p.map(r)),F,(west?-.3:CEIL)-F,'wall','concrete','guess','M',{note:notes.drum});
 }
 // The west arm is closed at ground level: a glass front on the passage side and a concrete end wall.
 box('glass-hall','1층 홀 유리벽',-ARM-.02,-ARM,-ARM+.02,ARM,0,CEIL,'window-glass','glass','guess','M',{note:'통로의 교차점에서 1층 홀로 들어가는 유리벽입니다. 추정입니다.'});
 [[-ARM,'s'],[-.9,'d1'],[.9,'d2'],[ARM,'n']].forEach(([y,k])=>box('frame-hall-'+k,'강철 창틀',-ARM-.04,y-.03,-ARM+.04,y+.03,0,CEIL,'frame','steel','guess','M',{context:true}));
 box('frame-hall-t','강철 창틀',-ARM-.04,-ARM,-ARM+.04,ARM,2.4,2.46,'frame','steel','guess','M',{context:true});
 box('glass-lounge','라운지 유리벽',-12,IN+.19,-4.6,IN+.21,.02,2.7,'window-glass','glass','guess','M',{note:'라운지에서 북쪽 전망 마당을 내다보는 유리벽입니다. 추정입니다.'});
 for(let i=0;i<=4;i++)box('frame-lounge-'+i,'강철 창틀',-12+7.4*i/4-.03,IN+.16,-12+7.4*i/4+.03,IN+.24,.02,2.7,'frame','steel','guess','M',{context:true});

 // Roofs and the beams under the two tall rooms.
 box('roof-ne','제1전시실 지붕 판',ARM,ARM,CORE,CORE,CEIL,TOP,'roof','concrete','guess','M',{note:notes.roof});
 box('roof-se','제3전시실 지붕 판',ARM,-CORE,CORE,-ARM,CEIL,TOP,'roof','concrete','guess','M',{note:notes.roof});
 box('roof-w','서쪽 지붕 판',-CORE,-CORE,-ARM,CORE,CEIL,TOP,'roof','concrete','guess','M',{note:notes.roof});
 for(const [t,k,b] of [['ne','제1전시실',1],['se','제3전시실',-1]])for(let i=1;i<=3;i++){const x=Q+BAY*i;
  box('beam-'+t+'-'+i,k+' 지붕 보 '+i,x-.2,Math.min(b*Q,b*IN),x+.2,Math.max(b*Q,b*IN),CEIL-.9,CEIL,'beam','concrete','guess','M',{note:notes.beam});}
 // Finished ceilings of the low basement rooms: detectors, heads and lights hang from these.
 box('ceiling-sw','지하 남서 칸 천장',-IN,-IN,-Q,-Q,LOW,LOW+.04,'ceiling','white','guess','M');
 box('ceiling-nw','지하 북서 칸 천장',-IN,Q,-Q,IN,LOW,LOW+.04,'ceiling','white','guess','M',{holes:[rect(-13.95,4,-11.15,9.35)]});
 box('ceiling-n','지하 북쪽 전실 천장',-ARM,5.7,ARM,IN,LOW,LOW+.04,'ceiling','white','guess','M');
 box('ceiling-s','지하 남쪽 전실 천장',-ARM,-IN,ARM,-5.7,LOW,LOW+.04,'ceiling','white','guess','M');
 box('ceiling-e','지하 동쪽 전실 천장',5.7,-ARM,IN,ARM,LOW,LOW+.04,'ceiling','white','guess','M');
 box('ceiling-w','지하 서쪽 전실 천장',-IN,-ARM,-5.7,ARM,LOW,LOW+.04,'ceiling','white','guess','M');
 add('ceiling-round','명작의 방 천장',disc(0,0,ROUND),LOW,.04,'ceiling','white','guess','M');

 // Basalt wall round the ramp, the north screen with its slot and the south gate.
 wallY('basalt-w','현무암 벽 서쪽',-OUT,-RING,-OUT,OUT,F,STONE,[],'basalt','doc','K',{note:notes.basalt});
 wallY('basalt-e','현무암 벽 동쪽',RING,OUT,-OUT,OUT,F,STONE,[],'basalt','doc','K',{note:notes.basalt});
 wallX('basalt-s-w','현무암 벽 남서쪽',-RING,-6,-OUT,-RING,F,STONE,[],'basalt','doc','K',{note:notes.basalt});
 wallX('basalt-s-e','현무암 벽 남동쪽',6,RING,-OUT,-RING,F,STONE,[],'basalt','doc','K',{note:notes.basalt});
 wallX('basalt-s-m','돌의 문 아래 벽',-6,6,-OUT,-RING,F,-.2,[],'basalt','guess','M',{note:notes.gate});
 wallX('gate','돌의 문',-6,6,-OUT-.8,-RING,-.2,4.2,[[-1.5,1.5,0,3]],'basalt','photo','K',{note:notes.gate});
 wallX('basalt-n-w','현무암 벽 북서쪽',-RING,-8,RING,OUT,F,STONE,[],'basalt','doc','K',{note:notes.basalt});
 wallX('basalt-n-e','현무암 벽 북동쪽',8,RING,RING,OUT,F,STONE,[],'basalt','doc','K',{note:notes.basalt});
 wallX('screen','북쪽 가벽',-8,8,RING,OUT,F,SCREEN,[[-3,3,1.25,1.8]],'concrete','doc','K',{note:notes.screen});

 // Water walls on both sides of the passage, with the channel at their foot.
 for(const [a,b,t,k] of [[1,1,'ne','북동'],[1,-1,'se','남동'],[-1,-1,'sw','남서'],[-1,1,'nw','북서']]){
  const y0=Math.min(b*ARM,b*CORE),y1=Math.max(b*ARM,b*CORE),x=(u,v)=>[Math.min(a*u,a*v),Math.max(a*u,a*v)];
  box('fall-'+t,'벽천폭포 '+k,x(2.05,ARM)[0],y0,x(2.05,ARM)[1],y1,0,3,'wall','basalt','photo','K',{note:notes.fall});
  box('fall-water-'+t,'벽천폭포 물 '+k,x(2.02,2.05)[0],y0,x(2.02,2.05)[1],y1,.02,3,'water','water','photo','K',{note:notes.fall,fall:a});
  box('channel-'+t,'벽천폭포 물길 '+k,x(1.6,2.02)[0],y0,x(1.6,2.02)[1],y1,0,.015,'water','water','guess','M',{note:notes.fall});
 }

 // Stair between the basement and the lounge: two flights of fourteen risers and a half landing.
 flight('stair-1','계단 아래 단',4,1,-13.9,-12.6,B1,B1+2.3,14,.28);
 box('stair-landing','계단참',-13.9,7.92,-11.2,9.3,B1+2.05,B1+2.3,'stair','concrete','guess','M',{note:notes.stair});
 flight('stair-2','계단 윗단',7.92,-1,-12.5,-11.2,B1+2.3,0,14,.28);
 box('rail-stair','계단 난간벽',-11.2,4,-11.05,9.35,0,1.1,'parapet','concrete','guess','M',{note:notes.stair});

 // Rooms inside the two low basement quadrants.
 const wall=(id,name,x0,y0,x1,y1)=>box(id,name,x0,y0,x1,y1,B1,LOW,'partition','white','guess','M');
 wall('part-staff-1','기계실 칸막이',-8.5,-IN,-8.35,-6.4);wall('part-staff-2','기계실 칸막이',-8.5,-5.4,-8.35,-Q);
 wall('part-plant-1','전기실 칸막이',-IN,-8.2,-11.5,-8.05);wall('part-plant-2','전기실 칸막이',-10.5,-8.2,-8.5,-8.05);
 wall('part-wc-1','화장실 칸막이',-8.5,Q,-8.35,4.2);wall('part-wc-2','화장실 칸막이',-8.5,5.2,-8.35,10.6);wall('part-wc-3','화장실 칸막이',-8.5,11.6,-8.35,IN);
 wall('part-wc-4','화장실 사이 칸막이',-8.35,8.4,-Q,8.55);

 fitOut({add,box,wallX,wallY,elements});
 return {name:'유민미술관',units:'m',source:'문헌 치수와 글 판독으로 다시 그린 학습용 모형',elements,openings:[]};
}
export const provenance=e=>e?.basis?{label:basisLabels[e.basis],source:sources[e.src]}:null;
