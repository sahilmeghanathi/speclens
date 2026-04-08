/**
 * useDevPanel Hook
 * Manages all DevPanel logic, state, and business functions
 */

import { useState, useEffect } from 'react'
import { useRenderTracker } from '../../hooks/useRenderTracker'
import { setTrackerEnabled } from '../../core/trackerConfig'
import type { RenderStats } from '../../core/renderTrackerTypes'

/**
 * DevPanel hook - encapsulates all logic and state
 */
export function useDevPanel(initialOpen = true) {
  const tracker = useRenderTracker()
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [isEnabled, setIsEnabled] = useState(tracker.isEnabled())
  const [stats, setStats] = useState<Record<string, RenderStats> | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [refreshTime, setRefreshTime] = useState<number>(Date.now())

  // Update stats every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(tracker.getAllStats())
      setIsEnabled(tracker.isEnabled())
      setRefreshTime(Date.now())
    }, 500)

    return () => clearInterval(interval)
  }, [tracker])

  // Initial stats load
  useEffect(() => {
    setStats(tracker.getAllStats())
  }, [tracker])

  const handleToggleTracking = () => {
    const newState = !isEnabled
    setTrackerEnabled(newState)
    setIsEnabled(newState)
  }

  const systemStats = stats ? tracker.getSystemStats() : null
  const componentsTracked = stats ? Object.keys(stats).length : 0
  const selectedStats = selectedNodeId ? stats?.[selectedNodeId] : null

  return {
    // State
    isOpen,
    isEnabled,
    stats,
    selectedNodeId,
    refreshTime,
    // Computed
    systemStats,
    componentsTracked,
    selectedStats,
    // Handlers
    setIsOpen,
    handleToggleTracking,
    setSelectedNodeId,
  }
}
