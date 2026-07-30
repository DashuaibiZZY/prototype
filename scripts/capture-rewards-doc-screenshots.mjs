import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'document/assets/奖励-app');
const CHROME = '/usr/local/bin/google-chrome';
const REWARDS_HTML = 'file://' + path.join(ROOT, 'perp_dex/app/奖励.html');

const shots = [
  {
    file: 'app-rewards-page.png',
    before: "setPageState('normal')",
    selector: '.phone-shell .screen',
    clipHeight: 700,
  },
  {
    file: 'app-rewards-header.png',
    before: "setPageState('normal')",
    selector: '.phone-shell header',
    clipHeight: 56,
  },
  {
    file: 'app-rewards-activity-hub.png',
    before: "setPageState('normal')",
    selector: '#activity-section',
    clipHeight: 280,
  },
  {
    file: 'app-rewards-benefits.png',
    before: "setPageState('normal')",
    selector: '#benefits-section',
    clipHeight: 360,
  },
  {
    file: 'app-rewards-bottom-nav.png',
    before: "setPageState('normal')",
    selector: '.phone-shell nav.absolute.bottom-0',
    clipHeight: 72,
  },
  {
    file: 'app-rewards-activity-no-activity.png',
    before: "setPageState('no-activity')",
    selector: '#activity-section',
    clipHeight: 180,
  },
  {
    file: 'app-rewards-guest.png',
    before: "setPageState('guest')",
    selector: '.phone-shell .screen',
    clipHeight: 700,
  },
  {
    file: 'app-rewards-guest-banner.png',
    before: "setPageState('guest')",
    selector: '#guest-banner',
    clipHeight: 64,
  },
  {
    file: 'app-rewards-error.png',
    before: "setPageState('error')",
    selector: '.phone-shell .screen',
    clipHeight: 700,
  },
  {
    file: 'app-rewards-error-banner.png',
    before: "setPageState('error')",
    selector: '#error-banner',
    clipHeight: 48,
  },
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

for (const shot of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width: 520, height: 900 });
  await page.goto(REWARDS_HTML, { waitUntil: 'networkidle0', timeout: 120000 });
  await new Promise((r) => setTimeout(r, 800));
  if (shot.before) {
    await page.evaluate(shot.before);
    await new Promise((r) => setTimeout(r, 700));
  }
  let el = await page.$(shot.selector);
  if (!el && shot.selector.includes('\\')) {
    const h = await page.evaluateHandle(
      (sel) => document.querySelector(sel.replace(/\\\\/g, '')),
      shot.selector,
    );
    if (h?.asElement()) el = h.asElement();
  }
  if (!el) {
    console.error('MISSING', shot.file, shot.selector);
    await page.close();
    continue;
  }
  await el.evaluate((n) => n.scrollIntoView({ block: 'center' }));
  const outPath = path.join(OUT, shot.file);
  if (shot.clipHeight) {
    const box = await el.boundingBox();
    if (box) {
      await page.screenshot({
        path: outPath,
        clip: {
          x: box.x,
          y: box.y,
          width: box.width,
          height: Math.min(box.height, shot.clipHeight),
        },
      });
    } else await el.screenshot({ path: outPath, type: 'png' });
  } else {
    try {
      await el.screenshot({ path: outPath, type: 'png' });
    } catch {
      const box = await el.boundingBox();
      if (box) {
        await page.screenshot({
          path: outPath,
          clip: { x: box.x, y: box.y, width: box.width, height: box.height },
        });
      }
    }
  }
  console.log('OK', shot.file);
  await page.close();
}

await browser.close();
console.log('Done:', OUT);
