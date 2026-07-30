import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BASE = 'https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets';

const labels = {
  积分: {
    'admin-config-newbie-tasks.png': '后台 · 新人任务规则（只读）',
    'admin-config-level-bonus.png': '后台 · 个人等级加成系数表',
    'admin-config-dimensions.png': '后台 · 六维度子池分配',
    'admin-config-pool.png': '后台 · 每周积分总池配置',
    'admin-bonus-config.png': '后台 · 积分加成配置',
    'admin-users-list.png': '后台 · 用户积分列表',
    'admin-user-detail.png': '后台 · 用户积分流水详情',
    'admin-manual-grant.png': '后台 · 手动发放积分',
    'admin-approval-list.png': '后台 · 积分审核列表',
    'admin-approval-detail.png': '后台 · 审批详情',
    'admin-operation-logs.png': '后台 · 操作记录',
    'web-points-dashboard.png': 'Web · 积分看板',
    'web-multiplier-rules-modal.png': 'Web · 加成倍率阶梯弹窗',
    'web-points-detail-modal.png': 'Web · 积分发放明细弹窗',
    'web-points-tasks.png': 'Web · 积分获取体系',
    'web-points-faq.png': 'Web · 常见问题',
    'app-points-dashboard.png': 'App · 核心积分看板',
    'app-multiplier-rules-modal.png': 'App · 加成规则弹窗',
    'app-points-tasks.png': 'App · 积分获取体系',
    'app-points-faq.png': 'App · 常见问题',
    'app-points-history.png': 'App · 积分发放明细页',
  },
  费率: {
    'app-vip-info-card.png': 'App · 当前 VIP 信息卡',
    'app-vip-fee-table.png': 'App · VIP 费率等级表',
    'app-vip-faq.png': 'App · 常见问题',
    'web-vip-card.png': 'Web · VIP 权益卡片',
    'web-vip-modal.png': 'Web · VIP 费率弹窗',
    'admin-fee-settings-list.png': '后台 · 用户费率设置列表',
    'admin-fee-config-drawer.png': '后台 · 配置费率抽屉',
    'admin-fee-approval-list.png': '后台 · 费率审批列表',
    'admin-fee-approval-detail.png': '后台 · 费率审批详情',
    'admin-fee-operation-logs.png': '后台 · 费率操作记录',
  },
};

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatFile(relPath, folder) {
  const p = path.join(ROOT, relPath);
  let s = fs.readFileSync(p, 'utf8');
  const map = labels[folder];
  const prefix = escapeRegExp(`页面截图：${BASE}/${folder}/`);
  s = s.replace(
    new RegExp(`^(\\s*)${prefix}([a-z0-9-]+\\.png)$`, 'gm'),
    (_, indent, file) => {
      const label = map[file] || file.replace('.png', '');
      return `${indent}页面截图：[${label}](${BASE}/${folder}/${file})`;
    },
  );
  fs.writeFileSync(p, s);
  const count = (s.match(new RegExp(`^\\s*页面截图：\\[`, 'gm')) || []).length;
  console.log(relPath, count);
}

formatFile('document/web&后台/积分（后台_Web_APP）.md', '积分');
formatFile('document/web&后台/费率.md', '费率');
