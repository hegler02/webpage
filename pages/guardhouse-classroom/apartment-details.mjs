import * as THREE from 'three';
import {worldUV} from './surface-materials.mjs';
import {apartmentPalettes,apartmentAssemblies} from '/pages/guardhouse-classroom/src/apartment-materials.mjs';
const V=p=>new THREE.Vector3(p[0],p[2],-p[1]);
function rounded(w,h,d,r=.025){r=Math.min(r,w/5,h/5,d/5);const x=-w/2+r,y=-h/2+r,W=w-2*r,H=h-2*r,s=new THREE.Shape();s.moveTo(x+r,y);s.lineTo(x+W-r,y);s.quadraticCurveTo(x+W,y,x+W,y+r);s.lineTo(x+W,y+H-r);s.quadraticCurveTo(x+W,y+H,x+W-r,y+H);s.lineTo(x+r,y+H);s.quadraticCurveTo(x,y+H,x,y+H-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);const g=new THREE.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r,bevelThickness:r,curveSegments:6});g.translate(0,0,-(d-2*r)/2);return g;}
export class ApartmentDetails{
 constructor(view){this.view=view;this.parts=[];this.palette='warm';this.assembly='exterior';this.build();this.setPalette('warm');}
 point(id,p){return [p[0]+(id==='toilet'?.75:['kitchen','counter','sink','hob'].includes(id)?-1.4:0),p[1]+(id==='toilet'?-.85:id==='basin'?-1.05:id==='dining-table'?-1.25:0),p[2]];}
 host(id){return this.view.base.children.find(m=>m.userData.id===id);}
 material(type,color){const m=new THREE.MeshStandardMaterial({color,roughness:type==='metal'?.27:type==='glass'?.08:.82,metalness:type==='metal'?.8:0});if(['wood','tile','marble','plaster'].includes(type))this.view.surfaces.apply(m,type,color);if(type==='glass'){m.transparent=true;m.opacity=.17;m.depthWrite=false;m.metalness=.3;this.view.sceneLook?.glass(m);}return m;}
 mesh(id,geo,pos,type='plaster',color=0xe7e2d8,role=null){const host=this.host(id);if(!host)return;worldUV(geo);const m=new THREE.Mesh(geo,this.material(type,color));m.position.copy(V(this.point(id,pos)));m.userData={...host.userData,detail:true,finishRole:role};m.castShadow=type!=='glass';m.receiveShadow=true;host.add(m);this.parts.push(m);return m;}
 box(id,p,size,type='plaster',color=0xe7e2d8,role=null,r=0){return this.mesh(id,r?rounded(size[0],size[2],size[1],r):new THREE.BoxGeometry(size[0],size[2],size[1]),p,type,color,role);}
 cylinder(id,p,r,h,type='metal',color=0x7b8483){return this.mesh(id,new THREE.CylinderGeometry(r,r,h,24),p,type,color);}
 line(id,points,r=.012,type='metal',color=0x8b9696){for(let i=1;i<points.length;i++){const a=V(this.point(id,points[i-1])),b=V(this.point(id,points[i]));const m=this.mesh(id,new THREE.CylinderGeometry(r,r,a.distanceTo(b),12),[0,0,0],type,color);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.sub(a).normalize());}}
 replace(id){const m=this.host(id);if(m){m.material.transparent=true;m.material.opacity=0;m.userData.defaultOpacity=0;m.castShadow=false;m.userData.detailReplacement=true;}}
 build(){
  for(const m of this.view.base.children){const e=m.userData,b=e.footprint?.reduce((a,p)=>[Math.min(a[0],p[0]),Math.min(a[1],p[1]),Math.max(a[2],p[0]),Math.max(a[3],p[1])],[Infinity,Infinity,-Infinity,-Infinity]);if(!b)continue;
   const [x,y,X,Y]=b,w=X-x,d=Y-y,z=e.base+e.height/2;
   if(['wall','partition'].includes(e.kind)){
    e.finishRole='wall';
    if(e.base===0){if(w>d){for(const yy of [y-.008,Y+.008])this.box(e.id,[(x+X)/2,yy,.165],[w,.016,.09],'plaster',0xd3cbbd,'trim');}else for(const xx of [x-.008,X+.008])this.box(e.id,[xx,(y+Y)/2,.165],[.016,d,.09],'plaster',0xd3cbbd,'trim');}
    if(/^(south|north|west|east)-/.test(e.id)){const south=e.id.startsWith('south'),north=e.id.startsWith('north'),west=e.id.startsWith('west');this.box(e.id,[(south||north)?(x+X)/2:west?x-.0575:X+.0575,(south||north)?south?y-.0575:Y+.0575:(y+Y)/2,z],[(south||north)?w:.115,(south||north)?.115:d,e.height],'plaster',0xc0c5bd,'facade');}
   }
   if(e.kind==='door'){
    m.material.color.set(0xd6c8b0);const alongX=w>d,xx=(x+X)/2,yy=(y+Y)/2;
    if(alongX){this.box(e.id,[xx,yy-.021,1.15],[w-.14,.012,1.72],'plaster',0xded5c3,'door');this.line(e.id,[[X-.15,yy-.06,1.12],[X-.29,yy-.06,1.12]],.014);}
    else{this.box(e.id,[xx+.021,yy,1.15],[.012,d-.14,1.72],'plaster',0xded5c3,'door');this.line(e.id,[[xx+.06,Y-.15,1.12],[xx+.06,Y-.29,1.12]],.014);}
   }
   if(e.kind==='window-glass'){
    const alongX=w>d,xx=(x+X)/2,yy=(y+Y)/2;
    if(alongX){this.box(e.id,[xx,yy,e.base+e.height/2],[.045,.09,e.height],'metal',0xdddcd3);this.box(e.id,[xx,yy,e.base-.022],[w+.1,.28,.045],'marble',0xe4e0d5);for(const px of [x+.12,X-.12])this.box(e.id,[px,yy+.10,e.base+.65],[.018,.025,.15],'metal',0x7e8c8d);}
    else{this.box(e.id,[xx,yy,e.base+e.height/2],[.09,.045,e.height],'metal',0xdddcd3);this.box(e.id,[xx,yy,e.base-.022],[.28,d+.1,.045],'marble',0xe4e0d5);}
    if(alongX){
     const cy=e.id.startsWith('north')?7.16:.10;
     this.line(e.id,[[x-.12,cy,2.43],[X+.12,cy,2.43]],.014,'metal',0x777971);
     for(const edge of [x-.06,X-.24])for(let k=0;k<8;k++){
      const curtain=this.box(e.id,[edge+k*.043,cy+.025*Math.sin(k*1.7),1.31],[.045,.035,2.16],'plaster',0xc5bdab,'curtain',.008);curtain.castShadow=false;
     }
    }
   }
   if(['wall','partition'].includes(e.kind)){
    const low=Math.max(.12,e.base),top=Math.min(2.52,e.base+e.height);
    if(top>low){
     if(w>d&&((Math.abs(y-3.26)<.01&&X<=2.6)||(Math.abs(Y-1.82)<.01&&x<2.6))){const yy=y>3?y-.008:Y+.008;this.box(e.id,[(x+Math.min(X,2.6))/2,yy,(low+top)/2],[Math.min(X,2.6)-x,.016,top-low],'tile',0xaab1ab,'wet');}
     if(d>w&&((Math.abs(X)<.01)||(Math.abs(x-2.6)<.01))){const lo=Math.max(y,1.82),hi=Math.min(Y,3.26);if(hi>lo)this.box(e.id,[x>2?x-.008:X+.008,(lo+hi)/2,(low+top)/2],[.016,hi-lo,top-low],'tile',0xaab1ab,'wet');}
    }
   }
  }
  for(let i=0;i<3;i++){
   const r=this.view.project.rooms[i],x=r.bounds[0],cx=x+.875,host='bed-base-'+i;
   this.replace('bed-mattress-'+i);this.replace('bed-pillow-'+i);
   this.box(host,[cx,6.2,.47],[1.22,1.86,.20],'plaster',0xece8df,'fabric',.045);
   this.box(host,[cx,5.97,.60],[1.23,1.43,.16],'plaster',[0xb8c5be,0xc1bcb2,0xa8b8be][i],'fabric',.06);
   this.box(host,[cx,6.86,.65],[.78,.38,.16],'plaster',0xf0eee7,'fabric',.07);
   this.box(host,[cx,7.16,.68],[1.32,.08,1.1],'wood',0xb5a08b,'wood',.025);
   for(let j=0;j<7;j++)this.box(host,[cx,5.4+j*.17,.686],[1.16,.006,.003],'plaster',0xaeb6b0);
   this.box(host,[x+1.77,6.93,.34],[.43,.43,.44],'wood',0xc7ad89,'wood',.012);
   this.cylinder(host,[x+1.77,6.93,.61],.08,.018);this.cylinder(host,[x+1.77,6.93,.73],.012,.23);this.cylinder(host,[x+1.77,6.93,.87],.12,.17,'plaster',0xe5dbc7);
   const wid='wardrobe-'+i,m=this.host(wid),b=m.userData.footprint,xx=(b[0][0]+b[1][0])/2; m.material.color.set(0xd9d6cc);m.userData.finishRole='cabinet';
   for(const yy of [6.14,6.82]){this.box(wid,[b[0][0]-.012,yy,1.2],[.025,.64,2.08],'plaster',0xd9d6cc,'cabinet',.008);this.line(wid,[[b[0][0]-.04,yy-.2,1.0],[b[0][0]-.04,yy-.2,1.36]],.009);}
  }
  this.replace('sofa');this.replace('sofa-back');
  for(const x of [5.45,7.45])for(const y of [.4,.9])this.cylinder('sofa',[x,y,.20],.035,.16);
  this.box('sofa',[6.45,.65,.36],[2.3,.85,.25],'plaster',0xa8b0a6,'fabric',.07);
  for(const x of [5.74,6.45,7.16]){this.box('sofa',[x,.70,.56],[.68,.66,.18],'plaster',0xbac0b4,'fabric',.065);this.box('sofa',[x,.38,.81],[.69,.22,.58],'plaster',0xbac0b4,'fabric',.065);}
  for(const x of [5.32,7.58])this.box('sofa',[x,.65,.65],[.19,.88,.5],'plaster',0xb0b7ab,'fabric',.065);
  for(const x of [5.6,7.25]){const p=this.box('sofa',[x,.53,.86],[.35,.17,.36],'plaster',x<6?0x8d9b8b:0xc2ab8e,'fabric',.075);p.rotation.z=x<6?.22:-.22;}
  this.box('coffee-table',[6.3,1.57,.135],[2.7,2.15,.014],'plaster',0xd0cabd,'fabric',.003);
  this.replace('coffee-table');this.box('coffee-table',[6.3,1.57,.49],[1.05,.6,.05],'wood',0xb8a28a,'wood',.05);for(const x of [5.9,6.7])for(const y of [1.4,1.77])this.cylinder('coffee-table',[x,y,.30],.022,.35);
  this.box('coffee-table',[6.1,1.6,.535],[.23,.3,.025],'plaster',0x748b89);
  for(const x of [5.86,6.34,6.82,7.30]){this.box('kitchen',[x,3.63,.58],[.45,.035,.68],'plaster',0xc8cfc6,'cabinet',.008);this.line('kitchen',[[x-.13,3.6,.83],[x+.13,3.6,.83]],.009);this.box('kitchen',[x,4.07,1.97],[.45,.32,.73],'plaster',0xe3e0d6,'cabinet',.008);this.line('kitchen',[[x-.13,3.89,1.68],[x+.13,3.89,1.68]],.007);}
  this.box('kitchen',[6.6,4.25,1.3],[2.1,.018,.61],'tile',0xd8d8cd);this.host('counter').material=this.material('marble',0xe0ddd2);
  this.replace('sink');this.box('sink',[6.125,3.9,.96],[.56,.41,.018],'metal',0x6e7d80,'metal',.055);this.box('sink',[6.125,3.9,.967],[.43,.29,.008],'metal',0x37494b,null,.05);this.line('sink',[[6.12,4.14,.98],[6.12,4.14,1.23],[6.12,4.02,1.28],[6.12,3.98,1.19]],.014);
  for(const [x,y,r]of [[6.96,3.81,.075],[7.19,4.0,.065],[6.98,4.0,.055]])this.cylinder('hob',[x,y,1.01],r,.004,'metal',0x465459);
  this.box('kitchen',[6.82,3.605,.57],[.40,.025,.40],'metal',0x343e40,null,.012);this.line('kitchen',[[6.65,3.58,.77],[6.99,3.58,.77]],.014);
  this.box('fridge',[8.025,3.48,1.1],[.62,.035,1.8],'metal',0xc0c6c3);for(const z of [.77,1.47])this.line('fridge',[[7.77,3.445,z-.13],[7.77,3.445,z+.13]],.012);
  for(const [x,y,rot]of [[3.6,2.77,0],[4.45,2.77,0],[3.6,4.0,Math.PI],[4.45,4.0,Math.PI]]){
   const id='dining-table';for(const dx of [-.13,.13])for(const dy of [-.13,.13])this.box(id,[x+dx,y+dy,.33],[.025,.025,.42],'wood',0xa59075,'wood');this.box(id,[x,y,.55],[.39,.38,.055],'wood',0xb9a389,'wood',.025);this.box(id,[x,y+(rot? .17:-.17),.82],[.38,.045,.49],'wood',0xb9a389,'wood',.025);
  }
  this.cylinder('dining-table',[4.05,3.45,.88],.105,.12,'plaster',0xd9cec0);this.line('dining-table',[[4.05,3.45,.94],[4.08,3.45,1.19]],.007,'plaster',0x6f875e);for(const x of [4,4.11])this.mesh('dining-table',new THREE.SphereGeometry(.055,12,8),[x,3.45,1.14],'plaster',0x6d875b);
  this.replace('toilet');this.box('toilet',[.52,3.91,.55],[.43,.18,.64],'plaster',0xeeeae0,null,.05);this.mesh('toilet',new THREE.SphereGeometry(1,24,16),[.52,3.65,.38],'plaster',0xeeeae0).scale.set(.25,.22,.34);const seat=this.mesh('toilet',new THREE.TorusGeometry(.2,.032,12,32),[.52,3.60,.58],'plaster',0xf4f0e6);seat.rotation.x=Math.PI/2;seat.scale.y=1.3;
  this.replace('basin');this.box('basin',[1.975,3.94,.79],[.73,.46,.54],'wood',0xb2aa97,'cabinet',.02);this.box('basin',[1.975,3.94,1.08],[.78,.50,.05],'marble',0xe8e4da,null,.035);this.mesh('basin',new THREE.SphereGeometry(1,24,16),[1.975,3.94,1.12],'plaster',0xf3eee2).scale.set(.28,.08,.17);this.line('basin',[[1.975,4.11,1.10],[1.975,4.11,1.29],[1.975,3.99,1.29]],.013);this.box('basin',[1.975,4.25,1.64],[.76,.024,.72],'metal',0xc6d5d4);
  this.box('shower',[1.04,2.33,1.19],[.012,.92,2.12],'glass',0xc6dce0);this.line('shower',[[.15,2.35,1.1],[.15,2.35,2.16],[.40,2.35,2.16]],.014);this.cylinder('shower',[.4,2.35,2.14],.105,.02);this.box('shower',[.65,2.35,.124],[.18,.18,.006],'metal',0x697776);for(let i=0;i<5;i++)this.box('shower',[.59+i*.03,2.35,.128],[.008,.15,.002],'plaster',0x304443);
  this.box('shoe-cabinet',[.52,.83,1.21],[.025,1.4,2.12],'plaster',0xdedbd1,'cabinet');this.box('shoe-cabinet',[.54,.55,1.47],[.014,.45,1.4],'metal',0xb9c9c8);
 }
 setPalette(id){const p=apartmentPalettes.find(p=>p.id===id)??apartmentPalettes[0];this.palette=p.id;for(const m of [...this.view.base.children,...this.parts]){const role=m.userData.finishRole;if(role==='wall')m.material.color.set(p.wall);if(role==='wood')m.material.color.set(p.wood);if(role==='cabinet')m.material.color.set(p.cabinet);if(role==='fabric')m.material.color.set(p.fabric);if(m.userData.id?.startsWith('floor-finish-')&&!/bath|entry/.test(m.userData.id))m.material.color.set(p.wood);}this.view.host.dataset.apartmentPalette=p.id;}
 setCutaway(on){this.cutaway=on;this.view.renderer.localClippingEnabled=true;const planes=on?[new THREE.Plane(new THREE.Vector3(0,-1,0),1.32)]:[];for(const host of this.view.base.children)if(['wall','partition','door','frame','window-glass'].includes(host.userData.kind))host.traverse(m=>{if(m.material){m.material.clippingPlanes=planes;m.material.clipShadows=on;m.material.needsUpdate=true;}});this.view.host.dataset.cutaway=String(on);}
 showAssembly(id){const a=apartmentAssemblies.find(a=>a.id===id)??apartmentAssemblies[0];this.assembly=a.id;const v=this.view;v.view('materials','iso');v.materialExpanded=true;v.clear(v.materialGroup);let offset=0;for(const l of a.layers){const g=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.6,l.mm/1000),this.material(['wood','tile'].includes(l.id)?l.id:'plaster',l.color));g.position.set(4.2+offset,.95,-3-offset);g.userData={id:'assembly-'+a.id+'-'+l.id,name:l.name,layer:l,assembly:a};v.materialGroup.add(g);offset+=.30+l.mm/1000;}v.camera.position.set(8.7,3.1,2.5);v.controls.target.set(4.8,1,-3.5);v.controls.update();v.applyVisibility();v.site.visible=false;v.host.dataset.assembly=a.id;}
}
