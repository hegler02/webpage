// Calculations page shared by the masters samples (Salk, Farnsworth, Fallingwater).
// Circuit lessons read the project's own circuit table, so the page never recalculates a circuit a second way.
// The member lesson is one hand calculation of the work's signature member with stated classroom loads; it judges nothing.
import {lessonHTML,formulaHTML,calculationGlossary} from './calculation-guide.mjs';
import {routeLength,structuralConditions} from './src/learning-engine.mjs';

const n=(v,d=2)=>Number(v).toLocaleString('ko-KR',{minimumFractionDigits:d,maximumFractionDigits:d});
const s=(symbol,meaning,unit)=>({symbol,meaning,unit});
const step=(id,title,equation,value,why,theory,symbols,terms,source,unitNote)=>({id,title,equation,value,why,theory,symbols,terms,source,unitNote});
const {deadFactor,liveFactor,steelDesign,concreteWeight}=structuralConditions;
// Every line carries the rounded figure it prints, so a student gets the same number by hand.
const r2=v=>Math.round(v*100)/100,fine=v=>n(v,Math.abs(v*100-Math.round(v*100))<1e-9?2:3);

export function circuitLesson(electric,id,{panel,plan,drawing}){
 const c=electric.circuits.find(c=>c.id===id)??electric.circuits[0],three=c.phase===3;
 const route=electric.routes.filter(r=>r.circuit===c.id).reduce((a,b)=>routeLength(b.points)>routeLength(a.points)?b:a),far=electric.devices.find(d=>d.id===route.target);
 const sum=[...c.loads.reduce((m,d)=>m.set(d.watts,(m.get(d.watts)??0)+1),new Map())].map(([w,k])=>k>1?k+' × '+n(w,0):n(w,0)).join(' + ')||'0';
 const system=three?'380 V 3상 3선':'220 V 단상 2선',root=three?'√3 × ':'',rootValue=three?'1.732 × ':'';
 return {id:c.id,title:c.id+' · '+c.name,kind:'electrical',labels:{loads:'view'},target:{element:far.id,sheet:plan,drawing},circuit:c.id,
  where:panel.name+'에서 나가는 '+c.id+' 회로입니다. 기구 '+c.loads.length+'개를 맡고, 가장 먼 '+far.name+'까지 전선 길이는 '+n(c.length)+' m입니다.',
  conditions:system+', 60 Hz, 구리 전선 '+c.area+' mm², 역률 '+c.pf+'(수업값). 기구 전력은 이 건물을 오늘 한국 기준으로 다시 설계하며 정한 수업값이고 원 건물의 전기설비가 아닙니다. 수용률, 주변 온도와 복수 회로 보정, 단락·누전 보호는 다루지 않습니다.',
  result:'설계 전류 '+n(c.current)+' A · 전압강하 '+n(c.percent)+' % · 수업 비교 조건 '+(c.pass?'충족':'부족'),pass:c.pass,
  loads:c.loads.map(d=>({id:d.id,name:d.name,watts:d.watts})),
  steps:[
   step('power-sum','이 회로가 쓰는 전력 합하기','P = Σ P_i','P = '+sum+' = '+n(c.watts,0)+' W',
    '회로에 물린 기구가 모두 켜졌을 때의 전력을 알아야 전류를 구할 수 있습니다.',
    '한 회로의 기구는 같은 전압에 나란히 물려 있어 전력을 그대로 더합니다. 모든 기구가 동시에 정격으로 켜진다고 보는 가장 큰 쪽의 값입니다.',
    [s('P','회로 전체 입력전력','W'),s('P_i','i번째 기구의 입력전력','W'),s('Σ','각 기구 값을 합하는 연산','단위 없음')],['power'],'power','W끼리 더하므로 W 그대로입니다.'),
   step('current','전력에서 전류 구하기','I = P / ('+root+'V × pf)','I = '+n(c.watts,0)+' / ('+rootValue+c.volts+' × '+c.pf+') = '+n(c.current)+' A',
    '기구들이 요구하는 전류를 알아야 전선과 차단기의 크기를 비교할 수 있습니다.',
    three?'3상 회로는 세 가닥이 전력을 나누어 나르므로 선간전압에 √3을 곱해 나눕니다. 역률이 1보다 작으면 같은 전력에 전류가 더 필요합니다.':'단상 교류의 유효전력은 전압, 전류, 역률의 곱입니다. 역률이 1보다 작으면 같은 전력에 전류가 더 필요합니다.',
    [s('I','회로의 설계 전류','A'),s('P','회로 전체 입력전력','W'),s('V',three?'선간전압':'전압','V'),s('pf','역률','단위 없음')],['current','voltage','power-factor'],'power','W ÷ V = A. 역률과 √3은 단위가 없습니다.'),
   step('route-length','도면의 길이를 입체 경로로 읽기','ℓ = Σ √(Δx² + Δy² + Δz²)','ℓ = '+n(c.length)+' m (분전반 → '+far.name+')',
    '전선이 길수록 전압이 더 떨어지므로 가장 먼 기구까지의 실제 길이를 잽니다.',
    '평면도의 길이만 재면 벽을 타고 오르내리는 길이가 빠집니다. 꺾이는 점마다 세 방향의 차이를 모아 구간 길이를 구하고 모두 더합니다.',
    [s('ℓ','분전반에서 가장 먼 기구까지 한 방향 길이','m'),s('Δx, Δy, Δz','한 구간의 가로·세로·높이 차이','m')],['units'],'mechanics','m의 제곱을 더해 제곱근을 구하므로 다시 m입니다.'),
   step('voltage-drop','전선에서 떨어지는 전압 구하기','e = '+c.factor+' × ℓ × I / (1000 × A_w)','e = '+c.factor+' × '+n(c.length)+' × '+n(c.current)+' / (1000 × '+c.area+') = '+n(c.drop)+' V',
    '전선도 저항이 있어 끝으로 갈수록 전압이 낮아집니다. 얼마나 낮아지는지 숫자로 확인합니다.',
    '도전율 97 % 구리의 저항률은 1/58 × 1/0.97 ≈ 0.0178 Ω·mm²/m입니다. '+(three?'3상 3선은 선간 전압강하가 √3배여서 √3 × 0.0178 = 0.0308, 곧 30.8/1000이 됩니다.':'단상 2선은 가는 선과 오는 선을 모두 지나므로 2 × 0.0178 = 0.0356, 곧 35.6/1000이 됩니다.')+' 리액턴스를 뺀 간이식입니다.',
    [s('e','전선에서 떨어지는 전압','V'),s('ℓ','한 방향 전선 길이','m'),s('I','설계 전류','A'),s('A_w','전선 단면적','mm²')],['resistivity','drop'],'resistance','Ω·mm²/m × m × A ÷ mm² = Ω × A = V.'),
   step('drop-percent','전압강하를 백분율로 비교하기','ε = (e / V) × 100','ε = '+n(c.drop)+' / '+c.volts+' × 100 = '+n(c.percent)+' % → 기준 '+c.limit+' % '+(c.percent<=c.limit?'이내':'초과'),
    '전압이 다른 회로끼리도 같은 눈금으로 견주려면 비율로 바꿉니다.',
    'KEC 232.3.9의 표 232.3-1은 저압으로 수전하는 설비의 전압강하를 조명 3 %, 그 밖의 설비 5 % 이하로 둡니다. 이 회로는 '+c.limit+' %와 비교합니다.',
    [s('ε','전압강하율','%'),s('e','전선에서 떨어지는 전압','V'),s('V','회로 전압','V')],['drop','voltage'],'drop','V ÷ V는 단위가 없고, 100을 곱해 %로 읽습니다.'),
   step('protection','전류·차단기·전선을 나란히 비교하기','I_b ≤ I_n ≤ I_z',n(c.current)+' A ≤ '+c.breaker+' A ≤ '+c.ampacity+' A → '+(c.current<=c.breaker&&c.breaker<=c.ampacity?'충족':'부족'),
    '차단기는 기구가 쓰는 전류보다 크고, 전선이 견디는 전류보다 작아야 전선이 먼저 상하지 않습니다.',
    'KEC 212.4.1이 정한 과부하 보호 협조의 첫 조건입니다. 차단기의 동작 시간 조건과 단락·누전 보호는 여기서 판정하지 않습니다.',
    [s('I_b','회로의 설계 전류','A'),s('I_n','차단기 정격전류','A'),s('I_z','전선의 허용전류','A')],['breaker','ampacity'],'ohm','세 값 모두 A이므로 그대로 크기를 비교합니다.')
  ]};
}

// Signature members. Dimensions come from each model; loads are stated classroom assumptions.
export const salkMember=({span,width,slab,depth})=>({id:'truss2-6',name:'비렌딜 트러스',title:'비렌딜 트러스 한 틀',sheet:'S-501',drawing:'S-502',support:'simple',span,width,live:3,
 dead:Math.round((slab*concreteWeight+3)*100)/100,lever:Math.round((depth-.4)*100)/100,
 where:'실험실 위 설비층 한 층을 통째로 춤으로 쓰는 콘크리트 트러스입니다. 가운데 기둥 없이 '+n(span)+' m를 건너 실험실을 비웁니다.',
 deadNote:'고정하중은 바닥판 '+n(slab)+' m × '+concreteWeight+' kN/m³ = '+n(slab*concreteWeight)+' kN/m²에 설비층 바닥·배관·트러스 자중 3.00 kN/m²를 더한 수업값입니다.',
 widthNote:'트러스가 '+n(width)+' m마다 하나씩 서 있어 그 폭의 바닥을 한 틀이 맡습니다.',
 momentNote:'기둥과 한 몸인 실제 트러스는 끝에서도 모멘트를 받아 가운데 값이 이보다 작습니다. 여기서는 단순지지로 가장 큰 쪽을 봅니다.',
 leverNote:'춤 '+n(depth)+' m에서 위·아래 현재의 춤 0.40 m(가정)를 뺀 중심 간격입니다.',
 coupleTheory:'트러스 전체가 휘려는 모멘트를 위 현재의 압축력과 아래 현재의 인장력 한 쌍이 받습니다. 두 힘 사이가 멀수록 힘은 작아집니다. 비렌딜 트러스는 사재가 없어 전단을 현재와 수직재의 휨으로 전달하는데, 이 계산은 그 휨을 빼고 짝힘만 봅니다.',
 reactionNote:'이 힘이 트러스 양끝의 기둥으로 내려갑니다.',
 closing:v=>{const z=.77,N=v.M/z;return step('compare','같은 길이를 보통 보로 건넌다면','N_b = M / z_b','N_b = '+n(v.M)+' / '+n(z)+' = '+n(N)+' kN → 트러스 짝힘의 약 '+n(N/v.N,1)+'배',
  '설비층 한 층을 구조의 춤으로 쓴 까닭을 숫자로 확인합니다.',
  '춤 0.90 m 보라면 유효 깊이 0.85 m에 0.9를 곱한 약 0.77 m가 팔 길이입니다. 같은 모멘트를 짧은 팔로 받으려면 힘이 그만큼 커지고, 보도 더 굵어져야 합니다. 칸은 배관이 지나는 층을 통째로 구조의 춤으로 써서 이 힘을 줄였습니다.',
  [s('N_b','보통 보가 받아야 하는 짝힘','kN'),s('M','가운데 휨모멘트','kN·m'),s('z_b','보통 보의 팔 길이','m')],['effective-depth','moment'],'concrete','kN·m ÷ m = kN.');}});
export const farnsworthMember=({span,width,depth})=>({id:'girder-f3',name:'바닥 가로보',title:'바닥 가로보 하나',sheet:'S-601',drawing:'S-602',support:'simple',span,width,live:2,
 dead:5,lever:Math.round((depth-.02)*100)/100,
 where:'양쪽 테두리보 사이 '+n(span)+' m를 건너 바닥을 받치는 강재 보입니다. 기둥 사이 한가운데에 놓인 보를 계산합니다.',
 deadNote:'고정하중 5.00 kN/m²는 프리캐스트 바닥판, 채움 콘크리트, 트래버틴 마감과 보 자중을 합쳐 가정한 수업값입니다.',
 widthNote:'가로보가 '+n(width)+' m마다 놓여 그 폭의 바닥을 하나가 맡습니다.',
 momentNote:'가로보의 양끝은 테두리보에 걸쳐 있다고 봅니다.',
 leverNote:'보 춤 약 '+n(depth)+' m(추정)에서 플랜지 두께만큼 줄인 위·아래 플랜지 중심 간격입니다.',
 coupleTheory:'보가 휘려는 모멘트를 위 플랜지의 압축력과 아래 플랜지의 인장력 한 쌍이 받습니다. H형강이 강재를 위아래 끝에 몰아 둔 이유입니다. 웨브가 받는 몫을 뺀 근삿값입니다.',
 reactionNote:'이 힘이 테두리보에 실리고, 테두리보가 모아서 기둥 여덟 개로 보냅니다.',
 closing:v=>{const fy=235,S=v.M*1e6/fy;return step('section','필요한 단면계수 구하기','S = M / f_y','S = '+n(v.M)+' × 1,000,000 / '+fy+' = '+n(S,0)+' mm³ ≈ '+n(S/1000,0)+' cm³',
  '이 모멘트를 받으려면 얼마나 큰 H형강이 필요한지 가늠합니다.',
  '보가 휘면 가장 바깥 섬유에서 응력이 가장 크고, 그 값이 M / S입니다. 이 응력이 항복강도에 닿지 않는 가장 작은 S를 구합니다. 235 MPa는 일반 구조용 강재의 수업값이고 원 건물 강재의 시험값이 아닙니다. 좌굴과 처짐, 접합부는 따로 확인해야 합니다.',
  [s('S','필요한 탄성 단면계수','mm³'),s('M','가운데 휨모멘트','N·mm'),s('f_y','강재의 항복강도','MPa')],['stress','units'],'mechanics','1 kN·m = 1,000,000 N·mm. N·mm ÷ N/mm² = mm³, 1 cm³ = 1,000 mm³.');}});
export const fallingwaterMember=({span,width,depth})=>({id:'beam-1',name:'내민 주보',title:'물 위로 내민 주보',sheet:'S-701',drawing:'S-702',support:'cantilever',span,width,live:2,
 dead:6,lever:Math.round(.9*(depth-.05)*1000)/1000,
 where:'받침벽 위에서 물 쪽으로 '+n(span)+' m를 내민 철근콘크리트 보입니다. 1층 거실 바닥과 테라스를 띄웁니다.',
 deadNote:'고정하중 6.00 kN/m²는 장선 바닥, 판석 마감, 난간벽과 보 자중을 합쳐 가정한 수업값입니다.',
 widthNote:'주보가 '+n(width)+' m마다 놓여 그 폭의 바닥을 하나가 맡습니다.',
 momentNote:'실제 낙수장은 뒤쪽 경간과 난간벽이 함께 받습니다. 여기서는 내민 부분만 떼어 봅니다.',
 leverNote:'바닥 구조의 춤 '+n(depth)+' m에서 피복과 철근 반지름 0.05 m를 뺀 유효 깊이 '+n(depth-.05)+' m에 0.9를 곱했습니다.',
 coupleTheory:'내민 보는 받침벽 위에서 윗면이 당겨지고 아랫면이 눌립니다. 그 모멘트를 윗면 철근의 인장력과 아랫면 콘크리트의 압축력 한 쌍이 받습니다.',
 reactionNote:'내민 부분의 무게를 받침벽 하나가 모두 받습니다. 뒤쪽 경간에서 오는 몫은 뺐습니다.',
 closing:v=>{const A=v.M*1e6/(steelDesign*v.z*1000),bar=506.7;return step('steel','윗면에 필요한 철근량 구하기','A_s = M / (f_yd × z)','A_s = '+n(v.M)+' × 1,000,000 / ('+n(steelDesign)+' × '+n(v.z*1000,0)+') = '+n(A,0)+' mm² → D25('+bar+' mm²) '+Math.ceil(A/bar)+'가닥',
  '윗면 철근이 받아야 하는 인장력을 철근 단면적으로 바꿉니다.',
  '인장력 M / z를 철근의 설계강도 f_yd = 400 / 1.15로 나누면 필요한 단면적입니다. 내민 보의 인장 철근은 윗면에 둡니다. 400 MPa 철근과 계수는 수업값이고 원 건물의 배근이 아닙니다.',
  [s('A_s','필요한 인장 철근 단면적','mm²'),s('M','뿌리 휨모멘트','N·mm'),s('f_yd','철근의 설계강도','MPa'),s('z','팔 길이','mm')],['steel-area','design-strength'],'concrete','N·mm ÷ (N/mm² × mm) = mm².');}});

export function memberLesson(m,live=m.live){
 const simple=m.support==='simple',span=r2(m.span),width=r2(m.width),wd=r2(deadFactor*m.dead+liveFactor*live),w=r2(wd*width),M=r2(w*span**2/(simple?8:2)),z=m.lever,N=r2(M/z),R=r2(simple?w*span/2:w*span);
 return {id:m.id,title:m.title,kind:'structure',labels:{model:'부재',drawing:'구조도면'},target:{element:m.id,sheet:m.sheet,drawing:m.drawing},where:m.where,
  conditions:'하중과 치수는 이 건물을 재구성하며 정한 수업값입니다. 대표 부재 하나를 단순 모형으로 떼어 본 계산이며, 원 건물의 구조계산이 아니고 부재의 안전을 판정하지 않습니다. 사용하중 '+n(live)+' kN/m², 고정하중 '+n(m.dead)+' kN/m².',
  result:'휨모멘트 '+n(M)+' kN·m · 짝힘 '+n(N)+' kN · 받침 반력 '+n(R)+' kN',
  values:{live,dead:m.dead,areaLoad:wd,lineLoad:w,moment:M,lever:z,couple:N,reaction:R},
  steps:[
   step('area-load','바닥 1 m²의 설계 하중 만들기','w_d = '+deadFactor+' × g_k + '+liveFactor+' × q_k','w_d = '+deadFactor+' × '+n(m.dead)+' + '+liveFactor+' × '+n(live)+' = '+n(wd)+' kN/m²',
    '늘 있는 무게와 쓰면서 바뀌는 무게를 안전한 쪽으로 키워 더합니다.',
    m.deadNote+' 사용하중은 사람과 가구처럼 바뀌는 무게입니다. 계수 '+deadFactor+'와 '+liveFactor+'는 다른 샘플과 같은 수업값이고, KDS 14 20 10의 기본 조합은 1.2D + 1.6L입니다.',
    [s('w_d','바닥 1 m²의 설계 하중','kN/m²'),s('g_k','고정하중','kN/m²'),s('q_k','사용하중','kN/m²')],['dead-load','live-load','design-strength'],'concrete','계수는 단위가 없으므로 kN/m² 그대로입니다.'),
   step('line-load','부재 하나가 맡는 하중으로 바꾸기','w = w_d × b','w = '+n(wd)+' × '+n(width)+' = '+n(w)+' kN/m',
    '넓은 바닥의 무게를 부재 하나가 길이 1 m마다 받는 힘으로 바꿉니다.',
    m.widthNote+' 면하중에 그 폭을 곱하면 부재 길이를 따라 고르게 실리는 선하중이 됩니다.',
    [s('w','부재에 실리는 선하중','kN/m'),s('w_d','바닥 1 m²의 설계 하중','kN/m²'),s('b','부재 하나가 맡는 바닥 폭','m')],['line-load','units'],'mechanics','kN/m² × m = kN/m.'),
   step('moment',simple?'가운데에서 가장 크게 휘는 정도 구하기':'뿌리에서 가장 크게 휘는 정도 구하기',simple?'M = w × ℓ² / 8':'M = w × ℓ² / 2','M = '+n(w)+' × '+n(span)+'² / '+(simple?8:2)+' = '+n(M)+' kN·m',
    '부재가 받는 가장 큰 휨모멘트가 단면과 철근, 강재의 크기를 정합니다.',
    (simple?'양끝을 받치고 고르게 실은 보는 한가운데에서 가장 크게 휘고, 그 값이 wℓ²/8입니다.':'한쪽만 붙잡힌 내민 보는 뿌리에서 가장 크게 휘고, 그 값이 wℓ²/2입니다. 같은 길이의 단순보보다 4배입니다.')+' 길이가 제곱으로 들어가 길이가 2배면 모멘트는 4배입니다. '+m.momentNote,
    [s('M','가장 큰 휨모멘트','kN·m'),s('w','부재에 실리는 선하중','kN/m'),s('ℓ',simple?'받침 사이 길이':'내민 길이','m')],['moment','support'],'mechanics','kN/m × m² = kN·m.'),
   step('couple','모멘트를 한 쌍의 힘으로 바꾸기','N = M / z','N = '+n(M)+' / '+fine(z)+' = '+n(N)+' kN',
    '휨모멘트는 단면 안에서 누르는 힘과 당기는 힘 한 쌍으로 버팁니다. 그 힘의 크기를 구합니다.',
    m.coupleTheory+' 팔 길이 z는 '+m.leverNote,
    [s('N','압축력과 인장력 한 쌍의 크기','kN'),s('M','가장 큰 휨모멘트','kN·m'),s('z','두 힘 사이의 팔 길이','m')],['effective-depth','moment'],'concrete','kN·m ÷ m = kN.'),
   step('reaction','받침이 받는 힘 구하기',simple?'R = w × ℓ / 2':'R = w × ℓ','R = '+n(w)+' × '+n(span)+(simple?' / 2':'')+' = '+n(R)+' kN',
    '부재에 실린 무게는 받침으로 내려갑니다. 받침 하나가 받는 힘을 구합니다.',
    (simple?'고르게 실린 무게를 양끝 받침이 절반씩 나누어 받습니다. ':'내민 보에 실린 무게는 붙잡힌 쪽 받침으로 모두 내려갑니다. ')+m.reactionNote,
    [s('R','받침 하나가 받는 힘','kN'),s('w','부재에 실리는 선하중','kN/m'),s('ℓ',simple?'받침 사이 길이':'내민 길이','m')],['reaction','support'],'mechanics','kN/m × m = kN.'),
   m.closing({M,N,z,w,R})
  ]};
}

// Classroom-neutral wording for the shared calculation terms; the originals speak about the guardhouse.
const termNotes={
 power:{electrical:'회로에 물린 기구의 W를 더해 설계 부하를 구합니다.'},
 voltage:{electrical:'실효값은 같은 저항에서 같은 평균 열을 내는 직류값에 대응합니다. 조명과 콘센트는 220 V 단상, 큰 전동기와 히트펌프는 380 V 3상으로 받습니다.'},
 'power-factor':{electrical:'같은 소비전력이라도 역률이 낮으면 전류가 커집니다. 회로마다 정한 역률은 수업값입니다.'},
 resistivity:{electrical:'도전율 97 % 구리의 0.0178 Ω·mm²/m에서 전압강하 계수 35.6과 30.8이 나옵니다. 온도가 높아지면 저항도 달라집니다.'},
 ampacity:{electrical:'회로표의 허용전류는 수업 비교값입니다. 실제 값은 포설 방법과 주변 온도, 함께 지나는 회로 수로 정합니다.'},
 'dead-load':{electrical:'이 계산의 고정하중은 재구성하며 가정한 수업값입니다.'},
 'live-load':{electrical:'사용하중 q_k를 바꾸면 모멘트와 짝힘이 얼마나 달라지는지 볼 수 있습니다.'},
 'line-load':{electrical:'면하중에 부재 하나가 맡는 바닥 폭을 곱합니다.'},
 'effective-depth':{definition:'d는 압축면에서 인장 철근 중심까지의 거리, z는 압축력과 인장력의 작용선 사이 거리입니다. 철근콘크리트 보는 z≈0.9d로, 강재 보와 트러스는 위·아래 플랜지나 현재의 중심 간격으로 잡습니다.',electrical:'춤이 깊을수록 같은 모멘트를 작은 힘으로 받습니다.'},
 'steel-area':{definition:'필요한 인장력을 철근의 설계강도로 나누면 필요한 단면적이 나옵니다. D25 한 가닥의 공칭단면적은 506.7 mm²입니다(KS D 3504).',electrical:'같은 방향·같은 인장층만 합칩니다. 내민 보는 윗면이 인장층입니다.'},
 stress:{definition:'단면에 걸리는 힘의 세기입니다. 1 MPa=1 N/mm². 휨에서는 가장 바깥 섬유의 응력이 M/S이고, S는 단면계수입니다.',electrical:'보에 구멍을 내면 단면계수가 줄어 응력이 커집니다.'},
 reaction:{electrical:'바닥에서 보, 기둥과 받침으로 힘이 전달되는 순서를 따라봅니다.'}
};
const electricTerms=new Set(['power','current','voltage','power-factor','resistivity','ampacity']);

const esc=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const button=(text,action,value='',attrs='')=>'<button type="button" data-'+action+'="'+esc(value)+'" '+attrs+'>'+esc(text)+'</button>';
const pressed=v=>'aria-pressed="'+Boolean(v)+'"';

// One calculations page: the controller supplies its data and navigation, and adds the returned actions to its own.
export function createCalculations({key,file,terms,electric,sheets,panel,plan,drawing,member,destination,go,saveFile,paint,status}){
 const fresh=()=>({mode:'electric',circuit:'',step:'',view:'one',live:member.live});
 let state=fresh();
 try{const saved=JSON.parse(localStorage.getItem(key))??{};state={mode:saved.mode==='member'?'member':'electric',circuit:String(saved.circuit??''),step:String(saved.step??''),view:saved.view==='all'?'all':'one',live:Number.isFinite(saved.live)&&saved.live>=0&&saved.live<=10?saved.live:member.live};}catch{}
 const keep=()=>{try{localStorage.setItem(key,JSON.stringify(state));}catch{}};
 const lesson=()=>state.mode==='member'?memberLesson(member,state.live):circuitLesson(electric(),state.circuit,{panel,plan,drawing});
 // The glossary and the term dialog read the same Map, so the calculation terms the lessons link to join it once.
 const used=new Set([...electric().circuits.flatMap(c=>circuitLesson(electric(),c.id,{panel,plan,drawing}).steps),...memberLesson(member).steps].flatMap(s=>s.terms));
 for(const t of calculationGlossary){
  if(!used.has(t.id)||terms.has(t.id))continue;
  const target=electricTerms.has(t.id)?{menu:'electrical',id:panel.id,sheet:plan}:{menu:'structure',id:member.id,sheet:member.sheet};
  terms.set(t.id,{...t,...termNotes[t.id],sheet:target.sheet,element:target.id,target});
 }
 const open=target=>{state={...state,mode:target==='member'?'member':'electric',circuit:target==='member'?state.circuit:target,step:''};keep();go('calculations');};
 const move=change=>{Object.assign(state,change);keep();paint();};
 return {
  lesson,open,memberId:member.id,
  html(){
   const l=lesson(),member_=state.mode==='member',all=state.view==='all',guide=lessonHTML(l,state);
   const body=all?guide.slice(0,guide.indexOf('<div class="calc-reading">'))+l.steps.map(s=>formulaHTML(s)).join('')+'</section>':guide;
   return '<article class="card calc-setup"><h2>계산할 조건</h2><div class="button-row">'+button('전기 회로','calc-mode','electric',pressed(!member_))+button(member.name,'calc-mode','member',pressed(member_))+'</div>'+
    (member_?'<form id="calc-live"><label>사용하중 (kN/m²) <input type="number" name="live" required min="0" max="10" step=".1" value="'+state.live+'"></label><button>조건 적용</button></form>'
     :'<div class="button-row">'+electric().circuits.map(c=>button(c.id+' · '+c.name,'calc-circuit',c.id,pressed(c.id===l.id))).join('')+'</div>')+'</article>'+
    '<div class="calc-guide"><div class="report-actions">'+button(all?'한 공식씩 읽기':'전체 공식 보기','reading',all?'one':'all')+button('현재 계산 데이터 저장','save-calculation')+'</div>'+body+'</div>';
  },
  actions:{
   openCalc:b=>open(b.dataset.openCalc),
   calcMode:b=>move({mode:b.dataset.calcMode==='member'?'member':'electric',step:''}),
   calcCircuit:b=>move({circuit:b.dataset.calcCircuit,step:''}),
   calcIndex:b=>{const next=lesson().steps[Number(b.dataset.calcIndex)];if(!next)return;move({step:next.id});document.querySelector('.calc-reading')?.scrollIntoView({block:'start'});},
   reading:b=>move({view:b.dataset.reading==='all'?'all':'one'}),
   calcTarget:b=>{const t=lesson().target,id=b.dataset.calcTarget==='drawing'?t.drawing:t.sheet;destination({menu:sheets.find(d=>d.id===id).menu,id:t.element,sheet:id});},
   calcDevice:b=>destination({menu:'electrical',id:b.dataset.calcDevice,sheet:plan}),
   saveCalculation:()=>{saveFile(file,JSON.stringify(lesson(),null,2),'application/json');status('현재 계산 데이터를 저장했습니다.');}
  },
  change(e){if(e.target.id!=='calc-step')return false;move({step:e.target.value});return true;},
  submit(e){if(e.target.id!=='calc-live')return false;e.preventDefault();if(e.target.reportValidity()){move({live:e.target.elements.live.valueAsNumber});status('사용하중 '+n(state.live,1)+' kN/m²로 다시 계산했습니다.');}return true;},
  reset(){state=fresh();try{localStorage.removeItem(key);}catch{}}
 };
}
