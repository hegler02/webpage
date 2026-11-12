// Electrical and fire sheets for the Salk sample: one bay's power plan, the panel's branch diagram and the court-floor fire plan.
import {W} from './src/salk-model.mjs';
import {panel,moduleBay,fireZones,sprinklerPlan} from './src/salk-project.mjs';
import {own,ink,box,target,frame,text,planView} from './salk-plan-parts.mjs';
import {plan,halo,lampInk,routeInk,legendInk,lampNote} from './masters-power.mjs';

const lit=(d,id,fill)=>'fill="'+(d.id===id?ink.pick:fill)+'" stroke="'+(d.id===id?ink.pickLine:ink.line)+'" stroke-width="'+(d.id===id?2.5:1)+'"';
const number=v=>v.toLocaleString('ko-KR',{maximumFractionDigits:1});

export function powerPlan(sheet,id,{electric,state}){
 const v=planView(29.8,20.8,18,46,48),b=moduleBay,color=Object.fromEntries(electric.circuits.map(c=>[c.id,c.color]));
 const floor='<rect x="'+v.px(29.8)+'" y="'+v.py(W)+'" width="'+9*18+'" height="'+W*18+'" fill="'+ink.far+'"/><rect x="'+v.px(b.x0)+'" y="'+v.py(b.y1)+'" width="'+(b.x1-b.x0)*18+'" height="'+(b.y1-b.y0)*18+'" fill="'+ink.slab+'" stroke="'+ink.edge+'"/>';
 const trusses=[b.x0,b.x1].map(x=>'<path d="M'+v.px(x)+' '+v.py(.22)+'V'+v.py(19.59)+'" stroke="'+ink.line+'" stroke-width="5" stroke-dasharray="9 5" opacity=".5"/>').join('');
 const glass=[.23,19.58].map(y=>'<path d="M'+v.px(29.8)+' '+v.py(y)+'H'+v.px(38.8)+'" stroke="'+ink.glass+'" stroke-width="3"/>').join('');
 const fittings=own.filter(e=>e.group==='module').map(e=>v.shape(e,id)).join('');
 const route=routeInk(electric,state,id,color).map(s=>v.line(s.route.points,s.color,{width:s.width,dash:s.dash})).join('');
 const devices=[electric.panel,...electric.devices].map(d=>{
  const [x,y]=d.pos,off=d.on===false,fill=off?ink.off:d.kind==='switch'?plan.on:d.kind==='panel'?(state?.power===false?ink.off:'#dbe6e8'):'white',aria=target(d.id,d.name);
  if(d.kind==='light')return (off?'':'<rect x="'+(v.px(x-d.size[0]/2)-6)+'" y="'+(v.py(y)-11)+'" width="'+(d.size[0]*18+12)+'" height="22" rx="11" fill="'+plan.halo+'" opacity=".3" pointer-events="none"/>')+
   '<rect '+aria+' x="'+v.px(x-d.size[0]/2)+'" y="'+(v.py(y)-4)+'" width="'+d.size[0]*18+'" height="8" rx="2" '+lampInk(d,id,ink)+'/>';
  if(d.kind==='socket')return '<circle '+aria+' cx="'+v.px(x)+'" cy="'+v.py(y)+'" r="6" '+lit(d,id,fill)+'/>';
  const upper=d.pos[2]>3.5,w=d.kind==='ahu'?54:d.kind==='fan'?22:16,h=d.kind==='ahu'?36:d.kind==='fan'?22:12;
  return '<rect '+aria+' x="'+(v.px(x)-w/2)+'" y="'+(v.py(y)-h/2)+'" width="'+w+'" height="'+h+'" rx="2" '+lit(d,id,upper?'none':fill)+(upper?' stroke-dasharray="5 3" pointer-events="all"':'')+'/>'+text(v.px(x),v.py(y)+4,d.id,{size:10,anchor:'middle',fill:ink.text});
 }).join('');
 const rows=electric.circuits.map((c,i)=>{
  const y=118+i*58,k=legendInk(state,c,ink);
  return '<path d="M262 '+y+'h34" '+k.stroke+' stroke-width="5"/>'+text(308,y+5,k.name,{size:15,fill:k.fill})+text(308,y+25,c.breaker+' A · '+c.area+' mm² · '+number(c.watts)+' W · '+number(c.current)+' A');
 }).join('');
 return frame(sheet,floor+trusses+glass+fittings+route+devices+text(262,84,'분기 회로',{size:13,fill:ink.text})+rows+
  text(262,368,'점선 장비는 위 설비층에 있습니다.')+text(262,390,'굵은 점선은 천장 위 트러스입니다.')+text(262,412,lampNote(electric,'열'),{fill:ink.text}));
}

export function circuitPlan(sheet,id,{electric,state}){
 const rows=electric.circuits.map((c,i)=>{
  const y=96+i*84,on=state?.breakers?.[c.id]!==false,line=on&&state?.power!==false?c.color:ink.off,members=electric.devices.filter(d=>d.circuit===c.id);
  const chips=members.map((d,k)=>'<g '+target(d.id,d.name)+'><rect x="'+(250+k*40)+'" y="'+(y+10)+'" width="36" height="22" rx="3" '+lit(d,id,d.on===false?ink.off:'white')+'/><text x="'+(268+k*40)+'" y="'+(y+25)+'" font-size="11" text-anchor="middle" fill="'+ink.text+'">'+d.id+'</text></g>').join('');
  return '<path d="M150 '+y+'H190'+(on?'h24':'l22 -11m2 11')+'H610" stroke="'+line+'" stroke-width="4" fill="none"/><circle cx="190" cy="'+y+'" r="4" fill="'+line+'"/><circle cx="214" cy="'+y+'" r="4" fill="'+line+'"/>'+
   text(250,y-10,c.id+' · '+c.name+' · '+c.volts+' V '+(c.phase===3?'3상':'단상'),{size:14,fill:ink.text})+text(160,y+22,c.breaker+' A',{fill:ink.text})+text(160,y+38,on?'켜짐':'꺼짐',{fill:on?'#08734d':'#a03a2c'})+chips+
   text(250,y+48,c.area+' mm² · '+number(c.watts)+' W · '+number(c.current)+' A · 전압강하 '+c.percent.toFixed(2)+' %'+(c.pass?'':' · 다시 검토'),{fill:c.pass?ink.soft:'#a03a2c'});
 }).join('');
 return frame(sheet,'<g '+target(panel.id,panel.name)+'><rect x="46" y="70" width="104" height="330" rx="4" '+lit(panel,id,state?.power===false?ink.off:'#dbe6e8')+'/><text x="98" y="100" font-size="15" text-anchor="middle" fill="'+ink.text+'">'+panel.id+'</text><text x="98" y="120" font-size="11" text-anchor="middle" fill="'+ink.soft+'">'+(state?.power===false?'전원 꺼짐':'분전반')+'</text></g>'+rows+text(46,432,'차단기 정격 ≥ 부하 전류, 전선 허용전류 ≥ 차단기 정격이면 통과입니다.'));
}

const mark={smoke:[3.4,'white'],sprinkler:[1.7,'#8fa7ad'],receiver:[6,ink.fire],callpoint:[4,'#e8a08f'],bell:[4,'#d9705c'],hydrant:[5,'#d9705c'],exit:[4,ink.exit],extinguisher:[3.4,'#e8a08f']};
export function firePlan(sheet,id,{fire,paths}){
 const v=planView(-2,28,7.4,28,52);
 const tint=['#eef4f6','#f6f1e6','#eef4ee'],zones=fireZones.map((z,i)=>'<rect x="'+v.px(z.bounds[0])+'" y="'+v.py(z.bounds[3])+'" width="'+(z.bounds[2]-z.bounds[0])*7.4+'" height="'+(z.bounds[3]-z.bounds[1])*7.4+'" fill="'+tint[i]+'" stroke="'+ink.edge+'" stroke-dasharray="5 4"/>'+text(v.px(z.bounds[0])+8,v.py(z.bounds[3])+18,z.name,{fill:ink.text})).join('');
 const building=own.filter(e=>{const c=box(e);return e.base<=.3&&c.z1>=.05&&c.y1>-14&&c.y0<28&&['wall','column','finish','parapet'].includes(e.kind);}).map(e=>v.shape(e,id)).join('');
 const walk=own.filter(e=>e.kind==='floor'&&Math.abs(e.base+.2)<.01&&e.group!=='lab').concat(own.filter(e=>/^walk2-/.test(e.id))).map(e=>v.shape(e,id,{pick:false})).join('');
 const lines=paths.map(p=>v.line(p.points,p.color,{width:p.width??3,dash:p.dash??''})).join('');
 const devices=fire.devices.map(d=>{
  const [r,fill]=mark[d.kind]??[3,'white'],x=v.px(d.pos[0]),y=v.py(d.pos[1]),live=d.alarm&&d.on&&d.kind!=='exit'?'#e2553f':fill,aria=target(d.id,d.name);
  return ['smoke','sprinkler'].includes(d.kind)?'<circle '+aria+' cx="'+x+'" cy="'+y+'" r="'+(d.id===id?r+2:r)+'" '+lit(d,id,live)+'/>':'<rect '+aria+' x="'+(x-r)+'" y="'+(y-r)+'" width="'+r*2+'" height="'+r*2+'" rx="1.5" '+lit(d,id,live)+'/>';
 }).join('');
 const legend=[['smoke','연기감지기'],['sprinkler','스프링클러'],['receiver','수신기'],['bell','발신기·경종·소화전'],['exit','유도등'],['extinguisher','소화기']].map(([k,name],i)=>{
  const x=46+i%3*196,y=392+Math.floor(i/3)*20,[r,fill]=mark[k];
  return (['smoke','sprinkler'].includes(k)?'<circle cx="'+x+'" cy="'+(y-4)+'" r="'+Math.max(3,r)+'" fill="'+fill+'" stroke="'+ink.line+'"/>':'<rect x="'+(x-4)+'" y="'+(y-8)+'" width="8" height="8" fill="'+fill+'" stroke="'+ink.line+'"/>')+text(x+12,y,name);
 }).join('');
 return frame(sheet,zones+walk+building+lines+devices+legend+text(46,438,'경계구역 하나는 600 m² 이하, 한 변 50 m 이하입니다. 스프링클러는 한 칸만 그렸고 한 층에 '+sprinklerPlan.floor+'개입니다.'));
}
