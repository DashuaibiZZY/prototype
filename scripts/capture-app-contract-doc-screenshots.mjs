import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'document/assets/合约交易-app');
const CHROME = '/usr/local/bin/google-chrome';
const HTML = 'file://' + path.join(ROOT, 'perp_dex/app/合约交易.html');

const shots = [
  { file: 'app-contract-header.png', selector: 'header.pt-12', clipHeight: 56 },
  {
    file: 'app-contract-trade-area.png',
    selector: 'div.flex.px-4.py-3.space-x-4',
    clipHeight: 380,
  },
  { file: 'app-contract-positions.png', selector: '#positions-card' },
  { file: 'app-contract-sheet-pair.png', before: "openSheet('pair-sheet')", selector: '#pair-sheet .app-sheet' },
  { file: 'app-contract-sheet-leverage.png', before: "openSheet('leverage-sheet')", selector: '#leverage-sheet .app-sheet', clipHeight: 520 },
  { file: 'app-contract-sheet-margin.png', before: "openSheet('margin-sheet')", selector: '#margin-sheet .app-sheet' },
  { file: 'app-contract-sheet-order-type.png', before: "openSheet('order-type-sheet')", selector: '#order-type-sheet .app-sheet' },
  { file: 'app-contract-sheet-funding.png', before: "openSheet('funding-sheet')", selector: '#funding-sheet .app-sheet' },
  { file: 'app-contract-sheet-more-menu.png', before: "openSheet('more-menu-sheet')", selector: '#more-menu-sheet .app-sheet' },
  { file: 'app-contract-sheet-precision.png', before: "openSheet('precision-sheet')", selector: '#precision-sheet .app-sheet' },
  { file: 'app-contract-sheet-best-price.png', before: "openSheet('best-price-sheet')", selector: '#best-price-sheet .app-sheet' },
  {
    file: 'app-contract-sheet-realized-pnl.png',
    before: 'openRealizedPnlSheet(REALIZED_PNL_BREAKDOWN.pos)',
    selector: '#realized-pnl-sheet .app-sheet',
  },
  {
    file: 'app-contract-sheet-position-tpsl.png',
    before: 'openPositionTPSLSheet()',
    selector: '#position-tpsl-sheet .app-sheet',
    clipHeight: 520,
  },
  {
    file: 'app-contract-sheet-close-position.png',
    before: 'openClosePositionSheet()',
    selector: '#close-position-sheet .app-sheet',
  },
  {
    file: 'app-contract-modal-order-confirm.png',
    before: "openOrderConfirm('long')",
    selector: '#order-confirm-modal > div.relative',
  },
  {
    file: 'app-contract-modal-close-all.png',
    before: "openModal('close-all-modal')",
    selector: '#close-all-modal > div.relative',
  },
  {
    file: 'app-contract-modal-tpsl-confirm.png',
    before: 'openPositionTPSLConfirm()',
    selector: '#position-tpsl-confirm-modal > div.relative',
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
  await page.setViewport({ width: 420, height: 900 });
  await page.goto(HTML, { waitUntil: 'networkidle0', timeout: 120000 });
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
