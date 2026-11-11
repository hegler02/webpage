"use strict";
/* Solo study mode: a question step opens each slide, a stage prediction is checked on the next step,
   terms explain themselves in place, and each section closes with a short check. */
window.DRONE_SOLO=(()=>{
  const {esc,token,num,img,stageKeys}=window.DRONE_UTILS,data=window.DRONE_CONTENT,store='drone-field-notes-solo',copy=data.solo;
  const saved=(()=>{try{return JSON.parse(localStorage.getItem(store))||{};}catch{return {};}})();
  let on=saved.on===true;
  const guesses=saved.guesses&&typeof saved.guesses==='object'?saved.guesses:{};
  const answers=saved.answers&&typeof saved.answers==='object'?saved.answers:{};
  const save=()=>{try{localStorage.setItem(store,JSON.stringify({on,guesses,answers}));}catch{}};
  const quiz=s=>{const keys=stageKeys(s,data);return keys.length>0&&keys.length<data.stageScale.length;};
  const lead=s=>on&&s.question?1:0;
  const tail=s=>on&&s.check?1:0;
  const label=key=>data.stageScale.find(x=>x.key===key)?.label||key;

  /* Terms come from the glossary slides and the name hints; the stage names stay on the ruler. */
  const hints=new Map();
  for(const g of data.slides.filter(s=>s.layout==='glossary'))for(const [name,meaning] of g.terms)for(const part of name.split(' · '))if(!data.skipTerms.includes(part))hints.set(part,{name,meaning});
  for(const [name,meaning] of data.nameHints)hints.set(name,{name,meaning});
  const pattern=new RegExp([...hints.keys()].sort((a,b)=>b.length-a.length).map(t=>{const e=t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return /^[A-Za-z]/.test(t)?'(?<![A-Za-z])'+e+'(?![A-Za-z])':e;}).join('|'),'g');
  const popover=document.createElement('div');
  popover.id='termPopover';popover.className='term-popover';popover.setAttribute('popover','auto');popover.setAttribute('role','note');
  popover.innerHTML='<p class="term-name"></p><p class="term-meaning"></p>';
  document.body.append(popover);
  let opener=null;
  popover.addEventListener('toggle',e=>{if(e.newState==='closed'&&opener){opener.setAttribute('aria-expanded','false');opener=null;}});
  function decorate(el){
    if(!el||el.querySelector('.term-hint'))return;
    const text=el.textContent,used=new Set();let html='',last=0;
    for(const m of text.matchAll(pattern)){
      if(used.has(m[0]))continue;used.add(m[0]);
      html+=esc(text.slice(last,m.index))+'<button type="button" class="term-hint" aria-expanded="false" aria-controls="termPopover" data-term="'+esc(m[0])+'">'+esc(m[0])+'</button>';
      last=m.index+m[0].length;
    }
    if(used.size)el.innerHTML=html+esc(text.slice(last));
  }
  function explain(button){
    const hint=hints.get(button.dataset.term);if(!hint)return;
    if(opener===button&&popover.matches(':popover-open')){popover.hidePopover();return;}
    popover.querySelector('.term-name').textContent=hint.name;popover.querySelector('.term-meaning').textContent=hint.meaning;
    if(popover.matches(':popover-open'))popover.hidePopover();
    const r=button.getBoundingClientRect(),gap=num('term-popover-gap'),width=num('term-popover-width');
    popover.style.left=Math.max(gap,Math.min(innerWidth-width-gap,r.left))+'px';popover.style.top=(r.bottom+gap)+'px';
    popover.showPopover();opener=button;button.setAttribute('aria-expanded','true');
    const box=popover.getBoundingClientRect();if(box.bottom>innerHeight-gap)popover.style.top=Math.max(gap,r.top-gap-box.height)+'px';
  }

  function tally(){
    const answered=data.slides.filter(s=>guesses[s.id]&&quiz(s));
    return answered.filter(s=>stageKeys(s,data).includes(guesses[s.id])).length+'/'+answered.length;
  }
  function render(s){
    let html='';
    if(s.question){
      const choices=quiz(s)
        ?'<p class="solo-prompt" id="soloPrompt">'+esc(copy.prompt)+'</p><div class="solo-choices" role="group" aria-labelledby="soloPrompt">'+data.stageScale.map(x=>'<button type="button" class="solo-choice stage-'+x.key+'" data-stage="'+x.key+'" aria-pressed="false">'+esc(x.label)+'</button>').join('')+'</div><p class="solo-hint" role="status"></p>'
        :'<p class="solo-hint">'+esc(copy.think)+'</p>';
      /* The slide's own pictures sit behind the question; titles and figures stay covered so the answer does not show. */
      const photos=(s.askImages||s.images||(s.layout==='quadrants'?s.items.map(x=>x[2]):null)||(s.image?[s.image]:[])).slice(0,4);
      const backdrop=photos.length===1?img(photos[0],'solo-ask-photo')+'<div class="solo-ask-shade"></div>':photos.length?'<div class="solo-ask-grid">'+photos.map(name=>img(name)).join('')+'</div>':'';
      const variant=photos.length===1?' has-photo':photos.length?' has-grid':'';
      html+='<div class="solo-ask solo-sheet'+variant+'" hidden>'+backdrop+'<div class="solo-ask-copy"><p class="solo-ask-label">'+esc(copy.label)+'</p><p class="solo-question">'+esc(s.question)+'</p>'+choices+'</div></div>';
    }
    if(s.check){
      html+='<div class="solo-check solo-sheet" hidden><p class="solo-ask-label">'+esc(copy.checkLabel+' · '+data.sections[s.section])+'</p><ol class="check-list">'+s.check.map((it,i)=>'<li class="check-item"><p class="check-question" id="checkQ'+i+'">'+esc(it.question)+'</p><div class="check-options" role="group" aria-labelledby="checkQ'+i+'">'+it.options.map((o,j)=>'<button type="button" class="check-option" data-item="'+i+'" data-option="'+j+'" aria-pressed="false">'+esc(o)+'</button>').join('')+'</div><div class="check-feedback" role="status"></div></li>').join('')+'</ol></div>';
    }
    return html;
  }
  function renderChecks(frame,s){
    frame.querySelectorAll('.check-item').forEach((item,i)=>{
      const picked=answers[s.id+':'+i],it=s.check[i],feedback=item.querySelector('.check-feedback');
      item.querySelectorAll('.check-option').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.option)===picked)));
      if(picked===undefined){feedback.replaceChildren();return;}
      if(picked===it.answer){feedback.innerHTML='<p>'+esc(copy.right)+'</p>';return;}
      const n=data.slides.findIndex(x=>x.id===it.review),target=data.slides[n];
      feedback.innerHTML='<p>'+esc(copy.reviewPrefix+' '+target.number+'장 '+target.title)+'</p><button type="button" class="solo-review" data-scene="'+n+'">'+esc(copy.reviewButton)+'</button>';
    });
  }
  function apply(root,s,{asking=false,checking=false,animate=false}={}){
    const frame=root.firstElementChild,ruler=frame.querySelector('.stage-ruler'),animations=[];
    if(popover.matches(':popover-open'))popover.hidePopover();
    const covered=asking||checking;
    frame.classList.toggle('is-asking',asking);frame.classList.toggle('is-checking',checking);
    for(const el of frame.children)if(!el.matches('.eyebrow,.stage-ruler,.solo-sheet,.slide-footer'))el.inert=covered;
    for(const [sheet,open] of [[frame.querySelector('.solo-ask'),asking],[frame.querySelector('.solo-check'),checking]]){
      if(!sheet)continue;
      const opening=sheet.hidden&&open;sheet.hidden=!open;
      if(opening&&animate&&num('motion-feedback')){
        const a=sheet.animate([{opacity:0},{opacity:1}],{duration:num('motion-feedback'),easing:token('motion-ease'),fill:'backwards'});
        a.droneEntry=true;a.finished.catch(()=>{});animations.push(a);
      }
    }
    for(const button of frame.querySelectorAll('.solo-choice'))button.setAttribute('aria-pressed',String(guesses[s.id]===button.dataset.stage));
    const hint=frame.querySelector('.solo-hint[role="status"]');if(hint)hint.textContent=guesses[s.id]?copy.chosen:'';
    if(s.check)renderChecks(frame,s);
    ruler?.querySelector('.solo-feedback')?.remove();
    for(const cell of frame.querySelectorAll('.stage-cell.is-guess')){cell.classList.remove('is-guess');cell.querySelector('.guess-mark')?.remove();}
    const guess=guesses[s.id];
    if(on&&!covered&&ruler&&quiz(s)&&guess){
      const keys=stageKeys(s,data),hit=keys.includes(guess),note=document.createElement('p');
      note.className='stage-ruler-caption solo-feedback';
      note.textContent=hit?copy.hit+' · '+tally():copy.miss+' '+label(guess)+' → '+copy.answer+' '+keys.map(label).join('·')+' · '+tally();
      ruler.prepend(note);
      if(!hit){const cell=ruler.querySelector('.stage-'+guess);cell?.classList.add('is-guess');cell?.insertAdjacentHTML('beforeend','<span class="sr-only guess-mark"> '+esc(copy.guess)+'</span>');}
    }
    if(on&&!covered)['#beatHead','#beatText','#beatNote'].forEach(sel=>decorate(frame.querySelector(sel)));
    return animations;
  }
  function choose(root,s,key){
    if(!data.stageScale.some(x=>x.key===key))return;
    guesses[s.id]=key;save();apply(root,s,{asking:true});
  }
  function answer(root,s,item,option){
    if(!s.check?.[item]||!(option>=0&&option<s.check[item].options.length))return;
    answers[s.id+':'+item]=option;save();renderChecks(root.firstElementChild,s);
  }
  return {isOn:()=>on,setOn:value=>{on=!!value;save();if(!on&&popover.matches(':popover-open'))popover.hidePopover();},lead,tail,quiz,render,apply,choose,answer,explain,tally};
})();
