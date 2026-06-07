export function createTrackItem(track, options = {}) {
  const { onPlay, onQueue, onRemove, isActive, showIndex } = options;

  const el = document.createElement('div');
  el.className = 'track-item' + (isActive ? ' active' : '');

  const thumb = document.createElement('img');
  thumb.className = 'track-thumb';
  thumb.src = track.thumbnail || '';
  thumb.alt = '';
  thumb.loading = 'lazy';
  el.appendChild(thumb);

  const info = document.createElement('div');
  info.className = 'track-info';

  const title = document.createElement('div');
  title.className = 'track-title';
  title.textContent = (showIndex !== undefined ? `${showIndex + 1}. ` : '') + decodeHTMLEntities(track.title);
  info.appendChild(title);

  const channel = document.createElement('div');
  channel.className = 'track-channel';
  channel.textContent = decodeHTMLEntities(track.artist);
  info.appendChild(channel);

  el.appendChild(info);

  if (track.durationFormatted) {
    const dur = document.createElement('span');
    dur.className = 'track-duration';
    dur.textContent = track.durationFormatted;
    el.appendChild(dur);
  }

  const actions = document.createElement('div');
  actions.className = 'track-actions';

  if (onPlay) {
    const playBtn = document.createElement('button');
    playBtn.textContent = '▶';
    playBtn.title = 'Play now';
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onPlay(track);
    });
    actions.appendChild(playBtn);
  }

  if (onQueue) {
    const queueBtn = document.createElement('button');
    queueBtn.textContent = '+';
    queueBtn.title = 'Add to queue';
    queueBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onQueue(track);
    });
    actions.appendChild(queueBtn);
  }

  if (onRemove) {
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✕';
    removeBtn.title = 'Remove';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onRemove(track);
    });
    actions.appendChild(removeBtn);
  }

  el.appendChild(actions);

  if (onPlay) {
    el.addEventListener('click', () => onPlay(track));
  }

  return el;
}

function decodeHTMLEntities(text) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}
