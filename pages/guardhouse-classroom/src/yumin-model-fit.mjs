// Furniture, the glass pavilions and the approach of the Yumin model. Called by yuminModel with its element helpers.
import {B1,IN,Q,ARM,OUT,colors,notes,rect,turn} from './yumin-model.mjs';
export function fitOut({add,box}){
 const fur=(id,name,x0,y0,x1,y1,z0,z1,color,extra={})=>box(id,name,x0,y0,x1,y1,z0,z1,'furniture',color,'guess','M',{note:notes.furniture,...extra});
 const at=(id,name,x,y,w,d,z,h,color,extra)=>fur(id,name,x-w/2,y-d/2,x+w/2,y+d/2,z,z+h,color,extra);

 // 제1전시실 영감의 방: nine plinths under the slit of light, a bench by the north wall.
 let n=0;for(const x of [6.2,9,11.8])for(const y of [6.2,9,11.8])at('plinth-ne-'+(++n),'전시대',x,y,.6,.6,B1,1.05,'plinth');
 at('bench-ne','긴 의자',8.4,13.4,2.4,.5,B1,.45,'wood');
 // 제3전시실 아르누보 전성기의 방: wall cases and six plinths.
 n=0;for(const x of [6.4,9.6])for(const y of [-6,-9,-12])at('plinth-se-'+(++n),'전시대',x,y,.6,.6,B1,1.05,'plinth');
 at('case-se-1','벽 진열장',13.5,-6.2,.7,3.2,B1,2,'plinth');at('case-se-2','벽 진열장',13.5,-11,.7,3.2,B1,2,'plinth');
 at('bench-se','긴 의자',9,-13.4,2.4,.5,B1,.45,'wood');
 // 제2전시실 명작의 방: one piece in the middle of the round room and four around it.
 at('showpiece','가운데 전시대',0,0,1.1,1.1,B1,1.1,'plinth');
 [[3.4,0],[-3.4,0],[0,3.4],[0,-3.4]].forEach(([x,y],i)=>at('plinth-round-'+(i+1),'전시대',x,y,.5,.5,B1,1.15,'plinth'));
 // 지하 전실: reception by the entrance and benches in the arms.
 at('desk-info','안내대',1.55,11.2,.8,2.6,B1,1.05,'wood');
 at('bench-east','긴 의자',11,-1.9,2.4,.5,B1,.45,'wood');at('bench-south','긴 의자',-1.9,-10.5,.5,2.4,B1,.45,'wood');
 // 직원실과 기계실.
 at('desk-staff','직원 책상',-12.6,-4.4,1.6,.8,B1,.74,'wood');at('desk-staff-2','직원 책상',-12.6,-6.6,1.6,.8,B1,.74,'wood');
 // 1층 제4전시실 램프의 방: lit lamps on low plinths.
 n=0;for(const x of [-11.6,-8.4,-5.2])for(const y of [-5.6,-8.4,-11.2])at('lampstand-'+(++n),'램프 전시대',x,y,.55,.55,0,.9,'plinth');
 // 1층 휴게 라운지와 홀.
 [[-9.6,11.6],[-7,11.6],[-4.6,11.6]].forEach(([x,y],i)=>{at('table-'+(i+1),'탁자',x,y,.8,.8,0,.72,'wood');at('chair-'+(i*2+1),'의자',x-.85,y,.5,.5,0,.8,'leather',{face:1});at('chair-'+(i*2+2),'의자',x+.85,y,.5,.5,0,.8,'leather',{face:-1});});
 at('sofa','긴 소파',-6.6,4,3,.8,0,.75,'leather');
 at('desk-hall','1층 안내대',-9,0,.8,2.2,0,1.05,'wood');

 // A square glass pavilion: pad, roof, four glass faces and slim steel posts. deg turns it about its centre.
 const pavilion=(id,name,cx,cy,s,h,deg,glass,note,basis)=>{
  const sq=(x0,y0,x1,y1)=>turn(rect(x0,y0,x1,y1),cx,cy,deg),a=s/2,g=.012,f=.04;
  add(id+'-pad',name+' 바닥',sq(cx-a-.3,cy-a-.3,cx+a+.3,cy+a+.3),0,.15,'floor','concrete',basis,'K',{note});
  add(id+'-roof',name+' 지붕',sq(cx-a-.25,cy-a-.25,cx+a+.25,cy+a+.25),h-.22,.22,'roof','steel',basis,'K',{note});
  [['s',cx-a,cy-a-g,cx+a,cy-a+g],['n',cx-a,cy+a-g,cx+a,cy+a+g],['w',cx-a-g,cy-a,cx-a+g,cy+a],['e',cx+a-g,cy-a,cx+a+g,cy+a]].forEach(([k,x0,y0,x1,y1])=>add(id+'-glass-'+k,name+' 유리',sq(x0,y0,x1,y1),.15,h-.37,'window-glass',glass,basis,'K',{note}));
  const m=Math.round(s/1.5);
  for(let i=0;i<=m;i++){const p=-a+s*i/m;for(const [k,x,y] of [['s',cx+p,cy-a],['n',cx+p,cy+a],['w',cx-a,cy+p],['e',cx+a,cy+p]]){if((k==='w'||k==='e')&&(i===0||i===m))continue;
   add(id+'-post-'+k+i,'강철 창틀',sq(x-f,y-f,x+f,y+f),.15,h-.37,'frame','steel',basis,'K',{context:true});}}
 };
 pavilion('annex-ne','북동 별관',OUT+2.8,OUT+2.8,4.2,3.4,0,'frosted',notes.annex,'guess');
 pavilion('annex-se','남동 별관',OUT+2.8,-OUT-2.8,4.2,3.4,0,'frosted',notes.annex,'guess');
 pavilion('annex-sw','남서 별관',-OUT-2.8,-OUT-2.8,4.2,3.4,0,'frosted',notes.annex,'guess');
 pavilion('ticket','티켓 센터',-13,-56.5,9,3.6,-30,'glass',notes.ticket,'photo');
 at('desk-ticket','매표대',-13,-56.5,2.6,.8,.15,1.05,'wood');

 // The approach: a diagonal path from the ticket centre meets the north-south axis, then runs straight to the stone gate.
 const site=(id,name,pts,z0,h,kind,color,extra={})=>add(id,name,pts.map(p=>p.map(v=>Math.round(v*1000)/1000)),z0,h,kind,color,'guess','K',{group:'site',context:true,...extra});
 const d=[.5,.866],nrm=[.866,-.5],p0=[-10.5,-52.17],p1=[0,-34],w=1.3;
 site('path-diagonal','돌의 정원 길',[[p0[0]+nrm[0]*w,p0[1]+nrm[1]*w],[p1[0]+nrm[0]*w,p1[1]+nrm[1]*w-.75],[p1[0]-nrm[0]*w,p1[1]-nrm[1]*w+.75],[p0[0]-nrm[0]*w,p0[1]-nrm[1]*w]],0,.05,'paving','paving');
 site('path-axis','진입 축 길',rect(-w,-34.8,w,-OUT-.8),0,.05,'paving','paving');
 site('parking','주차장 (9대)',turn(rect(-39,-66,-16,-60),-27.5,-63,-30),0,.04,'paving','paving');
 site('drive','진입 도로',turn(rect(-60,-72.5,-10,-67.5),-27.5,-63,-30),0,.04,'paving','paving');
 // Gardens walled with low basalt 돌담, open toward the axis path.
 const garden=(id,name,x0,y0,x1,y1,open)=>{
  site(id,name,rect(x0,y0,x1,y1),0,.03,'finish','green',{note:notes.garden});
  const t=.5,h=1.2,side={s:[x0,y0,x1,y0+t],n:[x0,y1-t,x1,y1],w:[x0,y0,x0+t,y1],e:[x1-t,y0,x1,y1]};
  for(const k of Object.keys(side))if(k!==open)site(id+'-wall-'+k,name+' 돌담',rect(...side[k]),0,h,'stone','basalt',{note:notes.garden});
 };
 garden('garden-woman','여인의 정원',-15,-33,-3,-22,'e');
 garden('garden-wind','바람의 정원',3,-33,15,-22,'w');
 // 돌의 정원: standing stones beside the diagonal path.
 [[-9.5,-44.5,.9,1.5],[-6.2,-46.8,.7,1.1],[-11.6,-48.2,1.1,1.8],[-3.4,-41.6,.8,1.3],[-8.4,-40.6,.6,.9],[-1.2,-38.4,.9,1.6],[-13.2,-45.6,.7,1.2]].forEach(([x,y,s,h],i)=>
  site('stone-'+(i+1),'돌의 정원 선돌',turn(rect(x-s/2,y-s/3,x+s/2,y+s/3),x,y,i*37),0,h,'stone','basalt',{note:'돌의 정원에 세운 현무암입니다. 자리와 크기는 추정입니다.'}));
 void d;void IN;void Q;void ARM;void colors;
}
