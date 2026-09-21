# Sound Design Lab — Assembly Lecture

## 메시지와 표현 권위
감각적 요청을 입력·해석·출력·검수의 구조로 만들고, 학습자가 자신의 GPT 하네스를 조립한다.
원본은 6fb2058f3018b087e2ed7d7f4455048ce4acce02의 30장 강의다.
원문·발표자 노트는 source-content.json, 재구성한 메시지는 build_content.py → content.json → render.py가 소유한다.
V2는 이 강의의 사례명이며 최신 제품 버전이라는 주장이 아니다. 출력 설계안은 예시다.

사용자가 승인한 이번 방향은 “한 장의 설계도가 완성되는 실험실”: 백색·흑연·코발트·주황,
입력 분리와 해석 모듈, 조립식 출력, 9단계 작성 시트와 마지막 설계도다.
사용자 실행 승인: “가자 이거 너무 좋아. 글자나 객체들이 동적으로 애니메이션되면서 조립이 되는데 … 특히 폰트 애니메이션을 강조하면 (크기 같은거)”.
이 승인은 제작 방향에 대한 승인이다. 완성 결과의 GOLDEN 판정으로 확대하지 않는다.

사전 성공 조회의 같은 작품에는 success_matches가 없었다. 기존 건강 앱의 ‘레이아웃 먼저’ 피드백,
제주/음악 강의의 정렬·이동 취소 경험을 적용한다. 음악 강의에 대한 “레이아웃은 좋다”와
‘코딩과 패턴이 비슷해 식상하다’는 피드백에 따라 앨범 재킷이나 코딩 강의의 표면을 복사하지 않는다.
이 작품은 사용자와 논의한 전용 표현이 권위다. 다른 성공 디자인의 색·도형을 혼합하지 않는다.

## 정지 레이아웃
styles.css :root가 색·무대·여백·타이포의 단일 정의다.
1920×1080, 좌우 96px, 위 72px, 아래 56px, 영역 간격 32px.
메타 36px / 제목 176px / 본문 592px / 하단 52px로 분리한다.
본문은 메시지에 맞게 비교·회로·해석 행·위계·실습·설계도 등으로 바뀌되 같은 바깥 기준선을 쓴다.
시트의 좌측 단계와 우측 입력은 동일한 본문 예산에 들어간다. 5항목의 최소 높이와 내부 행 높이를
명시하여 폼의 min-content가 그리드를 밀어내지 않게 했다. 빈 textarea는 스크롤되지 않는다.

글꼴은 Pretendard(SIL OFL)를 전체 강의 문자로 서브셋한 Mirinae Lab Sans다.
원본·파생 해시 및 라이선스는 assets에 있다. 표지 360px, 장 전환의 영문 290px,
한글 제목 78px(표지104/선언96), 강조 단어는 820 weight다.
추가 입력 문자는 시스템 글꼴로 폴백할 수 있다. 실제 한글 강의 문자의 누락 검사를 통과했다.

모든 발표 화면은 같은 무대를 균일 축소한다. 휴대폰 세로에서는 전체 구성이 작게 보이며
가로·큰 화면 발표를 주 용도로 한다. 조작부는 44px 기준의 별도 UI다.
JS 미실행 시 30장이 문서 흐름으로 보이고, 좁은 화면에서는 패널과 회로가 세로로 재배치된다.

## 장면별 동작
GSAP 3.15.0을 기존 저장소의 라이선스 헤더 포함 파일에서 가져와 자체 호스팅한다.
- 표지/선언: 영문 글자가 크기·회전·세로 위치를 바꾸며 조립된다.
- 주요 단어: 2.3배 크기와 가벼운 굵기에서 제목의 정해진 자리와 굵기로 들어간다.
- 6장: 입력·출력 패널이 양쪽에서 들어오고, 중앙 해석 모듈과 연결선이 완성된다.
- 7장: 하나의 요청이 네 입력으로 분리된다.
- 9장: 중심축과 보조·변주의 위계를 크기와 위치 변화로 드러낸다.
- 18–26장: 단계 지도와 작성 시트가 정렬되고 입력 행이 순서대로 드러난다.
- 30장: 9칸이 바깥에서 모여 한 장의 설계도를 완성한다.

motion.js의 MOTION이 타이밍·거리의 정본이다. 하나의 GSAP context를 취소/복원하고,
presentation.js만 현재 장면·포커스·주소를 소유한다. 빠른 이동은 이전 연출을 취소한다.
움직임 줄이기 또는 라이브러리 부재에서는 즉시 정지 레이아웃을 표시한다.
도착 후 반복 움직임, 자동 진행, 효과음은 추가하지 않았다.
Framer/Three.js/Chart.js는 이번 메시지의 구현에 필요하지 않아 로드하지 않는다.
회로는 SVG 관계도이며 실제 측정 파형이나 수치 그래프를 가장하지 않는다.
공식 API 참조: https://gsap.com/docs/v3/GSAP/Timeline/ 및 https://gsap.com/docs/v3/GSAP/gsap.context()/

## 작성과 발표
workbook.js는 9단계 32개 문자열을 브라우저에 저장한다. localStorage 권한 실패를 처리하며
전체 설계안 복사와 선택 복사 폴백을 제공한다. 원격 AI 요청·계정·음원 재생 기능은 없다.
입력칸의 방향키·Enter를 가로채지 않는다. 버튼의 Space는 한 번만 실행한다.
목차, 발표자 노트, 전체화면, 현재 장면 공유, 다시 보기, 주소의 #slide-NN을 제공한다.

## 적용 규칙과 범위
- design-discussion-before-implementation: 위 사용자 승인 방향을 구현했다.
- mandatory-public-discovery / discovery-format-and-outcome-separation: 정적 HTML, canonical,
  OG/Twitter, WebPage·CreativeWork·Person JSON-LD, robots, sitemap을 검사한다. 검색 순위·AI 인용을 보장하지 않는다.
- first-party-media-delivery / open-graph-release-integrity: 폰트·GSAP·대표 이미지를 자체 호스팅하고 해시를 검사한다.
- display-multilingual-release-contract / owner-punctuation-reading-rhythm: 제목 행과 강조 관계를 고정한다.
  영문 장식 단어는 대형 타이포 역할로 따로 정의하며 본문 크기를 장면별로 임의 축소하지 않는다.
- context-discovery-preserves-browsing: 기존 아카이브와 맥락 연결을 보존한다. 새 Work 메뉴 항목은 추가하지 않는다.
- persistence-outcome-and-cause-separation: 공개 배포와 스킬 원장 동기화 결과를 구분한다.
이미지 시네마·웹툰 전용 규칙은 이 슬라이드 강의에 적용하지 않는다.

## 4-Point
[4-Point] content.json — WHAT: 강의 하위의 메시지·작성 항목 | HOW: 정의 | WHERE: 이 30장, 타 강의 제외 | DEPTH: L1
[4-Point] render.py — WHAT: 강의 하위의 정적 출력 | HOW: 생성 | WHERE: 본문·발표노트·목차·검색 구조 | DEPTH: L1
[4-Point] styles.css — WHAT: 발표 하위의 공간·타이포 규칙 | HOW: 배치 | WHERE: 무대·시트·읽기 모드 | DEPTH: L1
[4-Point] presentation.js — WHAT: 발표 하위의 현재 장면 | HOW: 이동 | WHERE: 주소·조작·포커스 | DEPTH: L2
[4-Point] workbook.js — WHAT: 실습 하위의 작성 내용 | HOW: 저장·복사 | WHERE: 이 브라우저와 설계안 요약 | DEPTH: L2
[4-Point] motion.js — WHAT: 장면 하위의 일시 변형 | HOW: 조립 | WHERE: 표시 효과, 내용·저장·이동 상태 제외 | DEPTH: L3

## 배포와 환류
기존 https://mirinaeman.com/pages/sound_design_lab/ 를 갱신한다.
hegler02/webpage main → Vercel, body_id sound-design-lab 유지.
실제 배포 후 매클루언 원장에 덧붙이고 공개 카탈로그를 정식 렌더러로 갱신한다.
이번 결과는 기술 검증 후 DEPLOYED이며 최종 사용자 수락을 기다린다.

## Balance correction: 13 / 15
The user identified residual left-side visual weight in these two scenes. Routing now puts equal choices across the top and distributes type, incomplete approach and intended output across the full body. QA now places its identity on a shallow full-width rail above five equal review columns. This is a project-specific correction: assess the distribution of visible ink and colored surfaces after motion settles, not just the outer grid bounds. Other 28 scenes, copy and motion are preserved.
