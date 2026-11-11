"use strict";
window.DRONE_WORKSHOP=(()=>{
  const {esc}=window.DRONE_UTILS;
  const answers={place:'섬',problem:'',user:'',proof:'',unknown:''};
  const fields=[['problem','반복해서 해결하고 싶은 일'],['user','결과를 사용하는 사람'],['proof','강의에서 참고할 실제 사례'],['unknown','먼저 확인할 것']];
  function mount(body,record){
    body.innerHTML=`<p>누구의 어떤 일을 돕고 싶은지 적어보세요. 참고할 사례와 먼저 알아볼 조건을 하나씩 골라보세요.</p><form class="activity-form"><label for="place">장소</label><select id="place" name="place">${['섬','농장','공사 현장'].map(p=>`<option ${p===answers.place?'selected':''}>${p}</option>`).join('')}</select>${fields.map(([key,label])=>`<label for="${key}">${label}</label><textarea id="${key}" name="${key}">${esc(answers[key])}</textarea>`).join('')}</form><p class="source-meta">입력은 현재 탭에 보관됩니다. 새로고침하기 전에 기획 메모 저장 버튼으로 파일을 받아 두세요.</p><button id="downloadActivity" type="button">내 기획 메모 저장</button>`;
    body.querySelectorAll('textarea,select').forEach(el=>el.addEventListener('input',()=>{answers[el.name]=el.value;}));
    body.querySelector('#downloadActivity').addEventListener('click',()=>{
      const text='나의 드론 활용 아이디어\n\n장소: '+answers.place+'\n'+fields.map(([key,label])=>label+': '+answers[key]).join('\n');
      const url=URL.createObjectURL(new Blob(['\uFEFF'+text],{type:'text/plain;charset=utf-8'}));
      const a=document.createElement('a');a.href=url;a.download='드론-현장-기획.txt';a.click();URL.revokeObjectURL(url);record('workshop.saved');
    });
  }
  return {mount};
})();
