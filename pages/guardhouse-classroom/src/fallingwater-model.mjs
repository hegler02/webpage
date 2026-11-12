// Fallingwater (Frank Lloyd Wright, Mill Run, Pennsylvania, 1937) redrawn as a teaching model.
// Sizes named in the literature are used as written; everything else is read from photographs or assumed, and says so.
// The model's north is the back of the house: the real front faces compass 150 degrees, so "south" here means toward the falls.
export const sources={
 W:{name:'Wikipedia · Fallingwater',url:'https://en.wikipedia.org/wiki/Fallingwater'},
 F:{name:'Fallingwater · Facts',url:'https://fallingwater.org/media-resources/fallingwater-facts/'},
 N:{name:'미국 국립공원청 · 국가사적 지정 신청서(1976)',url:'https://npgallery.nps.gov/pdfhost/docs/NHLS/Text/74001781.pdf'},
 P:{name:'펜실베이니아 주립대 · Fallingwater 구조 사례',url:'https://www.engr.psu.edu/ae/thesis/failures/MKP/failures/failures.wikispaces.com/Fallingwater.html'},
 S:{name:'Structural Technologies · Fallingwater 보강',url:'https://www.structuraltechnologies.com/projects/fallingwater-strengthening/'},
 H:{name:'Fallingwater · Preservation History',url:'https://fallingwater.org/preservation-history/'},
 I:{name:'Iconic Houses · Fallingwater',url:'https://iconichouses.org/specials/fallingwater'},
 L:{name:'미국 의회도서관 · HABS PA-5346',url:'https://www.loc.gov/pictures/item/pa1690/'}
};
export const basisLabels={doc:'문헌 치수',photo:'사진 판독',guess:'추정'};
const r=v=>Math.round(v*1000)/1000,FT=.3048;
// Heights are measured from the stream above the falls. Storey heights are not published; they are set inside the 1.93 to 2.74 m ceiling range the literature gives.
export const F1=3,F2=5.95,F3=8.65,DEPTH=.7,PAR=.66,T=.22,C1=5.2,C2=8.05,C3=10.6,ROOF=10.95,CHIM=r(F1+30*FT),DRIVE=2.55;
export const BAY=r(12*FT),CANT=r(15*FT),OVER=r(6*FT),BX=[0,1,2,3].map(i=>r(.31+BAY*i));
export const MAIN={x0:0,x1:11.6,y0:-CANT,y1:7.1},EAST={x0:11.6,x1:16.6,y0:-CANT,y1:2.6},WEST={x0:-6.4,x1:0,y0:-2.8,y1:2.4};
export const TOWER={x0:-3.8,x1:0,y0:2.4,y1:7.2},STACK={x0:-.45,x1:3,y0:4.9,y1:7.2},HATCH={x0:7,x1:10.6,y0:-3.6,y1:-2.6};
export const UPPER={x0:1.6,x1:9.6,y0:r(-CANT-OVER)},WEST2={x0:-5.4,x1:0,y0:-.6,y1:2.4},BRIDGE={x0:18.5,x1:22.3,y0:-7.6,y1:.9};
export const JOISTS=Array.from({length:9},(_,i)=>r(-3.7+1.22*i));
// Outlines of the three trays, counter-clockwise from the south-west.
export const outlines={
 1:[[WEST.x0,WEST.y0],[0,WEST.y0],[0,MAIN.y0],[EAST.x1,MAIN.y0],[EAST.x1,EAST.y1],[MAIN.x1,EAST.y1],[MAIN.x1,MAIN.y1],[0,MAIN.y1],[0,WEST.y1],[WEST.x0,WEST.y1]],
 2:[[0,MAIN.y0],[UPPER.x0,MAIN.y0],[UPPER.x0,UPPER.y0],[UPPER.x1,UPPER.y0],[UPPER.x1,MAIN.y0],[MAIN.x1,MAIN.y0],[MAIN.x1,MAIN.y1],[0,MAIN.y1]],
 3:[[0,0],[12.4,0],[12.4,7.9],[3,7.9],[3,4.9],[0,4.9]]
};
const rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(p=>p.map(r));
// A right-angled outline drawn in by d, so a slab edge sits just behind the face of the parapet that wraps it.
const inset=(pts,d=.03)=>pts.map((p,i)=>{
 const n=pts.length,a=pts[(i+n-1)%n],b=pts[(i+1)%n],e0=[Math.sign(p[0]-a[0]),Math.sign(p[1]-a[1])],e1=[Math.sign(b[0]-p[0]),Math.sign(b[1]-p[1])];
 return [r(p[0]-(e0[1]+e1[1])*d),r(p[1]+(e0[0]+e1[0])*d)];
});
export const colors={sandstone:'#9c9079',ochre:'#d8c39b',flagstone:'#6c655b',red:'#7d2b1d',walnut:'#6b4a32',glass:'#a9c0c2',cushion:'#d9cdb2',accent:'#b4552e',wool:'#b7a688',enamel:'#e8e4d8',soot:'#1f1c19',bedding:'#e7e0d1',rock:'#8d8473',cork:'#a47f58'};
const notes={
 level:'층 높이는 발표된 값이 없어, 문헌이 밝힌 천장 높이 범위 1.93~2.74 m 안에서 정한 추정입니다.',
 bolster:'폭포 위 바위에 선 받침벽 네 개가 12 ft(3.66 m) 간격으로 1층 바닥을 받칩니다. 셋은 철근콘크리트이고 하나는 돌쌓기입니다. 어느 것이 돌인지와 벽의 모양은 추정입니다.',
 beam:'주보 네 개가 받침벽에서 15 ft(4.57 m)를 내밉니다. 2002년에 이 가운데 세 개에 강연선을 넣어 뒤에서 당겼습니다.',
 joist:'바닥은 4 in(102 mm) 판을 맨 아래에 두고 그 위로 4 × 23 in(102 × 584 mm) 장선이 4 ft(1.22 m) 간격으로 솟는 뒤집힌 T자 구조입니다.',
 parapet:'난간벽 높이는 26 in(0.66 m)입니다. 바닥 구조 두께를 더한 띠 전체가 보처럼 일합니다. 벽 두께와 둥근 모서리는 사진에서 읽었습니다.',
 upper:'2층 테라스는 아래층보다 6 ft(1.83 m) 더 내밉니다. 이 무게가 거실 남쪽 창의 강철 멀리언을 타고 1층 보에 실렸습니다.',
 stone:'현장 가까이에서 캔 포츠빌 사암을 켜켜이 쌓았고, 돌이 줄눈보다 75~100 mm 튀어나옵니다. 벽의 자리와 두께는 사진에서 읽었습니다.',
 chimney:'굴뚝은 1층 바닥에서 30 ft(9.1 m)까지 솟습니다. 평면 크기는 사진에서 읽었습니다.',
 hearth:'벽난로 입구 높이는 6 ft(1.8 m)이고, 그 앞 바닥으로 길이 7 ft(2.1 m)의 원래 바위가 솟아 있습니다.',
 glass:'¼ in(6 mm) 판유리를 붉은 강철 창틀에 끼웠고, 돌벽에는 틀 없이 홈에 바로 끼웠습니다. 창을 나눈 자리는 사진에서 읽었습니다.',
 mullion:'거실 남쪽 창의 T형 강철 멀리언 네 개가 2층 테라스의 무게를 1층 보로 내려 보냅니다. 놓인 자리는 추정입니다.',
 flag:'바닥은 두께 2 in(50 mm) 사암 판석을 깔고 왁스를 먹여 젖은 바위처럼 보이게 했습니다.',
 hatch:'거실 바닥의 유리 덮개를 열면 콘크리트 디딤판이 강철 봉에 매달려 물 바로 위까지 내려갑니다. 단수와 크기는 사진에서 읽었습니다.',
 bridge:'다리 길이는 28 ft(8.5 m)입니다. 폭과 놓인 자리는 사진에서 읽었습니다.',
 trellis:'진입로 위로 콘크리트 보가 집에서 뒤쪽 바위 절벽까지 건너갑니다. 보의 수와 크기는 사진에서 읽었습니다.',
 roof:'지붕 판의 크기와 내민 길이는 사진에서 읽었고, 두께는 추정입니다.',
 furniture:'가구의 절반쯤은 붙박이이고 노스캐롤라이나산 검은 호두나무 무늬목으로 짰습니다. 자리와 크기는 사진에서 읽어 간단한 모양으로 다시 만들었습니다.',
 kitchen:'부엌에는 세인트 찰스의 강철 수납장을 놓았습니다. 자리와 크기는 추정입니다.'
};

export function fallingwaterModel(){
 const elements=[];
 const add=(id,name,footprint,base,height,kind,color,basis,src,extra={})=>elements.push({id,name,footprint,base:r(base),height:r(height),kind,group:'house',color:colors[color]??color,basis,src,...extra});
 const box=(id,name,x0,y0,x1,y1,z0,z1,kind,color,basis,src,extra)=>add(id,name,rect(x0,y0,x1,y1),z0,z1-z0,kind,color,basis,src,extra);
 const cut=holes=>holes.map(([a,b,z0,z1])=>[[a,z0],[b,z0],[b,z1],[a,z1]].map(p=>p.map(r)));
 // A wall on an east-west line (wallX) or a north-south line (wallY) with openings [from, to, sill, head] cut out of it.
 const wallX=(id,name,x0,x1,y0,y1,z0,z1,holes,color,basis,src,extra={})=>add(id,name,rect(x0,y0,x1,y1),z0,z1-z0,'wall',color,basis,src,{...extra,profile:{points:[[x0,z0],[x1,z0],[x1,z1],[x0,z1]].map(p=>p.map(r)),depth:r(y1-y0),start:y0,axis:'x'},profileHoles:cut(holes)});
 const wallY=(id,name,x0,x1,y0,y1,z0,z1,holes,color,basis,src,extra={})=>add(id,name,rect(x0,y0,x1,y1),z0,z1-z0,'wall',color,basis,src,{...extra,profile:{points:[[y0,z0],[y1,z0],[y1,z1],[y0,z1]].map(p=>p.map(r)),depth:r(x1-x0),start:x0},profileHoles:cut(holes)});
 // A parapet in section: the outer face stands at u0 and the body runs inward (s is +1 or -1). The top and the outer foot are rounded.
 const band=(u0,s,z0,z1,t=T,q=.07)=>{
  const arc=(w,z,a0,a1)=>[0,1,2,3,4].map(i=>{const a=(a0+(a1-a0)*i/4)*Math.PI/180;return [w+q*Math.cos(a),z+q*Math.sin(a)];});
  return [...arc(q,z0+q,180,270),[t,z0],...arc(t-q,z1-q,0,90),...arc(q,z1-q,90,180)].map(([w,z])=>[r(u0+s*w),r(z)]);
 };
 // The edge of a tray: dir 'x' runs east-west with its outer face at y = fixed, dir 'y' runs north-south with its outer face at x = fixed.
 const edge=(id,name,dir,fixed,a,b,s,floor,basis,src,note,top=PAR,depth=DEPTH)=>{
  const z0=floor-depth-.004,z1=floor+top,lo=Math.min(fixed,fixed+s*T),hi=Math.max(fixed,fixed+s*T);
  add(id,name,dir==='x'?rect(a,lo,b,hi):rect(lo,a,hi,b),z0,z1-z0,'parapet','ochre',basis,src,{note,profile:{points:band(fixed,s,z0,z1),depth:r(b-a),start:a,...(dir==='y'?{axis:'x'}:{})}});
 };
 // A run of glass with its red steel sash: n bays along the run and transoms at the given heights.
 const glaze=(id,name,dir,fixed,a,b,z0,z1,n,rows,note=notes.glass)=>{
  const g=.012,f=.03,bar=(k,p0,p1,q0,q1)=>dir==='x'?box(id+'-'+k,'강철 창틀',p0,fixed-f,p1,fixed+f,q0,q1,'frame','red','photo','H',{context:true}):box(id+'-'+k,'강철 창틀',fixed-f,p0,fixed+f,p1,q0,q1,'frame','red','photo','H',{context:true});
  add(id,name,dir==='x'?rect(a,fixed-g,b,fixed+g):rect(fixed-g,a,fixed+g,b),z0,z1-z0,'window-glass','glass','doc','H',{note});
  for(let i=0;i<=n;i++){const p=a+(b-a)*i/n;bar('m'+i,p-.02,p+.02,z0,z1);}
  [z0+.025,z1-.025,...rows].forEach((z,i)=>bar('t'+i,a,b,z-.02,z+.02));
 };
 // A flight of steps along x: n risers from z0 to z1, starting at x0 and running in direction dir.
 const flight=(id,name,x0,dir,y0,y1,z0,z1,n,tread,solid,color,basis,src,note)=>{
  const rise=(z1-z0)/n,pts=[[x0,solid?z0-.3:z0-.12]];
  for(let i=1;i<=n;i++){pts.push([x0+dir*(i-1)*tread,z0+i*rise]);if(i<n)pts.push([x0+dir*i*tread,z0+i*rise]);}
  const end=x0+dir*(n-1)*tread;pts.push([end+dir*tread,z1],[end+dir*tread,solid?z0-.3:z1-.3]);
  add(id,name,rect(Math.min(x0,end+dir*tread),y0,Math.max(x0,end+dir*tread),y1),z0,z1-z0,'stair',color,basis,src,{note,profile:{points:pts.map(p=>p.map(r)),depth:r(y1-y0),start:y0,axis:'x'}});
 };

 // Bolsters, main beams and joists under the first floor.
 const S1=F1-DEPTH;
 BX.forEach((x,i)=>add('bolster-'+(i+1),(i?'콘크리트':'돌')+' 받침벽 '+(i+1),rect(x-.3,-.35,x+.3,6),-.3,S1+.3,'column',i?'ochre':'sandstone','doc','P',{note:notes.bolster,profile:{points:[[.5,-.3],[5.6,-.3],[6,S1],[-.35,S1]],depth:.6,start:r(x-.3)}}));
 BX.forEach((x,i)=>box('beam-'+(i+1),'내민 주보 '+(i+1),x-.3,MAIN.y0+T,x+.3,7,S1+.1,F1-.1,'beam','ochre','doc','P',{note:notes.beam}));
 JOISTS.forEach((y,i)=>box('joist-'+(i+1),'뒤집힌 장선 '+(i+1),T,y-.051,MAIN.x1-T,y+.051,S1+.1,F1-.1,'beam','ochre','doc','P',{note:notes.joist}));
 const hatch=rect(HATCH.x0,HATCH.y0,HATCH.x1,HATCH.y1);
 add('slab-1','1층 바닥 판',inset(outlines[1]),S1,.1,'floor','ochre','doc','P',{note:notes.joist,holes:[hatch]});
 add('flag-1','1층 판석 바닥',inset(outlines[1]),F1-.1,.1,'paving','flagstone','doc','N',{note:notes.flag,holes:[hatch]});
 // First-floor tray: the living room and the east terrace share one south edge, the west terrace steps back.
 edge('parapet-1-s','1층 난간벽 남쪽','x',MAIN.y0,0,EAST.x1,1,F1,'doc','W',notes.parapet);
 edge('parapet-1-e','1층 난간벽 동쪽','y',EAST.x1,MAIN.y0,EAST.y1,-1,F1,'doc','W',notes.parapet);
 edge('parapet-1-ne','1층 난간벽 북동쪽','x',EAST.y1,14.7,EAST.x1,-1,F1,'doc','W',notes.parapet);
 edge('parapet-1-w','1층 난간벽 서쪽','y',0,MAIN.y0,WEST.y0+T,1,F1,'doc','W',notes.parapet);
 edge('parapet-1-ws','서쪽 테라스 난간벽 남쪽','x',WEST.y0,WEST.x0,T,1,F1,'doc','W',notes.parapet);
 edge('parapet-1-ww','서쪽 테라스 난간벽 서쪽','y',WEST.x0,WEST.y0,WEST.y1,1,F1,'doc','W',notes.parapet);
 edge('parapet-1-wn','서쪽 테라스 난간벽 북쪽','x',WEST.y1,WEST.x0,TOWER.x0,-1,F1,'doc','W',notes.parapet);

 // Stone: the tower of kitchen, dressing room and study, the chimney, and the walls at the back.
 const ST='사암 벽',Z0=1.2;
 wallX('tower-s','탑 남쪽 '+ST,TOWER.x0,0,TOWER.y0,TOWER.y0+.45,Z0,C3,[[-3.4,-2,F1+.75,C3-.35],[-1.5,-.6,F1,F1+2],[-1.5,-.6,F2,F2+1.95]],'sandstone','photo','N',{note:notes.stone});
 wallY('tower-w','탑 서쪽 '+ST,TOWER.x0,TOWER.x0+.45,TOWER.y0,TOWER.y1,Z0,C3,[[3.5,4.7,F1+1.1,F1+1.9],[3.5,4.7,F2+1,F2+1.8],[3.5,5.5,F3+.9,F3+1.7]],'sandstone','photo','N',{note:notes.stone});
 wallX('tower-n','탑 북쪽 '+ST,TOWER.x0,STACK.x0,TOWER.y1-.45,TOWER.y1,Z0,C3,[[-3,-1.3,F1+1.1,F1+1.9]],'sandstone','photo','N',{note:notes.stone});
 wallY('tower-e','탑 동쪽 '+ST,-.45,0,TOWER.y0,STACK.y0,Z0,C3,[[3.3,4.2,F1,F1+2],[3.3,4.2,F2,F2+1.95],[3.3,4.2,F3,F3+1.9]],'sandstone','photo','N',{note:notes.stone});
 wallX('chimney','굴뚝과 벽난로',STACK.x0,STACK.x1,STACK.y0,STACK.y0+.6,Z0,CHIM,[[.5,2.3,F1,F1+1.8]],'sandstone','doc','W',{note:notes.chimney+' '+notes.hearth});
 box('chimney-core','굴뚝 몸통',STACK.x0,STACK.y0+.6,STACK.x1,STACK.y1,Z0,CHIM,'wall','sandstone','doc','W',{note:notes.chimney});
 box('firebox','벽난로 안쪽',.5,STACK.y0+.56,2.3,STACK.y0+.6,F1,F1+1.8,'finish','soot','photo','W',{context:true});
 add('boulder','벽난로 앞 바위',[[.35,3.95],[1.1,3.7],[2,3.85],[2.45,4.3],[2.4,4.9],[.4,4.9]],F1-.02,.3,'paving','rock','doc','W',{note:notes.hearth,topHeights:[F1+.1,F1+.2,F1+.16,F1+.08,F1+.26,F1+.3]});
 wallX('north-wall','북쪽 '+ST,STACK.x1,12.1,7.1,7.6,1.5,F3-.6,[[5,8.6,F1+1.3,F1+1.95],[3.6,8.2,F2+1.2,F2+1.8]],'sandstone','photo','N',{note:notes.stone});
 wallY('east-wall','동쪽 '+ST,MAIN.x1,12.1,EAST.y1,7.1,1.5,F3-.6,[[5.4,6.4,F1,F1+2],[3.2,4.6,F2+.9,F2+1.8]],'sandstone','photo','N',{note:notes.stone});
 wallX('stair-wall-1','계단 옆 '+ST,4.8,8.7,5.7,6,F1,C1,[],'sandstone','photo','N',{note:notes.stone});
 wallX('loggia-south','현관 남쪽 '+ST,12.1,14.7,EAST.y1,3.1,1.5,F1+2.45,[],'sandstone','photo','N',{note:notes.stone});
 wallY('loggia-east','현관 동쪽 '+ST,14.2,14.7,3.1,7.1,1.5,F1+2.45,[],'sandstone','photo','N',{note:notes.stone});
 box('loggia-floor','현관 판석 바닥',12.1,3.1,14.2,7.1,F1-.3,F1,'paving','flagstone','photo','N',{note:'진입로에서 세 단을 올라 현관에 닿습니다. 현관의 크기는 추정입니다.'});
 [[7.1,7.4,F1-.15],[7.4,7.7,F1-.3]].forEach(([y0,y1,z],i)=>box('entry-step-'+(i+1),'현관 디딤돌 '+(i+1),12.1,y0,14.2,y1,DRIVE-.3,z,'paving','flagstone','doc','N',{note:'현관은 거실보다 세 단 낮습니다. 단 높이는 추정입니다.'}));
 box('tower-floor-1','부엌 판석 바닥',TOWER.x0+.45,TOWER.y0+.45,-.45,TOWER.y1-.45,F1-.3,F1,'paving','flagstone','doc','N',{note:notes.flag});
 [[2,F2,'옷방'],[3,F3,'서재']].forEach(([n,z,name])=>box('tower-floor-'+n,name+' 바닥',TOWER.x0+.45,TOWER.y0+.45,-.45,TOWER.y1-.45,z-.3,z,'paving','flagstone','doc','N',{note:notes.flag}));

 // Second floor: bedrooms behind, the terrace over the living room, and the master terrace pushed 6 ft further out.
 const S2=F2-DEPTH,stair=rect(4.9,6,8.7,7.1);
 add('slab-2','2층 바닥 판',inset(outlines[2]),S2,DEPTH-.05,'floor','ochre','doc','P',{note:notes.upper,holes:[stair]});
 add('flag-2','2층 판석 바닥',inset(outlines[2]),F2-.05,.05,'paving','flagstone','doc','N',{note:notes.flag,holes:[stair]});
 box('ceiling-1','거실 천장',T,MAIN.y0+T,MAIN.x1-T,MAIN.y1,C1,S2,'ceiling','ochre','guess','W',{note:notes.level,context:true});
 edge('parapet-2-s','2층 테라스 난간벽 남쪽','x',UPPER.y0,UPPER.x0,UPPER.x1,1,F2,'doc','P',notes.upper);
 edge('parapet-2-sw','2층 테라스 난간벽 서쪽 내민 곳','y',UPPER.x0,UPPER.y0,MAIN.y0+T,1,F2,'doc','P',notes.upper);
 edge('parapet-2-se','2층 테라스 난간벽 동쪽 내민 곳','y',UPPER.x1,UPPER.y0,MAIN.y0+T,-1,F2,'doc','P',notes.upper);
 edge('parapet-2-s1','2층 난간벽 남서쪽','x',MAIN.y0,0,UPPER.x0+T,1,F2,'doc','W',notes.parapet);
 edge('parapet-2-s2','2층 난간벽 남동쪽','x',MAIN.y0,UPPER.x1-T,MAIN.x1,1,F2,'doc','W',notes.parapet);
 edge('parapet-2-e','2층 난간벽 동쪽','y',MAIN.x1,MAIN.y0,1.2,-1,F2,'doc','W',notes.parapet);
 edge('parapet-2-w','2층 난간벽 서쪽','y',0,MAIN.y0,WEST2.y0+T,1,F2,'doc','W',notes.parapet);
 box('slab-2w','2층 서쪽 테라스 판',WEST2.x0+.03,WEST2.y0+.03,0,WEST2.y1-.03,S2,F2-.05,'floor','ochre','photo','N',{note:'옷방 앞 테라스입니다. 크기는 사진에서 읽었습니다.'});
 box('flag-2w','2층 서쪽 테라스 판석',WEST2.x0+.03,WEST2.y0+.03,0,WEST2.y1-.03,F2-.05,F2,'paving','flagstone','doc','N',{note:notes.flag});
 edge('parapet-2-ws','2층 서쪽 테라스 난간벽 남쪽','x',WEST2.y0,WEST2.x0,T,1,F2,'doc','W',notes.parapet);
 edge('parapet-2-ww','2층 서쪽 테라스 난간벽 서쪽','y',WEST2.x0,WEST2.y0,WEST2.y1,1,F2,'doc','W',notes.parapet);
 edge('parapet-2-wn','2층 서쪽 테라스 난간벽 북쪽','x',WEST2.y1,WEST2.x0,TOWER.x0,-1,F2,'doc','W',notes.parapet);
 const S3=F3-.6;
 wallX('bath-south','욕실 남쪽 '+ST,0,2.6,1.2,1.65,F2,S3,[[.5,2.1,F2+1.3,F2+1.85]],'sandstone','photo','N',{note:notes.stone});
 wallY('bath-west','욕실 서쪽 '+ST,0,.45,1.65,TOWER.y0,F2,S3,[],'sandstone','photo','N',{note:notes.stone});
 wallY('pier-2a','2층 돌벽 서쪽',2.6,3,.2,STACK.y0,F2,S3,[[3.4,4.3,F2,F2+1.95]],'sandstone','photo','N',{note:notes.stone});
 wallY('pier-2b','2층 돌벽 동쪽',8,8.4,.2,4.75,F2,S3,[],'sandstone','photo','N',{note:notes.stone});
 wallX('hall-wall-2','2층 복도 벽',3,MAIN.x1,4.75,4.9,F2,C2,[[6.9,7.7,F2,F2+1.95],[8.8,9.6,F2,F2+1.95]],'ochre','guess','N',{note:'침실과 복도를 나누는 벽입니다. 자리는 추정입니다.'});
 wallX('stair-wall-2','2층 계단 옆 벽',4.8,8.7,5.85,6,F2,C2,[],'sandstone','photo','N',{note:notes.stone});
 flight('stair-1','1층에서 2층으로 오르는 계단',4.8,1,6,7.1,F1,F2,16,.26,true,'flagstone','guess','N','돌벽 사이에 낀 좁은 계단입니다. 자리와 단수는 추정입니다.');
 flight('stair-2','2층에서 3층으로 오르는 계단',4.8,1,6,7.1,F2,F3,15,.26,false,'flagstone','guess','N','아래 계단 바로 위에 겹쳐 놓았습니다. 자리와 단수는 추정입니다.');

 // Third floor: the gallery, the study at the top of the tower and the roof terrace over the master bedroom.
 add('slab-3','3층 바닥 판 · 2층 지붕',inset(outlines[3]),S3,.55,'floor','ochre','photo','N',{note:notes.roof,holes:[stair]});
 box('flag-3','옥상 테라스 판석',T,T,8.4-T,4.9,F3-.05,F3,'paving','flagstone','doc','N',{note:notes.flag});
 box('flag-3g','3층 복도 판석',3,4.9,9.75,7.1,F3-.05,F3,'paving','flagstone','doc','N',{note:notes.flag,holes:[stair]});
 edge('parapet-3-s','옥상 테라스 난간벽 남쪽','x',0,0,8.4,1,F3,'doc','W',notes.parapet,PAR,.6);
 edge('parapet-3-w','옥상 테라스 난간벽 서쪽','y',0,0,TOWER.y0,1,F3,'doc','W',notes.parapet,PAR,.6);
 edge('parapet-3-e','옥상 테라스 난간벽 동쪽','y',8.4,0,4.9,-1,F3,'doc','W',notes.parapet,PAR,.6);
 edge('roof-2-s','2층 지붕 가장자리 남쪽','x',0,8.4-T,12.4,1,F3,'photo','N',notes.roof,.1,.6);
 edge('roof-2-e','2층 지붕 가장자리 동쪽','y',12.4,0,7.9,-1,F3,'photo','N',notes.roof,.1,.6);
 edge('roof-2-n','2층 지붕 가장자리 북쪽','x',7.9,10.2,12.4,-1,F3,'photo','N',notes.roof,.1,.6);
 wallX('gallery-north','3층 북쪽 '+ST,STACK.x1,10.2,7.1,7.6,S3,C3,[[3.6,9.4,F3+1,F3+1.6]],'sandstone','photo','N',{note:notes.stone});
 wallY('gallery-east','3층 동쪽 '+ST,9.75,10.2,4.9,7.1,F3,C3,[],'sandstone','photo','N',{note:notes.stone});
 add('roof-top','맨 위 지붕 판',[[-4.6,1.4],[.7,1.4],[.7,3.7],[10.6,3.7],[10.6,8],[-4.6,8]],C3,ROOF-C3,'roof','ochre','photo','N',{note:notes.roof});

 // Glass in red steel sash.
 const GS=MAIN.y0+T-.06;
 glaze('glass-s','거실 남쪽 창','x',GS,T,MAIN.x1-T,F1+PAR,C1,10,[F1+1.2,F1+1.72]);
 [2.3,4.63,6.97,9.3].forEach((x,i)=>box('mullion-t'+(i+1),'T형 강철 멀리언 '+(i+1),x-.03,GS-.06,x+.03,GS+.1,F1+PAR,C1,'frame','red','doc','P',{note:notes.mullion}));
 glaze('glass-w1','거실 서쪽 창','y',.11,MAIN.y0+T,WEST.y0+T,F1+PAR,C1,2,[F1+1.2,F1+1.72]);
 glaze('glass-w2','서쪽 테라스 유리문','y',.11,WEST.y0+T,TOWER.y0,F1,C1,6,[F1+1.72]);
 glaze('glass-e','동쪽 테라스 유리문','y',MAIN.x1-.11,MAIN.y0+T,EAST.y1,F1,C1,8,[F1+1.72]);
 glaze('glass-tower','탑의 3층 높이 창','x',TOWER.y0+.15,-3.4,-2,F1+.75,C3-.35,2,Array.from({length:14},(_,i)=>r(F1+.75+.43*(i+1))),'세 층을 잇는 세로 창입니다. 가로 창살이 돌 켜와 같은 높이로 이어지고 모서리에는 틀이 없습니다. 크기는 사진에서 읽었습니다.');
 glaze('glass-m','안방 유리문','x',1.2,3,8,F2,C2,6,[F2+1.6]);
 glaze('glass-g','손님방 유리문','x',1.2,8.4,MAIN.x1,F2,C2,4,[F2+1.6]);
 glaze('glass-ge','손님방 동쪽 창','y',MAIN.x1-.11,1.2,EAST.y1,F2,C2,2,[F2+1.6]);
 glaze('glass-3','3층 복도 유리문','x',4.9,3,9.75,F3,C3,7,[F3+1.5]);
 glaze('glass-door','현관 유리문','y',MAIN.x1+.25,5.4,6.4,F1,F1+2,1,[]);

 // The hatch: glass around the opening and steps hung on steel rods down to the stream.
 const H=HATCH,HY0=H.y0+.05,HY1=H.y1-.05,rod=(k,x,y,z0,z1)=>box('hatch-rod-'+k,'매달린 계단 강철 봉',x-.012,y-.012,x+.012,y+.012,z0,z1,'frame','red','photo','N',{context:true});
 glaze('hatch-glass-s','승강구 유리 남쪽','x',H.y0,H.x0,H.x1,F1,F1+.85,4,[]);glaze('hatch-glass-n','승강구 유리 북쪽','x',H.y1,H.x0,H.x1,F1,F1+.85,4,[]);glaze('hatch-glass-w','승강구 유리 서쪽','y',H.x0,H.y0,H.y1,F1,F1+.85,1,[]);
 for(let i=1;i<=13;i++){const x1=H.x1-(i-1)*.25,z=F1-i*.2;
  box('hatch-tread-'+i,'매달린 디딤판 '+i,x1-.28,HY0,x1,HY1,z-.06,z,'stair','ochre','photo','N',{note:notes.hatch});
  if(i%2)for(const [k,y] of [['s',HY0+.03],['n',HY1-.03]])rod(i+k,x1-.14,y,z,S1);}
 box('hatch-landing','물 위 발판',5.9,H.y0-.15,7.1,H.y1+.15,.08,.2,'stair','ochre','photo','N',{note:notes.hatch});
 [[6,H.y0-.08],[7,H.y0-.08],[6,H.y1+.08],[7,H.y1+.08]].forEach(([x,y],i)=>rod('l'+i,x,y,.2,S1));

 // Trellis beams over the drive and over the entry, and the bridge across the stream.
 for(let i=0;i<9;i++){const x=1.2+1.22*i;box('trellis-'+(i+1),'진입로 트렐리스 보 '+(i+1),x-.11,7.6,x+.11,12.9,F2-.55,F2-.15,'beam','ochre','photo','W',{note:notes.trellis});}
 box('trellis-band','트렐리스 테두리 보',.9,7.5,12.1,7.72,F2-.6,F2-.1,'beam','ochre','photo','W',{note:notes.trellis});
 for(let i=0;i<8;i++){const y=3.5+.48*i;box('entry-trellis-'+(i+1),'현관 트렐리스 보 '+(i+1),11.9,y-.07,14.95,y+.07,F1+2.45,F1+2.75,'beam','ochre','doc','W',{note:'현관 위에는 보 여덟 개가 건너갑니다. 크기와 간격은 사진에서 읽었습니다.'});}
 const B=BRIDGE;
 box('bridge-deck','다리 바닥판',B.x0+.03,B.y0,B.x1-.03,B.y1,DRIVE-.5,DRIVE,'floor','ochre','doc','W',{note:notes.bridge});
 edge('bridge-parapet-w','다리 난간벽 서쪽','y',B.x0,B.y0,B.y1,1,DRIVE,'doc','W',notes.bridge,PAR,.5);
 edge('bridge-parapet-e','다리 난간벽 동쪽','y',B.x1,B.y0,B.y1,-1,DRIVE,'doc','W',notes.bridge,PAR,.5);
 box('bridge-abutment-n','다리 받침 북쪽',B.x0-.2,B.y1-1,B.x1+.2,B.y1+.4,-.8,DRIVE-.5,'wall','sandstone','photo','W',{note:notes.bridge});
 box('bridge-abutment-s','다리 받침 남쪽',B.x0-.2,B.y0-.4,B.x1+.2,B.y0+1,-.8,DRIVE-.5,'wall','sandstone','photo','W',{note:notes.bridge});

 // Furniture: about half of it is built in.
 const fur=(id,name,x0,y0,x1,y1,z0,z1,color,extra={})=>box(id,name,x0,y0,x1,y1,z0,z1,'furniture',color,'photo','H',{note:notes.furniture,...extra});
 fur('bench-s','남쪽 창 아래 붙박이 긴 의자',.6,GS+.1,6.6,GS+.88,F1,F1+.4,'cushion',{face:1});
 fur('bench-w','서쪽 창 아래 붙박이 의자',.2,MAIN.y0+T+.9,.95,WEST.y0+.1,F1,F1+.4,'cushion',{face:2});
 fur('dining-table','붙박이 식탁',5.2,4.78,7.6,5.68,F1,F1+.72,'walnut');
 [5.6,6.4,7.2].forEach((x,i)=>fur('dining-chair-'+(i+1),'식탁 의자 '+(i+1),x-.23,4.1,x+.23,4.56,F1,F1+.78,'walnut',{face:1}));
 fur('dining-chair-4','식탁 의자 4',4.5,5,4.96,5.46,F1,F1+.78,'walnut',{face:2});
 fur('coffee-table-1','낮은 탁자 1',2.4,-3.1,3.3,-2.2,F1,F1+.36,'walnut');fur('coffee-table-2','낮은 탁자 2',4.4,-3.1,5.3,-2.2,F1,F1+.36,'walnut');
 [[2.1,-1.6],[3.5,-1.5],[4.9,-1.6],[6.2,-2.6]].forEach(([x,y],i)=>fur('zabuton-'+(i+1),'방석 의자 '+(i+1),x-.33,y-.33,x+.33,y+.33,F1,F1+.34,i%2?'accent':'cushion'));
 fur('shelf-n','식탁 위 붙박이 선반',5.2,5.4,8.6,5.7,F1+1.35,F1+1.4,'walnut');
 fur('kettle','벽난로 주전자',2.42,4.32,2.94,4.84,F1+.34,F1+.86,'red',{note:'벽난로 옆 팔에 매달려 불 위로 돌려 넣는 무쇠 주전자입니다.',src:'W'});
 box('rug-1','거실 깔개',1.5,-3.5,6.9,-.8,F1,F1+.015,'finish','wool','photo','H',{context:true});
 box('kitchen-cabinet','부엌 강철 수납장',TOWER.x0+.5,6.15,-1,6.75,F1,F1+.9,'furniture','enamel','guess','I',{note:notes.kitchen});
 box('range','부엌 조리대',TOWER.x0+.5,4.6,-2.65,5.8,F1,F1+.9,'furniture','enamel','guess','I',{note:notes.kitchen});
 fur('kitchen-table','부엌 식탁',-2,3.4,-1,4.4,F1,F1+.72,'walnut');
 fur('bed-master','안방 침대',4.6,2.6,6.6,4.7,F2,F2+.5,'bedding',{face:-1});
 fur('desk-master','안방 붙박이 책상',3.05,1.4,3.65,3.2,F2,F2+.72,'walnut');
 fur('wardrobe','안방 붙박이 옷장',7.2,4.15,7.95,4.72,F2,F2+1.95,'walnut');
 fur('bed-guest','손님방 침대',9.4,2.6,10.9,4.7,F2,F2+.5,'bedding',{face:-1});
 fur('bed-dressing','옷방 침대',TOWER.x0+.5,4.4,-2.3,6.7,F2,F2+.5,'bedding',{face:-1});
 fur('desk-dressing','옷방 붙박이 책상',-1.9,2.9,-.5,3.5,F2,F2+.72,'walnut');
 fur('desk-study','서재 붙박이 책상',-1.9,2.9,-.5,3.5,F3,F3+.72,'walnut');
 fur('shelf-study','서재 책꽂이',TOWER.x0+.5,6.4,-.5,6.72,F3,F3+1.7,'walnut');
 fur('shelf-gallery','3층 복도 책꽂이',3.2,4.98,4.6,5.28,F3,F3+.9,'walnut');
 fur('bed-gallery','3층 복도 침대',8.75,5.2,9.7,7.05,F3,F3+.5,'bedding',{face:-1});
 return {name:'낙수장',units:'m',source:'문헌 치수와 사진 판독으로 다시 그린 학습용 모형',elements,openings:[]};
}
export const provenance=e=>e?.basis?{label:basisLabels[e.basis],source:sources[e.src]}:null;
