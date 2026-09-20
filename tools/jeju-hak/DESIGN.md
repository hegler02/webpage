# Coding is the Body of the Message — 승인된 리팩토링

권위: 기존 jeju_hak의 흑연색 #1e1914, 아이보리 #fbf8f5, 주홍색 #b23a26과 사용자가 승인한 직전 리팩토링 표. 승인 원문: “존나 멋지게 리펙토링해줘”. 이것은 구현 승인이지 새 결과에 대한 GOLDEN 수락이 아니다.

## 메시지
WHAT·사용자·범위·검증 기준을 정하면 AI와 함께 아이디어를 실제 서비스로 구체화할 수 있다. 강의의 15장, 세 PART, 에이블 캔버스 사례와 원래 외부 링크를 보존한다. “내가 맞나요만 한다”는 승인된 수정에 따라 “내가 근거와 결과를 검증한다”로 교체한다. 22개 관문은 기존 강의가 가리키는 전체 체계이며 이 강의의 슬라이드 수가 아니다.

## 디자인 선택
Ballpark / 9342e89b-c2fe-4acf-9993-53b44e0c13b5를 비교 후보로 조회했다. 흰 SaaS 랜딩 페이지와 고정 1.0 행간·주홍색 면적 제한이 승인된 강의의 다크/레드 PART 무대와 맞지 않아 채택하지 않았다. 후보의 토큰을 섞지 않는다. 기존 작품을 바탕으로 승인받은 네 가지 레이아웃이 이 리팩토링의 디자인 권위다.

Pretendard, SIL OFL: 하루결에서 사용한 원본을 강의의 전체 문자 집합으로 서브셋하고 예약 이름을 Mirinae Lecture Sans로 변경했다. 원본·파생 해시 및 라이선스를 함께 자체 호스팅한다. 한글·영문 혼용의 동일한 글자 밀도를 유지한다. CSS :root가 색·타입·행간·여백·무대 좌표의 정본이다. 본문은 34px, 제목 72px, 선언은 126px, 행간은 1.16/1.24/1.55의 역할 토큰을 사용한다. 좌우 96px, 제목 영역 350px, 본문 440px, 36px 간격이 모든 설명 장면의 기준이다. 제목은 의미 단위 em과 자연 줄바꿈을 사용하며 사용자 규칙에 따른 문장부호 뒤 줄바꿈만 생성기에 명시한다.

큰 화면은 1920×1080 무대 전체를 비례 축소한다. 세로 휴대폰은 사용자가 승인한 모바일 대응 범위에 따라 같은 내용/순서를 읽기 가능한 단일 열로 재배치한다. 이는 slide-builder의 기본 고정 무대 규칙에 대한 프로젝트 한정 사용자 승인 우선 적용이다. 조작부는 확대와 무관하게 최소 44px 영역을 유지한다.

## 연출
첫 장: 질문과 인물 서명, 원본 이미지로 강의 입구를 만든다.
01→05→12: PART 경계에서 주홍색 커튼과 텍스트 공개로 읽기 단위를 바꾼다.
비교형: 좌우 패널의 높이와 시작점을 동일하게 둔다.
흐름형: WHAT에서 다음 단계로 시선을 잇는다. 의미 없는 배경 입자/포인터 추적은 없다.
마지막: 선언과 명세서 시작 링크, 기초 자료와 하루결 후속 연결을 둔다.
전환 수치의 정본: motion.js timing. 중단 시 이전 연출을 취소하고 최신 장면만 남긴다. 정지 상태 레이아웃을 애니메이션이 보정하지 않는다. 효과음은 이번 범위에 추가하지 않는다.

## 4-Point
[4-Point] tools/jeju-hak/content.json + deck.html — WHAT: 강의의 내용·정체성 원본 | HOW: 정의 | WHERE: 15장 강의·공유 정보 | DEPTH: L1
[4-Point] tools/jeju-hak/render.py — WHAT: 내용 원본의 정적 HTML 컴파일러 | HOW: 생성 | WHERE: 이 강의만 | DEPTH: L1
[4-Point] styles.css — WHAT: 승인된 강의의 표현 규칙 | HOW: 배치 | WHERE: 무대·조작부·반응형 | DEPTH: L1
[4-Point] presentation.js — WHAT: 발표의 단일 이동 상태 | HOW: 이동 | WHERE: 버튼·키보드·목차·터치·주소 복원 | DEPTH: L1
[4-Point] motion.js — WHAT: 확정된 장면 사이 일시 연출 | HOW: 전환 | WHERE: opacity/transform/clip 효과와 취소 | DEPTH: L3

## 적용 CQI와 검증
하루결 layout-before-animation: 같은 높이의 패널과 정지 레이아웃을 먼저 검증.
slide-demo-feedback-20260905: 도형만으로 채우지 않고 원본 이미지 2장을 의미 있는 장면에 유지.
mandatory-public-discovery / open-graph-release-integrity / first-party-media-delivery: 정적 본문·명시적 제작자·동일canonical·자체 이미지·썸네일.
context-discovery-preserves-browsing: 원래 강의 주소 및 아카이브 항목 유지. 마지막 장에서 하루결 소개로 연결.
배포는 기존 hegler02/webpage main/Vercel 경로. 전역 디자인·다른 작품·작업 메뉴는 범위 밖.

이전 결과: git 27e82d40e892a7b38320ff098c9ad1bb786060f7의 pages/jeju_hak/index.html.
