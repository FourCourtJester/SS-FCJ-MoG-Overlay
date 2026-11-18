import { useTimer } from '@single-studio/core'

// A countdown whose width never changes as it counts.
//
// `font-variant-numeric: tabular-nums` asks the font for its tabular figures, and Sheepman
// has none: measured at 72px, its 1 is 17.6px wide and its 4 is 33px, with or without the
// feature (user, 2026-11-17). So a time with a 1 in it was narrower than one without, and the
// clock plate twitched every time a 1 came or went. Here each digit sits in a slot as wide
// as the widest digit, centred, and only the separators keep their own width.
//
// The framework's Timer, otherwise: the same `useTimer` and the same text.
const SLOT = '0.46em' // Sheepman Bold's widest digit, the 4, is 0.458em

export default function SlotTimer({ name, className = '' }) {
  const { loaded, active, text } = useTimer(`timers.${name}`)
  if (!loaded || !active) return <span className={className} />

  return (
    <span className={className} aria-label={text}>
      {[...text].map((char, at) =>
        /\d/.test(char) ? (
          <span key={at} style={{ display: 'inline-block', width: SLOT, textAlign: 'center' }}>
            {char}
          </span>
        ) : (
          <span key={at}>{char}</span>
        ),
      )}
    </span>
  )
}
