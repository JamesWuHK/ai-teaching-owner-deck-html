import fs from 'node:fs';
import path from 'node:path';

import {renderDeck} from './src/render-deck.mjs';
import {deckTitle, slides} from './src/slides-data.mjs';

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname));
const themePath = path.join(rootDir, 'theme.css');
const outPath = path.join(rootDir, 'index.html');

const cssText = fs.readFileSync(themePath, 'utf8');
const runtimeScript = `
  const printButton = document.getElementById('print-deck');
  if (printButton) {
    printButton.addEventListener('click', () => window.print());
  }
`;

const html = renderDeck({
  deckTitle,
  slides,
  cssText,
  runtimeScript,
});

fs.writeFileSync(outPath, html, 'utf8');
console.log(`Wrote ${outPath}`);
