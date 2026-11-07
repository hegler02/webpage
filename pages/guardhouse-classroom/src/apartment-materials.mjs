export const apartmentAssemblies=[
 {id:'exterior',name:'외기에 접하는 외벽',target:'south-2',sheet:'M-201',plain:'바깥의 비·바람·온도와 실내를 나누는 벽',layers:[
  {id:'wallpaper',name:'실내 벽지·바탕',mm:1,color:'#e9e5db',role:'눈에 보이고 손이 닿는 실내 마감입니다.'},
  {id:'rc',name:'철근콘크리트',mm:200,color:'#9ca29e',role:'힘을 지탱하는 구조체입니다. 배관 위치와 구조 부재를 함께 봅니다.'},
  {id:'wool',name:'미네랄울 단열층',mm:100,color:'#c8b485',role:'외부와의 열 전달을 줄이는 층입니다. 재료 단품과 전체 벽체의 성능을 구분합니다.'},
  {id:'render',name:'보강 바탕·외장 마감',mm:15,color:'#c7c6be',role:'비바람에 노출되는 바깥 표면입니다. 창 주변의 물 흐름과 이음도 함께 살핍니다.'}
 ]},
 {id:'interior',name:'방 사이 비내력 내벽',target:'partition-bed23-0',sheet:'M-202',plain:'실내에서 방을 나누는 벽',layers:[
  {id:'finish-a',name:'바탕·실내 마감',mm:10,color:'#eee8dd',role:'한쪽 방의 표면을 평탄하게 하고 마감합니다.'},
  {id:'block',name:'경량 기포 콘크리트 블록',mm:100,color:'#d1cbbc',role:'이 샘플에서 방을 구획하는 벽체입니다. 건물 전체를 지탱하는 구조벽과 역할이 다릅니다.'},
  {id:'finish-b',name:'바탕·실내 마감',mm:10,color:'#eee8dd',role:'반대쪽 방의 마감입니다. 스위치 박스와 배관이 놓이는 위치를 비교합니다.'}
 ]},
 {id:'wet',name:'욕실 벽·바닥 마감',target:'partition-bath-0',sheet:'M-202',plain:'물에 노출되는 곳에는 방수와 타일이 연결됩니다.',layers:[
  {id:'tile',name:'자기질 타일',mm:9,color:'#c6c6bf',role:'물에 닿는 표면입니다. 줄눈이 있다는 이유만으로 방수가 완성되는 것은 아닙니다.'},
  {id:'adhesive',name:'타일 접착 바탕',mm:5,color:'#b7b1a6',role:'타일을 바탕에 고정하는 층입니다.'},
  {id:'waterproof',name:'방수층',mm:2,color:'#547a76',role:'벽·바닥 모서리와 관통부까지 이어져 물이 바탕으로 스며드는 것을 막습니다.'},
  {id:'block',name:'벽체 바탕',mm:100,color:'#d1cbbc',role:'방수와 마감을 받치는 바탕입니다. 벽 두께는 선택한 벽체 방식에 따라 달라집니다.'}
 ]},
 {id:'floor',name:'거실·침실 바닥',target:'floor-finish-living',sheet:'M-203',plain:'마루 아래에도 완충층·난방층·구조 바닥이 있습니다.',layers:[
  {id:'wood',name:'마루 마감',mm:8,color:'#c7a77f',role:'실내에서 밟는 표면입니다. 화면에서 색과 질감을 바꿀 수 있습니다.'},
  {id:'screed',name:'난방 배관을 감싸는 모르타르',mm:52,color:'#c1bab0',role:'배관의 열을 바닥으로 전달하는 층입니다. 바닥에 고정물을 설치할 때 배관 위치를 확인해야 하는 이유를 살핍니다.'},
  {id:'floor-insulation',name:'바닥 단열층',mm:40,color:'#d8c89d',role:'열이 아래쪽으로 빠져나가는 것을 줄입니다.'},
  {id:'impact',name:'바닥 완충층',mm:20,color:'#8fa6a0',role:'충격 전달을 줄이는 층입니다. 층간소음 성능은 전체 바닥 구성과 시험 조건으로 판단합니다.'},
  {id:'slab',name:'철근콘크리트 구조 바닥판',mm:210,color:'#929c98',role:'사람과 가구의 무게를 받습니다. 구조·철근 메뉴의 같은 바닥판으로 연결됩니다.'}
 ]}
];
export const apartmentPalettes=[
 {id:'warm',name:'밝은 오크 · 웜화이트',wall:0xe9e5dc,wood:0xcab18e,cabinet:0xd8d6cd,fabric:0xbcbcb0},
 {id:'neutral',name:'내추럴 오크 · 그레이',wall:0xd8ddda,wood:0xae9677,cabinet:0xaeb7b3,fabric:0x8e9e9c},
 {id:'walnut',name:'월넛 · 아이보리',wall:0xeee6d8,wood:0x8b6549,cabinet:0xd1c5b5,fabric:0xc5a58d}
];
export const materialSources=[
 ['벽체와 내장 시스템의 역할 · Knauf','https://knauf.com/ko-KR/applications/walls'],
 ['석고보드 칸막이의 다른 구성 예 · Knauf','https://knauf.com/ko-KR/system/drywall-systems']
];
