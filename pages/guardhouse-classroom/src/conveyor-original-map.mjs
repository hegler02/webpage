// Rectangles use the source DWG frame (x right, y up, 420 × 290).
// A region identifies one visible occurrence, not a new physical device.
const region=(key,device,rect,label,description,term,anchor,camera)=>({key,device,rect,label,description,term,anchor,camera});
export const originalRegions={
 '01':[
  region('overview-cabinet','CAB1',[11,249,86,25],'주 제어반','MAIN CONTROL PANEL은 차단기·접촉기·PLC 등이 들어 있는 제어반입니다. 3D에서 문을 열고 내부 기기를 살펴보세요.','cabinet','CONTROL PANEL'),
  region('overview-operator','OP1',[144,207,51,25],'운전 조작반','OPERATOR STATION은 사람이 스위치와 표시등으로 설비를 조작하는 곳입니다.','operator','OPERATOR STATION'),
  region('overview-motor','-02M1',[190,160,19,9],'컨베이어 모터','CONVEYOR MOTOR가 현재 수업의 이송 모터입니다. 아래의 유압·인덱싱 모터와 다른 기기입니다.','motor','-02M1'),
  region('overview-isolator','-02Q2',[136,133,12,5],'컨베이어 현장 개폐기','-02Q2는 컨베이어 모터 쪽 동력을 연결하거나 분리하는 개폐기입니다. -02Q3·-02Q4는 다른 모터 계통입니다.','isolator','-02Q2')
 ],
 '02':[
  region('power-breaker','-02Q1',[52,244,25,34],'주 차단기 · 3극','L1·L2·L3 세 전원을 함께 여닫는 주 차단기입니다. 원본에는 30 A, 수업 모형에는 16 A를 선정했습니다.','breaker','-02Q1'),
  region('power-fuse','-02F1',[122,215,42,13],'컨베이어 분기 퓨즈','세 상에 있는 퓨즈 묶음입니다. 이 갈래를 따라 내려가면 컨베이어 모터에 도착합니다.','fuse','-02F1'),
  region('power-main','-07K1',[116,173,47,20],'접촉기 · 동력 접점 3개','07번 도면의 같은 -07K1 코일이 여자되면 이 세 접점이 함께 닫혀 모터 쪽으로 동력을 전달합니다.','contactor','-07K1'),
  region('power-aux','-07K1',[174,176,9,17],'접촉기 · 피드백 보조접점','83–84 접점은 02.1 신호를 09번 도면으로 보냅니다. 모터 전력용 세 접점과 역할이 다르며, 접촉기 동작을 알려줍니다.','feedback','83'),
  region('power-terminal','X1',[124,153,49,10],'모터 단자 · U·V·W·PE','제어반의 모터 연결 단자입니다. 세 상과 보호접지가 현장 케이블로 이어집니다.','terminal','-X1'),
  region('power-connector','-02X1',[124,122,49,13],'현장 커넥터 · 4극','제어반에서 나온 케이블을 현장 쪽 케이블과 연결하는 접속부입니다.','connector','-02X1'),
  region('power-isolator','-02Q2',[116,103,47,18],'현장 개폐기 · 동력 분리','접촉기가 붙어 있어도 이 개폐기가 열리면 모터 동력은 끊깁니다. 보호접지 PE는 개폐 접점을 통과하지 않습니다.','isolator','-02Q2'),
  region('power-motor','-02M1',[105,57,66,24],'컨베이어 모터 · 3상','U·V·W가 모터로 들어갑니다. M과 3~는 3상 모터를 나타내며, 원본에는 이 모터의 kW가 없어 수업에서는 1.5 kW로 계산합니다.','motor','-02M1')
 ],
 '03':[
  region('control-transformer','-03T2',[272,132,45,27],'제어 변압기 · 380 V → 120 V','1차 380 V를 제어용 2차 120 V로 바꿉니다. 원본의 3.0 표기는 단위가 없어 용량으로 단정하지 않으며, 수업 계산은 100 VA 조건을 사용합니다.','transformer','-03T2')
 ],
 '06':[
  region('permit-contact','-06K1',[120,255,34,24],'허가 릴레이 · 공급 접점','아래쪽 -06K1 코일과 같은 릴레이의 접점입니다. 허가가 성립하면 다음 제어 회로로 전원을 전달합니다.','relay','-06K1'),
  region('permit-reset','-06S1',[42,230,30,28],'허가 복구 버튼 · NO 접점','누르는 동안 접점이 닫혀 허가 릴레이를 여자시키는 복구 버튼입니다.','reset','-06S1'),
  region('permit-hold','-06K1',[76,234,37,25],'허가 릴레이 · 자기유지 접점','복구 버튼과 나란히 연결된 접점입니다. 코일이 여자되면 닫혀, 버튼을 놓아도 코일의 전류 경로를 유지합니다.','relay','-06K1'),
  region('permit-estop','-06S2',[40,160,34,26],'비상정지 · NC 접점','평소 닫혀 있는 접점이 버튼을 누르면 열려 허가 릴레이의 전류 경로를 끊습니다.','estop','-06S2'),
  region('permit-coil','-06K1',[36,79,40,23],'허가 릴레이 · 코일','사각형 기호가 코일입니다. 전류가 흐르면 위쪽의 같은 번호 접점들이 함께 바뀝니다.','coil','-06K1')
 ],
 '07':[
  region('run-selector','-07S1',[185,238,49,31],'운전 선택 스위치','CONVEYOR MOTOR ENABLE 스위치가 접촉기 코일로 가는 운전 명령을 여닫습니다.','selector','-07S1'),
  region('run-coil','-07K1',[207,79,29,23],'접촉기 · A1–A2 코일','이 코일이 02번 도면의 동력 접점과 보조접점을 움직입니다. 3D에서는 코일과 가동 철심을 확대한 학습 모형으로 봅니다.','coil','-07K1','coil'),
  region('run-lamp','-07H5',[246,79,29,23],'컨베이어 운전 표시등','코일과 병렬로 연결된 표시등입니다. 켜졌다는 사실만으로 모터 축이 실제 회전한다고 단정할 수는 없습니다.','lamp','-07H5')
 ],
 '09':[
  region('input-sensor-entry','-09B1',[42,207,30,15],'진입 감지기','팔레트 진입을 감지해 단자 11을 거쳐 PLC 입력 I:001/00으로 보냅니다.','sensor','-09B1'),
  region('input-sensor-station','-09B2',[82,207,30,15],'정위치 감지기','팔레트의 정위치를 감지해 단자 12를 거쳐 PLC 입력 I:001/01로 보냅니다.','sensor','-09B2'),
  region('input-terminal-11','X1-1',[55,164,17,10],'입력 단자 11','진입 감지기 -09B1과 PLC 입력 I:001/00 사이의 접속점입니다.','terminal','11'),
  region('input-terminal-12','X1-1',[95,164,17,10],'입력 단자 12','정위치 감지기 -09B2와 PLC 입력 I:001/01 사이의 접속점입니다.','terminal','12'),
  region('input-terminal-17','X1-1',[334,164,18,10],'입력 단자 17','접촉기 보조접점의 02.1 신호를 PLC 입력 I:001/07로 전달합니다.','terminal','17'),
  region('input-plc-00','PLC1',[66,99,8,23],'PLC 입력 I:001/00','진입 감지기 신호를 읽는 입력 채널입니다. 입력이 켜지는 것은 PLC 출력 명령과 다릅니다.','io','I:001/00'),
  region('input-plc-01','PLC1',[106,99,8,23],'PLC 입력 I:001/01','정위치 감지기 신호를 읽는 입력 채널입니다.','io','I:001/01'),
  region('input-plc-07','PLC1',[346,99,8,23],'PLC 입력 I:001/07','접촉기 보조접점의 피드백을 읽습니다. 모터의 실제 회전 센서는 아닙니다.','feedback','I:001/07'),
  region('input-feedback-reference','-07K1',[340,198,14,24],'02번 도면에서 오는 접촉기 신호','02-4/C는 신호가 오는 도면 위치입니다. 02번의 -07K1 보조접점에서 이 선으로 이어집니다.','feedback','02-4/C')
 ],
 '21':[
  region('panel-operator','OP1',[84,251,71,17],'운전 조작반 외함','OPERATOR STATION #3의 정면 배치입니다. 컨베이어 수업에 연결한 표시등·선택 스위치·비상정지 버튼을 찾습니다.','operator','OPERATOR STATION #3'),
  region('panel-lamp','-07H5',[68,183,24,24],'컨베이어 운전 표시등','CONVEYOR ENABLED 표시등의 실제 설치 위치입니다. 07번 회로도의 -07H5와 연결됩니다.','lamp','CONVEYOR'),
  region('panel-selector','-07S1',[68,153,24,25],'컨베이어 운전 선택 스위치','CONVEYOR MOTOR ENABLE 선택 스위치입니다. 07번 회로도의 -07S1과 같은 역할을 합니다.','selector','CONVEYOR MOTOR'),
  region('panel-estop','-06S2',[44,122,21,22],'비상정지 버튼','조작반 아래쪽의 돌출된 정지 버튼입니다. 06번 도면의 비상정지 접점과 연결해서 읽습니다.','estop','RE')
 ],
 '22':[
  region('cabinet-breaker','-02Q1',[137,212,11,16],'제어반의 주 차단기','-02Q1의 설치 위치입니다. 이 배치도에는 50 A, 02번 회로도에는 30 A가 표기되어 있어 서로 다릅니다. 수업 모형의 16 A 선정값과 구분해 읽습니다.','breaker','-02Q1'),
  region('cabinet-fuse','-02F1',[104,216,6,11],'제어반의 컨베이어 퓨즈','-02F1 퓨즈 묶음입니다. 02번 도면의 컨베이어 동력 갈래에 해당합니다.','fuse','-02F1'),
  region('cabinet-contactor','-07K1',[105.5,194,4.5,6.5],'제어반의 접촉기','작게 그려진 -07K1 설치 위치입니다. 동력 접점·보조접점·코일은 여러 도면에 나와도 하나의 접촉기에 속합니다.','contactor','-07K1'),
  region('cabinet-transformer','-03T2',[158.5,131,23,49],'제어 변압기 설치 위치','제어반 옆에 배치된 -03T2입니다. 03번 도면의 380 V / 120 V 변압기와 같은 번호를 찾습니다.','transformer','-03T2'),
  region('cabinet-plc','PLC1',[60.8,126,3,29],'PLC 입력 모듈 설치 위치','PLC1 입력 모듈입니다. 옆의 다른 슬롯 전체를 같은 입력 모듈로 세지 않습니다.','plc','PLC1'),
  region('cabinet-motor-terminals','X1',[211,221,33,18],'X1 · 컨베이어 모터 단자','확대 단자 배치의 맨 위 세 상과 PE 네 단자를 수업 모델의 X1에 연결했습니다. 그 아래는 다른 모터 계통입니다.','terminal','-X1'),
  region('cabinet-input-00','X1-1',[294,210.1,31,2.4],'X1-1 · I:001/00 접속 행','진입 감지기 입력의 접속 행입니다. 현재 수업은 입력 00·01·07의 세 단자를 모델링합니다.','terminal','I:001/00'),
  region('cabinet-input-01','X1-1',[294,207.6,31,2.4],'X1-1 · I:001/01 접속 행','정위치 감지기 입력의 접속 행입니다.','terminal','I:001/01'),
  region('cabinet-input-07','X1-1',[294,195.1,31,2.4],'X1-1 · 02.1 피드백 접속 행','배선 번호 02.1의 접속 행입니다. 09번 도면을 따라가면 PLC 입력 I:001/07에 도착합니다.','terminal','02.1;02.1')
 ]
};
export function findOriginalRegion(key){for(const [number,regions] of Object.entries(originalRegions)){const r=regions.find(x=>x.key===key);if(r)return {...r,number};}return null;}
export function originalOccurrences(device){return Object.entries(originalRegions).sort(([a],[b])=>Number(a)-Number(b)).flatMap(([number,regions])=>regions.filter(r=>r.device===device).map(r=>({...r,number})));}
export function regionViewport(region){const [x,y,w,h]=region.rect,scale=1000/420,offset=(760-290*scale)/2;return {cx:(x+w/2)*scale,cy:offset+(290-y-h/2)*scale,width:w*scale,height:h*scale};}
export function originalState(r,s,p){
 if(!s||!p)return null;
 const key=r.key;
 let on,label='상태';
 if(['input-plc-00','input-terminal-11','cabinet-input-00'].includes(key)){on=p.inputs['I:001/00'];label='진입 입력';}
 else if(['input-plc-01','input-terminal-12','cabinet-input-01'].includes(key)){on=p.inputs['I:001/01'];label='정위치 입력';}
 else if(['input-plc-07','input-terminal-17','cabinet-input-07','input-feedback-reference','power-aux'].includes(key)){on=p.feedback;label='접촉기 피드백';}
 else if(key==='power-main'){on=p.coil;return {on,text:'동력 접점 '+(on?'닫힘':'열림')};}
 else if(key==='permit-estop'){on=!s.estop;return {on,text:'비상정지 접점 '+(on?'닫힘':'열림')};}
 else if(r.device==='-02Q2'){on=s.isolator;return {on,text:'현장 개폐기 '+(on?'닫힘':'열림')};}
 else if(p.active[r.device]!==undefined){on=p.active[r.device];label=r.device==='-07K1'?'코일':r.device==='-02M1'?'모터':'동작';}
 if(on===undefined)return null;
 return {on,text:label+' '+(on?'ON':'OFF')};
}
