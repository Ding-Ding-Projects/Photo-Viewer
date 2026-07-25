import type { ReactNode } from 'react'
import L from './L'
import { IcGear, IcSearch, IcSparkle, IcX } from './icons'
import { fmt, useBi } from './i18n'
import type { SortKey } from './types'

export interface RegexState {
  on: boolean
  open: boolean
  pattern: string
  flags: { i: boolean; m: boolean; s: boolean }
  flagStr: string
  error: string | null
  matches: number
}

const SORT_KEYS: { value: SortKey; k: string }[] = [
  { value: 'date-desc', k: 'sort.dateDesc' },
  { value: 'date-asc', k: 'sort.dateAsc' },
  { value: 'name-asc', k: 'sort.nameAsc' },
  { value: 'name-desc', k: 'sort.nameDesc' },
]

export default function AppBar(p: {
  title: ReactNode
  countText: string
  query: string
  onQuery: (q: string) => void
  rx: RegexState
  onRxTogglePopover: () => void
  onRxPattern: (v: string) => void
  onRxFlag: (f: 'i' | 'm' | 's') => void
  onRxApply: () => void
  onRxClear: () => void
  sortKey: SortKey
  onSort: (k: SortKey) => void
  thumbSize: number
  onThumbSize: (n: number) => void
  selecting: boolean
  onToggleSelect: () => void
  onIndex: () => void
  indexing: boolean
  onOpenSettings: () => void
  tx: (k: string) => string
}) {
  const bi = useBi()
  return (
    <div className="appbar" data-od-id="toolbar">
      <span className="view-title" data-od-id="view-title">
        {p.title}
      </span>
      <span className="view-count">{p.countText}</span>
      <div className="appbar-spacer" />

      <div className="popover-wrap">
        <label className="searchbar" data-od-id="search-input">
          <IcSearch size={18} />
          <input
            value={p.query}
            onChange={(e) => p.onQuery(e.target.value)}
            placeholder={p.tx('search.ph')}
            spellCheck={false}
            disabled={p.rx.on && !!p.rx.pattern}
          />
          <button
            className={'icon-btn' + (p.rx.on && p.rx.pattern ? ' on' : '')}
            data-od-id="regex-toggle"
            title={p.tx('rx.tip')}
            onClick={(e) => {
              e.preventDefault()
              p.onRxTogglePopover()
            }}
          >
            .*
          </button>
        </label>

        {p.rx.open && (
          <div className="popover" data-od-id="regex-builder">
            <div className="rx-title">
              <L k="rx.title" />
            </div>
            <input
              className="rx-field"
              value={p.rx.pattern}
              autoFocus
              onChange={(e) => p.onRxPattern(e.target.value)}
              placeholder={p.tx('rx.pattern') + '  ·  ^DSC_\\d+\\.jpg$'}
              spellCheck={false}
              data-od-id="regex-pattern"
            />
            <div className="rx-flags">
              <span style={{ fontSize: 'var(--fs-12)', color: 'var(--on-surface-variant)' }}>
                <L k="rx.flags" />:
              </span>
              {(['i', 'm', 's'] as const).map((f) => (
                <label key={f} className="rx-flag">
                  <input type="checkbox" checked={p.rx.flags[f]} onChange={() => p.onRxFlag(f)} /> {f}
                </label>
              ))}
            </div>
            <div className={'rx-status' + (p.rx.error ? ' err' : '')} data-od-id="regex-status">
              {p.rx.error
                ? fmt(bi('rx.invalid').a, { m: p.rx.error })
                : p.rx.pattern
                  ? fmt(p.tx('rx.matches'), { n: String(p.rx.matches) })
                  : ' '}
            </div>
            <div className="rx-actions">
              <button className="btn btn-text" data-od-id="regex-clear" onClick={p.onRxClear}>
                <L k="rx.clear" />
              </button>
              <button
                className="btn btn-filled"
                style={{ height: 36 }}
                data-od-id="regex-apply"
                disabled={!!p.rx.error || !p.rx.pattern}
                onClick={p.onRxApply}
              >
                <L k="rx.apply" />
              </button>
            </div>
          </div>
        )}
      </div>

      {p.rx.on && p.rx.pattern && (
        <span className="chip" data-od-id="regex-chip">
          /{p.rx.pattern}/{p.rx.flagStr}
          <button onClick={p.onRxClear} aria-label={p.tx('rx.clear')}>
            <IcX size={12} />
          </button>
        </span>
      )}

      <label className="select-wrap" data-od-id="sort-select">
        <select value={p.sortKey} onChange={(e) => p.onSort(e.target.value as SortKey)}>
          {SORT_KEYS.map((o) => (
            <option key={o.value} value={o.value}>
              {p.tx(o.k)}
            </option>
          ))}
        </select>
      </label>

      <label className="range-wrap" data-od-id="thumb-size-slider">
        <span className="range-label">
          <L k="size" />
        </span>
        <input
          type="range"
          min={150}
          max={320}
          step={10}
          value={p.thumbSize}
          onChange={(e) => p.onThumbSize(Number(e.target.value))}
          aria-label={p.tx('size')}
        />
      </label>

      <button className={'btn ' + (p.selecting ? 'btn-filled' : 'btn-tonal')} data-od-id="select-toggle" onClick={p.onToggleSelect}>
        <L k={p.selecting ? 'done' : 'select'} />
      </button>
      <button
        className="icon-btn"
        data-od-id="ai-index-button"
        title={p.tx('ai.tip')}
        disabled={p.indexing}
        onClick={p.onIndex}
      >
        <IcSparkle />
      </button>
      <button className="icon-btn" data-od-id="settings-button" title={p.tx('settings')} onClick={p.onOpenSettings}>
        <IcGear />
      </button>
    </div>
  )
}
