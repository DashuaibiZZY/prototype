import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'document/assets/首页-app');
const CHROME = '/usr/local/bin/google-chrome';
const HOME_HTML = 'file://' + path.join(ROOT, 'perp_dex/app/首页.html');

const showHome = `(() => {
  window.simulateSplash = () => {
    document.getElementById('page-splash')?.classList.add('hidden');
    document.getElementById('page-home')?.classList.remove('hidden');
  };
  window.simulateSplash();
})()`;

const setLoggedIn = `(() => {
  document.getElementById('status-logged-out')?.classList.add('hidden');
  document.getElementById('status-logged-in')?.classList.remove('hidden');
  document.getElementById('quick-entry-section')?.classList.remove('hidden');
})()`;

const setLoggedOut = `(() => {
  document.getElementById('status-logged-out')?.classList.remove('hidden');
  document.getElementById('status-logged-in')?.classList.add('hidden');
  document.getElementById('quick-entry-section')?.classList.add('hidden');
})()`;

const shots = [
  {
    file: 'app-home-splash.png',
    before: `document.getElementById('page-splash')?.classList.remove('hidden'); document.getElementById('page-home')?.classList.add('hidden');`,
    selector: '.phone-shell .screen',
    clipHeight: 720,
  },
  {
    file: 'app-home-page-guest.png',
    before: `${setLoggedOut}; switchMarketTab('fav');`,
    selector: '.phone-shell .screen',
    clipHeight: 720,
  },
  {
    file: 'app-home-header.png',
    before: setLoggedOut,
    selector: '#page-home header',
    clipHeight: 56,
  },
  {
    file: 'app-home-guest-banner.png',
    before: setLoggedOut,
    selector: '#status-logged-out',
    clipHeight: 160,
  },
  {
    file: 'app-home-equity-card.png',
    before: setLoggedIn,
    selector: '#status-logged-in',
    clipHeight: 100,
  },
  {
    file: 'app-home-quick-entry.png',
    before: setLoggedIn,
    selector: '#quick-entry-section',
    clipHeight: 100,
  },
  {
    file: 'app-home-banner.png',
    before: setLoggedIn,
    selector: '.bg-gradient-to-r.from-blue-600',
    clipHeight: 120,
  },
  {
    file: 'app-home-market-tabs.png',
    before: `${setLoggedIn}; switchMarketTab('fav')`,
    selector: '#content-fav',
    clipHeight: 380,
  },
  {
    file: 'app-home-fav-empty.png',
    before: `${setLoggedIn}; switchMarketTab('fav'); document.getElementById('fav-empty-state')?.classList.remove('hidden'); document.getElementById('fav-filled-state')?.classList.add('hidden');`,
    selector: '#fav-empty-state',
    clipHeight: 420,
  },
  {
    file: 'app-home-fav-filled.png',
    before: `${setLoggedIn}; switchMarketTab('fav'); addHotToFav();`,
    selector: '#fav-filled-state',
    clipHeight: 280,
  },
  {
    file: 'app-home-market-hot.png',
    before: `${setLoggedIn}; switchMarketTab('hot')`,
    selector: '#content-list',
    clipHeight: 280,
  },
  {
    file: 'app-home-market-new.png',
    before: `${setLoggedIn}; switchMarketTab('new')`,
    selector: '#content-list',
    clipHeight: 280,
  },
  {
    file: 'app-home-announcements.png',
    before: setLoggedIn,
    selector: '#announcements-section',
    clipHeight: 220,
  },
  {
    file: 'app-home-bottom-nav.png',
    before: setLoggedIn,
    selector: 'nav.absolute.bottom-0',
    clipHeight: 72,
  },
  {
    file: 'app-home-net-error.png',
    before: `${setLoggedIn}; toggleNetworkError();`,
    selector: '.phone-shell .screen',
    clipHeight: 720,
  },
  {
    file: 'app-home-modal-timeout.png',
    before: `${setLoggedIn}; toggleNetworkError();`,
    selector: '#modal-timeout .bg-white',
    clipHeight: 280,
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
  await page.goto(HOME_HTML, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await new Promise((r) => setTimeout(r, 2200));
  await page.evaluate(showHome);
  if (shot.before) {
    await page.evaluate(shot.before);
    await new Promise((r) => setTimeout(r, 600));
  }
  await capture(page, shot);
  await page.close();
}

await browser.close();
console.log('Done:', OUT);
