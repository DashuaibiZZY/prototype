import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'document/assets/积分');
const CHROME = '/usr/local/bin/google-chrome';

const shots = [
  // Admin
  { file: 'admin-config-pool.png', url: 'file://' + path.join(ROOT, 'perp_dex/admin/积分后台.html'), hash: 'config', selector: '#weeklyPoolInput', viewport: { w: 1440, h: 900 }, parentCard: true },
  { file: 'admin-config-dimensions.png', url: 'file://' + path.join(ROOT, 'perp_dex/admin/积分后台.html'), hash: 'config', selector: '#page-config > .card:nth-of-type(2)', viewport: { w: 1440, h: 900 } },
  { file: 'admin-config-level-bonus.png', url: 'file://' + path.join(ROOT, 'perp_dex/admin/积分后台.html'), hash: 'config', selector: '#page-config > .card:nth-of-type(3)', viewport: { w: 1440, h: 900 } },
  { file: 'admin-config-newbie-tasks.png', url: 'file://' + path.join(ROOT, 'perp_dex/admin/积分后台.html'), hash: 'config', selector: '#page-config > .card:nth-of-type(4)', viewport: { w: 1440, h: 900 } },
  { file: 'admin-bonus-config.png', url: 'file://' + path.join(ROOT, 'perp_dex/admin/积分后台.html'), hash: 'bonus', selector: '#page-bonus .card', viewport: { w: 1440, h: 900 } },
  { file: 'admin-users-list.png', url: 'file://' + path.join(ROOT, 'perp_dex/admin/积分后台.html'), hash: 'users', selector: '#page-users', viewport: { w: 1440, h: 900 }, clipHeight: 520 },
  { file: 'admin-user-detail.png', url: 'file://' + path.join(ROOT, 'perp_dex/admin/积分后台.html'), hash: 'users', before: "showPointsUserDetail('200112')", selector: '#page-user-detail', viewport: { w: 1440, h: 900 }, clipHeight: 520 },
  { file: 'admin-manual-grant.png', url: 'file://' + path.join(ROOT, 'perp_dex/admin/积分后台.html'), hash: 'manual', selector: '#page-manual .card', viewport: { w: 1440, h: 900 } },
  { file: 'admin-approval-list.png', url: 'file://' + path.join(ROOT, 'perp_dex/admin/积分后台.html'), hash: 'approval', selector: '#points-approval-root', viewport: { w: 1440, h: 900 }, clipHeight: 480 },
  { file: 'admin-approval-detail.png', url: 'file://' + path.join(ROOT, 'perp_dex/admin/积分后台.html'), hash: 'approval-detail=APR20260727011', selector: '#points-approval-root', viewport: { w: 1440, h: 900 }, clipHeight: 640 },
  { file: 'admin-operation-logs.png', url: 'file://' + path.join(ROOT, 'perp_dex/admin/积分后台.html'), hash: 'logs', selector: '#page-logs', viewport: { w: 1440, h: 900 }, clipHeight: 480 },
  // Web
  { file: 'web-points-dashboard.png', url: 'file://' + path.join(ROOT, 'perp_dex/积分.html'), selector: 'div.stats-card.p-6', viewport: { w: 1440, h: 900 } },
  { file: 'web-points-detail-modal.png', url: 'file://' + path.join(ROOT, 'perp_dex/积分.html'), before: "toggleModal('modal-points-detail')", selector: '#modal-points-detail > div', viewport: { w: 1440, h: 900 } },
  { file: 'web-points-tasks.png', url: 'file://' + path.join(ROOT, 'perp_dex/积分.html'), selector: 'div.grid.grid-cols-1.lg\\:grid-cols-2', viewport: { w: 1440, h: 900 } },
  { file: 'web-points-faq.png', url: 'file://' + path.join(ROOT, 'perp_dex/积分.html'), selector: 'main > div > div.space-y-6:last-child', viewport: { w: 1440, h: 900 } },
  { file: 'web-multiplier-rules-modal.png', url: 'file://' + path.join(ROOT, 'perp_dex/积分.html'), before: "toggleModal('modal-multiplier-rules')", selector: '#modal-multiplier-rules > div', viewport: { w: 1440, h: 900 } },
  // App points
  { file: 'app-points-dashboard.png', url: 'file://' + path.join(ROOT, 'perp_dex/app/积分.html'), selector: '.points-card-bg', viewport: { w: 420, h: 900 }, mobile: true },
  { file: 'app-points-tasks.png', url: 'file://' + path.join(ROOT, 'perp_dex/app/积分.html'), selector: 'section.px-5.py-8.space-y-6', viewport: { w: 420, h: 900 }, mobile: true, clipHeight: 520 },
  { file: 'app-points-faq.png', url: 'file://' + path.join(ROOT, 'perp_dex/app/积分.html'), selector: 'section.px-5.py-8.space-y-4.mb-20', viewport: { w: 420, h: 900 }, mobile: true },
  { file: 'app-multiplier-rules-modal.png', url: 'file://' + path.join(ROOT, 'perp_dex/app/积分.html'), before: "toggleModal('modal-multiplier-rules')", selector: '#modal-multiplier-rules > div', viewport: { w: 420, h: 900 }, mobile: true },
  // App history
  { file: 'app-points-history.png', url: 'file://' + path.join(ROOT, 'perp_dex/app/积分发放记录.html'), selector: '.screen', viewport: { w: 420, h: 900 }, mobile: true },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

for (const shot of shots) {
  const page = await browser.newPage();
  const vp = shot.viewport || { w: 1440, h: 900 };
  await page.setViewport({ width: vp.w, height: vp.h });
  const targetUrl = shot.hash ? shot.url + '#' + shot.hash : shot.url;
  await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 120000 });
  await new Promise((r) => setTimeout(r, 800));
  if (shot.before) {
    await page.evaluate(shot.before);
    await new Promise((r) => setTimeout(r, 600));
  }
  let el = await page.$(shot.selector);
  if (shot.parentCard && el) {
    const cardHandle = await el.evaluateHandle((e) => e.closest('.card'));
    el = cardHandle.asElement();
  }
  if (!el && shot.selector.includes('\\')) {
    el = await page.evaluateHandle((sel) => document.querySelector(sel.replace(/\\\\/g, '')), shot.selector);
    if (el && el.asElement()) el = el.asElement();
  }
  if (!el) {
    console.error('MISSING', shot.file, shot.selector);
    await page.close();
    continue;
  }
  await el.evaluate((node) => node.scrollIntoView({ block: 'center' }));
  await new Promise((r) => setTimeout(r, 200));
  const outPath = path.join(OUT_DIR, shot.file);
  if (shot.clipHeight) {
    const box = await el.boundingBox();
    if (box) {
      await page.screenshot({
        path: outPath,
        clip: { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, shot.clipHeight) },
      });
    } else {
      await el.screenshot({ path: outPath, type: 'png' });
    }
  } else {
    await el.screenshot({ path: outPath, type: 'png' });
  }
  console.log('OK', shot.file);
  await page.close();
}

await browser.close();
console.log('Done:', OUT_DIR);
