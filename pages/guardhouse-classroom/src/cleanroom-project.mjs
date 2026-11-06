import {boxElement, circuitDemand} from './teaching-equipment.mjs';
import {routeLength} from './learning-engine.mjs';

// Teaching bay. Coordinates are metres in CAD X, Y and height above the finished floor.
export const bay = {width:7.2, depth:4.8, divider:1.65, opening:[.55,1.65], ceiling:2.85};
export const rooms = [
  {id:'room-vestibule',name:'전실',kind:'room',bounds:[.055,0,bay.divider-.055,bay.depth],description:'외부 출입문과 작업구역 문 사이의 준비 공간입니다. 벽의 분전반과 수신기를 확인합니다.'},
  {id:'room-work',name:'작업구역',kind:'room',bounds:[bay.divider+.055,0,bay.width,bay.depth],description:'작업대·조명·팬 필터 유닛이 놓인 공간입니다. 전실을 거쳐 출구로 이동합니다.'}
];
export const sheets = [
  {id:'A-301',title:'작업구역 평면도',menu:'building',view:'plan'},
  {id:'A-302',title:'작업구역 단면도 A-A',menu:'building',view:'section',cutY:2.4},
  {id:'A-303',title:'천장 설비 배치도',menu:'building',view:'ceiling'},
  {id:'A-304',title:'전면 패널 입면도',menu:'building',view:'elevation'},
  {id:'A-305',title:'문·관찰창 치수표',menu:'building',view:'openings'},
  {id:'M-301',title:'벽 패널 재료 단면도',menu:'materials',view:'wall'},
  {id:'M-302',title:'바닥 재료 단면도',menu:'materials',view:'floor'},
  {id:'S-301',title:'대표 바닥판 배근도',menu:'structure',view:'rebar'},
  {id:'E-301',title:'조명·팬 전원 배치도',menu:'electrical',view:'power'},
  {id:'E-302',title:'분전반 분기 회로도',menu:'electrical',view:'circuit'},
  {id:'F-301',title:'소방 신호·피난 배치도',menu:'fire',view:'fire'}
];
export const steps = [
  {id:'building',title:'공간과 도면 읽기',text:'전실과 작업구역을 찾고 평면·단면·천장 배치를 비교합니다.',menu:'building'},
  {id:'materials',title:'벽과 바닥 안쪽 보기',text:'재료층의 두께와 같은 부재의 위치를 연결합니다.',menu:'materials'},
  {id:'structure',title:'바닥판과 철근 보기',text:'대표 띠의 콘크리트와 철근 배치를 비교합니다.',menu:'structure'},
  {id:'electrical',title:'조명과 팬 회로 구분하기',text:'차단기와 기구를 연결하고 배관 경로를 따라갑니다.',menu:'electrical'},
  {id:'fire',title:'소방 신호와 피난 경로 보기',text:'감지기·수신기·경보를 찾고 별도 작동 시험에서 반응을 확인합니다.',menu:'fire'},
  {id:'calculations',title:'조건을 바꾸어 계산하기',text:'입력전력과 바닥 하중이 같은 대상의 계산에 반영되는지 확인합니다.',menu:'calculations'}
];
export const circuits = [
  {id:'CL',name:'작업 조명',pf:1,color:'#d19129',breaker:10,area:1.5,ampacity:15},
  {id:'CF',name:'공기순환 팬',pf:.9,color:'#167b8d',breaker:16,area:2.5,ampacity:20}
];
export const panel = {id:'DB3', name:'전실 분전반',kind:'panel',pos:[.22,3.45,1.45], size:[.24,.52,.64]};
export const equipment = [
  {id:'L31',name:'왼쪽 작업 조명',kind:'light',circuit:'CL',watts:36,pos:[3.25,1.9,2.78],size:[1.15,.18,.07]},
  {id:'L32',name:'오른쪽 작업 조명',kind:'light',circuit:'CL',watts:36,pos:[5.75,1.9,2.78],size:[1.15,.18,.07]},
  {id:'FFU1',name:'왼쪽 팬 필터 유닛',kind:'ffu',circuit:'CF',watts:160,pos:[3.25,3.38,2.87],size:[1.15,.74,.34]},
  {id:'FFU2',name:'오른쪽 팬 필터 유닛',kind:'ffu',circuit:'CF',watts:160,pos:[5.75,3.38,2.87],size:[1.15,.74,.34]}
];
export const fireDevices = [
  {id:'SD3',name:'작업구역 연기감지기',room:'room-work',kind:'smoke',pos:[4.55,2.45,2.76],size:[.20,.20,.07]},
  {id:'RP3',name:'전실 수신기',kind:'receiver',pos:[.21,2.52,1.42],size:[.20,.38,.46]},
  {id:'ALM3',name:'시청각 경보장치',kind:'alarm',pos:[1.75,1.91,2.15],size:[.13,.23,.24]},
  {id:'EX3',name:'외부 출구 유도등',kind:'exit',pos:[.07,1.1,2.24],size:[.13,.46,.19]}
];
export const fireStages=[
  {id:'SD3',title:'감지기 입력',text:'시험 신호가 작업구역의 SD3에 들어왔습니다. 주황색 표식이 신호의 출발점입니다.'},
  {id:'RP3',title:'수신기 확인',text:'전실의 RP3가 SD3의 신호를 받았습니다. 도면의 신호선을 따라 두 기구의 위치를 확인하세요.'},
  {id:'ALM3',title:'경보 작동',text:'수신기의 출력으로 ALM3 표시등이 켜졌습니다. 경보음을 선택하면 소리도 함께 들을 수 있습니다.'},
  {id:'EX3',title:'피난 경로',text:'초록색 경로는 작업대 앞에서 전실 문과 외부 출구를 통과합니다. 유도등은 출구 위에 있습니다.'}
];
export const escapePath=[[4.55,2.45,.04],[4.55,1.1,.04],[bay.divider,1.1,.04],[0,1.1,.04],[-.55,1.1,.04]];
const [sensor,receiver,alarm]=fireDevices;
export const signalPath=[sensor.pos,[sensor.pos[0],sensor.pos[1],3.04],[sensor.pos[0],receiver.pos[1],3.04],[receiver.pos[0],receiver.pos[1],3.04],receiver.pos];
export const alarmPath=[...signalPath,[receiver.pos[0],receiver.pos[1],3.04],[alarm.pos[0],receiver.pos[1],3.04],[alarm.pos[0],alarm.pos[1],3.04],alarm.pos];
export const safetyChecks=[
  ['circuits','조명 차단기를 끈 뒤에도 팬이 도는지 확인했어요.','electrical'],
  ['path','분전반에서 FFU까지 배관을 따라갔어요.','electrical'],
  ['signal','감지기, 수신기, 경보장치의 작동 순서를 확인했어요.','test'],
  ['escape','작업구역에서 두 개의 문을 지나 출구까지 따라갔어요.','fire']
];
export const glossary={
  rebar:['배근','콘크리트가 힘을 받을 때 필요한 위치에 철근을 놓는 작업입니다. D13 @200은 지름 13 mm 철근의 중심 간격을 200 mm로 정했다는 뜻입니다.'],
  ffu:['팬 필터 유닛(FFU)','팬으로 공기를 움직이고 필터를 거쳐 작업구역에 공급하는 장치입니다. 이 수업에서는 팬 전원을 끄고 날개의 상태를 비교합니다.'],
  circuit:['분기회로','분전반에서 한 차단기를 지나 정해진 기구들에 전력을 보내는 길입니다. CL은 조명, CF는 팬에 연결됩니다.'],
  power:['역률(pf)','교류에서 전압과 전류의 곱 중 실제로 소비하는 전력이 차지하는 비율입니다. 이 수업은 조명에 1, 팬에 0.9를 사용합니다.'],
  receiver:['수신기','감지기가 보낸 신호를 받아 경보장치에 작동을 지시하는 장치입니다.'],
  vestibule:['전실','출입구와 작업구역 사이에 둔 방입니다. 이 모형에서는 두 문과 분전반의 위치를 확인할 수 있습니다.']
};
export const termTargets = {
  rebar:{menu:'structure',id:'slab',sheet:'S-301'},
  ffu:{menu:'electrical',id:'FFU1',sheet:'E-301'},
  circuit:{menu:'electrical',id:'DB3',sheet:'E-302'},
  power:{menu:'calculations',id:'FFU1'},
  receiver:{menu:'fire',id:'RP3',sheet:'F-301'},
  vestibule:{menu:'building',id:'room-vestibule',sheet:'A-301'}
};
export function freshBay(raw={}) {
  const state={live:3,breakers:{CL:true,CF:true},watts:{},checks:{},completed:[]};
  state.completed=steps.filter(s=>raw?.completed?.includes(s.id)).map(s=>s.id);
  if(Number.isFinite(raw?.live)&&raw.live>=0&&raw.live<=10)state.live=raw.live;
  for(const c of circuits)if(typeof raw?.breakers?.[c.id]==='boolean')state.breakers[c.id]=raw.breakers[c.id];
  for(const d of equipment){const w=raw?.watts?.[d.id];if(Number.isInteger(w)&&w>=1&&w<=1000)state.watts[d.id]=w;}
  for(const [id] of safetyChecks)state.checks[id]=raw?.checks?.[id]===true;
  return state;
}
import {applyPowerState} from './power-reasoning.mjs';
export function bayElectrical(state) {
  const devices=equipment.map(d=>({...d,watts:state.watts[d.id]??d.watts}));
  const routes=devices.map(d=>{
    const [x,y]=d.pos, h=3.10+(d.circuit==='CL'?0:.075);
    return {id:'route-'+d.id,target:d.id,circuit:d.circuit,points:[panel.pos,[panel.pos[0],panel.pos[1],h],[x,panel.pos[1],h],[x,y,h],d.pos]};
  });
  const calculated=circuits.map(c=>{const demand=circuitDemand(devices,c,220),length=Math.max(...routes.filter(r=>r.circuit===c.id).map(r=>routeLength(r.points))),drop=2*.0175*length*demand.current/c.area,percent=drop/220*100;return {...c,...demand,length,drop,percent,pass:demand.current<=c.breaker&&c.breaker<=c.ampacity&&percent<=3};});
  return {panel,devices:applyPowerState(devices,{circuits:calculated,state,panel,hasMain:false,overloadCutsPower:false}),routes,circuits:calculated};
}
export function bayModel(){
  const elements=[],openings=[];
  function box(id,name,bounds,base,height,kind='fixture',color=0xd8e2e1) {
    elements.push(boxElement(id,name,bounds,base,height,kind,'cleanroom',color));
  }
  const {width:w,depth:d,divider,opening:[a,b]}=bay;
  box('slab','구조 바닥',[-.14,-.14,w+.14,d+.14],-.25,.21,'floor',0x596d75);
  for(let col=0;col<12;col++)for(let row=0;row<8;row++)box('tile-'+col+'-'+row,'바닥 패널',[col*.6+.006,row*.6+.006,(col+1)*.6-.006,(row+1)*.6-.006],-.04,.04,'floor',col<3?0x849fa5:0xcbd8d6);
  for(let col=0;col<12;col++)box('north-'+col,'후면 벽 패널',[col*.6,d,(col+1)*.6-.012,d+.1],0,2.95,'wall',0xd8e6e6);
  for(const [tag,x] of [['west',0],['partition',divider]]){
    for(const [n,start,end] of [['low',0,a],['high',b,d]])box(tag+'-'+n,tag==='west'?'전실 외벽':'전실 칸막이',[x-.055,start,x+.055,end],0,2.75,'wall',0xb8d1cf);
    box(tag+'-door',tag==='west'?'외부 출입문':'작업구역 출입문',[x,a,x+(b-a),a+.04],0,2.18,'door',0xb6c7c8);
    openings.push({id:tag+'-door',axis:'y',start:a,end:b});
    box(tag+'-lintel','출입문 상부',[x-.06,a,x+.06,b],2.18,.57,'wall',0xcbdcda);
    for(const [j,y] of [a,b].entries())box(tag+'-frame-'+j,'출입문 프레임',[x-.09,y-.025,x+.09,y+.025],0,2.18,'frame',0x526a70);
  }
  box('east-sill','관찰창 하부',[w,0,w+.1,d],0,.66,'wall');
  box('east-glass','관찰창',[w+.03,.08,w+.055,d-.08],.66,1.68,'window-glass',0x92b5bb);
  for(const y of [.06,1.6,3.2,d-.06])box('east-frame-'+y,'관찰창 세로틀',[w-.015,y-.02,w+.12,y+.02],.66,1.7,'frame',0x668287);
  box('east-rail','관찰창 프레임',[w,0,w+.1,d],2.34,.09,'frame',0x738d91);
  openings.push({id:'east-glass',axis:'y',start:.08,end:d-.08});
  box('south-wall','전면 벽 패널',[0,-.08,w,0],0,2.95,'wall',0xc5d5d6);
  box('ceiling-deck','상부 설비 공간 덮개',[0,0,w,d],3.30,.07,'ceiling',0xdce6e5);
  for(let col=0;col<12;col++)for(let row=0;row<8;row++){
    const x=col*.6,y=row*.6;
    if(equipment.some(e=>e.kind==='ffu'&&x<e.pos[0]+e.size[0]/2&&x+.6>e.pos[0]-e.size[0]/2&&y<e.pos[1]+e.size[1]/2&&y+.6>e.pos[1]-e.size[1]/2))continue;
    box('ceiling-panel-'+col+'-'+row,'천장 마감 패널',[x+.006,y+.006,x+.594,y+.594],bay.ceiling,.025,'ceiling',0xe4ece8);
  }
  box('south-cut','앞벽 절개선',[0,-.08,w,0],0,.16,'wall',0xa8bdc0);
  for(const x of [2.25,4.8,6.85])box('beam-'+x,'천장 설비 지지대',[x,1.28,x+.038,d],2.79,.07,'frame',0x97aaa9);
  for(const y of [1.9,3.38])box('rail-'+y,'천장 레일',[2.06,y-.022,6.95,y+.022],2.79,.06,'frame',0x859a9c);
  for(const [n,x] of [2.65,5.05].entries()){
    box('bench-'+n,'스테인리스 작업대',[x,3.51,x+1.55,4.32],.88,.075,'fixture',0x93a6ab);
    for(const dx of [.04,1.45])for(const dy of [3.56,4.22])box('leg-'+n+'-'+dx+'-'+dy,'작업대 다리',[x+dx,dy,x+dx+.045,dy+.045],0,.88,'frame',0x899ba1);
    box('bench-shelf-'+n,'하부 선반',[x+.05,3.57,x+1.49,4.24],.23,.035,'fixture',0x9fadae);
    box('cassette-'+n,'웨이퍼 보관대',[x+.38,3.72,x+.96,4.14],.955,.10,'fixture',0x485f69);
  }
  box('gown-locker','전실 보관장',[.35,4.10,1.36,4.68],0,1.95,'fixture',0xa1b6bd);
  return {name:'반도체 클린룸 단일 작업구역',elements,openings};
}
