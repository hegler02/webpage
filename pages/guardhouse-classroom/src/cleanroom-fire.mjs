import {fireDevices,escapePath,alarmPath} from './cleanroom-project.mjs';
import {resolveFire} from './fire-reasoning.mjs';
export const extinguisher={id:'FE3',name:'전실 소화기',kind:'extinguisher',pos:[.45,1.95,.29],size:[.18,.18,.52]};
export function bayFire({signal=null,mains=true,battery=true}={}){
  return resolveFire([...fireDevices,extinguisher],{signal,mains,battery});
}
export function bayFireLesson(){return {detector:fireDevices.find(d=>d.kind==='smoke'),alarm:fireDevices.find(d=>d.kind==='alarm'),signal:alarmPath,escape:escapePath};}
