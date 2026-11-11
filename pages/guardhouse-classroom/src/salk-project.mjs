import {routeLength} from './learning-engine.mjs';
import {applyPowerState} from './power-reasoning.mjs';
import {resolveFire} from './fire-reasoning.mjs';
import {L,W,CLEAR,SLAB,BAY,AXIS,trussX,slotY,towerX} from './salk-model.mjs';

// 전기·소방은 원본 설계가 아니다. 이 건물을 오늘 한국 기준으로 설계한다면 어떻게 되는지를 새로 풀었다.
export const project={name:'솔크 연구소',center:[37.34,-13],fade:[360,500],day:{sun:4.4,exposure:1.25,env:1.3,ambient:.7,turbidity:7,rayleigh:2.4,mie:.009,skyRich:1.6},shadowFloor:-6.4,shadowReach:90,site:{name:'라호이아',lat:32.887,lon:-117.246,tz:-8}};
const X0=trussX(5),X1=trussX(6),MID=(X0+X1)/2,PIPE=CLEAR+SLAB,TRAY=5.3;
export const moduleBay={x0:X0,x1:X1,y0:.26,y1:W-.26,mid:MID,ceiling:CLEAR,pipeFloor:PIPE,area:(X1-X0)*(W-.92),count:12,floors:3};
export const rooms=[
 {id:'room-lab',name:'실험실 한 칸',bounds:[X0,.26,X1,W-.26],level:0,description:'트러스 6과 7 사이의 6.10 m 한 칸입니다. 기둥이 긴 변에만 있어 안쪽이 통째로 비어 있습니다.'},
 {id:'room-pipe',name:'설비층 한 칸',bounds:[X0,.26,X1,W-.26],level:PIPE,description:'실험실 바로 위의 한 층입니다. 공조기·배관·전선이 여기를 지나고 천장 슬롯으로 내려갑니다.'},
 {id:'room-well',name:'아래 뜰',bounds:[0,-12.19,L,0],level:-6.1,description:'땅을 한 층 파서 하층 실험실에 햇빛을 들이는 뜰입니다.'},
 {id:'room-tower',name:'연구실 탑',bounds:[towerX(2),-12.19,towerX(2)+8.84,-3.05],level:0,description:'과학자의 방을 실험실에서 떼어 중정 쪽에 세웠습니다. 사선 벽의 창은 바다를 봅니다.'},
 {id:'room-court',name:'중정',bounds:[-22,-39.59,L+3,-12.19],level:0,description:'나무 한 그루 없는 트래버틴 마당입니다. 가운데 물길이 서쪽 바다를 가리킵니다.'}
];
export const sheets=[
 {id:'A-501',title:'배치·중정층 평면도',menu:'building',view:'site'},
 {id:'A-502',title:'횡단면도',menu:'building',view:'section',cutX:MID},
 {id:'M-501',title:'재료 구성도',menu:'materials',view:'materials'},
 {id:'S-501',title:'비렌딜 트러스 단면도',menu:'structure',view:'truss',cutX:X0},
 {id:'S-502',title:'설비층 평면도',menu:'structure',view:'pipe'},
 {id:'E-501',title:'실험실 한 칸 전기 평면도',menu:'electrical',view:'power'},
 {id:'E-502',title:'분전반 분기 회로도',menu:'electrical',view:'circuit'},
 {id:'F-501',title:'중정층 소방 평면도',menu:'fire',view:'fire'}
];
export const steps=[
 {id:'building',title:'두 동과 중정 읽기',text:'실험실, 설비층, 연구실 탑, 중정이 어떻게 놓였는지 평면과 단면에서 찾습니다.',menu:'building'},
 {id:'materials',title:'네 가지 재료 보기',text:'콘크리트, 티크, 트래버틴, 유리가 쓰인 자리와 치수의 근거를 확인합니다.',menu:'materials'},
 {id:'structure',title:'설비층에 올라가기',text:'사람이 지나다니는 트러스와 천장 슬롯을 보고, 배관이 실험실을 건드리지 않는 이유를 찾습니다.',menu:'structure'},
 {id:'electrical',title:'한 칸의 전기 설계하기',text:'분전반에서 설비층을 거쳐 슬롯으로 내려오는 경로를 따라가고 전류와 전압강하를 계산합니다.',menu:'electrical'},
 {id:'fire',title:'한 층의 소방 설계하기',text:'경계구역을 나누고 감지기·발신기·소화전·유도등의 수를 기준에서 구합니다.',menu:'fire'},
 {id:'energy',title:'유리벽과 환기의 열 보기',text:'서울 날씨에 놓은 실험실 한 층에서 유리와 환기가 가져가는 열을 비교합니다.',menu:'energy'}
];
export const circuits=[
 {id:'L1',name:'실험실 조명',volts:220,phase:1,pf:.95,color:'#d19129',breaker:16,area:2.5,ampacity:24,rcd:30,limit:3},
 {id:'P1',name:'실험대 콘센트',volts:220,phase:1,pf:.9,color:'#167b8d',breaker:20,area:4,ampacity:32,rcd:30,limit:5},
 {id:'F1',name:'흄후드 배기 팬',volts:220,phase:1,pf:.8,color:'#7a5ea8',breaker:16,area:2.5,ampacity:24,rcd:30,limit:5},
 {id:'M1',name:'설비층 공조기 팬',volts:380,phase:3,pf:.85,color:'#b5533c',breaker:20,area:4,ampacity:28,rcd:null,limit:5}
];
export const panel={id:'LP2',name:'중정층 실험실 분전반',kind:'panel',pos:[X0,W-.55,1.45],size:[.46,.18,.64]};
const lightRows=[1,3,5,7,9,11].map((j,n)=>({id:'LR'+(n+1),name:'조명 열 '+(n+1)+' · LED 40 W 5개',kind:'light',circuit:'L1',switch:'SW1',watts:200,pos:[MID,slotY(j),CLEAR-.03],size:[5.6,.2,.06]}));
const sockets=[[slotY(4),'실험대 1'],[slotY(8),'실험대 2']].flatMap(([y,bench],b)=>[0,1,2,3].map(k=>({id:'S'+(b*4+k+1),name:bench+' 콘센트 '+(k+1),kind:'socket',circuit:'P1',watts:300,pos:[32.5+1.2*k,y,.98],size:[.14,.08,.12]})));
export const equipment=[
 {id:'SW1',name:'조명 스위치',kind:'switch',circuit:'L1',pos:[X0,.55,1.2],size:[.09,.03,.12]},
 ...lightRows,...sockets,
 {id:'EF1',name:'흄후드 배기 팬',kind:'fan',circuit:'F1',watts:750,pos:[36.15,18.28,PIPE+.5],size:[.8,.8,.8]},
 {id:'AHU1',name:'설비층 공조기 팬',kind:'ahu',circuit:'M1',watts:5500,pos:[MID,slotY(6),PIPE+.8],size:[2.4,1.3,1.5]}
];
export const lighting={lux:500,area:(X1-X0)*(W-.92),lumens:4400,use:.6,keep:.8};
export const requiredFittings=()=>Math.ceil(lighting.lux*lighting.area/(lighting.lumens*lighting.use*lighting.keep));

export function freshSalk(raw={}){
 const state={breakers:{},switches:{SW1:true},watts:{},completed:[]};
 const saved=Array.isArray(raw?.completed)?raw.completed:[];
 state.completed=steps.filter(s=>saved.includes(s.id)).map(s=>s.id);
 for(const c of circuits)state.breakers[c.id]=typeof raw?.breakers?.[c.id]==='boolean'?raw.breakers[c.id]:true;
 if(typeof raw?.switches?.SW1==='boolean')state.switches.SW1=raw.switches.SW1;
 for(const d of equipment){const w=raw?.watts?.[d.id];if(d.watts&&Number.isInteger(w)&&w>=1&&w<=20000)state.watts[d.id]=w;}
 return state;
}
// 분전반 → 기둥을 타고 천장 → 슬롯으로 설비층 → 트레이 → 다시 슬롯으로 내려와 기구.
function routeTo(d){
 const [px,py,pz]=panel.pos,[x,y,z]=d.pos,rx=X0+.66,ry=slotY(12);
 const rise=[[px,py,pz],[px,py,CLEAR-.1],[rx,py,CLEAR-.1],[rx,ry,CLEAR-.1],[rx,ry,TRAY]];
 if(d.kind==='switch')return [[px,py,pz],[px,py,CLEAR-.1],[rx,py,CLEAR-.1],[rx,y,CLEAR-.1],[x,y,CLEAR-.1],[x,y,z]];
 if(z>CLEAR)return [...rise,[rx,y,TRAY],[x,y,TRAY],[x,y,z]];
 if(d.kind==='light')return [...rise,[rx,y,TRAY],[rx,y,z],[x,y,z]];
 return [...rise,[rx,y,TRAY],[x,y,TRAY],[x,y,z]];
}
export function salkElectrical(state=freshSalk()){
 const devices=equipment.map(d=>d.watts?{...d,watts:state.watts[d.id]??d.watts}:{...d});
 const routes=devices.map(d=>({id:'route-'+d.id,target:d.id,circuit:d.circuit,points:routeTo(d)}));
 const calculated=circuits.map(c=>{
  const loads=devices.filter(d=>d.circuit===c.id&&d.watts>0),watts=loads.reduce((s,d)=>s+d.watts,0);
  const current=watts/((c.phase===3?Math.sqrt(3):1)*c.volts*c.pf),factor=c.phase===3?30.8:35.6;
  const length=Math.max(...routes.filter(r=>r.circuit===c.id).map(r=>routeLength(r.points)));
  const drop=factor*length*current/(1000*c.area),percent=drop/c.volts*100;
  return {...c,loads,watts,current,factor,length,drop,percent,pass:current<=c.breaker&&c.breaker<=c.ampacity&&percent<=c.limit};
 });
 return {panel,devices:applyPowerState(devices,{circuits:calculated,state,panel,hasMain:false,overloadCutsPower:false}),routes,circuits:calculated};
}
export function blockLoad(electric){
 const bay=electric.circuits.reduce((s,c)=>s+c.watts,0);
 return {bay,floor:bay*moduleBay.count,block:bay*moduleBay.count*moduleBay.floors};
}

// 중정층 실험실 한 층(19.81 × 74.68 m)의 소방 설계.
const cols=[1,6,11].map(trussX),doors=[0,1,2,3,4].map(i=>towerX(i)+4.42);
export const fireZones=[0,1,2].map(i=>({id:'Z'+(i+1),name:'경계구역 '+(i+1),bounds:[L/3*i,0,L/3*(i+1),W],area:L/3*W}));
const heads=[0,2,4,6,8,10,12].flatMap((j,r)=>[X0+BAY/4,X0+BAY*3/4].map((x,k)=>({id:'SP'+(r*2+k+1),name:'스프링클러 헤드 '+(r*2+k+1),kind:'sprinkler',pos:[x,slotY(j),CLEAR-.04],size:[.08,.08,.08]})));
export const fireDevices=[
 ...[0,1,2,3,4,5].flatMap(k=>[4.59,15.23].map((y,s)=>({id:'SD'+(k*2+s+1),name:'연기감지기 '+(k*2+s+1),kind:'smoke',zone:'Z'+(Math.floor(k/2)+1),pos:[6.84+12.2*k,y,CLEAR-.04],size:[.2,.2,.07]}))),
 {id:'FR1',name:'수신기',kind:'receiver',pos:[.62,9.9,1.5],size:[.14,.5,.6]},
 ...cols.flatMap((x,i)=>[
  {id:'CP'+(i+1),name:'발신기 '+(i+1),kind:'callpoint',zone:'Z'+(i+1),pos:[x,W-.5,1.35],size:[.12,.06,.12]},
  {id:'BL'+(i+1),name:'경종 '+(i+1),kind:'bell',zone:'Z'+(i+1),pos:[x,W-.5,2.2],size:[.2,.08,.2]},
  {id:'HY'+(i+1),name:'옥내소화전 '+(i+1),kind:'hydrant',pos:[x+.7,W-.6,.75],size:[.7,.25,1.3]}]),
 ...doors.flatMap((x,i)=>[
  {id:'EX'+(i+1),name:'남쪽 피난구유도등 '+(i+1),kind:'exit',pos:[x,.34,2.5],size:[.4,.08,.2]},
  {id:'EN'+(i+1),name:'북쪽 피난구유도등 '+(i+1),kind:'exit',pos:[x,W-.34,2.5],size:[.4,.08,.2]}]),
 ...[9.3,28,46.7,65.4].map((x,i)=>({id:'GL'+(i+1),name:'통로유도등 '+(i+1),kind:'exit',pos:[x,9.9,2.6],size:[.4,.08,.2]})),
 ...[1,3,5,7,9,11].map((t,i)=>({id:'FE'+(i+1),name:'소화기 '+(i+1),kind:'extinguisher',pos:[trussX(t)+.45,i%2?W-.75:.75,.29],size:[.18,.18,.52]})),
 ...heads
];
export const sprinklerPlan={radius:2.3,spacing:2*2.3*Math.SQRT1_2,perBay:heads.length,floor:heads.length*moduleBay.count};
export function salkFire({signal=null,mains=true,battery=true}={}){
 const fire=resolveFire(fireDevices,{signal,mains,battery});
 const manual={sprinkler:'헤드가 열을 받으면 스스로 열림',hydrant:'사람이 호스를 꺼내 쓰는 설비'};
 return {...fire,devices:fire.devices.map(d=>manual[d.kind]?{...d,powered:null,on:false,stateLabel:manual[d.kind]}:d)};
}
const src=fireDevices.find(d=>d.id==='SD5'),rcv=fireDevices.find(d=>d.id==='FR1'),bell=fireDevices.find(d=>d.id==='BL2');
export const fireSource=src.id;
export const signalPath=[src.pos,[src.pos[0],src.pos[1],TRAY],[src.pos[0],rcv.pos[1],TRAY],[rcv.pos[0],rcv.pos[1],TRAY],rcv.pos];
export const alarmPath=[rcv.pos,[rcv.pos[0],rcv.pos[1],TRAY],[bell.pos[0],rcv.pos[1],TRAY],[bell.pos[0],bell.pos[1],TRAY],bell.pos];
export const escapePath=[[MID,9.9,.04],[MID,1.2,.04],[37.34,1.2,.04],[37.34,-5.6,.04],[35,-9.6,.04],[35,-16,.04]];
export const fireStages=[
 {id:'SD5',title:'감지기 입력',text:'시험 신호가 실험실 천장의 연기감지기 5에 들어왔습니다.'},
 {id:'FR1',title:'수신기 확인',text:'신호선은 설비층을 지나 서쪽 끝의 수신기로 갑니다. 수신기는 경계구역 2에 불이 났다고 표시합니다.'},
 {id:'BL2',title:'경종 작동',text:'수신기의 출력으로 경종이 울립니다.'},
 {id:'EX3',title:'피난 경로',text:'초록색 경로는 남쪽 문과 다리를 지나 연구실 탑 아래의 회랑으로, 다시 중정으로 나갑니다.'}
];
export const stations=[
 {id:'court',name:'중정',pos:[64,AXIS+1.1,0],look:[-1,0]},
 {id:'lab',name:'실험실',pos:[MID,2.2,0],look:[0,1]},
 {id:'pipe',name:'설비층',pos:[MID,2.2,PIPE],look:[0,1]},
 {id:'portico',name:'포티코',pos:[37.92,-9.1,6.1],look:[-.8,-1]}
];
export const materials=[
 {id:'concrete',name:'노출 콘크리트',target:'end-w',text:'화산재(포졸란)를 섞어 따뜻한 빛을 냈습니다. 거푸집 한 장은 2.44 × 1.22 m이고, 이음과 조임 구멍을 감추지 않고 무늬로 남겼습니다.'},
 {id:'teak',name:'티크 창벽',target:'tower3-up-teak',text:'연구실 창벽은 버마 티크입니다. 칠하지 않아 바닷바람에 은회색으로 변합니다.'},
 {id:'travertine',name:'트래버틴 포장',target:'court-paving',text:'중정 바닥은 로마 트래버틴을 띠 모양으로 깔았고 줄눈은 9.5 mm입니다.'},
 {id:'glass',name:'유리와 스테인리스 창틀',target:'lab2-glass-s',text:'실험실의 긴 두 면은 6.4 mm 홑판유리와 316 스테인리스 창틀입니다. 유리벽 한 면의 길이가 74.07 m입니다.'}
];
