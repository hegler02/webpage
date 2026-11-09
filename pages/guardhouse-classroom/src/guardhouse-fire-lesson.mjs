import {project} from './classroom-project.mjs';
export function guardhouseFireLesson(fire,id='SD01'){
 const detector=fire.devices.find(d=>d.id===id&&['smoke','heat','callpoint'].includes(d.kind))??fire.devices.find(d=>d.id==='SD01'),panel=fire.devices.find(d=>d.id==='FA01'),alarm=fire.devices.find(d=>d.id==='AL01');
 const roomId=({SD01:'guard',SD02:'storage',HD01:'pantry',MC01:'guard'})[detector.id],room=project.rooms.find(r=>r.id===roomId);
 const waypoints={guard:[[5.15,1.2],[5.05,.5]],storage:[[3.7,1.3],[4.05,1.3],[4.8,1.3],[5.05,1.3],[5.05,.5]],pantry:[[3.65,2.45],[4.9,2.45],[5.05,2.45],[5.05,.5]]};
 const escape=[...waypoints[roomId],[5.05,-.35]].map(p=>[...p,project.finishLevel+.04]);
 // Wires run above the ceiling in straight runs along the walls, then drop to each device.
 const h=2.65,wired=(a,b)=>[a,[a[0],a[1],h],[b[0],a[1],h],[b[0],b[1],h],b];
 const signal=[...wired(detector.pos,panel.pos),...wired(panel.pos,[panel.pos[0],alarm.pos[1],alarm.pos[2]]).slice(1,-1),[alarm.pos[0],alarm.pos[1],h],alarm.pos];
 return {detector,signal,escape,steps:[
  {title:'1. 감지·발신 위치',target:detector.id,text:detector.plain},
  {title:'2. 수신기와 경보 연결',target:panel.id,text:fire.alarm?'시험 입력을 수신기 FA01이 받아 경보 AL01에 전달합니다. 주황선은 천장 위로 지나는 유선 배선의 길을 단순하게 보여 줍니다.':'감지기나 발신기를 시험하면 수신기와 경보 연결을 따라갈 수 있습니다. 상용·예비전원이 모두 없으면 경보가 작동하지 않습니다.'},
  {title:'3. 출입구까지 이동 경로',target:'EX01',text:room.name+'에서 열린 문과 통로를 거쳐 출입구까지 이어집니다. 초록선은 동선을 설명하며, 실제 화재 상황의 대피 판단을 자동으로 대신하지 않습니다.'}
 ]};
}
