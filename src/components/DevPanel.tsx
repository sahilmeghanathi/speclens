/**
 * DevPanel - Developer debugging panel for RenderTracker
 * Displays real-time render tracking information and statistics
 */

import React, { useState, useEffect } from 'react'
import { useRenderTracker } from '../hooks/useRenderTracker'
import { setTrackerEnabled } from '../core/trackerConfig'
import type { RenderStats } from '../core/renderTrackerTypes'
import './DevPanel.css'

interface DevPanelProps {
  /** Whether panel starts open (default: true) */
  initialOpen?: boolean
}

/**
 * DevPanel Component
 * Shows real-time rendering statistics and component tracking data
 *
 * Features:
 * - Toggle tracking on/off
 * - View all tracked components
 * - Click to see render details
 * - Memory usage estimation
 * - Live updates every 500ms
 *
 * @example
 * import { DevPanel } from '@/components'
 *
 * function App() {
 *   return (
 *     <>
 *       <Dashboard />
 *       <DevPanel initialOpen={true} />
 *     </>
 *   )
 * }
 */
export const DevPanel: React.FC<DevPanelProps> = ({ initialOpen = true }) => {
  const tracker = useRenderTracker()
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [isEnabled, setIsEnabled] = useState(tracker.isEnabled())
  const [stats, setStats] = useState<Record<string, RenderStats>|null>(null)
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

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: '400px',
    maxHeight: isOpen ? '600px' : '60px',
    backgroundColor: '#1a1a1a',
    color: '#e0e0e0',
    border: '1px solid #333',
    borderRadius: '0 0 0 8px',
    display: 'flex',
    flexDirection: 'column',
    fontSize: '12px',
    fontFamily: 'monospace',
    zIndex: 10000,
    transition: 'max-height 0.3s ease',
    overflow: 'hidden',
    boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.3)',
  }

  const headerStyle: React.CSSProperties = {
    padding: '8px 12px',
    backgroundColor: '#2a2a2a',
    borderBottom: isOpen ? '1px solid #333' : 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    minHeight: '44px',
  }

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 12px',
  }

  const statItemStyle: React.CSSProperties = {
    paddingBottom: '8px',
    marginBottom: '8px',
    borderBottom: '1px solid #333',
  }

  const componentListStyle: React.CSSProperties = {
    marginTop: '8px',
  }

  const componentItemStyle = (selected: boolean): React.CSSProperties => ({
    padding: '6px 8px',
    marginBottom: '4px',
    backgroundColor: selected ? '#333' : '#242424',
    border: selected ? '1px solid #4a9eff' : '1px solid #333',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    wordBreak: 'break-word',
  })

  const buttonStyle: React.CSSProperties = {
    padding: '4px 12px',
    backgroundColor: isEnabled ? '#4caf50' : '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    transition: 'opacity 0.2s',
  }

  const renderDetailsStyle: React.CSSProperties = {
    marginTop: '12px',
    padding: '8px',
    backgroundColor: '#252525',
    borderRadius: '4px',
    border: '1px solid #333',
  }

  if (!stats) {
    return null
  }

  const selectedStats = selectedNodeId ? stats[selectedNodeId] : null

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={headerStyle} onClick={() => setIsOpen(!isOpen)}>
        <div style={{ fontWeight: 'bold' }}>
          🎯 RenderTracker
          <span style={{ marginLeft: '8px', fontSize: '10px', opacity: 0.7 }}>
            {componentsTracked} components • {systemStats?.totalRenders || 0} renders
          </span>
        </div>
        <button style={buttonStyle} onClick={(e) => {
          e.stopPropagation()
          handleToggleTracking()
        }}>
          {isEnabled ? '⏸ ON' : '▶ OFF'}
        </button>
      </div>

      {/* Content */}
      {isOpen && (
        <div style={contentStyle}>
          {/* System Stats */}
          <div style={statItemStyle}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>📊 System Stats</div>
            <div style={{ opacity: 0.8 }}>
              Components: {componentsTracked}
            </div>
            <div style={{ opacity: 0.8 }}>
              Total Renders: {systemStats?.totalRenders || 0}
            </div>
            <div style={{ opacity: 0.8 }}>
              Memory: {systemStats?.memoryUsageEstimate ? `~${Math.round(systemStats.memoryUsageEstimate / 1024)}KB` : 'N/A'}
            </div>
          </div>

          {/* Component List */}
          {componentsTracked === 0 ? (
            <div style={{ textAlign: 'center', opacity: 0.5, padding: '20px 0' }}>
              No components tracked yet
            </div>
          ) : (
            <div style={componentListStyle}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>📦 Components</div>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {Object.entries(stats).map(([nodeId, componentStats]) => (
                  <div
                    key={nodeId}
                    style={componentItemStyle(selectedNodeId === nodeId)}
                    onClick={() => setSelectedNodeId(selectedNodeId === nodeId ? null : nodeId)}
                  >
                    <div style={{ fontWeight: 'bold' }}>{nodeId}</div>
                    <div style={{ opacity: 0.7, fontSize: '10px' }}>
                      {componentStats.totalRenders} renders • {componentStats.componentType}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details View */}
          {selectedStats && (
            <div style={renderDetailsStyle}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
                📋 Details: {selectedNodeId}
              </div>
              <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
                <div>Type: {selectedStats.componentType}</div>
                <div>Renders: {selectedStats.totalRenders}</div>
                <div>
                  First Render: {new Date(selectedStats.firstRenderTime).toLocaleTimeString()}
                </div>
                <div>
                  Last Render: {new Date(selectedStats.lastRenderTime).toLocaleTimeString()}
                </div>
                <div>Last Reason: <span style={{ color: '#4caf50' }}>{selectedStats.lastReason}</span></div>
                {selectedStats.lastPropChanges.length > 0 && (
                  <div>
                    Changed Props:{' '}
                    <span style={{ color: '#ff9800' }}>{selectedStats.lastPropChanges.join(', ')}</span>
                  </div>
                )}
                {selectedStats.history.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Recent History:</div>
                    {selectedStats.history.slice(-3).map((event, idx) => (
                      <div key={idx} style={{ opacity: 0.7, fontSize: '10px', marginBottom: '4px' }}>
                        #{event.renderCount}: {event.reason}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div style={{ marginTop: '12px', fontSize: '10px', opacity: 0.5, textAlign: 'center' }}>
            Updated: {new Date(refreshTime).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  )
}
