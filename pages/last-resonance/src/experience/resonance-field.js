window.mountResonanceField=async function(canvas,{config,emit}){
  if(!isSecureContext||!navigator.gpu)throw new Error('webgpu-unavailable');
  const policy=config.gpu,adapter=await navigator.gpu.requestAdapter({powerPreference:policy.powerPreference});
  if(!adapter)throw new Error('adapter-unavailable');
  const device=await adapter.requestDevice(),context=canvas.getContext('webgpu');
  let buffer=null,observer=null,frame=0,running=false,destroyed=false,previous=0,elapsed=0;
  function pause(reason){running=false;cancelAnimationFrame(frame);frame=0;previous=0;emit('wgsl:pause',reason)}
  function destroy(reason){if(destroyed)return;destroyed=true;pause(reason);observer?.disconnect();buffer?.destroy();context?.unconfigure();device.destroy();canvas.width=1;canvas.height=1;emit('wgsl:destroy',reason)}
  try{
    const response=await fetch('src/experience/resonance.wgsl');if(!response.ok)throw new Error('shader-load');
    const module=device.createShaderModule({code:await response.text()});
    const info=await module.getCompilationInfo();if(info.messages.some(x=>x.type==='error'))throw new Error('shader-compile');
    const format=navigator.gpu.getPreferredCanvasFormat();
    const pipeline=await device.createRenderPipelineAsync({layout:'auto',vertex:{module,entryPoint:'vertex'},fragment:{module,entryPoint:'fragment',targets:[{format}]},primitive:{topology:'triangle-list'}});
    buffer=device.createBuffer({size:32,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
    const bindGroup=device.createBindGroup({layout:pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer}}]});
    const values=new Float32Array(8);const rgb=getComputedStyle(canvas).getPropertyValue('--color-snow').trim().match(/[a-f0-9]{2}/gi).map(x=>parseInt(x,16)/255);values.set([...rgb,1],4);
    function resize(){const rect=canvas.getBoundingClientRect();const scale=Math.min(devicePixelRatio,policy.maxDpr,Math.sqrt(policy.maxPixels/Math.max(1,rect.width*rect.height)));canvas.width=Math.max(1,Math.floor(rect.width*scale));canvas.height=Math.max(1,Math.floor(rect.height*scale));values[0]=canvas.width;values[1]=canvas.height;context.configure({device,format,alphaMode:'premultiplied'});}
    resize();observer=new ResizeObserver(resize);observer.observe(canvas);
    function draw(now){if(!running||destroyed)return;frame=requestAnimationFrame(draw);if(previous&&now-previous<1000/policy.maxFps)return;elapsed+=previous?Math.min((now-previous)/1000,.1):0;previous=now;values[2]=elapsed;device.queue.writeBuffer(buffer,0,values);const encoder=device.createCommandEncoder();const pass=encoder.beginRenderPass({colorAttachments:[{view:context.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:0},loadOp:'clear',storeOp:'store'}]});pass.setPipeline(pipeline);pass.setBindGroup(0,bindGroup);pass.draw(3);pass.end();device.queue.submit([encoder.finish()]);}
    device.lost.then(info=>{if(!destroyed){destroy('device-lost');canvas.dataset.experience='fallback';document.querySelector('#experience-status').textContent='정지 화면으로 감상을 이어갑니다.';emit('wgsl:device-lost',info.reason)}});
    device.addEventListener('uncapturederror',()=>{destroy('gpu-error');canvas.dataset.experience='fallback'});
    return {pause,resume(reason){if(running||destroyed)return;running=true;previous=0;frame=requestAnimationFrame(draw);emit('wgsl:resume',reason)},destroy};
  }catch(error){destroy('init-error');throw error}
};
