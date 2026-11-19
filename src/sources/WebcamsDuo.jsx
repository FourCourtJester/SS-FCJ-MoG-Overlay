import { Scene } from '@single-studio/core/source'

import CamWindow, { wantsFill } from '../components/CamWindow'
import { WINDOWS } from '../components/windows'
import '../components/webcams.css'

// Two cameras side by side: #/source/webcams-duo, 1920 x 1080, transparent. Was Webcams
// (#/source/webcams) until 2026-11-17; an OBS set up before then needs its URL changed.
//
// Each window is 848 x 477 (16:9), 80px apart, centred across the canvas and 5px above centre down it - clear of
// Standby's plates above and the matchup below, so the three stack. Where they are, and
// the mask each camera takes in OBS, is ../components/windows.js, which Help reads too.
// Add ?fill to the URL to see the windows with no cameras under them.
export default function WebcamsDuo() {
  const fill = wantsFill()
  return (
    <Scene width={1920} height={1080} className="relative">
      <CamWindow seat="left" window={WINDOWS.camLeft} fill={fill} />
      <CamWindow seat="right" window={WINDOWS.camRight} fill={fill} />
    </Scene>
  )
}
