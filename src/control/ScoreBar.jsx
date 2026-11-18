import { BoardBar, Stepper } from '@single-studio/core/control'

// The series score in the board's bar, in reach wherever the board is scrolled - as FCJ
// Heroes found, the thing commentators ask for most. The same values as the Teams
// panel's steppers, so the two are one score.
//
// BLUE AND RED, the game's own names for the sides (left and right on screen), never the
// teams' names: those can be long, and the side is what the operator is pressing for.
const Side = ({ children, tint }) => <span className={`text-sm font-semibold tracking-wide uppercase ${tint}`}>{children}</span>

export default function ScoreBar() {
  return (
    <BoardBar className="mog-score-group ml-auto">
      <Stepper name="left.wins" className="mog-score-stepper" />
      <Side tint="text-sky-400">Blue</Side>
      <span className="px-1 text-xs font-semibold text-slate-500 uppercase">vs</span>
      <Side tint="text-red-400">Red</Side>
      <Stepper name="right.wins" className="mog-score-stepper" />
    </BoardBar>
  )
}
