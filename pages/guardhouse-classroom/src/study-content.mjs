// Shared concepts; each sample remains the owner of its model/drawing targets.
export const studySources = Object.freeze({
 ifc:{title:'buildingSMART · IFC의 정보와 관계',url:'https://technical.buildingsmart.org/standards/ifc/'},
 law:{title:'국가법령정보센터 · 건축법 시행령 제61조',url:'https://www.law.go.kr/법령/건축법시행령/제61조'},
 finish:{title:'국가법령정보센터 · 피난·방화구조 규칙 제24조',url:'https://www.law.go.kr/법령/건축물의피난ㆍ방화구조등의기준에관한규칙/제24조'},
 pf:{title:'LX하우시스 · PF보드 제품별 성능 구분',url:'https://cpas.lxhausys.co.kr/products/insulation/pfboard'},
 ceramic:{title:'KMEW · 광촉매 코팅 제품의 특징',url:'https://www.kmew.co.jp/shouhin/siding/hikaricera/index.html?type=hikaricerakp'},
 zinc:{title:'국제아연협회 · 건축용 아연판',url:'https://www.zinc.org/zinc_sheet/'},
 eifs:{title:'Sto · 외단열 마감 시스템의 구성',url:'https://www.stocorp.com/eifs/'}
});
export const studyCategories=Object.freeze({bim:'BIM 기초',drawing:'도면 읽기',structure:'구조·철근',materials:'재료·외장',electrical:'전기',fire:'소방·안전',calculation:'계산·수량'});
const concept=(id,term,category,plain,definition,electrical,sources=[])=>({id,term,category,plain,definition,electrical,sources,scope:'concept',locationNote:category==='materials'?'공통 기초 지식 · 이 샘플의 특정 설치 재료를 뜻하지 않습니다.':'공통 기초 지식 · 개념을 익히는 항목입니다.'});
export const studyConcepts=[
 concept('cad','CAD','bim','컴퓨터로 도면과 형상을 작성하는 방법','선·치수·기호로 설계를 표현합니다. 2D CAD 선만으로는 벽의 재료나 회로 연결을 모두 알 수 없습니다.','도면의 선이 벽인지 전선인지 먼저 구분합니다.'),
 concept('bim-object','BIM 객체','bim','하나의 부재나 기구를 나타내는 정보 단위','벽·문·조명 같은 대상을 모양, 식별자, 속성, 연결 관계로 다룹니다. 예쁜 3D 형상만으로 이 정보가 자동 완성되지는 않습니다.','같은 조명을 도면·3D·회로에서 찾는 기준이 됩니다.',['ifc']),
 concept('bim-property','속성 정보','bim','대상의 크기·재료·성능을 설명하는 값','높이에는 mm, 입력전력에는 W처럼 값과 단위를 함께 기록합니다. 이름이 같아도 서로 다른 기구일 수 있습니다.','조명의 입력전력과 연결 회로가 계산에 쓰입니다.',['ifc']),
 concept('bim-id','객체 식별자 ID','bim','같은 대상을 여러 화면에서 찾는 이름표','도면과 3D에서 보이는 대상이 같은 객체인지 구분합니다. 서로 다른 기구에 같은 ID를 주면 수량과 연결을 잘못 셀 수 있습니다.','조명 한 개를 두 화면에서 보아도 설치 수량은 한 개입니다.'),
 concept('bim-relation','연결 관계','bim','대상끼리 어떻게 이어지는지 나타내는 정보','공간에 속함, 벽에 설치됨, 회로에 연결됨 같은 관계입니다. 가까이 보인다는 이유만으로 전기적으로 연결된 것은 아닙니다.','분전반 → 차단기 → 스위치 → 조명의 연결을 확인합니다.',['ifc']),
 concept('bim-clash','간섭 검토','bim','서로 겹치거나 필요한 공간을 침범하는지 확인','전선관과 보·철근의 겹침, 유지보수 공간 등을 검토합니다. 화면에서 겹침이 없다고 모든 설계 기준을 만족하는 것은 아닙니다.','배관을 구조 부재에 임의로 관통시키지 않고 위치를 조정합니다.'),
 concept('ifc','IFC','bim','BIM 정보를 교환하기 위한 공개 표준','서로 다른 프로그램 사이에서 객체·속성·관계를 전달하는 데 사용합니다. 교환한 뒤에는 필요한 정보가 보존됐는지 확인합니다.','이 학습실에서 IFC의 개념을 배웁니다. IFC 파일 변환 기능을 뜻하지는 않습니다.',['ifc']),
 concept('quantity-takeoff','수량 산출·BOM','calculation','설계에 무엇이 얼마나 있는지 세는 일','기구는 개, 배관은 m, 마감은 m²처럼 단위를 구분합니다. 모델에 없는 항목은 0개가 아니라 미산출일 수 있습니다.','회로 계산의 전력 합계와 설치 기구 개수는 서로 다른 값입니다.'),
 concept('finish-system','외벽 마감 시스템','materials','벽의 바깥 마감과 안쪽 재료층을 함께 보는 구성','표면 마감, 단열재, 바탕, 고정 부품과 연결부를 구분합니다. 겉모습이 같아도 내부 구성과 성능은 다를 수 있습니다.','외부 기구 고정과 전선관 관통 위치를 재료층과 함께 검토합니다.',['finish']),
 concept('fire-material','불연·준불연·난연','materials','정해진 시험 기준으로 구분하는 재료의 화재 성능','서로 같은 등급이 아닙니다. 재료 이름이나 겉모습만으로 등급을 정하지 않고 해당 제품과 구성의 시험·인정 자료를 확인합니다.','배선이 지나는 벽의 마감재와 단열재를 구분해 읽습니다.',['finish']),
 concept('facade-rule','외벽 마감재 적용 기준','materials','어떤 건물에 어떤 성능이 필요한지 정한 기준','건물의 용도·규모·높이·층수와 예외 조건에 따라 적용이 달라집니다. 모든 단독주택에 같은 의무가 있다고 외우지 않습니다.','법규 적용 대상과 실제 재료의 성능 확인은 별개의 단계입니다.',['law','finish']),
 concept('ceramic-siding','세라믹 사이딩','materials','무늬와 표면 코팅을 갖춘 판 형태의 외장재','시멘트계 사이딩 등에 돌·벽돌·나무 느낌의 표면을 만듭니다. 광촉매 등의 오염 저감 기능은 제품별 코팅과 사용 조건을 확인합니다.','외벽 기구의 고정 위치와 이음부를 함께 봅니다.',['ceramic']),
 concept('zinc-cladding','징크·금속 외장','materials','금속판으로 만드는 지붕·외벽 마감','아연계 판재와 징크 모양을 낸 도장강판은 재료가 다릅니다. 금속 표면만 보고 단열재를 포함한 벽 전체의 화재 안전성을 판단하지 않습니다.','금속 외함·부재의 전기적 보호와 배선 관통부를 함께 검토합니다.',['zinc','finish']),
 concept('brick-veneer','치장벽돌·롱브릭','materials','외관을 만드는 벽돌 또는 길쭉한 벽돌 계열 마감','쌓는 벽돌과 바탕에 붙이는 얇은 타일은 무게와 고정 방법이 다릅니다. 겉의 벽돌만으로 뒤쪽 단열재와 연결부의 성능까지 알 수는 없습니다.','외벽 기구를 어디에 고정할지 마감과 바탕을 구분합니다.'),
 concept('eifs','외단열 마감·EIFS','materials','벽 바깥의 단열층 위에 마감층을 구성하는 방식','단열재, 보강층, 표면 마감과 수분 처리 등을 시스템으로 봅니다. 드라이비트는 상표에서 비롯된 현장 용어이며, 모든 외단열을 한 재료로 보지 않습니다.','관통부에서 단열·방수·방화 요구를 함께 확인합니다.',['eifs','finish']),
 concept('stucco','스타코·미장 마감','materials','벽 표면에 바르거나 뿌려 질감을 만드는 마감','시멘트계 미장과 합성수지계 마감 등 제품 구성이 다릅니다. 스타코플렉스 같은 제품명만으로 벽 전체의 성능을 결정하지 않습니다.','표면 도료와 안쪽 단열재를 구분합니다.',['eifs']),
 concept('pf-board','PF보드','materials','페놀폼 계열의 판형 단열재','제품마다 면재와 심재의 난연 성능 및 적용 부위가 다릅니다. PF보드라는 이름만으로 불연재라고 판단하지 않습니다.','선택한 제품의 두께·성능 자료와 벽 구성을 함께 확인합니다.',['pf']),
 concept('mineral-wool','미네랄울','materials','광물 원료를 섬유 형태로 만든 단열재','단열·흡음 등에 사용합니다. 완성 제품의 바인더·면재·밀도와 적용 시스템의 성능 자료까지 확인합니다.','벽 안쪽 공간과 관통부 상세를 읽는 데 필요한 재료입니다.',['eifs','finish']),
 concept('curtain-wall-look','커튼월 룩','materials','유리 외벽처럼 보이게 꾸민 외관 표현','구조체에 외피를 매다는 커튼월과 구분합니다. 콘크리트 외벽 바깥에 유리·금속 장식 등을 더한 구성일 수 있어 단면 상세를 확인해야 합니다.','외관만 보고 실내 공간이나 전선관 경로를 판단하지 않습니다.'),
 concept('stone-finish','석재 마감','materials','화강석 등 돌판으로 마감하는 방식','돌의 무게, 고정 부품, 줄눈과 배수 등을 함께 봅니다. 천연석의 종류와 적용 위치에 따라 필요한 상세가 달라집니다.','석재 표면과 기구를 지지하는 바탕은 구분합니다.'),
 concept('stone-coating','석재 질감 도장·뿜칠','materials','돌처럼 보이는 질감을 도료로 만드는 마감','진짜 돌판을 붙이는 것과 재료 두께·무게·시공 방식이 다릅니다. 외관의 질감만으로 재료를 확정하지 않습니다.','재료명세서에는 실제 사용한 도장과 석재를 구분해 기록합니다.')
];
const categoryIds={bim:['bim'],drawing:['plan','section','elevation','ffl','sfl','ch','ceiling','opening','vestibule'],structure:['slab','wall','partition','foundation','pit','parapet','rebar','rebar-drawing','cover','spacing','sleeve'],materials:['finish','insulation','assembly','wall-panel'],electrical:['panel','circuit','breaker','conduit','ground','load','drop','ffu','filter','esd'],fire:['detector','receiver','fire-alarm','alarm','extinguisher','exit','escape','emergency','battery','firestop','fire-power']};
export function categoryFor(t){return t.category??Object.keys(categoryIds).find(k=>categoryIds[k].includes(t.id))??(/^F-/.test(t.sheet??'')?'fire':/^M-/.test(t.sheet??'')?'materials':'calculation');}
export function withStudyConcepts(terms){return [...new Map([...terms,...studyConcepts].map(t=>[t.id,{...t,category:categoryFor(t)}])).values()];}
const q=(id,term,statement,answer,explanation)=>({id,term,statement,answer,explanation});
export const studyQuestions=[
 q('bim-shape','bim-object','3D 모양이 정교하면 재료와 회로 정보도 자동으로 완성된다.',false,'형상과 정보는 별도로 확인해야 합니다. 객체의 속성과 실제 연결 관계가 있어야 같은 대상을 도면·계산·수량에서 함께 다룰 수 있습니다.'),
 q('property-unit','bim-property','입력전력 30과 입력전력 30 W는 정보의 명확성이 다르다.',true,'수치에는 단위가 필요합니다. W는 전력이고 A는 전류이므로 단위를 생략하면 다른 뜻으로 해석될 수 있습니다.'),
 q('id-count','bim-id','조명 한 개가 평면도와 3D에 각각 보이면 설치 수량은 두 개다.',false,'두 화면은 같은 객체를 표현합니다. 고유 ID로 같은 대상을 묶어 중복 집계를 막습니다.'),
 q('relation-distance','bim-relation','두 기구가 화면에서 가까이 보인다는 사실만으로 같은 회로라고 할 수 없다.',true,'공간 위치와 전기 연결은 다른 관계입니다. 연결 회로와 분전반의 정보를 확인해야 합니다.'),
 q('ifc-open','ifc','IFC는 특정 회사의 프로그램 하나에서만 쓰는 전용 정보 형식이다.',false,'IFC는 서로 다른 도구 사이에서 BIM 정보를 전달하기 위한 공개 표준입니다. 교환 후 정보 보존 여부도 확인합니다.'),
 q('clash-check','bim-clash','배관과 철근이 겹치지 않으면 모든 설계 검토가 끝난다.',false,'간섭이 없는 것만으로 충분하지 않습니다. 유지보수 공간, 구조 요구, 전기적 조건 등 다른 검토가 남습니다.'),
 q('plan-height','plan','평면도만 보면 천장과 바닥 아래의 높이를 모두 확정할 수 있다.',false,'평면도는 수평 배치를 읽는 도면입니다. 높이와 바닥 아래 구성은 단면도와 상세 정보를 함께 확인합니다.'),
 q('section-cut','section','단면도는 건물을 잘라 옆에서 본 모습으로 높이를 읽는 데 도움이 된다.',true,'평면에서 보이지 않는 천장 위·바닥 아래 공간을 단면에서 확인할 수 있습니다.'),
 q('rebar-spacing','rebar-drawing','D13 @200에서 200은 철근 중심 사이의 간격 200 mm를 뜻한다.',true,'D13은 철근의 호칭(공칭지름 12.7 mm)이고, @200은 중심 간격입니다. 철근 개수 200개라는 뜻이 아닙니다.'),
 q('cover-center','cover','피복 두께는 콘크리트 표면에서 철근 중심까지 잰다.',false,'피복은 가장 바깥 철근의 표면까지 잽니다. 중심까지의 거리와 구분해야 합니다.'),
 q('metal-safe','zinc-cladding','외벽 표면이 금속이면 단열재와 연결부를 포함한 벽 전체가 화재에 안전하다.',false,'표면 금속만으로 판단할 수 없습니다. 단열재·바탕·고정 방식과 연결부를 포함한 구성 및 성능 자료를 확인합니다.'),
 q('pf-all','pf-board','PF보드라는 재료 이름만 알면 모든 제품을 불연재라고 분류할 수 있다.',false,'PF보드도 제품별로 면재·심재의 성능과 적용 부위가 다릅니다. 해당 제품의 자료를 확인해야 합니다.'),
 q('facade-all','facade-rule','모든 단독주택에는 규모와 조건에 관계없이 동일한 외벽 마감재 의무가 적용된다.',false,'적용 범위는 용도·규모·높이·층수와 예외 조건에 따라 달라집니다. 재료 선택과 법규 적용을 구분해 확인합니다.'),
 q('fire-grades','fire-material','불연·준불연·난연은 같은 뜻이므로 서로 바꿔 써도 된다.',false,'서로 다른 시험 기준의 성능 구분입니다. 제품 자료의 정확한 성능과 적용 조건을 확인합니다.'),
 q('finish-layers','finish-system','외벽은 표면 마감재와 그 안쪽 단열재를 구분해 살펴봐야 한다.',true,'표면이 같아도 안쪽 재료층이 다를 수 있습니다. 층별 역할과 전체 구성을 함께 읽습니다.'),
 q('ceramic-clean','ceramic-siding','세라믹 사이딩의 오염 저감 기능은 제품별 코팅과 사용 조건을 확인해야 한다.',true,'모든 제품이 같은 기능을 갖는 것은 아닙니다. 특정 코팅의 특징을 재료 전체의 성능으로 확대하지 않습니다.'),
 q('brick-tile','brick-veneer','쌓는 벽돌과 붙이는 얇은 벽돌 타일은 고정 방식과 무게가 같다고 볼 수 없다.',true,'생김새가 비슷해도 시공 방식과 지지 구조가 다릅니다. 마감과 바탕의 관계를 확인합니다.'),
 q('curtain-look','curtain-wall-look','커튼월 룩이라는 말만으로 외벽이 실제 커튼월 구조라고 확정할 수 있다.',false,'커튼월 룩은 외관 표현을 가리킵니다. 실제 외벽 구성은 단면과 상세 도면에서 확인합니다.'),
 q('stone-paint','stone-coating','돌처럼 보이는 뿜칠과 실제 석재판은 재료명세서에서 구분한다.',true,'겉모습이 비슷해도 실제 재료와 산출 단위·두께·시공 방식이 달라질 수 있습니다.'),
 q('switch-source','breaker','스위치를 켜면 주전원이나 차단기 상태와 관계없이 조명이 켜진다.',false,'조명은 주전원·차단기·스위치가 모두 연결되어야 켜집니다. 켜지지 않으면 전원이 끊긴 위치를 순서대로 확인합니다.'),
 q('conduit-circuit','conduit','회로도와 전선관 배치도는 똑같은 정보를 보여준다.',false,'회로도는 전기적인 연결 관계, 전선관 배치는 공간에서 지나가는 실제 길을 보여줍니다.'),
 q('ground-neutral','ground','보호접지 PE와 중성선 N은 역할이 다르다.',true,'중성선은 정상 부하 전류의 귀로가 되고, 보호접지는 고장 때 보호장치의 동작을 돕습니다.'),
 q('load-power','load','전원을 꺼도 이미 설치된 조명의 수량 자체는 줄지 않는다.',true,'작동 상태와 설치 수량은 다릅니다. 설계용 부하와 실제 켜진 기구의 소비 상태도 구분합니다.'),
 q('detector-suppress','detector','연기감지기는 연기를 감지하면 스스로 소화약제를 뿌리는 장치다.',false,'감지기는 화재 징후를 알아채 신호를 보냅니다. 경보 장치와 소화 장치의 역할은 다릅니다.'),
 q('quantity-zero','quantity-takeoff','재료명세서에서 미산출은 0개라는 뜻이다.',false,'미산출은 모델이나 산출 근거가 부족해 수량을 정하지 않았다는 뜻입니다. 0으로 바꿔 합계에 넣으면 누락을 숨기게 됩니다.'),
 q('quantity-units','quantity-takeoff','기구 3개와 전선관 5 m를 더해 재료 8개라고 표시해도 된다.',false,'단위가 다른 수량은 하나의 합계로 더하지 않습니다. 품목과 단위를 유지해 읽습니다.')
];
export function questionsFor(terms,ids=terms.map(t=>t.id)){const known=new Set(ids),map=new Map(terms.map(t=>[t.id,t]));return studyQuestions.filter(q=>known.has(q.term)&&map.has(q.term)).map(q=>({...q,category:categoryFor(map.get(q.term))}));}
