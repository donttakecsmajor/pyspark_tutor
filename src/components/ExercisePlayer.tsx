import { useMemo, useState } from 'react'
import type {
  BugExercise,
  CodePysparkExercise,
  CodeSqlExercise,
  Exercise,
  FillExercise,
  MatchExercise,
  McqExercise,
  ReorderExercise,
  TeachExercise,
} from '../types/curriculum'
import { checkFill, checkPyspark, shuffle } from '../engine/checkAnswer'
import { runUserQuery, rowsEqual } from '../engine/sqlRunner'
import { Check, X } from 'lucide-react'

interface Props {
  exercise: Exercise
  onResult: (correct: boolean) => void
}

export function ExercisePlayer({ exercise, onResult }: Props) {
  switch (exercise.type) {
    case 'teach':
      return <TeachView ex={exercise} onResult={onResult} />
    case 'mcq':
      return <McqView ex={exercise} onResult={onResult} />
    case 'fill':
      return <FillView ex={exercise} onResult={onResult} />
    case 'match':
      return <MatchView ex={exercise} onResult={onResult} />
    case 'reorder':
      return <ReorderView ex={exercise} onResult={onResult} />
    case 'bug':
      return <BugView ex={exercise} onResult={onResult} />
    case 'code_sql':
      return <CodeSqlView ex={exercise} onResult={onResult} />
    case 'code_pyspark':
      return <CodePsView ex={exercise} onResult={onResult} />
    default:
      return null
  }
}

function Feedback({
  correct,
  explanation,
  onContinue,
}: {
  correct: boolean
  explanation: string
  onContinue: () => void
}) {
  return (
    <div
      className={`mt-4 rounded-xl border p-4 ${
        correct
          ? 'border-green-200 bg-green-50 text-success'
          : 'border-red-200 bg-red-50 text-danger'
      }`}
    >
      <div className="mb-1 flex items-center gap-2 font-semibold">
        {correct ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
        {correct ? 'Correct' : 'Not quite'}
      </div>
      <p className="text-sm text-ink">{explanation}</p>
      <button
        type="button"
        onClick={onContinue}
        className="mt-3 w-full rounded-xl bg-brand py-3 font-semibold text-white"
      >
        Continue
      </button>
    </div>
  )
}

function TeachView({
  ex,
  onResult,
}: {
  ex: TeachExercise
  onResult: (c: boolean) => void
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-ink">{ex.title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
        {ex.body}
      </p>
      {ex.code ? (
        <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-teal-100">
          <code>{ex.code}</code>
        </pre>
      ) : null}
      <button
        type="button"
        className="mt-6 w-full rounded-xl bg-brand py-3.5 font-semibold text-white"
        onClick={() => onResult(true)}
      >
        Got it
      </button>
    </div>
  )
}

function McqView({ ex, onResult }: { ex: McqExercise; onResult: (c: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const correct = picked === ex.answerIndex

  return (
    <div>
      <h2 className="text-lg font-semibold">{ex.prompt}</h2>
      {ex.code ? (
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-teal-100">
          <code>{ex.code}</code>
        </pre>
      ) : null}
      <div className="mt-4 flex flex-col gap-2">
        {ex.choices.map((c, i) => (
          <button
            key={c}
            type="button"
            disabled={done}
            onClick={() => setPicked(i)}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
              picked === i
                ? 'border-brand bg-surface-2'
                : 'border-slate-200 bg-white hover:border-teal-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      {!done ? (
        <button
          type="button"
          disabled={picked === null}
          className="mt-6 w-full rounded-xl bg-brand py-3.5 font-semibold text-white disabled:opacity-40"
          onClick={() => setDone(true)}
        >
          Check
        </button>
      ) : (
        <Feedback
          correct={correct}
          explanation={ex.explanation}
          onContinue={() => onResult(correct)}
        />
      )}
    </div>
  )
}

function FillView({ ex, onResult }: { ex: FillExercise; onResult: (c: boolean) => void }) {
  const parts = ex.template.split('___')
  const [answers, setAnswers] = useState(() => ex.blanks.map(() => ''))
  const [done, setDone] = useState(false)
  const correct = checkFill(ex, answers)

  return (
    <div>
      <h2 className="text-lg font-semibold">{ex.prompt}</h2>
      <div className="mt-4 rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-teal-100">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < answers.length ? (
              <input
                value={answers[i]}
                disabled={done}
                onChange={(e) => {
                  const next = [...answers]
                  next[i] = e.target.value
                  setAnswers(next)
                }}
                className="mx-1 inline-block w-28 rounded border border-teal-500/40 bg-slate-800 px-2 py-0.5 text-amber-200 outline-none"
              />
            ) : null}
          </span>
        ))}
      </div>
      {!done ? (
        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-brand py-3.5 font-semibold text-white"
          onClick={() => setDone(true)}
        >
          Check
        </button>
      ) : (
        <Feedback
          correct={correct}
          explanation={ex.explanation}
          onContinue={() => onResult(correct)}
        />
      )}
    </div>
  )
}

function MatchView({ ex, onResult }: { ex: MatchExercise; onResult: (c: boolean) => void }) {
  const lefts = useMemo(() => ex.pairs.map((p) => p.left), [ex])
  const rights = useMemo(() => shuffle(ex.pairs.map((p) => p.right)), [ex])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [pairs, setPairs] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)

  const correct =
    ex.pairs.every((p) => pairs[p.left] === p.right) &&
    Object.keys(pairs).length === ex.pairs.length

  function pickRight(r: string) {
    if (!selectedLeft || done) return
    setPairs((prev) => ({ ...prev, [selectedLeft]: r }))
    setSelectedLeft(null)
  }

  const usedRights = new Set(Object.values(pairs))

  return (
    <div>
      <h2 className="text-lg font-semibold">{ex.prompt}</h2>
      <p className="mt-1 text-sm text-ink-muted">Tap left, then matching right.</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {lefts.map((l) => (
            <button
              key={l}
              type="button"
              disabled={done || !!pairs[l]}
              onClick={() => setSelectedLeft(l)}
              className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium ${
                selectedLeft === l
                  ? 'border-brand bg-surface-2'
                  : pairs[l]
                    ? 'border-green-200 bg-green-50 opacity-70'
                    : 'border-slate-200 bg-white'
              }`}
            >
              {l}
              {pairs[l] ? (
                <span className="mt-1 block text-[10px] text-ink-muted">→ {pairs[l]}</span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {rights.map((r) => (
            <button
              key={r}
              type="button"
              disabled={done || usedRights.has(r)}
              onClick={() => pickRight(r)}
              className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium ${
                usedRights.has(r)
                  ? 'border-slate-100 bg-slate-50 text-slate-400'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      {!done ? (
        <button
          type="button"
          disabled={Object.keys(pairs).length < ex.pairs.length}
          className="mt-6 w-full rounded-xl bg-brand py-3.5 font-semibold text-white disabled:opacity-40"
          onClick={() => setDone(true)}
        >
          Check
        </button>
      ) : (
        <Feedback
          correct={correct}
          explanation={ex.explanation}
          onContinue={() => onResult(correct)}
        />
      )}
    </div>
  )
}

function ReorderView({
  ex,
  onResult,
}: {
  ex: ReorderExercise
  onResult: (c: boolean) => void
}) {
  const [items, setItems] = useState(() => shuffle(ex.items))
  const [done, setDone] = useState(false)
  const correct = items.every((it, i) => it === ex.items[i])

  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    setItems(next)
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">{ex.prompt}</h2>
      <p className="mt-1 text-sm text-ink-muted">Use arrows to order top → bottom.</p>
      <ul className="mt-4 flex flex-col gap-2">
        {items.map((it, i) => (
          <li
            key={`${it}-${i}`}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
          >
            <span className="flex-1 text-sm font-medium">{it}</span>
            <button
              type="button"
              disabled={done}
              className="rounded-lg bg-surface-2 px-2 py-1 text-xs"
              onClick={() => move(i, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              disabled={done}
              className="rounded-lg bg-surface-2 px-2 py-1 text-xs"
              onClick={() => move(i, 1)}
            >
              ↓
            </button>
          </li>
        ))}
      </ul>
      {!done ? (
        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-brand py-3.5 font-semibold text-white"
          onClick={() => setDone(true)}
        >
          Check
        </button>
      ) : (
        <Feedback
          correct={correct}
          explanation={ex.explanation}
          onContinue={() => onResult(correct)}
        />
      )}
    </div>
  )
}

function BugView({ ex, onResult }: { ex: BugExercise; onResult: (c: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const correct = picked === ex.bugLineIndex

  return (
    <div>
      <h2 className="text-lg font-semibold">{ex.prompt}</h2>
      <div className="mt-4 overflow-hidden rounded-xl bg-slate-900 font-mono text-xs text-teal-100">
        {ex.lines.map((line, i) => (
          <button
            key={i}
            type="button"
            disabled={done}
            onClick={() => setPicked(i)}
            className={`flex w-full gap-3 border-b border-slate-800 px-3 py-2 text-left ${
              picked === i ? 'bg-amber-500/20' : ''
            }`}
          >
            <span className="w-5 shrink-0 text-slate-500">{i + 1}</span>
            <span>{line || ' '}</span>
          </button>
        ))}
      </div>
      {!done ? (
        <button
          type="button"
          disabled={picked === null}
          className="mt-6 w-full rounded-xl bg-brand py-3.5 font-semibold text-white disabled:opacity-40"
          onClick={() => setDone(true)}
        >
          Check
        </button>
      ) : (
        <Feedback
          correct={correct}
          explanation={ex.explanation}
          onContinue={() => onResult(correct)}
        />
      )}
    </div>
  )
}

function CodeSqlView({
  ex,
  onResult,
}: {
  ex: CodeSqlExercise
  onResult: (c: boolean) => void
}) {
  const [code, setCode] = useState(ex.starter ?? 'SELECT ')
  const [done, setDone] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function check() {
    setBusy(true)
    setErr(null)
    const res = await runUserQuery(ex.schemaSql, ex.seedSql, code)
    setBusy(false)
    if (res.error) {
      setErr(res.error)
      setCorrect(false)
      setDone(true)
      return
    }
    const ok = rowsEqual(res.rows, ex.expectedRows)
    setCorrect(ok)
    setDone(true)
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">{ex.prompt}</h2>
      <p className="mt-1 text-xs text-ink-muted">Runs in your browser (SQLite via sql.js).</p>
      <textarea
        value={code}
        disabled={done}
        onChange={(e) => setCode(e.target.value)}
        rows={6}
        className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-900 p-3 font-mono text-sm text-teal-100 outline-none focus:border-brand"
      />
      {err ? <p className="mt-2 text-sm text-danger">{err}</p> : null}
      {!done ? (
        <button
          type="button"
          disabled={busy}
          className="mt-6 w-full rounded-xl bg-brand py-3.5 font-semibold text-white disabled:opacity-40"
          onClick={() => void check()}
        >
          {busy ? 'Running…' : 'Run & check'}
        </button>
      ) : (
        <Feedback
          correct={correct}
          explanation={ex.explanation}
          onContinue={() => onResult(correct)}
        />
      )}
    </div>
  )
}

function CodePsView({
  ex,
  onResult,
}: {
  ex: CodePysparkExercise
  onResult: (c: boolean) => void
}) {
  const [code, setCode] = useState(ex.starter ?? '')
  const [done, setDone] = useState(false)
  const correct = checkPyspark(ex, code)

  return (
    <div>
      <h2 className="text-lg font-semibold">{ex.prompt}</h2>
      {ex.context ? (
        <p className="mt-2 rounded-lg bg-accent-soft px-3 py-2 text-sm text-ink">{ex.context}</p>
      ) : null}
      <textarea
        value={code}
        disabled={done}
        onChange={(e) => setCode(e.target.value)}
        rows={7}
        className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-900 p-3 font-mono text-sm text-teal-100 outline-none"
      />
      {!done ? (
        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-brand py-3.5 font-semibold text-white"
          onClick={() => setDone(true)}
        >
          Check
        </button>
      ) : (
        <Feedback
          correct={correct}
          explanation={ex.explanation}
          onContinue={() => onResult(correct)}
        />
      )}
    </div>
  )
}
