import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'document/assets/交易流水-app');
const CHROME = '/usr/local/bin/google-chrome';
const FLOW_HTML = 'file://' + path.join(ROOT, 'perp_dex/app/交易流水頁面.html');
const DETAIL_HTML = 'file://' + path.join(ROOT, 'perp_dex/app/历史委托详情页.html');

const shots = [
  {
    file: 'app-flow-page.png',
    before: "switchPrimary('current'); switchSecondary('basic')",
    selector: '.phone-shell .screen',
    clipHeight: 720,
  },
  {
    file: 'app-flow-tab-current-basic.png',
    before: "switchPrimary('current'); switchSecondary('basic')",
    selector: '#list-container',
    clipHeight: 220,
  },
  {
    file: 'app-flow-tab-current-tpsl.png',
    before: "switchPrimary('current'); switchSecondary('tpsl')",
    selector: '#list-container',
    clipHeight: 260,
  },
  {
    file: 'app-flow-tab-hist-basic.png',
    before: "switchPrimary('history'); switchSecondary('basic')",
    selector: '#list-container',
    clipHeight: 420,
  },
  {
    file: 'app-flow-tab-hist-tpsl.png',
    before: "switchPrimary('history'); switchSecondary('tpsl')",
    selector: '#list-container',
    clipHeight: 320,
  },
  {
    file: 'app-flow-tab-position.png',
    before: "switchPrimary('position')",
    selector: '#list-container',
    clipHeight: 320,
  },
  {
    file: 'app-flow-tab-trades.png',
    before: "switchPrimary('trades')",
    selector: '#list-container',
    clipHeight: 280,
  },
  {
    file: 'app-flow-tab-logs.png',
    before: "switchPrimary('logs')",
    selector: '#list-container',
    clipHeight: 280,
  },
  {
    file: 'app-flow-tab-funding.png',
    before: "switchPrimary('funding')",
    selector: '#list-container',
    clipHeight: 160,
  },
  {
    file: 'app-flow-sheet-date.png',
    before: "openFilterModal('date')",
    selector: '#filter-sheet',
    clipHeight: 520,
  },
  {
    file: 'app-flow-sheet-contract.png',
    before: "switchPrimary('history'); switchSecondary('basic'); openFilterModal('contract')",
    selector: '#filter-sheet',
    clipHeight: 480,
  },
  {
    file: 'app-flow-sheet-order-type.png',
    before: "switchPrimary('history'); switchSecondary('basic'); openFilterModal('orderType')",
    selector: '#filter-sheet',
    clipHeight: 280,
  },
  {
    file: 'app-flow-sheet-status.png',
    before: "switchPrimary('history'); switchSecondary('basic'); openFilterModal('status')",
    selector: '#filter-sheet',
    clipHeight: 240,
  },
  {
    file: 'app-flow-sheet-direction.png',
    before: "switchPrimary('trades'); openFilterModal('direction')",
    selector: '#filter-sheet',
    clipHeight: 220,
  },
  {
    file: 'app-flow-sheet-pos-mode.png',
    before: "switchPrimary('position'); openFilterModal('posMode')",
    selector: '#filter-sheet',
    clipHeight: 220,
  },
  {
    file: 'app-flow-sheet-log-type.png',
    before: "switchPrimary('logs'); openFilterModal('logType')",
    selector: '#filter-sheet',
    clipHeight: 360,
  },
  {
    file: 'app-flow-sheet-cancel-type.png',
    before: "switchPrimary('current'); openCancelFlow()",
    selector: '#filter-sheet',
    clipHeight: 200,
  },
  {
    file: 'app-flow-sheet-cancel-confirm.png',
    before: "switchPrimary('current'); openCancelFlow(); selectCancelType('all')",
    selector: '#filter-sheet',
    clipHeight: 360,
  },
  {
    file: 'app-flow-modal-share.png',
    before: "switchPrimary('position'); openSharePnl()",
    selector: '#modal-share-pnl > div',
    clipHeight: 620,
  },
  {
    file: 'app-flow-sheet-realized-pnl.png',
    before: "switchPrimary('position'); openRealizedPnlSheet(REALIZED_PNL_BREAKDOWN.hist)",
    selector: '#realized-pnl-sheet .relative',
    clipHeight: 320,
  },
  {
    file: 'app-flow-detail-basic-filled.png',
    url: DETAIL_HTML,
    before: "updateView('basic_filled')",
    selector: '.phone-shell .screen',
    clipHeight: 720,
  },
  {
    file: 'app-flow-detail-basic-partial.png',
    url: DETAIL_HTML,
    before: "updateView('basic_partial')",
    selector: '.phone-shell .screen',
    clipHeight: 720,
  },
  {
    file: 'app-flow-detail-basic-cancelled.png',
    url: DETAIL_HTML,
    before: "updateView('basic_cancelled')",
    selector: '.phone-shell .screen',
    clipHeight: 720,
  },
  {
    file: 'app-flow-detail-basic-liquidated.png',
    url: DETAIL_HTML,
    before: "updateView('basic_liquidated')",
    selector: '.phone-shell .screen',
    clipHeight: 720,
  },
  {
    file: 'app-flow-detail-tpsl-completed.png',
    url: DETAIL_HTML,
    before: "updateView('tpsl_completed')",
    selector: '.phone-shell .screen',
    clipHeight: 720,
  },
  {
    file: 'app-flow-detail-tpsl-cancelled.png',
    url: DETAIL_HTML,
    before: "updateView('tpsl_cancelled')",
    selector: '.phone-shell .screen',
    clipHeight: 720,
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
  await page.setViewport({ width: 520, height: 900 });
  await page.goto(shot.url || FLOW_HTML, { waitUntil: 'networkidle0', timeout: 120000 });
  await new Promise((r) => setTimeout(r, 800));
  if (shot.before) {
    await page.evaluate(shot.before);
    await new Promise((r) => setTimeout(r, 700));
  }
  const el = await page.$(shot.selector);
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
  } else await el.screenshot({ path: outPath, type: 'png' });
  console.log('OK', shot.file);
  await page.close();
}

await browser.close();
console.log('Done:', OUT);
