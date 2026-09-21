# 매클루언 CQI 복구 완료

2026-09-21. 이 폴더는 복구 입력과 검증 증거다. 실제 CQI 정본은 매클루언 스킬에 저장되어 있다.

## 정본 경로

- 스킬: `skill-6a5979cbf6388191bdc282f30a44aa19`
- 요약 색인: `references/message-bodies-registry.json`
- 작품별 관찰·원인·수정·검증: `references/project-evidence/<body-id>.json`
- 변경 이력: `references/revision-events/` 및 `references/revision-history/`
- 승인된 재사용 사례: `references/success-matches/sound-lab-assembly-balanced-v1.json`
- 공개 카탈로그: 스킬의 `scripts/body_archive.py export`가 생성하는 `pages/profile/data/message-bodies.json`

## 복구 범위

하루결, Coding, Suno, Sound Design Lab, ImageAgent의 실제 보존된 기록을 복원했다. 기존 작품 ID와 배포 이력을 유지했다. Sound Lab은 실제 사용자 승인과 해시가 연결된 기준선 및 성공 매칭을 복원했다. 다른 작품을 임의로 GOLDEN으로 승격하지 않았다.

## 이번 저장의 확인 결과

공식 저장 경로에서 첫 시도는 HTTP 500, 두 번째 시도는 성공했다. 원격 저장본을 다시 받아 대상 21개 파일의 내용을 모두 대조했다. 새 저장 경로·인증·강제 덮어쓰기·후크 변경을 사용하지 않았다. HTTP 500 자체의 서버 내부 원인은 확인되지 않았으며, 자동 승인 거부나 잘못된 경로로 단정할 근거는 없다.

공개 카탈로그 56개 작품의 동기화 검사와 릴리스 검사가 통과했다. 실제 공개 배포의 HTML·카탈로그·맥락 그래프·썸네일·사이트맵이 검증본과 일치한다. 상세 증거는 `verification.json`에 있다.

## 다음 작업에서 사용

스킬의 공식 query로 SLIDEBODY와 “조립”을 조회하면 승인 사례 `sound-lab-assembly-balanced-v1`과 적용 조건·회피 조건을 얻는다. 좌측 시각 무게의 원인, 균등 배치 수정, 글자와 객체의 조립이 메시지를 설명하는 이유가 연결되어 있다. 먼저 사례를 조회하고 새 메시지에 맞는지 판단한다. 100개 조합의 시험 완료를 뜻하지 않는다.

## 재발 시 절차

skill-creator와 매클루언의 `references/persistence-diagnostics.md`를 먼저 따른다. 실패 후 원격을 재조회해 실제 저장 여부를 확인하고 제한된 재시도만 수행한다. 로컬 백업이나 커밋만으로 영구 저장 완료를 선언하지 않는다. 공개 목록을 별도로 수작업 수정하거나 오래된 export로 더 최신 작품을 덮어쓰지 않는다. 스킬 검증 → 영구 저장 및 원격 내용 대조 → 공식 export → 공개 검증 순으로 닫는다.
