import fs from 'fs';
import path from 'path';
import { PROTO_BASE } from './doc-screenshot-constants.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function boldScreenshotLinks(s) {
  return s.replace(/页面截图：\[([^\]]+)\]\(/g, (full, label) => {
    const stripped = label.replace(/\*\*/g, '');
    if (label.includes('**')) return full;
    return `页面截图：[**${stripped}**](`;
  });
}

function formatPrototypeRefs(s) {
  const keys = ['原型', '原型主文件', '原型参考', '原型链接'];
  for (const key of keys) {
    s = s.replace(
      new RegExp(`\\*\\*${key}\\*\\*：` + '`([^`]+)`', 'g'),
      (_, p) => {
        const url = PROTO_BASE + p.replace(/^\//, '');
        return `**${key}**：[${url}](${url})`;
      },
    );
    s = s.replace(
      new RegExp(`\\*\\*${key}\\*\\*：\\s*(${escapeRegExp(PROTO_BASE)}[^\\s\\n]+)`, 'g'),
      (_, url) => `**${key}**：[${url}](${url})`,
    );
    s = s.replace(
      new RegExp(
        `- \\*\\*${key}\\*\\*：\\s*https?:\\/\\/[^\\s\\n]+`,
        'g',
      ),
      (line) => {
        const url = line.replace(/^- \*\*[^*]+\*\*：\s*/, '').replace(/\\/g, '');
        return `- **${key}**：[${url}](${url})`;
      },
    );
  }
  // Lark 转义 URL
  s = s.replace(
    /https?:\\\/\\\/dashuaibizzy\\\.github\\\.io\\\/prototype\\\/([^\s\n]+)/g,
    (_, rest) => {
      const url = PROTO_BASE + rest.replace(/\\/g, '');
      return `[${url}](${url})`;
    },
  );
  s = s.replace(
    /\*\*原型\*\*：`([^`]+)`\s*→\s*/g,
    (_, p) => {
      const url = PROTO_BASE + p.replace(/^\//, '');
      return `**原型**：[${url}](${url}) → `;
    },
  );
  return s;
}

function formatFeeOverviewTable(s) {
  return s.replace(
    /`https:\/\/dashuaibizzy\.github\.io\/prototype\/([^`]+)`/g,
    (_, p) => {
      const url = PROTO_BASE + p;
      return `[${url}](${url})`;
    },
  );
}

function updateDocIntro(s, captureScript) {
  const intro =
    '> 文档配图存放在 Git 分支 **doc-assets**，正文以「页面截图：[**链接文案**](GitHub raw URL)」与「**原型**：[完整 URL](完整 URL)」引用；勿用 ![]() 图片语法。更新配图：node scripts/' +
    captureScript +
    ' → node scripts/push-doc-assets.mjs。';
  if (s.startsWith('#')) {
    const lines = s.split('\n');
    const first = lines[0];
    let i = 1;
    if (lines[1] === '') i = 2;
    if (lines[i]?.startsWith('> 文档配图')) {
      lines[i] = intro;
      return lines.join('\n');
    }
    return [first, '', intro, ...lines.slice(1)].join('\n');
  }
  return s;
}

function processFile(relPath, opts = {}) {
  const p = path.join(ROOT, relPath);
  let s = fs.readFileSync(p, 'utf8');
  s = formatPrototypeRefs(s);
  s = formatFeeOverviewTable(s);
  s = boldScreenshotLinks(s);
  if (opts.captureScript) s = updateDocIntro(s, opts.captureScript);
  fs.writeFileSync(p, s);
  console.log('OK', relPath);
}

processFile('document/web&后台/积分（后台_Web_APP）.md', {
  captureScript: 'capture-points-doc-screenshots.mjs',
});
processFile('document/web&后台/费率.md', {
  captureScript: 'capture-fee-doc-screenshots.mjs',
});
processFile('document/web&后台/合约交易页.md', {
  captureScript: 'capture-web-contract-doc-screenshots.mjs',
});
processFile('document/app/APP 端合约交易页.md', {
  captureScript: 'capture-app-contract-doc-screenshots.mjs',
});
