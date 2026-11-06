// Identifier meanings come from each sample's actual design, not inferred acronyms.
export const electricalTagId=id=>'electrical-tag-'+id;
export function electricalTagTerms(design, sheets=design){
  const {panel,circuits,devices}=design;
  const note='이 교육용 샘플에서 정한 식별표입니다. 다른 도면에서는 표기가 달라질 수 있으므로 기호 설명표(범례)와 기구의 이름·규격을 정리한 기구표를 확인합니다. 숫자는 수량이나 전압을 뜻하지 않습니다.';
  const row=(object,name,plain,detail,sheet,element=object.id)=>({id:electricalTagId(object.id),term:object.id+' · '+name,plain,definition:detail+' '+note,category:'electrical',sheet,element,locationLabel:'도면·3D에서 찾기',target:{menu:'electrical',sheet,id:element}});
  return [
    {id:'drawing-identifier',term:'도면 식별표(기구 번호·회로 번호)',category:'electrical',scope:'concept',locationNote:'특정 기구가 아닌 도면의 이름표를 읽는 공통 개념입니다.',plain:'도면과 모델에서 같은 대상을 찾기 위해 붙인 이름표',definition:'기구 번호는 개별 분전반·조명·스위치를, 회로 번호는 여러 기구가 연결되는 전기 회로를 구별합니다. 글자 모양만 보고 역할을 추측하지 않고 도면의 범례와 회로표를 함께 읽습니다.',electrical:'연결 경로의 이름표를 누르면 이 샘플에서의 뜻과 같은 대상의 도면·3D를 확인할 수 있습니다.'},
    row(panel,panel.name,'들어온 전기를 여러 회로로 나누는 분전반의 이름표',panel.id+' 표기는 '+panel.name+'을 가리킵니다. 연결 회로: '+circuits.map(c=>c.name+' 회로('+c.id+')').join(', ')+'.',sheets.circuitSheet),
    ...circuits.map(c=>row(c,c.name+' 회로','개별 기구가 아니라 전기를 나누어 보내는 회로의 이름표',c.id+' 표기는 '+c.name+' 회로를 가리킵니다. '+panel.name+'('+panel.id+')의 차단기를 거쳐 '+devices.filter(d=>d.circuit===c.id&&d.kind!=='switch').map(d=>d.name+'('+d.id+')').join(', ')+'에 전원을 공급합니다.',sheets.circuitSheet,panel.id)),
    ...devices.filter(d=>d.id!==panel.id).map(d=>{
      const c=circuits.find(c=>c.id===d.circuit),sw=devices.find(x=>x.id===d.switch);
      const relation=c?'연결 회로는 '+c.name+'('+c.id+')입니다. ':'회로 정보는 도면에서 확인합니다. ';
      const controlled=d.kind==='switch'?devices.filter(x=>x.switch===d.id&&x.id!==d.id):[];
      const operation=controlled.length?'조작 대상: '+controlled.map(x=>x.name+'('+x.id+')').join(', ')+'. 이 스위치로 연결된 기구를 켜고 끕니다.':d.switch===d.id?'기구에 달린 자체 스위치로 조작합니다.':sw?'연결 스위치는 '+sw.name+'('+sw.id+')입니다.':'';
      return row(d,d.name,'설치된 기구를 구별하는 이름표: '+d.name,d.id+' 표기에 해당하는 기구는 '+d.name+'입니다. '+relation+operation,['light','switch'].includes(d.kind)?sheets.lightingSheet:sheets.powerSheet);
    })
  ];
}
export function electricalPowerRoute(electric,device){
  const links=device.power.links;
  return [...new Set([links.panel,links.circuit,links.switch,device.id].filter(Boolean))].map(id=>{
    const circuit=electric.circuits.find(c=>c.id===id),object=electric.devices.find(d=>d.id===id)??(electric.panel?.id===id?electric.panel:null);
    return {id,name:circuit?circuit.name+' 회로':object?.name??id,term:electricalTagId(id)};
  });
}
