import { useMemo, useState } from 'react'
import { IcX, IcSearch } from './icons'
import { useTx } from './i18n'
import type { HistoryEntry } from './types'

export default function NotificationHistory(p: {
  entries: HistoryEntry[]
  onDismissForever: (id: string) => void
  onRestore: (entry: HistoryEntry) => void
  onClose: () => void
}) {
  const tx = useTx()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    if (!q.trim()) return p.entries
    const lo = q.toLowerCase()
    return p.entries.filter((e) => e.message.toLowerCase().includes(lo))
  }, [q, p.entries])

  return (
    <div className="modal-backdrop">
      <div className="drawer notif-drawer">
        <div className="notif-header">
          <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>Notifications</span>
          <button className="icon-btn" onClick={p.onClose}>
            <IcX size={20} />
          </button>
        </div>
        <div style={{ padding: 16 }}>
          <label className="searchbar">
            <IcSearch size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tx('notif.search')} spellCheck={false} autoFocus />
          </label>
        </div>
        <div className="notif-list">
          {filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--on-surface-variant)' }}>
              {q ? tx('notif.empty.search') : tx('notif.empty')}
            </div>
          )}
          {filtered.map((entry) => (
            <div key={entry.id} className="notif-item">
              <div className="notif-time">{entry.time}</div>
              <div className="notif-msg">{entry.message}</div>
              {entry.actionLabel && entry.onAction && (
                <button className="btn btn-tonal" style={{ marginTop: 6, height: 28 }} onClick={() => p.onRestore(entry)}>
                  {entry.actionLabel}
                </button>
              )}
              <button className="icon-btn notif-del" aria-label={tx('notif.delete')} onClick={() => p.onDismissForever(entry.id)}>
                <IcX size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

