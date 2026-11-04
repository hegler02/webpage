import * as THREE from 'three';
export function createExtinguisher(){const group=new THREE.Group(),metal=new THREE.MeshStandardMaterial({color:0xc6cccd,metalness:.8,roughness:.25}),red=new THREE.MeshStandardMaterial({color:0xb82924,roughness:.32,metalness:.15}),black=new THREE.MeshStandardMaterial({color:0x242c2d,roughness:.6});
 const add=(g,m,p)=>{const o=new THREE.Mesh(g,m);o.position.set(...p);o.castShadow=true;group.add(o);return o;};
 add(new THREE.CylinderGeometry(.082,.085,.34,32),red,[0,.21,0]);add(new THREE.SphereGeometry(.082,24,12),red,[0,.38,0]);add(new THREE.CylinderGeometry(.09,.09,.025,24),black,[0,.035,0]);add(new THREE.CylinderGeometry(.028,.04,.065,16),metal,[0,.45,0]);
 const lever=add(new THREE.BoxGeometry(.16,.018,.032),black,[.035,.51,0]);add(new THREE.BoxGeometry(.14,.018,.035),metal,[.035,.478,0]);
 const pin=add(new THREE.TorusGeometry(.023,.004,8,20),metal,[-.056,.49,.015]);
 const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#faf6e8';x.beginPath();x.arc(64,64,61,0,7);x.fill();x.lineWidth=18;for(const [a,b,color]of [[Math.PI*.8,Math.PI*1.15,'#d84c34'],[Math.PI*1.15,Math.PI*1.85,'#388d54'],[Math.PI*1.85,Math.PI*2.2,'#d84c34']]){x.strokeStyle=color;x.beginPath();x.arc(64,64,44,a,b);x.stroke();}const tex=new THREE.CanvasTexture(c);const dial=add(new THREE.CircleGeometry(.025,32),new THREE.MeshStandardMaterial({map:tex,roughness:.6}),[0,.443,.037]);dial.userData.ownedTexture=true;
 const needle=add(new THREE.BoxGeometry(.002,.019,.002),black,[0,.451,.040]);
 const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(.04,.47,0),new THREE.Vector3(.13,.43,0),new THREE.Vector3(.14,.24,.02)]);add(new THREE.TubeGeometry(curve,20,.009,8,false),black,[0,0,0]);add(new THREE.CylinderGeometry(.014,.012,.07,12),black,[.14,.20,.02]);
 const label=add(new THREE.PlaneGeometry(.09,.14),new THREE.MeshStandardMaterial({color:0xf1e9d4,roughness:.6}),[0,.23,.085]);
 group.userData.extinguisherParts={pin,lever,needle};return group;
}
