import { chromium } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';

const FRONTEND = 'http://localhost:5173';
const API = 'http://localhost:3000/api';

const devices = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const themes = ['light', 'dark'];

const filename = 'S2_14-12-20_18QYF_0.tif';

const browser = await chromium.launch();

let captured = 0;

async function check(response, label) {
  if (!response.ok()) {
    throw new Error(`${label}: HTTP ${response.status()} ${await response.text()}`);
  }
  console.log(`OK: ${label}`);
  return response.json();
}

async function capture(page, folder, name) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);

  await page.evaluate(async () => {
    await Promise.all(
      [...document.images].map(img => img.decode().catch(() => {}))
    );
  });

  const layout = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));

  if (layout.content > layout.viewport + 1) {
    console.warn(`WARNING: horizontal overflow on ${name}`, layout);
  }

  await page.evaluate(() => window.scrollTo(0, 0));

  await page.screenshot({
    path: `${folder}/${name}.png`,
    fullPage: true,
    animations: 'disabled',
  });

  captured++;
  console.log(`Captured: ${folder}/${name}.png`);
}

try {
  const setup = await browser.newContext({
    extraHTTPHeaders: { Origin: FRONTEND },
  });

  const email = `adaptive-demo-${Date.now()}@example.com`;
  const password = randomBytes(24).toString('hex');

  await check(
    await setup.request.post(`${API}/auth/register`, {
      data: { email, password },
    }),
    'Demo account registered'
  );

  const upload = await check(
    await setup.request.post(`${API}/images`, {
      multipart: {
        image: {
          name: filename,
          mimeType: 'image/tiff',
          buffer: await readFile(`../data/${filename}`),
        },
      },
      timeout: 90000,
    }),
    'GeoTIFF uploaded'
  );

  const imageId = String(upload.image.image_id);

  console.log('Running real ML inference...');

  const analysis = await check(
    await setup.request.post(`${API}/analyses`, {
      data: {
        imageId,
        confirmed: true,
      },
      timeout: 90000,
    }),
    'ML analysis completed'
  );

  const analysisId = String(analysis.analysis_id);

  console.log(`Analysis ID: ${analysisId}`);

  const session = await setup.storageState();

  await setup.close();

  for (const theme of themes) {
    for (const device of devices) {
      const context = await browser.newContext({
        storageState: session,
        viewport: {
          width: device.width,
          height: device.height,
        },
        deviceScaleFactor: 2,
        hasTouch: device.name !== 'desktop',
        reducedMotion: 'reduce',
        colorScheme: theme,
      });

      await context.addInitScript(({ theme }) => {
        localStorage.setItem('od-theme', theme);
        localStorage.setItem('od-scale', '100');
      }, { theme });

      const page = await context.newPage();

      page.setDefaultTimeout(30000);

      const folder =
        `../docs/adaptive-ui/screenshots/authenticated/${theme}/${device.name}`;

      await mkdir(folder, { recursive: true });

      // ACCOUNT

      await page.goto(`${FRONTEND}/account`);

      await page.getByRole('heading', {
        name: 'Your account',
        exact: true,
      }).waitFor();

      await page.waitForFunction(
        theme => document.documentElement.dataset.theme === theme,
        theme
      );

      await capture(page, folder, 'account');

      // HISTORY

      await page.goto(`${FRONTEND}/history`);

      await page.getByRole('heading', {
        name: 'Analysis History',
        exact: true,
      }).waitFor();

      const row = page.getByRole('row').filter({
        hasText: filename,
      });

      await row.waitFor();

      await capture(page, folder, 'history');

      // ANALYSIS RESULTS

      await row.getByRole('button', {
        name: 'Open',
        exact: true,
      }).click();

      await page.getByRole('button', {
        name: 'View results',
        exact: false,
      }).first().click();

      await page.getByRole('heading', {
        name: `Analysis #${analysisId}`,
        exact: true,
      }).waitFor();

      await capture(page, folder, 'results');

      await context.close();
    }
  }

  console.log(`Completed: ${captured}/18 screenshots`);

} finally {
  await browser.close();
}
