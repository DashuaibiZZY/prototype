import fs from 'fs';
import path from 'path';
import { screenshotLine, prototypeLine } from './doc-screenshot-constants.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const W = '合约交易-web';
const A = '合约交易-app';

function insertAfter(content, anchor, block) {
  const marker = block
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  if (marker && content.includes(marker)) return content;
  const idx = content.indexOf(anchor);
  if (idx === -1) {
    console.warn('anchor not found:', anchor);
    return content;
  }
  const end = idx + anchor.length;
  return content.slice(0, end) + block + content.slice(end);
}

function patchWeb(s) {
  const intro =
    '\n\n' +
    prototypeLine('perp_dex/合约交易.html') +
    '\n';
  s = insertAfter(s, '# 合约交易页', intro);

  const blocks = [
    [
      '## 1\\.1 偏好设置抽屉',
      '\n\n' + screenshotLine('Web · 偏好设置抽屉', W, 'web-contract-settings-drawer.png') + '\n',
    ],
    [
      '## 2\\.2 当前交易对基础信息展示',
      '\n\n' + screenshotLine('Web · 市场信息栏', W, 'web-contract-market-bar.png') + '\n',
    ],
    [
      '## 2\\.3 交易对切换浮窗',
      '\n\n' + screenshotLine('Web · 交易对切换浮窗', W, 'web-contract-symbol-picker.png') + '\n',
    ],
    [
      '## 3\\.1 功能概述',
      '\n\n' + screenshotLine('Web · K 线图区域', W, 'web-contract-kline.png') + '\n',
    ],
    [
      '## 4\\.3 订单簿视图',
      '\n\n' + screenshotLine('Web · 订单簿', W, 'web-contract-orderbook.png') + '\n',
    ],
    [
      '## 5\\.1 功能概述',
      '\n\n' + screenshotLine('Web · 交易终端', W, 'web-contract-terminal.png') + '\n',
    ],
    [
      '**（3）杠杆调整弹窗**',
      '\n\n' + screenshotLine('Web · 杠杆调整弹窗', W, 'web-contract-modal-leverage.png') + '\n',
    ],
    [
      '点击仓位模式按钮（显示当前模式，如“全仓”），弹出保证金模式选择弹窗。',
      '\n\n' + screenshotLine('Web · 保证金模式弹窗', W, 'web-contract-modal-margin.png') + '\n',
    ],
    [
      '### **5\\.8\\.5 各订单类型确认弹窗字段说明**',
      '\n\n' +
        screenshotLine('Web · 下单确认弹窗', W, 'web-contract-modal-order-confirm.png') +
        '\n\n' +
        screenshotLine('Web · 止盈止损确认弹窗', W, 'web-contract-modal-tpsl-confirm.png') +
        '\n',
    ],
    [
      '## 5\\.9 充币弹窗',
      '\n\n' + screenshotLine('Web · 持仓止盈止损设置弹窗', W, 'web-contract-modal-tpsl.png') + '\n',
    ],
    [
      '# **6\\.** **持仓/委托/流水管理区域**',
      '\n\n' +
        screenshotLine('Web · 持仓/委托数据区', W, 'web-contract-positions.png') +
        '\n\n' +
        screenshotLine('Web · 一键平仓确认弹窗', W, 'web-contract-modal-close-all.png') +
        '\n',
    ],
  ];
  for (const [anchor, block] of blocks) s = insertAfter(s, anchor, block);
  return s;
}

function patchApp(s) {
  const intro =
    '\n\n' +
    prototypeLine('perp_dex/app/合约交易.html') +
    '\n\n' +
    prototypeLine('perp_dex/app/合约偏好设置.html') +
    '\n';
  s = insertAfter(s, '# APP 端合约交易页', intro);

  const blocks = [
    [
      '## 1\\.2 交易对与涨跌幅',
      '\n\n' + screenshotLine('App · 顶部导航栏', A, 'app-contract-header.png') + '\n',
    ],
    [
      '## 2\\.1 功能概述',
      '\n\n' + screenshotLine('App · 盘口深度区', A, 'app-contract-trade-area.png') + '\n',
    ],
    [
      '## 2\\.2 资金费率 / 倒计时',
      '\n\n' + screenshotLine('App · 资金费率说明弹层', A, 'app-contract-sheet-funding.png') + '\n',
    ],
    [
      '## 2\\.7 盘口精度切换',
      '\n\n' + screenshotLine('App · 盘口精度弹层', A, 'app-contract-sheet-precision.png') + '\n',
    ],
    [
      '## 3\\.2 仓位模式与杠杆',
      '\n\n' +
        screenshotLine('App · 杠杆调整弹层', A, 'app-contract-sheet-leverage.png') +
        '\n\n' +
        screenshotLine('App · 保证金模式弹层', A, 'app-contract-sheet-margin.png') +
        '\n',
    ],
    [
      '## 3\\.4 订单类型选择',
      '\n\n' + screenshotLine('App · 订单类型弹层', A, 'app-contract-sheet-order-type.png') + '\n',
    ],
    [
      '## 3\\.6 最优价功能（仅限价单）',
      '\n\n' + screenshotLine('App · 最优价弹层', A, 'app-contract-sheet-best-price.png') + '\n',
    ],
    [
      '### 3\\.8\\.2 确认弹窗字段',
      '\n\n' + screenshotLine('App · 下单确认弹窗', A, 'app-contract-modal-order-confirm.png') + '\n',
    ],
    [
      '## 4\\.2 当前持仓',
      '\n\n' +
        screenshotLine('App · 当前持仓卡片', A, 'app-contract-positions.png') +
        '\n\n' +
        screenshotLine('App · 已实现盈亏拆解弹层', A, 'app-contract-sheet-realized-pnl.png') +
        '\n',
    ],
    [
      '### 4\\.2\\.3 持仓止盈止损设置弹层',
      '\n\n' +
        screenshotLine('App · 持仓止盈止损设置弹层', A, 'app-contract-sheet-position-tpsl.png') +
        '\n\n' +
        screenshotLine('App · 持仓止盈止损确认弹窗', A, 'app-contract-modal-tpsl-confirm.png') +
        '\n',
    ],
    [
      '### 4\\.2\\.4 持仓平仓设置弹层',
      '\n\n' + screenshotLine('App · 持仓平仓设置弹层', A, 'app-contract-sheet-close-position.png') + '\n',
    ],
    [
      '## 6\\.2 选择合约弹层（交易对切换）',
      '\n\n' + screenshotLine('App · 选择合约弹层', A, 'app-contract-sheet-pair.png') + '\n',
    ],
    [
      '## 6\\.9 更多功能弹层',
      '\n\n' + screenshotLine('App · 更多功能弹层', A, 'app-contract-sheet-more-menu.png') + '\n',
    ],
    [
      '## 6\\.13 一键平仓确认居中弹窗',
      '\n\n' + screenshotLine('App · 一键平仓确认弹窗', A, 'app-contract-modal-close-all.png') + '\n',
    ],
  ];
  for (const [anchor, block] of blocks) s = insertAfter(s, anchor, block);
  return s;
}

const webPath = path.join(ROOT, 'document/web&后台/合约交易页.md');
const appPath = path.join(ROOT, 'document/app/APP 端合约交易页.md');

fs.writeFileSync(webPath, patchWeb(fs.readFileSync(webPath, 'utf8')));
fs.writeFileSync(appPath, patchApp(fs.readFileSync(appPath, 'utf8')));
console.log('Injected contract doc screenshots');
