import { useVelcroMutate, useVelcroValue } from '@single-studio/core'
import { ImageSelect, Panel, ResetButton } from '@single-studio/core/control'

import { GIANTS, portraitOf } from '../../components/giants'

// The draft, entered as it happens: each side's picks by portrait, numbered in the order
// they are clicked, and its bans from two dropdowns. The Draft scene fills its eight slices
// from the picks in that order, and shows the bans in its bottom corners; Victory stands
// the winners' picks up.
//
// Four picks a side. Two bans a side: the game has none yet, but planned for (user,
// 2026-11-18); with none entered, the scene shows none. Bans are two plain dropdowns, not
// a second grid of portraits (user, 2026-11-18): a ban is one name, and a grid that big
// for two of them was more board than it was worth.
//
// Alphabetical, for finding one by name mid-draft (user, 2026-11-17); GIANTS itself stays
// in the game's roster order.
const TILES = GIANTS.map(({ slug, name }) => ({ label: name, value: slug, image: portraitOf(slug) })).sort((a, b) => a.label.localeCompare(b.label))

// Reset clears the draft and who won with it (user, 2026-11-17): a new draft is a new
// game, and the last game's winner standing over this game's picks would be wrong.
const RESET = ['draft.left.picks', 'draft.right.picks', 'draft.left.ban1', 'draft.left.ban2', 'draft.right.ban1', 'draft.right.ban2', 'victory.winner']

const BANS = ['draft.left.ban1', 'draft.left.ban2', 'draft.right.ban1', 'draft.right.ban2']
const toList = (value) => (Array.isArray(value) ? value : typeof value === 'string' && value ? value.split(',') : [])

// What is taken: every ban, and each side's picks.
function useTaken() {
  const bans = [
    useVelcroValue(`variables.${BANS[0]}`),
    useVelcroValue(`variables.${BANS[1]}`),
    useVelcroValue(`variables.${BANS[2]}`),
    useVelcroValue(`variables.${BANS[3]}`),
  ]
  const left = toList(useVelcroValue('variables.draft.left.picks'))
  const right = toList(useVelcroValue('variables.draft.right.picks'))
  return { bans: Object.fromEntries(BANS.map((name, i) => [name, bans[i]])), picks: { left, right } }
}

// A ban. WRITES AT ONCE, unlike the studio's own Select, which waits for Save: the picks
// beside it write on the click, and in the middle of a draft a ban that sat unsaved while
// the picks went to air would be missed. Styled as the studio's Select, so it sits on the
// same line. Choosing the empty entry clears it ('' deletes the path).
//
// It offers only giants still free: none banned in another dropdown, none already picked
// (user, 2026-11-18). Its own choice always stays on the list.
function Ban({ name, label, taken }) {
  const value = useVelcroValue(`variables.${name}`)
  const gone = new Set([
    ...Object.entries(taken.bans)
      .filter(([other]) => other !== name)
      .map(([, slug]) => slug),
    ...taken.picks.left,
    ...taken.picks.right,
  ])
  const options = TILES.filter((tile) => tile.value === value || !gone.has(tile.value))
  const mutate = useVelcroMutate()
  return (
    <label className="ss-select flex flex-col gap-1">
      <span className="ss-label flex h-4 min-w-0 items-center text-xs font-medium tracking-wide text-slate-400 uppercase">
        <span className="truncate">{label}</span>
      </span>
      <select
        value={value ?? ''}
        onChange={(event) => mutate('set', { [`variables.${name}`]: event.target.value })}
        className="ss-select-arrow h-[var(--ss-input-h,2.5rem)] rounded-md border border-slate-700 bg-slate-900 py-1 pr-7 pl-3 text-slate-100 transition-colors outline-none focus:border-sky-500"
      >
        <option value="">— none —</option>
        {options.map(({ label: giant, value: slug }) => (
          <option key={slug} value={slug}>
            {giant}
          </option>
        ))}
      </select>
    </label>
  )
}

// One side: its two bans, side by side from the bar's two-line point (index.css:
// .mog-ban-pair), then its picks (user, 2026-11-18: bans above, as they come
// first in a draft), in a frame of its colour (index.css: .mog-picks) -
// an even grid of tiles, fewer to a row as the board narrows.
//
// EACH GIANT ONCE A DRAFT (user, 2026-11-18): a banned giant leaves both sides' grids, and
// one side's pick leaves the other's. One already picked on this side always stays, so a
// pick made before a ban can still be taken back.
function Side({ side, label, taken }) {
  const other = side === 'left' ? 'right' : 'left'
  const gone = new Set([...Object.values(taken.bans), ...taken.picks[other]])
  const picks = TILES.filter((tile) => !gone.has(tile.value) || taken.picks[side].includes(tile.value))
  return (
    <div className={`mog-picks ${side === 'left' ? 'blue' : 'red'} flex flex-col gap-3`}>
      <div className="mog-ban-pair">
        <Ban name={`draft.${side}.ban1`} label={`${label} ban 1`} taken={taken} />
        <Ban name={`draft.${side}.ban2`} label={`${label} ban 2`} taken={taken} />
      </div>
      <ImageSelect name={`draft.${side}.picks`} label={`${label} picks`} options={picks} multiple max={4} size="sm" />
    </div>
  )
}

// Who picks first (user, 2026-11-18): blue, as the game does, unless a tournament's custom
// game options give it to red. Writes at once, as a ban does. Red is stored as 'right';
// blue clears the path ('' deletes it), so an untouched studio is blue first. Not cleared by
// Reset draft: it is the event's setting, not this game's.
function FirstPick() {
  const value = useVelcroValue('variables.draft.first')
  const mutate = useVelcroMutate()
  return (
    <label className="ss-select flex flex-col gap-1">
      <span className="ss-label flex h-4 min-w-0 items-center text-xs font-medium tracking-wide text-slate-400 uppercase">
        <span className="truncate">First pick</span>
      </span>
      <select
        value={value === 'right' ? 'right' : ''}
        onChange={(event) => mutate('set', { 'variables.draft.first': event.target.value })}
        className="ss-select-arrow h-[var(--ss-input-h,2.5rem)] rounded-md border border-slate-700 bg-slate-900 py-1 pr-7 pl-3 text-slate-100 transition-colors outline-none focus:border-sky-500"
      >
        <option value="">Blue</option>
        <option value="right">Red</option>
      </select>
    </label>
  )
}

export default function Draft() {
  const taken = useTaken()
  return (
    <Panel title="Draft" collapsible actions={<ResetButton label="draft" names={RESET} size="sm" />}>
      <FirstPick />
      <Side side="left" label="Blue" taken={taken} />
      <Side side="right" label="Red" taken={taken} />
    </Panel>
  )
}
