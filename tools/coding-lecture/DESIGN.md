# 내 생각을, 작동하는 앱으로

## 메시지와 몸
완전 초보가 자신의 판단을 PRD·코드·검증·배포까지 연결하는 강의. 사용자 승인 30장 구성과 GSAP 장면 전환/Motion 조작 반응을 적용한다. 배포 권한은 있으나 자동 검토가 운영 main 반영을 추가 승인 대상으로 차단했으므로 feature 미리보기까지만 반영한다.

## 표현 출처
OPX Studio DESIGN, bd395e2e-58a8-4626-acfa-9be8d6cdf604, https://styles.refero.design/style/bd395e2e-58a8-4626-acfa-9be8d6cdf604
코퍼스 원문 전체를 읽고 흑백·400 굵기·크기 위계·45px 윤곽 버튼·넓은 여백을 채택했다. Sequel은 제품 화면 배제 규칙으로 이 강의의 앱 시연과 충돌해 제외했다. OPX의 한국어 확장은 기존 성공 사례의 Noto 계열을 참고했으며 Noto Sans KR 400을 명시적으로 사용한다. 원본과 동일한 폰트라는 주장은 하지 않는다.

- 화면: 1920×1080 고정 무대, 전체 균등 축소. 읽기 모드는 사용자가 별도로 선택.
- 색: #020202 / #000 / #fff / #9b9b9b / #292a2c.
- 제목 80/111px, 400, 1.07; 본문 35px/1.67, 근거26px/1.67. 한국어 줄바꿈은 문장 단위.
- 폰트: @fontsource/noto-sans-kr 배포의 Korean 400 WOFF2, OFL 동봉. 강의 문자열 전체로 subset, glyph coverage 검증.
- 토큰 단일 원본: pages/coding-lab/styles.css.
- 미디어: 본 프로젝트의 실제 샘플 앱 화면. 개인 정보 없는 UI. 자료와 화면 재현을 구분.

## 장면과 움직임
- 선언: 제목이 먼저 도착하고 핵심 문장이 뒤따름.
- 비교: 두 선택을 같은 크기로 병치, 시간차로 관계 인식.
- 과정: 업로드→확인 등 실제 사건 순서대로 나타남.
- 대화: AI와 사람의 턴을 공간적으로 이동시킴.
- 실습: 복사 가능한 문장을 멈춘 화면에 유지.
- GSAP은 slide와 data-reveal의 transform/opacity. Motion은 외부 버튼 scale와 진행 막대 width만 소유.
- 빠른 입력에서 이전 timeline.kill + clearProps 후 목적 상태 확정.
- reduced motion은 지연 없이 최종 내용 표시. 자동 페이지 이동 없음.
- WGSL/Three.js: 이 설명에 별도 공간 시뮬레이션이 필요하지 않아 제외.

## 검증 기록
초기 기존 글꼴 subset에 한글 141자가 빠진 것을 실제 화면에서 발견. 전체 강의 문자의 glyph 검사를 추가하고 Noto Sans KR로 교체. 30장 범위, 단일 활성 장면, 좁은 화면 overflow, JS 오류, 읽기 모드 30장 확인. 최종 증거는 QA.json에 기록한다. 제작자 수용은 미확인.
