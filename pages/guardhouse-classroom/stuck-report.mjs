// "막힌 곳 적기": a student writes where they got stuck, and the page adds what a teacher needs to find it again —
// the sample, the menu, the screen size and the glossary quiz as it was left. The text is copied or saved to hand in.
import {quizSummaryKey} from './study-state.mjs';

const MENU='header [data-go],header [data-menu],header [data-page],nav [data-go],nav [data-menu],nav [data-page]';
function menuNow(){
 const id=location.hash.slice(1)||'home',button=[...document.querySelectorAll(MENU)].find(n=>(n.dataset.go??n.dataset.menu??n.dataset.page)===id);
 return {id,name:(button?.textContent||document.querySelector('h1')?.textContent||id).replace(/\s+/g,' ').trim()};
}
function quizLine(sample){
 try{const q=JSON.parse(localStorage.getItem(quizSummaryKey(sample)));if(!q?.answered)return '아직 풀지 않음';
  return `${q.answered}문항 중 ${q.correct}문항 맞힘`+(q.wrong.length?` · 틀린 문장: ${q.wrong.join(' / ')}`:'');}
 catch{return '기록을 읽지 못함';}
}
const stamp=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;};

export function mountStuckReport(sample){
 const reset=[...document.querySelectorAll('header button')].find(b=>b.textContent.trim()==='실습 초기화');
 if(!reset||document.querySelector('[data-stuck-report]'))return;
 const open=document.createElement('button');open.type='button';open.dataset.stuckReport='';open.textContent='막힌 곳 적기';reset.before(open);
 const dialog=document.createElement('dialog');dialog.id='stuck-report';
 dialog.innerHTML='<h2>막힌 곳 적기</h2><p>적은 내용에 샘플·메뉴·퀴즈 기록이 함께 담깁니다. 복사하거나 파일로 저장해 수업 게시판에 올려 주세요.</p>'+
  '<label>무엇을 하려고 했나요?<textarea rows="3" data-stuck="tried"></textarea></label><label>무엇이 보였나요?<textarea rows="3" data-stuck="saw"></textarea></label>'+
  '<p data-stuck="about"></p><p role="status" data-stuck="status"></p>'+
  '<div class="dialog-actions"><button type="button" data-stuck="copy">복사하기</button><button type="button" data-stuck="save">파일로 저장</button><button type="button" data-dialog-close>닫기</button></div>';
 document.body.append(dialog);
 const $=k=>dialog.querySelector(`[data-stuck="${k}"]`),sampleName=()=>document.querySelector('[data-sample-navigation] [aria-current="page"]')?.textContent.trim()||'샘플 '+sample;
 const text=()=>{const m=menuNow();return ['[공간과 전기 · 막힌 곳]',`샘플: ${sampleName()}`,`메뉴: ${m.name} (#${m.id})`,`하려던 것: ${$('tried').value.trim()||'-'}`,`본 화면: ${$('saw').value.trim()||'-'}`,
  `용어 퀴즈: ${quizLine(sample)}`,`화면: ${innerWidth}×${innerHeight} · ${navigator.userAgent.match(/(Edg|Whale|SamsungBrowser|Firefox|Chrome|Safari)\/[\d.]+/)?.[0]??'브라우저'}`,`적은 때: ${stamp()}`].join('\n');};
 open.onclick=()=>{const m=menuNow();$('about').textContent=`${sampleName()} · ${m.name} · 용어 퀴즈 ${quizLine(sample)}`;$('status').textContent='';dialog.showModal();$('tried').focus();};
 $('copy').onclick=async()=>{try{await navigator.clipboard.writeText(text());$('status').textContent='복사했습니다. 수업 게시판에 붙여 넣으세요.';}catch{$('status').textContent='복사하지 못했습니다. 파일로 저장해 주세요.';}};
 $('save').onclick=()=>{const a=document.createElement('a'),m=menuNow(),url=URL.createObjectURL(new Blob([text()+'\n'],{type:'text/plain;charset=utf-8'}));
  a.href=url;a.download=`막힌곳-샘플${sample}-${m.id}-${stamp().slice(0,10)}.txt`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('status').textContent='파일로 저장했습니다.';};
}
