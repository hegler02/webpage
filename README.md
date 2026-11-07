# Mirinae MESSAGE BODIES

`mirinaeman.com` 프로필과 MESSAGE BODIES 정적 작품을 한 저장소에서 배포합니다.

## 공개 구조

- 루트 `/`는 `pages/profile/` 프로필을 보여줍니다.
- 메뉴는 홈 `/`, 작업 `/work/`, 은하수 `/galaxy/`, 연구 `/research/`, 미리내 `/mirinae/`, 소개 `/about/`입니다. 옛 주소 `/archive/`, `/notes/`, `/books/`, `/profile/`, `/constellation/`은 새 주소로 넘겨줍니다.
- 기록마다 주소가 하나입니다. 작품과 제품은 `/work/<이름>/`, 논문·책·과제·특허는 `/research/<이름>/`입니다.
- 모든 공개 페이지는 하나의 그래프에서 생성됩니다. 원본과 절차는 `docs/CONNECTING_RECORDS.md`에 있습니다.
- `pages/<slug>/index.html`은 독립 작품이며 `/pages/<slug>/`로 배포됩니다.
- GitHub `main` 반영 시 Vercel이 자동 배포하지만, `tools/release_gate.py` 실패 시 배포가 중단됩니다.

## MESSAGE BODIES

공개 작품 목록과 대표 썸네일 경로는 `pages/profile/data/message-bodies.json` 하나에서 파생됩니다. 이 파일은 매클루언 스킬의 CQI 원장에서 공개 필드만 추출한 스냅샷이며 직접 편집하지 않습니다. 각 공개 작품은 `pages/profile/assets/thumbnails/<body-id>.webp`에 960×540 WebP를 소유해야 합니다.

```bash
python3 tools/render_archive.py
python3 tools/release_gate.py
```

첫 명령은 모든 공개 페이지·은하수·사이트맵을 생성하고, 두 번째 명령은 생성물 드리프트·라우팅·SEO·타이포그래피·미디어 중복과 썸네일 소유권·크기·대체 텍스트를 검사합니다.

## 새 작품 추가

1. 작품을 배포하고 공개 URL을 검증합니다.
2. 매클루언 스킬 CQI 원장에 작품·배포 증거·대표 썸네일 원본과 해시를 등록합니다.
3. 공개 카탈로그를 `pages/profile/data/message-bodies.json`으로 내보냅니다.
4. `docs/CONNECTING_RECORDS.md`를 따라 연결을 제안합니다. 논문·책·과제·특허·제품도 같은 문서의 절차로 넣습니다.
5. 렌더러와 릴리스 게이트를 실행합니다.
6. 검증된 변경만 `main`에 반영합니다.
