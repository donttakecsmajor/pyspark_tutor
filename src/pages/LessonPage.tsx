import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Flame, Target, Zap } from 'lucide-react'
import { getChapter, getStep } from '../lib/curriculumApi'
import { ExercisePlayer } from '../components/ExercisePlayer'
import { LessonFrame } from '../components/LessonFrame'
import { Confetti } from '../components/Confetti'
import { Mascot } from '../components/Mascot'
import { WaitlistForm } from '../components/WaitlistForm'
import { waitlistVisible } from '../lib/waitlist'
import { useProgress } from '../store/progressStore'
import { exercisePrompt, exerciseTags, isGraded } from '../engine/checkAnswer'

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className={`flex-1 rounded-2xl border-2 bg-white ${tone}`}>
      <p className="px-2 pt-1.5 text-center text-[11px] font-extrabold tracking-wider text-white uppercase">{label}</p>
      <div className="flex items-center justify-center gap-1.5 rounded-xl bg-white px-2 py-3 text-lg font-extrabold text-ink">
        {icon}
        {value}
      </div>
    </div>
  )
}

export function LessonPage() {
  const { chapterId = '', stepId = '' } = useParams()
  const navigate = useNavigate()
  const chapter = getChapter(chapterId)
  const step = getStep(chapterId, stepId)
  const { completeStep, addReview, onboardingDone, completedSteps, streak } = useProgress()
  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const [gradedCount, setGradedCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  // Captured once: after completeStep runs, "already done" would read true.
  const [firstTime] = useState(() => !completedSteps.includes(stepId))
  // Visitors arriving from a shared link haven't onboarded.
  const isGuest = !onboardingDone

  const exercises = step?.exercises ?? []
  const current = exercises[index]
  const home = isGuest ? '/welcome' : '/'

  if (!chapter || !step || !current) {
    return (
      <div className="p-6">
        <p className="font-bold">Lesson not found.</p>
        <Link to={home} className="font-bold text-brand">
          Back
        </Link>
      </div>
    )
  }

  const nextStep = chapter.steps[chapter.steps.findIndex((s) => s.id === step.id) + 1]

  function handleResult(correct: boolean) {
    if (!current || !chapter || !step) return
    if (isGraded(current)) {
      setGradedCount((n) => n + 1)
      if (correct) setCorrectCount((n) => n + 1)
      else
        addReview({
          exerciseId: current.id,
          track: chapter.track,
          chapterId: chapter.id,
          prompt: exercisePrompt(current),
          tags: exerciseTags(current),
        })
    }
    if (index + 1 >= exercises.length) {
      completeStep(step.id, chapter.id, step.xp)
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
  }

  if (finished) {
    const accuracy = gradedCount ? Math.round((correctCount / gradedCount) * 100) : 100
    return (
      <div className="flex min-h-dvh flex-col bg-white px-6 pt-14 pb-10 text-center">
        <Confetti />
        <div className="anim-pop mx-auto">
          <Mascot size={132} mood="cheer" />
        </div>
        <h1 className="mt-4 text-3xl font-extrabold text-ink">Lesson complete!</h1>
        <p className="mt-1 font-bold text-ink-muted">{step.title}</p>
        <div className="mt-6 flex gap-3">
          <StatCard
            tone="border-accent bg-accent"
            label="XP"
            value={`+${firstTime ? step.xp : 0}`}
            icon={<Zap className="h-5 w-5 fill-accent text-accent" />}
          />
          <StatCard
            tone="border-brand bg-brand"
            label="Accuracy"
            value={`${accuracy}%`}
            icon={<Target className="h-5 w-5 text-brand" />}
          />
          <StatCard
            tone="border-danger bg-danger"
            label="Streak"
            value={`${streak}`}
            icon={<Flame className="h-5 w-5 fill-accent text-accent" />}
          />
        </div>
        {!firstTime ? (
          <p className="mt-3 text-sm font-semibold text-ink-muted">Practice run: XP counts the first time only.</p>
        ) : null}
        <div className="mt-auto flex flex-col gap-3 pt-10">
          {isGuest ? (
            <>
              <Link to="/welcome" className="btn btn-primary">
                Set up my learning plan
              </Link>
              {waitlistVisible ? (
                <div className="rounded-2xl border-2 border-line p-4 text-left">
                  <WaitlistForm source="lesson-complete" />
                </div>
              ) : null}
            </>
          ) : nextStep ? (
            <>
              <Link to={`/lesson/${chapter.id}/${nextStep.id}`} replace className="btn btn-primary">
                Next lesson
              </Link>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
                Back to path
              </button>
            </>
          ) : (
            <Link to="/" className="btn btn-primary">
              Continue
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <LessonFrame
      progress={index / exercises.length}
      onClose={() => {
        if (index === 0 || confirm('Quit this lesson? Your progress in it will be lost.')) navigate(home)
      }}
    >
      <p className="mb-3 text-xs font-extrabold tracking-wider text-ink-muted uppercase">
        {chapter.title} · {step.title}
      </p>
      <ExercisePlayer key={current.id} exercise={current} onResult={handleResult} />
    </LessonFrame>
  )
}
