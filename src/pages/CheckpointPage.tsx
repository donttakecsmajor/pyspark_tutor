import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getChapter, nextChapterId } from '../lib/curriculumApi'
import { ExercisePlayer } from '../components/ExercisePlayer'
import { useProgress } from '../store/progressStore'
import { exercisePrompt, exerciseTags } from '../engine/checkAnswer'
import type { Exercise } from '../types/curriculum'

export function CheckpointPage() {
  const { chapterId = '' } = useParams()
  const chapter = getChapter(chapterId)
  const navigate = useNavigate()
  const { recordCheckpoint, addReview, completedSteps } = useProgress()

  const questions = useMemo(() => {
    if (!chapter) return [] as Exercise[]
    return chapter.checkpoint.filter((e) => e.type !== 'teach')
  }, [chapter])

  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [passed, setPassed] = useState(false)

  const current = questions[index]
  const allStepsDone = chapter?.steps.every((s) => completedSteps.includes(s.id))

  if (!chapter) {
    return (
      <div className="p-6">
        <p>Chapter not found.</p>
        <Link to="/">Back</Link>
      </div>
    )
  }

  if (!allStepsDone) {
    return (
      <div className="p-6">
        <p className="font-semibold">Finish all steps before the checkpoint.</p>
        <Link to="/" className="mt-3 inline-block text-brand">
          Back to path
        </Link>
      </div>
    )
  }

  function finish(finalCorrect: number) {
    if (!chapter) return
    const pct = Math.round((finalCorrect / questions.length) * 100)
    const ok = pct >= chapter.passScore
    setScore(pct)
    setPassed(ok)
    setFinished(true)
    recordCheckpoint(chapter.id, pct, ok, nextChapterId(chapter.id))
  }

  function handleResult(correct: boolean) {
    if (!chapter || !current) return
    const nextCorrect = correctCount + (correct ? 1 : 0)
    if (!correct) {
      addReview({
        exerciseId: current.id,
        track: chapter.track,
        chapterId: chapter.id,
        prompt: exercisePrompt(current),
        tags: exerciseTags(current),
      })
    }
    setCorrectCount(nextCorrect)
    if (index + 1 >= questions.length) {
      finish(nextCorrect)
      return
    }
    setIndex((i) => i + 1)
  }

  if (finished) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Checkpoint</p>
        <h1 className="mt-2 font-display text-3xl font-bold">
          {passed ? 'Chapter cleared' : 'Keep practicing'}
        </h1>
        <p className="mt-3 text-5xl font-bold text-brand">{score}%</p>
        <p className="mt-2 text-ink-muted">
          Pass mark {chapter.passScore}% · {correctCount}/{questions.length} correct
        </p>
        <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
          <button
            type="button"
            className="w-full rounded-xl bg-brand py-3.5 font-semibold text-white"
            onClick={() => navigate('/')}
          >
            Back to path
          </button>
          {!passed ? (
            <button
              type="button"
              className="w-full rounded-xl border border-slate-200 bg-white py-3.5 font-semibold"
              onClick={() => {
                setIndex(0)
                setCorrectCount(0)
                setFinished(false)
              }}
            >
              Retry checkpoint
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="flex min-h-dvh flex-col px-4 pt-4 pb-8">
      <div className="mb-3 flex items-center gap-2">
        <button type="button" onClick={() => navigate('/')} className="rounded-lg p-2 text-ink-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-ink-muted">Untimed checkpoint</p>
          <p className="font-semibold">{chapter.title}</p>
        </div>
        <span className="text-sm text-ink-muted">
          {index + 1}/{questions.length}
        </span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-slate-800 transition-all"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>
      <ExercisePlayer key={current.id} exercise={current} onResult={handleResult} />
    </div>
  )
}
