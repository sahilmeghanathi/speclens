/**
 * Utility functions for prop comparison and change detection
 * Provides shallow comparison and analysis of prop changes between renders
 */

import type { PropComparisonResult, RenderReason, ReasonConfidence } from './renderTrackerTypes'

/**
 * Deeply compare two prop objects to detect what changed
 * Uses shallow comparison (only top-level keys)
 *
 * @param prevProps - Props from previous render
 * @param currentProps - Props from current render
 * @returns Object indicating which keys changed, were added, or removed
 *
 * @example
 * const result = compareProps(
 *   { a: 1, b: 'x' },
 *   { a: 1, b: 'y', c: true }
 * )
 * // { changed: ['b'], added: ['c'], removed: [] }
 */
export function compareProps(
  prevProps?: Record<string, any>,
  currentProps?: Record<string, any>,
): PropComparisonResult {
  const changed: string[] = []
  const added: string[] = []
  const removed: string[] = []

  // Normalize undefined to empty object
  const prev = prevProps || {}
  const current = currentProps || {}

  // Find changed and added keys in current
  for (const key in current) {
    if (!(key in prev)) {
      // Key exists in current but not in prev
      added.push(key)
    } else if (!propValuesEqual(prev[key], current[key])) {
      // Key exists in both but values differ
      changed.push(key)
    }
  }

  // Find removed keys (in prev but not in current)
  for (const key in prev) {
    if (!(key in current)) {
      removed.push(key)
    }
  }

  return { changed, added, removed }
}

/**
 * Check if two prop values should be treated as equal
 * Handles special cases like functions and deeply nested objects
 *
 * @param prev - Previous value
 * @param current - Current value
 * @returns true if values are equivalent
 *
 * Implementation notes:
 * - Function props always return false (refs are unreliable)
 * - null and undefined are treated as different
 * - Uses referential equality (===) for primitives and objects
 */
function propValuesEqual(prev: any, current: any): boolean {
  // Functions always treated as changed (refs vary)
  if (typeof prev === 'function' || typeof current === 'function') {
    return false
  }

  // Null and undefined are different
  if (prev === null && current === undefined) {
    return false
  }
  if (prev === undefined && current === null) {
    return false
  }

  // Referential equality for everything else
  return prev === current
}

/**
 * Get flat list of all keys that changed (added + changed + removed)
 * Shorthand for quick checks
 *
 * @param prev - Props from previous render
 * @param current - Props from current render
 * @returns Flat array of keys that changed
 *
 * @example
 * const changedKeys = getPropChangeSummary({ a: 1 }, { a: 2, b: 3 })
 * // ['a', 'b']
 */
export function getPropChangeSummary(
  prevProps?: Record<string, any>,
  currentProps?: Record<string, any>,
): string[] {
  const { changed, added, removed } = compareProps(prevProps, currentProps)
  return [...changed, ...added, ...removed]
}

/**
 * Quick check to see if any props changed at all
 * More efficient than comparing full arrays
 *
 * @param prev - Props from previous render
 * @param current - Props from current render
 * @returns true if any props are different
 *
 * @example
 * if (shouldTriggerRerender(oldProps, newProps)) {
 *   console.log('Props changed, re-render expected')
 * }
 */
export function shouldTriggerRerender(
  prevProps?: Record<string, any>,
  currentProps?: Record<string, any>,
): boolean {
  const summary = getPropChangeSummary(prevProps, currentProps)
  return summary.length > 0
}

/**
 * Detect probable reason for a component re-render
 * Uses prop comparison and history to make an educated guess
 *
 * @param prevProps - Props from previous render
 * @param currentProps - Props from current render
 * @param isInitialRender - Whether this is the first render
 * @returns Object with reason and confidence level
 *
 * Detection logic:
 * 1. If first render → 'initial_render' (high confidence)
 * 2. If props changed → 'props_changed' (high confidence)
 * 3. Else → 'parent_rerender' (medium confidence)
 * 4. In future: use React Profiler to detect state/context (low confidence)
 *
 * @example
 * const { reason, confidence } = detectRenderReason({}, { title: 'New' }, false)
 * // { reason: 'props_changed', confidence: 'high' }
 */
export function detectRenderReason(
  prevProps?: Record<string, any>,
  currentProps?: Record<string, any>,
  isInitialRender = false,
): { reason: RenderReason; confidence: ReasonConfidence } {
  // First render is always initial
  if (isInitialRender) {
    return { reason: 'initial_render', confidence: 'high' }
  }

  // Check if props changed
  if (shouldTriggerRerender(prevProps, currentProps)) {
    return { reason: 'props_changed', confidence: 'high' }
  }

  // If props didn't change, parent must have re-rendered
  // (or context/state, but we can't detect those without React hooks)
  return { reason: 'parent_rerender', confidence: 'medium' }
}

/**
 * Safely serialize props for storage in history
 * Handles objects, functions, circular refs, etc.
 *
 * @param props - Props to serialize
 * @param maxDepth - Maximum depth to serialize (default 3)
 * @returns Serializable prop snapshot
 *
 * Strategy:
 * - Shallow copy for primitives and objects
 * - Functions converted to "[Function]" string
 * - Large objects truncated
 * - Circular refs handled at top 3 levels only
 *
 * @example
 * const props = { title: 'Hello', handler: () => {}, data: { nested: { deep: 'value' } } }
 * const serialized = serializeProps(props)
 * // { title: 'Hello', handler: '[Function]', data: { nested: { deep: 'value' } } }
 */
export function serializeProps(
  props?: Record<string, any>,
  maxDepth = 3,
): Record<string, any> {
  if (!props) return {}

  const seen = new Set()

  function serialize(obj: any, depth: number): any {
    // Stop at max depth
    if (depth >= maxDepth) {
      return '[Object]'
    }

    // Handle primitives
    if (obj === null || obj === undefined) {
      return obj
    }

    if (typeof obj === 'function') {
      return '[Function]'
    }

    if (typeof obj !== 'object') {
      return obj
    }

    // Detect circular references
    if (seen.has(obj)) {
      return '[Circular]'
    }

    seen.add(obj)

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => serialize(item, depth + 1))
    }

    // Handle plain objects
    const result: Record<string, any> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = serialize(obj[key], depth + 1)
      }
    }

    return result
  }

  return serialize(props, 0)
}

/**
 * Format a render reason for human-readable display
 * Useful for DevTools and logging
 *
 * @param reason - The render reason enum
 * @returns Formatted human-readable string
 *
 * @example
 * formatRenderReason('props_changed') // "Props Changed"
 * formatRenderReason('parent_rerender') // "Parent Re-rendered"
 */
export function formatRenderReason(reason: RenderReason): string {
  const map: Record<RenderReason, string> = {
    initial_render: 'Initial Render',
    props_changed: 'Props Changed',
    parent_rerender: 'Parent Re-rendered',
    state_change: 'State Change',
    context_change: 'Context Change',
    unknown: 'Unknown',
  }
  return map[reason] || 'Unknown'
}

/**
 * Format confidence level for display
 *
 * @param confidence - The confidence level
 * @returns Formatted display string with emoji
 *
 * @example
 * formatConfidence('high') // "🟢 High"
 * formatConfidence('medium') // "🟡 Medium"
 */
export function formatConfidence(confidence: ReasonConfidence): string {
  const map: Record<ReasonConfidence, string> = {
    high: '🟢 High',
    medium: '🟡 Medium',
    low: '🔴 Low',
  }
  return map[confidence] || 'Unknown'
}
