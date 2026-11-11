"use strict";
window.DRONE_VIDEO_PANEL=(()=>{
  const {esc}=window.DRONE_UTILS;
  function mount(body,s,{close,showEvidence,record}){
    const v=s.video,level=v.stage||s.status;
    body.innerHTML=`<div class="video-layout"><div><div class="video-frame" id="videoFrame"></div><p class="video-status" id="videoStatus" role="status" aria-live="polite">영상을 준비합니다.</p></div><section class="video-details"><p class="source-meta">${esc(v.publisher)} · ${esc(v.contextLabel||'실제 활용')}${v.durationLabel?' · '+esc(v.durationLabel):''}</p><h3>${esc(v.title)}</h3><div class="stage-explanation video-stage" data-stage="${esc(level.key)}"><p><strong>영상의 단계 · ${esc(level.label)}</strong></p><p>${esc(level.detail)}</p>${level.sourceUrl?`<div class="source-actions"><a class="source-link" href="${esc(level.sourceUrl)}" target="_blank" rel="noopener noreferrer">활용 상태의 출처 · 새 탭</a></div>`:''}</div><div class="video-context" id="videoContext"><p class="video-observation"><strong>영상에서 볼 내용</strong> ${esc(v.watchFor)}</p><p class="source-boundary">${esc(v.note)}</p></div><div class="source-actions"><button type="button" id="reflectVideo" aria-pressed="false">멈추고 설명 읽기</button><button type="button" id="videoSources">이 장의 근거 보기</button></div><div class="source-actions"><button type="button" id="reloadVideo">다시 불러오기</button><a class="source-link" href="${esc(v.url)}" target="_blank" rel="noopener noreferrer">공식 원본 · 새 탭</a></div><button type="button" id="backFromVideo">영상 닫고 ${Number(s.number)}장으로</button><p class="source-meta">재생 버튼을 눌러 시작하세요. 창을 닫으면 영상도 멈춥니다.</p></section></div>`;
    let player=null,reflecting=false,disposed=false;
    const dispose=()=>{player?.setActive(false);player?.destroy();player=null;};
    const load=()=>{dispose();player=window.GestaltVideo.createVideo({record:v,container:body.querySelector('#videoFrame'),status:body.querySelector('#videoStatus')});player.mount();if(document.hidden||reflecting)player.setActive(false);};
    body.querySelector('#reloadVideo').addEventListener('click',load);
    body.querySelector('#backFromVideo').addEventListener('click',close);
    body.querySelector('#videoSources').addEventListener('click',showEvidence);
    body.querySelector('#reflectVideo').addEventListener('click',e=>{
      reflecting=!reflecting;e.currentTarget.setAttribute('aria-pressed',String(reflecting));e.currentTarget.textContent=reflecting?'영상으로 돌아가기':'멈추고 설명 읽기';
      player?.setActive(!reflecting&&!document.hidden);body.querySelector('#videoContext').classList.toggle('is-reflecting',reflecting);record('video.reflection',{active:reflecting,slide:s.id});
    });
    const visibility=()=>{if(!disposed)player?.setActive(!document.hidden&&!reflecting);};
    document.addEventListener('visibilitychange',visibility);load();
    return ()=>{disposed=true;dispose();document.removeEventListener('visibilitychange',visibility);};
  }
  return {mount};
})();
