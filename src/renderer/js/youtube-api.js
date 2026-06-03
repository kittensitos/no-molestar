import { getApiKey } from './config.js';

const API_BASE = 'https://www.googleapis.com/youtube/v3';
const searchCache = new Map();

function parseDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  return h * 3600 + m * 60 + s;
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export async function searchVideos(query, maxResults = 15) {
  const cacheKey = `${query}:${maxResults}`;
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

  const apiKey = await getApiKey();
  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    videoCategoryId: '10',
    q: query,
    maxResults: String(maxResults),
    key: apiKey,
  });

  const res = await fetch(`${API_BASE}/search?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Search failed (${res.status})`);
  }

  const data = await res.json();
  const videoIds = data.items.map((item) => item.id.videoId).join(',');
  const details = await getVideoDetails(videoIds);

  const tracks = data.items.map((item) => {
    const detail = details.get(item.id.videoId);
    return {
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url,
      duration: detail ? detail.duration : 0,
      durationFormatted: detail ? formatDuration(detail.duration) : '',
    };
  });

  searchCache.set(cacheKey, tracks);
  if (searchCache.size > 50) {
    const first = searchCache.keys().next().value;
    searchCache.delete(first);
  }

  return tracks;
}

async function getVideoDetails(videoIds) {
  const apiKey = await getApiKey();
  const params = new URLSearchParams({
    part: 'contentDetails',
    id: videoIds,
    key: apiKey,
  });

  const res = await fetch(`${API_BASE}/videos?${params}`);
  if (!res.ok) return new Map();

  const data = await res.json();
  const map = new Map();
  for (const item of data.items) {
    map.set(item.id, {
      duration: parseDuration(item.contentDetails.duration),
    });
  }
  return map;
}

export async function validateApiKey(key) {
  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    q: 'test',
    maxResults: '1',
    key: key,
  });

  try {
    const res = await fetch(`${API_BASE}/search?${params}`);
    return res.ok;
  } catch {
    return false;
  }
}
