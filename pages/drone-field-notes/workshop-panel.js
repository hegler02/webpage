"use strict";
window.DRONE_WORKSHOP=(()=>{
  const {esc}=window.DRONE_UTILS;
  const answers={place:'섬',problem:'',user:'',proof:'',unknown:''};
  const fields=[['problem','반복해서 해결하고 싶은 일'],['user','결과를 사용하는 사람'],['proof','강의에서 참고할 실제 사례'],['unknown','먼저 확인할 것']];
  function mount(body,record){
    body.innerHTML=`<p>누구의 어떤 일을 돕고 싶은지 적어보세요. 참고할 사례와 먼저 알아볼 조건을 하나씩 골라보세요.</p><form class="activity-form"><label for="place">장소</label><select id="place" name="place">${['섬','농장','공사 현장'].map(p=>`<option ${p===answers.place?'selected':''}>${p}</option>`).join('')}</select>${fields.map(([key,label])=>`<label for="${key}">${label}</label><textarea id="${key}" name="${key}">${esc(answers[key])}</textarea>`).join('')}</form><p class="source-meta">입력은 현재 탭에 보관됩니다. 새로고침하기 전에 메모를 복사해 다른 곳에 붙여 두세요.</p><button id="copyActivity" type="button">내 기획 메모 복사</button><div class="activity-copy-status" role="status"></div>`;
    body.querySelectorAll('textarea,select').forEach(el=>el.addEventListener('input',()=>{answers[el.name]=el.value;}));
    /* Copy, not download: viewing pages offer no file-saving UI. A failed copy leaves the memo selectable. */
    body.querySelector('#copyActivity').addEventListener('click',async()=>{
      const text='나의 드론 활용 아이디어\n\n장소: '+answers.place+'\n'+fields.map(([key,label])=>label+': '+answers[key]).join('\n'),status=body.querySelector('.activity-copy-status');
      try{await navigator.clipboard.writeText(text);status.replaceChildren(document.createTextNode('메모를 복사했습니다. 원하는 곳에 붙여 넣으세요.'));record('workshop.copied');}
      catch{const area=document.createElement('textarea');area.readOnly=true;area.value=text;area.setAttribute('aria-label','복사할 기획 메모');status.replaceChildren(document.createTextNode('복사하지 못했습니다. 아래 메모를 직접 복사해 주세요.'),area);area.focus();area.select();}
    });
  }
  return {mount};
})();
