import * as THREE from 'three';
import {lightingTour,pointAlong,embeddedBoxes} from '/pages/guardhouse-classroom/src/electrical-installation.mjs';
const V=p=>new THREE.Vector3(p[0],p[2],-p[1]);
export class ElectricalTour {
 constructor(view){this.view=view;this.group=new THREE.Group();view.scene.add(this.group);this.active=false;this.playing=false;this.follow=true;this.ghost=true;this.progress=0;}
 clear(){this.view.clear(this.group);this.marker=null;}
 stop(){this.playing=false;this.active=false;this.clear();this.view.host.dataset.tour='off';}
 show(id,step=0,focus=true){
  const tour=lightingTour(this.view.electric,id);if(!tour)return false;
  this.clear();this.data=tour;this.id=id;this.step=Math.max(0,Math.min(4,step));this.active=true;this.progress=0;this.playing=false;
  const {route,control,device}=tour;
  const paths=this.step===2?[control]:[route];
  for(const path of paths){
   for(let i=1;i<path.points.length;i++){const a=V(path.points[i-1]),b=V(path.points[i]),len=a.distanceTo(b);if(len<.00001)continue;
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,len,12),new THREE.MeshStandardMaterial({color:this.step===4?0x54b7c7:0xf0b64e,emissive:this.step===4?0x164956:0x51360c,roughness:.36,metalness:.3}));mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());this.group.add(mesh);
   }
  }
  const box=embeddedBoxes[device.id]??device.embedded;
  if(box&&this.step===2){const p=box.center,host=box.host;const g=new THREE.Mesh(new THREE.BoxGeometry(.11,.15,.08),new THREE.MeshStandardMaterial({color:0x687984,metalness:.7,roughness:.4,transparent:true,opacity:.65}));g.position.copy(V(p));if(device.size[0]<device.size[1])g.rotation.y=Math.PI/2;g.userData.host=host;this.group.add(g);}
  this.marker=new THREE.Mesh(new THREE.SphereGeometry(.065,16,10),new THREE.MeshBasicMaterial({color:0xffe5a4,depthTest:false}));this.marker.renderOrder=12;this.group.add(this.marker);
  this.path=this.step===2?control.points:route.points;this.marker.position.copy(V(tour.steps[this.step].point));
  this.view.highlight(tour.steps[this.step].element);this.view.applyVisibility();
  if(focus)this.focus(tour.steps[this.step].point,this.step===2?1.6:this.step===0?2.4:this.step===3?2.8:7.8);
  this.readout();return true;
 }
 focus(point,distance){const view=this.view,p=V(point);view.active=view.camera;view.controls.object=view.camera;view.controls.enableRotate=true;view.camera.position.copy(p).add(new THREE.Vector3(.7,.5,1).normalize().multiplyScalar(distance/Math.min(1,view.camera.aspect)));view.controls.target.copy(p);view.controls.update();view.size();}
 readout(){const h=this.view.host;h.dataset.tour=this.active?this.id:'off';h.dataset.tourStep=String(this.step);h.dataset.tourPlaying=String(this.playing);h.dataset.tourGhost=String(this.ghost);h.dataset.tourPower=String(this.data?.light.on??false);}
 update(dt){
  if(!this.active||!this.playing||!this.marker||this.view.host.offsetParent===null)return;
  this.progress=Math.min(1,this.progress+dt/14);const p=pointAlong(this.path,this.progress);this.marker.position.copy(V(p));
  if(this.follow){this.view.controls.target.lerp(V(p),.12);const offset=new THREE.Vector3(1.9,1.5,2.7);this.view.camera.position.lerp(V(p).add(offset),.08);}
  if(this.progress>=1){this.playing=false;this.readout();this.view.host.dispatchEvent(new CustomEvent('tour-ended'));}
 }
 play(){if(this.progress>=1)this.progress=0;this.playing=!this.playing;this.readout();}
}
