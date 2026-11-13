import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js'
// Bundled with the app (served from our own origin), so SQL works offline and
// doesn't depend on a third-party CDN being up.
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

let SQL: SqlJsStatic | null = null

export async function getSql(): Promise<SqlJsStatic> {
  if (SQL) return SQL
  SQL = await initSqlJs({ locateFile: () => wasmUrl })
  return SQL
}

export type SqlCell = string | number | null

export function rowsEqual(actual: SqlCell[][], expected: SqlCell[][]): boolean {
  const norm = (rows: SqlCell[][]) =>
    [...rows]
      .map((r) => r.map((c) => (c === null || c === undefined ? 'NULL' : String(c))).join('\t'))
      .sort()
      .join('\n')
  return norm(actual) === norm(expected)
}

export interface QueryResult {
  columns: string[]
  rows: SqlCell[][]
  error?: string
}

export async function runUserQuery(
  schemaSql: string,
  seedSql: string,
  userSql: string,
): Promise<QueryResult> {
  const sql = await getSql()
  let db: Database | null = null
  try {
    db = new sql.Database()
    db.run(schemaSql)
    db.run(seedSql)
    const result = db.exec(userSql)
    if (!result.length) return { columns: [], rows: [] }
    const { columns, values } = result[result.length - 1]
    return {
      columns,
      rows: values.map((row) =>
        row.map((c) => (c === null || c === undefined ? null : (c as string | number))),
      ),
    }
  } catch (e) {
    return { columns: [], rows: [], error: e instanceof Error ? e.message : String(e) }
  } finally {
    db?.close()
  }
}
