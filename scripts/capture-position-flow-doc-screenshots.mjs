import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'document/assets/持仓流水');
const CHROME = '/usr/local/bin/google-chrome';
const CONTRACT_HTML = 'file://' + path.join(ROOT, 'perp_dex/合约交易.html');
const PORTFOLIO_HTML = 'file://' + path.join(ROOT, 'perp_dex/投资组合.html');

const scrollDataModule = `(() => {
  const root = document.getElementById('tab-data-pos')?.closest('.flex-1.flex.overflow-hidden');
  if (root) root.scrollIntoView({ block: 'start' });
})()`;

const shots = [
  // —— 整体布局 / 主标签 / 各数据视图 ——
  {
    file: 'pos-flow-module-overview.png',
    before: `switchDataTab('pos'); ${scrollDataModule}`,
    selector: '#tab-data-pos',
    parentSection: 'data-module',
    clipHeight: 420,
  },
  {
    file: 'pos-flow-account-panel.png',
    before: `switchDataTab('pos'); ${scrollDataModule}`,
    selector: 'div.flex-1.flex.overflow-hidden > aside',
    clipHeight: 360,
  },
  {
    file: 'pos-flow-tab-pos.png',
    before: `switchDataTab('pos'); ${scrollDataModule}`,
    selector: '#tab-data-pos',
    parentSection: 'data-left',
    clipHeight: 360,
  },
  {
    file: 'pos-flow-tab-order-base.png',
    before: `switchDataTab('order'); switchOrderSubTab('base'); ${scrollDataModule}`,
    selector: '#tab-data-order',
    parentSection: 'data-left',
    clipHeight: 360,
  },
  {
    file: 'pos-flow-tab-order-tpsl.png',
    before: `switchDataTab('order'); switchOrderSubTab('tpsl'); ${scrollDataModule}`,
    selector: '#tab-data-order',
    parentSection: 'data-left',
    clipHeight: 360,
  },
  {
    file: 'pos-flow-tab-hist-order-base.png',
    before: `switchDataTab('hist-order'); switchOrderSubTab('base'); ${scrollDataModule}`,
    selector: '#tab-data-hist-order',
    parentSection: 'data-left',
    clipHeight: 400,
  },
  {
    file: 'pos-flow-tab-hist-order-tpsl.png',
    before: `switchDataTab('hist-order'); switchOrderSubTab('tpsl'); ${scrollDataModule}`,
    selector: '#tab-data-hist-order',
    parentSection: 'data-left',
    clipHeight: 400,
  },
  {
    file: 'pos-flow-tab-hist-trade.png',
    before: `switchDataTab('hist-trade'); ${scrollDataModule}`,
    selector: '#tab-data-hist-trade',
    parentSection: 'data-left',
    clipHeight: 360,
  },
  {
    file: 'pos-flow-tab-hist-pos.png',
    before: `switchDataTab('hist-pos'); ${scrollDataModule}`,
    selector: '#tab-data-hist-pos',
    parentSection: 'data-left',
    clipHeight: 360,
  },
  {
    file: 'pos-flow-tab-asset-log.png',
    before: `switchDataTab('asset-log'); ${scrollDataModule}`,
    selector: '#tab-data-asset-log',
    parentSection: 'data-left',
    clipHeight: 360,
  },
  {
    file: 'pos-flow-tab-funding-fee.png',
    before: `switchDataTab('funding-fee'); ${scrollDataModule}`,
    selector: '#tab-data-funding-fee',
    parentSection: 'data-left',
    clipHeight: 360,
  },
  {
    file: 'pos-flow-tab-deposit-withdraw.png',
    url: PORTFOLIO_HTML,
    before: `switchDataTab('deposit-withdraw'); ${scrollDataModule}`,
    selector: '#tab-data-deposit-withdraw',
    parentSection: 'data-left',
    clipHeight: 360,
  },
  // —— 浮窗 ——
  {
    file: 'pos-flow-float-realized-pnl.png',
    before: `switchDataTab('pos'); ${scrollDataModule}; (() => {
      const w = document.querySelector('#data-body .realized-pnl-wrap');
      const t = w?.querySelector('.realized-pnl-tip');
      if (t) { t.style.opacity='1'; t.style.visibility='visible'; }
    })()`,
    selector: '#data-body .realized-pnl-tip',
  },
  {
    file: 'pos-flow-float-close-qty-pct.png',
    before: `switchDataTab('pos'); ${scrollDataModule}; (() => {
      const popup = document.querySelector('#close-qty-input')?.closest('.group')?.querySelector('.absolute.bottom-full');
      if (popup) { popup.classList.remove('hidden'); popup.classList.add('flex'); }
    })()`,
    selector: '#close-qty-input',
    parentSection: 'close-qty-group',
    clipHeight: 80,
  },
  {
    file: 'pos-flow-float-date-picker.png',
    before: `switchDataTab('hist-order'); ${scrollDataModule}; toggleDatePicker('hist-order-date-picker')`,
    selector: '#hist-order-date-picker',
  },
  {
    file: 'pos-flow-float-status-multiselect.png',
    before: `switchDataTab('hist-order'); ${scrollDataModule}; toggleMultiSelect('hist-order-status-dropdown')`,
    selector: '#hist-order-status-dropdown',
  },
  // —— 弹窗 ——
  {
    file: 'pos-flow-modal-share.png',
    before: `switchDataTab('pos'); document.getElementById('modal-share-pnl').style.display='flex'`,
    selector: '#modal-share-pnl > div',
  },
  {
    file: 'pos-flow-modal-close-confirm.png',
    before: `switchDataTab('pos'); openOrderConfirm('close-long-market')`,
    selector: '#modal-order-confirm > div.bg-white',
  },
  {
    file: 'pos-flow-modal-close-all.png',
    before: `switchDataTab('pos'); openCloseAllConfirm()`,
    selector: '#modal-close-all > div.bg-white',
  },
  {
    file: 'pos-flow-modal-cancel-order.png',
    before: `switchDataTab('order'); openCancelConfirm('OR_882910')`,
    selector: '#modal-cancel-order > div.bg-white',
  },
  {
    file: 'pos-flow-modal-cancel-all.png',
    before: `switchDataTab('order'); openCancelAllConfirm()`,
    selector: '#modal-cancel-all > div.bg-white',
  },
  {
    file: 'pos-flow-modal-unit-switch.png',
    before: `switchDataTab('pos'); document.getElementById('modal-unit-switch').style.display='flex'`,
    selector: '#modal-unit-switch > .bn-modal',
  },
  {
    file: 'pos-flow-modal-order-tpsl.png',
    before: `switchDataTab('order'); document.getElementById('modal-order-tpsl').style.display='flex'`,
    selector: '#modal-order-tpsl > div',
  },
  {
    file: 'pos-flow-modal-position-tpsl.png',
    before: `switchDataTab('pos'); document.getElementById('modal-tpsl').style.display='flex'`,
    selector: '#modal-tpsl > div',
  },
];

function resolveParent(el, kind) {
  if (kind === 'data-module') {
    return el.closest('.flex-1.flex.overflow-hidden');
  }
  if (kind === 'data-left') {
    return el.closest('.flex-1.flex.flex-col.border-r');
  }
  if (kind === 'close-qty-group') {
    return el.closest('.group');
  }
  return el.parentElement;
}

fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

for (const shot of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200 });
  await page.goto(shot.url || CONTRACT_HTML, { waitUntil: 'networkidle0', timeout: 120000 });
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
  if (shot.parentSection && el) {
    const section = await el.evaluateHandle((n, kind) => {
      if (kind === 'data-module') return n.closest('.flex-1.flex.overflow-hidden');
      if (kind === 'data-left') return n.closest('.flex-1.flex.flex-col.border-r');
      if (kind === 'close-qty-group') return n.closest('.group');
      return n.parentElement;
    }, shot.parentSection);
    if (section?.asElement()) el = section.asElement();
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
        clip: {
          x: box.x,
          y: box.y,
          width: box.width,
          height: Math.min(box.height, shot.clipHeight),
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
