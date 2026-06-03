import * as state from './state.js';

let webview = null;
let ready = false;
const pendingCommands = [];
let timeUpdateInterval = null;

export function init() {
  webview = document.getElementById('youtube-webview');
  if (!webview) return;

  webview.addEventListener('dom-ready', () => {
    webview.setAudioMuted(false);
  });

  webview.addEventListener('ipc-message', (event) => {
    const { channel, args } = event;
    if (channel === 'player-event') {
      handlePlayerEvent(args[0]);
    }
  });
}

function handlePlayerEvent(event) {
  switch (event.type) {
    case 'ready':
      ready = true;
      pendingCommands.forEach((cmd) => sendCommand(cmd.action, cmd.payload));
      pendingCommands.length = 0;
      setVolume(state.get('volume'));
      break;

    case 'stateChange':
      handleStateChange(event.state);
      break;

    case 'timeUpdate':
      state.set('currentTime', event.currentTime);
      state.set('duration', event.duration);
      break;

    case 'error':
      console.error('YouTube player error:', event.code);
      state.set('playerState', 'ERROR');
      break;
  }
}

function handleStateChange(ytState) {
  const stateMap = {
    '-1': 'UNSTARTED',
    '0': 'ENDED',
    '1': 'PLAYING',
    '2': 'PAUSED',
    '3': 'BUFFERING',
    '5': 'CUED',
  };

  const mapped = stateMap[String(ytState)] || 'IDLE';
  state.set('playerState', mapped);

  if (mapped === 'PLAYING') {
    startTimeUpdates();
  } else {
    stopTimeUpdates();
  }

  if (mapped === 'ENDED') {
    import('./queue-manager.js').then((qm) => qm.playNext());
  }
}

function startTimeUpdates() {
  stopTimeUpdates();
  timeUpdateInterval = setInterval(() => {
    sendCommand('getTime');
  }, 500);
}

function stopTimeUpdates() {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval);
    timeUpdateInterval = null;
  }
}

function sendCommand(action, payload) {
  if (!webview) return;
  if (!ready && action !== 'init') {
    pendingCommands.push({ action, payload });
    return;
  }
  webview.send('player-command', { action, payload });
}

export function loadTrack(videoId) {
  sendCommand('load', { videoId });
}

export function play() {
  sendCommand('play');
}

export function pause() {
  sendCommand('pause');
}

export function togglePlayPause() {
  const current = state.get('playerState');
  if (current === 'PLAYING') {
    pause();
  } else {
    play();
  }
}

export function seekTo(seconds) {
  sendCommand('seek', { seconds });
}

export function setVolume(vol) {
  state.set('volume', vol);
  sendCommand('volume', { volume: vol });
}
