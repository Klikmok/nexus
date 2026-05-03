// Nexus geometric mark — inspired by the Bauhaus grid construction image
export function NexusLogo({ size = 44, color = 'var(--carbon)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="nexus-mark">
      {/* Top circle */}
      <circle cx="24" cy="10" r="8" fill={color} />
      {/* Left blob */}
      <circle cx="10" cy="30" r="8" fill={color} />
      {/* Right blob */}
      <circle cx="38" cy="30" r="8" fill={color} />
      {/* Bottom drop */}
      <circle cx="24" cy="43" r="5" fill={color} />
      {/* Vertical stem */}
      <rect x="20" y="10" width="8" height="33" fill={color} />
      {/* Horizontal bar */}
      <rect x="10" y="26" width="28" height="8" fill={color} />
    </svg>
  )
}

export function LoaderGeometric() {
  return (
    <div className="loader-geo-wrap">
      <div className="loader-ring" />
      <div className="loader-ring" />
      <div className="loader-ring" />
      <div className="loader-dot" />
    </div>
  )
}

// Unique glyph per idea index
const PATHS = [
  // Diamond
  (c: string) => <><path d="M12 3 L21 12 L12 21 L3 12Z" stroke={c} strokeWidth="1.5" fill="none"/></>,
  // Circle
  (c: string) => <><circle cx="12" cy="12" r="8" stroke={c} strokeWidth="1.5" fill="none"/></>,
  // Triangle up
  (c: string) => <><path d="M12 4 L21 19 L3 19Z" stroke={c} strokeWidth="1.5" fill="none"/></>,
  // Cross
  (c: string) => <><path d="M12 4V20M4 12H20" stroke={c} strokeWidth="2" strokeLinecap="square"/></>,
  // Half moon
  (c: string) => <><path d="M16 4a8 8 0 1 0 0 16 8 8 0 0 1 0-16Z" stroke={c} strokeWidth="1.5" fill="none"/></>,
  // Square rotated
  (c: string) => <><rect x="5" y="5" width="14" height="14" stroke={c} strokeWidth="1.5" fill="none" transform="rotate(15 12 12)"/></>,
]

export function IdeaGlyph({ index, size = 24 }: { index: number; size?: number }) {
  const path = PATHS[index % PATHS.length]
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      {path('var(--carbon)')}
    </svg>
  )
}

export function ArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
    </svg>
  )
}

export function ChevronLeft({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
    </svg>
  )
}
