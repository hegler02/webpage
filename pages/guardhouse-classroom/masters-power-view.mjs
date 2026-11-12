// How the masters models show power in the electrical lesson: a soft halo around every lit lamp, a dark lens on a dead one.
import * as THREE from 'three';

let sprite=null;
function glowTexture(){
 if(sprite)return sprite;
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);
 r.addColorStop(0,'rgba(255,244,214,1)');r.addColorStop(.22,'rgba(255,214,140,.72)');r.addColorStop(.55,'rgba(255,176,72,.2)');r.addColorStop(1,'rgba(255,160,40,0)');
 g.fillStyle=r;g.fillRect(0,0,128,128);sprite=new THREE.CanvasTexture(c);sprite.colorSpace=THREE.SRGBColorSpace;return sprite;
}

// One halo per lamp, kept in its own group so picking and the selection box never see it.
export function createLampHalos(deviceMeshes,{size=1.7}={}){
 const group=new THREE.Group(),halos=new Map();group.renderOrder=6;
 for(const [id,g] of deviceMeshes){
  if(g.userData.kind!=='light')continue;g.updateMatrixWorld(true);
  // A long fitting gets a halo every 1.4 m along its body, a small one gets a single halo.
  const box=new THREE.Box3().setFromObject(g.userData.indicator??g),span=box.getSize(new THREE.Vector3()),at=box.getCenter(new THREE.Vector3()),long=span.x>=span.z?'x':'z',n=Math.max(1,Math.round(span[long]/1.4)),list=[];
  for(let i=0;i<n;i++){
   const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(),color:0xffd9a0,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,toneMapped:false,transparent:true}));
   s.position.copy(at);s.position[long]+=(i-(n-1)/2)*span[long]/n;s.scale.setScalar(size);s.raycast=()=>{};s.visible=false;s.renderOrder=6;list.push(s);group.add(s);
  }
  halos.set(id,list);
 }
 return {group,
  // lit lamps glow, dead lamps lose their bright lens; outside the power lesson everything returns to normal.
  show(id,g,{lit,power,visible}){
   const list=halos.get(id);if(!list)return;for(const s of list)s.visible=power&&lit&&visible;
   const dot=g.userData.indicator?.material;if(!dot)return;
   g.userData.lens??=dot.color.getHex();dot.color.setHex(power&&!lit?0x3d4448:g.userData.lens);
  }};
}
