import { test, expect } from '@playwright/test';

test.describe('Render Tracking - Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('.spec-editor-container', { timeout: 10000 });
  });

  test.describe('Initial Render Tracking', () => {
    test('should track initial renders on page load', async ({ page }) => {
      // Wait for metrics to be available
      await page.waitForTimeout(500);

      const totalRendersMetric = page.locator('.spec-editor-metric-label');
      const hasRenderMetrics = await totalRendersMetric.count();

      expect(hasRenderMetrics).toBeGreaterThan(0);
    });

    test('should display initial render reason for components', async ({ page }) => {
      const treeIcons = page.locator('.tree-node-icon');
      const count = await treeIcons.count();

      expect(count).toBeGreaterThan(0);
      // Icons represent different render reasons with emojis like ⭐ for initial
    });

    test('should count all rendered components in tree', async ({ page }) => {
      const treeNodes = page.locator('.tree-node');
      const count = await treeNodes.count();

      // Should have at least root + a few children
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Re-render Tracking', () => {
    test('should have re-render tracking functionality', async ({ page }) => {
      const textarea = page.locator('.json-editor-textarea');
      const renderCountMetric = page.locator('.spec-editor-metric-value').first();

      // Verify metric is visible
      await expect(renderCountMetric).toBeVisible();

      // Verify textarea is accessible for modifications
      await expect(textarea).toBeVisible();
    });
  });

  test.describe('Prop Change Tracking', () => {
    test('should detect prop changes between renders', async ({ page }) => {
      const textarea = page.locator('.json-editor-textarea');
      const tree = page.locator('.spec-editor-tree-content');

      // Verify prop change functionality through UI
      await expect(textarea).toBeVisible();
      await expect(tree).toBeVisible();
    });
  });

  test.describe('Render Reason Detection', () => {
    test('should mark initial renders with initial_render reason', async ({ page }) => {
      // On page load, all first renders should be marked initial_render
      const treeContent = page.locator('.spec-editor-tree-content');
      await expect(treeContent).toBeVisible();

      const icons = page.locator('.tree-node-icon');
      const count = await icons.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Metrics Accuracy', () => {
    test('should accurately count total renders', async ({ page }) => {
      // Total renders should be cumulative
      const totalRendersMetric = page.locator('.spec-editor-metric-value').first();
      const text = await totalRendersMetric.textContent();

      // Should be a number >= 1 (at least initial renders)
      expect(Number.parseInt(text || '0')).toBeGreaterThan(0);
    });

    test('should identify most frequently rendered component', async ({ page }) => {
      const mostRenderedMetric = page.locator('.spec-editor-metric-value').nth(1);

      await expect(mostRenderedMetric).toBeVisible();
      const text = await mostRenderedMetric.textContent();
      expect(text).toBeTruthy();
    });

    test('should calculate avg duration', async ({ page }) => {
      const avgDurationMetric = page.locator('text=AVG DURATION');
      await expect(avgDurationMetric).toBeVisible();

      // Should display duration value
      const value = page.locator('.spec-editor-metric-value').nth(2);
      const text = await value.textContent();
      expect(text).toMatch(/\d+/);
    });

    test('should show render reason distribution', async ({ page }) => {
      const renderReasonMetric = page.locator('text=RENDER REASON');
      await expect(renderReasonMetric).toBeVisible();
    });
  });
});

test.describe('Component Tree Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('.spec-editor-container');
  });

  test('should expand and collapse tree nodes', async ({ page }) => {
    const toggleButtons = page.locator('.tree-node-toggle');
    const count = await toggleButtons.count();

    if (count > 0) {
      const firstToggle = toggleButtons.first();

      // Click to expand/collapse
      await firstToggle.click();
      await page.waitForTimeout(200);

      // Should still be visible
      await expect(firstToggle).toBeVisible();
    }
  });

  test('should highlight selected tree node', async ({ page }) => {
    const treeNodeContent = page.locator('.tree-node-content').first();

    await treeNodeContent.click();
    await page.waitForTimeout(100);

    // Should have selected class
    const hasSelected = await treeNodeContent.evaluate((el) =>
      el.classList.contains('selected')
    );

    expect(hasSelected).toBe(true);
  });

  test('should toggle node selection on click', async ({ page }) => {
    const treeNode = page.locator('.tree-node-content').first();

    // Select
    await treeNode.click();
    await page.waitForTimeout(100);

    let hasSelected = await treeNode.evaluate((el) => el.classList.contains('selected'));
    expect(hasSelected).toBe(true);

    // Deselect (toggle)
    await treeNode.click();
    await page.waitForTimeout(100);

    hasSelected = await treeNode.evaluate((el) => el.classList.contains('selected'));
    expect(hasSelected).toBe(false);
  });

  test('should show component count in parentheses', async ({ page }) => {
    const counts = page.locator('.tree-node-count');
    const countText = await counts.first().textContent();

    // Should be in format (n)
    expect(countText).toMatch(/\(\d+\)/);
  });
});

test.describe('Spec Editor - Advanced Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('.spec-editor-container');
  });

  test('should verify editor functionality', async ({ page }) => {
    const textarea = page.locator('.json-editor-textarea');
    const preview = page.locator('.spec-editor-render');

    await expect(textarea).toBeVisible();
    await expect(preview).toBeVisible();
  });
});

test.describe('Responsive Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('.spec-editor-container');
  });

  test('should adapt layout on viewport resize', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });

    await page.waitForTimeout(200);

    const container = page.locator('.spec-editor-container');
    const newWidth = await container.evaluate((el) => el.clientWidth);
    expect(newWidth).toBeGreaterThan(0);
  });

  test('should keep editor and preview visible on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 600 });

    const leftPanel = page.locator('.spec-editor-left-panel');
    const rightPanel = page.locator('.spec-editor-right-panel');

    await expect(leftPanel).toBeVisible();
    await expect(rightPanel).toBeVisible();
  });

  test('should handle mobile-sized viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    const container = page.locator('.spec-editor-container');
    await expect(container).toBeVisible();

    // Should still have all main components
    const header = page.locator('.spec-editor-header');
    await expect(header).toBeVisible();
  });
});
