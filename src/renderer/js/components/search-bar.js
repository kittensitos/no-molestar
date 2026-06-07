import * as state from '../state.js';
import { searchTracks } from '../spotify-api.js';
import { createTrackItem } from './track-item.js';
import { addAndPlay, addToQueue } from '../queue-manager.js';
import { showToast } from './toast.js';

let container = null;
let resultsEl = null;
let debounceTimer = null;

export function init(el) {
  container = el;
  container.innerHTML = `
    <div class="search-container">
      <span class="search-icon">⌕</span>
      <input type="text" placeholder="Search Spotify..." spellcheck="false" />
      <button class="search-clear hidden">✕</button>
    </div>
    <div class="search-results hidden"></div>
  `;

  const input = container.querySelector('input');
  const clearBtn = container.querySelector('.search-clear');
  resultsEl = container.querySelector('.search-results');

  input.addEventListener('input', () => {
    const query = input.value.trim();
    clearBtn.classList.toggle('hidden', !query);

    if (debounceTimer) clearTimeout(debounceTimer);

    if (!query) {
      state.set('searchResults', []);
      state.set('searchQuery', '');
      resultsEl.classList.add('hidden');
      return;
    }

    state.set('searchQuery', query);
    debounceTimer = setTimeout(() => doSearch(query), 400);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      input.dispatchEvent(new Event('input'));
      input.blur();
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    input.dispatchEvent(new Event('input'));
    input.focus();
  });

  state.subscribe('searchResults', renderResults);
}

async function doSearch(query) {
  resultsEl.classList.remove('hidden');
  resultsEl.innerHTML = '<div class="search-loading"><div class="spinner"></div>Searching...</div>';

  try {
    const results = await searchTracks(query);
    state.set('searchResults', results);
  } catch (err) {
    resultsEl.innerHTML = `<div class="search-loading" style="color:var(--danger)">${err.message}</div>`;
  }
}

function renderResults(results) {
  if (!resultsEl) return;
  if (!results || results.length === 0) {
    if (state.get('searchQuery')) {
      resultsEl.innerHTML = '<div class="search-loading">No results found</div>';
      resultsEl.classList.remove('hidden');
    } else {
      resultsEl.classList.add('hidden');
    }
    return;
  }

  resultsEl.innerHTML = '';
  resultsEl.classList.remove('hidden');

  const currentTrack = state.get('currentTrack');

  results.forEach((track) => {
    const item = createTrackItem(track, {
      isActive: currentTrack && currentTrack.trackId === track.trackId,
      onPlay: (t) => {
        addAndPlay(t);
        resultsEl.classList.add('hidden');
      },
      onQueue: (t) => {
        addToQueue(t);
        showToast('Added to queue', 'success');
      },
    });
    resultsEl.appendChild(item);
  });
}

document.addEventListener('click', (e) => {
  if (resultsEl && container && !container.contains(e.target)) {
    resultsEl.classList.add('hidden');
  }
});
