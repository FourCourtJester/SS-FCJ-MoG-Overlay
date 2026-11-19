import { Field, ImagePicker, Panel, ResetButton, Row, Stepper, SwapButton } from '@single-studio/core/control'

// Who is playing: blue on the left, red on the right, as the game draws its teams. The
// paths stay `left` and `right`, which is where each one sits on every screen. Swap and Clear sit in the
// header, reachable while the panel is folded; Clear leaves the series format alone,
// which is usually the same from one match to the next.
const SIDES = ['left.name', 'left.logo', 'left.wins', 'right.name', 'right.logo', 'right.wins']

export default function Teams() {
  return (
    <Panel
      title="Teams"
      collapsible
      actions={
        <>
          <SwapButton label="Swap sides" names={SIDES} size="sm" />
          <ResetButton label="teams" names={SIDES} size="sm" />
        </>
      }
    >
      <Row>
        <Field name="left.name" label="Blue" placeholder="Blue team" />
        <ImagePicker name="left.logo" label="Blue logo" />
        <Stepper name="left.wins" label="Blue wins" className="sm:col-auto" />
      </Row>
      <Row>
        <Field name="right.name" label="Red" placeholder="Red team" />
        <ImagePicker name="right.logo" label="Red logo" />
        <Stepper name="right.wins" label="Red wins" className="sm:col-auto" />
      </Row>
    </Panel>
  )
}
