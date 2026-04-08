/**
 * Render Tracking Dashboard
 * Beautiful UI displaying real-time component render statistics
 */

import React, { useState, useEffect } from 'react'
import { useRenderTracker, useSystemStats, useAllComponentStats, useTrackerEnabled } from '../hooks/useRenderTracker'
import { setTrackerEnabled } from '../core/trackerConfig'
import { formatRenderReason, formatConfidence } from '../core/renderTrackerUtils'
import './Dashboard.css'

type SortOption = 'renders' | 'name' | 'recent'
type FilterOption = 'all' | 'high-render' | 'changed-props'

/**
 * Main Dashboard Component
 * Displays comprehensive render tracking statistics
 */
export const Dashboard: React.FC = () => {
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

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-title">
          <h1>📊 Render Tracker Dashboard</h1>
          <p className="header-subtitle">Real-time component render analytics</p>
        </div>
        <div className="header-controls">
          <button
            className={`btn btn-${isEnabled ? 'enabled' : 'disabled'}`}
            onClick={handleToggleTracking}
          >
            {isEnabled ? '⏸ Tracking ON' : '▶ Tracking OFF'}
          </button>
          <button className="btn btn-reset" onClick={handleReset}>
            🔄 Reset
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        
        {/* Stats Cards */}
        <section className="stats-cards">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <div className="stat-label">Components Tracked</div>
              <div className="stat-value">{totalComponentsTracked}</div>
            </div>
          </div>

          <div className="stat-card stat-card-secondary">
            <div className="stat-icon">🔄</div>
            <div className="stat-info">
              <div className="stat-label">Total Renders</div>
              <div className="stat-value">{systemStats.totalRenders}</div>
            </div>
          </div>

          <div className="stat-card stat-card-tertiary">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <div className="stat-label">Avg per Component</div>
              <div className="stat-value">{avgRendersPerComponent}</div>
            </div>
          </div>

          <div className="stat-card stat-card-quaternary">
            <div className="stat-icon">💾</div>
            <div className="stat-info">
              <div className="stat-label">Memory Used</div>
              <div className="stat-value">
                {systemStats.memoryUsageEstimate 
                  ? `${Math.round(systemStats.memoryUsageEstimate / 1024)}KB`
                  : 'N/A'
                }
              </div>
            </div>
          </div>

        </section>

        {/* Main Content */}
        <div className="dashboard-main">
          {/* Components List */}
          <section className="components-section">
            <div className="section-header">
              <h2>📋 Tracked Components</h2>
              <div className="section-controls">
                <select 
                  className="control-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="renders">Sort by Renders</option>
                  <option value="name">Sort by Name</option>
                  <option value="recent">Sort by Recent</option>
                </select>

                <select 
                  className="control-select"
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                >
                  <option value="all">All Components</option>
                  <option value="high-render">High Render Count</option>
                  <option value="changed-props">With Prop Changes</option>
                </select>
              </div>
            </div>

            {sortedComponents.length === 0 ? (
              <div className="empty-state">
                <p>No components tracked yet</p>
                <small>Components will appear here as they render</small>
              </div>
            ) : (
              <div className="components-grid">
                {sortedComponents.map(([nodeId, stats]) => (
                  <div
                    key={nodeId}
                    className={`component-card ${selectedComponent === nodeId ? 'selected' : ''}`}
                    onClick={() => setSelectedComponent(selectedComponent === nodeId ? null : nodeId)}
                  >
                    <div className="component-header">
                      <div className="component-name">{nodeId}</div>
                      <div className="component-type">{stats.componentType}</div>
                    </div>

                    <div className="component-stats">
                      <div className="stat-row">
                        <span className="stat-label">Renders:</span>
                        <span className="stat-badge">{stats.totalRenders}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Reason:</span>
                        <span className="stat-badge badge-reason">
                          {formatRenderReason(stats.lastReason)}
                        </span>
                      </div>
                      {stats.lastPropChanges.length > 0 && (
                        <div className="stat-row">
                          <span className="stat-label">Props:</span>
                          <span className="stat-badge badge-props">
                            {stats.lastPropChanges.length}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="component-footer">
                      <small>
                        {new Date(stats.lastRenderTime).toLocaleTimeString()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Component Details */}
          {selectedStats && selectedComponent && (
            <section className="details-section">
              <div className="section-header">
                <h2>🔍 Component Details</h2>
                <button
                  className="btn btn-sm"
                  onClick={() => setSelectedComponent(null)}
                >
                  ✕
                </button>
              </div>

              <div className="details-content">
                {/* Overview */}
                <div className="detail-group">
                  <h3>📌 Overview</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Component ID</label>
                      <div className="detail-value">{selectedComponent}</div>
                    </div>
                    <div className="detail-item">
                      <label>Component Type</label>
                      <div className="detail-value">{selectedStats.componentType}</div>
                    </div>
                    <div className="detail-item">
                      <label>Total Renders</label>
                      <div className="detail-value highlight">{selectedStats.totalRenders}</div>
                    </div>
                    <div className="detail-item">
                      <label>First Render</label>
                      <div className="detail-value">
                        {new Date(selectedStats.firstRenderTime).toLocaleString()}
                      </div>
                    </div>
                    <div className="detail-item">
                      <label>Last Render</label>
                      <div className="detail-value">
                        {new Date(selectedStats.lastRenderTime).toLocaleString()}
                      </div>
                    </div>
                    <div className="detail-item">
                      <label>Duration</label>
                      <div className="detail-value">
                        {((selectedStats.lastRenderTime - selectedStats.firstRenderTime) / 1000).toFixed(1)}s
                      </div>
                    </div> 
                  </div>
                </div>

                {/* Last Render Info */}
                <div className="detail-group">
                  <h3>🎯 Last Render</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Re-render Reason</label>
                      <div className="detail-value">
                        {formatRenderReason(selectedStats.lastReason)}
                      </div>
                    </div>
                    <div className="detail-item">
                      <label>Reason Confidence</label>
                      <div className="detail-value">
                        {selectedStats.history.length > 0 
                          ? formatConfidence(selectedStats.history[selectedStats.history.length - 1].reasonConfidence)
                          : 'N/A'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Changed Props */}
                {selectedStats.lastPropChanges.length > 0 && (
                  <div className="detail-group">
                    <h3>🔄 Changed Props (Last Render)</h3>
                    <div className="props-list">
                      {selectedStats.lastPropChanges.map((prop) => (
                        <div key={prop} className="prop-item">
                          <span className="prop-name">{prop}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Render History */}
                <div className="detail-group">
                  <h3>📜 Recent Render History</h3>
                  <div className="history-list">
                    {selectedStats.history.slice(-5).reverse().map((event, idx) => (
                      <div key={idx} className="history-item">
                        <div className="history-number">#{event.renderCount}</div>
                        <div className="history-info">
                          <div className="history-reason">
                            {formatRenderReason(event.reason)}
                          </div>
                          <div className="history-meta">
                            {event.propChanges.length > 0 && (
                              <span className="history-props">
                                Props: {event.propChanges.join(', ')}
                              </span>
                            )}
                            <span className="history-time">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
          
        </div>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-info">
          Last updated: {new Date(lastUpdate).toLocaleTimeString()}
        </div>
        <div className="footer-info">
          Tracking {isEnabled ? '🟢 enabled' : '🔴 disabled'}
        </div>
      </footer>
    </div>
  )
}
