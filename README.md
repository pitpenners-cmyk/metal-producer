# Metal Producer

A desktop app for crafting heavy, aggressive tracks inspired by metal, nu-metal, and rap-rock production.

## Features
- Dark-themed desktop UI
- Step sequencer for drums, bass, and lead
- Tempo, output, and drive controls
- Genre presets: nu-metal, metalcore, rap-rock, industrial
- Procedural synth sounds built with the Web Audio API

## Run it locally

1. Install dependencies:
   npm install
2. Start the app:
   npm start

## Project structure
- `main.js` — Electron app shell
- `preload.js` — secure preload bridge
- `index.html` — main window layout
- `styles.css` — metal-inspired UI styling
- `renderer.js` — audio sequencer and UI logic
