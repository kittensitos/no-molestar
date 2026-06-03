import * as state from './state.js';
import { loadTrack } from './youtube-player.js';

export function addToQueue(track) {
  const queue = [...state.get('queue'), track];
  state.set('queue', queue);
}

export function addAndPlay(track) {
  const queue = [...state.get('queue'), track];
  state.set('queue', queue);
  playAtIndex(queue.length - 1);
}

export function playNow(track) {
  const queue = state.get('queue');
  const idx = state.get('queueIndex');
  const newQueue = [...queue.slice(0, idx + 1), track, ...queue.slice(idx + 1)];
  state.set('queue', newQueue);
  playAtIndex(idx + 1);
}

export function removeFromQueue(index) {
  const queue = [...state.get('queue')];
  const currentIdx = state.get('queueIndex');
  queue.splice(index, 1);
  state.set('queue', queue);

  if (index < currentIdx) {
    state.set('queueIndex', currentIdx - 1);
  } else if (index === currentIdx) {
    if (queue.length === 0) {
      state.set('queueIndex', -1);
      state.set('currentTrack', null);
      state.set('playerState', 'IDLE');
    } else if (index >= queue.length) {
      playAtIndex(queue.length - 1);
    } else {
      playAtIndex(index);
    }
  }
}

export function clearQueue() {
  state.set('queue', []);
  state.set('queueIndex', -1);
  state.set('currentTrack', null);
  state.set('playerState', 'IDLE');
  state.set('currentTime', 0);
  state.set('duration', 0);
}

export function playNext() {
  const queue = state.get('queue');
  const idx = state.get('queueIndex');
  const repeat = state.get('repeatMode');

  if (repeat === 'one') {
    playAtIndex(idx);
    return;
  }

  if (idx + 1 < queue.length) {
    playAtIndex(idx + 1);
  } else if (repeat === 'all' && queue.length > 0) {
    playAtIndex(0);
  } else {
    state.set('playerState', 'IDLE');
  }
}

export function playPrevious() {
  const idx = state.get('queueIndex');
  const currentTime = state.get('currentTime');

  if (currentTime > 3) {
    import('./youtube-player.js').then((p) => p.seekTo(0));
    return;
  }

  if (idx > 0) {
    playAtIndex(idx - 1);
  }
}

export function playAtIndex(index) {
  const queue = state.get('queue');
  if (index < 0 || index >= queue.length) return;

  state.set('queueIndex', index);
  state.set('currentTrack', queue[index]);
  state.set('currentTime', 0);
  loadTrack(queue[index].videoId);
}

export function toggleRepeat() {
  const modes = ['none', 'all', 'one'];
  const current = state.get('repeatMode');
  const next = modes[(modes.indexOf(current) + 1) % modes.length];
  state.set('repeatMode', next);
  return next;
}

export function toggleShuffle() {
  const queue = [...state.get('queue')];
  const idx = state.get('queueIndex');
  const isShuffled = state.get('isShuffled');

  if (!isShuffled) {
    const current = queue[idx];
    const rest = queue.filter((_, i) => i !== idx);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    state.set('queue', [current, ...rest]);
    state.set('queueIndex', 0);
  }

  state.set('isShuffled', !isShuffled);
}
