import { useVelcroMutate, useVelcroValue } from '@single-studio/core'
import { Field, Panel, Row, Select } from '@single-studio/core/control'

// What this match is: the round, and how long the series runs. Both go in the banner
// above the matchup, and in the Game scene's two tabs over the minimap - the round in
// orange, the series in grey.
//
// And who won the game, for the Victory scene: two toggles, here rather than in a panel of
// their own (user, 2026-11-17). Press the winner; press it again to clear. Writes at once,
// as a toggle does - it is set as the game ends, not staged with the text fields.

const BUTTON = 'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors min-h-[var(--ss-input-h,2.5rem)]'
const OFF = 'border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
const ON = { left: 'bg-sky-600 text-white hover:bg-sky-500', right: 'bg-red-600 text-white hover:bg-red-500' }

function Winner() {
  const winner = useVelcroValue('variables.victory.winner')
  const mutate = useVelcroMutate()
  // '' rather than null: a value that means nothing deletes the path, so the scene clears
  const press = (side) => mutate('set', { 'variables.victory.winner': winner === side ? '' : side })

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium tracking-wide text-slate-400 uppercase">Victory</span>
      <div className="flex gap-2">
        {['left', 'right'].map((side) => (
          <button
            key={side}
            type="button"
            aria-pressed={winner === side}
            onClick={() => press(side)}
            className={`${BUTTON} ${winner === side ? ON[side] : OFF}`}
          >
            {side === 'left' ? 'Blue' : 'Red'} won
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Match() {
  return (
    <Panel title="Match" collapsible>
      <Row>
        <Field name="match.round" label="Round" placeholder="Grand Final" />
        <Select
          name="match.bestof"
          label="Series"
          options={[
            { label: 'Best of 1', value: '1' },
            { label: 'Best of 3', value: '3' },
            { label: 'Best of 5', value: '5' },
            { label: 'Best of 7', value: '7' },
          ]}
        />
      </Row>
      <Winner />
    </Panel>
  )
}
