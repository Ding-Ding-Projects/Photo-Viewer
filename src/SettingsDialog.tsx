import { Seg } from './controls'
import L from './L'
import { IcCheck, IcFolder, IcX } from './icons'
import { FONTS, SEEDS } from './theme'
import type { Lang, Prefs } from './types'

export default function SettingsDialog(p: {
  prefs: Prefs
  setP: <K extends keyof Prefs>(k: K, v: Prefs[K]) => void
  onClose: () => void
  onChooseFolder: () => void
  libraryName: string | null
  tx: (k: string) => string
}) {
  const { prefs, setP } = p
  return (
    <div className="scrim" onClick={p.onClose}>
      <div
        className="dialog"
        data-od-id="settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={p.tx('settings')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dlg-head">
          <span className="dlg-title">
            <L k="settings" />
          </span>
          <div className="appbar-spacer" />
          <button className="icon-btn" onClick={p.onClose} aria-label={p.tx('hint.close')}>
            <IcX />
          </button>
        </div>
        <div className="dlg-body">
          <div className="dlg-section" data-od-id="settings-appearance">
            <div className="dlg-label">
              <L k="appearance" />
            </div>
            <div className="dlg-row">
              <span style={{ fontSize: 'var(--fs-14)' }}>
                <L k="theme" />
              </span>
              <Seg
                id="theme-segmented"
                value={prefs.theme}
                onChange={(v) => setP('theme', v as Prefs['theme'])}
                options={[
                  { v: 'light', k: 'light' },
                  { v: 'dark', k: 'dark' },
                ]}
              />
            </div>
            <div className="dlg-row" style={{ marginTop: 14 }}>
              <span style={{ fontSize: 'var(--fs-14)' }}>
                <L k="seed" />
              </span>
              <div className="swatches" data-od-id="seed-swatches">
                {SEEDS.map((s) => (
                  <button
                    key={s.h}
                    className={'swatch' + (prefs.seed === s.h ? ' on' : '')}
                    style={{ background: `oklch(60% 0.14 ${s.h})` }}
                    title={s.name}
                    data-od-id={'seed-' + s.name.toLowerCase()}
                    onClick={() => setP('seed', s.h)}
                  >
                    {prefs.seed === s.h ? <IcCheck /> : null}
                  </button>
                ))}
              </div>
            </div>
            <div className="dlg-row" style={{ marginTop: 14 }}>
              <span style={{ fontSize: 'var(--fs-14)' }}>
                <L k="density" />
              </span>
              <Seg
                id="density-segmented"
                value={prefs.density}
                onChange={(v) => setP('density', v as Prefs['density'])}
                options={[
                  { v: 'cozy', k: 'cozy' },
                  { v: 'compact', k: 'compact' },
                ]}
              />
            </div>
            <div className="dlg-row" style={{ marginTop: 14 }}>
              <span style={{ fontSize: 'var(--fs-14)' }}>
                <L k="font" />
              </span>
              <label className="select-wrap" data-od-id="font-select">
                <select value={prefs.font} onChange={(e) => setP('font', e.target.value)}>
                  {Object.keys(FONTS).map((f) => (
                    <option key={f} value={f}>
                      {p.tx(FONTS[f].labelKey)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="dlg-row" style={{ marginTop: 14 }}>
              <span style={{ fontSize: 'var(--fs-14)' }}>
                <L k="fontScale" />
              </span>
              <div className="slider-row" style={{ flex: 1, maxWidth: 220 }} data-od-id="font-scale">
                <input
                  type="range"
                  min={0.9}
                  max={1.15}
                  step={0.05}
                  value={prefs.fontScale}
                  onChange={(e) => setP('fontScale', Number(e.target.value))}
                />
                <span className="slider-val wide">{Math.round(prefs.fontScale * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="dlg-section" data-od-id="settings-language">
            <div className="dlg-label">
              <L k="language" />
            </div>
            <div className="dlg-row">
              <span style={{ fontSize: 'var(--fs-14)' }}>
                <L k="language" />
              </span>
              <div className="seg" data-od-id="lang-picker">
                {(
                  [
                    ['en', 'English'],
                    ['zh', '粵語'],
                    ['bi', '雙語'],
                  ] as const
                ).map(([v, label]) => (
                  <button key={v} className={prefs.lang === v ? 'on' : ''} onClick={() => setP('lang', v as Lang)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="dlg-row" style={{ marginTop: 14 }}>
              <span style={{ fontSize: 'var(--fs-14)' }}>
                <L k="funny" />
              </span>
              <div className="slider-row" style={{ flex: 1, maxWidth: 220 }} data-od-id="funny-slider">
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={prefs.funny}
                  disabled={prefs.lang === 'en'}
                  onChange={(e) => setP('funny', Number(e.target.value))}
                />
                <span className="slider-val">{prefs.funny}</span>
              </div>
            </div>
            <div className="dlg-note">{p.tx('funny.note')}</div>
          </div>

          <div className="dlg-section" data-od-id="settings-folder">
            <div className="dlg-label">
              <L k="folder" />
            </div>
            <div className="folder-box">
              <IcFolder />
              <div className="grow">
                <div className="t">
                  <L k="folder" />
                </div>
                <div className="s">{p.libraryName ?? p.tx('folder.note')}</div>
              </div>
              <button className="btn btn-tonal" style={{ height: 36 }} data-od-id="folder-choose" onClick={p.onChooseFolder}>
                <L k="folder.choose" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
