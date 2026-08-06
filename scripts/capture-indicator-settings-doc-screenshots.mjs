import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'document/assets/指标设置-app');
const CHROME = '/usr/local/bin/google-chrome';
const INDICATOR_HTML = 'file://' + path.join(ROOT, 'perp_dex/app/指标设置.html');

const shots = [
  {
    file: 'app-indicator-list-page.png',
    selector: '.phone-shell .screen',
    clipHeight: 720,
  },
  {
    file: 'app-indicator-list-header.png',
    selector: '#page-list header',
    clipHeight: 64,
  },
  {
    file: 'app-indicator-list-main.png',
    selector: '#indicator-section-main',
    clipHeight: 200,
  },
  {
    file: 'app-indicator-list-sub.png',
    selector: '#indicator-section-sub',
    clipHeight: 200,
  },
  {
    file: 'app-indicator-subpage-ma.png',
    before: "openPage('page-ma')",
    selector: '#page-ma',
    clipHeight: 720,
  },
  {
    file: 'app-indicator-subpage-ema.png',
    before: "openPage('page-ema')",
    selector: '#page-ema',
    clipHeight: 720,
  },
  {
    file: 'app-indicator-subpage-boll.png',
    before: "openPage('page-boll')",
    selector: '#page-boll',
    clipHeight: 720,
  },
  {
    file: 'app-indicator-subpage-macd.png',
    before: "openPage('page-macd')",
    selector: '#page-macd',
    clipHeight: 720,
  },
  {
    file: 'app-indicator-subpage-kdj.png',
    before: "openPage('page-kdj')",
    selector: '#page-kdj',
    clipHeight: 720,
  },
  {
    file: 'app-indicator-subpage-rsi.png',
    before: "openPage('page-rsi')",
    selector: '#page-rsi',
    clipHeight: 720,
  },
  {
    file: 'app-indicator-footer-actions.png',
    before: "openPage('page-ma')",
    selector: '#indicator-footer-ma',
    clipHeight: 80,
  },
  {
    file: 'app-indicator-picker-width.png',
    before: "openPage('page-ma'); openWidthPicker()",
    selector: '#picker-width',
    clipHeight: 720,
  },
  {
    file: 'app-indicator-picker-color.png',
    before: "openPage('page-ma'); openColorPicker()",
    selector: '#picker-color',
    clipHeight: 720,
  },
  {
    file: 'app-indicator-input-error.png',
    before: `openPage('page-ma'); showInputError(); (() => {
      const input = document.querySelector('#page-ma input[type="number"]');
      if (input) input.value = '0';
    })()`,
    selector: '.phone-shell .screen',
    clipHeight: 720,
  },
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

async function capture(page, shot) {
  const rect = await page.evaluate((selector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    el.scrollIntoView({ block: 'center', inline: 'nearest' });
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  }, shot.selector);

  if (!rect || rect.width <= 0 || rect.height <= 0) {
    console.error('MISSING', shot.file, shot.selector);
    return;
  }

  const outPath = path.join(OUT, shot.file);
  const height = shot.clipHeight ? Math.min(rect.height, shot.clipHeight) : rect.height;
  await page.screenshot({
    path: outPath,
    clip: { x: rect.x, y: rect.y, width: rect.width, height: height },
  });
  console.log('OK', shot.file);
}

for (const shot of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width: 520, height: 900 });
  await page.goto(INDICATOR_HTML, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await new Promise((r) => setTimeout(r, 400));
  if (shot.before) {
    await page.evaluate(shot.before);
    await new Promise((r) => setTimeout(r, 500));
  }
  await capture(page, shot);
  await page.close();
}

await browser.close();
console.log('Done:', OUT);
