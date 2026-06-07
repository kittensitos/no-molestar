import { getAccessToken } from './spotify-auth.js';

const API_BASE = 'https://api.spotify.com/v1';
const searchCache = new Map();

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

async function spotifyFetch(url) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    throw new Error('Session expired. Please log in again.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function searchTracks(query, maxResults = 15) {
  const cacheKey = `${query}:${maxResults}`;
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: String(maxResults),
  });

  const data = await spotifyFetch(`${API_BASE}/search?${params}`);

  const tracks = data.tracks.items.map((track) => {
    const durationSec = track.duration_ms / 1000;
    return {
      trackId: track.id,
      uri: track.uri,
      title: track.name,
      artist: track.artists.map((a) => a.name).join(', '),
      albumName: track.album.name,
      thumbnail: track.album.images[0]?.url || '',
      duration: durationSec,
      durationFormatted: formatDuration(durationSec),
    };
  });

  searchCache.set(cacheKey, tracks);
  if (searchCache.size > 50) {
    const first = searchCache.keys().next().value;
    searchCache.delete(first);
  }

  return tracks;
}
