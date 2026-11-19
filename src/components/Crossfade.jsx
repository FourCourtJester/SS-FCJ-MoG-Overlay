import { useCallback, useEffect, useState } from 'react'

// One picture fading in over the last, rather than cutting.
//
// `id` names what should be up; `children(id, ready)` draws it. A new id mounts a new
// layer ON TOP of the old one, invisible, and it fades in only once it calls `ready` - for
// a video, once it is actually playing, so a fade never passes through the black of a
// video that has not decoded its first frame. When it has faded in, every layer under it
// goes. A layer that never says it is ready fades in anyway after `patience` ms, so a
// failed video cannot hold the old picture up forever.
//
// `instant` puts the very first layer up at once, unfaded: for a Crossfade inside
// something that is itself fading in.
//
// While a new layer fades in, the ones under it wear `leaving`, so whatever in them should
// not dissolve through the new one - text, mostly - can get out of the way first.
let seq = 0

export default function Crossfade({ id, children, duration = 900, patience = 2500, instant = false, className = '' }) {
  const [layers, setLayers] = useState(() => [{ id, key: ++seq, ready: instant }])

  useEffect(() => {
    setLayers((was) => (was.at(-1).id === id ? was : [...was, { id, key: ++seq, ready: false }]))
  }, [id])

  const ready = useCallback(
    (key) =>
      setLayers((was) =>
        was.some((layer) => layer.key === key && !layer.ready) ? was.map((layer) => (layer.key === key ? { ...layer, ready: true } : layer)) : was,
      ),
    [],
  )

  const top = layers.at(-1)
  useEffect(() => {
    if (!top.ready) {
      const wait = setTimeout(() => ready(top.key), patience)
      return () => clearTimeout(wait)
    }
    if (layers.length === 1) return undefined
    const done = setTimeout(() => setLayers((was) => was.slice(was.findIndex((layer) => layer.key === top.key))), duration)
    return () => clearTimeout(done)
  }, [top, layers.length, duration, patience, ready])

  return layers.map((layer) => (
    <div
      key={layer.key}
      className={`mog-xfade ${layer.ready ? 'in' : ''} ${layer !== top && top.ready ? 'leaving' : ''} ${className}`}
      style={{ '--xfade': `${duration}ms` }}
    >
      {children(layer.id, () => ready(layer.key))}
    </div>
  ))
}
