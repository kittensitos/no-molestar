import { getClientId, isLoggedIn } from './spotify-auth.js';

export async function getApiKey() {
  return getClientId();
}

export async function hasApiKey() {
  return isLoggedIn();
}
