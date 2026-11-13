import { Link } from 'react-router-dom'
import { Check, Crown, Lock, Star } from 'lucide-react'
import { useProgress } from '../store/progressStore'
import { chaptersForTrack } from '../lib/curriculumApi'
import { isChapterUnlocked } from '../lib/plan'
import { TRACK_COLORS } from '../lib/theme'
import { TopStats } from '../components/TopStats'
import { Mascot } from '../components/Mascot'

/** Horizontal wiggle (px) so the path snakes down the screen instead of a straight line. */
const WIGGLE = [0, -34, -52, -34, 0, 34, 52, 34]

type NodeState = 'done' | 'current' | 'open' | 'locked' | 'mastered'

function Node({
  state,
  color,
  dark,
  to,
  label,
  children,
}: {
  state: NodeState
  color: string
  dark: string
  to?: string
  label: string
  children: React.ReactNode
}) {
  const palette =
    state === 'locked'
      ? { face: '#d9dee8', edge: '#b7bfce', ink: '#8a94a8' }
      : state === 'done'
        ? { face: '#1fa95b', edge: '#168745', ink: '#fff' }
        : state === 'mastered'
          ? { face: '#8fd6a8', edge: '#5fb67f', ink: '#fff' }
          : { face: color, edge: dark, ink: '#fff' }
  const common = {
    className:
      'relative flex h-[72px] w-[72px] items-center justify-center rounded-full transition active:translate-y-[5px]',
    style: {
      background: palette.face,
      color: palette.ink,
      boxShadow: `0 6px 0 ${palette.edge}`,
    } as React.CSSProperties,
    'aria-label': label,
  }
  return to && state !== 'locked' ? (
    <Link to={to} {...common}>
      {children}
    </Link>
  ) : (
    <div {...common} aria-disabled>
      {children}
    </div>
  )
}

export function PathPage() {
  const progress = useProgress()
  const { activeTrack, completedSteps, checkpointHistory, masteredChapters } = progress
  const chapters = chaptersForTrack(activeTrack)
  const colors = TRACK_COLORS[activeTrack]

  // The single "you are here" step: first unfinished step in the first open, unfinished chapter.
  let currentStepId: string | undefined
  for (let ci = 0; ci < chapters.length && !currentStepId; ci++) {
    if (!isChapterUnlocked(ci, chapters, progress)) break
    if (masteredChapters.includes(chapters[ci].id)) continue
    currentStepId = chapters[ci].steps.find((s) => !completedSteps.includes(s.id))?.id
  }

  const placementDone = progress.placementDone[activeTrack]

  return (
    <div>
      <TopStats />
      <div className="px-4 pt-4 pb-6">
        {!placementDone ? (
          <Link
            to={`/placement/${activeTrack}`}
            state={{ experience: progress.experience, dailyGoalXp: progress.dailyGoalXp }}
            className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-accent bg-accent-soft px-4 py-3"
          >
            <Star className="h-6 w-6 shrink-0 fill-accent text-accent" />
            <div>
              <p className="font-extrabold text-ink">Not a beginner?</p>
              <p className="text-sm font-semibold text-ink-muted">
                Take a 2-minute level check and skip what you know.
              </p>
            </div>
          </Link>
        ) : null}

        {chapters.map((ch, ci) => {
          const unlocked = isChapterUnlocked(ci, chapters, progress)
          const mastered = masteredChapters.includes(ch.id)
          const passed = (checkpointHistory[ch.id] ?? []).some((a) => a.passed)
          const allDone = ch.steps.every((s) => completedSteps.includes(s.id))
          const doneCount = ch.steps.filter((s) => completedSteps.includes(s.id)).length

          return (
            <section key={ch.id} className="mb-8">
              <div
                className="rounded-2xl px-4 py-3 text-white"
                style={{ background: unlocked ? colors.main : '#aeb7c8', boxShadow: `0 4px 0 ${unlocked ? colors.dark : '#8f99ad'}` }}
              >
                <p className="text-xs font-extrabold tracking-widest uppercase opacity-90">
                  Unit {ci + 1}
                  {mastered ? ' · skipped via level check' : unlocked ? ` · ${doneCount}/${ch.steps.length}` : ' · locked'}
                </p>
                <h2 className="text-xl leading-tight font-extrabold">{ch.title}</h2>
                <p className="mt-0.5 text-[13px] leading-snug font-semibold opacity-90">{ch.description}</p>
              </div>

              {!unlocked ? (
                <Link
                  to={`/checkpoint/${ch.id}?testout=1`}
                  className="btn btn-secondary mt-3 !py-2.5 !text-[13px]"
                >
                  Already know this? Test out
                </Link>
              ) : null}

              <div className="mt-5 flex flex-col items-center gap-5">
                {ch.steps.map((st, si) => {
                  const done = completedSteps.includes(st.id)
                  const state: NodeState = !unlocked
                    ? 'locked'
                    : done
                      ? 'done'
                      : st.id === currentStepId
                        ? 'current'
                        : mastered
                          ? 'mastered'
                          : 'open'
                  return (
                    <div
                      key={st.id}
                      className="flex flex-col items-center"
                      style={{ transform: `translateX(${WIGGLE[si % WIGGLE.length]}px)` }}
                    >
                      {state === 'current' ? (
                        <div className="anim-bob mb-2 flex flex-col items-center">
                          <div className="rounded-xl border-2 border-line bg-white px-3 py-1 text-xs font-extrabold tracking-wider text-brand uppercase shadow-sm">
                            Start
                          </div>
                          <div className="-mt-px h-2 w-2 rotate-45 border-r-2 border-b-2 border-line bg-white" />
                        </div>
                      ) : null}
                      <Node
                        state={state}
                        color={colors.main}
                        dark={colors.dark}
                        to={`/lesson/${ch.id}/${st.id}`}
                        label={`${st.title}${done ? ' (done)' : ''}`}
                      >
                        {state === 'locked' ? (
                          <Lock className="h-7 w-7" strokeWidth={2.5} />
                        ) : state === 'done' || state === 'mastered' ? (
                          <Check className="h-8 w-8" strokeWidth={4} />
                        ) : (
                          <Star className="h-8 w-8 fill-white" strokeWidth={2} />
                        )}
                      </Node>
                      <p className="mt-2 max-w-[9.5rem] text-center text-xs font-bold text-ink-muted">
                        {st.title}
                      </p>
                    </div>
                  )
                })}

                <div className="flex flex-col items-center">
                  <Node
                    state={unlocked && (allDone || mastered) ? (passed || mastered ? 'done' : 'open') : 'locked'}
                    color="#1b2236"
                    dark="#0b1020"
                    to={`/checkpoint/${ch.id}`}
                    label="Chapter checkpoint"
                  >
                    {unlocked && (allDone || mastered) ? (
                      <Crown className="h-8 w-8 fill-amber-300 text-amber-300" strokeWidth={2} />
                    ) : (
                      <Lock className="h-7 w-7" strokeWidth={2.5} />
                    )}
                  </Node>
                  <p className="mt-2 text-xs font-bold text-ink-muted">Checkpoint</p>
                </div>
              </div>
            </section>
          )
        })}

        {chapters.length > 0 && chapters.every((c) => c.steps.every((s) => completedSteps.includes(s.id))) ? (
          <div className="flex flex-col items-center py-6 text-center">
            <Mascot size={72} mood="cheer" />
            <p className="mt-2 text-sm font-bold text-ink-muted">You finished the whole path. Nice.</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
