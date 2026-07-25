export interface ExifData {
  camera: string
  lens: string
  focal: string
  aperture: string
  shutter: string
  iso: number
  taken: string
  width: number
  height: number
  size: string
  location: string
}

export interface AiLabel {
  text: string
  score: number
}

export interface AiData {
  v: 1
  model: string
  labels: AiLabel[]
  colors: [number, number, number][]
}

export interface Photo {
  id: string
  src: string
  filename: string
  albumId: string
  favorite: boolean
  exif: ExifData
  ai?: AiData
}

export interface Album {
  id: string
  name: string
}

export type SortKey = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'

export type View = { kind: 'all' } | { kind: 'favorites' } | { kind: 'album'; albumId: string }

export interface Toast {
  id: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

export type Lang = 'en' | 'zh' | 'bi'

export interface Prefs {
  theme: 'light' | 'dark'
  seed: number
  density: 'cozy' | 'compact'
  font: string
  fontScale: number
  lang: Lang
  funny: number
}

export interface HistoryEntry {
  id: string;
  message: string;
  time: string;
  actionLabel?: string;
  onAction?: () => void;
}
