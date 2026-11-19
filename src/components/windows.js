// Every window on a 1920 x 1080 canvas that OBS puts a camera or a capture under, in one
// place: the sources draw from these, and the board's Help gives operators the same
// numbers for OBS's Edit Transform. Change one here and both follow.
//
// The cameras are centred across the canvas, and 5px above centre down it (user,
// 2026-11-17), so the art behind Standby frames them evenly; their name plates hang 38px
// below, clear of the matchup's banner.
//
// `rough` is the side the scuffed edge is on, and so the mask OBS needs:
// masks/window-rough-{rough}.png. All 16:9, so any 16:9 camera scales into one exactly.

// `border` is the corner a thin brush line runs into along the window's two clean edges,
// fading in from nothing to full strength there (user, 2026-11-17: the cameras were "just
// too sharp" but for the scuffed edge). The pair mirrors it: each into its inner corner.
//
// `plate` is the end of the bottom edge the name plate sits at: by default the end away
// from the scuffed edge, but the pair put it over the scuffed end instead, clear of their
// border's corner - so their plates are at their outer ends. Solo's is 'center', in the
// middle of its bottom edge (user, 2026-11-18): one camera alone, centred on screen.
export const WINDOWS = {
  camLeft: { label: 'Webcams Duo, left camera', x: 72, y: 297, w: 848, h: 477, rough: 'left', border: 'bottom-right', plate: 'left' },
  camRight: { label: 'Webcams Duo, right camera', x: 1000, y: 297, w: 848, h: 477, rough: 'right', border: 'bottom-left', plate: 'right' },
  camSolo: { label: 'Webcam Solo', x: 448, y: 247, w: 1024, h: 576, rough: 'left', border: 'bottom-right', plate: 'center' },
}

export const maskOf = (window) => `masks/window-rough-${window.rough}.png`
