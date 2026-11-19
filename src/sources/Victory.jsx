import { useVelcroState, useVelcroValue } from '@single-studio/core'
import { useEffect, useState } from 'react'
import { Scene, Variable } from '@single-studio/core/source'

import sky from '../assets/backgrounds/sky.webp'
import knotRule from '../assets/ornaments/knot-rule.png'
import Embers from '../components/Embers'
import { BY_SIZE, giantOf, portraitOf } from '../components/giants'
import { useTeamLogos } from '../components/marks'
import TeamLogo from '../components/TeamLogo'
import './victory.css'

// The winners, after a game: #/source/victory, 1920 x 1080, full screen.
//
// The game has no score screen for observers (user, 2026-11-17), so this stands in for
// one: the winning side's four giants over the kit's storm, under a victory banner with
// the team's name, the whole thing washed in the side's colour.
//
// WHAT THE KIT GAVE US TO DO IT WITH. There is no landscape in the creator kit - every
// key art is the same ruined street with a giant painted in - so the backdrop is its one
// piece of open setting, a painted storm (Background_02), with the giants standing above
// it. And no giant comes whole: every cutout stops at the waist or the chest, and some are
// cut at the side too (Dreadnought's fist, Solace's bell). So they stand shoulder to
// shoulder like a team photograph, cut off by the bottom of the frame and sunk in mist,
// with their outer edges feathered: a crop that reads as framing rather than as a cut.
//
// THE MOVEMENT IS OURS, since the kit has none for this: the storm drifts, light turns
// slowly behind the giants, embers rise, and each giant breathes on its own clock.
//
// The data: `victory.winner` (left or right) from the board's Victory panel, and that
// side's picks, `draft.<side>.picks`, the giants in the order they were drafted. No
// winner, and it is only the storm.
//
// WHO STANDS WHERE is by size, not pick order (user, 2026-11-17): some giants are far
// bigger than others, and a hulk in front hides everyone. Every giant has a place in one
// ranking by size (BY_SIZE in components/giants.js). The four places, left to right, go
// BACK, FRONT, FRONT, BACK: the two slightest in the middle at the front - larger, lower,
// in full light - and the two biggest at the edges at the back: smaller, standing higher,
// a shade dimmer, behind. (Back, front, back, front was tried, user, 2026-11-17: it left
// the middle back giant boxed in by a front one either side, and leant the group right.)
// Within each pair, the earlier pick is the one further left.
//
// Set the browser source to shut down when not visible, so the entrance plays each time,
// and put an Image source under it in the scene: a still of this backdrop as it stands at
// its first frame, kept with the OBS setup rather than in the build. A fresh page is
// transparent until it paints, and without the still the scene shows black. The whole
// graphic fades in over it (victory.css).

// The four places, left to right, and the size of picture each starts from (see fit(),
// below, for how each giant is then sized and set). Change the order of `depth` here to
// try another arrangement.
const FRONT_PLACE = { size: 760 }
const BACK_PLACE = { size: 620 }
const PLACES = [
  { x: 400, depth: 'back' },
  { x: 770, depth: 'front' },
  { x: 1150, depth: 'front' },
  { x: 1520, depth: 'back' },
].map((place) => ({ ...place, ...(place.depth === 'front' ? FRONT_PLACE : BACK_PLACE) }))
// one giant alone stands in the middle
const ALONE = { x: 960, depth: 'front', ...FRONT_PLACE }

/** The picks, placed: the slightest two in the front places, the biggest two in the back. */
function arrange(picks) {
  // a giant missing from the ranking counts as middling; one that prefers a row (`prefer`
  // in giants.js) ranks ahead of every giant that does not, at that end
  const PREFER = { front: -BY_SIZE.length, back: BY_SIZE.length }
  const rank = (slug) => {
    const size = BY_SIZE.includes(slug) ? BY_SIZE.indexOf(slug) : BY_SIZE.length / 2
    return size + (PREFER[giantOf(slug)?.prefer] ?? 0)
  }
  const ranked = picks.map((slug, order) => ({ slug, order, size: rank(slug) })).sort((a, b) => a.size - b.size || a.order - b.order)
  const byOrder = (a, b) => a.order - b.order
  const front = ranked.slice(0, 2).sort(byOrder)
  const back = ranked.slice(2).sort(byOrder)
  if (picks.length === 1) return [{ ...front[0], depth: 'front', place: ALONE, entry: 0 }]
  const places = (depth) => PLACES.filter((place) => place.depth === depth)
  // the front pair rises first, then the back
  return [
    ...front.map((giant, i) => ({ ...giant, depth: 'front', place: places('front')[i], entry: i })),
    ...back.map((giant, i) => ({ ...giant, depth: 'back', place: places('back')[i], entry: 2 + i })),
  ]
}

// Whether the storm has arrived. The page is new on every cut to it (see above), so the
// picture is fetched each time, and the fade-in would otherwise open on bare ink with the
// storm landing part-way through. A failed load still lets the graphic in.
function useSky() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let live = true
    const image = new Image()
    image.src = sky
    image
      .decode()
      .catch(() => {})
      .then(() => live && setReady(true))
    return () => {
      live = false
    }
  }, [])
  return ready
}

const toList = (value) => (Array.isArray(value) ? value : value ? [value] : [])

// The front pair rises first, then the back.
// EVERY HEAD TO ONE SIZE AND ONE HEIGHT, so far as the cutouts allow (user, 2026-11-17).
// The kit framed each portrait its own way, so a giant's picture is sized to bring its head
// (`head` in components/giants.js) to its depth's head size, and set so its head's middle
// is at that depth's height - the back pair smaller and higher, as further off. Within
// limits: a picture grows or shrinks at most GROW from its place's size, and its bottom
// edge - where every cutout is cut off - never rises above HIGHEST, inside the mist.
const HEADS = { front: { size: 150, y: 600 }, back: { size: 120, y: 560 } }
const GROW = [0.8, 1.12]
const HIGHEST = 20
// where a giant with its feet in the picture stands (`feet` in giants.js): in the mist
const GROUND = 1052
const clamp = (value, low, high) => Math.min(Math.max(value, low), high)

function fit(slug, place) {
  const giant = giantOf(slug)
  const [height, middle] = giant?.head ?? [190, 190]
  const want = HEADS[place.depth]
  const size = clamp((want.size * 768) / height, place.size * GROW[0], place.size * GROW[1]) * (giant?.scale ?? 1)
  // a whole body stands on the ground; the rest are set by the head
  const bottom = giant?.feet ? 1080 - GROUND - (size * (768 - giant.feet)) / 768 : clamp(1080 - size * (1 - middle / 768) - want.y, -size / 3, HIGHEST)
  return { x: place.x, size, bottom, fade: giant?.fade ?? 0.07 }
}

function Giant({ slug, depth, place, entry, order }) {
  const src = portraitOf(slug)
  if (!src) return null
  const { x, size, bottom, fade } = fit(slug, place)
  return (
    <div
      className={`mog-victory-giant ${depth}`}
      style={{
        left: x - size / 2,
        bottom,
        width: size,
        height: size,
        '--fade': `${fade * 100}%`,
        '--rise-delay': `${0.35 + entry * 0.15}s`,
        '--breathe-delay': `${-order * 2.3}s`,
      }}
    >
      <img src={src} alt={giantOf(slug)?.name ?? ''} />
    </div>
  )
}

function Banner({ side }) {
  const logos = useTeamLogos()
  return (
    <div className="mog-victory-banner">
      <div className="mog-victory-word">
        <div className="mog-victory-word-stroke mog-stroke" />
        <span className="mog-type">Victory</span>
      </div>
      <img className="mog-victory-rule" src={knotRule} alt="" />
      <div className="mog-victory-team">
        {logos ? (
          <div className="mog-victory-team-logo">
            <div className="mog-victory-team-logo-back mog-plate" />
            <TeamLogo side={side} className="mog-victory-team-logo-img" />
          </div>
        ) : null}
        <div className="mog-victory-team-name">
          <Variable className="mog-type" name={`${side}.name`} fallback={side === 'left' ? 'Blue team' : 'Red team'} fit />
        </div>
      </div>
    </div>
  )
}

export default function Victory() {
  const { value: winner, loaded } = useVelcroState('variables.victory.winner')
  const side = winner === 'left' || winner === 'right' ? winner : null
  const picks = arrange(toList(useVelcroValue(`variables.draft.${side ?? 'left'}.picks`)).slice(0, 4))
  const skyReady = useSky()

  return (
    <Scene width={1920} height={1080}>
      {loaded && skyReady ? (
        <div className={`mog-victory ${side ?? 'none'}`}>
          <div className="mog-victory-sky" style={{ backgroundImage: `url(${sky})` }} />
          <div className="mog-victory-tint" />
          <div className="mog-victory-rays" />
          <div className="mog-victory-glow" />

          {/* keyed by the side, so a change of winner plays the entrance again */}
          {side ? (
            <div key={`giants-${side}`} className="mog-victory-giants">
              {picks.map((giant) => (
                <Giant key={`${giant.slug}-${giant.order}`} {...giant} />
              ))}
            </div>
          ) : null}

          <div className="mog-victory-mist" />
          <Embers className="mog-victory-embers" />

          {side ? <Banner key={`banner-${side}`} side={side} /> : null}
        </div>
      ) : null}
    </Scene>
  )
}
