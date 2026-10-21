/* 降龍 · 蛤蟆 — the whole duel, image-based.
   Ink is a real fluid; every creature is its original painting laid on a mesh that follows
   its own path. Forms resolve out of the ink and dissolve back into it; no frame swaps,
   no scaling-up, no anatomy squash. One clock drives everything. */
'use strict';

// ---------- timeline: every beat lives here ----------
const BEAT={
 gather:.3,release:2.2,form:3.5,formed:8.8,cut:10.5,               // Hong: palm strike becomes the dragon
 gather2:10.7,release2:13,toadForm:13.5,toadFormed:15.8,           // Ouyang: 蛤蟆功 becomes the toad
 turn:16.2,turned:18.4,                                            // the toad whirls round to face the dragon
 dragonEnter:17.4,contact:21.5,burst:22.3,blast:22.45,             // collision
 aftermath:25.2,endCard:28.2,end:31
};
// 蛤蟆功 pressure waves while the toad turns, swelling, the last one as its back comes round: [time, strength]
const PULSES=[[16.35,1],[16.8,1.1],[17.25,1.25],[17.7,1.35],[18.15,1.45],[18.45,2.1]];
const PULSE={life:1.6,speed:.72,flat:.55,slots:6}; // seconds, radius growth (× the screen's short side /s), ring ellipse ratio
const DT=1/60;
const FLOW={period:1.8,tile:.85};
const SIM={base:170,dyeBase:620,pressureIters:22,curl:22,velDecay:.55,inkDecay:.32,lightDecay:1.6};
const HONG={gatherHand:[.35,.49],palm:[.678,.47]};
const OUYANG={gatherHands:[[.12,.75],[.84,.77]],face:[.62,.36],hands:[.35,.08]};
const FILES=window.SCENE_FILES||{dragon:'dragon.png',toad:'toad.png','toad-turn':'toad-turn.png','hong-sequence':'hong-sequence.png',
 'ouyang-sequence':'ouyang-sequence.png','gorge-flight':'gorge-flight.png','dragon-sequence':'dragon-sequence.png','collision-sequence':'collision-sequence.png'};
const ASSET_ROOT=window.SCENE_ASSETS||'../assets/';

const $=s=>document.querySelector(s);
const cv=$('#gl');
const gl=cv.getContext('webgl2',{alpha:false,antialias:true,premultipliedAlpha:true});
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,p)=>a+(b-a)*p;
const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
const easeOut=v=>1-(1-clamp(v))**3;
function fail(text){$('#msg').hidden=false;$('#msg').textContent=text;throw new Error(text);}
if(!gl)fail('이 브라우저는 WebGL2를 지원하지 않습니다.');
if(!gl.getExtension('EXT_color_buffer_float')&&!gl.getExtension('EXT_color_buffer_half_float'))fail('이 기기의 브라우저는 먹 유체 계산을 지원하지 않습니다.');

// ---------- GL plumbing ----------
const NOISE=`
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vnoise(p);p*=2.03;a*=.5;}return s;}`;
// Formation: resolves from the creature's eyes outward; a burst dissolves it from the contact point.
const FORM=`
uniform float uForm,uAspect,uTailV;uniform vec2 uEye;uniform vec4 uBurst;
float formLocal(vec2 uv,vec2 scr){
 vec2 d=(uv-uEye)*vec2(uAspect,1.);
 float thr=.62*length(d)/.72+.38*fbm(uv*vec2(5.,13.)+fbm(uv*3.)*1.5);
 float l=smoothstep(0.,.1,uForm-thr)*mix(.4,1.,smoothstep(0.,.2,abs(uv.y-uTailV)));
 if(uBurst.z>=0.){float r=distance(scr,uBurst.xy)+uBurst.w*.6*(fbm(scr/45.)-.5);l*=smoothstep(uBurst.z,uBurst.z+uBurst.w,r);}
 return l;
}
float border(vec2 uv){float e=min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y));return smoothstep(0.,.13,e+.07*(fbm(uv*6.)-.5));}
float burstBand(vec2 scr){if(uBurst.z<0.)return 0.;float r=distance(scr,uBurst.xy)+uBurst.w*.6*(fbm(scr/45.)-.5);
 float k=smoothstep(uBurst.z,uBurst.z+uBurst.w,r);return k*(1.-k)*4.;}`;
function shader(type,src){
 const s=gl.createShader(type);gl.shaderSource(s,'#version 300 es\nprecision highp float;\n'+src);gl.compileShader(s);
 if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));
 return s;
}
function program(vs,fs,attribs=['aPos']){
 const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,vs));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,fs));
 attribs.forEach((a,i)=>gl.bindAttribLocation(p,i,a));gl.linkProgram(p);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
 const u={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);
 for(let i=0;i<n;i++){const name=gl.getActiveUniform(p,i).name;u[name]=gl.getUniformLocation(p,name);}
 return {p,u};
}
const QUAD_VS=`in vec2 aPos;out vec2 vUv,vL,vR,vT,vB;uniform vec2 texel;
void main(){vUv=aPos*.5+.5;vL=vUv-vec2(texel.x,0);vR=vUv+vec2(texel.x,0);vT=vUv+vec2(0,texel.y);vB=vUv-vec2(0,texel.y);gl_Position=vec4(aPos,0,1);}`;
const SPRITE_VS=`in vec2 aPos;out vec2 vUv,vLocal;uniform vec4 rect,uvRect;uniform vec2 res;
 void main(){vec2 l=aPos*.5+.5;l.y=1.-l.y;vLocal=l;vUv=uvRect.xy+l*uvRect.zw;vec2 px=rect.xy+l*rect.zw;
  gl_Position=vec4(px.x/res.x*2.-1.,1.-px.y/res.y*2.,0,1);}`;
const MESH_VS=`in vec2 aPos,aUv;in float aEm;in vec2 aVel;uniform vec2 res;out vec2 vUv,vVel,vScr;out float vEm;
 void main(){vUv=aUv;vEm=aEm;vVel=aVel;vScr=aPos;gl_Position=vec4(aPos.x/res.x*2.-1.,1.-aPos.y/res.y*2.,0,1);}`;
const MESH_ATTRIBS=['aPos','aUv','aEm','aVel'];
const P={
 splat:program(QUAD_VS,`in vec2 vUv;out vec4 o;uniform sampler2D uTarget;uniform float aspect,radius;uniform vec3 color;uniform vec2 point;
  void main(){vec2 p=vUv-point;p.x*=aspect;o=vec4(texture(uTarget,vUv).xyz+exp(-dot(p,p)/radius)*color,1);}`),
 advect:program(QUAD_VS,`in vec2 vUv;out vec4 o;uniform sampler2D uVelocity,uSource;uniform vec2 texel,shift;uniform float dt;uniform vec4 decay;
  void main(){vec2 c=vUv-dt*texture(uVelocity,vUv).xy*texel-shift;
   float inside=step(0.,c.y)*step(c.y,1.);o=texture(uSource,c)*inside/(1.+decay*dt);}`),
 advectCoord:program(QUAD_VS,`in vec2 vUv;out vec4 o;uniform sampler2D uVelocity,uSource;uniform vec2 texel,shift,texToPx;uniform float dt;
  void main(){vec2 v=texture(uVelocity,vUv).xy;vec2 c=vUv-dt*v*texel-shift;o=vec4(texture(uSource,c).xy-v*texToPx*dt,0,1);}`),
 divergence:program(QUAD_VS,`in vec2 vUv,vL,vR,vT,vB;out vec4 o;uniform sampler2D uVelocity;
  void main(){vec2 C=texture(uVelocity,vUv).xy;float L=texture(uVelocity,vL).x,R=texture(uVelocity,vR).x,T=texture(uVelocity,vT).y,B=texture(uVelocity,vB).y;
   if(vL.x<0.)L=-C.x;if(vR.x>1.)R=-C.x;if(vT.y>1.)T=-C.y;if(vB.y<0.)B=-C.y;o=vec4(.5*(R-L+T-B),0,0,1);}`),
 curl:program(QUAD_VS,`in vec2 vUv,vL,vR,vT,vB;out vec4 o;uniform sampler2D uVelocity;
  void main(){o=vec4(.5*(texture(uVelocity,vR).y-texture(uVelocity,vL).y-texture(uVelocity,vT).x+texture(uVelocity,vB).x),0,0,1);}`),
 vorticity:program(QUAD_VS,`in vec2 vUv,vL,vR,vT,vB;out vec4 o;uniform sampler2D uVelocity,uCurl;uniform float curl,dt;
  void main(){float L=texture(uCurl,vL).x,R=texture(uCurl,vR).x,T=texture(uCurl,vT).x,B=texture(uCurl,vB).x,C=texture(uCurl,vUv).x;
   vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));f/=length(f)+1e-4;f*=curl*C;f.y*=-1.;
   o=vec4(clamp(texture(uVelocity,vUv).xy+f*dt,-1e3,1e3),0,1);}`),
 pressure:program(QUAD_VS,`in vec2 vUv,vL,vR,vT,vB;out vec4 o;uniform sampler2D uPressure,uDivergence;
  void main(){o=vec4((texture(uPressure,vL).x+texture(uPressure,vR).x+texture(uPressure,vT).x+texture(uPressure,vB).x-texture(uDivergence,vUv).x)*.25,0,0,1);}`),
 gradient:program(QUAD_VS,`in vec2 vUv,vL,vR,vT,vB;out vec4 o;uniform sampler2D uPressure,uVelocity;
  void main(){vec2 v=texture(uVelocity,vUv).xy-vec2(texture(uPressure,vR).x-texture(uPressure,vL).x,texture(uPressure,vT).x-texture(uPressure,vB).x);o=vec4(v,0,1);}`),
 scale:program(QUAD_VS,`in vec2 vUv;out vec4 o;uniform sampler2D uTex;uniform float value;void main(){o=texture(uTex,vUv)*value;}`),
 // Density decides where ink is; a painted sumi texture carried by the same flow decides what it looks like.
 ink:program(QUAD_VS,`in vec2 vUv;out vec4 o;uniform sampler2D uDye,uCoordA,uCoordB,uPaint;uniform float uCam,uDpr,uH,uWeight,uTile,uGain;${NOISE}
  float paint(vec2 p){return 1.-dot(texture(uPaint,p/uTile).rgb,vec3(.3,.59,.11));}
  void main(){vec2 world=vec2(gl_FragCoord.x/uDpr,uCam+uH-gl_FragCoord.y/uDpr);
   float p=mix(paint(world+texture(uCoordB,vUv).xy),paint(world+texture(uCoordA,vUv).xy+vec2(.37,.61)*uTile),uWeight);
   float d=texture(uDye,vUv).x;
   float wash=1.-exp(-2.2*d),tex=smoothstep(.12,.8,p);
   float edge=smoothstep(0.,.3,d*1.6+(tex-.5)*.6+.12*(fbm(world/6.)-.5));
   float ink=clamp(wash*(.22+.9*tex)*edge,0.,.93);
   o=vec4(mix(vec3(1),vec3(.12,.11,.10),ink*uGain),1);}`),
 light:program(QUAD_VS,`in vec2 vUv;out vec4 o;uniform sampler2D uDye;
  void main(){vec4 d=texture(uDye,vUv);float l=clamp((d.y-.35*d.x)*1.2,0.,.85);o=vec4(vec3(1.,.985,.94)*l,l);}`),
 sprite:program(SPRITE_VS,`in vec2 vUv,vLocal;out vec4 o;uniform sampler2D uTex;uniform float alpha,feather;${NOISE}
  void main(){vec4 c=texture(uTex,vUv);float e=min(min(vLocal.x,1.-vLocal.x),min(vLocal.y,1.-vLocal.y));
   float m=feather>0.?smoothstep(0.,feather,e-.11*(fbm(vLocal*4.)-.5)-.04*(fbm(vLocal*17.)-.5)):1.;float a=alpha*m;o=vec4(c.rgb*a,a);}`),
 // Painted plates (explosion, aftermath) are multiplied in, revealed by a ragged front.
 plate:program(SPRITE_VS,`in vec2 vUv,vLocal;out vec4 o;uniform sampler2D uTex;uniform vec4 uvB;uniform float uR,uMix,uAlpha;${NOISE}
  void main(){float n=fbm(vLocal*6.),n2=fbm(vLocal*4.+3.);
   vec3 c=mix(texture(uTex,vUv).rgb,texture(uTex,uvB.xy+vLocal*uvB.zw).rgb,smoothstep(0.,.14,uMix-n2*1.1));
   float m=smoothstep(0.,.12,uR-length(vLocal-.5)*1.414-.3*(n-.5));
   float e=min(min(vLocal.x,1.-vLocal.x),min(vLocal.y,1.-vLocal.y));m*=smoothstep(0.,.1,e-.05*(n-.5))*uAlpha;
   o=vec4(mix(vec3(1),c,m),1);}`),
 wave:program(QUAD_VS,`in vec2 vUv;out vec4 o;uniform sampler2D uScene;uniform vec4 uPulse[${PULSE.slots}];uniform vec2 uRes;uniform float uFlat;${NOISE}
  void main(){vec2 p=vec2(vUv.x,1.-vUv.y)*uRes,disp=vec2(0);float ink=0.,lift=0.;
   for(int i=0;i<${PULSE.slots};i++){vec4 q=uPulse[i];if(q.w<=0.)continue;
    vec2 d=(p-q.xy)*vec2(1.,1./uFlat);float L=length(d);vec2 dir=d/max(L,1.);
    float rag=(fbm(dir*2.5+float(i)*3.1)-.5)*q.z*.16;           // the front is torn, not a clean circle
    float wdt=14.+q.z*.05,x=(L+rag-q.z)/wdt,ring=exp(-x*x);
    disp+=dir*vec2(1.,uFlat)*(-x)*ring*q.w*38.;
    ink+=ring*q.w*smoothstep(-.6,.3,x)*(.45+.75*fbm(p/16.+float(i)*7.))*1.5;lift+=exp(-pow((L+rag-q.z+wdt*1.6)/(wdt*1.4),2.))*q.w;}
   vec2 uv=(p-disp)/uRes;vec3 c=texture(uScene,vec2(uv.x,1.-uv.y)).rgb;
   c=mix(c,vec3(1.,.985,.94),clamp(lift*.3,0.,.4));c=mix(c,vec3(.12,.11,.1),clamp(ink*.7,0.,.8));
   o=vec4(c,1);}`),
 creature:program(MESH_VS,`in vec2 vUv,vScr;in float vEm;out vec4 o;uniform sampler2D uTex;uniform float uTone,uCut;uniform vec2 uRange;${NOISE}${FORM}
  void main(){float l=formLocal(vUv,vScr)*vEm*border(vUv);if(l<=.001)discard;
   vec4 c=textureLod(uTex,vUv,mix(3.,0.,l));float A=c.a;vec3 u=c.rgb/max(A,1e-4);
   float luma=dot(u,vec3(.3,.59,.11));u=mix(u,vec3(mix(uRange.x,uRange.y,pow(luma,1.25))),uTone)*vec3(.98,.95,.88);
   float a=(uCut>0.?smoothstep(uCut,1.,A):A)*smoothstep(.12,.7,l);o=vec4(u*a,a);}`,MESH_ATTRIBS),
 inject:program(MESH_VS,`in vec2 vUv,vVel,vScr;in float vEm;out vec4 o;uniform sampler2D uTex;uniform int uMode;uniform float uRate,uTime,uBurstSpeed,uTailInk,uBandInk;uniform vec2 uVelScale;${NOISE}${FORM}
  void main(){float l=formLocal(vUv,vScr);float m=textureLod(uTex,vUv,3.).a*vEm*border(vUv);
   float tail=1.-smoothstep(.0,.25,abs(vUv.y-uTailV)),band=l*(1.-l)*4.,grain=smoothstep(.35,.75,fbm(vUv*vec2(7.,18.)+vec2(0.,uTime*.6)));
   float alive=smoothstep(.0,.25,uForm),bb=burstBand(vScr)*m;
   if(uMode==0)o=vec4((m*(band*uBandInk+(tail*uTailInk+.03)*alive)*grain+bb*3.)*uRate,(band*m*.25+bb*1.5)*uRate,0,1);
   else{vec2 out_=normalize(vScr-uBurst.xy+1e-3);
    o=vec4(vVel*uVelScale+vec2(out_.x,-out_.y)*uBurstSpeed*step(.01,bb),0,max(m*.14*l,bb*.45));}}`,MESH_ATTRIBS)
};
const quad=gl.createVertexArray();gl.bindVertexArray(quad);
gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);

function target(w,h){
 const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA16F,w,h,0,gl.RGBA,gl.HALF_FLOAT,null);
 for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
 const fbo=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
 if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)fail('이 기기에서는 먹 유체 버퍼를 만들 수 없습니다.');
 gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
 return {tex,fbo,w,h,texel:[1/w,1/h]};
}
function pair(w,h){const r={a:target(w,h),b:target(w,h)};r.read=()=>r.a;r.write=()=>r.b;r.swap=()=>{[r.a,r.b]=[r.b,r.a];};return r;}
function bindTex(unit,tex){gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,tex);return unit;}
const T=(unit,t)=>({unit:bindTex(unit,t.tex||t),tex:t});
const INTS=new Set(['uMode']);
function setUniforms(prog,uniforms){
 gl.useProgram(prog.p);
 for(const [k,v] of Object.entries(uniforms)){
  const loc=prog.u[k];if(loc==null)continue;
  if(INTS.has(k))gl.uniform1i(loc,v);
  else if(typeof v==='number')gl.uniform1f(loc,v);
  else if(v.tex!==undefined)gl.uniform1i(loc,v.unit);
  else if(v.length===2)gl.uniform2fv(loc,v);else if(v.length===3)gl.uniform3fv(loc,v);else gl.uniform4fv(loc,v); // vec4 or vec4[]
 }
}
let frameTarget=null; // while rendering, the 'screen' is this offscreen frame; the wave pass presents it
function bindOut(out){const o=out||frameTarget;gl.bindFramebuffer(gl.FRAMEBUFFER,o?o.fbo:null);gl.viewport(0,0,o?o.w:cv.width,o?o.h:cv.height);}
function target8(w,h){
 const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
 for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
 const fbo=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
 return {tex,fbo,w,h};
}
function pass(prog,out,uniforms){setUniforms(prog,uniforms);bindOut(out);gl.bindVertexArray(quad);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}

// ---------- images ----------
const images={};
function loadTexture(name,{as=name,mips=false,crop=null,wrap=gl.CLAMP_TO_EDGE}={}){
 return new Promise((res,rej)=>{const im=new Image();im.onload=()=>{
  let src=im;
  if(crop){const [x,y,cw,ch]=crop.map((v,i)=>Math.round(v*(i%2?im.naturalHeight:im.naturalWidth)));
   src=document.createElement('canvas');src.width=cw;src.height=ch;src.getContext('2d').drawImage(im,x,y,cw,ch,0,0,cw,ch);}
  const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,mips?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,wrap);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,wrap);
  if(mips)gl.generateMipmap(gl.TEXTURE_2D);
  images[as]={tex,w:src.width,h:src.height};res();
 };im.onerror=()=>rej(new Error(name));im.src=ASSET_ROOT+FILES[name];});
}

// ---------- paths (pure functions of time) ----------
function pathAt(keys,s){ // monotone cubic Hermite
 if(s<=keys[0][0])return keys[0][1];
 const end=keys.length-1;if(s>=keys[end][0])return keys[end][1];
 const i=keys.findIndex((k,j)=>j<end&&s>=k[0]&&s<keys[j+1][0]);
 const slope=j=>(keys[j+1][1]-keys[j][1])/(keys[j+1][0]-keys[j][0]);
 const tangent=j=>{if(j===0||j===end)return 0;const a=slope(j-1),b=slope(j);return a*b<=0?0:2*a*b/(a+b);};
 const span=keys[i+1][0]-keys[i][0],p=(s-keys[i][0])/span;
 return (2*p**3-3*p*p+1)*keys[i][1]+(p**3-2*p*p+p)*span*tangent(i)+(-2*p**3+3*p*p)*keys[i+1][1]+(p**3-p*p)*span*tangent(i+1);
}
function makePath(X,Y,t0,t1,arc0=0){
 const pts=[],acc=[];let L=arc0,prev=null;
 for(let t=t0;t<=t1+1e-6;t+=1/240){const p=[pathAt(X,t),pathAt(Y,t)];if(prev)L+=Math.hypot(p[0]-prev[0],p[1]-prev[1]);pts.push(p);acc.push(L);prev=p;}
 let d0=[0,1];for(let i=1;i<pts.length;i++){const dx=pts[i][0]-pts[0][0],dy=pts[i][1]-pts[0][1],n=Math.hypot(dx,dy);if(n>2){d0=[dx/n,dy/n];break;}}
 return {X,Y,t0,t1,pts,acc,d0};
}
const headAt=(P,t)=>[pathAt(P.X,clamp(t,P.t0,P.t1)),pathAt(P.Y,clamp(t,P.t0,P.t1))];
function headLength(P,t){const i=Math.round((clamp(t,P.t0,P.t1)-P.t0)*240);return P.acc[Math.min(P.acc.length-1,i)];}
function pointAtLength(P,L){
 const {pts,acc}=P;
 if(L<=acc[0])return [pts[0][0]+P.d0[0]*(L-acc[0]),pts[0][1]+P.d0[1]*(L-acc[0])];
 if(L>=acc[acc.length-1])return pts[pts.length-1];
 let lo=0,hi=acc.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(acc[m]<L)lo=m;else hi=m;}
 const p=(L-acc[lo])/(acc[hi]-acc[lo]||1);return [mix(pts[lo][0],pts[hi][0],p),mix(pts[lo][1],pts[hi][1],p)];
}

// ---------- layout ----------
let frame8,w=0,h=0,dpr=1,sim,dye,velocity,pressure,divergence,curlT,coordA,coordB;
let L={}; // layout
function rectAround([cx,cy],rect,z){return [cx-(cx-rect[0])*z,cy-(cy-rect[1])*z,rect[2]*z,rect[3]*z];}
function buildLayout(){
 const S=w<600?Math.min(w*1.3,h*.98):Math.max(h,Math.min(w*.92,h*1.15));
 const hong=[(w-S)/2,(h-S)/2,S,S];
 const palm=[hong[0]+HONG.palm[0]*S,hong[1]+HONG.palm[1]*S],hand=[hong[0]+HONG.gatherHand[0]*S,hong[1]+HONG.gatherHand[1]*S];
 const ouGather=[(w-S)/2,(h-S)/2,S,S];
 const ouRelease=[w*.5-OUYANG.hands[0]*S,h*.44-OUYANG.hands[1]*S,S,S];
 const hands=[w*.5,h*.44];
 const dLs=Math.min(1.15*h,1.9*w),dW=dLs*1024/1536;
 const tW=Math.min(.55*h,.95*w),tLs=tW*1536/1024;
 const bW=Math.min(.72*h,1.05*w);
 const contact=[w*.5,hands[1]-3.3*h];
 // Hong's strike: the stream leaves the palm, turns and dives; the camera lets it go at the cut.
 const dragonA=makePath(
  [[BEAT.release,palm[0]],[2.6,Math.min(palm[0]+.12*w,.9*w)],[3.2,.66*w],[4.1,.58*w],[5.3,.38*w],[6.7,.62*w],[8.3,.38*w],[10.6,.6*w]],
  [[BEAT.release,palm[1]],[2.6,palm[1]+.08*h],[3.2,palm[1]+.36*h],[4.1,palm[1]+.82*h],[5.3,palm[1]+1.45*h],[6.7,palm[1]+2.15*h],[8.3,palm[1]+2.95*h],[10.6,palm[1]+4.3*h]],
  BEAT.release,BEAT.cut+.2);
 // Ouyang's 蛤蟆功: rises from between his hands to the meeting point and holds there.
 const toad=makePath(
  [[BEAT.release2,hands[0]],[14.5,.53*w],[16.4,.48*w],[18.4,.52*w],[BEAT.contact,contact[0]]],
  [[BEAT.release2,hands[1]],[13.5,hands[1]-.28*h],[14.5,hands[1]-.72*h],[16.4,hands[1]-1.35*h],[18.4,hands[1]-1.95*h],[20.2,hands[1]-2.75*h],[BEAT.contact,contact[1]]],
  BEAT.release2,BEAT.end);
 // The same dragon arrives from above, already whole.
 const dragonB=makePath(
  [[BEAT.dragonEnter,.46*w],[20,.53*w],[BEAT.contact,contact[0]]],
  [[BEAT.dragonEnter,contact[1]-2.7*h],[20,contact[1]-.8*h],[BEAT.contact,contact[1]]],
  BEAT.dragonEnter,BEAT.end,dLs*2.2);
 L={S,hong,palm,hand,ouGather,ouRelease,hands,contact,dLs,dW,tW,tLs,bW,dragonA,toad,dragonB};
 L.creatures=creatures();
}

// ---------- creatures ----------
const formRamp=(a,b,k=1.2)=>t=>ease((t-a)/(b-a))*k;
function standoff(sign){ // they press into each other, shudder, then are thrown apart
 return t=>{
  let dy=0;
  if(t>=BEAT.contact&&t<BEAT.burst+1){
   const p=(t-BEAT.contact)/(BEAT.burst-BEAT.contact);
   dy+=sign*h*.035*Math.sin(clamp(p)*Math.PI*.5)+h*.004*Math.sin(t*83)*(1-clamp(p-1));
  }
  if(t>=BEAT.burst)dy-=sign*h*.07*easeOut((t-BEAT.burst)/.7);
  return [0,dy];
 };
}
function burstAt(t){
 if(t<BEAT.burst)return [0,0,-1,1];
 const c=[L.contact[0],L.contact[1]-camAt(t)];
 return [c[0],c[1],easeOut((t-BEAT.burst)/1.1)*Math.max(w,h)*1.25-h*.05,h*.2];
}
const turnAngle=t=>Math.PI*ease((t-BEAT.turn)/(BEAT.turned-BEAT.turn));
function creatures(){
 const none=()=>[0,0];
 return [
  {key:'dragonA',tex:'dragon',aspect:1024/1536,eye:[.52,.71],lead:.985,down:true,tailV:0,tone:.5,cut:0,wave:.045,lockAll:false,
   Ls:L.dLs,W:L.dW,path:L.dragonA,shot:1,from:BEAT.release,to:BEAT.cut,form:formRamp(BEAT.form,BEAT.formed),offset:none,burst:()=>[0,0,-1,1]},
  {key:'toadFront',tex:'toad',aspect:1024/1536,eye:[.53,.13],lead:.03,down:false,tailV:1,tailInk:.1,bandInk:.45,tone:.65,cut:0,wave:0,lockAll:true,
   Ls:L.tLs,W:L.tW,path:L.toad,shot:2,from:BEAT.release2,to:BEAT.turned,
   form:formRamp(BEAT.toadForm,BEAT.toadFormed),spin:t=>turnAngle(t),bodyU:[.16,.84],offset:none,burst:()=>[0,0,-1,1]},
  {key:'toadBack',tex:'toadBack',aspect:1,eye:[.5,.22],lead:.02,down:false,tailV:1,tailInk:.08,bandInk:.45,tone:1,cut:.45,range:[.07,.58],wave:0,lockAll:true,
   size:t=>{const W=Math.min(mix(L.tW*.9,L.bW,ease((t-BEAT.turned)/(BEAT.contact-BEAT.turned))),1.05*w);return {Ls:W,W};}, // same bulk as the front while turning, growing as the camera closes in
   path:L.toad,shot:2,from:BEAT.turn,to:BEAT.burst+1.5,form:formRamp(BEAT.turn+.6,BEAT.turn+1.5,1.25),spin:t=>turnAngle(t)-Math.PI,bodyU:[.12,.88],offset:standoff(-1),burst:burstAt},
  {key:'dragonB',tex:'dragon',aspect:1024/1536,eye:[.52,.71],lead:.985,down:true,tailV:0,tone:.5,cut:0,wave:.045,lockAll:false,
   Ls:L.dLs,W:L.dW,path:L.dragonB,shot:2,from:BEAT.dragonEnter,to:BEAT.burst+1.5,form:()=>1.3,offset:standoff(1),burst:burstAt}
 ];
}
const live=(c,t)=>t>=c.from&&t<c.to;

// ---------- mesh ----------
const NS=160,NC=16,STRIDE=7;
const meshData=new Float32Array((NS+1)*(NC+1)*STRIDE);
const meshVao=gl.createVertexArray(),meshBuf=gl.createBuffer(),meshIdx=gl.createBuffer();
gl.bindVertexArray(meshVao);gl.bindBuffer(gl.ARRAY_BUFFER,meshBuf);gl.bufferData(gl.ARRAY_BUFFER,meshData.byteLength,gl.DYNAMIC_DRAW);
[[0,2,0],[1,2,2],[2,1,4],[3,2,5]].forEach(([loc,n,off])=>{gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,n,gl.FLOAT,false,STRIDE*4,off*4);});
{const idx=[];for(let j=0;j<NS;j++)for(let i=0;i<NC;i++){const a=j*(NC+1)+i,b=a+NC+1;idx.push(a,b,a+1,a+1,b,b+1);}
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,meshIdx);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(idx),gl.STATIC_DRAW);}
const meshCount=NS*NC*6;
const posNow=new Float32Array((NS+1)*(NC+1)*2),posPrev=new Float32Array((NS+1)*(NC+1)*2);
const sLead=c=>c.down?1-c.lead:c.lead;
const dims=(c,t)=>c.size?c.size(t):{Ls:c.Ls,W:c.W};
const sstep=(a,b,v)=>ease((v-a)/(b-a));
const facing=new Float32Array((NS+1)*(NC+1));
function bodyFrame(c,t,out,face){
 const {Ls,W}=dims(c,t),path=c.path,Lh=headLength(path,t),cam=camAt(t),d=.05*Ls,off=c.offset(t),def=c.down?1:-1;
 // turntable: the painted body (bodyU) wraps half a cylinder; front and back paintings meet at the seam
 const th=c.spin?c.spin(t):0,kSpin=c.spin?ease(Math.abs(th)/.35):0,[u0,u1]=c.bodyU||[0,1],R=W*(u1-u0)/2,uc=(u0+u1)/2;
 for(let j=0;j<=NS;j++){
  const s=j/NS,Lb=Lh-(s-sLead(c))*Ls;
  const p=pointAtLength(path,Lb),a=pointAtLength(path,Lb-d),b=pointAtLength(path,Lb+d);
  let tx=b[0]-a[0],ty=b[1]-a[1];const n=Math.hypot(tx,ty);
  if(n<1e-3){tx=0;ty=def;}else{tx/=n;ty/=n;}
  const k=c.lockAll?1:.95*(1-ease((s-.32)/.35)); // a painted face reads only near upright
  tx*=1-k;ty=mix(ty,def,k);{const m=Math.hypot(tx,ty)||1;tx/=m;ty/=m;}
  const nx=c.down?ty:-ty,ny=c.down?-tx:tx;
  const wave=Math.sin(s*Math.PI*2.4-t*3.1)*W*c.wave*ease((s-.3)/.35);
  for(let i=0;i<=NC;i++){
   let lat=(i/NC-.5)*W+wave,f=1;const q=j*(NC+1)+i,k2=q*2;
   if(kSpin>0){ // a rounded body (narrower at head and tail), its turning edge torn like wet ink
    const vv=c.down?1-s:s,prof=.5+.5*Math.sin(Math.PI*clamp((vv-.02)/.96)),phi=(i/NC-uc)/(u1-u0)*Math.PI;
    const tear=.28*(Math.sin(j*.37+i*.9)+Math.sin(j*.91+1.3))/2;
    lat=mix(lat,R*prof*Math.sin(phi+th)+(uc-.5)*W,kSpin);f=mix(1,sstep(-.3,.5,Math.cos(phi+th)+tear),kSpin);}
   if(face)face[q]=f;
   out[k2]=p[0]+nx*lat+off[0];out[k2+1]=p[1]+ny*lat+off[1]-cam;
  }
 }
}
function updateMesh(c,t){
 bodyFrame(c,t,posNow,facing);bodyFrame(c,t-DT,posPrev);
 const {Ls}=dims(c,t),path=c.path,Lh=headLength(path,t),camVel=(camAt(t)-camAt(t-DT))/DT;
 for(let j=0;j<=NS;j++){
  const s=j/NS,Lb=Lh-(s-sLead(c))*Ls,em=ease(Lb/(.1*Ls)),v=c.down?1-s:s;
  for(let i=0;i<=NC;i++){
   const q=j*(NC+1)+i,k=q*2,o=q*STRIDE;
   meshData[o]=posNow[k];meshData[o+1]=posNow[k+1];meshData[o+2]=i/NC;meshData[o+3]=v;meshData[o+4]=em*facing[q];
   meshData[o+5]=(posNow[k]-posPrev[k])/DT;meshData[o+6]=(posNow[k+1]-posPrev[k+1])/DT+camVel; // world-frame velocity
  }
 }
 gl.bindBuffer(gl.ARRAY_BUFFER,meshBuf);gl.bufferSubData(gl.ARRAY_BUFFER,0,meshData);
}
function creatureUniforms(c,t){
 return {res:[w,h],uTex:T(0,images[c.tex].tex),uForm:c.form(t),uAspect:c.aspect,uTailV:c.tailV,uEye:c.eye,uBurst:c.burst(t),uTone:c.tone,uCut:c.cut,uRange:c.range||[0,1],uTailInk:c.tailInk??.7,uBandInk:c.bandInk??1.4,uTime:t};
}
function drawMesh(prog,out,uniforms){setUniforms(prog,uniforms);bindOut(out);gl.bindVertexArray(meshVao);gl.drawElements(gl.TRIANGLES,meshCount,gl.UNSIGNED_SHORT,0);}

// ---------- cameras ----------
function cam1(t){
 if(t<=BEAT.release+.2)return 0;
 let y=0;for(let k=0;k<10;k++)y+=headAt(L.dragonA,t-k*.06)[1];y/=10;
 const lead=mix(.66,1.3,ease((t-BEAT.formed)/(BEAT.cut-BEAT.formed))); // once whole, the dragon outruns the camera
 return Math.max(0,(y-lead*h)*ease((t-BEAT.release-.2)/1.4));
}
function shake(t){
 let s=0;
 if(t>=BEAT.contact)s+=Math.sin(t*61)*Math.exp(-(t-BEAT.contact)*5)*h*.008;
 if(t>=BEAT.burst)s+=Math.sin(t*47)*Math.exp(-(t-BEAT.burst)*3.5)*h*.018;
 return s;
}
function cam2(t){
 if(t<BEAT.release2)return 0;
 let y=0;for(let k=0;k<10;k++)y+=headAt(L.toad,t-k*.06)[1];y/=10;
 return (y-.45*h)*ease((t-BEAT.release2-.15)/1.3)+shake(t);
}
function camAt(t){return t<BEAT.cut?cam1(t):cam2(t);}

// ---------- fluid ----------
function allocate(){
 const ar=w/h,sw=ar>=1?Math.round(SIM.base*ar):SIM.base,sh=ar>=1?SIM.base:Math.round(SIM.base/ar);
 const dw=ar>=1?Math.round(SIM.dyeBase*ar):SIM.dyeBase,dh=ar>=1?SIM.dyeBase:Math.round(SIM.dyeBase/ar);
 frame8=target8(cv.width,cv.height);
 sim={w:sw,h:sh};velocity=pair(sw,sh);pressure=pair(sw,sh);divergence=target(sw,sh);curlT=target(sw,sh);dye=pair(dw,dh);coordA=pair(sw,sh);coordB=pair(sw,sh);
}
function clearTarget(f){gl.bindFramebuffer(gl.FRAMEBUFFER,f.fbo);gl.viewport(0,0,f.w,f.h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);}
function clearFluid(){for(const p of [velocity,pressure,dye,coordA,coordB]){clearTarget(p.a);clearTarget(p.b);}}
function splat(field,x,y,color,radius){pass(P.splat,field.write(),{uTarget:T(0,field.read()),aspect:w/h,point:[x/w,1-y/h],color,radius});field.swap();}
const FORCE=DT*5,FEED=DT;
const velToSim=()=>[sim.w/w,-sim.h/h]; // screen px/s -> sim texels/s (GL y is up)
const rScale=()=>(Math.min(w,h)/h)**2;     // splat radii follow the short side of the screen
function converge(points,t,t0,t1,ringScale){ // ink is drawn in toward the hands, spiralling, hardest just before release
 const vs=velToSim().map(v=>v*FORCE),g=ease((t-t0)/(t1-t0-.2)),suck=ease((t-(t1-.35))/.3),r=rScale();
 for(const [hx,hy] of points){
  const R=L.S*mix(ringScale,ringScale*.4,g);
  for(let k=0;k<5;k++){
   const ang=t*(3.4+2*g)+k*1.2566+hx*.01,px=hx+Math.cos(ang)*R,py=hy+Math.sin(ang)*R*.8;
   const inward=[-Math.cos(ang),-Math.sin(ang)],tang=[-Math.sin(ang),Math.cos(ang)],sp=h*mix(.3,1.1,g)*(1+2*suck);
   splat(velocity,px,py,[(inward[0]*(.7+suck)+tang[0])*sp*vs[0],(inward[1]*(.7+suck)+tang[1])*sp*vs[1],0],.0007*r);
   splat(dye,px,py,[(3+7*g)*FEED*(1-suck*.7),0,0],.00045*r);
  }
  splat(dye,hx,hy,[0,(1*g+3*suck)*FEED,0],.0003*r); // the hand begins to glow
 }
}
function stroke(P,t,t0,fadeAt,fadeLen,amount){ // the leading edge lays one long stroke back to its source
 if(t<t0||t>=fadeAt+fadeLen)return;
 const vs=velToSim().map(v=>v*FORCE),p=headAt(P,t),q=headAt(P,t-DT),cam=camAt(t),f=1-ease((t-fadeAt)/fadeLen);
 const vx=(p[0]-q[0])/DT,vy=(p[1]-q[1])/DT,grow=ease((t-t0)/.7),r=rScale()*mix(1,1.3,w>=h?1:0);
 const sp=Math.hypot(vx,vy)||1,wob=Math.sin(t*7.3)*.35;
 const ux=vx*.3+(-vy/sp)*sp*wob,uy=vy*.3+(vx/sp)*sp*wob;
 splat(velocity,p[0],p[1]-cam,[ux*vs[0]*f,uy*vs[1]*f,0],mix(.0006,.0016,grow)*r);
 splat(dye,p[0],p[1]-cam,[amount*f*mix(.3,1,grow)*FEED,1.5*(1-grow)*FEED,0],mix(.00035,.0014,grow)*r);
}
function inject(t){
 const vs=velToSim().map(v=>v*FORCE),r=rScale(),cam=camAt(t);
 if(t<BEAT.cut){
  if(t>=BEAT.gather&&t<BEAT.release)converge([L.hand],t,BEAT.gather,BEAT.release,.26);
  if(t>=BEAT.release&&t<BEAT.release+DT*1.5)splat(dye,L.palm[0],L.palm[1],[.4,1.2,0],.0009*r); // release flash at the palm
  stroke(L.dragonA,t,BEAT.release,BEAT.form+.6,1.4,12);
 }else{
  if(t>=BEAT.gather2&&t<BEAT.release2){
   const z=1+.06*ease((t-BEAT.gather2)/(BEAT.release2-BEAT.gather2)),rect=rectAround(L.ouFace,L.ouGather,z);
   converge(OUYANG.gatherHands.map(([u,v])=>[rect[0]+u*rect[2],rect[1]+v*rect[3]]),t,BEAT.gather2,BEAT.release2,.2);
  }
  if(t>=BEAT.release2&&t<BEAT.release2+.5){ // the ground erupts upward from between the palms
   const f=1-ease((t-BEAT.release2)/.5);
   for(const dx of [-.07,0,.07]){
    splat(velocity,L.hands[0]+dx*w,L.hands[1]-cam,[dx*h*2*vs[0],-h*1.4*f*vs[1],0],.0012*r);
    splat(dye,L.hands[0]+dx*w,L.hands[1]-cam,[5*f*FEED,3*f*FEED,0],.0006*r);
   }
  }
  stroke(L.toad,t,BEAT.release2,BEAT.toadForm+.8,1.4,13);
  for(const [et,str] of PULSES)if(t-DT<et&&et<=t){ // a wave leaves the body and shoves the smoke outward
   const c=pulseCenter(et);
   for(let k=0;k<10;k++){const ang=k*Math.PI/5,ox=Math.cos(ang),oy=Math.sin(ang)*PULSE.flat;
    splat(velocity,c[0]+ox*h*.09,c[1]-cam+oy*h*.09,[ox*h*1.3*str*vs[0]/FORCE,oy*h*1.3*str*vs[1]/FORCE,0],.0009*r);
    splat(dye,c[0]+ox*h*.11,c[1]-cam+oy*h*.11,[.5*str,0,0],.00025*r);}
  }
  if(t>=BEAT.turn-.2&&t<BEAT.turned+.2){ // the whirl that turns the toad round
   const g=Math.sin(clamp((t-BEAT.turn+.2)/(BEAT.turned-BEAT.turn+.4))*Math.PI),p=headAt(L.toad,t),cx=p[0],cy=p[1]+L.tLs*.38-cam,R=L.tW*.42;
   for(let k=0;k<4;k++){
    const ang=-t*5.5+k*Math.PI/2,px=cx+Math.cos(ang)*R,py=cy+Math.sin(ang)*R*.45;
    splat(velocity,px,py,[Math.sin(ang)*h*1.6*g*vs[0],-Math.cos(ang)*h*.72*g*vs[1],0],.0012*r);
    splat(dye,px,py,[2.4*g*FEED,.6*g*FEED,0],.0006*r);
   }
  }
  if(t>=BEAT.contact&&t<BEAT.burst){ // two pressures meet: the air is squeezed out sideways
   const c=[L.contact[0],L.contact[1]-cam],g=ease((t-BEAT.contact)/.25);
   for(const s of [-1,1]){
    splat(velocity,c[0]+s*w*.05,c[1],[s*h*3.2*g*vs[0],0,0],.0009*r);
    splat(dye,c[0]+s*w*.05,c[1],[5*g*FEED,0,0],.0005*r);
   }
  }
  if(t>=BEAT.burst&&t<BEAT.burst+.18){
   const c=[L.contact[0],L.contact[1]-cam];
   for(let k=0;k<8;k++){const ang=k*Math.PI/4;
    splat(velocity,c[0]+Math.cos(ang)*h*.05,c[1]+Math.sin(ang)*h*.05,[Math.cos(ang)*h*6*vs[0],Math.sin(ang)*h*6*vs[1],0],.0012*r);
    splat(dye,c[0]+Math.cos(ang)*h*.05,c[1]+Math.sin(ang)*h*.05,[8*FEED,3*FEED,0],.0008*r);}
  }
 }
 // bodies pour ink off their resolving edges and drag the air they displace
 gl.enable(gl.BLEND);
 for(const c of L.creatures){
  if(c.shot!==(t<BEAT.cut?1:2)||!live(c,t))continue;
  updateMesh(c,t);const u=creatureUniforms(c,t);
  gl.blendFunc(gl.ONE,gl.ONE);drawMesh(P.inject,dye.read(),{...u,uMode:0,uRate:FEED*6});
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);drawMesh(P.inject,velocity.read(),{...u,uMode:1,uVelScale:velToSim(),uBurstSpeed:h*2.6*sim.h/h});
 }
 gl.disable(gl.BLEND);
}
let simT=0;
const CUTS=[BEAT.release,BEAT.cut,BEAT.release2]; // hard cuts: new shot, new air
function step(){
 const t0=simT,t1=simT+DT,cut=CUTS.some(c=>t0<c&&t1>=c);
 if(cut)clearFluid();
 inject(t1);
 const tx=velocity.read().texel;
 pass(P.curl,curlT,{texel:tx,uVelocity:T(0,velocity.read())});
 pass(P.vorticity,velocity.write(),{texel:tx,uVelocity:T(0,velocity.read()),uCurl:T(1,curlT),curl:SIM.curl,dt:DT});velocity.swap();
 pass(P.divergence,divergence,{texel:tx,uVelocity:T(0,velocity.read())});
 pass(P.scale,pressure.write(),{uTex:T(0,pressure.read()),value:.8});pressure.swap();
 for(let i=0;i<SIM.pressureIters;i++){pass(P.pressure,pressure.write(),{texel:tx,uPressure:T(0,pressure.read()),uDivergence:T(1,divergence)});pressure.swap();}
 pass(P.gradient,velocity.write(),{texel:tx,uPressure:T(0,pressure.read()),uVelocity:T(1,velocity.read())});velocity.swap();
 const shift=[0,cut?0:(camAt(t1)-camAt(t0))/h]; // the air lives in the world and scrolls with it
 pass(P.advect,velocity.write(),{texel:tx,uVelocity:T(0,velocity.read()),uSource:T(1,velocity.read()),dt:DT,shift,decay:[SIM.velDecay,SIM.velDecay,0,0]});velocity.swap();
 pass(P.advect,dye.write(),{texel:tx,uVelocity:T(0,velocity.read()),uSource:T(1,dye.read()),dt:DT,shift,decay:[SIM.inkDecay,SIM.lightDecay,0,0]});dye.swap();
 const texToPx=[w/sim.w,-h/sim.h];
 for(const [field,offset] of [[coordA,0],[coordB,.5]]){
  if(Math.floor(t0/FLOW.period+offset)!==Math.floor(t1/FLOW.period+offset))clearTarget(field.read());
  pass(P.advectCoord,field.write(),{texel:tx,uVelocity:T(0,velocity.read()),uSource:T(1,field.read()),dt:DT,shift,texToPx});field.swap();
 }
 simT=t1;
}

// ---------- frame ----------
function sprite(name,rect,uvRect,alpha,feather){
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 pass2(P.sprite,{rect,uvRect,res:[w,h],alpha,feather,uTex:T(0,images[name].tex)});
}
function pass2(prog,uniforms){setUniforms(prog,uniforms);bindOut(null);gl.bindVertexArray(quad);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
const cell=(i,inset=.002)=>[(i%2)*.5+inset,Math.floor(i/2)*.5+inset,.5-2*inset,.5-2*inset];
function pulseCenter(et){const p=headAt(L.toad,et);return [p[0],p[1]+L.tLs*.36];}
const pulseData=new Float32Array(PULSE.slots*4);
function pulseUniform(t){
 pulseData.fill(0);if(t<BEAT.cut)return pulseData;
 let k=0;const cam=camAt(t),m=Math.min(w,h),rmax=L.tW*.32+PULSE.speed*m*PULSE.life*.72;
 for(const [et,s] of PULSES){const age=t-et;if(age<0||age>=PULSE.life||k>=PULSE.slots)continue;
  const c=pulseCenter(et),r=L.tW*.32+age*PULSE.speed*m*(1-.28*age/PULSE.life); // born at the body's skin, not hidden inside it
  pulseData.set([c[0],c[1]-cam,r,s*clamp(1-r/rmax)**1.1*ease(age/.06)],k*4);k++;}
 return pulseData;
}
function render(t){
 frameTarget=frame8;
 const cam=camAt(t),shot=t<BEAT.cut?1:2;
 bindOut(null);gl.clearColor(.933,.898,.827,1);gl.clear(gl.COLOR_BUFFER_BIT);
 const g=images['gorge-flight'],gw=Math.max(w,h*.8),gh=gw*g.h/g.w;
 if(shot===1){
  const travel=cam1(BEAT.cut)||1,par=Math.min(.55,(gh-h)/travel);
  sprite('gorge-flight',[(w-gw)/2,-cam*par,gw,gh],[0,0,1,1],.9,0);
  const gathering=t<BEAT.release,z=gathering?1+.07*ease((t-BEAT.gather)/(BEAT.release-BEAT.gather)):1;
  const r=gathering?rectAround(L.hand,L.hong,z):L.hong;
  sprite('hong-sequence',[r[0],r[1]-cam,r[2],r[3]],cell(gathering?1:2),1,.22);
 }else{
  const gw2=Math.max(w*1.3,h*.8),gh2=gw2*g.h/g.w,orbit=(gw2-w)*.45*(1-2*ease((t-BEAT.turn)/(BEAT.turned-BEAT.turn))); // camera swings round behind the toad
  sprite('gorge-flight',[(w-gw2)/2+orbit,h-gh2-cam*.4,gw2,gh2],[0,0,1,1],.9,0);
  if(t<BEAT.release2){
   const z=1+.06*ease((t-BEAT.gather2)/(BEAT.release2-BEAT.gather2)),r=rectAround(L.ouFace,L.ouGather,z);
   sprite('ouyang-sequence',[r[0],r[1]-cam,r[2],r[3]],cell(1),ease((t-BEAT.cut)/.25),.22);
  }else sprite('ouyang-sequence',[L.ouRelease[0],L.ouRelease[1]-cam,L.ouRelease[2],L.ouRelease[3]],cell(2),1,.22);
  if(t>=BEAT.blast){ // the original explosion and aftermath plates, from the same contact point
   const E=Math.max(w,h)*1.1,c=[L.contact[0],L.contact[1]-cam];
   gl.enable(gl.BLEND);gl.blendFunc(gl.DST_COLOR,gl.ZERO);
   pass2(P.plate,{rect:[c[0]-E/2,c[1]-E/2,E,E],uvRect:cell(2),uvB:cell(3),res:[w,h],uTex:T(0,images['collision-sequence'].tex),
    uR:easeOut((t-BEAT.blast)/1.1)*1.5,uMix:ease((t-BEAT.aftermath)/1.6)*1.3,uAlpha:1-ease((t-BEAT.endCard)/1.4)});
  }
 }
 const phase=t/FLOW.period,wA=1-Math.abs(1-2*(phase-Math.floor(phase)));
 gl.enable(gl.BLEND);gl.blendFunc(gl.DST_COLOR,gl.ZERO);
 const inkU={uDye:T(0,dye.read()),uCoordA:T(1,coordA.read()),uCoordB:T(2,coordB.read()),uPaint:T(3,images.paint.tex),uCam:cam,uDpr:dpr,uH:h,uWeight:wA,uTile:FLOW.tile*h,uGain:1};
 pass(P.ink,null,inkU);
 gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);pass(P.light,null,{uDye:T(0,dye.read())});
 for(const c of L.creatures){
  if(c.shot!==shot||!live(c,t))continue;
  updateMesh(c,t);drawMesh(P.creature,null,creatureUniforms(c,t));
 }
 const wrap=.75*Math.sin(clamp((t-BEAT.turn+.1)/(BEAT.turned-BEAT.turn+.2))*Math.PI);
 if(shot===2&&wrap>.01){gl.blendFunc(gl.DST_COLOR,gl.ZERO);pass(P.ink,null,{...inkU,uDye:T(0,dye.read()),uCoordA:T(1,coordA.read()),uCoordB:T(2,coordB.read()),uPaint:T(3,images.paint.tex),uGain:wrap});}
 gl.disable(gl.BLEND);
 // present the frame through the pressure waves
 frameTarget=null;
 pass(P.wave,null,{uScene:T(0,frame8),'uPulse[0]':pulseUniform(t),uRes:[w,h],uFlat:PULSE.flat});
 // white flash on contact and on rupture
 const f=(t>=BEAT.contact?.22*Math.exp(-(t-BEAT.contact)*9):0)+(t>=BEAT.burst?.8*Math.exp(-(t-BEAT.burst)*5):0);
 $('#flash').style.opacity=t>=BEAT.contact&&t<BEAT.burst+1.5?f.toFixed(3):0;
 $('#end').hidden=t<BEAT.endCard;$('#end').style.opacity=ease((t-BEAT.endCard)/1.2);
}

// ---------- playback ----------
let t=0,playing=false,last=0,ready=false,speed=1;
function advanceTo(target){if(target<simT-1e-6){clearFluid();simT=0;}while(simT+DT<=target+1e-6)step();}
function frame(now){
 if(innerWidth!==w||innerHeight!==h)resize(); // frames can report 0×0 at load, or resize without an event
 if(playing){t=Math.min(BEAT.end,t+Math.min((now-last)/1000,1/20)*speed);last=now;if(t>=BEAT.end)setPlaying(false);}
 if(ready&&L.creatures){advanceTo(t);render(t);}
 window.sceneSound?.update(t,playing,speed);
 $('#seek').value=t;$('#time').textContent=t.toFixed(1)+'s';
 requestAnimationFrame(frame);
}
function setPlaying(v){playing=v;last=performance.now();$('#play').textContent=v?'일시정지':'재생';}
$('#play').onclick=()=>{if(t>=BEAT.end)t=0;setPlaying(!playing);};
$('#restart').onclick=()=>{t=0;window.sceneSound?.seek(0);setPlaying(true);};
$('#replay').onclick=()=>{t=0;window.sceneSound?.seek(0);setPlaying(true);};
$('#seek').max=BEAT.end;
$('#seek').oninput=e=>{setPlaying(false);t=+e.target.value;window.sceneSound?.seek(t);};
$('#sound').onclick=()=>{ // sound can only start from a tap; turning it on replays from the first breath
 const snd=window.sceneSound;if(!snd)return;
 if(snd.on){snd.disable();}else{snd.enable();t=0;snd.seek(0);setPlaying(true);}
 $('#sound').textContent=snd.on?'소리 끄기':'소리 켜기';$('#sound').setAttribute('aria-pressed',snd.on);
};
$('#speed').onclick=()=>{speed=speed===1?.5:speed===.5?.25:1;$('#speed').textContent=speed+'×';};
function resize(){
 w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);
 cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);
 if(!w||!h)return;
 buildLayout();L.ouFace=[L.ouGather[0]+OUYANG.face[0]*L.S,L.ouGather[1]+OUYANG.face[1]*L.S];
 allocate();simT=0;
}
// The cover's buttons start the piece from the first breath; the sound button counts as the tap browsers require.
window.startScene=withSound=>{
 const snd=window.sceneSound;
 if(withSound&&snd&&!snd.on){snd.enable();$('#sound').textContent='소리 끄기';$('#sound').setAttribute('aria-pressed','true');}
 const cover=$('#cover');if(cover){cover.classList.add('gone');cover.inert=true;}
 if(!ready){pendingStart=true;$('#msg').hidden=false;return;} // paintings still loading: begin as soon as they arrive
 t=0;snd?.seek(0);setPlaying(true);
};
let pendingStart=false;
window.seekScene=s=>{setPlaying(false);t=clamp(s,0,BEAT.end);if(ready&&L.creatures){advanceTo(t);render(t);}};
window.sceneBeat=s=>s<BEAT.release?'홍칠공 · 기운을 모은다':s<BEAT.form?'장풍이 뻗는다':s<5.2?'먹 속에서 용의 얼굴이 맺힌다':s<BEAT.formed?'용의 몸이 꼬리까지 맺힌다':s<BEAT.cut?'용이 협곡으로 내리꽂힌다'
 :s<BEAT.release2?'구양봉 · 땅의 기운을 빨아들인다':s<BEAT.toadForm?'합마공이 솟구친다':s<BEAT.turn?'먹 속에서 두꺼비가 맺힌다':s<BEAT.turned?'두꺼비가 휘돌아 등을 보인다'
 :s<BEAT.contact?'두 기운이 마주 달린다':s<BEAT.burst?'맞닿아 밀어붙인다':s<BEAT.aftermath?'파열':s<BEAT.endCard?'여운':'끝';
Promise.all([
 loadTexture('dragon',{mips:true}),loadTexture('toad',{mips:true}),
 loadTexture('toad-turn',{as:'toadBack',mips:true,crop:[.5,.5,.5,.5]}),
 loadTexture('hong-sequence'),loadTexture('ouyang-sequence'),loadTexture('gorge-flight'),loadTexture('collision-sequence'),
 loadTexture('dragon-sequence',{as:'paint',crop:[.004,.004,.49,.26],wrap:gl.MIRRORED_REPEAT})
]).then(()=>{resize();ready=true;$('#msg').hidden=true;if(!$('#cover')||pendingStart){t=0;window.sceneSound?.seek(0);setPlaying(true);}}) // a cover waits for the viewer's choice
 .catch(e=>{$('#msg').textContent='원화를 불러오지 못했습니다: '+e.message;});
requestAnimationFrame(frame);
