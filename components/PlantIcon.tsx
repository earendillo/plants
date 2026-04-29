export type PlantType = 'monstera' | 'cactus' | 'succulent' | 'herb' | 'vine'

export const PLANT_TINTS: Record<PlantType, string> = {
  monstera:  '#CFEE9E',
  cactus:    '#E5D08A',
  succulent: '#F0B8C4',
  herb:      '#A4E89A',
  vine:      '#B0D8C0',
}

export function emojiToPlantType(emoji: string): PlantType {
  if (emoji === '🌵') return 'cactus'
  if (['🌺', '🌸', '🌻', '🌼', '💐', '🪷', '🌹', '🌷'].includes(emoji)) return 'succulent'
  if (['🪴', '🌴', '🥬'].includes(emoji)) return 'monstera'
  if (['🍀', '🌱', '🌾', '🌿', '🍃'].includes(emoji)) return 'herb'
  return 'vine'
}

type Props = {
  type: PlantType
  color: string
  size?: number
}

export function PlantIcon({ type, color, size = 56 }: Props) {
  const c = color

  if (type === 'monstera') return (
    <svg width={size} height={size} viewBox="0 0 56 64" fill="none">
      <path d="M28 7C15 7 8 19 10 31C12 42 20 53 28 55C36 53 44 42 46 31C48 19 41 7 28 7Z" fill={c} opacity="0.95"/>
      <path d="M28 7L28 55" stroke="rgba(0,0,0,0.11)" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M10 31C6 29 6 33 10 31Z" fill={c}/>
      <path d="M46 31C50 29 50 33 46 31Z" fill={c}/>
      <path d="M16 24C12 26 10 31 10 31" stroke="rgba(0,0,0,0.09)" strokeWidth="1" strokeLinecap="round" fill="none"/>
      <path d="M40 24C44 26 46 31 46 31" stroke="rgba(0,0,0,0.09)" strokeWidth="1" strokeLinecap="round" fill="none"/>
    </svg>
  )

  if (type === 'cactus') return (
    <svg width={size} height={size} viewBox="0 0 56 64" fill="none">
      <rect x="20" y="14" width="16" height="46" rx="8" fill={c}/>
      <rect x="8" y="17" width="12" height="22" rx="6" fill={c}/>
      <rect x="8" y="27" width="12" height="9" rx="4" fill={c}/>
      <rect x="36" y="22" width="12" height="24" rx="6" fill={c}/>
      <rect x="36" y="34" width="12" height="9" rx="4" fill={c}/>
      <line x1="28" y1="14" x2="28" y2="60" stroke="rgba(0,0,0,0.07)" strokeWidth="1" strokeDasharray="3 4"/>
    </svg>
  )

  if (type === 'succulent') {
    const petals = [0, 60, 120, 180, 240, 300].map((a, i) => {
      const r = (a * Math.PI) / 180
      const cx = 28 + Math.cos(r) * 14
      const cy = 28 + Math.sin(r) * 14
      return (
        <ellipse
          key={i}
          cx={cx} cy={cy} rx="9" ry="12"
          transform={`rotate(${a}, ${cx}, ${cy})`}
          fill={c}
          opacity={0.72 + i * 0.045}
        />
      )
    })
    return (
      <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
        {petals}
        <circle cx="28" cy="28" r="9" fill={c}/>
      </svg>
    )
  }

  if (type === 'herb') return (
    <svg width={size} height={size} viewBox="0 0 56 64" fill="none">
      <path d="M28 60L28 26" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M19 60L15 30" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M37 60L41 30" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="28" cy="18" rx="8" ry="11" fill={c}/>
      <ellipse cx="11" cy="23" rx="7" ry="9" transform="rotate(-22 11 23)" fill={c}/>
      <ellipse cx="45" cy="23" rx="7" ry="9" transform="rotate(22 45 23)" fill={c}/>
    </svg>
  )

  // vine (default)
  return (
    <svg width={size} height={size} viewBox="0 0 56 58" fill="none">
      <path d="M28 52C28 52 9 41 9 25C9 15 17 9 25 11C26.5 11.4 28 13 28 13C28 13 29.5 11.4 31 11C39 9 47 15 47 25C47 41 28 52 28 52Z" fill={c}/>
      <path d="M28 13L28 52" stroke="rgba(0,0,0,0.10)" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M28 36C20 38 14 46 14 52" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" fill="none"/>
      <ellipse cx="11" cy="54" rx="5" ry="6" fill={c} opacity="0.45"/>
    </svg>
  )
}
