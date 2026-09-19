import {KINDS} from './graph-model.mjs';
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Prose punctuation follows the owner's reading rhythm; machine URLs are untouched.
const prose=s=>esc(s).replace(/([,.!?])\s+(?=\S)/g,'$1<br>');
const outbound=(url,label)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} <span aria-hidden="true">↗</span></a>`;
export function renderReader(root,n,near) {
  root.innerHTML=`<div class="reader-eyebrow">${esc(n.sourceLabel||KINDS[n.kind])}</div><h2 data-typography-break="approved" id="reader-title" tabindex="-1">${prose(n.title)}</h2>${n.image?`<img class="reader-image" src="${esc(n.image)}" alt="${esc(n.alt||n.title)}" width="960" height="540" decoding="async">`:''}<p>${prose(n.summary)}</p>${(n.sections||[]).filter(s=>s.text!==n.summary).map(s=>`<h3>${prose(s.title)}</h3><p>${prose(s.text)}</p>`).join('')}${n.introUrl?outbound(n.introUrl,'작품 소개 읽기'):''}${outbound(n.url,n.kind==='work'?'작품 감상하기':'출처에서 읽기')}<h3>이 별에서 이어지는 이야기</h3><div class="relations">${near.map(({node:v,edge:e})=>`<div class="relation"><button type="button" data-node="${esc(v.id)}"><strong>${prose(v.title)} <span aria-hidden="true">↗</span></strong><span>${prose(e.reason)}</span></button><a class="evidence" href="${esc(e.evidence)}" target="_blank" rel="noopener noreferrer">연결 근거 ↗</a></div>`).join('')||'<p>아직 등록된 연결이 없습니다.</p>'}</div>`;
}
export function renderLabels(root,nodes,selected) {
  root.innerHTML=nodes.map(n=>`<button type="button" class="star ${n.kind==='work'?'work':'thought'}" data-node="${esc(n.id)}" aria-pressed="${n.id===selected}" aria-label="${esc(n.title)} 선택">${n.kind==='work'&&n.image?`<img src="${esc(n.image)}" alt="" width="112" height="68" decoding="async">`:''}<strong>${prose(n.title)}</strong></button>`).join('');
  return [...root.children];
}
export function renderList(root,nodes,selected) {
  root.innerHTML=nodes.map(n=>`<button class="record" data-node="${esc(n.id)}" aria-pressed="${n.id===selected}">${n.image?`<img src="${esc(n.image)}" alt="" width="112" height="68" loading="lazy">`:''}<span><small>${esc(KINDS[n.kind])}</small><strong>${prose(n.title)}</strong><span>${prose(n.summary)}</span></span></button>`).join('')||'<p class="empty">일치하는 기록이 없습니다.<br>다른 이름이나 주제로 검색해 보세요.</p>';
}
export function renderTrail(root,ids,byId) {
  root.innerHTML=ids.map(id=>`<button class="quiet" data-node="${esc(id)}">${esc(byId.get(id).title)}</button>`).join('<span aria-hidden="true">›</span>');
}
