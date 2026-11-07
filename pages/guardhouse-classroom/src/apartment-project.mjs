import {registerWorkstation, fitsSupport, circuitDemand, attachCords, restoreOutletAllowance} from './teaching-equipment.mjs';
import {insideElement,boundsOf} from './classroom-project.mjs';
import {routeLength,slabCalculation} from './learning-engine.mjs';
import {resolveFire} from './fire-reasoning.mjs';
import {registeredIds} from './lesson-catalog.mjs';

// An authored educational dwelling, not a reconstruction of a supplied apartment DWG.
export const apartment={
 id:'apartment-02',version:1,lightingCircuit:'AL',lightingSheet:'E-201',powerSheet:'E-202',circuitSheet:'E-203',title:'아파트 한 세대',voltage:220,frequency:60,finishLevel:.12,eyeHeight:1.6,center:[4.2,3.65],sectionY:1.2,camera:[10,10,6.2],daylight:2.1,siteContext:false,
 rooms:[
  {id:'bed1',use:'bedroom',name:'침실 1',bounds:[0,4.4,2.6,7.3],spawn:[1.9,4.95],yaw:.55},
  {id:'bed2',use:'bedroom',name:'침실 2',bounds:[2.72,4.4,5.32,7.3],spawn:[4.65,4.95],yaw:.55},
  {id:'bed3',use:'bedroom',name:'침실 3',bounds:[5.44,4.4,8.4,7.3],spawn:[7.8,4.95],yaw:.55},
  {id:'living',name:'거실·주방',bounds:[2.72,0,8.4,4.28],spawn:[4.1,1.6],yaw:-.7},
  {id:'bath',name:'욕실',bounds:[0,1.82,2.6,3.26],spawn:[1.8,2.1],yaw:1.2},
  {id:'hall',name:'침실 앞 통로',bounds:[0,3.38,2.6,4.28],spawn:[1.7,3.8],yaw:-1.5},
  {id:'entry',name:'현관',bounds:[0,0,2.6,1.7],spawn:[1.3,.8],yaw:-1.4}
 ],
 circuits:[
  {id:'AL',name:'세대 조명',color:'#dea43c',breaker:10,area:2.5,ampacity:20,pf:1,rcd:30},
  {id:'AR',name:'방·거실 콘센트',color:'#4a95c2',breaker:16,area:2.5,ampacity:20,pf:1,rcd:30},
  {id:'AK',name:'주방 전용',color:'#ac7fb9',breaker:16,area:2.5,ampacity:20,pf:1,rcd:30},
  {id:'AF',name:'냉장고 전용',color:'#668bba',breaker:10,area:2.5,ampacity:20,pf:.9,rcd:30},
  {id:'AA',name:'냉방기 전용',color:'#439c85',breaker:16,area:2.5,ampacity:20,pf:.9,rcd:30}
 ],
 panel:{id:'ADB',name:'세대 분전반',kind:'panel',pos:[2.56,.35,1.545],size:[.12,.44,.5],term:'panel'},
 devices:[],
 sheets:[
  {id:'A-201',title:'세대 평면도',menu:'building',plain:'방과 문을 읽기'},
  {id:'A-202',title:'거실 단면도',menu:'building',plain:'층고와 천장 속 공간'},
  {id:'A-203',title:'반사 천장 평면도',menu:'building',view:'ceiling',plain:'방 천장과 같은 조명·감지기 위치'},
  {id:'A-204',title:'거실 쪽 입면도',menu:'building',view:'elevation',plain:'벽·출입문·창문의 높이와 관계'},
  {id:'A-205',title:'창호 치수표',menu:'building',view:'openings',plain:'모델에서 읽은 문·창 치수'},
  {id:'A-206',title:'배관 관통부 상세도',menu:'building',view:'services',plain:'문 상부 벽의 계획 개구부와 배관'},
  {id:'M-201',title:'외벽 재료 구성도',menu:'materials',plain:'외벽의 안쪽과 바깥쪽'},
  {id:'M-202',title:'내벽·욕실 재료 구성도',menu:'materials',plain:'방 사이 벽과 물을 쓰는 벽'},
  {id:'M-203',title:'바닥 재료 구성도',menu:'materials',plain:'마루 아래의 층과 구조 바닥'},
  {id:'S-201',title:'바닥판 배근 학습도',menu:'structure',plain:'대표 바닥판과 철근'},
  {id:'E-201',title:'조명·스위치 배치도',menu:'electrical',view:'lighting',plain:'조명을 켜는 연결'},
  {id:'E-202',title:'콘센트·전원 배치도',menu:'electrical',view:'power',plain:'용도별 회로 나누기'},
  {id:'E-203',title:'세대 분전반 회로도',menu:'electrical',view:'circuit',plain:'기구와 차단기의 관계'},
  {id:'F-201',title:'소방·피난 학습 배치도',menu:'fire',plain:'감지·알림·피난의 연결'}
 ],
 steps:[
  {id:'building',title:'건물과 친해지기',text:'먼저 집을 돌려보세요. 전체 모습과 방의 위치를 알아봅니다.',action:'집 둘러보기',menu:'building'},
  {id:'section',title:'평면도와 단면도 읽기',text:'도면에서 고른 대상이 3D에서도 선택됩니다. 단면도에서는 바닥과 천장 사이 높이를 읽습니다.',action:'단면도 열기',menu:'building',sheet:'A-202'},
  {id:'structure',title:'콘크리트 속 철근 보기',text:'바닥판의 콘크리트와 철근을 비교하고, 피복과 간격이 계산에 어떻게 쓰이는지 확인합니다.',action:'철근 살펴보기',menu:'structure'},
  {id:'electrical',title:'전기기구와 회로 연결하기',text:'분전반에서 벽 속 배관과 스위치를 거쳐 조명까지 전기의 길을 따라갑니다.',action:'전기설계 열기',menu:'electrical'},
  {id:'calculations',title:'조건을 바꿔 계산하기',text:'기구 전력과 하중을 바꾸고 같은 공식으로 결과를 비교합니다.',action:'계산 과정 보기',menu:'calculations'},
  {id:'experience',title:'내가 설계한 집에 들어가기',text:'눈높이로 방에 들어가 불을 켜고, 소방과 안전점검 메뉴에서 배운 연결을 확인합니다.',action:'실내 체험 시작',menu:'experience'}
 ]
};
const lighting=[['bed1',1.3,5.8,30,[1.55,4.46]],['bed2',4,5.8,24,[4.3,4.46]],['bed3',6.9,5.8,24,[7.55,4.46]],['living',5.1,1.7,40,[2.78,.55]],['bath',1.3,2.5,12,[2.78,2.15]],['entry',1.3,.9,8,[2.56,.65]],['living',6.5,3.4,18,[2.78,3.18]],['hall',1.3,3.8,8,[1.9,4.22]]];
for(const [i,[room,x,y,watts,sw]]of lighting.entries()){
 const n=String(i+1).padStart(2,'0'),name=i===6?'주방':apartment.rooms.find(r=>r.id===room).name;
 apartment.devices.push({id:'AL'+n,name:name+' 조명',kind:'light',room,circuit:'AL',switch:'AS'+n,pos:[x,y,2.41],size:[.5,.5,.035],watts,lumens:watts*100});
 const alongX=i<3||room==='hall',center=alongX?[sw[0],4.34,1.245]:[2.66,sw[1],1.245];
 apartment.devices.push({id:'AS'+n,name:name+' 스위치',kind:'switch',room,circuit:'AL',pos:[...sw,1.245],size:alongX?[.085,.035,.12]:[.035,.085,.12],embedded:{center,host:alongX?'partition-bed':'partition-west'}});
}
for(const [id,name,room,circuit,pos,watts]of [
 ['AR01','침실 1 콘센트','bed1','AR',[.05,5,.345],600],['AR02','침실 2 콘센트','bed2','AR',[2.77,5,.345],600],['AR03','침실 3 콘센트','bed3','AR',[8.35,5,.345],600],['AR04','거실 콘센트','living','AR',[8.35,1.6,.345],400],['AK01','주방 조리기구 콘센트','living','AK',[6.2,4.23,1.145],1200],['AF01','냉장고 콘센트','living','AF',[7.6,4.23,.345],150],['AA01','거실 냉방기','living','AA',[8.25,2.1,2.145],900]
 ])apartment.devices.push({id,name,room,circuit,pos,watts,kind:id==='AA01'?'ac':'socket',size:id==='AA01'?[.23,.7,.25]:[.04,.12,.09]});
apartment.panel.pos[2]+=.075;for(const d of apartment.devices){d.pos[2]+=.075;if(d.embedded)d.embedded.center[2]+=.075;}
const workstation = registerWorkstation(apartment, {cabinetId:'ASC1', lampId:'ATL1', bounds:[7.60,5.20,8.30,5.72], outletId:'AR03'});
export const apartmentArea=()=>apartment.rooms.reduce((a,r)=>a+(r.bounds[2]-r.bounds[0])*(r.bounds[3]-r.bounds[1]),0);
export function apartmentModel(){
 const elements=[],openings=[];
 const box=(id,name,b,base,height,kind='fixture',group='fixtures',color)=>{const e={id,name,footprint:[[b[0],b[1]],[b[2],b[1]],[b[2],b[3]],[b[0],b[3]]],base,height,kind,group,color};elements.push(e);return e;};
 const wall=(id,axis,fixed,start,end,thickness,cuts=[],kind='wall')=>{
  let x=start;const rect=(a,b)=>axis==='x'?[a,fixed,b,fixed+thickness]:[fixed,a,fixed+thickness,b];
  for(const [i,c]of [...cuts,{start:end,end,base:0,height:0}].entries()){
   if(c.start>x)box(id+'-'+i,(id.startsWith('partition')?'방을 나누는 내벽':({south:'거실 쪽 외벽',north:'침실 쪽 외벽',west:'현관·욕실 쪽 외벽',east:'주방 쪽 외벽'}[id]??'벽')),rect(x,c.start),0,2.7,kind,'walls');
   if(c.end>c.start){if(c.base)box(id+'-sill-'+i,'창 아래 벽',rect(c.start,c.end),0,c.base,kind,'walls');box(id+'-head-'+i,'문·창 위 벽',rect(c.start,c.end),c.base+c.height,2.7-c.base-c.height,kind,'walls');
    const oid=id+'-opening-'+i,glazed=c.base>0;const frame=rect(c.start,c.end);box(oid,glazed?'창문':'출입문',axis==='x'?[frame[0],fixed+.07,frame[2],fixed+.10]:[fixed+.07,frame[1],fixed+.10,frame[3]],c.base,c.height,glazed?'window-glass':'door','openings');
    openings.push({id:oid,axis,start:c.start,end:c.end,sill:c.base,height:c.height});
    for(const u of [c.start,c.end-.035])box(oid+'-frame-'+u,'창호 세로 틀',rect(u,u+.035),c.base,c.height,'frame','openings');
    for(const z of [c.base,c.base+c.height-.035])box(oid+'-frame-'+z,'창호 가로 틀',rect(c.start,c.end),z,.035,'frame','openings');
   }x=c.end;
  }
 };
 box('apartment-floor','세대 구조 바닥판',[-.2,-.2,8.6,7.5],-.21,.21,'floor','structure');
 box('apartment-upper','위층 구조 바닥판',[-.2,-.2,8.6,7.5],2.7,.21,'roof','roof');
 for(const r of apartment.rooms){box('floor-impact-'+r.id,r.name+' 바닥 완충층',r.bounds,0,.02,'floor','floor-finish');box('floor-insulation-'+r.id,r.name+' 바닥 단열층',r.bounds,.02,.04,'floor','floor-finish');box('floor-screed-'+r.id,r.name+' 난방 모르타르',r.bounds,.06,.052,'floor','floor-finish');box('floor-finish-'+r.id,r.name+' 바닥 마감',r.bounds,.112,.008,'floor','floor-finish');box('ceiling-'+r.id,r.name+' 천장',r.bounds,2.52,.012,'ceiling','ceiling');}
 wall('south','x',-.2,-.2,8.6,.2,[{start:.8,end:1.8,base:0,height:2.22},{start:3.3,end:7.8,base:.35,height:2}]);
 wall('north','x',7.3,-.2,8.6,.2,[{start:.4,end:2.2,base:.95,height:1.4},{start:3.1,end:4.9,base:.95,height:1.4},{start:5.9,end:7.9,base:.95,height:1.4}]);
 wall('west','y',-.2,0,7.3,.2,[]);wall('east','y',8.4,0,7.3,.2,[{start:2.9,end:3.9,base:1.2,height:1.15}]);
 wall('partition-bed','x',4.28,0,8.4,.12,[{start:.5,end:1.4,base:0,height:2.22},{start:3.2,end:4.1,base:0,height:2.22},{start:6.4,end:7.3,base:0,height:2.22}],'partition');
 wall('partition-west','y',2.6,0,7.3,.12,[{start:.75,end:1.65,base:0,height:2.22},{start:2.25,end:3.05,base:0,height:2.22},{start:3.38,end:4.18,base:0,height:2.22}],'partition');
 wall('partition-bed23','y',5.32,4.4,7.3,.12,[],'partition');wall('partition-bath','x',1.7,0,2.6,.12,[],'partition');wall('partition-bath-north','x',3.26,0,2.6,.12,[],'partition');
 for(const [i,r]of apartment.rooms.filter(r=>r.use==='bedroom').entries()){
  const x=r.bounds[0];box('bed-base-'+i,r.name+' 침대 프레임',[x+.25,5.25,x+1.5,7.15],.045,.25,'furniture');box('bed-mattress-'+i,r.name+' 매트리스',[x+.28,5.28,x+1.47,7.12],.295,.18,'fixture','fixtures',0xe5dfce);box('bed-pillow-'+i,'베개',[x+.42,6.72,x+1.3,7.04],.475,.10,'fixture','fixtures',0xf2ede4);box('wardrobe-'+i,r.name+' 옷장',[r.bounds[2]-.6,5.8,r.bounds[2]-.05,7.2],.045,2.2,'furniture');
 }
 box('sofa','거실 소파',[5.3,.25,7.6,1.05],.045,.4,'fixture','fixtures',0x788d87);box('sofa-back','소파 등받이',[5.3,.25,7.6,.45],.445,.42,'fixture','fixtures',0x788d87);
 box('coffee-table','거실 탁자',[5.8,1.3,6.8,1.85],.045,.35,'furniture');box('tv-console','TV 수납장',[8,1,8.35,2.3],.045,.55,'furniture');box('tv','TV',[8.27,1.1,8.32,2.2],.65,.65,'fixture','fixtures',0x273c41);
 box('kitchen','주방 하부장',[5.6,3.65,7.6,4.23],.045,.83,'furniture');box('counter','주방 상판',[5.58,3.62,7.62,4.24],.875,.03,'fixture','fixtures',0xe2ded4);box('sink','싱크대',[5.85,3.7,6.4,4.1],.906,.012,'fixture','fixtures',0x8d9da4);box('hob','전기 조리기구',[6.8,3.7,7.35,4.1],.906,.02,'fixture','fixtures',0x243035);box('fridge','냉장고',[7.7,3.5,8.35,4.23],.045,1.85,'fixture','fixtures',0xd6d7d0);
 box('dining-table','식탁',[3.5,3.1,4.6,3.8],.74,.045,'furniture');for(const x of [3.55,4.45])for(const y of [3.15,3.65])box('table-leg-'+x+'-'+y,'식탁 다리',[x,y,x+.055,y+.055],.045,.695,'fixture','fixtures',0x495b59);
 box('toilet','양변기',[.25,3.4,.8,4.1],.045,.42,'fixture','fixtures',0xebe9df);box('basin','세면대',[1.6,3.7,2.35,4.2],.7,.15,'fixture','fixtures',0xf1eee5);box('shower','샤워 공간',[.1,1.9,1.1,2.8],.046,.02,'floor','fixtures');box('shoe-cabinet','신발장',[.1,.1,.5,1.55],.045,2.2,'furniture');
 // Explicit sleeves through internal partition headers; these are authored openings, not ignored clashes.
 const ports=[['partition-west-head-2','y',3.8],['partition-west-head-1','y',2.65],['partition-west-head-0','y',1.2],['partition-bed-head-0','x',.95],['partition-bed-head-1','x',3.65],['partition-bed-head-2','x',6.85]];
 for(const [id,axis,u]of ports){const e=elements.find(e=>e.id===id),b=boundsOf(e),start=axis==='x'?b[0]:b[1],end=axis==='x'?b[2]:b[3];e.profile={axis,start:axis==='x'?b[1]:b[0],depth:.12,points:[[start,e.base],[end,e.base],[end,e.base+e.height],[start,e.base+e.height]]};e.profileHoles=[[[u-.04,2.51],[u+.04,2.51],[u+.04,2.59],[u-.04,2.59]]];e.serviceOpening={axis,width:.08,height:.08,center:u,elevation:2.55,role:'전기 배관용 계획 관통부'};}
 for(const e of elements){if(['kitchen','counter','sink','hob'].includes(e.id))e.footprint=e.footprint.map(p=>[p[0]-1.4,p[1]]);if(e.id==='dining-table'||e.id.startsWith('table-leg-'))e.footprint=e.footprint.map(p=>[p[0],p[1]-1.25]);if(['toilet','basin'].includes(e.id)){const dx=e.id==='toilet'?.75:0,dy=e.id==='toilet'?-.85:-1.05;e.footprint=e.footprint.map(p=>[p[0]+dx,p[1]+dy]);}if(e.id==='shower')e.footprint=[[.1,1.9],[1,1.9],[1,2.9],[.1,2.9]];if(e.group==='fixtures')e.base+=.075;if(e.kind==='door'){e.base=.12;e.height=2.1;}}
 elements.push(structuredClone(workstation));
 return {name:'아파트 교육용 샘플 2',units:'metres',source:'자체 제작 교육용 평면',elements,openings};
}
export function freshApartment(){return {version:1,equipmentVersion:1,power:true,breakers:{},switches:{},watts:{},positions:{},checks:{},completed:[],palette:'warm',fireSignal:null,battery:true};}
export function restoreApartment(raw){const s=freshApartment();if(raw?.version!==1)return s;s.completed=Array.isArray(raw.completed)?registeredIds(apartment.steps,raw.completed):[];s.palette=['warm','neutral','walnut'].includes(raw.palette)?raw.palette:'warm';if(typeof raw.power==='boolean')s.power=raw.power;if(typeof raw.battery==='boolean')s.battery=raw.battery;for(const c of apartment.circuits)if(typeof raw.breakers?.[c.id]==='boolean')s.breakers[c.id]=raw.breakers[c.id];for(const d of apartment.devices){if(d.support&&fitsSupport(d,raw.positions?.[d.id]))s.positions[d.id]=raw.positions[d.id];if((d.kind==='switch'||d.support)&&typeof raw.switches?.[d.id]==='boolean')s.switches[d.id]=raw.switches[d.id];if(d.watts&&Number.isFinite(raw.watts?.[d.id])&&raw.watts[d.id]>=(d.id==='AR03'?0:1)&&raw.watts[d.id]<=5000)s.watts[d.id]=raw.watts[d.id];}restoreOutletAllowance(s,raw,apartment.devices.find(d=>d.socket));for(const {id} of apartmentChecks)if(typeof raw.checks?.[id]==='boolean')s.checks[id]=raw.checks[id];return s;}
export function apartmentRoute(d){
 const a=apartment.panel.pos,[x,y,z]=d.pos,h=2.55,common=[a,[2.66,.35,a[2]],[2.66,.35,h],[3,.35,h],[3,3.8,h]];
 const door={bed1:.95,bed2:3.65,bed3:6.85}[d.room];
 const via=door?[[door,3.8,h],[door,4.7,h],[x,4.7,h]]:d.room==='bath'?[[3,2.65,h],[2.9,2.65,h],[1.8,2.65,h],[x,2.65,h]]:d.room==='entry'?[[3,1.2,h],[1.8,1.2,h],[x,1.2,h]]:[[x,3.8,h]];
 const end=d.embedded?[[x,y,h],[d.embedded.center[0],d.embedded.center[1],h],d.embedded.center,d.pos]:[[x,y,h],d.pos];
 return [...common,...via,...end].filter((p,i,a)=>!i||routeLength([a[i-1],p])>1e-6);
}
import {applyPowerState} from './power-reasoning.mjs';
export function apartmentElectrical(state){
 const devices=[apartment.panel,...apartment.devices].map(d=>({...d,pos:d.support&&fitsSupport(d,state.positions?.[d.id])?[...state.positions[d.id],d.pos[2]]:[...d.pos],watts:state.watts[d.id]??d.watts}));
 attachCords(devices);
 const routes=devices.filter(d=>d.circuit&&!d.socket).map(d=>({id:'route-'+d.id,kind:'conduit',name:d.name+' 전선관',circuit:d.circuit,target:d.id,diameter:.016,points:apartmentRoute(d)}));
 const circuits=apartment.circuits.map(c=>{const {loads,watts,current}=circuitDemand(devices,c,apartment.voltage),length=Math.max(...routes.filter(r=>r.circuit===c.id).map(r=>routeLength(r.points))),drop=2*.0175*length*current/c.area;return {...c,watts,current,length,drop,percent:drop/apartment.voltage*100,loads:loads.map(d=>d.id),pass:current<=c.breaker&&c.breaker<=c.ampacity&&drop/apartment.voltage*100<=3};});
 return {routes,circuits,devices:applyPowerState(devices,{circuits,state,panel:apartment.panel}).map(d=>({...d,lumens:d.kind==='light'?d.watts*100:undefined}))};
}
export function apartmentWalk(x,y,model){if(x<.14||x>8.26||y<.14||y>7.16)return false;return !model.elements.filter(e=>['wall','partition','furniture','fixture'].includes(e.kind)&&e.base<1.8&&e.base+e.height>.3).some(e=>[[x,y],[x-.13,y],[x+.13,y],[x,y-.13],[x,y+.13]].some(p=>insideElement(p,e)));}
import {rebarSize} from './rebar-sizes.mjs';
export const apartmentSlabDesign=Object.freeze({span:2.6,thickness:210,cover:25,diameter:10,spacing:150,live:2,finish:1.5});
export function apartmentRebar(){
 const bars=[],id='apartment-floor',{cover,diameter,spacing,thickness}=apartmentSlabDesign;
 const nominal=rebarSize(diameter).nominal,center=(cover+nominal/2)/1000,step=spacing/1000;
 for(const z of [-thickness/1000+center,-center]){
  // X-direction primary steel is the outer tension layer used by the 2.6 m strip calculation.
  for(let y=center;y<=7.3-center;y+=step)bars.push({parent:id,a:[center,y,z],b:[8.4-center,y,z],diameter,nominal});
  const crossZ=z+(z<-.1?nominal/1000:-nominal/1000);
  for(let x=center;x<=8.4-center;x+=step)bars.push({parent:id,a:[x,center,crossZ],b:[x,7.3-center,crossZ],diameter,nominal});
 }
 bars.forEach((bar,i)=>{bar.id='rebar-apartment-floor-'+(i+1);bar.sheet='S-201';});
 return {bars,members:[{id,name:'세대 바닥판',diameter,nominal,spacing,cover,sheet:'S-201',count:bars.length}]};
}
export const apartmentSlab=()=>slabCalculation(apartmentSlabDesign);
export function apartmentFire(s){
 const devices=apartment.rooms.filter(r=>r.id!=='bath'&&r.id!=='entry').map((r,i)=>({id:'AD'+(i+1),name:r.name+' 연기감지기',room:r.id,kind:'smoke',pos:r.bounds[3]-r.bounds[1]<1.5?[(r.bounds[0]+r.bounds[2])/2+.6,(r.bounds[1]+r.bounds[3])/2,2.495]:[(r.bounds[0]+r.bounds[2])/2,(r.bounds[1]+r.bounds[3])/2+.35,2.495],size:[.12,.12,.04],system:'fire',term:'detector'}));
 devices.push({id:'AH1',name:'주방 열감지기',room:'living',kind:'heat',pos:[6.7,3.2,2.495],size:[.12,.12,.04]}, {id:'AX1',name:'현관 소화기',kind:'extinguisher',pos:[2.2,.3,.375],size:[.18,.18,.5]}, {id:'AE1',name:'휴대용비상조명등',kind:'emergency',pos:[2.56,.55,1.575],size:[.07,.12,.18]}, {id:'AB1',name:'세대 경보 장치',kind:'bell',pos:[2.56,.35,2.175],size:[.08,.18,.18]});
  return resolveFire(devices.map(d=>({...d,system:'fire',term:d.term??'fire'})),{mains:s.power,battery:s.battery,signal:s.fireSignal});
}
export const apartmentChecks=[
 {id:'exit',name:'출입구까지 통로가 이어지는가?',target:'room-entry',detail:'침실 문에서 거실·현관으로 이어지는 통로를 도면과 3D에서 확인합니다.'},
 {id:'light',name:'스위치와 해당 방 조명이 연결되는가?',target:'AL01',detail:'스위치, 차단기, 주전원을 각각 끊어 보고 결과를 비교합니다.'},
 {id:'socket',name:'주방과 일반 콘센트 회로가 구분되는가?',target:'AK01',detail:'같은 콘센트 모양이어도 회로와 사용하는 전력이 다릅니다.'},
 {id:'fire',name:'감지 신호가 경보에 도달하는가?',target:'AD1',detail:'화재 시험을 실행하고 감지기와 경보 장치의 상태를 확인합니다.'},
 {id:'backup',name:'정전 때 소방 예비전원 역할을 아는가?',target:'AE1',detail:'주전원과 예비전원을 하나씩 꺼서 시험 결과를 비교합니다.'},
 {id:'structure',name:'벽·철근·배관의 관계를 구분하는가?',target:'apartment-floor',detail:'배근 학습도에서 콘크리트와 철근을 비교하고, 관통부는 별도 조정이 필요한 위치임을 확인합니다.'}
];
