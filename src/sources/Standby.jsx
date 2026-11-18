import { useTimer, useVelcroValue } from '@single-studio/core'
import { Scene, Slideshow, Variable } from '@single-studio/core/source'

import logo from '../assets/brand/logo-white.png'
import keyart from '../assets/backgrounds/keyart.webp'
import Loop, { clipsFrom } from '../components/Loop'
import SlotTimer from '../components/SlotTimer'
import './standby.css'

// Between games: #/source/standby, 1920 x 1080, fills the screen.
//
// VIDEO BEHIND EVERYTHING: every clip in src/assets/video/standby/, in file-name order,
// round and round, all WebM. Today that is the kit's ten-second animated key art;
// trailers join it from references/trailers/ through scripts/assets.sh. The board can swap it for FCJ
// Heroes' slideshow - the image library's slides/ group - if video does not hold up in OBS.
//
// TWO PLATES ANCHORED TO THE TOP CORNERS, clear of the top centre, where the art puts its
// biggest giant (Voidmaster, in the key art): the wordmark and message top left, always;
// the clock top right, sliding in from the right when a countdown starts and back out when it ends.
// The message stays anchored to the wordmark whether or not the clock is up (user,
// 2026-11-17: "anchoring our text to the MoG logo in the top left is genius").
//
// Webcams Duo (or Solo) and Matchup lay over this in OBS; they are placed to stack with it.
const CLIPS = clipsFrom(
  import.meta.glob('../assets/video/standby/*.{webm,mp4}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
)

export default function Standby() {
  const { active } = useTimer('timers.standby.resume')
  const slides = useVelcroValue('toggles.standby.slides')

  return (
    <Scene width={1920} height={1080}>
      <div className={`mog-standby ${active ? 'has-clock' : ''}`}>
        {slides ? <Slideshow className="mog-standby-slides" group="slides" every={9} order="shuffle" /> : <Loop list={CLIPS} still={keyart} />}
        <div className="mog-standby-shade" />

        <div className="mog-standby-plate mog-standby-message">
          <div className="mog-standby-brush mog-plate mog-brushed" />
          <img className="mog-standby-logo" src={logo} alt="" />
          <Variable className="mog-standby-text mog-type" name="standby.message" fallback="" fit lines={2} />
        </div>

        <div className="mog-standby-plate mog-standby-clock">
          <div className="mog-standby-brush mog-plate mog-brushed" />
          <Variable className="mog-standby-label mog-type" name="standby.label" fallback="" />
          <SlotTimer className="mog-standby-timer mog-type" name="standby.resume" />
        </div>
      </div>
    </Scene>
  )
}
