import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'document/assets/费率');
const CHROME = '/usr/local/bin/google-chrome';

const shots = [
  // Admin · 用户费率设置
  {
    file: 'admin-fee-settings-list.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/admin/用户费率设置.html'),
    selector: '#page-fee-settings',
    viewport: { w: 1440, h: 900 },
    clipHeight: 520,
  },
  {
    file: 'admin-fee-config-drawer.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/admin/用户费率设置.html'),
    before: "openDrawer('10028471')",
    selector: '#configDrawer',
    viewport: { w: 1440, h: 900 },
  },
  {
    file: 'admin-fee-approval-list.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/admin/用户费率设置.html'),
    hash: 'approval',
    selector: '#fee-approval-root',
    viewport: { w: 1440, h: 900 },
    clipHeight: 480,
  },
  {
    file: 'admin-fee-approval-detail.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/admin/用户费率设置.html'),
    hash: 'approval-detail=APR20260727021',
    selector: '#fee-approval-root',
    viewport: { w: 1440, h: 900 },
    clipHeight: 640,
  },
  // Admin · 费率操作记录
  {
    file: 'admin-fee-operation-logs.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/admin/费率操作记录.html'),
    selector: 'section.card.overflow-hidden',
    viewport: { w: 1440, h: 900 },
    clipHeight: 480,
  },
  {
    file: 'admin-fee-submit-confirm.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/admin/用户费率设置.html'),
    before:
      "(() => { document.getElementById('confirmSummary').innerHTML='UID 10028471<br>配置等级：VIP 3<br>活动：VIP 大客户专属<br>有效期：90 天（到期日 24:00:00（UTC+8）失效）<br>价值证明：proof.png<br>备注：大客户专属费率'; document.getElementById('confirmApprovalFlow').innerHTML=renderApprovalFlow('draft', true); document.getElementById('confirmModal').classList.remove('hidden'); document.getElementById('confirmModal').classList.add('flex'); })()",
    selector: '#confirmModal > div',
    viewport: { w: 1440, h: 900 },
  },
  {
    file: 'admin-fee-revoke-confirm.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/admin/用户费率设置.html'),
    before: "openRevokeModal('10031592')",
    selector: '#revokeModal > div',
    viewport: { w: 1440, h: 900 },
  },
  // Web · 投资组合 VIP
  {
    file: 'web-vip-card.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/投资组合.html'),
    selector: 'div.xl\\:col-span-4 > div.bg-gradient-to-br',
    viewport: { w: 1440, h: 900 },
  },
  {
    file: 'web-vip-modal.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/投资组合.html'),
    before: 'openVipModal()',
    selector: '#vip-modal > div',
    viewport: { w: 1440, h: 900 },
  },
  // App · VIP 费率等级
  {
    file: 'app-vip-info-card.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/app/VIP费率等级.html'),
    selector: 'section.px-4.pt-4:first-of-type',
    viewport: { w: 420, h: 900 },
  },
  {
    file: 'app-vip-fee-table.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/app/VIP费率等级.html'),
    selector: '#feeTableSection',
    viewport: { w: 420, h: 900 },
  },
  {
    file: 'app-vip-faq.png',
    url: 'file://' + path.join(ROOT, 'perp_dex/app/VIP费率等级.html'),
    selector: '#faqSection',
    viewport: { w: 420, h: 900 },
  },
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
  if (!el && shot.selector.includes('\\')) {
    const handle = await page.evaluateHandle(
      (sel) => document.querySelector(sel.replace(/\\\\/g, '')),
      shot.selector,
    );
    if (handle && handle.asElement()) el = handle.asElement();
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
