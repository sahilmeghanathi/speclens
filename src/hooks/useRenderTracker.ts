/**
 * React Hooks for accessing the RenderTracker
 * Provides convenient hooks for components to access tracking data
 */

import { useMemo } from 'react'
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
 * - Uses useMemo to avoid unnecessary recalculations
 * - Returns null if component hasn't been tracked yet
 * - Stats update on component renders (when withRenderTracking wrapper rerenders)
 */
export function useComponentStats(nodeId: string): RenderStats | null {
  return useMemo(() => tracker.getComponentStats(nodeId), [nodeId])
}

/**
 * Hook to get lightweight statistics for a specific component
 * Without full history (faster for frequent queries)
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
 * - Still updates reactively
 * - Good for performance-critical display
 */
export function useComponentData(nodeId: string): ComponentRenderData | null {
  return useMemo(() => tracker.getStats(nodeId), [nodeId])
}

/**
 * Hook to get list of props that changed on last render
 * Returns prop keys that differ from previous render
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
 * - Only shows changes from the most recent render
 * - Returns null if component hasn't rendered yet
 * - Useful for debugging prop changes
 */
export function usePropChanges(nodeId: string): string[] | null {
  return useMemo(() => tracker.getPropChanges(nodeId), [nodeId])
}

/**
 * Hook to get all tracked components' statistics
 * Returns aggregated data for the entire app
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
 * - Updates when any tracked component renders
 * - May be expensive with many tracked components
 * - Consider using useSystemStats for a lighter-weight overview
 */
export function useAllComponentStats(): Record<string, RenderStats> {
  return useMemo(() => tracker.getAllStats(), [])
}

/**
 * Hook to get system-wide tracking statistics
 * High-level overview of all tracking activity
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
 * - Memory estimate is approximate
 * - Good for performance monitoring
 */
export function useSystemStats() {
  return useMemo(() => tracker.getSystemStats(), [])
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
 * - Always returns current enabled state
 */
export function useTrackerEnabled(): boolean {
  return useMemo(() => tracker.isEnabled(), [])
}
