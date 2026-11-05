import {glossary,termTargets} from './cleanroom-project.mjs';
import {glossary as sharedGlossary} from './classroom-project.mjs';
import {bayCalculationTerms} from './cleanroom-lessons.mjs';
const rows=[
 ['wall-panel','벽 패널','실내 공간을 나누고 둘러싸는 벽 부재입니다. 표면재와 안쪽 심재가 겹쳐 있으며, 전기를 나누는 분전반과는 다른 부재입니다.','materials','west-high','M-301'],
 ['plan','평면도','공간을 위에서 읽는 도면입니다. 전실·작업구역과 두 출입구의 관계를 찾습니다.','building','room-work','A-301'],
 ['section','단면도','정한 선으로 건물을 잘라 높이를 읽습니다. 진한 면은 잘린 부재, 옅은 면은 그 뒤의 부재입니다.','building','slab','A-302'],
 ['elevation','입면도','건물을 한쪽에서 바라본 모습입니다. 전면 패널의 폭과 높이를 실제 입체 부재와 비교합니다.','building','south-wall','A-304'],
 ['opening','창호','문과 창을 함께 부르는 말입니다. 표의 폭·높이는 같은 모델에서 읽으며, 열린 문짝의 위치와 통과할 개구부를 구별합니다.','building','partition-door','A-305'],
 ['ceiling','천장과 천장 속 공간','실내 마감 패널 위에 배관과 팬 설비가 놓입니다. 천장 도면의 FFU 위치와 단면의 설치 높이를 함께 읽습니다.','building','FFU1','A-303'],
 ['panel','분전반','들어온 전력을 차단기별로 나누어 공급합니다. DB3의 CL 조명과 CF 팬은 서로 다른 분기입니다.','electrical','DB3','E-302'],
 ['breaker','차단기','전류가 지나치게 커질 때 회로를 끊는 보호기기입니다. 수업은 부하전류·정격·허용전류 크기를 비교하며 실제 차단시간이나 누전 동작은 해석하지 않습니다.','electrical','DB3','E-302'],
 ['conduit','전선관','전선을 보호하고 지나갈 경로를 정하는 관입니다. 분전반에서 올라가 천장을 거쳐 기구로 내려오는 길이를 3D 좌표에서 구합니다.','electrical','FFU1','E-301'],
 ['ground','보호접지 PE','고장 때 노출 금속부의 위험을 줄이는 보호 경로입니다. 정상 부하전류가 돌아오는 중성선과 구분합니다. 이 회로도는 기능 관계를 배우는 모형입니다.','electrical','DB3','E-302'],
 ['load','전기 부하','전기에너지를 사용하는 기구입니다. 조명과 팬의 입력전력을 더하되 팬 풍량과 혼동하지 않습니다.','electrical','FFU1','E-301'],
 ['drop','전압강하','전선에 저항이 있어 기구까지 가는 동안 줄어드는 전압입니다. 길이·전류·단면적을 바꾸어 비교합니다.','electrical','FFU1','E-301'],
 ['cover','피복 두께','콘크리트 표면부터 철근 표면까지의 거리입니다. 철근 중심까지의 거리는 피복에 반지름을 더합니다.','structure','slab','S-301'],
 ['spacing','철근 지름과 간격','D13 @200은 명목지름 13 mm, 중심 간격 200 mm입니다. 이 수업의 폭 1 m 띠에는 같은 방향 주철근 5개가 들어갑니다.','structure','slab','S-301'],
 ['slab','바닥판','무게를 받아 지지부로 전달하는 판입니다. 표면 마감과 구조 콘크리트를 구분해 읽습니다.','structure','slab','S-301'],
 ['detector','연기감지기','연기에 따른 변화를 감지해 수신기로 알립니다. 기구 배치 보기와 연기를 만드는 작동 체험은 서로 다른 화면입니다.','fire','SD3','F-301'],
 ['extinguisher','소화기','초기에 작고 제한된 불에 대응하는 기구입니다. 수업에서는 알림·대피로 확인 후 안전핀·조준·분사·좌우 쓸기 순서를 연습합니다.','fire','FE3','F-301'],
 ['fire-alarm','시청각 경보장치','수신기의 출력에 따라 빛과 소리로 위험을 알립니다. 주전원과 예비전원이 모두 꺼지면 입력이 있어도 동작하지 않는 모형입니다.','fire','ALM3','F-301'],
 ['escape','피난 동선','작업구역에서 전실 문과 외부 문을 지나 바깥으로 이동하는 길입니다. 수업 표시선은 실제 화재의 안전한 경로를 자동 판정하지 않습니다.','fire','EX3','F-301'],
 ['esd','정전기 분산 마감','정전하가 쌓이는 것을 줄이기 위한 재료층입니다. 이름만으로 성능이 보장되지 않으며 실제 설비는 접지 연결과 저항 측정이 필요합니다.','materials','tile-5-4','M-302'],
 ['filter','필터와 청정도','필터는 공기 속 입자를 포집합니다. 팬의 전원이 켜졌다는 사실만으로 청정도 등급이 확보되는 것은 아닙니다. 이 수업은 전원과 장치 위치를 다룹니다.','electrical','FFU1','E-301']
];
export const bayTerms=new Map(Object.entries(glossary).filter(([id])=>id!=='power').map(([id,[term,definition]])=>[id,{id,term,plain:definition,definition:'',target:termTargets[id]}]));
for(const t of bayCalculationTerms)bayTerms.set(t.id,{...t});
for(const [id,term,plain,menu,target,sheet]of rows)bayTerms.set(id,{id,term,plain,definition:'',target:{menu,id:target,sheet}});
bayTerms.set('rebar-drawing',{...sharedGlossary.find(t=>t.id==='rebar-drawing'),sheet:'S-301',element:'slab',target:{menu:'structure',id:'slab',sheet:'S-301'}});
