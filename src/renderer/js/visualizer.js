const BAR_COUNT = 48;
const BAR_GAP = 2;

let canvas = null;
let ctx = null;
let animFrame = null;
let bars = [];
let targetBars = [];
let time = 0;

export function init(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
  bars = new Array(BAR_COUNT).fill(0);
  targetBars = new Array(BAR_COUNT).fill(0);
  resize();
  window.addEventListener('resize', resize);
}

function resize() {
  if (!canvas) return;
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = 120;
}

export function start() {
  if (animFrame) return;
  time = 0;
  loop();
}

export function stop() {
  if (animFrame) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
  if (ctx && canvas) {
    bars.fill(0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function loop() {
  animFrame = requestAnimationFrame(loop);
  time += 0.016;
  updateBars();
  draw();
}

function updateBars() {
  for (let i = 0; i < BAR_COUNT; i++) {
    const freq = 0.5 + i * 0.1;
    const phase = i * 0.3;
    const wave1 = Math.sin(time * freq * 2 + phase) * 0.5 + 0.5;
    const wave2 = Math.sin(time * freq * 1.3 + phase * 0.7) * 0.3 + 0.3;
    const wave3 = Math.sin(time * 3 + i * 0.15) * 0.2 + 0.2;
    const beat = Math.pow(Math.sin(time * 2.5), 8) * 0.4;

    targetBars[i] = Math.min(1, (wave1 + wave2 + wave3 + beat) * 0.5);
    bars[i] += (targetBars[i] - bars[i]) * 0.15;
  }
}

function draw() {
  if (!ctx || !canvas) return;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const barWidth = (width - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT;

  for (let i = 0; i < BAR_COUNT; i++) {
    const x = i * (barWidth + BAR_GAP);
    const barHeight = bars[i] * height * 0.85;
    const y = height - barHeight;

    const gradient = ctx.createLinearGradient(x, y, x, height);
    gradient.addColorStop(0, 'rgba(176, 96, 128, 0.7)');
    gradient.addColorStop(0.5, 'rgba(196, 120, 152, 0.35)');
    gradient.addColorStop(1, 'rgba(216, 160, 184, 0.05)');

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = 'rgba(176, 96, 128, 0.8)';
    ctx.fillRect(x, y, barWidth, 2);
  }
}

export function destroy() {
  stop();
  window.removeEventListener('resize', resize);
  canvas = null;
  ctx = null;
}
