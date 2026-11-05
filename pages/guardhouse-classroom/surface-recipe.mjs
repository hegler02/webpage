export const surfaceKinds=Object.freeze(['plaster','concrete','wood','tile','brick','marble']);
export const surfaceSize=512;
const browserCanvas=(w,h)=>{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;return canvas;};
// The build and offline fallback use the same deterministic material recipe.
export function drawSurface(kind,createCanvas=browserCanvas){
  const size=512,canvas=createCanvas(size,size);
  const g=canvas.getContext('2d'),height=createCanvas(size,size);const h=height.getContext('2d');
  let seed=903;const rand=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
  const bases={plaster:'#ece8df',concrete:'#b8b7ae',wood:'#bea07a',tile:'#dedbd4',brick:'#b48068',marble:'#deddd7'};
  g.fillStyle=bases[kind]??bases.plaster;g.fillRect(0,0,size,size);h.fillStyle='#b4b4b4';h.fillRect(0,0,size,size);
  for(let i=0;i<22000;i++){const x=rand()*size,y=rand()*size,v=rand();g.fillStyle=`rgba(${v>.5?'255,255,250':'70,65,55'},${.015+rand()*.035})`;g.fillRect(x,y,1+rand()*2,1+rand()*2);h.fillStyle=`rgb(${130+v*100},${130+v*100},${130+v*100})`;h.fillRect(x,y,1,1);}
  if(kind==='wood'){
   for(let row=0;row<4;row++){g.fillStyle=`rgba(75,46,23,${rand()*.09})`;g.fillRect(0,row*128,512,128);g.strokeStyle='#978166';g.lineWidth=1;g.beginPath();g.moveTo(0,row*128);g.lineTo(512,row*128);g.stroke();}
   for(let i=0;i<650;i++){const y=rand()*512;g.strokeStyle=`rgba(65,40,18,${.015+rand()*.07})`;g.lineWidth=.5;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(130,y+Math.sin(y)*5,370,y+Math.cos(y)*4,512,y);g.stroke();}
  }
  if(kind==='tile'||kind==='marble'){
   if(kind==='marble')for(let i=0;i<25;i++){g.strokeStyle=`rgba(105,108,100,${rand()*.12})`;g.lineWidth=rand()*2;g.beginPath();const y=rand()*512;g.moveTo(0,y);g.bezierCurveTo(120,y+100,300,y-120,512,y+35);g.stroke();}
   g.strokeStyle='#b1afa6';g.lineWidth=3;g.strokeRect(0,0,512,512);h.strokeStyle='#303030';h.lineWidth=4;h.strokeRect(0,0,512,512);
  }
  if(kind==='brick'){
   g.fillStyle='#cbc4b7';g.fillRect(0,0,512,512);h.fillStyle='#333';h.fillRect(0,0,512,512);
   for(let r=0;r<8;r++)for(let c=-1;c<4;c++){const x=c*170+(r%2)*85,y=r*64;g.fillStyle=`hsl(${17+rand()*7} 26% ${48+rand()*12}%)`;g.fillRect(x+3,y+3,164,58);h.fillStyle='#c7c7c7';h.fillRect(x+3,y+3,164,58);}
  }
  return [canvas,height];
}
