/**
 * Configuration management for the RenderTracker system
 * Handles runtime configuration and provides centralized config access
 */

import type { RenderTrackerConfig } from './renderTrackerTypes'

/**
 * Default configuration for render tracker
 * Reads from environment variables if available
 *
 * Environment variables:
 * - VITE_TRACKER_ENABLED: 'true' | 'false' (default: true in dev, false in prod)
 * - VITE_TRACKER_MAX_HISTORY: number (default: 50)
 * - VITE_TRACKER_ENABLE_TIMING: 'true' | 'false' (default: false)
 */
function getDefaultConfig(): RenderTrackerConfig {
  const isDev = import.meta.env.MODE === 'development'

  // Check for explicit environment variable override
  const envEnabled = import.meta.env.VITE_TRACKER_ENABLED
  const enabledByDefault = envEnabled === undefined ? isDev : envEnabled !== 'false'

  return {
    enabled: enabledByDefault,
    maxHistoryPerComponent: parseInt(
      import.meta.env.VITE_TRACKER_MAX_HISTORY || '50',
      10,
    ),
    enableTiming: import.meta.env.VITE_TRACKER_ENABLE_TIMING === 'true',
  }
}

/**
 * Global config state - mutable by setTrackerConfig()
 * Default values initialized at module load time
 */
let globalConfig: RenderTrackerConfig = getDefaultConfig()

/**
 * Set the render tracker configuration
 * Merges provided config with existing config (partial update)
 *
 * @param partial - Partial config object with fields to update
 *
 * @example
 * setTrackerConfig({ enabled: false })
 * setTrackerConfig({ maxHistoryPerComponent: 100 })
 *
 * @remarks
 * - Can be called anytime at runtime
 * - Partial updates (only specified fields are changed)
 * - Recommended to call before app initialization
 */
export function setTrackerConfig(partial: Partial<RenderTrackerConfig>): void {
  globalConfig = {
    ...globalConfig,
    ...partial,
  }
}

/**
 * Get the current render tracker configuration
 * Returns the active configuration object
 *
 * @returns Current render tracker configuration
 *
 * @example
 * const config = getTrackerConfig()
 * console.log(config.enabled) // true/false
 * console.log(config.maxHistoryPerComponent) // 50
 */
export function getTrackerConfig(): RenderTrackerConfig {
  return { ...globalConfig }
}

/**
 * Check if the render tracker is currently enabled
 * Shorthand for getTrackerConfig().enabled
 *
 * @returns true if tracking is enabled, false otherwise
 *
 * @example
 * if (isTrackerEnabled()) {
 *   tracker.trackRender(nodeId, prev, current)
 * }
 */
export function isTrackerEnabled(): boolean {
  return globalConfig.enabled
}

/**
 * Enable or disable the render tracker at runtime
 * Useful for toggling tracking without stopping the app
 *
 * @param enabled - true to enable tracking, false to disable
 *
 * @example
 * setTrackerEnabled(false) // Turn off tracking
 * // ... do some work ...
 * setTrackerEnabled(true)  // Turn it back on
 *
 * @remarks
 * - Disabling tracker prevents new render events from being tracked
 * - Existing history is preserved (use tracker.reset() to clear)
 * - No performance penalty when disabled
 */
export function setTrackerEnabled(enabled: boolean): void {
  setTrackerConfig({ enabled })
}

/**
 * Get maximum history size per component
 * Shorthand for tracking circular buffer size
 *
 * @returns Maximum number of render events to keep per component
 *
 * @example
 * const maxSize = getMaxHistorySize()
 * console.log(maxSize) // 50
 */
export function getMaxHistorySize(): number {
  return globalConfig.maxHistoryPerComponent
}

/**
 * Set maximum history size per component
 * Useful for memory-constrained environments
 *
 * @param size - New maximum history size per component
 *
 * @example
 * setMaxHistorySize(100) // Keep more history
 * setMaxHistorySize(10)  // Keep less history for low-memory
 *
 * @remarks
 * - Changing this mid-tracking may not immediately truncate existing history
 * - Existing components use new size for future renders
 * - Recommended to set this during app initialization
 */
export function setMaxHistorySize(size: number): void {
  if (size < 1) {
    console.warn('maxHistoryPerComponent must be at least 1, ignoring')
    return
  }
  setTrackerConfig({ maxHistoryPerComponent: size })
}

/**
 * Check if render timing is enabled
 * Timing uses React's unstable Profiler API for accurate measurements
 *
 * @returns true if timing is enabled, false otherwise
 *
 * @remarks
 * - Timing adds minimal overhead but requires React Profiler API
 * - Disabled by default for performance
 */
export function isTimingEnabled(): boolean {
  return globalConfig.enableTiming
}

/**
 * Enable or disable render timing measurements
 * Affects accuracy of duration field in render events
 *
 * @param enabled - true to enable timing, false to disable
 *
 * @example
 * setTimingEnabled(true) // Enable accurate timings
 */
export function setTimingEnabled(enabled: boolean): void {
  setTrackerConfig({ enableTiming: enabled })
}

/**
 * Reset configuration to default values
 * Useful for tests or resetting to initial state
 *
 * @remarks
 * - Re-reads environment variables for defaults
 * - Called automatically on module load
 */
export function resetConfig(): void {
  globalConfig = getDefaultConfig()
}

/**
 * Get a summary of the current configuration
 * Useful for debugging configuration issues
 *
 * @returns Formatted config summary
 *
 * @example
 * console.log(getConfigSummary())
 * // {
 * //   enabled: true,
 * //   maxHistoryPerComponent: 50,
 * //   enableTiming: false,
 * //   environment: 'development'
 * // }
 */
export function getConfigSummary(): Record<string, any> {
  return {
    enabled: globalConfig.enabled,
    maxHistoryPerComponent: globalConfig.maxHistoryPerComponent,
    enableTiming: globalConfig.enableTiming,
    environment: import.meta.env.MODE,
    isDevelopment: import.meta.env.MODE === 'development',
  }
}
