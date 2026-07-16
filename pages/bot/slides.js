"use strict";

// Full 31-slide lecture data. Edit content and scene positions here; visual decisions live in tokens.css.
window.KNOWLEDGE_BLOCK_SLIDES = [
  {
    "chapter": "01 — Opening",
    "accent": "blue",
    "label": "Opening",
    "title": "학교 규정집을\n지식봇으로",
    "lead": "좋은 지식봇은 거대한 AI 하나가 아니라 작은 업무봇들의 질서 있는 조합이다.",
    "rows": [
      [
        "Today",
        "업무별 지식파일 만들기"
      ],
      [
        "Sample",
        "민원봇과 직원봇"
      ],
      [
        "Rule",
        "원문 보존과 검증게이트"
      ]
    ],
    "layout": {
      "source": [
        -250,
        -92,
        0,
        146,
        "원본",
        "blue",
        -8
      ],
      "excerpt": [
        -44,
        -154,
        0,
        132,
        "발췌",
        "yellow",
        7
      ],
      "rule": [
        170,
        -78,
        0,
        116,
        "규칙",
        "green",
        -4
      ],
      "law": [
        -198,
        76,
        0,
        118,
        "법령",
        "purple",
        10
      ],
      "gate": [
        16,
        50,
        0,
        134,
        "게이트",
        "red",
        -6
      ],
      "citizen": [
        230,
        66,
        0,
        124,
        "민원",
        "cyan",
        8
      ],
      "staff": [
        90,
        150,
        0,
        116,
        "직원",
        "blue",
        -9
      ]
    }
  },
  {
    "chapter": "02 — Problem",
    "accent": "yellow",
    "label": "Problem",
    "title": "규정집은\n너무 크다",
    "lead": "학칙, 등록금, 수강신청, 졸업, 장학, 부칙과 별표가 한 파일에 섞여 있다.",
    "rows": [
      [
        "Risk",
        "범위가 흐려짐"
      ],
      [
        "Symptom",
        "근거 혼선"
      ],
      [
        "Start",
        "반복 문의부터 분해"
      ]
    ],
    "layout": {
      "source": [
        -152,
        70,
        0,
        168,
        "학칙",
        "blue",
        0
      ],
      "excerpt": [
        18,
        70,
        0,
        168,
        "매뉴얼",
        "yellow",
        0
      ],
      "rule": [
        -152,
        -8,
        28,
        168,
        "공지",
        "green",
        0
      ],
      "law": [
        18,
        -8,
        28,
        168,
        "법령",
        "purple",
        0
      ],
      "gate": [
        -152,
        -86,
        56,
        168,
        "서식",
        "red",
        0
      ],
      "citizen": [
        18,
        -86,
        56,
        168,
        "답변",
        "cyan",
        0
      ],
      "staff": [
        -67,
        -164,
        84,
        168,
        "혼선",
        "red",
        0
      ]
    }
  },
  {
    "chapter": "03 — Bad Approach",
    "accent": "green",
    "label": "Bad Approach",
    "title": "몽창 업로드는\n위험하다",
    "lead": "민원인용 안내와 직원용 판단이 섞이면 답변 책임과 근거 체계가 무너진다.",
    "rows": [
      [
        "Mix",
        "안내·작성·검토 혼재"
      ],
      [
        "Risk",
        "없는 내용 생성"
      ],
      [
        "Fix",
        "목적별 분리"
      ]
    ],
    "layout": {
      "source": [
        -152,
        70,
        0,
        168,
        "학칙",
        "blue",
        0
      ],
      "excerpt": [
        18,
        70,
        0,
        168,
        "매뉴얼",
        "yellow",
        0
      ],
      "rule": [
        -152,
        -8,
        28,
        168,
        "공지",
        "green",
        0
      ],
      "law": [
        18,
        -8,
        28,
        168,
        "법령",
        "purple",
        0
      ],
      "gate": [
        -152,
        -86,
        56,
        168,
        "서식",
        "red",
        0
      ],
      "citizen": [
        18,
        -86,
        56,
        168,
        "답변",
        "cyan",
        0
      ],
      "staff": [
        -67,
        -164,
        84,
        168,
        "혼선",
        "red",
        0
      ]
    }
  },
  {
    "chapter": "04 — Principle",
    "accent": "red",
    "label": "Principle",
    "title": "유닉스처럼\n작게 만든다",
    "lead": "하나의 봇이 모든 일을 하지 않는다. 각 봇은 하나의 목적을 정확히 맡는다.",
    "rows": [
      [
        "One Job",
        "한 봇 한 책임"
      ],
      [
        "Compose",
        "필요할 때 조합"
      ],
      [
        "Stop",
        "근거 없으면 중단"
      ]
    ],
    "layout": {
      "source": [
        -238,
        62,
        0,
        136,
        "원본",
        "blue",
        0
      ],
      "excerpt": [
        -100,
        62,
        0,
        136,
        "발췌",
        "yellow",
        0
      ],
      "rule": [
        38,
        62,
        0,
        136,
        "규칙",
        "green",
        0
      ],
      "law": [
        176,
        62,
        0,
        136,
        "법령",
        "purple",
        0
      ],
      "gate": [
        -169,
        -18,
        18,
        136,
        "검증",
        "red",
        0
      ],
      "citizen": [
        -31,
        -18,
        18,
        136,
        "민원봇",
        "cyan",
        0
      ],
      "staff": [
        107,
        -18,
        18,
        136,
        "직원봇",
        "blue",
        0
      ]
    }
  },
  {
    "chapter": "05 — Scope",
    "accent": "purple",
    "label": "Scope",
    "title": "이번 목표는\n지식파일이다",
    "lead": "민원봇과 직원봇은 최종 목적이 아니라 업무별 지식파일을 보여주는 샘플 결과물이다.",
    "rows": [
      [
        "Core",
        "업무별 지식파일"
      ],
      [
        "Demo",
        "민원봇·직원봇"
      ],
      [
        "Output",
        "업로드 가능한 패키지"
      ]
    ],
    "layout": {
      "source": [
        -210,
        72,
        0,
        146,
        "원문",
        "blue",
        0
      ],
      "excerpt": [
        -62,
        72,
        0,
        146,
        "공통규칙",
        "yellow",
        0
      ],
      "rule": [
        86,
        72,
        0,
        146,
        "검증",
        "red",
        0
      ],
      "law": [
        -172,
        -14,
        30,
        168,
        "민원봇",
        "cyan",
        -3
      ],
      "gate": [
        56,
        -14,
        30,
        168,
        "직원봇",
        "purple",
        3
      ],
      "citizen": [
        -172,
        -98,
        60,
        168,
        "안내",
        "green",
        -3
      ],
      "staff": [
        56,
        -98,
        60,
        168,
        "초안",
        "green",
        3
      ]
    }
  },
  {
    "chapter": "06 — Architecture",
    "accent": "cyan",
    "label": "Architecture",
    "title": "원본에서\n봇까지",
    "lead": "마스터 원본을 보존하고 원문발췌, 공통 규칙, 법령 매핑, 검증게이트를 조립한다.",
    "rows": [
      [
        "Source",
        "마스터 원본"
      ],
      [
        "Build",
        "원문발췌와 공통 파일"
      ],
      [
        "Deploy",
        "GPTs/Gems Knowledge"
      ]
    ],
    "layout": {
      "source": [
        -250,
        86,
        0,
        126,
        "원본",
        "blue",
        0
      ],
      "excerpt": [
        -120,
        58,
        14,
        126,
        "원문발췌",
        "yellow",
        0
      ],
      "rule": [
        10,
        30,
        28,
        126,
        "지식파일",
        "green",
        0
      ],
      "law": [
        140,
        2,
        42,
        126,
        "법령매핑",
        "purple",
        0
      ],
      "gate": [
        10,
        -76,
        70,
        126,
        "검증",
        "red",
        0
      ],
      "citizen": [
        -120,
        -104,
        56,
        126,
        "민원봇",
        "cyan",
        0
      ],
      "staff": [
        140,
        -104,
        56,
        126,
        "직원봇",
        "blue",
        0
      ]
    }
  },
  {
    "chapter": "07 — Master Source",
    "accent": "blue",
    "label": "Master Source",
    "title": "원본은\n건드리지 않는다",
    "lead": "공식 원본은 재료다. 수정하지 않고, 모든 발췌와 해설은 별도 파일에서 관리한다.",
    "rows": [
      [
        "Keep",
        "마스터 원본 보존"
      ],
      [
        "Trace",
        "파일명과 개정일"
      ],
      [
        "Never",
        "원본 직접 편집 금지"
      ]
    ],
    "layout": {
      "source": [
        -238,
        62,
        0,
        136,
        "원본",
        "blue",
        0
      ],
      "excerpt": [
        -100,
        62,
        0,
        136,
        "원문",
        "yellow",
        0
      ],
      "rule": [
        38,
        62,
        0,
        136,
        "조항",
        "yellow",
        0
      ],
      "law": [
        176,
        62,
        0,
        136,
        "항·호",
        "yellow",
        0
      ],
      "gate": [
        -169,
        -12,
        18,
        136,
        "개정일",
        "yellow",
        0
      ],
      "citizen": [
        -31,
        -12,
        18,
        136,
        "출처",
        "yellow",
        0
      ],
      "staff": [
        107,
        -12,
        18,
        136,
        "파일명",
        "yellow",
        0
      ]
    }
  },
  {
    "chapter": "08 — Excerpt",
    "accent": "yellow",
    "label": "Excerpt",
    "title": "원문발췌는\n증거 보관함",
    "lead": "원문발췌 파일은 설명서가 아니다. 관련 조항을 그대로 복사해 보존하는 증거 보관함이다.",
    "rows": [
      [
        "Keep",
        "조항 번호와 제목"
      ],
      [
        "Keep",
        "항·호 구조"
      ],
      [
        "Ban",
        "요약·해설 삽입 금지"
      ]
    ],
    "layout": {
      "source": [
        -238,
        62,
        0,
        136,
        "원본",
        "blue",
        0
      ],
      "excerpt": [
        -100,
        62,
        0,
        136,
        "원문",
        "yellow",
        0
      ],
      "rule": [
        38,
        62,
        0,
        136,
        "조항",
        "yellow",
        0
      ],
      "law": [
        176,
        62,
        0,
        136,
        "항·호",
        "yellow",
        0
      ],
      "gate": [
        -169,
        -12,
        18,
        136,
        "개정일",
        "yellow",
        0
      ],
      "citizen": [
        -31,
        -12,
        18,
        136,
        "출처",
        "yellow",
        0
      ],
      "staff": [
        107,
        -12,
        18,
        136,
        "파일명",
        "yellow",
        0
      ]
    }
  },
  {
    "chapter": "09 — Eight Files",
    "accent": "green",
    "label": "Eight Files",
    "title": "8개 업무로\n먼저 나눈다",
    "lead": "휴복학, 수강신청, 졸업요건, 성적이의, 장학, 등록금환불, 현장실습, 기타공통으로 시작한다.",
    "rows": [
      [
        "File",
        "*_원문발췌.md"
      ],
      [
        "Unit",
        "반복 문의 기준"
      ],
      [
        "Goal",
        "찾기 쉬운 근거"
      ]
    ],
    "layout": {
      "source": [
        -190,
        112,
        0,
        144,
        "휴복학",
        "green",
        0
      ],
      "excerpt": [
        -44,
        112,
        0,
        144,
        "수강신청",
        "green",
        0
      ],
      "rule": [
        102,
        112,
        0,
        144,
        "졸업요건",
        "green",
        0
      ],
      "law": [
        -118,
        40,
        22,
        144,
        "장학",
        "cyan",
        0
      ],
      "gate": [
        28,
        40,
        22,
        144,
        "등록금",
        "cyan",
        0
      ],
      "citizen": [
        -44,
        -32,
        44,
        144,
        "성적이의",
        "purple",
        0
      ],
      "staff": [
        -44,
        -104,
        66,
        144,
        "현장실습",
        "blue",
        0
      ]
    }
  },
  {
    "chapter": "10 — Three Layers",
    "accent": "red",
    "label": "Three Layers",
    "title": "원문과 해설을\n분리한다",
    "lead": "마스터 원본, 원문발췌, 지식파일은 서로 다른 역할을 가진다.",
    "rows": [
      [
        "Master",
        "수정 금지"
      ],
      [
        "Excerpt",
        "근거 보존"
      ],
      [
        "Knowledge",
        "설명·응대·초안"
      ]
    ],
    "layout": {
      "source": [
        -220,
        78,
        0,
        142,
        "마스터",
        "blue",
        0
      ],
      "excerpt": [
        -76,
        78,
        0,
        142,
        "원문발췌",
        "yellow",
        0
      ],
      "rule": [
        68,
        78,
        0,
        142,
        "05 제약",
        "green",
        0
      ],
      "law": [
        212,
        78,
        0,
        142,
        "07 법령",
        "purple",
        0
      ],
      "gate": [
        -76,
        -8,
        28,
        142,
        "08 검증",
        "red",
        0
      ],
      "citizen": [
        68,
        -8,
        28,
        142,
        "프롬프트",
        "cyan",
        0
      ],
      "staff": [
        -4,
        -94,
        58,
        172,
        "Knowledge",
        "blue",
        0
      ]
    }
  },
  {
    "chapter": "11 — AI Role",
    "accent": "purple",
    "label": "AI Role",
    "title": "AI는 원문\n보관자가 아니다",
    "lead": "AI는 찾고 분류하고 설명할 수 있지만, 원문을 임의로 다시 쓰게 하면 안 된다.",
    "rows": [
      [
        "Allow",
        "후보 찾기"
      ],
      [
        "Allow",
        "쉬운 설명 초안"
      ],
      [
        "Ban",
        "원문 재작성"
      ]
    ],
    "layout": {
      "source": [
        -238,
        62,
        0,
        136,
        "원본",
        "blue",
        0
      ],
      "excerpt": [
        -100,
        62,
        0,
        136,
        "발췌",
        "yellow",
        0
      ],
      "rule": [
        38,
        62,
        0,
        136,
        "규칙",
        "green",
        0
      ],
      "law": [
        176,
        62,
        0,
        136,
        "법령",
        "purple",
        0
      ],
      "gate": [
        -169,
        -18,
        18,
        136,
        "검증",
        "red",
        0
      ],
      "citizen": [
        -31,
        -18,
        18,
        136,
        "민원봇",
        "cyan",
        0
      ],
      "staff": [
        107,
        -18,
        18,
        136,
        "직원봇",
        "blue",
        0
      ]
    }
  },
  {
    "chapter": "12 — Extraction",
    "accent": "cyan",
    "label": "Extraction",
    "title": "발췌는 창작이\n아니라 복사다",
    "lead": "조항 후보는 도구가 찾을 수 있지만 최종 원문은 원본에서 직접 대조해 가져온다.",
    "rows": [
      [
        "Find",
        "조항 후보"
      ],
      [
        "Copy",
        "원본에서 직접 복사"
      ],
      [
        "Check",
        "번호·제목·개정일"
      ]
    ],
    "layout": {
      "source": [
        -250,
        86,
        0,
        126,
        "원본",
        "blue",
        0
      ],
      "excerpt": [
        -120,
        58,
        14,
        126,
        "원문발췌",
        "yellow",
        0
      ],
      "rule": [
        10,
        30,
        28,
        126,
        "지식파일",
        "green",
        0
      ],
      "law": [
        140,
        2,
        42,
        126,
        "법령매핑",
        "purple",
        0
      ],
      "gate": [
        10,
        -76,
        70,
        126,
        "검증",
        "red",
        0
      ],
      "citizen": [
        -120,
        -104,
        56,
        126,
        "민원봇",
        "cyan",
        0
      ],
      "staff": [
        140,
        -104,
        56,
        126,
        "직원봇",
        "blue",
        0
      ]
    }
  },
  {
    "chapter": "13 — Knowledge File",
    "accent": "blue",
    "label": "Knowledge File",
    "title": "지식파일은\n업무 설명서다",
    "lead": "지식파일에는 적용 범위, 학교 규정 근거, 상위 법령 매핑, 안내 원칙, 확인 항목을 둔다.",
    "rows": [
      [
        "Scope",
        "적용 범위"
      ],
      [
        "Ground",
        "학교 규정 근거"
      ],
      [
        "Check",
        "직원 확인 항목"
      ]
    ],
    "layout": {
      "source": [
        -220,
        78,
        0,
        142,
        "마스터",
        "blue",
        0
      ],
      "excerpt": [
        -76,
        78,
        0,
        142,
        "원문발췌",
        "yellow",
        0
      ],
      "rule": [
        68,
        78,
        0,
        142,
        "05 제약",
        "green",
        0
      ],
      "law": [
        212,
        78,
        0,
        142,
        "07 법령",
        "purple",
        0
      ],
      "gate": [
        -76,
        -8,
        28,
        142,
        "08 검증",
        "red",
        0
      ],
      "citizen": [
        68,
        -8,
        28,
        142,
        "프롬프트",
        "cyan",
        0
      ],
      "staff": [
        -4,
        -94,
        58,
        172,
        "Knowledge",
        "blue",
        0
      ]
    }
  },
  {
    "chapter": "14 — Upload Shape",
    "accent": "yellow",
    "label": "Upload Shape",
    "title": "업로드는\n11개 Knowledge",
    "lead": "실제 봇 패키지는 시스템프롬프트와 11개 Knowledge 파일로 구성한다.",
    "rows": [
      [
        "Common",
        "05·07·08"
      ],
      [
        "Excerpt",
        "원문발췌 8개"
      ],
      [
        "Prompt",
        "봇별 시스템프롬프트"
      ]
    ],
    "layout": {
      "source": [
        -220,
        78,
        0,
        142,
        "마스터",
        "blue",
        0
      ],
      "excerpt": [
        -76,
        78,
        0,
        142,
        "원문발췌",
        "yellow",
        0
      ],
      "rule": [
        68,
        78,
        0,
        142,
        "05 제약",
        "green",
        0
      ],
      "law": [
        212,
        78,
        0,
        142,
        "07 법령",
        "purple",
        0
      ],
      "gate": [
        -76,
        -8,
        28,
        142,
        "08 검증",
        "red",
        0
      ],
      "citizen": [
        68,
        -8,
        28,
        142,
        "프롬프트",
        "cyan",
        0
      ],
      "staff": [
        -4,
        -94,
        58,
        172,
        "Knowledge",
        "blue",
        0
      ]
    }
  },
  {
    "chapter": "15 — Common Rules",
    "accent": "green",
    "label": "Common Rules",
    "title": "공통 규칙이\n연결 브릭이다",
    "lead": "민원봇과 직원봇은 같은 원문발췌와 공통 규칙을 공유하되 출력 권한만 다르게 가진다.",
    "rows": [
      [
        "05",
        "제약 규칙"
      ],
      [
        "07",
        "법령 매핑"
      ],
      [
        "08",
        "검증게이트"
      ]
    ],
    "layout": {
      "source": [
        -220,
        78,
        0,
        142,
        "마스터",
        "blue",
        0
      ],
      "excerpt": [
        -76,
        78,
        0,
        142,
        "원문발췌",
        "yellow",
        0
      ],
      "rule": [
        68,
        78,
        0,
        142,
        "05 제약",
        "green",
        0
      ],
      "law": [
        212,
        78,
        0,
        142,
        "07 법령",
        "purple",
        0
      ],
      "gate": [
        -76,
        -8,
        28,
        142,
        "08 검증",
        "red",
        0
      ],
      "citizen": [
        68,
        -8,
        28,
        142,
        "프롬프트",
        "cyan",
        0
      ],
      "staff": [
        -4,
        -94,
        58,
        172,
        "Knowledge",
        "blue",
        0
      ]
    }
  },
  {
    "chapter": "16 — Law Chain",
    "accent": "red",
    "label": "Law Chain",
    "title": "학교 규정은\n법령과 연결된다",
    "lead": "학교 학칙만으로 끝내지 않고 상위 법령, 시행령, 시행세칙, 최신 공지까지 사슬을 만든다.",
    "rows": [
      [
        "Top",
        "상위 법령"
      ],
      [
        "School",
        "학칙과 세칙"
      ],
      [
        "Notice",
        "최신 공지 확인"
      ]
    ],
    "layout": {
      "source": [
        -224,
        100,
        0,
        134,
        "상위법",
        "purple",
        0
      ],
      "excerpt": [
        -88,
        72,
        16,
        134,
        "시행령",
        "purple",
        0
      ],
      "rule": [
        48,
        44,
        32,
        134,
        "학칙",
        "blue",
        0
      ],
      "law": [
        184,
        16,
        48,
        134,
        "세칙",
        "green",
        0
      ],
      "gate": [
        48,
        -70,
        72,
        134,
        "최신공지",
        "yellow",
        0
      ],
      "citizen": [
        -88,
        -98,
        56,
        134,
        "안내",
        "cyan",
        0
      ],
      "staff": [
        184,
        -98,
        56,
        134,
        "확인",
        "red",
        0
      ]
    }
  },
  {
    "chapter": "17 — Mapping",
    "accent": "purple",
    "label": "Mapping",
    "title": "법령 매핑표가\n필요하다",
    "lead": "업무 주제마다 학교 규정, 상위 법령, 답변 등급을 연결해 답변의 한계를 드러낸다.",
    "rows": [
      [
        "Topic",
        "업무 주제"
      ],
      [
        "Law",
        "상위 법령"
      ],
      [
        "Grade",
        "안내·주의·확인"
      ]
    ],
    "layout": {
      "source": [
        -224,
        100,
        0,
        134,
        "상위법",
        "purple",
        0
      ],
      "excerpt": [
        -88,
        72,
        16,
        134,
        "시행령",
        "purple",
        0
      ],
      "rule": [
        48,
        44,
        32,
        134,
        "학칙",
        "blue",
        0
      ],
      "law": [
        184,
        16,
        48,
        134,
        "세칙",
        "green",
        0
      ],
      "gate": [
        48,
        -70,
        72,
        134,
        "최신공지",
        "yellow",
        0
      ],
      "citizen": [
        -88,
        -98,
        56,
        134,
        "안내",
        "cyan",
        0
      ],
      "staff": [
        184,
        -98,
        56,
        134,
        "확인",
        "red",
        0
      ]
    }
  },
  {
    "chapter": "18 — Gate",
    "accent": "cyan",
    "label": "Gate",
    "title": "검증게이트가\n답변을 막는다",
    "lead": "근거 조항, 법령 연결, 최신 공지, 개별 판단, 개인정보 포함 여부를 답변 전에 확인한다.",
    "rows": [
      [
        "Ask",
        "근거가 있는가"
      ],
      [
        "Ask",
        "개인정보나 단정이 섞였는가"
      ],
      [
        "Stop",
        "부족하면 답변 금지"
      ]
    ],
    "layout": {
      "source": [
        -220,
        84,
        0,
        132,
        "근거",
        "red",
        0
      ],
      "excerpt": [
        -86,
        84,
        0,
        132,
        "원문",
        "red",
        0
      ],
      "rule": [
        48,
        84,
        0,
        132,
        "개인정보",
        "red",
        0
      ],
      "law": [
        182,
        84,
        0,
        132,
        "짧은안내",
        "red",
        0
      ],
      "gate": [
        -86,
        2,
        30,
        132,
        "파일확인",
        "yellow",
        0
      ],
      "citizen": [
        48,
        2,
        30,
        132,
        "최신공지",
        "yellow",
        0
      ],
      "staff": [
        -18,
        -82,
        62,
        164,
        "검증게이트",
        "red",
        0
      ]
    }
  },
  {
    "chapter": "19 — Prompt Limit",
    "accent": "blue",
    "label": "Prompt Limit",
    "title": "프롬프트만으로는\n부족하다",
    "lead": "말로 정한 규칙은 모델이 놓칠 수 있다. 원문 대조가 확실하지 않으면 인용하지 않게 해야 한다.",
    "rows": [
      [
        "Reality",
        "프롬프트는 검사기가 아님"
      ],
      [
        "Rule",
        "대조 불확실하면 인용 금지"
      ],
      [
        "Next",
        "자동 확인으로 보강"
      ]
    ],
    "layout": {
      "source": [
        -220,
        84,
        0,
        132,
        "근거",
        "red",
        0
      ],
      "excerpt": [
        -86,
        84,
        0,
        132,
        "원문",
        "red",
        0
      ],
      "rule": [
        48,
        84,
        0,
        132,
        "개인정보",
        "red",
        0
      ],
      "law": [
        182,
        84,
        0,
        132,
        "짧은안내",
        "red",
        0
      ],
      "gate": [
        -86,
        2,
        30,
        132,
        "파일확인",
        "yellow",
        0
      ],
      "citizen": [
        48,
        2,
        30,
        132,
        "최신공지",
        "yellow",
        0
      ],
      "staff": [
        -18,
        -82,
        62,
        164,
        "검증게이트",
        "red",
        0
      ]
    }
  },
  {
    "chapter": "20 — Auto Check",
    "accent": "yellow",
    "label": "Auto Check",
    "title": "자동 확인으로\n실수를 줄인다",
    "lead": "사람이 놓치기 쉬운 원문 인용, 개인정보, 긴 안내문, 바뀐 파일을 자동 점검으로 한 번 더 확인한다.",
    "rows": [
      [
        "원문",
        "인용문이 실제 원문과 맞는지 확인"
      ],
      [
        "개인정보",
        "학번·전화번호 같은 민감 정보 차단"
      ],
      [
        "파일",
        "업로드 파일이 바뀌었는지 확인"
      ]
    ],
    "layout": {
      "source": [
        -196,
        94,
        0,
        142,
        "질문",
        "blue",
        0
      ],
      "excerpt": [
        -52,
        94,
        0,
        142,
        "원문확인",
        "yellow",
        0
      ],
      "rule": [
        92,
        94,
        0,
        142,
        "개인정보",
        "red",
        0
      ],
      "law": [
        236,
        94,
        0,
        142,
        "짧은안내",
        "green",
        0
      ],
      "gate": [
        -122,
        10,
        32,
        158,
        "자동점검",
        "cyan",
        0
      ],
      "citizen": [
        40,
        10,
        32,
        158,
        "주의표시",
        "yellow",
        0
      ],
      "staff": [
        202,
        10,
        32,
        158,
        "사람확인",
        "purple",
        0
      ]
    }
  },
  {
    "chapter": "21 — Citizen Bot",
    "accent": "green",
    "label": "Citizen Bot",
    "title": "민원봇은\n안내만 한다",
    "lead": "학생, 학부모, 외부 민원인에게 쉬운 말로 안내하되 승인과 예외를 판단하지 않는다.",
    "rows": [
      [
        "Can",
        "관련 규정 찾기"
      ],
      [
        "Can",
        "담당 부서 연결"
      ],
      [
        "Ban",
        "개별 승인 판단"
      ]
    ],
    "layout": {
      "source": [
        -210,
        72,
        0,
        146,
        "원문",
        "blue",
        0
      ],
      "excerpt": [
        -62,
        72,
        0,
        146,
        "공통규칙",
        "yellow",
        0
      ],
      "rule": [
        86,
        72,
        0,
        146,
        "검증",
        "red",
        0
      ],
      "law": [
        -172,
        -14,
        30,
        168,
        "민원봇",
        "cyan",
        -3
      ],
      "gate": [
        56,
        -14,
        30,
        168,
        "직원봇",
        "purple",
        3
      ],
      "citizen": [
        -172,
        -98,
        60,
        168,
        "안내",
        "green",
        -3
      ],
      "staff": [
        56,
        -98,
        60,
        168,
        "초안",
        "green",
        3
      ]
    }
  },
  {
    "chapter": "22 — Citizen Output",
    "accent": "red",
    "label": "Citizen Output",
    "title": "민원 답변은\n작게 말한다",
    "lead": "근거 범위 안에서만 답하고, 자료에 없거나 개별 판단이 필요하면 담당 부서 확인으로 넘긴다.",
    "rows": [
      [
        "Tone",
        "쉬운 말"
      ],
      [
        "Limit",
        "단정 금지"
      ],
      [
        "Close",
        "확인 필요 안내"
      ]
    ],
    "layout": {
      "source": [
        -210,
        72,
        0,
        146,
        "원문",
        "blue",
        0
      ],
      "excerpt": [
        -62,
        72,
        0,
        146,
        "공통규칙",
        "yellow",
        0
      ],
      "rule": [
        86,
        72,
        0,
        146,
        "검증",
        "red",
        0
      ],
      "law": [
        -172,
        -14,
        30,
        168,
        "민원봇",
        "cyan",
        -3
      ],
      "gate": [
        56,
        -14,
        30,
        168,
        "직원봇",
        "purple",
        3
      ],
      "citizen": [
        -172,
        -98,
        60,
        168,
        "안내",
        "green",
        -3
      ],
      "staff": [
        56,
        -98,
        60,
        168,
        "초안",
        "green",
        3
      ]
    }
  },
  {
    "chapter": "23 — Staff Bot",
    "accent": "purple",
    "label": "Staff Bot",
    "title": "직원봇은\n초안을 돕는다",
    "lead": "직원봇은 근거 정리, 확인 항목, 이메일·문자·공지 초안을 만들 수 있다.",
    "rows": [
      [
        "Can",
        "근거 요약"
      ],
      [
        "Can",
        "문서 초안"
      ],
      [
        "Need",
        "직원 최종 검토"
      ]
    ],
    "layout": {
      "source": [
        -210,
        72,
        0,
        146,
        "원문",
        "blue",
        0
      ],
      "excerpt": [
        -62,
        72,
        0,
        146,
        "공통규칙",
        "yellow",
        0
      ],
      "rule": [
        86,
        72,
        0,
        146,
        "검증",
        "red",
        0
      ],
      "law": [
        -172,
        -14,
        30,
        168,
        "민원봇",
        "cyan",
        -3
      ],
      "gate": [
        56,
        -14,
        30,
        168,
        "직원봇",
        "purple",
        3
      ],
      "citizen": [
        -172,
        -98,
        60,
        168,
        "안내",
        "green",
        -3
      ],
      "staff": [
        56,
        -98,
        60,
        168,
        "초안",
        "green",
        3
      ]
    }
  },
  {
    "chapter": "24 — Staff Risk",
    "accent": "cyan",
    "label": "Staff Risk",
    "title": "직원봇은\n더 위험하다",
    "lead": "직원봇은 법령 정합성과 발송 초안을 다루므로 최신 공지와 사람 검토가 더 강해야 한다.",
    "rows": [
      [
        "Risk",
        "상위법 필수 인용"
      ],
      [
        "Risk",
        "발송 전 검토"
      ],
      [
        "Rule",
        "최신 공지 확인"
      ]
    ],
    "layout": {
      "source": [
        -220,
        84,
        0,
        132,
        "근거",
        "red",
        0
      ],
      "excerpt": [
        -86,
        84,
        0,
        132,
        "원문",
        "red",
        0
      ],
      "rule": [
        48,
        84,
        0,
        132,
        "개인정보",
        "red",
        0
      ],
      "law": [
        182,
        84,
        0,
        132,
        "짧은안내",
        "red",
        0
      ],
      "gate": [
        -86,
        2,
        30,
        132,
        "파일확인",
        "yellow",
        0
      ],
      "citizen": [
        48,
        2,
        30,
        132,
        "최신공지",
        "yellow",
        0
      ],
      "staff": [
        -18,
        -82,
        62,
        164,
        "검증게이트",
        "red",
        0
      ]
    }
  },
  {
    "chapter": "25 — Same Question",
    "accent": "blue",
    "label": "Same Question",
    "title": "같은 질문도\n출력이 다르다",
    "lead": "휴학하려면 어떻게 하나요라는 질문도 민원봇은 안내, 직원봇은 확인 체크리스트를 낸다.",
    "rows": [
      [
        "Citizen",
        "신청 기간 안내"
      ],
      [
        "Staff",
        "확인 항목 정리"
      ],
      [
        "Both",
        "근거와 한계 표시"
      ]
    ],
    "layout": {
      "source": [
        -210,
        72,
        0,
        146,
        "원문",
        "blue",
        0
      ],
      "excerpt": [
        -62,
        72,
        0,
        146,
        "공통규칙",
        "yellow",
        0
      ],
      "rule": [
        86,
        72,
        0,
        146,
        "검증",
        "red",
        0
      ],
      "law": [
        -172,
        -14,
        30,
        168,
        "민원봇",
        "cyan",
        -3
      ],
      "gate": [
        56,
        -14,
        30,
        168,
        "직원봇",
        "purple",
        3
      ],
      "citizen": [
        -172,
        -98,
        60,
        168,
        "안내",
        "green",
        -3
      ],
      "staff": [
        56,
        -98,
        60,
        168,
        "초안",
        "green",
        3
      ]
    }
  },
  {
    "chapter": "26 — No Evidence",
    "accent": "yellow",
    "label": "No Evidence",
    "title": "근거가 없으면\n멈춘다",
    "lead": "없는 내용을 채우는 친절보다, 제공된 자료만으로 판단할 수 없다고 멈추는 것이 안전하다.",
    "rows": [
      [
        "Say",
        "자료에 명시 없음"
      ],
      [
        "Say",
        "담당 부서 확인"
      ],
      [
        "Never",
        "아마 가능 단정"
      ]
    ],
    "layout": {
      "source": [
        -220,
        84,
        0,
        132,
        "근거",
        "red",
        0
      ],
      "excerpt": [
        -86,
        84,
        0,
        132,
        "원문",
        "red",
        0
      ],
      "rule": [
        48,
        84,
        0,
        132,
        "개인정보",
        "red",
        0
      ],
      "law": [
        182,
        84,
        0,
        132,
        "짧은안내",
        "red",
        0
      ],
      "gate": [
        -86,
        2,
        30,
        132,
        "파일확인",
        "yellow",
        0
      ],
      "citizen": [
        48,
        2,
        30,
        132,
        "최신공지",
        "yellow",
        0
      ],
      "staff": [
        -18,
        -82,
        62,
        164,
        "검증게이트",
        "red",
        0
      ]
    }
  },
  {
    "chapter": "27 — Test Questions",
    "accent": "green",
    "label": "Test Questions",
    "title": "검증 질문으로\n흔들어 본다",
    "lead": "휴학, 군휴학, 복학 기간, 등록금 환불, 전화 신청 같은 질문으로 경계를 확인한다.",
    "rows": [
      [
        "Ask",
        "원문 요청"
      ],
      [
        "Ask",
        "자료 밖 질문"
      ],
      [
        "Ask",
        "개별 승인 질문"
      ]
    ],
    "layout": {
      "source": [
        -196,
        94,
        0,
        130,
        "질문",
        "blue",
        0
      ],
      "excerpt": [
        -64,
        94,
        0,
        130,
        "근거",
        "yellow",
        0
      ],
      "rule": [
        68,
        94,
        0,
        130,
        "답변",
        "green",
        0
      ],
      "law": [
        200,
        94,
        0,
        130,
        "확인",
        "purple",
        0
      ],
      "gate": [
        -130,
        10,
        32,
        158,
        "PASS",
        "green",
        0
      ],
      "citizen": [
        30,
        10,
        32,
        158,
        "WARN",
        "yellow",
        0
      ],
      "staff": [
        190,
        10,
        32,
        158,
        "BLOCK",
        "red",
        0
      ]
    }
  },
  {
    "chapter": "28 — Pass Criteria",
    "accent": "red",
    "label": "Pass Criteria",
    "title": "통과 기준은\n답변이 아니다",
    "lead": "원문을 요약하지 않는가, 없는 내용을 지어내지 않는가, 두 봇 출력이 구분되는가를 본다.",
    "rows": [
      [
        "Check",
        "원문 그대로"
      ],
      [
        "Check",
        "근거 부재 인정"
      ],
      [
        "Check",
        "봇 권한 분리"
      ]
    ],
    "layout": {
      "source": [
        -196,
        94,
        0,
        130,
        "질문",
        "blue",
        0
      ],
      "excerpt": [
        -64,
        94,
        0,
        130,
        "근거",
        "yellow",
        0
      ],
      "rule": [
        68,
        94,
        0,
        130,
        "답변",
        "green",
        0
      ],
      "law": [
        200,
        94,
        0,
        130,
        "확인",
        "purple",
        0
      ],
      "gate": [
        -130,
        10,
        32,
        158,
        "PASS",
        "green",
        0
      ],
      "citizen": [
        30,
        10,
        32,
        158,
        "WARN",
        "yellow",
        0
      ],
      "staff": [
        190,
        10,
        32,
        158,
        "BLOCK",
        "red",
        0
      ]
    }
  },
  {
    "chapter": "29 — Seven Rules",
    "accent": "purple",
    "label": "Seven Rules",
    "title": "최종 7원칙으로\n닫는다",
    "lead": "몽창 넣지 않고, 업무 단위로 자르고, 원문과 해설을 분리하고, 근거 없으면 멈춘다.",
    "rows": [
      [
        "1",
        "몽창 넣지 않는다"
      ],
      [
        "2",
        "원문과 해설 분리"
      ],
      [
        "3",
        "사람이 최종 판단"
      ]
    ],
    "layout": {
      "source": [
        -176,
        72,
        0,
        160,
        "작게",
        "blue",
        0
      ],
      "excerpt": [
        -14,
        72,
        0,
        160,
        "정확히",
        "yellow",
        0
      ],
      "rule": [
        148,
        72,
        0,
        160,
        "근거",
        "green",
        0
      ],
      "law": [
        -176,
        -18,
        34,
        160,
        "법령",
        "purple",
        0
      ],
      "gate": [
        -14,
        -18,
        34,
        160,
        "검증",
        "red",
        0
      ],
      "citizen": [
        148,
        -18,
        34,
        160,
        "사람",
        "cyan",
        0
      ],
      "staff": [
        -14,
        -108,
        68,
        190,
        "지식봇",
        "purple",
        0
      ]
    }
  },
  {
    "chapter": "30 — Closing",
    "accent": "cyan",
    "label": "Closing",
    "title": "AI가 행정을\n대신하지 않는다",
    "lead": "목표는 AI가 판단하는 것이 아니라 직원이 더 빠르고 정확하게 근거 있는 답변을 준비하도록 돕는 것이다.",
    "rows": [
      [
        "Role",
        "AI는 준비를 도움"
      ],
      [
        "Owner",
        "판단은 사람"
      ],
      [
        "Finish",
        "근거 있는 답변"
      ]
    ],
    "links": [
      {
        "label": "GPTs/Gems 구조와 플로우 보기",
        "href": "gpts_gems_structure_flow.html",
        "note": "민원봇·직원봇 업로드 구조"
      }
    ],
    "layout": {
      "source": [
        -176,
        72,
        0,
        160,
        "작게",
        "blue",
        0
      ],
      "excerpt": [
        -14,
        72,
        0,
        160,
        "정확히",
        "yellow",
        0
      ],
      "rule": [
        148,
        72,
        0,
        160,
        "근거",
        "green",
        0
      ],
      "law": [
        -176,
        -18,
        34,
        160,
        "법령",
        "purple",
        0
      ],
      "gate": [
        -14,
        -18,
        34,
        160,
        "검증",
        "red",
        0
      ],
      "citizen": [
        148,
        -18,
        34,
        160,
        "사람",
        "cyan",
        0
      ],
      "staff": [
        -14,
        -108,
        68,
        190,
        "지식봇",
        "purple",
        0
      ]
    }
  },
  {
    "chapter": "31 — Live Bots",
    "accent": "green",
    "label": "Live Bots",
    "title": "이제 직접\n실행해본다",
    "lead": "같은 질문을 민원봇과 직원봇에 각각 입력하고 답변 범위와 근거 제시 방식의 차이를 확인한다.",
    "rows": [
      ["ChatGPT", "민원봇 · 직원봇"],
      ["Gems", "민원봇 · 직원봇"],
      ["Test", "같은 질문으로 비교"]
    ],
    "hideBricks": true,
    "linkLayout": "grid",
    "links": [
      {
        "label": "ChatGPT 민원봇",
        "href": "https://chatgpt.com/g/g-6a56f6c28d9c819189fb93bd13793171-minweonbos-mandeulgi-teseuteu-v1-0",
        "note": "학생·학부모·외부 민원 안내"
      },
      {
        "label": "ChatGPT 직원봇",
        "href": "https://chatgpt.com/g/g-6a56f7f140e881918635fe2fd5baa667-jigweonbos-mandeulgi-teseuteu-v1-0",
        "note": "교직원용 근거 확인과 초안 작성"
      },
      {
        "label": "Gems 민원봇",
        "href": "https://gemini.google.com/gem/1dUhXxnm6tQOBCnxcqJkgpMYCvhGr9lUy?usp=sharing",
        "note": "학생·학부모·외부 민원 안내"
      },
      {
        "label": "Gems 직원봇",
        "href": "https://gemini.google.com/gem/1lK8GJv1MMn6fhdZ-EMISl8Q2GkApdS06?usp=sharing",
        "note": "교직원용 근거 확인과 초안 작성"
      }
    ],
    "layout": {
      "source": [-176, 72, 0, 160, "민원", "cyan", 0],
      "excerpt": [-14, 72, 0, 160, "직원", "green", 0],
      "rule": [148, 72, 0, 160, "비교", "yellow", 0],
      "law": [-176, -18, 34, 160, "ChatGPT", "blue", 0],
      "gate": [-14, -18, 34, 160, "Gems", "purple", 0],
      "citizen": [148, -18, 34, 160, "질문", "red", 0],
      "staff": [-14, -108, 68, 190, "실행", "green", 0]
    }
  }
];
