export type Cell = string | number | null

export interface TableData {
  name?: string
  columns: string[]
  rows: Cell[][]
}

/** A small, scrollable table for showing the data a lesson is about, or a query's result. */
export function DataTable({ name, columns, rows }: TableData) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-line bg-white">
      {name ? (
        <div className="border-b-2 border-line bg-surface px-3 py-1.5 font-mono text-xs font-bold text-ink-muted">
          {name}
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left font-mono text-xs">
          <thead>
            <tr className="bg-brand-soft text-brand-dark">
              {columns.map((c) => (
                <th key={c} className="whitespace-nowrap px-3 py-2 font-bold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-3 text-center text-ink-muted">
                  0 rows
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="border-t border-line">
                  {r.map((c, j) => (
                    <td key={j} className="whitespace-nowrap px-3 py-2">
                      {c === null ? <span className="text-ink-muted italic">NULL</span> : String(c)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
