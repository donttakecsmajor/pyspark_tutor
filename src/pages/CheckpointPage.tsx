import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getChapter, nextChapterId } from '../lib/curriculumApi'
import { ExercisePlayer } from '../components/ExercisePlayer'
import { LessonFrame } from '../components/LessonFrame'
import { Confetti } from '../components/Confetti'
import { Mascot } from '../components/Mascot'
import { useProgress } from '../store/progressStore'
import { exercisePrompt, exerciseTags } from '../engine/checkAnswer'
import type { Exercise } from '../types/curriculum'

export function CheckpointPage() {
  const { chapterId = '' } = useParams()
  const [search] = useSearchParams()
  const testOut = search.get('testout') === '1'
  const chapter = getChapter(chapterId)
  const navigate = useNavigate()
  const { recordCheckpoint, markMastered, addReview, completedSteps } = useProgress()

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
        <p className="font-bold">Chapter not found.</p>
        <Link to="/" className="font-bold text-brand">Back</Link>
      </div>
    )
  }

  if (!allStepsDone && !testOut) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center">
        <Mascot size={96} mood="think" />
        <p className="mt-4 text-xl font-extrabold">Finish the lessons first</p>
        <p className="mt-1 font-semibold text-ink-muted">The checkpoint unlocks when every step is done.</p>
        <Link to="/" className="btn btn-primary mt-6 max-w-xs">
          Back to path
        </Link>
        <Link to={`/checkpoint/${chapter.id}?testout=1`} className="mt-4 text-sm font-extrabold text-brand">
          Or test out of this chapter
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
    const next = nextChapterId(chapter.id)
    recordCheckpoint(chapter.id, pct, ok, next)
    if (ok && testOut) markMastered(chapter.id, next)
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
      <div className="flex min-h-dvh flex-col items-center bg-white px-6 pt-16 pb-10 text-center">
        {passed ? <Confetti /> : null}
        <div className="anim-pop">
          <Mascot size={128} mood={passed ? 'cheer' : 'sad'} />
        </div>
        <h1 className="mt-4 text-3xl font-extrabold">
          {passed ? (testOut ? 'Tested out!' : 'Chapter cleared!') : 'So close'}
        </h1>
        <p className="mt-2 text-6xl font-extrabold text-brand">{score}%</p>
        <p className="mt-2 font-bold text-ink-muted">
          {correctCount}/{questions.length} correct · pass mark {chapter.passScore}%
        </p>
        <div className="mt-auto flex w-full max-w-sm flex-col gap-3 pt-10">
          <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
            Back to path
          </button>
          {!passed ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIndex(0)
                setCorrectCount(0)
                setFinished(false)
              }}
            >
              Try again
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  if (!current) return null

  return (
    <LessonFrame
      progress={index / questions.length}
      onClose={() => {
        if (index === 0 || confirm('Quit the checkpoint? Your answers so far will be lost.')) navigate('/')
      }}
    >
      <p className="mb-3 text-xs font-extrabold tracking-wider text-ink-muted uppercase">
        {testOut ? 'Test out' : 'Checkpoint'} · {chapter.title}
      </p>
      <ExercisePlayer key={current.id} exercise={current} onResult={handleResult} />
    </LessonFrame>
  )
}
