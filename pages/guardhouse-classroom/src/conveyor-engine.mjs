import {wires,routeLength} from './conveyor-project.mjs';
export const defaults=()=>({version:1,power:false,permit:false,run:false,estop:false,isolator:true,fault:'none',pallet:2.15,loaded:true,paused:false,speed:.45,motorKW:1.5,efficiency:.85,pf:.8,checks:{},evidence:{},lesson:{}});
export function restore(raw){const s=defaults();if(!raw||raw.version!==1)return s;for(const k of ['motorKW','efficiency','pf','speed'])if(Number.isFinite(raw[k]))s[k]=raw[k];s.motorKW=Math.max(.1,Math.min(2, s.motorKW));s.efficiency=Math.max(.5,Math.min(1,s.efficiency));s.pf=Math.max(.5,Math.min(1,s.pf));s.speed=Math.max(.1,Math.min(.8,s.speed));for(const k of ['checks','evidence','lesson'])if(raw[k]&&typeof raw[k]==='object')s[k]={...raw[k]};return s;}
export function evaluate(s){
 const blocked=[];if(!s.power)blocked.push({id:'-02Q1',text:'주 차단기가 꺼져 있습니다.'});if(s.estop)blocked.push({id:'-06S2',text:'비상정지가 눌려 있습니다.'});if(!s.permit)blocked.push({id:'-06K1',text:'운전 허가가 없습니다. 운전을 끄고 허가 복구를 누르세요.'});if(!s.run)blocked.push({id:'-07S1',text:'운전 선택 스위치가 꺼져 있습니다.'});if(s.fault==='wire')blocked.push({id:'-07K1',text:'코일로 가는 제어 배선이 끊겨 있습니다.'});
 const coil=blocked.length===0,motor=coil&&s.isolator,physical=s.loaded&&Math.abs(s.pallet-1.5)<.33,station=s.loaded&&Math.abs(s.pallet+1.5)<.33;
 const inputs={'I:001/00':s.power&&(s.fault==='sensor-on'||(s.fault!=='sensor-off'&&physical)),'I:001/01':s.power&&station,'I:001/07':s.power&&coil};
 return {coil,motor,feedback:inputs['I:001/07'],inputs,physical,station,blocked,
 reason:blocked[0]?.text??(!s.isolator?'코일과 보조접점은 동작하지만 현장 개폐기가 열려 모터는 정지합니다.':s.paused?'전기 연결은 유지됩니다. 관찰을 위해 시간만 일시정지했습니다.':'운전 허가와 선택 스위치가 연결되어 접촉기가 붙고 모터가 회전합니다.'),
 active:{'-02Q1':s.power,'-02F1':s.power,'-03T2':s.power,'-06K1':s.permit&&s.power&&!s.estop,'-07S1':s.run,'-06S2':s.estop,'-07K1':coil,'-07H5':coil,'-02Q2':s.isolator,'-02M1':motor,'CV1':motor,'PLC1':s.power,'-09B1':inputs['I:001/00'],'-09B2':inputs['I:001/01']}};
}
export function act(s,type,value){
 const before=evaluate(s);
 if(type==='power'){s.power=!s.power;s.permit=false;s.run=false;}
 else if(type==='run')s.run=!s.run;
 else if(type==='estop'){s.estop=!s.estop;s.permit=false;if(s.estop&&before.motor)s.evidence.emergency=true;}
 else if(type==='reset'){if(s.power&&!s.estop&&!s.run&&s.fault!=='wire'){s.permit=true;if(s.evidence.emergency)s.evidence.recovered=true;}}
 else if(type==='isolator'){s.isolator=!s.isolator;if(!s.isolator&&evaluate(s).coil)s.evidence.isolated=true;}
 else if(type==='fault'){s.fault=['none','wire','sensor-on','sensor-off'].includes(value)?value:'none';if(s.fault==='wire'){s.permit=false;s.evidence.broken=true;}if(s.fault.startsWith('sensor'))s.evidence.sensorFault=true;}
 else if(type==='load'){s.pallet=2.15;s.loaded=true;}
 else if(type==='pause')s.paused=!s.paused;
 else if(type==='position'){s.pallet=Math.max(-2.15,Math.min(2.15,Number(value)||0));s.loaded=true;}
 return evaluate(s);
}
export function tick(s,dt){if(!Number.isFinite(dt)||dt<=0||s.paused)return false;const p=evaluate(s);if(!p.motor||!s.loaded)return false;s.pallet-=Math.min(dt,.1)*s.speed;if(s.pallet< -2.55){s.loaded=false;s.pallet=-2.55;}return true;}
export function calculations(s){
 const watts=s.motorKW*1000,input=watts/s.efficiency,current=input/(Math.sqrt(3)*380*s.pf),route=wires.filter(w=>w.role==='power').reduce((n,w)=>n+routeLength(w),0),rho=.0175,drop=Math.sqrt(3)*current*rho*route/2.5*s.pf;
 return [
 {id:'current',title:'모터에 필요한 전류',why:'모터의 축 출력과 전기 입력을 구분하고 3상 전류를 읽습니다.',formula:'I = P출력 / (√3 × V × η × cosφ)',substitution:`${watts.toFixed(0)} / (√3 × 380 × ${s.efficiency} × ${s.pf}) = ${current.toFixed(2)} A`,symbols:'P출력: 축 출력 W · V: 선간전압 V · η: 효율 · cosφ: 역률 · I: 선전류 A',theory:'평형 3상 유효전력 P입력 = √3 VI cosφ, 효율 η = P출력/P입력을 함께 정리합니다. 정격 운전의 수업값이며 기동전류와 보호 협조는 별도입니다.',target:'-02M1',term:'motor',value:current},
 {id:'length',title:'배선의 실제 경로 길이',why:'회로도의 선 길이와 공간에서 시공하는 길이는 다릅니다.',formula:'ℓ = Σ √(Δx² + Δy² + Δz²)',substitution:`동력 경로 W01~W06 합계 = ${route.toFixed(2)} m`,symbols:'ℓ: 한 경로 길이 m · Δx, Δy, Δz: 두 점의 좌표 차이 m · Σ: 구간 합',theory:'공간의 두 점 사이 거리를 피타고라스 정리로 구한 후 모든 구간을 더합니다. 같은 3D 좌표를 재료·수량에도 사용합니다. 단자 여유는 제외합니다.',target:'X1',term:'wire',value:route},
 {id:'drop',title:'동력 배선의 전압강하',why:'전류가 흐를 때 전선의 저항으로 전압이 얼마나 낮아지는지 비교합니다.',formula:'ΔV ≈ √3 × I × ρ × ℓ / A × cosφ',substitution:`√3 × ${current.toFixed(2)} × 0.0175 × ${route.toFixed(2)} / 2.5 × ${s.pf} = ${drop.toFixed(3)} V (${(drop/380*100).toFixed(3)}%)`,symbols:'ρ: 20 °C 구리 저항률 Ω·mm²/m · A: 도체 단면적 mm² · ℓ: 편도 경로 m · ΔV: V',theory:'평형 3상 회로의 저항 성분 근사입니다. 리액턴스·온도 상승·기동 시 강하는 생략합니다. 이 수치만으로 전선이나 차단기의 적합성을 판정하지 않습니다.',target:'X1',term:'voltage-drop',value:drop},
 {id:'transformer',title:'제어용 변압기 용량 읽기',why:'코일과 표시등에 공급할 전원의 크기를 VA로 비교합니다.',formula:'S부하 = Σ S기구, I2 = S부하 / V2',substitution:'접촉기 유지 12 VA + 허가 릴레이 4 VA + 표시등 2 VA = 18 VA; 18 / 120 = 0.15 A',symbols:'S: 피상전력 VA · V2: 2차 전압 V · I2: 2차 전류 A',theory:'전압과 전류 실효값의 곱이 피상전력입니다. 수업 선정 변압기는 100 VA입니다. 이 합계는 정상 유지 상태이며 코일 투입 순간의 큰 부하는 별도 검토합니다.',target:'-03T2',term:'transformer',value:.15},
 {id:'travel',title:'팔레트 이동 시간',why:'전기 신호와 기계의 이동 시간을 연결합니다.',formula:'t = d / v',substitution:`감지기 사이 3.00 / ${s.speed.toFixed(2)} = ${(3/s.speed).toFixed(2)} s`,symbols:'d: 거리 m · v: 벨트 속도 m/s · t: 시간 s',theory:'일정한 속도의 운동을 사용합니다. 가속·감속·벨트 미끄러짐을 생략한 수업 모형입니다. 모터 출력값 변경이 벨트 속도를 자동으로 바꾸지는 않습니다.',target:'CV1',term:'conveyor',value:3/s.speed}
 ];
}
export function csv(rows){const cell=v=>'"'+String(v??'').replaceAll('"','""')+'"';return '\uFEFF'+[['기기/경로','품명','규격','수량','단위','도면','산출 설명'],...rows.map(r=>[r.id,r.name,r.spec,r.quantity,r.unit,r.sheet,r.note])].map(r=>r.map(cell).join(',')).join('\r\n');}
