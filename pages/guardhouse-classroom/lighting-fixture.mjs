import * as THREE from 'three';
// One physical fixture and power-state owner for the guardhouse/apartment renderer.
export function addLuminaireDetails(group,device){
  const light=new THREE.SpotLight(0xfff0d6,0,7,Math.PI*.39,.65,2);
  light.position.y=-.07;light.target.position.set(0,-2,0);light.shadow.mapSize.set(512,512);
  light.shadow.bias=-.001;light.shadow.normalBias=.025;light.shadow.camera.near=.15;
  group.add(light,light.target);
  const [width,depth]=device.size,edge=.008;
  const material=new THREE.MeshStandardMaterial({color:0xc5c9c6,metalness:.7,roughness:.28});
  for(const [w,d,x,z]of [[width+2*edge,edge,0,-depth/2-edge/2],[width+2*edge,edge,0,depth/2+edge/2],[edge,depth,-width/2-edge/2,0],[edge,depth,width/2+edge/2,0]]){
    const rim=new THREE.Mesh(new THREE.BoxGeometry(w,.025,d),material);
    rim.position.set(x,.018,z);rim.userData=device;group.add(rim);
  }
  const fill=new THREE.PointLight(0xfff2db,0,3,2);fill.position.y=-.18;group.add(fill);
  syncLuminaire(group,device);return light;
}
export function syncLuminaire(group,device){
  const diffuser=group.children[0];diffuser.castShadow=false;
  diffuser.material.color.set(device.on?0xfff2d2:0x667780);
  diffuser.material.emissive.set(device.on?0xffdda1:0);
  diffuser.material.emissiveIntensity=device.on?1.8:0;
  for(const light of group.children.filter(child=>child.isLight)){
    light.visible=true;light.castShadow=light.isSpotLight;
    light.intensity=device.on?(light.isSpotLight?device.lumens/(4*Math.PI)*.14:1.4):0;
  }
}
