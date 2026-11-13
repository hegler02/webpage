import {drawingData} from './src/capsule-drawing-data.mjs';
import {originalRegions,originalState,frame} from './src/capsule-original-map.mjs';
export const originals=Object.fromEntries(drawingData.sheets.map(s=>[s.number,{name:s.name,title:s.title,url:new URL(`./education/capsule/original-${s.number}.webp`,import.meta.url).href}]));
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function originalDrawing(n,selected='',occurrence='',simulation,status){
 const {left,width,height}=frame;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 760" role="group" aria-label="원본 ${n}번 도면 · 연결된 기호 선택"><rect width="1000" height="760" fill="white"/><image href="${originals[n].url}" x="0" y="0" width="1000" height="760" preserveAspectRatio="xMidYMid meet"/><g>${originalRegions[n].map(r=>{const [x,y,w,h]=r.rect,live=originalState(r,simulation,status),label=r.label+' · '+r.device+(live?' · '+live.text:'');return `<g class="cv-original-symbol" data-device="${esc(r.device)}" data-original-region="${esc(r.key)}" data-role="${r.role}" role="button" tabindex="0" aria-pressed="${r.key===occurrence}" data-same-device="${r.device===selected}" ${live?`data-on="${live.on}"`:''} aria-label="${esc(label)}"><title>${esc(label)}</title><rect x="${(left+x*width).toFixed(2)}" y="${(y*height).toFixed(2)}" width="${(w*width).toFixed(2)}" height="${(h*height).toFixed(2)}"/></g>`;}).join('')}</g></svg>`;
}
