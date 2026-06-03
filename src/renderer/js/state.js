const state = {
  currentTrack: null,
  playerState: 'IDLE',
  currentTime: 0,
  duration: 0,
  volume: 80,
  queue: [],
  queueIndex: -1,
  searchResults: [],
  searchQuery: '',
  isQueueVisible: false,
  isSetupComplete: false,
  repeatMode: 'none',
  isShuffled: false,
};

const listeners = {};

export function get(key) {
  return state[key];
}

export function set(key, value) {
  state[key] = value;
  if (listeners[key]) {
    listeners[key].forEach((fn) => fn(value));
  }
}

export function subscribe(key, fn) {
  if (!listeners[key]) listeners[key] = [];
  listeners[key].push(fn);
  return () => {
    listeners[key] = listeners[key].filter((f) => f !== fn);
  };
}

export function getAll() {
  return { ...state };
}
