import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const screens = [
  { route: '/', name: 'Dashboard' },
  { route: '/analysis', name: 'Analysis' },
  { route: '/experiments', name: 'Experiments' },
  { route: '/login', name: 'Login' },
  { route: '/register', name: 'Registration' },
];

const sizes = [
  { name: 'mobile portrait', width: 390, height: 844 },
  { name: 'mobile landscape', width: 844, height: 390 },
  { name: 'tablet portrait', width: 768, height: 1024 },
  { name: 'tablet landscape', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: '200% zoom reflow equivalent', width: 720, height: 450 },
  { name: 'narrow reflow', width: 320, height: 568 },
];

test.describe('Adaptive layout', () => {


  for (const screen of screens) {
    test(`${screen.name}: responsive layout`, async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== 'desktop',
        'Viewport matrix is executed in the desktop project'
      );
      await page.goto(screen.route);
      await page.locator('main h1, main h2').first().waitFor();

      for (const size of sizes) {
        await page.setViewportSize({
          width: size.width,
          height: size.height,
        });

        await expect(page.locator('.od-sidebar nav')).toBeVisible();

        const layout = await page.evaluate(() => ({
          viewport: window.innerWidth,
          content: document.documentElement.scrollWidth,
        }));

        expect.soft(
          layout.content,
          `${screen.name}: ${size.name}`
        ).toBeLessThanOrEqual(layout.viewport + 1);
      }
    });
  }
});

for (const screen of screens) {
  test(`${screen.name}: navigation and touch targets`, async ({ page }, testInfo) => {
    await page.goto(screen.route);
    await page.locator('main h1, main h2').first().waitFor();

    const navigation = page.locator('.od-sidebar nav a');
    expect(await navigation.count()).toBeGreaterThan(0);

    for (const link of await navigation.all()) {
      await expect(link).toBeVisible();
    }

    if (testInfo.project.name === 'desktop') return;

    const violations = await page.evaluate(() => {
      const selector = [
        'button',
        'select',
        'summary',
        'input:not([type="hidden"]):not([type="file"])',
        'main a',
        '.od-sidebar nav a',
      ].join(',');

      return Array.from(document.querySelectorAll<HTMLElement>(selector))
        .filter(el => {
          const r = el.getBoundingClientRect();
          const s = getComputedStyle(el);
          return r.width > 0 && r.height > 0 &&
            s.visibility !== 'hidden' &&
            s.display !== 'none' &&
            !el.closest('[inert]');
        })
        .map(el => {
          const r = el.getBoundingClientRect();
          return {
            element: el.tagName,
            text: (el.innerText || el.getAttribute('aria-label') || '').trim(),
            width: Math.round(r.width * 100) / 100,
            height: Math.round(r.height * 100) / 100,
          };
        })
        .filter(r => r.width < 43.99 || r.height < 43.99);
    });

    expect(violations).toEqual([]);
  });

  for (const theme of ['light', 'dark']) {
    test(`${screen.name}: WCAG contrast ${theme}`, async ({ page }, testInfo) => {
      await page.addInitScript(value => {
        localStorage.setItem('od-theme', value);
      }, theme);

      await page.goto(screen.route);
      await page.locator('main h1, main h2').first().waitFor();

      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

      await page.emulateMedia({ reducedMotion: 'reduce' });

      const result = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();

      await testInfo.attach('contrast-report', {
        body: JSON.stringify(result, null, 2),
        contentType: 'application/json',
      });

      expect(result.violations.map(v => ({
        rule: v.id,
        elements: v.nodes.map(n => ({
          target: n.target,
          details: n.failureSummary,
        })),
      }))).toEqual([]);
    });
  }
}
