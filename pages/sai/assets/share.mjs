export function initShare(){
  const button=document.querySelector('#share'),notice=document.querySelector('#share-status');
  const dialog=document.querySelector('#share-dialog'),link=document.querySelector('#share-link');
  const data={title:'사이 — 우리 모두 사이좋게 지내요',text:'너와 나의 사이가, 우리 모두의 세계로.',url:'https://mirinaeman.com/pages/sai/'};
  let busy=false,timer,disposed=false;
  const events=new AbortController();
  button.addEventListener('click',async()=>{
    if(busy)return;busy=true;button.disabled=true;clearTimeout(timer);notice.hidden=true;
    try{
      if(navigator.share){
        try{await navigator.share(data);return;}catch(error){if(error.name==='AbortError')return;}
      }
      if(disposed)return;
      try{
        if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(data.url);
        if(disposed)return;
        notice.textContent='공유 주소를 복사했습니다';notice.hidden=false;
        timer=setTimeout(()=>{notice.hidden=true;},3500);
      }catch{
        if(disposed)return;
        dialog.showModal();link.focus();link.select();
      }
    }finally{busy=false;if(!disposed)button.disabled=false;}
  },{signal:events.signal});
  return ()=>{if(disposed)return;disposed=true;events.abort();clearTimeout(timer);if(dialog.open)dialog.close();};
}
