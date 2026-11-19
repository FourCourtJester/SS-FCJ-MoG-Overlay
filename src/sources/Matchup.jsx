import { Scene } from '@single-studio/core/source'

import MatchupBand, { useSeriesKicker } from '../components/MatchupBand'

// Who is playing, on its own and transparent: lay it over whatever it belongs on.
// #/source/matchup, 1920 x 1080. Bottom-centred, 40px off the bottom edge.
export default function Matchup() {
  const kicker = useSeriesKicker()
  return (
    <Scene width={1920} height={1080} className="flex items-end justify-center pb-10">
      <MatchupBand kicker={kicker} />
    </Scene>
  )
}
