import type { PlantType } from '@/types'
import { plantIconRenderers } from '@/lib/plant-icon-paths'

export const PLANT_TINTS: Record<PlantType, string> = {
  monstera:   '#CFEE9E',
  cactus:     '#E5D08A',
  succulent:  '#F0B8C4',
  herb:       '#A4E89A',
  vine:       '#B0D8C0',
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
  return <>{plantIconRenderers[type]({ c, size, di, dh })}</>
}
