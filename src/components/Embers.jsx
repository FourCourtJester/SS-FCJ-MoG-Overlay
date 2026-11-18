import './embers.css'

// Embers rising: Victory's, and either side of the Draft. Placed and timed by a fixed
// scatter, not Math.random, so a scene is the same picture each time it is drawn.
//
// Some are warm, the rest take the side's colour from `--team-bright` on whatever they sit
// in. They rise the height of a 1080 scene, across the box they are put in.
const scatter = (i, n) => {
  const v = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453
  return v - Math.floor(v)
}

const made = new Map()
// `seed` picks a different scatter, so two sets side by side are not twins
function embers(count, seed, team) {
  const key = `${count}/${seed}/${team}`
  if (!made.has(key))
    made.set(
      key,
      Array.from({ length: count }, (_, n) => {
        const i = n + seed
        return {
          left: `${scatter(i, 1) * 100}%`,
          size: `${2 + scatter(i, 2) * 4}px`,
          duration: `${10 + scatter(i, 3) * 10}s`,
          delay: `${-scatter(i, 4) * 20}s`,
          drift: `${(scatter(i, 5) - 0.5) * 220}px`,
          team: scatter(i, 6) < team,
        }
      }),
    )
  return made.get(key)
}

/**
 * @param {object} props
 * @param {number} [props.count] - How many.
 * @param {number} [props.seed] - Which scatter.
 * @param {number} [props.team] - The share, 0 to 1, in the side's colour rather than warm.
 * @param {string} [props.className]
 */
export default function Embers({ count = 42, seed = 0, team = 0.45, className = '' }) {
  return (
    <div className={`mog-embers ${className}`}>
      {embers(count, seed, team).map((ember, i) => (
        <span
          key={i}
          className={ember.team ? 'team' : undefined}
          style={{
            left: ember.left,
            width: ember.size,
            height: ember.size,
            '--drift': ember.drift,
            animationDuration: ember.duration,
            animationDelay: ember.delay,
          }}
        />
      ))}
    </div>
  )
}
