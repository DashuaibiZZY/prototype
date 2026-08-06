import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'document/assets/邀请返佣');
const CHROME = '/usr/local/bin/google-chrome';
const WEB_HTML = 'file://' + path.join(ROOT, 'perp_dex/邀请返佣.html');
const APP_HTML = 'file://' + path.join(ROOT, 'perp_dex/app/邀请返佣.html');
const APP_FRIENDS_HTML = 'file://' + path.join(ROOT, 'perp_dex/app/邀请好友明细.html');

const hideWebPrototype = `document.querySelector('.prototype-switch')?.style.setProperty('display','none')`;
const hideAppPrototype = `document.querySelector('.prototype-role-switch')?.style.setProperty('display','none')`;

const shots = [
  // —— Web 邀请返佣（普通用户）——
  {
    file: 'web-referral-toolbox.png',
    url: WEB_HTML,
    before: `${hideWebPrototype}; switchRole('normal')`,
    selector: '#normal-content .bg-gray-50\\/50.rounded-sm',
    clipHeight: 120,
  },
  {
    file: 'web-referral-dashboard.png',
    url: WEB_HTML,
    before: hideWebPrototype,
    selector: '#normal-content .grid.grid-cols-1.lg\\:grid-cols-4.bg-black',
    clipHeight: 200,
  },
  {
    file: 'web-referral-tier-path.png',
    url: WEB_HTML,
    before: hideWebPrototype,
    selector: '#normal-content .lg\\:col-span-2.border.border-gray-100',
    clipHeight: 360,
  },
  {
    file: 'web-referral-tier-tooltip.png',
    url: WEB_HTML,
    before: `${hideWebPrototype}; (() => {
      const t = document.querySelector('#normal-content .tooltip-box');
      if (t) { t.style.visibility = 'visible'; t.style.opacity = '1'; }
    })()`,
    selector: '#normal-content .lg\\:col-span-2.border.border-gray-100',
    clipHeight: 200,
  },
  {
    file: 'web-referral-ambassador.png',
    url: WEB_HTML,
    before: hideWebPrototype,
    selector: '#normal-content .bg-blue-600.p-8.rounded-sm',
    clipHeight: 200,
  },
  {
    file: 'web-referral-friends-table.png',
    url: WEB_HTML,
    before: hideWebPrototype,
    selector: '#normal-content .border.border-gray-100.rounded-sm.overflow-hidden.shadow-sm',
    clipHeight: 400,
  },
  {
    file: 'web-referral-share-modal.png',
    url: WEB_HTML,
    before: `${hideWebPrototype}; toggleModal('modal-share')`,
    selector: '#modal-share > .bg-white',
    clipHeight: 560,
  },
  // —— Web 代理用户占位态 ——
  {
    file: 'web-referral-agent-banner.png',
    url: WEB_HTML,
    before: `${hideWebPrototype}; switchRole('agent')`,
    selector: '#agent-content .bg-blue-50.border.border-blue-200',
    clipHeight: 80,
  },
  {
    file: 'web-referral-agent-placeholder.png',
    url: WEB_HTML,
    before: `${hideWebPrototype}; switchRole('agent')`,
    selector: '#agent-content .grid.grid-cols-1.lg\\:grid-cols-4.bg-black',
    clipHeight: 200,
  },
  {
    file: 'web-referral-agent-tier-empty.png',
    url: WEB_HTML,
    before: `${hideWebPrototype}; switchRole('agent')`,
    selector: '#agent-content .lg\\:col-span-2.border.border-gray-100',
    clipHeight: 320,
  },
  {
    file: 'web-referral-agent-friends-empty.png',
    url: WEB_HTML,
    before: `${hideWebPrototype}; switchRole('agent')`,
    selector: '#agent-content .border.border-gray-100.rounded-sm.overflow-hidden.shadow-sm:last-of-type',
    clipHeight: 200,
  },
  // —— App 邀请返佣（普通用户）——
  {
    file: 'app-referral-page.png',
    url: APP_HTML,
    before: `${hideAppPrototype}; switchRole('normal')`,
    selector: '.phone-shell .screen',
    clipHeight: 720,
  },
  {
    file: 'app-referral-header.png',
    url: APP_HTML,
    before: `${hideAppPrototype}; switchRole('normal')`,
    selector: '.phone-shell header',
    clipHeight: 56,
  },
  {
    file: 'app-referral-toolbox.png',
    url: APP_HTML,
    before: `${hideAppPrototype}; switchRole('normal')`,
    selector: '.phone-shell section.px-4.pt-4',
    clipHeight: 160,
  },
  {
    file: 'app-referral-tier.png',
    url: APP_HTML,
    before: `${hideAppPrototype}; switchRole('normal')`,
    selector: '#normal-user-content section.px-4.mt-3:first-of-type',
    clipHeight: 280,
  },
  {
    file: 'app-referral-earnings.png',
    url: APP_HTML,
    before: `${hideAppPrototype}; switchRole('normal')`,
    selector: '#normal-user-content .bg-slate-900.rounded-2xl',
    clipHeight: 100,
  },
  {
    file: 'app-referral-stats-entry.png',
    url: APP_HTML,
    before: `${hideAppPrototype}; switchRole('normal')`,
    selector: '#normal-user-content a[href*="邀请好友明细"]',
    clipHeight: 140,
  },
  {
    file: 'app-referral-ambassador.png',
    url: APP_HTML,
    before: `${hideAppPrototype}; switchRole('normal')`,
    selector: '#normal-user-content section.px-4.mt-6',
    clipHeight: 100,
  },
  {
    file: 'app-referral-share-modal.png',
    url: APP_HTML,
    before: `${hideAppPrototype}; switchRole('normal'); openShare()`,
    selector: '#modal-share > .bg-white',
    clipHeight: 520,
  },
  {
    file: 'app-referral-info-modal.png',
    url: APP_HTML,
    before: `${hideAppPrototype}; switchRole('normal'); showInfo('pending')`,
    selector: '#info-modal .bg-white',
    clipHeight: 200,
  },
  // —— App 代理用户 ——
  {
    file: 'app-referral-agent-info.png',
    url: APP_HTML,
    before: `${hideAppPrototype}; switchRole('agent')`,
    selector: '#agent-info-box',
    clipHeight: 100,
  },
  {
    file: 'app-referral-agent-placeholder.png',
    url: APP_HTML,
    before: `${hideAppPrototype}; switchRole('agent')`,
    selector: '#agent-user-content .bg-slate-900.rounded-2xl',
    clipHeight: 100,
  },
  {
    file: 'app-referral-agent-stats-empty.png',
    url: APP_HTML,
    before: `${hideAppPrototype}; switchRole('agent')`,
    selector: '#agent-user-content .grid.grid-cols-2.divide-x',
    clipHeight: 120,
  },
  // —— App 直邀好友明细 ——
  {
    file: 'app-referral-friends-page.png',
    url: APP_FRIENDS_HTML,
    selector: '.phone-shell .screen',
    clipHeight: 720,
  },
  {
    file: 'app-referral-friends-search.png',
    url: APP_FRIENDS_HTML,
    selector: '.phone-shell .shrink-0.bg-white.px-5',
    clipHeight: 72,
  },
  {
    file: 'app-referral-friends-list.png',
    url: APP_FRIENDS_HTML,
    selector: '.phone-shell .divide-y.divide-gray-50',
    clipHeight: 360,
  },
  {
    file: 'app-referral-friends-sort-sheet.png',
    url: APP_FRIENDS_HTML,
    before: 'openSortSheet()',
    selector: '#sort-sheet .relative.w-full.bg-white',
    clipHeight: 320,
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
  const vp = shot.url === WEB_HTML ? { width: 1440, height: 900 } : { width: 520, height: 900 };
  await page.setViewport(vp);
  await page.goto(shot.url || WEB_HTML, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await new Promise((r) => setTimeout(r, 500));
  if (shot.before) {
    await page.evaluate(shot.before);
    await new Promise((r) => setTimeout(r, 450));
  }
  await capture(page, shot);
  await page.close();
}

await browser.close();
console.log('Done:', OUT);
