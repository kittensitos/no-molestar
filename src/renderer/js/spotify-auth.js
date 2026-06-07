const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state',
].join(' ');

const TOKEN_KEY = 'nm_spotify_tokens';
const CLIENT_ID_KEY = 'nm_spotify_client_id';
const VERIFIER_KEY = 'nm_pkce_verifier';

function getRedirectUri() {
  return `${window.location.origin}${window.location.pathname}`;
}

export function getClientId() {
  return localStorage.getItem(CLIENT_ID_KEY);
}

export function setClientId(id) {
  localStorage.setItem(CLIENT_ID_KEY, id);
}

export function isLoggedIn() {
  const tokens = getStoredTokens();
  return tokens !== null && !!getClientId();
}

function getStoredTokens() {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function storeTokens(data) {
  const tokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export async function getAccessToken() {
  const tokens = getStoredTokens();
  if (!tokens) return null;

  if (Date.now() > tokens.expires_at - 60_000) {
    const refreshed = await refreshAccessToken(tokens.refresh_token);
    if (!refreshed) {
      logout();
      return null;
    }
    return refreshed;
  }

  return tokens.access_token;
}

async function refreshAccessToken(refreshToken) {
  const clientId = getClientId();
  if (!clientId) return null;

  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    storeTokens({ ...data, refresh_token: data.refresh_token || refreshToken });
    return data.access_token;
  } catch {
    return null;
  }
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function generateCodeVerifier() {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function login() {
  const clientId = getClientId();
  if (!clientId) throw new Error('Client ID not set');

  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  localStorage.setItem(VERIFIER_KEY, verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const error = params.get('error');

  if (error) {
    window.history.replaceState({}, '', window.location.pathname);
    throw new Error(`Spotify auth error: ${error}`);
  }

  if (!code) return false;

  const verifier = localStorage.getItem(VERIFIER_KEY);
  const clientId = getClientId();

  if (!verifier || !clientId) {
    window.history.replaceState({}, '', window.location.pathname);
    return false;
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
      client_id: clientId,
      code_verifier: verifier,
    }),
  });

  window.history.replaceState({}, '', window.location.pathname);
  localStorage.removeItem(VERIFIER_KEY);

  if (!res.ok) {
    throw new Error('Token exchange failed');
  }

  const data = await res.json();
  storeTokens(data);
  return true;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(VERIFIER_KEY);
}
