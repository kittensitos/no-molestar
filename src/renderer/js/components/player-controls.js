import * as state from '../state.js';
import { togglePlayPause, seekTo, setVolume } from '../spotify-player.js';
import { playNext, playPrevious, toggleRepeat, toggleShuffle } from '../queue-manager.js';
import { formatDuration } from '../spotify-api.js';

let container = null;
let seekInput = null;
let isSeeking = false;

export function init(el) {
  container = el;

  container.innerHTML = `
    <div class="seek-bar-container">
      <span class="time current-time">0:00</span>
      <input type="range" class="seek-bar" min="0" max="100" value="0" step="0.1" />
      <span class="time total-time">0:00</span>
    </div>
    <div class="controls-row">
      <div class="controls-left"></div>
      <div class="controls-center">
        <button class="btn-shuffle" title="Shuffle">⇄</button>
        <button class="btn-prev" title="Previous">⏮</button>
        <button class="btn-play-pause" title="Play">▶</button>
        <button class="btn-next" title="Next">⏭</button>
        <button class="btn-repeat" title="Repeat">↻</button>
      </div>
      <div class="controls-right">
        <div class="volume-container">
          <button class="btn-volume" title="Volume">♪</button>
          <input type="range" class="volume-bar" min="0" max="100" value="80" />
        </div>
        <button class="btn-queue" title="Queue">☰</button>
      </div>
    </div>
  `;

  seekInput = container.querySelector('.seek-bar');
  const volumeInput = container.querySelector('.volume-bar');
  const playPauseBtn = container.querySelector('.btn-play-pause');
  const prevBtn = container.querySelector('.btn-prev');
  const nextBtn = container.querySelector('.btn-next');
  const shuffleBtn = container.querySelector('.btn-shuffle');
  const repeatBtn = container.querySelector('.btn-repeat');
  const queueBtn = container.querySelector('.btn-queue');
  const currentTimeEl = container.querySelector('.current-time');
  const totalTimeEl = container.querySelector('.total-time');

  playPauseBtn.addEventListener('click', togglePlayPause);
  prevBtn.addEventListener('click', playPrevious);
  nextBtn.addEventListener('click', playNext);

  shuffleBtn.addEventListener('click', () => {
    toggleShuffle();
    shuffleBtn.classList.toggle('active', state.get('isShuffled'));
  });

  repeatBtn.addEventListener('click', () => {
    const mode = toggleRepeat();
    repeatBtn.classList.toggle('active', mode !== 'none');
    repeatBtn.textContent = mode === 'one' ? '↺' : '↻';
    repeatBtn.title = mode === 'none' ? 'Repeat' : mode === 'all' ? 'Repeat All' : 'Repeat One';
  });

  queueBtn.addEventListener('click', () => {
    state.set('isQueueVisible', !state.get('isQueueVisible'));
    queueBtn.classList.toggle('active', state.get('isQueueVisible'));
  });

  seekInput.addEventListener('mousedown', () => { isSeeking = true; });
  seekInput.addEventListener('input', () => {
    currentTimeEl.textContent = formatDuration(parseFloat(seekInput.value));
  });
  seekInput.addEventListener('change', () => {
    seekTo(parseFloat(seekInput.value));
    isSeeking = false;
  });

  volumeInput.value = state.get('volume');
  volumeInput.addEventListener('input', () => {
    setVolume(parseInt(volumeInput.value));
  });

  state.subscribe('playerState', (ps) => {
    playPauseBtn.textContent = ps === 'PLAYING' ? '⏸' : '▶';
    playPauseBtn.title = ps === 'PLAYING' ? 'Pause' : 'Play';
  });

  state.subscribe('currentTime', (t) => {
    if (!isSeeking) {
      currentTimeEl.textContent = formatDuration(t);
      seekInput.value = t;
    }
  });

  state.subscribe('duration', (d) => {
    totalTimeEl.textContent = formatDuration(d);
    seekInput.max = d || 100;
  });
}
