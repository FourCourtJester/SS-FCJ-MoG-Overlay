import { Countdown, CountdownTo, Field, Panel, Row, Toggle } from '@single-studio/core/control'

// The screen between games. Back at and Back in write the same clock, so starting one
// replaces the other. Prefer Back at for a break that might be interrupted: a source
// that unloads when hidden restarts a length, but not a time of day.
//
// Slideshow swaps the video for the image library's slides/ group, if the video does
// not hold up in OBS.
export default function Standby() {
  return (
    <Panel title="Standby" collapsible>
      <Field name="standby.message" label="Message" placeholder="The march resumes shortly" />
      <Field name="standby.label" label="Clock label" placeholder="Back at" />
      <Row>
        <CountdownTo name="standby.resume" label="Back at" />
        <Countdown name="standby.resume" label="Back in" />
      </Row>
      <Row>
        <Toggle name="standby.slides" label="slideshow" />
      </Row>
    </Panel>
  )
}
