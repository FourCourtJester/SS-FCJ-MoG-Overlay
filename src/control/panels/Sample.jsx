import { useVelcroMutate } from '@single-studio/core'
import { Panel, Row } from '@single-studio/core/control'

const BUTTON = 'rounded bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-600'

// Development only: fill every graphic with a made-up match, to look at them before
// there is a show. Overwrites what is there, so it never ships to the live board.
export default function Sample() {
  const mutate = useVelcroMutate()

  return (
    <Panel title="Sample data" collapsible>
      <Row>
        <button type="button" onClick={() => mutate('demo:fill')} className={BUTTON}>
          Fill with sample data
        </button>
        {/* an open beta's tournament: a name, and no logo */}
        <button type="button" onClick={() => mutate('demo:fill', { logos: false })} className={BUTTON}>
          Fill without tournament logos
        </button>
      </Row>
    </Panel>
  )
}
