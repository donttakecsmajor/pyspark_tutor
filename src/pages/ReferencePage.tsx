import { useMemo, useState } from 'react'
import { glossary } from '../data/glossary'
import { TRACK_META } from '../lib/curriculumApi'
import type { TrackId } from '../types/curriculum'

const filters = ['all', 'sql', 'pyspark', 'both'] as const

export function ReferencePage() {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<(typeof filters)[number]>('all')

  const items = useMemo(() => {
    const query = q.trim().toLowerCase()
    return glossary
      .filter((g) => (filter === 'all' ? true : g.track === filter))
      .filter(
        (g) =>
          !query ||
          g.term.toLowerCase().includes(query) ||
          g.definition.toLowerCase().includes(query),
      )
      .sort((a, b) => a.term.localeCompare(b.term))
  }, [q, filter])

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="font-display text-3xl font-bold">Reference</h1>
      <p className="mt-1 text-sm text-ink-muted">Glossary & cheatsheet terms</p>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search terms…"
        className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand"
      />

      <div className="mt-3 flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              filter === f ? 'bg-brand text-white' : 'bg-white border border-slate-200 text-ink-muted'
            }`}
          >
            {f === 'all' ? 'All' : f === 'both' ? 'Both' : TRACK_META[f as TrackId].label}
          </button>
        ))}
      </div>

      <ul className="mt-5 flex flex-col gap-3">
        {items.map((g) => (
          <li key={g.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold text-ink">{g.term}</h2>
              <span className="shrink-0 rounded bg-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand">
                {g.track}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{g.definition}</p>
            {g.example ? (
              <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-teal-100">
                <code>{g.example}</code>
              </pre>
            ) : null}
          </li>
        ))}
        {!items.length ? (
          <li className="text-center text-sm text-ink-muted py-8">No matches</li>
        ) : null}
      </ul>
    </div>
  )
}
