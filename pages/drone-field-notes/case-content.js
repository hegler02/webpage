"use strict";
window.DRONE_CASE_CONTENT = (() => {
  const beat = (label, headline, text, note='') => ({label, headline, text, note});
  function medical(m) {
    const mean = `${m.mean.value}${m.unit}`;
    const confidenceText = `평균의 추정 범위 ${m.mean.low}–${m.mean.high}${m.unit} · ${m.mean.confidence}% 신뢰구간`;
    const scenarios=m.scenarios.map(x=>({...x,roadText:`${x.road}${m.unit}`,droneText:`${m.drone}${m.unit}`,title:x.oneWay?'혈액원 차량이 바로 배달한다면':'병원 차량이 혈액원에 다녀오면',deltaText:`${x.delta}${m.unit}`}));
    return {mean,confidence:confidenceText,observedTitle:'혈액 준비부터 병원 도착까지',observedNote:'실제 드론 배송 기록의 평균',scenarios,beats:[
      beat('실제 배송 기록',`준비와 포장을 포함해 평균 ${mean} 걸렸습니다`,'르완다의 병원들은 필요한 혈액을 드론으로 받았습니다. 주문 뒤 혈액을 준비하고 포장해 병원에 도착하기까지 걸린 시간을 조사했습니다.',`${m.facilities}개 의료시설 · 2017~2019년 자료를 분석한 2022년 연구`),
      beat('기존 도로 운반과 비교',`병원 차량의 왕복보다 ${scenarios[0].deltaText} 짧았습니다`,`준비·포장 시간을 뺀 드론 배송 기록은 중앙값 ${m.drone}분입니다. 병원 차가 혈액을 공급하는 혈액원에 갔다 오는 시간은 ${scenarios[0].roadText}으로 추정됐습니다.`,'중앙값: 기록을 작은 순서로 놓았을 때 가운데 값'),
      beat('차량이 바로 출발하는 조건',`도로 편도로 계산해도 드론이 ${scenarios[1].deltaText} 짧았습니다`,`혈액원이 차를 갖추고 병원으로 바로 배달하면 도로 시간은 ${scenarios[1].roadText}으로 계산됩니다. 이 조건에서도 드론 배송 기록 ${m.drone}분이 더 짧았습니다.`,'드론: 실제 배송 기록 · 도로: 운반 방식에 따른 계산값')
    ]};
  }
  function documents(m) {
    const records=m.records.map(r=>({...r,year:Number(r.date.split('.')[0]),month:Number(r.date.split('.')[1]),body:r.months===undefined?`중국 ${m.locations}의 두 사업자가 승객용 드론(${m.aircraft})으로 관광 비행을 할 수 있는 허가를 받았습니다.`:`이항은 두 운항 장소에서 ${r.months}개월 동안 정기 시험 운항을 이어갔다고 발표했습니다.`}));
    const first=records[0],last=records[1];
    return {records,beats:[
      beat('사업자 허가',`${first.year}년 ${first.month}월, 두 사업자가 관광 비행 허가를 받았습니다`,`${m.locations}의 두 사업자는 관광 비행 서비스 허가인 운영증명을 받았습니다. 허가에 정해진 장소와 조건에서 비행할 수 있습니다.`,'형식인증은 설계 안전, 운영증명은 서비스 운영 자격을 확인합니다.'),
      beat('실제 시험 운항',`${last.year}년 ${last.month}월, ${last.months}개월의 시험 운항 경험을 공개했습니다`,'허가를 받은 두 장소에서 정기 시험 운항을 이어갔습니다. 실제 운항 경험을 쌓으며 승객을 받기 위한 운영 절차를 마련하는 단계입니다.','중국 광저우·허페이 · 이항 공식 발표'),
      beat('승객 서비스를 위한 작업','교육·보험·비상대응 절차를 마련합니다','기체 제조사 이항은 비행 담당자 교육과 보험을 준비하고, 비행 구역을 조정하며 비상상황에 대처할 절차를 마련했다고 발표했습니다.','2026년 8월 발표에 나온 두 운항 장소의 진행 상황')
    ]};
  }
  const project=slide=>slide.layout==='medical'?medical(slide.caseData):documents(slide.caseData);
  return {medical,documents,project};
})();
