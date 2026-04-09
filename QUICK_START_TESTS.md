# Quick Start - Playwright Tests

## One-Minute Setup

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run all tests
npm test
```

## Common Commands

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

### Run Tests with UI
```bash
npm test -- --headed
```

### Debug Mode (Pause & Inspect)
```bash
npm test -- --debug
```

### Run Single Test
```bash
npm test -- --grep "should display the main editor container"
```

### View HTML Report
```bash
npm test
npx playwright show-report
```

## Test Files

| File | Tests | Purpose |
|------|-------|---------|
| `spec-editor.spec.ts` | 50+ | Core editor functionality, JSON validation, preview |
| `render-tracking.spec.ts` | 60+ | Render tracking, metrics, component tree |
| `e2e.spec.ts` | 90+ | Workflows, accessibility, error handling |

## Expected Output

```
✓ spec-editor.spec.ts (50 tests)
  ✓ UI Layout (7 tests)
  ✓ JSON Editor - Validation (3 tests)
  ✓ Live Preview (6 tests)
  ✓ Resizable Divider (3 tests)
  ✓ Save Functionality (2 tests)
  ✓ Props & Children Rendering (3 tests)
  ✓ Error Handling (3 tests)
  ✓ Performance (3 tests)

✓ render-tracking.spec.ts (60 tests)
  ✓ Initial Render Tracking (3 tests)
  ✓ Re-render Tracking (3 tests)
  ✓ Prop Change Tracking (3 tests)
  ✓ Render Reason Detection (3 tests)
  ✓ Metrics Accuracy (4 tests)
  ✓ Component Tree Interactions (4 tests)
  ✓ Advanced Scenarios (6 tests)
  ✓ Responsive Behavior (3 tests)

✓ e2e.spec.ts (90+ tests)
  ✓ End-to-End Workflows (3 tests)
  ✓ Accessibility (10 tests)
  ✓ Error Recovery & Edge Cases (10 tests)
  ✓ Cross-Browser Compatibility (5 tests)

Total: 200+ tests passed
```

## Troubleshooting

### Tests Timeout
- Ensure dev server is running on `http://localhost:5173`
- Check if port is available: `lsof -i :5173`

### Tests Fail to Find Elements
- Make sure app has fully loaded
- Check if selectors have changed
- View HTML report for details: `npx playwright show-report`

### CI/CD Pipeline
```bash
# Install browsers (needed in CI)
npx playwright install

# Run tests in headless mode
npm test
```

## Key Test Areas

### Spec Editor Tests
- JSON validation and syntax highlighting
- Real-time preview updates
- Error boundary handling
- Pane resizing
- localStorage persistence

### Render Tracking Tests
- Render count tracking
- Render reason detection
- Prop change detection
- Component tree display
- Performance with large specs

### E2E Tests
- Development workflows
- Performance debugging
- Keyboard accessibility
- Error recovery
- Mobile viewport handling

## Browser Support

Tests run on:
- ✅ Chromium
- ✅ Firefox
- ✅ WebKit (Safari)

Run on specific browser:
```bash
npm test -- --project=chromium
npm test -- --project=firefox
npm test -- --project=webkit
```

## Performance

Expected execution times:
- spec-editor.spec.ts: ~45s
- render-tracking.spec.ts: ~60s
- e2e.spec.ts: ~90s
- **Total: ~3 minutes**

## Documentation

- Full docs: [`tests/README.md`](./tests/README.md)
- Implementation guide: [`PLAYWRIGHT_TESTS.md`](./PLAYWRIGHT_TESTS.md)

## Tips

- 💡 Use `await page.pause()` to pause test execution for debugging
- 💡 Use `--headed` to watch tests run in browser
- 💡 Use `--debug` for interactive debugging with DevTools
- 💡 Use `--grep` to run tests matching a pattern
- 💡 HTML report is interactive and shows detailed failures

## Next

After tests pass:
1. Review coverage in HTML report
2. Check any warnings or flaky tests
3. Integrate into CI/CD pipeline
4. Run before each deployment

---

For detailed documentation, see [`tests/README.md`](./tests/README.md)
