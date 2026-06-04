import * as state from './state.js';
import { hasApiKey } from './config.js';
import { init as initPlayer } from './youtube-player.js';
import { init as initSetupWizard } from './components/setup-wizard.js';
import { init as initSearchBar } from './components/search-bar.js';
import { init as initNowPlaying } from './components/now-playing.js';
import { init as initPlayerControls } from './components/player-controls.js';
import { init as initQueuePanel } from './components/queue-panel.js';
import { togglePlayPause, seekTo } from './youtube-player.js';
import { playNext, playPrevious } from './queue-manager.js';

async function boot() {
  initTitleBar();

  const hasKey = await hasApiKey();

  if (hasKey) {
    showApp();
  } else {
    showSetupWizard();
  }

  state.subscribe('isSetupComplete', (done) => {
    if (done) showApp();
  });

  initKeyboardShortcuts();
}

function initTitleBar() {
  const btnMin = document.getElementById('btn-minimize');
  const btnMax = document.getElementById('btn-maximize');
  const btnClose = document.getElementById('btn-close');
  const btnExit = document.getElementById('btn-exit');

  if (btnMin) btnMin.addEventListener('click', () => window.noMolestar.window.minimize());
  if (btnMax) btnMax.addEventListener('click', () => window.noMolestar.window.maximize());
  if (btnClose) btnClose.addEventListener('click', () => window.noMolestar.window.close());
  if (btnExit) btnExit.addEventListener('click', () => window.noMolestar.app.quit());
}

function showSetupWizard() {
  document.getElementById('setup-wizard').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
  initSetupWizard(document.getElementById('setup-wizard'));
}

function showApp() {
  document.getElementById('setup-wizard').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  initPlayer();
  initSearchBar(document.getElementById('search-section'));
  initNowPlaying(document.getElementById('now-playing-section'));
  initPlayerControls(document.getElementById('controls-section'));
  initQueuePanel(document.getElementById('queue-panel'));
}

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        togglePlayPause();
        break;
      case 'ArrowRight':
        if (e.shiftKey) {
          playNext();
        } else {
          const t = state.get('currentTime');
          seekTo(t + 5);
        }
        break;
      case 'ArrowLeft':
        if (e.shiftKey) {
          playPrevious();
        } else {
          const t = state.get('currentTime');
          seekTo(Math.max(0, t - 5));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        const vol = Math.min(100, state.get('volume') + 5);
        import('./youtube-player.js').then((p) => p.setVolume(vol));
        break;
      case 'ArrowDown':
        e.preventDefault();
        const vol2 = Math.max(0, state.get('volume') - 5);
        import('./youtube-player.js').then((p) => p.setVolume(vol2));
        break;
    }
  });
}

document.addEventListener('DOMContentLoaded', boot);
