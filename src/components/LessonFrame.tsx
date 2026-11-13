import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  /** 0..1 */
  progress: number
  onClose: () => void
  closeLabel?: string
  right?: ReactNode
  children: ReactNode
}

/** Shared chrome for lessons, checkpoints and placement: close button, thick progress bar, content. */
export function LessonFrame({ progress, onClose, closeLabel = 'Quit', right, children }: Props) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100)
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          type="button"
          aria-label={closeLabel}
          onClick={onClose}
          className="rounded-full p-1.5 text-ink-muted hover:bg-surface"
        >
          <X className="h-7 w-7" strokeWidth={3} />
        </button>
        <div
          className="h-4 flex-1 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="relative h-full rounded-full bg-success transition-all duration-500"
            style={{ width: `${Math.max(pct, 4)}%` }}
          >
            <div className="absolute inset-x-2 top-[3px] h-1 rounded-full bg-white/40" />
          </div>
        </div>
        {right}
      </div>
      <div className="flex-1 px-5 pt-3 pb-56">{children}</div>
    </div>
  )
}
