/**
 * Core RenderTracker Class
 * Singleton that stores and manages all render tracking data
 */

import { isTrackerEnabled, getMaxHistorySize } from './trackerConfig'
import { detectRenderReason, getPropChangeSummary } from './renderTrackerUtils'
import type {
  ComponentRenderData,
  RenderEvent,
  RenderStats,
  SystemStats,
} from './renderTrackerTypes'

/**
 * RenderTracker Class
 * Stores render events and provides query APIs for all tracked components
 *
 * Usage:
 * ```typescript
 * import { tracker } from './renderTracker'
 *
 * // Track a render
 * tracker.trackRender('node-id', prevProps, currentProps)
 *
 * // Query stats
 * const stats = tracker.getAllStats()
 * console.log(stats)
 * ```
 */
export class RenderTracker {
  /**
   * Map of component stats keyed by nodeId
   * Stores the lightweight summary data for each component
   */
  private readonly componentStats: Map<string, ComponentRenderData> = new Map()

  /**
   * Map of render histories keyed by nodeId
   * Stores detailed render event history for each component
   */
  private readonly renderHistory: Map<string, RenderEvent[]> = new Map()

  /**
   * Track the first props we see for each component
   * Used to detect if this is the initial render
   */
  private readonly initialPropsSnapshot: Map<string, Record<string, any>> = new Map()

  /**
   * Subscribers that want to be notified of tracker updates
   * Used by React hooks to trigger re-renders
   */
  private readonly subscribers: Set<() => void> = new Set()

  /**
   * Record a render event for a component
   * Called by withRenderTracking HOC on every render
   *
   * @param nodeId - Unique identifier for the component instance
   * @param prevProps - Props from previous render
   * @param currentProps - Props from current render
   *
   * @remarks
   * - If tracking is disabled, this is a no-op
   * - Automatically detects re-render reason
   * - Maintains circular buffer history (max 50 events per component)
   * - Updates component stats in real-time
   */
  trackRender(
    nodeId: string,
    prevProps?: Record<string, any>,
    currentProps?: Record<string, any>,
  ): void {
    // Don't track if globally disabled
    if (!isTrackerEnabled()) {
      return
    }

    // Ensure component entry exists
    this._ensureComponentEntry(nodeId)

    // Get current stats for this component
    const stats = this.componentStats.get(nodeId);
    if (!stats) {
      return;
    }
    const isInitialRender = stats.totalRenders === 0

    // Detect what changed
    const propChanges = getPropChangeSummary(prevProps, currentProps)

    // Detect why it re-rendered
    const { reason, confidence } = detectRenderReason(
      prevProps,
      currentProps,
      isInitialRender,
    )

    // Create new render event
    const now = Date.now()
    const renderEvent: RenderEvent = {
      timestamp: now,
      renderCount: stats.totalRenders + 1,
      duration: undefined,
      prevProps: prevProps || {},
      currentProps: currentProps || {},
      propChanges,
      reason,
      reasonConfidence: confidence,
    }

    // Update stats
    stats.totalRenders += 1
    stats.lastRenderTime = now
    stats.lastReason = reason

    // Add to history
    const history = this.renderHistory.get(nodeId) || []
    history.push(renderEvent)

    // Maintain circular buffer (max history size from config)
    const maxHistorySize = getMaxHistorySize()
    if (history.length > maxHistorySize) {
      history.shift() // Remove oldest if exceeded
    }

    this.renderHistory.set(nodeId, history)
    this.componentStats.set(nodeId, stats)
    
    // Notify subscribers of update
    this._notifySubscribers()
  }

  /**
   * Get statistics for a specific component
   * Includes full render history
   *
   * @param nodeId - Component node ID
   * @returns Complete stats with history, or null if not found
   *
   * @example
   * const stats = tracker.getComponentStats('my-card-1')
   * console.log(stats.totalRenders) // 5
   * console.log(stats.history[0].reason) // 'props_changed'
   */
  getComponentStats(nodeId: string): RenderStats | null {
    const data = this.componentStats.get(nodeId)
    if (!data) {
      return null
    }

    const history = this.renderHistory.get(nodeId) || []
    const lastPropChanges = history.length > 0 ? history[history.length - 1].propChanges : []

    return {
      ...data,
      history,
      lastPropChanges,
    }
  }

  /**
   * Get render history for a specific component
   * Only the render events, without aggregated stats
   *
   * @param nodeId - Component node ID
   * @returns Array of render events, or null if not found
   *
   * @example
   * const history = tracker.getRenderHistory('my-stat-card')
   * console.log(history.length) // 3
   * history.forEach(event => console.log(event.timestamp))
   */
  getRenderHistory(nodeId: string): RenderEvent[] | null {
    const history = this.renderHistory.get(nodeId)
    return history ? [...history] : null
  }

  /**
   * Get prop changes from the most recent render
   * Returns list of keys that changed
   *
   * @param nodeId - Component node ID
   * @returns List of changed prop keys, or null if not found
   *
   * @example
   * const changes = tracker.getPropChanges('my-grid')
   * // ['columns', 'spacing']
   */
  getPropChanges(nodeId: string): string[] | null {
    const history = this.renderHistory.get(nodeId)
    if (!history || history.length === 0) {
      return null
    }
    return [...history[history.length - 1].propChanges]
  }

  /**
   * Get lightweight stats for a specific component
   * Without full history (faster queries)
   *
   * @param nodeId - Component node ID
   * @returns Component stats, or null if not found
   *
   * @example
   * const stats = tracker.getStats('card-1')
   * console.log(stats?.totalRenders) // 5
   */
  getStats(nodeId: string): ComponentRenderData | null {
    const stats = this.componentStats.get(nodeId)
    return stats ? { ...stats } : null
  }

  /**
   * Get aggregated statistics for all tracked components
   * Returns object keyed by nodeId with full stats
   *
   * @returns Object with all component stats (may be empty)
   *
   * @example
   * const allStats = tracker.getAllStats()
   * Object.entries(allStats).forEach(([nodeId, stats]) => {
   *   console.log(`${nodeId}: ${stats.totalRenders} renders`)
   * })
   */
  getAllStats(): Record<string, RenderStats> {
    const result: Record<string, RenderStats> = {}

    for (const nodeId of this.componentStats.keys()) {
      const stats = this.getComponentStats(nodeId)
      if (stats) {
        result[nodeId] = stats
      }
    }

    return result
  }

  /**
   * Get system-wide statistics
   * Overview of all tracked components
   *
   * @returns Summary statistics
   *
   * @example
   * const sysStats = tracker.getSystemStats()
   * console.log(`Tracking ${sysStats.totalComponentsTracked} components`)
   * console.log(`Total renders: ${sysStats.totalRenders}`)
   */
  getSystemStats(): SystemStats {
    let totalRenders = 0
    let memoryEstimate = 0

    for (const nodeId of this.componentStats.keys()) {
      const stats = this.componentStats.get(nodeId)
      if (stats) {
        totalRenders += stats.totalRenders
        // Rough estimate: ~100 bytes per render event in history
        const history = this.renderHistory.get(nodeId)
        if (history) {
          memoryEstimate += history.length * 100
        }
      }
    }

    return {
      totalComponentsTracked: this.componentStats.size,
      totalRenders,
      memoryUsageEstimate: memoryEstimate,
      collectedAt: Date.now(),
    }
  }

  /**
   * Enable or disable tracking
   * When disabled, trackRender() calls are no-ops
   *
   * @param enabled - true to enable, false to disable
   *
   * @remarks
   * Note: This doesn't directly affect tracker, it checks config instead
   * Use setTrackerEnabled() from trackerConfig module
   */
  isEnabled(): boolean {
    return isTrackerEnabled()
  }

  /**
   * Clear all tracked data
   * Resets the tracker to initial state
   *
   * @remarks
   * - Clears all component stats
   * - Clears all render history
   * - Keeps enabled state unchanged
   */
  reset(): void {
    this.componentStats.clear()
    this.renderHistory.clear()
    this.initialPropsSnapshot.clear()
    this._notifySubscribers()
  }

  /**
   * Subscribe to tracker updates
   * Called by React hooks to trigger re-renders on data changes
   *
   * @param callback - Function to call when tracker data updates
   * @returns Unsubscribe function
   *
   * @example
   * const unsubscribe = tracker.subscribe(() => {
   *   setUpdateCount(c => c + 1)
   * })
   * 
   * // Cleanup
   * unsubscribe()
   */
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  /**
   * Notify all subscribers of a tracker update
   * Called internally whenever data changes
   */
  private _notifySubscribers(): void {
    this.subscribers.forEach((callback) => {
      try {
        callback()
      } catch (error) {
        console.error('[RenderTracker] Subscriber error:', error)
      }
    })
  }

  /**
   * Clear data for a specific component
   * Removes all history and stats for one component
   *
   * @param nodeId - Component to clear
   *
   * @example
   * tracker.resetComponent('my-card-1')
   */
  resetComponent(nodeId: string): void {
    this.componentStats.delete(nodeId)
    this.renderHistory.delete(nodeId)
    this.initialPropsSnapshot.delete(nodeId)
    this._notifySubscribers()
  }

  /**
   * Ensure component entry exists in tracking maps
   * Called internally before first trackRender
   *
   * @param nodeId - Component node ID
   * @param componentType - Optional component type for logging
   */
  private _ensureComponentEntry(nodeId: string, componentType = 'Unknown'): void {
    if (this.componentStats.has(nodeId)) {
      return // Already tracked
    }

    const now = Date.now()
    const stats: ComponentRenderData = {
      nodeId,
      componentType,
      firstRenderTime: now,
      totalRenders: 0,
      averageDuration: undefined,
      lastRenderTime: now,
      lastReason: 'initial_render',
    }

    this.componentStats.set(nodeId, stats)
    this.renderHistory.set(nodeId, [])
  }

  /**
   * Get a component-focused debug view
   * Useful for console debugging and logging
   *
   * @param nodeId - Component node ID
   * @returns Formatted debug object, or null if not found
   */
  debugComponent(nodeId: string): Record<string, any> | null {
    const stats = this.getComponentStats(nodeId)
    if (!stats) return null

    return {
      nodeId: stats.nodeId,
      componentType: stats.componentType,
      totalRenders: stats.totalRenders,
      timeSinceFirstRender: Date.now() - stats.firstRenderTime,
      timeSinceLastRender: Date.now() - stats.lastRenderTime,
      lastReason: stats.lastReason,
      lastPropChanges: stats.lastPropChanges,
      recentHistory: stats.history.slice(-3).map((event) => ({
        renderCount: event.renderCount,
        reason: event.reason,
        propChanges: event.propChanges,
      })),
    }
  }
}

/**
 * Global singleton instance of RenderTracker
 * Use this to access tracking APIs from anywhere in the app
 *
 * @example
 * import { tracker } from './renderTracker'
 * const stats = tracker.getAllStats()
 */
export const tracker = new RenderTracker()

/**
 * Export type definitions for external use
 */
export type {
  RenderEvent,
  RenderReason,
  ReasonConfidence,
  ComponentRenderData,
  RenderStats,
  SystemStats,
  PropComparisonResult,
  RenderTrackerConfig,
} from './renderTrackerTypes'
