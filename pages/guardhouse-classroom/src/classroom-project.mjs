import {registerWorkstation} from './teaching-equipment.mjs';
// Sample-owned teaching data. Coordinates: metres, CAD X/Y and elevation Z.
export const project = {
 id:'guardhouse-01', version:1, lightingCircuit:'L1', lightingSheet:'E-101', powerSheet:'E-102', circuitSheet:'E-103', title:'경비실', subtitle:'처음 만나는 건축과 전기',
 voltage:220, frequency:60, finishLevel:.045, eyeHeight:1.6,
 rooms:[
  {id:'guard',name:'경비실',bounds:[4.565,.215,7.985,3.785],spawn:[5.15,1.2],yaw:-.65,description:'근무자가 머무는 공간입니다. 조명·업무용 콘센트·냉방기 회로를 살펴봅니다.'},
  {id:'storage',name:'택배 보관소',bounds:[.215,.215,4.435,1.835],spawn:[3.7,1.3],yaw:1.6,description:'보관장 앞 통로와 조명, 콘센트의 위치를 살펴봅니다.'},
  {id:'pantry',name:'탕비실',bounds:[2.565,1.965,4.435,3.785],spawn:[3.65,2.45],yaw:0,description:'물을 사용하는 공간입니다. 싱크대와 전기기구의 위치를 함께 봅니다.'},
  {id:'toilet',name:'화장실',bounds:[.23,1.98,2.42,3.77],spawn:[1.5,2.55],yaw:0,description:'천장이 다른 방보다 낮습니다. 조명 높이와 출입문을 확인합니다.'}
 ],
 circuits:[
  {id:'L1',name:'실내 조명',color:'#e5ad40',breaker:10,area:1.5,ampacity:15,pf:1,rcd:30},
  {id:'R1',name:'업무·보관소 콘센트',color:'#459de0',breaker:16,area:2.5,ampacity:20,pf:1,rcd:30},
  {id:'R2',name:'탕비실 콘센트',color:'#b281d5',breaker:16,area:2.5,ampacity:20,pf:1,rcd:30},
  {id:'AC1',name:'냉방기 전용',color:'#3fb69a',breaker:16,area:2.5,ampacity:20,pf:.9,rcd:30}
 ],
 panel:{id:'DB1',name:'분전반',kind:'panel',pos:[5.85,.245,1.545],size:[.38,.12,.5],sheet:'E-103',term:'panel'},
 devices:[
  {id:'L01',name:'경비실 조명 1',kind:'light',room:'guard',circuit:'L1',switch:'SW1',pos:[5.55,2.4,2.51],size:[.6,.6,.035],watts:24,lumens:2400},
  {id:'L02',name:'경비실 조명 2',kind:'light',room:'guard',circuit:'L1',switch:'SW1',pos:[7.25,2.4,2.51],size:[.6,.6,.035],watts:24,lumens:2400},
  {id:'L03',name:'보관소 조명 1',kind:'light',room:'storage',circuit:'L1',switch:'SW2',pos:[1.6,1.25,2.51],size:[.45,.45,.035],watts:18,lumens:1800},
  {id:'L04',name:'보관소 조명 2',kind:'light',room:'storage',circuit:'L1',switch:'SW2',pos:[3.55,1.25,2.51],size:[.45,.45,.035],watts:18,lumens:1800},
  {id:'L05',name:'탕비실 조명',kind:'light',room:'pantry',circuit:'L1',switch:'SW3',pos:[3.5,2.55,2.51],size:[.4,.4,.035],watts:18,lumens:1800},
  {id:'L06',name:'화장실 조명',kind:'light',room:'toilet',circuit:'L1',switch:'SW4',pos:[1.3,2.6,2.41],size:[.3,.3,.035],watts:12,lumens:1200},
  {id:'SW1',name:'경비실 스위치',kind:'switch',room:'guard',circuit:'L1',pos:[5.67,.237,1.245],size:[.085,.035,.12]},
  {id:'SW2',name:'보관소 스위치',kind:'switch',room:'storage',circuit:'L1',pos:[4.42,.62,1.245],size:[.035,.085,.12]},
  {id:'SW3',name:'탕비실 스위치',kind:'switch',room:'pantry',circuit:'L1',pos:[4.415,3,1.245],size:[.035,.085,.12]},
  {id:'SW4',name:'화장실 스위치',kind:'switch',room:'pantry',circuit:'L1',pos:[2.585,2.9,1.245],size:[.035,.085,.12]},
  {id:'R01',name:'업무용 콘센트',kind:'socket',room:'guard',circuit:'R1',pos:[7.95,3.5,.345],size:[.035,.12,.09],watts:300},
  {id:'R02',name:'보관소 콘센트',kind:'socket',room:'storage',circuit:'R1',pos:[4.42,.43,.345],size:[.035,.12,.09],watts:300},
  {id:'R03',name:'탕비실 콘센트',kind:'socket',room:'pantry',circuit:'R2',pos:[4.415,3.4,1.145],size:[.035,.12,.09],watts:1200},
  {id:'AC01',name:'벽걸이 냉방기',kind:'ac',room:'guard',circuit:'AC1',pos:[7.82,3.55,2.245],size:[.25,.7,.25],watts:900}
 ],
 sheets:[
  {id:'A-101',title:'1층 평면도',plain:'위에서 본 방 배치',view:'plan',mode:'interior',menu:'building'},
  {id:'A-102',title:'종단면도 A-A',plain:'건물을 잘라 본 모습',view:'section',mode:'section',menu:'building'},
  {id:'A-103',title:'배면도',plain:'뒤에서 본 건물',view:'back',mode:'exterior',menu:'building'},
  {id:'A-104',title:'우측면도',plain:'오른쪽에서 본 건물',view:'right',mode:'exterior',menu:'building'},
  {id:'A-105',title:'정면도',plain:'입구 쪽에서 본 건물',view:'front',mode:'exterior',menu:'building'},
  {id:'A-106',title:'좌측면도',plain:'왼쪽에서 본 건물',view:'left',mode:'exterior',menu:'building'},
  {id:'A-107',title:'지붕 평면도',plain:'지붕과 빗물의 이동',view:'roof',mode:'roof',menu:'building'},
  {id:'A-108',title:'기초 평면도',plain:'바닥 아래 받침 구조',view:'foundation',mode:'foundation',menu:'building'},
  {id:'A-109',title:'천장 평면도',plain:'고개를 들면 보이는 천장',view:'ceiling',mode:'ceiling',menu:'building'},
  {id:'A-110',title:'창호·가구 상세',plain:'창문과 가구의 크기',view:'details',mode:'fixtures',menu:'building'},
  {id:'S-101',title:'지붕·바닥 배근도',plain:'바닥판 속 철근',view:'rebar-slab',mode:'rebar',menu:'structure'},
  {id:'S-102',title:'벽·기초 배근도',plain:'벽과 기초 속 철근',view:'rebar-wall',mode:'rebar',menu:'structure'},
  {id:'E-101',title:'조명·스위치 배치도',plain:'불이 켜지는 위치',view:'lighting',mode:'electrical',menu:'electrical'},
  {id:'E-102',title:'콘센트·전원 배치도',plain:'전기를 사용하는 위치',view:'power',mode:'electrical',menu:'electrical'},
  {id:'E-103',title:'분전반 회로도',plain:'전기가 나뉘는 길',view:'circuit',mode:'electrical',menu:'electrical'}
 ],
 steps:[
  {id:'welcome',title:'건물과 친해지기',text:'먼저 건물을 돌려 보세요. 전체 모습과 방의 위치를 알아봅니다.',menu:'building',sheet:'A-101',action:'건물 둘러보기'},
  {id:'drawing',title:'평면도와 단면도 읽기',text:'2D의 창문을 누르면 3D의 같은 창문이 선택됩니다. 단면도에서는 벽 속과 높이를 봅니다.',menu:'building',sheet:'A-102',action:'단면도 열기'},
  {id:'structure',title:'콘크리트 속 철근 보기',text:'바닥판을 누르고 철근을 살펴봅니다. 철근 지름과 간격이 계산에 어떻게 쓰이는지 확인합니다.',menu:'structure',sheet:'S-101',action:'철근 살펴보기'},
  {id:'electric',title:'전기기구와 회로 연결하기',text:'조명과 스위치를 선택하세요. 회로도에서 분전반과 연결 관계를 따라갑니다.',menu:'electrical',sheet:'E-101',action:'전기설계 열기'},
  {id:'calculate',title:'조건을 바꿔 계산하기',text:'조명 소비전력과 위치를 바꾸고 전류·배선 길이·전압강하가 함께 바뀌는지 확인합니다.',menu:'calculations',action:'계산 과정 보기'},
  {id:'experience',title:'내가 설계한 공간에 들어가기',text:'눈높이로 실내를 걸으며 벽의 스위치를 눌러보세요. 해당 방의 조명만 켜지고 꺼집니다.',menu:'experience',action:'실내 체험 시작'}
 ]
};

const workstation = registerWorkstation(project, {cabinetId:'SC1', lampId:'TL1', bounds:[7.23,2.06,7.93,2.58], outletId:'R01'});

export const glossary=[
 ['plan','평면도','위에서 잘라 내려다본 도면','방의 배치와 벽·문·창문의 위치를 표시합니다.','조명과 콘센트를 어디에 놓을지 정할 때 사용합니다.','A-101','floor'],
 ['section','단면도','건물을 잘라 옆에서 본 도면','층과 천장의 높이, 바닥 아래 공간을 확인합니다.','천장 위에 전선관이 지나갈 공간이 있는지 봅니다.','A-102','roof'],
 ['elevation','입면도','밖에서 바라본 건물','앞·뒤·옆에서 본 창문과 외벽을 그린 도면입니다.','외부 기구의 설치 높이를 이해하는 데 도움이 됩니다.','A-105','south-opening-1'],
 ['slab','슬래브','콘크리트 바닥판','층의 바닥이나 지붕을 이루는 넓은 구조판입니다.','배관이 구조판이나 철근과 겹치지 않는지 살펴봅니다.','S-101','roof'],
 ['wall','내력벽','건물의 무게를 받치는 벽','이 교육 모형에서는 외벽이 지붕의 무게를 기초로 전달합니다.','벽에 설치되는 기구와 배관의 관계를 확인합니다.','S-102','south-pier-0'],
 ['partition','칸막이','방을 나누는 벽','공간을 나누는 내부 벽입니다. 모든 벽이 같은 역할을 하지는 않습니다.','스위치·콘센트를 설치할 벽의 위치를 읽습니다.','A-101','partition-435'],
 ['foundation','기초','건물 아래 받침 구조','건물의 힘을 땅으로 전달하는 부분입니다.','지하 공간과 접지 경로를 이해하는 바탕입니다.','A-108','footing-south'],
 ['pit','PIT','바닥 아래 점검 공간','이 샘플에서는 화장실·탕비실 아래의 설비 점검 공간입니다.','사람이 머무는 방과 설비 공간을 구분합니다.','A-108','pit-base'],
 ['parapet','파라펫','지붕 가장자리의 낮은 벽','평지붕의 가장자리를 둘러싼 벽입니다.','옥상 설비를 볼 때 지붕판과 구분합니다.','A-107','parapet-west'],
 ['ceiling','천장','실내에서 위를 보면 보이는 면','천장판과 구조 지붕판 사이에는 설비 공간이 있습니다.','조명·전선관을 천장과 연결해서 배웁니다.','A-109','ceiling-guard'],
 ['ffl','FFL','마감된 바닥의 높이 기준','신발이 닿는 마감 바닥입니다. 이 샘플은 구조바닥보다 45 mm 높습니다.','스위치 1,200 mm는 마감 바닥부터 잰 높이입니다.','A-102','floor'],
 ['sfl','SFL','구조바닥의 높이 기준','마감재를 시공하기 전 콘크리트 바닥의 기준 높이입니다.','도면의 높이 기준을 혼동하지 않도록 비교합니다.','A-102','floor'],
 ['ch','천장고 CH','바닥에서 천장까지의 높이','마감 바닥부터 천장 아래까지 잰 높이입니다.','조명의 설치 높이와 실내 공간을 이해합니다.','A-109','ceiling-guard'],
 ['rebar','철근·배근','콘크리트 안에 넣는 강철 막대와 그 배치','콘크리트의 약한 인장 작용을 보완합니다. 배근은 지름·간격·방향·위치를 정하는 일입니다.','배관과 철근의 관계를 입체적으로 살펴봅니다.','S-101','roof'],
 ['rebar-drawing','배근도(철근 배치도)','콘크리트 속 철근을 어디에, 어떤 굵기와 간격으로 놓는지 보여주는 도면','배근은 철근을 배치하는 일이고, 배근도는 그 배치 방법을 그린 도면입니다. 철근의 지름·간격·방향과 위쪽·아래쪽 위치를 읽습니다. 예를 들어 D13 @200은 명목지름 13 mm인 철근의 중심 간격이 200 mm라는 뜻입니다.','전선관이 철근과 어디서 만나는지 이해할 때 함께 봅니다. 연결된 배근도와 3D에서 같은 부재의 철근을 찾아보세요.','S-101','roof'],
 ['cover','피복 두께','콘크리트 표면부터 철근 표면까지의 거리','철근 중심까지가 아닌 가장 바깥 철근 표면까지 잽니다.','배관을 놓을 때 철근과 콘크리트의 공간을 이해합니다.','S-101','roof'],
 ['spacing','D10 @150','지름 10 mm 철근을 150 mm 간격으로 배치','이 교재에서 D10은 지름 10 mm인 원형 단면으로 계산합니다. @ 뒤 숫자는 중심 사이 간격입니다.','도면의 짧은 표기를 실제 배치로 읽는 연습입니다.','S-101','roof'],
 ['panel','분전반','전기를 여러 회로로 나누는 장치','조명·콘센트·냉방기에 전기를 나누어 공급합니다.','분전반에서 회로와 기구까지 연결을 따라갑니다.','E-103','DB1'],
 ['circuit','회로','전류가 흐를 수 있는 연결','전원에서 부하로 갔다가 돌아오는 경로입니다.','스위치는 조명 회로의 전류 흐름을 열고 닫습니다.','E-103','L01'],
 ['breaker','차단기','회로를 끊어 보호하는 장치','과전류 보호와 누전 보호의 역할을 구분합니다. 이 샘플은 누전보호 겸용 차단기를 사용합니다.','스위치를 켜도 차단기가 내려가면 조명이 꺼집니다.','E-103','DB1'],
 ['conduit','전선관','전선을 보호하는 관','전선이 지나가는 물리적인 길을 만듭니다.','회로도는 연결 관계, 전선관은 실제 이동 경로를 보여줍니다.','E-101','L01'],
 ['ground','보호접지 PE','고장 때 보호장치의 동작을 돕는 연결','금속 외함 등을 보호접지 도체로 연결합니다. 정상 부하 전류의 귀로인 중성선 N과 구분합니다.','회로도의 L·N·PE를 구분해 봅니다.','E-103','DB1'],
 ['load','부하','전기에너지를 사용하는 기구','조명과 냉방기처럼 전력을 소비하는 기구입니다.','소비전력 W와 전류 A가 어떻게 연결되는지 계산합니다.','E-102','AC01'],
 ['drop','전압강하','배선을 지나며 줄어드는 전압','전선의 저항과 전류 때문에 부하 쪽 전압이 낮아집니다.','길이·굵기·전류를 바꾸며 결과를 비교합니다.','E-103','DB1'],
 ['bim','BIM','형상과 정보를 연결한 건물 모델','부재의 모양에 치수·재료·회로 등 정보를 연결해 관리합니다.','같은 기구가 도면·3D·계산에 함께 나타납니다.','E-101','L01']
].map(([id,term,plain,definition,electrical,sheet,element])=>({id,term,plain,definition,electrical,sheet,element}));

export const boundsOf=e=>{const p=e.footprint??[e.pos.slice(0,2)];return [Math.min(...p.map(p=>p[0])),Math.min(...p.map(p=>p[1])),Math.max(...p.map(p=>p[0])),Math.max(...p.map(p=>p[1]))];};
export function pointInPolygon([x,y],poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
export function insideElement(p,e){return pointInPolygon(p,e.footprint)&&!(e.holes??[]).some(h=>pointInPolygon(p,h));}
export function referencesFor(e){
 if(e.circuit||e.kind==='panel')return e.kind==='light'||e.kind==='switch'?['E-101','E-103']:['E-102','E-103'];
 if(e.kind==='rebar')return [e.sheet];
 if(e.group==='foundation')return ['A-108','S-102','A-102'];
 if(e.id==='roof'||e.id==='floor')return [e.id==='roof'?'A-107':'A-101','S-101','A-102'];
 if(e.group==='ceiling')return ['A-109','A-102'];
 if(e.group==='roof')return ['A-107','A-102'];
 if(e.group==='fixtures'||['frame','window','door','window-glass'].includes(e.kind))return ['A-101','A-110'];
 if(e.kind==='wall')return ['A-101','S-102','A-102'];
 return ['A-101','A-102'];
}
export function termFor(e){return e.kind==='rebar'?'rebar':e.kind==='panel'?'panel':e.circuit?'circuit':e.id.startsWith('pit')?'pit':e.group==='foundation'?'foundation':e.kind==='wall'?'wall':e.kind==='partition'?'partition':e.kind==='parapet'?'parapet':e.group==='ceiling'?'ceiling':['roof','floor'].includes(e.kind)?'slab':'bim';}

export function buildClassroomModel(source){
 const model=structuredClone(source);model.name='경비실 교육용 샘플 1';
 const add=(id,name,b,base,height,color,kind='furniture')=>model.elements.push({id,name,kind,group:'fixtures',footprint:[[b[0],b[1]],[b[2],b[1]],[b[2],b[3]],[b[0],b[3]]],base,height,color,educationAdded:true});
 add('study-desk','근무용 책상 상판',[6.35,3,7.75,3.68],.765,.035,0xb49a76);
 for(const [i,x,y]of [[1,6.4,3.05],[2,7.65,3.05],[3,6.4,3.58],[4,7.65,3.58]])add('desk-leg-'+i,'책상 다리',[x,y,x+.045,y+.045],.045,.72,0x293e48,'fixture');
 add('desk-monitor-base','모니터 받침',[6.87,3.32,7.17,3.52],.8,.025,0x2a3c44,'fixture');
 add('desk-monitor-stand','모니터 지지대',[6.99,3.43,7.04,3.48],.825,.17,0x2a3c44,'fixture');
 add('desk-monitor','업무용 모니터',[6.74,3.45,7.3,3.49],.92,.34,0x263d47,'fixture');
 add('desk-keyboard','키보드',[6.8,3.12,7.25,3.27],.8,.02,0x3f5158,'fixture');
 add('study-chair','근무용 의자 좌판',[6.78,2.45,7.22,2.9],.48,.06,0x436671,'fixture');
 add('chair-back','의자 등받이',[6.78,2.44,7.22,2.5],.54,.43,0x436671,'fixture');
 add('chair-post','의자 지지대',[6.97,2.65,7.03,2.71],.08,.4,0x53646b,'fixture');
 add('chair-base-x','의자 받침',[6.75,2.65,7.25,2.7],.045,.035,0x53646b,'fixture');
 add('chair-base-y','의자 받침',[6.98,2.4,7.03,2.95],.045,.035,0x53646b,'fixture');
 model.elements.push(structuredClone(workstation));
 return model;
}
