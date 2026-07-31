import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'document/assets/行情-app');
const CHROME = '/usr/local/bin/google-chrome';
const MARKETS_HTML = 'file://' + path.join(ROOT, 'perp_dex/app/行情.html');
const EDIT_FAV_HTML = 'file://' + path.join(ROOT, 'perp_dex/app/编辑自选.html');

const shots = [
  {
    file: 'app-markets-page.png',
    before: 'switchMarketTab("all")',
    selector: '.phone-shell .screen',
    clipHeight: 720,
  },
  {
    file: 'app-markets-search.png',
    before: `switchMarketTab('all'); (() => {
      const input = document.querySelector('input[type="text"]');
      if (input) input.value = 'BTC';
    })()`,
    selector: '.px-5.pt-12.pb-4',
    clipHeight: 72,
  },
  {
    file: 'app-markets-tabs.png',
    before: 'switchMarketTab("all")',
    selector: '#market-tabs',
    clipHeight: 44,
  },
  {
    file: 'app-markets-list-header.png',
    before: 'switchMarketTab("fav")',
    selector: '#markets-list-header',
    clipHeight: 48,
  },
  {
    file: 'app-markets-list-all.png',
    before: 'switchMarketTab("all")',
    selector: '#content-list',
    clipHeight: 360,
  },
  {
    file: 'app-markets-tab-fav.png',
    before: 'switchMarketTab("fav")',
    selector: '#content-list',
    clipHeight: 160,
  },
  {
    file: 'app-markets-tab-fav-empty.png',
    before: `switchMarketTab('fav'); document.getElementById('content-list').innerHTML = '<div class="py-20 text-center text-gray-300 font-bold text-[11px]">暫無自選，快去添加吧</div>';`,
    selector: '#content-list',
    clipHeight: 200,
  },
  {
    file: 'app-markets-tab-hot.png',
    before: 'switchMarketTab("hot")',
    selector: '#content-list',
    clipHeight: 160,
  },
  {
    file: 'app-markets-tab-new.png',
    before: 'switchMarketTab("new")',
    selector: '#content-list',
    clipHeight: 120,
  },
  {
    file: 'app-markets-tab-dynamic.png',
    before: 'switchMarketTab("tradefi")',
    selector: '#content-list',
    clipHeight: 120,
  },
  {
    file: 'app-markets-error.png',
    before: 'toggleNetworkError()',
    selector: '.phone-shell .screen',
    clipHeight: 720,
  },
  {
    file: 'app-markets-error-view.png',
    before: `toggleNetworkError(); document.getElementById('modal-timeout')?.classList.add('hidden');`,
    selector: '#market-error-view',
    clipHeight: 320,
  },
  {
    file: 'app-markets-modal-timeout.png',
    before: 'toggleNetworkError()',
    selector: '#modal-timeout .bg-white',
    clipHeight: 280,
  },
  {
    file: 'app-markets-bottom-nav.png',
    before: 'switchMarketTab("all")',
    selector: 'nav.absolute.bottom-0',
    clipHeight: 72,
  },
  {
    file: 'app-markets-subpage-edit-fav.png',
    url: EDIT_FAV_HTML,
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
  await page.goto(shot.url || MARKETS_HTML, { waitUntil: 'domcontentloaded', timeout: 120000 });
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
