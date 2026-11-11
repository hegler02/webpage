"use strict";
window.DRONE_CASE_SCENES = (() => {
  const {esc,img}=window.DRONE_UTILS;
  function medical(s,copy) {
    const m=s.caseData,v=window.DRONE_CASE_CONTENT.medical(m),c=v.scenarios[0];
    return `${img(s.image,'medical-photo')}<div class="medical-shade"></div><div class="medical-ground"></div>
      <div class="medical-observed"><h2>${v.observedTitle}</h2><p class="metric">${m.mean.value}<small>${esc(m.unit)}</small></p><p>${v.observedNote}</p><p class="caption">${v.confidence}</p></div>
      <div class="medical-comparison" id="medicalComparison"><h2 id="comparisonTitle">${esc(c.title)}</h2><p class="caption" id="comparisonCaption">${esc(c.caption)}</p>
      <div class="chart-row"><div class="bar-meta"><span>드론 배송</span><span>${c.droneText}</span></div><div class="bar-axis"><div class="bar-fill" id="droneBar"></div></div></div>
      <div class="chart-row"><div class="bar-meta"><span id="roadMeta">${esc(c.label)}</span><span id="roadValue">${c.roadText}</span></div><div class="bar-axis"><div class="bar-fill road-bar" id="roadBar"></div></div></div>
      <div class="axis-label" aria-hidden="true"><span>0</span><span id="axisMax"></span></div><p class="comparison-delta">${c.differenceLabel} <strong>${c.deltaText}</strong>${c.reference}</p></div>${window.DRONE_ILLUSTRATIONS.medicalRoutes()}${copy('medical-bottom')}`;
  }
  function documents(s,copy) {
    return `<div class="documents">${window.DRONE_CASE_CONTENT.documents(s.caseData).records.map((r,i)=>`<article class="document" id="${i?'docAfter':'docBefore'}"><p class="date">${esc(r.date)}</p><h2>${esc(r.title)}</h2>${i?`<p class="document-quote"><mark id="quoteMark">${esc(r.term)}</mark></p>`:''}<p class="body">${esc(r.body)}</p><p class="document-tag">${esc(r.tag)}</p></article>`).join('')}<div class="document-timeline" aria-hidden="true"><span></span><span></span><i></i></div></div>${copy('scene-band documents-band')}`;
  }
  return {medical,documents};
})();
