# Storyboard Timeline Template

`매체는 메시지의 몸` 36장 강의용 HTML 슬라이드입니다. 스토리보드형 미디어 프레임과 넷플릭스식 하단 타임라인을 사용합니다.

## 실행

로컬 서버가 `samples` 폴더를 서빙 중이면 아래 URL로 엽니다.

```text
http://127.0.0.1:4189/storyboard_timeline_template/index.html
```

## 구조

```text
storyboard_timeline_template/
├── index.html   # 레이아웃 골격
├── styles.css   # 스토리보드/필름 타임라인 디자인
├── slides.js    # 36장 강의 내용 데이터
└── deck.js      # 렌더링, 키보드, 타임라인 이동
```

## 수정 방법

- 강의 내용은 `slides.js`의 `slides` 배열만 수정합니다.
- 왼쪽 하이어라키는 `hierarchy` 배열에서 수정합니다.
- 미디어 프레임 타입은 `media.mode`로 선택합니다.

지원 모드:

```text
image    # 한 장면 / 이미지형
webtoon  # 패널과 여백
video    # 쇼트/컷 타임라인
map      # 하이어라키 지도
table    # 매체 비교표
links    # 실습 에이전트 링크
appendix # 16:9 별첨 이미지
```

## 의도

레고 블록 템플릿은 지식봇/규정집처럼 모듈 조립을 설명할 때 적합합니다.
이 템플릿은 이미지, 웹툰, 영상처럼 매체 변환과 시간/컷/프레임을 설명하는 강의에 맞춥니다.