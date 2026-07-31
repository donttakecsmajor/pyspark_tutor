import type {
  Chapter,
  Exercise,
  McqExercise,
  FillExercise,
  MatchExercise,
  ReorderExercise,
  BugExercise,
  TeachExercise,
  Step,
  TrackId,
} from '../types/curriculum'

let _id = 0
export function eid(prefix: string): string {
  _id += 1
  return `${prefix}-${_id}`
}

export function teach(
  title: string,
  body: string,
  code?: string,
  tags?: string[],
): TeachExercise {
  return { id: eid('teach'), type: 'teach', title, body, code, tags }
}

export function mcq(
  prompt: string,
  choices: string[],
  answerIndex: number,
  explanation: string,
  opts?: { code?: string; tags?: string[] },
): McqExercise {
  return {
    id: eid('mcq'),
    type: 'mcq',
    prompt,
    choices,
    answerIndex,
    explanation,
    code: opts?.code,
    tags: opts?.tags,
  }
}

export function fill(
  prompt: string,
  template: string,
  blanks: string[],
  explanation: string,
  tags?: string[],
): FillExercise {
  return { id: eid('fill'), type: 'fill', prompt, template, blanks, explanation, tags }
}

export function match(
  prompt: string,
  pairs: { left: string; right: string }[],
  explanation: string,
  tags?: string[],
): MatchExercise {
  return { id: eid('match'), type: 'match', prompt, pairs, explanation, tags }
}

export function reorder(
  prompt: string,
  items: string[],
  explanation: string,
  tags?: string[],
): ReorderExercise {
  return { id: eid('reorder'), type: 'reorder', prompt, items, explanation, tags }
}

export function bug(
  prompt: string,
  lines: string[],
  bugLineIndex: number,
  explanation: string,
  tags?: string[],
): BugExercise {
  return { id: eid('bug'), type: 'bug', prompt, lines, bugLineIndex, explanation, tags }
}

export function step(id: string, title: string, exercises: Exercise[], xp = 15): Step {
  return { id, title, xp, exercises }
}

export function chapter(
  track: TrackId,
  slug: string,
  title: string,
  description: string,
  tags: string[],
  steps: Step[],
  checkpoint: Exercise[],
  passScore = 80,
): Chapter {
  return {
    id: `${track}.${slug}`,
    track,
    title,
    description,
    tags,
    steps,
    checkpoint: checkpoint.filter((e) => e.type !== 'teach'),
    passScore,
  }
}

export function gradedOnly(exercises: Exercise[]): Exercise[] {
  return exercises.filter((e) => e.type !== 'teach')
}
