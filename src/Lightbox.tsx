import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { ExifRow } from './controls'
import { IcDown, IcHeart, IcInfo, IcLeft, IcRight, IcX, IcZoom } from './icons'
import type { Photo } from './types'

interface PanState {
  x: number
  y: number
  sl: number
  st: number
  moved: boolean
}

export default function Lightbox(p: {
  list: Photo[]
  photo: Photo
  index: number
  onClose: () => void
  onStep: (dir: number) => void
  onJump: (id: string) => void
  onFavorite: (id: string) => void
  onDownload: (ph: Photo) => void
  albumName: (id: string) => string
  tx: (k: string) => string
}) {
  const [zoomed, setZoomed] = useState(false)
  const [infoOpen, setInfoOpen] = useState(true)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const panRef = useRef<PanState | null>(null)
  const suppressClick = useRef(false)

  const { photo } = p

  useEffect(() => setZoomed(false), [photo.id])

  useEffect(() => {
    if (zoomed && stageRef.current) {
      const el = stageRef.current
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
      el.scrollTop = (el.scrollHeight - el.clientHeight) / 2
    }
  }, [zoomed])

  /* keyboard navigation per ROADMAP M2: arrows, F favorite, I info, Esc close */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') p.onClose()
      else if (e.key === 'ArrowLeft') p.onStep(-1)
      else if (e.key === 'ArrowRight') p.onStep(1)
      else if (e.key === 'f' || e.key === 'F') p.onFavorite(photo.id)
      else if (e.key === 'i' || e.key === 'I') setInfoOpen((o) => !o)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [p, photo.id])

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!zoomed || !stageRef.current) return
    const el = stageRef.current
    panRef.current = { x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop, moved: false }
    el.setPointerCapture(e.pointerId)
    el.classList.add('panning')
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const pan = panRef.current
    if (!pan || !stageRef.current) return
    const dx = e.clientX - pan.x
    const dy = e.clientY - pan.y
    if (Math.abs(dx) + Math.abs(dy) > 4) pan.moved = true
    stageRef.current.scrollLeft = pan.sl - dx
    stageRef.current.scrollTop = pan.st - dy
  }
  const onPointerUp = () => {
    if (panRef.current?.moved) suppressClick.current = true
    panRef.current = null
    stageRef.current?.classList.remove('panning')
  }
  const onStageClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    setZoomed((z) => !z)
  }

  return (
    <div className="lb" data-od-id="lightbox" role="dialog" aria-modal="true" aria-label={photo.filename}>
      <div className="lb-top">
        <span className="lb-filename">{photo.filename}</span>
        <span className="lb-counter">
          {p.index + 1} / {p.list.length}
        </span>
        <div className="lb-top-actions">
          <button
            className={'lb-btn' + (photo.favorite ? ' is-fav' : '')}
            data-od-id="lightbox-favorite"
            title={p.tx('hint.fav') + ' (F)'}
            onClick={() => p.onFavorite(photo.id)}
          >
            <IcHeart filled={photo.favorite} size={19} />
          </button>
          <button
            className={'lb-btn' + (zoomed ? ' toggled' : '')}
            data-od-id="lightbox-zoom"
            title="Zoom"
            onClick={() => setZoomed((z) => !z)}
          >
            <IcZoom />
          </button>
          <button
            className={'lb-btn' + (infoOpen ? ' toggled' : '')}
            data-od-id="lightbox-info-toggle"
            title={p.tx('hint.info') + ' (I)'}
            onClick={() => setInfoOpen((o) => !o)}
          >
            <IcInfo />
          </button>
          <button className="lb-btn" data-od-id="lightbox-close" title={p.tx('hint.close') + ' (Esc)'} onClick={p.onClose}>
            <IcX />
          </button>
        </div>
      </div>

      <div className="lb-body">
        <div
          ref={stageRef}
          className={'lb-stage' + (zoomed ? ' zoomed' : '')}
          data-od-id="lightbox-stage"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClick={onStageClick}
        >
          <img src={photo.src} alt={photo.filename} draggable={false} />
          <button
            className="lb-nav lb-prev"
            data-od-id="lightbox-prev"
            title="Previous"
            onClick={(e) => {
              e.stopPropagation()
              p.onStep(-1)
            }}
          >
            <IcLeft />
          </button>
          <button
            className="lb-nav lb-next"
            data-od-id="lightbox-next"
            title="Next"
            onClick={(e) => {
              e.stopPropagation()
              p.onStep(1)
            }}
          >
            <IcRight />
          </button>
        </div>

        {infoOpen && (
          <aside className="lb-info" data-od-id="metadata-panel" onClick={(e) => e.stopPropagation()}>
            <div className="lb-info-title">{p.tx('info.meta')}</div>
            <div className="exif-group">
              <ExifRow k={p.tx('info.captured')} v={photo.exif.taken} />
              <ExifRow k={p.tx('info.album')} v={p.albumName(photo.albumId)} />
              <ExifRow k={p.tx('info.location')} v={photo.exif.location} />
            </div>
            <div className="lb-info-title">{p.tx('info.camera')}</div>
            <div className="exif-group">
              <ExifRow k={p.tx('info.body')} v={photo.exif.camera} />
              <ExifRow k={p.tx('info.lens')} v={photo.exif.lens} />
              <ExifRow k={p.tx('info.focal')} v={photo.exif.focal} />
              <ExifRow k={p.tx('info.aperture')} v={photo.exif.aperture} />
              <ExifRow k={p.tx('info.shutter')} v={photo.exif.shutter} />
              <ExifRow k="ISO" v={String(photo.exif.iso)} />
            </div>
            <div className="lb-info-title">{p.tx('info.file')}</div>
            <div className="exif-group">
              <ExifRow k={p.tx('info.dims')} v={photo.exif.width + ' × ' + photo.exif.height} />
              <ExifRow k={p.tx('info.size')} v={photo.exif.size} />
              <ExifRow k={p.tx('info.format')} v="JPEG · original" />
            </div>
            <a
              className="lb-download"
              data-od-id="download-original"
              href={photo.src}
              download={photo.filename}
              onClick={() => p.onDownload(photo)}
            >
              <IcDown /> {p.tx('info.dl')}
            </a>
          </aside>
        )}
      </div>

      <div className="lb-strip" data-od-id="filmstrip">
        {p.list.map((ph) => (
          <button
            key={ph.id}
            className={'strip-thumb' + (ph.id === photo.id ? ' active' : '')}
            data-od-id={'strip-' + ph.id}
            onClick={() => p.onJump(ph.id)}
          >
            <img src={ph.src} alt={ph.filename} loading="lazy" />
          </button>
        ))}
        <div className="lb-hints">
          <span>
            <kbd>←</kbd> <kbd>→</kbd> {p.tx('hint.nav')}
          </span>
          <span>
            <kbd>F</kbd> {p.tx('hint.fav')}
          </span>
          <span>
            <kbd>I</kbd> {p.tx('hint.info')}
          </span>
          <span>
            <kbd>Esc</kbd> {p.tx('hint.close')}
          </span>
        </div>
      </div>
    </div>
  )
}
