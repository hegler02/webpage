// Everything you can see in the capsule sorter room: the cabinet, the machine with its index dial, the operator station and every drawn device.
// Parts that never move are merged per material; parts that move are small groups driven by the same state the drawings show.
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {devices,byId} from './src/capsule-project.mjs';

const TAU=Math.PI*2,rad=d=>d*Math.PI/180;
const damp=(v,to,a)=>Math.abs(to-v)<.0005?to:v+(to-v)*a;
const smooth=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
const std=(color,metalness=0,roughness=.6,extra={})=>new T.MeshStandardMaterial({color,metalness,roughness,...extra});
const glow=c=>({on:new T.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:2.2,roughness:.4}),off:new T.MeshStandardMaterial({color:new T.Color(c).multiplyScalar(.3),roughness:.45})});
let seed=7;const rnd=()=>(seed=(seed*1664525+1013904223)>>>0)/4294967296;

function grainTexture(){
 const n=64,data=new Uint8Array(n*n*4);let s=3;
 for(let i=0;i<n*n;i++){s=(s*1664525+1013904223)>>>0;const v=150+(s>>>24)*.4;data.set([v,v,v,255],i*4);}
 const t=new T.DataTexture(data,n,n);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(7,7);t.needsUpdate=true;return t;
}
const grain=grainTexture();
const M={
 steel:std('#b9c3c6',.85,.34),frame:std('#8d999d',.7,.4),alu:std('#c9ced0',.75,.38),dark:std('#263c43',.35,.48),cream:std('#d9dcd6',.15,.45),paint:std('#e3e6e0',.2,.5),
 blue:std('#25576f',.45,.42),black:std('#222829',.1,.6),rubber:std('#15191a',0,.9),copper:std('#b66b36',.8,.25),brass:std('#c9a24a',.85,.3),yellow:std('#e8b630',.1,.5),
 red:std('#b52d24',.1,.45),green:std('#167e5e',.1,.5),white:std('#f1f2ee',0,.5),grey:std('#9aa3a2',.2,.55),lightgrey:std('#cfd3cf',.25,.5),zinc:std('#9babad',.72,.36),
 segment:std('#d4d9da',.9,.22),powder:std('#efe6d2',0,.9),module:std('#3a4347',.2,.5),core:std('#59636a',.6,.5),tube:std('#2f7fb0',0,.5),
 floor:std('#9aa5a1',0,.82,{roughnessMap:grain}),wall:std('#dfe3dd',0,.9),line:std('#e2b12c',0,.7),
 glass:new T.MeshPhysicalMaterial({color:'#c9e7ef',transparent:true,opacity:.17,roughness:.12,metalness:.05,depthWrite:false,side:T.DoubleSide}),
 clear:new T.MeshPhysicalMaterial({color:'#e6f1f2',transparent:true,opacity:.3,roughness:.16,depthWrite:false,side:T.DoubleSide}),
 puff:new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.35,depthWrite:false}),
 field:new T.MeshBasicMaterial({color:'#f0a03c',transparent:true,opacity:.55,depthWrite:false}),
 body:std('#f3f1ea',0,.35),cap:std('#c8442f',0,.35)
};
M.glass.userData.noPick=true;
const G={green:glow('#3ddc84'),orange:glow('#ff9a2e'),red:glow('#ff4b3a'),yellow:glow('#ffd23c'),white:glow('#f4f7ff')};
const dot=new T.SphereGeometry(1,10,8),tile=new T.BoxGeometry(1,1,1);

// Collects plain shapes and turns them into one mesh per material.
function kit(parent){
 const lists=new Map();
 const put=(g,m,x=0,y=0,z=0,rot)=>{if(g.index){const n=g.toNonIndexed();g.dispose();g=n;}if(rot)g.applyMatrix4(new T.Matrix4().makeRotationFromEuler(new T.Euler(rot[0],rot[1],rot[2])));g.translate(x,y,z);const l=lists.get(m);if(l)l.push(g);else lists.set(m,[g]);return k;};
 const k={put,
  box:(w,h,d,m,x,y,z,rot)=>put(new T.BoxGeometry(w,h,d),m,x,y,z,rot),
  rbox:(w,h,d,m,x,y,z,r=.008,rot)=>put(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w*.49,h*.49,d*.49)),m,x,y,z,rot),
  cyl:(r,h,m,x,y,z,axis='y',seg=18,top=r,rot)=>{const g=new T.CylinderGeometry(top,r,h,seg);if(axis==='x')g.rotateZ(-Math.PI/2);else if(axis==='z')g.rotateX(Math.PI/2);return put(g,m,x,y,z,rot);},
  ball:(r,m,x,y,z,sy=1)=>{const g=new T.SphereGeometry(r,14,10);g.scale(1,sy,1);return put(g,m,x,y,z);},
  ring:(R,r,m,x,y,z,axis='y',arc=TAU)=>{const g=new T.TorusGeometry(R,r,8,28,arc);if(axis==='y')g.rotateX(Math.PI/2);else if(axis==='x')g.rotateY(Math.PI/2);return put(g,m,x,y,z);},
  pipe:(pts,r,m)=>{const path=new T.CurvePath();for(let i=1;i<pts.length;i++)path.add(new T.LineCurve3(new T.Vector3(...pts[i-1]),new T.Vector3(...pts[i])));return put(new T.TubeGeometry(path,Math.max(8,pts.length*8),r,6),m);},
  hose:(pts,r,m)=>put(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p)),false,'catmullrom',.35),pts.length*10,r,8),m),
  done(){for(const [m,list] of lists){let g=list[0];if(list.length>1){g=mergeGeometries(list,false);for(const x of list)x.dispose();}const mesh=new T.Mesh(g,m);mesh.castShadow=mesh.receiveShadow=!m.transparent;if(m.userData.noPick)mesh.userData.noPick=true;parent.add(mesh);}lists.clear();}
 };
 return k;
}
const sub=(parent,x=0,y=0,z=0)=>{const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;};
function led(parent,x,y,z,r,pair,size){
 const m=new T.Mesh(size?tile:dot,pair.off);if(size)m.scale.set(...size);else m.scale.setScalar(r);m.position.set(x,y,z);parent.add(m);
 return v=>{const want=v?pair.on:pair.off;if(m.material!==want)m.material=want;};
}
function label(text,w,h){
 const c=document.createElement('canvas');c.width=512;c.height=Math.round(512*h/w);const x=c.getContext('2d');
 x.fillStyle='#f4f5ed';x.fillRect(0,0,c.width,c.height);x.fillStyle='#263c43';x.font=`bold ${Math.round(c.height*.56)}px Pretendard, sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(text,256,c.height/2,490);
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;
 return new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t}));
}
// An open-topped container turned by a about the vertical axis.
function tray(k,m,cx,y0,cz,w,h,d,a,t=.004){
 const p=(lx,lz)=>[cx+lx*Math.cos(a)+lz*Math.sin(a),cz-lx*Math.sin(a)+lz*Math.cos(a)],r=[0,a,0];
 k.box(w,t,d,m,cx,y0+t/2,cz,r);
 for(const s of[-1,1]){const [x,z]=p(s*w/2,0),[x2,z2]=p(0,s*d/2);k.box(t,h,d,m,x,y0+h/2,z,r).box(w,h,t,m,x2,y0+h/2,z2,r);}
}

// Index dial geometry shared by the drawing data and the picture: station i stands at 135 + 45 i degrees.
const DIAL=[.2,0],RING=.46,angle=i=>rad(135+45*i);
const at=(a,rho,t=0)=>[rho*Math.cos(a)+t*Math.sin(a),-rho*Math.sin(a)+t*Math.cos(a)];
const hole=n=>[.44+.04*Math.floor((n%8)/4),.119-.034*(n%4+4*Math.floor(n/8))];
const world=(a,rho,t=0)=>{const [x,z]=at(a,rho,t);return [DIAL[0]+x,DIAL[1]+z];};

export async function buildEquipment(scene,pause){
 const groups=new Map(),pickables=[],live=[];
 let doorOpen=false,doorAmount=0,baseForced=false,travel=0;
 const tag=(g,id)=>{g.userData.deviceId=id;groups.set(id,g);g.traverse(o=>{if(o.isMesh){o.userData.deviceId=id;if(!o.userData.noPick)pickables.push(o);}});};

 // Room: a workshop corner so the machine does not float in the dark.
 {
  const room=sub(scene),k=kit(room);
  k.box(16,.02,14,M.floor,-.2,-.01,.6).box(12.15,.12,.03,M.grey,1.725,.06,-2.36).box(.03,.12,10,M.grey,-4.29,.06,2.59).box(12.15,.008,.004,M.lightgrey,1.725,2.5,-2.368).box(.004,.008,10,M.lightgrey,-4.298,2.5,2.59);
  for(let x=-4;x<=7.7;x+=1.2)k.box(.008,5,.004,M.lightgrey,x-.2,2.5,-2.368);
  for(let z=-1.8;z<=7.5;z+=1.2)k.box(.004,5,.008,M.lightgrey,-4.298,2.5,z);
  k.box(4.26,.003,.06,M.line,.65,.002,-1.05).box(4.26,.003,.06,M.line,.65,.002,1.5).box(.06,.003,2.55,M.line,-1.45,.002,.225).box(.06,.003,2.55,M.line,2.75,.002,.225);
  k.box(.14,.06,.42,M.frame,-2.6,.03,-1.33).box(2.14,.06,.14,M.frame,-1.6,.03,-1.2).box(.14,.06,.52,M.frame,-.6,.03,-.94).box(.5,.04,.08,M.frame,1.52,.02,.6);
  // The two walls face into the room only, so turning the view behind them still shows the machine.
  for(const [w,x,z,turn] of[[12.15,1.725,-2.37,0],[10,-4.3,2.59,Math.PI/2]]){const m=new T.Mesh(new T.PlaneGeometry(w,5),M.wall);m.position.set(x,2.5,z);m.rotation.y=turn;m.receiveShadow=true;room.add(m);}
  // The door out of the room and what hangs on the wall.
  k.box(1.12,2.2,.06,M.grey,5.2,1.1,-2.36).box(.96,2.08,.04,M.cream,5.2,1.06,-2.335).box(.3,.5,.01,M.dark,5.2,1.5,-2.312).rbox(.03,.14,.05,M.steel,4.84,1.05,-2.3,.008);
  k.box(.22,.22,.006,M.red,2.9,1.55,-2.366).cyl(.07,.42,M.red,2.9,.78,-2.28,'y',16).cyl(.025,.09,M.black,2.9,1.03,-2.28,'y',10).box(.1,.04,.04,M.zinc,2.9,.98,-2.33);
  k.done();room.traverse(o=>{o.castShadow=false;});
  // Around the machine: the cable ladder that feeds the cabinet, a packing bench and the powder drums.
  const props=sub(scene),p=kit(props);
  p.box(7,.03,.03,M.zinc,-.1,2.75,-2.3).box(7,.03,.03,M.zinc,-.1,2.75,-2.02).box(.32,.66,.03,M.zinc,-2.6,2.43,-2.0);
  for(let x=-3.5;x<=3.31;x+=.4)p.box(.03,.02,.28,M.zinc,x,2.74,-2.16);
  for(let x=-3.4;x<=3.41;x+=1.7)p.box(.04,.04,.36,M.frame,x,2.7,-2.2).box(.04,.4,.04,M.frame,x,2.52,-2.35);
  for(const [z,r] of[[-2.24,.02],[-2.19,.016],[-2.14,.02],[-2.09,.014]])p.cyl(r,5.6,M.rubber,.2,2.77+r,z,'x',8);
  p.rbox(.7,.04,2,M.steel,-3.92,.9,1.6,.008).box(.64,.02,1.9,M.steel,-3.92,.26,1.6);
  for(const x of[-4.22,-3.62])for(const z of[.66,2.54])p.box(.04,.88,.04,M.steel,x,.44,z);
  p.box(.3,.2,.4,M.cream,-3.96,1.02,.95).box(.3,.2,.4,M.cream,-3.94,1.22,.97).box(.3,.2,.4,M.cream,-3.96,1.02,1.4).box(.3,.004,.05,M.grey,-3.94,1.322,.97).box(.3,.004,.05,M.grey,-3.96,1.122,1.4);
  p.rbox(.28,.05,.3,M.lightgrey,-3.9,.945,1.9,.01).rbox(.22,.012,.22,M.steel,-3.9,.978,1.9,.004).box(.1,.07,.02,M.dark,-3.9,.985,2.08);
  p.rbox(.3,.16,.4,M.blue,-3.92,1,2.36,.012).rbox(.3,.16,.4,M.blue,-3.92,.35,1.1,.012).rbox(.3,.16,.4,M.blue,-3.92,.35,1.6,.012).box(.3,.2,.4,M.cream,-3.94,.37,2.2);
  p.box(1.05,.14,1.2,M.blue,3.9,.07,-1.5);
  for(const x of[3.65,4.15])for(const z of[-1.76,-1.24])p.cyl(.23,.7,M.white,x,.49,z,'y',24).cyl(.24,.035,M.dark,x,.857,z,'y',24).cyl(.236,.02,M.zinc,x,.8,z,'y',24).cyl(.236,.02,M.zinc,x,.3,z,'y',24);
  p.done();
 }
 await pause();

 // Main control cabinet, drawn open-able so the mounting plate can be read like sheet P-901.
 const cabinet=sub(scene);
 const door=sub(cabinet,-3.15,0,-1.5);
 {
  const k=kit(cabinet);
  k.box(1.1,.1,.5,M.black,-2.6,.05,-1.75).box(1.1,2,.02,M.lightgrey,-2.6,1.1,-1.99).box(.02,2,.5,M.lightgrey,-3.14,1.1,-1.75).box(.02,2,.5,M.lightgrey,-2.06,1.1,-1.75).box(1.1,.02,.5,M.lightgrey,-2.6,2.09,-1.75).box(1.1,.02,.5,M.lightgrey,-2.6,.11,-1.75);
  k.box(1.02,1.9,.006,M.zinc,-2.6,1.1,-1.975);
  for(const y of[1.755,1.435,1.085]){k.box(.94,.06,.06,M.grey,-2.6,y,-1.942);for(let i=0;i<46;i++)k.box(.005,.036,.002,M.module,-3.05+i*.02,y+.006,-1.911);}
  for(const x of[-3.095,-2.105]){k.box(.05,1.62,.06,M.grey,x,1.2,-1.942);for(let i=0;i<78;i++)k.box(.03,.005,.002,M.module,x,.42+i*.02,-1.911);}
  k.box(.27,.012,.24,M.frame,-3.285,1.675,-1.87).box(.012,.14,.2,M.frame,-3.156,1.6,-1.87).box(.2,.012,.2,M.frame,-3.24,1.61,-1.87,[0,0,-.62]);
  for(const x of[-3,-2.2])k.ring(.028,.008,M.zinc,x,2.128,-1.75,'x').cyl(.012,.02,M.zinc,x,2.105,-1.75);
  for(let i=0;i<5;i++)k.cyl(.02,.03,M.black,-2.9+i*.15,.098,-1.62);
  k.done();
  const d=kit(door);
  d.rbox(1.1,2,.02,M.lightgrey,.55,1.1,.01,.006).box(1,.03,.02,M.grey,.55,1.95,-.012).box(1,.03,.02,M.grey,.55,.25,-.012).box(.03,1.7,.02,M.grey,1.04,1.1,-.012);
  d.rbox(.035,.16,.03,M.black,1.03,1.1,.035,.008).cyl(.02,.012,M.zinc,1.03,1.1,.026,'z').cyl(.014,.03,M.zinc,.02,1.7,.01).cyl(.014,.03,M.zinc,.02,.5,.01);
  for(let i=0;i<7;i++)d.box(.3,.006,.006,M.grey,.55,.22+i*.022,.022,[.5,0,0]);
  d.cyl(.07,.003,M.yellow,.55,1.52,.0215,'z',3).box(.012,.05,.002,M.black,.55,1.52,.0235).box(.24,.07,.003,M.white,.55,1.78,.0215);
  d.done();
  const name=label('주 제어반 +MC',.22,.055);name.position.set(.55,1.78,.0235);door.add(name);
 }
 tag(cabinet,'+MC-ENCLOSURE');
 await pause();

 // One small builder per kind of device; each is drawn around its own centre with the front toward +z.
 const screws=(k,xs,y,z,r=.004)=>{for(const x of xs)k.cyl(r,.004,M.zinc,x,y,z,'z',8);};
 const B={
  disconnect({k,d,w,h,dp,g}){
   const s=Math.min(w,h);
   k.rbox(w,h,dp*.66,M.cream,0,0,-dp*.17,.006).box(w*.92,h*.1,dp*.68,M.grey,0,h*.4,-dp*.17).box(w*.92,h*.1,dp*.68,M.grey,0,-h*.4,-dp*.17).rbox(w*.72,h*.56,dp*.08,M.yellow,0,0,dp*.2,.004);
   screws(k,[-w*.28,0,w*.28],h*.4,dp*.17);screws(k,[-w*.28,0,w*.28],-h*.4,dp*.17);
   const knob=sub(g,0,0,dp*.24),kk=kit(knob);kk.cyl(s*.2,dp*.1,M.red,0,0,dp*.05,'z',20).rbox(s*.14,s*.52,dp*.12,M.red,0,0,dp*.14,.004);kk.done();
   const on=d.id==='+MC-Q1'?st=>st.power:st=>!st.off[d.id];
   live.push((st,su,a)=>{knob.rotation.z=damp(knob.rotation.z,on(st)?0:-Math.PI/2,a);});
  },
  breaker({k,d,w,h,dp,g}){
   const n=Math.max(1,Math.round(w/.026)),xs=Array.from({length:n},(_,i)=>(i-(n-1)/2)*w/n);
   k.rbox(w,h,dp*.62,M.cream,0,0,-dp*.19,.004).rbox(w,h*.5,dp*.3,M.cream,0,0,dp*.2,.004).box(w*.8,h*.09,.002,M.white,0,h*.16,dp*.351);
   screws(k,xs,h*.42,dp*.12);screws(k,xs,-h*.42,dp*.12);
   const t=sub(g,0,0,dp*.33),tk=kit(t);tk.rbox(w*.78,h*.09,dp*.26,M.black,0,0,dp*.1,.003);tk.done();
   live.push((st,su,a)=>{t.rotation.x=damp(t.rotation.x,st.off[d.id]?.5:-.5,a);});
  },
  fuse({k,d,w,h,dp,g}){
   k.rbox(w,h,dp*.6,M.cream,0,0,-dp*.2,.004);screws(k,[0],h*.43,dp*.1);screws(k,[0],-h*.43,dp*.1);
   const c=sub(g,0,-h*.3,dp*.1),ck=kit(c);ck.rbox(w*.8,h*.6,dp*.36,M.module,0,h*.3,dp*.2,.004).box(w*.5,h*.2,.002,M.white,0,h*.34,dp*.381).cyl(w*.2,h*.42,M.white,0,h*.3,dp*.06);ck.done();
   live.push((st,su,a)=>{c.rotation.x=damp(c.rotation.x,st.off[d.id]?.9:0,a);});
  },
  supply({k,w,h,dp,g}){
   k.rbox(w,h,dp,M.zinc,0,0,0,.006).box(w*.92,h*.16,.006,M.green,0,-h*.38,dp*.5).box(w*.5,h*.2,.002,M.white,-w*.16,-h*.05,dp*.5+.001);
   for(let i=0;i<6;i++)k.box(w*.74,.004,.003,M.black,0,h*.42-i*.009,dp*.5);
   screws(k,[-2.5,-1.5,-.5,.5,1.5,2.5].map(i=>i*w*.14),-h*.38,dp*.5+.004);
   const l=led(g,w*.32,-h*.02,dp*.5+.002,.005,G.green);live.push((st,su)=>l(su.rails.vdc));
  },
  transformer({k,w,h,dp}){
   k.box(w*.86,h*.17,dp*.46,M.core,0,h*.3,0).box(w*.86,h*.17,dp*.46,M.core,0,-h*.3,0);
   for(const x of[-w*.345,0,w*.345])k.box(w*.17,h*.46,dp*.46,M.core,x,0,0);
   k.rbox(w*.43,h*.4,dp*.92,M.copper,0,0,0,.03).box(w*.44,h*.05,dp*.93,M.cream,0,h*.12,0).box(w*.44,h*.05,dp*.93,M.cream,0,-h*.12,0);
   k.box(w*.8,h*.09,dp*.3,M.cream,0,h*.44,dp*.2).box(w,h*.05,dp*.7,M.frame,0,-h*.41,0);
   screws(k,[-3,-1,1,3].map(i=>i*w*.1),h*.44,dp*.352);
  },
  relay({k,d,w,h,dp,g}){
   k.rbox(w,h,dp*.36,M.module,0,0,-dp*.32,.004).rbox(w*.84,h*.84,dp*.56,M.clear,0,0,dp*.14,.005).cyl(w*.2,dp*.34,M.copper,0,-h*.1,dp*.08,'z',14).box(w*.5,h*.1,dp*.36,M.zinc,0,h*.22,dp*.08).box(w*.1,h*.5,dp*.3,M.cream,w*.3,0,dp*.06);
   screws(k,[-w*.3,0,w*.3],h*.44,-dp*.13,.003);screws(k,[-w*.3,0,w*.3],-h*.44,-dp*.13,.003);
   const l=led(g,-w*.26,h*.3,dp*.43,.0035,G.green);live.push((st,su)=>l(su.active[d.id]));
  },
  contactor({k,d,w,h,dp,g}){
   k.rbox(w,h*.62,dp*.8,M.cream,0,0,-dp*.1,.006).rbox(w*.96,h*.19,dp*.62,M.module,0,h*.405,-dp*.19,.004).rbox(w*.96,h*.19,dp*.62,M.module,0,-h*.405,-dp*.19,.004).rbox(w*.5,h*.3,dp*.12,M.module,0,-h*.02,dp*.34,.004).box(w*.8,h*.07,.002,M.white,0,h*.24,dp*.301);
   screws(k,[-w*.3,0,w*.3],h*.405,dp*.12,.0055);screws(k,[-w*.3,0,w*.3],-h*.405,dp*.12,.0055);
   const tab=sub(g,0,-h*.02,dp*.41),tk=kit(tab);tk.rbox(w*.3,h*.1,dp*.06,M.white,0,0,0,.002);tk.done();
   const l=led(g,w*.36,h*.16,dp*.3+.002,.004,G.orange);
   live.push((st,su,a)=>{const on=!!su.active[d.id];tab.position.z=damp(tab.position.z,dp*(on?.37:.41),a);l(on);});
  },
  rack({k,w,h,dp}){k.rbox(w,h,dp,M.module,0,0,0,.004).box(w,.012,dp+.02,M.zinc,0,h*.5,.01).box(w,.012,dp+.02,M.zinc,0,-h*.5,.01);},
  plc({k,d,w,h,dp,g}){
   const n=+d.id.slice(-1),f=dp*.5;
   k.rbox(w,h,dp,M.module,0,0,0,.004).box(w*.86,h*.42,.004,M.black,0,h*.24,f).box(w*.3,h*.03,.006,M.grey,0,h*.47,f-.004);
   if(n===1){k.box(w*.8,h*.3,.008,M.cream,0,-h*.26,f);screws(k,[-w*.25,0,w*.25],-h*.26,f+.004);const l=led(g,0,h*.3,f+.003,.005,G.green);live.push((st,su)=>l(su.plc));}
   else if(n===2){k.cyl(w*.16,.012,M.zinc,0,-h*.12,f+.004,'z',14).box(w*.04,w*.24,.008,M.black,0,-h*.12,f+.012).box(w*.5,h*.14,.01,M.cream,0,-h*.34,f);
    const run=led(g,-w*.2,h*.34,f+.003,.004,G.green),ok=led(g,w*.2,h*.34,f+.003,.004,G.green),err=led(g,-w*.2,h*.22,f+.003,.004,G.red);live.push((st,su)=>{run(su.plc);ok(su.plc&&su.safe);err(st.fault!=='none'&&su.plc);});}
   else if(n<=6){
    k.box(w*.8,h*.4,.012,M.cream,0,-h*.24,f);for(let i=0;i<9;i++)screws(k,[-w*.22,w*.22],-h*.07-i*h*.042,f+.007,.0025);
    const base=`${n<5?'O':'I'}:${n+8}/`,key=n<5?'outputs':'inputs',pair=n<5?G.orange:G.green,set=[];
    for(let i=0;i<16;i++)set.push(led(g,(i<8?-1:1)*w*.2,h*.41-(i%8)*h*.047,f+.003,0,pair,[w*.18,h*.026,.003]));
    live.push((st,su)=>{for(let i=0;i<16;i++)set[i](su.plc&&su[key][base+String(i).padStart(2,'0')]);});
   }else{k.box(w*.8,h*.4,.012,M.cream,0,-h*.24,f);for(let i=0;i<5;i++)screws(k,[-w*.22,w*.22],-h*.08-i*h*.07,f+.007,.003);const set=[0,1,2,3].map(i=>led(g,0,h*.4-i*h*.08,f+.003,0,G.green,[w*.3,h*.026,.003]));live.push((st,su)=>{for(const l of set)l(su.plc);});}
  },
  drive({k,d,w,h,dp,g}){
   k.rbox(w,h,dp*.7,M.module,0,0,-dp*.15,.008).rbox(w*.92,h*.62,dp*.3,M.dark,0,h*.1,dp*.33,.01).box(w*.84,h*.16,dp*.16,M.cream,0,-h*.38,dp*.28);
   for(let i=0;i<9;i++)k.box(w*.04,h*.9,dp*.2,M.frame,(i-4)*w*.1,0,-dp*.42);
   for(let i=0;i<6;i++)k.box(w*.6,.005,.004,M.black,0,h*.47,dp*.1-i*.012);
   for(let i=0;i<6;i++)k.rbox(w*.1,w*.1,.006,M.grey,(i%3-1)*w*.16,-h*.02-Math.floor(i/3)*w*.15,dp*.482,.003);
   screws(k,[-2.5,-1.5,-.5,.5,1.5,2.5].map(i=>i*w*.12),-h*.38,dp*.362);
   const screen=led(g,0,h*.25,dp*.482,0,G.green,[w*.5,h*.1,.004]);live.push((st,su)=>screen(su.active[d.id]));
  },
  level({k,d,w,h,dp,g}){
   k.rbox(w,h,dp,M.cream,0,0,0,.006).box(w*.92,h*.13,.008,M.grey,0,h*.41,dp*.5).box(w*.92,h*.13,.008,M.grey,0,-h*.41,dp*.5).box(w*.6,h*.14,.002,M.white,0,-h*.12,dp*.5+.001).cyl(w*.09,.01,M.blue,-w*.2,h*.1,dp*.5+.004,'z',14).cyl(w*.09,.01,M.blue,w*.2,h*.1,dp*.5+.004,'z',14);
   screws(k,[-3,-1,1,3].map(i=>i*w*.1),h*.41,dp*.5+.006);screws(k,[-3,-1,1,3].map(i=>i*w*.1),-h*.41,dp*.5+.006);
   const p=led(g,-w*.3,h*.27,dp*.5+.002,.005,G.green),o=led(g,w*.3,h*.27,dp*.5+.002,.005,G.orange);live.push((st,su)=>{p(su.rails.v110);o(su.active[d.id]);});
  },
  safety({k,d,w,h,dp,g}){
   k.rbox(w,h,dp,M.yellow,0,0,0,.006).box(w*.92,h*.13,.008,M.grey,0,h*.41,dp*.5).box(w*.92,h*.13,.008,M.grey,0,-h*.41,dp*.5).box(w*.6,h*.2,.002,M.white,0,-h*.1,dp*.5+.001);
   screws(k,[-3,-1,1,3].map(i=>i*w*.1),h*.41,dp*.5+.006);screws(k,[-3,-1,1,3].map(i=>i*w*.1),-h*.41,dp*.5+.006);
   const key=d.id.endsWith('U4')?'u4':'u5',p=led(g,-w*.28,h*.24,dp*.5+.002,.006,G.green),a=led(g,0,h*.24,dp*.5+.002,.006,G.green),b=led(g,w*.28,h*.24,dp*.5+.002,.006,G.green);
   live.push((st,su)=>{p(su.rails.vdc||su.rails.v110);a(su[key]);b(su[key]);});
  },
  rail({k,w}){k.box(w,.026,.004,M.zinc,0,0,0).box(w,.005,.003,M.zinc,0,.0155,.003).box(w,.005,.003,M.zinc,0,-.0155,.003);for(let x=-w/2+.03;x<w/2;x+=.05)k.box(.018,.006,.001,M.module,x,0,.0026);},
  terminal({k,d,w,h,dp}){
   if(h>.1){k.rbox(w,h,dp,M.lightgrey,0,0,0,.012).rbox(w*.94,h*.94,.012,M.grey,0,0,dp*.5,.01).box(w*.5,h*.16,.002,M.white,0,h*.1,dp*.5+.007);for(const [x,y] of[[-1,-1],[1,-1],[-1,1],[1,1]])k.cyl(.008,.006,M.zinc,x*w*.41,y*h*.41,dp*.5+.007,'z',8);for(let i=0;i<4;i++)k.cyl(.016,.04,M.black,(i-1.5)*w*.2,-h*.5-.016,0).cyl(.02,.012,M.grey,(i-1.5)*w*.2,-h*.5-.004,0,'y',6);return;}
   const n=Math.max(4,Math.round(w/.012)),t=w/n;
   for(let i=0;i<n;i++){const x=(i-(n-1)/2)*t;k.rbox(t*.88,h,dp,i%5===4?M.grey:M.cream,x,0,0,.002).cyl(t*.26,.004,M.zinc,x,h*.3,dp*.5,'z',8).cyl(t*.26,.004,M.zinc,x,-h*.3,dp*.5,'z',8);}
   k.box(.006,h*1.05,dp*1.02,M.module,-w/2-.003,0,0).box(.006,h*1.05,dp*1.02,M.module,w/2+.003,0,0).box(w*.9,h*.16,.002,M.white,0,0,dp*.5+.001);
  },
  plug({k,w,h,dp}){const n=Math.max(4,Math.round(w/.016));k.rbox(w,h,dp*.8,M.green,0,0,-dp*.1,.004).rbox(w*.96,h*.5,dp*.3,M.green,0,-h*.2,dp*.35,.004);for(let i=0;i<n;i++)k.cyl(.0045,.004,M.zinc,(i-(n-1)/2)*w/n,h*.22,dp*.3,'z',8);},
  port({k,d,w,h,dp,g}){
   k.rbox(w*.7,h*.7,.006,M.zinc,0,0,-dp*.4,.004).cyl(w*.2,dp*.7,M.black,0,0,0,'z',16).ring(w*.2,.004,M.brass,0,0,dp*.2,'z').cyl(w*.14,.004,M.grey,0,0,dp*.36,'z',12);
   if(d.input){const l=led(g,w*.26,h*.26,-dp*.36,.004,G.orange);live.push((st,su)=>l(su.inputs[d.input]));}
  },
  outlet({k,w,h,dp}){k.rbox(w,h,dp*.3,M.cream,0,0,-dp*.3,.006).cyl(Math.min(w,h)*.34,dp*.3,M.white,0,0,-dp*.1,'z',20).cyl(Math.min(w,h)*.28,.004,M.module,0,0,dp*.05,'z',20);screws(k,[-w*.12,w*.12],0,dp*.052,.004);},
  motor({k,d,w,h,dp,g}){
   const up=d.id==='+M-M2',pump=d.id==='+M-M3',L=up?h:w,R=(up?Math.min(w,dp):Math.min(h,dp))/2,body=sub(g);if(up)body.rotation.z=-Math.PI/2;
   const b=kit(body),len=pump?L*.5:L*.66,x0=pump?-L*.2:-L*.02;
   b.cyl(R*.84,len,M.blue,x0,0,0,'x',24).cyl(R*.9,L*.05,M.frame,x0+len/2,0,0,'x',24).cyl(R*.9,L*.05,M.frame,x0-len/2,0,0,'x',24).cyl(R*.88,L*.14,M.black,x0-len/2-L*.09,0,0,'x',24).cyl(R*.5,.004,M.module,x0-len/2-L*.162,0,0,'x',16);
   for(let i=0;i<9;i++)b.cyl(R*.93,.004,M.blue,x0+(i-4)*len*.095,0,0,'x',20);
   if(up)b.cyl(R*1.1,.012,M.frame,x0+len/2+L*.04,0,0,'x',24);
   else{b.rbox(len*.36,R*.5,R*.9,M.blue,x0,R*.95,0,.008).cyl(R*.16,.02,M.black,x0+len*.2,R*.95,R*.46,'z',10);for(const s of[-1,1])b.box(len*.16,R*.16,R*2,M.blue,x0+s*len*.34,-R*.92,0);}
   if(pump){b.cyl(R*.98,L*.22,M.core,L*.36,0,0,'x',24).cyl(R*.7,L*.04,M.frame,L*.48,0,0,'x',20).cyl(R*.2,R*.5,M.frame,L*.36,R*1.1,0).cyl(R*.26,.014,M.zinc,L*.36,R*1.34,0,'y',6).cyl(R*.16,R*.4,M.frame,L*.36,0,R*1.05,'z');for(const s of[-1,1])b.box(L*.08,R*.16,R*2,M.core,L*.36+s*L*.07,-R*.92,0);b.box(L*.2,R*.5,R*.9,M.zinc,L*.15,0,0);}
   b.done();
   const shaft=sub(body,pump?L*.15:x0+len/2+L*.02),s=kit(shaft),sl=pump?L*.18:L*.3;
   s.cyl(R*.18,sl,M.steel,pump?0:sl/2,0,0,'x',14).cyl(R*.34,L*.07,M.zinc,pump?0:sl*.78,0,0,'x',8).box(L*.05,R*.1,R*.14,M.black,pump?0:sl*.4,R*.2,0);s.done();
   const key=up?'powder':pump?'vacuum':'motor';let speed=0;
   live.push((st,su,a,dt)=>{speed=damp(speed,su[key]?(up?9:14)*(.4+(up?st.powderSpeed:st.speed)):0,a*.4);shaft.rotation.x+=speed*dt;});
  },
  brake({k,d,w,h,dp,g}){
   const R=Math.min(h,dp)/2;
   k.cyl(R*.92,w*.7,M.core,0,0,0,'x',24).cyl(R,w*.12,M.frame,w*.4,0,0,'x',24).cyl(R*.5,w*.1,M.black,-w*.42,0,0,'x',16).box(w*.3,R*.3,R*.5,M.module,0,R*.95,0).rbox(w*.14,R*.9,R*.14,M.red,-w*.2,R*.9,R*.6,.004,[.5,0,0]);
   for(let i=0;i<6;i++){const a=i*TAU/6;k.cyl(R*.07,w*.74,M.zinc,0,Math.cos(a)*R*.74,Math.sin(a)*R*.74,'x',8);}
   const l=led(g,w*.05,R*1.12,R*.1,.006,G.green);live.push((st,su)=>l(su.brake));
  },
  overload({k,w,h,dp}){k.rbox(w,h,dp,M.cream,0,0,0,.006).cyl(w*.12,.006,M.blue,-w*.2,h*.5,dp*.1).rbox(w*.14,.008,w*.14,M.red,w*.12,h*.5,dp*.1,.002).rbox(w*.14,.008,w*.14,M.blue,w*.32,h*.5,dp*.1,.002).box(w*.6,.002,dp*.3,M.white,0,h*.5,-dp*.25);screws(k,[-w*.3,0,w*.3],-h*.1,dp*.5,.005);},
  fan({k,d,w,h,dp,g}){
   const R=Math.min(w,h)/2;
   for(const s of[-1,1])k.box(w,h*.08,dp,M.module,0,s*h*.46,0).box(w*.08,h,dp,M.module,s*w*.46,0,0);
   for(const [x,y] of[[-1,-1],[1,-1],[-1,1],[1,1]])k.box(w*.2,h*.2,dp,M.module,x*w*.4,y*h*.4,0,[0,0,Math.PI/4]).cyl(.006,.004,M.zinc,x*w*.42,y*h*.42,dp*.5,'z',8);
   for(const r of[.3,.55,.8])k.ring(R*r,.0025,M.zinc,0,0,dp*.5,'z');
   k.box(w*.84,.004,.004,M.zinc,0,0,dp*.5).box(.004,h*.84,.004,M.zinc,0,0,dp*.5).cyl(R*.26,.006,M.zinc,0,0,dp*.5,'z',14);
   const rotor=sub(g),r=kit(rotor);r.cyl(R*.3,dp*.6,M.black,0,0,0,'z',16);for(let i=0;i<7;i++){const a=i*TAU/7;r.box(R*.56,R*.3,.003,M.black,Math.cos(a)*R*.55,Math.sin(a)*R*.55,0,[.5,0,a]);}r.done();
   let speed=0;live.push((st,su,a,dt)=>{speed=damp(speed,su.active[d.id]?26:0,a*.3);rotor.rotation.z+=speed*dt;});
  },
  valve({k,d,w,h,dp,g}){
   k.rbox(w*.8,h*.36,dp,M.alu,0,-h*.3,0,.004).rbox(w*.68,h*.44,dp*.8,M.black,0,h*.1,0,.005).rbox(w*.5,h*.18,dp*.6,M.grey,0,h*.4,0,.004).cyl(w*.1,.006,M.brass,0,-h*.3,dp*.5,'z',10).cyl(w*.12,h*.1,M.brass,0,-h*.52,0,'y',6).cyl(w*.07,h*.16,M.tube,0,-h*.62,0);
   const l=led(g,0,h*.4,dp*.3+.002,.005,G.orange);live.push((st,su)=>l(su.active[d.id]));
  },
  limit({k,d,w,h,dp,g}){
   k.rbox(w,h,dp,M.blue,0,0,0,.005).rbox(w*.3,h*.7,dp*.5,M.module,w*.3,0,dp*.7,.004).cyl(.008,.03,M.black,-w*.3,-h*.5-.012,0).cyl(.011,.008,M.grey,-w*.3,-h*.5,0,'y',6);
   const arm=sub(g,w*.3,0,dp*.98),ak=kit(arm);ak.box(.008,h*1.3,.004,M.zinc,0,h*.6,0).cyl(.011,.01,M.black,0,h*1.25,.003,'z',14).cyl(.006,.012,M.zinc,0,0,0,'z',8);ak.done();
   live.push((st,su,a)=>{arm.rotation.z=damp(arm.rotation.z,st.off[d.id]?-.62:0,a);});
  },
  sensor({k,d,w,h,dp,g}){
   if(h>.1){k.cyl(w*.75,h*.16,M.blue,0,h*.42,0).cyl(w*.5,.012,M.zinc,0,h*.33,0,'y',6).cyl(w*.2,h*.82,M.steel,0,-h*.08,0).cyl(w*.3,h*.04,M.black,0,-h*.48,0);const l=led(g,0,h*.5+.004,0,.006,G.orange);live.push((st,su)=>l(su.inputs[d.input]));return;}
   k.cyl(w*.5,h*.9,M.brass,0,h*.05,0,'y',12).cyl(w*.42,h*.1,M.black,0,-h*.45,0,'y',12).cyl(w*.78,h*.09,M.zinc,0,h*.16,0,'y',6).cyl(w*.78,h*.09,M.zinc,0,h*.36,0,'y',6).cyl(w*.22,h*.5,M.rubber,0,h*.7,0,'y',8);
   const l=led(g,0,h*.5,w*.4,.0032,G.orange);live.push((st,su)=>l(su.inputs[d.input]));
  },
  button({k,d,w,h,dp,g}){
   const R=Math.min(w,h)*.46,tail=d.id.slice(-3),m=tail==='-S1'?M.green:tail==='-S2'?M.red:M.black;
   k.cyl(R,.006,M.zinc,0,0,.003,'z',24).ring(R*.86,.003,M.zinc,0,0,.007,'z');
   const cap=sub(g,0,0,.006),ck=kit(cap);ck.cyl(R*.72,.012,m,0,0,.006,'z',24);ck.done();
   const pressed=tail==='-S1'?st=>st.press==='start':tail==='-S2'?st=>st.press==='stop':d.id==='+OS-S12'?st=>st.jog:st=>st.remoteJog;
   const l=m===M.black?led(g,0,0,.0185,R*.3,G.white):null;
   live.push((st,su,a)=>{const on=!!pressed(st);cap.position.z=damp(cap.position.z,on?.001:.006,a*1.6);l?.(on);});
  },
  estop({k,d,w,h,dp,g}){
   const R=Math.min(w,h)*.5;
   k.cyl(R*1.5,.003,M.yellow,0,0,.0015,'z',28).cyl(R*.6,.012,M.zinc,0,0,.008,'z',20);
   const head=sub(g,0,0,.014),hk=kit(head);hk.cyl(R*.5,.016,M.red,0,0,.006,'z',20).cyl(R*1.05,.01,M.red,0,0,.018,'z',28,R*.9);hk.done();
   live.push((st,su,a)=>{head.position.z=damp(head.position.z,st.off[d.id]?.005:.014,a*1.6);});
  },
  guard({k,d,w,h,dp,g}){
   const R=Math.min(w,h)*.46;
   k.cyl(R,.006,M.zinc,0,0,.003,'z',24).cyl(R*.62,.014,M.black,0,0,.01,'z',20);
   const key=sub(g,0,0,.017),kk=kit(key);kk.box(R*.16,R*1.5,.016,M.zinc,0,0,.008).rbox(R*.9,R*.5,.006,M.black,0,0,.02,.002);kk.done();
   const l=led(g,R*1.2,R*1.2,.003,.0035,G.green);
   live.push((st,su,a)=>{const open=!!st.off[d.id];key.rotation.z=damp(key.rotation.z,open?-Math.PI/2:0,a);l(!open);});
  },
  selector({k,d,w,h,dp,g}){
   const R=Math.min(w,h)*.42;
   k.cyl(R,.006,M.zinc,0,0,.003,'z',24);
   const knob=sub(g,0,0,.006),kk=kit(knob);kk.cyl(R*.7,.012,M.black,0,0,.006,'z',20).rbox(R*.3,R*1.5,.012,M.black,0,0,.016,.003).box(R*.08,R*.5,.002,M.white,0,R*.45,.0225);kk.done();
   live.push((st,su,a)=>{knob.rotation.z=damp(knob.rotation.z,st.vacuumSel?-.7:.7,a);});
  },
  lamp({k,d,w,h,dp,g}){
   const pair=d.id.endsWith('H2')?G.red:d.id.endsWith('H3')?G.yellow:G.green;
   k.cyl(w*.5,h*.12,M.black,0,-h*.44,0,'y',24).cyl(w*.5,h*.12,M.black,0,h*.44,0,'y',24);
   const lens=new T.Mesh(new T.CylinderGeometry(w*.46,w*.46,h*.78,24),pair.off);g.add(lens);
   live.push((st,su)=>{const want=su.active[d.id]?pair.on:pair.off;if(lens.material!==want)lens.material=want;});
  },
  horn({k,d,w,h,dp,g}){
   k.cyl(w*.36,h*.3,M.black,0,-h*.3,0).cyl(w*.3,dp*.4,M.black,0,0,-dp*.1,'z',20);
   const bell=sub(g),bk=kit(bell);bk.cyl(w*.3,dp*.5,M.red,0,0,dp*.3,'z',24,w*.5).cyl(w*.12,dp*.2,M.black,0,0,dp*.42,'z',12);bk.done();
   let t=0;live.push((st,su,a,dt)=>{t+=dt*38;bell.scale.setScalar(su.active[d.id]?1+Math.sin(t)*.05:1);});
  }
 };
 let built=0;
 for(const d of devices){
  if(d.mesh===false||['machine','operator','cabinet'].includes(d.kind))continue;
  const g=new T.Group();g.position.set(...d.pos);let [w,h,dp]=d.size;
  if(d.kind==='port'||d.kind==='outlet'){g.rotation.y=Math.PI/2;[w,dp]=[dp,w];}
  else if(d.id.startsWith('+M-')&&d.pos[2]<-.7)g.rotation.y=Math.PI;
  const k=kit(g);(B[d.kind]??(({k})=>k.rbox(w,h,dp,M.grey,0,0,0)))({k,d,w,h,dp,g});k.done();
  scene.add(g);tag(g,d.id);
  if(++built%12===0)await pause();
 }
 await pause();

 // Machine frame and base: a welded stand with four service doors that the limit switches watch.
 const machine=sub(scene),skin=sub(machine),gates=[],covers=[];
 {
  const k=kit(machine);
  for(const x of[-.82,1.22])for(const z of[-.62,.62])k.cyl(.035,.08,M.black,x,.04,z).cyl(.012,.06,M.zinc,x,.09,z).box(.05,.8,.05,M.paint,x<0?-.875:1.275,.5,z<0?-.675:.675);
  k.box(2.16,.012,1.36,M.frame,.2,.096,0).box(2.2,.04,.03,M.dark,.2,.12,.685).box(2.2,.04,.03,M.dark,.2,.12,-.685).box(.03,.04,1.36,M.dark,-.885,.12,0).box(.03,.04,1.36,M.dark,1.285,.12,0);
  k.box(2.2,.1,.03,M.paint,.2,.85,.685).box(2.2,.1,.03,M.paint,.2,.85,-.685).box(.03,.1,1.36,M.paint,-.885,.85,0).box(.03,.1,1.36,M.paint,1.285,.85,0);
  k.rbox(2.24,.04,1.44,M.steel,.2,.92,0,.006).cyl(.58,.006,M.alu,.2,.943,0,'y',64);
  k.box(.8,.03,.03,M.alu,-.15,.56,.708).box(.03,.66,.03,M.paint,.18,.47,-.685);
  // The fixed outer panels are a part of their own so a close look at the drive can take them off.
  const sk=kit(skin);
  sk.box(.82,.66,.015,M.paint,-.15,.47,.69).box(.45,.66,.015,M.paint,-.655,.47,-.69).box(.49,.66,.015,M.paint,1.035,.47,-.69).box(.015,.66,1.36,M.paint,-.89,.47,0).box(.015,.66,1.36,M.paint,1.29,.47,0);
  for(let i=0;i<8;i++)sk.box(.004,.012,.3,M.dark,-.899,.3+i*.03,-.3);
  sk.done();
  // Drive train under the table: motor, index gearbox and the column that carries the dial.
  k.rbox(.34,.34,.34,M.blue,.2,.56,0,.02).rbox(.2,.2,.012,M.core,.2,.56,.172,.01).rbox(.2,.2,.012,M.core,.2,.56,-.172,.01).cyl(.02,.008,M.clear,.3,.48,.18,'z',14).cyl(.09,.02,M.core,.2,.74,0,'y',24).cyl(.06,.2,M.steel,.2,.84,0,'y',24).cyl(.05,.04,M.core,.02,.42,.1,'x',16);
  for(const [x,z] of[[-1,-1],[1,-1],[-1,1],[1,1]])k.box(.04,.29,.04,M.frame,.2+x*.14,.245,z*.14).cyl(.008,.006,M.zinc,.2+x*.08,.56+z*.08,.18,'z',6);
  k.box(.44,.012,.3,M.frame,-.4,.314,.1).box(.03,.21,.3,M.frame,-.6,.205,.1).box(.03,.21,.3,M.frame,-.2,.205,.1).box(.5,.05,.38,M.frame,1,.125,-.3);
  k.hose([[1.14,.47,-.3],[1.14,.66,-.3],[.7,.84,-.36],[-.1,.84,-.3],[-.26,.84,-.06],[-.26,.9,0]],.018,M.rubber);
  [0,6,4,7,1,2,5,3].forEach((s,i)=>{const [x,z]=world(angle(s),.4),vx=-.5+i*.1;k.hose([[vx,.56,.7],[vx,.52,.64],[vx*.6+x*.4,.8,.5],[x,.86,z],[x,.9,z]],.004,M.tube);});
  k.done();
  // Lower service doors: [switch, hinge x, wall z, direction along x, width, swing sign].
  for(const [id,hx,z,dir,w,sign] of[['+M-S2',-.88,.69,1,.31,-1],['+M-S3',1.28,.69,-1,1.01,1],['+M-S4',.17,-.69,-1,.59,-1],['+M-S5',.19,-.69,1,.59,1]]){
   const g=sub(machine,hx,0,z),gk=kit(g),out=z>0?1:-1;
   gk.box(w-.012,.66,.015,M.paint,dir*w/2,.47,0).box(w-.07,.5,.004,M.lightgrey,dir*w/2,.47,out*.009).rbox(.02,.12,.03,M.black,dir*(w-.05),.5,out*.022,.006).cyl(.01,.08,M.zinc,dir*.008,.7,0).cyl(.01,.08,M.zinc,dir*.008,.24,0);
   gk.done();gates.push({id,g,sign});
  }
 }
 await pause();

 // Upper guard: aluminium posts and seven glass doors, one for each door switch on the operator station.
 {
  const k=kit(machine);
  for(const x of[-.88,.2,1.28])for(const z of[-.68,.68])k.box(.04,.96,.04,M.alu,x,1.42,z);
  k.box(2.2,.04,.04,M.alu,.2,1.88,.68).box(2.2,.04,.04,M.alu,.2,1.88,-.68).box(.04,.04,1.32,M.alu,-.88,1.88,0).box(.04,.04,1.32,M.alu,1.28,1.88,0).box(2.12,.03,.04,M.alu,.2,1.885,0).box(.04,.92,.04,M.alu,-.88,1.42,0).box(.04,.92,.04,M.alu,1.28,1.42,0);
  k.box(.006,.9,.62,M.glass,1.28,1.41,.34).box(.006,.9,.62,M.glass,-.88,1.41,.34).box(2.1,.006,.62,M.glass,.2,1.895,-.34);
  k.done();
  // [switch, hinge x, hinge z, direction of the leaf at rest in radians, width, swing sign]
  for(const [id,hx,hz,base,w,sign] of[['+OS-S5',-.86,.68,0,1.04,-1],['+OS-S6',1.26,.68,Math.PI,1.04,1],['+OS-S7',1.28,-.66,-Math.PI/2,.64,1],['+OS-S8',1.26,-.68,Math.PI,1.04,-1],['+OS-S9',-.86,-.68,0,1.04,1],['+OS-S10',-.88,-.66,-Math.PI/2,.64,-1]]){
   const g=sub(machine,hx,0,hz),gk=kit(g);g.rotation.y=base;
   gk.box(w-.05,.86,.006,M.glass,w/2,1.41,0).box(w-.03,.022,.02,M.alu,w/2,1.85,0).box(w-.03,.022,.02,M.alu,w/2,.97,0).box(.022,.9,.02,M.alu,w-.02,1.41,0).box(.022,.9,.02,M.alu,.02,1.41,0).rbox(.02,.14,.07,M.black,w-.06,1.38,0,.006).cyl(.008,.06,M.zinc,.01,1.7,0).cyl(.008,.06,M.zinc,.01,1.1,0);
   gk.done();covers.push({id,g,base,sign,axis:'y',open:1.5});
  }
  const top=sub(machine,.2,1.9,0),tk=kit(top);tk.box(2.1,.006,.62,M.glass,0,0,.34).box(2.12,.02,.022,M.alu,0,0,.66).box(.022,.02,.64,M.alu,-1.05,0,.34).box(.022,.02,.64,M.alu,1.05,0,.34).rbox(.14,.02,.02,M.black,0,.016,.6,.006);tk.done();
  covers.push({id:'+OS-S11',g:top,base:0,sign:-1,axis:'x',open:1.1});
 }
 await pause();

 // Index dial: eight segments, each holding sixteen capsules, turned one eighth at a time by the gearbox.
 const dial=sub(machine,DIAL[0],0,DIAL[1]),uppers=[],cell=[];
 {
  const k=kit(dial);
  k.cyl(.11,.09,M.steel,0,.985,0,'y',32).cyl(.415,.024,M.alu,0,.987,0,'y',64).cyl(.07,.17,M.steel,0,1.115,0,'y',24).cyl(.3,.014,M.alu,0,1.085,0,'y',48).cyl(.09,.02,M.dark,0,1.21,0,'y',24);
  for(let i=0;i<8;i++){const a=i*TAU/8;k.cyl(.008,.006,M.zinc,Math.cos(a)*.085,1.031,Math.sin(a)*.085,'y',6);}
  for(let s=0;s<8;s++){
   const a=angle(s),[x,z]=at(a,RING);k.rbox(.1,.04,.29,M.segment,x,.995,z,.006,[0,a,0]);
   for(const t of[-.125,.125]){const [bx,bz]=at(a,.42,t);k.cyl(.006,.004,M.zinc,bx,1.016,bz,'y',6);}
   for(let n=0;n<16;n++){const [rho,t]=hole(n),[hx,hz]=at(a,rho,t);cell.push([hx,hz]);k.cyl(.0098,.002,M.module,hx,1.0155,hz,'y',12);}
   const u=sub(dial),uk=kit(u);u.rotation.y=a;
   uk.rbox(.1,.018,.29,M.segment,RING,1.026,0,.004).box(.15,.012,.05,M.steel,.345,1.041,0).cyl(.006,.05,M.zinc,.3,1.062,.04).cyl(.006,.05,M.zinc,.3,1.062,-.04);
   for(let n=0;n<16;n++){const [rho,t]=hole(n);uk.cyl(.0105,.001,M.module,rho,1.0352,t,'y',12);}
   uk.done();uppers.push(u);
  }
  k.done();
 }
 const zero=new T.Matrix4().makeScale(0,0,0),mat=new T.Matrix4();
 const pool=(geometry,material,n,parent)=>{const m=new T.InstancedMesh(geometry,material,n);m.frustumCulled=false;m.castShadow=true;m.userData.noPick=true;for(let i=0;i<n;i++)m.setMatrixAt(i,zero);parent.add(m);return m;};
 const bodyShape=new T.CapsuleGeometry(.0085,.012,4,10),capShape=new T.CapsuleGeometry(.0095,.008,4,10),whole=new T.CapsuleGeometry(.0092,.02,4,10);
 const bodies=pool(bodyShape,M.body,128,dial),caps=pool(capShape,M.cap,128,dial),fly=pool(whole,M.cap,16,machine);
 await pause();

 // The eight stations around the dial, in the order the capsule meets them.
 const P=(s,rho,t=0)=>world(angle(s),rho,t),moving={};
 const bins={bad:[...P(4,.76),.946,.15,angle(4)],good:[...P(6,.76),.946,.16,angle(6)]};
 {
  const k=kit(machine);
  const post=(s,top,rho=.66)=>{const [x,z]=P(s,rho);k.cyl(.022,top-.94,M.steel,x,(top+.94)/2,z).cyl(.045,.012,M.frame,x,.952,z);return [x,z];};
  const under=s=>{const [x,z]=P(s,RING);k.rbox(.1,.028,.29,M.dark,x,.959,z,.004,[0,angle(s),0]);};
  // 0 capsule feed
  {const a=angle(0),[x,z]=P(0,RING),[px,pz]=post(0,1.84);
   tray(k,M.clear,x,1.67,z,.2,.15,.32,a);k.cyl(.07,.22,M.steel,x,1.56,z,'y',4,.17,[0,a+Math.PI/4,0]).rbox(.1,.03,.3,M.steel,x,1.09,z,.004,[0,a,0]).rbox(.1,.02,.3,M.steel,x,1.44,z,.004,[0,a,0]);
   for(let n=0;n<16;n++){const [rho,t]=hole(n),[hx,hz]=P(0,rho,t);k.cyl(.0065,.34,M.clear,hx,1.27,hz,'y',8);}
   for(let i=0;i<70;i++){const [cx,cz]=P(0,RING+(rnd()-.5)*.15,(rnd()-.5)*.27),g=new T.CapsuleGeometry(.0092,.02,3,8);g.rotateZ(rnd()*3);g.rotateY(rnd()*3);k.put(g,i%3?M.cap:M.body,cx,1.685+rnd()*.07,cz);}
   k.box(.24,.03,.04,M.frame,(x+px)/2,1.6,(z+pz)/2,[0,a,0]).box(.24,.03,.04,M.frame,(x+px)/2,1.2,(z+pz)/2,[0,a,0]);
   const [qx,qz]=P(0,.54);moving.feed=sub(machine,qx,1.1,qz);moving.feed.rotation.y=a;const fk=kit(moving.feed);fk.rbox(.05,.03,.3,M.zinc,0,0,0,.004).cyl(.014,.07,M.steel,.05,0,0,'x',12);fk.done();
  }
  // 1 capsule separation by vacuum
  {under(1);const [x,z]=post(1,1.2,.64);k.cyl(.034,.014,M.black,x,1.22,z,'x',24).cyl(.03,.002,M.white,x-.008,1.22,z,'x',24).box(.002,.02,.003,M.red,x-.0095,1.228,z,[.6,0,0]);}
  // 2 powder filling
  {const a=angle(2),[x,z]=P(2,RING),[px,pz]=post(2,1.6);
   k.cyl(.035,.36,M.clear,x,1.5,z,'y',28,.13).cyl(.135,.012,M.steel,x,1.686,z,'y',28).cyl(.03,.2,M.powder,x,1.43,z,'y',24,.092).cyl(.03,.24,M.steel,x,1.2,z,'y',18).rbox(.1,.035,.29,M.steel,x,1.0475,z,.004,[0,a,0]).ring(.1,.008,M.frame,x,1.56,z);
   k.box(.2,.03,.04,M.frame,(x+px)/2,1.56,(z+pz)/2,[0,a,0]);
   moving.agitator=sub(machine,x,0,z);const ak=kit(moving.agitator);ak.cyl(.006,.44,M.steel,0,1.47,0,'y',8).box(.12,.012,.004,M.steel,0,1.52,0,[.4,0,0]).box(.07,.012,.004,M.steel,0,1.42,0,[.4,.8,0]).box(.04,.012,.004,M.steel,0,1.33,0,[.4,1.6,0]);ak.done();
  }
  // 3 photoelectric inspection
  {k.cyl(.02,.27,M.steel,.03,1.075,.6).cyl(.02,.27,M.steel,.37,1.075,.6).cyl(.04,.012,M.frame,.03,.952,.6).cyl(.04,.012,M.frame,.37,.952,.6).box(.4,.025,.025,M.alu,.2,1.2,.6).box(.3,.012,.1,M.dark,.2,1.151,.46).box(.02,.05,.13,M.alu,.07,1.18,.535).box(.02,.05,.13,M.alu,.33,1.18,.535);}
  // 4 reject and 6 good discharge: a blow-off block below, a chute and a container
  for(const [s,m,size,h] of[[4,M.red,.15,.07],[6,M.clear,.16,.12]]){
   under(s);const a=angle(s),[x,z]=P(s,.615);
   k.box(.2,.004,.26,M.steel,x,1.02,z,[0,a,-.22]);for(const t of[-.13,.13]){const [wx,wz]=P(s,.615,t);k.box(.2,.03,.004,M.steel,wx,1.032,wz,[0,a,-.22]);}
   const [bx,bz]=P(s,.76);tray(k,m,bx,.946,bz,size,h,size,a);
  }
  // 5 closing
  {under(5);const [px,pz]=post(5,1.3,.66),[x,z]=P(5,RING);k.box(.24,.04,.05,M.frame,(x+px)/2,1.26,(z+pz)/2).cyl(.03,.12,M.alu,x,1.2,z,'y',20).cyl(.034,.012,M.zinc,x,1.258,z,'y',20);
   moving.press=sub(machine,x,0,z);const pk=kit(moving.press);pk.rbox(.1,.02,.29,M.steel,0,1.075,0,.004).cyl(.012,.07,M.zinc,0,1.115,0,'y',12);pk.done();}
  // 7 segment cleaning
  {const [x,z]=P(7,RING);k.rbox(.31,.06,.12,M.dark,x,1.085,z,.01).hose([[x,1.11,z],[x,1.22,z-.04],[x,1.2,z-.16],[x,.95,z-.18]],.02,M.rubber).cyl(.03,.012,M.frame,x,.952,z-.18);
   moving.puff=new T.Mesh(new T.CylinderGeometry(.012,.05,.04,12,1,true),M.puff);moving.puff.position.set(x,1.036,z);moving.puff.userData.noPick=true;machine.add(moving.puff);}
  k.done();
 }
 // Capsules that have left the dial pile up where they landed.
 const heap=(bin,n,material)=>{const [bx,bz,y,size,a]=bin,m=pool(whole,material,n,machine),e=new T.Euler(),q=new T.Quaternion(),p=new T.Vector3(),one=new T.Vector3(1,1,1);
  for(let i=0;i<n;i++){const lx=(rnd()-.5)*size*.8,lz=(rnd()-.5)*size*.8;p.set(bx+lx*Math.cos(a)+lz*Math.sin(a),y+.014+Math.floor(i/14)*.012+rnd()*.004,bz-lx*Math.sin(a)+lz*Math.cos(a));m.setMatrixAt(i,mat.compose(p,q.setFromEuler(e.set(Math.PI/2,rnd()*6,rnd()*.4)),one));}
  m.count=0;return m;};
 const heapBad=heap(bins.bad,48,M.cap),heapGood=heap(bins.good,84,M.cap);
 tag(machine,'MCH1');
 await pause();

 // Operator station on its pedestal with the stack light above it.
 const operator=sub(scene);
 {
  const k=kit(operator);
  k.rbox(.5,.02,.4,M.dark,1.95,.01,.6,.006).box(.12,1.08,.1,M.paint,1.95,.55,.6).rbox(.9,.47,.2,M.paint,1.95,1.315,.61,.014).box(.84,.41,.004,M.lightgrey,1.95,1.315,.7105).cyl(.012,.16,M.zinc,2.25,1.62,.55).cyl(.03,.02,M.black,2.25,1.555,.55).cyl(.036,.012,M.black,2.25,1.926,.55).cyl(.02,.03,M.black,1.7,1.565,.55);
  for(const [x,y] of[[-1,-1],[1,-1],[-1,1],[1,1]])k.cyl(.006,.004,M.zinc,1.95+x*.4,1.315+y*.185,.713,'z',8);
  k.done();
  for(const d of devices)if(d.id.startsWith('+OS-S')&&d.mesh!==false){const t=label(d.id.slice(4),.044,.014);t.position.set(d.pos[0],d.pos[1]-.038,.7132);operator.add(t);}
 }
 tag(operator,'OS1');
 await pause();

 // Relay K1 cut open and enlarged, far above the room, for the coil and contact lessons.
 const detail=sub(scene,0,20,0),armature=sub(detail,-.42,.2,0),field=sub(detail,-.2,-.09,0),coilNotes=[];
 {
  const k=kit(detail);
  k.rbox(1.9,1.3,.03,M.wall,.1,.05,-.32,.01).rbox(1.2,.06,.5,M.dark,.08,-.33,0,.01).box(.04,.5,.16,M.core,-.42,-.05,0).box(.3,.04,.16,M.core,-.29,-.28,0).cyl(.055,.36,M.core,-.2,-.09,0,'y',24).cyl(.13,.014,M.cream,-.2,.08,0,'y',28).cyl(.13,.014,M.cream,-.2,-.25,0,'y',28);
  for(let i=0;i<14;i++)k.ring(.1,.012,M.copper,-.2,-.225+i*.0225,0);
  k.box(.1,.56,.16,M.cream,.66,-.02,0).box(.24,.012,.06,M.copper,.54,.36,0).box(.24,.012,.06,M.copper,.54,.132,0).ball(.022,M.brass,.43,.348,0,.6).ball(.022,M.brass,.43,.144,0,.6).cyl(.012,.02,M.zinc,.66,.375,0).cyl(.012,.02,M.zinc,.66,.147,0).cyl(.012,.3,M.zinc,-.44,-.02,.1,'y',8);
  k.done();
  const ak=kit(armature);ak.box(.62,.03,.14,M.core,.3,0,0).box(.08,.03,.1,M.cream,.6,0,0).box(.3,.012,.06,M.copper,.74,0,0).ball(.022,M.brass,.85,.014,0,.6).ball(.022,M.brass,.85,-.014,0,.6).cyl(.02,.18,M.zinc,0,0,0,'z',12);ak.done();
  const fk=kit(field);for(const r of[.2,.27,.34])fk.ring(r,.006,M.field,r-.02,0,0,'z').ring(r,.006,M.field,-r+.02,0,0,'z');fk.done();field.visible=false;
  // Each name sits clear of the part and a thin line leads to it. The close view of the contacts leaves the coil's names out.
  for(const [text,x,y,w,px,py] of[['코일',.12,-.14,.16,-.09,-.14],['철심',.12,.0,.16,-.17,.095],['가동 철편',-.15,.52,.28,-.15,.27],['가동 접점',.3,.58,.28,.39,.31],['닫힌 접점 NC',.87,.36,.32],['열린 접점 NO',.87,.132,.32]]){
   const t=label(text,w,.075),far=['코일','철심','가동 철편'].includes(text);t.position.set(x,y,.1);detail.add(t);if(far)coilNotes.push(t);
   if(px===undefined)continue;
   const sx=Math.abs(px-x)>w/2?x+Math.sign(px-x)*w/2:x,sy=Math.abs(px-x)>w/2?y:y+Math.sign(py-y)*.0375,line=new T.Mesh(new T.BoxGeometry(Math.hypot(px-sx,py-sy),.004,.002),M.dark);
   line.position.set((sx+px)/2,(sy+py)/2,.12);line.rotation.z=Math.atan2(py-sy,px-sx);detail.add(line);if(far)coilNotes.push(line);
  }
  detail.traverse(o=>{if(o.isMesh)o.userData.noPick=true;});detail.visible=false;
 }

 // Motion: one pass per frame over everything that the state can move.
 let flights=[],lastSlots=null,lastCount=-1;
 const start=(s,bin,n)=>{for(let j=0;j<n&&flights.length<16;j++){const [rho,t]=hole(j*2),[x,z]=P(s,rho,t);flights.push({t:-j*.05,from:[x,1.03,z],to:[bin[0]+(rnd()-.5)*.08,bin[2]+.03,bin[1]+(rnd()-.5)*.08]});}};
 const p=new T.Vector3(),q=new T.Quaternion().setFromEuler(new T.Euler(Math.PI/2,0,.5)),one=new T.Vector3(1,1,1);
 function animate(state,status,dt){
  const a=1-Math.exp(-dt*10);
  for(const f of live)f(state,status,a,dt);
  doorAmount=damp(doorAmount,doorOpen?1:0,a*.5);door.rotation.y=-1.9*doorAmount;
  for(const x of gates){const to=state.off[x.id]?1.6:0;x.amount=damp(x.amount??0,to,a*.5);x.g.rotation.y=x.sign*x.amount;x.g.visible=!baseForced;}
  skin.visible=!baseForced;
  for(const x of covers){x.amount=damp(x.amount??0,state.off[x.id]?x.open:0,a*.5);if(x.axis==='x')x.g.rotation.x=x.sign*x.amount;else x.g.rotation.y=x.base+x.sign*x.amount;}
  // Dial: it turns during the first 0.4 of each index and stands still for the stations to work.
  const e=smooth(0,.4,state.phase),turn=state.count+e;dial.rotation.y=turn*Math.PI/4;
  for(let k=0;k<8;k++){
   const s=((k+turn)%8+8)%8,L=smooth(1,2,s)-smooth(4,5,s),ak=angle(k),ox=-.11*L*Math.cos(ak),oz=.11*L*Math.sin(ak),oy=.035*L,v=state.slots[(k+state.count+1)%8];
   uppers[k].position.set(ox,oy,oz);
   for(let j=0;j<16;j++){const i=k*16+j,[x,z]=cell[i];if(v>=0&&j>=v){bodies.setMatrixAt(i,mat.makeTranslation(x,1.006,z));caps.setMatrixAt(i,mat.makeTranslation(x+ox,1.033+oy,z+oz));}else{bodies.setMatrixAt(i,zero);caps.setMatrixAt(i,zero);}}
  }
  bodies.instanceMatrix.needsUpdate=caps.instanceMatrix.needsUpdate=true;
  const out=status.outputs,dwell=state.phase;
  moving.feed.position.y=damp(moving.feed.position.y,out['O:12/00']?1.085:1.1,a);
  moving.press.position.y=damp(moving.press.position.y,status.run&&dwell>.5&&dwell<.8&&state.slots[5]>=0?-.016:0,a);
  moving.puff.visible=!!out['O:12/03'];
  if(status.powder)moving.agitator.rotation.y+=dt*(2+state.powderSpeed*6);
  if(lastSlots&&lastCount===state.count){if(lastSlots[4]>0&&state.slots[4]<0)start(4,bins.bad,8);if(lastSlots[6]>=0&&state.slots[6]<0)start(6,bins.good,8);}
  lastSlots=state.slots.slice();lastCount=state.count;
  flights=flights.filter(f=>(f.t+=dt/.6)<1);
  for(let i=0;i<16;i++){const f=flights[i];if(!f||f.t<0){fly.setMatrixAt(i,zero);continue;}const t=f.t;p.set(f.from[0]+(f.to[0]-f.from[0])*t,f.from[1]+(f.to[1]-f.from[1])*t+.16*t*(1-t),f.from[2]+(f.to[2]-f.from[2])*t);fly.setMatrixAt(i,mat.compose(p,q,one));}
  fly.instanceMatrix.needsUpdate=true;
  heapBad.count=Math.min(48,state.bad*6);heapGood.count=Math.min(84,state.good*6);
  // Cutaway relay: the armature drops onto the core and carries the contact from NC to NO.
  if(detail.visible){const on=!!status.active['+MC-K1'];travel=damp(travel,on?1:0,1-Math.exp(-dt*7));armature.rotation.z=(1-travel)*.14;field.visible=on;}
  else travel=status.active['+MC-K1']?1:0;
 }
 const inCabinet=d=>d&&d.id!=='+MC-ENCLOSURE'&&d.pos[0]>-3.15&&d.pos[0]<-2.05&&d.pos[2]<-1.4;
 const inBase=d=>d&&d.id!=='MCH1'&&d.id.startsWith('+M-')&&d.pos[1]<.8&&Math.abs(d.pos[2])<.68;
 return {groups,pickables,animate,detail,
  setDoor(v){doorOpen=!!v;},isDoorOpen:()=>doorOpen,travel:()=>travel,
  showDetail(v,close=false){detail.visible=v;for(const n of coilNotes)n.visible=!close;},
  reveal(id){const d=byId.get(id);if(id==='cabinet'||inCabinet(d))doorOpen=true;baseForced=inBase(d);}};
}
