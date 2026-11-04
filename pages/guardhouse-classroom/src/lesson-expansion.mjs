import {project,boundsOf} from './classroom-project.mjs';

export const extraSheets=[
 {id:'F-101',title:'소방기구·피난 배치도',plain:'감지기에서 출구까지',view:'fire-plan',mode:'fire',menu:'fire'},
 {id:'F-102',title:'화재신호·비상전원 원리도',plain:'감지·경보·정전 대응',view:'fire-signal',mode:'fire',menu:'fire'},
 {id:'M-101',title:'외벽 재료 구성도',plain:'외장·단열·콘크리트의 역할',view:'materials',mode:'materials',menu:'materials'}
];
export const sources={
 alarm:{label:'NFPC 203 · 자동화재탐지설비 (2026.3.1 시행)',url:'https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000269850'},
 inspection:{label:'한국소방안전원 · 소방시설 외관·작동 점검 서식',url:'https://www.kfsi.or.kr/information/variousForm/variousFormList.do'},
 extinguisher:{label:'인제소방서 · 소화기 점검 방법',url:'https://fire.gwd.go.kr/inje119/partici/partici_photo?articleSeq=11103942'},
 material:{label:'한국건설기술연구원 · 건축자재 품질인정 안내',url:'https://www.kict.re.kr/governmentWeb/getGovernmentContentsView.es?id=5499&mid=a10602050000&pid=87'},
 eifs:{label:'건설기술정보시스템 · 외단열 구성 사례',url:'https://www.codil.or.kr/viewDtlConWrkDtlSch.do?gubun=tch&pMetaCode=SCGCGT141669'}
};
const fireDevice=(id,name,kind,pos,size,plain)=>({id,name,kind,pos,size,plain,system:'fire',sheet:'F-101'});
export const fireDevices=[
 fireDevice('FA01','화재 수신기','fire-panel',[6.05,.255,1.545],[.3,.1,.4],'감지기·발신기의 화재신호를 받아 위치를 표시하고 경보를 보내는 장치입니다.'),
 fireDevice('SD01','경비실 연기감지기','smoke',[6.4,1.7,2.505],[.12,.12,.06],'공기 중 연기를 감지합니다. 천장 아래에 설치한 감지 원리 학습용 기구입니다.'),
 fireDevice('SD02','보관소 연기감지기','smoke',[2.5,.85,2.505],[.12,.12,.06],'보관 공간의 연기를 감지하여 수신기에 알립니다.'),
 fireDevice('HD01','탕비실 열감지기','heat',[3.3,3.15,2.505],[.12,.12,.06],'열에 반응하는 감지기입니다. 수증기로 생길 수 있는 비화재보를 비교해 배웁니다.'),
 fireDevice('MC01','출입구 수동발신기','callpoint',[5.59,.255,1.345],[.12,.07,.15],'사람이 화재를 발견했을 때 눌러 수신기에 알리는 장치입니다.'),
 fireDevice('AL01','음향·시각 경보장치','alarm',[5.9,.255,2.15],[.17,.09,.19],'수신기의 신호를 받아 소리와 빛으로 알립니다. 점등 색으로 경보 상태를 보여주며 작동 시험에서는 경보 단계에서 소리가 나며 경보음을 끄거나 다시 켤 수 있습니다.'),
 fireDevice('EX01','출입구 피난구유도등','exit-light',[5.05,.255,2.72],[.32,.08,.16],'나갈 출입구를 알려주는 녹색 유도등입니다. 정상 시에도 켜져 있습니다.'),
 fireDevice('EM01','비상조명등','emergency',[5.55,1.7,2.505],[.26,.15,.06],'일반 전원이 끊겼을 때 자체 예비전원으로 피난 통로를 밝히는 기구입니다.'),
 fireDevice('FE01','출입구 분말소화기','extinguisher',[5.82,.42,.31],[.17,.17,.5],'초기 화재에 사용하는 휴대용 소화기입니다. 위치·접근성·압력계·안전핀·외관을 살펴봅니다.')
];
export const finishes=[
 {id:'plaster',name:'밝은 미장 마감',texture:'stone',color:0xe5ded0,description:'밝은 미장 표면의 교육용 외관입니다.'},
 {id:'brick',name:'붉은 벽돌 타일',texture:'brick',color:0xffffff,description:'벽돌 모양의 20 mm 타일 마감입니다. 벽 전체가 벽돌 구조인 것은 아닙니다.'},
 {id:'stone',name:'밝은 석재 패널',texture:'marble',color:0xffffff,description:'대리석을 연상시키는 석재 패널 표면입니다. 특정 제품이나 인증 등급을 지정하지 않습니다.'}
];
export const materialLayers=[
 {id:'material-finish',name:'외장 마감',thickness:20,color:0xddd4c2,role:'비·햇빛에 노출되는 표면. 메뉴에서 외관을 바꿉니다.'},
 {id:'material-support',name:'부착·바탕층',thickness:10,color:0x9eaaa9,role:'마감과 바탕을 연결하는 교육용 구성층입니다.'},
 {id:'material-insulation',name:'단열층',thickness:70,color:0xd9be70,role:'열이 빠져나가는 것을 줄입니다. 이 예제는 미네랄울 계열을 학습 재료로 채택합니다.'},
 {id:'material-concrete',name:'철근콘크리트 외벽',thickness:200,color:0xa9b4b5,role:'지붕과 바닥의 하중을 받습니다. 콘크리트 24 MPa, 철근 400 MPa는 기존 계산서와 같습니다.'},
 {id:'material-lining',name:'실내 마감',thickness:15,color:0xeae5d8,role:'실내에서 보이는 벽 표면입니다.'}
].map((d,i)=>({...d,kind:'material-layer',system:'materials',sheet:'M-101',pos:[3+i*.42,2,1.1],size:[d.thickness/1000,1.2,2],plain:d.role}));
export const extraGlossary=[
 ['detector','감지기','연기나 열을 알아채는 장치','연기감지기와 열감지기는 감지하는 현상이 다릅니다.','전기 신호가 수신기로 전달됩니다.','SD01'],
 ['fire-panel','수신기','화재신호를 모아 알려주는 장치','감지기와 수동발신기의 입력을 받아 경보를 출력합니다.','일반 분전반과 기능·회로를 구분합니다.','FA01'],
 ['callpoint','발신기','사람이 누르는 화재 알림 장치','불을 발견한 사람이 수동으로 화재신호를 보냅니다.','전등 스위치와 구분합니다.','MC01'],
 ['exit-light','유도등','나가는 출입구를 알려주는 등','출입구 위치를 지속적으로 알려줍니다.','정전 때에도 예비전원이 필요합니다.','EX01'],
 ['emergency','비상조명등','정전 때 피난 길을 밝히는 등','일반 조명이 꺼졌을 때 피난을 돕습니다.','유도등과 비상조명등의 역할을 비교합니다.','EM01'],
 ['fire-alarm','경보장치','화재를 소리나 빛으로 알리는 장치','감지 입력, 수신 판단, 경보 출력의 흐름을 배웁니다.','수신기 출력과 연결합니다.','AL01'],
 ['extinguisher','소화기','초기 화재를 끄는 휴대용 기구','위치와 사용 가능한 상태를 함께 점검합니다.','전기기구가 아니어도 소방 배치도에 포함됩니다.','FE01'],
 ['insulation','단열재','열이 드나드는 것을 줄이는 재료','외장 표면과 단열재는 다른 층입니다.','배관 관통부와 재료의 화재 성능을 함께 봅니다.','material-insulation'],
 ['finish','외장재','건물 바깥에 보이는 마감 재료','모양이 같아도 재료와 심재가 다를 수 있습니다.','표면만 보고 화재 성능을 판정하지 않습니다.','material-finish']
].map(([id,term,plain,definition,electrical,element])=>({id,term,plain,definition,electrical,element,sheet:element.startsWith('material')?'M-101':'F-101'}));

export const inspectionItems=[
 {id:'extinguisher',category:'소방',title:'소화기를 바로 꺼낼 수 있나요?',what:'위치·표지·통로를 찾고, 실제 점검에서는 압력계·안전핀·용기 손상·제조일도 살펴봅니다.',target:'FE01',sheet:'F-101',source:'extinguisher'},
 {id:'detection',category:'소방',title:'감지 신호가 수신기와 경보까지 이어지나요?',what:'감지 시험 후 수신 표시와 경보 점등을 확인하고 복구합니다. 실제 감지기 시험은 전용 기구와 절차를 따릅니다.',target:'SD01',sheet:'F-102',source:'alarm'},
 {id:'manual',category:'소방',title:'발신기 위치와 기능을 알고 있나요?',what:'출입구 옆 발신기를 찾고 수동발신 시험을 해보세요.',target:'MC01',sheet:'F-101',source:'alarm'},
 {id:'backup',category:'소방',title:'정전에도 유도등·경보가 작동하나요?',what:'일반 전원을 끄고 예비전원을 켠 상태에서 시험합니다. 배터리 실제 용량·지속시간은 모델 밖에서 측정하는 항목입니다.',target:'EM01',sheet:'F-102',source:'inspection'},
 {id:'escape',category:'피난',title:'출구로 가는 길을 막는 물건이 없나요?',what:'각 방에서 출입구까지 따라가며 가구·적치물·문 주변을 살펴봅니다.',target:'EX01',sheet:'F-101',source:'inspection'},
 {id:'load',category:'전기',title:'전기 부하가 수업의 차단기 조건을 넘지 않나요?',what:'회로표에서 부하전류·차단기·전선 조건을 비교합니다. 접지·절연·누전보호의 실제 성능은 별도 측정 항목입니다.',target:'DB1',sheet:'E-103'},
 {id:'wet',category:'전기',title:'물 쓰는 곳의 전기기구를 구분했나요?',what:'탕비실 콘센트와 싱크대 위치를 비교하고 방수·접지·누전보호 필요성을 설명합니다.',target:'R03',sheet:'E-102'},
 {id:'pit',category:'건축',title:'PIT 점검구와 바닥 아래 공간을 찾았나요?',what:'덮개·추락·침수·누수 위험을 구분합니다. 실습 모델에서는 위치를 배우며 실제 PIT에 들어가는 활동을 지시하지 않습니다.',target:'pit-access-cover',sheet:'A-108'},
 {id:'structure',category:'구조',title:'하중이 기초까지 전달되는 길을 설명할 수 있나요?',what:'지붕판·벽·기초를 차례로 선택합니다. 균열·변형의 실제 평가는 현장 관찰이 필요합니다.',target:'footing-south',sheet:'S-102'},
 {id:'material',category:'재료',title:'외장과 단열재의 화재 성능을 따로 확인하나요?',what:'제품명·단열재·접착재·구성 전체의 시험·인정 자료를 확인하는 항목입니다. 화면의 재료색은 성능 증명이 아닙니다.',target:'material-insulation',sheet:'M-101',source:'material'}
];
export const freshExpansion=()=>({version:1,finish:'plaster',battery:true,signal:null,checks:{}});
export function restoreExpansion(raw){const s=freshExpansion();if(raw?.version!==1)return s;if(finishes.some(f=>f.id===raw.finish))s.finish=raw.finish;if(typeof raw.battery==='boolean')s.battery=raw.battery;if(fireDevices.some(d=>d.id===raw.signal&&['smoke','heat','callpoint'].includes(d.kind)))s.signal=raw.signal;for(const item of inspectionItems){const c=raw.checks?.[item.id];if(c&&['unreviewed','observed','action','na'].includes(c.state))s.checks[item.id]={state:c.state,note:String(c.note??'').slice(0,500)};}return s;}
export function fireModel(state=freshExpansion(),mains=true){
 const supplied=mains||state.battery,alarm=!!state.signal&&supplied;
 const devices=fireDevices.map(d=>({...d,on:d.kind==='exit-light'?supplied:d.kind==='emergency'?!mains&&state.battery:d.kind==='alarm'?alarm:d.kind==='fire-panel'?supplied:d.id===state.signal&&supplied,alarm,source:mains?'상용 전원':state.battery?'예비전원':'전원 없음'}));
 return {devices,alarm,supplied,mains,battery:state.battery,signal:state.signal,voltage:24,scope:'화재신호와 전원 전환을 배우는 기능 모형. 배터리 용량·배선 규격·법정 설치 대상을 판정하지 않습니다.'};
}
export function pitInfo(model){const get=id=>model.elements.find(e=>e.id===id),b=get('pit-base'),w=get('pit-west'),east=get('pit-east'),south=get('pit-south'),north=get('pit-north'),floor=get('floor'),hatch=get('pit-access-cover');return {width:boundsOf(east)[0]-boundsOf(w)[2],depth:boundsOf(north)[1]-boundsOf(south)[3],clearHeight:floor.base-(b.base+b.height),bottom:b.base+b.height,top:floor.base,hatch:boundsOf(hatch),baseThickness:b.height};}
export const indoorFov=(fov,delta)=>Math.max(40,Math.min(90,fov+Math.max(-12,Math.min(12,delta*.035))));
export function inspectionSummary(s){const counts={unreviewed:0,observed:0,action:0,na:0};for(const i of inspectionItems)counts[s.checks[i.id]?.state??'unreviewed']++;return counts;}
