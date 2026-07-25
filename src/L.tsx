import { useBi } from './i18n'

/** Renders a UI string; in bilingual mode the Cantonese line sits under the English one. */
export default function L({ k }: { k: string }) {
  const bi = useBi()
  const r = bi(k)
  if (!r.b) return <>{r.a}</>
  return (
    <span className="l">
      <span className="l-a">{r.a}</span>
      <span className="l-b">{r.b}</span>
    </span>
  )
}
