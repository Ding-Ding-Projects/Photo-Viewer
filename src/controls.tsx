import { useBi } from './i18n'

/** M3 segmented button group with i18n labels. */
export function Seg(p: {
  id: string
  value: string
  onChange: (v: string) => void
  options: { v: string; k: string }[]
}) {
  const bi = useBi()
  return (
    <div className="seg" data-od-id={p.id}>
      {p.options.map((o) => {
        const r = bi(o.k)
        return (
          <button key={o.v} className={p.value === o.v ? 'on' : ''} onClick={() => p.onChange(o.v)}>
            {r.a}
            {r.b ? <span className="l-b">{r.b}</span> : null}
          </button>
        )
      })}
    </div>
  )
}

export function ExifRow(p: { k: string; v: string }) {
  return (
    <div className="exif-row">
      <span className="exif-dt">{p.k}</span>
      <span className="exif-dd">{p.v}</span>
    </div>
  )
}
