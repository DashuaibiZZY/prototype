import puppeteer from 'puppeteer-core';

const pageUrl = process.argv[2];
const selector = process.argv[3];
const outPath = process.argv[4];
const beforeScript = process.argv[5] || '';

if (!pageUrl || !selector || !outPath) {
  console.error('Usage: node screenshot-element.mjs <url> <selector> <outPath> [beforeEval]');
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const hashIdx = pageUrl.indexOf('#');
const fileUrl = hashIdx >= 0 ? pageUrl.slice(0, hashIdx) : pageUrl;
const hash = hashIdx >= 0 ? pageUrl.slice(hashIdx + 1) : '';
await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 90000 });
if (hash) {
  await page.evaluate((h) => { location.hash = h; }, hash);
  await new Promise((r) => setTimeout(r, 800));
}
if (beforeScript) {
  await page.evaluate(beforeScript);
  await new Promise((r) => setTimeout(r, 600));
}
const el = await page.$(selector);
if (!el) {
  console.error('Element not found:', selector);
  await browser.close();
  process.exit(1);
}
const box = await el.boundingBox();
await el.screenshot({ path: outPath, type: 'png' });
console.log(JSON.stringify({ ok: true, selector, outPath, box }));
await browser.close();
