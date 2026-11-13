import { highlight, type Lang } from '../lib/highlight'

export function Code({ code, lang = 'auto' }: { code: string; lang?: Lang }) {
  return (
    <pre className="overflow-x-auto rounded-2xl bg-[#1b2236] px-4 py-3.5 text-[13px] leading-relaxed text-slate-100">
      <code>{highlight(code, lang)}</code>
    </pre>
  )
}
