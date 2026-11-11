// Words a reader meets in the Salk sample, each tied to the place in the drawings and the model where it can be seen.
import {panel,circuits,equipment} from './salk-project.mjs';
import {electricalTagTerms} from './electrical-tags.mjs';

const rows=[
 ['reconstruction','재구성 모델','drawing','공개된 치수와 사진을 읽어 다시 그린 학습용 모델입니다. 고른 부재마다 문헌 치수·사진 판독·추정 가운데 어디에서 온 값인지 표시합니다.','building','lab2-floor','A-501'],
 ['plan','배치도와 평면도','drawing','위에서 내려다본 도면입니다. 두 동이 중정을 사이에 두고 마주 보고, 물길이 서쪽 바다를 향합니다.','building','court-water','A-501'],
 ['section','횡단면도','drawing','건물을 남북으로 잘라 높이를 읽는 도면입니다. 실험실과 설비층이 번갈아 세 번 쌓인 모습이 보입니다.','building','pipe2-floor','A-502'],
 ['served-servant','쓰는 공간과 돕는 공간','drawing','루이스 칸이 나눈 두 가지 공간입니다. 사람이 일하는 실험실이 쓰는 공간이고, 배관과 덕트가 지나는 설비층과 계단탑이 돕는 공간입니다.','structure','pipe2-floor','S-502'],
 ['pipe-space','설비층','structure','실험실 천장 위에 한 층을 통째로 비워 둔 설비 공간입니다. 높이 2.74 m라서 사람이 서서 배관을 고칠 수 있고, 실험실을 멈추지 않고 설비를 바꿉니다.','structure','pipe2-floor','S-502'],
 ['vierendeel','비렌딜 트러스','structure','대각선 부재 없이 위아래 현재와 수직재만으로 짠 트러스입니다. 네모난 구멍이 생겨 배관과 사람이 지나갑니다. 이 건물에서는 춤 2.74 m로 19.8 m를 건넙니다.','structure','truss2-6','S-501'],
 ['span','경간','structure','보나 트러스가 받침 사이를 건너는 거리입니다. 실험실은 19.8 m를 가운데 기둥 없이 건너서 실험대를 자유롭게 놓습니다.','structure','truss2-6','S-501'],
 ['slot','천장 슬롯','structure','설비층 바닥에 낸 길쭉한 구멍입니다. 폭 254 mm, 1.52 m 간격이며 배관과 전선이 이 틈으로 실험실에 내려옵니다.','structure','pipe2-floor','S-502'],
 ['light-well','아래 뜰','drawing','땅을 파서 만든 뜰입니다. 지면보다 낮은 하층 실험실에도 햇빛이 들어옵니다.','building','room-well','A-501'],
 ['study-tower','연구실 탑','drawing','실험실에서 다리로 이어진 작은 연구실 탑입니다. 벽을 45도 틀어 모든 방이 바다를 봅니다.','building','tower3-up-teak','A-501'],
 ['exposed-concrete','노출 콘크리트','materials','거푸집을 뗀 면을 그대로 마감으로 쓰는 콘크리트입니다. 거푸집 이음과 고정 구멍이 무늬로 남습니다.','materials','end-w','M-501'],
 ['teak','티크 창벽','materials','연구실 탑의 창과 덧문을 짠 티크 목재 벽입니다. 바닷바람에 은회색으로 바랩니다.','materials','tower3-up-teak','M-501'],
 ['travertine','트래버틴','materials','구멍이 많은 석회암 계열의 돌입니다. 중정 바닥에 깔려 콘크리트와 비슷한 밝기로 빛을 받습니다.','materials','court-paving','M-501'],
 ['panel','분전반','electrical','들어온 전기를 회로별로 나누고 차단기로 보호하는 함입니다. 이 칸의 분전반은 트러스 아래 기둥 옆에 있습니다.','electrical','LP2','E-502'],
 ['circuit','분기 회로','electrical','분전반의 차단기 하나에서 나가는 전기 길입니다. 조명·콘센트·배기 팬·공조기 팬을 따로 나눠 한쪽이 꺼져도 다른 쪽이 살아 있습니다.','electrical','LP2','E-502'],
 ['breaker','차단기','electrical','정해진 전류를 넘으면 회로를 끊는 장치입니다. 차단기 정격은 부하 전류보다 크고 전선 허용전류보다 작아야 합니다.','electrical','LP2','E-502'],
 ['drop','전압강하','electrical','전선을 지나며 전압이 줄어드는 양입니다. 길수록, 전류가 클수록, 전선이 가늘수록 커집니다.','electrical','AHU1','E-502'],
 ['three-phase','3상 전원','electrical','세 가닥의 교류가 시간 차를 두고 흐르는 전원입니다. 공조기 팬 같은 큰 전동기는 380 V 3상으로 돌립니다.','electrical','AHU1','E-502'],
 ['illuminance','조도','electrical','면에 닿는 빛의 양이며 단위는 럭스입니다. 실험대 위를 500 lx로 잡고 조명 수를 구했습니다.','electrical','LR3','E-501'],
 ['fume-hood','흄후드','electrical','해로운 기체를 빨아들여 밖으로 내보내는 실험 장치입니다. 배기 팬은 따로 회로를 두어 조명이 꺼져도 돕니다.','electrical','EF1','E-501'],
 ['detector','연기감지기','fire','천장에서 연기를 감지해 수신기에 신호를 보내는 기구입니다.','fire','SD5','F-501'],
 ['receiver','수신기','fire','감지기와 발신기의 신호를 받아 어느 구역인지 표시하고 경종을 울리는 장치입니다.','fire','FR1','F-501'],
 ['zone','경계구역','fire','화재가 난 곳을 구분해 알리려고 나눈 구역입니다. 하나의 넓이는 600 m² 이하, 한 변은 50 m 이하로 잡아 한 층을 셋으로 나눴습니다.','fire','SD5','F-501'],
 ['sprinkler','스프링클러','fire','열을 받으면 열려 물을 뿌리는 헤드입니다. 한 칸에 14개, 한 층에 168개를 놓았습니다.','fire','SP1','F-501'],
 ['hydrant','옥내소화전','fire','사람이 호스를 꺼내 불을 끄는 설비입니다. 복도 쪽 벽에 발신기·경종과 함께 둡니다.','fire','HY2','F-501'],
 ['exit','유도등','fire','피난구와 피난 방향을 알리는 등입니다. 정전에도 내장 전지로 켜집니다.','fire','EX3','F-501'],
 ['envelope','외피','calculation','실내와 바깥을 나누는 벽·지붕·창입니다. 외피로 빠져나가는 열이 난방과 냉방의 크기를 정합니다.','energy',null,null],
 ['u-value','열관류율','calculation','벽이나 창 1 m²가 온도 차 1도마다 통과시키는 열의 양입니다. 값이 작을수록 열이 덜 샙니다.','energy',null,null],
 ['ventilation-load','환기 부하','calculation','바깥 공기를 들여와 데우거나 식히는 데 드는 열입니다. 실험실은 공기를 자주 바꿔서 이 값이 외피보다 큽니다.','energy',null,null]
];
export const salkTerms=new Map(rows.map(([id,term,category,plain,menu,target,sheet])=>[id,{id,term,category,plain,definition:'',target:target?{menu,id:target,sheet}:{menu}}]));
for(const t of electricalTagTerms({panel,circuits,devices:equipment},{circuitSheet:'E-502',lightingSheet:'E-501',powerSheet:'E-501'}))salkTerms.set(t.id,t);

// Which word explains the thing a reader has just selected.
export function termFor(d){
 if(!d)return null;
 if(d.kind==='truss')return 'vierendeel';
 if(/^pipe\d-floor$/.test(d.id))return 'slot';
 if(d.group==='pipe'||d.id==='room-pipe')return 'pipe-space';
 if(d.id==='room-well'||d.group==='pit')return 'light-well';
 if(d.group==='tower'||d.id==='room-tower')return d.kind==='finish'?'teak':'study-tower';
 if(d.kind==='paving')return 'travertine';
 if(d.kind==='panel')return 'panel';
 if(d.kind==='light')return 'illuminance';
 if(d.kind==='fan')return 'fume-hood';
 if(d.kind==='ahu')return 'three-phase';
 if(d.circuit)return 'circuit';
 return ({smoke:'detector',receiver:'receiver',sprinkler:'sprinkler',hydrant:'hydrant',exit:'exit',callpoint:'receiver',bell:'receiver',wall:'exposed-concrete',column:'exposed-concrete',floor:'section'})[d.kind]??'reconstruction';
}
