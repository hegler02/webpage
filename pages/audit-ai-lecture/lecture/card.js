(()=>{'use strict';
 const status=document.getElementById('copy-status');
 let timer=null;
 function say(text){status.textContent=text;clearTimeout(timer);timer=setTimeout(()=>{status.textContent='';},2600);}
 function selectText(node){const range=document.createRange();range.selectNodeContents(node);const sel=getSelection();sel.removeAllRanges();sel.addRange(range);}
 document.querySelectorAll('.prompt').forEach((box)=>{
  const pre=box.querySelector('pre'),button=box.querySelector('.copy');
  if(!pre||!button)return;
  button.addEventListener('click',async()=>{
   try{if(!navigator.clipboard)throw new Error('unavailable');await navigator.clipboard.writeText(pre.textContent);say('복사했습니다. AI 앱에 붙여 넣으세요.');}
   catch(_){selectText(pre);say('글자를 선택했습니다. 길게 눌러 ‘복사’를 고르세요.');}
  });
 });
})();
