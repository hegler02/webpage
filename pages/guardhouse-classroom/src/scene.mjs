import * as THREE from 'three';
export const palette={wall:0xe4d8c5,partition:0x9fb8b2,window:0x64b7cd,door:0xb8875b,floor:0xbbb6ac,roof:0xd2c6ae,parapet:0xd3c0a5,canopy:0xc9c6b5,foundation:0xa9aaa4,frame:0xe6ece7,stone:0xb8b4a3,waterproof:0xa8b5af,finish:0xd7ccbb,furniture:0xb6a183,fixture:0xecece4,pipe:0x91a5a3,insulation:0xd6c48b,'ceiling-frame':0x7f9399,hatch:0x8da09a};
function makeShape(points,holes=[]){const vectors=pts=>pts.map(p=>new THREE.Vector2(...p.map(v=>Math.round(v*1e8)/1e8)));const s=new THREE.Shape(vectors(points));for(const hole of holes)s.holes.push(new THREE.Path(vectors(hole)));return s;}
export function isElementVisible(item,settings={}){const group=item.group??(item.kind==='roof'?'roof':null);if(settings.foundationOnly)return group==='foundation';return !group||settings[group]!==false;}
export function prepareForExport(group){group.traverse(item=>{if(item.isLine){const previous=item.material;item.material=new THREE.MeshBasicMaterial({color:previous.color});previous.dispose();}});return group;}
export function createModelGroup(model) {
  const group=new THREE.Group();group.name=model.name;
  for(const item of model.elements) {
    if(item.linePoints){const geometry=new THREE.BufferGeometry().setFromPoints(item.linePoints.map(([x,y,z])=>new THREE.Vector3(x,z,-y)));const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:item.color??0x59675e}));line.name=item.name;line.userData={...item};group.add(line);continue;}
    const shape=makeShape(item.profile?.points??item.footprint,item.profile?item.profileHoles:item.holes);
    let geometry;
    if(item.surfaceMesh){
      const s=item.surfaceMesh,coords=[];
      const put=(p,z=p[2])=>coords.push(p[0],p[1],z-item.base);
      for(const t of s.triangles){for(const i of t)put(s.vertices[i]);for(const i of [...t].reverse())put(s.vertices[i],item.base);}
      for(let i=0;i<s.rim.length;i++){const a=s.vertices[s.rim[i]],b=s.vertices[s.rim[(i+1)%s.rim.length]];put(a,item.base);put(b,item.base);put(b);put(a,item.base);put(b);put(a);}
      geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));geometry.computeVertexNormals();
    }else geometry=new THREE.ExtrudeGeometry(shape,{depth:item.profile?.depth??item.height,bevelEnabled:false,steps:1});
    const pos=geometry.attributes.position;
    if(item.profile){const pr=item.profile;for(let i=0;i<pos.count;i++){const u=pos.getX(i),z=pos.getY(i),d=pr.start+pos.getZ(i);pos.setXYZ(i,pr.axis==='x'?u:d,z,pr.axis==='x'?-d:-u);}geometry.computeVertexNormals();}
    else {
      if(item.topHeights){for(let i=0;i<pos.count;i++){if(pos.getZ(i)<=0)continue;const j=item.footprint.findIndex(([x,y])=>Math.abs(x-pos.getX(i))<1e-5&&Math.abs(y-pos.getY(i))<1e-5);if(j>=0)pos.setZ(i,item.topHeights[j]-item.base);}geometry.computeVertexNormals();}
      // CAD XY -> renderer X,-Z; CAD height -> renderer Y. Keep handedness.
      geometry.rotateX(-Math.PI/2);geometry.translate(0,item.base,0);
    }
    const glazed=['window','window-glass'].includes(item.kind);
    const material=new THREE.MeshStandardMaterial({color:item.color??(glazed?palette.window:palette[item.kind])??palette.wall,roughness:0.78,metalness:item.kind==='frame'?.25:0,transparent:glazed,opacity:glazed?0.44:1,side:THREE.DoubleSide});
    const mesh=new THREE.Mesh(geometry,material);mesh.name=item.name;mesh.userData={...item};mesh.castShadow=true;mesh.receiveShadow=true;
    group.add(mesh);
  }
  group.userData={source:model.source,sourceFiles:model.sourceFiles,notes:model.notes,issues:model.issues,parameters:model.parameters,revision:model.revision,origin:model.origin,design:model.design,units:'metres'};
  return group;
}
