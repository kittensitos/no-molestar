import * as state from '../state.js';
import { createTrackItem } from './track-item.js';
import { removeFromQueue, clearQueue, playAtIndex } from '../queue-manager.js';

let container = null;
let listEl = null;

export function init(el) {
  container = el;

  container.innerHTML = `
    <div class="queue-header">
      <h3>QUEUE</h3>
      <button class="queue-clear">CLEAR ALL</button>
    </div>
    <div class="queue-list"></div>
  `;

  listEl = container.querySelector('.queue-list');
  container.querySelector('.queue-clear').addEventListener('click', clearQueue);

  state.subscribe('isQueueVisible', (visible) => {
    container.classList.toggle('hidden', !visible);
  });

  state.subscribe('queue', renderQueue);
  state.subscribe('queueIndex', renderQueue);
}

function renderQueue() {
  if (!listEl) return;
  const queue = state.get('queue');
  const currentIdx = state.get('queueIndex');

  if (queue.length === 0) {
    listEl.innerHTML = '<div class="queue-empty">Queue is empty<br>Search for music to add tracks</div>';
    return;
  }

  listEl.innerHTML = '';

  queue.forEach((track, i) => {
    const item = createTrackItem(track, {
      isActive: i === currentIdx,
      showIndex: i,
      onPlay: () => playAtIndex(i),
      onRemove: () => removeFromQueue(i),
    });

    item.draggable = true;
    item.dataset.index = i;

    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', i);
      item.style.opacity = '0.5';
    });

    item.addEventListener('dragend', () => {
      item.style.opacity = '1';
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      item.style.borderTop = '2px solid var(--accent)';
    });

    item.addEventListener('dragleave', () => {
      item.style.borderTop = '';
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.style.borderTop = '';
      const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
      const toIdx = i;
      if (fromIdx === toIdx) return;

      const q = [...state.get('queue')];
      const [moved] = q.splice(fromIdx, 1);
      q.splice(toIdx, 0, moved);
      state.set('queue', q);

      let ci = state.get('queueIndex');
      if (ci === fromIdx) ci = toIdx;
      else if (fromIdx < ci && toIdx >= ci) ci--;
      else if (fromIdx > ci && toIdx <= ci) ci++;
      state.set('queueIndex', ci);
    });

    listEl.appendChild(item);
  });
}
