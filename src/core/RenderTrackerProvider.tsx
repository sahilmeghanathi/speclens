/**
 * RenderTrackerProvider - React Context Provider for RenderTracker
 * Provides tracker singleton to all child components via Context
 */

import React, { useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import { tracker } from './renderTracker'
import { setTrackerConfig } from './trackerConfig'
import type { RenderTracker } from './renderTracker'
import type { RenderTrackerConfig } from './renderTrackerTypes'

/**
 * React Context for RenderTracker
 * Default value is the tracker singleton
 */
const RenderTrackerContext = React.createContext<RenderTracker>(tracker)

/**
 * Props for RenderTrackerProvider component
 */
interface RenderTrackerProviderProps {
  /** Child components to wrap */
  children: ReactNode

  /** Whether tracking should be enabled (default: development only) */
  enabled?: boolean

  /** Maximum render history to keep per component (default: 50) */
  maxHistoryPerComponent?: number

  /** Whether to enable render timing (default: false) */
  enableTiming?: boolean
}

/**
 * Provider component for RenderTracker
 * Wraps the app to provide tracker context to all children
 *
 * @param props - Configuration options for the tracker
 * @returns Provider component
 *
 * @example
 * import { RenderTrackerProvider } from './core/RenderTrackerProvider'
 *
 * export function App() {
 *   return (
 *     <RenderTrackerProvider enabled={true} maxHistoryPerComponent={100}>
 *       <Dashboard />
 *       <DevPanel />
 *     </RenderTrackerProvider>
 *   )
 * }
 *
 * @remarks
 * - Must wrap your entire app tree (or at least the components you want to track)
 * - Applies configuration to tracker on mount
 * - Configuration props override environment variables
 * - Tracker singleton is provided to entire tree via Context
 */
export function RenderTrackerProvider({
  children,
  enabled,
  maxHistoryPerComponent,
  enableTiming,
}: RenderTrackerProviderProps) {
  /**
   * Apply configuration on mount
   * Runs once when provider is first rendered
   */
  useEffect(() => {
    const config: Partial<RenderTrackerConfig> = {}

    if (enabled !== undefined) {
      config.enabled = enabled
    }

    if (maxHistoryPerComponent !== undefined) {
      config.maxHistoryPerComponent = maxHistoryPerComponent
    }

    if (enableTiming !== undefined) {
      config.enableTiming = enableTiming
    }

    // Apply config if anything was specified
    if (Object.keys(config).length > 0) {
      setTrackerConfig(config)
    }
  }, [enabled, maxHistoryPerComponent, enableTiming])

  return (
    <RenderTrackerContext.Provider value={tracker}>
      {children}
    </RenderTrackerContext.Provider>
  )
}

/**
 * Hook to access RenderTracker from Context
 * Must be called from within a RenderTrackerProvider tree
 *
 * @returns The tracker instance
 *
 * @example
 * function MyComponent() {
 *   const tracker = useRenderTrackerContext()
 *   return <div>{tracker.getAllStats().length} components tracked</div>
 * }
 *
 * @throws Error if used outside RenderTrackerProvider
 *
 * @remarks
 * - Returns the same tracker as useRenderTracker() hook
 * - Using Context allows for future dependency injection improvements
 * - Currently both hooks return the same singleton instance
 */
export function useRenderTrackerContext(): RenderTracker {
  const context = useContext(RenderTrackerContext)

  if (!context) {
    throw new Error(
      'useRenderTrackerContext must be used within a RenderTrackerProvider. ' +
        'Make sure your component tree is wrapped with <RenderTrackerProvider>',
    )
  }

  return context
}

/**
 * Export context for advanced use cases
 * Usually not needed - use hook instead
 */
export { RenderTrackerContext }
