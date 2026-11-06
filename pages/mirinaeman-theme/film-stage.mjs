// The page's one surface: paintings with real depth, and a transition between each pair
// of scenes that is computed from scroll. Same grammar as the film's own cuts.
const VERT=`#version 300 es
out vec2 v;void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);v=p;gl_Position=vec4(p*2.-1.,0,1);}`;
const FRAG=`#version 300 es
precision highp float;in vec2 v;out vec4 o;
uniform sampler2D ta,tb,da,db;uniform float p,kind,seed,za,zb,time,aspect,veil;uniform vec2 dir,centre,par;uniform float fa,fb;
float h(vec2 q){q=fract(q*vec2(123.34,456.21));q+=dot(q,q+45.32);return fract(q.x*q.y);}
float vn(vec2 q){vec2 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 q){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*vn(q);q=q*2.03+7.1;a*=.5;}return s;}
// Voronoi: x = this crystal's own random value, y = distance to its nearest wall.
vec2 cells(vec2 q){vec2 i=floor(q),f=fract(q);float a=9.,b=9.,id=0.;for(int y=-2;y<=2;y++)for(int x=-2;x<=2;x++){vec2 g=vec2(x,y),o=vec2(h(i+g),h(i+g+7.)),r=g+o-f;float d=dot(r,r);if(d<a){b=a;a=d;id=h(i+g+13.);}else if(d<b)b=d;}return vec2(id,sqrt(b)-sqrt(a));}
// On a tall screen, slide the crop toward each painting's subject.
vec2 cover(vec2 u,float z,float focus){vec2 s=aspect>1.7778?vec2(1.,1.7778/aspect):vec2(aspect/1.7778,1.);vec2 c=.5+(u-.5)*s/z;c.x+=(focus-.5)*(1.-s.x/z);return c;}
vec3 scene(sampler2D t,sampler2D d,vec2 u,float z,float focus,vec2 bend){
 vec2 c=cover(u,z,focus)+bend;float dep=texture(d,vec2(c.x,1.-c.y)).r;
 c+=par*(dep-.5);return texture(t,vec2(c.x,1.-c.y)).rgb;
}
void main(){
 vec2 q=(v-centre)*vec2(aspect,1.);float r=length(q);
 float n=clamp((fbm(v*vec2(2.4,3.6)+seed)-.26)/.48,0.,1.);
 float ax=dot(v-.5,normalize(dir))+.5;
 vec3 edge=vec3(0.);float e=0.;vec2 bendA=vec2(0.),bendB=vec2(0.);
 if(kind<.5||kind==1.){ // gust, burn: a wind or flame front crosses the frame
  float m=n*.6+ax*.4;e=1.-smoothstep(p*1.5-.36,p*1.5-.04,m);
  bendA=dir*sin(p*3.14)*.05*(1.-e);bendB=-dir*sin(p*3.14)*.03*e;
  float g=1.-smoothstep(0.,.035,abs(m-(p*1.5-.2)));
  if(kind==1.)edge=vec3(1.,.42,.08)*g*.8+vec3(1.,.82,.5)*pow(g,6.)*.9;else edge=vec3(.75,.85,.95)*g*.28;
 }else if(kind==2.){ // frost: the frame crystallises cell by cell
  // Long, narrow crystals grow across the frame, each turning over on its own moment.
  vec2 c=cells((v-.5)*vec2(aspect*5.,13.)+seed+vec2(n*1.2,0.));float m=c.x*.42+ax*.58,front=p*1.5-.26;
  e=1.-smoothstep(front-.015,front+.015,m);
  float near=1.-smoothstep(0.,.14,abs(m-front));
  edge=vec3(.74,.89,1.)*(1.-smoothstep(0.,.03,c.y))*near*.75;
  bendA=(vec2(c.x,fract(c.x*7.))-.5)*near*.012;bendB=bendA;
 }else if(kind==3.){ // iris: the world closes down onto one ember
  float rad=(1.-p)*1.05;float m=r+(n-.5)*.16;e=smoothstep(rad-.03,rad+.03,m);
  e=mix(0.,e,1.);edge=vec3(1.,.42,.1)*(1.-smoothstep(0.,.02,abs(m-rad)))*.9;
 }else if(kind==4.){ // bloom: the same ember opens the next world
  float rad=p*1.15;float m=r+(n-.5)*.2;e=1.-smoothstep(rad-.05,rad+.02,m);edge=vec3(1.,.5,.14)*(1.-smoothstep(0.,.03,abs(m-rad)))*1.1;
 }else if(kind==5.){ // shock: a voice travels outward and bends the picture
  float rad=p*1.3,band=r-rad;vec2 nq=q/(r+1e-3)/vec2(aspect,1.);
  float wave=sin(band*38.)*exp(-band*band*40.);bendA=nq*wave*.03;bendB=nq*wave*.03;
  e=1.-smoothstep(rad-.04,rad+.04,r);edge=vec3(1.,.92,.75)*exp(-band*band*220.)*.9;
 }else{ // dawn: nothing cuts, light simply arrives
  e=smoothstep(0.,1.,p);edge=vec3(1.,.72,.42)*sin(p*3.14)*.16;
 }
 vec3 c=mix(scene(ta,da,v,za,fa,bendA),scene(tb,db,v,zb,fb,bendB),clamp(e,0.,1.))+edge;
 float vig=smoothstep(1.15,.35,length((v-.5)*vec2(1.1,1.3)));c*=mix(.5,1.,vig);
 c*=1.-veil;
 c+=(h(v*vec2(1600.,900.)+fract(time)*91.)-.5)*.035;
 o=vec4(c,1.);
}`;

export class FilmStage{
 constructor(canvas,scenes){
  this.canvas=canvas;this.scenes=scenes;this.cache=new Map();
  const gl=this.gl=canvas.getContext('webgl2',{antialias:false,alpha:false,powerPreference:'high-performance'});
  if(!gl)throw Error('webgl2');
  gl.bindVertexArray(gl.createVertexArray());
  const mk=(t,src)=>{const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const pr=gl.createProgram();gl.attachShader(pr,mk(gl.VERTEX_SHADER,VERT));gl.attachShader(pr,mk(gl.FRAGMENT_SHADER,FRAG));gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(pr));gl.useProgram(pr);
  this.u=n=>gl.getUniformLocation(pr,n);
  ['ta','da','tb','db'].forEach((n,i)=>gl.uniform1i(this.u(n),i));
  this.blank=this.texture(null);
 }
 texture(image){
  const gl=this.gl,t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
  if(image)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([5,7,10,255]));
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  return t;
 }
 // Only the scenes near the viewer stay decoded.
 want(index){
  for(const k of [index-1,index,index+1,index+2]){
   const s=this.scenes[k];if(!s||this.cache.has(k))continue;
   const entry={colour:this.blank,depth:this.blank};this.cache.set(k,entry);
   const load=(src,key)=>{const im=new Image();im.src=src;im.decode().then(()=>{if(this.cache.get(k)===entry)entry[key]=this.texture(im);}).catch(()=>{});};
   load(s.image,'colour');load(s.depth,'depth');
  }
  for(const [k,e] of this.cache)if(k<index-2||k>index+3){for(const t of [e.colour,e.depth])if(t!==this.blank)this.gl.deleteTexture(t);this.cache.delete(k);}
 }
 resize(){
  const dpr=Math.min(devicePixelRatio||1,1.5),w=Math.round(innerWidth*dpr),h=Math.round(innerHeight*dpr);
  if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;this.gl.viewport(0,0,w,h);}
 }
 draw({index,mix,zoomA,zoomB,par,time,veil=0}){
  const gl=this.gl,a=this.scenes[index],b=this.scenes[Math.min(index+1,this.scenes.length-1)],t=a.to||{kind:6,dir:[1,0],centre:[.5,.5]};
  const ea=this.cache.get(index),eb=this.cache.get(Math.min(index+1,this.scenes.length-1));
  [[ea?.colour],[ea?.depth],[eb?.colour],[eb?.depth]].forEach(([tex],i)=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,tex||this.blank);});
  gl.uniform1f(this.u('p'),mix);gl.uniform1f(this.u('kind'),t.kind);gl.uniform1f(this.u('seed'),index*3.7);gl.uniform1f(this.u('za'),zoomA);gl.uniform1f(this.u('zb'),zoomB);
  gl.uniform1f(this.u('time'),time);gl.uniform1f(this.u('aspect'),innerWidth/innerHeight);gl.uniform1f(this.u('veil'),veil);gl.uniform1f(this.u('fa'),a.focus??.5);gl.uniform1f(this.u('fb'),b.focus??.5);
  gl.uniform2fv(this.u('dir'),t.dir);gl.uniform2fv(this.u('centre'),t.centre);gl.uniform2fv(this.u('par'),par);
  gl.drawArrays(gl.TRIANGLES,0,3);
 }
}
