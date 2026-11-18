// Writes the made-up tournament's logos for the sample data: src/assets/sample/sample-cup.svg
// (square) and sample-cup-wide.svg.
//
//   node scripts/sample-logos.mjs
//
// They are SVGs shown as images, and an image cannot use the page's fonts - an SVG in an
// <img> loads nothing from outside itself. They were set in Georgia, so they looked one way
// on Windows and another wherever Georgia is missing. So Libre Baskerville Bold, the face the
// Game scene sets the tournament's name in, is embedded in each (latin only: the text is
// ASCII), and they look the same everywhere. Edit the markup here, not the .svg files.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const FONT = readFileSync(join(ROOT, 'node_modules/@fontsource/libre-baskerville/files/libre-baskerville-latin-700-normal.woff2')).toString('base64')

const STYLE = `<style>@font-face{font-family:'LB';src:url(data:font/woff2;base64,${FONT}) format('woff2');font-weight:700}text{font-family:'LB';font-weight:700}</style>`

const SQUARE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <!-- A made-up tournament's square logo, for the studio's sample data.
       Written by scripts/sample-logos.mjs: edit that, not this. -->
  ${STYLE}
  <circle cx="100" cy="100" r="92" fill="#c9a25a"/>
  <circle cx="100" cy="100" r="78" fill="#1d1611"/>
  <text x="100" y="94" font-size="30" fill="#f2e7d2" text-anchor="middle" textLength="118" lengthAdjust="spacingAndGlyphs">SAMPLE</text>
  <text x="100" y="134" font-size="38" fill="#cf7629" text-anchor="middle">CUP</text>
</svg>
`

const WIDE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100">
  <!-- A made-up tournament's wide logo, for the studio's sample data.
       Written by scripts/sample-logos.mjs: edit that, not this. -->
  ${STYLE}
  <rect x="4" y="4" width="392" height="92" rx="10" fill="#1d1611" stroke="#c9a25a" stroke-width="6"/>
  <text x="200" y="64" font-size="40" fill="#f2e7d2" text-anchor="middle" textLength="308" lengthAdjust="spacingAndGlyphs">SAMPLE <tspan fill="#cf7629">CUP</tspan></text>
</svg>
`

writeFileSync(join(ROOT, 'src/assets/sample/sample-cup.svg'), SQUARE)
writeFileSync(join(ROOT, 'src/assets/sample/sample-cup-wide.svg'), WIDE)
console.log('wrote src/assets/sample/sample-cup.svg and sample-cup-wide.svg')
