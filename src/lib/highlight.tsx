import type { ReactNode } from 'react'

export type Lang = 'sql' | 'py' | 'auto'

const SQL_WORDS =
  'SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|JOIN|LEFT|RIGHT|INNER|OUTER|FULL|CROSS|ON|AS|AND|OR|NOT|NULL|IS|IN|LIKE|BETWEEN|DISTINCT|LIMIT|OFFSET|UNION|ALL|CASE|WHEN|THEN|ELSE|END|WITH|OVER|PARTITION BY|COUNT|SUM|AVG|MIN|MAX|CAST|INSERT|INTO|VALUES|CREATE|TABLE|ASC|DESC|BY|EXISTS|COALESCE|ROW_NUMBER|RANK|DENSE_RANK|LAG|LEAD'
const PY_WORDS =
  'import|from|as|def|return|for|in|if|else|elif|and|or|not|None|True|False|lambda|with|class'

function detect(code: string): 'sql' | 'py' {
  return /(^|\n)\s*(import |from \w+ import|df\b|spark\b|def )|\.(select|filter|groupBy|withColumn|show)\(/.test(code)
    ? 'py'
    : 'sql'
}

/** Tiny tokenizer: strings, comments, numbers, keywords. Not a parser, just enough colour to read by. */
export function highlight(code: string, lang: Lang = 'auto'): ReactNode[] {
  const l = lang === 'auto' ? detect(code) : lang
  const words = l === 'sql' ? SQL_WORDS : PY_WORDS
  const flags = l === 'sql' ? 'gi' : 'g'
  const re = new RegExp(
    `(?<str>'[^'\\n]*'|"[^"\\n]*")|(?<com>${l === 'sql' ? '--' : '#'}[^\\n]*)|(?<num>\\b\\d+(?:\\.\\d+)?\\b)|(?<kw>\\b(?:${words})\\b)`,
    flags,
  )
  const out: ReactNode[] = []
  let last = 0
  let i = 0
  for (const m of code.matchAll(re)) {
    const idx = m.index ?? 0
    if (idx > last) out.push(code.slice(last, idx))
    const g = m.groups ?? {}
    const cls = g.str
      ? 'text-emerald-300'
      : g.com
        ? 'text-slate-500 italic'
        : g.num
          ? 'text-amber-300'
          : 'text-sky-300 font-bold'
    out.push(
      <span key={i++} className={cls}>
        {m[0]}
      </span>,
    )
    last = idx + m[0].length
  }
  if (last < code.length) out.push(code.slice(last))
  return out
}
