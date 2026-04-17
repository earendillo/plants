import { Garden } from '@/types'

/**
 * Returns the resolved gardenId from the URL param.
 * If param is absent or doesn't belong to this user's gardens,
 * returns the first garden's id (ordered by created_at ascending).
 *
 * The caller MUST redirect to `?garden=<returned id>` when the returned
 * id differs from gardenParam to keep the URL as the single source of truth.
 */
export function resolveActiveGarden(
  gardens: Garden[],
  gardenParam: string | undefined
): string {
  if (gardens.length === 0) throw new Error('User has no gardens')
  if (gardenParam && gardens.some(g => g.id === gardenParam)) {
    return gardenParam
  }
  return gardens[0].id
}
