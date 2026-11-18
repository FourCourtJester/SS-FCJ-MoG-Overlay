import { Scene } from '@single-studio/core/source'

import CamWindow, { wantsFill } from '../components/CamWindow'
import { WINDOWS } from '../components/windows'
import '../components/webcams.css'

// One camera, centred: #/source/webcam-solo, 1920 x 1080, transparent. Shows whoever is
// in the left seat, in WINDOWS.camSolo (../components/windows.js).
export default function WebcamSolo() {
  return (
    <Scene width={1920} height={1080} className="relative">
      <CamWindow seat="left" window={WINDOWS.camSolo} fill={wantsFill()} />
    </Scene>
  )
}
