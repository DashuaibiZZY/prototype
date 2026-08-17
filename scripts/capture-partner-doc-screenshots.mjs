import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'document/assets/合伙人');
const CHROME = '/usr/local/bin/google-chrome';
const ADMIN_HTML = 'file://' + path.join(ROOT, 'perp_dex/admin/代理中心后台.html');
const WEB_HTML = 'file://' + path.join(ROOT, 'perp_dex/代理中心.html');

const shots = [
  // —— 后台 · 合伙人管理 ——
  {
    file: 'admin-partner-list.png',
    url: ADMIN_HTML,
    hash: 'agent',
    selector: '#page-agent-mgmt',
    viewport: { w: 1440, h: 900 },
    clipHeight: 560,
  },
  {
    file: 'admin-modal-bind-partner.png',
    url: ADMIN_HTML,
    hash: 'agent',
    before: 'PartnerPortal.openBindModal()',
    selector: '#modal-bind-partner > div',
    viewport: { w: 1440, h: 900 },
  },
  {
    file: 'admin-partner-detail-normal.png',
    url: ADMIN_HTML,
    hash: 'partner-detail',
    before: 'PartnerPortal.showDetail("p_n1")',
    selector: '#page-partner-detail',
    viewport: { w: 1440, h: 900 },
    clipHeight: 720,
  },
  {
    file: 'admin-partner-detail-abnormal.png',
    url: ADMIN_HTML,
    hash: 'partner-detail',
    before: 'PartnerPortal.showDetail("p_a1")',
    selector: '#page-partner-detail',
    viewport: { w: 1440, h: 900 },
    clipHeight: 720,
  },
  {
    file: 'admin-modal-abnormal-list.png',
    url: ADMIN_HTML,
    hash: 'partner-detail',
    before: '(() => { PartnerPortal.showDetail("p_a1"); PartnerPortal.openAbnormalModal(); })()',
    selector: '#modal-abnormal-list > div',
    viewport: { w: 1440, h: 900 },
    clipHeight: 520,
  },
  {
    file: 'admin-modal-team-tree.png',
    url: ADMIN_HTML,
    hash: 'partner-detail',
    before: '(() => { PartnerPortal.showDetail("p_a1"); PartnerPortal.openDrillTeam("h_a2b"); PartnerPortal.openTeamTreeModal("h_a3"); })()',
    selector: '#modal-team-tree > div',
    viewport: { w: 1440, h: 900 },
    clipHeight: 560,
  },
  {
    file: 'admin-partner-drill.png',
    url: ADMIN_HTML,
    hash: 'partner-detail-drill',
    before: '(() => { PartnerPortal.showDetail("p_a1"); PartnerPortal.openDrillTeam("h_a2b"); PartnerPortal.openDrillTeam("h_a3"); })()',
    selector: '#page-partner-detail-drill',
    viewport: { w: 1440, h: 900 },
    clipHeight: 720,
  },
  // —— 后台 · 返佣关系树 ——
  {
    file: 'admin-rebate-tree.png',
    url: ADMIN_HTML,
    hash: 'rebate-tree',
    before: 'PartnerPortal.showTree("p_a1")',
    selector: '#page-rebate-tree',
    viewport: { w: 1440, h: 900 },
    clipHeight: 640,
  },
  {
    file: 'admin-modal-tree-confirm.png',
    url: ADMIN_HTML,
    hash: 'rebate-tree',
    before:
      '(() => { PartnerPortal.showTree("p_a1"); const el = document.getElementById("ratio-input-h_a2b"); if (el) { el.value = 82; PartnerPortal.stageRatioChange("h_a2b"); } PartnerPortal.openTreeConfirmModal(); })()',
    selector: '#modal-tree-confirm > div',
    viewport: { w: 1440, h: 900 },
    clipHeight: 560,
  },
  // —— 后台 · 迁移返佣关系 ——
  {
    file: 'admin-migrate-form.png',
    url: ADMIN_HTML,
    hash: 'migrate',
    selector: '#page-rebate-migrate section:first-of-type',
    viewport: { w: 1440, h: 900 },
    clipHeight: 360,
  },
  {
    file: 'admin-migrate-preview.png',
    url: ADMIN_HTML,
    hash: 'migrate',
    before:
      '(() => { document.getElementById("migrate-subject-input").value = "0xMig...Abn"; document.getElementById("migrate-target-input").value = "0xTo...L1"; document.getElementById("migrate-ratio-input").value = 58; PartnerPortal.previewMigrate(); })()',
    selector: '#migrate-preview-section',
    viewport: { w: 1440, h: 900 },
    clipHeight: 720,
  },
  {
    file: 'admin-modal-migrate-confirm.png',
    url: ADMIN_HTML,
    hash: 'migrate',
    before:
      '(() => { PartnerPortal.showMigratePage(); document.getElementById("migrate-subject-input").value = "0xPlain...U1"; document.getElementById("migrate-target-input").value = "0xTo...L1"; document.getElementById("migrate-ratio-input").value = 45; PartnerPortal.previewMigrate(); PartnerPortal.submitMigrate(); })()',
    selector: '#modal-migrate-confirm > div',
    viewport: { w: 1440, h: 900 },
  },
  // —— 后台 · 合伙人审核 ——
  {
    file: 'admin-approval-list.png',
    url: ADMIN_HTML,
    hash: 'approval',
    selector: '#partner-approval-root',
    viewport: { w: 1440, h: 900 },
    clipHeight: 520,
  },
  {
    file: 'admin-approval-detail-bind.png',
    url: ADMIN_HTML,
    hash: 'approval',
    before:
      '(() => { showApprovalPage(); moduleApprovalHandleHash("partner-approval-root", "approval-detail=APR20260801031", "approval", "approval-detail"); })()',
    selector: '#partner-approval-root',
    viewport: { w: 1440, h: 900 },
    clipHeight: 680,
  },
  {
    file: 'admin-approval-detail-ratio.png',
    url: ADMIN_HTML,
    hash: 'approval',
    before:
      '(() => { showApprovalPage(); moduleApprovalHandleHash("partner-approval-root", "approval-detail=APR20260804061", "approval", "approval-detail"); })()',
    selector: '#partner-approval-root',
    viewport: { w: 1440, h: 900 },
    clipHeight: 680,
  },
  {
    file: 'admin-approval-detail-migrate.png',
    url: ADMIN_HTML,
    hash: 'approval',
    before:
      '(() => { showApprovalPage(); moduleApprovalHandleHash("partner-approval-root", "approval-detail=APR20260811001", "approval", "approval-detail"); })()',
    selector: '#partner-approval-root',
    viewport: { w: 1440, h: 900 },
    clipHeight: 680,
  },
  // —— 后台 · 操作记录 / 佣金对账 ——
  {
    file: 'admin-logs.png',
    url: ADMIN_HTML,
    hash: 'logs',
    selector: '#page-partner-logs',
    viewport: { w: 1440, h: 900 },
    clipHeight: 480,
  },
  {
    file: 'admin-settlement-list.png',
    url: ADMIN_HTML,
    hash: 'settlement',
    selector: '#page-settlement',
    viewport: { w: 1440, h: 900 },
    clipHeight: 480,
  },
  {
    file: 'admin-settlement-detail.png',
    url: ADMIN_HTML,
    hash: 'settlement',
    before: 'PartnerPortal.showReviewDetail("2024-05-23", false)',
    selector: '#view-review-detail',
    viewport: { w: 1440, h: 900 },
    clipHeight: 640,
  },
  {
    file: 'admin-settlement-supplement-tab.png',
    url: ADMIN_HTML,
    hash: 'settlement',
    before:
      '(() => { PartnerPortal.showReviewDetail("2024-05-23", false); PartnerPortal.switchSettlementDetailTab("supplement"); })()',
    selector: '#view-review-detail',
    viewport: { w: 1440, h: 900 },
    clipHeight: 520,
  },
  {
    file: 'admin-modal-edit-actual.png',
    url: ADMIN_HTML,
    hash: 'settlement',
    before:
      '(() => { PartnerPortal.showReviewDetail("2024-05-23", false); PartnerPortal.openEditActual("sr1"); })()',
    selector: '#modal-edit-actual > div',
    viewport: { w: 1440, h: 900 },
  },
  {
    file: 'admin-modal-edit-supplement.png',
    url: ADMIN_HTML,
    hash: 'settlement',
    before:
      '(() => { PartnerPortal.showReviewDetail("2024-05-23", false); PartnerPortal.switchSettlementDetailTab("supplement"); PartnerPortal.openEditSupplement("sup1"); })()',
    selector: '#modal-edit-supplement > div',
    viewport: { w: 1440, h: 900 },
  },
  // —— Web · 合伙人中心 ——
  {
    file: 'web-links-page.png',
    url: WEB_HTML,
    before: 'showMainPage("page-links")',
    selector: '#page-links',
    viewport: { w: 1440, h: 900 },
    clipHeight: 720,
  },
  {
    file: 'web-links-share-modal.png',
    url: WEB_HTML,
    before: '(() => { showMainPage("page-links"); toggleModal("modal-share"); })()',
    selector: '#modal-share .modal-content, #modal-share > div',
    viewport: { w: 1440, h: 900 },
    clipHeight: 560,
  },
  {
    file: 'web-modal-referral-link.png',
    url: WEB_HTML,
    before: '(() => { showMainPage("page-links"); openReferralModal("create"); })()',
    selector: '#modal-referral-link .modal-content, #modal-referral-link > div',
    viewport: { w: 1440, h: 900 },
  },
  {
    file: 'web-overview.png',
    url: WEB_HTML,
    before: 'showMainPage("page-overview")',
    selector: '#page-overview',
    viewport: { w: 1440, h: 900 },
    clipHeight: 720,
  },
  {
    file: 'web-modal-add-agent.png',
    url: WEB_HTML,
    before: '(() => { showMainPage("page-overview"); toggleModal("modal-add-agent"); })()',
    selector: '#modal-add-agent .modal-content, #modal-add-agent > div',
    viewport: { w: 1440, h: 900 },
  },
  {
    file: 'web-modal-adjust-ratio.png',
    url: WEB_HTML,
    before: '(() => { showMainPage("page-overview"); PartnerCenter.openAdjustRatioModal("sp2"); })()',
    selector: '#modal-adjust-ratio .modal-content, #modal-adjust-ratio > div',
    viewport: { w: 1440, h: 900 },
  },
  {
    file: 'web-modal-team-tree.png',
    url: WEB_HTML,
    before: '(() => { showMainPage("page-overview"); PartnerCenter.openTeamTreeModal("sp2", false); })()',
    selector: '#modal-team-tree .modal-content, #modal-team-tree > div',
    viewport: { w: 1440, h: 900 },
    clipHeight: 560,
  },
  {
    file: 'web-drill-overview.png',
    url: WEB_HTML,
    before: '(() => { showMainPage("page-overview"); PartnerCenter.openDrillTeam("sp2"); })()',
    selector: '#page-drill-overview',
    viewport: { w: 1440, h: 900 },
    clipHeight: 720,
  },
  {
    file: 'web-settlement.png',
    url: WEB_HTML,
    before: 'showMainPage("page-settlement")',
    selector: '#page-settlement',
    viewport: { w: 1440, h: 900 },
    clipHeight: 720,
  },
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  protocolTimeout: 180000,
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
  if (!el && shot.selector.includes(',')) {
    for (const sel of shot.selector.split(',').map((s) => s.trim())) {
      el = await page.$(sel);
      if (el) break;
    }
  }
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
