export type MascotMood = 'happy' | 'cheer' | 'think' | 'sad'

/** "Sparky": the SparkFluent mascot. Pure SVG so it scales and costs no network. */
export function Mascot({ mood = 'happy', size = 96 }: { mood?: MascotMood; size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label="Sparky the mascot">
      {/* flame tuft */}
      <path
        d="M60 4c4 12 18 18 20 34-8-3-14-1-18 4 0-10-6-14-6-22 0-6 2-11 4-16z"
        fill="#ffd166"
      />
      {/* body */}
      <ellipse cx="60" cy="72" rx="42" ry="40" fill="#ff9f1a" />
      <ellipse cx="60" cy="82" rx="30" ry="26" fill="#ffc15e" opacity="0.55" />
      {/* eyes */}
      <circle cx="44" cy="64" r="11" fill="#fff" />
      <circle cx="76" cy="64" r="11" fill="#fff" />
      <circle cx={mood === 'think' ? 47 : 45} cy={mood === 'think' ? 60 : 65} r="5.5" fill="#1e2a3b" />
      <circle cx={mood === 'think' ? 79 : 77} cy={mood === 'think' ? 60 : 65} r="5.5" fill="#1e2a3b" />
      {mood === 'sad' ? (
        <>
          <path d="M33 52l14 4M87 52l-14 4" stroke="#1e2a3b" strokeWidth="3" strokeLinecap="round" />
          <path d="M48 92q12-8 24 0" stroke="#1e2a3b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      ) : mood === 'cheer' ? (
        <path d="M46 84q14 16 28 0z" fill="#1e2a3b" />
      ) : mood === 'think' ? (
        <path d="M50 88h20" stroke="#1e2a3b" strokeWidth="3.5" strokeLinecap="round" />
      ) : (
        <path d="M47 84q13 12 26 0" stroke="#1e2a3b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      )}
      {/* cheeks */}
      <circle cx="31" cy="80" r="5" fill="#ff7a59" opacity="0.5" />
      <circle cx="89" cy="80" r="5" fill="#ff7a59" opacity="0.5" />
    </svg>
  )
}
