import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CHROME = '/usr/local/bin/google-chrome';
const url = 'file://' + path.join(ROOT, 'perp_dex/合约交易.html');
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 900 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
await page.evaluate(() => {
  const root = document.getElementById('tab-data-pos')?.closest('.flex-1.flex.overflow-hidden');
  if (root) root.scrollIntoView({ block: 'start' });
  switchDataTab('hist-pos');
});
await new Promise((r) => setTimeout(r, 800));
const el = await page.$('[id="tab-data-hist-pos"]');
const box = await el.boundingBox();
const out = path.join(ROOT, 'document/assets/持仓流水/pos-flow-tab-hist-pos.png');
fs.mkdirSync(path.dirname(out), { recursive: true });
if (box) {
  await page.screenshot({
    path: out,
    clip: { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 360) },
  });
}
await browser.close();
console.log('OK pos-flow-tab-hist-pos.png');
