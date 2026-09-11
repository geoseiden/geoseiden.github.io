/* =====================================================================
   BUS TRACK — Inauguration sequence
   One GSAP master timeline drives the whole show. Edit CONFIG first.
   ===================================================================== */

/* ---------------------------------------------------------------------
   CONFIG — everything a student is likely to change lives here
   --------------------------------------------------------------------- */
const CONFIG = {
  // REDIRECT: where "ENTER SYSTEM" (and auto-redirect) goes
  redirectUrl: 'https://bustrack-x54s.onrender.com/',
  autoRedirect: false,     // true → redirect automatically after the final hold
  redirectDelay: 8,        // seconds of countdown shown before auto-redirect

  requireStart: true,      // show the "BEGIN INAUGURATION" gate (also enables audio)
  audio: true,             // cinematic sound design, synthesized in-browser (no files needed)
  audioVolume: 0.9,        // 0–1 overall level

  // OPTIONAL real sound files (mp3/wav/ogg). Leave '' to use the synthesized version of that cue.
  sounds: {
    ambience: '',   // long, loopable drone / night ambience
    ignition: '',   // headlight power-up impact
    whoosh:   '',   // bus rolls forward
    gps:      '',   // GPS lock ping
    transition: '', // road → dashboard sweep
    engine:   '',   // old diesel engine loop played while the bus travels between stops (synthesized if empty)
    stop:     '',   // stop reached tick
    arrive:   '',   // destination reached
    riser:    '',   // build-up before the title
    boom:     'assets/title-hit.mp3',   // title reveal impact (cut from the reference clip)
  },

  // CINEMATIC CLIP — plays darkness → ignition → lit bus with its own sound, then freezes.
  // Set src '' to fall back to the photo / SVG bus below.
  busVideo: {
    src: 'assets/intro.mp4',      // reference clip: darkness → ignition → bus pulls away with its own text + satellite
    still: 'assets/bus-lit.jpg',  // clean lit frame, shown behind the final title
    poster: 'assets/bus-dark.jpg',// first frame (dark silhouette)
    ignitionAt: 1.55,             // seconds into the clip when the headlights strike
    endAt: 6.25,                  // seconds into the clip to cut to the dashboard (before the clip's own tablet UI)
    // The shipped intro.mp4 already contains a smooth, frame-interpolated slow-motion stretch from 3.25 s
    // (the text section runs at half speed; audio stays at normal speed). Browser-side slowing stutters, so leave slowRate at 1.
    slowFrom: 3.25,
    slowRate: 1,
    flashL: [43.8, 58.5],         // headlamp positions on the clip's last frame [x%, y%] — the dashboard flash blooms from here
    flashR: [56.7, 58.5],
  },

  // REAL BUS PHOTO — a cut-out PNG (transparent background), front or front-3/4 view.
  // Leave src '' to use the built-in SVG bus. Coordinates are % of the image box:
  // open index.html?calibrate and click the two headlamps (then the ground line) to get them.
  busImage: {
    src: 'assets/bus.png',   // '' → built-in SVG bus. Photo: Sahrdaya fleet bus, unmodified (see README credits)
    lampL: [16.9, 80.6],     // left headlamp centre  [x%, y%]   (index.html?calibrate prints these)
    lampR: [62.7, 80.0],     // right headlamp centre [x%, y%]
    beamRot: [8, -4],        // beam splay per lamp (deg, positive = toward the left)
    groundY: 96,             // % from the top where the tyres meet the road
    width: 'min(52vw, 78vh)', // size of the bus box on screen
    offsetX: 5,              // vw — shift right so the front face sits near centre
  },

  // ROUTE STOPS — `at` is the position along the SVG route (0 = start, 1 = end)
  // `label` is the text offset from the node, `anchor` is the SVG text-anchor.
  // lat/lng only feed the coordinate readout on the map (cosmetic).
  stops: [
    { name: 'Mala',        at: 0,    label: [-14, 34],  anchor: 'start', lat: 10.5910, lng: 76.2740 },
    { name: 'Mala Pond',   at: 0.34, label: [0, -64],  anchor: 'middle', lat: 10.5722, lng: 76.2803 },
    { name: 'Ashtamshila', at: 0.66, label: [0, -62],  anchor: 'middle', lat: 10.5460, lng: 76.2931 },
    { name: 'SCET',        at: 1,    label: [0, -64],  anchor: 'middle',   lat: 10.5218, lng: 76.3062 },
  ],

  // Dashboard clock: starts at this time and runs 60x (one real second ≈ one minute)
  clockStart: '07:40',
  clockRate: 60,

  // Motion timing (seconds)
  legDuration: 1.6,        // bus travel between two stops
  stopDwell: 0.45,         // pause after each stop is reached
};

/* ---------------------------------------------------------------------
   Small utilities
   --------------------------------------------------------------------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const SVG_NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => {
  const el = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
};
const pad = n => String(n).padStart(2, '0');

/** Wrap each character of an element's text in <span class="ch"> for staggered reveals. */
function splitChars(el) {
  const nodes = [...el.childNodes];
  el.textContent = '';
  nodes.forEach(node => {
    if (node.nodeType === 3) {
      [...node.textContent].forEach(c => {
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = c === ' ' ? ' ' : c;
        el.appendChild(s);
      });
    } else el.appendChild(node);
  });
  return $$('.ch', el);
}

/* ---------------------------------------------------------------------
   ROAD — a perspective-projected SVG road (cheap to render, converges
   correctly to a vanishing point). Rebuilt on resize, scrolled by GSAP.
   --------------------------------------------------------------------- */
const road = {
  svg: null, dashes: [], phase: 0,
  HORIZON: 0.46,   // vanishing point height (fraction of viewport)
  DASH_LEN: 0.9, DASH_GAP: 1.6, DASH_COUNT: 26,

  build() {
    const wrap = $('.road-wrap');
    this.svg = svgEl('svg', { class: 'road-svg' });
    const defs = svgEl('defs');
    defs.innerHTML = `
      <linearGradient id="gTarmac" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#141b20"/><stop offset=".55" stop-color="#0b1013"/><stop offset="1" stop-color="#05080a"/>
      </linearGradient>
      <radialGradient id="gPool" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#bfeeff" stop-opacity=".26"/><stop offset=".5" stop-color="#5fd8ff" stop-opacity=".09"/><stop offset="1" stop-color="#5fd8ff" stop-opacity="0"/>
      </radialGradient>`;
    this.svg.appendChild(defs);
    this.tarmac = svgEl('polygon', { class: 'tarmac' });
    this.edgeL  = svgEl('polygon', { class: 'edge' });
    this.edgeR  = svgEl('polygon', { class: 'edge' });
    this.pool   = svgEl('ellipse', { class: 'pool', fill: 'url(#gPool)' });
    const g = svgEl('g');
    for (let i = 0; i < this.DASH_COUNT; i++) { const d = svgEl('polygon', { class: 'dash' }); this.dashes.push(d); g.appendChild(d); }
    [this.tarmac, this.pool, g, this.edgeL, this.edgeR].forEach(n => this.svg.appendChild(n));
    wrap.appendChild(this.svg);
    this.layout();
    window.addEventListener('resize', () => this.layout());
  },

  /** Project ground depth Z (1 = nearest) to screen y; half-width scales by 1/Z. */
  layout() {
    const W = innerWidth, H = innerHeight;
    this.W = W; this.H = H;
    this.cx = W / 2; this.hy = H * this.HORIZON; this.K = H * 1.06 - this.hy; this.HW = W * 0.64;
    this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const y = Z => this.hy + this.K / Z, x = (X, Z) => this.cx + X / Z;
    const far = 90;
    this.tarmac.setAttribute('points', `${x(-this.HW, 1)},${y(1)} ${x(this.HW, 1)},${y(1)} ${x(this.HW, far)},${y(far)} ${x(-this.HW, far)},${y(far)}`);
    const edge = (el, sign) => {
      const X = sign * this.HW * 0.9, w = W * 0.004;
      el.setAttribute('points', `${x(X - w, 1)},${y(1)} ${x(X + w, 1)},${y(1)} ${x(X + w, far)},${y(far)} ${x(X - w, far)},${y(far)}`);
      el.setAttribute('fill', '#b7d9e6');
    };
    edge(this.edgeL, -1); edge(this.edgeR, 1);
    this.pool.setAttribute('cx', this.cx); this.pool.setAttribute('cy', H * 0.97);
    this.pool.setAttribute('rx', W * 0.44); this.pool.setAttribute('ry', H * 0.2);
    this.scroll(this.phase);
  },

  /** Place the centre-line dashes for a given phase (dashes recede as phase grows). */
  scroll(phase) {
    this.phase = phase;
    const period = this.DASH_LEN + this.DASH_GAP, w = this.W * 0.007;
    const y = Z => this.hy + this.K / Z, x = (X, Z) => this.cx + X / Z;
    this.dashes.forEach((d, i) => {
      let Z1 = 0.6 + ((i * period + phase) % (period * this.DASH_COUNT));
      const Z2 = Z1 + this.DASH_LEN;
      d.setAttribute('fill', '#e6f6fb');
      d.setAttribute('points', `${x(-w, Z1)},${y(Z1)} ${x(w, Z1)},${y(Z1)} ${x(w, Z2)},${y(Z2)} ${x(-w, Z2)},${y(Z2)}`);
      d.setAttribute('opacity', Math.min(0.7, 0.7 * (1 - Z1 / 60)));
    });
  },
};

/* ---------------------------------------------------------------------
   DUST — faint particles drifting through the headlight beams (canvas)
   --------------------------------------------------------------------- */
const dust = {
  level: 0, parts: [],
  init() {
    this.c = $('#dust'); this.ctx = this.c.getContext('2d');
    const fit = () => { this.c.width = innerWidth; this.c.height = innerHeight; };
    fit(); window.addEventListener('resize', fit);
    for (let i = 0; i < 70; i++) this.parts.push(this.spawn(true));
    gsap.ticker.add(() => this.draw());
  },
  spawn(anywhere) {
    return { x: innerWidth * (0.2 + Math.random() * 0.6), y: innerHeight * (anywhere ? 0.55 + Math.random() * 0.45 : 1.02),
      r: 0.5 + Math.random() * 1.3, vx: (Math.random() - 0.5) * 0.12, vy: -(0.08 + Math.random() * 0.22),
      a: 0.15 + Math.random() * 0.45, t: Math.random() * Math.PI * 2 };
  },
  draw() {
    const { ctx, c } = this;
    ctx.clearRect(0, 0, c.width, c.height);
    if (this.level < 0.01) return;
    for (const p of this.parts) {
      p.x += p.vx; p.y += p.vy; p.t += 0.02;
      if (p.y < innerHeight * 0.5) Object.assign(p, this.spawn(false));
      const fade = Math.min(1, (p.y - innerHeight * 0.5) / (innerHeight * 0.15));
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fillStyle = `rgba(205,240,255,${p.a * fade * this.level * (0.6 + 0.4 * Math.sin(p.t))})`;
      ctx.fill();
    }
  },
};

/* ---------------------------------------------------------------------
   AUDIO — layered cinematic sound design, synthesized with Web Audio.
   Any cue can be swapped for a real file via CONFIG.sounds. Starts only
   after the gate click (browser autoplay rules).
   --------------------------------------------------------------------- */
const audio = {
  ctx: null, muted: false, buffers: {},

  init() {
    if (!CONFIG.audio || this.ctx) return;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    const c = this.ctx;
    // master → soft limiter → speakers
    this.master = c.createGain(); this.master.gain.value = CONFIG.audioVolume;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 18; comp.ratio.value = 6; comp.attack.value = 0.004; comp.release.value = 0.25;
    this.master.connect(comp); comp.connect(c.destination);
    // reverb send (generated impulse response — a large, dark hall)
    this.verb = c.createConvolver(); this.verb.buffer = this.impulse(3.2, 2.6);
    this.verbGain = c.createGain(); this.verbGain.gain.value = 0.32;
    this.verb.connect(this.verbGain); this.verbGain.connect(this.master);
    // pre-decode any real files
    Object.entries(CONFIG.sounds).forEach(([k, url]) => { if (url) fetch(url).then(r => r.arrayBuffer()).then(b => c.decodeAudioData(b)).then(buf => { this.buffers[k] = buf; }).catch(() => {}); });
    this.ambience();
  },

  /* ---- building blocks ---- */
  impulse(seconds, decay) {
    const c = this.ctx, len = c.sampleRate * seconds, buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return buf;
  },
  noiseBuffer(seconds) {
    const c = this.ctx, buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate), d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; d[i] = (last + 0.02 * w) / 1.02; last = d[i]; d[i] *= 3.5; } // brown-ish noise
    return buf;
  },
  /** ADSR-ish gain node: attack → peak, then exponential decay to silence at `end`. */
  env(peak, attack, end, t = this.ctx.currentTime) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + end);
    return g;
  },
  out(node, wet = 0.3) { node.connect(this.master); if (wet > 0) { const s = this.ctx.createGain(); s.gain.value = wet; node.connect(s); s.connect(this.verb); } },
  /** Play a real file if CONFIG.sounds[key] was provided; returns true when it did. */
  file(key, gain = 1, wet = 0.2) {
    const buf = this.buffers[key]; if (!buf) return false;
    const src = this.ctx.createBufferSource(), g = this.ctx.createGain(); src.buffer = buf; g.gain.value = gain; src.connect(g); this.out(g, wet); src.start(); return true;
  },
  ok() { return this.ctx && !this.muted; },

  /* ---- cues ---- */
  /** Continuous bed: sub drone + engine-idle rumble, breathing slowly. */
  ambience() {
    const c = this.ctx;
    this.bed = c.createGain(); this.bed.gain.value = 0; this.bed.connect(this.master);
    if (this.file('ambience', 1, 0)) { /* file path: still fade in the bed below for glue */ }
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 160; lp.Q.value = 0.7; lp.connect(this.bed);
    [[42, 0.7], [84, 0.22], [126, 0.06]].forEach(([f, g]) => { const o = c.createOscillator(), gn = c.createGain(); o.frequency.value = f; gn.gain.value = g; o.connect(gn); gn.connect(lp); o.start(); });
    const rumble = c.createBufferSource(), rl = c.createBiquadFilter(), rg = c.createGain();
    rumble.buffer = this.noiseBuffer(4); rumble.loop = true; rl.type = 'lowpass'; rl.frequency.value = 110; rg.gain.value = 0.35;
    rumble.connect(rl); rl.connect(rg); rg.connect(this.bed); rumble.start();
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.09; lg.gain.value = 45; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
    this.bed.gain.linearRampToValueAtTime(0.11, c.currentTime + 4);
  },
  /** Electrical charge that builds ~0.9 s before the lamps strike. */
  charge() {
    if (!this.ok() || this.file('ignition')) return;
    const c = this.ctx, t = c.currentTime, o = c.createOscillator(), f = c.createBiquadFilter(), g = this.env(0.09, 0.8, 1.05, t);
    o.type = 'sawtooth'; o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(520, t + 0.95);
    f.type = 'lowpass'; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(3200, t + 0.95); f.Q.value = 4;
    o.connect(f); f.connect(g); this.out(g, 0.5); o.start(t); o.stop(t + 1.1);
  },
  /** Headlight strike: sub impact + bright noise burst + a metallic ring. */
  ignite() {
    if (!this.ok() || this.buffers.ignition) return;
    const c = this.ctx, t = c.currentTime;
    const sub = c.createOscillator(), sg = this.env(0.9, 0.01, 1.4, t); sub.frequency.setValueAtTime(90, t); sub.frequency.exponentialRampToValueAtTime(32, t + 1.2); sub.connect(sg); this.out(sg, 0.15); sub.start(t); sub.stop(t + 1.5);
    const n = c.createBufferSource(), nf = c.createBiquadFilter(), ng = this.env(0.35, 0.005, 0.9, t); n.buffer = this.noiseBuffer(1); nf.type = 'highpass'; nf.frequency.value = 900; n.connect(nf); nf.connect(ng); this.out(ng, 0.6); n.start(t);
    [1240, 1860].forEach((fr, i) => { const o = c.createOscillator(), g = this.env(0.03, 0.01, 1.6 + i * 0.4, t); o.frequency.value = fr; o.connect(g); this.out(g, 0.7); o.start(t); o.stop(t + 2.2); });
  },
  /** Bus rides into camera: engine rev climbing under a swelling air rush (D seconds). */
  engine(D = 4.8) {
    if (!this.ok() || this.file('whoosh', 1, 0.3)) return;
    const c = this.ctx, t = c.currentTime;
    const f = c.createBiquadFilter(), g = this.env(0.22, D * 0.92, D + 0.6, t);
    f.type = 'lowpass'; f.frequency.setValueAtTime(140, t); f.frequency.exponentialRampToValueAtTime(1400, t + D);
    [[46, 'sawtooth', 0.9], [92, 'sawtooth', 0.35], [138, 'square', 0.12]].forEach(([fr, type, gn]) => {
      const o = c.createOscillator(), og = c.createGain(); o.type = type; og.gain.value = gn;
      o.frequency.setValueAtTime(fr, t); o.frequency.exponentialRampToValueAtTime(fr * 2.6, t + D);
      o.connect(og); og.connect(f); o.start(t); o.stop(t + D + 0.7);
    });
    f.connect(g); this.out(g, 0.35);
    const n = c.createBufferSource(), nf = c.createBiquadFilter(), ng = this.env(0.25, D * 0.9, D + 0.5, t);
    n.buffer = this.noiseBuffer(D + 1); nf.type = 'bandpass'; nf.Q.value = 0.7; nf.frequency.setValueAtTime(200, t); nf.frequency.exponentialRampToValueAtTime(2400, t + D);
    n.connect(nf); nf.connect(ng); this.out(ng, 0.5); n.start(t);
  },
  /** Old diesel bus travelling between stops for D seconds: knocking idle that revs up, cruises, settles. */
  busEngine(D) {
    if (!this.ok() || this.file('engine', 0.5, 0.2)) return;
    const c = this.ctx, t = c.currentTime, half = D * 0.5;
    // overall envelope + a dull, distant tone
    const out = c.createGain(); out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(0.16, t + 0.3); out.gain.setValueAtTime(0.16, t + D - 0.35); out.gain.exponentialRampToValueAtTime(0.0001, t + D + 0.05);
    const tone = c.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 520; tone.Q.value = 0.8; tone.connect(out); this.out(out, 0.25);
    // rev curve: idle → cruise → idle (matches the marker's speed curve)
    const rev = (node, lo, hi) => { node.setValueAtTime(lo, t); node.exponentialRampToValueAtTime(hi, t + half); node.exponentialRampToValueAtTime(lo, t + D); };
    // cylinder "chug": a low sawtooth chopped by a firing-rate LFO
    const chop = c.createGain(); chop.gain.value = 0.5; chop.connect(tone);
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.type = 'square'; rev(lfo.frequency, 9, 26); lg.gain.value = 0.5; lfo.connect(lg); lg.connect(chop.gain); lfo.start(t); lfo.stop(t + D + 0.1);
    [[1, 'sawtooth', 0.55], [2, 'sawtooth', 0.25], [3.02, 'triangle', 0.15]].forEach(([mul, type, gn]) => {
      const o = c.createOscillator(), g = c.createGain(); o.type = type; rev(o.frequency, 34 * mul, 62 * mul); g.gain.value = gn; o.connect(g); g.connect(chop); o.start(t); o.stop(t + D + 0.1);
    });
    // body rumble + a little mechanical rattle riding on the same chop
    const n = c.createBufferSource(), nf = c.createBiquadFilter(), ng = c.createGain(); n.buffer = this.noiseBuffer(D + 1); nf.type = 'lowpass'; rev(nf.frequency, 160, 300); ng.gain.value = 0.7; n.connect(nf); nf.connect(ng); ng.connect(chop); n.start(t); n.stop(t + D + 0.1);
    const r = c.createBufferSource(), rf = c.createBiquadFilter(), rg = c.createGain(); r.buffer = this.noiseBuffer(D + 1); rf.type = 'bandpass'; rf.frequency.value = 1100; rf.Q.value = 3; rg.gain.value = 0.05; r.connect(rf); rf.connect(rg); rg.connect(chop); r.start(t); r.stop(t + D + 0.1);
  },
  /** Bus rolls: slow air movement, low band sweeping upward. */
  whoosh() {
    if (!this.ok() || this.file('whoosh', 0.8)) return;
    const c = this.ctx, t = c.currentTime, n = c.createBufferSource(), f = c.createBiquadFilter(), g = this.env(0.18, 1.1, 2.6, t);
    n.buffer = this.noiseBuffer(3); f.type = 'bandpass'; f.Q.value = 0.9; f.frequency.setValueAtTime(180, t); f.frequency.exponentialRampToValueAtTime(1400, t + 2.4);
    n.connect(f); f.connect(g); this.out(g, 0.4); n.start(t);
  },
  /** GPS lock: two-note ping with a delayed echo in the hall. */
  lock() {
    if (!this.ok() || this.file('gps', 0.9, 0.5)) return;
    const c = this.ctx, t = c.currentTime;
    [[880, 0], [1320, 0.16]].forEach(([fr, d]) => { const o = c.createOscillator(), g = this.env(0.07, 0.01, 1.4, t + d); o.frequency.value = fr; o.connect(g); this.out(g, 0.8); o.start(t + d); o.stop(t + d + 1.5); });
  },
  /** Road → dashboard: data sweep + soft chord bloom. */
  transition() {
    if (!this.ok() || this.file('transition', 0.9, 0.5)) return;
    const c = this.ctx, t = c.currentTime, n = c.createBufferSource(), f = c.createBiquadFilter(), g = this.env(0.12, 0.6, 1.9, t);
    n.buffer = this.noiseBuffer(2); f.type = 'bandpass'; f.Q.value = 2; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(5000, t + 1.6); n.connect(f); f.connect(g); this.out(g, 0.6); n.start(t);
    this.pad([220, 277.18, 329.63, 440], 0.035, 0.9, 3.2, t + 0.5);
  },
  /** Stop reached: small confirmation tick. */
  stopTick() {
    if (!this.ok() || this.file('stop', 0.9, 0.4)) return;
    const c = this.ctx, t = c.currentTime;
    [[1568, 0], [2093, 0.07]].forEach(([fr, d]) => { const o = c.createOscillator(), g = this.env(0.045, 0.005, 0.5, t + d); o.type = 'triangle'; o.frequency.value = fr; o.connect(g); this.out(g, 0.5); o.start(t + d); o.stop(t + d + 0.6); });
  },
  /** Destination: rising three-note resolve with a long tail. */
  success() {
    if (!this.ok() || this.file('arrive', 0.9, 0.6)) return;
    const c = this.ctx, t = c.currentTime;
    [[523.25, 0], [659.25, 0.14], [783.99, 0.28], [1046.5, 0.42]].forEach(([fr, d]) => { const o = c.createOscillator(), g = this.env(0.06, 0.02, 2.4, t + d); o.frequency.value = fr; o.connect(g); this.out(g, 0.8); o.start(t + d); o.stop(t + d + 2.6); });
    this.pad([261.63, 329.63, 392, 523.25], 0.03, 1.2, 4.5, t + 0.3);
  },
  /** Title build-up: 2.6 s riser (noise + pitch sweep, filter opening). */
  riser() {
    if (!this.ok() || this.file('riser', 0.9, 0.4)) return;
    const c = this.ctx, t = c.currentTime, D = 2.6;
    const n = c.createBufferSource(), f = c.createBiquadFilter(), g = this.env(0.22, D * 0.9, D + 0.1, t);
    n.buffer = this.noiseBuffer(3); f.type = 'highpass'; f.frequency.setValueAtTime(200, t); f.frequency.exponentialRampToValueAtTime(3000, t + D); n.connect(f); f.connect(g); this.out(g, 0.5); n.start(t);
    const o = c.createOscillator(), og = this.env(0.06, D * 0.9, D + 0.1, t); o.type = 'sawtooth'; o.frequency.setValueAtTime(55, t); o.frequency.exponentialRampToValueAtTime(440, t + D); o.connect(og); this.out(og, 0.4); o.start(t); o.stop(t + D + 0.2);
  },
  /** Title impact: cinematic boom with a warm pad blooming underneath. */
  boom() {
    if (!this.ok() || this.file('boom', 1, 0.5)) return;
    const c = this.ctx, t = c.currentTime;
    const sub = c.createOscillator(), sg = this.env(1.0, 0.012, 2.6, t); sub.frequency.setValueAtTime(110, t); sub.frequency.exponentialRampToValueAtTime(28, t + 1.6); sub.connect(sg); this.out(sg, 0.25); sub.start(t); sub.stop(t + 2.8);
    const n = c.createBufferSource(), nf = c.createBiquadFilter(), ng = this.env(0.3, 0.01, 1.2, t); n.buffer = this.noiseBuffer(1.5); nf.type = 'lowpass'; nf.frequency.value = 700; n.connect(nf); nf.connect(ng); this.out(ng, 0.7); n.start(t);
    this.pad([130.81, 196, 261.63, 329.63, 392], 0.05, 2.5, 9, t + 0.4);
  },
  /** Detuned-saw pad through a slowly opening low-pass. */
  pad(freqs, gain, attack, length, t) {
    const c = this.ctx, f = c.createBiquadFilter(), g = this.env(gain, attack, length, t);
    f.type = 'lowpass'; f.frequency.setValueAtTime(300, t); f.frequency.linearRampToValueAtTime(1800, t + attack); f.frequency.linearRampToValueAtTime(400, t + length);
    freqs.forEach(fr => [-4, 4].forEach(det => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.detune.value = det; o.connect(f); o.start(t); o.stop(t + length + 0.1); }));
    f.connect(g); this.out(g, 0.8);
  },
  fadeOut() { if (this.ctx) this.master.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 2); },
  // aliases kept for older helper names
  chime(f) { f > 1500 ? this.lock() : this.stopTick(); },
};

/* ---------------------------------------------------------------------
   MAP — place stops along the SVG route, build geofences + panel rows
   --------------------------------------------------------------------- */
const map = {
  nodes: [], labels: [], fences: [], rows: [], pts: [],
  build() {
    this.path = $('#route-path'); this.len = this.path.getTotalLength();
    const stopsG = $('#stops'), fenceG = $('#geofences'), list = $('#stop-list');
    CONFIG.stops.forEach((s, i) => {
      const p = this.path.getPointAtLength(this.len * s.at); this.pts.push(p);
      // map node
      const g = svgEl('g', { class: 'stop-node', transform: `translate(${p.x} ${p.y})` });
      g.appendChild(svgEl('circle', { class: 'bg', r: 9 }));
      g.appendChild(svgEl('circle', { class: 'ring', r: 9 }));
      g.appendChild(svgEl('circle', { class: 'core', r: 3.5 }));
      g.appendChild(svgEl('path', { class: 'tick', d: 'M-4 0.5l3 3 5.5-6' }));
      stopsG.appendChild(g); this.nodes.push(g);
      // label
      const t = svgEl('text', { class: 'stop-label', x: p.x + s.label[0], y: p.y + s.label[1], 'text-anchor': s.anchor });
      t.textContent = s.name.toUpperCase(); stopsG.appendChild(t); this.labels.push(t);
      // geofence
      const f = svgEl('circle', { class: 'geofence', cx: p.x, cy: p.y, r: 44 }); fenceG.appendChild(f); this.fences.push(f);
      // panel row
      const li = document.createElement('li'); li.className = 'stop-row';
      li.innerHTML = `<div class="stop-node-ui"><i></i><svg viewBox="0 0 12 12"><path d="M2.5 6.5l2.5 2.5 4.5-5.5" fill="none" stroke="#052016" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div><div class="stop-name">${s.name}</div><div class="stop-sub">UPCOMING</div></div>`;
      list.appendChild(li); this.rows.push(li);
    });
    gsap.set('#route-path', { strokeDasharray: this.len, strokeDashoffset: this.len });
    gsap.set('#route-base', { strokeDasharray: this.len, strokeDashoffset: this.len });
    gsap.set('#marker', { svgOrigin: '0 0' });
    gsap.set(this.rows, { x: -8 });
  },
  /** Expanding ring from a stop — used for detections and the final destination pulse. */
  pulseRing(i, { r = 60, dur = 1.4, width = 1.5 } = {}) {
    const p = this.pts[i], c = svgEl('circle', { class: 'pulse', cx: p.x, cy: p.y, r: 8, 'stroke-width': width });
    $('#geofences').appendChild(c);
    return gsap.to(c, { attr: { r }, opacity: 0, duration: dur, ease: 'power2.out', onComplete: () => c.remove() });
  },
};

/* ---------------------------------------------------------------------
   Dashboard state: simulated clock, coordinates, speed, ETA
   --------------------------------------------------------------------- */
const dash = {
  sim: 0, running: false,
  init() {
    const [h, m] = CONFIG.clockStart.split(':').map(Number); this.sim = h * 3600 + m * 60;
    gsap.ticker.add((t, dt) => { if (this.running) { this.sim += (dt / 1000) * CONFIG.clockRate; this.render(); } });
    this.render();
  },
  time() { const s = Math.floor(this.sim) % 86400; return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}`; },
  render() { $('#dash-clock').textContent = this.time(); },
  coords(a, b, p) {
    const lat = a.lat + (b.lat - a.lat) * p, lng = a.lng + (b.lng - a.lng) * p;
    $('#map-coords').textContent = `${lat.toFixed(4)}° N · ${lng.toFixed(4)}° E`;
  },
};

/* =====================================================================
   HELPER TIMELINES (each returns a gsap.timeline to add to the master)
   ===================================================================== */

/** Scene 2 — the ignition moment: flicker, flash, bloom, streak, beams, road reveal. */
function revealHeadlights() {
  const t = gsap.timeline();
  t.call(() => audio.ignite(), null, 0)
   // realistic flicker before the lamps settle
   .to('.lamp-on', { opacity: 0.55, duration: 0.06 }, 0)
   .to('.lamp-on', { opacity: 0.15, duration: 0.08 }, 0.06)
   .to('.lamp-on', { opacity: 1, duration: 0.22, ease: 'power2.out' }, 0.14)
   .set('.lamp-lens', { attr: { fill: 'url(#gLampOn)' } }, 0.14)
   .to('.lamp-drl', { opacity: 0.95, duration: 0.4 }, 0.14)
   // flash frame + bloom + anamorphic streak
   .to('#flash', { opacity: 0.45, duration: 0.12, ease: 'power1.out' }, 0.14)
   .to('#flash', { opacity: 0, duration: 1.1, ease: 'power2.out' }, 0.26)
   .to('.lamp .bloom', { opacity: 1, duration: 0.5, ease: 'expo.out' }, 0.14)
   .to('.lamp .streak', { scaleX: 1, opacity: 1, duration: 0.7, ease: 'expo.out' }, 0.14)
   .to('.lamp .streak', { opacity: 0.5, duration: 1.2 }, 0.84)
   // light spreads: beams, road, reflections, haze, bus body brightens
   .to('.lamp .beam', { opacity: 1, duration: 1.3, ease: 'power2.out' }, 0.3)
   .to('.road-svg', { opacity: 1, duration: 1.6, ease: 'power2.out' }, 0.3)
   .to('.road-svg .pool', { opacity: 1, duration: 1.4, ease: 'power2.out' }, 0.5)
   .to('.reflect', { opacity: 1, duration: 1.4, ease: 'power2.out' }, 0.5)
   .to('.horizon', { opacity: 1, duration: 2, ease: 'power2.out' }, 0.5)
   .to('.bus-art', { filter: 'brightness(1) saturate(1)', duration: 1.1, ease: 'power2.out' }, 0.3)
   .to('.bus-sign', { opacity: 1, duration: 0.8 }, 0.5)
   .to(dust, { level: 1, duration: 1.5 }, 0.5);
  return t;
}

/** Scene 3 — system initialization copy. */
function initCopy() {
  const chars = splitChars($('#init-title')); // spans inside the title (dots stay as-is)
  const t = gsap.timeline();
  t.set('#init', { opacity: 1 })
   .to('#brand', { opacity: 1, duration: 0.8 }, 0)
   .from('#init-eyebrow', { opacity: 0, y: 8, duration: 0.7, ease: 'power3.out' })
   .to(chars, { opacity: 1, y: 0, duration: 0.5, stagger: 0.022, ease: 'power3.out' }, '<0.15')
   .to('#init-bar', { scaleX: 1, duration: 1.7, ease: 'power2.inOut' }, '<0.2')
   .to('#init', { opacity: 0, y: -10, duration: 0.5, ease: 'power2.in' }, '+=0.25');
  return t;
}

/** Scene 4a — the bus rides into the camera: accelerating push-in, growing glare, rumble, whiteout. */
function rideIn(RIDE) {
  const t = gsap.timeline();
  t.to(road, { phase: 30, duration: RIDE, ease: 'power2.in', onUpdate: () => road.scroll(road.phase) }, 0)
   .to('#bus', { scale: 2.6, y: '26vh', duration: RIDE, ease: 'power2.in' }, 0)
   .to('#cine-still', { scale: 3.0, duration: RIDE, ease: 'power2.in' }, 0)
   .to('#cine-still', { filter: 'brightness(1.5)', duration: RIDE * 0.45, ease: 'power2.in' }, RIDE * 0.55)
   .to('#cine', { y: 3, duration: 0.11, yoyo: true, repeat: 35, ease: 'sine.inOut' }, RIDE * 0.35)
   .to('.lamp .bloom', { scale: 2.2, duration: RIDE, ease: 'power2.in' }, 0)
   .to('#whiteout', { opacity: 1, duration: 0.9, ease: 'power3.in' }, RIDE - 0.8)
   .call(() => audio.engine(RIDE), null, 0.05);
  return t;
}

/** Scene 4b — GPS lock with three expanding rings (plays over the ride). */
function driveAndGps() {
  const t = gsap.timeline();
  // GPS node
  t.to('#gps', { opacity: 1, duration: 0.5 }, 0.3)
   .from('.gps-sat', { y: -18, opacity: 0, duration: 0.7, ease: 'power3.out' }, 0.3)
   .to('.gps-link', { scaleY: 1, duration: 0.5, ease: 'power2.out' }, 0.8)
   .fromTo('.gps-rings i', { opacity: 0.85, scale: 0.3 }, { opacity: 0, scale: 2.4, duration: 1.6, ease: 'power2.out', stagger: 0.5, repeat: 2, repeatDelay: 0.2, immediateRender: false }, 1.0)
   .call(() => audio.lock(), null, 1.3)
   // status pill
   .fromTo('#gps-pill', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 1.4)
   .to('#gps-pill', { boxShadow: '0 10px 40px rgba(0,0,0,.4), 0 0 30px rgba(95,216,255,.18)', duration: 0.6, yoyo: true, repeat: 3 }, 1.7);
  return t;
}

/** Scene 5 — the physical road becomes the digital route / dashboard. */
function transitionToMap() {
  const t = gsap.timeline();
  t.call(() => audio.transition(), null, 0)
   .to('#gps-pill', { opacity: 0, y: -8, duration: 0.3 }, 0)
   .to('#gps', { opacity: 0, duration: 0.3 }, 0)
   .to(dust, { level: 0, duration: 0.4 }, 0)
   .add(cine.on
     ? gsap.timeline()   // clip → dashboard: the headlamps flash full-beam in an instant, then the white clears fast
         .set('#lampflash', { opacity: 1 }, 0)
         .fromTo('.lampflash i', { scale: 0.08 }, { scale: 9, duration: 0.14, ease: 'expo.out', immediateRender: false }, 0)
         .set('#scene-map', { autoAlpha: 1 }, 0.08)
         .set('#scene-road', { autoAlpha: 0 }, 0.1)
         .to('#lampflash', { opacity: 0, duration: 0.55, ease: 'power3.out' }, 0.16)
         .set('.lampflash i', { scale: 0.08 }, 0.8)
     : gsap.timeline()   // still/photo mode: the ride's whiteout resolves into the dashboard
         .set('#scene-road', { autoAlpha: 0 }, 0.15)
         .set('#scene-map', { autoAlpha: 1 }, 0.15)
         .to('#whiteout', { opacity: 0, duration: 1.4, ease: 'power2.out' }, 0.2), 0)
   .fromTo('#map-grid', { opacity: 0, rotateX: 55, scale: 1.4 }, { opacity: 0.5, rotateX: 0, scale: 1, duration: 1.8, ease: 'power3.out' }, 0.3)
   .fromTo('#dash', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.25)
   .fromTo(['#map', '#panel'], { y: 28, opacity: 0, filter: 'blur(6px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, stagger: 0.12, ease: 'power3.out' }, 0.3)
   .to('#brand', { opacity: 0, duration: 0.4 }, 0)
   .to('#watermark', { opacity: 1, duration: 0.8 }, 0.8)
   // route draws itself, then stops pop in
   .to('.route-halo', { opacity: 1, duration: 1.2 }, 1.0)
   .to('#route-base', { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 0.95)
   .fromTo(map.nodes, { scale: 0, transformOrigin: 'center', opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.16, ease: 'back.out(2)' }, 1.4)
   .to(map.labels, { opacity: 1, duration: 0.5, stagger: 0.16 }, 1.55)
   .to(map.rows, { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }, 1.5)
   // bus marker lands on the first stop
   .set('#marker', { motionPath: { path: '#route-path', start: 0, end: 0.001, autoRotate: true } }, 1.9)
   .fromTo('#marker', { opacity: 0, scale: 1.8 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }, 2.0)
   .call(() => { map.nodes[0].classList.add('active'); map.labels[0].classList.add('active'); updateTrackPanel(0, 'current', 'BOARDING'); dash.running = true; setToast('Departing Mala'); }, null, 2.1)
   .to('#toast', { opacity: 1, y: 0, duration: 0.4 }, 2.15);
  return t;
}

/** Panel row state: 'current' | 'done' | 'upcoming' with a sub-label. */
function updateTrackPanel(i, state, sub) {
  const row = map.rows[i]; if (!row) return;
  row.classList.remove('current', 'done'); if (state !== 'upcoming') row.classList.add(state);
  $('.stop-sub', row).textContent = sub;
  if (state === 'done') gsap.fromTo(row, { backgroundColor: 'rgba(95,227,177,.12)' }, { backgroundColor: 'rgba(95,227,177,0)', duration: 1.2, ease: 'power2.out' });
  if (state === 'current') gsap.fromTo(row, { x: 6 }, { x: 0, duration: 0.5, ease: 'power3.out' });
}
function setToast(text, ok = false) { $('#toast-text').textContent = text; $('#toast').classList.toggle('ok', ok); }
function setStatus(text) { $('#foot-status').textContent = text; $('#dash-status').textContent = text; }

/** Geofence appears around stop i as the bus approaches; pulses until detection. */
function activateStop(i) {
  const f = map.fences[i], t = gsap.timeline();
  t.fromTo(f, { attr: { r: 6 }, opacity: 0 }, { attr: { r: 44 }, opacity: 1, duration: 0.55, ease: 'power3.out' })
   .to(f, { attr: { r: 48 }, opacity: 0.6, duration: 0.7, yoyo: true, repeat: 3, ease: 'sine.inOut' });
  return t;
}

/** Bus enters the geofence of stop i: detection flash, node + row → done. */
function reachStop(i) {
  const f = map.fences[i], node = map.nodes[i], t = gsap.timeline();
  t.call(() => {
      audio.stopTick();
      node.classList.remove('active'); node.classList.add('done'); map.labels[i].classList.remove('active'); map.labels[i].classList.add('done');
      updateTrackPanel(i, 'done', `REACHED ${dash.time()}`);
      setToast(`Stop Reached · ${CONFIG.stops[i].name}`, true);
      map.pulseRing(i, { r: 70 });
      const pct = Math.round(CONFIG.stops[i].at * 100);
      $('#foot-pct').textContent = pct + '%';
    })
   .to(f, { attr: { r: 40 }, opacity: 1, duration: 0.18, ease: 'power2.out' }, 0)
   .to(f, { attr: { fill: 'rgba(95,227,177,.16)', stroke: 'rgba(120,235,190,.9)' }, duration: 0.2 }, 0)
   .to(f, { attr: { r: 64 }, opacity: 0, duration: 0.9, ease: 'power2.out' }, 0.2)
   .set(f, { attr: { fill: 'rgba(95,216,255,.06)', stroke: 'rgba(140,228,255,.75)' } })
   .fromTo(node, { scale: 1 }, { scale: 1.6, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out', transformOrigin: 'center' }, 0)
   .to('#foot-bar', { scaleX: CONFIG.stops[i].at, duration: 0.8, ease: 'power2.out' }, 0);
  return t;
}

/** One leg: bus marker + route progress move from stop i to stop i+1 in sync. */
function driveLeg(i) {
  const a = CONFIG.stops[i], b = CONFIG.stops[i + 1], D = CONFIG.legDuration, len = map.len;
  const state = { p: 0, v: 0 }, t = gsap.timeline();
  t.call(() => {
      if (i === 0) updateTrackPanel(0, 'done', `DEPARTED ${dash.time()}`);
      updateTrackPanel(i + 1, 'current', 'APPROACHING');
      map.nodes[i + 1].classList.add('active'); map.labels[i + 1].classList.add('active');
      $('#stat-next').textContent = b.name;
      setToast(`Approaching ${b.name}`);
      setStatus(i === 0 ? 'Departing Mala' : `En route to ${b.name}`);
      audio.busEngine(D);
    })
   .to('#marker', { motionPath: { path: '#route-path', start: a.at, end: b.at, autoRotate: true }, duration: D, ease: 'power2.inOut' }, 0)
   .to('#route-path', { strokeDashoffset: len * (1 - b.at), duration: D, ease: 'power2.inOut' }, 0)
   .to(state, { p: 1, duration: D, ease: 'power2.inOut', onUpdate: () => {
        dash.coords(a, b, state.p);
        $('#stat-eta').textContent = Math.max(0, Math.ceil((1 - state.p) * 3));
      } }, 0)
   .to(state, { v: 42, duration: D * 0.5, ease: 'power2.out', onUpdate: () => { $('#stat-speed').textContent = Math.round(state.v); } }, 0)
   .to(state, { v: 0, duration: D * 0.5, ease: 'power2.in', onUpdate: () => { $('#stat-speed').textContent = Math.round(state.v); } }, D * 0.5)
   .add(activateStop(i + 1), D * 0.5)
   .add(reachStop(i + 1), D)
  return t;
}

/** Scene 7 — destination reached overlay + final pulses. */
function arrivalSequence() {
  const last = CONFIG.stops.length - 1, ring = $('#arrive-ring'), tick = $('#arrive-tick');
  const rl = ring.getTotalLength(), tl_ = tick.getTotalLength(), t = gsap.timeline();
  gsap.set(ring, { strokeDasharray: rl, strokeDashoffset: rl }); gsap.set(tick, { strokeDasharray: tl_, strokeDashoffset: tl_ });
  t.call(() => { setStatus('Trip Completed Successfully ✓'); $('#stat-next').textContent = '—'; $('#stat-eta').textContent = '0'; $('#panel-link').textContent = 'COMPLETED'; dash.running = false; })
   .add(map.pulseRing(last, { r: 120, dur: 2.2, width: 1.2 }), 0)
   .add(map.pulseRing(last, { r: 120, dur: 2.2, width: 1.2 }), 0.5)
   .add(map.pulseRing(last, { r: 120, dur: 2.2, width: 1.2 }), 1.0)
   .to('#toast', { opacity: 0, duration: 0.3 }, 0)
   .to('#arrive', { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.2)
   .to(ring, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 0.3)
   .to(tick, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }, 0.9)
   .call(() => audio.success(), null, 0.95)
   .fromTo('.arrive-title', { opacity: 0, y: 10, letterSpacing: '.4em' }, { opacity: 1, y: 0, letterSpacing: '.22em', duration: 0.9, ease: 'power3.out' }, 1.0)
   .fromTo('.arrive-sub', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 1.35);
  return t;
}

/** Light sweep across the big title: each letter carries a slice of one continuous gradient. */
function sweepTitle(chars) {
  const parent = chars[0].parentElement, W = parent.getBoundingClientRect().width, pl = parent.getBoundingClientRect().left;
  const xs = chars.map(c => c.getBoundingClientRect().left - pl), state = { s: -3.4 * W };
  // one 6W-wide gradient (highlight band at its centre) shared by all letters; each letter shows its own slice
  chars.forEach(c => { c.classList.add('sweep'); c.style.backgroundSize = `${W * 6}px 100%`; });
  const place = () => chars.forEach((c, i) => { c.style.backgroundPosition = `${state.s - xs[i]}px 0`; });
  place();
  return gsap.to(state, { s: -1.6 * W, duration: 1.6, ease: 'power2.inOut', onUpdate: place });
}

/** Scene 8 — the bus returns as the hero, headlights flare, title card reveals. */
function finalTitle() {
  const chars = splitChars($('#title-main')), t = gsap.timeline();
  gsap.set(chars, { opacity: 0, y: 24 });
  t.to('#scene-map', { opacity: 0, filter: 'blur(8px)', duration: 0.9, ease: 'power2.inOut' })
   .set('#scene-map', { visibility: 'hidden' })
   .set('#scene-road', { visibility: 'visible', opacity: 0 }, 0.4)
   .set('#cine-still', { opacity: 1 }, 0.4)
   .fromTo('#scene-road', { opacity: 0, filter: 'blur(12px)', scale: 1.08 }, { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 1.6, ease: 'power2.out', immediateRender: false }, 0.4)
   .fromTo('#cine-still', { scale: 1.06, filter: 'brightness(1)' }, { scale: 1.14, duration: 3.6, ease: 'power2.out', immediateRender: false }, 0.4)
   .set('#cine', { y: 0 }, 0.4)
   .fromTo('#bus', { scale: 1, y: 0 }, { scale: CONFIG.busImage.src ? 1.06 : 1.18, y: CONFIG.busImage.src ? '10vh' : '15vh', duration: 3.4, ease: 'power2.out', immediateRender: false }, 0.4)
   .to('#cine-still', { filter: 'brightness(.35)', duration: 1.6, ease: 'power2.inOut' }, 2.2)
   .to(dust, { level: 0.7, duration: 1 }, 0.6)
   .call(() => audio.whoosh(), null, 0.9)
   .call(() => audio.riser(), null, 0.25)
   .call(() => audio.boom(), null, 2.85)
   // soft headlight flare
   .to('.lamp .streak', { opacity: 1, scaleX: 1.25, duration: 0.6, ease: 'power2.out' }, 1.2)
   .to('#flash', { opacity: 0.35, duration: 0.25 }, 1.25)
   .to('#flash', { opacity: 0, duration: 1.2, ease: 'power2.out' }, 1.5)
   .to('.lamp .streak', { opacity: 0.4, scaleX: 1, duration: 1.2 }, 1.8)
   // settle into a dim silhouette so the title owns the frame
   .to('.bus-art', { filter: 'brightness(.22) saturate(.8)', duration: 1.6, ease: 'power2.inOut' }, 2.2)
   .to('.bus-sign', { opacity: 0.1, duration: 1.2 }, 2.2)
   .to(['.lamp .beam', '.lamp .bloom', '.reflect', '.road-svg', '.horizon'], { opacity: 0.4, duration: 1.6, ease: 'power2.inOut' }, 2.2)
   .to(dust, { level: 0.25, duration: 1.6 }, 2.2)
   // title card
   .set('#title', { opacity: 1 }, 2.4)
   .to('#title-rule', { width: 180, duration: 0.9, ease: 'power3.inOut' }, 2.4)
   .fromTo('#title-kicker', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 2.7)
   .to(chars, { opacity: 1, y: 0, duration: 0.9, stagger: 0.045, ease: 'expo.out' }, 2.85)
   .add(sweepTitle(chars), 3.7)
   .to('#title-sub span', { opacity: 1, duration: 0.6, stagger: 0.18, ease: 'power2.out' }, 3.5)
   .to('#title-sub i', { opacity: 1, duration: 0.5, stagger: 0.18 }, 3.65)
   .fromTo('#title-badge', { opacity: 0, letterSpacing: '.9em', y: 6 }, { opacity: 1, letterSpacing: '.5em', y: 0, duration: 1.1, ease: 'power3.out' }, 4.1)
   .fromTo('#title-meta', { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 4.5)
   .fromTo('#enter-btn', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 4.9)
   .to('#brand', { opacity: 1, duration: 0.8 }, 0.8)
   .to('#brand', { opacity: 0, duration: 0.5 }, 2.4);
  return t;
}

/* =====================================================================
   MASTER TIMELINE — scene start times (seconds) are the labels below
   ===================================================================== */
let master;
function buildTimeline() {
  master = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' }, onComplete: onShowEnd });
  const T = { dark: 0, ignite: 3.0, ride: 4.5, init: 4.7, drive: 7.0, map: 9.6, track: null, arrive: null, final: null };
  cine.init(T);
  if (cine.on) T.map = cine.mapAt;   // dashboard takes over as the clip ends
  T.track = T.map + 2.8;
  // tracking scene length is derived from the stop count
  const trackLen = (CONFIG.stops.length - 1) * (CONFIG.legDuration + CONFIG.stopDwell);
  T.arrive = T.track + trackLen + 0.5;
  T.final = T.arrive + 3.3; cine.finalAt = T.final;

  master
    // SCENE 1 — darkness → silhouette (rim light first, then the dim body)
    .set('#scene-road', { autoAlpha: 1 })
    .call(() => { if (cine.on) cine.play(); }, null, Math.max(0.01, cine.startAt))
    .call(() => { if (cine.on) cine.slow(); }, null, cine.on ? cine.slowAt : 0.02)
    .call(() => { if (cine.on) cine.stop(); }, null, cine.on ? cine.mapAt : 0.03)
    .to('.atmos', { opacity: 1, duration: 3.5, ease: 'sine.inOut' }, T.dark)
    .to('.bus-rim', { opacity: 0.55, duration: 1.6, ease: 'power2.inOut', stagger: 0.3 }, T.dark + 0.6)
    .to('#bus-img', { filter: 'drop-shadow(0 0 3px rgba(190,225,255,.8)) drop-shadow(0 30px 30px rgba(0,0,0,.7))', duration: 1.6, ease: 'power2.inOut' }, T.dark + 0.6)
    .to('.bus-art', { opacity: 1, duration: 2.0, ease: 'power2.inOut' }, T.dark + 1.0)
    .to('.bus-rim', { opacity: 0, duration: 1.2 }, T.dark + 2.6)
    .to('#bus-img', { filter: 'drop-shadow(0 0 0px rgba(190,225,255,0)) drop-shadow(0 30px 30px rgba(0,0,0,.7))', duration: 1.4 }, T.dark + 2.6)
    .to('.bus-art', { filter: 'brightness(.5) saturate(.85)', duration: 0.8 }, T.dark + 2.3)
    // SCENE 2 — ignition (the electrical charge starts building just before)
    .call(() => audio.charge(), null, T.ignite - 0.9)
    .add(revealHeadlights(), T.ignite);
  if (!cine.on) master
    // SCENE 3 — system initialization (in video mode the clip carries this text itself)
    .add(initCopy(), T.init)
    // SCENE 4 — the bus rides into the camera, GPS lock on the way (the clip has its own version)
    .add(rideIn(T.map - T.ride + 0.05), T.ride)
    .add(driveAndGps(), T.drive);
  master
    // SCENE 5 — into the dashboard
    .add(transitionToMap(), T.map)
    // SCENE 6 — live tracking, stop by stop
    .add(trackingSequence(), T.track)
    // SCENE 7 — destination
    .add(arrivalSequence(), T.arrive)
    // SCENE 8 — hero return + title
    .add(finalTitle(), T.final)
    .to('#skip', { opacity: 0, duration: 0.4 }, T.final + 4.5);
}
function trackingSequence() {
  const t = gsap.timeline();
  const cadence = CONFIG.legDuration + CONFIG.stopDwell;
  for (let i = 0; i < CONFIG.stops.length - 1; i++) t.add(driveLeg(i), i * cadence);
  return t;
}

/* ---------------------------------------------------------------------
   End state, controls, boot
   --------------------------------------------------------------------- */
let finished = false;
function onShowEnd() {
  finished = true;
  if (!CONFIG.autoRedirect) return;
  let n = CONFIG.redirectDelay; const out = $('#title-redirect');
  const tick = () => { out.textContent = `ENTERING SYSTEM IN ${n}s`; if (n-- <= 0) enterSystem(); else setTimeout(tick, 1000); };
  tick();
}
function enterSystem() { audio.fadeOut(); location.href = CONFIG.redirectUrl; }
function skipToEnd() {
  // jump to the final card; callbacks fire so panel/map state stays consistent
  audio.muted = true; master.progress(0.999, false).pause(); audio.muted = false;
  gsap.globalTimeline.getChildren(true, true, false).forEach(tw => { if (tw !== master && !master.getChildren(true, true, true).includes(tw)) tw.progress(1); });
  master.play();
}
function start() {
  audio.init();
  gsap.to('#gate', { opacity: 0, duration: 1.1, ease: 'power2.inOut', onComplete: () => { $('#gate').remove(); } });
  master.play(0);
}

/** Video mode: the clip covers the stage; the still takes over once the clip is frozen. */
const cine = {
  on: false, startAt: 0, finalAt: 1e9,
  init(T) {
    const v = CONFIG.busVideo; if (!v.src) return;
    this.on = true; this.startAt = T.ignite - v.ignitionAt;         // clip starts so the strike lands on T.ignite
    this.slowAt = this.startAt + v.slowFrom;                          // master time when slow motion begins
    this.mapAt = this.slowAt + (v.endAt - v.slowFrom) / v.slowRate;   // master time when the clip is done
    $('#stage').classList.add('video-mode'); $('#cine').hidden = false;
    this.video = $('#cine-video'); this.still = $('#cine-still');
    this.video.src = v.src; this.video.poster = v.poster; this.still.src = v.still;
    gsap.set(this.still, { filter: 'brightness(1)', scale: 1 });   // explicit start values so the ride tweens interpolate correctly
    $('#scene-road').appendChild($('#gps'));                          // GPS node floats above the clip's bus
    [['.lampflash-l', v.flashL], ['.lampflash-r', v.flashR]].forEach(([sel, [x, y]]) => { const el = $(sel); el.style.setProperty('--x', x + '%'); el.style.setProperty('--y', y + '%'); });
  },
  play() { this.video.currentTime = 0; this.video.muted = false; this.video.playbackRate = 1; this.video.play().catch(() => {}); },
  slow() { this.video.playbackRate = CONFIG.busVideo.slowRate; },
  stop() { this.video.pause(); },
  /** Clip time for a master time (accounts for the slow-motion stretch). */
  clipTime(t) {
    const v = CONFIG.busVideo;
    if (t < this.startAt) return 0;
    if (t < this.slowAt) return t - this.startAt;
    return Math.min(v.endAt, v.slowFrom + (t - this.slowAt) * v.slowRate);
  },
  /** Debug seeking (?t=): put the clip/still into the state they'd have at master time t. */
  sync(t) {
    const v = CONFIG.busVideo; this.video.muted = true;
    this.video.currentTime = this.clipTime(t);
    gsap.set(this.still, { opacity: t >= this.finalAt ? 1 : 0 });
  },
};

/** Apply CONFIG.busImage: position lamps/beams/reflections; swap in the photo when it loads. */
function setupBus() {
  const b = CONFIG.busImage, place = () => {
    [['.lamp-l', b.lampL, b.beamRot[0]], ['.lamp-r', b.lampR, b.beamRot[1]]].forEach(([sel, [x, y], rot]) => {
      const el = $(sel); el.style.setProperty('--x', x + '%'); el.style.setProperty('--y', y + '%'); $('.beam', el).style.setProperty('--rot', rot + 'deg');
    });
    $('.reflect-l').style.left = `calc(50% + var(--bus-w) * ${(b.lampL[0] - 50) / 100 - 0.08})`;
    $('.reflect-r').style.left = `calc(50% + var(--bus-w) * ${(b.lampR[0] - 50) / 100 - 0.08})`;
    $('#bus').style.transformOrigin = `50% ${b.groundY}%`;
  };
  place();
  if (!b.src) return;
  document.documentElement.style.setProperty('--bus-w', b.width || 'min(64vw, 100vh)');
  gsap.set('#bus', { x: (b.offsetX || 0) + 'vw' });
  const img = $('#bus-img');
  img.onload = () => {
    $('#bus').style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`; $('#bus-svg').remove(); img.hidden = false;
    // soft ground-contact shadow under the photo
    const sh = document.createElement('div'); sh.className = 'bus-ground'; sh.style.top = (b.groundY - 3) + '%'; $('.bus-art').prepend(sh);
  };
  img.onerror = () => console.warn('Bus image not found, using the SVG bus:', b.src);
  img.src = b.src;
}

/** index.html?calibrate — click left lamp, right lamp, then the ground line; copy the printed CONFIG lines. */
function calibrate() {
  $('#gate').remove();
  gsap.set('#scene-road', { autoAlpha: 1 }); gsap.set('.bus-art', { opacity: 1, filter: 'none' }); gsap.set('.road-svg', { opacity: 1 });
  const out = document.createElement('pre'); out.className = 'calib'; out.textContent = 'CALIBRATE — click: ① left headlamp  ② right headlamp  ③ where the tyres touch the road'; document.body.appendChild(out);
  const pts = [], bus = $('#bus');
  bus.style.cursor = 'crosshair';
  bus.addEventListener('click', e => {
    const r = bus.getBoundingClientRect(), x = +((e.clientX - r.left) / r.width * 100).toFixed(1), y = +((e.clientY - r.top) / r.height * 100).toFixed(1);
    pts.push([x, y]);
    const dot = document.createElement('i'); dot.className = 'calib-dot'; dot.style.left = x + '%'; dot.style.top = y + '%'; bus.appendChild(dot);
    if (pts.length === 1) out.textContent = `lampL: [${x}, ${y}],   → now click the right headlamp`;
    if (pts.length === 2) out.textContent = `lampL: [${pts[0]}],  lampR: [${x}, ${y}],   → now click the ground line under the tyres`;
    if (pts.length === 3) {
      CONFIG.busImage.lampL = pts[0]; CONFIG.busImage.lampR = pts[1]; CONFIG.busImage.groundY = y; setupBus();
      gsap.set('.lamp-on', { opacity: 1 }); gsap.set('.lamp .bloom', { opacity: 1 }); gsap.set('.lamp .beam', { opacity: 1 }); gsap.set('.reflect', { opacity: 1 });
      out.textContent = `Paste into CONFIG.busImage:\n  lampL: [${pts[0]}],\n  lampR: [${pts[1]}],\n  groundY: ${y},`;
    }
  });
}

function boot() {
  gsap.registerPlugin(MotionPathPlugin); gsap.config({ nullTargetWarn: false });
  road.build(); dust.init(); map.build(); dash.init(); setupBus();
  if (new URLSearchParams(location.search).has('calibrate')) { calibrate(); return; }
  // initial transform states (GSAP owns transforms; CSS keeps layout only)
  gsap.set('#bus', { xPercent: -50 });
  gsap.set(['#init', '#gps-pill'], { xPercent: -50 });
  gsap.set('.lamp .streak', { xPercent: -50, yPercent: -50, scaleX: 0 });
  gsap.set('.gps-rings i', { scale: 0.2 });
  gsap.set('.gps-link', { xPercent: -50, scaleY: 0 });
  gsap.set(['#init-bar', '#foot-bar'], { scaleX: 0 });
  gsap.set('#toast', { y: 6 });
  buildTimeline();

  $('#enter-btn').addEventListener('click', enterSystem);
  $('#skip').addEventListener('click', skipToEnd);
  $('#gate-btn').addEventListener('click', start);
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') skipToEnd();
    if (e.key === 'Enter') { if ($('#gate')) start(); else if (finished) enterSystem(); }
  });

  // Debug / preview: open index.html?t=12.5 to freeze the show at 12.5 s
  const seek = new URLSearchParams(location.search).get('t');
  if (seek !== null) { $('#gate').remove(); master.seek(parseFloat(seek), false).pause(); if (cine.on) cine.sync(parseFloat(seek)); return; }
  if (!CONFIG.requireStart) { $('#gate').remove(); master.play(0); }
}

document.fonts.ready.then(boot);
