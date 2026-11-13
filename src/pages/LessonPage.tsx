import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Bookmark } from 'lucide-react'
import { getChapter, getStep } from '../lib/curriculumApi'
import { ExercisePlayer } from '../components/ExercisePlayer'
import { WaitlistForm } from '../components/WaitlistForm'
import { useProgress } from '../store/progressStore'
import { exercisePrompt, exerciseTags, isGraded } from '../engine/checkAnswer'

export function LessonPage() {
  const { chapterId = '', stepId = '' } = useParams()
  const navigate = useNavigate()
  const chapter = getChapter(chapterId)
  const step = getStep(chapterId, stepId)
  const { completeStep, addReview, toggleBookmark, bookmarks, notes, setNote } = useProgress()
  const [index, setIndex] = useState(0)
  const [showNote, setShowNote] = useState(false)
  const [finished, setFinished] = useState(false)
  // Visitors arriving from a shared link haven't onboarded; they get a
  // finish screen with next steps instead of being dropped on an empty path.
  const isGuest = !useProgress((s) => s.onboardingDone)

  const exercises = step?.exercises ?? []
  const current = exercises[index]
  const progressPct = exercises.length ? ((index + 1) / exercises.length) * 100 : 0

  const bookmarked = bookmarks.includes(stepId)

  const note = notes[stepId] ?? ''

  const title = useMemo(() => step?.title ?? '', [step])

  if (!chapter || !step || !current) {
    return (
      <div className="p-6">
        <p>Step not found.</p>
        <Link to="/" className="text-brand">
          Back
        </Link>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="flex min-h-dvh flex-col px-6 pt-16 pb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Lesson complete
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink">Nice work.</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
          You finished &ldquo;{step.title}&rdquo; from {chapter.title}. There&apos;s a full path
          after this one, and it&apos;s free to keep going.
        </p>
        <Link
          to="/welcome"
          className="mt-8 rounded-xl bg-brand py-3.5 text-center font-semibold text-white"
        >
          Continue learning
        </Link>
        <div className="mt-8 rounded-xl border border-teal-100 bg-white/80 p-4">
          <WaitlistForm source="lesson-complete" />
        </div>
      </div>
    )
  }

  function handleResult(correct: boolean) {
    if (!current || !chapter || !step) return
    if (isGraded(current) && !correct) {
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
      if (isGuest) {
        setFinished(true)
        return
      }
      navigate('/', { replace: true })
      return
    }
    setIndex((i) => i + 1)
  }

  return (
    <div className="flex min-h-dvh flex-col px-4 pt-4 pb-8">
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(isGuest ? '/welcome' : '/')}
          className="rounded-lg p-2 text-ink-muted hover:bg-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-ink-muted">{chapter.title}</p>
          <p className="font-semibold">{title}</p>
        </div>
        <button
          type="button"
          onClick={() => toggleBookmark(stepId)}
          className={`rounded-lg p-2 ${bookmarked ? 'text-accent' : 'text-ink-muted'}`}
        >
          <Bookmark className="h-5 w-5" fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full bg-brand transition-all" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="flex-1">
        <ExercisePlayer key={current.id} exercise={current} onResult={handleResult} />
      </div>

      <button
        type="button"
        className="mt-4 text-sm text-ink-muted underline"
        onClick={() => setShowNote((s) => !s)}
      >
        {showNote ? 'Hide notes' : 'Personal notes'}
      </button>
      {showNote ? (
        <textarea
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
          rows={3}
          value={note}
          placeholder="Notes for this step…"
          onChange={(e) => setNote(stepId, e.target.value)}
        />
      ) : null}
    </div>
  )
}
