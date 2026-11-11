"use strict";
/* Pure panel markup. State, focus and media lifetimes belong to their controllers. */
window.DRONE_PANEL_VIEWS=(()=>{
  const {esc,stageExplanation}=window.DRONE_UTILS;
  const list=items=>'<ul>'+items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
  const section=(title,body)=>'<section class="read-section"><h3>'+esc(title)+'</h3>'+body+'</section>';
  function readingDetails(s){
    const parts=[];
    if(s.confidence)parts.push(section('의료 배송 연구의 숫자',`<p>${esc(s.confidence.caption)}</p><p>${esc(s.confidence.note)}</p>`));
    if(s.photoMethod)parts.push(section('사진에서 입체 형태를 얻는 순서',list(s.photoMethod)));
    if(s.futureLabels)parts.push(section('앞으로 넓어질 일',list(s.futureLabels)));
    if(s.labels)parts.push(section('장면의 항목',list(s.labels)));
    if(s.nodes)parts.push(section('구성·흐름',list(s.nodes.map(n=>n.join(' — ')))));
    if(s.items)parts.push(section('역할 비교',list(s.items.map(n=>(s.layout==='quadrants'?n.slice(0,2):n).join(' — ')))));
    if(s.terms)parts.push(...s.terms.map(([term,meaning])=>section(term,`<p>${esc(meaning)}</p>`)));
    if(s.metric)parts.push(section('화면의 수치',`<p>${esc(s.metric)} ${esc(s.unit)}</p><p>${esc(s.metricNote)}</p>`));
    if(s.metrics)parts.push(section('화면의 수치',list(s.metrics.map(n=>n.join(' ')))+`<p>${esc(s.metricNote)}</p>`));
    if(s.columns)for(const c of s.columns)parts.push(section(c[0]+' · '+c[1],list(c[2])));
    if(s.layout==='medical'){
      const v=window.DRONE_CASE_CONTENT.medical(s.caseData);
      parts.push(section(v.observedTitle,`<p>${v.mean} · ${v.observedNote}</p><p>${v.confidence}</p>`));
      for(const c of v.scenarios)parts.push(section(c.title,`<p>드론 배송 ${c.droneText} · ${esc(c.label)} ${c.roadText}</p><p>${esc(c.caption)}</p><p>${esc(c.differenceLabel)} ${c.deltaText}${esc(c.reference)}</p>`));
    }
    if(s.layout==='documents')for(const r of window.DRONE_CASE_CONTENT.documents(s.caseData).records)parts.push(section(r.date+' · '+r.title,`<p>${esc(r.term)}</p><p>${esc(r.body)}</p><p>${esc(r.tag)}</p>`));
    if(s.axes)parts.push(section('항공기와 서비스',list(s.axes.map(x=>x.join(' — ')))));
    if(s.diagramLabels)parts.push(section('그림의 설명',list(s.diagramLabels)));
    return parts.join('');
  }
  function reading(s){
    if(s.terms)return readingDetails(s)+`<button type="button" id="readingSources">이 장의 근거 보기</button>`;
    const beats=s.caseData?window.DRONE_CASE_CONTENT.project(s).beats:s.beats;
    return stageExplanation(s.status)+beats.map((b,i)=>section((i+1)+'. '+b.label,`<p><strong>${esc(b.headline)}</strong></p><p>${esc(b.text)}</p><p class="source-boundary">${esc(b.note)}</p>`)).join('')+readingDetails(s)+`<p class="source-meta">${esc(s.imageDisclosure)}</p><button type="button" id="readingSources">이 장의 근거 보기</button>`;
  }
  function evidence(s,data){
    return stageExplanation(s.status)+s.sourceIds.map(id=>{
      const r=data.sources[id];
      const link=(url,label)=>`<a class="source-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label} · 새 탭</a>`;
      return `<article><p class="source-meta">${esc(r.org+' · '+(r.readerDate||r.date))}</p><h3>${esc(r.readerTitle||r.title)}</h3><p>${esc(r.claim)}</p><p class="source-boundary">${esc(r.scope)}</p>${r.locator?`<p class="source-meta">원문 위치 · ${esc(r.locator)}</p>`:''}<div class="source-actions">${link(r.url,'원문 열기')}${r.secondary?link(r.secondary,'보조 원문'):''}${r.video&&r.video.url!==r.url&&r.video.url!==r.secondary?link(r.video.url,esc(r.video.label)):''}</div></article>`;
    }).join('')+`<p class="source-meta">이 장의 그림 · ${esc(s.imageDisclosure)}</p>`;
  }
  function contents(s,data,current){
    return data.sections.map((name,n)=>`<section><h3 class="toc-section">${esc(name)}</h3><div class="toc-grid">${data.slides.flatMap((slide,i)=>slide.section===n?[`<button class="contents-item" type="button" data-scene="${i}" ${i===current?'aria-current="page"':''}>${esc(slide.number+'. '+slide.title)}<span>${esc(slide.status.label)}</span></button>`]:[]).join('')}</div></section>`).join('');
  }
  function legend(s,data){
    const definitions=[['상용화','고객이 제품을 구매하거나 서비스를 이용합니다. 낚시 드론 판매와 일부 지역의 주문 배송이 예입니다.'],['업무 활용','기관이나 기업이 실제 일에 사용합니다. 판매 중인 제품이나 서비스를 도입해 쓰는 경우도 포함됩니다.'],['실증·시험','현장에서 쓸 수 있는지 조건을 정해 시험합니다. 비행·충전·통신·촬영 품질 등을 확인합니다.'],['연구','새로운 원리나 기능을 실험으로 확인합니다. 드론으로 재료를 쌓은 실험이 예입니다.'],['활용 원리·정리','앞으로 볼 사례를 이해할 기본 개념이나 여러 사례의 공통점을 설명합니다.']];
    return `<div class="legend-list">${definitions.map(([k,v])=>`<p><strong>${k}</strong>${v}</p>`).join('')}</div><p class="source-meta">각 장 오른쪽 위 눈금에서 해당 단계가 켜집니다. 단계는 소개한 현장과 발표 시점을 기준으로 합니다.</p><p class="source-meta">${esc(data.imagePolicy)}</p>`;
  }
  return {reading,readingDetails,evidence,contents,legend};
})();
