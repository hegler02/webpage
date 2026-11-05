// Quantities belong to design objects, never to meshes or visibility/power state.
export const quantityStatuses={model:'모형 물량',reference:'참고 수량',missing:'미산출'};
export const quantityGroups=['전기기구','소방기구','건축·마감','철근','배관 경로','설계 보완'];
export const polygonArea=points=>Math.abs(points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1];},0))/2;
export const lengthOf=points=>points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(...p.map((v,j)=>v-points[i][j])),0);
const netArea=(points,holes=[])=>polygonArea(points)-holes.reduce((s,h)=>s+polygonArea(h),0);
const bounds=points=>[0,1].map(i=>Math.max(...points.map(p=>p[i]))-Math.min(...points.map(p=>p[i])));
export function measureElement(e){
 if(!e.footprint?.length)return null;
 const plan=netArea(e.footprint,e.holes),[x,y]=bounds(e.footprint),thickness=Math.min(x,y);
 let face=e.profile?netArea(e.profile.points,e.profileHoles):Math.max(x,y)*e.height;
 let volume=e.profile?face*e.profile.depth:plan*e.height,surface=plan;
 if(e.surfaceMesh){
  surface=0;volume=0;
  for(const t of e.surfaceMesh.triangles){const [a,b,c]=t.map(i=>e.surfaceMesh.vertices[i]);
   const u=b.map((v,i)=>v-a[i]),v=c.map((n,i)=>n-a[i]);
   surface+=Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])/2;
   volume+=polygonArea([a,b,c])*((a[2]+b[2]+c[2])/3-e.base);
  }
 }
 if(![plan,face,volume,surface].every(v=>Number.isFinite(v)&&v>=-1e-9))throw new Error('잘못된 수량 형상: '+e.id);
 return {plan,face,volume,surface,thickness,length:Math.max(x,y,e.height)};
}

// Collinear partial overlaps are merged within an explicitly supplied network only.
// Crossing lines and coincident paths belonging to different circuits stay separate.
export function unionRouteLength(routes){
 const lines=new Map();
 for(const route of routes)for(let i=1;i<route.points.length;i++){
  const a=route.points[i-1],b=route.points[i],len=lengthOf([a,b]);if(len<1e-9)continue;
  let d=b.map((v,j)=>(v-a[j])/len);if(d.find(v=>Math.abs(v)>1e-8)<0)d=d.map(v=>-v);
  const dot=p=>p.reduce((s,v,j)=>s+v*d[j],0),ta=dot(a),tb=dot(b),origin=a.map((v,j)=>v-ta*d[j]);
  const key=[...d,...origin].map(v=>v.toFixed(7)).join(',');
  const list=lines.get(key)??[];list.push([Math.min(ta,tb),Math.max(ta,tb)]);lines.set(key,list);
 }
 let sum=0;for(const list of lines.values()){list.sort((a,b)=>a[0]-b[0]);let [start,end]=list[0];for(const [a,b]of list.slice(1)){if(a<=end+1e-8)end=Math.max(end,b);else{sum+=end-start;start=a;end=b;}}sum+=end-start;}return sum;
}
export function groupQuantities(items){
 const groups=new Map();
 for(const item of items){
  if(item.quantity!==null&&(!Number.isFinite(item.quantity)||item.quantity<0))throw new Error('잘못된 수량: '+item.name);
  const key=JSON.stringify([item.group,item.name,item.spec,item.unit,item.status,item.note]);
  let row=groups.get(key);if(!row){row={...item,key,quantity:item.quantity===null?null:0,members:[]};groups.set(key,row);}
  if(item.quantity!==null)row.quantity+=item.quantity;
  row.members.push({id:item.target,name:item.elementName??item.name,locationName:item.locationName,quantity:item.quantity,sheet:item.sheet,menu:item.menu,formula:item.formula});
 }
 return [...groups.values()].sort((a,b)=>quantityGroups.indexOf(a.group)-quantityGroups.indexOf(b.group)||a.name.localeCompare(b.name,'ko'));
}
export function quantityCSV(report){
 const lines=[['샘플','분류','재료·기구명','규격','수량','단위','산출 범위','대상 ID','대상명','도면','산식','비고']];
 for(const row of report.rows)for(const member of row.members)lines.push([report.sample,row.group,row.name,row.spec,member.quantity===null?'미산출':Number(member.quantity.toFixed(6)),row.unit,quantityStatuses[row.status],member.id,member.name,member.sheet,member.formula,row.note]);
 return encodeCSV(lines);
}

// A target/member search reports its own subtotal, without mutating the full design.
export function filterQuantityRows(rows,{query='',group='',scope='',target=null}={}){
 const q=query.trim().toLowerCase(),matches=values=>values.filter(Boolean).join(' ').toLowerCase().includes(q);
 return rows.flatMap(row=>{
  if(group&&row.group!==group||scope&&row.status!==scope)return [];
  const rowMatch=!q||matches([row.name,row.spec]);
  const members=row.members.filter(m=>(!target||m.id===target)&&(rowMatch||matches([m.id,m.name,m.locationName])));
  if(!members.length)return [];
  return [{...row,members,quantity:row.quantity===null?null:members.reduce((sum,m)=>sum+m.quantity,0),partial:members.length<row.members.length}];
 });
}
export function quantityLocations(row){
 const locations=new Map();
 for(const m of row.members){
  const key=JSON.stringify([m.id,m.sheet,m.menu]);let loc=locations.get(key);
  if(!loc){loc={...m,name:m.locationName??m.name,quantity:m.quantity===null?null:0,count:0};locations.set(key,loc);}
  loc.count++;if(m.quantity!==null)loc.quantity+=m.quantity;
 }
 return [...locations.values()].map(loc=>({...loc,formula:loc.count===1?loc.formula:loc.count+'개 산출 요소의 수량 합계 = '+Number(loc.quantity.toFixed(4))+' '+row.unit+' · 개별 산식은 산출 근거 CSV에서 확인'}));
}
export function quantitySummaryCSV(report){
 const lines=[['샘플','분류','재료·기구명','규격','수량','단위','산출 범위','연결 도면','비고']];
 for(const r of report.rows)lines.push([report.sample,r.group,r.name,r.spec,r.quantity===null?'미산출':Number(r.quantity.toFixed(6)),r.unit,quantityStatuses[r.status],[...new Set(r.members.map(m=>m.sheet).filter(Boolean))].join(' · '),r.note]);
 return encodeCSV(lines);
}

function encodeCSV(lines){
 const cell=v=>{let s=String(v??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 return '\uFEFF'+lines.map(r=>r.map(cell).join(',')).join('\r\n');
}
