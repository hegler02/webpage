
// Loading must continue even when the browser suspends animation frames.
export function yieldForPaint() {
  return new Promise(resolve => {
    let frame=null, finished=false;
    const finish=()=>{if(finished)return;finished=true;clearTimeout(timer);if(frame!==null)cancelAnimationFrame(frame);resolve();};
    const timer=setTimeout(finish,100);
    frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(finish);});
  });
}

// The thread is handed back to the page with a message, not a timer, because timers are slowed in a background tab.
export function handBack() {
  return new Promise(resolve=>{
    const {port1,port2}=new MessageChannel();
    port1.onmessage=()=>{port1.close();resolve();};
    port2.postMessage(0);
  });
}

// A long build is cut into slices: when a slice has used its budget the page gets the thread back, so input and painting never wait for the whole build.
export function timeSlices(budget=10) {
  let since=performance.now();
  return ()=>performance.now()-since<budget?undefined:handBack().then(()=>{since=performance.now();});
}

// A submitted WebGL frame followed by a paint opportunity, not a GPU timing claim.
// A hidden/suspended tab must not leave navigation waiting forever or report painted.
export async function presentScene(host, draw, {current=()=>true, request=callback=>requestAnimationFrame(callback), cancel=id=>cancelAnimationFrame(id), now=()=>performance.now(), timeout=250}={}) {
  if(!current())return false;
  host.dataset.presentation='pending';
  const started=now();
  draw();
  host.dataset.renderSubmissionMs=(now()-started).toFixed(1);
  const painted=await new Promise(resolve=>{
    let frame,finished=false;
    const finish=value=>{if(finished)return;finished=true;clearTimeout(timer);if(frame!==undefined)cancel(frame);resolve(value);};
    const timer=setTimeout(()=>finish(false),timeout);
    frame=request(()=>{frame=request(()=>finish(true));});
  });
  if(!current())return false;
  host.dataset.presentation=painted?'ready':'deferred';
  return painted;
}

export class FrameLoop {
  constructor(frame, {request, cancel, now} = {}) {
    this.request = request ?? (callback => requestAnimationFrame(callback));
    this.cancel = cancel ?? (id => cancelAnimationFrame(id));
    this.now = now ?? (() => performance.now());
    this.frame = frame;
    this.pending = null;
    this.active = false;
    this.disposed = false;
    this.tick = time => {
      this.pending = null;
      if (!this.active || this.disposed) return;
      const elapsed = Math.max(0, (time - this.last) / 1000);
      this.last = time;
      this.frame(Math.min(elapsed, .05), elapsed);
      if (this.active && !this.disposed) this.pending = this.request(this.tick);
    };
  }
  setActive(active) {
    active = Boolean(active) && !this.disposed;
    if (active === this.active) return;
    this.active = active;
    if (active) {
      this.last = this.now();
      this.pending = this.request(this.tick);
    } else if (this.pending !== null) {
      this.cancel(this.pending);
      this.pending = null;
    }
  }
  dispose() { this.setActive(false); this.disposed = true; }
}

// Each scene owns one loop, observer and visibility listener; dispose removes all three.
export function observeScene(host, frame, visibilityRoot = host) {
  // Where the picture is drawn on the processor (scene-quality marks the host), one frame takes seconds,
  // so the scene is stepped at most once a second and the page answers clicks in between.
  let softAt = 0;
  const loop = new FrameLoop((dt, elapsed) => {
    if (host.dataset.software === 'true') {
      const now = performance.now();
      if (now - softAt < 1000) return;
      softAt = now;
    }
    frame(dt, elapsed);
  });
  let enabled = true, intersecting = false, disposed = false;
  const sync = () => {
    if (disposed) return;
    loop.setActive(enabled && intersecting && !document.hidden);
    host.dataset.renderState = loop.active ? 'active' : 'paused';
  };
  const observer = new IntersectionObserver(([entry]) => {
    intersecting = entry.isIntersecting;
    sync();
  });
  observer.observe(visibilityRoot);
  document.addEventListener('visibilitychange', sync);
  return {
    setActive(active) { if (!disposed) { enabled = active; sync(); } },
    dispose() {
      if (disposed) return;
      disposed = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      loop.dispose();
      host.dataset.renderState = 'disposed';
    }
  };
}
