# Render Tracker System - Atomic Task List

**Total Tasks**: 20 core + 5 optional  
**Estimated Duration**: 2-3 days (core), 4-5 days (full)  
**Priority**: Core tasks must be done in order; optional tasks can follow

---

## Phase 1: Core Types & Data Structures (Tasks 1-3)

### TASK 1.1: Create RenderTracker Types
**File**: `src/core/renderTracker.types.ts` (NEW)  
**Type**: Type Definition  
**Description**: Define all TypeScript types used by the render tracker system.

**Requirements**:
- Create `RenderEvent` type with fields:
  - `timestamp: number`
  - `renderCount: number`
  - `duration?: number`
  - `prevProps: Record<string, any>`
  - `currentProps: Record<string, any>`
  - `propChanges: string[]`
  - `reason: RenderReason`
  - `reasonConfidence: 'high' | 'medium' | 'low'`
- Create `RenderReason` union type: `'initial_render' | 'props_changed' | 'parent_rerender' | 'state_change' | 'context_change'`
- Create `ComponentRenderData` type with fields:
  - `nodeId: string`
  - `componentType: string`
  - `firstRenderTime: number`
  - `totalRenders: number`
  - `averageDuration?: number`
  - `lastRenderTime: number`
  - `lastReason: RenderReason`
- Create `RenderStats` type extending `ComponentRenderData` with:
  - `history: RenderEvent[]`
  - `lastPropChanges: string[]`
- Create `RenderTrackerConfig` type:
  - `enabled: boolean`
  - `maxHistoryPerComponent: number` (default 50)
  - `enableTiming: boolean` (default false)

**Acceptance Criteria**:
- [ ] All types export without errors
- [ ] Types are exported from `renderTracker.types.ts`
- [ ] Can import all types in other modules

---

### TASK 1.2: Create Prop Comparison Utility
**File**: `src/core/propDiffer.ts` (NEW)  
**Type**: Utility  
**Description**: Implement shallow prop comparison to detect which props changed between renders.

**Requirements**:
- Export `compareDOMProps(prevProps, currentProps): PropComparisonResult`
  - Returns object: `{ changed: string[], added: string[], removed: string[] }`
  - Shallow comparison only (check if values at keys are referentially equal)
  - Ignore undefined keys in prev/current
  - Handle null vs undefined as different
  - Function props always flag as changed (refs are unreliable)
- Export `getPropChangeSummary(prev, current): string[]`
  - Returns flat array of keys that changed (added + changed + removed)
  - Used for quick checks
- Export helper `shouldTriggerRerender(prev, current): boolean`
  - Quick check: did props change at all?

**Implementation hints**:
- Use `Object.keys()` and `Object.entries()`
- Use referential equality check (`===`)
- Special handling for functions: `typeof prop === 'function'`

**Acceptance Criteria**:
- [ ] `compareDOMProps` correctly identifies changed keys
- [ ] Function props flag as changed on every call
- [ ] Handles null/undefined correctly
- [ ] Performance: operations complete in < 0.1ms

---

### TASK 1.3: Create Configuration Manager
**File**: `src/core/trackerConfig.ts` (NEW)  
**Type**: Configuration  
**Description**: Manage runtime configuration for the render tracker system.

**Requirements**:
- Export default config object:
  ```typescript
  {
    enabled: process.env.NODE_ENV === 'development',
    maxHistoryPerComponent: 50,
    enableTiming: false,
  }
  ```
- Export `setTrackerConfig(partial: Partial<RenderTrackerConfig>): void`
  - Merge new config with existing
- Export `getTrackerConfig(): RenderTrackerConfig`
  - Return current config
- Export `isTrackerEnabled(): boolean`
  - Shorthand for quick checks
- Export `setTrackerEnabled(enabled: boolean): void`
  - Toggle tracking on/off

**Acceptance Criteria**:
- [ ] Config persists across getter calls
- [ ] Can update individual config keys
- [ ] Production default is disabled
- [ ] Configuration is settable before app initialization

---

## Phase 2: Core Tracker Engine (Tasks 4-7)

### TASK 2.1: Create RenderTracker Singleton Class
**File**: `src/core/renderTracker.ts` (NEW)  
**Type**: Singleton Class  
**Description**: Implement the core RenderTracker class that stores all render data.

**Requirements**:
- Export `class RenderTracker` with private members:
  - `componentStats: Map<string, ComponentRenderData>`
  - `renderHistory: Map<string, RenderEvent[]>`
  - `enabled: boolean`
- Implement constructor that reads config at init time
- Implement `trackRender(nodeId: string, prevProps: any, currentProps: any): void`
  - Get or create `ComponentRenderData` entry for nodeId
  - Increment `totalRenders` counter
  - Add new `RenderEvent` to history
  - Call `_detectReRenderReason()` to set reason
  - Truncate history to max size if needed
  - Update `lastRenderTime`, `lastPropsChanged`
- Implement private `_detectReRenderReason(prev, current, isInitial): RenderReason`
  - If first render: return `'initial_render'`
  - If props changed (use propDiffer): return `'props_changed'` with high confidence
  - Else: return `'parent_rerender'` with medium confidence
- Implement internal bookkeeping:
  - Track first render timestamp per nodeId
  - Maintain average duration (if timing enabled)

**Method Signatures**:
```typescript
class RenderTracker {
  trackRender(nodeId: string, prevProps: any, currentProps: any): void
  private _detectReRenderReason(prev: any, current: any, isInitial: boolean): { reason: RenderReason; confidence: 'high' | 'medium' | 'low' }
  private _ensureComponentEntry(nodeId: string, componentType?: string): void
}
```

**Acceptance Criteria**:
- [ ] RenderTracker instantiates as singleton
- [ ] trackRender correctly increments counters
- [ ] History stored in Map (not array)
- [ ] Re-render reason detected correctly
- [ ] No memory leaks (history truncated)

---

### TASK 2.2: Add Read API to RenderTracker
**File**: `src/core/renderTracker.ts` (EDIT)  
**Type**: API Extension  
**Description**: Add query methods to RenderTracker for consuming render data.

**Requirements**:
- Implement `getComponentStats(nodeId: string): RenderStats | null`
  - Returns stats for one component or null if not found
  - Includes full history array
- Implement `getRenderHistory(nodeId: string): RenderEvent[] | null`
  - Returns render event array for one component
  - Or null if no history
- Implement `getPropChanges(nodeId: string): string[] | null`
  - Returns list of prop keys that changed on last render
  - Or null if component never rendered
- Implement `getAllStats(): Record<string, RenderStats>`
  - Returns object keyed by nodeId
  - All stats for all tracked components
  - Empty object if no tracked components
- Implement `getStats(nodeId: string, depth?: number): ComponentRenderData | null`
  - Lightweight version of getComponentStats (without history)

**Method Signatures**:
```typescript
class RenderTracker {
  getComponentStats(nodeId: string): RenderStats | null
  getRenderHistory(nodeId: string): RenderEvent[] | null
  getPropChanges(nodeId: string): string[] | null
  getAllStats(): Record<string, RenderStats>
  getStats(nodeId: string): ComponentRenderData | null
}
```

**Acceptance Criteria**:
- [ ] All query methods return correct types
- [ ] Returns null for unknown nodeIds (never throws)
- [ ] getAllStats returns empty object if no components tracked
- [ ] Query methods are O(1) or O(n) for history length only

---

### TASK 2.3: Add Control Methods to RenderTracker
**File**: `src/core/renderTracker.ts` (EDIT)  
**Type**: API Extension  
**Description**: Add lifecycle and control methods for enabling/disabling tracker.

**Requirements**:
- Implement `enable(enabled: boolean): void`
  - Toggle tracking on/off
  - Syncs with config
- Implement `isEnabled(): boolean`
  - Get current enabled state
- Implement `reset(): void`
  - Clear all tracked data
  - Reset all maps
  - Keep enabled state
- Implement `resetComponent(nodeId: string): void`
  - Clear data for one component only
- Implement `getSystemStats(): { totalComponentsTracked: number; totalRenders: number; memoryUsageEstimate?: string }`
  - Return high-level system stats
  - Useful for DevTools dashboard

**Method Signatures**:
```typescript
class RenderTracker {
  enable(enabled: boolean): void
  isEnabled(): boolean
  reset(): void
  resetComponent(nodeId: string): void
  getSystemStats(): { totalComponentsTracked: number; totalRenders: number }
}
```

**Acceptance Criteria**:
- [ ] Enabling/disabling prevents trackRender from updating
- [ ] reset() clears all data
- [ ] getSystemStats returns correct numbers
- [ ] Can toggle enabled state safely mid-render

---

### TASK 2.4: Export Singleton Instance
**File**: `src/core/renderTracker.ts` (EDIT)  
**Type**: Export  
**Description**: Export singleton instance and factory functions.

**Requirements**:
- Export `const tracker = new RenderTracker()`
  - This is the global singleton instance
- Export `export { RenderTracker }` (the class itself for testing)
- Ensure only one instance is ever created
- Make module-level:
  ```typescript
  export const tracker = new RenderTracker()
  export { RenderTracker }
  export type { RenderEvent, RenderStats, ComponentRenderData }
  ```

**Acceptance Criteria**:
- [ ] `import { tracker } from './renderTracker'` works
- [ ] `tracker` is truly a singleton (same object always)
- [ ] Can be called from any module globally

---

## Phase 3: Component Tracking HOC (Tasks 8-10)

### TASK 3.1: Create withRenderTracking HOC
**File**: `src/core/withRenderTracking.tsx` (NEW)  
**Type**: React HOC  
**Description**: Higher-Order Component that wraps any component to track its renders.

**Requirements**:
- Export `withRenderTracking<P>(Component: React.ComponentType<P>, nodeId: string): React.ComponentType<P>`
- Wrapper component must:
  - Use `useRef` to track previous props
  - On every render, call `tracker.trackRender(nodeId, prevProps, currentProps)`
  - Update prevProps ref after tracking
  - Render the wrapped Component with all original props
  - Pass through all child elements
- Handle edge cases:
  - First render: prevProps is undefined, pass as `{}`
  - Props may be undefined: treat as empty object
  - Children must be passed through
- Display name for debugging:
  - `TrackedComponent.displayName = `WithRenderTracking(${Component.displayName || 'Unknown'})`

**Implementation pattern**:
```typescript
export function withRenderTracking<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  nodeId: string,
): React.ComponentType<P> {
  const Tracked = (props: P) => {
    const prevPropsRef = useRef<P>({} as P)
    
    // Track render on every render
    useEffect(() => {
      if (tracker.isEnabled()) {
        tracker.trackRender(nodeId, prevPropsRef.current, props)
      }
      prevPropsRef.current = props
    })
    
    return <Component {...props} />
  }
  
  Tracked.displayName = `WithRenderTracking(...)`
  return Tracked
}
```

**Acceptance Criteria**:
- [ ] Component renders correctly with tracking
- [ ] Props tracked on every render
- [ ] Wrapper is transparent (no prop loss/mutation)
- [ ] Children pass through correctly
- [ ] Works with functional components

---

### TASK 3.2: Create useRenderTracker Hook
**File**: `src/core/useRenderTracker.ts` (NEW)  
**Type**: React Hook  
**Description**: Custom hook for components to access tracker API.

**Requirements**:
- Export `useRenderTracker(): RenderTracker`
  - Returns singleton tracker instance
  - Safe to call from any component
  - No dependencies, runs once
- Optionally also export helper hooks:
  - `useComponentStats(nodeId: string): RenderStats | null`
    - Returns stats for this component
    - Dependency: [nodeId]
  - `usePropChanges(nodeId: string): string[] | null`
    - Returns list of changed props
    - Updates on render changes

**Implementation**:
```typescript
export function useRenderTracker(): RenderTracker {
  return tracker
}

export function useComponentStats(nodeId: string): RenderStats | null {
  return tracker.getComponentStats(nodeId)
}
```

**Acceptance Criteria**:
- [ ] Hook returns tracker successfully
- [ ] Can be called from functional components
- [ ] No dependency warnings from linting
- [ ] Returns correct stats

---

### TASK 3.3: Create RenderTrackerProvider Context
**File**: `src/core/RenderTrackerProvider.tsx` (NEW)  
**Type**: React Context Provider  
**Description**: Provide tracker to React tree via Context (optional, for future extensions).

**Requirements**:
- Create `RenderTrackerContext = React.createContext<RenderTracker>(tracker)`
  - Default value is tracker singleton
- Export `RenderTrackerProvider: React.FC<{ children: React.ReactNode }>`
  - Wraps app with context
  - Passes tracker singleton as value
- Export `useRenderTrackerContext(): RenderTracker`
  - Hook to consume context
  - Can assert context exists

**Implementation**:
```typescript
export const RenderTrackerContext = React.createContext<RenderTracker>(tracker)

export function RenderTrackerProvider({ children }: { children: React.ReactNode }) {
  return (
    <RenderTrackerContext.Provider value={tracker}>
      {children}
    </RenderTrackerContext.Provider>
  )
}

export function useRenderTrackerContext(): RenderTracker {
  const context = useContext(RenderTrackerContext)
  if (!context) throw new Error('useRenderTrackerContext must be inside RenderTrackerProvider')
  return context
}
```

**Acceptance Criteria**:
- [ ] Provider wraps app tree
- [ ] Context hook returns tracker
- [ ] No errors when provider exists
- [ ] Optional - may be skipped if using direct import instead

---

## Phase 4: Integration (Tasks 11-14)

### TASK 4.1: Update Renderer to Use withRenderTracking
**File**: `src/core/renderer.tsx` (EDIT)  
**Type**: Integration  
**Description**: Integrate render tracking into the spec renderer.

**Requirements**:
- Import `withRenderTracking` from `./withRenderTracking`
- In `renderNode()` function:
  - After getting Component from registry: `const Component = registry[node.type]`
  - Wrap component: `const TrackedComponent = withRenderTracking(Component, node.id)`
  - Use TrackedComponent instead of Component in JSX return
- Ensure node.id is always available (spec requirement already enforces this)
- Keep children rendering logic unchanged

**Before**:
```typescript
const Component = registry[node.type]
return <Component {...node.props}>{...children}</Component>
```

**After**:
```typescript
const Component = registry[node.type]
const TrackedComponent = withRenderTracking(Component, node.id)
return <TrackedComponent {...node.props}>{...children}</TrackedComponent>
```

**Acceptance Criteria**:
- [ ] Components still render correctly
- [ ] Render tracking activates for all dynamic components
- [ ] No new props passed to components
- [ ] Backward compatible with existing specs

---

### TASK 4.2: Initialize RenderTrackerProvider in App.tsx
**File**: `src/App.tsx` (EDIT)  
**Type**: Integration  
**Description**: Wrap App with RenderTrackerProvider for context availability.

**Requirements**:
- Import `RenderTrackerProvider` from `./core/RenderTrackerProvider`
- Wrap the existing JSX tree with `<RenderTrackerProvider>`
- Keep all existing content as children
- Place at top level for maximum coverage

**Pattern**:
```typescript
import { RenderTrackerProvider } from './core/RenderTrackerProvider'

export function App() {
  return (
    <RenderTrackerProvider>
      {/* existing JSX */}
    </RenderTrackerProvider>
  )
}
```

**Acceptance Criteria**:
- [ ] App still renders
- [ ] Provider wraps entire tree
- [ ] No console errors
- [ ] Context available to all components

---

### TASK 4.3: Add Sample Tracking Query to App.tsx (Optional)
**File**: `src/App.tsx` (EDIT)  
**Type**: Debug/Demo  
**Description**: Add debug output to verify tracking is working.

**Requirements**:
- Add useEffect hook in App component
- Log `tracker.getAllStats()` to console every 2 seconds
- Only log if tracker enabled
- Use `console.table()` for better visibility
- Can be wrapped in dev-only check

**Implementation**:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    if (tracker.isEnabled()) {
      console.table(tracker.getAllStats())
    }
  }, 2000)
  return () => clearInterval(interval)
}, [])
```

**Acceptance Criteria**:
- [ ] Console shows render stats
- [ ] Updates periodically
- [ ] No performance impact
- [ ] Can be easily removed

---

## Phase 5: Dev Panel Integration (Tasks 15-17)

### TASK 5.1: Create DevPanel Component Skeleton
**File**: `src/components/DevPanel.tsx` (NEW)  
**Type**: React Component  
**Description**: Create a developer panel for visualizing render tracking data.

**Requirements**:
- Create component `DevPanel: React.FC<{ initialOpen?: boolean }>`
- Component structure:
  - Collapsible header with title "Render Tracker"
  - Toggle button to enable/disable tracking
  - Stats summary section (total components, total renders)
  - Scrollable list of tracked components
  - Each item shows: nodeId, component type, render count, last change time
- Show "No data tracked" when tracker disabled or no components
- Use `useRenderTracker()` hook to access tracker
- Use `setInterval` to update stats every 500ms
- Style: minimal CSS, dark background (can be plain HTML initially)

**Component props**:
- `initialOpen?: boolean` (default true)

**Acceptance Criteria**:
- [ ] Component renders without errors
- [ ] Shows component list from tracker.getAllStats()
- [ ] Updates every 500ms
- [ ] Can toggle tracking on/off
- [ ] Collapsible UI works

---

### TASK 5.2: Add Component Details View to DevPanel
**File**: `src/components/DevPanel.tsx` (EDIT)  
**Type**: Component Feature  
**Description**: Add expandable details view for individual components.

**Requirements**:
- In component list, make each item clickable
- Clicking opens expandable details panel
- Details view shows:
  - Full component stats (using `tracker.getComponentStats(nodeId)`)
  - Last 10 render events from history
  - For each render event show:
    - Timestamp and render number
    - Re-render reason + confidence
    - List of changed props
    - Previous/current prop values (truncated)
- Add close button to collapse
- Only one component details visible at a time (or use accordion)

**Acceptance Criteria**:
- [ ] Click component item to expand details
- [ ] Shows render history correctly
- [ ] Prop changes displayed
- [ ] Can close details
- [ ] No rendering performance issues with large history

---

### TASK 5.3: Export DevPanel for Easy Import
**File**: `src/components/index.ts` (NEW/EDIT)  
**Type**: Export  
**Description**: Create barrel export for components including DevPanel.

**Requirements**:
- Create or update `src/components/index.ts`
- Export all components:
  - `export { Card } from './Card'`
  - `export { Grid } from './Grid'`
  - `export { StatCard } from './StatCard'`
  - `export { DevPanel } from './DevPanel'`
- Allow easy import: `import { DevPanel } from '@/components'`

**Acceptance Criteria**:
- [ ] Can import DevPanel from components barrel
- [ ] All other components still work
- [ ] Clean import statements

---

## Phase 6: Configuration & Performance (Tasks 18-20)

### TASK 6.1: Add Environment Variable Controls
**File**: `src/core/trackerConfig.ts` (EDIT)  
**Type**: Configuration  
**Description**: Allow tracker to be controlled via environment variables.

**Requirements**:
- Read from environment variables:
  - `VITE_TRACKER_ENABLED` → bool (default dev: true, prod: false)
  - `VITE_TRACKER_MAX_HISTORY` → number (default 50)
  - `VITE_TRACKER_ENABLE_TIMING` → bool (default false)
- Update default config:
  ```typescript
  enabled: process.env.NODE_ENV === 'development' && 
           process.env.VITE_TRACKER_ENABLED !== 'false',
  maxHistoryPerComponent: parseInt(process.env.VITE_TRACKER_MAX_HISTORY || '50'),
  enableTiming: process.env.VITE_TRACKER_ENABLE_TIMING === 'true',
  ```
- Document in README

**Acceptance Criteria**:
- [ ] Environment variables read correctly
- [ ] Defaults work when vars not set
- [ ] Can override at build time with .env files

---

### TASK 6.2: Create Performance Benchmarks
**File**: `src/core/renderTracker.perf.ts` (NEW)  
**Type**: Performance Test  
**Description**: Create simple performance benchmark to verify < 2ms overhead.

**Requirements**:
- Export `benchmarkRenderTracking(): PerformanceResult`
- Simulate 100 component renders with varying prop sizes
- Measure time taken with and without tracking
- Calculate overhead percentage
- Track memory before/after
- Log results to console

**Implementation**:
```typescript
export function benchmarkRenderTracking() {
  const iterations = 100
  const smallProps = { a: 1, b: 'x', c: true }
  const largeProps = { .../*100 keys*/ }
  
  // Measure without tracking
  const start = performance.now()
  for (let i = 0; i < iterations; i++) {
    // simulate with/without tracking
  }
  const duration = performance.now() - start
  
  return { duration, overhead: '...' }
}
```

**Acceptance Criteria**:
- [ ] Benchmark runs without errors
- [ ] Reports < 2ms per render overhead
- [ ] Can be called from console
- [ ] Results logged clearly

---

### TASK 6.3: Create README for Render Tracker System
**File**: `RENDER_TRACKER_README.md` (NEW)  
**Type**: Documentation  
**Description**: Document how to use the render tracking system.

**Requirements**:
- Installation/Setup section
  - How to import tracker
  - How to wrap App with provider
  - How to add DevPanel
- Usage section
  - Getting stats: `tracker.getAllStats()`
  - Query specific component: `tracker.getComponentStats(nodeId)`
  - Enabling/disabling: `tracker.enable(false)`
- DevPanel section
  - How to open DevPanel
  - How to read the visualization
  - Interpreting re-render reasons
- Performance section
  - Expected overhead (< 2ms)
  - How to disable for production
  - Memory usage
- Examples section
  - Code snippets for common use cases

**Includes**:
- Code examples
- Screenshots (placeholder links OK)
- Troubleshooting guide

**Acceptance Criteria**:
- [ ] Documentation covers all major APIs
- [ ] Examples are runnable
- [ ] Setup instructions are clear
- [ ] File is in root or docs/ folder

---

## Optional Advanced Tasks (5+ tasks, lower priority)

### OPTIONAL TASK A: React Profiler Integration
**File**: `src/core/renderTracker.profiler.ts` (NEW)  
**Type**: Enhancement  
**Description**: Use React's unstable Profiler API to get accurate render timings.

**Requirements**:
- Use `React.Profiler` component wrapper
- Capture onRender callback data
- Store actual render duration (not estimated)
- Integrate with RenderTracker

---

### OPTIONAL TASK B: Differential Snapshot Storage
**File**: `src/core/propSnapshots.ts` (NEW)  
**Type**: Optimization  
**Description**: Store only prop deltas to reduce memory usage.

**Requirements**:
- Store only changed props between renders
- Reconstruct full props on demand
- Reduce memory by ~60%

---

### OPTIONAL TASK C: DevPanel Export/Import
**File**: `src/components/DevPanel.tsx` (EDIT)  
**Type**: Enhancement  
**Description**: Export tracked data as JSON for analysis.

**Requirements**:
- Add "Export" button to DevPanel
- Downloads all stats as JSON file
- Can be later imported/analyzed

---

### OPTIONAL TASK D: Real-Time Performance Alerts
**File**: `src/core/renderTracker.alerts.ts` (NEW)  
**Type**: Feature  
**Description**: Alert when component renders exceed threshold.

**Requirements**:
- If component renders > 10 times →  warn
- If render takes > 5ms → warn
- Configurable thresholds

---

### OPTIONAL TASK E: Integration Tests
**File**: `src/core/__tests__/renderTracker.integration.test.ts` (NEW)  
**Type**: Test  
**Description**: End-to-end integration tests for tracker system.

**Requirements**:
- Test full render tracking flow
- Test HOC integration
- Test DevPanel data consumption

---

## Task Dependency Graph

```
1.1 ─→ 1.2 ─→ 1.3 ─→ 2.1 ─→ 2.2 ─→ 2.3 ─→ 2.4 ┐
                          ↓         ↓         ↓     ├→ 4.1 ─→ 4.2 ─→ 4.3
                        3.1 ────→ 3.2 ────→ 3.3 ────┘
                                                       ↓
                                                      5.1 ─→ 5.2 ─→ 5.3

6.1, 6.2, 6.3 can run independently after Phase 4
Optional tasks (A-E) can run anytime after Phase 5
```

---

## Estimated Effort

| Phase | Tasks | Est. Time | Difficulty |
|-------|-------|-----------|------------|
| 1: Types | 3 | 30 min | Low |
| 2: Core | 4 | 2 hours | Medium |
| 3: HOC | 3 | 1.5 hours | Medium |
| 4: Integration | 3 | 45 min | Low |
| 5: DevPanel | 3 | 2 hours | High |
| 6: Config | 3 | 1 hour | Low |
| **Total Core** | **19** | **~7.5 hours** | - |
| Optional | 5+ | 4+ hours | Variable |

---

## Implementation Checkpoints

After each phase, verify:
- [ ] Phase 1: Types module loads without errors
- [ ] Phase 2: `tracker.trackRender()` called successfully
- [ ] Phase 3: Components wrapped with HOC track renders
- [ ] Phase 4: Renderer uses HOC automatically
- [ ] Phase 5: DevPanel displays component list
- [ ] Phase 6: Environment variables control tracker

