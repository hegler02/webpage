// Still photographs stay intact; masks affect the shot, never invent anatomy.
export const shots=[
 {s:0,e:5,p:4,mode:'aperture',focus:[.49,.29],meaning:'Downward gaze appears before the full portrait'},
 {s:5,e:9,p:3,mode:'gaze',focus:[.50,.29],meaning:'Match the face position as the gaze meets the viewer'},
 {s:9,e:12,p:3,mode:'hero',text:'무대에\n서다.',meaning:'Reveal the full portrait and title'},
 {s:12,e:13.5,p:4,mode:'detail',focus:[.49,.69],meaning:'Hands preparing clothing'},
 {s:13.5,e:15,p:1,mode:'gaze',focus:[.47,.29],meaning:'Grip and forward gaze'},
 {s:15,e:18,p:2,mode:'triptych',meaning:'Distinct complete frames show three poses'},
 {s:18,e:21,p:2,mode:'hero',text:'한 번은.',meaning:'Pause after acceleration'},
 {s:21,e:23,p:4,mode:'quiet',meaning:'Reduce intensity before revealing the entry number'},
 {s:23,e:27,p:3,mode:'number',meaning:'Identify 314 explicitly as competition entry number'},
 {s:27,e:30,p:2,mode:'record',text:'AGE MASTERS',sub:'피지크 에이지 마스터즈 1위',meaning:'First competition result'},
 {s:30,e:32,p:0,mode:'gaze',focus:[.49,.29],meaning:'A held expression between the two results'},
 {s:32,e:35,p:1,mode:'record',text:'GRAND PRIX',sub:'그리고, 그랑프리 5위.',meaning:'Unexpected second stage'},
 {s:35,e:39,p:2,mode:'diptych',meaning:'Downward and direct gaze seen side by side'},
 {s:39,e:44,p:3,mode:'hero',text:'내가\n그 무대에.',meaning:'Return to the person, not the ranking'},
 {s:44,e:48,p:4,mode:'end',meaning:'Quiet portrait and final title with sound tail'}
];
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);},out=x=>1-(1-clamp(x))**4;
export function createCinemaRenderer(canvas,images,{reduced=false}={}){
 const ctx=canvas.getContext('2d'),mask=document.createElement('canvas'),mc=mask.getContext('2d');
 function photo(index,x,y,w,h,{focus=[.5,.34],zoom=1,contain=false,alpha=1}={}){
  const im=images[index],scale=(contain?Math.min(w/im.width,h/im.height):Math.max(w/im.width,h/im.height))*zoom,iw=im.width*scale,ih=im.height*scale;
  const ox=contain?x+(w-iw)/2:x+Math.min(0,Math.max(w-iw,w/2-iw*focus[0]));
  const oy=contain?y+(h-ih)/2:y+Math.min(0,Math.max(h-ih,h/2-ih*focus[1]));
  ctx.save();ctx.globalAlpha=alpha;ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(im,ox,oy,iw,ih);ctx.restore();
 }
 function text(value,x,y,size,{align='left',alpha=1,weight=400,leading=1.15,color='#fff'}={}){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.font=`${weight} ${size}px Portrait`;ctx.textAlign=align;ctx.textBaseline='top';value.split('\n').forEach((v,i)=>ctx.fillText(v,x,y+i*size*leading));ctx.restore();}
 function shade(w,h){const g=ctx.createLinearGradient(0,h*.5,0,h);g.addColorStop(0,'transparent');g.addColorStop(1,'rgba(0,0,0,.85)');ctx.fillStyle=g;ctx.fillRect(0,h*.5,w,h*.5);}
 return function render(t,{poster=false}={}){
  const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio,2),w=r.width,h=r.height,narrow=w/h<1.1;
  if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}
  ctx.setTransform(d,0,0,d,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);
  if(poster){photo(4,0,0,w,h,{focus:[.5,.34]});return;}
  const c=shots.find(c=>t>=c.s&&t<c.e)||shots.at(-1),dt=t-c.s,u=clamp(dt/(c.e-c.s)),enter=reduced?1:out(dt/.75),pad=narrow?24:w*.055;
  if(c.mode==='aperture'){
   const opening=reduced?1:smooth((dt-.3)/3.8),rh=h*(.14+.86*opening);ctx.save();ctx.beginPath();ctx.rect(0,h*.4-rh*.4,w,rh);ctx.clip();photo(c.p,0,0,w,h,{focus:c.focus,zoom:reduced?1:1.15-.15*smooth(u)});ctx.restore();
   text('오래 품었던 한 번.',pad,h*.83,narrow?20:28,{alpha:smooth((dt-2.4)/.7)});
  }else if(c.mode==='gaze'||c.mode==='detail'){
   photo(c.p,0,0,w,h,{focus:c.focus,zoom:reduced?1:1.07-.07*smooth(u)});
   if(c.mode==='gaze'&&c.s===5){shade(w,h);text('그리고, 시선을 들다.',pad,h*.84,narrow?20:28,{alpha:smooth((dt-1.4)/.7)});}
  }else if(c.mode==='hero'){
   const pw=narrow?w:w*.64,px=narrow?0:w*.36;
   ctx.save();ctx.beginPath();ctx.rect(px+(1-enter)*pw,0,pw*enter,h);ctx.clip();photo(c.p,px,0,pw,h,{contain:!narrow,focus:[.5,.4]});ctx.restore();
   if(narrow)shade(w,h);
   const size=narrow?Math.min(w*.14,58):Math.min(w*.09,112),ty=narrow?h*.69:h*.24;
   ctx.save();ctx.beginPath();ctx.rect(0,ty,w,h-ty);ctx.clip();text(c.text,pad,ty+(reduced?0:(1-enter)*size*1.6),size,{weight:500});ctx.restore();
   if(!narrow)text('KIM JOONHO / PERSONAL FILM',pad,h*.82,12,{color:'#cacaca'});
  }else if(c.mode==='triptych'||c.mode==='diptych'){
   const ids=c.mode==='triptych'?[1,2,3]:[4,3],gap=narrow?5:12,cell=(w-gap*(ids.length-1))/ids.length;
   ids.forEach((id,j)=>{const delay=j*.13,arrival=reduced?1:out((dt-delay)/.65);ctx.save();ctx.beginPath();ctx.rect(j*(cell+gap),h*(1-arrival),cell,h*arrival);ctx.clip();photo(id,j*(cell+gap),0,cell,h,{contain:!narrow,focus:[.5,.4]});ctx.restore();});
   if(c.mode==='diptych'){shade(w,h);text('한 사람의, 서로 다른 순간.',pad,h*.86,narrow?18:26,{alpha:enter});}
  }else if(c.mode==='quiet'){
   photo(c.p,0,0,w,h,{focus:[.5,.30],alpha:.35});text('2025 WNGP',w/2,h*.42,narrow?24:40,{align:'center'});text('의정부 · 첫 출전',w/2,h*.56,narrow?16:21,{align:'center',color:'#cacaca'});
  }else if(c.mode==='number'){
   // Compose offscreen so the initial black canvas cannot fill the glyph mask.
   mask.width=Math.round(w*d);mask.height=Math.round(h*d);mc.setTransform(d,0,0,d,0,0);mc.clearRect(0,0,w,h);mc.font=`500 ${w*(narrow?.48:.40)}px Portrait`;mc.textAlign='center';mc.textBaseline='middle';mc.fillStyle='#fff';mc.fillText('314',w/2,h*.48);mc.globalCompositeOperation='source-in';const im=images[c.p],sc=Math.max(w/im.width,h/im.height);mc.drawImage(im,(w-im.width*sc)/2,(h-im.height*sc)*.25,im.width*sc,im.height*sc);mc.globalCompositeOperation='source-over';ctx.drawImage(mask,0,0,w,h);
   text('참가번호',w/2,h*.16,narrow?18:24,{align:'center'});text('그 무대에 선 나의 번호.',w/2,h*.78,narrow?18:24,{align:'center',alpha:enter});
  }else if(c.mode==='record'){
   photo(c.p,narrow?0:w*.42,0,narrow?w:w*.58,h,{contain:!narrow,focus:[.5,.3]});if(narrow)shade(w,h);
   text(c.text,pad,narrow?h*.69:h*.30,narrow?24:Math.min(w*.048,62),{weight:500,alpha:enter});text(c.sub,pad,narrow?h*.80:h*.47,narrow?18:25,{alpha:enter});
  }else{
   photo(c.p,0,0,w,h,{focus:[.5,.32],alpha:1-smooth((dt-.6)/3)});const a=smooth((dt-.8)/1.2);text('무대에 서다',w/2,h*.42,narrow?32:64,{align:'center',alpha:a});text('김준호',w/2,h*.61,narrow?18:22,{align:'center',alpha:a,color:'#cacaca'});
  }
  canvas.dataset.scene=String(shots.indexOf(c));canvas.dataset.time=t.toFixed(3);canvas.dataset.mode=c.mode;
 };
}
