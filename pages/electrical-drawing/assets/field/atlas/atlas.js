// Hotspots are source model-space coordinates, with Y measured upwards in the DWG.
const S=(title,lesson,question,hint,points,wanted,follow,choices,key,why)=>({title,lesson,question,hint,points,wanted,follow,choices,key,why});
const P=(tag,x,y,description)=>({tag,x,y,description});
const sheets=[
 S('설비 전체 배치','설비를 내려다보며 모터와 조작반, 제어반의 상대 위치를 읽습니다. 오른쪽에는 입출력 이름과 주소가 있습니다.','작업자가 기계를 조작하는 장소를 찾으세요.','OPERATOR는 작업자, STATION은 작업 위치라는 뜻입니다. 왼쪽 위의 큰 제어반에서 연결을 따라가세요.',[P('MAIN CONTROL PANEL',54,263,'전장 부품을 수납하는 주 제어반'),P('OPERATOR STATION',169,219,'작업자가 기계를 조작하는 위치'),P('-02M1',196,163,'컨베이어를 구동하는 모터')],1,'배치도에서 작업자 조작반을 찾은 뒤 버튼의 배치를 보려면 어디를 펼칠까요?',['02번 모터 동력 회로','21·23번 조작반 배치'],1,'배치도는 위치를, 조작반 도면은 버튼과 표시등의 배열을 보여줍니다. 21번과 23번은 서로 다른 조작반입니다.'),
 S('세 모터에 공급하는 전력','전원에서 내려오는 세 선을 따라가면 가지 끝에 모터 기호가 있습니다. 같은 기호여도 태그와 설명이 달라집니다.','팔레트를 옮기는 컨베이어의 모터를 찾으세요.','기호 옆 CONVEYOR MOTOR를 읽으세요. HYDRAULIC은 유압, INDEXING은 위치 결정입니다.',[P('-02M1',150,67.5,'CONVEYOR MOTOR · 컨베이어 모터'),P('-02M2',230,67.5,'HYDRAULIC MOTOR · 유압 모터'),P('-02M3',310,67.5,'INDEXING MOTOR · 위치 결정 모터')],0,'01번의 모터와 02번의 모터가 같은 기기임을 무엇으로 확인할까요?',['기호의 크기','같은 태그 -02M1과 기기 설명'],1,'태그는 여러 장에서 같은 기기를 다시 찾는 식별자입니다.'),
 S('재료를 풀고 감는 모터','웹(web)은 연속으로 공급되는 띠 모양의 재료입니다. 이 장에는 그 재료를 풀어 주는 모터와 다시 감는 모터가 있습니다.','풀어 놓은 재료를 다시 감는 모터를 고르세요.','REWIND는 다시 감기입니다. 모터 기호까지 내려가세요.',[P('-03M1',70,67.5,'UNWIND WEB · 풀림 모터'),P('-03M2',150,67.5,'REWIND WEB · 감김 모터'),P('-08K2',70,185,'풀림 모터 회로의 접점')],1,'감김 모터 가지의 접점 -08K3에 대응하는 코일은 어느 장에 있나요?',['08번 제어 회로','09번 팔레트 입력도'],0,'03번의 감김 모터 접점에 08-4/E 참조가 적혀 있습니다. 08번에서 같은 태그의 코일을 대조합니다.'),
 S('함 안의 조명과 콘센트','함의 보조전원은 콘센트와 조명 등으로 분기됩니다. 회로의 위아래를 따라 같은 가지에 있는 장치를 봅니다.','제어반 내부 조명의 도어 스위치를 고르세요.','오른쪽의 MCAB-5 LIGHT 가지에서 램프 위쪽으로 선을 따라가세요.',[P('-04X3',255,122.5,'조작반의 콘센트'),P('-04H2',350,90,'제어반 조명'),P('-04S1',350,167.5,'DOOR SWITCH · 문 스위치')],2,'이 스위치와 같은 회로 가지에서 확인할 수 있는 부하는 무엇인가요?',['주 제어반 조명 -04H2','팔레트 컨베이어 모터'],0,'오른쪽 가지의 문 스위치에서 내려가면 조명 -04H2가 있습니다.'),
 S('24 V 직류전원과 분기','제어반에는 전원을 바꾸는 전원장치와 여러 부하로 전기를 나누는 분기 기기가 함께 있습니다.','두 번째 24 V 직류 전원장치 본체를 찾으세요.','POWER SUPPLY NO. 2 위쪽 보호기기와 아래쪽 전원장치 기호를 구별하세요.',[P('-05G1',60,150,'첫 번째 24 V 전원장치'),P('-05Q2',140,247.5,'두 번째 전원장치의 보호기기'),P('-05G2',140,150,'두 번째 24 V 전원장치')],2,'이 전원장치가 실제 함에서 어느 위치에 있는지 확인할 도면은?',['22번 주 제어반 배치','09번 PLC 입력도'],0,'22번에서 -05G2 표기를 찾아 회로도와 설치 위치를 대조할 수 있습니다.'),
 S('복귀, 비상정지와 안전상태','SYSTEM RESET, EMERGENCY STOP, MASTER CONTROL RELAY는 각각 서로 다른 요소입니다. 이 도면을 통해 명칭과 접점·코일을 구분합니다.','비상정지 기능으로 표기된 기호를 찾으세요.','왼쪽 세로 회로에서 RESET보다 아래에 있는 EMERGENCY STOP 문구를 읽으세요.',[P('-06S1',70,247.5,'SYSTEM RESET · 시스템 복귀'),P('-06S2',70,175,'EMERGENCY STOP · 비상정지'),P('-06K1',70,90,'MASTER CONTROL RELAY · 주 제어 릴레이')],1,'도면에서 비상정지와 시스템 복귀는 어떻게 구별되나요?',['서로 다른 태그의 스위치로 표시됩니다.','같은 스위치의 색 이름입니다.'],0,'-06S2는 비상정지, -06S1은 시스템 복귀로 개별 설명과 태그가 있습니다.'),
 S('컨베이어 운전 허용','사람이 돌리는 선택스위치, 함 안에 있는 접촉기 코일, 켜지는 표시등을 같은 제어 회로에서 비교합니다.','컨베이어 모터의 운전을 허용하는 선택스위치를 찾으세요.','위쪽 CONVEYOR MOTOR ENABLE 기호와 아래쪽 코일·표시등을 비교하세요.',[P('-07S1',230,255,'운전 허용 선택스위치'),P('-07K1',230,90,'컨베이어 모터 접촉기 코일'),P('-07H5',270,90,'컨베이어 허용 표시등')],0,'운전 허용 표시등이 켜진 것으로 직접 확인할 수 있는 것은?',['모터 축의 실제 회전수','표시등 가지에 허용 상태가 나타났음'],1,'허용 표시등과 모터 축 회전은 관찰 대상이 다릅니다. 모터 전력 경로는 02번에서 확인합니다.'),
 S('위치 결정과 퍼지 완료 표시','이 장에는 인덱싱 모터, 웹 감지, 경보와 퍼지 완료 표시 등 여러 기능이 있습니다. 원하는 기능의 설명부터 찾습니다.','퍼지가 끝났음을 작업자에게 보여 주는 표시등을 찾으세요.','PURGE COMPLETE라는 설명이 붙은 램프 기호를 보세요.',[P('-08H1',110,90,'INDEXING ENABLED · 위치 결정 허용 표시'),P('-08P1',230,90,'AUDIBLE ALARM · 소리로 알리는 경보'),P('-08H2',280,90,'PURGE COMPLETE · 퍼지 완료 표시')],2,'이 표시등 가지 위 접점 -18K2와 같은 릴레이의 코일은 어느 장에서 찾을까요?',['18번 PLC 출력도','01번 전체 배치도'],0,'08번 접점에는 18-7/D 참조가 있습니다. 18번에서 PURGE COMPLETE RELAY 코일을 확인합니다.'),
 S('팔레트 진입과 정위치','센서가 현장 상태를 받아들입니다. 같은 세로줄 안에서 센서, 단자대, PLC 입력 주소를 차례로 읽으세요.','팔레트가 입구를 통과했음을 알리는 센서를 고르세요.','PALLET ENTER와 PALLET IN STATION은 서로 다른 위치의 신호입니다.',[P('-09B1',70,212.5,'PALLET ENTER · 입구 진입'),P('-09B2',110,212.5,'PALLET IN STATION · 정위치'),P('-09B3',150,212.5,'PALLET RAISED · 상승 위치')],0,'입구 센서 선을 아래로 따라가면 어느 입력에 도착하나요?',['I:001/01','I:001/00'],1,'-09B1 → 단자대 -X1-1의 11번 → I:001/00입니다. I:001/01은 정위치 센서 -09B2의 입력입니다.'),
 S('모터 허용 상태를 받는 입력','09번에서 이어진 입력 모듈의 나머지 채널입니다. 이미 사용 중인 채널과 SPARE로 남겨 둔 채널을 나눠 읽습니다.','위치 결정 모터가 허용됐다는 상태를 받는 입력 채널을 찾으세요.','모듈 안에서 INDEXING MOTOR와 ENABLED라는 두 줄을 찾으세요.',[P('I:001/10',75,104,'유압 모터 허용 상태'),P('I:001/11',115,104,'위치 결정 모터 허용 상태'),P('I:001/13',195,104,'SPARE · 예비 입력')],1,'이 입력 주소가 뜻하는 것은?',['위치 결정 모터 허용 상태를 PLC가 받아들임','PLC가 모터에 3상 전력을 보냄'],0,'입력 모듈의 ENABLED 채널입니다. 모터 동력 회로는 02번에 있습니다.'),
 S('송풍기 조작과 공정 입력','송풍기 원격 시작·정지 조작과 온도·유량 상태가 한 입력 모듈의 서로 다른 채널로 들어옵니다.','2번 뱅크의 섬유 폐기물 제거 송풍기를 원격 시작하는 스위치를 고르세요.','BANK #2와 START REMOTE 두 조건을 모두 읽으세요.',[P('-11S1',70,212.5,'1번 뱅크 원격 시작'),P('-11S4',190,212.5,'2번 뱅크 정지'),P('-11S3',150,212.5,'2번 뱅크 원격 시작')],2,'이 스위치와 같은 세로줄의 PLC 입력은?',['I:003/02','I:003/03'],0,'2번 뱅크 원격 시작은 I:003/02, 정지는 바로 옆 I:003/03입니다.'),
 S('댐퍼와 공기압 상태','댐퍼는 공기의 통로를 조절합니다. 이 장은 댐퍼의 위치와 공기 압력·유량 상태가 PLC로 들어오는 경로를 보여줍니다.','댐퍼가 저화력 위치에 있다는 상태를 나타내는 기호를 찾으세요.','AIR DAMPER 중 AT LOW FIRE (<20%)라고 적힌 쪽을 보세요.',[P('-12S2',110,212.5,'댐퍼 고화력 위치'),P('-12S3',150,212.5,'댐퍼 저화력 위치'),P('-12S4',190,212.5,'퍼지 공기 유량 상태')],1,'I:003/12로 알 수 있는 것은?',['댐퍼 열림각의 연속 측정값','저화력 위치 조건의 성립 여부'],1,'입력 한 점이 위치 조건의 성립 여부를 전달합니다.'),
 S('화염 감지와 히터 조작','불꽃을 감지하는 신호와 작업자가 히터를 조작하는 신호는 각각 별도 입력입니다.','작업자가 히터 시작을 지시하는 버튼을 찾으세요.','FLAME DETECTED와 START HEATER를 구별해 오른쪽 가지를 읽으세요.',[P('-13S4',350,212.5,'START HEATER · 히터 시작'),P('-13S3',270,212.5,'STOP HEATER · 히터 정지'),P('-13S1',70,212.5,'첫 번째 화염 감지')],0,'시작 버튼의 선을 따라 읽은 결과는?',['I:004/07에서 시작 조작을 받습니다.','I:004/00에서 화염 발생을 보장합니다.'],0,'버튼 입력 I:004/07과 화염 감지 입력 I:004/00은 서로 다른 정보입니다.'),
 S('경보 확인과 램프 시험','ALARM ACKNOWLEDGE는 작업자가 경보를 확인하는 조작입니다. 바로 옆 채널에는 램프 시험 조작이 있습니다.','표시등 시험을 요청하는 버튼을 고르세요.','기호 설명에서 LAMP TEST를 찾고 모듈 입력까지 세로로 내려가세요.',[P('-14S1',70,212.5,'경보 확인 버튼'),P('I:004/12',155,104,'안전 릴레이 2번 상태 입력'),P('-14S2',110,212.5,'램프 시험 버튼')],2,'버튼을 눌렀다는 정보가 PLC로 들어가는 주소는?',['I:004/10','I:004/11'],1,'LAMP TEST는 I:004/11입니다. 바로 옆 I:004/10은 경보 확인입니다.'),
 S('가스 압력과 밸브의 닫힘','가스 압력의 하한 조건과 상한 조건을 서로 다른 접점으로 받습니다. 밸브의 닫힘 위치도 따로 확인합니다.','가스 압력이 상한을 넘지 않았다는 조건을 읽는 스위치를 고르세요.','GAS PRESSURE 설명 옆의 NOT HIGH와 NOT LOW를 비교하세요.',[P('-15S2',150,212.5,'GAS PRESSURE NOT LOW · 하한 조건'),P('-15S3',190,212.5,'GAS PRESSURE NOT HIGH · 상한 조건'),P('-15S4',270,212.5,'하류 가스 밸브의 닫힘 위치')],1,'이 입력으로 확인할 수 있는 것은?',['상한 조건의 성립 여부','가스 압력의 정확한 측정 수치'],0,'-15S3 접점의 조건이 I:005/03에 들어옵니다.'),
 S('출력 장치의 상태를 읽는 입력','도면 속 OUTPUT MONITOR는 출력 장치 상태를 감시한다는 설명입니다. 이 장에서 읽는 방향은 외부에서 PLC 입력 쪽입니다.','점화 변압기 상태를 감시하는 입력 채널을 찾으세요.','IGNITION TRANSFORMER라는 설명과 I로 시작하는 주소를 함께 읽으세요.',[P('I:005/13',195,104,'점화 변압기 출력 감시'),P('I:005/14',235,104,'파일럿 가스 밸브 출력 감시'),P('I:005/17',355,104,'가스 벤트 밸브 퓨즈 감시')],0,'설명에 OUTPUT이 있는데도 이 장을 입력도로 읽는 근거는?',['기기 명칭에 변압기가 들어감','모듈 단자가 IN이며 주소가 I로 시작함'],1,'장치 설명보다 채널의 방향을 먼저 확인합니다. I:005/13은 감시 입력입니다.'),
 S('가스 벤트 밸브와 상태 표시 출력','모듈에서 나가는 선의 반대편을 확인하면 표시등과 밸브를 구별할 수 있습니다.','가스 벤트 밸브로 이어지는 현장 기호를 찾으세요.','GAS VENT VALVE 문구가 있는 맨 왼쪽 출력 가지를 읽으세요.',[P('-17H2',230,122.5,'PURGE ON · 퍼지 작동 표시등'),P('-17H3',270,122.5,'PILOT ON · 파일럿 표시등'),P('-17K1',70,122.5,'GAS VENT VALVE · 가스 벤트 밸브')],2,'해당 밸브로 명령을 보내는 쪽의 주소는?',['O:007/00','I:005/17'],0,'O:007/00은 출력입니다. 16번의 I:005/17은 퓨즈 감시 입력입니다.'),
 S('경보 릴레이와 퍼지 완료 릴레이','출력 신호로 릴레이 코일을 동작시키면 다른 장의 해당 접점에서 같은 태그를 찾을 수 있습니다.','경보음을 내는 회로와 관련된 릴레이 코일을 고르세요.','PURGE COMPLETE와 AUDIBLE ALARM은 다른 출력입니다.',[P('-18H1',70,122.5,'NO FLAME · 무화염 표시등'),P('-18K1',270,122.5,'AUDIBLE ALARM RELAY · 경보 릴레이'),P('-18K2',310,122.5,'퍼지 완료 릴레이')],1,'이 릴레이와 같은 태그의 접점을 찾아 경보기를 확인할 장은?',['08번의 경보 회로','23번 조작반 1번'],0,'08번의 -18K1 접점이 있는 가지 아래에는 소리 경보기 -08P1이 있습니다.'),
 S('세 상을 각각 그린 전력 회로','세 상의 전선을 따로 그려 모터에 연결하는 표현입니다. 태그를 읽고 두 모터를 구별하세요.','세 상의 전력 경로 끝에서 첫 모터 -23M1을 찾으세요.','아래쪽 모터 기호의 숫자까지 읽으세요. 옆 가지의 -23M2와 구별합니다.',[P('-23M1',320,52.5,'세 상이 연결된 첫 모터'),P('-23M2',380,52.5,'옆 가지의 두 번째 모터'),P('-23F1',310,240,'첫 번째 가지 상단의 보호·개폐 기기')],0,'이 모터를 20번에 그려진 모터와 비교할 때 무엇을 먼저 확인해야 할까요?',['상세도가 다르면 무조건 동일 기기입니다.','19번은 -23M1, 20번은 -23M3으로 태그가 다릅니다.'],1,'두 도면은 삼상도와 단선 표현을 비교할 자료입니다. 두 태그 자체를 동일 기기로 연결할 근거는 없습니다.'),
 S('한 선으로 요약한 모터 계통','단선도는 여러 상의 계통을 한 선으로 요약합니다. 이 원도면에는 도곽의 오른쪽과 위에 걸쳐 회로가 있습니다.','단선 회로의 가지를 따라가 모터 본체를 고르세요.','오른쪽의 세로 계통 끝에서 M 기호와 -23M3 태그를 찾으세요.',[P('-23Q3',375,230,'모터 가지 중간의 보호 기기'),P('-23M3',375,145,'단선으로 그린 모터'),P('-23F3',375,295,'모터 가지 상단의 보호·개폐 기기')],1,'이 도면의 한 선을 어떻게 읽어야 할까요?',['여러 상의 전력 계통을 대표하는 선','전선 한 가닥만 시공하라는 지시'],0,'개별 선의 연결을 자세히 보고 싶으면 삼상 표현과 단자 정보가 필요합니다.'),
 S('3번 작업자 조작반 전면','조작자가 만지는 스위치와 눈으로 보는 표시등이 조작면에 배치됩니다. 이름표에서 기능을 확인합니다.','컨베이어 운전 허용 선택스위치의 실제 설치 위치를 짚으세요.','허용 상태를 보여주는 표시등의 바로 아래에 있는 스위치를 보세요.',[P('-07H5',80,192.5,'컨베이어 운전 허용 표시등'),P('-07S2',105,162.5,'유압 모터 운전 허용 선택스위치'),P('-07S1',80,162.5,'컨베이어 운전 허용 선택스위치')],2,'같은 -07S1이 07번과 21번에서 다른 모습인 이유는?',['제어 회로는 접점, 조작반 배치는 장착 모습을 그립니다.','같은 기호를 서로 다른 번호로 등록해서입니다.'],0,'07번은 어떻게 연결하는지를, 21번은 어디에 장착하는지를 설명합니다.'),
 S('주 제어반 내부와 단자대','단자대는 안팎의 전선을 정리해 연결하는 일렬의 접속부입니다. 확대 배치에서 단자대 이름과 번호를 함께 읽습니다.','팔레트 입구 신호의 -X1-1 단자대 11번을 고르세요.','오른쪽 단자대 배치에서 I:001/00 표기와 11번을 같은 줄에서 확인하세요.',[P('-07K1',105.61,194.42,'컨베이어 접촉기 몸체'),P('-X1-1 · 11',310,212.5445,'입구 센서가 이어지는 단자대 11번'),P('PLC1',60.85,127.63,'제어반 안 PLC 모듈')],1,'이 단자에 연결되는 현장 쪽 기기를 09번에서 찾으면?',['-09B2 정위치 센서','-09B1 입구 센서'],1,'09번의 -09B1과 PLC 입력 I:001/00 사이에 -X1-1의 11번이 있습니다.'),
 S('1번 작업자 조작반의 기동과 정지','오른쪽 연결 그림에서 컨베이어의 운전 표시, 기동, 정지 항목을 구분합니다. 기기 태그에 더해 설명과 위치도 확인하세요.','1번 조작반에서 컨베이어 정지를 나타내는 접속 항목을 찾으세요.','오른쪽 CONVEYOR START 행과 CONVEYOR STOP 행을 비교하세요.',[P('-21H1',240,257.5,'CONVEYOR RUNNING · 운전 표시'),P('-21S1',240,230,'CONVEYOR START · 기동'),P('-21S2',240,202.5,'CONVEYOR STOP · 정지')],2,'21번의 컨베이어 운전 허용 스위치와 이 장의 조작은 어떻게 구별할까요?',['21번은 3번 조작반의 허용, 23번은 1번 조작반의 기동·정지입니다.','같은 위치에 있는 같은 스위치입니다.'],0,'조작반 번호, 기능 설명, 태그를 함께 봐야 합니다. 이 정보만으로 원래 자동운전의 전체 순서를 결정할 수는 없습니다.')
];

const $=id=>document.getElementById(id);
const idFor=n=>String(n).padStart(2,'0');
const group=n=>n===1?'전체 배치':n<=3?'동력 회로':n<=8?'110 V 보조 회로':n<=16?'PLC 입력':n<=18?'PLC 출력':n===19?'삼상도':n===20?'단선도':'패널 배치';
const drawing=n=>'../assets/sheet-'+idFor(n)+'.svg';
const letters=['A','B','C'],scaleSteps=[1,1.6,2.4,3.5];
const masteryKey='iec-atlas-mastery-v1',doneKey='iec-atlas-v1';
let current=1,stage=1,assisted=false,zoom=0,mastery={};
function stored(){try{const result=JSON.parse(localStorage.getItem(masteryKey)||'{}');return result && typeof result==='object'&&!Array.isArray(result)?result:{}}catch{return {}}}
function save(){
 mastery={...mastery,...stored()};const k=idFor(current);
 if(mastery[k]!=='independent')mastery[k]=assisted?'guided':'independent';
 try{localStorage.setItem(masteryKey,JSON.stringify(mastery));localStorage.setItem(doneKey,JSON.stringify(sheets.map((_,i)=>i+1).filter(n=>mastery[idFor(n)])))}catch{}
 showInventory();
}
function labelFor(n){return ({guided:'연습 완료',independent:'스스로 완료'})[mastery[idFor(n)]]||'미완료'}
function showInventory(){
 $('roster').replaceChildren(...sheets.map((s,i)=>{const n=i+1,a=document.createElement('a');a.href='#sheet-'+idFor(n);a.textContent=idFor(n)+'　'+s.title+' · ';const state=document.createElement('small');state.textContent=labelFor(n);a.append(state);return a}));
 const passed=sheets.filter((_,i)=>mastery[idFor(i+1)]).length;
 $('progress').textContent='완료 '+passed+' / '+sheets.length+'장';
}
function makeButton(label,handler){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=handler;return b}
function setZoom(index, anchor=null){
 zoom=index;$('paper').style.width=(scaleSteps[zoom]*100)+'%';$('scale').textContent=Math.round(scaleSteps[zoom]*100)+'%';
 $('zminus').disabled=zoom===0;$('zplus').disabled=zoom===scaleSteps.length-1;
 if(anchor!==null){const pin=$('pins').children[anchor];$('viewport').scrollTo({left:pin.offsetLeft-$('viewport').clientWidth/2,top:pin.offsetTop-$('viewport').clientHeight/2})}
}
function renderPins(){
 const s=sheets[current-1],width=current===20?515:420,height=current===20?355:290;
 $('pins').replaceChildren(...s.points.map((p,i)=>{
  const b=makeButton(letters[i],()=>pick(i));b.className='pin';b.dataset.letter=letters[i];b.setAttribute('aria-label','도면 위치 '+letters[i]);
  b.style.left=(p.x/width*100)+'%';b.style.top=(100-p.y/height*100)+'%';return b;
 }));
}
function feedback(text){$('feedback').textContent=text}
function renderTask(){
 const s=sheets[current-1];
 $('hinttext').hidden=true;$('continue').hidden=true;$('hint').hidden=false;
 if(stage===1){
  $('step').textContent='01　/　기호 찾기';$('ask').textContent=s.question;
  $('candidates').replaceChildren(...letters.map((l,i)=>makeButton('위치 '+l,()=>pick(i))));
 }else{
  $('step').textContent='02　/　연결 읽기';$('ask').textContent=s.follow;
  $('candidates').replaceChildren(...s.choices.map((c,i)=>makeButton(c,()=>explain(i))));
 }
}
function pick(i){
 const s=sheets[current-1],p=s.points[i];
 if(stage!==1){feedback(p.tag+' · '+p.description);return}
 if(i!==s.wanted){assisted=true;feedback(p.tag+' · '+p.description+'입니다. 질문의 기능과 대조한 뒤 다른 위치를 선택하세요.');return}
 stage=2;$('pins').children[i].classList.add('correct');renderTask();
 feedback('찾았습니다. '+p.tag+' · '+p.description+'입니다. 이제 같은 기호가 의미하는 연결을 고르세요.');
 $('ask').focus({preventScroll:true});
 if(window.matchMedia('(max-width:760px)').matches)$('ask').scrollIntoView({block:'center'});
}
function explain(i){
 const s=sheets[current-1];if(stage!==2)return;
 if(i!==s.key){assisted=true;feedback('다시 읽어보세요. '+s.hint+' 필요하면 힌트에서 연결 근거를 볼 수 있습니다.');return}
 stage=3;save();$('step').textContent='완료　/　'+(assisted?'도움받아 읽음':'스스로 읽음');$('ask').textContent=s.title+' 독해를 마쳤습니다.';
 $('candidates').replaceChildren();$('hint').hidden=true;$('hinttext').hidden=true;feedback(s.why);
 $('continue').hidden=false;$('continue').textContent=current===sheets.length?'전체 학습 결과 보기':'다음 도면 읽기 →';$('continue').focus({preventScroll:true});
}
// Use the exact exercise part when it exists. For other sheets, name the
// comparison device explicitly so a related device cannot be mistaken for it.
const practiceLinks={
 1:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기'],
 2:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기'],
 3:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기'],
 4:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기'],
 7:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기'],
 8:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기'],
 9:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기'],
 11:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기'],
 12:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기'],
 13:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기'],
 14:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기'],
 15:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기'],
 16:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기'],
 17:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기'],
 18:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기'],
 19:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기'],
 20:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기'],
 21:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기'],
 22:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기'],
 23:['https://mirinaeman.com/pages/guardhouse-classroom/conveyor/#components','컨베이어 3D에서 부품 보기']
};
function practiceForSheet(number){
 const [href,label]=practiceLinks[current]||[drawing(current),number+'번 도면을 크게 열어 선택 기호 다시 보기'];
 const link=$('practiceLink');link.href=href;link.textContent=label+' →';
 $('wireLink').hidden=current!==9&&current!==22;
}
function reset(){
 stage=1;assisted=false;const s=sheets[current-1],number=idFor(current);
 $('family').textContent='SHEET '+number+'　/　'+group(current);$('name').textContent=number+'　'+s.title;$('intro').textContent=s.lesson;
 $('svg').src=drawing(current);$('svg').alt=number+'번 '+s.title+' 실제 DWG 도면';$('original').href=drawing(current);$('sheet-select').value=String(current);
 practiceForSheet(number);
 $('prev').disabled=current===1;$('next').disabled=current===sheets.length;
 $('viewport').scrollLeft=$('viewport').scrollTop=0;setZoom(0);renderPins();renderTask();feedback('');document.title=number+'번 '+s.title+' | IEC 원도면 독해실';
}
function openPage(){
 const h=/^#sheet-(\d{1,2})$/.exec(location.hash);const query=new URLSearchParams(location.search).get('sheet');
 const n=Number(h?h[1]:query);current=Number.isInteger(n)&&n>=1&&n<=sheets.length?n:1;reset();
}
function go(n){if(n<1||n>sheets.length)return;const hash='#sheet-'+idFor(n);if(location.hash===hash)openPage();else location.hash=hash}
$('ask').tabIndex=-1;
$('zminus').onclick=()=>setZoom(Math.max(0,zoom-1));$('zplus').onclick=()=>setZoom(Math.min(scaleSteps.length-1,zoom+1));
$('hint').onclick=()=>{assisted=true;const s=sheets[current-1],p=s.points[s.wanted];$('hinttext').hidden=false;$('hinttext').textContent=stage===1?s.hint+' 확대 화면에서 '+p.tag+' 표기를 찾아보세요.':s.why;if(stage===1)setZoom(2,s.wanted)};
$('restart').onclick=reset;$('prev').onclick=()=>go(current-1);$('next').onclick=()=>go(current+1);
$('continue').onclick=()=>{if(current<sheets.length)go(current+1);else{const r=document.querySelector('.roster');r.open=true;r.scrollIntoView();r.querySelector('summary').focus()}};
$('sheet-select').replaceChildren(...sheets.map((s,i)=>new Option(idFor(i+1)+'　'+s.title,String(i+1))));$('sheet-select').onchange=e=>go(Number(e.target.value));
window.addEventListener('hashchange',openPage);window.addEventListener('storage',e=>{if(e.key===masteryKey){mastery=stored();showInventory()}});
mastery=stored();showInventory();openPage();
