import type { ReactNode } from 'react'

function svgIcon(path: ReactNode, size = 20, filled = false) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {path}
    </svg>
  )
}

const heartPath = <path d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6.3a5 5 0 1 1 7.5 6.3Z" />

export const IcHeart = (p: { filled?: boolean; size?: number }) => svgIcon(heartPath, p.size ?? 20, p.filled)
export const IcSearch = (p: { size?: number }) =>
  svgIcon(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>,
    p.size ?? 20,
  )
export const IcFolder = () =>
  svgIcon(<path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4l2 2.5h8a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18Z" />)
export const IcX = (p: { size?: number }) => svgIcon(<path d="M6 6l12 12M18 6 6 18" />, p.size ?? 20)
export const IcLeft = () => svgIcon(<path d="m14 6-6 6 6 6" />)
export const IcRight = () => svgIcon(<path d="m10 6 6 6-6 6" />)
export const IcInfo = () =>
  svgIcon(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <circle cx="12" cy="8" r="0.6" fill="currentColor" />
    </>,
  )
export const IcZoom = () =>
  svgIcon(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5M8.5 11h5M11 8.5v5" />
    </>,
  )
export const IcTrash = (p: { size?: number }) =>
  svgIcon(
    <>
      <path d="M4 7h16M9.5 7V5h5v2M6.5 7l1 13h9l1-13" />
    </>,
    p.size ?? 20,
  )
export const IcDown = () =>
  svgIcon(
    <>
      <path d="M12 4v12m0 0 5-5m-5 5-5-5" />
      <path d="M4.5 20h15" />
    </>,
  )
export const IcCheck = () => svgIcon(<path d="m5 12.5 4.5 4.5L19 7.5" />, 13)
export const IcStack = () =>
  svgIcon(
    <>
      <rect x="3" y="7" width="15" height="13" rx="2" />
      <path d="M7.5 4.5h11A1.5 1.5 0 0 1 20 6v11" />
    </>,
  )
export const IcGear = () =>
  svgIcon(
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M18.8 5.2l-1.7 1.7M6.9 17.1l-1.7 1.7" />
    </>,
  )
export const IcAperture = () =>
  svgIcon(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m14.3 4.5-3.7 6.4M19 8.6h-7.4M16.6 15.9l-3.7-6.4M9.7 19.5l3.7-6.4M5 15.4h7.4M7.4 8.1l3.7 6.4" />
    </>,
  )
export const IcSparkle = () =>
  svgIcon(
    <>
      <path d="M11 4.5 12.6 9l4.5 1.6-4.5 1.6L11 16.5 9.4 12.2 4.9 10.6 9.4 9 11 4.5Z" />
      <path d="m17.5 14.5.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4Z" />
    </>,
  )
