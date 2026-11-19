import { useVelcroValue } from '@single-studio/core'
import { Variable } from '@single-studio/core/source'

import keyart from '../assets/backgrounds/keyart.webp'

// One camera: its window, and the name plate across its bottom edge.
//
// The window itself is empty in a show. OBS puts the camera underneath, sized to it and
// cut by public/masks/window-rough-{edge}.png, and this source only lays the name over
// it. That is what lets a camera be nudged, scaled or swapped without re-cutting art -
// FCJ Heroes' arrangement - and why nothing here may move: OBS cannot move the camera
// in step with it.
//
// `fill` paints the window, so the shape can be seen with no camera behind it. It is a
// URL flag rather than a switch on the board because a switch can be left on, and on air
// a filled window is an opaque rectangle over somebody's face.
//
// `window` is one of ../components/windows.js: where it is, and which side is scuffed (the
// outer side, so a pair mirrors).
export default function CamWindow({ seat, window: { x, y, w, h, rough, border, plate }, fill }) {
  // a seat with neither a name nor a handle shows its window and no plate
  const named = [useVelcroValue(`variables.cam.${seat}.name`), useVelcroValue(`variables.cam.${seat}.social`)].some(Boolean)
  return (
    <div className={`mog-cam plate-${plate ?? (rough === 'left' ? 'right' : 'left')}`} style={{ left: x, top: y, width: w, height: h, '--window-h': `${h}px` }}>
      {fill ? <img className={`mog-cam-fill mog-window-rough-${rough}`} src={keyart} alt="" /> : null}
      {border ? (
        <div className={`mog-cam-border ${border}`}>
          <div className="mog-cam-edge along" />
          <div className="mog-cam-edge up" />
        </div>
      ) : null}
      {named ? (
        <div className="mog-cam-plate">
          <div className="mog-cam-brush mog-plate mog-brushed" />
          <Variable className="mog-cam-name mog-type" name={`cam.${seat}.name`} fallback="" fit />
          <Variable className="mog-cam-social" name={`cam.${seat}.social`} fallback="" />
        </div>
      ) : null}
    </div>
  )
}

/** Whether ?fill is on the source's URL: #/source/webcams-duo?fill */
export const wantsFill = () => {
  const query = window.location.search + '&' + (window.location.hash.split('?')[1] ?? '')
  return new URLSearchParams(query).has('fill')
}
