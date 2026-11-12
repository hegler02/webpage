import {routeLength} from './learning-engine.mjs';
import {applyPowerState} from './power-reasoning.mjs';
import {F1,F2,F3,C1,C2,C3,DRIVE,T,MAIN,EAST,WEST,TOWER,UPPER,WEST2,STACK} from './fallingwater-model.mjs';

// 전기·소방은 원본 설계가 아니다. 이 집을 오늘 한국 기준으로 설계한다면 어떻게 되는지를 새로 풀었다.
export const project={name:'낙수장',center:[5,-2],fade:[170,260],day:{sun:3,exposure:.9,exposureIndoor:1,ambientIndoor:.24,env:.6,ambient:.16,turbidity:3,rayleigh:1.25,mie:.005,skyRich:1.4,bounce:[.6,.3]},glass:{outside:.88,boost:.38},shadowFloor:-9,shadowReach:36,site:{name:'밀 런',lat:39.906,lon:-79.468,tz:-5}};
// 탑 안쪽과 층마다의 천장 높이.
const TW=[TOWER.x0+.45,TOWER.y0+.45,-.45,TOWER.y1-.45],KC=F2-.3,DC=F3-.3,GS=MAIN.y0+T;
const size=([x0,y0,x1,y1])=>(x1-x0)*(y1-y0);
export const rooms=[
 {id:'room-living',name:'거실',floor:1,heated:true,bounds:[T,GS,MAIN.x1-T,5.7],level:F1,ceiling:C1,description:'벽난로, 식탁, 긴 의자가 한 방에 있습니다. 남쪽과 양옆이 유리이고 바닥의 유리 덮개를 열면 물로 내려갑니다.'},
 {id:'room-kitchen',name:'부엌',floor:1,heated:true,bounds:TW,level:F1,ceiling:KC,description:'돌탑의 맨 아래 방입니다. 세 층을 잇는 세로 창이 서남쪽 모서리에 있습니다.'},
 {id:'room-east-terrace',name:'동쪽 테라스',floor:1,bounds:[MAIN.x1,MAIN.y0,EAST.x1,EAST.y1],level:F1,description:'거실 동쪽 유리문 밖입니다. 다리에서 가장 먼저 보이는 판입니다.'},
 {id:'room-west-terrace',name:'서쪽 테라스',floor:1,bounds:[WEST.x0,WEST.y0,0,WEST.y1],level:F1,description:'거실과 부엌에서 나가는 판입니다. 폭포 위쪽 물을 내려다봅니다.'},
 {id:'room-entry',name:'현관',floor:1,bounds:[12.1,3.1,14.2,7.1],level:F1,description:'돌벽 사이의 낮고 어두운 자리입니다. 진입로에서 세 단을 오르고 유리문을 지나면 거실이 한꺼번에 열립니다.'},
 {id:'room-master',name:'안방',floor:2,heated:true,bounds:[3,1.2,8,4.75],level:F2,ceiling:C2,description:'방보다 테라스가 더 넓습니다. 유리문을 열면 폭포 위로 6 ft 더 내민 판에 섭니다.'},
 {id:'room-guest',name:'손님방',floor:2,heated:true,bounds:[8.4,1.2,MAIN.x1,4.75],level:F2,ceiling:C2,description:'동쪽 모서리의 작은 방입니다. 남쪽과 동쪽 두 면이 유리입니다.'},
 {id:'room-bath',name:'욕실',floor:2,heated:true,bounds:[.45,1.65,2.6,STACK.y0],level:F2,ceiling:C2,description:'바닥과 벽에 코르크를 붙인 욕실입니다. 옷방과 안방 사이를 잇습니다.'},
 {id:'room-hall',name:'2층 복도와 계단',floor:2,heated:true,bounds:[3,4.9,MAIN.x1,MAIN.y1],level:F2,ceiling:C2,description:'돌벽 사이에 낀 좁은 계단이 세 층을 잇습니다.'},
 {id:'room-dressing',name:'옷방',floor:2,heated:true,bounds:TW,level:F2,ceiling:DC,description:'돌탑의 가운데 방입니다. 서쪽 테라스로 나갑니다.'},
 {id:'room-master-terrace',name:'안방 테라스',floor:2,bounds:[UPPER.x0,UPPER.y0,UPPER.x1,1.2],level:F2,description:'이 집에서 가장 멀리 내민 판입니다. 아래층 판보다 6 ft(1.83 m) 더 나갑니다.'},
 {id:'room-west-terrace-2',name:'2층 서쪽 테라스',floor:2,bounds:[WEST2.x0,WEST2.y0,0,WEST2.y1],level:F2,description:'옷방 앞의 작은 판입니다.'},
 {id:'room-study',name:'서재',floor:3,heated:true,bounds:TW,level:F3,ceiling:C3,description:'돌탑의 맨 위 방입니다. 옥상 테라스를 건너 3층 복도와 이어집니다.'},
 {id:'room-gallery',name:'3층 복도',floor:3,heated:true,bounds:[3,4.9,9.75,7.1],level:F3,ceiling:C3,description:'책꽂이와 침대 하나를 둔 긴 방입니다. 계단이 여기서 끝납니다.'},
 {id:'room-roof-terrace',name:'옥상 테라스',floor:3,bounds:[T,T,8.4-T,4.9],level:F3,description:'안방 지붕 위의 판입니다. 세 겹의 판이 어긋나게 쌓인 모습을 위에서 봅니다.'}
];
const heated=rooms.filter(r=>r.heated);
export const interior={area:heated.reduce((a,r)=>a+size(r.bounds),0),volume:heated.reduce((a,r)=>a+size(r.bounds)*(r.ceiling-r.level),0),living:size(rooms[0].bounds),
 floors:[1,2,3].map(f=>heated.filter(r=>r.floor===f).reduce((a,r)=>a+size(r.bounds),0))};
export const sheets=[
 {id:'A-701',title:'배치·1층 평면도',menu:'building',view:'site',floors:[1]},
 {id:'A-702',title:'2층·3층 평면도',menu:'building',view:'upper',floors:[2,3]},
 {id:'A-703',title:'종단면도',menu:'building',view:'section',cutX:5.6},
 {id:'M-701',title:'재료 구성도',menu:'materials',view:'materials',floors:[1]},
 {id:'S-701',title:'내민 바닥 구조 평면도',menu:'structure',view:'frame',floors:[1]},
 {id:'S-702',title:'내민 보 단면 상세도',menu:'structure',view:'joint',cutX:5.6},
 {id:'E-701',title:'전기 평면도',menu:'electrical',view:'power',floors:[1,2,3]},
 {id:'E-702',title:'분전반 분기 회로도',menu:'electrical',view:'circuit',floors:[1,2,3]},
 {id:'F-701',title:'소방 평면도',menu:'fire',view:'fire',floors:[1,2,3]}
];
export const steps=[
 {id:'building',title:'어긋나게 쌓인 세 판 읽기',text:'물, 1층, 2층, 3층의 판이 어떤 높이로 얼마나 내밀었는지 평면과 단면에서 찾습니다.',menu:'building'},
 {id:'materials',title:'다섯 가지 재료 보기',text:'사암, 황토색 콘크리트, 판석, 붉은 강철 창틀과 유리, 호두나무가 쓰인 자리와 치수의 근거를 확인합니다.',menu:'materials'},
 {id:'structure',title:'내민 보 따라가기',text:'받침벽 네 개에서 4.57 m를 내민 보와 뒤집힌 장선을 보고, 판이 처진 까닭과 고친 방법을 찾습니다.',menu:'structure'},
 {id:'electrical',title:'돌탑을 타고 오르는 전기 설계하기',text:'부엌 분전반에서 돌탑을 타고 세 층으로 갈라지는 경로를 따라가고 전류와 전압강하를 계산합니다.',menu:'electrical'},
 {id:'fire',title:'3층 주택의 소방 설계하기',text:'방마다 두는 단독경보형 감지기와 층마다 두는 소화기의 수를 기준에서 구하고 2층에서 다리까지 피난 경로를 걷습니다.',menu:'fire'},
 {id:'energy',title:'돌과 홑유리 집의 열 보기',text:'서울 날씨에 놓은 이 집에서 유리와 내민 판이 가져가는 열을 계산합니다.',menu:'energy'}
];
export const circuits=[
 {id:'L1',name:'1층 조명',volts:220,phase:1,pf:.95,color:'#d19129',breaker:16,area:2.5,ampacity:24,rcd:30,limit:3},
 {id:'L2',name:'2·3층 조명',volts:220,phase:1,pf:.95,color:'#c0762f',breaker:16,area:2.5,ampacity:24,rcd:30,limit:3},
 {id:'P1',name:'1층 콘센트',volts:220,phase:1,pf:.9,color:'#167b8d',breaker:20,area:2.5,ampacity:24,rcd:30,limit:5},
 {id:'P2',name:'2·3층 콘센트',volts:220,phase:1,pf:.9,color:'#3d6fb5',breaker:20,area:2.5,ampacity:24,rcd:30,limit:5},
 {id:'K1',name:'인덕션 전용',volts:220,phase:1,pf:.95,color:'#7a5ea8',breaker:20,area:4,ampacity:32,rcd:30,limit:5},
 {id:'H1',name:'난방 히트펌프',volts:380,phase:3,pf:.9,color:'#b5533c',breaker:32,area:6,ampacity:36,rcd:30,limit:5}
];
// 분전반은 부엌 북쪽 돌벽에 붙고, 세로 배관은 굴뚝 뒤 구석을 타고 세 층을 오른다.
const RISER=[-.6,6.5],TRUNK=4.6;
export const panel={id:'LP1',name:'주택 분전반',kind:'panel',pos:[-.72,6.7,F1+1.45],size:[.4,.1,.55],turn:Math.PI};
// 전기 인입: 진입로 밑으로 들어와 북쪽 돌벽 속을 타고 분전반까지.
export const feeder=[[-.72,12.4,DRIVE-.5],[-.72,7,DRIVE-.5],[-.72,7,panel.pos[2]],panel.pos];
const lamp=(i,name,circuit,sw,x,y,z,size=[1.2,.14,.05])=>({id:'LT'+i,name,kind:'light',circuit,switch:sw,watts:30,pos:[x,y,z-.03],size});
const wall=(id,name,circuit,x,y,z,across,watts=300)=>({id,name,kind:'socket',circuit,watts,pos:[x,y,z],size:across?[.04,.14,.09]:[.14,.04,.09]});
export const equipment=[
 {id:'SW1',name:'1층 조명 스위치',kind:'switch',circuit:'L1',pos:[MAIN.x1-.03,5.1,F1+1.2],size:[.03,.09,.12]},
 {id:'SW2',name:'2·3층 조명 스위치',kind:'switch',circuit:'L2',pos:[8.3,4.93,F2+1.2],size:[.09,.03,.12]},
 ...[-2.6,2.2].flatMap((y,r)=>[2.2,5.8,9.4].map((x,k)=>lamp(r*3+k+1,'거실 천장 간접등 '+(r*3+k+1),'L1','SW1',x,y,C1))),
 lamp(7,'부엌 천장등','L1','SW1',-1.9,4.8,KC,[.9,.14,.05]),lamp(8,'1층 계단 앞 천장등','L1','SW1',3.9,6.4,C1,[.14,.8,.05]),
 lamp(9,'안방 천장 간접등','L2','SW2',5.5,3,C2),lamp(10,'손님방 천장 간접등','L2','SW2',10,3,C2),lamp(11,'욕실 천장등','L2','SW2',1.5,3.3,C2,[.14,.8,.05]),
 lamp(12,'2층 복도 천장등','L2','SW2',9.9,5.4,C2,[.9,.14,.05]),lamp(13,'옷방 천장등','L2','SW2',-1.9,4.8,DC,[.9,.14,.05]),
 lamp(14,'서재 천장등','L2','SW2',-1.9,4.8,C3,[.9,.14,.05]),lamp(15,'3층 복도 천장 간접등','L2','SW2',6.4,5.6,C3),
 {id:'FB1',name:'거실 바닥 콘센트 · 긴 의자 앞',kind:'socket',circuit:'P1',watts:300,pos:[3.8,-.7,F1+.015],size:[.16,.16,.03]},
 {id:'FB2',name:'거실 바닥 콘센트 · 동쪽',kind:'socket',circuit:'P1',watts:300,pos:[9.4,1.2,F1+.015],size:[.16,.16,.03]},
 wall('WS1','식탁 옆 벽 콘센트','P1',8.2,5.67,F1+.3),wall('KS1','조리대 콘센트 · 냉장고 포함','P1',-2.2,6.72,F1+1.15,false,750),
 wall('WS2','안방 책상 콘센트','P2',3.03,2.4,F2+.9,true),wall('WS3','손님방 벽 콘센트','P2',8.43,3,F2+.3,true),wall('WS4','옷방 책상 콘센트','P2',-.48,5.1,F2+.9,true),
 wall('WS5','서재 책상 콘센트','P2',-1.2,2.88,F3+.9),wall('WS6','3층 복도 벽 콘센트','P2',6,7.07,F3+.3),
 {id:'IH1',name:'인덕션',kind:'cooktop',circuit:'K1',watts:3000,pos:[-2.975,5.2,F1+.91],size:[.6,.5,.02]},
 {id:'HP1',name:'난방 히트펌프',kind:'heatpump',circuit:'H1',watts:12000,pos:[-2.2,7.55,DRIVE+.45],size:[.9,.4,.9]}
];
// KS A 3011 주택 거실 전반 조도의 높은 쪽 값. 나무 가리개 뒤에서 천장을 비추는 간접 조명이라 이용률을 낮게 잡는다.
export const lighting={lux:60,area:interior.living,lumens:3600,use:.45,keep:.7};
export const requiredFittings=()=>Math.ceil(lighting.lux*lighting.area/(lighting.lumens*lighting.use*lighting.keep));

export function freshFallingwater(raw={}){
 const state={breakers:{},switches:{SW1:true,SW2:true},watts:{},completed:[]};
 const saved=Array.isArray(raw?.completed)?raw.completed:[];
 state.completed=steps.filter(s=>saved.includes(s.id)).map(s=>s.id);
 for(const c of circuits)state.breakers[c.id]=typeof raw?.breakers?.[c.id]==='boolean'?raw.breakers[c.id]:true;
 for(const k of Object.keys(state.switches))if(typeof raw?.switches?.[k]==='boolean')state.switches[k]=raw.switches[k];
 for(const d of equipment){const w=raw?.watts?.[d.id];if(d.watts&&Number.isInteger(w)&&w>=1&&w<=30000)state.watts[d.id]=w;}
 return state;
}
// 분전반 → 굴뚝 뒤 세로 배관 → 층마다 천장 속(조명)이나 바닥 속(콘센트)의 줄기 → 기구. 히트펌프만 북쪽 벽을 뚫고 바로 나간다.
export const floorOf=z=>z>=F3-.2?F3:z>=F2-.2?F2:F1;
const ceilings=new Map([[F1,C1],[F2,C2],[F3,C3]]);
function routeTo(d){
 const [px,py,pz]=panel.pos,[x,y,z]=d.pos;
 if(d.kind==='heatpump')return [panel.pos,[px,py,z],[px,y,z],[x,y,z]];
 const lv=d.kind==='light'?z:d.kind==='switch'?ceilings.get(floorOf(z))-.03:floorOf(z)-.12,up=[panel.pos,[RISER[0],RISER[1],pz],[RISER[0],RISER[1],lv]];
 return x<-.45?[...up,[RISER[0],y,lv],[x,y,lv],[x,y,z]]:[...up,[RISER[0],TRUNK,lv],[x,TRUNK,lv],[x,y,lv],[x,y,z]];
}
export function fallingwaterElectrical(state=freshFallingwater()){
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
export const houseLoad=electric=>electric.circuits.reduce((s,c)=>s+c.watts,0);

// 주택용 소방시설: 소화기와 단독경보형 감지기. 수신기도 배선도 없고, 감지기 하나하나가 건전지로 감시하다가 제 몸에서 경보음을 낸다.
const high=z=>z-.035,smoke=(id,name,x,y,z,kind='smoke')=>({id,name:'단독경보형 '+(kind==='heat'?'열감지기':'감지기')+' · '+name,kind,pos:[x,y,high(z)],size:[.12,.12,.05]});
const can=(id,name,x,y,z)=>({id,name:'소화기 · '+name,kind:'extinguisher',pos:[x,y,z+.26],size:[.18,.18,.52]});
export const fireDevices=[
 smoke('SD1','거실',5.5,.2,C1),smoke('SD2','부엌',-1.9,3.9,KC,'heat'),smoke('SD3','안방',5.6,3.6,C2),smoke('SD4','손님방',10,3.6,C2),
 smoke('SD5','옷방',-2,3.9,DC),smoke('SD6','서재',-2,3.9,C3),smoke('SD7','계단 꼭대기',4.7,6.3,C3),
 can('FE1','1층 현관 옆',11.25,4.9,F1),can('FE2','부엌',-.7,4.55,F1),can('FE3','2층 복도',10.9,5.5,F2),can('FE4','3층 복도',3.3,6.8,F3)
];
export const fireRule={law:'소방시설 설치 및 관리에 관한 법률 제10조',detector:'비상경보설비 및 단독경보형감지기의 화재안전기술기준(NFTC 201) 2.2.1',room:150,sound:85};
// 감지기는 잠자거나 불을 쓰는 방마다 하나씩, 그리고 계단 꼭대기에 하나. 욕실과 복도는 방으로 세지 않았다.
export const fireRooms=heated.filter(r=>!['room-bath','room-hall','room-gallery'].includes(r.id));
export const requiredDetectors=()=>fireRooms.reduce((a,r)=>a+Math.ceil(size(r.bounds)/fireRule.room),0)+1;
export const requiredExtinguishers=()=>3;
export function fallingwaterFire({signal=null}={}){
 const source=fireDevices.find(d=>d.id===signal&&d.kind!=='extinguisher');
 const reason=signal!=null&&!source?'등록된 감지기의 신호가 아닙니다.':source?source.name+'가 제 몸에서 경보음을 냅니다.':'감지기마다 건전지로 감시 중입니다. 시험 입력이 없어 경보는 대기합니다.';
 return {mains:false,battery:true,powered:true,supplied:true,alarm:Boolean(source),signalId:signal,signal,source:source?.id??null,
  proof:{status:signal!=null&&!source?'unknown':source?'on':'off',supply:'내장 건전지',reason,validInput:Boolean(source),hasOutput:true},
  devices:fireDevices.map(d=>d.kind==='extinguisher'?{...d,powered:null,on:false,alarm:false,stateLabel:'수동 기구 · 위치 확인',source:source?.id??null}
   :{...d,powered:true,on:d.id===source?.id,alarm:d.id===source?.id,stateLabel:d.id===source?.id?'연기 감지 · 경보음 '+fireRule.sound+' dB':'건전지로 감시 중',source:source?.id??null})};
}
const src=fireDevices[0],ext=fireDevices[7],g=.04;
export const fireSource=src.id;
// 경보음이 2층 안방까지 가는 길: 거실 천장을 따라 계단으로, 계단을 타고 2층 복도로, 문을 지나 침대로.
export const soundPath=[src.pos,[4,5,high(C1)],[4.2,6.55,high(C1)],[8.9,6.55,F2+1.7],[9.2,5.4,F2+1.7],[7.3,5.4,F2+1.7],[7.3,4.3,F2+1.7],[5.9,3.7,F2+.7]];
export const reachPath=[[5.5,.2,F1+g],[10.7,3.6,F1+g],[ext.pos[0]-.3,ext.pos[1]-.2,F1+g]];
// 피난: 안방 → 2층 복도 → 계단 → 거실 → 현관 → 진입로 → 다리 건너편.
export const escapePath=[[5.9,3.2,F2+g],[7.3,4,F2+g],[7.3,5.4,F2+g],[9.25,5.4,F2+g],[9.25,6.55,F2+g],[8.96,6.55,F2+g],[4.8,6.55,F1+g],[3.9,6.55,F1+g],[3.9,3.6,F1+g],[10.9,3.6,F1+g],[10.9,5.9,F1+g],[13.1,5.9,F1+g],[13.1,7.1,F1+g],[13.1,7.9,DRIVE+g],[13.1,9.6,DRIVE+g],[20.4,9.6,DRIVE+g],[20.4,-10.5,DRIVE+g]];
export const fireStages=[
 {id:'SD1',title:'감지기가 연기를 잡습니다',text:'거실 천장의 감지기에 시험 연기가 들어왔습니다. 수신기로 보내는 신호선은 없습니다.'},
 {id:'bed-master',title:'제 몸에서 경보음이 납니다',text:'감지기가 '+fireRule.sound+' dB로 웁니다. 소리는 계단을 타고 2층으로 오르지만 문을 닫은 방에서는 작게 들립니다. 그래서 방마다 감지기를 답니다.'},
 {id:'FE1',title:'소화기로 처음 불을 끕니다',text:'소화기는 층마다 하나씩 있습니다. 거실에서는 현관 옆 소화기가 가장 가깝습니다. 불이 천장에 닿았다면 바로 나갑니다.'},
 {id:'glass-door',title:'현관으로 나가 다리를 건넙니다',text:'초록색 경로는 안방에서 2층 복도와 계단을 내려와 거실과 현관을 지나 진입로를 따라 다리 건너편에 닿습니다.'}
];
export const stations=[
 {id:'falls',name:'폭포 아래 바위',pos:[-1.5,-27.5,-5.4],look:[.23,.97]},
 {id:'bridge',name:'다리 위',pos:[20.4,-3.2,DRIVE],look:[-1,.18]},
 {id:'living',name:'거실',pos:[8.6,2.2,F1],look:[-.62,-.78]},
 {id:'terrace',name:'동쪽 테라스',pos:[14.6,-2.6,F1],look:[-.9,-.44]},
 {id:'stream',name:'물 위 발판',pos:[6.5,-3.1,.2],look:[-.94,-.34]},
 {id:'master',name:'안방 테라스',pos:[5.6,-4.6,F2],look:[.1,-1]},
 {id:'roof',name:'옥상 테라스',pos:[4.2,2.6,F3],look:[-.42,-.9]}
];
export const materials=[
 {id:'sandstone',name:'포츠빌 사암',target:'tower-s',text:'현장 가까이에서 캔 사암을 얇은 켜로 쌓았습니다. 돌이 줄눈보다 튀어나와 바위 절벽의 결처럼 보입니다.'},
 {id:'concrete',name:'황토색 콘크리트',target:'parapet-1-s',text:'내민 판과 난간벽은 철근콘크리트이고 엷은 황토색을 칠했습니다. 모서리를 둥글게 굴렸습니다.'},
 {id:'flagstone',name:'왁스 먹인 판석',target:'flag-1',text:'두께 2 in(50 mm) 사암 판석에 왁스를 먹여 젖은 계곡 바위처럼 빛납니다. 실내와 테라스가 같은 바닥으로 이어집니다.'},
 {id:'sash',name:'붉은 강철 창틀과 판유리',target:'glass-s',text:'¼ in(6 mm) 판유리를 체로키 레드 강철 창틀에 끼웠습니다. 돌벽과 만나는 곳은 틀 없이 돌의 홈에 바로 끼웠습니다.'},
 {id:'walnut',name:'검은 호두나무',target:'dining-table',text:'붙박이 가구는 노스캐롤라이나산 검은 호두나무 무늬목으로 짰습니다. 결을 가로로 놓아 습기에 덜 휩니다.'}
];
