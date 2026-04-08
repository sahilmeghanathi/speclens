/**
 * useDashboard Hook
 * Manages all Dashboard logic, state, and business functions
 */

import { useState, useEffect } from 'react'
import { useRenderTracker, useSystemStats, useAllComponentStats, useTrackerEnabled } from '../../hooks/useRenderTracker'
import { setTrackerEnabled } from '../../core/trackerConfig'

export type SortOption = 'renders' | 'name' | 'recent'
export type FilterOption = 'all' | 'high-render' | 'changed-props'

/**
 * Dashboard hook - encapsulates all logic and state
 */
export function useDashboard() {
  const tracker = useRenderTracker()
  const systemStats = useSystemStats()
  const allStats = useAllComponentStats()
  const isEnabledHook = useTrackerEnabled()
  
  const [sortBy, setSortBy] = useState<SortOption>('renders')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [isEnabled, setIsEnabled] = useState(isEnabledHook)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  // Watch for enabled state changes from the hook
  useEffect(() => {
    setIsEnabled(isEnabledHook)
  }, [isEnabledHook])

  // Update lastUpdate timestamp when stats change
  useEffect(() => {
    setLastUpdate(Date.now())
  }, [systemStats])

  // Sort and filter components
  const sortedComponents = Object.entries(allStats)
    .sort(([, a], [, b]) => {
      switch (sortBy) {
        case 'renders':
          return b.totalRenders - a.totalRenders
        case 'name':
          return a.nodeId.localeCompare(b.nodeId)
        case 'recent':
          return b.lastRenderTime - a.lastRenderTime
        default:
          return 0
      }
    })
    .filter(([, stats]) => {
      switch (filterBy) {
        case 'high-render':
          return stats.totalRenders > 3
        case 'changed-props':
          return stats.lastPropChanges.length > 0
        case 'all':
        default:
          return true
      }
    })

  const selectedStats = selectedComponent ? allStats[selectedComponent] : null
  const totalComponentsTracked = Object.keys(allStats).length
  const avgRendersPerComponent = totalComponentsTracked > 0 
    ? (systemStats.totalRenders / totalComponentsTracked).toFixed(1)
    : 0

  const handleToggleTracking = () => {
    const newState = !isEnabled
    setTrackerEnabled(newState)
    setIsEnabled(newState)
  }

  const handleReset = () => {
    if (confirm('Clear all tracking data?')) {
      tracker.reset()
      setSelectedComponent(null)
    }
  }

  return {
    // State
    sortBy,
    filterBy,
    selectedComponent,
    isEnabled,
    lastUpdate,
    // Data
    systemStats,
    sortedComponents,
    selectedStats,
    totalComponentsTracked,
    avgRendersPerComponent,
    // Handlers
    setSortBy,
    setFilterBy,
    setSelectedComponent,
    handleToggleTracking,
    handleReset,
  }
}
