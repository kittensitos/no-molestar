const { ipcRenderer } = require('electron');

let player = null;
let playerReady = false;
const pendingCommands = [];

ipcRenderer.on('player-command', (_event, data) => {
  if (!playerReady && data.action !== 'init') {
    pendingCommands.push(data);
    return;
  }
  executeCommand(data);
});

function executeCommand(data) {
  if (!player) return;

  switch (data.action) {
    case 'load':
      player.loadVideoById(data.payload.videoId);
      break;
    case 'play':
      player.playVideo();
      break;
    case 'pause':
      player.pauseVideo();
      break;
    case 'seek':
      player.seekTo(data.payload.seconds, true);
      break;
    case 'volume':
      player.setVolume(data.payload.volume);
      break;
    case 'getTime':
      sendEvent('timeUpdate', {
        currentTime: player.getCurrentTime() || 0,
        duration: player.getDuration() || 0,
      });
      break;
  }
}

function sendEvent(type, extra = {}) {
  ipcRenderer.sendToHost('player-event', { type, ...extra });
}

window.onPlayerReady = function () {
  playerReady = true;
  sendEvent('ready');
  pendingCommands.forEach(executeCommand);
  pendingCommands.length = 0;
};

window.onPlayerStateChange = function (event) {
  sendEvent('stateChange', { state: event.data });
};

window.onPlayerError = function (event) {
  sendEvent('error', { code: event.data });
};

window.setPlayerRef = function (p) {
  player = p;
};
