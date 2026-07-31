import { useRef, useState } from 'react'
import { useProgress } from '../store/progressStore'
import { TRACK_META, allChapters } from '../lib/curriculumApi'
import type { TrackId } from '../types/curriculum'

export function ProfilePage() {
  const progress = useProgress()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)

  function exportProgress() {
    const blob = new Blob([progress.exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sparkfluent-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('Exported progress JSON')
  }

  function onImport(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      const ok = progress.importJson(String(reader.result))
      setMsg(ok ? 'Imported successfully' : 'Import failed — invalid file')
    }
    reader.readAsText(file)
  }

  const chapters = allChapters()
  const completedCheckpoints = chapters.filter((c) =>
    (progress.checkpointHistory[c.id] ?? []).some((a) => a.passed),
  ).length

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="font-display text-3xl font-bold">Profile</h1>
      <p className="mt-1 text-sm text-ink-muted">Local progress on this device</p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Stat label="XP" value={String(progress.xp)} />
        <Stat label="Streak" value={`${progress.streak}d`} />
        <Stat label="Steps" value={String(progress.completedSteps.length)} />
      </div>

      <section className="mt-6">
        <h2 className="font-semibold">Levels</h2>
        {(Object.keys(TRACK_META) as TrackId[]).map((t) => (
          <div key={t} className="mt-3">
            <div className="mb-1 flex justify-between text-sm">
              <span>{TRACK_META[t].label}</span>
              <span className="font-semibold">{progress.ratings[t].toFixed(1)} / 5</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-brand"
                style={{ width: `${(progress.ratings[t] / 5) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-ink-muted">Chapters cleared</p>
        <p className="text-2xl font-bold">
          {completedCheckpoints}{' '}
          <span className="text-base font-normal text-ink-muted">/ {chapters.length}</span>
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Bookmarks: {progress.bookmarks.length} · Review queue: {progress.reviewQueue.length}
        </p>
      </section>

      <section className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          onClick={exportProgress}
          className="rounded-xl bg-brand py-3.5 font-semibold text-white"
        >
          Export progress
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-xl border border-slate-200 bg-white py-3.5 font-semibold"
        >
          Import progress
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onImport(f)
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (confirm('Reset all local progress?')) {
              progress.resetAll()
              setMsg('Progress reset')
            }
          }}
          className="rounded-xl py-3 text-sm font-semibold text-danger"
        >
          Reset everything
        </button>
      </section>

      {msg ? <p className="mt-4 text-center text-sm text-brand">{msg}</p> : null}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</p>
    </div>
  )
}
