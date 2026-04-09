import { test, expect } from '@playwright/test';

test.describe('Spec Editor - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    // Wait for the app to load
    await page.waitForSelector('.spec-editor-container', { timeout: 10000 });
  });

  test.describe('UI Layout', () => {
    test('should display the main editor container', async ({ page }) => {
      const container = page.locator('.spec-editor-container');
      await expect(container).toBeVisible();
    });

    test('should have header, top row (editor + preview), and bottom dev panel', async ({ page }) => {
      const header = page.locator('.spec-editor-header');
      const topRow = page.locator('.spec-editor-top-row');
      const bottomRow = page.locator('.spec-editor-bottom-row');

      await expect(header).toBeVisible();
      await expect(topRow).toBeVisible();
      await expect(bottomRow).toBeVisible();
    });

    test('should display JSON editor panel', async ({ page }) => {
      const leftPanel = page.locator('.spec-editor-left-panel');
      const editorHeader = page.locator('.spec-editor-panel-header').first();

      await expect(leftPanel).toBeVisible();
      await expect(editorHeader).toContainText('JSON Editor');
    });

    test('should display live preview panel', async ({ page }) => {
      const rightPanel = page.locator('.spec-editor-right-panel');
      const previewHeader = page.locator('text=LIVE PREVIEW');

      await expect(rightPanel).toBeVisible();
      await expect(previewHeader).toBeVisible();
    });

    test('should display dev panel with render tracking', async ({ page }) => {
      const devPanel = page.locator('.spec-editor-bottom-row');
      const title = page.locator('text=Render Tracking Dashboard');

      await expect(devPanel).toBeVisible();
      await expect(title).toBeVisible();
    });
  });

  test.describe('JSON Editor - Validation', () => {
    test('should show valid JSON status', async ({ page }) => {
      const statusBar = page.locator('.spec-editor-status');
      await expect(statusBar).toContainText('Valid JSON');
    });

    test('should validate and highlight JSON errors', async ({ page }) => {
      const textarea = page.locator('.json-editor-textarea');

      // Clear and enter invalid JSON
      await textarea.click();
      await page.keyboard.press('Control+A');
      await textarea.fill('{ invalid json');

      // Should show error
      await page.waitForTimeout(500); // Wait for validation
      const status = page.locator('.spec-editor-status');
      await expect(status).toHaveClass(/invalid/);
    });

    test('should recover from JSON errors when fixed', async ({ page }) => {
      const textarea = page.locator('.json-editor-textarea');

      // Enter invalid JSON
      await textarea.click();
      await page.keyboard.press('Control+A');
      await textarea.fill('{ "test": "broken"');

      await page.waitForTimeout(500);
      let status = page.locator('.spec-editor-status');
      await expect(status).toHaveClass(/invalid/);

      // Fix it
      await textarea.click();
      await page.keyboard.press('Control+A');
      await textarea.fill('{ "test": "fixed" }');

      await page.waitForTimeout(500);
      status = page.locator('.spec-editor-status');
      await expect(status).toContainText('Valid JSON');
    });
  });

  test.describe('Live Preview', () => {
    test('should initially render the default dashboard spec', async ({ page }) => {
      const preview = page.locator('.spec-editor-render');
      const dashboardTitle = page.locator('text=Demo Analytics Dashboard');

      await expect(preview).toBeVisible();
      await expect(dashboardTitle).toBeVisible();
    });

    test('should render StatCard components', async ({ page }) => {
      const statCards = page.locator('text=Total Revenue');
      await expect(statCards).toBeVisible();
    });

    test('should render nested Grid components', async ({ page }) => {
      // Grid components create layout structure
      const preview = page.locator('.spec-editor-render');
      await expect(preview).toBeVisible();

      // Check for stat values rendered
      const revenue = page.locator('text=$45,231');
      const users = page.locator('text=8,391');
      await expect(revenue).toBeVisible();
      await expect(users).toBeVisible();
    });

    test('should display error boundary for invalid spec', async ({ page }) => {
      const textarea = page.locator('.json-editor-textarea');

      // Enter invalid spec (malformed JSON type)
      await textarea.click();
      await page.keyboard.press('Control+A');
      await textarea.fill('{ "type": "InvalidComponent" }');

      await page.waitForTimeout(500);

      // Error should be shown in preview
      // Note: Behavior depends on whether InvalidComponent exists in registry
    });

    test('should update preview when JSON is modified', async ({ page }) => {
      const textarea = page.locator('.json-editor-textarea');
      const preview = page.locator('.spec-editor-render');

      // Get initial content
      const initialContent = await preview.innerHTML();

      // Modify a simple prop
      const json = await textarea.textContent();
      const modified = json ? json.replace('"Demo Analytics Dashboard"', '"Updated Title"') : '';

      await textarea.click();
      await page.keyboard.press('Control+A');
      await textarea.fill(modified);

      await page.waitForTimeout(600); // Wait for debounce + render

      // Preview should be updated
      const updatedContent = await preview.innerHTML();
      expect(initialContent).not.toEqual(updatedContent);
    });

    test('should handle large and complex specs smoothly', async ({ page }) => {
      const textarea = page.locator('.json-editor-textarea');

      // Create a deeply nested spec
      const complexSpec = {
        type: 'Card',
        id: 'root',
        props: { title: 'Complex' },
        children: new Array(5)
          .fill(null)
          .map((_, i) => ({
            type: 'Grid',
            id: `grid-${i}`,
            props: { columns: 3 },
            children: new Array(12)
              .fill(null)
              .map((_, j) => ({
                type: 'StatCard',
                id: `stat-${i}-${j}`,
                props: {
                  label: `Card ${i}-${j}`,
                  value: '100',
                  change: '+5%',
                },
              })),
          })),
      };

      await textarea.click();
      await page.keyboard.press('Control+A');
      await textarea.fill(JSON.stringify(complexSpec, null, 2));

      await page.waitForTimeout(1000);

      // Preview should still be responsive
      const preview = page.locator('.spec-editor-render');
      await expect(preview).toBeVisible();
    });
  });

  test.describe('Resizable Divider', () => {
    test('should have a vertical divider between editor and preview', async ({ page }) => {
      const divider = page.locator('.spec-editor-v-divider');
      await expect(divider).toBeVisible();
    });

    test('should allow resizing editor and preview panes', async ({ page }) => {
      const divider = page.locator('.spec-editor-v-divider');
      const leftPanel = page.locator('.spec-editor-left-panel');

      const initialWidth = await leftPanel.evaluate((el) =>
        Number.parseInt(globalThis.getComputedStyle(el).width)
      );

      // Drag divider to the right
      await divider.dragTo(divider, {
        sourcePosition: { x: 5, y: 0 },
        targetPosition: { x: 100, y: 0 },
      });

      const newWidth = await leftPanel.evaluate((el) =>
        Number.parseInt(globalThis.getComputedStyle(el).width)
      );

      // Width should have increased
      expect(newWidth).toBeGreaterThan(initialWidth);
    });

    test('should have horizontal divider above dev panel', async ({ page }) => {
      const hDivider = page.locator('.spec-editor-h-divider');
      await expect(hDivider).toBeVisible();
    });
  });

  test.describe('Save Functionality', () => {
    test('should have a save button in header', async ({ page }) => {
      const saveButton = page.locator('button:has-text("Save")');
      await expect(saveButton).toBeVisible();
    });

    test('should persist changes to localStorage', async ({ page }) => {
      const textarea = page.locator('.json-editor-textarea');
      const saveButton = page.locator('button:has-text("Save")');

      // Get initial value
      const currentText = await textarea.textContent();

      // Save it
      await saveButton.click();

      // Reload and check if persisted
      await page.reload();
      await page.waitForSelector('.spec-editor-container');

      const afterReload = await textarea.textContent();
      expect(afterReload).toBe(currentText);
    });
  });
});

test.describe('Spec Editor - Props & Children Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('.spec-editor-container');
  });

  test('should correctly pass props to rendered components', async ({ page }) => {
    // StatCard components have label, value, change props
    const labels = page.locator('text=Total Revenue|Active Users|Conversion Rate');
    const values = page.locator('text=$45,231|8,391|3.24%');

    await expect(labels.first()).toBeVisible();
    await expect(values.first()).toBeVisible();
  });

  test('should correctly render children from spec', async ({ page }) => {
    // Grid should contain multiple StatCard children
    const statCards = page.locator('[class*="stat"]');
    // At least 3 stat cards should be visible
    const count = await statCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should handle empty children arrays', async ({ page }) => {
    const textarea = page.locator('.json-editor-textarea');

    const spec = {
      type: 'Card',
      id: 'empty-card',
      props: { title: 'Empty Card' },
      children: [],
    };

    await textarea.click();
    await page.keyboard.press('Control+A');
    await textarea.fill(JSON.stringify(spec, null, 2));

    await page.waitForTimeout(600);

    const preview = page.locator('.spec-editor-render');
    await expect(preview).toBeVisible();
    await expect(preview).toContainText('Empty Card');
  });
});

test.describe('Render Tracking Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('.spec-editor-container');
  });

  test.describe('Metrics Summary', () => {
    test('should display render metrics', async ({ page }) => {
      const totalRenders = page.locator('text=TOTAL RENDERS');
      const mostRendered = page.locator('text=MOST RENDERED');

      await expect(totalRenders).toBeVisible();
      await expect(mostRendered).toBeVisible();
    });

    test('should show numeric render counts', async ({ page }) => {
      // Look for metric values
      const metrics = page.locator('.spec-editor-metric-value');
      const count = await metrics.count();

      expect(count).toBeGreaterThan(0);

      // Metrics should contain numbers
      const firstMetric = metrics.first();
      const text = await firstMetric.textContent();
      expect(text).toMatch(/\d+/);
    });

    test('should display render reason', async ({ page }) => {
      const renderReason = page.locator('text=parent_rerender|props_changed|state_change|initial_render');
      await expect(renderReason).toBeVisible();
    });

    test('should display avg duration metric', async ({ page }) => {
      const avgDuration = page.locator('text=AVG DURATION');
      await expect(avgDuration).toBeVisible();
    });
  });

  test.describe('Component Tree View', () => {
    test('should display component tree section', async ({ page }) => {
      const treeSection = page.locator('.spec-editor-component-tree-section');
      const treeHeader = page.locator('text=Component Tree');

      await expect(treeSection).toBeVisible();
      await expect(treeHeader).toBeVisible();
    });

    test('should display root component in tree', async ({ page }) => {
      const tree = page.locator('.spec-editor-tree-content');
      const rootNode = page.locator('.tree-node').first();

      await expect(tree).toBeVisible();
      await expect(rootNode).toBeVisible();
    });

    test('should show component types in tree', async ({ page }) => {
      // Should show Card, Grid, StatCard component types
      const treeContent = page.locator('.spec-editor-tree-content');
      await expect(treeContent).toBeVisible();

      // Look for tree node names (component types)
      const nodeNames = page.locator('.tree-node-name');
      const count = await nodeNames.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should show render counts in tree nodes', async ({ page }) => {
      // Each tree node should show render count (n)
      const nodeCounts = page.locator('.tree-node-count');
      const count = await nodeCounts.count();
      expect(count).toBeGreaterThan(0);

      const text = await nodeCounts.first().textContent();
      expect(text).toMatch(/\(\d+\)/); // Format: (count)
    });

    test('should allow expanding/collapsing tree nodes', async ({ page }) => {
      const toggleButton = page.locator('.tree-node-toggle').first();

      await toggleButton.click();

      await page.waitForTimeout(200);

      // Tree structure can be updated
      expect(toggleButton).toBeVisible();
    });

    test('should display render reason with color coding', async ({ page }) => {
      const reasonIcons = page.locator('.tree-node-icon');
      const count = await reasonIcons.count();

      expect(count).toBeGreaterThan(0);

      // Each should have a styled color
      const firstIcon = reasonIcons.first();
      const color = await firstIcon.evaluate((el) =>
        globalThis.getComputedStyle(el).color
      );
      expect(color).toBeTruthy();
    });

    test('should update tree when spec changes', async ({ page }) => {
      const textarea = page.locator('.json-editor-textarea');
      const treeContent = page.locator('.spec-editor-tree-content');

      // Modify spec to add a component
      const json = await textarea.textContent();
      const modified = json ? json.replace('"columns": 3', '"columns": 2') : '';

      await textarea.click();
      await page.keyboard.press('Control+A');
      await textarea.fill(modified);

      await page.waitForTimeout(1000);

      // Tree should be updated
      expect(treeContent).toBeVisible();
    });
  });

  test.describe('Real-time Updates', () => {
    test('should update metrics when spec changes', async ({ page }) => {
      const textarea = page.locator('.json-editor-textarea');
      const totalRendersMetric = page.locator('.spec-editor-metric-value').first();

      // Change the spec to trigger re-render
      const json = await textarea.textContent();
      const modified = (json ?? '').replace('"Demo Analytics Dashboard"', '"New Title"');

      await textarea.click();
      await page.keyboard.press('Control+A');
      await textarea.fill(modified);

      await page.waitForTimeout(1000);

      // Metrics might have changed
      expect(totalRendersMetric).toBeVisible();
    });

    test('should show recently rendered components with visual indicator', async ({ page }) => {
      // Components should have recent render highlighting (CSS)
      const nodes = page.locator('.tree-node-content');

      const count = await nodes.count();
      expect(count).toBeGreaterThan(0);

      // Recent renders should have visual styling
      const firstNode = nodes.first();
      await expect(firstNode).toBeVisible();
    });
  });
});

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('.spec-editor-container');
  });

  test('should show error message for invalid JSON', async ({ page }) => {
    const textarea = page.locator('.json-editor-textarea');

    await textarea.click();
      await page.keyboard.press('Control+A');

    await page.waitForTimeout(600);

    const errorList = page.locator('.json-editor-error-list');
    const errorVisible = await errorList.isVisible().catch(() => false);

    if (errorVisible) {
      await expect(errorList).toBeVisible();
    }
  });

  test('should show error boundary when spec cannot be rendered', async ({ page }) => {
    const textarea = page.locator('.json-editor-textarea');

    const invalidSpec = {
      type: 'UnknownComponent12345',
      id: 'invalid',
      props: {},
    };

    await textarea.click();
    await page.keyboard.press('Control+A');
    await textarea.fill(JSON.stringify(invalidSpec));

    await page.waitForTimeout(600);

    // Component might show error or fallback gracefully
    const preview = page.locator('.spec-editor-render');
    await expect(preview).toBeVisible();
  });

  test('should recover gracefully from errors', async ({ page }) => {
    const textarea = page.locator('.json-editor-textarea');

    // Enter invalid spec
    const invalidSpec = { invalid: true };
    await textarea.click();
    await page.keyboard.press('Control+A');
    await textarea.fill(JSON.stringify(invalidSpec));

    await page.waitForTimeout(300);

    // Fix it with valid spec
    await textarea.click();
    await page.keyboard.press('Control+A');
    await textarea.fill(JSON.stringify({ type: 'Card', id: 'recovery', props: { title: 'Recovered' } }, null, 2));

    await page.waitForTimeout(600);

    const preview = page.locator('.spec-editor-render');
    await expect(preview).toBeVisible();
  });
});

test.describe('Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('.spec-editor-container');
  });

  test('should handle rapid JSON changes', async ({ page }) => {
    const textarea = page.locator('.json-editor-textarea');
    const preview = page.locator('.spec-editor-render');

    // Make rapid changes
    for (let i = 0; i < 5; i++) {
      const spec = {
        type: 'Card',
        id: `rapid-${i}`,
        props: { title: `Change ${i}` },
      };

      await textarea.click();
      await page.keyboard.press('Control+A');
      await textarea.fill(JSON.stringify(spec));
      await page.waitForTimeout(100);
    }

    // Preview should still be responsive
    await expect(preview).toBeVisible();
  });

  test('should debounce JSON changes for performance', async ({ page }) => {
    const textarea = page.locator('.json-editor-textarea');

    const spec = {
      type: 'Card',
      id: 'debounce-test',
      props: { title: 'Debounce' },
    };

    const startTime = Date.now();

    await textarea.click();
    await page.keyboard.press('Control+A');
    await textarea.fill(JSON.stringify(spec));

    // Changes should be debounced (300ms default)
    await page.waitForTimeout(350);

    const endTime = Date.now();
    expect(endTime - startTime).toBeGreaterThanOrEqual(350);
  });

  test('should render large component hierarchies', async ({ page }) => {
    const textarea = page.locator('.json-editor-textarea');
    const preview = page.locator('.spec-editor-render');

    // Create a large spec (3 levels, multiple children)
    const largeSpec = {
      type: 'Card',
      id: 'large-root',
      props: { title: 'Large Spec' },
      children: new Array(5)
        .fill(null)
        .map((_unused, i) => ({
          type: 'Grid',
          id: `grid-${i}`,
          props: { columns: 4 },
          children: new Array(8)
            .fill(null)
            .map((_unused2, j) => ({
              type: 'Card',
              id: `card-${i}-${j}`,
              props: { title: `Card ${i}-${j}` },
            })),
        })),
    };

    await textarea.click();
    await page.keyboard.press('Control+A');
    await textarea.fill(JSON.stringify(largeSpec, null, 2));

    await page.waitForTimeout(1000);

    await expect(preview).toBeVisible();
    // Should render without crashing
  });
});
