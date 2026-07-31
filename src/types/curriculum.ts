export type TrackId = 'sql' | 'pyspark' | 'bridge'

export type ExerciseType =
  | 'teach'
  | 'mcq'
  | 'fill'
  | 'match'
  | 'reorder'
  | 'bug'
  | 'code_sql'
  | 'code_pyspark'

export interface TeachExercise {
  id: string
  type: 'teach'
  title: string
  body: string
  code?: string
  tags?: string[]
}

export interface McqExercise {
  id: string
  type: 'mcq'
  prompt: string
  code?: string
  choices: string[]
  answerIndex: number
  explanation: string
  tags?: string[]
}

export interface FillExercise {
  id: string
  type: 'fill'
  prompt: string
  template: string
  blanks: string[]
  explanation: string
  tags?: string[]
  caseSensitive?: boolean
}

export interface MatchExercise {
  id: string
  type: 'match'
  prompt: string
  pairs: { left: string; right: string }[]
  explanation: string
  tags?: string[]
}

export interface ReorderExercise {
  id: string
  type: 'reorder'
  prompt: string
  items: string[]
  explanation: string
  tags?: string[]
}

export interface BugExercise {
  id: string
  type: 'bug'
  prompt: string
  lines: string[]
  bugLineIndex: number
  explanation: string
  tags?: string[]
}

export interface CodeSqlExercise {
  id: string
  type: 'code_sql'
  prompt: string
  schemaSql: string
  seedSql: string
  expectedQuery?: string
  /** Rows as arrays; compared as sets of stringified rows */
  expectedRows: (string | number | null)[][]
  starter?: string
  explanation: string
  tags?: string[]
}

export interface CodePysparkExercise {
  id: string
  type: 'code_pyspark'
  prompt: string
  context?: string
  starter?: string
  /** Normalized acceptable answer snippets (all must appear) */
  mustInclude: string[]
  /** Forbidden snippets */
  mustNotInclude?: string[]
  explanation: string
  tags?: string[]
}

export type Exercise =
  | TeachExercise
  | McqExercise
  | FillExercise
  | MatchExercise
  | ReorderExercise
  | BugExercise
  | CodeSqlExercise
  | CodePysparkExercise

export interface Step {
  id: string
  title: string
  xp: number
  exercises: Exercise[]
}

export interface Chapter {
  id: string
  track: TrackId
  title: string
  description: string
  tags: string[]
  steps: Step[]
  checkpoint: Exercise[]
  passScore: number
}

export interface GlossaryEntry {
  id: string
  track: TrackId | 'both'
  term: string
  definition: string
  example?: string
}

export interface PlacementQuestion {
  id: string
  track: TrackId
  difficulty: 1 | 2 | 3 | 4 | 5
  exercise: Exclude<Exercise, TeachExercise>
  chapterHint?: string
}
