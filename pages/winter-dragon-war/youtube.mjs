// YouTube addressing and the IFrame player. The API loads only after someone presses play.
const ID=/^[A-Za-z0-9_-]{11}$/;

export function parseVideoId(input){
 const text=String(input??'').trim();
 if(!text)return null;
 if(ID.test(text))return text;
 let url;
 try{url=new URL(/^https?:\/\//i.test(text)?text:`https://${text}`);}catch{return null;}
 const host=url.hostname.replace(/^(www|m|music)\./,'');
 let id=null;
 if(host==='youtu.be')id=url.pathname.split('/')[1];
 else if(host==='youtube.com'||host==='youtube-nocookie.com'){
  id=url.searchParams.get('v');
  if(!id){const [kind,value]=url.pathname.split('/').filter(Boolean);if(['embed','shorts','live','v'].includes(kind))id=value;}
 }
 return id&&ID.test(id)?id:null;
}

let api;
function loadApi(){
 if(api)return api;
 api=new Promise((resolve,reject)=>{
  window.onYouTubeIframeAPIReady=()=>resolve(window.YT);
  const tag=document.createElement('script');tag.src='https://www.youtube.com/iframe_api';tag.onerror=()=>{api=null;reject(Error('youtube-api'));};
  document.head.append(tag);
 });
 return api;
}

export async function createPlayer(host,id,{start=0,onState,onError}={}){
 const YT=await loadApi();
 return new Promise(resolve=>{
  let captionsCleared=false;
  const player=new YT.Player(host,{
   host:'https://www.youtube-nocookie.com',videoId:id,
   playerVars:{autoplay:1,start:Math.floor(start),rel:0,playsinline:1,hl:'ko',cc_load_policy:0,origin:location.origin},
   // The film already carries its lyrics, so captions start off. Viewers can still turn them on.
   events:{onReady:()=>resolve(player),onApiChange:()=>{if(!captionsCleared){captionsCleared=true;player.setOption('captions','track',{});}},onStateChange:e=>onState?.(e.data===YT.PlayerState.PLAYING),onError:e=>onError?.(e.data)}
  });
 });
}
