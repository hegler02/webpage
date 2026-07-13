# Rubric Judge Editorial Lecture — 30 Slides

`E:\008_RUBRIC_JUDGE_SYSTEM_v1_0\report`의 30장 강의 내용을 디자인 토큰 기반 잡지형 HTML 슬라이드로 옮긴 독립 배포 패키지다.

## 실행

정적 파일 서버에서 `index.html`을 연다.

- 슬라이드: `./index.html`
- 상세 파일 구조: `./file_structure.html`
- 강의용 16:9 구조도: `./assets/rubric_system_landscape.svg`
- 원본 세로 구조도: `./assets/rubric_file_structure_full.svg`

폴더 내부 링크는 상대경로만 사용하므로 폴더 전체를 함께 배포하면 경로가 유지된다.

## 30장 구성

1. 1~5장 — AI 시대 과제 평가의 문제와 관점 전환
2. 6~18장 — Gestalt 6축과 출제·지도·평가 적용
3. 19~30장 — 3개 게이트, 5인 저지, 운영 흐름, 직접 설계

## 조작

- 좌우 화살표·Page Up/Down: 슬라이드 이동
- 이전·다음 버튼: 슬라이드 이동
- Space·Enter: 단계형 슬라이드의 다음 단계 공개, 모두 공개된 뒤 다음 장 이동
- 하단 목차: 현재 장 주변 8개 슬라이드로 자동 이동

## 수정 경계

| 목적 | 파일 |
| --- | --- |
| 강의 문구·링크·순서 | `slides.js` |
| 디자인 값 | `tokens.css` |
| 컴포넌트 표현 | `styles.css` |
| 렌더러·전환·상호작용 | `deck.js` |
| 상세 구조도 | `file_structure.html` |
| 강의용 구조도 | `assets/rubric_system_landscape.svg` |

## 출처 보존

원본 `report/index.html`의 30개 슬라이드 순서, 6축 배점, 3개 게이트 판정, 5인 심사, 올림픽 집계, 직접 사용 링크를 유지했다. 원본 `file_structure.html`은 같은 폴더에 그대로 포함했다.
