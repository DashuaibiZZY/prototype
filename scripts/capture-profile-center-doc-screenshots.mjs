import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'document/assets/个人中心-app');
const CHROME = '/usr/local/bin/google-chrome';

const HUB = 'file://' + path.join(ROOT, 'perp_dex/app/个人中心.html');
const DETAIL = 'file://' + path.join(ROOT, 'perp_dex/app/个人资料.html');
const SETTINGS = 'file://' + path.join(ROOT, 'perp_dex/app/设置.html');
const TOTP = 'file://' + path.join(ROOT, 'perp_dex/app/身份验证器.html');

const hideProto = `document.querySelectorAll('.proto-controls').forEach(el => el.style.display = 'none');`;

const shots = [
  // 个人中心
  {
    file: 'app-profile-hub-wallet.png',
    url: HUB,
    before: hideProto,
    selector: '.phone-shell .screen',
    clipHeight: 720,
  },
  {
    file: 'app-profile-hub-email.png',
    url: HUB,
    before: `${hideProto} setLoginType('email');`,
    selector: '.phone-shell .screen',
    clipHeight: 720,
  },
  {
    file: 'app-profile-hub-header.png',
    url: HUB,
    before: hideProto,
    selector: '.phone-shell header',
    clipHeight: 56,
  },
  {
    file: 'app-profile-account-row.png',
    url: HUB,
    before: hideProto,
    selector: '#profile-link',
    clipHeight: 80,
  },
  {
    file: 'app-profile-quick-entry.png',
    url: HUB,
    before: `${hideProto} (() => {
      const t = [...document.querySelectorAll('.section-title')].find(el => el.textContent.includes('快捷入口'));
      if (t) t.scrollIntoView({ block: 'start' });
    })()`,
    selector: '.phone-shell .screen',
    clipHeight: 200,
    clipFromTitle: '快捷入口',
  },
  {
    file: 'app-profile-rewards-grid.png',
    url: HUB,
    before: `${hideProto} (() => {
      const t = [...document.querySelectorAll('.section-title')].find(el => el.textContent.includes('活动和奖励'));
      if (t) { t.scrollIntoView({ block: 'start' }); }
    })()`,
    selector: '.phone-shell .screen',
    clipHeight: 220,
    clipFromTitle: '活动和奖励',
  },
  {
    file: 'app-profile-more-grid.png',
    url: HUB,
    before: `${hideProto} (() => {
      const t = [...document.querySelectorAll('.section-title')].find(el => el.textContent.includes('更多'));
      if (t) t.scrollIntoView({ block: 'start' });
    })()`,
    selector: '.phone-shell .screen',
    clipHeight: 160,
    clipFromTitle: '更多',
  },

  // 个人资料
  {
    file: 'app-profile-detail-wallet.png',
    url: DETAIL,
    before: hideProto,
    selector: '.phone-shell .screen',
    clipHeight: 720,
  },
  {
    file: 'app-profile-detail-email.png',
    url: DETAIL,
    before: `${hideProto} setLoginType('email');`,
    selector: '.phone-shell .screen',
    clipHeight: 720,
  },
  {
    file: 'app-profile-detail-vip-card.png',
    url: DETAIL,
    before: hideProto,
    selector: '.vip-link .info-card',
    clipHeight: 160,
  },

  // 设置
  {
    file: 'app-settings-main-wallet.png',
    url: SETTINGS,
    before: hideProto,
    selector: '#page-main',
    clipHeight: 720,
  },
  {
    file: 'app-settings-main-email.png',
    url: SETTINGS,
    before: `${hideProto} setLoginType('email');`,
    selector: '#page-main',
    clipHeight: 720,
  },
  {
    file: 'app-settings-currency.png',
    url: SETTINGS,
    before: `${hideProto} openPage('page-currency');`,
    selector: '#page-currency',
    clipHeight: 720,
  },
  {
    file: 'app-settings-language.png',
    url: SETTINGS,
    before: `${hideProto} openPage('page-language');`,
    selector: '#page-language',
    clipHeight: 720,
  },
  {
    file: 'app-settings-theme.png',
    url: SETTINGS,
    before: `${hideProto} openPage('page-theme');`,
    selector: '#page-theme',
    clipHeight: 720,
  },
  {
    file: 'app-settings-about.png',
    url: SETTINGS,
    before: `${hideProto} openPage('page-about');`,
    selector: '#page-about',
    clipHeight: 720,
  },

  // 身份验证器
  {
    file: 'app-totp-not-set.png',
    url: TOTP,
    before: `${hideProto} showView('not-set');`,
    selector: '#view-not-set',
    clipHeight: 720,
  },
  {
    file: 'app-totp-setup-qr.png',
    url: TOTP,
    before: `${hideProto} showView('setup-qr');`,
    selector: '#view-setup-qr',
    clipHeight: 720,
  },
  {
    file: 'app-totp-setup-verify.png',
    url: TOTP,
    before: `${hideProto} showView('setup-verify');`,
    selector: '#view-setup-verify',
    clipHeight: 720,
  },
  {
    file: 'app-totp-bound.png',
    url: TOTP,
    before: `${hideProto} showView('bound');`,
    selector: '#view-bound',
    clipHeight: 720,
  },
  {
    file: 'app-totp-modify.png',
    url: TOTP,
    before: `${hideProto} showView('modify');`,
    selector: '#view-modify',
    clipHeight: 720,
  },
  {
    file: 'app-totp-remove.png',
    url: TOTP,
    before: `${hideProto} showView('remove');`,
    selector: '#view-remove',
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
  let rect;
  if (shot.clipFromTitle) {
    rect = await page.evaluate(
      (titleText, clipHeight) => {
        const t = [...document.querySelectorAll('.section-title')].find((el) =>
          el.textContent.includes(titleText)
        );
        const shell = document.querySelector('.phone-shell');
        if (!t || !shell) return null;
        const tr = t.getBoundingClientRect();
        const sr = shell.getBoundingClientRect();
        return {
          x: sr.x,
          y: tr.y,
          width: sr.width,
          height: Math.min(clipHeight, sr.height - (tr.y - sr.y)),
        };
      },
      shot.clipFromTitle,
      shot.clipHeight || 200
    );
  } else {
    rect = await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      el.scrollIntoView({ block: 'center', inline: 'nearest' });
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }, shot.selector);
  }

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
  await page.goto(shot.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
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
