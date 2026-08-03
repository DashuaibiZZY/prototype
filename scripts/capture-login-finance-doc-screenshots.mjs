import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'document/assets/登录充提-web');
const CHROME = '/usr/local/bin/google-chrome';
const HTML = 'file://' + path.join(ROOT, 'perp_dex/投资组合.html');

const loginWallet = `(() => {
  currentUser = {
    uid: '123456',
    loginMethod: 'wallet',
    address: WALLET_ADDRESS_DISPLAY,
    addressFull: WALLET_ADDRESS_FULL,
    gaBound: false,
  };
  updateUIAfterLogin();
})()`;

const loginEmail = `(() => {
  currentUser = {
    uid: '123456',
    loginMethod: 'email',
    email: 'user@forx.fi',
    privyAddress: PRIVY_WALLET_DISPLAY,
    privyAddressFull: PRIVY_WALLET_FULL,
    gaBound: false,
  };
  updateUIAfterLogin();
})()`;

const loginEmailGa = `(() => {
  currentUser = {
    uid: '123456',
    loginMethod: 'email',
    email: 'user@forx.fi',
    privyAddress: PRIVY_WALLET_DISPLAY,
    privyAddressFull: PRIVY_WALLET_FULL,
    gaBound: true,
  };
  updateUIAfterLogin();
})()`;

const showWalletDropdown = `(() => {
  const w = document.getElementById('user-account-wrapper');
  const dd = w?.querySelector('.absolute.top-full');
  if (dd) {
    dd.classList.remove('hidden');
    dd.style.display = 'block';
  }
})()`;

const shots = [
  {
    file: 'web-nav-connect-wallet.png',
    selector: '#btn-connect-wallet',
    clipHeight: 36,
  },
  {
    file: 'web-login-modal.png',
    before: 'openLoginModal()',
    selector: '#modal-login .bg-white',
    clipHeight: 620,
  },
  {
    file: 'web-login-email-code.png',
    before: `(() => {
      openLoginModal();
      document.getElementById('login-email-input').value = 'user@forx.fi';
      sendEmailCode();
    })()`,
    selector: '#modal-login .bg-white',
    clipHeight: 620,
  },
  {
    file: 'web-wallet-dropdown-wallet.png',
    before: `${loginWallet}; ${showWalletDropdown}`,
    selector: '#user-account-wrapper .absolute.top-full > div',
    clipHeight: 480,
  },
  {
    file: 'web-wallet-dropdown-email.png',
    before: `${loginEmail}; ${showWalletDropdown}`,
    selector: '#user-account-wrapper .absolute.top-full > div',
    clipHeight: 520,
  },
  {
    file: 'web-totp-not-set.png',
    before: `${loginEmail}; openTotpModal('not_set');`,
    selector: '#modal-totp .bg-white',
    clipHeight: 520,
  },
  {
    file: 'web-totp-setup-qr.png',
    before: `${loginEmail}; openTotpModal('setup_qr');`,
    selector: '#modal-totp .bg-white',
    clipHeight: 580,
  },
  {
    file: 'web-totp-setup-verify.png',
    before: `${loginEmail}; openTotpModal('setup_verify');`,
    selector: '#modal-totp .bg-white',
    clipHeight: 480,
  },
  {
    file: 'web-totp-bound.png',
    before: `${loginEmailGa}; openTotpModal('bound');`,
    selector: '#modal-totp .bg-white',
    clipHeight: 580,
  },
  {
    file: 'web-totp-modify.png',
    before: `${loginEmailGa}; openTotpModal('modify');`,
    selector: '#modal-totp .bg-white',
    clipHeight: 480,
  },
  {
    file: 'web-totp-remove.png',
    before: `${loginEmailGa}; openTotpModal('remove');`,
    selector: '#modal-totp .bg-white',
    clipHeight: 560,
  },
  {
    file: 'web-export-verify-email.png',
    before: `${loginEmail}; openExportWalletEntry();`,
    selector: '#modal-export-wallet .bg-white',
    clipHeight: 420,
  },
  {
    file: 'web-export-verify-totp.png',
    before: `${loginEmailGa}; openExportWalletEntry();`,
    selector: '#modal-export-wallet .bg-white',
    clipHeight: 400,
  },
  {
    file: 'web-export-wallet.png',
    before: `${loginEmailGa}; openExportWalletEntry(); updateExportWalletModal('export_main');`,
    selector: '#modal-export-wallet .bg-white',
    clipHeight: 520,
  },
  {
    file: 'web-transfer-modal.png',
    before: `${loginWallet}; openTransferModal();`,
    selector: '#transfer-modal .bg-white',
    clipHeight: 560,
  },
  {
    file: 'web-deposit-init.png',
    before: `${loginWallet}; openModal('deposit');`,
    selector: '#finance-modal .bn-modal',
    clipHeight: 420,
  },
  {
    file: 'web-deposit-wallet.png',
    before: `${loginWallet}; openModal('deposit'); updateModal('deposit_wallet');`,
    selector: '#finance-modal .bn-modal',
    clipHeight: 520,
  },
  {
    file: 'web-deposit-external.png',
    before: `${loginEmail}; openModal('deposit');`,
    selector: '#finance-modal .bn-modal',
    clipHeight: 580,
  },
  {
    file: 'web-withdraw-init.png',
    before: `${loginWallet}; openModal('withdraw');`,
    selector: '#finance-modal .bn-modal',
    clipHeight: 420,
  },
  {
    file: 'web-withdraw-wallet.png',
    before: `${loginWallet}; openModal('withdraw'); updateModal('withdraw_wallet');`,
    selector: '#finance-modal .bn-modal',
    clipHeight: 560,
  },
  {
    file: 'web-withdraw-external.png',
    before: `${loginEmail}; openModal('withdraw');`,
    selector: '#finance-modal .bn-modal',
    clipHeight: 560,
  },
  {
    file: 'web-withdraw-security.png',
    before: loginEmailGa + `; (() => {
      document.getElementById('withdraw-confirm-content').innerHTML =
        '<h3 class="font-black text-lg mb-4">安全验证</h3>' +
        '<div class="space-y-3">' +
        '<input type="text" placeholder="身份验证器动态码" class="w-full border p-2 rounded">' +
        '<div class="flex space-x-2">' +
        '<input type="text" placeholder="邮箱验证码" class="flex-1 border p-2 rounded">' +
        '<button class="px-4 bg-black text-white rounded text-sm">获取</button>' +
        '</div>' +
        '<button class="w-full py-2 bg-blue-600 text-white rounded">验证并确认提现</button>' +
        '</div>';
      document.getElementById('modal-withdraw-confirm').style.display = 'flex';
    })()`,
    selector: '#modal-withdraw-confirm .bg-white',
    clipHeight: 320,
  },
  {
    file: 'web-withdraw-confirm.png',
    before: `${loginEmail}; proceedWithdrawConfirm();`,
    selector: '#modal-withdraw-confirm .bg-white',
    clipHeight: 400,
  },
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

async function capture(page, shot) {
  const rect = await page.evaluate((selector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    el.scrollIntoView({ block: 'center', inline: 'nearest' });
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  }, shot.selector);

  if (!rect || rect.width <= 0 || rect.height <= 0) {
    console.error('MISSING', shot.file, shot.selector);
    return;
  }

  const outPath = path.join(OUT, shot.file);
  const height = shot.clipHeight ? Math.min(rect.height, shot.clipHeight) : rect.height;
  await page.screenshot({
    path: outPath,
    clip: { x: rect.x, y: rect.y, width: rect.width, height: height },
  });
  console.log('OK', shot.file);
}

for (const shot of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(HTML, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await new Promise((r) => setTimeout(r, 500));
  if (shot.before) {
    await page.evaluate(shot.before);
    await new Promise((r) => setTimeout(r, 450));
  }
  await capture(page, shot);
  await page.close();
}

await browser.close();
console.log('Done:', OUT);
