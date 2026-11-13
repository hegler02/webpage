import {wires,routeLength} from './capsule-project.mjs';

const two=n=>String(n).padStart(2,'0');
const MC=n=>'+MC-'+n;
// Q1 is the power switch itself; the rest can be opened one by one.
export const PROTECTION=['Q2','F1','F2','Q3','Q4','Q5','Q6','Q7','Q8','Q9','Q10','Q11','Q12','Q13','Q14','Q15'].map(MC);
export const ESTOPS=['+OS-S3','+OS-S4'];
export const GUARDS=[5,6,7,8,9,10,11].map(n=>'+OS-S'+n);
export const GATES=[2,3,4,5].map(n=>'+M-S'+n);
export const faultNames={none:'고장 없음',overload:'주 구동 개폐기 Q6 과부하 트립',vacuum:'진공 펌프 개폐기 Q9 트립',drive:'인버터 고장',air:'공기 압력 부족',powder:'분말 부족',hopper:'캡슐 호퍼 부족'};
// Class values: the source gives neither the delay setting of the XPS-AT relays nor a cycle time.
export const HOLD=2,JOG=.3,PRESS=.6;
const SWITCHED=new Set([...PROTECTION,...ESTOPS,...GUARDS,...GATES]);
const within=(v,a,b)=>v>=a&&v<b;

export const defaults=()=>({version:1,power:false,off:{},jog:false,pendant:false,remoteJog:false,vacuumSel:false,run:false,press:'',pressLeft:0,hold:0,horn:0,u4Was:false,fault:'none',missing:0,phase:.5,count:0,slots:Array(8).fill(-1),good:0,bad:0,speed:.5,powderSpeed:.5,paused:false,efficiency:.7,pf:.75,checks:{},evidence:{},lesson:{}});
// The moving state of the machine, as opposed to class records and settings.
const OPERATING=['power','off','jog','pendant','remoteJog','vacuumSel','run','press','pressLeft','hold','horn','u4Was','fault','missing','phase','count','slots','paused'];
export function resetOperation(s){const fresh=defaults();for(const k of OPERATING)s[k]=fresh[k];return s;}
export function restore(raw){
 const s=defaults();if(!raw||raw.version!==1)return s;
 for(const k of ['speed','powderSpeed','efficiency','pf','missing'])if(Number.isFinite(raw[k]))s[k]=raw[k];
 s.speed=Math.max(0,Math.min(1,s.speed));s.powderSpeed=Math.max(0,Math.min(1,s.powderSpeed));s.efficiency=Math.max(.4,Math.min(.95,s.efficiency));s.pf=Math.max(.4,Math.min(1,s.pf));s.missing=Math.max(0,Math.min(16,Math.round(s.missing)));
 for(const k of ['checks','evidence','lesson'])if(raw[k]&&typeof raw[k]==='object')s[k]={...raw[k]};
 return s;
}

export function evaluate(s){
 const ok=id=>!s.off[id]&&!(s.fault==='overload'&&id==='+MC-Q6')&&!(s.fault==='vacuum'&&id==='+MC-Q9');
 const closed=ids=>ids.every(id=>!s.off[id]);
 // Hardwired part, as drawn on original sheets 02, 03, 20, 21 and 22.
 const bus=s.power&&ok('+MC-Q2'),t1=bus&&ok('+MC-F1'),v110=t1&&ok('+MC-F2'),g1=v110&&ok('+MC-Q3'),vdc=g1&&ok('+MC-Q5'),safe=vdc&&ok('+MC-Q15');
 const k6=vdc&&s.jog,k7=vdc&&s.pendant,k8=k7&&s.remoteJog,k9=k7&&s.vacuumSel,k5=vdc&&closed(GATES);
 const u5=safe&&closed(GUARDS),bypass=k6&&k7,u4=safe&&closed(ESTOPS)&&(u5||bypass);
 const k3=u4,k4=u4,vre=g1&&ok('+MC-Q4')&&k3&&k4;
 const holding=!u4&&safe&&s.hold>0,k10=u4||holding,k15=k10;
 const plc=v110&&ok('+MC-Q14'),u3=v110&&ok('+MC-Q12'),fan=v110&&ok('+MC-Q10'),outlet=v110&&ok('+MC-Q11'),comm=vdc&&ok('+MC-Q13');
 const u1=bus&&ok('+MC-Q6')&&k10,u2=bus&&ok('+MC-Q8')&&k15;
 const inPosition=s.phase>=.4,inputs={},input=(n,v)=>inputs['I:13/'+two(n)]=!!(vdc&&v);
 input(0,ok('+MC-Q6')&&ok('+MC-Q7')&&ok('+MC-Q8'));input(1,u1&&u2&&s.fault!=='drive');input(2,!ok('+MC-Q9'));input(3,k6||k7);
 input(4,within(s.phase,.55,.8));input(5,s.fault!=='air');input(6,inPosition);input(7,s.fault==='hopper');
 input(8,s.press==='start'||(k6&&k7&&k8));input(9,s.press!=='stop');input(10,u5);input(11,k5);input(12,u4);
 input(13,within(s.phase,.45,.75));input(15,u3&&s.fault!=='powder');
 for(let n=0;n<16;n++)inputs['I:14/'+two(n)]=!!(vdc&&inPosition&&s.slots[3]>=0&&n>=s.slots[3]);
 // PLC part: a class model, because the source has no PLC program.
 const I=n=>inputs['I:13/'+two(n)];
 const interlock=I(12)&&I(10)&&I(11)&&I(0)&&I(1)&&I(5)&&I(15)&&!I(2);
 const canRun=plc&&interlock&&I(9)&&!I(3),canStart=canRun&&I(8),run=!!s.run&&canRun;
 const jogging=plc&&!run&&I(3)&&I(8)&&I(9)&&I(12)&&I(0)&&I(1);
 const outputs={},out=(a,v)=>outputs[a]=!!(plc&&v);
 for(let n=0;n<16;n++){out('O:11/'+two(n),false);out('O:12/'+two(n),false);}
 out('O:11/00',run);out('O:11/02',run);out('O:11/04',run);out('O:11/09',run||jogging);
 out('O:12/00',run&&within(s.phase,.45,.6));out('O:12/01',run&&within(s.phase,.6,.8)&&s.slots[6]>=0);out('O:12/02',run&&within(s.phase,.6,.8)&&s.slots[4]>0);out('O:12/03',run&&within(s.phase,.5,.7));
 out('O:12/08',s.horn>0);out('O:12/09',!(run||jogging));out('O:12/10',!I(12)||!I(0)||!I(1)||I(2));out('O:12/11',I(3)||I(7)||!I(15)||!I(5)||!I(10)||!I(11));
 // Card 1 coils run on +24 VRE, card 2 on +24 VDC.
 const k11=outputs['O:11/00']&&vre,k12=outputs['O:11/02']&&vre,k13=outputs['O:11/03']&&vre,k14=outputs['O:11/04']&&vre,k1=outputs['O:11/09']&&vre,k2=outputs['O:12/09']&&vdc;
 const brake=bus&&ok('+MC-Q7')&&k2;
 const m1=u1&&k1&&ok('+MC-Q7')&&!brake&&s.fault!=='drive',m2=u2&&k12&&s.fault!=='drive',m3=bus&&ok('+MC-Q9')&&k14;
 input(14,m3);
 const indexPerMin=10+30*s.speed,period=60/indexPerMin;
 const analog={IOUT0:plc?4+16*s.speed:0,IOUT1:plc?4+16*s.powderSpeed:0,IN0:plc?(m1?4+16*s.speed*(jogging?JOG:1):4):0,IN1:plc?(m2?4+16*s.powderSpeed:4):0};

 const blocked=[],why=(c,id,text)=>{if(c)blocked.push({id,text});};
 const pressed=ESTOPS.find(id=>s.off[id]),open=GUARDS.find(id=>s.off[id]),gate=GATES.find(id=>s.off[id]),starter=['+MC-Q6','+MC-Q7','+MC-Q8'].find(id=>!ok(id));
 why(!s.power,'+MC-Q1','주 차단 스위치 Q1이 열려 있어 설비 전체에 전기가 없습니다.');
 why(s.off['+MC-Q2'],'+MC-Q2','주 차단 스위치 Q2가 열려 460 V 모선이 죽었습니다.');
 why(s.off['+MC-F1']||s.off['+MC-F2'],s.off['+MC-F1']?'+MC-F1':'+MC-F2','변압기 퓨즈가 빠져 110 V 제어 전원이 없습니다.');
 why(s.off['+MC-Q3'],'+MC-Q3','차단기 Q3이 열려 직류 전원 장치 G1이 꺼졌습니다.');
 why(s.off['+MC-Q5'],'+MC-Q5','차단기 Q5가 열려 +24 VDC가 없습니다. 입력 카드와 안전 회로가 모두 꺼집니다.');
 why(s.off['+MC-Q15'],'+MC-Q15','차단기 Q15가 열려 안전 계전기 U4와 U5에 전원이 없습니다.');
 why(pressed,pressed,'비상정지 버튼이 눌려 안전 계전기 U4가 떨어졌습니다.'+(holding?' K10·K15는 잠시 뒤에 떨어집니다.':''));
 why(open&&!bypass,open,'위 문 스위치가 열려 U5가 떨어지고, U5 접점이 빠진 U4도 떨어졌습니다.'+(holding?' K10·K15는 잠시 뒤에 떨어집니다.':''));
 why(open&&bypass,open,'위 문이 열려 있습니다. 조그 릴레이 K6·K7이 U5 대신 U4를 살려 조그만 할 수 있습니다.');
 why(s.off['+MC-Q4'],'+MC-Q4','차단기 Q4가 열려 +24 VRE가 없습니다. 출력 카드 1의 코일이 붙지 못합니다.');
 why(s.off['+MC-Q14'],'+MC-Q14','차단기 Q14가 열려 PLC가 꺼졌습니다.');
 why(gate,gate,'아래 문 리밋 스위치가 열려 릴레이 K5가 떨어지고 I:13/11이 꺼졌습니다.');
 why(starter,starter,s.fault==='overload'&&starter==='+MC-Q6'?'수동 개폐기 Q6이 과부하로 떨어져 I:13/00이 꺼졌습니다.':`수동 개폐기 ${String(starter).slice(4)}이 열려 I:13/00이 꺼졌습니다.`);
 why(s.fault==='drive','+MC-U1','인버터가 고장을 알려 I:13/01이 꺼졌습니다.');
 why(!ok('+MC-Q9'),'+MC-Q9','진공 펌프 개폐기 Q9가 떨어져 I:13/02가 켜졌습니다.');
 why(s.fault==='air','+MC-SQ2','공기 압력이 낮아 I:13/05가 꺼졌습니다.');
 why(s.off['+MC-Q12'],'+MC-Q12','차단기 Q12가 열려 분말 레벨 계전기 U3이 꺼지고 I:13/15가 꺼졌습니다.');
 why(s.fault==='powder','+MC-U3','분말이 부족해 I:13/15가 꺼졌습니다.');
 why(k6||k7,k6?'+MC-K6':'+MC-K7','조그 릴레이가 붙어 I:13/03이 켜졌습니다. 자동 운전은 서고 조그만 됩니다.');
 let reason=jogging?(m1?'조그 중입니다. 시작 입력이 켜져 있는 동안 K1이 붙어 주 구동이 천천히 돕니다.':'조그 입력은 들어왔지만 주 구동이 돌지 못합니다.'):blocked[0]?.text??(run?(s.paused?'전기 연결은 그대로입니다. 관찰을 위해 시간만 멈췄습니다.':'자동 운전 중입니다. K1이 인버터 U1에 운전 허가를 주고 K11이 초록 경광등을 켭니다.'):'운전 준비가 됐습니다. 시작 버튼을 누르면 I:13/08이 켜집니다.');
 if(I(7))reason+=' 캡슐 호퍼가 비어 가 I:13/07이 켜지고 O:12/11이 노란 경광등 H3을 켭니다.';

 const active={'+MC-Q1':s.power,'+OS-S1':s.press==='start','+OS-S2':s.press!=='stop','+OS-S12':s.jog,'+OS-S13':s.remoteJog,'+OS-S14':s.vacuumSel,'+MC-X1':s.pendant,
  '+MC-T1':t1,'+MC-G1':g1,'+MC-U1':u1,'+MC-U2':u2,'+MC-U3':u3,'+MC-U4':u4,'+MC-U5':u5,'+MC-RACK1':plc,
  '+MC-K1':k1,'+MC-K2':k2,'+MC-K3':k3,'+MC-K4':k4,'+MC-K5':k5,'+MC-K6':k6,'+MC-K7':k7,'+MC-K8':k8,'+MC-K9':k9,'+MC-K10':k10,'+MC-K11':k11,'+MC-K12':k12,'+MC-K13':k13,'+MC-K14':k14,'+MC-K15':k15,'-22KA3':k7,
  '+M-M1':m1,'+M-M2':m2,'+M-M3':m3,'+M-DV2':brake,'+M-S1':fan,'+MC-RECPT1':outlet,'-D1':comm,'-D2':comm,'-S1':inputs['I:13/15'],'MCH1':m1,
  '+OS-H1':outputs['O:12/08']&&vdc,'+OS-H2':outputs['O:12/10']&&vdc,'+OS-H3':outputs['O:12/11']&&vdc,'+OS-H4':k11&&vdc};
 for(const id of PROTECTION)active[id]=ok(id);
 for(const id of [...ESTOPS,...GUARDS,...GATES])active[id]=!s.off[id];
 for(let n=1;n<=8;n++){active['+MC-PLC'+n]=plc;active['+M-Y'+n]=outputs['O:12/0'+(n-1)]&&vdc;}
 for(let n=1;n<=16;n++)active['+M-B'+n]=inputs['I:14/'+two(n-1)];
 ['04','05','06','07','13','14'].forEach((a,i)=>active['+MC-SQ'+(i+1)]=inputs['I:13/'+a]);
 for(const k in active)active[k]=!!active[k];
 return {rails:{bus,v110,vdc,vre},inputs,outputs,analog,active,blocked,reason,safe,plc,u4,u5,bypass,holding,hold:s.hold,interlock,canRun,canStart,run,jogging,motor:m1,powder:m2,vacuum:m3,brake,inPosition,indexPerMin,period,capsulesPerMin:16*indexPerMin};
}

// Latches that depend on what happened before: the delayed contacts of U4 and the run memory of the PLC model.
export function settle(s){
 const p=evaluate(s);
 if(s.u4Was&&!p.u4&&p.safe)s.hold=HOLD;
 if(p.u4||!p.safe)s.hold=0;
 s.u4Was=p.u4;
 if(s.run&&!p.canRun){s.run=false;if(p.plc&&!p.interlock)s.horn=3;}
 else if(!s.run&&p.canStart)s.run=true;
 return evaluate(s);
}

export function deviceAction(id){
 if(id==='+MC-Q1')return {type:'power'};
 if(SWITCHED.has(id))return {type:'toggle',value:id};
 return {'+OS-S12':{type:'jog'},'+OS-S13':{type:'remoteJog'},'+OS-S14':{type:'vacuumSel'},'+MC-X1':{type:'pendant'},'+OS-S1':{type:'start'},'+OS-S2':{type:'stop'}}[id]??null;
}
export function actionLabel(id,s){
 const off=!!s.off[id];
 if(id==='+MC-Q1')return s.power?'Q1 열기 (전원 끄기)':'Q1 닫기 (전원 켜기)';
 if(id==='+MC-Q6'&&s.fault==='overload')return 'Q6 다시 닫기 (트립 복귀)';
 if(id==='+MC-Q9'&&s.fault==='vacuum')return 'Q9 다시 닫기 (트립 복귀)';
 if(PROTECTION.includes(id))return id.slice(4)+(id.includes('-F')?(off?' 퓨즈 끼우기':' 퓨즈 빼기'):(off?' 닫기':' 열기'));
 if(ESTOPS.includes(id))return off?'비상정지 풀기':'비상정지 누르기';
 if(GUARDS.includes(id))return off?'위 문 닫기':'위 문 열기';
 if(GATES.includes(id))return off?'아래 문 닫기':'아래 문 열기';
 return {'+OS-S12':s.jog?'조그 모드 끄기':'조그 모드 켜기','+OS-S13':s.remoteJog?'원격 조그 버튼 놓기':'원격 조그 버튼 누르고 있기','+OS-S14':s.vacuumSel?'진공 밸브 선택 끄기':'진공 밸브 선택 켜기','+MC-X1':s.pendant?'플러그 X1 뽑기':'플러그 X1 꽂기','+OS-S1':'시작 버튼 누르기','+OS-S2':'정지 버튼 누르기'}[id]??'';
}

export function act(s,type,value){
 const before=evaluate(s),moving=before.run||before.motor;
 if(type==='power')s.power=!s.power;
 else if(type==='toggle'&&SWITCHED.has(value)){
  if(value==='+MC-Q6'&&s.fault==='overload')s.fault='none';
  else if(value==='+MC-Q9'&&s.fault==='vacuum')s.fault='none';
  else if(s.off[value])delete s.off[value];
  else{
   s.off[value]=true;
   if(ESTOPS.includes(value)&&moving)s.evidence.emergency=true;
   if(GUARDS.includes(value)&&before.run)s.evidence.guardOpen=true;
   if(value==='+MC-Q6'&&before.run)s.evidence.tripped=true;
  }
 }
 else if(type==='jog')s.jog=!s.jog;
 else if(type==='pendant')s.pendant=!s.pendant;
 else if(type==='remoteJog')s.remoteJog=!s.remoteJog;
 else if(type==='vacuumSel')s.vacuumSel=!s.vacuumSel;
 else if(type==='start'||type==='stop'){s.press=type;s.pressLeft=PRESS;}
 else if(type==='fault'){s.fault=Object.hasOwn(faultNames,value)?value:'none';if(s.fault==='overload'&&before.run)s.evidence.tripped=true;}
 else if(type==='missing')s.missing=Math.max(0,Math.min(16,Math.round(Number(value)||0)));
 else if(type==='speed')s.speed=Math.max(0,Math.min(1,Number(value)||0));
 else if(type==='powderSpeed')s.powderSpeed=Math.max(0,Math.min(1,Number(value)||0));
 else if(type==='pause')s.paused=!s.paused;
 else if(type==='counts'){s.good=0;s.bad=0;}
 // A lesson puts one segment under the photo switches so the inputs can be compared at rest.
 else if(type==='place')s.slots[3]=Math.max(-1,Math.min(16,Math.round(Number(value)||0)));
 else if(type==='release'){s.press='';s.pressLeft=0;}
 else if(type==='normal'){s.off={};s.fault='none';s.jog=false;s.pendant=false;s.remoteJog=false;s.vacuumSel=false;s.missing=0;s.press='';s.pressLeft=0;}
 return settle(s);
}

export function tick(s,dt){
 if(!Number.isFinite(dt)||dt<=0||s.paused)return false;
 const step=Math.min(dt,.1);let changed=false;
 if(s.pressLeft>0){s.pressLeft=Math.max(0,s.pressLeft-step);if(!s.pressLeft)s.press='';changed=true;}
 if(s.hold>0){s.hold=Math.max(0,s.hold-step);if(!s.hold&&(s.evidence.emergency||s.evidence.guardOpen))s.evidence.delayed=true;changed=true;}
 if(s.horn>0){s.horn=Math.max(0,s.horn-step);changed=true;}
 const p=settle(s);
 if(!p.motor)return changed;
 if(p.jogging&&!p.u5)s.evidence.jogBypass=true;
 const from=s.phase,cross=t=>from<t&&s.phase>=t;
 s.phase+=step/p.period*(p.jogging?JOG:1);
 // Capsules drop while Y1 blows; segments leave at the end of the Y2 and Y3 windows.
 if(cross(.6)&&p.run&&s.slots[0]<0)s.slots[0]=s.missing;
 if(cross(.8)&&p.run){
  if(s.slots[4]>0){s.bad++;s.slots[4]=-1;s.evidence.rejected=true;}
  if(s.slots[6]>=0){if(s.slots[6]>0)s.bad++;else s.good++;s.slots[6]=-1;}
 }
 if(s.phase>=1){s.phase-=1;s.count++;s.slots=[s.slots[7],...s.slots.slice(0,7)];}
 return true;
}

export function calculations(s){
 const watts=.33*746,current=watts/(Math.sqrt(3)*460*s.efficiency*s.pf),va=1500,primary=va/460,secondary=va/110,dc=24*10,signal=4+16*s.speed,r03=wires.find(w=>w.id==='R03'),length=routeLength(r03),rate=10+30*s.speed;
 return [
  {id:'current',title:'주 구동 모터에 필요한 전류',why:'인버터 U1과 개폐기 Q6이 감당할 전류의 크기를 가늠합니다.',formula:'I = P출력 / (√3 × V × η × cosφ)',substitution:`0.33 HP × 746 = ${watts.toFixed(0)} W → ${watts.toFixed(0)} / (√3 × 460 × ${s.efficiency} × ${s.pf}) = ${current.toFixed(2)} A`,symbols:'P출력: 축 출력 W · V: 선간전압 V · η: 효율 · cosφ: 역률 · I: 선전류 A',theory:'평형 3상 유효전력 P입력 = √3 VI cosφ와 효율 η = P출력/P입력을 함께 정리합니다. 0.33 HP와 460 V는 원본 값이고 효율과 역률은 수업값입니다.',target:'+M-M1',term:'motor',value:current},
  {id:'transformer',title:'제어 변압기의 1차·2차 전류',why:'퓨즈 F1과 F2가 왜 서로 다른 크기인지 봅니다.',formula:'I = S / V',substitution:`1차 ${va} / 460 = ${primary.toFixed(2)} A · 2차 ${va} / 110 = ${secondary.toFixed(1)} A · F2 6 A × 110 V = ${6*110} VA`,symbols:'S: 변압기 용량 VA · V: 전압 V · I: 전류 A',theory:'변압기는 전압을 낮추는 만큼 전류가 커집니다. 1500 VA는 원본 부품 번호 9070TF1500D3에서, F1 15 A와 F2 6 A는 원본 부품표에서 읽은 값입니다.',target:'+MC-T1',term:'transformer',value:secondary},
  {id:'supply',title:'직류 전원 장치가 낼 수 있는 전력',why:'차단기 Q4와 Q5가 나눠 쓰는 전류를 전원 용량과 견줍니다.',formula:'P = V × I',substitution:`24 V × 10 A = ${dc} W · Q4 5 A + Q5 5 A = 10 A`,symbols:'P: 전력 W · V: 직류 전압 V · I: 정격 전류 A',theory:'G1의 10 A와 Q4·Q5의 5 A는 원본 부품표 값입니다. 두 갈래가 정격까지 흐르면 전원 정격과 같아집니다.',target:'+MC-G1',term:'supply',value:dc},
  {id:'analog',title:'속도를 지시하는 전류 신호',why:'PLC가 인버터에 속도를 어떻게 알려 주는지 숫자로 봅니다.',formula:'I = 4 + 16 × (속도 비율)',substitution:`주 구동 U1: 4 + 16 × ${s.speed.toFixed(2)} = ${signal.toFixed(1)} mA · 분말 구동 U2: 4 + 16 × ${s.powderSpeed.toFixed(2)} = ${(4+16*s.powderSpeed).toFixed(1)} mA`,symbols:'I: 신호 전류 mA · 속도 비율: 0–1',theory:'4–20 mA 신호는 0 %를 4 mA로 둡니다. 선이 끊겨 0 mA가 되면 고장으로 알아볼 수 있습니다. 4–20 mA는 원본 18·19번 도면의 표기입니다.',target:'+MC-PLC7',term:'analog',value:signal},
  {id:'length',title:'주 구동 모터선의 길이',why:'제어반에서 모터까지 가는 길을 3D에서 재어 수량으로 잇습니다.',formula:'L = Σ 구간 길이',substitution:`${r03.points.length-1}개 구간의 합 = ${length.toFixed(2)} m`,symbols:'L: 중심 경로 길이 m',theory:'3D 경로의 꺾인 점 사이 거리를 더합니다. 단자 여유와 가공 여유는 넣지 않은 수업 모형의 길이입니다.',target:'+MC-U1',term:'cable',value:length},
  {id:'rate',title:'한 분에 지나가는 캡슐 수',why:'속도 지시가 생산량으로 이어지는 것을 봅니다.',formula:'N = 16 × (분당 이동 횟수)',substitution:`16 × ${rate.toFixed(1)} = ${(16*rate).toFixed(0)}개/분`,symbols:'N: 분당 캡슐 수 · 16: 세그먼트 한 개의 캡슐 자리',theory:'광전 스위치가 16개이므로 세그먼트 하나에 16개가 들어갑니다. 분당 이동 횟수는 수업값입니다.',target:'MCH1',term:'index',value:16*rate}
 ];
}

export function csv(rows){const cell=v=>'"'+String(v??'').replaceAll('"','""')+'"';return '﻿'+[['기기/경로','품명','규격','수량','단위','도면','산출 설명'],...rows.map(r=>[r.id,r.name,r.spec,r.quantity,r.unit,r.sheet,r.note])].map(r=>r.map(cell).join(',')).join('\r\n');}
