import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import type { TrackId } from '../types/curriculum'
import type { Experience } from '../types/progress'
import { ExercisePlayer } from '../components/ExercisePlayer'
import { LessonFrame } from '../components/LessonFrame'
import { useProgress } from '../store/progressStore'
import { chaptersForTrack } from '../lib/curriculumApi'
import { TRACK_LABELS } from '../lib/theme'
import { getPlacement } from '../data/placement'
import {
  PLACEMENT_MAX_QUESTIONS,
  pickNextQuestion,
  placementFinished,
  recommendedStartIndex,
  recordPlacementAnswer,
  startPlacement,
} from '../lib/plan'

interface FlowState {
  experience?: Experience | null
  dailyGoalXp?: number
}

/** Adaptive level check: each answer moves the next question harder or easier. */
export function PlacementPage() {
  const { track = 'sql' } = useParams<{ track: TrackId }>()
  const t = track as TrackId
  const navigate = useNavigate()
  const flow = (useLocation().state ?? {}) as FlowState
  const storedExperience = useProgress((s) => s.experience)
  const experience = flow.experience ?? storedExperience

  const bank = useMemo(() => getPlacement(t), [t])
  const chapters = useMemo(() => chaptersForTrack(t), [t])
  const [state, setState] = useState(() => startPlacement(experience))
  const current = useMemo(() => pickNextQuestion(bank, state), [bank, state])
  const total = Math.min(PLACEMENT_MAX_QUESTIONS, bank.length)

  function goToPlan(theta: number, startIndex: number) {
    navigate(`/plan/${t}`, { state: { ...flow, experience, theta, startIndex }, replace: true })
  }

  function handleResult(correct: boolean) {
    if (!current) return
    const next = recordPlacementAnswer(state, current, correct)
    if (placementFinished(next, bank)) {
      goToPlan(next.theta, recommendedStartIndex(next, bank, chapters))
      return
    }
    setState(next)
  }

  if (!bank.length || !current) {
    return (
      <div className="p-6">
        <p className="font-bold">No level-check questions for this track yet.</p>
        <Link to="/" className="font-bold text-brand">Back</Link>
      </div>
    )
  }

  return (
    <LessonFrame progress={state.answered / total} onClose={() => navigate(-1)} closeLabel="Back">
      <p className="mb-3 text-xs font-extrabold tracking-wider text-ink-muted uppercase">
        Level check · {TRACK_LABELS[t]} · {state.answered + 1} of {total}
      </p>
      <ExercisePlayer key={current.id} exercise={current.exercise} onResult={handleResult} />
      {state.answered === 0 ? (
        <button
          type="button"
          className="mt-6 text-sm font-extrabold text-brand"
          onClick={() => goToPlan(1, 0)}
        >
          Skip the level check and start from the beginning
        </button>
      ) : null}
    </LessonFrame>
  )
}
