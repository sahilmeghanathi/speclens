# RenderTracker System - Documentation

**A spec-driven render tracking system for SpecLens**

Deep insights into component rendering behavior, performance, and debugging.

---

## 📖 Table of Contents

1. [Quick Start](#quick-start)
2. [Overview](#overview)
3. [Installation & Setup](#installation--setup)
4. [Usage Guide](#usage-guide)
5. [API Reference](#api-reference)
6. [DevPanel](#devpanel)
7. [Performance](#performance)
8. [Configuration](#configuration)
9. [Troubleshooting](#troubleshooting)
10. [Examples](#examples)

---

## Quick Start

### Enable Tracking on App

```tsx
import { RenderTrackerProvider } from '@/core/RenderTrackerProvider'

function App() {
  return (
    <RenderTrackerProvider enabled={true}>
      <Dashboard />
    </RenderTrackerProvider>
  )
}
```

### View Tracking Data

```tsx
import { useRenderTracker } from '@/hooks/useRenderTracker'

function Stats() {
  const tracker = useRenderTracker()
  const stats = tracker.getAllStats()

  return (
    <div>
      {Object.entries(stats).map(([nodeId, data]) => (
        <div key={nodeId}>
          {nodeId}: {data.totalRenders} renders
        </div>
      ))}
    </div>
  )
}
```

### Add DevPanel

```tsx
import { DevPanel } from '@/components'

function App() {
  return (
    <>
      <Dashboard />
      <DevPanel initialOpen={true} />
    </>
  )
}
```

---

## Overview

### What is RenderTracker?

RenderTracker automatically monitors component renders in your SpecLens app:

- **Tracks** how many times each component renders
- **Detects** why components re-render (props changed, parent updated, etc.)
- **Records** prop changes between renders
- **Measures** render performance (optional timing)
- **Provides** real-time debugging via DevPanel

### Key Features

✅ **Zero-Overhead When Disabled** - No performance impact in production  
✅ **Spec-Integrated** - Works automatically with dynamically rendered specs  
✅ **Non-Intrusive** - No code changes needed in user components  
✅ **Full History** - Circular buffer keeps last 50 renders per component  
✅ **Prop Analysis** - Automatically detects which props changed  
✅ **Re-render Reasons** - Identifies why each render happened  
✅ **Global Access** - Query tracking data from any component  
✅ **Beautiful DevPanel** - Visual dashboard for debugging  

### Architecture

```
┌─────────────────────────────────────────────────────┐
│  App Component                                      │
│  ├─ RenderTrackerProvider (wraps entire tree)      │
│  │  └─ Dashboard                                   │
│  │     └─ nested components (auto-tracked)         │
│  └─ DevPanel (optional UI for stats)               │
└─────────────────────────────────────────────────────┘

      ↓ (automatic wrapping)

┌─────────────────────────────────────────────────────┐
│  Dynamic Spec Rendering                             │
│  1. Renderer gets component from registry            │
│  2. Wraps with withRenderTracking HOC               │
│  3. HOC tracks every render to RenderTracker        │
│  4. Data available via hooks or direct API          │
└─────────────────────────────────────────────────────┘
```

---

## Installation & Setup

### 1. Already Included

RenderTracker is built into SpecLens. No installation needed!

### 2. Enable in App.tsx

```tsx
import { RenderTrackerProvider } from './core/RenderTrackerProvider'

export default function App() {
  return (
    <RenderTrackerProvider 
      enabled={true}
      maxHistoryPerComponent={50}
      enableTiming={false}
    >
      {/* Your app here */}
    </RenderTrackerProvider>
  )
}
```

### 3. Optional: Add DevPanel

```tsx
import { DevPanel } from '@/components'

export default function App() {
  return (
    <RenderTrackerProvider enabled={true}>
      {/* Your app */}
      <DevPanel initialOpen={true} />
    </RenderTrackerProvider>
  )
}
```

---

## Usage Guide

### Getting Stats

#### All Components

```tsx
import { useRenderTracker } from '@/hooks/useRenderTracker'

function Dashboard() {
  const tracker = useRenderTracker()
  const allStats = tracker.getAllStats()

  return (
    <div>
      <h2>{Object.keys(allStats).length} components tracked</h2>
      <ul>
        {Object.entries(allStats).map(([nodeId, stats]) => (
          <li key={nodeId}>
            {nodeId}: {stats.totalRenders} renders
          </li>
        ))}
      </ul>
    </div>
  )
}
```

#### Specific Component

```tsx
import { useComponentStats } from '@/hooks/useRenderTracker'

function ComponentStatus({ nodeId }) {
  const stats = useComponentStats(nodeId)

  if (!stats) return <div>Not tracked</div>

  return (
    <div>
      <p>Renders: {stats.totalRenders}</p>
      <p>Type: {stats.componentType}</p>
      <p>Last Render: {new Date(stats.lastRenderTime).toLocaleTimeString()}</p>
      <p>Reason: {stats.lastReason}</p>
    </div>
  )
}
```

### Checking Prop Changes

```tsx
import { usePropChanges } from '@/hooks/useRenderTracker'

function PropMonitor({ nodeId }) {
  const changes = usePropChanges(nodeId)

  if (!changes || changes.length === 0) {
    return <p>No prop changes</p>
  }

  return (
    <p>
      Changed props: <strong>{changes.join(', ')}</strong>
    </p>
  )
}
```

### Accessing Render History

```tsx
import { useComponentStats } from '@/hooks/useRenderTracker'

function RenderHistory({ nodeId }) {
  const stats = useComponentStats(nodeId)

  if (!stats) return null

  return (
    <div>
      <h3>Last 3 Renders</h3>
      <ol>
        {stats.history.slice(-3).map((event, idx) => (
          <li key={idx}>
            Render #{event.renderCount}: {event.reason}
            {event.propChanges.length > 0 && (
              <span> - props: {event.propChanges.join(', ')}</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
```

### Enabling/Disabling Tracking

```tsx
import { useRenderTracker } from '@/hooks/useRenderTracker'
import { setTrackerEnabled } from '@/core/trackerConfig'

function TrackingControl() {
  const tracker = useRenderTracker()
  const isEnabled = tracker.isEnabled()

  return (
    <button
      onClick={() => setTrackerEnabled(!isEnabled)}
      style={{ backgroundColor: isEnabled ? 'green' : 'red' }}
    >
      {isEnabled ? 'Tracking ON' : 'Tracking OFF'}
    </button>
  )
}
```

---

## API Reference

### Core API

#### `tracker.trackRender(nodeId, prevProps, currentProps)`

Called automatically by withRenderTracking HOC.

```tsx
tracker.trackRender('my-card-1', oldProps, newProps)
```

#### `tracker.getComponentStats(nodeId): RenderStats | null`

Get full stats including history for one component.

```tsx
const stats = tracker.getComponentStats('card-1')
// {
//   nodeId: 'card-1',
//   componentType: 'Card',
//   totalRenders: 5,
//   lastReason: 'props_changed',
//   history: [...],
//   lastPropChanges: ['title']
// }
```

#### `tracker.getAllStats(): Record<string, RenderStats>`

Get stats for all tracked components.

```tsx
const allStats = tracker.getAllStats()
for (const [nodeId, stats] of Object.entries(allStats)) {
  console.log(`${nodeId}: ${stats.totalRenders} renders`)
}
```

#### `tracker.getPropChanges(nodeId): string[] | null`

Get list of props that changed on last render.

```tsx
const changes = tracker.getPropChanges('card-1')
// ['title', 'onClick']
```

#### `tracker.getSystemStats(): SystemStats`

Get high-level overview of entire tracking system.

```tsx
const sysStats = tracker.getSystemStats()
// {
//   totalComponentsTracked: 12,
//   totalRenders: 145,
//   memoryUsageEstimate: 81920,
//   collectedAt: 1712400123456
// }
```

#### `tracker.reset()`

Clear all tracking data.

```tsx
tracker.reset() // Start fresh
```

#### `tracker.enable(enabled: boolean)`

Enable/disable tracking (deprecated - use setTrackerEnabled instead).

```tsx
tracker.enable(false) // Disable tracking
```

### Hook API

#### `useRenderTracker()`

Get the tracker singleton.

```tsx
const tracker = useRenderTracker()
```

#### `useComponentStats(nodeId)`

Get full stats for one component.

```tsx
const stats = useComponentStats('my-button')
```

#### `useComponentData(nodeId)`

Get lightweight stats without history.

```tsx
const data = useComponentData('my-button')
```

#### `usePropChanges(nodeId)`

Get prop changes from last render.

```tsx
const changes = usePropChanges('my-button')
```

#### `useAllComponentStats()`

Get stats for all components.

```tsx
const allStats = useAllComponentStats()
```

#### `useSystemStats()`

Get system-wide stats.

```tsx
const { totalComponentsTracked, totalRenders } = useSystemStats()
```

### Configuration API

#### `setTrackerConfig(partial)`

Set configuration options.

```tsx
import { setTrackerConfig } from '@/core/trackerConfig'

setTrackerConfig({
  enabled: true,
  maxHistoryPerComponent: 100,
  enableTiming: true
})
```

#### `setTrackerEnabled(enabled)`

Enable/disable tracking at runtime.

```tsx
import { setTrackerEnabled } from '@/core/trackerConfig'

setTrackerEnabled(false)
```

#### `getTrackerConfig()`

Get current configuration.

```tsx
import { getTrackerConfig } from '@/core/trackerConfig'

const config = getTrackerConfig()
```

---

## DevPanel

### What is DevPanel?

Visual panel for real-time render tracking and debugging.

### Features

- 📊 **System Overview** - Total components and renders
- 📦 **Component List** - All tracked components with quick stats
- 🔍 **Detail View** - Click component to see full render history
- 🎯 **Re-render Reasons** - Why each component rendered
- 🔄 **Live Updates** - Refreshes every 500ms
- 🎛️ **Toggle Control** - Enable/disable tracking on the fly
- 💾 **Memory Metrics** - Estimated memory usage

### Usage

```tsx
import { DevPanel } from '@/components'

function App() {
  return (
    <>
      <Dashboard />
      <DevPanel initialOpen={true} />
    </>
  )
}
```

### Reading the Panel

```
┌─────────────────────────────────────────────────┐
│ 🎯 RenderTracker         [⏸ ON] [⏸ OFF]       │
├─────────────────────────────────────────────────┤
│ 📊 System Stats                                 │
│    Components: 5                                │
│    Total Renders: 127                           │
│    Memory: ~45KB                                │
│                                                 │
│ 📦 Components                                   │
│    ┌───────────────────────────────────────┐   │
│    │ dashboard-root       5 renders  | Card │   │
│    │ stat-card-1          3 renders  | S... │   │
│    │ grid-layout          2 renders  | G... │   │
│    └───────────────────────────────────────┘   │
│                                                 │
│ 📋 Details: stat-card-1                        │
│    Type: StatCard                              │
│    Renders: 3                                  │
│    Last Reason: Props Changed                  │
│    Changed Props: value, label                 │
│    Last Render: 14:32:45                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Performance

### Target Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Overhead per render | < 2ms | ✅ |
| Memory per component | < 100KB | ✅ |
| Query time | < 1ms | ✅ |

### Benchmarking

Run in browser console:

```js
// Quick benchmark
RenderTrackerBench.benchmark(100)

// Monitor for 30 seconds
await RenderTrackerBench.monitor(5000, 30000)
```

### Disabling in Production

```tsx
// Environment-based
const enabled = import.meta.env.MODE === 'development'

<RenderTrackerProvider enabled={enabled}>
  {/* app */}
</RenderTrackerProvider>
```

Or via env var:

```bash
VITE_TRACKER_ENABLED=false npm run build
```

### Memory Usage

- ~100 bytes per render event (in history)
- History limited to 50 renders per component (configurable)
- ~5KB per component at full history

---

## Configuration

### Environment Variables

```bash
# Enable/disable tracking (default: true in dev, false in prod)
VITE_TRACKER_ENABLED=true

# Max render history per component (default: 50)
VITE_TRACKER_MAX_HISTORY=100

# Enable render timing (default: false)
VITE_TRACKER_ENABLE_TIMING=true
```

### Runtime Configuration

```tsx
import { setTrackerConfig } from '@/core/trackerConfig'

// Set before app initialization
setTrackerConfig({
  enabled: true,
  maxHistoryPerComponent: 100,
  enableTiming: false
})
```

### Provider Props

```tsx
<RenderTrackerProvider
  enabled={true}                    // Override env vars
  maxHistoryPerComponent={100}      // Keep more history
  enableTiming={false}              // Disable timing
>
  {children}
</RenderTrackerProvider>
```

---

## Troubleshooting

### "Component not being tracked"

**Check**:
1. Is RenderTrackerProvider wrapping the component?
2. Is tracker enabled? Check DevPanel toggle
3. Does component have a nodeId? (auto-assigned by renderer)

```tsx
const tracker = useRenderTracker()
console.log(tracker.getAllStats()) // Should show components
```

### "DevPanel not showing"

**Check**:
1. Is DevPanel component imported and rendered?
2. Is RenderTrackerProvider above DevPanel?
3. Browser console should have no errors

```tsx
import { DevPanel } from '@/components'
// Make sure it's rendered!
<DevPanel initialOpen={true} />
```

### "Zero components tracked"

**Likely causes**:
1. App not wrapped in RenderTrackerProvider
2. Tracking disabled globally (check `getTrackerConfig().enabled`)
3. Components not rendering (no DOM updates)

```tsx
const { enabled } = getTrackerConfig()
console.log('Tracking enabled:', enabled)
```

### "High memory usage"

**Reduce** via configuration:

```tsx
setTrackerConfig({ maxHistoryPerComponent: 10 }) // Keep less history
```

Or disable timing:

```tsx
setTrackerConfig({ enableTiming: false })
```

---

## Examples

### Example 1: Performance Monitoring

```tsx
function PerformanceDashboard() {
  const { totalComponentsTracked, totalRenders } = useSystemStats()

  return (
    <div>
      <h2>App Performance</h2>
      <p>Tracked: {totalComponentsTracked} components</p>
      <p>Renders: {totalRenders} total</p>
      <p>Avg: {(totalRenders / totalComponentsTracked).toFixed(1)} per component</p>
    </div>
  )
}
```

### Example 2: Render Alert for Excessive Renders

```tsx
function RenderAlert({ nodeId, threshold = 10 }) {
  const stats = useComponentStats(nodeId)

  if (!stats) return null

  const isExcessive = stats.totalRenders > threshold

  return isExcessive ? (
    <div style={{ backgroundColor: 'red', color: 'white', padding: '8px' }}>
      ⚠️ {nodeId} has {stats.totalRenders} renders (threshold: {threshold})
    </div>
  ) : null
}
```

### Example 3: Debug Mode Toggle

```tsx
function DebugMode() {
  const [debug, setDebug] = useState(false)

  useEffect(() => {
    if (debug) {
      console.log('Debug mode ON')
      setTrackerEnabled(true)
    }
  }, [debug])

  return (
    <label>
      <input
        type="checkbox"
        checked={debug}
        onChange={(e) => setDebug(e.target.checked)}
      />
      Debug Mode
    </label>
  )
}
```

### Example 4: Full DevTools Integration

```tsx
function FullDevTools() {
  const [expanded, setExpanded] = useState(false)
  const allStats = useAllComponentStats()
  const { totalRenders, memoryUsageEstimate } = useSystemStats()

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{ position: 'fixed', bottom: 20, right: 20 }}
      >
        📊 DevTools
      </button>
    )
  }

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, width: '600px' }}>
      <DevPanel initialOpen={true} />
      <button
        onClick={() => setExpanded(false)}
        style={{ marginTop: '8px' }}
      >
        Close
      </button>
    </div>
  )
}
```

---

## Advanced Usage

### Custom Re-render Analysis

```tsx
function AnalyzeProblemComponent({ nodeId }) {
  const stats = useComponentStats(nodeId)

  if (!stats) return null

  // Find most common re-render reason
  const reasons = stats.history.map((e) => e.reason)
  const mostCommon = reasons.reduce((a, b) =>
    reasons.filter((x) => x === a).length >
    reasons.filter((x) => x === b).length
      ? a
      : b
  )

  return (
    <div>
      <h3>{nodeId}</h3>
      <p>Most common reason: {mostCommon}</p>
      <p>Total renders: {stats.totalRenders}</p>
    </div>
  )
}
```

### Export Stats for Analysis

```tsx
function ExportStats() {
  const tracker = useRenderTracker()

  const handleExport = () => {
    const stats = tracker.getAllStats()
    const json = JSON.stringify(stats, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tracker-stats-${Date.now()}.json`
    a.click()
  }

  return <button onClick={handleExport}>📥 Export Stats</button>
}
```

---

## Summary

RenderTracker provides **zero-cost visibility** into component rendering:

✨ **Just wrap your app** with RenderTrackerProvider  
✨ **Tracking happens automatically** - no code changes needed  
✨ **Query real-time data** from any component  
✨ **Debug with DevPanel** visual dashboard  
✨ **Zero overhead when disabled** for production  

---

**Questions?** Check the main SpecLens README or spec files in `.specs/`
