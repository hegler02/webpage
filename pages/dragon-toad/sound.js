/* Sound for 降龍 · 蛤蟆 — synthesized in the browser, no recordings.
   Continuous layers follow the same clock as the picture (pure functions of t);
   one-shots fire when playback crosses their beat. Starts only from a tap. */
'use strict';
(function(){
const S={ctx:null,on:false,prevT:0};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);};
const bell=(t,a,b)=>Math.sin(clamp((t-a)/(b-a))*Math.PI);           // 0 → 1 → 0 across [a,b]
const ramp=(t,a,b)=>ease((t-a)/(b-a));

// ---------- graph ----------
function buffer(kind,sec=4){
 const c=S.ctx,b=c.createBuffer(2,c.sampleRate*sec,c.sampleRate);
 for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let last=0;
  for(let i=0;i<d.length;i++){const white=Math.random()*2-1;
   if(kind==='brown'){last=(last+.02*white)/1.02;d[i]=last*3.5;}else d[i]=white;}}
 return b;
}
function impulse(sec=3.2,decay=2.6){ // a generated mountain-valley reverb
 const c=S.ctx,b=c.createBuffer(2,c.sampleRate*sec,c.sampleRate);
 for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,decay);}
 return b;
}
function init(ctx){
 const c=S.ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
 S.white=buffer('white');S.brown=buffer('brown');
 S.master=c.createGain();S.master.gain.value=0;
 const trim=c.createGain();trim.gain.value=.62;
 const comp=c.createDynamicsCompressor();comp.threshold.value=-12;comp.knee.value=6;comp.ratio.value=12;comp.attack.value=.002;comp.release.value=.22;
 const clip=c.createWaveShaper(),curve=new Float32Array(2048);for(let i=0;i<2048;i++){const x=i/1023.5-1;curve[i]=Math.tanh(1.4*x)/Math.tanh(1.4);}clip.curve=curve;
 S.master.connect(trim).connect(comp).connect(clip).connect(c.destination);
 S.verb=c.createConvolver();S.verb.buffer=impulse();
 const verbOut=c.createGain();verbOut.gain.value=.55;S.verb.connect(verbOut).connect(S.master);
 S.layers={
  wind:layer('brown','lowpass',520,.7,.35,.07),
  rumble:layer('brown','lowpass',110,.8,.2),
  suction:layer('white','bandpass',400,2.2,.25),
  rush:layer('white','bandpass',900,1.4,.3),
  whirl:layer('white','bandpass',900,3,.4,1.6),
  press:drone()
 };
}
function layer(kind,type,freq,q,send,panRate=0){
 const c=S.ctx,src=c.createBufferSource();src.buffer=S[kind];src.loop=true;src.loopStart=Math.random();
 const f=c.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;
 const g=c.createGain();g.gain.value=0;
 let tail=g;
 if(panRate&&c.createStereoPanner){const p=c.createStereoPanner(),lfo=c.createOscillator(),depth=c.createGain();
  lfo.frequency.value=panRate;depth.gain.value=.85;lfo.connect(depth).connect(p.pan);lfo.start();g.connect(p);tail=p;}
 src.connect(f).connect(g);tail.connect(S.master);
 const s=c.createGain();s.gain.value=send;tail.connect(s).connect(S.verb);
 src.start();return {f,g};
}
function drone(){ // the grinding pressure of two forces pressed together
 const c=S.ctx,g=c.createGain();g.gain.value=0;
 const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=160;f.Q.value=4;
 const trem=c.createGain(),lfo=c.createOscillator(),depth=c.createGain();
 lfo.frequency.value=13;depth.gain.value=.5;trem.gain.value=.5;lfo.connect(depth).connect(trem.gain);lfo.start();
 for(const hz of [41,43.5,82.5]){const o=c.createOscillator();o.type='sawtooth';o.frequency.value=hz;o.connect(f);o.start();}
 const n=c.createBufferSource();n.buffer=S.brown;n.loop=true;const ng=c.createGain();ng.gain.value=.6;n.connect(ng).connect(f);n.start();
 f.connect(trem).connect(g).connect(S.master);
 return {f,g};
}

// ---------- one-shots ----------
function env(param,t0,pts){param.cancelScheduledValues(t0);param.setValueAtTime(pts[0][1],t0);for(const [dt,v,kind] of pts.slice(1)){
 if(kind==='exp')param.exponentialRampToValueAtTime(Math.max(v,1e-4),t0+dt);else param.linearRampToValueAtTime(v,t0+dt);}}
function out(node,gain,send=.3,pan=0){
 const c=S.ctx,g=c.createGain();g.gain.value=gain;let tail=node;
 if(pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;node.connect(p);tail=p;}
 tail.connect(g).connect(S.master);const s=c.createGain();s.gain.value=send;g.connect(s).connect(S.verb);return g;
}
function boom(t0,{f0=90,f1=35,dur=1.2,gain=.9,send=.35}={}){ // a body hitting air: falling sub sine
 const c=S.ctx,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(f0,t0);o.frequency.exponentialRampToValueAtTime(f1,t0+dur);
 env(g.gain,t0,[[0,0],[.012,1],[dur,.0001,'exp']]);o.connect(g);out(g,gain,send);o.start(t0);o.stop(t0+dur+.05);
 const o2=c.createOscillator(),g2=c.createGain();o2.type='triangle';o2.frequency.setValueAtTime(f0*2.6,t0);o2.frequency.exponentialRampToValueAtTime(f1*2.2,t0+dur*.5);
 env(g2.gain,t0,[[0,0],[.008,1],[dur*.45,.0001,'exp']]);o2.connect(g2);out(g2,gain*.45,send);o2.start(t0);o2.stop(t0+dur);
 noise(t0,{kind:'brown',type:'lowpass',f0:1100,f1:160,q:.8,dur:dur*.55,gain:gain*.7,attack:.004,send});
}
function noise(t0,{kind='white',type='bandpass',f0=1200,f1=300,q=1,dur=1,gain=.5,attack=.01,send=.3,pan0=0,pan1=0}={}){
 const c=S.ctx,src=c.createBufferSource();src.buffer=S[kind];src.loop=true;
 const f=c.createBiquadFilter();f.type=type;f.Q.value=q;f.frequency.setValueAtTime(f0,t0);f.frequency.exponentialRampToValueAtTime(Math.max(f1,20),t0+dur);
 const g=c.createGain();env(g.gain,t0,[[0,0],[attack,1],[dur,.0001,'exp']]);
 src.connect(f).connect(g);
 let node=g;if((pan0||pan1)&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.setValueAtTime(pan0,t0);p.pan.linearRampToValueAtTime(pan1,t0+dur);g.connect(p);node=p;}
 out(node,gain,send);src.start(t0,Math.random()*2);src.stop(t0+dur+.05);
}
const crack=(t0,gain=.5)=>noise(t0,{type:'highpass',f0:2600,f1:1800,q:.7,dur:.09,gain,attack:.002,send:.5});
function crackle(t0,dur,rate,gain){ // falling stone and ink spatter
 for(let k=0,tt=0;tt<dur;k++){tt+=-Math.log(1-Math.random())/rate;const fade=1-tt/dur;
  noise(t0+tt,{type:'bandpass',f0:600+Math.random()*2400,f1:400,q:3,dur:.05+Math.random()*.08,gain:gain*fade*(.4+Math.random()*.6),attack:.002,send:.45,pan0:Math.random()*1.6-.8});}
}
function roar(t0,{dur=2.3,gain=.45}={}){ // breath through a huge throat: formant-filtered noise over a growling saw
 const c=S.ctx,mixer=c.createGain();
 const saw=c.createOscillator();saw.type='sawtooth';saw.frequency.setValueAtTime(64,t0);saw.frequency.linearRampToValueAtTime(78,t0+dur*.35);saw.frequency.exponentialRampToValueAtTime(46,t0+dur);
 const grit=c.createOscillator(),gd=c.createGain(),sg=c.createGain();grit.frequency.value=27;gd.gain.value=.45;sg.gain.value=.55;grit.connect(gd).connect(sg.gain);
 saw.connect(sg).connect(mixer);
 const n=c.createBufferSource();n.buffer=S.white;n.loop=true;const ng=c.createGain();ng.gain.value=.9;n.connect(ng).connect(mixer);
 const g=c.createGain();env(g.gain,t0,[[0,0],[.25,1],[dur*.55,.8],[dur,.0001,'exp']]);
 for(const [hz,q,lvl] of [[420,5,1],[1150,6,.6],[2500,8,.25]]){
  const f=c.createBiquadFilter();f.type='bandpass';f.Q.value=q;f.frequency.setValueAtTime(hz*.8,t0);f.frequency.linearRampToValueAtTime(hz,t0+dur*.4);f.frequency.linearRampToValueAtTime(hz*.7,t0+dur);
  const l=c.createGain();l.gain.value=lvl;mixer.connect(f).connect(l).connect(g);
 }
 out(g,gain,.6);for(const o of [saw,grit,n])o.start(t0);for(const o of [saw,grit,n])o.stop(t0+dur+.1);
}
function croak(t0,{pulses=3,gain=.5}={}){ // deep 蛤蟆 croak: pulsed buzz through a throat resonance
 const c=S.ctx;
 for(let k=0;k<pulses;k++){
  const s=t0+k*.34,o=c.createOscillator(),o2=c.createOscillator();o.type='sawtooth';o2.type='square';
  o.frequency.setValueAtTime(70,s);o.frequency.exponentialRampToValueAtTime(52,s+.26);o2.frequency.setValueAtTime(140,s);o2.frequency.exponentialRampToValueAtTime(104,s+.26);
  const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=380;f.Q.value=3.5;
  const f2=c.createBiquadFilter();f2.type='bandpass';f2.frequency.value=950;f2.Q.value=5;
  const g=c.createGain();env(g.gain,s,[[0,0],[.03,1],[.12,.7],[.26,.0001,'exp']]);
  const am=c.createOscillator(),ad=c.createGain(),ag=c.createGain();am.frequency.value=31;ad.gain.value=.5;ag.gain.value=.5;am.connect(ad).connect(ag.gain);
  o.connect(f);o2.connect(f2);f.connect(ag);f2.connect(ag);ag.connect(g);
  out(g,gain*(k===pulses-1?1.15:1),.55);for(const x of [o,o2,am]){x.start(s);x.stop(s+.3);}
 }
}
function gong(t0,gain=.5){ // 징: inharmonic partials with the characteristic downward glide
 const c=S.ctx,base=98;
 for(const [r,lvl,dec] of [[1,1,7],[1.47,.5,5],[2.01,.45,4.5],[2.74,.3,3.5],[3.43,.2,2.8],[4.2,.14,2],[5.3,.08,1.4]]){
  const o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(base*r*1.012,t0);o.frequency.exponentialRampToValueAtTime(base*r*.985,t0+dec);
  env(g.gain,t0,[[0,0],[.02,lvl],[dec,.0001,'exp']]);o.connect(g);out(g,gain*.5,.55);o.start(t0);o.stop(t0+dec+.1);
 }
 noise(t0,{type:'bandpass',f0:900,f1:400,q:1.2,dur:.35,gain:gain*.4,attack:.002,send:.6});
}

// ---------- score ----------
function events(){
 const B=BEAT;
 return [
  [B.release,t0=>{boom(t0,{f0:100,f1:38,dur:1.1});crack(t0,.6);noise(t0,{f0:2400,f1:280,q:1.1,dur:1.5,gain:.55,pan0:0,pan1:.55});}],
  [B.form+1.5,t0=>roar(t0,{dur:2.4,gain:.42})],                                   // the face has formed
  [B.formed+1.1,t0=>noise(t0,{f0:2000,f1:240,q:1.3,dur:1.1,gain:.5,pan0:-.2,pan1:.2})], // the dive passes the camera
  [11.4,t0=>boom(t0,{f0:55,f1:40,dur:.45,gain:.35,send:.2})],[12.0,t0=>boom(t0,{f0:55,f1:40,dur:.45,gain:.42,send:.2})],[12.55,t0=>boom(t0,{f0:58,f1:40,dur:.45,gain:.5,send:.2})], // cheeks pump
  [B.release2,t0=>{boom(t0,{f0:75,f1:28,dur:1.5,gain:1});crack(t0,.5);noise(t0,{kind:'brown',type:'lowpass',f0:600,f1:120,q:.7,dur:1.6,gain:.8,send:.2});noise(t0+.05,{f0:280,f1:2100,q:1.2,dur:1.2,gain:.45});}],
  [B.toadFormed-.5,t0=>croak(t0,{pulses:3,gain:.55})],
  ...PULSES.map(([et,str])=>[et,t0=>{ // each 蛤蟆 pressure wave: a deep 'whum' that opens outward
   boom(t0,{f0:64,f1:34,dur:.85,gain:.32*str,send:.45});
   noise(t0,{kind:'brown',type:'bandpass',f0:260,f1:900,q:1.4,dur:.9,gain:.3*str,attack:.03,send:.5});}]),
  [20.1,t0=>roar(t0,{dur:1.5,gain:.36})],
  [B.contact,t0=>{boom(t0,{f0:85,f1:32,dur:1,gain:1.05});crack(t0,.7);}],
  [B.burst,t0=>{boom(t0,{f0:72,f1:20,dur:3.6,gain:1.25,send:.5});crack(t0,.8);noise(t0,{kind:'white',type:'lowpass',f0:5000,f1:160,q:.6,dur:3.2,gain:.85,send:.5});crackle(t0+.1,2.2,26,.4);}],
  [B.aftermath,t0=>crackle(t0,2.6,5,.22)],
  [B.endCard,t0=>gong(t0,.55)]
 ];
}
function layerTargets(t){
 const B=BEAT;
 return {
  wind:{g:(.16+.32*bell(t,B.formed,B.cut+.1)+.22*ramp(t,B.burst+1,B.aftermath))*(t>=B.cut&&t<B.release2?.35:1)*(1-.6*ramp(t,B.endCard,B.end)),f:520+700*bell(t,B.formed,B.cut)},
  rumble:{g:.3*bell(t,B.form,B.formed)+.3*bell(t,B.toadForm,B.toadFormed+.6)+.18*bell(t,B.turned,B.contact)+.65*ramp(t,B.gather2,B.release2-.1)*(t<B.release2+.6?1:0)+.85*(t>=B.contact?Math.exp(-(t-B.contact)*.7):0)},
  suction:{g:t<B.release?.5*ramp(t,B.gather,B.release-.05):t>=B.gather2&&t<B.release2?.45*ramp(t,B.gather2,B.release2-.05):0,
   f:t<B.release?300+1500*ramp(t,B.gather,B.release):160+900*ramp(t,B.gather2,B.release2)},
  rush:{g:.38*bell(t,B.release,B.form+1.2)+.55*bell(t,B.formed-.4,B.cut+.15)+.3*bell(t,B.release2,B.toadForm+1.6)+.7*ramp(t,19,B.contact)*(t<B.contact?1:0),f:t<B.cut?600+800*ramp(t,B.formed,B.cut):500+1500*ramp(t,19,B.contact)},
  whirl:{g:.55*bell(t,B.turn-.3,B.turned+.2),f:700+900*ramp(t,B.turn,B.turned)},
  press:{g:t>=B.contact&&t<B.burst+.05?.75:0}
 };
}
let evs=null;
function update(t,playing,speed=1){
 if(!S.on||!S.ctx)return;
 const now=S.ctx.currentTime,target=playing?.85:0;
 S.master.gain.setTargetAtTime(target,now,playing?.05:.12);
 const L=layerTargets(t);
 for(const [k,v] of Object.entries(L)){
  S.layers[k].g.gain.setTargetAtTime(playing?v.g:0,now,.06);
  if(v.f)S.layers[k].f.frequency.setTargetAtTime(v.f,now,.08);
 }
 if(playing&&t>S.prevT&&t-S.prevT<.5){evs=evs||events();for(const [et,fn] of evs)if(S.prevT<et&&et<=t)fn(now+.005);}
 S.prevT=t;
}
function seek(t){S.prevT=t;}
function enable(){ // must run inside the tap: create and resume synchronously
 if(!S.ctx)init();
 S.on=true;S.prevT=0;
 S.ctx.resume().catch(()=>{});
}
function disable(){S.on=false;if(S.ctx)S.master.gain.setTargetAtTime(0,S.ctx.currentTime,.08);}
// Verification: render the whole score offline and report loudness per second (no speakers needed).
async function renderOffline(dur=BEAT.end,rate=44100){
 const keep={...S},oc=new OfflineAudioContext(2,Math.ceil(dur*rate),rate);
 init(oc);S.master.gain.setValueAtTime(.85,0);
 for(let k=0;k<=dur*30;k++){const t=k/30,L=layerTargets(t);
  for(const [name,v] of Object.entries(L)){S.layers[name].g.gain.setTargetAtTime(v.g,t,.06);if(v.f)S.layers[name].f.frequency.setTargetAtTime(v.f,t,.08);}}
 for(const [et,fn] of events())fn(et);
 const buf=await oc.startRendering();Object.assign(S,keep);
 const d=buf.getChannelData(0),per=[];let peak=0,clipped=0;
 for(let sec=0;sec<Math.ceil(dur);sec++){let p=0,e=0,n=0;for(let i=sec*rate;i<Math.min(d.length,(sec+1)*rate);i++){const a=Math.abs(d[i]);p=Math.max(p,a);e+=d[i]*d[i];n++;if(a>=.999)clipped++;}
  peak=Math.max(peak,p);per.push([sec,+p.toFixed(2),+(20*Math.log10(Math.sqrt(e/n)+1e-9)).toFixed(1)]);}
 return {peak:+peak.toFixed(3),clipped,perSecond:per};
}
window.sceneSound={update,seek,enable,disable,renderOffline,get on(){return S.on;}};
})();
