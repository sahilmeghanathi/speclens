# Render Tracker System - Feature Specification

**Feature**: Render Tracker System for SpecLens  
**Version**: 1.0  
**Status**: Specification  
**Date**: April 6, 2026

---

## 1. Problem Statement

SpecLens renders complex UIs from JSON specifications, but developers lack visibility into:
- How many times each component re-renders
- Why components are re-rendering (prop changes, parent updates, etc.)
- Which props changed between renders
- Performance impact of individual components

This blindness makes optimization and debugging difficult, especially with dynamically-rendered specs containing many instances.

---

## 2. Goals

**Primary**: Enable deep visibility into component rendering behavior for debugging and performance optimization.

**Secondary**:
- Provide a foundation for a future DevTools panel
- Maintain lightweight overhead (< 5% performance impact)
- Support specs with arbitrary component hierarchies
- Enable real-time tracking without code modifications to user components

---

## 3. Non-Goals

- Browser DevTools integration (future enhancement)
- Automatic optimization suggestions (future enhancement)
- Network request tracking
- State management tracking
- CSS/layout analysis

---

## 4. Requirements

### 4.1 Render Tracking

**Req 4.1.1**: Track each render event for every component instance
- **What**: Record every time a component renders, identified by spec node ID
- **Data captured**:
  - Render timestamp (milliseconds since start)
  - Render count (incremental counter per instance)
  - Duration (time component took to render - requires React unstable API)
- **Success criteria**: Accurate count with < 1ms overhead per render

**Req 4.1.2**: Store render history
- **What**: Maintain a sequential log of render events for each component
- **Retention**: Last 50 renders per component (configurable)
- **Success criteria**: History accessible for any component instance via spec node ID

### 4.2 Props Tracking

**Req 4.2.1**: Capture and store props on each render
- **What**: Store props object snapshot at render time
- **Data**: Props object reference (serializable for DevTools)
- **Success criteria**: Props available for comparison between renders

**Req 4.2.2**: Detect prop changes between renders
- **What**: Compare previous props to current props, identify differences
- **Algorithm**: Shallow comparison (identify top-level keys with different values)
- **Data returned**: List of changed prop keys and before/after values
- **Success criteria**: Accurately identify all changed props

### 4.3 Re-render Reason Analysis

**Req 4.3.1**: Identify probable re-render reason
- **What**: Determine why component re-rendered on last render
- **Reasons tracked**:
  - `props_changed`: One or more props changed
  - `parent_rerender`: Parent re-rendered (props may be unchanged)
  - `state_change`: Component has internal state that changed
  - `context_change`: Context provider re-rendered
  - `initial_render`: First render of this instance
- **Success criteria**: Reason assignable to each render with confidence level

**Req 4.3.2**: Store reason history
- **What**: Maintain list of re-render reasons for each component
- **Success criteria**: Developer can see why component re-rendered at any point in history

### 4.4 Data Consumption

**Req 4.4.1**: Provide global tracker API
- **What**: Export methods to query render data without coupling to components
- **API methods**:
  - `getComponentRenderStats(nodeId)` → render count, avg duration, last render time
  - `getComponentHistory(nodeId)` → array of render events with reason + props
  - `getPropChanges(nodeId)` → list of prop changes on last render
  - `getAllStats()` → summary of all tracked components
- **Success criteria**: Any code can import and call tracker API

**Req 4.4.2**: Enable DevPanel integration
- **What**: Tracker provides structured data suitable for UI consumption
- **Data format**: JSON-serializable objects with timestamps and categorized data
- **Success criteria**: Data can be rendered in a React component without transformation

### 4.5 Performance & Integration

**Req 4.5.1**: Lightweight tracking overhead
- **What**: Tracking adds minimal runtime cost
- **Target**: < 2ms per render cycle overhead (measure via benchmarks)
- **Success criteria**: Benchmark shows acceptable impact

**Req 4.5.2**: Dynamic component support
- **What**: Works seamlessly with components rendered from specs
- **Constraints**: No modifications to user components required
- **Success criteria**: Tracking works on all dynamically-rendered components via registry

**Req 4.5.3**: Configuration / Toggle
- **What**: Tracking can be enabled/disabled at runtime
- **Default**: Enabled in development, disabled in production (configurable)
- **Success criteria**: Zero overhead when disabled

---

## 5. Architecture & Design

### 5.1 Core Components

#### 5.1.1 RenderTracker (Singleton)
**Responsibility**: Central store for render data  
**Location**: `src/core/renderTracker.ts`  
**Interface**:
```typescript
class RenderTracker {
  // Data storage
  private componentStats: Map<string, ComponentRenderData>
  private renderHistory: Map<string, RenderEvent[]>
  private enabled: boolean

  // Public API
  trackRender(nodeId, previousProps, currentProps): void
  getRenderStats(nodeId): RenderStats | null
  getHistory(nodeId): RenderEvent[] | null
  getPropChanges(nodeId): string[] | null
  getAllStats(): Record<string, RenderStats>
  reset(): void
  enable(enabled: boolean): void
  isEnabled(): boolean
}
```

#### 5.1.2 RenderTrackerProvider (React Context)
**Responsibility**: Make tracker accessible to components  
**Location**: `src/core/RenderTrackerProvider.tsx`  
**Interface**:
```typescript
// Wrapper component
<RenderTrackerProvider>
  <App />
</RenderTrackerProvider>

// Hook for components (optional)
const tracker = useRenderTracker()
```

#### 5.1.3 withRenderTracking (HOC)
**Responsibility**: Wrap components to automatically track renders  
**Location**: `src/core/withRenderTracking.tsx`  
**Behavior**:
- Wraps any component
- Captures props before/after render
- Calls tracker.trackRender()
- Transparent to wrapped component

### 5.2 Data Structures

#### RenderEvent
```typescript
type RenderEvent = {
  timestamp: number           // Unix ms
  renderCount: number         // 1st, 2nd, 3rd render of this instance
  duration?: number           // ms spent in render (optional, React API)
  prevProps: Record<string, any>
  currentProps: Record<string, any>
  propChanges: string[]       // keys that changed
  reason: RenderReason
  reasonConfidence: 'high' | 'medium' | 'low'
}

type RenderReason = 
  | 'initial_render'
  | 'props_changed'
  | 'parent_rerender'
  | 'state_change'
  | 'context_change'

type ComponentRenderData = {
  nodeId: string
  componentType: string
  firstRenderTime: number
  totalRenders: number
  averageDuration?: number
  lastRenderTime: number
  lastReason: RenderReason
}

type RenderStats = ComponentRenderData & {
  history: RenderEvent[]
  lastPropChanges: string[]
}
```

### 5.3 Integration Points

#### Integration with Renderer
**File**: `src/core/renderer.tsx`  
**Change**: Wrap components with `withRenderTracking` at render time
```typescript
const Component = registry[node.type]
const TrackedComponent = withRenderTracking(Component, node.id)
return <TrackedComponent {...node.props}>{...}</TrackedComponent>
```

#### Integration with Registry
**File**: `src/core/registery.ts`  
**Change**: Export also offers pre-wrapped versions (optional)

---

## 6. Implementation Considerations

### 6.1 Prop Comparison Algorithm

**Challenge**: Props containing functions, nested objects, or circular refs

**Solution**: Shallow comparison by key
- Compare if previous props are different from current props
- Only track changed keys (not values)
- For DevTools: stringify top 3 levels only

**Edge cases handled**:
- Undefined vs null: treat as different
- Function props: always flag as changed (refs are unreliable)
- New props keys: flag as changed
- Removed props keys: flag as changed

### 6.2 Re-render Reason Detection

**Approach**: Multi-factor analysis
1. **Did props change?** → If yes, `props_changed` (high confidence)
2. **Is this initial?** → If yes, `initial_render` (high confidence)
3. **Else**: Assume `parent_rerender` (medium confidence)
4. **Future**: Use React Profiler API to detect state/context changes (low confidence for now)

### 6.3 Performance Optimization

**Methods**:
- Use `Map` instead of object for O(1) lookups
- Limit history to last 50 renders per component (circular buffer)
- Batch tracker operations via microtask queue (avoid UI frame blocking)
- Disable tracking in production by default
- Use shallow equality checks only (avoid deep cloning)

### 6.4 Development vs Production

**Development**:
- Tracker enabled by default
- Full history retained (50 renders)
- Performance impact tolerated

**Production**:
- Tracker disabled by default
- Can be enabled via environment variable for debugging
- Zero overhead when disabled

---

## 7. Task Breakdown

### Phase 1: Core Tracker (MVP)
- [ ] **Task 1.1**: Create RenderTracker class with data structures
- [ ] **Task 1.2**: Implement trackRender() and basic query methods
- [ ] **Task 1.3**: Implement prop change detection algorithm
- [ ] **Task 1.4**: Create withRenderTracking HOC

### Phase 2: Integration
- [ ] **Task 2.1**: Create RenderTrackerProvider and useRenderTracker hook
- [ ] **Task 2.2**: Integrate tracker into renderer (wrap components)
- [ ] **Task 2.3**: Add tracker initialization to App.tsx

### Phase 3: API & Consumption
- [ ] **Task 3.1**: Export global tracker API via renderTracker singleton
- [ ] **Task 3.2**: Create tracking utility functions (helpers)
- [ ] **Task 3.3**: Add TypeScript types for public API

### Phase 4: Testing & Documentation
- [ ] **Task 4.1**: Unit tests for RenderTracker class
- [ ] **Task 4.2**: Integration tests for withRenderTracking HOC
- [ ] **Task 4.3**: Write API documentation
- [ ] **Task 4.4**: Create DevTools consumption example

### Phase 5: Performance (Future)
- [ ] **Task 5.1**: Add performance benchmarks
- [ ] **Task 5.2**: Optimize re-render reason detection
- [ ] **Task 5.3**: Implement React Profiler API integration

---

## 8. Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| **Accuracy** | Render count matches actual renders | 100% |
| **Prop detection** | Changed props correctly identified | 100% |
| **Performance** | Overhead per render | < 2ms |
| **Memory** | Per-component history size | < 100KB |
| **API availability** | Tracker accessible from any code | Global access |
| **Integration** | Works with all spec components | 100% of nodes |
| **Dev experience** | DevTools can consume data | JSON-serializable |

---

## 9. Open Questions

1. **Rename events**: Should we track prop renames (e.g., `title` → `heading`)? Currently flag as both changed.
2. **Performance timing**: Do we use `React.measureRender()` or manual `performance.now()`?
3. **Selector syntax**: How should DevTools query tracker? Direct Map queries or GraphQL-like selectors?
4. **Circular buffers**: Fixed 50 renders or configurable per component?

---

## 10. Dependencies & Constraints

**Dependencies**:
- React 19+ (for stability)
- No external libraries for tracking core
- TypeScript 6.0+

**Constraints**:
- Cannot modify user component code
- Must work with dynamically-rendered specs
- Must not break existing rendering

**Browser support**: All modern browsers (Chrome, Firefox, Safari, Edge)

---

## Appendix: Example Usage

```typescript
// In App.tsx
import { RenderTrackerProvider } from './core/RenderTrackerProvider'
import { tracker } from './core/renderTracker'

export function App() {
  return (
    <RenderTrackerProvider>
      <Dashboard /> 
      <DevPanel onQuery={(nodeId) => tracker.getHistory(nodeId)} />
    </RenderTrackerProvider>
  )
}

// In DevTools
import { tracker } from './core/renderTracker'

function DevPanel() {
  const stats = tracker.getAllStats()
  return (
    <div>
      {Object.entries(stats).map(([nodeId, data]) => (
        <div key={nodeId}>
          {nodeId}: {data.totalRenders} renders
          {data.lastPropChanges.length > 0 && (
            <span>Changed: {data.lastPropChanges.join(', ')}</span>
          )}
        </div>
      ))}
    </div>
  )
}
```

