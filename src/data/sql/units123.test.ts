import { beforeAll, describe, expect, it } from 'vitest'
import initSqlJs, { type SqlJsStatic } from 'sql.js'
import { sqlUnits123 } from './units123'
import { ORDERS_SCHEMA, ORDERS_SEED, ORDERS_ROWS } from './dataset'
import { rowsEqual, columnsMatch, type SqlCell } from '../../engine/sqlRunner'
import type { CodeSqlExercise, Exercise, TeachExercise } from '../../types/curriculum'

let SQL: SqlJsStatic
beforeAll(async () => {
  SQL = await initSqlJs()
})

function run(schema: string, seed: string, query: string): { columns: string[]; rows: SqlCell[][] } {
  const db = new SQL.Database()
  try {
    db.run(schema)
    db.run(seed)
    const res = db.exec(query)
    if (!res.length) return { columns: [], rows: [] }
    const last = res[res.length - 1]
    return { columns: last.columns, rows: last.values as SqlCell[][] }
  } finally {
    db.close()
  }
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').replace(/;\s*$/, '').trim()

const allExercises: { where: string; ex: Exercise }[] = sqlUnits123.flatMap((c) => [
  ...c.steps.flatMap((s) => s.exercises.map((ex) => ({ where: `${c.id}/${s.id}`, ex }))),
  ...c.checkpoint.map((ex) => ({ where: `${c.id}/checkpoint`, ex })),
])
const codeExercises = allExercises.filter((e) => e.ex.type === 'code_sql') as {
  where: string
  ex: CodeSqlExercise
}[]
const teachWithResult = allExercises.filter(
  (e) => e.ex.type === 'teach' && e.ex.code && e.ex.result,
) as { where: string; ex: TeachExercise }[]

describe('SQL units 1-3: shape', () => {
  it('keeps the chapter and step ids the path and placement rely on', () => {
    expect(sqlUnits123.map((c) => c.id)).toEqual(['sql.select-basics', 'sql.where-null', 'sql.order-limit'])
    expect(sqlUnits123.map((c) => c.steps.map((s) => s.id))).toEqual([
      ['select-basics-s1', 'select-basics-s2', 'select-basics-s3', 'select-basics-s4', 'select-basics-s5'],
      ['where-null-s1', 'where-null-s2', 'where-null-s3', 'where-null-s4'],
      ['order-limit-s1', 'order-limit-s2', 'order-limit-s3', 'order-limit-s4'],
    ])
  })

  it('has unique exercise ids', () => {
    const ids = allExercises.map((e) => e.ex.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('follows the house rules: every step teaches, checks, and ends by making the learner write SQL', () => {
    for (const c of sqlUnits123) {
      for (const s of c.steps) {
        const types = s.exercises.map((e) => e.type)
        expect(types, s.id).toContain('teach')
        expect(types.filter((t) => t !== 'teach' && t !== 'code_sql').length, s.id).toBeGreaterThanOrEqual(1)
        expect(types[types.length - 1], s.id).toBe('code_sql')
      }
    }
  })

  it('has a checkpoint with real SQL in it for every unit', () => {
    for (const c of sqlUnits123) {
      expect(c.checkpoint.length, c.id).toBeGreaterThanOrEqual(8)
      expect(c.checkpoint.filter((e) => e.type === 'code_sql').length, c.id).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('SQL units 1-3: every answer is true in real SQLite', () => {
  it.each(codeExercises.map((e) => [`${e.where} ${e.ex.id}`, e.ex] as const))(
    '%s: reference query returns exactly expectedRows',
    (_name, ex) => {
      expect(ex.expectedQuery, 'every code exercise needs a reference expectedQuery').toBeTruthy()
      const res = run(ex.schemaSql, ex.seedSql, ex.expectedQuery as string)
      expect(rowsEqual(res.rows, ex.expectedRows, ex.orderMatters), JSON.stringify(res.rows)).toBe(true)
      expect(columnsMatch(res.columns, ex.expectedColumns), res.columns.join(',')).toBe(true)
    },
  )

  it.each(codeExercises.map((e) => [`${e.where} ${e.ex.id}`, e.ex] as const))(
    '%s: the starter alone is not a correct answer, and the explanation shows the reference query',
    (_name, ex) => {
      let passes = false
      try {
        const res = run(ex.schemaSql, ex.seedSql, ex.starter ?? '')
        passes = rowsEqual(res.rows, ex.expectedRows, ex.orderMatters)
      } catch {
        passes = false
      }
      expect(passes).toBe(false)
      expect(norm(ex.explanation)).toBe(norm(ex.expectedQuery as string))
    },
  )

  it.each(teachWithResult.map((e) => [`${e.where} "${e.ex.title}"`, e.ex] as const))(
    '%s: the result shown to the learner is what the query really returns',
    (_name, ex) => {
      const res = run(ORDERS_SCHEMA, ORDERS_SEED, ex.code as string)
      const ordered = /order by/i.test(ex.code as string)
      // SQLite reports no column names for a zero-row result, so only compare them when there are rows.
      if (res.rows.length > 0) expect(res.columns).toEqual(ex.result?.columns)
      expect(rowsEqual(res.rows, ex.result?.rows ?? [], ordered), JSON.stringify(res.rows)).toBe(true)
    },
  )

  it('keeps the displayed orders table identical to the SQL seed data', () => {
    const res = run(ORDERS_SCHEMA, ORDERS_SEED, 'SELECT * FROM orders')
    expect(rowsEqual(res.rows, ORDERS_ROWS, true)).toBe(true)
  })
})
