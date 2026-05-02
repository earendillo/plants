export type PlantType =
  | 'monstera' | 'cactus' | 'succulent' | 'herb' | 'vine'
  | 'palm' | 'banana' | 'vegetable' | 'olive' | 'fern'
  | 'strelitzia' | 'orchid' | 'aloe' | 'bamboo' | 'lavender'
  | 'spider' | 'flower' | 'other'

export const PLANT_TINTS: Record<PlantType, string> = {
  // originals
  monstera:   '#CFEE9E',
  cactus:     '#E5D08A',
  succulent:  '#F0B8C4',
  herb:       '#A4E89A',
  vine:       '#B0D8C0',
  // new
  palm:       '#A8D89A',
  banana:     '#B4E890',
  vegetable:  '#A0D4A8',
  olive:      '#BCC898',
  fern:       '#80C894',
  strelitzia: '#E8C86A',
  orchid:     '#D0B0E8',
  aloe:       '#8CD4C0',
  bamboo:     '#CFEE9E',
  lavender:   '#C4B0E4',
  spider:     '#C0E89A',
  flower:     '#F0C0C8',
  other:      '#B8D4B8',
}

export const PLANT_TYPE_LABELS: Record<PlantType, string> = {
  monstera: 'Monstera',
  cactus: 'Cactus',
  succulent: 'Succulent',
  herb: 'Herb',
  vine: 'Vine',
  palm: 'Palm',
  banana: 'Banana',
  vegetable: 'Vegetable',
  olive: 'Olive',
  fern: 'Fern',
  strelitzia: 'Strelitzia',
  orchid: 'Orchid',
  aloe: 'Aloe',
  bamboo: 'Bamboo',
  lavender: 'Lavender',
  spider: 'Spider plant',
  flower: 'Flower',
  other: 'Other',
}

type Props = { type: PlantType; color: string; size?: number }

export function PlantIcon({ type, color: c, size = 56 }: Props) {
  const di = 'rgba(0,0,0,0.10)'
  const dh = 'rgba(0,0,0,0.07)'

  if (type === 'monstera') return (
    <svg width={size} height={size} viewBox="0 0 56 64" fill="none">
      <path d="M28 7C15 7 8 19 10 31C12 42 20 53 28 55C36 53 44 42 46 31C48 19 41 7 28 7Z" fill={c} opacity="0.95"/>
      <path d="M28 7L28 55" stroke={di} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M10 31C6 29 6 33 10 31Z" fill={c}/>
      <path d="M46 31C50 29 50 33 46 31Z" fill={c}/>
      <path d="M16 24C12 26 10 31 10 31" stroke={dh} strokeWidth="1" strokeLinecap="round" fill="none"/>
      <path d="M40 24C44 26 46 31 46 31" stroke={dh} strokeWidth="1" strokeLinecap="round" fill="none"/>
    </svg>
  )

  if (type === 'cactus') return (
    <svg width={size} height={size} viewBox="0 0 56 64" fill="none">
      <rect x="20" y="14" width="16" height="46" rx="8" fill={c}/>
      <rect x="8"  y="17" width="12" height="22" rx="6" fill={c}/>
      <rect x="8"  y="27" width="12" height="9"  rx="4" fill={c}/>
      <rect x="36" y="22" width="12" height="24" rx="6" fill={c}/>
      <rect x="36" y="34" width="12" height="9"  rx="4" fill={c}/>
      <line x1="28" y1="14" x2="28" y2="60" stroke={dh} strokeWidth="1" strokeDasharray="3 4"/>
    </svg>
  )

  if (type === 'succulent') {
    const petals = [0, 60, 120, 180, 240, 300].map((a, i) => {
      const r = (a * Math.PI) / 180
      const px = Math.round((28 + Math.cos(r) * 14) * 100) / 100
      const py = Math.round((28 + Math.sin(r) * 14) * 100) / 100
      const op = Math.round((0.72 + i * 0.045) * 1000) / 1000
      return (
        <ellipse key={i} cx={px} cy={py} rx="9" ry="12"
          transform={`rotate(${a}, ${px}, ${py})`} fill={c} opacity={op}/>
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
      <ellipse cx="11" cy="23" rx="7" ry="9"  transform="rotate(-22 11 23)" fill={c}/>
      <ellipse cx="45" cy="23" rx="7" ry="9"  transform="rotate(22 45 23)"  fill={c}/>
    </svg>
  )

  if (type === 'vine') return (
    <svg width={size} height={size} viewBox="0 0 56 58" fill="none">
      <path d="M28 52C28 52 9 41 9 25C9 15 17 9 25 11C26.5 11.4 28 13 28 13C28 13 29.5 11.4 31 11C39 9 47 15 47 25C47 41 28 52 28 52Z" fill={c}/>
      <path d="M28 13L28 52" stroke={di} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M28 36C20 38 14 46 14 52" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" fill="none"/>
      <ellipse cx="11" cy="54" rx="5" ry="6" fill={c} opacity="0.45"/>
    </svg>
  )

  if (type === 'palm') return (
    <svg width={size} height={size} viewBox="0 0 56 64" fill="none">
      <path d="M28 62 L28 44" stroke={c} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M28 44 C25 34 25 18 28 7  C31 18 31 34 28 44Z" fill={c}/>
      <path d="M28 44 C22 37 14 24 12 11 C18 18 24 32 28 44Z" fill={c} opacity="0.88"/>
      <path d="M28 44 C20 39  8 34  4 22 C12 28 22 38 28 44Z" fill={c} opacity="0.72"/>
      <path d="M28 44 C34 37 42 24 44 11 C38 18 32 32 28 44Z" fill={c} opacity="0.88"/>
      <path d="M28 44 C36 39 48 34 52 22 C44 28 34 38 28 44Z" fill={c} opacity="0.72"/>
    </svg>
  )

  if (type === 'banana') return (
    <svg width={size} height={size} viewBox="0 0 56 64" fill="none">
      <path d="M28 5 C42 9 51 22 51 36 C51 50 40 59 28 61 C16 59 5 50 5 36 C5 22 14 9 28 5Z" fill={c}/>
      <path d="M28 5 L28 61"   stroke={di} strokeWidth="2"   strokeLinecap="round"/>
      <path d="M28 5 L21 20"   stroke="rgba(0,0,0,0.09)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M28 23 C36 25 44 29 50 35" stroke={di} strokeWidth="1" strokeLinecap="round" fill="none"/>
      <path d="M28 23 C20 25 12 29  6 35" stroke={di} strokeWidth="1" strokeLinecap="round" fill="none"/>
      <path d="M28 42 C36 44 43 48 49 54" stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeLinecap="round" fill="none"/>
      <path d="M28 42 C20 44 13 48  7 54" stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeLinecap="round" fill="none"/>
    </svg>
  )

  if (type === 'vegetable') return (
    <svg width={size} height={size} viewBox="0 0 56 64" fill="none">
      <path d="M28 62 L28 44" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M28 44 L28 24" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M28 44 L13 27" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M28 44 L43 27" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <ellipse cx="22" cy="28" rx="6"   ry="8"   transform="rotate(-25 22 28)" fill={c}/>
      <ellipse cx="34" cy="28" rx="6"   ry="8"   transform="rotate(25 34 28)"  fill={c}/>
      <ellipse cx="28" cy="14" rx="5.5" ry="8"   fill={c}/>
      <ellipse cx="7"  cy="23" rx="5"   ry="7"   transform="rotate(-35 7 23)"  fill={c} opacity="0.82"/>
      <ellipse cx="11" cy="13" rx="4"   ry="6"   transform="rotate(-15 11 13)" fill={c} opacity="0.82"/>
      <ellipse cx="49" cy="23" rx="5"   ry="7"   transform="rotate(35 49 23)"  fill={c} opacity="0.82"/>
      <ellipse cx="45" cy="13" rx="4"   ry="6"   transform="rotate(15 45 13)"  fill={c} opacity="0.82"/>
    </svg>
  )

  if (type === 'olive') return (
    <svg width={size} height={size} viewBox="0 0 56 64" fill="none">
      <path d="M11 57 C18 45 30 30 46 12" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <ellipse cx="6"  cy="50" rx="4"   ry="8.5" transform="rotate(40 6 50)"   fill={c}/>
      <ellipse cx="18" cy="47" rx="4"   ry="8.5" transform="rotate(40 18 47)"  fill={c} opacity="0.70"/>
      <ellipse cx="21" cy="36" rx="4"   ry="8.5" transform="rotate(40 21 36)"  fill={c}/>
      <ellipse cx="33" cy="33" rx="4"   ry="8.5" transform="rotate(40 33 33)"  fill={c} opacity="0.70"/>
      <ellipse cx="34" cy="22" rx="3.5" ry="7.5" transform="rotate(40 34 22)"  fill={c}/>
      <ellipse cx="46" cy="19" rx="3.5" ry="7.5" transform="rotate(40 46 19)"  fill={c} opacity="0.70"/>
      <circle  cx="47" cy="11" r="3"   fill={c} opacity="0.65"/>
      <circle  cx="41" cy="9"  r="2.5" fill={c} opacity="0.50"/>
    </svg>
  )

  if (type === 'fern') return (
    <svg width={size} height={size} viewBox="0 0 56 64" fill="none">
      <path d="M26 62 C26 50 28 36 40 10" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none"/>
      <ellipse cx="18" cy="54" rx="3.5" ry="7"   transform="rotate(70 18 54)"    fill={c}/>
      <ellipse cx="18" cy="44" rx="3.5" ry="7"   transform="rotate(65 18 44)"    fill={c}/>
      <ellipse cx="20" cy="34" rx="3.5" ry="6"   transform="rotate(58 20 34)"    fill={c}/>
      <ellipse cx="24" cy="24" rx="3"   ry="6"   transform="rotate(48 24 24)"    fill={c}/>
      <ellipse cx="30" cy="16" rx="2.5" ry="5"   transform="rotate(30 30 16)"    fill={c}/>
      <ellipse cx="35" cy="52" rx="3.5" ry="7"   transform="rotate(-110 35 52)"  fill={c} opacity="0.75"/>
      <ellipse cx="34" cy="42" rx="3.5" ry="7"   transform="rotate(-115 34 42)"  fill={c} opacity="0.75"/>
      <ellipse cx="34" cy="32" rx="3.5" ry="6"   transform="rotate(-120 34 32)"  fill={c} opacity="0.75"/>
      <ellipse cx="37" cy="22" rx="3"   ry="5"   transform="rotate(-130 37 22)"  fill={c} opacity="0.75"/>
    </svg>
  )

  if (type === 'strelitzia') return (
    <svg width={size} height={size} viewBox="0 0 56 64" fill="none">
      <path d="M22 62 C14 48 12 32 18 10 C22 24 22 44 22 62Z" fill={c} opacity="0.78"/>
      <path d="M22 62 C26 48 28 32 24 10 C22 24 22 44 22 62Z" fill={c} opacity="0.78"/>
      <path d="M34 62 C42 48 44 32 38 10 C34 24 34 44 34 62Z" fill={c} opacity="0.78"/>
      <path d="M34 62 C30 48 28 32 32 10 C34 24 34 44 34 62Z" fill={c} opacity="0.78"/>
      <path d="M28 62 C22 46 22 28 28  6 C34 28 34 46 28 62Z" fill={c}/>
      <path d="M21 62 L18 10" stroke="rgba(0,0,0,0.09)" strokeWidth="1" strokeLinecap="round"/>
      <path d="M35 62 L38 10" stroke="rgba(0,0,0,0.09)" strokeWidth="1" strokeLinecap="round"/>
      <path d="M28 62 L28  6" stroke="rgba(0,0,0,0.10)" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )

  if (type === 'orchid') {
    const fcx = 28, fcy = 26
    return (
      <svg width={size} height={size} viewBox="0 0 56 64" fill="none">
        <ellipse cx={fcx-12} cy={fcy-14} rx="7"  ry="12" transform={`rotate(-35 ${fcx-12} ${fcy-14})`} fill={c} opacity="0.85"/>
        <ellipse cx={fcx+12} cy={fcy-14} rx="7"  ry="12" transform={`rotate(35 ${fcx+12} ${fcy-14})`}  fill={c} opacity="0.85"/>
        <ellipse cx={fcx-16} cy={fcy+2}  rx="8"  ry="12" transform={`rotate(-70 ${fcx-16} ${fcy+2})`}  fill={c}/>
        <ellipse cx={fcx+16} cy={fcy+2}  rx="8"  ry="12" transform={`rotate(70 ${fcx+16} ${fcy+2})`}   fill={c}/>
        <path d={`M${fcx} ${fcy+6} C${fcx-10} ${fcy+22} ${fcx-8} ${fcy+40} ${fcx} ${fcy+44} C${fcx+8} ${fcy+40} ${fcx+10} ${fcy+22} ${fcx} ${fcy+6}Z`} fill={c}/>
        <circle cx={fcx} cy={fcy+4} r="6"   fill="rgba(0,0,0,0.15)"/>
        <circle cx={fcx} cy={fcy+4} r="3.5" fill={c}/>
        <path d={`M${fcx} ${fcy+50} L${fcx} 62`} stroke={c} strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
    )
  }

  if (type === 'aloe') return (
    <svg width={size} height={size} viewBox="0 0 56 64" fill="none">
      <path d="M28 56 C20 50 14 34 16 14 C20 28 24 46 28 56Z" fill={c} opacity="0.60"/>
      <path d="M28 56 C36 50 42 34 40 14 C36 28 32 46 28 56Z" fill={c} opacity="0.60"/>
      <path d="M28 56 C16 52  6 38  8 22 C14 36 22 50 28 56Z" fill={c} opacity="0.78"/>
      <path d="M28 56 C40 52 50 38 48 22 C42 36 34 50 28 56Z" fill={c} opacity="0.78"/>
      <path d="M28 56 C22 46 20 28 24  8 C26 24 28 44 28 56Z" fill={c}/>
      <path d="M28 56 C34 46 36 28 32  8 C30 24 28 44 28 56Z" fill={c}/>
      <path d="M24 8 L22 16" stroke="rgba(0,0,0,0.10)" strokeWidth="1" strokeLinecap="round"/>
      <path d="M32 8 L34 16" stroke="rgba(0,0,0,0.10)" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  )

  if (type === 'bamboo') return (
    <svg width={size} height={size} viewBox="0 0 56 64" fill="none">
      <rect x="18" y="8" width="9" height="52" rx="4" fill={c} opacity="0.65"/>
      <rect x="22" y="8" width="9" height="52" rx="4" fill={c} opacity="0.80"/>
      {[52, 40, 28, 16].flatMap(y => [
        <rect key={`a${y}`} x="18" y={y} width="9"  height="2.5" rx="1.2" fill="rgba(0,0,0,0.12)"/>,
        <rect key={`b${y}`} x="22" y={y} width="9"  height="2.5" rx="1.2" fill="rgba(0,0,0,0.12)"/>,
      ])}
      <path d="M27 16 C30 10 40  8 44 12 C38 14 30 16 27 16Z" fill={c}/>
      <path d="M27 28 C24 20 14 18 10 22 C16 24 24 28 27 28Z" fill={c}/>
      <path d="M31 16 C36  8 46  6 50 10 C44 13 34 15 31 16Z" fill={c} opacity="0.75"/>
      <path d="M23 28 C18 20  8 18  4 22 C10 25 20 27 23 28Z" fill={c} opacity="0.75"/>
    </svg>
  )

  if (type === 'lavender') return (
    <svg width={size} height={size} viewBox="0 0 56 64" fill="none">
      <path d="M14 62 L14 40" stroke={c} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M20 62 L20 36" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M28 62 L28 32" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M36 62 L36 36" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M42 62 L42 40" stroke={c} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.65"/>
      <ellipse cx="20" cy="48" rx="5" ry="3" transform="rotate(-30 20 48)" fill={c} opacity="0.45"/>
      <ellipse cx="28" cy="46" rx="5" ry="3" transform="rotate(-30 28 46)" fill={c} opacity="0.45"/>
      <ellipse cx="36" cy="48" rx="5" ry="3" transform="rotate(30 36 48)"  fill={c} opacity="0.45"/>
      {([[14, 40, 0.65], [20, 36, 1], [28, 32, 1], [36, 36, 1], [42, 40, 0.65]] as [number, number, number][]).flatMap(([x, y, op]) =>
        [0, 1, 2, 3, 4].map(i => (
          <ellipse key={`${x}-${i}`} cx={x} cy={y - i * 4.5} rx="4" ry="3.5" fill={c} opacity={op * (0.4 + i * 0.14)}/>
        ))
      )}
    </svg>
  )

  if (type === 'spider') return (
    <svg width={size} height={size} viewBox="0 0 56 64" fill="none">
      <path d="M28 58 C10 44  2 20  4  8" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.80"/>
      <path d="M28 58 C16 40  8 18 12  6" stroke={c} strokeWidth="2.0" strokeLinecap="round" fill="none" opacity="0.88"/>
      <path d="M28 58 C24 38 22 18 24  6" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M28 58 C32 38 34 18 32  6" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M28 58 C40 40 48 18 44  6" stroke={c} strokeWidth="2.0" strokeLinecap="round" fill="none" opacity="0.88"/>
      <path d="M28 58 C46 44 54 20 52  8" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.80"/>
      <path d="M28 58 C36 52 44 52 44 58" stroke={c} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.50"/>
      <ellipse cx="44" cy="60" rx="4" ry="3" fill={c} opacity="0.55"/>
    </svg>
  )

  if (type === 'flower') {
    const petals = [0, 72, 144, 216, 288].map(a => {
      const r = (a * Math.PI) / 180
      const px = Math.round((28 + Math.cos(r) * 13) * 100) / 100
      const py = Math.round((24 + Math.sin(r) * 13) * 100) / 100
      return <ellipse key={a} cx={px} cy={py} rx="8" ry="10"
        transform={`rotate(${a}, ${px}, ${py})`} fill={c} opacity="0.90"/>
    })
    return (
      <svg width={size} height={size} viewBox="0 0 56 64" fill="none">
        {petals}
        <circle cx="28" cy="24" r="8" fill="rgba(0,0,0,0.15)"/>
        <circle cx="28" cy="24" r="6" fill={c}/>
        <path d="M28 32 L28 62" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
        <path d="M28 46 C16 38 12 42 20 50" fill={c} opacity="0.70"/>
      </svg>
    )
  }

  // 'other' — generic seedling
  return (
    <svg width={size} height={size} viewBox="0 0 56 64" fill="none">
      <path d="M28 60L28 34" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M28 34C20 28 14 18 18 10C24 14 28 24 28 34Z" fill={c}/>
      <path d="M28 34C36 28 42 18 38 10C32 14 28 24 28 34Z" fill={c} opacity="0.80"/>
    </svg>
  )
}
