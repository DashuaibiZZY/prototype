import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'document/assets/行情详情-app');
const CHROME = '/usr/local/bin/google-chrome';
const DETAIL_HTML = 'file://' + path.join(ROOT, 'perp_dex/app/行情详情.html');
const INDICATOR_HTML = 'file://' + path.join(ROOT, 'perp_dex/app/指标设置.html');

const shots = [
  // —— 行情详情主页面 ——
  {
    file: 'app-market-detail-page.png',
    url: DETAIL_HTML,
    selector: '.phone-shell .screen',
    clipHeight: 700,
  },
  {
    file: 'app-market-detail-header.png',
    url: DETAIL_HTML,
    selector: '.phone-shell header',
    clipHeight: 56,
  },
  {
    file: 'app-market-detail-price.png',
    url: DETAIL_HTML,
    selector: '.phone-shell section.flex.px-4.py-3',
    clipHeight: 80,
  },
  {
    file: 'app-market-detail-kline.png',
    url: DETAIL_HTML,
    selector: '.phone-shell section.border-t.border-gray-50',
    parentSection: 'kline-section',
    clipHeight: 320,
  },
  {
    file: 'app-market-detail-indicators.png',
    url: DETAIL_HTML,
    selector: '.phone-shell .px-4.py-1\\.5.flex.items-center.justify-between',
    clipHeight: 32,
  },
  {
    file: 'app-market-detail-orderbook.png',
    url: DETAIL_HTML,
    before: "switchMarketTab('orderbook')",
    selector: '#content-orderbook',
    clipHeight: 200,
  },
  {
    file: 'app-market-detail-trades.png',
    url: DETAIL_HTML,
    before: "switchMarketTab('trades')",
    selector: '#content-trades',
    clipHeight: 200,
  },
  {
    file: 'app-market-detail-funding.png',
    url: DETAIL_HTML,
    before: "switchMarketTab('funding')",
    selector: '#content-funding',
    clipHeight: 520,
  },
  {
    file: 'app-market-detail-footer.png',
    url: DETAIL_HTML,
    selector: '.phone-shell footer',
    clipHeight: 72,
  },
  {
    file: 'app-market-detail-modal-share.png',
    url: DETAIL_HTML,
    before: 'openShare()',
    selector: '#modal-share > div',
  },
  {
    file: 'app-market-detail-network-error.png',
    url: DETAIL_HTML,
    before: `(() => {
      if (!isNetError) toggleDetailNetworkError();
    })()`,
    selector: '.phone-shell .screen',
    clipHeight: 700,
  },
  // —— 指标设置子页面 ——
  {
    file: 'app-market-detail-subpage-indicator-list.png',
    url: INDICATOR_HTML,
    selector: '#page-list',
    clipHeight: 700,
  },
  {
    file: 'app-market-detail-subpage-indicator-ma.png',
    url: INDICATOR_HTML,
    before: "openPage('page-ma')",
    selector: '#page-ma',
    clipHeight: 700,
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
  await page.setViewport({ width: 420, height: 900 });
  await page.goto(shot.url, { waitUntil: 'networkidle0', timeout: 120000 });
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
  if (shot.parentSection === 'kline-section' && el) {
    const section = await el.evaluateHandle((n) =>
      n.closest('section.border-t.border-gray-50'),
    );
    if (section?.asElement()) el = section.asElement();
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
