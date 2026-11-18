import { BoardBar, PanelJump } from '@single-studio/core/control'

import Cams from './panels/Cams'
import Draft from './panels/Draft'
import Help from './panels/Help'
import Match from './panels/Match'
import Sample from './panels/Sample'
import Standby from './panels/Standby'
import Teams from './panels/Teams'
import Tournament from './panels/Tournament'
import ScoreBar from './ScoreBar'

// The operator's board for March of Giants.
//
// Panels in the running order of a show, as FCJ Heroes settled on: you come up on
// Standby, you are on the Webcams, then the Draft, and the Match and Teams around the
// game itself; who won, for the Victory scene, is in Match. Buttons write immediately;
// anything typed stages until you save.
export default function Control() {
  return (
    <>
      {/* full width once the bar is two lines (index.css: .mog-jump) */}
      <BoardBar className="mog-jump-group">
        <PanelJump className="mog-jump" />
      </BoardBar>
      <ScoreBar />
      {/* first: where a new operator starts, folded for everyone else */}
      <Help />
      {import.meta.env.DEV ? <Sample /> : null}
      <Standby />
      <Cams />
      <Draft />
      <Match />
      <Teams />
      {/* set once at the start of a show, so after what changes during one */}
      <Tournament />
    </>
  )
}
