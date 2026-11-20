/** Inline stroke icons from the design. All are decorative (aria-hidden). */

export function DoubleChevron({ color = '#FFFFFF', width = 26, height = 18 }: { color?: string; width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 26 18" aria-hidden="true">
      <path d="M2 2 L9 9 L2 16 M13 2 L20 9 L13 16" stroke={color} strokeWidth="3.5" fill="none" strokeLinejoin="round" />
    </svg>
  )
}

/** The chunky outlined » / « used for pager and screen navigation. */
export function BigChevrons({ direction = 'right' }: { direction?: 'left' | 'right' }) {
  const d = direction === 'right' ? 'M5 3 L17 13 L5 23 M20 3 L32 13 L20 23' : 'M18 3 L6 13 L18 23 M33 3 L21 13 L33 23'
  return (
    <svg width="38" height="26" viewBox="0 0 38 26" aria-hidden="true">
      <path d={d} stroke="#2B2A27" strokeWidth="9" fill="none" strokeLinejoin="round" />
      <path d={d} stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinejoin="round" />
    </svg>
  )
}

export function HamburgerIcon() {
  return (
    <svg width="28" height="22" viewBox="0 0 28 22" aria-hidden="true">
      <rect x="0" y="0" width="28" height="5" rx="1" fill="#2B2A27" />
      <rect x="0" y="8.5" width="28" height="5" rx="1" fill="#2B2A27" />
      <rect x="0" y="17" width="28" height="5" rx="1" fill="#2B2A27" />
    </svg>
  )
}

export function CloseIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3 L21 21 M21 3 L3 21" stroke="#2B2A27" strokeWidth="5" strokeLinecap="square" />
    </svg>
  )
}

export function SmallCloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M3 3 L15 15 M15 3 L3 15" stroke="#2B2A27" strokeWidth="3.5" strokeLinecap="square" />
    </svg>
  )
}

export function PauseIcon() {
  return (
    <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden="true">
      <rect x="2" y="2" width="6" height="20" fill="#2B2A27" />
      <rect x="14" y="2" width="6" height="20" fill="#2B2A27" />
    </svg>
  )
}

export function WarningIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
      <polygon points="22,4 41,38 3,38" fill="#2B2A27" />
      <rect x="20" y="15" width="4" height="12" fill="#FFD23F" />
      <rect x="20" y="30" width="4" height="4" fill="#FFD23F" />
    </svg>
  )
}

export function PixelCloud({ width, height, className }: { width: number; height: number; className?: string }) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 30 12" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M8 4h4v-2h6v2h4v2h4v4h4v2H0v-2h2v-2h2v-2h4z" fill="#FFFFFF" />
    </svg>
  )
}
