
// Loading must continue even when the browser suspends animation frames.
export function yieldForPaint() {
  return new Promise(resolve => {
    let frame=null, finished=false;
    const finish=()=>{if(finished)return;finished=true;clearTimeout(timer);if(frame!==null)cancelAnimationFrame(frame);resolve();};
    const timer=setTimeout(finish,100);
    frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(finish);});
  });
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
  const loop = new FrameLoop(frame);
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
