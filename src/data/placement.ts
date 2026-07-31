import type { PlacementQuestion, TrackId } from '../types/curriculum'
import { mcq, fill, match } from './helpers'

export const sqlPlacement: PlacementQuestion[] = [
  {
    id: 'place-sql-1',
    track: 'sql',
    difficulty: 1,
    chapterHint: 'select-basics',
    exercise: mcq(
      'Which clause filters rows before aggregation?',
      ['HAVING', 'WHERE', 'ORDER BY', 'LIMIT'],
      1,
      'WHERE filters rows; HAVING filters groups.',
      { tags: ['where'] },
    ),
  },
  {
    id: 'place-sql-2',
    track: 'sql',
    difficulty: 1,
    chapterHint: 'where-null',
    exercise: fill(
      'Test for missing email.',
      'SELECT * FROM users WHERE email ___ NULL;',
      ['IS'],
      'Use IS NULL, not = NULL.',
      ['null'],
    ),
  },
  {
    id: 'place-sql-3',
    track: 'sql',
    difficulty: 2,
    chapterHint: 'joins-inner-left',
    exercise: mcq(
      'LEFT JOIN with no match on the right yields:',
      ['Row dropped', 'Right defaults to 0', 'NULLs on right columns', 'Error'],
      2,
      'Unmatched left rows are kept with NULL right columns.',
      { tags: ['joins'] },
    ),
  },
  {
    id: 'place-sql-4',
    track: 'sql',
    difficulty: 2,
    chapterHint: 'aggregations',
    exercise: fill(
      'Count rows per dept.',
      'SELECT dept, COUNT(*) FROM emp ___ BY dept;',
      ['GROUP'],
      'GROUP BY dept',
      ['groupby'],
    ),
  },
  {
    id: 'place-sql-5',
    track: 'sql',
    difficulty: 3,
    chapterHint: 'window-rank',
    exercise: mcq(
      'ROW_NUMBER() requires which clause inside OVER for deterministic ranking?',
      ['PARTITION BY only', 'ORDER BY (usually)', 'GROUP BY', 'HAVING'],
      1,
      'ORDER BY defines the sequence for row numbering.',
      { tags: ['window'] },
    ),
  },
  {
    id: 'place-sql-6',
    track: 'sql',
    difficulty: 3,
    chapterHint: 'ctes',
    exercise: match(
      'Match SQL constructs',
      [
        { left: 'WITH ... AS', right: 'CTE' },
        { left: 'OVER ()', right: 'Window' },
        { left: 'HAVING', right: 'Filter groups' },
        { left: 'UNION ALL', right: 'Stack rows, keep dupes' },
      ],
      'Core analytical SQL vocabulary.',
      ['cte', 'window'],
    ),
  },
  {
    id: 'place-sql-7',
    track: 'sql',
    difficulty: 4,
    chapterHint: 'window-analytics',
    exercise: mcq(
      'LAG(amount, 1) OVER (PARTITION BY id ORDER BY day) returns:',
      ['Next day amount', 'Previous day amount in the partition', 'Max amount', 'Row count'],
      1,
      'LAG looks backward within the window ordering.',
      { tags: ['window'] },
    ),
  },
  {
    id: 'place-sql-8',
    track: 'sql',
    difficulty: 4,
    chapterHint: 'subqueries',
    exercise: fill(
      'Semi-join style filter.',
      'WHERE ___ (SELECT 1 FROM bans b WHERE b.user_id = u.id);',
      ['EXISTS'],
      'EXISTS is a common anti/semi-join pattern.',
      ['subquery'],
    ),
  },
  {
    id: 'place-sql-9',
    track: 'sql',
    difficulty: 5,
    chapterHint: 'data-quality',
    exercise: mcq(
      'Best first check for unexpected fan-out after a join?',
      ['Drop all indexes', 'Compare row counts and grain before vs after', 'Always CROSS JOIN', 'Remove PRIMARY KEY'],
      1,
      'Validate grain and counts when joins multiply rows.',
      { tags: ['quality'] },
    ),
  },
  {
    id: 'place-sql-10',
    track: 'sql',
    difficulty: 5,
    chapterHint: 'performance-mindset',
    exercise: mcq(
      'A selective equality filter on an indexed column often helps because:',
      ['It forces DISTINCT', 'It can reduce scanned rows via index seek/lookup', 'It disables WHERE', 'It materializes CTEs'],
      1,
      'Indexes help selective predicates; always verify with the plan.',
      { tags: ['performance'] },
    ),
  },
]

export const pysparkPlacement: PlacementQuestion[] = [
  {
    id: 'place-ps-1',
    track: 'pyspark',
    difficulty: 1,
    chapterHint: 'spark-model',
    exercise: mcq(
      'Which triggers Spark to compute?',
      ['select', 'filter', 'withColumn', 'count'],
      3,
      'count is an action; the others are transformations.',
      { tags: ['lazy'] },
    ),
  },
  {
    id: 'place-ps-2',
    track: 'pyspark',
    difficulty: 1,
    chapterHint: 'filter-where',
    exercise: fill(
      'Import functions alias commonly used.',
      'from pyspark.sql import functions as ___',
      ['F'],
      'Convention: import functions as F.',
      ['api'],
    ),
  },
  {
    id: 'place-ps-3',
    track: 'pyspark',
    difficulty: 2,
    chapterHint: 'select-withcolumn',
    exercise: mcq(
      'withColumn("x", ...) when x exists:',
      ['Errors always', 'Adds a second x column', 'Replaces column x', 'Drops the frame'],
      2,
      'withColumn replaces if the name exists.',
      { tags: ['withColumn'] },
    ),
  },
  {
    id: 'place-ps-4',
    track: 'pyspark',
    difficulty: 2,
    chapterHint: 'groupby-agg',
    exercise: fill(
      'Average salary by dept.',
      "df.groupBy('dept').___(F.avg('salary'))",
      ['agg'],
      'groupBy(...).agg(...)',
      ['agg'],
    ),
  },
  {
    id: 'place-ps-5',
    track: 'pyspark',
    difficulty: 3,
    chapterHint: 'joins',
    exercise: mcq(
      'Broadcast a small dimension to avoid shuffle when:',
      ['Both sides are huge', 'One side is small enough to replicate', 'You need sort-merge only', 'You call collect on both'],
      1,
      'Broadcast joins suit small lookup tables.',
      { tags: ['joins'] },
    ),
  },
  {
    id: 'place-ps-6',
    track: 'pyspark',
    difficulty: 3,
    chapterHint: 'window-functions',
    exercise: match(
      'Match PySpark pieces',
      [
        { left: 'Window.partitionBy', right: 'Split window groups' },
        { left: 'F.row_number', right: 'Number rows in window' },
        { left: 'df.join', right: 'Combine DataFrames' },
        { left: 'df.write.parquet', right: 'Action that persists files' },
      ],
      'Core DataFrame vocabulary.',
      ['window'],
    ),
  },
  {
    id: 'place-ps-7',
    track: 'pyspark',
    difficulty: 4,
    chapterHint: 'partitions-shuffle',
    exercise: mcq(
      'groupBy typically introduces:',
      ['Only narrow map tasks', 'A shuffle / wide dependency', 'Guaranteed single partition', 'No stage boundary'],
      1,
      'Aggregations generally shuffle by key.',
      { tags: ['shuffle'] },
    ),
  },
  {
    id: 'place-ps-8',
    track: 'pyspark',
    difficulty: 4,
    chapterHint: 'repartition-coalesce',
    exercise: fill(
      'Reduce partitions without full shuffle.',
      'df.___(20)',
      ['coalesce'],
      'coalesce merges partitions; repartition shuffles.',
      ['partitions'],
    ),
  },
  {
    id: 'place-ps-9',
    track: 'pyspark',
    difficulty: 5,
    chapterHint: 'udf-vs-builtin',
    exercise: mcq(
      'Prefer built-in functions over Python UDFs because:',
      ['UDFs cannot return strings', 'Built-ins optimize better and avoid Python row overhead', 'UDFs skip the JVM', 'Built-ins disable Catalyst'],
      1,
      'Native expressions are usually much faster.',
      { tags: ['udf'] },
    ),
  },
  {
    id: 'place-ps-10',
    track: 'pyspark',
    difficulty: 5,
    chapterHint: 'skew-patterns',
    exercise: mcq(
      'Classic symptom of key skew:',
      ['All tasks finish together', 'One task runs vastly longer on a hot key', 'Zero shuffle bytes', 'Schema becomes nested'],
      1,
      'Hot keys create straggler tasks.',
      { tags: ['skew'] },
    ),
  },
]

export const bridgePlacement: PlacementQuestion[] = [
  {
    id: 'place-br-1',
    track: 'bridge',
    difficulty: 1,
    chapterHint: 'bridge-select',
    exercise: match(
      'SQL ↔ PySpark',
      [
        { left: 'SELECT a, b', right: "df.select('a', 'b')" },
        { left: 'WHERE x > 1', right: "df.filter(F.col('x') > 1)" },
      ],
      'Same intent, different API.',
      ['bridge'],
    ),
  },
  {
    id: 'place-br-2',
    track: 'bridge',
    difficulty: 2,
    chapterHint: 'bridge-agg',
    exercise: mcq(
      'SQL GROUP BY dept → PySpark:',
      ["df.orderBy('dept')", "df.groupBy('dept').agg(...)", "df.drop('dept')", 'df.collect()'],
      1,
      'groupBy + agg mirrors GROUP BY.',
      { tags: ['bridge'] },
    ),
  },
  {
    id: 'place-br-3',
    track: 'bridge',
    difficulty: 2,
    chapterHint: 'bridge-joins',
    exercise: fill(
      'SQL LEFT JOIN ≈',
      "df.join(other, on='id', how='___')",
      ['left'],
      "how='left' is left outer join.",
      ['joins'],
    ),
  },
  {
    id: 'place-br-4',
    track: 'bridge',
    difficulty: 3,
    chapterHint: 'bridge-window',
    exercise: mcq(
      'SQL ROW_NUMBER() OVER (PARTITION BY c ORDER BY t) maps to:',
      ['F.count', 'F.row_number().over(Window.partitionBy("c").orderBy("t"))', 'df.distinct', 'F.explode'],
      1,
      'Window API mirrors OVER.',
      { tags: ['window'] },
    ),
  },
  {
    id: 'place-br-5',
    track: 'bridge',
    difficulty: 4,
    chapterHint: 'bridge-nulls',
    exercise: match(
      'Null handling',
      [
        { left: 'IS NULL', right: 'F.col("x").isNull()' },
        { left: 'COALESCE(a,b)', right: 'F.coalesce(a, b)' },
      ],
      'Null APIs are close cousins.',
      ['null'],
    ),
  },
  {
    id: 'place-br-6',
    track: 'bridge',
    difficulty: 5,
    chapterHint: 'bridge-quality',
    exercise: mcq(
      'Deduplicate by user_id keeping latest ts — both dialects need:',
      ['CROSS JOIN only', 'A ranking/window or group-wise max pattern', 'DROP DATABASE', 'UNION without keys'],
      1,
      'Window row_number or aggregate max join-back are common patterns.',
      { tags: ['quality'] },
    ),
  },
]

export function getPlacement(track: TrackId): PlacementQuestion[] {
  if (track === 'sql') return sqlPlacement
  if (track === 'pyspark') return pysparkPlacement
  return bridgePlacement
}
