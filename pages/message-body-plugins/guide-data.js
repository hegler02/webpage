'use strict';
// Public download identities, verified anonymously on 2026-11-02.
window.GuideData = {
  files: [
    {id:'1LY3q7_26BFhFiChwL9BrF20norlwBFwu',bytes:724983},
    {id:'1RhyK7UvSzDX76DYAsWktmfizD6vahUsp',bytes:632659},
    {id:'1ayuycEN-cVh4rc8oTQy9nETwKUwGMLM8',bytes:671486},
    {id:'1CkWRrYDMnrbQl-mXb94Ub-W5Itldg4DH',bytes:650652},
    {id:'1zwslBs2HTpZK3KMvWC6nIFjSSWDNGTTT',bytes:8935356,kind:'skill'},
    {id:'16HepEc6P194hlfYo6W0w7Phe7561N_ip',bytes:601369},
    {id:'1AeCDvNcFQFvRx90066gdGoNHnTXMyjLx',bytes:62515}
  ],
  sources: {
    OpenAI:'https://help.openai.com/en/articles/20001256-plugins-in-chatgpt',
    Claude:'https://support.claude.com/en/articles/13837440-use-plugins-in-claude',
    skill:'https://support.claude.com/en/articles/12512180-use-skills-in-claude'
  },
  install: {
    OpenAI:[
      ['ChatGPT 웹에서 시작하세요.','사이드바의 Plugins에서 설치된 도구를 관리합니다. 파일 업로드 메뉴는 요금제와 워크스페이스 권한에 따라 다를 수 있습니다.','워크스페이스 관리자 경로','Admin console → 해당 워크스페이스 → Plugins → Add → Upload plugin'],
      ['내려받은 ZIP을 선택하세요.','Upload plugin이 제공되는 계정에서 파일을 올립니다. 도구의 이름과 설명을 확인한 다음, 설치 목록에 나타나는지 확인하세요.','메뉴가 보이지 않는다면','현재 계정·워크스페이스의 업로드 권한을 확인하세요. 일반 대화에 파일을 첨부하는 것과 플러그인 설치는 다릅니다.'],
      ['설치한 도구를 대화에 연결하세요.','새 대화에서 @멘션하거나, 입력창의 플러그인 선택 메뉴로 도구를 고릅니다. 선택한 이름을 확인하고 요청을 보냅니다.','확인할 것','다운로드 완료 → 설치 목록에 표시 → 대화에서 선택. 세 단계가 모두 이어져야 합니다.']
    ],
    Claude:[
      ['Plugins를 여세요.','Claude 웹 또는 데스크톱에서 Plugins를 엽니다. 메뉴 개편 중인 계정에서는 이전 이름인 Customize가 보일 수 있습니다.','Cowork에서 사용할 때','Cowork를 선택한 뒤 플러그인 메뉴를 여세요. 조직에서 설치를 제한했다면 관리자 권한 확인이 필요합니다.'],
      ['파일 업로드로 추가하세요.','플러그인 추가 메뉴에서 사용자 파일 업로드를 선택합니다. 내려받은 ZIP을 올리고 이름과 내용을 확인하세요.','파일 형식 오류가 나온다면','ZIP을 대화에 첨부해 설치된 것으로 판단하지 마세요. 플러그인과 스킬의 업로드 경로를 구분하고 강사에게 오류를 보여주세요.'],
      ['대화에서 도구를 선택하세요.','설치된 플러그인을 확인한 뒤, 입력창의 + 메뉴 또는 / 명령으로 사용할 스킬을 고릅니다.','다음 행동','익숙한 작은 과제로 첫 결과물을 만들어보세요. 도구가 보이지 않으면 설치 계정과 현재 대화 환경이 같은지 확인합니다.']
    ]
  },
  prompts:[
    '내가 전하고 싶은 감정을 먼저 물어봐 주세요. 답을 들은 뒤, 그 감정을 담는 짧은 노래의 후렴과 음악 방향을 함께 정해주세요.',
    '내가 전하고 싶은 메시지와 보여주고 싶은 대상을 먼저 물어봐 주세요. 답을 들은 뒤, 한 장의 이미지로 표현할 장면을 함께 설계해주세요.',
    '짧은 이야기를 네 컷 웹툰으로 만들고 싶습니다. 메시지와 인물을 먼저 물어보고, 컷 사이에서 무엇을 생략할지 함께 정해주세요.',
    '짧은 홍보영상을 만들고 싶습니다. 대상과 핵심 메시지를 먼저 물어보고, 장면의 순서와 움직임을 함께 설계해주세요.',
    '내가 설명할 주제와 청중을 먼저 물어봐 주세요. 가장 중요한 메시지를 정한 뒤, 세 장의 슬라이드 흐름을 제안해주세요.',
    '내가 소개할 작품과 독자가 할 행동을 먼저 물어봐 주세요. 그 메시지에 맞는 한 페이지의 구성을 함께 정해주세요.',
    '만들고 싶은 앱이 있습니다. 누구의 어떤 문제를 해결할지 먼저 물어보고, 내가 결정한 내용을 정리한 다음 구현 범위를 함께 정해주세요.'
  ]
};
