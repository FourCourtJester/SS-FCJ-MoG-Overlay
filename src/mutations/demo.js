// Sample data, for looking at the graphics before there is a show to fill them. The
// board offers it in development only (src/control/panels/Sample.jsx).

import { urlAssets } from '@single-studio/core/worker'

import ironVanguard from '../assets/sample/iron-vanguard.svg?no-inline'
import ossuaryBoys from '../assets/sample/ossuary-boys.svg?no-inline'
import sampleCup from '../assets/sample/sample-cup.svg?no-inline'
import sampleCupWide from '../assets/sample/sample-cup-wide.svg?no-inline'

// The sample teams' and tournament's logos (src/assets/sample/, drawn for this, not real
// teams'), filed in the image store under sample/ as an operator's would be, and chosen the
// way the board's image pickers choose them: `asset:<key>`. URL entries, so every machine
// in the room shows them with nothing to copy. Absolute, since the store is read from pages
// at other addresses than this worker's.
const absolute = (url) => new URL(url, self.location.href).href
const LOGOS = [
  { key: 'sample/iron-vanguard', url: absolute(ironVanguard), name: 'Iron Vanguard' },
  { key: 'sample/ossuary-boys', url: absolute(ossuaryBoys), name: 'The Ossuary Boys' },
  { key: 'sample/sample-cup', url: absolute(sampleCup), name: 'Sample Cup' },
  { key: 'sample/sample-cup-wide', url: absolute(sampleCupWide), name: 'Sample Cup (wide)' },
]

export const demo = {
  /**
   * Fill every graphic with a plausible match. Overwrites what is there. `{ logos: false }`
   * leaves the tournament with a name and no logo, as an open beta's will mostly be.
   *
   * `mutate('demo:fill')`, `mutate('demo:fill', { logos: false })`
   */
  'demo:fill'(ctx, { logos = true } = {}) {
    ctx.set(urlAssets(LOGOS))
    ctx.write([
      ['variables.left.name', 'Iron Vanguard'],
      ['variables.left.logo', 'asset:sample/iron-vanguard'],
      ['variables.left.wins', '1'],
      ['variables.right.name', 'The Ossuary Boys'],
      ['variables.right.logo', 'asset:sample/ossuary-boys'],
      ['variables.right.wins', '2'],
      ['variables.match.round', 'Grand Final'],
      ['variables.match.bestof', '5'],
      ['variables.standby.message', 'The march resumes shortly'],
      ['variables.standby.label', 'Back in'],
      ['variables.cam.left.name', 'Shaun'],
      ['variables.cam.left.social', '@fourcourtjester'],
      ['variables.cam.right.name', 'Co-caster'],
      ['variables.cam.right.social', '@cocaster'],
      ['variables.draft.left.picks', ['kragg', 'solace', 'wolfgang', 'oriane']],
      ['variables.draft.right.picks', ['voidmaster', 'elaris', 'dreadnought', 'pandemos']],
      ['variables.draft.left.ban1', 'malgrove'],
      ['variables.draft.left.ban2', 'stratus'],
      ['variables.draft.right.ban1', 'strykka'],
      ['variables.draft.right.ban2', 'flint'],
      ['variables.victory.winner', 'right'],
      ['variables.event.name', 'Sample Cup'],
      ['variables.event.logo', logos ? 'asset:sample/sample-cup' : null],
      ['variables.event.logo_wide', logos ? 'asset:sample/sample-cup-wide' : null],
      ['toggles.show.tournament', true],
    ])
    ctx.run('timer', { 'timers.standby.resume': 8 * 60_000 })
  },
}
