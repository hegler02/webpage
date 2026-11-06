import * as THREE from 'three';

// A diagram of the current representative strip, not a deformation simulation.
export class StructuralLoadView {
 constructor(scene,host){this.host=host;this.group=new THREE.Group();this.group.name='structural-load';scene.add(this.group);this.arrows=[];for(let i=0;i<5;i++){const arrow=new THREE.ArrowHelper(new THREE.Vector3(0,-1,0),new THREE.Vector3(),1,0xbc5c2b,.13,.07);this.group.add(arrow);this.arrows.push(arrow);}this.group.visible=false;}
 update(target,live,base,span){
  this.group.visible=Boolean(target)&&Number.isFinite(live)&&live>=0;
  if(!this.group.visible){delete this.host.dataset.loadTarget;return;}
  const box=new THREE.Box3().setFromObject(target),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
  const scale=Math.min(1,Math.max(.2,Math.min(size.x,size.z)/2));
  const length=live===0?0:(.18+Math.min(.5,live/Math.max(base,1)*.12))*scale,run=Math.min(span??size.z,size.z)*.8;
  this.arrows.forEach((arrow,i)=>{arrow.visible=live>0;arrow.position.set(center.x,box.max.y+.08*scale+length,center.z+run*(i/4-.5));if(live>0)arrow.setLength(length,Math.min(.13*scale,length/3),.07*scale);});
  this.host.dataset.loadTarget=target.userData.id??'slab';this.host.dataset.liveLoad=String(live);
 }
}
