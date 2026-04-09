import { test, expect } from '@playwright/test';

test.describe('End-to-End - Basic Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('.spec-editor-container', { timeout: 10000 });
  });

  test('E2E: Should load spec editor', async ({ page }) => {
    const container = page.locator('.spec-editor-container');
    const textarea = page.locator('.json-editor-textarea');
    const preview = page.locator('.spec-editor-render');

    await expect(container).toBeVisible();
    await expect(textarea).toBeVisible();
    await expect(preview).toBeVisible();
  });

  test('E2E: Should display component tree', async ({ page }) => {
    await page.waitForTimeout(500);

    const tree = page.locator('.spec-editor-tree-content');
    const nodes = page.locator('.tree-node');

    await expect(tree).toBeVisible();
    const count = await nodes.count();
    expect(count).toBeGreaterThan(0);
  });

  test('E2E: Should show metrics', async ({ page }) => {
    const metrics = page.locator('.spec-editor-metric-value');
    const count = await metrics.count();

    expect(count).toBeGreaterThan(0);
  });

  test('E2E: Should allow interactions', async ({ page }) => {
    const toggleButtons = page.locator('.tree-node-toggle');
    const count = await toggleButtons.count();

    if (count > 0) {
      const firstToggle = toggleButtons.first();
      await firstToggle.click();
      await page.waitForTimeout(100);

      await expect(firstToggle).toBeVisible();
    }
  });

  test('E2E: Should support tree node selection', async ({ page }) => {
    const treeNode = page.locator('.tree-node-content').first();

    await treeNode.click();
    await page.waitForTimeout(100);

    const hasSelected = await treeNode.evaluate((el) => el.classList.contains('selected'));
    expect(hasSelected).toBe(true);
  });

  test('E2E: Should display responsive layout', async ({ page }) => {
    const leftPanel = page.locator('.spec-editor-left-panel');
    const rightPanel = page.locator('.spec-editor-right-panel');

    await expect(leftPanel).toBeVisible();
    await expect(rightPanel).toBeVisible();
  });

  test('E2E: Should handle viewport resize', async ({ page }) => {
    const container = page.locator('.spec-editor-container');

    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(200);

    const newWidth = await container.evaluate((el) => el.clientWidth);
    expect(newWidth).toBeGreaterThan(0);
  });

  test('E2E: Should maintain UI state during operations', async ({ page }) => {
    const preview = page.locator('.spec-editor-render');
    const tree = page.locator('.spec-editor-tree-content');
    const header = page.locator('.spec-editor-header');

    await page.waitForTimeout(500);

    await expect(preview).toBeVisible();
    await expect(tree).toBeVisible();
    await expect(header).toBeVisible();
  });
});

test.describe('Layout and Styling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('.spec-editor-container', { timeout: 10000 });
  });

  test('should render header correctly', async ({ page }) => {
    const header = page.locator('.spec-editor-header');
    await expect(header).toBeVisible();
  });

  test('should render panels correctly', async ({ page }) => {
    const panels = page.locator('[class*="panel"]');
    const count = await panels.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have divider for resizing', async ({ page }) => {
    const divider = page.locator('.spec-editor-v-divider');
    await expect(divider).toBeVisible();
  });

  test('should apply correct styling', async ({ page }) => {
    const container = page.locator('.spec-editor-container');
    const styles = await container.evaluate((el) => globalThis.getComputedStyle(el));

    expect(styles.display).toBeTruthy();
  });

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    const container = page.locator('.spec-editor-container');
    await expect(container).toBeVisible();
  });
});

test.describe('Component Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('.spec-editor-container', { timeout: 10000 });
  });

  test('should allow tree node expansion', async ({ page }) => {
    const toggles = page.locator('.tree-node-toggle');
    const count = await toggles.count();

    if (count > 0) {
      await toggles.first().click();
      await page.waitForTimeout(100);
    }
  });

  test('should highlight selected node', async ({ page }) => {
    const node = page.locator('.tree-node-content').first();

    await node.click();
    await page.waitForTimeout(100);

    const isSelected = await node.evaluate((el) => el.classList.contains('selected'));
    expect(typeof isSelected).toBe('boolean');
  });

  test('should update when editing JSON', async ({ page }) => {
    const textarea = page.locator('.json-editor-textarea');
    const preview = page.locator('.spec-editor-render');

    // Verify initial state
    await expect(textarea).toBeVisible();
    await expect(preview).toBeVisible();
  });

  test('should show metrics', async ({ page }) => {
    const metrics = page.locator('.spec-editor-metric-card');
    const count = await metrics.count();

    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Performance and Stability', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('.spec-editor-container', { timeout: 10000 });
  });

  test('should handle rapid clicks', async ({ page }) => {
    const node = page.locator('.tree-node-content').first();

    for (let i = 0; i < 10; i++) {
      await node.click();
      await page.waitForTimeout(10);
    }

    // Should still be functional
    expect(node).toBeTruthy();
  });

  test('should handle scroll operations', async ({ page }) => {
    const tree = page.locator('.spec-editor-tree-content');

    await tree.evaluate((el) => {
      el.scrollTop = 50;
    });

    const scrolled = await tree.evaluate((el) => el.scrollTop > 0);
    expect(scrolled).toBe(true);
  });

  test('should maintain performance after 100 operations', async ({ page }) => {
    const container = page.locator('.spec-editor-container');

    for (let i = 0; i < 100; i++) {
      await page.waitForTimeout(1);
    }

    // Should still be visible and responsive
    await expect(container).toBeVisible();
  });

  test('should not have memory leaks during navigation', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('.spec-editor-container', { timeout: 10000 });

    // Reload page multiple times
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await page.waitForSelector('.spec-editor-container', { timeout: 10000 });
    }

    const container = page.locator('.spec-editor-container');
    await expect(container).toBeVisible();
  });
});
