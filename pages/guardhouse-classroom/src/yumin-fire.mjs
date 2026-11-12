// 유민미술관 소방 재구성. 원본 설계가 아니라 오늘 한국 기준으로 다시 놓은 학습용 배치다.
import {resolveFire} from './fire-reasoning.mjs';
import {B1,CEIL,LOW,IN,ARM,Q,DRUM} from './yumin-model.mjs';

// 천장 속 배선 높이. 지하 낮은 천장(-1.0 m)과 1층 바닥 판 사이의 빈 곳이다.
export const TB=LOW+.2;
// 설치 대상을 가르는 숫자. 수용인원은 바닥면적 합계를 4.6 m²로 나눈다 (시행령 별표 7).
export const fireRule={use:'문화 및 집회시설 (전시장)',area:1185,perPerson:4.6,people:Math.round(1185/4.6),basement:829,
 basis:[
  ['자동화재탐지설비','문화 및 집회시설로 연면적 1,000 m² 이상'],
  ['스프링클러설비','문화 및 집회시설로 수용인원 100명 이상이면 모든 층'],
  ['옥내소화전설비','지하층 바닥면적 600 m² 이상이면 모든 층'],
  ['비상조명등','지하층 바닥면적 450 m² 이상인 그 층'],
  ['유도등·소화기','모든 층'],
  ['시각경보기','자동화재탐지설비를 두는 문화 및 집회시설']
 ]};
export const fireZones=[
 {id:'Z1',name:'경계구역 1 · 지하 동쪽',floor:-1,bounds:[0,-IN,IN,IN],area:IN*2*IN},
 {id:'Z2',name:'경계구역 2 · 지하 서쪽',floor:-1,bounds:[-IN,-IN,0,IN],area:IN*2*IN},
 {id:'Z3',name:'경계구역 3 · 1층',floor:1,bounds:[-IN,-IN,-ARM,IN],area:(IN-ARM)*2*IN}
];
// 동쪽 높은 전시실은 천장이 1층 높이까지 올라가도 지하층이다. 1층은 서쪽 절반에만 있다.
export const storeyOf=p=>p[0]<-ARM+.2&&p[2]>-.2?1:-1;
const zoneOf=(x,z)=>x>=0?'Z1':z>=-.2?'Z3':'Z2';
const top=z=>z-.04;
let n=0;
const smoke=(x,y,z,where)=>({id:'SD'+(++n),name:where+' 연기감지기',kind:'smoke',zone:zoneOf(x,z-1),pos:[x,y,top(z)],size:[.2,.2,.07]});
// 높은 전시실은 깊이 0.9 m 보가 연기를 가두므로 보 사이 칸마다 하나씩 둔다.
const bays=[4.2,7,9.8,12.6];
export const fireDevices=[
 ...bays.map((x,i)=>smoke(x,i%2?3.5:13.3,CEIL,'제1전시실')),
 ...bays.map((x,i)=>smoke(x,i%2?-3.5:-13.3,CEIL,'제3전시실')),
 smoke(.9,0,LOW,'명작의 방'),smoke(0,8.65,LOW,'북쪽 전실'),smoke(8.65,0,LOW,'동쪽 전실'),smoke(0,-8.65,LOW,'남쪽 전실'),smoke(-8.65,0,LOW,'서쪽 전실'),
 smoke(-11.2,-5.4,LOW,'직원실'),smoke(-11.2,-11,LOW,'전기실'),smoke(-5.5,-6,LOW,'기계실'),smoke(-9.8,8.4,LOW,'계단 홀'),smoke(-5.5,5.6,LOW,'화장실'),smoke(-5.5,11.2,LOW,'화장실'),
 smoke(-10.7,-7,CEIL,'램프의 방'),smoke(-6.1,-9.8,CEIL,'램프의 방'),smoke(-6.5,0,CEIL,'1층 홀'),smoke(-8.4,7,CEIL,'라운지'),smoke(-5.6,9.8,CEIL,'라운지'),
 {id:'FR1',name:'수신기',kind:'receiver',pos:[-12.5,-Q-.07,B1+1.5],size:[.5,.14,.6]},
 {id:'CP1',name:'발신기 1',kind:'callpoint',zone:'Z1',pos:[7,ARM-.06,B1+1.35],size:[.12,.06,.12]},
 {id:'CP2',name:'발신기 2',kind:'callpoint',zone:'Z2',pos:[-7,ARM-.06,B1+1.35],size:[.12,.06,.12]},
 {id:'CP3',name:'발신기 3',kind:'callpoint',zone:'Z3',pos:[-7.4,ARM-.06,1.35],size:[.12,.06,.12]},
 {id:'BL1',name:'경종·시각경보기 1',kind:'bell',zone:'Z1',pos:[7,ARM-.06,B1+2.2],size:[.2,.08,.2]},
 {id:'BL2',name:'경종·시각경보기 2',kind:'bell',zone:'Z2',pos:[-7,ARM-.06,B1+2.2],size:[.2,.08,.2]},
 {id:'BL3',name:'경종·시각경보기 3',kind:'bell',zone:'Z3',pos:[-7.4,ARM-.06,2.2],size:[.2,.08,.2]},
 {id:'HY1',name:'옥내소화전 1',kind:'hydrant',pos:[8,ARM-.13,B1+.75],size:[.7,.25,1.3]},
 {id:'HY2',name:'옥내소화전 2',kind:'hydrant',pos:[-8,ARM-.13,B1+.75],size:[.7,.25,1.3]},
 {id:'HY3',name:'옥내소화전 3',kind:'hydrant',pos:[-6.4,ARM-.13,.75],size:[.7,.25,1.3]},
 {id:'EX1',name:'지하 입구 피난구유도등',kind:'exit',pos:[0,IN-.06,B1+2.85],size:[.4,.08,.2]},
 {id:'EX2',name:'계단 피난구유도등',kind:'exit',pos:[-13.25,3.9,B1+2.7],size:[.4,.08,.2]},
 {id:'EX3',name:'1층 홀 피난구유도등',kind:'exit',pos:[-ARM-.1,0,2.62],size:[.08,.4,.2]},
 {id:'GL1',name:'북쪽 전실 통로유도등',kind:'exit',pos:[-ARM+.06,9,B1+.9],size:[.08,.4,.2]},
 {id:'GL2',name:'동쪽 전실 통로유도등',kind:'exit',pos:[12,-ARM+.06,B1+.9],size:[.4,.08,.2]},
 {id:'GL3',name:'남쪽 전실 통로유도등',kind:'exit',pos:[ARM-.06,-9,B1+.9],size:[.08,.4,.2]},
 {id:'GL4',name:'서쪽 전실 통로유도등',kind:'exit',pos:[-12,-ARM+.06,B1+.9],size:[.4,.08,.2]},
 {id:'GL5',name:'라운지 통로유도등',kind:'exit',pos:[-12,Q+.06,.9],size:[.4,.08,.2]},
 {id:'EL1',name:'제1전시실 비상조명등',kind:'emergency',pos:[12.4,Q+.08,B1+2.8],size:[.26,.06,.15]},
 {id:'EL2',name:'제3전시실 비상조명등',kind:'emergency',pos:[12.4,-Q-.08,B1+2.8],size:[.26,.06,.15]},
 {id:'EL3',name:'명작의 방 비상조명등',kind:'emergency',pos:[-.9,0,top(LOW)],size:[.26,.15,.06]},
 {id:'EL4',name:'북쪽 전실 비상조명등',kind:'emergency',pos:[0,6.6,top(LOW)],size:[.15,.26,.06]},
 {id:'EL5',name:'동쪽 전실 비상조명등',kind:'emergency',pos:[6.6,0,top(LOW)],size:[.26,.15,.06]},
 {id:'EL6',name:'남쪽 전실 비상조명등',kind:'emergency',pos:[0,-6.6,top(LOW)],size:[.15,.26,.06]},
 {id:'EL7',name:'서쪽 전실 비상조명등',kind:'emergency',pos:[-6.6,0,top(LOW)],size:[.26,.15,.06]},
 {id:'EL8',name:'계단 홀 비상조명등',kind:'emergency',pos:[-10.6,8.4,top(LOW)],size:[.15,.26,.06]},
 ...[[13.7,3.1,B1,'제1전시실'],[13.7,-3.1,B1,'제3전시실'],[-13.75,2.2,B1,'서쪽 전실'],[-8.1,-4,B1,'기계실'],[-8.75,-8.6,B1,'전기실'],[-13.75,-2.2,0,'1층 홀'],[-3.05,-3.2,0,'램프의 방'],[-3.05,3.2,0,'라운지']]
  .map(([x,y,z,where],i)=>({id:'FE'+(i+1),name:where+' 소화기',kind:'extinguisher',pos:[x,y,z+.29],size:[.18,.18,.52]}))
];

// 스프링클러 헤드: 내화구조 수평거리 2.3 m, 정사각형으로 놓으면 간격 3.25 m 이하. 전기실은 헤드를 두지 않는 곳이다.
const grid=[4.2,7,9.8,12.6],spots=[],inDrum=(x,y)=>Math.hypot(x,y)<DRUM+.3;
for(const x of grid)for(const y of grid){
 if(!inDrum(x,y)){spots.push([x,y,CEIL],[x,-y,CEIL]);}
 spots.push([-x,-y,CEIL],[-x,y,CEIL]);
 const electric=x>8.5&&y>8.2,stair=x>11.15&&y>=4&&y<9.35;
 if(!inDrum(x,y)){if(!electric)spots.push([-x,-y,LOW]);if(!stair)spots.push([-x,y,LOW]);}
}
for(const s of [1,-1])for(const t of [1,-1]){spots.push([s*1.625,t*1.625,LOW],[s*4.875,t*1.625,LOW],[s*1.625,t*4.875,LOW],[s*3.6,t*3.6,LOW]);}
for(const t of [6.9,9.65,12.4])for(const s of [1.25,-1.25])spots.push([s,t,LOW],[s,-t,LOW],[t,s,LOW],[-t,s,LOW]);
for(const x of grid)for(const y of [1.25,-1.25])spots.push([-x,y,CEIL]);
const heads=spots.map(([x,y,z],i)=>({id:'SP'+(i+1),name:'스프링클러 헤드 '+(i+1),kind:'sprinkler',pos:[x,y,top(z)],size:[.08,.08,.08]}));
fireDevices.push(...heads);
export const sprinklerPlan={radius:2.3,spacing:2*2.3*Math.SQRT1_2,count:heads.length,dry:'전기실'};
export const counts=kind=>fireDevices.filter(d=>d.kind===kind).length;

// 정전이면 비상조명등이 축전지로 켜진다. 헤드와 소화전은 전기 신호 없이 움직인다.
export function yuminFire({signal=null,mains=true,battery=true}={}){
 const fire=resolveFire(fireDevices,{signal,mains,battery});
 const manual={sprinkler:'헤드가 열을 받으면 스스로 열림',hydrant:'사람이 호스를 꺼내 쓰는 설비'};
 return {...fire,devices:fire.devices.map(d=>manual[d.kind]?{...d,powered:null,on:false,stateLabel:manual[d.kind]}:d)};
}
const find=id=>fireDevices.find(d=>d.id===id),src=find('SD3'),rcv=find('FR1'),bell=find('BL1'),wall=Q-.15;
export const fireSource=src.id;
export const signalPath=[src.pos,[src.pos[0],wall,src.pos[2]],[src.pos[0],wall,TB],[rcv.pos[0],wall,TB],[rcv.pos[0],rcv.pos[1],TB],rcv.pos];
export const alarmPath=[rcv.pos,[rcv.pos[0],rcv.pos[1],TB],[rcv.pos[0],wall,TB],[bell.pos[0],wall,TB],[bell.pos[0],wall,bell.pos[2]],bell.pos];
// 제1전시실에서 지하 입구로 나가면 하늘이 열린 경사로다. 경사로를 한 바퀴 올라 남쪽 돌의 문으로 나간다.
export const escapePath=[[9.9,9,B1],[9.9,0,B1],[0,0,B1],[0,15.9,B1],[15.9,15.9,B1],[15.9,14.4,B1],[15.9,-14.4,-3.3],[15.9,-15.9,-3.3],[14.4,-15.9,-3.3],[-14.4,-15.9,-2],[-15.9,-15.9,-2],[-15.9,-14.4,-2],[-15.9,14.4,0],[-15.9,15.9,0],[0,15.9,0],[0,-18.8,0]].map(([x,y,z])=>[x,y,z+.05]);
export const fireStages=[
 {id:src.id,title:'감지기 입력',text:'제1전시실 보 사이에 찬 연기를 '+src.id+'이 잡아 경계구역 1의 신호를 보냅니다.'},
 {id:'FR1',title:'수신기 확인',text:'직원실 수신기가 어느 경계구역인지 표시하고 경보를 내보냅니다.'},
 {id:'BL1',title:'경종과 시각경보',text:'경종이 울리고 시각경보기가 번쩍여 소리를 못 듣는 관람객에게도 알립니다.'},
 {id:'EX1',title:'피난 경로',text:'지하 입구를 나서면 하늘이 열린 경사로입니다. 한 바퀴 올라 남쪽 돌의 문으로 나갑니다.'},
 {id:'EL1',title:'정전과 비상조명등',text:'상용 전원이 끊기면 지하층 비상조명등이 축전지로 켜져 바닥을 비춥니다.'}
];
