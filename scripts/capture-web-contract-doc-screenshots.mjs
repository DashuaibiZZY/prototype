import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'document/assets/合约交易-web');
const CHROME = '/usr/local/bin/google-chrome';
const HTML = 'file://' + path.join(ROOT, 'perp_dex/合约交易.html');

const shots = [
  { file: 'web-contract-market-bar.png', selector: 'nav + div.h-12', clipHeight: 48 },
  {
    file: 'web-contract-settings-drawer.png',
    before: 'toggleSettingsDrawer()',
    selector: '#drawer-panel',
  },
  {
    file: 'web-contract-symbol-picker.png',
    before:
      "(() => { const t = document.querySelector('[onclick*=\"toggleMarketList\"]'); toggleMarketList({ stopPropagation: () => {}, currentTarget: t }); })()",
    selector: '#market-list-modal',
  },
  { file: 'web-contract-kline.png', selector: '#kline-state-normal', clipHeight: 360 },
  { file: 'web-contract-orderbook.png', selector: 'div.w-64.border-r.border-gray-100', clipHeight: 480 },
  { file: 'web-contract-terminal.png', selector: 'aside.w-\\[300px\\]', clipHeight: 520 },
  {
    file: 'web-contract-positions.png',
    selector: '#tab-data-pos',
    parentSection: true,
    clipHeight: 280,
  },
  {
    file: 'web-contract-modal-leverage.png',
    before: "document.getElementById('modal-leverage').style.display='flex'",
    selector: '#modal-leverage > .bn-modal',
  },
  {
    file: 'web-contract-modal-margin.png',
    before: "document.getElementById('modal-margin').style.display='flex'",
    selector: '#modal-margin > .bn-modal',
  },
  {
    file: 'web-contract-modal-order-confirm.png',
    before: "openOrderConfirm('long')",
    selector: '#modal-order-confirm > div.bg-white',
  },
  {
    file: 'web-contract-modal-tpsl.png',
    before: "document.getElementById('modal-tpsl').style.display='flex'",
    selector: '#modal-tpsl > div',
  },
  {
    file: 'web-contract-modal-tpsl-confirm.png',
    before: "document.getElementById('modal-tpsl-confirm').style.display='flex'",
    selector: '#modal-tpsl-confirm > div.bg-white',
  },
  {
    file: 'web-contract-modal-close-all.png',
    before: "document.getElementById('modal-close-all').style.display='flex'",
    selector: '#modal-close-all > div.bg-white',
  },
  // —— 浮窗 / 浮层 / Tooltip ——
  {
    file: 'web-float-mark-hint.png',
    before:
      "(() => { const t = document.querySelector('.market-hint-wrap .market-hint-tip'); if (t) { t.style.opacity='1'; t.style.visibility='visible'; } })()",
    selector: '.market-hint-wrap .market-hint-tip',
  },
  {
    file: 'web-float-index-hint.png',
    before:
      "(() => { const t = document.querySelector('div.flex.items-center.space-x-6 > div.flex.flex-col:nth-child(2) .market-hint-tip'); if (t) { t.style.opacity='1'; t.style.visibility='visible'; } })()",
    selector: 'div.flex.items-center.space-x-6 > div.flex.flex-col:nth-child(2) .market-hint-tip',
  },
  {
    file: 'web-float-funding-hint.png',
    before:
      "(() => { const t = document.getElementById('market-funding-hint-tip'); if (t) { t.style.opacity='1'; t.style.visibility='visible'; } })()",
    selector: '#market-funding-hint-tip',
  },
  {
    file: 'web-float-precision.png',
    before: "document.getElementById('precision-trigger').click()",
    selector: '#precision-dropdown',
  },
  {
    file: 'web-float-gtc.png',
    before: "toggleGtcDropdown({ stopPropagation: () => {} })",
    selector: '#gtc-dropdown',
  },
  {
    file: 'web-float-qty-unit.png',
    before: "toggleQtyUnitDropdown({ stopPropagation: () => {} })",
    selector: '#qty-unit-dropdown',
  },
  {
    file: 'web-float-best-price-select.png',
    before: 'toggleBestPriceMode()',
    selector: '#price-input-container',
  },
  {
    file: 'web-float-deposit.png',
    before: 'openDepositModal()',
    selector: 'body > div.fixed.inset-0 .bg-white.w-80',
  },
  {
    file: 'web-float-transfer.png',
    before: 'openTransferModal()',
    selector: '#transfer-modal > div',
  },
  {
    file: 'web-float-cancel-order.png',
    before: "switchDataTab('order'); openCancelConfirm('OR_882910')",
    selector: '#modal-cancel-order > div.bg-white',
  },
  {
    file: 'web-float-cancel-all-orders.png',
    before: "switchDataTab('order'); openCancelAllConfirm()",
    selector: '#modal-cancel-all > div.bg-white',
  },
  {
    file: 'web-float-share-pnl.png',
    before: "document.getElementById('modal-share-pnl').style.display='flex'",
    selector: '#modal-share-pnl > div',
  },
  {
    file: 'web-float-order-tpsl.png',
    before: "document.getElementById('modal-order-tpsl').style.display='flex'",
    selector: '#modal-order-tpsl > div',
  },
  {
    file: 'web-float-realized-pnl-tip.png',
    before:
      "(() => { const w = document.querySelector('#data-body .realized-pnl-wrap'); if (w) { w.dispatchEvent(new MouseEvent('mouseenter')); const t = w.querySelector('.realized-pnl-tip'); if (t) { t.style.opacity='1'; t.style.visibility='visible'; } } })()",
    selector: '#data-body .realized-pnl-tip',
  },
  // —— 局部功能区域（图表子视图 / 终端订单类型 / 账户区 / 状态栏）——
  { file: 'web-contract-depth-chart.png', before: "switchView('depth')", selector: '#view-depth', clipHeight: 360 },
  { file: 'web-contract-details.png', before: "switchView('details')", selector: '#view-details', clipHeight: 360 },
  { file: 'web-contract-funding-view.png', before: "switchView('funding')", selector: '#view-funding', clipHeight: 360 },
  {
    file: 'web-contract-trades.png',
    before: "switchAreaTab('ob', 'trades')",
    selector: '#ob-content-trades',
    clipHeight: 480,
  },
  {
    file: 'web-contract-terminal-limit.png',
    before: "(() => { switchOrderMode('limit'); setOrderQtyPct(25); })()",
    selector: 'aside.w-\\[300px\\]',
    clipHeight: 400,
  },
  {
    file: 'web-float-order-qty-pct.png',
    before: "(() => { switchOrderMode('limit'); setOrderQtyPct(50); })()",
    selector: '.pos-close-slider-wrap--order',
    clipExpand: { top: 44 },
  },
  {
    file: 'web-contract-terminal-market.png',
    before: "switchOrderMode('market')",
    selector: 'aside.w-\\[300px\\]',
    clipHeight: 400,
  },
  {
    file: 'web-contract-terminal-tpsl.png',
    before: "switchOrderMode('profit-loss')",
    selector: 'aside.w-\\[300px\\]',
    clipHeight: 480,
  },
  {
    file: 'web-contract-terminal-stats.png',
    before: "switchOrderMode('limit')",
    selector: 'aside.w-\\[300px\\] .border-t.border-gray-50.pt-2',
    clipHeight: 120,
  },
  {
    file: 'web-contract-attach-tpsl.png',
    before:
      "(() => { switchOrderMode('limit'); const cb = document.getElementById('check-tpsl'); if (cb) { cb.checked = true; toggleTPSL(); } })()",
    selector: '#tpsl-section',
    clipHeight: 220,
  },
  {
    file: 'web-contract-account-assets.png',
    before:
      "(() => { const el = document.querySelector('div.flex-1.flex.overflow-hidden > aside'); if (el) el.scrollIntoView({ block: 'center' }); })()",
    selector: 'div.flex-1.flex.overflow-hidden > aside',
    clipHeight: 360,
  },
  {
    file: 'web-contract-status-bar.png',
    selector: 'div.fixed.bottom-0.left-0.w-full.h-7',
    clipHeight: 28,
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
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(HTML, { waitUntil: 'networkidle0', timeout: 120000 });
  await new Promise((r) => setTimeout(r, 800));
  if (shot.before) {
    try {
      await page.evaluate(shot.before);
    } catch (err) {
      console.error('BEFORE_FAIL', shot.file, err.message);
    }
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
  if (shot.parentSection && el) {
    const section = await el.evaluateHandle((n) =>
      n.closest('.flex-1.flex.flex-col.border-r') || n.parentElement?.parentElement,
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
  if (shot.clipHeight || shot.clipExpand) {
    const box = await el.boundingBox();
    if (box) {
      const expandTop = shot.clipExpand?.top || 0;
      const expandBottom = shot.clipExpand?.bottom || 0;
      await page.screenshot({
        path: outPath,
        clip: {
          x: box.x,
          y: Math.max(0, box.y - expandTop),
          width: box.width,
          height: shot.clipHeight
            ? Math.min(box.height + expandTop + expandBottom, shot.clipHeight)
            : box.height + expandTop + expandBottom,
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
