import { Field, Panel, Row, SwapButton } from '@single-studio/core/control'

// Who is on camera, left and right as the viewer sees them. The solo camera shows
// whoever is in the left seat.
const SEATS = ['cam.left.name', 'cam.left.social', 'cam.right.name', 'cam.right.social']

export default function Cams() {
  return (
    <Panel title="Webcams" collapsible actions={<SwapButton label="Swap sides" names={SEATS} size="sm" />}>
      <Row>
        <Field name="cam.left.name" label="Left" placeholder="Commentator" />
        <Field name="cam.left.social" label="Left handle" placeholder="@handle" />
      </Row>
      <Row>
        <Field name="cam.right.name" label="Right" placeholder="Commentator" />
        <Field name="cam.right.social" label="Right handle" placeholder="@handle" />
      </Row>
    </Panel>
  )
}
