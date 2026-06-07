import { setClientId, getClientId, login } from '../spotify-auth.js';
import * as state from '../state.js';

let container = null;
let currentStep = 0;

export function init(el) {
  container = el;
  currentStep = 0;
  render();
}

function render() {
  container.innerHTML = '';
  const steps = [renderWelcome, renderInstructions, renderClientIdInput, renderConnect];
  const stepEl = steps[currentStep]();
  container.appendChild(stepEl);
  container.appendChild(renderProgress());
}

function renderWelcome() {
  const step = document.createElement('div');
  step.className = 'wizard-step';
  step.innerHTML = `
    <h1>NO MOLESTAR</h1>
    <p>A retro-futuristic Spotify music player for your browser.<br>
    Let's get you set up — it only takes a minute.</p>
    <p style="margin-top:0.5em;opacity:0.7;font-size:0.85em;">Requires Spotify Premium for playback.</p>
    <button class="wizard-btn">GET STARTED</button>
  `;
  step.querySelector('button').addEventListener('click', () => {
    currentStep = 1;
    render();
  });
  return step;
}

function renderInstructions() {
  const step = document.createElement('div');
  step.className = 'wizard-step';
  step.innerHTML = `
    <h2>CREATE A SPOTIFY APP</h2>
    <div class="instructions">
      <ol>
        <li>Go to the <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener">Spotify Developer Dashboard</a></li>
        <li>Click <strong>"Create App"</strong></li>
        <li>Give it any name (e.g. "No Molestar")</li>
        <li>Set the <strong>Redirect URI</strong> to:<br>
          <code style="user-select:all;word-break:break-all;">${window.location.origin}${window.location.pathname}</code></li>
        <li>Under <strong>APIs used</strong>, check <strong>"Web Playback SDK"</strong> and <strong>"Web API"</strong></li>
        <li>Save, then copy the <strong>Client ID</strong> from the app settings</li>
      </ol>
    </div>
    <div class="wizard-buttons">
      <button class="wizard-btn secondary">BACK</button>
      <button class="wizard-btn">I HAVE MY CLIENT ID</button>
    </div>
  `;

  const buttons = step.querySelectorAll('button');
  buttons[0].addEventListener('click', () => {
    currentStep = 0;
    render();
  });
  buttons[1].addEventListener('click', () => {
    currentStep = 2;
    render();
  });

  return step;
}

function renderClientIdInput() {
  const step = document.createElement('div');
  step.className = 'wizard-step';
  step.innerHTML = `
    <h2>ENTER YOUR CLIENT ID</h2>
    <div class="wizard-input-group">
      <label>Spotify App Client ID</label>
      <input type="text" placeholder="e.g. a1b2c3d4e5f6..." spellcheck="false" autocomplete="off" />
      <div class="input-feedback"></div>
    </div>
    <div class="wizard-buttons">
      <button class="wizard-btn secondary">BACK</button>
      <button class="wizard-btn" disabled>NEXT</button>
    </div>
  `;

  const input = step.querySelector('input');
  const feedback = step.querySelector('.input-feedback');
  const buttons = step.querySelectorAll('button');
  const nextBtn = buttons[1];

  const existing = getClientId();
  if (existing) {
    input.value = existing;
    nextBtn.disabled = false;
  }

  input.addEventListener('input', () => {
    const val = input.value.trim();
    nextBtn.disabled = val.length < 10;
    input.classList.remove('error');
    feedback.textContent = '';
    feedback.className = 'input-feedback';
  });

  buttons[0].addEventListener('click', () => {
    currentStep = 1;
    render();
  });

  nextBtn.addEventListener('click', () => {
    const clientId = input.value.trim();
    if (clientId.length < 10) {
      input.classList.add('error');
      feedback.textContent = 'Client ID seems too short.';
      feedback.className = 'input-feedback error';
      return;
    }
    setClientId(clientId);
    currentStep = 3;
    render();
  });

  setTimeout(() => input.focus(), 100);
  return step;
}

function renderConnect() {
  const step = document.createElement('div');
  step.className = 'wizard-step';
  step.innerHTML = `
    <h2>CONNECT TO SPOTIFY</h2>
    <p>Click below to log in with your Spotify Premium account.<br>
    You'll be redirected to Spotify and back.</p>
    <button class="wizard-btn">CONNECT TO SPOTIFY</button>
    <div class="wizard-buttons" style="margin-top:1em;">
      <button class="wizard-btn secondary">BACK</button>
    </div>
  `;

  step.querySelector('.wizard-btn:not(.secondary)').addEventListener('click', async () => {
    try {
      await login();
    } catch (err) {
      const feedback = document.createElement('div');
      feedback.className = 'input-feedback error';
      feedback.textContent = err.message;
      step.appendChild(feedback);
    }
  });

  step.querySelector('.wizard-btn.secondary').addEventListener('click', () => {
    currentStep = 2;
    render();
  });

  return step;
}

function renderProgress() {
  const div = document.createElement('div');
  div.className = 'wizard-progress';
  for (let i = 0; i < 4; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    if (i === currentStep) dot.classList.add('active');
    else if (i < currentStep) dot.classList.add('done');
    div.appendChild(dot);
  }
  return div;
}
