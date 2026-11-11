// Farnsworth House (Mies van der Rohe, Plano, Illinois, 1951) redrawn as a teaching model.
// Sizes named in the literature are used as written; everything else is read from photographs or assumed, and says so.
export const sources={
 WIKI:{name:'Wikipedia · Farnsworth House',url:'https://en.wikipedia.org/wiki/Farnsworth_House'},
 HABS:{name:'미국 의회도서관 · HABS IL-1105',url:'https://www.loc.gov/item/il0323'},
 SAH:{name:'SAH Archipedia · Farnsworth House',url:'https://sah-archipedia.org/node/12908'},
 ROST:{name:'Rost Architects · Farnsworth House',url:'https://www.rostarchitects.com/articles/2023/1/3/farnsworth-house'}
};
export const basisLabels={doc:'문헌 치수',photo:'사진 판독',guess:'추정'};
const r=v=>Math.round(v*1000)/1000,FT=.3048;
export const L=r(77*FT),W=r(28.667*FT),FLOOR=1.6,CLEAR=2.9,CEIL=FLOOR+CLEAR,FASCIA=.381,BAY=r(22*FT),CANT=r(5.5*FT),PORCH=r(22*FT),G=.1;
export const MOD=[r(2.75*FT),r(2*FT)],CX=[0,1,2,3].map(i=>r(CANT+BAY*i)),ROOF=CEIL+FASCIA;
export const RISER=FLOOR/11,TZ=r(RISER*5),GO=.36,TREAD=.4;
// The lower terrace slides one bay to the west: its three column lines continue the 22 ft rhythm of the house.
export const TERR={x0:r(-BAY),x1:r(CX[1]+CANT),y0:r(-.216-BAY),y1:-.216,z:TZ};
export const STAIR={x0:2.93,x1:6.28};
export const CORE={x0:11.4,x1:19,y0:3.4,y1:7.4,body:6.8,h:2.35};
const rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(p=>p.map(r));
export const colors={steel:'#f2f1ec',travertine:'#d9cfb9',glass:'#a9c0c2',primavera:'#c99a57',teak:'#94683f',stainless:'#b8bcbf',concrete:'#b4b2a8',plaster:'#f0ede5',curtain:'#ebe5d4',leather:'#b59f78',dark:'#22201d',roofing:'#8c8a82',linen:'#e8e3d8'};
const notes={
 size:'평면 23.5 × 8.5 m, 바닥 높이 1.60 m, 천장 높이 2.9 m는 문헌에 적힌 치수입니다.',
 column:'기둥은 플랜지 폭 200 mm의 H형강이고 22 ft(6.71 m) 간격입니다. 단면 두께는 W8×48 규격표의 값입니다.',
 fascia:'바닥과 지붕의 가장자리를 두르는 ㄷ형강입니다. 기둥을 이 강재의 바깥면에 용접했습니다. 춤 381 mm는 사진에서 읽었습니다.',
 girder:'문헌은 바닥에 가로보 13개가 1.7 m 간격으로 놓인다고 적습니다. 보의 춤과 슬래브 두께는 추정입니다.',
 pane:'6.4 mm 홑판유리가 바닥부터 지붕까지 한 장입니다. 판을 나누는 자리는 사진에서 읽었습니다.',
 terrace:'아래 테라스의 크기는 석판 600장과 기둥 간격에서 거꾸로 셈한 추정입니다. 높이는 계단 단수에서 셈했습니다.',
 stair:'디딤판은 아래 4단, 위 5단이고 챌판이 없습니다. 폭과 디딤 깊이는 사진에서 읽었습니다.',
 core:'프리마베라 합판 코어는 4.0 × 7.6 m입니다. 놓인 자리와 높이는 사진에서 읽었습니다.',
 furniture:'가구는 자리와 크기를 사진에서 읽어 간단한 모양으로 다시 만들었습니다.'
};

export function farnsworthModel(){
 const elements=[];
 const add=(id,name,footprint,base,height,kind,color,basis,src,extra={})=>elements.push({id,name,footprint,base:r(base),height:r(height),kind,group:'house',color:colors[color]??color,basis,src,...extra});
 const box=(id,name,x0,y0,x1,y1,z0,z1,kind,color,basis,src,extra)=>add(id,name,rect(x0,y0,x1,y1),z0,z1-z0,kind,color,basis,src,extra);
 // H section seen from above: flanges run along the facade, the web points at the house.
 const hPlan=(cx,cy,bf=.206,d=.216,tf=.017,tw=.01)=>[[-bf/2,-d/2],[bf/2,-d/2],[bf/2,-d/2+tf],[tw/2,-d/2+tf],[tw/2,d/2-tf],[bf/2,d/2-tf],[bf/2,d/2],[-bf/2,d/2],[-bf/2,d/2-tf],[-tw/2,d/2-tf],[-tw/2,-d/2+tf],[-bf/2,-d/2+tf]].map(([x,y])=>[r(cx+x),r(cy+y)]);
 // Channel standing on edge: u runs into the building from the outer face at u0, s is +1 or -1.
 const channel=(u0,s,z0,z1,leg=.09,t=.014)=>[[u0,z0],[u0+s*leg,z0],[u0+s*leg,z0+t],[u0+s*t,z0+t],[u0+s*t,z1-t],[u0+s*leg,z1-t],[u0+s*leg,z1],[u0,z1]].map(p=>p.map(r));
 const hSide=(c,z0,z1,bf=.16,tf=.014,tw=.009)=>[[-bf/2,z0],[bf/2,z0],[bf/2,z0+tf],[tw/2,z0+tf],[tw/2,z1-tf],[bf/2,z1-tf],[bf/2,z1],[-bf/2,z1],[-bf/2,z1-tf],[-tw/2,z1-tf],[-tw/2,z0+tf],[-bf/2,z0+tf]].map(([u,z])=>[r(c+u),r(z)]);
 const ring=(key,label,x0,y0,x1,y1,z0,z1,basis,note)=>{
  add(key+'-s',label+' 남쪽',rect(x0,y0,x1,y0+.09),z0,z1-z0,'frame','steel',basis,'WIKI',{note,profile:{points:channel(y0,1,z0,z1),depth:r(x1-x0),start:x0}});
  add(key+'-n',label+' 북쪽',rect(x0,y1-.09,x1,y1),z0,z1-z0,'frame','steel',basis,'WIKI',{note,profile:{points:channel(y1,-1,z0,z1),depth:r(x1-x0),start:x0}});
  add(key+'-w',label+' 서쪽',rect(x0,y0,x0+.09,y1),z0,z1-z0,'frame','steel',basis,'WIKI',{note,profile:{points:channel(x0,1,z0,z1),depth:r(y1-y0),start:y0,axis:'x'}});
  add(key+'-e',label+' 동쪽',rect(x1-.09,y0,x1,y1),z0,z1-z0,'frame','steel',basis,'WIKI',{note,profile:{points:channel(x1,-1,z0,z1),depth:r(y1-y0),start:y0,axis:'x'}});
 };
 const girders=(key,label,xs,y0,y1,z0,z1,basis,note)=>xs.forEach((x,i)=>add(key+(i+1),label+' '+(i+1),rect(x-.08,y0,x+.08,y1),z0,z1-z0,'frame','steel',basis,'WIKI',{note,profile:{points:hSide(x,z0,z1),depth:r(y1-y0),start:y0,axis:'x'}}));

 // Steel frame of the house.
 CX.forEach((x,i)=>{
  add('col-s'+(i+1),'남쪽 기둥 '+(i+1),hPlan(x,-.108),-.05,ROOF-.02,'column','steel','doc','ROST',{note:notes.column});
  add('col-n'+(i+1),'북쪽 기둥 '+(i+1),hPlan(x,W+.108),-.05,ROOF-.02,'column','steel','doc','ROST',{note:notes.column});
  for(const [k,y] of [['s',-.108],['n',W+.108]])box('foot-'+k+(i+1),'콘크리트 기초',x-.38,y-.38,x+.38,y+.38,-.6,.02,'floor','concrete','guess','WIKI',{context:true});
 });
 ring('floor-fascia','바닥 테두리 ㄷ형강',0,0,L,W,FLOOR-FASCIA,FLOOR,'photo',notes.fascia);
 ring('roof-fascia','지붕 테두리 ㄷ형강',0,0,L,W,CEIL,ROOF,'photo',notes.fascia);
 const gx=Array.from({length:13},(_,i)=>r(CANT*(i+1)));
 girders('girder-f','바닥 가로보',gx,.014,W-.014,FLOOR-FASCIA+.004,FLOOR-.08,'guess',notes.girder);
 girders('girder-r','지붕 가로보',gx,.014,W-.014,CEIL+.03,ROOF-.07,'guess',notes.girder);
 box('floor-slab','프리캐스트 콘크리트 바닥판',.014,.014,L-.014,W-.014,FLOOR-.3,FLOOR-.045,'floor','concrete','guess','WIKI',{note:notes.girder});
 box('floor-travertine','트래버틴 바닥',.014,.014,L-.014,W-.014,FLOOR-.045,FLOOR,'paving','travertine','doc','WIKI',{note:'석판 한 장은 0.6 × 0.8 m이고, 실내와 베란다를 같은 줄눈으로 이어 깔았습니다.'});
 box('ceiling','회반죽 천장',.014,.014,L-.014,W-.014,CEIL,CEIL+.03,'finish','plaster','doc','WIKI',{note:'천장은 회반죽 마감입니다. 두께는 추정입니다.'});
 box('roof-slab','프리캐스트 콘크리트 지붕판',.014,.014,L-.014,W-.014,ROOF-.28,ROOF-.09,'roof','concrete','guess','WIKI',{note:notes.girder});
 box('roofing','지붕 방수층',.014,.014,L-.014,W-.014,ROOF-.09,ROOF-.05,'roof','roofing','guess','WIKI',{note:'지붕은 가운데 배수구 쪽으로 기웁니다. 모형에서는 평평하게 그렸습니다.'});
 box('dormer','지붕 설비 상자',14,4.1,16.4,6.5,ROOF-.05,ROOF+.32,'roof','roofing','photo','WIKI',{note:'벽난로 굴뚝, 배기 팬, 물탱크가 모이는 낮은 상자입니다. 크기는 사진에서 읽었습니다.'});
 const stack=Array.from({length:24},(_,i)=>[r(15.2+.6*Math.cos(i/24*Math.PI*2)),r(5.4+.6*Math.sin(i/24*Math.PI*2))]);
 add('service-stack','설비 원통',stack,0,FLOOR-.3,'column','dark','doc','WIKI',{note:'지름 1.2 m 원통 하나로 모든 배관과 덕트가 땅과 이어집니다. 전기 인입도 여기로 올라옵니다.'});

 // Glass walls: stops along floor and ceiling, flat-bar mullions, single plate glass.
 const z0=FLOOR+.045,gh=CLEAR-.09,E=L-G,N=W-G,sx=[PORCH,CX[1],r(CX[1]+BAY/2),CX[2],r(CX[2]+BAY/2),CX[3],E];
 const rail=(id,name,x0,y0,x1,y1)=>{box(id+'-sill',name+' 아래 틀',x0,y0,x1,y1,FLOOR,z0,'frame','steel','photo','WIKI',{context:true});box(id+'-head',name+' 위 틀',x0,y0,x1,y1,CEIL-.045,CEIL,'frame','steel','photo','WIKI',{context:true});};
 rail('rail-s','남쪽 유리벽',PORCH,G-.03,E,G+.03);rail('rail-n','북쪽 유리벽',PORCH,N-.03,E,N+.03);rail('rail-e','동쪽 유리벽',E-.03,G,E+.03,N);rail('rail-w','서쪽 유리벽',PORCH-.03,G,PORCH+.03,N);
 for(const [k,label,y] of [['s','남쪽',G],['n','북쪽',N]]){
  for(let i=0;i<6;i++)box('glass-'+k+(i+1),label+' 유리 '+(i+1),sx[i]+.03,y-.006,sx[i+1]-.03,y+.006,z0,z0+gh,'window-glass','glass','photo','WIKI',{note:notes.pane});
  for(let i=1;i<6;i++)box('mullion-'+k+i,label+' 멀리언 '+i,sx[i]-.03,y-.06,sx[i]+.03,y+.06,FLOOR,CEIL,'frame','steel','photo','WIKI',{note:'유리 두 장이 만나는 자리의 강재 띠입니다. 모서리에는 멀리언이 없습니다.'});
 }
 const ey=[G,3.02,5.72,N];
 box('glass-e1','동쪽 유리 1',E-.006,ey[0]+.03,E+.006,ey[1]-.03,z0,z0+gh,'window-glass','glass','doc','WIKI',{note:notes.pane});
 box('glass-e3','동쪽 유리 3',E-.006,ey[2]+.03,E+.006,ey[3]-.03,z0,z0+gh,'window-glass','glass','doc','WIKI',{note:notes.pane});
 box('glass-e2','동쪽 고정 유리',E-.006,ey[1]+.03,E+.006,ey[2]-.03,z0+.6,z0+gh,'window-glass','glass','doc','WIKI',{note:'가운데 큰 고정 유리 아래에 작은 환기창 두 개가 있습니다.'});
 box('hopper-1','환기창 1',E-.006,ey[1]+.05,E+.006,4.34,z0+.03,z0+.54,'window-glass','glass','doc','WIKI',{note:'이 집에서 열리는 것은 현관문과 이 환기창 두 개뿐입니다.'});
 box('hopper-2','환기창 2',E-.006,4.4,E+.006,ey[2]-.05,z0+.03,z0+.54,'window-glass','glass','doc','WIKI',{note:'이 집에서 열리는 것은 현관문과 이 환기창 두 개뿐입니다.'});
 box('hopper-rail','환기창 위 틀',E-.03,ey[1],E+.03,ey[2],z0+.55,z0+.61,'frame','steel','photo','WIKI',{context:true});
 box('hopper-post','환기창 사이 틀',E-.03,4.34,E+.03,4.4,z0,z0+.55,'frame','steel','photo','WIKI',{context:true});
 [1,2].forEach(i=>box('mullion-e'+i,'동쪽 멀리언 '+i,E-.06,ey[i]-.03,E+.06,ey[i]+.03,FLOOR,CEIL,'frame','steel','photo','WIKI'));
 const wy=[G,3.56,5.7,N];
 box('glass-w1','서쪽 옆유리 남',PORCH-.006,wy[0]+.03,PORCH+.006,wy[1]-.03,z0,z0+gh,'window-glass','glass','doc','WIKI',{note:'현관문 양옆의 유리는 폭이 서로 다릅니다.'});
 box('glass-w2','서쪽 옆유리 북',PORCH-.006,wy[2]+.03,PORCH+.006,wy[3]-.03,z0,z0+gh,'window-glass','glass','doc','WIKI',{note:'현관문 양옆의 유리는 폭이 서로 다릅니다.'});
 [1,2].forEach(i=>box('mullion-w'+i,'현관 문틀 '+i,PORCH-.06,wy[i]-.03,PORCH+.06,wy[i]+.03,FLOOR,CEIL,'frame','steel','photo','WIKI'));
 const dm=(wy[1]+wy[2])/2;
 box('door-1','현관 유리문 남',PORCH-.006,wy[1]+.08,PORCH+.006,dm-.045,z0+.04,z0+gh-.04,'window-glass','glass','doc','WIKI',{leaf:1,note:'유리 두 짝 여닫이문입니다.'});
 box('door-2','현관 유리문 북',PORCH-.006,dm+.045,PORCH+.006,wy[2]-.08,z0+.04,z0+gh-.04,'window-glass','glass','doc','WIKI',{leaf:2,note:'유리 두 짝 여닫이문입니다.'});
 // Each leaf carries its own stiles, rails and pull, so it can swing about its hinge.
 for(const [i,a,b,hinge,meet] of [[1,wy[1]+.03,dm,wy[1]+.03,dm-.045],[2,dm,wy[2]-.03,wy[2]-.08,dm]]){
  const part=(key,name,y0,y1,za,zb,color='steel',x=.025)=>box(`door-${i}-${key}`,name,PORCH-x,y0,PORCH+x,y1,za,zb,'frame',color,'photo','WIKI',{leaf:i});
  part('hinge','문 세로 틀',hinge,hinge+.05,z0,z0+gh);part('meet','문 세로 틀',meet,meet+.045,z0,z0+gh);
  part('sill','문 가로 틀',a,b,z0,z0+.04);part('head','문 가로 틀',a,b,z0+gh-.04,z0+gh);
  part('pull','문 손잡이',i===1?dm-.1:dm+.05,i===1?dm-.05:dm+.1,FLOOR+.98,FLOOR+1.14,'stainless',.07);
 }

 // Lower terrace and the two flights of floating steps.
 const T=TERR,tx=[r(CX[0]-BAY),CX[0],CX[1]];
 ring('terrace-fascia','테라스 테두리 ㄷ형강',T.x0,T.y0,T.x1,T.y1,TZ-.33,TZ,'guess',notes.terrace);
 box('terrace-slab','테라스 바닥판',T.x0+.014,T.y0+.014,T.x1-.014,T.y1-.014,TZ-.27,TZ-.045,'floor','concrete','guess','WIKI',{note:notes.terrace});
 box('terrace-travertine','테라스 트래버틴',T.x0+.014,T.y0+.014,T.x1-.014,T.y1-.014,TZ-.045,TZ,'paving','travertine','guess','WIKI',{note:notes.terrace});
 girders('girder-t','테라스 가로보',Array.from({length:9},(_,i)=>r(T.x0+CANT*(i+1))),T.y0+.014,T.y1-.014,TZ-.326,TZ-.08,'doc','문헌은 테라스에 가로보 9개와 받침 6개(둘은 집의 기둥)가 있다고 적습니다.');
 tx.forEach((x,i)=>{add('col-t'+(i+1),'테라스 남쪽 기둥 '+(i+1),hPlan(x,T.y0-.108),-.05,TZ+.03,'column','steel','doc','WIKI',{note:notes.terrace});box('foot-t'+(i+1),'콘크리트 기초',x-.38,T.y0-.49,x+.38,T.y0+.27,-.6,.02,'floor','concrete','guess','WIKI',{context:true});});
 add('col-t4','테라스 북쪽 기둥',hPlan(tx[0],-.108),-.05,TZ+.03,'column','steel','doc','WIKI',{note:notes.terrace});
 box('foot-t4','콘크리트 기초',tx[0]-.38,-.49,tx[0]+.38,.27,-.6,.02,'floor','concrete','guess','WIKI',{context:true});
 const flight=(key,label,top,zb,n,deep)=>{
  const yb=top-(deep?.8:.08)-(n+1)*GO+(deep?GO:0);
  for(let k=1;k<=n;k++){const y0=yb+k*GO,last=deep&&k===n;box(key+'-tread'+k,label+' 디딤판 '+k,STAIR.x0,y0,STAIR.x1,last?top-.03:y0+TREAD,zb+RISER*k-.05,zb+RISER*k,'paving','travertine','photo','WIKI',{note:notes.stair});}
  const line=y=>zb+RISER*(y-yb)/GO-.215,ya=yb+GO*.6,ye=top-.15;
  [STAIR.x0+.5,STAIR.x1-.5].forEach((x,i)=>add(key+'-stringer'+(i+1),label+' 계단 받침',rect(x-.008,ya,x+.008,ye),line(ya)-.15,line(ye)-line(ya)+.15,'frame','steel','photo','WIKI',{note:'디딤판은 안쪽으로 들인 강재 받침에서 내밀어 떠 보입니다.',profile:{points:[[ya,line(ya)-.15],[ye,line(ye)-.15],[ye,line(ye)],[ya,line(ya)]].map(p=>p.map(r)),depth:.016,start:r(x-.008)}}));
 };
 flight('stair-low','아래 계단',T.y0,0,4,false);flight('stair-up','위 계단',0,TZ,5,true);

 // Core, wardrobe and loose furniture.
 const C=CORE,F=FLOOR;
 box('core','프리마베라 코어',C.x0,C.y0,C.x1,C.body,F,F+C.h,'wall','primavera','doc','WIKI',{note:notes.core});
 box('core-top','코어 윗부분',13.6,4,16.8,6.6,F+C.h,CEIL,'wall','primavera','photo','WIKI',{note:'코어의 벽은 천장에 닿지 않고, 설비실이 있는 가운데만 천장까지 올라갑니다.'});
 box('fireplace','벽난로',14.2,C.y0-.012,16,C.y0,F+.02,F+.82,'finish','dark','photo','WIKI',{note:'코어 남쪽 면의 벽난로입니다. 크기는 사진에서 읽었습니다.'});
 box('hearth','벽난로 바닥돌',14.05,C.y0-.5,16.15,C.y0,F,F+.035,'paving','travertine','photo','WIKI',{note:'벽난로 앞의 트래버틴 바닥돌입니다.'});
 box('kitchen-counter','부엌 조리대',C.x0+.5,C.body,C.x1-.5,C.y1,F,F+.9,'furniture','stainless','photo','WIKI',{note:'코어 북쪽 면의 스테인리스 조리대입니다.'});
 box('kitchen-upper','부엌 윗장',C.x0+.5,C.body,C.x1-.5,C.body+.35,F+1.45,F+2.1,'furniture','primavera','photo','WIKI',{note:notes.furniture});
 for(const [i,x] of [[1,C.x0-.012],[2,C.x1]])box('core-door'+i,i===1?'서쪽 욕실 문':'동쪽 욕실 문',x,4.3,x+.012,5.15,F,F+2.1,'finish','teak','photo','WIKI',{note:'욕실은 코어의 서쪽 끝과 동쪽 끝에 하나씩 있습니다.'});
 box('wardrobe','티크 옷장',19.5,.9,20.1,3.5,F,F+1.8,'furniture','teak','photo','WIKI',{note:'거실과 잠자리 사이를 가리는 낮은 티크 옷장입니다.'});
 box('bed','침대',C.x1+.05,4.3,C.x1+2.1,5.8,F,F+.48,'furniture','linen','photo','WIKI',{note:notes.furniture});
 box('dining-table','식탁',8.4,5.3,10.2,6.2,F,F+.73,'furniture','teak','photo','WIKI',{note:notes.furniture});
 [[8.75,4.95],[9.85,4.95],[8.75,6.55],[9.85,6.55]].forEach(([x,y],i)=>box('dining-chair'+(i+1),'식탁 의자 '+(i+1),x-.26,y-.26,x+.26,y+.26,F,F+.8,'furniture','leather','photo','WIKI',{note:notes.furniture,face:i<2?1:-1}));
 [[12.3,1.25],[13.3,1.25]].forEach(([x,y],i)=>box('lounge-chair'+(i+1),'라운지 의자 '+(i+1),x-.38,y-.38,x+.38,y+.38,F,F+.76,'furniture','leather','photo','WIKI',{note:notes.furniture,face:1}));
 box('coffee-table','낮은 탁자',12.3,2.15,13.3,3.15,F,F+.43,'furniture','glass','photo','WIKI',{note:notes.furniture});
 box('daybed','긴 의자',15.3,1.05,17.25,2,F,F+.4,'furniture','leather','photo','WIKI',{note:notes.furniture});
 box('desk','책상',8.2,1.1,9.9,1.9,F,F+.73,'furniture','teak','photo','WIKI',{note:notes.furniture});
 box('desk-chair','책상 의자',8.8,2.05,9.3,2.55,F,F+.8,'furniture','leather','photo','WIKI',{note:notes.furniture,face:-1});
 // Shantung curtains hang from a track just inside the glass and are drawn back in bunches.
 const drape=(id,name,a,b,fixed,along)=>{const n=Math.max(8,Math.round(Math.abs(b-a)/.045)),pts=[];
  for(let i=0;i<=n;i++){const t=a+(b-a)*i/n,w=fixed+.035*Math.sin(i*1.15);pts.push(along==='x'?[t,w+.012]:[w+.012,t]);}
  for(let i=n;i>=0;i--){const t=a+(b-a)*i/n,w=fixed+.035*Math.sin(i*1.15);pts.push(along==='x'?[t,w-.012]:[w-.012,t]);}
  add(id,name,pts.map(p=>p.map(r)),F+.03,CLEAR-.07,'finish','curtain','photo','WIKI',{note:'산둥 비단 커튼입니다. 걷어 둔 자리는 사진에서 읽어 정했습니다.'});};
 drape('curtain-s1','남쪽 커튼 1',PORCH+.15,PORCH+.95,G+.16,'x');drape('curtain-s2','남쪽 커튼 2',CX[2]-.5,CX[2]+.5,G+.16,'x');drape('curtain-s3','남쪽 커튼 3',E-1.2,E-.2,G+.16,'x');
 drape('curtain-n1','북쪽 커튼 1',PORCH+.15,PORCH+.95,N-.16,'x');drape('curtain-n2','북쪽 커튼 2',19.2,E-.2,N-.16,'x');
 drape('curtain-e1','동쪽 커튼',G+.2,2.6,E-.16,'y');
 return {name:'판스워스 주택',units:'m',source:'문헌 치수와 사진 판독으로 다시 그린 학습용 모형',elements,openings:[]};
}
export const provenance=e=>e?.basis?{label:basisLabels[e.basis],source:sources[e.src]}:null;
