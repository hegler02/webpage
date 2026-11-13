import {drawingData} from './capsule-drawing-data.mjs';

export const project=Object.freeze({id:9,name:'캡슐 선별기',title:'캡슐 충전·선별 설비',version:1,source:'Autodesk AutoCAD Electrical 2027 sample project IecDemo',scope:'캡슐에 분말을 채우고 빈 캡슐을 골라내는 설비의 전원·구동·PLC·안전 회로. 원본 29장의 기기 번호와 단자 번호를 그대로 씁니다.',modelNote:'회로 연결은 원본 도면대로입니다. 원본에 PLC 프로그램과 기계 제작도가 없어 운전 순서, 기계 외형, 제어반 밖 기기의 자리는 수업 모형입니다.'});

// Every original sheet belongs to exactly one study sheet.
const STUDY=[['A-901','기계·기기 배치도',['01']],['E-901','전원 계통도',['02','03']],['E-902','구동·보조 회로도',['04','05','06','07','08']],['E-903','PLC 출력도',['09','10','11','12','13']],['E-904','PLC 입력도',['14','15','16','17','18','19']],['E-905','안전·제어 회로도',['20','21','22']],['P-901','제어반 내부 배치도',['24','25','26','27','28','29']],['P-902','조작반 배치도',['23']]];
const studyOf=n=>STUDY.find(s=>s[2].includes(n))[0];

// World frame in metres: x right, y up, z toward the viewer. The cabinet interior follows original sheet 24, the operator panel sheet 23.
export const LAYOUT=Object.freeze({
 cabinet:{centre:[-2.6,1.1,-1.75],size:[1.1,2,.5],plate:-1.97,wiring:-1.78},
 machine:{centre:[.2,.45,0],size:[2.2,.9,1.4],table:.94,guardTop:1.9},
 dial:{centre:[.2,1,0],radius:.46,segments:8,columns:8,pitch:.034,row:.02},
 operator:{centre:[1.95,1.3,.62],face:.71,size:[.9,.5,.2]},
 duct:{y:.06,z:-1.2}
});
export const stations=[[135,'캡슐 공급','호퍼에서 빈 캡슐 16개가 세그먼트에 내려옵니다.','+M-Y1'],[180,'캡슐 분리','진공으로 캡슐 뚜껑과 몸통을 나눕니다.','+M-M3'],[225,'분말 충전','분말을 눌러 담습니다.','+M-M2'],[270,'광전 검사','광전 스위치 16개가 캡슐이 있는지 봅니다.','+M-B1'],[315,'불량 배출','빈 자리가 있던 세그먼트를 공기로 붑니다.','+M-Y3'],[0,'캡슐 닫기','뚜껑을 다시 덮습니다.','MCH1'],[45,'양품 배출','완성된 캡슐을 공기로 내보냅니다.','+M-Y2'],[90,'세그먼트 청소','빈 세그먼트를 공기로 청소합니다.','+M-Y4']].map(([angle,name,text,device],index)=>({index,angle,name,text,device,pos:[LAYOUT.dial.centre[0]+LAYOUT.dial.radius*Math.cos(angle*Math.PI/180),LAYOUT.dial.centre[1],LAYOUT.dial.centre[2]-LAYOUT.dial.radius*Math.sin(angle*Math.PI/180)]}));

const r3=v=>Math.round(v*1000)/1000;
const firstRects=n=>Object.fromEntries([...drawingData.sheets.find(s=>s.number===n).regions].reverse().map(r=>[r.device,r.rect]));
const sheet24=firstRects('24'),sheet23=firstRects('23'),E=sheet24['+MC-ENCLOSURE'];
const DEPTH={disconnect:.12,breaker:.09,fuse:.08,contactor:.12,relay:.08,safety:.12,drive:.18,level:.1,supply:.13,transformer:.2,plc:.14,rack:.03,rail:.012};
function inCabinet(id,kind){
 const r=sheet24[id],c=LAYOUT.cabinet,d=DEPTH[kind]??.08;
 return {pos:[c.centre[0]+((r[0]+r[2]/2)-(E[0]+E[2]/2))/E[2]*c.size[0],c.centre[1]+((E[1]+E[3]/2)-(r[1]+r[3]/2))/E[3]*c.size[1],c.plate+d/2],size:[r[2]/E[2]*c.size[0],r[3]/E[3]*c.size[1],d]};
}
// Sheet 23 is drawn at 0.334 mm per pixel of the 3200 x 2477 image.
function onPanel(id){
 const r=sheet23[id],o=LAYOUT.operator,scale=.000334;
 return {pos:[o.centre[0]+((r[0]+r[2]/2)-.441)*3200*scale,o.centre[1]+(.325-(r[1]+r[3]/2))*2477*scale,o.face],size:[r[2]*3200*scale,r[3]*2477*scale,.04]};
}

const rows=[];
const add=(id,name,kind,place,term,description,extra={})=>rows.push({id,name,kind,pos:place.pos.map(r3),size:place.size.map(r3),term,description,quantity:1,unit:'개',...extra});
const at=(pos,size)=>({pos,size});
const mc=(tag,name,kind,term,description,extra)=>add('+MC-'+tag,name,kind,inCabinet('+MC-'+tag,kind),term,description,extra);
const local=(x,y,size)=>at([LAYOUT.cabinet.centre[0]+x,LAYOUT.cabinet.centre[1]+y,LAYOUT.cabinet.plate+size[2]/2],size);

add('MCH1','캡슐 충전·선별기 본체','machine',at([.2,.95,0],[2.2,1.9,1.4]),'filler','세그먼트 여덟 개가 한 칸씩 돌면서 캡슐을 받고, 채우고, 검사하고, 내보냅니다. 외형과 순서는 수업 모형입니다.',{zone:'M',material:'강재 프레임 · 투명 보호 덮개',model:true});
add('OS1','조작반','operator',at([1.95,1.05,.6],[.9,1.6,.3]),'station','시작·정지·비상정지·조그 버튼과 경광등이 모인 조작대입니다. 버튼 자리는 원본 23번 도면대로입니다.',{zone:'OS',material:'도장 강판',model:true});

add('+MC-ENCLOSURE','주 제어반','cabinet',at(LAYOUT.cabinet.centre,LAYOUT.cabinet.size),'cabinet','차단기·릴레이·PLC·인버터가 들어 있는 함입니다. 안쪽 배치는 원본 24번 도면대로입니다.',{material:'도장 강판'});
mc('T1','제어 변압기','transformer','transformer','460 V를 110 V로 낮춰 제어 전원을 만듭니다. 1차는 퓨즈 F1, 2차는 퓨즈 F2가 지킵니다.');
mc('Q1','주 차단 스위치 1','disconnect','disconnect','설비 전체의 전원을 끊고 잇는 첫 스위치입니다.');
mc('Q2','주 차단 스위치 2','disconnect','disconnect','Q1 다음에 놓인 두 번째 스위치입니다. 둘 다 닫혀야 460 V 모선이 살아납니다.');
mc('Q6','주 구동 수동 개폐기','disconnect','overload','주 구동 인버터 U1 앞의 개폐기입니다. 보조접점 13-14가 PLC 입력 I:13/00 직렬 고리의 첫째입니다.');
mc('Q7','브레이크 수동 개폐기','disconnect','brake','브레이크 전원의 개폐기입니다. 보조접점이 인버터 운전 허가와 I:13/00에 함께 쓰입니다.');
mc('Q8','분말 구동 수동 개폐기','disconnect','overload','분말 구동 인버터 U2 앞의 개폐기입니다. 보조접점이 I:13/00 직렬 고리의 마지막입니다.');
mc('Q9','진공 펌프 수동 개폐기','disconnect','overload','진공 펌프 모터 앞의 개폐기입니다. 닫힘 접점 21-22가 I:13/02로 가서, 꺼지면 입력이 켜집니다.');
mc('F1','변압기 1차 퓨즈','fuse','fuse','제어 변압기 1차 쪽 460 V 두 선을 지킵니다.');
mc('F2','변압기 2차 퓨즈','fuse','fuse','제어 변압기 2차 쪽 110 V를 지킵니다.');
mc('G1','직류 전원 장치','supply','supply','110 V를 받아 24 V 직류를 만듭니다. PLC 카드와 릴레이, 안전 계전기가 이 전원으로 움직입니다.');
mc('Q3','직류 전원 차단기','breaker','breaker','직류 전원 장치 G1로 들어가는 110 V를 지킵니다.');
mc('Q4','출력 전원 차단기 (+24 VRE)','breaker','breaker','K3·K4 접점을 지나 출력 카드 1로 가는 +24 VRE의 시작입니다.');
mc('Q5','제어 전원 차단기 (+24 VDC)','breaker','breaker','입력 카드, 출력 카드 2, 안전·제어 회로로 가는 +24 VDC를 지킵니다.');
mc('Q10','함 팬 차단기','breaker','breaker','환기 팬으로 가는 110 V를 지킵니다.');
mc('Q11','콘센트 차단기','breaker','breaker','보수용 콘센트로 가는 110 V를 지킵니다.');
mc('Q12','분말 레벨 계전기 차단기','breaker','breaker','분말 레벨 계전기 U3으로 가는 110 V를 지킵니다.');
mc('Q13','통신 전원 차단기','breaker','breaker','통신 장치로 가는 110 V를 지킵니다.');
mc('Q14','PLC 전원 차단기','breaker','breaker','PLC 전원부로 가는 110 V를 지킵니다. 열리면 PLC 전체가 꺼집니다.');
mc('Q15','안전 계전기 차단기','breaker','breaker','안전 계전기 U4와 U5의 A1 단자로 가는 +24 VDC를 지킵니다.');
mc('K1','주 구동 조그 릴레이','relay','relay','PLC 출력 O:11/09가 붙입니다. 접점 13-14와 33-34가 인버터 U1의 운전 허가 단자로 갑니다. 주 구동 모터를 실제로 돌리는 릴레이입니다.',{output:'O:11/09'});
mc('K2','브레이크 릴레이','relay','brake','PLC 출력 O:12/09가 붙입니다. 접점 3-4가 브레이크 전원을 잇습니다.',{output:'O:12/09'});
mc('K3','안전 출력 릴레이 1','relay','safety-relay','안전 계전기 U4의 13-14가 붙입니다. 접점 13-14·33-34는 +24 VRE를 만들고, 21-22는 U4로 되돌아가 붙어 버린 접점을 찾아냅니다.');
mc('K4','안전 출력 릴레이 2','relay','safety-relay','안전 계전기 U4의 23-24가 붙입니다. K3과 접점을 직렬로 겹쳐 하나가 고장 나도 +24 VRE가 끊깁니다.');
mc('K5','아래 문 닫힘 릴레이','relay','limit','아래 문 리밋 스위치 네 개가 모두 닫혀야 붙습니다. 접점 5-9가 I:13/11로 갑니다.');
mc('K6','조그 모드 릴레이 1','relay','jog','조그 모드 버튼 S12가 붙입니다. 접점이 I:13/03, 시작 입력 옆길, 비상정지 회로 옆길에 쓰입니다.');
mc('K7','조그 모드 릴레이 2 (플러그 X1 연결)','relay','jog','원격 조작 플러그 X1이 꽂혀 있으면 붙습니다. K6과 함께 붙어야 위 문이 열린 채 조그할 수 있습니다.');
mc('K8','원격 조그 릴레이','relay','jog','원격 조그 버튼 S13이 붙입니다. 접점 5-9가 K6·K7 접점과 직렬로 시작 입력 I:13/08에 들어갑니다.');
mc('K9','진공 밸브 릴레이','relay','relay','선택 스위치 S14가 붙입니다. 원본에는 코일만 있고 접점이 쓰인 곳은 그려져 있지 않습니다.');
mc('K10','주 구동 안전 접촉기','contactor','contactor','U4의 늦게 열리는 접점 57-58이 붙입니다. 인버터 U1 앞에서 460 V를 끊습니다.');
mc('K11','주 구동 릴레이','relay','relay','PLC 출력 O:11/00이 붙입니다. 원본에서 접점 5-9는 초록 경광등 H4로만 갑니다.',{output:'O:11/00'});
mc('K12','분말 공급 릴레이','relay','relay','PLC 출력 O:11/02가 붙입니다. 접점 5-9가 인버터 U2의 운전 허가(단자 20-28)를 잇습니다.',{output:'O:11/02'});
mc('K13','출력 릴레이 K13','relay','relay','PLC 출력 O:11/03에 달린 릴레이입니다. 원본에 이름과 접점이 쓰인 곳이 없습니다.',{output:'O:11/03'});
mc('K14','진공 펌프 접촉기','contactor','contactor','PLC 출력 O:11/04가 붙입니다. 진공 펌프 모터 M3에 460 V를 넣습니다.',{output:'O:11/04'});
mc('K15','분말 구동 안전 접촉기','contactor','contactor','U4의 늦게 열리는 접점 67-68이 붙입니다. 인버터 U2 앞에서 460 V를 끊습니다.');
mc('RACK1','PLC 랙','rack','plc','PLC 전원부와 카드 일곱 장을 꽂는 틀입니다.');
mc('PLC1','PLC 전원부','plc','plc','110 V를 받아 랙의 카드에 전원을 줍니다.');
mc('PLC2','PLC 중앙 처리 장치','plc','plc','슬롯 0의 SLC 5/03입니다. 입력을 읽고 프로그램대로 출력을 냅니다. 원본에 프로그램은 없습니다.');
mc('PLC3','출력 카드 1 (슬롯 1)','plc','output','주소 O:11/00–15의 접점 출력 16점입니다. +24 VRE로 코일을 붙이므로 비상정지 때 한꺼번에 꺼집니다.');
mc('PLC4','출력 카드 2 (슬롯 2)','plc','output','주소 O:12/00–15의 접점 출력 16점입니다. +24 VDC로 밸브·경광등·브레이크 릴레이를 움직입니다.');
mc('PLC5','입력 카드 3 (슬롯 3)','plc','input','주소 I:13/00–15의 입력 16점입니다. 스위치·릴레이 접점·안전 계전기 신호를 읽습니다.');
mc('PLC6','입력 카드 4 (슬롯 4)','plc','input','주소 I:14/00–15의 입력 16점입니다. 캡슐 광전 스위치 16개가 하나씩 들어옵니다.');
mc('PLC7','아날로그 출력 카드 (슬롯 5)','plc','analog','4–20 mA로 주 구동과 분말 구동의 속도를 지시합니다.');
mc('PLC8','아날로그 입력 카드 (슬롯 6)','plc','analog','인버터가 알려 주는 실제 속도를 4–20 mA로 읽습니다.');
mc('U1','주 구동 인버터','drive','drive','주 구동 모터 M1의 속도를 바꿉니다. 단자 28과 E1에 K1 접점이 들어와야 돕니다.');
mc('U2','분말 구동 인버터','drive','drive','분말 공급 모터 M2의 속도를 바꿉니다. 단자 20-28을 K12 접점이 이어야 돕니다. 원본 14번 도면에는 -05U1로 적혀 있습니다.');
mc('U3','분말 레벨 계전기','level','level','분말 호퍼의 감지기 신호를 받아 단자 4로 I:13/15에 알립니다.');
mc('U4','비상정지 안전 계전기','safety','safety-relay','비상정지 버튼 두 개를 두 채널로 감시합니다. 13-14·23-24는 K3·K4를, 늦게 열리는 57-58·67-68은 K10·K15를 붙입니다. 원본 22번 도면에는 -20RE0으로 적혀 있습니다.');
mc('U5','문 안전 계전기','safety','safety-relay','위 문 스위치 일곱 개를 두 채널로 감시합니다. 접점 13-14·23-24가 U4의 비상정지 고리에 들어갑니다. 원본 20번 도면에는 -21REO로 적혀 있습니다.');
mc('DR3','설치 레일 DR3','rail','cabinet','차단기와 퓨즈가 걸리는 레일입니다.');
mc('DR4','설치 레일 DR4','rail','cabinet','수동 개폐기가 걸리는 레일입니다.');
mc('DR5','설치 레일 DR5','rail','cabinet','릴레이가 걸리는 레일입니다.');
add('+MC-DR2','단자 레일 DR2','rail',local(0,-.88,[1,.035,.012]),'terminal','단자대가 걸리는 레일입니다. 원본 25번 도면에 있고 제어반 안 자리는 수업 모형입니다.');
add('+MC-X4','단자대 X4 (전원 인입·현장)','terminal',local(-.35,-.88,[.2,.06,.06]),'terminal','R·S·T·PE 전원이 들어오고 아래 문 리밋 스위치와 경광등 선이 나가는 단자대입니다.');
add('+MC-X1','원격 조작 플러그 X1','plug',local(-.05,-.88,[.16,.06,.06]),'jog','원격 조작기를 꽂는 자리입니다. 꽂혀 있어야 K7이 붙고 S13·S14가 일합니다. 같은 이름의 단자 201–204는 변압기 선에 쓰입니다.');
add('+MC-X3','단자대 X3 (제어)','terminal',local(.3,-.88,[.36,.06,.06]),'terminal','모터 출력선, PLC 입력선, 안전 회로 선이 드나드는 단자대입니다. 접지 단자도 여기에 있습니다.');
['탬핑 스테이션','공기 압력','세그먼트 위치 (작은 캠)','캡슐 호퍼 부족','진공 밸브 게이트 (큰 캠)','진공 레벨','예비','예비'].forEach((what,i)=>add('+MC-SQ'+(i+1),`감지기 연결구 ${i+1} · ${what}`,'port',at([-2.03,1.75-i*.14,-1.7],[.04,.08,.08]),'input',i<6?`기계 쪽 ${what} 감지기가 꽂히는 연결구입니다. 신호는 I:13/${['04','05','06','07','13','14'][i]}로 갑니다.`:'쓰지 않는 예비 연결구입니다.',i<6?{input:'I:13/'+['04','05','06','07','13','14'][i]}:{}));
add('+MC-RECPT1','보수용 콘센트','outlet',at([-2.03,.6,-1.6],[.04,.1,.07]),'breaker','점검 기기를 꽂는 110 V 콘센트입니다. 차단기 Q11이 지킵니다.');

add('+M-M1','주 구동 모터','motor',at([-.35,.42,.1],[.32,.2,.2]),'motor','세그먼트 원판을 한 칸씩 돌리는 0.33 HP 모터입니다. 인버터 U1이 돌립니다.');
add('+M-DV2','브레이크','brake',at([-.56,.42,.1],[.1,.16,.16]),'brake','주 구동 축을 잡는 브레이크입니다. 릴레이 K2가 붙으면 전원이 들어갑니다.');
add('+M-F1','주 구동 과부하 보호기','overload',at([-.35,.55,.1],[.1,.06,.1]),'overload','모터 M1 곁에서 과열을 알리는 보호기입니다. 신호선이 인버터 U1로 갑니다.');
add('+M-M2','분말 공급 모터','motor',at([-.125,1.78,.325],[.14,.16,.14]),'motor','분말을 내려보내는 0.33 HP 모터입니다. 인버터 U2가 돌립니다.');
add('+M-M3','진공 펌프 모터','motor',at([1,.3,-.3],[.4,.3,.3]),'motor','캡슐을 나누는 진공을 만드는 1 HP 모터입니다. 접촉기 K14가 직접 넣습니다.');
add('+M-S1','함 환기 팬','fan',at([.9,.6,-.71],[.16,.16,.05]),'cabinet','전기함을 식히는 팬입니다. 110 V를 차단기 Q10으로 받습니다.');
add('+M-X2','기계 단자대 X2','terminal',at([-.6,.55,-.74],[.3,.3,.12]),'terminal','기계 쪽 연결함입니다. 브레이크, 진공 펌프, 입력 신호 선이 여기서 제어반으로 갑니다.');
['캡슐 호퍼 공기 밸브','배출 공기 밸브','불량 배출 공기 밸브','세그먼트 청소 밸브','예비 밸브','예비 밸브','예비 밸브','예비 밸브'].forEach((name,i)=>add('+M-Y'+(i+1),name+(i>3?' '+(i+1):''),'valve',at([-.5+i*.1,.62,.72],[.06,.09,.05]),'valve',i<4?`PLC 출력 O:12/0${i}이 켜면 공기를 보냅니다. ${['호퍼에서 캡슐을 내려보냅니다.','완성된 캡슐을 내보냅니다.','빈 자리가 있던 세그먼트를 불어 냅니다.','빈 세그먼트를 청소합니다.'][i]}`:`PLC 출력 O:12/0${i}에 달려 있지만 원본에 UNUSED로 적힌 밸브입니다.`,{output:'O:12/0'+i}));
['앞 왼쪽','앞 오른쪽','뒤 왼쪽','뒤 오른쪽'].forEach((where,i)=>add('+M-S'+(i+2),`아래 문 리밋 스위치 (${where})`,'limit',at([i%2?.9:-.5,.82,i<2?.71:-.71],[.06,.04,.04]),'limit','아래 문이 닫히면 눌립니다. 네 개가 직렬로 이어져 릴레이 K5를 붙입니다.'));
for(let n=1;n<=16;n++){const row=(n>4&&n<9)||n>12?1:0,col=(n-1)%4+(n>8?4:0);add('+M-B'+n,`캡슐 ${n}번 광전 스위치`,'sensor',at([.2+(col-3.5)*.034,1.12,.46+(row?.02:-.02)],[.012,.05,.012]),'photo',`검사 자리에서 ${n}번 칸에 캡슐이 있는지 봅니다. 신호는 I:14/${String(n-1).padStart(2,'0')}으로 갑니다.`,{input:'I:14/'+String(n-1).padStart(2,'0')});}

const os=(tag,name,kind,term,description,extra)=>add('+OS-'+tag,name,kind,onPanel('+OS-'+tag),term,description,extra);
os('S1','시작 버튼','button','input','누르는 동안 I:13/08이 켜집니다.',{input:'I:13/08'});
os('S2','정지 버튼','button','input','평소 닫혀 있다가 누르면 열려 I:13/09가 꺼집니다.',{input:'I:13/09'});
os('S3','비상정지 버튼 1','estop','estop','접점 1-2와 3-4가 두 채널로 안전 계전기 U4에 들어갑니다.');
os('S4','비상정지 버튼 2','estop','estop','S3과 직렬입니다. 어느 하나만 눌러도 U4가 떨어집니다.');
for(let n=5;n<=11;n++)os('S'+n,`위 문 스위치 ${n-4}`,'guard','guard','접점 11-12와 21-22가 다른 문 스위치와 직렬 두 줄로 안전 계전기 U5에 들어갑니다. 원본은 조작반 배치도에 그렸고, 3D에서는 위 덮개 문이 함께 열립니다.');
os('S12','조그 모드 버튼','button','jog','접점 3-4가 릴레이 K6을 붙입니다.');
os('S13','원격 조그 버튼','button','jog','접점 3-4가 릴레이 K8을 붙입니다. 플러그 X1이 꽂혀 있어야 전원이 옵니다.');
os('S14','진공 밸브 선택 스위치','selector','contact','접점 9-10이 릴레이 K9를 붙입니다. 플러그 X1이 꽂혀 있어야 전원이 옵니다.');
add('+OS-H2','빨간 경광등 (비상)','lamp',at([2.25,1.88,.55],[.07,.08,.07]),'stack','PLC 출력 O:12/10이 켭니다.',{output:'O:12/10'});
add('+OS-H3','노란 경광등 (경보)','lamp',at([2.25,1.8,.55],[.07,.08,.07]),'stack','PLC 출력 O:12/11이 켭니다.',{output:'O:12/11'});
add('+OS-H4','초록 경광등','lamp',at([2.25,1.72,.55],[.07,.08,.07]),'stack','릴레이 K11의 접점 5-9가 직접 켭니다. PLC 출력을 거치지 않는 유일한 등입니다.');
add('+OS-H1','경보 혼','horn',at([1.7,1.62,.55],[.09,.09,.1]),'stack','PLC 출력 O:12/08이 울립니다.',{output:'O:12/08'});
add('-S1','분말 레벨 감지기','sensor',at([-.05,1.55,.325],[.03,.3,.03]),'level','분말 호퍼 속 높이를 재는 탐침입니다. 계전기 U3에 이어집니다.',{input:'I:13/15'});

// Parts without a place of their own in the layout sheets sit with a host and are not drawn separately.
const part=(id,name,kind,host,term,description,extra={})=>{const h=rows.find(r=>r.id===host);rows.push({id,name,kind,pos:h.pos,size:[.02,.02,.02],term,description,quantity:1,unit:'개',mesh:false,host,...extra});};
part('+MC-DR1','단자 레일 DR1','rail','+MC-DR2','terminal','원본 25번 도면의 단자 레일입니다.');
part('+MC-R2','제동 저항','resistor','+MC-U1','drive','모터가 빨리 설 때 생기는 전기를 열로 바꿉니다. 인버터 U1에 달립니다.');
part('+MC-W5','주 구동 모터 케이블','cable','+MC-U1','cable','인버터 U1에서 모터 M1로 가는 케이블입니다.');
part('+MC-W6','분말 구동 모터 케이블','cable','+MC-U2','cable','인버터 U2에서 모터 M2로 가는 케이블입니다.');
part('+MC-W1','비상정지 케이블 W1','cable','+MC-X3','cable','조작반 단자대 X2와 제어반 단자대 X3을 잇는 1.0 mm² 케이블입니다.');
part('+MC-W2','비상정지 케이블 W2','cable','+MC-X3','cable','비상정지 고리가 되돌아오는 1.0 mm² 케이블입니다.');
part('+MC-W3','문 스위치 케이블 W3','cable','+MC-X3','cable','위 문 스위치 두 줄의 위쪽 끝을 U5로 잇는 1.0 mm² 케이블입니다.');
part('+MC-W4','문 스위치 케이블 W4','cable','+MC-X3','cable','위 문 스위치 두 줄의 아래쪽 끝을 U5로 잇는 1.0 mm² 케이블입니다.');
part('+MC-CBL2','주 구동 속도 지시 케이블','cable','+MC-PLC7','cable','아날로그 출력 IOUT0을 인버터 U1로 보내는 케이블입니다.');
part('+MC-CBL3','분말 구동 속도 지시 케이블','cable','+MC-PLC7','cable','아날로그 출력 IOUT1을 인버터 U2로 보내는 케이블입니다.');
part('+MC-CBL4','주 구동 속도 되읽기 케이블','cable','+MC-PLC8','cable','인버터 U1의 속도 신호를 아날로그 입력 IN0으로 가져오는 케이블입니다.');
part('+MC-CBL5','분말 구동 속도 되읽기 케이블','cable','+MC-PLC8','cable','인버터 U2의 속도 신호를 아날로그 입력 IN1로 가져오는 케이블입니다.');
part('+OS-X2','조작반 단자대 X2','terminal','OS1','terminal','조작반 안에서 비상정지와 문 스위치 선을 모아 케이블로 내보내는 단자대입니다.');
part('-C1','용량 조정 콘덴서','capacitor','+MC-U3','level','분말 레벨 계전기의 감도를 맞추는 25 pF 콘덴서입니다.');
part('-D1','통신 장치 1','device','+MC-PLC2','plc','원본 8번 통신 도면의 장치입니다. 이름과 쓰임은 원본에 적혀 있지 않습니다.');
part('-D2','통신 장치 2','device','+MC-PLC2','plc','원본 8번 통신 도면의 장치입니다. 케이블 CBL1로 통신 장치 1과 이어집니다.');
part('-CBL1','통신 케이블','cable','+MC-PLC2','cable','통신 장치 둘을 잇는 케이블입니다.');
part('-22KA3','조그 릴레이 접점 (옛 표기 -22KA3)','relay','+MC-K7','xref','원본 20번 도면에만 나오는 옛 번호입니다. 22번 도면 세 번째 릴레이인 K7의 접점으로 추정합니다.',{inferred:true});
const diodeHost={'+MC-D3':'+MC-K1','+MC-D12':'+MC-K2','+MC-D13':'+MC-K3','+MC-D14':'+MC-K4','+MC-D15':'+MC-K5','+MC-D16':'+MC-K6','+MC-D17':'+MC-K7','+MC-D18':'+MC-K9','+MC-D19':'+MC-K10','+MC-D20':'+MC-K15','+MC-D21':'+MC-K8','+MC-D22':'+MC-K11','+MC-D23':'+MC-K12','+MC-D24':'+MC-K13','+MC-D25':'+MC-K14'};
for(const [id,host] of Object.entries(diodeHost))part(id,'역기전력 다이오드 '+id.slice(4),'diode',host,'diode','코일과 나란히 놓여 코일이 꺼질 때 생기는 높은 전압을 흘려보냅니다.');
for(let n=4;n<=11;n++)part('+M-D'+n,'역기전력 다이오드 D'+n,'diode','+M-Y'+(n-3),'diode','밸브 코일과 나란히 놓여 코일이 꺼질 때 생기는 높은 전압을 흘려보냅니다.');

const zoneOf=id=>id.startsWith('+MC')?'MC':id.startsWith('+M-')?'M':id.startsWith('+OS')?'OS':'';
export const devices=rows.map(d=>{
 const source=drawingData.devices[d.id],zone=d.zone??(zoneOf(d.id)||zoneOf(d.host??'')||'MC');
 return {...d,zone,sheets:source?[...new Set(source.sheets.map(studyOf))]:d.id==='MCH1'?['A-901']:['P-902','A-901'],originals:source?.sheets??[]};
});
export const byId=new Map(devices.map(d=>[d.id,d]));
export const missingFromModel=Object.keys(drawingData.devices).filter(id=>!byId.has(id));

export function deviceSpecification(d){
 if(d.spec||d.material)return d.spec??d.material;
 const s=drawingData.devices[d.id],text=s?[s.mfg,s.cat,s.rating].filter(Boolean).join(' · '):'';
 return text?text+' (원본 부품표)':'원본에 정격 표기 없음';
}

export const sheets=STUDY.map(([id,name,originals])=>({id,name,source:originals.length>2?originals[0]+'–'+originals.at(-1):originals.join(' · '),originals,ids:devices.filter(d=>d.sheets.includes(id)||(id==='A-901'&&['+MC-ENCLOSURE','OS1'].includes(d.id))).map(d=>d.id)}));

const io=(address,device,name,english)=>[address,{device,name,english}];
const two=n=>String(n).padStart(2,'0');
export const ioNames=Object.fromEntries([
 io('O:11/00','+MC-K11','주 구동 릴레이 K11','MAIN DRIVE'),io('O:11/02','+MC-K12','분말 공급 릴레이 K12','POWER FEEDER'),io('O:11/03','+MC-K13','릴레이 K13',''),io('O:11/04','+MC-K14','진공 펌프 접촉기 K14','VACUUM PUMP'),io('O:11/09','+MC-K1','주 구동 조그 릴레이 K1','JOG MAIN DRIVE'),
 ...['캡슐 호퍼 공기 밸브 Y1','배출 공기 밸브 Y2','불량 배출 공기 밸브 Y3','세그먼트 청소 밸브 Y4','예비 밸브 Y5','예비 밸브 Y6','예비 밸브 Y7','예비 밸브 Y8'].map((name,i)=>io('O:12/0'+i,'+M-Y'+(i+1),name,['SV CAPSULE HOPPER AIR VALVE','DISCHARGE AIR VALVE','FAULT AIR VALVE','SEGMENT CLEANING VALVE','UNUSED','UNUSED','UNUSED','UNUSED'][i])),
 io('O:12/08','+OS-H1','경보 혼 H1','ALARM HORN'),io('O:12/09','+MC-K2','브레이크 릴레이 K2','ENGAGE BRAKE'),io('O:12/10','+OS-H2','빨간 경광등 H2','RED STACKLIGHT (EMERGENCY)'),io('O:12/11','+OS-H3','노란 경광등 H3','YELLOW STACKLIGHT (ALARM)'),
 io('I:13/00','+MC-Q6','수동 개폐기 닫힘 (Q6·Q7·Q8 직렬)','MANUAL STARTER OVERLOAD (MO1)'),io('I:13/01','+MC-U1','인버터 준비 (U1·U2 직렬)','DRIVES READY'),io('I:13/02','+MC-Q9','진공 펌프 과부하','VACUUM PUMP OVERLOAD'),io('I:13/03','+MC-K6','운전/조그 (K6 또는 K7)','RUN/ JOG SWITCH'),io('I:13/04','+MC-SQ1','탬핑 스테이션','TAMPING STATION 16ME'),io('I:13/05','+MC-SQ2','공기 압력 정상','AIR PRESSURE OK'),io('I:13/06','+MC-SQ3','세그먼트 제자리 (작은 캠)','SEGMENT IN POSITION (SMALL CAM)'),io('I:13/07','+MC-SQ4','캡슐 호퍼 부족','CAPSULE HOPPER LOW'),
 io('I:13/08','+OS-S1','시작 버튼','START BUTTON'),io('I:13/09','+OS-S2','정지 버튼','STOP BUTTON'),io('I:13/10','+MC-U5','위 문 닫힘','TOP GATES CLOSED'),io('I:13/11','+MC-K5','아래 문 닫힘','BOTTOM GATES CLOSED'),io('I:13/12','+MC-U4','비상정지 정상','EMERGENCY STOP OK'),io('I:13/13','+MC-SQ5','진공 밸브 게이트 (큰 캠)','VACUUM VALVE GATE (BIG CAM)'),io('I:13/14','+MC-SQ6','진공 정상','VACUUM LEVEL OK'),io('I:13/15','+MC-U3','분말 레벨 정상','POWDER LEVEL OK'),
 ...Array.from({length:16},(_,i)=>io('I:14/'+two(i),'+M-B'+(i+1),`캡슐 ${i+1}번 광전 스위치`,`CAPSULE #${i+1} PHOTO SWITCH`)),
 io('IOUT0','+MC-U1','주 구동 속도 지시','MAIN DRIVE SPEED (4-20MA)'),io('IOUT1','+MC-U2','분말 구동 속도 지시','POWDER MOTOR SPEED (4-20MA)'),io('IN0','+MC-U1','주 구동 실제 속도','MAIN DRIVE INDICATED SPEED (4-20MA)'),io('IN1','+MC-U2','분말 구동 실제 속도','POWDER MOTOR INDICATED SPEED (4-20MA)')
]);
export const ioName=address=>ioNames[address]??{device:'',name:'예비',english:''};

// Routes are class-model paths between drawn devices: out of the cabinet, along a floor duct, up to the field device.
const p=id=>byId.get(id).pos,W=LAYOUT.cabinet.wiring,D=LAYOUT.duct;
const field=(a,b)=>{const from=p(a),to=p(b);return [[from[0],from[1],W],[from[0],.2,W],[from[0],D.y,D.z],[to[0],D.y,D.z],[to[0],D.y,to[2]],to].map(v=>v.map(r3));};
const inside=(a,b,x=-3.08)=>{const from=p(a),to=p(b);return [[from[0],from[1],W],[x,from[1],W],[x,to[1],W],[to[0],to[1],W]].map(v=>v.map(r3));};
const route=(id,name,from,to,role,conductors,section,sheet,points)=>({id,name,from,to,role,conductors,section,sheet,points});
const unmarked='원본에 굵기 표기 없음';
export const wires=[
 route('R01','주 전원 인입','+MC-X4','+MC-Q1','power',4,unmarked,'E-901',inside('+MC-X4','+MC-Q1')),
 route('R02','주 구동 동력 (접촉기 → 인버터)','+MC-K10','+MC-U1','power',3,unmarked,'E-902',inside('+MC-K10','+MC-U1',-2.12)),
 route('R03','주 구동 모터선','+MC-U1','+M-M1','power',3,unmarked,'E-902',field('+MC-U1','+M-M1')),
 route('R04','분말 구동 모터선','+MC-U2','+M-M2','power',3,unmarked,'E-902',field('+MC-U2','+M-M2')),
 route('R05','진공 펌프 모터선','+MC-K14','+M-M3','power',3,unmarked,'E-902',field('+MC-K14','+M-M3')),
 route('R06','밸브 출력선','+MC-PLC4','+M-Y1','control',0,unmarked,'E-903',field('+MC-PLC4','+M-Y1')),
 route('R07','광전 스위치 입력선','+M-B1','+MC-PLC6','signal',0,unmarked,'E-904',field('+MC-PLC6','+M-B1').reverse()),
 route('R08','비상정지 두 채널 (케이블 W1·W2)','+OS-S3','+MC-U4','control',4,'1.0 mm² (원본 표기)','E-905',field('+MC-U4','+OS-S3').reverse()),
 route('R09','위 문 스위치 두 채널 (케이블 W3·W4)','+OS-S5','+MC-U5','control',4,'1.0 mm² (원본 표기)','E-905',field('+MC-U5','+OS-S5').reverse()),
 route('R10','아래 문 리밋 스위치 직렬 고리','+M-S2','+MC-K5','control',2,unmarked,'E-905',field('+MC-K5','+M-S2').reverse()),
 route('R11','시작·정지 입력선','+OS-S1','+MC-PLC5','signal',0,unmarked,'E-904',field('+MC-PLC5','+OS-S1').reverse()),
 route('R12','경광등·경보 출력선','+MC-PLC4','+OS-H2','control',0,unmarked,'E-903',field('+MC-PLC4','+OS-H2')),
 route('R13','주 구동 운전 허가','+MC-K1','+MC-U1','control',2,unmarked,'E-902',inside('+MC-K1','+MC-U1')),
 route('R14','안전 출력 (U4 → K10)','+MC-U4','+MC-K10','control',2,unmarked,'E-905',inside('+MC-U4','+MC-K10',-2.12))
];
export function routeLength(w){return w.points.slice(1).reduce((n,point,i)=>n+Math.hypot(...point.map((v,j)=>v-w.points[i][j])),0);}

export function quantities(){
 return [...devices.map(d=>({id:d.id,name:d.name,spec:deviceSpecification(d),quantity:d.quantity,unit:d.unit,sheet:d.sheets[0],target:d.id,note:d.model?'수업 모형의 외형입니다. 원본 부품표에는 없습니다.':d.kind==='cabinet'?'외함의 수량입니다. 안의 장치는 따로 셉니다.':d.mesh===false?'원본 부품표의 품목입니다. 3D에는 따로 그리지 않습니다.':'같은 기기의 도면 기호와 3D는 한 번만 셉니다.'})),
 ...wires.map(w=>({id:w.id,name:w.name,spec:(w.conductors?w.conductors+'가닥 · ':'')+w.section,quantity:routeLength(w),unit:'m',sheet:w.sheet,target:w.from,note:'3D 중심 경로 길이의 수업 모형입니다.'+(w.conductors?' 도체 길이 합계 '+(routeLength(w)*w.conductors).toFixed(2)+' m.':'')+' 단자 여유·가공 여유 제외.'}))];
}

export const safetyItems=[
 {id:'stop',name:'운전 중 비상정지를 눌러 봤나요?',text:'U4가 떨어지면 K3·K4가 +24 VRE를 끊어 출력 카드 1의 코일이 한꺼번에 꺼집니다.',target:'+OS-S3',evidence:'emergency'},
 {id:'delay',name:'K10이 늦게 떨어지는 것을 봤나요?',text:'U4의 57-58 접점은 시간을 두고 열립니다. 정지 명령이 먼저, 동력 차단이 나중입니다.',target:'+MC-K10',evidence:'delayed'},
 {id:'guard',name:'운전 중 위 문을 열어 봤나요?',text:'문 스위치 일곱 개가 직렬 두 줄로 U5에 들어갑니다. 하나만 열려도 U5가 떨어집니다.',target:'+OS-S5',evidence:'guardOpen'},
 {id:'jog',name:'문을 연 채 조그로 움직여 봤나요?',text:'조그 모드 K6과 플러그 X1의 K7이 함께 붙어야 U5 대신 U4를 살립니다.',target:'+MC-K7',evidence:'jogBypass'},
 {id:'overload',name:'수동 개폐기가 떨어지면 무엇이 멈추나요?',text:'Q6 보조접점이 열려 I:13/00이 꺼지고 PLC가 운전을 내립니다.',target:'+MC-Q6',evidence:'tripped'},
 {id:'reject',name:'빈 자리가 있는 세그먼트가 배출되는 것을 봤나요?',text:'광전 스위치 16개가 입력 카드 4로 들어가고 Y3이 불량 배출 공기를 붑니다.',target:'+M-Y3',evidence:'rejected'},
 {id:'ground',name:'보호접지 단자를 찾았나요?',text:'안전 계전기 U4와 U5의 PE는 단자대 X3의 접지 단자로 갑니다.',target:'+MC-X3'}
];
export const lessons=[
 ['building','설비와 친해지기','캡슐이 세그먼트를 타고 여덟 자리를 도는 순서와 제어반·조작반의 자리를 봅니다.'],
 ['electrical','전원에서 코일까지 따라가기','460 V, 110 V, +24 VDC, +24 VRE 네 전원이 어디서 갈라지는지 원본에서 읽습니다.'],
 ['signals','PLC 입력과 출력 읽기','주소 I:13, I:14, O:11, O:12가 어느 기기와 이어지는지 확인합니다.'],
 ['safety','멈춘 이유 찾기','비상정지, 문 열림, 과부하가 서로 다른 길로 설비를 세우는 것을 비교합니다.'],
 ['calculations','계산과 수량 연결하기','모터 전류, 변압기와 직류 전원 용량, 4–20 mA 신호를 계산합니다.'],
 ['experience','설비 옆에 서 보기','제어반을 열고 조작반 앞에 서서 도면의 기기를 공간에서 찾습니다.']
];
