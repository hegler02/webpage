// 솔크 연구소 북쪽 동을 문헌 치수와 사진 판독으로 다시 세운 학습용 모형. 원본 도면을 옮긴 것이 아니다.
export const sources={
 CMP:{name:'게티 보존연구소 · 솔크 연구소 보존관리계획(2016)',url:'https://www.getty.edu/publications-reports/item/2K7KYJ'},
 TOUR:{name:'솔크 연구소 · 건축 둘러보기',url:'https://www.salk.edu/about/visiting-salk/virtual-architecture-tour/'},
 GUIDE:{name:'솔크 연구소 · 건축 안내서',url:'https://www.salk.edu/explore-salk-architecture-guide/'},
 WJE:{name:'WJE · 티크 창호 복원 보고',url:'https://www.wje.com/assets/pdfs/articles/Teak-Window-Restoration-Material-Issues-at-the-Salk-Institute_ALA-Magazine.pdf'},
 COMMONS:{name:'위키미디어 공용 · 솔크 연구소 사진 분류',url:'https://commons.wikimedia.org/wiki/Category:Salk_Institute_for_Biological_Studies'}
};
export const basisLabels={doc:'문헌 치수',photo:'사진 판독',guess:'추정'};
export const L=74.68,W=19.81,FF=6.10,CLEAR=3.35,SLAB=.20,ROOF=12.20,BAY=6.096,TOWER=8.84,TOWER_TOP=13.41,AXIS=-25.89,MIRROR=-51.78;
const r=v=>Math.round(v*1000)/1000;
export const rect=(x0,y0,x1,y1)=>[[r(x0),r(y0)],[r(x1),r(y0)],[r(x1),r(y1)],[r(x0),r(y1)]];
export const trussX=i=>r(.76+BAY*i);
export const floorZ=f=>r(-FF+FF*f);
export const slotY=j=>r(.79+1.52*j);
export const towerX=i=>r(16.46*i);
export const colors={concrete:0xbdb5a8,travertine:0xd9cfbd,teak:0x94673f,glass:0x9fc0c8,steel:0x8f979a,water:0x4f8597,bench:0x6e7a7f,hood:0xd7dcdb,paving:0xb3ada2};
const levelNames=['하층','중정층','상층'];

function slots(){
 const holes=[];
 for(let b=0;b<12;b++){let x=trussX(b)+.15+.2065;
  for(const length of [1.42,2.13,1.42]){for(let j=0;j<13;j++)holes.push(rect(x,slotY(j)-.127,x+length,slotY(j)+.127));x+=length+.2065;}}
 return holes;
}
function trussHoles(z){
 const span=(W-.44)/6;
 return [1.52,1.68,1.83,1.83,1.68,1.52].map((h,k)=>{const c=.22+span*(k+.5),m=z+CLEAR+1.375;return [[r(c-span/2+.25),r(m-h/2)],[r(c+span/2-.25),r(m-h/2)],[r(c+span/2-.25),r(m+h/2)],[r(c-span/2+.25),r(m+h/2)]];});
}
function panes(z){
 const holes=[];
 for(let b=0;b<12;b++){const x0=trussX(b)+.23,w=(BAY-.46-.25)/4;
  for(let k=0;k<4;k++){const x=x0+.05+(w+.05)*k;holes.push([[r(x),r(z+.05)],[r(x+w),r(z+.05)],[r(x+w),r(z+2.255)],[r(x),r(z+2.255)]],[[r(x),r(z+2.305)],[r(x+w),r(z+2.305)],[r(x+w),r(z+3.31)],[r(x),r(z+3.31)]]);}}
 return holes;
}

export function salkModel(){
 const elements=[];
 const add=(id,name,footprint,base,height,kind,color,basis,src,extra={})=>{elements.push({id,name,footprint,base:r(base),height:r(height),kind,group:'lab',color,basis,src,...extra});};
 for(let f=0;f<3;f++){const z=floorZ(f),n=f+1,lv=levelNames[f];
  add('lab'+n+'-floor',lv+' 실험실 바닥 슬래브',rect(.01,.01,L-.01,W-.01),z-SLAB,SLAB,'floor',colors.concrete,'guess','CMP',{note:'평면 19.81 × 74.68 m는 문헌 치수이고, 슬래브 두께 0.20 m는 가정했습니다.'});
  add('pipe'+n+'-floor',lv+' 설비층 바닥',rect(.01,.01,L-.01,W-.01),z+CLEAR,SLAB,'floor',colors.concrete,'doc','CMP',{group:'pipe',holes:slots(),note:'실험실 천장이자 설비층 바닥입니다. 1.52 m 간격의 슬롯으로 배관과 전선이 내려옵니다.'});
  for(const [side,y0,y1,gy,label] of [['s',.02,.22,.20,'남쪽'],['n',W-.22,W-.02,W-.26,'북쪽']]){
   add('pipe'+n+'-wall-'+side,lv+' 설비층 '+label+' 외벽',rect(.53,y0,L-.53,y1),z+CLEAR,FF-CLEAR,'wall',colors.concrete,'photo','COMMONS',{group:'pipe'});
   add('lab'+n+'-frame-'+side,lv+' 실험실 '+label+' 창틀',rect(.53,gy,L-.53,gy+.06),z,CLEAR,'frame',colors.steel,'doc','CMP',{profile:{points:[[.53,z],[L-.53,z],[L-.53,r(z+CLEAR)],[.53,r(z+CLEAR)]],depth:.06,start:gy,axis:'x'},profileHoles:panes(z),note:'스테인리스 창틀이며 창 한 조는 5.64 × 3.31 m, 가로대 높이는 2.28 m입니다. 세로 나눔은 가정했습니다.'});
   add('lab'+n+'-glass-'+side,lv+' 실험실 '+label+' 유리',rect(.53,gy+.025,L-.53,gy+.035),z+.05,3.26,'window-glass',colors.glass,'doc','CMP',{note:'6.4 mm 홑판유리입니다. 유리벽 길이는 74.07 m입니다.'});
  }
  for(let i=0;i<13;i++){const x=trussX(i),zb=r(z+CLEAR+.01),zt=r(z+FF-.01);
   add('truss'+n+'-'+(i+1),lv+' 비렌딜 트러스 '+(i+1),rect(x-.15,.22,x+.15,W-.22),zb,zt-zb,'truss',colors.concrete,'doc','CMP',{group:'truss',inner:true,profile:{points:[[.22,zb],[r(W-.22),zb],[r(W-.22),zt],[.22,zt]],depth:.30,start:r(x-.15)},profileHoles:trussHoles(z),note:'춤 2.74 m, 6.10 m 간격, 경간 19.81 m는 문헌 치수입니다. 개구부 여섯 칸은 사진에서 읽었고 두께 0.30 m는 가정했습니다.'});}
  if(f>0)for(const [side,y0,y1,label] of [['s',-1.52,0,'남쪽'],['n',W,W+1.52,'북쪽']])add('walk'+n+'-'+side,lv+' '+label+' 복도',rect(0,y0,L,y1),z-SLAB,SLAB,'floor',colors.concrete,'guess','CMP',{note:'트러스 끝이 내민 자리에 놓인 복도입니다. 폭 1.52 m는 가정했습니다.'});
 }
 add('roof','지붕 슬래브',rect(.01,.01,L-.01,W-.01),ROOF-SLAB,SLAB,'roof',colors.concrete,'doc','CMP',{note:'지붕 슬래브는 중정에서 약 12.2 m 높이입니다.'});
 for(const [id,x0,x1,label] of [['w',0,.53,'서쪽'],['e',L-.53,L,'동쪽']])add('end-'+id,label+' 끝벽',rect(x0,0,x1,W),-FF,FF+ROOF,'wall',colors.concrete,'guess','CMP');
 for(let i=0;i<13;i++){const x=trussX(i);for(const [side,y0,y1] of [['s',0,.46],['n',W-.46,W]])add('col-'+side+(i+1),'기둥 '+side.toUpperCase()+(i+1),rect(x-.23,y0,x+.23,y1),-FF,FF+ROOF,'column',colors.concrete,'guess','CMP',{note:'기둥은 6.10 m 간격으로 긴 변에만 섭니다. 단면 0.46 m는 경간 차이에서 역산했습니다.'});}
 for(const [id,name,b,h,color] of [['bench-1','실험대 1',rect(31.9,6.2,36.7,7.5),.9,colors.bench],['bench-2','실험대 2',rect(31.9,12.3,36.7,13.6),.9,colors.bench],['hood','흄후드',rect(35.4,17.8,36.9,18.75),2.4,colors.hood]])add(id,name,b,0,h,'furniture',color,'guess','CMP',{inner:true,group:'module'});

 for(let i=0;i<5;i++){const x=towerX(i),t='tower'+(i+1),nm='연구실 탑 '+(i+1),g={group:'tower'};
  const poly=[[r(x+.01),-8.59],[r(x+4.01),-8.59],[r(x+4.01),-12.15],[r(x+7.57),-8.59],[r(x+8.83),-8.59],[r(x+8.83),-3.06],[r(x+.01),-3.06]];
  add(t+'-west',nm+' 서쪽 벽',rect(x,-8.59,x+.3,-3.05),-FF,FF+TOWER_TOP,'wall',colors.concrete,'photo','COMMONS',g);
  add(t+'-east',nm+' 동쪽 벽',rect(x+8.54,-8.59,x+8.84,-3.05),-FF,FF+TOWER_TOP,'wall',colors.concrete,'photo','COMMONS',g);
  add(t+'-fin',nm+' 사선 벽',[[r(x+7.6),-8.59],[r(x+4),-12.19],[r(x+4),-11.766],[r(x+7.176),-8.59]],-FF,FF+TOWER_TOP,'wall',colors.concrete,'photo','COMMONS',{...g,note:'창이 서쪽 바다를 보도록 벽을 45도로 틀었습니다. 각도와 길이는 사진에서 읽었습니다.'});
  add(t+'-apron',nm+' 중정층 바닥',rect(x,-12.19,x+TOWER,-3.05),-SLAB,SLAB,'floor',colors.concrete,'photo','COMMONS',g);
  for(const [id,z,label] of [['f2',3.05,'아래 연구실 바닥'],['f3',6.10,'포티코 바닥'],['f4',9.14,'위 연구실 바닥'],['roof',TOWER_TOP+SLAB,'지붕']])add(t+'-'+id,nm+' '+label,poly,z-SLAB,SLAB,id==='roof'?'roof':'floor',colors.concrete,'doc','CMP',{...g,note:'중정층 회랑 3.05 m, 아래 연구실, 상층 실험실과 맞닿는 포티코, 위 연구실 순서로 쌓입니다.'});
  for(const [id,zb,zt,label] of [['low',3.05,FF-SLAB,'아래 연구실'],['up',9.14,TOWER_TOP,'위 연구실']]){
   add(t+'-'+id+'-n',nm+' '+label+' 북쪽 벽',rect(x+.3,-3.35,x+8.54,-3.05),zb,zt-zb,'wall',colors.concrete,'photo','COMMONS',g);
   add(t+'-'+id+'-sw',nm+' '+label+' 남쪽 벽 서편',rect(x+.3,-8.59,x+4,-8.29),zb,zt-zb,'wall',colors.concrete,'photo','COMMONS',g);
   add(t+'-'+id+'-se',nm+' '+label+' 남쪽 벽 동편',rect(x+7.176,-8.59,x+8.54,-8.29),zb,zt-zb,'wall',colors.concrete,'photo','COMMONS',g);
   add(t+'-'+id+'-teak',nm+' '+label+' 티크 창벽',rect(x+4,-11.766,x+4.12,-8.59),zb,zt-zb,'finish',colors.teak,'photo','WJE',{...g,profile:{points:[[-11.766,zb],[-8.59,zb],[-8.59,r(zt)],[-11.766,r(zt)]],depth:.12,start:r(x+4)},profileHoles:[[[-11.1,r(zb+.9)],[-9.3,r(zb+.9)],[-9.3,r(zt-.45)],[-11.1,r(zt-.45)]]],note:'바깥은 버마 티크, 안쪽은 참나무입니다. 창 나눔은 사진에서 읽었습니다.'});
   add(t+'-'+id+'-glass',nm+' '+label+' 창 유리',rect(x+4.05,-11.1,x+4.07,-9.3),zb+.9,zt-zb-1.35,'window-glass',colors.glass,'photo','WJE',g);
   add(t+'-'+id+'-shutter',nm+' '+label+' 뒤쪽 티크 덧문',rect(x-.06,-7.5,x,-4.6),zb+.3,zt-zb-.75,'finish',colors.teak,'guess','WJE',{...g,note:'뒤쪽 연구실 창은 위치를 확인하지 못해 닫힌 덧문으로 두었습니다.'});
  }
  for(const f of [1,2])add(t+'-bridge'+f,nm+' '+levelNames[f]+' 다리',rect(x+2.92,-3.07,x+5.92,-1.52),floorZ(f)-SLAB,SLAB,'floor',colors.concrete,'photo','COMMONS',{...g,note:'탑과 실험실 복도를 층마다 다리가 잇습니다. 폭 3.0 m는 가정했습니다.'});
  add('service'+(i+1),'설비 탑 '+(i+1),rect(x+1.37,W+1.52,x+7.47,W+7.62),-FF,FF+TOWER_TOP,'wall',colors.concrete,'guess','CMP',{group:'service',note:'계단·화장실·창고가 든 바깥쪽 탑입니다. 크기와 수는 가정했습니다.'});
 }
 for(let k=0;k<4;k++){const a=towerX(k)+TOWER,b=towerX(k+1);add('parapet'+(k+1),'아래 뜰 난간벽 '+(k+1),[[r(a-.2),-12.39],[r(b+.2),-12.39],[r(b+.2),-8.59],[r(b),-8.59],[r(b),-12.19],[r(a),-12.19],[r(a),-8.59],[r(a-.2),-8.59]],0,.95,'parapet',colors.concrete,'photo','COMMONS',{group:'pit'});}
 for(const [id,name,b] of [['pit-s','남쪽 아래 뜰 바닥',rect(0,-12.19,L,0)],['pit-n','북쪽 아래 뜰 바닥',rect(0,W,L,W+7.62)]])add(id,name,b,-FF-SLAB,SLAB,'paving',colors.paving,'doc','GUIDE',{group:'pit',note:'탑 사이 아래 뜰은 12.19 × 7.62 m입니다. 하층 실험실에 빛을 들입니다.'});
 for(const [id,b,top] of [['pit-wall-s',rect(-.3,-12.49,L+.3,-12.19),-.25],['pit-wall-n',rect(-.3,W+7.62,L+.3,W+7.92),0],['pit-end-sw',rect(-.3,-12.19,0,0),0],['pit-end-se',rect(L,-12.19,L+.3,0),0],['pit-end-nw',rect(-.3,W,0,W+7.62),0],['pit-end-ne',rect(L,W,L+.3,W+7.62),0]])add(id,'아래 뜰 옹벽',b,-FF,FF+top,'wall',colors.concrete,'guess','GUIDE',{group:'pit'});
 for(const [id,name,b] of [['west-wing','서쪽 사무동',rect(-9.14,0,0,W)],['east-wing','동쪽 기계동',rect(L,0,L+12.19,W)]])add(id,name,b,-FF,FF+ROOF,'wall',colors.concrete,'guess','CMP',{context:true,group:'wing'});

 const my=y=>r(MIRROR-y),flip=points=>points.map(([x,y])=>[x,my(y)]).reverse();
 for(const e of elements.filter(e=>!e.inner)){
  const copy={...e,id:'s-'+e.id,name:'남쪽 동 · '+e.name,context:true,group:'south',footprint:flip(e.footprint)};
  delete copy.holes;delete copy.note;
  if(e.profile){const across=e.profile.axis==='x';
   copy.profile=across?{...e.profile,start:my(e.profile.start+e.profile.depth)}:{...e.profile,points:e.profile.points.map(([u,z])=>[my(u),z]).reverse()};
   if(e.profileHoles)copy.profileHoles=across?e.profileHoles:e.profileHoles.map(h=>h.map(([u,z])=>[my(u),z]));}
  elements.push(copy);
 }
 const A=AXIS,water=[[-21,A-3.5],[-15,A-3.5],[-15,A-.15],[70,A-.15],[70,A-1.2],[72.4,A-1.2],[72.4,A+1.2],[70,A+1.2],[70,A+.15],[-15,A+.15],[-15,A+3.5],[-21,A+3.5]].map(([x,y])=>[x,r(y)]);
 add('court-paving','중정 트래버틴 포장',rect(-22,-39.59,L+3,-12.19),-.25,.25,'paving',colors.travertine,'guess','GUIDE',{group:'court',holes:[water],note:'로마 트래버틴을 띠 모양으로 깔았습니다. 중정 폭과 길이는 문헌에서 찾지 못해 탑 배치에서 가정했습니다.'});
 add('court-water','중정 물길',water,-.20,.14,'water',colors.water,'photo','TOUR',{group:'court',note:'동쪽 샘에서 나온 물이 중정 한가운데를 지나 서쪽 못으로 흐릅니다. 춘분과 추분에는 해가 이 물길 끝으로 집니다. 물길 폭 0.30 m는 가정했습니다.'});
 add('court-basin','물길 바닥',rect(-21.3,A-3.8,72.7,A+3.8),-.40,.20,'floor',colors.concrete,'guess','TOUR',{group:'court',context:true});
 return {name:'솔크 연구소 북쪽 동 재구성',units:'m',source:'문헌 치수와 사진 판독으로 다시 그린 학습용 모형',elements,openings:[]};
}
export const provenance=e=>e?.basis?{label:basisLabels[e.basis],source:sources[e.src]}:null;
