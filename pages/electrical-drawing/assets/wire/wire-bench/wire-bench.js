const phases=[
 {name:'R',layer:'RED-2.5SQ'},
 {name:'S',layer:'BLU-2.5SQ'},
 {name:'T',layer:'GRN-2.5SQ'}
];
const regions=['A','B','C','D'];
const general='0',standard='WIRES',baseStart=100;
const byId=id=>document.getElementById(id);
const blank=()=>phases.map(()=>regions.map(()=>''));

// The four electrically separate regions are processed left to right within each phase.
function numberNets(layers,registered,rules,useRules,held){
 const numbers=blank();
 const used=new Set(held?[held]:[]);
 const counters=new Map();
 for(const [row,layer] of layers.entries()){
  if(!registered.has(layer))continue;
  const rule=useRules&&rules.get(layer);
  const sequence=rule?layer:standard;
  const format=rule?rule.format:'%N';
  let next=counters.get(sequence)??(rule?rule.start:baseStart);
  for(let col=0;col<regions.length;col++){
   if(row===0 && col===0 && held){numbers[row][col]=held;continue}
   let number=format.replace('%N',String(next++));
   while(used.has(number))number=format.replace('%N',String(next++));
   numbers[row][col]=number;
   used.add(number);
  }
  counters.set(sequence,next);
 }
 return numbers;
}

function mount(){
 const fields=[];
 let current=blank();
 function make(tag,text){const n=document.createElement(tag);if(text)n.textContent=text;return n}
 function select(options,initial){
  const input=make('select');
  for(const text of options)input.add(new Option(text,text));
  input.value=initial;return input;
 }
 function named(text,input){
  const label=make('label',text+'　');label.append(input);return label;
 }
 function stale(){byId('state').textContent='조건이 바뀌었습니다. 번호 부여를 눌러 결과표에 반영하세요.'}
 function show(numbers,last){
  const fragment=document.createDocumentFragment();
  for(const [row,phase] of phases.entries()){
   const tr=make('tr'),th=make('th',phase.name+'상');th.scope='row';tr.append(th);
   for(const[col,number]of numbers[row].entries()){
    const td=make('td'),line=make('span');line.className='lines';line.setAttribute('aria-hidden','true');
    td.append(line,make('b',number||'번호 없음'));
    if(last&&last[row][col]!==number)td.append(make('small','이전 '+(last[row][col]||'없음')));
    if(row===0 && col===0 && byId('fixed').checked && number)td.append(make('small','고정됨'));
    tr.append(td);
   }
   fragment.append(tr);
  }
  byId('output').replaceChildren(fragment);
 }
 for(const phase of phases){
  const reg=make('input');reg.type='checkbox';const regLabel=make('label');regLabel.append(reg,document.createTextNode(' '+phase.layer));
  byId('register').append(regLabel);
  const layer=select([general,standard,...phases.map(p=>p.layer)],general);
  const layerCell=make('div');layerCell.append(named(phase.name+'상의 선 도면층',layer));byId('layers').append(layerCell);
  const formats=['%N',...phases.map(p=>p.name+'%N')];
  const format=select(formats,'%N'),start=make('input');start.type='number';start.min='1';start.max='9999';start.value='1';start.step='1';
  const ruleCell=make('div');ruleCell.append(make('b',phase.layer),named('번호 형식',format),named('시작값',start));byId('formats').append(ruleCell);
  fields.push({reg,layer,format,start});
  for(const input of [reg,layer,format,start])input.addEventListener('input',stale);
 }
 byId('overrides').oninput=stale;
 byId('apply-layer-rules').oninput=stale;
 byId('fixed').oninput=stale;
 function apply(){
  const registered=new Set([standard]),rules=new Map();
  const projectRules=byId('overrides').checked,runRules=byId('apply-layer-rules').checked;
  const useRules=projectRules&&runRules;
  for(const [i,field] of fields.entries()){
   if(field.reg.checked)registered.add(phases[i].layer);
   if(useRules&&!field.start.reportValidity())return;
   const start=Number(field.start.value);
   if(useRules&&(!Number.isInteger(start)||start<1)){field.start.focus();byId('state').textContent='각 시작값에 1 이상의 정수를 입력하세요.';return}
   rules.set(phases[i].layer,{format:field.format.value,start});
  }
  const choices=fields.map(f=>f.layer.value);
  const fixed=byId('fixed');
  if(!registered.has(choices[0]))fixed.checked=false;
  const next=numberNets(choices,registered,rules,useRules,fixed.checked?current[0][0]:'');
  show(next,current);current=next;
  fixed.disabled=!current[0][0];
  const count=next.flat().filter(Boolean).length;
  const dataMatch=next.every((row,i)=>row.every((n,c)=>n===phases[i].name+(c+1)));
  const wiringMatch=fields.every((f,i)=>f.reg.checked&&f.layer.value===phases[i].layer&&f.format.value===phases[i].name+'%N'&&Number(f.start.value)===1);
  const match=dataMatch&&wiringMatch&&useRules;
  let message=match?'세 상 모두 교안 결과와 일치합니다. 아래에서 시작값과 고정 번호를 바꾸어 보세요.':count===0?'선을 와이어로 인식하지 못했습니다. 사용 중인 도면층이 등록되었는지 확인하세요.':count<12?'일부 연결망이 번호 없음입니다. 해당 상의 도면층과 등록 상태를 대조하세요.':!useRules?'공통 순번이 붙었습니다. 도면층별 번호 규칙을 켜고 다시 계산하세요.':'원하는 접두 문자·시작값이 나왔는지 확인하세요. 도면층과 고정 번호도 대조하세요.';
  if(count===12 && !projectRules)message='공통 순번이 붙었습니다. 프로젝트 설정에서 와이어 도면층 기반 번호 규칙을 켜세요. 이어서 4단계 실행 창의 적용 여부도 확인하세요.';
  else if(count===12 && !runRules)message='프로젝트 규칙은 준비됐지만 이번 번호 부여 때 적용하지 않았습니다. 4단계에서 와이어 도면층 형식 재지정 사용을 켜고 재계산하세요.';
  if(dataMatch&&!wiringMatch)message='표시된 번호는 같지만 실제 도면층 배정 또는 규칙이 다릅니다. 상 이름, 도면층 이름, 그 층의 형식을 각각 확인하세요.';
  byId('state').textContent=count+' / 12개 연결망에 번호를 붙였습니다. '+message;
 }
 byId('apply').onclick=apply;
 byId('clear').onclick=()=>{
  for(const f of fields){f.reg.checked=false;f.layer.value=general;f.format.value='%N';f.start.value='1'}
  byId('overrides').checked=false;byId('apply-layer-rules').checked=false;
  byId('fixed').checked=false;byId('fixed').disabled=true;
  current=blank();show(current);byId('state').textContent='초기 상태입니다. 아직 번호를 부여하지 않았습니다.';
 };
 show(current);
}
mount();
