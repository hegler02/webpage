# 내 생각을, 작동하는 앱으로 — 레이아웃 v2

사용자 피드백: 검정 배경 반복, 왼쪽 쏠림, 오른쪽 공백, 공통 레이아웃 부족. 전체 30장 수정 승인(2026-09-30 15:54 KST). 이전 공개본은 5c58517f6b0b4ef4288f07abf9b720f8a0a6b0de로 보존된다.

기존 OPX Studio 흑백 편집 디자인을 출발점으로, 사용자가 승인한 수정 방향에 따라 밝은 설명·실습 장면과 어두운 선언·전환 장면을 구분한다. 이것은 원본 DESIGN.md를 그대로 복제한 결과가 아니라 사용자 피드백에 따른 프로젝트 표현 수정이다. 한글은 기존 OFL Noto Sans KR 400을 유지한다.

공통 무대 1920×1080, 좌우 100px, 상단 64px. 장 구분선과 제목 210px 영역, 본문 시작선, 하단 안내 90px 기준을 공유한다. 제목 80px/1.18, 본문 35px/1.67; 길이가 긴 실습은 별도 32px/1.7 역할. 제목 축소나 행간 압축으로 넘침을 숨기지 않는다. 작은 화면에서는 전체 무대를 균등 축소하며 읽기 모드는 별도이다.

단독 문장에 빈 오른쪽을 남기는 대신, 실제 차근차근 예시·판단의 결과·완료 기준을 companion 영역으로 연결한다. 1·5·10·11·19·25·29장 적용. 인용은 가로 전체, 설치는 3열, 비교는 2열, 흐름은 5단계, 확인 목록은 2×2로 배치한다. 모든 유형의 제목과 본문 기준은 공통이다.

GSAP은 장면과 data-reveal의 transform/opacity, Motion은 조작부 scale와 진행 막대만 소유한다. 기존 빠른 이동 취소, 키보드, 읽기 모드, reduced motion 유지.

검증: 전체 장표의 실제 렌더·좌우 배치·넘침·글꼴, 1920×1212 및 390×844, 읽기 모드 30장과 reduced motion 확인. 결과는 QA.json과 feedback.jsonl에 저장한다. 사용자 최종 수용은 아직 받지 않았다.

## Vertical composition v3

The user rejected v2 upper-heavy composition across the deck, with slides 23/24 as examples. Prior source bb0fb2fdc9481fd16ec0fc62fb7462bae81edc61 remains preserved. Body layouts now allocate 480–550px vertically, balancing label and explanation positions. Processes carry step numbers; check/document grids use two full rows. Prompt and companion regions stretch together; quote content is centered within its body region. Installation steps reserve separate button space. Hero composition and reading-mode reflow remain. All 30 renders were reviewed; this is implementation verification, not user acceptance. Source feedback: coding-lab-v2-bottom-space-rejected.

## Intro v4 — approved opening scene

User approved centered oversized typography, teal emphasis, idea → app → public URL choreography, dark graphite depth, and a finite ending on the human decision. Only slide 1 gains this surface. intro.html is the semantic scene; intro.css owns its tokens/layout; intro.js owns its finite GSAP timeline. Host navigation kills and clears [data-intro] alongside regular reveal targets. Motion owns intro-link brightness only; GSAP owns its opacity/translation. Ordinary control scales remain unchanged. Shared navigation commits slide 2 as before. Reduced motion/reading mode render final content immediately. Baseline d2f9fe5ad993aa932cf75f5b69ae21cf27f5787b remains preserved.
