import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AppBar from './AppBar'
import GalleryGrid from './GalleryGrid'
import type { EmptyState } from './GalleryGrid'
import Lightbox from './Lightbox'
import L from './L'
import NavigationDrawer from './NavigationDrawer'
import SettingsDialog from './SettingsDialog'
import SnackbarRegion from './SnackbarRegion'
import NotificationHistory from './NotificationHistory'
import { IcHeart, IcTrash } from './icons'
import { createIndexer } from './aiIndexer'
import { aiLoadAll } from './aiStore'
import { pickLibraryFolder } from './library'
import { ALBUMS, BASE_PHOTOS } from './data'
import { I18nContext, fmt, makeBi, useTx } from './i18n'
import { usePrefs } from './theme'
import type { Album, HistoryEntry, Photo, SortKey, Toast, View } from './types'
const FAVS_KEY = 'pv:favorites'
const NOTIF_KEY = 'pv:notifications'
function readNotifications(): HistoryEntry[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]')
    return Array.isArray(v) ? (v as HistoryEntry[]) : []
  } catch {
    return []
  }
}
function writeNotifications(notes: HistoryEntry[]) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notes.slice(-100)))
}
function readFavs(): string[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(FAVS_KEY) || '[]')
    return Array.isArray(v) ? (v as string[]) : []
  } catch {
    return []
  }
}
export default function App() {
  const [prefs, setP] = usePrefs()
  const bi = useMemo(() => makeBi(prefs.lang, prefs.funny), [prefs.lang, prefs.funny])
  return (
    <I18nContext.Provider value={bi}>
      <Shell prefs={prefs} setP={setP} />
    </I18nContext.Provider>
  )
}
function Shell(p: { prefs: ReturnType<typeof usePrefs>[0]; setP: ReturnType<typeof usePrefs>[1] }) {
  const tx = useTx()
  /* ----- library state ----- */
  const [photos, setPhotos] = useState<Photo[]>(() => {
    const favs = readFavs()
    return BASE_PHOTOS.map((ph) => ({ ...ph, favorite: favs.includes(ph.id) || ph.favorite }))
  })
  const [view, setView] = useState<View>({ kind: 'all' })
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date-desc')
  const [thumbSize, setThumbSize] = useState(220)
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [lightboxId, setLightboxId] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [notificationHistory, setNotificationHistory] = useState<HistoryEntry[]>(readNotifications)
  const [_lastDeleted, _setLastDeleted] = useState<Photo[]>([])
  const [albums, _setAlbums] = useState<Album[]>(ALBUMS)
  const [libraryName, setLibraryName] = useState<string | null>(null)
  const libUrls = useRef<string[]>([])
  const [indexing, setIndexing] = useState<{ done: number; total: number; model: boolean } | null>(null)
  const indexerRef = useRef<ReturnType<typeof createIndexer> | null>(null)
  /* apply cached AI tags from a previous session (index once, search forever) */
  useEffect(() => {
    let alive = true
    aiLoadAll().then((cached) => {
      if (!alive || cached.size === 0) return
      setPhotos((ps) => ps.map((ph) => (!ph.ai && cached.has(ph.id) ? { ...ph, ai: cached.get(ph.id) } : ph)))
    })
    return () => { alive = false }
  }, [])
  /* ----- regex search (plain text is the default; builder opt-in per repo spec) ----- */
  const [regexOn, setRegexOn] = useState(false)
  const [rxOpen, setRxOpen] = useState(false)
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState({ i: true, m: false, s: false })
  const flagStr = (flags.i ? 'i' : '') + (flags.m ? 'm' : '') + (flags.s ? 's' : '')
  const rx = useMemo(() => {
    if (!regexOn || !pattern) return { re: null as RegExp | null, error: null as string | null }
    try {
      return { re: new RegExp(pattern, flagStr), error: null }
    } catch (e) {
      return { re: null, error: String(e instanceof Error ? e.message : e) }
    }
  }, [regexOn, pattern, flagStr])
  /* persist favorites without dropping ids from a library that isn't currently loaded */
  useEffect(() => {
    const current = new Set(photos.map((ph) => ph.id))
    const keep = readFavs().filter((id) => !current.has(id))
    localStorage.setItem(FAVS_KEY, JSON.stringify([...keep, ...photos.filter((ph) => ph.favorite).map((ph) => ph.id)]))
  }, [photos])
  const pushToast = useCallback(
    (message: string, actionLabel?: string, onAction?: () => void) => {
      const id = Math.random().toString(36).slice(2)
      const entry: HistoryEntry = { id, message, time: new Date().toLocaleTimeString(), actionLabel, onAction }
      setNotificationHistory((h) => [...h, entry])
      writeNotifications([...notificationHistory, entry])
      setToasts((t) => [...t, { id, message, actionLabel, onAction }])
      window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600)
    },
    [notificationHistory],
  )
  const dismissToast = useCallback(
    (id: string) => {
      setToasts((t) => t.filter((x) => x.id !== id))
      // Keep entry in history, just remove active toast
    },
    [],
  )
  const dismissForever = useCallback(
    (id: string) => {
      setNotificationHistory((h) => h.filter((e) => e.id !== id))
      writeNotifications(notificationHistory.filter((e) => e.id !== id))
    },
    [notificationHistory],
  )
  const albumName = useCallback((id: string) => (albums.find((a) => a.id === id) ?? { name: id }).name, [albums])
  const haystack = useCallback(
    (ph: Photo) =>
      [ph.filename, albumName(ph.albumId), ph.exif.location, ph.exif.camera, ...(ph.ai?.labels.map((l) => l.text) ?? [])]
        .join(' ')
        .toLowerCase(),
    [albumName],
  )
  const viewOnly = useMemo(
    () =>
      photos.filter((ph) => {
        if (view.kind === 'all') return true
        if (view.kind === 'favorites') return ph.favorite
        return ph.albumId === view.albumId
      }),
    [photos, view],
  )
  const visible = useMemo(() => {
    let list = viewOnly
    if (query.trim()) {
      list = list.filter((ph) => haystack(ph).includes(query.toLowerCase()))
    }
    if (regexOn && pattern && rx.re) {
      const hits = list.filter((ph) => rx.re!.test(haystack(ph)))
      return hits
    }
    // sort
    let key: SortKey; let dir: 'asc' | 'desc';
    if (sortKey === "date-desc") { key = "date-desc"; dir = "desc"; } else if (sortKey === "date-asc") { key = "date-asc"; dir = "asc"; } else if (sortKey === "name-asc") { key = "name-asc"; dir = "asc"; } else { key = "name-desc"; dir = "desc"; }
    return [...list].sort((a, b) => {
      let cmp = 0
      if (key.startsWith("date")) cmp = new Date(a.exif.taken).getTime() - new Date(b.exif.taken).getTime()
      else cmp = a.filename.localeCompare(b.filename)
      return dir === 'asc' ? cmp : -cmp
    })
  }, [viewOnly, query, regexOn, pattern, rx.re, sortKey])
  /* ----- index controls ----- */
  const startIndexing = useCallback(() => {
    if (indexerRef.current?.running()) return
    indexerRef.current = createIndexer({ onModelState: () => {}, onProgress: (d, t) => setIndexing({ done: d, total: t, model: false }), onResult: () => {}, onDone: () => {} })
    pushToast(tx('ai.start'))
  }, [tx, pushToast])
  const cancelIndexing = useCallback(() => {
    indexerRef.current?.cancel()
    setIndexing(null)
  }, [])
  /* ----- selection helpers ----- */
  const exitSelecting = () => { setSelected(new Set()); setSelecting(false) }
  const toggleFavorite = useCallback((ph: Photo) => setPhotos((ps) => ps.map((p) => (p.id === ph.id ? { ...p, favorite: !p.favorite } : p))), [])
  const favoriteMany = useCallback(
    (ids: string[]) => setPhotos((ps) => ps.map((ph) => ids.includes(ph.id) ? { ...ph, favorite: true } : ph)),
    [],
  )
  const deleteIds = useCallback((ids: string[]) => setPhotos((ps) => { const rest = ps.filter((p) => !ids.includes(p.id)); _setLastDeleted(ps.filter((p) => ids.includes(p.id))); return rest }), [])
  const onCardClick = (ph: Photo) => { if (!selecting) setLightboxId(ph.id) }
  const stepLightbox = useCallback((delta: number) => {
    if (!lightboxId) return
    const arr = visible.map((p) => p.id)
    const i = arr.indexOf(lightboxId) + delta
    if (i >= 0 && i < arr.length) setLightboxId(arr[i])
  }, [lightboxId, visible])
  /* ----- choose library folder ----- */
  const chooseFolder = useCallback(async () => {
    const res = await pickLibraryFolder()
    if (res.status !== "ok") return
    libUrls.current = res.urls
    if (res.photos.length > 0) {
      setPhotos((ps) =>
        ps.map((ph, i) => (i < res.urls.length ? { ...ph, src: res.urls[i] } : ph)),
      )
      setLibraryName(tx('folder.loaded'))
    }
  }, [tx])
  /* ----- computed display values ----- */
  const title = useMemo(() => {
    if (view.kind === 'all') return tx('all')
    if (view.kind === 'favorites') return tx('fav')
    return albumName(view.albumId)
  }, [view, tx, albumName])
  const countText = fmt(tx('count'), { n: String(visible.length) })
  const rxMatches = regexOn && rx.re ? visible.filter((ph) => rx.re!.test(haystack(ph))).length : 0
  const lbPhoto = lightboxId ? visible.find((p) => p.id === lightboxId) : null
  const searching = query.trim() !== '' || (regexOn && pattern !== '')
  let empty: EmptyState | null = null
  if (visible.length === 0) {
    if (searching)
      empty = { icon: 'search', title: fmt(tx('empty.match.t'), { q: regexOn && pattern ? `/${pattern}/` : query }), body: tx('empty.match.b') }
    else if (view.kind === 'favorites') empty = { icon: 'heart', title: tx('empty.fav.t'), body: tx('empty.fav.b') }
    else empty = { icon: 'search', title: tx('empty.album.t'), body: '' }
  }
  return (
    <div className={'app' + (selecting ? ' selecting' : '')} data-theme={p.prefs.theme}>
      <NavigationDrawer
        view={view} onView={setView} photos={photos} albums={albums}
        favCount={photos.filter((ph) => ph.favorite).length}
        cameraCount={new Set(photos.map((ph) => ph.exif.camera).filter((c) => c !== '')).size} tx={tx}
      />
      <main className="main">
        <AppBar
          title={title} countText={countText} query={query} onQuery={setQuery}
          rx={{ on: regexOn, open: rxOpen, pattern, flags, flagStr, error: rx.error, matches: rxMatches }}
          onRxTogglePopover={() => setRxOpen((o) => !o)}
          onRxPattern={(v) => { setPattern(v); setRegexOn(true) }}
          onRxFlag={(f) => setFlags((fl) => ({ ...fl, [f]: !fl[f] }))}
          onRxApply={() => { setRegexOn(true); setRxOpen(false) }}
          onRxClear={() => { setPattern(''); setRegexOn(false) }}
          sortKey={sortKey} onSort={setSortKey} thumbSize={thumbSize} onThumbSize={setThumbSize}
          selecting={selecting} onToggleSelect={() => (selecting ? exitSelecting() : setSelecting(true))}
          onIndex={startIndexing} indexing={indexing !== null}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenNotifications={() => setNotificationsOpen((o) => !o)}
          notifCount={notificationHistory.length}
          tx={tx}
        />
        {selecting && (
          <div className="selection-bar" data-od-id="selection-bar">
            <span className="selection-count">
              {selected.size === 0 ? tx('sel.hint') : fmt(tx('sel.count'), { n: String(selected.size) })}
            </span>
            <div className="appbar-spacer" />
            <button className="btn btn-tonal" style={{ height: 34 }} disabled={selected.size === 0} data-od-id="selection-favorite"
              onClick={() => favoriteMany(Array.from(selected))}>
              <IcHeart size={16} /> <L k="favorite" />
            </button>
            <button className="btn btn-text btn-danger" style={{ height: 34 }} disabled={selected.size === 0} data-od-id="selection-delete"
              onClick={() => { deleteIds(Array.from(selected)); setSelected(new Set()) }}>
              <IcTrash size={16} /> <L k="delete" />
            </button>
            <button className="btn btn-text" style={{ height: 34 }} onClick={exitSelecting}><L k="cancel" /></button>
          </div>
        )}
        <GalleryGrid photos={visible} selecting={selecting} selected={selected} thumbSize={thumbSize} empty={empty}
          onCardClick={onCardClick} onFavorite={toggleFavorite} />
      </main>
      {lbPhoto && (
        <Lightbox list={visible} photo={lbPhoto} index={lbPhoto ? visible.findIndex((p) => p.id === lbPhoto.id) : 0}
          onClose={() => setLightboxId(null)} onStep={stepLightbox} onJump={setLightboxId}
          onFavorite={toggleFavorite} onDownload={(ph) => pushToast(fmt(tx('toast.dl'), { f: ph.filename }))}
          albumName={albumName} tx={tx} />
      )}
      {settingsOpen && (
        <SettingsDialog prefs={p.prefs} setP={p.setP} onClose={() => setSettingsOpen(false)}
          onChooseFolder={chooseFolder} libraryName={libraryName} tx={tx} />
      )}
      {notificationsOpen && (
        <NotificationHistory entries={notificationHistory}
          onDismissForever={dismissForever}
          onRestore={(entry) => { entry.onAction?.(); dismissForever(entry.id) }}
          onClose={() => setNotificationsOpen(false)} />
      )}
      <SnackbarRegion toasts={toasts} onDismiss={dismissToast}>
        {indexing && (
          <div className="snackbar" data-od-id="ai-progress">
            <span className="snackbar-msg">
              {indexing.model && indexing.done === 0 ? tx('ai.model') : fmt(tx('ai.progress'), { n: String(indexing.done), t: String(indexing.total) })}
            </span>
            <button className="snackbar-action" onClick={cancelIndexing}><L k="cancel" /></button>
          </div>
        )}
      </SnackbarRegion>
    </div>
  )
}
