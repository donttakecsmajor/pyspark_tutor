import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js'

let SQL: SqlJsStatic | null = null

export async function getSql(): Promise<SqlJsStatic> {
  if (SQL) return SQL
  SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  })
  return SQL
}

export function rowsEqual(
  actual: (string | number | null)[][],
  expected: (string | number | null)[][],
): boolean {
  const norm = (rows: (string | number | null)[][]) =>
    [...rows]
      .map((r) => r.map((c) => (c === null || c === undefined ? 'NULL' : String(c))).join('\t'))
      .sort()
      .join('\n')
  return norm(actual) === norm(expected)
}

export async function runUserQuery(
  schemaSql: string,
  seedSql: string,
  userSql: string,
): Promise<{ rows: (string | number | null)[][]; error?: string }> {
  const sql = await getSql()
  let db: Database | null = null
  try {
    db = new sql.Database()
    db.run(schemaSql)
    db.run(seedSql)
    const result = db.exec(userSql)
    if (!result.length) return { rows: [] }
    const { values } = result[0]
    return {
      rows: values.map((row) =>
        row.map((c) => (c === null || c === undefined ? null : (c as string | number))),
      ),
    }
  } catch (e) {
    return { rows: [], error: e instanceof Error ? e.message : String(e) }
  } finally {
    db?.close()
  }
}
