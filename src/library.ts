import type { Album, Photo } from './types'

/* Session-scoped library loading via the File System Access API (Chromium).
   Photos are read in place — originals are never modified or uploaded.
   Persistence + rescan stay on the roadmap (Milestone 2 backend). */

const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'bmp'])
const MAX_DECODE_BYTES = 60 * 1024 * 1024

export type PickResult =
  | { status: 'ok'; name: string; photos: Photo[]; albums: Album[]; urls: string[] }
  | { status: 'empty'; name: string }
  | { status: 'cancelled' }
  | { status: 'unsupported' }
  | { status: 'error'; message: string }

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e))

const fmtBytes = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`)

const fmtTaken = (ms: number) => {
  const d = new Date(ms)
  const p = (v: number) => String(v).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

async function dims(file: File): Promise<{ width: number; height: number }> {
  if (file.size > MAX_DECODE_BYTES) return { width: 0, height: 0 }
  try {
    const bmp = await createImageBitmap(file)
    const out = { width: bmp.width, height: bmp.height }
    bmp.close()
    return out
  } catch {
    return { width: 0, height: 0 } // undecodable file — dimensions row stays hidden
  }
}

export async function pickLibraryFolder(): Promise<PickResult> {
  const picker = window.showDirectoryPicker
  if (!picker) return { status: 'unsupported' }

  let root: FileSystemDirectoryHandle
  try {
    root = await picker({ id: 'photo-viewer-library', mode: 'read' })
  } catch (e) {
    return e instanceof DOMException && e.name === 'AbortError'
      ? { status: 'cancelled' }
      : { status: 'error', message: errMsg(e) }
  }

  const photos: Photo[] = []
  const urls: string[] = []

  async function walk(dir: FileSystemDirectoryHandle, dirPath: string): Promise<void> {
    for await (const handle of dir.values()) {
      if (handle.kind === 'directory') {
        await walk(handle, dirPath ? `${dirPath}/${handle.name}` : handle.name)
        continue
      }
      const ext = handle.name.split('.').pop()?.toLowerCase() ?? ''
      if (!IMAGE_EXT.has(ext)) continue
      let file: File
      try {
        file = await handle.getFile()
      } catch {
        continue // unreadable file — skip it, keep scanning
      }
      const url = URL.createObjectURL(file)
      urls.push(url)
      const { width, height } = await dims(file)
      photos.push({
        id: `fs:${dirPath ? dirPath + '/' : ''}${handle.name}`,
        src: url,
        filename: handle.name,
        albumId: dirPath,
        favorite: false,
        exif: {
          camera: '—',
          lens: '—',
          focal: '—',
          aperture: '—',
          shutter: '—',
          iso: 0,
          taken: fmtTaken(file.lastModified),
          width,
          height,
          size: fmtBytes(file.size),
          location: dirPath || '—',
        },
      })
    }
  }

  try {
    await walk(root, '')
  } catch (e) {
    urls.forEach((u) => URL.revokeObjectURL(u))
    return { status: 'error', message: errMsg(e) }
  }

  if (photos.length === 0) return { status: 'empty', name: root.name }

  photos.sort((a, b) => a.id.localeCompare(b.id))
  const dirPaths = Array.from(new Set(photos.map((ph) => ph.albumId))).sort((a, b) => a.localeCompare(b))
  const albums: Album[] = dirPaths.map((id) => ({ id, name: id === '' ? root.name : id }))
  return { status: 'ok', name: root.name, photos, albums, urls }
}
