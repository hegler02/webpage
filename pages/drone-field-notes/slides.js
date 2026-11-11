"use strict";
window.DRONE_CONTENT = {
  "runId": "run-drone-field-a-full-20261109",
  "reviewedAt": "2026-11-11",
  "title": "드론은 어디까지 일할 수 있을까?",
  "sections": [
    "가능성을 읽는 법",
    "촬영·지도·입체 모델",
    "현장에서 쓰이는 드론",
    "물건에서 사람까지",
    "현재 활용과 준비 단계",
    "다음 활용을 준비하는 법",
    "용어사전"
  ],
  "stageScale": [
    {
      "key": "commercial",
      "label": "상용화"
    },
    {
      "key": "operating",
      "label": "업무 활용"
    },
    {
      "key": "trial",
      "label": "실증·시험"
    },
    {
      "key": "research",
      "label": "연구"
    }
  ],
  "imagePolicy": "삽화는 AI로 만든 설명용 이미지입니다. 실제 장면은 공식 채널 표시가 붙은 영상과 미리보기입니다.",
  "solo": {
    "label": "질문",
    "prompt": "이 사례는 어느 단계일까요?",
    "chosen": "다음 단계로 넘어가 정답을 확인하세요.",
    "think": "생각해 본 뒤 다음 단계에서 확인하세요.",
    "hit": "예측 적중",
    "miss": "예측",
    "answer": "정답",
    "guess": "내 예측",
    "checkLabel": "확인",
    "right": "맞았어요.",
    "reviewPrefix": "다시 볼 곳:",
    "reviewButton": "이 장 다시 보기"
  },
  "nameHints": [
    [
      "조비",
      "미국의 에어택시 개발 회사입니다. 승객 서비스 전에 항공기 설계의 안전 인증 시험을 진행하고 있습니다."
    ],
    [
      "이항",
      "중국의 승객용 드론 제조사입니다. 이 회사 기체로 운항 허가를 받은 사업자들이 시험 운항을 하고 있습니다."
    ],
    [
      "OBS",
      "올림픽 국제 공통 중계 영상을 만드는 조직입니다."
    ],
    [
      "PG&E",
      "미국 전력회사입니다. 2022~2025년 자동 점검 드론을 현장에서 시험했습니다."
    ],
    [
      "엔터지",
      "미국 전력회사입니다. 변전소에 드론을 두고 원격으로 점검합니다."
    ],
    [
      "셀라필드",
      "영국의 원자력 시설입니다. 시설 안팎의 일상 점검에 드론을 씁니다."
    ],
    [
      "PCL",
      "건설사입니다. 공사 현장을 드론으로 반복 촬영해 기록합니다."
    ],
    [
      "스칸스카",
      "건설사입니다. 입체 자료로 공사 현장의 높이와 흙의 양을 관리합니다."
    ],
    [
      "K-드론배송",
      "국토교통부의 공공 드론 배송 사업입니다."
    ]
  ],
  "skipTerms": [
    "상용화",
    "업무 활용",
    "실증",
    "연구"
  ],
  "sources": {
    "FAA_UAS": {
      "id": "FAA_UAS",
      "org": "미국 연방항공청 · FAA",
      "date": "현행 용어집 · 확인 2026-11-09",
      "title": "Pilot/Controller Glossary — Unmanned Aircraft System",
      "url": "https://www.faa.gov/air_traffic/publications/atpubs/pcg_html/chap1_section_22.html",
      "claim": "비행하려면 드론 본체와 조종 장치, 둘을 잇는 통신이 필요합니다.",
      "scope": "드론 본체가 움직이고, 조종 장치가 명령을 보내며, 통신이 둘을 연결합니다. 미국 연방항공청은 이 전체를 무인항공기 시스템으로 정의합니다.",
      "stage": "원리·정의",
      "stageKey": "principle",
      "slides": [
        2,
        3,
        4,
        26,
        28
      ],
      "evidenceLocator": "UNMANNED AIRCRAFT SYSTEM, 원문 44–45행",
      "visual": null,
      "locator": "용어집의 UNMANNED AIRCRAFT SYSTEM 항목",
      "readerTitle": "드론 시스템을 이루는 드론 본체·조종 장치·통신"
    },
    "FAA_OPERATIONS": {
      "id": "FAA_OPERATIONS",
      "org": "미국 연방항공청 · FAA",
      "date": "현행 AIM · 확인 2026-11-09",
      "title": "AIM 11-8 — Other Information and Best Practices",
      "url": "https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap11_section_8.html",
      "claim": "안전한 드론 비행은 임무와 주변 환경을 살피는 일에서 시작합니다.",
      "scope": "미국 연방항공청은 드론 본체 상태·날씨·비행 장소·주변 항공기를 확인하는 운용 지침을 제공합니다. 한국에서 비행할 때는 국내 자격과 비행승인 절차를 적용합니다.",
      "stage": "운용 원칙",
      "stageKey": "principle",
      "slides": [
        4,
        22,
        26,
        27
      ],
      "evidenceLocator": "11-8-1 Best Practices for UAS Operations",
      "visual": null,
      "locator": "11-8-1절 · 드론 운용 권고사항",
      "readerTitle": "드론 운용 전 확인할 드론 본체·임무·날씨"
    },
    "IOC_FPV": {
      "id": "IOC_FPV",
      "org": "국제올림픽위원회 · IOC / 올림픽 방송 서비스 · OBS",
      "date": "2026 밀라노 코르티나 대회 보도 · 게시일 본문 미표기",
      "title": "Innovative broadcast coverage bringing fans closer to action than ever before at Milano Cortina 2026",
      "url": "https://www.olympics.com/ioc/news/innovative-broadcast-coverage-bringing-fans-closer-to-action-than-ever-before-at-milano-cortina-2026",
      "claim": "올림픽 중계 영상을 제작하는 OBS는 2026 동계올림픽에서 드론 25대, 그중 FPV 15대를 운용했습니다.",
      "scope": "OBS는 Olympic Broadcasting Services의 약자입니다. IOC는 이 드론들이 선수의 움직임을 따라가는 중계 촬영에 쓰였다고 소개합니다.",
      "stage": "실제 방송 운용",
      "stageKey": "operational",
      "slides": [
        5,
        21,
        28
      ],
      "evidenceLocator": "Key facts 및 본문 44–56행",
      "visual": {
        "url": "https://www.olympics.com/ioc/news/innovative-broadcast-coverage-bringing-fans-closer-to-action-than-ever-before-at-milano-cortina-2026",
        "kind": "source-page",
        "rights": "사진은 Getty Images 표기. 재사용 권한 미확인, 자동 다운로드·재배포 금지."
      },
      "secondary": "https://www.nbcuniversal.com/article/drone-innovation-transforms-coverage-2026-milan-cortina-olympics",
      "locator": "Key facts와 드론 중계 설명",
      "readerTitle": "2026 동계올림픽의 드론 중계 촬영"
    },
    "NPS_SFM": {
      "id": "NPS_SFM",
      "org": "미국 국립공원관리청 · NPS",
      "date": "2021-05-18 최종 갱신",
      "title": "Mapping and Monitoring Landscape Changes Using Structure from Motion from Aircraft",
      "url": "https://www.nps.gov/articles/000/aps-20-1-5.htm",
      "claim": "여러 사진에 겹쳐 찍힌 같은 지점을 찾아 지도와 입체 형태를 계산합니다.",
      "scope": "미국 국립공원관리청은 촬영 계획부터 사진 처리까지 이 방법을 설명합니다. 알래스카에서는 주로 유인 항공기로 촬영했으며, 드론 사진 처리에도 같은 사진측량 원리를 사용합니다.",
      "stage": "원리·기관 연구 사례",
      "stageKey": "principle",
      "slides": [
        6,
        7,
        8,
        9
      ],
      "evidenceLocator": "Structure from Motion Technology / Mission Planning / Processing Protocols; 최종 갱신일 197행",
      "visual": {
        "url": "https://www.nps.gov/common/upload/nri/20210211/articles/B4D8CF55-A55D-478C-A477EC70406FCEBA/B4D8CF55-A55D-478C-A477EC70406FCEBA.jpg?autorotate=false&format=webp&maxHeight=1020&maxWidth=1300",
        "kind": "image",
        "rights": "NPS 원문 정사영상. 개별 이미지 크레딧·재사용 조건 추가 확인 필요. 항구 드론 실측 사진으로 오인시키지 않음."
      },
      "locator": "촬영 계획(Mission Planning)과 사진 처리(Processing Protocols) 항목",
      "readerTitle": "여러 사진으로 지도와 입체 모델을 만드는 원리"
    },
    "USGS_QA": {
      "id": "USGS_QA",
      "org": "미국 지질조사국 · USGS",
      "date": "2023-07-25",
      "title": "Guidelines for Calibration of Uncrewed Aircraft Systems Imagery",
      "url": "https://www.usgs.gov/publications/guidelines-calibration-uncrewed-aircraft-systems-imagery",
      "secondary": "https://pubs.usgs.gov/of/2023/1033/ofr20231033.pdf",
      "claim": "측량 결과의 정확도는 위치를 아는 기준점과 검사점으로 확인합니다.",
      "scope": "기준점은 사진의 위치를 맞추는 데 쓰고, 검사점은 완성된 결과의 오차를 확인하는 데 씁니다. 미국 지질조사국 지침은 이런 보정·검사 과정과 사진 품질 관리를 설명합니다.",
      "stage": "기술·품질 지침",
      "stageKey": "principle",
      "slides": [
        6,
        7,
        8,
        9,
        26,
        27
      ],
      "evidenceLocator": "Executive Summary 14–23행",
      "visual": null,
      "locator": "요약(Executive Summary)의 위치 보정·품질 관리 설명",
      "readerTitle": "드론 사진의 위치 보정과 정확도 검사"
    },
    "KOMSA_3D": {
      "id": "KOMSA_3D",
      "org": "한국해양교통안전공단 · KOMSA",
      "date": "2025-06-13",
      "title": "하늘에서 바닷속까지 … 드론으로 연안여객선 안전망 촘촘히",
      "url": "https://www.komsa.or.kr/bbs/BBSMSTR_000000000744/view.do?mno=sub06_0101&nttId=B000000027310Vf0oD8",
      "claim": "한국해양교통안전공단은 항구를 드론으로 촬영해 만든 3D 자료를 여객선 종사자에게 제공합니다.",
      "scope": "선장 등 현장 담당자가 항구의 모습을 살펴보며 안전 업무에 활용하는 사례입니다.",
      "stage": "기관 운용",
      "stageKey": "institutional",
      "slides": [
        7,
        10,
        21
      ],
      "evidenceLocator": "본문 406–438행; 이미지 설명 470행",
      "visual": {
        "url": "https://www.komsa.or.kr/bbs/BBSMSTR_000000000744/view.do?mno=sub06_0101&nttId=B000000027310Vf0oD8",
        "kind": "source-page",
        "rights": "본문에 3D 맵핑 화면 2장 있음. imageSrc 직접 호출은 캐시 오류. 재사용 조건 미확인."
      },
      "locator": "항구 3D 자료 제작과 여객선 종사자 제공에 관한 본문",
      "readerTitle": "드론으로 만든 항구 3D 자료의 안전 업무 활용"
    },
    "PCL_REALITY": {
      "id": "PCL_REALITY",
      "org": "PCL Construction · 기업 공식 발표",
      "date": "2026-05-05",
      "title": "PCL Construction and DroneDeploy expand partnership to standardize reality capture across 1,000+ active projects",
      "url": "https://www.pcl.com/ca/en/newsroom/press-releases/pcl-construction-and-dronedeploy-expand-partnership-to-standardize-reality-capture-across-1000-active-projects",
      "claim": "건설사 PCL은 드론 자료를 관리하는 드론디플로이와 다년 계약을 맺었으며, 2024년 도입 이후 드론 비행 1만 회 이상을 기록했다고 발표했습니다.",
      "scope": "공사 현장의 드론 사진·360도 영상·3D 스캔을 한 플랫폼에서 관리하는 사례입니다. 운용 규모는 PCL이 공개한 수치입니다.",
      "stage": "상용 서비스 도입·기업 운용",
      "stageKey": "commercial",
      "slides": [
        9,
        21,
        22,
        28
      ],
      "evidenceLocator": "본문 2–6행",
      "visual": null,
      "locator": "계약 발표 본문의 2024년 도입 및 누적 비행 횟수",
      "readerTitle": "PCL의 드론 현장 기록과 DroneDeploy 서비스 계약"
    },
    "NIST_TWIN": {
      "id": "NIST_TWIN",
      "org": "미국 국립표준기술연구소 · NIST",
      "date": "2025-12-04 생성 · 2026-07-22 갱신",
      "title": "Digital Twins — Essential Elements",
      "url": "https://www.nist.gov/digital-twins/essential-elements",
      "claim": "디지털 트윈은 실제 시설이나 장비의 변화를 계속 반영하는 컴퓨터 속 모델입니다.",
      "scope": "사진으로 만든 3D 모델에 센서나 작업 기록 등 실제 현장의 변화가 계속 연결될 때, 상태를 추적하는 디지털 트윈으로 발전시킬 수 있습니다.",
      "stage": "개념·표준 연구",
      "stageKey": "principle",
      "slides": [
        9,
        23
      ],
      "evidenceLocator": "128–136행",
      "visual": null,
      "locator": "디지털 트윈의 정의와 실제 대상·데이터 연결 설명",
      "readerTitle": "실제 대상과 연결되는 디지털 트윈의 구성"
    },
    "ONR_INSPECTION": {
      "id": "ONR_INSPECTION",
      "org": "영국 원자력규제청 · ONR",
      "date": "2023-03-23 발표 · 2024-03-19 페이지 갱신",
      "title": "Innovative use of robots and unmanned aerial vehicles at Sellafield",
      "url": "https://www.onr.org.uk/news/all-news/2023/03/innovative-use-of-robots-and-unmanned-aerial-vehicles-at-sellafield",
      "claim": "영국 셀라필드 원자력시설은 드론으로 시설 안팎을 정기 점검합니다.",
      "scope": "사람이 접근하기 어려운 곳의 영상을 드론이 확보하고, 담당자가 영상을 검토해 필요한 조치를 정합니다. 영국 원자력규제청이 이 활용을 소개했습니다.",
      "stage": "산업 현장 운용",
      "stageKey": "institutional",
      "slides": [
        1,
        10,
        21,
        28
      ],
      "evidenceLocator": "278–298행; 특히 288–289행",
      "visual": {
        "url": "https://www.onr.org.uk/news/all-news/2023/03/innovative-use-of-robots-and-unmanned-aerial-vehicles-at-sellafield",
        "kind": "source-page",
        "rights": "UAV 현장 사진과 지상 로봇 사진을 구분. 사진 재사용 권한은 미확인."
      },
      "locator": "셀라필드의 시설 내부·외부 점검 사례",
      "readerTitle": "셀라필드 원자력시설의 드론 점검"
    },
    "MAFF_SPRAY": {
      "id": "MAFF_SPRAY",
      "org": "일본 농림수산성 · MAFF",
      "date": "2026년 공개 令和7年度 백서 · 실적 기준 2024회계연도",
      "title": "第4節 生産性向上に向けた取組",
      "url": "https://www.maff.go.jp/j/wpaper/w_maff/r7/r7_h/trend/part1/chap3/c3_4_00.html",
      "claim": "일본의 2024회계연도 농업 드론 살포 작업 면적은 119.6만 ha였습니다.",
      "scope": "일본 농림수산성이 공개한 약제 등의 살포 실적입니다. 1ha는 가로·세로 각각 100m인 땅의 넓이로, 농업 드론이 현장에서 얼마나 널리 쓰이는지 보여 줍니다.",
      "stage": "농업 현장 보급·운용",
      "stageKey": "operational",
      "slides": [
        11,
        21
      ],
      "evidenceLocator": "292행",
      "visual": null,
      "locator": "제3장 제4절 · 스마트농업 기술 보급과 드론 살포 면적",
      "readerTitle": "일본 농업의 생산성 향상과 드론 살포 실적",
      "readerDate": "2026년 공개된 2025회계연도 백서 · 살포 실적 2024회계연도"
    },
    "DJI_MULTISPECTRAL": {
      "id": "DJI_MULTISPECTRAL",
      "org": "DJI Enterprise · 제조사",
      "date": "현행 제품 페이지 · 확인 2026-11-09",
      "title": "DJI Mavic 3M",
      "url": "https://enterprise.dji.com/mavic-3-m",
      "claim": "DJI Mavic 3M은 작물이 반사하는 여러 종류의 빛을 촬영해 상태를 살피는 드론입니다.",
      "scope": "일반 색 사진과 다중분광 사진을 함께 찍습니다. 색과 반사량이 다른 구역을 찾은 뒤, 농장 담당자가 해당 구역을 살펴 작물 상태를 확인합니다.",
      "stage": "상용 제품",
      "stageKey": "product",
      "slides": [
        3,
        11
      ],
      "evidenceLocator": "공식 페이지 독일어 경로로 리다이렉트, 153–183행",
      "visual": {
        "url": "https://enterprise.dji.com/mavic-3-m",
        "kind": "source-page",
        "rights": "제조사 제품 이미지의 재사용 권한 미확인."
      },
      "locator": "카메라 구성과 작물 관찰 기능",
      "readerTitle": "작물 상태를 관찰하는 DJI Mavic 3M"
    },
    "OJP_DFR": {
      "id": "OJP_DFR",
      "org": "미국 법무부 OJP · NIJ 지원 보고서",
      "date": "2025-01",
      "title": "Drone as First Responder: Practical Insights into Law Enforcement Implementation",
      "url": "https://www.ojp.gov/library/publications/drone-first-responder-practical-insights-law-enforcement-implementation",
      "secondary": "https://www.chulavistaca.gov/departments/police-department/programs/uas-drone-program?trk=public_post_comment-text",
      "claim": "신고를 받으면 드론을 먼저 보내 현장 모습을 출동 인력에게 전달할 수 있습니다.",
      "scope": "이 운영 방식을 DFR이라고 합니다. 미국 법무부가 제공하는 보고서는 드론 배치 장소, 출동 절차, 비행을 관리하는 업무 등을 설명합니다.",
      "stage": "공공기관 운용 모델",
      "stageKey": "institutional",
      "slides": [
        12,
        21,
        22
      ],
      "evidenceLocator": "OJP Abstract 82–85행; Chula Vista 공식 검색 본문",
      "visual": null,
      "locator": "보고서 요약(Abstract)의 도입 준비와 업무 흐름",
      "readerTitle": "신고 현장에 드론을 보내는 공공안전 업무"
    },
    "ARMY_SRR": {
      "id": "ARMY_SRR",
      "org": "미 육군 · PEO Aviation",
      "date": "2025-06-10",
      "title": "Army accelerates fielding of advanced SUAS, enhancing combat capabilities",
      "url": "https://www.army.mil/article/286214/army_accelerates_fielding_of_advanced_small_uncrewed_aircraft_systems_to_enhance_combat_capabilities",
      "claim": "미 육군은 2025년 소형 정찰 드론을 부대에 배치하는 사업을 발표했습니다.",
      "scope": "병력이 주변 지형과 시설을 살피는 데 쓰는 장비입니다. 이 장의 영국군 영상은 2013년 아프가니스탄에서 실제로 촬영한 정찰 기록입니다.",
      "stage": "군 조달·부대 배치",
      "stageKey": "institutional",
      "slides": [
        13,
        21
      ],
      "evidenceLocator": "2–8행 및 16행",
      "visual": {
        "url": "https://api.army.mil/e2/c/images/2025/06/11/75de2092/original.jpg",
        "kind": "image",
        "rights": "US Army photo by Sgt. 1st Class Richard Hoppe, Released 표기. 인물과 군 표식 등 맥락을 보존하고 제3자 권리는 별도 확인."
      },
      "locator": "소형 정찰 드론의 부대 배치 발표",
      "readerTitle": "미 육군의 소형 정찰 드론 부대 배치"
    },
    "USFA_PAYLOAD": {
      "id": "USFA_PAYLOAD",
      "org": "미국 소방청 · USFA / DHS",
      "date": "2024-03-28 발표 · 2026-05-01 최종 검토",
      "title": "DHS Releases Guidance for Unmanned Aerial Systems for Public Safety Missions",
      "url": "https://www.usfa.fema.gov/blog/dhs-releases-guidance-for-unmanned-aerial-systems/",
      "claim": "임무에 맞는 카메라와 센서를 선택하면 접근이 어렵거나 위험한 곳의 정보를 수집할 수 있습니다.",
      "scope": "미국 소방청이 소개한 센서 선택 지침입니다. 어떤 정보를 얻을지 정한 뒤 무게·전력·드론 본체와의 연결 조건을 검토합니다.",
      "stage": "공공 조달·운용 지침",
      "stageKey": "principle",
      "slides": [
        2,
        3,
        10,
        12,
        26,
        27,
        28
      ],
      "evidenceLocator": "127–141행",
      "visual": null,
      "locator": "임무에 맞는 카메라·센서 선택 지침",
      "readerTitle": "응급대응 임무에 맞는 드론 센서 선택"
    },
    "D01": {
      "id": "D01",
      "org": "Walmart 기업 뉴스룸",
      "date": "2026-05-29",
      "title": "Walmart Celebrates 1 Million Drone Deliveries",
      "claim": "Walmart는 2026년 5월 29일 누적 드론 배송 100만 건 초과를 발표했습니다. 당시 미국 4개 주의 66개 매장에서 운영했습니다.",
      "scope": "배송 건수와 운영 범위는 Walmart가 공개한 실적입니다. 이용자는 자신의 주소와 상품이 배송 대상에 해당하는지 주문 화면에서 확인할 수 있습니다.",
      "url": "https://corporate.walmart.com/news/2026/05/29/walmart-celebrates-1-million-drone-deliveries-marking-a-major-milestone-in-customer-convenience",
      "stage": "상용 서비스 · 지역 한정",
      "slides": [
        16,
        21,
        28
      ],
      "verifiedAt": "2026-11-09",
      "locator": "",
      "readerTitle": "Walmart의 누적 드론 배송 100만 건 발표"
    },
    "D02": {
      "id": "D02",
      "org": "Walmart 고객 도움말",
      "date": "업데이트일 미표시",
      "title": "Drone Delivery",
      "claim": "Walmart 고객은 주소와 상품이 서비스 대상이면 웹이나 앱에서 드론 배송을 선택할 수 있습니다.",
      "scope": "고객 도움말은 배송 가능 여부가 주소·날씨·배송 사업자의 조건에 따라 달라진다고 안내합니다. 주문 때 표시되는 조건을 확인하면 됩니다.",
      "url": "https://www.walmart.com/help/article/drone-delivery/4870314a62634f368fe23cdf94ea28e2",
      "stage": "상용 서비스 · 주소/기상 조건",
      "slides": [
        16,
        21,
        22
      ],
      "verifiedAt": "2026-11-09",
      "locator": "",
      "readerTitle": "Walmart 드론 배송의 주문 방법과 이용 조건"
    },
    "D03": {
      "id": "D03",
      "org": "국토교통부 · 대한민국 정책브리핑",
      "date": "2025-12-03",
      "title": "K-드론배송, 배송지 166곳 확대 시행",
      "claim": "국토교통부는 K-드론배송의 166개 배송 지점과 총 5,236회 배송을 발표했습니다. 고흥 거금해양낚시공원의 음식·낚시용품 배송을 소개합니다.",
      "scope": "2025년 12월 3일 발표입니다. 한국에서 정해진 생활 공간을 연결하는 공공 드론배송이 실제로 이루어졌음을 보여 줍니다.",
      "url": "https://www.korea.kr/news/policyNewsView.do?newsId=148955779",
      "stage": "공공 사업 운영 · 실제 배송",
      "slides": [
        17,
        21,
        27
      ],
      "verifiedAt": "2026-11-09",
      "locator": "",
      "readerTitle": "K-드론배송 166개 지점·5,236회 배송"
    },
    "D04": {
      "id": "D04",
      "org": "The Lancet Global Health · Nisingizwe 외",
      "date": "2022-04",
      "title": "Effect of unmanned aerial vehicle (drone) delivery on blood product delivery time and wastage in Rwanda",
      "claim": "르완다 20개 의료시설의 자료에서 혈액 준비·포장을 포함한 평균 드론 배송 시간은 49.6분이었습니다.",
      "scope": "도로 비교에서는 준비 시간을 뺀 드론 41분과 병원 차량의 추정 왕복 120분을 중앙값으로 제시합니다. 혈액원 차량이 바로 출발하는 편도 조건에서는 도로 60분, 드론과의 차이 19분으로 계산했습니다. 드론은 실제 배송 기록, 도로는 추정 이동 시간을 사용했습니다.",
      "url": "https://www.updwg.org/wp-content/uploads/2022/04/Effect-of-unmanned-aerial-vehicle-drone-delivery-on-blood-product-delivery-time-and-wastage-in-Rwanda-a-retrospective-cross-sectional-study-and-time-series-analysis.pdf",
      "stage": "실제 의료 배송 운영 · 사후 효과 연구",
      "slides": [
        18,
        21,
        26
      ],
      "verifiedAt": "2026-11-09",
      "secondary": "https://doi.org/10.1016/S2214-109X(22)00048-1",
      "evidenceLocation": "PDF 3쪽(e566) Methods와 표1; PDF 4쪽(e567) Results 첫 두 단락과 표2",
      "metricDefinitions": {
        "observedMean": {
          "value": 49.6,
          "unit": "분",
          "preparation": "포함",
          "confidenceInterval": [
            49.1,
            50.2
          ]
        },
        "medianComparison": {
          "facilityCount": 20,
          "drone": 41,
          "roadEstimate": 120,
          "reportedDifference": 79,
          "unit": "분",
          "preparation": "드론 준비·포장 제외",
          "roadTrip": "병원 차량이 혈액원에 다녀오는 왕복"
        },
        "sensitivity": {
          "roadEstimate": 60,
          "drone": 41,
          "reportedDifference": 19,
          "roadTrip": "혈액원이 차량을 갖고 배송한다고 가정한 편도"
        }
      },
      "correction": "초록은 평균49.6과 차이79를 연이어 기술하지만, 본문이 서로 다른 통계량·준비시간 조건을 명시한다. '평균79분 단축'이나 '49.6+79=128.6분'으로 쓰지 않는다. '시설별 차이값의 중앙값'으로 추가 재정의하지 않고 표1의 중앙값 비교라고 표현한다.",
      "locator": "PDF 3쪽의 조사 방법·표1, 4쪽의 결과·표2",
      "readerTitle": "르완다 혈액 배송의 소요 시간과 혈액 폐기량 연구"
    },
    "D05": {
      "id": "D05",
      "org": "미국 연방항공청 · FAA",
      "date": "2026-10-22 업데이트",
      "title": "What is AAM?",
      "claim": "FAA는 전기 추진과 수직이착륙 등 새로운 항공 이동 기술을 소개합니다.",
      "scope": "eVTOL은 전기로 움직이며 수직으로 뜨고 내리는 항공기입니다. 조종 방식과 서비스 형태는 항공기별로 확인할 수 있습니다.",
      "url": "https://www.faa.gov/aam/what_is_aam",
      "stage": "개념·분류",
      "slides": [
        19
      ],
      "verifiedAt": "2026-11-09",
      "locator": "",
      "readerTitle": "전기 추진·수직이착륙을 이용하는 새로운 항공 이동"
    },
    "D06": {
      "id": "D06",
      "org": "유럽항공안전청 · EASA",
      "date": "2023-01-19 발행 · 2023-03-23 업데이트",
      "title": "Air Taxis as urban transport",
      "claim": "유럽항공안전청은 초기 에어택시를 조종사가 탑승해 승객을 운송하는 형태로 설명합니다.",
      "scope": "에어택시는 사람을 목적지로 실어 나르는 서비스입니다. 자동화 정도와 조종사 탑승 여부는 항공기와 운항 방식에 따라 정해집니다.",
      "url": "https://www.easa.europa.eu/en/domains/drones-air-mobility/topics/air-taxis-urban-transport",
      "stage": "개념·운영 설계",
      "slides": [
        19
      ],
      "verifiedAt": "2026-11-09",
      "locator": "",
      "readerTitle": "조종사가 탑승하는 초기 에어택시의 운항 개념"
    },
    "D07": {
      "id": "D07",
      "org": "이항 · 공식 발표",
      "date": "2025-03-30",
      "title": "EHang’s EH216-S eVTOL Operators Obtain Air Operator Certificates",
      "claim": "중국 광저우·허페이의 두 사업자는 2025년 3월 EH216-S로 관광 비행 서비스를 운영할 허가를 받았습니다.",
      "scope": "이항이 발표한 운영증명 취득 사례입니다. 운영증명에는 사업자가 어떤 항공기를 어느 범위에서 운항할 수 있는지가 정해집니다.",
      "url": "https://ir.ehang.com/news-releases/news-release-details/ehangs-eh216-s-evtol-operators-obtain-air-operator-certificates",
      "stage": "운영증명 취득 · 운영 범위 한정",
      "slides": [
        20
      ],
      "verifiedAt": "2026-11-09",
      "locator": "",
      "readerTitle": "광저우·허페이 EH216-S 사업자의 운영증명 취득"
    },
    "D08": {
      "id": "D08",
      "org": "이항 · 실적 발표",
      "date": "2026-08-25",
      "title": "EHang Reports Second Quarter 2026 Unaudited Financial Results",
      "claim": "이항은 2026년 8월, 광저우·허페이의 두 운항 장소에서 17개월 동안 정기 시험 운항을 했다고 발표했습니다.",
      "scope": "이항은 승객 서비스를 준비하기 위해 비행 담당자 교육과 보험을 준비하고, 비행 구역을 조정하며 비상상황에 대처할 절차를 마련했다고 설명했습니다.",
      "url": "https://ir.ehang.com/news-releases/news-release-details/ehang-reports-second-quarter-2026-unaudited-financial-results",
      "stage": "실증·상용 운영 준비",
      "slides": [
        20,
        21
      ],
      "verifiedAt": "2026-11-09",
      "locator": "",
      "readerTitle": "이항의 시험 운항과 승객 서비스 준비"
    },
    "D09": {
      "id": "D09",
      "org": "조비 · 실적 발표",
      "date": "2026-11-04",
      "title": "Joby Reports Third Quarter 2026 Financial Results",
      "claim": "조비는 2026년 11월, 미국 항공기 형식인증의 마지막 단계에서 인증용 시험을 진행했다고 발표했습니다.",
      "scope": "형식인증 시험은 항공기 설계가 안전 기준에 맞는지 확인하는 절차입니다. 조비는 승객 서비스에 앞서 이 시험으로 항공기의 안전성을 확인하고 있습니다.",
      "url": "https://ir.jobyaviation.com/news-events/press-releases/detail/197/joby-reports-third-quarter-2026-financial-results",
      "stage": "인증 시험·실증 비행",
      "slides": [
        19,
        20,
        21
      ],
      "verifiedAt": "2026-11-09",
      "locator": "",
      "readerTitle": "조비의 항공기 인증 시험"
    },
    "D10": {
      "id": "D10",
      "org": "미국 연방항공청 · FAA",
      "date": "2026-09-03 업데이트",
      "title": "Package Delivery by Drone (Part 135)",
      "claim": "미국에서는 드론 배송 사업자의 운항 자격과 운항 범위를 FAA가 관리합니다. Wing과 UPS Flight Forward 등의 사례가 소개돼 있습니다.",
      "scope": "미국의 제도와 사업자 사례를 설명하는 자료입니다. 실제 서비스는 승인된 지역과 운항 조건에 맞춰 운영됩니다.",
      "url": "https://www.faa.gov/uas/advanced_operations/package_delivery_drone",
      "stage": "상용 운영 제도·인증 사례",
      "slides": [
        16,
        20,
        22
      ],
      "verifiedAt": "2026-11-09",
      "locator": "",
      "readerTitle": "미국 드론 배송 사업자의 인증과 실제 운영"
    },
    "F01": {
      "id": "F01",
      "org": "광안리 M 드론라이트쇼 공식 운영 사이트",
      "date": "2026년 운영 안내 · 게시일 미표기",
      "title": "2026 광안리 M 드론라이트쇼",
      "claim": "광안리 M 드론라이트쇼는 광안리 해변의 토요일 정기 공연과 회차별 주제를 안내합니다.",
      "scope": "관람할 때는 공식 사이트에서 해당 날짜의 시간과 날씨에 따른 변경 공지를 확인할 수 있습니다.",
      "stage": "운영 · 상설 문화공연",
      "slides": [
        1,
        14,
        21,
        28
      ],
      "url": "https://www.gwangallimdrone.co.kr/",
      "secondary": "https://www.gwangallimdrone.co.kr/information",
      "verifiedAt": "2026-11-09",
      "evidenceLocator": "홈페이지 상설 공연 안내와 공연안내의 2026년 회차 목록",
      "visualUse": "공식 공연 사진의 재사용 허가는 별도 확인. 원문 링크로 실제 사례 확인 가능.",
      "locator": "홈페이지 상설 공연 안내와 공연안내의 2026년 회차 목록",
      "readerTitle": "광안리 M 드론라이트쇼의 정기 공연 안내"
    },
    "F02": {
      "id": "F02",
      "org": "대전광역시 유성구 계약정보공개",
      "date": "2026-03-18 계약 · 2026-05-08 변경",
      "title": "2026년 다시 온 유성온천 드론라이트쇼 행사대행용역",
      "claim": "유성구는 전문업체 유비파이에 드론라이트쇼 제작과 비행 운영을 맡기는 계약을 맺었습니다. 계약 내용은 유성구 계약정보에 공개돼 있습니다.",
      "scope": "행사 주최자가 업체에 공연 제작과 운영을 맡긴 실제 계약입니다. 계약정보 화면에서 계약 내용과 금액을 확인할 수 있습니다.",
      "stage": "상용화 · 유상 용역 계약 확인",
      "slides": [
        14,
        21,
        28
      ],
      "url": "https://www.yuseong.go.kr/prog/ctrt07/contract/sub07_02_02/2/202600210875/view.do",
      "verifiedAt": "2026-11-09",
      "evidenceLocator": "계약총괄의 계약명·일자·상대자, 대금지급 항목",
      "numericBoundary": "최종 계약금액 2억원 표시. 강의에는 금액을 생략하는 편이 지급 완료 오인을 줄임.",
      "locator": "계약총괄의 계약명·일자·상대자, 대금지급 항목",
      "readerTitle": "유성구가 전문업체에 맡긴 드론쇼 제작·운영"
    },
    "F03": {
      "id": "F03",
      "org": "인텔",
      "date": "발행일 미표기 · 2018 평창 동계올림픽 등 과거 사례 수록",
      "title": "Intel Shooting Star Drones Light Up the Sky — Fact Sheet",
      "claim": "Intel은 각 드론의 위치와 불빛을 미리 설계해 하늘의 애니메이션을 만드는 원리를 설명합니다.",
      "scope": "여러 드론이 빛의 점을 맡아 함께 움직이는 군집 공연입니다. 제작자는 형상·색·이동 순서와 음악을 조합합니다.",
      "stage": "상용 공연 기술 · 원리 설명",
      "slides": [
        14
      ],
      "url": "https://www.intel.com/content/dam/www/public/us/en/documents/fact-sheets/intel-drone-light-show-fact-sheet.pdf",
      "verifiedAt": "2026-11-09",
      "evidenceLocator": "PDF 1쪽의 도입 설명 및 show controller 설명",
      "locator": "PDF 1쪽의 도입 설명 및 show controller 설명",
      "readerTitle": "드론의 위치와 불빛으로 애니메이션을 만드는 원리"
    },
    "F04": {
      "id": "F04",
      "org": "SwellPro 공식 스토어",
      "date": "상시 판매 페이지 · 게시일 미표기",
      "title": "SwellPro Fisherman FD1+ Waterproof Fishing Drone",
      "claim": "SwellPro FD1+는 낚시 미끼와 채비를 원하는 지점으로 옮겨 내려놓는 드론으로 판매됩니다.",
      "scope": "실제 제품 페이지에서 미끼 운반 장치와 구매 정보를 볼 수 있습니다. 사용할 장소의 비행·낚시 규칙도 함께 확인해야 합니다.",
      "stage": "상용화 · 제품 판매",
      "slides": [
        1,
        15,
        21,
        28
      ],
      "url": "https://store.swellpro.com/en-au/products/fisherman-fd1plus-fishing-drone",
      "verifiedAt": "2026-11-09",
      "evidenceLocator": "제품명·Add to cart·Attach, Fly, Drop & Fish 설명",
      "visualUse": "공식 제품 사진 사용 허가는 별도 확인. 생성 이미지를 쓸 경우 실제 FD1+ 사진처럼 제시하지 않음.",
      "locator": "제품명·Add to cart·Attach, Fly, Drop & Fish 설명",
      "readerTitle": "미끼 운반용 SwellPro FD1+ 제품과 구매 정보"
    },
    "F05": {
      "id": "F05",
      "org": "Pacific Gas and Electric Company · PG&E",
      "date": "2025-05-27",
      "title": "EPIC 3.41 — Drone Enablement and Operational Use: Final Report",
      "claim": "미국 전력회사 PG&E는 2022~2025년 드론을 현장에 두고 자동 점검하는 방식을 시험했습니다.",
      "scope": "반복 비행과 영상 품질을 평가한 뒤 통신 거리, 시스템 안정성, 배터리·충전, 카메라·센서의 개선을 권고했습니다. 자동 점검을 꾸준히 운영하려면 비행과 충전·통신이 함께 안정적으로 작동해야 합니다.",
      "stage": "실증 · 자동 운용과 BVLOS 검증",
      "slides": [
        21,
        22,
        26,
        27
      ],
      "url": "https://www.pge.com/assets/pge/docs/about/corporate-responsibility-and-sustainability/pge-epic-project-3.41.pdf",
      "verifiedAt": "2026-11-09",
      "evidenceLocator": "PDF p.4 프로젝트 기간·목표, p.6 권고, p.15–16 개별 시험, p.30 최종 결론",
      "numericBoundary": "관측된 충전/비행 실패 수치를 강의 전체의 보편 한계 수치로 사용하지 않음.",
      "locator": "PDF 4쪽 시험 계획, 6쪽 개선 권고, 30쪽 결론",
      "readerTitle": "PG&E 자동 점검 드론 시험의 결과와 개선 과제"
    },
    "F06": {
      "id": "F06",
      "org": "미국 전력회사 엔터지",
      "date": "2025-11-03",
      "title": "Entergy launches remote drone inspections to strengthen grid reliability",
      "claim": "미국 전력회사 엔터지는 미시시피 변전소에 드론 3대를 설치해 원격 점검에 사용한다고 발표했습니다.",
      "scope": "담당자가 멀리서 임무를 시작하고 영상과 온도 이상을 확인합니다. 드론은 점검을 마치면 보관·충전 시설인 도크로 돌아갑니다. 2025년 11월 공개한 현장 운영 사례입니다.",
      "stage": "운영 · 기업 업무 적용 / 지정 거점",
      "slides": [
        21,
        23,
        26,
        27,
        28
      ],
      "url": "https://www.entergy.com/blog/entergy-launches-remote-drone-inspections-to-strengthen-grid-reliability",
      "verifiedAt": "2026-11-09",
      "evidenceLocator": "도입 문단의 now using, 설치 3대, FAA 승인과 도크 복귀·충전 설명",
      "locator": "도입 문단의 now using, 설치 3대, FAA 승인과 도크 복귀·충전 설명",
      "readerTitle": "엔터지 변전소의 원격 드론 점검"
    },
    "F07": {
      "id": "F07",
      "org": "영국 임페리얼 칼리지 · 스위스 엠파 연구팀",
      "date": "2022-09-21",
      "title": "3D printing drones work like bees to build and repair structures while flying",
      "claim": "영국 임페리얼 칼리지·스위스 엠파 연구팀은 드론으로 거품형 재료와 시멘트를 쌓는 실험을 했습니다.",
      "scope": "한 드론은 재료를 쌓고 다른 드론은 쌓인 형태를 측정했습니다. 측정 결과로 다음 층을 쌓을 위치를 조정하며 원통 구조물을 만든 2022년 연구입니다.",
      "stage": "연구 · 연구실 개념 증명",
      "slides": [
        21,
        24,
        26,
        27
      ],
      "url": "https://www.imperial.ac.uk/news/239973/3d-printing-drones-work-like-bees/amp/",
      "verifiedAt": "2026-11-09",
      "evidenceLocator": "Printing 3D geometries 절; 2.05m 폼 원통과 18cm 시멘트 원통, 향후 건설기업 검증 설명",
      "visualUse": "논문 연구 사진과 미래 상상도를 구분. Imperial 페이지는 사진·그래픽의 별도 저작권을 명시하므로 무단 재배포를 피함.",
      "locator": "Printing 3D geometries · 재료를 쌓는 드론과 형태를 재는 드론",
      "readerTitle": "거품형 재료와 시멘트를 쌓는 드론 건축 실험"
    },
    "F08": {
      "id": "F08",
      "org": "아랍에미리트 환경기관 · 세계자연기금",
      "date": "2024",
      "title": "Mangrove Restoration Guidelines for the United Arab Emirates",
      "claim": "아랍에미리트의 해안 숲 복원 지침은 드론으로 씨앗을 뿌리고, 싹이 나고 나무가 살아남는지 조사하는 방법을 설명합니다.",
      "scope": "해안에 자라는 맹그로브 나무의 씨앗을 준비해 알맞은 장소에 뿌립니다. 이후 싹이 트고 나무가 살아남는지 살펴 숲의 복원 정도를 확인합니다.",
      "stage": "실증·현장 적용 · 생태 복원 모니터링 필요",
      "slides": [
        21,
        25,
        26,
        27
      ],
      "url": "https://www.ead.gov.ae/-/media/Project/EAD/EAD/Documents/KnowledgeHub/Resources-and-Materials/EAD6735_MANGROVE-INITIATIVE-GUIDELINES_v10b.pdf",
      "verifiedAt": "2026-11-09",
      "evidenceLocator": "PDF p.25–26 드론 파종과 품질, p.27–29 현장 모니터링·생존율 평가",
      "numericBoundary": "초기 성공률 등 조건 의존 수치를 슬라이드에서 일반화하지 않음. 핵심은 파종→발아→생존→복원 평가라는 강의용 과정 구분.",
      "locator": "PDF 25~26쪽 드론 파종, 27~29쪽 발아·생존 조사",
      "readerTitle": "맹그로브 숲의 드론 파종과 생장 조사"
    },
    "F09": {
      "id": "F09",
      "org": "영국 원자력규제청 · ONR",
      "date": "2023-03-23",
      "title": "Innovative use of robots and unmanned aerial vehicles at Sellafield",
      "claim": "영국 셀라필드 원자력시설은 드론을 시설 내부와 외부의 정기 점검에 활용합니다.",
      "scope": "영국 원자력규제청이 소개한 실제 업무 사례입니다. 드론은 사람이 접근하기 어려운 곳을 촬영해 점검 자료를 제공합니다.",
      "stage": "운영 · 기관 업무 적용",
      "slides": [
        1,
        10,
        21,
        28
      ],
      "url": "https://www.onr.org.uk/news/all-news/2023/03/innovative-use-of-robots-and-unmanned-aerial-vehicles-at-sellafield",
      "verifiedAt": "2026-11-09",
      "evidenceLocator": "2023-03-23 본문 중 routine operations / both internal and external inspections",
      "locator": "2023-03-23 본문 중 routine operations / both internal and external inspections",
      "readerTitle": "셀라필드의 정기 시설 점검"
    },
    "F10": {
      "id": "F10",
      "org": "국제항공스포츠연맹 · FAI",
      "date": "2025 시즌 자료 · 2026년 결과 파일 게시",
      "title": "FAI Drone Racing World Cup — Edition 2025",
      "claim": "국제항공스포츠연맹은 2025 드론 레이싱 월드컵의 규칙과 경기 결과를 공개합니다.",
      "scope": "드론 레이싱은 정해진 코스를 비행하며 겨루는 스포츠입니다. 드론 본체 제작과 조종, 대회 운영이 결합된 콘텐츠로 볼 수 있습니다.",
      "stage": "운영 · 국제 스포츠 대회",
      "slides": [
        5,
        15,
        21
      ],
      "url": "https://www.fai.org/world-cups/drone-racing-2025",
      "verifiedAt": "2026-11-09",
      "evidenceLocator": "2025 F9U World Cup Results & Ranking, 개별 경기 심판 보고서와 결과 파일",
      "locator": "2025 F9U World Cup Results & Ranking, 개별 경기 심판 보고서와 결과 파일",
      "readerTitle": "2025 드론 레이싱 월드컵의 규칙과 결과"
    },
    "NIST_CONFIDENCE": {
      "id": "NIST_CONFIDENCE",
      "org": "미국 국립표준기술연구소 · NIST",
      "date": "확인 2026-11-11",
      "title": "Confidence Limits for the Mean",
      "readerTitle": "95% 신뢰구간을 읽는 방법",
      "url": "https://itl.nist.gov/div898/handbook/eda/section3/eda352.htm",
      "claim": "같은 방식으로 조사 자료를 모아 평균의 신뢰구간을 반복 계산하면, 장기적으로 약 95%의 구간이 전체 평균을 포함합니다.",
      "scope": "신뢰구간은 평균 추정의 정밀도를 나타냅니다. 한 번씩 배송하는 데 걸린 시간은 개별 기록에서 확인합니다.",
      "stage": "통계 개념",
      "stageKey": "principle",
      "locator": "Interpretation of Confidence Interval",
      "slides": [
        31
      ]
    },
    "REDBULL_FPV": {
      "id": "REDBULL_FPV",
      "org": "Red Bull · 공식 대회 영상",
      "date": "2022 대회 영상 · 확인 2026-11-09",
      "title": "Full FPV Downhill Run with Tomas Slavik | Red Bull Valparaiso Cerro Abajo 2022",
      "url": "https://www.youtube.com/watch?v=DFphM29JJq4",
      "secondary": "https://www.redbull.tv/en_MV/page/page:rrn:content:videos:5922de58-35ad-48c9-8e17-ae734d66021a/red-bull-valparaiso-cerro-abajo-chile-2022-tomas-slavik-drone-cam",
      "claim": "Red Bull Bike는 2022년 칠레 발파라이소 대회에서 토마시 슬라비크를 따라간 FPV 영상을 공개했습니다.",
      "scope": "선수와 함께 계단과 골목을 이동하는 실제 스포츠 촬영 사례입니다. 본문의 올림픽 드론 수치는 IOC의 별도 중계 자료에서 확인할 수 있습니다.",
      "stage": "실제 스포츠 촬영",
      "stageKey": "operational",
      "slides": [
        5
      ],
      "locator": "공식 YouTube 영상 제목·설명 및 Red Bull TV Downhill drone chase",
      "video": {
        "provider": "youtube",
        "id": "DFphM29JJq4",
        "url": "https://www.youtube.com/watch?v=DFphM29JJq4",
        "label": "공식 FPV 경기 영상",
        "title": "칠레 도심 자전거 경기의 FPV 추적 촬영",
        "originalTitle": "Full FPV Downhill Run with Tomas Slavik | Red Bull Valparaiso Cerro Abajo 2022",
        "publisher": "Red Bull Bike · 공식 채널",
        "durationLabel": "2분 33초",
        "note": "Red Bull Bike가 공개한 2022년 발파라이소 경기 영상입니다.",
        "watchFor": "카메라가 선수 뒤를 따라 계단을 내려가고 골목을 돕니다. 선수의 속도와 좁은 코스의 느낌을 함께 보세요.",
        "panelTitle": "선수를 따라가는 FPV 촬영",
        "stage": {
          "key": "operating",
          "label": "실제 스포츠 촬영",
          "sourceUrl": "https://www.youtube.com/watch?v=DFphM29JJq4",
          "detail": "실제 자전거 대회에서 촬영한 스포츠 콘텐츠입니다."
        }
      },
      "readerTitle": "Red Bull 발파라이소 다운힐의 FPV 추적 촬영"
    },
    "DJI_HS2_VIDEO": {
      "id": "DJI_HS2_VIDEO",
      "org": "DJI Enterprise · DJI Europe 공식 사례",
      "date": "2023-03-06 사례 발표 · 확인 2026-11-10",
      "title": "Balfour Beatty VINCI의 HS2 현장 드론 측량",
      "url": "https://www.youtube.com/watch?v=8mIToSdYmY8",
      "secondary": "https://www.mynewsdesk.com/uk/dji/news/drones-save-balfour-beatty-vinci-ps5million-on-hs2-development-463107",
      "claim": "BBV는 영국 HS2 공사 현장에서 드론으로 측량하고 땅을 깎고 쌓는 작업의 변화를 관리합니다.",
      "scope": "DJI가 제작한 실제 건설 현장 사례 영상입니다. 촬영한 사진이 지도와 현장 관리 자료로 이어지는 과정을 볼 수 있습니다.",
      "stage": "기업 업무 운영 · 상용 장비 적용",
      "stageKey": "operating",
      "slides": [
        6,
        8
      ],
      "locator": "현장 사례의 APPROACH 항목과 연결된 영상",
      "verifiedAt": "2026-11-10",
      "video": {
        "provider": "youtube",
        "id": "8mIToSdYmY8",
        "url": "https://www.youtube.com/watch?v=8mIToSdYmY8",
        "label": "공식 매핑·측량 영상",
        "buttonLabel": "현장 영상",
        "panelTitle": "공사 현장의 지도 제작과 측량",
        "title": "영국 HS2 공사장의 드론 촬영과 측량",
        "publisher": "DJI Enterprise · 공식 채널",
        "contextLabel": "영국 HS2 · 2023년 공개 사례",
        "watchFor": "드론으로 촬영한 자료에서 높이와 흙의 양을 확인하는 과정을 보세요. 사진이 공사의 크기와 변화량을 재는 자료로 쓰입니다.",
        "note": "DJI가 건설사 BBV의 현장 작업을 소개한 영상입니다.",
        "stage": {
          "key": "operating",
          "label": "기업 업무 운영 · 상용 장비 적용",
          "detail": "BBV가 실제 공사 관리 업무에 드론 측량을 사용합니다.",
          "sourceLabel": "DJI 공식 현장 사례",
          "sourceUrl": "https://www.mynewsdesk.com/uk/dji/news/drones-save-balfour-beatty-vinci-ps5million-on-hs2-development-463107"
        }
      },
      "readerTitle": "영국 HS2 공사 현장의 드론 지도 제작·측량"
    },
    "ZIPLINE_BLOOD_VIDEO": {
      "id": "ZIPLINE_BLOOD_VIDEO",
      "org": "Zipline 공식 영상 · Gavi 서비스 발표",
      "date": "영상 2016-10-18 · 서비스 발표 2016-10-14 · 확인 2026-11-10",
      "title": "Zipline Delivery Time Lapse – Blood Delivery to Muhororo District Hospital",
      "url": "https://www.youtube.com/watch?v=QWglZKVP26c",
      "secondary": "https://www.gavi.org/news/media-room/rwanda-launches-worlds-first-national-drone-delivery-service-powered-zipline",
      "claim": "집라인은 르완다 무호로로 병원에 혈액을 배송한 영상을 공개했습니다.",
      "scope": "2016년 실제 배송을 빠르게 재생한 기록입니다. 배송 서비스의 개시는 참여 기관인 세계백신면역연합 Gavi가 공식 발표했습니다.",
      "stage": "상용 서비스 · 의료기관 배송",
      "stageKey": "commercial",
      "slides": [
        18
      ],
      "locator": "Zipline 영상 설명의 routine delivery 및 Gavi 원문의 service launch / commercial partnership",
      "verifiedAt": "2026-11-10",
      "video": {
        "provider": "youtube",
        "id": "QWglZKVP26c",
        "url": "https://www.youtube.com/watch?v=QWglZKVP26c",
        "label": "공식 혈액 배송 영상",
        "buttonLabel": "배송 영상",
        "panelTitle": "병원에 혈액을 전달하는 드론",
        "title": "르완다 무호로로 병원의 혈액 배송",
        "publisher": "Zipline · 공식 채널",
        "contextLabel": "르완다 · 2016년 실제 배송",
        "watchFor": "드론이 병원까지 비행해 혈액을 전달합니다. 산과 도로를 우회하는 대신 공중으로 연결하는 이동 경로를 보세요.",
        "note": "2016년 한 차례의 배송을 빠르게 재생한 영상입니다. 시간 비교는 본문의 여러 병원 배송 기록을 사용합니다.",
        "stage": {
          "key": "commercial",
          "label": "상용 서비스 · 의료기관 배송",
          "detail": "르완다의 의료기관에 혈액을 공급하는 상용 배송 서비스입니다.",
          "sourceLabel": "Gavi 공식 서비스 개시 발표",
          "sourceUrl": "https://www.gavi.org/news/media-room/rwanda-launches-worlds-first-national-drone-delivery-service-powered-zipline"
        }
      },
      "readerTitle": "Zipline의 르완다 Muhororo 병원 혈액 배송"
    },
    "EHANG_SHANGHAI_VIDEO": {
      "id": "EHANG_SHANGHAI_VIDEO",
      "org": "EHang · 기업 공식 영상·발표",
      "date": "2025-01-16 발표 · 확인 2026-11-10",
      "title": "EH216-S의 상하이 도심 첫 실증 비행",
      "url": "https://www.youtube.com/watch?v=3lNqhUZU7Bo",
      "secondary": "https://ir.ehang.com/news-releases/news-release-details/ehangs-eh216-s-pilotless-evtol-completes-debut-flight-downtown/",
      "claim": "이항은 2025년 상하이 룽화 공항에서 EH216-S의 도심 시험 비행을 공개했습니다.",
      "scope": "승객 운송을 준비하는 현장 시험입니다. 20장의 운영증명과 17개월 시험 운항 기록은 광저우·허페이에서 진행한 사업을 설명합니다.",
      "stage": "실증 · 시험 운영",
      "stageKey": "trial",
      "slides": [
        19,
        20
      ],
      "locator": "공식 발표의 inaugural demo flight / regular trial operation 및 공식 YouTube 링크",
      "verifiedAt": "2026-11-10",
      "video": {
        "provider": "youtube",
        "id": "3lNqhUZU7Bo",
        "url": "https://www.youtube.com/watch?v=3lNqhUZU7Bo",
        "label": "공식 에어택시 실증 영상",
        "buttonLabel": "실증 영상",
        "panelTitle": "승객 운송을 준비하는 시험 비행",
        "title": "상하이에서 뜨고 내리는 이항 EH216-S",
        "publisher": "EHang · 공식 채널",
        "contextLabel": "중국 상하이 · 2025년 공개 사례",
        "watchFor": "항공기가 수직으로 뜨고 이동한 뒤 착륙하는 과정을 보세요. 여러 회전날개로 사람을 태울 항공기를 띄웁니다.",
        "note": "2025년 상하이 룽화 공항에서 공개한 시험 비행입니다.",
        "stage": {
          "key": "trial",
          "label": "실증 · 시험 운영",
          "detail": "실증 단계입니다. 실제 도심 환경에서 비행하며 승객 운송 서비스를 준비합니다.",
          "sourceLabel": "EHang 공식 실증 발표",
          "sourceUrl": "https://ir.ehang.com/news-releases/news-release-details/ehangs-eh216-s-pilotless-evtol-completes-debut-flight-downtown/"
        }
      },
      "readerTitle": "상하이에서 진행한 EH216-S 도심 시험 비행"
    },
    "FLYABILITY_INSPECTION_VIDEO": {
      "id": "FLYABILITY_INSPECTION_VIDEO",
      "org": "Flyability · 공식 영상",
      "date": "2020-11-12 사례 발표 · 확인 2026-11-10",
      "title": "체르노빌 원전 5호기 내부의 Elios 2 점검 비행",
      "url": "https://www.youtube.com/watch?v=yyZZSyCmBqY",
      "secondary": "https://www.flyability.com/news/chernobyl-mission",
      "claim": "Flyability는 체르노빌 미완공 원전 5호기 내부에서 Elios 2로 수행한 점검 영상을 공개했습니다.",
      "scope": "좁고 접근하기 어려운 실제 시설에서 장비의 점검 활용을 시험한 장면입니다. 본문의 Sellafield 활용과 함께 시설 점검 방식을 이해하는 데 도움이 됩니다.",
      "stage": "실증 · 현장 점검 시험",
      "stageKey": "trial",
      "slides": [
        10
      ],
      "locator": "공식 영상의 실제 활용 장면 및 보조 원문의 사례·제품·운영 안내",
      "verifiedAt": "2026-11-10",
      "video": {
        "provider": "youtube",
        "id": "yyZZSyCmBqY",
        "url": "https://www.youtube.com/watch?v=yyZZSyCmBqY",
        "label": "공식 점검 영상",
        "buttonLabel": "점검 영상",
        "panelTitle": "좁은 시설 내부를 살피는 드론",
        "title": "체르노빌 미완공 원전 5호기의 내부 점검",
        "publisher": "Flyability · 공식 채널",
        "contextLabel": "체르노빌 · 2020년 공개 임무",
        "watchFor": "보호틀에 둘러싸인 드론이 좁은 시설 안을 이동하며 촬영합니다. 사람이 들어가기 어려운 구역에서 얻는 영상을 보세요.",
        "note": "플라이어빌리티가 2020년에 공개한 현장 점검 임무입니다.",
        "stage": {
          "key": "trial",
          "label": "실증 · 현장 점검 시험",
          "detail": "실증 단계입니다. 실제 원전 시설에서 드론의 점검 활용을 시험했습니다.",
          "sourceLabel": "Flyability 공식 점검 임무 발표",
          "sourceUrl": "https://www.flyability.com/news/chernobyl-mission"
        }
      },
      "readerTitle": "체르노빌 미완공 원전 내부의 드론 점검 시험"
    },
    "DJI_ORCHARD_VIDEO": {
      "id": "DJI_ORCHARD_VIDEO",
      "org": "DJI Agriculture · 공식 영상",
      "date": "영상 게시일 원문 참조 · 확인 2026-11-10",
      "title": "Why Orchards Use Drones — 과수원 살포 시험",
      "url": "https://www.youtube.com/watch?v=EAF18dju6vE",
      "secondary": "https://ag.dji.com/t50",
      "claim": "DJI T50이 과수원에서 살포하고, 물에 닿으면 색이 변하는 종이로 약제가 닿은 상태를 확인합니다.",
      "scope": "판매 중인 농업 드론으로 수행한 현장 살포 시험입니다. 비행과 함께 살포 결과를 확인하는 과정을 보세요.",
      "stage": "실증 · 과수원 살포 시험",
      "stageKey": "trial",
      "slides": [
        11
      ],
      "locator": "과수원 살포 및 색이 변하는 종이로 결과를 확인하는 장면",
      "verifiedAt": "2026-11-10",
      "video": {
        "provider": "youtube",
        "id": "EAF18dju6vE",
        "url": "https://www.youtube.com/watch?v=EAF18dju6vE",
        "label": "공식 살포 영상",
        "buttonLabel": "살포 영상",
        "panelTitle": "과수원에 뿌리고 결과를 확인하는 드론",
        "title": "DJI T50의 과수원 살포 시험",
        "publisher": "DJI Agriculture · 공식 채널",
        "contextLabel": "과수원 · 농업 드론 T50",
        "watchFor": "드론이 나무 위로 약제를 뿌립니다. 물방울이 닿으면 색이 변하는 종이로 약제가 어느 곳까지 도달했는지 확인합니다.",
        "note": "농업 드론 제조사 DJI가 공개한 시험 영상입니다.",
        "stage": {
          "key": "trial",
          "label": "실증 · 과수원 살포 시험",
          "detail": "실증 단계의 살포 시험입니다. 시험에 사용한 T50은 판매 중인 제품입니다.",
          "sourceLabel": "DJI Agriculture 공식 시험 영상·설명",
          "sourceUrl": "https://www.youtube.com/watch?v=EAF18dju6vE"
        }
      },
      "readerTitle": "DJI T50의 과수원 살포와 결과 확인"
    },
    "GWANGALLI_SHOW_VIDEO": {
      "id": "GWANGALLI_SHOW_VIDEO",
      "org": "수영구TV · 공식 영상",
      "date": "공연 2024-08-24 · 확인 2026-11-10",
      "title": "광안리 M 드론라이트쇼 — 광안리 바다탐험",
      "url": "https://www.youtube.com/watch?v=YfhxizitLQo",
      "secondary": "https://www.gwangallimdrone.co.kr/",
      "claim": "수영구TV는 2024년 8월 24일 광안리의 바다탐험 드론쇼 장면을 공개했습니다.",
      "scope": "실제로 열린 정기 공연의 하이라이트입니다. 여러 드론의 위치와 색이 바뀌며 그림을 만드는 모습을 볼 수 있습니다.",
      "stage": "운영 · 공공 정기 공연",
      "stageKey": "operating",
      "slides": [
        14
      ],
      "locator": "2024년 8월 24일 바다탐험 공연 영상",
      "verifiedAt": "2026-11-10",
      "video": {
        "provider": "youtube",
        "id": "YfhxizitLQo",
        "url": "https://www.youtube.com/watch?v=YfhxizitLQo",
        "label": "공식 공연 영상",
        "buttonLabel": "공연 영상",
        "panelTitle": "관객 앞에서 펼쳐진 드론쇼",
        "title": "광안리 바다탐험 드론라이트쇼",
        "publisher": "수영구TV · 공식 채널",
        "contextLabel": "부산 광안리 · 2024년 8월 공연",
        "watchFor": "여러 드론이 위치와 빛의 색을 바꾸며 바다 생물과 장면을 만듭니다. 그림이 바뀌는 동안 각 불빛이 어떻게 움직이는지 보세요.",
        "note": "수영구TV가 공개한 2024년 8월 24일 공연 하이라이트입니다.",
        "stage": {
          "key": "operating",
          "label": "운영 · 공공 정기 공연",
          "detail": "실제 운영 중인 정기 공연입니다. 광안리 해변의 관객에게 선보인 장면입니다.",
          "sourceLabel": "광안리 M 드론라이트쇼 공식 운영 안내",
          "sourceUrl": "https://www.gwangallimdrone.co.kr/"
        }
      },
      "readerTitle": "2024년 광안리 바다탐험 드론쇼 공연"
    },
    "SWELLPRO_FISHING_VIDEO": {
      "id": "SWELLPRO_FISHING_VIDEO",
      "org": "SwellPro · 공식 영상",
      "date": "영상 게시일 원문 참조 · 확인 2026-11-10",
      "title": "SwellPro FD1+ — 미끼를 운반하는 낚시 드론",
      "url": "https://www.youtube.com/watch?v=yUaWKhP2YKQ",
      "secondary": "https://store.swellpro.com/products/fisherman-fd1plus-fishing-drone",
      "claim": "SwellPro의 공식 FD1+ 영상은 실제 비행과 미끼 운반·투하를 보여 줍니다.",
      "scope": "판매 제품의 사용 장면입니다. 미끼를 싣고 이동한 뒤 목표 지점에 내려놓는 과정을 보세요.",
      "stage": "상용화 · 낚시용 제품 판매",
      "stageKey": "commercial",
      "slides": [
        15
      ],
      "locator": "미끼를 싣고 날아가 내려놓는 장면",
      "verifiedAt": "2026-11-10",
      "video": {
        "provider": "youtube",
        "id": "yUaWKhP2YKQ",
        "url": "https://www.youtube.com/watch?v=yUaWKhP2YKQ",
        "label": "공식 낚시 영상",
        "buttonLabel": "낚시 영상",
        "panelTitle": "미끼를 원하는 지점으로 보내는 드론",
        "title": "스웰프로 FD1+의 낚시 미끼 운반",
        "publisher": "SwellPro · 공식 채널",
        "contextLabel": "SwellPro FD1+ · 제품 사용 시연",
        "watchFor": "드론에 미끼와 낚싯줄을 연결하고, 물 위의 목표 지점까지 날려 보내 내려놓습니다.",
        "note": "낚시 드론 제조사 스웰프로의 제품 사용 영상입니다.",
        "stage": {
          "key": "commercial",
          "label": "상용화 · 낚시용 제품 판매",
          "detail": "상용화된 낚시용 드론입니다. 제조사 판매 페이지에서 구매할 수 있습니다.",
          "sourceLabel": "SwellPro 공식 판매·시연 페이지",
          "sourceUrl": "https://store.swellpro.com/products/fisherman-fd1plus-fishing-drone"
        }
      },
      "readerTitle": "SwellPro FD1+의 미끼 운반·투하 장면"
    },
    "WING_DELIVERY_VIDEO": {
      "id": "WING_DELIVERY_VIDEO",
      "org": "Wing · 공식 영상",
      "date": "영상 2024-06-10 · 확인 2026-11-10",
      "title": "Walmart drone delivery — Wing의 실제 배송",
      "url": "https://www.youtube.com/watch?v=a2OSiE2M4g4",
      "secondary": "https://www.walmart.com/help/article/drone-delivery/4870314a62634f368fe23cdf94ea28e2",
      "claim": "Wing의 공식 영상은 고객이 주문한 Walmart 물품을 드론으로 보내는 과정을 보여 줍니다.",
      "scope": "2024년에 공개된 서비스 장면입니다. 본문의 누적 100만 건은 Walmart가 2026년에 여러 배송 사업자의 실적을 합쳐 발표한 수치입니다.",
      "stage": "상용 서비스 · 지역 한정 배송",
      "stageKey": "commercial",
      "slides": [
        16
      ],
      "locator": "주문 물품을 고객에게 전달하는 장면",
      "verifiedAt": "2026-11-10",
      "video": {
        "provider": "youtube",
        "id": "a2OSiE2M4g4",
        "url": "https://www.youtube.com/watch?v=a2OSiE2M4g4",
        "label": "공식 택배 영상",
        "buttonLabel": "택배 영상",
        "panelTitle": "주문한 물품을 받는 드론 배송",
        "title": "윙이 배달하는 월마트 주문 물품",
        "publisher": "Wing · 공식 채널",
        "contextLabel": "Wing × Walmart · 2024년 공개 영상",
        "watchFor": "주문 물품을 싣고 출발한 드론이 고객의 배송 장소로 이동해 물건을 내려놓는 과정을 보세요.",
        "note": "윙이 2024년에 공개한 미국 월마트 배송 영상입니다.",
        "stage": {
          "key": "commercial",
          "label": "상용 서비스 · 지역 한정 배송",
          "detail": "상용 배송 서비스입니다. 월마트 주문 화면에서 주소와 상품의 배송 가능 여부를 확인합니다.",
          "sourceLabel": "Walmart 공식 드론 배송 이용 안내",
          "sourceUrl": "https://www.walmart.com/help/article/drone-delivery/4870314a62634f368fe23cdf94ea28e2"
        }
      },
      "readerTitle": "Wing의 Walmart 주문품 드론 배송"
    },
    "DJI_KARATSU_VIDEO": {
      "id": "DJI_KARATSU_VIDEO",
      "org": "DJI Enterprise",
      "date": "사례 2020-08-13 · 영상 2020-09-08 · 확인 2026-11-10",
      "title": "가라쓰성 — 드론 사진에서 3D 기록으로",
      "url": "https://www.youtube.com/watch?v=OQXLEPsXQzY",
      "secondary": "https://enterprise-insights.dji.com/user-stories/japan-protecting-cultural-heritage-drone-surveying-mapping",
      "claim": "가라쓰시의 의뢰를 받은 Toppen은 드론으로 문화유산을 촬영하고 DJI Terra로 3D 모델을 제작했습니다.",
      "scope": "일본 가라쓰성의 실제 기록 업무입니다. 현장 촬영과 만들어진 입체 모델을 함께 확인할 수 있습니다.",
      "stage": "업무 운영 · 문화유산 기록",
      "stageKey": "operating",
      "slides": [
        7
      ],
      "locator": "가라쓰성 현장 촬영과 완성된 3D 모델 화면",
      "verifiedAt": "2026-11-10",
      "video": {
        "provider": "youtube",
        "id": "OQXLEPsXQzY",
        "url": "https://www.youtube.com/watch?v=OQXLEPsXQzY",
        "label": "공식 3D 영상",
        "buttonLabel": "3D 영상",
        "panelTitle": "문화유산을 입체로 기록하는 드론",
        "title": "일본 가라쓰성의 촬영과 3D 모델 제작",
        "publisher": "DJI Enterprise",
        "contextLabel": "일본 가라쓰성 · 2020년 공개 사례",
        "watchFor": "성 주변을 여러 방향에서 촬영한 사진이 입체 모델로 바뀝니다. 실제 건물과 화면 속 지붕·벽의 형태를 비교해 보세요.",
        "note": "가라쓰시의 의뢰로 토펜이 수행한 문화유산 기록 업무를 DJI가 소개합니다.",
        "stage": {
          "key": "operating",
          "label": "업무 운영 · 문화유산 기록",
          "detail": "실제 업무에 활용한 사례입니다. 지방정부의 문화유산 기록을 기업이 수행했습니다.",
          "sourceLabel": "DJI 공식 가라쓰성 사례",
          "sourceUrl": "https://enterprise-insights.dji.com/user-stories/japan-protecting-cultural-heritage-drone-surveying-mapping"
        }
      },
      "readerTitle": "일본 가라쓰성의 사진 촬영과 3D 모델 제작"
    },
    "SKANSKA_CONSTRUCTION_VIDEO": {
      "id": "SKANSKA_CONSTRUCTION_VIDEO",
      "org": "DroneDeploy · Skanska 공식 사례",
      "date": "영상 게시일 원문 참조 · 확인 2026-11-10",
      "title": "Skanska — 반복 촬영으로 공사 현장을 관리하다",
      "url": "https://www.youtube.com/watch?v=VHNfSpJY0hY",
      "secondary": "https://interactive.usa.skanska.com/innovation-with-impact",
      "claim": "건설사 스칸스카는 공사장을 드론으로 반복 촬영해 작업 진행 상태·높이·흙의 양을 확인합니다.",
      "scope": "미국 콜드 스프링 하버 연구소 공사 현장 사례입니다. 날짜별 기록을 팀과 공유해 현장 변화와 작업 상황을 함께 살핍니다.",
      "stage": "기업 업무 운영 · 현장 관리",
      "stageKey": "operating",
      "slides": [
        9
      ],
      "locator": "현장 비행과 날짜별 공사 기록을 비교하는 화면",
      "verifiedAt": "2026-11-10",
      "video": {
        "provider": "youtube",
        "id": "VHNfSpJY0hY",
        "url": "https://www.youtube.com/watch?v=VHNfSpJY0hY",
        "label": "공식 공사 영상",
        "buttonLabel": "공사 영상",
        "panelTitle": "날짜별 공사 진행을 비교하는 드론",
        "title": "스칸스카의 건설 현장 관리",
        "publisher": "DroneDeploy · 공식 채널",
        "contextLabel": "Skanska · Cold Spring Harbor Labs 현장",
        "watchFor": "날짜가 다른 현장 사진과 입체 자료를 비교합니다. 작업한 구역과 땅의 높이·흙의 양을 어떻게 확인하는지 보세요.",
        "note": "미국 콜드 스프링 하버 연구소 공사 현장을 소개한 드론디플로이 영상입니다.",
        "stage": {
          "key": "operating",
          "label": "기업 업무 운영 · 현장 관리",
          "detail": "실제 기업 업무에 활용한 사례입니다. 스칸스카가 촬영 기록을 공사 관리와 팀 공유에 사용합니다.",
          "sourceLabel": "Skanska 공식 현장 활용 사례",
          "sourceUrl": "https://interactive.usa.skanska.com/innovation-with-impact"
        }
      },
      "readerTitle": "스칸스카의 건설 현장 기록과 작업 관리"
    },
    "DECATUR_FIRE_VIDEO": {
      "id": "DECATUR_FIRE_VIDEO",
      "org": "DJI Enterprise · 공식 영상·사례",
      "date": "영상·사례 게시일 원문 참조 · 확인 2026-11-10",
      "title": "Decatur — 실제 화재를 위에서 관찰하다",
      "url": "https://www.youtube.com/watch?v=UZqDKsrgHQ8",
      "secondary": "https://enterprise.dji.com/news/detail/above-the-flames-a-tale-from-the-field",
      "claim": "미국 Decatur의 주택 화재에서 드론이 현장의 항공 영상을 제공했습니다.",
      "scope": "DJI가 실제 대응 사례와 함께 연결한 원본 촬영 영상입니다. 화재 건물과 주변 공간이 어떻게 보이는지 확인할 수 있습니다.",
      "stage": "공공 대응 · 실제 현장 운용",
      "stageKey": "operating",
      "slides": [
        12
      ],
      "locator": "화재 건물과 주변 도로의 항공 촬영 장면",
      "verifiedAt": "2026-11-10",
      "video": {
        "provider": "youtube",
        "id": "UZqDKsrgHQ8",
        "url": "https://www.youtube.com/watch?v=UZqDKsrgHQ8",
        "label": "공식 대응 영상",
        "buttonLabel": "대응 영상",
        "panelTitle": "화재 현장을 위에서 살피는 드론",
        "title": "미국 디케이터의 주택 화재 항공 영상",
        "publisher": "DJI Enterprise · 공식 채널",
        "contextLabel": "미국 Decatur · 실제 주택 화재 대응",
        "watchFor": "불이 난 건물과 연기, 주변 도로가 한 화면에 들어옵니다. 지상에서는 한눈에 보기 어려운 주변 상황을 살펴보세요.",
        "note": "DJI가 실제 화재 대응 사례와 연결해 공개한 현장 영상입니다.",
        "stage": {
          "key": "operating",
          "label": "공공 대응 · 실제 현장 운용",
          "detail": "실제 소방 대응에 사용한 영상입니다. 드론이 출동 인력의 현장 파악을 도왔습니다.",
          "sourceLabel": "DJI 공식 Decatur 화재 대응 기록",
          "sourceUrl": "https://enterprise.dji.com/news/detail/above-the-flames-a-tale-from-the-field"
        }
      },
      "readerTitle": "미국 Decatur 주택 화재의 실제 항공 영상"
    },
    "MOD_OPERATION_VIDEO": {
      "id": "MOD_OPERATION_VIDEO",
      "org": "영국 국방부 · Ministry of Defence",
      "date": "공식 발표 2013-12-18 · 확인 2026-11-10",
      "title": "영국 국방부 — 무인기의 실제 관측 기록",
      "url": "https://www.youtube.com/watch?v=EDmOD_4jQbA",
      "secondary": "https://www.gov.uk/government/news/unmanned-aerial-systems-on-show--7",
      "claim": "영국 국방부는 군용 무인기의 카메라로 촬영한 실제 관측 영상을 공개했습니다.",
      "scope": "2013년 아프가니스탄 작전에서 얻은 영상입니다. 위에서 지형·도로·주변 시설을 관찰하는 군의 정보 수집 활용을 볼 수 있습니다.",
      "stage": "군에서 사용 · 실제 정찰 기록",
      "stageKey": "operating",
      "slides": [
        13
      ],
      "locator": "영국 국방부의 아프가니스탄 무인기 관측 영상",
      "verifiedAt": "2026-11-10",
      "video": {
        "provider": "youtube",
        "id": "EDmOD_4jQbA",
        "url": "https://www.youtube.com/watch?v=EDmOD_4jQbA",
        "label": "공식 운용 영상",
        "buttonLabel": "정찰 영상",
        "panelTitle": "지형과 시설을 관찰하는 군용 무인기",
        "title": "영국 국방부의 2013년 아프가니스탄 관측 영상",
        "publisher": "영국 국방부 · 공식 채널",
        "contextLabel": "2013년 공개 기록",
        "watchFor": "높은 곳의 카메라로 지형과 도로, 시설을 관찰하는 모습을 보세요. 멀리 있는 상황을 영상으로 파악하는 정찰 활용입니다.",
        "note": "영국 국방부가 2013년에 공개한 작전 촬영 기록입니다.",
        "stage": {
          "key": "operating",
          "label": "군에서 사용 · 실제 정찰 기록",
          "detail": "군이 실제 작전에서 사용한 영상입니다. 당시의 지형·시설 정찰 모습을 보여 줍니다.",
          "sourceLabel": "영국 정부 공식 공개 기록",
          "sourceUrl": "https://www.gov.uk/government/news/unmanned-aerial-systems-on-show--7"
        }
      },
      "readerTitle": "영국 국방부가 공개한 무인기 관측 영상"
    }
  },
  "slides": [
    {
      "id": "opening",
      "number": "01",
      "section": 0,
      "title": "드론은 찍고, 살피고, 나르고, 작업합니다",
      "layout": "mosaic",
      "status": {
        "key": "mixed",
        "label": "드론 활용의 전체 모습",
        "detail": "촬영·점검·배송·공연에서 드론이 하는 일을 실제 사례로 살펴봅니다.",
        "stages": [
          "commercial",
          "operating",
          "trial",
          "research"
        ]
      },
      "sourceIds": [
        "ONR_INSPECTION",
        "F04",
        "D01",
        "F01",
        "MAFF_SPRAY"
      ],
      "beats": [
        {
          "label": "이미 하는 일",
          "headline": "카메라와 도구를 싣고 사람의 일을 돕습니다",
          "text": "시설 안을 촬영하고, 농장에 농약을 뿌리고, 주문한 물건을 배달합니다. 밤에는 여러 드론의 불빛으로 공연도 만듭니다.",
          "note": ""
        },
        {
          "label": "함께 살펴볼 것",
          "headline": "지금 쓰는 일과 앞으로 할 일을 알아봅니다",
          "text": "실제 활용 장면을 보고, 이미 이용할 수 있는 서비스와 시험 중인 기술을 구별합니다. 마지막에는 우리 주변에서 드론이 도울 일을 찾아봅니다.",
          "note": ""
        }
      ],
      "images": [
        "inspection",
        "agriculture",
        "delivery",
        "lightshow"
      ],
      "labels": [
        "시설을 살펴봅니다",
        "농약을 뿌립니다",
        "주문품을 배달합니다",
        "빛으로 공연합니다"
      ],
      "kicker": "01 / 가능성을 읽는 법",
      "footer": "영국 원자력규제청 · SwellPro 공식 스토어 · Walmart 기업 뉴스룸",
      "sourceLabel": "영국 원자력규제청",
      "read": [
        "시설 안을 촬영하고, 농장에 농약을 뿌리고, 주문한 물건을 배달합니다. 밤에는 여러 드론의 불빛으로 공연도 만듭니다. ",
        "실제 활용 장면을 보고, 이미 이용할 수 있는 서비스와 시험 중인 기술을 구별합니다. 마지막에는 우리 주변에서 드론이 도울 일을 찾아봅니다. "
      ],
      "imageDisclosure": "AI 생성 삽화",
      "motion": {
        "entry": "assembly"
      },
      "question": "드론은 사람 대신 어떤 일을 할 수 있을까요?"
    },
    {
      "id": "four-results",
      "number": "02",
      "section": 0,
      "title": "드론에 무엇을 싣느냐에 따라 일이 달라집니다",
      "layout": "quadrants",
      "status": {
        "key": "principle",
        "label": "활용 원리",
        "detail": "촬영·정보 수집·운반·작업으로 나누면 새로운 활용도 쉽게 이해할 수 있습니다."
      },
      "sourceIds": [
        "FAA_UAS",
        "USFA_PAYLOAD",
        "F04",
        "F07"
      ],
      "beats": [
        {
          "label": "드론에 싣는 장비",
          "headline": "카메라 · 센서 · 화물 · 작업 도구",
          "text": "카메라는 모습을 찍고, 센서는 온도나 작물이 반사하는 빛을 측정합니다. 짐을 실으면 배송하고, 살포 장치를 달면 농작업을 합니다.",
          "note": ""
        },
        {
          "label": "장비 선택",
          "headline": "할 일에 맞춰 드론과 장비를 고릅니다",
          "text": "선수를 따라 찍을 때와 농약을 싣고 날 때는 필요한 힘과 비행시간이 다릅니다. 실을 장비의 무게와 필요한 전력에 맞춰 드론을 고릅니다.",
          "note": ""
        }
      ],
      "items": [
        [
          "찍기",
          "풍경·경기 촬영",
          "cinema"
        ],
        [
          "알아보기",
          "지도·시설 점검",
          "harbor"
        ],
        [
          "나르기",
          "미끼·물품 배송",
          "delivery"
        ],
        [
          "작업하기",
          "농약 살포·재료 쌓기",
          "agriculture"
        ]
      ],
      "kicker": "01 / 가능성을 읽는 법",
      "footer": "미국 연방항공청 · 미국 소방청 · SwellPro 공식 스토어",
      "sourceLabel": "미국 연방항공청",
      "read": [
        "카메라는 모습을 찍고, 센서는 온도나 작물이 반사하는 빛을 측정합니다. 짐을 실으면 배송하고, 살포 장치를 달면 농작업을 합니다. ",
        "선수를 따라 찍을 때와 농약을 싣고 날 때는 필요한 힘과 비행시간이 다릅니다. 실을 장비의 무게와 필요한 전력에 맞춰 드론을 고릅니다. "
      ],
      "imageDisclosure": "AI 생성 삽화",
      "motion": {
        "entry": "focus"
      },
      "question": "같은 드론이 어떻게 촬영도 하고 배달도 할까요?"
    },
    {
      "id": "system",
      "number": "03",
      "section": 0,
      "title": "드론 업무는 비행과 자료 처리, 사람의 판단으로 이어집니다",
      "layout": "system",
      "status": {
        "key": "principle",
        "label": "활용 원리",
        "detail": "드론 본체·장비·프로그램·사람이 함께 움직여 하나의 일을 끝냅니다."
      },
      "sourceIds": [
        "FAA_UAS",
        "USFA_PAYLOAD",
        "DJI_MULTISPECTRAL",
        "NPS_SFM"
      ],
      "beats": [
        {
          "label": "드론 본체",
          "headline": "사람이 가기 어려운 곳까지 장비를 보냅니다",
          "text": "드론은 카메라나 짐을 싣고 높은 구조물, 넓은 농장, 좁은 시설 내부로 이동합니다.",
          "note": ""
        },
        {
          "label": "장비",
          "headline": "카메라를 달면 촬영하고, 살포기를 달면 뿌립니다",
          "text": "카메라·살포 장치·배송 상자처럼 싣는 도구에 따라 드론의 일이 달라집니다. 여러 도구를 실을 수 있어 활용 분야도 넓습니다.",
          "note": ""
        },
        {
          "label": "프로그램과 사람",
          "headline": "촬영한 사진에서 수리할 곳을 찾습니다",
          "text": "시설 담당자는 사진 속 손상이 의심되는 부위를 표시해 점검 기록을 만듭니다. 그 기록으로 추가 검사와 수리할 곳을 정합니다.",
          "note": "시설 점검 과정을 보여 주는 설명용 예시"
        }
      ],
      "nodes": [
        [
          "드론 본체",
          "필요한 장소로 이동"
        ],
        [
          "장비",
          "촬영·관찰·운반·작업"
        ],
        [
          "프로그램",
          "사진 처리·비행 관리"
        ],
        [
          "사람",
          "계획·결과 확인·정비"
        ]
      ],
      "image": "dock",
      "equipment": [
        [
          "inspection",
          "카메라",
          "시설 안을 촬영"
        ],
        [
          "agriculture",
          "살포 장치",
          "작물 위에 농약 등 살포"
        ],
        [
          "delivery",
          "화물 장치",
          "물건을 배달"
        ]
      ],
      "kicker": "01 / 가능성을 읽는 법",
      "footer": "미국 연방항공청 · 미국 소방청 · DJI Enterprise",
      "sourceLabel": "미국 연방항공청",
      "read": [
        "드론은 카메라나 짐을 싣고 높은 구조물, 넓은 농장, 좁은 시설 내부로 이동합니다. ",
        "카메라·살포 장치·배송 상자처럼 싣는 도구에 따라 드론의 일이 달라집니다. 여러 도구를 실을 수 있어 활용 분야도 넓습니다. ",
        "시설 담당자는 사진 속 손상이 의심되는 부위를 표시해 점검 기록을 만듭니다. 그 기록으로 추가 검사와 수리할 곳을 정합니다. 시설 점검 과정을 보여 주는 설명용 예시"
      ],
      "imageDisclosure": "AI 생성 삽화",
      "motion": {
        "entry": "focus"
      },
      "question": "드론 한 대만 있으면 시설 점검이 끝날까요?"
    },
    {
      "id": "mission",
      "number": "04",
      "section": 0,
      "title": "비행 계획부터 결과 확인까지가 드론 업무입니다",
      "layout": "process",
      "status": {
        "key": "principle",
        "label": "드론 업무의 기본",
        "detail": "비행 전 준비와 비행 후 결과 확인이 실제 업무의 품질을 결정합니다."
      },
      "sourceIds": [
        "FAA_OPERATIONS",
        "USGS_QA"
      ],
      "beats": [
        {
          "label": "비행 전",
          "headline": "무엇을 촬영하고 누구에게 전달할지 정합니다",
          "text": "시설의 균열 사진이 필요한지, 공사장의 지도가 필요한지 정합니다. 드론 본체·날씨·현장을 점검하고, 그 장소에서 비행할 수 있는지 확인합니다.",
          "note": ""
        },
        {
          "label": "비행 후",
          "headline": "담당자가 수리할 곳과 공사 상황을 알 수 있게 정리합니다",
          "text": "빠진 촬영 구역과 지도 위치의 오차를 확인합니다. 담당자가 현장의 변화를 비교할 수 있도록 사진과 지도에 장소·날짜를 붙여 전달합니다.",
          "note": ""
        }
      ],
      "image": "dock",
      "nodes": [
        [
          "계획",
          "무엇을 얻을까"
        ],
        [
          "점검",
          "드론 본체·날씨·현장"
        ],
        [
          "비행",
          "촬영하거나 운반"
        ],
        [
          "처리",
          "영상·지도 제작"
        ],
        [
          "확인",
          "업무에 쓸 수 있나"
        ]
      ],
      "kicker": "01 / 가능성을 읽는 법",
      "footer": "미국 연방항공청 · 미국 지질조사국",
      "sourceLabel": "미국 연방항공청",
      "read": [
        "시설의 균열 사진이 필요한지, 공사장의 지도가 필요한지 정합니다. 드론 본체·날씨·현장을 점검하고, 그 장소에서 비행할 수 있는지 확인합니다. ",
        "빠진 촬영 구역과 지도 위치의 오차를 확인합니다. 담당자가 현장의 변화를 비교할 수 있도록 사진과 지도에 장소·날짜를 붙여 전달합니다. "
      ],
      "imageDisclosure": "AI 생성 삽화",
      "motion": {
        "entry": "focus"
      },
      "question": "드론을 띄우기 전과 내린 뒤에는 무엇을 해야 할까요?",
      "check": [
        {
          "question": "같은 드론이 하는 일을 바꾸는 가장 큰 요인은 무엇인가요?",
          "options": [
            "드론의 크기와 색",
            "드론에 싣는 장비",
            "조종하는 사람의 경력"
          ],
          "answer": 1,
          "review": "four-results"
        },
        {
          "question": "드론을 내린 뒤 꼭 해야 하는 일은 무엇인가요?",
          "options": [
            "같은 경로를 한 번 더 비행하기",
            "빠진 구역과 오차를 확인해 담당자에게 전달하기",
            "촬영 자료를 바로 지우고 다음 비행 준비하기"
          ],
          "answer": 1,
          "review": "mission"
        }
      ]
    },
    {
      "id": "cinema",
      "number": "05",
      "section": 1,
      "title": "FPV 드론은 선수의 움직임을 가까이 따라갑니다",
      "layout": "cinema",
      "status": {
        "key": "operating",
        "label": "실제 방송·경기 촬영",
        "detail": "올림픽 중계와 자전거 경기 대회에서 드론 카메라가 실제 촬영에 쓰였습니다."
      },
      "sourceIds": [
        "IOC_FPV",
        "REDBULL_FPV",
        "F10"
      ],
      "beats": [
        {
          "label": "항공 촬영",
          "headline": "위에서 경기장 전체와 선수의 이동을 담습니다",
          "text": "높이와 방향을 바꾸며 경기장, 선수의 이동 경로, 주변 풍경을 한 장면에 보여 줍니다.",
          "note": ""
        },
        {
          "label": "FPV 촬영",
          "headline": "드론 카메라 화면을 보며 선수를 따라갑니다",
          "text": "FPV는 드론 카메라 화면을 보며 조종하는 방식입니다. 올림픽 중계 제작사 OBS는 2026 동계올림픽 드론 25대 중 FPV 15대를 운용했습니다.",
          "note": "OBS: 올림픽 국제 공통 중계 영상을 만드는 조직"
        },
        {
          "label": "실제 경기 장면",
          "headline": "계단과 골목을 따라가는 카메라가 속도감을 전합니다",
          "text": "내리막 자전거 경기인 다운힐에서 드론이 선수의 점프와 회전을 따라갑니다. 공식 영상에서 카메라와 선수의 움직임을 함께 살펴보세요.",
          "note": "Red Bull · 2022년 칠레 발파라이소 경기"
        }
      ],
      "image": "cinema-overhead",
      "metric": "25",
      "unit": "대",
      "metricNote": "그중 FPV 15대 · IOC/OBS 2026",
      "officialPoster": "cinema",
      "video": {
        "provider": "youtube",
        "id": "DFphM29JJq4",
        "url": "https://www.youtube.com/watch?v=DFphM29JJq4",
        "label": "공식 FPV 경기 영상",
        "title": "칠레 도심 자전거 경기의 FPV 추적 촬영",
        "originalTitle": "Full FPV Downhill Run with Tomas Slavik | Red Bull Valparaiso Cerro Abajo 2022",
        "publisher": "Red Bull Bike · 공식 채널",
        "durationLabel": "2분 33초",
        "note": "Red Bull Bike가 공개한 2022년 발파라이소 경기 영상입니다.",
        "watchFor": "카메라가 선수 뒤를 따라 계단을 내려가고 골목을 돕니다. 선수의 속도와 좁은 코스의 느낌을 함께 보세요.",
        "panelTitle": "선수를 따라가는 FPV 촬영",
        "stage": {
          "key": "operating",
          "label": "실제 스포츠 촬영",
          "sourceUrl": "https://www.youtube.com/watch?v=DFphM29JJq4",
          "detail": "실제 자전거 대회에서 촬영한 스포츠 콘텐츠입니다."
        }
      },
      "kicker": "02 / 촬영·지도·입체 모델",
      "footer": "국제올림픽위원회 · Red Bull · 국제항공스포츠연맹",
      "sourceLabel": "국제올림픽위원회",
      "read": [
        "높이와 방향을 바꾸며 경기장, 선수의 이동 경로, 주변 풍경을 한 장면에 보여 줍니다. ",
        "FPV는 드론 카메라 화면을 보며 조종하는 방식입니다. 올림픽 중계 제작사 OBS는 2026 동계올림픽 드론 25대 중 FPV 15대를 운용했습니다. OBS: 올림픽 국제 공통 중계 영상을 만드는 조직",
        "내리막 자전거 경기인 다운힐에서 드론이 선수의 점프와 회전을 따라갑니다. 공식 영상에서 카메라와 선수의 움직임을 함께 살펴보세요. Red Bull · 2022년 칠레 발파라이소 경기"
      ],
      "imageDisclosure": "공식 영상 미리보기 · 앞 단계 AI 삽화",
      "motion": {
        "entry": "cinema"
      },
      "question": "드론 카메라는 경기 중계를 어떻게 바꿀까요?"
    },
    {
      "id": "mapping",
      "number": "06",
      "section": 1,
      "title": "겹쳐 찍은 사진을 맞추면 사진 지도가 됩니다",
      "layout": "mapping",
      "status": {
        "key": "principle",
        "label": "지도 제작 원리",
        "detail": "사진 속 공통 지점을 찾아 사진들을 맞추는 과정을 살펴봅니다."
      },
      "sourceIds": [
        "NPS_SFM",
        "USGS_QA",
        "DJI_HS2_VIDEO"
      ],
      "beats": [
        {
          "label": "겹쳐 찍기",
          "headline": "같은 건물이 여러 사진에 나오게 찍습니다",
          "text": "드론이 이동하면서 사진을 겹쳐 찍습니다. 여러 사진에 나온 건물 모서리와 도로 모양을 찾아 사진들의 위치를 맞춥니다.",
          "note": ""
        },
        {
          "label": "사진 지도 만들기",
          "headline": "기울어지거나 늘어나 보이는 부분을 바로잡습니다",
          "text": "프로그램이 카메라 위치와 지형을 계산해 사진을 보정합니다. 위에서 내려다본 지도처럼 만들면 건물과 도로가 어디에 있는지 한눈에 보입니다.",
          "note": "이렇게 보정한 사진 지도를 정사영상이라고 합니다."
        }
      ],
      "image": "harbor",
      "diagramLabels": [
        "겹쳐 찍은 사진들",
        "한 장으로 이어진 사진 지도"
      ],
      "diagramResultLabels": [
        "같은 색 표식 · 서로 다른 사진의 같은 지점",
        "사진 지도 · 건물과 도로의 위치"
      ],
      "video": {
        "provider": "youtube",
        "id": "8mIToSdYmY8",
        "url": "https://www.youtube.com/watch?v=8mIToSdYmY8",
        "label": "공식 매핑·측량 영상",
        "buttonLabel": "현장 영상",
        "panelTitle": "공사 현장의 지도 제작과 측량",
        "title": "영국 HS2 공사장의 드론 촬영과 측량",
        "publisher": "DJI Enterprise · 공식 채널",
        "contextLabel": "영국 HS2 · 2023년 공개 사례",
        "watchFor": "드론이 공사장을 촬영하고, 담당자가 지도와 입체 자료로 땅을 깎고 쌓은 상태를 확인합니다.",
        "note": "DJI가 건설사 BBV의 현장 작업을 소개한 영상입니다.",
        "stage": {
          "key": "operating",
          "label": "기업 업무 운영 · 상용 장비 적용",
          "detail": "BBV가 실제 공사 관리 업무에 드론 측량을 사용합니다.",
          "sourceLabel": "DJI 공식 현장 사례",
          "sourceUrl": "https://www.mynewsdesk.com/uk/dji/news/drones-save-balfour-beatty-vinci-ps5million-on-hs2-development-463107"
        }
      },
      "kicker": "02 / 촬영·지도·입체 모델",
      "footer": "미국 국립공원관리청 · 미국 지질조사국 · DJI Enterprise",
      "sourceLabel": "미국 국립공원관리청",
      "read": [
        "드론이 이동하면서 사진을 겹쳐 찍습니다. 여러 사진에 나온 건물 모서리와 도로 모양을 찾아 사진들의 위치를 맞춥니다. ",
        "프로그램이 카메라 위치와 지형을 계산해 사진을 보정합니다. 위에서 내려다본 지도처럼 만들면 건물과 도로가 어디에 있는지 한눈에 보입니다. 이렇게 보정한 사진 지도를 정사영상이라고 합니다."
      ],
      "imageDisclosure": "원리 설명용 도해 · AI 개념 이미지",
      "motion": {
        "relation": "shared-harbor",
        "entry": "anchor"
      },
      "question": "여러 장의 사진을 어떻게 한 장의 지도로 이을까요?"
    },
    {
      "id": "space",
      "number": "07",
      "section": 1,
      "title": "입체 모델에서는 건물의 높이와 형태도 살핍니다",
      "layout": "spatial",
      "status": {
        "key": "operating",
        "label": "실제 업무 활용 · 3D 제작",
        "detail": "한국해양교통안전공단은 항구의 3D 자료를 만들어 여객선 종사자에게 제공합니다."
      },
      "sourceIds": [
        "NPS_SFM",
        "USGS_QA",
        "KOMSA_3D",
        "DJI_KARATSU_VIDEO"
      ],
      "beats": [
        {
          "label": "사진",
          "headline": "사진 한 장은 한 방향에서 본 모습을 보여 줍니다",
          "text": "비스듬히 찍은 사진에는 지붕과 벽이 함께 보입니다. 가까운 창고는 크게, 먼 창고는 작게 보이고 뒤쪽은 가려지기도 합니다.",
          "note": ""
        },
        {
          "label": "사진 지도",
          "headline": "사진 지도에서는 시설의 위치를 한눈에 봅니다",
          "text": "여러 사진을 맞춘 지도에서 건물·도로·부두의 위치와 배치를 살펴봅니다.",
          "note": ""
        },
        {
          "label": "입체 모델",
          "headline": "화면에서 돌려 보며 높이와 모양을 확인합니다",
          "text": "여러 사진에 겹쳐 나온 지점을 계산하면 건물과 지형을 입체로 만들 수 있습니다. 항구의 모습을 선장에게 알려 주거나 문화유산의 형태를 기록하는 데 쓰입니다.",
          "note": "공식 영상: 일본 가라쓰성의 촬영과 입체 모델 제작"
        }
      ],
      "image": "harbor",
      "diagramLabels": [
        "한 방향에서 찍은 사진",
        "건물과 도로의 위치",
        "벽과 높이가 드러나는 입체 모델"
      ],
      "diagramResultLabels": [
        "사진 · 가까운 것은 크게, 먼 것은 작게",
        "사진 지도 · 건물과 도로의 위치",
        "입체 모델 · 지붕과 벽, 높이"
      ],
      "video": {
        "provider": "youtube",
        "id": "OQXLEPsXQzY",
        "url": "https://www.youtube.com/watch?v=OQXLEPsXQzY",
        "label": "공식 3D 영상",
        "buttonLabel": "3D 영상",
        "panelTitle": "문화유산을 입체로 기록하는 드론",
        "title": "일본 가라쓰성의 촬영과 3D 모델 제작",
        "publisher": "DJI Enterprise",
        "contextLabel": "일본 가라쓰성 · 2020년 공개 사례",
        "watchFor": "성 주변을 여러 방향에서 촬영한 사진이 입체 모델로 바뀝니다. 실제 건물과 화면 속 지붕·벽의 형태를 비교해 보세요.",
        "note": "가라쓰시의 의뢰로 토펜이 수행한 문화유산 기록 업무를 DJI가 소개합니다.",
        "stage": {
          "key": "operating",
          "label": "업무 운영 · 문화유산 기록",
          "detail": "실제 업무에 활용한 사례입니다. 지방정부의 문화유산 기록을 기업이 수행했습니다.",
          "sourceLabel": "DJI 공식 가라쓰성 사례",
          "sourceUrl": "https://enterprise-insights.dji.com/user-stories/japan-protecting-cultural-heritage-drone-surveying-mapping"
        }
      },
      "kicker": "02 / 촬영·지도·입체 모델",
      "footer": "미국 국립공원관리청 · 미국 지질조사국 · 한국해양교통안전공단",
      "sourceLabel": "미국 국립공원관리청",
      "read": [
        "비스듬히 찍은 사진에는 지붕과 벽이 함께 보입니다. 가까운 창고는 크게, 먼 창고는 작게 보이고 뒤쪽은 가려지기도 합니다. ",
        "여러 사진을 맞춘 지도에서 건물·도로·부두의 위치와 배치를 살펴봅니다. ",
        "여러 사진에 겹쳐 나온 지점을 계산하면 건물과 지형을 입체로 만들 수 있습니다. 항구의 모습을 선장에게 알려 주거나 문화유산의 형태를 기록하는 데 쓰입니다. 공식 영상: 일본 가라쓰성의 촬영과 입체 모델 제작"
      ],
      "imageDisclosure": "원리 설명용 도해 · AI 개념 이미지",
      "motion": {
        "relation": "shared-harbor",
        "entry": "anchor"
      },
      "question": "사진 지도만으로는 알 수 없는 것은 무엇일까요?"
    },
    {
      "id": "survey",
      "number": "08",
      "section": 1,
      "title": "드론 측량은 위치와 높이, 거리를 재는 일입니다",
      "layout": "survey",
      "status": {
        "key": "principle",
        "label": "측량 원리 · 정확도 확인",
        "detail": "사진을 선명하게 찍는 과정에 위치 보정과 결과 검사를 더해야 측량 자료가 됩니다."
      },
      "sourceIds": [
        "USGS_QA",
        "DJI_HS2_VIDEO"
      ],
      "beats": [
        {
          "label": "사진 선명도",
          "headline": "작은 물체가 잘 보여도 지도 위치는 어긋날 수 있습니다",
          "text": "선명한 사진에서는 작은 물체까지 보입니다. 그러나 사진 지도가 옆으로 밀려 있으면 지도에서 읽은 위치와 실제 위치가 달라집니다.",
          "note": ""
        },
        {
          "label": "위치 보정",
          "headline": "정확한 위치를 재어 둔 점에 지도를 맞춥니다",
          "text": "현장에서 위치를 정확히 재어 둔 점을 기준으로 사진 지도를 맞춥니다. 이때 사용하는 점을 기준점이라고 합니다.",
          "note": ""
        },
        {
          "label": "오차 검사",
          "headline": "보정에 쓰지 않은 점으로 결과를 검사합니다",
          "text": "별도로 위치를 재어 둔 점과 지도 속 같은 지점을 비교합니다. 남은 차이를 재어 공사나 측정 업무에 필요한 정확도를 갖췄는지 확인합니다.",
          "note": "이 검사에 쓰는 점을 검사점이라고 합니다."
        }
      ],
      "diagramLabels": [
        "사진 속 위치와 실제 위치",
        "기준점에 맞추기",
        "별도 검사점에서 확인"
      ],
      "diagramCaptions": [
        "주황 네모는 실제 위치, 흰 점은 사진 속 같은 지점입니다.",
        "흰 점을 주황 네모에 맞춰 지도의 위치를 바로잡습니다.",
        "파란 검사점에서 두 위치 사이에 남은 거리를 잽니다."
      ],
      "video": {
        "provider": "youtube",
        "id": "8mIToSdYmY8",
        "url": "https://www.youtube.com/watch?v=8mIToSdYmY8",
        "label": "공식 매핑·측량 영상",
        "buttonLabel": "현장 영상",
        "panelTitle": "공사 현장의 지도 제작과 측량",
        "title": "영국 HS2 공사장의 드론 촬영과 측량",
        "publisher": "DJI Enterprise · 공식 채널",
        "contextLabel": "영국 HS2 · 2023년 공개 사례",
        "watchFor": "드론으로 촬영한 자료에서 높이와 흙의 양을 확인하는 과정을 보세요. 사진이 공사의 크기와 변화량을 재는 자료로 쓰입니다.",
        "note": "DJI가 건설사 BBV의 현장 작업을 소개한 영상입니다.",
        "stage": {
          "key": "operating",
          "label": "기업 업무 운영 · 상용 장비 적용",
          "detail": "BBV가 실제 공사 관리 업무에 드론 측량을 사용합니다.",
          "sourceLabel": "DJI 공식 현장 사례",
          "sourceUrl": "https://www.mynewsdesk.com/uk/dji/news/drones-save-balfour-beatty-vinci-ps5million-on-hs2-development-463107"
        }
      },
      "kicker": "02 / 촬영·지도·입체 모델",
      "footer": "미국 지질조사국 · DJI Enterprise",
      "sourceLabel": "미국 지질조사국",
      "read": [
        "선명한 사진에서는 작은 물체까지 보입니다. 그러나 사진 지도가 옆으로 밀려 있으면 지도에서 읽은 위치와 실제 위치가 달라집니다. ",
        "현장에서 위치를 정확히 재어 둔 점을 기준으로 사진 지도를 맞춥니다. 이때 사용하는 점을 기준점이라고 합니다. ",
        "별도로 위치를 재어 둔 점과 지도 속 같은 지점을 비교합니다. 남은 차이를 재어 공사나 측정 업무에 필요한 정확도를 갖췄는지 확인합니다. 이 검사에 쓰는 점을 검사점이라고 합니다."
      ],
      "imageDisclosure": "원리 설명용 도해",
      "motion": {
        "entry": "focus"
      },
      "question": "사진이 선명하면 지도 위의 위치도 정확할까요?"
    },
    {
      "id": "construction",
      "number": "09",
      "section": 1,
      "title": "공사장을 반복 촬영하면 달라진 곳이 보입니다",
      "layout": "compare",
      "status": {
        "key": "commercial",
        "label": "상용 서비스 · 건설 현장 활용",
        "detail": "건설사 PCL은 드론 지도 서비스와 계약을 맺고 공사 현장의 드론 기록을 쌓았습니다."
      },
      "sourceIds": [
        "PCL_REALITY",
        "NPS_SFM",
        "USGS_QA",
        "NIST_TWIN",
        "SKANSKA_CONSTRUCTION_VIDEO"
      ],
      "beats": [
        {
          "label": "촬영 기록",
          "headline": "다음 촬영과 비교할 현장의 모습을 남깁니다",
          "text": "공사장을 날짜별로 촬영해 기록합니다. 같은 부지를 다시 찍으면 공사가 진행되면서 무엇이 달라졌는지 비교할 수 있습니다.",
          "note": "건설사 PCL: 2024년 도입 이후 드론 비행 1만 회 이상"
        },
        {
          "label": "전후 비교",
          "headline": "새로 올라간 건물과 달라진 땅이 보입니다",
          "text": "지난번과 이번 사진을 겹쳐 놓으면 공사가 진행된 곳이 드러납니다. 현장 밖의 담당자도 같은 기록으로 진행 상황을 확인합니다.",
          "note": "공식 영상: 건설사 스칸스카는 입체 자료로 높이와 흙의 양도 관리합니다."
        }
      ],
      "images": [
        "construction-before",
        "construction-after"
      ],
      "video": {
        "provider": "youtube",
        "id": "VHNfSpJY0hY",
        "url": "https://www.youtube.com/watch?v=VHNfSpJY0hY",
        "label": "공식 공사 영상",
        "buttonLabel": "공사 영상",
        "panelTitle": "날짜별 공사 진행을 비교하는 드론",
        "title": "스칸스카의 건설 현장 관리",
        "publisher": "DroneDeploy · 공식 채널",
        "contextLabel": "Skanska · Cold Spring Harbor Labs 현장",
        "watchFor": "날짜가 다른 현장 사진과 입체 자료를 비교합니다. 작업한 구역과 땅의 높이·흙의 양을 어떻게 확인하는지 보세요.",
        "note": "미국 콜드 스프링 하버 연구소 공사 현장을 소개한 드론디플로이 영상입니다.",
        "stage": {
          "key": "operating",
          "label": "기업 업무 운영 · 현장 관리",
          "detail": "실제 기업 업무에 활용한 사례입니다. 스칸스카가 촬영 기록을 공사 관리와 팀 공유에 사용합니다.",
          "sourceLabel": "Skanska 공식 현장 활용 사례",
          "sourceUrl": "https://interactive.usa.skanska.com/innovation-with-impact"
        }
      },
      "kicker": "02 / 촬영·지도·입체 모델",
      "footer": "PCL Construction · 미국 국립공원관리청 · 미국 지질조사국",
      "sourceLabel": "PCL Construction",
      "read": [
        "공사장을 날짜별로 촬영해 기록합니다. 같은 부지를 다시 찍으면 공사가 진행되면서 무엇이 달라졌는지 비교할 수 있습니다. 건설사 PCL: 2024년 도입 이후 드론 비행 1만 회 이상",
        "지난번과 이번 사진을 겹쳐 놓으면 공사가 진행된 곳이 드러납니다. 현장 밖의 담당자도 같은 기록으로 진행 상황을 확인합니다. 공식 영상: 건설사 스칸스카는 입체 자료로 높이와 흙의 양도 관리합니다."
      ],
      "imageDisclosure": "AI 생성 삽화",
      "motion": {
        "entry": "compare"
      },
      "question": "같은 공사장을 매주 찍으면 무엇을 알 수 있을까요?",
      "check": [
        {
          "question": "여러 장의 사진을 한 장의 지도로 맞출 때 무엇을 이용하나요?",
          "options": [
            "여러 사진에 함께 나온 같은 지점",
            "가장 선명한 사진 한 장",
            "드론의 비행 속도"
          ],
          "answer": 0,
          "review": "mapping"
        },
        {
          "question": "기준점과 검사점은 어떻게 다른가요?",
          "options": [
            "둘은 같은 점을 부르는 다른 이름이다",
            "기준점은 지도를 맞추는 데, 검사점은 남은 오차를 확인하는 데 쓴다",
            "검사점은 드론이 사진을 찍는 위치다"
          ],
          "answer": 1,
          "review": "survey"
        }
      ]
    },
    {
      "id": "inspection",
      "number": "10",
      "section": 2,
      "title": "위험한 시설 안을 드론 카메라로 먼저 살핍니다",
      "layout": "inspection",
      "status": {
        "key": "operating",
        "label": "실제 시설 점검",
        "detail": "영국 원자력 시설 셀라필드는 시설 안팎의 일상 점검에 드론을 활용합니다."
      },
      "sourceIds": [
        "ONR_INSPECTION",
        "USFA_PAYLOAD",
        "FLYABILITY_INSPECTION_VIDEO"
      ],
      "beats": [
        {
          "label": "접근",
          "headline": "높고 좁은 곳에 카메라를 보냅니다",
          "text": "높은 구조물이나 좁은 시설 내부에 드론을 보내 촬영합니다. 담당자는 들어가기 전에 시설 상태를 볼 수 있습니다.",
          "note": ""
        },
        {
          "label": "점검과 수리",
          "headline": "촬영 자료에서 이상이 의심되는 곳을 찾습니다",
          "text": "시설 담당자가 영상과 온도 같은 측정 자료를 살펴봅니다. 추가 검사가 필요한 위치를 골라 수리 계획을 세웁니다.",
          "note": "공식 영상: 체르노빌 미완공 원전 내부 점검 시험"
        }
      ],
      "image": "inspection",
      "video": {
        "provider": "youtube",
        "id": "yyZZSyCmBqY",
        "url": "https://www.youtube.com/watch?v=yyZZSyCmBqY",
        "label": "공식 점검 영상",
        "buttonLabel": "점검 영상",
        "panelTitle": "좁은 시설 내부를 살피는 드론",
        "title": "체르노빌 미완공 원전 5호기의 내부 점검",
        "publisher": "Flyability · 공식 채널",
        "contextLabel": "체르노빌 · 2020년 공개 임무",
        "watchFor": "보호틀에 둘러싸인 드론이 좁은 시설 안을 이동하며 촬영합니다. 사람이 들어가기 어려운 구역에서 얻는 영상을 보세요.",
        "note": "플라이어빌리티가 2020년에 공개한 현장 점검 임무입니다.",
        "stage": {
          "key": "trial",
          "label": "실증 · 현장 점검 시험",
          "detail": "실증 단계입니다. 실제 원전 시설에서 드론의 점검 활용을 시험했습니다.",
          "sourceLabel": "Flyability 공식 점검 임무 발표",
          "sourceUrl": "https://www.flyability.com/news/chernobyl-mission"
        }
      },
      "kicker": "03 / 현장에서 쓰이는 드론",
      "footer": "영국 원자력규제청 · 미국 소방청 · Flyability",
      "sourceLabel": "영국 원자력규제청",
      "read": [
        "높은 구조물이나 좁은 시설 내부에 드론을 보내 촬영합니다. 담당자는 들어가기 전에 시설 상태를 볼 수 있습니다. ",
        "시설 담당자가 영상과 온도 같은 측정 자료를 살펴봅니다. 추가 검사가 필요한 위치를 골라 수리 계획을 세웁니다. 공식 영상: 체르노빌 미완공 원전 내부 점검 시험"
      ],
      "imageDisclosure": "AI 생성 삽화",
      "motion": {
        "entry": "cinema"
      },
      "question": "사람이 들어가기 위험한 시설은 어떻게 살펴볼까요?"
    },
    {
      "id": "agriculture",
      "number": "11",
      "section": 2,
      "title": "농업 드론은 작물을 살피고 농약 등을 뿌립니다",
      "layout": "dual",
      "status": {
        "key": "mixed",
        "label": "상용 장비 · 실제 농작업",
        "detail": "작물 관찰용 장비와 농약 등을 뿌리는 살포 장비가 실제 농작업에 쓰입니다.",
        "stages": [
          "commercial",
          "operating"
        ]
      },
      "sourceIds": [
        "DJI_MULTISPECTRAL",
        "MAFF_SPRAY",
        "DJI_ORCHARD_VIDEO"
      ],
      "beats": [
        {
          "label": "작물 관찰",
          "headline": "작물이 반사하는 빛의 차이로 살펴볼 구역을 찾습니다",
          "text": "일반 사진과 눈에 보이지 않는 빛을 측정한 자료를 함께 봅니다. 넓은 밭에서 다른 곳과 상태가 달라 보이는 구역을 골라 현장에서 확인합니다.",
          "note": ""
        },
        {
          "label": "농약 등 살포",
          "headline": "넓은 농장 위를 이동하며 필요한 곳에 뿌립니다",
          "text": "일본 농림수산성은 2024회계연도 드론 살포 작업 면적을 119.6만 ha로 집계했습니다. 드론 살포는 이미 농업 현장에서 쓰이는 작업입니다.",
          "note": "1ha(헥타르)는 가로·세로 각각 100m인 땅의 넓이입니다."
        }
      ],
      "image": "agriculture",
      "items": [
        [
          "작물 관찰",
          "카메라·빛 감지 센서",
          "판매 중인 장비"
        ],
        [
          "농약 등 살포",
          "탱크·살포 장치",
          "실제 농작업"
        ]
      ],
      "video": {
        "provider": "youtube",
        "id": "EAF18dju6vE",
        "url": "https://www.youtube.com/watch?v=EAF18dju6vE",
        "label": "공식 살포 영상",
        "buttonLabel": "살포 영상",
        "panelTitle": "과수원에 뿌리고 결과를 확인하는 드론",
        "title": "DJI T50의 과수원 살포 시험",
        "publisher": "DJI Agriculture · 공식 채널",
        "contextLabel": "과수원 · 농업 드론 T50",
        "watchFor": "드론이 나무 위로 약제를 뿌립니다. 물방울이 닿으면 색이 변하는 종이로 약제가 어느 곳까지 도달했는지 확인합니다.",
        "note": "농업 드론 제조사 DJI가 공개한 시험 영상입니다.",
        "stage": {
          "key": "trial",
          "label": "실증 · 과수원 살포 시험",
          "detail": "실증 단계의 살포 시험입니다. 시험에 사용한 T50은 판매 중인 제품입니다.",
          "sourceLabel": "DJI Agriculture 공식 시험 영상·설명",
          "sourceUrl": "https://www.youtube.com/watch?v=EAF18dju6vE"
        }
      },
      "kicker": "03 / 현장에서 쓰이는 드론",
      "footer": "DJI Enterprise · 일본 농림수산성 · DJI Agriculture",
      "sourceLabel": "DJI Enterprise",
      "read": [
        "일반 사진과 눈에 보이지 않는 빛을 측정한 자료를 함께 봅니다. 넓은 밭에서 다른 곳과 상태가 달라 보이는 구역을 골라 현장에서 확인합니다. ",
        "일본 농림수산성은 2024회계연도 드론 살포 작업 면적을 119.6만 ha로 집계했습니다. 드론 살포는 이미 농업 현장에서 쓰이는 작업입니다. 1ha(헥타르)는 가로·세로 각각 100m인 땅의 넓이입니다."
      ],
      "imageDisclosure": "AI 생성 삽화",
      "motion": {
        "entry": "focus"
      },
      "question": "넓은 밭에서 상태가 나쁜 곳을 어떻게 찾을까요?"
    },
    {
      "id": "public-safety",
      "number": "12",
      "section": 2,
      "title": "드론 영상은 소방대원이 현장을 파악하게 돕습니다",
      "layout": "hero",
      "status": {
        "key": "operating",
        "label": "실제 공공안전 업무",
        "detail": "신고 현장으로 드론을 보내 대응팀의 상황 파악을 돕는 방식이 운영되고 있습니다."
      },
      "sourceIds": [
        "OJP_DFR",
        "USFA_PAYLOAD",
        "DECATUR_FIRE_VIDEO"
      ],
      "beats": [
        {
          "label": "현장 확인",
          "headline": "불이 난 건물과 주변 도로를 함께 봅니다",
          "text": "위에서 찍은 영상으로 불이 난 위치와 주변 건물, 진입할 도로를 살핍니다. 현장으로 오는 소방대원도 도착 전에 상황을 볼 수 있습니다.",
          "note": ""
        },
        {
          "label": "대응 지원",
          "headline": "지상 보고에 항공 영상을 더해 대응합니다",
          "text": "소방대원은 드론 영상과 현장 보고를 함께 보며 필요한 인력과 장비를 판단합니다. 미국 디케이터시의 실제 주택 화재 영상에서 위쪽 시야가 알려 주는 정보를 살펴보세요.",
          "note": ""
        }
      ],
      "image": "rescue",
      "officialPoster": "fire",
      "video": {
        "provider": "youtube",
        "id": "UZqDKsrgHQ8",
        "url": "https://www.youtube.com/watch?v=UZqDKsrgHQ8",
        "label": "공식 대응 영상",
        "buttonLabel": "대응 영상",
        "panelTitle": "화재 현장을 위에서 살피는 드론",
        "title": "미국 디케이터의 주택 화재 항공 영상",
        "publisher": "DJI Enterprise · 공식 채널",
        "contextLabel": "미국 Decatur · 실제 주택 화재 대응",
        "watchFor": "불이 난 건물과 연기, 주변 도로가 한 화면에 들어옵니다. 지상에서는 한눈에 보기 어려운 주변 상황을 살펴보세요.",
        "note": "DJI가 실제 화재 대응 사례와 연결해 공개한 현장 영상입니다.",
        "stage": {
          "key": "operating",
          "label": "공공 대응 · 실제 현장 운용",
          "detail": "실제 소방 대응에 사용한 영상입니다. 드론이 출동 인력의 현장 파악을 도왔습니다.",
          "sourceLabel": "DJI 공식 Decatur 화재 대응 기록",
          "sourceUrl": "https://enterprise.dji.com/news/detail/above-the-flames-a-tale-from-the-field"
        }
      },
      "kicker": "03 / 현장에서 쓰이는 드론",
      "footer": "미국 법무부 OJP · 미국 소방청 · DJI Enterprise",
      "sourceLabel": "미국 법무부",
      "read": [
        "위에서 찍은 영상으로 불이 난 위치와 주변 건물, 진입할 도로를 살핍니다. 현장으로 오는 소방대원도 도착 전에 상황을 볼 수 있습니다. ",
        "소방대원은 드론 영상과 현장 보고를 함께 보며 필요한 인력과 장비를 판단합니다. 미국 디케이터시의 실제 주택 화재 영상에서 위쪽 시야가 알려 주는 정보를 살펴보세요. "
      ],
      "imageDisclosure": "공식 영상 미리보기",
      "motion": {
        "entry": "cinema"
      },
      "question": "불이 났을 때 하늘에서 보면 무엇이 보일까요?"
    },
    {
      "id": "military",
      "number": "13",
      "section": 2,
      "title": "군용 드론은 지형과 시설을 정찰합니다",
      "layout": "hero",
      "status": {
        "key": "operating",
        "label": "군 장비 도입 · 실제 정찰",
        "detail": "미 육군은 2025년 소형 정찰 드론의 부대 배치를 발표했습니다."
      },
      "sourceIds": [
        "ARMY_SRR",
        "MOD_OPERATION_VIDEO"
      ],
      "beats": [
        {
          "label": "소형 정찰 드론",
          "headline": "사람이 직접 가기 전에 주변 상황을 살핍니다",
          "text": "소형 드론에 달린 카메라가 지형과 주변 시설의 모습을 전합니다. 미 육군은 2025년 소형 정찰 드론의 부대 배치를 발표했습니다.",
          "note": ""
        },
        {
          "label": "실제 관측 장면",
          "headline": "상공에서 지형과 시설의 위치를 확인합니다",
          "text": "영국 국방부의 공개 영상에는 지형과 지상 시설을 바라보는 무인기 카메라 화면이 담겨 있습니다. 군이 항공 영상을 정찰·감시 자료로 사용하는 모습입니다.",
          "note": "영국 국방부 · 2013년 공개 관측 기록"
        }
      ],
      "image": "military",
      "officialPoster": "military",
      "video": {
        "provider": "youtube",
        "id": "EDmOD_4jQbA",
        "url": "https://www.youtube.com/watch?v=EDmOD_4jQbA",
        "label": "공식 운용 영상",
        "buttonLabel": "정찰 영상",
        "panelTitle": "지형과 시설을 관찰하는 군용 무인기",
        "title": "영국 국방부의 2013년 아프가니스탄 관측 영상",
        "publisher": "영국 국방부 · 공식 채널",
        "contextLabel": "2013년 공개 기록",
        "watchFor": "높은 곳의 카메라로 지형과 도로, 시설을 관찰하는 모습을 보세요. 멀리 있는 상황을 영상으로 파악하는 정찰 활용입니다.",
        "note": "영국 국방부가 2013년에 공개한 작전 촬영 기록입니다.",
        "stage": {
          "key": "operating",
          "label": "군에서 사용 · 실제 정찰 기록",
          "detail": "군이 실제 작전에서 사용한 영상입니다. 당시의 지형·시설 정찰 모습을 보여 줍니다.",
          "sourceLabel": "영국 정부 공식 공개 기록",
          "sourceUrl": "https://www.gov.uk/government/news/unmanned-aerial-systems-on-show--7"
        }
      },
      "kicker": "03 / 현장에서 쓰이는 드론",
      "footer": "미 육군 · 영국 국방부",
      "sourceLabel": "미 육군",
      "read": [
        "소형 드론에 달린 카메라가 지형과 주변 시설의 모습을 전합니다. 미 육군은 2025년 소형 정찰 드론의 부대 배치를 발표했습니다. ",
        "영국 국방부의 공개 영상에는 지형과 지상 시설을 바라보는 무인기 카메라 화면이 담겨 있습니다. 군이 항공 영상을 정찰·감시 자료로 사용하는 모습입니다. 영국 국방부 · 2013년 공개 관측 기록"
      ],
      "imageDisclosure": "공식 영상 미리보기",
      "motion": {
        "entry": "cinema"
      },
      "question": "군은 작은 드론을 어디에 쓸까요?"
    },
    {
      "id": "lightshow",
      "number": "14",
      "section": 2,
      "title": "드론의 불빛과 위치를 맞춰 하늘에 그림을 그립니다",
      "layout": "dots",
      "status": {
        "key": "commercial",
        "label": "상용 공연 서비스 · 정기 공연",
        "detail": "드론쇼는 실제 공연 계약과 정기 공연으로 운영되는 콘텐츠입니다."
      },
      "sourceIds": [
        "F01",
        "F02",
        "F03",
        "GWANGALLI_SHOW_VIDEO"
      ],
      "beats": [
        {
          "label": "공연 원리",
          "headline": "드론 한 대가 그림의 빛 한 점을 맡습니다",
          "text": "제작자가 각 드론의 위치·불빛 색·이동 순서를 설계합니다. 여러 드론이 함께 움직이는 군집 비행으로 글자와 그림을 만듭니다.",
          "note": ""
        },
        {
          "label": "공연 제작",
          "headline": "그림을 설계하고 여러 드론의 비행을 맞춥니다",
          "text": "광안리는 드론라이트쇼를 정기적으로 운영합니다. 유성구는 전문업체에 공연 제작과 비행 운영을 맡기는 계약을 맺었습니다.",
          "note": "공식 공연 영상: 부산 광안리 드론라이트쇼"
        }
      ],
      "image": "lightshow",
      "video": {
        "provider": "youtube",
        "id": "YfhxizitLQo",
        "url": "https://www.youtube.com/watch?v=YfhxizitLQo",
        "label": "공식 공연 영상",
        "buttonLabel": "공연 영상",
        "panelTitle": "관객 앞에서 펼쳐진 드론쇼",
        "title": "광안리 바다탐험 드론라이트쇼",
        "publisher": "수영구TV · 공식 채널",
        "contextLabel": "부산 광안리 · 2024년 8월 공연",
        "watchFor": "여러 드론이 위치와 빛의 색을 바꾸며 바다 생물과 장면을 만듭니다. 그림이 바뀌는 동안 각 불빛이 어떻게 움직이는지 보세요.",
        "note": "수영구TV가 공개한 2024년 8월 24일 공연 하이라이트입니다.",
        "stage": {
          "key": "operating",
          "label": "운영 · 공공 정기 공연",
          "detail": "실제 운영 중인 정기 공연입니다. 광안리 해변의 관객에게 선보인 장면입니다.",
          "sourceLabel": "광안리 M 드론라이트쇼 공식 운영 안내",
          "sourceUrl": "https://www.gwangallimdrone.co.kr/"
        }
      },
      "kicker": "03 / 현장에서 쓰이는 드론",
      "footer": "광안리 M 드론라이트쇼 공식 운영 사이트 · 대전광역시 유성구 계약정보공개 · 인텔",
      "sourceLabel": "광안리 M 드론라이트쇼 공식 운영 사이트",
      "read": [
        "제작자가 각 드론의 위치·불빛 색·이동 순서를 설계합니다. 여러 드론이 함께 움직이는 군집 비행으로 글자와 그림을 만듭니다. ",
        "광안리는 드론라이트쇼를 정기적으로 운영합니다. 유성구는 전문업체에 공연 제작과 비행 운영을 맡기는 계약을 맺었습니다. 공식 공연 영상: 부산 광안리 드론라이트쇼"
      ],
      "imageDisclosure": "원리 설명용 도해",
      "motion": {
        "entry": "assembly"
      },
      "question": "수백 대의 드론이 어떻게 하늘에 그림을 그릴까요?",
      "check": [
        {
          "question": "시설 점검에서 수리할 곳을 정하는 것은 누구인가요?",
          "options": [
            "드론이 스스로 정한다",
            "영상과 측정 자료를 본 시설 담당자",
            "드론 제조사"
          ],
          "answer": 1,
          "review": "inspection"
        },
        {
          "question": "드론쇼에서 드론 한 대가 맡는 것은 무엇인가요?",
          "options": [
            "그림의 빛 한 점",
            "그림 하나 전체",
            "공연 음악"
          ],
          "answer": 0,
          "review": "lightshow"
        }
      ]
    },
    {
      "id": "fishing",
      "number": "15",
      "section": 3,
      "title": "낚시 드론은 미끼를 원하는 지점까지 옮깁니다",
      "layout": "hero",
      "status": {
        "key": "commercial",
        "label": "상용 제품 · 판매 중",
        "detail": "드론 제조사 SwellPro는 미끼와 낚시 채비를 나르는 낚시 드론을 판매합니다."
      },
      "sourceIds": [
        "F04",
        "SWELLPRO_FISHING_VIDEO"
      ],
      "beats": [
        {
          "label": "미끼 운반",
          "headline": "낚싯대로 보내기 어려운 먼 지점에 미끼를 놓습니다",
          "text": "드론에 미끼와 낚시 채비를 매달아 옮긴 뒤 내려놓습니다. 채비는 낚싯줄에 연결한 바늘·추·미끼 등의 구성입니다.",
          "note": ""
        },
        {
          "label": "드론과 사람의 역할",
          "headline": "드론은 미끼를 옮기고, 사람은 낚싯줄을 다룹니다",
          "text": "공식 제품 영상은 이륙부터 이동·미끼 투하까지 보여 줍니다. 사용할 장소를 고를 때는 그곳의 비행 가능 구역과 낚시 규칙을 확인합니다.",
          "note": ""
        }
      ],
      "image": "fishing",
      "video": {
        "provider": "youtube",
        "id": "yUaWKhP2YKQ",
        "url": "https://www.youtube.com/watch?v=yUaWKhP2YKQ",
        "label": "공식 낚시 영상",
        "buttonLabel": "낚시 영상",
        "panelTitle": "미끼를 원하는 지점으로 보내는 드론",
        "title": "스웰프로 FD1+의 낚시 미끼 운반",
        "publisher": "SwellPro · 공식 채널",
        "contextLabel": "SwellPro FD1+ · 제품 사용 시연",
        "watchFor": "드론에 미끼와 낚싯줄을 연결하고, 물 위의 목표 지점까지 날려 보내 내려놓습니다.",
        "note": "낚시 드론 제조사 스웰프로의 제품 사용 영상입니다.",
        "stage": {
          "key": "commercial",
          "label": "상용화 · 낚시용 제품 판매",
          "detail": "상용화된 낚시용 드론입니다. 제조사 판매 페이지에서 구매할 수 있습니다.",
          "sourceLabel": "SwellPro 공식 판매·시연 페이지",
          "sourceUrl": "https://store.swellpro.com/products/fisherman-fd1plus-fishing-drone"
        }
      },
      "kicker": "04 / 물건에서 사람까지",
      "footer": "SwellPro 공식 스토어 · SwellPro",
      "sourceLabel": "SwellPro 공식 스토어",
      "read": [
        "드론에 미끼와 낚시 채비를 매달아 옮긴 뒤 내려놓습니다. 채비는 낚싯줄에 연결한 바늘·추·미끼 등의 구성입니다. ",
        "공식 제품 영상은 이륙부터 이동·미끼 투하까지 보여 줍니다. 사용할 장소를 고를 때는 그곳의 비행 가능 구역과 낚시 규칙을 확인합니다. "
      ],
      "imageDisclosure": "AI 생성 삽화",
      "motion": {
        "entry": "cinema"
      },
      "question": "낚시 드론은 물고기를 직접 잡을까요?"
    },
    {
      "id": "delivery",
      "number": "16",
      "section": 3,
      "title": "미국 일부 지역에서는 드론 배송을 주문합니다",
      "layout": "metric-hero",
      "status": {
        "key": "commercial",
        "label": "상용 배송 서비스",
        "detail": "미국 유통업체 월마트는 배송 가능한 주소와 상품이면 드론 배송을 주문할 수 있는 서비스를 제공합니다."
      },
      "sourceIds": [
        "D01",
        "D02",
        "D10",
        "WING_DELIVERY_VIDEO"
      ],
      "beats": [
        {
          "label": "실제 주문 서비스",
          "headline": "미국 4개 주의 66개 매장에서 배송했습니다",
          "text": "미국 유통업체 월마트는 2026년 5월 누적 드론 배송 100만 건 초과를 발표했습니다. 고객이 매장에 주문한 물건을 드론으로 받아 보는 서비스입니다.",
          "note": ""
        },
        {
          "label": "고객의 이용 방식",
          "headline": "배송 대상 주소와 상품을 앱에서 확인합니다",
          "text": "서비스 지역의 고객은 웹이나 앱에서 드론 배송을 선택합니다. 받을 주소와 상품, 당일 날씨에 맞춰 배송 가능한 주문이 표시됩니다.",
          "note": "공식 영상: 배송업체 윙이 배달하는 월마트 주문품"
        }
      ],
      "image": "delivery",
      "metric": "100만+",
      "unit": "건",
      "metricNote": "Walmart 발표 · 2026.05.29",
      "video": {
        "provider": "youtube",
        "id": "a2OSiE2M4g4",
        "url": "https://www.youtube.com/watch?v=a2OSiE2M4g4",
        "label": "공식 택배 영상",
        "buttonLabel": "택배 영상",
        "panelTitle": "주문한 물품을 받는 드론 배송",
        "title": "윙이 배달하는 월마트 주문 물품",
        "publisher": "Wing · 공식 채널",
        "contextLabel": "Wing × Walmart · 2024년 공개 영상",
        "watchFor": "주문 물품을 싣고 출발한 드론이 고객의 배송 장소로 이동해 물건을 내려놓는 과정을 보세요.",
        "note": "윙이 2024년에 공개한 미국 월마트 배송 영상입니다.",
        "stage": {
          "key": "commercial",
          "label": "상용 서비스 · 지역 한정 배송",
          "detail": "상용 배송 서비스입니다. 월마트 주문 화면에서 주소와 상품의 배송 가능 여부를 확인합니다.",
          "sourceLabel": "Walmart 공식 드론 배송 이용 안내",
          "sourceUrl": "https://www.walmart.com/help/article/drone-delivery/4870314a62634f368fe23cdf94ea28e2"
        }
      },
      "kicker": "04 / 물건에서 사람까지",
      "footer": "Walmart 기업 뉴스룸 · Walmart 고객 도움말 · 미국 연방항공청",
      "sourceLabel": "Walmart 기업 뉴스룸",
      "read": [
        "미국 유통업체 월마트는 2026년 5월 누적 드론 배송 100만 건 초과를 발표했습니다. 고객이 매장에 주문한 물건을 드론으로 받아 보는 서비스입니다. ",
        "서비스 지역의 고객은 웹이나 앱에서 드론 배송을 선택합니다. 받을 주소와 상품, 당일 날씨에 맞춰 배송 가능한 주문이 표시됩니다. 공식 영상: 배송업체 윙이 배달하는 월마트 주문품"
      ],
      "imageDisclosure": "AI 생성 삽화",
      "motion": {
        "entry": "cinema"
      },
      "question": "드론 배송, 지금 실제로 주문할 수 있을까요?"
    },
    {
      "id": "korea-delivery",
      "number": "17",
      "section": 3,
      "title": "한국의 드론 배송은 섬·공원의 지정 장소까지 왔습니다",
      "layout": "metrics",
      "status": {
        "key": "operating",
        "label": "공공 드론배송 · 실제 운영",
        "detail": "2025년 발표에서 섬·공원의 지정 장소를 연결한 실제 배송 실적을 확인할 수 있습니다."
      },
      "sourceIds": [
        "D03"
      ],
      "beats": [
        {
          "label": "실제 배송 장소",
          "headline": "고흥 낚시공원에 음식과 낚시용품을 배달했습니다",
          "text": "거금해양낚시공원을 찾은 이용자에게 음식과 낚시용품을 드론으로 배달했습니다.",
          "note": ""
        },
        {
          "label": "공공 배송 사업",
          "headline": "166개 배송 지점을 연결해 5,236회 배달했습니다",
          "text": "국토교통부가 발표한 공공 드론 배송 사업(K-드론배송)의 실적입니다. 섬과 공원의 정해진 장소로 물품을 배달했습니다.",
          "note": ""
        }
      ],
      "image": "harbor",
      "metrics": [
        [
          "166",
          "개 지점"
        ],
        [
          "5,236",
          "회 배송"
        ]
      ],
      "metricNote": "국토교통부 발표 · 2025.12.03",
      "kicker": "04 / 물건에서 사람까지",
      "footer": "국토교통부",
      "sourceLabel": "국토교통부",
      "read": [
        "거금해양낚시공원을 찾은 이용자에게 음식과 낚시용품을 드론으로 배달했습니다. ",
        "국토교통부가 발표한 공공 드론 배송 사업(K-드론배송)의 실적입니다. 섬과 공원의 정해진 장소로 물품을 배달했습니다. "
      ],
      "imageDisclosure": "AI 생성 삽화",
      "motion": {
        "entry": "condition"
      },
      "question": "한국에서는 드론이 어디까지 물건을 배달했을까요?"
    },
    {
      "id": "medical",
      "number": "18",
      "section": 3,
      "title": "드론은 병원에 필요한 혈액을 더 빨리 보냈습니다",
      "layout": "medical",
      "status": {
        "key": "operating",
        "label": "실제 의료 배송 · 운영 결과 연구",
        "detail": "르완다 20개 의료시설의 실제 드론 배송 기록을 도로 운반 시간 계산값과 비교했습니다."
      },
      "sourceIds": [
        "D04",
        "ZIPLINE_BLOOD_VIDEO"
      ],
      "beats": [
        {
          "label": "실제 배송 기록",
          "headline": "준비와 포장을 포함해 평균 49.6분 걸렸습니다",
          "text": "르완다의 병원들은 필요한 혈액을 드론으로 받았습니다. 주문 뒤 혈액을 준비하고 포장해 병원에 도착하기까지 걸린 시간을 조사했습니다.",
          "note": "20개 의료시설 · 2017~2019년 자료를 분석한 2022년 연구"
        },
        {
          "label": "기존 도로 운반과 비교",
          "headline": "병원 차량의 왕복보다 79분 짧았습니다",
          "text": "준비·포장 시간을 뺀 드론 배송 기록은 중앙값 41분입니다. 병원 차가 혈액을 공급하는 혈액원에 갔다 오는 시간은 120분으로 추정됐습니다.",
          "note": "중앙값: 기록을 작은 순서로 놓았을 때 가운데 값"
        },
        {
          "label": "차량이 바로 출발하는 조건",
          "headline": "도로 편도로 계산해도 드론이 19분 짧았습니다",
          "text": "혈액원이 차를 갖추고 병원으로 바로 배달하면 도로 시간은 60분으로 계산됩니다. 이 조건에서도 드론 배송 기록 41분이 더 짧았습니다.",
          "note": "드론: 실제 배송 기록 · 도로: 운반 방식에 따른 계산값"
        }
      ],
      "image": "terrain",
      "caseData": {
        "sourceId": "D04",
        "unit": "분",
        "mean": {
          "value": 49.6,
          "confidence": 95,
          "low": 49.1,
          "high": 50.2
        },
        "facilities": 20,
        "drone": 41,
        "scenarios": [
          {
            "oneWay": false,
            "road": 120,
            "delta": 79,
            "label": "병원 차량 왕복 · 계산값",
            "caption": "준비·포장 제외 · 중앙값 비교",
            "differenceLabel": "드론이 더 빠른 시간",
            "reference": ""
          },
          {
            "oneWay": true,
            "road": 60,
            "delta": 19,
            "label": "혈액원 차량 편도 · 계산값",
            "caption": "혈액원이 차량을 보유한 조건 · 중앙값",
            "differenceLabel": "드론이 더 빠른 시간",
            "reference": ""
          }
        ]
      },
      "video": {
        "provider": "youtube",
        "id": "QWglZKVP26c",
        "url": "https://www.youtube.com/watch?v=QWglZKVP26c",
        "label": "공식 혈액 배송 영상",
        "buttonLabel": "배송 영상",
        "panelTitle": "병원에 혈액을 전달하는 드론",
        "title": "르완다 무호로로 병원의 혈액 배송",
        "publisher": "Zipline · 공식 채널",
        "contextLabel": "르완다 · 2016년 실제 배송",
        "watchFor": "드론이 병원까지 비행해 혈액을 전달합니다. 산과 도로를 우회하는 대신 공중으로 연결하는 이동 경로를 보세요.",
        "note": "2016년 한 차례의 배송을 빠르게 재생한 영상입니다. 시간 비교는 본문의 여러 병원 배송 기록을 사용합니다.",
        "stage": {
          "key": "commercial",
          "label": "상용 서비스 · 의료기관 배송",
          "detail": "르완다의 의료기관에 혈액을 공급하는 상용 배송 서비스입니다.",
          "sourceLabel": "Gavi 공식 서비스 개시 발표",
          "sourceUrl": "https://www.gavi.org/news/media-room/rwanda-launches-worlds-first-national-drone-delivery-service-powered-zipline"
        }
      },
      "kicker": "04 / 물건에서 사람까지",
      "footer": "The Lancet Global Health · Zipline 공식 영상",
      "sourceLabel": "The Lancet Global Health",
      "read": [
        "르완다의 병원들은 필요한 혈액을 드론으로 받았습니다. 주문 뒤 혈액을 준비하고 포장해 병원에 도착하기까지 걸린 시간을 조사했습니다. 20개 의료시설 · 2017~2019년 자료를 분석한 2022년 연구",
        "준비·포장 시간을 뺀 드론 배송 기록은 중앙값 41분입니다. 병원 차가 혈액을 공급하는 혈액원에 갔다 오는 시간은 120분으로 추정됐습니다. 중앙값: 기록을 작은 순서로 놓았을 때 가운데 값",
        "혈액원이 차를 갖추고 병원으로 바로 배달하면 도로 시간은 60분으로 계산됩니다. 이 조건에서도 드론 배송 기록 41분이 더 짧았습니다. 드론: 실제 배송 기록 · 도로: 운반 방식에 따른 계산값"
      ],
      "imageDisclosure": "AI 생성 삽화",
      "motion": {
        "entry": "condition"
      },
      "question": "병원에 혈액을 보낼 때 드론이 차보다 빠를까요?"
    },
    {
      "id": "airtaxi",
      "number": "19",
      "section": 3,
      "title": "사람을 태우는 드론은 아직 시험 비행 중입니다",
      "layout": "airtaxi",
      "status": {
        "key": "trial",
        "label": "인증 시험 · 실증 비행",
        "detail": "승객을 태우는 정식 서비스는 아직 없습니다. 미국에서는 설계 안전 인증 시험을, 중국에서는 시험 비행을 진행했습니다."
      },
      "sourceIds": [
        "D05",
        "D06",
        "D09",
        "EHANG_SHANGHAI_VIDEO"
      ],
      "beats": [
        {
          "label": "항공기의 모습",
          "headline": "전기로 움직이고 수직으로 뜨고 내립니다",
          "text": "이런 항공기를 eVTOL이라고 합니다. 중국 회사 이항이 만든 기체는 조종사 없이 승객을 태우도록 설계됐습니다. 영상은 2025년 상하이에서 진행한 실증 비행입니다.",
          "note": "실증: 실제 현장에서 사용 가능성을 확인하는 시험"
        },
        {
          "label": "항공기의 안전 확인",
          "headline": "미국에서는 승객을 태우기 전에 설계 안전 인증부터 받습니다",
          "text": "미국 에어택시 회사 조비는 2026년 11월, 항공기 설계가 안전 기준에 맞는지 확인하는 형식인증의 마지막 단계에서 시험을 진행했습니다.",
          "note": "형식인증: 항공기 설계가 안전 기준에 맞는지 확인하는 절차"
        }
      ],
      "image": "airtaxi",
      "axes": [
        [
          "항공기",
          "전기로 수직 이착륙"
        ],
        [
          "서비스",
          "승객을 실어 나르는 운항"
        ]
      ],
      "officialPoster": "airtaxi",
      "video": {
        "provider": "youtube",
        "id": "3lNqhUZU7Bo",
        "url": "https://www.youtube.com/watch?v=3lNqhUZU7Bo",
        "label": "공식 에어택시 실증 영상",
        "buttonLabel": "실증 영상",
        "panelTitle": "승객 운송을 준비하는 시험 비행",
        "title": "상하이에서 뜨고 내리는 이항 EH216-S",
        "publisher": "EHang · 공식 채널",
        "contextLabel": "중국 상하이 · 2025년 공개 사례",
        "watchFor": "항공기가 수직으로 뜨고 이동한 뒤 착륙하는 과정을 보세요. 여러 회전날개로 사람을 태울 항공기를 띄웁니다.",
        "note": "2025년 상하이 룽화 공항에서 공개한 시험 비행입니다.",
        "stage": {
          "key": "trial",
          "label": "실증 · 시험 운영",
          "detail": "실증 단계입니다. 실제 도심 환경에서 비행하며 승객 운송 서비스를 준비합니다.",
          "sourceLabel": "EHang 공식 실증 발표",
          "sourceUrl": "https://ir.ehang.com/news-releases/news-release-details/ehangs-eh216-s-pilotless-evtol-completes-debut-flight-downtown/"
        }
      },
      "kicker": "04 / 물건에서 사람까지",
      "footer": "미국 연방항공청 · 유럽항공안전청 · 조비",
      "sourceLabel": "미국 연방항공청",
      "read": [
        "이런 항공기를 eVTOL이라고 합니다. 중국 회사 이항이 만든 기체는 조종사 없이 승객을 태우도록 설계됐습니다. 영상은 2025년 상하이에서 진행한 실증 비행입니다. 실증: 실제 현장에서 사용 가능성을 확인하는 시험",
        "미국 에어택시 회사 조비는 2026년 11월, 항공기 설계가 안전 기준에 맞는지 확인하는 형식인증의 마지막 단계에서 시험을 진행했습니다. 형식인증: 항공기 설계가 안전 기준에 맞는지 확인하는 절차"
      ],
      "imageDisclosure": "공식 영상 미리보기 · 인증 절차 도해",
      "motion": {
        "entry": "cinema"
      },
      "question": "사람을 태우는 드론, 지금 탈 수 있을까요?",
      "check": [
        {
          "question": "르완다 혈액 배송에서 드론 기록 41분과 비교한 도로 시간은 무엇인가요?",
          "options": [
            "실제로 잰 차량 기록 30분",
            "차량이 왕복하면 120분, 바로 출발하면 60분으로 계산한 값",
            "도로와는 비교하지 않았다"
          ],
          "answer": 1,
          "review": "medical"
        },
        {
          "question": "사람을 태우는 드론은 지금 어느 단계인가요?",
          "options": [
            "상용화",
            "실증·시험",
            "연구"
          ],
          "answer": 1,
          "review": "airtaxi"
        }
      ]
    },
    {
      "id": "operations",
      "number": "20",
      "section": 4,
      "title": "운항 허가를 받아도 바로 승객을 태우지는 않습니다",
      "layout": "documents",
      "status": {
        "key": "trial",
        "label": "운영증명 취득 · 시험 운항",
        "detail": "중국 광저우·허페이에서는 운항 자격을 얻은 뒤 시험 비행과 인력 교육·보험·비상대응 절차 마련을 이어갔습니다."
      },
      "sourceIds": [
        "D07",
        "D08",
        "EHANG_SHANGHAI_VIDEO"
      ],
      "beats": [
        {
          "label": "사업자 허가",
          "headline": "2025년 3월, 두 사업자가 관광 비행 허가를 받았습니다",
          "text": "광저우·허페이의 두 사업자는 관광 비행 서비스 허가인 운영증명을 받았습니다. 허가에 정해진 장소와 조건에서 비행할 수 있습니다.",
          "note": "형식인증은 설계 안전, 운영증명은 서비스 운영 자격을 확인합니다."
        },
        {
          "label": "실제 시험 운항",
          "headline": "2026년 8월, 17개월의 시험 운항 경험을 공개했습니다",
          "text": "허가를 받은 두 장소에서 정기 시험 운항을 이어갔습니다. 실제 운항 경험을 쌓으며 승객을 받기 위한 운영 절차를 마련하는 단계입니다.",
          "note": "중국 광저우·허페이 · 이항 공식 발표"
        },
        {
          "label": "승객 서비스를 위한 작업",
          "headline": "교육·보험·비상대응 절차를 마련합니다",
          "text": "기체 제조사 이항은 비행 담당자 교육과 보험을 준비하고, 비행 구역을 조정하며 비상상황에 대처할 절차를 마련했다고 발표했습니다.",
          "note": "2026년 8월 발표에 나온 두 운항 장소의 진행 상황"
        }
      ],
      "caseData": {
        "locations": "광저우·허페이",
        "aircraft": "EH216-S",
        "records": [
          {
            "date": "2025.03.30",
            "title": "관광 비행 사업자 허가",
            "tag": "중국 광저우·허페이의 두 사업자",
            "term": "운영증명"
          },
          {
            "date": "2026.08.25",
            "months": 17,
            "title": "17개월 정기 시험 운항",
            "tag": "교육·보험·비상대응 절차 마련",
            "term": "정기 시험 운영"
          }
        ]
      },
      "video": {
        "provider": "youtube",
        "id": "3lNqhUZU7Bo",
        "url": "https://www.youtube.com/watch?v=3lNqhUZU7Bo",
        "label": "공식 에어택시 실증 영상",
        "buttonLabel": "실증 영상",
        "panelTitle": "승객 운송을 준비하는 시험 비행",
        "title": "상하이에서 뜨고 내리는 이항 EH216-S",
        "publisher": "EHang · 공식 채널",
        "contextLabel": "중국 상하이 · 2025년 공개 사례",
        "watchFor": "항공기가 수직으로 뜨고 이동한 뒤 착륙하는 과정을 보세요. 여러 회전날개로 사람을 태울 항공기를 띄웁니다.",
        "note": "2025년 상하이 룽화 공항에서 공개한 시험 비행입니다.",
        "stage": {
          "key": "trial",
          "label": "실증 · 시험 운영",
          "detail": "실증 단계입니다. 실제 도심 환경에서 비행하며 승객 운송 서비스를 준비합니다.",
          "sourceLabel": "EHang 공식 실증 발표",
          "sourceUrl": "https://ir.ehang.com/news-releases/news-release-details/ehangs-eh216-s-pilotless-evtol-completes-debut-flight-downtown/"
        }
      },
      "kicker": "05 / 현재 활용과 준비 단계",
      "footer": "이항 · 이항 · EHang",
      "sourceLabel": "이항",
      "read": [
        "광저우·허페이의 두 사업자는 관광 비행 서비스 허가인 운영증명을 받았습니다. 허가에 정해진 장소와 조건에서 비행할 수 있습니다. 형식인증은 설계 안전, 운영증명은 서비스 운영 자격을 확인합니다.",
        "허가를 받은 두 장소에서 정기 시험 운항을 이어갔습니다. 실제 운항 경험을 쌓으며 승객을 받기 위한 운영 절차를 마련하는 단계입니다. 중국 광저우·허페이 · 이항 공식 발표",
        "기체 제조사 이항은 비행 담당자 교육과 보험을 준비하고, 비행 구역을 조정하며 비상상황에 대처할 절차를 마련했다고 발표했습니다. 2026년 8월 발표에 나온 두 운항 장소의 진행 상황"
      ],
      "imageDisclosure": "설명용 도해",
      "motion": {
        "entry": "chronology"
      },
      "question": "운항 허가를 받으면 바로 승객을 태울까요?"
    },
    {
      "id": "status-map",
      "number": "21",
      "section": 4,
      "title": "드론 배송은 서비스가 됐고, 드론 건축은 실험 중입니다",
      "layout": "matrix",
      "status": {
        "key": "mixed",
        "label": "분야별 활용 현황",
        "detail": "촬영·점검·배송의 실제 사용과 승객 운송·공중 시공의 시험 사례를 비교합니다.",
        "stages": [
          "commercial",
          "operating",
          "trial",
          "research"
        ]
      },
      "sourceIds": [
        "F04",
        "D01",
        "PCL_REALITY",
        "KOMSA_3D",
        "ARMY_SRR",
        "F06",
        "D08",
        "D09",
        "F05",
        "F07",
        "F08"
      ],
      "beats": [
        {
          "label": "실제 활용",
          "headline": "촬영·점검·배송은 현장 업무와 서비스가 됐습니다",
          "text": "낚시용 드론은 제품으로 판매되고, 건설 관리와 일부 지역 배송은 서비스로 제공됩니다. 기관과 기업도 항구 기록·정찰·시설 점검에 드론을 사용합니다.",
          "note": ""
        },
        {
          "label": "새로운 활용",
          "headline": "사람을 태우거나 공중에서 재료를 쌓는 일도 시험합니다",
          "text": "에어택시는 미국에서 설계 인증 시험을, 중국에서 시험 비행을 진행했습니다. 드론 건축 연구팀은 연구실에서 재료를 쌓고 만들어진 형태를 측정했습니다.",
          "note": ""
        }
      ],
      "columns": [
        [
          "현장에서 사용",
          "제품·서비스·기관 업무",
          [
            "낚시 드론 · 제품 판매",
            "월마트 배송 · 서비스",
            "건설 관리 · 서비스",
            "항구 3D 기록 · 공공 업무",
            "소형 정찰기 · 군에서 사용",
            "변전소 점검 · 기업 업무"
          ]
        ],
        [
          "현장·항공기 시험",
          "운항 가능성과 안전성 확인",
          [
            "중국 에어택시 · 승객 운송 시험",
            "미국 에어택시 · 설계 인증 시험",
            "전력시설 · 자동 점검 시험"
          ]
        ],
        [
          "연구실에서 실험",
          "새로운 작업 방법 연구",
          [
            "거품형 재료·시멘트 쌓기",
            "쌓인 구조물의 형태 측정"
          ]
        ]
      ],
      "kicker": "05 / 현재 활용과 준비 단계",
      "footer": "SwellPro 공식 스토어 · Walmart 기업 뉴스룸 · PCL Construction",
      "sourceLabel": "SwellPro 공식 스토어",
      "read": [
        "낚시용 드론은 제품으로 판매되고, 건설 관리와 일부 지역 배송은 서비스로 제공됩니다. 기관과 기업도 항구 기록·정찰·시설 점검에 드론을 사용합니다. ",
        "에어택시는 미국에서 설계 인증 시험을, 중국에서 시험 비행을 진행했습니다. 드론 건축 연구팀은 연구실에서 재료를 쌓고 만들어진 형태를 측정했습니다. "
      ],
      "imageDisclosure": "설명용 도해",
      "motion": {
        "entry": "focus"
      },
      "question": "지금 쓰이는 드론과 아직 실험 중인 드론은 무엇일까요?"
    },
    {
      "id": "reliability",
      "number": "22",
      "section": 4,
      "title": "반복 점검에는 충전과 통신, 촬영이 모두 안정적이어야 합니다",
      "layout": "process",
      "status": {
        "key": "trial",
        "label": "현장 시험 · 개선 과제",
        "detail": "미국 전력회사 PG&E는 2022~2025년 자동 점검 드론을 시험하며 반복 사용에 필요한 개선점을 정리했습니다."
      },
      "sourceIds": [
        "F05",
        "FAA_OPERATIONS",
        "D02"
      ],
      "beats": [
        {
          "label": "반복 사용",
          "headline": "다음 비행을 준비하고 필요한 영상을 전달해야 합니다",
          "text": "점검을 마치면 충전하고, 다음 점검에서는 명령을 받아 촬영 자료를 보내야 합니다. 충전이나 연결이 끊기면 예정한 점검을 이어가기 어렵습니다.",
          "note": ""
        },
        {
          "label": "현장 시험에서 찾은 과제",
          "headline": "현장 시험에서 통신·충전·촬영 품질의 과제를 찾았습니다",
          "text": "미국 전력회사 PG&E는 2022~2025년 자동 점검 드론을 시험했습니다. 보고서는 통신 거리, 배터리·충전, 장비 안정성과 센서 성능의 개선을 권고했습니다.",
          "note": ""
        }
      ],
      "image": "dock",
      "nodes": [
        [
          "충전",
          "다음 비행 준비"
        ],
        [
          "통신",
          "명령과 영상 전달"
        ],
        [
          "현장 조건",
          "날씨·비행 구역"
        ],
        [
          "촬영 품질",
          "볼 수 있는 영상"
        ],
        [
          "담당자",
          "판단과 후속 조치"
        ]
      ],
      "kicker": "05 / 현재 활용과 준비 단계",
      "footer": "Pacific Gas and Electric Company · 미국 연방항공청 · Walmart 고객 도움말",
      "sourceLabel": "Pacific Gas and Electric Company",
      "read": [
        "점검을 마치면 충전하고, 다음 점검에서는 명령을 받아 촬영 자료를 보내야 합니다. 충전이나 연결이 끊기면 예정한 점검을 이어가기 어렵습니다. ",
        "미국 전력회사 PG&E는 2022~2025년 자동 점검 드론을 시험했습니다. 보고서는 통신 거리, 배터리·충전, 장비 안정성과 센서 성능의 개선을 권고했습니다. "
      ],
      "imageDisclosure": "원리 설명용 도해",
      "motion": {
        "entry": "focus"
      },
      "question": "점검 드론이 매일 혼자 날려면 무엇이 필요할까요?",
      "check": [
        {
          "question": "운항 허가를 받은 중국 사업자들은 그다음에 무엇을 했나요?",
          "options": [
            "곧바로 승객 서비스를 시작했다",
            "시험 운항을 하며 교육·보험·비상대응 절차를 마련했다",
            "운항을 멈추고 기체를 다시 설계했다"
          ],
          "answer": 1,
          "review": "operations"
        },
        {
          "question": "자동 점검 드론의 현장 시험에서 개선할 점으로 꼽힌 것은 무엇인가요?",
          "options": [
            "통신 거리와 배터리·충전",
            "드론의 색과 디자인",
            "조종기의 크기"
          ],
          "answer": 0,
          "review": "reliability"
        }
      ]
    },
    {
      "id": "resident-drone",
      "number": "23",
      "section": 5,
      "title": "시설에 둔 드론을 원격으로 띄워 점검합니다",
      "layout": "dock",
      "status": {
        "key": "operating",
        "label": "실제 기업 업무 · 변전소 점검",
        "detail": "엔터지는 미시시피 변전소에 드론 3대를 설치해 원격 점검에 사용한다고 발표했습니다."
      },
      "sourceIds": [
        "F06",
        "NIST_TWIN"
      ],
      "beats": [
        {
          "label": "현장 배치",
          "headline": "드론과 충전 보관함을 점검할 시설에 둡니다",
          "text": "미국 전력회사 엔터지는 2025년 11월, 미시시피 변전소에 드론 3대를 설치해 점검에 사용한다고 발표했습니다. 드론을 현장에 두고 필요할 때 띄우는 방식입니다.",
          "note": ""
        },
        {
          "label": "점검 과정",
          "headline": "담당자가 원격으로 띄우면 점검 뒤 돌아와 충전합니다",
          "text": "멀리 있는 담당자가 비행을 시작하고 영상과 온도 자료를 살핍니다. 드론은 점검을 마친 뒤 충전 보관함인 도크로 자동 복귀합니다.",
          "note": ""
        }
      ],
      "image": "dock",
      "nodes": [
        [
          "도크",
          "보관·충전"
        ],
        [
          "원격 조종",
          "담당자가 비행 시작"
        ],
        [
          "점검",
          "영상·온도 확인"
        ],
        [
          "복귀",
          "착륙·다음 충전"
        ]
      ],
      "kicker": "06 / 다음 활용을 준비하는 법",
      "footer": "미국 전력회사 엔터지 · 미국 국립표준기술연구소",
      "sourceLabel": "미국 전력회사 엔터지",
      "read": [
        "미국 전력회사 엔터지는 2025년 11월, 미시시피 변전소에 드론 3대를 설치해 점검에 사용한다고 발표했습니다. 드론을 현장에 두고 필요할 때 띄우는 방식입니다. ",
        "멀리 있는 담당자가 비행을 시작하고 영상과 온도 자료를 살핍니다. 드론은 점검을 마친 뒤 충전 보관함인 도크로 자동 복귀합니다. "
      ],
      "imageDisclosure": "원리 설명용 도해 · AI 개념 이미지",
      "motion": {
        "entry": "focus"
      },
      "question": "드론을 아예 시설에 두고 쓰면 어떻게 될까요?"
    },
    {
      "id": "aerial-work",
      "number": "24",
      "section": 5,
      "title": "드론이 재료를 쌓고 모양을 재는 건축 실험도 있습니다",
      "layout": "hero",
      "status": {
        "key": "research",
        "label": "연구 · 실험실 제작",
        "detail": "2022년 영국 임페리얼 칼리지·스위스 엠파 연구팀이 거품형 재료와 시멘트로 원통을 쌓았습니다."
      },
      "sourceIds": [
        "F07"
      ],
      "beats": [
        {
          "label": "연구실에서 한 일",
          "headline": "한 드론이 재료를 쌓고 다른 드론이 형태를 잽니다",
          "text": "2022년 영국·스위스 연구팀은 거품형 재료와 시멘트로 원통 모양의 구조물을 쌓았습니다. 측정용 드론이 모양을 재면 다음 층을 쌓는 위치를 조정합니다.",
          "note": ""
        },
        {
          "label": "앞으로의 활용",
          "headline": "높고 접근하기 어려운 곳에서 공사하는 것이 목표입니다",
          "text": "연구팀은 실험실에서 공중으로 재료를 쌓는 방법을 보여 주었습니다. 이제 만든 구조물이 충분히 튼튼한지, 실제 공사장에서도 작업할 수 있는지 확인해야 합니다.",
          "note": ""
        }
      ],
      "image": "aerial-am",
      "kicker": "06 / 다음 활용을 준비하는 법",
      "footer": "영국 임페리얼 칼리지",
      "sourceLabel": "영국·스위스 건축 연구팀",
      "read": [
        "2022년 영국·스위스 연구팀은 거품형 재료와 시멘트로 원통 모양의 구조물을 쌓았습니다. 측정용 드론이 모양을 재면 다음 층을 쌓는 위치를 조정합니다. ",
        "연구팀은 실험실에서 공중으로 재료를 쌓는 방법을 보여 주었습니다. 이제 만든 구조물이 충분히 튼튼한지, 실제 공사장에서도 작업할 수 있는지 확인해야 합니다. "
      ],
      "imageDisclosure": "AI 생성 삽화",
      "motion": {
        "entry": "cinema"
      },
      "question": "드론으로 건물을 지을 수 있을까요?"
    },
    {
      "id": "restoration",
      "number": "25",
      "section": 5,
      "title": "드론은 씨앗을 뿌리고, 숲 복원팀은 자라는 상태를 살핍니다",
      "layout": "ecology",
      "status": {
        "key": "trial",
        "label": "현장 적용·시험 · 나무 성장 조사",
        "detail": "아랍에미리트에서는 해안의 맹그로브 숲 복원에 드론으로 씨앗을 뿌리고 싹과 나무의 생존 상태를 조사합니다."
      },
      "sourceIds": [
        "F08"
      ],
      "beats": [
        {
          "label": "씨앗 뿌리기",
          "headline": "선정한 복원 구역에 씨앗을 운반해 뿌립니다",
          "text": "아랍에미리트에서는 해안에 자라는 맹그로브 나무의 씨앗을 드론으로 뿌렸습니다. 씨앗이 자랄 장소를 고르고 씨앗을 준비한 뒤, 정해진 구역으로 운반해 떨어뜨립니다.",
          "note": ""
        },
        {
          "label": "성장 조사",
          "headline": "싹이 난 곳과 살아남은 나무를 조사합니다",
          "text": "숲 복원팀은 씨앗을 뿌린 뒤 현장을 찾아 싹이 난 비율과 살아남은 나무를 확인합니다. 이 조사로 씨앗을 다시 뿌리거나 관리를 보완할 구역을 찾습니다.",
          "note": ""
        }
      ],
      "image": "mangrove",
      "nodes": [
        [
          "장소와 씨앗",
          "잘 자랄 조건 선택"
        ],
        [
          "씨앗 뿌리기",
          "드론으로 뿌리기"
        ],
        [
          "성장 조사",
          "싹과 나무의 상태 확인"
        ],
        [
          "복원 관리",
          "숲의 회복 관찰"
        ]
      ],
      "kicker": "06 / 다음 활용을 준비하는 법",
      "footer": "아랍에미리트 환경기관",
      "sourceLabel": "아랍에미리트 · 해안 숲 복원 지침",
      "read": [
        "아랍에미리트에서는 해안에 자라는 맹그로브 나무의 씨앗을 드론으로 뿌렸습니다. 씨앗이 자랄 장소를 고르고 씨앗을 준비한 뒤, 정해진 구역으로 운반해 떨어뜨립니다. ",
        "숲 복원팀은 씨앗을 뿌린 뒤 현장을 찾아 싹이 난 비율과 살아남은 나무를 확인합니다. 이 조사로 씨앗을 다시 뿌리거나 관리를 보완할 구역을 찾습니다. "
      ],
      "imageDisclosure": "원리 설명용 도해",
      "motion": {
        "entry": "focus"
      },
      "question": "드론으로 씨앗을 뿌리면 숲이 저절로 생길까요?"
    },
    {
      "id": "opportunity",
      "number": "26",
      "section": 5,
      "title": "드론이 도울 일은 우리 주변의 불편에서 찾습니다",
      "layout": "questions",
      "status": {
        "key": "principle",
        "label": "활용 아이디어 찾기",
        "detail": "접근하기 어려운 일, 반복되는 일, 결과가 필요한 사람을 연결해 봅니다."
      },
      "sourceIds": [
        "FAA_UAS",
        "USFA_PAYLOAD",
        "F05",
        "F06",
        "D04"
      ],
      "beats": [
        {
          "label": "가기 어려운 곳",
          "headline": "높거나 넓거나 멀어서 힘든 일을 떠올려 보세요",
          "text": "높은 시설의 점검, 넓은 농장의 관찰, 도로를 돌아가야 하는 병원의 배송이 예입니다. 드론이 직접 가거나 위에서 볼 수 있는 일이 출발점입니다.",
          "note": ""
        },
        {
          "label": "반복되는 일",
          "headline": "같은 장소를 자주 살펴봐야 하나요?",
          "text": "매주 같은 시설을 촬영하거나 공사장을 계속 기록하면 지난번과 비교할 수 있습니다. 얼마나 자주 필요한지에 따라 비행 횟수와 운영 방식이 달라집니다.",
          "note": ""
        },
        {
          "label": "결과를 쓸 사람",
          "headline": "사진이나 물건을 받은 사람이 할 일을 생각합니다",
          "text": "수리 담당자에게는 이상이 생긴 위치가, 공사 담당자에게는 지난주와 달라진 모습이 필요합니다. 받을 사람에게 필요한 결과를 정하면 촬영할 내용도 분명해집니다.",
          "note": ""
        }
      ],
      "kicker": "06 / 다음 활용을 준비하는 법",
      "footer": "미국 연방항공청 · 미국 소방청 · Pacific Gas and Electric Company",
      "sourceLabel": "미국 연방항공청",
      "read": [
        "높은 시설의 점검, 넓은 농장의 관찰, 도로를 돌아가야 하는 병원의 배송이 예입니다. 드론이 직접 가거나 위에서 볼 수 있는 일이 출발점입니다. ",
        "매주 같은 시설을 촬영하거나 공사장을 계속 기록하면 지난번과 비교할 수 있습니다. 얼마나 자주 필요한지에 따라 비행 횟수와 운영 방식이 달라집니다. ",
        "수리 담당자에게는 이상이 생긴 위치가, 공사 담당자에게는 지난주와 달라진 모습이 필요합니다. 받을 사람에게 필요한 결과를 정하면 촬영할 내용도 분명해집니다. "
      ],
      "imageDisclosure": "설명용 도해",
      "motion": {
        "entry": "focus"
      },
      "question": "내 주변에서 드론이 도울 일은 어떻게 찾을까요?"
    },
    {
      "id": "workshop",
      "number": "27",
      "section": 5,
      "title": "아는 장소 하나에 드론을 어떻게 쓸지 적어보세요",
      "layout": "workshop",
      "status": {
        "key": "exercise",
        "label": "참여 활동",
        "detail": "섬 마을·농장·공사 현장 중 한 곳을 골라 활용 아이디어를 만들어 봅니다."
      },
      "sourceIds": [
        "D03",
        "MAFF_SPRAY",
        "PCL_REALITY",
        "FAA_OPERATIONS",
        "USGS_QA"
      ],
      "beats": [
        {
          "label": "활용 아이디어",
          "headline": "누구의 어떤 일을 도울까요?",
          "text": "예를 들어 공사 담당자는 지난주와 달라진 곳을 알고 싶습니다. 드론으로 같은 위치를 반복 촬영해 날짜별 사진을 전달하는 방법을 생각할 수 있습니다.",
          "note": ""
        },
        {
          "label": "첫 확인 항목",
          "headline": "비슷한 사례를 고르고 필요한 조건을 살핍니다",
          "text": "사진 비교에는 촬영 위치, 배송에는 짐의 무게와 받을 장소가 중요합니다. 자신의 아이디어에 맞는 조건 하나를 골라 적어보세요.",
          "note": "기획 메모에서 작성하고 파일로 저장할 수 있습니다."
        }
      ],
      "images": [
        "harbor",
        "agriculture",
        "construction-after"
      ],
      "labels": [
        "섬 마을",
        "농장",
        "공사 현장"
      ],
      "kicker": "06 / 다음 활용을 준비하는 법",
      "footer": "국토교통부 · 일본 농림수산성 · PCL Construction",
      "sourceLabel": "국토교통부",
      "read": [
        "예를 들어 공사 담당자는 지난주와 달라진 곳을 알고 싶습니다. 드론으로 같은 위치를 반복 촬영해 날짜별 사진을 전달하는 방법을 생각할 수 있습니다. ",
        "사진 비교에는 촬영 위치, 배송에는 짐의 무게와 받을 장소가 중요합니다. 자신의 아이디어에 맞는 조건 하나를 골라 적어보세요. 기획 메모에서 작성하고 파일로 저장할 수 있습니다."
      ],
      "imageDisclosure": "AI 생성 삽화",
      "motion": {
        "entry": "assembly"
      },
      "question": "내가 아는 장소에서는 드론을 어디에 쓸 수 있을까요?"
    },
    {
      "id": "closing",
      "number": "28",
      "section": 5,
      "title": "높고 넓고 먼 곳의 일을 드론이 돕습니다",
      "layout": "mosaic",
      "status": {
        "key": "mixed",
        "label": "핵심 정리",
        "detail": "촬영·점검·운반·작업의 실제 사례를 자신의 관심 분야와 연결해 보세요.",
        "stages": [
          "commercial",
          "operating",
          "trial",
          "research"
        ]
      },
      "sourceIds": [
        "ONR_INSPECTION",
        "F04",
        "D01",
        "F01",
        "F02",
        "FAA_UAS",
        "MAFF_SPRAY",
        "F06",
        "D08",
        "F07"
      ],
      "beats": [
        {
          "label": "활용이 넓은 이유",
          "headline": "싣는 장비를 바꾸면 드론이 할 일도 달라집니다",
          "text": "카메라·센서·화물·작업 도구를 바꾸면 할 일도 달라집니다. 촬영·농업·점검·공연과 일부 지역의 배송은 이미 실제 업무와 서비스로 쓰입니다.",
          "note": ""
        },
        {
          "label": "앞으로 넓어질 일",
          "headline": "사람을 나르고 건축하는 일까지 시험하고 있습니다",
          "text": "시설 원격 점검은 이미 업무에 쓰입니다. 승객 운송은 안전 인증과 시험 비행을, 드론 건축은 연구실 실험을 진행하고 있습니다.",
          "note": "관심 있는 현장을 배우면 드론이 도울 일이 보입니다."
        }
      ],
      "images": [
        "inspection",
        "agriculture",
        "delivery",
        "lightshow"
      ],
      "labels": [
        "시설 점검",
        "농약 살포",
        "생활 물품 배송",
        "드론라이트쇼"
      ],
      "futureImages": [
        "airtaxi",
        "aerial-am"
      ],
      "futureLabels": [
        "승객 운송 · 인증 시험과 실증 비행",
        "드론 건축 · 연구실 실험"
      ],
      "kicker": "06 / 다음 활용을 준비하는 법",
      "footer": "영국 원자력규제청 · SwellPro 공식 스토어 · Walmart 기업 뉴스룸",
      "sourceLabel": "영국 원자력규제청",
      "read": [
        "카메라·센서·화물·작업 도구를 바꾸면 할 일도 달라집니다. 촬영·농업·점검·공연과 일부 지역의 배송은 이미 실제 업무와 서비스로 쓰입니다. ",
        "시설 원격 점검은 이미 업무에 쓰입니다. 승객 운송은 안전 인증과 시험 비행을, 드론 건축은 연구실 실험을 진행하고 있습니다. 관심 있는 현장을 배우면 드론이 도울 일이 보입니다."
      ],
      "imageDisclosure": "AI 생성 삽화",
      "motion": {
        "entry": "assembly"
      },
      "question": "지금 드론이 하는 일과 앞으로 할 일은 어떻게 다를까요?",
      "check": [
        {
          "question": "드론으로 재료를 쌓는 건축은 지금 어느 단계인가요?",
          "options": [
            "상용화",
            "업무 활용",
            "연구"
          ],
          "answer": 2,
          "review": "aerial-work"
        },
        {
          "question": "드론으로 씨앗을 뿌린 뒤 복원팀은 무엇을 하나요?",
          "options": [
            "싹이 난 곳과 살아남은 나무를 조사한다",
            "드론을 숲에 남겨 둔다",
            "더 할 일이 없다"
          ],
          "answer": 0,
          "review": "restoration"
        }
      ]
    },
    {
      "id": "glossary-flight",
      "title": "용어사전 · 비행과 장비",
      "sourceIds": [
        "FAA_UAS",
        "USFA_PAYLOAD",
        "F03",
        "F05",
        "F06",
        "REDBULL_FPV"
      ],
      "terms": [
        [
          "FPV",
          "드론 카메라가 보내는 화면을 보며 조종하는 방식입니다. 선수를 따라가는 촬영과 드론 레이싱에 쓰입니다."
        ],
        [
          "탑재 장비",
          "드론에 싣는 장비입니다. 카메라·센서·배송 상자·살포 장치처럼 할 일에 따라 달라집니다."
        ],
        [
          "군집 비행",
          "여러 드론을 함께 움직이는 비행입니다. 드론쇼에서는 미리 설계한 위치와 색으로 그림을 만듭니다."
        ],
        [
          "도크",
          "드론이 머무르고 착륙·충전하는 보관 시설입니다. 현장에 배치해 반복 비행을 준비합니다."
        ],
        [
          "원격 조종 · 자율비행",
          "원격 조종은 사람이 조종기로 드론의 움직임을 지시하는 방식입니다. 자율비행은 드론이 센서로 주변을 파악하고 이동 경로 등을 스스로 결정하는 방식입니다."
        ],
        [
          "비가시권 비행 · BVLOS",
          "조종사가 드론을 직접 눈으로 볼 수 있는 범위 밖에서 하는 비행입니다. 먼 곳의 시설을 점검하거나 물건을 배송할 때 쓰입니다."
        ]
      ],
      "number": "29",
      "section": 6,
      "layout": "glossary",
      "status": {
        "key": "principle",
        "label": "용어사전",
        "detail": "강의에서 쓰인 말을 쉬운 설명으로 다시 살펴보세요."
      },
      "beats": [
        {
          "label": "용어와 뜻",
          "headline": "용어사전 · 비행과 장비",
          "text": "낯선 말을 다시 확인해 보세요.",
          "note": ""
        }
      ],
      "kicker": "07 / 용어사전",
      "footer": "미국 연방항공청 · 미국 소방청 · 인텔",
      "sourceLabel": "미국 연방항공청",
      "read": [
        "낯선 말을 다시 확인해 보세요. "
      ],
      "imageDisclosure": "설명용 도해",
      "motion": {
        "entry": "focus"
      }
    },
    {
      "id": "glossary-space",
      "title": "용어사전 · 지도와 입체 모델",
      "sourceIds": [
        "NPS_SFM",
        "USGS_QA",
        "NIST_TWIN"
      ],
      "terms": [
        [
          "매핑",
          "사진과 위치 정보를 모아 지도로 만드는 작업입니다. 공사장이나 농장을 한눈에 보는 데 쓰입니다."
        ],
        [
          "정사영상",
          "사진에서 기울어지거나 늘어나 보이는 부분을 바로잡아 위에서 본 지도처럼 만든 사진입니다. 건물과 도로의 위치를 함께 살펴봅니다."
        ],
        [
          "사진측량 · SfM",
          "사진측량은 사진으로 위치와 크기를 재는 기술입니다. SfM은 그 과정에서 쓰는 계산법입니다. 여러 사진의 같은 모서리를 찾아 촬영 위치와 입체 형태를 알아냅니다."
        ],
        [
          "3D 모델링",
          "물체나 공간의 형태를 입체 자료로 만드는 일입니다. 사진으로 복원한 건물을 화면에서 돌려볼 수 있습니다."
        ],
        [
          "측량 · 기준점 · 검사점",
          "측량은 위치·높이·거리를 재는 일입니다. 위치를 정확히 아는 점 중, 사진 지도를 맞출 때 쓰는 점이 기준점이고 완성된 지도의 오차를 확인하는 점이 검사점입니다."
        ],
        [
          "디지털 트윈",
          "현실의 시설이나 장비를 컴퓨터 안에 옮기고, 실제 변화에 맞춰 정보를 갱신하는 모델입니다. 현재 상태를 살피는 데 씁니다."
        ]
      ],
      "photoMethod": [
        "같은 모서리 찾기",
        "촬영 위치 계산",
        "입체 형태 계산"
      ],
      "number": "30",
      "section": 6,
      "layout": "glossary",
      "status": {
        "key": "principle",
        "label": "용어사전",
        "detail": "강의에서 쓰인 말을 쉬운 설명으로 다시 살펴보세요."
      },
      "beats": [
        {
          "label": "용어와 뜻",
          "headline": "용어사전 · 지도와 입체 모델",
          "text": "낯선 말을 다시 확인해 보세요.",
          "note": ""
        }
      ],
      "kicker": "07 / 용어사전",
      "footer": "미국 국립공원관리청 · 미국 지질조사국 · 미국 국립표준기술연구소",
      "sourceLabel": "미국 국립공원관리청",
      "read": [
        "낯선 말을 다시 확인해 보세요. "
      ],
      "imageDisclosure": "설명용 도해",
      "motion": {
        "entry": "focus"
      }
    },
    {
      "id": "glossary-reading",
      "title": "용어사전 · 센서와 숫자 읽기",
      "sourceIds": [
        "DJI_MULTISPECTRAL",
        "USFA_PAYLOAD",
        "D04",
        "MAFF_SPRAY",
        "F06",
        "NIST_CONFIDENCE"
      ],
      "terms": [
        [
          "RGB 카메라",
          "빨강·초록·파랑 빛을 이용해 우리가 보는 것과 비슷한 색 사진을 만드는 일반 카메라입니다."
        ],
        [
          "다중분광 센서",
          "눈에 보이는 빛과 보이지 않는 빛을 여러 종류로 나누어 측정합니다. 작물이 반사하는 빛을 비교해 상태가 달라 보이는 구역을 찾습니다."
        ],
        [
          "열화상",
          "온도 차이를 색으로 보여 주는 영상입니다. 설비에서 유난히 뜨거운 부분을 찾는 데 쓰입니다."
        ],
        [
          "헥타르 · ha",
          "넓이를 나타내는 단위입니다. 1ha는 1만 m²로, 가로·세로가 각각 100m인 땅의 넓이입니다."
        ],
        [
          "평균 · 중앙값",
          "평균은 모두 더해 개수로 나눈 값입니다. 중앙값은 작은 순서로 놓았을 때 가운데 값입니다. 같은 자료에서도 둘은 달라질 수 있습니다."
        ],
        [
          "95% 신뢰구간",
          "전체 평균을 추정한 범위입니다. 같은 방법으로 조사를 반복하면, 만든 구간 중 약 95%가 전체 평균을 포함하도록 계산합니다."
        ]
      ],
      "confidence": {
        "mean": 49.6,
        "low": 49.1,
        "high": 50.2,
        "unit": "분",
        "caption": "의료 배송 평균 49.6분 · 평균의 추정 범위 49.1~50.2분",
        "note": "개별 배송에 걸린 시간은 각각 다릅니다."
      },
      "number": "31",
      "section": 6,
      "layout": "glossary",
      "status": {
        "key": "principle",
        "label": "용어사전",
        "detail": "강의에서 쓰인 말을 쉬운 설명으로 다시 살펴보세요."
      },
      "beats": [
        {
          "label": "용어와 뜻",
          "headline": "용어사전 · 센서와 숫자 읽기",
          "text": "낯선 말을 다시 확인해 보세요.",
          "note": ""
        }
      ],
      "kicker": "07 / 용어사전",
      "footer": "DJI Enterprise · 미국 소방청 · The Lancet Global Health",
      "sourceLabel": "DJI Enterprise",
      "read": [
        "낯선 말을 다시 확인해 보세요. "
      ],
      "imageDisclosure": "설명용 도해",
      "motion": {
        "entry": "focus"
      }
    },
    {
      "id": "glossary-status",
      "title": "용어사전 · 활용 단계와 에어택시",
      "sourceIds": [
        "F04",
        "D01",
        "F06",
        "F05",
        "F07",
        "D05",
        "D06",
        "D07",
        "D09"
      ],
      "terms": [
        [
          "상용화",
          "고객이 제품을 사거나 서비스를 주문할 수 있는 상태입니다. 판매하는 낚시 드론과 주문받는 배송 서비스가 예입니다."
        ],
        [
          "업무 활용",
          "기관이나 기업이 실제 일에 사용하는 상태입니다. 판매 제품이나 상용 서비스를 도입해 변전소 점검·항구 기록에 쓰는 경우도 여기에 포함됩니다."
        ],
        [
          "실증",
          "실제 현장에서 써 볼 수 있는지 시험하는 과정입니다. 자동 점검 드론에서는 비행·충전·통신·영상 품질을 함께 확인합니다."
        ],
        [
          "연구",
          "새 원리나 기능을 실험으로 확인하는 단계입니다. 드론으로 거품형 재료와 시멘트를 층층이 쌓은 연구실 실험이 예입니다."
        ],
        [
          "eVTOL · 에어택시",
          "eVTOL은 전기로 수직으로 뜨고 내리는 항공기입니다. 에어택시는 항공기로 승객을 실어 나르는 서비스입니다."
        ],
        [
          "형식인증 · 운영증명",
          "형식인증은 항공기 설계가 안전 기준에 맞는지 확인하는 절차입니다. 운영증명은 사업자가 정해진 범위에서 비행 서비스를 운영할 자격을 확인합니다."
        ]
      ],
      "number": "32",
      "section": 6,
      "layout": "glossary",
      "status": {
        "key": "principle",
        "label": "용어사전",
        "detail": "강의에서 쓰인 말을 쉬운 설명으로 다시 살펴보세요."
      },
      "beats": [
        {
          "label": "용어와 뜻",
          "headline": "용어사전 · 활용 단계와 에어택시",
          "text": "낯선 말을 다시 확인해 보세요.",
          "note": ""
        }
      ],
      "kicker": "07 / 용어사전",
      "footer": "SwellPro 공식 스토어 · Walmart 기업 뉴스룸 · 미국 전력회사 엔터지",
      "sourceLabel": "SwellPro 공식 스토어",
      "read": [
        "낯선 말을 다시 확인해 보세요. "
      ],
      "imageDisclosure": "설명용 도해",
      "motion": {
        "entry": "focus"
      }
    }
  ],
  "geometry": {
    "viewBox": "0 0 1672 941",
    "land": "M0 0H540V450H1228V125H1288V496L1228 534H540V870L477 914L320 875L130 826L0 727Z",
    "road": "M145 0L140 784Q155 845 485 864M492 20V839M540 480H1258V128",
    "roofs": [
      [
        183,
        115,
        254,
        106
      ],
      [
        180,
        258,
        257,
        108
      ],
      [
        182,
        404,
        255,
        109
      ],
      [
        181,
        541,
        254,
        110
      ],
      [
        183,
        676,
        252,
        102
      ]
    ],
    "anchor": [
      541,
      454
    ],
    "grid": {
      "columns": 20,
      "rows": 12,
      "spacing": 83.6,
      "width": 1672,
      "height": 941,
      "pointColumns": 6,
      "pointRows": 3
    },
    "lightshow": {
      "count": 72,
      "startX": 80,
      "gap": 14,
      "baseline": 250,
      "amplitudes": [
        150,
        70
      ],
      "scatterX": 97,
      "scatterY": 61,
      "scatterWidth": 1000,
      "scatterHeight": 400,
      "viewBox": "0 0 1160 500",
      "bird": [
        [
          85,
          155
        ],
        [
          180,
          140
        ],
        [
          280,
          160
        ],
        [
          375,
          220
        ],
        [
          450,
          275
        ],
        [
          500,
          230
        ],
        [
          560,
          185
        ],
        [
          620,
          168
        ],
        [
          675,
          178
        ],
        [
          700,
          198
        ],
        [
          750,
          215
        ],
        [
          705,
          225
        ],
        [
          675,
          230
        ],
        [
          640,
          260
        ],
        [
          600,
          305
        ],
        [
          555,
          335
        ],
        [
          515,
          345
        ],
        [
          435,
          408
        ],
        [
          460,
          350
        ],
        [
          400,
          325
        ],
        [
          340,
          295
        ],
        [
          260,
          265
        ],
        [
          185,
          230
        ],
        [
          130,
          190
        ],
        [
          85,
          155
        ]
      ],
      "feathers": [
        [
          [
            150,
            170
          ],
          [
            300,
            210
          ],
          [
            430,
            295
          ]
        ],
        [
          [
            210,
            210
          ],
          [
            335,
            250
          ],
          [
            430,
            295
          ]
        ],
        [
          [
            280,
            252
          ],
          [
            380,
            295
          ],
          [
            470,
            320
          ]
        ],
        [
          [
            505,
            305
          ],
          [
            560,
            240
          ],
          [
            620,
            210
          ]
        ]
      ],
      "samplesPerEdge": 9
    },
    "survey": {
      "centers": [
        280,
        850
      ],
      "centerY": 250,
      "radii": [
        160,
        100,
        40
      ],
      "crossRadius": 185,
      "columns": 4,
      "rows": 3,
      "gap": 20,
      "offsetX": 30,
      "offsetY": 20,
      "shiftX": 95,
      "shiftY": -75,
      "viewBox": "0 0 1160 550",
      "control": [
        [
          183,
          115
        ],
        [
          435,
          778
        ],
        [
          1230,
          454
        ]
      ],
      "check": [
        437,
        404
      ]
    },
    "photoTiles": [
      {
        "x": 0,
        "y": 0,
        "w": 760,
        "h": 941,
        "dx": -20,
        "dy": 80,
        "angle": -3
      },
      {
        "x": 470,
        "y": 0,
        "w": 760,
        "h": 941,
        "dx": 68,
        "dy": 30,
        "angle": 0
      },
      {
        "x": 940,
        "y": 0,
        "w": 732,
        "h": 941,
        "dx": 115,
        "dy": 80,
        "angle": 3
      }
    ],
    "photoMatches": [
      {
        "x": 541,
        "y": 454,
        "label": "안쪽 모서리",
        "kind": "inner"
      },
      {
        "x": 1100,
        "y": 454,
        "label": "부두 가장자리",
        "kind": "outer"
      }
    ]
  }
};
