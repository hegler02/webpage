// Words a reader meets in the Yumin museum sample, each tied to the place in the drawings and the model where it can be seen.
import {panel,circuits,equipment} from './yumin-project.mjs';
import {electricalTagTerms} from './electrical-tags.mjs';

const rows=[
 ['reconstruction','재구성 모델','drawing','공개된 면적·층수와 현장 사진을 읽어 다시 그린 학습용 모델입니다. 고른 부재마다 문헌 치수·사진 판독·추정 가운데 어디에서 온 값인지 표시합니다.','building','slab-b1','A-801'],
 ['plan','평면도','drawing','바닥에서 1.2 m쯤 위를 수평으로 잘라 내려다본 도면입니다. 지하 1층과 1층을 한 장씩 그리며, 네모 안에 열십자로 벽을 세운 모습이 보입니다.','building','room-ne','A-801'],
 ['section','종단면도','drawing','건물을 남북으로 잘라 높이를 읽는 도면입니다. 땅 위로는 낮게 보이지만 지하 바닥이 땅 아래 4.60 m까지 내려간 것이 보입니다.','building','room-ne','A-803'],
 ['four-square','田자 평면','drawing','정사각형을 열십자 벽으로 넷으로 나눈 구성입니다. 가운데에 둥근 방을 두고 네 칸이 그 둘레를 돕니다.','building','room-round','A-801'],
 ['sunken','땅에 묻은 건물','drawing','바닥을 땅 아래로 내려 지붕만 낮게 드러낸 구성입니다. 바람 센 섭지코지에서 건물이 풍경을 가리지 않습니다.','building','room-lobby','A-803'],
 ['ramp','경사로','drawing','계단 없이 비스듬히 오르내리는 길입니다. 콘크리트 네모와 현무암 벽 사이를 돌아 지하 입구까지 4.60 m를 내려갑니다.','building','room-ramp','A-801'],
 ['water-passage','물의 통로','drawing','돌의 문에서 북쪽 전망 마당까지 곧게 뻗은 바깥 길입니다. 양쪽 현무암 벽을 타고 물이 흘러내립니다.','building','room-passage','A-802'],
 ['water-wall','벽천폭포','drawing','벽을 타고 얇게 흘러내리는 물입니다. 펌프가 아래 물길의 물을 벽 꼭대기로 다시 올려 보냅니다.','materials','fall-water-ne','M-801'],
 ['borrowed-view','가벽과 차경','drawing','벽에 낸 긴 틈으로 먼 풍경을 그림처럼 끌어들이는 방법입니다. 북쪽 가벽의 틈에 바다 건너 성산일출봉이 담깁니다.','building','screen','A-802'],
 ['round-room','둥근 방','drawing','네모 한가운데 놓인 지름 12 m의 둥근 전시실입니다. 둥근 벽이 1층 바닥 판을 받칩니다.','building','room-round','A-801'],
 ['ceiling-height','낮은 천장과 높은 천장','drawing','지하 전실의 천장은 바닥 위 3.60 m, 동쪽 두 전시실은 지붕 밑까지 8.95 m입니다. 낮은 곳을 지나 높은 방에 들어서게 했습니다.','building','ceiling-n','A-803'],
 ['stone-garden','돌담과 정원','drawing','돌의 문까지 가는 길가의 세 정원입니다. 낮은 현무암 돌담이 바람을 걸러 줍니다.','building','garden-wind','A-801'],
 ['roof-beam','지붕 보','structure','높은 전시실 위를 벽에서 벽까지 11.60 m 건너는 철근콘크리트 보입니다. 전시실마다 세 개가 2.80 m 간격으로 놓입니다.','structure','beam-ne-1','S-801'],
 ['simple-beam','단순보','structure','양끝이 받침 위에 걸쳐 있다고 보는 보입니다. 가운데에서 가장 크게 휘고 아랫면이 당겨집니다.','structure','beam-ne-2','S-802'],
 ['bearing-wall','내력벽','structure','위에서 내려오는 무게를 받아 기초로 전하는 벽입니다. 이 건물에는 기둥이 없고 두께 0.40 m 콘크리트 벽이 지붕과 바닥을 받칩니다.','structure','part-ne-x','S-801'],
 ['slab','바닥 판과 지붕 판','structure','사람과 가구, 눈비의 무게를 받아 보와 벽으로 넘기는 철근콘크리트 판입니다. 지붕 판 두께는 0.25 m입니다.','structure','roof-ne','S-801'],
 ['parapet','난간벽','structure','바닥 가장자리를 세워 올린 낮은 벽입니다. 통로와 전망 마당의 난간벽은 높이 1.50 m로 눈높이를 가립니다.','structure','rail-deck','S-801'],
 ['deflection','처짐','structure','무게를 받은 보나 판이 아래로 휘어 내려가는 양입니다. 길게 건널수록 크게 늘어서 보를 깊게 만듭니다.','structure','beam-ne-2','S-802'],
 ['span-depth','보 깊이와 건너는 길이','structure','보의 깊이를 건너는 길이의 몇 분의 일로 잡는지 보는 어림값입니다. 이 보는 11.60 m에 깊이 1.15 m로 10분의 1쯤입니다.','structure','beam-ne-1','S-802'],
 ['exposed-concrete','노출 콘크리트','materials','거푸집을 뗀 면을 그대로 마감으로 쓰는 콘크리트입니다. 거푸집 널의 줄눈과 폼타이 구멍이 무늬가 됩니다.','materials','core-e','M-801'],
 ['form-tie','폼타이 구멍','materials','마주 선 거푸집을 붙잡던 쇠막대를 뺀 자리입니다. 일정한 간격으로 남겨 벽의 무늬로 씁니다.','materials','core-e','M-801'],
 ['basalt','제주 현무암 쌓기','materials','구멍이 많은 검은 화산돌을 켜켜이 쌓은 벽입니다. 콘크리트 네모를 바깥에서 둘러 바람과 눈길을 막습니다.','materials','basalt-e','M-801'],
 ['slit-window','띠 창','materials','벽 위쪽에 가로로 길게 낸 좁은 창입니다. 전시물에 직접 닿지 않는 빛이 벽을 타고 내려옵니다.','materials','glass-slit-n','M-801'],
 ['frosted-glass','반투명 유리','materials','빛은 통과시키고 모습은 흐리게 하는 유리입니다. 세 별관은 밤에 등불처럼 빛납니다.','materials','annex-ne-glass-s','M-801'],
 ['glass-wall','유리벽','materials','가는 강철 틀에 큰 유리를 끼운 벽입니다. 1층 홀과 라운지가 물의 통로 쪽으로 열립니다.','materials','glass-hall','M-801'],
 ['panel','분전반','electrical','들어온 전기를 회로별로 나누고 차단기로 보호하는 함입니다. 지하 전기실 벽에 있습니다.','electrical',panel.id,'E-802'],
 ['circuit','분기 회로','electrical','분전반의 차단기 하나에서 나가는 전기 길입니다. 조명 넷, 콘센트 둘, 공조기와 펌프 하나씩 여덟 회로로 나눴습니다.','electrical',panel.id,'E-802'],
 ['breaker','차단기','electrical','정해진 전류를 넘으면 회로를 끊는 장치입니다. 차단기 정격은 부하 전류보다 크고 전선이 견디는 전류보다 작게 고릅니다.','electrical',panel.id,'E-802'],
 ['conduit','매입 배관','electrical','콘크리트를 치기 전에 벽과 바닥 판 속에 묻어 두는 전선 길입니다. 노출 콘크리트 벽에는 나중에 길을 낼 수 없어서 미리 자리를 정합니다.','electrical','LT1','E-801'],
 ['drop','전압강하','electrical','전선을 지나며 전압이 줄어드는 양입니다. 길수록, 전류가 클수록, 전선이 가늘수록 커집니다.','electrical',panel.id,'E-802'],
 ['three-phase','3상 전원','electrical','세 가닥의 교류가 시간 차를 두고 흐르는 전원입니다. 공조기와 펌프의 전동기는 380 V 3상을 씁니다.','electrical','AHU1','E-802'],
 ['illuminance','조도','electrical','면에 닿는 빛의 양이며 단위는 럭스입니다. 전시실 전반의 목표 조도를 정하고 조명 개수를 계산합니다.','electrical','LT1','E-801'],
 ['floor-box','바닥 콘센트','electrical','바닥에 묻은 함 안의 콘센트입니다. 방 한가운데 전시대에는 벽이 멀어서 전선이 바닥 판 속으로 갑니다.','electrical','FB1','E-801'],
 ['ahu','공조기','electrical','바깥 공기를 걸러 데우거나 식혀 방으로 보내는 기계입니다. 이 건물에서 전기를 가장 많이 씁니다.','electrical','AHU1','E-801'],
 ['pump','순환 펌프','electrical','벽천폭포의 물을 아래 물길에서 벽 꼭대기로 다시 올리는 펌프입니다. 전원을 끄면 물이 멈춥니다.','electrical','PU1','E-801'],
 ['occupancy','수용인원','fire','그 건물에 한 번에 들어올 수 있다고 보는 사람 수입니다. 전시장은 바닥면적 합계를 4.6 m²로 나누며, 이 건물은 258명입니다.','fire','FR1','F-801'],
 ['fire-zone','경계구역','fire','불이 난 곳을 수신기에서 구별하도록 나눈 구역입니다. 지하 동쪽, 지하 서쪽, 1층 세 곳으로 나눴습니다.','fire','FR1','F-801'],
 ['smoke-detector','연기감지기','fire','연기를 잡아 수신기로 신호를 보내는 감지기입니다. 천장이 높을수록 하나가 맡는 면적이 줄어듭니다.','fire','SD3','F-801'],
 ['receiver','수신기','fire','감지기와 발신기의 신호를 받아 어느 구역인지 알리고 경보를 울리는 장치입니다. 지하 직원실 벽에 있습니다.','fire','FR1','F-801'],
 ['callpoint','발신기','fire','불을 본 사람이 눌러 수신기에 알리는 누름 단추입니다. 경계구역마다 하나씩 있습니다.','fire','CP1','F-801'],
 ['visual-alarm','경종과 시각경보기','fire','소리와 번쩍이는 빛으로 불을 알리는 장치입니다. 소리를 듣기 어려운 사람도 알아챌 수 있습니다.','fire','BL1','F-801'],
 ['sprinkler','스프링클러','fire','천장의 헤드가 열에 터져 물을 뿌리는 설비입니다. 헤드 하나가 수평거리 2.3 m 안을 맡습니다.','fire','SP1','F-801'],
 ['hydrant','옥내소화전','fire','호스를 꺼내 사람이 직접 물을 뿌리는 설비입니다. 함 안에 호스와 노즐이 들어 있습니다.','fire','HY1','F-801'],
 ['exit-light','유도등','fire','나가는 문과 가는 방향을 알리는 초록 등입니다. 정전에도 켜지도록 제 몸에 축전지가 있습니다.','fire','EX1','F-801'],
 ['emergency-light','비상조명등','fire','정전이 되면 축전지로 켜져 바닥을 밝히는 등입니다. 창이 없는 지하층에 둡니다.','fire','EL1','F-801'],
 ['extinguisher','소화기','fire','사람이 들고 처음 불을 끄는 기구입니다. 어디서든 걸어서 20 m 안에 하나가 있게 놓습니다.','fire','FE1','F-801'],
 ['escape','피난 경로','fire','불이 났을 때 밖으로 나가는 길입니다. 지하 전시실에서 전실을 지나 지하 입구로 나가 경사로를 오릅니다.','fire','EX1','F-801'],
 ['envelope','외피','calculation','실내와 바깥을 나누는 벽·지붕·창입니다. 외피로 빠져나가는 열이 난방과 냉방의 크기를 정합니다.','energy',null,null],
 ['u-value','열관류율','calculation','벽이나 창 1 m²가 온도 차 1도마다 통과시키는 열의 양입니다. 값이 작을수록 열이 덜 샙니다.','energy',null,null],
 ['solar-gain','일사 취득','calculation','유리를 지나 실내로 들어오는 햇빛의 열입니다. 겨울에는 난방을 돕고 여름에는 냉방을 늘립니다.','energy',null,null],
 ['ground-coupling','땅과 맞닿은 벽','calculation','흙에 묻힌 벽과 바닥입니다. 땅속 온도는 바깥 공기보다 덜 오르내려 겨울에 덜 식고 여름에 덜 데워집니다.','energy',null,null]
];
export const yuminTerms=new Map(rows.map(([id,term,category,plain,menu,target,sheet])=>[id,{id,term,category,plain,definition:'',target:target?{menu,id:target,sheet}:{menu}}]));
for(const t of electricalTagTerms({panel,circuits,devices:equipment},{circuitSheet:'E-802',lightingSheet:'E-801',powerSheet:'E-801'}))yuminTerms.set(t.id,t);

// Which word explains the thing a reader has just selected.
export function termFor(d){
 if(!d)return null;
 if(/^room-/.test(d.id))return ({'room-ramp':'ramp','room-passage':'water-passage','room-deck':'borrowed-view','room-round':'round-room'})[d.id]??'plan';
 if(d.kind==='water')return 'water-wall';
 if(d.kind==='beam')return 'roof-beam';
 if(d.kind==='wall')return d.id==='screen'?'borrowed-view':/^(basalt|gate|fall)/.test(d.id)?'basalt':/^drum/.test(d.id)?'round-room':/^part/.test(d.id)?'bearing-wall':'exposed-concrete';
 if(d.kind==='parapet')return 'parapet';
 if(d.kind==='window-glass')return /slit|lamp/.test(d.id)?'slit-window':/^annex/.test(d.id)?'frosted-glass':'glass-wall';
 if(d.kind==='frame')return 'glass-wall';
 if(d.kind==='floor')return /^ramp/.test(d.id)?'ramp':d.id==='deck-passage'?'water-passage':'slab';
 if(d.kind==='roof')return 'slab';
 if(d.kind==='ceiling')return 'ceiling-height';
 if(d.kind==='stair')return 'section';
 if(d.kind==='paving'||d.kind==='finish'||d.kind==='stone')return 'stone-garden';
 if(d.kind==='panel')return 'panel';
 if(d.kind==='light')return 'illuminance';
 if(d.kind==='ahu')return 'ahu';
 if(d.kind==='pump')return 'pump';
 if(d.kind==='socket')return d.id.startsWith('FB')?'floor-box':'circuit';
 if(d.circuit)return 'circuit';
 return ({smoke:'smoke-detector',receiver:'receiver',callpoint:'callpoint',bell:'visual-alarm',sprinkler:'sprinkler',hydrant:'hydrant',exit:'exit-light',emergency:'emergency-light',extinguisher:'extinguisher'})[d.kind]??'reconstruction';
}
