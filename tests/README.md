# Playwright Test Suite for SpecLens

This directory contains comprehensive Playwright tests for the SpecLens application, based on the feature specifications in `/specs/`.

## Test Coverage

### 1. **spec-editor.spec.ts** - Core Spec Editor Functionality
- **UI Layout**: Verifies all main components are present and visible
- **JSON Editor**: Tests JSON validation, syntax highlighting, and real-time feedback
- **Live Preview**: Tests rendering of specs, error handling, and component registry integration
- **Resizable Divider**: Tests editor/preview pane resizing
- **Save Functionality**: Tests persistence to localStorage
- **Props & Children**: Verifies correct prop/child passing to components
- **Error Handling**: Tests graceful error recovery

### 2. **render-tracking.spec.ts** - Render Tracking & Metrics
- **Initial Render Tracking**: Verifies render tracking on page load
- **Re-render Detection**: Tests tracking of re-renders when specs change
- **Prop Change Tracking**: Verifies prop change detection between renders
- **Render Reason Analysis**: Tests identification of re-render reasons (props_changed, parent_rerender, etc.)
- **Metrics Accuracy**: Verifies accurate render counts and metrics
- **Component Tree**: Tests hierarchical display of components with metrics
- **Performance**: Tests large specs and rapid changes
- **Responsive Behavior**: Tests viewport resize handling

### 3. **e2e.spec.ts** - End-to-End & Advanced Scenarios
- **Development Workflows**: Real-world development iteration scenarios
- **Performance Debugging**: Tests metrics-based performance analysis
- **Accessibility**: Tests keyboard navigation, screen reader compatibility, ARIA labels
- **Error Recovery**: Tests handling of edge cases (malformed JSON, missing components, etc.)
- **Cross-Browser**: Tests CSS rendering, touch events, and viewport handling

## Running Tests

### Prerequisites
```bash
# Install dependencies (if not already done)
npm install

# Start the dev server (in another terminal)
npm run dev
```

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test spec-editor.spec.ts
npm test render-tracking.spec.ts
npm test e2e.spec.ts
```

### Run Tests in Headed Mode (See Browser)
```bash
npm test -- --headed
```

### Run Tests in Debug Mode
```bash
npm test -- --debug
```

### Run Tests with Specific Browser
```bash
npm test -- --project=chromium
npm test -- --project=firefox
npm test -- --project=webkit
```

## Test Configuration

The tests are configured in `playwright.config.ts`:

- **Base URL**: `http://localhost:5173/`
- **Timeout**: 30 seconds per test
- **Retries**: 0 (disabled for local development)
- **Browsers**: Chromium, Firefox, WebKit

### Important Notes
- Tests assume the dev server is running on `http://localhost:5173/`
- Each test file is independent and can be run separately
- Tests use `waitForSelector` and timeouts to handle debouncing (300ms) and rendering delays
- Component tree tests account for dynamic rendering behavior

## Key Test Scenarios

### Spec Editor Tests
1. ✅ Load and display the UI
2. ✅ Validate JSON in real-time
3. ✅ Show error messages for invalid JSON
4. ✅ Auto-correct when errors are fixed
5. ✅ Resize editor/preview panes
6. ✅ Update preview as JSON changes
7. ✅ Handle large/complex specs smoothly
8. ✅ Save changes to localStorage
9. ✅ Persist data across page reload

### Render Tracking Tests
1. ✅ Track initial renders on page load
2. ✅ Show render counts and metrics
3. ✅ Update metrics when spec changes
4. ✅ Display component hierarchy in tree
5. ✅ Show render reasons with color coding
6. ✅ Track prop changes between renders
7. ✅ Detect re-render reasons (props_changed, parent_rerender, etc.)
8. ✅ Handle deep component hierarchies
9. ✅ Handle many sibling components
10. ✅ Maintain state during rapid updates

### End-to-End Scenarios
1. ✅ Create new component spec from scratch
2. ✅ Iterate and refine spec through multiple versions
3. ✅ Debug render performance using metrics
4. ✅ Full development cycle workflow
5. ✅ Keyboard navigation (Tab, Arrow keys)
6. ✅ Focused editing without distractions
7. ✅ Handle edge cases and errors gracefully

## Debugging Tips

### View Test Report
```bash
npm test -- --reporter=html
npx playwright show-report
```

### Run Single Test
```bash
npm test -- --grep "should display"
```

### Use Page Inspector
While running in headed mode:
- Press `Ctrl+Shift+I` (Cmd+Option+I on Mac) to open DevTools
- Tests can be paused by adding `await page.pause()` in test code

### Check Logs
```bash
npm test -- --trace on
```

Then view the trace file for detailed execution information.

## Writing New Tests

### Test Template
```typescript
test('should verify feature X', async ({ page }) => {
  // 1. Setup
  await page.goto('http://localhost:5173/');
  await page.waitForSelector('.spec-editor-container');
  
  // 2. Action
  const element = page.locator('selector');
  await element.click();
  
  // 3. Assert
  await expect(element).toBeVisible();
  await expect(element).toContainText('expected text');
});
```

### Best Practices
- Always wait for elements to be visible before interacting
- Use descriptive test names that explain the feature
- Group related tests in `test.describe()` blocks
- Use `test.beforeEach()` for common setup
- Account for async operations (debouncing, rendering)
- Test user-facing behavior, not implementation details
- Use locators that are resilient to DOM changes

### Locator Selection Order
1. Visible text: `page.locator('text=string')`
2. Role: `page.getByRole('button')`
3. Test IDs: `page.locator('[data-testid="id"]')`
4. Class names: `.element-unique-class`
5. Avoid: XPath, overly specific selectors

## Maintenance

### When Should Tests Be Updated?
- ✅ When new features are added (add new tests)
- ✅ When UI selectors change (update locators)
- ✅ When component hierarchy changes (update tree tests)
- ✅ When metrics display format changes (update assertion content)

### Common Issues

**Tests timeout waiting for elements**
- Increase timeout: `{ timeout: 10000 }`
- Check if selector is correct
- Verify dev server is running

**Tests fail intermittently**
- Add more wait time for debounced updates
- Check for race conditions before assertions
- Verify element visibility before interaction

**Metrics tests fail**
- Metrics require trackers to be populated
- Wait longer for initial render tracking
- Verify RenderTracker is properly initialized

## Continuous Integration

To run tests in CI/CD pipeline:

```bash
# Install Playwright browsers
npx playwright install

# Run tests in headless mode
npm test -- --reporter=json > test-results.json
```

## Performance Benchmarks

Expected test execution times (single run):
- `spec-editor.spec.ts`: ~45 seconds
- `render-tracking.spec.ts`: ~60 seconds  
- `e2e.spec.ts`: ~90 seconds
- **Total**: ~3 minutes

## Coverage Goals

Current test coverage focuses on:
- ✅ User-facing features specified in requirement docs
- ✅ Happy path workflows
- ✅ Error scenarios and recovery
- ✅ Performance and scalability
- ✅ Accessibility
- ✅ Cross-browser compatibility

Not covered (future enhancement):
- Visual regression testing
- Performance profiling traces
- Network error scenarios
- State persistence beyond localStorage

## Feedback & Updates

For test issues or improvements:
1. Check existing test files for similar patterns
2. Refer to [Playwright documentation](https://playwright.dev)
3. Review spec files for behavior clarification
4. Add descriptive comments for non-obvious assertions

---

**Last Updated**: April 9, 2026  
**Test Framework**: Playwright v1.40.0+  
**Node Version**: 18+
