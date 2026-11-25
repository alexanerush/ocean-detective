import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch();

const devices = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const screens = [
  { name: 'dashboard', route: '/' },
  { name: 'analysis', route: '/analysis' },
  { name: 'experiments', route: '/experiments' },
  { name: 'login', route: '/login' },
  { name: 'register', route: '/register' },
];

try {
  for (const device of devices) {
    const context = await browser.newContext({
      viewport: {
        width: device.width,
        height: device.height,
      },
      deviceScaleFactor: 2,
      hasTouch: device.name !== 'desktop',
      reducedMotion: 'reduce',
    });

    await context.addInitScript(() => {
      localStorage.setItem('od-theme', 'light');
      localStorage.setItem('od-scale', '100');
    });

    const page = await context.newPage();

    const folder =
      `../docs/adaptive-ui/screenshots/${device.name}`;

    await mkdir(folder, { recursive: true });

    for (const screen of screens) {
      await page.goto(
        `http://localhost:5173${screen.route}`
      );

      await page.locator('main h1, main h2')
        .first().waitFor();

      await page.waitForLoadState('networkidle');
      await page.evaluate(() => document.fonts.ready);

      await page.screenshot({
        path: `${folder}/${screen.name}.png`,
        fullPage: true,
        animations: 'disabled',
      });

      console.log(`Captured: ${device.name}/${screen.name}.png`);
    }

    await context.close();
  }
} finally {
  await browser.close();
}

console.log('Screenshot capture completed.');
