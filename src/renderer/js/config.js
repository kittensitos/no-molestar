let cachedKey = null;

export async function getApiKey() {
  if (cachedKey) return cachedKey;
  cachedKey = await window.noMolestar.config.getApiKey();
  return cachedKey;
}

export async function setApiKey(key) {
  await window.noMolestar.config.setApiKey(key);
  cachedKey = key;
}

export async function hasApiKey() {
  return window.noMolestar.config.hasApiKey();
}

export async function clearApiKey() {
  await window.noMolestar.config.clearApiKey();
  cachedKey = null;
}
