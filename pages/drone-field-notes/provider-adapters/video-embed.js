/* Official provider adapters. No remote request until mount(). */
(function (root) {
  'use strict';
  const CONFIG = Object.freeze({ timeoutMs: 15000,
    referrerPolicy: 'strict-origin-when-cross-origin',
    youtubeHost: 'https://www.youtube-nocookie.com',
    youtubeSDK: 'https://www.youtube.com/iframe_api',
    vimeoSDK: 'https://player.vimeo.com/api/player.js' });
  const ERRORS = Object.freeze({ 100:'영상을 찾을 수 없거나 비공개입니다.',
    101:'소유자가 외부 재생을 허용하지 않았습니다.',
    150:'소유자가 외부 재생을 허용하지 않았습니다.',
    153:'YouTube가 이 페이지의 재생 요청을 확인하지 못했습니다. 다시 불러오기 또는 공식 원본을 이용해 주세요.' });
  function httpOrigin(value) {
    const u = new URL(value);
    if (!['https:', 'http:'].includes(u.protocol) || u.origin === 'null')
      throw new Error('영상을 보려면 README의 실행 안내에 따라 발표본을 인터넷 주소로 열어 주세요.');
    return u.origin;
  }
  function embedURL(record, currentOrigin) {
    if (record.provider === 'youtube') {
      if (!/^[A-Za-z0-9_-]{11}$/.test(record.id || '')) throw new Error('영상 주소에 오류가 있습니다. 공식 원본 링크를 이용해 주세요.');
      const u = new URL('/embed/' + record.id, CONFIG.youtubeHost);
      u.search = new URLSearchParams({ enablejsapi:'1', origin:httpOrigin(currentOrigin), playsinline:'1', rel:'0' });
      return u.href;
    }
    if (record.provider === 'vimeo') {
      const u = new URL(record.embedURL);
      if (u.protocol !== 'https:' || u.hostname !== 'player.vimeo.com' || !/^\/video\/\d+$/.test(u.pathname) || u.username || u.password)
        throw new Error('비메오 연결 주소를 확인해야 합니다. 공식 원본 링크를 이용해 주세요.');
      return u.href; // preserve h and provider options
    }
    if (record.provider === 'file') return record.src;
    throw new Error('이 영상은 공식 원본 링크에서 재생할 수 있습니다.');
  }
  const loading = new Map();
  function loadSDK(provider) {
    if (provider === 'youtube' && root.YT?.Player) return Promise.resolve(root.YT);
    if (provider === 'vimeo' && root.Vimeo?.Player) return Promise.resolve(root.Vimeo);
    if (loading.has(provider)) return loading.get(provider);
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      let timer;
      const finish = (error, value) => { clearTimeout(timer); if (error) { script.remove(); reject(error); } else resolve(value); };
      timer = setTimeout(() => finish(new Error('영상 서비스 응답이 지연됩니다. 다시 시도해 주세요.')), CONFIG.timeoutMs);
      if (provider === 'youtube') {
        const previous = root.onYouTubeIframeAPIReady;
        root.onYouTubeIframeAPIReady = () => { try { previous?.(); } finally { finish(null,root.YT); } };
        script.src = CONFIG.youtubeSDK;
      } else {
        script.src = CONFIG.vimeoSDK;
        script.onload = () => finish(null,root.Vimeo);
      }
      script.onerror = () => finish(new Error('영상 서비스를 불러오지 못했습니다.'));
      document.head.append(script);
    });
    loading.set(provider,promise);
    promise.catch(() => loading.delete(provider));
    return promise;
  }
  function createVideo({ record, container, status, origin = () => location.origin }) {
    let player, frame, active = true, generation = 0, readyTimer, waitingForActivation = false, readyWhileInactive = false, destroyed = false;
    const say = text => { status.textContent = text; };
    function dispose() {
      generation += 1; clearTimeout(readyTimer); readyWhileInactive=false;
      if (record.provider === 'file' && frame) { frame.pause(); frame.removeAttribute('src'); frame.load(); }
      try { const result = player?.destroy?.(); result?.catch?.(() => {}); } catch (_) { /* frame removal remains authoritative */ }
      player = null; frame?.remove(); frame = null;
    }
    async function pause() {
      if (!player) return;
      const current = generation, localPlayer = player;
      try {
        if (record.provider === 'youtube') localPlayer.pauseVideo?.();
        else await localPlayer.pause?.();
      } catch (_) { if(current !== generation) return; say('재생 상태를 확인하지 못했습니다. 원본에서 확인해 주세요.'); }
    }
    async function mount() {
      destroyed = false; waitingForActivation = false;
      dispose(); const current = generation;
      if (!active) { waitingForActivation = true; return; }
      say('영상을 불러오는 중입니다.');
      try {
        const url = embedURL(record,origin());
        if (record.provider === 'file') {
          frame=document.createElement('video'); frame.controls=true; frame.playsInline=true; frame.src=url;
          frame.setAttribute('aria-label',record.title); container.append(frame); player=frame;
          const localVideo=frame;
          frame.addEventListener('playing',() => { if(current !== generation) return; if (!active) localVideo.pause(); else say('재생 중'); });
          frame.addEventListener('pause',() => { if(current === generation) say('일시정지'); });
          frame.addEventListener('error',() => { if(current === generation) say('영상 파일을 재생하지 못했습니다.'); });
          say('플레이어의 재생 버튼을 눌러 주세요.');
          return;
        }
        const sdk = await loadSDK(record.provider);
        if (current !== generation || destroyed) return;
        if (!active) { waitingForActivation = true; say('영상으로 돌아오면 플레이어 준비를 이어갑니다.'); return; }
        frame=document.createElement('iframe'); frame.src=url; frame.title=record.title;
        frame.referrerPolicy=CONFIG.referrerPolicy;
        frame.allow='autoplay; encrypted-media; fullscreen; picture-in-picture'; frame.allowFullscreen=true;
        container.append(frame);
        readyTimer=setTimeout(() => { if(current === generation) { dispose(); say('플레이어 응답이 지연됩니다. 다시 시도하거나 원본에서 확인해 주세요.'); } }, CONFIG.timeoutMs);
        if (record.provider === 'youtube') {
          player=new sdk.Player(frame, { events: {
            onReady(event) { if (current !== generation) return; clearTimeout(readyTimer); readyWhileInactive=!active; say(active?'플레이어의 재생 버튼을 눌러 주세요.':'영상이 준비됐습니다. 돌아온 뒤 재생 버튼을 눌러 주세요.'); if(!active) event.target.pauseVideo(); },
            onStateChange(event) { if(current !== generation) return; if(!active && event.data===1) { event.target.pauseVideo(); return; } const states={1:'재생 중',2:'일시정지',0:'재생 완료',3:'영상 데이터를 받는 중'}; if(states[event.data]) say(states[event.data]); },
            onAutoplayBlocked() { if(current !== generation) return; say('플레이어의 재생 버튼을 눌러 주세요.'); },
            onError(event) { if(current !== generation) return; clearTimeout(readyTimer); say(ERRORS[event.data] || '영상을 재생하지 못했습니다. 원본에서 확인해 주세요.'); }
          }});
        } else {
          player=new sdk.Player(frame);
          const readyPlayer=player;
          await readyPlayer.ready();
          if(current !== generation) return;
          clearTimeout(readyTimer);
          const localPlayer=player;
          player.on('play',() => { if(current !== generation) return; if(!active) localPlayer.pause().catch(() => {}); else say('재생 중'); });
          player.on('pause',() => { if(current === generation) say('일시정지'); }); player.on('ended',() => { if(current === generation) say('재생 완료'); });
          player.on('error',error => { if(current === generation) say('비메오 재생 오류: '+error.name); });
          readyWhileInactive=!active;
          if(!active) {await player.pause();say('영상이 준비됐습니다. 돌아온 뒤 재생 버튼을 눌러 주세요.');} else say('플레이어의 재생 버튼을 눌러 주세요.');
        }
      } catch(error) { if(current === generation) { dispose(); say(error.message); } }
    }
    function setActive(value) {
      active=!!value;
      if(!active) pause();
      else if(waitingForActivation&&!destroyed) { waitingForActivation=false; void mount(); }
      else if(readyWhileInactive&&!destroyed) {readyWhileInactive=false;say('플레이어의 재생 버튼을 눌러 주세요.');}
    }
    function destroy() { destroyed=true; waitingForActivation=false; dispose(); }
    return { mount, setActive, destroy };
  }
  const api={CONFIG,embedURL,createVideo};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  else root.GestaltVideo=api;
})(globalThis);
