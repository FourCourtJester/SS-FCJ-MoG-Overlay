import { useId, useState } from 'react'
import { Panel } from '@single-studio/core/control'

import { maskOf, WINDOWS } from '../../components/windows'

// Directions for whoever is running this, on the board itself rather than in a file they
// would have to know to look for. FCJ Heroes' Help, in shape:
//
// FIRST, AND FOLDED. It is where a new operator starts, and folded it costs one line of the
// board to the people who already know.
//
// QUESTIONS, NOT CHAPTERS. The questions listed under a few headings, each answer opening
// under its own. Nothing is open at first, and any number can be open at once, as somebody
// wiring OBS may read two side by side.
//
// IT POINTS AT THE SOURCE LIST RATHER THAN REPRODUCING IT. The gear menu already has every
// browser source and its URL, kept current; Help's job is to say where things are.

const Group = ({ children }) => <span className="mt-3 mb-0.5 text-xs font-semibold tracking-wide text-slate-500 uppercase first:mt-0">{children}</span>

// One question. No box round it: the chevron and a hover tint say it opens, and the answer
// sits indented under the question's text.
function Q({ q, children }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className="-mx-2 flex items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800/60"
      >
        <span aria-hidden className={`inline-block w-3 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-90' : ''}`}>
          &#9656;
        </span>
        <span>{q}</span>
      </button>
      {open && (
        <div id={id} className="flex flex-col gap-2 pt-1 pb-3 pl-5">
          {children}
        </div>
      )}
    </div>
  )
}

const P = ({ children }) => <p className="text-sm leading-relaxed text-slate-300">{children}</p>

const Code = ({ children }) => <code className="text-slate-200">{children}</code>

// A file an operator needs on disk, as a link to copy. An OBS dock has nowhere to save a
// download - a `download` link in one appears to do nothing at all - and OBS's mask filter
// wants a file path anyway, so the link goes into an ordinary browser and is saved from
// there.
//
// The clipboard API needs a secure page (https, or localhost) and permission an OBS dock
// may not give, so the old textarea-and-execCommand copy stands behind it.
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = Object.assign(document.createElement('textarea'), { value: text })
    area.style.cssText = 'position:fixed;opacity:0'
    document.body.append(area)
    area.select()
    const done = document.execCommand('copy')
    area.remove()
    return done
  }
}

function FileLink({ path }) {
  const [copied, setCopied] = useState(null)
  // relative to wherever the board is served - the dev server, or Pages - made absolute,
  // since a relative link means nothing in another browser
  const url = new URL(path, window.location.href).href.replace(/#.*$/, '')
  const click = async () => {
    setCopied((await copy(url)) ? 'Copied' : 'Copy failed: select the link')
    setTimeout(() => setCopied(null), 3000)
  }
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <Code>{path.split('/').pop()}</Code>
      <button type="button" onClick={click} className="rounded bg-slate-700 px-1.5 py-0.5 text-xs font-semibold text-slate-100 hover:bg-slate-600">
        {copied ?? 'Copy link'}
      </button>
    </span>
  )
}

// Every graphic, what it is for and what goes with it. Positions are for a 1920 x 1080 canvas.
const SCENES = [
  ['Standby', 'Full screen, between games. Video, the message and the clock.'],
  ['Webcams Duo', 'Two cameras, transparent. Lay over Standby; the cameras go under it.'],
  ['Webcam Solo', 'One camera, centred, transparent. The left seat.'],
  ['Matchup', 'Who is playing, transparent, along the bottom. Lay over anything.'],
  ['Draft', "Full screen. Eight giants filling in as they are picked, and each side's bans. Lay Matchup over it. Enter the picks and bans in Draft."],
  ['Game', "Transparent, over a live match: each team in a top corner, the tournament's logo under the clock."],
  ['Victory', "Full screen, after a game: the winner's four picks under their name. Set the winner in Match, the picks in Draft."],
]

// Every window, from the same numbers the sources are drawn with.
const Windows = () => (
  <table className="text-sm text-slate-300">
    <thead>
      <tr className="text-left text-xs tracking-wide text-slate-500 uppercase">
        <th className="pr-4 font-semibold">Window</th>
        <th className="pr-4 font-semibold">Position</th>
        <th className="pr-4 font-semibold">Bounding box</th>
        <th className="font-semibold">Mask</th>
      </tr>
    </thead>
    <tbody>
      {Object.values(WINDOWS).map((window) => (
        <tr key={window.label}>
          <td className="py-0.5 pr-4 align-top text-slate-200">{window.label}</td>
          <td className="py-0.5 pr-4 align-top whitespace-nowrap">
            <Code>
              {window.x}, {window.y}
            </Code>
          </td>
          <td className="py-0.5 pr-4 align-top whitespace-nowrap">
            <Code>
              {window.w} x {window.h}
            </Code>
          </td>
          <td className="py-0.5 align-top whitespace-nowrap">
            <Code>{maskOf(window).split('/').pop()}</Code>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)

export default function Help() {
  return (
    <Panel title="Help" collapsible>
      <div className="flex flex-col">
        <Group>Getting started</Group>

        <Q q="How do I get a graphic into OBS?">
          <P>
            Every graphic here is a browser source. The <b>gear, top right → Browser sources</b> lists every one with its URL and a button to copy it. In OBS:{' '}
            <b>Add → Browser</b>, paste the URL, and set the size to <b>1920 x 1080</b>. Every graphic is drawn for that canvas, whatever size the preview
            window happens to be.
          </P>
          <P>
            Leave <b>Shutdown source when not visible</b> off on Standby and Draft, so their video carries on rather than starting again from black each time
            you cut back.
          </P>
          <P>
            Turn it <b>on</b> for Game and Victory. Their pieces arrive when the source loads, so shutting it down while its scene is hidden is what plays the
            entrance again on every cut to it, rather than once a session.
          </P>
        </Q>

        <Q q="Which graphic goes in which scene?">
          <table className="text-sm text-slate-300">
            <tbody>
              {SCENES.map(([name, what]) => (
                <tr key={name}>
                  <td className="py-0.5 pr-4 align-top font-medium whitespace-nowrap text-slate-200">{name}</td>
                  <td className="py-0.5">{what}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <P>
            They are placed to stack: a standby scene is Standby, then Webcams Duo (or Webcam Solo), then Matchup on top, and none of them covers another. Each
            is independent, so leave out whichever the show does not need.
          </P>
        </Q>

        <Q q="Where do logos and pictures live?">
          <P>
            In the image store, one library shared by every tab. Open it from the <b>gear, top right → Image store</b>, or the <b>magnifier</b> on any image
            picker. Drop files on it to add them; drop a <b>folder</b> and everything in it is filed under that folder&rsquo;s name.
          </P>
          <P>
            Files are added <b>on the machine doing the adding</b>, so drop logos on the machine running OBS. Choosing a picture is staged like anything typed:
            nothing reaches air until you save.
          </P>
        </Q>

        <Q q="Where does the tournament go?">
          <P>
            Set it on the <b>Tournament</b> panel, then press <b>Show Tournament Logo</b> once its logo is in. The switch is for the logo alone, everywhere at once, and
            starts off: hidden, every place shows its fallback instead (below), never an empty space.
          </P>
          <P>
            Its <b>logo</b> goes between the two scores on the matchup, the square one for choice and the wide one if that is all there is. In the Game scene it
            goes under the clock, and only the <b>wide</b> one: that strip is too short for a square logo to read.
          </P>
          <P>
            No logo is fine. The matchup shows the game&rsquo;s knot instead, and the Game scene shows the <b>tournament name</b> where the wide logo would be.
          </P>
        </Q>

        <Q q="What about the teams' logos?">
          <P>
            Pick them on the <b>Teams</b> panel, then press <b>Show Team Logos</b> on the Tournament panel. Like the tournament&rsquo;s switch it starts off
            and covers every graphic at once: hidden, the matchup, the Game corners and Victory drop the logo and its backdrop, and the team name takes the
            room. Shown, a team with no logo, or one whose file has gone, gets the game&rsquo;s monogram.
          </P>
        </Q>

        <Q q="What do the buttons do, and what waits for Save?">
          <P>
            Buttons and switches write straight away. Anything <b>typed</b> waits until you press <b>Save</b> (or Ctrl+S), so a half-typed team name never
            reaches air.
          </P>
          <P>
            The score is in the bar under the header, wherever the board is scrolled: <b>blue</b> and <b>red</b>, the game's names for the left and right teams.
            It is the same score as the Teams panel&rsquo;s steppers.
          </P>
        </Q>

        <Group>Cameras and capture</Group>

        <Q q="How do I place a webcam in its window?">
          <P>
            The webcam sources draw the name plates only; each camera goes <b>underneath</b> the source in OBS. Select the camera, open <b>Edit Transform</b>{' '}
            (Ctrl+E), and set:
          </P>
          <ul className="list-disc pl-5 text-sm leading-relaxed text-slate-300">
            <li>
              <b>Positional Alignment</b>: Top Left
            </li>
            <li>
              <b>Position</b>: the window&rsquo;s x and y, below
            </li>
            <li>
              <b>Bounding Box Type</b>: Scale to inner bounds, with <b>Bounding Box Size</b> the window&rsquo;s size
            </li>
          </ul>
          <P>
            A bounding box rather than a scale, so the camera lands the same whether it sends 1080p, 720p or anything else 16:9. Every window is 16:9, so a 16:9
            camera fills it exactly.
          </P>
          <Windows />
          <P>
            Add <Code>?fill</Code> to a source&rsquo;s URL to see its windows painted in, for lining up with no cameras running.
          </P>
        </Q>

        <Q q="How do I cut a webcam to the window's rough edge?">
          <P>
            On the camera: <b>Filters → Effect Filters → + → Image Mask/Blend</b>. Either <b>Alpha Mask</b> type works, Alpha Channel or Color Channel. For{' '}
            <b>Path</b>, the mask for that window (in the table above), saved on this machine.
          </P>
          <P>OBS wants a file, and this dock cannot save one, so copy the mask&rsquo;s link, open it in your normal browser, and save it from there:</P>
          <P>
            <FileLink path="./masks/window-rough-left.png" /> <span className="text-slate-500">· left camera, Webcam Solo</span>
          </P>
          <P>
            <FileLink path="./masks/window-rough-right.png" /> <span className="text-slate-500">· right camera</span>
          </P>
          <P>The mask stretches to the camera, so the one file serves a window of any size.</P>
        </Q>

        <Q q="How does the Draft screen work?">
          <P>
            It is the whole draft, drawn by us rather than captured from the game: no game capture goes with it. Click each pick into <b>Draft</b> on this board
            as it is made, on the right side&rsquo;s grid, and its giant rises into the next slice. Bans are the two dropdowns under each side&rsquo;s picks;
            both write straight away. The matchup is not part of it: put <b>Matchup</b> above Draft in the OBS scene.
          </P>
          <P>
            The game picks 1-2-2-2-1: blue, red, red, blue, blue, red, red, blue. If a tournament gives red first pick, set <b>First pick</b> at the top of
            Draft to Red, and the order swaps. Each side fills from the middle outward: its first pick beside the centre, its last at the screen&rsquo;s edge.
            The pick boards up next show a knot.
            <b> Reset draft</b> clears both sides, and the winner, for the next game. It leaves First pick as it is.
          </P>
        </Q>

        <Q q="What goes over the game itself?">
          <P>
            <b>Game</b>, with the game capture <b>under</b> it, full screen and uncropped. It covers nothing of the game&rsquo;s: the two teams take the top
            corners either side of the game&rsquo;s team bar, and the tournament&rsquo;s logo hangs under its clock.
          </P>
          <P>
            Blue is always the left team and red the right, as the game draws them, so fill <b>Teams</b> the same way round as the game has them.
          </P>
        </Q>

        <Group>The standby screen</Group>

        <Q q="What plays behind the standby screen?">
          <P>
            Video: the game&rsquo;s animated key art, and any trailers built into the studio, one after another and round again. If video stutters or will not
            play in your OBS, press <b>Standby → Show slideshow</b>, which swaps the video for pictures.
          </P>
          <P>
            The slideshow plays whatever is filed under <Code>slides/</Code> in the image store, so dropping a folder named <Code>slides</Code> on it loads the
            lot. File slides at <b>1920 x 1080 or larger, 16:9</b>; anything else is cropped to fill.
          </P>
        </Q>

        <Q q="How does the clock work?">
          <P>
            <b>Back at</b> counts down to a time of day; <b>Back in</b> counts down a length. They set the same clock, so starting one replaces the other.
            Prefer Back at for a break that might be interrupted.
          </P>
          <P>
            The message sits top left beside the logo, always; the clock slides in from the right while it runs and back out when it ends. Both stay in their
            corners, clear of the picture&rsquo;s centre. The <b>Clock label</b> is the words before the time: &ldquo;Back in&rdquo;, &ldquo;Starting in&rdquo;.
          </P>
        </Q>
      </div>
    </Panel>
  )
}
