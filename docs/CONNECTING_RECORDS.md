# 새 기록을 사이트에 잇는 법

작품, 논문, 책, 과제, 특허, 제품을 사이트에 올린 사람과 AI가 따르는 절차입니다. 어떤 AI든 이 문서만 읽고 할 수 있어야 합니다.

## 왜 하는가

mirinaeman.com은 하나의 그래프입니다. 기록 하나를 원본에 넣으면 그 기록의 페이지, 작업·연구 목록, 홈의 최근 기록, 은하수의 별, 사이트맵이 한 번에 생깁니다. 연결이 없는 기록은 혼자 떠 있는 별이 됩니다.

## 원본은 세 파일뿐입니다

| 파일 | 담는 것 |
|---|---|
| `pages/profile/data/message-bodies.json` | 노래, 슬라이드, 영상, 이야기, 배움 작품. README의 "새 작품 추가" 절차로 들어옵니다 |
| `pages/profile/data/records.json` | 논문, 책, 연구 과제, 특허, 연출한 뮤직비디오, 프로젝트, 제품 |
| `pages/profile/data/constellation-links.json` | 별자리와 연결. 제안과 승인이 여기 있습니다 |

생성된 HTML, `galaxy/graph.json`, `sitemap.xml`은 직접 고치지 않습니다.

기록의 이름은 명령마다 같은 형식으로 씁니다. 작품은 `songbirds`처럼 이름만, 다른 기록은 `paper:my-paper-2027`처럼 `종류:이름`으로 씁니다. 아래 예시의 `기록`, `기록A` 자리에 이 이름을 넣습니다.

Windows에서 `python3`가 없으면 `python`으로 실행하고, 한글이 깨지면 `PYTHONUTF8=1`을 붙입니다.

## 자동으로 되는 것과 사람이 정하는 것

| 일 | 누가 |
|---|---|
| 기록 페이지, 목록, 홈 최근 기록, 은하수의 별, 사이트맵 | 자동 |
| 태그가 비슷한 기록을 곁에 놓고 "함께 볼 기록"으로 보여 줌 | 자동 |
| 연구 기록의 제목에 메타버스, 양봉, 영상 같은 말이 있으면 그 주제에 이어짐 | 자동 |
| 어느 별자리에 넣을지, 무엇과 직접 이을지 제안 | AI |
| 제안을 공개로 바꿈 | 김준호 교수의 승인 |

제안(`proposed`)은 공개 페이지에 나오지 않습니다. 승인(`approved`)한 것만 나옵니다.

## 절차

**1. 기록을 넣습니다.**

작품이 아닌 기록은 명령으로 넣습니다.

```bash
python3 tools/records.py add paper my-paper-2027 --title "논문 제목" --summary "학술지 · 권(호) · 쪽 · DOI" --year 2027 --url "https://..." --tags metaverse,education
python3 tools/records.py add book my-book --title "책 제목" --summary "김준호 · 출판사 · 2027" --year 2027 --url "https://..." --tags ai-literacy --image assets/images/existing/book-x.jpg --alt "책 표지"
```

종류는 `paper`, `book`, `project`, `patent`, `film`, `collection`, `product`입니다. 영문 이름이 주소가 됩니다(`/research/my-paper-2027/`). 한 번 정한 이름은 바꾸지 않습니다. 태그는 비슷한 기록을 찾는 단서이니 소개 문장에서 확인되는 것만 씁니다.

**2. 연결을 정합니다.**

```bash
python3 tools/render_archive.py
python3 tools/constellation_links.py todo
python3 tools/constellation_links.py list
```

`todo`에 나온 기록마다 소개 문장과 실제 페이지를 읽고 아래 중 하나를 고릅니다. 논문·과제·특허처럼 페이지가 서지뿐이면 제목과 서지 문장이 근거입니다. 위에서부터 먼저 생각합니다. 페이지가 열리지 않으면 소개 문장만 근거로 제안하고, 페이지가 열리지 않는다고 보고합니다. 배포 상태나 주소를 임의로 고치지 않습니다.

**같은 작품의 다른 형태이거나 직접 이어지는 기록이 있다**

```bash
python3 tools/constellation_links.py pair 기록A 기록B --label "같은 이야기, 다른 장르" --reason "생일 한턱 이야기를 포크와 힙합으로 만들었습니다."
```

**이미 있는 별자리에 맞는다**

```bash
python3 tools/constellation_links.py add 기록 --to causal-chain --reason "감독의 상상을 짧은 인과 문장으로 연결한 결투 연구입니다."
```

아직 승인을 기다리는 별자리(`list`에서 `proposed`)에 넣어도 됩니다. 이미 승인된 별자리에 넣어도 그 기록은 승인 전까지 공개되지 않습니다.

**맞는 별자리가 없고 같은 주제의 기록이 둘 이상 있다**

```bash
python3 tools/constellation_links.py new 영문이름 --title "별자리 이름" --text "이 별자리가 무엇인지 한 문장."
python3 tools/constellation_links.py add 기록A --to 영문이름 --reason "..."
python3 tools/constellation_links.py add 기록B --to 영문이름 --reason "..."
```

**정말 이을 곳이 없다**

```bash
python3 tools/constellation_links.py solo 기록 --why "묶을 근거를 찾지 못했습니다."
```

작품은 `songbirds`처럼 이름만, 다른 기록은 `paper:my-paper-2027`처럼 종류를 붙여 씁니다. 한 기록을 여러 별자리에 넣어도 됩니다. 억지로 잇는 것보다 `solo`가 낫습니다.

교수님이 중요한 자료라고 한 기록은 `add`에 `--key`를 붙입니다. 별이 더 크게 보이고 연구 목록에서 "주요 논문"으로 먼저 나옵니다. AI가 스스로 중요하다고 판단해 붙이지 않습니다.

**3. 다시 만들고 검사합니다.**

```bash
python3 tools/render_archive.py
python3 tools/release_gate.py
```

다시 만들면 새 기록과 태그가 겹치는 기존 기록의 "함께 볼 기록"도 함께 바뀝니다. 그 변경은 정상이니 함께 올립니다.

연결을 정하지 않은 기록이 남아 있거나, 기록이 페이지·목록·사이트맵·은하수 중 한 곳이라도 빠지면 `release_gate.py`가 실패하고 배포가 멈춥니다. 제안만 해도 통과합니다.

화면은 `python3 tools/serve_site.py 4330`으로 띄워 `http://localhost:4330/`에서 확인합니다. 실제 배포와 같은 주소 규칙을 씁니다.

## 이유를 쓰는 기준

- 그 기록의 공개된 소개 문장이나 페이지에서 확인한 사실만 씁니다. 추측하지 않습니다.
- 90자 안의 한 문장으로, 왜 여기 속하는지를 씁니다. "관련 있음" 같은 말은 쓰지 않습니다.
- 태그가 같다는 것만으로는 근거가 되지 않습니다. 태그는 별을 가깝게 놓을 뿐입니다.
- 영향이나 인용 관계를 주장하지 않습니다. 인용 수 같은 수치는 출처가 있을 때만 씁니다.
- 작가의 의도를 대신 쓰지 않습니다. 작가의 말이 필요하면 제안하지 말고 묻습니다.

## 승인

AI는 스스로 승인하지 않습니다. 승인을 기다리는 것을 보여 줍니다.

```bash
python3 tools/constellation_links.py review
```

교수님이 승인한다고 말한 것만 처리합니다.

```bash
python3 tools/constellation_links.py approve causal-chain judgment
```

별자리를 승인하면 그 별자리에 제안된 기록도 함께 승인됩니다. 기록 하나만 승인할 때는 `constellation-links.json`에서 그 항목의 `"status": "proposed"`를 지우고, 연결 하나는 `status`를 `approved`로 바꿉니다. 빼라고 하면 그 항목을 지웁니다. 승인 뒤 `render_archive.py`와 `release_gate.py`를 실행합니다.

## MIRINAEVERSE 글

글은 절차 없이 들어옵니다. `tools/update_channel.py`가 매일 아침 워드프레스에서 모든 글을 읽어 `data/channel.json`에 넣고, 글마다 은하수의 별이 생깁니다. 새 글이 배포를 막는 일은 없습니다.

| 일 | 누가 |
|---|---|
| 별, 홈의 새 글 레일, 태그로 비슷한 기록 곁에 놓기 | 자동 |
| 글 본문이 mirinaeman.com의 기록을 링크하면 그 기록과 잇기 (글쓴이가 직접 건 연결입니다) | 자동 |
| 어느 별자리에 넣을지, 무엇과 직접 이을지 제안 | AI |
| 제안을 공개로 바꿈 | 김준호 교수의 승인 |

글의 이름은 `post:826`처럼 씁니다. 제안할 글은 `todo` 끝에 나오고, 명령은 다른 기록과 같습니다.

```bash
python3 tools/constellation_links.py add post:808 --to causal-chain --reason "킹콩과 드론의 공격과 추락을 단문 인과체인으로 이은 영상의 기록입니다."
```

글의 본문은 이 사이트로 옮기지 않습니다. 별을 누르면 MIRINAEVERSE의 글이 열립니다.

## 영상과 음원

The Mirinaeman Project 채널의 영상과 앨범도 `tools/update_channel.py`가 매일 읽어 은하수의 별로 넣습니다. 영상은 `video:아이디`, 앨범은 `album:아이디`입니다. 로파이처럼 끝없이 이어지는 시리즈는 `series:lofi`처럼 별 하나로 묶고 편수만 셉니다. 새 시리즈를 묶으려면 `update_channel.py`의 `SERIES`와 `constellation_data.py`의 `SERIES`에 함께 넣습니다.

채널에 속한다는 연결만 자동입니다. 별자리와 작품 연결은 글과 똑같이 AI가 제안하고 교수님이 승인합니다. 채널 전체를 처음부터 다시 읽으려면 `python3 tools/update_channel.py --all`을 실행합니다.

## 건드리지 않는 것

- 다른 맥락 파일(`context-graph.json`, `wind-context.json` 등)은 작가가 쓴 글이 근거입니다. 그 글이 바뀔 때만 고칩니다.
- 손으로 쓴 작품해설(`/archive/…`, `/notes/…`)의 본문은 고치지 않습니다. 그 아래의 맥락은 `site/editorial-context.json`에서 자동으로 붙습니다.
- 메뉴(홈, 작업, 은하수, 연구, 미리내, 소개)와 주소는 교수님의 승인 없이 바꾸지 않습니다.
- 별의 자리는 `data/galaxy-layout.json`에 남습니다. 새 기록만 자리를 찾고 나머지는 움직이지 않습니다. 하늘 전체를 다시 배치하는 `python3 tools/galaxy_layout.py --full`은 교수님이 원할 때만 씁니다.

## 파일

| 파일 | 역할 |
|---|---|
| `tools/records.py` | 작품 밖 기록을 넣고 검사합니다 |
| `tools/constellation_links.py` | 연결 제안, 승인, 검사 |
| `tools/constellation_data.py` | 원본을 하나의 그래프로 모읍니다. 승인된 연결만 넣습니다 |
| `tools/site_graph.py` | 그래프에 주소, 별의 자리, 비슷한 기록을 붙입니다 |
| `tools/render_site.py` | 모든 공개 페이지를 그래프에서 만듭니다 |
| `tools/update_channel.py` | 영상, 음원, MIRINAEVERSE 글을 매일 읽어 옵니다 |
| `tools/render_archive.py` | 위를 한 번에 실행하는 명령입니다 |
| `tools/check_site.py` | 모든 기록이 제자리에 닿았는지, 모든 링크가 열리는지, 모든 스타일이 토큰인지 검사합니다 |
| `tools/test_site_growth.py` | 새 노래와 새 논문을 넣어 보고 모든 화면에 닿는지 시험합니다 |
| `pages/profile/site/tokens.css` | 색, 간격, 글자, 움직임의 유일한 원본입니다 |
