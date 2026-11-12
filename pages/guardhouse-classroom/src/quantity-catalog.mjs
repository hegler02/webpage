import {measureElement,lengthOf,unionRouteLength,groupQuantities} from './quantity-engine.mjs';
import {rebarSize} from './rebar-sizes.mjs';

const names={panel:'분전반',light:'천장 조명',switch:'조명 스위치',socket:'콘센트',ac:'냉방기',ffu:'팬 필터 유닛', 'task-light':'작업등',smoke:'연기감지기',heat:'열감지기','fire-panel':'수신기',receiver:'수신기',callpoint:'발신기',alarm:'경보장치',bell:'경보장치','exit-light':'유도등',exit:'유도등',emergency:'비상조명',extinguisher:'소화기',fan:'배기 팬',ahu:'공조기 팬',sprinkler:'스프링클러 헤드',hydrant:'옥내소화전',cooktop:'인덕션',heatpump:'히트펌프'};
const sheets={guardhouse:{building:'A-101',structure:'S-101',fire:'F-101',light:'E-101',power:'E-102',circuit:'E-103'},apartment:{building:'A-201',structure:'S-201',fire:'F-201',light:'E-201',power:'E-202',circuit:'E-203'},cleanroom:{building:'A-301',structure:'S-301',fire:'F-301',light:'E-301',power:'E-301',circuit:'E-302'},salk:{building:'A-501',structure:'S-501',fire:'F-501',light:'E-501',power:'E-501',circuit:'E-502'},farnsworth:{building:'A-601',structure:'S-601',fire:'F-601',light:'E-601',power:'E-601',circuit:'E-602'},fallingwater:{building:'A-701',structure:'S-701',fire:'F-701',light:'E-701',power:'E-701',circuit:'E-702'}};
// Where a sample uses a device kind differently, its own word replaces the shared one.
const sampleNames={farnsworth:{light:'간접 조명',socket:'콘센트 · 바닥·부엌'},fallingwater:{light:'천장 조명 · 간접등 포함',socket:'콘센트 · 바닥·벽·조리대',smoke:'단독경보형 연기감지기',heat:'단독경보형 열감지기'}};
// A house fitted with stand-alone alarms has no signal wiring to leave uncounted.
const standalone=['farnsworth','fallingwater'];
const round=v=>Number(v.toFixed(4)),mm=v=>round(v*1000);
const longestEdge=points=>Math.max(...points.map((p,i)=>lengthOf([p,points[(i+1)%points.length]])));
const sizeText=d=>[...d.size.slice(0,2)].sort((a,b)=>b-a).concat(d.size[2]).map(mm).join(' × ')+' mm';
const hasId=(e,prefix)=>e.id.startsWith(prefix);

// The Farnsworth model is steel, stone and glass, so its parts are counted by run and by sheet rather than as poured volume.
function farnsworthBinding(e){
 const rebuilt='재구성 모형의 치수입니다. 원본 제작 도면의 물량이 아닙니다.';
 const steel=name=>({name,spec:'단면 폭 '+mm(measureElement(e).thickness)+' mm',unit:'m',measure:'length',note:rebuilt});
 const sheet=name=>({name,spec:'두께 추정',unit:'m²',measure:'plan',note:'두께를 추정한 부재라 면적으로 셉니다. '+rebuilt});
 if(e.context)return {exclude:e.kind==='floor'?'콘크리트 기초 · 땅속 치수는 추정':'유리벽 위아래 틀 · 창호 조립품'};
 if(e.kind==='window-glass')return {name:'홑판유리',spec:'두께 6.4 mm',unit:'m²',measure:'face',note:'유리 한 장씩의 입면 면적입니다. '+rebuilt};
 if(e.kind==='column')return e.id==='service-stack'?{name:'설비 원통',spec:'지름 1.2 m',unit:'개',measure:'count'}:steel((hasId(e,'col-t')?'테라스 받침 기둥':'기둥')+' · H형강');
 if(e.kind==='frame'){
  if(/-pull$/.test(e.id))return {exclude:'문 손잡이 · 창호 부속'};
  if(/fascia/.test(e.id))return steel('테두리보 · ㄷ형강');
  if(hasId(e,'girder-'))return steel('가로보 · H형강');
  if(/stringer/.test(e.id))return {name:'계단 받침 · 강판',unit:'m',measure:'length',note:'평면에 놓인 길이입니다. '+rebuilt};
  return steel(/^mullion-[sne]/.test(e.id)?'멀리언 · 강재':'창·문 틀 · 강재');
 }
 if(e.kind==='floor'||e.kind==='roof')return e.id==='dormer'?{exclude:'지붕 설비 상자 · 내부 설비 구성이 없어 산출하지 않음'}:sheet(e.id==='roofing'?'지붕 방수층':'프리캐스트 콘크리트 판');
 if(e.kind==='wall')return {exclude:'코어 덩어리 · 욕실과 설비실의 내부 구성이 없어 산출하지 않음'};
 if(e.kind==='paving')return {name:'트래버틴 석판',unit:'m²',measure:'plan',note:'석판을 깐 면적입니다. 줄눈과 자투리 여유는 넣지 않았습니다.'};
 if(e.id==='ceiling')return sheet('회반죽 천장');
 if(hasId(e,'curtain-'))return {exclude:'산둥 비단 커튼 · 걷어 둔 모양이라 천 면적을 산출하지 않음'};
 if(e.kind==='finish')return {name:hasId(e,'core-door')?'코어 문':e.name,unit:'개',measure:'count'};
 return null;
}

// Fallingwater is stacked stone and poured trays: stone and beams count as volume, trays and paving as area, sash steel as run.
function fallingwaterBinding(e){
 const rebuilt='재구성 모형의 치수입니다. 원본 제작 도면의 물량이 아닙니다.';
 const poured=name=>({name:'콘크리트 · '+name,unit:'m³',measure:'volume',note:'부재끼리 겹친 곳을 빼지 않은 부피입니다. '+rebuilt});
 if(e.context)return {exclude:e.kind==='frame'?'강철 창틀 살 · 창호 조립품':e.kind==='ceiling'?'거실 천장 마감 · 두께 추정':'벽난로 안쪽과 깔개 · 생활 소품'};
 if(e.kind==='window-glass')return {name:'판유리',spec:'한 겹',unit:'m²',measure:'face',note:'창 하나씩의 입면 면적입니다. '+rebuilt};
 if(e.kind==='frame')return {name:'강철 멀리언 · T형강',unit:'m',measure:'length',note:rebuilt};
 if(e.kind==='column')return e.id==='bolster-1'?{name:'사암 · 받침벽',unit:'m³',measure:'volume',note:rebuilt}:poured('받침벽');
 if(e.kind==='beam')return poured(/trellis/.test(e.id)?'격자 보':hasId(e,'joist-')?'뒤집힌 장선':'내민 주보');
 if(e.kind==='parapet')return poured('난간벽');
 if(e.kind==='floor'||e.kind==='roof')return e.id==='slab-1'?poured('1층 바닥 판'):{name:'콘크리트 판 · '+(e.id==='bridge-deck'?'다리':'위층과 지붕'),spec:'두께 추정',unit:'m²',measure:'plan',note:'보와 판을 한 덩어리로 그린 부재라 면적으로 셉니다. '+rebuilt};
 if(e.kind==='wall')return {name:'사암 벽 · 켜쌓기',unit:'m³',measure:'volume',note:'벽끼리 만나는 모서리를 빼지 않은 부피입니다. '+rebuilt};
 if(e.kind==='paving')return e.id==='boulder'?{exclude:'벽난로 앞 바위 · 원래 있던 암반'}:hasId(e,'entry-step-')?{name:'현관 디딤돌',unit:'개',measure:'count'}:{name:'사암 판석',unit:'m²',measure:'plan',note:'판석을 깐 면적입니다. 줄눈과 자투리 여유는 넣지 않았습니다.'};
 if(e.kind==='stair')return {name:hasId(e,'hatch-tread-')?'매달린 디딤판':hasId(e,'hatch-')?e.name:'돌 계단',unit:'개',measure:'count'};
 return null;
}

// These bindings describe the source model's components. Display-only details and
// representative construction swatches are deliberately not manufacturing objects.
export function constructionBinding(sample,e){
 if(e.kind==='ornament'||e.linePoints)return {exclude:'도면 장식선'};
 if(sample==='salk'&&(e.context||e.kind==='water'))return {exclude:e.context?'남쪽 동·주변 맥락 형상 · 북쪽 동만 산출':'중정 물길의 물 · 재료 물량 아님'};
 if(sample==='farnsworth'){const b=farnsworthBinding(e);if(b)return b;}
 if(sample==='fallingwater'){const b=fallingwaterBinding(e);if(b)return b;}
 if(sample==='cleanroom'&&e.id==='south-cut')return {exclude:'전면 벽의 절개 표시 · south-wall과 같은 벽'};
 if(['furniture','fixture'].includes(e.kind)||sample==='cleanroom'&&e.id.startsWith('leg-'))return {exclude:'가구·위생기구·소품의 부속 형상 · 조립품 명세 범위 밖'};
 if(['door','window','window-glass','hatch'].includes(e.kind))return {name:e.kind==='door'?'문짝':e.kind==='hatch'?e.name:'창·문 유리',unit:e.kind==='door'||e.kind==='hatch'?'개':'m²',measure:e.kind==='door'||e.kind==='hatch'?'count':'face'};
 if(sample==='apartment'){
  if(e.id==='apartment-floor'||e.id==='apartment-upper'||e.kind==='wall')return {name:'콘크리트 · '+(e.kind==='wall'?'외벽':e.name),unit:'m³',measure:'volume'};
  if(e.kind==='partition')return {name:'내벽 구성체',unit:'m²',measure:'face',note:'두께 120 mm 전체 벽체. 블록·양면 마감의 구성은 M-202에서 확인합니다. 욕실 접면별 마감 배분은 별도입니다.'};
  for(const [prefix,name,measure]of [['floor-impact-','바닥 완충층','plan'],['floor-insulation-','바닥 단열층','plan'],['floor-screed-','난방 모르타르','volume'],['floor-finish-','바닥 마감','plan']])if(hasId(e,prefix))return {name:name+(prefix==='floor-finish-'?(/bath|entry/.test(e.id)?' · 타일':' · 마루'):''),unit:measure==='volume'?'m³':'m²',measure};
  if(e.id==='shower')return {name:'샤워 받침',unit:'개',measure:'count'};
 }
 if(sample==='cleanroom'){
  if(e.id==='slab')return {name:'콘크리트 · 구조 바닥',unit:'m³',measure:'volume'};
  if(e.kind==='wall')return {name:'벽 패널 구성체',unit:'m²',measure:'face',note:'모형의 벽 두께별 면적. M-301의 100 mm 구성은 대표 단면이며 110 mm 벽에 일괄 적용하지 않습니다.'};
  if(hasId(e,'tile-'))return {name:'바닥 패널 · 정전기 분산 마감 포함',unit:'m²',measure:'plan',note:'실제 패널 형상의 합계 면적. 패널 사이 틈은 제외합니다. M-302: 마감 2 mm + 패널 38 mm.'};
 }
 if(sample==='salk'){
  if(['wall','floor','roof','column','truss'].includes(e.kind))return {name:'콘크리트 · '+e.name,unit:'m³',measure:'volume',note:'재구성 모형의 부피입니다. 원본 구조 도면의 물량이 아닙니다.'};
 }
 if(sample==='guardhouse'&&['wall','floor','roof','foundation','canopy','step'].includes(e.kind))return {name:(e.id.includes('blinding')?'버림콘크리트':'콘크리트')+' · '+e.name,unit:'m³',measure:'volume'};
 if(e.kind==='partition')return {name:e.name,unit:'m²',measure:'face',note:'칸막이 구성체 면적. 구성 재료의 세부 규격은 별도 지정 대상입니다.'};
 if(['ceiling','insulation','waterproof','finish','paving'].includes(e.kind)){
  const upright=e.profile||e.kind==='finish'&&!hasId(e,'floor-');
  return {name:e.name,unit:'m²',measure:e.surfaceMesh?'surface':upright?'face':'plan',note:e.kind==='finish'&&hasId(e,'finish-')?'외벽 마감 구성체 면적. 외관 색·무늬 변경을 재료 규격 변경으로 산정하지 않습니다.':''};
 }
 if(['frame','ceiling-frame','pipe'].includes(e.kind))return {name:e.name,unit:'m',measure:'length',note:'개별 형상의 장축 길이 합계. 접속구·절단 여유는 포함하지 않습니다.'};
 if(['stone','parapet'].includes(e.kind))return {name:e.name,unit:'m³',measure:'volume',note:'재질 등급을 추정하지 않은 모형 구성체 부피입니다.'};
 return {missing:'재료·산출 단위 연결 필요'};
}

export function buildQuantityReport({sample,model,electric,fire,rebar,panel=null,resolveSheet}){
 const refs=sheets[sample];if(!refs)throw new Error('지원하지 않는 수량 샘플');
 const items=[],excluded=[],ids=new Set();
 const add=item=>items.push({status:'model',note:'',spec:'',...item});
 const unique=(list,domain)=>{const result=[];for(const e of list){const key=domain+':'+e.id;if(!e.id||ids.has(key))throw new Error('중복 또는 누락된 설계 ID: '+key);ids.add(key);result.push(e);}return result;};
 const electrical=[...electric.devices];if(panel&&!electrical.some(d=>d.id===panel.id))electrical.unshift(panel);
 for(const [group,devices]of [['전기기구',unique(electrical,'electric')],['소방기구',unique(fire.devices,'fire')]])for(const d of devices){
  const circuit=electric.circuits.find(c=>c.id===d.circuit),sheet=group==='소방기구'?refs.fire:d.kind==='panel'?refs.circuit:['light','switch'].includes(d.kind)?refs.light:refs.power;
  add({group,name:sampleNames[sample]?.[d.kind]??names[d.kind]??d.name,spec:[d.watts!=null?d.watts+' W':null,d.circuit?'회로 '+d.circuit:null,d.size?sizeText(d):null].filter(Boolean).join(' · '),unit:'개',quantity:1,target:d.id,elementName:d.name,sheet,menu:group==='소방기구'?'fire':'electrical',formula:'고유 기구 ID 1개',note:d.kind==='panel'?'분전반 외함 1개. 분기 차단기는 별도 행에 표시합니다.':circuit?'기구 입력전력은 현재 설계값입니다. 켜짐·꺼짐과 무관하게 집계합니다.':''});
 }
 const panelId=electrical.find(d=>d.kind==='panel')?.id;
 for(const c of unique(electric.circuits,'circuit'))add({group:'전기기구',name:'분기 차단기',spec:c.breaker+' A · 회로 '+c.id,unit:'개',quantity:1,target:panelId,elementName:c.name,sheet:refs.circuit,menu:'electrical',formula:'등록된 분기회로별 차단기 1개',note:'극수·차단용량·제품번호는 미지정입니다. 주차단기는 별도 미산출입니다.'});
 for(const e of unique(model.elements,'element')){
  const binding=constructionBinding(sample,e);if(binding.exclude){excluded.push({id:e.id,reason:binding.exclude});continue;}
  const m=measureElement(e),ref=resolveSheet?.(e)??(e.drawingRefs?.[0]||refs.building);
  if(binding.missing||!m){add({group:'설계 보완',name:e.name,spec:e.kind,unit:'',quantity:null,status:'missing',target:e.id,elementName:e.name,sheet:ref,menu:'building',formula:'미산출',note:binding.missing??'치수 형상 없음'});continue;}
  const quantity=binding.measure==='count'?1:m[binding.measure];
  const thickness=['plan','surface'].includes(binding.measure)?e.height:m.thickness;
  add({group:'건축·마감',name:binding.name,spec:binding.spec??(binding.measure==='count'?`${mm(longestEdge(e.footprint))} × ${mm(e.height)} mm`:binding.measure==='volume'?'형상 부피':`두께 ${mm(thickness)} mm`),unit:binding.unit,quantity,target:e.id,elementName:e.name,sheet:ref,menu:'building',formula:binding.measure==='volume'?`${e.profile?'단면 순면적 × 깊이':e.surfaceMesh?'삼각면별 바닥 기준 평균 높이 × 투영 면적':'평면 순면적 × 높이'} = ${round(quantity)} m³`:binding.measure==='count'?'고유 설계 ID 1개':`${{plan:'평면 면적 − 개구부',face:'입면 면적 − 개구부',surface:'삼각면 실제 면적 합계',length:'형상 장축 길이'}[binding.measure]} = ${round(quantity)} ${binding.unit}`,note:binding.note||(binding.measure==='volume'?'모형에 있는 개구부를 공제한 부재별 부피 합계. 부재 간 접합 중첩과 발주 여유는 별도입니다.':'모형 형상 기준. 절단·시공 손실 여유는 가산하지 않았습니다.')});
 }
 const bars=unique(rebar?.bars??[],'rebar');
 for(const bar of bars){const length=lengthOf([bar.a,bar.b]),unitMass=rebarSize(bar.diameter).massPerMeter,mass=length*unitMass;
  add({group:'철근',name:`철근 D${bar.diameter}`,spec:sample==='cleanroom'?'폭 1 m 대표 띠':'직선 배근 모형',unit:'kg',quantity:mass,status:sample==='cleanroom'?'reference':'model',target:bar.parent,elementName:bar.id,locationName:model.elements.find(e=>e.id===bar.parent)?.name??bar.parent,sheet:bar.sheet??refs.structure,menu:'structure',formula:`${round(length)} m × ${unitMass} kg/m (D${bar.diameter} 단위 무게) = ${round(mass)} kg`,note:'모형 직선 길이로 계산한 이론 중량. 정착·이음·갈고리·보강근 제외.'+(sample==='cleanroom'?' 건물 전체로 확대하지 않습니다.':'')});
 }
 for(const c of electric.circuits){const routes=electric.routes.filter(r=>r.circuit===c.id),sum=routes.reduce((s,r)=>s+lengthOf(r.points),0),union=unionRouteLength(routes),target=routes[0]?.target;
  if(!target)continue;
  add({group:'배관 경로',name:'회로별 경로 합집합',spec:'회로 '+c.id,unit:'m',quantity:union,status:'reference',target,elementName:c.name,sheet:['light','switch'].includes(electrical.find(d=>d.id===target)?.kind)?refs.light:refs.power,menu:'electrical',formula:`${routes.length}개 경로 단순 합 ${round(sum)} m → 동일 직선 구간 공제 ${round(sum-union)} m → ${round(union)} m`,note:'같은 회로 안의 겹친 경로를 한 번만 셌습니다. 다른 회로는 합치지 않습니다. 관경·분기함·실제 공용관 연결이 확정되지 않아 발주 배관 길이로 합산하지 않습니다.'});
 }
 for(const [name,note]of [
  ['전선·전선관 및 접속 자재','경로는 존재하지만 구간별 관경·심수·접속점·분기함·단말 여유가 연결되지 않았습니다. 최장 경로를 전체 전선 길이로 사용하지 않습니다.'],
  ['소방 신호 배선','소방 도면의 선은 신호 관계와 피난 동선입니다. 설치 케이블의 경로·규격으로 산출하지 않습니다.'],
  ['주차단기·접지 및 부속 자재','분전반 외함과 분기회로만 집계했습니다. 주차단기 규격·접지 배선·체결 부속의 설계 명세가 필요합니다.'],
  ['전체 구성층·가구 조립품 명세','재료 단면의 대표 조각과 생활 소품은 건물 물량으로 확대하지 않습니다. 구성체를 세부 재료로 분할하려면 부재별 재료층 연결이 필요합니다.']
 ])if(!(standalone.includes(sample)&&name==='소방 신호 배선'))add({group:'설계 보완',name,quantity:null,status:'missing',unit:'',target:null,sheet:null,menu:null,formula:'미산출',note});
 return {version:1,sample,rows:groupQuantities(items),excluded,counts:{electrical:electrical.length,fire:fire.devices.length,bars:bars.length},scope:'현재 교육 설계의 모형 물량 · 참고 경로와 미산출 항목 포함 · 구매 발주서 아님'};
}
