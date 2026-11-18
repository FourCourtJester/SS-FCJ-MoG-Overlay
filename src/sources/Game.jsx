import { useVelcroState, useVelcroValue } from '@single-studio/core'
import { Image, Scene, Variable } from '@single-studio/core/source'

import TeamLogo from '../components/TeamLogo'
import './game.css'

// Over a live match: #/source/game, 1920 x 1080, transparent, over the game capture.
//
// The game's own team bar takes the top centre (x ~490-1430: portraits, gold, kills, the
// clock) and its kill feed hangs under it, so the teams go in the two free corners either
// side: logo, name and series score, blue top left and red top right, each score beside
// the game's own panel for that team. Measured off the beta (user's footage, 2026-11-17);
// the bottom is no place for anything, since selecting a giant fills its middle and the
// minimap its right.
function Corner({ side }) {
  return (
    <div className={`mog-game-corner ${side}`}>
      <div className="mog-game-brush mog-plate mog-brushed" />
      <div className="mog-game-logo">
        <TeamLogo side={side} className="mog-game-logo-img" />
      </div>
      <Variable className="mog-game-name mog-type" name={`${side}.name`} fallback={side === 'left' ? 'Blue team' : 'Red team'} fit />
      <div className="mog-game-score">
        <div className="mog-game-swatch mog-swatch" />
        <Variable className="mog-type" name={`${side}.wins`} fallback="0" transition="number" />
      </div>
    </div>
  )
}

// The tournament's logo, in a piece cut to fill the gap under the game's own centre panel
// (user, 2026-11-17: "makes it look more contiguous"): the panel's colour, flush with its
// bottom edge, its sides following the blue and red panels' inner edges exactly, and its
// bottom level with theirs, so the three read as one bar.
//
// TRACED, NOT DRAWN, off the beta (user's footage, 2026-11-17; the same in three captures):
// the blue panel's innermost blue pixel, row by row. Its edge is a curve - in from x 837 at
// the top to a tip at 857 by y 48, then back out to 841 - and red's is its mirror about
// x 960 (1063 at the tip). The centre panel ends at y 48, the team panels at y 93. The
// clock's digits (x 937-976, y 44-51) overhang the panel by 3px onto the map, so the piece
// is notched round them and no wider: a wider notch showed the map beside them.
// A build that moves the game's bar needs these traced again.
//
// It fades in rather than sliding: anything moving up there would pass over the clock.
const BLUE_EDGE = [
  [48, 857],
  [51, 855],
  [54, 853],
  [57, 852],
  [60, 851],
  [63, 851],
  [66, 849],
  [69, 849],
  [72, 847],
  [75, 846],
  [78, 845],
  [81, 844],
  [84, 843],
  [87, 843],
  [90, 841],
  [94, 841],
]
const CLOCK = { left: 935, right: 978, bottom: 53 }
const PANEL_BOTTOM = 48

// the outline, clockwise from the blue tip: along the panel's bottom with the clock's notch,
// down red's edge (blue's mirrored), back along the bottom, up blue's edge
const CREST = (() => {
  const blue = BLUE_EDGE.map(([y, x]) => [x + 0.5, y])
  const red = BLUE_EDGE.map(([y, x]) => [1920 - x - 0.5, y])
  const top = [
    [CLOCK.left, PANEL_BOTTOM],
    [CLOCK.left, CLOCK.bottom],
    [CLOCK.right, CLOCK.bottom],
    [CLOCK.right, PANEL_BOTTOM],
  ]
  const points = [blue[0], ...top, ...red, ...blue.slice().reverse()]
  return `polygon(${points.map(([x, y]) => `${x}px ${y}px`).join(', ')})`
})()

// What the piece shows: the WIDE logo while the board's Show Logo is on, else the
// tournament's name in Libre Baskerville capitals (user, 2026-11-17), else nothing at all.
//
// HIDE LOGO MEANS "USE THE NAME", not "hide the piece" (user, 2026-11-17): the switch is about
// the logo, and the piece stays up with the name in it, as every other screen keeps its
// matchup and shows the knot. Only with neither a logo to show nor a name is there no piece.
//
// The square logo is left out here (user, 2026-11-17): in a strip 33px tall it would be a
// postage stamp, where the name reads. An open beta's tournaments will mostly have no logo
// at all, so the name is the usual case.
function Tournament() {
  const shown = useVelcroValue('toggles.show.tournament')
  const logo = useVelcroValue('variables.event.logo_wide')
  const name = useVelcroValue('variables.event.name')
  const wide = shown ? logo : null
  if (!wide && !name) return null
  return (
    <div className="mog-game-crest" style={{ clipPath: CREST }}>
      {/* worn like the game's panel above it (user, 2026-11-17): faint mottling, and two of
          the kit's hairline strokes as scratches */}
      <div className="mog-game-crest-mottle" />
      <div className="mog-game-crest-scratch one" />
      <div className="mog-game-crest-scratch two" />
      {wide ? <Image value={wide} fit="contain" className="mog-game-crest-logo" /> : <Variable className="mog-game-crest-name" name="event.name" fit />}
    </div>
  )
}

// The tournament's tabs, stacked on the minimap (user, 2026-11-17): the round in orange
// over the series in dark grey - the Match panel's Round and Series, which the matchup's
// banner shows too, rather than fields of their own. They sit on the strip of objective
// timers along the minimap's top (y 773-805 in the beta), the same width as it. A blank one
// is not drawn; with both blank there is nothing.
//
// THEY RISE ONE AT A TIME, THE LOWER FIRST (user, 2026-11-17): the grey up out of the
// minimap, then the orange up out of the grey. Each rises within a slot of its own that
// clips it, so the orange never shows through the see-through grey on its way up.
// when the first starts, and how long after it the next
const TABS_AT = 1
const TABS_STAGGER = 0.35

function Tabs() {
  const round = useVelcroState('variables.match.round')
  const bestOf = useVelcroState('variables.match.bestof')
  if (!round.loaded || !bestOf.loaded) return null
  const shown = [
    // the round as a Variable, so a long one shrinks to fit the tab
    round.value ? { tab: 'upper', text: <Variable className="mog-type" name="match.round" fit /> } : null,
    bestOf.value ? { tab: 'lower', text: <span className="mog-type">Best of {bestOf.value}</span> } : null,
  ].filter(Boolean)
  if (!shown.length) return null
  return (
    <div className="mog-game-tabs">
      <div className="mog-game-tabs-stack">
        {shown.map(({ tab, text }, i) => (
          // the bottom one is first: counted up from the bottom of the stack
          <div key={tab} className="mog-game-tab-slot" style={{ '--delay': `${TABS_AT + (shown.length - 1 - i) * TABS_STAGGER}s` }}>
            <div className={`mog-game-tab ${tab}`}>{text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Game() {
  return (
    <Scene width={1920} height={1080} className="relative">
      <Corner side="left" />
      <Corner side="right" />
      <Tournament />
      <Tabs />
    </Scene>
  )
}
