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
