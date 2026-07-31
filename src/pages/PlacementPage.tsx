import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { PlacementQuestion, TrackId } from '../types/curriculum'
import { ExercisePlayer } from '../components/ExercisePlayer'
import { useProgress } from '../store/progressStore'
import { chaptersForTrack, TRACK_META } from '../lib/curriculumApi'
import { getPlacement } from '../data/placement'

export function PlacementPage() {
  const { track = 'sql' } = useParams<{ track: TrackId }>()
  const questions = useMemo(() => getPlacement(track as TrackId), [track])
  const [index, setIndex] = useState(0)
  const [scoreSum, setScoreSum] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [done, setDone] = useState(false)
  const [rating, setRating] = useState(1)
  const { finishPlacement } = useProgress()
  const navigate = useNavigate()

  const current: PlacementQuestion | undefined = questions[index]

  function computeRating(sum: number, count: number) {
    if (count === 0) return 1
    const avg = sum / count
    // map avg difficulty-weighted correctness 0-5 → rating 1-5
    return Math.max(1, Math.min(5, Math.round(avg * 10) / 10))
  }

  function unlockForRating(r: number) {
    const chapters = chaptersForTrack(track as TrackId)
    // unlock first chapter always; higher rating unlocks further chapters as starting point
    const startIndex = r >= 4 ? Math.min(6, chapters.length - 1) : r >= 3 ? Math.min(3, chapters.length - 1) : 0
    return chapters.slice(0, startIndex + 1).map((c) => c.id)
  }

  function handleResult(correct: boolean) {
    if (!current) return
    const gain = correct ? current.difficulty : current.difficulty * 0.15
    const nextSum = scoreSum + gain
    const nextAnswered = answered + 1
    setScoreSum(nextSum)
    setAnswered(nextAnswered)

    if (index + 1 >= questions.length) {
      const max = questions.reduce((s, q) => s + q.difficulty, 0)
      const r = computeRating((nextSum / max) * 5, 1)
      setRating(r)
      setDone(true)
      return
    }
    setIndex((i) => i + 1)
  }

  function confirm() {
    finishPlacement(track as TrackId, rating, unlockForRating(rating))
    navigate('/')
  }

  if (!questions.length) {
    return (
      <div className="p-6">
        <p>No placement questions.</p>
        <Link to="/">Back</Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-semibold text-ink-muted">
          {TRACK_META[track as TrackId].label} placement
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">Level {rating.toFixed(1)}</h1>
        <p className="mt-3 text-ink-muted">
          Untimed placement complete. Your path starts at a matching chapter.
        </p>
        <button
          type="button"
          onClick={confirm}
          className="mt-8 w-full max-w-sm rounded-xl bg-brand py-3.5 font-semibold text-white"
        >
          Start learning
        </button>
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="flex min-h-dvh flex-col px-4 pt-4 pb-8">
      <div className="mb-3 flex items-center gap-2">
        <button type="button" onClick={() => navigate('/')} className="p-2 text-ink-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-ink-muted">Untimed placement · {TRACK_META[track as TrackId].label}</p>
          <p className="font-semibold">
            Question {index + 1} / {questions.length}
          </p>
        </div>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-brand transition-all"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>
      <ExercisePlayer
        key={current.id}
        exercise={current.exercise}
        onResult={handleResult}
      />
    </div>
  )
}
