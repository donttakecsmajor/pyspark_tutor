declare module 'sql.js' {
  export interface QueryExecResult {
    columns: string[]
    values: (string | number | null)[][]
  }

  export interface Database {
    run(sql: string): void
    exec(sql: string): QueryExecResult[]
    close(): void
  }

  export interface SqlJsStatic {
    Database: new () => Database
  }

  export interface SqlJsConfig {
    locateFile?: (file: string) => string
  }

  export default function initSqlJs(config?: SqlJsConfig): Promise<SqlJsStatic>
}
