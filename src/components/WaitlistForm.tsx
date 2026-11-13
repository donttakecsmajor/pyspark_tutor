import { useState } from 'react'
import { isValidEmail } from '../lib/email'
import { WAITLIST_URL } from '../lib/waitlist'

const ENDPOINT = WAITLIST_URL
const JOINED_KEY = 'sparkfluent-waitlist-joined'

function alreadyJoined(): boolean {
  try {
    return localStorage.getItem(JOINED_KEY) === '1'
  } catch {
    return false
  }
}

function rememberJoined() {
  try {
    localStorage.setItem(JOINED_KEY, '1')
  } catch {
    // private mode / blocked storage: the form just shows again next visit
  }
}

type Status = 'idle' | 'sending' | 'done' | 'error'

export function WaitlistForm({ source }: { source: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>(alreadyJoined() ? 'done' : 'idle')
  const [error, setError] = useState('')
  // Hidden field real users never fill; bots do.
  const [trap, setTrap] = useState('')

  if (!ENDPOINT) {
    return import.meta.env.DEV ? (
      <p className="rounded-xl border border-dashed border-slate-300 p-3 text-xs text-ink-muted">
        Waitlist form hidden: set VITE_WAITLIST_URL to enable it.
      </p>
    ) : null
  }

  if (status === 'done') {
    return (
      <p className="rounded-2xl border-2 border-success bg-success-soft px-4 py-3 text-sm font-bold text-success-dark">
        You&apos;re on the list. We&apos;ll email you when the paid tracks open.
      </p>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const clean = email.trim().toLowerCase()
    if (!isValidEmail(clean)) {
      setError('Enter a valid email address.')
      setStatus('error')
      return
    }
    if (trap) {
      setStatus('done')
      return
    }
    setStatus('sending')
    setError('')
    try {
      const res = await fetch(ENDPOINT as string, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: clean, source }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      rememberJoined()
      setStatus('done')
    } catch {
      setError('Could not join right now. Please try again in a moment.')
      setStatus('error')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2" noValidate>
      <label className="block text-sm font-semibold text-ink" htmlFor={`wl-${source}`}>
        Get early access to the paid tracks
      </label>
      <div className="flex gap-2">
        <input
          id={`wl-${source}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="min-w-0 flex-1 rounded-2xl border-2 border-line bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="btn btn-primary !w-auto !px-5 !py-3 !text-sm"
        >
          {status === 'sending' ? 'Joining…' : 'Join'}
        </button>
      </div>
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={trap}
        onChange={(e) => setTrap(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        name="website"
      />
      {status === 'error' ? <p className="text-xs text-red-600">{error}</p> : null}
      <p className="text-xs text-ink-muted">One email when it opens. No spam.</p>
    </form>
  )
}
