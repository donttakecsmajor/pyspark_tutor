import type { TrackId } from '../types/curriculum'

/** Per-track colours: `main` for faces, `dark` for the 3D edge / pressed shadow. */
export const TRACK_COLORS: Record<TrackId, { main: string; dark: string; soft: string }> = {
  sql: { main: '#5b5bf0', dark: '#4141c8', soft: '#e9ecfd' },
  pyspark: { main: '#ff7a1a', dark: '#d65f06', soft: '#ffecdc' },
  bridge: { main: '#12b3a0', dark: '#0c8b7b', soft: '#d9f6f2' },
}

export const TRACK_LABELS: Record<TrackId, string> = {
  sql: 'SQL',
  pyspark: 'PySpark',
  bridge: 'Bridge',
}
