import { Field, ImagePicker, Panel, Row, Toggle } from '@single-studio/core/control'

// The tournament: its name, and its logo two ways, a square one and a wide one. Was
// "Logos" until the name joined it (user, 2026-11-17).
//
// Each place on screen takes the logo shape it is drawn for and the other only if that is
// missing (components/marks.js), except the Game scene, which takes only the wide one. An open
// beta's tournaments may well have no logo at all, so the name is the fallback where the
// Game scene would show one; the matchup on the other screens falls back to the game's knot.
//
// The switch, "Show Tournament Logo" / "Hide Tournament Logo" (user, 2026-11-17; "Tournament"
// added 2026-11-18 to tell it from Team Logos), is about the logo alone, on every
// graphic at once. Hidden, each place shows its fallback instead: the knot between the
// matchup's scores, the tournament's name under Game's clock. Off until it is turned on, as
// in FCJ Heroes. Toggle writes "Show" or "Hide" in front of its label.
//
// "Team Logos" beside it (user, 2026-11-18) does the same for the teams' logos, set on the
// Teams panel: off, every place one goes drops it, backdrop and all (marks.js).
export default function Tournament() {
  return (
    <Panel title="Tournament" collapsible>
      <Field name="event.name" label="Tournament name" placeholder="Open Beta Cup" />
      <Row>
        <ImagePicker name="event.logo" label="Logo (square)" />
        <ImagePicker name="event.logo_wide" label="Logo (wide)" />
      </Row>
      <Row>
        <Toggle name="show.tournament" label="Tournament Logo" />
        <Toggle name="show.team_logos" label="Team Logos" />
      </Row>
    </Panel>
  )
}
