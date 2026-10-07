import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

export function start(canvas, opts) {
  opts = opts || {};
  const mobile = !!opts.mobile;
  const COUNT = mobile ? 48 : 120;          // 60% fewer on mobile
  const LINK = mobile ? 120 : 150;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  } catch (e) { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 1, 2000);
  camera.position.z = 520;
  const group = new THREE.Group();
  scene.add(group);

  const palette = [0x4285f4, 0xea4335, 0xfbbc05, 0x34a853].map(c => new THREE.Color(c));
  const base = new THREE.Color(0x8f94ff);
  const BOX = { x: 420, y: 230, z: 160 };
  const pos = new Float32Array(COUNT * 3), vel = [], col = new Float32Array(COUNT * 3), size = new Float32Array(COUNT), glow = new Float32Array(COUNT), hue = [];
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() * 2 - 1) * BOX.x; pos[i * 3 + 1] = (Math.random() * 2 - 1) * BOX.y; pos[i * 3 + 2] = (Math.random() * 2 - 1) * BOX.z;
    vel.push([(Math.random() - .5) * .25, (Math.random() - .5) * .25, (Math.random() - .5) * .12]);
    hue.push(palette[i % 4]); size[i] = 3 + Math.random() * 2;
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
  pg.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  const pm = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uScale: { value: renderer.getPixelRatio() } },
    vertexShader: 'attribute float aSize; varying vec3 vC; uniform float uScale; void main(){ vC=color; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=aSize*uScale*(420.0/-mv.z); gl_Position=projectionMatrix*mv; }',
    fragmentShader: 'varying vec3 vC; void main(){ float d=length(gl_PointCoord-0.5); if(d>0.5) discard; gl_FragColor=vec4(vC, smoothstep(0.5,0.0,d)); }',
    vertexColors: true
  });
  group.add(new THREE.Points(pg, pm));

  const maxSeg = COUNT * 6;
  const lpos = new Float32Array(maxSeg * 6), lcol = new Float32Array(maxSeg * 6);
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.BufferAttribute(lpos, 3).setUsage(THREE.DynamicDrawUsage));
  lg.setAttribute('color', new THREE.BufferAttribute(lcol, 3).setUsage(THREE.DynamicDrawUsage));
  const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  group.add(lines);

  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize); ro.observe(canvas);

  let tx = 0, ty = 0, running = false, visible = true, raf = 0, last = 0, pulseAt = 0;
  if (!mobile) window.addEventListener('pointermove', e => { tx = (e.clientX / innerWidth - .5); ty = (e.clientY / innerHeight - .5); }, { passive: true });

  function frame(t) {
    raf = 0; if (!running) return;
    const dt = Math.min(50, t - last || 16); last = t;
    if (t > pulseAt) { glow[(Math.random() * COUNT) | 0] = 1; pulseAt = t + 350; }
    for (let i = 0; i < COUNT; i++) {
      const v = vel[i];
      for (let k = 0; k < 3; k++) {
        const j = i * 3 + k, lim = k === 0 ? BOX.x : k === 1 ? BOX.y : BOX.z;
        pos[j] += v[k] * dt * .06 * 16 / 16; if (pos[j] > lim || pos[j] < -lim) v[k] *= -1;
      }
      glow[i] *= .96;
      const g = glow[i], c = hue[i];
      col[i * 3] = base.r * .55 + c.r * g * 1.2; col[i * 3 + 1] = base.g * .55 + c.g * g * 1.2; col[i * 3 + 2] = base.b * .55 + c.b * g * 1.2;
      size[i] = (mobile ? 3.2 : 3) + g * 4;
    }
    let n = 0;
    for (let i = 0; i < COUNT && n < maxSeg; i++) for (let j = i + 1; j < COUNT && n < maxSeg; j++) {
      const dx = pos[i * 3] - pos[j * 3], dy = pos[i * 3 + 1] - pos[j * 3 + 1], dz = pos[i * 3 + 2] - pos[j * 3 + 2];
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < LINK * LINK) {
        const a = (1 - Math.sqrt(d2) / LINK) * .55, o = n * 6;
        lpos[o] = pos[i * 3]; lpos[o + 1] = pos[i * 3 + 1]; lpos[o + 2] = pos[i * 3 + 2];
        lpos[o + 3] = pos[j * 3]; lpos[o + 4] = pos[j * 3 + 1]; lpos[o + 5] = pos[j * 3 + 2];
        const r = (.3 + glow[i] * .4) * a, gg = (.35 + glow[i] * .3) * a, b = .9 * a;
        lcol[o] = lcol[o + 3] = r; lcol[o + 1] = lcol[o + 4] = gg; lcol[o + 2] = lcol[o + 5] = b;
        n++;
      }
    }
    lg.setDrawRange(0, n * 2);
    lg.attributes.position.needsUpdate = true; lg.attributes.color.needsUpdate = true;
    pg.attributes.position.needsUpdate = true; pg.attributes.color.needsUpdate = true; pg.attributes.aSize.needsUpdate = true;
    group.rotation.y += (tx * .5 - group.rotation.y) * .04; group.rotation.x += (ty * .3 - group.rotation.x) * .04;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function sync() {
    const should = visible && !document.hidden;
    if (should && !running) { running = true; last = 0; raf = requestAnimationFrame(frame); }
    else if (!should && running) { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  }
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(es => { visible = es[0].isIntersecting; sync(); }).observe(canvas);
  sync();
  return { stop() { running = false; ro.disconnect(); renderer.dispose(); } };
}
