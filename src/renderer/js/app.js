import * as state from './state.js';
import { isLoggedIn, handleCallback } from './spotify-auth.js';
import { init as initPlayer } from './spotify-player.js';
import { init as initSetupWizard } from './components/setup-wizard.js';
import { init as initSearchBar } from './components/search-bar.js';
import { init as initNowPlaying } from './components/now-playing.js';
import { init as initPlayerControls } from './components/player-controls.js';
import { init as initQueuePanel } from './components/queue-panel.js';
import { togglePlayPause, seekTo } from './spotify-player.js';
import { playNext, playPrevious } from './queue-manager.js';

async function boot() {
  const callbackHandled = await handleCallback();

  if (callbackHandled || isLoggedIn()) {
    showApp();
  } else {
    showSetupWizard();
  }

  state.subscribe('isSetupComplete', (done) => {
    if (done) showApp();
  });

  initKeyboardShortcuts();
}

function showSetupWizard() {
  document.getElementById('setup-wizard').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
  initSetupWizard(document.getElementById('setup-wizard'));
}

async function showApp() {
  document.getElementById('setup-wizard').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  await initPlayer();
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
        import('./spotify-player.js').then((p) => {
          const vol = Math.min(100, state.get('volume') + 5);
          p.setVolume(vol);
        });
        break;
      case 'ArrowDown':
        e.preventDefault();
        import('./spotify-player.js').then((p) => {
          const vol = Math.max(0, state.get('volume') - 5);
          p.setVolume(vol);
        });
        break;
    }
  });
}

document.addEventListener('DOMContentLoaded', boot);
