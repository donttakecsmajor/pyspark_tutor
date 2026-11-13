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

export interface TeachTable {
  name?: string
  columns: string[]
  rows: (string | number | null)[][]
}

export interface TeachExercise {
  id: string
  type: 'teach'
  title: string
  /** Paragraphs separated by blank lines. Plain language first; jargon after the example. */
  body: string
  code?: string
  /** The data the lesson is about, shown before the query. */
  table?: TeachTable
  /** What the query returns, shown after the query. */
  result?: TeachTable
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
  /** A reference solution. Tests run it to prove expectedRows is what the SQL really returns. */
  expectedQuery?: string
  /** Rows as arrays; compared as sets of stringified rows unless orderMatters */
  expectedRows: (string | number | null)[][]
  /** Grade row order too (ORDER BY lessons). Default false: order ignored. */
  orderMatters?: boolean
  /** Require these output column names (case-insensitive), e.g. to check an AS alias. */
  expectedColumns?: string[]
  /** One nudge shown on request, before the solution. */
  hint?: string
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
