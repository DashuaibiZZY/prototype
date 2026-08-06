import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'document/assets/导航栏');
const CHROME = '/usr/local/bin/google-chrome';
const HTML = 'file://' + path.join(ROOT, 'perp_dex/合约交易.html');

const showMoreMenu = `(() => {
  const more = document.querySelector('nav .flex.items-center.space-x-6 > .relative.group.h-full');
  const dropdown = more?.querySelector('.absolute.top-full');
  if (dropdown) {
    dropdown.classList.remove('hidden');
    dropdown.style.display = 'block';
  }
})()`;

const showLangMenu = `(() => {
  const lang = document.querySelector('nav .relative.group.cursor-pointer');
  const dropdown = lang?.querySelector('.absolute.top-full');
  if (dropdown) {
    dropdown.classList.remove('hidden');
    dropdown.style.display = 'block';
  }
})()`;

const openSettingsDrawer = `(() => {
  const drawer = document.getElementById('settings-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const panel = document.getElementById('drawer-panel');
  if (!drawer || !overlay || !panel) return;
  drawer.classList.remove('invisible');
  overlay.classList.add('opacity-100');
  panel.classList.remove('translate-x-full');
})()`;

const shots = [
  {
    file: 'web-nav-bar-full.png',
    selector: 'nav',
    clipHeight: 40,
  },
  {
    file: 'web-nav-logo.png',
    selector: 'nav .font-black.text-lg.tracking-tighter',
    clipHeight: 40,
  },
  {
    file: 'web-nav-main-menu.png',
    selector: 'nav .flex.space-x-5',
    clipHeight: 40,
  },
  {
    file: 'web-nav-more-dropdown.png',
    before: showMoreMenu,
    selector: 'nav .flex.items-center.space-x-6 > .relative.group.h-full .absolute.top-full > div',
  },
  {
    file: 'web-nav-theme-switch.png',
    selector: 'nav button[title="切換模式"]',
    clipHeight: 32,
  },
  {
    file: 'web-nav-message-bell.png',
    selector: 'nav button[title="消息中心"]',
    clipHeight: 32,
  },
  {
    file: 'web-nav-lang-dropdown.png',
    before: showLangMenu,
    selector: 'nav .relative.group.cursor-pointer .absolute.top-full > div',
  },
  {
    file: 'web-nav-settings-icon.png',
    selector: 'nav button[title="設置"]',
    clipHeight: 32,
  },
  {
    file: 'web-nav-settings-drawer.png',
    before: openSettingsDrawer,
    selector: '#drawer-panel',
    clipHeight: 560,
  },
  {
    file: 'web-nav-right-actions.png',
    before: `(() => {
      const wallet = document.getElementById('user-account-wrapper');
      if (wallet) wallet.style.display = 'none';
    })()`,
    selector: 'nav > .flex.items-center.space-x-3',
    clipHeight: 40,
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
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(HTML, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await new Promise((r) => setTimeout(r, 600));
  if (shot.before) {
    await page.evaluate(shot.before);
    await new Promise((r) => setTimeout(r, 400));
  }
  await capture(page, shot);
  await page.close();
}

await browser.close();
console.log('Done:', OUT);
