import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'document/assets/体验金');
const CHROME = '/usr/local/bin/google-chrome';

const shots = [
  // Admin
  {
    file: 'admin-config-list.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/admin/体验金后台.html'),
    hash: 'config',
    selector: '#page-config',
    viewport: { w: 1440, h: 900 },
    clipHeight: 520,
  },
  {
    file: 'admin-modal-new-config.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/admin/体验金后台.html'),
    hash: 'config',
    before: "openModal('modal-new-config')",
    selector: '#modal-new-config > div',
    viewport: { w: 1440, h: 900 },
  },
  {
    file: 'admin-issue-form.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/admin/体验金后台.html'),
    hash: 'issue',
    selector: '#page-issue .card',
    viewport: { w: 1440, h: 900 },
    clipHeight: 640,
  },
  {
    file: 'admin-modal-issue-approval.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/admin/体验金后台.html'),
    hash: 'issue',
    before:
      "(() => { document.getElementById('approvalGroupName').innerText='标准新人礼包组'; document.getElementById('approvalActivityName').innerText='新用户注册礼包'; document.getElementById('issueApprovalFlow').innerHTML=renderApprovalFlow('draft', true); openModal('modal-issue-approval'); })()",
    selector: '#modal-issue-approval > div',
    viewport: { w: 1440, h: 900 },
  },
  {
    file: 'admin-users-list.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/admin/体验金后台.html'),
    hash: 'users',
    selector: '#page-users',
    viewport: { w: 1440, h: 900 },
    clipHeight: 520,
  },
  {
    file: 'admin-user-detail.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/admin/体验金后台.html'),
    hash: 'users',
    before: "showUserDetail('100234')",
    selector: '#page-user-detail',
    viewport: { w: 1440, h: 900 },
    clipHeight: 560,
  },
  {
    file: 'admin-modal-recycle-confirm.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/admin/体验金后台.html'),
    hash: 'users',
    before:
      "openRecycleConfirm('确认回收用户 <b>100234</b> 全部可用卡券（剩余 200 USDT）？', function () {})",
    selector: '#modal-recycle-confirm > div',
    viewport: { w: 1440, h: 900 },
  },
  {
    file: 'admin-approval-list.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/admin/体验金后台.html'),
    hash: 'approval',
    selector: '#trial-approval-root',
    viewport: { w: 1440, h: 900 },
    clipHeight: 480,
  },
  {
    file: 'admin-approval-detail.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/admin/体验金后台.html'),
    hash: 'approval-detail=APR20260727001',
    selector: '#trial-approval-root',
    viewport: { w: 1440, h: 900 },
    clipHeight: 640,
  },
  {
    file: 'admin-logs.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/admin/体验金后台.html'),
    hash: 'logs',
    selector: '#page-logs',
    viewport: { w: 1440, h: 900 },
    clipHeight: 480,
  },
  // Web · 卡券中心
  {
    file: 'web-coupon-header.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/卡券中心.html'),
    selector: 'main > div > div.flex.flex-col',
    viewport: { w: 1440, h: 900 },
    clipHeight: 120,
  },
  {
    file: 'web-coupon-grid.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/卡券中心.html'),
    selector: 'div.grid.grid-cols-1',
    viewport: { w: 1440, h: 900 },
    clipHeight: 720,
  },
  {
    file: 'web-float-loss-hint.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/卡券中心.html'),
    before:
      "(() => { const t = document.querySelector('.coupon-card .group.relative .absolute'); if (t) { t.classList.remove('hidden'); t.style.display='block'; t.style.opacity='1'; } })()",
    selector: '.coupon-card .group.relative .absolute',
    viewport: { w: 1440, h: 900 },
  },
  {
    file: 'web-float-fee-hint.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/卡券中心.html'),
    before:
      "(() => { const t = document.querySelectorAll('.coupon-card .group.relative .absolute')[1]; if (t) { t.id='capture-fee-hint'; t.classList.remove('hidden'); t.style.display='block'; t.style.opacity='1'; } })()",
    selector: '#capture-fee-hint',
    viewport: { w: 1440, h: 900 },
  },
  {
    file: 'web-coupon-tips.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/卡券中心.html'),
    selector: 'main > div > div.bg-gray-50',
    viewport: { w: 1440, h: 900 },
  },
  {
    file: 'web-modal-transfer-trial-confirm.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/合约交易.html'),
    before: "openTransferTrialConfirm()",
    selector: '#modal-transfer-trial-confirm > div',
    viewport: { w: 1440, h: 900 },
  },
  {
    file: 'web-coupon-status-tabs.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/卡券中心.html'),
    selector: 'main .flex.space-x-6.text-\\[11px\\]',
    viewport: { w: 1440, h: 900 },
    clipHeight: 40,
  },
  // App · 卡券中心
  {
    file: 'app-coupon-overview.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/app/卡券中心.html'),
    selector: 'div.px-5.py-4.bg-white.border-b',
    viewport: { w: 420, h: 900 },
  },
  {
    file: 'app-coupon-available.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/app/卡券中心.html'),
    before: "switchStatus('available')",
    selector: '#view-available',
    viewport: { w: 420, h: 900 },
    clipHeight: 480,
  },
  {
    file: 'app-coupon-used.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/app/卡券中心.html'),
    before: "switchStatus('used')",
    selector: '#view-used',
    viewport: { w: 420, h: 900 },
  },
  {
    file: 'app-coupon-expired.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/app/卡券中心.html'),
    before: "switchStatus('expired')",
    selector: '#view-expired',
    viewport: { w: 420, h: 900 },
  },
  {
    file: 'app-coupon-invalid.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/app/卡券中心.html'),
    before: "switchStatus('invalid')",
    selector: '#view-invalid',
    viewport: { w: 420, h: 900 },
  },
  {
    file: 'app-coupon-empty.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/app/卡券中心.html'),
    before: "demoState('empty')",
    selector: '#view-empty',
    viewport: { w: 420, h: 900 },
  },
  {
    file: 'app-coupon-error.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/app/卡券中心.html'),
    before: "demoState('error')",
    selector: '#view-error',
    viewport: { w: 420, h: 900 },
  },
  {
    file: 'app-sheet-rules.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/app/卡券中心.html'),
    before: "toggleRules(true)",
    selector: '#modal-rules .absolute.bottom-0',
    viewport: { w: 420, h: 900 },
    clipHeight: 520,
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
  const vp = shot.viewport || { w: 1440, h: 900 };
  await page.setViewport({ width: vp.w, height: vp.h });
  const targetUrl = shot.hash ? shot.url + '#' + shot.hash : shot.url;
  await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 120000 });
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
        clip: { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, shot.clipHeight) },
      });
    } else await el.screenshot({ path: outPath, type: 'png' });
  } else await el.screenshot({ path: outPath, type: 'png' });
  console.log('OK', shot.file);
  await page.close();
}

await browser.close();
console.log('Done:', OUT);
