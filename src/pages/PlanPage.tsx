import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CalendarCheck, Check } from 'lucide-react'
import type { TrackId } from '../types/curriculum'
import type { Experience } from '../types/progress'
import { Mascot } from '../components/Mascot'
import { useProgress } from '../store/progressStore'
import { chaptersForTrack } from '../lib/curriculumApi'
import { MINUTES_TO_XP, computePlan, levelLabel } from '../lib/plan'
import { TRACK_COLORS, TRACK_LABELS } from '../lib/theme'

interface FlowState {
  experience?: Experience | null
  dailyGoalXp?: number
  theta?: number
  startIndex?: number
}

const GOALS = [5, 10, 15, 20]

/** The payoff of onboarding: where you start, how fast, and when you'll finish. */
export function PlanPage() {
  const { track = 'sql' } = useParams<{ track: TrackId }>()
  const t = track as TrackId
  const navigate = useNavigate()
  const flow = (useLocation().state ?? {}) as FlowState
  const store = useProgress()
  const chapters = chaptersForTrack(t)
  const colors = TRACK_COLORS[t]

  const [startIndex, setStartIndex] = useState(Math.min(flow.startIndex ?? 0, Math.max(0, chapters.length - 1)))
  const [goal, setGoal] = useState(flow.dailyGoalXp ?? store.dailyGoalXp)
  const theta = flow.theta ?? 1
  const plan = computePlan(chapters, startIndex, goal)
  const placed = flow.theta !== undefined

  function begin() {
    store.startPlan({
      track: t,
      startIndex,
      rating: theta,
      dailyGoalXp: goal,
      experience: flow.experience ?? store.experience,
    })
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white px-5 pt-10 pb-8">
      <div className="anim-pop mx-auto">
        <Mascot size={104} mood="cheer" />
      </div>
      <h1 className="mt-3 text-center text-3xl leading-tight font-extrabold text-ink">Your plan is ready</h1>
      <p className="mt-1 text-center font-bold text-ink-muted">
        {TRACK_LABELS[t]}
        {placed ? ` · we put you at: ${levelLabel(theta)}` : ' · starting from the basics'}
      </p>

      <section className="mt-6">
        <h2 className="text-sm font-extrabold tracking-wider text-ink-muted uppercase">Where to start</h2>
        <div className="mt-2 flex flex-col gap-2">
          {chapters.map((c, i) => {
            const selected = i === startIndex
            const skipped = i < startIndex
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setStartIndex(i)}
                className="choice flex items-center gap-3 !py-3"
                data-selected={selected}
                style={selected ? { borderColor: colors.main, background: colors.soft } : undefined}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
                  style={{ background: skipped ? '#8fd6a8' : selected ? colors.main : '#c7cedb' }}
                >
                  {skipped ? <Check className="h-4 w-4" strokeWidth={4} /> : i + 1}
                </span>
                <span className="flex-1">
                  <span className="block text-[15px]">{c.title}</span>
                  <span className="block text-xs font-semibold text-ink-muted">
                    {skipped ? 'You can skip this' : selected ? 'Start here' : `${c.steps.length} lessons`}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-xs font-semibold text-ink-muted">
          Skipped units stay open: you can review them any time.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-extrabold tracking-wider text-ink-muted uppercase">Daily goal</h2>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {GOALS.map((m) => (
            <button
              key={m}
              type="button"
              className="choice !px-1 !py-2.5 text-center"
              data-selected={goal === MINUTES_TO_XP[m]}
              onClick={() => setGoal(MINUTES_TO_XP[m])}
            >
              <span className="block text-lg font-extrabold">{m}</span>
              <span className="block text-[11px] font-bold text-ink-muted">min/day</span>
            </button>
          ))}
        </div>
      </section>

      <div className="card mt-6 flex items-center gap-3 p-4">
        <CalendarCheck className="h-8 w-8 shrink-0 text-brand" />
        <p className="text-[15px] leading-snug font-bold text-ink">
          {plan.stepsRemaining} lessons at {plan.stepsPerDay} a day: finish by{' '}
          <span className="text-brand">
            {plan.finishDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          .
        </p>
      </div>

      <button type="button" className="btn btn-primary mt-auto mb-0 !mt-8" onClick={begin}>
        Start learning
      </button>
    </div>
  )
}
