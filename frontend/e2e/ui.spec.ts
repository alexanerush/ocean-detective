import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('dashboard navigation and upload validation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Start analysis' }).click();
  await expect(
    page.getByRole('heading', { name: 'Satellite Image Analysis' }),
  ).toBeVisible();
  await page.getByLabel('Select satellite image').setInputFiles({
    name: 'bad.png',
    mimeType: 'image/png',
    buffer: Buffer.from('test'),
  });
  await expect(page.getByRole('alert')).toContainText('Only GeoTIFF');
});
test('theme persistence and responsive width', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Display settings', { exact: true }).click();
  await page.getByLabel('Color scheme').selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
  ).toBeTruthy();
});
for (const theme of ['light', 'dark'])
  test(`dashboard accessibility ${theme}`, async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByRole('heading', { name: 'Dashboard', exact: true }).waitFor();
    await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    await testInfo.attach('axe-report', {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });
    expect(
      results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  });
