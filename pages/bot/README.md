# Knowledge Blocks Lecture Template

학교 규정집을 업무별 지식파일과 민원봇·직원봇 샘플로 바꾸는 31장 HTML 강의 슬라이드다. 현재 강의본의 전환 큐, 방향별 플래시, 블록 라벨, 마지막 구조 링크와 저자 표기를 보존하면서 디자인 시스템을 토큰으로 분리했다.

## 파일 구조

| 파일 | 책임 |
| --- | --- |
| `index.html` | 화면 골격과 CSS·JavaScript 로딩 순서 |
| `tokens.css` | 색상, 글꼴, 프레임, 블록, 링크, 레이어, 모션, 반응형 값 |
| `styles.css` | 토큰을 소비해 HUD, 본문, 블록 장면, 링크, 컨트롤을 표현 |
| `slides.js` | 31장 문구, 정보 행, 블록 좌표, 마지막 장 링크 |
| `deck.js` | 렌더링, 전환 큐, 방향별 플래시, 키보드, 버튼, 스와이프 |
| `gpts_gems_structure_flow.html` | 30장에서 새 창으로 여는 GPTs/Gems 구조와 운영 플로우 |

## 템플릿 사용법

1. 강의 문구는 `slides.js`의 `chapter`, `label`, `title`, `lead`, `rows`만 수정한다.
2. 블록 문구나 배치가 필요할 때만 `layout`을 수정한다.
3. 색상, 크기, 간격, 전환 속도는 `slides.js`나 `deck.js`에 직접 쓰지 않고 `tokens.css`에서 수정한다.
4. 마지막 장 외부 자료는 `links` 배열에 상대 경로 또는 URL로 추가한다.
5. 현재 배열형 블록 좌표를 그대로 사용할 수 있으며, 새 슬라이드는 명명 객체 형식도 사용할 수 있다.

## 디자인 토큰 계층

```text
Primitive
  색상 · 글꼴
      ↓
Semantic
  본문 · 메타 · 표면 · 강조
      ↓
Component
  Deck · HUD · Link · Baseplate · Brick · Control
      ↓
Motion / Interaction
  전환 · 플래시 · 스태거 · 잠금 시간 · 스와이프 기준
      ↓
Responsive
  모바일 프레임 · 장면 좌표 배율 · 블록 폭 배율
```

## 보존된 동작

- 빠른 연속 이동 입력을 큐에 저장한다.
- 앞·뒤 이동 방향에 따라 플래시가 다르게 움직인다.
- 첫 장과 마지막 장에서도 이동 방향 플래시를 보여준다.
- 링크와 버튼에 포커스가 있을 때 키보드 전환을 가로채지 않는다.
- `prefers-reduced-motion` 환경에서는 장면 잠금을 즉시 해제한다.

## 실행

`http://127.0.0.1:4189/bot/index.html`