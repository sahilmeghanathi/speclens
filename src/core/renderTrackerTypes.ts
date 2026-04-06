/**
 * Core type definitions for the Render Tracker System
 * Used throughout the tracker for type safety and consistency
 */

/**
 * Reasons why a component might re-render
 */
export type RenderReason =
  | 'initial_render'
  | 'props_changed'
  | 'parent_rerender'
  | 'state_change'
  | 'context_change'
  | 'unknown'

/**
 * Confidence level in the detected re-render reason
 */
export type ReasonConfidence = 'high' | 'medium' | 'low'

/**
 * Single render event for a component
 * Contains all information about one particular render
 */
export interface RenderEvent {
  /** Unix timestamp in milliseconds when render occurred */
  timestamp: number

  /** Sequential counter for this component instance (1st, 2nd, 3rd render, etc.) */
  renderCount: number

  /** Time spent in the render phase (in milliseconds), if timing is enabled */
  duration?: number

  /** Props from previous render */
  prevProps: Record<string, any>

  /** Props from current render */
  currentProps: Record<string, any>

  /** List of prop keys that changed between renders */
  propChanges: string[]

  /** Detected reason for this re-render */
  reason: RenderReason

  /** Confidence level in the detected reason */
  reasonConfidence: ReasonConfidence
}

/**
 * Aggregated data for a single component instance
 * Lightweight summary without full history
 */
export interface ComponentRenderData {
  /** Spec node ID that uniquely identifies this component instance */
  nodeId: string

  /** Component type from the registry (e.g., 'Card', 'StatCard') */
  componentType: string

  /** Unix timestamp when this component first rendered */
  firstRenderTime: number

  /** Total number of times this component has rendered */
  totalRenders: number

  /** Average render duration in milliseconds (if timing enabled) */
  averageDuration?: number

  /** Unix timestamp of the most recent render */
  lastRenderTime: number

  /** Reason for the most recent render */
  lastReason: RenderReason
}

/**
 * Complete statistics for a component including history
 * Used for detailed inspection and analysis
 */
export interface RenderStats extends ComponentRenderData {
  /** Full history of render events for this component */
  history: RenderEvent[]

  /** List of prop keys that changed on the most recent render */
  lastPropChanges: string[]
}

/**
 * Result of comparing two prop objects
 * Identifies which props changed, added, or removed
 */
export interface PropComparisonResult {
  /** Keys where props changed (were present in both but different values) */
  changed: string[]

  /** Keys that are new in the current props */
  added: string[]

  /** Keys that were removed (in prev but not in current) */
  removed: string[]
}

/**
 * Configuration options for the RenderTracker system
 */
export interface RenderTrackerConfig {
  /** Whether tracking is currently enabled */
  enabled: boolean

  /** Maximum number of render events to keep per component (circular buffer) */
  maxHistoryPerComponent: number

  /** Whether to capture render duration timings (uses React Profiler API) */
  enableTiming: boolean
}

/**
 * System-wide statistics across all tracked components
 * Used for overall monitoring and debugging
 */
export interface SystemStats {
  /** Total number of unique components being tracked */
  totalComponentsTracked: number

  /** Total number of render events across all components */
  totalRenders: number

  /** Estimated memory usage in bytes (rough estimate) */
  memoryUsageEstimate?: number

  /** Timestamp when stats were collected */
  collectedAt: number
}
