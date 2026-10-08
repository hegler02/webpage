// Spatial grouping is a browsing aid; only graph edges assert relationships.
export const GALAXY={arms:4,radius:14,turns:1.35,coreRadius:1.6,desktopParticles:18000,mobileParticles:8000,fallbackParticles:420,backgroundParticles:900,flightEase:4,near:.1,far:180,zoomMin:6,zoomMax:65};
export const SECTORS=[{name:'음악과 장면',color:'#83bdff'},{name:'이야기와 세계',color:'#d4a5ff'},{name:'연구와 발견',color:'#6fe0db'},{name:'생각과 일상',color:'#ffd399'}];
export function hash(text){let h=2166136261;for(const c of text){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export function sector(node){
 if(['paper','topic'].includes(node.kind))return 2;
 const text=[node.id,node.title,...(node.tags||[])].join(' ').toLowerCase();
 if(/화산|hwasan|story|novel|무협|백운/.test(text))return 1;
 if(/audio|music|song|cinema|노래|음악|webtoon/.test(text))return 0;
 return 3;
}
export function layout(nodes){
 const groups=SECTORS.map(()=>[]),result=new Map();
 for(const n of nodes){if(n.kind==='creator')result.set(n.id,{position:[0,.35,0],sector:-1});else groups[sector(n)].push(n);}
 groups.forEach((group,arm)=>{
  group.sort((a,b)=>hash(a.id)-hash(b.id));
  group.forEach((n,i)=>{const t=(i+.8)/(group.length+1),r=3+Math.sqrt(t)*(GALAXY.radius-3),angle=arm*Math.PI*2/GALAXY.arms+t*GALAXY.turns*Math.PI;
   result.set(n.id,{sector:arm,position:[Math.cos(angle)*r,(hash(n.id)%1000/1000-.5)*1.8,Math.sin(angle)*r]});});
 });return result;
}
