import * as THREE from 'three';

function part(group, geometry, color, x, y, z) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color, roughness:.48, metalness:.26}));
  mesh.position.set(x,y,z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = {...group.userData};
  group.add(mesh);
  return mesh;
}

export function buildDeskLamp(group, device) {
  const lens = part(group,new THREE.CylinderGeometry(.075,.075,.008,24),0xfff4df,0,.14,.015);
  lens.name = 'diffuser';
  part(group,new THREE.CylinderGeometry(.081,.09,.019,24),0x37565a,0,-.17,0);
  part(group,new THREE.CylinderGeometry(.009,.012,.30,12),0xb6925c,-.06,-.01,0);
  part(group,new THREE.BoxGeometry(.08,.014,.015),0xad8c56,-.027,.145,0);
  part(group,new THREE.CylinderGeometry(.048,.08,.032,24),0x365655,0,.16,.015);
  const light = new THREE.PointLight(0xffe0ab,0,1.6,2);
  light.position.set(0,.12,.015);
  group.add(light);
  const points = (device.cord??[]).map(([x,y,z]) => new THREE.Vector3(x-device.pos[0], z-device.pos[2], device.pos[1]-y));
  for (let i=1;i<points.length;i++) {
    const a=points[i-1], b=points[i], axis=b.clone().sub(a);
    if (axis.length()<.001) continue;
    const mid=a.clone().lerp(b,.5);
    const cable=part(group,new THREE.CylinderGeometry(.004,.004,axis.length(),8),0x303638,mid.x,mid.y,mid.z);
    cable.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),axis.normalize());
  }
  setLampPower(group,device);
}

export function setLampPower(group, device) {
  const lens = group.getObjectByName('diffuser');
  lens.material.emissive.setHex(device.on ? 0xffdfa2 : 0);
  lens.material.emissiveIntensity = device.on ? 1.7 : 0;
  group.children.find(o => o.isPointLight).intensity = device.on ? device.watts * .20 : 0;
}

export function addDrawerFronts(mesh, item) {
  const [[x,y],[right]] = item.footprint;
  const middle = (x+right)/2;
  for (let row=0; row<3; row++) {
    const level = item.base + .15 + row*.23;
    part(mesh,new THREE.BoxGeometry(right-x-.024,.214,.014),0xbc9673,middle,level,-y+.008);
    part(mesh,new THREE.BoxGeometry(.16,.012,.022),0x48595b,middle,level+.057,-y+.026);
  }
}
