import { useVelcroValue } from '@single-studio/core'
import { Image, Variable } from '@single-studio/core/source'

import { useTeamLogos, useTournamentMark } from './marks'
import TeamLogo from './TeamLogo'
import knot from '../assets/ornaments/knot.png'
import './matchup.css'

// Who is playing: one brushed plate a side - logo, name, games won - meeting at the
// kit's knot, with a banner above for the round and the series.
//
// FCJ Heroes' matchup in shape (a container a side, centred, bottom-anchored), in March
// of Giants' material: each plate one charcoal brush stroke rather than a cut shape, the
// score brushed on in the side's colour, and the tournament's logo between the scores -
// the kit's knot when there is none.
//
// The kicker is whatever the scene wants above the band: Matchup gives it the round and
// the best-of, Standby its message.

function Side({ side }) {
  const logos = useTeamLogos()
  return (
    <div className={`mog-side ${side}`}>
      <div className="mog-side-plate">
        {/* the stroke on a layer of its own, behind: it mirrors for the right side, and
            never clips the name */}
        <div className="mog-side-brush mog-plate mog-brushed" />
        {logos ? (
          <div className="mog-side-logo">
            <TeamLogo side={side} className="mog-side-logo-img" />
          </div>
        ) : null}
        <div className="mog-side-name">
          <Variable className="mog-type" name={`${side}.name`} fallback={side === 'left' ? 'Blue team' : 'Red team'} fit />
        </div>
      </div>
      <div className="mog-side-score">
        <div className="mog-side-swatch mog-swatch" />
        <Variable className="mog-type" name={`${side}.wins`} fallback="0" transition="number" />
      </div>
    </div>
  )
}

/** The round and the best-of, for the banner. Null with neither, so there is no banner. */
export function useSeriesKicker() {
  const round = useVelcroValue('variables.match.round')
  const bestOf = useVelcroValue('variables.match.bestof')
  if (!round && !bestOf) return null
  return (
    <>
      {round ? <span>{round}</span> : null}
      {round && bestOf ? <span className="mog-kicker-sep" /> : null}
      {bestOf ? <span>Best of {bestOf}</span> : null}
    </>
  )
}

// Between the scores: the tournament's logo, square for choice, else the kit's knot.
function Centre() {
  const mark = useTournamentMark('square')
  if (!mark) return <img className="mog-matchup-knot" src={knot} alt="" />
  return <Image value={mark.value} fit="contain" className={`mog-matchup-mark ${mark.shape}`} />
}

/** The orange banner: the round and the series, or whatever a scene puts in it. */
export function Kicker({ children }) {
  return (
    <div className="mog-kicker mog-brushed">
      <span className="mog-type">{children}</span>
    </div>
  )
}

// `kicker` is what goes in the banner above the band; without one, there is no banner.
export default function MatchupBand({ kicker }) {
  return (
    <div className="mog-matchup">
      {kicker ? <Kicker>{kicker}</Kicker> : null}
      <div className="mog-matchup-row">
        <Side side="left" />
        <Centre />
        <Side side="right" />
      </div>
    </div>
  )
}
