// One graph per classroom, unlocked only by a student's gesture.
export class AlarmOutput {
 constructor(create=()=>new (globalThis.AudioContext || globalThis.webkitAudioContext)()){this.create=create;this.enabled=true;this.live=false;}
 unlock(){if(!this.enabled)return;try{
  if(!this.ctx){const c=this.ctx=this.create();this.tone=c.createOscillator();this.mod=c.createOscillator();this.depth=c.createGain();this.gain=c.createGain();this.meter=c.createAnalyser();this.meter.fftSize=256;this.samples=new Float32Array(256);
   this.tone.type='triangle';this.tone.frequency.value=750;this.mod.type='square';this.mod.frequency.value=1.6;this.depth.gain.value=115;this.gain.gain.value=0;
   this.mod.connect(this.depth).connect(this.tone.frequency);this.tone.connect(this.gain).connect(this.meter).connect(c.destination);this.mod.start();this.tone.start();}
  this.error=false;if(this.ctx.state!=='running')this.ctx.resume().catch(()=>{this.error=true;});
 }catch{this.error=true;}}
 level(){if(!this.live||this.ctx?.state!=='running')return 0;this.meter.getFloatTimeDomainData(this.samples);return Math.sqrt(this.samples.reduce((n,x)=>n+x*x,0)/this.samples.length);}
 play(wanted){const on=Boolean(wanted&&this.enabled&&!this.error&&this.ctx?.state==='running');if(on!==this.live){this.live=on;const p=this.gain.gain,t=this.ctx.currentTime;p.cancelScheduledValues(t);p.setTargetAtTime(on?.09:0,t,.018);}return on;}
 mute(){this.enabled=false;this.play(false);}
 dispose(){this.play(false);this.tone?.stop();this.mod?.stop();this.ctx?.close().catch(()=>{});}
}