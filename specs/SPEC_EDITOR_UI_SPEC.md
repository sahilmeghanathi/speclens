# Spec Editor UI - Feature Specification

**Feature**: Spec Editor UI for SpecLens  
**Version**: 1.0  
**Status**: Specification  
**Date**: April 7, 2026  
**Author**: SpecLens Product Team

---

## 1. Problem Statement

SpecLens developers currently lack an integrated interface for iterating on UI specifications. Current workflow requires:
- Editing raw JSON specs in separate files
- Building and reloading the app to see changes
- Manually tracking render behavior across scattered components
- No unified feedback loop

This friction prevents rapid prototyping and makes performance optimization invisible.

**Pain Points**:
- No live preview of spec changes
- Render tracking data inaccessible during development
- Delayed feedback from edit → render cycle
- Manual context-switching between editor and output
- Difficult to correlate spec changes with render metrics

---

## 2. Goals

**Primary**: Provide a unified, real-time interface where developers can edit JSON specs, instantly preview rendered UIs, and observe render tracking metrics in parallel.

**Secondary**:
- Enable rapid iteration and experimentation with specs
- Make render behavior visible during development
- Create foundation for future spec generation tools
- Establish best practices for spec-driven UI workflow
- Support both simple and complex spec hierarchies

**Experience Goals**:
- One-screen, no-navigation editing experience
- Sub-100ms feedback latency between edit and preview update
- Clear visual separation of concerns (edit/preview/debug)
- Minimal distraction during focused editing work

---

## 3. Non-Goals

- Spec generation from UI (future AI feature)
- Browser DevTools integration
- Remote spec collaboration
- Spec versioning/git integration
- Export/import of component libraries
- Visual drag-and-drop spec builder (future enhancement)
- Performance profiling/flamegraph visualization (future enhancement)

---

## 4. Requirements

### 4.1 Spec Editor

**Req 4.1.1**: JSON Spec Editing
- **What**: Full JSON editor with syntax highlighting and validation
- **Features**:
  - Syntax highlighting for JSON
  - Real-time validation with error messages
  - Line numbers and code folding
  - Undo/redo functionality
  - Search and replace
  - Auto-formatting/prettify option
- **Supported Schemas**: Any valid SpecLens spec (recursive component trees)
- **Success Criteria**: 
  - Valid specs parse without errors
  - Invalid JSON shows clear error messages
  - Changes trigger preview updates within 100ms

**Req 4.1.2**: Spec Persistence
- **What**: Save edited specs to workspace
- **Options**:
  - Auto-save to file on change (configurable delay: 500-1000ms)
  - Manual save button with visual feedback
  - Dirty state indicator
- **Output Location**: `src/specs/` directory (configurable)
- **Success Criteria**: Edits persist across app reload

**Req 4.1.3**: Spec Templates & Examples
- **What**: Quick-start templates for common patterns
- **Included**:
  - Empty spec template
  - Grid layout example
  - Card hierarchy example
  - Dashboard with statistics
  - Form layout example
- **Access**: Load template with single click
- **Success Criteria**: New specs can be created from templates

**Req 4.1.4**: Spec Switching
- **What**: Switch between multiple specs without losing edits
- **Features**:
  - Dropdown or sidebar list of available specs
  - Unsaved changes warning on switch
  - Quick-load recent specs
- **Success Criteria**: Can quickly switch specs and maintain edit state

---

### 4.2 Live Preview

**Req 4.2.1**: Dynamic UI Rendering
- **What**: Render spec into UI in real-time as JSON is edited
- **Behavior**: Updates occur whenever valid spec is available
- **Error Handling**: Show user-friendly error boundary when spec invalid
- **Success Criteria**: 
  - Valid specs render immediately
  - Invalid specs show error without breaking preview
  - Complex specs (10+ nested levels) render smoothly

**Req 4.2.2**: Component Registry Access
- **What**: Preview must access full component registry
- **Includes**: Card, Grid, StatCard, and custom user components
- **Behavior**: Unknown component types show clear "Component not found" message
- **Success Criteria**: All registered components render correctly in preview

**Req 4.2.3**: Props & Children Rendering
- **What**: Props and children from spec correctly passed to components
- **Features**:
  - Props objects rendered as-is
  - Children arrays properly nested
  - Computed props (functions, callbacks) supported
- **Success Criteria**: Rendered output matches expected structure

**Req 4.2.4**: Scroll & Overflow Handling
- **What**: Handle content larger than viewport
- **Behavior**:
  - Independent scrolling for preview area
  - Fixed header/footer if needed (configurable per layout)
  - Smooth scroll performance
- **Success Criteria**: Large specs scrollable without lag

---

### 4.3 Render Tracking Dashboard

**Req 4.3.1**: Real-Time Metrics Display
- **What**: Live display of render tracking data from RenderTracker
- **Metrics Shown**:
  - Total render count per component (cumulative during session)
  - Last render timestamp (relative: "2s ago")
  - Average render duration (milliseconds)
  - Render reason on last render (with color coding)
  - Props changed indicator
- **Refresh Rate**: Update on every render (sync with actual renders)
- **Success Criteria**:
  - Metrics update immediately when preview renders
  - Accurate counts and durations
  - Data formatting clear and scannable

**Req 4.3.2**: Component Tree View
- **What**: Hierarchical view of component instances with metrics
- **Structure**:
  - Mirror spec hierarchy
  - Expandable/collapsible components
  - Inline metrics for each component (render count, reason)
- **Interaction**:
  - Click component row to see detailed stats
  - Indicator for components with "high" render counts (>5 per session)
  - Visual highlighting of recently-rendered components (fade effect)
- **Success Criteria**:
  - Tree accurately represents rendered spec
  - Expandable to any depth
  - Responsive to renders (updates in real-time)

**Req 4.3.3**: Prop Change History
- **What**: Track and display prop changes across renders
- **Display**:
  - List of changed props on last render
  - Before/after values
  - Highlight changed keys
- **Features**:
  - Collapsible prop details
  - JSON formatting for complex values
- **Success Criteria**: Developers can quickly see what changed

**Req 4.3.4**: Render Metrics Summary
- **What**: Aggregate stats across all tracked components
- **Metrics**:
  - Total renders (sum across all components)
  - Most frequently rendered component
  - Average renders per component
  - Components with expensive renders (>1ms)
  - Render reason distribution (pie chart or bars)
- **Success Criteria**: Quick overview of session health

---

### 4.4 Layout & UI/UX

**Req 4.4.1**: Three-Column Layout
- **What**: Simultaneous display of editor, preview, and dev panel (no toggles)
- **Structure**:
  ```
  ┌─────────────┬─────────────┬──────────────┐
  │   Editor    │   Preview   │  Dev Panel   │
  │             │             │ (Tracking)   │
  │  (33%)      │   (33%)     │   (33%)      │
  │             │             │              │
  └─────────────┴─────────────┴──────────────┘
  ```
- **Resizable**: Column widths draggable with min/max constraints
- **Responsive**: Fallback to stacked layout on smaller screens (<1024px)
- **Success Criteria**: All three sections visible and usable simultaneously

**Req 4.4.2**: Header Bar
- **What**: Top navigation and controls
- **Contents**:
  - SpecLens logo/title
  - Spec selector dropdown/list
  - Save button with dirty indicator
  - Template selector
  - Settings icon (hover menu)
  - Reset/clear buttons
- **Heights**: ~48px, sticky to top
- **Success Criteria**: Quick access to common actions

**Req 4.4.3**: Editor Section
- **What**: Left column containing JSON editor
- **Features**:
  - Line numbers
  - Syntax highlighting
  - Real-time validation
  - Status: "✓ Valid" or "✗ Error" indicator
- **Styling**: Dark theme editor (Monaco/Ace style)
- **Font**: Monospace (Fira Code or similar)
- **Success Criteria**: Comfortable editing experience

**Req 4.4.4**: Preview Section
- **What**: Center column showing rendered UI
- **Features**:
  - Clean white/light background
  - Scrollable content area
  - Error boundary with clear messages
  - "No spec loaded" placeholder
  - Component highlight on hover (subtle border)
- **Styling**: Match production UI styling
- **Success Criteria**: Preview clearly shows rendered output

**Req 4.4.5**: Dev Panel Section
- **What**: Right column with render tracking data
- **Organization**:
  - **Top**: Metrics summary cards (Total Renders, Most Rendered, etc.)
  - **Middle**: Component tree with render metrics
  - **Bottom**: Detailed prop changes for selected component
- **Scrollable**: Independent scroll for dev panel content
- **Success Criteria**: All tracking data visible and organized

**Req 4.4.6**: Dark/Light Theme Support
- **What**: Support both light and dark color schemes
- **Scope**: Editor and UI styling
- **Toggle**: Theme switcher in header
- **Persistence**: Remember user choice
- **Success Criteria**: Readable in both themes

---

### 4.5 Editor-to-Preview Integration

**Req 4.5.1**: Live Synchronization
- **What**: Changes in editor immediately reflect in preview
- **Mechanism**:
  - Debounce editor onChange events (200-300ms)
  - Parse JSON and validate
  - If valid, re-render preview
  - Update render tracker metrics
- **Error Recovery**: If spec becomes invalid, show error; on fix, auto-recover
- **Success Criteria**: <100ms between keypress and preview update

**Req 4.5.2**: Syntax Validation
- **What**: Real-time JSON validation
- **Feedback**:
  - Underline invalid JSON in editor
  - Show error message (tooltip or inline)
  - Disable preview until valid
- **Success Criteria**: Developers know immediately if spec is malformed

**Req 4.5.3**: Spec Structure Hints
- **What**: Autocomplete and documentation for spec keys
- **Features**:
  - Suggest component types from registry
  - Autocomplete for common keys: `type`, `props`, `children`
  - JSDoc-style hints for required vs optional fields
- **Success Criteria**: Faster spec authoring with autocomplete

---

### 4.6 Developer Experience

**Req 4.6.1**: Keyboard Shortcuts
- **Shortcuts**:
  - `Ctrl+S` / `Cmd+S`: Save current spec
  - `Ctrl+K Ctrl+F` / `Cmd+K Cmd+F`: Format JSON
  - `Ctrl+Z` / `Cmd+Z`: Undo
  - `Ctrl+Y` / `Cmd+Y`: Redo
  - `Ctrl+L`: Focus editor
  - `F5` / `Ctrl+R`: Reset tracking data
- **Success Criteria**: Keyboard-efficient workflow

**Req 4.6.2**: Context & Help
- **What**: Contextual information and guidance
- **Features**:
  - Tooltip for each section explaining purpose
  - Link to component registry documentation
  - "View docs" link in dev panel
  - Quick-reference spec format card
- **Success Criteria**: New developers can self-onboard

**Req 4.6.3**: Keyboard Navigation
- **What**: Full keyboard navigation across interface
- **Tab Order**: Editor → Preview → Dev Panel
- **Features**:
  - Focus indicators clear and visible
  - Arrow keys to navigate component tree in dev panel
- **Success Criteria**: Power users can navigate without mouse

---

### 4.7 Performance & Reliability

**Req 4.7.1**: Responsive to Complex Specs
- **What**: Handle specs with high component count efficiently
- **Target**: 50+ nested components render in <200ms
- **Success Criteria**: No freezing or lag with complex specs

**Req 4.7.2**: Memory Management
- **What**: Prevent memory leaks with large render histories
- **Strategy**:
  - Cap render history at 100 events per component (configurable)
  - Cleanup on unmount
  - Serialize only essential data
- **Success Criteria**: No unbounded memory growth over session

**Req 4.7.3**: Error Boundaries
- **What**: Gracefully handle component render errors
- **Behavior**:
  - Catch errors in preview
  - Show error message without crashing entire interface
  - Preserve editor and tracking panel
- **Success Criteria**: App remains usable even with broken preview

**Req 4.7.4**: Session Recovery
- **What**: Recover from crashes or reloads
- **Features**:
  - Last spec auto-saved to localStorage
  - Tracking data lost on reload (acceptable)
  - Recent specs list persisted
- **Success Criteria**: No work lost on accidental reload

---

## 5. Architecture & Design

### 5.1 Component Hierarchy

```
SpecEditorUI (Main Container)
├─ Header
│  ├─ Logo/Title
│  ├─ SpecSelector
│  ├─ SaveButton
│  ├─ TemplateMenu
│  └─ SettingsMenu
├─ MainLayout (3-column grid)
│  ├─ EditorPanel
│  │  ├─ JSONEditor (Monaco/Ace)
│  │  └─ ValidationStatus
│  ├─ PreviewPanel
│  │  ├─ ErrorBoundary
│  │  ├─ PreviewContainer
│  │  └─ SpecRenderer
│  └─ DevPanel
│     ├─ MetricsSummary
│     ├─ ComponentTreeView
│     └─ PropChangesPanel
└─ Footer (optional)
   └─ StatusBar
```

### 5.2 Data Flow

```
User types in Editor
       ↓
onChange → debounce (300ms)
       ↓
Parse JSON & validate
       ↓
  Valid?
   /  \
  Y    N → Show error in editor
  ↓       (preview stays previous)
Pass spec to SpecRenderer
       ↓
Renderer creates React tree from spec
       ↓
Components wrapped with withRenderTracking
       ↓
RenderTracker captures metrics
       ↓
DevPanel subscribes to tracker updates
       ↓
Metrics displayed in real-time
```

### 5.3 State Management

**Editor State**:
- Current spec JSON (string)
- Dirty flag (unsaved changes)
- Validation errors (if any)

**Preview State**:
- Parsed spec object (if valid)
- Current rendered React tree
- Render error (if any)

**Tracking State**:
- Connected to global RenderTracker instance
- Subscribed to render events
- Cached metrics for display

**UI State**:
- Column widths (resizable)
- Active tab/section
- Theme (light/dark)
- Recent specs list

**Persistence**:
- Current spec → file on save
- Column widths → localStorage
- Theme preference → localStorage
- Recent specs → localStorage

---

## 6. Implementation Considerations

### 6.1 Technology Stack

- **Editor**: Monaco Editor (VS Code-like) or Ace
  - Reason: Industry standard, great JSON support
  - Alternative: CodeMirror (lighter, slower)

- **Editor Library**: `@monaco-editor/react` or `react-ace`

- **JSON Parsing**: Native JSON + Zod or `joi` for schema validation

- **Styling**: CSS Modules or Tailwind CSS (existing stack)

- **State Management**: React Context (useReducer) or Zustand
  - Reason: Simple requirements, no complex async

### 6.2 File Organization

```
src/
├── components/
│  ├── SpecEditor/
│  │  ├── SpecEditor.tsx (main container)
│  │  ├── SpecEditor.css
│  │  ├── parts/
│  │  │  ├── Header.tsx
│  │  │  ├── EditorPanel.tsx
│  │  │  ├── PreviewPanel.tsx
│  │  │  └─ DevPanel.tsx
│  │  └─ hooks/
│  │     ├─ useSpecEditor.ts
│  │     ├─ useAutoSave.ts
│  │     └─ useDebounce.ts
│  ├── SpecSelector/
│  │  └─ SpecSelector.tsx
│  ├── MetricsSummary/
│  │  └─ MetricsSummary.tsx
│  └─ ComponentTreeView/
│     └─ ComponentTreeView.tsx
├── core/
│  ├── specEditorTypes.ts
│  └─ specTemplates.ts
└─ specs/
   ├─ examples/
   │  ├─ basic.json
   │  ├─ dashboard.json
   │  └─ form.json
   └─ templates/
      └─ (same as examples)
```

### 6.3 Integration Points

**With RenderTracker**:
- Import `useRenderTracker()` hook in DevPanel
- Subscribe to tracker changes
- Call `tracker.getAllStats()` for metrics

**With Renderer**:
- DevPanel imports `SpecRenderer` component
- Pass validated spec to renderer
- Catch render errors via ErrorBoundary

**With Registry**:
- Get list of component types from registry
- Use for editor autocomplete
- Validate spec component types

### 6.4 Edge Cases

1. **Empty spec**: Show template selector, not error
2. **Invalid JSON**: Show syntax error, keep old preview
3. **Unknown component type**: Show error in preview, not full crash
4. **Very large prop values**: Truncate/summarize in dev panel
5. **Circular references**: Handle gracefully in serialization
6. **Render loops**: Detect excessive renders, show warning

### 6.5 Testing Strategy

**Unit Tests**:
- Spec validation logic
- Auto-save debouncing
- Metrics aggregation
- Component tree parsing

**Integration Tests**:
- Full edit → preview → track cycle
- Save/load functionality
- Error recovery
- Column resizing

**E2E Tests** (if using Playwright/Cypress):
- Complete user workflow: edit spec → see preview → check metrics
- Dark/light theme switching
- Keyboard shortcuts

### 6.6 Performance Optimizations

1. **Debounce editor changes** (300ms) to avoid constant re-renders
2. **Memoize metrics calculations** (recompute only on tracker updates)
3. **Virtual scrolling** for component tree (if >100 components)
4. **Lazy-load editor** (Monaco is heavy, defer until user opens)
5. **Cache parsed specs** to avoid re-parsing identical JSON

### 6.7 Accessibility

- ARIA labels for all sections
- Semantic HTML (headers, main, nav, etc.)
- Keyboard navigation support (Req 4.6.3)
- Focus indicators clear and visible
- Color contrast meets WCAG AA
- Screen reader support for metrics

---

## 7. Success Criteria

### Phase 1: MVP (Editor + Preview)
- ✅ JSON editor with syntax highlighting works
- ✅ Specs parse and render in preview
- ✅ Live synchronization (edit → preview) works
- ✅ Error handling for invalid specs
- ✅ Basic layout with 2-column view (editor + preview)

### Phase 2: DevTools Integration
- ✅ Dev panel displays render metrics
- ✅ Component tree view shows hierarchy
- ✅ Metrics update in real-time
- ✅ 3-column layout responsive
- ✅ Themes (light/dark) switchable

### Phase 3: Polish & Refinement
- ✅ Save/load specs from files
- ✅ Templates for new specs
- ✅ Keyboard shortcuts implemented
- ✅ Performance tested (50+ components <200ms)
- ✅ Accessibility audit passed

---

## 8. Metrics & Measurement

**Usage Metrics** (to track post-launch):
- Time to edit first spec
- Average edits per session
- Most commonly edited spec structure
- User satisfaction rating

**Performance Metrics**:
- Edit → preview latency (target: <100ms)
- Complex spec render time (target: <200ms for 50 components)
- Memory usage over 1-hour session (target: <100MB)

**Adoption Metrics**:
- % of developers using SpecEditor at least once
- Feature usage frequency
- Support tickets related to SpecEditor

---

## 9. Future Enhancements (Out of Scope)

- Visual drag-and-drop spec builder
- AI-assisted spec generation from screenshots
- Spec diffing and version history
- Collaborative real-time editing
- Export specs to different formats (Vue, Svelte, etc.)
- Performance profiling with flamegraphs
- Browser DevTools integration
- Spec linting and best practices suggestions

---

## 10. Risks & Mitigations

| Risk | Likelihood | Severity | Mitigation |
|------|------------|----------|-----------|
| Editor library is heavy (Monaco 5MB+) | Medium | Medium | Lazy-load editor, minify, or switch to lighter alternative |
| Complex specs slow down preview | Medium | High | Implement virtual rendering, memoization, debouncing |
| DevPanel metrics out of sync | Low | High | Subscribe directly to tracker events, avoid polling |
| Breaking changes to spec format | Low | Medium | Maintain backward-compat in renderer, version specs |
| Users confused by 3-column layout | Low | Medium | Onboarding tooltips, keyboard shortcuts, docs |

---

## 11. Timeline & Effort Estimate

| Phase | Tasks | Duration | Effort |
|-------|-------|----------|--------|
| Phase 1: MVP | Editor + Preview | 2-3 days | 16-20h |
| Phase 2: DevTools | Dev Panel + Metrics | 2-3 days | 16-20h |
| Phase 3: Polish | Save, templates, UX | 1-2 days | 8-12h |
| Testing & QA | Tests, accessibility | 1-2 days | 8-12h |
| **Total** | | **6-10 days** | **48-64h** |

---

## 12. Related Documents

- [Architecture Guide](../ARCHITECTURE_GUIDE.md) - System design overview
- [Render Tracker Specification](./RENDER_TRACKER_SPEC.md) - Metrics engine
- [Implementation Plan](../IMPLEMENTATION_PLAN.md) - Development roadmap

---

## Appendix A: Example Spec for Testing

```json
{
  "type": "Grid",
  "props": { "columns": 3, "gap": 16 },
  "children": [
    {
      "type": "Card",
      "id": "card-1",
      "props": {
        "title": "Users",
        "description": "Active users this month"
      }
    },
    {
      "type": "StatCard",
      "id": "stat-1",
      "props": {
        "value": 1200,
        "label": "Total Revenue",
        "trend": "up"
      }
    },
    {
      "type": "Grid",
      "id": "nested-grid",
      "props": { "columns": 2 },
      "children": [
        {
          "type": "Card",
          "props": { "title": "Nested Card 1" }
        },
        {
          "type": "Card",
          "props": { "title": "Nested Card 2" }
        }
      ]
    }
  ]
}
```

---

## Appendix B: UI Mockup (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SpecLens | Spec: dashboard.json [✓ Valid] [Save] [ + New] [⚙️ Settings]    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ┌──────────────────┬──────────────────┬──────────────────────────────────┐ │
│ │                  │                  │ Metrics Summary                  │ │
│ │                  │                  │ ┌──────────────────────────────┐ │ │
│ │   EDITOR         │   PREVIEW        │ │ Total Renders: 47            │ │ │
│ │                  │                  │ │ Most Rendered:  Card (12x)   │ │ │
│ │ {                │                  │ │ Avg Duration:   0.45ms       │ │ │
│ │   "type": "G...  │   ┌────────────┐ │ │ Last Reason:    props_changed│ │ │
│ │   "props": {     │   │  Dashboard │ │ └──────────────────────────────┘ │ │
│ │     "cols": 3    │   │            │ │                                  │ │
│ │   },             │   │ [Card 1] [S]│ │ Component Tree                   │ │
│ │   "children": [  │   │ [Card 2] [S]│ │ ▼ Grid (47)                     │ │
│ │     {            │   │ [More...]  │ │   ├─ Card (12) 🔄 props       │ │
│ │       "type":... │   │            │ │   ├─ StatCard (18) 🔄 props   │ │
│ │       ...        │   └────────────┘ │   └─ Grid (17)                 │ │
│ │     }            │                  │     ├─ Card (8)                │ │
│ │   ]              │  [   Scrollable  ] │     └─ Card (9)                │ │
│ │ }                │   [   Content    ] │                                  │ │
│ │                  │                  │ Prop Changes (last render)       │ │
│ │ [Line 1/25]      │                  │ ┌──────────────────────────────┐ │ │
│ │ [✓ Valid JSON]   │                  │ │ - title: "Users" → "Active" │ │ │ │
│ │                  │                  │ │ + new prop: "badge" = "NEW  │ │ │
│ │                  │                  │ │                              │ │ │ │
│ │                  │                  │ └──────────────────────────────┘ │ │
│ └──────────────────┴──────────────────┴──────────────────────────────────┘ │
│                                                                              │
│ Status: Ready | Renders: 47 | Cache: 2.1MB | Theme: 🌙 Dark               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

**Document Version**: 1.0  
**Last Updated**: April 7, 2026  
**Next Review**: After Phase 1 completion
