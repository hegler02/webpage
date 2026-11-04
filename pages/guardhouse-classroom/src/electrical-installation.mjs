// Sample 1's authored embedded risers. No automatic inference from arbitrary CAD.
export const embeddedBoxes = {
 DB1:{host:'south-pier-1',center:[5.85,.10,1.545]},
 SW1:{host:'south-pier-1',center:[5.67,.10,1.245]},
 SW2:{host:'partition-43A',center:[4.50,.62,1.245]},
 SW3:{host:'partition-43D',center:[4.50,3,1.245]},
 SW4:{host:'partition-448',center:[2.50,2.9,1.245]}
};
export function embeddedEntry(device,height){
 const box=embeddedBoxes[device.id];
 return box?[device.pos,[...box.center],[box.center[0],box.center[1],height],[device.pos[0],device.pos[1],height]]:null;
}
export function embeddedHost(route,index){
 if(index>=1&&index<=3)return embeddedBoxes.DB1.host;
 if(embeddedBoxes[route.target]&&index>=route.points.length-3)return embeddedBoxes[route.target].host;
 return null;
}
export function pointAlong(points,ratio){
 if(ratio<=0||!Number.isFinite(ratio))return points[0];if(ratio>=1)return points.at(-1);
 const lengths=points.slice(1).map((p,i)=>Math.hypot(...p.map((v,k)=>v-points[i][k]))),total=lengths.reduce((a,b)=>a+b,0);
 let distance=Math.max(0,Math.min(1,ratio))*total;
 for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]||i===lengths.length-1)return points[i].map((v,k)=>v+(points[i+1][k]-v)*(lengths[i]?distance/lengths[i]:0));distance-=lengths[i];}
 return points[0];
}
export function lightingTour(electric,id='L01'){
 const light=electric.devices.find(d=>d.id===id&&d.kind==='light');if(!light)return null;
 const device=electric.devices.find(d=>d.id===light.switch),route=electric.routes.find(r=>r.target===id),control=electric.routes.find(r=>r.target===light.switch),panel=electric.devices.find(d=>d.kind==='panel');
 if(!device||!route||!control||!panel)return null;
 return {light,device,route,control,panel,steps:[
  {id:'panel',title:'분전반에서 시작',element:panel.id,point:panel.pos,term:'panel',text:`${light.circuit} 차단기를 통해 조명에 전원을 나눕니다. 분전반이나 차단기가 꺼지면 스위치를 켜도 불이 켜지지 않습니다.`},
  {id:'route',title:'전선관 경로 따라가기',element:light.id,point:pointAlong(route.points,.5),term:'conduit',text:'금빛 관이 선택한 조명까지의 실제 모델 경로입니다. 안내점은 길을 읽기 위한 표시이며 전자의 이동이나 전류 속도를 뜻하지 않습니다.'},
  {id:'switch',title:'벽 속 배관과 스위치',element:device.id,point:device.pos,term:'conduit',text:`${device.name} 뒤의 박스와 세로 배관을 살펴봅니다. L은 전원선, L′는 스위치가 연결하거나 끊는 조명 쪽 전선입니다.`},
  {id:'light',title:'조명에서 빛으로',element:light.id,point:light.pos,term:'load',text:`${light.name}은 ${light.watts} W의 전력을 사용합니다. 스위치를 조작하고 켜짐·꺼짐이 이 기구에 반영되는지 비교하세요.`},
  {id:'return',title:'돌아오는 길과 보호하는 길',element:light.id,point:pointAlong(route.points,.6),term:'ground',text:'조명의 정상 부하 전류는 L과 N으로 회로를 이룹니다. PE는 고장 시 보호를 위한 연결이며 정상 부하 전류의 귀로로 쓰지 않습니다. 교류는 방향이 주기적으로 바뀝니다.'}
 ]};
}
