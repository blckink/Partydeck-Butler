first rough draft.. not working yet and not styled etc 😅

# Partydeck Butler

Partydeck Butler is a browser-based tool that assembles PartyDeck handler packages (`.pdh`) from public game metadata. The application runs entirely in the browser and can be hosted via GitHub Pages.

## Usage
1. Open `index.html` locally or through the repository's GitHub Pages site.
2. Enter a game name and choose the target platform.
3. Click **Generate** to download a `.pdh` file containing `handler.json` and a Steam icon.

The tool queries Steam and PCGamingWiki for available information and applies simple heuristics for handler configuration.

## Development
This project consists only of static files. No build step is required.
Run `npm test` if test scripts are added; currently there are no automated tests.
