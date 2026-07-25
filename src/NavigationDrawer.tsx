import L from './L'
import { IcAperture, IcFolder, IcHeart, IcStack } from './icons'
import { fmt } from './i18n'
import type { Album, Photo, View } from './types'

export default function NavigationDrawer(p: {
  view: View
  onView: (v: View) => void
  photos: Photo[]
  albums: Album[]
  favCount: number
  cameraCount: number
  tx: (k: string) => string
}) {
  return (
    <aside className="drawer" data-od-id="sidebar">
      <div className="brand" data-od-id="brand">
        <span className="brand-mark">
          <IcAperture />
        </span>
        <div>
          <div className="brand-name">Photo Viewer</div>
          <div className="brand-sub">v0.1 · M1 scaffold</div>
        </div>
      </div>
      <nav className="drawer-scroll">
        <div className="nav-label">
          <L k="nav.library" />
        </div>
        <button
          className={'nav-item' + (p.view.kind === 'all' ? ' active' : '')}
          data-od-id="nav-all-photos"
          onClick={() => p.onView({ kind: 'all' })}
        >
          <IcStack /> <L k="nav.all" /> <span className="nav-count">{p.photos.length}</span>
        </button>
        <button
          className={'nav-item' + (p.view.kind === 'favorites' ? ' active' : '')}
          data-od-id="nav-favorites"
          onClick={() => p.onView({ kind: 'favorites' })}
        >
          <IcHeart filled={p.view.kind === 'favorites'} /> <L k="nav.fav" />{' '}
          <span className="nav-count">{p.favCount}</span>
        </button>
        <div className="nav-label" data-od-id="album-list">
          <L k="nav.albums" />
        </div>
        {p.albums.map((a) => (
          <button
            key={a.id}
            className={'nav-item' + (p.view.kind === 'album' && p.view.albumId === a.id ? ' active' : '')}
            data-od-id={'nav-album-' + a.id}
            onClick={() => p.onView({ kind: 'album', albumId: a.id })}
          >
            <IcFolder /> {a.name}
            <span className="nav-count">{p.photos.filter((ph) => ph.albumId === a.id).length}</span>
          </button>
        ))}
      </nav>
      <div className="drawer-foot">
        {fmt(p.tx('foot.counts'), { n: String(p.photos.length), c: String(p.cameraCount) })}
        <br />
        {p.tx('foot.note')}
      </div>
    </aside>
  )
}
