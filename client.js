import * as L from './logic.js';

const canvas = document.getElementById('game');
const ctx2d = canvas.getContext('2d');
const hud = document.getElementById('hud');
const muteBtn = document.getElementById('mute');
const card = document.getElementById('card');
const cardTitle = document.getElementById('card-title');
const cardSub = document.getElementById('card-sub');
const startBtn = document.getElementById('start');

const W = L.config.W;
const H = L.config.H;
const CROWD_Z = H - 1.6;

let running = false;
let state = null;
let ctx = null;
let tickAccum = 0;
let lastTime = 0;
let fps = 60;
let fpsAccum = 0;
let fpsFrames = 0;
let wantedLevel = 0;
let heldDx = 0;
let pointerActive = false;
let pointerDir = 0;
let keys = { left: false, right: false };
let muted = false;
let audioCtx = null;
let bgmTick = 0;
let lastEventId = 0;
let particles = [];
let popups = [];
let stars = 0;
let unlocked = 1;
let starsMap = {};

try {
  const u = localStorage.getItem('cc-unlocked');
  if (u) unlocked = Math.max(1, Math.min(10, parseInt(u, 10) || 1));
  const s = localStorage.getItem('cc-stars');
  if (s) starsMap = JSON.parse(s) || {};
} catch (e) { unlocked = 1; starsMap = {}; }

function saveProgress() {
  try {
    localStorage.setItem('cc-unlocked', String(unlocked));
    localStorage.setItem('cc-stars', JSON.stringify(starsMap));
  } catch (e) {}
}

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function makeCtx(tick, seed) {
  const rng = mulberry32(seed || 12345);
  return { tick: tick || 0, now: 0, random: rng };
}

function initGame(level) {
  wantedLevel = level;
  ctx = makeCtx(0, 999 + level * 7);
  state = L.setup(ctx, [{ id: 'player-1', level: level }]);
  running = true;
  tickAccum = 0;
  lastEventId = 0;
  particles = [];
  popups = [];
  bgmTick = 0;
  heldDx = 0;
  pointerActive = false;
  pointerDir = 0;
  hideCard();
}

function hideCard() {
  card.style.display = 'none';
}

function showCard(title, sub, btnLabel, btnAction) {
  card.style.display = 'flex';
  cardTitle.textContent = title;
  cardSub.innerHTML = sub;
  startBtn.textContent = btnLabel;
  startBtn.onclick = btnAction;
}

function showTitle() {
  running = false;
  let levelButtons = '';
  for (let i = 0; i < 10; i++) {
    const lv = i + 1;
    const locked = lv > unlocked;
    const st = starsMap[i] || 0;
    const starStr = st > 0 ? '★'.repeat(st) : '';
    levelButtons += `<button class="lvlbtn" data-lv="${i}" ${locked ? 'disabled' : ''} style="opacity:${locked ? 0.3 : 1}">${lv}${starStr ? '<br>' + starStr : ''}</button>`;
  }
  showCard(
    'CROWD CLASH',
    `Grow your crowd, dodge traps, crush the enemy!<br><div class="lvlrow">${levelButtons}</div>`,
    'Start ▶',
    () => initGame(wantedLevel)
  );
  card.querySelectorAll('.lvlbtn').forEach(btn => {
    btn.onclick = () => {
      const lv = parseInt(btn.dataset.lv, 10);
      if (lv < unlocked) initGame(lv);
    };
  });
}

function showWin() {
  running = false;
  const margin = state.clashStartCrowd || state.crowd;
  const enemy = state.clashStartEnemy || 1;
  const ratio = margin / enemy;
  stars = ratio >= 1.8 ? 3 : ratio >= 1.3 ? 2 : 1;
  const lv = state.level;
  if (stars > (starsMap[lv] || 0)) starsMap[lv] = stars;
  if (lv + 1 >= unlocked && lv + 1 < 10) unlocked = lv + 2;
  saveProgress();
  const isFinal = lv >= 9;
  showCard(
    'VICTORY!',
    `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}<br>Score: ${state.score}<br>Crowd: ${state.crowd}`,
    isFinal ? 'Play again' : 'Next Level ▶',
    () => initGame(isFinal ? 0 : lv + 1)
  );
  playWin();
}

function showLoss() {
  running = false;
  let reason = 'Crowd wiped out!';
  if (state.lossReason === 'idle') reason = 'You idled too long!';
  else if (state.lossReason === 'clash') reason = 'Clash defeat!';
  showCard(
    'DEFEAT',
    `${reason}<br>Score: ${state.score}<br>Crowd: ${state.crowd}`,
    'Try again',
    () => initGame(state.level)
  );
  playLoss();
}

// Audio
function ensureAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { audioCtx = null; }
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone(freq, type, dur, gain, slideTo) {
  if (muted || !audioCtx) return;
  try {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, audioCtx.currentTime);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, audioCtx.currentTime + dur);
    g.gain.setValueAtTime(gain, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + dur);
  } catch (e) {}
}

function playNoise(dur, gain, hp) {
  if (muted || !audioCtx) return;
  try {
    const bufSize = Math.floor(audioCtx.sampleRate * dur);
    const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(gain, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    let node = src;
    if (hp) {
      const f = audioCtx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = hp;
      node.connect(f);
      f.connect(g);
    } else {
      node.connect(g);
    }
    g.connect(audioCtx.destination);
    src.start();
  } catch (e) {}
}

function playGateGood(combo) {
  playTone(520 + combo * 30, 'triangle', 0.12, 0.08);
}
function playGateBad() {
  playTone(160, 'sawtooth', 0.2, 0.08, 80);
}
function playTrap() {
  playTone(110, 'sine', 0.25, 0.12, 60);
  playNoise(0.15, 0.1, 0);
}
function playBonus() {
  playTone(660, 'triangle', 0.08, 0.07);
  setTimeout(() => playTone(880, 'triangle', 0.08, 0.07), 60);
  setTimeout(() => playTone(1320, 'triangle', 0.1, 0.07), 120);
}
function playClashHit() {
  playNoise(0.06, 0.06, 0);
  playTone(150, 'sine', 0.08, 0.06);
}
function playWin() {
  const notes = [523, 659, 784, 1046];
  notes.forEach((n, i) => setTimeout(() => playTone(n, 'triangle', 0.2, 0.09), i * 120));
}
function playLoss() {
  playTone(320, 'sawtooth', 0.5, 0.09, 80);
}

function bgmStep() {
  if (muted || !audioCtx || !running) return;
  const pattern = [110, 130.81, 146.83, 164.81, 196];
  if (bgmTick % 8 === 0) {
    const n = pattern[(bgmTick / 8) % pattern.length | 0];
    playTone(n, 'square', 0.15, 0.03);
  }
  if (bgmTick % 4 === 0) {
    playNoise(0.012, 0.015, 8000);
  }
  bgmTick++;
}

// Input
canvas.addEventListener('pointerdown', e => {
  ensureAudio();
  pointerActive = true;
  updatePointer(e);
});
canvas.addEventListener('pointermove', e => {
  if (pointerActive) updatePointer(e);
});
canvas.addEventListener('pointerup', () => { pointerActive = false; pointerDir = 0; });
canvas.addEventListener('pointercancel', () => { pointerActive = false; pointerDir = 0; });

function updatePointer(e) {
  const rect = canvas.getBoundingClientRect();
  const px = (e.clientX - rect.left) / rect.width;
  const cx = 0.5;
  const d = (px - cx) * 2;
  pointerDir = Math.max(-1, Math.min(1, d * 2));
}

window.addEventListener('keydown', e => {
  ensureAudio();
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
  if (e.key === ' ' || e.key === 'Enter') {
    if (!running && card.style.display !== 'none') startBtn.click();
  }
});
window.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
});

muteBtn.addEventListener('click', () => {
  muted = !muted;
  muteBtn.textContent = muted ? '🔇' : '🔊';
  try { localStorage.setItem('cc-mute', muted ? '1' : '0'); } catch (e) {}
});
try {
  if (localStorage.getItem('cc-mute') === '1') { muted = true; muteBtn.textContent = '🔇'; }
} catch (e) {}

// Game loop
function getInputDx() {
  let dx = 0;
  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;
  if (dx === 0 && pointerActive) dx = pointerDir;
  return Math.max(-1, Math.min(1, dx));
}

function step() {
  if (!running || !state) return;
  const dx = getInputDx();
  if (dx !== 0) {
    L.applyAction(state, state.selfId, { type: 'input', dx }, ctx);
  }
  ctx.tick++;
  L.applyAction(state, null, { type: 'tick' }, ctx);

  // Process events
  if (state.events) {
    for (const ev of state.events) {
      if (ev.id > lastEventId) {
        lastEventId = ev.id;
        handleEvent(ev);
      }
    }
  }

  bgmStep();

  if (state.result) {
    if (state.result === 'win') {
      state.clashStartCrowd = state.clashStartCrowd || state.crowd;
      state.clashStartEnemy = state.clashStartEnemy || (state.clash ? state.clash.enemyLeft : 1);
      setTimeout(showWin, 400);
    } else {
      setTimeout(showLoss, 400);
    }
    running = false;
  }
}

function handleEvent(ev) {
  if (ev.kind === 'gate') {
    if (ev.good) {
      playGateGood(state.combo);
      popups.push({ x: ev.x, z: ev.z, text: '+' + (ev.crowd || ''), color: '#22c55e', life: 40 });
      spawnParticles(ev.x, ev.z, '#22c55e', 6);
    } else {
      playGateBad();
      popups.push({ x: ev.x, z: ev.z, text: '✗', color: '#ef4444', life: 40 });
      spawnParticles(ev.x, ev.z, '#ef4444', 4);
    }
  } else if (ev.kind === 'trap') {
    playTrap();
    popups.push({ x: ev.x, z: ev.z, text: '-' + (ev.loss || ''), color: '#ef4444', life: 50 });
    spawnParticles(ev.x, ev.z, '#ef4444', 10);
  } else if (ev.kind === 'bonus') {
    playBonus();
    popups.push({ x: ev.x, z: ev.z, text: '+' + (ev.gain || ''), color: '#fbbf24', life: 50 });
    spawnParticles(ev.x, ev.z, '#fbbf24', 10);
  } else if (ev.kind === 'clashHit') {
    playClashHit();
  } else if (ev.kind === 'clashStart') {
    state.clashStartCrowd = state.crowd;
    state.clashStartEnemy = ev.enemy;
  } else if (ev.kind === 'idle') {
    state.lossReason = 'idle';
  } else if (ev.kind === 'loss') {
    if (!state.lossReason) state.lossReason = 'crowd';
  }
}

function spawnParticles(x, z, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 0.5,
      z: z + (Math.random() - 0.5) * 0.5,
      vx: (Math.random() - 0.5) * 0.08,
      vz: -Math.random() * 0.1 - 0.02,
      color,
      life: 30 + Math.random() * 20,
      maxLife: 50
    });
  }
}

// Rendering
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);

function worldToScreen(wx, wz, cw, ch) {
  const scale = Math.min(cw / W, ch / H);
  const ox = (cw - W * scale) / 2;
  const oy = (ch - H * scale) / 2;
  return { sx: ox + wx * scale, sy: oy + wz * scale, scale };
}

function render() {
  const cw = canvas.clientWidth;
  const ch = canvas.clientHeight;
  if (cw === 0 || ch === 0) return;

  // Background gradient
  const grad = ctx2d.createLinearGradient(0, 0, 0, ch);
  grad.addColorStop(0, '#0b1026');
  grad.addColorStop(1, '#131a3a');
  ctx2d.fillStyle = grad;
  ctx2d.fillRect(0, 0, cw, ch);

  if (!state) return;

  const scale = Math.min(cw / W, ch / H);
  const ox = (cw - W * scale) / 2;
  const oy = (ch - H * scale) / 2;

  function sx(wx) { return ox + wx * scale; }
  function sy(wz) { return oy + wz * scale; }

  // Track
  ctx2d.fillStyle = '#1d2650';
  ctx2d.fillRect(sx(0), sy(0), W * scale, H * scale);

  // Edge rails
  ctx2d.strokeStyle = '#22d3ee';
  ctx2d.lineWidth = 2;
  ctx2d.shadowColor = '#22d3ee';
  ctx2d.shadowBlur = 8;
  ctx2d.beginPath();
  ctx2d.moveTo(sx(0), sy(0));
  ctx2d.lineTo(sx(0), sy(H));
  ctx2d.moveTo(sx(W), sy(0));
  ctx2d.lineTo(sx(W), sy(H));
  ctx2d.stroke();
  ctx2d.shadowBlur = 0;

  // Scrolling dashed centre line
  const dist = state.dist || 0;
  ctx2d.strokeStyle = 'rgba(34,211,238,0.25)';
  ctx2d.lineWidth = 1;
  ctx2d.setLineDash([8, 12]);
  ctx2d.lineDashOffset = -dist * scale * 3;
  ctx2d.beginPath();
  ctx2d.moveTo(sx(W / 2), sy(0));
  ctx2d.lineTo(sx(W / 2), sy(H));
  ctx2d.stroke();
  ctx2d.setLineDash([]);

  // Scrolling dashed lane dividers (quarter lines)
  ctx2d.strokeStyle = 'rgba(34,211,238,0.14)';
  ctx2d.lineWidth = 1;
  ctx2d.setLineDash([6, 14]);
  ctx2d.lineDashOffset = -dist * scale * 3;
  for (const lx of [W / 4, (3 * W) / 4]) {
    ctx2d.beginPath();
    ctx2d.moveTo(sx(lx), sy(0));
    ctx2d.lineTo(sx(lx), sy(H));
    ctx2d.stroke();
  }
  ctx2d.setLineDash([]);

  // Side-stand decorations scrolling with the track
  drawSideStands(dist, sx, sy, scale);

  // Progress rail
  const totalDist = 200;
  const prog = Math.min(1, dist / totalDist);
  ctx2d.fillStyle = 'rgba(34,211,238,0.15)';
  ctx2d.fillRect(cw - 8, 0, 6, ch);
  ctx2d.fillStyle = '#22d3ee';
  ctx2d.fillRect(cw - 8, ch * (1 - prog), 6, ch * prog);

  // Rows
  if (state.activeRows) {
    for (const row of state.activeRows) {
      if (row.z < -2 || row.z > H + 1) continue;
      drawRow(row, sx, sy, scale);
    }
  }

  // Clash enemy
  if (state.clash) {
    drawEnemyCrowd(state.clash, sx, sy, scale);
  }

  // Player crowd
  drawPlayerCrowd(state, sx, sy, scale);

  // Particles
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx2d.globalAlpha = alpha;
    ctx2d.fillStyle = p.color;
    ctx2d.beginPath();
    ctx2d.arc(sx(p.x), sy(p.z), 3 * scale / 20, 0, Math.PI * 2);
    ctx2d.fill();
  }
  ctx2d.globalAlpha = 1;

  // Popups
  for (const p of popups) {
    const alpha = Math.min(1, p.life / 20);
    ctx2d.globalAlpha = alpha;
    ctx2d.fillStyle = p.color;
    ctx2d.font = `bold ${Math.floor(scale * 0.5)}px sans-serif`;
    ctx2d.textAlign = 'center';
    ctx2d.fillText(p.text, sx(p.x), sy(p.z));
  }
  ctx2d.globalAlpha = 1;

  // HUD
  hud.textContent = `Lv ${state.level + 1} · 👥 ${state.crowd} · Score ${state.score}`;
}

function drawRow(row, sx, sy, scale) {
  const z = row.z;
  if (row.kind === 'gate') {
const halfW = W / 2;
    const top = sy(z - 1.15);
    const bot = sy(z + 0.45);
    const h = bot - top;
    // Left panel
    drawGatePanel(sx(0), top, halfW * scale, h, row.left, scale);
    // Right panel
    drawGatePanel(sx(halfW), top, halfW * scale, h, row.right, scale);
  } else if (row.kind === 'trap') {
    const top = sy(z - 0.9);
    const bot = sy(z + 0.2);
    const h = bot - top;
    const x0 = sx(row.x0);
    const x1 = sx(row.x1);
    ctx2d.fillStyle = 'rgba(30,10,10,0.85)';
    ctx2d.fillRect(x0, top, x1 - x0, h);
    // Hazard chevrons
    ctx2d.strokeStyle = '#ef4444';
    ctx2d.lineWidth = 2;
    const chevCount = Math.floor((x1 - x0) / (scale * 0.4));
    for (let i = 0; i < chevCount; i++) {
      const cx = x0 + (i + 0.5) * (x1 - x0) / chevCount;
      ctx2d.beginPath();
      ctx2d.moveTo(cx - scale * 0.15, top + h * 0.3);
      ctx2d.lineTo(cx, top + h * 0.6);
      ctx2d.lineTo(cx + scale * 0.15, top + h * 0.3);
      ctx2d.stroke();
    }
    // Spikes
    ctx2d.fillStyle = '#ef4444';
    for (let i = 0; i < chevCount; i++) {
      const cx = x0 + (i + 0.5) * (x1 - x0) / chevCount;
      ctx2d.beginPath();
      ctx2d.moveTo(cx - scale * 0.08, bot);
      ctx2d.lineTo(cx, bot - h * 0.25);
      ctx2d.lineTo(cx + scale * 0.08, bot);
      ctx2d.fill();
    }
  } else if (row.kind === 'bonus') {
    const top = sy(z - 0.9);
    const bot = sy(z + 0.2);
    const h = bot - top;
    const x0 = sx(row.x0);
    const x1 = sx(row.x1);
    ctx2d.fillStyle = 'rgba(251,191,36,0.3)';
    ctx2d.fillRect(x0, top, x1 - x0, h);
    ctx2d.strokeStyle = '#fbbf24';
    ctx2d.lineWidth = 2;
    ctx2d.strokeRect(x0, top, x1 - x0, h);
    ctx2d.fillStyle = '#fbbf24';
    ctx2d.font = `bold ${Math.floor(scale * 0.35)}px sans-serif`;
    ctx2d.textAlign = 'center';
    ctx2d.fillText('+' + row.gain, (x0 + x1) / 2, (top + bot) / 2 + scale * 0.12);
  }
}

function drawGatePanel(x, y, w, h, op, scale) {
  const colors = { '+': '#22c55e', 'x': '#a855f7', '-': '#ef4444', '/': '#f59e0b' };
  const col = colors[op.k] || '#94a3b8';
  const label = op.k === 'x' ? '\u00d7' + op.v : op.k === '/' ? '\u00f7' + op.v : op.k + op.v;

  ctx2d.save();

  ctx2d.shadowColor = col;
  ctx2d.shadowBlur = 14;
  ctx2d.fillStyle = col + '2e';
  ctx2d.fillRect(x, y, w, h);
  ctx2d.shadowBlur = 0;

  const bandH = h * 0.18;
  ctx2d.fillStyle = col + '55';
  ctx2d.fillRect(x, y + h - bandH, w, bandH);

  ctx2d.strokeStyle = col;
  ctx2d.lineWidth = 3;
  ctx2d.strokeRect(x, y, w, h);

  ctx2d.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx2d.lineWidth = 1;
  ctx2d.strokeRect(x + 4, y + 4, w - 8, h - 8);

  const stripH = Math.max(4, h * 0.09);
  ctx2d.fillStyle = col;
  ctx2d.fillRect(x, y, w, stripH);

  ctx2d.fillStyle = '#ffffff';
  ctx2d.font = 'bold ' + Math.floor(h * 0.07) + 'px sans-serif';
  ctx2d.textAlign = 'center';
  ctx2d.textBaseline = 'middle';
  ctx2d.fillText('\u25bc', x + w / 2, y + stripH / 2);

  const fontSize = Math.floor(scale * 0.6);
  ctx2d.font = 'bold ' + fontSize + 'px sans-serif';
  ctx2d.textAlign = 'center';
  ctx2d.textBaseline = 'middle';

  const metrics = ctx2d.measureText(label);
  const textW = metrics.width;
  const padX = scale * 0.18;
  const padY = scale * 0.12;
  const pillW = textW + padX * 2;
  const pillH = fontSize + padY * 2;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const pillX = cx - pillW / 2;
  const pillY = cy - pillH / 2;

  ctx2d.fillStyle = 'rgba(5,8,20,0.72)';
  if (typeof roundRect === 'function') {
    roundRect(ctx2d, pillX, pillY, pillW, pillH, Math.min(pillH / 2, scale * 0.2));
    ctx2d.fill();
  } else {
    ctx2d.fillRect(pillX, pillY, pillW, pillH);
  }

  ctx2d.fillStyle = col;
  ctx2d.fillText(label, cx, cy);

  ctx2d.textBaseline = 'alphabetic';
  ctx2d.restore();
}

function drawSideStands(dist, sx, sy, scale) {
  const d = (typeof dist === 'number' && isFinite(dist)) ? dist : 0;
  const spectatorColors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#f472b6'];
  const stepColors = ['#2b3a6b', '#33448a'];
  const stepW = 0.5;
  const stepH = 0.28;
  const edgeXs = [0.28, W - 0.28];

  for (let i = 0; i < 8; i++) {
    const baseZ = ((i * 6 - (d % 48)) % 48 + 48) % 48;
    if (baseZ < -1 || baseZ > H + 1) continue;

    for (let e = 0; e < edgeXs.length; e++) {
      const wx = edgeXs[e];
      const px = sx(wx - stepW / 2);
      const pw = stepW * scale;

      for (let s = 0; s < 3; s++) {
        const wz = baseZ - s * stepH;
        const py = sy(wz - stepH);
        const ph = stepH * scale;

        ctx2d.fillStyle = stepColors[s % 2];
        ctx2d.fillRect(px, py, pw, ph);
        ctx2d.strokeStyle = '#22d3ee55';
        ctx2d.lineWidth = 1;
        ctx2d.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);

        const dotR = scale * 0.05;
        for (let k = 0; k < 3; k++) {
          const dx = px + pw * ((k + 1) / 4);
          const dy = py + ph * 0.5;
          ctx2d.fillStyle = spectatorColors[(i + s + k) % 5];
          ctx2d.beginPath();
          ctx2d.arc(dx, dy, dotR, 0, Math.PI * 2);
          ctx2d.fill();
        }

        if (s === 1) {
          const poleX = px + pw * 0.5;
          const poleTop = py - 0.5 * scale;
          ctx2d.strokeStyle = '#e5e7eb';
          ctx2d.lineWidth = 1;
          ctx2d.beginPath();
          ctx2d.moveTo(poleX, py);
          ctx2d.lineTo(poleX, poleTop);
          ctx2d.stroke();

          ctx2d.fillStyle = spectatorColors[(i + 2) % 5];
          ctx2d.beginPath();
          ctx2d.moveTo(poleX, poleTop);
          ctx2d.lineTo(poleX + 0.28 * scale, poleTop + 0.12 * scale);
          ctx2d.lineTo(poleX, poleTop + 0.24 * scale);
          ctx2d.closePath();
          ctx2d.fill();
        }
      }
    }
  }
}

function drawEnemyCrowd(clash, sx, sy, scale) {
  const count = Math.min(30, Math.ceil(clash.enemyLeft / 20));
  const baseX = W / 2;
  const baseZ = 2.2;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const r = 0.8 + (i % 3) * 0.3;
    const ex = baseX + Math.cos(angle) * r;
    const ez = baseZ + Math.sin(angle) * r * 0.5;
    drawFigure(sx(ex), sy(ez), scale, '#f87171', i);
  }
  // Count badge
  ctx2d.fillStyle = 'rgba(248,113,113,0.9)';
  const bw = scale * 1.2;
  const bh = scale * 0.5;
  const bx = sx(baseX) - bw / 2;
  const by = sy(baseZ - 1.2);
  roundRect(ctx2d, bx, by, bw, bh, bh / 2);
  ctx2d.fill();
  ctx2d.fillStyle = '#fff';
  ctx2d.font = `bold ${Math.floor(scale * 0.35)}px sans-serif`;
  ctx2d.textAlign = 'center';
  ctx2d.fillText(String(clash.enemyLeft), sx(baseX), by + bh * 0.7);
}

function drawPlayerCrowd(state, sx, sy, scale) {
  const crowd = state.crowd;
  const px = state.players[state.selfId].x;
  const pz = CROWD_Z;
  const count = Math.min(60, crowd);
  const tick = state.tick;

  for (let i = 0; i < count; i++) {
    const angle = (i * 2.399963) % (Math.PI * 2);
    const r = Math.sqrt(i / count) * 1.7;
    const ox = Math.cos(angle) * r;
    const oz = Math.sin(angle) * r * 0.6;
    const bob = Math.sin(tick * 0.35 + i) * 0.08;
    const hue = (i * 37) % 360;
    const fx = Math.max(0.35, Math.min(W - 0.35, px + ox));
    drawFigure(sx(fx), sy(pz + oz + bob), scale, `hsl(${hue},70%,60%)`, i, 1.45);
  }

  // Count badge
  const bw = scale * 1.4;
  const bh = scale * 0.55;
  const bx = sx(px) - bw / 2;
  const by = sy(pz - 1.6);
  ctx2d.fillStyle = 'rgba(34,211,238,0.9)';
  roundRect(ctx2d, bx, by, bw, bh, bh / 2);
  ctx2d.fill();
  ctx2d.fillStyle = '#0b1026';
  ctx2d.font = `bold ${Math.floor(scale * 0.38)}px sans-serif`;
  ctx2d.textAlign = 'center';
  ctx2d.fillText(String(crowd), sx(px), by + bh * 0.72);
}

function drawFigure(x, y, scale, color, idx, sizeMult) {
  const r = scale * 0.12 * (sizeMult || 1);
  ctx2d.fillStyle = color;
  ctx2d.beginPath();
  ctx2d.arc(x, y - r * 1.5, r * 0.6, 0, Math.PI * 2);
  ctx2d.fill();
  ctx2d.beginPath();
  ctx2d.ellipse(x, y, r * 0.7, r * 1.1, 0, 0, Math.PI * 2);
  ctx2d.fill();
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.arcTo(x + w, y, x + w, y + r, r);
  c.lineTo(x + w, y + h - r);
  c.arcTo(x + w, y + h, x + w - r, y + h, r);
  c.lineTo(x + r, y + h);
  c.arcTo(x, y + h, x, y + h - r, r);
  c.lineTo(x, y + r);
  c.arcTo(x, y, x + r, y, r);
  c.closePath();
}

// Main loop
function loop(time) {
  requestAnimationFrame(loop);
  const dt = time - lastTime;
  lastTime = time;
  if (dt > 0) {
    fpsAccum += dt;
    fpsFrames++;
    if (fpsAccum >= 500) {
      fps = Math.round(1000 / (fpsAccum / fpsFrames));
      fpsAccum = 0;
      fpsFrames = 0;
    }
  }

  if (running && state) {
    tickAccum += dt;
    const stepMs = 1000 / L.meta.tickRate;
    let steps = 0;
    while (tickAccum >= stepMs && steps < 5) {
      tickAccum -= stepMs;
      step();
      steps++;
    }
  }

  // Update particles/popups
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.z += p.vz;
    p.vz += 0.005;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
  for (let i = popups.length - 1; i >= 0; i--) {
    popups[i].z -= 0.03;
    popups[i].life--;
    if (popups[i].life <= 0) popups.splice(i, 1);
  }

  render();
}

// Self tests
function runSelfTests() {
  const results = {};

  // Test 1: pilot wins all levels
  let allWin = true;
  let failDetail = '';
  for (let lv = 0; lv < 10; lv++) {
    const tctx = makeCtx(0, 42 + lv);
    let st = L.setup(tctx, [{ id: 'player-1', level: lv }]);
    let ticks = 0;
    while (!st.result && ticks < 8000) {
      const action = L.pilot(st);
      if (action.dx !== 0) L.applyAction(st, st.selfId, action, tctx);
      tctx.tick++;
      L.applyAction(st, null, { type: 'tick' }, tctx);
      ticks++;
    }
    if (st.result !== 'win') {
      allWin = false;
      failDetail = `Level ${lv + 1} result: ${st.result} at tick ${ticks}`;
      break;
    }
  }
  results.pilotWinsAllLevels = { pass: allWin, detail: allWin ? 'All 10 levels won' : failDetail };

  // Test 2: deterministic
  let detPass = true;
  let detDetail = '';
  try {
    const run = (seed) => {
      const tctx = makeCtx(0, seed);
      let st = L.setup(tctx, [{ id: 'player-1', level: 0 }]);
        let ticks = 0;
      while (!st.result && ticks < 8000) {
        const action = L.pilot(st);
        if (action.dx !== 0) L.applyAction(st, st.selfId, action, tctx);
        tctx.tick++;
        L.applyAction(st, null, { type: 'tick' }, tctx);
        ticks++;
      }
      return { crowd: st.crowd, score: st.score, result: st.result };
    };
    const a = run(123);
    const b = run(123);
    detPass = a.crowd === b.crowd && a.score === b.score && a.result === b.result;
    detDetail = detPass ? 'Identical runs' : `Mismatch: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`;
  } catch (e) {
    detPass = false;
    detDetail = e.message;
  }
  results.deterministic = { pass: detPass, detail: detDetail };

  // Test 3: viewJson
  let viewPass = true;
  let viewDetail = '';
  try {
    const tctx = makeCtx(0, 7);
    let st = L.setup(tctx, [{ id: 'player-1', level: 0 }]);
    const v = L.viewFor(st, 0, tctx);
    JSON.stringify(v);
    viewDetail = 'JSON serializable';
  } catch (e) {
    viewPass = false;
    viewDetail = e.message;
  }
  results.viewJson = { pass: viewPass, detail: viewDetail };

  // Test 4: idle loses
  let idlePass = false;
  let idleDetail = '';
  try {
    const tctx = makeCtx(0, 99);
    let st = L.setup(tctx, [{ id: 'player-1', level: 0 }]);
    let ticks = 0;
    while (!st.result && ticks < 8000) {
      tctx.tick++;
      L.applyAction(st, null, { type: 'tick' }, tctx);
      ticks++;
    }
    idlePass = st.result === 'loss';
    idleDetail = idlePass ? `Loss at tick ${ticks}` : `Result: ${st.result}`;
  } catch (e) {
    idleDetail = e.message;
  }
  results.idleLoses = { pass: idlePass, detail: idleDetail };

  return results;
}

// Expose API
window.__omGame = {
  getState() {
    if (!state) return { phase: 'ready' };
    const phase = !running ? (state.result ?? 'ready') : (state.result ?? 'playing');
    return { ...state, rules: L.config, phase };
  },
  getStats() {
    return {
      fps,
      tick: state ? state.tick : 0,
      entities: state ? (state.activeRows ? state.activeRows.length : 0) + Math.min(60, state.crowd) : 0
    };
  },
  sendAction(action) {
    if (!state || !running) return;
    if (action.type === 'input') {
      L.applyAction(state, state.selfId, action, ctx);
    } else if (action.type === 'restart') {
      initGame(action.level ?? state.level);
    }
  },
  runSelfTests
};

// Init
resize();
showTitle();

const params = new URLSearchParams(window.location.search);
if (params.has('autostart')) {
  setTimeout(() => initGame(0), 100);
}

requestAnimationFrame(loop);
