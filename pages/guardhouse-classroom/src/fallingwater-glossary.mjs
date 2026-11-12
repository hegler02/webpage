// Words a reader meets in the Fallingwater sample, each tied to the place in the drawings and the model where it can be seen.
import {panel,circuits,equipment} from './fallingwater-project.mjs';
import {electricalTagTerms} from './electrical-tags.mjs';

const rows=[
 ['reconstruction','재구성 모델','drawing','공개된 치수와 사진을 읽어 다시 그린 학습용 모델입니다. 고른 부재마다 문헌 치수·사진 판독·추정 가운데 어디에서 온 값인지 표시합니다.','building','slab-1','A-701'],
 ['plan','평면도','drawing','바닥에서 1.2 m쯤 위를 수평으로 잘라 내려다본 도면입니다. 층마다 한 장씩 그리며, 방보다 테라스가 넓은 것이 한눈에 보입니다.','building','room-living','A-701'],
 ['section','종단면도','drawing','집을 남북으로 잘라 높이를 읽는 도면입니다. 돌탑에서 물 쪽으로 세 판이 어긋나게 내민 모습이 보입니다.','building','slab-1','A-703'],
 ['stacked-trays','어긋나게 쌓은 판','drawing','층마다 바닥 판을 다른 방향으로 내밀어 쌓은 구성입니다. 위층 테라스가 아래층의 지붕이 됩니다.','building','room-master-terrace','A-703'],
 ['terrace','테라스','drawing','방 밖으로 이어지는 지붕 없는 바닥입니다. 이 집은 실내보다 테라스가 넓고, 실내와 같은 판석을 깔았습니다.','building','room-east-terrace','A-701'],
 ['hatch','물로 내려가는 유리 덮개','drawing','거실 바닥을 뚫은 구멍과 그 위의 유리 덮개입니다. 덮개를 밀면 매달린 계단으로 물까지 내려가고 물 위의 찬 공기가 올라옵니다.','building','hatch-landing','A-703'],
 ['cantilever','캔틸레버','structure','한쪽만 받치고 다른 쪽은 허공에 내민 구조입니다. 1층 판은 받침벽에서 4.57 m를 물 위로 나갑니다.','structure','beam-1','S-701'],
 ['bolster','받침벽','structure','내민 보를 밑에서 받치는 짧고 두꺼운 벽입니다. 바위에 뿌리를 박은 네 개가 3.66 m 간격으로 섭니다.','structure','bolster-1','S-701'],
 ['cantilever-beam','내민 주보','structure','받침벽 위에서 물 쪽으로 나가는 큰 보입니다. 네 개가 판과 난간벽, 위층의 무게를 받습니다.','structure','beam-1','S-702'],
 ['inverted-joist','뒤집힌 장선','structure','바닥 판 위로 솟은 작은 보입니다. 판이 아래에 있어서 밑에서 올려다보면 매끈한 한 장으로 보입니다.','structure','joist-4','S-702'],
 ['slab','바닥 판','structure','장선 아래에 붙은 두께 0.10 m의 철근콘크리트 판입니다. 장선 사이 빈 곳 위에 나무 틀을 놓고 판석을 깝니다.','structure','slab-1','S-702'],
 ['parapet','난간벽','structure','판의 가장자리를 세워 올린 낮은 벽입니다. 난간이면서 판 끝을 붙잡는 깊은 보 노릇을 합니다.','structure','parapet-1-s','S-702'],
 ['deflection','처짐','structure','무게를 받은 보나 판이 아래로 휘어 내려가는 양입니다. 이 집의 판 끝은 지은 뒤 해마다 조금씩 더 내려앉았습니다.','structure','beam-2','S-702'],
 ['post-tensioning','후긴장','structure','굳은 콘크리트에 강연선을 넣고 당겨 미리 힘을 주는 보강입니다. 2002년에 주보 옆으로 강연선을 넣고 뒤에서 당겨 처짐을 멈췄습니다.','structure','beam-2','S-702'],
 ['trellis','격자 보','structure','지붕 없이 보만 나란히 건 구조입니다. 진입로 위와 서쪽 테라스 위에서 빛을 줄무늬로 거릅니다.','structure','trellis-1','A-702'],
 ['sandstone','포츠빌 사암','materials','현장 가까이에서 캔 사암입니다. 얇은 켜로 쌓고 돌을 줄눈보다 내밀어 바위 절벽의 결처럼 보입니다.','materials','tower-s','M-701'],
 ['ochre-concrete','황토색 콘크리트','materials','엷은 황토색을 칠한 철근콘크리트입니다. 내민 판과 난간벽에 쓰고 모서리를 둥글게 굴렸습니다.','materials','parapet-1-s','M-701'],
 ['flagstone','판석','materials','얇게 켠 사암 바닥돌입니다. 왁스를 먹여 젖은 계곡 바위처럼 빛나고 실내와 테라스가 같은 바닥으로 이어집니다.','materials','flag-1','M-701'],
 ['steel-sash','강철 창틀과 판유리','materials','붉게 칠한 가는 강철 틀에 한 겹 판유리를 끼운 창입니다. 돌벽과 만나는 곳은 틀 없이 돌의 홈에 바로 끼웠습니다.','materials','glass-s','M-701'],
 ['walnut','검은 호두나무','materials','붙박이 가구에 쓴 무늬목입니다. 결을 가로로 놓아 물가의 습기에 덜 휩니다.','materials','dining-table','M-701'],
 ['panel','분전반','electrical','들어온 전기를 회로별로 나누고 차단기로 보호하는 함입니다. 이 집의 분전반은 돌탑 맨 아래 부엌에 있습니다.','electrical','LP1','E-702'],
 ['circuit','분기 회로','electrical','분전반의 차단기 하나에서 나가는 전기 길입니다. 조명과 콘센트를 층으로 나누고 인덕션과 히트펌프는 따로 둡니다.','electrical','LP1','E-702'],
 ['breaker','차단기','electrical','정해진 전류를 넘으면 회로를 끊는 장치입니다. 차단기 정격은 부하 전류보다 크고 전선 허용전류보다 작아야 합니다.','electrical','LP1','E-702'],
 ['riser','세로 배관','electrical','층과 층을 잇는 수직 전선 길입니다. 굴뚝 뒤 돌탑 속으로 올라가 층마다 천장과 바닥 속으로 갈라집니다.','electrical','LP1','E-701'],
 ['drop','전압강하','electrical','전선을 지나며 전압이 줄어드는 양입니다. 길수록, 전류가 클수록, 전선이 가늘수록 커집니다.','electrical','LP1','E-702'],
 ['three-phase','3상 전원','electrical','세 가닥의 교류가 시간 차를 두고 흐르는 전원입니다. 히트펌프의 압축기 같은 큰 전동기는 380 V 3상으로 돌립니다.','electrical','HP1','E-702'],
 ['illuminance','조도','electrical','면에 닿는 빛의 양이며 단위는 럭스입니다. 거실 전반의 목표 조도를 정하고 조명 수를 구했습니다.','electrical','LT1','E-701'],
 ['indirect-light','간접 조명','electrical','빛을 천장에 먼저 비춰 반사된 빛으로 밝히는 방식입니다. 거실 천장의 격자 안에 조명을 숨겼습니다.','electrical','LT1','E-701'],
 ['floor-box','바닥 콘센트','electrical','바닥에 묻은 함 안의 콘센트입니다. 유리벽 앞에는 벽이 없어서 전선이 바닥 속으로 가서 가구 옆에서 올라옵니다.','electrical','FB1','E-701'],
 ['heat-pump','히트펌프','electrical','바깥 공기의 열을 퍼 올려 물을 데우는 장치입니다. 데운 물로 세 층을 덥힙니다.','electrical','HP1','E-701'],
 ['home-detector','단독경보형 감지기','fire','연기를 잡으면 제 몸에서 경보음을 내는 감지기입니다. 수신기와 신호선 없이 건전지로 움직여 주택에 씁니다.','fire','SD1','F-701'],
 ['heat-detector','열 감지기','fire','연기가 아니라 온도가 오르는 것을 잡는 감지기입니다. 조리 연기로 잘못 울리지 않게 부엌에 답니다.','fire','SD2','F-701'],
 ['extinguisher','소화기','fire','사람이 들고 처음 불을 끄는 기구입니다. 주택에는 세대마다, 층이 여럿이면 층마다 하나 이상 둡니다.','fire','FE1','F-701'],
 ['escape','피난 경로','fire','불이 났을 때 밖으로 나가는 길입니다. 2층 안방에서 계단을 내려와 현관을 지나 다리 건너편까지 갑니다.','fire','glass-door','F-701'],
 ['envelope','외피','calculation','실내와 바깥을 나누는 벽·지붕·창입니다. 외피로 빠져나가는 열이 난방과 냉방의 크기를 정합니다.','energy',null,null],
 ['u-value','열관류율','calculation','벽이나 창 1 m²가 온도 차 1도마다 통과시키는 열의 양입니다. 값이 작을수록 열이 덜 샙니다.','energy',null,null],
 ['solar-gain','일사 취득','calculation','유리를 지나 실내로 들어오는 햇빛의 열입니다. 겨울에는 난방을 돕고 여름에는 냉방을 키웁니다.','energy',null,null],
 ['thermal-bridge','열교','calculation','단열이 끊겨 열이 지름길로 빠져나가는 곳입니다. 실내 바닥이 그대로 테라스로 내민 이 집의 판이 대표적입니다.','energy',null,null]
];
export const fallingwaterTerms=new Map(rows.map(([id,term,category,plain,menu,target,sheet])=>[id,{id,term,category,plain,definition:'',target:target?{menu,id:target,sheet}:{menu}}]));
for(const t of electricalTagTerms({panel,circuits,devices:equipment},{circuitSheet:'E-702',lightingSheet:'E-701',powerSheet:'E-701'}))fallingwaterTerms.set(t.id,t);

// Which word explains the thing a reader has just selected.
export function termFor(d){
 if(!d)return null;
 if(/^room-/.test(d.id))return /terrace/.test(d.id)?'terrace':'plan';
 if(/^hatch-/.test(d.id))return 'hatch';
 if(d.kind==='column')return 'bolster';
 if(/^joist-/.test(d.id))return 'inverted-joist';
 if(/trellis/.test(d.id))return 'trellis';
 if(d.kind==='beam')return 'cantilever-beam';
 if(d.kind==='parapet')return 'parapet';
 if(d.kind==='floor'||d.kind==='roof')return d.id==='slab-1'?'slab':'stacked-trays';
 if(d.kind==='frame'||d.kind==='window-glass')return 'steel-sash';
 if(d.kind==='paving')return 'flagstone';
 if(d.kind==='wall')return 'sandstone';
 if(d.kind==='furniture')return 'walnut';
 if(d.kind==='panel')return 'panel';
 if(d.kind==='light')return 'indirect-light';
 if(d.kind==='heatpump')return 'heat-pump';
 if(d.kind==='socket')return d.id.startsWith('FB')?'floor-box':'circuit';
 if(d.circuit)return 'circuit';
 return ({smoke:'home-detector',heat:'heat-detector',extinguisher:'extinguisher'})[d.kind]??'reconstruction';
}
