import { RawImage, env, pipeline } from '@huggingface/transformers'

/* AI indexing worker (Milestone 3 prototype): image-classification (ViT / ImageNet-1k)
   + dominant-color histogram, fully on-device. The model downloads once from the
   Hugging Face CDN and is cached by the browser; originals never leave the machine. */

const MODEL = 'Xenova/vit-base-patch16-224'
const MAX_SIDE = 512

type OutMsg =
  | { type: 'model-loading' }
  | { type: 'model-progress'; pct: number }
  | { type: 'model-ready' }
  | { type: 'result'; id: string; labels: { text: string; score: number }[]; colors: [number, number, number][] }
  | { type: 'error'; id: string; message: string }

const post = (m: OutMsg) => (self as unknown as { postMessage: (msg: OutMsg) => void }).postMessage(m)

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e))

env.allowLocalModels = false

type Classifier = (img: RawImage, opts: { topk: number }) => Promise<unknown>

let classifierPromise: Promise<Classifier> | null = null

function getClassifier(): Promise<Classifier> {
  if (!classifierPromise) {
    post({ type: 'model-loading' })
    let lastPct = -1
    classifierPromise = (
      pipeline('image-classification', MODEL, {
        dtype: 'q8',
        progress_callback: (p: { status?: string; progress?: number }) => {
          if (p.status === 'progress' && typeof p.progress === 'number') {
            const pct = Math.floor(p.progress / 10) * 10
            if (pct !== lastPct) {
              lastPct = pct
              post({ type: 'model-progress', pct })
            }
          }
        },
      } as Record<string, unknown>) as Promise<unknown>
    ).then((c) => {
      post({ type: 'model-ready' })
      return c as Classifier
    })
    classifierPromise.catch(() => {
      classifierPromise = null // allow retry on next photo
    })
  }
  return classifierPromise
}

const cleanLabel = (label: string) => label.split(',')[0].replace(/_/g, ' ').trim().toLowerCase()

/** 3-bit-per-channel histogram over a strided sample — top n bucket centers. */
function dominantColors(data: Uint8ClampedArray, n = 5): [number, number, number][] {
  const buckets = new Map<number, number>()
  for (let i = 0; i + 2 < data.length; i += 16) {
    const key = ((data[i] >> 5) << 6) | ((data[i + 1] >> 5) << 3) | (data[i + 2] >> 5)
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }
  return Array.from(buckets.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => [((k >> 6) << 5) + 16, (((k >> 3) & 7) << 5) + 16, ((k & 7) << 5) + 16])
}

self.onmessage = async (e: MessageEvent<{ id: string; url: string }>) => {
  const { id, url } = e.data
  try {
    const classify = await getClassifier()
    const blob = await (await fetch(url)).blob()
    const bmp = await createImageBitmap(blob)
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height))
    const w = Math.max(1, Math.round(bmp.width * scale))
    const h = Math.max(1, Math.round(bmp.height * scale))
    const canvas = new OffscreenCanvas(w, h)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D unavailable in worker')
    ctx.drawImage(bmp, 0, 0, w, h)
    bmp.close()
    const imgData = ctx.getImageData(0, 0, w, h)
    const raw = new RawImage(imgData.data, w, h, 4)
    const out = (await classify(raw, { topk: 5 })) as { label: string; score: number }[]
    const labels = out.map((o) => ({ text: cleanLabel(o.label), score: o.score }))
    post({ type: 'result', id, labels, colors: dominantColors(imgData.data) })
  } catch (err) {
    post({ type: 'error', id, message: errMsg(err) })
  }
}
