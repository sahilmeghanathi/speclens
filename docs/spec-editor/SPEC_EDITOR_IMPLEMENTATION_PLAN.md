# Spec Editor UI - Implementation Plan

**Document**: Detailed Implementation Plan  
**Feature**: Spec Editor UI for SpecLens  
**Version**: 1.0  
**Date**: April 7, 2026  
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

**Goal**: Build a unified, real-time interface where developers can edit JSON specifications, instantly preview rendered UIs, and observe render tracking metrics in parallel.

**Approach**:
- Phase 1: Build layout infrastructure (3-column split panel system)
- Phase 2: Implement JSON spec editor with live validation
- Phase 3: Integrate live preview with spec renderer
- Phase 4: Add render tracking dashboard
- Phase 5: Polish, state persistence, and keyboard shortcuts

**Go-live dependencies**: RenderTracker system must be complete (Phase 1-5 of Render Tracker)

**Design Principles**:
- One-screen experience with no toggles
- Sub-100ms feedback from edit to preview
- Independent scrolling for each panel
- Clean separation of concerns (edit/preview/debug)

---

## File Structure

### New Files to Create

```
src/
├── components/
│   └── SpecEditor/
│       ├── SpecEditor.tsx                (Main container component)
│       ├── SpecEditor.css                (Layout & styling)
│       ├── parts/
│       │   ├── Header.tsx                (Top navigation bar)
│       │   ├── EditorPanel.tsx           (JSON editor section)
│       │   ├── PreviewPanel.tsx          (Live preview section)
│       │   ├── DevPanel.tsx              (Tracking & metrics section)
│       │   └── ErrorBoundary.tsx         (Error handling)
│       ├── hooks/
│       │   ├── useSpecEditor.ts          (Main state management)
│       │   ├── useAutoSave.ts            (Auto-save with persistence)
│       │   ├── useDebounce.ts            (Debounce editor changes)
│       │   └── useColumnResize.ts        (Column width management)
│       └── utils/
│           ├── specValidation.ts         (JSON schema validation)
│           ├── specTemplates.ts          (Template definitions)
│           └── specStorage.ts            (localStorage persistence)
│
├── components/
│   ├── JSONEditor/
│   │   ├── JSONEditor.tsx                (Reusable editor wrapper)
│   │   └── JSONEditor.css
│   ├── MetricsSummary/
│   │   └── MetricsSummary.tsx
│   ├── ComponentTreeView/
│   │   ├── ComponentTreeView.tsx
│   │   ├── TreeNode.tsx
│   │   └── ComponentTreeView.css
│   └── PropChangesPanel/
│       └── PropChangesPanel.tsx
│
└── specs/
    ├── examples/
    │   ├── basic.json
    │   ├── grid-layout.json
    │   ├── dashboard.json
    │   └── form-layout.json
    └── templates/
        └── (same files as examples)

test/
├── unit/
│   ├── specValidation.test.ts
│   ├── specTemplates.test.ts
│   └── specStorage.test.ts
│
└── integration/
    ├── SpecEditor.integration.test.tsx
    ├── editorPreviewSync.test.tsx
    └── devPanelTracking.test.tsx
```

### Files to Modify

```
src/
├── App.tsx                             (Add SpecEditor route/component)
├── main.tsx                            (Add routing if needed)
└── core/
    └── types.ts                        (Update spec types if needed)
```

---

## Phase Breakdown

### Phase 1: Layout Infrastructure & State Management

**Goal**: Build the 3-column layout system and establish state management patterns

**Duration**: 3-4 hours  
**Complexity**: Medium  
**Output**: 
- Responsive 3-column layout with resizable panels
- State management for editor, preview, and tracking
- Persistent column widths

**Files**:
- `src/components/SpecEditor/SpecEditor.tsx`
- `src/components/SpecEditor/SpecEditor.css`
- `src/components/SpecEditor/hooks/useSpecEditor.ts`
- `src/components/SpecEditor/hooks/useColumnResize.ts`
- `src/components/SpecEditor/parts/Header.tsx`
- `src/components/SpecEditor/parts/EditorPanel.tsx` (layout only)
- `src/components/SpecEditor/parts/PreviewPanel.tsx` (layout only)
- `src/components/SpecEditor/parts/DevPanel.tsx` (layout only)

**Implementation Steps**:

1. Create main SpecEditor container with 3-column grid layout
2. Implement CSS Grid for responsive layout:
   - Desktop (>1024px): 3 equal columns
   - Tablet (768-1024px): Stack editor top, preview/dev side-by-side
   - Mobile (<768px): Single column tabs or stack
3. Implement column resizing with mouse drag:
   - Track mouse position on drag
   - Update CSS Grid template-columns
   - Persist widths to localStorage
4. Create useSpecEditor hook for central state:
   - Current spec (JSON string)
   - Parsed spec (object)
   - Validation errors
   - Dirty flag
   - Selected component ID (for dev panel)
5. Create Header with:
   - SpecLens logo
   - Spec selector placeholder
   - Save/reset buttons
   - Settings icon

**Exit Criteria**:
- ✅ 3-column layout renders correctly on desktop
- ✅ Column resizing works smoothly
- ✅ Column widths persist across reload
- ✅ Responsive fallbacks on mobile/tablet
- ✅ No layout shift during transitions

**Acceptance Tests**:
- Layout test: Measure column widths, verify sum = 100%
- Resize test: Drag divider, verify new widths persist
- Responsive test: Render at 1920px, 768px, 320px - verify appropriate layout

---

### Phase 2: JSON Spec Editor with Live Validation

**Goal**: Implement a fully functional JSON editor with real-time validation

**Duration**: 3-4 hours  
**Complexity**: Medium  
**Dependencies**: Phase 1 complete

**Files**:
- `src/components/JSONEditor/JSONEditor.tsx`
- `src/components/JSONEditor/JSONEditor.css`
- `src/components/SpecEditor/utils/specValidation.ts`
- `src/components/SpecEditor/hooks/useDebounce.ts`
- `src/components/SpecEditor/parts/EditorPanel.tsx` (completed)

**Implementation Steps**:

1. Set up Monaco Editor or Ace editor library:
   - Install: `npm install @monaco-editor/react` (or `react-ace`)
   - Create JSONEditor wrapper component
   - Configure language: JSON, theme: dark
2. Implement editable content in EditorPanel:
   - Editor takes full height, scrollable
   - Status line showing line count, formatting
   - Dirty indicator (dot or asterisk)
3. Implement validation utility:
   - Parse JSON safely (try/catch)
   - Basic schema validation (required keys)
   - Return validation errors with line numbers
4. Implement debounced onChange:
   - Debounce 300ms to avoid excessive re-renders
   - Update useSpecEditor state
   - Trigger validation
   - Show error inline if invalid
5. Add editor shortcuts:
   - Ctrl+S / Cmd+S: Save
   - Ctrl+K Ctrl+F / Cmd+K Cmd+F: Format JSON
   - Ctrl+Z / Cmd+Z: Undo
6. Add helper buttons:
   - Format/prettify button
   - Clear all button
   - Load template dropdown

**Exit Criteria**:
- ✅ JSON editor renders with syntax highlighting
- ✅ Real-time validation shows errors inline
- ✅ Valid spec parses without errors
- ✅ Debouncing works (verify with performance profiler)
- ✅ Keyboard shortcuts functional
- ✅ Undo/redo work

**Acceptance Tests**:
- Parse test: Load valid spec, verify parsed in state
- Error test: Type invalid JSON, verify error displays, no crash
- Debounce test: Measure onChange calls, verify debouncing works
- Shortcut test: Test each keyboard shortcut, verify behavior

---

### Phase 3: Live Preview Integration

**Goal**: Connect spec editor to dynamic UI preview with hot reloading

**Duration**: 2-3 hours  
**Complexity**: Low  
**Dependencies**: Phase 1, 2 complete + RenderTracker integrated

**Files**:
- `src/components/SpecEditor/parts/PreviewPanel.tsx` (completed)
- `src/components/SpecEditor/parts/ErrorBoundary.tsx`

**Implementation Steps**:

1. Implement error boundary component:
   - Catch render errors
   - Display user-friendly error message
   - Don't crash entire interface
2. Create PreviewPanel content:
   - ErrorBoundary wrapper
   - Inside: SpecRenderer component (existing)
   - Pass validated spec as prop
   - Full height, scrollable, white background
3. Wire up state flow:
   - useSpecEditor hook provides parsed spec
   - Pass to SpecRenderer in preview
   - On spec change, SpecRenderer re-renders
   - Error boundary catches any render errors
4. Add "No spec loaded" placeholder:
   - When spec is empty or null
   - Show helpful message: "Create or load a spec to start"
   - Suggest loading templates
5. Add visual feedback:
   - Subtle border/highlight on hover (component interaction)
   - Smooth fade when preview updates
   - Loading indicator for complex specs (if needed)

**Exit Criteria**:
- ✅ Valid spec renders in preview
- ✅ Edit in editor → preview updates within 100ms
- ✅ Invalid spec shows error, doesn't crash
- ✅ Error boundary catches render errors
- ✅ Scrolling in preview independent from editor
- ✅ Components render with correct props

**Acceptance Tests**:
- Live sync test: Update editor, measure time to preview update (target: <100ms)
- Error handling test: Render spec with invalid component type, verify error boundary shows message
- Scroll test: Large spec, verify editor and preview scroll independently
- Props test: Render spec with complex props, verify rendered correctly

---

### Phase 4: Render Tracking Dashboard (Dev Panel)

**Goal**: Display real-time metrics from RenderTracker in dev panel

**Duration**: 3-4 hours  
**Complexity**: Medium  
**Dependencies**: Phase 1, 2, 3 + RenderTracker system complete

**Files**:
- `src/components/SpecEditor/parts/DevPanel.tsx` (completed)
- `src/components/MetricsSummary/MetricsSummary.tsx`
- `src/components/ComponentTreeView/ComponentTreeView.tsx`
- `src/components/ComponentTreeView/TreeNode.tsx`
- `src/components/PropChangesPanel/PropChangesPanel.tsx`

**Implementation Steps**:

1. Create MetricsSummary component:
   - Display summary cards:
     - Total renders (across all components)
     - Most frequently rendered component
     - Average render duration
     - Render reason distribution
   - Subscribe to RenderTracker updates
   - Refresh on every tracker update
2. Create ComponentTreeView component:
   - Recursively render component hierarchy from spec
   - Each row shows:
     - Component name/type
     - Render count badge
     - Last render reason with color coding
     - Duration in ms
   - Expandable/collapsible nodes
   - Click to select component for details
3. Create TreeNode sub-component:
   - Handles individual component display
   - Shows icon for component type
   - Highlight recently-rendered components (fade effect)
   - Render reason color coding:
     - 🔄 blue: props_changed
     - ⚡ yellow: parent_rerender
     - 🎯 orange: state_change
     - 📦 purple: context_change
     - ⭐ green: initial_render
4. Create PropChangesPanel component:
   - Show props changed on last render for selected component
   - Display before/after values
   - Highlight changed keys
   - JSON formatting for complex values
5. Wire up tracking subscription:
   - Import useRenderTracker hook
   - Get tracker instance
   - Subscribe to render events
   - Update displayed metrics on each render
   - Unsubscribe on unmount

**Exit Criteria**:
- ✅ Metrics summary displays all target metrics
- ✅ Component tree renders spec hierarchy correctly
- ✅ Metrics update in real-time on preview renders
- ✅ Color-coding and icons consistent
- ✅ PropChangesPanel shows correct prop changes
- ✅ Performance: No lag with 50+ component specs
- ✅ Recently-rendered components highlighted

**Acceptance Tests**:
- Metrics test: Render spec, verify metrics count increases
- Tree test: Render complex nested spec, verify tree displays full hierarchy
- Real-time test: Trigger re-renders in preview, verify metrics update instantly
- Performance test: Render 50-component spec, measure dev panel update latency (target: <50ms)
- Props test: Change prop in spec, verify PropChangesPanel shows correct before/after

---

### Phase 5: Spec Persistence, Templates & Keyboard Shortcuts

**Goal**: Complete UX with save/load, templates, and keyboard shortcuts

**Duration**: 2-3 hours  
**Complexity**: Low  
**Dependencies**: Phase 1-4 complete

**Files**:
- `src/components/SpecEditor/hooks/useAutoSave.ts`
- `src/components/SpecEditor/utils/specTemplates.ts`
- `src/components/SpecEditor/utils/specStorage.ts`
- `src/specs/examples/*.json` (template files)
- `src/components/SpecEditor/parts/Header.tsx` (update with templates/save)

**Implementation Steps**:

1. Create spec persistence:
   - Auto-save to file on change (debounced 1s)
   - Manual save button with visual feedback
   - Show last saved time
   - Unsaved indicator (dot on dirty changes)
2. Create template system:
   - Define templates in specTemplates.ts:
     - Empty spec
     - Grid layout
     - Card hierarchy
     - Dashboard with metrics
     - Form layout
   - Create corresponding JSON files in src/specs/examples/
   - Load template via button click
   - Warn if unsaved changes
3. Create spec selector/list:
   - List all specs in src/specs/ directory
   - Show in dropdown or sidebar
   - Click to load
   - Delete button (with confirmation)
   - Recently-accessed specs at top
4. Implement localStorage persistence:
   - Store column widths
   - Store theme preference (light/dark)
   - Store last-edited spec
   - Store recent specs list
5. Add keyboard shortcuts:
   - Ctrl+S / Cmd+S: Save
   - Ctrl+K Ctrl+F / Cmd+K Cmd+F: Format JSON
   - Ctrl+L: Focus editor
   - F5: Reset tracking
   - Ctrl+- / Cmd+-: Decrease font size
   - Ctrl++ / Cmd++: Increase font size
6. Implement theme toggle:
   - Light/dark theme switch in settings
   - Apply to editor, UI, background
   - Persist preference

**Exit Criteria**:
- ✅ Spec saves to file on dirty change
- ✅ Manual save button works
- ✅ Templates load correctly
- ✅ Spec selector lists available specs
- ✅ localStorage persists state across reload
- ✅ Keyboard shortcuts functional
- ✅ Theme toggle works

**Acceptance Tests**:
- Save test: Edit spec, close and re-open, verify spec persisted
- Template test: Load each template, verify content loads correctly
- Selector test: Create multiple specs, verify all listed in selector
- Shortcut test: Test each shortcut, verify expected behavior
- Theme test: Toggle theme, verify UI updates

---

## Task Details

### Detailed Implementation Tasks

**Phase 1 Tasks**:
- [ ] Create SpecEditor.tsx with CSS Grid layout
- [ ] Create useSpecEditor hook with state
- [ ] Create Header component
- [ ] Implement column resize functionality
- [ ] Add localStorage for column widths
- [ ] Create responsive media queries
- [ ] Unit tests for useSpecEditor
- [ ] Integration test for layout

**Phase 2 Tasks**:
- [ ] Install editor library (Monaco or Ace)
- [ ] Create JSONEditor wrapper component
- [ ] Create specValidation.ts utility
- [ ] Create useDebounce hook
- [ ] Implement editor shortcuts
- [ ] Create format/clear buttons
- [ ] Add error display inline
- [ ] Unit tests for validation
- [ ] Integration test for editor state sync

**Phase 3 Tasks**:
- [ ] Create ErrorBoundary component
- [ ] Implement PreviewPanel layout
- [ ] Connect to SpecRenderer
- [ ] Add "no spec" placeholder
- [ ] Test error boundary catches errors
- [ ] Measure edit→preview latency
- [ ] Integration test for live sync

**Phase 4 Tasks**:
- [ ] Create MetricsSummary component
- [ ] Create ComponentTreeView with recursion
- [ ] Create TreeNode component
- [ ] Create PropChangesPanel
- [ ] Integrate useRenderTracker hook
- [ ] Subscribe to tracker updates
- [ ] Color-code render reasons
- [ ] Add recently-rendered highlighting
- [ ] Unit tests for tree rendering
- [ ] Performance test with 50+ components

**Phase 5 Tasks**:
- [ ] Create useAutoSave hook
- [ ] Implement file save via filesystem API or backend
- [ ] Create specTemplates.ts with definitions
- [ ] Create template JSON files
- [ ] Implement template selector
- [ ] Create spec selector component
- [ ] Add localStorage utilities
- [ ] Implement all keyboard shortcuts
- [ ] Create theme toggle
- [ ] Unit tests for persistence
- [ ] Integration test for full workflow

---

## Dependencies & Order

**Critical Path**:
1. RenderTracker system (Phases 1-5) must be complete
2. Phase 1 (Layout) → No dependencies
3. Phase 2 (Editor) → Depends on Phase 1
4. Phase 3 (Preview) → Depends on Phase 1, 2
5. Phase 4 (DevPanel) → Depends on Phase 1, 2, 3 + RenderTracker
6. Phase 5 (Polish) → Depends on Phase 1-4

**Parallelizable**:
- Phase 2 and Phase 4 can be worked on in parallel after Phase 1 (they don't directly depend on each other)

**Timeline**:
- Phase 1: 3-4h (1 developer)
- Phase 2: 3-4h (1 developer)
- Phase 3: 2-3h (1 developer)
- Phase 4: 3-4h (1 developer)
- Phase 5: 2-3h (1 developer)
- Testing/QA: 2-3h
- **Total**: 15-21 hours (~2-3 days with one developer)

---

## Integration Checkpoints

### After Phase 1
**Checkpoint**: Layout system is solid
- [ ] 3-column layout renders correctly
- [ ] Column resizing works smoothly
- [ ] State management pattern established
- [ ] Responsive design verified
- **Verification**: Visual inspection + responsive testing

### After Phase 2
**Checkpoint**: Editor is functional
- [ ] JSON editor displays and accepts input
- [ ] Validation works and shows errors
- [ ] Keyboard shortcuts functional
- [ ] State syncs with preview system
- **Verification**: Manual testing + unit tests

### After Phase 3
**Checkpoint**: Live preview works
- [ ] Spec changes cause instant preview updates
- [ ] Error boundary catches errors
- [ ] No crashes on invalid specs
- [ ] Feedback latency < 100ms
- **Verification**: Performance profiling + manual testing

### After Phase 4
**Checkpoint**: Dev panel displays metrics
- [ ] Metrics display correctly
- [ ] Updates in real-time
- [ ] Component tree renders full hierarchy
- [ ] Performance acceptable with 50+ components
- **Verification**: Integration tests + performance testing

### After Phase 5
**Checkpoint**: Full system ready for use
- [ ] All features implemented
- [ ] Persistence working
- [ ] Keyboard shortcuts functional
- [ ] All tests passing
- **Verification**: Full integration test + user acceptance criteria

---

## Integration Checkpoints

### With RenderTracker System
- **Point**: Phase 4 (Dev Panel) requires tracker instance
  - Verify `useRenderTracker()` hook available
  - Verify `tracker.getAllStats()` returns data
  - Verify subscriptions work

### With Existing Renderer
- **Point**: Phase 3 (Preview) uses existing SpecRenderer
  - Verify SpecRenderer accepts spec prop
  - Verify components wrapped with withRenderTracking
  - Verify error propagation to error boundary

### With Existing App Structure
- **Point**: Phase 1 (Layout) must integrate with App.tsx
  - Add route or component to App
  - Add RenderTrackerProvider (from render tracker system)
  - Verify context available to all child components

---

## Testing Strategy

### Unit Tests

**specValidation.ts**:
- Valid JSON parses correctly
- Invalid JSON caught and error returned
- Schema validation detects missing required fields
- Line numbers in errors accurate

**specTemplates.ts**:
- All templates return valid specs
- Empty template is truly empty
- Each template has required fields

**useSpecEditor hook**:
- Initial state is correct
- setState updates state correctly
- Dirty flag toggles on change
- Reset clears changes

**useDebounce hook**:
- Debounces function calls
- Timer starts on first call
- Multiple calls within timeout ignored
- Function called once after timeout

### Integration Tests

**SpecEditor system**:
- Edit JSON in editor → state updates
- State update → preview re-renders
- Preview render → tracker updates
- Tracker update → dev panel re-renders

**Editor → Preview → DevPanel flow**:
- Load template
- Edit prop value
- Preview updates
- DevPanel shows prop change
- Metrics increment
- All within 100ms

**Error handling**:
- Invalid JSON in editor → error shown
- Invalid component type → error boundary catches
- Invalid spec structure → validation error shown
- Corrupted localStorage → graceful fallback

**Persistence**:
- Column widths saved and restored
- Last spec loaded on app open
- Recent specs list maintained
- Theme preference persists

### Performance Tests

- Load 50-component spec → renders <200ms
- Edit debouncing → <10 onChange calls per second
- Dev panel metrics → updates <50ms after render
- Theme toggle → instant (no layout shift)
- Column resize drag → 60fps

### E2E Tests (if using Playwright/Cypress)

**Complete workflow**:
1. Open SpecEditor
2. Load grid-layout template
3. Edit prop in spec
4. Verify preview updates
5. Verify metrics in dev panel
6. Save spec
7. Close and re-open
8. Verify spec persisted

---

## Implementation Tips & Gotchas

### Tips

1. **Editor library**: Monaco is heavy (5MB+). Consider lazy-loading on first use.
2. **Debouncing**: Use custom hook to avoid re-creating debounce function on each render.
3. **ResizeObserver**: Use for measuring element sizes on column resize, not just mouse position.
4. **Virtual scrolling**: Implement for component tree if >100 components to keep performance.
5. **Error messages**: Make them actionable ("Expected `type` key" is better than "Invalid JSON").
6. **Keyboard shortcuts**: Check for conflict with browser shortcuts (Ctrl+N, Ctrl+W, etc.).

### Gotchas

1. **State sync**: Editor state, preview state, and tracking state must stay in sync. Use a single source of truth (useSpecEditor hook).
2. **Error recovery**: If spec becomes invalid mid-edit, preserve the invalid string in editor (don't reset). Let user fix it.
3. **Infinite loops**: Prevent editor onChange → parse → setState → component re-render → onChange again. Use debounce.
4. **localStorage quota**: Specs could be large. Implement size limits or compression if needed.
5. **Theme persistence**: Don't use CSS variables if they update via JS - use CSS classes for instant theme switch.
6. **ResizeObserver leaks**: Always disconnect resize observers on unmount.
7. **Focus management**: After template load, return focus to editor so user can immediately start typing.
8. **Mobile layout**: Stack all panels vertically - not always 3 columns. Use media queries.

---

## Success Criteria (Final)

**MVP (End of Phase 3)**:
- ✅ 3-column layout renders correctly
- ✅ JSON editor with validation works
- ✅ Live preview updates spec changes <100ms
- ✅ Error boundary catches render errors
- ✅ Responsive on desktop/mobile

**Beta (End of Phase 4)**:
- ✅ All above + 
- ✅ Dev panel displays metrics
- ✅ Real-time tracking updates
- ✅ Component tree renders correctly
- ✅ Performance acceptable with 50+ components

**Production (End of Phase 5)**:
- ✅ All above +
- ✅ Specs persist to filesystem
- ✅ Templates available
- ✅ Keyboard shortcuts work
- ✅ Theme toggle works
- ✅ localStorage persists preferences
- ✅ All tests passing (>80% coverage)
- ✅ Accessibility audit passed

---

## Rollout Plan

**Phase 1: Internal Testing**
- Implement Phases 1-4
- Internal team uses SpecEditor for spec creation
- Gather feedback on UX
- Performance profile under load

**Phase 2: Beta with Dev Community**
- Implement Phase 5
- Feature flag to enable SpecEditor
- Invite early adopters to test
- Collect real-world usage metrics

**Phase 3: General Availability**
- Announce SpecEditor availability
- Link in documentation
- Include in tutorial

---

## Related Documents

- [Spec Editor UI Specification](./SPEC_EDITOR_UI_SPEC.md) - Feature requirements
- [Render Tracker Implementation Plan](../IMPLEMENTATION_PLAN.md) - Metrics engine
- [Architecture Guide](../ARCHITECTURE_GUIDE.md) - System design

---

**Document Version**: 1.0  
**Last Updated**: April 7, 2026  
**Next Review**: After Phase 1 completion  
**Estimated Completion**: April 10-12, 2026
