// Pure learning state. A flip is not a learning rating; an answer is counted once.
export const studyKey=sample=>'space-electric-study-v1:'+sample;
// The quiz as the student last left it, kept apart so the stuck report can read it without the sample's questions.
export const quizSummaryKey=sample=>'space-electric-quiz-v1:'+sample;
// Full reset also removes card, quiz and fire-drill records, so a shared PC starts clean.
export function clearLearningRecords(sample,projectId=null){
 try{localStorage.removeItem(studyKey(sample));localStorage.removeItem(quizSummaryKey(sample));if(projectId)localStorage.removeItem('fire-sim-result-'+projectId);}catch{}
}
export const questionSignature=q=>JSON.stringify([q.statement,q.answer,q.explanation]);
export function freshStudy(){return {version:1,mode:'dictionary',category:'bim',query:'',deck:[],index:0,flipped:false,ratings:{},quiz:[],answers:{},quizIndex:0,result:false,returnMode:null,term:null};}
export function restoreStudy(raw,terms,questions,categories){
 const s=freshStudy(),ids=new Set(terms.map(t=>t.id)),qm=new Map(questions.map(q=>[q.id,q]));
 if(!raw||raw.version!==1||typeof raw!=='object')return s;
 if(['dictionary','cards','quiz'].includes(raw.mode))s.mode=raw.mode;
 if(raw.category==='all'||Object.hasOwn(categories,raw.category))s.category=raw.category;
 if(typeof raw.query==='string')s.query=raw.query.slice(0,150);
 const validList=(xs,set)=>Array.isArray(xs)?[...new Set(xs.filter(id=>typeof id==='string'&&set.has(id)))]:[];
 s.deck=validList(raw.deck,ids);s.quiz=validList(raw.quiz,new Set(qm.keys()));
 const position=(n,list)=>Number.isInteger(n)?Math.max(0,Math.min(n,Math.max(0,list.length-1))):0;
 s.index=position(raw.index,s.deck);s.quizIndex=position(raw.quizIndex,s.quiz);
 s.flipped=raw.flipped===true;
 for(const [id,rating]of Object.entries(raw.ratings??{}))if(ids.has(id)&&['again','unsure','known'].includes(rating))s.ratings[id]=rating;
 for(const id of s.quiz){const a=raw.answers?.[id],q=qm.get(id);if(a&&typeof a.value==='boolean'&&a.signature===questionSignature(q))s.answers[id]={value:a.value,signature:a.signature};}
 s.result=raw.result===true&&s.quiz.length>0&&s.quiz.every(id=>s.answers[id]);
 if(['cards','quiz'].includes(raw.returnMode))s.returnMode=raw.returnMode;
 if(ids.has(raw.term))s.term=raw.term;
 return s;
}
export function selectDeck(terms,s,{limit=5,difficult=false}={}){
 const candidates=terms.filter(t=>(s.category==='all'||t.category===s.category)&&(!difficult||['again','unsure'].includes(s.ratings[t.id])));
 const priority={again:0,unsure:1,known:3};
 return candidates.map((t,i)=>({t,i})).sort((a,b)=>(priority[s.ratings[a.t.id]]??2)-(priority[s.ratings[b.t.id]]??2)||a.i-b.i).slice(0,limit).map(x=>x.t.id);
}
export function answerQuestion(s,q,value){
 if(typeof value!=='boolean'||!s.quiz.includes(q.id)||s.answers[q.id])return false;
 s.answers[q.id]={value,signature:questionSignature(q)};return true;
}
export function quizScore(s,questions){const qm=new Map(questions.map(q=>[q.id,q])),answered=s.quiz.filter(id=>qm.has(id)&&s.answers[id]?.signature===questionSignature(qm.get(id)));const wrong=answered.filter(id=>s.answers[id].value!==qm.get(id).answer);return {total:s.quiz.length,answered:answered.length,correct:answered.length-wrong.length,wrong};}
export function loadStudy(storage,sample,terms,questions,categories){try{return {state:restoreStudy(JSON.parse(storage.getItem(studyKey(sample))),terms,questions,categories),persistent:true};}catch{return {state:freshStudy(),persistent:false};}}
export function saveQuizSummary(storage,sample,s,questions){const r=quizScore(s,questions),qm=new Map(questions.map(q=>[q.id,q]));try{storage.setItem(quizSummaryKey(sample),JSON.stringify({total:r.total,answered:r.answered,correct:r.correct,wrong:r.wrong.map(id=>qm.get(id)?.statement).filter(Boolean)}));}catch{}}
export function saveStudy(storage,sample,state){try{storage.setItem(studyKey(sample),JSON.stringify(state));return true;}catch{return false;}}
