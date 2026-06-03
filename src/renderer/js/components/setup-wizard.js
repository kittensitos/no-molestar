import { setApiKey } from '../config.js';
import { validateApiKey } from '../youtube-api.js';
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
  const steps = [renderWelcome, renderInstructions, renderKeyInput, renderDone];
  const stepEl = steps[currentStep]();
  container.appendChild(stepEl);
  container.appendChild(renderProgress());
}

function renderWelcome() {
  const step = document.createElement('div');
  step.className = 'wizard-step';
  step.innerHTML = `
    <h1>NO MOLESTAR</h1>
    <p>A retro-futuristic YouTube music player for your desktop.<br>
    Let's get you set up — it only takes a minute.</p>
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
    <h2>GET YOUR YOUTUBE API KEY</h2>
    <div class="instructions">
      <ol>
        <li>Go to <a href="#" data-url="https://console.cloud.google.com/apis/dashboard">Google Cloud Console</a></li>
        <li>Create a new project (or select an existing one)</li>
        <li>Search for <strong>"YouTube Data API v3"</strong> in the API Library and enable it</li>
        <li>Go to <a href="#" data-url="https://console.cloud.google.com/apis/credentials">Credentials</a> and click <strong>"Create Credentials" > "API Key"</strong></li>
        <li>Copy the generated API key</li>
      </ol>
    </div>
    <div class="wizard-buttons">
      <button class="wizard-btn secondary">BACK</button>
      <button class="wizard-btn">I HAVE MY KEY</button>
    </div>
  `;

  step.querySelectorAll('a[data-url]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(link.dataset.url, '_blank');
    });
  });

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

function renderKeyInput() {
  const step = document.createElement('div');
  step.className = 'wizard-step';
  step.innerHTML = `
    <h2>ENTER YOUR API KEY</h2>
    <div class="wizard-input-group">
      <label>YouTube Data API v3 Key</label>
      <input type="text" placeholder="AIza..." spellcheck="false" autocomplete="off" />
      <div class="input-feedback"></div>
    </div>
    <div class="wizard-buttons">
      <button class="wizard-btn secondary">BACK</button>
      <button class="wizard-btn" disabled>VALIDATE & SAVE</button>
    </div>
  `;

  const input = step.querySelector('input');
  const feedback = step.querySelector('.input-feedback');
  const buttons = step.querySelectorAll('button');
  const submitBtn = buttons[1];

  input.addEventListener('input', () => {
    const val = input.value.trim();
    submitBtn.disabled = val.length < 10;
    input.classList.remove('error', 'success');
    feedback.textContent = '';
    feedback.className = 'input-feedback';
  });

  buttons[0].addEventListener('click', () => {
    currentStep = 1;
    render();
  });

  submitBtn.addEventListener('click', async () => {
    const key = input.value.trim();
    submitBtn.disabled = true;
    submitBtn.textContent = 'VALIDATING...';
    input.classList.remove('error', 'success');
    feedback.textContent = '';

    const valid = await validateApiKey(key);

    if (valid) {
      await setApiKey(key);
      input.classList.add('success');
      feedback.textContent = 'API key is valid!';
      feedback.className = 'input-feedback success';
      setTimeout(() => {
        currentStep = 3;
        render();
      }, 800);
    } else {
      input.classList.add('error');
      feedback.textContent = 'Invalid API key. Please check and try again.';
      feedback.className = 'input-feedback error';
      submitBtn.disabled = false;
      submitBtn.textContent = 'VALIDATE & SAVE';
    }
  });

  setTimeout(() => input.focus(), 100);
  return step;
}

function renderDone() {
  const step = document.createElement('div');
  step.className = 'wizard-step';
  step.innerHTML = `
    <h1>YOU'RE ALL SET</h1>
    <p>Start searching for your favorite music and enjoy the vibes.</p>
    <button class="wizard-btn">START LISTENING</button>
  `;
  step.querySelector('button').addEventListener('click', () => {
    state.set('isSetupComplete', true);
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
