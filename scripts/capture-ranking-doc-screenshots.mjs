import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'document/assets/排行榜');
const CHROME = '/usr/local/bin/google-chrome';
const WEB_HTML = 'file://' + path.join(ROOT, 'perp_dex/排行榜.html');
const ADMIN_HTML = 'file://' + path.join(ROOT, 'perp_dex/admin/排行榜后台.html');

const shots = [
  // —— Web 排行榜页 ——
  {
    file: 'web-ranking-nav.png',
    url: WEB_HTML,
    selector: 'nav',
    clipHeight: 40,
  },
  {
    file: 'web-ranking-more-menu.png',
    url: WEB_HTML,
    before: `(() => {
      const menu = document.querySelector('nav .relative.group.h-full .absolute.top-full');
      if (menu) { menu.classList.remove('hidden'); menu.style.display = 'block'; }
    })()`,
    selector: 'nav .relative.group.h-full .absolute.top-full > div',
  },
  {
    file: 'web-ranking-title-period.png',
    url: WEB_HTML,
    selector: 'main h1',
    parentSection: 'title-row',
    clipHeight: 48,
  },
  {
    file: 'web-ranking-my-summary.png',
    url: WEB_HTML,
    selector: 'main .bg-gray-50.px-4.py-2.border',
    clipHeight: 56,
  },
  {
    file: 'web-ranking-search.png',
    url: WEB_HTML,
    selector: 'main .relative.w-full.md\\:w-80',
    clipHeight: 40,
  },
  {
    file: 'web-ranking-table.png',
    url: WEB_HTML,
    selector: 'main .stats-card',
    clipHeight: 360,
  },
  {
    file: 'web-ranking-footer.png',
    url: WEB_HTML,
    selector: 'main .max-w-\\[1200px\\] > div:last-child',
    clipHeight: 48,
  },
  {
    file: 'web-ranking-page.png',
    url: WEB_HTML,
    selector: 'main .max-w-\\[1200px\\]',
    clipHeight: 720,
  },
  // —— 后台影子配置 ——
  {
    file: 'admin-ranking-header.png',
    url: ADMIN_HTML,
    selector: 'main > header',
    clipHeight: 64,
  },
  {
    file: 'admin-ranking-filters.png',
    url: ADMIN_HTML,
    selector: 'main section.bg-white.p-4.rounded-lg',
    clipHeight: 200,
  },
  {
    file: 'admin-ranking-filters-activity.png',
    url: ADMIN_HTML,
    before: `(() => {
      document.getElementById('filter-target-type').value = 'activity';
      onFilterTargetTypeChange();
    })()`,
    selector: 'main section.bg-white.p-4.rounded-lg',
    clipHeight: 200,
  },
  {
    file: 'admin-ranking-list.png',
    url: ADMIN_HTML,
    selector: 'main section.bg-white.rounded-lg.border.overflow-hidden',
    clipHeight: 320,
  },
  {
    file: 'admin-ranking-modal-platform.png',
    url: ADMIN_HTML,
    before: `(() => {
      openShadowModal();
      setModalTargetType('platform');
    })()`,
    selector: '#modal-edit-shadow > div',
  },
  {
    file: 'admin-ranking-modal-activity.png',
    url: ADMIN_HTML,
    before: `(() => {
      openShadowModal();
      setModalTargetType('activity');
      document.getElementById('modal-activity-select').value = 'act-001';
      setModalTargetType('activity');
    })()`,
    selector: '#modal-edit-shadow > div',
  },
  {
    file: 'admin-ranking-modal-edit.png',
    url: ADMIN_HTML,
    before: 'openShadowModal(2)',
    selector: '#modal-edit-shadow > div',
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
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(shot.url || WEB_HTML, { waitUntil: 'networkidle0', timeout: 120000 });
  await new Promise((r) => setTimeout(r, 900));
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
      if (kind === 'title-row') {
        return n.closest('.flex.items-center.justify-between') || n.parentElement;
      }
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
