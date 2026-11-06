import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Mechanical display only. Electrical truth and quantities remain in conveyor-project/engine.
export function createEquipment({materials:m,label}) {
 const motion={door:null,fan:null,shaft:null,selector:null,isolator:null,stop:null,breaker:[]};
 let doorOpen=true,doorAmount=1,phase=0;
 const coating=new Uint8Array(64*64*4);
 let seed=4763;
 for(let i=0;i<coating.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const v=172+(seed%65);coating.set([v,v,v,255],i);}
 const grain=new T.DataTexture(coating,64,64,T.RGBAFormat);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(7,7);grain.needsUpdate=true;
 m.cream.roughnessMap=grain;m.blue.roughnessMap=grain;m.belt.roughnessMap=grain;
 const material=(color,metalness,roughness)=>new T.MeshStandardMaterial({color,metalness,roughness});
 m.zinc=material('#9babad',.72,.36);m.insulator=material('#6b7571',.05,.64);m.ferrule=material('#263a51',.1,.5);m.cable=material('#17242b',.02,.74);
 const unitBox=new T.BoxGeometry(1,1,1),unitCylinder=new T.CylinderGeometry(1,1,1,20);
 function mesh(p,geo,mat,pos=[0,0,0]){const o=new T.Mesh(geo,mat);o.position.set(...pos);o.castShadow=o.receiveShadow=true;p.add(o);return o;}
 function box(p,size,pos,mat,r=0){const geo=r?new RoundedBoxGeometry(...size,1,r):unitBox;const o=mesh(p,geo,mat,pos);if(!r)o.scale.set(...size);return o;}
 function cylinder(p,r,h,pos,mat,axis='z'){const o=mesh(p,unitCylinder,mat,pos);o.scale.set(r,h,r);if(axis==='z')o.rotation.x=Math.PI/2;if(axis==='x')o.rotation.z=Math.PI/2;return o;}
 function ring(p,r,t,pos,mat){return mesh(p,new T.TorusGeometry(r,t,6,28),mat,pos);}
 function wire(p,points,mat=m.cable,r=.006){const c=new T.CurvePath();points.slice(1).forEach((v,i)=>c.add(new T.LineCurve3(new T.Vector3(...points[i]),new T.Vector3(...v))));return mesh(p,new T.TubeGeometry(c,points.length*4,r,6,false),mat);}
 function screw(p,x,y,z,r=.01){cylinder(p,r,.009,[x,y,z],m.zinc);box(p,[r*1.3,.002,.002],[x,y,z+.006],m.dark);}
 function rail(p,y,width=1.43){box(p,[width,.035,.012],[0,y,.07],m.zinc);for(const dy of [-.021,.021])box(p,[width,.008,.016],[0,y+dy,.083],m.steel);for(let i=0;i<12;i++)box(p,[.04,.009,.001],[-.65+i*.118,y,.077],m.dark);}
 function duct(p,size,pos){const g=new T.Group();g.position.set(...pos);p.add(g);box(g,size,[0,0,0],m.insulator,.005);const vertical=size[1]>size[0],n=Math.floor((vertical?size[1]:size[0])/.038);for(let i=0;i<n;i++){const v=-((vertical?size[1]:size[0])-.025)/2+i*.038;box(g,vertical?[size[0]*.7,.012,.002]:[.012,size[1]*.7,.002],vertical?[0,v,size[2]/2+.001]:[v,0,size[2]/2+.001],m.dark);}return g;}
 function cabinet(g,d){
  const depth=d.size[2],front=depth/2,rear=-depth/2;
  box(g,[1.65,2.1,.055],[0,0,rear+.025],m.cream,.012);
  for(const x of [-.797,.797])box(g,[.055,2.1,depth],[x,0,0],m.cream,.014);
  for(const y of [-1.025,1.025])box(g,[1.61,.055,depth],[0,y,0],m.cream,.012);
  box(g,[1.47,1.94,.018],[0,0,rear+.07],m.zinc,.004);
  box(g,[1.66,.2,depth],[0,-1.15,0],m.dark,.018);
  for(const x of [-.7,.7])for(const y of [-.9,.9])screw(g,x,y,rear+.085,.017);
  for(const y of [.75,.25,-.31,-.73])rail(g,y);
  for(const x of [-.695,.67])duct(g,[.09,1.84,.13],[x,0,.015]);
  for(const y of [.51,-.08,-.55])duct(g,[1.27,.075,.09],[-.015,y,-.065]);
  for(let i=0;i<7;i++){const x=-.52+i*.14;cylinder(g,.019,.035,[x,-1.015,.01],m.dark,'y');cylinder(g,.025,.014,[x,-1.042,.01],m.zinc,'y');}
  const door=new T.Group();door.name='cabinet-door';door.position.set(-.822,0,front);g.add(door);motion.door=door;
  box(door,[1.62,2.06,.045],[.81,0,0],m.cream,.014);
  for(const x of [.055,1.565])box(door,[.012,1.96,.012],[x,0,-.027],m.dark,.003);
  for(const y of [-.975,.975])box(door,[1.51,.012,.012],[.81,y,-.027],m.dark,.003);
  for(const y of [-.72,0,.72]){cylinder(g,.028,.14,[-.822,y,front],m.steel,'y');screw(door,.07,y,.028);}
  box(door,[.065,.29,.05],[1.43,0,.045],m.dark,.016);box(door,[.03,.2,.03],[1.43,.025,.081],m.steel,.009);cylinder(door,.012,.003,[1.43,-.095,.074],m.zinc);
  for(let i=0;i<7;i++)box(door,[.46,.013,.016],[.81,-.64+i*.047,.027],m.insulator,.004);
  label(door,'CAB1  /  CONTROL',[.81,.75,.029],.85,.11);
  label(door,'380 V  ·  120 V',[.81,.57,.029],.61,.08);
  // Real geometry rather than a text-glyph warning icon.
  const shape=new T.Shape();shape.moveTo(-.105,-.085);shape.lineTo(.105,-.085);shape.lineTo(0,.105);shape.closePath();mesh(door,new T.ShapeGeometry(shape),m.yellow,[.81,.34,.03]);
  wire(door,[[.835,.41,.032],[.79,.34,.032],[.828,.34,.032],[.792,.27,.032]],m.dark,.007);
  label(g,'CAB1',[0,1.075,front+.01],.42,.07);
  door.rotation.y=-2.8;
 }
 function motor(g){
  // Parallel-axis geared motor. Output axis is the conveyor end roller axis (x=2.44,y=.805).
  cylinder(g,.175,.36,[-.04,0,.035],m.blue);
  for(let i=0;i<20;i++){const a=i*Math.PI/10;const o=box(g,[.024,.043,.34],[-.04+Math.sin(a)*.177,Math.cos(a)*.177,.03],m.blue,.004);o.rotation.z=-a;}
  cylinder(g,.184,.045,[-.04,0,-.165],m.blue);cylinder(g,.184,.055,[-.04,0,.235],m.dark);
  const fan=new T.Group();fan.name='motor-fan';fan.position.set(-.04,0,.265);g.add(fan);motion.fan=fan;
  cylinder(fan,.034,.024,[0,0,0],m.steel);
  for(let i=0;i<9;i++){const a=i*Math.PI*2/9,o=box(fan,[.045,.125,.009],[Math.sin(a)*.09,Math.cos(a)*.09,0],m.zinc,.008);o.rotation.z=-a+.3;}
  // Open grill exposes enough fan blade to distinguish rotation from an indicator light.
  for(const r of [.065,.108,.153,.183])ring(g,r,.004,[-.04,0,.29],m.steel);
  for(let i=0;i<6;i++){const o=box(g,[.006,.36,.008],[-.04,0,.293],m.steel);o.rotation.z=i*Math.PI/6;}
  box(g,[.22,.105,.18],[-.04,.205,.015],m.blue,.012);box(g,[.23,.018,.19],[-.04,.265,.015],m.blue,.006);
  for(const x of [-.125,.045])for(const z of [-.05,.08])cylinder(g,.008,.004,[x,.278,z],m.steel,'y');
  for(const x of [-.18,.11]){box(g,[.065,.07,.39],[x,-.19,.04],m.blue,.008);box(g,[.13,.025,.42],[x,-.235,.04],m.steel,.006);}
  // Cast reduction housing joins input motor to the offset output shaft.
  const housing=box(g,[.55,.54,.19],[.13,.105,-.26],m.zinc,.045);housing.name='gearbox-housing';
  cylinder(g,.13,.04,[.34,.285,-.365],m.blue);cylinder(g,.08,.035,[.34,.285,-.4],m.steel);
  const shaft=new T.Group();shaft.name='roller-drive-shaft';shaft.position.set(.34,.285,-.43);g.add(shaft);motion.shaft=shaft;
  cylinder(shaft,.037,.25,[0,0,0],m.steel);cylinder(shaft,.065,.07,[0,0,-.07],m.dark);
  for(let i=0;i<4;i++){const a=i*Math.PI/2;screw(shaft,Math.cos(a)*.048,Math.sin(a)*.048,-.025,.008);}
  box(shaft,[.014,.016,.07],[0,.064,-.07],m.yellow,.002);
  for(const [x,y] of [[-.09,-.1],[.35,-.1],[-.09,.31],[.35,.31]])screw(g,x,y,-.159,.014);
  label(g,'-02M1  /  3 PHASE',[-.03,.055,.304],.32,.055);
  label(g,'GEAR REDUCER',[.14,.14,-.159],.36,.045);
 }
 function detail(d,g){
  if(d.kind==='conveyor'){
   for(const z of [-.653,.653])for(let i=0;i<13;i++)screw(g,-2.4+i*.4,-.035,z,.013);
   for(const x of [-2.44,2.44])for(const z of [-.625,.625]){box(g,[.21,.17,.055],[x,-.015,z],m.blue,.016);cylinder(g,.061,.07,[x,-.015,z],m.steel);}
   for(const x of [-2.2,-.7,.7,2.2])for(const z of [-.6,.6]){cylinder(g,.055,.016,[x,-.805,z],m.black,'y');box(g,[.05,.02,.05],[x,-.755,z],m.zinc,.006);}
   label(g,'KEEP CLEAR  /  CV1',[1.55,-.065,.654],.68,.047);
  }
  if(['contactor','breaker','fuse'].includes(d.kind)){
   for(const y of [-.135,.135])for(let i=0;i<3;i++){const x=(i-1)*.07;box(g,[.048,.035,.014],[x,y,d.size[2]/2+.026],m.dark,.004);screw(g,x,y,d.size[2]/2+.037,.01);}
   const z=d.size[2]/2+.063;
   label(g,d.kind==='contactor'?'1/L1   3/L2   5/L3':'L1     L2     L3',[0,.206,z],d.size[0]*1.03,.033);
   label(g,d.kind==='contactor'?'2/T1   4/T2   6/T3':'T1     T2     T3',[0,-.206,z],d.size[0]*1.03,.033);
   if(d.kind==='contactor'){
    label(g,'A1       A2',[0,.071,.135],.21,.026);
    box(g,[.065,.165,.085],[.175,0,.035],m.cream,.009);label(g,'53 / 54',[.175,.045,.08],.06,.023);screw(g,.175,-.04,.083,.009);
   }
   if(d.kind==='breaker'){
    const lever=new T.Group();lever.position.z=.09;g.add(lever);motion.breaker.push(lever);
    box(lever,[.19,.035,.028],[0,0,.018],m.black,.007);label(g,'I   /   O',[0,.065,.1],.13,.026);
   }
  }
  if(d.kind==='plc'){
   for(const x of [-.4,.4]){box(g,[.03,.4,.03],[x,0,.08],m.zinc,.004);screw(g,x,.15,.102,.012);screw(g,x,-.15,.102,.012);}
   for(let i=0;i<16;i++){const x=-.345+(i%8)*.089,y=i<8?-.19:-.24;box(g,[.068,.04,.045],[x,y,.08],m.insulator,.003);screw(g,x,y,.106,.007);}
   label(g,'1771-IAD  /  AC INPUT',[0,.23,.1],.65,.04);
  }
  if(d.kind==='terminal'){
   for(let i=0;i<d.quantity;i++){
    const x=(i-(d.quantity-1)/2)*.078;label(g,d.id==='X1'?['U','V','W','PE'][i]:['11','12','17'][i],[x,0,.052],.052,.023);
    wire(g,[[x,-.06,.02],[x,-.115,.005],[x,-.15,-.08]],i===3?m.green:m.cable,.005);
   }
   for(const sign of [-1,1])box(g,[.025,.13,.095],[sign*(d.quantity*.078/2+.015),0,0],m.dark,.004);
  }
  if(d.kind==='operator')for(const x of [-.4,.4])for(const y of [-.135,.135])screw(g,x,y,.173,.009);
  if(d.kind==='selector'){
   const handle=g.children.find(o=>o.isMesh&&o.geometry.type==='BoxGeometry');if(handle){motion.selector=handle;handle.userData.articulated=true;}
   label(g,'OFF   ON',[0,.091,.035],.19,.029);
  }
  if(d.kind==='isolator'){
   const handle=g.children.find(o=>o.isMesh&&o.geometry.type==='BoxGeometry'&&o.geometry.parameters.width===.025);if(handle){motion.isolator=handle;handle.userData.articulated=true;}
   for(const x of [-.075,.075])for(const y of [-.1,.1])screw(g,x,y,.1,.009);
  }
  if(d.kind==='estop'){
   const cap=g.children.find(o=>o.isMesh&&o.material===m.red);if(cap){motion.stop=cap;cap.userData.articulated=true;}
  }
  if(d.kind==='sensor'){
   for(const z of [-.045,-.035,-.025,-.015,-.005,.005,.015,.025])ring(g,.034,.002,[0,0,z],m.zinc);
  }
 }
 function finish(g,id){
  // Batch static parts per material/device; moving controls retain their own transform.
  g.traverse(p=>{
   const batches=new Map();
   for(const o of [...p.children])if(o.isMesh&&!o.userData.articulated&&!o.material.isMeshBasicMaterial){
    o.updateMatrix();const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.applyMatrix4(o.matrix);
    if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(geo);p.remove(o);
    if(o.geometry!==unitBox&&o.geometry!==unitCylinder)o.geometry.dispose();
   }
   for(const [mat,list]of batches){const merged=mergeGeometries(list);list.forEach(x=>x.dispose());const o=mesh(p,merged,mat);o.userData.deviceId=id;}
  });
  g.traverse(o=>{o.userData.deviceId=id;});
 }
 function animate(state,status,dt){
  const step=Math.min(Math.max(dt,0),.1),a=1-Math.exp(-step*10);
  doorAmount+=(Number(doorOpen)-doorAmount)*a;
  if(motion.door)motion.door.rotation.y=-2.8*doorAmount;
  if(status.motor&&!state.paused)phase=(phase+step*state.speed/.1)%(2*Math.PI);
  if(motion.fan)motion.fan.rotation.z=phase*5;
  if(motion.shaft)motion.shaft.rotation.z=phase;
  if(motion.selector)motion.selector.rotation.z=state.run?-.7:0;
  if(motion.isolator)motion.isolator.rotation.z=state.isolator?Math.PI/2:0;
  if(motion.stop)motion.stop.position.z=state.estop?.031:.055;
  for(const o of motion.breaker)o.position.y=state.power?.03:-.03;
 }
 function framingBounds(g){
  const bounds=new T.Box3().setFromObject(g),door=motion.door;
  if(door?.parent===g&&doorOpen){
   const angle=door.rotation.y;
   door.rotation.y=-2.8;bounds.union(new T.Box3().setFromObject(g));
   door.rotation.y=angle;g.updateMatrixWorld(true);
  }
  return bounds;
 }
 return {build(d,g){if(d.kind==='cabinet'){cabinet(g,d);return true;}if(d.kind==='motor'){motor(g);return true;}return false;},detail,finish,animate,framingBounds,
  setDoor(value){doorOpen=Boolean(value);},isDoorOpen:()=>doorOpen,
  dispose(){unitBox.dispose();unitCylinder.dispose();},motion};
}
