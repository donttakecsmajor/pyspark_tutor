import { sqlChapters } from './sql'
import { pysparkChapters } from './pyspark'
import { bridgeChapters } from './bridge'
import { setCurriculum } from '../lib/curriculumApi'
import type { Chapter } from '../types/curriculum'

export function initCurriculum() {
  const chapters: Chapter[] = [...sqlChapters, ...pysparkChapters, ...bridgeChapters]
  setCurriculum(chapters)
  return chapters
}

export { sqlChapters, pysparkChapters, bridgeChapters }
export { glossary } from './glossary'
export { getPlacement } from './placement'
