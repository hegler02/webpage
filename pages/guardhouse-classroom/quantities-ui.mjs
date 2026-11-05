import {buildQuantityReport} from './src/quantity-catalog.mjs';
import {quantityCSV,quantitySummaryCSV,filterQuantityRows,quantityLocations,quantityGroups,quantityStatuses} from './src/quantity-engine.mjs';

const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const number=v=>v===null?'미산출':v.toLocaleString('ko-KR',{maximumFractionDigits:3});
const pageSize=12;
export function createQuantities({host,nav,read,go,locate,workspace}){
 let report,query='',group='',scope='',page=0,target=null,openKey=null;
 const button=document.createElement('button');button.type='button';button.textContent='재료·수량';button.dataset.quantityMenu='true';
 button.onclick=()=>{target=null;go('quantities');};nav.insertBefore(button,nav.querySelector('.experience-tab'));
 const controller={
  setPage(current){button.toggleAttribute('aria-current',current==='quantities');if(current==='quantities')button.setAttribute('aria-current','page');},
  inspector(container,id){
   container.querySelector('[data-quantity-inspect]')?.remove();if(!id)return;
   const b=document.createElement('button');b.type='button';b.dataset.quantityInspect=id;b.textContent='이 대상의 재료·수량';b.onclick=()=>{target=id;query='';group='';scope='';page=0;go('quantities');};container.append(b);
  },
  render(){
   report=buildQuantityReport(read());
   host.innerHTML=`<section class="quantities" aria-label="재료·수량 명세서"><article class="card quantity-intro"><h2>설계한 공간에 무엇이 얼마나 들어갈까요?</h2><p>현재 설계의 고유 기구와 형상을 읽어 산출합니다. 전원을 끄거나 벽을 숨겨도 설치 수량은 그대로입니다. 수량 근거를 열면 같은 대상을 도면과 3D에서 찾을 수 있습니다.</p><div class="quantity-facts"><span>전기기구 <strong>${report.counts.electrical}개</strong></span><span>소방기구 <strong>${report.counts.fire}개</strong></span><span>산출 품목 <strong>${report.rows.filter(r=>r.quantity!==null).length}종</strong></span></div><div class="button-row"><button type="button" data-q-export>전체 명세서 CSV 저장</button><button type="button" data-q-export-detail>산출 근거 CSV 저장</button><button type="button" data-q-refresh>현재 설계로 다시 산출</button></div><p class="small">모형 물량과 참고 수량을 구분합니다. 미산출은 0개라는 뜻이 아닙니다. 단위가 다른 품목은 하나의 합계로 더하지 않습니다. CSV에는 검색 조건과 관계없이 전체 설계를 저장합니다.</p></article><div class="quantity-filters"><label>품목 찾기 <input type="search" data-q-search placeholder="예: 조명, 콘크리트, AL01" value="${esc(query)}"></label><label>분류 <select data-q-group><option value="">전체 분류</option>${quantityGroups.map(g=>`<option ${g===group?'selected':''}>${g}</option>`).join('')}</select></label><label>산출 범위 <select data-q-scope><option value="">모든 범위</option>${Object.entries(quantityStatuses).map(([k,v])=>`<option value="${k}" ${k===scope?'selected':''}>${v}</option>`).join('')}</select></label></div><div class="quantity-target" ${target?'':'hidden'}><span>${esc(target)}에 연결된 품목</span><button type="button" data-q-clear>모든 대상 보기</button></div><p data-q-count role="status"></p><div class="quantity-rows"></div><div class="quantity-pages"><button type="button" data-q-prev>이전 품목</button><span data-q-page></span><button type="button" data-q-next>다음 품목</button></div><details class="card quantity-exclusions"><summary>산출에서 제외한 표시 형상</summary><p>장식선·절개 표시와 조립품의 부속 조각을 개별 자재로 중복 계산하지 않습니다. 대표 철근은 참고 수량으로 따로 표시합니다.</p><ul>${[...new Set(report.excluded.map(e=>e.reason))].map(reason=>`<li>${esc(reason)}: ${report.excluded.filter(e=>e.reason===reason).length}개 형상</li>`).join('')}</ul></details></section>`;
   host.querySelector('[data-q-search]').oninput=e=>{query=e.target.value;page=0;draw();};
   host.querySelector('[data-q-group]').onchange=e=>{group=e.target.value;page=0;draw();};
   host.querySelector('[data-q-scope]').onchange=e=>{scope=e.target.value;page=0;draw();};
   host.querySelector('[data-q-clear]').onclick=()=>{target=null;controller.render();};
   host.querySelector('[data-q-refresh]').onclick=()=>controller.render();
   const save=(text,suffix)=>{const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=report.sample+'-'+suffix+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
   host.querySelector('[data-q-export]').onclick=()=>save(quantitySummaryCSV(report),'재료수량');
   host.querySelector('[data-q-export-detail]').onclick=()=>save(quantityCSV(report),'산출근거');
   host.querySelector('[data-q-prev]').onclick=()=>{page--;draw(true);};host.querySelector('[data-q-next]').onclick=()=>{page++;draw(true);};draw();
  }
 };
 function draw(scroll=false){
  const rows=filterQuantityRows(report.rows,{query,group,scope,target});
  const pages=Math.max(1,Math.ceil(rows.length/pageSize));page=Math.min(pages-1,Math.max(0,page));
  host.querySelector('[data-q-count]').textContent=rows.length+'개 품목 (미산출 '+rows.filter(r=>r.status==='missing').length+'개 포함) · 각 품목의 수량 근거를 펼쳐보세요.';
  const list=host.querySelector('.quantity-rows');list.innerHTML=rows.length?rows.slice(page*pageSize,(page+1)*pageSize).map(r=>`<details class="quantity-row card" ${r.key===openKey?'open':''}><summary><span><span class="quantity-category">${r.group} · ${quantityStatuses[r.status]}${r.partial?' · 검색 대상 소계':''}</span><strong>${esc(r.name)}</strong><span class="small">${esc(r.spec)}</span></span><strong class="quantity-value">${number(r.quantity)} ${esc(r.unit)}</strong><span class="quantity-open">수량 근거</span></summary><div class="quantity-detail"><p>${esc(r.note)}</p><label>산출 위치 <select data-q-member>${quantityLocations(r).map((m,i)=>`<option value="${i}">${esc(m.name)}${m.id?' · '+esc(m.id):''}</option>`).join('')}</select></label><p class="quantity-formula"></p><div class="button-row"><button type="button" data-q-locate>도면·3D에서 확인</button><span class="small" data-q-sheet></span></div><p role="status" data-q-error></p></div></details>`).join(''):'<article class="card"><p>연결된 산출 품목이 없습니다. 부속 조각은 조립품 단위의 명세가 필요할 수 있습니다.</p></article>';
  list.querySelectorAll('details').forEach((detail,i)=>{
   const row=rows[page*pageSize+i],members=quantityLocations(row),select=detail.querySelector('select'),locateButton=detail.querySelector('[data-q-locate]');
   detail.ontoggle=()=>{if(detail.open)openKey=row.key;};
   const update=()=>{const member=members[Number(select.value)];detail.querySelector('.quantity-formula').textContent=member.formula;detail.querySelector('[data-q-sheet]').textContent=member.sheet??'설계 정보 필요';locateButton.disabled=!member.id||!member.sheet;};select.onchange=update;update();
   locateButton.onclick=async()=>{const member=members[Number(select.value)];locateButton.disabled=true;try{const ok=await locate(member);if(ok===false)throw new Error('대상을 열지 못했습니다.');
    workspace.querySelector('[data-quantity-return]')?.remove();const bar=document.createElement('div');bar.className='quantity-return';bar.dataset.quantityReturn='true';const label=document.createElement('span');label.textContent=member.name+' · '+number(member.quantity)+' '+row.unit+'의 산출 위치';const back=document.createElement('button');back.type='button';back.textContent='재료·수량으로 돌아가기';back.onclick=()=>go('quantities');bar.append(label,back);workspace.prepend(bar);workspace.scrollIntoView({block:'start'});
   }catch(error){detail.querySelector('[data-q-error]').textContent='위치를 열지 못했습니다. 다시 시도해 주세요.';locateButton.disabled=false;}};
  });
  host.querySelector('[data-q-prev]').disabled=page===0;host.querySelector('[data-q-next]').disabled=page===pages-1;host.querySelector('[data-q-page]').textContent=(page+1)+' / '+pages;
  if(scroll)host.querySelector('.quantity-filters').scrollIntoView({block:'start'});
 }
 return controller;
}
