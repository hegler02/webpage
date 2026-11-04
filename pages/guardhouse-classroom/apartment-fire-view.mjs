import * as THREE from 'three';
import {pointAlong} from '/pages/guardhouse-classroom/src/electrical-installation.mjs';
const V=p=>new THREE.Vector3(p[0],p[2],-p[1]);
export class ApartmentFireView{
 constructor(view){this.view=view;this.group=new THREE.Group();view.scene.add(this.group);this.active=false;this.raf=0;}
 clear(){cancelAnimationFrame(this.raf);this.playing=false;this.view.clear(this.group);this.marker=null;}
 stop(){this.clear();this.active=false;this.view.host.dataset.fireGuide='off';}
 focus(id){const v=this.view,obj=v.fireMeshes.get(id);if(!obj)return;const p=obj.position.clone();v.active=v.camera;v.controls.object=v.camera;v.controls.enableRotate=true;v.camera.fov=60;v.camera.updateProjectionMatrix();v.controls.target.copy(p);v.camera.position.copy(p).add(new THREE.Vector3(1.5,1.1,2.2));v.controls.update();v.highlight(id);}
 show(lesson,step,fire){
  this.clear();this.active=true;this.lesson=lesson;this.step=step;this.progress=0;this.powered=fire.powered;this.alarm=fire.alarm;const v=this.view;
  v.view('fire','iso');v.apartmentDetails?.setCutaway(step===2);v.site.visible=false;v.camera.fov=60;v.camera.updateProjectionMatrix();
  this.path=step===2?lesson.escape:lesson.signal;const color=step===2?0x209e7e:fire.powered?0xef6849:0x8a9495;
  for(let i=1;i<this.path.length;i++){const a=V(this.path[i-1]),b=V(this.path[i]),len=a.distanceTo(b);if(len<1e-6)continue;const m=new THREE.Mesh(new THREE.CylinderGeometry(step===2?.035:.022,step===2?.035:.022,len,12),new THREE.MeshBasicMaterial({color,transparent:true,opacity:step===0?.3:1,depthTest:false}));m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.sub(a).normalize());m.renderOrder=8;this.group.add(m);}
  this.marker=new THREE.Mesh(new THREE.SphereGeometry(.075,16,10),new THREE.MeshBasicMaterial({color:step===2?0xc4ffe3:0xffdb8c,depthTest:false}));this.marker.renderOrder=9;this.marker.position.copy(V(this.path[0]));this.group.add(this.marker);
  v.highlight(lesson.steps[step].target);if(step===0)this.focus(lesson.detector.id);this.readout();
 }
 readout(){Object.assign(this.view.host.dataset,{fireGuide:this.active?this.lesson.detector.id:'off',fireStep:String(this.step),firePlaying:String(!!this.playing),fireProgress:this.progress.toFixed(3),fireSignalPowered:String(this.powered)});}
 play(){if(this.step===0||this.step===1&&!this.alarm)return;this.playing=!this.playing;cancelAnimationFrame(this.raf);if(this.progress>=1)this.progress=0;let last=performance.now();const frame=now=>{if(!this.playing||!this.active)return;this.progress=Math.min(1,this.progress+(now-last)/9000);last=now;this.marker.position.copy(V(pointAlong(this.path,this.progress)));this.readout();if(this.progress<1)this.raf=requestAnimationFrame(frame);else{this.playing=false;this.readout();this.view.host.dispatchEvent(new CustomEvent('fire-guide-ended'));}};if(this.playing)this.raf=requestAnimationFrame(frame);this.readout();}
}
