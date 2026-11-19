import { useEffect, useState } from 'react'

import Crossfade from './Crossfade'

// Silent video filling its box: one clip on loop, or a list played in turn, over a still.
//
// Single Studio has no video component yet (its image library takes images only), so
// this is a plain <video>. Muted and inline so it starts on its own; OBS mixes the show's
// audio, never a graphic's. One clip gives way to the next through a Crossfade, which
// waits for the new clip to be playing before fading it in over the old.
//
// `still` shows until a clip has a frame to paint, and instead of the video if there is
// none or every clip fails - so an OBS build that cannot play the files shows the still
// rather than nothing. A clip that fails is skipped.
//
// `onReady` is called once there is a picture: the first clip playing, or the still
// painted when there is no clip. A Crossfade around this Loop waits for it. `instant`
// shows the first clip without a fade of its own, for when that outer Crossfade is doing
// the fading.
//
// A clip is one file, WebM or MP4: the browser reads which from the file itself.
//
//   <Loop src={webm} still={jpg} />           one clip, looping
//   <Loop list={[{ src }, ...]} still={jpg} /> in turn, then round again
export default function Loop({ src, list, still, onReady, instant = false, className = '' }) {
  const clips = list ?? (src ? [{ src }] : [])
  const [at, setAt] = useState(0)
  const [failed, setFailed] = useState(() => new Set())

  const playable = clips.filter((clip) => !failed.has(clip.src))
  const clip = playable.length ? playable[at % playable.length] : null

  // nothing to play and nothing to show: ready as it is
  useEffect(() => {
    if (!clip && !still) onReady?.()
  }, [clip, still, onReady])

  const fail = (bad) => setFailed((was) => new Set(was).add(bad))
  const next = () => setAt((n) => n + 1)

  return (
    <div className={`mog-loop ${className}`}>
      {still ? <img className="mog-loop-still" src={still} alt="" onLoad={clip ? undefined : onReady} /> : null}
      {clip ? (
        <Crossfade id={`${at}|${clip.src}`} instant={instant}>
          {(id, ready) => {
            const shown = clips.find((one) => one.src === id.slice(id.indexOf('|') + 1))
            return (
              <video
                className="mog-loop-video"
                autoPlay
                muted
                playsInline
                loop={playable.length === 1}
                onPlaying={() => {
                  ready()
                  onReady?.()
                }}
                onEnded={next}
                onError={() => fail(shown.src)}
                src={shown.src}
              />
            )
          }}
        </Crossfade>
      ) : null}
    </div>
  )
}

/**
 * The clips in a folder, in file-name order, from `import.meta.glob`s of its video files.
 * A clip cut both ways - the same name as .webm and .mp4 - plays as WebM: every video in
 * git is WebM (user, 2026-11-18), and OBS's browser source plays it where it may not H.264.
 */
export const clipsFrom = (...globs) => {
  const byName = {}
  for (const files of globs)
    for (const [path, url] of Object.entries(files)) {
      const name = path.replace(/\.\w+$/, '')
      if (!byName[name] || path.endsWith('.webm')) byName[name] = url
    }
  return Object.keys(byName)
    .sort()
    .map((name) => ({ src: byName[name] }))
}
