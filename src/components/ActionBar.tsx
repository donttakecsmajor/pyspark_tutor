import { useEffect } from 'react'
import { Check, X } from 'lucide-react'

export type BarState = 'disabled' | 'ready' | 'correct' | 'wrong'

interface Props {
  state: BarState
  onCheck: () => void
  onContinue: () => void
  /** Offer another attempt (code exercises). */
  onRetry?: () => void
  /** When false the learner must retry before continuing. Default true. */
  canContinue?: boolean
  explanation?: string
  correctAnswer?: string
  checkLabel?: string
  busy?: boolean
}

function buzz(correct: boolean) {
  try {
    navigator.vibrate?.(correct ? 15 : [30, 40, 30])
  } catch {
    // vibration is a nicety, never an error
  }
}

/**
 * Fixed bottom bar. Idle: a big Check button. After checking, it becomes a
 * green/red sheet with the explanation and the next action. Content above must
 * leave room (pb-56 on the scroll area).
 */
export function ActionBar({
  state,
  onCheck,
  onContinue,
  onRetry,
  canContinue = true,
  explanation,
  correctAnswer,
  checkLabel = 'Check',
  busy,
}: Props) {
  const result = state === 'correct' || state === 'wrong'
  useEffect(() => {
    if (result) buzz(state === 'correct')
  }, [result, state])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[480px]">
      {result ? (
        <div
          className={`anim-slide-up pointer-events-auto rounded-t-3xl px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] ${
            state === 'correct' ? 'bg-success-soft' : 'bg-danger-soft'
          }`}
          role="status"
        >
          <div
            className={`flex items-center gap-2 text-xl font-extrabold ${
              state === 'correct' ? 'text-success-dark' : 'text-danger-dark'
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${
                state === 'correct' ? 'bg-success' : 'bg-danger'
              }`}
            >
              {state === 'correct' ? <Check className="h-5 w-5" strokeWidth={3.5} /> : <X className="h-5 w-5" strokeWidth={3.5} />}
            </span>
            {state === 'correct' ? 'Nice work!' : 'Not quite'}
          </div>
          {correctAnswer && state === 'wrong' ? (
            <p className="mt-2 text-sm font-bold text-danger-dark">
              Correct answer: <span className="font-mono">{correctAnswer}</span>
            </p>
          ) : null}
          {explanation ? <p className="mt-2 text-[15px] leading-snug text-ink">{explanation}</p> : null}
          <div className="mt-4 flex flex-col gap-2.5">
            {state === 'wrong' && onRetry ? (
              <button type="button" className="btn btn-secondary" onClick={onRetry}>
                Try again
              </button>
            ) : null}
            {canContinue ? (
              <button
                type="button"
                className={`btn ${state === 'correct' ? 'btn-success' : 'btn-danger'}`}
                onClick={onContinue}
                autoFocus
              >
                Continue
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="pointer-events-auto border-t-2 border-line bg-white px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <button
            type="button"
            className="btn btn-primary"
            disabled={state === 'disabled' || busy}
            onClick={onCheck}
          >
            {busy ? 'Working…' : checkLabel}
          </button>
        </div>
      )}
    </div>
  )
}
