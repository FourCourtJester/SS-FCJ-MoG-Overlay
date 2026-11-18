import { useVelcroState } from '@single-studio/core'
import { Image } from '@single-studio/core/source'

import icon from '../assets/brand/icon-white.png'

// A side's logo, or the game's monogram, dimmed, when there is none. A logo that will not
// load (a file since removed) takes the monogram too, through Image's own fallback.
//
// Whether a place shows a team's logo at all is useTeamLogos() (marks.js), asked by the
// place, so that it can drop its box and backdrop with it.
//
// Image's own `fallback` should do this, but in core 0.17.1 it only covers an image that
// FAILS to load: an empty value renders nothing (Image.jsx: `if (!usable) setShown(null)`),
// though its docs say empty takes the fallback too. Remove this once that is fixed.
export default function TeamLogo({ side, className }) {
  const { value, loaded } = useVelcroState(`variables.${side}.logo`)
  if (!loaded) return null
  if (!value) return <img src={icon} alt="" className={`${className} mog-logo-empty`} />
  return <Image name={`${side}.logo`} fit="contain" fallback={icon} className={className} />
}
