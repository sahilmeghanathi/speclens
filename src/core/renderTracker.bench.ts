/**
 * Performance Benchmarks for RenderTracker System
 * Measures overhead and memory usage of render tracking
 */

import { tracker } from './renderTracker'
import { setTrackerEnabled } from './trackerConfig'

/**
 * Performance benchmark result
 */
export interface BenchmarkResult {
  iterations: number
  timeWithoutTracking: number
  timeWithTracking: number
  overheadMs: number
  overheadPercent: number
  avgOverheadPerRender: number
  memoryEstimateBefore: number
  memoryEstimateAfter: number
  memoryIncrease: number
}

/**
 * Run performance benchmarks for the render tracker system
 * Tests rendering performance with and without tracking enabled
 *
 * @param iterations - Number of iterations to test (default: 100)
 * @returns Benchmark results with detailed metrics
 *
 * @example
 * const results = benchmarkRenderTracking(100)
 * console.log(`Overhead: ${results.overheadPercent.toFixed(2)}%`)
 * console.log(`Avg per render: ${results.avgOverheadPerRender.toFixed(3)}ms`)
 *
 * @remarks
 * - Target overhead: < 2ms per render
 * - Results printed to console
 * - Can be run from browser console
 */
export function benchmarkRenderTracking(iterations = 100): BenchmarkResult {
  // Create test props with various data types
  const smallProps = {
    title: 'Test',
    value: 123,
    active: true,
    onClick: () => {},
  }

  const largeProps = {
    ...smallProps,
    data: Array(50)
      .fill(0)
      .map((_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random() * 1000,
      })),
    nested: {
      level1: {
        level2: {
          level3: {
            content: 'Very nested data structure',
          },
        },
      },
    },
  }

  const testProps = [smallProps, largeProps]

  console.log(`🏃 Starting RenderTracker benchmark (${iterations} iterations)...`)
  console.log('━'.repeat(60))

  // Warm up
  for (let i = 0; i < 10; i++) {
    tracker.trackRender(`warmup-${i}`, smallProps, smallProps)
  }
  tracker.reset()

  // Measure WITHOUT tracking
  setTrackerEnabled(false)
  const start1 = performance.now()

  for (let i = 0; i < iterations; i++) {
    for (const props of testProps) {
      tracker.trackRender(`test-${i}`, props, { ...props, value: props.value + 1 })
    }
  }

  const timeWithoutTracking = performance.now() - start1
  tracker.reset()

  // Measure WITH tracking
  setTrackerEnabled(true)
  const start2 = performance.now()

  for (let i = 0; i < iterations; i++) {
    for (const props of testProps) {
      tracker.trackRender(`test-${i}`, props, { ...props, value: props.value + 1 })
    }
  }

  const timeWithTracking = performance.now() - start2

  // Get system stats
  const systemStats = tracker.getSystemStats()

  // Calculate results
  const overheadMs = timeWithTracking - timeWithoutTracking
  const overheadPercent = (overheadMs / timeWithoutTracking) * 100
  const totalTrackedOps = iterations * testProps.length
  const avgOverheadPerRender = overheadMs / totalTrackedOps

  const result: BenchmarkResult = {
    iterations,
    timeWithoutTracking,
    timeWithTracking,
    overheadMs,
    overheadPercent,
    avgOverheadPerRender,
    memoryEstimateBefore: 0,
    memoryEstimateAfter: systemStats.memoryUsageEstimate || 0,
    memoryIncrease: systemStats.memoryUsageEstimate || 0,
  }

  // Print results
  console.log('\n📊 BENCHMARK RESULTS:')
  console.log('━'.repeat(60))
  console.log(`✓ Iterations: ${iterations}`)
  console.log(`✓ Total render operations: ${totalTrackedOps}`)
  console.log(`\n⏱️  Timing:`)
  console.log(
    `  Without tracking: ${timeWithoutTracking.toFixed(2)}ms`,
  )
  console.log(`  With tracking: ${timeWithTracking.toFixed(2)}ms`)
  console.log(`  Total overhead: ${overheadMs.toFixed(2)}ms`)
  console.log(`  Overhead %: ${overheadPercent.toFixed(2)}%`)
  console.log(`\n🎯 Per-Render:`)
  console.log(`  Avg overhead: ${avgOverheadPerRender.toFixed(4)}ms`)
  console.log(`  Target: < 2ms`)

  if (avgOverheadPerRender < 2) {
    console.log('  ✅ PASS: Overhead within acceptable range')
  } else {
    console.log('  ⚠️  FAIL: Overhead exceeds target')
  }

  console.log(`\n💾 Memory:`)
  console.log(`  Tracked components: ${systemStats.totalComponentsTracked}`)
  console.log(`  Estimated usage: ${Math.round((result.memoryEstimateAfter || 0) / 1024)}KB`)
  console.log(`  Per component: ${Math.round((result.memoryEstimateAfter || 0) / (systemStats.totalComponentsTracked || 1) / 1024)}KB`)

  console.log('\n' + '━'.repeat(60))
  console.log('✓ Benchmark complete')

  tracker.reset()
  setTrackerEnabled(true) // Re-enable for normal operation

  return result
}

/**
 * Run continuous performance monitoring
 * Logs rendering stats every interval
 *
 * @param intervalMs - Log interval in milliseconds (default: 5000)
 * @param durationMs - Total monitoring duration (default: 30000)
 * @returns Promise that resolves when monitoring is complete
 *
 * @example
 * // Monitor for 30 seconds, log every 5 seconds
 * await monitorPerformance()
 *
 * @remarks
 * - Logs to console
 * - Useful for observing real-world app performance
 * - Call from browser console or integration test
 */
export function monitorPerformance(
  intervalMs = 5000,
  durationMs = 30000,
): Promise<void> {
  return new Promise((resolve) => {
    const startTime = Date.now()
    let previousStats = tracker.getSystemStats()

    console.log(`📊 Performance monitoring started (${durationMs / 1000}s duration)`)

    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = now - startTime
      const currentStats = tracker.getSystemStats()

      const newRenders = currentStats.totalRenders - previousStats.totalRenders
      const renderRate = (newRenders / intervalMs) * 1000

      console.log(
        `[${(elapsed / 1000).toFixed(1)}s] Components: ${currentStats.totalComponentsTracked} | ` +
          `Total Renders: ${currentStats.totalRenders} | ` +
          `Rate: ${renderRate.toFixed(1)}/s | ` +
          `Memory: ${Math.round((currentStats.memoryUsageEstimate || 0) / 1024)}KB`,
      )

      previousStats = currentStats

      if (elapsed >= durationMs) {
        clearInterval(interval)
        console.log('✓ Performance monitoring complete')
        resolve()
      }
    }, intervalMs)
  })
}

/**
 * Export benchmarks for global access
 * Can be called from browser console: window.RenderTrackerBench.benchmark()
 */
export const RenderTrackerBench = {
  benchmark: benchmarkRenderTracking,
  monitor: monitorPerformance,
}

// Make available globally in development
if (import.meta.env.MODE === 'development') {
  ;(globalThis as any).RenderTrackerBench = RenderTrackerBench
}
