import type { AiData } from './types'

/* Persistent AI index (Milestone 3 prototype) — IndexedDB-backed so indexing runs
   once per photo and survives sessions. Rows carry schema + model versions;
   stale rows are ignored on read, never migrated blindly. */

export const AI_MODEL_ID = 'vit-base-patch16-224 · imagenet-1k'

const DB_NAME = 'pv-ai-index'
const DB_VERSION = 1
const STORE = 'tags'

interface StoredRow extends AiData {
  photoId: string
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: 'photoId' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
  })
}

/** All cached tag rows matching the current schema + model version. */
export async function aiLoadAll(): Promise<Map<string, AiData>> {
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll()
      req.onsuccess = () => {
        const out = new Map<string, AiData>()
        for (const row of req.result as StoredRow[]) {
          if (row && row.v === 1 && row.model === AI_MODEL_ID)
            out.set(row.photoId, { v: 1, model: row.model, labels: row.labels, colors: row.colors })
        }
        resolve(out)
      }
      req.onerror = () => reject(req.error ?? new Error('IndexedDB read failed'))
    })
  } catch {
    return new Map() // private mode / quota — the cache is an optimization, never a blocker
  }
}

export async function aiPut(photoId: string, data: AiData): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put({ photoId, ...data })
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('IndexedDB write failed'))
    })
  } catch {
    /* a missed cache write just means the photo re-indexes next time */
  }
}
