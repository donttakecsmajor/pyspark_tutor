import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useProgress } from '../store/progressStore'
import { allChapters, chaptersForTrack } from '../lib/curriculumApi'
import { MINUTES_TO_XP } from '../lib/plan'
import { TRACK_COLORS } from '../lib/theme'
import type { TrackId } from '../types/curriculum'
import type { Experience } from '../types/progress'
import { Mascot } from '../components/Mascot'
import { WaitlistForm } from '../components/WaitlistForm'
import { waitlistVisible } from '../lib/waitlist'

type Step = 'hero' | 'track' | 'level' | 'goal'
const ORDER: Step[] = ['hero', 'track', 'level', 'goal']

const TRACKS: { id: TrackId; label: string; blurb: string }[] = [
  { id: 'sql', label: 'SQL', blurb: 'Start here if you work with data. Queries run right in your browser.' },
  { id: 'pyspark', label: 'PySpark', blurb: 'DataFrames, shuffles and tuning for big-data pipelines.' },
  { id: 'bridge', label: 'SQL ↔ PySpark', blurb: 'Know SQL already? Learn Spark by translating what you know.' },
]

const LEVELS: { id: Experience; title: string; blurb: string }[] = [
  { id: 'new', title: "I'm brand new", blurb: 'Start from the very first lesson.' },
  { id: 'some', title: "I've tried it a bit", blurb: 'A quick level check, then we skip what you know.' },
  { id: 'work', title: 'I use it at work', blurb: 'Show me the tricky parts. Skip the basics.' },
]

const GOALS: { minutes: number; label: string }[] = [
  { minutes: 5, label: 'Casual' },
  { minutes: 10, label: 'Regular' },
  { minutes: 15, label: 'Serious' },
  { minutes: 20, label: 'Intense' },
]

function sampleLessonPath(track: TrackId): string | null {
  const chapter = chaptersForTrack(track)[0]
  const step = chapter?.steps[0]
  return chapter && step ? `/lesson/${chapter.id}/${step.id}` : null
}

export function WelcomePage() {
  const navigate = useNavigate()
  const onboardingDone = useProgress((s) => s.onboardingDone)
  const chapters = allChapters()
  const stepCount = chapters.reduce((n, c) => n + c.steps.length, 0)

  const [step, setStep] = useState<Step>('hero')
  const [track, setTrack] = useState<TrackId>('sql')
  const [level, setLevel] = useState<Experience>('new')

  const stepIndex = ORDER.indexOf(step)
  const back = () => setStep(ORDER[Math.max(0, stepIndex - 1)])

  function finish(minutes: number) {
    const dailyGoalXp = MINUTES_TO_XP[minutes]
    if (level === 'new') {
      navigate(`/plan/${track}`, { state: { experience: level, dailyGoalXp, theta: 1, startIndex: 0 } })
    } else {
      navigate(`/placement/${track}`, { state: { experience: level, dailyGoalXp } })
    }
  }

  if (step === 'hero') {
    const sample = sampleLessonPath('sql')
    return (
      <div className="flex min-h-dvh flex-col bg-white px-6 pt-12 pb-10">
        <div className="anim-pop mx-auto">
          <Mascot size={140} mood="happy" />
        </div>
        <h1 className="mt-4 text-center text-[34px] leading-[1.1] font-extrabold text-ink">
          Learn SQL &amp; PySpark in 5 minutes a day
        </h1>
        <p className="mt-3 text-center text-[16px] leading-relaxed font-semibold text-ink-muted">
          Short, hands-on lessons that start at <em>your</em> level. Write real queries, fix real bugs,
          build the skills data jobs ask for.
        </p>
        <p className="mt-3 text-center text-sm font-bold text-ink-muted">
          {chapters.length} units · {stepCount} lessons · free to try
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {onboardingDone ? (
            <Link to="/" className="btn btn-primary">
              Continue learning
            </Link>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setStep('track')}>
              Get started
            </button>
          )}
          {sample && !onboardingDone ? (
            <Link to={sample} className="btn btn-secondary">
              Try a lesson first
            </Link>
          ) : null}
        </div>

        {waitlistVisible ? (
          <div className="card mt-8 p-4">
            <WaitlistForm source="welcome" />
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white px-5 pt-5 pb-8">
      <div className="flex items-center gap-3">
        <button type="button" aria-label="Back" onClick={back} className="rounded-full p-1.5 text-ink-muted hover:bg-surface">
          <ArrowLeft className="h-7 w-7" strokeWidth={3} />
        </button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-success transition-all duration-500"
            style={{ width: `${(stepIndex / (ORDER.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {step === 'track' ? (
        <>
          <div className="mt-6 flex items-end gap-3">
            <Mascot size={72} mood="think" />
            <div className="mb-2 rounded-2xl rounded-bl-sm bg-brand-soft px-4 py-2 font-extrabold text-brand-dark">
              What do you want to learn?
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            {TRACKS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="choice"
                data-selected={track === t.id}
                style={track === t.id ? { borderColor: TRACK_COLORS[t.id].main, background: TRACK_COLORS[t.id].soft } : undefined}
                onClick={() => setTrack(t.id)}
              >
                <span className="block text-lg font-extrabold">{t.label}</span>
                <span className="mt-0.5 block text-sm font-semibold text-ink-muted">{t.blurb}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      {step === 'level' ? (
        <>
          <div className="mt-6 flex items-end gap-3">
            <Mascot size={72} mood="think" />
            <div className="mb-2 rounded-2xl rounded-bl-sm bg-brand-soft px-4 py-2 font-extrabold text-brand-dark">
              How much do you know already?
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                type="button"
                className="choice"
                data-selected={level === l.id}
                onClick={() => setLevel(l.id)}
              >
                <span className="block text-lg font-extrabold">{l.title}</span>
                <span className="mt-0.5 block text-sm font-semibold text-ink-muted">{l.blurb}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      {step === 'goal' ? (
        <>
          <div className="mt-6 flex items-end gap-3">
            <Mascot size={72} mood="happy" />
            <div className="mb-2 rounded-2xl rounded-bl-sm bg-brand-soft px-4 py-2 font-extrabold text-brand-dark">
              How much time per day?
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            {GOALS.map((g) => (
              <button key={g.minutes} type="button" className="choice flex items-center justify-between" onClick={() => finish(g.minutes)}>
                <span className="text-lg font-extrabold">{g.minutes} min / day</span>
                <span className="text-sm font-bold text-ink-muted">{g.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-sm font-semibold text-ink-muted">
            {level === 'new'
              ? "Next: we'll build your plan."
              : "Next: a short level check so we can skip what you already know."}
          </p>
        </>
      ) : null}

      {step !== 'goal' ? (
        <button
          type="button"
          className="btn btn-primary mt-auto !mt-8"
          onClick={() => setStep(ORDER[stepIndex + 1])}
        >
          Continue
        </button>
      ) : null}
    </div>
  )
}
