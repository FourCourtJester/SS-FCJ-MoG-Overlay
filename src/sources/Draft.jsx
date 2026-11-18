import { useCallback, useEffect, useRef, useState } from 'react'
import { useVelcroState } from '@single-studio/core'
import { Scene } from '@single-studio/core/source'

import charge from '../assets/brand/charge-white.png'
import knot from '../assets/ornaments/knot.png'
import Embers from '../components/Embers'
import { giantOf, loopCropOf, loopOf, nameOf, portraitOf } from '../components/giants'
import Loop from '../components/Loop'
import './draft.css'

// The draft: #/source/draft, 1920 x 1080, full screen (user, 2026-11-18).
//
// EIGHT SLICES, four a side, each a giant's menu loop cut to a tall strip around the giant.
// They fill in pick order from the board's Draft panel, FROM THE MIDDLE OUTWARD (user,
// 2026-11-18): each side's first pick beside the middle, its last at the screen's edge.
// The two teams face each other - blue's loops are mirrored, as the game's face left. An empty slice waits in its side's colour, with the pick it
// is for: the game picks 1-2-2-2-1, so the side picking first has the 1st, 4th, 5th and
// 8th picks and the other the 2nd, 3rd, 6th and 7th. Blue picks first unless the board's
// First pick says red (`draft.first`; user, 2026-11-18: tournaments may set it).
//
// Each side's slices have its colour round them, a border and a soft glow inside, so a
// giant's side reads at a glance (user, 2026-11-18). Each side's bans sit in its bottom
// corner: the game has no bans yet, but two a side are planned for; with none entered,
// there is nothing there.
//
// THE MATCHUP IS NOT DRAWN HERE: lay the Matchup source over this one in OBS (user,
// 2026-11-18). Its band lands bottom-centre, 40px up, and this scene leaves that space
// for it - the darkened floor to sit on, the names above it, the bans either side.
//
// The loops are in git, each a 480-wide strip of the giant's menu loop (scripts/assets.sh);
// a giant without one shows its portrait instead.
//
// Set the browser source to shut down when not visible, so the picks wipe in again on
// every cut to it - or leave it running, and each pick wipes in as it is made.

// The slices: 235px wide, 4px apart, 16px down the middle. 8 x 235 + 6 x 4 + 16 = 1920.
const W = 235
const GAP = 4
// `slot` is the side's pick, 0 to 3; `out` how far from the middle it stands, the first
// pick nearest it
const left = (side, slot) => {
  const out = 3 - slot
  return side === 'left' ? out * (W + GAP) : 1920 - (out + 1) * W - out * GAP
}

// Which of the draft's eight picks each side's four are, in order, by who picks first
const FIRST_PICKS = [1, 4, 5, 8]
const SECOND_PICKS = [2, 3, 6, 7]
const pickNumbers = (first) => (first === 'right' ? { left: SECOND_PICKS, right: FIRST_PICKS } : { left: FIRST_PICKS, right: SECOND_PICKS })

// The draft's turns, 1-2-2-2-1, and which picks are up next: the rest of the turn holding
// the first pick not yet made. Counted from each side's own picks, so a side entered ahead
// of the other still marks the right slices.
const TURNS = [[1], [2, 3], [4, 5], [6, 7], [8]]
function nextPicks(picks, numbers) {
  const made = new Set([...numbers.left.slice(0, picks.left.length), ...numbers.right.slice(0, picks.right.length)])
  const turn = TURNS.find((numbers) => numbers.some((number) => !made.has(number))) ?? []
  return new Set(turn.filter((number) => !made.has(number)))
}

const toList = (value) => (Array.isArray(value) ? value : value ? [value] : [])

// EIGHT VIDEOS AT ONCE outrun the browser: it keeps six connections to a server, and a
// playing video holds one for as long as it plays, so the seventh and eighth never start -
// and the matchup's logos queue behind them too. So each loop is fetched whole first and
// played from memory, which hands its connection back once it is in. If the fetch fails,
// the loop is played from the server as usual.
function useWholeFile(src) {
  const [url, setUrl] = useState(null)
  useEffect(() => {
    if (!src) return undefined
    let gone = false
    let made = null
    fetch(src)
      .then((response) => (response.ok ? response.blob() : Promise.reject(response.status)))
      .then((blob) => {
        if (gone) return
        made = URL.createObjectURL(blob)
        setUrl(made)
      })
      .catch(() => !gone && setUrl(src))
    return () => {
      gone = true
      if (made) URL.revokeObjectURL(made)
    }
  }, [src])
  return url
}

// A giant's loop, slid across so the giant's head (`loopHead` in giants.js) is the slice's
// middle; or, with no loop, its portrait. The loop is a strip of the full frame
// (giants.js: LOOP_CROPS), so the head sits `loopCropOf` px less far into it. `onReady` once there is a picture: the loop
// playing, or the portrait loaded.
function Giant({ slug, onReady }) {
  const giant = giantOf(slug)
  const loop = useWholeFile(loopOf(slug))
  if (!loopOf(slug)) return <img className="mog-slice-portrait" src={portraitOf(slug)} alt="" onLoad={onReady} onError={onReady} />
  if (!loop) return null
  return (
    <div className="mog-slice-stage" style={{ left: W / 2 - ((giant?.loopHead?.[0] ?? giant?.x ?? 0.68) * 1920 - loopCropOf(slug)) }}>
      <Loop src={loop} instant onReady={onReady} />
    </div>
  )
}

// THE SCENE IS NEVER QUITE STILL (user, 2026-11-18): a full screen held through a whole
// draft wants something small moving, even before there is a giant in it. Two things, both
// quiet, either easy to take out:
// - every 15s each slice's inner glow swells and settles (draft.css: .mog-slice-frame::after),
//   rippling from the middle outward, the slices beside the middle first - as the picks go;
// - embers rise up each half in its side's colour, over the slices. Only its colour, and
//   never across the middle: red's stay on red, blue's on blue (user, 2026-11-18).
const PULSE_AT = 3 // the first swell, seconds after the scene is drawn
const PULSE_STEP = 0.18 // each slice out from the middle, that much later

// A SLICE OPENS WHEN ITS GIANT IS THERE TO SHOW (user, 2026-11-18). Picked, the giant is
// put in behind the slice's board and loads; only once its loop is playing does the board
// drop away DOWNWARD while the giant rises UP into place (draft.css). Until then the board
// stays, so a slice never opens on black. A loop that has not started in OPEN_WITHIN opens
// anyway.
//
// Every other slice the other way (user, 2026-11-18: "up or down", not all one way). On
// blue, counting out from the middle: down, up, down, up. Red the opposite way round, up,
// down, up, down (user, 2026-11-18), so each slot goes up on one side and down on the
// other: the outermost lifts up on blue and drops down on red (draft.css: .up).
//
// Taken back, it runs the other way: the board comes back over the giant, and only then
// is the giant let go. A different giant in its place goes the same way, then comes in.
const BOARD_MS = 700 // the board's travel (draft.css: .mog-slice-wait)
const OPEN_WITHIN = 5000

function Slice({ side, slot, slug, number, next, onOpen }) {
  const [shown, setShown] = useState(slug ?? null) // the giant behind the board
  const [ready, setReady] = useState(false) // its picture is there
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if ((slug ?? null) === shown) {
      setClosing(false)
      return undefined
    }
    // a giant on show: the board comes back over it before it goes
    if (shown && ready) {
      setClosing(true)
      const timer = setTimeout(() => {
        setShown(slug ?? null)
        setReady(false)
        setClosing(false)
      }, BOARD_MS)
      return () => clearTimeout(timer)
    }
    // nothing on show: change what is behind the board at once
    setShown(slug ?? null)
    setReady(false)
    return undefined
  }, [slug, shown, ready])

  // never held shut by a loop that will not start
  useEffect(() => {
    if (!shown || ready) return undefined
    const timer = setTimeout(() => setReady(true), OPEN_WITHIN)
    return () => clearTimeout(timer)
  }, [shown, ready])

  const open = Boolean(shown) && ready && !closing
  useEffect(() => {
    if (!open) return undefined
    onOpen(shown, true)
    return () => onOpen(shown, false)
  }, [open, shown, onOpen])

  const markReady = useCallback(() => setReady(true), [])

  return (
    <div
      className={`mog-slice ${side} ${open ? 'open' : 'shut'} ${(slot + (side === 'right' ? 1 : 0)) % 2 ? 'up' : 'down'}`}
      style={{ left: left(side, slot), width: W, '--slice-x': `${left(side, slot)}px`, '--pulse-at': `${PULSE_AT + slot * PULSE_STEP}s` }}
    >
      {shown ? (
        <div key={shown} className="mog-slice-giant">
          <Giant slug={shown} onReady={markReady} />
        </div>
      ) : null}
      <div className="mog-slice-wait">
        {/* the kit's knot over the picks up next (user, 2026-11-18; draft.css) */}
        {next ? <div className="mog-slice-next" style={{ '--icon': `url(${knot})` }} /> : null}
        <span className="mog-type">Pick {number}</span>
      </div>
      <div className="mog-slice-shade" />
      {shown ? (
        <div key={`name-${shown}`} className="mog-slice-name">
          <span className="mog-type">{nameOf(shown)}</span>
        </div>
      ) : null}
      <div className="mog-slice-frame" />
    </div>
  )
}

// A banned giant's head, from its portrait (`head` in giants.js), struck through.
const BAN = 96
function Ban({ slug }) {
  if (!slug) return <div className="mog-ban empty" />
  const giant = giantOf(slug)
  const [height, middle] = giant?.head ?? [190, 190]
  const scale = (BAN * 0.66) / height
  return (
    <div className="mog-ban">
      <img
        src={portraitOf(slug)}
        alt={nameOf(slug)}
        style={{ width: 768 * scale, left: BAN / 2 - 384 * scale, top: BAN / 2 - middle * scale - (giant?.banLift ?? 0) }}
      />
      <div className="mog-ban-strike" />
    </div>
  )
}

// Between the sides, the game's own charge-under-a-flag - its loading symbol - as the
// draft's "vs" (user, 2026-11-18): white, over a dark shadow, halfway down the slices above
// the matchup. It pops each time a giant is picked - keyed by how many have been, so each
// new pick draws it afresh and its pop plays again - and at the top of the pop it flashes
// the colour of the side that picked (user, 2026-11-18).
//
// Which side picked is whichever side's count went up. On first drawing, with nothing to
// compare against, it is the side whose turn it was in the game's 1-2-2-2-1 order. A pick
// taken away pops it in white.
const sideOfPick = (number, numbers) => (numbers.left.includes(number) ? 'left' : numbers.right.includes(number) ? 'right' : null)

//
// It pops as a giant APPEARS, not as it is picked, so it keeps time with the slice opening.
// While the scene first comes up (`hold`) it waits: the giants already picked open one by
// one as their loops load, and it pops once when they are all in, not once for each.
function Versus({ blue, red, numbers, hold }) {
  // worked out once per change of the counts, not on every drawing
  const last = useRef(null)
  if (hold)
    return (
      <div className="mog-draft-vs held">
        <img src={charge} alt="" />
      </div>
    )
  if (!last.current || last.current.blue !== blue || last.current.red !== red) {
    const was = last.current
    const side = !was ? sideOfPick(blue + red, numbers) : blue > was.blue ? 'left' : red > was.red ? 'right' : null
    last.current = { blue, red, side }
  }
  const { side } = last.current
  return (
    <div key={blue + red} className={`mog-draft-vs ${side ?? ''}`}>
      <img src={charge} alt="" />
      {side ? <div className="mog-draft-vs-tint" style={{ '--icon': `url(${charge})` }} /> : null}
    </div>
  )
}

function Bans({ side, bans }) {
  if (!bans.some(Boolean)) return null
  return (
    <div className={`mog-bans ${side}`}>
      <span className="mog-type">Bans</span>
      <div className="mog-bans-row">
        <Ban slug={bans[0]} />
        <Ban slug={bans[1]} />
      </div>
    </div>
  )
}

export default function Draft() {
  const blue = useVelcroState('variables.draft.left.picks')
  const red = useVelcroState('variables.draft.right.picks')
  const firstPick = useVelcroState('variables.draft.first')
  // two bans a side, each its own dropdown on the board, so each its own value: ban 2
  // alone shows in the second slot, the first left empty
  const bans = {
    left: [useVelcroState('variables.draft.left.ban1'), useVelcroState('variables.draft.left.ban2')],
    right: [useVelcroState('variables.draft.right.ban1'), useVelcroState('variables.draft.right.ban2')],
  }
  const loaded = [blue, red, firstPick, ...bans.left, ...bans.right].every((state) => state.loaded)

  // which giants are on show, their slices open, for the "vs"
  const [onShow, setOnShow] = useState(() => new Set())
  const onOpen = useCallback(
    (slug, on) =>
      setOnShow((was) => {
        if (was.has(slug) === on) return was
        const next = new Set(was)
        if (on) next.add(slug)
        else next.delete(slug)
        return next
      }),
    [],
  )
  // the picks there when the scene first came up, and a cap on waiting for them
  const first = useRef(null)
  const [waited, setWaited] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setWaited(true), OPEN_WITHIN)
    return () => clearTimeout(timer)
  }, [])

  if (!loaded) return null

  const picks = { left: toList(blue.value), right: toList(red.value) }
  if (!first.current) first.current = [...picks.left, ...picks.right]
  const hold = !waited && !first.current.every((slug) => onShow.has(slug))
  const shownCount = (side) => picks[side].filter((slug) => onShow.has(slug)).length
  const numbers = pickNumbers(firstPick.value)
  const next = nextPicks(picks, numbers)

  return (
    <Scene width={1920} height={1080}>
      <div className="mog-draft">
        {/* gold behind the slices: what shows in the gaps between them (draft.css) */}
        <div className="mog-draft-gold" />
        {['left', 'right'].map((side) =>
          [0, 1, 2, 3].map((slot) => (
            <Slice
              key={`${side}-${slot}`}
              side={side}
              slot={slot}
              slug={picks[side][slot]}
              number={numbers[side][slot]}
              next={next.has(numbers[side][slot])}
              onOpen={onOpen}
            />
          )),
        )}

        <Embers className="mog-draft-embers left" count={16} seed={0} team={1} />
        <Embers className="mog-draft-embers right" count={16} seed={100} team={1} />

        <Versus blue={shownCount('left')} red={shownCount('right')} numbers={numbers} hold={hold} />

        <div className="mog-draft-floor" />
        <Bans side="left" bans={bans.left.map((state) => state.value)} />
        <Bans side="right" bans={bans.right.map((state) => state.value)} />
      </div>
    </Scene>
  )
}
