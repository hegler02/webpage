import {apartment,apartmentRoute} from './apartment-project.mjs';
export const fireDeviceLessons={
 smoke:{title:'연기감지기',text:'연기로 인한 변화를 감지해 경보 장치로 신호를 보냅니다. 시험 버튼은 연기 발생을 대신하는 수업 입력입니다.'},
 heat:{title:'열감지기',text:'열에 의한 변화를 감지합니다. 여기서는 주방 감지기의 시험 신호가 경보 장치에 도착하는 과정을 확인합니다.'},
 bell:{title:'세대 경보 장치',text:'감지 신호를 받아 사람에게 위험을 알립니다. 이 수업에서는 점등과 상태 변화로 경보를 확인하며 작동 시험에서는 경보 단계에서 소리가 나며 경보음을 끄거나 다시 켤 수 있습니다.'},
 emergency:{title:'휴대용비상조명등',text:'주전원이 끊겼을 때 어두운 공간을 살펴보도록 돕습니다. 이 수업에서는 주전원 꺼짐·예비전원 켜짐 조건에서 점등합니다.'},
 extinguisher:{title:'소화기',text:'초기 화재에 대응하는 기구입니다. 이 모형에서는 현관 근처의 보관 위치와 접근 통로를 찾습니다. ‘소화기 조작 시작’에서는 안전핀·조준·분사·좌우 쓸기를 체험합니다.'}
};
export function apartmentFireLesson(fire,id='AD1'){
 const detector=fire.devices.find(d=>d.id===id&&['smoke','heat'].includes(d.kind))??fire.devices.find(d=>d.kind==='smoke'),alarm=fire.devices.find(d=>d.kind==='bell');
 const route=apartmentRoute(detector);route[0]=alarm.pos;route[1]=[2.66,.35,alarm.pos[2]];
 const r=apartment.rooms.find(r=>r.id===detector.room),z=apartment.finishLevel+.04,tail=[[3,1.2],[1.3,1.2],[1.3,-.35]],door={bed1:.95,bed2:3.65,bed3:6.85}[r.id];
 const start=door?[[...r.spawn],[door,4.95],[door,3.8],...(r.id==='bed1'?[[3,3.8]]:[[door,3.2],[3,3.2]])]:r.id==='hall'?[[...r.spawn],[3,3.8]]:[[6,2.6],[6.8,2.6],[6.8,3.2],[3,3.2]];
 const escape=[...start,...tail].map(([x,y])=>[x,y,z]);
 return {detector,alarm,signal:route.reverse(),escape,
  steps:[
   {id:'detect',title:'1. 발생 위치 확인',target:detector.id,point:detector.pos,text:`${detector.name}의 시험 입력입니다. 선택한 감지기만 발생 위치로 강조합니다.`},
   {id:'signal',title:'2. 경보 신호 따라가기',target:alarm.id,point:alarm.pos,text:fire.powered?'주전원 또는 예비전원을 이용해 감지기에서 세대 경보 장치로 신호를 전달합니다.':'주전원과 예비전원이 모두 꺼져 있습니다. 입력이 있어도 경보를 동작시킬 전원이 없습니다.'},
   {id:'escape',title:'3. 현관까지 이동 경로',target:'room-entry',point:[1.3,1.2,1],text:`${r.name}에서 문과 통로를 거쳐 현관으로 이어집니다. 선은 이동 경로를 설명하는 표식입니다. 화재 위치와 연기 조건에 따른 실제 대피 판단을 자동으로 대신하지 않습니다.`}
  ]};
}
