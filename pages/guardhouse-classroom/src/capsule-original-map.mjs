// Rectangles are fractions of the sheet picture (x right, y down), as written by scripts/prepare-capsule-drawings.mjs.
// A region identifies one visible occurrence, not a new physical device.
import {drawingData} from './capsule-drawing-data.mjs';
import {byId,ioNames} from './capsule-project.mjs';
const VIEW=[1000,760],SHEET=[3200,2477];
export const frame={width:VIEW[1]*SHEET[0]/SHEET[1],height:VIEW[1],left:(VIEW[0]-VIEW[1]*SHEET[0]/SHEET[1])/2};
const sheetName=Object.fromEntries(drawingData.sheets.map(s=>[s.number,s.name]));
const coil=d=>['relay','contactor'].includes(d.kind);
const CONTACTS=['relay','contactor','disconnect','breaker','safety','drive','button','estop','guard','limit','selector'];
// A two-digit contact number ending in 1 or 2 is normally closed: it opens when the coil pulls in.
const normallyClosed=(d,term)=>['relay','contactor','disconnect'].includes(d.kind)&&/^\d[12]$/.test(term);
function where(xref,number){
 if(!xref)return '';
 const [sheet,column]=xref.includes('.')?xref.split('.'):[number,xref];
 return sheet===number?` 본체는 이 장 ${column}열에 있습니다.`:` 본체는 원본 ${sheet}번(${sheetName[sheet]??''}) ${column}열에 있습니다.`;
}
function deviceRegion(r,number){
 const d=byId.get(r.device),base={key:r.key,device:r.device,rect:r.rect,role:r.role,contact:r.term,camera:d.host};
 if(r.role==='child'){
  // Cables, fuses and plugs drawn a second time have no contact number: the same part continues on this sheet.
  if(!r.term||!CONTACTS.includes(d.kind))return {...base,label:`${d.name} · 이어 그린 자리`,description:`${d.name}을(를) 이 장에 이어서 그린 자리입니다.${where(r.xref,number)} ${d.description}`,term:d.term};
  const closed=normallyClosed(d,r.term),moves=coil(d)?'코일에 전기가 들어오면':d.kind==='disconnect'?'개폐기를 닫으면':'본체가 동작하면';
  return {...base,label:`${d.name} · 접점 ${r.term}`,description:`${d.name}에 딸린 접점 ${r.term}입니다. ${closed?`평소에 닫혀 있다가 ${moves} 열립니다.`:`${moves} 닫힙니다.`}${where(r.xref,number)}`,term:'contact',closed};
 }
 if(r.role==='terminal')return {...base,label:`${d.name} · 단자 ${r.term}`,description:`${d.name}의 ${r.term}번 단자입니다. 제어반 안 전선과 밖에서 오는 전선이 여기서 만납니다.`,term:'terminal'};
 if(r.role==='layout')return {...base,label:`${d.name} · 설치 자리`,description:`${d.name}이(가) 놓이는 자리입니다. ${d.description}`,term:d.term};
 return {...base,label:d.name+(coil(d)?' · 코일':''),description:d.description,term:coil(d)?'coil':d.term};
}
function ioRegion(r,number){
 const named=ioNames[r.address],out=/^O|^IOUT/.test(r.address),analog=/^IOUT|^IN\d/.test(r.address);
 return {key:`io-${number}-${r.address}`,device:r.module,rect:r.rect,role:'io',address:r.address,label:`PLC ${out?'출력':'입력'} ${r.address}${named?' · '+named.name:''}`,description:named?`${named.english} — ${named.name}. ${out?'PLC가 이 점을 켜면 연결된 코일이나 밸브에 전압이 나갑니다.':'연결된 접점이 닫히면 PLC가 이 점을 켜진 것으로 읽습니다.'}`:'원본에서 쓰지 않는 점입니다.',term:analog?'analog':out?'output':'input'};
}
export const originalRegions=Object.fromEntries(drawingData.sheets.map(s=>[s.number,[...s.regions.filter(r=>byId.has(r.device)).map(r=>deviceRegion(r,s.number)),...s.io.filter(r=>byId.has(r.module)).map(r=>ioRegion(r,s.number))]]));
export const originalLinks=Object.fromEntries(drawingData.sheets.map(s=>[s.number,s.links]));
const index=new Map(Object.entries(originalRegions).flatMap(([number,regions])=>regions.map(r=>[r.key,{...r,number}])));
export function findOriginalRegion(key){return index.get(key)??null;}
export function originalOccurrences(device){return Object.entries(originalRegions).sort(([a],[b])=>Number(a)-Number(b)).flatMap(([number,regions])=>regions.filter(r=>r.device===device).map(r=>({...r,number})));}
export function regionKey(device,number,role='parent',contact){return originalRegions[number]?.find(r=>r.device===device&&r.role===role&&(contact===undefined||r.contact===contact))?.key??originalRegions[number]?.find(r=>r.device===device)?.key??'';}
export function ioKey(address){for(const [number,regions] of Object.entries(originalRegions)){const r=regions.find(x=>x.address===address);if(r)return r.key;}return '';}
export function regionViewport(region){const [x,y,w,h]=region.rect;return {cx:frame.left+(x+w/2)*frame.width,cy:(y+h/2)*frame.height,width:w*frame.width,height:h*frame.height};}
const SWITCHES=['disconnect','breaker','fuse','estop','guard','limit'];
export function originalState(r,s,p){
 if(!s||!p)return null;
 if(r.role==='io'){const on=p.inputs[r.address]??p.outputs[r.address];if(on===undefined){const level=p.analog[r.address];return level===undefined?null:{on:level>4.05,text:level.toFixed(1)+' mA'};}return {on,text:r.address+' '+(on?'ON':'OFF')};}
 if(r.role==='terminal')return null;
 const d=byId.get(r.device);
 // The delayed contacts of U4 stay closed for the hold time, which is what K10 and K15 follow.
 let on=r.role==='child'&&r.device==='+MC-U4'&&['57','58','67','68'].includes(r.contact)?p.active['+MC-K10']:p.active[r.device];
 if(on===undefined)return null;
 if(r.role==='child'&&r.term==='contact'){if(r.closed)on=!on;return {on,text:'접점 '+(on?'닫힘':'열림')};}
 if(SWITCHES.includes(d.kind))return {on,text:on?'닫힘':'열림'};
 return {on,text:(coil(d)?'코일 ':d.kind==='motor'?'모터 ':'')+(on?'ON':'OFF')};
}
