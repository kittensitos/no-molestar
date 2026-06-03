const { safeStorage } = require('electron');
const { app } = require('electron');
const fs = require('fs');
const path = require('path');

function getConfigPath() {
  return path.join(app.getPath('userData'), 'config.enc');
}

function getFallbackPath() {
  return path.join(app.getPath('userData'), 'config.json');
}

function getApiKey() {
  if (safeStorage.isEncryptionAvailable()) {
    const configPath = getConfigPath();
    if (!fs.existsSync(configPath)) return null;
    const encrypted = fs.readFileSync(configPath);
    return safeStorage.decryptString(encrypted);
  }
  const fallback = getFallbackPath();
  if (!fs.existsSync(fallback)) return null;
  const data = JSON.parse(fs.readFileSync(fallback, 'utf-8'));
  return data.apiKey || null;
}

function setApiKey(key) {
  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(key);
    fs.writeFileSync(getConfigPath(), encrypted);
  } else {
    fs.writeFileSync(getFallbackPath(), JSON.stringify({ apiKey: key }));
  }
}

function hasApiKey() {
  return getApiKey() !== null;
}

function clearApiKey() {
  const configPath = getConfigPath();
  const fallback = getFallbackPath();
  if (fs.existsSync(configPath)) fs.unlinkSync(configPath);
  if (fs.existsSync(fallback)) fs.unlinkSync(fallback);
}

module.exports = { getApiKey, setApiKey, hasApiKey, clearApiKey };
