import { AI_MODEL_ID, aiPut } from './aiStore'
import type { AiData, Photo } from './types'

/* Main-thread side of the AI indexing queue: feeds photos to aiWorker one at a
   time (keeps the UI responsive and memory flat), persists each result to the
   IndexedDB cache, and reports progress. Cancellation terminates the worker. */

export interface IndexCallbacks {
  onModelState: (loading: boolean) => void
  onProgress: (done: number, total: number) => void
  onResult: (photoId: string, data: AiData) => void
  onDone: (indexed: number, failed: number) => void
}

export interface Indexer {
  start: (photos: Photo[]) => void
  cancel: () => void
  running: () => boolean
}

interface WorkerMsg {
  type: string
  id?: string
  labels?: { text: string; score: number }[]
  colors?: [number, number, number][]
  message?: string
}

export function createIndexer(cb: IndexCallbacks): Indexer {
  let worker: Worker | null = null
  let cancelled = false
  let active = false

  const cancel = () => {
    cancelled = true
    active = false
    worker?.terminate()
    worker = null
  }

  const start = (photos: Photo[]) => {
    if (active || photos.length === 0) return
    active = true
    cancelled = false
    worker = new Worker(new URL('./aiWorker.ts', import.meta.url), { type: 'module' })

    const total = photos.length
    let i = 0
    let done = 0
    let failed = 0

    const finish = () => {
      active = false
      worker?.terminate()
      worker = null
      cb.onDone(total - failed, failed)
    }

    const sendNext = () => {
      if (cancelled || !worker) return
      if (i < total) {
        const ph = photos[i]
        i += 1
        worker.postMessage({ id: ph.id, url: ph.src })
      } else if (done >= total) {
        finish()
      }
    }

    worker.onmessage = (e: MessageEvent<WorkerMsg>) => {
      const m = e.data
      if (cancelled) return
      if (m.type === 'model-loading') cb.onModelState(true)
      else if (m.type === 'model-ready') cb.onModelState(false)
      else if (m.type === 'result' && m.id) {
        done += 1
        const data: AiData = { v: 1, model: AI_MODEL_ID, labels: m.labels ?? [], colors: m.colors ?? [] }
        void aiPut(m.id, data)
        cb.onResult(m.id, data)
        cb.onProgress(done, total)
        sendNext()
      } else if (m.type === 'error') {
        done += 1
        failed += 1
        cb.onProgress(done, total)
        sendNext()
      }
    }
    worker.onerror = () => {
      if (!cancelled) {
        active = false
        worker?.terminate()
        worker = null
        cb.onDone(0, total)
      }
    }

    sendNext()
  }

  return { start, cancel, running: () => active }
}
