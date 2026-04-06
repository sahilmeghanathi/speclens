/**
 * withRenderTracking - Higher Order Component for automatic render tracking
 * Wraps any React component to automatically track its render events
 */

import React, { useEffect, useRef } from 'react'
import { tracker } from './renderTracker'

/**
 * Higher-Order Component that adds render tracking to any component
 * Automatically captures props and calls tracker.trackRender() on each render
 *
 * @param Component - The component to wrap and track
 * @param nodeId - Unique identifier for this component instance
 * @returns Wrapped component with automatic render tracking
 *
 * @example
 * const Card = ({ title, children }) => (
 *   <div>
 *     <h2>{title}</h2>
 *     {children}
 *   </div>
 * )
 *
 * // Wrap the component
 * const TrackedCard = withRenderTracking(Card, 'my-card-id')
 *
 * // Use it normally
 * <TrackedCard title="Hello" /> // Automatically tracked!
 *
 * @remarks
 * - Transparent to wrapped component (props passed through unchanged)
 * - Children are passed through correctly
 * - Compatible with all functional component patterns
 * - Minimal performance overhead
 */
export function withRenderTracking<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  nodeId: string,
): React.ComponentType<P> {
  /**
   * The wrapper component that performs tracking
   */
  const TrackedComponent: React.FC<P> = (props: P) => {
    /**
     * Store previous props to detect changes
     * Using useRef so it survives across renders
     */
    const prevPropsRef = useRef<Partial<P> | undefined>(undefined)

    /**
     * Track this render on every render
     * useEffect with no dependencies means it runs after every render
     */
    useEffect(() => {
      if (tracker.isEnabled()) {
        // Track render with previous and current props
        tracker.trackRender(nodeId, prevPropsRef.current as any, props)
      }

      // Update the ref for next render
      prevPropsRef.current = props
    })

    /**
     * Render the wrapped component with all original props
     * Then render fallback if component type isn't valid
     */
    if (!Component) {
      return <div>Invalid component provided to withRenderTracking</div>
    }

    return <Component {...props} />
  }

  /**
   * Set a helpful display name for debugging
   * Shows up in React DevTools
   */
  const displayName = Component.displayName || Component.name || 'Component'
  TrackedComponent.displayName = `WithRenderTracking(${displayName})`

  return TrackedComponent as React.ComponentType<P>
}

/**
 * Batch apply render tracking to multiple components
 * Useful for wrapping all components in a registry at once
 *
 * @param components - Object with component type name as key, component as value
 * @param nodeIdPrefix - Prefix for generated node IDs
 * @returns New object with tracked versions of components
 *
 * @example
 * const registry = {
 *   Card: CardComponent,
 *   StatCard: StatCardComponent,
 *   Grid: GridComponent,
 * }
 *
 * const trackedRegistry = withRenderTrackingBatch(registry, 'comp-')
 * // Returns:
 * // {
 * //   Card: wrappedCard,
 * //   StatCard: wrappedStatCard,
 * //   Grid: wrappedGrid,
 * // }
 *
 * @remarks
 * - Each component gets a unique nodeId based on prefix
 * - Useful for registry pattern where component type is known
 * - Not as flexible as wrapping at render time with node-specific IDs
 */
export function withRenderTrackingBatch<T extends Record<string, React.ComponentType<any>>>(
  components: T,
  nodeIdPrefix = 'tracked-',
): T {
  const tracked: Record<string, any> = {}

  for (const [key, Component] of Object.entries(components)) {
    // Create a unique node ID for this component type
    const nodeId = `${nodeIdPrefix}${key}`
    tracked[key] = withRenderTracking(Component, nodeId)
  }

  return tracked as T
}
