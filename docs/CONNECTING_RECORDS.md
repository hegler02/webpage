# 새 기록을 은하수에 잇는 법

아카이브에 작품이나 기록을 추가한 사람과 AI가 따르는 절차입니다. 어떤 AI든 이 문서만 읽고 할 수 있어야 합니다.

## 왜 하는가

미리내맨 은하수는 맥락 그래프입니다. 별의 자리는 연결이 정합니다. 연결이 없는 기록은 혼자 떠 있는 별이 됩니다.

## 자동으로 되는 것과 사람이 정하는 것

| 일 | 누가 |
|---|---|
| 아카이브에 등록된 기록이 별이 되고 창작자와 이어짐 | 자동 |
| 어느 별자리에 넣을지 제안 | AI |
| 제안을 공개로 바꿈 | 김준호 교수의 승인 |

제안(`proposed`)은 공개 페이지에 나오지 않습니다. 승인(`approved`)한 것만 나옵니다.

## 절차

새 기록을 `pages/profile/data/message-bodies.json`에 등록한 뒤 실행합니다.

```bash
python3 tools/render_archive.py
python3 tools/constellation_links.py todo
python3 tools/constellation_links.py list
```

이 절차는 노래, 영상, 강의, 글 등 아카이브의 모든 기록에 적용합니다. 작품해설을 쓰는 일은 `docs/WORK_NOTES_PUBLISHING.md`의 별도 절차입니다.

`todo`에 나온 기록마다 소개 문장과 실제 페이지를 읽고 아래 중 하나를 고릅니다. 위에서부터 먼저 생각합니다. 페이지가 열리지 않으면 소개 문장만 근거로 제안하고, 페이지가 열리지 않는다고 보고합니다. 배포 상태나 주소를 임의로 고치지 않습니다.

**1. 같은 작품의 다른 형태이거나 직접 이어지는 기록이 있다**

```bash
python3 tools/constellation_links.py pair 기록A 기록B --label "같은 이야기, 다른 장르" --reason "생일 한턱 이야기를 포크와 힙합으로 만들었습니다."
```

**2. 이미 있는 별자리에 맞는다**

```bash
python3 tools/constellation_links.py add 기록 --to causal-chain --reason "감독의 상상을 짧은 인과 문장으로 연결한 결투 연구입니다."
```

**3. 맞는 별자리가 없고 같은 주제의 기록이 둘 이상 있다**

```bash
python3 tools/constellation_links.py new 영문이름 --title "별자리 이름" --text "이 별자리가 무엇인지 한 문장."
python3 tools/constellation_links.py add 기록A --to 영문이름 --reason "..."
python3 tools/constellation_links.py add 기록B --to 영문이름 --reason "..."
```

**4. 정말 이을 곳이 없다**

```bash
python3 tools/constellation_links.py solo 기록 --why "묶을 근거를 찾지 못했습니다."
```

한 기록을 여러 별자리에 넣어도 됩니다. 억지로 잇는 것보다 `solo`가 낫습니다.

마지막으로 검사합니다.

```bash
python3 tools/render_archive.py
python3 tools/release_gate.py
```

연결을 정하지 않은 기록이 남아 있으면 `release_gate.py`가 실패하고 배포가 멈춥니다. 제안만 해도 통과합니다.

## 이유를 쓰는 기준

- 그 기록의 공개된 소개 문장이나 페이지에서 확인한 사실만 씁니다. 추측하지 않습니다.
- 90자 안의 한 문장으로, 왜 여기 속하는지를 씁니다. "관련 있음" 같은 말은 쓰지 않습니다.
- 태그가 같다는 것만으로는 근거가 되지 않습니다. 태그는 별을 가깝게 놓을 뿐입니다.
- 영향이나 인용 관계를 주장하지 않습니다.
- 작가의 의도를 대신 쓰지 않습니다. 작가의 말이 필요하면 제안하지 말고 묻습니다.

## 승인

AI는 스스로 승인하지 않습니다. 교수님께 별자리 이름과 들어갈 기록을 보여 주고, 교수님이 승인한다고 말한 것만 처리합니다.

```bash
python3 tools/constellation_links.py approve causal-chain judgment
```

연결 하나를 승인할 때는 `pages/profile/data/constellation-links.json`에서 그 항목의 `status`를 `approved`로 바꿉니다. 빼라고 하면 그 항목을 지웁니다.

승인 뒤 `render_archive.py`와 `release_gate.py`를 실행하면 `graph.json`에 반영됩니다.

## 건드리지 않는 것

- 다른 맥락 파일(`context-graph.json`, `wind-context.json` 등)은 작가가 쓴 글이 근거입니다. 그 글이 바뀔 때만 고칩니다.
- `graph.json`과 생성된 HTML은 직접 고치지 않습니다.
- 메뉴나 섹션을 새로 만들지 않습니다.

## 파일

| 파일 | 역할 |
|---|---|
| `pages/profile/data/constellation-links.json` | 별자리와 연결의 원본. 제안과 승인이 여기 있습니다 |
| `tools/constellation_links.py` | 추가, 승인, 검사 도구 |
| `tools/constellation_data.py` | 승인된 것을 `graph.json`에 넣습니다 |
| `tools/test_constellation_links.py` | 이 구조의 시험 |
| `tools/constellation/preview/` | 제안까지 포함한 은하수 시안을 만듭니다 |

시안을 다시 만들 때는 아래를 실행합니다. Pillow와 fontTools가 필요합니다.

```bash
python3 tools/constellation/preview/build.py 출력폴더
```
