import assert from 'node:assert/strict';
import {createAudioClock} from '../pages/sai/assets/motion-audio-clock.mjs';
import {createSoundPlayer} from '../pages/sai/assets/sound-player.mjs';
const frames=new Map();let next=0;
globalThis.requestAnimationFrame=fn=>{frames.set(++next,fn);return next;};
globalThis.cancelAnimationFrame=id=>frames.delete(id);
class Media extends EventTarget{
 constructor(){super();this.currentTime=0;this.duration=136;this.paused=true;this.ended=false;this.muted=false;this.src='';}
 getAttribute(){return this.src;}removeAttribute(){this.src='';}load(){}
 async play(){this.paused=false;this.dispatchEvent(new Event('play'));this.dispatchEvent(new Event('playing'));}
 pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}
}
const media=new Media();let paints=0;
const clock=createAudioClock({media,render:()=>paints++});
await clock.play();assert.equal(frames.size,1);const before=paints;
for(let i=0;i<100;i++)media.dispatchEvent(new Event('timeupdate'));
assert.equal(frames.size,1);assert.equal(paints,before);
clock.pause();assert.equal(frames.size,0);clock.seek(56);assert.equal(media.currentTime,56);
clock.destroy();clock.destroy();const tail=paints;media.dispatchEvent(new Event('play'));assert.equal(paints,tail);assert.equal(frames.size,0);
globalThis.Audio=Media;const originalSet=globalThis.setTimeout,originalClear=globalThis.clearTimeout;
const timers=new Set();globalThis.setTimeout=(fn,ms)=>{const id=originalSet(fn,ms);timers.add(id);return id;};globalThis.clearTimeout=id=>{timers.delete(id);originalClear(id);};
try{
 let notifications=0;
 const player=createSoundPlayer({render:()=>{},onStatus:()=>notifications++});
 player.enable(58,true);assert.equal(timers.size,1);
 player.destroy();player.destroy();assert.equal(timers.size,0);assert.equal(frames.size,0);const count=notifications;
 player.media.dispatchEvent(new Event('canplay'));player.media.dispatchEvent(new Event('playing'));await Promise.resolve();await Promise.resolve();
 assert.equal(notifications,count);assert.equal(player.active,false);
 const ready=createSoundPlayer({render:()=>{},onStatus:()=>{}});ready.enable(0,false);ready.media.dispatchEvent(new Event('canplay'));
 await ready.play();assert.equal(frames.size,1);ready.pause();assert.equal(frames.size,0);ready.destroy();assert.equal(timers.size,0);
 console.log('Audio lifecycle PASS: one media RAF, no redundant timeupdate paint, pending load cancellation and idempotent disposal.');
}finally{globalThis.setTimeout=originalSet;globalThis.clearTimeout=originalClear;}
