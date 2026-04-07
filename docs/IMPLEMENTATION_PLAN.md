# Render Tracker System - Implementation Plan

**Document**: Detailed Implementation Plan  
**Feature**: Render Tracker System for SpecLens  
**Version**: 1.0  
**Date**: April 6, 2026  
**Status**: Ready for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Phase Breakdown](#phase-breakdown)
4. [Task Details](#task-details)
5. [Dependencies & Order](#dependencies--order)
6. [Integration Checkpoints](#integration-checkpoints)
7. [Testing Strategy](#testing-strategy)

---

## Overview

**Goal**: Implement a lightweight render tracking system that wraps dynamically-rendered SpecLens components and provides visibility into re-renders, prop changes, and render reasons.

**Approach**: 
- Build core tracker first (isolated from React)
- Wrap it with React Context for dependency injection
- Create HOC for component wrapping
- Integrate into existing renderer
- Expose public API for DevTools

**Go-live dependencies**: None (fully backward compatible)

---

## File Structure

### New Files to Create

```
src/
├── core/
│   ├── renderTracker.ts              (Core tracker class - no React)
│   ├── RenderTrackerProvider.tsx     (React Context + hook)
│   ├── withRenderTracking.tsx        (HOC wrapper)
│   ├── renderTrackerUtils.ts         (Helper functions)
│   ├── renderTrackerTypes.ts         (Type definitions)
│   └── types.ts                      (EXISTING - update with ids)
│
├── hooks/
│   ├── useRenderTracker.ts           (Hook for component access)
│   └── useTrackedRender.ts           (Hook for per-component access)
│
└── specs/
    └── RENDER_TRACKER_SPEC.md        (EXISTING - this spec)

test/
├── unit/
│   ├── renderTracker.test.ts         (Core tracker tests)
│   ├── withRenderTracking.test.tsx   (HOC tests)
│   └── propComparison.test.ts        (Prop change detection)
│
└── integration/
    ├── tracker.integration.test.tsx  (Full pipeline tests)
    └── rendererIntegration.test.tsx  (Renderer wrapper tests)
```

### Files to Modify

```
src/
├── core/
│   ├── renderer.tsx                  (Add HOC wrapping)
│   ├── types.ts                      (Add node ID requirements)
│   └── registery.ts                  (Optional: export tracking config)
│
└── App.tsx                           (Add RenderTrackerProvider)
```

---

## Phase Breakdown

### Phase 1: Core Tracker & Types (Foundation)

**Goal**: Build isolated, testable render tracking logic without React dependencies

**Duration**: ~2-3 hours  
**Complexity**: Low  
**Output**: - Core tracker class with data structures
- Type definitions
- Prop comparison utilities

**Files**:
- `src/core/renderTrackerTypes.ts` 
- `src/core/renderTrackerUtils.ts`
- `src/core/renderTracker.ts`

**Exit Criteria**:
- ✅ RenderTracker class instantiable as singleton
- ✅ trackRender() stores data accurately
- ✅ getRenderStats() returns correct data
- ✅ All TypeScript types align with spec
- ✅ Unit tests pass (80%+ coverage)

---

### Phase 2: React Integration (Context + Provider)

**Goal**: Make tracker accessible via React Context and hooks

**Duration**: ~1-2 hours  
**Complexity**: Low  
**Dependencies**: Phase 1 complete

**Files**:
- `src/core/RenderTrackerProvider.tsx`
- `src/hooks/useRenderTracker.ts`

**Exit Criteria**:
- ✅ Provider wraps App without errors
- ✅ useRenderTracker() hook works
- ✅ Multiple components can access same tracker instance
- ✅ Tests verify provider/hook integration

---

### Phase 3: HOC & Component Wrapping

**Goal**: Create wrapper that auto-tracks component renders

**Duration**: ~2 hours  
**Complexity**: Medium  
**Dependencies**: Phase 1, 2 complete

**Files**:
- `src/core/withRenderTracking.tsx`
- `src/hooks/useTrackedRender.ts` (optional)

**Exit Criteria**:
- ✅ HOC wraps components without breaking them
- ✅ Props pass through correctly
- ✅ Children render unchanged
- ✅ Prop comparison working accurately
- ✅ Render reason detected correctly
- ✅ Tests verify HOC behavior in isolation

---

### Phase 4: Renderer Integration

**Goal**: Integrate tracking into the spec renderer

**Duration**: ~1 hour  
**Complexity**: Low  
**Dependencies**: Phase 3 complete

**Files Modified**:
- `src/core/renderer.tsx` (lines to modify TBD)
- `src/core/types.ts` (add/verify node ID requirements)

**Implementation Steps**:
1. Import `withRenderTracking` HOC
2. Wrap dynamic component before rendering
3. Pass node ID to HOC
4. Verify all child components track correctly

**Exit Criteria**:
- ✅ All spec-rendered components automatically tracked
- ✅ Node IDs match spec structure
- ✅ Existing specs render without errors
- ✅ Integration tests pass

---

### Phase 5: Public API & Exports

**Goal**: Expose tracker for external consumption (DevTools)

**Duration**: ~30-45 min  
**Complexity**: Low  
**Dependencies**: Phase 4 complete

**Files**:
- `src/core/renderTracker.ts` (export singleton)
- `src/index.ts` or similar (create if needed)

**Exports**:
```typescript
// Global tracker access
export { tracker } from './core/renderTracker'

// Provider + hooks
export { RenderTrackerProvider } from './core/RenderTrackerProvider'
export { useRenderTracker } from './hooks/useRenderTracker'

// Types (for DevTools)
export type { RenderStats, RenderEvent, RenderReason } from './core/renderTrackerTypes'
```

**Exit Criteria**:
- ✅ `tracker` importable from root
- ✅ `tracker.getAllStats()` works from Dev Tools
- ✅ Data serializable to JSON
- ✅ No circular dependencies

---

### Phase 6: Testing & Validation

**Goal**: Comprehensive test coverage

**Duration**: ~3-4 hours  
**Complexity**: Medium  
**Dependencies**: Phase 5 complete

**Test Coverage**:
- Unit: RenderTracker class (60+ tests)
- Unit: Prop comparison logic (20+ tests)
- Unit: HOC wrapper (15+ tests)
- Integration: Full pipeline (10+ tests)

**Files** (new):
- `test/unit/renderTracker.test.ts`
- `test/unit/withRenderTracking.test.tsx`
- `test/unit/propComparison.test.ts`
- `test/integration/tracker.integration.test.tsx`

**Exit Criteria**:
- ✅ 80%+ code coverage
- ✅ All edge cases covered
- ✅ Performance benchmarks run
- ✅ No memory leaks detected

---

### Phase 7: Documentation & Examples

**Goal**: Enable developer usage

**Duration**: ~1-2 hours  
**Complexity**: Low  
**Dependencies**: Phase 6 complete

**Files** (new):
- `docs/RENDER_TRACKER.md` (API docs)
- `examples/renderTrackerExample.tsx` (usage example)
- `examples/devPanelExample.tsx` (DevTools example)

**Documentation Includes**:
- Quick start guide
- API reference
- Usage examples
- Performance considerations
- Configuration options

**Exit Criteria**:
- ✅ Developer can understand and use tracker
- ✅ Examples run without errors
- ✅ Performance implications documented

---

## Task Details

### Task 1.1: Create Type Definitions

**File**: `src/core/renderTrackerTypes.ts`  
**Time**: 30 min

```typescript
// Define all types from spec:
- RenderEvent
- RenderReason
- ComponentRenderData
- RenderStats
- PropChanges
- TrackerConfig
- TrackerOptions
```

**Acceptance Criteria**:
- ✅ All types match RENDER_TRACKER_SPEC.md section 5.2
- ✅ Types are exportable
- ✅ No TypeScript errors

---

### Task 1.2: Implement Prop Comparison Utils

**File**: `src/core/renderTrackerUtils.ts`  
**Time**: 45 min

**Functions**:
```typescript
function comparProps(
  prevProps: Record<string, any>,
  currentProps: Record<string, any>
): string[]  // Returns array of changed keys

function detectRenderReason(
  renderCount: number,
  propChanges: string[],
  previousReason?: RenderReason
): { reason: RenderReason; confidence: 'high' | 'medium' | 'low' }

function serializeProps(
  props: Record<string, any>,
  depth?: number
): Record<string, any>  // For storage (handles functions, etc.)
```

**Acceptance Criteria**:
- ✅ compareProps handles all edge cases (undefined, null, functions)
- ✅ detectRenderReason follows algorithm in spec section 6.2
- ✅ serializeProps doesn't break on circular refs
- ✅ All functions tested

---

### Task 1.3: Implement RenderTracker Core

**File**: `src/core/renderTracker.ts`  
**Time**: 1-1.5 hours

**Class Implementation**:
```typescript
export class RenderTracker {
  private componentStats: Map<string, ComponentRenderData>
  private renderHistory: Map<string, RenderEvent[]>
  private enabled: boolean
  private maxHistoryLength: number = 50
  private startTime: number

  // Core tracking
  trackRender(nodeId, componentType, prevProps, currentProps): void
  
  // Queries
  getRenderStats(nodeId): RenderStats | null
  getHistory(nodeId): RenderEvent[]
  getPropChanges(nodeId): string[] | null
  getAllStats(): Record<string, RenderStats>
  
  // Configuration
  enable(enabled: boolean): void
  isEnabled(): boolean
  reset(): void
  setMaxHistory(count: number): void
}

// Singleton export
export const tracker = new RenderTracker()
```

**Implementation Details**:
- Use `new Date().getTime()` for timestamps
- Store as Map<nodeId, RenderEvent[]> for O(1) access
- Implement circular buffer for history (overwrite oldest when > 50)
- Only track if enabled

**Acceptance Criteria**:
- ✅ Data stored accurately
- ✅ Memory efficient (< 100KB per component)
- ✅ All query methods return correct data
- ✅ Singleton pattern works
- ✅ Enable/disable toggles tracking

---

### Task 1.4: Add Unit Tests for Core

**File**: `test/unit/renderTracker.test.ts`  
**Time**: 1-1.5 hours

**Test Suites**:
```
✓ trackRender() stores data correctly
✓ getRenderStats() returns accurate stats
✓ getHistory() returns render history
✓ getPropChanges() detects changes
✓ getAllStats() aggregates all data
✓ enable/disable toggles tracking
✓ reset() clears all data
✓ circular buffer behavior (>50 renders)
```

**Acceptance Criteria**:
- ✅ 50+ tests pass
- ✅ 80%+ code coverage
- ✅ Edge cases covered (empty, large datasets)

---

### Task 2.1: Create RenderTrackerProvider

**File**: `src/core/RenderTrackerProvider.tsx`  
**Time**: 45 min

**Implementation**:
```typescript
// Context
const RenderTrackerContext = createContext<RenderTracker | null>(null)

// Provider component
export function RenderTrackerProvider({ 
  children, 
  enabled = true,
  maxHistory = 50 
}: any) {
  useEffect(() => {
    tracker.enable(enabled)
    tracker.setMaxHistory(maxHistory)
  }, [enabled, maxHistory])
  
  return (
    <RenderTrackerContext.Provider value={tracker}>
      {children}
    </RenderTrackerContext.Provider>
  )
}

// Export context for direct access if needed
export { RenderTrackerContext }
```

**Acceptance Criteria**:
- ✅ Provider wraps App without errors
- ✅ Children render correctly
- ✅ Context provides tracker instance
- ✅ Config props work (enabled, maxHistory)

---

### Task 2.2: Create useRenderTracker Hook

**File**: `src/hooks/useRenderTracker.ts`  
**Time**: 30 min

**Implementation**:
```typescript
export function useRenderTracker(): RenderTracker {
  const tracker = useContext(RenderTrackerContext)
  if (!tracker) {
    throw new Error('useRenderTracker must be used within RenderTrackerProvider')
  }
  return tracker
}

// Alternative: direct import for non-React code
export { tracker } from '../core/renderTracker'
```

**Acceptance Criteria**:
- ✅ Hook returns tracker instance
- ✅ Throws error if used outside provider
- ✅ Works with all components

---

### Task 3.1: Implement withRenderTracking HOC

**File**: `src/core/withRenderTracking.tsx`  
**Time**: 1-1.5 hours

**Implementation Strategy**:
```typescript
export function withRenderTracking<P extends object>(
  Component: React.ComponentType<P>,
  nodeId: string,
  componentType: string = Component.name
): React.FC<P> {
  
  return function TrackedComponent(props: P) {
    const prevPropsRef = useRef<P | undefined>()
    const renderCountRef = useRef(0)
    
    useEffect(() => {
      // Track render AFTER component mounts
      renderCountRef.current++
      const prevProps = prevPropsRef.current
      prevPropsRef.current = props
      
      // Call tracker
      tracker.trackRender(
        nodeId,
        componentType,
        prevProps || {},
        props
      )
    })
    
    return <Component {...props} />
  }
}
```

**Edge Cases to Handle**:
- Initial render (prevProps undefined)
- Props object mutations
- Function props (always "changed")
- Children as props

**Acceptance Criteria**:
- ✅ Component renders correctly
- ✅ Props pass through unchanged
- ✅ Track data stored on every render
- ✅ No performance degradation (< 1ms overhead)
- ✅ Works with class & function components

---

### Task 3.2: Add HOC Unit Tests

**File**: `test/unit/withRenderTracking.test.tsx`  
**Time**: 1 hour

**Test Suites**:
```
✓ HOC wraps component without breaking
✓ Props pass through correctly
✓ Children render unchanged
✓ Track is called on each render
✓ Initial render detected
✓ Prop changes detected
✓ Works with handlers and functions
✓ Memory cleanup (no leaks)
```

**Acceptance Criteria**:
- ✅ 15+ tests pass
- ✅ All use cases covered
- ✅ No memory leaks in tests

---

### Task 4.1: Integrate with Renderer

**File**: `src/core/renderer.tsx`  
**Time**: 30 min

**Changes**:
```typescript
// Add import
import { withRenderTracking } from './withRenderTracking'

// In renderNode function
export function renderNode(node: SpecNode): React.ReactNode {
  const Component = registry[node.type]
  
  // Wrap with tracker
  const TrackedComponent = withRenderTracking(
    Component,
    node.id,
    node.type
  )
  
  return (
    <TrackedComponent {...node.props}>
      {node.children?.map((child) => (
        <div key={child.id}>{renderNode(child)}</div>
      ))}
    </TrackedComponent>
  )
}
```

**Acceptance Criteria**:
- ✅ All spec-rendered components tracked
- ✅ Existing specs render correctly
- ✅ Node IDs propagate correctly
- ✅ Sample spec works with tracking

---

### Task 4.2: Integration Tests for Renderer

**File**: `test/integration/rendererIntegration.test.tsx`  
**Time**: 45 min

**Test Scenarios**:
```
✓ Render sample spec with tracking
✓ All nodes tracked with correct IDs
✓ Props match spec in tracker
✓ Nested components all tracked
✓ No rendering errors
```

**Acceptance Criteria**:
- ✅ Sample spec renders + tracked
- ✅ Tracker data accurate
- ✅ Integration test passes

---

### Task 5.1: Update App.tsx with Provider

**File**: `src/App.tsx`  
**Time**: 15 min

**Changes**:
```typescript
import { RenderTrackerProvider } from './core/RenderTrackerProvider'

export function App() {
  return (
    <RenderTrackerProvider>
      {/* existing App code */}
    </RenderTrackerProvider>
  )
}
```

**Acceptance Criteria**:
- ✅ App renders with provider
- ✅ Tracker works with all components
- ✅ No prop drilling needed

---

### Task 5.2: Create Entry Point Exports

**File**: `src/core/index.ts` (new)  
**Time**: 15 min

**Exports**:
```typescript
// Tracker
export { tracker } from './renderTracker'
export type { RenderTracker } from './renderTracker'

// Provider & hooks
export { RenderTrackerProvider } from './RenderTrackerProvider'
export { useRenderTracker } from '../hooks/useRenderTracker'

// Types
export type {
  RenderEvent,
  RenderReason,
  ComponentRenderData,
  RenderStats,
} from './renderTrackerTypes'

// Utils
export { comparProps, detectRenderReason } from './renderTrackerUtils'
```

**Acceptance Criteria**:
- ✅ All exports available
- ✅ No circular deps
- ✅ DevTools can import tracker

---

## Dependencies & Order

### Execution Sequence

```
Phase 1: Foundation (No dependencies)
├─ Task 1.1: Types (30 min)
├─ Task 1.2: Utils (45 min)
├─ Task 1.3: Core Tracker (1-1.5h)
└─ Task 1.4: Unit Tests (1-1.5h)

Phase 2: React Integration (Depends on Phase 1)
├─ Task 2.1: Provider (45 min)
└─ Task 2.2: Hook (30 min)

Phase 3: HOC (Depends on Phase 1, 2)
├─ Task 3.1: withRenderTracking (1-1.5h)
└─ Task 3.2: HOC Tests (1h)

Phase 4: Renderer Integration (Depends on Phase 3)
├─ Task 4.1: Integrate (30 min)
└─ Task 4.2: Integration Tests (45 min)

Phase 5: API & Export (Depends on Phase 4)
├─ Task 5.1: Update App.tsx (15 min)
└─ Task 5.2: Entry Point (15 min)

Phase 6: Documentation (Depends on Phase 5)
└─ Task 6.1: Docs + Examples (1-2h)
```

**Total Estimated Time**: 10-13 hours

### Parallel Work Possible

- Task 1.4 (tests) can start once 1.1-1.3 are complete
- Task 3.2 (HOC tests) can start once 3.1 is complete
- Task 4.2 (integration tests) can start once 4.1 is complete

---

## Integration Checkpoints

### ✅ Checkpoint 1: Phase 1 Complete
- [ ] Types defined
- [ ] Utils functional
- [ ] Core tracker working
- [ ] Unit tests passing

**Validation**: Run `npm test -- renderTracker.test.ts`

---

### ✅ Checkpoint 2: Phase 2 Complete
- [ ] Provider working
- [ ] Hook functional
- [ ] No TypeScript errors

**Validation**: App wraps with provider without errors

---

### ✅ Checkpoint 3: Phase 3 Complete
- [ ] HOC wraps components
- [ ] Props pass through
- [ ] Tracking data stored
- [ ] HOC tests passing

**Validation**: Run `npm test -- withRenderTracking.test.tsx`

---

### ✅ Checkpoint 4: Phase 4 Complete
- [ ] Renderer integration done
- [ ] Sample spec renders with tracking
- [ ] All nodes tracked
- [ ] Integration tests passing

**Validation**: Run app, verify tracker data from console

---

### ✅ Checkpoint 5: Phase 5 Complete
- [ ] App renders with provider
- [ ] Tracker accessible globally
- [ ] All exports working
- [ ] No circular dependencies

**Validation**: `import { tracker } from './core'` works, `tracker.getAllStats()` returns data

---

### ✅ Checkpoint 6: Phase 6 Complete
- [ ] API documented
- [ ] Examples functional
- [ ] Usage clear

**Validation**: Developer can use tracker without referring to code

---

## Testing Strategy

### Unit Testing (Phase 1-3)

**Framework**: Vitest (Vite-integrated)

```bash
npm test -- renderTracker.test.ts
npm test -- renderTrackerUtils.test.ts
npm test -- withRenderTracking.test.tsx
```

**Coverage Target**: 80%+

### Integration Testing (Phase 4)

**Scenarios**:
- Render sample spec
- All nodes tracked
- Data accurate
- No console errors

```bash
npm test -- tracker.integration.test.tsx
```

### Performance Testing (Optional Phase 7)

**Benchmarks**:
- Render overhead: < 2ms per component
- Memory per component: < 100KB
- Tracker query time: < 1ms

```bash
npm run benchmark
```

### Manual Testing

**Steps**:
1. Run `npm run dev`
2. Open DevTools console
3. Import tracker: `import { tracker } from './core'`
4. Check data: `tracker.getAllStats()`
5. Trigger renders by interacting with UI
6. Verify data updates

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Performance degradation** | High | Benchmark early, limit history to 50 renders, disable in prod |
| **Memory leaks** | High | Use useRef cleanup, test with Chrome DevTools |
| **Breaking existing renders** | Critical | Test with all sample specs, run full test suite |
| **Circular dependencies** | Medium | Avoid importing from components in tracker |
| **Props mutation issues** | Medium | Use shallow comparison, add tests for edge cases |

---

## Success Metrics

After Phase 5 (MVP Complete):

| Metric | Target | Success |
|--------|--------|---------|
| All tests pass | 100% | ✅ |
| Render overhead | < 2ms | ✅ |
| Memory per component | < 100KB | ✅ |
| Code coverage | 80%+ | ✅ |
| Sample spec renders | 100% | ✅ |
| Tracker data accurate | 100% | ✅ |
| DevTools integration ready | Yes | ✅ |

---

## Next Steps (After MVP)

### Phase 7: DevTools Panel
- Build React component consuming tracker API
- Display render stats dashboard
- Timeline of renders per component
- Prop change visualization

### Phase 8: Advanced Features
- React Profiler API integration
- Timeline export
- Performance regression detection
- Render flamegraph

### Phase 9: Production Optimization
- Conditional compilation (disable in prod)
- Remote tracker (send to analytics)
- Performance budgets

---

