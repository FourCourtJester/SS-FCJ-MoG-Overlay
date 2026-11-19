import LOOP_CROPS from './loop-crops.json'

// The roster, in the game's own order (the creator kit numbers its portrait folders
// 01 to 017). Display names are our reading of the kit's file names: "Iron Sister"
// and "Trench Maw" are spelt both ways there, so check them against the game.
//
// `x` is where the giant stands in its menu loop, across the frame (0 the left edge, 1 the
// right): the middle of its body, read off a frame of each loop. The draft slides each
// loop so that point lands in one place, with the name under it. The loops all put their
// giant right of centre, but not by the same amount. Pandemos lurches about between 0.68
// and 0.76 over its loop, so its is the middle of that.
//
// `head` is where the giant's head is in its portrait, measured on the 768px cutouts:
// [how tall, from crown to chin; how far down its middle is]. The kit framed every portrait
// differently - Kragg and Dreadnought cropped tight, Elaris and Oriane loose - so the same
// size of picture makes some giants look twice the size of others. The Victory scene uses
// this to bring their heads to one size and one height. Measured by eye: if a giant still
// stands too big, too small, too high or too low there, adjust its numbers here. Stratus's
// counts her storm of hair, which is most of her: matched by her face alone, she came out
// huge (user, 2026-11-17). Victoria's is counted small, 170 for a measured 200, so she is
// drawn larger and stands taller at the back: her cutout stops at the waist, so she cannot
// simply be raised without showing where (user, 2026-11-17: "looks short").
//
// `loopHead` is where the giant's head is in its menu loop, across and down (0 to 1 of the
// frame), read off a frame six seconds in: the Draft's slices centre on it, the head
// mattering more in a strip 235px wide than the body's middle (`x`) does. The giants move
// through their loops, so it is where the head mostly is, not always. Nudged by eye on
// the scene (user, 2026-11-18): Iron Sister, Goliath and Victoria 0.03 further right in
// their frame (the slice's view moved right), Trench Maw and Voidmaster 0.03 further left.
// Kragg and Ossuary re-read off frames through their loops: they had been measured wrong,
// and neither was in his slice. Malgrove's neck wanders; left as it is.
//
// `banLift` raises the head in a Draft ban's square, in px, where centring it by `head`
// cuts the face off between nose and chin. 10 on all but the seven that were right
// (user, 2026-11-18: Kragg, Pandemos, Stratus, Strykka, Trench Maw, Victoria, Wolfgang).
// Voidmaster 26: his face sits sunk into his body, lower than a humanoid's (user,
// 2026-11-18).
//
// For the Victory scene, where the picture alone does not say:
//   prefer   'front' or 'back': the row a giant stands in, ahead of its size (user,
//            2026-11-17). Back for one whose cutout carries something that swamps a front
//            place - Iron Sister's furnace mace, Solace's bell staff, Victoria's wings,
//            Flint's cannon - and front for one lost at the back. Only a preference: with
//            three of a kind picked, there are still only two places in each row.
//   feet     for a cutout with its whole body in it, the lowest row the giant reaches
//            (on the 768px cutout): it stands on the ground, in the mist, rather than by
//            its head. Trench Maw's claws, Voidmaster's tentacles; every other cutout
//            stops at the waist or chest and runs off the bottom. Trench Maw's measured 715;
//            702 sinks him another 10px or so into the mist, set by eye (user, 2026-11-17).
//   fade     how much of each side of the cutout fades out, where it is cut off at the
//            sides; 0.07 if not given. Kragg's is solid to both edges.
//   scale    a last word on size, once everything else is worked out: Kragg 10% larger,
//            as he came out too small at the edges (user, 2026-11-17).

export const GIANTS = [
  { slug: 'victoria', x: 0.67, name: 'Victoria', head: [170, 224], prefer: 'back', loopHead: [0.67, 0.17] },
  { slug: 'kragg', x: 0.64, name: 'Kragg', head: [200, 312], fade: 0.16, scale: 1.1, loopHead: [0.66, 0.22] },
  { slug: 'flint', x: 0.72, name: 'Flint', head: [160, 160], prefer: 'back', loopHead: [0.74, 0.17], banLift: 10 },
  { slug: 'goliath', x: 0.68, name: 'Goliath', head: [190, 176], loopHead: [0.67, 0.14], banLift: 10 },
  { slug: 'dreadnought', x: 0.65, name: 'Dreadnought', head: [180, 130], loopHead: [0.71, 0.13], banLift: 10 },
  { slug: 'solace', x: 0.71, name: 'Solace', head: [180, 182], prefer: 'back', loopHead: [0.72, 0.13], banLift: 10 },
  { slug: 'iron-sister', x: 0.73, name: 'Iron Sister', head: [150, 176], prefer: 'back', loopHead: [0.69, 0.19], banLift: 10 },
  { slug: 'elaris', x: 0.74, name: 'Elaris', head: [130, 176], loopHead: [0.73, 0.14], banLift: 10 },
  { slug: 'wolfgang', x: 0.66, name: 'Wolfgang', head: [210, 252], prefer: 'front', loopHead: [0.66, 0.17] },
  { slug: 'voidmaster', x: 0.7, name: 'Voidmaster', head: [230, 202], prefer: 'front', feet: 743, loopHead: [0.64, 0.22], banLift: 26 },
  { slug: 'trench-maw', x: 0.68, name: 'Trench Maw', head: [200, 230], feet: 702, loopHead: [0.6, 0.38] },
  { slug: 'stratus', x: 0.65, name: 'Stratus', head: [240, 200], loopHead: [0.64, 0.14] },
  { slug: 'strykka', x: 0.66, name: 'Strykka', head: [230, 174], loopHead: [0.66, 0.14] },
  { slug: 'oriane', x: 0.68, name: 'Oriane', head: [140, 160], loopHead: [0.67, 0.11], banLift: 10 },
  { slug: 'pandemos', x: 0.72, name: 'Pandemos', head: [200, 202], loopHead: [0.73, 0.1] },
  { slug: 'ossuary', x: 0.67, name: 'Ossuary', head: [200, 194], loopHead: [0.65, 0.1], banLift: 10 },
  { slug: 'malgrove', x: 0.58, name: 'Malgrove', head: [190, 194], loopHead: [0.6, 0.21], banLift: 10 },
]

// EVERY GIANT BY SIZE, slightest first: how much of its portrait each one fills, by our eye
// on the kit's cutouts, not the game's numbers. One strict order, no ties, so any four picks
// fall into place (user, 2026-11-17). The Victory scene stands the slightest two of a
// team's four in front, in the middle, and the biggest two behind them at the edges. Move
// a giant up or down this list if it stands in the wrong place.
export const BY_SIZE = [
  'elaris',
  'oriane',
  'stratus',
  'iron-sister',
  'flint',
  'pandemos',
  'ossuary',
  'victoria',
  'goliath',
  'solace',
  'wolfgang',
  'trench-maw',
  'malgrove',
  'voidmaster',
  'dreadnought',
  'strykka',
  'kragg',
]

const bySlug = (files) =>
  Object.fromEntries(
    Object.entries(files).map(([path, url]) => [
      path
        .split('/')
        .pop()
        .replace(/\.\w+$/, ''),
      url,
    ]),
  )

const PORTRAITS = bySlug(import.meta.glob('../assets/portraits/*.webp', { eager: true, query: '?url', import: 'default' }))

// The menu loops, each cut down to a strip 480 wide around the giant (scripts/assets.sh),
// its left edge `LOOP_CROPS[slug]` px into the full 1920 frame - so `x` and `loopHead`
// above still count across the whole frame. In git, as WebM (user, 2026-11-18). A giant
// with no loop here shows its portrait instead.
const LOOPS = bySlug(import.meta.glob('../assets/video/giants/*.webm', { eager: true, query: '?url', import: 'default' }))
export const loopCropOf = (slug) => LOOP_CROPS[slug] ?? 0

export const portraitOf = (slug) => PORTRAITS[slug] ?? null
export const loopOf = (slug) => LOOPS[slug] ?? null
export const giantOf = (slug) => GIANTS.find((giant) => giant.slug === slug) ?? null
export const nameOf = (slug) => giantOf(slug)?.name ?? ''
