# No Molestar

Stardew Valley Pinky tones YouTube music player built with Electron.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (included with Node.js)
- A [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com) key

## Installation

```bash
git clone <repository-url>
cd no-molestar
npm install
```

## Running the App

### Development mode (with DevTools)

```bash
npm run dev
```

### Production mode

```bash
npm start
```

On first launch, a setup wizard will prompt you for your YouTube API key. The key is stored locally using Electron's `safeStorage` (encrypted at rest when available).

## Building Distributables

Build for your current platform:

```bash
npm run build
```

Build for a specific platform:

```bash
npm run build:win     # Windows (NSIS installer)
npm run build:mac     # macOS (DMG + ZIP)
npm run build:linux   # Linux (AppImage + DEB)
```

Build output is written to the `dist/` directory.

## Project Structure

```
src/
├── main/             # Electron main process
│   ├── main.js       # App entry point and window creation
│   ├── ipc-handlers.js  # IPC channel handlers
│   └── config-store.js  # Encrypted API key storage
├── preload/          # Preload scripts (context bridge)
│   ├── preload.js
│   └── webview-preload.js
└── renderer/         # Frontend (HTML/CSS/JS)
    ├── index.html
    ├── css/          # Styles (CRT effects, animations, components)
    ├── js/           # Application logic, components, player, visualizer
    └── assets/       # Fonts
```
