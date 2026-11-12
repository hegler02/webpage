// 유민미술관(안도 다다오, 2009, 제주 섭지코지) 학습용 재구성의 방·도면·전기 자료.
// 전기는 원본 설계가 아니라 이 건물을 오늘 한국 기준으로 설계한다면 어떻게 되는지 새로 놓은 것이다.
import {routeLength} from './learning-engine.mjs';
import {applyPowerState} from './power-reasoning.mjs';
import {B1,CEIL,LOW,IN,ARM,Q,ROUND,DRUM,RING} from './yumin-model.mjs';
import {TB,storeyOf} from './yumin-fire.mjs';
export {TB,storeyOf,fireDevices,fireRule,fireZones,sprinklerPlan,counts,yuminFire,fireSource,signalPath,alarmPath,escapePath,fireStages} from './yumin-fire.mjs';

export const project={name:'유민미술관',center:[0,0],fade:[190,300],day:{sun:3.1,exposure:.9,exposureIndoor:1.05,ambientIndoor:.26,env:.62,ambient:.17,turbidity:2.6,rayleigh:1.1,mie:.004,skyRich:1.35,bounce:[.58,.1]},glass:{outside:.86,boost:.36},shadowFloor:-6,shadowReach:46,site:{name:'섭지코지',lat:33.424,lon:126.931,tz:9}};

const size=([x0,y0,x1,y1])=>(x1-x0)*(y1-y0);
// 반지름 r인 원이 x>a, y>a 모서리를 덮는 넓이. 둥근 방이 네모난 방의 귀퉁이를 얼마나 먹는지 센다.
const F=(x,r)=>(x*Math.sqrt(r*r-x*x)+r*r*Math.asin(x/r))/2;
const corner=(r,a)=>{const b=Math.sqrt(r*r-a*a);return F(b,r)-F(a,r)-a*(b-a);};
const TALL=(IN-Q)**2-corner(DRUM,Q),CROSS=2*(2*ARM*2*IN)-(2*ARM)**2,LOBBY=CROSS-(Math.PI*DRUM**2-4*corner(DRUM,ARM));
export const rooms=[
 {id:'room-ne',name:'제1전시실 영감의 방',floor:-1,heated:true,bounds:[Q,Q,IN,IN],area:TALL,level:B1,ceiling:CEIL,description:'지하 바닥에서 지붕 판 밑까지 8.95 m가 트인 높은 방입니다. 동쪽 벽 꼭대기의 가로 띠 창 하나로 빛이 들어옵니다.'},
 {id:'room-round',name:'제2전시실 명작의 방',floor:-1,heated:true,bounds:[-ROUND,-ROUND,ROUND,ROUND],area:Math.PI*ROUND**2,level:B1,ceiling:LOW,description:'田자 평면 한가운데에 놓인 지름 12 m의 둥근 방입니다. 십자형 전실 네 팔이 모두 이 방으로 모입니다.'},
 {id:'room-se',name:'제3전시실 아르누보 전성기의 방',floor:-1,heated:true,bounds:[Q,-IN,IN,-Q],area:TALL,level:B1,ceiling:CEIL,description:'제1전시실과 짝을 이루는 높은 방입니다. 같은 동쪽 벽 꼭대기에 띠 창이 있습니다.'},
 {id:'room-lobby',name:'지하 전실',floor:-1,heated:true,bounds:[-IN,-IN,IN,IN],area:LOBBY,level:B1,ceiling:LOW,description:'폭 5 m의 십자형 복도입니다. 북쪽 팔 끝이 경사로에서 들어오는 입구이고, 네 팔이 네 방을 나눕니다.'},
 {id:'room-staff',name:'직원실',floor:-1,heated:true,bounds:[-IN,-8.05,-8.5,-Q],level:B1,ceiling:LOW,description:'수신기와 조명 스위치를 지켜보는 방입니다.'},
 {id:'room-electric',name:'전기실',floor:-1,heated:true,bounds:[-IN,-IN,-8.5,-8.2],level:B1,ceiling:LOW,description:'분전반이 있는 방입니다. 물을 뿌리면 안 되어 스프링클러 헤드를 두지 않았습니다.'},
 {id:'room-plant',name:'기계실',floor:-1,heated:true,bounds:[-8.35,-IN,-Q,-Q],level:B1,ceiling:LOW,description:'공조기와 벽천폭포 순환 펌프가 있는 방입니다.'},
 {id:'room-stair',name:'계단 홀',floor:-1,heated:true,bounds:[-IN,Q,-8.5,IN],level:B1,ceiling:LOW,description:'지하 전실과 1층 휴게 라운지를 잇는 계단이 있는 방입니다.'},
 {id:'room-wc',name:'화장실',floor:-1,heated:true,bounds:[-8.35,Q,-Q,IN],level:B1,ceiling:LOW,description:'가운데 칸막이로 둘로 나눈 화장실입니다.'},
 {id:'room-lamp',name:'제4전시실 램프의 방',floor:1,heated:true,bounds:[-IN,-IN,-Q,-Q],level:0,ceiling:CEIL,description:'1층 남서쪽 방입니다. 불 켠 유리 램프가 주인공이어서 창은 눈높이 띠 창 하나뿐입니다.'},
 {id:'room-hall',name:'1층 홀',floor:1,heated:true,bounds:[-IN,-ARM,-ARM,ARM],level:0,ceiling:CEIL,description:'물의 통로 쪽 유리문으로 드나드는 1층 홀입니다.'},
 {id:'room-lounge',name:'휴게 라운지',floor:1,heated:true,bounds:[-IN,Q,-Q,IN],level:0,ceiling:CEIL,description:'북쪽 유리 너머로 전망 마당과 성산일출봉 쪽을 보며 쉬는 방입니다.'},
 {id:'room-passage',name:'물의 통로',floor:1,heated:false,bounds:[-ARM,-14.4,ARM,14.4],level:0,ceiling:3,description:'돌의 문을 지나면 양쪽 벽에서 물이 흘러내리는 폭 5 m의 바깥 통로입니다.'},
 {id:'room-deck',name:'북쪽 전망 마당',floor:1,heated:false,bounds:[-RING,14.4,ARM,RING],level:0,ceiling:2.2,description:'통로 끝 가벽의 가로 띠 개구부로 성산일출봉이 액자처럼 보이는 마당입니다.'},
 {id:'room-ramp',name:'야외 경사로',floor:-1,heated:false,bounds:[-RING,-RING,RING,RING],area:4*3*(2*14.4+3),level:B1,ceiling:0,description:'콘크리트 벽과 현무암 벽 사이를 서쪽, 남쪽, 동쪽, 북쪽으로 한 바퀴 돌며 4.6 m를 내려가는 길입니다.'}
].map(r=>({...r,area:r.area??size(r.bounds)}));
const inside=rooms.filter(r=>r.heated),sum=(list,f)=>list.reduce((s,r)=>s+f(r),0);
export const interior={area:sum(inside,r=>r.area),volume:sum(inside,r=>r.area*(r.ceiling-r.level)),gallery:TALL,b1:sum(inside.filter(r=>r.floor===-1),r=>r.area),f1:sum(inside.filter(r=>r.floor===1),r=>r.area),roof:2*(IN-Q+.4)**2+(IN-ARM+.4)*(2*IN+.8)};

export const sheets=[
 {id:'A-801',title:'배치·지하 1층 평면도',menu:'building',view:'site',floors:[-1]},
 {id:'A-802',title:'1층 평면도',menu:'building',view:'upper',floors:[1]},
 {id:'A-803',title:'종단면도',menu:'building',view:'section',cutX:12.5},
 {id:'M-801',title:'재료 구성도',menu:'materials',view:'materials',floors:[1]},
 {id:'S-801',title:'지붕 보 구조 평면도',menu:'structure',view:'frame',floors:[-1]},
 {id:'S-802',title:'지붕 보 단면 상세도',menu:'structure',view:'joint',cutX:8.4},
 {id:'E-801',title:'전기 평면도',menu:'electrical',view:'power',floors:[-1,1]},
 {id:'E-802',title:'분전반 분기 회로도',menu:'electrical',view:'circuit',floors:[-1,1]},
 {id:'F-801',title:'소방 평면도',menu:'fire',view:'fire',floors:[-1,1]}
];
export const steps=[
 {id:'building',title:'땅속으로 내려가는 田자 읽기',text:'지하 한 층과 지상 한 층. 네모를 십자로 나눈 평면과 그 둘레를 도는 경사로를 평면도와 단면도에서 찾습니다.',menu:'building'},
 {id:'materials',title:'콘크리트와 현무암, 물',text:'매끈한 노출 콘크리트와 거친 제주 현무암이 어디에서 만나는지 봅니다.',menu:'materials'},
 {id:'structure',title:'높은 방의 지붕 보',text:'11.6 m를 건너는 보가 지붕 판과 그 위 하중을 어떻게 벽으로 넘기는지 계산합니다.',menu:'structure'},
 {id:'electrical',title:'분전반에서 전시실까지',text:'조명 넷, 콘센트 둘, 공조기와 폭포 펌프. 여덟 회로의 전류와 전압강하를 확인합니다.',menu:'electrical'},
 {id:'fire',title:'지하 미술관의 소방',text:'수용인원 258명에서 스프링클러가, 지하 바닥면적에서 옥내소화전과 비상조명등이 정해집니다.',menu:'fire'},
 {id:'energy',title:'땅에 묻힌 건물의 열 보기',text:'서울 날씨에 놓은 미술관에서 벽과 환기가 가져가는 열을 계산합니다.',menu:'energy'}
];

export const circuits=[
 {id:'L1',name:'전시실 조명',volts:220,phase:1,pf:.95,color:'#d19129',breaker:16,area:2.5,ampacity:24,rcd:30,limit:3},
 {id:'L2',name:'전실·명작의 방 조명',volts:220,phase:1,pf:.95,color:'#c0762f',breaker:16,area:2.5,ampacity:24,rcd:30,limit:3},
 {id:'L3',name:'1층 조명',volts:220,phase:1,pf:.95,color:'#a8853a',breaker:16,area:2.5,ampacity:24,rcd:30,limit:3},
 {id:'L4',name:'직원·설비·화장실 조명',volts:220,phase:1,pf:.95,color:'#8f7a52',breaker:16,area:2.5,ampacity:24,rcd:30,limit:3},
 {id:'P1',name:'지하 콘센트',volts:220,phase:1,pf:.9,color:'#167b8d',breaker:20,area:4,ampacity:32,rcd:30,limit:5},
 {id:'P2',name:'1층 콘센트',volts:220,phase:1,pf:.9,color:'#3d6fb5',breaker:20,area:2.5,ampacity:24,rcd:30,limit:5},
 {id:'H1',name:'공조기',volts:380,phase:3,pf:.9,color:'#b5533c',breaker:32,area:6,ampacity:36,rcd:30,limit:5},
 {id:'M1',name:'벽천폭포 순환 펌프',volts:380,phase:3,pf:.85,color:'#7a5ea8',breaker:16,area:2.5,ampacity:24,rcd:30,limit:5}
];
export const panel={id:'LP1',name:'미술관 분전반',kind:'panel',pos:[-IN+.07,-11,B1+1.45],size:[.14,.7,.95]};
// 한전 인입은 남쪽 땅속에서 지하 바닥 밑으로 들어온다.
export const feeder=[[-IN+.07,-21,B1-.6],[-IN+.07,-11,B1-.6],[-IN+.07,-11,panel.pos[2]]];
let n=0;
const lamp=(name,circuit,sw,x,y,z,watts,size)=>({id:'LT'+(++n),name,kind:'light',circuit,switch:sw,watts,pos:[x,y,z-.03],size});
const wall=(id,name,circuit,x,y,z,across,watts=300)=>({id,name,kind:'socket',circuit,watts,pos:[x,y,z],size:across?[.04,.14,.09]:[.14,.04,.09]});
const bar=[.14,1.2,.05],line=[1.2,.14,.05],down=[.2,.2,.05],xs=[4.2,7,9.8,12.6],ys=[5.4,8.6,11.8],arm=[7.4,9.9,12.4];
export const equipment=[
 {id:'SW1',name:'전시실 조명 스위치',kind:'switch',circuit:'L1',pos:[ARM-.03,11.6,B1+1.2],size:[.03,.09,.12]},
 {id:'SW2',name:'전실 조명 스위치',kind:'switch',circuit:'L2',pos:[ARM-.03,11.9,B1+1.2],size:[.03,.09,.12]},
 {id:'SW3',name:'1층 조명 스위치',kind:'switch',circuit:'L3',pos:[-8,-ARM+.03,1.2],size:[.09,.03,.12]},
 {id:'SW4',name:'직원 구역 조명 스위치',kind:'switch',circuit:'L4',pos:[-11.2,-Q-.03,B1+1.2],size:[.09,.03,.12]},
 // LT1–LT12 제1전시실, LT13–LT24 제3전시실: 보 사이 칸마다 세 개씩.
 ...[1,-1].flatMap(s=>xs.flatMap(x=>ys.map(y=>lamp((s>0?'제1전시실':'제3전시실')+' 천장 조명','L1','SW1',x,s*y,CEIL,40,bar)))),
 ...[[1,0,'동쪽'],[-1,0,'서쪽'],[0,1,'북쪽'],[0,-1,'남쪽']].flatMap(([dx,dy,side])=>arm.map(t=>lamp(side+' 전실 조명','L2','SW2',dx*t,dy*t,LOW,20,down))),
 ...Array.from({length:8},(_,i)=>lamp('명작의 방 조명','L2','SW2',Math.round(3.6*Math.cos(i*Math.PI/4+Math.PI/8)*100)/100,Math.round(3.6*Math.sin(i*Math.PI/4+Math.PI/8)*100)/100,LOW,20,down)),
 lamp('명작의 방 가운데 조명','L2','SW2',0,0,LOW,20,down),
 ...[-11.6,-8.4,-5.2].flatMap(x=>[-5.6,-8.4,-11.2].map(y=>lamp('램프의 방 조명','L3','SW3',x,y,CEIL,30,down))),
 ...[-11,-8,-5].map(x=>lamp('1층 홀 조명','L3','SW3',x,0,CEIL,30,line)),
 ...[-9.4,-5.2].flatMap(x=>[4.6,8.4,12.2].map(y=>lamp('라운지 조명','L3','SW3',x,y,CEIL,30,line))),
 ...[[-11.2,-4.2,'직원실'],[-11.2,-6.8,'직원실'],[-11.2,-12,'전기실'],[-5.5,-4.5,'기계실'],[-5.5,-8.5,'기계실'],[-5.5,-12,'기계실'],[-9.8,5.5,'계단 홀'],[-9.8,11.5,'계단 홀'],[-5.5,4.2,'화장실'],[-5.5,7,'화장실'],[-5.5,9.8,'화장실'],[-5.5,12.6,'화장실']].map(([x,y,room])=>lamp(room+' 조명','L4','SW4',x,y,LOW,30,line)),
 wall('WS1','안내대 콘센트','P1',ARM-.03,10.6,B1+.3,true),
 wall('WS2','제1전시실 북쪽 벽 콘센트','P1',8.4,IN-.03,B1+.3,false),
 wall('WS3','제1전시실 동쪽 벽 콘센트','P1',IN-.03,8.4,B1+.3,true),
 wall('WS4','제3전시실 남쪽 벽 콘센트','P1',8.4,-IN+.03,B1+.3,false),
 wall('WS5','제3전시실 동쪽 벽 콘센트','P1',IN-.03,-8.6,B1+.3,true),
 {id:'FB1',name:'명작의 방 바닥 콘센트',kind:'socket',circuit:'P1',watts:300,pos:[0,1.2,B1+.015],size:[.16,.16,.03]},
 wall('WS7','직원실 콘센트','P1',-IN+.03,-5.5,B1+.3,true,600),
 wall('WS8','기계실 콘센트','P1',-Q-.03,-8,B1+.3,true),
 wall('WS9','계단 홀 콘센트','P1',-IN+.03,11,B1+.3,true),
 wall('WS10','램프의 방 서쪽 벽 콘센트','P2',-IN+.03,-8.4,.3,true),
 wall('WS11','램프의 방 남쪽 벽 콘센트','P2',-8.4,-IN+.03,.3,false),
 {id:'FB2',name:'램프 전시대 바닥 콘센트',kind:'socket',circuit:'P2',watts:600,pos:[-8.4,-7,.015],size:[.16,.16,.03]},
 wall('WS12','1층 홀 콘센트','P2',-5.2,-ARM+.03,.3,false),
 wall('WS13','라운지 동쪽 벽 콘센트','P2',-Q-.03,11.6,.3,true),
 wall('WS14','라운지 서쪽 벽 콘센트','P2',-IN+.03,12,.3,true),
 wall('WS15','라운지 남쪽 벽 콘센트','P2',-4.6,Q+.03,.3,false),
 {id:'AHU1',name:'공조기',kind:'ahu',circuit:'H1',watts:15000,pos:[-5.5,-10,B1+.85],size:[2.4,1.3,1.7]},
 {id:'PU1',name:'벽천폭포 순환 펌프',kind:'pump',circuit:'M1',watts:3700,pos:[-4,-4.2,B1+.35],size:[.9,.5,.7]}
];
// KS A 3011 조도 분류 F(150–200–300 lx)의 낮은 값. 작품은 따로 집중 조명으로 비춘다고 보고 전반 조명만 센다.
export const lighting={lux:150,area:TALL,lumens:5000,use:.5,keep:.7};
export const requiredFittings=()=>Math.ceil(lighting.lux*lighting.area/(lighting.lumens*lighting.use*lighting.keep));

export function freshYumin(raw={}){
 const state={power:raw?.power!==false,breakers:{},switches:{SW1:true,SW2:true,SW3:true,SW4:true},watts:{},completed:[]};
 const saved=Array.isArray(raw?.completed)?raw.completed:[];
 state.completed=steps.filter(s=>saved.includes(s.id)).map(s=>s.id);
 for(const c of circuits)state.breakers[c.id]=typeof raw?.breakers?.[c.id]==='boolean'?raw.breakers[c.id]:true;
 for(const k of Object.keys(state.switches))if(typeof raw?.switches?.[k]==='boolean')state.switches[k]=raw.switches[k];
 for(const d of equipment){const w=raw?.watts?.[d.id];if(d.watts&&Number.isInteger(w)&&w>=1&&w<=30000)state.watts[d.id]=w;}
 return state;
}
export const floorOf=z=>z>=-.2?0:B1;
// 길은 세 갈래다. 콘센트와 기계는 바닥 판 속, 낮은 천장의 조명과 스위치는 천장 속(TB),
// 높은 전시실 조명은 칸막이벽 속으로 한 번 올라가 지붕 판 밑을 따라간다.
function routeTo(d){
 const [px,py]=panel.pos,[x,y,z]=d.pos,upper=storeyOf(d.pos)===1,from=[panel.pos];
 if(d.kind==='socket'||d.kind==='ahu'||d.kind==='pump'||(d.kind==='switch'&&upper)){const lv=(upper?0:B1)-.12;return [...from,[px,py,lv],[px,y,lv],[x,y,lv],[x,y,z]];}
 if(upper)return [...from,[px,py,z],[px,y,z],[x,y,z]];
 if(z>LOW){const w=Math.sign(y)*(ARM+.15);return [...from,[px,py,TB],[px,w,TB],[5.9,w,TB],[5.9,w,z],[5.9,y,z],[x,y,z]];}
 return [...from,[px,py,TB],[px,y,TB],[x,y,TB],[x,y,z]];
}
export function yuminElectrical(state=freshYumin()){
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
export const museumLoad=electric=>electric.circuits.reduce((s,c)=>s+c.watts,0);

// 걸어 보는 자리. 경사로는 서쪽 변 가운데쯤, 2 m 내려가는 길의 중간이다.
export const stations=[
 {id:'gate',name:'돌의 문 앞',pos:[0,-24,0],look:[0,1]},
 {id:'passage',name:'물의 통로',pos:[0,-10,0],look:[0,1]},
 {id:'deck',name:'북쪽 전망 마당',pos:[0,15.6,0],look:[0,1]},
 {id:'ramp',name:'야외 경사로',pos:[-15.9,-4,-2+2*(-4+14.4)/28.8],look:[0,-1]},
 {id:'entry',name:'지하 입구 앞',pos:[8,15.9,B1],look:[-1,0]},
 {id:'room1',name:'제1전시실',pos:[11.5,11.5,B1],look:[-.7,-.7],pitch:.12},
 {id:'round',name:'명작의 방',pos:[-2.2,-3.9,B1],look:[.45,.9]},
 {id:'lamp',name:'램프의 방',pos:[-12.6,-4,0],look:[.6,-.8]},
 {id:'lounge',name:'휴게 라운지',pos:[-5,5.6,0],look:[-.4,.9]}
];
export const materials=[
 {id:'concrete',name:'노출 콘크리트',target:'core-e',text:'거푸집을 떼어 낸 면을 그대로 마감으로 씁니다. 900 × 1,800 mm 합판 자국과 판마다 여섯 개씩 남은 폼타이 구멍이 무늬가 됩니다.'},
 {id:'basalt',name:'제주 현무암 쌓기',target:'basalt-e',text:'섭지코지의 검은 돌을 거칠게 쌓은 바깥 벽입니다. 매끈한 콘크리트 벽과 3 m 폭 경사로를 사이에 두고 마주 봅니다.'},
 {id:'water',name:'물 · 벽천폭포',target:'fall-water-ne',text:'통로 양쪽 벽을 타고 흘러내린 물이 수로에 모였다가 펌프로 다시 올라갑니다. 소리로 바깥 풍경을 지웁니다.'},
 {id:'slit',name:'띠 창 유리',target:'glass-slit-n',text:'높은 전시실 벽 꼭대기에 폭 8.65 m, 높이 0.2 m로 낸 가로 창입니다. 빛이 벽을 타고 내려옵니다.'},
 {id:'frosted',name:'반투명 유리 별관',target:'annex-ne-glass-s',text:'모서리에 선 작은 유리 상자입니다. 밤에는 안의 불빛으로 등불처럼 빛납니다.'}
];
