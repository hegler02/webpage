// Same Three.js camera and world, two drawing backends. A disabled GPU must
// not erase relationships or the user's ability to explore spatially.
export function createRenderer(THREE) {
  try{return {renderer:new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'}),mode:'WebGL'};}
  catch{return {renderer:svgRenderer(THREE),mode:'SVG'};}
}
function svgRenderer(THREE){
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  let width=1,height=1;const vector=new THREE.Vector3();
  const point=(x,y,z,matrix,camera)=>{vector.set(x,y,z).applyMatrix4(matrix).project(camera);return [(vector.x*.5+.5)*width,(-vector.y*.5+.5)*height];};
  return {
    domElement:svg,setPixelRatio(){},
    setSize(w,h){width=w;height=h;svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.setAttribute('width',w);svg.setAttribute('height',h);},
    render(scene,camera){
      const fragments=[];scene.updateMatrixWorld(true);
      scene.traverse(object=>{
        if(!object.isLine&&!object.isPoints)return;
        const a=object.geometry.attributes.position,color='#'+object.material.color.getHexString();
        if(object.isLine){const coords=[];for(let i=0;i<a.count;i++){const [x,y]=point(a.getX(i),a.getY(i),a.getZ(i),object.matrixWorld,camera);coords.push(`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`);}fragments.push(`<path d="${coords.join(' ')}" fill="none" stroke="${color}" stroke-opacity="${object.material.opacity}" stroke-width="1"/>`);}
        else{for(let i=0;i<a.count;i++){const [x,y]=point(a.getX(i),a.getY(i),a.getZ(i),object.matrixWorld,camera);if(x>=0&&x<=width&&y>=0&&y<=height)fragments.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r=".7" fill="${color}" opacity="${object.material.opacity}"/>`);}}
      });
      svg.innerHTML=fragments.join('');
    },dispose(){svg.replaceChildren();},forceContextLoss(){}
  };
}
