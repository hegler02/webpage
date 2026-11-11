// Electrical and fire sheets for the Farnsworth sample: the power plan, the panel's branch diagram and the fire plan with its way out.
import {panel,feeder,requiredDetectors,fireDevices} from './src/farnsworth-project.mjs';
import {ink,target,frame,text,planView,housePlan,lit,number} from './farnsworth-plan-parts.mjs';

const tag=(x,y,value)=>'<text x="'+x+'" y="'+y+'" font-size="9" text-anchor="middle" fill="'+ink.text+'" pointer-events="none">'+value+'</text>';

export function powerPlan(sheet,id,{electric}){
 const v=planView(0,9.3,23,46,52),color=Object.fromEntries(electric.circuits.map(c=>[c.id,c.color]));
 const house='<clipPath id="fw-power"><rect x="40" y="52" width="560" height="220"/></clipPath><g clip-path="url(#fw-power)" opacity=".6">'+housePlan(v,id,{pick:false})+'</g>';
 const supply=v.line(feeder,ink.soft,{width:2,dash:'5 4'});
 const route=electric.routes.filter(r=>id===panel.id||r.target===id).map(r=>v.line(r.points,color[r.circuit],{width:id===panel.id?2.5:4})).join('');
 const devices=[electric.panel,...electric.devices].map(d=>{
  const [x,y]=d.pos,off=d.on===false,fill=off?ink.off:d.kind==='light'?ink.light:d.kind==='panel'?'#dbe6e8':'white',aria=target(d.id,d.name),cx=v.px(x),cy=v.py(y);
  if(d.kind==='socket')return '<circle '+aria+' cx="'+cx+'" cy="'+cy+'" r="6" '+lit(d,id,fill)+'/>'+tag(cx,cy-9,d.id);
  const below=d.kind==='heatpump',w=d.kind==='panel'?18:d.kind==='switch'?12:Math.max(below?18:6,d.size[0]*v.scale),h=d.kind==='panel'?10:d.kind==='switch'?10:Math.max(below?12:6,d.size[1]*v.scale);
  return '<rect '+aria+' x="'+(cx-w/2)+'" y="'+(cy-h/2)+'" width="'+w+'" height="'+h+'" rx="2" '+lit(d,id,below?'none':fill)+(below?' stroke-dasharray="5 3" pointer-events="all"':'')+'/>'+(d.kind==='light'?'':tag(cx,d.kind==='cooktop'?cy+3:cy-h/2-3,d.id));
 }).join('');
 const rows=electric.circuits.map((c,i)=>{
  const x=46+i%2*290,y=318+Math.floor(i/2)*52;
  return '<path d="M'+x+' '+y+'h34" stroke="'+c.color+'" stroke-width="5"/>'+text(x+46,y+5,c.id+' · '+c.name,{size:14,fill:ink.text})+text(x+46,y+24,c.breaker+' A · '+c.area+' mm² · '+number(c.watts)+' W · '+number(c.current)+' A');
 }).join('');
 return frame(sheet,house+supply+route+devices+text(46,298,'분기 회로',{size:13,fill:ink.text})+rows+
  text(46,416,'점선 장비는 바닥 아래에 매달려 있습니다. 기구를 누르면 분전반에서 오는 길을 그립니다.')+text(46,438,'벽이 없어 콘센트는 바닥에, 전등은 코어 위에 숨겨 천장을 비춥니다.',{size:13}));
}

export function circuitPlan(sheet,id,{electric,state}){
 const rows=electric.circuits.map((c,i)=>{
  const y=96+i*84,on=state?.breakers?.[c.id]!==false,line=on?c.color:ink.off,members=electric.devices.filter(d=>d.circuit===c.id);
  const chips=members.map((d,k)=>'<g '+target(d.id,d.name)+'><rect x="'+(250+k*40)+'" y="'+(y+10)+'" width="36" height="22" rx="3" '+lit(d,id,d.on===false?ink.off:'white')+'/><text x="'+(268+k*40)+'" y="'+(y+25)+'" font-size="11" text-anchor="middle" fill="'+ink.text+'">'+d.id+'</text></g>').join('');
  return '<path d="M150 '+y+'H190'+(on?'h24':'l22 -11m2 11')+'H610" stroke="'+line+'" stroke-width="4" fill="none"/><circle cx="190" cy="'+y+'" r="4" fill="'+line+'"/><circle cx="214" cy="'+y+'" r="4" fill="'+line+'"/>'+
   text(250,y-10,c.id+' · '+c.name+' · '+c.volts+' V '+(c.phase===3?'3상':'단상'),{size:14,fill:ink.text})+text(160,y+22,c.breaker+' A',{fill:ink.text})+text(160,y+38,on?'켜짐':'꺼짐',{fill:on?'#08734d':'#a03a2c'})+chips+
   text(250,y+48,c.area+' mm² · '+number(c.watts)+' W · '+number(c.current)+' A · 전압강하 '+c.percent.toFixed(2)+' %'+(c.pass?'':' · 다시 검토'),{fill:c.pass?ink.soft:'#a03a2c'});
 }).join('');
 return frame(sheet,'<g '+target(panel.id,panel.name)+'><rect x="46" y="70" width="104" height="330" rx="4" '+lit(panel,id,'#dbe6e8')+'/><text x="98" y="100" font-size="15" text-anchor="middle" fill="'+ink.text+'">'+panel.id+'</text><text x="98" y="120" font-size="11" text-anchor="middle" fill="'+ink.soft+'">분전반</text></g>'+rows+text(46,432,'차단기 정격 ≥ 부하 전류, 전선 허용전류 ≥ 차단기 정격이면 통과입니다.'));
}

const mark={smoke:'white',heat:'#f6d3a8',extinguisher:'#e8a08f'};
export function firePlan(sheet,id,{fire,paths}){
 const v=planView(-6.9,9.3,15.5,46,56),count=kind=>fireDevices.filter(d=>d.kind===kind).length;
 const lines=paths.map(p=>v.line(p.points,p.color,{width:p.width??3,dash:p.dash??''})).join('');
 const devices=fire.devices.map(d=>{
  const x=v.px(d.pos[0]),y=v.py(d.pos[1]),live=d.alarm&&d.on?'#e2553f':mark[d.kind],aria=target(d.id,d.name);
  return (d.kind==='extinguisher'?'<rect '+aria+' x="'+(x-4.5)+'" y="'+(y-5.5)+'" width="9" height="11" rx="1.5" '+lit(d,id,live)+'/>':'<circle '+aria+' cx="'+x+'" cy="'+y+'" r="'+(d.id===id?7:5)+'" '+lit(d,id,live)+'/>')+tag(x,y-10,d.id);
 }).join('');
 const legend=[['smoke','연기 감지기'],['heat','열 감지기'],['extinguisher','소화기'],['#d19129','경보음이 닿는 길'],['#c8452f','소화기까지'],['#08734d','피난 경로','6 4']].map(([k,name,dash],i)=>{
  const x=52+i%3*196,y=400+Math.floor(i/3)*18;
  return (i>2?'<path d="M'+(x-6)+' '+(y-4)+'h18" stroke="'+k+'" stroke-width="3"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>'+text(x+18,y,name):k==='extinguisher'?'<rect x="'+(x-4)+'" y="'+(y-9)+'" width="8" height="10" rx="1.5" fill="'+mark[k]+'" stroke="'+ink.line+'"/>'+text(x+12,y,name):'<circle cx="'+x+'" cy="'+(y-4)+'" r="5" fill="'+mark[k]+'" stroke="'+ink.line+'"/>'+text(x+12,y,name));
 }).join('');
 return frame(sheet,'<g opacity=".6">'+housePlan(v,id,{pick:false})+'</g>'+lines+devices+legend+
  text(46,438,'벽 없는 한 방이라 법이 요구하는 감지기는 '+requiredDetectors()+'개이고, 이 설계는 자리마다 하나씩 '+(count('smoke')+count('heat'))+'개를 답니다.',{size:13}));
}
