import {slabCalculation} from './learning-engine.mjs';
import {boxElement} from './teaching-equipment.mjs';

export const assemblies={
  wall:{name:'외곽 벽 패널',target:'north-5',sheet:'M-301',layers:[
    ['안쪽 도장 강판',.8,'#8eacaf','작업구역에서 보이는 매끈한 표면입니다.'],
    ['단열 심재',98.4,'#d7bc83','두 면재 사이를 채워 열의 이동을 줄입니다.'],
    ['바깥쪽 강판',.8,'#79929d','패널의 바깥 표면을 보호합니다.']]},
  floor:{name:'작업구역 바닥',target:'tile-5-4',sheet:'M-302',layers:[
    ['정전기 분산 마감',2,'#88afa8','전하가 쌓이는 것을 줄이기 위한 마감의 위치입니다.'],
    ['바닥 패널',38,'#bcc7c7','마감층과 구조 바닥 사이의 패널입니다.'],
    ['철근콘크리트 바닥판',210,'#95a5aa','바닥에 작용하는 힘을 지지부로 전달합니다.']]}
};
import {rebarSize} from './rebar-sizes.mjs';
export const slabDesign={span:2.4,thickness:210,cover:30,diameter:13,spacing:200,live:3,finish:1};
export const strip={bounds:[3.1,0,4.1,2.4],top:-.04};
export function baySlab(live=slabDesign.live){return slabCalculation({...slabDesign,live});}
export function stripBars(){
  const {diameter,cover,spacing,thickness}=slabDesign;
  const nominal=rebarSize(diameter).nominal,[x,y,right,back]=strip.bounds,edge=(cover+nominal/2)/1000;
  const z=strip.top-thickness/1000+edge, bars=[];
  for(let xx=x+spacing/2000;xx<right;xx+=spacing/1000)bars.push([[xx,y+edge,z],[xx,back-edge,z]]);
  for(let yy=y+spacing/2000;yy<back;yy+=spacing/1000)bars.push([[x+edge,yy,z+nominal/1000],[right-edge,yy,z+nominal/1000]]);
  return bars;
}
export function layerModel(key){
  const layers=assemblies[key].layers,floor=key==='floor';
  let cursor=floor?.68:1.15;
  return {name:assemblies[key].name,elements:layers.map(([name,mm,color],i)=>{
    const t=mm/1000;
    const bounds=floor?[-.6,-.4,.6,.4]:[-.6,cursor-t,.6,cursor];
    const item=boxElement('layer-'+i,name,bounds,floor?cursor-t:0,floor?t:.95,'fixture','sample',color);
    cursor-=t+.14;return item;
  })};
}
export function walkable(model,x,y){
  const r=.14;
  if(x<r||x>7.2-r||y<r||y>4.8-r)return false;
  return !model.elements.some(e=>{
    if(e.base>=1.80||e.base+e.height<=.15)return false;
    const [p,,q]=e.footprint;
    return x+r>p[0]&&x-r<q[0]&&y+r>p[1]&&y-r<q[1];
  });
}
