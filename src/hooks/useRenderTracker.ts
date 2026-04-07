/**
 * React Hooks for accessing the RenderTracker
 * Provides convenient hooks for components to access tracking data
 * All hooks are reactive and update when tracker data changes
 */

import { useMemo, useState, useEffect } from 'react'
import { tracker } from '../core/renderTracker'
import type { RenderTracker } from '../core/renderTracker'
import type { RenderStats, ComponentRenderData } from '../core/renderTrackerTypes'

/**
 * Hook to access the global RenderTracker singleton
 * Safe to call from any functional component
 *
 * @returns The global tracker instance
 *
 * @example
 * function MyComponent() {
 *   const tracker = useRenderTracker()
 *   
 *   return (
 *     <button onClick={() => {
 *       console.log(tracker.getAllStats())
 *     }}>
 *       Log Stats
 *     </button>
 *   )
 * }
 *
 * @remarks
 * - Returns the same singleton instance always
 * - No dependencies needed
 * - Safe to call - will never change during component lifecycle
 */
export function useRenderTracker(): RenderTracker {
  return useMemo(() => tracker, [])
}

/**
 * Hook to get complete statistics for a specific component
 * Includes render history and prop changes
 * Reactive - updates whenever tracker data changes
 *
 * @param nodeId - The component node ID to get stats for
 * @returns Complete render statistics, or null if component not tracked
 *
 * @example
 * function StatDisplay() {
 *   const stats = useComponentStats('my-card-1')
 *   
 *   if (!stats) return <div>Not tracked</div>
 *   
 *   return <div>Renders: {stats.totalRenders}</div>
 * }
 *
 * @remarks
 * - Automatically updates when tracker data changes
 * - Returns null if component hasn't been tracked yet
 * - Subscribes to tracker updates on mount, unsubscribes on unmount
 */
export function useComponentStats(nodeId: string): RenderStats | null {
  const [stats, setStats] = useState<RenderStats | null>(() =>
    tracker.getComponentStats(nodeId)
  )

  useEffect(() => {
    // Set initial value
    setStats(tracker.getComponentStats(nodeId))

    // Subscribe to updates
    const unsubscribe = tracker.subscribe(() => {
      setStats(tracker.getComponentStats(nodeId))
    })

    return unsubscribe
  }, [nodeId])

  return stats
}

/**
 * Hook to get lightweight statistics for a specific component
 * Without full history (faster for frequent queries)
 * Reactive - updates whenever tracker data changes
 *
 * @param nodeId - The component node ID to get stats for
 * @returns Component statistics without history, or null if not tracked
 *
 * @example
 * function RenderCounter() {
 *   const stats = useComponentData('my-button')
 *   
 *   return <span>{stats?.totalRenders ?? 0}</span>
 * }
 *
 * @remarks
 * - Lighter-weight than useComponentStats (no full history)
 * - Automatically updates when tracker data changes
 * - Good for performance-critical display
 */
export function useComponentData(nodeId: string): ComponentRenderData | null {
  const [data, setData] = useState<ComponentRenderData | null>(() =>
    tracker.getStats(nodeId)
  )

  useEffect(() => {
    // Set initial value
    setData(tracker.getStats(nodeId))

    // Subscribe to updates
    const unsubscribe = tracker.subscribe(() => {
      setData(tracker.getStats(nodeId))
    })

    return unsubscribe
  }, [nodeId])

  return data
}

/**
 * Hook to get list of props that changed on last render
 * Returns prop keys that differ from previous render
 * Reactive - updates whenever tracker data changes
 *
 * @param nodeId - The component node ID
 * @returns List of changed prop keys, or null if not tracked
 *
 * @example
 * function PropWatcher({ nodeId }) {
 *   const changes = usePropChanges(nodeId)
 *   
 *   return (
 *     <div>
 *       {changes?.length ? (
 *         <p>Changed props: {changes.join(', ')}</p>
 *       ) : (
 *         <p>No prop changes</p>
 *       )}
 *     </div>
 *   )
 * }
 *
 * @remarks
 * - Automatically updates when prop changes occur
 * - Returns null if component hasn't rendered yet
 * - Useful for debugging prop changes
 */
export function usePropChanges(nodeId: string): string[] | null {
  const [changes, setChanges] = useState<string[] | null>(() =>
    tracker.getPropChanges(nodeId)
  )

  useEffect(() => {
    // Set initial value
    setChanges(tracker.getPropChanges(nodeId))

    // Subscribe to updates
    const unsubscribe = tracker.subscribe(() => {
      setChanges(tracker.getPropChanges(nodeId))
    })

    return unsubscribe
  }, [nodeId])

  return changes
}

/**
 * Hook to get all tracked components' statistics
 * Returns aggregated data for the entire app
 * Reactive - updates whenever any component renders
 *
 * @returns Object with stats for all tracked components (may be empty)
 *
 * @example
 * function DebugDashboard() {
 *   const allStats = useAllComponentStats()
 *   
 *   return (
 *     <div>
 *       <h2>Tracked Components: {Object.keys(allStats).length}</h2>
 *       {Object.entries(allStats).map(([nodeId, stats]) => (
 *         <div key={nodeId}>
 *           {nodeId}: {stats.totalRenders} renders
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 *
 * @remarks
 * - Automatically updates when any tracked component renders
 * - May be expensive with many tracked components
 * - Consider using useSystemStats for a lighter-weight overview
 */
export function useAllComponentStats(): Record<string, RenderStats> {
  const [stats, setStats] = useState<Record<string, RenderStats>>(() =>
    tracker.getAllStats()
  )

  useEffect(() => {
    // Set initial value
    setStats(tracker.getAllStats())

    // Subscribe to updates
    const unsubscribe = tracker.subscribe(() => {
      setStats(tracker.getAllStats())
    })

    return unsubscribe
  }, [])

  return stats
}

/**
 * Hook to get system-wide tracking statistics
 * High-level overview of all tracking activity
 * Reactive - updates whenever any component renders
 *
 * @returns System statistics
 *
 * @example
 * function TrackingStatus() {
 *   const { totalComponentsTracked, totalRenders, memoryUsageEstimate } = 
 *     useSystemStats()
 *   
 *   return (
 *     <div>
 *       <p>Components: {totalComponentsTracked}</p>
 *       <p>Total Renders: {totalRenders}</p>
 *       <p>Memory: ~{Math.round((memoryUsageEstimate || 0) / 1024)}KB</p>
 *     </div>
 *   )
 * }
 *
 * @remarks
 * - Lightweight aggregation
 * - Automatically updates when tracker data changes
 * - Memory estimate is approximate
 * - Good for performance monitoring
 */
export function useSystemStats() {
  const [stats, setStats] = useState(() => tracker.getSystemStats())

  useEffect(() => {
    // Set initial value
    setStats(tracker.getSystemStats())

    // Subscribe to updates
    const unsubscribe = tracker.subscribe(() => {
      setStats(tracker.getSystemStats())
    })

    return unsubscribe
  }, [])

  return stats
}

/**
 * Hook to check if rendering is currently enabled
 * Returns true if tracking is actively capturing render events
 *
 * @returns true if tracking enabled, false otherwise
 *
 * @example
 * function TrackingToggle() {
 *   const isEnabled = useTrackerEnabled()
 *   const tracker = useRenderTracker()
 *   
 *   return (
 *     <button
 *       onClick={() => tracker.setTrackerEnabled(!isEnabled)}
 *     >
 *       {isEnabled ? 'Disable' : 'Enable'} Tracking
 *     </button>
 *   )
 * }
 *
 * @remarks
 * - Does not directly control tracker (read-only)
 * - Use setTrackerEnabled() from trackerConfig module to actually toggle
 * - Automatically updates when enabled state changes
 */
export function useTrackerEnabled(): boolean {
  const [enabled, setEnabled] = useState(() => tracker.isEnabled())

  useEffect(() => {
    // Set initial value
    setEnabled(tracker.isEnabled())

    // Subscribe to updates (tracker enables/disables)
    const unsubscribe = tracker.subscribe(() => {
      setEnabled(tracker.isEnabled())
    })

    return unsubscribe
  }, [])

  return enabled
}
