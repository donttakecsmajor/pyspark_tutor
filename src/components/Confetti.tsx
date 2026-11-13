const COLORS = ['#5b5bf0', '#ff9f1a', '#1fa95b', '#ff7a1a', '#12b3a0', '#e5484d']

/** CSS-only confetti. Deterministic pieces (no Math.random in render) so it never reshuffles. */
export function Confetti({ pieces = 36 }: { pieces?: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {Array.from({ length: pieces }, (_, i) => (
        <span
          key={i}
          className="absolute top-[-20px] block h-3 w-2 rounded-[2px]"
          style={{
            left: `${(i * 97) % 100}%`,
            background: COLORS[i % COLORS.length],
            animation: `fall ${2.4 + ((i * 13) % 17) / 10}s ${((i * 7) % 12) / 10}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  )
}
