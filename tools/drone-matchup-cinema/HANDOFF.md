# 서울 상공 — 최종 공개본 인수인계

2026-11-01 창작자가 음악과 현재 공개 결과를 최종 수용했다. 승인된 구현은 e5160c78ee77efc65c1f91cd561652ea639bb222이며 이후 문서·아카이브 승인 등록은 해당 화면을 변경하지 않는다.

- 공개: https://mirinaeman.com/pages/drone-matchup-cinema/
- 영상: pages/drone-matchup-cinema/assets/seoul-sky-v2.mp4
- 영상 SHA-256: 85737e6bf329cc489d7a0fdccc05ffb0dbbb5b8f6aa904f6be334ff043f10cf3
- 기준선: approved-release-manifest.json. 명세의 git_path는 이 저장소 기준이며 path는 원 제작 프로젝트 기준이다.
- 원 제작 프로젝트의 상세 작업 기록·원본·마스터·음악 버스·승인 원문은 별도 보존된다.

## 확정 동작

41초 A안 영상, Black Han Sans 타이틀, 강철색·황동색, 인과관계 중심 스크롤텔링. 음악은 Volatile Reaction — Kevin MacLeod, CC BY 4.0이며 크레딧을 유지해야 한다. 종료 시 썸네일과 재생 버튼으로 돌아간다. 상단은 고정되고 700px 이하에서 SVG 햄버거 메뉴로 전환한다. 메뉴 펼침·닫힘, 부드러운 구간 이동, Escape·inert·모션 감소·무JS 읽기를 지원한다.

## 작성과 배포

작성 소스는 이 디렉터리의 src/이며 pages/drone-matchup-cinema/index.html은 생성물이다. 본문은 src/content/site.json, 재생은 src/scripts/media.js, 내비게이션은 navigation.js와 styles/navigation.css다.

저장소 루트에서 `python tools/drone-matchup-cinema/build.py`로 렌더하고 `python tools/release_gate.py`로 검사한다. 원본·기존 영상·승인 기준선은 덮어쓰지 않는다. 후속 요청은 새 버전으로 검증하고 공개 URL의 실제 파일과 재생을 다시 확인한다.

## 검증과 제한

공개 HTML과 Git LF blob, 영상·OG·폰트 해시, Range 206, Vercel 성공을 확인했다. 12개 화면 폭·테마와 재생·탐색·복구·공유·키보드·모션 감소·무JS를 검사했다. 종료 복귀는 공개 1440/768/390, 메뉴는 1440/768/390/320에서 검증했다. 실제 사용자의 최종 수용을 물리 기기·스크린리더·검색 색인 검사로 확대하지 않는다.

남은 필수 제작 작업은 없다. 승인된 연출과 음악은 새 요청 없이 다시 선정하지 않는다.
