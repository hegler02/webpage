export const readerKey='guardhouse-book-reading-v1';
export const calculationKey='guardhouse-calculation-reading-v1';
const lessons=new Set(['L1','R1','R2','AC1','roof','floor','pit','canopy','wall','foundation']);
export function readerState(value={}){
 return {version:1,lesson:lessons.has(value?.lesson)?value.lesson:'L1',step:typeof value?.step==='string'&&/^[a-z][a-z-]{0,60}$/.test(value.step)?value.step:'power-sum',view:value?.view==='all'?'all':'one',scroll:Number.isFinite(value?.scroll)?Math.max(0,value.scroll):0};
}
export function readStored(storage,key){try{return JSON.parse(storage.getItem(key));}catch{return null;}}
export function writeStored(storage,key,value){try{storage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
export function readerHash(value){const s=readerState(value);return '#'+new URLSearchParams({read:s.lesson,formula:s.step,view:s.view});}
export function readerFromHash(hash){const p=new URLSearchParams(hash.replace(/^#/,''));return p.has('read')?readerState({lesson:p.get('read'),step:p.get('formula'),view:p.get('view')}):null;}
export function readerContext(search){const p=new URLSearchParams(search);return p.has('reader')?readerState({lesson:p.get('reader'),step:p.get('formula'),view:p.get('view')}):null;}
export function classroomLink(base,reading,{page='calculations',sheet='',element='',circuit='',term=''}={}){
 const s=readerState(reading),p=new URLSearchParams({reader:s.lesson,formula:s.step,view:s.view});
 for(const [key,value] of Object.entries({sheet,element,circuit,term}))if(value)p.set(key,value);
 return base+'?'+p+'#'+page;
}
