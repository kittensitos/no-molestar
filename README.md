# No Molestar

Retro-futuristic Spotify web player with a pink CRT aesthetic, built with vanilla JS and Vite.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (included with Node.js)
- A [Spotify Developer](https://developer.spotify.com/dashboard) application (Client ID)
- A Spotify Premium account (required for the Web Playback SDK)

## Installation

```bash
git clone <repository-url>
cd no-molestar-1
npm install
```

## Running the App

### Development mode

```bash
npm run dev
```

### Production build

```bash
npm run build
npm run preview
```

On first launch, a setup wizard will prompt you for your Spotify Client ID. Authentication uses the PKCE authorization flow — no client secret needed.

## Features

- Spotify playback via the Web Playback SDK
- Search tracks directly from Spotify's catalog
- Queue management (add, reorder, skip)
- Audio visualizer
- Keyboard shortcuts (Space to play/pause, arrows to seek/skip, up/down for volume)
- CRT scanline overlay and retro pixel fonts

## Project Structure

```
src/renderer/
├── index.html
├── css/
│   ├── variables.css      # Pink/retro theme tokens
│   ├── base.css           # Layout and typography
│   ├── crt-effects.css    # Scanline and glow overlays
│   ├── components.css     # UI component styles
│   ├── animations.css     # Transitions and keyframes
│   └── setup-wizard.css   # Auth setup flow
├── js/
│   ├── app.js             # Entry point and keyboard shortcuts
│   ├── state.js           # Reactive state store
│   ├── spotify-auth.js    # PKCE OAuth flow
│   ├── spotify-api.js     # Spotify Web API calls
│   ├── spotify-player.js  # Web Playback SDK integration
│   ├── queue-manager.js   # Playback queue logic
│   ├── visualizer.js      # Canvas audio visualizer
│   ├── config.js          # App configuration
│   └── components/
│       ├── setup-wizard.js
│       ├── search-bar.js
│       ├── now-playing.js
│       ├── player-controls.js
│       ├── queue-panel.js
│       ├── track-item.js
│       └── toast.js
└── assets/fonts/
```
