import { useVelcroValue } from '@single-studio/core'

// The tournament's logo, and which picture a place on screen should take. FCJ Heroes'
// arrangement (its components/marks.js), for the tournament's mark alone so far.
//
// TWO PICTURES, a square and a wide, set once on the Tournament panel. Which is wanted is a
// property of the place it is drawn into, not of the show, so each place says which shape it
// would rather have and takes the other only as a fallback: "wide, then square, then
// nothing" for a wide hole, the other way round for a square one. `shape` comes back with
// the picture, so a place can contain a fallback rather than crop it.
//
// ONE SWITCH, ACROSS EVERY SOURCE: `toggles.show.tournament`, off by default as every
// toggle is, so the logo comes off everywhere at once rather than in the one scene somebody
// remembered.

// The teams' logos have a switch of their own, `toggles.show.team_logos` (user,
// 2026-11-18), on the Tournament panel beside the tournament's, off by default too: an open
// beta's teams mostly have no logo, and a row of monograms says so on air. Off, every place
// a team's logo goes drops it, backdrop and all, and the name takes the room.

/** Whether the teams' logos are shown, on every graphic at once. */
export const useTeamLogos = () => !!useVelcroValue('toggles.show.team_logos')

const SLOTS = { square: 'event.logo', wide: 'event.logo_wide' }

/**
 * The tournament's logo for a place drawn for `prefer`, or null when there is no picture or
 * the switch is off.
 *
 * @param {'wide'|'square'} prefer
 * @returns {{ value: string, shape: 'wide'|'square' } | null}
 */
export function useTournamentMark(prefer = 'wide') {
  // every read every time: a hook cannot be called conditionally
  const shown = useVelcroValue('toggles.show.tournament')
  const square = useVelcroValue(`variables.${SLOTS.square}`)
  const wide = useVelcroValue(`variables.${SLOTS.wide}`)
  if (!shown) return null

  const set = { square, wide }
  const order = prefer === 'square' ? ['square', 'wide'] : ['wide', 'square']
  for (const shape of order) if (set[shape]) return { value: set[shape], shape }
  return null
}
