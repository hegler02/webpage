window.STORYBOARD_TEMPLATE = {
  "hierarchy": [
    {
      "id": "question",
      "title": "질문",
      "desc": "왜 같은 이야기가 매체마다 달라지는가"
    },
    {
      "id": "kernel",
      "title": "메시지 커널",
      "desc": "끝까지 남길 한 문장"
    },
    {
      "id": "chain",
      "title": "단문 인과 체인",
      "desc": "한 줄은 한 판단"
    },
    {
      "id": "anchor",
      "title": "앵커",
      "desc": "Keep · Mutate · Avoid"
    },
    {
      "id": "image",
      "title": "이미지",
      "desc": "공간으로 함축"
    },
    {
      "id": "webtoon",
      "title": "웹툰",
      "desc": "컷과 여백으로 함축"
    },
    {
      "id": "video",
      "title": "영상",
      "desc": "시간과 움직임으로 함축"
    },
    {
      "id": "verify",
      "title": "검증",
      "desc": "AI는 제안하고 인간은 승인"
    },
    {
      "id": "appendix",
      "title": "별첨",
      "desc": "사례 이미지로 다시 확인"
    }
  ],
  "slides": [
    {
      "chapter": "Opening",
      "step": "kernel",
      "accent": "#ffb85c",
      "title": "매체는\n메시지의 몸",
      "lead": "이미지에서 웹툰으로, 웹툰에서 영상으로. 그리고 생성형 AI까지 이어지는 한 문장으로 시작한다.",
      "points": [
        [
          "Today",
          "이미지 · 웹툰 · 영상 · 생성형 AI"
        ],
        [
          "Claim",
          "매체는 메시지를 담는 형식이 아니라 몸이다"
        ]
      ],
      "media": {
        "mode": "image",
        "title": "One Message / Three Bodies",
        "panels": [
          "이미지",
          "웹툰",
          "영상"
        ]
      },
      "timeline": "제목"
    },
    {
      "chapter": "Question",
      "step": "question",
      "accent": "#66e0d2",
      "title": "왜 같은 이야기가\n이미지에선 살고\n영상에선 죽는가?",
      "lead": "매체를 바꾸면 메시지의 몸도 바뀐다. 몸을 모르고 변환하면 결과는 쉽게 무너진다.",
      "points": [
        [
          "Symptom",
          "한 장면은 강렬한데 영상으로 늘리면 흐려진다"
        ],
        [
          "Cause",
          "매체의 문법을 보지 않고 표면만 바꾼다"
        ]
      ],
      "media": {
        "mode": "video",
        "title": "Same Story / Different Body",
        "panels": [
          "살아남음",
          "늘어짐",
          "붕괴"
        ]
      },
      "timeline": "질문"
    },
    {
      "chapter": "Roadmap",
      "step": "question",
      "accent": "#7bd88f",
      "title": "네 정거장으로\n한 뿌리를 본다",
      "lead": "질문에서 시작해 개념을 세우고, 이미지 · 웹툰 · 영상에 적용한 뒤 AI 시대의 승인 원칙으로 닫는다.",
      "points": [
        [
          "1",
          "왜 대부분 실패하는가"
        ],
        [
          "2",
          "메시지의 몸이란 무엇인가"
        ],
        [
          "3",
          "이미지 · 웹툰 · 영상에 어떻게 적용하는가"
        ]
      ],
      "media": {
        "mode": "map",
        "title": "Lecture Map"
      },
      "timeline": "여정"
    },
    {
      "chapter": "Reference 28",
      "step": "appendix",
      "accent": "#66e0d2",
      "title": "영상 언어의\n하이어라키",
      "lead": "프로젝트에서 컷까지 내려가는 구조를 먼저 본다. 뒤의 모든 개념은 이 지도 위에 놓인다.",
      "points": [
        [
          "Place",
          "전체 지도 직후"
        ],
        [
          "Key",
          "컷은 편집 경계, 쇼트는 촬영 단위"
        ]
      ],
      "media": {
        "mode": "appendix",
        "title": "Reference 28",
        "src": "assets/appendix/appendix-28.webp",
        "alt": "영상 언어의 하이어라키 참고 이미지"
      },
      "timeline": "28"
    },
    {
      "chapter": "Problem",
      "step": "question",
      "accent": "#ff6b6b",
      "title": "도구는 폭발했다\n그런데 기억에 남는 건 줄었다",
      "lead": "누구나 이미지와 영상을 뽑아내지만, 메시지 구조가 없으면 결과물은 빨리 사라진다.",
      "points": [
        [
          "Tools",
          "생성 도구는 무한히 늘어났다"
        ],
        [
          "Memory",
          "기억에 남는 콘텐츠는 오히려 줄었다"
        ]
      ],
      "media": {
        "mode": "image",
        "title": "Infinite Tools / Zero Memory",
        "panels": [
          "∞",
          "→",
          "0"
        ]
      },
      "timeline": "문제"
    },
    {
      "chapter": "Problem",
      "step": "question",
      "accent": "#ffb85c",
      "title": "도구를 몰라서\n실패하지 않는다",
      "lead": "실패의 핵심은 프롬프트 기술 부족이 아니라 메시지 구조 부재다. 표면부터 시작하면 예쁘지만 비어 있다.",
      "points": [
        [
          "False",
          "프롬프트를 더 배우면 해결된다"
        ],
        [
          "True",
          "메시지 구조가 없어서 실패한다"
        ]
      ],
      "media": {
        "mode": "video",
        "title": "Surface First Failure",
        "panels": [
          "스타일",
          "표면",
          "공백"
        ]
      },
      "timeline": "구조"
    },
    {
      "chapter": "Core",
      "step": "kernel",
      "accent": "#9d83ff",
      "title": "메시지의 몸\n= 단문 인과 체인",
      "lead": "오늘의 심장이다. 메시지는 한 줄이 한 판단인 문장들의 사슬로 먼저 존재한다.",
      "points": [
        [
          "Body",
          "매체 이전에 메시지의 몸이 있다"
        ],
        [
          "Unit",
          "한 문장은 한 판단이어야 한다"
        ]
      ],
      "media": {
        "mode": "map",
        "title": "Message Body"
      },
      "timeline": "개념"
    },
    {
      "chapter": "Chain",
      "step": "chain",
      "accent": "#66e0d2",
      "title": "한 문장\n한 판단\n한 비트",
      "lead": "줄마다 판단 하나다. 한 줄만 바뀌어도 이야기가 바뀐다. 이 체인이 매체에 독립적인 원본이다.",
      "points": [
        [
          "Bit 1",
          "문을 연다"
        ],
        [
          "Bit 2",
          "빈 방을 본다"
        ],
        [
          "Bit 3",
          "잘못됐음을 깨닫는다"
        ]
      ],
      "media": {
        "mode": "video",
        "title": "Causal Bits",
        "panels": [
          "문을 연다",
          "빈 방",
          "깨닫는다"
        ]
      },
      "timeline": "비트"
    },
    {
      "chapter": "Reference 29",
      "step": "appendix",
      "accent": "#7bd88f",
      "title": "쇼트는 시선의 그릇\n비트는 인식 변화다",
      "lead": "물리적 컷이 없어도 한 쇼트 안에서 관객의 인식은 여러 번 전환된다.",
      "points": [
        [
          "Shot",
          "하나의 연속된 시선 단위"
        ],
        [
          "Beat",
          "관객 인식이 바뀌는 단위"
        ],
        [
          "Point",
          "심리적 컷은 있다"
        ]
      ],
      "media": {
        "mode": "appendix",
        "title": "Reference 29",
        "src": "assets/appendix/appendix-29.webp",
        "alt": "쇼트는 시선의 그릇 비트는 인식 변화다 참고 이미지"
      },
      "timeline": "29"
    },
    {
      "chapter": "Chain",
      "step": "chain",
      "accent": "#7bd88f",
      "title": "쉼표로 묶으면\n판단이 뭉개진다",
      "lead": "한 덩어리 문장은 어디를 고쳐야 할지 보이지 않는다. 비트로 쪼개야 수정 가능해진다.",
      "points": [
        [
          "Bad",
          "문을 열고 방을 보고 놀라 비명을 질렀다"
        ],
        [
          "Good",
          "문을 연다 → 본다 → 놀란다 → 물러선다 → 비명"
        ]
      ],
      "media": {
        "mode": "webtoon",
        "title": "Lump vs Bits",
        "panels": [
          "덩어리",
          "분해",
          "수정"
        ]
      },
      "timeline": "분해"
    },
    {
      "chapter": "Compression",
      "step": "chain",
      "accent": "#ffb85c",
      "title": "요약은 덜어낸다\n함축은 한 단위에 살린다",
      "lead": "요약은 내용을 줄이고, 함축은 핵심을 한 단위 안에 살아 있게 압축한다. 매체는 전부 함축의 기술이다.",
      "points": [
        [
          "Summary",
          "덜어내기"
        ],
        [
          "Compression",
          "한 단위에 살리기"
        ],
        [
          "Media",
          "함축의 방식"
        ]
      ],
      "media": {
        "mode": "image",
        "title": "Compress, Not Remove",
        "panels": [
          "덜어냄",
          "압축",
          "살림"
        ]
      },
      "timeline": "함축"
    },
    {
      "chapter": "Anchor",
      "step": "anchor",
      "accent": "#ff6b6b",
      "title": "Keep\nMutate\nAvoid",
      "lead": "구조보다 먼저 고정한다. 스타일은 앵커를 덮을 수 없다. AI 작업에서 가장 자주 무너지는 지점이다.",
      "points": [
        [
          "Keep",
          "절대 유지할 얼굴 · 톤 · 설정"
        ],
        [
          "Mutate",
          "변주해도 되는 표면"
        ],
        [
          "Avoid",
          "무너지면 안 되는 금지선"
        ]
      ],
      "media": {
        "mode": "video",
        "title": "Anchor Lock",
        "panels": [
          "Keep",
          "Mutate",
          "Avoid"
        ]
      },
      "timeline": "앵커"
    },
    {
      "chapter": "Render",
      "step": "anchor",
      "accent": "#66e0d2",
      "title": "렌더 수는\n목표가 아니다",
      "lead": "그림 수, 컷 수, 쇼트 수는 이해의 결과다. 담기면 함축하고, 안 담기면 분할한다.",
      "points": [
        [
          "Wrong",
          "컷 10개 만들어줘"
        ],
        [
          "Right",
          "판단이 몇 개인지 먼저 본다"
        ],
        [
          "Rule",
          "담기면 함축, 안 담기면 분할"
        ]
      ],
      "media": {
        "mode": "webtoon",
        "title": "Bit → Render",
        "panels": [
          "비트",
          "함축",
          "분할"
        ]
      },
      "timeline": "렌더"
    },
    {
      "chapter": "Principle",
      "step": "kernel",
      "accent": "#9d83ff",
      "title": "같은 체인을\n매체의 본성으로\n함축한다",
      "lead": "이미지는 공간, 웹툰은 공간과 여백, 영상은 공간과 시간을 더한다. 압축이 점점 풀리는 순서다.",
      "points": [
        [
          "Image",
          "공간"
        ],
        [
          "Webtoon",
          "공간 + 여백"
        ],
        [
          "Video",
          "공간 + 시간"
        ]
      ],
      "media": {
        "mode": "table",
        "title": "Media Dimensions",
        "rows": [
          [
            "이미지",
            "공간",
            "한 프레임"
          ],
          [
            "웹툰",
            "공간 + 여백",
            "패널"
          ],
          [
            "영상",
            "공간 + 시간",
            "쇼트"
          ]
        ]
      },
      "timeline": "원리"
    },
    {
      "chapter": "Image 01",
      "step": "image",
      "accent": "#ffb85c",
      "title": "이미지는\n공간으로 함축한다",
      "lead": "시간이 없다. 그래서 체인 전체를 한 프레임에 압축한다. 가장 압축률이 높은 매체다.",
      "points": [
        [
          "Dimension",
          "공간"
        ],
        [
          "Unit",
          "한 프레임"
        ],
        [
          "Question",
          "한 장면에 담기는가"
        ]
      ],
      "media": {
        "mode": "image",
        "title": "Image Grammar",
        "panels": [
          "1 Frame",
          "공간",
          "압축"
        ]
      },
      "timeline": "이미지"
    },
    {
      "chapter": "Image 02",
      "step": "image",
      "accent": "#ffb85c",
      "title": "한 장면이\n모든 판단을 품는다",
      "lead": "구도, 빛, 시선, 사물 하나하나가 체인의 한 줄이다. 보는 사람은 0.5초 안에 읽어낸다.",
      "points": [
        [
          "문",
          "기울어진 문은 긴장을 만든다"
        ],
        [
          "사물",
          "흩어진 물건은 사건을 암시한다"
        ],
        [
          "시선",
          "인물의 시선은 다음 판단을 만든다"
        ]
      ],
      "media": {
        "mode": "image",
        "title": "Spatial Clues",
        "panels": [
          "문",
          "사물",
          "시선"
        ]
      },
      "timeline": "한 장"
    },
    {
      "chapter": "Image 03",
      "step": "image",
      "accent": "#66e0d2",
      "title": "이미지 ×\n생성형 AI",
      "lead": "프롬프트는 단문 체인을 공간 언어로 번역하는 작업이다. 막연한 형용사보다 판단을 먼저 고정한다.",
      "points": [
        [
          "Input",
          "단문 인과 체인"
        ],
        [
          "Translate",
          "공간 언어"
        ],
        [
          "Lock",
          "앵커 먼저 고정 → 한 장 생성"
        ]
      ],
      "media": {
        "mode": "video",
        "title": "Chain → Spatial Prompt",
        "panels": [
          "체인",
          "공간 언어",
          "한 장"
        ]
      },
      "timeline": "이미지AI"
    },
    {
      "chapter": "Webtoon 01",
      "step": "webtoon",
      "accent": "#7bd88f",
      "title": "웹툰은\n컷과 여백으로\n함축한다",
      "lead": "판단을 패널로 자르고, 칸 사이 여백이 시간을 만든다. 이미지에 없던 사이가 생긴다.",
      "points": [
        [
          "Dimension",
          "공간 + 여백"
        ],
        [
          "Unit",
          "패널"
        ],
        [
          "Question",
          "어디서 끊는가"
        ]
      ],
      "media": {
        "mode": "webtoon",
        "title": "Panel + Gutter",
        "panels": [
          "컷",
          "여백",
          "컷"
        ]
      },
      "timeline": "웹툰"
    },
    {
      "chapter": "Reference 33",
      "step": "appendix",
      "accent": "#7bd88f",
      "title": "만화는 공간 위에\n시간을 배열한다",
      "lead": "영상은 실제 시간이 흐르고, 만화는 독자의 시선 이동이 시간을 만든다.",
      "points": [
        [
          "Comic",
          "컷과 여백으로 시간 생성"
        ],
        [
          "Reader",
          "독자가 순서를 따라 시간을 완성"
        ]
      ],
      "media": {
        "mode": "appendix",
        "title": "Reference 33",
        "src": "assets/appendix/appendix-33.webp",
        "alt": "만화는 공간 위에 시간을 배열한다 참고 이미지"
      },
      "timeline": "33"
    },
    {
      "chapter": "Reference 34",
      "step": "appendix",
      "accent": "#7bd88f",
      "title": "만화의\n하이어라키",
      "lead": "페이지, 블록, 패널, 컷, 요소로 내려가는 위계가 독자의 읽기 순서를 설계한다.",
      "points": [
        [
          "Page",
          "전체 목적과 흐름"
        ],
        [
          "Panel",
          "읽기 경로"
        ],
        [
          "Element",
          "감정과 정보의 배치"
        ]
      ],
      "media": {
        "mode": "appendix",
        "title": "Reference 34",
        "src": "assets/appendix/appendix-34.webp",
        "alt": "만화의 하이어라키 참고 이미지"
      },
      "timeline": "34"
    },
    {
      "chapter": "Webtoon 02",
      "step": "webtoon",
      "accent": "#7bd88f",
      "title": "보이지 않는 사이를\n독자가 완성한다",
      "lead": "칼을 든 손 다음에 바닥에 떨어진 칼을 보여주면, 그 사이의 시간은 독자가 채운다.",
      "points": [
        [
          "Cut 1",
          "칼을 든 손"
        ],
        [
          "Gap",
          "보이지 않는 시간"
        ],
        [
          "Cut 2",
          "바닥에 떨어진 칼"
        ]
      ],
      "media": {
        "mode": "webtoon",
        "title": "Closure",
        "panels": [
          "칼을 든 손",
          "여백",
          "떨어진 칼"
        ]
      },
      "timeline": "폐쇄성"
    },
    {
      "chapter": "Reference 35",
      "step": "appendix",
      "accent": "#9d83ff",
      "title": "블록 · 비트 · 컷\n분할의 세부 설계",
      "lead": "좋은 만화는 정보와 감정을 읽히는 순서로 배치한다. 컷 분할은 독자의 경험 설계다.",
      "points": [
        [
          "Block",
          "정보 묶음"
        ],
        [
          "Beat",
          "인식 변화"
        ],
        [
          "Cut",
          "리듬과 전환"
        ]
      ],
      "media": {
        "mode": "appendix",
        "title": "Reference 35",
        "src": "assets/appendix/appendix-35.webp",
        "alt": "블록 · 비트 · 컷 분할의 세부 설계 참고 이미지"
      },
      "timeline": "35"
    },
    {
      "chapter": "Webtoon 03",
      "step": "webtoon",
      "accent": "#66e0d2",
      "title": "웹툰 ×\n생성형 AI",
      "lead": "어디서 끊고 어디를 여백으로 둘지가 연출의 핵심이다. 캐릭터 일관성은 앵커로 잡는다.",
      "points": [
        [
          "Chain",
          "체인 → 컷 분할"
        ],
        [
          "Anchor",
          "앵커 → 캐릭터 일관성"
        ],
        [
          "Direction",
          "보이지 않는 사이를 설계한다"
        ]
      ],
      "media": {
        "mode": "webtoon",
        "title": "Cut Planning",
        "panels": [
          "체인",
          "컷 분할",
          "캐릭터"
        ]
      },
      "timeline": "웹툰AI"
    },
    {
      "chapter": "Video 01",
      "step": "video",
      "accent": "#66e0d2",
      "title": "영상은\n시간과 움직임으로\n함축한다",
      "lead": "공간에 시간이 곱해진다. 가장 풍부하지만 가장 쉽게 늘어진다. 압축이 풀린 만큼 통제가 어렵다.",
      "points": [
        [
          "Dimension",
          "공간 + 시간"
        ],
        [
          "Unit",
          "쇼트"
        ],
        [
          "Risk",
          "늘어짐"
        ]
      ],
      "media": {
        "mode": "video",
        "title": "Space × Time",
        "panels": [
          "공간",
          "시간",
          "움직임"
        ]
      },
      "timeline": "영상"
    },
    {
      "chapter": "Video 02",
      "step": "video",
      "accent": "#9d83ff",
      "title": "쇼트와 컷을\n구분해야 한다",
      "lead": "쇼트는 AI가 만드는 한 클립이고, 컷은 사람이 잇는 경계다. 컷은 영상의 closure다.",
      "points": [
        [
          "Shot",
          "AI가 만드는 1클립"
        ],
        [
          "Cut",
          "사람이 잇는 편집 경계"
        ],
        [
          "Closure",
          "관객이 사이를 연결한다"
        ]
      ],
      "media": {
        "mode": "video",
        "title": "Shot / Cut",
        "panels": [
          "쇼트",
          "컷",
          "연결"
        ]
      },
      "timeline": "쇼트컷"
    },
    {
      "chapter": "Reference 30",
      "step": "appendix",
      "accent": "#ffb85c",
      "title": "쇼트와 컷\n무엇이 다른가?",
      "lead": "쇼트는 어떻게 볼 것인가를 정하고, 컷은 어디서 자르고 연결할 것인가를 정한다.",
      "points": [
        [
          "Shot",
          "시선과 연출 단위"
        ],
        [
          "Cut",
          "절단과 전환 단위"
        ]
      ],
      "media": {
        "mode": "appendix",
        "title": "Reference 30",
        "src": "assets/appendix/appendix-30.webp",
        "alt": "쇼트와 컷 무엇이 다른가? 참고 이미지"
      },
      "timeline": "30"
    },
    {
      "chapter": "Reference 31",
      "step": "appendix",
      "accent": "#ffb85c",
      "title": "쇼트와 컷의 차이\n세분화해서 보기",
      "lead": "정의, 목적, 설계 시점, 실무 적용까지 나누어 보면 쇼트와 컷의 역할이 분명해진다.",
      "points": [
        [
          "Before",
          "쇼트는 먼저 설계"
        ],
        [
          "After",
          "컷은 편집에서 결정"
        ],
        [
          "Core",
          "좋은 영상은 둘이 함께 만든다"
        ]
      ],
      "media": {
        "mode": "appendix",
        "title": "Reference 31",
        "src": "assets/appendix/appendix-31.webp",
        "alt": "쇼트와 컷의 차이 세분화해서 보기 참고 이미지"
      },
      "timeline": "31"
    },
    {
      "chapter": "Reference 32",
      "step": "appendix",
      "accent": "#ff6b6b",
      "title": "한 장면 안의\n심리적 커팅과 비트",
      "lead": "좋은 이미지는 한 장 안에서도 시선 흐름과 인식 전환을 순서대로 설계한다.",
      "points": [
        [
          "Block",
          "무엇을 보여줄지 정함"
        ],
        [
          "Beat",
          "언제 인식이 바뀌는지 정함"
        ],
        [
          "Cutting",
          "물리적 컷 없이도 전환 발생"
        ]
      ],
      "media": {
        "mode": "appendix",
        "title": "Reference 32",
        "src": "assets/appendix/appendix-32.webp",
        "alt": "한 장면 안의 심리적 커팅과 비트 참고 이미지"
      },
      "timeline": "32"
    },
    {
      "chapter": "Video 03",
      "step": "video",
      "accent": "#ffb85c",
      "title": "한 비트를\n어떻게 쇼트로\n만드나",
      "lead": "여러 판단을 한 클립에 함축할 수도 있고, 한 판단을 여러 쇼트로 펼칠 수도 있다.",
      "points": [
        [
          "Synthesis",
          "여러 판단을 한 클립에 함축"
        ],
        [
          "Split",
          "한 판단을 여러 쇼트로 펼침"
        ],
        [
          "Rule",
          "무작정 늘리면 늘어진다"
        ]
      ],
      "media": {
        "mode": "video",
        "title": "Synthesis / Split",
        "panels": [
          "합성 쇼트",
          "분할",
          "몽타주"
        ]
      },
      "timeline": "쇼트설계"
    },
    {
      "chapter": "Video 04",
      "step": "video",
      "accent": "#66e0d2",
      "title": "영상 ×\n생성형 AI",
      "lead": "곧장 영상부터 만들면 통제가 어렵다. 정지 이미지를 먼저 승인하고, 그다음 움직임을 입힌다.",
      "points": [
        [
          "1",
          "First Frame 승인"
        ],
        [
          "2",
          "움직임 프롬프트"
        ],
        [
          "3",
          "편집 · 대위법은 사람의 권한"
        ]
      ],
      "media": {
        "mode": "video",
        "title": "First Frame → Motion",
        "panels": [
          "첫 프레임",
          "움직임",
          "편집"
        ]
      },
      "timeline": "영상AI"
    },
    {
      "chapter": "Reference 36",
      "step": "appendix",
      "accent": "#9d83ff",
      "title": "대위법이란?",
      "lead": "서로 독립적인 두 흐름이 교차하면서 관객의 인식 속에서 제3의 의미를 만든다.",
      "points": [
        [
          "Formula",
          "A + B = E"
        ],
        [
          "Edit",
          "교차 편집"
        ],
        [
          "Meaning",
          "새 의미 생성"
        ]
      ],
      "media": {
        "mode": "appendix",
        "title": "Reference 36",
        "src": "assets/appendix/appendix-36.webp",
        "alt": "대위법이란? 참고 이미지"
      },
      "timeline": "36"
    },
    {
      "chapter": "Reference 37",
      "step": "appendix",
      "accent": "#ff6b6b",
      "title": "몽타주는 접합이고\n대위법은 충돌이다",
      "lead": "이미지를 이어붙이는 기술과, 그 접합이 새 의미를 만드는 원리를 구분한다.",
      "points": [
        [
          "Montage",
          "무엇을 어떤 순서로 붙이는가"
        ],
        [
          "Counterpoint",
          "무엇과 무엇이 충돌하는가"
        ]
      ],
      "media": {
        "mode": "appendix",
        "title": "Reference 37",
        "src": "assets/appendix/appendix-37.webp",
        "alt": "몽타주는 접합이고 대위법은 충돌이다 참고 이미지"
      },
      "timeline": "37"
    },
    {
      "chapter": "Reference 38",
      "step": "appendix",
      "accent": "#66e0d2",
      "title": "대위법 활용 비교\n영상 vs 만화",
      "lead": "같은 원리라도 영상은 시간과 움직임으로, 만화는 컷과 여백으로 표현한다.",
      "points": [
        [
          "Video",
          "시간 속 교차"
        ],
        [
          "Comic",
          "공간 안 병치"
        ],
        [
          "Common",
          "심리적 커팅 설계"
        ]
      ],
      "media": {
        "mode": "appendix",
        "title": "Reference 38",
        "src": "assets/appendix/appendix-38.webp",
        "alt": "대위법 활용 비교 영상 vs 만화 참고 이미지"
      },
      "timeline": "38"
    },
    {
      "chapter": "Compare",
      "step": "verify",
      "accent": "#9d83ff",
      "title": "한 체인,\n세 개의 몸",
      "lead": "전부 같은 커널이다. 차이는 매체가 더하는 차원과 AI가 생성하는 단위다.",
      "points": [
        [
          "Spine",
          "단문 체인 → 앵커 → 비트 → 렌더 → 검증"
        ],
        [
          "Difference",
          "매체가 더하는 차원만 다르다"
        ]
      ],
      "media": {
        "mode": "table",
        "title": "One Chain / Three Bodies",
        "rows": [
          [
            "이미지",
            "공간",
            "한 프레임"
          ],
          [
            "웹툰",
            "공간 + 여백",
            "패널"
          ],
          [
            "영상",
            "공간 + 시간",
            "쇼트"
          ]
        ]
      },
      "timeline": "비교"
    },
    {
      "chapter": "Human",
      "step": "verify",
      "accent": "#ff6b6b",
      "title": "AI는 제안한다\n인간은 승인한다",
      "lead": "무엇을 남기고 무엇을 못 바꾸게 할지 결정하는 권한은 사람에게 있다.",
      "points": [
        [
          "AI",
          "무한히 변주를 제안한다"
        ],
        [
          "Human",
          "판단을 남기고 금지선을 승인한다"
        ]
      ],
      "media": {
        "mode": "image",
        "title": "Approval Gate",
        "panels": [
          "제안",
          "검토",
          "승인"
        ]
      },
      "timeline": "승인"
    },
    {
      "chapter": "Close",
      "step": "verify",
      "accent": "#ffb85c",
      "title": "매체를 고르기 전에\n체인을 써라",
      "lead": "같은 이야기가 살아나는지 죽는지는 여기서 갈린다. 하단 에이전트는 실습으로 이어지는 출구다.",
      "points": [
        [
          "Before",
          "단문 인과 체인을 쓴다"
        ],
        [
          "Then",
          "매체 문법으로 바꾼다"
        ],
        [
          "After",
          "메시지가 살아 있는지 검증한다"
        ]
      ],
      "media": {
        "mode": "links",
        "title": "Practice Agents",
        "links": [
          {
            "title": "이미지 에이전트",
            "desc": "Image Harness",
            "href": "https://chatgpt.com/g/g-69f085b428c88191960302b3654a8549-mirinaeman-image-harness"
          },
          {
            "title": "웹툰 에이전트",
            "desc": "Toon Agent Harness",
            "href": "https://chatgpt.com/g/g-69f1a14a8ac0819192833ee6fc24add6-mirinaeman-toon-agent-harness"
          },
          {
            "title": "동영상 에이전트",
            "desc": "Video Agent Harness",
            "href": "https://chatgpt.com/g/g-6a1bcbd742f08191924f7aa4eec427d8-mirinaeman-video-agent-harness-v1-0"
          },
          {
            "title": "웹페이지 빌더",
            "desc": "Webpage Builder",
            "href": "https://chatgpt.com/g/g-69e779b09e8881918f566d099cfd58b6-webpage-gpt-builder-1-5"
          }
        ]
      },
      "timeline": "닫기"
    }
  ]
};
