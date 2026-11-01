(() => {
  const data=JSON.parse(document.getElementById('site-data').textContent);
  const button=document.getElementById('share');
  const feedback=document.getElementById('share-feedback');
  function show(message,manual=false){
    feedback.replaceChildren();feedback.hidden=false;
    const p=document.createElement('p');p.textContent=message;feedback.append(p);
    const close=document.createElement('button');close.type='button';close.textContent='닫기';close.onclick=()=>{feedback.hidden=true;button.focus();};feedback.append(close);
    if(manual){const input=document.createElement('input');input.type='text';input.readOnly=true;input.value=data.canonical;input.setAttribute('aria-label','복사할 페이지 주소');feedback.append(input);input.focus();input.select();}
  }
  async function copy(){try{await navigator.clipboard.writeText(data.canonical);show('감상 페이지 주소를 복사했습니다.');}catch{show('아래 주소를 선택해 복사할 수 있습니다.',true);}}
  button.addEventListener('click',async()=>{
    if(navigator.share){try{await navigator.share({title:data.title,url:data.canonical});show('공유 창을 닫았습니다.');}catch(err){if(err.name!=='AbortError')await copy();}}
    else await copy();
  });
})();
