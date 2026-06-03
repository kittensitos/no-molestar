import * as state from '../state.js';
import * as visualizer from '../visualizer.js';

let container = null;
let canvasEl = null;

export function init(el) {
  container = el;
  renderIdle();

  state.subscribe('currentTrack', (track) => {
    if (track) renderActive(track);
    else renderIdle();
  });

  state.subscribe('playerState', (ps) => {
    if (ps === 'PLAYING') {
      visualizer.start();
    } else {
      visualizer.stop();
    }
  });
}

function renderIdle() {
  container.innerHTML = `
    <div class="now-playing-idle">
      <div class="logo animate-glow">NO MOLESTAR</div>
      <div class="subtitle">SEARCH FOR MUSIC TO START</div>
    </div>
    <canvas id="visualizer-canvas"></canvas>
  `;
  initCanvas();
}

function renderActive(track) {
  const title = decodeHTMLEntities(track.title);
  const channel = decodeHTMLEntities(track.channelTitle);

  container.innerHTML = `
    <div class="now-playing-active animate-fade-in">
      <div class="now-playing-thumb-container">
        <img src="${escapeAttr(track.thumbnail)}" alt="" />
      </div>
      <div class="now-playing-title" title="${escapeAttr(title)}">${escapeHtml(title)}</div>
      <div class="now-playing-channel">${escapeHtml(channel)}</div>
    </div>
    <canvas id="visualizer-canvas"></canvas>
  `;
  initCanvas();
}

function initCanvas() {
  canvasEl = container.querySelector('#visualizer-canvas');
  if (canvasEl) {
    visualizer.init(canvasEl);
    if (state.get('playerState') === 'PLAYING') {
      visualizer.start();
    }
  }
}

function decodeHTMLEntities(text) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
