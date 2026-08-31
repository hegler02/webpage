# Mirinae MESSAGE BODIES

`mirinaeman.com` 프로필과 MESSAGE BODIES 정적 작품을 한 저장소에서 배포합니다.

## 공개 구조

- 루트 `/`는 `pages/profile/` 프로필을 보여줍니다.
- `/work/`, `/archive/`, `/books/`, `/mirinae/`, `/profile/`은 프로필의 정규 공개 주소입니다.
- `pages/<slug>/index.html`은 독립 작품이며 `/pages/<slug>/`로 배포됩니다.
- GitHub `main` 반영 시 Vercel이 자동 배포하지만, `tools/release_gate.py` 실패 시 배포가 중단됩니다.

## MESSAGE BODIES

공개 작품 목록은 `pages/profile/data/message-bodies.json` 하나에서 파생됩니다. 이 파일은 매클루언 스킬의 CQI 원장에서 공개 필드만 추출한 스냅샷이며 직접 편집하지 않습니다.

```bash
python3 tools/render_archive.py
python3 tools/release_gate.py
```

첫 명령은 아카이브·홈 최신 작품·사이트맵을 생성하고, 두 번째 명령은 생성물 드리프트·라우팅·SEO·타이포그래피·미디어 중복을 검사합니다.

## 새 작품 추가

1. 작품을 배포하고 공개 URL을 검증합니다.
2. 매클루언 스킬 CQI 원장에 작품과 배포 증거를 등록합니다.
3. 공개 카탈로그를 `pages/profile/data/message-bodies.json`으로 내보냅니다.
4. 렌더러와 릴리스 게이트를 실행합니다.
5. 검증된 변경만 `main`에 반영합니다.
