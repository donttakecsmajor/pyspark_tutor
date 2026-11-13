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
import { runUserQuery, rowsEqual, type QueryResult } from '../engine/sqlRunner'
import { ArrowDown, ArrowUp, Play } from 'lucide-react'
import { ActionBar, type BarState } from './ActionBar'
import { Code } from './Code'
import { highlight } from '../lib/highlight'
import { DataTable } from './DataTable'
import { Mascot } from './Mascot'

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

type Cb = (c: boolean) => void

function Prompt({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[22px] leading-snug font-extrabold text-ink">{children}</h2>
}

function TeachView({ ex, onResult }: { ex: TeachExercise; onResult: Cb }) {
  const paras = ex.body.split(/\n\s*\n/)
  return (
    <div>
      <div className="flex items-end gap-3">
        <Mascot size={64} mood="think" />
        <div className="relative mb-2 rounded-2xl rounded-bl-sm bg-brand-soft px-3.5 py-2 text-sm font-extrabold text-brand-dark">
          Quick idea
        </div>
      </div>
      <h2 className="mt-3 text-2xl leading-tight font-extrabold text-ink">{ex.title}</h2>
      <div className="mt-3 space-y-3 text-[16px] leading-relaxed text-ink">
        {paras.map((p, i) => (
          <p key={i} className="whitespace-pre-wrap">
            {p}
          </p>
        ))}
      </div>
      {ex.table ? (
        <div className="mt-4">
          <DataTable {...ex.table} />
        </div>
      ) : null}
      {ex.code ? (
        <div className="mt-4">
          <Code code={ex.code} />
        </div>
      ) : null}
      {ex.result ? (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-extrabold tracking-wide text-ink-muted uppercase">
            You get back
          </p>
          <DataTable {...ex.result} />
        </div>
      ) : null}
      <ActionBar
        state="ready"
        checkLabel="Continue"
        onCheck={() => onResult(true)}
        onContinue={() => onResult(true)}
      />
    </div>
  )
}

function McqView({ ex, onResult }: { ex: McqExercise; onResult: Cb }) {
  const [picked, setPicked] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = picked === ex.answerIndex
  const bar: BarState = !checked ? (picked === null ? 'disabled' : 'ready') : correct ? 'correct' : 'wrong'

  return (
    <div>
      <Prompt>{ex.prompt}</Prompt>
      {ex.code ? (
        <div className="mt-3">
          <Code code={ex.code} />
        </div>
      ) : null}
      <div className="mt-5 flex flex-col gap-3">
        {ex.choices.map((c, i) => {
          const state = !checked
            ? undefined
            : i === ex.answerIndex
              ? 'correct'
              : i === picked
                ? 'wrong'
                : undefined
          return (
            <button
              key={c}
              type="button"
              className="choice"
              disabled={checked}
              data-selected={!checked && picked === i}
              data-state={state}
              onClick={() => setPicked(i)}
            >
              {c}
            </button>
          )
        })}
      </div>
      <ActionBar
        state={bar}
        onCheck={() => setChecked(true)}
        onContinue={() => onResult(correct)}
        explanation={ex.explanation}
      />
    </div>
  )
}

function FillView({ ex, onResult }: { ex: FillExercise; onResult: Cb }) {
  const parts = ex.template.split('___')
  const [answers, setAnswers] = useState(() => ex.blanks.map(() => ''))
  const [checked, setChecked] = useState(false)
  const correct = checkFill(ex, answers)
  const filled = answers.every((a) => a.trim())
  const bar: BarState = !checked ? (filled ? 'ready' : 'disabled') : correct ? 'correct' : 'wrong'

  return (
    <div>
      <Prompt>{ex.prompt}</Prompt>
      <div className="mt-5 rounded-2xl bg-[#1b2236] p-4 font-mono text-[14px] leading-loose text-slate-100">
        {parts.map((part, i) => (
          <span key={i}>
            {highlight(part, 'auto')}
            {i < answers.length ? (
              <input
                value={answers[i]}
                disabled={checked}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label={`Blank ${i + 1}`}
                onChange={(e) => {
                  const next = [...answers]
                  next[i] = e.target.value
                  setAnswers(next)
                }}
                className={`mx-1 inline-block w-28 rounded-lg border-2 bg-slate-800 px-2 py-0.5 text-amber-200 outline-none focus:border-brand ${
                  checked ? (correct ? 'border-success' : 'border-danger') : 'border-slate-600'
                }`}
              />
            ) : null}
          </span>
        ))}
      </div>
      <ActionBar
        state={bar}
        onCheck={() => setChecked(true)}
        onContinue={() => onResult(correct)}
        explanation={ex.explanation}
        correctAnswer={ex.blanks.join(', ')}
      />
    </div>
  )
}

const PAIR_COLORS = [
  'border-brand bg-brand-soft text-brand-dark',
  'border-accent bg-accent-soft text-accent-dark',
  'border-bridge bg-teal-50 text-teal-800',
  'border-pyspark bg-orange-50 text-orange-800',
  'border-danger bg-danger-soft text-danger-dark',
  'border-success bg-success-soft text-success-dark',
]

function MatchView({ ex, onResult }: { ex: MatchExercise; onResult: Cb }) {
  const lefts = useMemo(() => ex.pairs.map((p) => p.left), [ex])
  const rights = useMemo(() => shuffle(ex.pairs.map((p) => p.right)), [ex])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [pairs, setPairs] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)

  const correct =
    ex.pairs.every((p) => pairs[p.left] === p.right) &&
    Object.keys(pairs).length === ex.pairs.length
  const complete = Object.keys(pairs).length === ex.pairs.length
  const bar: BarState = !checked ? (complete ? 'ready' : 'disabled') : correct ? 'correct' : 'wrong'

  const colorOfLeft = (l: string) => PAIR_COLORS[lefts.indexOf(l) % PAIR_COLORS.length]
  const leftForRight = (r: string) => Object.keys(pairs).find((l) => pairs[l] === r)

  function tapLeft(l: string) {
    if (checked) return
    if (pairs[l]) {
      // tapping a paired item un-pairs it
      setPairs(({ [l]: _gone, ...rest }) => rest)
      setSelectedLeft(l)
      return
    }
    setSelectedLeft(l)
  }
  function tapRight(r: string) {
    if (checked) return
    const owner = leftForRight(r)
    if (owner) {
      setPairs(({ [owner]: _gone, ...rest }) => rest)
      return
    }
    if (!selectedLeft) return
    setPairs((prev) => ({ ...prev, [selectedLeft]: r }))
    setSelectedLeft(null)
  }

  return (
    <div>
      <Prompt>{ex.prompt}</Prompt>
      <p className="mt-1 text-sm font-semibold text-ink-muted">Tap an item, then tap its match.</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          {lefts.map((l) => (
            <button
              key={l}
              type="button"
              disabled={checked}
              onClick={() => tapLeft(l)}
              className={`choice !px-3 !py-3 text-sm ${pairs[l] ? colorOfLeft(l) : ''}`}
              data-selected={selectedLeft === l}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {rights.map((r) => {
            const owner = leftForRight(r)
            return (
              <button
                key={r}
                type="button"
                disabled={checked}
                onClick={() => tapRight(r)}
                className={`choice !px-3 !py-3 text-[13px] leading-snug ${owner ? colorOfLeft(owner) : ''}`}
              >
                {r}
              </button>
            )
          })}
        </div>
      </div>
      <ActionBar
        state={bar}
        onCheck={() => setChecked(true)}
        onContinue={() => onResult(correct)}
        explanation={ex.explanation}
      />
    </div>
  )
}

function ReorderView({ ex, onResult }: { ex: ReorderExercise; onResult: Cb }) {
  const [items, setItems] = useState(() => shuffle(ex.items))
  const [checked, setChecked] = useState(false)
  const correct = items.every((it, i) => it === ex.items[i])
  const bar: BarState = !checked ? 'ready' : correct ? 'correct' : 'wrong'

  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    setItems(next)
  }

  return (
    <div>
      <Prompt>{ex.prompt}</Prompt>
      <p className="mt-1 text-sm font-semibold text-ink-muted">Use the arrows to put them in order.</p>
      <ul className="mt-5 flex flex-col gap-3">
        {items.map((it, i) => (
          <li
            key={`${it}-${i}`}
            className="choice flex items-center gap-2 !py-2.5"
            data-state={checked ? (it === ex.items[i] ? 'correct' : 'wrong') : undefined}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-extrabold text-ink-muted">
              {i + 1}
            </span>
            <span className="flex-1 text-sm">{it}</span>
            <button
              type="button"
              disabled={checked || i === 0}
              aria-label="Move up"
              className="rounded-lg bg-surface p-2 disabled:opacity-30"
              onClick={() => move(i, -1)}
            >
              <ArrowUp className="h-4 w-4" strokeWidth={3} />
            </button>
            <button
              type="button"
              disabled={checked || i === items.length - 1}
              aria-label="Move down"
              className="rounded-lg bg-surface p-2 disabled:opacity-30"
              onClick={() => move(i, 1)}
            >
              <ArrowDown className="h-4 w-4" strokeWidth={3} />
            </button>
          </li>
        ))}
      </ul>
      <ActionBar
        state={bar}
        onCheck={() => setChecked(true)}
        onContinue={() => onResult(correct)}
        explanation={ex.explanation}
        correctAnswer={ex.items.join('  →  ')}
      />
    </div>
  )
}

function BugView({ ex, onResult }: { ex: BugExercise; onResult: Cb }) {
  const [picked, setPicked] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = picked === ex.bugLineIndex
  const bar: BarState = !checked ? (picked === null ? 'disabled' : 'ready') : correct ? 'correct' : 'wrong'

  return (
    <div>
      <Prompt>{ex.prompt}</Prompt>
      <p className="mt-1 text-sm font-semibold text-ink-muted">Tap the line with the problem.</p>
      <div className="mt-5 overflow-hidden rounded-2xl bg-[#1b2236] font-mono text-[13px] text-slate-100">
        {ex.lines.map((line, i) => {
          const tint = checked
            ? i === ex.bugLineIndex
              ? 'bg-success/25'
              : i === picked
                ? 'bg-danger/30'
                : ''
            : picked === i
              ? 'bg-brand/40'
              : ''
          return (
            <button
              key={i}
              type="button"
              disabled={checked}
              onClick={() => setPicked(i)}
              className={`flex w-full gap-3 border-b border-white/5 px-3 py-2.5 text-left ${tint}`}
            >
              <span className="w-5 shrink-0 text-slate-500">{i + 1}</span>
              <span className="whitespace-pre-wrap">{highlight(line || ' ', 'auto')}</span>
            </button>
          )
        })}
      </div>
      <ActionBar
        state={bar}
        onCheck={() => setChecked(true)}
        onContinue={() => onResult(correct)}
        explanation={ex.explanation}
        correctAnswer={`line ${ex.bugLineIndex + 1}`}
      />
    </div>
  )
}

const MAX_TRIES_BEFORE_SOLUTION = 2

function Editor({
  value,
  onChange,
  rows,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  rows: number
  disabled?: boolean
}) {
  return (
    <textarea
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      className="mt-4 w-full resize-y rounded-2xl border-2 border-slate-700 bg-[#1b2236] p-4 font-mono text-[14px] leading-relaxed text-slate-100 outline-none focus:border-brand"
    />
  )
}

function CodeSqlView({ ex, onResult }: { ex: CodeSqlExercise; onResult: Cb }) {
  const [code, setCode] = useState(ex.starter ?? 'SELECT ')
  const [ran, setRan] = useState<QueryResult | null>(null)
  const [verdict, setVerdict] = useState<'none' | 'correct' | 'wrong'>('none')
  const [tries, setTries] = useState(0)
  const [busy, setBusy] = useState(false)

  async function run(): Promise<QueryResult> {
    setBusy(true)
    const res = await runUserQuery(ex.schemaSql, ex.seedSql, code)
    setBusy(false)
    setRan(res)
    return res
  }

  async function check() {
    const res = await run()
    const ok = !res.error && rowsEqual(res.rows, ex.expectedRows)
    setVerdict(ok ? 'correct' : 'wrong')
    setTries((t) => t + 1)
  }

  const wrongHint = ran?.error
    ? ran.error
    : ran
      ? `Your query returned ${ran.rows.length} row${ran.rows.length === 1 ? '' : 's'}; the answer has ${ex.expectedRows.length}. Compare the columns and the filter.`
      : ''
  const showSolution = verdict === 'wrong' && tries >= MAX_TRIES_BEFORE_SOLUTION
  const bar: BarState = verdict === 'none' ? (code.trim() ? 'ready' : 'disabled') : verdict

  return (
    <div>
      <Prompt>{ex.prompt}</Prompt>
      <details className="mt-3 rounded-2xl border-2 border-line bg-white px-3 py-2 text-sm">
        <summary className="cursor-pointer font-bold text-ink-muted">Show the table</summary>
        <pre className="mt-2 overflow-x-auto font-mono text-xs whitespace-pre-wrap text-ink">
          {ex.schemaSql}
        </pre>
      </details>
      <Editor value={code} onChange={setCode} rows={6} disabled={verdict === 'correct'} />
      <button
        type="button"
        className="btn btn-secondary mt-3"
        disabled={busy || !code.trim()}
        onClick={() => void run()}
      >
        <Play className="h-4 w-4" strokeWidth={3} /> Run
      </button>
      {ran ? (
        <div className="mt-4">
          {ran.error ? (
            <p className="rounded-2xl bg-danger-soft px-3 py-2 font-mono text-xs text-danger-dark">
              {ran.error}
            </p>
          ) : (
            <DataTable columns={ran.columns} rows={ran.rows} />
          )}
        </div>
      ) : null}
      <ActionBar
        state={bar}
        busy={busy}
        checkLabel="Check"
        onCheck={() => void check()}
        onRetry={() => setVerdict('none')}
        canContinue={verdict === 'correct' || showSolution}
        onContinue={() => onResult(verdict === 'correct')}
        explanation={verdict === 'wrong' && !showSolution ? wrongHint : ex.explanation}
      />
    </div>
  )
}

function CodePsView({ ex, onResult }: { ex: CodePysparkExercise; onResult: Cb }) {
  const [code, setCode] = useState(ex.starter ?? '')
  const [verdict, setVerdict] = useState<'none' | 'correct' | 'wrong'>('none')
  const [tries, setTries] = useState(0)

  function check() {
    const ok = checkPyspark(ex, code)
    setVerdict(ok ? 'correct' : 'wrong')
    setTries((t) => t + 1)
  }

  const showSolution = verdict === 'wrong' && tries >= MAX_TRIES_BEFORE_SOLUTION
  const bar: BarState = verdict === 'none' ? (code.trim() ? 'ready' : 'disabled') : verdict

  return (
    <div>
      <Prompt>{ex.prompt}</Prompt>
      {ex.context ? (
        <p className="mt-3 rounded-2xl bg-accent-soft px-4 py-3 text-sm font-semibold text-ink">
          {ex.context}
        </p>
      ) : null}
      <Editor value={code} onChange={setCode} rows={7} disabled={verdict === 'correct'} />
      <ActionBar
        state={bar}
        onCheck={check}
        onRetry={() => setVerdict('none')}
        canContinue={verdict === 'correct' || showSolution}
        onContinue={() => onResult(verdict === 'correct')}
        explanation={
          verdict === 'wrong' && !showSolution
            ? 'Not matching yet. Re-read the prompt and check the method names and column names.'
            : ex.explanation
        }
      />
    </div>
  )
}
