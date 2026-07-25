import { IcX } from './icons'
import type { Toast } from './types'

/** M3 snackbars — informational, non-blocking, corner-placed per the repo spec. */
export default function SnackbarRegion(p: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="toast-region" data-od-id="toast-region" aria-live="polite">
      {p.toasts.map((t) => (
        <div className="snackbar" key={t.id}>
          <span className="snackbar-msg">{t.message}</span>
          {t.actionLabel && t.onAction && (
            <button
              className="snackbar-action"
              onClick={() => {
                t.onAction?.()
                p.onDismiss(t.id)
              }}
            >
              {t.actionLabel}
            </button>
          )}
          <button
            className="icon-btn"
            style={{ width: 28, height: 28, color: 'inherit' }}
            onClick={() => p.onDismiss(t.id)}
            aria-label="Dismiss"
          >
            <IcX size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
