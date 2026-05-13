/**
 * Downsamples an array of data points when the count exceeds maxPoints.
 * Uses the Largest Triangle Three Buckets (LTTB) algorithm for visually
 * representative downsampling that preserves peaks and valleys.
 *
 * @param data - Array of data points (objects with a numeric value key)
 * @param maxPoints - Maximum number of points to return (default: 90)
 * @param valueKey - The key to use for Y-axis value comparison during downsampling
 * @returns Downsampled array, or original if length <= maxPoints
 */
export function downsampleData<T extends Record<string, unknown>>(
  data: T[],
  maxPoints = 90,
  valueKey?: string,
): T[] {
  if (data.length <= maxPoints || maxPoints < 3) {
    return data
  }

  // If no valueKey provided, use evenly-spaced sampling
  if (!valueKey) {
    return evenSample(data, maxPoints)
  }

  return lttbDownsample(data, maxPoints, valueKey)
}

/**
 * LTTB (Largest Triangle Three Buckets) downsampling.
 * Selects the point in each bucket that forms the largest triangle area
 * with the selected points in adjacent buckets.
 */
function lttbDownsample<T extends Record<string, unknown>>(
  data: T[],
  targetCount: number,
  valueKey: string,
): T[] {
  const length = data.length

  // Always keep first and last points
  const result: T[] = [data[0]]

  // Bucket size (excluding first and last)
  const bucketSize = (length - 2) / (targetCount - 2)

  let prevIndex = 0

  for (let i = 1; i < targetCount - 1; i++) {
    const bucketStart = Math.floor((i - 1) * bucketSize) + 1
    const bucketEnd = Math.min(Math.floor(i * bucketSize) + 1, length - 1)

    // Calculate average point of next bucket for triangle area
    const nextBucketStart = Math.floor(i * bucketSize) + 1
    const nextBucketEnd = Math.min(Math.floor((i + 1) * bucketSize) + 1, length - 1)

    let avgX = 0
    let avgY = 0
    let nextBucketCount = 0

    for (let j = nextBucketStart; j < nextBucketEnd; j++) {
      avgX += j
      avgY += toNumber(data[j][valueKey])
      nextBucketCount++
    }

    if (nextBucketCount > 0) {
      avgX /= nextBucketCount
      avgY /= nextBucketCount
    }

    // Find point in current bucket with largest triangle area
    const prevX = prevIndex
    const prevY = toNumber(data[prevIndex][valueKey])

    let maxArea = -1
    let maxAreaIndex = bucketStart

    for (let j = bucketStart; j < bucketEnd; j++) {
      const area = Math.abs(
        (prevX - avgX) * (toNumber(data[j][valueKey]) - prevY) -
        (prevX - j) * (avgY - prevY),
      )

      if (area > maxArea) {
        maxArea = area
        maxAreaIndex = j
      }
    }

    result.push(data[maxAreaIndex])
    prevIndex = maxAreaIndex
  }

  // Always include last point
  result.push(data[length - 1])

  return result
}

/**
 * Evenly-spaced sampling fallback when no numeric value key is available.
 */
function evenSample<T>(data: T[], targetCount: number): T[] {
  const result: T[] = [data[0]]
  const step = (data.length - 1) / (targetCount - 1)

  for (let i = 1; i < targetCount - 1; i++) {
    result.push(data[Math.round(i * step)])
  }

  result.push(data[data.length - 1])
  return result
}

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return 0
}
