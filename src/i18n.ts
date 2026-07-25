import { createContext, useCallback, useContext } from 'react'
import type { Lang, Prefs } from './types'

/* e = English · z = 粵語 (serious) · f = 粵語 playful (funny level >= 4) */
export interface Str {
  e: string
  z: string
  f?: string
}

export const STR: Record<string, Str> = {
  'nav.library': { e: 'Library', z: '媒體庫', f: '相庫' },
  'nav.all': { e: 'All Photos', z: '全部相片', f: '全部相，晒冷' },
  'nav.fav': { e: 'Favorites', z: '收藏', f: '至愛嘅相' },
  'nav.albums': { e: 'Albums', z: '相簿', f: '相簿堆' },
  'search.ph': { e: 'Search filename, place, camera…', z: '搜尋檔名、地點、相機…', f: '搵相：檔名、地方、相機都得…' },
  'sort.dateDesc': { e: 'Date taken · newest', z: '拍攝日期 · 新至舊' },
  'sort.dateAsc': { e: 'Date taken · oldest', z: '拍攝日期 · 舊至新' },
  'sort.nameAsc': { e: 'Filename · A to Z', z: '檔名 · A 至 Z' },
  'sort.nameDesc': { e: 'Filename · Z to A', z: '檔名 · Z 至 A' },
  size: { e: 'Size', z: '縮圖大小', f: '相仔大細' },
  select: { e: 'Select', z: '選取', f: '揀相' },
  done: { e: 'Done', z: '完成', f: '搞掂' },
  'sel.hint': { e: 'Click photos to select them', z: '撳相片嚟選取', f: '想揀邊張就撳邊張' },
  'sel.count': { e: '{n} selected', z: '已選 {n} 張' },
  favorite: { e: 'Favorite', z: '收藏', f: '畀個心' },
  delete: { e: 'Delete', z: '刪除', f: '掉咗佢' },
  cancel: { e: 'Cancel', z: '取消', f: '算數' },
  undo: { e: 'Undo', z: '復原', f: '唔計數' },
  'empty.match.t': { e: 'No matches for “{q}”', z: '搵唔到「{q}」', f: '「{q}」？冇喎' },
  'empty.match.b': {
    e: 'Try a filename, a place, or a camera model — search reads EXIF metadata too.',
    z: '試下檔名、地點或者相機型號 — 搜尋會讀取 EXIF 資料。',
    f: '試下其他字啦 — 檔名、地方、相機型號，EXIF 都搵到。',
  },
  'empty.fav.t': { e: 'No favorites yet', z: '未有收藏', f: '仲未有心水' },
  'empty.fav.b': {
    e: 'Hover any photo and tap the heart, or press F while viewing it.',
    z: '將滑鼠移到相片上撳心形，或者睇相時撳 F。',
    f: '見到心水相就撳個心，或者睇相時撳 F 都得。',
  },
  'empty.album.t': { e: 'This album is empty', z: '呢本相簿係空嘅' },
  settings: { e: 'Settings', z: '設定', f: '校準吓' },
  appearance: { e: 'Appearance', z: '外觀' },
  theme: { e: 'Theme', z: '主題' },
  light: { e: 'Light', z: '淺色' },
  dark: { e: 'Dark', z: '深色' },
  seed: { e: 'Seed color', z: '種子色', f: '主色種' },
  density: { e: 'Density', z: '密度' },
  cozy: { e: 'Comfortable', z: '舒適' },
  compact: { e: 'Compact', z: '緊湊' },
  font: { e: 'Font', z: '字體' },
  fontScale: { e: 'Font size', z: '字體大小' },
  'font.system': { e: 'System default', z: '系統預設' },
  'font.roboto': { e: 'Roboto', z: 'Roboto' },
  'font.serif': { e: 'Serif (Georgia)', z: '襯線 (Georgia)' },
  language: { e: 'Language', z: '語言' },
  funny: { e: 'Playfulness', z: '風趣程度' },
  'funny.note': {
    e: '1 = fully serious · 5 = maximum playfulness. Errors stay clear at every level.',
    z: '1 = 完全正經 · 5 = 最玩得。錯誤訊息喺任何級別都保持清晰。',
  },
  folder: { e: 'Library folder', z: '相片資料夾' },
  'folder.note': { e: 'Not connected — folder picking ships in Milestone 2.', z: '未連接 — 揀資料夾功能會喺 Milestone 2 推出。' },
  'folder.choose': { e: 'Choose folder…', z: '揀資料夾…' },
  'toast.folder': {
    e: 'Folder picking arrives in Milestone 2 — this prototype runs on a sample library.',
    z: '揀資料夾功能 Milestone 2 先有 — 而家係範例相片庫。',
  },
  'toast.favAdd': { e: 'Added {f} to Favorites', z: '已收藏 {f}', f: '入咗 {f} 做至愛' },
  'toast.favDel': { e: 'Removed {f} from Favorites', z: '已取消收藏 {f}' },
  'toast.favN': { e: 'Added {n} photos to Favorites', z: '已收藏 {n} 張相', f: '畀晒心，{n} 張' },
  'toast.trash1': { e: 'Moved 1 photo to Trash', z: '已將 1 張相放入回收筒' },
  'toast.trashN': { e: 'Moved {n} photos to Trash', z: '已將 {n} 張相放入回收筒' },
  'toast.dl': { e: 'Downloading original {f}', z: '正在下載原檔 {f}' },
  'rx.tip': { e: 'Regex search', z: '正規表示式搜尋' },
  'rx.title': { e: 'Regex builder', z: 'Regex 建立器' },
  'rx.pattern': { e: 'Pattern', z: '模式' },
  'rx.flags': { e: 'Flags', z: '旗標' },
  'rx.matches': { e: '{n} live matches', z: '{n} 項即時符合' },
  'rx.invalid': { e: 'Invalid pattern: {m}', z: '模式無效：{m}' }, // errors stay clear at every funny level
  'rx.apply': { e: 'Apply', z: '套用' },
  'rx.clear': { e: 'Clear', z: '清除' },
  'info.meta': { e: 'Metadata', z: '詮釋資料' },
  'info.captured': { e: 'Captured', z: '拍攝時間' },
  'info.album': { e: 'Album', z: '相簿' },
  'info.location': { e: 'Location', z: '地點' },
  'info.camera': { e: 'Camera', z: '相機' },
  'info.body': { e: 'Body', z: '機身' },
  'info.lens': { e: 'Lens', z: '鏡頭' },
  'info.focal': { e: 'Focal length', z: '焦距' },
  'info.aperture': { e: 'Aperture', z: '光圈' },
  'info.shutter': { e: 'Shutter', z: '快門' },
  'info.file': { e: 'File', z: '檔案' },
  'info.dims': { e: 'Dimensions', z: '像素尺寸' },
  'info.size': { e: 'Size', z: '檔案大小' },
  'info.format': { e: 'Format', z: '格式' },
  'info.dl': { e: 'Download original', z: '下載原檔' },
  'hint.nav': { e: 'navigate', z: '切換' },
  'hint.fav': { e: 'favorite', z: '收藏' },
  'hint.info': { e: 'info', z: '資料' },
  'hint.close': { e: 'close', z: '關閉' },
  'foot.counts': { e: '{n} photos · {c} cameras', z: '{n} 張相片 · {c} 部相機' },
  'foot.note': { e: 'Indexed locally · originals intact', z: '本機索引 · 原檔完整無改' },
  items: { e: '{n} items', z: '{n} 項' },
  item1: { e: '1 item', z: '1 項' },
}

export function fmt(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w)\}/g, (m, k: string) => (vars[k] !== undefined ? vars[k] : m))
}

export interface BiResult {
  a: string
  b?: string
}
export type BiFn = (k: string) => BiResult

export const I18nContext = createContext<BiFn>((k) => ({ a: k }))

export function useBi(): BiFn {
  return useContext(I18nContext)
}

/** Single-string resolver for toasts/placeholders: zh picks playful at funny>=4; bi joins with a middot. */
export function useTx(): (k: string) => string {
  const bi = useBi()
  return useCallback((k: string) => {
    const r = bi(k)
    return r.b ? `${r.a} · ${r.b}` : r.a
  }, [bi])
}

/** Builds the bilingual resolver from prefs. Playful Cantonese kicks in at funny level 4+. */
export function makeBi(lang: Lang, funny: number): BiFn {
  return (k: string) => {
    const s = STR[k]
    if (!s) return { a: k }
    const zh = funny >= 4 && s.f ? s.f : s.z
    if (lang === 'en') return { a: s.e }
    if (lang === 'zh') return { a: zh }
    return { a: s.e, b: zh }
  }
}

export type PrefsForI18n = Pick<Prefs, 'lang' | 'funny'>
