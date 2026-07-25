import type { CSSProperties } from 'react'
import { IcCheck, IcHeart, IcSearch } from './icons'
import type { Photo } from './types'

export interface EmptyState {
  icon: 'heart' | 'search'
  title: string
  body: string
}

export default function GalleryGrid(p: {
  photos: Photo[]
  selecting: boolean
  selected: Set<string>
  thumbSize: number
  empty: EmptyState | null
  onCardClick: (ph: Photo) => void
  onFavorite: (id: string) => void
}) {
  if (p.empty) {
    return (
      <div className="gallery-scroll">
        <div className="empty" data-od-id="empty-state">
          <div className="empty-icon">
            {p.empty.icon === 'heart' ? <IcHeart size={32} /> : <IcSearch size={32} />}
          </div>
          <div className="empty-title">{p.empty.title}</div>
          {p.empty.body && <div className="empty-body">{p.empty.body}</div>}
        </div>
      </div>
    )
  }
  return (
    <div className="gallery-scroll">
      <div
        className="gallery"
        style={{ '--thumb': p.thumbSize + 'px' } as CSSProperties}
        data-od-id="gallery-grid"
      >
        {p.photos.map((ph) => (
          <figure
            key={ph.id}
            className={'photo-card' + (p.selected.has(ph.id) ? ' selected' : '')}
            data-od-id={'photo-card-' + ph.id}
            onClick={() => p.onCardClick(ph)}
          >
            <div className="photo-thumb">
              <img src={ph.src} alt={ph.filename} loading="lazy" />
              <span className="thumb-scrim" />
              <span className="thumb-check">
                <IcCheck />
              </span>
              <button
                className={'thumb-fav' + (ph.favorite ? ' is-fav' : '')}
                data-od-id={'card-fav-' + ph.id}
                aria-label={ph.favorite ? 'Remove from favorites' : 'Add to favorites'}
                onClick={(e) => {
                  e.stopPropagation()
                  p.onFavorite(ph.id)
                }}
              >
                <IcHeart filled={ph.favorite} size={16} />
              </button>
            </div>
            <figcaption className="photo-meta">
              <div className="photo-name">{ph.filename}</div>
              <div className="photo-sub">
                <span>{ph.exif.taken.slice(0, 10)}</span>
                <span className="loc">{ph.exif.location}</span>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
