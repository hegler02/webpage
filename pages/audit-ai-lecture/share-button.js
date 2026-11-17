"use strict";
/* Page sharing: the visitor's click starts it, the canonical address is the only thing shared,
   and a copy that cannot be confirmed falls back to a selectable address. */
(()=>{
  const button=document.getElementById('share'),status=document.getElementById('shareStatus');
  const canonical=document.querySelector('link[rel="canonical"]')?.href;
  if(!button||!status||!canonical)return;
  let timer=0;
  function say(text,{selectable=false}={}){
    clearTimeout(timer);status.replaceChildren(document.createTextNode(text));status.hidden=false;
    if(selectable){
      const address=document.createElement('input');
      address.type='text';address.readOnly=true;address.value=canonical;address.setAttribute('aria-label','페이지 주소');
      address.addEventListener('blur',()=>{status.hidden=true;});
      status.append(address);address.focus();address.select();
    }else timer=setTimeout(()=>{status.hidden=true;},2400);
  }
  async function copy(){
    try{await navigator.clipboard.writeText(canonical);say('링크를 복사했습니다.');}
    catch{say('복사하지 못했습니다. 주소를 직접 복사해 주세요.',{selectable:true});}
  }
  button.hidden=false;
  button.addEventListener('click',async()=>{
    if(!navigator.share)return copy();
    try{await navigator.share({title:document.title,url:canonical});}
    catch(error){if(error.name!=='AbortError')copy();}
  });
})();
