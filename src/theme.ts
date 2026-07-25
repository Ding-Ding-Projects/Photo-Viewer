import { useEffect, useState } from 'react'
import type { Prefs } from './types'

/* M3 seed hues offered by the runtime appearance controls */
export const SEEDS = [
  { name: 'Violet', h: 290 },
  { name: 'Blue', h: 250 },
  { name: 'Teal', h: 195 },
  { name: 'Green', h: 140 },
  { name: 'Amber', h: 60 },
  { name: 'Rose', h: 350 },
] as const

export const FONTS: Record<string, { stack: string; labelKey: string }> = {
  system: { stack: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", labelKey: 'font.system' },
  roboto: { stack: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", labelKey: 'font.roboto' },
  serif: { stack: "Georgia, 'Times New Roman', serif", labelKey: 'font.serif' },
}

export const DEFAULT_PREFS: Prefs = {
  theme: 'light',
  seed: 290,
  density: 'cozy',
  font: 'system',
  fontScale: 1,
  lang: 'en',
  funny: 3,
}

/**
 * Builds a full M3 color scheme (all tonal roles) from a seed hue in OKLCH.
 * Approximates Material You HCT tonal steps with fixed lightness stops.
 */
export function buildScheme(seed: number, dark: boolean): Record<string, string> {
  const o = (l: number, c: number, hh?: number): string => {
    const hue = (((hh === undefined ? seed : hh) % 360) + 360) % 360
    return `oklch(${l}% ${+c.toFixed(3)} ${hue})`
  }
  const t = seed + 55 // tertiary hue rotation, per M3 guidance
  if (!dark) {
    return {
      '--primary': o(55, 0.16), '--on-primary': o(99, 0.004),
      '--primary-container': o(90, 0.05), '--on-primary-container': o(24, 0.09),
      '--secondary-container': o(91, 0.03), '--on-secondary-container': o(23, 0.05),
      '--tertiary': o(52, 0.13, t), '--tertiary-container': o(90, 0.06, t), '--on-tertiary-container': o(25, 0.07, t),
      '--surface': o(98, 0.004), '--surface-dim': o(89, 0.006),
      '--surface-lowest': o(100, 0), '--surface-low': o(96.5, 0.004), '--surface-c': o(94.5, 0.005),
      '--surface-high': o(92.5, 0.006), '--surface-highest': o(90.5, 0.007),
      '--on-surface': o(19, 0.01), '--on-surface-variant': o(44, 0.015),
      '--outline': o(66, 0.015), '--outline-variant': o(86, 0.01),
      '--inverse-surface': o(24, 0.008), '--inverse-on-surface': o(95, 0.005), '--inverse-primary': o(80, 0.12),
      '--error': o(52, 0.17, 27), '--error-container': o(93, 0.04, 27), '--on-error-container': o(28, 0.1, 27),
    }
  }
  return {
    '--primary': o(80, 0.12), '--on-primary': o(28, 0.08),
    '--primary-container': o(35, 0.09), '--on-primary-container': o(90, 0.05),
    '--secondary-container': o(32, 0.04), '--on-secondary-container': o(88, 0.03),
    '--tertiary': o(78, 0.1, t), '--tertiary-container': o(35, 0.07, t), '--on-tertiary-container': o(90, 0.05, t),
    '--surface': o(15, 0.005), '--surface-dim': o(11, 0.004),
    '--surface-lowest': o(9, 0.004), '--surface-low': o(18, 0.005), '--surface-c': o(21, 0.006),
    '--surface-high': o(24, 0.007), '--surface-highest': o(27, 0.008),
    '--on-surface': o(93, 0.005), '--on-surface-variant': o(78, 0.012),
    '--outline': o(58, 0.012), '--outline-variant': o(35, 0.01),
    '--inverse-surface': o(93, 0.005), '--inverse-on-surface': o(22, 0.008), '--inverse-primary': o(55, 0.16),
    '--error': o(75, 0.15, 27), '--error-container': o(32, 0.08, 27), '--on-error-container': o(90, 0.04, 27),
  }
}

const PREFS_KEY = 'pv:prefs'

export function usePrefs(): [Prefs, <K extends keyof Prefs>(k: K, v: Prefs[K]) => void] {
  const [prefs, setPrefs] = useState<Prefs>(() => {
    try {
      return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }
    } catch {
      return DEFAULT_PREFS
    }
  })

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  }, [prefs])

  /* Push the active scheme + typography + density onto :root */
  useEffect(() => {
    const root = document.documentElement
    const scheme = buildScheme(prefs.seed, prefs.theme === 'dark')
    for (const k of Object.keys(scheme)) root.style.setProperty(k, scheme[k])
    root.dataset.theme = prefs.theme
    root.dataset.density = prefs.density === 'compact' ? 'compact' : 'cozy'
    root.style.setProperty('--font-scale', String(prefs.fontScale))
    root.style.setProperty('--font-app', (FONTS[prefs.font] ?? FONTS.system).stack)
  }, [prefs])

  const setP = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setPrefs((pr) => ({ ...pr, [k]: v }))
  return [prefs, setP]
}
