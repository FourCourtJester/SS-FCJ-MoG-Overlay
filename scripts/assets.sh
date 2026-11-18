#!/usr/bin/env bash
# Cuts everything the studio ships out of references/, the creator kit as it arrived.
#
# The kit is print-sized: 4K video, masks 8000px wide, portraits at 2048. None of it
# goes on air at that size, and none of it should be exported by hand, so this is the
# one place a size or a crop is decided. Re-run it whenever the kit changes:
#
#   bash scripts/assets.sh            # inside the devcontainer, which has ffmpeg
#   bash scripts/assets.sh --docker   # from the host, through the devcontainer image
#
# Writes src/assets/ (bundled: Vite fingerprints it and rewrites the URL for Pages).
# references/ is gitignored and the output is committed, so a fresh clone builds
# without the kit - the key art loop and the giants' menu loops included. Trailers are the
# one thing not in git (see .gitignore): re-run this to get them back.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ "${1:-}" == "--docker" ]]; then
  docker build -q -t ss-fcj-mog-overlay-dev "$ROOT/.devcontainer" >/dev/null
  exec docker run --rm -e SKIP_VIDEO -u "$(id -u):$(id -g)" -v "$ROOT":/usr/src/app -w /usr/src/app \
    ss-fcj-mog-overlay-dev bash scripts/assets.sh "${@:2}"
fi

KIT="$ROOT/references/10_CREATOR_KIT_ZIP_30SEPT"
OUT="$ROOT/src/assets"
FF=(ffmpeg -hide_banner -loglevel error -y)

[[ -d "$KIT" ]] || { echo "No creator kit at $KIT" >&2; exit 1; }

# A still, scaled to a width. PNG keeps the alpha every mask and stroke depends on.
png() { mkdir -p "$(dirname "$2")"; "${FF[@]}" -i "$1" -vf "scale=$3:-2:flags=lanczos${4:+,$4}" -pix_fmt rgba "$2"; }
webp() { mkdir -p "$(dirname "$2")"; "${FF[@]}" -i "$1" -vf "scale=$3:-2:flags=lanczos" -c:v libwebp -quality "${4:-82}" "$2"; }

# A video for the web, and for OBS: VP9 WebM at 1080p, silent (OBS mixes the show's
# audio). WebM because OBS's browser source has a history of not playing H.264, and every
# video that goes in git goes as WebM (user, 2026-11-18). -crf is quality, lower better:
# 34 for the key art, which at 10 seconds is 1.1 MB.
webm() {
  mkdir -p "$(dirname "$2")"
  "${FF[@]}" -i "$1" -vf "scale=1920:-2:flags=lanczos" -an -c:v libvpx-vp9 -crf "${3:-34}" -b:v 0 \
    -deadline good -cpu-used 4 -row-mt 1 -tile-columns 2 "$2.webm"
}

# A giant's menu loop, for the Draft's slices: a strip 480 wide, all 1080 tall, cut out of
# the loop at 1080p from its left edge at `$3` (src/components/loop-crops.json, the giant's
# head less 240). A slice shows 235 of it, so the head can still be nudged ~120px either
# way (giants.js: loopHead) without a re-cut; any further and the slice runs off the strip.
# 30fps and crf 40: at a strip this narrow it looks no different from the full loop
# (user, 2026-11-18: cut down to go in git), at about a third of the size.
giant() {
  mkdir -p "$(dirname "$2")"
  "${FF[@]}" -i "$1" -vf "scale=1920:-2:flags=lanczos,crop=480:1080:$3:0,fps=30" -an -c:v libvpx-vp9 -crf 40 -b:v 0 \
    -deadline good -cpu-used 4 -row-mt 1 "$2.webm"
}

EL="$KIT/02_GRAPHIC_SIGNATURE/GRAPHIC ELEMENTS"

echo "fonts"
# Sheepman, the kit's display face. Regular, Bold and their slanted cuts are what we use.
mkdir -p "$OUT/fonts"
unzip -o -j -q "$KIT/03_FONTS/Sheepman.zip" 'Sheepman/Sheepman-Regular.otf' 'Sheepman/Sheepman-Bold.otf' \
  'Sheepman/Sheepman-BoldSlanted.otf' 'Sheepman/Sheepman-Light.otf' -d "$OUT/fonts"

echo "brand"
png "$KIT/01_LOGO/MoG_Logo_White.png" "$OUT/brand/logo-white.png" 1200
png "$KIT/01_LOGO/MoG_Logo_RGB.png" "$OUT/brand/logo-orange.png" 1200
png "$KIT/01_LOGO/MoG_Icon_White.png" "$OUT/brand/icon-white.png" 512
png "$EL/MoG_Icon_Charcoal_02_White.png" "$OUT/brand/icon-charcoal-white.png" 1200
# Three soldiers charging under a flag: the game's loading symbol, and the Draft's "vs"
# between the two sides (user, 2026-11-18). The kit's icon 06, white.
png "$KIT/02_GRAPHIC_SIGNATURE/ICONS/MoG_Icon_White-06.png" "$OUT/brand/charge-white.png" 512

echo "masks"
# The kit's shapes have ONE rough edge each, and every other edge clean. Each is cropped to
# its painted area, so the rough edge is the image's edge and CSS can pin it to an element's.
# The crops were measured off the alpha at these widths; re-measure if a width changes.
# A mirrored copy of each gives the rough edge on the other side.
mask() { # source, name, width, crop (w:h:x:y)
  png "$1" "$OUT/masks/$2.png" "$3" "crop=$4"
  png "$1" "$OUT/masks/$2-flip-h.png" "$3" "crop=$4,hflip"
  png "$1" "$OUT/masks/$2-flip-v.png" "$3" "crop=$4,vflip"
}
# Torn bars: a straight top, a charcoal rip along the bottom (Graphic_Mask_01-04)
TORN=(_ 2400:939:0:0 2400:987:0:0 2400:1021:0:0 2400:1128:0:0)
for n in 1 2 3 4; do mask "$EL/Graphic_Mask_0$n.png" "torn-$n" 2400 "${TORN[$n]}"; done
# Rough rectangles: straight on three sides, scuffed down the right (MoG_Graphic_Mask_01-03)
ROUGH=(_ 1380:1080:0:0 1436:1080:0:0 1460:1080:0:0)
for n in 1 2 3; do mask "$EL/MoG_Graphic_Mask_0$n.png" "rough-$n" 1920 "${ROUGH[$n]}"; done
# Banners notched into a V (MoG_Graphic_Mask_04-07)
BANNER=(_ _ _ _ 1920:747:0:99 1920:660:0:0 1920:747:0:99 1920:660:0:0)
for n in 4 5 6 7; do mask "$EL/MoG_Graphic_Mask_0$n.png" "banner-$n" 1920 "${BANNER[$n]}"; done

echo "strokes and ornaments"
for n in 04 05 06 07 08 09 10 11; do png "$EL/Graphic_Texture_$n.png" "$OUT/strokes/stroke-$n.png" 1600; done
# Thin hairline strokes (Graphic_Texture_24-27), for scratches: wear on a flat panel
for n in 24 25 26 27; do png "$EL/Graphic_Texture_$n.png" "$OUT/strokes/scratch-$n.png" 1200; done
png "$EL/Line_13_White.png" "$OUT/ornaments/knot-line.png" 1600
png "$EL/Line_14_White.png" "$OUT/ornaments/knot-rule.png" 1920
png "$EL/BulletPoint_02_White.png" "$OUT/ornaments/knot.png" 256
png "$EL/BarbedWire_01_White.png" "$OUT/ornaments/wire.png" 1920

echo "backgrounds"
webp "$KIT/08_BACKGROUNDS/Background_01_Dark.jpg" "$OUT/backgrounds/planks-dark.webp" 1920 80
# The kit's one piece of open setting: a painted storm, cloud tops and sky, no ground
# (Background_02; its Dark and Light cuts are the same painting graded down and up).
# The Victory scene's backdrop. Wider than the screen, so it can drift.
webp "$KIT/08_BACKGROUNDS/Background_02.jpg" "$OUT/backgrounds/sky.webp" 2560 80
webp "$KIT/02_MAIN_KEY_ART/MoG_Keyart_01_4K_Hor.jpg" "$OUT/backgrounds/keyart.webp" 1920 82

echo "obs masks"
# For OBS's Image Mask/Blend filter on a camera or a capture that sits under one of our
# windows. 16:9 and solid, but for the kit's scuffed edge down one side: rough-2's right
# strip, 200px of it at 1080 tall, at 576 tall here. The CSS that draws the same windows
# (.mog-window-*) slices the same 86px edge, so the picture and the mask meet. OBS
# stretches a mask to its source, so one pair serves every 16:9 window. These go to
# public/, as a broadcaster downloads them.
#
# WHITE, WITH THE COLOUR FOLLOWING THE ALPHA, so either of OBS's modes reads it the same:
# "Alpha Mask (Alpha Channel)" reads the alpha, "Alpha Mask (Color Channel)" reads the
# colour, and both see white where the camera shows and nothing past the scuffed edge. The
# first cut was black and solid, which Color Channel reads as "hide everything".
MASKS="$ROOT/public/masks"
mkdir -p "$MASKS"
"${FF[@]}" -i "$OUT/masks/rough-2.png" -f lavfi -i "color=c=black:s=917x576,format=rgba" -filter_complex \
  "[0]crop=200:1080:1236:0,scale=107:576:flags=lanczos,format=rgba[r];[1][r]hstack,alphaextract,split[c][a];[c]format=rgb24[rgb];[rgb][a]alphamerge" \
  -frames:v 1 "$MASKS/window-rough-right.png"
"${FF[@]}" -i "$MASKS/window-rough-right.png" -vf hflip -frames:v 1 "$MASKS/window-rough-left.png"

# slug | portrait (06_GAME_PORTRAITS/...) | menu loop (05_GIANT_ANIMATED_MENUS/...)
# The roster's own order: the portrait folders are numbered 01 to 017.
GIANTS=(
  "victoria|01_Victoria/Victoria_FINAL_2048x2048.png|Victoria_Menu_1.mp4"
  "kragg|02_Kragg/Kraggs_Kragg_FINAL_2048.png|Kragg_Menu_1.mp4"
  "flint|03_Flint/Flint_FINAL_2048x2048.png|Flint_Menu_1.mp4"
  "goliath|04_Goliath/Goliath_FINAL_2048x2048.png|Goliath_Menu_1.mp4"
  "dreadnought|05_Dreadnought/Dreadnought_FINAL_2048x2048.png|Dreadnought_Menu_1.mp4"
  "solace|06_Solace/Solace_FINAL_2048x2048.png|Solace_Menu_1.mp4"
  "iron-sister|07_Ironsister/Ironsister_FINAL_2048x2048.png|Iron_Sister_Menu_1.mp4"
  "elaris|OCTOBER_6_EMBARGO/08_Elaris/Elaris_FINAL_2048x2048.png|OCTOBER_06_EMBARGO/Elaris_Menu_1.mp4"
  "wolfgang|09_Wolfgang/Wolfgang_FINAL_2048x2048.png|Wolfgang_Menu_1.mp4"
  "voidmaster|010_Voidmaster/Voidmaster_FINAL_2048x2048.png|Voidmaster_Menu_1.mp4"
  "trench-maw|011_Trenchmaw/Trenchmaw_FINAL_2048x2048.png|Trench_Maw_Menu_1.mp4"
  "stratus|012_Stratus/Stratus_FINAL_2048x2048.png|Stratus_Menu_1.mp4"
  "strykka|013_Strykka/Strykka_FINAL_2048x2048.png|Strykka_Menu_1.mp4"
  "oriane|014_Oriane/Oriane_FINAL_2048x2048.png|Oriane_Menu_1.mp4"
  "pandemos|OCTOBER_12_EMBARGO/015_Pandemos/Pandemos_FINAL_2048x2048.png|OCTOBER_12_EMBARGO/Pandemos_Menu_1.mp4"
  "ossuary|016_Ossuary/Ossuary_FINAL_2048x2048.png|Ossuary_Menu_1.mp4"
  "malgrove|017_Malgrove/Malgrove_FINAL_2048x2048.png|Malgrove_Menu_1.mp4"
)

echo "portraits"
for row in "${GIANTS[@]}"; do
  IFS='|' read -r slug portrait _ <<<"$row"
  # webp keeps alpha, at a fifth of the PNG's weight
  webp "$KIT/06_GAME_PORTRAITS/$portrait" "$OUT/portraits/$slug.webp" 768 85
done

[[ "${SKIP_VIDEO:-0}" == 1 ]] && { echo "done (no video)"; exit 0; }

echo "video: standby"
# Standby plays everything in src/assets/video/standby/, in file-name order: the kit's
# animated key art first, then any trailer dropped in references/trailers/ (not part of the
# kit; name them 01-..., 02-... to set the order). All WebM. The key art is in git, at
# 1.1 MB; trailers are not (see .gitignore), being minutes long.
webm "$KIT/04_MAIN_KEY_ART/Animated/MOG_ANIMATED_KEYART_3840x2160_H264_10s_v02.mp4" "$OUT/video/standby/00-keyart" 34
shopt -s nullglob nocaseglob
for trailer in "$ROOT/references/trailers/"*.{mp4,mov,mkv,webm}; do
  name="$(basename "${trailer%.*}" | tr '[:upper:] _' '[:lower:]--')"
  echo "  $name"
  webm "$trailer" "$OUT/video/standby/$name" 36
done
shopt -u nullglob nocaseglob

echo "video: giants"
CROPS="$ROOT/src/components/loop-crops.json"
for row in "${GIANTS[@]}"; do
  IFS='|' read -r slug _ menu <<<"$row"
  crop="$(node -p "require('$CROPS')['$slug'] ?? ''")"
  [[ -n "$crop" ]] || { echo "No crop for $slug in $CROPS" >&2; exit 1; }
  echo "  $slug"
  giant "$KIT/05_GIANT_ANIMATED_MENUS/$menu" "$OUT/video/giants/$slug" "$crop"
done

echo "done"
