import {surfaceAtlasURL} from './surface-atlas.mjs';
import {surfaceKinds,surfaceSize} from './surface-recipe.mjs';

function decodeImage(url){
  return new Promise((resolve,reject)=>{
    const image=new Image();image.decoding='async';let settled=false;
    const finish=error=>{if(settled)return;settled=true;clearTimeout(timer);image.onload=image.onerror=null;if(error){image.src='';reject(error);}else resolve(image);};
    const timer=setTimeout(()=>finish(new Error('Material image timeout')),2000);
    image.onload=()=>{image.decode().then(()=>finish(),error=>finish(error));};
    image.onerror=()=>finish(new Error('Material image unavailable'));
    image.src=url;
  });
}

// One decoded image and one in-flight request, bounded by this page's lifetime.
// Content-addressed HTTP caching shares the same bytes across all three samples.
export class SurfaceAtlasCache {
  constructor(load=decodeImage){this.load=load;this.image=null;this.pending=null;this.loads=0;this.error=null;}
  prepare(){
    if(this.image)return Promise.resolve(this.image);
    if(!this.pending){
      this.loads++;
      this.pending=Promise.resolve().then(()=>this.load(surfaceAtlasURL)).then(image=>{
        if(image.width!==surfaceSize*surfaceKinds.length||image.height!==surfaceSize*2)throw Error('Invalid material atlas dimensions');
        this.error=null;this.image=image;return image;
      }).catch(error=>{this.error=error;return null;}).finally(()=>{this.pending=null;});
    }
    return this.pending;
  }
}
export const surfaceAtlasCache=new SurfaceAtlasCache();
