import {routeLength} from './learning-engine.mjs';
import {applyPowerState} from './power-reasoning.mjs';
import {L,W,FLOOR,CEIL,PORCH,G,TZ,TERR,CORE} from './farnsworth-model.mjs';

// 전기·소방은 원본 설계가 아니다. 이 집을 오늘 한국 기준으로 설계한다면 어떻게 되는지를 새로 풀었다.
export const project={name:'판스워스 주택',center:[9,1],fade:[150,230],day:{sun:3,exposure:.92,exposureIndoor:1,ambientIndoor:.24,env:.6,ambient:.16,turbidity:3,rayleigh:1.25,mie:.005,skyRich:1.4,bounce:[.7,.3]},glass:{outside:.88,boost:.38},shadowFloor:-1,shadowReach:28,site:{name:'플레이노',lat:41.635,lon:-88.5357,tz:-6}};
const F=FLOOR,E=L-G,N=W-G,UNDER=F-.2,TOP=F+CORE.h+.04;
export const interior={x0:PORCH,x1:E,y0:G,y1:N,area:(E-PORCH)*(N-G),glass:2*((E-PORCH)+(N-G))*(CEIL-F)};
export const rooms=[
 {id:'room-terrace',name:'아래 테라스',bounds:[TERR.x0,TERR.y0,TERR.x1,TERR.y1],level:TZ,description:'땅과 집 사이에 떠 있는 가운데 판입니다. 계단 네 단을 올라 여기에 서고, 다섯 단을 더 올라 베란다에 닿습니다.'},
 {id:'room-porch',name:'베란다',bounds:[0,0,PORCH,W],level:F,description:'지붕 아래의 서쪽 한 칸은 벽 없이 열려 있습니다. 실내와 같은 트래버틴이 줄눈을 맞춰 이어집니다.'},
 {id:'room-dining',name:'식사 자리',bounds:[PORCH,G,CORE.x0,N],level:F,description:'현관문을 열면 바로 식탁이 놓인 자리입니다. 벽이 없어 가구가 방을 나눕니다.'},
 {id:'room-living',name:'거실',bounds:[CORE.x0,G,19.3,CORE.y0],level:F,description:'코어 남쪽의 벽난로 앞입니다. 유리 너머로 강 쪽 풀밭을 봅니다.'},
 {id:'room-kitchen',name:'부엌',bounds:[CORE.x0,CORE.y1,CORE.x1,N],level:F,description:'코어 북쪽 면을 따라 놓인 한 줄 부엌입니다. 조리대와 북쪽 유리 사이가 1.2 m입니다.'},
 {id:'room-sleep',name:'잠자리',bounds:[CORE.x1,3.5,E,N],level:F,description:'코어 동쪽입니다. 낮은 티크 옷장이 거실 쪽 시선을 가립니다.'},
 {id:'room-core',name:'코어',bounds:[CORE.x0,CORE.y0,CORE.x1,CORE.body],level:F,description:'욕실 둘과 설비실을 프리마베라 합판으로 감싼 덩어리입니다. 벽이 천장에 닿지 않아 천장이 한 장으로 이어집니다.'}
];
export const sheets=[
 {id:'A-601',title:'배치·평면도',menu:'building',view:'site'},
 {id:'A-602',title:'횡단면도',menu:'building',view:'section',cutX:4.6},
 {id:'M-601',title:'재료 구성도',menu:'materials',view:'materials'},
 {id:'S-601',title:'강재 골조 평면도',menu:'structure',view:'frame'},
 {id:'S-602',title:'기둥·테두리보 접합 상세도',menu:'structure',view:'joint'},
 {id:'E-601',title:'전기 평면도',menu:'electrical',view:'power'},
 {id:'E-602',title:'분전반 분기 회로도',menu:'electrical',view:'circuit'},
 {id:'F-601',title:'소방 평면도',menu:'fire',view:'fire'}
];
export const steps=[
 {id:'building',title:'떠 있는 세 판 읽기',text:'땅, 테라스, 집 바닥, 지붕이 어떤 높이로 놓였는지 평면과 단면에서 찾습니다.',menu:'building'},
 {id:'materials',title:'네 가지 재료 보기',text:'흰 강재, 트래버틴, 판유리, 프리마베라 합판이 쓰인 자리와 치수의 근거를 확인합니다.',menu:'materials'},
 {id:'structure',title:'기둥 여덟 개 따라가기',text:'기둥이 바닥과 지붕을 옆에서 붙잡는 접합을 보고, 판이 떠 보이는 이유를 찾습니다.',menu:'structure'},
 {id:'electrical',title:'벽 없는 집의 전기 설계하기',text:'설비 원통으로 올라온 전기가 바닥 밑을 지나 바닥 콘센트로 올라오는 경로를 따라가고 전류와 전압강하를 계산합니다.',menu:'electrical'},
 {id:'fire',title:'주택의 소방 설계하기',text:'주택에 두어야 하는 소화기와 단독경보형 감지기의 수를 기준에서 구하고 피난 경로를 걷습니다.',menu:'fire'},
 {id:'energy',title:'유리 상자의 열 보기',text:'서울 날씨에 놓은 이 집에서 홑판유리가 가져가는 열을 계산합니다.',menu:'energy'}
];
export const circuits=[
 {id:'L1',name:'간접 조명',volts:220,phase:1,pf:.95,color:'#d19129',breaker:16,area:2.5,ampacity:24,rcd:30,limit:3},
 {id:'P1',name:'바닥 콘센트',volts:220,phase:1,pf:.9,color:'#167b8d',breaker:20,area:2.5,ampacity:24,rcd:30,limit:5},
 {id:'K1',name:'인덕션 전용',volts:220,phase:1,pf:.95,color:'#7a5ea8',breaker:20,area:4,ampacity:32,rcd:30,limit:5},
 {id:'H1',name:'바닥 난방 히트펌프',volts:380,phase:3,pf:.9,color:'#b5533c',breaker:20,area:4,ampacity:28,rcd:30,limit:5}
];
export const panel={id:'LP1',name:'주택 분전반',kind:'panel',pos:[18.75,CORE.body+.05,F+1.45],size:[.4,.1,.55]};
// 전기 인입: 땅에서 설비 원통을 타고 올라와 바닥 밑으로 분전반까지.
export const feeder=[[15.2,5.4,.05],[15.2,5.4,UNDER],[18.75,5.4,UNDER],[18.75,panel.pos[1],UNDER],panel.pos];
const coreLights=[3.7,6.7].flatMap((y,r)=>[12.4,15.2,18].map((x,k)=>({id:'LT'+(r*3+k+1),name:'코어 위 간접등 '+(r*3+k+1),kind:'light',circuit:'L1',switch:'SW1',watts:30,pos:[x,y,TOP],size:[1.2,.12,.06]})));
const wardrobeLights=[1.6,2.8].map((y,k)=>({id:'LT'+(7+k),name:'옷장 위 간접등 '+(k+1),kind:'light',circuit:'L1',switch:'SW1',watts:30,pos:[19.8,y,F+1.84],size:[.12,1,.06]}));
const boxes=[[9.3,5.75,'식탁'],[9.05,1.5,'책상'],[12.8,2.65,'거실'],[21.4,5.05,'침대 옆']].map(([x,y,name],i)=>({id:'FB'+(i+1),name:name+' 바닥 콘센트',kind:'socket',circuit:'P1',watts:300,pos:[x,y,F+.015],size:[.16,.16,.03]}));
export const equipment=[
 {id:'SW1',name:'조명 스위치',kind:'switch',circuit:'L1',pos:[CORE.x0-.02,3.9,F+1.2],size:[.03,.09,.12]},
 ...coreLights,...wardrobeLights,...boxes,
 {id:'KS1',name:'조리대 콘센트 · 냉장고 포함',kind:'socket',circuit:'P1',watts:750,pos:[13,CORE.body+.02,F+1.15],size:[.14,.04,.09]},
 {id:'IH1',name:'인덕션',kind:'cooktop',circuit:'K1',watts:3000,pos:[15.2,7.1,F+.91],size:[.6,.5,.02]},
 {id:'HP1',name:'바닥 난방 히트펌프',kind:'heatpump',circuit:'H1',watts:9000,pos:[14.25,4.3,.8],size:[.9,.4,.8]}
];
// KS A 3011 주택 거실 전반 조도의 높은 쪽 값. 흰 천장에 비춰 되받는 간접 조명이라 이용률을 낮게 잡는다.
export const lighting={lux:60,area:interior.area,lumens:3600,use:.45,keep:.7};
export const requiredFittings=()=>Math.ceil(lighting.lux*lighting.area/(lighting.lumens*lighting.use*lighting.keep));

export function freshFarnsworth(raw={}){
 const state={power:raw?.power!==false,breakers:{},switches:{SW1:true},watts:{},completed:[]};
 const saved=Array.isArray(raw?.completed)?raw.completed:[];
 state.completed=steps.filter(s=>saved.includes(s.id)).map(s=>s.id);
 for(const c of circuits)state.breakers[c.id]=typeof raw?.breakers?.[c.id]==='boolean'?raw.breakers[c.id]:true;
 if(typeof raw?.switches?.SW1==='boolean')state.switches.SW1=raw.switches.SW1;
 for(const d of equipment){const w=raw?.watts?.[d.id];if(d.watts&&Number.isInteger(w)&&w>=1&&w<=20000)state.watts[d.id]=w;}
 return state;
}
// 분전반 → 코어 안에서 바닥 밑으로 → 가로보 사이를 지나 → 기구 바로 아래에서 올라온다. 코어 위 조명만 코어 안을 타고 오른다.
function routeTo(d){
 const [px,py,pz]=panel.pos,[x,y,z]=d.pos,in0=[px,py-.3,pz];
 if(d.kind==='switch'||d.id.startsWith('LT')&&z>F+2)return [panel.pos,in0,[px,py-.3,TOP],[px,y,TOP],[x,y,TOP],[x,y,z]];
 if(d.kind==='heatpump')return [panel.pos,in0,[px,py-.3,UNDER],[px,5.4,UNDER],[15.2,5.4,UNDER],[15.2,5.4,z],[x,y,z]];
 return [panel.pos,in0,[px,py-.3,UNDER],[px,y,UNDER],[x,y,UNDER],[x,y,z]];
}
export function farnsworthElectrical(state=freshFarnsworth()){
 const devices=equipment.map(d=>d.watts?{...d,watts:state.watts[d.id]??d.watts}:{...d});
 const routes=devices.map(d=>({id:'route-'+d.id,target:d.id,circuit:d.circuit,points:routeTo(d)}));
 const calculated=circuits.map(c=>{
  const loads=devices.filter(d=>d.circuit===c.id&&d.watts>0),watts=loads.reduce((s,d)=>s+d.watts,0);
  const current=watts/((c.phase===3?Math.sqrt(3):1)*c.volts*c.pf),factor=c.phase===3?30.8:35.6;
  const length=Math.max(...routes.filter(r=>r.circuit===c.id).map(r=>routeLength(r.points)));
  const drop=factor*length*current/(1000*c.area),percent=drop/c.volts*100;
  return {...c,loads,watts,current,factor,length,drop,percent,pass:current<=c.breaker&&c.breaker<=c.ampacity&&percent<=c.limit};
 });
 return {panel,devices:applyPowerState(devices,{circuits:calculated,state:{...state,power:state.power!==false},panel,hasMain:true,overloadCutsPower:false}),routes,circuits:calculated};
}
export const houseLoad=electric=>electric.circuits.reduce((s,c)=>s+c.watts,0);

// 주택용 소방시설: 소화기와 단독경보형 감지기. 수신기도 배선도 없고, 감지기 하나하나가 건전지로 감시하다가 제 몸에서 경보음을 낸다.
const HIGH=CEIL-.035;
export const fireDevices=[
 {id:'SD1',name:'단독경보형 감지기 · 거실',kind:'smoke',pos:[13,2,HIGH],size:[.12,.12,.05]},
 {id:'SD2',name:'단독경보형 감지기 · 식사 자리',kind:'smoke',pos:[9.3,4.4,HIGH],size:[.12,.12,.05]},
 {id:'SD3',name:'단독경보형 열감지기 · 부엌',kind:'heat',pos:[15.2,8,HIGH],size:[.12,.12,.05]},
 {id:'SD4',name:'단독경보형 감지기 · 잠자리',kind:'smoke',pos:[21.2,5.2,HIGH],size:[.12,.12,.05]},
 {id:'FE1',name:'소화기 · 현관',kind:'extinguisher',pos:[7.05,3.1,F+.26],size:[.18,.18,.52]},
 {id:'FE2',name:'소화기 · 부엌',kind:'extinguisher',pos:[11.75,8,F+.26],size:[.18,.18,.52]}
];
export const fireRule={law:'소방시설 설치 및 관리에 관한 법률 제10조',detector:'비상경보설비 및 단독경보형감지기의 화재안전기술기준(NFTC 201) 2.2.1',room:150,sound:85};
export const requiredDetectors=()=>Math.ceil(interior.area/fireRule.room);
export function farnsworthFire({signal=null}={}){
 const source=fireDevices.find(d=>d.id===signal&&d.kind!=='extinguisher');
 const reason=signal!=null&&!source?'등록된 감지기의 신호가 아닙니다.':source?source.name+'가 제 몸에서 경보음을 냅니다.':'감지기마다 건전지로 감시 중입니다. 시험 입력이 없어 경보는 대기합니다.';
 return {mains:false,battery:true,powered:true,supplied:true,alarm:Boolean(source),signalId:signal,signal,source:source?.id??null,
  proof:{status:signal!=null&&!source?'unknown':source?'on':'off',supply:'내장 건전지',reason,validInput:Boolean(source),hasOutput:true},
  devices:fireDevices.map(d=>d.kind==='extinguisher'?{...d,powered:null,on:false,alarm:false,stateLabel:'수동 기구 · 위치 확인',source:source?.id??null}
   :{...d,powered:true,on:d.id===source?.id,alarm:d.id===source?.id,stateLabel:d.id===source?.id?'연기 감지 · 경보음 '+fireRule.sound+' dB':'건전지로 감시 중',source:source?.id??null})};
}
const src=fireDevices[0],ext=fireDevices[4];
export const fireSource=src.id;
// 경보음이 잠자리까지 가는 길: 코어의 벽이 천장에 닿지 않아 소리가 천장을 따라 넘어간다.
export const soundPath=[src.pos,[19.6,2,HIGH],[21.2,4.4,HIGH],[20.1,5.05,F+.6]];
export const reachPath=[[13,2,F+.04],[8.6,2.6,F+.04],[ext.pos[0]+.3,ext.pos[1],F+.04]];
export const escapePath=[[13,2.2,F+.04],[8.5,2.8,F+.04],[7,4.63,F+.04],[4.6,4.63,F+.04],[4.6,.2,F+.04],[4.6,-2.2,TZ+.04],[4.6,TERR.y0+.2,TZ+.04],[4.6,TERR.y0-1.7,.04],[4.6,-11.5,.04]];
export const fireStages=[
 {id:'SD1',title:'감지기가 연기를 잡습니다',text:'벽난로 앞 천장의 감지기에 시험 연기가 들어왔습니다. 수신기로 보내는 신호선은 없습니다.'},
 {id:'bed',title:'제 몸에서 경보음이 납니다',text:'감지기가 '+fireRule.sound+' dB로 웁니다. 코어의 벽이 천장에 닿지 않아 소리가 잠자리까지 넘어갑니다.'},
 {id:'FE1',title:'소화기로 처음 불을 끕니다',text:'현관 옆 소화기까지 거실에서 여섯 걸음입니다. 불이 천장에 닿기 전이라면 끄고, 닿았다면 바로 나갑니다.'},
 {id:'door-1',title:'현관문으로 나갑니다',text:'초록색 경로는 현관문, 베란다, 계단 다섯 단, 테라스, 계단 네 단을 지나 마당에 닿습니다. 문은 서쪽 하나뿐입니다.'}
];
export const stations=[
 {id:'yard',name:'강가 풀밭',pos:[-3.5,-15.5,0],look:[.55,.84]},
 {id:'terrace',name:'아래 테라스',pos:[.6,-4.2,TZ],look:[.86,.5]},
 {id:'porch',name:'베란다',pos:[2.6,4.4,F],look:[1,0]},
 {id:'living',name:'거실',pos:[10.4,2.3,F],look:[1,.08]},
 {id:'sleep',name:'잠자리',pos:[21.9,7.2,F],look:[-.72,-.7]}
];
export const materials=[
 {id:'steel',name:'흰 에나멜 강재',target:'col-s2',text:'기둥은 H형강, 테두리는 ㄷ형강입니다. 용접 자리를 갈아 내고 흰 에나멜을 칠해 이음이 보이지 않습니다.'},
 {id:'travertine',name:'로마 트래버틴',target:'floor-travertine',text:'석판 한 장이 0.61 × 0.84 m입니다. 실내, 베란다, 테라스, 계단까지 같은 줄눈으로 이어집니다.'},
 {id:'glass',name:'홑판유리',target:'glass-s3',text:'두께 6.4 mm 한 겹이 바닥에서 천장까지 섭니다. 모서리에는 틀 없이 유리끼리 만납니다.'},
 {id:'primavera',name:'프리마베라 합판',target:'core',text:'코어를 감싼 밝은 열대 활엽수 무늬목 합판입니다. 집 안에서 나무는 코어와 옷장뿐입니다.'}
];
