import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import AppBar from './AppBar'
import GalleryGrid from './GalleryGrid'
import type { EmptyState } from './GalleryGrid'
import Lightbox from './Lightbox'
import L from './L'
import NavigationDrawer from './NavigationDrawer'
import SettingsDialog from './SettingsDialog'
import SnackbarRegion from './SnackbarRegion'
import { IcHeart, IcTrash } from './icons'
import { pickLibraryFolder } from './library'
import { ALBUMS, BASE_PHOTOS } from './data'
import { I18nContext, fmt, makeBi, useTx } from './i18n'
import { usePrefs } from './theme'
import type { Album, Photo, SortKey, Toast, View } from './types'

const FAVS_KEY = 'pv:favorites'

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
  const [toasts, setToasts] = useState<Toast[]>([])
  const [lastDeleted, setLastDeleted] = useState<Photo[]>([])
  const [albums, setAlbums] = useState<Album[]>(ALBUMS)
  const [libraryName, setLibraryName] = useState<string | null>(null)
  const libUrls = useRef<string[]>([])

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

  const pushToast = useCallback((message: string, actionLabel?: string, onAction?: () => void) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, actionLabel, onAction }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600)
  }, [])
  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const albumName = useCallback((id: string) => (albums.find((a) => a.id === id) ?? { name: id }).name, [albums])
  const haystack = useCallback(
    (ph: Photo) => [ph.filename, albumName(ph.albumId), ph.exif.location, ph.exif.camera].join(' ').toLowerCase(),
    [albumName],
  )

  const viewOnly = useMemo(
    () =>
      photos.filter((ph) => {
        if (view.kind === 'favorites' && !ph.favorite) return false
        if (view.kind === 'album' && ph.albumId !== view.albumId) return false
        return true
      }),
    [photos, view],
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = viewOnly.filter((ph) => {
      if (regexOn && pattern) return rx.re ? rx.re.test(haystack(ph)) : true
      if (!q) return true
      return haystack(ph).includes(q)
    })
    const byDate = (a: Photo, b: Photo) => a.exif.taken.localeCompare(b.exif.taken)
    const byName = (a: Photo, b: Photo) => a.filename.localeCompare(b.filename)
    return [...list].sort(
      sortKey === 'date-desc'
        ? (a, b) => byDate(b, a)
        : sortKey === 'date-asc'
          ? byDate
          : sortKey === 'name-asc'
            ? byName
            : (a, b) => byName(b, a),
    )
  }, [viewOnly, query, sortKey, regexOn, pattern, rx, haystack])

  const rxMatches = useMemo(() => (rx.re ? viewOnly.filter((ph) => rx.re!.test(haystack(ph))).length : 0), [rx, viewOnly, haystack])

  /* ----- mutations ----- */
  const toggleFavorite = useCallback(
    (id: string) => {
      setPhotos((ps) => {
        const target = ps.find((ph) => ph.id === id)
        if (target) pushToast(fmt(tx(target.favorite ? 'toast.favDel' : 'toast.favAdd'), { f: target.filename }))
        return ps.map((ph) => (ph.id === id ? { ...ph, favorite: !ph.favorite } : ph))
      })
    },
    [pushToast, tx],
  )

  const favoriteMany = (ids: string[]) => {
    setPhotos((ps) => ps.map((ph) => (ids.includes(ph.id) && !ph.favorite ? { ...ph, favorite: true } : ph)))
    pushToast(fmt(tx('toast.favN'), { n: String(ids.length) }))
  }

  const deleteIds = useCallback(
    (ids: string[]) => {
      setPhotos((ps) => {
        setLastDeleted(ps.filter((ph) => ids.includes(ph.id)))
        return ps.filter((ph) => !ids.includes(ph.id))
      })
      if (lightboxId && ids.includes(lightboxId)) setLightboxId(null)
      const msg = ids.length === 1 ? tx('toast.trash1') : fmt(tx('toast.trashN'), { n: String(ids.length) })
      pushToast(msg, tx('undo'), () => setPhotos((ps) => [...ps, ...lastDeleted]))
    },
    [lightboxId, pushToast, tx, lastDeleted],
  )

  /* ----- escape closes popover / dialog (lightbox handles its own keys) ----- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (rxOpen) setRxOpen(false)
      else if (settingsOpen) setSettingsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [rxOpen, settingsOpen])

  /* ----- selection ----- */
  const toggleSelect = (id: string) =>
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const exitSelecting = () => {
    setSelecting(false)
    setSelected(new Set())
  }

  /* ----- folder picker: load a real library via the File System Access API ----- */
  const chooseFolder = useCallback(async () => {
    const res = await pickLibraryFolder()
    if (res.status === 'cancelled') return
    if (res.status === 'unsupported') return pushToast(tx('toast.folder.unsupported'))
    if (res.status === 'error') return pushToast(fmt(tx('toast.folder.error'), { m: res.message }))
    if (res.status === 'empty') return pushToast(fmt(tx('toast.folder.empty'), { f: res.name }))
    libUrls.current.forEach((u) => URL.revokeObjectURL(u))
    libUrls.current = res.urls
    const favs = readFavs()
    setPhotos(res.photos.map((ph) => (favs.includes(ph.id) ? { ...ph, favorite: true } : ph)))
    setAlbums(res.albums)
    setLibraryName(res.name)
    setView({ kind: 'all' })
    setLightboxId(null)
    setSelecting(false)
    setSelected(new Set())
    setSettingsOpen(false)
    pushToast(fmt(tx('toast.folder.loaded'), { n: String(res.photos.length), f: res.name }))
  }, [pushToast, tx])
  const onCardClick = (ph: Photo) => {
    if (selecting) toggleSelect(ph.id)
    else setLightboxId(ph.id)
  }

  /* ----- lightbox ----- */
  const lbIndex = lightboxId ? visible.findIndex((ph) => ph.id === lightboxId) : -1
  const lbPhoto = lbIndex >= 0 ? visible[lbIndex] : null
  const stepLightbox = (dir: number) => {
    if (lbIndex < 0 || visible.length === 0) return
    setLightboxId(visible[(lbIndex + dir + visible.length) % visible.length].id)
  }

  /* ----- header / empty-state text ----- */
  const title: ReactNode =
    view.kind === 'all' ? <L k="nav.all" /> : view.kind === 'favorites' ? <L k="nav.fav" /> : albumName(view.albumId)
  const countText = visible.length === 1 ? tx('item1') : fmt(tx('items'), { n: String(visible.length) })

  const searching = query.trim() !== '' || (regexOn && pattern !== '')
  let empty: EmptyState | null = null
  if (visible.length === 0) {
    if (searching)
      empty = {
        icon: 'search',
        title: fmt(tx('empty.match.t'), { q: regexOn && pattern ? `/${pattern}/` : query }),
        body: tx('empty.match.b'),
      }
    else if (view.kind === 'favorites') empty = { icon: 'heart', title: tx('empty.fav.t'), body: tx('empty.fav.b') }
    else empty = { icon: 'search', title: tx('empty.album.t'), body: '' }
  }

  return (
    <div className={'app' + (selecting ? ' selecting' : '')} data-theme={p.prefs.theme}>
      <NavigationDrawer
        view={view}
        onView={setView}
        photos={photos}
        albums={albums}
        favCount={photos.filter((ph) => ph.favorite).length}
        cameraCount={new Set(photos.map((ph) => ph.exif.camera).filter((c) => c !== '—')).size}
        tx={tx}
      />

      <main className="main">
        <AppBar
          title={title}
          countText={countText}
          query={query}
          onQuery={setQuery}
          rx={{ on: regexOn, open: rxOpen, pattern, flags, flagStr, error: rx.error, matches: rxMatches }}
          onRxTogglePopover={() => setRxOpen((o) => !o)}
          onRxPattern={(v) => {
            setPattern(v)
            setRegexOn(true)
          }}
          onRxFlag={(f) => setFlags((fl) => ({ ...fl, [f]: !fl[f] }))}
          onRxApply={() => {
            setRegexOn(true)
            setRxOpen(false)
          }}
          onRxClear={() => {
            setPattern('')
            setRegexOn(false)
          }}
          sortKey={sortKey}
          onSort={setSortKey}
          thumbSize={thumbSize}
          onThumbSize={setThumbSize}
          selecting={selecting}
          onToggleSelect={() => (selecting ? exitSelecting() : setSelecting(true))}
          onOpenSettings={() => setSettingsOpen(true)}
          tx={tx}
        />

        {selecting && (
          <div className="selection-bar" data-od-id="selection-bar">
            <span className="selection-count">
              {selected.size === 0 ? tx('sel.hint') : fmt(tx('sel.count'), { n: String(selected.size) })}
            </span>
            <div className="appbar-spacer" />
            <button
              className="btn btn-tonal"
              style={{ height: 34 }}
              disabled={selected.size === 0}
              data-od-id="selection-favorite"
              onClick={() => favoriteMany(Array.from(selected))}
            >
              <IcHeart size={16} /> <L k="favorite" />
            </button>
            <button
              className="btn btn-text btn-danger"
              style={{ height: 34 }}
              disabled={selected.size === 0}
              data-od-id="selection-delete"
              onClick={() => {
                deleteIds(Array.from(selected))
                setSelected(new Set())
              }}
            >
              <IcTrash size={16} /> <L k="delete" />
            </button>
            <button className="btn btn-text" style={{ height: 34 }} onClick={exitSelecting}>
              <L k="cancel" />
            </button>
          </div>
        )}

        <GalleryGrid
          photos={visible}
          selecting={selecting}
          selected={selected}
          thumbSize={thumbSize}
          empty={empty}
          onCardClick={onCardClick}
          onFavorite={toggleFavorite}
        />
      </main>

      {lbPhoto && (
        <Lightbox
          list={visible}
          photo={lbPhoto}
          index={lbIndex}
          onClose={() => setLightboxId(null)}
          onStep={stepLightbox}
          onJump={setLightboxId}
          onFavorite={toggleFavorite}
          onDownload={(ph) => pushToast(fmt(tx('toast.dl'), { f: ph.filename }))}
          albumName={albumName}
          tx={tx}
        />
      )}

      {settingsOpen && (
        <SettingsDialog
          prefs={p.prefs}
          setP={p.setP}
          onClose={() => setSettingsOpen(false)}
          onChooseFolder={chooseFolder}
          libraryName={libraryName}
          tx={tx}
        />
      )}

      <SnackbarRegion toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
