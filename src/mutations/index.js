// Everything that can change this studio's state, in one object. If it is not in
// here, it cannot be dispatched. Name them `area:verb`, use `ctx.add` for numbers and
// `ctx.now()` for time, and keep fetches and timers out (they belong in the worker).
// ./examples.js has worked examples, and nothing imports it.

import { demo } from './demo'

export const mutations = {
  ...demo,
}
