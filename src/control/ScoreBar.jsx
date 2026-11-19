import { BoardBar, Stepper } from '@single-studio/core/control'

// The series score in the board's bar, in reach wherever the board is scrolled - as FCJ
// Heroes found, the thing commentators ask for most. The same values as the Teams
// panel's steppers, so the two are one score.
//
// BLUE AND RED, the game's own names for the sides (left and right on screen), never the
// teams' names: those can be long, and the side is what the operator is pressing for.
//
// A side to a span (mog-score-side), so that once the score no longer fits the bar on one
// line, each side can take a line of its own (index.css).
const Side = ({ children, tint }) => <span className={`mog-score-label text-sm font-semibold tracking-wide uppercase ${tint}`}>{children}</span>

export default function ScoreBar() {
  return (
    <BoardBar className="mog-score-group ml-auto">
      <span className="mog-score-side left">
        <Stepper name="left.wins" className="mog-score-stepper" />
        <Side tint="text-sky-400">Blue</Side>
      </span>
      <span className="mog-score-vs px-1 text-xs font-semibold text-slate-500 uppercase">vs</span>
      <span className="mog-score-side right">
        <Side tint="text-red-400">Red</Side>
        <Stepper name="right.wins" className="mog-score-stepper" />
      </span>
    </BoardBar>
  )
}
