(() => {
  const stage = document.querySelector('#stage');
  const canvas = document.querySelector('#view');
  const calmButton = document.querySelector('#calm');
  const beats = [...document.querySelectorAll('.beat')];
  const osdBox = document.querySelector('#osd');
  const topBar = document.querySelector('.top');
  const osd = {arm: document.querySelector('#osd-arm'), mode: document.querySelector('#osd-mode'), volt: document.querySelector('#osd-volt'), speed: document.querySelector('#osd-speed')};
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let calm = reducedQuery.matches;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mix = (a, b, f) => a + (b - a) * f;
  const smooth = x => { const t = clamp(x); return t * t * (3 - 2 * t); };
  const smoother = x => { const t = clamp(x); return t * t * t * (t * (t * 6 - 15) + 10); };
  const band = (x, a, b) => smooth((x - a) / (b - a));

  /* 비행 경로: 격납고 안에서는 굽이치고, 문을 나서면 위로 오르며 블랙홀 축에 맞춘다. */
  const GATES = [48, 100, 152, 204, 256, 322, 386, 450];
  const DOOR = 290, HOLE_Z = 660, HOLE_R = 24, HALL_W = 17, HALL_H = 10;
  const straight = z => 1 - band(z, 470, 545);
  const pathX = z => straight(z) * (8.5 * Math.sin(z * .023) + 4.5 * Math.sin(z * .051 + 1.2));
  const pathY = z => 3.1 + straight(z) * .9 * Math.sin(z * .037 + .6) + 11 * band(z, DOOR + 30, 470) - 2.5 * (1 - band(z, -6, 20));
  const AXIS_Y = pathY(600);
  /* 스크롤 구간마다 멈추는 카메라 자리: 출발, 게이트 여덟 앞, 블랙홀 앞, 사건의 지평선 안 */
  const STOPS = [-6, ...GATES.map(g => g - 15), 538, 650];

  function hex(name) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim().replace('#', '');
    return [0, 2, 4].map(i => parseInt(v.slice(i, i + 2), 16) / 255);
  }

  /* 저성능 기기는 처음부터 해상도와 먼지 수를 낮춘다. */
  const narrow = Math.min(innerWidth, innerHeight) < 500;
  const weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  let quality = weak ? .75 : narrow ? 1 : 1.5;
  const dustCount = weak ? 900 : narrow ? 1500 : 2600;

  let gl = null;
  try { gl = canvas.getContext('webgl', {alpha: false, antialias: !weak, powerPreference: 'high-performance'}); } catch (e) { gl = null; }

  function shader(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function program(vs, fs, attrs) {
    const p = gl.createProgram();
    gl.attachShader(p, shader(gl.VERTEX_SHADER, vs)); gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
    attrs.forEach((a, i) => gl.bindAttribLocation(p, i, a));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i).name; u[name] = gl.getUniformLocation(p, name); }
    return {p, u};
  }

  /* 세계 만들기: 정점 하나에 위치 3, 색 3, 발광 1 */
  const verts = [];
  const tri = (a, b, c, col, glow) => { for (const v of [a, b, c]) verts.push(v[0], v[1], v[2], col[0], col[1], col[2], glow); };
  const quad = (a, b, c, d, col, glow = 0) => { tri(a, b, c, col, glow); tri(a, c, d, col, glow); };
  const shade = (col, k) => col.map(v => v * k);
  function box(c, right, up, front, hx, hy, hz, col, glow = 0) {
    const at = (x, y, z) => [0, 1, 2].map(i => c[i] + right[i] * x * hx + up[i] * y * hy + front[i] * z * hz);
    const [a, b, d, e, f, g, h, i] = [at(-1, -1, -1), at(1, -1, -1), at(1, 1, -1), at(-1, 1, -1), at(-1, -1, 1), at(1, -1, 1), at(1, 1, 1), at(-1, 1, 1)];
    quad(a, b, d, e, col, glow);
    quad(f, g, h, i, shade(col, .85), glow);
    quad(a, f, i, e, shade(col, .7), glow);
    quad(b, g, h, d, shade(col, .7), glow);
    quad(e, d, h, i, shade(col, 1.15), glow);
    quad(a, b, g, f, shade(col, .55), glow);
  }
  const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];

  const SEG = {0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg'};
  function digit(n, c, right, up, front, size, col) {
    const w = size * .5, h = size, t = size * .09;
    const bars = {a: [0, h, w, t], d: [0, -h, w, t], g: [0, 0, w, t], f: [-w, h / 2, t, h / 2], b: [w, h / 2, t, h / 2], e: [-w, -h / 2, t, h / 2], c: [w, -h / 2, t, h / 2]};
    for (const s of SEG[n]) {
      const [ox, oy, hx, hy] = bars[s];
      const p = [0, 1, 2].map(i => c[i] - right[i] * ox + up[i] * oy - front[i] * .22);
      box(p, right, up, front, hx, hy, .06, col, 1);
    }
  }

  function buildWorld() {
    const c = {orange: hex('--fpv-orange'), deep: hex('--fpv-orange-deep'), hot: hex('--fpv-orange-hot'), steel: hex('--fpv-steel'), wall: hex('--fpv-wall'), a: hex('--fpv-floor-a'), b: hex('--fpv-floor-b'), win: hex('--fpv-window'), lamp: hex('--fpv-lamp'), sign: hex('--fpv-sign')};
    const step = 6;
    let row = 0;
    for (let z = -30; z < DOOR; z += step, row++) {
      const z2 = z + step, x1 = pathX(z), x2 = pathX(z2);
      /* 바닥 타일과 가운데 유도선 */
      for (let k = -3; k < 3; k++) {
        const w = HALL_W / 3;
        quad([x1 + k * w, 0, z], [x1 + (k + 1) * w, 0, z], [x2 + (k + 1) * w, 0, z2], [x2 + k * w, 0, z2], (row + k) % 2 ? c.a : c.b);
      }
      if (row % 2 === 0) quad([x1 - .07, .02, z + 1], [x1 + .07, .02, z + 1], [x2 + .07, .02, z2 - 1], [x2 - .07, .02, z2 - 1], shade(c.lamp, .42), .6);
      /* 양쪽 벽과 창문 띠: 속도가 눈에 들어오는 부분 */
      for (const side of [-1, 1]) {
        const a = x1 + side * HALL_W, b = x2 + side * HALL_W;
        quad([a, 0, z], [b, 0, z2], [b, HALL_H, z2], [a, HALL_H, z], shade(c.wall, row % 2 ? 1 : .86));
        if (row % 3 !== 2) quad([a - side * .1, 4.2, z + .7], [b - side * .1, 4.2, z2 - .7], [b - side * .1, 7.4, z2 - .7], [a - side * .1, 7.4, z + .7], c.win, .4);
        if (row % 3 === 0) box([a - side * .5, HALL_H / 2, z], X, Y, Z, .5, HALL_H / 2, .4, c.steel);
      }
      /* 천장 보와 조명 */
      if (row % 3 === 0) {
        box([x1, HALL_H, z], X, Y, Z, HALL_W, .28, .22, c.steel);
        box([x1 - 7, HALL_H - .5, z], X, Y, Z, 1.6, .06, .16, c.lamp, 1);
        box([x1 + 7, HALL_H - .5, z], X, Y, Z, 1.6, .06, .16, c.lamp, 1);
      }
    }
    /* 격납고 문: 빛나는 테두리 사이로 어둠이 열린다 */
    const dx = pathX(DOOR), open = 11, top = 8.5;
    for (const side of [-1, 1]) box([dx + side * (open + HALL_W) / 2, HALL_H / 2, DOOR], X, Y, Z, (HALL_W - open) / 2, HALL_H / 2, .3, c.steel);
    box([dx, (top + HALL_H) / 2, DOOR], X, Y, Z, open, (HALL_H - top) / 2, .3, c.steel);
    box([dx - open, top / 2, DOOR - .4], X, Y, Z, .12, top / 2, .1, c.hot, 1);
    box([dx + open, top / 2, DOOR - .4], X, Y, Z, .12, top / 2, .1, c.hot, 1);
    box([dx, top, DOOR - .4], X, Y, Z, open, .12, .1, c.hot, 1);
    /* 문 밖 활주 격자: 점점 사라진다 */
    for (let z = DOOR; z < 450; z += 12) {
      const f = 1 - (z - DOOR) / 160;
      const x = pathX(z), col = shade(c.win, f * .35);
      quad([x - 26, .01, z], [x + 26, .01, z], [x + 26, .01, z + .2], [x - 26, .01, z + .2], col, .8);
      for (const k of [-24, -12, 12, 24]) quad([x + k, .01, z], [x + k + .15, .01, z], [pathX(z + 12) + k + .15, .01, z + 12], [pathX(z + 12) + k, .01, z + 12], col, .8);
    }
    /* 게이트 여덟 개. 번호가 곧 차시다. */
    GATES.forEach((gz, index) => {
      const p = [pathX(gz), pathY(gz), gz];
      const slope = (pathX(gz + 2) - pathX(gz - 2)) / 4;
      const len = Math.hypot(slope, 1);
      const front = [slope / len, 0, 1 / len];
      const right = [1 / len, 0, -slope / len];
      const half = 3.6, t = .24, air = gz > DOOR;
      const low = air ? p[1] - 2.8 : 0, high = p[1] + 2.8;
      const centre = (ox, oy) => [p[0] + right[0] * ox, oy, p[2] + right[2] * ox];
      for (const side of [-1, 1]) {
        box(centre(side * half, (low + high) / 2), right, Y, front, t, (high - low) / 2, t * .8, c.orange, .55);
        if (!air) box(centre(side * half, .08), right, Y, front, t * 2, .08, t * 3, c.steel);
      }
      box(centre(0, high), right, Y, front, half + t, t, t * .8, c.orange, .55);
      if (air) box(centre(0, low), right, Y, front, half + t, t, t * .8, c.orange, .55);
      box(centre(0, high + 1.1), right, Y, front, 1, .85, .1, c.sign);
      digit(index + 1, centre(0, high + 1.1), right, Y, front, .62, c.lamp);
    });
    return new Float32Array(verts);
  }

  /* 먼지와 별: 정점 쌍으로 선을 그려 속도에 따라 늘인다. 위치 3, 한쪽 끝 표시 1 */
  function buildDust(n) {
    const out = new Float32Array(n * 8);
    for (let i = 0; i < n; i++) {
      const hall = i < n * .34;
      const z = hall ? mix(-20, DOOR, Math.random()) : mix(DOOR, HOLE_Z + 10, Math.pow(Math.random(), .75));
      const angle = Math.random() * Math.PI * 2;
      const r = hall ? 1.2 + Math.random() * 11 : 7 + Math.pow(Math.random(), 1.4) * 95;
      const x = pathX(z) + Math.cos(angle) * r;
      const y = hall ? clamp(pathY(z) + Math.sin(angle) * r, .2, HALL_H - .3) : pathY(z) + Math.sin(angle) * r;
      out.set([x, y, z, 0, x, y, z, 1], i * 8);
    }
    return out;
  }

  let world, dust, hole, static_, worldBuf, dustBuf, quadBuf, worldCount = 0, activeDust = dustCount;
  const COL = {};
  function initGL() {
    world = program(
      `attribute vec3 p;attribute vec3 c;attribute float g;uniform mat4 m;varying vec3 v;varying float d;varying float e;
       void main(){vec4 q=m*vec4(p,1.);gl_Position=q;v=c;e=g;d=q.w;}`,
      `precision mediump float;varying vec3 v;varying float d;varying float e;uniform vec3 fog;uniform float k;uniform float lift;
       void main(){float f=exp(-pow(d*k,2.));vec3 col=v*(1.+e*.9)*lift;gl_FragColor=vec4(mix(fog,col,mix(f,max(f,.55),e)),1.);}`,
      ['p', 'c', 'g']);
    dust = program(
      `attribute vec3 p;attribute float s;uniform mat4 m;uniform vec3 dir;uniform float len;uniform float spin;uniform vec2 axis;uniform float holeZ;varying float a;
       void main(){vec3 w=p;float t=clamp(1.-(holeZ-w.z)/260.,0.,1.);
        vec2 q=w.xy-axis;float ang=spin*t*t*2.2;float cs=cos(ang),sn=sin(ang);q=vec2(cs*q.x-sn*q.y,sn*q.x+cs*q.y)*(1.-.55*t*t);w.xy=axis+q;
        w+=dir*s*len;vec4 v=m*vec4(w,1.);gl_Position=v;a=clamp(v.w/4.,0.,1.)*exp(-v.w*.008);}`,
      `precision mediump float;varying float a;uniform vec3 col;uniform float amp;void main(){gl_FragColor=vec4(col*a*amp,1.);}`,
      ['p', 's']);
    hole = program(
      `attribute vec2 p;void main(){gl_Position=vec4(p,1.,1.);}`,
      `precision highp float;uniform vec2 c;uniform float r;uniform float t;uniform vec3 hot;uniform vec3 mid;uniform vec3 sky;uniform float amp;
       void main(){vec2 d=gl_FragCoord.xy-c;float l=length(d);float x=l/r;float a=atan(d.y,d.x);
        float arms=.5+.5*sin(a*3.+5.5*log(max(x,.001))-t);
        float disc=exp(-max(x-1.,0.)*1.25)*(.18+.82*arms*arms);
        float ring=exp(-pow((x-1.04)*13.,2.));
        vec3 col=mix(mid,hot,clamp(exp(-(x-1.)*1.8),0.,1.))*disc+hot*ring*1.3;
        col*=smoothstep(.96,1.,x);
        gl_FragColor=vec4(sky+col*amp,1.);}`,
      ['p']);
    static_ = program(
      `attribute vec2 p;void main(){gl_Position=vec4(p,1.,1.);}`,
      `precision mediump float;uniform float t;uniform float amt;
       float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
       void main(){vec2 u=gl_FragCoord.xy;float line=floor(u.y/3.);float n=h(vec2(floor(u.x/3.),line+t));
        float roll=step(.72,h(vec2(floor(u.y/46.+t*.7),t)));
        float a=amt*(.1+.5*roll)*n;gl_FragColor=vec4(vec3(n),a);}`,
      ['p']);
    const data = buildWorld();
    worldCount = data.length / 7;
    worldBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, worldBuf); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    dustBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, dustBuf); gl.bufferData(gl.ARRAY_BUFFER, buildDust(dustCount), gl.STATIC_DRAW);
    quadBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    Object.assign(COL, {fogHall: hex('--fpv-floor-b'), void: hex('--fpv-void'), hot: hex('--fpv-disc-hot'), mid: hex('--fpv-orange'), dust: hex('--fpv-dust')});
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE); gl.disable(gl.CULL_FACE);
  }

  /* 행렬 */
  const norm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  function matrix(eye, look, roll, fov, aspect, sx, sy) {
    const f = norm([look[0] - eye[0], look[1] - eye[1], look[2] - eye[2]]);
    let r = norm(cross(f, Y));
    let u = cross(r, f);
    const cr = Math.cos(roll), sr = Math.sin(roll);
    [r, u] = [[r[0] * cr + u[0] * sr, r[1] * cr + u[1] * sr, r[2] * cr + u[2] * sr], [u[0] * cr - r[0] * sr, u[1] * cr - r[1] * sr, u[2] * cr - r[2] * sr]];
    const v = [r[0], u[0], -f[0], 0, r[1], u[1], -f[1], 0, r[2], u[2], -f[2], 0, -dot(r, eye), -dot(u, eye), dot(f, eye), 1];
    const t = 1 / Math.tan(fov / 2), near = .12, far = 900;
    const p = [t / aspect, 0, 0, 0, 0, t, 0, 0, -sx, -sy, (far + near) / (near - far), -1, 0, 0, 2 * far * near / (near - far), 0];
    const m = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let w = 0; w < 4; w++) { let s = 0; for (let k = 0; k < 4; k++) s += p[w + k * 4] * v[k + c * 4]; m[w + c * 4] = s; }
    return {m, t, f};
  }

  /* 스크롤과 카메라 자리 */
  let keys = [], room = 1, centers = [];
  function layout() {
    room = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    centers = beats.map(b => { const top = b.getBoundingClientRect().top + scrollY; return clamp((top + b.offsetHeight / 2 - innerHeight / 2) / room); });
    centers[0] = 0;
    const end = beats[beats.length - 1];
    centers[centers.length - 1] = clamp((end.getBoundingClientRect().top + scrollY - innerHeight * .55) / room, centers[centers.length - 2] + .001, 1);
    keys = centers.map((s, i) => [s, STOPS[i]]);
  }
  function segment(s) {
    let i = 0;
    while (i < keys.length - 2 && s > keys[i + 1][0]) i++;
    return {i, f: clamp((s - keys[i][0]) / (keys[i + 1][0] - keys[i][0] || 1))};
  }
  function zAt(s) {
    if (calm) { let best = 0; centers.forEach((c, i) => { if (Math.abs(c - s) < Math.abs(centers[best] - s)) best = i; }); return STOPS[best]; }
    const {i, f} = segment(s);
    return mix(keys[i][1], keys[i + 1][1], mix(smoother(f), f, .12));
  }
  function nearBeat(s, name) {
    const i = beats.findIndex(b => b.dataset.effect === name);
    const span = centers[i + 1] - centers[i];
    return smooth(1 - Math.abs(s - centers[i]) / span);
  }
  function acroRoll(s) {
    const i = beats.findIndex(b => b.dataset.effect === 'acro');
    if (s < centers[i]) return .32 * smooth((s - centers[i - 1]) / (centers[i] - centers[i - 1]));
    return .32 * (1 - smooth((s - centers[i]) / (centers[i + 1] - centers[i])));
  }
  const goalNow = () => clamp(scrollY / room);

  /* 렌더 */
  let width = 0, height = 0, scale = 1, shown = goalNow(), lastZ = 0, speed = 0, spin = 0, t0 = performance.now(), last = t0, frame = 0, awakeUntil = 0;
  const stats = {slow: 0};
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    scale = Math.min(dpr, quality);
    const pw = Math.round(w * scale), ph = Math.round(h * scale);
    if (pw !== canvas.width || ph !== canvas.height) { canvas.width = pw; canvas.height = ph; }
    width = pw; height = ph;
    gl.viewport(0, 0, pw, ph);
    const portrait = w < 768 || h > w;
    stage.style.setProperty('--fpv-vx', portrait ? '50%' : '66%');
    stage.style.setProperty('--fpv-vy', portrait ? '34%' : '50%');
  }
  function draw(now) {
    const s = shown;
    const z = zAt(s);
    const dt = Math.max(.001, (now - last) / 1000);
    const raw = (z - lastZ) / dt; lastZ = z;
    speed += (raw - speed) * (1 - Math.exp(-dt * 7));
    const sp = calm ? 0 : clamp(Math.abs(speed) / 130);
    const zone = band(z, 470, 640);
    const time = (now - t0) / 1000;
    if (!calm) spin += dt * (.5 + sp * 3) * (1 + zone * 2);

    const sway = calm ? 0 : .04 + sp * .05;
    const n1 = Math.sin(time * 13.1) * .6 + Math.sin(time * 23.7) * .4, n2 = Math.sin(time * 17.3 + 1) * .6 + Math.sin(time * 29.1) * .4;
    const eye = [pathX(z) + n1 * sway, pathY(z) + n2 * sway, z];
    const ahead = z + 14;
    const look = [pathX(ahead), pathY(ahead), ahead];
    const curve = (pathX(z + 7) - 2 * pathX(z) + pathX(z - 7)) / 49;
    let roll = calm ? 0 : clamp(curve * 34, -.55, .55) * (.3 + .7 * sp);
    if (!calm) roll += acroRoll(s) + zone * zone * spin * .32 + n1 * .004 * (1 + sp * 3);
    const fov = (calm ? 74 : 72 + sp * 30 + zone * 22) * Math.PI / 180;
    const aspect = width / height;
    const portrait = canvas.clientWidth < 768 || canvas.clientHeight > canvas.clientWidth;
    const sx = (portrait ? 0 : .32) * (1 - zone), sy = (portrait ? .32 : 0) * (1 - zone);
    const cam = matrix(eye, look, roll, fov, aspect, sx, sy);

    const outdoors = band(z, DOOR - 10, DOOR + 40);
    const fog = COL.fogHall.map((v, i) => mix(v, COL.void[i], outdoors));
    gl.clearColor(fog[0], fog[1], fog[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* 블랙홀: 화면 공간에서 가장 먼저 그린다 */
    const hp = [0, AXIS_Y, HOLE_Z];
    const clip = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) clip[i] = cam.m[i] * hp[0] + cam.m[4 + i] * hp[1] + cam.m[8 + i] * hp[2] + cam.m[12 + i];
    const dist = Math.max(.5, HOLE_Z - z);
    if (clip[3] > 0) {
      gl.disable(gl.DEPTH_TEST);
      gl.useProgram(hole.p);
      gl.uniform2f(hole.u.c, (clip[0] / clip[3] * .5 + .5) * width, (clip[1] / clip[3] * .5 + .5) * height);
      gl.uniform1f(hole.u.r, HOLE_R / dist * cam.t * height / 2);
      gl.uniform1f(hole.u.t, calm ? 0 : spin * 2.4);
      gl.uniform3fv(hole.u.hot, COL.hot); gl.uniform3fv(hole.u.mid, COL.mid); gl.uniform3fv(hole.u.sky, fog);
      gl.uniform1f(hole.u.amp, mix(.75, 1, zone));
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.disableVertexAttribArray(1); gl.disableVertexAttribArray(2);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.enable(gl.DEPTH_TEST);
    }

    gl.useProgram(world.p);
    gl.uniformMatrix4fv(world.u.m, false, cam.m);
    gl.uniform3fv(world.u.fog, fog);
    gl.uniform1f(world.u.k, mix(.0105, .0052, outdoors));
    gl.uniform1f(world.u.lift, 1 - zone * .6);
    gl.bindBuffer(gl.ARRAY_BUFFER, worldBuf);
    for (let i = 0; i < 3; i++) gl.enableVertexAttribArray(i);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 28, 12);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 28, 24);
    gl.drawArrays(gl.TRIANGLES, 0, worldCount);

    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.depthMask(false);
    gl.useProgram(dust.p);
    gl.uniformMatrix4fv(dust.u.m, false, cam.m);
    gl.uniform3fv(dust.u.dir, cam.f);
    gl.uniform1f(dust.u.len, calm ? .05 : .06 + (speed < 0 ? -1 : 1) * sp * 4.2 + zone * 5);
    gl.uniform1f(dust.u.spin, calm ? .8 : spin);
    gl.uniform2f(dust.u.axis, 0, AXIS_Y);
    gl.uniform1f(dust.u.holeZ, HOLE_Z);
    gl.uniform3fv(dust.u.col, COL.dust);
    gl.uniform1f(dust.u.amp, mix(.5, 1.1, outdoors));
    gl.bindBuffer(gl.ARRAY_BUFFER, dustBuf);
    gl.enableVertexAttribArray(0); gl.enableVertexAttribArray(1); gl.disableVertexAttribArray(2);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 16, 12);
    gl.drawArrays(gl.LINES, 0, activeDust * 2);
    gl.depthMask(true);

    /* 3차시: 아날로그 잡음 */
    const noise = calm ? 0 : nearBeat(s, 'noise');
    if (noise > .02) {
      gl.disable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(static_.p);
      gl.uniform1f(static_.u.t, Math.floor(time * 24));
      gl.uniform1f(static_.u.amt, noise);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.disableVertexAttribArray(1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.enable(gl.DEPTH_TEST);
    }
    gl.disable(gl.BLEND);
    return {z, sp, noise};
  }

  /* 글과 OSD는 DOM이라 WebGL이 없어도 움직인다 */
  const setText = (node, text) => { if (node.textContent !== text) node.textContent = text; };
  function overlay(s, z, sp) {
    const vh = innerHeight / room;
    beats.forEach((b, i) => {
      const box = b.firstElementChild;
      if (i === beats.length - 1) { box.style.opacity = calm ? (s > centers[i] - vh * .4 ? 1 : 0) : smooth((s - (centers[i] - vh * .05)) / (vh * .35)); return; }
      const d = Math.abs(s - centers[i]);
      const span = i === 0 ? vh * .6 : vh * .55;
      box.style.opacity = calm ? (d < vh * .4 ? 1 : 0) : 1 - smooth((d - span * .35) / (span * .65));
    });
    const armed = s > .005;
    setText(osd.arm, armed ? 'ARMED' : 'DISARMED');
    osd.arm.classList.toggle('warn', !armed);
    const acroFrom = centers[beats.findIndex(b => b.dataset.effect === 'acro')] - vh * .4;
    setText(osd.mode, s > acroFrom ? 'ACRO' : 'ANGLE');
    setText(osd.volt, (16.8 - 2 * s).toFixed(1) + 'V');
    setText(osd.speed, Math.round(sp * 120) + 'km/h');
    const ending = s > centers[centers.length - 1] - vh * .05;
    osdBox.style.opacity = ending ? 0 : 1;
    topBar.toggleAttribute('data-solid', ending);
  }

  function tick(now) {
    const dt = Math.min(.05, (now - last) / 1000);
    const goal = goalNow();
    shown = calm ? goal : shown + (goal - shown) * (1 - Math.exp(-dt * 9));
    if (Math.abs(goal - shown) < .00006) shown = goal;
    let info = {z: zAt(shown), sp: 0};
    if (gl) info = draw(now);
    overlay(shown, info.z, info.sp);
    last = now;
    /* 느리면 해상도를 낮춘다. 그래도 느리면 먼지를 줄인다 */
    if (gl) {
      if (dt > .03) stats.slow++; else stats.slow = Math.max(0, stats.slow - .25);
      if (stats.slow > 18) {
        stats.slow = 0;
        if (quality > .6) { quality = Math.max(.6, quality * .8); resize(); }
        else activeDust = Math.max(400, Math.round(activeDust * .7));
        stage.dataset.quality = quality.toFixed(2);
      }
    }
    const moving = goal !== shown || Math.abs(speed) > .5;
    if (moving) awakeUntil = now + (calm ? 0 : 1400);
    frame = now < awakeUntil || moving ? requestAnimationFrame(tick) : 0;
    if (!frame && calm) { speed = 0; }
  }
  function wake(hold = 0) {
    const now = performance.now();
    awakeUntil = Math.max(awakeUntil, now + hold);
    if (!frame) { if (now - last > 120) last = now - 16; frame = requestAnimationFrame(tick); }
  }

  function setCalm(value) {
    calm = value;
    calmButton.setAttribute('aria-pressed', String(calm));
    stage.dataset.mode = calm ? 'calm' : 'flight';
    wake(200);
  }

  function fallback() {
    gl = null;
    stage.dataset.static = '';
    wake(200);
  }

  layout();
  lastZ = zAt(shown);
  if (gl) {
    try { initGL(); resize(); }
    catch (e) { console.warn(e); fallback(); }
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); fallback(); });
  } else fallback();

  addEventListener('scroll', () => wake(), {passive: true});
  addEventListener('resize', () => { layout(); if (gl) resize(); wake(200); });
  addEventListener('load', () => { layout(); wake(200); });
  calmButton.addEventListener('click', () => setCalm(!calm));
  reducedQuery.addEventListener('change', event => setCalm(event.matches));
  setCalm(calm);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { layout(); wake(100); });
})();
/* 페이지 공유: canonical과 제목만 전달한다. 취소는 정상 취소로 두고 복사하지 않는다. */
(() => {
  const button = document.querySelector('#share');
  const status = document.querySelector('#share-status');
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  if (!button || !status) return;
  if (!canonical) return;
  button.hidden = false;
  let timer = 0;

  function say(text, showAddress = false) {
    clearTimeout(timer);
    status.replaceChildren(text);
    status.hidden = false;
    if (showAddress) {
      const address = document.createElement('input');
      address.readOnly = true;
      address.value = canonical;
      address.setAttribute('aria-label', '페이지 주소');
      address.addEventListener('blur', () => { status.hidden = true; });
      status.append(address);
      address.focus();
      address.select();
    } else {
      timer = setTimeout(() => { status.hidden = true; }, 2400);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(canonical);
      say('링크를 복사했습니다.');
    } catch (error) {
      say('복사하지 못했습니다. 주소를 직접 복사해 주세요.', true);
    }
  }

  button.addEventListener('click', async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({title: document.title, url: canonical});
    } catch (error) {
      if (error.name !== 'AbortError') copy();
    }
  });
})();
