"""Author the 30-scene assembly lecture; content is independent of rendering."""
import json
from pathlib import Path

P = Path(__file__).parent
scenes = []
def scene(kind, label, title, word, note, **data):
    scenes.append(dict(id=len(scenes)+1, kind=kind, label=label, title=title,
                       word=word, note=note, **data))

scene('hero','AGENT HARNESS / AN OPEN LAB','감각을 {구조}로.','구조',
      '좋은 GPT는 결과를 안정화하는 구조에서 시작한다.', display='HARNESS',
      items=[['INPUT','감각적 입력'],['DECODE','역할별 해석'],['OUTPUT','검증된 설계안']])
scene('compare','01 / THE PROBLEM','긴 요청에도,\n결과는 {비슷하다}.','비슷하다',
      '길이보다 먼저, 입력을 어떻게 읽고 결과를 어떻게 내놓을지 정한다.',
      items=[['LONG PROMPT','감성적이고, 몰입감 있고,\n시네마틱하면서…','계속 늘어나는 요청'],
             ['SAME OUTPUT','atmospheric,\ncinematic, emotional…','다시 돌아오는 비슷한 표현']])
scene('diagnosis','01 / DIAGNOSIS','문제는 {구조}의 빈자리.','구조',
      '이 강의는 결과가 흔들리는 세 지점을 입력·해석·출력에서 살펴본다.',
      items=[['입력 미분류','텍스트·이미지·오디오를 같은 방식으로 읽는다.'],
             ['해석 없음','신호를 평균내고 중심축을 잡지 못한다.'],
             ['출력 계약 없음','매번 다른 형식으로 결과가 흘러간다.']])
scene('compare','01 / FRAME SHIFT','대답에서 {운영}으로.','운영',
      '입력 해석, 분기, 출력 형식, 검증까지 하나의 절차로 연결한다.',
      items=[['CHATBOT','반응한다.','Answer · Tone · One-shot'],
             ['AGENT','운영한다.','Workflow · Decision · QA']])
scene('statement','01 / DEFINITION','필요한 {자유}를 설계한다.','자유',
      '하네스는 필요한 자유를 허용하면서 결과를 안정화하는 운영 레일이다.',display='FREEDOM',tone='blue')
scene('system','02 / SOUND DESIGN LAB V2','감각을 해석하는 {구조}.','구조',
      'Sound Design Lab V2를 감각적 입력을 사운드 설계안으로 바꾸는 사례로 해부한다.',
      inputs=['Text','Image','Audio','Purpose'],outputs=['Sound Brief','Mood Map','Prompt Pack','QA Report'])
scene('signals','02 / INPUT SPLIT','하나의 요청, 네 갈래의 {신호}.','신호',
      '같은 요청 안에서도 명시적 요구와 감각적 단서를 구분한다.',
      items=[['TEXT','명시적 요구','무엇을 원하는가'],['IMAGE','공간·색·거리·태도','무엇이 보이는가'],
             ['AUDIO','질감·밀도·움직임','무엇이 들리는가'],['PURPOSE','장면 목적·감정 곡선','어디에 쓰는가']])
scene('decode','02 / FOUR DECODERS','입력마다 {해석}이 다르다.','해석',
      '입력 유형에 맞게 해석한 뒤, 하나의 brief와 prompt로 조합한다.',
      items=[['Text','intent / constraint','의도와 제약'],['Image','mood / space','무드와 공간'],
             ['Audio','texture / motion','질감과 움직임'],['Purpose','use / timing','용도와 타이밍']])
scene('core','02 / IDENTITY CORE','섞기 전에, {중심축}부터.','중심축',
      '중심축 → 보조 → 변주. 회피할 방향도 함께 정한다.',
      items=[['ANCHOR','반드시 지킬 정체성'],['SECONDARY','보조적으로 섞을 성격'],
             ['SPICE','소량의 변주 요소'],['AVOID','흘러가면 안 되는 방향']])
scene('lenses','02 / VISUAL DECODER','이미지에서 무드의 {단서}를 읽는다.','단서',
      '이미지는 소리를 단정하는 자료가 아니라 무드 추론의 단서다.',
      items=[['COLOR','차갑다 / 따뜻하다 / 탁하다'],['DISTANCE','가깝다 / 멀다 / 막혀 있다'],
             ['TEXTURE','젖어 있다 / 금속성 / 먼지감'],['ATTITUDE','위협적 / 고요함 / 불안정']])
scene('lenses','02 / AUDIO DECODER','장르 이름 너머의 {구조}.','구조',
      '오디오를 질감·밀도·거리·움직임의 네 관점에서 듣는다.',
      items=[['TEXTURE','어떤 재질처럼 들리는가'],['DENSITY','얼마나 차 있거나 비어 있는가'],
             ['DISTANCE','얼마나 가깝거나 먼가'],['MOTION','어떻게 움직이고 달라지는가']])
scene('brief','02 / WORKED EXAMPLE','한 장의 {설계안}으로.','설계안',
      '사운드 설계안 예시. 감각적 요청이 실행할 항목으로 바뀌는 과정을 본다.',
      input='어두운 도시 골목, 네온사인, 느린 추격 장면에 맞는 사운드',
      items=[['Direction','차갑고 좁은 공간감의 긴장형 앰비언스'],['Mood Map','불안 / 저속 / 금속성 / 습도감'],
             ['Texture','low drone / distant siren / wet pavement / filtered pulse'],
             ['Structure','0–10초 공간 형성 → 10–25초 긴장 상승 → 25초 이후 잔향'],
             ['Negative','heroic, bright synth, fast EDM, clean pop']])
scene('routes','02 / ROUTING','요청이 다르면, {출력}도 다르다.','출력',
      '요청 유형을 선택해 필요한 출력 계약을 비교한다.',
      items=[['Music','무조건 장르 추천','구조 · 악기 · 에너지 곡선'],
             ['Ambience','음악처럼 작곡','공간감 · 반복성 · 방해도'],
             ['Effect','분위기만 설명','길이 · 어택 · 디케이 · 사용 타이밍'],
             ['Voice','대사문만 작성','톤 · 속도 · 페르소나 · 감정'],
             ['Hybrid','전부 섞기','레이어별 역할 분리']])
scene('contract','02 / OUTPUT CONTRACT','같은 순서가 만드는 {일관성}.','일관성',
      '고정된 출력 순서는 결과를 읽고 재사용하는 기준이 된다.',
      items=[['Direction','방향'],['Mood','무드'],['Texture','질감'],['Prompt','실행문'],['QA','검수']])
scene('qa','02 / QA GATE','만든 뒤에는, {검증}.','검증',
      '검수도 생성 과정의 일부다. 확인한 문제를 수정한 뒤 다시 검토한다.',
      items=['입력을 모두 반영했는가?','generic 표현을 제거했는가?','금지 방향을 피했는가?',
             '출력 형식이 빠지지 않았는가?','바로 실행 가능한가?'])
scene('statement','02 → 03 / TRANSFER','감각은 구조를 만나\n{결과}가 된다.','결과',
      '이제 사운드 사례를 내 분야의 GPT 구조로 옮긴다.',display='TRANSFER',tone='ink')
scene('statement','03 / YOUR OPEN LAB','이제, 내 것을 {조립}한다.','조립',
      'Goal → Input → Decode → Contract → QA. 한 단계씩 나의 설계도를 완성한다.',display='YOUR TURN',tone='blue')

groups = [
 dict(id='goal',step=1,slide=18,label='GOAL',title='결과물부터 {정한다}.',word='정한다',note='최종 산출물이 흐릿하면 GPT 전체가 흔들린다.',
      fields=[['goal_output','내 GPT의 최종 산출물','예: 주간 학습 계획표'],['goal_action','사용자는 이것으로 무엇을 하는가','예: 오늘 공부할 순서를 결정한다']]),
 dict(id='inputs',step=2,slide=19,label='INPUTS',title='받을 정보를 {분리}한다.',word='분리',note='사용자가 줄 수 있는 정보를 유형별로 나눈다.',
      fields=[['input_1','입력 1','예: 달성하려는 목표'],['input_2','입력 2','예: 현재 수준'],['input_3','입력 3','예: 사용할 수 있는 시간'],['input_4','입력 4','예: 반드시 지켜야 할 제약']]),
 dict(id='identity',step=3,slide=20,label='IDENTITY',title='흔들리지 않을 {중심축}.',word='중심축',note='정보를 섞기 전에 정체성·약속·유지·회피 기준을 정한다.',
      fields=[['identity_anchor','Anchor · 중심축','반드시 지킬 정체성'],['identity_promise','Promise · 약속','사용자에게 주는 가치'],['identity_keep','Keep · 유지','계속 유지할 성격'],['identity_avoid','Avoid · 회피','흘러가면 안 되는 방향']]),
 dict(id='decoders',step=4,slide=21,label='DECODERS',title='한 모듈에 {한 역할}.',word='한 역할',note='사용자 의도 해석, 자료 판단, 결과 조합의 책임을 분리한다.',
      fields=[['decoder_a','Decoder A는 무엇을 읽는가','의도·제약 등 읽을 대상'],['decoder_b','Decoder B는 무엇을 판단하는가','자료·상황 등 판단 대상'],['composer','Composer는 무엇으로 조합하는가','해석 결과를 모을 산출물']]),
 dict(id='format',step=5,slide=22,label='FORMAT',title='해석을 {실행} 가능한 형태로.',word='실행',note='Raw → Decode → Filter → Shape → Ready. 분석은 사용할 수 있는 결과로 이어져야 한다.',
      fields=[['format_result','최종 실행 포맷','프롬프트, 계획표, 체크리스트 등'],['format_filter','압축할 때 남길 기준','반드시 포함할 정보와 덜어낼 정보']]),
 dict(id='contract',step=6,slide=23,label='CONTRACT',title='출력의 {순서}를 고정한다.',word='순서',note='항상 같은 순서로 결과를 받으면 더 빨리 읽고 재사용할 수 있다.',
      fields=[[f'contract_{i}',f'출력 순서 {i}',p] for i,p in enumerate(['방향','요약','근거','실행안','검수'],1)]),
 dict(id='guardrails',step=7,slide=24,label='GUARDRAILS',title='하지 않을 것도 {설계}한다.',word='설계',note='추측·복제·전문용어·과부하를 어떤 조건에서 제한할지 구체적으로 쓴다.',
      fields=[['rule_guess','No Guessing','어떤 정보를 추측하지 않을 것인가'],['rule_copy','No Copying','무엇을 그대로 복제하지 않을 것인가'],['rule_jargon','No Jargon','어떤 표현을 쉬운 말로 바꿀 것인가'],['rule_overload','No Overload','어디까지 담고 무엇을 덜어낼 것인가']]),
 dict(id='qa',step=8,slide=25,label='QA',title='실패를 잡는 {질문}.',word='질문',note='내 GPT에서 실제 실패를 잡을 수 있는 검수 질문으로 구체화한다.',
      fields=[['qa_input','입력 반영','입력을 모두 반영했는가?'],['qa_rules','금지 규칙','금지한 것을 하지 않았는가?'],['qa_action','실행 가능성','결과가 바로 실행 가능한가?'],['qa_generic','구체성','generic 표현을 제거했는가?'],['qa_format','출력 형식','출력 형식이 빠지지 않았는가?']]),
 dict(id='tests',step=9,slide=26,label='TESTS',title='설명보다 {테스트}.',word='테스트',note='성공할 입력과 거부하거나 되물어야 할 입력을 함께 만든다.',
      fields=[['test_1','테스트 프롬프트 1','정상 입력과 기대 결과'],['test_2','테스트 프롬프트 2','다른 조건의 입력과 기대 결과'],['test_fail','실패해야 하는 프롬프트','금지 규칙을 건드리는 입력과 기대 대응']]),
]
for group in groups:
    scene('workshop',f'03 / CANVAS {group["step"]:02}',group['title'],group['word'],group['note'],group=group['id'])
scene('transfer','03 / ACROSS DOMAINS','분야가 바뀌어도, {구조}는 남는다.','구조',
      'Sound Design Lab을 복사하는 대신 입력·해석·출력·검증의 관계를 옮긴다.',
      items=[['BRAND','브랜드 코어','메시지 팩'],['STUDY','학습 목표','공부 플랜'],
             ['TRAVEL','취향 · 제약','일정 설계'],['CONTENT','소재','콘텐츠 구조']])
scene('minimum','03 / START SMALL','작은 버전도 {제출}할 수 있다.','제출',
      '입력·출력·금지 규칙·테스트가 있는 작은 버전부터 시작한다.',
      items=[['1','GOAL'],['3','INPUTS'],['3','OUTPUTS'],['3','RULES'],['2','TESTS']])
scene('rubric','03 / REVIEW','아이디어보다, 구조의 {선명도}.','선명도',
      '멋진 주제보다 결과물·입력·역할·형식·검증의 연결을 평가한다.',
      items=[['Goal','최종 산출물이 한 문장으로 선명하다','사용자가 무엇을 받는가?'],
             ['Input','입력 유형이 분리되어 있다','무엇을 받아야 잘 작동하는가?'],
             ['Decoder','해석 모듈의 역할이 다르다','각 모듈은 무엇을 판단하는가?'],
             ['Contract','출력 순서가 고정되어 있다','매번 같은 품질의 그릇인가?'],
             ['QA','검증 질문이 실제 실패를 잡는다','어떻게 스스로 고치는가?']])
scene('final','03 / MY GPT HARNESS CANVAS','내 설계도, {완성}을 향해.','완성',
      '작성 상태와 실제 품질은 다르다. 설계안을 복사해 테스트하고, 검토한 뒤 제출한다.')

data=dict(title='Sound Design Lab V2 — 감각을 구조로, 구조를 결과로',
          description='김준호 교수의 30장 에이전트 하네스 강의. Sound Design Lab V2의 입력·해석·출력·QA 구조를 살펴보고 나의 GPT 설계 캔버스를 작성합니다.',
          canonical='https://mirinaeman.com/pages/sound_design_lab/',
          phases=[dict(name='문제 발견',start=1,end=5),dict(name='구조 해부',start=6,end=16),dict(name='내 GPT 조립',start=17,end=30)],
          scenes=scenes,groups=groups)
assert len(scenes)==30
(P/'content.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Authored 30 scenes and 9 worksheet groups')
