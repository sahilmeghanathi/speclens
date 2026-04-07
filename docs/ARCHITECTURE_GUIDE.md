# Render Tracker - Architecture & Execution Guide

**Document**: Architecture Overview & Execution Guide  
**Status**: Ready for Implementation Planning

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Application                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              App.tsx                                     │   │
│  │  <RenderTrackerProvider>                                │   │
│  │    ├─ Dashboard                                         │   │
│  │    └─ DevPanel                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
           │
           │ Provides context
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                RenderTrackerProvider (React Context)            │
│  • Holds singleton tracker instance                             │
│  • Manages enable/disable configuration                         │
│  • Available via useRenderTracker() hook                        │
└─────────────────────────────────────────────────────────────────┘
           │
           │ Uses
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     RenderTracker (Core)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Data Storage (Maps):                                    │   │
│  │  • componentStats: Map<nodeId, ComponentRenderData>    │   │
│  │  • renderHistory: Map<nodeId, RenderEvent[]>           │   │
│  │                                                          │   │
│  │ Public Methods:                                          │   │
│  │  • trackRender(nodeId, type, prevProps, currentProps)  │   │
│  │  • getRenderStats(nodeId)                               │   │
│  │  • getHistory(nodeId)                                   │   │
│  │  • getPropChanges(nodeId)                               │   │
│  │  • getAllStats()                                        │   │
│  │  • enable/disable/reset                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
           │
           │ Calls with data from
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  withRenderTracking (HOC)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Wraps any React component:                              │   │
│  │  • useRef for previous props                            │   │
│  │  • useEffect to capture renders                         │   │
│  │  • Calls tracker.trackRender() on each render           │   │
│  │  • Returns wrapped component                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
           │
           │ Wraps all dynamic components via
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                renderer.tsx (Updated)                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ renderNode(spec) {                                      │   │
│  │   const Component = registry[spec.type]                │   │
│  │   const Tracked = withRenderTracking(Component, spec.id)  │
│  │   return <Tracked {...spec.props}>{children}</Tracked>│   │
│  │ }                                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
           │
           │ Renders
           ▼
┌─────────────────────────────────────────────────────────────────┐
│              Dynamic Components (Card, Grid, etc.)              │
│  • Renders normally                                             │
│  • Tracked via withRenderTracking HOC                          │
│  • User never sees wrapper                                     │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                  External Access (DevTools)                     │
│  import { tracker } from './core'                               │
│  tracker.getAllStats()  // Get all render data                 │
│  tracker.getHistory(nodeId)  // Get render history             │
│  ✓ DevPanel displays real-time metrics                         │
│  ✓ No code modification to components needed                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow During Render

```
User Interaction / State Change
     │
     ▼
Component Re-renders
     │
     ├─ withRenderTracking HOC triggers
     │     │
     │     ├─ Capture current props
     │     ├─ Compare with previous props
     │     ├─ Detect prop changes
     │     ├─ Determine render reason
     │     │
     │     ▼
     │  tracker.trackRender({
     │    nodeId,
     │    componentType,
     │    previousProps,
     │    currentProps,
     │    propChanges,
     │    reason: 'props_changed' | 'parent_rerender' | ...
     │  })
     │     │
     │     ▼
     │  RenderTracker stores in:
     │    • componentStats[nodeId] ← Updated render count
     │    • renderHistory[nodeId] ← Append new RenderEvent
     │
     └─ Component renders to DOM
           │
           ▼
     DevTools queries tracker:
       • tracker.getAllStats() → Display metrics
       • tracker.getHistory(nodeId) → Show timeline
       • tracker.getPropChanges(nodeId) → Show what changed
```

---

## File Tree (Final)

```
speclens/
├── src/
│   ├── core/
│   │   ├── types.ts                    (EXISTING - no changes needed)
│   │   ├── renderer.tsx                (MODIFY - add HOC wrapping)
│   │   ├── registery.ts                (EXISTING - no changes needed)
│   │   ├── index.ts                    (NEW - public exports)
│   │   ├── renderTrackerTypes.ts       (NEW - type definitions)
│   │   ├── renderTrackerUtils.ts       (NEW - comparison & detection)
│   │   ├── renderTracker.ts            (NEW - core tracker class)
│   │   ├── RenderTrackerProvider.tsx   (NEW - React context)
│   │   └── withRenderTracking.tsx      (NEW - HOC wrapper)
│   │
│   ├── hooks/
│   │   └── useRenderTracker.ts         (NEW - React hook)
│   │
│   ├── components/
│   │   ├── Card.tsx                    (EXISTING)
│   │   ├── Grid.tsx                    (EXISTING)
│   │   └── StatCard.tsx                (EXISTING)
│   │
│   ├── specs/
│   │   ├── sampleSpec.ts               (EXISTING)
│   │   └── RENDER_TRACKER_SPEC.md      (NEW - feature spec)
│   │
│   ├── App.tsx                         (MODIFY - wrap provider)
│   ├── main.tsx                        (EXISTING)
│   └── index.css                       (EXISTING)
│
├── test/
│   ├── unit/
│   │   ├── renderTracker.test.ts       (NEW - 50+ tests)
│   │   ├── renderTrackerUtils.test.ts  (NEW - 20+ tests)
│   │   └── withRenderTracking.test.tsx (NEW - 15+ tests)
│   │
│   └── integration/
│       └── rendererIntegration.test.tsx (NEW - integration tests)
│
├── docs/
│   └── RENDER_TRACKER.md               (NEW - API documentation)
│
├── examples/
│   ├── renderTrackerExample.tsx        (NEW - usage example)
│   └── devPanelExample.tsx             (NEW - DevTools example)
│
├── IMPLEMENTATION_PLAN.md              (NEW - this plan)
├── TASK_CHECKLIST.md                   (NEW - task tracking)
├── package.json                        (EXISTING)
├── tsconfig.json                       (EXISTING)
└── vite.config.ts                      (EXISTING)
```

**Summary**:
- ✅ **New files**: 12
- ⚠️ **Modified files**: 2 (minimal changes)
- ℹ️ **Deleted files**: 0 (backward compatible)
- 📊 **Total tests**: 85+ test cases

---

## Component Dependency Graph

```
RenderTracker (Core)
├── No external dependencies
├── Pure TypeScript
└── Used by:
    ├─ RenderTrackerProvider
    ├─ withRenderTracking
    └─ DevTools/External code

RenderTrackerUtils (Helpers)
├── No React dependencies
├── Used by:
    └─ withRenderTracking
       └─ RenderTracker

RenderTrackerProvider (Context)
├── Depends on: RenderTracker
├── Depends on: React
└── Provides context to:
    ├─ App (wrapped)
    └─ useRenderTracker hook

withRenderTracking (HOC)
├── Depends on: React
├── Depends on: RenderTracker
├── Used in: renderer.tsx
└─ Wraps: Dynamic components

renderer.tsx (Updated)
├── Depends on: withRenderTracking
├── Depends on: SpecNode types
└─ Used by: App → renderNode()

App.tsx (Updated)
├── Depends on: RenderTrackerProvider
└─ Wraps: Child components
```

**No circular dependencies** ✅

---

## Minimal vs. Comprehensive Implementation

### MVP (Minimal Viable Product) - 6-8 hours
```
✓ Phase 1: Core Tracker + Utils
✓ Phase 2: React Provider + Hook
✓ Phase 3: HOC wrapper
✓ Phase 4: Renderer integration
✓ Phase 5: Public API
```

### Full Implementation - 10-13 hours
```
✓ MVP + Phase 6: Tests (80%+ coverage)
✓ Phase 7: Documentation
✓ Phase 8: Performance benchmarks
```

### Enterprise Ready - 15-20 hours
```
✓ Full Implementation
✓ DevTools UI dashboard
✓ Advanced visualization
✓ Performance profiling
✓ Remote tracking integration
```

---

## Execution Checklist

### Pre-Implementation (15 min)
- [ ] Review RENDER_TRACKER_SPEC.md
- [ ] Review IMPLEMENTATION_PLAN.md
- [ ] Review this architecture guide
- [ ] Set up test environment: `npm install`
- [ ] Run existing tests: `npm test`

### Build Command Reference
```bash
# Development
npm run dev                    # Start dev server

# Testing
npm test                       # Run all tests
npm test -- renderTracker     # Run single test suite
npm test -- --coverage        # Check coverage

# Linting
npm run lint                   # Check linting

# Build
npm run build                  # Build for production
npm run preview               # Preview production build
```

### Phase-by-Phase Implementation
```bash
# Phase 1: Foundation
# Create files: renderTrackerTypes.ts, renderTrackerUtils.ts, renderTracker.ts
# → npm test -- renderTracker.test.ts
# → Checkpoint 1: Foundation stable

# Phase 2: React Integration
# Create: RenderTrackerProvider.tsx, useRenderTracker.ts
# → npm test -- RenderTrackerProvider
# → Checkpoint 2: Context working

# Phase 3: HOC
# Create: withRenderTracking.tsx, add tests
# → npm test -- withRenderTracking.test.tsx
# → Checkpoint 3: HOC functional

# Phase 4: Integration
# Modify: renderer.tsx, add integration tests
# → npm run build (no errors)
# → npm run dev (no console errors)
# → Checkpoint 4: Renderer integrated

# Phase 5: API
# Modify: App.tsx, create exports
# → npm run build (no errors)
# → Verify: import { tracker } works
# → Checkpoint 5: API ready

# Phase 6: Tests & Docs
# Create: tests, docs, examples
# → npm test (all pass, 80%+ coverage)
# → Checkpoint 6: Complete
```

---

## Troubleshooting Guide

### Common Issues During Implementation

| Issue | Solution |
|-------|----------|
| TypeScript errors in new files | Check types import, verify `renderTrackerTypes.ts` created |
| Provider not providing context | Ensure App.tsx wraps children with RenderTrackerProvider |
| HOC not wrapping correctly | Verify useEffect runs on every render, check key handling |
| `tracker` undefined in console | Check `core/index.ts` exports, verify singleton export |
| Tests failing | Review test setup, ensure mocks use correct types |
| Performance degradation | Profile with DevTools, check useEffect dependencies |

---

## Success Indicators

### Visual Indicators
 In Chrome DevTools Console:
```javascript
// ✅ Success: Can access tracker
import { tracker } from './core'

// ✅ Success: Data populated
tracker.getAllStats()
// Output: { 'root': {...}, 'grid': {...}, 's1': {...}, ... }

// ✅ Success: Query works
tracker.getHistory('s1')
// Output: [ RenderEvent, RenderEvent, RenderEvent, ... ]

// ✅ Success: Prop detection works
tracker.getPropChanges('s1')
// Output: ['value'] (if value prop changed)
```

### Build Indicators
```bash
✓ npm run build (0 errors)
✓ npm test (all tests passing)
✓ npm run lint (no issues)
✓ tsc --noEmit (no TypeScript errors)
```

### Performance Indicators
```
✓ render() overhead: < 2ms per component
✓ Memory per component: < 100KB
✓ Query time (getAllStats): < 1ms
```

---

## Next Features (Post-MVP)

Once MVP is complete, these features can be added:

### Phase 7: DevTools UI
- React dashboard component
- Timeline visualization
- Render count charts
- Prop change timeline

### Phase 8: Advanced Analysis
- Render flamegraph
- Performance regression detection
- Idle  suggestions
- Heatmaps

### Phase 9: Production Integration
- Remote telemetry
- Performance budgets
- Error tracking integration
- Analytics hooks

---

## Questions? Checklist

Before starting implementation:

- [ ] Do I understand the spec? (RENDER_TRACKER_SPEC.md)
- [ ] Do I have the architectural view? (This document)
- [ ] Do I know the task order? (IMPLEMENTATION_PLAN.md)
- [ ] Can I track progress? (TASK_CHECKLIST.md)
- [ ] Do I have a test strategy? (Test section in plan)
- [ ] Can I troubleshoot? (Troubleshooting guide above)

**Ready to implement? Start with Phase 1, Task 1.1! 🚀**

