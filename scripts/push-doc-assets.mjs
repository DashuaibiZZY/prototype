/**
 * 将 document/assets 下的配图提交并推送到 doc-assets 分支（不影响 main）。
 * 用法：node scripts/push-doc-assets.mjs
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const ROOT = path.resolve(import.meta.dirname, '..');
const ASSETS = path.join(ROOT, 'document/assets');

function sh(cmd) {
  console.log(cmd);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

function collectImages(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) collectImages(p, acc);
    else if (/\.(png|jpg|jpeg|webp)$/i.test(name)) acc.push(p);
  }
  return acc;
}

const images = collectImages(ASSETS);
if (!images.length) {
  console.error('未找到配图。请先运行 capture 脚本生成 PNG。');
  process.exit(1);
}

console.log(`找到 ${images.length} 张配图，准备推送到 doc-assets 分支…`);

const workBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
const tmpAssets = path.join(os.tmpdir(), 'doc-assets-push-' + Date.now());

fs.cpSync(ASSETS, tmpAssets, { recursive: true });

sh('git fetch origin doc-assets 2>/dev/null || true');

const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
let stashed = false;
if (status) {
  sh('git stash push -u -m "doc-assets-temp-all"');
  stashed = true;
}

try {
  sh('git checkout doc-assets');
} catch {
  sh('git checkout -B doc-assets origin/doc-assets');
}

fs.cpSync(tmpAssets, ASSETS, { recursive: true });
fs.rmSync(tmpAssets, { recursive: true, force: true });

sh('git add document/assets');
sh('git commit -m "chore(doc-assets): 更新需求文档配图" || true');
sh('git push -u origin doc-assets');

if (workBranch !== 'doc-assets') {
  sh(`git checkout ${workBranch}`);
}

if (stashed) {
  sh('git stash pop');
}

console.log('完成。配图已推送到 origin/doc-assets');
