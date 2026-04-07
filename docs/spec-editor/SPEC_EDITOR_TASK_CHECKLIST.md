# Spec Editor UI - Task Checklist

**Status**: Ready to Begin Implementation  
**Start Date**: April 7, 2026  
**Target Completion**: April 10-12, 2026 (3-4 days at ~5-6h/day)

---

## Phase 1: Layout Infrastructure & State Management 🎨

**Objective**: Build 3-column layout system with foundational state management  
**Duration**: 4-4.5 hours  
**Status**: Not Started

### Task 1.1: Create CSS Grid Layout System
- [ ] Create `src/components/SpecEditor/SpecEditor.css`
- [ ] Define CSS Grid for 3-column layout (33% each)
- [ ] Implement mobile responsive media queries (<768px: stack)
- [ ] Implement tablet responsive media queries (768-1024px: editor top, preview/dev side)
- [ ] Add resizable divider styles (cursor: col-resize, background on hover)
- [ ] Define colors: editor background, preview background, dev panel background
- [ ] Define padding/margin/gap constants (16px, 24px)
- [ ] Export CSS variables for reuse
- [ ] Test at 1920px, 1024px, 768px, 320px viewports
- **Time**: 45 min | **Assigned**: | **Completed**: 

### Task 1.2: Create Main SpecEditor Container Component
- [ ] Create `src/components/SpecEditor/SpecEditor.tsx`
- [ ] Import CSS Grid layout
- [ ] Render 3-column grid structure with dividers
- [ ] Create state for column widths (default: 33% each)
- [ ] Create state for current tab (desktop: all visible, mobile: tabs)
- [ ] Render Header, EditorPanel, PreviewPanel, DevPanel placeholders
- [ ] Add resize dividers between columns (visual elements only)
- [ ] Accept spec prop (JSON string) from parent
- [ ] Export SpecEditor component
- **Time**: 45 min | **Assigned**: | **Completed**: 

### Task 1.3: Create useSpecEditor State Management Hook
- [ ] Create `src/components/SpecEditor/hooks/useSpecEditor.ts`
- [ ] Define SpecEditorState interface:
  - `specJson: string` (raw JSON)
  - `parsedSpec: object | null` (parsed, if valid)
  - `validationErrors: ValidationError[] | null`
  - `isDirty: boolean`
  - `selectedComponentId: string | null` (for dev panel)
  - `isSaving: boolean`
- [ ] Implement state update functions:
  - `setSpecJson(json: string): void`
  - `setParsedSpec(spec: object): void`
  - `setValidationErrors(errors: ValidationError[]): void`
  - `setDirty(isDirty: boolean): void`
  - `setSelectedComponentId(id: string | null): void`
  - `reset(): void`
- [ ] Export useSpecEditor as custom hook using useReducer
- [ ] Add JSDoc for all methods
- **Time**: 45 min | **Assigned**: | **Completed**: 

### Task 1.4: Create Header Component
- [ ] Create `src/components/SpecEditor/parts/Header.tsx`
- [ ] Create `src/components/SpecEditor/parts/Header.css`
- [ ] Display SpecLens logo/title (left side)
- [ ] Display dirty indicator (dot) next to title
- [ ] Create spec selector dropdown placeholder (middle)
- [ ] Create button group (right side):
  - Save button (disabled if not dirty)
  - New button
  - Reset button
  - Settings icon (hover menu)
- [ ] Style: 48px height, sticky to top, shadow below
- [ ] Use theme colors (light/dark support)
- [ ] Add keyboard shortcut hints in button tooltips
- **Time**: 45 min | **Assigned**: | **Completed**: 

### Task 1.5: Create useColumnResize Hook
- [ ] Create `src/components/SpecEditor/hooks/useColumnResize.ts`
- [ ] Implement mouse drag listener for resize dividers
- [ ] Track mouse position and calculate new column widths
- [ ] Enforce min-width constraints (300px minimum per column on desktop)
- [ ] Return state: `{ leftWidth, middleWidth, rightWidth }`
- [ ] Persist widths to localStorage: `spec-editor-column-widths`
- [ ] Restore widths from localStorage on component mount
- [ ] Handle responsive breakpoint changes (reset to defaults on mobile)
- [ ] Add performance optimization: debounce resize calculations
- **Time**: 1 hour | **Assigned**: | **Completed**: 

### Task 1.6: Create EditorPanel, PreviewPanel, DevPanel Placeholders
- [ ] Create `src/components/SpecEditor/parts/EditorPanel.tsx`
  - Full-height container with scrollable content area
  - Render children prop
  - Apply left column width from resize hook
  - Style: dark background, monospace font area
- [ ] Create `src/components/SpecEditor/parts/PreviewPanel.tsx`
  - Full-height container, scrollable
  - Render children prop
  - Apply middle column width
  - Style: white/light background
- [ ] Create `src/components/SpecEditor/parts/DevPanel.tsx`
  - Full-height container, scrollable
  - Render children prop
  - Apply right column width
  - Style: light gray background
- [ ] Create `src/components/SpecEditor/parts/Header.css` for all panel styles
- **Time**: 45 min | **Assigned**: | **Completed**: 

### Task 1.7: Integrate useColumnResize into SpecEditor
- [ ] Import useColumnResize hook into SpecEditor
- [ ] Connect resize hook state to column width CSS variables
- [ ] Add resize divider elements between columns
- [ ] Style dividers: 1px gray line with hover highlight
- [ ] Implement mouse drag listeners on dividers
- [ ] Test resize persists on page reload
- [ ] Verify responsive behavior on different screen sizes
- **Time**: 45 min | **Assigned**: | **Completed**: 

### Task 1.8: Create Theme Support Infrastructure
- [ ] Create `src/components/SpecEditor/utils/themeManager.ts`
- [ ] Define light theme colors (background, text, accent)
- [ ] Define dark theme colors
- [ ] Implement `getTheme()` function (check localStorage or system preference)
- [ ] Implement `setTheme(theme: 'light' | 'dark')` function
- [ ] Create CSS custom properties for each theme
- [ ] Export theme constants for use in components
- [ ] Add to localStorage: `spec-editor-theme`
- **Time**: 30 min | **Assigned**: | **Completed**: 

**Phase 1 Complete**: [ ]

---

## Phase 2: JSON Spec Editor with Live Validation 📝

**Objective**: Implement fully functional JSON editor with real-time validation  
**Duration**: 3-4 hours  
**Status**: Blocked by Phase 1

### Task 2.1: Install and Configure Editor Library
- [ ] Run: `npm install @monaco-editor/react`
- [ ] Create `src/components/JSONEditor/JSONEditor.tsx`
- [ ] Import useCallback, useRef from React
- [ ] Configure Monaco Editor:
  - Language: json
  - Theme: 'vs-dark' (dark theme support added later)
  - Line numbers: on
  - Minimap: off (too much noise)
  - Font size: 13px
  - Font family: 'Fira Code', monospace
  - Tab size: 2 spaces
  - Automatic scrolling on line change
- [ ] Render Editor component with default empty spec
- [ ] Export JSONEditor component
- **Time**: 45 min | **Assigned**: | **Completed**: 

### Task 2.2: Create Spec Validation Utility
- [ ] Create `src/components/SpecEditor/utils/specValidation.ts`
- [ ] Define ValidationError interface:
  - `line: number`
  - `column: number`
  - `message: string`
  - `code: string` ('syntax_error' | 'schema_error' | 'type_error')
- [ ] Implement `parseJSONSafely(json: string): ParseResult`:
  - Try JSON.parse
  - Return ParseResult: `{ success: true, data } | { success: false, error }`
  - Include line/column info for JSON parse errors
- [ ] Implement `validateSpecSchema(spec: object): ValidationError[]`:
  - Check required fields: `type`
  - Check children is array if present
  - Check props is object if present
  - Recursively validate nested children
- [ ] Implement `validateSpec(json: string): ValidationResult`:
  - Combine parse + schema validation
  - Return array of validation errors
- [ ] Export all functions
- **Time**: 1 hour | **Assigned**: | **Completed**: 

### Task 2.3: Create useDebounce Hook
- [ ] Create `src/components/SpecEditor/hooks/useDebounce.ts`
- [ ] Generic hook: `<T>(value: T, delay: number): T`
- [ ] Use useEffect + useRef + setTimeout
- [ ] Return debounced value (not function)
- [ ] Clean up timeout on unmount
- [ ] Default delay: 300ms
- **Time**: 30 min | **Assigned**: | **Completed**: 

### Task 2.4: Wire Up Editor onChange with Validation
- [ ] Import ValidationError type and validateSpec function
- [ ] Update JSONEditor.tsx:
  - Add onChange handler: `(value: string) => setState(value)`
  - Pass state through useDebounce hook (300ms)
  - On debounced value change: validate and update state
  - Store validation errors in useSpecEditor hook
- [ ] Update SpecEditor to pass:
  - `specJson` to JSONEditor
  - `onSpecChange` handler
  - `validationErrors` to display
- [ ] Display validation errors inline:
  - Show as markers in editor (line underline)
  - Show tooltip on hover
  - Show error message below editor
- **Time**: 1 hour | **Assigned**: | **Completed**: 

### Task 2.5: Create EditorPanel with Editor Component
- [ ] Update `src/components/SpecEditor/parts/EditorPanel.tsx`:
  - Import JSONEditor component
  - Import useSpecEditor hook
  - Render JSONEditor with current spec
  - Connect onChange to hook's setSpecJson
  - Display validation status:
    - "✓ Valid JSON" badge (green) if no errors
    - "✗ Errors" badge (red) if errors exist
  - Show line count (e.g., "Line 1 of 25")
  - Render error list below editor if errors exist
- [ ] Style:
  - Editor takes full height
  - Status bar: 24px height, sticky to bottom
  - Error list: scrollable, max-height: 150px
- **Time**: 1 hour | **Assigned**: | **Completed**: 

### Task 2.6: Implement Keyboard Shortcuts
- [ ] Create `src/components/SpecEditor/utils/keyboardShortcuts.ts`
- [ ] Define shortcuts object:
  - `Ctrl+S / Cmd+S`: Save
  - `Ctrl+K Ctrl+F / Cmd+K Cmd+F`: Format JSON
  - `Ctrl+L`: Focus editor
  - `F5`: Reset tracking data
- [ ] Implement handler registration via useEffect
- [ ] Handle cross-platform differences (Ctrl vs Cmd)
- [ ] Prevent default browser behavior where needed
- [ ] Return cleanup function to remove listeners
- **Time**: 45 min | **Assigned**: | **Completed**: 

### Task 2.7: Add Editor Helper Buttons
- [ ] Update EditorPanel.tsx:
  - Add button row above/below editor:
    - "Format" button → call JSON.stringify(JSON.parse(specJson), null, 2)
    - "Clear" button → setSpecJson('')
    - "Load Template" dropdown → placeholder for Phase 5
  - Disable buttons while editing (show tooltip: "Focus editor first")
  - On Format click: apply formatting, move cursor to top
- [ ] Add keyboard shortcut registration for Format/Clear
- [ ] Style buttons: small, grouped, neutral color
- **Time**: 30 min | **Assigned**: | **Completed**: 

**Phase 2 Complete**: [ ]

---

## Phase 3: Live Preview Integration 🎬

**Objective**: Connect spec editor to dynamic UI preview with real-time rendering  
**Duration**: 2-3 hours  
**Status**: Blocked by Phase 2

### Task 3.1: Create Error Boundary Component
- [ ] Create `src/components/SpecEditor/parts/ErrorBoundary.tsx`
- [ ] Implement React Error Boundary class component
- [ ] Catch render errors from child components
- [ ] Display user-friendly error message:
  - "Component render failed"
  - Show error message (truncated, first 100 chars)
  - Show component stack trace (truncated, first 5 lines)
  - "View full error" button → show in console
- [ ] Don't crash entire interface (boundary stays mounted)
- [ ] Add reset button in error message
- [ ] Add prop: `onError?: (error: Error) => void` for external logging
- **Time**: 45 min | **Assigned**: | **Completed**: 

### Task 3.2: Create PreviewPanel with Live Rendering
- [ ] Update `src/components/SpecEditor/parts/PreviewPanel.tsx`:
  - Import SpecRenderer from core
  - Import useSpecEditor hook
  - Check if parsedSpec exists
  - If yes: render `<ErrorBoundary><SpecRenderer spec={parsedSpec} /></ErrorBoundary>`
  - If no: render "No spec loaded" placeholder
  - If validation errors: render error message (don't attempt render)
- [ ] Style:
  - Full height, scrollable
  - White/light background
  - Padding: 24px
  - Placeholder text: centered, gray, italic
- [ ] Implement placeholder UI with suggestions
- **Time**: 45 min | **Assigned**: | **Completed**: 

### Task 3.3: Test Live Synchronization
- [ ] Manual test: Edit spec in editor → preview updates within 100ms
- [ ] Measure edit→preview latency with performance profiler
- [ ] Test with various spec complexities:
  - Simple (1-5 components): should be instant
  - Medium (10-20 components): should be <50ms latency
  - Complex (50+ components): should be <200ms latency
- [ ] Test error recovery:
  - Type invalid JSON → error shown, preview doesn't update
  - Fix JSON → preview updates automatically
- [ ] Test prop changes:
  - Edit prop value → preview updates with new prop
  - Verify component receives updated props
- **Time**: 45 min | **Assigned**: | **Completed**: 

### Task 3.4: Add Smooth Visual Feedback
- [ ] Update PreviewPanel.tsx:
  - Add fade animation when preview updates (CSS transition, 200ms)
  - Add subtle loading spinner for complex specs (>20 components)
  - Add "Last updated:" timestamp (relative: "2s ago")
- [ ] Create `src/components/SpecEditor/parts/PreviewPanel.css`:
  - Define fade animation: `opacity 200ms ease-in`
  - Define spinner animation: rotating circle, 1s loop
  - Define placeholder styles
- [ ] Test performance: verify animations don't cause jank
- **Time**: 30 min | **Assigned**: | **Completed**: 

**Phase 3 Complete**: [ ]

---

## Phase 4: Render Tracking Dashboard (Dev Panel) 📊

**Objective**: Display real-time metrics from RenderTracker in dev panel  
**Duration**: 3-4 hours  
**Status**: Blocked by Phase 3 + RenderTracker system

### Task 4.1: Create MetricsSummary Component
- [ ] Create `src/components/MetricsSummary/MetricsSummary.tsx`
- [ ] Import useRenderTracker hook
- [ ] Display summary cards (4 cards in 2x2 grid):
  - "Total Renders" with large number
  - "Most Rendered" with component name
  - "Avg Duration" with milliseconds
  - "Render Reason" with most common reason badge
- [ ] Subscribe to tracker updates:
  - `useEffect(() => { tracker.subscribe(setMetrics) }, [])`
  - Recalculate metrics on each render
- [ ] Format numbers:
  - Renders: plain number (e.g., "47")
  - Duration: "0.45ms"
  - Most rendered: component name + count (e.g., "Card (12x)")
- [ ] Style: card layout with icon + value + label
- [ ] Add tooltip on hover: "Last updated: 2s ago"
- **Time**: 1 hour | **Assigned**: | **Completed**: 

### Task 4.2: Create ComponentTreeView Component
- [ ] Create `src/components/ComponentTreeView/ComponentTreeView.tsx`
- [ ] Create `src/components/ComponentTreeView/TreeNode.tsx`
- [ ] Import useSpecEditor, useRenderTracker hooks
- [ ] Recursively render component hierarchy:
  - Get parsedSpec from useSpecEditor
  - Build tree from spec.children recursively
- [ ] Implement TreeNode component:
  - Receive: component type, id, depth, metrics
  - Display: icon for component type + name + render count badge
  - Render reason color code:
    - 🔄 blue: props_changed
    - ⚡ yellow: parent_rerender
    - 🎯 orange: state_change
    - 📦 purple: context_change
    - ⭐ green: initial_render
  - Expandable/collapsible (chevron icon)
  - Click to select → call `setSelectedComponentId(id)`
  - Highlight recently-rendered components (fade effect: 2s timeout)
- [ ] Style:
  - Hierarchical indentation (16px per level)
  - Hoverable rows with subtle background
  - Row height: 32px
- [ ] Create `src/components/ComponentTreeView/ComponentTreeView.css`
- **Time**: 1.5 hours | **Assigned**: | **Completed**: 

### Task 4.3: Create PropChangesPanel Component
- [ ] Create `src/components/PropChangesPanel/PropChangesPanel.tsx`
- [ ] Import useSpecEditor, useRenderTracker hooks
- [ ] Get selectedComponentId from useSpecEditor hook
- [ ] If selectedComponentId:
  - Get prop changes from tracker: `tracker.getPropChanges(id)`
  - Display list of changed props:
    - Prop name (highlight changed keys)
    - Before value (grayed out)
    - Arrow →
    - After value (highlighted)
  - Format complex values as JSON (truncate if >100 chars)
- [ ] If no component selected:
  - Show "Select a component to view prop changes"
  - Gray out panel
- [ ] Style:
  - Table layout or list
  - Row height: 28px
  - Monospace font for values
  - Color diff: red for removed, green for added
- [ ] Create `src/components/PropChangesPanel/PropChangesPanel.css`
- **Time**: 45 min | **Assigned**: | **Completed**: 

### Task 4.4: Create DevPanel Layout with All Sections
- [ ] Update `src/components/SpecEditor/parts/DevPanel.tsx`:
  - Divide into 3 sections (top to bottom):
    - MetricsSummary (top, ~25% height)
    - ComponentTreeView (middle, ~50% height, scrollable)
    - PropChangesPanel (bottom, ~25% height, scrollable)
  - Use flexbox column layout with flexible sizing
  - Add dividers between sections
  - Each section independently scrollable
- [ ] Create `src/components/SpecEditor/parts/DevPanel.css`:
  - Define layout with flex: 0 1 auto for each section
  - Define scroll areas
  - Add divider styles
- [ ] Import and render all components
- **Time**: 1 hour | **Assigned**: | **Completed**: 

### Task 4.5: Subscribe DevPanel to RenderTracker Updates
- [ ] Implement subscription mechanism:
  - Create `src/components/SpecEditor/hooks/useTrackerSubscription.ts`
  - Hook subscribes to tracker on mount
  - Stores callback to force re-render on tracker updates
  - Unsubscribes on unmount
- [ ] Update MetricsSummary, ComponentTreeView to use hook:
  - Trigger re-render when tracker updates
  - Recalculate metrics/tree on each update
- [ ] Test:
  - Edit spec → preview renders → dev panel updates within 50ms
  - Verify metrics increment correctly
  - Verify tree displays updated counts
- **Time**: 1 hour | **Assigned**: | **Completed**: 

### Task 4.6: Performance Optimization for Component Tree
- [ ] If tree has >100 components:
  - Implement virtual scrolling (react-window or custom)
  - Only render visible nodes
  - Measure performance with 50+ component spec
  - Target: tree renders and updates <50ms
- [ ] Memoize TreeNode components:
  - Use React.memo to prevent unnecessary re-renders
  - Only re-render if metrics or expanded state changes
- [ ] Test with 50-component spec from examples
- **Time**: 45 min | **Assigned**: | **Completed**: 

**Phase 4 Complete**: [ ]

---

## Phase 5: Spec Persistence, Templates & UX Polish 🎀

**Objective**: Add save/load, templates, keyboard shortcuts, and final styling  
**Duration**: 2-3 hours  
**Status**: Blocked by Phase 4

### Task 5.1: Create Spec Template System
- [ ] Create `src/components/SpecEditor/utils/specTemplates.ts`
- [ ] Define templates array with 5 templates:
  ```typescript
  {
    name: "Empty Spec",
    description: "Start with empty spec",
    spec: { type: "Grid", children: [] }
  },
  {
    name: "Grid Layout",
    description: "3-column grid with cards",
    spec: { type: "Grid", props: { columns: 3 }, children: [...] }
  },
  // ... more templates
  ```
- [ ] Each template should be valid JSON
- [ ] Export `getTemplates()` function
- [ ] Create JSON files for each template in `src/specs/templates/`:
  - `empty.json`
  - `grid-layout.json`
  - `dashboard.json`
  - `form-layout.json`
  - `card-hierarchy.json`
- **Time**: 45 min | **Assigned**: | **Completed**: 

### Task 5.2: Create Template Loader & Selector
- [ ] Create `src/components/SpecEditor/parts/TemplateMenu.tsx`
- [ ] Render as dropdown menu in Header (next to Save button)
- [ ] On template select:
  - Check for unsaved changes
  - If dirty: show confirmation dialog
  - Load template JSON into editor
  - Reset validation errors
  - Set dirty flag to false (just loaded)
  - Focus editor for user to start editing
- [ ] Style: dropdown menu, hover states
- [ ] Add to `src/components/SpecEditor/parts/Header.tsx`
- **Time**: 45 min | **Assigned**: | **Completed**: 

### Task 5.3: Create Spec Selector & Recent Specs List
- [ ] Create `src/components/SpecEditor/parts/SpecSelector.tsx`
- [ ] Implement localStorage-based recent specs list:
  - Store up to 10 recent spec names in localStorage: `spec-editor-recent`
  - Update list on successful save
- [ ] Render dropdown or sidebar:
  - Show recent specs at top (bold, star icon)
  - Divider
  - Show all available specs from `src/specs/`
  - "Browse all" link (future enhancement)
- [ ] On spec select:
  - Check for unsaved changes
  - If dirty: show confirmation
  - Load selected spec from file
  - Update recent list
- [ ] Style: dropdown > 10 items gets scrollbar
- **Time**: 1 hour | **Assigned**: | **Completed**: 

### Task 5.4: Implement Auto-Save Functionality
- [ ] Create `src/components/SpecEditor/hooks/useAutoSave.ts`
- [ ] Implement auto-save logic:
  - Watch isDirty flag
  - On dirty → true: start 1s timer
  - On dirty → false: cancel timer (manual save)
  - After 1s without changes: trigger save
  - Save via browser API or backend (TBD)
- [ ] Show visual feedback:
  - "Saving..." indicator (small spinner)
  - "Saved" confirmation (green checkmark, fade after 2s)
- [ ] Error handling:
  - If save fails: show "Save failed" message
  - Keep dirty flag = true (user can retry)
- **Time**: 45 min | **Assigned**: | **Completed**: 

### Task 5.5: Wire Up Keyboard Shortcuts
- [ ] Update Header to show shortcut hints in tooltips
- [ ] Implement all shortcuts in EditorPanel or useSpecEditor:
  - Ctrl+S / Cmd+S: Trigger manual save
  - Ctrl+K Ctrl+F / Cmd+K Cmd+F: Format JSON (already partially done)
  - Ctrl+L: Focus editor
  - F5: Reset tracker (implemented later)
  - Ctrl+- / Cmd+-: Decrease font size (Monaco feature)
  - Ctrl++ / Cmd++: Increase font size (Monaco feature)
- [ ] Create `src/components/SpecEditor/utils/setupShortcuts.ts`
  - Register all shortcuts
  - Call from SpecEditor useEffect
  - Clean up on unmount
- [ ] Test each shortcut manually
- **Time**: 1 hour | **Assigned**: | **Completed**: 

### Task 5.6: Implement Theme Toggle
- [ ] Update Header button group with theme toggle:
  - Show current theme icon (☀️ light, 🌙 dark)
  - On click: toggle theme
  - Save preference to localStorage: `spec-editor-theme`
- [ ] Update all components to use theme:
  - Apply CSS classes based on theme
  - Editor theme: 'vs' for light, 'vs-dark' for dark
  - Background colors: white/light gray for light theme, dark gray for dark theme
  - Text colors: dark for light theme, white for dark theme
- [ ] Test theme toggle:
  - Verify all panels change colors immediately
  - Verify preference persists on reload
- **Time**: 45 min | **Assigned**: | **Completed**: 

### Task 5.7: Add SpecEditor Route to App.tsx
- [ ] Update `src/App.tsx`:
  - Import SpecEditor component
  - Add route: `/specs` → render SpecEditor
  - Wrap SpecEditor in RenderTrackerProvider (already exists)
  - Add navigation link in main App header
- [ ] Test:
  - Navigate to /specs
  - Verify all 3 panels render
  - Verify state management works
  - Verify keyboard shortcuts work
- **Time**: 30 min | **Assigned**: | **Completed**: 

### Task 5.8: Styling Polish & Responsive Testing
- [ ] Review all component styles:
  - Consistent spacing (8px, 16px, 24px grid)
  - Consistent colors (20% variation in light/dark)
  - Consistent typography (font sizes, weights)
  - Smooth transitions (150-200ms)
- [ ] Test on viewport sizes:
  - Desktop: 1920px (full 3-column)
  - Laptop: 1440px (full 3-column)
  - Tablet: 768px (stacked layout)
  - Mobile: 320px (tabs or single column)
- [ ] Fix any layout issues
- [ ] Verify scroll behavior independent per panel
- [ ] Create `src/components/SpecEditor/SpecEditor.css` with all styling
- **Time**: 1 hour | **Assigned**: | **Completed**: 

### Task 5.9: Accessibility Audit & Fixes
- [ ] Add ARIA labels to all interactive elements
- [ ] Verify keyboard navigation:
  - Tab through all buttons/inputs
  - Focus indicators visible
  - No focus traps
- [ ] Verify color contrast:
  - Text vs background >4.5:1 (AA standard)
  - Use WebAIM contrast checker
- [ ] Verify screen reader compatibility:
  - Use semantic HTML (button, input, nav)
  - Add aria-label for icon-only buttons
  - Add aria-expanded for collapsible sections
- [ ] Test with keyboard only (no mouse)
- **Time**: 1 hour | **Assigned**: | **Completed**: 

**Phase 5 Complete**: [ ]

---

## Phase 6: Testing & QA ✅

**Objective**: Comprehensive testing and quality assurance  
**Duration**: 2-3 hours  
**Status**: Blocked by Phase 5

### Task 6.1: Unit Tests
- [ ] Create `test/unit/specValidation.test.ts`
  - Test valid JSON parsing
  - Test invalid JSON error handling
  - Test spec schema validation
- [ ] Create `test/unit/specTemplates.test.ts`
  - Test all templates are valid specs
  - Test getTemplates() returns correct count
- [ ] Create `test/unit/useSpecEditor.test.ts`
  - Test state updates
  - Test dirty flag behavior
  - Test reset functionality
- [ ] Create `test/unit/useDebounce.test.ts`
  - Test debounce delay
  - Test value updates after delay
  - Test cleanup
- [ ] Run: `npm test -- --testPathPattern="unit"`
- [ ] Target coverage: 80%+
- **Time**: 1 hour | **Assigned**: | **Completed**: 

### Task 6.2: Integration Tests
- [ ] Create `test/integration/SpecEditor.integration.test.tsx`
  - Test full editor flow: render → edit → validate → update state
  - Test preview sync: edit spec → preview updates <100ms
  - Test error recovery: invalid JSON → fix → preview recovers
- [ ] Create `test/integration/devPanelTracking.test.tsx`
  - Test tracker subscription
  - Test metrics update on render
  - Test component tree accuracy
- [ ] Run: `npm test -- --testPathPattern="integration"`
- **Time**: 1 hour | **Assigned**: | **Completed**: 

### Task 6.3: Performance Testing
- [ ] Create performance test script:
  - Load complex spec (50 components)
  - Measure editor→preview latency
  - Measure metrics update latency
  - Measure component tree render time
- [ ] Verify targets:
  - Edit→preview <100ms ✓
  - Complex spec render <200ms ✓
  - Dev panel update <50ms ✓
- [ ] Profile with Chrome DevTools:
  - Record Performance timeline
  - Identify bottlenecks
  - Optimize if needed
- **Time**: 45 min | **Assigned**: | **Completed**: 

### Task 6.4: Cross-Browser Testing
- [ ] Test on:
  - Chrome (latest)
  - Firefox (latest)
  - Safari (latest)
  - Edge (latest)
- [ ] Check for issues:
  - Layout rendering
  - Keyboard shortcuts
  - Theme toggle
  - localStorage access
- [ ] Document any browser-specific fixes
- **Time**: 45 min | **Assigned**: | **Completed**: 

### Task 6.5: User Acceptance Testing (UAT)
- [ ] Create UAT checklist:
  - [ ] Editor validation works
  - [ ] Preview updates live
  - [ ] Dev panel shows metrics
  - [ ] Specs save and load
  - [ ] Templates work
  - [ ] Keyboard shortcuts work
  - [ ] Theme toggle works
  - [ ] Responsive on mobile
- [ ] Have team member (not implementer) test each item
- [ ] Document any UX friction
- [ ] Make final adjustments
- **Time**: 1 hour | **Assigned**: | **Completed**: 

**Phase 6 Complete**: [ ]

---

## Overall Progress

### Summary by Phase
| Phase | Objective | Time | Status | Complete |
|-------|-----------|------|--------|----------|
| 1 | Layout Infrastructure | 4-4.5h | Not Started | [ ] |
| 2 | JSON Editor & Validation | 3-4h | Blocked by 1 | [ ] |
| 3 | Live Preview | 2-3h | Blocked by 2 | [ ] |
| 4 | Dev Panel & Metrics | 3-4h | Blocked by 3 | [ ] |
| 5 | Polish & UX | 2-3h | Blocked by 4 | [ ] |
| 6 | Testing & QA | 2-3h | Blocked by 5 | [ ] |
| **TOTAL** | **Complete Feature** | **17-21.5h** | **Ready to Begin** | **[ ]** |

### Critical Path
```
Phase 1 ↓ Phase 2 ↓ Phase 3 ↓ Phase 4 ↓ Phase 5 ↓ Phase 6
Layout   Editor   Preview   Tracking  Polish   Testing
```

### Parallelizable Work
- Phase 2 (Editor) and Phase 4 (DevPanel) can start once Phase 1 is complete (they have minimal cross-dependencies)

---

## Task Assignment Template

**When assigning a task**, fill in:
```
**Time**: [Duration] | **Assigned**: [Team Member] | **Started**: [Date] | **Completed**: [Date]
```

Example:
```
**Time**: 45 min | **Assigned**: Sarah | **Started**: 2026-04-07 | **Completed**: 2026-04-07
```

---

## Notes & Caveats

1. **Time estimates** assume developer is familiar with the codebase (not onboarding time)
2. **Blocked by** indicates which RenderTracker phases must be complete
3. **Testing time** is separate from implementation time
4. **Buffer**: Add 20-30% buffer for debugging, code review, and refinement
5. **Dependencies**: All Phase 1 tasks must complete before Phases 2+ start
6. **Communication**: Update this checklist daily with progress

---

**Document Version**: 1.0  
**Last Updated**: April 7, 2026  
**Next Review**: After Phase 1 completion  
**Estimated Completion**: April 10-12, 2026
