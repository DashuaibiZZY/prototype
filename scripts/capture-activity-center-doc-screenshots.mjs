import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_WEB = path.join(ROOT, 'document/assets/活动中心-web');
const OUT_APP = path.join(ROOT, 'document/assets/活动中心-app');
const CHROME = '/usr/local/bin/google-chrome';
const WEB_HTML = 'file://' + path.join(ROOT, 'perp_dex/活动中心.html');
const APP_HTML = 'file://' + path.join(ROOT, 'perp_dex/app/活动中心.html');

const shots = [
  {
    file: 'web-activity-my-entry.png',
    out: OUT_WEB,
    url: WEB_HTML,
    before: 'goToMyActivity(false)',
    selector: '#myActivityPage .page-head-row',
    viewport: { w: 1440, h: 900 },
    clipHeight: 120,
  },
  {
    file: 'web-activity-reward-modal.png',
    out: OUT_WEB,
    url: WEB_HTML,
    before: 'openMyRewardsModal()',
    selector: '#rewardDetailModal .modal-detail-content',
    viewport: { w: 1440, h: 900 },
  },
  {
    file: 'app-activity-my-activities.png',
    out: OUT_APP,
    url: APP_HTML,
    before: "showView('myActivities')",
    selector: '#myActivitiesView',
    viewport: { w: 420, h: 900 },
    mobile: true,
    clipHeight: 520,
  },
  {
    file: 'app-activity-rewards-list.png',
    out: OUT_APP,
    url: APP_HTML,
    before: "showView('myRewards')",
    selector: '#myRewardsView',
    viewport: { w: 420, h: 900 },
    mobile: true,
    clipHeight: 640,
  },
];

fs.mkdirSync(OUT_WEB, { recursive: true });
fs.mkdirSync(OUT_APP, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

for (const shot of shots) {
  const page = await browser.newPage();
  const vp = shot.viewport || { w: 1440, h: 900 };
  await page.setViewport({ width: vp.w, height: vp.h, isMobile: shot.mobile || false });
  await page.goto(shot.url, { waitUntil: 'networkidle0', timeout: 120000 });
  await new Promise((r) => setTimeout(r, 800));
  if (shot.before) {
    await page.evaluate(shot.before);
    await new Promise((r) => setTimeout(r, 700));
  }
  let el = await page.$(shot.selector);
  if (!el) {
    console.error('MISSING', shot.file, shot.selector);
    await page.close();
    continue;
  }
  await el.evaluate((n) => n.scrollIntoView({ block: 'center' }));
  const outPath = path.join(shot.out, shot.file);
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
    await el.screenshot({ path: outPath, type: 'png' });
  }
  console.log('OK', shot.file);
  await page.close();
}

await browser.close();
console.log('Done:', OUT_WEB, OUT_APP);
