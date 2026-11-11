// Words a reader meets in the Farnsworth sample, each tied to the place in the drawings and the model where it can be seen.
import {panel,circuits,equipment} from './farnsworth-project.mjs';
import {electricalTagTerms} from './electrical-tags.mjs';

const rows=[
 ['reconstruction','재구성 모델','drawing','공개된 치수와 사진을 읽어 다시 그린 학습용 모델입니다. 고른 부재마다 문헌 치수·사진 판독·추정 가운데 어디에서 온 값인지 표시합니다.','building','floor-travertine','A-601'],
 ['plan','평면도','drawing','바닥에서 1 m쯤 위를 수평으로 잘라 내려다본 도면입니다. 유리벽 안에 코어 하나만 서 있고 나머지는 가구로 자리를 나눕니다.','building','room-living','A-601'],
 ['section','횡단면도','drawing','집을 남북으로 잘라 높이를 읽는 도면입니다. 테라스, 집 바닥, 지붕 세 판이 땅 위에 떠 있는 모습이 보입니다.','building','floor-travertine','A-602'],
 ['raised-floor','띄운 바닥','drawing','땅에서 1.60 m 들어 올린 바닥입니다. 폭스강이 넘칠 때를 대비한 높이이며, 집이 풀밭 위에 떠 보이는 까닭이기도 합니다.','building','floor-travertine','A-602'],
 ['free-plan','열린 평면','drawing','칸막이벽 없이 한 방으로 둔 평면입니다. 기둥이 유리벽 바깥에 서 있어서 실내에는 코어 말고 막힌 곳이 없습니다.','building','room-living','A-601'],
 ['core','코어','drawing','욕실 두 곳, 부엌 설비, 벽난로, 설비실을 한 덩어리로 모은 곳입니다. 배관과 전선이 여기로만 오르내려서 나머지 바닥이 비워집니다.','building','core','A-601'],
 ['wide-flange','H형강 기둥','structure','단면이 H 모양인 강재 기둥입니다. 여덟 개가 6.71 m 간격으로 서서 바닥과 지붕을 옆에서 붙잡습니다.','structure','col-s2','S-601'],
 ['channel','ㄷ형강 테두리보','structure','단면이 ㄷ 모양인 강재 보입니다. 바닥과 지붕의 가장자리를 한 바퀴 돌고, 기둥이 이 보의 바깥면에 붙습니다.','structure','floor-fascia-s','S-602'],
 ['girder','가로보','structure','두 테두리보 사이를 남북으로 건너는 보입니다. 1.68 m 간격으로 13개가 놓여 콘크리트 판과 돌 바닥을 받습니다.','structure','girder-f5','S-601'],
 ['cantilever','캔틸레버','structure','한쪽만 받치고 다른 쪽은 허공에 내민 구조입니다. 바닥과 지붕이 끝 기둥에서 1.68 m씩 더 나갑니다.','structure','floor-fascia-s','S-601'],
 ['plug-weld','플러그 용접','structure','한 강재에 구멍을 내고 그 구멍을 용접으로 메워 뒤의 강재와 붙이는 방법입니다. 메운 자리를 갈아내면 이음이 보이지 않습니다.','structure','roof-fascia-s','S-602'],
 ['precast','프리캐스트 콘크리트 판','structure','공장에서 미리 만들어 와 보 위에 얹는 콘크리트 판입니다. 바닥에서는 이 판 위에 난방 배관과 돌을 깝니다.','structure','floor-slab','S-602'],
 ['enamel-steel','흰 에나멜 강재','materials','용접 자국을 갈아낸 뒤 흰 에나멜 칠을 한 강재입니다. 이음이 보이지 않아 뼈대가 한 덩어리로 읽힙니다.','materials','col-s2','M-601'],
 ['travertine','트래버틴','materials','구멍이 많은 석회암 계열의 돌입니다. 0.61 × 0.84 m 석판이 테라스, 베란다, 실내 바닥을 같은 줄눈으로 잇습니다.','materials','floor-travertine','M-601'],
 ['plate-glass','홑판유리','materials','한 겹짜리 판유리입니다. 두께 6.4 mm로 바닥에서 천장까지 끼웠고, 겨울에는 열이 가장 많이 빠져나가는 면입니다.','materials','glass-s3','M-601'],
 ['primavera','프리마베라 합판','materials','중앙아메리카의 밝은 색 나무 프리마베라를 붙인 합판입니다. 코어의 벽을 감쌉니다.','materials','core','M-601'],
 ['panel','분전반','electrical','들어온 전기를 회로별로 나누고 차단기로 보호하는 함입니다. 이 집의 분전반은 코어의 설비실 안에 있습니다.','electrical','LP1','E-602'],
 ['circuit','분기 회로','electrical','분전반의 차단기 하나에서 나가는 전기 길입니다. 조명·콘센트·인덕션·히트펌프를 따로 나눠 한쪽이 꺼져도 다른 쪽이 살아 있습니다.','electrical','LP1','E-602'],
 ['breaker','차단기','electrical','정해진 전류를 넘으면 회로를 끊는 장치입니다. 차단기 정격은 부하 전류보다 크고 전선 허용전류보다 작아야 합니다.','electrical','LP1','E-602'],
 ['drop','전압강하','electrical','전선을 지나며 전압이 줄어드는 양입니다. 길수록, 전류가 클수록, 전선이 가늘수록 커집니다.','electrical','FB3','E-602'],
 ['three-phase','3상 전원','electrical','세 가닥의 교류가 시간 차를 두고 흐르는 전원입니다. 히트펌프의 압축기 같은 큰 전동기는 380 V 3상으로 돌립니다.','electrical','HP1','E-602'],
 ['illuminance','조도','electrical','면에 닿는 빛의 양이며 단위는 럭스입니다. 거실 전반을 60 lx로 잡고 조명 수를 구했습니다.','electrical','LT1','E-601'],
 ['indirect-light','간접 조명','electrical','빛을 천장이나 벽에 먼저 비춰 반사된 빛으로 밝히는 방식입니다. 천장에 기구를 달지 않으려고 코어와 옷장 위에 조명을 숨겼습니다.','electrical','LT1','E-601'],
 ['floor-box','바닥 콘센트','electrical','바닥에 묻은 함 안의 콘센트입니다. 벽이 없는 집이라 전선이 바닥 아래로 가서 가구 옆에서 올라옵니다.','electrical','FB3','E-601'],
 ['heat-pump','히트펌프','electrical','바깥 공기의 열을 퍼 올려 물을 데우는 장치입니다. 데운 물이 돌 바닥 아래 배관을 돌아 집을 덥힙니다.','electrical','HP1','E-601'],
 ['radiant-floor','바닥 복사 난방','electrical','바닥을 데워 그 열이 사람과 방으로 퍼지게 하는 난방입니다. 원래 집도 돌 바닥 아래에 온수 배관을 깔았습니다.','electrical','HP1','E-601'],
 ['home-detector','단독경보형 감지기','fire','연기를 잡으면 제 몸에서 경보음을 내는 감지기입니다. 수신기와 신호선 없이 건전지로 움직여 주택에 씁니다.','fire','SD1','F-601'],
 ['heat-detector','열 감지기','fire','연기가 아니라 온도가 오르는 것을 잡는 감지기입니다. 조리 연기로 잘못 울리지 않게 부엌에 답니다.','fire','SD3','F-601'],
 ['extinguisher','소화기','fire','사람이 들고 처음 불을 끄는 기구입니다. 주택에는 세대마다 하나 이상 두어야 하고, 이 집은 현관과 부엌에 둡니다.','fire','FE1','F-601'],
 ['escape','피난 경로','fire','불이 났을 때 밖으로 나가는 길입니다. 문이 서쪽 한 곳이라 잠자리에서 코어를 돌아 현관문으로 나갑니다.','fire','door-1','F-601'],
 ['envelope','외피','calculation','실내와 바깥을 나누는 벽·지붕·창입니다. 외피로 빠져나가는 열이 난방과 냉방의 크기를 정합니다.','energy',null,null],
 ['u-value','열관류율','calculation','벽이나 창 1 m²가 온도 차 1도마다 통과시키는 열의 양입니다. 값이 작을수록 열이 덜 샙니다.','energy',null,null],
 ['solar-gain','일사 취득','calculation','유리를 지나 실내로 들어오는 햇빛의 열입니다. 겨울에는 난방을 돕고 여름에는 냉방을 키웁니다.','energy',null,null]
];
export const farnsworthTerms=new Map(rows.map(([id,term,category,plain,menu,target,sheet])=>[id,{id,term,category,plain,definition:'',target:target?{menu,id:target,sheet}:{menu}}]));
for(const t of electricalTagTerms({panel,circuits,devices:equipment},{circuitSheet:'E-602',lightingSheet:'E-601',powerSheet:'E-601'}))farnsworthTerms.set(t.id,t);

// Which word explains the thing a reader has just selected.
export function termFor(d){
 if(!d)return null;
 if(/^room-/.test(d.id))return d.id==='room-core'?'core':'free-plan';
 if(/fascia/.test(d.id))return 'channel';
 if(/^girder-/.test(d.id))return 'girder';
 if(d.kind==='column')return d.id==='service-stack'?'core':'wide-flange';
 if(d.kind==='frame')return 'enamel-steel';
 if(d.kind==='window-glass')return 'plate-glass';
 if(d.kind==='paving')return 'travertine';
 if(d.kind==='wall')return 'primavera';
 if(d.kind==='floor'||d.kind==='roof')return /slab$/.test(d.id)?'precast':'section';
 if(d.kind==='panel')return 'panel';
 if(d.kind==='light')return 'indirect-light';
 if(d.kind==='heatpump')return 'heat-pump';
 if(d.kind==='socket')return d.id.startsWith('FB')?'floor-box':'circuit';
 if(d.circuit)return 'circuit';
 return ({smoke:'home-detector',heat:'heat-detector',extinguisher:'extinguisher'})[d.kind]??'reconstruction';
}
