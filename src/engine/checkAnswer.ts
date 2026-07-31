import type { Exercise, FillExercise, CodePysparkExercise } from '../types/curriculum'

export function normalizeCode(s: string): string {
  return s
    .toLowerCase()
    .replace(/['"`]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/\s*([(),.=+\-*\/<>!])\s*/g, '$1')
    .trim()
}

export function checkFill(ex: FillExercise, answers: string[]): boolean {
  if (answers.length !== ex.blanks.length) return false
  return answers.every((a, i) => {
    const expected = ex.blanks[i]
    if (ex.caseSensitive) return a.trim() === expected
    return a.trim().toLowerCase() === expected.toLowerCase()
  })
}

export function checkPyspark(ex: CodePysparkExercise, code: string): boolean {
  const n = normalizeCode(code)
  const ok = ex.mustInclude.every((m) => n.includes(normalizeCode(m)))
  if (!ok) return false
  if (ex.mustNotInclude?.some((m) => n.includes(normalizeCode(m)))) return false
  return true
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function isGraded(ex: Exercise): boolean {
  return ex.type !== 'teach'
}

export function exercisePrompt(ex: Exercise): string {
  if (ex.type === 'teach') return ex.title
  return ex.prompt
}

export function exerciseTags(ex: Exercise): string[] {
  return ex.tags ?? []
}
