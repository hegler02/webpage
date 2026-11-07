const tasks = [
  {id:'enter', title:'진입', label:'팔레트가 컨베이어 입구를 막 통과했습니다.', english:'PALLET ENTER', sensor:'-09B1', terminal:'11', input:'I:001/00', x:70},
  {id:'station', title:'정위치', label:'팔레트가 작업 위치에 들어왔습니다.', english:'PALLET IN STATION', sensor:'-09B2', terminal:'12', input:'I:001/01', x:110},
  {id:'raised', title:'상승', label:'팔레트가 올라간 상태를 감지했습니다.', english:'PALLET RAISED', sensor:'-09B3', terminal:'13', input:'I:001/02', x:150}
];
const strip='-X1-1', sourceSheet='09', panelSheet='22', storageKey='field-wiring-v1';
const groups=[
  {key:'sensor',label:'현장 센서',order:[1,0,2]},
  {key:'terminal',label:'제어반 단자',order:[2,1,0]},
  {key:'input',label:'PLC 입력',order:[0,2,1]}
];
const sheets={
  '01':{label:'설비 배치',hint:'장치의 위치와 신호 목록을 읽는 장입니다. 한 센서의 접속점부터 PLC까지 선을 따라갈 수 있는 도면도 찾아보세요.'},
  '09':{label:'PLC 입력',hint:'입력 회로를 찾았습니다. 영문 설명이 의뢰서와 일치하는 센서 열을 아래쪽 PLC까지 따라가세요.'},
  '17':{label:'PLC 출력',hint:'출력은 PLC에서 현장 쪽으로 나가는 명령입니다. 이번 과제의 신호는 센서에서 PLC로 들어옵니다.'},
  '22':{label:'주 제어반 배치',hint:'함 내부에 단자대가 보입니다. 입력 회로를 먼저 찾은 다음 이 도면에서 실제 장착 위치를 확인하세요.'}
};
const fullView='0 0 42000 29000', inputView='3200 3850 13800 18700';
const element = (tag,text) => {const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node};
const dom = id => document.getElementById(id);
const makeButton=(text,handler)=>{const button=element('button',text);button.type='button';button.addEventListener('click',handler);return button};
const key=(type,value)=>type+'|'+value;
const typeOf=pin=>pin.split('|')[0], valueOf=pin=>pin.split('|')[1];
const rank=pin=>groups.findIndex(group=>group.key===typeOf(pin));
const pinName=pin=>typeOf(pin)==='terminal'?strip+' / '+valueOf(pin)+'번':valueOf(pin);
const edge=(a,b)=>rank(a)<rank(b)?[a,b]:[b,a];
const edgeId=wire=>wire.join('~');
function required(task){
  const sensor=key('sensor',task.sensor),terminal=key('terminal',task.terminal),input=key('input',task.input);
  return [[sensor,terminal],[terminal,input]];
}
function evaluate(task,wires,selectedSheet){
  if(selectedSheet!==sourceSheet)return {ok:false,text:'첫 단계에서 PLC로 들어가는 원도면을 선택하세요.'};
  if(!wires.length)return {ok:false,text:'아직 연결된 선이 없습니다. 현장 센서부터 시작하세요.'};
  const have=new Set(wires.map(edgeId));
  const [first,second]=required(task).map(edgeId);
  if(!have.has(first))return {ok:false,text:'첫 구간을 다시 보세요. 의뢰서와 같은 설명의 센서에서 아래로 따라가면 어느 단자에 닿나요?'};
  if(!have.has(second))return {ok:false,text:'센서에서 단자까지 연결했습니다. 같은 단자의 반대편에서 시작해 입력 주소를 다시 확인하세요.'};
  if(have.size!==2)return {ok:false,text:'필요한 두 구간을 찾았습니다. 이번 신호와 관계없는 선은 목록에서 지운 뒤 다시 확인하세요.'};
  return {ok:true,text:'두 구간이 원도면과 일치합니다. 다음으로 22번 패널 배치에서 이 신호가 들어오는 단자를 고르세요.'};
}
function mount(){
  let task=tasks[0],sheet='',chosen=null,wires=[],checked=false,panelDone=false;
  const buttons=new Map(), SVG='http://www.w3.org/2000/svg';
  let completed={};
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))completed=saved}catch{}
  function message(id,text,tone=''){
    const box=dom(id);box.textContent=text;box.dataset.tone=tone;
  }
  function progress(){
    const count=tasks.filter(({id})=>completed[id]===true).length;
    dom('progress').textContent='이 기기에서 대조를 마친 신호　'+count+' / '+tasks.length+'　·　다른 의뢰서를 골라 새 경로를 그릴 수 있습니다.';
    for(const b of dom('missions').children){
      const item=tasks.find(i=>i.id===b.dataset.id);
      b.textContent=item.title+(completed[item.id]===true?' ✓':'');
      b.setAttribute('aria-pressed',String(item.id===task.id));
    }
  }
  function unlockPanel(yes){
    for(const b of dom('terminals').children)b.disabled=!yes;
  }
  function forgetAssessment(){
    checked=false;panelDone=false;unlockPanel(false);dom('result').hidden=true;
    message('grade-msg','두 구간을 다 그렸으면 연결 검사를 누르세요.');
    message('panel-msg','배선 검사에 통과한 뒤 단자 번호를 고르세요.');
    for(const b of dom('terminals').children)b.setAttribute('aria-pressed','false');
  }
  function pins(){
    for(const [pin,btn] of buttons)btn.setAttribute('aria-pressed',String(pin===chosen));
  }
  function trace(){
    const board=dom('board'),svg=dom('leads'),rect=board.getBoundingClientRect();
    svg.setAttribute('viewBox',[0,0,rect.width,rect.height].join(' '));
    svg.replaceChildren();
    for(const [a,b] of wires){
      const start=buttons.get(a).getBoundingClientRect(),end=buttons.get(b).getBoundingClientRect();
      const x1=start.right-rect.left,y1=start.top+start.height/2-rect.top;
      const x2=end.left-rect.left,y2=end.top+end.height/2-rect.top,mid=(x1+x2)/2;
      const path=document.createElementNS(SVG,'path');path.setAttribute('d','M'+x1+' '+y1+' C'+mid+' '+y1+' '+mid+' '+y2+' '+x2+' '+y2);svg.append(path);
    }
  }
  function listWires(){
    dom('nets').replaceChildren();
    for(const wire of wires){
      const item=element('li'),label=pinName(wire[0])+' → '+pinName(wire[1]);
      const remove=makeButton('지우기',()=>{
        wires=wires.filter(w=>w!==wire);chosen=null;pins();forgetAssessment();listWires();
        message('pick-msg','선 한 구간을 지웠습니다. 다시 그릴 접속점을 선택하세요.');dom('grade').focus();
      });remove.setAttribute('aria-label',label+' 선 지우기');
      item.append(element('code',label),remove);dom('nets').append(item);
    }
    trace();
  }
  function pick(pin){
    if(chosen===null){chosen=pin;pins();message('pick-msg',pinName(pin)+' 선택. 옆 부품군에서 연결할 접속점을 누르세요.');return}
    if(pin===chosen){chosen=null;pins();message('pick-msg','선택을 해제했습니다. 새 접속점을 누르세요.');return}
    if(rank(chosen)===rank(pin)){chosen=pin;pins();message('pick-msg',pinName(pin)+'으로 시작점을 바꿨습니다.');return}
    if(Math.abs(rank(chosen)-rank(pin))!==1){message('pick-msg','단자대에서 한 번 이어집니다. 가운데 단자를 골라 첫 구간을 완성하세요.','retry');return}
    const wire=edge(chosen,pin);chosen=null;pins();
    if(wires.some(w=>edgeId(w)===edgeId(wire))){message('pick-msg','이미 그려진 선입니다. 다른 쪽 구간을 이어 보세요.');return}
    wires.push(wire);forgetAssessment();listWires();message('pick-msg',pinName(wire[0])+' → '+pinName(wire[1])+' 연결.');
  }
  function selectSheet(num){
    sheet=num;
    for(const b of dom('sheets').children)b.setAttribute('aria-pressed',String(b.dataset.no===num));
    dom('source').hidden=false;
    const url='../assets/sheet-'+num+'.svg';
    dom('source-img').setAttribute('href',url);dom('drawing-view').setAttribute('viewBox',num===sourceSheet?inputView:fullView);
    dom('source-title').textContent=num+'번 '+sheets[num].label+(num===sourceSheet?'에서 세 센서와 입력 채널을 보여 주는 부분':' 전체');
    dom('open-sheet').href=url;dom('source-cap').textContent='IEC-Training-'+num+'.dwg · '+sheets[num].label;
    message('sheet-msg',sheets[num].hint,num===sourceSheet?'success':'retry');
    if(num!==sourceSheet)forgetAssessment();
  }
  function start(item){
    task=item;sheet='';chosen=null;wires=[];pins();listWires();forgetAssessment();
    for(const b of dom('sheets').children)b.setAttribute('aria-pressed','false');
    dom('source').hidden=true;message('sheet-msg','도면을 선택하면 원도면이 열립니다.');
    message('pick-msg','시작할 접속점을 하나 누르세요.');
    dom('mission').textContent=item.label+' 이 신호가 제어기에 들어오는 길을 찾으세요. 원도면의 설명은 '+item.english+'입니다.';
    progress();
  }
  function markPanel(terminal){
    if(!checked)return;
    for(const b of dom('terminals').children)b.setAttribute('aria-pressed',String(b.dataset.value===terminal));
    if(terminal!==task.terminal){panelDone=false;dom('result').hidden=true;message('panel-msg','그 행의 와이어 표기와 방금 연결한 입력 주소를 대조하세요. 같은 단자대에도 다른 신호가 들어옵니다.','retry');return}
    panelDone=true;message('panel-msg','같은 신호의 회로도와 제어반 단자를 모두 찾았습니다.','success');
    dom('result').hidden=false;
    dom('answer').textContent=task.english+'　·　'+task.sensor+' → '+strip+'의 '+task.terminal+'번 → '+task.input;
    dom('reference').textContent='09번의 PLC1은 1771-IAD 입력 모듈입니다. 이 회로의 와이어 번호와 입력 주소는 '+task.input+'로 같습니다. 22번 단자대의 '+task.terminal+'번에서도 같은 와이어 표기를 확인합니다.';
    dom('answer-svg').setAttribute('viewBox',[(task.x-26)*100,4000,5200,17900].join(' '));
    completed[task.id]=true;try{localStorage.setItem(storageKey,JSON.stringify(completed))}catch{}progress();
  }
  for(const item of tasks){const b=makeButton(item.title,()=>{if(item.id!==task.id)location.hash='task-'+item.id});b.dataset.id=item.id;dom('missions').append(b)}
  for(const num of Object.keys(sheets).sort()){const b=makeButton(num+' '+sheets[num].label,()=>selectSheet(num));b.dataset.no=num;dom('sheets').append(b)}
  for(const group of groups){
    const bank=element('div');bank.className='bank';bank.append(element('h3',group.label));
    for(const index of group.order){
      const value=tasks[index][group.key],pin=key(group.key,value),b=makeButton(value,()=>pick(pin));b.className='terminal';
      if(group.key==='terminal'){const note=element('span',strip);note.className='term-small';b.append(note)}
      b.setAttribute('aria-label',group.label+' '+pinName(pin));bank.append(b);buttons.set(pin,b);
    }
    dom('board').append(bank);
  }
  for(const t of [tasks[1],tasks[0],tasks[2]]){const b=makeButton(t.terminal+'번',()=>markPanel(t.terminal));b.dataset.value=t.terminal;dom('terminals').append(b)}
  dom('grade').addEventListener('click',()=>{
    const result=evaluate(task,wires,sheet);checked=result.ok;unlockPanel(checked);
    message('grade-msg',result.text,result.ok?'success':'retry');
    if(checked&&!panelDone)message('panel-msg','22번 확대도에서 같은 와이어 표기가 있는 행을 찾아 단자 번호를 선택하세요.');
  });
  dom('clear').addEventListener('click',()=>{wires=[];chosen=null;pins();forgetAssessment();listWires();message('pick-msg','이 과제의 연결을 비웠습니다. 센서부터 다시 그려 보세요.')});
  dom('record').addEventListener('click',()=>{
    if(!checked||!panelDone)return;
    const rows=[
      '전기도면 종합설계 | 신호 한 줄 실습 기록', '이름: ________________________', '과제: '+task.title+' ('+task.english+')',
      '증거 도면: IEC-Training-09.dwg, IEC-Training-22.dwg',
      ...wires.map(w=>pinName(w[0])+' → '+pinName(w[1])),
      '확인한 패널 단자: '+strip+' / '+task.terminal, '대조한 와이어 번호: '+task.input,
      'CAD 기록란 (직접 작성)', '개인 사본 폴더: ________________________', '재배선한 파일: ________________________',
      'CAD에서 확인한 센서 태그 / 단자대 / 단자 번호 / PLC 주소: ________________________',
      '09번 회로와 22번 패널에서 같은 신호라는 근거: ________________________',
      '첨부할 캡처: 09번 신호 열, 22번 단자대의 같은 행'
    ];
    const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.join('\r\n')],{type:'text/plain;charset=utf-8'}));
    const a=element('a');a.href=url;a.download='IEC-입력실습-'+task.id+'.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  if('ResizeObserver' in window)new ResizeObserver(trace).observe(dom('board'));
  else window.addEventListener('resize',trace);
  function openTask(){
    const id=location.hash.replace(/^#task-/,'');
    start(tasks.find(item=>item.id===id)||tasks[0]);
  }
  window.addEventListener('hashchange',openTask);
  openTask();
}
if(typeof document!=='undefined')mount();
export {tasks,required,evaluate};
