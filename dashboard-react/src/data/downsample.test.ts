import { describe, expect, it } from 'vitest'
import { downsampleData } from './downsample'

describe('downsampleData', () => {
  it('returns original data when length <= maxPoints', () => {
    const data = Array.from({ length: 50 }, (_, i) => ({ date: `day-${i}`, value: i }))
    const result = downsampleData(data, 90, 'value')
    expect(result).toBe(data)
  })

  it('returns original data when maxPoints < 3', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({ date: `day-${i}`, value: i }))
    const result = downsampleData(data, 2, 'value')
    expect(result).toBe(data)
  })

  it('downsamples to target count when data exceeds maxPoints', () => {
    const data = Array.from({ length: 200 }, (_, i) => ({ date: `day-${i}`, value: Math.sin(i / 10) * 100 }))
    const result = downsampleData(data, 90, 'value')
    expect(result.length).toBe(90)
  })

  it('preserves first and last data points', () => {
    const data = Array.from({ length: 150 }, (_, i) => ({ date: `day-${i}`, value: i * 2 }))
    const result = downsampleData(data, 50, 'value')
    expect(result[0]).toBe(data[0])
    expect(result[result.length - 1]).toBe(data[data.length - 1])
  })

  it('uses even sampling when no valueKey provided', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({ date: `day-${i}`, label: `label-${i}` }))
    const result = downsampleData(data, 50)
    expect(result.length).toBe(50)
    expect(result[0]).toBe(data[0])
    expect(result[result.length - 1]).toBe(data[data.length - 1])
  })

  it('handles data with non-numeric values gracefully', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({
      date: `day-${i}`,
      value: i % 3 === 0 ? null : i * 10,
    }))
    const result = downsampleData(data, 30, 'value')
    expect(result.length).toBe(30)
  })

  it('preserves peaks in sinusoidal data', () => {
    const data = Array.from({ length: 200 }, (_, i) => ({
      date: `day-${i}`,
      value: Math.sin(i / 10) * 1000,
    }))
    const result = downsampleData(data, 50, 'value')

    // The max value in the downsampled set should be close to the original max
    const originalMax = Math.max(...data.map((d) => d.value))
    const downsampledMax = Math.max(...result.map((d) => d.value))
    expect(downsampledMax).toBeGreaterThan(originalMax * 0.9)
  })
})
