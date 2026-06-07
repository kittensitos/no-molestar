import * as state from './state.js';
import { getAccessToken } from './spotify-auth.js';

let player = null;
let deviceId = null;
let ready = false;
let positionInterval = null;

export function init() {
  return new Promise((resolve) => {
    if (player) {
      resolve();
      return;
    }

    window.onSpotifyWebPlaybackSDKReady = async () => {
      const token = await getAccessToken();
      if (!token) return;

      player = new window.Spotify.Player({
        name: 'No Molestar',
        getOAuthToken: async (cb) => {
          const t = await getAccessToken();
          cb(t);
        },
        volume: state.get('volume') / 100,
      });

      player.addListener('ready', ({ device_id }) => {
        deviceId = device_id;
        ready = true;
        resolve();
      });

      player.addListener('not_ready', () => {
        ready = false;
        deviceId = null;
      });

      player.addListener('player_state_changed', (sdkState) => {
        if (!sdkState) {
          state.set('playerState', 'IDLE');
          stopPositionUpdates();
          return;
        }

        const { paused, position, duration } = sdkState;
        state.set('currentTime', position / 1000);
        state.set('duration', duration / 1000);

        if (paused) {
          state.set('playerState', 'PAUSED');
          stopPositionUpdates();
        } else {
          state.set('playerState', 'PLAYING');
          startPositionUpdates();
        }

        const currentTrack = sdkState.track_window?.current_track;
        if (currentTrack && sdkState.paused && position === 0 && sdkState.restrictions?.disallow_resuming_reasons?.includes('not_paused')) {
          import('./queue-manager.js').then((qm) => qm.playNext());
        }
      });

      player.addListener('initialization_error', ({ message }) => {
        console.error('Spotify init error:', message);
      });

      player.addListener('authentication_error', ({ message }) => {
        console.error('Spotify auth error:', message);
        state.set('playerState', 'ERROR');
      });

      player.addListener('playback_error', ({ message }) => {
        console.error('Spotify playback error:', message);
        state.set('playerState', 'ERROR');
      });

      await player.connect();
    };

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    document.body.appendChild(script);
  });
}

function startPositionUpdates() {
  stopPositionUpdates();
  positionInterval = setInterval(async () => {
    if (!player) return;
    const sdkState = await player.getCurrentState();
    if (sdkState && !sdkState.paused) {
      state.set('currentTime', sdkState.position / 1000);
      state.set('duration', sdkState.duration / 1000);
    }
  }, 500);
}

function stopPositionUpdates() {
  if (positionInterval) {
    clearInterval(positionInterval);
    positionInterval = null;
  }
}

export async function loadTrack(uri) {
  if (!ready || !deviceId) return;

  const token = await getAccessToken();
  if (!token) return;

  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: [uri] }),
  });
}

export function play() {
  if (player) player.resume();
}

export function pause() {
  if (player) player.pause();
}

export function togglePlayPause() {
  if (player) player.togglePlay();
}

export function seekTo(seconds) {
  if (player) player.seek(seconds * 1000);
}

export function setVolume(vol) {
  state.set('volume', vol);
  if (player) player.setVolume(vol / 100);
}
